create extension if not exists pgcrypto with schema extensions;

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 120),
  subscription_status text not null default 'pending_payment'
    check (subscription_status in ('pending_payment', 'active', 'past_due', 'canceled')),
  setup_fee_pkr integer not null default 40000 check (setup_fee_pkr = 40000),
  monthly_fee_pkr integer not null default 3000 check (monthly_fee_pkr = 3000),
  setup_fee_paid_at timestamptz,
  subscription_started_at timestamptz,
  subscription_renews_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.store_members (
  store_id uuid not null references public.stores (id) on delete cascade,
  user_id uuid not null unique references auth.users (id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'cashier')),
  created_at timestamptz not null default now(),
  primary key (store_id, user_id)
);

create table public.store_data (
  store_id uuid primary key references public.stores (id) on delete cascade,
  revision bigint not null default 0 check (revision >= 0),
  snapshot jsonb not null default '{}'::jsonb check (jsonb_typeof(snapshot) = 'object'),
  updated_at timestamptz not null default now()
);

create table public.billing_payments (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores (id) on delete cascade,
  kind text not null check (kind in ('setup', 'subscription')),
  amount_pkr integer not null check (amount_pkr > 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'refunded')),
  provider text,
  provider_reference text unique,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index store_members_user_id_idx on public.store_members (user_id);
create index billing_payments_store_created_idx on public.billing_payments (store_id, created_at desc);

alter table public.stores enable row level security;
alter table public.store_members enable row level security;
alter table public.store_data enable row level security;
alter table public.billing_payments enable row level security;

create policy "Store members can read their store"
  on public.stores for select to authenticated
  using (exists (
    select 1 from public.store_members membership
    where membership.store_id = stores.id and membership.user_id = (select auth.uid())
  ));

create policy "Store members can read their membership"
  on public.store_members for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Store members can read their data"
  on public.store_data for select to authenticated
  using (exists (
    select 1 from public.store_members membership
    where membership.store_id = store_data.store_id and membership.user_id = (select auth.uid())
  ));

create policy "Store members can read their payment history"
  on public.billing_payments for select to authenticated
  using (exists (
    select 1 from public.store_members membership
    where membership.store_id = billing_payments.store_id and membership.user_id = (select auth.uid())
  ));

create function public.provision_store_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_store_id uuid;
  requested_store_name text;
begin
  requested_store_name := nullif(trim(new.raw_user_meta_data ->> 'store_name'), '');
  if requested_store_name is null or char_length(requested_store_name) < 2 or char_length(requested_store_name) > 120 then
    raise exception 'Enter a store name between 2 and 120 characters.';
  end if;

  insert into public.stores (name)
  values (requested_store_name)
  returning id into new_store_id;

  insert into public.store_members (store_id, user_id, role)
  values (new_store_id, new.id, 'owner');

  insert into public.store_data (store_id, snapshot)
  values (
    new_store_id,
    jsonb_build_object(
      'products', '[]'::jsonb,
      'customers', jsonb_build_array(jsonb_build_object(
        'id', 1,
        'name', 'Walk In',
        'phone', '',
        'balance', 0,
        'totalPurchasing', 0,
        'totalPaid', 0
      )),
      'vendors', '[]'::jsonb,
      'expenses', '[]'::jsonb,
      'orders', '[]'::jsonb,
      'banks', '[]'::jsonb,
      'salesmen', '[]'::jsonb,
      'categories', '[]'::jsonb,
      'heldBills', '[]'::jsonb,
      'storeSettings', jsonb_build_object(
        'storeName', requested_store_name,
        'tagline', '',
        'address', '',
        'phone', '',
        'currency', 'Rs.',
        'footerNote', 'Thank You for Shopping!'
      )
    )
  );

  insert into public.billing_payments (store_id, kind, amount_pkr)
  values (new_store_id, 'setup', 40000);

  return new;
end;
$$;

create trigger on_auth_user_created_provision_store
  after insert on auth.users
  for each row execute function public.provision_store_for_new_user();

create function public.get_my_store_snapshot()
returns table (
  store_id uuid,
  store_name text,
  subscription_status text,
  setup_fee_paid_at timestamptz,
  subscription_renews_at timestamptz,
  revision bigint,
  snapshot jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select store.id, store.name, store.subscription_status, store.setup_fee_paid_at,
         store.subscription_renews_at, data.revision, data.snapshot
  from public.store_members membership
  join public.stores store on store.id = membership.store_id
  join public.store_data data on data.store_id = store.id
  where membership.user_id = (select auth.uid())
  limit 1;
$$;

create function public.save_my_store_snapshot(p_snapshot jsonb, p_expected_revision bigint)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_store_id uuid;
  new_revision bigint;
begin
  if p_snapshot is null or jsonb_typeof(p_snapshot) <> 'object' then
    raise exception 'Store data must be a JSON object.';
  end if;

  select membership.store_id into current_store_id
  from public.store_members membership
  join public.stores store on store.id = membership.store_id
  where membership.user_id = (select auth.uid())
    and membership.role in ('owner', 'admin')
    and store.subscription_status = 'active'
  limit 1;

  if current_store_id is null then
    raise exception 'No active store account was found.';
  end if;

  update public.store_data
  set snapshot = p_snapshot, revision = revision + 1, updated_at = now()
  where store_id = current_store_id and revision = p_expected_revision
  returning revision into new_revision;

  if new_revision is null then
    raise exception using message = 'STORE_DATA_CONFLICT', errcode = '40001';
  end if;

  return new_revision;
end;
$$;

revoke all on function public.get_my_store_snapshot() from public, anon;
revoke all on function public.save_my_store_snapshot(jsonb, bigint) from public, anon;
revoke all on function public.provision_store_for_new_user() from public, anon, authenticated;
grant execute on function public.get_my_store_snapshot() to authenticated;
grant execute on function public.save_my_store_snapshot(jsonb, bigint) to authenticated;

grant select on public.stores, public.store_members, public.store_data, public.billing_payments to authenticated;

alter publication supabase_realtime add table public.store_data;
