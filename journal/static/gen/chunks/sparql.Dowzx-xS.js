
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 10:18:28 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

var t;function e(t){return new RegExp("^(?:"+t.join("|")+")$","i")}var n=e(["str","lang","langmatches","datatype","bound","sameterm","isiri","isuri","iri","uri","bnode","count","sum","min","max","avg","sample","group_concat","rand","abs","ceil","floor","round","concat","substr","strlen","replace","ucase","lcase","encode_for_uri","contains","strstarts","strends","strbefore","strafter","year","month","day","hours","minutes","seconds","timezone","tz","now","uuid","struuid","md5","sha1","sha256","sha384","sha512","coalesce","if","strlang","strdt","isnumeric","regex","exists","isblank","isliteral","a","bind"]),r=e(["base","prefix","select","distinct","reduced","construct","describe","ask","from","named","where","order","limit","offset","filter","optional","graph","by","asc","desc","as","having","undef","values","group","minus","in","not","service","silent","using","insert","delete","union","true","false","with","data","copy","to","move","add","create","drop","clear","load","into"]),a=/[*+\-<>=&|\^\/!\?]/,u="[A-Za-z_\\-0-9]",o=new RegExp("[A-Za-z]"),i=new RegExp("(("+u+"|\\.)*("+u+"))?:");function c(e,u){var l,d=e.next();if(t=null,"$"==d||"?"==d)return"?"==d&&e.match(/\s/,!1)?"operator":(e.match(/^[A-Za-z0-9_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][A-Za-z0-9_\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]*/),"variableName.local");if("<"==d&&!e.match(/^[\s\u00a0=]/,!1))return e.match(/^[^\s\u00a0>]*>?/),"atom";if('"'==d||"'"==d)return u.tokenize=(l=d,function(t,e){for(var n,r=!1;null!=(n=t.next());){if(n==l&&!r){e.tokenize=c;break}r=!r&&"\\"==n}return"string"}),u.tokenize(e,u);if(/[{}\(\),\.;\[\]]/.test(d))return t=d,"bracket";if("#"==d)return e.skipToEnd(),"comment";if(a.test(d))return"operator";if(":"==d)return s(e),"atom";if("@"==d)return e.eatWhile(/[a-z\d\-]/i),"meta";if(o.test(d)&&e.match(i))return s(e),"atom";e.eatWhile(/[_\w\d]/);var f=e.current();return n.test(f)?"builtin":r.test(f)?"keyword":"variable"}function s(t){t.match(/(\.(?=[\w_\-\\%])|[:\w_-]|\\[-\\_~.!$&'()*+,;=/?#@%]|%[a-f\d][a-f\d])+/i)}function l(t,e,n){t.context={prev:t.context,indent:t.indent,col:n,type:e}}function d(t){t.indent=t.context.indent,t.context=t.context.prev}const f={name:"sparql",startState:function(){return{tokenize:c,context:null,indent:0,col:0}},token:function(e,n){if(e.sol()&&(n.context&&null==n.context.align&&(n.context.align=!1),n.indent=e.indentation()),e.eatSpace())return null;var r=n.tokenize(e,n);if("comment"!=r&&n.context&&null==n.context.align&&"pattern"!=n.context.type&&(n.context.align=!0),"("==t)l(n,")",e.column());else if("["==t)l(n,"]",e.column());else if("{"==t)l(n,"}",e.column());else if(/[\]\}\)]/.test(t)){for(;n.context&&"pattern"==n.context.type;)d(n);n.context&&t==n.context.type&&(d(n),"}"==t&&n.context&&"pattern"==n.context.type&&d(n))}else"."==t&&n.context&&"pattern"==n.context.type?d(n):/atom|string|variable/.test(r)&&n.context&&(/[\}\]]/.test(n.context.type)?l(n,"pattern",e.column()):"pattern"!=n.context.type||n.context.align||(n.context.align=!0,n.context.col=e.column()));return r},indent:function(t,e,n){var r=e&&e.charAt(0),a=t.context;if(/[\]\}]/.test(r))for(;a&&"pattern"==a.type;)a=a.prev;var u=a&&r==a.type;return a?"pattern"==a.type?a.col:a.align?a.col+(u?0:1):a.indent+(u?0:n.unit):0},languageData:{commentTokens:{line:"#"}}};export{f as sparql};
