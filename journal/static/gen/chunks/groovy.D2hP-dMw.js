
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 10:25:04 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

function e(e){for(var t={},n=e.split(" "),r=0;r<n.length;++r)t[n[r]]=!0;return t}var t,n=e("abstract as assert boolean break byte case catch char class const continue def default do double else enum extends final finally float for goto if implements import in instanceof int interface long native new package private protected public return short static strictfp super switch synchronized threadsafe throw throws trait transient try void volatile while"),r=e("catch class def do else enum finally for if interface switch trait try while"),i=e("return break continue"),a=e("null true false this");function o(e,o){var s=e.next();if('"'==s||"'"==s)return l(s,e,o);if(/[\[\]{}\(\),;\:\.]/.test(s))return t=s,null;if(/\d/.test(s))return e.eatWhile(/[\w\.]/),e.eat(/eE/)&&(e.eat(/\+\-/),e.eatWhile(/\d/)),"number";if("/"==s){if(e.eat("*"))return o.tokenize.push(c),c(e,o);if(e.eat("/"))return e.skipToEnd(),"comment";if(f(o.lastToken,!1))return l(s,e,o)}if("-"==s&&e.eat(">"))return t="->",null;if(/[+\-*&%=<>!?|\/~]/.test(s))return e.eatWhile(/[+\-*&%=<>|~]/),"operator";if(e.eatWhile(/[\w\$_]/),"@"==s)return e.eatWhile(/[\w\$_\.]/),"meta";if("."==o.lastToken)return"property";if(e.eat(":"))return t="proplabel","property";var u=e.current();return a.propertyIsEnumerable(u)?"atom":n.propertyIsEnumerable(u)?(r.propertyIsEnumerable(u)?t="newstatement":i.propertyIsEnumerable(u)&&(t="standalone"),"keyword"):"variable"}function l(e,t,n){var r=!1;if("/"!=e&&t.eat(e)){if(!t.eat(e))return"string";r=!0}function i(t,n){for(var i,a=!1,o=!r;null!=(i=t.next());){if(i==e&&!a){if(!r)break;if(t.match(e+e)){o=!0;break}}if('"'==e&&"$"==i&&!a){if(t.eat("{"))return n.tokenize.push(s()),"string";if(t.match(/^\w/,!1))return n.tokenize.push(u),"string"}a=!a&&"\\"==i}return o&&n.tokenize.pop(),"string"}return n.tokenize.push(i),i(t,n)}function s(){var e=1;function t(t,n){if("}"==t.peek()){if(0==--e)return n.tokenize.pop(),n.tokenize[n.tokenize.length-1](t,n)}else"{"==t.peek()&&e++;return o(t,n)}return t.isBase=!0,t}function u(e,t){var n=e.match(/^(\.|[\w\$_]+)/);return n&&e.match("."==n[0]?/^[\w$_]/:/^\./)||t.tokenize.pop(),n?"."==n[0]?null:"variable":t.tokenize[t.tokenize.length-1](e,t)}function c(e,t){for(var n,r=!1;n=e.next();){if("/"==n&&r){t.tokenize.pop();break}r="*"==n}return"comment"}function f(e,t){return!e||"operator"==e||"->"==e||/[\.\[\{\(,;:]/.test(e)||"newstatement"==e||"keyword"==e||"proplabel"==e||"standalone"==e&&!t}function p(e,t,n,r,i){this.indented=e,this.column=t,this.type=n,this.align=r,this.prev=i}function m(e,t,n){return e.context=new p(e.indented,t,n,null,e.context)}function k(e){var t=e.context.type;return")"!=t&&"]"!=t&&"}"!=t||(e.indented=e.context.indented),e.context=e.context.prev}o.isBase=!0;const d={name:"groovy",startState:function(e){return{tokenize:[o],context:new p(-e,0,"top",!1),indented:0,startOfLine:!0,lastToken:null}},token:function(e,n){var r=n.context;if(e.sol()&&(null==r.align&&(r.align=!1),n.indented=e.indentation(),n.startOfLine=!0,"statement"!=r.type||f(n.lastToken,!0)||(k(n),r=n.context)),e.eatSpace())return null;t=null;var i=n.tokenize[n.tokenize.length-1](e,n);if("comment"==i)return i;if(null==r.align&&(r.align=!0),";"!=t&&":"!=t||"statement"!=r.type)if("->"==t&&"statement"==r.type&&"}"==r.prev.type)k(n),n.context.align=!1;else if("{"==t)m(n,e.column(),"}");else if("["==t)m(n,e.column(),"]");else if("("==t)m(n,e.column(),")");else if("}"==t){for(;"statement"==r.type;)r=k(n);for("}"==r.type&&(r=k(n));"statement"==r.type;)r=k(n)}else t==r.type?k(n):("}"==r.type||"top"==r.type||"statement"==r.type&&"newstatement"==t)&&m(n,e.column(),"statement");else k(n);return n.startOfLine=!1,n.lastToken=t||i,i},indent:function(e,t,n){if(!e.tokenize[e.tokenize.length-1].isBase)return null;var r=t&&t.charAt(0),i=e.context;"statement"!=i.type||f(e.lastToken,!0)||(i=i.prev);var a=r==i.type;return"statement"==i.type?i.indented+("{"==r?0:n.unit):i.align?i.column+(a?0:1):i.indented+(a?0:n.unit)},languageData:{indentOnInput:/^\s*[{}]$/,commentTokens:{line:"//",block:{open:"/*",close:"*/"}},closeBrackets:{brackets:["(","[","{","'",'"',"'''",'"""']}}};export{d as groovy};
