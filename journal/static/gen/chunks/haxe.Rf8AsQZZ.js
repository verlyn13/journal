
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 8:30:46 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

function t(t){return{type:t,style:"keyword"}}var e,n=t("keyword a"),r=t("keyword b"),a=t("keyword c"),i=t("operator"),o={type:"atom",style:"atom"},l={type:"attribute",style:"attribute"},u=t("typedef"),c={if:n,while:n,else:r,do:r,try:r,return:a,break:a,continue:a,new:a,throw:a,var:t("var"),inline:l,static:l,using:t("import"),public:l,private:l,cast:t("cast"),import:t("import"),macro:t("macro"),function:t("function"),catch:t("catch"),untyped:t("untyped"),callback:t("cb"),for:t("for"),switch:t("switch"),case:t("case"),default:t("default"),in:i,never:t("property_access"),trace:t("trace"),class:u,abstract:u,enum:u,interface:u,typedef:u,extends:u,implements:u,dynamic:u,true:o,false:o,null:o},f=/[+\-*&%=<>!?|]/;function s(t,e,n){return e.tokenize=n,n(t,e)}function d(t,e){for(var n,r=!1;null!=(n=t.next());){if(n==e&&!r)return!0;r=!r&&"\\"==n}}function p(t,n,r){return u=t,e=r,n}function m(t,e){var n=t.next();if('"'==n||"'"==n)return s(t,e,(r=n,function(t,e){return d(t,r)&&(e.tokenize=m),p("string","string")}));if(/[\[\]{}\(\),;\:\.]/.test(n))return p(n);if("0"==n&&t.eat(/x/i))return t.eatWhile(/[\da-f]/i),p("number","number");if(/\d/.test(n)||"-"==n&&t.eat(/\d/))return t.match(/^\d*(?:\.\d*(?!\.))?(?:[eE][+\-]?\d+)?/),p("number","number");if(e.reAllowed&&"~"==n&&t.eat(/\//))return d(t,"/"),t.eatWhile(/[gimsu]/),p("regexp","string.special");if("/"==n)return t.eat("*")?s(t,e,v):t.eat("/")?(t.skipToEnd(),p("comment","comment")):(t.eatWhile(f),p("operator",null,t.current()));if("#"==n)return t.skipToEnd(),p("conditional","meta");if("@"==n)return t.eat(/:/),t.eatWhile(/[\w_]/),p("metadata","meta");if(f.test(n))return t.eatWhile(f),p("operator",null,t.current());if(/[A-Z]/.test(n))return t.eatWhile(/[\w_<>]/),p("type","type",a=t.current());t.eatWhile(/[\w_]/);var r,a=t.current(),i=c.propertyIsEnumerable(a)&&c[a];return i&&e.kwAllowed?p(i.type,i.style,a):p("variable","variable",a)}function v(t,e){for(var n,r=!1;n=t.next();){if("/"==n&&r){e.tokenize=m;break}r="*"==n}return p("comment","comment")}var y={atom:!0,number:!0,variable:!0,string:!0,regexp:!0};function b(t,e,n,r,a,i){this.indented=t,this.column=e,this.type=n,this.prev=a,this.info=i,null!=r&&(this.align=r)}function h(t,e){for(var n=t.localVars;n;n=n.next)if(n.name==e)return!0}function k(t,e){if(/[a-z]/.test(e.charAt(0)))return!1;for(var n=t.importedtypes.length,r=0;r<n;r++)if(t.importedtypes[r]==e)return!0}function x(t){for(var e=w.state,n=e.importedtypes;n;n=n.next)if(n.name==t)return;e.importedtypes={name:t,next:e.importedtypes}}var w={state:null,marked:null,cc:null};function g(){for(var t=arguments.length-1;t>=0;t--)w.cc.push(arguments[t])}function A(){return g.apply(null,arguments),!0}function V(t,e){for(var n=e;n;n=n.next)if(n.name==t)return!0;return!1}function S(t){var e=w.state;if(e.context){if(w.marked="def",V(t,e.localVars))return;e.localVars={name:t,next:e.localVars}}else if(e.globalVars){if(V(t,e.globalVars))return;e.globalVars={name:t,next:e.globalVars}}}var W={name:"this",next:null};function z(){w.state.context||(w.state.localVars=W),w.state.context={prev:w.state.context,vars:w.state.localVars}}function T(){w.state.localVars=w.state.context.vars,w.state.context=w.state.context.prev}function E(t,e){var n=function(){var n=w.state;n.lexical=new b(n.indented,w.stream.column(),t,null,n.lexical,e)};return n.lex=!0,n}function D(){var t=w.state;t.lexical.prev&&(")"==t.lexical.type&&(t.indented=t.lexical.indented),t.lexical=t.lexical.prev)}function O(t){return function e(n){return n==t?A():";"==t?g():A(e)}}function Z(t){return"@"==t?A($):"var"==t?A(E("vardef"),K,O(";"),D):"keyword a"==t?A(E("form"),P,Z,D):"keyword b"==t?A(E("form"),Z,D):"{"==t?A(E("}"),z,J,D,T):";"==t?A():"attribute"==t?A(N):"function"==t?A(R):"for"==t?A(E("form"),O("("),E(")"),M,O(")"),D,Z,D):"variable"==t?A(E("stat"),q):"switch"==t?A(E("form"),P,E("}","switch"),O("{"),J,D,D):"case"==t?A(P,O(":")):"default"==t?A(O(":")):"catch"==t?A(E("form"),z,O("("),tt,O(")"),Z,D,T):"import"==t?A(F,O(";")):"typedef"==t?A(j):g(E("stat"),P,O(";"),D)}function P(t){return y.hasOwnProperty(t)||"type"==t?A(I):"function"==t?A(R):"keyword c"==t?A(_):"("==t?A(E(")"),_,O(")"),D,I):"operator"==t?A(P):"["==t?A(E("]"),H(_,"]"),D,I):"{"==t?A(E("}"),H(G,"}"),D,I):A()}function _(t){return t.match(/[;\}\)\],]/)?g():g(P)}function I(t,e){return"operator"==t&&/\+\+|--/.test(e)?A(I):"operator"==t||":"==t?A(P):";"!=t?"("==t?A(E(")"),H(P,")"),D,I):"."==t?A(C,I):"["==t?A(E("]"),P,O("]"),D,I):void 0:void 0}function N(t){return"attribute"==t?A(N):"function"==t?A(R):"var"==t?A(K):void 0}function $(t){return":"==t||"variable"==t?A($):"("==t?A(E(")"),H(B,")"),D,Z):void 0}function B(t){if("variable"==t)return A()}function F(t,e){return"variable"==t&&/[A-Z]/.test(e.charAt(0))?(x(e),A()):"variable"==t||"property"==t||"."==t||"*"==e?A(F):void 0}function j(t,e){return"variable"==t&&/[A-Z]/.test(e.charAt(0))?(x(e),A()):"type"==t&&/[A-Z]/.test(e.charAt(0))?A():void 0}function q(t){return":"==t?A(D,Z):g(I,O(";"),D)}function C(t){if("variable"==t)return w.marked="property",A()}function G(t){if("variable"==t&&(w.marked="property"),y.hasOwnProperty(t))return A(O(":"),P)}function H(t,e){function n(r){return","==r?A(t,n):r==e?A():A(O(e))}return function(r){return r==e?A():g(t,n)}}function J(t){return"}"==t?A():g(Z,J)}function K(t,e){return"variable"==t?(S(e),A(U,L)):A()}function L(t,e){return"="==e?A(P,L):","==t?A(K):void 0}function M(t,e){return"variable"==t?(S(e),A(Q,P)):g()}function Q(t,e){if("in"==e)return A()}function R(t,e){return"variable"==t||"type"==t?(S(e),A(R)):"new"==e?A(R):"("==t?A(E(")"),z,H(tt,")"),D,U,Z,T):void 0}function U(t){if(":"==t)return A(X)}function X(t){return"type"==t||"variable"==t?A():"{"==t?A(E("}"),H(Y,"}"),D):void 0}function Y(t){if("variable"==t)return A(U)}function tt(t,e){if("variable"==t)return S(e),A(U)}T.lex=!0,D.lex=!0;const et={name:"haxe",startState:function(t){return{tokenize:m,reAllowed:!0,kwAllowed:!0,cc:[],lexical:new b(-t,0,"block",!1),importedtypes:["Int","Float","String","Void","Std","Bool","Dynamic","Array"],context:null,indented:0}},token:function(t,n){if(t.sol()&&(n.lexical.hasOwnProperty("align")||(n.lexical.align=!1),n.indented=t.indentation()),t.eatSpace())return null;var r=n.tokenize(t,n);return"comment"==u?r:(n.reAllowed=!("operator"!=u&&"keyword c"!=u&&!u.match(/^[\[{}\(,;:]$/)),n.kwAllowed="."!=u,function(t,e,n,r,a){var i=t.cc;for(w.state=t,w.stream=a,w.marked=null,w.cc=i,t.lexical.hasOwnProperty("align")||(t.lexical.align=!0);;)if((i.length?i.pop():Z)(n,r)){for(;i.length&&i[i.length-1].lex;)i.pop()();return w.marked?w.marked:"variable"==n&&h(t,r)?"variableName.local":"variable"==n&&k(t,r)?"variableName.special":e}}(n,r,u,e,t))},indent:function(t,e,n){if(t.tokenize!=m)return 0;var r=e&&e.charAt(0),a=t.lexical;"stat"==a.type&&"}"==r&&(a=a.prev);var i=a.type,o=r==i;return"vardef"==i?a.indented+4:"form"==i&&"{"==r?a.indented:"stat"==i||"form"==i?a.indented+n.unit:"switch"!=a.info||o?a.align?a.column+(o?0:1):a.indented+(o?0:n.unit):a.indented+(/^(?:case|default)\b/.test(e)?n.unit:2*n.unit)},languageData:{indentOnInput:/^\s*[{}]$/,commentTokens:{line:"//",block:{open:"/*",close:"*/"}}}},nt={name:"hxml",startState:function(){return{define:!1,inString:!1}},token:function(t,e){var n=t.peek(),r=t.sol();if("#"==n)return t.skipToEnd(),"comment";if(r&&"-"==n){var a="variable-2";return t.eat(/-/),"-"==t.peek()&&(t.eat(/-/),a="keyword a"),"D"==t.peek()&&(t.eat(/[D]/),a="keyword c",e.define=!0),t.eatWhile(/[A-Z]/i),a}n=t.peek();return 0==e.inString&&"'"==n&&(e.inString=!0,t.next()),1==e.inString?(t.skipTo("'")||t.skipToEnd(),"'"==t.peek()&&(t.next(),e.inString=!1),"string"):(t.next(),null)},languageData:{commentTokens:{line:"#"}}};export{et as haxe,nt as hxml};
