# Question-to-concept textbook

Open **Textbook → Quadratic Equations**. A graded question can open its concept map, a lesson chosen from its particular wrong answer, or the beginning of the chapter. Existing question IDs, grades, progress markers, and lesson links are preserved.

## Quadratic Equations chapter

| Level | Concepts |
| --- | --- |
| Beginner | Variables and equations, signed multiplication and distribution, exponents and square roots |
| Intermediate | Polynomial standard form, factoring, and the zero-product property |
| ACT Standard | Completing the square, the quadratic formula and discriminant, and roots and vertex |
| Advanced 34–36 | Constrained quadratic models and relationships between roots |

The chapter has 10 lessons, 30 expandable worked examples, 10 guided checkpoints, a signed-product grid, a plotted parabola with a text alternative, a scratchpad, saved bookmarks, and an automatically selected next uncompleted checkpoint. The concept graph provides clickable prerequisite paths. All four levels have their own entry point. ACT Algebra and Functions define the subject alignment. Lesson wording, questions, and visuals are original. OpenStax is a linked reference. Its College Algebra text uses CC BY-NC-SA 4.0. [ACT Mathematics Test](https://www.act.org/content/act/en/products-and-services/the-act/test-preparation/description-of-math-test.html) · [OpenStax quadratic equations](https://openstax.org/books/college-algebra-2e/pages/2-5-quadratic-equations) · [OpenStax license](https://openstax.org/books/college-algebra-2e/pages/preface)

The original eight Quadratics practice questions remain in the hosted bank. The new 24-question seed adds difficulty levels 1–5, at least two questions per concept, specific objectives, and three wrong-choice explanations per question. It produces a 32-question Quadratics pool when installed. The questions are original textbook practice and independent editorial review is pending.

## How remediation and mastery work

- A wrong choice shows its explanation and a concept worth revisiting. Factor-sign mistakes can lead to the zero-product lesson. Cross-term mistakes can lead to signed multiplication. Two distinct question families with current misses pointing to the same concept can trigger a dashboard and chapter recommendation.
- Bookmarks and correct guided checkpoints are stored under the student's account. The original study task records remain in place. The browser scratchpad stays device-local.
- An unseen retest filters by the selected question concept, enforces the deadline in PostgreSQL, and uses the existing server-side grader. It excludes any question family previously assigned, including items from unfinished sessions. There is no silent repeat when a concept pool is exhausted. The chapter quiz can span the entire topic.
- Focused evidence and chapter-wide mastery are shown separately. Chapter mastery requires eight first responses, 80% credited accuracy, three correct difficult responses, and three correct first responses in timed unseen sets. Guided practice and repeated or guessed answers do not count toward a mastery badge.

## Enable the full pool on the hosted project

The hosted project returned `PGRST202` for both course counts and chapter counts during implementation. An owner must follow the [security and backup runbook](security-cutover.md), apply missing migrations in order through `007_chapter_retests.sql`, and then load the new question batch. The app's hosted lesson, bookmark, and existing practice flows work without these new RPCs. The scoped retest displays its database dependency until the migration is installed. The app did not apply either migration or the expanded seed to the hosted database.

```sh
node scripts/bank.mjs content/quadratic-textbook.json --sql > /tmp/act-quadratic-textbook.sql
```

Run the resulting SQL in the authorized project SQL Editor. In a disposable seeded PostgreSQL database, run `tests/chapter-database.sql` and the existing database suites. In staging, run the Playwright suite with both `E2E_COURSE_MIGRATION=1` and `E2E_CHAPTER_MIGRATION=1` and a disposable approved student. Keep the 131 mock drafts out of the seed.

Verify the installed RPC and available chapter bank in the hosted SQL Editor:

```sql
select
  to_regprocedure('public.chapter_question_counts(uuid,text,text[],text[])') as counts,
  to_regprocedure('public.start_chapter_session(uuid,text,text[],text[],integer,integer,integer,boolean)') as start;
select subtopic, count(*) as questions
from public.questions
where subject = 'MATH' and topic = 'Quadratics' and status = 'verified' and not holdout
group by subtopic order by subtopic;
```

Expect both functions to resolve and the inventory to sum to 32 across 10 concepts when starting from the audited eight-item Quadratics pool. The bank's `verified` status controls eligibility for practice. Independent editorial approval is recorded separately.

## Coverage limits

The textbook library, bookmarks, reusable concept graph, and guided checkpoint flow are shared with the existing Math, English, Reading, optional Science, and Writing lessons. Quadratic Equations is the first full four-level chapter. The other nine courses offer selected lessons. In total the workspace has 10 courses and 22 authored lessons. Sixty mapped topics still lack a detailed course. Among the 85 previously published questions, 18 have detailed learning profiles. The new seed adds 24 more profiles in the workspace. Topic-level links for remaining questions are available with their incomplete status visible.
