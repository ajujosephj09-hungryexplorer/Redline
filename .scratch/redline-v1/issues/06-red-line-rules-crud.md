# 06 — Red-line rules CRUD

**What to build:** A logged-in user can fully manage their red-line rules: toggle any rule on/off, edit a rule's wording, add entirely new custom rules, and delete rules (including defaults). All changes persist across sessions. Disabled rules are excluded from future analyses. The user has full control over their rule set — these are defaults, not limits.

**Blocked by:** 03 — Default red-line rules schema + seed

**Status:** done

- [x] User can toggle any rule on or off; disabled rules are excluded from analysis
- [x] User can edit the wording of any rule (default or custom)
- [x] User can add a new custom rule with a name and wording
- [x] User can delete any rule, including defaults
- [x] All changes persist across sessions (stored in Supabase, tied to user)
- [x] UI clearly distinguishes default rules from custom rules
- [x] At least one rule must remain active (or handle the zero-rules edge case gracefully)
- [x] Deleted defaults are not re-seeded on next login
