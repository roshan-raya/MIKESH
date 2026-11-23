import type {Course,ConceptNode,ChapterLevel} from './types';
export type {ChapterLevel} from './types';

export const chapterLevels = {
  beginner:'Beginner',
  intermediate:'Intermediate',
  standard:'ACT Standard',
  advanced:'Advanced 34–36',
} as const;
export function chapterGraph(course:Course):ConceptNode[] {
  if(course.concepts) return course.concepts;
  return course.lessons.map((lesson,index)=>({
    id:lesson.id,level:course.lessons.length===1?'standard':index===0?'beginner':'intermediate',
    prerequisites:lesson.dependsOn?[lesson.dependsOn]:[],
  }));
}

export function prerequisitePath(graph:ConceptNode[],target:string) {
  const found=new Set<string>();
  function visit(id:string){
    if(found.has(id)) return;
    const node=graph.find(concept=>concept.id===id);
    if(!node) return;
    found.add(id);
    node.prerequisites.forEach(visit);
  }
  visit(target);
  return graph.filter(node=>found.has(node.id)&&node.id!==target);
}

export function bookmarkTask(course:string,lesson:string) {
  return `chapter:${course}:bookmark:${lesson}`;
}
