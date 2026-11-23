import Link from 'next/link';
import Nav from '@/components/nav';
import { requireStudent } from '@/lib/student';
import { history } from '@/lib/history';
import { accuracy, streak, weakestTopic } from '@/lib/metrics';
import { recommendConcept } from '@/lib/courses/question-learning';
import { byTopic } from '@/lib/courses';
import { subjects } from '@/lib/study';
import { adminDb } from '@/lib/supabase/admin';

export default async function Dashboard(){
  const user=await requireStudent();
  const db=adminDb();
  const [attempts,{data:active,error},{count:due,error:reviewError}]=await Promise.all([
    history(user.id),db.from('sessions').select('id,mode').eq('user_id',user.id).is('finished_at',null).order('created_at',{ascending:false}).limit(10),
    db.from('review_items').select('question_id',{count:'exact',head:true}).eq('user_id',user.id).lte('due_at',new Date().toISOString()),
  ]);
  if(error||reviewError) throw Error('Could not load study activity.');
  const assessment=active?.find(s=>['diagnostic','timed','mock'].includes(s.mode));
  const resume=assessment??active?.[0];
  const weak=weakestTopic(attempts);
  const concept=recommendConcept(attempts);
  const weakCourse=weak?byTopic(weak.subject,weak.topic):null;
  const counts=attempts.filter(a=>a.selected_answer!=='Unanswered');
  return <><Nav/><main id="main" className="shell">
    <section className="hero"><p className="eyebrow">Target composite 34–36</p>
      <h1>Your study dashboard</h1>
      <p>{resume?'Pick up your saved work.':attempts.length?'Build accuracy, then make it hold up under time.':'Start with an unseen English, Math, and Reading diagnostic to find your first priorities.'}</p>
      <Link className="primary" href={resume?'/study/'+resume.id:attempts.length?'/practice?mode=adaptive':'/diagnostic'}>{resume?'Resume session':attempts.length?'Start adaptive practice':'Take the diagnostic'}</Link>
    </section>
    <div className="cards">
      <div className="panel"><h2>Questions answered</h2><p className="stat">{counts.length}</p></div>
      <div className="panel"><h2>Practice accuracy</h2><p className="stat">{accuracy(counts)}</p></div>
      <div className="panel"><h2>Study streak</h2><p className="stat">{streak(counts)} days</p></div>
    </div>
    <div className="split">
      <section className="panel stack"><h2>Next study priority</h2>
        <p>{weak?'Revisit '+weak.topic+' in '+weak.subject.toLowerCase()+'.':'Practice several questions in one topic to identify a weakness.'}</p>
        <Link href={weakCourse?'/learn/'+weakCourse.slug:weak?'/practice?mode=topic&subject='+weak.subject+'&topic='+encodeURIComponent(weak.topic):'/syllabus'}>{weakCourse?'Study the recommended course':weak?'Practice this topic':'Explore the syllabus'}</Link>
        {concept&&<p><Link href={concept.href}>Review {concept.title}</Link> · {concept.misses} related missed questions</p>}
        <Link href="/textbook">Continue learning in the textbook</Link>
      </section>
      <section className="panel stack"><h2>Spaced review</h2><p>{due===1?'1 question is due.':(due??0)+' questions are due.'}</p><Link href="/review">View review schedule</Link></section>
    </div>
    <section className="panel"><h2>Subject accuracy</h2>
      <ul className="rows">{subjects.map(subject=>{
        const evidence=counts.filter(attempt=>attempt.subject===subject&&!attempt.holdout);
        const correct=evidence.filter(attempt=>attempt.is_correct).length;
        return <li className="toolbar" key={subject}><strong>{subject.charAt(0)+subject.slice(1).toLowerCase()}</strong>
          {evidence.length>0&&<meter min={0} max={evidence.length} value={correct} aria-label={subject+' accuracy'}/>}
          <span>{evidence.length>0?`${accuracy(evidence)} across ${evidence.length} answers`:'No practice answers yet'}</span></li>;
      })}</ul>
      <Link href="/analytics">View performance analytics</Link>
    </section>
  </main></>;
}
