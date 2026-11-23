import {expect,it} from 'vitest';
import {bySlug} from '../src/lib/courses';
import {chapterGraph,prerequisitePath} from '../src/lib/courses/chapter';
import {questionLearning,recommendConcept} from '../src/lib/courses/question-learning';
import {sourceLibrary} from '../src/lib/courses/sources';
import bank from '../content/proportional-reasoning-draft.json';
import type {Attempt} from '../src/lib/metrics';

const course=bySlug('proportional-reasoning')!;
const graph=chapterGraph(course);
const letters='ABCD';

it('covers the eight proportional-reasoning concepts with staged practice at every difficulty',()=>{
  expect(course.lessons.map(lesson=>lesson.id)).toHaveLength(8);
  expect(course.lessons.flatMap(lesson=>lesson.examples)).toHaveLength(24);
  expect(bank.items).toHaveLength(40);
  expect(new Set(bank.items.map(item=>item.difficulty))).toEqual(new Set([1,2,3,4,5]));
  expect(bank.items.filter(item=>item.difficulty>=4).length).toBeGreaterThanOrEqual(10);
  expect(bank.items.every(item=>item.status==='draft'&&!item.holdout)).toBe(true);
  expect(new Set(bank.items.map(item=>item.objective)).size).toBe(40);
  for(const node of graph) {
    expect(bank.items.filter(item=>item.subtopic===node.id)).toHaveLength(5);
    for(const id of prerequisitePath(graph,node.id).map(entry=>entry.id))
      expect(course.lessons.some(lesson=>lesson.id===id)).toBe(true);
  }
});

it('recomputes every authored key independently of option position and explanation text',()=>{
  const bundles=[0,1,2,3].flatMap(a=>[0,1,2,3].map(b=>({count:6*a+10*b,cost:9*a+14*b})));
  // A direct proportion has zero starting value and the same ratio for two nonzero inputs.
  const models=[(x:number)=>4+x,(x:number)=>4/x,(x:number)=>4*x,(x:number)=>x*x];
  const equations=['y = 4 + x','y = 4/x','y = 4x','y = x²'];
  const proportionalRule=equations[models.findIndex(model=>model(0)===0&&model(2)/2===model(3)/3)];
  const expected=[
    [14/7,21/7].join(':'),'3/'+(3+5),String(54/(2+3+4)*3),((5+8)*.9/(8-5)).toFixed(1)+' L',
    String(42/7*6-30),String(56/8),(13/4-21/7).toFixed(2)+' credit',String(45/18),
    String((27+30)/(3+5))+' boxes/min',Math.min(...bundles.filter(pair=>pair.count>=17).map(pair=>pair.cost))+' credits',
    String(7*24),String(84/60*25)+' mL',(1.5*100*60).toLocaleString('en-US')+' cm/min',
    String(1.25*3**3),String(172800/(12**2)/32),
    proportionalRule,
    String(14/8*20),'(-4, '+20/8*(-4)+')',String(19+(10-7)*(19-11)/(7-3))+' credits',
    ((30-24)/24*100).toFixed(0)+'%',(36/120*100).toFixed(0)+'%',String(1750*12/1000),
    String(36*100/15),((40-32)/32*100).toFixed(0)+'%',((150*.6+200*.35)/(150+200)*100).toFixed(1)+'%',
    (320*(1-.15)).toFixed(0)+' credits',String(234*10/13)+' credits',((.8*1.35-1)*100).toFixed(0)+'% increase',
    (37.5/(100-37.5)*100).toFixed(0)+'%',String((105/1.05-12)/.8),
    String(40*18/12)+' cm',String(24*(5/2)**2)+' m²',String(9*Math.cbrt(128/54))+' cm',
    String(84*2*.75)+' cm²',((1-1.25*.7)*100).toFixed(1)+'% decrease',
    String(9*8/12)+' hours',String(144/(72/48+72/72))+' km/h', (1/(1/6-1/15)).toFixed(0)+' hours',
    String(5*9/3-12)+' L',String(40*1.5*.8*11+30)+' credits',
  ];
  for(const [index,item] of bank.items.entries()) expect(item.choices[item.correctIndex],item.slug).toBe(expected[index]);
});

it('maps every wrong choice to specific feedback, a real lesson and focused retest',()=>{
  for(const item of bank.items){
    const reference={...item,bank_key:item.slug+'@1'};
    const correct=letters[item.correctIndex];
    const node=graph.find(entry=>entry.id===item.subtopic)!;
    expect(item.tags.filter(tag=>tag.startsWith('prerequisite:')).map(tag=>tag.split(':')[1])).toEqual(node.prerequisites);
    for(const tag of item.tags.filter(tag=>tag.startsWith('reference:')))
      expect(sourceLibrary[tag.split(':')[1]]?.url).toMatch(/^https:\/\//);
    expect(questionLearning(reference,correct).error).toBeUndefined();
    for(const wrong of letters.replace(correct,'')){
      const target=item.tags.find(tag=>tag.startsWith('remediation:'+wrong+':'))!.split(':')[2];
      const learning=questionLearning(reference,wrong);
      expect(learning.complete).toBe(true);
      expect(learning.error?.explanation).toBe(item.distractors[wrong as keyof typeof item.distractors]);
      expect(graph.some(entry=>entry.id===target)).toBe(true);
      expect(learning.error?.link).toBe('/learn/proportional-reasoning?lesson='+target);
      expect(learning.retest).toBe('/learn/proportional-reasoning?view=test&lesson='+target+'&focus='+target);
    }
  }
});

it('uses two distinct missed base questions to recommend the exact prerequisite',()=>{
  const attempts:Attempt[]=bank.items.filter(item=>[20,27].some(n=>item.slug.endsWith(String(n)))).map(item=>{
    const tag=item.tags.find(text=>text.startsWith('remediation:')&&text.endsWith(':percent-base'))!;
    return {id:item.slug,question_id:item.slug,bankKey:item.slug+'@1',subject:'MATH',
      topic:course.topic,is_correct:false,created_at:'2026-11-23T12:00:00Z',seconds:22,holdout:false,
      error_category:null,mode:'topic',selected_answer:tag.split(':')[1]};
  });
  expect(attempts).toHaveLength(2);
  expect(recommendConcept(attempts,course.slug)).toMatchObject({lesson:'percent-base',misses:2});
});
