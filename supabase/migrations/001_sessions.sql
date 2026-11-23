begin;
drop policy if exists attempts_insert_own on public.attempts;
revoke insert, update, delete on public.attempts from anon, authenticated;
revoke all on public.practice_questions from anon, authenticated;

create table public.passages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  body text not null,
  figure jsonb
);

alter table public.questions
  add column bank_key text unique,
  add column version integer not null default 1 check (version > 0),
  add column passage_id uuid references public.passages(id),
  add column difficulty integer not null default 2 check (difficulty between 1 and 5),
  add column subtopic text,
  add column objective text,
  add column distractors jsonb not null default '{}',
  add column seconds integer not null default 60 check (seconds > 0),
  add column provenance text not null default 'Original ACT Mastery starter',
  add column tags text[] not null default '{}',
  add column holdout boolean not null default false;
create index questions_pool on public.questions(subject, holdout, topic) where status='verified';

create table public.exam_templates (
  subject text primary key,
  position int unique not null,
  question_count int not null check(question_count > 0),
  minutes int not null check(minutes > 0),
  optional boolean not null
);
insert into public.exam_templates values
  ('ENGLISH',1,50,35,false), ('MATH',2,45,50,false), ('READING',3,36,40,false),
  ('SCIENCE',4,40,40,true), ('WRITING',5,1,40,true);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  mode text not null check (mode in ('learn','topic','adaptive','diagnostic','timed','mock','review','writing')),
  created_at timestamptz not null default now(),
  finished_at timestamptz,
  section integer not null default 1,
  deadline timestamptz,
  essay text not null default ''
);
create index sessions_user_recent on public.sessions(user_id,created_at desc);
create table public.session_sections (
  session_id uuid references public.sessions on delete cascade,
  position int not null,
  subject text not null,
  duration_seconds int,
  primary key(session_id, position)
);
create table public.session_questions (
  session_id uuid not null references public.sessions on delete cascade,
  position int not null,
  section int not null,
  question_id uuid not null references public.questions,
  answer text,
  flagged boolean not null default false,
  confidence text check (confidence in ('sure','unsure','guess')),
  seconds int not null default 0 check (seconds >= 0),
  graded boolean not null default false,
  primary key(session_id, position),
  unique(session_id, question_id),
  foreign key(session_id,section) references public.session_sections
);
alter table public.attempts
  add column session_id uuid references public.sessions on delete cascade,
  add column confidence text,
  add column seconds int,
  add column error_category text check(error_category in ('concept','careless','timing'));
create unique index attempts_session_question on public.attempts(session_id,question_id);
create index attempts_user_question on public.attempts(user_id,question_id);

create table public.review_items (
  user_id uuid references auth.users on delete cascade,
  question_id uuid references public.questions,
  due_at timestamptz not null,
  interval_days int not null check(interval_days between 1 and 30),
  primary key(user_id,question_id)
);
create table public.profiles (
  user_id uuid primary key references auth.users on delete cascade,
  daily_minutes int not null default 30 check(daily_minutes between 10 and 120)
);
create table public.study_tasks (
  user_id uuid references auth.users on delete cascade,
  task_date date not null,
  task text not null,
  primary key(user_id, task_date, task)
);
create table public.score_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  form text not null,
  taken_on date not null,
  english int not null check(english between 1 and 36),
  math int not null check(math between 1 and 36),
  reading int not null check(reading between 1 and 36)
);

alter table public.passages enable row level security;
alter table public.exam_templates enable row level security;
alter table public.sessions enable row level security;
alter table public.session_sections enable row level security;
alter table public.session_questions enable row level security;
alter table public.review_items enable row level security;
alter table public.profiles enable row level security;
alter table public.study_tasks enable row level security;
alter table public.score_history enable row level security;
revoke all on public.passages, public.exam_templates, public.sessions, public.session_sections,
  public.session_questions, public.review_items, public.profiles, public.study_tasks, public.score_history
  from anon, authenticated;

create function public.practice_topics()
returns table(subject text,topic text) language sql stable set search_path=public,pg_catalog as $$
  select distinct q.subject,q.topic from questions q where q.status='verified' and not q.holdout order by q.subject,q.topic
$$;
revoke all on function public.practice_topics() from public,anon,authenticated;
grant execute on function public.practice_topics() to service_role;

