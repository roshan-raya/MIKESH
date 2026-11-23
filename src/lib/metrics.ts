export type Attempt = {
  id:string; question_id:string; session_id?:string|null; family?:string; bankKey?:string|null; questionPrompt?:string; subject:string; is_correct:boolean; created_at:string;
  seconds:number|null; confidence?:string|null; difficulty?:number; subtopic?:string|null; error_category:string|null; topic:string; holdout:boolean; mode:string; selected_answer:string;
};
export function summarize(attempts:Attempt[]) {
  const seen = new Set<string>();
  const first:Attempt[]=[];
  const repeats:Attempt[]=[];
  const mastery = new Map<string,{subject:string;topic:string;count:number;correct:number}>();
  for(const attempt of [...attempts].sort((a,b)=>a.created_at.localeCompare(b.created_at)||a.id.localeCompare(b.id))){
    const identifier=attempt.family??attempt.question_id;
    if(seen.has(identifier)){repeats.push(attempt);continue;}
    seen.add(identifier);
    first.push(attempt);
    if(attempt.holdout || attempt.selected_answer==='Unanswered') continue;
    const key=attempt.subject+'/'+attempt.topic;
    const value=mastery.get(key)??{subject:attempt.subject,topic:attempt.topic,count:0,correct:0};
    value.count++;
    value.correct+=Number(attempt.is_correct);
    mastery.set(key,value);
  }
  return {first,repeats,mastery:[...mastery.values()].sort((a,b)=>a.correct/a.count-b.correct/b.count||b.count-a.count)};
}
export function accuracy(attempts:Pick<Attempt,'is_correct'>[]) {
  return attempts.length ? Math.round(attempts.filter(a=>a.is_correct).length*100/attempts.length)+'%' : '—';
}
export function studyDay(time:Date|string) {
  return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Phoenix',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(time));
}
export function streak(attempts:Attempt[],now=new Date()) {
  const days=new Set(attempts.map(a=>studyDay(a.created_at)));
  const anchor = new Date(studyDay(now)+'T20:00:00Z');
  if(!days.has(studyDay(anchor))) anchor.setUTCDate(anchor.getUTCDate()-1);
  let count=0;
  while(days.has(studyDay(anchor))){count++;anchor.setUTCDate(anchor.getUTCDate()-1);}
  return count;
}

export function weakestTopic(attempts: Attempt[]) {
  return summarize(attempts).mastery.find(skill=>skill.count>=3&&skill.correct/skill.count<0.8);
}
