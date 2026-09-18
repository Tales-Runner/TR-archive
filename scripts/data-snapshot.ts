import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export const DATA_FILES = ["characters", "map-types", "maps", "costumes", "guides", "stories", "probability-meta"] as const;
export type Snapshot = Map<string, unknown>;
type Row = Record<string, unknown>;
const dataPath = (name: string) => `src/data/${name}.json`;
const probabilityPath = (id: string) => `public/data/probability/${id}.json`;

function rows(value: unknown, label: string, minimum = 1): Row[] {
  if (!Array.isArray(value) || value.length < minimum || value.some(v => !v || typeof v !== "object" || Array.isArray(v))) {
    throw new Error(`${label}: expected at least ${minimum} records`);
  }
  return value;
}

function strings(row: Row, keys: string[], label: string) {
  for (const key of keys) {
    if (typeof row[key] !== "string") throw new Error(`${label}.${key}: expected string`);
  }
}

function unique(records: Row[], key: string, label: string, numeric = true) {
  const seen = new Set();
  for (const row of records) {
    const id = row[key];
    if (numeric ? !Number.isSafeInteger(id) : typeof id !== "string" || !/^[a-z]+(?:-[a-z]+)*$/.test(id)) {
      throw new Error(`${label}.${key}: invalid identifier`);
    }
    if (seen.has(id)) throw new Error(`${label}: duplicate ${key} ${id}`);
    seen.add(id);
  }
}

/** Validate the complete candidate before any tracked file can be replaced. */
export function validateSnapshot(snapshot: Snapshot, baseline?: Snapshot) {
  const expected = new Set<string>(DATA_FILES.map(dataPath));
  for (const name of DATA_FILES) {
    const file = dataPath(name);
    const records = rows(snapshot.get(file), file, name === "map-types" ? 1 : 5);
    unique(records, name === "map-types" ? "codeId" : "id", file, name !== "probability-meta");
    const old = baseline?.get(file);
    if (Array.isArray(old) && records.length < old.length * 0.8) {
      throw new Error(`${file}: record count dropped more than 20% (${old.length} → ${records.length})`);
    }
    for (const row of records) {
      const label = `${file}[${row.id ?? row.codeId}]`;
      if (name === "characters") {
        strings(row, [
          "characterNm", "catchPhrase", "mainImageUrl", "squareImageUrl", "circularImageUrl", "comments",
          "uniqueAbility", "ageInfo", "height", "weight", "mbti", "bloodType", "job", "birthDayInfo",
          "revivalMotion", "hurdleMotion", "landingMotion", "angryMotion", "swimmingMotion",
          "beehiveMotion", "electricShockMotion", "stunMotion",
        ], label);
        for (const key of ["maximumSpeed", "power", "control", "acceleration"]) {
          if (typeof row[key] !== "number" || !Number.isFinite(row[key])) throw new Error(`${label}.${key}: expected finite number`);
        }
        if (typeof row.isView !== "boolean") throw new Error(`${label}.isView: expected boolean`);
      } else if (name === "map-types") {
        strings(row, ["codeName"], label);
      } else if (name === "probability-meta") {
        strings(row, ["name", "comments"], label);
        const file = probabilityPath(row.id as string);
        expected.add(file);
        const items = rows(snapshot.get(file), file);
        if (row.itemCount !== items.length) throw new Error(`${file}: itemCount mismatch`);
        for (const item of items) {
          strings(item, ["itemNm"], file);
          for (const result of rows(item.itemList, `${file}.itemList`)) {
            strings(result, ["sourceNm", "targetNm"], file);
            if (typeof result.probability !== "number" || !Number.isFinite(result.probability) || result.probability < 0 || result.probability > 100) {
              throw new Error(`${file}: probability must be between 0 and 100`);
            }
          }
        }
      } else {
        strings(row, ["subject", "hashTagSubject"], label);
        if (name !== "guides") strings(row, ["openDt", "thumbnail"], label);
        if (name === "maps" && !Array.isArray(row.recommendDataList)) throw new Error(`${label}: missing recommendations`);
        if (name === "costumes") {
          const detail = rows([row.detail], `${label}.detail`)[0];
          strings(detail, ["subject", "backgroundImageUrl", "titleImageUrl"], label);
          rows(detail.itemList, `${label}.itemList`, 0);
        }
        if (name === "guides") {
          for (const part of rows(row.partList, `${label}.partList`, 0)) {
            strings(part, ["subject", "contents"], label);
            for (const chapter of rows(part.chapterList, `${label}.chapterList`, 0)) strings(chapter, ["subject", "contents"], label);
          }
        }
        if (name === "stories") {
          strings(row, ["openYear"], label);
          rows(row.images, `${label}.images`, 0);
        }
      }
    }
  }
  const previousCategories = baseline?.get(dataPath("probability-meta"));
  const nextCategories = rows(snapshot.get(dataPath("probability-meta")), "probability-meta");
  if (Array.isArray(previousCategories) && previousCategories.some(old => !nextCategories.some(row => row.id === old.id))) {
    throw new Error("probability-meta: an existing category disappeared; review upstream before publishing");
  }
  for (const file of snapshot.keys()) {
    if (!expected.has(file)) throw new Error(`Unexpected snapshot file: ${file}`);
  }
}

export function readSnapshot(root: string): Snapshot {
  const snapshot: Snapshot = new Map();
  const read = (file: string) => snapshot.set(file, JSON.parse(readFileSync(join(root, file), "utf8")));
  DATA_FILES.forEach(name => read(dataPath(name)));
  const meta = rows(snapshot.get(dataPath("probability-meta")), "probability-meta");
  unique(meta, "id", "probability-meta", false);
  meta.forEach(row => read(probabilityPath(row.id as string)));
  return snapshot;
}

export function writeSnapshot(root: string, snapshot: Snapshot) {
  validateSnapshot(snapshot);
  // A reused directory could mix two runs. Require a fresh candidate directory.
  if (existsSync(root)) throw new Error(`Snapshot directory already exists: ${root}`);
  for (const [file, data] of snapshot) {
    const target = join(root, file);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, JSON.stringify(data, null, 2), "utf8");
  }
}

/** Stage all writes first, then rename; restore original bytes on an I/O error. */
export function applySnapshot(root: string, snapshot: Snapshot) {
  validateSnapshot(snapshot, readSnapshot(root));
  const originals = new Map<string, Buffer | undefined>();
  const replaced: string[] = [];
  const suffix = `.refresh-${process.pid}.tmp`;
  try {
    for (const [file, data] of snapshot) {
      const target = join(root, file);
      originals.set(target, existsSync(target) ? readFileSync(target) : undefined);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target + suffix, JSON.stringify(data, null, 2), "utf8");
    }
    for (const target of originals.keys()) {
      renameSync(target + suffix, target);
      replaced.push(target);
    }
  } catch (error) {
    for (const target of replaced.reverse()) {
      const original = originals.get(target);
      if (original) writeFileSync(target, original);
      else rmSync(target, { force: true });
    }
    throw error;
  } finally {
    for (const target of originals.keys()) rmSync(target + suffix, { force: true });
  }
}
