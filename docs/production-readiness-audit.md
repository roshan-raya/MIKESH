# ACT Mastery production-readiness audit

**Verdict:** suitable for a limited private pilot after the access controls below are corrected. Block general release and any claim of comprehensive ACT instruction or verified benchmarks.

The audit examined the current Next.js application and the connected Supabase database. Browser verification used separate disposable identities and a production build. It did not use or change the student's password or submit work under the real student account. The built-in mock appeared unavailable because the live bank lacks enough unseen assessment questions.

## Release blockers

| Priority | Finding | Required action |
| --- | --- | --- |
| P0 | A legacy privileged key previously disclosed in the conversation must be treated as compromised. The local app still reported a legacy key during this audit. Rotation could not be verified. | Revoke or rotate the exposed key through the Supabase project dashboard. Prefer a new server-only secret key after confirming compatibility in a staging deployment. Replace the local and production secret, then confirm the exposed key has been revoked. |
| P0 | Supabase Auth still allows public registration. The application excludes unapproved accounts, but the Auth project can still accept registrations. | Turn off **Allow new users to sign up** in **Authentication → Sign In / Providers**. Retest using the public Auth settings endpoint and an unapproved disposable identity. |
| P1 | The hosted project returned `PGRST202` for `course_question_counts`. Topic difficulty controls and unseen timed mastery checks are unavailable there. | Apply `supabase/migrations/004_course_practice.sql` in the hosted SQL Editor, then verify both course RPCs against that deployment. The migration passed local PostgreSQL tests. |
| P1 | The database status named `verified` means published. The audit found no independent editorial sign-off, per-item source records, or documented review standard. | Finish human review and preserve reviewer, verification date, rationale, and sources before publishing benchmark material. Do not promote the 131 draft mock items on the strength of automated checks. |
| P1 | Full mock and complete instruction remain unavailable. | Finish course authoring and introduce reviewed, sufficiently large assessment pools. For current score benchmarks use ACT's official practice forms and form-specific scoring guides. |

## Inventory and quality

The [question inventory](production-readiness-inventory.csv) contains topic and difficulty counts. Rows with no coverage are included for all 70 mapped topics. Difficulty is an author-assigned label and has not been calibrated with student outcome data.

| Subject | Live practice | Live diagnostic holdout | Published total | Levels 1 / 2 / 3 / 4 / 5 | Repository-only mock drafts | Independently verified |
| --- | ---: | ---: | ---: | --- | ---: | ---: |
| English | 18 | 4 | 22 | 0 / 5 / 11 / 6 / 0 | 50 | 0 |
| Math | 31 | 4 | 35 | 0 / 7 / 10 / 15 / 3 | 45 | 0 |
| Reading | 13 | 4 | 17 | 0 / 5 / 5 / 7 / 0 | 36 | 0 |
| Science | 11 | 0 | 11 | 0 / 2 / 4 / 5 / 0 | 0 | 0 |
| Writing | 0 | 0 | 0 | — | 0 | 0 |
| **Total** | **73** | **12** | **85** | **0 / 19 / 30 / 33 / 3** | **131** | **0** |

Writing has one real timed essay prompt. No live draft rows or placeholder multiple-choice questions were found in the 85-row bank. The draft core mock items are real authored content and stay outside the published pool.

All 85 live questions had four distinct options, exactly one option matching the stored key, a nonempty worked explanation, and an original-content provenance string. The 85 live prompts had no exact normalized duplicates. The JSON check found no exact normalized duplicates across the 73 checked-in JSON items and 131 drafts. This does not establish that near-duplicates or alternative defensible answers are absent. The live keys and explanations received an audit spot review covering all subjects and the Math computations. Numeric unit checks cover a starter subset. No third-party item-by-item validation was recorded.

Three English defects were corrected in both source and the live bank. One short introductory phrase had an optional comma even though two options were offered as a single-answer correctness test. One archive passage edit named a replacement span that would duplicate the sentence's original wording. One concision choice expressed timing instead of preserving the original cause. The corrections kept the same IDs and stored keys. Older grading records for the original ambiguous wording were preserved.

