begin;
create table public.tutor_feedback (
  user_id uuid not null references auth.users on delete cascade,
  session_id uuid not null references public.sessions on delete cascade,
  position int not null,
  helpful boolean not null,
  created_at timestamptz not null default now(),
  primary key (user_id,session_id,position),
  foreign key (session_id,position) references public.session_questions on delete cascade
);
alter table public.tutor_feedback enable row level security;
revoke all on public.tutor_feedback from anon,authenticated;
commit;
