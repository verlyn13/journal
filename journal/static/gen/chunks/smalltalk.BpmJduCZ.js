
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 10:18:28 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

var e=/[+\-\/\\*~<>=@%|&?!.,:;^]/,t=/true|false|nil|self|super|thisContext/,n=function(e,t){this.next=e,this.parent=t},a=function(e,t,n){this.name=e,this.context=t,this.eos=n},i=function(){this.context=new n(r,null),this.expectVariable=!0,this.indentation=0,this.userIndentationDelta=0};i.prototype.userIndent=function(e,t){this.userIndentationDelta=e>0?e/t-this.indentation:0};var r=function(i,r,c){var x=new a(null,r,!1),h=i.next();return'"'===h?x=o(i,new n(o,r)):"'"===h?x=s(i,new n(s,r)):"#"===h?"'"===i.peek()?(i.next(),x=l(i,new n(l,r))):i.eatWhile(/[^\s.{}\[\]()]/)?x.name="string.special":x.name="meta":"$"===h?("<"===i.next()&&(i.eatWhile(/[^\s>]/),i.next()),x.name="string.special"):"|"===h&&c.expectVariable?x.context=new n(u,r):/[\[\]{}()]/.test(h)?(x.name="bracket",x.eos=/[\[{(]/.test(h),"["===h?c.indentation++:"]"===h&&(c.indentation=Math.max(0,c.indentation-1))):e.test(h)?(i.eatWhile(e),x.name="operator",x.eos=";"!==h):/\d/.test(h)?(i.eatWhile(/[\w\d]/),x.name="number"):/[\w_]/.test(h)?(i.eatWhile(/[\w\d_]/),x.name=c.expectVariable?t.test(i.current())?"keyword":"variable":null):x.eos=c.expectVariable,x},o=function(e,t){return e.eatWhile(/[^"]/),new a("comment",e.eat('"')?t.parent:t,!0)},s=function(e,t){return e.eatWhile(/[^']/),new a("string",e.eat("'")?t.parent:t,!1)},l=function(e,t){return e.eatWhile(/[^']/),new a("string.special",e.eat("'")?t.parent:t,!1)},u=function(e,t){var n=new a(null,t,!1);return"|"===e.next()?(n.context=t.parent,n.eos=!0):(e.eatWhile(/[^|]/),n.name="variable"),n};const c={name:"smalltalk",startState:function(){return new i},token:function(e,t){if(t.userIndent(e.indentation(),e.indentUnit),e.eatSpace())return null;var n=t.context.next(e,t.context,t);return t.context=n.context,t.expectVariable=n.eos,n.name},blankLine:function(e,t){e.userIndent(0,t)},indent:function(e,t,n){var a=e.context.next===r&&t&&"]"===t.charAt(0)?-1:e.userIndentationDelta;return(e.indentation+a)*n.unit},languageData:{indentOnInput:/^\s*\]$/}};export{c as smalltalk};
