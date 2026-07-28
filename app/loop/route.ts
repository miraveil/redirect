export function GET(request: Request) {
  const url = new URL(request.url);
  const step = url.searchParams.get("step") === "b" ? "b" : "a";
  const next = step === "a" ? "b" : "a";

  return new Response(null, {
    status: 302,
    headers: {
      Location: new URL(`/loop?step=${next}`, url.origin).toString(),
      "Cache-Control": "no-store",
      "X-Redirect-Loop-Step": step.toUpperCase(),
    },
  });
}
