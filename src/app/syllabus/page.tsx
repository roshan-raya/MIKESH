import Link from 'next/link';
import Nav from '@/components/nav';
import {requireStudent} from '@/lib/student';
import {adminDb} from '@/lib/supabase/admin';
import {byTopic} from '@/lib/courses';
import {sourceLibrary} from '@/lib/courses/sources';
import {reportingWeights,topicScope,plannedPrerequisites} from '@/lib/courses/coverage';
import {practiceInventory} from '@/lib/practice-inventory';
import {masteryPolicy} from '@/lib/courses/mastery';

export default async function Syllabus(){
  const student=await requireStudent();
  const db=adminDb();
  const [subjects,topics,lessons,inventory]=await Promise.all([
    db.from('subjects').select('*').order('position'),
    db.from('topics').select('subject,name,reporting_category').not('reporting_category','is',null).order('name'),
    db.from('lessons').select('slug,subject,title,topic').order('title'),
    practiceInventory(student.id),
  ]);
  if(subjects.error||topics.error||lessons.error) throw Error('Could not load the syllabus.');
  return <><Nav/><main id="main" className="shell"><p className="eyebrow">Enhanced ACT curriculum</p><h1>Subject syllabus</h1>
    <p className="muted">{topics.data.length} mapped topics. Open a reporting category to see its learning materials and practice coverage.</p>
    <div className="toolbar"><Link href="/textbook">Open the textbook</Link><Link href="/sources">Source library</Link><Link href="/advanced">34–36 preparation</Link></div>
    {subjects.data.map(subject=>{
      const categories=new Map<string,string[]>();
      for(const topic of topics.data.filter(topic=>topic.subject===subject.code)){
        categories.set(topic.reporting_category,[...(categories.get(topic.reporting_category)??[]),topic.name]);
      }
      return <section className="panel stack" key={subject.code}>
        <h2>{subject.title}{subject.optional?' · Optional':''}</h2>
        {[...categories].map(([category,skills])=><details key={category} open={skills.some(skill=>byTopic(subject.code,skill))||undefined}>
          <summary>{category}{reportingWeights[subject.code]?.[category]?' · '+reportingWeights[subject.code][category]:''}</summary>
          <ul className="rows">{skills.map(skill=>{
            const course=byTopic(subject.code,skill);
            const starter=lessons.data.find(note=>note.subject===subject.code&&note.topic===skill);
            const count=inventory.practice[subject.code]?.[skill]??0;
            const practice='/practice?mode=topic&subject='+subject.code+'&topic='+encodeURIComponent(skill);
            return <li key={skill}>
              <strong><Link href={course?'/learn/'+course.slug:'/syllabus/topic?subject='+subject.code+'&topic='+encodeURIComponent(skill)}>{skill}</Link></strong>
              <p className="muted">{topicScope[skill]??'ACT '+category.toLowerCase()+' skill'}.</p>
              <p>{course?`${course.lessons.length} detailed ${course.lessons.length===1?'lesson':'lessons'} · ${course.lessons.length*3} worked examples · editorial review pending`:starter?'Starter lesson available':'Detailed lessons pending'}
                {subject.code!=='WRITING'&&` · ${count} practice items${count<masteryPolicy.samples?' · below mastery sample target':''}`}</p>
              {plannedPrerequisites[skill]&&<p className="muted">Build on {plannedPrerequisites[skill]}.</p>}
              <div className="toolbar">
                {!course&&starter&&<Link href={'/syllabus/'+starter.slug}>Read starter lesson</Link>}
                {count>0&&<Link href={practice}>Practice {skill.toLowerCase()}</Link>}
                {course&&<Link href={'/learn/'+course.slug+'?view=test'}>{subject.code==='WRITING'?'Self-assessment':'Mastery evidence'}</Link>}
              </div>
            </li>;
          })}</ul>
        </details>)}
      </section>;
    })}
    <p><a href={sourceLibrary['act-free'].url}>Official free ACT practice materials</a></p>
  </main></>;
}
