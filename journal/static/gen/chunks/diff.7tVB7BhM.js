
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 2:29:10 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

var e={"+":"inserted","-":"deleted","@":"meta"};const r={name:"diff",token:function(r){var n=r.string.search(/[\t ]+?$/);if(!r.sol()||0===n)return r.skipToEnd(),("error "+(e[r.string.charAt(0)]||"")).replace(/ $/,"");var t=e[r.peek()]||r.skipToEnd();return-1===n?r.skipToEnd():r.pos=n,t}};export{r as diff};
