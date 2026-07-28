const style = `
  body{margin:0;background:#f4f7fb;color:#17243a;font-family:Arial,sans-serif;display:grid;min-height:100vh;place-items:center}
  main{width:min(620px,calc(100% - 40px));background:#fff;border:1px solid #dce4ed;border-radius:20px;padding:34px;box-shadow:0 20px 50px rgba(31,55,88,.10)}
  .badge{display:inline-block;color:#08734e;background:#e9f8f2;border-radius:999px;padding:7px 10px;font-size:12px;font-weight:800}
  h1{font-size:34px;margin:18px 0 10px;letter-spacing:-.03em}p{color:#637187;line-height:1.6}code{display:block;background:#f0f4f8;padding:12px;border-radius:9px;overflow:auto;color:#174b91}
  a{display:inline-block;margin-top:20px;color:#1668e3;font-weight:700;text-decoration:none}
`;

function page(kind: string) {
  const validScript =
    '<script src="/provider/site-verification.js" data-site-id="qa-redirect-site"></script>';
  const wrongScript =
    '<script src="/provider/site-verification.js" data-site-id="wrong-site-id"></script>';

  const content: Record<string, { title: string; note: string; head: string; body: string }> = {
    valid: {
      title: "Valid verification destination",
      note: "The expected provider script is present inside this page’s <head>.",
      head: validScript,
      body: "",
    },
    missing: {
      title: "Verification script missing",
      note: "This final page intentionally contains no provider script.",
      head: "",
      body: "",
    },
    body: {
      title: "Script is outside <head>",
      note: "The provider script is intentionally placed inside <body>.",
      head: "",
      body: validScript,
    },
    wrong: {
      title: "Wrong Site ID",
      note: "The script exists, but its data-site-id does not match qa-redirect-site.",
      head: wrongScript,
      body: "",
    },
  };

  const item = content[kind] ?? content.missing;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${item.title}</title>
  <style>${style}</style>
  ${item.head}
</head>
<body>
  ${item.body}
  <main>
    <span class="badge">FINAL RESPONSE · HTTP 200</span>
    <h1>${item.title}</h1>
    <p>${item.note}</p>
    <code>Expected Site ID: qa-redirect-site</code>
    <a href="/">← Back to Redirect Verification Lab</a>
  </main>
</body>
</html>`;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ kind: string }> },
) {
  const { kind } = await context.params;

  if (kind === "error") {
    return Response.json(
      { error: "Intentional test failure", status: 500 },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }

  return new Response(page(kind), {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Verification-Test-Result": kind,
    },
  });
}
