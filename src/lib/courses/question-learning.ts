import exponentBank from '../../../content/exponents-and-radicals-draft.json';
import numberQuantityBank from '../../../content/number-and-quantity-draft.json';
import {connectedPrerequisites} from './connections';
import sentenceBoundaryBank from '../../../content/sentence-boundaries-draft.json';
import {bySlug,byTopic} from './index';
import {chapterGraph,prerequisitePath} from './chapter';
import type {Attempt} from '../metrics';
import textbookBank from '../../../content/quadratic-textbook.json';
import priorityBank from '../../../content/priority-math-draft.json';
import linearBank from '../../../content/linear-equations-draft.json';
import proportionsBank from '../../../content/proportional-reasoning-draft.json';

type ErrorNote = {gap:string; explanation:string; lesson?:string};
type Profile = {
  course: string;
  lesson: string;
  skill: string;
  secondary: string[];
  objective: string;
  wrong: Record<string,ErrorNote>;
};

function profile(course:string,lesson:string,skill:string,secondary:string[],objective:string,wrong:Record<string,[string,string, string?]>):Profile {
  return {course,lesson,skill,secondary,objective,wrong:Object.fromEntries(Object.entries(wrong)
    .map(([choice,[gap,explanation,lesson]])=>[choice,{gap,explanation,lesson}]))};
}
const fn=(lesson:string,skill:string,secondary:string[],objective:string,wrong:Parameters<typeof profile>[5])=>
  profile('functions',lesson,skill,secondary,objective,wrong);
const quad=(lesson:string,skill:string,secondary:string[],objective:string,wrong:Parameters<typeof profile>[5])=>
  profile('quadratics',lesson,skill,secondary,objective,wrong);

