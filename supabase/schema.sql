-- Supabase SQL エディタで実行してください

create table if not exists rooms (
  code text primary key,
  settings jsonb not null default '{"redrawsLeft":3,"handSize":5,"rounds":5}'::jsonb,
  status text not null default 'waiting',

  host_hand jsonb,
  guest_hand jsonb,
  host_redraws_left integer not null default 3,
  guest_redraws_left integer not null default 3,
  host_confirmed boolean not null default false,
  guest_confirmed boolean not null default false,

  player_first text,
  current_attacker text,
  host_field_card jsonb,
  guest_field_card jsonb,
  host_score integer not null default 0,
  guest_score integer not null default 0,
  round integer not null default 0,
  round_results jsonb not null default '[]'::jsonb,
  battle_sub_phase text not null default 'attacker_select',

  created_at timestamptz not null default now()
);

-- プレイヤー名カラム追加（既存テーブルへの追加）
alter table rooms add column if not exists host_name text;
alter table rooms add column if not exists guest_name text;

-- RLS 有効化
alter table rooms enable row level security;

-- 匿名ユーザーに全操作を許可
create policy "Allow all for anon" on rooms
  for all
  to anon
  using (true)
  with check (true);

-- リアルタイム有効化
alter publication supabase_realtime add table rooms;
