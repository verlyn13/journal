
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 5:35:17 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

var t;function e(t){return new RegExp("^(?:"+t.join("|")+")$","i")}e([]);var n=e(["@prefix","@base","a"]),o=/[*+\-<>=&|]/;function r(e,i){var c,a=e.next();if(t=null,"<"!=a||e.match(/^[\s\u00a0=]/,!1)){if('"'==a||"'"==a)return i.tokenize=(c=a,function(t,e){for(var n,o=!1;null!=(n=t.next());){if(n==c&&!o){e.tokenize=r;break}o=!o&&"\\"==n}return"string"}),i.tokenize(e,i);if(/[{}\(\),\.;\[\]]/.test(a))return t=a,null;if("#"==a)return e.skipToEnd(),"comment";if(o.test(a))return e.eatWhile(o),null;if(":"==a)return"operator";if(e.eatWhile(/[_\w\d]/),":"==e.peek())return"variableName.special";var l=e.current();return n.test(l)?"meta":a>="A"&&a<="Z"?"comment":"keyword"}return e.match(/^[^\s\u00a0>]*>?/),"atom"}function i(t,e,n){t.context={prev:t.context,indent:t.indent,col:n,type:e}}function c(t){t.indent=t.context.indent,t.context=t.context.prev}const a={name:"turtle",startState:function(){return{tokenize:r,context:null,indent:0,col:0}},token:function(e,n){if(e.sol()&&(n.context&&null==n.context.align&&(n.context.align=!1),n.indent=e.indentation()),e.eatSpace())return null;var o=n.tokenize(e,n);if("comment"!=o&&n.context&&null==n.context.align&&"pattern"!=n.context.type&&(n.context.align=!0),"("==t)i(n,")",e.column());else if("["==t)i(n,"]",e.column());else if("{"==t)i(n,"}",e.column());else if(/[\]\}\)]/.test(t)){for(;n.context&&"pattern"==n.context.type;)c(n);n.context&&t==n.context.type&&c(n)}else"."==t&&n.context&&"pattern"==n.context.type?c(n):/atom|string|variable/.test(o)&&n.context&&(/[\}\]]/.test(n.context.type)?i(n,"pattern",e.column()):"pattern"!=n.context.type||n.context.align||(n.context.align=!0,n.context.col=e.column()));return o},indent:function(t,e,n){var o=e&&e.charAt(0),r=t.context;if(/[\]\}]/.test(o))for(;r&&"pattern"==r.type;)r=r.prev;var i=r&&o==r.type;return r?"pattern"==r.type?r.col:r.align?r.col+(i?0:1):r.indent+(i?0:n.unit):0},languageData:{commentTokens:{line:"#"}}};export{a as turtle};
