import {expect,it} from 'vitest';
import bank from '../content/number-and-quantity-draft.json';
import {courses,bySlug} from '../src/lib/courses';
import {chapterGraph} from '../src/lib/courses/chapter';
import {chapterConnections,connectedApplications,connectedPrerequisites} from '../src/lib/courses/connections';
import {questionLearning} from '../src/lib/courses/question-learning';
import {sourceLibrary} from '../src/lib/courses/sources';

it('checks every arithmetic key numerically and verifies option-specific lesson links',()=>{
  const candidates=[37/76,51/100,23/48,19/40];
  const closest=candidates.reduce((a,b)=>Math.abs(a-.5)<Math.abs(b-.5)?a:b);
  const expected=[-3-(-11),Math.min(-2,0,-9,1),(-3*-4*-5)/-2,7/10+1/6,3/5*5/8,Math.floor((7*12)/(3*5)),
    84/1000,.375,Math.max(-.79,-4/5,-81/100,-.805),42/7*2+1,(27-3**2)/(11-5),-((-3)**2)+(-3-1)**2,
    closest,(2/7-28/100)*50,Math.floor(2496/39)];
  const evaluate=(value:string)=>value.replaceAll('−','-').split('/').map(Number).reduce((a,b)=>a/b);
  expect(bank.items).toHaveLength(expected.length);
  for(const [i,item] of bank.items.entries()){
    expect(item).toMatchObject({status:'draft',holdout:false});
    expect(evaluate(item.choices[item.correctIndex]),item.slug).toBeCloseTo(expected[i],10);
    expect(item.choices.filter(choice=>Math.abs(evaluate(choice)-expected[i])<1e-10)).toHaveLength(1);
    for(const choice of 'ABCD'.replace('ABCD'[item.correctIndex],'')){
      const profile=questionLearning({...item,bank_key:item.slug+'@1'},choice);
      expect(profile.error?.link).toBe('/learn/number-and-quantity?lesson='+item.subtopic);
      expect(profile.error?.explanation).toBeTruthy();
      expect(profile.retest).toContain('&focus='+item.subtopic);
    }
  }
});

it('connects real lessons without adding cycles or broken sources',()=>{
  const dependencies=new Map(courses.flatMap(course=>chapterGraph(course).map(node=>
    [course.slug+'/'+node.id,node.prerequisites.map(id=>course.slug+'/'+id)] as const)));
  for(const edge of chapterConnections){
    const from=edge.from.course+'/'+edge.from.lesson;
    const to=edge.to.course+'/'+edge.to.lesson;
    expect(dependencies.has(from)).toBe(true);
    expect(dependencies.has(to)).toBe(true);
    dependencies.get(to)!.push(from);
  }
  function walk(key:string,path:string[]){
    expect(path).not.toContain(key);
    expect(dependencies.has(key)).toBe(true);
    for(const parent of dependencies.get(key)!) walk(parent,[...path,key]);
  }
  for(const key of dependencies.keys()) walk(key,[]);
  expect(connectedPrerequisites('linear-equations','constraints').map(link=>link.link)).toContain('/learn/number-and-quantity?lesson=signed-numbers');
  expect(connectedApplications('number-and-quantity','fraction-operations').map(link=>link.link)).toContain('/learn/proportional-reasoning?lesson=ratio-parts');
  for(const key of bySlug('number-and-quantity')!.lessons.flatMap(lesson=>lesson.sources)) expect(sourceLibrary[key]?.url).toMatch(/^https:/);
});
