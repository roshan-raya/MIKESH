import {bySlug} from './index';
import {chapterGraph,prerequisitePath} from './chapter';

type LessonRef = {course:string;lesson:string};

export const chapterConnections:ReadonlyArray<{from:LessonRef;to:LessonRef}> = [
  {from:{course:'number-and-quantity',lesson:'fraction-operations'},to:{course:'proportional-reasoning',lesson:'ratio-parts'}},
  {from:{course:'number-and-quantity',lesson:'decimal-representations'},to:{course:'proportional-reasoning',lesson:'percent-base'}},
  {from:{course:'number-and-quantity',lesson:'signed-numbers'},to:{course:'linear-equations',lesson:'balance'}},
  {from:{course:'number-and-quantity',lesson:'operation-order'},to:{course:'quadratics',lesson:'exponents'}},
];

function lessonLink(ref:LessonRef) {
  const chapter=bySlug(ref.course)!;
  const lesson=chapter.lessons.find(entry=>entry.id===ref.lesson)!;
  return {title:lesson.title,chapter:chapter.topic,link:'/learn/'+chapter.slug+'?lesson='+lesson.id};
}

export function connectedPrerequisites(course:string,lesson:string) {
  const chapter=bySlug(course)!;
  const reachable=new Set([lesson,...prerequisitePath(chapterGraph(chapter),lesson).map(node=>node.id)]);
  return chapterConnections.filter(edge=>edge.to.course===course&&reachable.has(edge.to.lesson)).map(edge=>lessonLink(edge.from));
}

export function connectedApplications(course:string,lesson:string) {
  return chapterConnections.filter(edge=>edge.from.course===course&&edge.from.lesson===lesson).map(edge=>lessonLink(edge.to));
}