All 85 live rows had empty distractor-feedback objects and lacked populated subtopic tags at audit time. There is an explanation for the keyed answer in each item. Source attribution is strongest at lesson level through the library of external ACT and educational references. The question bank needs skill-level citations, richer wrong-answer explanations, reviewer records, near-duplicate review, and additional passage lengths and genres. Twenty-three live items are attached to one of six stored passages.

## Curriculum against the enhanced ACT

The configured templates match ACT's 50/35 English, 45/50 Math, 36/40 Reading, optional 40/40 Science, and optional 1/40 Writing timing and length. ACT's four multiple-choice sections include embedded items excluded from official section scores. The in-app mock engine has no reviewed full form, no calibrated scoring, and no operational-item scoring model. ACT's composite uses English, Math, and Reading. Self-reported scores in the app are labeled separately. [Official ACT format](https://www.act.org/content/act/en/products-and-services/the-act/test-preparation/act-exam-sections-and-structure.html) · [Enhanced ACT blueprint](https://www.act.org/content/act/en/products-and-services/the-act-educator/the-act-test/enhancements-k12/faqs.html) · [Official free ACT practice](https://www.act.org/content/act/en/products-and-services/the-act/test-preparation/free-act-test-prep.html)

| Subject | Mapped topics | Mapped topics with live practice | Detailed courses and lessons | Largest instructional gaps |
| --- | ---: | ---: | --- | --- |
| English | 13 | 6 | Sentence Boundaries, 1 lesson | Organization and rhetorical purpose, tone and style, verb tense, pronouns, parallelism, modifiers, and longer passage-based editing |
| Math | 31 | 8 | Functions, 4 lessons. Quadratics, 2 lessons. | Fractions and proportional reasoning, inequalities and systems, rational and exponential models, broad plane and coordinate geometry, trigonometry, statistics and conditional probability |
| Reading | 12 | 7 | Inference, 1 lesson | Author's purpose and tone, point of view, sequence and cause, paired passages, evidence calibration, and full-length passages by genre |
| Science | 10 | 3 | Experimental Design, 1 lesson | Graph and table translation, interpolation, broader research summaries and experiments, model comparison, and mixed disciplinary context |
| Writing | 4 | Separate essay | Analyze Perspectives, 1 lesson | Sustained evidence development, organization, revision, additional prompts, and independent scoring |

**Content completed:** 10 written lessons, 30 expandable worked examples, and 10 guided exercises across six topics. Five older starter notes remain separate. The other 64 mapped topics lack a detailed course. The six authored courses have objectives, prerequisites, examples, common errors, timing strategies, and linked references. Functions and Quadratics have 10 and eight same-topic published practice questions respectively. Other courses rely on a smaller inventory or associated practice topics. Writing has self-review and a timed prompt. There are **zero independently verified end-to-end topic assessments**. Course mastery readiness is also blocked on the hosted migration, even for Functions and Quadratics.

The map covers the reporting categories and broad skill labels. It does not prove complete subskill coverage. The prerequisite graph and subtopic analytics cover a limited set of topics. Guided completion is evidence of correctly answering a lesson exercise, separate from mastery status.

## Feature disposition

