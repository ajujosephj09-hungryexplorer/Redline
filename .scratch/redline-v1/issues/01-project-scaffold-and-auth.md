# 01 — Project scaffold + auth

**What to build:** A user visits the app, signs up with email, logs in, and lands on a protected dashboard page. Logging out returns them to a public landing page. Unauthenticated users cannot reach the dashboard. This is the Next.js project skeleton with Supabase auth wired end-to-end — no features yet, just the shell everything else plugs into.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Next.js project initialised with TypeScript, Tailwind, and App Router
- [ ] Supabase project connected (auth + database)
- [ ] User can sign up with email and password
- [ ] User can log in and is redirected to a protected dashboard route
- [ ] User can log out and is redirected to a public page
- [ ] Unauthenticated requests to protected routes redirect to login
- [ ] Credentials stored in `.env.local` (gitignored), no secrets committed
- [ ] Deployed to Vercel and reachable at a live URL
