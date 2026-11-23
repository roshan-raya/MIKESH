import { notFound } from 'next/navigation';
import { z } from 'zod';
import Nav from '@/components/nav';
import { requireStudent } from '@/lib/student';
import { adminDb } from '@/lib/supabase/admin';
import Player, { type Item } from './player';
import { RichText } from '@/components/rich-text';
import Link from 'next/link';
import {byTopic} from '@/lib/courses';
import {questionLearning} from '@/lib/courses/question-learning';

export default async function Study({params}: {params: Promise<{id:string}>}) {
  const user = await requireStudent();
  const {id} = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const db = adminDb();
  const {data: session, error} = await db.from('sessions').select('*').eq('id',id).eq('user_id',user.id).maybeSingle();
  if (error) throw new Error('Session unavailable.');
  if (!session) notFound();
  const keyAllowed = session.finished_at || ['learn','topic','adaptive','review'].includes(session.mode);
  let query = db.from('session_questions').select('position,answer,flagged,confidence,seconds,graded,questions(id,bank_key,subject,topic,difficulty,objective,prompt,options,passages(title,body,figure))')
    .eq('session_id',id).order('position');
  if (!session.finished_at) query = query.eq('section',session.section);
  const [items, section] = await Promise.all([query,db.from('session_sections').select('subject').eq('session_id',id).eq('position',session.section).single()]);
  if (items.error || section.error) throw new Error('Could not load this section.');
  const records = items.data.map(row=>({...row,questions: Array.isArray(row.questions) ? row.questions[0] : row.questions}));
  const graded = keyAllowed ? records.filter(row=>row.graded).map(row=>row.questions.id) : [];
  const results = graded.length ? await db.from('questions').select('id,correct_answer,explanation,distractors').in('id',graded) : null;
  if (results?.error) throw new Error('Could not load explanations.');
  const questions: Item[] = records.map(row=>{
    const passage = row.questions.passages;
    const result = results?.data?.find(answer=>answer.id===row.questions.id);
    const learning=result?questionLearning(row.questions,row.answer):undefined;
    return {position:row.position, answer:row.answer, confidence:row.confidence, seconds:row.seconds, flagged:row.flagged,
      prompt:row.questions.prompt, options:row.questions.options, topic:row.questions.topic, subject:row.questions.subject,
      passage:Array.isArray(passage)?passage[0]:passage, result,learning};
  });
  const correct = questions.filter(q=>q.result && q.answer===q.result.correct_answer).length;
  const answered = questions.filter(q=>q.answer).length;
  const completed = Boolean(session.finished_at);
  const chapter=questions[0]&&byTopic(questions[0].subject,questions[0].topic);
  const denominator = ['learn','topic','adaptive','review'].includes(session.mode) ? answered : questions.length;
  return <><Nav/><main id="main" className="shell">
    <p className="eyebrow">{session.mode} · {completed?'Complete':section.data.subject.toLowerCase()}</p>
    <h1>{completed ? 'Session results' : session.mode==='writing' ? 'Writing practice' : 'Question studio'}</h1>
    {completed && <section className="panel">{session.mode==='writing' ? <><h2>Your essay</h2><p className="preserve">{session.essay || 'No essay submitted.'}</p></> :
      <><h2>{correct} correct out of {denominator}</h2><p>{answered} answered · {questions.length-answered} unanswered</p><p className="muted">This is practice performance. Form-specific ACT scale conversions are available in official practice materials.</p></>}
      {session.mode==='diagnostic' && <p><Link href="/analytics">View the diagnostic skill baseline</Link></p>}
      <div className="toolbar"><Link href="/practice">Return to practice setup</Link>
        {chapter&&<Link href={'/learn/'+chapter.slug+'?view=test'}>View chapter mastery</Link>}
      </div></section>}
    {(!completed || questions.length>0) && <Player key={id+'-'+session.section+'-'+completed} id={id} section={session.section} mode={session.mode} completed={completed}
      tutor={Boolean(process.env.ACT_TUTOR_OPENAI_KEY && process.env.ACT_TUTOR_MODEL)} deadline={session.deadline} essay={session.essay} items={questions}/>}
    {session.mode==='writing' && completed && <section className="panel"><h2>Self-review</h2><RichText value="Check whether your position is clear, whether you engage another perspective, and whether your examples establish how your reasoning works."/></section>}
  </main></>;
}
