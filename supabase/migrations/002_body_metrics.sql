alter table public.users
  add column if not exists body_weight_kg double precision,
  add column if not exists goal_weight_kg double precision;
