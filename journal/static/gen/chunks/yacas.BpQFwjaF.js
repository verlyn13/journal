
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 2:29:10 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

var e=function(e){for(var t={},n=e.split(" "),r=0;r<n.length;++r)t[n[r]]=!0;return t}("Assert BackQuote D Defun Deriv For ForEach FromFile FromString Function Integrate InverseTaylor Limit LocalSymbols Macro MacroRule MacroRulePattern NIntegrate Rule RulePattern Subst TD TExplicitSum TSum Taylor Taylor1 Taylor2 Taylor3 ToFile ToStdout ToString TraceRule Until While"),t="(?:[a-zA-Z\\$'][a-zA-Z0-9\\$']*)",n=new RegExp("(?:(?:\\.\\d+|\\d+\\.\\d*|\\d+)(?:[eE][+-]?\\d+)?)"),r=new RegExp(t),o=new RegExp(t+"?_"+t),a=new RegExp(t+"\\s*\\(");function i(t,i){var s;if('"'===(s=t.next()))return i.tokenize=c,i.tokenize(t,i);if("/"===s){if(t.eat("*"))return i.tokenize=u,i.tokenize(t,i);if(t.eat("/"))return t.skipToEnd(),"comment"}t.backUp(1);var p=t.match(/^(\w+)\s*\(/,!1);null!==p&&e.hasOwnProperty(p[1])&&i.scopes.push("bodied");var m=l(i);if("bodied"===m&&"["===s&&i.scopes.pop(),"["!==s&&"{"!==s&&"("!==s||i.scopes.push(s),("["===(m=l(i))&&"]"===s||"{"===m&&"}"===s||"("===m&&")"===s)&&i.scopes.pop(),";"===s)for(;"bodied"===m;)i.scopes.pop(),m=l(i);return t.match(/\d+ *#/,!0,!1)?"qualifier":t.match(n,!0,!1)?"number":t.match(o,!0,!1)?"variableName.special":t.match(/(?:\[|\]|{|}|\(|\))/,!0,!1)?"bracket":t.match(a,!0,!1)?(t.backUp(1),"variableName.function"):t.match(r,!0,!1)?"variable":t.match(/(?:\\|\+|\-|\*|\/|,|;|\.|:|@|~|=|>|<|&|\||_|`|'|\^|\?|!|%|#)/,!0,!1)?"operator":"error"}function c(e,t){for(var n,r=!1,o=!1;null!=(n=e.next());){if('"'===n&&!o){r=!0;break}o=!o&&"\\"===n}return r&&!o&&(t.tokenize=i),"string"}function u(e,t){for(var n,r;null!=(r=e.next());){if("*"===n&&"/"===r){t.tokenize=i;break}n=r}return"comment"}function l(e){var t=null;return e.scopes.length>0&&(t=e.scopes[e.scopes.length-1]),t}const s={name:"yacas",startState:function(){return{tokenize:i,scopes:[]}},token:function(e,t){return e.eatSpace()?null:t.tokenize(e,t)},indent:function(e,t,n){if(e.tokenize!==i&&null!==e.tokenize)return null;var r=0;return"]"!==t&&"];"!==t&&"}"!==t&&"};"!==t&&");"!==t||(r=-1),(e.scopes.length+r)*n.unit},languageData:{electricInput:/[{}\[\]()\;]/,commentTokens:{line:"//",block:{open:"/*",close:"*/"}}}};export{s as yacas};
