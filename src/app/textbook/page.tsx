import Link from 'next/link';
import Nav from '@/components/nav';
import {courses,guidedTask} from '@/lib/courses';
import {bookmarkTask,chapterGraph,chapterLevels,type ChapterLevel} from '@/lib/courses/chapter';
import {adminDb} from '@/lib/supabase/admin';
import {requireStudent} from '@/lib/student';

const subjects=[['MATH','Math'],['ENGLISH','English'],['READING','Reading'],['SCIENCE','Science · Optional'],['WRITING','Writing · Optional']];

export default async function Textbook(){
  const student=await requireStudent();
  const keys=courses.flatMap(course=>course.lessons.flatMap(lesson=>[guidedTask(course.slug,lesson.id),bookmarkTask(course.slug,lesson.id)]));
  const {data,error}=await adminDb().from('study_tasks').select('task').eq('user_id',student.id).in('task',keys);
  if(error) throw Error('Could not load your textbook progress.');
  const tasks=new Set(data.map(row=>row.task));
  const saved=courses.flatMap(course=>course.lessons.filter(lesson=>tasks.has(bookmarkTask(course.slug,lesson.id))).map(lesson=>({course,lesson})));
  return <><Nav/><main id="main" className="shell">
    <header className="hero"><h1>ACT textbook</h1><p>Start with a concept, work through an example, then check your understanding.</p>
      <Link prefetch={false} className="primary" href="/learn/quadratics">Continue Quadratic Equations</Link></header>
    <section className="panel stack"><h2>Bookmarked lessons</h2>
      {saved.length?<ul className="rows">{saved.map(({course,lesson})=><li key={course.slug+'/'+lesson.id}>
        <Link prefetch={false} href={`/learn/${course.slug}?lesson=${lesson.id}`}>{lesson.title}</Link> · {course.topic}
      </li>)}</ul>:<p className="muted">Save a lesson from its chapter to return here.</p>}
    </section>
    {subjects.map(([subject,title])=><section className="panel stack" key={subject}><h2>{title}</h2>
      <ul className="rows">{courses.filter(course=>course.subject===subject).map(course=>{
        const done=course.lessons.filter(lesson=>tasks.has(guidedTask(course.slug,lesson.id))).length;
        const levels=new Set<ChapterLevel>(chapterGraph(course).map(concept=>concept.level));
        return <li key={course.slug}>
          <Link prefetch={false} href={'/learn/'+course.slug}>{course.slug==='quadratics'?'Quadratic Equations':course.topic}</Link>
          <p>{done}/{course.lessons.length} checkpoints complete · {course.concepts?'Full four-level instruction':'Selected lessons'} · {levels.size} levels available{course.draftPracticeCount?' · Practice bank requires editorial approval':''}</p>
        </li>;
      })}</ul>
    </section>)}
    <Link prefetch={false} href="/syllabus">View the complete curriculum coverage map</Link>
  </main></>;
}
