/* ============================================================
   REVEAL MATH PRACTICE — Grade 3 scope and sequence
   Mirrors the unit/lesson order of the McGraw-Hill Reveal Math
   Grade 3 Student Practice Book the learner uses at school, so
   home practice lines up with class. Every problem here is
   ORIGINAL and generated fresh each time (unlimited practice);
   only the unit and lesson names follow the book.
   Each lesson: a Review card (like the book), then 8 problems
   with Ananse's hints, then a score. Parents can set "where the
   class is" so that lesson is offered first.
   ============================================================ */
"use strict";
const REVEAL_UNITS={
 2:{t:"Use Place Value to Fluently Add and Subtract within 1,000",home:"Find 3-digit numbers around the house (page numbers, prices). Ask for the number in expanded form and rounded to the nearest 10 and 100."},
 3:{t:"Multiplication and Division",home:"Give your child a handful of objects. Have them make equal groups, then say the multiplication AND the matching division equation."},
 4:{t:"Use Patterns to Multiply by 0, 1, 2, 5, and 10",home:"Skip-count by 2s, 5s and 10s in the car. Then ask a fact out of order: 'What is 5 times 7?'"},
 5:{t:"Use Properties to Multiply by 3, 4, 6, 7, 8, and 9",home:"For a hard fact like 8 × 6, ask your child to break one factor apart: 8 × 3 + 8 × 3. Do it with counters or cereal."},
 6:{t:"Connect Area and Multiplication",home:"Count floor tiles or a checkerboard: rows × columns = area. Find two rectangles that share a side and add their areas."},
 7:{t:"Fractions",home:"Cut a sandwich or pizza into equal parts. Name each piece as a fraction and find where 1/2 and 3/4 sit on a ruler."},
 8:{t:"Fraction Equivalence and Comparison",home:"Fold one strip of paper into halves and another into fourths. Show that 1/2 = 2/4, then compare 1/3 and 1/4 of the same strip."},
 9:{t:"Use Multiplication to Divide",home:"Turn every division into a missing-factor question: 42 ÷ 7 is 'seven times what is 42?'"},
 10:{t:"Use Properties and Strategies to Multiply and Divide",home:"Give a two-step shopping problem: 'Three packs of 4 pencils, then use 5. How many are left?' Ask if the answer sounds reasonable."},
 11:{t:"Perimeter",home:"Measure around a book, a table or a room with a tape measure. Add the sides to get the perimeter."},
 12:{t:"Measurement and Data",home:"Read an analog clock to the minute, weigh fruit in grams, and make a tally chart of family shoe colors — then draw a bar graph."},
 13:{t:"Describe and Analyze 2-Dimensional Shapes",home:"Go on a shape hunt: find rectangles, squares, rhombuses and trapezoids. Ask what makes each one a quadrilateral."}
};
const REVEAL_LESSONS=[
 {id:"2-1",u:2,t:"Represent Four-Digit Numbers",g:"blocks"},
 {id:"2-2",u:2,t:"Round Multi-Digit Numbers",g:"round"},
 {id:"2-3",u:2,t:"Estimate Sums and Differences",g:"estimate"},
 {id:"2-4",u:2,t:"Use Addition Properties to Add",g:"addProps"},
 {id:"2-5",u:2,t:"Addition Patterns",g:"addPatterns"},
 {id:"2-6",u:2,t:"Use Partial Sums to Add",g:"add3"},
 {id:"2-7",u:2,t:"Decompose to Subtract",g:"sub3"},
 {id:"2-8",u:2,t:"Adjust Numbers to Add or Subtract",g:"adjust"},
 {id:"2-9",u:2,t:"Use Addition to Subtract",g:"addToSub"},
 {id:"2-10",u:2,t:"Fluently Add within 1,000",g:"add3"},
 {id:"2-11",u:2,t:"Fluently Subtract within 1,000",g:"sub3"},
 {id:"2-12",u:2,t:"Solve Two-Step Problems",g:"twoStepAdd"},
 {id:"3-1",u:3,t:"Understand Equal Groups",g:"equalGroups"},
 {id:"3-2",u:3,t:"Use Arrays to Multiply",g:"array"},
 {id:"3-3",u:3,t:"Understand the Commutative Property",g:"commutative"},
 {id:"3-4",u:3,t:"Understand Equal Sharing",g:"sharing"},
 {id:"3-5",u:3,t:"Understand Equal Grouping",g:"grouping"},
 {id:"3-6",u:3,t:"Relate Multiplication and Division",g:"relate"},
 {id:"3-7",u:3,t:"Find the Unknown",g:"unknown"},
 {id:"4-1",u:4,t:"Use Patterns to Multiply by 2",g:"mult",p:[2]},
 {id:"4-2",u:4,t:"Use Patterns to Multiply by 5",g:"mult",p:[5]},
 {id:"4-3",u:4,t:"Use Patterns to Multiply by 10",g:"mult",p:[10]},
 {id:"4-4",u:4,t:"Use Patterns to Multiply by 1 and 0",g:"mult",p:[0,1]},
 {id:"4-5",u:4,t:"Multiply Fluently by 0, 1, 2, 5, and 10",g:"mult",p:[0,1,2,5,10]},
 {id:"4-6",u:4,t:"Solve Problems Involving Equal Groups",g:"groupsWP",p:[2,5,10]},
 {id:"5-1",u:5,t:"Understand the Distributive Property",g:"distributive"},
 {id:"5-2",u:5,t:"Use Properties to Multiply by 3",g:"mult",p:[3]},
 {id:"5-3",u:5,t:"Use Properties to Multiply by 4",g:"mult",p:[4]},
 {id:"5-4",u:5,t:"Use Properties to Multiply by 6",g:"mult",p:[6]},
 {id:"5-5",u:5,t:"Use Properties to Multiply by 8",g:"mult",p:[8]},
 {id:"5-6",u:5,t:"Use Properties to Multiply by 7 and 9",g:"mult",p:[7,9]},
 {id:"5-7",u:5,t:"Solve Problems Involving Arrays",g:"arrayWP"},
 {id:"6-1",u:6,t:"Understand Area",g:"areaCount"},
 {id:"6-2",u:6,t:"Count Unit Squares to Determine Area",g:"areaCount"},
 {id:"6-3",u:6,t:"Use Multiplication to Determine Area",g:"areaMult"},
 {id:"6-4",u:6,t:"Determine the Area of a Composite Figure",g:"areaComposite"},
 {id:"6-5",u:6,t:"Use the Distributive Property to Determine Area",g:"areaDistrib"},
 {id:"6-6",u:6,t:"Solve Area Problems",g:"areaWP"},
 {id:"7-1",u:7,t:"Partition Shapes into Equal Parts",g:"partition"},
 {id:"7-2",u:7,t:"Understand Fractions",g:"fracShade"},
 {id:"7-3",u:7,t:"Represent Fractions on a Number Line",g:"fracLine"},
 {id:"7-4",u:7,t:"Represent One Whole as a Fraction",g:"fracWhole"},
 {id:"7-5",u:7,t:"Represent Whole Numbers as Fractions",g:"fracWholeNum"},
 {id:"7-6",u:7,t:"Represent a Fraction Greater Than One on a Number Line",g:"fracLine",p:["gt1"]},
 {id:"8-1",u:8,t:"Understand Equivalent Fractions",g:"equiv"},
 {id:"8-2",u:8,t:"Represent Equivalent Fractions",g:"equiv"},
 {id:"8-3",u:8,t:"Represent Equivalent Fractions on a Number Line",g:"equivLine"},
 {id:"8-4",u:8,t:"Compare Fraction Wholes",g:"compareWholes"},
 {id:"8-5",u:8,t:"Compare Fractions with the Same Denominator",g:"compare",p:["den"]},
 {id:"8-6",u:8,t:"Compare Fractions with the Same Numerator",g:"compare",p:["num"]},
 {id:"8-7",u:8,t:"Compare Fractions",g:"compare",p:["any"]},
 {id:"9-1",u:9,t:"Use Multiplication to Solve Division Equations",g:"div",p:[2,3,4,5,6,7,8,9,10]},
 {id:"9-2",u:9,t:"Divide by 2",g:"div",p:[2]},
 {id:"9-3",u:9,t:"Divide by 5 and 10",g:"div",p:[5,10]},
 {id:"9-4",u:9,t:"Divide by 1 and 0",g:"div10"},
 {id:"9-5",u:9,t:"Divide by 3 and 6",g:"div",p:[3,6]},
 {id:"9-6",u:9,t:"Divide by 4 and 8",g:"div",p:[4,8]},
 {id:"9-7",u:9,t:"Divide by 9",g:"div",p:[9]},
 {id:"9-8",u:9,t:"Divide by 7",g:"div",p:[7]},
 {id:"9-9",u:9,t:"Multiply and Divide Fluently within 100",g:"fluent"},
 {id:"10-1",u:10,t:"Patterns with Multiples of 10",g:"mult10s"},
 {id:"10-2",u:10,t:"More Multiplication Patterns",g:"patterns"},
 {id:"10-3",u:10,t:"Understand the Associative Property",g:"associative"},
 {id:"10-4",u:10,t:"Two-Step Problems Involving Multiplication and Division",g:"twoStepMult"},
 {id:"10-5",u:10,t:"Solve Two-Step Problems",g:"twoStepMix"},
 {id:"10-6",u:10,t:"Explain the Reasonableness of a Solution",g:"reasonable"},
 {id:"11-1",u:11,t:"Understand Perimeter",g:"perimeter"},
 {id:"11-2",u:11,t:"Determine Perimeter of Figures",g:"perimeter"},
 {id:"11-3",u:11,t:"Determine an Unknown Side Length",g:"unknownSide"},
 {id:"11-4",u:11,t:"Solve Problems Involving Area and Perimeter",g:"areaPerimeter"},
 {id:"11-5",u:11,t:"Solve Problems Involving Measurement",g:"measureWP"},
 {id:"12-1",u:12,t:"Measure Liquid Volume",g:"volume"},
 {id:"12-2",u:12,t:"Estimate and Solve Problems with Liquid Volume",g:"volumeWP"},
 {id:"12-3",u:12,t:"Measure Mass",g:"mass"},
 {id:"12-4",u:12,t:"Estimate and Solve Problems with Mass",g:"massWP"},
 {id:"12-5",u:12,t:"Tell Time to the Nearest Minute",g:"clock"},
 {id:"12-6",u:12,t:"Solve Problems Involving Time",g:"elapsed"},
 {id:"12-7",u:12,t:"Understand Scaled Picture Graphs",g:"pictograph"},
 {id:"12-8",u:12,t:"Understand Scaled Bar Graphs",g:"bargraph"},
 {id:"12-9",u:12,t:"Solve Problems Involving Scaled Graphs",g:"bargraph",p:["wp"]},
 {id:"12-10",u:12,t:"Measure to Halves or Fourths of an Inch",g:"ruler"},
 {id:"12-11",u:12,t:"Show Measurement Data on a Line Plot",g:"lineplot"},
 {id:"13-1",u:13,t:"Describe and Classify Polygons",g:"polygon"},
 {id:"13-2",u:13,t:"Describe Quadrilaterals",g:"quad"},
 {id:"13-3",u:13,t:"Classify Quadrilaterals",g:"quad"},
 {id:"13-4",u:13,t:"Draw Quadrilaterals",g:"quad",p:["draw"]}
];
/* Review cards — the book's "Review" box, in Ananse's words */
const REVEAL_REVIEW={
 "2-1":"Base-ten blocks show place value: a big cube is 1,000, a flat is 100, a rod is 10, a small cube is 1. The same number can be written in standard form (1,246), expanded form (1,000 + 200 + 40 + 6) and word form.",
 "2-2":"To round, find the halfway point. On a number line, 318 is closer to 320 than 310. With place value: look at the digit to the right of the place you are rounding to — 5 or more rounds up, 4 or less rounds down.",
 "2-3":"Estimate by rounding each number first, then adding or subtracting the rounded numbers. 318 + 276 is about 300 + 300 = 600.",
 "2-4":"Commutative property: order does not change a sum (4 + 9 = 9 + 4). Associative property: grouping does not change a sum ((2 + 8) + 5 = 2 + (8 + 5)). Use them to make tens.",
 "2-5":"Look for patterns: adding 10 changes only the tens digit; adding 100 changes only the hundreds digit. Even + even is even, odd + odd is even, even + odd is odd.",
 "2-6":"Partial sums: add the hundreds, then the tens, then the ones, and put the parts together. 346 + 228 → 500 + 60 + 14 = 574.",
 "2-7":"Decompose to subtract: break the number you take away into hundreds, tens and ones, and subtract one part at a time. 532 − 217 → 532 − 200 − 10 − 7 = 315.",
 "2-8":"Adjust numbers to make them friendly: 298 + 145 → 300 + 145 − 2. For subtraction, add the same amount to both numbers: 503 − 297 = 506 − 300.",
 "2-9":"Subtraction and addition are related. To find 600 − 385, count up from 385: 15 to 400, then 200 to 600. 15 + 200 = 215.",
 "2-10":"Add within 1,000 with any strategy that works for you: partial sums, adjusting, or the standard algorithm — and check with an estimate.",
 "2-11":"Subtract within 1,000 with decomposing, adjusting, or counting up — and check that your answer is close to your estimate.",
 "2-12":"Two-step problems need two operations. Find the hidden question first. 'Ama had 250 beads, used 75, then bought 120' → 250 − 75 = 175, then 175 + 120 = 295.",
 "3-1":"Equal groups have the same number in each group. 3 groups of 4 is 4 + 4 + 4 = 12, written 3 × 4 = 12.",
 "3-2":"An array has equal rows and columns. 4 rows of 5 dots shows 4 × 5 = 20.",
 "3-3":"Commutative property of multiplication: 4 × 5 = 5 × 4. Turn an array on its side and the total does not change.",
 "3-4":"Equal sharing: 12 cookies shared by 4 friends — deal them out. 12 ÷ 4 = 3 in each group.",
 "3-5":"Equal grouping: 12 cookies, 3 on each plate — how many plates? 12 ÷ 3 = 4 groups.",
 "3-6":"Arrays connect multiplication and division. 4 × 5 = 20, so 20 ÷ 4 = 5 and 20 ÷ 5 = 4. These are related facts.",
 "3-7":"A missing number is the unknown. 6 × ? = 42 — think 42 ÷ 6. ? ÷ 3 = 5 — think 5 × 3.",
 "4-1":"Multiplying by 2 is doubling: 2 × 7 = 7 + 7 = 14. Products of 2 are always even.",
 "4-2":"Multiplying by 5: skip-count 5, 10, 15, 20… Products of 5 end in 0 or 5.",
 "4-3":"Multiplying by 10: the product is the other factor with a zero at the end. 10 × 7 = 70.",
 "4-4":"Any number times 1 is that number (identity). Any number times 0 is 0 (zero property).",
 "4-5":"Use what you know: doubles for 2s, skip-counting for 5s, add a zero for 10s, and the 0 and 1 rules. Practice until they are automatic.",
 "4-6":"To solve an equal-groups problem, decide: how many groups, and how many in each? Then multiply. Draw a picture if it helps.",
 "5-1":"Distributive property: break one factor apart, multiply each part, then add. 8 × 6 = 8 × 3 + 8 × 3 = 24 + 24 = 48.",
 "5-2":"Multiply by 3 with a known fact plus one more group: 3 × 7 = 2 × 7 + 7 = 14 + 7 = 21.",
 "5-3":"Multiply by 4 by doubling twice: 4 × 6 = double 6 (12), then double again (24).",
 "5-4":"Multiply by 6 using 5s: 6 × 7 = 5 × 7 + 7 = 35 + 7 = 42. Or double a 3s fact.",
 "5-5":"Multiply by 8 by doubling a 4s fact: 8 × 7 = 4 × 7 doubled = 28 + 28 = 56.",
 "5-6":"Multiply by 7 by adding a 5s fact and a 2s fact: 7 × 6 = 30 + 12 = 42. Multiply by 9 with a 10s fact minus one group: 9 × 6 = 60 − 6 = 54.",
 "5-7":"Arrays solve real problems: 6 rows of chairs with 8 in each row is 6 × 8 = 48 chairs.",
 "6-1":"Area is the number of unit squares that cover a flat shape with no gaps or overlaps.",
 "6-2":"Count the unit squares inside the shape. Counting row by row keeps you from missing any.",
 "6-3":"Area of a rectangle = number of rows × number of columns = length × width. 4 rows of 6 squares = 24 square units.",
 "6-4":"A composite figure is made of rectangles. Split it, find each area, and add.",
 "6-5":"Split a rectangle into two smaller rectangles: 6 × 9 = 6 × 5 + 6 × 4 = 30 + 24 = 54. That is the distributive property with area.",
 "6-6":"Area word problems: decide what the length and width are, multiply, and label the answer in square units.",
 "7-1":"Partition means split into EQUAL parts. 4 equal parts are fourths; 3 equal parts are thirds. Equal parts must be the same size.",
 "7-2":"A fraction names part of a whole. The denominator (bottom) tells how many equal parts; the numerator (top) tells how many are counted. 3 of 4 parts shaded is 3/4.",
 "7-3":"On a number line from 0 to 1, cut the space into equal parts. With 4 parts, each tick is 1/4: 1/4, 2/4, 3/4, 4/4.",
 "7-4":"One whole can be written as a fraction where the top and bottom are the same: 4/4 = 1, 3/3 = 1.",
 "7-5":"Any whole number is a fraction with denominator 1: 3 = 3/1. And 6/2 = 3 because 6 halves make 3 wholes.",
 "7-6":"Fractions can be greater than 1. Keep counting past 1: 4/4, 5/4, 6/4. 5/4 is 1 and 1/4.",
 "8-1":"Equivalent fractions name the same amount with different parts: 1/2 = 2/4 = 4/8.",
 "8-2":"Show equivalence with models: shade 1/2 of a bar and 2/4 of a same-size bar — the shaded amounts match.",
 "8-3":"On a number line, equivalent fractions land on the same point: 1/2 and 2/4 are the same tick.",
 "8-4":"A fraction only compares when the wholes are the same size. 1/2 of a small pizza is less than 1/2 of a large pizza.",
 "8-5":"Same denominator: the pieces are the same size, so the bigger numerator is bigger. 3/6 > 2/6.",
 "8-6":"Same numerator: the same number of pieces, so the SMALLER denominator (bigger pieces) is bigger. 2/3 > 2/5.",
 "8-7":"Compare fractions with models, number lines, or by reasoning about the size and number of pieces. Use >, < or =.",
 "9-1":"Division is a missing-factor problem. 24 ÷ 6 = ? means 6 × ? = 24. Since 6 × 4 = 24, the answer is 4.",
 "9-2":"Divide by 2 means split in half. 16 ÷ 2 = 8 because 2 × 8 = 16.",
 "9-3":"Divide by 5: count by 5s to the dividend. Divide by 10: drop the zero. 70 ÷ 10 = 7.",
 "9-4":"Any number divided by 1 is itself. 0 divided by any number is 0. You cannot divide by 0.",
 "9-5":"Divide by 3 and 6 using multiplication facts: 18 ÷ 6 = 3 because 6 × 3 = 18. Dividing by 6 is dividing by 3, then by 2.",
 "9-6":"Divide by 4 by halving twice: 32 ÷ 4 → 16 → 8. Divide by 8 by halving three times.",
 "9-7":"Divide by 9 with the 9s facts: 63 ÷ 9 = 7 because 9 × 7 = 63.",
 "9-8":"Divide by 7 with the 7s facts: 56 ÷ 7 = 8 because 7 × 8 = 56.",
 "9-9":"Fluent means fast AND accurate. Use the strategies you know and check with the related fact.",
 "10-1":"Multiples of 10: 3 × 40 = 3 × 4 tens = 12 tens = 120. Multiply the basic fact, then add the zero.",
 "10-2":"Patterns: an even factor gives an even product. Products of 9 have digits that add to 9. Products of 5 end in 0 or 5.",
 "10-3":"Associative property: grouping does not change the product. (2 × 3) × 5 = 2 × (3 × 5) = 30. Group to make easy numbers.",
 "10-4":"Two-step problems with multiplication and division: find the hidden question first. '4 packs of 6, shared by 3' → 4 × 6 = 24, then 24 ÷ 3 = 8.",
 "10-5":"Two-step problems can mix any operations. Write an equation for each step and label what each number means.",
 "10-6":"Check reasonableness by estimating or by using the inverse operation. If 7 × 8 gives 15, that cannot be right — 7 × 8 is close to 7 × 10 = 70.",
 "11-1":"Perimeter is the distance around a shape. Add the lengths of ALL the sides.",
 "11-2":"Find the perimeter of any figure by adding every side. A rectangle has two pairs of equal sides: 2 × length + 2 × width.",
 "11-3":"If you know the perimeter and all sides but one, subtract the known sides from the perimeter to find the missing side.",
 "11-4":"Area counts the squares inside; perimeter measures around. Two rectangles can share a perimeter but have different areas.",
 "11-5":"Measurement problems use length, area or perimeter in real situations — fences (perimeter), carpet (area), string (length).",
 "12-1":"Liquid volume is measured in milliliters (mL) for small amounts (a spoon is about 5 mL) and liters (L) for big ones (a large bottle is 2 L).",
 "12-2":"Estimate first, then add, subtract, multiply or divide the volumes. Keep the same unit.",
 "12-3":"Mass is measured in grams (g) for light objects (a paper clip is about 1 g) and kilograms (kg) for heavy ones (a bag of rice is 1 kg).",
 "12-4":"Estimate a mass, then solve. 4 apples at 150 g each is 4 × 150 = 600 g.",
 "12-5":"Read the hour hand first, then count the minutes by 5s around the clock and add the extra minutes.",
 "12-6":"Elapsed time: count on from the start time to the end time in hours and minutes, or use a number line.",
 "12-7":"A scaled picture graph uses a key: each picture stands for more than 1. If each ⚽ = 2, then 4 balls means 8.",
 "12-8":"A scaled bar graph has a scale that counts by 2s, 5s or 10s. Read the bar against the scale.",
 "12-9":"Use the graph to answer 'how many more' and 'how many in all' questions — read carefully, then add or subtract.",
 "12-10":"A ruler can be marked in halves and fourths of an inch. Line up the object at 0 and read the closest mark.",
 "12-11":"A line plot shows measurement data with an X above each value on a number line. Count the Xs.",
 "13-1":"A polygon is a closed shape with straight sides. Triangles have 3 sides, quadrilaterals 4, pentagons 5, hexagons 6, octagons 8.",
 "13-2":"Quadrilaterals have 4 sides. Look at sides (equal? parallel?) and angles (right angles?).",
 "13-3":"Squares, rectangles, rhombuses and trapezoids are all quadrilaterals. A square is also a rectangle AND a rhombus.",
 "13-4":"To draw a quadrilateral with certain properties, decide on the sides and angles first — 4 right angles with equal sides makes a square."
};
/* ---------- visual helpers (book-style representations) ---------- */
function rvDots(rows,cols,ch){return '<div class="rv-array">'+Array(rows).fill(0).map(()=>'<div>'+Array(cols).fill(ch||"●").join("")+'</div>').join("")+'</div>';}
function rvGroups(groups,each,ch){return '<div class="rv-groups">'+Array(groups).fill(0).map(()=>'<span class="rv-group">'+Array(each).fill(ch||"🍪").join("")+'</span>').join("")+'</div>';}
function rvBlocks(n){const th=Math.floor(n/1000),h=Math.floor(n/100)%10,t=Math.floor(n/10)%10,o=n%10;
  return '<div class="rv-blocks">'+Array(th).fill('<span class="rv-th">1,000</span>').join("")+Array(h).fill('<span class="rv-h">100</span>').join("")+Array(t).fill('<span class="rv-t">10</span>').join("")+Array(o).fill('<span class="rv-o"></span>').join("")+'</div>';}
