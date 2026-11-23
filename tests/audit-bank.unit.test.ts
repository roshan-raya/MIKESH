import {execFileSync} from 'node:child_process';
import {expect,it} from 'vitest';

type BankRow = {
  bank_key:string; prompt:string; subject:string; correct_answer:string;
  options:{id:string;text:string}[]; status:string; holdout:boolean;
};

function batch(file:string):BankRow[]{
  return JSON.parse(execFileSync(process.execPath,['scripts/bank.mjs',file,'--rows'],{encoding:'utf8'})).questions;
}

const liveInputs=['content/starter.json','content/practice-expansion.json','content/quadratic-practice.json'];
const drafts=['content/mock/english.json','content/mock/math.json','content/mock/reading.json'];

it('keeps published and draft prompts distinct across the authored batches',()=>{
  const published=liveInputs.flatMap(batch);
  const mock=drafts.flatMap(batch);
  const priority=batch('content/priority-math-draft.json');
  const textbook=batch('content/quadratic-textbook.json');
  const proportions=batch('content/proportional-reasoning-draft.json');
  const prompts=[...published,...mock,...priority,...textbook,...proportions,...batch('content/linear-equations-draft.json'),...batch('content/sentence-boundaries-draft.json'),...batch('content/number-and-quantity-draft.json')].map(item=>item.prompt.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,''));
  expect(new Set(prompts).size).toBe(prompts.length);
  expect(published.every(item=>item.status==='verified')).toBe(true);
  expect(mock).toHaveLength(131);
  expect(mock.every(item=>item.status==='draft'&&item.holdout)).toBe(true);
});

it('cross-checks the expanded Math bank against recomputed values',()=>{
  const expected:Record<string,string>={
    'px-fn01':String((11+4)/3),
    'px-fn02':String((2*4-3)**2+1),
    'px-fn03':'All real numbers except $5$',
    'px-fn04':'$('+(4-3)+','+(-2+5)+')$',
    'px-fn05':'$'+(19-7)/4+'$',
    'px-fn06':'$'+(2-(6-1))+'$ and $'+(2+(6-1))+'$',
    'px-fn07':String(9-2*(27-9)/(8-2)),
    'px-fn08':'$'+(6/2-4/2)+'$',
    'px-m09':String((122-5*18)/(9-5)),
    'px-m10':String(10*Math.sqrt(13**2-5**2)/2),
    'px-m11':'Mean rises by '+(30-15)/5+' and median stays the same',
    'px-m12':'The first, by '+Math.round((10/40-10/50)*100)+' percentage points',
    'px-m13':String(16**.75),
    'px-m14':String(120+14*(9-4)),
    'px-q01':'$x^2-4x-12$',
    'px-q02':'−5 and −2',
    'px-q03':'$5/2$',
    'px-q04':'−4',
    'px-q05':String(12**2/(4*2)),
    'px-q06':String(Array.from({length:30},(_,i)=>i).find(i=>i*(i+1)===156)),
    'px-q07':String(-2*4**2+16*4-21),
    'px-q08':'5 units',
  };
  const math=liveInputs.slice(1).flatMap(batch).filter(q=>q.subject==='MATH');
  expect(math).toHaveLength(Object.keys(expected).length);
  for(const item of math){
    expect(item.options.find(option=>option.id===item.correct_answer)?.text,item.bank_key)
      .toBe(expected[item.bank_key.split('@')[0]]);
  }
});
