
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 10:02:04 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

function e(e){return new RegExp("^(("+e.join(")|(")+"))\\b","i")}var t=new RegExp("^[\\+\\-\\*/&#!_?\\\\<>=\\'\\[\\]]"),$=new RegExp("^(('=)|(<=)|(>=)|('>)|('<)|([[)|(]])|(^$))"),n=new RegExp("^[\\.,:]"),o=new RegExp("[()]"),a=new RegExp("^[%A-Za-z][A-Za-z0-9]*"),r=e(["\\$ascii","\\$char","\\$data","\\$ecode","\\$estack","\\$etrap","\\$extract","\\$find","\\$fnumber","\\$get","\\$horolog","\\$io","\\$increment","\\$job","\\$justify","\\$length","\\$name","\\$next","\\$order","\\$piece","\\$qlength","\\$qsubscript","\\$query","\\$quit","\\$random","\\$reverse","\\$select","\\$stack","\\$test","\\$text","\\$translate","\\$view","\\$x","\\$y","\\$a","\\$c","\\$d","\\$e","\\$ec","\\$es","\\$et","\\$f","\\$fn","\\$g","\\$h","\\$i","\\$j","\\$l","\\$n","\\$na","\\$o","\\$p","\\$q","\\$ql","\\$qs","\\$r","\\$re","\\$s","\\$st","\\$t","\\$tr","\\$v","\\$z"]),c=e(["break","close","do","else","for","goto","halt","hang","if","job","kill","lock","merge","new","open","quit","read","set","tcommit","trollback","tstart","use","view","write","xecute","b","c","d","e","f","g","h","i","j","k","l","m","n","o","q","r","s","tc","tro","ts","u","v","w","x"]);const m={name:"mumps",startState:function(){return{label:!1,commandMode:0}},token:function(e,m){var i=function(e,m){e.sol()&&(m.label=!0,m.commandMode=0);var i=e.peek();return" "==i||"\t"==i?(m.label=!1,0==m.commandMode?m.commandMode=1:(m.commandMode<0||2==m.commandMode)&&(m.commandMode=0)):"."!=i&&m.commandMode>0&&(m.commandMode=":"==i?-1:2),"("!==i&&"\t"!==i||(m.label=!1),";"===i?(e.skipToEnd(),"comment"):e.match(/^[-+]?\d+(\.\d+)?([eE][-+]?\d+)?/)?"number":'"'==i?e.skipTo('"')?(e.next(),"string"):(e.skipToEnd(),"error"):e.match($)||e.match(t)?"operator":e.match(n)?null:o.test(i)?(e.next(),"bracket"):m.commandMode>0&&e.match(c)?"controlKeyword":e.match(r)?"builtin":e.match(a)?"variable":"$"===i||"^"===i?(e.next(),"builtin"):"@"===i?(e.next(),"string.special"):/[\w%]/.test(i)?(e.eatWhile(/[\w%]/),"variable"):(e.next(),"error")}(e,m);return m.label?"tag":i}};export{m as mumps};
