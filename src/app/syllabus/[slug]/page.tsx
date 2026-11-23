import Link from 'next/link';
import {notFound} from 'next/navigation';
import Nav from '@/components/nav';
import {RichText} from '@/components/rich-text';
import {requireStudent} from '@/lib/student';
import {adminDb} from '@/lib/supabase/admin';
export default async function Lesson({params}:{params:Promise<{slug:string}>}){
  await requireStudent();
  const {slug}=await params;
  const {data:lesson,error}=await adminDb().from('lessons').select('*').eq('slug',slug).maybeSingle();
  if(error) throw Error('Could not load the lesson.');
  if(!lesson) notFound();
  const practice=lesson.subject==='WRITING'?'/practice?mode=writing':`/practice?mode=topic&subject=${lesson.subject}&topic=${encodeURIComponent(lesson.topic)}`;
  return <><Nav/><main id="main" className="shell"><Link href="/syllabus">Back to syllabus</Link>
    <p className="eyebrow">{lesson.subject}</p><h1>{lesson.title}</h1>
    <section className="panel stack"><h2>Strategy</h2><p>{lesson.strategy}</p><h2>Example</h2><p><RichText value={lesson.example}/></p><h2>Check your understanding</h2><p>{lesson.checkpoint}</p><div><Link className="primary" href={practice}>Practice this skill</Link></div></section>
  </main></>;
}
