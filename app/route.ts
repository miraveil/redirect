import { ROOT_REDIRECT_COUNT } from "./test-config";

export function GET(request: Request) {
  const url = new URL(request.url);
  const destinationPath =
    ROOT_REDIRECT_COUNT === 1
      ? "/result/valid"
      : `/redirect/${ROOT_REDIRECT_COUNT - 1}?status=302&delay=0&target=valid`;
  const destination = new URL(destinationPath, url.origin);

  return new Response(null, {
    status: 302,
    headers: {
      Location: destination.toString(),
      "Cache-Control": "no-store",
      "X-Redirect-Test": "site-owner-entry",
    },
  });
}
