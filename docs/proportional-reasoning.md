# Proportional Reasoning milestone

Open **Textbook → Proportional reasoning**. The eight-lesson chapter is available with expandable examples, comparison tables, hints, guided checkpoints, bookmarks, and saved progress. The existing `ratios-and-rates` lesson and its checkpoint key are preserved.

| Level | Lessons and prerequisites |
| --- | --- |
| Beginner | Part-to-part and part-to-whole ratios lead to unit rates and weighted rate comparisons. |
| Intermediate | Unit rates lead to unit conversion and direct proportions, including fixed fees and constant-ratio tables. |
| ACT Standard | Ratio and proportion skills lead to percent bases, sequential changes, and similarity with length, area, and volume factors. |
| Advanced 34–36 | Direct and inverse variation, simultaneous rates, weighted averages, practical constraints, and multistep models build on the earlier lessons. |

There are 8 lessons, 24 original worked examples, 3 comparison tables, and 8 guided checkpoints. The 40-item draft bank has 5 questions per concept, with 6, 9, 10, 9, and 6 questions at difficulty levels 1 through 5 respectively. It includes 40 distinct objectives, 120 wrong-choice explanations, per-choice lesson links, estimated solving times, and provenance. Chapter quizzes draw across concepts. Focused tests draw unseen items for the selected concept. A bank of five per concept supports a first check and a short retest. Repeated testing will exhaust an individual pool, especially when a student filters to one difficulty band.

ACT lists rates, percentages, and proportional relationships under Integrating Essential Skills. OpenStax informed the scope of the instructional material. The OpenStax texts are licensed CC BY-NC-SA 4.0, with separate terms possible for third-party assets. The chapter links to them and uses original wording, questions, and tables. [ACT Mathematics Test](https://www.act.org/content/act/en/products-and-services/the-act/test-preparation/description-of-math-test.html) · [OpenStax ratios and rate](https://openstax.org/books/prealgebra-2e/pages/5-6-ratios-and-rate) · [OpenStax percentages](https://openstax.org/books/prealgebra-2e/pages/6-2-solve-general-applications-of-percent) · [OpenStax proportions](https://openstax.org/books/prealgebra-2e/pages/6-5-solve-proportions-and-their-applications) · [OpenStax variation](https://openstax.org/books/college-algebra-2e/pages/5-8-modeling-using-variation) · [Prealgebra license](https://openstax.org/books/prealgebra-2e/pages/preface)

## Editorial and release state

| Inventory | Count |
| --- | ---: |
| New questions authored and automatically checked | 40 |
| New questions independently reviewed | 0 |
| New questions published | 0 |
| New diagnostic or mock holdouts | 0 |
| Earlier Proportional Reasoning drafts kept separate | 3 |

Apply missing hosted migrations in order, including `004_course_practice.sql`, `007_chapter_retests.sql`, and `008_chapter_editorial_release.sql`, after following the existing [backup and security runbook](security-cutover.md). Then stage the bank as drafts from the approved SQL Editor connection:

```sh
node scripts/bank.mjs content/proportional-reasoning-draft.json
node scripts/bank.mjs content/proportional-reasoning-draft.json --sql > /tmp/act-proportions-drafts.sql
```

After the reviewer solves and approves the exact revision, a project owner can call `public.release_chapter_practice('<reviewed bank key>')` in the SQL Editor. See the [editorial checklist](editorial-review.md). The separate publication action checks the latest review against a snapshot of the current revision, including skill, remediation, and source tags. The protected batch cannot enter the diagnostic or mock pools. Difficulty labels are authored practice levels.

## Verification and remaining curriculum

Validation covers exact duplicates across the published, mock, priority, and textbook batches, all 40 recomputed answer keys, the concept dependency graph, reference IDs and lesson URLs, per-choice tutoring feedback, and personalized review from repeated prerequisite errors. The rollback-only SQL suite verifies that draft questions are ineligible, a later request for changes blocks release, changed metadata needs review, and released fixtures can produce a timed unseen retest and graded evidence. Hosted questions, scores, and student progress were preserved.

This is the second four-level instructional chapter. Other courses still have selected lessons, and 60 mapped topics lack a detailed course. Linear Equations is the next foundational gap before expanding Systems and Inequalities. The Proportional Reasoning bank still needs a human review, hosted migrations, and an approved release.

The production browser audit opened all 29 authored lessons in the workspace, expanded every worked solution, and checked both wrong and correct guided responses. The release controls and live grading path for staged Proportional Reasoning items were verified in the local database fixture. The hosted browser used only existing student-eligible content and disposable accounts.
