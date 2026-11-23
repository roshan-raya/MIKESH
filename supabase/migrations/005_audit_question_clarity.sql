begin;

-- Keep the keyed answers and question IDs so historical attempts remain valid.
update public.questions
set prompt='Which sentence uses a comma to set off the introductory phrase without splitting the main clause?',
    explanation='The comma in choice B marks the end of the introductory phrase. Choice A omits the comma, and choices C and D split phrases incorrectly.'
where subject='ENGLISH' and topic='Punctuation' and bank_key is null
  and prompt='Choose the sentence with correct punctuation.' and correct_answer='B'
  and options @> '[{"id":"B","text":"After lunch, we went home."}]';

update public.questions
set prompt='Which replacement for “too large to upload over the library’s connection” in sentence 3 most precisely explains why the uploads failed?'
where bank_key='ag03@1' and correct_answer='C'
  and prompt='The writer wants to specifically identify the obstacle in sentence 3. Which replacement for “too large” does that best?';

update public.questions
set options=jsonb_set(options,'{0,text}',to_jsonb('The organizers moved the class to a smaller room because fewer people signed up than expected.'::text))
where bank_key='px-e07@1' and correct_answer='A'
  and options->0->>'text'='The organizers moved the class to a smaller room after fewer people signed up than expected.';

commit;
