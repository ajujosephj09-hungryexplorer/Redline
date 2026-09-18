# 03 — Default red-line rules schema + seed

**What to build:** When a new user signs up, 6 default red-line rules are created for their account: IP Assignment (overbroad), Payment Terms (unfavorable), Termination without guaranteed payment, Non-Compete, Indemnification (overbroad), Forced Arbitration + Class Action Waiver. A logged-in user can view their rules list. Rules are stored in Supabase, scoped to the user.

**Blocked by:** 01 — Project scaffold + auth

**Status:** ready-for-agent

- [ ] Supabase `rules` table exists with columns for user ID, rule name, rule description/wording, enabled flag, and whether the rule is a default
- [ ] On account creation, 6 default rules are seeded for the new user (wording per CONTEXT.md)
- [ ] Rules UI page lists all rules for the logged-in user, showing name, wording, and enabled/disabled state
- [ ] Row-level security ensures users only see their own rules
- [ ] Each default rule includes metadata for which rules produce gaps (IP, Payment, Termination) vs. flag-only (Non-Compete, Indemnification, Forced Arbitration)
