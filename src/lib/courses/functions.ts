import type { Course } from './types';

export const functions: Course = {
  slug:'functions', subject:'MATH', domain:'Functions', topic:'Functions',
  overview:'Move between equations, tables, and graphs. Learn to evaluate a rule, describe its allowed inputs and outputs, and use transformations, composition, and inverses to solve unfamiliar problems.',
  practiceTopics:['Functions','Domain and range','Graphs and transformations'],
  lessons:[
    {
      id:'notation',title:'Function notation and representations',minutes:16,
      objectives:['Distinguish a function from a relation.','Evaluate formulas, tables, and piecewise rules.','Recover an input when an output is given.'],
      prerequisites:['Substitute negative values with parentheses.','Solve a one-step linear equation.'],
      instruction:[
        {title:'One output for each allowed input',body:'A function is a rule that pairs every permitted input with exactly one output. Two inputs can share an output. For example, squaring sends both $2$ and $-2$ to $4$. One input leading to two different outputs is what breaks the function rule. On a graph, use an imaginary vertical line. Two intersections at one input show two conflicting outputs.'},
        {title:'Read the symbol as an instruction',body:'Read $f(3)$ as “the output of $f$ at input 3.” Substitute the entire input wherever $x$ appears. If a question gives $f(x)=11$, the output is fixed and the input is unknown. Write the rule equal to 11 and solve for $x$. In a table, match the input column first and then read the output in the same row.'},
        {title:'Use change per unit in a linear function',body:'For a linear function, equal input changes always produce equal output changes. Divide the change in output by the change in input to get the slope. If $f(1)=8$ and $f(4)=14$, each input step adds $6/3=2$. To reach input zero, step back once from $f(1)$ to get $f(0)=6$.'},
        {title:'Pick the correct branch first',body:'A piecewise function uses different formulas under different conditions. Test the input against the conditions before doing any arithmetic. At a boundary, pay attention to which inequality includes equality. That branch owns the endpoint.'},
      ],
      examples:[
        {title:'Evaluate a signed input',prompt:'If $f(x)=2x^2-3x$, find $f(-2)$.',steps:['Replace every $x$ with $(-2)$, giving $2(-2)^2-3(-2)$. Parentheses keep the sign attached to the input.','Square before multiplying: $(-2)^2=4$, so the first term is 8.','Subtracting $3(-2)=-6$ adds 6. The output is 14.']},
        {title:'Go backward from an output',prompt:'A delivery function is $c(d)=5+2d$ for distance $d$ in miles. What distance costs 19 credits?',steps:['The cost is the output, so write $5+2d=19$.','Subtract the fixed charge of 5. The remaining 14 credits came from the distance charge.','Divide by 2 credits per mile to get $d=7$. Check $5+2(7)=19$.']},
        {title:'Use different rules across a boundary',prompt:'The rule is $h(x)=x+4$ for $x<1$ and $h(x)=x^2$ for $x≥1$. Find $h(0)+h(1)$.',steps:['At 0, use the first branch, giving $h(0)=4$.','At the boundary 1, only the second inequality allows equality. Thus $h(1)=1$.','Add the outputs to get 5. Substituting both inputs into the same branch would change the answer.']},
      ],
      pitfalls:['Reading $f(x)$ as multiplication by $f$.','Dropping the parentheses around a negative input.','Using the wrong piecewise rule at an equality boundary.'],
      timing:'Spend the first few seconds circling the requested input or output. For piecewise rules, mark the branch before you calculate. Check that you answered the quantity named in the last line.',
      guided:{prompt:'A rule is $p(x)=3x+1$ for $x<2$ and $p(x)=x^2+1$ for $x≥2$. What is $p(2)$?',hint:'Decide which inequality includes the point $x=2$ before substituting.',choices:['4','5','7','9'],answer:1,feedback:['The second branch includes 2, and it adds 1 after squaring.','$2≥2$, so use the second branch. $2^2+1=5$.','This is the result of using the branch that excludes 2.','The second rule squares the input only. It does not square the sum.']},
      summary:'Match the input to its rule, then evaluate. To find an input from an output, write an equation and solve.',
      sources:['act-math','openstax-notation'],
    },{
      id:'domain-range',title:'Domain, range, and restrictions',minutes:18,dependsOn:'notation',
      objectives:['Find restrictions from denominators and even roots.','Distinguish allowed inputs from possible outputs.','Read a range from a vertex or a graph.'],
      prerequisites:['Evaluate a function at a given input.','Solve and interpret a one-step inequality.'],
      instruction:[
        {title:'Inspect each operation for restrictions',body:'The domain is the set of permitted inputs. Start with all real numbers unless a context limits them. Remove inputs that make a denominator zero. For an even root in real numbers, require the expression under the root to be at least zero. If the root itself is in a denominator, require the expression under it to be strictly positive.'},
        {title:'Ask what outputs can actually occur',body:'The range is the collection of output values. Read it along the vertical axis. A lowest point that the graph touches belongs to the range. A bound the graph only approaches can be excluded. For a square plus a constant, the square contributes at least zero and can grow indefinitely.'},
        {title:'Apply restrictions before simplifying',body:'When a common factor cancels, a previously forbidden value stays forbidden. The simpler expression agrees only where the original rule was defined. In a word problem, also check whether inputs must represent whole objects, nonnegative time, or measurements limited to an interval.'},
      ],
      examples:[
        {title:'Remove a hole from the domain',prompt:'Find the domain of $f(x)=(x^2-4)/(x-2)$.',steps:['Set the original denominator equal to zero. It vanishes at 2.','The numerator factors as $(x-2)(x+2)$. Cancellation gives $x+2$ only where $x-2$ is nonzero.','The domain is all real numbers except 2. The simplified line has a missing point at that input.']},
        {title:'Combine a root and denominator',prompt:String.raw`Find the real domain of $g(x)=1/\sqrt{x-5}$.`,steps:['The square root requires $x-5≥0$.','At equality the denominator would be zero. Replace the weak inequality with $x-5>0$.','The domain is $x>5$. An input of 6 works, while 5 and 4 fail for different reasons.']},
        {title:'Read the range from a maximum',prompt:'Find the range of $q(x)=7-2(x+1)^2$ over all real inputs.',steps:['The square is 0 at $x=-1$ and positive elsewhere.','Subtracting twice a nonnegative quantity makes the output at most 7.','Every smaller output can occur because the square can take any nonnegative value. The range is $y≤7$.']},
      ],
      pitfalls:['Removing zero as an input when only a different denominator root is forbidden.','Treating an open endpoint as included.','Confusing the vertex’s input with the minimum or maximum output.'],
      timing:'Before algebra, scan for division, square roots, and word-problem restrictions. For range questions with a vertex form, decide whether the coefficient makes the vertex a minimum or maximum.',
      guided:{prompt:String.raw`What is the domain of $k(x)=\sqrt{2x+6}/(x-1)$ over the reals?`,hint:'Apply the square-root rule and the denominator rule separately. Then keep the inputs that pass both.',choices:['All real inputs except 1','All $x≥-3$','All $x>-3$ except 1','All $x≥-3$ except 1'],answer:3,feedback:['This catches the denominator but misses the square-root restriction.','This catches the square root but includes an input where the denominator is zero.','At −3 the numerator is zero and the denominator is nonzero, so −3 is allowed.','The root permits $x≥-3$ and the denominator excludes 1. Both restrictions apply.']},
      summary:'Domain follows input restrictions. Range follows achievable outputs and endpoint behavior.',
      sources:['act-math','openstax-domain'],
    },{
      id:'transformations',title:'Graph transformations and vertex form',minutes:20,dependsOn:'domain-range',
      objectives:['Translate known points using changes inside and outside a function.','Interpret reflections and vertical scaling.','Use vertex form to get a quadratic’s extremum.'],
      prerequisites:['Read an ordered pair on a coordinate plane.','Separate the $x$-coordinate from the $y$-coordinate.'],
      instruction:[
        {title:'Preserve the original input',body:'Start from a point $(a,b)$ on $y=f(x)$. Under $y=f(x-h)+k$, find the new input that makes the old rule see $a$. Solve $x-h=a$, so the new point is $(a+h,b+k)$. This reasoning is safer than memorizing a direction sign.'},
        {title:'Changes outside the rule affect outputs',body:'Multiplying outside the rule scales every output. A negative multiplier also reflects points across the horizontal axis. For $y=mf(x-h)+k$, transform a known point by changing the input to $a+h$ and the output to $mb+k$. Multiply before adding the shift.'},
        {title:'Read absolute value as distance',body:'The input portion $|x-h|$ gives distance from $h$ on the number line. To solve $|x-h|+k=v$, subtract $k$ first. A positive remaining distance gives one point on each side of $h$. For example, $|x-3|+2=6$ gives distance 4, hence inputs $-1$ and $7$. A zero distance has only one input and a negative distance has none.'},
        {title:'Use differences from a center',body:'In vertex form $a(x-h)^2+k$, the square is smallest at $x=h$. The point $(h,k)$ is a minimum for $a>0$ and a maximum for $a<0$. To identify the vertex from standard form, complete the square or use $x=-b/(2a)$ and then evaluate the function at that input.'},
      ],
      examples:[
        {title:'Map a known point',prompt:'If $f(4)=-2$, find a point on $y=f(x+3)+6$.',
          table:{caption:'Track input and output separately',headings:['Rule','Input','Output'],rows:[['Original $f(x)$','4','−2'],['New $f(x+3)+6$','$4-3=1$','$-2+6=4$']]},steps:['Make the input to the old rule equal 4: $x+3=4$.','Thus the new input is 1, three units left of 4.','The new output is $-2+6=4$. The point is $(1,4)$.']},
        {title:'Reflect, stretch, and shift',prompt:'The graph of $y=f(x)$ contains $(2,5)$. Map that point onto $y=-2f(x-4)+3$.',steps:['Set $x-4=2$ so the new input is 6.','Multiply the old output by −2 to get −10. The sign reflects, and the magnitude stretches.','Add 3 after multiplying. The corresponding point is $(6,-7)$.']},
        {title:'Complete a square to find a minimum',prompt:'Find the minimum value of $x^2+8x+11$.',steps:['Half the linear coefficient is 4. The square $(x+4)^2$ expands to $x^2+8x+16$.','Subtract the extra 5 to recover the original expression: $(x+4)^2-5$.','The square reaches 0 at $x=-4$, so the minimum output is −5.']},
      ],
      pitfalls:['Moving a point right when the inside uses $x+3$.','Adding the vertical shift before stretching the output.','Giving the vertex’s input when asked for the minimum value.'],
      timing:'When answer options are points, track one known point rather than drawing an entire graph. For a quadratic minimum, identify the vertex and finish with its output.',
      guided:{prompt:'A point on $y=f(x)$ is $(-1,4)$. Which point is on $y=3f(x-2)-5$?',hint:'Solve $x-2=-1$ first. Then apply the outside operations to 4 in order.',choices:['$(-3,7)$','$(1,7)$','$(1,-3)$','$(1,-7)$'],answer:1,feedback:['Solve the inside equation rather than subtracting 2 from the old input.','The input is 1. The output is $3(4)-5=7$.','Apply the multiplication before the subtraction.','The multiplier is positive, so the scaled old output is 12 before subtracting 5.']},
      summary:'Inside changes determine the new input. Outside changes determine the new output. A vertex gives both a location and an extreme value.',
      sources:['act-math','openstax-transform'],
    },{
      id:'composition-inverses',title:'Composition and inverse functions',minutes:21,dependsOn:'domain-range',
      objectives:['Evaluate or build compositions in the required order.','Test whether an inverse is a function.','Find and check an inverse with its restrictions.'],
      prerequisites:['Evaluate a formula at numeric and algebraic inputs.','Interpret a function’s domain and range.'],
      instruction:[
        {title:'The output of one rule becomes the input to another',body:'In $f(g(x))$, evaluate the inside rule $g$ first. Then substitute the complete output into $f$. Composition can also restrict the domain. The input must be allowed by $g$ and the resulting output must be allowed as an input to $f$.'},
        {title:'Undo operations in reverse order',body:'An inverse reverses input and output. If $f$ multiplies by 3 and then adds 5, undo by subtracting 5 and dividing by 3. Another method is to write $y=f(x)$, switch the variable names, and solve for $y$. Verify by composing with the original rule on the matching domain.'},
        {title:'Require one-to-one behavior',body:'Different inputs cannot lead to the same output if the inverse must be a function. On a graph, every horizontal line must meet at most one point. A quadratic across all real numbers fails this test. Restricting it to one side of the vertex allows a unique inverse. The inverse’s domain is the original output range.'},
      ],
      examples:[
        {title:'Compose in order',prompt:'Let $f(x)=5-2x$ and $g(x)=x^2+1$. Find $f(g(3))$.',steps:['Work from the inner parentheses: $g(3)=3^2+1=10$.','The whole number 10 is the input to $f$, so compute $5-2(10)$.','The answer is −15. Reversing the order would ask for $g(f(3))$, a different operation.']},
        {title:'Invert an affine rule',prompt:'Find the inverse of $f(x)=(x-4)/3$.',steps:['Start from $y=(x-4)/3$. The input was shifted by 4 and then scaled by $1/3$.','Recover $x$ by multiplying the output by 3, then adding 4. Thus $f^{-1}(y)=3y+4$.','Check an easy value: $f(10)=2$ and $f^{-1}(2)=10$.']},
        {title:'Respect a quadratic’s restricted domain',prompt:'Find the inverse of $f(x)=(x-1)^2+2$ for $x≥1$.',steps:['Set $y=(x-1)^2+2$ and subtract 2. The original range is $y≥2$.',String.raw`Because $x-1≥0$, use only the nonnegative root. Then $x=1+\sqrt{y-2}$.`,'The inverse’s domain is $y≥2$. Choosing a negative-root branch would produce an invalid original input below 1.']},
      ],
      pitfalls:['Reversing inside and outside functions.','Treating inverse notation $f^{-1}(x)$ as the reciprocal $1/f(x)$.','Keeping both square roots when the original domain permits only one branch.'],
      timing:'On a one-value inverse question, solve $f(x)=$ the given output. Finding a full inverse formula usually costs extra time.',
      guided:{prompt:'Let $f(x)=4x-7$ and $g(x)=x+2$. What is $f^{-1}(g(3))$?',hint:'Find the output of $g$ first, then solve $4x-7$ equal to that output.',choices:['$-1/2$','$1/13$','$3$','13'],answer:2,feedback:['The 7 must be added to both sides when undoing the subtraction.','An inverse reverses a mapping. It is not the reciprocal of an output.','$g(3)=5$. Solving $4x-7=5$ gives $x=3$.','This comes from evaluating $f(5)$, which uses the forward rule instead of the inverse.']},
      summary:'Compose from the inside outward. An inverse undoes the original rule, swaps its domain and range, and requires unique backwards outputs.',
      sources:['act-math','openstax-composition','openstax-inverse'],
    },
  ],
};
