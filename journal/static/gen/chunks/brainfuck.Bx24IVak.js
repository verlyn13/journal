
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 8:29:09 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

var e="><+-.,[]".split("");const t={name:"brainfuck",startState:function(){return{commentLine:!1,left:0,right:0,commentLoop:!1}},token:function(t,n){if(t.eatSpace())return null;t.sol()&&(n.commentLine=!1);var o=t.next().toString();return-1===e.indexOf(o)?(n.commentLine=!0,t.eol()&&(n.commentLine=!1),"comment"):!0===n.commentLine?(t.eol()&&(n.commentLine=!1),"comment"):"]"===o||"["===o?("["===o?n.left++:n.right++,"bracket"):"+"===o||"-"===o?"keyword":"<"===o||">"===o?"atom":"."===o||","===o?"def":void(t.eol()&&(n.commentLine=!1))}};export{t as brainfuck};
