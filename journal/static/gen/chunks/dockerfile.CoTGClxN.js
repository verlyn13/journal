
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 9:44:11 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

import{s as e}from"./simple-mode.V19QDECL.js";var n="from",t=new RegExp("^(\\s*)\\b("+n+")\\b","i"),r=["run","cmd","entrypoint","shell"],o=new RegExp("^(\\s*)("+r.join("|")+")(\\s+\\[)","i"),l="expose",s=new RegExp("^(\\s*)("+l+")(\\s+)","i"),x="("+[n,l].concat(r).concat(["arg","from","maintainer","label","env","add","copy","volume","user","workdir","onbuild","stopsignal","healthcheck","shell"]).join("|")+")";const g=e({start:[{regex:/^\s*#.*$/,sol:!0,token:"comment"},{regex:t,token:[null,"keyword"],sol:!0,next:"from"},{regex:new RegExp("^(\\s*)"+x+"(\\s*)(#.*)?$","i"),token:[null,"keyword",null,"error"],sol:!0},{regex:o,token:[null,"keyword",null],sol:!0,next:"array"},{regex:s,token:[null,"keyword",null],sol:!0,next:"expose"},{regex:new RegExp("^(\\s*)"+x+"(\\s+)","i"),token:[null,"keyword",null],sol:!0,next:"arguments"},{regex:/./,token:null}],from:[{regex:/\s*$/,token:null,next:"start"},{regex:/(\s*)(#.*)$/,token:[null,"error"],next:"start"},{regex:/(\s*\S+\s+)(as)/i,token:[null,"keyword"],next:"start"},{token:null,next:"start"}],single:[{regex:/(?:[^\\']|\\.)/,token:"string"},{regex:/'/,token:"string",pop:!0}],double:[{regex:/(?:[^\\"]|\\.)/,token:"string"},{regex:/"/,token:"string",pop:!0}],array:[{regex:/\]/,token:null,next:"start"},{regex:/"(?:[^\\"]|\\.)*"?/,token:"string"}],expose:[{regex:/\d+$/,token:"number",next:"start"},{regex:/[^\d]+$/,token:null,next:"start"},{regex:/\d+/,token:"number"},{regex:/[^\d]+/,token:null},{token:null,next:"start"}],arguments:[{regex:/^\s*#.*$/,sol:!0,token:"comment"},{regex:/"(?:[^\\"]|\\.)*"?$/,token:"string",next:"start"},{regex:/"/,token:"string",push:"double"},{regex:/'(?:[^\\']|\\.)*'?$/,token:"string",next:"start"},{regex:/'/,token:"string",push:"single"},{regex:/[^#"']+[\\`]$/,token:null},{regex:/[^#"']+$/,token:null,next:"start"},{regex:/[^#"']+/,token:null},{token:null,next:"start"}],languageData:{commentTokens:{line:"#"}}});export{g as dockerFile};
