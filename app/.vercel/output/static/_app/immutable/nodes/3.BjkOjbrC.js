import{d as Jt,f as w,t as F,b as p,g as jt,s as Zt,a as $t}from"../chunks/disclose-version.BbHg_3cr.js";import{i as rt}from"../chunks/legacy.4_-7NDyu.js";import{d as te,E as ee,g as ne,aN as re,l as ae,G as oe,h as st,i as Mt,k as kt,j as ie,A as se,F as le,L as ue,O as Ct,K as At,p as z,aO as I,ag as O,aI as T,a6 as t,a7 as k,aP as G,f as x,c as R,a as Q,r as N,t as ot,aQ as Ft,as as lt,s as yt}from"../chunks/index-client.Bm3hC5iA.js";import{b as Bt,s as _t}from"../chunks/render.BD8I6o9n.js";import{i as D}from"../chunks/if.D9LSaWDq.js";import{s as Ot}from"../chunks/attributes.CJjV9I4q.js";import{p as M}from"../chunks/preload-helper.BqZSpHe9.js";import{e as pt,i as bt}from"../chunks/each.C5ZC5uao.js";import{s as U,g as fe,c as ce,b as de,r as he}from"../chunks/client.C1mLzEnz.js";import{c as ut}from"../chunks/svelte-component.B153s9Q5.js";function me(r,n,e,a,c,d){let u=st;st&&Mt();var l,h,m=null;st&&kt.nodeType===1&&(m=kt,Mt());var y=st?kt:r,g;te(()=>{const v=n()||null;var _=v==="svg"?re:null;v!==l&&(g&&(v===null?ie(g,()=>{g=null,h=null}):v===h?se(g):(le(g),Bt(!1))),v&&v!==h&&(g=ne(()=>{if(m=st?m:_?document.createElementNS(_,v):document.createElement(v),Jt(m,m),a){var S=st?ue(m):m.appendChild(ae());st&&(S===null?Ct(!1):At(S)),a(m,S)}oe.nodes_end=m,y.before(m)})),l=v,l&&(h=l),Bt(!0))},ee),u&&(Ct(!0),At(y))}function Et(r,n){var e=Object.keys(r);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(r);n&&(a=a.filter(function(c){return Object.getOwnPropertyDescriptor(r,c).enumerable})),e.push.apply(e,a)}return e}function Lt(r){for(var n=1;n<arguments.length;n++){var e=arguments[n]!=null?arguments[n]:{};n%2?Et(Object(e),!0).forEach(function(a){ve(r,a,e[a])}):Object.getOwnPropertyDescriptors?Object.defineProperties(r,Object.getOwnPropertyDescriptors(e)):Et(Object(e)).forEach(function(a){Object.defineProperty(r,a,Object.getOwnPropertyDescriptor(e,a))})}return r}function ve(r,n,e){return(n=pe(n))in r?Object.defineProperty(r,n,{value:e,enumerable:!0,configurable:!0,writable:!0}):r[n]=e,r}function pe(r){var n=ge(r,"string");return typeof n=="symbol"?n:n+""}function ge(r,n){if(typeof r!="object"||!r)return r;var e=r[Symbol.toPrimitive];if(e!==void 0){var a=e.call(r,n||"default");if(typeof a!="object")return a;throw new TypeError("@@toPrimitive must return a primitive value.")}return(n==="string"?String:Number)(r)}function xt(r){return r._type==="span"&&"text"in r&&typeof r.text=="string"&&(typeof r.marks>"u"||Array.isArray(r.marks)&&r.marks.every(n=>typeof n=="string"))}function Kt(r){return typeof r._type=="string"&&r._type[0]!=="@"&&(!("markDefs"in r)||!r.markDefs||Array.isArray(r.markDefs)&&r.markDefs.every(n=>typeof n._key=="string"))&&"children"in r&&Array.isArray(r.children)&&r.children.every(n=>typeof n=="object"&&"_type"in n)}function Wt(r){return Kt(r)&&"listItem"in r&&typeof r.listItem=="string"&&(typeof r.level>"u"||typeof r.level=="number")}function qt(r){return r._type==="@list"}function Vt(r){return r._type==="@span"}function zt(r){return r._type==="@text"}const Dt=["strong","em","code","underline","strike-through"];function _e(r,n,e){if(!xt(r)||!r.marks)return[];if(!r.marks.length)return[];const a=r.marks.slice(),c={};return a.forEach(d=>{c[d]=1;for(let u=n+1;u<e.length;u++){const l=e[u];if(l&&xt(l)&&Array.isArray(l.marks)&&l.marks.indexOf(d)!==-1)c[d]++;else break}}),a.sort((d,u)=>ye(c,d,u))}function ye(r,n,e){const a=r[n],c=r[e];if(a!==c)return c-a;const d=Dt.indexOf(n),u=Dt.indexOf(e);return d!==u?d-u:n.localeCompare(e)}function Ht(r){var n;const{children:e,markDefs:a=[]}=r;if(!e||!e.length)return[];const c=e.map(_e),d={_type:"@span",children:[],markType:"<unknown>"};let u=[d];for(let l=0;l<e.length;l++){const h=e[l];if(!h)continue;const m=c[l]||[];let y=1;if(u.length>1)for(y;y<u.length;y++){const v=((n=u[y])==null?void 0:n.markKey)||"",_=m.indexOf(v);if(_===-1)break;m.splice(_,1)}u=u.slice(0,y);let g=u[u.length-1];if(g){for(const v of m){const _=a.find(P=>P._key===v),S=_?_._type:v,C={_type:"@span",_key:h._key,children:[],markDef:_,markType:S,markKey:v};g.children.push(C),u.push(C),g=C}if(xt(h)){const v=h.text.split(`
`);for(let _=v.length;_-- >1;)v.splice(_,0,`
`);g.children=g.children.concat(v.map(_=>({_type:"@text",text:_})))}else g.children=g.children.concat(h)}}return d.children}function be(r,n){const e=[];let a;for(let c=0;c<r.length;c++){const d=r[c];if(d){if(!Wt(d)){e.push(d),a=void 0;continue}if(!a){a=wt(d,c,n),e.push(a);continue}if(we(d,a)){a.children.push(d);continue}if((d.level||1)>a.level){const u=wt(d,c,n);if(n==="html"){const l=a.children[a.children.length-1],h=Lt(Lt({},l),{},{children:[...l.children,u]});a.children[a.children.length-1]=h}else a.children.push(u);a=u;continue}if((d.level||1)<a.level){const u=e[e.length-1],l=u&&Tt(u,d);if(l){a=l,a.children.push(d);continue}a=wt(d,c,n),e.push(a);continue}if(d.listItem!==a.listItem){const u=e[e.length-1],l=u&&Tt(u,{level:d.level||1});if(l&&l.listItem===d.listItem){a=l,a.children.push(d);continue}else{a=wt(d,c,n),e.push(a);continue}}console.warn("Unknown state encountered for block",d),e.push(d)}}return e}function we(r,n){return(r.level||1)===n.level&&r.listItem===n.listItem}function wt(r,n,e){return{_type:"@list",_key:`${r._key||`${n}`}-parent`,mode:e,level:r.level||1,listItem:r.listItem,children:[r]}}function Tt(r,n){const e=n.level||1,a=n.listItem||"normal",c=typeof n.listItem=="string";if(qt(r)&&(r.level||1)===e&&c&&(r.listItem||"normal")===a)return r;if(!("children"in r))return;const d=r.children[r.children.length-1];return d&&!xt(d)?Tt(d,n):void 0}function St(r){let n="";return r.children.forEach(e=>{zt(e)?n+=e.text:Vt(e)&&(n+=St(e))}),n}const Ut="html";function Gt(){return Math.random().toFixed(5).split(".")[1]}function xe(r){return{_key:r._key||Gt(),...r}}function Rt(r){return{_key:r._key||Gt(),...r,...r._type==="block"&&Array.isArray(r.children)?{children:r.children.map(xe)}:{}}}var ke=F("<strong><!></strong>"),Ie=F("<em><!></em>"),Pe=F("<code><!></code>"),Oe=F('<span style="text-decoration:underline;"><!></span>'),Te=F("<del><!></del>");function ct(r,n){z(n,!1);const e=T();let a=M(n,"portableText",8);I(()=>(t(e),k(a())),()=>{(u=>O(e,u.markType))(a())}),G();var c=w(),d=x(c);D(d,()=>t(e)==="strong",u=>{var l=ke(),h=R(l);U(h,n,"default",{}),N(l),p(u,l)},u=>{var l=w(),h=x(l);D(h,()=>t(e)==="em",m=>{var y=Ie(),g=R(y);U(g,n,"default",{}),N(y),p(m,y)},m=>{var y=w(),g=x(y);D(g,()=>t(e)==="code",v=>{var _=Pe(),S=R(_);U(S,n,"default",{}),N(_),p(v,_)},v=>{var _=w(),S=x(_);D(S,()=>t(e)==="underline",C=>{var P=Oe(),j=R(P);U(j,n,"default",{}),N(P),p(C,P)},C=>{var P=w(),j=x(P);D(j,()=>t(e)==="strike-through",L=>{var E=Te(),H=R(E);U(H,n,"default",{}),N(E),p(L,E)},L=>{var E=w(),H=x(E);U(H,n,"default",{}),p(L,E)},!0),p(C,P)},!0),p(v,_)},!0),p(m,y)},!0),p(u,l)}),p(r,c),Q()}var Se=F("<a><!></a>");function je(r,n){z(n,!1);const e=T(),a=T();let c=M(n,"portableText",8);I(()=>(t(e),k(c())),()=>{(l=>O(e,l.value))(c())}),I(()=>t(e),()=>{var l,h,m,y;O(a,((l=t(e))==null?void 0:l.href)||((h=t(e))==null?void 0:h.url)||((m=t(e))==null?void 0:m.link)||((y=t(e))==null?void 0:y.value))}),G();var d=w(),u=x(d);D(u,()=>typeof t(a)=="string",l=>{var h=Se(),m=R(h);U(m,n,"default",{}),N(h),ot(()=>Ot(h,"href",t(a))),p(l,h)},l=>{var h=w(),m=x(h);U(m,n,"default",{}),p(l,h)}),p(r,d),Q()}var Me=F("<p><!></p>");function nt(r,n){z(n,!1);const e=T(),a=T();let c=M(n,"portableText",8);I(()=>(t(e),k(c())),()=>{(l=>O(e,l.value))(c())}),I(()=>t(e),()=>{O(a,t(e).style||"normal")}),G(),rt();var d=w(),u=x(d);D(u,()=>["h1","h2","h3","h4","h5","h6","blockquote"].includes(t(a)),l=>{var h=w(),m=x(h);me(m,()=>t(a),!1,(y,g)=>{var v=w(),_=x(v);U(_,n,"default",{}),p(g,v)}),p(l,h)},l=>{var h=w(),m=x(h);D(m,()=>t(a)==="normal",y=>{var g=Me(),v=R(g);U(v,n,"default",{}),N(g),p(y,g)},y=>{var g=w(),v=x(g);U(v,n,"default",{}),p(y,g)},!0),p(l,h)}),p(r,d),Q()}var Ce=F("<ol><!></ol>"),Ae=F("<ul><!></ul>");function It(r,n){z(n,!1);const e=T(),a=T();let c=M(n,"portableText",8);I(()=>(t(e),k(c())),()=>{(l=>O(e,l.value))(c())}),I(()=>(t(a),t(e)),()=>{(l=>O(a,l.listItem))(t(e))}),G();var d=w(),u=x(d);D(u,()=>t(a)==="number",l=>{var h=Ce(),m=R(h);U(m,n,"default",{}),N(h),p(l,h)},l=>{var h=Ae(),m=R(h);U(m,n,"default",{}),N(h),p(l,h)}),p(r,d),Q()}var Be=F("<li><!></li>");function Pt(r,n){var e=Be(),a=R(e);U(a,n,"default",{}),N(e),p(r,e)}var Ee=F("<br>");function Le(r){var n=Ee();p(r,n)}function De(r,n){var e=w(),a=x(e);U(a,n,"default",{}),p(r,e)}const He={marks:{"strike-through":ct,code:ct,em:ct,strong:ct,underline:ct,link:je},block:{blockquote:nt,h1:nt,h2:nt,h3:nt,h4:nt,h5:nt,h6:nt,normal:nt},list:{bullet:It,number:It},listItem:{bullet:Pt,number:Pt},types:{},hardBreak:Le,unknownBlockStyle:nt,unknownList:It,unknownListItem:Pt,unknownMark:ct,unknownType:De};function Ue(r,n={}){return{...r,...n,block:vt(r,n,"block"),list:vt(r,n,"list"),listItem:vt(r,n,"listItem"),marks:vt(r,n,"marks"),types:vt(r,n,"types")}}function vt(r,n,e){const a=n[e],c=r[e];return typeof a=="function"||a&&typeof c=="function"?a:a?{...c,...a}:c}function Re(r,n){z(n,!1);const e=T(),a=T(),c=T(),d=T();let u=M(n,"global",8),l=M(n,"node",8),h=M(n,"indexInParent",8);I(()=>(t(e),k(u())),()=>{(g=>O(e,g.components))(u())}),I(()=>(t(a),k(l())),()=>{(g=>O(a,Ft(g.style,"normal")))(l())}),I(()=>(t(e),t(a)),()=>{O(c,typeof t(e).block=="function"?t(e).block:t(e).block[t(a)])}),I(()=>(t(c),k(u()),t(a)),()=>{t(c)||u().missingComponentHandler(t(a),"blockStyle")}),I(()=>(k(u()),k(h()),k(l())),()=>{O(d,{global:u(),indexInParent:h(),value:l()})}),G(),rt();var m=w(),y=x(m);ut(y,()=>t(c)||t(e).unknownBlockStyle,(g,v)=>{v(g,{get portableText(){return t(d)},children:(_,S)=>{var C=w(),P=x(C);U(P,n,"default",{}),p(_,C)},$$slots:{default:!0}})}),p(r,m),Q()}function Ne(r,n){z(n,!1);const e=T(),a=T(),c=T(),d=T();let u=M(n,"global",8),l=M(n,"node",8),h=M(n,"parentBlock",8),m=M(n,"indexInParent",8),y=M(n,"isInline",8,!1);I(()=>(t(e),k(u())),()=>{(_=>O(e,_.components))(u())}),I(()=>(t(a),k(l())),()=>{(_=>O(a,_._type))(l())}),I(()=>(t(e),t(a)),()=>{O(c,t(e).types[t(a)])}),I(()=>(t(c),k(u()),t(a)),()=>{t(c)||u().missingComponentHandler(t(a),"block")}),I(()=>(k(u()),k(l()),k(m()),k(h()),k(y())),()=>{O(d,{global:u(),value:l(),indexInParent:m(),parentBlock:h(),isInline:y()})}),G(),rt();var g=w(),v=x(g);ut(v,()=>t(c)||t(e).unknownType,(_,S)=>{S(_,{get portableText(){return t(d)}})}),p(r,g),Q()}function Fe(r,n){z(n,!1);const e=T(),a=T(),c=T(),d=T(),u=T();let l=M(n,"global",8),h=M(n,"indexInParent",8),m=M(n,"node",8);I(()=>(t(e),k(l())),()=>{(v=>O(e,v.components))(l())}),I(()=>(t(a),k(m())),()=>{(v=>O(a,v.listItem))(m())}),I(()=>(t(e),t(a)),()=>{O(c,typeof t(e).list=="function"?t(e).list:t(e).list[t(a)])}),I(()=>t(c),()=>{O(d,t(c))}),I(()=>(t(d),k(l()),t(a)),()=>{t(d)||l().missingComponentHandler(t(a),"listStyle")}),I(()=>(k(l()),k(m()),k(h())),()=>{O(u,{global:l(),value:m(),indexInParent:h()})}),G(),rt();var y=w(),g=x(y);ut(g,()=>t(d)||t(e).unknownList,(v,_)=>{_(v,{get portableText(){return t(u)},children:(S,C)=>{var P=w(),j=x(P);U(j,n,"default",{}),p(S,P)},$$slots:{default:!0}})}),p(r,y),Q()}function Ke(r,n){z(n,!1);const e=T(),a=T(),c=T(),d=T(),u=T();let l=M(n,"global",8),h=M(n,"indexInParent",8),m=M(n,"node",8);I(()=>(t(e),k(l())),()=>{(v=>O(e,v.components))(l())}),I(()=>(t(a),k(m())),()=>{(v=>O(a,Ft(v.style,"normal")))(m())}),I(()=>(t(e),t(a)),()=>{O(c,typeof t(e).listItem=="function"?t(e).listItem:t(e).listItem[t(a)])}),I(()=>(t(c),k(l()),t(a)),()=>{t(c)||l().missingComponentHandler(t(a),"listItemStyle")}),I(()=>(t(a),t(e)),()=>{O(d,t(a)!=="normal"?t(e).block[t(a)]:void 0)}),I(()=>(k(l()),k(m()),k(h())),()=>{O(u,{global:l(),value:m(),indexInParent:h()})}),G(),rt();var y=w(),g=x(y);ut(g,()=>t(c)||t(e).unknownListItem,(v,_)=>{_(v,{get portableText(){return t(u)},children:(S,C)=>{var P=w(),j=x(P);D(j,()=>t(d),L=>{var E=w(),H=x(E),Y=lt(()=>({...t(u),value:{...m(),listItem:void 0}}));ut(H,()=>t(d),(W,X)=>{X(W,{get portableText(){return t(Y)},children:(Z,at)=>{var $=w(),o=x($);U(o,n,"default",{}),p(Z,$)},$$slots:{default:!0}})}),p(L,E)},L=>{var E=w(),H=x(E);U(H,n,"default",{}),p(L,E)}),p(S,P)},$$slots:{default:!0}})}),p(r,y),Q()}function We(r,n){z(n,!1);const e=T(),a=T(),c=T(),d=T();let u=M(n,"global",8),l=M(n,"node",8),h=M(n,"parentBlock",8);I(()=>(t(e),k(u())),()=>{(g=>O(e,g.components))(u())}),I(()=>(t(a),k(l())),()=>{(g=>O(a,g.markType))(l())}),I(()=>(t(e),t(a)),()=>{O(c,t(e).marks[t(a)])}),I(()=>(t(c),k(u()),t(a)),()=>{t(c)||u().missingComponentHandler(t(a),"mark")}),I(()=>(k(u()),k(h()),t(a),k(l()),St),()=>{O(d,{global:u(),parentBlock:h(),markType:t(a),value:l().markDef,markKey:l().markKey,plainTextContent:St(l())})}),G(),rt();var m=w(),y=x(m);ut(y,()=>t(c)||t(e).unknownMark,(g,v)=>{v(g,{get portableText(){return t(d)},children:(_,S)=>{var C=w(),P=x(C);U(P,n,"default",{}),p(_,C)},$$slots:{default:!0}})}),p(r,m),Q()}function qe(r,n){z(n,!1);const e=T(),a=T();let c=M(n,"global",8),d=M(n,"node",8);I(()=>(t(e),k(c())),()=>{(h=>O(e,h.components))(c())}),I(()=>(t(a),k(d())),()=>{(h=>O(a,h.text))(d())}),G();var u=w(),l=x(u);D(l,()=>t(a)===`
`,h=>{var m=w(),y=x(m);D(y,()=>typeof t(e).hardBreak=="function",g=>{var v=w(),_=x(v);ut(_,()=>t(e).hardBreak,(S,C)=>{C(S,{})}),p(g,v)},g=>{var v=jt();ot(()=>_t(v,t(a))),p(g,v)}),p(h,m)},h=>{var m=jt();ot(()=>_t(m,t(a))),p(h,m)}),p(r,u),Q()}function gt(r,n){z(n,!1);const e=T(),a=T(),c=T(),d=T();let u=M(n,"global",8),l=M(n,"options",8);I(()=>(t(e),t(a),t(c),t(d),k(l())),()=>{(y=>(O(e,y.node),O(a,y.indexInParent),O(c,y.parentBlock),O(d,y.isInline)))(l())}),G(),rt();var h=w(),m=x(h);D(m,()=>qt(t(e)),y=>{Fe(y,{get node(){return t(e)},get indexInParent(){return t(a)},get global(){return u()},children:(g,v)=>{var _=w(),S=x(_);pt(S,1,()=>t(e).children,bt,(C,P,j)=>{var L=w(),E=x(L),H=lt(()=>({node:t(P),indexInParent:j,parentBlock:void 0,isInline:void 0}));gt(E,{get options(){return t(H)},get global(){return u()}}),p(C,L)}),p(g,_)},$$slots:{default:!0}})},y=>{var g=w(),v=x(g);D(v,()=>Wt(t(e)),_=>{Ke(_,{get node(){return t(e)},get indexInParent(){return t(a)},get global(){return u()},children:(S,C)=>{var P=w(),j=x(P);pt(j,1,()=>Ht(t(e)),bt,(L,E,H)=>{var Y=w(),W=x(Y),X=lt(()=>({parentBlock:t(e),node:t(E),isInline:!0,indexInParent:H}));gt(W,{get options(){return t(X)},get global(){return u()}}),p(L,Y)}),p(S,P)},$$slots:{default:!0}})},_=>{var S=w(),C=x(S);D(C,()=>Vt(t(e)),P=>{We(P,{get node(){return t(e)},get parentBlock(){return t(c)},get global(){return u()},children:(j,L)=>{var E=w(),H=x(E);pt(H,1,()=>t(e).children,bt,(Y,W,X)=>{var Z=w(),at=x(Z),$=lt(()=>({parentBlock:t(c),node:t(W),isInline:!0,indexInParent:X}));gt(at,{get options(){return t($)},get global(){return u()}}),p(Y,Z)}),p(j,E)},$$slots:{default:!0}})},P=>{var j=w(),L=x(j);D(L,()=>Kt(t(e)),E=>{Re(E,{get node(){return t(e)},get indexInParent(){return t(a)},get global(){return u()},children:(H,Y)=>{var W=w(),X=x(W);pt(X,1,()=>Ht(t(e)),bt,(Z,at,$)=>{var o=w(),s=x(o),f=lt(()=>({parentBlock:t(e),node:t(at),isInline:!0,indexInParent:$}));gt(s,{get options(){return t(f)},get global(){return u()}}),p(Z,o)}),p(H,W)},$$slots:{default:!0}})},E=>{var H=w(),Y=x(H);D(Y,()=>zt(t(e)),W=>{qe(W,{get node(){return t(e)},get global(){return u()}})},W=>{var X=w(),Z=x(X);D(Z,()=>t(e),at=>{Ne(at,{get node(){return t(e)},get parentBlock(){return t(c)},get indexInParent(){return t(a)},get isInline(){return t(d)},get global(){return u()}})},null,!0),p(W,X)},!0),p(E,H)},!0),p(P,j)},!0),p(_,S)},!0),p(y,g)}),p(r,h),Q()}const dt=(r,n)=>`Unknown ${r}, specify a component for it in the \`components${n?".":""}${n}\` prop`,Ve=(r,n)=>{switch(n){case"block":return dt(`block type "${r}"`,"types");case"blockStyle":return dt(`block style "${r}"`,"block");case"listItemStyle":return dt(`list item style "${r}"`,"listItem");case"listStyle":return dt(`list style "${r}"`,"list");case"mark":return dt(`mark type "${r}"`,"marks");default:return dt("type")}};function Nt(r){console.warn(r)}function ze(r,n){z(n,!1);const e=T(),a=T(),c=T(),d=T();let u=M(n,"value",24,()=>[]),l=M(n,"components",8),h=M(n,"context",24,()=>({})),m=M(n,"onMissingComponent",8,!0);I(()=>k(l()),()=>{O(e,Ue(He,l()))}),I(()=>(k(u()),Rt),()=>{O(a,(Array.isArray(u())?u():[u()]).map(Rt))}),I(()=>(t(a),Ut),()=>{O(c,be(t(a),Ut))}),I(()=>(k(m()),Nt),()=>{O(d,(v,_)=>{if(m()===!1)return;const S=Ve(v,_);if(typeof m()=="function"){m()(S,{type:v,nodeType:_});return}Nt(S)})}),G(),rt();var y=w(),g=x(y);pt(g,3,()=>t(c),v=>v._key,(v,_,S)=>{var C=lt(()=>({components:t(e),missingComponentHandler:t(d),context:h(),ptBlocks:t(c),ptRawValue:u()})),P=lt(()=>({node:t(_),isInline:!1,indexInParent:t(S)}));gt(v,{get global(){return t(C)},get options(){return t(P)}})}),p(r,y),Q()}function Ge(r){return new Date(r).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}var Qt={exports:{}};(function(r,n){(function(e,a){r.exports=a()})(ce,function(){function e(){return e=Object.assign||function(o){for(var s=1;s<arguments.length;s++){var f=arguments[s];for(var i in f)Object.prototype.hasOwnProperty.call(f,i)&&(o[i]=f[i])}return o},e.apply(this,arguments)}function a(o,s){if(o){if(typeof o=="string")return c(o,s);var f=Object.prototype.toString.call(o).slice(8,-1);if(f==="Object"&&o.constructor&&(f=o.constructor.name),f==="Map"||f==="Set")return Array.from(o);if(f==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(f))return c(o,s)}}function c(o,s){(s==null||s>o.length)&&(s=o.length);for(var f=0,i=new Array(s);f<s;f++)i[f]=o[f];return i}function d(o,s){var f=typeof Symbol<"u"&&o[Symbol.iterator]||o["@@iterator"];if(f)return(f=f.call(o)).next.bind(f);if(Array.isArray(o)||(f=a(o))||s){f&&(o=f);var i=0;return function(){return i>=o.length?{done:!0}:{done:!1,value:o[i++]}}}throw new TypeError(`Invalid attempt to iterate non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}var u="image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg";function l(o){var s=o.split("-"),f=s[1],i=s[2],B=s[3];if(!f||!i||!B)throw new Error("Malformed asset _ref '"+o+`'. Expected an id like "`+u+'".');var b=i.split("x"),A=b[0],K=b[1],J=+A,V=+K,q=isFinite(J)&&isFinite(V);if(!q)throw new Error("Malformed asset _ref '"+o+`'. Expected an id like "`+u+'".');return{id:f,width:J,height:V,format:B}}var h=function(s){var f=s;return f?typeof f._ref=="string":!1},m=function(s){var f=s;return f?typeof f._id=="string":!1},y=function(s){var f=s;return f&&f.asset?typeof f.asset.url=="string":!1};function g(o){if(!o)return null;var s;if(typeof o=="string"&&v(o))s={asset:{_ref:_(o)}};else if(typeof o=="string")s={asset:{_ref:o}};else if(h(o))s={asset:o};else if(m(o))s={asset:{_ref:o._id||""}};else if(y(o))s={asset:{_ref:_(o.asset.url)}};else if(typeof o.asset=="object")s=e({},o);else return null;var f=o;return f.crop&&(s.crop=f.crop),f.hotspot&&(s.hotspot=f.hotspot),S(s)}function v(o){return/^https?:\/\//.test(""+o)}function _(o){var s=o.split("/").slice(-1);return("image-"+s[0]).replace(/\.([a-z]+)$/,"-$1")}function S(o){if(o.crop&&o.hotspot)return o;var s=e({},o);return s.crop||(s.crop={left:0,top:0,bottom:0,right:0}),s.hotspot||(s.hotspot={x:.5,y:.5,height:1,width:1}),s}var C=[["width","w"],["height","h"],["format","fm"],["download","dl"],["blur","blur"],["sharpen","sharp"],["invert","invert"],["orientation","or"],["minHeight","min-h"],["maxHeight","max-h"],["minWidth","min-w"],["maxWidth","max-w"],["quality","q"],["fit","fit"],["crop","crop"],["saturation","sat"],["auto","auto"],["dpr","dpr"],["pad","pad"],["frame","frame"]];function P(o){var s=e({},o||{}),f=s.source;delete s.source;var i=g(f);if(!i)throw new Error("Unable to resolve image URL from source ("+JSON.stringify(f)+")");var B=i.asset._ref||i.asset._id||"",b=l(B),A=Math.round(i.crop.left*b.width),K=Math.round(i.crop.top*b.height),J={left:A,top:K,width:Math.round(b.width-i.crop.right*b.width-A),height:Math.round(b.height-i.crop.bottom*b.height-K)},V=i.hotspot.height*b.height/2,q=i.hotspot.width*b.width/2,ft=i.hotspot.x*b.width,it=i.hotspot.y*b.height,tt={left:ft-q,top:it-V,right:ft+q,bottom:it+V};return s.rect||s.focalPoint||s.ignoreImageParams||s.crop||(s=e({},s,L({crop:J,hotspot:tt},s))),j(e({},s,{asset:b}))}function j(o){var s=(o.baseUrl||"https://cdn.sanity.io").replace(/\/+$/,""),f=o.vanityName?"/"+o.vanityName:"",i=o.asset.id+"-"+o.asset.width+"x"+o.asset.height+"."+o.asset.format+f,B=s+"/images/"+o.projectId+"/"+o.dataset+"/"+i,b=[];if(o.rect){var A=o.rect,K=A.left,J=A.top,V=A.width,q=A.height,ft=K!==0||J!==0||q!==o.asset.height||V!==o.asset.width;ft&&b.push("rect="+K+","+J+","+V+","+q)}o.bg&&b.push("bg="+o.bg),o.focalPoint&&(b.push("fp-x="+o.focalPoint.x),b.push("fp-y="+o.focalPoint.y));var it=[o.flipHorizontal&&"h",o.flipVertical&&"v"].filter(Boolean).join("");return it&&b.push("flip="+it),C.forEach(function(tt){var ht=tt[0],et=tt[1];typeof o[ht]<"u"?b.push(et+"="+encodeURIComponent(o[ht])):typeof o[et]<"u"&&b.push(et+"="+encodeURIComponent(o[et]))}),b.length===0?B:B+"?"+b.join("&")}function L(o,s){var f,i=s.width,B=s.height;if(!(i&&B))return{width:i,height:B,rect:o.crop};var b=o.crop,A=o.hotspot,K=i/B,J=b.width/b.height;if(J>K){var V=Math.round(b.height),q=Math.round(V*K),ft=Math.max(0,Math.round(b.top)),it=Math.round((A.right-A.left)/2+A.left),tt=Math.max(0,Math.round(it-q/2));tt<b.left?tt=b.left:tt+q>b.left+b.width&&(tt=b.left+b.width-q),f={left:tt,top:ft,width:q,height:V}}else{var ht=b.width,et=Math.round(ht/K),Xt=Math.max(0,Math.round(b.left)),Yt=Math.round((A.bottom-A.top)/2+A.top),mt=Math.max(0,Math.round(Yt-et/2));mt<b.top?mt=b.top:mt+et>b.top+b.height&&(mt=b.top+b.height-et),f={left:Xt,top:mt,width:ht,height:et}}return{width:i,height:B,rect:f}}var E=["clip","crop","fill","fillmax","max","scale","min"],H=["top","bottom","left","right","center","focalpoint","entropy"],Y=["format"];function W(o){return o&&"config"in o?typeof o.config=="function":!1}function X(o){return o&&"clientConfig"in o?typeof o.clientConfig=="object":!1}function Z(o){for(var s=C,f=d(s),i;!(i=f()).done;){var B=i.value,b=B[0],A=B[1];if(o===b||o===A)return b}return o}function at(o){if(W(o)){var s=o.config(),f=s.apiHost,i=s.projectId,B=s.dataset,b=f||"https://api.sanity.io";return new $(null,{baseUrl:b.replace(/^https:\/\/api\./,"https://cdn."),projectId:i,dataset:B})}if(X(o)){var A=o.clientConfig,K=A.apiHost,J=A.projectId,V=A.dataset,q=K||"https://api.sanity.io";return new $(null,{baseUrl:q.replace(/^https:\/\/api\./,"https://cdn."),projectId:J,dataset:V})}return new $(null,o||{})}var $=function(){function o(f,i){this.options=void 0,this.options=f?e({},f.options||{},i||{}):e({},i||{})}var s=o.prototype;return s.withOptions=function(i){var B=i.baseUrl||this.options.baseUrl,b={baseUrl:B};for(var A in i)if(i.hasOwnProperty(A)){var K=Z(A);b[K]=i[A]}return new o(this,e({baseUrl:B},b))},s.image=function(i){return this.withOptions({source:i})},s.dataset=function(i){return this.withOptions({dataset:i})},s.projectId=function(i){return this.withOptions({projectId:i})},s.bg=function(i){return this.withOptions({bg:i})},s.dpr=function(i){return this.withOptions(i&&i!==1?{dpr:i}:{})},s.width=function(i){return this.withOptions({width:i})},s.height=function(i){return this.withOptions({height:i})},s.focalPoint=function(i,B){return this.withOptions({focalPoint:{x:i,y:B}})},s.maxWidth=function(i){return this.withOptions({maxWidth:i})},s.minWidth=function(i){return this.withOptions({minWidth:i})},s.maxHeight=function(i){return this.withOptions({maxHeight:i})},s.minHeight=function(i){return this.withOptions({minHeight:i})},s.size=function(i,B){return this.withOptions({width:i,height:B})},s.blur=function(i){return this.withOptions({blur:i})},s.sharpen=function(i){return this.withOptions({sharpen:i})},s.rect=function(i,B,b,A){return this.withOptions({rect:{left:i,top:B,width:b,height:A}})},s.format=function(i){return this.withOptions({format:i})},s.invert=function(i){return this.withOptions({invert:i})},s.orientation=function(i){return this.withOptions({orientation:i})},s.quality=function(i){return this.withOptions({quality:i})},s.forceDownload=function(i){return this.withOptions({download:i})},s.flipHorizontal=function(){return this.withOptions({flipHorizontal:!0})},s.flipVertical=function(){return this.withOptions({flipVertical:!0})},s.ignoreImageParams=function(){return this.withOptions({ignoreImageParams:!0})},s.fit=function(i){if(E.indexOf(i)===-1)throw new Error('Invalid fit mode "'+i+'"');return this.withOptions({fit:i})},s.crop=function(i){if(H.indexOf(i)===-1)throw new Error('Invalid crop mode "'+i+'"');return this.withOptions({crop:i})},s.saturation=function(i){return this.withOptions({saturation:i})},s.auto=function(i){if(Y.indexOf(i)===-1)throw new Error('Invalid auto mode "'+i+'"');return this.withOptions({auto:i})},s.pad=function(i){return this.withOptions({pad:i})},s.vanityName=function(i){return this.withOptions({vanityName:i})},s.frame=function(i){if(i!==1)throw new Error('Invalid frame value "'+i+'"');return this.withOptions({frame:i})},s.url=function(){return P(this.options)},s.toString=function(){return this.url()},o}();return at})})(Qt);var Qe=Qt.exports;const Xe=fe(Qe),Ye=Xe(de);function Je(r){return Ye.image(r)}var Ze=F('<img class="post__cover svelte-18b3js2">'),$e=F('<div class="post__cover--none svelte-18b3js2"></div>'),tn=F('<p class="post__excerpt svelte-18b3js2"> </p>'),en=F('<div class="post__content svelte-18b3js2"><!></div>'),nn=F('<section class="post svelte-18b3js2"><!> <div class="post__container svelte-18b3js2"><h1 class="post__title svelte-18b3js2"> </h1> <!> <p class="post__date svelte-18b3js2"> </p> <!></div></section>');function mn(r,n){z(n,!1);const e=Zt(),a=()=>$t(u,"$q",e),c=T();let d=M(n,"data",8);const u=he(d());I(()=>(t(c),a()),()=>{(P=>O(c,P.data))(a())}),G(),rt();var l=nn(),h=R(l);D(h,()=>t(c).mainImage,P=>{var j=Ze();ot(()=>Ot(j,"src",Je(t(c).mainImage).url())),ot(()=>Ot(j,"alt",`Cover image for ${t(c).title??""}`)),p(P,j)},P=>{var j=$e();p(P,j)});var m=yt(h,2),y=R(m),g=R(y,!0);N(y);var v=yt(y,2);D(v,()=>t(c).excerpt,P=>{var j=tn(),L=R(j,!0);N(j),ot(()=>_t(L,t(c).excerpt)),p(P,j)});var _=yt(v,2),S=R(_,!0);ot(()=>_t(S,Ge(t(c)._createdAt))),N(_);var C=yt(_,2);D(C,()=>t(c).body,P=>{var j=en(),L=R(j);ze(L,{components:{},get value(){return t(c).body}}),N(j),p(P,j)}),N(m),N(l),ot(()=>_t(g,t(c).title)),p(r,l),Q()}export{mn as component};