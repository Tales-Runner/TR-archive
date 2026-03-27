const BASE = "https://tr.rhaon.co.kr/webb";

interface Endpoint {
  name: string;
  path: string;
  /** Validate that the response shape is what we expect */
  validate: (result: unknown) => string | null;
}

function hasListArray(obj: unknown): obj is { list: unknown[] } {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "list" in obj &&
    Array.isArray((obj as { list: unknown }).list)
  );
}

const ENDPOINTS: Endpoint[] = [
  {
    name: "Map Types",
    path: "/trlibrary/map/type",
    validate: (r) => {
      if (!hasListArray(r)) return "missing list array";
      if (r.list.length === 0) return "list is empty";
      const first = r.list[0] as Record<string, unknown>;
      if (typeof first.codeId !== "number") return "missing codeId in first item";
      if (typeof first.codeName !== "string") return "missing codeName in first item";
      return null;
    },
  },
  {
    name: "Map List",
    path: "/trlibrary/map/list",
    validate: (r) => {
      if (!hasListArray(r)) return "missing list array";
      if (r.list.length === 0) return "list is empty";
      const year = r.list[0] as Record<string, unknown>;
      if (typeof year.openYear !== "string") return "missing openYear";
      if (!Array.isArray(year.itemList)) return "missing itemList array";
      return null;
    },
  },
  {
    name: "Costume List",
    path: "/trlibrary/closet/list",
    validate: (r) => {
      if (!hasListArray(r)) return "missing list array";
      if (r.list.length === 0) return "list is empty";
      const year = r.list[0] as Record<string, unknown>;
      if (typeof year.openYear !== "string") return "missing openYear";
      if (!Array.isArray(year.itemList)) return "missing itemList array";
      return null;
    },
  },
  {
    name: "Guide List",
    path: "/trlibrary/guide?search-word=",
    validate: (r) => {
      if (!hasListArray(r)) return "missing list array";
      if (r.list.length === 0) return "list is empty";
      const first = r.list[0] as Record<string, unknown>;
      if (typeof first.id !== "number") return "missing id in first item";
      if (typeof first.subject !== "string") return "missing subject in first item";
      return null;
    },
  },
  {
    name: "Story List",
    path: "/trlibrary/trstory/list",
    validate: (r) => {
      if (!hasListArray(r)) return "missing list array";
      if (r.list.length === 0) return "list is empty";
      const year = r.list[0] as Record<string, unknown>;
      if (typeof year.openYear !== "string") return "missing openYear";
      if (!Array.isArray(year.itemList)) return "missing itemList array";
      return null;
    },
  },
];

interface CheckResult {
  name: string;
  ok: boolean;
  error?: string;
  httpStatus?: number;
}

async function checkEndpoint(ep: Endpoint): Promise<CheckResult> {
  const url = `${BASE}${ep.path}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) {
      return { name: ep.name, ok: false, error: `HTTP ${res.status} ${res.statusText}`, httpStatus: res.status };
    }

    const json = await res.json();

    if (json.resCd !== "0000") {
      return { name: ep.name, ok: false, error: `API error: resCd=${json.resCd} rspMsg=${json.rspMsg}` };
    }

    const schemaError = ep.validate(json.result);
    if (schemaError) {
      return { name: ep.name, ok: false, error: `Schema mismatch: ${schemaError}` };
    }

    return { name: ep.name, ok: true, httpStatus: res.status };
  } catch (err) {
    return { name: ep.name, ok: false, error: `Fetch error: ${err instanceof Error ? err.message : String(err)}` };
  }
}

async function main() {
  console.log("API Health Check\n");

  const results: CheckResult[] = [];
  for (const ep of ENDPOINTS) {
    console.log(`  Checking ${ep.name} ...`);
    const result = await checkEndpoint(ep);
    results.push(result);
    console.log(`  ${result.ok ? "OK" : "FAIL"}: ${ep.name}${result.error ? ` — ${result.error}` : ""}`);
  }

  const failures = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failures.length}/${results.length} endpoints healthy`);

  if (failures.length > 0) {
    console.log("\n--- FAILURES ---");
    for (const f of failures) {
      console.log(`  ${f.name}: ${f.error}`);
    }

    // Write summary for GitHub Actions
    const summary = failures.map((f) => `- **${f.name}**: ${f.error}`).join("\n");
    const output = `HEALTH_FAILURES<<EOF\n${summary}\nEOF`;
    if (process.env.GITHUB_OUTPUT) {
      const { appendFileSync } = await import("fs");
      appendFileSync(process.env.GITHUB_OUTPUT, output + "\n");
    }

    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
