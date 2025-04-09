
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 9:43:20 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

var e=function(){function e(e){return{type:e,style:"keyword"}}for(var t=e("operator"),n={type:"atom",style:"atom"},r={type:"axis_specifier",style:"qualifier"},a={",":{type:"punctuation",style:null}},i=["after","all","allowing","ancestor","ancestor-or-self","any","array","as","ascending","at","attribute","base-uri","before","boundary-space","by","case","cast","castable","catch","child","collation","comment","construction","contains","content","context","copy","copy-namespaces","count","decimal-format","declare","default","delete","descendant","descendant-or-self","descending","diacritics","different","distance","document","document-node","element","else","empty","empty-sequence","encoding","end","entire","every","exactly","except","external","first","following","following-sibling","for","from","ftand","ftnot","ft-option","ftor","function","fuzzy","greatest","group","if","import","in","inherit","insensitive","insert","instance","intersect","into","invoke","is","item","language","last","lax","least","let","levels","lowercase","map","modify","module","most","namespace","next","no","node","nodes","no-inherit","no-preserve","not","occurs","of","only","option","order","ordered","ordering","paragraph","paragraphs","parent","phrase","preceding","preceding-sibling","preserve","previous","processing-instruction","relationship","rename","replace","return","revalidation","same","satisfies","schema","schema-attribute","schema-element","score","self","sensitive","sentence","sentences","sequence","skip","sliding","some","stable","start","stemming","stop","strict","strip","switch","text","then","thesaurus","times","to","transform","treat","try","tumbling","type","typeswitch","union","unordered","update","updating","uppercase","using","validate","value","variable","version","weight","when","where","wildcards","window","with","without","word","words","xquery"],o=0,s=i.length;o<s;o++)a[i[o]]=e(i[o]);var c=["xs:anyAtomicType","xs:anySimpleType","xs:anyType","xs:anyURI","xs:base64Binary","xs:boolean","xs:byte","xs:date","xs:dateTime","xs:dateTimeStamp","xs:dayTimeDuration","xs:decimal","xs:double","xs:duration","xs:ENTITIES","xs:ENTITY","xs:float","xs:gDay","xs:gMonth","xs:gMonthDay","xs:gYear","xs:gYearMonth","xs:hexBinary","xs:ID","xs:IDREF","xs:IDREFS","xs:int","xs:integer","xs:item","xs:java","xs:language","xs:long","xs:Name","xs:NCName","xs:negativeInteger","xs:NMTOKEN","xs:NMTOKENS","xs:nonNegativeInteger","xs:nonPositiveInteger","xs:normalizedString","xs:NOTATION","xs:numeric","xs:positiveInteger","xs:precisionDecimal","xs:QName","xs:short","xs:string","xs:time","xs:token","xs:unsignedByte","xs:unsignedInt","xs:unsignedLong","xs:unsignedShort","xs:untyped","xs:untypedAtomic","xs:yearMonthDuration"];for(o=0,s=c.length;o<s;o++)a[c[o]]=n;var u=["eq","ne","lt","le","gt","ge",":=","=",">",">=","<","<=",".","|","?","and","or","div","idiv","mod","*","/","+","-"];for(o=0,s=u.length;o<s;o++)a[u[o]]=t;var l=["self::","attribute::","child::","descendant::","descendant-or-self::","parent::","ancestor::","ancestor-or-self::","following::","preceding::","following-sibling::","preceding-sibling::"];for(o=0,s=l.length;o<s;o++)a[l[o]]=r;return a}();function t(e,t,n){return t.tokenize=n,n(e,t)}function n(f,d){var g=f.next(),y=!1,h=function(e){return'"'===e.current()?e.match(/^[^\"]+\"\:/,!1):"'"===e.current()&&e.match(/^[^\"]+\'\:/,!1)}(f);if("<"==g){if(f.match("!--",!0))return t(f,d,s);if(f.match("![CDATA",!1))return d.tokenize=c,"tag";if(f.match("?",!1))return t(f,d,u);var v=f.eat("/");f.eatSpace();for(var k,b="";k=f.eat(/[^\s\u00a0=<>\"\'\/?]/);)b+=k;return t(f,d,function(e,t){return function(r,a){return r.eatSpace(),t&&r.eat(">")?(x(a),a.tokenize=n,"tag"):(r.eat("/")||m(a,{type:"tag",name:e,tokenize:n}),r.eat(">")?(a.tokenize=n,"tag"):(a.tokenize=o,"tag"))}}(b,v))}if("{"==g)return m(d,{type:"codeblock"}),null;if("}"==g)return x(d),null;if(l(d))return">"==g?"tag":"/"==g&&f.eat(">")?(x(d),"tag"):"variable";if(/\d/.test(g))return f.match(/^\d*(?:\.\d*)?(?:E[+\-]?\d+)?/),"atom";if("("===g&&f.eat(":"))return m(d,{type:"comment"}),t(f,d,r);if(h||'"'!==g&&"'"!==g){if("$"===g)return t(f,d,i);if(":"===g&&f.eat("="))return"keyword";if("("===g)return m(d,{type:"paren"}),null;if(")"===g)return x(d),null;if("["===g)return m(d,{type:"bracket"}),null;if("]"===g)return x(d),null;var z=e.propertyIsEnumerable(g)&&e[g];if(h&&'"'===g)for(;'"'!==f.next(););if(h&&"'"===g)for(;"'"!==f.next(););z||f.eatWhile(/[\w\$_-]/);var w=f.eat(":");!f.eat(":")&&w&&f.eatWhile(/[\w\$_-]/),f.match(/^[ \t]*\(/,!1)&&(y=!0);var I=f.current();return z=e.propertyIsEnumerable(I)&&e[I],y&&!z&&(z={type:"function_call",style:"def"}),function(e){return p(e,"xmlconstructor")}(d)?(x(d),"variable"):("element"!=I&&"attribute"!=I&&"axis_specifier"!=z.type||m(d,{type:"xmlconstructor"}),z?z.style:"variable")}return a(f,d,g)}function r(e,t){for(var n,r=!1,a=!1,i=0;n=e.next();){if(")"==n&&r){if(!(i>0)){x(t);break}i--}else":"==n&&a&&i++;r=":"==n,a="("==n}return"comment"}function a(e,r,a,i){let o=function(e,t){return function(r,a){for(var i;i=r.next();){if(i==e){x(a),t&&(a.tokenize=t);break}if(r.match("{",!1)&&f(a))return m(a,{type:"codeblock"}),a.tokenize=n,"string"}return"string"}}(a,i);return m(r,{type:"string",name:a,tokenize:o}),t(e,r,o)}function i(e,t){var r=/[\w\$_-]/;if(e.eat('"')){for(;'"'!==e.next(););e.eat(":")}else e.eatWhile(r),e.match(":=",!1)||e.eat(":");return e.eatWhile(r),t.tokenize=n,"variable"}function o(e,t){var r=e.next();return"/"==r&&e.eat(">")?(f(t)&&x(t),l(t)&&x(t),"tag"):">"==r?(f(t)&&x(t),"tag"):"="==r?null:'"'==r||"'"==r?a(e,t,r,o):(f(t)||m(t,{type:"attribute",tokenize:o}),e.eat(/[a-zA-Z_:]/),e.eatWhile(/[-a-zA-Z0-9_:.]/),e.eatSpace(),(e.match(">",!1)||e.match("/",!1))&&(x(t),t.tokenize=n),"attribute")}function s(e,t){for(var r;r=e.next();)if("-"==r&&e.match("->",!0))return t.tokenize=n,"comment"}function c(e,t){for(var r;r=e.next();)if("]"==r&&e.match("]",!0))return t.tokenize=n,"comment"}function u(e,t){for(var r;r=e.next();)if("?"==r&&e.match(">",!0))return t.tokenize=n,"processingInstruction"}function l(e){return p(e,"tag")}function f(e){return p(e,"attribute")}function p(e,t){return e.stack.length&&e.stack[e.stack.length-1].type==t}function m(e,t){e.stack.push(t)}function x(e){e.stack.pop();var t=e.stack.length&&e.stack[e.stack.length-1].tokenize;e.tokenize=t||n}const d={name:"xquery",startState:function(){return{tokenize:n,cc:[],stack:[]}},token:function(e,t){return e.eatSpace()?null:t.tokenize(e,t)},languageData:{commentTokens:{block:{open:"(:",close:":)"}}}};export{d as xQuery};
