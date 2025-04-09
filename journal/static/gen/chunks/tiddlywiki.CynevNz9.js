
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 8:30:46 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

var e={},t={allTags:!0,closeAll:!0,list:!0,newJournal:!0,newTiddler:!0,permaview:!0,saveChanges:!0,search:!0,slider:!0,tabs:!0,tag:!0,tagging:!0,tags:!0,tiddler:!0,timeline:!0,today:!0,version:!0,option:!0,with:!0,filter:!0},r=/[\w_\-]/i,n=/^\-\-\-\-+$/,i=/^\/\*\*\*$/,a=/^\*\*\*\/$/,o=/^<<<$/,u=/^\/\/\{\{\{$/,f=/^\/\/\}\}\}$/,c=/^<!--\{\{\{-->$/,m=/^<!--\}\}\}-->$/,l=/^\{\{\{$/,k=/^\}\}\}$/,h=/.*?\}\}\}/;function s(e,t,r){return t.tokenize=r,r(e,t)}function p(t,k){var h=t.sol(),p=t.peek();if(k.block=!1,h&&/[<\/\*{}\-]/.test(p)){if(t.match(l))return k.block=!0,s(t,k,$);if(t.match(o))return"quote";if(t.match(i)||t.match(a))return"comment";if(t.match(u)||t.match(f)||t.match(c)||t.match(m))return"comment";if(t.match(n))return"contentSeparator"}if(t.next(),h&&/[\/\*!#;:>|]/.test(p)){if("!"==p)return t.skipToEnd(),"header";if("*"==p)return t.eatWhile("*"),"comment";if("#"==p)return t.eatWhile("#"),"comment";if(";"==p)return t.eatWhile(";"),"comment";if(":"==p)return t.eatWhile(":"),"comment";if(">"==p)return t.eatWhile(">"),"quote";if("|"==p)return"header"}if("{"==p&&t.match("{{"))return s(t,k,$);if(/[hf]/i.test(p)&&/[ti]/i.test(t.peek())&&t.match(/\b(ttps?|tp|ile):\/\/[\-A-Z0-9+&@#\/%?=~_|$!:,.;]*[A-Z0-9+&@#\/%=~_|$]/i))return"link";if('"'==p)return"string";if("~"==p)return"brace";if(/[\[\]]/.test(p)&&t.match(p))return"brace";if("@"==p)return t.eatWhile(r),"link";if(/\d/.test(p))return t.eatWhile(/\d/),"number";if("/"==p){if(t.eat("%"))return s(t,k,d);if(t.eat("/"))return s(t,k,v)}if("_"==p&&t.eat("_"))return s(t,k,z);if("-"==p&&t.eat("-")){if(" "!=t.peek())return s(t,k,w);if(" "==t.peek())return"brace"}return"'"==p&&t.eat("'")?s(t,k,b):"<"==p&&t.eat("<")?s(t,k,x):(t.eatWhile(/[\w\$_]/),e.propertyIsEnumerable(t.current())?"keyword":null)}function d(e,t){for(var r,n=!1;r=e.next();){if("/"==r&&n){t.tokenize=p;break}n="%"==r}return"comment"}function b(e,t){for(var r,n=!1;r=e.next();){if("'"==r&&n){t.tokenize=p;break}n="'"==r}return"strong"}function $(e,t){var r=t.block;return r&&e.current()?"comment":!r&&e.match(h)||r&&e.sol()&&e.match(k)?(t.tokenize=p,"comment"):(e.next(),"comment")}function v(e,t){for(var r,n=!1;r=e.next();){if("/"==r&&n){t.tokenize=p;break}n="/"==r}return"emphasis"}function z(e,t){for(var r,n=!1;r=e.next();){if("_"==r&&n){t.tokenize=p;break}n="_"==r}return"link"}function w(e,t){for(var r,n=!1;r=e.next();){if("-"==r&&n){t.tokenize=p;break}n="-"==r}return"deleted"}function x(e,r){if("<<"==e.current())return"meta";var n=e.next();return n?">"==n&&">"==e.peek()?(e.next(),r.tokenize=p,"meta"):(e.eatWhile(/[\w\$_]/),t.propertyIsEnumerable(e.current())?"keyword":null):(r.tokenize=p,null)}const g={name:"tiddlywiki",startState:function(){return{tokenize:p}},token:function(e,t){return e.eatSpace()?null:t.tokenize(e,t)}};export{g as tiddlyWiki};
