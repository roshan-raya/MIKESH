import Link from 'next/link';
import {z} from 'zod';
import {revalidatePath} from 'next/cache';
import Nav from '@/components/nav';
import {requireStudent} from '@/lib/student';
import {adminDb} from '@/lib/supabase/admin';
import {history} from '@/lib/history';
import {accuracy,studyDay,summarize,type Attempt} from '@/lib/metrics';
import {composite,subjects} from '@/lib/study';
import Trend from './chart';

async function recordScore(form:FormData){
  'use server';
  const user=await requireStudent();
  const data=z.object({form:z.string().trim().min(1).max(100),taken_on:z.string().date(),
    english:z.coerce.number().int().min(1).max(36),math:z.coerce.number().int().min(1).max(36),reading:z.coerce.number().int().min(1).max(36)})
    .parse(Object.fromEntries(form));
  const {error}=await adminDb().from('score_history').insert({...data,user_id:user.id});
  if(error) throw Error('Could not record score.');
  revalidatePath('/analytics');
}
export default async function Analytics(){
  const user=await requireStudent();
  const db=adminDb();
  const [attempts,scores,sessions]=await Promise.all([history(user.id),db.from('score_history').select('*').eq('user_id',user.id).order('taken_on',{ascending:false}),
    db.from('sessions').select('id,mode,created_at,finished_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(10)]);
  if(scores.error||sessions.error) throw Error('Could not load analytics.');
  const {first,repeats,mastery}=summarize(attempts);
  const groups=new Map<string,Attempt[]>();
  for(const attempt of attempts){
    const day=studyDay(attempt.created_at);
    groups.set(day,[...(groups.get(day)??[]),attempt]);
  }
  const points=[...groups.entries()].sort(([a],[b])=>a.localeCompare(b)).slice(-14).map(([day,rows])=>({day,percent:parseInt(accuracy(rows))}));
  const timed=attempts.filter(a=>['timed','mock'].includes(a.mode));
  const untimed=attempts.filter(a=>!['timed','mock'].includes(a.mode));
  const times=attempts.filter(a=>a.seconds!==null&&a.selected_answer!=='Unanswered').map(a=>a.seconds!);
  const baseline=attempts.filter(a=>a.mode==='diagnostic');
  const diagnosticSkills=[...new Set(baseline.map(a=>a.subject+'/'+a.topic))].map(key=>{
    const evidence=baseline.filter(a=>a.subject+'/'+a.topic===key);
    return {key,topic:evidence[0].topic,subject:evidence[0].subject,correct:evidence.filter(a=>a.is_correct).length,count:evidence.length};
  });
  return <><Nav/><main id="main" className="shell"><p className="eyebrow">Practice evidence</p><h1>Performance analytics</h1>
    <p className="muted">Small samples can swing widely. Skill accuracy uses first responses from practice. The unseen diagnostic is shown separately.</p>
    <div className="cards">{[['First try',first],['Repeat',repeats],['Timed',timed],['Untimed',untimed]].map(([label,rows])=><section key={String(label)} className="panel"><h2>{String(label)}</h2><p className="stat">{accuracy(rows as Attempt[])}</p><p>{(rows as Attempt[]).length} responses</p></section>)}</div>
    <div className="split">
      <section className="panel"><h2>Accuracy by section</h2><table><thead><tr><th>Subject</th><th>Practice</th><th>Diagnostic</th></tr></thead><tbody>
        {subjects.map(subject=><tr key={subject}><td>{subject}</td><td>{accuracy(attempts.filter(a=>a.subject===subject&&!a.holdout))}</td><td>{accuracy(baseline.filter(a=>a.subject===subject))}</td></tr>)}
      </tbody></table></section>
      <section className="panel"><h2>Time per answered question</h2><ul className="rows">
        <li>Under 30 seconds · {times.filter(s=>s<30).length}</li><li>30–59 seconds · {times.filter(s=>s>=30&&s<60).length}</li>
        <li>60–89 seconds · {times.filter(s=>s>=60&&s<90).length}</li><li>90 seconds or longer · {times.filter(s=>s>=90).length}</li>
      </ul></section>
    </div>
    <div className="split">
      <section className="panel"><h2>First-response skill accuracy</h2>{mastery.length?<table><thead><tr><th>Skill</th><th>Correct</th></tr></thead><tbody>
        {mastery.map(s=><tr key={s.subject+s.topic}><td><Link href={`/practice?mode=topic&subject=${s.subject}&topic=${encodeURIComponent(s.topic)}`}>{s.topic}</Link></td><td><meter min={0} max={s.count} value={s.correct} aria-label={s.topic+' first-response accuracy'}/> {s.correct}/{s.count}</td></tr>)}
      </tbody></table>:<p>No first-try practice data yet.</p>}</section>
      <section className="panel"><h2>Why answers were missed</h2><ul className="rows">{['concept','careless','timing',null].map(category=><li key={category??'none'}>{category??'Uncategorized'} · {attempts.filter(a=>!a.is_correct&&a.error_category===category).length}</li>)}</ul><Link href="/mistakes">Categorize mistakes</Link></section>
    </div>
    <section className="panel"><h2>Diagnostic skill baseline</h2>{diagnosticSkills.length?<ul className="rows">
      {diagnosticSkills.map(skill=><li key={skill.key}>{skill.subject} · {skill.topic} · {skill.correct}/{skill.count}</li>)}
    </ul>:<p><Link href="/diagnostic">Take the core diagnostic</Link> to establish a baseline.</p>}</section>
    <section className="panel"><h2>Practice trend</h2>{points.length?<><Trend points={points}/><details><summary>View daily data</summary><ul className="rows">{points.map(p=><li key={p.day}>{p.day} · {p.percent}%</li>)}</ul></details></>:<p>Submit responses to see your trend.</p>}</section>
    <section className="panel"><h2>Session history</h2>{sessions.data.length?<ul className="rows">{sessions.data.map(s=><li key={s.id}><Link href={'/study/'+s.id}>{studyDay(s.created_at)} · {s.mode} · {s.finished_at?'Results':'Resume'}</Link></li>)}</ul>:<p>No sessions yet.</p>}</section>
    <section className="panel stack"><h2>Official practice-form scores</h2><p>Enter scaled section scores from the form’s own scoring guide. Keep the form identifier for comparison.</p>
      <form action={recordScore} className="stack"><div className="split"><label>Form identifier<input name="form" required maxLength={100}/></label><label>Date taken<input type="date" name="taken_on" required/></label></div>
        <div className="cards">{['English','Math','Reading'].map(s=><label key={s}>{s}<input name={s.toLowerCase()} type="number" min={1} max={36} required/></label>)}</div><div><button className="primary">Record official practice score</button></div>
      </form>
      <ul className="rows">{scores.data.map(row=><li key={row.id}>{row.taken_on} · {row.form} · Composite {composite([row.english,row.math,row.reading])} · Self-reported</li>)}</ul>
    </section>
  </main></>;
}