function rvNumberLine(a,b,step,mark,labels){const w=560,ticks=[];for(let v=a;v<=b;v+=step){const x=20+(v-a)/(b-a)*(w-40);ticks.push('<line x1="'+x+'" y1="30" x2="'+x+'" y2="50" stroke="#1f3c70" stroke-width="2"/>'+((labels?labels(v):v)!==null?'<text x="'+x+'" y="70" text-anchor="middle" font-size="14" fill="#1f3c70">'+(labels?labels(v):v)+'</text>':''));}
  const mx=mark==null?null:20+(mark-a)/(b-a)*(w-40);
  return '<svg class="rv-svg" viewBox="0 0 '+w+' 80"><line x1="10" y1="40" x2="'+(w-10)+'" y2="40" stroke="#1f3c70" stroke-width="3"/>'+ticks.join("")+(mx!=null?'<circle cx="'+mx+'" cy="40" r="7" fill="#f5a623" stroke="#1f3c70" stroke-width="2"/>':'')+'</svg>';}
function rvBar(parts,shaded,color){return '<div class="rv-bar">'+Array(parts).fill(0).map((_,i)=>'<span style="background:'+(i<shaded?(color||"#f5a623"):"#fff")+'"></span>').join("")+'</div>';}
function rvGrid(rows,cols,opts){opts=opts||{};const cell=26,w=cols*cell,h=rows*cell;let r='';for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){if(opts.skip&&opts.skip(x,y))continue;r+='<rect x="'+(x*cell)+'" y="'+(y*cell)+'" width="'+cell+'" height="'+cell+'" fill="'+(opts.fill?opts.fill(x,y):"#ffe6a8")+'" stroke="#1f3c70"/>';}
  return '<svg class="rv-svg" viewBox="-2 -2 '+(w+4)+' '+(h+4)+'" style="max-width:'+(w+4)*1.4+'px">'+r+'</svg>';}
