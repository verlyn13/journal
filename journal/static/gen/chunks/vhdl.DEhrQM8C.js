
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 10:20:42 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

function e(e){for(var t={},n=e.split(","),r=0;r<n.length;++r){var i=n[r].toUpperCase(),o=n[r].charAt(0).toUpperCase()+n[r].slice(1);t[n[r]]=!0,t[i]=!0,t[o]=!0}return t}function t(e){return e.eatWhile(/[\w\$_]/),"meta"}var n,r=e("null"),i={"`":t,$:t},o=e("abs,access,after,alias,all,and,architecture,array,assert,attribute,begin,block,body,buffer,bus,case,component,configuration,constant,disconnect,downto,else,elsif,end,end block,end case,end component,end for,end generate,end if,end loop,end process,end record,end units,entity,exit,file,for,function,generate,generic,generic map,group,guarded,if,impure,in,inertial,inout,is,label,library,linkage,literal,loop,map,mod,nand,new,next,nor,null,of,on,open,or,others,out,package,package body,port,port map,postponed,procedure,process,pure,range,record,register,reject,rem,report,return,rol,ror,select,severity,signal,sla,sll,sra,srl,subtype,then,to,transport,type,unaffected,units,until,use,variable,wait,when,while,with,xnor,xor"),a=e("architecture,entity,begin,case,port,else,elsif,end,for,function,if"),l=/[&|~><!\)\(*#%@+\/=?\:;}{,\.\^\-\[\]]/;function u(e,t){var s,c=e.next();if(i[c]){var p=i[c](e,t);if(!1!==p)return p}if('"'==c)return t.tokenize=(s=c,function(e,t){for(var n,r=!1,i=!1;null!=(n=e.next());){if(n==s&&!r){i=!0;break}r=!r&&"--"==n}return!i&&r||(t.tokenize=u),"string.special"}),t.tokenize(e,t);if("'"==c)return t.tokenize=function(e){return function(t,n){for(var r,i=!1,o=!1;null!=(r=t.next());){if(r==e&&!i){o=!0;break}i=!i&&"--"==r}return!o&&i||(n.tokenize=u),"string"}}(c),t.tokenize(e,t);if(/[\[\]{}\(\),;\:\.]/.test(c))return n=c,null;if(/[\d']/.test(c))return e.eatWhile(/[\w\.']/),"number";if("-"==c&&e.eat("-"))return e.skipToEnd(),"comment";if(l.test(c))return e.eatWhile(l),"operator";e.eatWhile(/[\w\$_]/);var f=e.current();return o.propertyIsEnumerable(f.toLowerCase())?(a.propertyIsEnumerable(f)&&(n="newstatement"),"keyword"):r.propertyIsEnumerable(f)?"atom":"variable"}function s(e,t,n,r,i){this.indented=e,this.column=t,this.type=n,this.align=r,this.prev=i}function c(e,t,n){return e.context=new s(e.indented,t,n,null,e.context)}function p(e){var t=e.context.type;return")"!=t&&"]"!=t&&"}"!=t||(e.indented=e.context.indented),e.context=e.context.prev}const f={name:"vhdl",startState:function(e){return{tokenize:null,context:new s(-e,0,"top",!1),indented:0,startOfLine:!0}},token:function(e,t){var r=t.context;if(e.sol()&&(null==r.align&&(r.align=!1),t.indented=e.indentation(),t.startOfLine=!0),e.eatSpace())return null;n=null;var i=(t.tokenize||u)(e,t);if("comment"==i||"meta"==i)return i;if(null==r.align&&(r.align=!0),";"!=n&&":"!=n||"statement"!=r.type)if("{"==n)c(t,e.column(),"}");else if("["==n)c(t,e.column(),"]");else if("("==n)c(t,e.column(),")");else if("}"==n){for(;"statement"==r.type;)r=p(t);for("}"==r.type&&(r=p(t));"statement"==r.type;)r=p(t)}else n==r.type?p(t):("}"==r.type||"top"==r.type||"statement"==r.type&&"newstatement"==n)&&c(t,e.column(),"statement");else p(t);return t.startOfLine=!1,i},indent:function(e,t,n){if(e.tokenize!=u&&null!=e.tokenize)return 0;var r=t&&t.charAt(0),i=e.context,o=r==i.type;return"statement"==i.type?i.indented+("{"==r?0:n.unit):i.align?i.column+(o?0:1):i.indented+(o?0:n.unit)},languageData:{indentOnInput:/^\s*[{}]$/,commentTokens:{line:"--"}}};export{f as vhdl};
