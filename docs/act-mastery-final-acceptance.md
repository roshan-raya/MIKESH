# ACT Mastery final acceptance

Evidence updated November 23, 2026 after the Number and Quantity foundations batch.

| Acceptance test | Status | Evidence | Remaining work |
| --- | --- | --- | --- |
| All topics teachable | FAIL | 12 of 71 mapped topics have detailed instruction, and five courses span four levels. The verified graph contains 41 nodes, 49 within-chapter edges, and four cross-chapter edges. | Author 59 detailed courses, deepen partial chapters, extend the prerequisite graph, and verify mastery. |
| Sufficient practice | FAIL | 335 question families against the 5,000-item planning target, including 73 published practice items. The 15 new arithmetic questions passed automated key checks and remain drafts. | Expand skill and difficulty coverage and obtain named review before releasing items. |
| Every question teaches | FAIL | Workspace profiles cover 144 of 335 question families and 25 of 85 hosted items. New drafts have 45 misconception-specific wrong-choice explanations. | Map the 60 hosted gaps, including the adjacent rational-power and complex-number items, and verify remediation end to end. |
| Verified full mocks | BLOCKED | 131 mock drafts, no released form, and no documented independent approvals. | Obtain named reviews, authorize an independent mock release, and test multiple distinct forms under timing. |
| Secure production | BLOCKED | Read-only hosted probes found public signup enabled, legacy credentials still accepted, both retest RPCs missing (PGRST202), and the editorial ledger absent from the REST schema (PGRST205). | Owner completes the [cutover](security-cutover.md), verifies backup and staging migrations through 009, and checks authenticated isolation. |
| Complete preparation experience | BLOCKED | 29 unit tests, seven disposable SQL suites and two signed-out Chromium checks passed. The release-gate fixture rolled back. Hosted mastery and full mocks remain unavailable. | Complete missing content, unlock approved hosted mastery and mocks, then verify the full diagnostic-to-study-and-retest workflow using a separate staging student. |

[Reconciled census](complete-act-content-inventory.md) · [Verification](deep-learning-verification.md)
