\set ON_ERROR_STOP on
begin;
insert into auth.users(id) values ('00000000-0000-4000-b000-000000000001'),('00000000-0000-4000-b000-000000000002');

do $$
declare
  student uuid := '00000000-0000-4000-b000-000000000001';
  other uuid := '00000000-0000-4000-b000-000000000002';
  practice uuid;
  diagnostic uuid;
  timed uuid;
  mock uuid;
  correct text;
  wrong text;
begin
  if has_table_privilege('authenticated','public.questions','select')
    or has_table_privilege('anon','public.questions','select')
    or has_table_privilege('authenticated','public.attempts','insert')
    or has_function_privilege('authenticated','public.update_study(uuid,uuid,text,int,text,boolean,text,int,text)','execute')
    or not (select relrowsecurity from pg_class where oid='public.session_questions'::regclass) then
    raise exception 'Client access to private grading data';
  end if;

  practice:=start_study(student,'adaptive','MATH',null,1,false);
  select correct_answer, (select option->>'id' from jsonb_array_elements(q.options) option
    where option->>'id'<>q.correct_answer limit 1) into strict correct,wrong
    from session_questions sq join questions q on q.id=sq.question_id where sq.session_id=practice;
  begin
    perform update_study(other,practice,'submit',1,null,false,null,0,null);
    raise exception 'Unexpected access' using errcode='22000';
  exception when raise_exception then null;
  end;
  perform update_study(student,practice,'save',1,wrong,true,'guess',31,null);
  if not exists(select 1 from session_questions where session_id=practice and answer=wrong and flagged and confidence='guess' and seconds=31 and not graded)
    or exists(select 1 from attempts where session_id=practice) then raise exception 'Save persistence failed'; end if;
  perform update_study(student,practice,'check',1,wrong,true,'guess',32,null);
  perform update_study(student,practice,'check',1,correct,true,'sure',33,null);
  perform update_study(student,practice,'submit',1,null,false,null,0,null);
  if (select count(*) from attempts where session_id=practice and selected_answer=wrong and not is_correct)<>1
    or not exists(select 1 from review_items where user_id=student and interval_days=1)
    then raise exception 'Expected one graded miss and a review item'; end if;

  diagnostic:=start_study(student,'diagnostic',null,null,3,false);
  if (select count(*) from session_questions sq join questions q on q.id=sq.question_id where sq.session_id=diagnostic and q.holdout)<>9
    then raise exception 'Expected nine unseen assessment questions'; end if;
  begin
    perform update_study(student,diagnostic,'check',1,'A',false,null,0,null);
    raise exception 'Assessment permitted checking an answer' using errcode='22000';
  exception when raise_exception then null;
  end;
  perform update_study(student,diagnostic,'submit',1,null,false,null,0,null);
  perform update_study(student,diagnostic,'submit',1,null,false,null,0,null);
  if (select section from sessions where id=diagnostic)<>2 or exists(select 1 from attempts where session_id=diagnostic)
    then raise exception 'Duplicate submission advanced another section or disclosed early grading'; end if;
  perform update_study(student,diagnostic,'submit',2,null,false,null,0,null);
  perform update_study(student,diagnostic,'submit',3,null,false,null,0,null);
  if (select count(*) from attempts where session_id=diagnostic and selected_answer='Unanswered')<>9 then
    raise exception 'Assessment did not grade all questions at completion';
  end if;

  timed:=start_study(student,'timed','MATH',null,1,false);
  if not exists(select 1 from sessions where id=timed and deadline>clock_timestamp()) then raise exception 'No timer'; end if;
  update sessions set deadline=clock_timestamp()-interval '1 second' where id=timed;
  begin
    perform update_study(student,timed,'save',1,'A',false,null,0,null);
    raise exception 'Accepted a late write' using errcode='22000';
  exception when raise_exception then null;
  end;
  perform update_study(student,timed,'submit',1,null,false,null,0,null);

  -- Reduce templates to exercise a complete multi-section mock with the supplied holdout pool.
  update exam_templates set question_count=1 where not optional;
  mock:=start_study(student,'mock',null,null,1,false);
  if exists(select 1 from session_questions fresh join session_questions prior using(question_id)
    where fresh.session_id=mock and prior.session_id=diagnostic) then raise exception 'Reused unseen item'; end if;
  perform update_study(student,mock,'submit',1,null,false,null,0,null);
  perform update_study(student,mock,'submit',2,null,false,null,0,null);
  perform update_study(student,mock,'submit',3,null,false,null,0,null);
  if not exists(select 1 from sessions where id=mock and finished_at is not null) then
    raise exception 'Mock remained active';
  end if;
end
$$;

set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-b000-000000000002',true);
do $$
begin
  if exists(select 1 from public.attempts) then raise exception 'Attempt RLS exposed another student'; end if;
end
$$;
reset role;
rollback;
