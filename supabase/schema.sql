-- Run in Supabase SQL Editor. No public signup UI is included.
create extension if not exists pgcrypto;
create table if not exists public.questions (
 id uuid primary key default gen_random_uuid(),
 subject text not null check (subject in ('MATH','ENGLISH','READING','SCIENCE')),
 topic text not null,
 prompt text not null,
 options jsonb not null,
 correct_answer text not null check(correct_answer in ('A','B','C','D','E')),
 explanation text not null,
 status text not null default 'draft' check(status in ('draft','verified')),
 created_at timestamptz not null default now()
);
create table if not exists public.attempts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 question_id uuid not null references public.questions(id),
 subject text not null,
 selected_answer text not null,
 is_correct boolean not null,
 created_at timestamptz not null default now()
);
create index if not exists attempts_user_created on public.attempts(user_id,created_at desc);
alter table public.questions enable row level security;
alter table public.attempts enable row level security;
-- Publicly accessible rows are intentionally limited to prompt/options metadata;
-- actual answer secrecy is enforced through a separate view and API policy below.
revoke all on public.questions from anon, authenticated;
create or replace view public.practice_questions with (security_invoker = true) as
 select id,subject,topic,prompt,options from public.questions where status='verified';
-- API reads answers server-side through restricted RPC rather than exposing base table.
-- The starter implementation uses a private trusted API pattern described in README.
create policy attempts_select_own on public.attempts for select to authenticated using (auth.uid()=user_id);
create policy attempts_insert_own on public.attempts for insert to authenticated with check (auth.uid()=user_id);
grant select,insert on public.attempts to authenticated;
