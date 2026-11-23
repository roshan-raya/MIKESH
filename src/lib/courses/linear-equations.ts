import type {Course} from './types';
import bank from '../../../content/linear-equations-draft.json';

export const linearEquations:Course={
  slug:'linear-equations', subject:'MATH', domain:'Algebra', topic:'Linear equations',
  overview:'Preserve equality, extract a constant rate from a table, and build equations that connect a starting value to a target. These skills support Functions, Coordinate Geometry, and Systems and Inequalities.',
  draftPracticeCount:bank.items.length,
  concepts:[
    {id:'balance',level:'beginner',prerequisites:[]},
    {id:'equivalent-forms',level:'intermediate',prerequisites:['balance']},
    {id:'linear-graphs',level:'standard',prerequisites:['balance','equivalent-forms']},
    {id:'constraints',level:'advanced',prerequisites:['equivalent-forms','linear-graphs']},
  ],
  lessons:[
    {
      id:'balance',title:'Balance and solve an equation',minutes:18,
      objectives:['Read equality as a claim about two expressions.','Undo operations in reverse order.','Check a candidate in the original equation.'],
      prerequisites:['Subtract signed whole numbers.','Multiply and divide integers.'],
      instruction:[
        {title:'Think of two equal quantities',body:'An equation states that its two expressions have the same value. An expression such as $4x-7$ can be evaluated at a given input. The equation $4x-7=13$ asks which input makes the equality true. That input is the solution.'},
        {title:'Use reversible moves',body:'Adding the same number to both sides preserves equality. The move can be undone by subtraction, so it preserves the set of solutions as well. The same reasoning applies to multiplying or dividing both sides by the same nonzero number. Multiplying by zero loses information because every number maps to zero.'},
        {title:'Unwrap operations from the outside',body:'For $4x-7=13$, the expression multiplies the input by 4 before subtracting 7. Undo the subtraction first, then undo multiplication. For $4(x-7)=13$, division comes first because multiplication acts on the entire group.'},
      ],
      examples:[
        {title:'Undo subtraction, then multiplication',prompt:'Solve $4x-7=13$.',steps:['Add 7 to each side, giving $4x=20$.','Divide each side by 4 to get $x=5$.','Check that $4(5)-7=13$.']},
        {title:'Track a negative coefficient',prompt:'Solve $11-3x=23$.',steps:['Subtract 11 from both sides to get $-3x=12$.','Divide by negative 3 to get $x=-4$.','The product $-3(-4)=12$ increases 11 to 23.']},
        {title:'Work with an entire group',prompt:'Solve $6(x+2)=15$.',steps:['Divide both sides by 6, giving $x+2=5/2$.','Subtract 2, giving $x=1/2$.','Check $6(1/2+2)=15$. An equation may have a noninteger solution.']},
      ],
      pitfalls:['Applying an operation to one side only.','Dividing by the unsigned coefficient.','Rounding a fraction before checking.'],
      timing:'If choices are numeric and arithmetic is short, plugging one into the original equation can eliminate it immediately.',
      guided:{prompt:'Solve $5-2x=13$.',hint:'Subtract 5 before dividing.',choices:['−4','4','−9','9'],answer:0,feedback:['After subtracting 5, divide 8 by −2.','The coefficient is negative.','Start by removing 5 from both sides.','Subtract the constant and keep the sign of the coefficient.']},
      summary:'Undo operations symmetrically, preserve signs, and substitute into the original equation.',
      sources:['act-math','openstax-linear-equations'],
    },
    {
      id:'equivalent-forms',title:'Simplify both sides and classify solutions',minutes:23,dependsOn:'balance',
      objectives:['Distribute across complete groups.','Clear constant denominators on both sides.','Separate unique solutions, identities, and contradictions.'],
      prerequisites:['Isolate a variable with inverse operations.','Recognize common denominators.'],
      instruction:[
        {title:'Simplify expressions before solving',body:'The distributive rule converts $a(b+c)$ to $ab+ac$. Because both terms are multiplied, $-2(x-3)$ becomes $-2x+6$. Combine terms with the same variable and power. An equation with variables on both sides then reduces to $Ax=B$ after you collect variable terms and constants.'},
        {title:'Clear denominators in a single move',body:'With constant nonzero denominators, multiply the entire equation by a common multiple. For denominators 3 and 4, multiplying by 12 cancels both. Any standalone term must also be multiplied by 12. A variable denominator needs its own domain check and belongs to rational-equation study.'},
        {title:'Interpret cancellation',body:'When $A$ is nonzero, $Ax=B$ has one solution. If $A$ is zero and $B$ is zero, every input in the domain works. If $A$ is zero and $B$ is nonzero, the equation is inconsistent. Cancellation provides this information without ever dividing by zero.'},
      ],
      examples:[
        {title:'Distribute a negative multiplier',prompt:'Solve $-2(x-3)=x+15$.',steps:['Distribute to get $-2x+6=x+15$.','Collect the variable terms and constants to obtain $-3x=9$.','Divide by −3. At $x=-3$, both sides equal 12.']},
        {title:'Clear the fractions',prompt:'Solve $(x+1)/3=(x-2)/4+1$.',steps:['Multiply every term by 12 to get $4(x+1)=3(x-2)+12$.','Expand to get $4x+4=3x+6$.','Subtract $3x$ and 4, giving $x=2$. Both original sides then equal 1.']},
        {title:'Compare identity and contradiction',prompt:'Compare $3(x+2)=3x+6$ with $3(x+2)=3x+8$.',steps:['The common left side expands to $3x+6$.','Subtract $3x$ from both sides of each equation.','The first gives $6=6$ and holds for every real number. The second gives $6=8$ and has no solution.']},
      ],
      pitfalls:['Distributing to only the first term.','Leaving a standalone constant unchanged when clearing fractions.','Reporting zero as the solution when all variable terms cancel.'],
      timing:'If coefficients cancel, read the remaining constants before doing any further arithmetic.',
      guided:{prompt:'How many real solutions does $4(x+1)=4x+9$ have?',hint:'Expand and subtract $4x$ on both sides.',choices:['None','One, at 0','One, at 5','Infinitely many'],answer:0,feedback:['Cancellation leaves the false statement $4=9$.','Substituting zero gives 4 and 9.','The difference of constants is multiplied by no variable.','An identity requires matching constants after cancellation.']},
      summary:'Simplify, collect, then classify according to the remaining coefficient and constants.',
      sources:['act-math','openstax-linear-equations'],
    },
    {
      id:'linear-graphs',title:'Read and construct a line',minutes:22,dependsOn:'equivalent-forms',
      objectives:['Compute signed slope from two points.','Separate a rate of change from a starting value.','Distinguish horizontal and vertical lines.'],
      prerequisites:['Solve a one-variable equation.','Read ordered pairs and subtract signed numbers.'],
      instruction:[
        {title:'Slope is output change per input change',body:'For two distinct points with different inputs, divide the change in output by the change in input. Take both differences in the same direction. A negative slope means the output falls as the input increases.'},
        {title:'One point fixes the starting value',body:'In $y=mx+b$, slope $m$ controls the change and $b$ is the output when $x=0$. Once $m$ is known, insert a tabulated point and solve for $b$. To find the input intercept, set $y=0$ because that crossing lies on the horizontal axis.'},
        {title:'Handle zero changes precisely',body:'If the output never changes, the slope is zero. If the input never changes, the slope is undefined because the denominator is zero. A vertical line has form $x=c$ and cannot be written as a single output for each input.'},
      ],
      examples:[
        {title:'Build a line from a table',prompt:'A line passes through $(2,11)$ and $(5,20)$. Find its rule.',steps:['The output rises by 9 as the input increases by 3, so slope is 3.','Insert $(2,11)$ to get $11=3(2)+b$, hence $b=5$.','The rule is $y=3x+5$. Test input 5 to confirm output 20.'],table:{caption:'The constant rate is 3 output units per input unit',headings:['Input','Output'],rows:[['0','5'],['2','11'],['5','20']]}},
        {title:'Find the input intercept',prompt:'Where does $y=-4x+18$ cross the horizontal axis?',steps:['On the horizontal axis, $y=0$.','Solve $4x=18$ to get $x=9/2$.','Report $(9/2,0)$ because an intercept point has two coordinates.']},
        {title:'Recognize a vertical line',prompt:'Find the equation through $(3,2)$ and $(3,9)$.',steps:['The two inputs are both 3.','Input change is zero, so dividing output change by it is undefined.','The equation is $x=3$, with no restriction on the output.']},
      ],
      pitfalls:['Mixing subtraction directions.','Computing a rate as output divided by input when there is a fixed starting value.','Confusing input and output intercepts.'],
      timing:'Eliminate choices with the wrong slope sign before solving for an intercept.',
      guided:{prompt:'A line passes through $(1,7)$ and $(4,1)$. What is its slope?',hint:'Use both changes in the order second minus first.',choices:['2','−2','−1/2','6'],answer:1,feedback:['The line falls as the input increases.','Output changes by −6 and input by 3.','Slope is change in output divided by change in input.','Use the signed output change and divide by the input change.']},
      summary:'Compute rise over run, use one point to find the intercept, and handle zero run as a vertical line.',
      sources:['act-math','openstax-linear-equations','openstax-coordinate'],
    },
    {
      id:'constraints',title:'Model thresholds and parameter cases',minutes:27,dependsOn:'linear-graphs',
      objectives:['Model fixed charges and changing totals.','Translate a solved threshold into a valid whole-number answer.','Find parameter values that change the number of solutions.'],
      prerequisites:['Classify a simplified equation.','Construct a linear rule from rate and starting value.'],
      instruction:[
        {title:'Track what the input measures',body:'Write a model in units before using it. If a repair costs 25 credits plus 12 credits per hour, 25 is fixed and $12h$ changes with hours. To find when two offers cost the same, equate their two expressions at the same input. Their gap is also linear, so one test input on each side of a crossing settles which offer is cheaper.'},
        {title:'Interpret the domain after solving',body:'A continuous break-even time may be a fraction. For an integer count, a requirement to reach at least a target means finding the smallest admissible integer that meets it. A strict requirement can exclude an integer exactly at equality. Test the proposed count and its neighbor.'},
        {title:'Separate a parameter from the unknown',body:'If $kx+5=2x+9$, collect terms to get $(k-2)x=4$. For $k=2$ the left side vanishes for every input but the right side is nonzero. For other $k$, divide by $k-2$. Find exceptional parameter values before division so no case disappears.'},
      ],
      examples:[
        {title:'Compare two payment plans',prompt:'Plan A costs $18+4n$ credits and plan B costs $7n$. For what smallest whole-number $n$ is A cheaper?',steps:['Equate the rules to get $18=3n$, so they tie at 6.','Plan A has the smaller per-item rate, so it costs less after the crossing.','The smallest eligible integer is 7. At 7 the totals are 46 and 49.']},
        {title:'Reach a shipping target',prompt:'A parcel starts at 14 kg and gains 2.5 kg per package. How many packages are needed to reach at least 32 kg?',steps:['Solve $14+2.5p=32$ to find the equality point $p=7.2$.','Only whole packages are allowed, so test 8.','Seven reaches 31.5 kg and eight reaches 34 kg. Eight is minimal.']},
        {title:'Find a parameter for infinitely many solutions',prompt:'For which $a$ does $(a+1)x+12=4(x+3)$ hold for every real $x$?',steps:['Expand the right side to $4x+12$.','The constants already agree. Match coefficients: $a+1=4$.','At $a=3$ both expressions are identical. Any other $a$ makes only $x=0$ work.']},
      ],
      pitfalls:['Rounding to the nearest integer without checking feasibility.','Reading an equality point as a strict comparison.','Dividing by a parameter expression that may be zero.'],
      timing:'At a break-even value, the smaller slope wins to the right. For a parameter, compare coefficients before substituting answer choices.',
      guided:{prompt:'At what value of $k$ does $kx+3=5x+12$ have no real solution?',hint:'Match the coefficients and compare the constants.',choices:['3','5','9','12'],answer:1,feedback:['With different coefficients there is one solution.','Both coefficients become 5, leaving the impossible condition $3=12$.','The difference of the constants does not determine cancellation.','Twelve is the right-side constant, not its coefficient.']},
      summary:'Write the model, solve its equality case, then interpret strictness, units, and exceptional parameters.',
      sources:['act-math','openstax-linear-equations'],
    },
  ],
};
