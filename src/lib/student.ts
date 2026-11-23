import 'server-only';
import { redirect } from 'next/navigation';
import { supabaseServer } from './supabase/server';

export async function getStudent() {
  const db = await supabaseServer();
  const { data: { user } } = await db.auth.getUser();
  const email = process.env.ALLOWED_STUDENT_EMAIL?.trim().toLowerCase();
  return email && user?.email_confirmed_at && !user.is_anonymous && user.email?.toLowerCase() === email ? user : null;
}

export async function requireStudent() {
  const user = await getStudent();
  if (!user) redirect('/login');
  return user;
}
