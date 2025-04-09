
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 10:02:04 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

function e(e){return new RegExp("^(("+e.join(")|(")+"))\\b")}var t=e(["and","or","not","is"]),n=["as","assert","break","class","continue","def","del","elif","else","except","finally","for","from","global","if","import","lambda","pass","raise","return","try","while","with","yield","in","False","True"],r=["abs","all","any","bin","bool","bytearray","callable","chr","classmethod","compile","complex","delattr","dict","dir","divmod","enumerate","eval","filter","float","format","frozenset","getattr","globals","hasattr","hash","help","hex","id","input","int","isinstance","issubclass","iter","len","list","locals","map","max","memoryview","min","next","object","oct","open","ord","pow","property","range","repr","reversed","round","set","setattr","slice","sorted","staticmethod","str","sum","super","tuple","type","vars","zip","__import__","NotImplemented","Ellipsis","__debug__"];function i(e){return e.scopes[e.scopes.length-1]}function a(a){for(var o="error",l=a.delimiters||a.singleDelimiters||/^[\(\)\[\]\{\}@,:`=;\.\\]/,s=[a.singleOperators,a.doubleOperators,a.doubleDelimiters,a.tripleDelimiters,a.operators||/^([-+*/%\/&|^]=?|[<>=]+|\/\/=?|\*\*=?|!=|[~!@]|\.\.\.)/],c=0;c<s.length;c++)s[c]||s.splice(c--,1);var u=a.hangingIndent,f=n,p=r;null!=a.extra_keywords&&(f=f.concat(a.extra_keywords)),null!=a.extra_builtins&&(p=p.concat(a.extra_builtins));var d=!(a.version&&Number(a.version)<3);if(d){var m=a.identifiers||/^[_A-Za-z\u00A1-\uFFFF][_A-Za-z0-9\u00A1-\uFFFF]*/;f=f.concat(["nonlocal","None","aiter","anext","async","await","breakpoint","match","case"]),p=p.concat(["ascii","bytes","exec","print"]);var h=new RegExp("^(([rbuf]|(br)|(rb)|(fr)|(rf))?('{3}|\"{3}|['\"]))","i")}else{m=a.identifiers||/^[_A-Za-z][_A-Za-z0-9]*/;f=f.concat(["exec","print"]),p=p.concat(["apply","basestring","buffer","cmp","coerce","execfile","file","intern","long","raw_input","reduce","reload","unichr","unicode","xrange","None"]);h=new RegExp("^(([rubf]|(ur)|(br))?('{3}|\"{3}|['\"]))","i")}var b=e(f),g=e(p);function y(e,t){var n=e.sol()&&"\\"!=t.lastToken;if(n&&(t.indent=e.indentation()),n&&"py"==i(t).type){var r=i(t).offset;if(e.eatSpace()){var a=e.indentation();return a>r?v(e,t):a<r&&x(e,t)&&"#"!=e.peek()&&(t.errorToken=!0),null}var l=k(e,t);return r>0&&x(e,t)&&(l+=" "+o),l}return k(e,t)}function k(e,n,r){if(e.eatSpace())return null;if(!r&&e.match(/^#.*/))return"comment";if(e.match(/^[0-9\.]/,!1)){var i=!1;if(e.match(/^[\d_]*\.\d+(e[\+\-]?\d+)?/i)&&(i=!0),e.match(/^[\d_]+\.\d*/)&&(i=!0),e.match(/^\.\d+/)&&(i=!0),i)return e.eat(/J/i),"number";var c=!1;if(e.match(/^0x[0-9a-f_]+/i)&&(c=!0),e.match(/^0b[01_]+/i)&&(c=!0),e.match(/^0o[0-7_]+/i)&&(c=!0),e.match(/^[1-9][\d_]*(e[\+\-]?[\d_]+)?/)&&(e.eat(/J/i),c=!0),e.match(/^0(?![\dx])/i)&&(c=!0),c)return e.eat(/L/i),"number"}if(e.match(h))return-1!==e.current().toLowerCase().indexOf("f")?(n.tokenize=function(e,t){for(;"rubf".indexOf(e.charAt(0).toLowerCase())>=0;)e=e.substr(1);var n=1==e.length,r="string";function i(e){return function(t,n){var r=k(t,n,!0);return"punctuation"==r&&("{"==t.current()?n.tokenize=i(e+1):"}"==t.current()&&(n.tokenize=e>1?i(e-1):l)),r}}function l(l,s){for(;!l.eol();)if(l.eatWhile(/[^'"\{\}\\]/),l.eat("\\")){if(l.next(),n&&l.eol())return r}else{if(l.match(e))return s.tokenize=t,r;if(l.match("{{"))return r;if(l.match("{",!1))return s.tokenize=i(0),l.current()?r:s.tokenize(l,s);if(l.match("}}"))return r;if(l.match("}"))return o;l.eat(/['"]/)}if(n){if(a.singleLineStringErrors)return o;s.tokenize=t}return r}return l.isString=!0,l}(e.current(),n.tokenize),n.tokenize(e,n)):(n.tokenize=function(e,t){for(;"rubf".indexOf(e.charAt(0).toLowerCase())>=0;)e=e.substr(1);var n=1==e.length,r="string";function i(i,l){for(;!i.eol();)if(i.eatWhile(/[^'"\\]/),i.eat("\\")){if(i.next(),n&&i.eol())return r}else{if(i.match(e))return l.tokenize=t,r;i.eat(/['"]/)}if(n){if(a.singleLineStringErrors)return o;l.tokenize=t}return r}return i.isString=!0,i}(e.current(),n.tokenize),n.tokenize(e,n));for(var u=0;u<s.length;u++)if(e.match(s[u]))return"operator";return e.match(l)?"punctuation":"."==n.lastToken&&e.match(m)?"property":e.match(b)||e.match(t)?"keyword":e.match(g)?"builtin":e.match(/^(self|cls)\b/)?"self":e.match(m)?"def"==n.lastToken||"class"==n.lastToken?"def":"variable":(e.next(),r?null:o)}function v(e,t){for(;"py"!=i(t).type;)t.scopes.pop();t.scopes.push({offset:i(t).offset+e.indentUnit,type:"py",align:null})}function x(e,t){for(var n=e.indentation();t.scopes.length>1&&i(t).offset>n;){if("py"!=i(t).type)return!0;t.scopes.pop()}return i(t).offset!=n}function _(e,t){e.sol()&&(t.beginningOfLine=!0,t.dedent=!1);var n=t.tokenize(e,t),r=e.current();if(t.beginningOfLine&&"@"==r)return e.match(m,!1)?"meta":d?"operator":o;if(/\S/.test(r)&&(t.beginningOfLine=!1),"variable"!=n&&"builtin"!=n||"meta"!=t.lastToken||(n="meta"),"pass"!=r&&"return"!=r||(t.dedent=!0),"lambda"==r&&(t.lambda=!0),":"==r&&!t.lambda&&"py"==i(t).type&&e.match(/^\s*(?:#|$)/,!1)&&v(e,t),1==r.length&&!/string|comment/.test(n)){var a="[({".indexOf(r);if(-1!=a&&function(e,t,n){var r=e.match(/^[\s\[\{\(]*(?:#|$)/,!1)?null:e.column()+1;t.scopes.push({offset:t.indent+(u||e.indentUnit),type:n,align:r})}(e,t,"])}".slice(a,a+1)),-1!=(a="])}".indexOf(r))){if(i(t).type!=r)return o;t.indent=t.scopes.pop().offset-(u||e.indentUnit)}}return t.dedent&&e.eol()&&"py"==i(t).type&&t.scopes.length>1&&t.scopes.pop(),n}return{name:"python",startState:function(){return{tokenize:y,scopes:[{offset:0,type:"py",align:null}],indent:0,lastToken:null,lambda:!1,dedent:0}},token:function(e,t){var n=t.errorToken;n&&(t.errorToken=!1);var r=_(e,t);return r&&"comment"!=r&&(t.lastToken="keyword"==r||"punctuation"==r?e.current():r),"punctuation"==r&&(r=null),e.eol()&&t.lambda&&(t.lambda=!1),n?o:r},indent:function(e,t,n){if(e.tokenize!=y)return e.tokenize.isString?null:0;var r=i(e),a=r.type==t.charAt(0)||"py"==r.type&&!e.dedent&&/^(else:|elif |except |finally:)/.test(t);return null!=r.align?r.align-(a?1:0):r.offset-(a?u||n.unit:0)},languageData:{autocomplete:n.concat(r).concat(["exec","print"]),indentOnInput:/^\s*([\}\]\)]|else:|elif |except |finally:)$/,commentTokens:{line:"#"},closeBrackets:{brackets:["(","[","{","'",'"',"'''",'"""']}}}}const o=a({}),l=a({extra_keywords:(s="by cdef cimport cpdef ctypedef enum except extern gil include nogil property public readonly struct union DEF IF ELIF ELSE",s.split(" "))});var s;export{l as cython,a as mkPython,o as python};
