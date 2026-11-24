import type {Course} from './types';
import {proportions} from './proportions';
import {systemsAndInequalities} from './systems-inequalities';

export const priorityMath:Course[]=[
  proportions,systemsAndInequalities,{
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
