
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 9:58:07 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

var t;function e(e,n){return t=n,e}function n(t,a){var u,i,l,c=t.next();if("<"!=c||!t.eat("!")){if("<"==c&&t.eat("?"))return a.tokenize=(i="meta",l="?>",function(t,e){for(;!t.eol();){if(t.match(l)){e.tokenize=n;break}t.next()}return i}),e("meta",c);if("#"==c&&t.eatWhile(/[\w]/))return e("atom","tag");if("|"==c)return e("keyword","separator");if(c.match(/[\(\)\[\]\-\.,\+\?>]/))return e(null,c);if(c.match(/[\[\]]/))return e("rule",c);if('"'==c||"'"==c)return a.tokenize=(u=c,function(t,r){for(var a,i=!1;null!=(a=t.next());){if(a==u&&!i){r.tokenize=n;break}i=!i&&"\\"==a}return e("string","tag")}),a.tokenize(t,a);if(t.eatWhile(/[a-zA-Z\?\+\d]/)){var o=t.current();return null!==o.substr(o.length-1,o.length).match(/\?|\+/)&&t.backUp(1),e("tag","tag")}return"%"==c||"*"==c?e("number","number"):(t.eatWhile(/[\w\\\-_%.{,]/),e(null,null))}return t.eatWhile(/[\-]/)?(a.tokenize=r,r(t,a)):t.eatWhile(/[\w]/)?e("keyword","doindent"):void 0}function r(t,r){for(var a,u=0;null!=(a=t.next());){if(u>=2&&">"==a){r.tokenize=n;break}u="-"==a?u+1:0}return e("comment","comment")}const a={name:"dtd",startState:function(){return{tokenize:n,baseIndent:0,stack:[]}},token:function(e,n){if(e.eatSpace())return null;var r=n.tokenize(e,n),a=n.stack[n.stack.length-1];return"["==e.current()||"doindent"===t||"["==t?n.stack.push("rule"):"endtag"===t?n.stack[n.stack.length-1]="endtag":"]"==e.current()||"]"==t||">"==t&&"rule"==a?n.stack.pop():"["==t&&n.stack.push("["),r},indent:function(e,n,r){var a=e.stack.length;return"]"===n.charAt(0)?a--:">"===n.substr(n.length-1,n.length)&&("<"===n.substr(0,1)||"doindent"==t&&n.length>1||("doindent"==t?a--:">"==t&&n.length>1||"tag"==t&&">"!==n||("tag"==t&&"rule"==e.stack[e.stack.length-1]?a--:"tag"==t?a++:">"===n&&"rule"==e.stack[e.stack.length-1]&&">"===t?a--:">"===n&&"rule"==e.stack[e.stack.length-1]||("<"!==n.substr(0,1)&&">"===n.substr(0,1)?a-=1:">"===n||(a-=1)))),null!=t&&"]"!=t||a--),e.baseIndent+a*r.unit},languageData:{indentOnInput:/^\s*[\]>]$/}};export{a as dtd};
