
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 10:25:04 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

var t={};function e(e,n){for(var r=0;r<n.length;r++)t[n[r]]=e}var n=["true","false"],r=["if","then","do","else","elif","while","until","for","in","esac","fi","fin","fil","done","exit","set","unset","export","function"],s=["ab","awk","bash","beep","cat","cc","cd","chown","chmod","chroot","clear","cp","curl","cut","diff","echo","find","gawk","gcc","get","git","grep","hg","kill","killall","ln","ls","make","mkdir","openssl","mv","nc","nl","node","npm","ping","ps","restart","rm","rmdir","sed","service","sh","shopt","shred","source","sort","sleep","ssh","start","stop","su","sudo","svn","tee","telnet","top","touch","vi","vim","wall","wc","wget","who","write","yes","zsh"];function i(e,n){if(e.eatSpace())return null;var r,s=e.sol(),i=e.next();if("\\"===i)return e.next(),null;if("'"===i||'"'===i||"`"===i)return n.tokens.unshift(o(i,"`"===i?"quote":"string")),f(e,n);if("#"===i)return s&&e.eat("!")?(e.skipToEnd(),"meta"):(e.skipToEnd(),"comment");if("$"===i)return n.tokens.unshift(a),f(e,n);if("+"===i||"="===i)return"operator";if("-"===i)return e.eat("-"),e.eatWhile(/\w/),"attribute";if("<"==i){if(e.match("<<"))return"operator";var u=e.match(/^<-?\s*(?:['"]([^'"]*)['"]|([^'"\s]*))/);if(u)return n.tokens.unshift((r=u[1]||u[2],function(t,e){return t.sol()&&t.string==r&&e.tokens.shift(),t.skipToEnd(),"string.special"})),"string.special"}if(/\d/.test(i)&&(e.eatWhile(/\d/),e.eol()||!/\w/.test(e.peek())))return"number";e.eatWhile(/[\w-]/);var c=e.current();return"="===e.peek()&&/\w+/.test(c)?"def":t.hasOwnProperty(c)?t[c]:null}function o(t,e){var n="("==t?")":"{"==t?"}":t;return function(r,s){for(var i,c=!1;null!=(i=r.next());){if(i===n&&!c){s.tokens.shift();break}if("$"===i&&!c&&"'"!==t&&r.peek()!=n){c=!0,r.backUp(1),s.tokens.unshift(a);break}if(!c&&t!==n&&i===t)return s.tokens.unshift(o(t,e)),f(r,s);if(!c&&/['"]/.test(i)&&!/['"]/.test(t)){s.tokens.unshift(u(i,"string")),r.backUp(1);break}c=!c&&"\\"===i}return e}}function u(t,e){return function(n,r){return r.tokens[0]=o(t,e),n.next(),f(n,r)}}e("atom",n),e("keyword",r),e("builtin",s);var a=function(t,e){e.tokens.length>1&&t.eat("$");var n=t.next();return/['"({]/.test(n)?(e.tokens[0]=o(n,"("==n?"quote":"{"==n?"def":"string"),f(t,e)):(/\d/.test(n)||t.eatWhile(/\w/),e.tokens.shift(),"def")};function f(t,e){return(e.tokens[0]||i)(t,e)}const c={name:"shell",startState:function(){return{tokens:[]}},token:function(t,e){return f(t,e)},languageData:{autocomplete:n.concat(r,s),closeBrackets:{brackets:["(","[","{","'",'"',"`"]},commentTokens:{line:"#"}}};export{c as shell};
