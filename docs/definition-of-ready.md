# Definition of Ready (DoR)

Every ticket must satisfy these criteria before it enters a sprint. A ticket that does not meet the DoR is sent back for refinement.

## Required fields

### Objective / intended outcome
What this ticket achieves and why it matters.

### User story
As a [user], I want [goal], so that [benefit].

### Scope + expected behavior
What is included and what is not. What the user sees when it works.

### Permissions / access handling
Who can perform this action. What happens when an unauthorized user tries.

### Error handling + edge cases
What can go wrong and what the system does when it does. Cover at least: empty input, malformed input, timeout, and unauthorized access.

### Acceptance Criteria (Given / When / Then)
Each criterion in Given/When/Then format. These are what QA or tests will verify.

### Completion criteria / test expectations
What tests must pass for this ticket to be considered done. Which seam the tests target.

### Design link (where applicable)
Link to a mockup, wireframe, or design spec. Write "N/A — no UI changes" if the ticket is backend-only.

### Dependencies identified
Which other tickets, services, or decisions must be resolved before this ticket can start. "None" is a valid answer.

### Sized / refined
T-shirt size (S/M/L/XL) agreed before the ticket enters a sprint. A ticket larger than L should be split.

### Success signal / telemetry (when relevant)
How we will know this is working in production. What to measure, what to log, what to alert on. Write "N/A" for tickets with no observable production behavior.

### Material NFRs
Non-functional requirements that apply to this ticket. Cover whichever are relevant:
- **Performance:** response time, throughput, payload size
- **Accessibility:** keyboard navigation, screen reader support, contrast
- **Security / privacy:** data exposure, auth boundaries, PII handling
- **Resilience:** what happens when a dependency is down

### Rollout / rollback / feature-flag expectation (for risky changes)
How this change ships. Whether it needs a feature flag, a staged rollout, or a rollback plan. Write "Ship directly" for low-risk changes.
