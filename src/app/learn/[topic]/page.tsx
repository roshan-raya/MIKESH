import {connectedPrerequisites,connectedApplications} from '@/lib/courses/connections';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Nav from '@/components/nav';
import { RichText } from '@/components/rich-text';
import { requireStudent } from '@/lib/student';
import { bookmarkTask, chapterGraph, chapterLevels, prerequisitePath, type ChapterLevel } from '@/lib/courses/chapter';
import ParabolaStudy from '@/components/parabola-study';
import { Bookmark } from './chapter-controls';
import { bySlug, guidedTask } from '@/lib/courses';
import { adminDb } from '@/lib/supabase/admin';
import { history } from '@/lib/history';
import { masteryEvidence, masteryPolicy, nextLesson, subtopicWeakness } from '@/lib/courses/mastery';
import { recommendConcept } from '@/lib/courses/question-learning';
import { sourceLibrary } from '@/lib/courses/sources';
import CourseSession from './session-setup';
import { CourseProgress, Guided, GuidedCount, GuidedDone, Scratchpad } from './interactions';

const tabs=['learn','practice','review','test'] as const;

export default async function CoursePage({params,searchParams}:{
  params:Promise<{topic:string}>;
  searchParams:Promise<{lesson?:string;view?:string;level?:string;focus?:string}>;
}) {
  const student=await requireStudent();
  const [{topic},query]=await Promise.all([params,searchParams]);
  const course=bySlug(topic);
  if(!course) notFound();
  const graph=chapterGraph(course);
  const scoped=graph.find(node=>node.id===query.focus);
  const db=adminDb();
  const [progress,attempts,inventory,counts,testSessions]=await Promise.all([
    db.from('study_tasks').select('task').eq('user_id',student.id).in('task',course.lessons.flatMap(lesson=>[guidedTask(course.slug,lesson.id),bookmarkTask(course.slug,lesson.id)])),
    history(student.id),
    db.from('questions').select('id,topic,difficulty').eq('subject',course.subject).eq('status','verified').eq('holdout',false)
      .in('topic',course.practiceTopics??[course.topic]),
    scoped
      ? db.rpc('chapter_question_counts',{p_user:student.id,p_subject:course.subject,p_topics:course.practiceTopics??[course.topic],p_concepts:[scoped.id]})
      : db.rpc('course_question_counts',{p_user:student.id,p_subject:course.subject,p_topics:course.practiceTopics??[course.topic]}),
    db.from('course_tests').select('session_id').eq('user_id',student.id),
  ]);
  if(progress.error||inventory.error||(counts.error&&counts.error.code!=='PGRST202')) throw Error('Could not load your course progress.');
  const completed=new Set(course.lessons.filter(lesson=>progress.data.some(row=>row.task===guidedTask(course.slug,lesson.id))).map(lesson=>lesson.id));
  const level=Object.keys(chapterLevels).find(value=>value===query.level) as ChapterLevel|undefined;
  const levelLessons=level?course.lessons.filter(entry=>graph.some(node=>node.level===level&&node.id===entry.id)):[];
  const lesson=course.lessons.find(entry=>entry.id===query.lesson)??nextLesson(levelLessons.length?levelLessons:course.lessons,completed);
  const currentNode=graph.find(node=>node.id===lesson.id);
  const bookmarks=new Set(progress.data.map(row=>row.task));
  const availableLevels=[...new Set(graph.map(node=>node.level))];
  const active=tabs.find(tab=>tab===query.view)??'learn';
  const link=(view:string,section=lesson.id)=>`/learn/${course.slug}?view=${view}&lesson=${section}`;
  const labels=new Map(course.lessons.map(entry=>[entry.id,entry.title]));
  const path=prerequisitePath(graph,lesson.id);
  const foundations=connectedPrerequisites(course.slug,lesson.id);
  const applications=connectedApplications(course.slug,lesson.id);
  const checkpoint=link('test')+'&focus='+lesson.id;
  const unseenSessions=new Set<string>((testSessions.data??[]).map(row=>row.session_id));
  const evidence=masteryEvidence(attempts,course.subject,course.practiceTopics??[course.topic],masteryPolicy,unseenSessions);
  const focusedEvidence=scoped?masteryEvidence(attempts.filter(attempt=>attempt.subtopic===scoped.id),course.subject,course.practiceTopics??[course.topic],masteryPolicy,unseenSessions):null;
  const specific=recommendConcept(attempts,course.slug);
  const weakness=subtopicWeakness(attempts,course.subject,course.practiceTopics??[course.topic]);
  const weakLesson=course.lessons.find(entry=>entry.id===weakness?.id);
  const recommended=course.lessons.find(entry=>entry.id===weakLesson?.dependsOn)??weakLesson;
  const next=course.lessons[course.lessons.indexOf(lesson)+1];
  const topicPractice='/practice?mode=topic&subject='+course.subject+'&topic='+encodeURIComponent(course.topic);
  const timedPractice='/practice?mode=timed&subject='+course.subject+'&topic='+encodeURIComponent(course.topic);
  const prerequisite=course.lessons.find(entry=>entry.id===lesson.dependsOn);
  const weak=attempts.filter(attempt=>attempt.subject===course.subject&&attempt.topic===course.topic&&!attempt.is_correct);
  const sourceKeys=[...new Set(lesson.sources)];
  return <><Nav/><CourseProgress key={course.slug} initial={[...completed]}><main id="main" className="shell">
    <p><Link href="/syllabus">Syllabus</Link> <span className="muted">/ {course.subject.toLowerCase()} / {course.domain}</span></p>
    <header className="hero"><h1>{course.slug==='quadratics'?'Quadratic Equations':course.topic}</h1><p>{course.overview}</p>
      {specific?<p>{specific.misses} missed questions share a related skill. <a className="primary" href={specific.href}>Review {specific.title}</a></p>:recommended&&<p>{weakLesson?.title} shows repeated errors. <a className="primary" href={link('learn',recommended.id)}>Revisit {recommended.title.toLowerCase()}</a></p>}
      <div className="toolbar"><a className="primary" href={link('learn',course.lessons[0].id)}>Teach Me From the Basics</a>
        <Link prefetch={false} className="primary" href="/textbook">Browse textbook</Link></div>
      <p>{course.lessons.reduce((sum,entry)=>sum+entry.minutes,0)} min · <GuidedCount total={course.lessons.length}/></p>
    </header>
    {course.draftPracticeCount&&!inventory.data.some(question=>question.topic===course.topic)&&<p className="muted">{course.draftPracticeCount} original practice questions are awaiting editorial review. The guided checkpoints are available now.</p>}
    <nav className="toolbar" aria-label="Course activities">
      {tabs.map(tab=><a className={tab===active?'primary':'tab-link'} aria-current={tab===active?'page':undefined} key={tab} href={link(tab)}>{tab.charAt(0).toUpperCase()+tab.slice(1)}</a>)}
    </nav>
    {active==='learn'&&<nav className="toolbar" aria-label="Chapter levels">
      {availableLevels.map(value=><a key={value} className={currentNode?.level===value?'primary':'tab-link'} aria-current={currentNode?.level===value?'page':undefined}
        href={`/learn/${course.slug}?level=${value}`}>{chapterLevels[value]}</a>)}
    </nav>}
    {active==='learn'&&<div className="course-layout">
      <aside className="panel"><h2>Table of contents</h2>
        {availableLevels.map(value=><div key={value}><h3>{chapterLevels[value]}</h3><ol className="rows">
          {course.lessons.filter(entry=>graph.some(node=>node.level===value&&node.id===entry.id)).map(entry=><li key={entry.id}>
            <a aria-current={entry.id===lesson.id?'page':undefined} href={link('learn',entry.id)}>{entry.title}</a>
            <span className="muted"> · {entry.minutes} min<GuidedDone id={entry.id}/></span>
          </li>)}
        </ol></div>)}
      </aside>
      <div className="stack">
        <article className="panel stack"><h2>{lesson.title}</h2>
          <Bookmark key={lesson.id} course={course.slug} lesson={lesson.id} initial={bookmarks.has(bookmarkTask(course.slug,lesson.id))}/>
          <section><h3>Learning objectives</h3><ul className="course-bullets">{lesson.objectives.map(value=><li key={value}><RichText value={value}/></li>)}</ul></section>
          <section><h3>Check your prerequisites</h3><ul className="course-bullets">{lesson.prerequisites.map(value=><li key={value}><RichText value={value}/></li>)}</ul>
            {prerequisite&&<p><a href={link('learn',prerequisite.id)}>Review {prerequisite.title.toLowerCase()}</a></p>}
          </section>
          {lesson.instruction.map(section=><section key={section.title}><h3>{section.title}</h3><p><RichText value={section.body}/></p></section>)}
        </article>
        {course.slug==='quadratics'&&['roots-and-vertex','quadratic-models'].includes(lesson.id)&&<ParabolaStudy/>}
        <section className="panel stack"><h2>Concept dependency graph</h2>
          {path.length?<ol className="chapter-graph">{[...path,currentNode!].map(node=><li key={node.id}>
            <a href={link('learn',node.id)}>{labels.get(node.id)}</a>
            {node.prerequisites.length>0&&<span className="muted"> · Builds on {node.prerequisites.map((id,index)=><span key={id}>
              {index>0?', ':''}<a href={link('learn',id)}>{labels.get(id)}</a>
            </span>)}</span>}
          </li>)}</ol>:<p>This concept starts from the prerequisites listed above.</p>}
          {foundations.length>0&&<><h3>Foundations in other chapters</h3><ul className="rows">
            {foundations.map(item=><li key={item.link}><a href={item.link}>{item.title}</a> · {item.chapter}</li>)}
          </ul></>}
          {applications.length>0&&<><h3>Apply this in another chapter</h3><ul className="rows">
            {applications.map(item=><li key={item.link}><a href={item.link}>{item.title}</a> · {item.chapter}</li>)}
          </ul></>}
        </section>
        <section className="panel stack"><h2>Worked examples</h2>{lesson.examples.map(example=><details className="example" key={example.title}>
          <summary>{example.title}</summary><p><RichText value={example.prompt}/></p>
          <ol className="course-steps">{example.steps.map((step,index)=><li key={step}><details><summary>Step {index+1}</summary><p><RichText value={step}/></p></details></li>)}</ol>
          {example.table&&<details><summary>Show the comparison table</summary><table>
            <caption>{example.table.caption}</caption><thead><tr>{example.table.headings.map(heading=><th key={heading} scope="col">{heading}</th>)}</tr></thead>
            <tbody>{example.table.rows.map(([row,...values])=><tr key={row}><th scope="row"><RichText value={row}/></th>
              {values.map((value,index)=><td key={index}><RichText value={value}/></td>)}</tr>)}</tbody>
          </table></details>}
        </details>)}</section>
        <section className="panel stack"><h2>Guided practice</h2><Guided key={lesson.id} course={course.slug} lesson={lesson.id}
          prompt={lesson.guided.prompt} hint={lesson.guided.hint} choices={lesson.guided.choices}/>
        </section>
        {course.subject==='MATH'&&<Scratchpad key={course.slug} storageKey={'act-scratch-'+student.id+'-'+course.slug}/>}
        <section className="panel stack"><h2>Common errors and test strategy</h2>
          <ul className="course-bullets">{lesson.pitfalls.map(value=><li key={value}><RichText value={value}/></li>)}</ul>
          <p><RichText value={lesson.timing}/></p>
          <h3>Revision summary</h3><p><RichText value={lesson.summary}/></p>
          <div className="toolbar"><a className="primary" href={link('practice')+(course.concepts?'&focus='+lesson.id:'')}>Independent practice</a>
            {course.subject!=='WRITING'&&<a href={checkpoint}>Test this concept</a>}
            {course.subject!=='WRITING'&&<a href={link('test')}>Chapter quiz</a>}{next&&<a href={link('learn',next.id)}>Next lesson: {next.title}</a>}</div>
        </section>
        <section className="panel"><h2>References and review</h2><p className="muted">Original instruction and examples. Editorial review pending.</p><ul className="rows">
          {sourceKeys.map(key=><li key={key}><a href={sourceLibrary[key].url}>{sourceLibrary[key].title}</a></li>)}
        </ul></section>
      </div>
    </div>}
    {active==='practice'&&<section className="panel stack"><h2>Independent practice</h2>
      {course.subject==='WRITING'?<p>Draft an argument and revise it against the four ACT writing domains. <a href="/practice?mode=writing">Open timed essay practice</a>.</p>:<p>{inventory.data.length} available questions across this course’s linked topics.</p>}
      {course.subject!=='WRITING'&&scoped&&<p>Practice focus · {labels.get(scoped.id)}</p>}
      {scoped&&!counts.data&&<p className="muted">Focused practice requires database migrations 004 and 007.</p>}
      {course.subject!=='WRITING'&&counts.data&&<CourseSession key={'practice-'+scoped?.id} slug={course.slug} counts={counts.data} mastery={false} focus={scoped?.id}/>}
      <ul className="rows">{(course.practiceTopics??[course.topic]).map(topic=>{
        const count=inventory.data.filter(question=>question.topic===topic).length;
        const params=`subject=${course.subject}&topic=${encodeURIComponent(topic)}`;
        return <li key={topic}>{topic} · {count} {count===1?'question':'questions'} {count>0&&<span className="toolbar">
          <a href={'/practice?mode=topic&'+params}>Untimed</a><a href={'/practice?mode=timed&'+params}>Timed</a>
        </span>}</li>;
      })}</ul>
    </section>}
    {active==='review'&&<section className="panel stack"><h2>Review this topic</h2><p>{weak.length} recorded {weak.length===1?'miss':'misses'}.</p>
      {weak.length>0?<a href={'/mistakes?subject='+course.subject+'&topic='+encodeURIComponent(course.topic)}>Inspect attempts and explanations</a>:<p>Misses will appear here after practice.</p>}
      <a href="/review">Open spaced review</a>
      {prerequisite&&<a href={link('learn',prerequisite.id)}>Revisit {prerequisite.title.toLowerCase()}</a>}
    </section>}
    {active==='test'&&course.subject==='WRITING'&&<section className="panel stack"><h2>Writing self-assessment</h2>
      <p>Write a timed essay, then verify that it states a position, analyzes another perspective, supports each claim, and uses clear transitions.</p>
      <a href="/practice?mode=writing">Start a timed essay</a><a href={sourceLibrary['act-writing'].url}>Read the writing criteria</a>
    </section>}
    {active==='test'&&course.subject!=='WRITING'&&<section className="panel stack"><h2>Mastery evidence</h2>
      {scoped&&<div><p>Retest focus · {labels.get(scoped.id)}</p>
        <p className="muted">{focusedEvidence?.samples??0} first responses and {focusedEvidence?.timed??0} correct timed unseen responses for this concept.</p></div>}
      <p><strong>{evidence.mastered?'Mastery threshold reached':'Mastery evidence still developing'}</strong></p>
      <h3>Chapter-wide evidence</h3>
      <ul className="rows">
        <li>{evidence.samples}/{masteryPolicy.samples} first-response practice items</li>
        <li>{Math.round(evidence.rate*100)}% accuracy toward {Math.round(masteryPolicy.accuracy*100)}%</li>
        <li>{evidence.timed}/{masteryPolicy.timed} correct first responses under time limits</li>
        <li>{evidence.hard}/{masteryPolicy.hard} correct first responses on difficult items</li>
      </ul>
      <p className="muted">Repeated, unanswered, and guessed-correct items cannot raise the mastery result. Guided completion is tracked separately.</p>
      {counts.data?<CourseSession key={'test-'+scoped?.id} slug={course.slug} counts={counts.data} mastery focus={scoped?.id}/>:
        <p className="muted">{scoped?'Focused unseen retests require database migrations 004 and 007.':'Unseen mastery checks require database migration 004.'}</p>}
      <div className="toolbar">{scoped&&<a href={link('test')}>Open the whole chapter quiz</a>}<a href={timedPractice}>Start a timed {course.topic} drill</a><a href={topicPractice}>Build the evidence in practice</a></div>
    </section>}
  </main></CourseProgress></>;
}
