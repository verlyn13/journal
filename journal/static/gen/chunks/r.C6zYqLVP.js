
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 9:51:49 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

function t(t){for(var e={},n=0;n<t.length;++n)e[t[n]]=!0;return e}var e,n=["NULL","NA","Inf","NaN","NA_integer_","NA_real_","NA_complex_","NA_character_","TRUE","FALSE"],r=["list","quote","bquote","eval","return","call","parse","deparse"],a=["if","else","repeat","while","function","for","in","next","break"],i=t(n),c=t(r),o=t(a),l=t(["if","else","repeat","while","function","for"]),u=/[+\-*\/^<>=!&|~$:]/;function f(t,n){e=null;var r,a=t.next();if("#"==a)return t.skipToEnd(),"comment";if("0"==a&&t.eat("x"))return t.eatWhile(/[\da-f]/i),"number";if("."==a&&t.eat(/\d/))return t.match(/\d*(?:e[+\-]?\d+)?/),"number";if(/\d/.test(a))return t.match(/\d*(?:\.\d+)?(?:e[+\-]\d+)?L?/),"number";if("'"==a||'"'==a)return n.tokenize=(r=a,function(t,e){if(t.eat("\\")){var n=t.next();return"x"==n?t.match(/^[a-f0-9]{2}/i):("u"==n||"U"==n)&&t.eat("{")&&t.skipTo("}")?t.next():"u"==n?t.match(/^[a-f0-9]{4}/i):"U"==n?t.match(/^[a-f0-9]{8}/i):/[0-7]/.test(n)&&t.match(/^[0-7]{1,2}/),"string.special"}for(var a;null!=(a=t.next());){if(a==r){e.tokenize=f;break}if("\\"==a){t.backUp(1);break}}return"string"}),"string";if("`"==a)return t.match(/[^`]+`/),"string.special";if("."==a&&t.match(/.(?:[.]|\d+)/))return"keyword";if(/[a-zA-Z\.]/.test(a)){t.eatWhile(/[\w\.]/);var s=t.current();return i.propertyIsEnumerable(s)?"atom":o.propertyIsEnumerable(s)?(l.propertyIsEnumerable(s)&&!t.match(/\s*if(\s+|$)/,!1)&&(e="block"),"keyword"):c.propertyIsEnumerable(s)?"builtin":"variable"}return"%"==a?(t.skipTo("%")&&t.next(),"variableName.special"):"<"==a&&t.eat("-")||"<"==a&&t.match("<-")||"-"==a&&t.match(/>>?/)||"="==a&&n.ctx.argList?"operator":u.test(a)?("$"==a||t.eatWhile(u),"operator"):/[\(\){}\[\];]/.test(a)?(e=a,";"==a?"punctuation":null):null}function s(t,e,n){t.ctx={type:e,indent:t.indent,flags:0,column:n.column(),prev:t.ctx}}function p(t,e){var n=t.ctx;t.ctx={type:n.type,indent:n.indent,flags:n.flags|e,column:n.column,prev:n.prev}}function m(t){t.indent=t.ctx.indent,t.ctx=t.ctx.prev}const d={name:"r",startState:function(t){return{tokenize:f,ctx:{type:"top",indent:-t,flags:2},indent:0,afterIdent:!1}},token:function(t,n){if(t.sol()&&(3&n.ctx.flags||(n.ctx.flags|=2),4&n.ctx.flags&&m(n),n.indent=t.indentation()),t.eatSpace())return null;var r=n.tokenize(t,n);return"comment"==r||2&n.ctx.flags||p(n,1),";"!=e&&"{"!=e&&"}"!=e||"block"!=n.ctx.type||m(n),"{"==e?s(n,"}",t):"("==e?(s(n,")",t),n.afterIdent&&(n.ctx.argList=!0)):"["==e?s(n,"]",t):"block"==e?s(n,"block",t):e==n.ctx.type?m(n):"block"==n.ctx.type&&"comment"!=r&&p(n,4),n.afterIdent="variable"==r||"keyword"==r,r},indent:function(t,e,n){if(t.tokenize!=f)return 0;var r=e&&e.charAt(0),a=t.ctx,i=r==a.type;return 4&a.flags&&(a=a.prev),"block"==a.type?a.indent+("{"==r?0:n.unit):1&a.flags?a.column+(i?0:1):a.indent+(i?0:n.unit)},languageData:{wordChars:".",commentTokens:{line:"#"},autocomplete:n.concat(r,a)}};export{d as r};
