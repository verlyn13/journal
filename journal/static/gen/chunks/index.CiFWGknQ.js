
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 10:20:42 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

import{a as O,E as e,s as n,C as t,t as a,L as P,b as Q,r as o,i as r,f as c,h as s,k as i}from"../main.BIWZrcN7.js";const p=63;class X{constructor(O,e,n){this.parent=O,this.depth=e,this.type=n,this.hash=(O?O.hash+O.hash<<8:0)+e+(e<<4)+n}}function f(O,e){for(let n=0,t=e-O.pos-1;;t--,n++){let e=O.peek(t);if(R(e)||-1==e)return n}}function l(O){return 32==O||9==O}function R(O){return 10==O||13==O}function d(O){return l(O)||R(O)}function u(O){return O<0||d(O)}X.top=new X(null,-1,0);const S=new t({start:X.top,reduce:(O,e)=>3!=O.type||20!=e&&34!=e?O:O.parent,shift(O,e,n,t){if(3==e)return new X(O,f(t,t.pos),1);if(65==e||5==e)return new X(O,f(t,t.pos),2);if(e==p)return O.parent;if(19==e||33==e)return new X(O,0,3);if(13==e&&4==O.type)return O.parent;if(47==e){let e=/[1-9]/.exec(t.read(t.pos,n.pos));if(e)return new X(O,O.depth+ +e[0],4)}return O},hash:O=>O.hash});function k(O,e,n=0){return O.peek(n)==e&&O.peek(n+1)==e&&O.peek(n+2)==e&&u(O.peek(n+3))}const b=new e(((O,e)=>{if(-1==O.next&&e.canShift(64))return O.acceptToken(64);let n=O.peek(-1);if((R(n)||n<0)&&3!=e.context.type){if(k(O,45)){if(!e.canShift(p))return O.acceptToken(1,3);O.acceptToken(p)}if(k(O,46)){if(!e.canShift(p))return O.acceptToken(2,3);O.acceptToken(p)}let n=0;for(;32==O.next;)n++,O.advance();!(n<e.context.depth)&&(n!=e.context.depth||1!=e.context.type||45==O.next&&u(O.peek(1)))||-1==O.next||R(O.next)||35==O.next||O.acceptToken(p,-n)}}),{contextual:!0}),x=new e(((O,e)=>{if(3!=e.context.type)if(45==O.next)O.advance(),u(O.next)&&O.acceptToken(1==e.context.type&&e.context.depth==f(O,O.pos-1)?4:3);else if(63==O.next)O.advance(),u(O.next)&&O.acceptToken(2==e.context.type&&e.context.depth==f(O,O.pos-1)?6:5);else{let n=O.pos;for(;;)if(l(O.next)){if(O.pos==n)return;O.advance()}else if(33==O.next)g(O);else{if(38!=O.next){if(42==O.next){h(O);break}if(39==O.next||34==O.next){if(v(O,!0))break;return}if(91==O.next||123==O.next){if(!T(O))return;break}W(O,!0,!1,0);break}h(O)}for(;l(O.next);)O.advance();if(58==O.next){if(O.pos==n&&e.canShift(29))return;u(O.peek(1))&&O.acceptTokenTo(2==e.context.type&&e.context.depth==f(O,n)?66:65,n)}}else 63==O.next&&(O.advance(),u(O.next)&&O.acceptToken(7))}),{contextual:!0});function m(O){return O>=48&&O<=57||O>=97&&O<=102||O>=65&&O<=70}function $(O,e){return 37==O.next?(O.advance(),m(O.next)&&O.advance(),m(O.next)&&O.advance(),!0):!!((n=O.next)>32&&n<127&&34!=n&&37!=n&&44!=n&&60!=n&&62!=n&&92!=n&&94!=n&&96!=n&&123!=n&&124!=n&&125!=n||e&&44==O.next)&&(O.advance(),!0);var n}function g(O){if(O.advance(),60==O.next){for(O.advance();;)if(!$(O,!0)){62==O.next&&O.advance();break}}else for(;$(O,!1););}function h(O){for(O.advance();!u(O.next)&&"f"!=Y(O.tag);)O.advance()}function v(O,e){let n=O.next,t=!1,a=O.pos;for(O.advance();;){let P=O.next;if(P<0)break;if(O.advance(),P==n){if(39!=P)break;if(39!=O.next)break;O.advance()}else if(92==P&&34==n)O.next>=0&&O.advance();else if(R(P)){if(e)return!1;t=!0}else if(e&&O.pos>=a+1024)return!1}return!t}function T(O){for(let e=[],n=O.pos+1024;;)if(91==O.next||123==O.next)e.push(O.next),O.advance();else if(39==O.next||34==O.next){if(!v(O,!0))return!1}else if(93==O.next||125==O.next){if(e[e.length-1]!=O.next-2)return!1;if(e.pop(),O.advance(),!e.length)return!0}else{if(O.next<0||O.pos>n||R(O.next))return!1;O.advance()}}const D="iiisiiissisfissssssssssssisssiiissssssssssssssssssssssssssfsfssissssssssssssssssssssssssssfif";function Y(O){return O<33?"u":O>125?"s":D[O-33]}function q(O,e){let n=Y(O);return"u"!=n&&!(e&&"f"==n)}function W(O,e,n,t){if("s"!=Y(O.next)&&(63!=O.next&&58!=O.next&&45!=O.next||!q(O.peek(1),n)))return!1;O.advance();let a=O.pos;for(;;){let P=O.next,Q=0,o=t+1;for(;d(P);){if(R(P)){if(e)return!1;o=0}else o++;P=O.peek(++Q)}if(!(P>=0&&(58==P?q(O.peek(Q+1),n):35==P?32!=O.peek(Q-1):q(P,n)))||!n&&o<=t||0==o&&!n&&(k(O,45,Q)||k(O,46,Q)))break;if(e&&"f"==Y(P))return!1;for(let e=Q;e>=0;e--)O.advance();if(e&&O.pos>a+1024)return!1}return!0}const U=new e(((O,e)=>{if(33==O.next)g(O),O.acceptToken(12);else if(38==O.next||42==O.next){let e=38==O.next?10:11;h(O),O.acceptToken(e)}else 39==O.next||34==O.next?(v(O,!1),O.acceptToken(9)):W(O,!1,3==e.context.type,e.context.depth)&&O.acceptToken(8)})),Z=new e(((O,e)=>{let n=4==e.context.type?e.context.depth:-1,t=O.pos;O:for(;;){let a=0,P=O.next;for(;32==P;)P=O.peek(++a);if(!a&&(k(O,45,a)||k(O,46,a)))break;if(!R(P)&&(n<0&&(n=Math.max(e.context.depth+1,a)),a<n))break;for(;;){if(O.next<0)break O;let e=R(O.next);if(O.advance(),e)continue O;t=O.pos}}O.acceptTokenTo(13,t)})),y=n({DirectiveName:a.keyword,DirectiveContent:a.attributeValue,"DirectiveEnd DocEnd":a.meta,QuotedLiteral:a.string,BlockLiteralHeader:a.special(a.string),BlockLiteralContent:a.content,Literal:a.content,"Key/Literal Key/QuotedLiteral":a.definition(a.propertyName),"Anchor Alias":a.labelName,Tag:a.typeName,Comment:a.lineComment,": , -":a.separator,"?":a.punctuation,"[ ]":a.squareBracket,"{ }":a.brace}),z=O.deserialize({version:14,states:"5lQ!ZQgOOO#PQfO'#CpO#uQfO'#DOOOQR'#Dv'#DvO$qQgO'#DRO%gQdO'#DUO%nQgO'#DUO&ROaO'#D[OOQR'#Du'#DuO&{QgO'#D^O'rQgO'#D`OOQR'#Dt'#DtO(iOqO'#DbOOQP'#Dj'#DjO(zQaO'#CmO)YQgO'#CmOOQP'#Cm'#CmQ)jQaOOQ)uQgOOQ]QgOOO*PQdO'#CrO*nQdO'#CtOOQO'#Dw'#DwO+]Q`O'#CxO+hQdO'#CwO+rQ`O'#CwOOQO'#Cv'#CvO+wQdO'#CvOOQO'#Cq'#CqO,UQ`O,59[O,^QfO,59[OOQR,59[,59[OOQO'#Cx'#CxO,eQ`O'#DPO,pQdO'#DPOOQO'#Dx'#DxO,zQdO'#DxO-XQ`O,59jO-aQfO,59jOOQR,59j,59jOOQR'#DS'#DSO-hQcO,59mO-sQgO'#DVO.TQ`O'#DVO.YQcO,59pOOQR'#DX'#DXO#|QfO'#DWO.hQcO'#DWOOQR,59v,59vO.yOWO,59vO/OOaO,59vO/WOaO,59vO/cQgO'#D_OOQR,59x,59xO0VQgO'#DaOOQR,59z,59zOOQP,59|,59|O0yOaO,59|O1ROaO,59|O1aOqO,59|OOQP-E7h-E7hO1oQgO,59XOOQP,59X,59XO2PQaO'#DeO2_QgO'#DeO2oQgO'#DkOOQP'#Dk'#DkQ)jQaOOO3PQdO'#CsOOQO,59^,59^O3kQdO'#CuOOQO,59`,59`OOQO,59c,59cO4VQdO,59cO4aQdO'#CzO4kQ`O'#CzOOQO,59b,59bOOQU,5:Q,5:QOOQR1G.v1G.vO4pQ`O1G.vOOQU-E7d-E7dO4xQdO,59kOOQO,59k,59kO5SQdO'#DQO5^Q`O'#DQOOQO,5:d,5:dOOQU,5:R,5:ROOQR1G/U1G/UO5cQ`O1G/UOOQU-E7e-E7eO5kQgO'#DhO5xQcO1G/XOOQR1G/X1G/XOOQR,59q,59qO6TQgO,59qO6eQdO'#DiO6lQgO'#DiO7PQcO1G/[OOQR1G/[1G/[OOQR,59r,59rO#|QfO,59rOOQR1G/b1G/bO7_OWO1G/bO7dOaO1G/bOOQR,59y,59yOOQR,59{,59{OOQP1G/h1G/hO7lOaO1G/hO7tOaO1G/hO8POaO1G/hOOQP1G.s1G.sO8_QgO,5:POOQP,5:P,5:POOQP,5:V,5:VOOQP-E7i-E7iOOQO,59_,59_OOQO,59a,59aOOQO1G.}1G.}OOQO,59f,59fO8oQdO,59fOOQR7+$b7+$bP,XQ`O'#DfOOQO1G/V1G/VOOQO,59l,59lO8yQdO,59lOOQR7+$p7+$pP9TQ`O'#DgOOQR'#DT'#DTOOQR,5:S,5:SOOQR-E7f-E7fOOQR7+$s7+$sOOQR1G/]1G/]O9YQgO'#DYO9jQ`O'#DYOOQR,5:T,5:TO#|QfO'#DZO9oQcO'#DZOOQR-E7g-E7gOOQR7+$v7+$vOOQR1G/^1G/^OOQR7+$|7+$|O:QOWO7+$|OOQP7+%S7+%SO:VOaO7+%SO:_OaO7+%SOOQP1G/k1G/kOOQO1G/Q1G/QOOQO1G/W1G/WOOQR,59t,59tO:jQgO,59tOOQR,59u,59uO#|QfO,59uOOQR<<Hh<<HhOOQP<<Hn<<HnO:zOaO<<HnOOQR1G/`1G/`OOQR1G/a1G/aOOQPAN>YAN>Y",stateData:";S~O!fOS!gOS^OS~OP_OQbORSOTUOWROXROYYOZZO[XOcPOqQO!PVO!V[O!cTO~O`cO~P]OVkOWROXROYeOZfO[dOcPOmhOqQO~OboO~P!bOVtOWROXROYeOZfO[dOcPOmrOqQO~OpwO~P#WORSOTUOWROXROYYOZZO[XOcPOqQO!PVO!cTO~OSvP!avP!bvP~P#|OWROXROYeOZfO[dOcPOqQO~OmzO~P%OOm!OOUzP!azP!bzP!dzP~P#|O^!SO!b!QO!f!TO!g!RO~ORSOTUOWROXROcPOqQO!PVO!cTO~OY!UOP!QXQ!QX!V!QX!`!QXS!QX!a!QX!b!QXU!QXm!QX!d!QX~P&aO[!WOP!SXQ!SX!V!SX!`!SXS!SX!a!SX!b!SXU!SXm!SX!d!SX~P&aO^!ZO!W![O!b!YO!f!]O!g!YO~OP!_O!V[OQaX!`aX~OPaXQaX!VaX!`aX~P#|OP!bOQ!cO!V[O~OP_O!V[O~P#|OWROXROY!fOcPOqQObfXmfXofXpfX~OWROXRO[!hOcPOqQObhXmhXohXphX~ObeXmlXoeX~ObkXokX~P%OOm!kO~Om!lObnPonP~P%OOb!pOo!oO~Ob!pO~P!bOm!sOosXpsX~OosXpsX~P%OOm!uOotPptP~P%OOo!xOp!yO~Op!yO~P#WOS!|O!a#OO!b#OO~OUyX!ayX!byX!dyX~P#|Om#QO~OU#SO!a#UO!b#UO!d#RO~Om#WOUzX!azX!bzX!dzX~O]#XO~O!b#XO!g#YO~O^#ZO!b#XO!g#YO~OP!RXQ!RX!V!RX!`!RXS!RX!a!RX!b!RXU!RXm!RX!d!RX~P&aOP!TXQ!TX!V!TX!`!TXS!TX!a!TX!b!TXU!TXm!TX!d!TX~P&aO!b#^O!g#^O~O^#_O!b#^O!f#`O!g#^O~O^#_O!W#aO!b#^O!g#^O~OPaaQaa!Vaa!`aa~P#|OP#cO!V[OQ!XX!`!XX~OP!XXQ!XX!V!XX!`!XX~P#|OP_O!V[OQ!_X!`!_X~P#|OWROXROcPOqQObgXmgXogXpgX~OWROXROcPOqQObiXmiXoiXpiX~Obkaoka~P%OObnXonX~P%OOm#kO~Ob#lOo!oO~Oosapsa~P%OOotXptX~P%OOm#pO~Oo!xOp#qO~OSwP!awP!bwP~P#|OS!|O!a#vO!b#vO~OUya!aya!bya!dya~P#|Om#xO~P%OOm#{OU}P!a}P!b}P!d}P~P#|OU#SO!a$OO!b$OO!d#RO~O]$QO~O!b$QO!g$RO~O!b$SO!g$SO~O^$TO!b$SO!g$SO~O^$TO!b$SO!f$UO!g$SO~OP!XaQ!Xa!V!Xa!`!Xa~P#|Obnaona~P%OOotapta~P%OOo!xO~OU|X!a|X!b|X!d|X~P#|Om$ZO~Om$]OU}X!a}X!b}X!d}X~O]$^O~O!b$_O!g$_O~O^$`O!b$_O!g$_O~OU|a!a|a!b|a!d|a~P#|O!b$cO!g$cO~O",goto:",]!mPPPPPPPPPPPPPPPPP!nPP!v#v#|$`#|$c$f$j$nP%VPPP!v%Y%^%a%{&O%a&R&U&X&_&b%aP&e&{&e'O'RPP']'a'g'm's'y(XPPPPPPPP(_)e*X+c,VUaObcR#e!c!{ROPQSTUXY_bcdehknrtvz!O!U!W!_!b!c!f!h!k!l!s!u!|#Q#R#S#W#c#k#p#x#{$Z$]QmPR!qnqfPQThknrtv!k!l!s!u#R#k#pR!gdR!ieTlPnTjPnSiPnSqQvQ{TQ!mkQ!trQ!vtR#y#RR!nkTsQvR!wt!RWOSUXY_bcz!O!U!W!_!b!c!|#Q#S#W#c#x#{$Z$]RySR#t!|R|TR|UQ!PUR#|#SR#z#RR#z#SyZOSU_bcz!O!_!b!c!|#Q#S#W#c#x#{$Z$]R!VXR!XYa]O^abc!a!c!eT!da!eQnPR!rnQvQR!{vQ!}yR#u!}Q#T|R#}#TW^Obc!cS!^^!aT!aa!eQ!eaR#f!eW`Obc!cQxSS}U#SQ!`_Q#PzQ#V!OQ#b!_Q#d!bQ#s!|Q#w#QQ$P#WQ$V#cQ$Y#xQ$[#{Q$a$ZR$b$]xZOSU_bcz!O!_!b!c!|#Q#S#W#c#x#{$Z$]Q!VXQ!XYQ#[!UR#]!W!QWOSUXY_bcz!O!U!W!_!b!c!|#Q#S#W#c#x#{$Z$]pfPQThknrtv!k!l!s!u#R#k#pQ!gdQ!ieQ#g!fR#h!hSgPn^pQTkrtv#RQ!jhQ#i!kQ#j!lQ#n!sQ#o!uQ$W#kR$X#pQuQR!zv",nodeNames:"⚠ DirectiveEnd DocEnd - - ? ? ? Literal QuotedLiteral Anchor Alias Tag BlockLiteralContent Comment Stream BOM Document ] [ FlowSequence Item Tagged Anchored Anchored Tagged FlowMapping Pair Key : Pair , } { FlowMapping Pair Pair BlockSequence Item Item BlockMapping Pair Pair Key Pair Pair BlockLiteral BlockLiteralHeader Tagged Anchored Anchored Tagged Directive DirectiveName DirectiveContent Document",maxTerm:74,context:S,nodeProps:[["isolate",-3,8,9,14,""],["openedBy",18,"[",32,"{"],["closedBy",19,"]",33,"}"]],propSources:[y],skippedNodes:[0],repeatNodeCount:6,tokenData:"-Y~RnOX#PXY$QYZ$]Z]#P]^$]^p#Ppq$Qqs#Pst$btu#Puv$yv|#P|}&e}![#P![!]'O!]!`#P!`!a'i!a!}#P!}#O*g#O#P#P#P#Q+Q#Q#o#P#o#p+k#p#q'i#q#r,U#r;'S#P;'S;=`#z<%l?HT#P?HT?HU,o?HUO#PQ#UU!WQOY#PZp#Ppq#hq;'S#P;'S;=`#z<%lO#PQ#kTOY#PZs#Pt;'S#P;'S;=`#z<%lO#PQ#}P;=`<%l#P~$VQ!f~XY$Qpq$Q~$bO!g~~$gS^~OY$bZ;'S$b;'S;=`$s<%lO$b~$vP;=`<%l$bR%OX!WQOX%kXY#PZ]%k]^#P^p%kpq#hq;'S%k;'S;=`&_<%lO%kR%rX!WQ!VPOX%kXY#PZ]%k]^#P^p%kpq#hq;'S%k;'S;=`&_<%lO%kR&bP;=`<%l%kR&lUoP!WQOY#PZp#Ppq#hq;'S#P;'S;=`#z<%lO#PR'VUmP!WQOY#PZp#Ppq#hq;'S#P;'S;=`#z<%lO#PR'p[!PP!WQOY#PZp#Ppq#hq{#P{|(f|}#P}!O(f!O!R#P!R![)p![;'S#P;'S;=`#z<%lO#PR(mW!PP!WQOY#PZp#Ppq#hq!R#P!R![)V![;'S#P;'S;=`#z<%lO#PR)^U!PP!WQOY#PZp#Ppq#hq;'S#P;'S;=`#z<%lO#PR)wY!PP!WQOY#PZp#Ppq#hq{#P{|)V|}#P}!O)V!O;'S#P;'S;=`#z<%lO#PR*nUcP!WQOY#PZp#Ppq#hq;'S#P;'S;=`#z<%lO#PR+XUbP!WQOY#PZp#Ppq#hq;'S#P;'S;=`#z<%lO#PR+rUqP!WQOY#PZp#Ppq#hq;'S#P;'S;=`#z<%lO#PR,]UpP!WQOY#PZp#Ppq#hq;'S#P;'S;=`#z<%lO#PR,vU`P!WQOY#PZp#Ppq#hq;'S#P;'S;=`#z<%lO#P",tokenizers:[b,x,U,Z,0,1],topRules:{Stream:[0,15]},tokenPrec:0}),C=O.deserialize({version:14,states:"!vOQOPOOO]OPO'#C_OhOPO'#C^OOOO'#Cc'#CcOpOPO'#CaQOOOOOO{OPOOOOOO'#Cb'#CbO!WOPO'#C`O!`OPO,58xOOOO-E6a-E6aOOOO-E6`-E6`OOOO'#C_'#C_OOOO1G.d1G.d",stateData:"!h~OXPOYROWTP~OWVXXRXYRX~OYVOXSP~OXROYROWTX~OXROYROWTP~OYVOXSX~OX[O~OXY~",goto:"vWPPX[beioRUOQQOR]XRXQTTOUQWQRZWSSOURYS",nodeNames:"⚠ Document Frontmatter DashLine FrontmatterContent Body",maxTerm:10,skippedNodes:[0],repeatNodeCount:2,tokenData:"$z~RXOYnYZ!^Z]n]^!^^}n}!O!i!O;'Sn;'S;=`!c<%lOn~qXOYnYZ!^Z]n]^!^^;'Sn;'S;=`!c<%l~n~On~~!^~!cOY~~!fP;=`<%ln~!lZOYnYZ!^Z]n]^!^^}n}!O#_!O;'Sn;'S;=`!c<%l~n~On~~!^~#bZOYnYZ!^Z]n]^!^^}n}!O$T!O;'Sn;'S;=`!c<%l~n~On~~!^~$WXOYnYZ$sZ]n]^$s^;'Sn;'S;=`!c<%l~n~On~~$s~$zOX~Y~",tokenizers:[0],topRules:{Document:[0,1]},tokenPrec:67}),V=P.define({name:"yaml",parser:z.configure({props:[r.add({Stream:O=>{for(let e=O.node.resolve(O.pos,-1);e&&e.to>=O.pos;e=e.parent){if("BlockLiteralContent"==e.name&&e.from<e.to)return O.baseIndentFor(e);if("BlockLiteral"==e.name)return O.baseIndentFor(e)+O.unit;if("BlockSequence"==e.name||"BlockMapping"==e.name)return O.column(e.from,1);if("QuotedLiteral"==e.name)return null;if("Literal"==e.name){let n=O.column(e.from,1);if(n==O.lineIndent(e.from,1))return n;if(e.to>O.pos)return null}}return null},FlowMapping:s({closing:"}"}),FlowSequence:s({closing:"]"})}),c.add({"FlowMapping FlowSequence":i,"Item Pair BlockLiteral":(O,e)=>({from:e.doc.lineAt(O.from).to,to:O.to})})]}),languageData:{commentTokens:{line:"#"},indentOnInput:/^\s*[\]\}]$/}});function G(){return new Q(V)}const _=P.define({name:"yaml-frontmatter",parser:C.configure({props:[n({DashLine:a.meta})]})});function w(O){let{language:e,support:n}=O.content instanceof Q?O.content:{language:O.content,support:[]};return new Q(_.configure({wrap:o((O=>"FrontmatterContent"==O.name?{parser:V.parser}:"Body"==O.name?{parser:e.parser}:null))}),n)}export{G as yaml,w as yamlFrontmatter,V as yamlLanguage};
