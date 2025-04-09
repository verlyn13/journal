
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 9:49:39 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

var e=function(e,t){var n=t.next||"start";t.next=t.next;var r=x[n];if(r.splice){for(var o=0;o<r.length;++o){var a=r[o];if(a.regex&&e.match(a.regex))return t.next=a.next||t.next,a.token}return e.next(),"error"}return e.match(a=x[n])&&a.regex&&e.match(a.regex)?(t.next=a.next,a.token):(e.next(),"error")},t="(?![\\d\\s])[$\\w\\xAA-\\uFFDC](?:(?!\\s)[$\\w\\xAA-\\uFFDC]|-[A-Za-z])*",n=RegExp("(?:[({[=:]|[-~]>|\\b(?:e(?:lse|xport)|d(?:o|efault)|t(?:ry|hen)|finally|import(?:\\s*all)?|const|var|let|new|catch(?:\\s*"+t+")?))\\s*$"),r="(?![$\\w]|-[A-Za-z]|\\s*:(?![:=]))",o={token:"string",regex:".+"},x={start:[{token:"docComment",regex:"/\\*",next:"comment"},{token:"comment",regex:"#.*"},{token:"keyword",regex:"(?:t(?:h(?:is|row|en)|ry|ypeof!?)|c(?:on(?:tinue|st)|a(?:se|tch)|lass)|i(?:n(?:stanceof)?|mp(?:ort(?:\\s+all)?|lements)|[fs])|d(?:e(?:fault|lete|bugger)|o)|f(?:or(?:\\s+own)?|inally|unction)|s(?:uper|witch)|e(?:lse|x(?:tends|port)|val)|a(?:nd|rguments)|n(?:ew|ot)|un(?:less|til)|w(?:hile|ith)|o[fr]|return|break|let|var|loop)"+r},{token:"atom",regex:"(?:true|false|yes|no|on|off|null|void|undefined)"+r},{token:"invalid",regex:"(?:p(?:ackage|r(?:ivate|otected)|ublic)|i(?:mplements|nterface)|enum|static|yield)"+r},{token:"className.standard",regex:"(?:R(?:e(?:gExp|ferenceError)|angeError)|S(?:tring|yntaxError)|E(?:rror|valError)|Array|Boolean|Date|Function|Number|Object|TypeError|URIError)"+r},{token:"variableName.function.standard",regex:"(?:is(?:NaN|Finite)|parse(?:Int|Float)|Math|JSON|(?:en|de)codeURI(?:Component)?)"+r},{token:"variableName.standard",regex:"(?:t(?:hat|il|o)|f(?:rom|allthrough)|it|by|e)"+r},{token:"variableName",regex:t+"\\s*:(?![:=])"},{token:"variableName",regex:t},{token:"operatorKeyword",regex:"(?:\\.{3}|\\s+\\?)"},{token:"keyword",regex:"(?:@+|::|\\.\\.)",next:"key"},{token:"operatorKeyword",regex:"\\.\\s*",next:"key"},{token:"string",regex:"\\\\\\S[^\\s,;)}\\]]*"},{token:"docString",regex:"'''",next:"qdoc"},{token:"docString",regex:'"""',next:"qqdoc"},{token:"string",regex:"'",next:"qstring"},{token:"string",regex:'"',next:"qqstring"},{token:"string",regex:"`",next:"js"},{token:"string",regex:"<\\[",next:"words"},{token:"regexp",regex:"//",next:"heregex"},{token:"regexp",regex:"\\/(?:[^[\\/\\n\\\\]*(?:(?:\\\\.|\\[[^\\]\\n\\\\]*(?:\\\\.[^\\]\\n\\\\]*)*\\])[^[\\/\\n\\\\]*)*)\\/[gimy$]{0,4}",next:"key"},{token:"number",regex:"(?:0x[\\da-fA-F][\\da-fA-F_]*|(?:[2-9]|[12]\\d|3[0-6])r[\\da-zA-Z][\\da-zA-Z_]*|(?:\\d[\\d_]*(?:\\.\\d[\\d_]*)?|\\.\\d[\\d_]*)(?:e[+-]?\\d[\\d_]*)?[\\w$]*)"},{token:"paren",regex:"[({[]"},{token:"paren",regex:"[)}\\]]",next:"key"},{token:"operatorKeyword",regex:"\\S+"},{token:"content",regex:"\\s+"}],heregex:[{token:"regexp",regex:".*?//[gimy$?]{0,4}",next:"start"},{token:"regexp",regex:"\\s*#{"},{token:"comment",regex:"\\s+(?:#.*)?"},{token:"regexp",regex:"\\S+"}],key:[{token:"operatorKeyword",regex:"[.?@!]+"},{token:"variableName",regex:t,next:"start"},{token:"content",regex:"",next:"start"}],comment:[{token:"docComment",regex:".*?\\*/",next:"start"},{token:"docComment",regex:".+"}],qdoc:[{token:"string",regex:".*?'''",next:"key"},o],qqdoc:[{token:"string",regex:'.*?"""',next:"key"},o],qstring:[{token:"string",regex:"[^\\\\']*(?:\\\\.[^\\\\']*)*'",next:"key"},o],qqstring:[{token:"string",regex:'[^\\\\"]*(?:\\\\.[^\\\\"]*)*"',next:"key"},o],js:[{token:"string",regex:"[^\\\\`]*(?:\\\\.[^\\\\`]*)*`",next:"key"},o],words:[{token:"string",regex:".*?\\]>",next:"key"},o]};for(var a in x){var g=x[a];if(g.splice)for(var s=0,i=g.length;s<i;++s){var k=g[s];"string"==typeof k.regex&&(x[a][s].regex=new RegExp("^"+k.regex))}else"string"==typeof k.regex&&(x[a].regex=new RegExp("^"+g.regex))}const l={name:"livescript",startState:function(){return{next:"start",lastToken:{style:null,indent:0,content:""}}},token:function(t,n){for(;t.pos==t.start;)var r=e(t,n);return n.lastToken={style:r,indent:t.indentation(),content:t.current()},r.replace(/\./g," ")},indent:function(e){var t=e.lastToken.indent;return e.lastToken.content.match(n)&&(t+=2),t}};export{l as liveScript};
