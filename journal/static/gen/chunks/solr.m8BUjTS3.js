
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 10:02:04 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

var t=/[^\s\|\!\+\-\*\?\~\^\&\:\(\)\[\]\{\}\"\\]/,e=/[\|\!\+\-\*\?\~\^\&]/,n=/^(OR|AND|NOT|TO)$/;function r(e){return function(r,i){for(var u=e;(e=r.peek())&&null!=e.match(t);)u+=r.next();return i.tokenize=o,n.test(u)?"operator":function(t){return parseFloat(t).toString()===t}(u)?"number":":"==r.peek()?"propertyName":"string"}}function o(n,i){var u,a,k=n.next();return'"'==k?i.tokenize=(a=k,function(t,e){for(var n,r=!1;null!=(n=t.next())&&(n!=a||r);)r=!r&&"\\"==n;return r||(e.tokenize=o),"string"}):e.test(k)?i.tokenize=(u=k,function(t,e){return"|"==u?t.eat(/\|/):"&"==u&&t.eat(/\&/),e.tokenize=o,"operator"}):t.test(k)&&(i.tokenize=r(k)),i.tokenize!=o?i.tokenize(n,i):null}const i={name:"solr",startState:function(){return{tokenize:o}},token:function(t,e){return t.eatSpace()?null:e.tokenize(t,e)}};export{i as solr};
