
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 8:29:09 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

var e=["From","Sender","Reply-To","To","Cc","Bcc","Message-ID","In-Reply-To","References","Resent-From","Resent-Sender","Resent-To","Resent-Cc","Resent-Bcc","Resent-Message-ID","Return-Path","Received"],n=["Date","Subject","Comments","Keywords","Resent-Date"],r=/^[ \t]/,t=/^From /,a=new RegExp("^("+e.join("|")+"): "),i=new RegExp("^("+n.join("|")+"): "),o=/^[^:]+:/,d=/^[^ ]+@[^ ]+/,m=/^.*?(?=[^ ]+?@[^ ]+)/,s=/^<.*?>/,c=/^.*?(?=<.*>)/;const u={name:"mbox",startState:function(){return{inSeparator:!1,inHeader:!1,emailPermitted:!1,header:null,inHeaders:!1}},token:function(e,n){if(e.sol()){if(n.inSeparator=!1,n.inHeader&&e.match(r))return null;if(n.inHeader=!1,n.header=null,e.match(t))return n.inHeaders=!0,n.inSeparator=!0,"atom";var u,l=!1;return(u=e.match(i))||(l=!0)&&(u=e.match(a))?(n.inHeaders=!0,n.inHeader=!0,n.emailPermitted=l,n.header=u[1],"atom"):n.inHeaders&&(u=e.match(o))?(n.inHeader=!0,n.emailPermitted=!0,n.header=u[1],"atom"):(n.inHeaders=!1,e.skipToEnd(),null)}if(n.inSeparator)return e.match(d)?"link":(e.match(m)||e.skipToEnd(),"atom");if(n.inHeader){var h=function(e){return"Subject"===e?"header":"string"}(n.header);if(n.emailPermitted){if(e.match(s))return h+" link";if(e.match(c))return h}return e.skipToEnd(),h}return e.skipToEnd(),null},blankLine:function(e){e.inHeaders=e.inSeparator=e.inHeader=!1},languageData:{autocomplete:e.concat(n)}};export{u as mbox};
