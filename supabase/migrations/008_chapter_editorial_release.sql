begin;

alter table public.question_editorial_reviews add column bank_snapshot jsonb;
alter table public.question_editorial_reviews alter column reviewed_at set default clock_timestamp();

create function public.capture_chapter_bank_snapshot() returns trigger language plpgsql
set search_path=public,pg_catalog as $$
begin
  if new.bank_key like 'chapter-practice-%' then
    select to_jsonb(q)-array['status','created_at'] into strict new.bank_snapshot
    from public.questions q where q.id=new.question_id;
  end if;
  return new;
end
$$;

create trigger capture_chapter_bank_snapshot before insert on public.question_editorial_reviews
for each row execute function public.capture_chapter_bank_snapshot();

create function public.guard_chapter_practice() returns trigger language plpgsql
set search_path=public,pg_catalog as $$
declare
  approved boolean;
begin
  if tg_op='UPDATE' and old.bank_key like 'chapter-practice-%' and new.bank_key is distinct from old.bank_key then
    raise exception 'Use a new revision to change a chapter practice bank key' using errcode='23514';
  end if;
  if new.bank_key is null or new.bank_key not like 'chapter-practice-%' then return new; end if;
  if new.holdout then
    raise exception 'Chapter practice is separate from assessment holdouts' using errcode='23514';
  end if;
  if new.status='verified' then
    select decision='approved' and bank_snapshot=to_jsonb(new)-array['status','created_at']
      into approved from public.question_editorial_reviews
      where question_id=new.id order by reviewed_at desc,id desc limit 1;
    if approved is distinct from true then
      raise exception 'Chapter practice requires a current human approval for this exact revision' using errcode='23514';
    end if;
  end if;
  return new;
end
$$;

create trigger guard_chapter_practice before insert or update on public.questions
for each row execute function public.guard_chapter_practice();

create function public.release_chapter_practice(p_bank_key text) returns uuid language plpgsql
set search_path=public,pg_catalog as $$
declare
  item_id uuid;
begin
  if p_bank_key is null or p_bank_key not like 'chapter-practice-%' then
    raise exception 'Choose a chapter practice revision';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(split_part(p_bank_key,'@',1),0));
  if exists(select 1 from public.questions
    where split_part(bank_key,'@',1)=split_part(p_bank_key,'@',1)
      and status='verified' and version>(select version from public.questions where bank_key=p_bank_key)) then
    raise exception 'A newer revision is already live';
  end if;
  update public.questions set status='verified' where bank_key=p_bank_key returning id into strict item_id;
  update public.questions set status='draft' where status='verified'
    and split_part(bank_key,'@',1)=split_part(p_bank_key,'@',1) and id<>item_id;
  return item_id;
end
$$;

revoke all on function public.capture_chapter_bank_snapshot(),public.guard_chapter_practice(),
  public.release_chapter_practice(text) from public,anon,authenticated,service_role;

commit;
