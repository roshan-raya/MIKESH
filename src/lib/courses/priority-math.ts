import type {Course} from './types';
import {proportions} from './proportions';

export const priorityMath:Course[]=[
  proportions,{
    slug:'systems-inequalities',subject:'MATH',domain:'Algebra',topic:'Systems and inequalities',
    overview:'Translate mathematical conditions into equations and inequalities, then keep only solutions that satisfy them together.',
    lessons:[{
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
    }],
  },{
    slug:'coordinate-geometry',subject:'MATH',domain:'Geometry',topic:'Coordinate geometry',
    overview:'Extract slopes, distances, midpoints and line relationships from coordinate data.',
    lessons:[{
      id:'points-and-lines',title:'Measure points and construct lines',minutes:21,
      objectives:['Compute slope, midpoint, and distance from two points.','Write a line through a known point.','Test parallel and perpendicular directions.'],
      prerequisites:['Subtract negative numbers.','Use the Pythagorean theorem.','Read coordinates in the order $x,y$.'],
      instruction:[
        {title:'Treat displacement as two signed changes',body:'From one point to another, horizontal change is the second $x$ minus the first $x$, and vertical change is the second $y$ minus the first $y$. Slope is vertical change divided by horizontal change. A horizontal line has slope zero, while a vertical line has undefined slope. Reversing both subtraction orders leaves slope unchanged.'},
        {title:'Build length and midpoint from the same changes',body:'Horizontal and vertical displacements form perpendicular legs. Square, add, and take the nonnegative square root to get their straight-line distance. Average the two $x$-coordinates and the two $y$-coordinates separately for the midpoint. If you know the midpoint and one endpoint, double each midpoint coordinate and subtract that endpoint coordinate.'},
        {title:'Use a point to set the intercept',body:'Given a slope and a point, the equation $y-y_1=m(x-x_1)$ states that change in output equals slope times change in input. Distinct nonvertical parallel lines have equal slopes. Perpendicular nonvertical, nonhorizontal lines have negative reciprocal slopes. Horizontal and vertical lines are also perpendicular.'},
      ],
      examples:[
        {title:'Find the slope of a descending segment',prompt:'Find the slope between $(-3,5)$ and $(1,-3)$.',steps:['Horizontal change is $1-(-3)=4$.','Vertical change is $-3-5=-8$.','The ratio is $-8/4=-2$. The negative value agrees with the downward direction as $x$ increases.']},
        {title:'Find a midpoint and length',prompt:'For endpoints $(-2,1)$ and $(4,9)$, give their midpoint and distance.',steps:['Average the coordinates separately to get $(({-2}+4)/2,(1+9)/2)=(1,5)$.','The displacements have lengths 6 and 8.','The squared length is $6^2+8^2=100$, so the distance is 10.']},
        {title:'Construct a perpendicular line',prompt:'Find the equation through $(2,1)$ perpendicular to $y=2x-4$.',steps:['The original slope is 2. Its negative reciprocal is $-1/2$.','Use point-slope form $y-1=-(x-2)/2$.','Distribute and add 1 to obtain $y=-x/2+2$. Substituting input 2 gives output 1.']},
      ],
      pitfalls:['Using run over rise for slope.','Treating the distance as the sum of horizontal and vertical changes.','Negating a slope without also taking its reciprocal for perpendicular directions.'],
      timing:'On a multiple-choice line problem, first discard equations with the wrong slope. Then substitute the known point into the remaining choices.',
      guided:{prompt:'A segment has midpoint $(1,-2)$ and one endpoint $(-2,-5)$. What is the other endpoint?',hint:'Solve the two midpoint averages independently.',choices:['$(0,1)$','$(3,1)$','$(4,-1)$','$(4,1)$'],answer:3,feedback:['A midpoint is an average. The other input must be 4 for the inputs to average to 1.','The other input comes from $2(1)-(-2)=4$.','$y$ must be $2(-2)-(-5)=1$.','The other coordinates are $2(1)-(-2)=4$ and $2(-2)-(-5)=1$.']},
      summary:'Use consistent displacement signs. Apply rise over run, coordinate averages, and the Pythagorean theorem to the quantity asked for.',
      sources:['act-math','openstax-coordinate'],
    }],
  },{
    slug:'right-triangle-trig',subject:'MATH',domain:'Geometry',topic:'Triangles and trigonometry',
    overview:'Relate angles and sides in right triangles, then model heights and distances efficiently.',
    lessons:[{
      id:'right-triangle-ratios',title:'Use sine, cosine, and tangent',minutes:24,
      objectives:['Label the opposite, adjacent, and hypotenuse relative to the chosen angle.','Use trigonometric ratios and special triangles.','Build and check a height or distance model.'],
      prerequisites:['Recognize a right triangle and its hypotenuse.','Solve a simple equation in one variable.'],
      instruction:[
        {title:'Label sides relative to the reference angle',body:'The hypotenuse lies opposite the right angle and is always the longest side. For an acute angle, the opposite leg is across from that angle and the adjacent leg touches it. Sine compares opposite to hypotenuse, cosine compares adjacent to hypotenuse, and tangent compares opposite to adjacent. Changing the reference angle swaps the roles of the legs.'},
        {title:'Use similarity and special triangles',body:'Right triangles with the same acute angle are similar, so their corresponding side ratios are constant. A 45–45–90 triangle has equal legs and a hypotenuse equal to a leg times the square root of 2. A 30–60–90 triangle has side lengths in the ratio 1 to the square root of 3 to 2, ordered from the side opposite 30 degrees to the hypotenuse.'},
        {title:'Convert the wording into a diagram',body:'An angle of elevation is measured upward from horizontal. An angle of depression is measured downward from horizontal. Mark the reference angle before choosing a ratio. If the observer stands above the ground, the triangle often gives the height difference relative to the observer, so add the observer height if total height is requested.'},
      ],
      examples:[
        {title:'Read a trigonometric ratio from legs',prompt:'The legs of a right triangle are 7 and 24. For the acute angle opposite the 7-unit leg, find sine and tangent.',steps:['The hypotenuse is 25 by the Pythagorean theorem.','The sine is opposite over hypotenuse, $7/25$.','The tangent is opposite over adjacent, $7/24$. Both ratios use the same opposite leg.']},
        {title:'Use the ratio in a special triangle',prompt:'A 30–60–90 triangle has hypotenuse 14. Find the side opposite the 30-degree angle.',steps:['The opposite side is the short leg because 30 degrees is the smaller acute angle.','Short-leg to hypotenuse ratio is 1 to 2.','Divide 14 by 2 to get 7. The longer leg is not needed.']},
        {title:'Model a total height',prompt:'A surveyor’s eye is 1.5 meters high, 12 meters from a pole. If the angle of elevation to the top is 45 degrees, how tall is the pole?',steps:['The horizontal run is 12 meters and the unknown opposite leg starts at eye level.','At 45 degrees, tangent is 1, so the rise equals the run of 12 meters.','Add 1.5 meters to get a pole height of 13.5 meters.']},
      ],
      pitfalls:['Assigning opposite and adjacent before choosing the reference angle.','Using the sloping distance as the horizontal run.','Leaving a calculator in radians for a degree-based question.'],
      timing:'Draw one triangle, mark the requested side, and choose the ratio that uses exactly the two known or requested sides. A special triangle may save calculator time.',
      guided:{prompt:'A right triangle has hypotenuse 17. The side adjacent to angle A has length 15. What is the tangent of A?',hint:'Find the opposite leg before forming opposite over adjacent.',choices:['$8/17$','$8/15$','$15/8$','$15/17$'],answer:1,feedback:['This is sine because the denominator is the hypotenuse.','The opposite leg is 8. Tangent equals $8/15$.','This reverses opposite and adjacent.','This is cosine because it compares adjacent to hypotenuse.']},
      summary:'Choose an angle, label sides, and use the ratio that connects the needed lengths. Check what the resulting height or distance represents.',
      sources:['act-math','openstax-trig'],
    }],
  },
];
