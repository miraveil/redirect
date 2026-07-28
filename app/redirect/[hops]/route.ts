const SUPPORTED_STATUSES = new Set([301, 302, 303, 307, 308]);
const TARGETS = new Set(["valid", "missing", "body", "wrong", "error"]);

export async function GET(
  request: Request,
  context: { params: Promise<{ hops: string }> },
) {
  const { hops: rawHops } = await context.params;
  const url = new URL(request.url);
  const hops = Math.max(1, Math.min(50, Number.parseInt(rawHops, 10) || 1));
  const requestedStatus = Number.parseInt(url.searchParams.get("status") ?? "302", 10);
  const status = SUPPORTED_STATUSES.has(requestedStatus) ? requestedStatus : 302;
  const delay = Math.max(0, Math.min(5000, Number.parseInt(url.searchParams.get("delay") ?? "0", 10) || 0));
  const requestedTarget = url.searchParams.get("target") ?? "valid";
  const target = TARGETS.has(requestedTarget) ? requestedTarget : "valid";

  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  const destination =
    hops > 1
      ? new URL(`/redirect/${hops - 1}?status=${status}&delay=${delay}&target=${target}`, url.origin)
      : new URL(`/result/${target}`, url.origin);

  return new Response(null, {
    status,
    headers: {
      Location: destination.toString(),
      "Cache-Control": "no-store",
      "X-Redirect-Hops-Remaining": String(hops),
    },
  });
}
