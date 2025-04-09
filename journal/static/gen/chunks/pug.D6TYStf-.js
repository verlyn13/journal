
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 8:27:44 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

import{javascript as t}from"./javascript.BV3Jxeon.js";var e={"{":"}","(":")","[":"]"};function n(t){if("object"!=typeof t)return t;let e={};for(let n in t){let i=t[n];e[n]=i instanceof Array?i.slice():i}return e}class i{constructor(e){this.indentUnit=e,this.javaScriptLine=!1,this.javaScriptLineExcludesColon=!1,this.javaScriptArguments=!1,this.javaScriptArgumentsDepth=0,this.isInterpolating=!1,this.interpolationNesting=0,this.jsState=t.startState(e),this.restOfLine="",this.isIncludeFiltered=!1,this.isEach=!1,this.lastTag="",this.isAttrs=!1,this.attrsNest=[],this.inAttributeName=!0,this.attributeIsType=!1,this.attrValue="",this.indentOf=1/0,this.indentToken=""}copy(){var e=new i(this.indentUnit);return e.javaScriptLine=this.javaScriptLine,e.javaScriptLineExcludesColon=this.javaScriptLineExcludesColon,e.javaScriptArguments=this.javaScriptArguments,e.javaScriptArgumentsDepth=this.javaScriptArgumentsDepth,e.isInterpolating=this.isInterpolating,e.interpolationNesting=this.interpolationNesting,e.jsState=(t.copyState||n)(this.jsState),e.restOfLine=this.restOfLine,e.isIncludeFiltered=this.isIncludeFiltered,e.isEach=this.isEach,e.lastTag=this.lastTag,e.isAttrs=this.isAttrs,e.attrsNest=this.attrsNest.slice(),e.inAttributeName=this.inAttributeName,e.attributeIsType=this.attributeIsType,e.attrValue=this.attrValue,e.indentOf=this.indentOf,e.indentToken=this.indentToken,e}}function r(t,e){if(t.match("#{"))return e.isInterpolating=!0,e.interpolationNesting=0,"punctuation"}function a(t,e){if(t.match(/^:([\w\-]+)/))return c(t,e),"atom"}function s(n,i){if(i.isAttrs){if(e[n.peek()]&&i.attrsNest.push(e[n.peek()]),i.attrsNest[i.attrsNest.length-1]===n.peek())i.attrsNest.pop();else if(n.eat(")"))return i.isAttrs=!1,"punctuation";if(i.inAttributeName&&n.match(/^[^=,\)!]+/))return"="!==n.peek()&&"!"!==n.peek()||(i.inAttributeName=!1,i.jsState=t.startState(2),"script"===i.lastTag&&"type"===n.current().trim().toLowerCase()?i.attributeIsType=!0:i.attributeIsType=!1),"attribute";var r=t.token(n,i.jsState);if(0===i.attrsNest.length&&("string"===r||"variable"===r||"keyword"===r))try{return Function("","var x "+i.attrValue.replace(/,\s*$/,"").replace(/^!/,"")),i.inAttributeName=!0,i.attrValue="",n.backUp(n.current().length),s(n,i)}catch(t){}return i.attrValue+=n.current(),r||!0}}function c(t,e){e.indentOf=t.indentation(),e.indentToken="string"}const u={startState:function(t){return new i(t)},copyState:function(t){return t.copy()},token:function(e,n){var i=function(t,e){if(t.sol()&&(e.restOfLine=""),e.restOfLine){t.skipToEnd();var n=e.restOfLine;return e.restOfLine="",n}}(e,n)||function(e,n){if(n.isInterpolating){if("}"===e.peek()){if(n.interpolationNesting--,n.interpolationNesting<0)return e.next(),n.isInterpolating=!1,"punctuation"}else"{"===e.peek()&&n.interpolationNesting++;return t.token(e,n.jsState)||!0}}(e,n)||function(t,e){if(e.isIncludeFiltered){var n=a(t,e);return e.isIncludeFiltered=!1,e.restOfLine="string",n}}(e,n)||function(t,e){if(e.isEach){if(t.match(/^ in\b/))return e.javaScriptLine=!0,e.isEach=!1,"keyword";if(t.sol()||t.eol())e.isEach=!1;else if(t.next()){for(;!t.match(/^ in\b/,!1)&&t.next(););return"variable"}}}(e,n)||s(e,n)||function(e,n){if(e.sol()&&(n.javaScriptLine=!1,n.javaScriptLineExcludesColon=!1),n.javaScriptLine){if(n.javaScriptLineExcludesColon&&":"===e.peek())return n.javaScriptLine=!1,void(n.javaScriptLineExcludesColon=!1);var i=t.token(e,n.jsState);return e.eol()&&(n.javaScriptLine=!1),i||!0}}(e,n)||function(e,n){if(n.javaScriptArguments)return 0===n.javaScriptArgumentsDepth&&"("!==e.peek()?void(n.javaScriptArguments=!1):("("===e.peek()?n.javaScriptArgumentsDepth++:")"===e.peek()&&n.javaScriptArgumentsDepth--,0===n.javaScriptArgumentsDepth?void(n.javaScriptArguments=!1):t.token(e,n.jsState)||!0)}(e,n)||function(t,e){if(e.mixinCallAfter)return e.mixinCallAfter=!1,t.match(/^\( *[-\w]+ *=/,!1)||(e.javaScriptArguments=!0,e.javaScriptArgumentsDepth=0),!0}(e,n)||function(t){if(t.match(/^yield\b/))return"keyword"}(e)||function(t){if(t.match(/^(?:doctype) *([^\n]+)?/))return"meta"}(e)||r(e,n)||function(t,e){if(t.match(/^case\b/))return e.javaScriptLine=!0,"keyword"}(e,n)||function(t,e){if(t.match(/^when\b/))return e.javaScriptLine=!0,e.javaScriptLineExcludesColon=!0,"keyword"}(e,n)||function(t){if(t.match(/^default\b/))return"keyword"}(e)||function(t,e){if(t.match(/^extends?\b/))return e.restOfLine="string","keyword"}(e,n)||function(t,e){if(t.match(/^append\b/))return e.restOfLine="variable","keyword"}(e,n)||function(t,e){if(t.match(/^prepend\b/))return e.restOfLine="variable","keyword"}(e,n)||function(t,e){if(t.match(/^block\b *(?:(prepend|append)\b)?/))return e.restOfLine="variable","keyword"}(e,n)||function(t,e){if(t.match(/^include\b/))return e.restOfLine="string","keyword"}(e,n)||function(t,e){if(t.match(/^include:([a-zA-Z0-9\-]+)/,!1)&&t.match("include"))return e.isIncludeFiltered=!0,"keyword"}(e,n)||function(t,e){if(t.match(/^mixin\b/))return e.javaScriptLine=!0,"keyword"}(e,n)||function(t,e){return t.match(/^\+([-\w]+)/)?(t.match(/^\( *[-\w]+ *=/,!1)||(e.javaScriptArguments=!0,e.javaScriptArgumentsDepth=0),"variable"):t.match("+#{",!1)?(t.next(),e.mixinCallAfter=!0,r(t,e)):void 0}(e,n)||function(t,e){if(t.match(/^(if|unless|else if|else)\b/))return e.javaScriptLine=!0,"keyword"}(e,n)||function(t,e){if(t.match(/^(- *)?(each|for)\b/))return e.isEach=!0,"keyword"}(e,n)||function(t,e){if(t.match(/^while\b/))return e.javaScriptLine=!0,"keyword"}(e,n)||function(t,e){var n;if(n=t.match(/^(\w(?:[-:\w]*\w)?)\/?/))return e.lastTag=n[1].toLowerCase(),"tag"}(e,n)||a(e,n)||function(t,e){if(t.match(/^(!?=|-)/))return e.javaScriptLine=!0,"punctuation"}(e,n)||function(t){if(t.match(/^#([\w-]+)/))return"builtin"}(e)||function(t){if(t.match(/^\.([\w-]+)/))return"className"}(e)||function(t,e){if("("==t.peek())return t.next(),e.isAttrs=!0,e.attrsNest=[],e.inAttributeName=!0,e.attrValue="",e.attributeIsType=!1,"punctuation"}(e,n)||function(t,e){if(t.match(/^&attributes\b/))return e.javaScriptArguments=!0,e.javaScriptArgumentsDepth=0,"keyword"}(e,n)||function(t){if(t.sol()&&t.eatSpace())return"indent"}(e)||function(t,e){return t.match(/^(?:\| ?| )([^\n]+)/)?"string":t.match(/^(<[^\n]*)/,!1)?(c(t,e),t.skipToEnd(),e.indentToken):void 0}(e,n)||function(t,e){if(t.match(/^ *\/\/(-)?([^\n]*)/))return e.indentOf=t.indentation(),e.indentToken="comment","comment"}(e,n)||function(t){if(t.match(/^: */))return"colon"}(e)||function(t,e){if(t.eat("."))return c(t,e),"dot"}(e,n)||function(t){return t.next(),null}(e);return!0===i?null:i}};export{u as pug};
