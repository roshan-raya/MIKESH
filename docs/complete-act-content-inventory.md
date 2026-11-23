# ACT Mastery complete content inventory

Audited November 23, 2026. The hosted census was read-only. Workspace counts include the new Sentence Boundaries batch. No hosted content or student data was changed.

| Subject | Topics | Complete | Partial | Missing | Detailed lessons | Starter notes | Examples | Checkpoints | Local unique MC | Hosted practice | Hosted diagnostics | Mock drafts | All drafts | Seed-only | Verified reviews evidenced | Essay prompts | Explanation present | All wrong choices explained | Remediation links |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Math | 31 | 0 | 7 | 24 | 29 | 1 | 87 | 29 | 172 | 31 | 4 | 45 | 113 | 24 | 0 | 0 | 172 | 113 | 113 |
| English | 14 | 0 | 2 | 12 | 4 | 1 | 12 | 4 | 84 | 18 | 4 | 50 | 62 | 0 | 0 | 0 | 84 | 16 | 16 |
| Reading | 12 | 0 | 1 | 11 | 1 | 1 | 3 | 1 | 53 | 13 | 4 | 36 | 36 | 0 | 0 | 0 | 53 | 0 | 0 |
| Science | 10 | 0 | 1 | 9 | 1 | 1 | 3 | 1 | 11 | 11 | 0 | 0 | 0 | 0 | 0 | 0 | 11 | 0 | 0 |
| Writing | 4 | 0 | 1 | 3 | 1 | 1 | 3 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 |
| Total | 71 | 0 | 12 | 59 | 36 | 5 | 108 | 36 | 320 | 73 | 12 | 131 | 211 | 24 | 0 | 1 | 320 | 129 | 129 |

The five starter notes are additional materials, four on topics with detailed instruction. Punctuation is the only starter-only mapped topic. Quadratic Equations, Proportional Reasoning, Linear Equations, and Sentence Boundaries have four instructional levels. All 11 detailed courses use guided exercises, summaries, references, bookmarks and progress controls. Expanded instruction still needs approved practice and working hosted unseen assessments before it meets the complete definition. No topic headings or overview-only syllabus routes are counted as lessons.

## Reconciliation and verification methods

- Read the 85 hosted question records, 71 topic records, five starter lesson records and five exam templates using Supabase read queries. Selected question fields were ID, bank key, topic, subtopic, difficulty, status, holdout, prompt, options, correct key, explanation, distractors, provenance and passage ID. No student records were read. Query the same fields with keyset or range pagination if the bank grows beyond the returned 1,000-row page.
- Walk every JSON file under `content/` using `node scripts/bank.mjs <file> --rows`. The result is 308 questions. Twelve SQL seed items reconcile to twelve hosted UUIDs by matching normalized subject and prompt. Other SQL files are schema or migrations. The TypeScript lesson and profile modules do not define an additional multiple-choice bank. The essay prompt is separately counted in the study player.
- Group bank revisions by the prefix before `@` and use hosted UUIDs for legacy items. Use the hosted version as primary where present. Count exact duplicate candidates after identity reconciliation by normalized same-subject prompt. All 85 hosted question families also exist in the workspace. There are zero archived or disabled question rows in the inspected sources.
- The local and hosted union is 320 families. Purpose totals are 177 practice, 12 diagnostic, and 131 mock. The 211 drafts comprise 80 practice and 131 mock. The 24 Quadratics supplemental items have seed-eligible status and have not been uploaded. The 85 hosted published rows use the legacy `verified` publication flag.
- The hosted editorial relation returned `PGRST205`. The audit found zero independent approvals it could substantiate. Editorial status outside the available sources is unknown. Automated verification and publication supply no evidence of human approval.
- Evaluate `chapterGraph` and `questionLearning` against the real course registry and item identities. Inspect author feedback plus runtime wrong-choice profiles. 191 items lack complete wrong-choice feedback and 191 lack profiles. The hosted subset has 25 mapped profiles and 60 gaps. All 85 hosted records lack a stored subtopic. Across the union 216 lack a stored subtopic, zero lack a topic, and zero structurally invalid profile routes were found. Authored runtime profile labels and database tags are counted separately.
- The chapter CSV joins all 71 hosted topics to the course registry. No authored course exists outside the hosted map. Fifteen mapped rows have no multiple-choice bank, including the four Writing topics. Source status in the CSV refers to chapter scope and supporting citations, not editorial approval.

## Feature evidence