| Area | Disposition |
| --- | --- |
| Private sign-in and grading | Confirmed email and non-anonymous user checks apply at the route and server data layers. Ownership is checked on study reads and writes. Test evidence is listed below. |
| Lessons and study progress | Working authored lessons, hints, expandable examples, server-graded guided feedback, saved completion, and browser-local scratchpad. Topic-level coverage remains partial. |
| Practice player | Untimed learning, topic selection, counts, autosave, resume, grading, and results are implemented. A failed save from a previous question now stays visible and retries before submission. |
| Adaptive practice | Rule-based selection uses accuracy, time, difficulty, recency and misses. It is a study aid. Selection quality at scale and improvement in scores have no outcome validation. |
| Mistakes and spaced review | Real study history, error labels, due dates, and interval updates. Review scheduling is basic, and has no long-term retention validation. |
| Timed drills, diagnostic, writing | Supported. Short drills and the three-section diagnostic use server-managed submission rules. Essay practice saves drafts and supports self-review. There is no human or model writing grade. |
| Progress analytics | Reads student attempts directly. Dashboard and planner now share the same minimum three-item and below-80% rule for recommendations. First-response percentages are explicitly labeled separately from course mastery. |
| Timed unseen course mastery | SQL and local integration passed. Hosted configuration needs migration 004. |
| Full mock | Correctly gated on missing unseen inventory. No reviewed in-app form or live run of a full core mock. The nine-item diagnostic has too few reserved questions for repeated unseen retakes. |
| Tutor | Intentionally disabled in the hosted environment. Authentication and disabled behavior can be checked. Live provider quality and costs are untested. |
| Missing production operations | No deployed Vercel project, content approval dashboard, independent item-review ledger, incident monitoring baseline, or backup restore exercise recorded. |

## Deploy a private pilot

1. Rotate the exposed Supabase credential and turn off public and anonymous registration. Keep one confirmed approved student account. Prepare a separate Supabase project for staging and browser QA.
2. For an existing database apply missing migrations in numeric order, starting with **004** if 001–003 are already installed. The idempotent wording migration **005** records the three corrections applied to the connected bank. For a fresh database follow the bootstrap and seed order in the [README](../README.md). Apply 006 and 007 and load the Quadratics chapter seed following the [textbook implementation guide](quadratic-textbook.md). Keep the draft mock files out of the seed.
3. Use the intended Node LTS version for hosting. Run `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run bank:check`, and `npm run build`. Run all four PostgreSQL test scripts on a disposable seeded database. Run Playwright with a disposable approved account. Verify both hosted retest flows after migrations 004 and 007.
4. Push through a **private** GitHub repository. Confirm `.env.local` is ignored and excluded from history. Import the repository into Vercel as a Next.js app. Configure the project URL, publishable key, server-only key, and approved email using the names in `.env.example`. Set isolated preview credentials or leave previews unconfigured.
5. Set Supabase's Site URL and allowed redirects to the trusted production domain. Verify on that domain that an unauthenticated visitor is redirected, an unapproved user is rejected, an approved user can save work and sign out, and one account cannot see another account's work.
6. Keep the tutor disabled until provider, privacy, and error behavior are reviewed. Set up monitoring and verify backup restoration before broader use. Keep the app labeled as limited practice until the curriculum and assessment blockers are resolved.


## Audit limits

The checks cover the exercised Chromium routes and controls at desktop, tablet, and mobile viewport sizes. They are not a WCAG conformance certification, assistive-technology review, device lab, load test, or legal review. Scope excludes downtime simulation against the real database, AI provider execution, official grading validation, and a live Vercel rollout. Loading and route recovery boundaries were inspected in source. The browser exercised missing routes, denied routes, a simulated failed save, and its retry path. Next.js can deliver a streamed 404 screen with HTTP 200 for denied study pages. API ownership checks still deny access.

All 14 registered ACT and OpenStax source URLs returned HTTP 200. The Khan Academy help URL returned HTTP 403 to the audit client, so direct access could not be confirmed in that check. No third-party lesson assets were imported.

## Commands and evidence

| Check | Result |
| --- | --- |
| `npm run lint`, `npm run typecheck`, `npm run build` | Passed on the audited application. |
| `npm test` | 10 passed. Includes deadline boundaries, query validation, composite arithmetic, first-response mastery, course structure, expanded Math answer checks, and cross-batch duplicate checks. |
| `npm run test:e2e` with the production build and two disposable Supabase identities | 7 passed in 2.1 minutes. Both test identities and their records were deleted. Hosted unseen course mastery was outside this successful run because migration 004 is missing. |
| `npm run bank:check` | Passed for the starter bank. The unit suite additionally validates published batches and draft mock inputs together. |
| `psql … -f tests/database.sql -f tests/course-database.sql` | Passed on a disposable PostgreSQL database with all five migrations. Covers grading and isolation, deadlines, duplicate submissions, due review, and the difficulty and unseen constraints. |
| `npm audit --omit=dev --json` | No known production dependency advisories returned by npm for the locked versions at audit time. |

