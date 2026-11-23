# ACT Mastery

Private ACT preparation for one approved student targeting a 34–36 composite. The app uses Next.js App Router, Supabase Auth and PostgreSQL, Zod, KaTeX, Recharts, Vitest, and Playwright.

See the [production-readiness audit](docs/production-readiness-audit.md) and [topic-by-difficulty inventory](docs/production-readiness-inventory.csv) for release blockers and coverage.

## Local setup

1. Use Node.js 22 LTS or newer and run `npm ci`.
2. Create a Supabase project. In Authentication settings, disable new-user signups and keep email/password authentication enabled. In Authentication → Users, manually create and confirm the student account. The email must match `ALLOWED_STUDENT_EMAIL`.
3. Run the following files in the Supabase SQL Editor in order. For an existing installation that applied the starter schema and seed, begin with the migrations and keep the original attempts.

   1. `supabase/schema.sql`
   2. `supabase/seed.sql`
   3. `supabase/migrations/001_sessions.sql`
   4. `supabase/migrations/002_tutor.sql`
   5. `supabase/migrations/003_curriculum.sql`

4. Generate the three supplemental seed SQL files, run them in the SQL Editor, then apply `supabase/migrations/004_course_practice.sql` for difficulty filters and unseen topic tests. Apply `supabase/migrations/005_audit_question_clarity.sql` to existing installations to correct earlier question wording.

   ```sh
   npm run bank:check
   node scripts/bank.mjs content/starter.json --sql > /tmp/act-mastery-starter.sql
   node scripts/bank.mjs content/practice-expansion.json --sql > /tmp/act-mastery-practice.sql
   node scripts/bank.mjs content/quadratic-practice.json --sql > /tmp/act-mastery-quadratics.sql
   ```

5. Copy `.env.example` to `.env.local`. Set these four values from the Supabase project settings and the student's account.

   | Variable | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key or legacy anon key |
   | `SUPABASE_SECRET_KEY` | Secret key for privileged server queries. The app accepts `SUPABASE_SERVICE_ROLE_KEY` during migration. |
   | `ALLOWED_STUDENT_EMAIL` | The manually approved account email |

6. Run `npm run dev` and open `http://localhost:3000`. Sign in and open **Dashboard → Take the diagnostic**.

The service-role key and AI key belong only in server environment variables. Keep source, database exports, and student credentials private. For optional tutor access, set both `ACT_TUTOR_OPENAI_KEY` and `ACT_TUTOR_MODEL` to credentials and a Responses API model available to your OpenAI project. Skill hints send a topic. Explanation and follow-up requests send item text, the authored explanation, and the student’s follow-up to the configured provider.

## Private GitHub repository and Vercel

