import {execFileSync} from 'node:child_process';
import {expect,it} from 'vitest';
import {questionLearning,questionProfiles} from '../src/lib/courses/question-learning';
import {bySlug} from '../src/lib/courses';
import {sourceLibrary} from '../src/lib/courses/sources';

type Item = { bank_key:string; subject:string; topic:string; prompt:string; correct_answer:string; options:{id:string;text:string}[] };
const practice=['content/starter.json','content/practice-expansion.json','content/quadratic-practice.json'].flatMap((file)=>
  JSON.parse(execFileSync(process.execPath,['scripts/bank.mjs',file,'--rows'],{encoding:'utf8'})).questions as Item[]);

it('connects every curated wrong choice to an explanation and a valid lesson',()=>{
  const items=practice.filter(q=>Object.hasOwn(questionProfiles,q.bank_key));
  expect(items).toHaveLength(23);
  for(const item of items){
    for(const {id} of item.options.filter(choice=>choice.id!==item.correct_answer)){
      const learning=questionLearning(item,id);
      expect(learning.complete,item.bank_key).toBe(true);
      expect(learning.feedback[item.correct_answer]).toBeUndefined();
      expect(Object.keys(learning.feedback)).toHaveLength(item.options.length-1);
      expect(learning.objective).toBeTruthy();
      expect(learning.error?.explanation).toBeTruthy();
      expect(learning.prerequisites.length).toBeGreaterThan(0);
      const lessonId=learning.error?.link.split('lesson=')[1];
      const course=bySlug(questionProfiles[item.bank_key].course);
      expect(course?.lessons.some(lesson=>lesson.id===lessonId)).toBe(true);
      expect(learning.sources.every(source=>sourceLibrary[source]?.url.startsWith('https://'))).toBe(true);
    }
  }
});

it('handles the original Functions question and labels incomplete concept maps',()=>{
  const legacy={bank_key:null,subject:'MATH',topic:'Functions',prompt:'If f(x) = 2x² + 1, what is f(3)?'};
  const plan=questionLearning(legacy,'B');
  expect(plan.error?.gap).toBe('Carry the constant term');
  expect(Object.keys(plan.feedback)).toEqual(['A','B','D']);
  expect(plan.retest).toBe('/learn/functions?view=test&lesson=notation');
  const partial=questionLearning({bank_key:'draft-missing@1',subject:'READING',topic:'Inference',prompt:'Unknown'},'A');
  expect(partial).toMatchObject({complete:false,link:'/learn/inference',feedback:{}});
  expect(partial.error).toBeUndefined();
});

it('keeps the priority Math batch as draft with complete question-to-lesson annotations',()=>{
  const file='content/priority-math-draft.json';
  const draft=JSON.parse(execFileSync(process.execPath,['scripts/bank.mjs',file,'--rows'],{encoding:'utf8'})).questions;
  expect(draft).toHaveLength(12);
  for(const question of draft as (Item&{status:string;distractors:Record<string,string>})[]){
    expect(question.status).toBe('draft');
    const wrong=question.options.filter(option=>option.id!==question.correct_answer);
    expect(Object.keys(question.distractors)).toHaveLength(wrong.length);
    for(const {id} of wrong){
      const learning=questionLearning(question,id);
      expect(learning.complete).toBe(true);
      expect(learning.error?.explanation).toBe(question.distractors[id]);
      expect(learning.sources.every(source=>sourceLibrary[source]?.url.startsWith('https://'))).toBe(true);
    }
  }
});

it('recomputes the keys of the new priority Math drafts',()=>{
  const expected:Record<string,string>={
    'priority-pr-01':String(30*5/12),
    'priority-pr-02':((1.25*.9-1)*100).toFixed(1)+'% higher',
    'priority-pr-03':Math.round((1.2*.9-1)*100)+'% increase',
    'priority-si-01':String((11+1)/3-1),
    'priority-si-02':[6/2,9/3,15/5].every(value=>value===3)?'Infinitely many':'None',
    'priority-si-03':String(Array.from({length:11},(_,i)=>i).filter(n=>7-2*n<3&&n<=5).length),
    'priority-cg-01':'$-1/2$',
    'priority-cg-02':String(Math.hypot(9-1,2+4)),
    'priority-cg-03':'$y=x/3-2$',
    'priority-tr-01':'$3/5$',
    'priority-tr-02':'$'+(18/2)+String.raw`\sqrt{2}$`,
    'priority-tr-03':String(16+2)+' m',
  };
  const file='content/priority-math-draft.json';
  const {questions}=JSON.parse(execFileSync(process.execPath,['scripts/bank.mjs',file,'--rows'],{encoding:'utf8'}));
  expect(questions).toHaveLength(Object.keys(expected).length);
  for(const item of questions as Item[]){
    const option=item.options.find(choice=>choice.id===item.correct_answer);
    expect(option?.text,item.bank_key).toBe(expected[item.bank_key.split('@')[0]]);
  }
});
