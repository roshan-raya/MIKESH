# Human editorial review

The app uses `questions.status='verified'` as a legacy publication flag. An independently reviewed question requires a named human editor to record a separate decision for the exact revision. Automated checks, prior publication, and authored explanations are not independent verification.

1. Run the bank validation and duplicate checks for the draft batch, then inspect near-duplicates against live items. Keep the `mock-*` batch as draft.
2. Ask a human who did not author the item to solve it without the key. Compare approaches, verify that exactly one answer is defensible, and explain every incorrect answer choice. Check that any displayed prerequisite and learning objective are correct.
3. Read passage-based questions against the full passage and graphics. Verify that citations support the skill and provenance accurately describes original or licensed material. Calibrate difficulty by comparing the item to others at the same level.
4. After applying migration 006, record each decision in the Supabase SQL Editor as a project owner. The reviewer fields identify the actual person who performed the review. For a legacy question with no bank key, pass its question UUID as the exact reference. This SQL is an example shape and contains no approval of a project item.

   ```sql
   select public.record_question_editorial_review(
     '<exact bank key>', '<independent reviewer name>', 'changes_requested',
     array['https://www.act.org/content/act/en/products-and-services/the-act/test-preparation.html'],
     '<specific review comments>', false, false, false, false
   );
   ```

5. Use an approval decision only after all four attestations are true. The ledger captures the item snapshot and never changes publication state. Re-review after a revision changes its prompt, options, explanation, or associated passage.
6. Review a mock at both item and assessment levels. Check the blueprint, passage order and independence, timing, pacing, answer distribution, reading and accessibility, scoring interpretation, and expected correspondence to the chosen external benchmark. Migration 006 deliberately prevents publishing `mock-*` rows. A separately reviewed release migration is required after the complete assessment has been approved.

The student client and runtime service role cannot insert review records or call the review function. No reviewer rows were manufactured for this milestone.

## Chapter practice releases

Migration 008 protects new draft batches whose keys start with `chapter-practice-`. Import them with draft status and without holdout flags. A human records the editorial decision through the existing review process. The project owner then calls `select public.release_chapter_practice('<exact approved bank key>');`. Publication requires the latest decision to approve the exact bank snapshot, including its prerequisites, skills, and remediation. To correct already released material, withdraw the item or prepare a new revision and review it. The earlier chapter and legacy bank are preserved by this migration.

Migration 009 binds protected chapter questions to the passage content captured in their review. Stage it after 008. For an edit to released content, retain the prior passage and add a new passage revision under a new slug, then review and release the new question revisions. The guard rejects in-place edits to passages supporting released protected questions.
