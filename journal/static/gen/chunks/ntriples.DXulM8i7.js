
/*
 * Journal Application Bundle
 * Built: 4/8/2025, 10:02:04 PM
 * Environment: production
 *
 * This file is automatically generated by Rollup.
 * Do not edit directly.
 */

var n=0,t=1,e=2,r=3,i=4,a=5,u=6,o=7,s=8,l=9,c=10,f=11,h=12;function p(p,v){var x,b=p.location;x=b==n&&"<"==v?t:b==n&&"_"==v?e:b==r&&"<"==v?i:b==a&&"<"==v?u:b==a&&"_"==v?o:b==a&&'"'==v?s:b==t&&">"==v||b==e&&" "==v?r:b==i&&">"==v?a:b==u&&">"==v||b==o&&" "==v||b==s&&'"'==v||b==l&&" "==v||b==c&&">"==v?f:b==s&&"@"==v?l:b==s&&"^"==v?c:" "!=v||b!=n&&b!=r&&b!=a&&b!=f?b==f&&"."==v?n:h:b,p.location=x}const v={name:"ntriples",startState:function(){return{location:n,uris:[],anchors:[],bnodes:[],langs:[],types:[]}},token:function(n,t){var e=n.next();if("<"==e){p(t,e);var r="";return n.eatWhile((function(n){return"#"!=n&&">"!=n&&(r+=n,!0)})),t.uris.push(r),n.match("#",!1)?"variable":(n.next(),p(t,">"),"variable")}if("#"==e){var i="";return n.eatWhile((function(n){return">"!=n&&" "!=n&&(i+=n,!0)})),t.anchors.push(i),"url"}if(">"==e)return p(t,">"),"variable";if("_"==e){p(t,e);var a="";return n.eatWhile((function(n){return" "!=n&&(a+=n,!0)})),t.bnodes.push(a),n.next(),p(t," "),"builtin"}if('"'==e)return p(t,e),n.eatWhile((function(n){return'"'!=n})),n.next(),"@"!=n.peek()&&"^"!=n.peek()&&p(t,'"'),"string";if("@"==e){p(t,"@");var u="";return n.eatWhile((function(n){return" "!=n&&(u+=n,!0)})),t.langs.push(u),n.next(),p(t," "),"string.special"}if("^"==e){n.next(),p(t,"^");var o="";return n.eatWhile((function(n){return">"!=n&&(o+=n,!0)})),t.types.push(o),n.next(),p(t,">"),"variable"}" "==e&&p(t,e),"."==e&&p(t,e)}};export{v as ntriples};
