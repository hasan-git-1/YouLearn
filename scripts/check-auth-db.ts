import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

async function main() {
  const { query } = await import('../src/db');

  console.log('1. Checking auth.users columns:');
  const cols = await query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'auth' AND table_name = 'users'
    AND column_name IN ('id', 'email', 'email_confirmed_at', 'confirmed_at', 'encrypted_password')
  `);
  console.log(cols);

  console.log('\n2. Checking existing triggers on auth.users:');
  const triggers = await query(`
    SELECT trigger_name, event_manipulation, action_statement, action_timing
    FROM information_schema.triggers
    WHERE event_object_schema = 'auth' AND event_object_table = 'users'
  `);
  console.log(triggers);

  console.log('\n3. Checking public.users:');
  const publicUsers = await query(`SELECT count(*) as count FROM public.users`);
  console.log('public.users count:', publicUsers);

  console.log('\n4. Checking auth.users:');
  const authUsers = await query(`SELECT id, email, email_confirmed_at, confirmed_at, created_at FROM auth.users LIMIT 5`);
  console.log(authUsers);

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
