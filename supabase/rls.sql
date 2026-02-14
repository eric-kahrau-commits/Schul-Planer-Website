-- Row Level Security (RLS) für StudyFlow
-- Voraussetzung: Tabellen subjects, topics, study_sessions mit Spalte user_id (uuid, references auth.users(id))
-- Im Supabase Dashboard: SQL Editor → diese Datei ausführen

-- ========== SUBJECTS ==========
alter table if exists public.subjects enable row level security;

create policy "Users can view their own subjects"
  on public.subjects for select
  using (auth.uid() = user_id);

create policy "Users can insert their own subjects"
  on public.subjects for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own subjects"
  on public.subjects for update
  using (auth.uid() = user_id);

create policy "Users can delete their own subjects"
  on public.subjects for delete
  using (auth.uid() = user_id);

-- ========== TOPICS ==========
alter table if exists public.topics enable row level security;

create policy "Users can view their own topics"
  on public.topics for select
  using (
    exists (
      select 1 from public.subjects s
      where s.id = topics.subject_id and s.user_id = auth.uid()
    )
  );

create policy "Users can insert their own topics"
  on public.topics for insert
  with check (
    exists (
      select 1 from public.subjects s
      where s.id = topics.subject_id and s.user_id = auth.uid()
    )
  );

create policy "Users can update their own topics"
  on public.topics for update
  using (
    exists (
      select 1 from public.subjects s
      where s.id = topics.subject_id and s.user_id = auth.uid()
    )
  );

create policy "Users can delete their own topics"
  on public.topics for delete
  using (
    exists (
      select 1 from public.subjects s
      where s.id = topics.subject_id and s.user_id = auth.uid()
    )
  );

-- ========== STUDY_SESSIONS ==========
alter table if exists public.study_sessions enable row level security;

create policy "Users can view their own study_sessions"
  on public.study_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own study_sessions"
  on public.study_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own study_sessions"
  on public.study_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own study_sessions"
  on public.study_sessions for delete
  using (auth.uid() = user_id);

-- Später ergänzen, wenn pets/coins in der DB liegen:
-- alter table public.pets enable row level security;
-- alter table public.coins enable row level security;
-- (analog Policies: nur eigene Zeilen nach user_id)
