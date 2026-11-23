import type {Lesson} from './types';

export const quadraticMethods:Lesson[]=[
  {
    id:'complete-square',title:'Complete the square',minutes:20,dependsOn:'polynomials',
    objectives:['Find the constant needed to complete a binomial square.','Handle a leading coefficient other than one.','Interpret vertex form as a minimum or maximum.'],
    prerequisites:['Identify and combine polynomial terms.','Multiply a binomial by itself.','Solve a squared equation.'],
    instruction:[
      {title:'Split an expression into a square and a remainder',body:'A binomial square expands as $(x+h)^2=x^2+2hx+h^2$. When the leading coefficient is 1, half the coefficient of $x$ gives $h$. Add and subtract $h^2$ to create the square without changing the whole expression. The remaining constant tells you the value of the quadratic at its vertex.'},
      {title:'Factor the leading coefficient out of the variable terms',body:'For $3x^2-12x+7$, factor 3 from the square and linear terms to get $3(x^2-4x)+7$. Finish the square inside parentheses and retain the outer factor. Adding 4 inside the parentheses adds 12 to the whole expression, so the balancing subtraction must account for all 12.'},
      {title:'Choose the form that solves the problem',body:'The form $a(x-h)^2+k$ shows the axis $x=h$ and vertex $(h,k)$. For $a>0$ the output cannot fall below $k$; for $a<0$ it cannot rise above $k$. To find roots, set the output to zero and isolate the square before taking square roots. The sign of the isolated right side tells whether real roots exist.'},
    ],
    examples:[
      {title:'Create a square by balancing constants',prompt:'Rewrite $x^2+10x+19$ in vertex form.',steps:['Half of 10 is 5, so use $(x+5)^2$.','The completed square contains 25, six more than the original constant.','Subtract 6 to get $(x+5)^2-6$. The vertex is $(-5,-6)$.']},
      {title:'Distribute the balancing term',prompt:'Find the minimum of $3x^2-12x+7$.',steps:['Write $3(x^2-4x)+7$. The square inside uses $(x-2)^2$.','Replace $x^2-4x$ with $(x-2)^2-4$.','The result is $3(x-2)^2-5$, so the minimum value is −5.']},
      {title:'Solve the completed-square form',prompt:'Solve $x^2-2x-15=0$ by completing the square.',steps:['Move 15 to the right. Add 1 to both sides.','The resulting equation is $(x-1)^2=16$.','Take both square roots to get $x-1=4$ or $x-1=-4$. The roots are 5 and −3.']},
    ],
    pitfalls:['Squaring the entire linear coefficient instead of its half.','Losing the leading coefficient when moving the balancing constant.','Reporting the vertex input as the minimum output.'],
    timing:'Use the vertex formula when you need a single numeric answer quickly. Use completing the square when the choices ask for an equivalent form or make the solution immediate.',
    guided:{prompt:'Which expression equals $2x^2+8x+11$?',hint:'Factor 2 from the variable terms, then complete the square inside.',choices:['$2(x+2)^2+3$','$2(x+4)^2+3$','$2(x+2)^2+7$','$2(x-2)^2+3$'],answer:0,feedback:['The square contributes 8 to the constant, leaving 3.','The coefficient inside after factoring is 4, so halve 4 to get 2.','The 4 created inside is multiplied by 2.','This square would give a negative linear term.']},
    summary:'Halve the inside linear coefficient, balance the new constant, and read the squared form in the context of the question.',
    sources:['act-math','openstax-quadratics'],
  },{
    id:'quadratic-formula',title:'Use the quadratic formula and classify roots',minutes:21,dependsOn:'complete-square',
    objectives:['Read signed coefficients from standard form.','Use the discriminant and quadratic formula accurately.','Choose when the formula is more efficient than factoring.'],
    prerequisites:['Write standard form correctly.','Interpret positive and negative square roots.','Understand the completed-square form.'],
    instruction:[
      {title:'The formula works even when integer factors do not',body:String.raw`For $ax^2+bx+c=0$ and $a \ne 0$, the roots are $x=\frac{-b\pm\sqrt{b^2-4ac}}{2a}$. It comes from dividing by $a$, completing the square, and isolating the two square-root branches. The denominator divides the entire numerator.`},
      {title:'Read the discriminant before solving',body:'The quantity $b^2-4ac$ determines how many real roots appear. Positive gives two distinct real roots. Zero gives one distinct real root. Negative gives no real roots. For a root-count question, this check is enough. Keep each coefficient signed, especially when $c<0$.'},
      {title:'Choose the simplest equivalent form',body:'A common factor or easy integer factors often solve faster than the formula. Use the formula when a trinomial does not factor conveniently or when options contain radicals. Leave an exact radical if options are exact. If an option gives a decimal, compare after simplifying the arithmetic enough to avoid rounding into the wrong choice.'},
    ],
    examples:[
      {title:'Solve with a negative constant',prompt:'Solve $2x^2+x-6=0$ using the formula.',steps:['The discriminant is $1-4(2)(-6)=49$.','The numerator values are $-1+7=6$ and $-1-7=-8$.','Divide each entire numerator by 4. The roots are $3/2$ and $-2$.']},
      {title:'Keep a radical exact',prompt:'Find the real roots of $x^2-4x+1=0$.',steps:['The discriminant is $16-4=12$.',String.raw`Insert the coefficients to get $(4\pm\sqrt{12})/2$.`,String.raw`Since $\sqrt{12}=2\sqrt{3}$, the roots are $2+\sqrt{3}$ and $2-\sqrt{3}$.`]},
      {title:'Identify the boundary between two roots and none',prompt:'Find $k$ so that $3x^2-6x+k=0$ has one distinct real root.',steps:['Require the discriminant to vanish.','Set $36-12k=0$.','Solve $k=3$. The equation becomes $3(x-1)^2=0$, with one distinct root.']},
    ],
    pitfalls:['Using $b$ instead of $-b$ at the start of the numerator.','Dividing only the radical by $2a$.','Treating a negative discriminant as one real solution.'],
    timing:'Write the three signed coefficients and the discriminant. If asked only for the number of real roots, stop once you know its sign.',
    guided:{prompt:'Which values solve $x^2-6x+5=0$ using the quadratic formula?',hint:'The discriminant is 16. Divide both possible numerators by 2.',choices:['−5 and −1','1 and 5','2 and 10','3 and 4'],answer:1,feedback:['The numerator begins with positive 6 because $b=-6$.','The two roots are $(6-4)/2=1$ and $(6+4)/2=5$.','These are the numerators before dividing by 2.','These are related to intermediate values rather than roots.']},
    summary:'Start with signed coefficients. Preserve both branches, divide the whole numerator, and use the discriminant to classify the real roots.',
    sources:['act-math','openstax-quadratics'],
  },{
    id:'quadratic-models',title:'Analyze and optimize quadratic models',minutes:25,dependsOn:'roots-and-vertex',
    objectives:['Translate a situation into a quadratic and specify its feasible domain.','Choose candidate inputs on an interval or among integers.','Use relationships between roots without solving each root.'],
    prerequisites:['Find a vertex, classify real roots, and solve factorable quadratics.','Interpret domains and convert an answer back to context.'],
    instruction:[
      {title:'Model the feasible domain first',body:'Write the dependent quantity using just one independent variable. A dimension, count, or time may impose a restriction. For a quadratic on a closed interval, compare the endpoints and the vertex if it lies in the interval. When variables must be integers, check the nearest feasible integers around the vertex instead of rounding the output.'},
      {title:'Read root structure without computing exact roots',body:'For nonzero $a$, write $ax^2+bx+c=a(x-r)(x-s)$. Comparing terms gives $r+s=-b/a$ and $rs=c/a$. These relationships can answer questions about products, sums, and expressions like $r^2+s^2$ without finding individual roots. The midpoint of two real roots is the axis.'},
      {title:'Select a form that exposes the requested quantity',body:'Factored form exposes zeros, vertex form exposes an extremum and its location, and standard form exposes coefficients. Favor the form matching the question. For an ACT application, confirm the requested unit and whether an algebraic input can occur in the real situation.'},
    ],
    examples:[
      {title:'Optimize an integer count',prompt:'A group models revenue by $R(n)=-3n^2+45n$ for whole numbers $0≤n≤12$. Which $n$ maximizes revenue?',steps:['The axis is $n=45/6=7.5$.','The nearest feasible integers are 7 and 8. They are equally far from the axis.','Both give $168$. The symmetric quadratic ties at these two choices.']},
      {title:'Use root relationships for a harder expression',prompt:'The roots of $2x^2-7x+3=0$ are $r,s$. Find $r^2+s^2$.',steps:['Read $r+s=7/2$ and $rs=3/2$ from the coefficients.','Use $r^2+s^2=(r+s)^2-2rs$.','The value is $49/4-3=37/4$. No radical calculation is needed.']},
      {title:'Reject an infeasible vertex',prompt:'The output $P(x)=-2(x-9)^2+100$ is defined for $1≤x≤6$. Where is it largest?',steps:['The unconstrained maximum occurs at 9. That value is outside the allowed interval.','On the allowed interval, moving right decreases the distance to 9.','The largest feasible output occurs at $x=6$. Substituting gives 82.']},
    ],
    pitfalls:['Using an unrestricted vertex for a constrained problem.','Rounding the revenue rather than comparing feasible integer inputs.','Omitting division by the leading coefficient when comparing roots.'],
    timing:'Check the axis relative to the allowed domain before evaluating. If a question only needs a symmetric combination of roots, compare coefficients instead of solving twice.',
    guided:{prompt:'For $2x^2-9x+4=0$, what is the sum of its roots?',hint:'Compare the linear coefficient with the expansion of $2(x-r)(x-s)$.',choices:['$-9/2$','2','$9/2$','9'],answer:2,feedback:['The sum is $-b/a$, so the negative sign cancels the negative coefficient.','This is the product $c/a$.','The sum is $-(-9)/2=9/2$.','Divide the sign-adjusted linear coefficient by 2.']},
    summary:'State the feasible domain, inspect the axis or roots in the appropriate form, and report the quantity requested.',
    sources:['act-math','openstax-quadratics','openstax-quadratic-functions'],
  },
];
