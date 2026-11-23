\set ON_ERROR_STOP on
begin;
do $$
declare
  item_key constant text := 'chapter-practice-sb-01@1';
  passage uuid;
begin
  select passage_id into strict passage from questions where bank_key=item_key;
  if passage is null or (select count(*) from questions where bank_key like 'chapter-practice-sb-%' and status='draft' and not holdout)<>12 then
    raise exception 'Expected twelve staged practice items and real passages';
  end if;
  begin
    perform release_chapter_practice(item_key);
    raise exception 'Unapproved release succeeded' using errcode='22000';
  exception when check_violation then null;
  end;
  perform record_question_editorial_review(item_key,'SQL test fixture','approved',array['https://example.test/english'],
    'Synthetic rollback-only approval for the editorial guard test',true,true,true,true);
  update passages set body=body||' Temporary fixture edit.' where id=passage;
  begin
    perform release_chapter_practice(item_key);
    raise exception 'Release used a stale passage approval' using errcode='22000';
  exception when check_violation then null;
  end;
  perform record_question_editorial_review(item_key,'SQL test fixture','approved',array['https://example.test/english'],
    'Synthetic rollback-only approval for the edited fixture passage',true,true,true,true);
  perform release_chapter_practice(item_key);
  begin
    update passages set title='Unreviewed change' where id=passage;
    raise exception 'Released passage could be edited in place' using errcode='22000';
  exception when check_violation then null;
  end;
end
$$;
rollback;
