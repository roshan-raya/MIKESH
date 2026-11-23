\set ON_ERROR_STOP on
begin;

insert into auth.users(id) values ('00000000-0000-4000-b000-000000000022');

do $$
declare
  key text;
  evidence uuid;
begin
  if has_function_privilege('service_role','public.release_chapter_practice(text)','execute')
    or has_function_privilege('authenticated','public.release_chapter_practice(text)','execute')
    or has_function_privilege('anon','public.release_chapter_practice(text)','execute') then
    raise exception 'Release function exposed to a runtime role';
  end if;
  if (select count(*) from questions where bank_key like 'chapter-practice-pr-%')<>40
    or exists(select 1 from questions where bank_key like 'chapter-practice-pr-%'
      and (status<>'draft' or holdout)) then
    raise exception 'Expected the 40 staged practice items and no release';
  end if;

  key:='chapter-practice-pr-21@1';
  begin
    update questions set status='verified' where bank_key=key;
    raise exception 'Unapproved direct promotion succeeded' using errcode='22000';
  exception when check_violation then null;
  end;
  begin
    update questions set holdout=true where bank_key=key;
    raise exception 'Chapter practice became a holdout' using errcode='22000';
  exception when check_violation then null;
  end;

  -- Synthetic approvals exercise the owner path inside this rollback-only fixture.
  evidence:=record_question_editorial_review(key,'SQL test fixture','approved',array['https://example.test/math'],
    'Synthetic test only, entire transaction rolls back',true,true,true,true);
  if not exists(select 1 from question_editorial_reviews where id=evidence and bank_snapshot ? 'tags') then
    raise exception 'Approval snapshot omitted chapter metadata';
  end if;
  perform record_question_editorial_review(key,'SQL test fixture','changes_requested',array['https://example.test/math'],
    'Synthetic test for a later request for changes',true,true,true,true);
  begin
    perform release_chapter_practice(key);
    raise exception 'An earlier approval overrode the current review' using errcode='22000';
  exception when check_violation then null;
  end;

  foreach key in array array['chapter-practice-pr-21@1','chapter-practice-pr-22@1','chapter-practice-pr-23@1'] loop
    perform record_question_editorial_review(key,'SQL test fixture','approved',array['https://example.test/math'],
      'Synthetic test only, entire transaction rolls back',true,true,true,true);
    perform release_chapter_practice(key);
  end loop;
  begin
    update questions set objective='Changed lesson mapping' where bank_key=key;
    raise exception 'Published metadata changed without re-review' using errcode='22000';
  exception when check_violation then null;
  end;
end
$$;

set local role service_role;
do $$
declare
  student uuid:='00000000-0000-4000-b000-000000000022';
  first_set uuid;
  retest uuid;
  answer_key text;
begin
  if (select sum(total) from chapter_question_counts(student,'MATH',array['Proportional reasoning'],array['percent-base']))<>3
    or exists(select 1 from chapter_question_counts(student,'MATH',array['Proportional reasoning'],array['direct-proportion'])) then
    raise exception 'Drafts leaked into practice or a published concept could not be selected';
  end if;
  first_set:=start_chapter_session(student,'MATH',array['Proportional reasoning'],array['percent-base'],1,1,5,false);
  retest:=start_chapter_session(student,'MATH',array['Proportional reasoning'],array['percent-base'],2,1,5,true);

  if exists(select 1 from session_questions q1 join session_questions q2 using(question_id)
    where q1.session_id=first_set and q2.session_id=retest)
    or not exists(select 1 from course_tests t join sessions s on s.id=t.session_id
      where t.session_id=retest and t.user_id=student and t.concepts=array['percent-base'] and s.deadline>now()) then
    raise exception 'The timed retest repeated an item or missed its focus or deadline';
  end if;
  select q.correct_answer into strict answer_key from session_questions sq join questions q on q.id=sq.question_id
    where sq.session_id=retest and sq.position=1;
  perform update_study(student,retest,'save',1,answer_key,false,'sure',20,null);
  perform update_study(student,retest,'submit',1,null,false,null,0,null);
  if not exists(select 1 from attempts where session_id=retest and user_id=student and is_correct and seconds=20) then
    raise exception 'The retest failed to record graded evidence';
  end if;
end
$$;
reset role;
rollback;