The production browser suite uses desktop 1440×900, tablet 834×1112, and mobile 390×844. The route checks covered 20 signed-in destinations at each width, with no horizontal overflow at the measured viewport. Browser controls included keyboard access to the skip link, settings and theme persistence, plan toggles, score entry, account separation, question navigation, progress reload, autosave recovery, and assessment submission. The functional cases passed for adaptive practice startup, mistake categorization, a due review with interval doubling, server rejection of a late timed write, all three diagnostic sections, the unavailable full mock state, timed essay save and resume, and all 10 guided exercises and 30 worked examples. The audit runner creates and then deletes separate disposable Supabase accounts and fixture rows.

## Security and question-to-learning follow-up

The preceding production audit is the baseline. This follow-up adds assets and test coverage without replacing the hosted inventory or student records.

- **Hosted access:** the configured privileged key is still legacy and still accepted, signup is still enabled, and migration 004 still returns `PGRST202`. The confirmed student account is present. No project-owner backup or SQL connection was available. The [security cutover runbook](security-cutover.md) lists actual key consumers, dashboard steps, and hosted verification. The server and maintenance tools now support `SUPABASE_SECRET_KEY` as the preferred replacement.
- **Question-to-learning:** 18 published question revisions have authored learning profiles in the workspace. These cover all 10 live Functions practice items and eight Quadratics items, including 54 specific incorrect-choice explanations. The player reveals this information only when feedback is permitted, and the mistake notebook uses the same profiles. A chosen wrong option suggests a skill to check. It does not establish the student's underlying cause. A course link opens the relevant lesson or prerequisite and leads to its timed unseen retest. Hosted retest is still blocked by the missing migration.
- **Priority Math:** four new lessons cover proportional reasoning, systems and inequalities, coordinate geometry, and right-triangle trigonometry. The workspace now contains 10 detailed courses, 14 lessons, 42 worked examples, and 14 guided exercises. The new practice batch adds 12 local drafts with three incorrect-choice explanations each. New practice items have not been published. The inventory CSV tracks the workspace profiles and new drafts in separate columns.
- **Editorial workflow:** migration 006 adds an owner-recorded decision ledger with snapshots and source links. The application role cannot approve content, and the migration keeps mock items unpublished. See the [editorial checklist](editorial-review.md). No independent approval was recorded. The 131 mock drafts are unchanged.
- **Remaining content:** 67 published items still lack complete question-specific metadata and feedback. Sixty mapped topics still lack a detailed course. The priority English, Reading, and Science expansion is pending. Hosted totals remain 85 published items and zero independently verified items.

Follow-up checks passed for lint, TypeScript, the production build, 14 unit tests, and 8 production browser tests. Browser coverage included the post-grading Functions concept map and prerequisite navigation, verified access and ownership using two temporary identities, and all 14 guided exercises. The temporary identities and records were removed. The retest UI correctly reported the missing hosted RPC. Local PostgreSQL passed all three SQL suites, including timed unseen selection, recorded mastery evidence, editorial access exclusions, and the mock publication guard. A disposable pre-004 database backup was restored and checked for all 85 original published rows. This is local recovery evidence only.

## Quadratic Equations textbook follow-up

