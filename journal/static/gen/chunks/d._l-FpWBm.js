
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 9:49:39 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

function e(e){for(var t={},n=e.split(" "),r=0;r<n.length;++r)t[n[r]]=!0;return t}var t="body catch class do else enum for foreach foreach_reverse if in interface mixin out scope struct switch try union unittest version while with";const n={keywords:e("abstract alias align asm assert auto break case cast cdouble cent cfloat const continue debug default delegate delete deprecated export extern final finally function goto immutable import inout invariant is lazy macro module new nothrow override package pragma private protected public pure ref return shared short static super synchronized template this throw typedef typeid typeof volatile __FILE__ __LINE__ __gshared __traits __vector __parameters "+t),blockKeywords:e(t),builtin:e("bool byte char creal dchar double float idouble ifloat int ireal long real short ubyte ucent uint ulong ushort wchar wstring void size_t sizediff_t"),atoms:e("exit failure success true false null"),hooks:{"@":function(e,t){return e.eatWhile(/[\w\$_]/),"meta"}}};var r,i=n.statementIndentUnit,o=n.keywords,a=n.builtin,l=n.blockKeywords,u=n.atoms,s=n.hooks,c=n.multiLineStrings,f=/[+\-*&%=<>!?|\/]/;function d(e,t){var n,i=e.next();if(s[i]){var d=s[i](e,t);if(!1!==d)return d}if('"'==i||"'"==i||"`"==i)return t.tokenize=(n=i,function(e,t){for(var r,i=!1,o=!1;null!=(r=e.next());){if(r==n&&!i){o=!0;break}i=!i&&"\\"==r}return(o||!i&&!c)&&(t.tokenize=null),"string"}),t.tokenize(e,t);if(/[\[\]{}\(\),;\:\.]/.test(i))return r=i,null;if(/\d/.test(i))return e.eatWhile(/[\w\.]/),"number";if("/"==i){if(e.eat("+"))return t.tokenize=p,p(e,t);if(e.eat("*"))return t.tokenize=m,m(e,t);if(e.eat("/"))return e.skipToEnd(),"comment"}if(f.test(i))return e.eatWhile(f),"operator";e.eatWhile(/[\w\$_\xa1-\uffff]/);var y=e.current();return o.propertyIsEnumerable(y)?(l.propertyIsEnumerable(y)&&(r="newstatement"),"keyword"):a.propertyIsEnumerable(y)?(l.propertyIsEnumerable(y)&&(r="newstatement"),"builtin"):u.propertyIsEnumerable(y)?"atom":"variable"}function m(e,t){for(var n,r=!1;n=e.next();){if("/"==n&&r){t.tokenize=null;break}r="*"==n}return"comment"}function p(e,t){for(var n,r=!1;n=e.next();){if("/"==n&&r){t.tokenize=null;break}r="+"==n}return"comment"}function y(e,t,n,r,i){this.indented=e,this.column=t,this.type=n,this.align=r,this.prev=i}function h(e,t,n){var r=e.indented;return e.context&&"statement"==e.context.type&&(r=e.context.indented),e.context=new y(r,t,n,null,e.context)}function b(e){var t=e.context.type;return")"!=t&&"]"!=t&&"}"!=t||(e.indented=e.context.indented),e.context=e.context.prev}const k={name:"d",startState:function(e){return{tokenize:null,context:new y(-e,0,"top",!1),indented:0,startOfLine:!0}},token:function(e,t){var n=t.context;if(e.sol()&&(null==n.align&&(n.align=!1),t.indented=e.indentation(),t.startOfLine=!0),e.eatSpace())return null;r=null;var i=(t.tokenize||d)(e,t);if("comment"==i||"meta"==i)return i;if(null==n.align&&(n.align=!0),";"!=r&&":"!=r&&","!=r||"statement"!=n.type)if("{"==r)h(t,e.column(),"}");else if("["==r)h(t,e.column(),"]");else if("("==r)h(t,e.column(),")");else if("}"==r){for(;"statement"==n.type;)n=b(t);for("}"==n.type&&(n=b(t));"statement"==n.type;)n=b(t)}else r==n.type?b(t):(("}"==n.type||"top"==n.type)&&";"!=r||"statement"==n.type&&"newstatement"==r)&&h(t,e.column(),"statement");else b(t);return t.startOfLine=!1,i},indent:function(e,t,n){if(e.tokenize!=d&&null!=e.tokenize)return null;var r=e.context,o=t&&t.charAt(0);"statement"==r.type&&"}"==o&&(r=r.prev);var a=o==r.type;return"statement"==r.type?r.indented+("{"==o?0:i||n.unit):r.align?r.column+(a?0:1):r.indented+(a?0:n.unit)},languageData:{indentOnInput:/^\s*[{}]$/,commentTokens:{line:"//",block:{open:"/*",close:"*/"}}}};export{k as d};