create function public.start_study(p_user uuid, p_mode text, p_subject text, p_topic text, p_count int, p_science boolean)
returns uuid language plpgsql set search_path=public,pg_catalog as $$
declare
  session_key uuid;
  template record;
  section_no int := 0;
  previous_count int := 0;
  inserted_count int;
  wanted int;
  timed_seconds int;
begin
  -- Use the same per-student lock for starts, saves and answer disclosure.
  perform pg_advisory_xact_lock(hashtextextended(p_user::text,0));
  if exists(select 1 from sessions where user_id=p_user and finished_at is null
    and mode in ('diagnostic','mock','timed')) then
    raise exception 'Finish the active assessment before starting another session';
  end if;
  insert into sessions(user_id,mode) values(p_user,p_mode) returning id into session_key;
  for template in select * from exam_templates
    where case
      when p_mode='writing' then subject='WRITING'
      when p_mode in ('mock','diagnostic') then not optional or (p_mode='mock' and p_science and subject='SCIENCE')
      when p_subject is null then subject='ENGLISH'
      else subject=p_subject and subject<>'WRITING'
    end order by position
  loop
    section_no := section_no+1;
    wanted := case when p_mode='mock' then template.question_count
      when p_mode='diagnostic' then 3 else p_count end;
    timed_seconds := case when p_mode in ('mock','writing') then template.minutes*60
      when p_mode='timed' then ceil(template.minutes*60.0*wanted/template.question_count)::int end;
    insert into session_sections values(session_key,section_no,
      case when p_subject is null and p_mode in ('learn','adaptive','review') then 'MIXED' else template.subject end,
      timed_seconds);
    if section_no=1 then
      update sessions set deadline=clock_timestamp()+make_interval(secs=>timed_seconds) where id=session_key;
    end if;
    if p_mode='writing' then continue; end if;
    insert into session_questions(session_id,position,section,question_id)
    select session_key,previous_count+row_number() over (order by pick.passage_id nulls last, pick.priority, pick.id),
      section_no,pick.id
    from (
      select q.id,q.passage_id,
        case when p_mode='adaptive' then
          coalesce(skill.accuracy,0.45) + abs(q.difficulty - case when coalesce(skill.accuracy,0)<0.5 then 2
            when skill.accuracy<0.8 then 3 else 4 end)*0.2
          + case when seen.last_seen > now()-interval '7 days' then 1 else 0 end
          - least(coalesce(seen.misses,0),3)*0.08
          - least(coalesce(skill.seconds_ratio,0),2)*0.08
          - case when review.due_at<=now() then 0.35 else 0 end
        else random() end as priority
      from questions q
      left join review_items review on review.user_id=p_user and review.question_id=q.id
      left join lateral (
        select max(a.created_at) as last_seen,count(*) filter(where not a.is_correct) as misses from attempts a where a.user_id=p_user and a.question_id=q.id
      ) seen on true
      left join lateral (
        select avg(first_try.is_correct::int) as accuracy,avg(first_try.seconds_ratio) as seconds_ratio from (
          select distinct on (coalesce(split_part(prior.bank_key,'@',1),a.question_id::text)) a.is_correct,a.seconds::numeric/prior.seconds as seconds_ratio from attempts a join questions prior on prior.id=a.question_id
          where p_mode='adaptive' and a.user_id=p_user and prior.subject=q.subject and prior.topic=q.topic and not prior.holdout
          order by coalesce(split_part(prior.bank_key,'@',1),a.question_id::text),a.created_at,a.id
        ) first_try
      ) skill on true
      where q.status='verified'
        and (q.subject=template.subject or (p_subject is null and p_mode in ('learn','adaptive','review')))
        and (p_topic is null or q.topic=p_topic)
        and q.holdout=(p_mode in ('mock','diagnostic'))
        and (not q.holdout or not exists(
          select 1 from session_questions old join sessions owner on owner.id=old.session_id
          join questions prior on prior.id=old.question_id
          where owner.user_id=p_user and (prior.id=q.id or
            split_part(prior.bank_key,'@',1)=split_part(q.bank_key,'@',1))))
        and (p_mode<>'review' or review.due_at<=now())
      order by priority,q.id limit wanted
    ) pick;
    get diagnostics inserted_count = row_count;
    if inserted_count=0 or (p_mode in ('mock','diagnostic','timed') and inserted_count<wanted) then
      raise exception 'This mode needs % eligible % questions. Found %.',wanted,template.subject,inserted_count;
    end if;
    previous_count := previous_count+inserted_count;
  end loop;
  if section_no=0 then raise exception 'No matching section'; end if;
  return session_key;
