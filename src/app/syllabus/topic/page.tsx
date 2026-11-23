import Link from 'next/link';
import {notFound,redirect} from 'next/navigation';
import {z} from 'zod';
import Nav from '@/components/nav';
import {requireStudent} from '@/lib/student';
import {adminDb} from '@/lib/supabase/admin';
import {byTopic,courses} from '@/lib/courses';
import {plannedPrerequisites,reportingWeights,topicScope} from '@/lib/courses/coverage';
import {sourceLibrary} from '@/lib/courses/sources';

const route=z.object({
  subject:z.enum(['ENGLISH','MATH','READING','SCIENCE','WRITING']),
  topic:z.string().min(1).max(120),
});

export default async function TopicCoverage({searchParams}:{searchParams:Promise<{subject?:string;topic?:string}>}) {
  await requireStudent();
  const selection=route.safeParse(await searchParams);
  if(!selection.success) notFound();
  const {subject,topic}=selection.data;
  const course=byTopic(subject,topic);
  if(course) redirect('/learn/'+course.slug);
  const db=adminDb();
  const params='subject='+subject+'&topic='+encodeURIComponent(topic);
  const [mapped,practice,note]=await Promise.all([
    db.from('topics').select('reporting_category').eq('subject',subject).eq('name',topic).maybeSingle(),
    db.from('questions').select('id',{head:true,count:'exact'}).eq('subject',subject).eq('topic',topic).eq('status','verified').eq('holdout',false),
    db.from('lessons').select('title,slug').eq('subject',subject).eq('topic',topic).order('title'),
  ]);
  if(mapped.error||practice.error||note.error) throw Error('Could not load this topic.');
  if(!mapped.data) notFound();
  const domain=mapped.data.reporting_category??'Supplemental skills';
  const prerequisite=plannedPrerequisites[topic];
  const related=courses.filter(entry=>entry.subject===subject&&entry.practiceTopics?.includes(topic));
  const source=sourceLibrary['act-'+subject.toLowerCase()];
  return <><Nav/><main id="main" className="shell">
    <p><Link href="/syllabus">Syllabus</Link> <span className="muted">/ {subject.toLowerCase()} / {domain}</span></p>
    <h1>{topic}</h1>
    <section className="panel stack"><h2>Curriculum coverage</h2>
      {topicScope[topic]&&<p>{topicScope[topic]}.</p>}
      {reportingWeights[subject]?.[domain]&&<p>Reporting category share · {reportingWeights[subject][domain]}</p>}
      <p>Detailed lessons for this topic are pending.</p>
      {prerequisite&&<Link href={'/syllabus/topic?subject='+subject+'&topic='+encodeURIComponent(prerequisite)}>Review prerequisite: {prerequisite}</Link>}
      {note.data.map(lesson=><Link key={lesson.slug} href={'/syllabus/'+lesson.slug}>Starter lesson: {lesson.title}</Link>)}
      {related.map(entry=><Link key={entry.slug} href={'/learn/'+entry.slug}>Related course: {entry.topic}</Link>)}
      <a href={source.url}>{source.title}</a>
    </section>
    {subject==='WRITING'?<section className="panel stack"><h2>Practice</h2><Link href="/practice?mode=writing">Open essay practice</Link></section>:
      <section className="panel stack"><h2>Practice</h2><p>{practice.count??0} questions available.</p>
        {Boolean(practice.count)&&<div className="toolbar"><Link href={'/practice?mode=topic&'+params}>Untimed practice</Link><Link href={'/practice?mode=timed&'+params}>Timed practice</Link></div>}
      </section>}
  </main></>;
}
