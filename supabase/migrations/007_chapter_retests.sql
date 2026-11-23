begin;

alter table public.course_tests add column concepts text[] not null default '{}';

create function public.chapter_question_candidates(p_user uuid,p_subject text,p_topics text[],p_concepts text[])
returns table(id uuid,passage_id uuid,topic text,difficulty integer,unseen boolean)
language sql stable set search_path=public,pg_catalog as $$
  with exposed as (
    select coalesce(split_part(q.bank_key,'@',1),q.id::text) as family
    from session_questions sq join sessions s on s.id=sq.session_id
    join questions q on q.id=sq.question_id
    where s.user_id=p_user and q.subject=p_subject
    union
    select coalesce(split_part(q.bank_key,'@',1),q.id::text)
    from attempts a join questions q on q.id=a.question_id
    where a.user_id=p_user and q.subject=p_subject
  )
  select q.id,q.passage_id,q.topic,q.difficulty,exposed.family is null
  from questions q
  left join exposed on exposed.family=coalesce(split_part(q.bank_key,'@',1),q.id::text)
  where q.status='verified' and not q.holdout and q.subject=p_subject
    and q.topic=any(p_topics) and q.subtopic=any(p_concepts)
$$;

create function public.chapter_question_counts(p_user uuid,p_subject text,p_topics text[],p_concepts text[])
returns table(topic text,difficulty integer,total bigint,unseen bigint)
language sql stable set search_path=public,pg_catalog as $$
  select q.topic,q.difficulty,count(*),count(*) filter(where q.unseen)
  from chapter_question_candidates(p_user,p_subject,p_topics,p_concepts) q
  group by q.topic,q.difficulty
$$;

create function public.start_chapter_session(p_user uuid,p_subject text,p_topics text[],p_concepts text[],
  p_count integer,p_low integer,p_high integer,p_mastery boolean)
returns uuid language plpgsql set search_path=public,pg_catalog as $$
declare
  session_key uuid;
  assigned integer;
  duration integer;
begin
  if p_count not between 1 and 20 or p_low not between 1 and 5 or p_high not between p_low and 5
    or coalesce(cardinality(p_topics),0)=0 or coalesce(cardinality(p_concepts),0)=0 then
    raise exception 'Choose a chapter concept and a valid question count';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_user::text,0));
  if exists(select 1 from sessions where user_id=p_user and finished_at is null
    and mode in ('diagnostic','mock','timed')) then
    raise exception 'Finish the active assessment before starting another session';
  end if;

  if p_mastery then
    select ceil(minutes*60.0*p_count/question_count)::integer into duration
    from exam_templates where subject=p_subject and subject<>'WRITING';
    if not found then raise exception 'This subject does not use a multiple-choice chapter quiz'; end if;
  end if;

  insert into sessions(user_id,mode,deadline)
  values(p_user,case when p_mastery then 'timed' else 'topic' end,
    clock_timestamp()+make_interval(secs=>duration)) returning id into session_key;
  insert into session_sections values(session_key,1,p_subject,duration);

  with picked as (
    select candidate.id,candidate.passage_id,random() as ordering
    from chapter_question_candidates(p_user,p_subject,p_topics,p_concepts) candidate
    where candidate.difficulty between p_low and p_high and (not p_mastery or candidate.unseen)
    order by candidate.unseen desc,ordering limit p_count
  )
  insert into session_questions(session_id,position,section,question_id)
  select session_key,row_number() over(order by passage_id nulls last,ordering),1,id from picked;
  get diagnostics assigned=row_count;
  if assigned<>p_count then raise exception 'Only % eligible questions remain for this concept.',assigned; end if;
  if p_mastery then insert into course_tests(session_id,user_id,concepts) values(session_key,p_user,p_concepts); end if;
  return session_key;
end
$$;

revoke all on function public.chapter_question_candidates(uuid,text,text[],text[]),
  public.chapter_question_counts(uuid,text,text[],text[]),
  public.start_chapter_session(uuid,text,text[],text[],integer,integer,integer,boolean)
  from public,anon,authenticated;
grant execute on function public.chapter_question_candidates(uuid,text,text[],text[]),
  public.chapter_question_counts(uuid,text,text[],text[]),
  public.start_chapter_session(uuid,text,text[],text[],integer,integer,integer,boolean) to service_role;

update public.questions set subtopic=case bank_key
  when 'px-q01@1' then 'multiplication'
  when 'px-q02@1' then 'zero-product'
  when 'px-q05@1' then 'quadratic-formula'
  when 'px-q08@1' then 'quadratic-models'
  else subtopic end
where subject='MATH' and topic='Quadratics'
  and bank_key in ('px-q01@1','px-q02@1','px-q05@1','px-q08@1');

commit;
