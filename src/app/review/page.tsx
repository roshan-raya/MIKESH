import Link from 'next/link';
import Nav from '@/components/nav';
import {requireStudent} from '@/lib/student';
import {adminDb} from '@/lib/supabase/admin';

export default async function Review(){
  const user=await requireStudent();
  const {data,error}=await adminDb().from('review_items').select('question_id,due_at,interval_days,questions(subject,topic)')
    .eq('user_id',user.id).order('due_at');
  if(error) throw Error('Could not load the review schedule.');
  const date=new Intl.DateTimeFormat('en-US',{dateStyle:'medium',timeZone:'America/Phoenix'});
  const due=data.filter(row=>Date.parse(row.due_at)<=Date.now()).length;
  return <><Nav/><main id="main" className="shell"><p className="eyebrow">Retention</p><h1>Review schedule</h1>
    <section className="panel stack"><h2>{due} due now</h2>
      <p className="muted">Missed practice questions return after one day. Correct reviews double the interval up to 30 days.</p>
      {due>0 && <div><Link className="primary" href="/practice?mode=review">Start due review</Link></div>}
      {data.length ? <ul className="rows">{data.map(row=>{
        const q=Array.isArray(row.questions)?row.questions[0]:row.questions;
        return <li key={row.question_id}><strong>{q?.topic}</strong> · {Date.parse(row.due_at)<=Date.now()?'Due now':date.format(new Date(row.due_at))} · {row.interval_days}-day interval</li>;
      })}</ul>:<p>Complete a practice session to build your queue.</p>}
    </section>
  </main></>;
}
