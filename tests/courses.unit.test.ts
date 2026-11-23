import {describe,expect,it} from 'vitest';
import {courses,guidedTask} from '../src/lib/courses';
import {sourceLibrary} from '../src/lib/courses/sources';
import {masteryEvidence,nextLesson} from '../src/lib/courses/mastery';
import type {Attempt} from '../src/lib/metrics';

const evidence:Attempt[] = Array.from({length:8},(_,index)=>({
  id:String(index),question_id:String(index),family:'question-'+index,subject:'MATH',topic:'Functions',
  is_correct:true,created_at:'2026-11-23T10:00:00Z',seconds:40,error_category:null,
  mode:index<3?'timed':'topic',difficulty:index<3?4:2,confidence:'sure',holdout:false,selected_answer:'A',
}));

describe('course learning and evidence',()=>{
  it('has complete lesson materials, valid references, and acyclic lesson prerequisites',()=>{
    expect(new Set(courses.map(course=>course.slug)).size).toBe(courses.length);
    for(const course of courses){
      const earlier=new Set<string>();
      for(const lesson of course.lessons){
        expect(earlier.has(lesson.id)).toBe(false);
        if(lesson.dependsOn) expect(earlier.has(lesson.dependsOn)).toBe(true);
        earlier.add(lesson.id);
        expect(lesson.examples).toHaveLength(3);
        for(const example of lesson.examples) expect(example.steps.length).toBeGreaterThanOrEqual(3);
        expect(lesson.instruction.length).toBeGreaterThanOrEqual(3);
        expect(new Set(lesson.guided.choices).size).toBe(4);
        expect(lesson.guided.feedback[lesson.guided.answer]).toBeTruthy();
        expect(lesson.sources.every(id=>sourceLibrary[id]?.url.startsWith('https://'))).toBe(true);
      }
    }
  });
  it('continues at the next uncompleted lesson without inferring mastery',()=>{
    const course=courses[0];
    expect(guidedTask(course.slug,course.lessons[0].id)).toBe('course:functions:guided:notation');
    expect(nextLesson(course.lessons,new Set(['notation'])).id).toBe('domain-range');
    expect(masteryEvidence([],course.subject,[course.topic]).mastered).toBe(false);
  });
  it('requires distinct timed and hard first responses and excludes guesses',()=>{
    expect(masteryEvidence(evidence,'MATH',['Functions']).mastered).toBe(true);
    expect(masteryEvidence(evidence.slice(0,2),'MATH',['Functions']).mastered).toBe(false);
    const guessed={...evidence[0],confidence:'guess'};
    const repeat={...evidence[0],id:'later',created_at:'2026-11-24T10:00:00Z'};
    expect(masteryEvidence([guessed,...evidence.slice(1),repeat],'MATH',['Functions'])).toMatchObject({
      samples:8,correct:7,timed:2,hard:2,mastered:false,
    });
  });
});
