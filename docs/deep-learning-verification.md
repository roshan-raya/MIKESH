# Deep learning verification

## Linear Equations

The four-level chapter contains 4 lessons, 12 original worked examples, 4 guided checkpoints, and 16 drafted question profiles. All three hosted Linear Equations items now have workspace learning profiles keyed to their existing identities. Automated checks recompute all 16 keys and verify the 48 wrong-choice links, scoped retest destinations, the acyclic lesson graph, and duplicate prompts across repository batches. Instruction is available through the textbook. The draft pool needs further variety and approved publication before it can support sustained mastery checks.

The read-only hosted check returned 85 published questions and 71 mapped records. Linear Equations has two published practice items and one diagnostic item. The course counts RPC returned PGRST202, public signup is enabled, and the configured legacy privileged credential still works. Follow the [security cutover](security-cutover.md) before production. No live security settings or migrations were changed.

To stage the new bank after applying the required migrations, run `node scripts/bank.mjs content/linear-equations-draft.json --sql` and import the emitted draft SQL through the approved owner connection. Use the editorial ledger and release function for reviewed items.

Lint, TypeScript, 25 unit tests, the production build, and five PostgreSQL regression suites passed. The isolated database returned all 16 staged rows as practice-only drafts. The current milestone leaves the older published Linear Equations items on their existing IDs and leaves the admissions-score calculations alone.

Ten production Chromium regression cases passed, including the walkthrough of all 33 lessons and saved guided results. A separate Chromium run on the final build confirmed that a wrong answer on an existing Linear Equations item opened its remediation lesson. Disposable hosted accounts and test records were removed after each run. Hosted unseen retesting remains blocked by the missing database RPC.

## Sentence Boundaries

The existing checkpoint key was retained. Three new lessons add nine examples, one structured table, and three guided checks. Twelve unpublished questions on two original passages have 36 specific distractor explanations and focused lesson links. Four existing hosted English questions now resolve to workspace profiles without changing their hosted IDs or grading.

The build, lint, 27 unit tests, six disposable SQL suites, and two signed-out browser checks passed. SQL verified draft import and blocked release against a changed passage until a current synthetic approval was recorded. It also blocked an in-place change to a passage with released linked items. Synthetic approvals rolled back. No authenticated browser flow was run for this batch, and no hosted migration or question publication took place.

## Number and Quantity foundations

Added five lessons, 15 worked examples, five checkpoints and 15 protected drafts. Four cross-chapter links connect them to Proportional Reasoning, Linear Equations and Quadratics. The tests numerically recompute every key, check the uniqueness of the numeric answer and the 45 wrong-choice routes, and verify the combined dependency graph. Two existing hosted questions in this topic cover rational powers and complex numbers and remain outside this arithmetic batch.

Lint, TypeScript, the production build, 29 unit tests, seven disposable SQL suites and two signed-out Chromium tests passed. SQL verified that the drafts were ineligible, an unapproved release was refused, and a synthetic approved revision was eligible. The synthetic approval and release rolled back. No authenticated browser walkthrough or hosted writes occurred.

## Exponents and Radicals

Integrated five lessons, 15 worked examples, five guided checkpoints, four cross-chapter links, and 15 practice drafts. Automated checks cover all keys, 45 wrong-choice routes, strict rendering of lesson math, and the combined dependency graph. The existing rational-power item has a remediation profile without a change to its hosted ID or classification.

Lint, TypeScript, the production build, 31 unit tests, eight disposable SQL suites and two signed-out browser checks passed. The initial lint run included generated Vercel code. The lint configuration now excludes it. A stale generated type cache was cleared before the build passed. SQL proved the unpublished bank was ineligible for practice and required approval before release. The synthetic approval rolled back. No signed-in browser run, hosted writes, or deployment occurred.
