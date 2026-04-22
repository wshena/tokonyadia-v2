create extension if not exists pgcrypto;

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  status text not null default 'approved' check (status in ('pending', 'approved', 'rejected')),
  rate integer not null check (rate between 1 and 5),
  comment text not null check (char_length(trim(comment)) between 10 and 1000),
  user_display_name text not null,
  user_avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_reviews_user_product_unique unique (user_id, product_id)
);

create index if not exists product_reviews_product_id_idx on public.product_reviews(product_id);
create index if not exists product_reviews_user_id_idx on public.product_reviews(user_id);
create index if not exists product_reviews_status_idx on public.product_reviews(status);
create index if not exists product_reviews_created_at_idx on public.product_reviews(created_at desc);

create or replace function public.set_product_reviews_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_product_reviews_updated_at on public.product_reviews;
create trigger set_product_reviews_updated_at
before update on public.product_reviews
for each row
execute function public.set_product_reviews_updated_at();

alter table public.product_reviews enable row level security;

drop policy if exists "Public can read approved product reviews" on public.product_reviews;
create policy "Public can read approved product reviews"
on public.product_reviews
for select
to public
using (status = 'approved');

drop policy if exists "Users can read own product reviews" on public.product_reviews;
create policy "Users can read own product reviews"
on public.product_reviews
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own delivered product reviews" on public.product_reviews;
create policy "Users can insert own delivered product reviews"
on public.product_reviews
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.orders o
    join public.order_items oi on oi.order_id = o.id
    where o.id = order_id
      and oi.id = order_item_id
      and o.user_id = auth.uid()
      and o.status = 'delivered'
      and oi.product_id = product_id
  )
);

drop policy if exists "Users can update own product reviews" on public.product_reviews;
create policy "Users can update own product reviews"
on public.product_reviews
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.orders o
    join public.order_items oi on oi.order_id = o.id
    where o.id = order_id
      and oi.id = order_item_id
      and o.user_id = auth.uid()
      and o.status = 'delivered'
      and oi.product_id = product_id
  )
);

drop policy if exists "Users can delete own product reviews" on public.product_reviews;
create policy "Users can delete own product reviews"
on public.product_reviews
for delete
to authenticated
using (auth.uid() = user_id);
