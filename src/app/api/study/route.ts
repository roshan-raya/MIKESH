import { NextResponse } from 'next/server';
import { getStudent } from '@/lib/student';
import { adminDb } from '@/lib/supabase/admin';
import { startSchema, updateSchema } from '@/lib/study';

export async function POST(request: Request) {
  const user = await getStudent();
  if (!user) return NextResponse.json({ error: 'Sign in to continue.' }, { status: 401 });
  const body = await request.json().catch(() => null);
  const db = adminDb();
  if (body?.action === 'start') {
    const parsed = startSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Check the practice settings.' }, { status: 400 });
    const { mode, subject, topic, count, science } = parsed.data;
    const { data, error } = await db.rpc('start_study', {
      p_user: user.id, p_mode: mode, p_subject: subject, p_topic: (mode === 'topic' || mode === 'timed') ? topic : null, p_count: count, p_science: science,
    });
    if (error) return failure(error);
    return NextResponse.json({ id: data });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Check the session response.' }, { status: 400 });
  const { session, action, position, answer, flagged, confidence, seconds, essay } = parsed.data;
  const { error } = await db.rpc('update_study', {
    p_user: user.id, p_session: session, p_action: action, p_position: position, p_answer: answer,
    p_flagged: flagged, p_confidence: confidence, p_seconds: seconds, p_essay: essay,
  });
  return error ? failure(error) : NextResponse.json({ saved: true });
}

function failure(error: { code: string; message: string }) {
  if (error.code === 'P0001') return NextResponse.json({ error: error.message }, { status: 409 });
  console.error('Study operation failed', error.code);
  return NextResponse.json({ error: 'Could not save. Try again.' }, { status: 500 });
}
