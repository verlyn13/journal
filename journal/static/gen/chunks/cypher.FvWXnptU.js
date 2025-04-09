
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 8:30:46 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

var e,t=function(e){return new RegExp("^(?:"+e.join("|")+")$","i")},n=function(t){e=null;var n=t.next();if('"'===n)return t.match(/^.*?"/),"string";if("'"===n)return t.match(/^.*?'/),"string";if(/[{}\(\),\.;\[\]]/.test(n))return e=n,"punctuation";if("/"===n&&t.eat("/"))return t.skipToEnd(),"comment";if(c.test(n))return t.eatWhile(c),null;if(t.eatWhile(/[_\w\d]/),t.eat(":"))return t.eatWhile(/[\w\d_\-]/),"atom";var r=t.current();return o.test(r)?"builtin":i.test(r)?"def":s.test(r)||l.test(r)?"keyword":"variable"},r=function(e,t,n){return e.context={prev:e.context,indent:e.indent,col:n,type:t}},a=function(e){return e.indent=e.context.indent,e.context=e.context.prev},o=t(["abs","acos","allShortestPaths","asin","atan","atan2","avg","ceil","coalesce","collect","cos","cot","count","degrees","e","endnode","exp","extract","filter","floor","haversin","head","id","keys","labels","last","left","length","log","log10","lower","ltrim","max","min","node","nodes","percentileCont","percentileDisc","pi","radians","rand","range","reduce","rel","relationship","relationships","replace","reverse","right","round","rtrim","shortestPath","sign","sin","size","split","sqrt","startnode","stdev","stdevp","str","substring","sum","tail","tan","timestamp","toFloat","toInt","toString","trim","type","upper"]),i=t(["all","and","any","contains","exists","has","in","none","not","or","single","xor"]),s=t(["as","asc","ascending","assert","by","case","commit","constraint","create","csv","cypher","delete","desc","descending","detach","distinct","drop","else","end","ends","explain","false","fieldterminator","foreach","from","headers","in","index","is","join","limit","load","match","merge","null","on","optional","order","periodic","profile","remove","return","scan","set","skip","start","starts","then","true","union","unique","unwind","using","when","where","with","call","yield"]),l=t(["access","active","assign","all","alter","as","catalog","change","copy","create","constraint","constraints","current","database","databases","dbms","default","deny","drop","element","elements","exists","from","grant","graph","graphs","if","index","indexes","label","labels","management","match","name","names","new","node","nodes","not","of","on","or","password","populated","privileges","property","read","relationship","relationships","remove","replace","required","revoke","role","roles","set","show","start","status","stop","suspended","to","traverse","type","types","user","users","with","write"]),c=/[*+\-<>=&|~%^]/;const d={name:"cypher",startState:function(){return{tokenize:n,context:null,indent:0,col:0}},token:function(t,n){if(t.sol()&&(n.context&&null==n.context.align&&(n.context.align=!1),n.indent=t.indentation()),t.eatSpace())return null;var o=n.tokenize(t,n);if("comment"!==o&&n.context&&null==n.context.align&&"pattern"!==n.context.type&&(n.context.align=!0),"("===e)r(n,")",t.column());else if("["===e)r(n,"]",t.column());else if("{"===e)r(n,"}",t.column());else if(/[\]\}\)]/.test(e)){for(;n.context&&"pattern"===n.context.type;)a(n);n.context&&e===n.context.type&&a(n)}else"."===e&&n.context&&"pattern"===n.context.type?a(n):/atom|string|variable/.test(o)&&n.context&&(/[\}\]]/.test(n.context.type)?r(n,"pattern",t.column()):"pattern"!==n.context.type||n.context.align||(n.context.align=!0,n.context.col=t.column()));return o},indent:function(e,t,n){var r=t&&t.charAt(0),a=e.context;if(/[\]\}]/.test(r))for(;a&&"pattern"===a.type;)a=a.prev;var o=a&&r===a.type;return a?"keywords"===a.type?null:a.align?a.col+(o?0:1):a.indent+(o?0:n.unit):0}};export{d as cypher};
