import Link from 'next/link';
import Nav from '@/components/nav';
import { requireStudent } from '@/lib/student';
import { adminDb } from '@/lib/supabase/admin';
import { practiceInventory } from '@/lib/practice-inventory';
import Setup from './setup';

export default async function PracticePage({searchParams}: {searchParams: Promise<{mode?: string; topic?: string; subject?: string}>}) {
  const user = await requireStudent();
  const query = await searchParams;
  const db = adminDb();
  const [recent, assessment, templates, inventory] = await Promise.all([
    db.from('sessions').select('id,mode,finished_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(12),
    db.from('sessions').select('id,mode').eq('user_id',user.id).is('finished_at',null)
      .in('mode',['diagnostic','timed','mock']).order('created_at',{ascending:false}).limit(1).maybeSingle(),
    db.from('exam_templates').select('subject,question_count,minutes,optional').order('position'),
    practiceInventory(user.id),
  ]);
  if (recent.error || assessment.error || templates.error) throw new Error('Practice setup is unavailable.');
  return <><Nav/><main id="main" className="shell">
    <p className="eyebrow">Study studio</p><h1>Set up your practice</h1>
    <p className="muted">Work on a skill, build speed, or see how you do on unfamiliar questions.</p>
    <div className="split">
      <section className="panel">
        {assessment.data ? <div className="stack">
          <h2>Assessment in progress</h2><p>Submit your active assessment to start another session.</p>
          <div><Link className="primary" href={'/study/'+assessment.data.id}>Resume assessment</Link></div>
        </div> : <Setup inventory={inventory} templates={templates.data} initial={query}/>}
      </section>
      <section className="panel"><h2>Enhanced ACT format</h2>
        <table><thead><tr><th>Section</th><th>Items</th><th>Minutes</th></tr></thead>
          <tbody>{templates.data.map(t=><tr key={t.subject}><td>{t.subject.toLowerCase()}{t.optional?' (optional)':''}</td><td>{t.question_count}</td><td>{t.minutes}</td></tr>)}</tbody>
        </table><p className="muted">Mock exams require a complete unseen form. Optional writing practice is a separate timed session.</p>
      </section>
    </div>
    <section className="panel"><h2>Recent sessions</h2>
      {recent.data.length ? <ul className="rows">{recent.data.map(s=><li key={s.id}><Link href={'/study/'+s.id}>{s.mode} · {s.finished_at?'View results':'Resume'}</Link></li>)}</ul> : <p className="muted">Your sessions will appear here after you start.</p>}
    </section>
  </main></>;
}
