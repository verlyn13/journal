
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 10:25:04 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

var e=0,t=1,a=0,c=1,r=2;const n={name:"ebnf",startState:function(){return{stringType:null,commentType:null,braced:0,lhs:!0,localState:null,stack:[],inDefinition:!1}},token:function(n,s){if(n){switch(0===s.stack.length&&('"'==n.peek()||"'"==n.peek()?(s.stringType=n.peek(),n.next(),s.stack.unshift(c)):n.match("/*")?(s.stack.unshift(a),s.commentType=e):n.match("(*")&&(s.stack.unshift(a),s.commentType=t)),s.stack[0]){case c:for(;s.stack[0]===c&&!n.eol();)n.peek()===s.stringType?(n.next(),s.stack.shift()):"\\"===n.peek()?(n.next(),n.next()):n.match(/^.[^\\\"\']*/);return s.lhs?"property":"string";case a:for(;s.stack[0]===a&&!n.eol();)s.commentType===e&&n.match("*/")||s.commentType===t&&n.match("*)")?(s.stack.shift(),s.commentType=null):n.match(/^.[^\*]*/);return"comment";case r:for(;s.stack[0]===r&&!n.eol();)n.match(/^[^\]\\]+/)||n.match(".")||s.stack.shift();return"operator"}var m=n.peek();switch(m){case"[":return n.next(),s.stack.unshift(r),"bracket";case":":case"|":case";":return n.next(),"operator";case"%":if(n.match("%%"))return"header";if(n.match(/[%][A-Za-z]+/))return"keyword";if(n.match(/[%][}]/))return"bracket";break;case"/":if(n.match(/[\/][A-Za-z]+/))return"keyword";case"\\":if(n.match(/[\][a-z]+/))return"string.special";case".":if(n.match("."))return"atom";case"*":case"-":case"+":case"^":if(n.match(m))return"atom";case"$":if(n.match("$$"))return"builtin";if(n.match(/[$][0-9]+/))return"variableName.special";case"<":if(n.match(/<<[a-zA-Z_]+>>/))return"builtin"}return n.match("//")?(n.skipToEnd(),"comment"):n.match("return")?"operator":n.match(/^[a-zA-Z_][a-zA-Z0-9_]*/)?n.match(/(?=[\(.])/)?"variable":n.match(/(?=[\s\n]*[:=])/)?"def":"variableName.special":-1!=["[","]","(",")"].indexOf(n.peek())?(n.next(),"bracket"):(n.eatSpace()||n.next(),null)}}};export{n as ebnf};
