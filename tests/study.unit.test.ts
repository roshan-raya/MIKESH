import {describe,expect,it} from 'vitest';
import {composite,remainingSeconds,startSchema,updateSchema} from '../src/lib/study';
import {accuracy,streak,summarize,type Attempt} from '../src/lib/metrics';

const first:Attempt={id:'1',question_id:'a',subject:'MATH',topic:'Functions',is_correct:false,holdout:false,
  mode:'learn',seconds:95,error_category:'concept',created_at:'2026-11-21T23:00:00Z',selected_answer:'A'};

describe('study boundaries',()=>{
  it('uses immutable absolute deadlines with resumption',()=>{
    expect(remainingSeconds('2026-11-22T10:35:00Z',Date.parse('2026-11-22T10:34:59.400Z'))).toBe(1);
    expect(remainingSeconds('2026-11-22T10:35:00Z',Date.parse('2026-11-22T11:05:00Z'))).toBe(0);
  });
  it('rejects invalid settings and unbounded client input',()=>{
    expect(startSchema.safeParse({mode:'timed',count:5}).success).toBe(false);
    expect(startSchema.safeParse({mode:'topic',subject:'MATH'}).success).toBe(false);
    expect(startSchema.safeParse({mode:'learn',count:51}).success).toBe(false);
    expect(updateSchema.safeParse({session:'not-an-id',action:'save'}).success).toBe(false);
  });
  it('uses only valid core scaled scores for a composite',()=>{
    expect(composite([34,35,36])).toBe(35);
    expect(composite([36,34,34])).toBe(35);
    expect(()=>composite([36,34,34,30])).toThrow();
    expect(()=>composite([90,95,100])).toThrow();
  });
  it('keeps repeat and holdout items out of mastery',()=>{
    const repeated={...first,id:'3',is_correct:true,created_at:'2026-11-22T23:00:00Z'};
    const assessment={...first,id:'2',question_id:'b',is_correct:true,holdout:true,mode:'diagnostic'};
    const summary=summarize([repeated,assessment,first]);
    expect(summary.mastery).toEqual([{subject:'MATH',topic:'Functions',count:1,correct:0}]);
    expect(accuracy(summary.first)).toBe('50%');
    expect(accuracy(summary.repeats)).toBe('100%');
    expect(accuracy([])).toBe('—');
    expect(streak([first,repeated],new Date('2026-11-23T02:00:00Z'))).toBe(2);
  });
});
