export function GET() {
  return new Response(
    `window.__SITE_OWNER_VERIFICATION__ = {
  provider: "Redirect Verification Lab",
  siteId: document.currentScript?.dataset.siteId ?? null,
  loadedAt: new Date().toISOString()
};
console.info("[Verification Lab] Provider script loaded", window.__SITE_OWNER_VERIFICATION__);`,
    {
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );
}
