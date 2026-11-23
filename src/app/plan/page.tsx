import Link from 'next/link';
import {revalidatePath} from 'next/cache';
import {z} from 'zod';
import Nav from '@/components/nav';
import {requireStudent} from '@/lib/student';
import {adminDb} from '@/lib/supabase/admin';
import {history} from '@/lib/history';
import {studyDay,weakestTopic} from '@/lib/metrics';

const keys=['review','focus','reflect','timed','endurance'] as const;
async function toggle(form:FormData){
  'use server';
  const user=await requireStudent();
  const task=z.enum(keys).parse(form.get('task'));
  const task_date=studyDay(new Date());
  const table=adminDb().from('study_tasks');
  const result=form.get('complete')==='true' ? await table.upsert({user_id:user.id,task_date,task}) :
    await table.delete().eq('user_id',user.id).eq('task_date',task_date).eq('task',task);
  if(result.error) throw Error('Could not update your checklist.');
  revalidatePath('/plan');
}
export default async function Plan(){
  const user=await requireStudent();
  const today=studyDay(new Date());
  const db=adminDb();
  const [attempts,profile,tasks]=await Promise.all([history(user.id),db.from('profiles').select('daily_minutes').eq('user_id',user.id).maybeSingle(),
    db.from('study_tasks').select('task').eq('user_id',user.id).eq('task_date',today)]);
  if(profile.error||tasks.error) throw Error('Could not load your plan.');
  const budget=profile.data?.daily_minutes??30;
  const review=Math.max(3,Math.round(budget*.25));
  const reflect=Math.max(2,Math.round(budget*.15));
  const weak=weakestTopic(attempts);
  const focus=weak?'/practice?mode=topic&subject='+weak.subject+'&topic='+encodeURIComponent(weak.topic):attempts.length?'/practice?mode=adaptive':'/diagnostic';
  const rows=[
    {key:'review', label:`Review due questions · ${review} min`, href:'/review'},
    {key:'focus',label:`${weak?'Practice '+weak.topic:attempts.length?'Build first-response evidence':'Establish a diagnostic baseline'} · ${budget-review-reflect} min`,href:focus},
    {key:'reflect',label:`Record why a mistake happened · ${reflect} min`,href:'/mistakes'},
  ];
  return <><Nav/><main id="main" className="shell"><p className="eyebrow">Mastery milestones</p><h1>Study plan</h1>
    <section className="panel stack"><h2>Today · {budget} minutes</h2><p>Stop at your workload target. Save unfinished work for the next session.</p>
      <ul className="rows">{rows.map(row=>{
        const complete=tasks.data.some(task=>task.task===row.key);
        return <li className="toolbar" key={row.key}><Link href={row.href}>{row.label}</Link><form action={toggle}>
          <input type="hidden" name="task" value={row.key}/><input type="hidden" name="complete" value={String(!complete)}/>
          <button aria-label={(complete?'Reopen ':'Complete ')+row.label}>{complete?'Done · Reopen':'Mark done'}</button>
        </form></li>;
      })}</ul>
      <Link href="/settings">Adjust workload</Link>
    </section>
    <section className="panel stack"><h2>This week</h2><p>Complete one timed section drill, review every miss, and compare first-try accuracy and time with the previous week. Every few weeks, schedule a full official practice form to build endurance.</p>
      <Link href="/practice?mode=timed">Set up a timed drill</Link><Link href="https://www.act.org/content/act/en/products-and-services/the-act/test-preparation/free-act-test-prep.html">Official ACT practice forms</Link></section>
  </main></>;
}
