import {expect,it} from 'vitest';
import bank from '../content/linear-equations-draft.json';
import {bySlug} from '../src/lib/courses';
import {questionLearning} from '../src/lib/courses/question-learning';

it('recomputes keys and checks all Linear Equations lesson and retest links',()=>{
  const numbers=[-14+9,-63/7,(31-16)/-6,20/8+3,(20-2)/(5-2),(7+6+2)/5,10-18];
  const expected=[String(numbers[0]),String(numbers[1]),'-'+(31-16)/3+'/2',String(numbers[3]*2)+'/2',...numbers.slice(4).map(String),
    'Infinitely many','-'+(8+1)/3+'/2',String(11+(-1-11)/(3-(-1))),'x = 6',String((15-9)/(9/6)),
    String(Math.floor((55-13)/7)+1),String(Math.floor((23-8)/(5-3))+1),String(4+2),String(Math.ceil((89-12+11)/(5+3)))];
  const chapter=bySlug('linear-equations')!;
  expect(chapter.lessons).toHaveLength(4);
  expect(bank.items).toHaveLength(16);
  for(const [index,item] of bank.items.entries()){
    expect(item.choices[item.correctIndex].replaceAll('−','-')).toBe(expected[index]);
    expect(item).toMatchObject({status:'draft',holdout:false});
    const lesson=chapter.lessons.find(entry=>entry.id===item.subtopic);
    expect(lesson).toBeDefined();
    for(const choice of 'ABCD'.replace('ABCD'[item.correctIndex],'')){
      const profile=questionLearning({...item,bank_key:item.slug+'@1'},choice);
      expect(profile.error?.link).toBe('/learn/linear-equations?lesson='+lesson!.id);
      expect(profile.error?.explanation).toBeTruthy();
      expect(profile.retest).toContain('&focus='+lesson!.id);
    }
  }
});

it('links the existing practice and diagnostic revisions without changing their keys',()=>{
  const legacy=questionLearning({bank_key:null,subject:'MATH',topic:'Linear equations',prompt:'If 5x − 7 = 18, what is x?'},'A');
  expect(legacy.error?.link).toBe('/learn/linear-equations?lesson=balance');
  for(const [key,lesson] of [['px-m09@1','constraints'],['hd04@1','linear-graphs']]){
    const profile=questionLearning({bank_key:key,subject:'MATH',topic:'Linear equations',prompt:''},'A');
    expect(profile.error?.link).toBe('/learn/linear-equations?lesson='+lesson);
    expect(Object.keys(profile.feedback)).toEqual(['A','B','D']);
  }
});
