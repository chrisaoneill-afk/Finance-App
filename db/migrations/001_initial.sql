create extension if not exists pgcrypto;

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  institution text,
  type text not null check (type in ('bank','credit','savings')),
  is_backup_savings boolean not null default false,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  date date not null,
  description text not null,
  amount numeric not null,
  month_key text not null,
  source_file_id uuid,
  fingerprint text not null,
  created_at timestamp with time zone not null default now(),
  unique(user_id, fingerprint)
);

create index if not exists idx_transactions_user_month on public.transactions(user_id, month_key);
create index if not exists idx_transactions_user_date on public.transactions(user_id, date);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  target_monthly_housing_cost numeric not null default 0,
  baseline_monthly_draw numeric not null default 0,
  savings_floor numeric not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.account_balances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  as_of_date date not null,
  balance numeric not null,
  created_at timestamp with time zone not null default now()
);

create table if not exists public.cash_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  amount numeric not null,
  type text not null check (type in ('bonus','stock_sale','other')),
  notes text
);

alter table public.accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.user_settings enable row level security;
alter table public.account_balances enable row level security;
alter table public.cash_events enable row level security;

create policy "accounts_select_own" on public.accounts for select using (auth.uid() = user_id);
create policy "accounts_insert_own" on public.accounts for insert with check (auth.uid() = user_id);
create policy "accounts_update_own" on public.accounts for update using (auth.uid() = user_id);
create policy "accounts_delete_own" on public.accounts for delete using (auth.uid() = user_id);

create policy "transactions_select_own" on public.transactions for select using (auth.uid() = user_id);
create policy "transactions_insert_own" on public.transactions for insert with check (auth.uid() = user_id);
create policy "transactions_update_own" on public.transactions for update using (auth.uid() = user_id);
create policy "transactions_delete_own" on public.transactions for delete using (auth.uid() = user_id);

create policy "settings_select_own" on public.user_settings for select using (auth.uid() = user_id);
create policy "settings_insert_own" on public.user_settings for insert with check (auth.uid() = user_id);
create policy "settings_update_own" on public.user_settings for update using (auth.uid() = user_id);

create policy "balances_select_own" on public.account_balances for select using (auth.uid() = user_id);
create policy "balances_insert_own" on public.account_balances for insert with check (auth.uid() = user_id);
create policy "balances_update_own" on public.account_balances for update using (auth.uid() = user_id);
create policy "balances_delete_own" on public.account_balances for delete using (auth.uid() = user_id);

create policy "events_select_own" on public.cash_events for select using (auth.uid() = user_id);
create policy "events_insert_own" on public.cash_events for insert with check (auth.uid() = user_id);
create policy "events_update_own" on public.cash_events for update using (auth.uid() = user_id);
create policy "events_delete_own" on public.cash_events for delete using (auth.uid() = user_id);