export const questionProfiles:Record<string,Profile>={
  'px-m13@1':profile('exponents-and-radicals','rational-powers','Evaluate a fractional exponent',['Principal roots','Integer powers'],
    'Take the fourth root of 16, then raise the result to the third power.',{
      A:['Treat the numerator as a power','The fourth root is 2. Multiplying 2 by 3 gives 6, while cubing 2 gives 8.'],
      C:['Use the denominator as a root index','Multiplying 16 by 3/4 gives 12. The exponent instead calls for a fourth root followed by a cube.'],
      D:['Check the result using the power definition','The fourth root of 16 is 2. Three factors of 2 give 8. A result of 32 would use five factors.'],
    }),
  'ag02@1':profile('sentence-boundaries','joining-clauses','Join two independent clauses',['Finite verbs','Punctuation'],
    'Use a semicolon to preserve the complete statements about settings and uploads.',{
      A:['Fused sentence','The two independent clauses need a separator or a suitable conjunction.'],
      C:['Comma splice','A comma alone cannot join the complete statements on both sides.'],
      D:['Misplaced boundary','This removes export settings as the object of changed and makes the settings part of what went through.'],
    }),
  'px-e08@1':profile('sentence-boundaries','boundary-meaning','Set off supplementary information',['Modifier scope','Paired commas'],
    'Keep the injury information supplementary and preserve the complete subject and predicate.',{
      B:['Misplaced internal comma','The comma interrupts the phrase injured her ankle.'],
      C:['Unmatched comma','The comma before watched separates the subject and verb without opening a supplementary clause.'],
      D:['Missing closing comma','Close the who clause before the main verb watched.'],
    }),
  'hd10@1':profile('sentence-boundaries','boundary-meaning','Distinguish an identifying name from a supplementary name',['Appositives','Paired commas'],
    'Treat the name as supplementary when the role already identifies the person.',{
      A:['Identifying name','Leaving the name unpunctuated presents it as part of the identification.'],
      C:['Missing opening comma','A lone comma after the name separates subject from verb.'],
      D:['Missing closing comma','The supplementary name must close before the main verb.'],
    }),
  'legacy-introductory-comma':profile('sentence-boundaries','clause-foundations','Separate an introductory phrase',['Prepositional phrases','Subject and verb'],
    'Place the requested comma after the whole introductory phrase.',{
      A:['Missing requested separator','This can be readable in prose, but it does not use the comma requested here.'],
      C:['Split phrase','The comma separates after from its object lunch.'],
      D:['Split main clause','The comma separates we from its verb went.'],
    }),
  'legacy-linear-balance':profile('linear-equations','balance','Undo subtraction and multiplication',['Substitution','Signed arithmetic'],
    'Add 7 to both sides and divide by 5, then check the result in the original equation.',{
      A:['Check by substitution','Three gives 5(3) − 7 = 8, below the target 18.'],
      B:['Restore the full constant','Four gives 5(4) − 7 = 13. Add the full 7 to 18 before dividing.'],
      D:['Check the target before dividing','Six gives 5(6) − 7 = 23. The intermediate target is 25 rather than 30.'],
    }),
  'px-m09@1':profile('linear-equations','constraints','Model a total with two ticket prices',['Distribution','Inverse operations'],
    'Express student tickets as the difference between the total and the adult count, then solve the revenue equation.',{
      A:['Check both group counts','Five adult tickets and 13 student tickets bring in 45 + 65 = 110 tokens.'],
      B:['Apply the price difference per ticket','Seven adult tickets bring the total to 118. Switching one student ticket to adult adds four tokens.'],
      D:['Verify the modeled total','Ten adult tickets and eight student tickets cost 90 + 40 = 130 tokens.'],
    }),
  'hd04@1':profile('linear-equations','linear-graphs','Recover the fixed fee',['Slope','Substitution'],
    'Find the price per poster from two totals, then subtract the per-poster charges from one total.',{
      A:['Separate the slope from the intercept','Three dollars is the price of an additional poster. Subtract eight such charges from USD 34.'],
      B:['Distinguish the input from the starting output','Eight is the first poster count. The fee is the cost at input zero.'],
      D:['Separate total change from the fixed charge','Twelve dollars is the change in cost over four additional posters. The fixed fee cancels when taking that difference.'],
    }),
  'legacy-functions-evaluation':fn('notation','Evaluate a function at a fixed input',['Order of operations','Integer exponents'],
    'Substitute 3 for the variable, square it, multiply by 2, and add the constant.',{
      A:['Order of operations','13 uses 6 in place of the squared input 9. Compute $3^2$ before multiplying.'],
      B:['Carry the constant term','18 is the value of $2(3^2)$ before adding 1.'],
      D:['Track the arithmetic','After squaring and doubling, the running total is 18. Adding 1 gives 19 rather than 20.'],
    }),
  'm08@1':fn('transformations','Find a quadratic minimum',['Completing the square','Range'],
    'Write the quadratic as a square plus a constant and report its minimum output.',{
      A:['Distinguish input from output','2 is the input where the square is zero. Substitute it to get the minimum output 3.','domain-range'],
      C:['Expand the square','$(x-2)^2=x^2-4x+4$. The original expression has constant 7, so the remainder is 3.'],
      D:['Distinguish intercept from vertex','7 is the output at $x=0$. The vertex at $x=2$ lies lower.'],
    }),
  'px-fn01@1':fn('notation','Recover the input from an output',['Inverse operations','Linear equation solving'],
    'Set $3x-4$ equal to 11 and undo the subtraction before dividing.',{
      A:['Check the input by substitution','$3(3)-4=5$. An input of 3 does not produce 11.'],
      C:['Check the output target','$3(7)-4=17$. The question fixes the output at 11.'],
      D:['Finish both inverse operations','15 is the intermediate value of $3x$ after you add 4. Divide by 3 to isolate $x$.'],
    }),
  'px-fn02@1':fn('composition-inverses','Evaluate a composition',['Function substitution','Order of operations'],
    'Evaluate the inner rule at 4 and use its full output as the input of the outer rule.',{
      A:['Apply the outer rule completely','The inner result is 5. The outer rule squares it before adding 1, giving 26.','notation'],
      B:['Use the inner result as the input','17 is $f(4)$ alone. The outer input must be $g(4)=5$.'],
      D:['Keep the composition order','35 does not match the two steps. The inner rule gives $g(4)=5$. Substituting 5 into the outer rule gives $25+1=26$.'],
    }),
  'px-fn03@1':fn('domain-range','Find a rational function domain',['Zero denominators','Substitution checks'],
    'Find the input that makes $x-5$ zero and exclude only that value.',{
      A:['Solve the denominator equation','At $x=0$ the denominator is −5, which is allowed. The denominator vanishes at 5.'],
      B:['Keep negative denominators','At $x=4$ the denominator is −1. The quotient is defined, so inputs below 5 also belong.'],
      C:['Keep positive denominators','At $x=6$ the denominator is 1. The quotient is defined, so inputs above 5 also belong.'],
    }),
  'px-fn04@1':fn('transformations','Map a point through horizontal and vertical shifts',['Ordered pairs','Input preservation'],
    'Solve $x+3=4$ for the new input and add 5 to the old output.',{
      B:['Horizontal shift direction','If the new input were 7, $f$ would receive 10. Solve $x+3=4$ to preserve the known input.'],
      C:['Vertical shift direction','Adding 5 makes the old output −2 increase to 3. A new output of −7 would require subtraction.'],
      D:['Separate horizontal and vertical shifts','An input of 7 would feed 10 into $f$, and −7 is −2 minus 5. Solve the inside equation and apply the outside plus separately.'],
    }),
  'px-fn05@1':fn('composition-inverses','Evaluate an inverse at one output',['Inverse operations','Substitution checks'],
    'Solve $4x+7=19$ to recover the original input.',{
      A:['Undo addition with the correct sign','Subtract 7 from 19 to obtain positive 12. Then divide by positive 4.','notation'],
      C:['Undo the multiplication as well','12 is the value of $4x$, so divide by 4 to find $x$.','notation'],
      D:['Distinguish direct and inverse evaluation','83 is $f(19)$. The inverse asks for the number that would produce 19.'],
    }),
  'px-fn06@1':fn('transformations','Solve a shifted absolute-value equation',['Distance on a number line','Two-branch equations'],
    'Remove the outside constant, then find both inputs at distance 5 from 2.',{
      A:['Remove the outside shift before using distance','−4 and 6 are each the wrong distance from 2. Subtract 1 first, then solve $x-2=5$ and $x-2=-5$.'],
      B:['Use the correct center','−5 and 5 are centered around zero. The expression $|x-2|$ measures distance from 2.'],
      D:['Check both branches','7 works, but 3 is only one unit from 2. The input five units to the left is −3.'],
    }),
  'px-fn07@1':fn('notation','Find the intercept from two function values',['Slope','Signed change'],
    'Compute the output change per unit, then use it to reach the output at input zero.',{
      A:['Separate input zero from output zero','The question fixes the input at zero. The intercept is the output there, which need not be zero.'],
      B:['Report an output','2 is an input already given in the problem. Move two input units left and compute the output change.'],
      D:['Keep the starting output','6 is the change in output over two input units. Subtract it from $f(2)=9$.'],
    }),
  'px-fn08@1':fn('transformations','Use quadratic symmetry',['Vertex axis','Midpoint'],
    'Find the symmetry axis and set it equal to the midpoint of the two equal-output inputs.',{
      A:['Compute the midpoint from the actual inputs','The proposed inputs −1 and 3 have midpoint 1. Equal outputs require midpoint 3.'],
      B:['Find the correct axis','Inputs 0 and 4 have midpoint 2. Completing the square gives axis $x=3$.'],
      D:['Distinguish the axis from an endpoint','3 is the axis, which lies between the two inputs. Set $a+2=3$ to get the left input.'],
    }),
  'px-q01@1':quad('multiplication','Expand two binomials',['Distributive property','Signed products'],
    'Calculate both cross products and the signed constant product in $(x-6)(x+2)$.',{
      A:['Preserve signs on the cross terms','The cross terms are $2x$ and $-6x$. Their sum is $-4x$, not $4x$.','multiplication'],
      C:['Track the sign of the constant','The constant is $(-6)(2)=-12$. The cross terms total $-4x$.','multiplication'],
      D:['Include the cross products','Multiplication includes $x(2)$ and $(-6)x$. They do not cancel.','multiplication'],
    }),
  'px-q02@1':quad('zero-product','Solve a factorable quadratic',['Factor pairs','Zero-product property'],
    'Factor the trinomial using 2 and 5, then solve each factor equation for its root.',{
      A:['Distinguish factor constants from roots','2 and 5 appear in the factors $x+2$ and $x+5$. Setting either factor equal to zero reverses that sign.','zero-product'],
      B:['Solve both factor equations','$-2$ is a root. The second factor $x+5$ is zero at $-5$, not 5.','zero-product'],
      C:['Solve both factor equations','$-5$ is a root. The first factor $x+2$ is zero at $-2$, not 2.','zero-product'],
    }),
  'px-q03@1':quad('factoring','Solve after taking a common factor',['Greatest common factor','Linear equations'],
    'Factor out $3x$ and solve $2x-5=0$ for the nonzero root.',{
      A:['Keep numerator and denominator in order','Solving $2x=5$ means divide 5 by 2, not 2 by 5.'],
      B:['Identify the remaining factor','Dividing out the common factor $3x$ leaves $2x-5$. Solve that remaining factor.'],
      D:['Finish isolating the variable','$2x=5$ is an intermediate step. Divide by 2.'],
    }),
  'px-q04@1':quad('roots-and-vertex','Find the input at a vertex',['Completing the square','Input versus output'],
    'Make the square equal to zero, then report the input that achieves the minimum.',{
      A:['Distinguish the minimum value from its input','−9 is the minimum output. The question asks where it occurs.'],
      C:['Interpret the leading coefficient','3 stretches the vertical scale and does not locate the vertex. Set $x+4=0$.'],
      D:['Solve the inner linear equation','$x+4=0$ gives $x=-4$, not 4.'],
    }),
  'px-q05@1':quad('quadratic-formula','Set the discriminant equal to zero',['Discriminant','Linear equations'],
    'Use $12^2-4(2)c=0$ to determine the value of $c$ that produces exactly one real root.',{
      A:['Check the discriminant at the proposed value','At $c=6$, the discriminant is $144-48=96$. A positive discriminant gives two distinct real roots.'],
      B:['Check the discriminant at the proposed value','At $c=9$, the discriminant is $72$, still positive. A repeated root needs zero.'],
      C:['Distinguish the linear coefficient from the constant','The 12 belongs to the linear term. Setting $c=12$ gives a discriminant of 48, not zero.'],
    }),
  'px-q06@1':quad('factoring','Model consecutive integers',['Consecutive values','Factor pairs'],
    'Represent the integers as $n,n+1$, then solve the product equation and preserve the positive root.',{
      A:['Check consecutive products','$11(12)=132$, which is below 156.'],
      C:['Report the smaller integer','$12$ and $13$ have product 156. The requested smaller member is 12.'],
      D:['Check consecutive products','$14(15)=210$, which exceeds 156.'],
    }),
  'px-q07@1':quad('roots-and-vertex','Compute a quadratic maximum',['Axis of symmetry','Function evaluation'],
    'Find the vertex input from the coefficients and substitute it to obtain the maximum output.',{
      A:['Distinguish input from output','4 is the input at the vertex. Substitute 4 to get the maximum output.'],
      B:['Compute the vertex output','8 is not the value at the vertex. Substituting $x=4$ gives $-32+64-21=11$.'],
      D:['Keep the signed constant','The constant contributes −21. The correct vertex substitution is $-32+64-21=11$.'],
    }),
  'px-q08@1':quad('quadratic-models','Optimize within a restricted interval',['Domain','Vertex behavior'],
    'Find the unconstrained vertex and choose the feasible input with the greatest output.',{
      A:['Check which endpoint is better','The graph is increasing throughout the interval from 0 to 5. The left endpoint cannot be the maximum.'],
      C:['Check feasibility before reporting the vertex','7 is the unrestricted vertex input, outside the permitted range.'],
      D:['Distinguish a coefficient from the input','14 is a coefficient, not a feasible input. The maximum allowed production is 5 units.'],
    }),
};

