-- ============================================================================
-- FIX: Auto-populate public.users table when auth.users gets new records
-- ============================================================================
--
-- PROBLEM: When users sign up via OAuth, they're created in auth.users
-- but NOT in public.users, causing foreign key constraint violations.
--
-- SOLUTION: Database trigger that automatically copies new auth.users
-- to public.users.
--
-- USAGE:
-- 1. Run this entire file in Supabase SQL Editor
-- 2. Existing users will be backfilled
-- 3. Future users will auto-populate
-- ============================================================================

-- Step 1: Backfill existing auth.users into public.users
-- (Uses ON CONFLICT to safely handle duplicates)
INSERT INTO public.users (id, email, created_at, updated_at)
SELECT
  au.id,
  COALESCE(au.email, au.id::text || '@placeholder.local') as email,
  au.created_at,
  au.updated_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, NEW.id::text || '@placeholder.local'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(EXCLUDED.email, public.users.email),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Step 3: Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Add INSERT policy to allow users to create their own record
-- (Required for application-level fix to work)
DROP POLICY IF EXISTS "Users can insert own data" ON users;

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Step 5: Verify backfill worked
DO $$
DECLARE
  auth_count INTEGER;
  public_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO auth_count FROM auth.users;
  SELECT COUNT(*) INTO public_count FROM public.users;

  RAISE NOTICE 'Auth users: %, Public users: %', auth_count, public_count;

  IF public_count < auth_count THEN
    RAISE WARNING 'Mismatch: % auth.users but only % public.users', auth_count, public_count;
  ELSE
    RAISE NOTICE 'Success: All auth.users are in public.users';
  END IF;
END $$;
