import {revalidatePath} from 'next/cache';
import {z} from 'zod';
import {adminDb} from '@/lib/supabase/admin';
import {requireStudent} from '@/lib/student';
import Nav from '@/components/nav';
import QuestionLearningPanel from '@/components/question-learning';
import {questionLearning} from '@/lib/courses/question-learning';
import {RichText} from '@/components/rich-text';

async function classify(form:FormData){
  'use server';
  const user=await requireStudent();
  const id=z.string().uuid().parse(form.get('id'));
  const category=z.enum(['','concept','careless','timing']).parse(form.get('category'));
  const {error}=await adminDb().from('attempts').update({error_category:category||null}).eq('id',id).eq('user_id',user.id).eq('is_correct',false);
  if(error) throw Error('Could not save error category.');
  revalidatePath('/mistakes');
}
export default async function Mistakes({searchParams}:{searchParams:Promise<{subject?:string;topic?:string}>}){
  const user=await requireStudent();
  const db=adminDb();
  const filters=await searchParams;
  let query=db.from('attempts').select('id,subject,selected_answer,error_category,questions!attempts_question_id_fkey!inner(bank_key,subject,difficulty,objective,prompt,topic,explanation,correct_answer),sessions!attempts_session_id_fkey(finished_at,mode)')
    .eq('user_id',user.id).eq('is_correct',false);
  if(filters.subject) query=query.eq('subject',filters.subject);
  if(filters.topic) query=query.eq('questions.topic',filters.topic);
  const {data,error}=await query.order('created_at',{ascending:false}).limit(100);
  if(error) throw Error('Could not load your mistakes.');
  const mistakes=data.filter(row=>{
    const session=Array.isArray(row.sessions)?row.sessions[0]:row.sessions;
    return !session||session.finished_at||['learn','topic','adaptive','review'].includes(session.mode);
  });
  return <><Nav/><main id="main" className="shell"><p className="eyebrow">Reflect and retry</p><h1>Mistake notebook</h1>
    {mistakes.length?mistakes.map(row=>{
      const q=Array.isArray(row.questions)?row.questions[0]:row.questions;
      const learning=q?questionLearning(q,row.selected_answer):null;
      return <article className="panel stack" key={row.id}>
        <p className="eyebrow">{row.subject} · {q?.topic}</p><h2><RichText value={q?.prompt??''}/></h2>
        <p>Your response: {row.selected_answer} · Correct answer: {q?.correct_answer}</p><p><RichText value={q?.explanation??''}/></p>
        {learning?.error&&<p><RichText value={learning.error.explanation}/></p>}
        {learning&&<QuestionLearningPanel learning={learning}/>}
        <form action={classify} className="toolbar"><input type="hidden" name="id" value={row.id}/>
          <label>Error category<select name="category" defaultValue={row.error_category??''}><option value="">Uncategorized</option><option value="concept">Conceptual</option><option value="careless">Careless</option><option value="timing">Timing</option></select></label>
          <button>Save category</button>
        </form>
      </article>;
    }):<section className="panel"><p>Missed questions appear here after you check an answer or submit an assessment.</p></section>}
  </main></>;
}