function rvRect(wLabel,hLabel){return '<svg class="rv-svg" viewBox="0 0 300 160" style="max-width:320px"><rect x="40" y="20" width="220" height="110" fill="#ffe6a8" stroke="#1f3c70" stroke-width="3"/><text x="150" y="150" text-anchor="middle" font-size="18" fill="#1f3c70">'+wLabel+'</text><text x="20" y="80" text-anchor="middle" font-size="18" fill="#1f3c70">'+hLabel+'</text></svg>';}
function rvClock(h,m){const cx=80,cy=80,r=70;let t='';for(let i=1;i<=12;i++){const a=i/6*Math.PI;t+='<text x="'+(cx+Math.sin(a)*56)+'" y="'+(cy-Math.cos(a)*56+5)+'" text-anchor="middle" font-size="14" fill="#1f3c70">'+i+'</text>';}
  for(let i=0;i<60;i++){const a=i/30*Math.PI,len=i%5?3:7;t+='<line x1="'+(cx+Math.sin(a)*(r-len))+'" y1="'+(cy-Math.cos(a)*(r-len))+'" x2="'+(cx+Math.sin(a)*r)+'" y2="'+(cy-Math.cos(a)*r)+'" stroke="#1f3c70" stroke-width="'+(i%5?1:2)+'"/>';}
  const ha=((h%12)+m/60)/6*Math.PI,ma=m/30*Math.PI;
  return '<svg class="rv-svg" viewBox="0 0 160 160" style="max-width:200px"><circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="#fff" stroke="#1f3c70" stroke-width="3"/>'+t+'<line x1="'+cx+'" y1="'+cy+'" x2="'+(cx+Math.sin(ha)*36)+'" y2="'+(cy-Math.cos(ha)*36)+'" stroke="#1f3c70" stroke-width="5" stroke-linecap="round"/><line x1="'+cx+'" y1="'+cy+'" x2="'+(cx+Math.sin(ma)*54)+'" y2="'+(cy-Math.cos(ma)*54)+'" stroke="#e0512f" stroke-width="3" stroke-linecap="round"/><circle cx="'+cx+'" cy="'+cy+'" r="4" fill="#1f3c70"/></svg>';}
function rvRuler(inches,objLen){const u=90,w=inches*u+40;let t='';for(let i=0;i<=inches*4;i++){const x=20+i*u/4,len=i%4===0?26:(i%2===0?18:11);t+='<line x1="'+x+'" y1="40" x2="'+x+'" y2="'+(40+len)+'" stroke="#1f3c70" stroke-width="'+(i%4===0?2:1)+'"/>'+(i%4===0?'<text x="'+x+'" y="82" text-anchor="middle" font-size="14" fill="#1f3c70">'+(i/4)+'</text>':'');}
  return '<svg class="rv-svg" viewBox="0 0 '+w+' 90" style="max-width:'+w*1.3+'px"><rect x="20" y="8" width="'+(objLen*u)+'" height="22" rx="6" fill="#f5a623" stroke="#1f3c70" stroke-width="2"/><rect x="10" y="38" width="'+(w-20)+'" height="46" fill="#fff" stroke="#1f3c70" stroke-width="2"/>'+t+'</svg>';}
function rvPolygon(n,size){const cx=70,cy=70,r=55;const pts=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2-Math.PI/2;pts.push((cx+Math.cos(a)*r).toFixed(1)+","+(cy+Math.sin(a)*r).toFixed(1));}
  return '<svg class="rv-svg" viewBox="0 0 140 140" style="max-width:'+(size||140)+'px"><polygon points="'+pts.join(" ")+'" fill="#ffe6a8" stroke="#1f3c70" stroke-width="3"/></svg>';}
