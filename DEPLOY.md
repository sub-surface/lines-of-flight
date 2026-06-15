# Deploying Lines of Flight

Live at **[lines.subsurfaces.net](https://lines.subsurfaces.net)**.

## Hosting shape

- **Host:** Cloudflare — a **Worker** with static assets (service name
  `lines-of-flight`, *not* a Pages project). Account: **Sub-Surface**.
- **Served from:** `public/` (`index.html` + a copy of `SPEC.md` for the
  in-page link). `wrangler.jsonc` sets `assets.directory = "./public"`, so the
  deploy only walks that folder — no `.git` noise in the upload report.
- **DNS:** `lines.subsurfaces.net` is a proxied custom domain bound to this
  Worker, declared in `wrangler.jsonc` `routes` (`custom_domain: true`). Wrangler
  auto-creates/maintains the CNAME on deploy — no dashboard step.
- **Source of truth:** GitHub `sub-surface/lines-of-flight`, branch `main`,
  Git-connected — every push to `main` redeploys automatically.
- The digital garden (`subsurfaces.net`) and StarWeft (`star.subsurfaces.net`)
  are *separate* Workers on the same account/zone. Never touch them here.

## Push-to-prod flow

Every push to `main` redeploys automatically:

```
git add -A
git commit -m "…"          # end with the Co-Authored-By trailer
git push origin main
```

Verify (~30–60s after push):

```
curl -sI https://lines.subsurfaces.net   # 200, Server: cloudflare
```

## Manual deploy (from the CLI)

`wrangler` is a dev-dependency, so once `npm install` has run:

```
npm run deploy     # wrangler deploy — uploads public/, binds the domain
npm run tail       # live logs
npm run dev        # local dev server
```

Auth is the account-wide Cloudflare OAuth token (shared with the other
Sub-Surface Workers). If a deploy 401s, run `wrangler login`.

## First-time setup (already done, for reference)

1. `wrangler.jsonc` with `assets.directory: "./public"` and a
   `routes: [{ pattern: "lines.subsurfaces.net", custom_domain: true }]` entry.
2. `wrangler deploy` — created the Worker, uploaded assets, bound the domain.
3. Connected the GitHub repo for auto-deploy (Workers & Pages → the
   `lines-of-flight` Worker → Settings → Build → Connect to Git →
   `sub-surface/lines-of-flight` @ `main`, no build command).
