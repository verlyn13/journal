
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 10:25:04 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

function t(t){n(t,"start");var i={},s=t.languageData||{},o=!1;for(var d in t)if(d!=s&&t.hasOwnProperty(d))for(var u=i[d]=[],p=t[d],g=0;g<p.length;g++){var l=p[g];u.push(new e(l,t)),(l.indent||l.dedent)&&(o=!0)}return{name:s.name,startState:function(){return{state:"start",pending:null,indent:o?[]:null}},copyState:function(t){var n={state:t.state,pending:t.pending,indent:t.indent&&t.indent.slice(0)};return t.stack&&(n.stack=t.stack.slice(0)),n},token:a(i),indent:r(i,s),mergeTokens:s.mergeTokens,languageData:s}}function n(t,n){if(!t.hasOwnProperty(n))throw new Error("Undefined state "+n+" in simple mode")}function e(t,e){(t.next||t.push)&&n(e,t.next||t.push),this.regex=function(t){if(!t)return/(?:)/;var n="";return t instanceof RegExp?(t.ignoreCase&&(n="i"),t=t.source):t=String(t),new RegExp("^(?:"+t+")",n)}(t.regex),this.token=function(t){if(!t)return null;if(t.apply)return t;if("string"==typeof t)return t.replace(/\./g," ");for(var n=[],e=0;e<t.length;e++)n.push(t[e]&&t[e].replace(/\./g," "));return n}(t.token),this.data=t}function a(t){return function(n,e){if(e.pending){var a=e.pending.shift();return 0==e.pending.length&&(e.pending=null),n.pos+=a.text.length,a.token}for(var r=t[e.state],i=0;i<r.length;i++){var s=r[i],o=(!s.data.sol||n.sol())&&n.match(s.regex);if(o){s.data.next?e.state=s.data.next:s.data.push?((e.stack||(e.stack=[])).push(e.state),e.state=s.data.push):s.data.pop&&e.stack&&e.stack.length&&(e.state=e.stack.pop()),s.data.indent&&e.indent.push(n.indentation()+n.indentUnit),s.data.dedent&&e.indent.pop();var d=s.token;if(d&&d.apply&&(d=d(o)),o.length>2&&s.token&&"string"!=typeof s.token){e.pending=[];for(var u=2;u<o.length;u++)o[u]&&e.pending.push({text:o[u],token:s.token[u-1]});return n.backUp(o[0].length-(o[1]?o[1].length:0)),d[0]}return d&&d.join?d[0]:d}}return n.next(),null}}function r(t,n){return function(e,a){if(null==e.indent||n.dontIndentStates&&n.dontIndentStates.indexOf(e.state)>-1)return null;var r=e.indent.length-1,i=t[e.state];t:for(;;){for(var s=0;s<i.length;s++){var o=i[s];if(o.data.dedent&&!1!==o.data.dedentIfLineStart){var d=o.regex.exec(a);if(d&&d[0]){r--,(o.next||o.push)&&(i=t[o.next||o.push]),a=a.slice(d[0].length);continue t}}}break}return r<0?0:e.indent[r]}}export{t as s};