const prioritySkills:Record<string,[string,string[],string[]]>={
  'Proportional reasoning':['proportional-reasoning',['Scale factors','Percent bases'],['Scale a ratio','Compound percent changes','Scale both area dimensions']],
  'Systems and inequalities':['systems-inequalities',['Linear equations','Boundary checks'],['Elimination','Equivalent systems','Intersection of integer bounds']],
  'Coordinate geometry':['coordinate-geometry',['Signed coordinate changes','Line equations'],['Slope','Coordinate distance','Perpendicular line slope']],
  'Triangles and trigonometry':['right-triangle-trig',['Right triangle sides','Reference angles'],['Sine ratio','Special-triangle side lengths','Height with tangent']],
};
const priorityProfiles=Object.fromEntries(priorityBank.items.map(item=>{
  const [course,secondary,skills]=prioritySkills[item.topic];
  const skill=skills[Number(item.slug.at(-1))-1];
  return [item.slug+'@1',{
    course,lesson:item.subtopic,skill,secondary,objective:item.objective,
    wrong:Object.fromEntries(Object.entries(item.distractors).map(([choice,explanation])=>
      [choice,{gap:skill,explanation}])),
  } as Profile];
}));

const textbookSecondary:Record<string,string[]>={
  variables:['Signed substitution','Inverse operations'],
  multiplication:['Signed products','Combine like terms'],
  exponents:['Order of operations','Square roots'],
  polynomials:['Distributive property','Exponent rules'],
  factoring:['Signed factors','Cross products'],
  'zero-product':['Linear equation solving','Interpret repeated roots'],
  'complete-square':['Binomial squares','Vertex form'],
  'quadratic-formula':['Discriminant','Signed substitution'],
  'roots-and-vertex':['Graph symmetry','Input and output'],
  'quadratic-models':['Domain constraints','Root structure'],
};
const textbookProfiles=Object.fromEntries(textbookBank.items.map(item=>{
  const secondary=textbookSecondary[item.subtopic];
  const lesson=bySlug('quadratics')!.lessons.find(lesson=>lesson.id===item.subtopic)!;
  return [item.slug+'@1',{
    course:'quadratics',lesson:item.subtopic,skill:lesson.title,secondary,objective:item.objective,
    wrong:Object.fromEntries(Object.entries(item.distractors).map(([choice,explanation])=>
      [choice,{gap:lesson.title,explanation}])),
  } as Profile];
}));

