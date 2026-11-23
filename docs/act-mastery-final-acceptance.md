# ACT Mastery final acceptance

Evidence updated November 23, 2026 after the Sentence Boundaries batch.

| Acceptance test | Status | Evidence | Remaining work |
| --- | --- | --- | --- |
| All topics teachable | FAIL | 11 of 71 topics have detailed instruction. Four chapters span all four levels. The verified graph has 36 nodes and 43 edges. Sentence Boundaries gained three lessons and a complete internal prerequisite path. | Write 60 detailed courses, deepen partial chapters, connect the course graphs, and verify mastery paths. |
| Sufficient practice | FAIL | 320 distinct items against the 5,000-item planning target. Hosted practice is 73 items. The English batch added 12 local passage-based drafts. | Expand distinct skill and difficulty pools, including English and Reading passages and Science figures. Independently review before release. |
| Every question teaches | FAIL | 129 of 320 families have complete profiles in the workspace. 25 of 85 hosted questions have profiles in this build. Four hosted English items and all 12 new drafts gained correct-choice and wrong-choice destinations. | Add profiles for the remaining 60 hosted items, verify alternative solutions and similar-item actions, and retest remediation end to end. |
| Verified full mocks | BLOCKED | 131 mock drafts, zero released mock pools, and zero independent approvals evidenced. Migration 009 preserved the existing release guard and binds protected chapter items to the reviewed passage content. | Obtain named independent reviews and assemble several approved, distinct forms. Verify the separately authorized mock release and run timed staging sessions. |
| Secure production | BLOCKED | Fresh read-only check confirmed accepted legacy credentials, enabled signup, PGRST202 for both course-count RPCs, and PGRST205 for the editorial ledger. No hosted changes performed. | Owner completes the [credential and signup cutover](security-cutover.md), backs up the database, stages and verifies the required migrations through 009, and tests authenticated isolation before production rollout. |
| Complete preparation experience | BLOCKED | 27 unit tests, six local SQL suites and two signed-out browser checks passed. Existing learning components are reused. Hosted unseen mastery is unavailable and no full mock is released. | Finish curriculum and remediation, unlock hosted mastery and approved mocks after cutover, then test the full diagnostic-to-study-and-retest journey with an isolated student. |

Progress counts come from the [reconciled census](complete-act-content-inventory.md). Human review and production outcomes remain distinct from test results.
