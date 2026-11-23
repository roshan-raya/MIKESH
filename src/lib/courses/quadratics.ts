import type {Course,ConceptNode} from './types';
import {quadraticFoundations} from './quadratic-foundations';
import {quadraticMethods} from './quadratic-methods';

const concepts:ConceptNode[]=[
  {id:'variables',level:'beginner',prerequisites:[]},
  {id:'multiplication',level:'beginner',prerequisites:['variables']},
  {id:'exponents',level:'beginner',prerequisites:['variables','multiplication']},
  {id:'polynomials',level:'intermediate',prerequisites:['exponents','multiplication']},
  {id:'factoring',level:'intermediate',prerequisites:['polynomials','multiplication']},
  {id:'zero-product',level:'intermediate',prerequisites:['factoring','variables']},
  {id:'complete-square',level:'standard',prerequisites:['polynomials','exponents']},
  {id:'quadratic-formula',level:'standard',prerequisites:['complete-square','polynomials']},
  {id:'roots-and-vertex',level:'standard',prerequisites:['complete-square','quadratic-formula','zero-product']},
  {id:'quadratic-models',level:'advanced',prerequisites:['roots-and-vertex','factoring','zero-product']},
];

export const quadratics:Course={
  concepts,slug:'quadratics',subject:'MATH',domain:'Algebra',topic:'Quadratics',
  overview:'Learn how the structure of a quadratic determines which solving method saves time, then check what its roots and vertex mean.',
  lessons:[
    ...quadraticFoundations.slice(0,4),
    {
      id:'factoring',dependsOn:'polynomials',title:'Factor quadratics and find their roots',minutes:20,
      objectives:['Factor a common term first.','Factor a trinomial by using sum and product.','Apply the zero-product property only after setting one side to zero.'],
      prerequisites:['Use the distributive property.','Multiply signed integers and solve a linear equation.'],
      instruction:[
        {title:'Factoring reverses distribution',body:'A factor is a quantity that multiplies another quantity. For $x^2+bx+c$, look for signed integers $m,n$ with sum $b$ and product $c$. Expanding $(x+m)(x+n)$ gives $x^2+(m+n)x+mn$. If the product is negative, the signs differ. If it is positive and the sum is negative, both are negative.'},
        {title:'Solve a zero-product equation',body:'If a product equals zero, one or more factors must be zero. Move all terms to one side before you use this rule. If a factor contains the variable, keep the possibility that the factor is zero rather than dividing by it. Dividing by a variable would discard a possible root.'},
        {title:'Account for a leading coefficient other than one',body:'For $ax^2+bx+c$, find integers whose product is $ac$ and sum is $b$. Split the middle term into those two parts. Then factor each group and look for the shared binomial. This works because the two cross products of the binomials supply the split terms.'},
      ],
      examples:[
        {title:'Factor a monic quadratic',prompt:'Solve $x^2-x-12=0$.',steps:['Find a pair with product −12 and sum −1. The pair is −4 and 3.','Write $(x-4)(x+3)=0$. Expand mentally to confirm the middle term is $-x$.','Set each factor to zero. The roots are $4$ and $-3$.']},
        {title:'Keep a root a division would lose',prompt:'Solve $4x^2=12x$.',steps:['Move the right-hand side left to make $4x^2-12x=0$.','Factor out the common term, giving $4x(x-3)=0$.','The factor $x$ can be zero, so the solutions are $x=0$ and $x=3$.']},
        {title:'Split the middle term',prompt:'Solve $6x^2+x-2=0$.',steps:['The product $ac$ is −12. The pair 4 and −3 sums to 1.','Rewrite as $6x^2+4x-3x-2=0$, then group as $2x(3x+2)-(3x+2)=0$.','Factor to get $(2x-1)(3x+2)=0$. The roots are $1/2$ and $-2/3$.']},
      ],
      pitfalls:['Choosing factors with the correct product but the wrong sum.','Dividing out $x$ and losing a zero root.','Trying to set a factor equal to zero when the whole product is nonzero.'],
      timing:'Start by checking for a common factor or a difference of squares. If the necessary pair does not appear quickly, use another exact method or substitute viable answer choices.',
      guided:{prompt:'Which pair solves $x^2+2x-15=0$?',hint:'Find two integers with product −15 and sum 2, then solve the two factor equations.',choices:['$-5$ and $3$','$5$ and $-3$','$5$ and $3$','$-5$ and $-3$'],answer:0,feedback:['$(x+5)(x-3)=0$, so the roots are −5 and 3.','These are the numbers in the factors. The roots have the opposite signs.','The two roots cannot both have the same sign when their product is negative.','The roots must have opposite signs.']},
      summary:'Set the equation to zero, factor, and solve each factor equation. Keep possible zero roots.',
      sources:['act-math','openstax-quadratics'],
    },
    quadraticFoundations[4],
    ...quadraticMethods.slice(0,2),
    {
      id:'roots-and-vertex',title:'Use the vertex and discriminant',minutes:23,dependsOn:'factoring',
      objectives:['Find the vertex by completing a square or evaluating at the axis.','Use the discriminant to count real roots.','Translate a root or extremum back to a word problem.'],
      prerequisites:['Expand a binomial square.','Solve a factorable quadratic and distinguish an input from an output.'],
      instruction:[
        {title:'Choose a method based on the target',body:'A question about minimum value asks for an output, while a question about a zero asks for an input. Vertex form $a(x-h)^2+k$ reveals $(h,k)$ immediately. When the equation is in standard form, the axis is $x=-b/(2a)$. Evaluate the function there to obtain the extreme output.'},
        {title:'See why the discriminant counts roots',body:'The quadratic formula contains a square root of $b^2-4ac$. A positive value yields two different real roots, zero gives one repeated real root, and a negative value gives no real roots. You can answer a root-count question without computing either root.'},
        {title:'Apply real-world restrictions after solving',body:'A height, distance, or time model may have an algebraic root outside the permitted interval. Check against the context. If a vertex is outside a restricted interval, compare the allowed endpoints instead of assuming the global extremum is attainable.'},
      ],
      examples:[
        {title:'Find the minimum output',prompt:'Find the minimum of $q(x)=2x^2-12x+11$.',steps:['Use $x=-b/(2a)=12/4=3$. This is the axis, not the output.','Evaluate $q(3)=18-36+11=-7$.','Since $a=2>0$, the parabola opens upward. The minimum output is −7.']},
        {title:'Force a repeated root',prompt:'Find $c$ so that $x^2-10x+c=0$ has exactly one real solution.',steps:['Require the discriminant to equal zero.','Substitute into $b^2-4ac$: $100-4c=0$.','Solve $c=25$. Verify the resulting expression is $(x-5)^2$.']},
        {title:'Keep the root that represents time',prompt:'After $t$ seconds, a model gives height $h(t)=12+4t-t^2$. When does the height first reach zero for $t≥0$?',steps:['Set $12+4t-t^2=0$, then multiply by −1 to get $t^2-4t-12=0$.','Factor as $(t-6)(t+2)=0$, giving 6 and −2.','Only 6 seconds belongs to the stated time domain.']},
      ],
      pitfalls:['Using $b^2+4ac$ instead of $b^2-4ac$.','Confusing the vertex coordinate $x$ with the maximum or minimum value.','Reporting a mathematically valid root that the context excludes.'],
      timing:'If asked how many roots exist, stop once you know the sign of the discriminant. If asked for the vertex output, calculate the axis first and immediately substitute its input.',
      guided:{prompt:'How many real solutions does $2x^2+4x+5=0$ have?',hint:'Compute only the discriminant.',choices:['Zero','One','Two','Four'],answer:0,feedback:['$4^2-4(2)(5)=16-40=-24$. A negative discriminant gives no real roots.','One real solution requires a zero discriminant.','Two real solutions require a positive discriminant.','A quadratic can have at most two distinct real roots.']},
      summary:'Use the discriminant for root count, the vertex for an extremum, and the context to decide what a computed value means.',
      sources:['act-math','openstax-quadratics'],
    },
    quadraticMethods[2],
  ],
};
