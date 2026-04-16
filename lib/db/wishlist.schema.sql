create extension if not exists pgcrypto;

create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null,
  product_data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wishlists_user_product_unique unique (user_id, product_id)
);

create index if not exists wishlists_user_id_idx on public.wishlists(user_id);
create index if not exists wishlists_product_id_idx on public.wishlists(product_id);

create or replace function public.set_wishlists_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_wishlists_updated_at on public.wishlists;
create trigger set_wishlists_updated_at
before update on public.wishlists
for each row
execute function public.set_wishlists_updated_at();

alter table public.wishlists enable row level security;

drop policy if exists "Users can read own wishlists" on public.wishlists;
create policy "Users can read own wishlists"
on public.wishlists
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own wishlists" on public.wishlists;
create policy "Users can insert own wishlists"
on public.wishlists
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own wishlists" on public.wishlists;
create policy "Users can update own wishlists"
on public.wishlists
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own wishlists" on public.wishlists;
create policy "Users can delete own wishlists"
on public.wishlists
for delete
to authenticated
using (auth.uid() = user_id);
