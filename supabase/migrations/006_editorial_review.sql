begin;

create table public.question_editorial_reviews (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions,
  bank_key text not null,
  version integer not null check (version>0),
  reviewer text not null check (length(btrim(reviewer)) between 3 and 200),
  decision text not null check(decision in ('changes_requested','approved')),
  reviewed_at timestamptz not null default now(),
  source_urls text[] not null check(cardinality(source_urls)>0),
  reasoning text not null check(length(btrim(reasoning))>=20),
  checklist jsonb not null,
  revision_snapshot jsonb not null
);
alter table public.question_editorial_reviews enable row level security;
revoke all on public.question_editorial_reviews from public,anon,authenticated,service_role;
grant select on public.question_editorial_reviews to service_role;

create function public.record_question_editorial_review(
  p_bank_key text, p_reviewer text, p_decision text, p_sources text[], p_reasoning text,
  p_confirm_correct_key boolean, p_confirm_all_distractors boolean, p_confirm_originality boolean,
  p_confirm_difficulty boolean
) returns uuid language plpgsql set search_path=public,pg_catalog as $$
declare
  item questions%rowtype;
  review_id uuid;
begin
  select * into strict item from questions where coalesce(bank_key,id::text)=p_bank_key for share;
  if p_sources is null or cardinality(p_sources)=0 or exists(
    select 1 from unnest(p_sources) url where url is null or url not like 'https://%'
  ) then raise exception 'Include the reviewed HTTPS references'; end if;

  if p_decision='approved' and
    (p_confirm_correct_key is distinct from true or p_confirm_all_distractors is distinct from true
    or p_confirm_originality is distinct from true or p_confirm_difficulty is distinct from true)
  then raise exception 'Approval requires all editorial checks'; end if;

  insert into question_editorial_reviews(question_id,bank_key,version,reviewer,decision,source_urls,reasoning,checklist,revision_snapshot)
  values(item.id,coalesce(item.bank_key,item.id::text),item.version,btrim(p_reviewer),p_decision,p_sources,p_reasoning,
    jsonb_build_object('correct_key',p_confirm_correct_key,'all_distractors',p_confirm_all_distractors,
      'originality',p_confirm_originality,'difficulty',p_confirm_difficulty),
    jsonb_build_object('prompt',item.prompt,'options',item.options,'correct_answer',item.correct_answer,
      'explanation',item.explanation,'distractors',item.distractors,'passage_id',item.passage_id,'difficulty',item.difficulty,
      'provenance',item.provenance,'passage',(select to_jsonb(p) from passages p where p.id=item.passage_id)))
  returning id into review_id;
  return review_id;
end
$$;
-- Project owners record human decisions from the SQL Editor. The app server cannot self-approve.
revoke all on function public.record_question_editorial_review(text,text,text,text[],text,boolean,boolean,boolean,boolean)
  from public,anon,authenticated,service_role;

alter table public.questions add constraint mock_drafts_stay_unpublished
  check (bank_key is null or bank_key not like 'mock-%' or status='draft');

update public.questions set subtopic='notation'
where bank_key is null and subject='MATH' and topic='Functions'
  and prompt='If f(x) = 2x² + 1, what is f(3)?' and subtopic is null;

update public.questions
set subtopic=case
  when bank_key in ('px-q01@1','px-q02@1','px-q03@1','px-q06@1') then 'factoring'
  else 'roots-and-vertex' end
where subject='MATH' and topic='Quadratics' and subtopic is null
  and bank_key in ('px-q01@1','px-q02@1','px-q03@1','px-q04@1','px-q05@1','px-q06@1','px-q07@1','px-q08@1');

commit;
