import rawConfig from "./test-config.json";

const MIN_REDIRECT_COUNT = 1;
const MAX_REDIRECT_COUNT = 50;

function readScriptAttribute(name: string) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = rawConfig.verificationScriptHtml.match(
    new RegExp(`\\b${escapedName}\\s*=\\s*(['"])(.*?)\\1`, "i"),
  );
  return match?.[2] ?? null;
}

if (
  !Number.isInteger(rawConfig.rootRedirectCount) ||
  rawConfig.rootRedirectCount < MIN_REDIRECT_COUNT ||
  rawConfig.rootRedirectCount > MAX_REDIRECT_COUNT
) {
  throw new Error(
    `rootRedirectCount must be an integer from ${MIN_REDIRECT_COUNT} to ${MAX_REDIRECT_COUNT}.`,
  );
}

if (
  !rawConfig.verificationScriptHtml.trim().startsWith("<script") ||
  !rawConfig.verificationScriptHtml.trim().endsWith("</script>")
) {
  throw new Error(
    "verificationScriptHtml must contain one complete <script ...></script> tag.",
  );
}

export const ROOT_REDIRECT_COUNT = rawConfig.rootRedirectCount;
export const VERIFICATION_SCRIPT_HTML = rawConfig.verificationScriptHtml.trim();
export const VERIFICATION_PUBLISHER_ID =
  readScriptAttribute("co-pub") ?? "Not configured";
export const VERIFICATION_SITE_ID =
  readScriptAttribute("co-st") ?? "Not configured";
export const WRONG_VERIFICATION_SCRIPT_HTML = VERIFICATION_SCRIPT_HTML.replace(
  /\bco-st\s*=\s*(['"])(.*?)\1/i,
  "co-st=$1SIT-WRONG-SITE-ID$1",
);
