import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

async function main() {
  const { query } = await import('../src/db');

  console.log('[setup-auto-confirm] 1. Creating auto-confirm trigger function on auth.users...');
  await query(`
    CREATE OR REPLACE FUNCTION public.auto_confirm_auth_user()
    RETURNS trigger AS $$
    BEGIN
      NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, now());
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);

  console.log('[setup-auto-confirm] 2. Attaching BEFORE INSERT OR UPDATE trigger on auth.users...');
  await query(`
    DROP TRIGGER IF EXISTS on_auth_user_created_auto_confirm ON auth.users;
    CREATE TRIGGER on_auth_user_created_auto_confirm
    BEFORE INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_confirm_auth_user();
  `);

  console.log('[setup-auto-confirm] 3. Creating public.users sync trigger...');
  await query(`
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
  `);

  console.log('[setup-auto-confirm] 4. Attaching AFTER INSERT OR UPDATE trigger to sync to public.users...');
  await query(`
    DROP TRIGGER IF EXISTS on_auth_user_sync_public ON auth.users;
    CREATE TRIGGER on_auth_user_sync_public
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_auth_user_to_public();
  `);

  console.log('[setup-auto-confirm] 5. Confirming any existing unconfirmed users in auth.users...');
  await query(`
    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE email_confirmed_at IS NULL;
  `);

  console.log('[setup-auto-confirm] 6. Backfilling existing auth.users to public.users...');
  await query(`
    INSERT INTO public.users (id, email, created_at, updated_at)
    SELECT id, COALESCE(email, ''), created_at, now()
    FROM auth.users
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, updated_at = now();
  `);

  const publicUsers = await query(`SELECT count(*) as count FROM public.users`);
  console.log('[setup-auto-confirm] ✓ public.users count after backfill:', publicUsers);

  console.log('[setup-auto-confirm] ✓ Database workflow verified and updated successfully!');
  process.exit(0);
}

main().catch((e) => {
  console.error('[setup-auto-confirm] ✗ Error:', e);
  process.exit(1);
});
