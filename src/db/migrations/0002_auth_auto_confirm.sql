-- 0002_auth_auto_confirm.sql
-- Automatically confirm users on sign up so they can immediately sign in without email confirmation

CREATE OR REPLACE FUNCTION public.auto_confirm_auth_user()
RETURNS trigger AS $$
BEGIN
  NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_auto_confirm
BEFORE INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.auto_confirm_auth_user();

-- Automatically sync Supabase auth.users to public.users table
CREATE OR REPLACE FUNCTION public.sync_auth_user_to_public()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at)
  VALUES (NEW.id, COALESCE(NEW.email, ''), now(), now())
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email, updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_sync_public ON auth.users;
CREATE TRIGGER on_auth_user_sync_public
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_auth_user_to_public();

-- Confirm any existing unconfirmed users
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email_confirmed_at IS NULL;

-- Backfill public.users
INSERT INTO public.users (id, email, created_at, updated_at)
SELECT id, COALESCE(email, ''), created_at, now()
FROM auth.users
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, updated_at = now();
