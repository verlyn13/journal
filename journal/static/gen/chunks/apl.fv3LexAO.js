
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 10:18:28 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

var e={"+":["conjugate","add"],"−":["negate","subtract"],"×":["signOf","multiply"],"÷":["reciprocal","divide"],"⌈":["ceiling","greaterOf"],"⌊":["floor","lesserOf"],"∣":["absolute","residue"],"⍳":["indexGenerate","indexOf"],"?":["roll","deal"],"⋆":["exponentiate","toThePowerOf"],"⍟":["naturalLog","logToTheBase"],"○":["piTimes","circularFuncs"],"!":["factorial","binomial"],"⌹":["matrixInverse","matrixDivide"],"<":[null,"lessThan"],"≤":[null,"lessThanOrEqual"],"=":[null,"equals"],">":[null,"greaterThan"],"≥":[null,"greaterThanOrEqual"],"≠":[null,"notEqual"],"≡":["depth","match"],"≢":[null,"notMatch"],"∈":["enlist","membership"],"⍷":[null,"find"],"∪":["unique","union"],"∩":[null,"intersection"],"∼":["not","without"],"∨":[null,"or"],"∧":[null,"and"],"⍱":[null,"nor"],"⍲":[null,"nand"],"⍴":["shapeOf","reshape"],",":["ravel","catenate"],"⍪":[null,"firstAxisCatenate"],"⌽":["reverse","rotate"],"⊖":["axis1Reverse","axis1Rotate"],"⍉":["transpose",null],"↑":["first","take"],"↓":[null,"drop"],"⊂":["enclose","partitionWithAxis"],"⊃":["diclose","pick"],"⌷":[null,"index"],"⍋":["gradeUp",null],"⍒":["gradeDown",null],"⊤":["encode",null],"⊥":["decode",null],"⍕":["format","formatByExample"],"⍎":["execute",null],"⊣":["stop","left"],"⊢":["pass","right"]},n=/[\.\/⌿⍀¨⍣]/,t=/⍬/,l=/[\+−×÷⌈⌊∣⍳\?⋆⍟○!⌹<≤=>≥≠≡≢∈⍷∪∩∼∨∧⍱⍲⍴,⍪⌽⊖⍉↑↓⊂⊃⌷⍋⍒⊤⊥⍕⍎⊣⊢]/,a=/←/,r=/[⍝#].*$/;const i={name:"apl",startState:function(){return{prev:!1,func:!1,op:!1,string:!1,escape:!1}},token:function(i,u){var o,s,c;return i.eatSpace()?null:'"'===(o=i.next())||"'"===o?(i.eatWhile((s=o,c=!1,function(e){return c=e,e!==s||"\\"===c})),i.next(),u.prev=!0,"string"):/[\[{\(]/.test(o)?(u.prev=!1,null):/[\]}\)]/.test(o)?(u.prev=!0,null):t.test(o)?(u.prev=!1,"atom"):/[¯\d]/.test(o)?(u.func?(u.func=!1,u.prev=!1):u.prev=!0,i.eatWhile(/[\w\.]/),"number"):n.test(o)||a.test(o)?"operator":l.test(o)?(u.func=!0,u.prev=!1,e[o]?"variableName.function.standard":"variableName.function"):r.test(o)?(i.skipToEnd(),"comment"):"∘"===o&&"."===i.peek()?(i.next(),"variableName.function"):(i.eatWhile(/[\w\$_]/),u.prev=!0,"keyword")}};export{i as apl};
