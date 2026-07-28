export function GET(request: Request) {
  const url = new URL(request.url);
  const destination = new URL(
    "/redirect/2?status=302&delay=0&target=valid",
    url.origin,
  );

  return new Response(null, {
    status: 302,
    headers: {
      Location: destination.toString(),
      "Cache-Control": "no-store",
      "X-Redirect-Test": "site-owner-entry",
    },
  });
}
