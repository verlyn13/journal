
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 5:35:17 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

function e(e){return new RegExp("^(?:"+e.join("|")+")$","i")}var t=e(["_G","_VERSION","assert","collectgarbage","dofile","error","getfenv","getmetatable","ipairs","load","loadfile","loadstring","module","next","pairs","pcall","print","rawequal","rawget","rawset","require","select","setfenv","setmetatable","tonumber","tostring","type","unpack","xpcall","coroutine.create","coroutine.resume","coroutine.running","coroutine.status","coroutine.wrap","coroutine.yield","debug.debug","debug.getfenv","debug.gethook","debug.getinfo","debug.getlocal","debug.getmetatable","debug.getregistry","debug.getupvalue","debug.setfenv","debug.sethook","debug.setlocal","debug.setmetatable","debug.setupvalue","debug.traceback","close","flush","lines","read","seek","setvbuf","write","io.close","io.flush","io.input","io.lines","io.open","io.output","io.popen","io.read","io.stderr","io.stdin","io.stdout","io.tmpfile","io.type","io.write","math.abs","math.acos","math.asin","math.atan","math.atan2","math.ceil","math.cos","math.cosh","math.deg","math.exp","math.floor","math.fmod","math.frexp","math.huge","math.ldexp","math.log","math.log10","math.max","math.min","math.modf","math.pi","math.pow","math.rad","math.random","math.randomseed","math.sin","math.sinh","math.sqrt","math.tan","math.tanh","os.clock","os.date","os.difftime","os.execute","os.exit","os.getenv","os.remove","os.rename","os.setlocale","os.time","os.tmpname","package.cpath","package.loaded","package.loaders","package.loadlib","package.path","package.preload","package.seeall","string.byte","string.char","string.dump","string.find","string.format","string.gmatch","string.gsub","string.len","string.lower","string.match","string.rep","string.reverse","string.sub","string.upper","table.concat","table.insert","table.maxn","table.remove","table.sort"]),n=e(["and","break","elseif","false","nil","not","or","return","true","function","end","if","then","else","do","while","repeat","until","for","in","local"]),a=e(["function","if","repeat","do","\\(","{"]),r=e(["end","until","\\)","}"]),o=new RegExp("^(?:"+["end","until","\\)","}","else","elseif"].join("|")+")","i");function i(e){for(var t=0;e.eat("=");)++t;return e.eat("["),t}function s(e,t){var n,a=e.next();return"-"==a&&e.eat("-")?e.eat("[")&&e.eat("[")?(t.cur=l(i(e),"comment"))(e,t):(e.skipToEnd(),"comment"):'"'==a||"'"==a?(t.cur=(n=a,function(e,t){for(var a,r=!1;null!=(a=e.next())&&(a!=n||r);)r=!r&&"\\"==a;return r||(t.cur=s),"string"}))(e,t):"["==a&&/[\[=]/.test(e.peek())?(t.cur=l(i(e),"string"))(e,t):/\d/.test(a)?(e.eatWhile(/[\w.%]/),"number"):/[\w_]/.test(a)?(e.eatWhile(/[\w\\\-_.]/),"variable"):null}function l(e,t){return function(n,a){for(var r,o=null;null!=(r=n.next());)if(null==o)"]"==r&&(o=0);else if("="==r)++o;else{if("]"==r&&o==e){a.cur=s;break}o=null}return t}}const u={name:"lua",startState:function(){return{basecol:0,indentDepth:0,cur:s}},token:function(e,o){if(e.eatSpace())return null;var i=o.cur(e,o),s=e.current();return"variable"==i&&(n.test(s)?i="keyword":t.test(s)&&(i="builtin")),"comment"!=i&&"string"!=i&&(a.test(s)?++o.indentDepth:r.test(s)&&--o.indentDepth),i},indent:function(e,t,n){var a=o.test(t);return e.basecol+n.unit*(e.indentDepth-(a?1:0))},languageData:{indentOnInput:/^\s*(?:end|until|else|\)|\})$/,commentTokens:{line:"--",block:{open:"--[[",close:"]]--"}}}};export{u as lua};
