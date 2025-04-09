
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 10:20:42 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

function e(e){for(var t={},n=e.split(" "),r=0;r<n.length;++r)t[n[r]]=!0;return t}const t={keywords:e("DEFINITIONS OBJECTS IF DERIVED INFORMATION ACTION REPLY ANY NAMED CHARACTERIZED BEHAVIOUR REGISTERED WITH AS IDENTIFIED CONSTRAINED BY PRESENT BEGIN IMPORTS FROM UNITS SYNTAX MIN-ACCESS MAX-ACCESS MINACCESS MAXACCESS REVISION STATUS DESCRIPTION SEQUENCE SET COMPONENTS OF CHOICE DistinguishedName ENUMERATED SIZE MODULE END INDEX AUGMENTS EXTENSIBILITY IMPLIED EXPORTS"),cmipVerbs:e("ACTIONS ADD GET NOTIFICATIONS REPLACE REMOVE"),compareTypes:e("OPTIONAL DEFAULT MANAGED MODULE-TYPE MODULE_IDENTITY MODULE-COMPLIANCE OBJECT-TYPE OBJECT-IDENTITY OBJECT-COMPLIANCE MODE CONFIRMED CONDITIONAL SUBORDINATE SUPERIOR CLASS TRUE FALSE NULL TEXTUAL-CONVENTION"),status:e("current deprecated mandatory obsolete"),tags:e("APPLICATION AUTOMATIC EXPLICIT IMPLICIT PRIVATE TAGS UNIVERSAL"),storage:e("BOOLEAN INTEGER OBJECT IDENTIFIER BIT OCTET STRING UTCTime InterfaceIndex IANAifType CMIP-Attribute REAL PACKAGE PACKAGES IpAddress PhysAddress NetworkAddress BITS BMPString TimeStamp TimeTicks TruthValue RowStatus DisplayString GeneralString GraphicString IA5String NumericString PrintableString SnmpAdminString TeletexString UTF8String VideotexString VisibleString StringStore ISO646String T61String UniversalString Unsigned32 Integer32 Gauge Gauge32 Counter Counter32 Counter64"),modifier:e("ATTRIBUTE ATTRIBUTES MANDATORY-GROUP MANDATORY-GROUPS GROUP GROUPS ELEMENTS EQUALITY ORDERING SUBSTRINGS DEFINED"),accessTypes:e("not-accessible accessible-for-notify read-only read-create read-write"),multiLineStrings:!0};function n(e){var n=e.keywords||t.keywords,r=e.cmipVerbs||t.cmipVerbs,i=e.compareTypes||t.compareTypes,E=e.status||t.status,a=e.tags||t.tags,s=e.storage||t.storage,o=e.modifier||t.modifier,I=e.accessTypes||t.accessTypes;e.multiLineStrings;var T,S=!1!==e.indentStatements,u=/[\|\^]/;function l(e,t){var S,l=e.next();if('"'==l||"'"==l)return t.tokenize=(S=l,function(e,t){for(var n,r=!1,i=!1;null!=(n=e.next());){if(n==S&&!r){var E=e.peek();E&&("b"!=(E=E.toLowerCase())&&"h"!=E&&"o"!=E||e.next()),i=!0;break}r=!r&&"\\"==n}return i&&(t.tokenize=null),"string"}),t.tokenize(e,t);if(/[\[\]\(\){}:=,;]/.test(l))return T=l,"punctuation";if("-"==l&&e.eat("-"))return e.skipToEnd(),"comment";if(/\d/.test(l))return e.eatWhile(/[\w\.]/),"number";if(u.test(l))return e.eatWhile(u),"operator";e.eatWhile(/[\w\-]/);var A=e.current();return n.propertyIsEnumerable(A)?"keyword":r.propertyIsEnumerable(A)?"variableName":i.propertyIsEnumerable(A)?"atom":E.propertyIsEnumerable(A)?"comment":a.propertyIsEnumerable(A)?"typeName":s.propertyIsEnumerable(A)||o.propertyIsEnumerable(A)||I.propertyIsEnumerable(A)?"modifier":"variableName"}function A(e,t,n,r,i){this.indented=e,this.column=t,this.type=n,this.align=r,this.prev=i}function N(e,t,n){var r=e.indented;return e.context&&"statement"==e.context.type&&(r=e.context.indented),e.context=new A(r,t,n,null,e.context)}function p(e){var t=e.context.type;return")"!=t&&"]"!=t&&"}"!=t||(e.indented=e.context.indented),e.context=e.context.prev}return{name:"asn1",startState:function(){return{tokenize:null,context:new A(-2,0,"top",!1),indented:0,startOfLine:!0}},token:function(e,t){var n=t.context;if(e.sol()&&(null==n.align&&(n.align=!1),t.indented=e.indentation(),t.startOfLine=!0),e.eatSpace())return null;T=null;var r=(t.tokenize||l)(e,t);if("comment"==r)return r;if(null==n.align&&(n.align=!0),";"!=T&&":"!=T&&","!=T||"statement"!=n.type)if("{"==T)N(t,e.column(),"}");else if("["==T)N(t,e.column(),"]");else if("("==T)N(t,e.column(),")");else if("}"==T){for(;"statement"==n.type;)n=p(t);for("}"==n.type&&(n=p(t));"statement"==n.type;)n=p(t)}else T==n.type?p(t):S&&(("}"==n.type||"top"==n.type)&&";"!=T||"statement"==n.type&&"newstatement"==T)&&N(t,e.column(),"statement");else p(t);return t.startOfLine=!1,r},languageData:{indentOnInput:/^\s*[{}]$/,commentTokens:{line:"--"}}}}export{n as asn1};
