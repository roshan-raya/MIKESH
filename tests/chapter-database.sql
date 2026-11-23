\set ON_ERROR_STOP on
begin;
insert into auth.users(id) values ('00000000-0000-4000-b000-000000000021');

do $$
begin
  if has_function_privilege('anon','public.chapter_question_counts(uuid,text,text[],text[])','execute')
    or has_function_privilege('authenticated','public.chapter_question_candidates(uuid,text,text[],text[])','execute')
    or has_function_privilege('authenticated','public.start_chapter_session(uuid,text,text[],text[],integer,integer,integer,boolean)','execute') then
    raise exception 'Chapter retest RPC exposed to student role';
  end if;
end
$$;

set local role service_role;
do $$
declare
  student uuid:='00000000-0000-4000-b000-000000000021';
  seen_session uuid;
  timed_session uuid;
  answer_key text;
  assigned_before integer;
begin
  if (select coalesce(sum(total),0) from chapter_question_counts(student,'MATH',array['Quadratics'],array['zero-product']))<3 then
    raise exception 'Quadratic textbook bank is missing';
  end if;
  seen_session:=start_chapter_session(student,'MATH',array['Quadratics'],array['zero-product'],1,1,5,false);
  select sum(unseen) into assigned_before from chapter_question_counts(student,'MATH',array['Quadratics'],array['zero-product']);
  timed_session:=start_chapter_session(student,'MATH',array['Quadratics'],array['zero-product'],2,1,5,true);
  if exists(select 1 from session_questions a join session_questions b using(question_id)
    where a.session_id=seen_session and b.session_id=timed_session) then
    raise exception 'Retest repeats an already assigned question';
  end if;
  if (select count(*) from session_questions a join questions q on q.id=a.question_id
    where a.session_id=timed_session and q.subtopic='zero-product')<>2 then raise exception 'Wrong concept selected'; end if;
  if (select sum(unseen) from chapter_question_counts(student,'MATH',array['Quadratics'],array['zero-product']))<>assigned_before-2 then
    raise exception 'Unseen inventory failed to update';
  end if;
  if not exists(select 1 from course_tests ct join sessions s on s.id=ct.session_id
    where ct.session_id=timed_session and ct.user_id=student and ct.concepts=array['zero-product'] and s.deadline>now()) then
    raise exception 'Missing server timer or concept evidence';
  end if;
  select q.correct_answer into answer_key from session_questions sq join questions q on q.id=sq.question_id
    where sq.session_id=timed_session and sq.position=1;
  perform update_study(student,timed_session,'save',1,answer_key,false,'sure',32,null);
  perform update_study(student,timed_session,'submit',1,null,false,null,0,null);
  if not exists(select 1 from attempts where session_id=timed_session and is_correct and confidence='sure' and seconds=32) then
    raise exception 'Chapter mastery evidence was not graded';
  end if;
end
$$;
reset role;
rollback;
