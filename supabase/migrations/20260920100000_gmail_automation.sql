create table if not exists public.gmail_automation_state (
  mailbox text primary key,
  last_history_id text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.gmail_automation_events (
  id uuid primary key default gen_random_uuid(),
  mailbox text not null,
  gmail_message_id text not null,
  history_id text not null,
  status text not null check (status in ('processing', 'draft_created', 'error')),
  error_message text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (mailbox, gmail_message_id)
);

create index if not exists gmail_automation_events_created_at_idx on public.gmail_automation_events (created_at desc);

alter table public.gmail_automation_state enable row level security;
alter table public.gmail_automation_events enable row level security;

revoke all on public.gmail_automation_state from anon, authenticated;
revoke all on public.gmail_automation_events from anon, authenticated;
