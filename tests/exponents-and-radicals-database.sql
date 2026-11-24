\set ON_ERROR_STOP on
begin;

do $$
declare
  k constant text := 'chapter-practice-er-01@1';
  item uuid;
begin
  if (select count(*) from questions where bank_key like 'chapter-practice-er-%' and status='draft' and not holdout)<>15 then
    raise exception 'Expected 15 staged practice drafts';
  end if;
  if exists(select 1 from chapter_question_candidates(gen_random_uuid(),'MATH',array['Exponents and radicals'],array['integer-powers'])) then
    raise exception 'A draft is eligible for focused practice';
  end if;
  begin
    perform release_chapter_practice(k);
    raise exception 'Unapproved question released' using errcode='22000';
  exception when check_violation then null;
  end;
  perform record_question_editorial_review(k,'SQL test fixture','approved',array['https://example.test/math'],
    'Synthetic approval for rollback-only draft and eligibility check',true,true,true,true);
  item:=release_chapter_practice(k);
  if not exists(select 1 from chapter_question_candidates(gen_random_uuid(),'MATH',array['Exponents and radicals'],array['integer-powers'])
    where id=item and unseen) then raise exception 'Approved revision was not eligible'; end if;
end
$$;
rollback;