const chapterBatches = [
  {slug:'exponents-and-radicals',items:exponentBank.items},
  {slug:'number-and-quantity',items:numberQuantityBank.items},
  {slug:'sentence-boundaries',items:sentenceBoundaryBank.items},
  {slug:'proportional-reasoning',items:proportionsBank.items},
  {slug:'linear-equations',items:linearBank.items},
];
const chapterProfiles=Object.fromEntries(chapterBatches.flatMap(({slug,items})=>items.map(item=>{
  const course=bySlug(slug)!;
  const secondary=item.tags.filter(tag=>tag.startsWith('supporting-skill:')).map(tag=>tag.slice('supporting-skill:'.length));
  const wrong=Object.fromEntries(Object.entries(item.distractors).map(([choice,explanation])=>{
    const prefix='remediation:'+choice+':';
    const lesson=item.tags.find(tag=>tag.startsWith(prefix))?.slice(prefix.length)??item.subtopic;
    const gap=course.lessons.find(entry=>entry.id===lesson)?.title??item.objective;
    return [choice,{lesson,gap,explanation}];
  }));
  return [item.slug+'@1',{course:course.slug,lesson:item.subtopic,skill:item.objective,secondary,objective:item.objective,wrong} satisfies Profile];
})));

const relatedChapters:Readonly<Record<string,readonly string[]>>={
  'number-and-quantity':['proportional-reasoning','linear-equations','quadratics','exponents-and-radicals'],
  'exponents-and-radicals':['number-and-quantity','linear-equations','quadratics'],
  'linear-equations':['functions','systems-inequalities','coordinate-geometry'],
  quadratics:['functions','coordinate-geometry'],
  functions:['quadratics','coordinate-geometry'],
  'proportional-reasoning':['right-triangle-trig'],
  'systems-inequalities':['coordinate-geometry'],
  'coordinate-geometry':['systems-inequalities','functions'],
  'right-triangle-trig':['proportional-reasoning','coordinate-geometry'],
};