end
$$;

create function public.update_study(p_user uuid, p_session uuid, p_action text, p_position int,
  p_answer text, p_flagged boolean, p_confidence text, p_seconds int, p_essay text)
returns void language plpgsql set search_path=public,pg_catalog as $$
declare
  active sessions%rowtype;
  item record;
  next_seconds int;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user::text,0));
  select * into active from sessions where id=p_session and user_id=p_user for update;
  if not found then raise exception 'Session unavailable'; end if;
  if active.finished_at is not null then
    if p_action='submit' then return; end if;
    raise exception 'Session already submitted';
  end if;
  if p_action in ('save','check') then
    if active.deadline is not null and clock_timestamp()>=active.deadline then
      raise exception 'Time has expired. Submit the saved work.';
    end if;
    if active.mode='writing' and p_action='save' then
      update sessions set essay=left(coalesce(p_essay,''),25000) where id=p_session;
      return;
    end if;
    select sq.*, q.options into item from session_questions sq join questions q on q.id=sq.question_id
      where sq.session_id=p_session and sq.position=p_position and sq.section=active.section;
    if not found then raise exception 'Question unavailable'; end if;
    if p_answer is not null and not item.options @> jsonb_build_array(jsonb_build_object('id',p_answer)) then
      raise exception 'Invalid option';
    end if;
    if item.graded then
      update session_questions set flagged=p_flagged where session_id=p_session and position=p_position;
      return;
    end if;
    if p_action='check' and (active.mode not in ('learn','topic','adaptive','review') or p_answer is null
      or exists(select 1 from sessions where user_id=p_user and finished_at is null
        and mode in ('diagnostic','mock','timed'))) then
      raise exception 'Answer review is unavailable during an assessment';
    end if;
    update session_questions set answer=p_answer, flagged=p_flagged, confidence=p_confidence,
      seconds=greatest(seconds,least(coalesce(p_seconds,0),7200)), graded=(p_action='check')
      where session_id=p_session and position=p_position;
  elsif p_action='submit' then
    if p_position<>active.section then return; end if;
    update session_questions set graded=true where session_id=p_session and section=active.section;
    select duration_seconds into next_seconds from session_sections where session_id=p_session and position=active.section+1;
    if found then
      update sessions set section=section+1, deadline=clock_timestamp()+make_interval(secs=>next_seconds) where id=p_session;
    else
      update sessions set finished_at=clock_timestamp() where id=p_session;
    end if;
  else
    raise exception 'Unknown action';
  end if;

  with new_attempts as (
    insert into attempts(user_id,question_id,subject,selected_answer,is_correct,session_id,confidence,seconds)
    select p_user,q.id,q.subject,coalesce(sq.answer,'Unanswered'),coalesce(sq.answer=q.correct_answer,false),
      p_session,sq.confidence,sq.seconds
    from session_questions sq join questions q on q.id=sq.question_id
    where sq.session_id=p_session and sq.graded
      and (active.mode not in ('mock','diagnostic','timed') or exists(
        select 1 from sessions finished where finished.id=p_session and finished.finished_at is not null))
      and (sq.answer is not null or active.mode in ('mock','diagnostic','timed'))
    on conflict (session_id,question_id) do nothing
    returning question_id,is_correct
  )
  insert into review_items as review(user_id,question_id,due_at,interval_days)
  select p_user,a.question_id,now()+interval '1 day',1 from new_attempts a join questions q on q.id=a.question_id
    where not q.holdout and (not a.is_correct or exists(
      select 1 from review_items r where r.user_id=p_user and r.question_id=a.question_id))
  on conflict (user_id,question_id) do update set
    interval_days=case when (select is_correct from new_attempts where question_id=excluded.question_id)
      then least(30,review.interval_days*2) else 1 end,
    due_at=now()+make_interval(days=>case when (select is_correct from new_attempts where question_id=excluded.question_id)
      then least(30,review.interval_days*2) else 1 end);
end
$$;

revoke all on function public.start_study(uuid,text,text,text,int,boolean) from public,anon,authenticated;
revoke all on function public.update_study(uuid,uuid,text,int,text,boolean,text,int,text) from public,anon,authenticated;
grant execute on function public.start_study(uuid,text,text,text,int,boolean) to service_role;
grant execute on function public.update_study(uuid,uuid,text,int,text,boolean,text,int,text) to service_role;
commit;
