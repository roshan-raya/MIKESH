import type {Course,Lesson} from './types';
import bank from '../../../content/systems-inequalities-draft.json';
import {systemsLessons} from './systems-inequalities-lessons';

const originalLesson:Lesson={
  id:'systems-and-bounds',title:'Solve simultaneous equations and constraints',minutes:25,
  objectives:['Choose elimination or substitution for a linear system.','Identify unique, absent, and infinite solutions.','Reverse the inequality sign after division by a negative and keep feasible boundaries.'],
  prerequisites:['Solve a one-variable equation.','Distribute a negative sign.','Read an ordered pair.'],
  instruction:[
    {title:'A system requires each condition at once',body:'A solution of a system of equations makes every equation true with the same variable assignments. When one equation isolates a variable, substitution can eliminate that variable in one move. When terms already have equal or opposite coefficients, subtract or add the equations. Scale every term of an equation, including its right side, when aligning coefficients.'},
    {title:'An eliminated variable can reveal the shape',body:'If solving gives a numerical value for the remaining variable, substitute to find the other variable. If all variables cancel and the statement is false, the equations describe parallel lines with no shared point. If all terms cancel to a true identity, the equations represent the same line and have infinitely many pairs in common.'},
    {title:'Inequalities describe sets of possible values',body:'Adding or subtracting the same amount preserves an inequality. Multiplying or dividing by a negative flips its direction because it reverses order on a number line. In a system of inequalities, keep the intersection. Include an endpoint only if every relevant condition allows equality. When counts must be integers, test the first or last candidate explicitly.'},
  ],
  examples:[
    {title:'Eliminate with equal and opposite terms',prompt:'Solve $3x+y=14$ and $2x-y=6$.',steps:['Add the equations to cancel $y$, giving $5x=20$.','Divide to get $x=4$, then use the first equation to obtain $y=2$.','Verify the second equation: $2(4)-2=6$.']},
    {title:'Identify a contradiction',prompt:'Compare $4x-2y=10$ and $6x-3y=12$.',steps:['Divide the first equation by 2, giving $2x-y=5$.','Divide the second equation by 3, giving $2x-y=4$.','No ordered pair makes the same expression equal both 5 and 4. The system has no solution.']},
    {title:'Combine a flipped inequality with a bound',prompt:'Find the integers satisfying $15-3x≤0$ and $x<7$.',steps:['Subtract 15 to get $-3x≤-15$.','Divide by −3 and reverse the sign, so $x≥5$.','The simultaneous condition is $5≤x<7$. The integer solutions are 5 and 6.']},
  ],
  pitfalls:['Combining left sides without combining right sides.','Treating a contradictory identity as the solution zero.','Including a strict endpoint or forgetting to reverse a negative inequality.'],
  timing:'Look for a built-in cancellation first. For a bounds question, substitute one nearby interior value and one endpoint rather than rereading the whole problem.',
  guided:{prompt:'Which condition is equivalent to $9-4x<1$?',hint:'After subtracting 9, you will divide both sides by a negative number.',choices:['$x<2$','$x≤2$','$x>2$','$x≥2$'],answer:2,feedback:['Division by −4 reverses the direction.','Division reverses the direction and does not add equality.','Subtracting 9 gives $-4x<-8$. Dividing by −4 gives $x>2$.','The input 2 makes the expression equal 1 and violates the strict bound.']},
  summary:'Simplify conditions without changing their solution sets. Check the simultaneous solution against every original equation or bound.',
  sources:['act-math','openstax-systems','openstax-inequalities'],
};

export const systemsAndInequalities:Course={
  slug:'systems-inequalities',subject:'MATH',domain:'Algebra',topic:'Systems and inequalities',
  overview:'Solve for shared ordered pairs, classify systems, and turn overlapping constraints into decisions.',
  draftPracticeCount:bank.items.length,
  concepts:[
    {id:'substitution',level:'beginner',prerequisites:[]},
    {id:'systems-and-bounds',level:'intermediate',prerequisites:['substitution']},
    {id:'elimination',level:'intermediate',prerequisites:['systems-and-bounds']},
    {id:'signed-inequalities',level:'standard',prerequisites:['systems-and-bounds']},
    {id:'feasible-regions',level:'standard',prerequisites:['elimination','signed-inequalities']},
    {id:'constraint-models',level:'advanced',prerequisites:['elimination','feasible-regions']},
  ],
  lessons:[systemsLessons[0],originalLesson,...systemsLessons.slice(1)],
};
