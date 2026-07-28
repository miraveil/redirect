import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const testConfig = JSON.parse(
  await readFile(new URL("../app/test-config.json", import.meta.url), "utf8"),
);

async function loadWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker;
}

const env = {
  ASSETS: {
    fetch: async () => new Response("Not found", { status: 404 }),
  },
};

const context = {
  waitUntil() {},
  passThroughOnException() {},
};

test("root follows the redirect count from test config", async () => {
  const worker = await loadWorker();
  let url = "http://localhost/";
  const statuses = [];

  for (let index = 0; index <= testConfig.rootRedirectCount; index += 1) {
    const response = await worker.fetch(
      new Request(url, {
        redirect: "manual",
        headers: { accept: "text/html" },
      }),
      env,
      context,
    );
    statuses.push(response.status);
    if (response.status === 200) {
      const html = await response.text();
      const head = html.match(/<head>([\s\S]*?)<\/head>/i)?.[1] ?? "";
      assert.ok(head.includes(testConfig.verificationScriptHtml));
      break;
    }
    url = response.headers.get("location");
    assert.ok(url);
  }

  assert.deepEqual(statuses, [
    ...Array(testConfig.rootRedirectCount).fill(302),
    200,
  ]);
  assert.equal(url, "http://localhost/result/valid");
});

test("valid destination returns the COAD script inside head", async () => {
  const worker = await loadWorker();
  const response = await worker.fetch(
    new Request("http://localhost/result/valid", {
      headers: { accept: "text/html" },
    }),
    env,
    context,
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  const head = html.match(/<head>([\s\S]*?)<\/head>/i)?.[1] ?? "";
  const body = html.match(/<body>([\s\S]*?)<\/body>/i)?.[1] ?? "";
  assert.ok(head.includes(testConfig.verificationScriptHtml));
  assert.ok(!body.includes(testConfig.verificationScriptHtml));
});
