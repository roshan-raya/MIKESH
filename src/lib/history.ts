import 'server-only';
import { adminDb } from './supabase/admin';
import type { Attempt } from './metrics';

export async function history(userId:string):Promise<Attempt[]> {
  const db=adminDb();
  const rows:Attempt[]=[];
  for(let offset=0;;offset+=500){
    const {data,error}=await db.from('attempts').select('id,question_id,session_id,subject,is_correct,created_at,seconds,confidence,error_category,selected_answer,questions!attempts_question_id_fkey(topic,subtopic,difficulty,holdout,bank_key,prompt),sessions!attempts_session_id_fkey(mode)')
      .eq('user_id',userId).order('id').range(offset,offset+499);
    if(error) throw new Error('Could not load study history.');
    for(const row of data){
      const question=Array.isArray(row.questions)?row.questions[0]:row.questions;
      const session=Array.isArray(row.sessions)?row.sessions[0]:row.sessions;
      rows.push({...row,family:question?.bank_key?.split('@')[0],bankKey:question?.bank_key,questionPrompt:question?.prompt,topic:question?.topic??'General',subtopic:question?.subtopic,difficulty:question?.difficulty,holdout:question?.holdout??false,mode:session?.mode??'learn'});
    }
    if(data.length<500) return rows;
  }
}
