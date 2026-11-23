begin;

create table public.course_tests (
  session_id uuid primary key references public.sessions on delete cascade,
  user_id uuid not null references auth.users on delete cascade
);
create index course_tests_user on public.course_tests(user_id);
alter table public.course_tests enable row level security;
revoke all on public.course_tests from anon,authenticated;
grant select,insert on public.course_tests to service_role;

-- Count only questions the student has never been assigned when preparing a mastery test.
create function public.course_question_counts(p_user uuid, p_subject text, p_topics text[])
returns table(topic text, difficulty int, total bigint, unseen bigint)
language sql stable set search_path=public,pg_catalog as $$
  with exposed as (
    select distinct coalesce(split_part(q.bank_key,'@',1),q.id::text) as family
    from session_questions sq join sessions s on s.id=sq.session_id
    join questions q on q.id=sq.question_id
    where s.user_id=p_user and q.subject=p_subject
    union
    select distinct coalesce(split_part(q.bank_key,'@',1),q.id::text)
    from attempts a join questions q on q.id=a.question_id
    where a.user_id=p_user and q.subject=p_subject
  )
  select q.topic,q.difficulty,count(*),count(*) filter(where exposed.family is null)
  from questions q left join exposed on exposed.family=coalesce(split_part(q.bank_key,'@',1),q.id::text)
  where q.status='verified' and not q.holdout and q.subject=p_subject and q.topic=any(p_topics)
  group by q.topic,q.difficulty
$$;

create function public.start_course_session(p_user uuid, p_subject text, p_topics text[],
  p_count int, p_low int, p_high int, p_mastery boolean)
returns uuid language plpgsql set search_path=public,pg_catalog as $$
declare
  session_key uuid;
  assigned int;
  duration int;
begin
  if p_count not between 1 and 20 or p_low not between 1 and 5 or p_high not between p_low and 5
    or coalesce(cardinality(p_topics),0)=0 then raise exception 'Invalid course practice settings'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user::text,0));
  if exists(select 1 from sessions where user_id=p_user and finished_at is null
    and mode in ('diagnostic','mock','timed')) then
    raise exception 'Finish the active assessment before starting another session';
  end if;
  if p_mastery then
    select ceil(minutes*60.0*p_count/question_count)::int into duration
    from exam_templates where subject=p_subject and subject<>'WRITING';
    if not found then raise exception 'This subject does not use a multiple-choice mastery check'; end if;
  end if;

  insert into sessions(user_id,mode,deadline)
  values(p_user,case when p_mastery then 'timed' else 'topic' end,
    clock_timestamp()+make_interval(secs=>duration)) returning id into session_key;
  insert into session_sections values(session_key,1,p_subject,duration);

  with exposed as (
    select coalesce(split_part(q.bank_key,'@',1),q.id::text) as family
    from session_questions sq join sessions s on s.id=sq.session_id
    join questions q on q.id=sq.question_id where s.user_id=p_user and q.subject=p_subject
    union
    select coalesce(split_part(q.bank_key,'@',1),q.id::text)
    from attempts a join questions q on q.id=a.question_id where a.user_id=p_user and q.subject=p_subject
  ), picked as (
    select q.id,q.passage_id,(exposed.family is null) as unseen,random() as ordering
    from questions q left join exposed on exposed.family=coalesce(split_part(q.bank_key,'@',1),q.id::text)
    where q.status='verified' and not q.holdout and q.subject=p_subject and q.topic=any(p_topics)
      and q.difficulty between p_low and p_high and (not p_mastery or exposed.family is null)
    order by unseen desc,ordering limit p_count
  )
  insert into session_questions(session_id,position,section,question_id)
  select session_key,row_number() over(order by passage_id nulls last,ordering),1,id from picked;
  get diagnostics assigned=row_count;
  if assigned<>p_count then raise exception 'Only % eligible questions remain for this selection.',assigned; end if;
  if p_mastery then insert into course_tests values(session_key,p_user); end if;
  return session_key;
end
$$;

revoke all on function public.course_question_counts(uuid,text,text[]),
  public.start_course_session(uuid,text,text[],int,int,int,boolean) from public,anon,authenticated;
grant execute on function public.course_question_counts(uuid,text,text[]),
  public.start_course_session(uuid,text,text[],int,int,int,boolean) to service_role;

-- Used by course recommendations. Existing attempts keep their question ID and answer.
update public.questions set subtopic=case bank_key
  when 'px-fn01@1' then 'notation' when 'px-fn02@1' then 'composition-inverses'
  when 'px-fn03@1' then 'domain-range' when 'px-fn04@1' then 'transformations'
  when 'px-fn05@1' then 'composition-inverses' when 'px-fn06@1' then 'transformations'
  when 'px-fn07@1' then 'notation' when 'px-fn08@1' then 'transformations'
  when 'm03@1' then 'notation' when 'm08@1' then 'transformations'
  else subtopic end
where subject='MATH' and topic='Functions' and subtopic is null;

commit;
