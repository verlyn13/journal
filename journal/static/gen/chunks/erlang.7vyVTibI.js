
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 9:43:20 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

var e=["-type","-spec","-export_type","-opaque"],t=["after","begin","catch","case","cond","end","fun","if","let","of","query","receive","try","when"],n=/[\->,;]/,r=["->",";",","],i=["and","andalso","band","bnot","bor","bsl","bsr","bxor","div","not","or","orelse","rem","xor"],o=/[\+\-\*\/<>=\|:!]/,a=["=","+","-","*","/",">",">=","<","=<","=:=","==","=/=","/=","||","<-","!"],c=/[<\(\[\{]/,u=["<<","(","[","{"],s=/[>\)\]\}]/,l=["}","]",")",">>"],_=["is_atom","is_binary","is_bitstring","is_boolean","is_float","is_function","is_integer","is_list","is_number","is_pid","is_port","is_record","is_reference","is_tuple","atom","binary","bitstring","boolean","function","integer","list","number","pid","port","record","reference","tuple"],f=["abs","adler32","adler32_combine","alive","apply","atom_to_binary","atom_to_list","binary_to_atom","binary_to_existing_atom","binary_to_list","binary_to_term","bit_size","bitstring_to_list","byte_size","check_process_code","contact_binary","crc32","crc32_combine","date","decode_packet","delete_module","disconnect_node","element","erase","exit","float","float_to_list","garbage_collect","get","get_keys","group_leader","halt","hd","integer_to_list","internal_bif","iolist_size","iolist_to_binary","is_alive","is_atom","is_binary","is_bitstring","is_boolean","is_float","is_function","is_integer","is_list","is_number","is_pid","is_port","is_process_alive","is_record","is_reference","is_tuple","length","link","list_to_atom","list_to_binary","list_to_bitstring","list_to_existing_atom","list_to_float","list_to_integer","list_to_pid","list_to_tuple","load_module","make_ref","module_loaded","monitor_node","node","node_link","node_unlink","nodes","notalive","now","open_port","pid_to_list","port_close","port_command","port_connect","port_control","pre_loaded","process_flag","process_info","processes","purge_module","put","register","registered","round","self","setelement","size","spawn","spawn_link","spawn_monitor","spawn_opt","split_binary","statistics","term_to_binary","time","throw","tl","trunc","tuple_size","tuple_to_list","unlink","unregister","whereis"],p=/[\w@Ø-ÞÀ-Öß-öø-ÿ]/,m=/[0-7]{1,3}|[bdefnrstv\\"']|\^[a-zA-Z]|x[0-9a-zA-Z]{2}|x{[0-9a-zA-Z]+}/;function d(e,t,n){if(1==e.current().length&&t.test(e.current())){for(e.backUp(1);t.test(e.peek());)if(e.next(),y(e.current(),n))return!0;e.backUp(e.current().length-1)}return!1}function b(e,t,n){if(1==e.current().length&&t.test(e.current())){for(;t.test(e.peek());)e.next();for(;0<e.current().length;){if(y(e.current(),n))return!0;e.backUp(1)}e.next()}return!1}function k(e){return h(e,'"',"\\")}function g(e){return h(e,"'","\\")}function h(e,t,n){for(;!e.eol();){var r=e.next();if(r==t)return!0;r==n&&e.next()}return!1}function y(e,t){return-1<t.indexOf(e)}function v(e,t,n){switch(function(e,t){"comment"!=t.type&&"whitespace"!=t.type&&(e.tokenStack=function(e,t){var n=e.length-1;0<n&&"record"===e[n].type&&"dot"===t.type?e.pop():0<n&&"group"===e[n].type?(e.pop(),e.push(t)):e.push(t);return e}(e.tokenStack,t),e.tokenStack=function(e){if(!e.length)return e;var t=e.length-1;if("dot"===e[t].type)return[];if(t>1&&"fun"===e[t].type&&"fun"===e[t-1].token)return e.slice(0,t-1);switch(e[t].token){case"}":return z(e,{g:["{"]});case"]":return z(e,{i:["["]});case")":return z(e,{i:["("]});case">>":return z(e,{i:["<<"]});case"end":return z(e,{i:["begin","case","fun","if","receive","try"]});case",":return z(e,{e:["begin","try","when","->",",","(","[","{","<<"]});case"->":return z(e,{r:["when"],m:["try","if","case","receive"]});case";":return z(e,{E:["case","fun","if","receive","try","when"]});case"catch":return z(e,{e:["try"]});case"of":return z(e,{e:["case"]});case"after":return z(e,{e:["receive","try"]});default:return e}}(e.tokenStack))}(e,function(e,t){return w(t.current(),t.column(),t.indentation(),e)}(n,t)),n){case"atom":case"boolean":return"atom";case"attribute":return"attribute";case"builtin":return"builtin";case"close_paren":case"colon":case"dot":case"open_paren":case"separator":default:return null;case"comment":return"comment";case"error":return"error";case"fun":return"meta";case"function":return"tag";case"guard":return"property";case"keyword":return"keyword";case"macro":return"macroName";case"number":return"number";case"operator":return"operator";case"record":return"bracket";case"string":return"string";case"type":return"def";case"variable":return"variable"}}function w(e,t,n,r){return{token:e,column:t,indent:n,type:r}}function x(e){return w(e,0,0,e)}function S(e,t){var n=e.tokenStack.length,r=t||1;return!(n<r)&&e.tokenStack[n-r]}function z(e,t){for(var n in t)for(var r=e.length-1,i=t[n],o=r-1;-1<o;o--)if(y(e[o].token,i)){var a=e.slice(0,o);switch(n){case"m":return a.concat(e[o]).concat(e[r]);case"r":return a.concat(e[r]);case"i":return a;case"g":return a.concat(x("group"));case"E":case"e":return a.concat(e[o])}}return"E"==n?[]:e}function W(e,t){var n=e.tokenStack,r=U(n,"token",t);return!!A(n[r])&&n[r]}function U(e,t,n){for(var r=e.length-1;-1<r;r--)if(y(e[r][t],n))return r;return!1}function A(e){return!1!==e&&null!=e}const E={name:"erlang",startState:()=>({tokenStack:[],in_string:!1,in_atom:!1}),token:function(h,w){if(w.in_string)return w.in_string=!k(h),v(w,h,"string");if(w.in_atom)return w.in_atom=!g(h),v(w,h,"atom");if(h.eatSpace())return v(w,h,"whitespace");if(!S(w)&&h.match(/-\s*[a-zß-öø-ÿ][\wØ-ÞÀ-Öß-öø-ÿ]*/))return y(h.current(),e)?v(w,h,"type"):v(w,h,"attribute");var x=h.next();if("%"==x)return h.skipToEnd(),v(w,h,"comment");if(":"==x)return v(w,h,"colon");if("?"==x)return h.eatSpace(),h.eatWhile(p),v(w,h,"macro");if("#"==x)return h.eatSpace(),h.eatWhile(p),v(w,h,"record");if("$"==x)return"\\"!=h.next()||h.match(m)?v(w,h,"number"):v(w,h,"error");if("."==x)return v(w,h,"dot");if("'"==x){if(!(w.in_atom=!g(h))){if(h.match(/\s*\/\s*[0-9]/,!1))return h.match(/\s*\/\s*[0-9]/,!0),v(w,h,"fun");if(h.match(/\s*\(/,!1)||h.match(/\s*:/,!1))return v(w,h,"function")}return v(w,h,"atom")}if('"'==x)return w.in_string=!k(h),v(w,h,"string");if(/[A-Z_Ø-ÞÀ-Ö]/.test(x))return h.eatWhile(p),v(w,h,"variable");if(/[a-z_ß-öø-ÿ]/.test(x)){if(h.eatWhile(p),h.match(/\s*\/\s*[0-9]/,!1))return h.match(/\s*\/\s*[0-9]/,!0),v(w,h,"fun");var z=h.current();return y(z,t)?v(w,h,"keyword"):y(z,i)?v(w,h,"operator"):h.match(/\s*\(/,!1)?!y(z,f)||":"==S(w).token&&"erlang"!=S(w,2).token?y(z,_)?v(w,h,"guard"):v(w,h,"function"):v(w,h,"builtin"):":"==function(e){var t=e.match(/^\s*([^\s%])/,!1);return t?t[1]:""}(h)?v(w,h,"erlang"==z?"builtin":"function"):y(z,["true","false"])?v(w,h,"boolean"):v(w,h,"atom")}var W=/[0-9]/;return W.test(x)?(h.eatWhile(W),h.eat("#")?h.eatWhile(/[0-9a-zA-Z]/)||h.backUp(1):h.eat(".")&&(h.eatWhile(W)?h.eat(/[eE]/)&&(h.eat(/[-+]/)?h.eatWhile(W)||h.backUp(2):h.eatWhile(W)||h.backUp(1)):h.backUp(1)),v(w,h,"number")):d(h,c,u)?v(w,h,"open_paren"):d(h,s,l)?v(w,h,"close_paren"):b(h,n,r)?v(w,h,"separator"):b(h,o,a)?v(w,h,"operator"):v(w,h,null)},indent:function(e,t,n){var r,i,o=A(i=t.match(/,|[a-z]+|\}|\]|\)|>>|\|+|\(/))&&0===i.index?i[0]:"",a=S(e,1),c=S(e,2);return e.in_string||e.in_atom?null:c?"when"==a.token?a.column+n.unit:"when"===o&&"function"===c.type?c.indent+n.unit:"("===o&&"fun"===a.token?a.column+3:"catch"===o&&(r=W(e,["try"]))?r.column:y(o,["end","after","of"])?(r=W(e,["begin","case","fun","if","receive","try"]))?r.column:null:y(o,l)?(r=W(e,u))?r.column:null:y(a.token,[",","|","||"])||y(o,[",","|","||"])?(r=function(e){var t=e.tokenStack.slice(0,-1),n=U(t,"type",["open_paren"]);return!!A(t[n])&&t[n]}(e))?r.column+r.token.length:n.unit:"->"==a.token?y(c.token,["receive","case","if","try"])?c.column+n.unit+n.unit:c.column+n.unit:y(a.token,u)?a.column+a.token.length:(r=function(e){var t=e.tokenStack,n=U(t,"type",["open_paren","separator","keyword"]),r=U(t,"type",["operator"]);return A(n)&&A(r)&&n<r?t[n+1]:!!A(n)&&t[n]}(e),A(r)?r.column+n.unit:0):0},languageData:{commentTokens:{line:"%"}}};export{E as erlang};