const RV_QUADS={square:{n:"square",svg:'<polygon points="30,30 110,30 110,110 30,110"/>',d:"4 equal sides and 4 right angles"},rectangle:{n:"rectangle",svg:'<polygon points="15,40 125,40 125,100 15,100"/>',d:"4 right angles, opposite sides equal"},rhombus:{n:"rhombus",svg:'<polygon points="70,20 120,70 70,120 20,70"/>',d:"4 equal sides, no right angles needed"},trapezoid:{n:"trapezoid",svg:'<polygon points="40,40 100,40 125,100 15,100"/>',d:"exactly one pair of parallel sides"},parallelogram:{n:"parallelogram",svg:'<polygon points="35,40 125,40 105,100 15,100"/>',d:"two pairs of parallel sides, no right angles needed"}};
function rvQuad(k){return '<svg class="rv-svg" viewBox="0 0 140 140" style="max-width:150px"><g fill="#ffe6a8" stroke="#1f3c70" stroke-width="3">'+RV_QUADS[k].svg+'</g></svg>';}
function rvPicto(rows,key,icon){return '<table class="rv-table"><tr><th colspan="2">Key: each '+icon+' = '+key+'</th></tr>'+rows.map(r=>'<tr><td>'+esc(r[0])+'</td><td>'+Array(r[1]).fill(icon).join(" ")+'</td></tr>').join("")+'</table>';}
function rvBars(rows,scale){const max=Math.max(...rows.map(r=>r[1]));return '<div class="rv-bars">'+rows.map(r=>'<div class="rv-barrow"><span>'+esc(r[0])+'</span><i style="width:'+Math.round(r[1]/max*100)+'%"></i><b>'+r[1]+'</b></div>').join("")+'<div class="muted" style="font-size:13px">scale: each step = '+scale+'</div></div>';}
function rvLinePlot(vals,unit){const keys=[...new Set(vals)].sort((a,b)=>a-b);return '<div class="rv-lineplot">'+keys.map(k=>'<div><div class="rv-xs">'+Array(vals.filter(v=>v===k).length).fill("✕").join("<br>")+'</div><div class="rv-lab">'+k+'</div></div>').join("")+'</div><div class="muted center" style="font-size:13px">'+unit+'</div>';}
/* ---------- number words ---------- */
const RV_ONES=["","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"],RV_TENS=["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
function rvWords(n){if(n===0)return "zero";let s="";const th=Math.floor(n/1000),h=Math.floor(n/100)%10,r=n%100;if(th)s+=RV_ONES[th]+" thousand";if(h)s+=(s?", ":"")+RV_ONES[h]+" hundred";if(r){s+=(s?(h?" ":", "):"");s+=r<20?RV_ONES[r]:RV_TENS[Math.floor(r/10)]+(r%10?"-"+RV_ONES[r%10]:"");}return s;}
function rvExpanded(n){const p=[];[1000,100,10,1].forEach(v=>{const d=Math.floor(n/v)%10;if(d)p.push(d*v);});return p.map(x=>x.toLocaleString()).join(" + ");}
function rvFmt(n){return n.toLocaleString("en-US");}
function rvOpts(ans,spread){return numOpts(ans,spread);}
function rvStrOpts(correct,wrongs){const u=[...new Set(wrongs.map(String).filter(w=>w!==String(correct)))].slice(0,3);const o=shuffle([String(correct)].concat(u));return {opts:o,a:o.indexOf(String(correct))};}
/* ---------- generators ---------- */
const RV_NAMES=["Ama","Kofi","Prince","Esi","Kwame","Abena","Yaw","Adwoa","Maya","Omar"];
const RV_GEN={
 blocks(){const n=1000+rnd(9000);const kind=rnd(3);
  if(kind===0)return{q:"What number do the base-ten blocks show?",vis:rvBlocks(n),...rvOpts(n,110),teach:[{i:"🧱",t:"Count the thousands cubes, then hundreds flats, tens rods and ones."},{i:"🔢",t:"Thousands "+Math.floor(n/1000)+", hundreds "+(Math.floor(n/100)%10)+", tens "+(Math.floor(n/10)%10)+", ones "+(n%10)+"."},{i:"🎯",t:"That is "+rvFmt(n)+"."}]};
  if(kind===1){const w=rnd(3);const forms=[rvExpanded(n),rvWords(n),rvFmt(n)];const names=["expanded form","word form","standard form"];const wrongN=[n+100,n-10,n+1000].filter(x=>x>999&&x<10000);const wrongs=wrongN.map(x=>[rvExpanded(x),rvWords(x),rvFmt(x)][w]);const o=rvStrOpts(forms[w],wrongs);
   return{q:"Write "+(w===2?rvWords(n):rvFmt(n))+" in "+names[w]+".",...o,teach:[{i:"🔢",t:"Standard form: "+rvFmt(n)+"."},{i:"➕",t:"Expanded form: "+rvExpanded(n)+"."},{i:"🔤",t:"Word form: "+rvWords(n)+"."}]};}
  const digits=shuffle([1+rnd(9),1+rnd(9),1+rnd(9),1+rnd(9)]);const sorted=digits.slice().sort((a,b)=>b-a);const best=+sorted.join("");const wrongs=[+sorted.slice().reverse().join(""),+digits.join(""),+shuffle(digits.slice()).join(""),best-9,best-90].map(rvFmt);
  return{q:"Use the digits "+digits.join(" ")+" once each to make the GREATEST possible number.",...rvStrOpts(rvFmt(best),wrongs),teach:[{i:"🏆",t:"The thousands place is worth the most, so put the biggest digit there."},{i:"⬇️",t:"Then the next biggest in hundreds, then tens, then ones."},{i:"🎯",t:"Greatest: "+rvFmt(best)+"."}]};},
 round(){const to=pick([10,100]);const n=to===10?(11+rnd(980)):(101+rnd(890));const ans=Math.round(n/to)*to;const a=Math.floor(n/to)*to;const useLine=rnd(2)===0;const lo=to===10?a:a,hi=a+to;
  return{q:"Round "+n+" to the nearest "+(to===10?"ten":"hundred")+".",vis:useLine?rvNumberLine(lo,hi,to/10,n):"",...rvOpts(ans,to),teach:[{i:"📏",t:n+" is between "+lo+" and "+hi+". Halfway is "+(lo+to/2)+"."},{i:"🔍",t:"Look at the "+(to===10?"ones":"tens")+" digit: "+(to===10?n%10:Math.floor(n/10)%10)+". 5 or more rounds up."},{i:"🎯",t:n+" rounds to "+ans+"."}]};},
 estimate(){const a=112+rnd(780),b=105+rnd(780),add=rnd(2)===0;const ra=Math.round(a/100)*100,rb=Math.round(b/100)*100;const ans=add?ra+rb:Math.abs(ra-rb);const [x,y]=add?[a,b]:(a>b?[a,b]:[b,a]);
  return{q:"Estimate "+x+(add?" + ":" − ")+y+" by rounding each number to the nearest hundred.",...rvOpts(ans,150),teach:[{i:"🔁",t:x+" rounds to "+Math.round(x/100)*100+"; "+y+" rounds to "+Math.round(y/100)*100+"."},{i:add?"➕":"➖",t:"Now "+(add?"add":"subtract")+" the rounded numbers."},{i:"🎯",t:"About "+ans+"."}]};},
 addProps(){const a=2+rnd(8),b=2+rnd(8),c=2+rnd(8);const k=rnd(2);
  if(k===0){const o=rvStrOpts(b+" + "+a,[a+" − "+b,b+" × "+a,a+" + "+a]);return{q:"Which expression equals "+a+" + "+b+" by the commutative property?",...o,teach:[{i:"🔁",t:"Commutative means you can switch the order."},{i:"✅",t:a+" + "+b+" = "+b+" + "+a+" = "+(a+b)+"."},{i:"🎯",t:"Order changes, sum does not."}]};}
  const o=rvStrOpts(a+" + ("+b+" + "+c+")",["("+a+" + "+b+") − "+c,a+" × ("+b+" + "+c+")",a+" + "+b+" − "+c]);return{q:"Which expression equals ("+a+" + "+b+") + "+c+" by the associative property?",...o,teach:[{i:"🧩",t:"Associative means you can change the grouping."},{i:"✅",t:"("+a+" + "+b+") + "+c+" = "+a+" + ("+b+" + "+c+") = "+(a+b+c)+"."},{i:"🎯",t:"Grouping changes, sum does not."}]};},
 addPatterns(){const n=123+rnd(760);const step=pick([10,100]);const seq=[n,n+step,n+2*step];const ans=n+3*step;
  return{q:"What comes next? "+seq.join(", ")+", …",...rvOpts(ans,step),teach:[{i:"🔍",t:"From "+seq[0]+" to "+seq[1]+" is + "+step+"."},{i:"🔁",t:"Only the "+(step===10?"tens":"hundreds")+" digit changes."},{i:"🎯",t:seq[2]+" + "+step+" = "+ans+"."}]};},
 add3(){const a=134+rnd(500),b=112+rnd(380);const ans=a+b;const H=Math.floor(a/100)*100+Math.floor(b/100)*100,T=(Math.floor(a/10)%10)*10+(Math.floor(b/10)%10)*10,O=a%10+b%10;
  return{q:pick(RV_NAMES)+" collected "+a+" cans and "+b+" bottles for recycling. How many items in all?",...rvOpts(ans,40),teach:[{i:"💯",t:"Hundreds: "+H+"."},{i:"🔟",t:"Tens: "+T+". Ones: "+O+"."},{i:"🎯",t:H+" + "+T+" + "+O+" = "+ans+"."}]};},
 sub3(){const a=420+rnd(560),b=113+rnd(a-300);const ans=a-b;const h=Math.floor(b/100)*100,t=(Math.floor(b/10)%10)*10,o=b%10;
  return{q:"A jar holds "+a+" marbles. "+pick(RV_NAMES)+" takes out "+b+". How many marbles are left?",...rvOpts(ans,40),teach:[{i:"✂️",t:"Break "+b+" into "+h+" + "+t+" + "+o+"."},{i:"➖",t:a+" − "+h+" = "+(a-h)+", − "+t+" = "+(a-h-t)+", − "+o+"."},{i:"🎯",t:"= "+ans+"."}]};},
 adjust(){const k=rnd(2);if(k===0){const a=pick([198,298,398,497,299]),b=120+rnd(300);const ans=a+b;const r=Math.round(a/100)*100;return{q:a+" + "+b+" = ? (Hint: make "+a+" a friendly number.)",...rvOpts(ans,30),teach:[{i:"🎈",t:a+" is "+(r-a)+" less than "+r+"."},{i:"➕",t:r+" + "+b+" = "+(r+b)+", then take away the "+(r-a)+" you added."},{i:"🎯",t:(r+b)+" − "+(r-a)+" = "+ans+"."}]};}
  const b=pick([197,298,299,396,498]),a=b+150+rnd(300);const d=Math.round(b/100)*100-b;const ans=a-b;return{q:a+" − "+b+" = ? (Hint: add the same amount to both numbers.)",...rvOpts(ans,30),teach:[{i:"⚖️",t:"Add "+d+" to both: "+(a+d)+" − "+(b+d)+"."},{i:"➖",t:"Subtracting a round number is easy: "+(a+d)+" − "+(b+d)+"."},{i:"🎯",t:"= "+ans+"."}]};},
 addToSub(){const a=pick([300,400,500,600,700,800]),b=a-100-rnd(200);const ans=a-b;const up1=Math.ceil(b/100)*100-b;return{q:a+" − "+b+" = ? Count up from "+b+".",vis:rvNumberLine(b,a,(a-b)>200?100:50,null,v=>v),...rvOpts(ans,30),teach:[{i:"⬆️",t:"From "+b+" up to "+(b+up1)+" is "+up1+"."},{i:"⬆️",t:"From "+(b+up1)+" up to "+a+" is "+(a-b-up1)+"."},{i:"🎯",t:up1+" + "+(a-b-up1)+" = "+ans+"."}]};},
 twoStepAdd(){const s=200+rnd(500),u=40+rnd(120),g=60+rnd(200);const ans=s-u+g;const n=pick(RV_NAMES);return{q:n+" had "+s+" beads. "+n+" used "+u+" for a bracelet, then bought "+g+" more. How many beads now?",...rvOpts(ans,40),teach:[{i:"1️⃣",t:"Hidden question: how many after using some? "+s+" − "+u+" = "+(s-u)+"."},{i:"2️⃣",t:"Then add the new beads: "+(s-u)+" + "+g+"."},{i:"🎯",t:"= "+ans+" beads."}]};},
 equalGroups(){const g=2+rnd(4),e=2+rnd(5);const ans=g*e;const o=rvStrOpts(g+" × "+e+" = "+ans,[g+" + "+e+" = "+(g+e),e+" × "+e+" = "+(e*e),g+" × "+(e+1)+" = "+(g*(e+1))]);return{q:"Which multiplication equation matches the equal groups?",vis:rvGroups(g,e),...o,teach:[{i:"👥",t:"Count the groups: "+g+". Count in each group: "+e+"."},{i:"➕",t:Array(g).fill(e).join(" + ")+" = "+ans+"."},{i:"🎯",t:g+" groups of "+e+" is "+g+" × "+e+" = "+ans+"."}]};},
 array(){const r=2+rnd(5),c=2+rnd(6);const ans=r*c;return{q:"How many dots are in the array? Write it as rows × columns.",vis:rvDots(r,c),...rvOpts(ans,5),teach:[{i:"↔️",t:"Rows go across: "+r+" rows."},{i:"↕️",t:"Columns go down: "+c+" in each row."},{i:"🎯",t:r+" × "+c+" = "+ans+"."}]};},
 commutative(){const a=2+rnd(8),b=2+rnd(8);const o=rvStrOpts(b+" × "+a+" = "+(a*b),[a+" + "+b+" = "+(a+b),b+" × "+b+" = "+(b*b),a+" × "+(b+1)+" = "+(a*(b+1))]);return{q:a+" × "+b+" = "+(a*b)+". Which equation shows the commutative property?",...o,teach:[{i:"🔁",t:"Commutative: switch the factors."},{i:"↩️",t:"Turn the array on its side: "+b+" rows of "+a+"."},{i:"🎯",t:b+" × "+a+" = "+(a*b)+" too."}]};},
 sharing(){const g=2+rnd(5),e=2+rnd(6);const total=g*e;const n=pick(RV_NAMES);return{q:n+" shares "+total+" stickers equally among "+g+" friends. How many stickers does each friend get?",...rvOpts(e,3),teach:[{i:"🤲",t:"Sharing equally is division: "+total+" ÷ "+g+"."},{i:"👥",t:"Deal them out to "+g+" friends until they are gone."},{i:"🎯",t:"Each gets "+e+"."}]};},
 grouping(){const g=2+rnd(6),e=2+rnd(5);const total=g*e;return{q:"There are "+total+" pencils. Each box holds "+e+". How many boxes are filled?",...rvOpts(g,3),teach:[{i:"📦",t:"You know the size of each group ("+e+"). Find how many groups."},{i:"➗",t:total+" ÷ "+e+" — count by "+e+"s up to "+total+"."},{i:"🎯",t:g+" boxes."}]};},
 relate(){const r=2+rnd(6),c=2+rnd(6);const p=r*c;const o=rvStrOpts(p+" ÷ "+r+" = "+c,[p+" ÷ "+c+" = "+r*2,r+" ÷ "+c+" = "+p,p+" × "+r+" = "+c]);return{q:"The array shows "+r+" × "+c+" = "+p+". Which division equation is related?",vis:rvDots(r,c),...o,teach:[{i:"🔗",t:"Multiplication and division are partners."},{i:"➗",t:p+" split into "+r+" rows gives "+c+" in each."},{i:"🎯",t:p+" ÷ "+r+" = "+c+" (and "+p+" ÷ "+c+" = "+r+")."}]};},
 unknown(){const a=2+rnd(8),b=2+rnd(8);const k=rnd(2);if(k===0)return{q:a+" × ? = "+(a*b)+". What is the unknown?",...rvOpts(b,3),teach:[{i:"❓",t:"Think: "+a+" times what makes "+(a*b)+"?"},{i:"➗",t:"Or divide: "+(a*b)+" ÷ "+a+"."},{i:"🎯",t:"? = "+b+"."}]};
  return{q:"? ÷ "+a+" = "+b+". What is the unknown?",...rvOpts(a*b,6),teach:[{i:"❓",t:"Something split into "+a+" groups gives "+b+" each."},{i:"✖️",t:"Multiply back: "+a+" × "+b+"."},{i:"🎯",t:"? = "+(a*b)+"."}]};},
 mult(L){const f=pick(L.p||[2,5,10]);const b=(f===0||f===1)?rnd(10):1+rnd(9);const ans=f*b;const flip=rnd(2)===0;const [x,y]=flip?[b,f]:[f,b];
  const tips={0:"Anything times 0 is 0.",1:"Anything times 1 is itself.",2:"Double it: "+b+" + "+b+".",3:"Use a 2s fact plus one more group: 2 × "+b+" + "+b+".",4:"Double, then double again: "+b+" → "+(2*b)+" → "+(4*b)+".",5:"Skip-count by 5: "+Array(b).fill(0).map((_,i)=>(i+1)*5).join(", ")+".",6:"5s fact plus one group: 5 × "+b+" + "+b+" = "+(5*b)+" + "+b+".",7:"5s plus 2s: 5 × "+b+" + 2 × "+b+" = "+(5*b)+" + "+(2*b)+".",8:"Double a 4s fact: 4 × "+b+" = "+(4*b)+", doubled.",9:"10s fact minus one group: 10 × "+b+" − "+b+" = "+(10*b)+" − "+b+".",10:"Add a zero to "+b+"."};
  return{q:x+" × "+y+" = ?",...rvOpts(ans,f>5?8:4),teach:[{i:"💡",t:tips[f]},{i:"🔁",t:"Order does not matter: "+f+" × "+b+" = "+b+" × "+f+"."},{i:"🎯",t:x+" × "+y+" = "+ans+"."}]};},
 groupsWP(L){const f=pick(L.p||[2,5,10]),b=2+rnd(8);const ans=f*b;const items=pick([["packs of gum","sticks"],["boxes","crayons"],["bags","oranges"],["teams","players"]]);return{q:"There are "+b+" "+items[0]+" with "+f+" "+items[1]+" in each. How many "+items[1]+" in all?",...rvOpts(ans,6),teach:[{i:"👥",t:b+" groups, "+f+" in each."},{i:"✖️",t:b+" × "+f+"."},{i:"🎯",t:"= "+ans+" "+items[1]+"."}]};},
 distributive(){const a=pick([6,7,8,9]),b=pick([6,7,8,9]);const s1=pick([2,3,4,5]),s2=b-s1;const ans=a*b;const o=rvStrOpts(a+" × "+s1+" + "+a+" × "+s2,[a+" × "+s1+" × "+s2,a+" + "+s1+" + "+s2,a+" × "+s1+" + "+s2]);
  return{q:"Break apart "+b+" as "+s1+" + "+s2+". Which expression equals "+a+" × "+b+"?",vis:rvDots(a,s1)+rvDots(a,s2),...o,teach:[{i:"✂️",t:b+" = "+s1+" + "+s2+", so the array splits into two arrays."},{i:"✖️",t:a+" × "+s1+" = "+(a*s1)+" and "+a+" × "+s2+" = "+(a*s2)+"."},{i:"🎯",t:(a*s1)+" + "+(a*s2)+" = "+ans+"."}]};},
 arrayWP(){const r=3+rnd(6),c=3+rnd(7);const ans=r*c;const s=pick([["rows of chairs","chairs"],["rows in the garden","plants"],["shelves","books"],["rows of tiles","tiles"]]);return{q:"There are "+r+" "+s[0]+" with "+c+" "+s[1]+" in each row. How many "+s[1]+"?",vis:rvDots(r,c,"▪"),...rvOpts(ans,6),teach:[{i:"↔️",t:r+" rows."},{i:"✖️",t:r+" × "+c+"."},{i:"🎯",t:"= "+ans+" "+s[1]+"."}]};},
 areaCount(){const r=2+rnd(4),c=3+rnd(5);const skipCorner=rnd(2)===0;const skip=skipCorner?(x,y)=>(x>=c-2&&y>=r-1):null;const ans=r*c-(skipCorner?2:0);return{q:"What is the area of the shape in square units?",vis:rvGrid(r,c,{skip}),...rvOpts(ans,4),teach:[{i:"⬛",t:"Area = how many unit squares cover it."},{i:"🔢",t:"Count row by row"+(skipCorner?" — the last row is missing 2 squares.":".")},{i:"🎯",t:ans+" square units."}]};},
 areaMult(){const r=3+rnd(6),c=3+rnd(7);return{q:"A rectangle is "+r+" units by "+c+" units. What is its area?",vis:rvGrid(r,c),...rvOpts(r*c,8),teach:[{i:"↔️",t:r+" rows of "+c+" squares."},{i:"✖️",t:"Area = length × width = "+r+" × "+c+"."},{i:"🎯",t:(r*c)+" square units."}]};},
 areaComposite(){const r1=2+rnd(3),c1=3+rnd(4),r2=2+rnd(3),c2=2+rnd(3);const ans=r1*c1+r2*c2;const skip=(x,y)=>(x>=c1&&y>=r2);return{q:"Find the area of the composite figure (split it into two rectangles).",vis:rvGrid(Math.max(r1,r2),c1+c2,{skip:(x,y)=>(x>=c1&&y>=r2)||(x<c1&&y>=r1)}),...rvOpts(ans,6),teach:[{i:"✂️",t:"Rectangle A: "+r1+" × "+c1+" = "+(r1*c1)+"."},{i:"✂️",t:"Rectangle B: "+r2+" × "+c2+" = "+(r2*c2)+"."},{i:"🎯",t:(r1*c1)+" + "+(r2*c2)+" = "+ans+" square units."}]};},
 areaDistrib(){const r=3+rnd(5),c=6+rnd(4);const s1=pick([2,3,4,5]),s2=c-s1;const ans=r*c;const o=rvStrOpts(r+" × "+s1+" + "+r+" × "+s2,[r+" + "+s1+" + "+s2,r+" × "+s1+" × "+s2,s1+" × "+s2+" + "+r]);return{q:"A "+r+" by "+c+" rectangle is split into "+r+" by "+s1+" and "+r+" by "+s2+". Which expression gives its area?",vis:rvGrid(r,c,{fill:(x,y)=>x<s1?"#ffe6a8":"#bfe3ff"}),...o,teach:[{i:"✂️",t:"Two smaller rectangles: "+r+" × "+s1+" and "+r+" × "+s2+"."},{i:"➕",t:(r*s1)+" + "+(r*s2)+"."},{i:"🎯",t:"= "+ans+" square units, same as "+r+" × "+c+"."}]};},
 areaWP(){const r=3+rnd(7),c=4+rnd(7);const ans=r*c;const s=pick(["rug","garden","poster","patio"]);return{q:"A "+s+" is "+r+" feet wide and "+c+" feet long. What is its area?",vis:rvRect(c+" ft",r+" ft"),...rvOpts(ans,10),teach:[{i:"📐",t:"Area = length × width."},{i:"✖️",t:r+" × "+c+"."},{i:"🎯",t:ans+" square feet."}]};},
 partition(){const n=pick([2,3,4,6,8]);const names={2:"halves",3:"thirds",4:"fourths",6:"sixths",8:"eighths"};const o=rvStrOpts(n+" equal parts — "+names[n],[(n+1)+" equal parts",n+" parts of different sizes","1 part"]);return{q:"A sandwich is cut into "+names[n]+". How is it partitioned?",vis:rvBar(n,0),...o,teach:[{i:"✂️",t:names[n].charAt(0).toUpperCase()+names[n].slice(1)+" means "+n+" EQUAL parts."},{i:"⚖️",t:"Parts of different sizes are not "+names[n]+"."},{i:"🎯",t:n+" equal parts."}]};},
 fracShade(){const d=pick([2,3,4,6,8]),n=1+rnd(d-1);const o=rvStrOpts(n+"/"+d,[d+"/"+n,(d-n)+"/"+d,n+"/"+(d+1)]);return{q:"What fraction of the bar is shaded?",vis:rvBar(d,n),...o,teach:[{i:"🔢",t:"Count all the equal parts: "+d+". That is the denominator."},{i:"🟧",t:"Count the shaded parts: "+n+". That is the numerator."},{i:"🎯",t:n+"/"+d+" is shaded."}]};},
 fracLine(L){const gt=(L.p||[])[0]==="gt1";const d=pick([2,3,4,6,8]);const n=gt?d+1+rnd(d-1):1+rnd(d-1);const span=gt?2:1;const o=rvStrOpts(n+"/"+d,[(n+1)+"/"+d,n+"/"+(d+2),d+"/"+n]);return{q:"What fraction does the point show on the number line?",vis:rvNumberLine(0,span*d,1,n,v=>v%d===0?String(v/d):""),...o,teach:[{i:"📏",t:"Each whole is cut into "+d+" equal parts, so each tick is 1/"+d+"."},{i:"🔢",t:"Count the ticks from 0: "+n+"."},{i:"🎯",t:"The point is at "+n+"/"+d+(gt?" — that is more than 1 whole.":".")}]};},
 fracWhole(){const d=pick([3,4,5,6,8]);const o=rvStrOpts(d+"/"+d,["1/"+d,d+"/1",(d-1)+"/"+d]);return{q:"Which fraction equals ONE WHOLE?",vis:rvBar(d,d),...o,teach:[{i:"🟧",t:"All "+d+" of the "+d+" parts are shaded."},{i:"🔢",t:"Numerator = denominator means one whole."},{i:"🎯",t:d+"/"+d+" = 1."}]};},
 fracWholeNum(){const w=2+rnd(4);const k=rnd(2);if(k===0){const o=rvStrOpts(w+"/1",["1/"+w,w+"/"+w,(w+1)+"/1"]);return{q:"Write the whole number "+w+" as a fraction.",...o,teach:[{i:"1️⃣",t:"A whole number over 1 is the same number."},{i:"🍕",t:w+" wholes, each cut into 1 part."},{i:"🎯",t:w+" = "+w+"/1."}]};}
  const d=pick([2,3,4]);return{q:"How many wholes is "+(w*d)+"/"+d+"?",vis:rvBar(d,d)+rvBar(d,d)+(w>2?rvBar(d,d):"")+(w>3?rvBar(d,d):"")+(w>4?rvBar(d,d):""),...rvOpts(w,2),teach:[{i:"🔢",t:"Each whole has "+d+" parts."},{i:"➗",t:(w*d)+" parts ÷ "+d+" per whole."},{i:"🎯",t:"= "+w+" wholes."}]};},
 equiv(){const pairs=[[1,2,2,4],[1,2,3,6],[1,2,4,8],[1,3,2,6],[2,3,4,6],[1,4,2,8],[3,4,6,8],[2,4,4,8]];const p=pick(pairs);const flip=rnd(2)===0;const [a,b,c,d]=flip?[p[2],p[3],p[0],p[1]]:p;const o=rvStrOpts(c+"/"+d,[(c+1)+"/"+d,c+"/"+(d+1),b+"/"+a]);return{q:"Which fraction is equivalent to "+a+"/"+b+"?",vis:rvBar(b,a)+rvBar(d,c,"#6fd0ff"),...o,teach:[{i:"🟧",t:"The top bar shows "+a+"/"+b+"."},{i:"🟦",t:"The blue bar shows "+c+"/"+d+" — the same amount is shaded."},{i:"🎯",t:a+"/"+b+" = "+c+"/"+d+"."}]};},
 equivLine(){const p=pick([[1,2,2,4],[1,2,4,8],[1,3,2,6],[2,4,4,8],[3,4,6,8],[1,4,2,8]]);const [a,b,c,d]=p;const o=rvStrOpts(c+"/"+d,[(c+1)+"/"+d,a+"/"+d,c+"/"+b]);return{q:"The point is at "+a+"/"+b+". Which fraction in "+({2:"halves",4:"fourths",6:"sixths",8:"eighths"}[d])+" lands on the SAME point?",vis:rvNumberLine(0,d,1,c,v=>v%d===0?String(v/d):(v===c?c+"/"+d:"")),...o,teach:[{i:"📏",t:"Cut the same line into "+d+" parts."},{i:"📍",t:a+"/"+b+" and "+c+"/"+d+" are the same distance from 0."},{i:"🎯",t:"Equivalent fractions share a point."}]};},
 compareWholes(){const f=pick(["1/2","1/4","3/4","2/3"]);const o=rvStrOpts("The large pizza — same fraction of a bigger whole",["The small pizza","They are equal — same fraction","You cannot tell"]);return{q:pick(RV_NAMES)+" eats "+f+" of a SMALL pizza. "+pick(RV_NAMES)+" eats "+f+" of a LARGE pizza. Who eats more pizza?",...o,teach:[{i:"🍕",t:"The fractions match, but the wholes are different sizes."},{i:"⚖️",t:f+" of a large pizza is more food than "+f+" of a small one."},{i:"🎯",t:"Fractions compare only when the wholes are the same."}]};},
 compare(L){const mode=(L.p||["any"])[0];let a,b,c,d;if(mode==="den"){d=b=pick([4,6,8]);a=1+rnd(b-1);do{c=1+rnd(b-1)}while(c===a);}else if(mode==="num"){a=c=pick([1,2,3]);b=pick([3,4,6,8]);do{d=pick([3,4,6,8])}while(d===b);}else{const P=[[1,2,1,3],[3,4,1,2],[2,3,2,6],[1,4,1,8],[5,6,5,8],[2,4,1,2],[3,8,3,4]];const p=pick(P);[a,b,c,d]=rnd(2)?p:[p[2],p[3],p[0],p[1]];}
  const va=a/b,vb=c/d;const sym=va>vb?">":(va<vb?"<":"=");const o=rvStrOpts(a+"/"+b+" "+sym+" "+c+"/"+d,[">","<","="].filter(x=>x!==sym).map(x=>a+"/"+b+" "+x+" "+c+"/"+d));
  const why=mode==="den"?"Same denominator — same size pieces — so compare the numerators.":(mode==="num"?"Same numerator — same number of pieces — so the smaller denominator has bigger pieces.":"Picture both fractions of the same bar.");
  return{q:"Compare "+a+"/"+b+" and "+c+"/"+d+".",vis:rvBar(b,a)+rvBar(d,c,"#6fd0ff"),...o,teach:[{i:"⚖️",t:why},{i:"👀",t:"Look at the shaded bars: which shows more?"},{i:"🎯",t:a+"/"+b+" "+sym+" "+c+"/"+d+"."}]};},
 div(L){const f=pick(L.p||[2,5,10]);const q=1+rnd(9);const dividend=f*q;return{q:dividend+" ÷ "+f+" = ?",...rvOpts(q,3),teach:[{i:"❓",t:"Think: "+f+" × ? = "+dividend+"."},{i:"✖️",t:f+" × "+q+" = "+dividend+"."},{i:"🎯",t:"So "+dividend+" ÷ "+f+" = "+q+"."}]};},
 div10(){const n=1+rnd(9);const k=rnd(3);if(k===0)return{q:n+" ÷ 1 = ?",...rvOpts(n,3),teach:[{i:"1️⃣",t:"Dividing by 1 makes 1 group of everything."},{i:"✅",t:"1 × "+n+" = "+n+"."},{i:"🎯",t:n+" ÷ 1 = "+n+"."}]};
  if(k===1)return{q:"0 ÷ "+n+" = ?",...rvOpts(0,3),teach:[{i:"0️⃣",t:"Zero things shared by "+n+" is zero each."},{i:"✅",t:n+" × 0 = 0."},{i:"🎯",t:"0 ÷ "+n+" = 0."}]};
  const m=2+rnd(8);const o=rvStrOpts("It cannot be done — you cannot divide by 0",["0","1",String(m)]);return{q:"What is "+m+" ÷ 0?",...o,teach:[{i:"🚫",t:"Splitting into 0 groups makes no sense."},{i:"❓",t:"0 × ? = "+n+" has no answer."},{i:"🎯",t:"Division by 0 is not allowed."}]};},
 fluent(){const a=2+rnd(8),b=2+rnd(8);const k=rnd(2);if(k===0)return{q:a+" × "+b+" = ?",...rvOpts(a*b,6),teach:[{i:"💡",t:"Use the strategy you like best for "+a+"s."},{i:"🔁",t:"Check with the flipped fact "+b+" × "+a+"."},{i:"🎯",t:a+" × "+b+" = "+(a*b)+"."}]};return{q:(a*b)+" ÷ "+a+" = ?",...rvOpts(b,3),teach:[{i:"❓",t:a+" × ? = "+(a*b)+"."},{i:"✅",t:a+" × "+b+" = "+(a*b)+"."},{i:"🎯",t:(a*b)+" ÷ "+a+" = "+b+"."}]};},
 mult10s(){const a=2+rnd(8),t=2+rnd(8);const ans=a*t*10;return{q:a+" × "+(t*10)+" = ?",...rvOpts(ans,40),teach:[{i:"🔟",t:(t*10)+" is "+t+" tens."},{i:"✖️",t:a+" × "+t+" tens = "+(a*t)+" tens."},{i:"🎯",t:(a*t)+" tens = "+ans+"."}]};},
 patterns(){const k=rnd(3);if(k===0){const b=2+rnd(8);const o=rvStrOpts("Even — any number times 2 is even",["Odd","Sometimes even","It depends on the day"]);return{q:"Is 2 × "+b+" even or odd? Why?",...o,teach:[{i:"👯",t:"Times 2 means pairs — everything has a partner."},{i:"✅",t:"2 × "+b+" = "+(2*b)+", which is even."},{i:"🎯",t:"Products of 2 are always even."}]};}
  if(k===1){const b=2+rnd(8);const p=9*b;const o=rvStrOpts(String(Math.floor(p/10)+p%10),["10","18","1"]);return{q:"9 × "+b+" = "+p+". What do the digits of "+p+" add up to?",...rvStrOpts("9",["10","8","1"]),teach:[{i:"🔍",t:Math.floor(p/10)+" + "+(p%10)+" = 9."},{i:"🪄",t:"Every 9s fact up to 9 × 10 has digits that add to 9."},{i:"🎯",t:"That is a pattern you can use to check."}]};}
  const b=1+rnd(9);const o=rvStrOpts("0 or 5",["1 or 2","3 or 7","9"]);return{q:"5 × "+b+" = "+(5*b)+". Products of 5 always end in...",...o,teach:[{i:"🔁",t:"5, 10, 15, 20, 25… look at the last digit."},{i:"✅",t:"Even × 5 ends in 0; odd × 5 ends in 5."},{i:"🎯",t:"0 or 5."}]};},
 associative(){const a=2+rnd(3),b=2+rnd(4),c=pick([2,5,10]);const ans=a*b*c;const o=rvStrOpts(a+" × ("+b+" × "+c+")",["("+a+" + "+b+") × "+c,a+" × "+b+" + "+c,"("+a+" × "+c+") + "+b]);return{q:"Which expression equals ("+a+" × "+b+") × "+c+" by the associative property?",...o,teach:[{i:"🧩",t:"Change the grouping, keep the order."},{i:"✅",t:"("+a+" × "+b+") × "+c+" = "+(a*b)+" × "+c+" = "+ans+"; "+a+" × ("+b+" × "+c+") = "+a+" × "+(b*c)+" = "+ans+"."},{i:"🎯",t:"Same product either way."}]};},
 twoStepMult(){const p=2+rnd(4),e=3+rnd(5),g=pick([2,3,4].filter(x=>(p*e)%x===0))||2;const ans=(p*e)/g;return{q:pick(RV_NAMES)+" buys "+p+" packs of "+e+" markers and shares them equally with "+g+" friends (including herself). How many markers does each person get?",...rvOpts(ans,3),teach:[{i:"1️⃣",t:"Hidden question: how many markers in all? "+p+" × "+e+" = "+(p*e)+"."},{i:"2️⃣",t:"Share: "+(p*e)+" ÷ "+g+"."},{i:"🎯",t:"= "+ans+" each."}]};},
 twoStepMix(){const k=rnd(2);if(k===0){const p=2+rnd(4),e=4+rnd(5),u=2+rnd(6);const ans=p*e-u;return{q:"There are "+p+" boxes of "+e+" pencils. "+pick(RV_NAMES)+" uses "+u+". How many pencils are left?",...rvOpts(ans,4),teach:[{i:"1️⃣",t:p+" × "+e+" = "+(p*e)+" pencils."},{i:"2️⃣",t:(p*e)+" − "+u+"."},{i:"🎯",t:"= "+ans+"."}]};}
  const a=10+rnd(20),b=5+rnd(15),g=pick([3,4,5]);const total=Math.ceil((a+b)/g)*g;const ans=total/g;return{q:pick(RV_NAMES)+" has "+total+" apples: some red, some green. They are packed "+g+" to a bag. How many bags?",...rvOpts(ans,3),teach:[{i:"➗",t:total+" apples, "+g+" per bag."},{i:"❓",t:g+" × ? = "+total+"."},{i:"🎯",t:ans+" bags."}]};},
 reasonable(){const a=6+rnd(4),b=6+rnd(4);const p=a*b;const wrong=p+pick([-30,30,40,-40]);const o=rvStrOpts("No — "+a+" × "+b+" is close to "+a+" × 10 = "+(a*10)+", so it should be about "+p,["Yes — it looks fine","Maybe — you cannot check multiplication","No — it should be "+(a+b)]);return{q:pick(RV_NAMES)+" says "+a+" × "+b+" = "+wrong+". Is that reasonable?",...o,teach:[{i:"🔍",t:"Estimate: "+a+" × 10 = "+(a*10)+"."},{i:"⚖️",t:wrong+" is far from "+(a*10)+"; the real answer is "+p+"."},{i:"🎯",t:"Estimating catches mistakes."}]};},
 perimeter(){const k=rnd(2);if(k===0){const l=4+rnd(9),w=2+rnd(7);const ans=2*(l+w);return{q:"Find the perimeter of the rectangle.",vis:rvRect(l+" cm",w+" cm"),...rvOpts(ans,6),teach:[{i:"🔁",t:"A rectangle has two lengths and two widths."},{i:"➕",t:l+" + "+w+" + "+l+" + "+w+"."},{i:"🎯",t:ans+" cm."}]};}
  const s=[3+rnd(6),3+rnd(6),3+rnd(6)];const ans=s[0]+s[1]+s[2];return{q:"A triangle has sides "+s.join(" cm, ")+" cm. What is its perimeter?",vis:rvPolygon(3,120),...rvOpts(ans,5),teach:[{i:"📏",t:"Perimeter = add ALL the sides."},{i:"➕",t:s.join(" + ")+"."},{i:"🎯",t:ans+" cm."}]};},
 unknownSide(){const s=[3+rnd(7),3+rnd(7),3+rnd(7)];const miss=3+rnd(7);const P=s[0]+s[1]+s[2]+miss;return{q:"A four-sided shape has a perimeter of "+P+" cm. Three sides are "+s.join(" cm, ")+" cm. How long is the fourth side?",...rvOpts(miss,3),teach:[{i:"➕",t:"Known sides: "+s.join(" + ")+" = "+(s[0]+s[1]+s[2])+"."},{i:"➖",t:P+" − "+(s[0]+s[1]+s[2])+"."},{i:"🎯",t:"= "+miss+" cm."}]};},
 areaPerimeter(){const l=3+rnd(6),w=2+rnd(5);const k=rnd(2);if(k===0)return{q:"A garden is "+l+" m by "+w+" m. How much fence goes around it (perimeter)?",vis:rvRect(l+" m",w+" m"),...rvOpts(2*(l+w),5),teach:[{i:"🧱",t:"Fence goes AROUND — that is perimeter."},{i:"➕",t:"2 × "+l+" + 2 × "+w+"."},{i:"🎯",t:(2*(l+w))+" m of fence."}]};
  return{q:"A garden is "+l+" m by "+w+" m. How much soil covers it (area)?",vis:rvRect(l+" m",w+" m"),...rvOpts(l*w,6),teach:[{i:"⬛",t:"Soil COVERS the inside — that is area."},{i:"✖️",t:l+" × "+w+"."},{i:"🎯",t:(l*w)+" square meters."}]};},
 measureWP(){const n=3+rnd(6),each=10+rnd(40);const ans=n*each;return{q:pick(RV_NAMES)+" cuts "+n+" pieces of ribbon, each "+each+" cm long. How much ribbon is that in all?",...rvOpts(ans,20),teach:[{i:"📏",t:n+" pieces of "+each+" cm."},{i:"✖️",t:n+" × "+each+"."},{i:"🎯",t:ans+" cm."}]};},
 volume(){const items=[["a spoonful of medicine","5 mL"],["a juice box","200 mL"],["a large soda bottle","2 L"],["a bathtub","150 L"],["a mug of cocoa","250 mL"],["a bucket","10 L"]];const it=pick(items);const o=rvStrOpts(it[1],items.filter(x=>x!==it).map(x=>x[1]));return{q:"About how much liquid does "+it[0]+" hold?",...o,teach:[{i:"🥄",t:"Milliliters (mL) are tiny — a spoon is 5 mL."},{i:"🧴",t:"Liters (L) are big — a large bottle is 2 L."},{i:"🎯",t:it[0].charAt(0).toUpperCase()+it[0].slice(1)+": about "+it[1]+"."}]};},
 volumeWP(){const n=2+rnd(5),each=pick([200,250,300,500]);const ans=n*each;return{q:"Each water bottle holds "+each+" mL. How much do "+n+" bottles hold?",...rvOpts(ans,each),teach:[{i:"🧴",t:n+" bottles × "+each+" mL."},{i:"✖️",t:n+" × "+each+"."},{i:"🎯",t:ans+" mL"+(ans>=1000?" (that is "+(ans/1000)+" L)":"")+"."}]};},
 mass(){const items=[["a paper clip","1 g"],["an apple","150 g"],["a basketball","600 g"],["a bag of rice","1 kg"],["a third grader","30 kg"],["a bicycle","12 kg"]];const it=pick(items);const o=rvStrOpts(it[1],items.filter(x=>x!==it).map(x=>x[1]));return{q:"About how much mass does "+it[0]+" have?",...o,teach:[{i:"📎",t:"Grams (g) are light — a paper clip is about 1 g."},{i:"🍚",t:"Kilograms (kg) are heavy — 1 kg = 1,000 g."},{i:"🎯",t:it[0].charAt(0).toUpperCase()+it[0].slice(1)+": about "+it[1]+"."}]};},
 massWP(){const n=2+rnd(5),each=pick([100,150,200,250]);const ans=n*each;return{q:"One apple has a mass of about "+each+" g. What is the mass of "+n+" apples?",...rvOpts(ans,each),teach:[{i:"🍎",t:n+" apples × "+each+" g."},{i:"✖️",t:n+" × "+each+"."},{i:"🎯",t:ans+" g."}]};},
 clock(){const h=1+rnd(12),m=rnd(60);const fmt=(hh,mm)=>hh+":"+(mm<10?"0":"")+mm;const wrongs=[fmt(h,(m+5)%60),fmt(m===0?h:(m%12||1),h%60),fmt(h%12+1,m)];return{q:"What time does the clock show?",vis:rvClock(h,m),...rvStrOpts(fmt(h,m),wrongs),teach:[{i:"🕐",t:"The short hand is the hour: it is past "+h+"."},{i:"🔢",t:"The long hand: count by 5s to "+(Math.floor(m/5)*5)+", then "+(m%5)+" more."},{i:"🎯",t:fmt(h,m)+"."}]};},
 elapsed(){const sh=1+rnd(10),sm=pick([0,15,30,45]);const dur=15+rnd(8)*15;let eh=sh,em=sm+dur;while(em>=60){em-=60;eh++;}const fmt=(hh,mm)=>hh+":"+(mm<10?"0":"")+mm;const k=rnd(2);
  if(k===0)return{q:"Practice starts at "+fmt(sh,sm)+" and lasts "+dur+" minutes. What time does it end?",vis:rvClock(sh,sm),...rvStrOpts(fmt(eh,em),[fmt(eh,(em+15)%60),fmt(eh+1,em),fmt(sh,(sm+dur)%60)]),teach:[{i:"⏱️",t:"Count on from "+fmt(sh,sm)+" by hours, then minutes."},{i:"➕",t:dur+" minutes = "+Math.floor(dur/60)+" h "+(dur%60)+" min."},{i:"🎯",t:"Ends at "+fmt(eh,em)+"."}]};
  return{q:"A movie starts at "+fmt(sh,sm)+" and ends at "+fmt(eh,em)+". How long is it?",...rvStrOpts(dur+" minutes",[(dur+15)+" minutes",(dur-15)+" minutes",(dur+30)+" minutes"]),teach:[{i:"⏱️",t:"Count from "+fmt(sh,sm)+" to the next hour, then on to "+fmt(eh,em)+"."},{i:"➕",t:"Add the pieces."},{i:"🎯",t:dur+" minutes."}]};},
 pictograph(){const key=pick([2,5,10]);const rows=shuffle(["Soccer","Basketball","Swimming","Tennis"]).slice(0,3).map(n=>[n,1+rnd(5)]);const r=pick(rows);const k=rnd(2);const icon="⚽";
  if(k===0)return{q:"How many students chose "+r[0]+"?",vis:rvPicto(rows,key,icon),...rvOpts(r[1]*key,key),teach:[{i:"🔑",t:"The key says each "+icon+" = "+key+"."},{i:"✖️",t:r[1]+" pictures × "+key+"."},{i:"🎯",t:(r[1]*key)+" students."}]};
  const s=rows.slice().sort((a,b)=>b[1]-a[1]);const diff=(s[0][1]-s[s.length-1][1])*key;return{q:"How many MORE students chose "+s[0][0]+" than "+s[s.length-1][0]+"?",vis:rvPicto(rows,key,icon),...rvOpts(diff,key),teach:[{i:"🔑",t:"Each picture = "+key+"."},{i:"➖",t:(s[0][1]*key)+" − "+(s[s.length-1][1]*key)+"."},{i:"🎯",t:diff+" more."}]};},
 bargraph(L){const wp=(L.p||[])[0]==="wp";const scale=pick([2,5,10]);const rows=shuffle(["Red","Blue","Green","Yellow"]).slice(0,3).map(n=>[n,scale*(1+rnd(6))]);
  if(!wp){const r=pick(rows);return{q:"How many chose "+r[0]+"?",vis:rvBars(rows,scale),...rvOpts(r[1],scale),teach:[{i:"📊",t:"Read the "+r[0]+" bar against the scale."},{i:"🔢",t:"The scale counts by "+scale+"s."},{i:"🎯",t:r[1]+"."}]};}
  const total=rows.reduce((a,r)=>a+r[1],0);return{q:"How many students answered in all?",vis:rvBars(rows,scale),...rvOpts(total,scale*2),teach:[{i:"📊",t:"Read each bar: "+rows.map(r=>r[1]).join(", ")+"."},{i:"➕",t:rows.map(r=>r[1]).join(" + ")+"."},{i:"🎯",t:total+" students."}]};},
 ruler(){const q4=pick([2,3,5,6,7,9,10,11]);const len=q4/4;const name=v=>{const w=Math.floor(v),f=v-w;const fs={0:"",0.25:"1/4",0.5:"1/2",0.75:"3/4"}[f];return (w?w+(fs?" ":""):"")+fs+" in";};const wrongs=[name(len+0.25),name(Math.max(0.25,len-0.25)),name(len+0.5)];return{q:"How long is the orange bar, to the nearest fourth of an inch?",vis:rvRuler(3,len),...rvStrOpts(name(len),wrongs),teach:[{i:"📏",t:"Start at 0. Each inch has 4 small spaces — fourths."},{i:"🔢",t:"Count whole inches, then the extra fourths."},{i:"🎯",t:name(len)+"."}]};},
 lineplot(){const vals=[];const base=pick([2,3]);for(let i=0;i<8;i++)vals.push(base+pick([0,0,0.5,0.5,1,1,1.5]));const k=rnd(2);const most=[...new Set(vals)].sort((a,b)=>vals.filter(v=>v===b).length-vals.filter(v=>v===a).length)[0];
  if(k===0)return{q:"How many pencils were measured in all?",vis:rvLinePlot(vals,"pencil length (inches)"),...rvOpts(vals.length,2),teach:[{i:"✕",t:"Each ✕ is one pencil."},{i:"🔢",t:"Count every ✕ above every number."},{i:"🎯",t:vals.length+" pencils."}]};
  return{q:"Which length was measured MOST often?",vis:rvLinePlot(vals,"pencil length (inches)"),...rvStrOpts(most+" inches",[...new Set(vals)].filter(v=>v!==most).map(v=>v+" inches").concat([(most+2)+" inches",(most+1.5)+" inches",(most-1)+" inches"])),teach:[{i:"👀",t:"Find the tallest stack of ✕s."},{i:"🔢",t:"That number has the most measurements."},{i:"🎯",t:most+" inches."}]};},
 polygon(){const shapes=[[3,"triangle"],[4,"quadrilateral"],[5,"pentagon"],[6,"hexagon"],[8,"octagon"]];const s=pick(shapes);const k=rnd(2);if(k===0)return{q:"What is this polygon called?",vis:rvPolygon(s[0]),...rvStrOpts(s[1],shapes.filter(x=>x!==s).map(x=>x[1])),teach:[{i:"🔢",t:"Count the sides: "+s[0]+"."},{i:"📚",t:"3 = triangle, 4 = quadrilateral, 5 = pentagon, 6 = hexagon, 8 = octagon."},{i:"🎯",t:"A "+s[1]+"."}]};
  return{q:"How many sides does a "+s[1]+" have?",...rvOpts(s[0],2),teach:[{i:"📚",t:"The name tells the number of sides."},{i:"🔢",t:s[1].charAt(0).toUpperCase()+s[1].slice(1)+" = "+s[0]+" sides."},{i:"🎯",t:s[0]+"."}]};},
 quad(L){const draw=(L.p||[])[0]==="draw";const keys=Object.keys(RV_QUADS);const k=pick(keys);const Q=RV_QUADS[k];const k2=rnd(2);
  if(draw||k2===1)return{q:"Which quadrilateral has "+Q.d+"?",...rvStrOpts(Q.n,keys.filter(x=>x!==k).map(x=>RV_QUADS[x].n)),teach:[{i:"🔍",t:"Check sides first, then angles."},{i:"📐",t:Q.n.charAt(0).toUpperCase()+Q.n.slice(1)+": "+Q.d+"."},{i:"🎯",t:"A "+Q.n+"."}]};
  return{q:"What is the best name for this quadrilateral?",vis:rvQuad(k),...rvStrOpts(Q.n,keys.filter(x=>x!==k).map(x=>RV_QUADS[x].n)),teach:[{i:"🔍",t:"Look at the sides: equal? parallel?"},{i:"📐",t:"Look at the angles: right angles?"},{i:"🎯",t:"It is a "+Q.n+" — "+Q.d+"."}]};}
};
function revealGen(L){const g=RV_GEN[L.g];const q=g(L);q.topic=q.topic||"reveal "+L.id;q.subject="math";q.level=2;q.reveal=L.id;const pr=g(L);q.practice={q:pr.q,opts:pr.opts,a:pr.a};return q;}
function revealLesson(id){return REVEAL_LESSONS.find(l=>l.id===id)}
function revealRec(id){return P&&P.reveal&&P.reveal[id]}
/* ---------- screens ---------- */
function renderReveal(){
  clearTimers();closeOverlay();defocus();showAnanseCorner(true);
  const cur=P.revealCurrent&&revealLesson(P.revealCurrent);
  const units=Object.keys(REVEAL_UNITS).map(u=>{
    const ls=REVEAL_LESSONS.filter(l=>l.u==u);const done=ls.filter(l=>{const r=revealRec(l.id);return r&&r.best/r.total>=0.8;}).length;
    return '<button class="opt" style="display:flex;justify-content:space-between;align-items:center;gap:10px" onclick="renderRevealUnit('+u+')"><span style="text-align:left"><b>Unit '+u+' · '+esc(REVEAL_UNITS[u].t)+'</b><br><span class="muted" style="font-size:13px">'+ls.length+' lessons</span></span><span class="lvl-badge" style="background:'+(done===ls.length?"#2f8f4e":(done?"#f5a623":"#6f88ad"))+'">'+done+'/'+ls.length+' ★</span></button>';
  }).join("");
  app.innerHTML='<div class="fadein" style="max-width:680px;margin:0 auto">'
   +'<div class="center"><h1>📘 Reveal Math · Grade 3</h1><p class="muted">The same units and lessons as your Reveal Math practice book, with fresh problems every time. Each lesson: Review, then 8 problems. Earn a ★ with 80% or better.</p></div>'
   +'<div class="kente-strip" style="margin:14px 0 10px"></div>'
   +(cur?'<div class="card gold" style="margin-bottom:12px"><b>📍 Where the class is:</b> Lesson '+esc(cur.id)+' · '+esc(cur.t)+'<div class="btn-row" style="justify-content:flex-start;margin-top:8px"><button class="btn" onclick="renderRevealLesson(\''+cur.id+'\')">Practice this lesson ▶</button></div></div>':'<p class="muted center" style="margin-bottom:10px">Tip: a parent can set "where the class is" in the Parent Portal so today\'s lesson shows up here first.</p>')
   +'<div class="opts">'+units+'</div>'
   +'<div class="btn-row" style="margin-top:18px"><button class="btn" onclick="renderHome()">⟵ Back to Adventure</button></div><div class="spacer"></div></div>';
  say("Reveal Math practice, "+P.name+". Pick a unit, or practice the lesson your class is on.");
}
function renderRevealUnit(u){
  clearTimers();closeOverlay();defocus();showAnanseCorner(true);
  const ls=REVEAL_LESSONS.filter(l=>l.u==u);
  const cards=ls.map(l=>{const r=revealRec(l.id);const star=r&&r.best/r.total>=0.8;return '<button class="opt" style="display:flex;justify-content:space-between;align-items:center;gap:10px" onclick="renderRevealLesson(\''+l.id+'\')"><span style="text-align:left"><b>Lesson '+esc(l.id)+'</b> · '+esc(l.t)+(P.revealCurrent===l.id?' <span class="focus-chip">📍 class is here</span>':'')+'</span><span class="lvl-badge" style="background:'+(star?"#2f8f4e":(r?"#f5a623":"#6f88ad"))+'">'+(r?(star?"★ ":"")+r.best+'/'+r.total:"new")+'</span></button>';}).join("");
  app.innerHTML='<div class="fadein" style="max-width:680px;margin:0 auto">'
   +'<div class="hud"><span class="pill">📘 <b>Reveal Math</b></span><span class="pill">Unit '+u+'</span></div>'
   +'<h1 style="margin-top:10px">'+esc(REVEAL_UNITS[u].t)+'</h1>'
   +'<div class="opts" style="margin-top:12px">'+cards+'</div>'
   +'<div class="card" style="margin-top:14px"><b>🏠 Math @ Home</b><p class="muted" style="margin-top:6px">'+esc(REVEAL_UNITS[u].home)+'</p></div>'
   +'<div class="btn-row" style="margin-top:14px"><button class="btn secondary" onclick="renderReveal()">⟵ All units</button></div><div class="spacer"></div></div>';
}
function renderRevealLesson(id){
  const L=revealLesson(id);if(!L)return renderReveal();
  clearTimers();closeOverlay();defocus();showAnanseCorner(false);
  const r=revealRec(id);
  const sample=revealGen(L);
  app.innerHTML='<div class="fadein" style="max-width:660px;margin:0 auto">'
   +'<div class="hud"><span class="pill">📘 <b>Reveal Math</b></span><span class="pill">Lesson '+esc(id)+'</span><span class="lvl-badge">Unit '+L.u+'</span></div>'
   +'<h1 style="margin-top:10px">'+esc(L.t)+'</h1>'
   +'<div class="card gold" style="margin-top:12px"><h3 style="margin-bottom:8px">Review</h3><p style="font-size:19px;line-height:1.6">'+esc(REVEAL_REVIEW[id]||"")+'</p>'+(sample.vis?'<div class="qvis" style="margin-top:10px">'+sample.vis+'</div><p class="muted" style="font-size:14px;margin-top:6px">Example: '+esc(sample.q)+' → '+esc(sample.opts[sample.a])+'</p>':'')+'</div>'
   +(r?'<p class="muted center" style="margin-top:10px">Best so far: '+r.best+' of '+r.total+' · tried '+r.tries+' time'+(r.tries===1?'':'s')+'</p>':'')
   +'<div class="center"><div class="spacer"></div><div class="btn-row"><button class="btn big" onclick="startReveal(\''+id+'\')">Start practice ▶</button><button class="btn secondary" onclick="say(REVEAL_REVIEW[\''+id+'\'])">🔊 Read it to me</button><button class="btn secondary" onclick="renderRevealUnit('+L.u+')">⟵ Unit '+L.u+'</button></div></div></div>';
  say("Lesson "+id+", "+L.t+". "+(REVEAL_REVIEW[id]||""));
}
function startReveal(id){
  const L=revealLesson(id);if(!L)return;
  const qs=[];const seen=new Set();
  for(let i=0;i<40&&qs.length<8;i++){const q=revealGen(L);if(seen.has(q.q+(q.vis||"")))continue;seen.add(q.q+(q.vis||""));qs.push(q);}
  S={subject:"math",total:qs.length,n:0,correct:0,results:[],consecR:0,consecW:0,
     sprintEnd:Date.now()+10*60*1000,qStart:0,cur:null,brokeAt:new Set(),xp:0,mode:"session",
     start:Date.now(),wpC:0,wpT:0,recallC:0,recallT:0,reviewC:0,reviewT:0,mfC:0,mfT:0,wpServed:true,phase:"main",seen:[],diff:0,tried:false,
     lesson:"reveal:"+id,lessonQs:qs};
  say("Lesson "+id+" practice. Take your time and think it through.");
  nextQuestion();
}
