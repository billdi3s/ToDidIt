-- Row‑level security policies for 2done+1 / ToDone Time Canvas

alter table users enable row level security;
alter table activities enable row level security;
alter table time_blocks enable row level security;
alter table occupations enable row level security;

create policy "Users can view their own user row"
  on users
  for select
  using (auth.uid() = id);

create policy "Users manage their own activities"
  on activities
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own time blocks"
  on time_blocks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own occupations"
  on occupations
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
