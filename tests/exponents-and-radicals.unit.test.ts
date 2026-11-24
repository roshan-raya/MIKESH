import {expect,it} from 'vitest';
import katex from 'katex';
import {bySlug} from '../src/lib/courses';
import {chapterGraph} from '../src/lib/courses/chapter';
import {connectedPrerequisites,connectedApplications} from '../src/lib/courses/connections';
import {questionLearning} from '../src/lib/courses/question-learning';
import bank from '../content/exponents-and-radicals-draft.json';

it('verifies exponent answers independently of option order and retains domain restrictions',()=>{
  const represent=(value:number)=>String(value).replaceAll('-','−');
  const fraction=(a:number,b:number)=>a+'/'+b;
  const sameBase=4*3-5;
  const reciprocalNumerator=3**2;
  const radicalCoefficient=Math.sqrt(98/2)-Math.sqrt(8/2);
  const candidate=[-1,4].filter(x=>Math.sqrt(3*x+4)===x);
  const expected=[
    represent((-3)**4-3**4),
    't'+'⁰¹²³⁴⁵⁶⁷⁸⁹'[sameBase],
    'x'+'⁰¹²³⁴⁵⁶⁷⁸⁹'[3*2-1],
    fraction(reciprocalNumerator,4**2),
    '(y−7)'+'⁰¹²³⁴⁵⁶⁷⁸⁹'[0-(-2)]+', y≠7',
    'q'+'⁰¹²³⁴⁵⁶⁷⁸⁹'[3-(-1)]+'/(2p'+'⁰¹²³⁴⁵⁶⁷⁸⁹'[-(-2-1)]+')',
    represent(Math.sqrt(121)),
    radicalCoefficient+'√2',
    Math.sqrt((-6+4)**2)===-(-6)-4?'−x−4':'x+4',
    represent(Math.sqrt(Math.sqrt(625))**3),
    represent(Math.cbrt(-216)**2),
    fraction(1,Math.cbrt(125)**2),
    String(candidate[0]),
    (1.2e-5/8e-8/100).toFixed(1)+'×10²',
    fraction(4+3,6-4),
  ];
  expect(bank.items).toHaveLength(expected.length);
  for(const [i,item] of bank.items.entries()){
    expect(item).toMatchObject({status:'draft',holdout:false});
    expect(item.choices[item.correctIndex],item.slug).toBe(expected[i]);
    for(const choice of 'ABCD'.replace('ABCD'[item.correctIndex],'')){
      const learning=questionLearning({...item,bank_key:item.slug+'@1'},choice);
      expect(learning.error?.link).toBe('/learn/exponents-and-radicals?lesson='+item.subtopic);
      expect(learning.error?.explanation).toBeTruthy();
      expect(learning.retest).toContain('&focus='+item.subtopic);
    }
  }
});

it('connects legacy remediation and verifies all lesson math renders',()=>{
  const chapter=bySlug('exponents-and-radicals')!;
  expect(new Set(chapterGraph(chapter).map(node=>node.level)).size).toBe(4);
  expect(connectedPrerequisites(chapter.slug,'power-applications').map(link=>link.link)).toEqual(expect.arrayContaining([
    '/learn/number-and-quantity?lesson=operation-order','/learn/number-and-quantity?lesson=fraction-operations','/learn/linear-equations?lesson=balance',
  ]));
  expect(connectedApplications(chapter.slug,'principal-roots').map(link=>link.link)).toContain('/learn/quadratics?lesson=exponents');
  const legacy=questionLearning({bank_key:'px-m13@1',subject:'MATH',topic:'Number and quantity',prompt:'Which expression equals the power?'},'D');
  expect(legacy.error?.link).toBe('/learn/exponents-and-radicals?lesson=rational-powers');
  expect(legacy.feedback).toHaveProperty('A');
  const chapterText=JSON.stringify(chapter.lessons);
  for(const [,expression] of chapterText.matchAll(/\$([^$]+)\$/g)){
    expect(()=>katex.renderToString(expression.replaceAll('\\\\','\\'),{throwOnError:true,strict:'error'}),expression).not.toThrow();
  }
});
