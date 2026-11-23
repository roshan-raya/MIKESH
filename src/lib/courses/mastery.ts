import type { Attempt } from '../metrics';

export const masteryPolicy = {samples:8,accuracy:.8,timed:3,hard:3,hardDifficulty:4} as const;

export function masteryEvidence(attempts:Attempt[],subject:string,topics:string[],policy: {
  samples:number;accuracy:number;timed:number;hard:number;hardDifficulty:number
}=masteryPolicy, unseenSessions?:ReadonlySet<string>) {
  const first = new Map<string,Attempt>();
  for (const attempt of [...attempts].sort((a,b)=>a.created_at.localeCompare(b.created_at)||a.id.localeCompare(b.id))) {
    if (attempt.subject!==subject || !topics.includes(attempt.topic) || attempt.holdout) continue;
    const key=attempt.family??attempt.question_id;
    if (!first.has(key)) first.set(key,attempt);
  }
  const samples = [...first.values()].filter(attempt=>attempt.selected_answer!=='Unanswered');
  const earned = samples.filter(attempt=>attempt.is_correct && attempt.confidence!=='guess');
  const timed = earned.filter(attempt=>attempt.mode==='timed'&&(!unseenSessions||unseenSessions.has(attempt.session_id??''))).length;
  const hard = earned.filter(attempt=>(attempt.difficulty??0)>=policy.hardDifficulty).length;
  const rate = samples.length ? earned.length/samples.length : 0;
  return {
    samples:samples.length, correct:earned.length, timed, hard, rate,
    mastered:samples.length>=policy.samples&&rate>=policy.accuracy&&timed>=policy.timed&&hard>=policy.hard,
  };
}

export function nextLesson<T extends {id:string}>(lessons:T[],completed:Set<string>) {
  return lessons.find(lesson=>!completed.has(lesson.id))??lessons[lessons.length-1];
}

export function subtopicWeakness(attempts:Attempt[],subject:string,topics:string[]) {
  const groups=new Map<string,Attempt[]>();
  for(const attempt of attempts){
    if(attempt.subject!==subject||!topics.includes(attempt.topic)||attempt.holdout||attempt.selected_answer==='Unanswered') continue;
    if(!attempt.subtopic) continue;
    const key=attempt.subtopic;
    const group=groups.get(key)??[];
    group.push(attempt);
    groups.set(key,group);
  }
  return [...groups.entries()].map(([id,group])=>{
    const distinct=new Set(group.map(attempt=>attempt.family??attempt.question_id));
    const misses=group.filter(attempt=>!attempt.is_correct).length;
    const uncertain=group.filter(attempt=>attempt.confidence==='guess'||attempt.confidence==='unsure').length;
    return {id,items:distinct.size,misses,uncertain};
  }).filter(group=>group.items>=2&&group.misses>=2)
    .sort((a,b)=>b.misses-a.misses||b.uncertain-a.uncertain)[0];
}
