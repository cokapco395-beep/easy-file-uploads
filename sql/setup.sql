-- ===========================================
-- EduSphere: Дополнительные таблицы
-- Выполните в Supabase Dashboard → SQL Editor
-- ===========================================

-- 1. Расписание/уроки
CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id uuid REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  start_time time NOT NULL,
  end_time time NOT NULL,
  room text,
  status text DEFAULT 'normal' CHECK (status IN ('normal', 'changed', 'cancelled')),
  replacement_info text,
  created_at timestamptz DEFAULT now()
);

-- 2. Достижения пользователей (связь many-to-many)
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id uuid REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- 3. Роли пользователей
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student', 'parent');

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- 4. Лог XP
CREATE TABLE IF NOT EXISTS public.xp_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 5. Onboarding статус
CREATE TABLE IF NOT EXISTS public.onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  how_found text,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 6. Связь родитель-ребёнок
CREATE TABLE IF NOT EXISTS public.parent_children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  child_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(parent_id, child_id)
);

-- ===========================================
-- RLS Policies
-- ===========================================

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_children ENABLE ROW LEVEL SECURITY;

-- Security definer function for role check
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Lessons: students in the class can read
CREATE POLICY "Students can view their class lessons" ON public.lessons
  FOR SELECT TO authenticated
  USING (
    class_id IN (SELECT class_id FROM public.profiles WHERE id = auth.uid())
  );

-- User achievements: users see their own
CREATE POLICY "Users see own achievements" ON public.user_achievements
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System inserts achievements" ON public.user_achievements
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- User roles: users see own role
CREATE POLICY "Users see own role" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- XP log: users see own
CREATE POLICY "Users see own xp" ON public.xp_log
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users insert own xp" ON public.xp_log
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Onboarding: users manage own
CREATE POLICY "Users manage own onboarding" ON public.onboarding
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Parent children: parents see own links
CREATE POLICY "Parents see own children" ON public.parent_children
  FOR SELECT TO authenticated
  USING (parent_id = auth.uid() OR child_id = auth.uid());

-- ===========================================
-- Trigger: auto-create profile on signup
-- ===========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, role, xp, level, sphere_coins, coins)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    0, 1, 0, 0
  );
  
  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, (COALESCE(NEW.raw_user_meta_data->>'role', 'student'))::app_role);
  
  -- Create onboarding record
  INSERT INTO public.onboarding (user_id) VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===========================================
-- Seed data: добавим классы и предметы
-- ===========================================
INSERT INTO public.classes (name, school_id) VALUES
  ('7А', 'eb11b57a-569c-46d3-93e1-2670a44602c0'),
  ('7Б', 'eb11b57a-569c-46d3-93e1-2670a44602c0'),
  ('8А', 'eb11b57a-569c-46d3-93e1-2670a44602c0'),
  ('8Б', 'eb11b57a-569c-46d3-93e1-2670a44602c0'),
  ('9А', 'eb11b57a-569c-46d3-93e1-2670a44602c0'),
  ('9Б', 'eb11b57a-569c-46d3-93e1-2670a44602c0'),
  ('10А', 'eb11b57a-569c-46d3-93e1-2670a44602c0'),
  ('10Б', 'eb11b57a-569c-46d3-93e1-2670a44602c0'),
  ('11А', 'eb11b57a-569c-46d3-93e1-2670a44602c0'),
  ('11Б', 'eb11b57a-569c-46d3-93e1-2670a44602c0')
ON CONFLICT DO NOTHING;

INSERT INTO public.subjects (name) VALUES
  ('Математика'),
  ('Физика'),
  ('Қазақ тілі'),
  ('Русский язык'),
  ('Английский язык'),
  ('История Казахстана'),
  ('Информатика'),
  ('Химия'),
  ('Биология'),
  ('География')
ON CONFLICT DO NOTHING;

INSERT INTO public.achievements (title, icon) VALUES
  ('first_five', '⭐'),
  ('week_no_skip', '🔥'),
  ('ten_fives', '🏆'),
  ('level_5', '💎'),
  ('first_login', '👋')
ON CONFLICT DO NOTHING;
