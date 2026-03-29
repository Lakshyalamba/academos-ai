create extension if not exists pgcrypto;

create table if not exists public.academic_snapshots (
  id uuid primary key default gen_random_uuid(),
  query text not null,
  intent text,
  source text not null default 'newton-mcp',
  tools_used jsonb not null default '[]'::jsonb,
  snapshot jsonb not null,
  reasoning_response jsonb,
  reasoning_model text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists academic_snapshots_created_at_idx
  on public.academic_snapshots (created_at desc);

create or replace function public.set_academic_snapshots_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_academic_snapshots_updated_at on public.academic_snapshots;

create trigger set_academic_snapshots_updated_at
before update on public.academic_snapshots
for each row
execute function public.set_academic_snapshots_updated_at();
