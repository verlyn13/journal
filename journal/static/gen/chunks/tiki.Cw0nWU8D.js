
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 2:29:10 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

function e(e,t,r){return function(i,a){for(;!i.eol();){if(i.match(t)){a.tokenize=n;break}i.next()}return r&&(a.tokenize=r),e}}function t(e){return function(t,r){for(;!t.eol();)t.next();return r.tokenize=n,e}}function n(r,i){function a(e){return i.tokenize=e,e(r,i)}var o=r.sol(),c=r.next();switch(c){case"{":return r.eat("/"),r.eatSpace(),r.eatWhile(/[^\s\u00a0=\"\'\/?(}]/),i.tokenize=u,"tag";case"_":if(r.eat("_"))return a(e("strong","__",n));break;case"'":if(r.eat("'"))return a(e("em","''",n));break;case"(":if(r.eat("("))return a(e("link","))",n));break;case"[":return a(e("url","]",n));case"|":if(r.eat("|"))return a(e("comment","||"));break;case"-":if(r.eat("="))return a(e("header string","=-",n));if(r.eat("-"))return a(e("error tw-deleted","--",n));break;case"=":if(r.match("=="))return a(e("tw-underline","===",n));break;case":":if(r.eat(":"))return a(e("comment","::"));break;case"^":return a(e("tw-box","^"));case"~":if(r.match("np~"))return a(e("meta","~/np~"))}if(o)switch(c){case"!":return r.match("!!!!!")||r.match("!!!!")||r.match("!!!")||r.match("!!"),a(t("header string"));case"*":case"#":case"+":return a(t("tw-listitem bracket"))}return null}var r,i,a,o;function u(e,t){var r,a=e.next(),o=e.peek();return"}"==a?(t.tokenize=n,"tag"):"("==a||")"==a?"bracket":"="==a?(i="equals",">"==o&&(e.next(),o=e.peek()),/[\'\"]/.test(o)||(t.tokenize=function(e,t){for(;!e.eol();){var n=e.next(),r=e.peek();if(" "==n||","==n||/[ )}]/.test(r)){t.tokenize=u;break}}return"string"}),"operator"):/[\'\"]/.test(a)?(t.tokenize=(r=a,function(e,t){for(;!e.eol();)if(e.next()==r){t.tokenize=u;break}return"string"}),t.tokenize(e,t)):(e.eatWhile(/[^\s\u00a0=\"\'\/?]/),"keyword")}function c(){for(var e=arguments.length-1;e>=0;e--)a.cc.push(arguments[e])}function f(){return c.apply(null,arguments),!0}function s(e,t){var n=a.context&&a.context.noIndent;a.context={prev:a.context,pluginName:e,indent:a.indented,startOfLine:t,noIndent:n}}function l(){a.context&&(a.context=a.context.prev)}function k(e){if("openPlugin"==e)return a.pluginName=r,f(d,(i=a.startOfLine,function(e){return"selfclosePlugin"==e||"endPlugin"==e?f():"endPlugin"==e?(s(a.pluginName,i),f()):f()}));if("closePlugin"==e){var t=!1;return a.context?(t=a.context.pluginName!=r,l()):t=!0,t&&(o="error"),f(function(e){return function(t){return e&&(o="error"),"endPlugin"==t?f():c()}}(t))}return"string"==e?(a.context&&"!cdata"==a.context.name||s("!cdata"),a.tokenize==n&&l(),f()):f();var i}function d(e){return"keyword"==e?(o="attribute",f(d)):"equals"==e?f(p,d):c()}function p(e){return"keyword"==e?(o="string",f()):"string"==e?f(g):c()}function g(e){return"string"==e?f(g):c()}const m={name:"tiki",startState:function(){return{tokenize:n,cc:[],indented:0,startOfLine:!0,pluginName:null,context:null}},token:function(e,t){if(e.sol()&&(t.startOfLine=!0,t.indented=e.indentation()),e.eatSpace())return null;o=i=r=null;var n=t.tokenize(e,t);if((n||i)&&"comment"!=n)for(a=t;;){if((t.cc.pop()||k)(i||n))break}return t.startOfLine=!1,o||n},indent:function(e,t,n){var r=e.context;if(r&&r.noIndent)return 0;for(r&&/^{\//.test(t)&&(r=r.prev);r&&!r.startOfLine;)r=r.prev;return r?r.indent+n.unit:0}};export{m as tiki};
