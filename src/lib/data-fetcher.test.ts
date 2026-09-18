// @vitest-environment node
import { readFileSync } from "node:fs";
import * as path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { expect, it } from "vitest";

it("fails the refresh without replacing characters when one detail remains unavailable", async () => {
  const writes: string[] = [];
  const requests: string[] = [];
  const source = readFileSync("scripts/fetch-data.ts", "utf8").replaceAll("import.meta.url", JSON.stringify("file:///tmp/archive/scripts/fetch-data.ts"));
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  let finish!: (code: number) => void;
  const done = new Promise<number>((resolve) => { finish = resolve; });
  vm.runInNewContext(js, {
    exports: {}, URL,
    require: (name: string) => name === "fs"
      ? { writeFileSync: (file: string) => writes.push(file), mkdirSync: () => {} }
      : name === "path" ? path : { API_BASE: "https://mock.test", UPSTREAM_USER_AGENT: "test" },
    process: { exit: finish },
    console: { log: (s: string) => { if (s.includes("Done")) finish(0); }, warn: () => {}, error: () => {} },
    setTimeout: (fn: () => void) => { fn(); return 0; },
    fetch: async (url: string) => {
      requests.push(url);
      if (url.endsWith("/character/all")) return { ok: true, json: async () => ({ resCd: "0000", result: { list: [1, 2, 3, 4, 5, 6].map(id => ({ id })) } }) };
      if (/\/character\/[1-5]$/.test(url)) return { ok: true, json: async () => ({ resCd: "0000", result: { info: { id: Number(url.split("/").pop()) } } }) };
      return { ok: false, status: 503, statusText: "unavailable" };
    },
  });
  expect(await done).toBe(1);
  expect(writes).toEqual([]);
  expect(requests.filter(url => url.endsWith("/character/6"))).toHaveLength(3);
});
