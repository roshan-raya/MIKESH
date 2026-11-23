import 'server-only';
import { adminDb } from './supabase/admin';
import { subjects } from './study';
import type { Inventory } from './practice-options';

export async function practiceInventory(student: string): Promise<Inventory> {
  const db = adminDb();
  const practice: Inventory['practice'] = {};
  const due: Inventory['due'] = {};
  const holdouts: Inventory['holdouts'] = {};
  const seen = new Set<string>();
  const family = (id: string, key: string | null) => key?.split('@')[0] ?? id;

  for (let offset = 0;; offset += 500) {
    const {data, error} = await db.from('session_questions')
      .select('question_id,questions!session_questions_question_id_fkey!inner(bank_key,holdout),sessions!session_questions_session_id_fkey!inner(user_id)')
      .eq('sessions.user_id',student).eq('questions.holdout',true)
      .order('session_id').order('position').range(offset,offset+499);
    if (error) throw Error('Could not check unseen questions.');
    for (const row of data) {
      const question = Array.isArray(row.questions) ? row.questions[0] : row.questions;
      seen.add(family(row.question_id,question?.bank_key ?? null));
    }
    if (data.length < 500) break;
  }

  for (let offset = 0;; offset += 500) {
    const {data,error} = await db.from('questions').select('id,subject,topic,holdout,bank_key')
      .eq('status','verified').order('id').range(offset,offset+499);
    if (error) throw Error('Could not check question availability.');
    for (const {id,subject,topic,holdout,bank_key} of data) {
      if (holdout) {
        if (!seen.has(family(id,bank_key))) holdouts[subject] = (holdouts[subject] ?? 0) + 1;
      } else {
        const topics = practice[subject] ??= {};
        topics[topic] = (topics[topic] ?? 0) + 1;
      }
    }
    if (data.length < 500) break;
  }

  const now = new Date().toISOString();
  await Promise.all(subjects.map(async subject=>{
    const {count,error} = await db.from('review_items')
      .select('question_id,questions!review_items_question_id_fkey!inner(subject,status,holdout)',{head:true,count:'exact'})
      .eq('user_id',student).lte('due_at',now).eq('questions.subject',subject)
      .eq('questions.status','verified').eq('questions.holdout',false);
    if (error) throw Error('Could not check due reviews.');
    due[subject] = count ?? 0;
  }));

  return {practice,due,holdouts};
}