The [textbook implementation guide](quadratic-textbook.md) documents the first four-level chapter and the shared textbook controls. The Quadratics chapter has 10 concept lessons, 30 worked examples, and 10 guided checkpoints. It adds 24 original items in a separate seed. Local PostgreSQL verified 32 total Quadratics questions after this seed, coverage across all 10 concepts, and a timed focused retest that excluded previously assigned items and wrote a graded attempt to the existing mastery data. The hosted project still has eight Quadratics practice items and returns `PGRST202` for both retest-count RPCs. No hosted migrations or textbook items were added. The existing mock drafts and independent-review counts are unchanged. The inventory CSV reports these 24 seed items separately from hosted and draft inventory.

Textbook checks passed for lint, TypeScript, the production build, 19 unit tests, the 24-item bank validator, and four SQL suites on a fresh disposable database. All nine production browser cases passed in Chromium using two disposable hosted identities. The walkthrough graded a Quadratics miss, opened the prerequisite graph and zero-product lesson, saved a guided result and bookmark, and reached the hosted retest availability message. The retest started with a server deadline and saved grading evidence in the local SQL verification. Temporary hosted accounts and their fixtures were removed.

## Proportional Reasoning curriculum expansion

The [Proportional Reasoning milestone](proportional-reasoning.md) expands the existing single lesson into a four-level sequence with 8 lessons, 24 worked examples, 3 comparison tables, and 8 checkpoints. It covers ratio parts, weighted unit rates, unit conversion, direct proportions, percent bases and changes, dimensional scales, inverse variation, and combined-rate models. The workspace now has 29 lessons and 87 worked examples across 10 courses. Quadratic Equations and Proportional Reasoning have four-level instruction. Eight courses have selected lessons, and 60 mapped topics still lack a detailed course.

The new practice batch contains 40 authored items across five difficulty levels, all with practice-only draft status. Independent review and publication counts are both zero. The three earlier topic drafts and the 131 mock drafts remain separate. The inventory CSV tracks the new batch by difficulty without including it in hosted counts.

The release guard and timed unseen retest passed on disposable PostgreSQL using review fixtures that rolled back. Migration 008 and the new batch have not been applied to the hosted project. Hosted practice remains unavailable for this chapter until owner migration, editorial review, and release. Linear Equations is the next foundational expansion before Systems and Inequalities.

Verification passed for lint, TypeScript, the production build, 23 unit tests, 10 production browser checks, and five disposable PostgreSQL suites. The validator checked the 40-question draft bank, and all six chapter references returned HTTP 200. The browser exercised all 29 authored lessons and verified the Proportional Reasoning prerequisite link, graded checkpoints, bookmark persistence, and accurate unavailable-practice state. Both disposable hosted accounts and their test data were removed.

## Linear Equations and source verification follow-up

Live read-only results were 85 published questions, 71 mapped topics, 3 published Linear Equations items including the diagnostic holdout, enabled public signup, and missing course-practice RPC. The configured legacy key is still accepted. No hosted release or security change took place. The new four-level chapter adds four lessons, twelve worked examples, four guided checkpoints and sixteen protected drafts with remediation profiles. See the [coverage matrix](curriculum-coverage.md), [source registry](content-source-registry.md), and [verification record](deep-learning-verification.md).

Three existing Linear Equations items gained learning profiles using stable keys or the exact legacy prompt. This brings the workspace mapping to 21 of 85 hosted items. The remaining 64 need profiles. The textbook now has 11 courses, 33 lessons, and 99 worked examples, with 60 mapped topics still lacking a detailed course.

## Sentence Boundaries checkpoint

Read-only hosted verification returned 71 topics, 85 published questions, signup enabled, accepted legacy credentials, PGRST202 for both counts RPCs, and PGRST205 for the editorial ledger. The workspace now contains 36 detailed lessons, 108 examples and 36 checkpoints across 11 courses. Four courses span all levels. The census contains 320 unique questions, 211 drafts and 24 unpublished seed-eligible items. Profiles cover 129 families, including 25 of 85 hosted items. This batch created 12 draft English items and neither approved nor published any questions. Migration 009 and the new items were exercised in a disposable database only. See the [acceptance report](act-mastery-final-acceptance.md).