type QuestionReference={bank_key:string|null;subject:string;topic:string;prompt:string;difficulty?:number;objective?:string|null};
export function findQuestionProfile(question:QuestionReference) {
  const key=question.bank_key??(
    question.subject==='MATH'&&question.topic==='Functions'&&question.prompt==='If f(x) = 2x² + 1, what is f(3)?'
      ? 'legacy-functions-evaluation'
      : question.subject==='MATH'&&question.topic==='Linear equations'&&question.prompt==='If 5x − 7 = 18, what is x?'
        ? 'legacy-linear-balance'
        : question.subject==='ENGLISH'&&question.topic==='Punctuation'&&question.prompt==='Which sentence uses a comma to set off the introductory phrase without splitting the main clause?'
          ? 'legacy-introductory-comma' : '');
  if(Object.hasOwn(questionProfiles,key)) return questionProfiles[key];
  if(Object.hasOwn(priorityProfiles,key)) return priorityProfiles[key];
  if(Object.hasOwn(chapterProfiles,key)) return chapterProfiles[key];
  return Object.hasOwn(textbookProfiles,key)?textbookProfiles[key]:undefined;
}

export function questionLearning(question:QuestionReference,answer:string|null) {
  const profile=findQuestionProfile(question);
  const course=profile?bySlug(profile.course):byTopic(question.subject,question.topic);
  const lesson=course?.lessons.find(entry=>entry.id===profile?.lesson);
  const lessonPath=(lessonId:string)=>`/learn/${course!.slug}?lesson=${lessonId}`;
  const error=answer&&profile ? profile.wrong[answer] : undefined;
  const graph=course?chapterGraph(course):[];
  const node=graph.find(concept=>concept.id===lesson?.id);
  const chapterLinks=(ids:string[])=>ids.flatMap(id=>{
    const entry=course?.lessons.find(item=>item.id===id);
    return entry?[{title:entry.title,link:lessonPath(entry.id)}]:[];
  });
  const link=lesson?lessonPath(lesson.id):course?'/learn/'+course.slug:
    '/syllabus/topic?subject='+question.subject+'&topic='+encodeURIComponent(question.topic);
  return {
    topic:question.topic,
    difficulty:question.difficulty,
    basics:course?lessonPath(course.lessons[0].id):undefined,
    chapter:course?'/learn/'+course.slug:undefined,
    link,
    complete:Boolean(profile&&lesson),
    subtopic:lesson?.title,
    skill:profile?.skill,
    secondary:profile?.secondary??[],
    objective:profile?.objective??question.objective,
    prerequisites:lesson?.prerequisites??[],
    foundationLinks:lesson?[...connectedPrerequisites(course!.slug,lesson.id),...chapterLinks(prerequisitePath(graph,lesson.id).map(concept=>concept.id))]:[],
    relatedTopics:(course?relatedChapters[course.slug]??[]:[]).flatMap(slug=>{
      const related=bySlug(slug);
      return related?[{title:related.topic,link:'/learn/'+slug}]:[];
    }),
    related:node?chapterLinks(graph.filter(concept=>concept.prerequisites.includes(node.id)).map(concept=>concept.id)):[],
    error:error?{...error,link:error.lesson?lessonPath(error.lesson):link}:undefined,
    retest:lesson ? `/learn/${course!.slug}?view=test&lesson=${error?.lesson??lesson.id}`+(course!.concepts?'&focus='+(error?.lesson??lesson.id):'') : undefined,
    feedback:profile?Object.fromEntries(Object.entries(profile.wrong).map(([id,note])=>[id,note.explanation])):{},
    sources:lesson?.sources??[],
  };
}

