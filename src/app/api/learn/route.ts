import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { bookmarkTask, chapterGraph } from '@/lib/courses/chapter';
import { difficultyBands } from '@/lib/courses/options';
import { bySlug, guidedTask } from '@/lib/courses';
import { studyDay } from '@/lib/metrics';
import { getStudent } from '@/lib/student';
import { adminDb } from '@/lib/supabase/admin';

const bookmarkSchema=z.object({course:z.string().max(80),lesson:z.string().max(80),saved:z.boolean()});
const answerSchema=z.object({course:z.string().max(80),lesson:z.string().max(80),choice:z.number().int().min(0).max(3)});

const startSchema=z.object({
  course:z.string().max(80),topic:z.string().max(120),band:z.enum(['all','foundational','intermediate','advanced']),
  count:z.number().int().min(1).max(20),mastery:z.boolean(),focus:z.string().max(80).optional(),
});

export async function POST(request:Request) {
  const student=await getStudent();
  if(!student) return NextResponse.json({error:'Sign in to continue.'},{status:401});
  const body=await request.json().catch(()=>null);
  if(body?.action==='bookmark'){
    const input=bookmarkSchema.safeParse(body);
    if(!input.success||!bySlug(input.data.course)?.lessons.some(lesson=>lesson.id===input.data.lesson))
      return NextResponse.json({error:'Choose a lesson to bookmark.'},{status:400});
    const {course,lesson,saved}=input.data;
    const task=bookmarkTask(course,lesson);
    const db=adminDb().from('study_tasks');
    const {error}=saved
      ? await db.upsert({user_id:student.id,task_date:studyDay(new Date()),task},{ignoreDuplicates:true})
      : await db.delete().eq('user_id',student.id).eq('task',task);
    if(error) return NextResponse.json({error:'Could not update this bookmark.'},{status:500});
    revalidatePath('/learn/'+course);
    revalidatePath('/textbook');
    return NextResponse.json({saved});
  }
  if(body?.action==='start') {
    const settings=startSchema.safeParse(body);
    const course=settings.success ? bySlug(settings.data.course) : null;
    if(!settings.success||!course||course.subject==='WRITING')
      return NextResponse.json({error:'Check the course practice settings.'},{status:400});
    const {band,count,mastery,topic,focus}=settings.data;
    const topics=course.practiceTopics??[course.topic];
    if(topic&&!topics.includes(topic)) return NextResponse.json({error:'Choose a linked topic.'},{status:400});
    if(focus&&!chapterGraph(course).some(concept=>concept.id===focus))
      return NextResponse.json({error:'Choose a concept in this chapter.'},{status:400});
    const [low,high]=difficultyBands[band];
    const db=adminDb();
    const params={p_user:student.id,p_subject:course.subject,p_topics:topic?[topic]:topics,
      p_count:count,p_low:low,p_high:high,p_mastery:mastery};
    const {data,error}=await (focus
      ? db.rpc('start_chapter_session',{...params,p_concepts:[focus]})
      : db.rpc('start_course_session',params));
    if(error) return NextResponse.json({
      error:error.code==='P0001'?error.message:'Course assessments are temporarily unavailable.',
    },{status:error.code==='P0001'?409:503});
    return NextResponse.json({id:data});
  }
  const result=answerSchema.safeParse(body);
  if(!result.success) return NextResponse.json({error:'Choose a valid answer.'},{status:400});
  const {course,lesson,choice}=result.data;
  const exercise=bySlug(course)?.lessons.find(entry=>entry.id===lesson)?.guided;
  if(!exercise) return NextResponse.json({error:'Exercise unavailable.'},{status:404});
  const correct=choice===exercise.answer;
  if(correct) {
    const {error}=await adminDb().from('study_tasks').upsert({
      user_id:student.id,task_date:studyDay(new Date()),task:guidedTask(course,lesson),
    },{ignoreDuplicates:true});
    if(error) return NextResponse.json({error:'Could not save your progress.'},{status:500});
    revalidatePath('/learn/'+course);
  }
  return NextResponse.json({correct,feedback:exercise.feedback[choice]});
}
