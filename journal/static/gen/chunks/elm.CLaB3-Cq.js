
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 8:30:46 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

function e(e,t,n){return t(n),n(e,t)}var t=/[a-z]/,n=/[A-Z]/,r=/[a-zA-Z0-9_]/,i=/[0-9]/,o=/[0-9A-Fa-f]/,a=/[-&*+.\\/<>=?^|:]/,u=/[(),[\]{}]/,f=/[ \v\f]/;function s(){return function(s,h){if(s.eatWhile(f))return null;var k=s.next();if(u.test(k))return"{"===k&&s.eat("-")?e(s,h,l(1)):"["===k&&s.match("glsl|")?e(s,h,x):"builtin";if("'"===k)return e(s,h,m);if('"'===k)return s.eat('"')?s.eat('"')?e(s,h,c):"string":e(s,h,p);if(n.test(k))return s.eatWhile(r),"type";if(t.test(k)){var g=1===s.pos;return s.eatWhile(r),g?"def":"variable"}if(i.test(k)){if("0"===k){if(s.eat(/[xX]/))return s.eatWhile(o),"number"}else s.eatWhile(i);return s.eat(".")&&s.eatWhile(i),s.eat(/[eE]/)&&(s.eat(/[-+]/),s.eatWhile(i)),"number"}return a.test(k)?"-"===k&&s.eat("-")?(s.skipToEnd(),"comment"):(s.eatWhile(a),"keyword"):"_"===k?"keyword":"error"}}function l(e){return 0==e?s():function(t,n){for(;!t.eol();){var r=t.next();if("{"==r&&t.eat("-"))++e;else if("-"==r&&t.eat("}")&&0===--e)return n(s()),"comment"}return n(l(e)),"comment"}}function c(e,t){for(;!e.eol();){if('"'===e.next()&&e.eat('"')&&e.eat('"'))return t(s()),"string"}return"string"}function p(e,t){for(;e.skipTo('\\"');)e.next(),e.next();return e.skipTo('"')?(e.next(),t(s()),"string"):(e.skipToEnd(),t(s()),"error")}function m(e,t){for(;e.skipTo("\\'");)e.next(),e.next();return e.skipTo("'")?(e.next(),t(s()),"string"):(e.skipToEnd(),t(s()),"error")}function x(e,t){for(;!e.eol();){if("|"===e.next()&&e.eat("]"))return t(s()),"string"}return"string"}var h={case:1,of:1,as:1,if:1,then:1,else:1,let:1,in:1,type:1,alias:1,module:1,where:1,import:1,exposing:1,port:1};const k={name:"elm",startState:function(){return{f:s()}},copyState:function(e){return{f:e.f}},token:function(e,t){var n=t.f(e,(function(e){t.f=e})),r=e.current();return h.hasOwnProperty(r)?"keyword":n},languageData:{commentTokens:{line:"--"}}};export{k as elm};
