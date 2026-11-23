import {execFileSync} from 'node:child_process';
import {describe,expect,it} from 'vitest';
import {bySlug,courses} from '../src/lib/courses';
import {bookmarkTask,chapterGraph,chapterLevels,prerequisitePath} from '../src/lib/courses/chapter';
import {questionLearning,recommendConcept} from '../src/lib/courses/question-learning';
import textbook from '../content/quadratic-textbook.json';
import type {Attempt} from '../src/lib/metrics';

describe('interactive textbook',()=>{
  it('links real lesson nodes without cycles for all chapter subjects',()=>{
    expect(new Set(courses.map(course=>course.subject))).toEqual(new Set(['MATH','ENGLISH','READING','SCIENCE','WRITING']));
    for(const course of courses){
      const graph=chapterGraph(course);
      const ids=graph.map(node=>node.id);
      expect(ids).toEqual(course.lessons.map(lesson=>lesson.id));
      graph.forEach((node,index)=>{
        for(const dependency of node.prerequisites){
          expect(ids.slice(0,index),course.slug+'/'+node.id).toContain(dependency);
        }
      });
    }
  });
  it('walks the actual prerequisites up to advanced quadratic modeling',()=>{
    const course=bySlug('quadratics')!;
    const graph=chapterGraph(course);
    expect(new Set(graph.map(node=>node.level))).toEqual(new Set(Object.keys(chapterLevels)));
    const path=prerequisitePath(graph,'quadratic-models').map(node=>node.id);
    expect(path).toEqual(['variables','multiplication','exponents','polynomials','factoring','zero-product','complete-square','quadratic-formula','roots-and-vertex']);
    expect(bookmarkTask(course.slug,'factoring')).toBe('chapter:quadratics:bookmark:factoring');
  });
  it('checks every keyed item, distractor, chapter concept and difficulty band',()=>{
    const course=bySlug('quadratics')!;
    const bank=JSON.parse(execFileSync(process.execPath,['scripts/bank.mjs','content/quadratic-textbook.json','--rows'],{encoding:'utf8'}));
    expect(bank.questions).toHaveLength(24);
    expect(new Set(textbook.items.map(item=>item.objective)).size).toBe(24);
    expect(new Set(bank.questions.map((item:{difficulty:number})=>item.difficulty))).toEqual(new Set([1,2,3,4,5]));
    for(const lesson of course.lessons) expect(textbook.items.filter(item=>item.subtopic===lesson.id).length).toBeGreaterThanOrEqual(2);
    for(const row of bank.questions){
      const wrong=row.options.filter((option:{id:string})=>option.id!==row.correct_answer);
      for(const option of wrong){
        const learning=questionLearning(row,option.id);
        expect(learning.complete,row.bank_key).toBe(true);
        expect(learning.error?.explanation).toBe(row.distractors[option.id]);
        expect(learning.retest).toContain('&focus='+row.subtopic);
        expect(learning.difficulty).toBe(row.difficulty);
        expect(learning.relatedTopics.map(topic=>topic.link)).toContain('/learn/functions');
      }
    }
  });
  it('suggests a specific prerequisite only when different questions support it',()=>{
    const miss:Attempt={id:'a',question_id:'a',bankKey:'px-q02@1',subject:'MATH',topic:'Quadratics',
      is_correct:false,created_at:'2026-12-01T12:00:00Z',seconds:30,error_category:null,holdout:false,mode:'topic',selected_answer:'A'};
    const other={...miss,id:'b',question_id:'b',bankKey:'textbook-q-14@1',selected_answer:'B'};
    expect(recommendConcept([miss,{...miss,id:'repeat'}])).toBeUndefined();
    expect(recommendConcept([miss,other],'quadratics')).toMatchObject({lesson:'zero-product',misses:2});
    expect(recommendConcept([miss,other,{...miss,id:'c',created_at:'2026-12-02T12:00:00Z',is_correct:true}])).toBeUndefined();
    const explanation=questionLearning({bank_key:'px-q02@1',subject:'MATH',topic:'Quadratics',prompt:'Find the roots',difficulty:2},'A');
    expect(explanation.error?.link).toBe('/learn/quadratics?lesson=zero-product');
    expect(explanation.retest).toBe('/learn/quadratics?view=test&lesson=zero-product&focus=zero-product');
  });
});

it('matches independently recomputed outputs for textbook practice',()=>{
  const answers = [
    String(7-2*(-3)),String((34+8)/6),'$-15z+10$','$2x^2-17x-9$',
    String((-7)**2+7**2),'0 and 12',String(Math.max(2,1)),String(-7),
    '$(x-7)(x+5)$','$(3x+1)(2x-3)$','$3m(2m-3)(2m+3)$','−2',
    '$-8$ and $5/2$',String(new Set([0,2,2]).size),'$(x+6)(x-4)=0$','$(x-7)^2-26$',
    '−7',String((-2)**2-4*3*(-7)),'$1\\pm\\sqrt{6}/2$',String(14),
    String((-3+9)/2),'$-1/2$',String(Math.min(5,26/4)),(7*(38-14))+' m²',
  ];
  const normalize=(value:string)=>value.replaceAll('−','-');
  expect(textbook.items.map(item=>normalize(item.choices[item.correctIndex]))).toEqual(answers.map(normalize));
});
