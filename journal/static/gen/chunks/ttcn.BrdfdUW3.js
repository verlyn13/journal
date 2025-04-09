
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 9:44:11 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

function e(e){for(var t={},n=e.split(" "),r=0;r<n.length;++r)t[n[r]]=!0;return t}const t={keywords:e("activate address alive all alt altstep and and4b any break case component const continue control deactivate display do else encode enumerated except exception execute extends extension external for from function goto group if import in infinity inout interleave label language length log match message mixed mod modifies module modulepar mtc noblock not not4b nowait of on optional or or4b out override param pattern port procedure record recursive rem repeat return runs select self sender set signature system template testcase to type union value valueof var variant while with xor xor4b"),builtin:e("bit2hex bit2int bit2oct bit2str char2int char2oct encvalue decomp decvalue float2int float2str hex2bit hex2int hex2oct hex2str int2bit int2char int2float int2hex int2oct int2str int2unichar isbound ischosen ispresent isvalue lengthof log2str oct2bit oct2char oct2hex oct2int oct2str regexp replace rnd sizeof str2bit str2float str2hex str2int str2oct substr unichar2int unichar2char enum2int"),types:e("anytype bitstring boolean char charstring default float hexstring integer objid octetstring universal verdicttype timer"),timerOps:e("read running start stop timeout"),portOps:e("call catch check clear getcall getreply halt raise receive reply send trigger"),configOps:e("create connect disconnect done kill killed map unmap"),verdictOps:e("getverdict setverdict"),sutOps:e("action"),functionOps:e("apply derefers refers"),verdictConsts:e("error fail inconc none pass"),booleanConsts:e("true false"),otherConsts:e("null NULL omit"),visibilityModifiers:e("private public friend"),templateMatch:e("complement ifpresent subset superset permutation")};var n=[];function r(e){if(e)for(var t in e)e.hasOwnProperty(t)&&n.push(t)}r(t.keywords),r(t.builtin),r(t.timerOps),r(t.portOps);var i,o=t.keywords||{},a=t.builtin||{},s=t.timerOps||{},l=t.portOps||{},c=t.configOps||{},p=t.verdictOps||{},u=t.sutOps||{},m=t.functionOps||{},f=t.verdictConsts||{},d=t.booleanConsts||{},b=t.otherConsts||{},h=t.types||{},y=t.visibilityModifiers||{},v=t.templateMatch||{},x=!1!==t.indentStatements,g=/[+\-*&@=<>!\/]/;function k(e,t){var n,r=e.next();if('"'==r||"'"==r)return t.tokenize=(n=r,function(e,t){for(var r,i=!1,o=!1;null!=(r=e.next());){if(r==n&&!i){var a=e.peek();a&&("b"!=(a=a.toLowerCase())&&"h"!=a&&"o"!=a||e.next()),o=!0;break}i=!i&&"\\"==r}return o&&(t.tokenize=null),"string"}),t.tokenize(e,t);if(/[\[\]{}\(\),;\\:\?\.]/.test(r))return i=r,"punctuation";if("#"==r)return e.skipToEnd(),"atom";if("%"==r)return e.eatWhile(/\b/),"atom";if(/\d/.test(r))return e.eatWhile(/[\w\.]/),"number";if("/"==r){if(e.eat("*"))return t.tokenize=O,O(e,t);if(e.eat("/"))return e.skipToEnd(),"comment"}if(g.test(r))return"@"==r&&(e.match("try")||e.match("catch")||e.match("lazy"))?"keyword":(e.eatWhile(g),"operator");e.eatWhile(/[\w\$_\xa1-\uffff]/);var x=e.current();return o.propertyIsEnumerable(x)?"keyword":a.propertyIsEnumerable(x)?"builtin":s.propertyIsEnumerable(x)||c.propertyIsEnumerable(x)||p.propertyIsEnumerable(x)||l.propertyIsEnumerable(x)||u.propertyIsEnumerable(x)||m.propertyIsEnumerable(x)?"def":f.propertyIsEnumerable(x)||d.propertyIsEnumerable(x)||b.propertyIsEnumerable(x)?"string":h.propertyIsEnumerable(x)?"typeName.standard":y.propertyIsEnumerable(x)?"modifier":v.propertyIsEnumerable(x)?"atom":"variable"}function O(e,t){for(var n,r=!1;n=e.next();){if("/"==n&&r){t.tokenize=null;break}r="*"==n}return"comment"}function E(e,t,n,r,i){this.indented=e,this.column=t,this.type=n,this.align=r,this.prev=i}function w(e,t,n){var r=e.indented;return e.context&&"statement"==e.context.type&&(r=e.context.indented),e.context=new E(r,t,n,null,e.context)}function I(e){var t=e.context.type;return")"!=t&&"]"!=t&&"}"!=t||(e.indented=e.context.indented),e.context=e.context.prev}const z={name:"ttcn",startState:function(){return{tokenize:null,context:new E(0,0,"top",!1),indented:0,startOfLine:!0}},token:function(e,t){var n=t.context;if(e.sol()&&(null==n.align&&(n.align=!1),t.indented=e.indentation(),t.startOfLine=!0),e.eatSpace())return null;i=null;var r=(t.tokenize||k)(e,t);if("comment"==r)return r;if(null==n.align&&(n.align=!0),";"!=i&&":"!=i&&","!=i||"statement"!=n.type)if("{"==i)w(t,e.column(),"}");else if("["==i)w(t,e.column(),"]");else if("("==i)w(t,e.column(),")");else if("}"==i){for(;"statement"==n.type;)n=I(t);for("}"==n.type&&(n=I(t));"statement"==n.type;)n=I(t)}else i==n.type?I(t):x&&(("}"==n.type||"top"==n.type)&&";"!=i||"statement"==n.type&&"newstatement"==i)&&w(t,e.column(),"statement");else I(t);return t.startOfLine=!1,r},languageData:{indentOnInput:/^\s*[{}]$/,commentTokens:{line:"//",block:{open:"/*",close:"*/"}},autocomplete:n}};export{z as ttcn};
