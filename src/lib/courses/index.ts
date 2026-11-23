import { functions } from './functions';
import { otherCourses } from './other-subjects';

import { quadratics } from './quadratics';
import { priorityMath } from './priority-math';

import {linearEquations} from './linear-equations';

import {numberAndQuantity} from './number-and-quantity';

export const courses = [functions,quadratics,linearEquations,numberAndQuantity,...priorityMath,...otherCourses];
export function bySlug(slug:string) { return courses.find(course=>course.slug===slug); }
export function byTopic(subject:string,topic:string) {
  return courses.find(course=>course.subject===subject&&course.topic===topic);
}
export function guidedTask(slug:string,lesson:string) { return `course:${slug}:guided:${lesson}`; }