1. Create an empty **private** repository at [GitHub](https://github.com/new). Confirm `.env.local` is excluded before staging files.
2. Initialize, commit, and push the workspace.

   ```sh
   git init -b main
   git check-ignore .env.local
   git add .
   git diff --cached --stat
   git commit -m "Build ACT Mastery study workspace"
   git remote add origin https://github.com/YOUR_ACCOUNT/act-mastery.git
   git push -u origin main
   ```

3. Import that repository in [Vercel](https://vercel.com/new), select Next.js, use the repository root, and choose Node.js 22.x or newer. Add the four required environment variables for Production. Use a separate Supabase project and account if enabling Preview access.
4. Deploy, then set the deployed origin as the Site URL in Supabase Authentication → URL Configuration. Smoke-test an unauthenticated dashboard visit, approved login, answer persistence after reload, and sign-out on the deployed URL.

No remote GitHub repository, live Supabase project, or Vercel deployment was configured in this workspace.

## Enhanced ACT format

| Section | Items | Standard minutes |
| --- | ---: | ---: |
| English | 50 | 35 |
| Math | 45 | 50 |
| Reading | 36 | 40 |
| Science (optional) | 40 | 40 |
| Writing (optional) | 1 essay | 40 |

The section configuration lives in `exam_templates`. The app shows raw practice accuracy and tracks entered official practice-form section scores separately. ACT’s enhanced composite averages English, Math, and Reading. Use the official scoring guide for the specific practice form to get scaled scores. See [ACT exam structure](https://www.act.org/content/act/en/products-and-services/the-act/test-preparation/act-exam-sections-and-structure.html), [ACT score reporting](https://www.act.org/content/act/en/products-and-services/the-act/scores/understanding-your-scores.html), and [official free practice tests](https://www.act.org/content/act/en/products-and-services/the-act/test-preparation/free-act-test-prep.html).

The supplied bank contains **85 original items after importing all three batches**, including 12 original diagnostic holdouts, six passage groups, and one separate essay prompt. It supports a nine-item first diagnostic, practice, and short timed drills. A full mock requires 50 unseen English, 45 Math, and 36 Reading questions per student, plus 40 Science if selected. The seed is too small for a full mock. Use the official free practice forms while building the bank. Internal mock results currently count every item, and section deadlines roll straight into the next section. Writing is practiced separately with self-review.

## Bank growth and review

Use original or licensed material. Keep exact provenance and license details with every item. Keep holdouts out of practice and avoid near-duplicates across pools.

1. Assign a batch of 25–50 distinct items to syllabus objectives. Vary difficulty, context, answer position, and distractor error patterns. Compose complete passage groups together. Reserve full forms and calibration items in the holdout pool.
2. Write JSON as `{ "passages": [...], "items": [...] }`. JSON item objects accept `slug`, `version`, `subject`, `topic`, `subtopic`, `objective`, `difficulty` (1–5), `passage` (slug), `prompt`, `choices` (4–5 strings), `correctIndex` (zero-based), `explanation`, `distractors` (letter to explanation), `seconds`, `provenance`, `tags`, `holdout`, and `status`. The checked-in starter uses a compact tuple encoding expanded by the importer.
3. For CSV use those same columns. Encode `choices`, `tags` and `distractors` as JSON inside properly quoted CSV cells. Load named passages separately first. A passage has `slug`, `title`, `body`, and optional `figure`. Figures support a labeled table, numeric two-column bars via `kind: "bars"`, or a diagram with `kind: "diagram"`, `caption`, `description`, and `shapes` containing labeled polyline points in 0–100 coordinates. Use inline dollar delimiters for KaTeX.
4. Run `node scripts/bank.mjs path/to/batch.json` (or use the CSV path), and review all flagged failures. The importer checks form, answer range, duplicate choices, duplicate normalized prompts within the batch, distractor references, and figure structure. Numeric answer checks for a subset of the starter run with unit tests.
5. Have another reviewer solve each item blind, verify that each distractor fails for the intended reason, check the worked explanation and rights, and compare with the existing bank for near duplicates. Use `status: "draft"` until review. The supplied items are enabled for practice, with independent editorial review pending.
6. Generate transactional SQL with `node scripts/bank.mjs path/to/batch.json --sql` and apply to a test project before production. Reimport an identical revision with `status: "verified"` to activate it. Increment `version` for edits to a published item. An activated newer version retires earlier verified versions while preserving past session references. A changed passage should use a new slug.
7. Track counts and coverage by topic, difficulty, and pool after each batch. A 5,000-item collection depends on authoring and independent review. The included seed is the current inventory.

## Verification

```sh
npm run lint
npm run typecheck
npm test
npm run bank:check
npm run build
npx playwright install chromium
npm run test:e2e
```

For the authenticated Playwright scenario set `E2E_STUDENT_EMAIL` and `E2E_STUDENT_PASSWORD` for a disposable approved student in a seeded project. It creates practice history. Anonymous browser checks can run without a Supabase project. To test with a disposable PostgreSQL/Supabase database, apply the schema, migrations, and both seeds, then run `psql "$TEST_DATABASE_URL" -f tests/database.sql`. The SQL suite tests answer privacy, cross-account isolation, selection, persistence, grading, review, expiry, and multi-section submission using reduced template sizes. Its changes roll back.

## Implementation milestones

| Milestone | Main files and result |
| --- | --- |
| 1–3 · Workspace, architecture, privacy | Reused the existing Next.js app and initial Supabase schema. Added private tables and atomic session RPCs in `supabase/migrations/`. Explicit approved-email checks protect server pages and operations. |
| 4 · Design and dashboard | `src/app/globals.css`, `src/components/nav.tsx`, and dashboard/settings pages provide responsive layouts, theme preferences, and stored activity metrics. |
| 5 · Original bank and player | `content/starter.json`, `scripts/bank.mjs`, and practice/study routes implement import validation, question sessions, formatted passages, and answer persistence. |
| 6 · Diagnostic and reflection | Analytics and mistakes routes provide unseen baseline results, first/repeat comparisons, time distributions, and self-classified errors. |
| 7 · Exams and planner | Session deadlines use the database clock. The planner stores daily checklist completion and workload. Full mock availability depends on bank inventory. |
| 8 · Tutor and adaptive selection | Tutor answers are gated by mode and grading state. Selection considers weak topics, calibrated-by-rule difficulty, recency, recent slow answers, prior misses, and review due dates. |
| 9–10 · Verification and setup | `tests/`, package scripts, migrations, and this README cover local checks and external setup. Run authenticated and provider checks against your own test services. |

Lessons are starter examples for each subject. The syllabus outlines reporting categories and major skills. Additional curriculum writing, independent item review, and multiple full mock forms remain content work. Mastery is a first-response estimate and excludes holdouts. The diagnostic provides limited evidence per topic.


## Deep-learning coverage

Open **Textbook → Quadratic Equations** for the four-level chapter. The [textbook guide](docs/quadratic-textbook.md) lists its 10 lessons, new topic bank, and hosted setup for concept-specific retests. The [Proportional Reasoning milestone](docs/proportional-reasoning.md) documents its eight lessons and the review workflow for its 40-item draft bank.

The previous course milestones began with **Syllabus → Functions**. The syllabus also includes detailed Quadratics, English Sentence Boundaries, Reading Inference, Science Experimental Design, and Writing Analyze Perspectives courses. Each lesson has original examples and a guided check. Completing the check saves progress to the student account. The math scratchpad uses local browser storage. The syllabus shows actual practice inventory and labels incomplete courses.

Before this expansion, the live bank contained 38 questions across Math (13), English (11), Reading (11), and Science (3). There were five brief lesson notes and no deep courses. The new bank adds 47 questions, for Math (35), English (22), Reading (17), and Science (11), including diagnostic holdouts. Writing has a separate essay prompt. The source library records official specifications and instructional references with access dates and reuse terms. External questions, passages, and textbook examples were not imported.

The course milestone supplies six topics with 10 lessons, 30 original worked examples, and 10 guided exercises. Practice-batch schema checks cover valid options, answer indexes, duplicate prompts within each batch, and passage references. An independent editorial review remains pending. The 131 authored core simulation items in `content/mock/` are drafts and stay out of the live bank and official benchmarks.

With migration 004, independent practice chooses counts and difficulty within the course's linked topics. A topic test requires previously unassigned questions, runs under a server deadline, and withholds answers until submission. The evidence panel counts only the first graded response to a question family, excludes correct guesses from the numerator, and requires successful timed unseen items. Adjust thresholds in `src/lib/courses/mastery.ts`. If migration 004 is pending, the lessons, guided progress, and standard practice still run while the dedicated unseen checks stay unavailable.

For existing hosted projects, apply migration 004 once in Supabase SQL Editor. If the practice expansion was imported afterward, re-run only the final question-tag UPDATE against the imported rows when desired. The service-role Data API permissions do not apply schema migrations. Run `psql "$TEST_DATABASE_URL" -f tests/course-database.sql` against a disposable fully seeded instance to test difficulty, unseen selection, rollback, and session timing.
