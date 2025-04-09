
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 8:32:01 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

function e(e){return new RegExp("^(("+e.join(")|(")+"))\\b")}var t=/[\^@!\|<>#~\.\*\-\+\\/,=]/,n=/(<-)|(:=)|(=<)|(>=)|(<=)|(<:)|(>:)|(=:)|(\\=)|(\\=:)|(!!)|(==)|(::)/,r=/(:::)|(\.\.\.)|(=<:)|(>=:)/,a=["in","then","else","of","elseof","elsecase","elseif","catch","finally","with","require","prepare","import","export","define","do"],o=["end"],i=e(["true","false","nil","unit"]),c=e(["andthen","at","attr","declare","feat","from","lex","mod","div","mode","orelse","parser","prod","prop","scanner","self","syn","token"]),u=e(["local","proc","fun","case","class","if","cond","or","dis","choice","not","thread","try","raise","lock","for","suchthat","meth","functor"]),s=e(a),f=e(o);function l(e,a){if(e.eatSpace())return null;if(e.match(/[{}]/))return"bracket";if(e.match("[]"))return"keyword";if(e.match(r)||e.match(n))return"operator";if(e.match(i))return"atom";var o=e.match(u);if(o)return a.doInCurrentLine?a.doInCurrentLine=!1:a.currentIndent++,"proc"==o[0]||"fun"==o[0]?a.tokenize=m:"class"==o[0]?a.tokenize=d:"meth"==o[0]&&(a.tokenize=h),"keyword";if(e.match(s)||e.match(c))return"keyword";if(e.match(f))return a.currentIndent--,"keyword";var p,z=e.next();if('"'==z||"'"==z)return a.tokenize=(p=z,function(e,t){for(var n,r=!1,a=!1;null!=(n=e.next());){if(n==p&&!r){a=!0;break}r=!r&&"\\"==n}return!a&&r||(t.tokenize=l),"string"}),a.tokenize(e,a);if(/[~\d]/.test(z)){if("~"==z){if(!/^[0-9]/.test(e.peek()))return null;if("0"==e.next()&&e.match(/^[xX][0-9a-fA-F]+/)||e.match(/^[0-9]*(\.[0-9]+)?([eE][~+]?[0-9]+)?/))return"number"}return"0"==z&&e.match(/^[xX][0-9a-fA-F]+/)||e.match(/^[0-9]*(\.[0-9]+)?([eE][~+]?[0-9]+)?/)?"number":null}return"%"==z?(e.skipToEnd(),"comment"):"/"==z&&e.eat("*")?(a.tokenize=k,k(e,a)):t.test(z)?"operator":(e.eatWhile(/\w/),"variable")}function d(e,t){return e.eatSpace()?null:(e.match(/([A-Z][A-Za-z0-9_]*)|(`.+`)/),t.tokenize=l,"type")}function h(e,t){return e.eatSpace()?null:(e.match(/([a-zA-Z][A-Za-z0-9_]*)|(`.+`)/),t.tokenize=l,"def")}function m(e,t){return e.eatSpace()?null:!t.hasPassedFirstStage&&e.eat("{")?(t.hasPassedFirstStage=!0,"bracket"):t.hasPassedFirstStage?(e.match(/([A-Z][A-Za-z0-9_]*)|(`.+`)|\$/),t.hasPassedFirstStage=!1,t.tokenize=l,"def"):(t.tokenize=l,null)}function k(e,t){for(var n,r=!1;n=e.next();){if("/"==n&&r){t.tokenize=l;break}r="*"==n}return"comment"}const p={name:"oz",startState:function(){return{tokenize:l,currentIndent:0,doInCurrentLine:!1,hasPassedFirstStage:!1}},token:function(e,t){return e.sol()&&(t.doInCurrentLine=0),t.tokenize(e,t)},indent:function(e,t,n){var r=t.replace(/^\s+|\s+$/g,"");return r.match(f)||r.match(s)||r.match(/(\[])/)?n.unit*(e.currentIndent-1):e.currentIndent<0?0:e.currentIndent*n.unit},languageData:{indentOnInut:(z=a.concat(o),new RegExp("[\\[\\]]|("+z.join("|")+")$")),commentTokens:{line:"%",block:{open:"/*",close:"*/"}}}};var z;export{p as oz};
