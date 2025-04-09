
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 9:54:47 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

function t(t){return{name:"mscgen",startState:a,copyState:c,token:(r=t,function(t,e){if(t.match(i(r.brackets),!0,!0))return"bracket";if(!e.inComment){if(t.match(/\/\*[^\*\/]*/,!0,!0))return e.inComment=!0,"comment";if(t.match(i(r.singlecomment),!0,!0))return t.skipToEnd(),"comment"}if(e.inComment)return t.match(/[^\*\/]*\*\//,!0,!0)?e.inComment=!1:t.skipToEnd(),"comment";if(!e.inString&&t.match(/\"(\\\"|[^\"])*/,!0,!0))return e.inString=!0,"string";if(e.inString)return t.match(/[^\"]*\"/,!0,!0)?e.inString=!1:t.skipToEnd(),"string";if(r.keywords&&t.match(n(r.keywords),!0,!0))return"keyword";if(t.match(n(r.options),!0,!0))return"keyword";if(t.match(n(r.arcsWords),!0,!0))return"keyword";if(t.match(i(r.arcsOthers),!0,!0))return"keyword";if(r.operators&&t.match(i(r.operators),!0,!0))return"operator";if(r.constants&&t.match(i(r.constants),!0,!0))return"variable";if(!r.inAttributeList&&r.attributes&&t.match("[",!0,!0))return r.inAttributeList=!0,"bracket";if(r.inAttributeList){if(null!==r.attributes&&t.match(n(r.attributes),!0,!0))return"attribute";if(t.match("]",!0,!0))return r.inAttributeList=!1,"bracket"}return t.next(),null}),languageData:{commentTokens:{line:"#",block:{open:"/*",close:"*/"}}}};var r}const r=t({keywords:["msc"],options:["hscale","width","arcgradient","wordwraparcs"],constants:["true","false","on","off"],attributes:["label","idurl","id","url","linecolor","linecolour","textcolor","textcolour","textbgcolor","textbgcolour","arclinecolor","arclinecolour","arctextcolor","arctextcolour","arctextbgcolor","arctextbgcolour","arcskip"],brackets:["\\{","\\}"],arcsWords:["note","abox","rbox","box"],arcsOthers:["\\|\\|\\|","\\.\\.\\.","---","--","<->","==","<<=>>","<=>","\\.\\.","<<>>","::","<:>","->","=>>","=>",">>",":>","<-","<<=","<=","<<","<:","x-","-x"],singlecomment:["//","#"],operators:["="]}),e=t({keywords:null,options:["hscale","width","arcgradient","wordwraparcs","wordwrapentities","watermark"],constants:["true","false","on","off","auto"],attributes:null,brackets:["\\{","\\}"],arcsWords:["note","abox","rbox","box","alt","else","opt","break","par","seq","strict","neg","critical","ignore","consider","assert","loop","ref","exc"],arcsOthers:["\\|\\|\\|","\\.\\.\\.","---","--","<->","==","<<=>>","<=>","\\.\\.","<<>>","::","<:>","->","=>>","=>",">>",":>","<-","<<=","<=","<<","<:","x-","-x"],singlecomment:["//","#"],operators:["="]}),o=t({keywords:["msc","xu"],options:["hscale","width","arcgradient","wordwraparcs","wordwrapentities","watermark"],constants:["true","false","on","off","auto"],attributes:["label","idurl","id","url","linecolor","linecolour","textcolor","textcolour","textbgcolor","textbgcolour","arclinecolor","arclinecolour","arctextcolor","arctextcolour","arctextbgcolor","arctextbgcolour","arcskip","title","deactivate","activate","activation"],brackets:["\\{","\\}"],arcsWords:["note","abox","rbox","box","alt","else","opt","break","par","seq","strict","neg","critical","ignore","consider","assert","loop","ref","exc"],arcsOthers:["\\|\\|\\|","\\.\\.\\.","---","--","<->","==","<<=>>","<=>","\\.\\.","<<>>","::","<:>","->","=>>","=>",">>",":>","<-","<<=","<=","<<","<:","x-","-x"],singlecomment:["//","#"],operators:["="]});function n(t){return new RegExp("^\\b("+t.join("|")+")\\b","i")}function i(t){return new RegExp("^(?:"+t.join("|")+")","i")}function a(){return{inComment:!1,inString:!1,inAttributeList:!1,inScript:!1}}function c(t){return{inComment:t.inComment,inString:t.inString,inAttributeList:t.inAttributeList,inScript:t.inScript}}export{r as mscgen,e as msgenny,o as xu};
