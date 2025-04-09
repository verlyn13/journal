
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 9:49:39 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

function e(e,n){for(var t=0;t<e.length;t++)n(e[t],t)}function n(e,n){for(var t=0;t<e.length;t++)if(n(e[t],t))return!0;return!1}var t={unnamedDefinition:["interface"],namedDefinition:["module","library","macro","C-struct","C-union","C-function","C-callable-wrapper"],typeParameterizedDefinition:["class","C-subtype","C-mapped-subtype"],otherParameterizedDefinition:["method","function","C-variable","C-address"],constantSimpleDefinition:["constant"],variableSimpleDefinition:["variable"],otherSimpleDefinition:["generic","domain","C-pointer-type","table"],statement:["if","block","begin","method","case","for","select","when","unless","until","while","iterate","profiling","dynamic-bind"],separator:["finally","exception","cleanup","else","elseif","afterwards"],other:["above","below","by","from","handler","in","instance","let","local","otherwise","slot","subclass","then","to","keyed-by","virtual"],signalingCalls:["signal","error","cerror","break","check-type","abort"]};t.otherDefinition=t.unnamedDefinition.concat(t.namedDefinition).concat(t.otherParameterizedDefinition),t.definition=t.typeParameterizedDefinition.concat(t.otherDefinition),t.parameterizedDefinition=t.typeParameterizedDefinition.concat(t.otherParameterizedDefinition),t.simpleDefinition=t.constantSimpleDefinition.concat(t.variableSimpleDefinition).concat(t.otherSimpleDefinition),t.keyword=t.statement.concat(t.separator).concat(t.other);var i="[-_a-zA-Z?!*@<>$%]+",r=new RegExp("^"+i),a={symbolKeyword:i+":",symbolClass:"<"+i+">",symbolGlobal:"\\*"+i+"\\*",symbolConstant:"\\$"+i},o={symbolKeyword:"atom",symbolClass:"tag",symbolGlobal:"variableName.standard",symbolConstant:"variableName.constant"};for(var l in a)a.hasOwnProperty(l)&&(a[l]=new RegExp("^"+a[l]));a.keyword=[/^with(?:out)?-[-_a-zA-Z?!*@<>$%]+/];var f={keyword:"keyword",definition:"def",simpleDefinition:"def",signalingCalls:"builtin"},c={},s={};function u(e,n,t){return n.tokenize=t,t(e,n)}function m(e,t){var i=e.peek();if("'"==i||'"'==i)return e.next(),u(e,t,p(i,"string"));if("/"==i){if(e.next(),e.eat("*"))return u(e,t,d);if(e.eat("/"))return e.skipToEnd(),"comment";e.backUp(1)}else if(/[+\-\d\.]/.test(i)){if(e.match(/^[+-]?[0-9]*\.[0-9]*([esdx][+-]?[0-9]+)?/i)||e.match(/^[+-]?[0-9]+([esdx][+-]?[0-9]+)/i)||e.match(/^[+-]?\d+/))return"number"}else{if("#"==i)return e.next(),'"'==(i=e.peek())?(e.next(),u(e,t,p('"',"string"))):"b"==i?(e.next(),e.eatWhile(/[01]/),"number"):"x"==i?(e.next(),e.eatWhile(/[\da-f]/i),"number"):"o"==i?(e.next(),e.eatWhile(/[0-7]/),"number"):"#"==i?(e.next(),"punctuation"):"["==i||"("==i?(e.next(),"bracket"):e.match(/f|t|all-keys|include|key|next|rest/i)?"atom":(e.eatWhile(/[-a-zA-Z]/),"error");if("~"==i)return e.next(),"="==(i=e.peek())?(e.next(),"="==(i=e.peek())?(e.next(),"operator"):"operator"):"operator";if(":"==i){if(e.next(),"="==(i=e.peek()))return e.next(),"operator";if(":"==i)return e.next(),"punctuation"}else{if(-1!="[](){}".indexOf(i))return e.next(),"bracket";if(-1!=".,".indexOf(i))return e.next(),"punctuation";if(e.match("end"))return"keyword"}}for(var l in a)if(a.hasOwnProperty(l)){var f=a[l];if(f instanceof Array&&n(f,(function(n){return e.match(n)}))||e.match(f))return o[l]}return/[+\-*\/^=<>&|]/.test(i)?(e.next(),"operator"):e.match("define")?"def":(e.eatWhile(/[\w\-]/),c.hasOwnProperty(e.current())?s[e.current()]:e.current().match(r)?"variable":(e.next(),"variableName.standard"))}function d(e,n){for(var t,i=!1,r=!1,a=0;t=e.next();){if("/"==t&&i){if(!(a>0)){n.tokenize=m;break}a--}else"*"==t&&r&&a++;i="*"==t,r="/"==t}return"comment"}function p(e,n){return function(t,i){for(var r,a=!1,o=!1;null!=(r=t.next());){if(r==e&&!a){o=!0;break}a=!a&&"\\"==r}return!o&&a||(i.tokenize=m),n}}e(["keyword","definition","simpleDefinition","signalingCalls"],(function(n){e(t[n],(function(e){c[e]=n,s[e]=f[n]}))}));const b={name:"dylan",startState:function(){return{tokenize:m,currentIndent:0}},token:function(e,n){return e.eatSpace()?null:n.tokenize(e,n)},languageData:{commentTokens:{block:{open:"/*",close:"*/"}}}};export{b as dylan};
