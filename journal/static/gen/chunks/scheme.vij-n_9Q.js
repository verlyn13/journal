
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 9:54:47 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

var e="comment",t="string",n="symbol",r="atom",a="number",i="bracket";function s(e){for(var t={},n=e.split(" "),r=0;r<n.length;++r)t[n[r]]=!0;return t}var c=s("λ case-lambda call/cc class cond-expand define-class define-values exit-handler field import inherit init-field interface let*-values let-values let/ec mixin opt-lambda override protect provide public rename require require-for-syntax syntax syntax-case syntax-error unit/sig unless when with-syntax and begin call-with-current-continuation call-with-input-file call-with-output-file case cond define define-syntax define-macro defmacro delay do dynamic-wind else for-each if lambda let let* let-syntax letrec letrec-syntax map or syntax-rules abs acos angle append apply asin assoc assq assv atan boolean? caar cadr call-with-input-file call-with-output-file call-with-values car cdddar cddddr cdr ceiling char->integer char-alphabetic? char-ci<=? char-ci<? char-ci=? char-ci>=? char-ci>? char-downcase char-lower-case? char-numeric? char-ready? char-upcase char-upper-case? char-whitespace? char<=? char<? char=? char>=? char>? char? close-input-port close-output-port complex? cons cos current-input-port current-output-port denominator display eof-object? eq? equal? eqv? eval even? exact->inexact exact? exp expt #f floor force gcd imag-part inexact->exact inexact? input-port? integer->char integer? interaction-environment lcm length list list->string list->vector list-ref list-tail list? load log magnitude make-polar make-rectangular make-string make-vector max member memq memv min modulo negative? newline not null-environment null? number->string number? numerator odd? open-input-file open-output-file output-port? pair? peek-char port? positive? procedure? quasiquote quote quotient rational? rationalize read read-char real-part real? remainder reverse round scheme-report-environment set! set-car! set-cdr! sin sqrt string string->list string->number string->symbol string-append string-ci<=? string-ci<? string-ci=? string-ci>=? string-ci>? string-copy string-fill! string-length string-ref string-set! string<=? string<? string=? string>=? string>? string? substring symbol->string symbol? #t tan transcript-off transcript-on truncate values vector vector->list vector-fill! vector-length vector-ref vector-set! with-input-from-file with-output-to-file write write-char zero?"),l=s("define let letrec let* lambda define-macro defmacro let-syntax letrec-syntax let-values let*-values define-syntax syntax-rules define-values when unless");function o(e,t,n){this.indent=e,this.type=t,this.prev=n}function d(e,t,n){e.indentStack=new o(t,n,e.indentStack)}var u=new RegExp(/^(?:[-+]i|[-+][01]+#*(?:\/[01]+#*)?i|[-+]?[01]+#*(?:\/[01]+#*)?@[-+]?[01]+#*(?:\/[01]+#*)?|[-+]?[01]+#*(?:\/[01]+#*)?[-+](?:[01]+#*(?:\/[01]+#*)?)?i|[-+]?[01]+#*(?:\/[01]+#*)?)(?=[()\s;"]|$)/i),m=new RegExp(/^(?:[-+]i|[-+][0-7]+#*(?:\/[0-7]+#*)?i|[-+]?[0-7]+#*(?:\/[0-7]+#*)?@[-+]?[0-7]+#*(?:\/[0-7]+#*)?|[-+]?[0-7]+#*(?:\/[0-7]+#*)?[-+](?:[0-7]+#*(?:\/[0-7]+#*)?)?i|[-+]?[0-7]+#*(?:\/[0-7]+#*)?)(?=[()\s;"]|$)/i),p=new RegExp(/^(?:[-+]i|[-+][\da-f]+#*(?:\/[\da-f]+#*)?i|[-+]?[\da-f]+#*(?:\/[\da-f]+#*)?@[-+]?[\da-f]+#*(?:\/[\da-f]+#*)?|[-+]?[\da-f]+#*(?:\/[\da-f]+#*)?[-+](?:[\da-f]+#*(?:\/[\da-f]+#*)?)?i|[-+]?[\da-f]+#*(?:\/[\da-f]+#*)?)(?=[()\s;"]|$)/i),f=new RegExp(/^(?:[-+]i|[-+](?:(?:(?:\d+#+\.?#*|\d+\.\d*#*|\.\d+#*|\d+)(?:[esfdl][-+]?\d+)?)|\d+#*\/\d+#*)i|[-+]?(?:(?:(?:\d+#+\.?#*|\d+\.\d*#*|\.\d+#*|\d+)(?:[esfdl][-+]?\d+)?)|\d+#*\/\d+#*)@[-+]?(?:(?:(?:\d+#+\.?#*|\d+\.\d*#*|\.\d+#*|\d+)(?:[esfdl][-+]?\d+)?)|\d+#*\/\d+#*)|[-+]?(?:(?:(?:\d+#+\.?#*|\d+\.\d*#*|\.\d+#*|\d+)(?:[esfdl][-+]?\d+)?)|\d+#*\/\d+#*)[-+](?:(?:(?:\d+#+\.?#*|\d+\.\d*#*|\.\d+#*|\d+)(?:[esfdl][-+]?\d+)?)|\d+#*\/\d+#*)?i|(?:(?:(?:\d+#+\.?#*|\d+\.\d*#*|\.\d+#*|\d+)(?:[esfdl][-+]?\d+)?)|\d+#*\/\d+#*))(?=[()\s;"]|$)/i);function h(e){return e.match(u)}function g(e){return e.match(m)}function x(e,t){return!0===t&&e.backUp(1),e.match(f)}function b(e){return e.match(p)}function v(e,t){for(var n,r=!1;null!=(n=e.next());){if(n==t.token&&!r){t.state.mode=!1;break}r=!r&&"\\"==n}}const k={name:"scheme",startState:function(){return{indentStack:null,indentation:0,mode:!1,sExprComment:!1,sExprQuote:!1}},token:function(s,o){if(null==o.indentStack&&s.sol()&&(o.indentation=s.indentation()),s.eatSpace())return null;var u=null;switch(o.mode){case"string":v(s,{token:'"',state:o}),u=t;break;case"symbol":v(s,{token:"|",state:o}),u=n;break;case"comment":for(var m,p=!1;null!=(m=s.next());){if("#"==m&&p){o.mode=!1;break}p="|"==m}u=e;break;case"s-expr-comment":if(o.mode=!1,"("!=s.peek()&&"["!=s.peek()){s.eatWhile(/[^\s\(\)\[\]]/),u=e;break}o.sExprComment=0;default:var f=s.next();if('"'==f)o.mode="string",u=t;else if("'"==f)"("==s.peek()||"["==s.peek()?("number"!=typeof o.sExprQuote&&(o.sExprQuote=0),u=r):(s.eatWhile(/[\w_\-!$%&*+\.\/:<=>?@\^~]/),u=r);else if("|"==f)o.mode="symbol",u=n;else if("#"==f)if(s.eat("|"))o.mode="comment",u=e;else if(s.eat(/[tf]/i))u=r;else if(s.eat(";"))o.mode="s-expr-comment",u=e;else{var k=null,y=!1,w=!0;s.eat(/[ei]/i)?y=!0:s.backUp(1),s.match(/^#b/i)?k=h:s.match(/^#o/i)?k=g:s.match(/^#x/i)?k=b:s.match(/^#d/i)?k=x:s.match(/^[-+0-9.]/,!1)?(w=!1,k=x):y||s.eat("#"),null!=k&&(w&&!y&&s.match(/^#[ei]/i),k(s)&&(u=a))}else if(/^[-+0-9.]/.test(f)&&x(s,!0))u=a;else if(";"==f)s.skipToEnd(),u=e;else if("("==f||"["==f){for(var E,S="",q=s.column();null!=(E=s.eat(/[^\s\(\[\;\)\]]/));)S+=E;S.length>0&&l.propertyIsEnumerable(S)?d(o,q+2,f):(s.eatSpace(),s.eol()||";"==s.peek()?d(o,q+1,f):d(o,q+s.current().length,f)),s.backUp(s.current().length-1),"number"==typeof o.sExprComment&&o.sExprComment++,"number"==typeof o.sExprQuote&&o.sExprQuote++,u=i}else")"==f||"]"==f?(u=i,null!=o.indentStack&&o.indentStack.type==(")"==f?"(":"[")&&(!function(e){e.indentStack=e.indentStack.prev}(o),"number"==typeof o.sExprComment&&0==--o.sExprComment&&(u=e,o.sExprComment=!1),"number"==typeof o.sExprQuote&&0==--o.sExprQuote&&(u=r,o.sExprQuote=!1))):(s.eatWhile(/[\w_\-!$%&*+\.\/:<=>?@\^~]/),u=c&&c.propertyIsEnumerable(s.current())?"builtin":"variable")}return"number"==typeof o.sExprComment?e:"number"==typeof o.sExprQuote?r:u},indent:function(e){return null==e.indentStack?e.indentation:e.indentStack.indent},languageData:{closeBrackets:{brackets:["(","[","{",'"']},commentTokens:{line:";;"}}};export{k as scheme};
