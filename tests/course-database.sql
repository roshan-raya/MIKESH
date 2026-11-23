\set ON_ERROR_STOP on
begin;
insert into auth.users(id) values ('00000000-0000-4000-b000-000000000011');
set local role service_role;
do $$
declare
  student uuid:='00000000-0000-4000-b000-000000000011';
  initial uuid;
  followup uuid;
  first_key text;
  before_count bigint;
  after_count bigint;
begin
  select sum(unseen) into before_count from public.course_question_counts(student,'MATH',array['Functions']);
  if before_count < 6 or before_count is null then raise exception 'Functions practice seed missing'; end if;

  initial:=public.start_course_session(student,'MATH',array['Functions'],2,4,5,false);
  if (select count(*) from public.session_questions sq join public.questions q on q.id=sq.question_id
      where sq.session_id=initial and q.difficulty>=4)<>2 then raise exception 'Difficulty filter failed'; end if;

  select sum(unseen) into after_count from public.course_question_counts(student,'MATH',array['Functions']);
  if after_count<>before_count-2 then raise exception 'Unseen count is incorrect'; end if;
  followup:=public.start_course_session(student,'MATH',array['Functions'],3,1,5,true);
  if exists(select 1 from public.session_questions a join public.session_questions b using(question_id)
    where a.session_id=initial and b.session_id=followup) then raise exception 'Mastery check reused a seen item'; end if;
  if not exists(select 1 from public.course_tests ct join public.sessions s on s.id=ct.session_id
    where ct.session_id=followup and ct.user_id=student and s.deadline>clock_timestamp()) then raise exception 'Timed check was not recorded'; end if;
  select q.correct_answer into first_key from public.session_questions sq
    join public.questions q on q.id=sq.question_id where sq.session_id=followup and sq.position=1;
  perform public.update_study(student,followup,'save',1,first_key,false,'sure',42,null);
  perform public.update_study(student,followup,'submit',1,null,false,null,0,null);
  if not exists(select 1 from public.attempts where session_id=followup and user_id=student and is_correct
    and confidence='sure' and seconds=42) then raise exception 'Unseen timed evidence was not recorded'; end if;
  begin
    perform public.start_course_session(student,'MATH',array['Functions'],20,1,5,true);
    raise exception 'Short assessment accepted' using errcode='22000';
  exception when raise_exception then null;
  end;
  if (select count(*) from public.sessions where user_id=student)<>2 then raise exception 'Failed start left an incomplete session'; end if;
end
$$;
reset role;
rollback;
