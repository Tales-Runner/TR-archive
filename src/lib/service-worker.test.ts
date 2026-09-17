// @vitest-environment node
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { describe, expect, it, vi } from "vitest";

function worker() {
  const handlers: Record<string, (event: unknown) => void> = {};
  const stores = new Map<string, Map<string, Response>>();
  const caches = {
    open: async (name: string) => {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name)!;
      return {
        add: async (url: string) => { store.set(url, new Response("offline home")); },
        match: async (request: string | Request) => store.get(typeof request === "string" ? request : request.url),
        put: async (request: Request, response: Response) => { store.set(request.url, response); },
      };
    },
    keys: async () => [...stores.keys()],
    delete: async (name: string) => stores.delete(name),
  };
  vm.runInNewContext(readFileSync("public/sw.js", "utf8"), {
    self: {
      addEventListener: (type: string, handler: (event: unknown) => void) => { handlers[type] = handler; },
      skipWaiting: vi.fn(), clients: { claim: vi.fn() }, location: { origin: "https://archive.test" },
    },
    caches, URL, Response,
    fetch: async () => { throw new TypeError("offline"); },
  });
  return { handlers, caches, stores };
}

async function install(handlers: ReturnType<typeof worker>["handlers"]) {
  let done!: Promise<void>;
  handlers.install({ waitUntil: (p: Promise<void>) => { done = p; } });
  await done;
}

function request(handlers: ReturnType<typeof worker>["handlers"], mode: string) {
  let response!: Promise<Response>;
  handlers.fetch({ request: { method: "GET", url: "https://archive.test/uncached", mode }, respondWith: (p: Promise<Response>) => { response = p; } });
  return response;
}

describe("service worker offline boundary", () => {
  it("uses the preloaded home page for an uncached document navigation", async () => {
    const { handlers } = worker();
    await install(handlers);
    expect(await (await request(handlers, "navigate")).text()).toBe("offline home");
  });
  it("does not serve HTML as a missing data response", async () => {
    const { handlers } = worker();
    await install(handlers);
    expect((await request(handlers, "cors")).type).toBe("error");
  });
  it("only removes obsolete caches owned by this app", async () => {
    const { handlers, caches, stores } = worker();
    await caches.open("other-app-cache");
    await caches.open("tr-archive-runtime-v0");
    await install(handlers);
    let done!: Promise<void>;
    handlers.activate({ waitUntil: (p: Promise<void>) => { done = p; } });
    await done;
    expect(stores.has("other-app-cache")).toBe(true);
    expect(stores.has("tr-archive-runtime-v0")).toBe(false);
    expect([...stores.keys()].some((key) => key.startsWith("tr-archive-static-"))).toBe(true);
  });
});
