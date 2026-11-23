import {expect,it} from 'vitest';
import starter from '../content/starter.json';

it('matches independently computed answers for the starter bank’s numeric math items',()=>{
  const expected:Record<string,string>={
    m05:5/8*3/7+3/8*5/7===15/28?'15/28':'probability mismatch',
    m06:Math.floor(42/(18-11))+1+' hours',
    m07:String(3**2+2**2),
    m08:String(2**2-4*2+7),
    m09:'$'+String((5-2)**2+(3+1)**2)+'π$',
    hd04:'USD '+(34-8*(46-34)/(12-8)),
    hd05:String(Math.sqrt(23+2)),
    hd11:String(6*14-5*12),
  };
  for(const [slug,answer] of Object.entries(expected)){
    const item=starter.items.find(row=>row[0]===slug);
    expect(item,slug).toBeDefined();
    const options=item![6] as string[];
    expect(options[item![7] as number],slug).toBe(answer);
  }
});
