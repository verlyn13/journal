
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 8:30:46 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

var e="error";function t(e){return new RegExp("^(("+e.join(")|(")+"))\\b")}var n=/^(?:->|=>|\+[+=]?|-[\-=]?|\*[\*=]?|\/[\/=]?|[=!]=|<[><]?=?|>>?=?|%=?|&=?|\|=?|\^=?|\~|!|\?|(or|and|\|\||&&|\?)=)/,r=/^(?:[()\[\]{},:`=;]|\.\.?\.?)/,o=/^[_A-Za-z$][_A-Za-z$0-9]*/,c=/^@[_A-Za-z$][_A-Za-z$0-9]*/,i=t(["and","or","not","is","isnt","in","instanceof","typeof"]),a=["for","while","loop","if","unless","else","switch","try","catch","finally","class"],f=t(a.concat(["break","by","continue","debugger","delete","do","in","of","new","return","then","this","@","throw","when","until","extends"]));a=t(a);var p=/^('{3}|\"{3}|['\"])/,s=/^(\/{3}|\/)/,u=t(["Infinity","NaN","undefined","null","true","false","on","off","yes","no"]);function l(t,a){if(t.sol()){null===a.scope.align&&(a.scope.align=!1);var l=a.scope.offset;if(t.eatSpace()){var h=t.indentation();return h>l&&"coffee"==a.scope.type?"indent":h<l?"dedent":null}l>0&&v(t,a)}if(t.eatSpace())return null;var k=t.peek();if(t.match("####"))return t.skipToEnd(),"comment";if(t.match("###"))return a.tokenize=m,a.tokenize(t,a);if("#"===k)return t.skipToEnd(),"comment";if(t.match(/^-?[0-9\.]/,!1)){var g=!1;if(t.match(/^-?\d*\.\d+(e[\+\-]?\d+)?/i)&&(g=!0),t.match(/^-?\d+\.\d*/)&&(g=!0),t.match(/^-?\.\d+/)&&(g=!0),g)return"."==t.peek()&&t.backUp(1),"number";var y=!1;if(t.match(/^-?0x[0-9a-f]+/i)&&(y=!0),t.match(/^-?[1-9]\d*(e[\+\-]?\d+)?/)&&(y=!0),t.match(/^-?0(?![\dx])/i)&&(y=!0),y)return"number"}if(t.match(p))return a.tokenize=d(t.current(),!1,"string"),a.tokenize(t,a);if(t.match(s)){if("/"!=t.current()||t.match(/^.*\//,!1))return a.tokenize=d(t.current(),!0,"string.special"),a.tokenize(t,a);t.backUp(1)}return t.match(n)||t.match(i)?"operator":t.match(r)?"punctuation":t.match(u)?"atom":t.match(c)||a.prop&&t.match(o)?"property":t.match(f)?"keyword":t.match(o)?"variable":(t.next(),e)}function d(e,t,n){return function(r,o){for(;!r.eol();)if(r.eatWhile(/[^'"\/\\]/),r.eat("\\")){if(r.next(),t&&r.eol())return n}else{if(r.match(e))return o.tokenize=l,n;r.eat(/['"\/]/)}return t&&(o.tokenize=l),n}}function m(e,t){for(;!e.eol();){if(e.eatWhile(/[^#]/),e.match("###")){t.tokenize=l;break}e.eatWhile("#")}return"comment"}function h(e,t,n="coffee"){for(var r=0,o=!1,c=null,i=t.scope;i;i=i.prev)if("coffee"===i.type||"}"==i.type){r=i.offset+e.indentUnit;break}"coffee"!==n?(o=null,c=e.column()+e.current().length):t.scope.align&&(t.scope.align=!1),t.scope={offset:r,type:n,prev:t.scope,align:o,alignOffset:c}}function v(e,t){if(t.scope.prev){if("coffee"===t.scope.type){for(var n=e.indentation(),r=!1,o=t.scope;o;o=o.prev)if(n===o.offset){r=!0;break}if(!r)return!0;for(;t.scope.prev&&t.scope.offset!==n;)t.scope=t.scope.prev;return!1}return t.scope=t.scope.prev,!1}}const k={name:"coffeescript",startState:function(){return{tokenize:l,scope:{offset:0,type:"coffee",prev:null,align:!1},prop:!1,dedent:0}},token:function(t,n){var r=null===n.scope.align&&n.scope;r&&t.sol()&&(r.align=!1);var o=function(t,n){var r=n.tokenize(t,n),o=t.current();"return"===o&&(n.dedent=!0),(("->"===o||"=>"===o)&&t.eol()||"indent"===r)&&h(t,n);var c="[({".indexOf(o);if(-1!==c&&h(t,n,"])}".slice(c,c+1)),a.exec(o)&&h(t,n),"then"==o&&v(t,n),"dedent"===r&&v(t,n))return e;if(-1!==(c="])}".indexOf(o))){for(;"coffee"==n.scope.type&&n.scope.prev;)n.scope=n.scope.prev;n.scope.type==o&&(n.scope=n.scope.prev)}return n.dedent&&t.eol()&&("coffee"==n.scope.type&&n.scope.prev&&(n.scope=n.scope.prev),n.dedent=!1),"indent"==r||"dedent"==r?null:r}(t,n);return o&&"comment"!=o&&(r&&(r.align=!0),n.prop="punctuation"==o&&"."==t.current()),o},indent:function(e,t){if(e.tokenize!=l)return 0;var n=e.scope,r=t&&"])}".indexOf(t.charAt(0))>-1;if(r)for(;"coffee"==n.type&&n.prev;)n=n.prev;var o=r&&n.type===t.charAt(0);return n.align?n.alignOffset-(o?1:0):(o?n.prev:n).offset},languageData:{commentTokens:{line:"#"}}};export{k as coffeeScript};