export type QuestionLearning = ReturnType<typeof questionLearning>;


export function recommendConcept(attempts:Attempt[],courseFilter?:string) {
  const latest = new Map<string,Attempt>();
  for (const attempt of [...attempts].sort((a,b)=>b.created_at.localeCompare(a.created_at)||b.id.localeCompare(a.id))) {
    if(attempt.holdout||attempt.selected_answer==='Unanswered') continue;
    const family=attempt.family??attempt.question_id;
    if(!latest.has(family)) latest.set(family,attempt);
  }
  const groups=new Map<string,{course:string;lesson:string;title:string;misses:number;href:string}>();
  for(const attempt of latest.values()){
    if(attempt.is_correct) continue;
    const profile=findQuestionProfile({bank_key:attempt.bankKey??null,subject:attempt.subject,topic:attempt.topic,prompt:attempt.questionPrompt??''});
    if(!profile||(courseFilter&&profile.course!==courseFilter)) continue;
    const feedback=profile.wrong[attempt.selected_answer];
    if(!feedback) continue;
    const lesson=feedback.lesson??profile.lesson;
    const entry=bySlug(profile.course)?.lessons.find(item=>item.id===lesson);
    if(!entry) continue;
    const key=profile.course+'/'+lesson;
    const group=groups.get(key)??{course:profile.course,lesson,title:entry.title,misses:0,href:`/learn/${profile.course}?lesson=${lesson}`};
    group.misses++;
    groups.set(key,group);
  }
  return [...groups.values()].filter(group=>group.misses>=2).sort((a,b)=>b.misses-a.misses)[0];
}
