import assert from "node:assert/strict";
import test from "node:test";

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

test("root starts a deterministic three-redirect chain", async () => {
  const worker = await loadWorker();
  let url = "http://localhost/";
  const statuses = [];

  for (let index = 0; index < 4; index += 1) {
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
      assert.match(
        html,
        /<head>[\s\S]*<script async src="https:\/\/cdn\.coad\.be3pi\.com\/js\/cox-site\.js" co-pub="PUB02E2503AE" co-st="SIT0C0EB3F27" crossorigin="anonymous"><\/script>[\s\S]*<\/head>/,
      );
      break;
    }
    url = response.headers.get("location");
    assert.ok(url);
  }

  assert.deepEqual(statuses, [302, 302, 302, 200]);
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
  assert.match(head, /src="https:\/\/cdn\.coad\.be3pi\.com\/js\/cox-site\.js"/);
  assert.match(head, /co-pub="PUB02E2503AE"/);
  assert.match(head, /co-st="SIT0C0EB3F27"/);
  assert.doesNotMatch(body, /cdn\.coad\.be3pi\.com\/js\/cox-site\.js/);
});
