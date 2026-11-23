# Supabase security cutover and migration 004

## Credential inventory

The connected workspace stores a legacy privileged JWT under `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. The privileged client in `src/lib/supabase/admin.ts`, the bank publisher in `scripts/publish-practice-bank.mjs`, and the disposable browser audit in `tests/e2e/audit.spec.ts` consumed it. The app and maintenance tools now prefer `SUPABASE_SECRET_KEY` with a legacy fallback during cutover. `.env.example` documents variable names only. No inherited admin token, direct database connection variable, linked Supabase CLI project, or Vercel deployment credentials were available in this workspace. Existing hosted settings, CI secrets, dashboard-only Edge Functions, and other machines require an owner check.

`NEXT_PUBLIC_SUPABASE_ANON_KEY` already holds the project's modern publishable key by type. The variable name is retained for compatibility. Reserve `SUPABASE_SECRET_KEY` for server processes. The database password and a Supabase Management API token are separate credentials.

## Dashboard actions in order

1. Open the connected project in the Supabase Dashboard. Go to **Authentication → Sign In / Providers**. Turn off **Allow new users to sign up** and **Allow anonymous sign-ins** if enabled, save, and keep the Email provider enabled for the confirmed student. Verify the public Auth settings now return `disable_signup: true`. [Supabase Auth configuration](https://supabase.com/docs/guides/auth/general-configuration)
2. Open **Settings → API Keys → Publishable and secret API keys**. If the tab offers **Create new API keys**, use it. Use the project's modern publishable key for the browser. In the **Secret keys** section, create a dedicated key for ACT Mastery. Save it under `SUPABASE_SECRET_KEY` in `.env.local` and any authorized server deployment or CI secret store. Restart or redeploy each process. Leave the legacy key in the file only temporarily if needed to verify that Supabase rejects it after revocation. [Supabase API-key migration](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys)
3. Test sign-in, a privileged read and a reversible write with the new key. Check every deployment environment and independent integration. Then go to **Settings → API Keys → Legacy API Keys** and deactivate the legacy `anon` and `service_role` keys. Do not re-enable them after cutover. [Supabase compromised-key rotation](https://supabase.com/docs/guides/security/rotate-leaked-api-keys)
4. For a compromised legacy `service_role` key, revoke the old JWT signing secret as well. Go to **Settings → JWT Keys → JWT Signing Keys**. If the project uses the legacy signing setup, migrate it to the signing-key system according to Supabase's guided flow. Rotate to the new signing key once clients are ready, then open the action menu for the legacy key under **Previously used keys** and choose **Revoke**. Existing sessions signed by that key may need to sign in again. Dashboard changes can take time to propagate. [Supabase signing keys](https://supabase.com/docs/guides/auth/signing-keys)
5. Verify the replacement key succeeds and the previous legacy key is rejected. Test the legacy JWT as a bearer token alongside the new publishable key too. The exposed key must fail to read privileged data in both configurations. Remove `SUPABASE_SERVICE_ROLE_KEY` from local settings, deployment settings, and CI after verification. Never print either key while testing.

## Backup, apply, and verify 004

1. Open **Database → Backups** in the Supabase project. Confirm the latest completed recovery point covers the current student data. If the project lacks a usable backup, create a logical backup using a restricted owner connection and store it privately. For a direct PostgreSQL connection, put credentials in a local libpq service and password file outside the repository, then run `pg_dump --dbname='service=act_mastery' --format=custom --file='<private-path>/act-mastery-before-004.dump'`. Verify with `pg_restore --list '<private-path>/act-mastery-before-004.dump'` and test a restore into a disposable database. Include separately configured Auth and storage recovery if applicable. [Supabase backups](https://supabase.com/docs/guides/platform/backups)
2. In **SQL Editor → New query**, paste the complete `supabase/migrations/004_course_practice.sql` and run it once. The transaction preserves existing session and attempt IDs. The migration adds owner-scoped course tests and service-only RPCs. It does not publish content. A server API key alone cannot create database functions or replace an owner backup.
3. In SQL Editor, confirm both RPCs are present and execute access is granted only to the server role.

   ```sql
   select
     to_regprocedure('public.course_question_counts(uuid,text,text[])') as counts,
     to_regprocedure('public.start_course_session(uuid,text,text[],integer,integer,integer,boolean)') as start;
   select
     has_function_privilege('anon','public.course_question_counts(uuid,text,text[])','execute') as anon_can_count,
     has_function_privilege('authenticated','public.start_course_session(uuid,text,text[],integer,integer,integer,boolean)','execute') as student_can_start_directly,
     has_function_privilege('service_role','public.start_course_session(uuid,text,text[],integer,integer,integer,boolean)','execute') as server_can_start;
   ```

   Expect both functions to resolve and the privileges to read `false, false, true`.
4. With a separate confirmed QA account, run the production browser suite with `E2E_COURSE_MIGRATION=1`. Check that an advanced timed test selects new questions, direct browser access to answer keys is denied, responses persist, the timer refuses late writes, and results include the mastery evidence. Remove the QA identity and fixture data after testing.

## Recorded state

The hosted preflight found that the configured legacy credential still performed privileged reads, public registration was enabled, the approved account was confirmed, and the course counts RPC returned `PGRST202`. No project-owner connection or backup access was available. No dashboard changes, hosted backup, hosted migration, or key revocation were performed. A successful SQL test in the disposable local database does not verify changes to the hosted project.
