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

-- 再戦コードカラム追加
alter table rooms add column if not exists rematch_code text;

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

-- 古いルームの自動削除（30分ごとに1時間以上経過したルームを削除）
-- 事前に Supabase ダッシュボード > Database > Extensions で pg_cron を有効化すること
select cron.schedule(
  'delete-old-rooms',
  '0 */2 * * *',
  $$delete from rooms where created_at < now() - interval '3 hours'$$
);
