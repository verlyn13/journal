
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 10:02:04 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

function e(e){var r={as:"keyword",do:"keyword",else:"keyword",end:"keyword",exception:"keyword",fun:"keyword",functor:"keyword",if:"keyword",in:"keyword",include:"keyword",let:"keyword",of:"keyword",open:"keyword",rec:"keyword",struct:"keyword",then:"keyword",type:"keyword",val:"keyword",while:"keyword",with:"keyword"},o=e.extraWords||{};for(var t in o)o.hasOwnProperty(t)&&(r[t]=e.extraWords[t]);var n=[];for(var i in r)n.push(i);function d(o,t){var n=o.next();if('"'===n)return t.tokenize=y,t.tokenize(o,t);if("{"===n&&o.eat("|"))return t.longString=!0,t.tokenize=k,t.tokenize(o,t);if("("===n&&o.match(/^\*(?!\))/))return t.commentLevel++,t.tokenize=w,t.tokenize(o,t);if("~"===n||"?"===n)return o.eatWhile(/\w/),"variableName.special";if("`"===n)return o.eatWhile(/\w/),"quote";if("/"===n&&e.slashComments&&o.eat("/"))return o.skipToEnd(),"comment";if(/\d/.test(n))return"0"===n&&o.eat(/[bB]/)&&o.eatWhile(/[01]/),"0"===n&&o.eat(/[xX]/)&&o.eatWhile(/[0-9a-fA-F]/),"0"===n&&o.eat(/[oO]/)?o.eatWhile(/[0-7]/):(o.eatWhile(/[\d_]/),o.eat(".")&&o.eatWhile(/[\d]/),o.eat(/[eE]/)&&o.eatWhile(/[\d\-+]/)),"number";if(/[+\-*&%=<>!?|@\.~:]/.test(n))return"operator";if(/[\w\xa1-\uffff]/.test(n)){o.eatWhile(/[\w\xa1-\uffff]/);var i=o.current();return r.hasOwnProperty(i)?r[i]:"variable"}return null}function y(e,r){for(var o,t=!1,n=!1;null!=(o=e.next());){if('"'===o&&!n){t=!0;break}n=!n&&"\\"===o}return t&&!n&&(r.tokenize=d),"string"}function w(e,r){for(var o,t;r.commentLevel>0&&null!=(t=e.next());)"("===o&&"*"===t&&r.commentLevel++,"*"===o&&")"===t&&r.commentLevel--,o=t;return r.commentLevel<=0&&(r.tokenize=d),"comment"}function k(e,r){for(var o,t;r.longString&&null!=(t=e.next());)"|"===o&&"}"===t&&(r.longString=!1),o=t;return r.longString||(r.tokenize=d),"string"}return{startState:function(){return{tokenize:d,commentLevel:0,longString:!1}},token:function(e,r){return e.eatSpace()?null:r.tokenize(e,r)},languageData:{autocomplete:n,commentTokens:{line:e.slashComments?"//":void 0,block:{open:"(*",close:"*)"}}}}}const r=e({extraWords:{and:"keyword",assert:"keyword",begin:"keyword",class:"keyword",constraint:"keyword",done:"keyword",downto:"keyword",external:"keyword",function:"keyword",initializer:"keyword",lazy:"keyword",match:"keyword",method:"keyword",module:"keyword",mutable:"keyword",new:"keyword",nonrec:"keyword",object:"keyword",private:"keyword",sig:"keyword",to:"keyword",try:"keyword",value:"keyword",virtual:"keyword",when:"keyword",raise:"builtin",failwith:"builtin",true:"builtin",false:"builtin",asr:"builtin",land:"builtin",lor:"builtin",lsl:"builtin",lsr:"builtin",lxor:"builtin",mod:"builtin",or:"builtin",raise_notrace:"builtin",trace:"builtin",exit:"builtin",print_string:"builtin",print_endline:"builtin",int:"type",float:"type",bool:"type",char:"type",string:"type",unit:"type",List:"builtin"}}),o=e({extraWords:{abstract:"keyword",assert:"keyword",base:"keyword",begin:"keyword",class:"keyword",default:"keyword",delegate:"keyword","do!":"keyword",done:"keyword",downcast:"keyword",downto:"keyword",elif:"keyword",extern:"keyword",finally:"keyword",for:"keyword",function:"keyword",global:"keyword",inherit:"keyword",inline:"keyword",interface:"keyword",internal:"keyword",lazy:"keyword","let!":"keyword",match:"keyword",member:"keyword",module:"keyword",mutable:"keyword",namespace:"keyword",new:"keyword",null:"keyword",override:"keyword",private:"keyword",public:"keyword","return!":"keyword",return:"keyword",select:"keyword",static:"keyword",to:"keyword",try:"keyword",upcast:"keyword","use!":"keyword",use:"keyword",void:"keyword",when:"keyword","yield!":"keyword",yield:"keyword",atomic:"keyword",break:"keyword",checked:"keyword",component:"keyword",const:"keyword",constraint:"keyword",constructor:"keyword",continue:"keyword",eager:"keyword",event:"keyword",external:"keyword",fixed:"keyword",method:"keyword",mixin:"keyword",object:"keyword",parallel:"keyword",process:"keyword",protected:"keyword",pure:"keyword",sealed:"keyword",tailcall:"keyword",trait:"keyword",virtual:"keyword",volatile:"keyword",List:"builtin",Seq:"builtin",Map:"builtin",Set:"builtin",Option:"builtin",int:"builtin",string:"builtin",not:"builtin",true:"builtin",false:"builtin",raise:"builtin",failwith:"builtin"},slashComments:!0}),t=e({extraWords:{abstype:"keyword",and:"keyword",andalso:"keyword",case:"keyword",datatype:"keyword",fn:"keyword",handle:"keyword",infix:"keyword",infixr:"keyword",local:"keyword",nonfix:"keyword",op:"keyword",orelse:"keyword",raise:"keyword",withtype:"keyword",eqtype:"keyword",sharing:"keyword",sig:"keyword",signature:"keyword",structure:"keyword",where:"keyword",true:"keyword",false:"keyword",int:"builtin",real:"builtin",string:"builtin",char:"builtin",bool:"builtin"},slashComments:!0});export{o as fSharp,r as oCaml,t as sml};
