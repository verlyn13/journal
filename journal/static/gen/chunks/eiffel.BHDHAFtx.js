
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 10:25:04 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

function e(e){for(var t={},r=0,n=e.length;r<n;++r)t[e[r]]=!0;return t}var t=e(["note","across","when","variant","until","unique","undefine","then","strip","select","retry","rescue","require","rename","reference","redefine","prefix","once","old","obsolete","loop","local","like","is","inspect","infix","include","if","frozen","from","external","export","ensure","end","elseif","else","do","creation","create","check","alias","agent","separate","invariant","inherit","indexing","feature","expanded","deferred","class","Void","True","Result","Precursor","False","Current","create","attached","detachable","as","and","implies","not","or"]),r=e([":=","and then","and","or","<<",">>"]);function n(e,t){if(e.eatSpace())return null;var r,n,a=e.next();return'"'==a||"'"==a?function(e,t,r){return r.tokenize.push(e),e(t,r)}((r=a,n="string",function(e,t){for(var a,i=!1;null!=(a=e.next());){if(a==r&&!i){t.tokenize.pop();break}i=!i&&"%"==a}return n}),e,t):"-"==a&&e.eat("-")?(e.skipToEnd(),"comment"):":"==a&&e.eat("=")?"operator":/[0-9]/.test(a)?(e.eatWhile(/[xXbBCc0-9\.]/),e.eat(/[\?\!]/),"variable"):/[a-zA-Z_0-9]/.test(a)?(e.eatWhile(/[a-zA-Z_0-9]/),e.eat(/[\?\!]/),"variable"):/[=+\-\/*^%<>~]/.test(a)?(e.eatWhile(/[=+\-\/*^%<>~]/),"operator"):null}const a={name:"eiffel",startState:function(){return{tokenize:[n]}},token:function(e,n){var a=n.tokenize[n.tokenize.length-1](e,n);if("variable"==a){var i=e.current();a=t.propertyIsEnumerable(e.current())?"keyword":r.propertyIsEnumerable(e.current())?"operator":/^[A-Z][A-Z_0-9]*$/g.test(i)?"tag":/^0[bB][0-1]+$/g.test(i)||/^0[cC][0-7]+$/g.test(i)||/^0[xX][a-fA-F0-9]+$/g.test(i)||/^([0-9]+\.[0-9]*)|([0-9]*\.[0-9]+)$/g.test(i)||/^[0-9]+$/g.test(i)?"number":"variable"}return a},languageData:{commentTokens:{line:"--"}}};export{a as eiffel};
