
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 8:32:01 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

function e(e){for(var t={},T=e.split(" "),E=0;E<T.length;++E)t[T[E]]=!0;return t}const t={keywords:e("Yes No LogFile FileMask ConsoleMask AppendFile TimeStampFormat LogEventTypes SourceInfoFormat LogEntityName LogSourceInfo DiskFullAction LogFileNumber LogFileSize MatchingHints Detailed Compact SubCategories Stack Single None Seconds DateTime Time Stop Error Retry Delete TCPPort KillTimer NumHCs UnixSocketsEnabled LocalAddress"),fileNCtrlMaskOptions:e("TTCN_EXECUTOR TTCN_ERROR TTCN_WARNING TTCN_PORTEVENT TTCN_TIMEROP TTCN_VERDICTOP TTCN_DEFAULTOP TTCN_TESTCASE TTCN_ACTION TTCN_USER TTCN_FUNCTION TTCN_STATISTICS TTCN_PARALLEL TTCN_MATCHING TTCN_DEBUG EXECUTOR ERROR WARNING PORTEVENT TIMEROP VERDICTOP DEFAULTOP TESTCASE ACTION USER FUNCTION STATISTICS PARALLEL MATCHING DEBUG LOG_ALL LOG_NOTHING ACTION_UNQUALIFIED DEBUG_ENCDEC DEBUG_TESTPORT DEBUG_UNQUALIFIED DEFAULTOP_ACTIVATE DEFAULTOP_DEACTIVATE DEFAULTOP_EXIT DEFAULTOP_UNQUALIFIED ERROR_UNQUALIFIED EXECUTOR_COMPONENT EXECUTOR_CONFIGDATA EXECUTOR_EXTCOMMAND EXECUTOR_LOGOPTIONS EXECUTOR_RUNTIME EXECUTOR_UNQUALIFIED FUNCTION_RND FUNCTION_UNQUALIFIED MATCHING_DONE MATCHING_MCSUCCESS MATCHING_MCUNSUCC MATCHING_MMSUCCESS MATCHING_MMUNSUCC MATCHING_PCSUCCESS MATCHING_PCUNSUCC MATCHING_PMSUCCESS MATCHING_PMUNSUCC MATCHING_PROBLEM MATCHING_TIMEOUT MATCHING_UNQUALIFIED PARALLEL_PORTCONN PARALLEL_PORTMAP PARALLEL_PTC PARALLEL_UNQUALIFIED PORTEVENT_DUALRECV PORTEVENT_DUALSEND PORTEVENT_MCRECV PORTEVENT_MCSEND PORTEVENT_MMRECV PORTEVENT_MMSEND PORTEVENT_MQUEUE PORTEVENT_PCIN PORTEVENT_PCOUT PORTEVENT_PMIN PORTEVENT_PMOUT PORTEVENT_PQUEUE PORTEVENT_STATE PORTEVENT_UNQUALIFIED STATISTICS_UNQUALIFIED STATISTICS_VERDICT TESTCASE_FINISH TESTCASE_START TESTCASE_UNQUALIFIED TIMEROP_GUARD TIMEROP_READ TIMEROP_START TIMEROP_STOP TIMEROP_TIMEOUT TIMEROP_UNQUALIFIED USER_UNQUALIFIED VERDICTOP_FINAL VERDICTOP_GETVERDICT VERDICTOP_SETVERDICT VERDICTOP_UNQUALIFIED WARNING_UNQUALIFIED"),externalCommands:e("BeginControlPart EndControlPart BeginTestCase EndTestCase")};var T,E=t.keywords,n=t.fileNCtrlMaskOptions,C=t.externalCommands,N=!1!==t.indentStatements,I=/[\|]/;function r(e,t){var N,r=e.next();if('"'==r||"'"==r)return t.tokenize=(N=r,function(e,t){for(var T,E=!1,n=!1;null!=(T=e.next());){if(T==N&&!E){var C=e.peek();C&&("b"!=(C=C.toLowerCase())&&"h"!=C&&"o"!=C||e.next()),n=!0;break}E=!E&&"\\"==T}return n&&(t.tokenize=null),"string"}),t.tokenize(e,t);if(/[:=]/.test(r))return T=r,"punctuation";if("#"==r)return e.skipToEnd(),"comment";if(/\d/.test(r))return e.eatWhile(/[\w\.]/),"number";if(I.test(r))return e.eatWhile(I),"operator";if("["==r)return e.eatWhile(/[\w_\]]/),"number";e.eatWhile(/[\w\$_]/);var o=e.current();return E.propertyIsEnumerable(o)?"keyword":n.propertyIsEnumerable(o)?"atom":C.propertyIsEnumerable(o)?"deleted":"variable"}function o(e,t,T,E,n){this.indented=e,this.column=t,this.type=T,this.align=E,this.prev=n}function i(e,t,T){var E=e.indented;return e.context&&"statement"==e.context.type&&(E=e.context.indented),e.context=new o(E,t,T,null,e.context)}function _(e){var t=e.context.type;return")"!=t&&"]"!=t&&"}"!=t||(e.indented=e.context.indented),e.context=e.context.prev}const A={name:"ttcn",startState:function(){return{tokenize:null,context:new o(0,0,"top",!1),indented:0,startOfLine:!0}},token:function(e,t){var E=t.context;if(e.sol()&&(null==E.align&&(E.align=!1),t.indented=e.indentation(),t.startOfLine=!0),e.eatSpace())return null;T=null;var n=(t.tokenize||r)(e,t);if("comment"==n)return n;if(null==E.align&&(E.align=!0),";"!=T&&":"!=T&&","!=T||"statement"!=E.type)if("{"==T)i(t,e.column(),"}");else if("["==T)i(t,e.column(),"]");else if("("==T)i(t,e.column(),")");else if("}"==T){for(;"statement"==E.type;)E=_(t);for("}"==E.type&&(E=_(t));"statement"==E.type;)E=_(t)}else T==E.type?_(t):N&&(("}"==E.type||"top"==E.type)&&";"!=T||"statement"==E.type&&"newstatement"==T)&&i(t,e.column(),"statement");else _(t);return t.startOfLine=!1,n},languageData:{indentOnInput:/^\s*[{}]$/,commentTokens:{line:"#"}}};export{A as ttcnCfg};
