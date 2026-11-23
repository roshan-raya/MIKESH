import {expect,it} from 'vitest';
import bank from '../content/sentence-boundaries-draft.json';
import {bySlug,guidedTask} from '../src/lib/courses';
import {chapterGraph,prerequisitePath} from '../src/lib/courses/chapter';
import {questionLearning} from '../src/lib/courses/question-learning';
import {sourceLibrary} from '../src/lib/courses/sources';

it('preserves the original checkpoint and connects all four instructional levels',()=>{
  const chapter=bySlug('sentence-boundaries')!;
  const graph=chapterGraph(chapter);
  expect(chapter.lessons).toHaveLength(4);
  expect(new Set(graph.map(node=>node.level)).size).toBe(4);
  expect(prerequisitePath(graph,'boundary-meaning').map(node=>node.id)).toEqual(['clause-foundations','joining-clauses','sentence-fragments']);
  expect(guidedTask(chapter.slug,'joining-clauses')).toBe('course:sentence-boundaries:guided:joining-clauses');
  for(const key of chapter.lessons.flatMap(lesson=>lesson.sources)) expect(sourceLibrary[key]?.url).toMatch(/^https:/);
});

it('maps each draft to its own passage bracket and every incorrect choice to a real concept',()=>{
  const expected=['repaired','twice; the','Because the cord was frayed, Imani','part: a','empty; however,','NO CHANGE',
    'Carrying binoculars and a clipboard, Nia spotted the tide marker','The cards that had blue borders',
    'sunrise, but the observers','early, so the team','Writing down the exact start time made','Her team also recorded one important limitation.'];
  expect(bank.passages).toHaveLength(2);
  expect(bank.items).toHaveLength(expected.length);
  for(const [i,item] of bank.items.entries()){
    expect(item).toMatchObject({status:'draft',holdout:false});
    const passage=bank.passages.find(p=>p.slug===item.passage)!;
    expect(passage.body.match(new RegExp('\\['+(i+1)+':','g'))).toHaveLength(1);
    expect(item.prompt).toContain('['+(i+1)+']');
    expect(item.choices[item.correctIndex]).toBe(expected[i]);
    for(const choice of 'ABCD'.replace('ABCD'[item.correctIndex],'')){
      const profile=questionLearning({...item,bank_key:item.slug+'@1'},choice);
      expect(profile.error?.link).toBe('/learn/sentence-boundaries?lesson='+item.subtopic);
      expect(profile.error?.explanation).toBeTruthy();
      expect(profile.retest).toContain('&focus='+item.subtopic);
    }
  }
});
