# Navigation Bug Resolution (June 2026)

Memory document for the multi-week investigation and fix of the production
"URL-changes-but-page-doesn't-render-until-second-click" navigation bug.
Capture preserved so future engineers don't re-derive any of this from
scratch.

## Symptom

On Contabo-hosted production, clicking a Link in the landing nav (e.g.
`/` → `/pricing`) would update the URL bar and active-state on the sidebar,
but the main content stayed on the previous page. A second click on the
same link rendered the new page normally. Localhost, Vercel previews, and
direct-to-IP requests (port 3001, HTTP/1.1) never reproduced.

## Triangulation — what was ruled out

Before identifying the root cause we eliminated the following by isolating
each in turn:

| Suspect | How ruled out |
|---|---|
| nginx config / proxy headers | Bypassed nginx, hit Next.js directly — bug still reproduced over the slow path |
| Cloudflare | Disabled CF on a test subdomain — still reproduced |
| HTTP/2 specifics | Forced HTTP/1.1 — still reproduced |
| Cache-Control / RSC cache | Disabled all caches, added `no-store` — still reproduced |
| Third-party scripts | Commented out `<AddonsLoader />` (GA, Clarity, Tawk.to, GetButton, Trustpilot) — bug *appeared* to disappear, but actually only became less frequent. Misleading signal. |
| The pre-existing `removeChild` monkey-patch | Removed it — exposed the actual race instead of hiding it |

Each elimination took at least one deploy + repro round. Total elapsed
time on triangulation: several weeks.

## Root cause

Headless-browser reproduction against production finally pinned an
uncaught error at the moment of the failed navigation:

```
TypeError: Cannot read properties of null (reading 'removeChild')
  at commitDeletionEffects → unmountHoistable
```

This is a known React 19 + App Router race
([vercel/next.js discussion #52625](https://github.com/vercel/next.js/discussions/52625)):

1. The user clicks a Link. Next starts the navigation transition.
2. React begins committing the new tree. As part of cleanup it tries
   to unmount hoistable resources (`<link>`, `<script>`, etc.) that
   were attached to the document head.
3. The RSC payload streams in slowly over a slow origin. By the time
   React reaches `unmountHoistable`, some of those nodes have already
   been detached/moved by a third-party script (or by a previous race
   already in flight). Their `parentNode` is `null`.
4. `parent.removeChild(child)` throws because `parent` is `null`.
5. The commit aborts. History API already moved the URL, but the DOM
   commit never lands. Visually: URL changes, page does not.

The race is latency-dependent. Vercel's edge cache is fast enough that
React's commit phase wins every time. Localhost is fast enough. Direct
IP:3001 over HTTP/1.1 is fast enough. The Contabo origin under nginx
proxying is just slow enough that the race triggers reliably.

## Fix stack (current state on `develop`)

These changes are layered — each addresses a piece. Don't remove one
without understanding the role:

1. **`src/components/nav-crash-recovery.tsx`** (mounted in
   `src/app/layout.tsx`) — global `window.addEventListener('error')`
   handler that detects the specific
   `Cannot read properties of null (reading 'removeChild')` TypeError
   and triggers `window.location.reload()` exactly once
   (loop-guarded via sessionStorage). Because the History URL is
   already on the target route at that point, the reload renders the
   correct page on first paint. Healthy navigations never throw, so
   this listener never fires.

2. **`src/components/force-full-navigation.tsx`** — landing-only
   click interceptor that turns landing-to-landing clicks into full
   page loads (`window.location.assign`). SPA navigation between
   landing routes is where the race lived; full reloads sidestep it
   entirely. Scoped so dashboard/admin keep their SPA UX intact.

3. **`prefetch={false}`** on landing `<Link>` components — once
   landing nav became full-reload, RSC prefetch was wasted work and
   was also (per the original investigation) contributing to the
   "prefetch storm" that aggravated the slow-origin race.

4. **React pinned to `19.1.0`** in `package.json` — newer 19.x
   patches reintroduced different variations of the same race.
   Don't auto-bump.

5. **`src/app/layout.tsx`** ships a narrow runtime guard that
   intercepts `Node.prototype.removeChild` and no-ops when `child.parentNode`
   is already `null` (the exact case the third-party teardown
   creates). Earlier versions also wrapped `insertBefore` — that
   introduced a "first click works, second click needs two clicks"
   bug because it silently no-op'd legitimate React reconciliations.
   The current narrow form only touches `removeChild` and only when
   the child is fully detached. See the long comment block in
   `layout.tsx` for the full rationale.

6. **Server tweaks (nginx)** — gzip enabled and keep-alive tuned on
   the upstream proxy, shaving enough latency off the RSC payload
   that the race becomes rare even on the slow path. Defense in
   depth on top of the React-side mitigations.

7. **Theme-toggle blink fix** (PR #61) — unrelated visible issue
   surfaced during the investigation. Removed the mount-gate on the
   header theme toggle so it renders synchronously instead of after
   hydration, killing the brief flash.

## What works where

| Environment | SPA nav | Why |
|---|---|---|
| localhost | ✅ | Fast enough, race never triggers |
| Vercel | ✅ | Edge cache + edge runtime are fast enough |
| Direct IP:3001 (HTTP/1.1) | ✅ | Bypasses nginx, fast enough |
| Contabo via nginx (production) | ✅ | Landing routes are full-page MPA (force-full-navigation). Dashboard/admin keep SPA. NavCrashRecovery catches anything that still slips through. |

## How to verify the fix still works

1. Deploy a commit that re-introduces the bug (e.g. revert
   `force-full-navigation` and `prefetch={false}`) to staging.
2. Run a headless browser script that clicks landing nav links in a
   loop and asserts both URL and `document.title` advance together.
3. Without the fix, you'll see desync within ~20 clicks. With the
   fix, never.

## Open follow-ups

- Restore full SPA navigation on landing routes once
  (a) React fixes the commit-race upstream or (b) we move the slow
  origin behind a CDN that closes the latency gap. Track React via
  the linked discussion.
- If we ever drop `nav-crash-recovery` or `force-full-navigation`,
  re-add the headless smoke test to CI first.

## Pointers

- Root cause discussion: https://github.com/vercel/next.js/discussions/52625
- Fix components: `src/components/nav-crash-recovery.tsx`,
  `src/components/force-full-navigation.tsx`
- Runtime DOM guard: long comment block in `src/app/layout.tsx`
  (the narrow `removeChild` patch)
- React pin: `package.json` — must stay on `19.1.0` until the race
  is fixed upstream
