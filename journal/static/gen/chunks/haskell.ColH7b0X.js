
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 9:58:07 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

function e(e,t,r){return t(r),r(e,t)}var t=/[a-z_]/,r=/[A-Z]/,n=/\d/,a=/[0-9A-Fa-f]/,i=/[0-7]/,o=/[a-z_A-Z0-9'\xa1-\uffff]/,l=/[-!#$%&*+.\/<=>?@\\^|~:]/,u=/[(),;[\]`{}]/,s=/[ \t\v\f]/;function f(f,m){if(f.eatWhile(s))return null;var h=f.next();if(u.test(h)){if("{"==h&&f.eat("-")){var p="comment";return f.eat("#")&&(p="meta"),e(f,m,c(p,1))}return null}if("'"==h)return f.eat("\\"),f.next(),f.eat("'")?"string":"error";if('"'==h)return e(f,m,d);if(r.test(h))return f.eatWhile(o),f.eat(".")?"qualifier":"type";if(t.test(h))return f.eatWhile(o),"variable";if(n.test(h)){if("0"==h){if(f.eat(/[xX]/))return f.eatWhile(a),"integer";if(f.eat(/[oO]/))return f.eatWhile(i),"number"}f.eatWhile(n);p="number";return f.match(/^\.\d+/)&&(p="number"),f.eat(/[eE]/)&&(p="number",f.eat(/[-+]/),f.eatWhile(n)),p}return"."==h&&f.eat(".")?"keyword":l.test(h)?"-"==h&&f.eat(/-/)&&(f.eatWhile(/-/),!f.eat(l))?(f.skipToEnd(),"comment"):(f.eatWhile(l),"variable"):"error"}function c(e,t){return 0==t?f:function(r,n){for(var a=t;!r.eol();){var i=r.next();if("{"==i&&r.eat("-"))++a;else if("-"==i&&r.eat("}")&&0==--a)return n(f),e}return n(c(e,a)),e}}function d(e,t){for(;!e.eol();){var r=e.next();if('"'==r)return t(f),"string";if("\\"==r){if(e.eol()||e.eat(s))return t(m),"string";e.eat("&")||e.next()}}return t(f),"error"}function m(t,r){return t.eat("\\")?e(t,r,d):(t.next(),r(f),"error")}var h=function(){var e={};function t(t){return function(){for(var r=0;r<arguments.length;r++)e[arguments[r]]=t}}return t("keyword")("case","class","data","default","deriving","do","else","foreign","if","import","in","infix","infixl","infixr","instance","let","module","newtype","of","then","type","where","_"),t("keyword")("..",":","::","=","\\","<-","->","@","~","=>"),t("builtin")("!!","$!","$","&&","+","++","-",".","/","/=","<","<*","<=","<$>","<*>","=<<","==",">",">=",">>",">>=","^","^^","||","*","*>","**"),t("builtin")("Applicative","Bool","Bounded","Char","Double","EQ","Either","Enum","Eq","False","FilePath","Float","Floating","Fractional","Functor","GT","IO","IOError","Int","Integer","Integral","Just","LT","Left","Maybe","Monad","Nothing","Num","Ord","Ordering","Rational","Read","ReadS","Real","RealFloat","RealFrac","Right","Show","ShowS","String","True"),t("builtin")("abs","acos","acosh","all","and","any","appendFile","asTypeOf","asin","asinh","atan","atan2","atanh","break","catch","ceiling","compare","concat","concatMap","const","cos","cosh","curry","cycle","decodeFloat","div","divMod","drop","dropWhile","either","elem","encodeFloat","enumFrom","enumFromThen","enumFromThenTo","enumFromTo","error","even","exp","exponent","fail","filter","flip","floatDigits","floatRadix","floatRange","floor","fmap","foldl","foldl1","foldr","foldr1","fromEnum","fromInteger","fromIntegral","fromRational","fst","gcd","getChar","getContents","getLine","head","id","init","interact","ioError","isDenormalized","isIEEE","isInfinite","isNaN","isNegativeZero","iterate","last","lcm","length","lex","lines","log","logBase","lookup","map","mapM","mapM_","max","maxBound","maximum","maybe","min","minBound","minimum","mod","negate","not","notElem","null","odd","or","otherwise","pi","pred","print","product","properFraction","pure","putChar","putStr","putStrLn","quot","quotRem","read","readFile","readIO","readList","readLn","readParen","reads","readsPrec","realToFrac","recip","rem","repeat","replicate","return","reverse","round","scaleFloat","scanl","scanl1","scanr","scanr1","seq","sequence","sequence_","show","showChar","showList","showParen","showString","shows","showsPrec","significand","signum","sin","sinh","snd","span","splitAt","sqrt","subtract","succ","sum","tail","take","takeWhile","tan","tanh","toEnum","toInteger","toRational","truncate","uncurry","undefined","unlines","until","unwords","unzip","unzip3","userError","words","writeFile","zip","zip3","zipWith","zipWith3"),e}();const p={name:"haskell",startState:function(){return{f:f}},copyState:function(e){return{f:e.f}},token:function(e,t){var r=t.f(e,(function(e){t.f=e})),n=e.current();return h.hasOwnProperty(n)?h[n]:r},languageData:{commentTokens:{line:"--",block:{open:"{-",close:"-}"}}}};export{p as haskell};
