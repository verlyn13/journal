
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 8:27:44 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

function O(O){for(var T={},E=O.split(" "),I=0;I<E.length;++I)T[E[I]]=!0;return T}var T="ABS ACOS ARITY ASIN ATAN AVG BAGSIZE BINSTORAGE BLOOM BUILDBLOOM CBRT CEIL CONCAT COR COS COSH COUNT COUNT_STAR COV CONSTANTSIZE CUBEDIMENSIONS DIFF DISTINCT DOUBLEABS DOUBLEAVG DOUBLEBASE DOUBLEMAX DOUBLEMIN DOUBLEROUND DOUBLESUM EXP FLOOR FLOATABS FLOATAVG FLOATMAX FLOATMIN FLOATROUND FLOATSUM GENERICINVOKER INDEXOF INTABS INTAVG INTMAX INTMIN INTSUM INVOKEFORDOUBLE INVOKEFORFLOAT INVOKEFORINT INVOKEFORLONG INVOKEFORSTRING INVOKER ISEMPTY JSONLOADER JSONMETADATA JSONSTORAGE LAST_INDEX_OF LCFIRST LOG LOG10 LOWER LONGABS LONGAVG LONGMAX LONGMIN LONGSUM MAX MIN MAPSIZE MONITOREDUDF NONDETERMINISTIC OUTPUTSCHEMA  PIGSTORAGE PIGSTREAMING RANDOM REGEX_EXTRACT REGEX_EXTRACT_ALL REPLACE ROUND SIN SINH SIZE SQRT STRSPLIT SUBSTRING SUM STRINGCONCAT STRINGMAX STRINGMIN STRINGSIZE TAN TANH TOBAG TOKENIZE TOMAP TOP TOTUPLE TRIM TEXTLOADER TUPLESIZE UCFIRST UPPER UTF8STORAGECONVERTER ",E="VOID IMPORT RETURNS DEFINE LOAD FILTER FOREACH ORDER CUBE DISTINCT COGROUP JOIN CROSS UNION SPLIT INTO IF OTHERWISE ALL AS BY USING INNER OUTER ONSCHEMA PARALLEL PARTITION GROUP AND OR NOT GENERATE FLATTEN ASC DESC IS STREAM THROUGH STORE MAPREDUCE SHIP CACHE INPUT OUTPUT STDERROR STDIN STDOUT LIMIT SAMPLE LEFT RIGHT FULL EQ GT LT GTE LTE NEQ MATCHES TRUE FALSE DUMP",I="BOOLEAN INT LONG FLOAT DOUBLE CHARARRAY BYTEARRAY BAG TUPLE MAP ",N=O(T),A=O(E),e=O(I),R=/[*+\-%<>=&?:\/!|]/;function S(O,T,E){return T.tokenize=E,E(O,T)}function t(O,T){for(var E,I=!1;E=O.next();){if("/"==E&&I){T.tokenize=L;break}I="*"==E}return"comment"}function L(O,T){var E,I=O.next();return'"'==I||"'"==I?S(O,T,(E=I,function(O,T){for(var I,N=!1,A=!1;null!=(I=O.next());){if(I==E&&!N){A=!0;break}N=!N&&"\\"==I}return!A&&N||(T.tokenize=L),"error"})):/[\[\]{}\(\),;\.]/.test(I)?null:/\d/.test(I)?(O.eatWhile(/[\w\.]/),"number"):"/"==I?O.eat("*")?S(O,T,t):(O.eatWhile(R),"operator"):"-"==I?O.eat("-")?(O.skipToEnd(),"comment"):(O.eatWhile(R),"operator"):R.test(I)?(O.eatWhile(R),"operator"):(O.eatWhile(/[\w\$_]/),A&&A.propertyIsEnumerable(O.current().toUpperCase())&&!O.eat(")")&&!O.eat(".")?"keyword":N&&N.propertyIsEnumerable(O.current().toUpperCase())?"builtin":e&&e.propertyIsEnumerable(O.current().toUpperCase())?"type":"variable")}const r={name:"pig",startState:function(){return{tokenize:L,startOfLine:!0}},token:function(O,T){return O.eatSpace()?null:T.tokenize(O,T)},languageData:{autocomplete:(T+I+E).split(" ")}};export{r as pig};