| Feature | Audit status and evidence |
| --- | --- |
| Learn This Topic, Explain This Question, Teach Me From the Basics, Learn Everything Behind This Question | Partially working. Code and recorded connected browser tests cover profiled items. 25 hosted items have complete profiles in the workspace. |
| Show Prerequisites | Partially working. Clickable concept paths are rendered on applicable profiles and chapters. Cross-chapter dependencies are absent. |
| Show Another Solution, Practice Similar Questions | Dedicated question controls not implemented. Worked examples and general topic drills exist. |
| Timed Practice, Mistake Notebook, Spaced Review, Adaptive Practice | Working in previously tested local builds connected to hosted Supabase. Deployment at a public production URL was not tested. |
| Timed Mastery Retest | Blocked on hosted Supabase. The counts RPCs both return PGRST202. Local regression evidence exists for the database implementation. |
| Diagnostic Test | Partially working. Previous connected browser tests submitted its short core diagnostic. Inventory is 12 items with no optional Science diagnostic. |
| Full Mock Exam | Blocked. Local core draft counts match a form by length. There are no released mock pools or reviewed forms. |
| Dashboard, Bookmarks, Continue Learning | Working in previously tested connected local builds. Production URL, long-term persistence, and current cross-account behavior were not retested in this read-only audit. |
| Essay Practice | Working in previously tested connected local builds for a single timed prompt. Annotated responses, a larger prompt pool, and official scoring are unavailable. |

## Official ACT comparison

The ACT section guide lists English 50/35 minutes, Math 45/50, Reading 36/40, optional Science 40/40, and optional Writing one essay/40. The hosted exam templates match those lengths. The corresponding scored multiple-choice counts are 40/41/27/34, and embedded test items are unscored. The current Composite uses English, Math, and Reading on a 1–36 scale. ACT provides official paper and digital forms with scoring materials. Sources accessed November 23, 2026. [Section guide](https://www.act.org/content/act/en/products-and-services/the-act/test-preparation/act-exam-sections-and-structure.html) · [Scores and category weights](https://www.act.org/content/act/en/products-and-services/the-act/scores/understanding-your-scores.html) · [Official practice](https://www.act.org/content/act/en/products-and-services/the-act/test-preparation/free-act-test-prep.html)

## Planning targets

| Subject | Unique | Published | Verified review evidenced | Target | Additional unique items | Written target achieved |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Math | 172 | 35 | 0 | 1,800 | 1,628 | 9.56% |
| English | 84 | 22 | 0 | 1,400 | 1,316 | 6.00% |
| Reading | 53 | 17 | 0 | 1,100 | 1,047 | 4.82% |
| Science | 11 | 11 | 0 | 700 | 689 | 1.57% |
| Total | 320 | 85 | 0 | 5,000 | 4,680 | 6.40% |

## Production gates and limits

P0 verified live: configured legacy privileged authentication still succeeds, and public signup reports enabled. P1 verified live: course and chapter RPCs are unavailable and the editorial relation is absent from the REST schema. Schema and migrations define RLS and revoke question access from browser roles. The anonymous attempt count was zero. Other anonymous HEAD results did not provide conclusive permission status. Current authenticated cross-user RLS and deployment-level persistence remain untested in this audit. Follow the [security runbook](security-cutover.md) before live release.

Mapping is 71/71 of the current internal map. There is no official denominator for exact topic-title mapping. Detailed instruction is 11/71 (15.5%), and fully ready chapters are 0/71. Question quantity is 320/5,000 (6.40%). Independently approved items evidenced are 0/320. Learning profiles cover 129/320 (40.3%) overall and 25/85 (29.4%) hosted. Local functionality uses passing automated tests as a coverage-limited proxy. Verified production readiness for the four audited release gates (credential, signup, course/chapter retests, editorial ledger) is 0/4. These figures measure separate things.

[Every chapter](chapter-by-chapter-coverage.csv) · [Every question](question-bank-full-inventory.csv) · [Prerequisites](prerequisite-coverage.md) · [Missing requirements](missing-curriculum-requirements.md) · [Roadmap](act-completion-roadmap.md)

The current read-only local run passed 27/27 unit tests (100% of these scoped tests). This percentage does not measure how many of the 17 student feature areas are complete. Two signed-out browser checks passed in the Sentence Boundaries batch. A fresh authenticated browser suite was outside this batch. Prior verification evidence is recorded in [the production audit](production-readiness-audit.md) and [the learning verification record](deep-learning-verification.md).
