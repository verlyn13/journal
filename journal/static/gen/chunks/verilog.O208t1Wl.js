
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 9:43:20 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

function e(e){var t=e.statementIndentUnit,n=e.dontAlignCalls,i=e.noIndentKeywords||[],r=e.multiLineStrings,a=e.hooks||{};function o(e){for(var t={},n=e.split(" "),i=0;i<n.length;++i)t[n[i]]=!0;return t}var l,s,c=o("accept_on alias always always_comb always_ff always_latch and assert assign assume automatic before begin bind bins binsof bit break buf bufif0 bufif1 byte case casex casez cell chandle checker class clocking cmos config const constraint context continue cover covergroup coverpoint cross deassign default defparam design disable dist do edge else end endcase endchecker endclass endclocking endconfig endfunction endgenerate endgroup endinterface endmodule endpackage endprimitive endprogram endproperty endspecify endsequence endtable endtask enum event eventually expect export extends extern final first_match for force foreach forever fork forkjoin function generate genvar global highz0 highz1 if iff ifnone ignore_bins illegal_bins implements implies import incdir include initial inout input inside instance int integer interconnect interface intersect join join_any join_none large let liblist library local localparam logic longint macromodule matches medium modport module nand negedge nettype new nexttime nmos nor noshowcancelled not notif0 notif1 null or output package packed parameter pmos posedge primitive priority program property protected pull0 pull1 pulldown pullup pulsestyle_ondetect pulsestyle_onevent pure rand randc randcase randsequence rcmos real realtime ref reg reject_on release repeat restrict return rnmos rpmos rtran rtranif0 rtranif1 s_always s_eventually s_nexttime s_until s_until_with scalared sequence shortint shortreal showcancelled signed small soft solve specify specparam static string strong strong0 strong1 struct super supply0 supply1 sync_accept_on sync_reject_on table tagged task this throughout time timeprecision timeunit tran tranif0 tranif1 tri tri0 tri1 triand trior trireg type typedef union unique unique0 unsigned until until_with untyped use uwire var vectored virtual void wait wait_order wand weak weak0 weak1 while wildcard wire with within wor xnor xor"),d=/[\+\-\*\/!~&|^%=?:]/,u=/[\[\]{}()]/,f=/\d[0-9_]*/,m=/\d*\s*'s?d\s*\d[0-9_]*/i,p=/\d*\s*'s?b\s*[xz01][xz01_]*/i,v=/\d*\s*'s?o\s*[xz0-7][xz0-7_]*/i,g=/\d*\s*'s?h\s*[0-9a-fxz?][0-9a-fxz?_]*/i,h=/(\d[\d_]*(\.\d[\d_]*)?E-?[\d_]+)|(\d[\d_]*\.\d[\d_]*)/i,k=/^((\w+)|[)}\]])/,y=/[)}\]]/,w=o("case checker class clocking config function generate interface module package primitive program property specify sequence table task"),b={};for(var _ in w)b[_]="end"+_;for(var x in b.begin="end",b.casex="endcase",b.casez="endcase",b.do="while",b.fork="join;join_any;join_none",b.covergroup="endgroup",i){_=i[x];b[_]&&(b[_]=void 0)}var z=o("always always_comb always_ff always_latch assert assign assume else export for foreach forever if import initial repeat while");function I(e,t){var n,i,o=e.peek();if(a[o]&&0!=(n=a[o](e,t)))return n;if(a.tokenBase&&0!=(n=a.tokenBase(e,t)))return n;if(/[,;:\.]/.test(o))return l=e.next(),null;if(u.test(o))return l=e.next(),"bracket";if("`"==o)return e.next(),e.eatWhile(/[\w\$_]/)?"def":null;if("$"==o)return e.next(),e.eatWhile(/[\w\$_]/)?"meta":null;if("#"==o)return e.next(),e.eatWhile(/[\d_.]/),"def";if('"'==o)return e.next(),t.tokenize=(i=o,function(e,t){for(var n,a=!1,o=!1;null!=(n=e.next());){if(n==i&&!a){o=!0;break}a=!a&&"\\"==n}return(o||!a&&!r)&&(t.tokenize=I),"string"}),t.tokenize(e,t);if("/"==o){if(e.next(),e.eat("*"))return t.tokenize=C,C(e,t);if(e.eat("/"))return e.skipToEnd(),"comment";e.backUp(1)}if(e.match(h)||e.match(m)||e.match(p)||e.match(v)||e.match(g)||e.match(f)||e.match(h))return"number";if(e.eatWhile(d))return"meta";if(e.eatWhile(/[\w\$_]/)){var k=e.current();return c[k]?(b[k]&&(l="newblock"),z[k]&&(l="newstatement"),s=k,"keyword"):"variable"}return e.next(),null}function C(e,t){for(var n,i=!1;n=e.next();){if("/"==n&&i){t.tokenize=I;break}i="*"==n}return"comment"}function S(e,t,n,i,r){this.indented=e,this.column=t,this.type=n,this.align=i,this.prev=r}function j(e,t,n){var i=new S(e.indented,t,n,null,e.context);return e.context=i}function N(e){var t=e.context.type;return")"!=t&&"]"!=t&&"}"!=t||(e.indented=e.context.indented),e.context=e.context.prev}function $(e,t){if(e==t)return!0;var n=t.split(";");for(var i in n)if(e==n[i])return!0;return!1}return{name:"verilog",startState:function(e){var t={tokenize:null,context:new S(-e,0,"top",!1),indented:0,startOfLine:!0};return a.startState&&a.startState(t),t},token:function(e,t){var n,i=t.context;if((e.sol()&&(null==i.align&&(i.align=!1),t.indented=e.indentation(),t.startOfLine=!0),a.token)&&void 0!==(n=a.token(e,t)))return n;if(e.eatSpace())return null;if(l=null,s=null,"comment"==(n=(t.tokenize||I)(e,t))||"meta"==n||"variable"==n)return n;if(null==i.align&&(i.align=!0),l==i.type)N(t);else if(";"==l&&"statement"==i.type||i.type&&$(s,i.type))for(i=N(t);i&&"statement"==i.type;)i=N(t);else if("{"==l)j(t,e.column(),"}");else if("["==l)j(t,e.column(),"]");else if("("==l)j(t,e.column(),")");else if(i&&"endcase"==i.type&&":"==l)j(t,e.column(),"statement");else if("newstatement"==l)j(t,e.column(),"statement");else if("newblock"==l)if("function"!=s||!i||"statement"!=i.type&&"endgroup"!=i.type)if("task"==s&&i&&"statement"==i.type);else{var r=b[s];j(t,e.column(),r)}else;return t.startOfLine=!1,n},indent:function(e,i,r){if(e.tokenize!=I&&null!=e.tokenize)return null;if(a.indent){var o=a.indent(e);if(o>=0)return o}var l=e.context,s=i&&i.charAt(0);"statement"==l.type&&"}"==s&&(l=l.prev);var c=!1,d=i.match(k);return d&&(c=$(d[0],l.type)),"statement"==l.type?l.indented+("{"==s?0:t||r.unit):y.test(l.type)&&l.align&&!n?l.column+(c?0:1):")"!=l.type||c?l.indented+(c?0:r.unit):l.indented+(t||r.unit)},languageData:{indentOnInput:function(){var e=[];for(var t in b)if(b[t]){var n=b[t].split(";");for(var i in n)e.push(n[i])}return new RegExp("[{}()\\[\\]]|("+e.join("|")+")$")}(),commentTokens:{line:"//",block:{open:"/*",close:"*/"}}}}}const t=e({});var n={"|":"link",">":"property",$:"variable",$$:"variable","?$":"qualifier","?*":"qualifier","-":"contentSeparator","/":"property","/-":"property","@":"variableName.special","@-":"variableName.special","@++":"variableName.special","@+=":"variableName.special","@+=-":"variableName.special","@--":"variableName.special","@-=":"variableName.special","%+":"tag","%-":"tag","%":"tag",">>":"tag","<<":"tag","<>":"tag","#":"tag","^":"attribute","^^":"attribute","^!":"attribute","*":"variable","**":"variable","\\":"keyword",'"':"comment"},i={"/":"beh-hier",">":"beh-hier","-":"phys-hier","|":"pipe","?":"when","@":"stage","\\":"keyword"},r=/^([~!@#\$%\^&\*-\+=\?\/\\\|'"<>]+)([\d\w_]*)/,a=/^[! ] */,o=/^\/[\/\*]/;const l=e({hooks:{electricInput:!1,token:function(e,t){var l,s=void 0;if(e.sol()&&!t.tlvInBlockComment){"\\"==e.peek()&&(s="def",e.skipToEnd(),e.string.match(/\\SV/)?t.tlvCodeActive=!1:e.string.match(/\\TLV/)&&(t.tlvCodeActive=!0)),t.tlvCodeActive&&0==e.pos&&0==t.indented&&(l=e.match(a,!1))&&(t.indented=l[0].length);var c=t.indented,d=c/3;if(d<=t.tlvIndentationStyle.length){var u=e.string.length==c,f=3*d;if(f<e.string.length){var m=e.string.slice(f),p=m[0];i[p]&&(l=m.match(r))&&n[l[1]]&&(c+=3,"\\"==p&&f>0||(t.tlvIndentationStyle[d]=i[p],d++))}if(!u)for(;t.tlvIndentationStyle.length>d;)t.tlvIndentationStyle.pop()}t.tlvNextIndent=c}if(t.tlvCodeActive)if(void 0!==s);else if(t.tlvInBlockComment)e.match(/^.*?\*\//)?t.tlvInBlockComment=!1:e.skipToEnd(),s="comment";else if((l=e.match(o))&&!t.tlvInBlockComment)"//"==l[0]?e.skipToEnd():t.tlvInBlockComment=!0,s="comment";else if(l=e.match(r)){var v=l[1],g=l[2];n.hasOwnProperty(v)&&(g.length>0||e.eol())?s=n[v]:e.backUp(e.current().length-1)}else e.match(/^\t+/)?s="invalid":e.match(/^[\[\]{}\(\);\:]+/)?s="meta":(l=e.match(/^[mM]4([\+_])?[\w\d_]*/))?s="+"==l[1]?"keyword.special":"keyword":e.match(/^ +/)?e.eol()&&(s="error"):e.match(/^[\w\d_]+/)?s="number":e.next();else e.match(/^[mM]4([\w\d_]*)/)&&(s="keyword");return s},indent:function(e){return 1==e.tlvCodeActive?e.tlvNextIndent:-1},startState:function(e){e.tlvIndentationStyle=[],e.tlvCodeActive=!0,e.tlvNextIndent=-1,e.tlvInBlockComment=!1}}});export{l as tlv,t as verilog};
