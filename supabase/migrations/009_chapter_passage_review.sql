begin;

create function public.require_reviewed_chapter_passage() returns trigger language plpgsql
set search_path=public,pg_catalog as $$
declare
  current_passage jsonb;
  reviewed_passage jsonb;
begin
  if new.status='verified' and new.bank_key like 'chapter-practice-%' and new.passage_id is not null then
    select to_jsonb(p) into strict current_passage from public.passages p where p.id=new.passage_id for share;
    select r.revision_snapshot->'passage' into reviewed_passage
    from public.question_editorial_reviews r where r.question_id=new.id
    order by r.reviewed_at desc,r.id desc limit 1;
    if current_passage is distinct from reviewed_passage then
      raise exception 'The current passage needs editorial approval' using errcode='23514';
    end if;
  end if;
  return new;
end
$$;

create trigger require_reviewed_chapter_passage before insert or update on public.questions
for each row execute function public.require_reviewed_chapter_passage();

create function public.protect_released_chapter_passage() returns trigger language plpgsql
set search_path=public,pg_catalog as $$
begin
  if new is distinct from old and exists(
    select 1 from public.questions q where q.passage_id=old.id and q.status='verified'
      and q.bank_key like 'chapter-practice-%'
  ) then
    raise exception 'Create a new passage revision or withdraw all linked chapter questions first' using errcode='23514';
  end if;
  return new;
end
$$;

create trigger protect_released_chapter_passage before update on public.passages
for each row execute function public.protect_released_chapter_passage();

revoke all on function public.require_reviewed_chapter_passage(),public.protect_released_chapter_passage()
from public,anon,authenticated,service_role;

commit;
