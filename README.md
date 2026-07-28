# Redirect Verification Lab

A deterministic website for testing whether a site-ownership verification job
correctly follows HTTP redirects and inspects the final page `<head>`.

## Verification identity

- The verification script and root redirect count are configured in
  `app/test-config.json`.
- The valid script is present only on `/result/valid`.
- The root URL follows the configured number of redirects before reaching
  `/result/valid`.
- The interactive redirect lab is available at `/lab`.

See [MANUAL-CONFIGURATION.md](MANUAL-CONFIGURATION.md) for the Vietnamese
self-service guide.

## Configurable redirect endpoint

```text
/redirect/{hops}?status={status}&delay={milliseconds}&target={target}
```

Parameters:

- `hops`: 1–50 redirects. Use `/result/{target}` for a no-redirect baseline.
- `status`: 301, 302, 303, 307, or 308.
- `delay`: 0–5000 milliseconds per redirect response.
- `target`: `valid`, `missing`, `body`, `wrong`, or `error`.

Examples:

```text
/redirect/1?status=302&target=valid
/redirect/3?status=301&delay=500&target=valid
/redirect/2?status=302&target=missing
/loop?step=a
```

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run validate:artifact
```
