import{S as L,T as k,ac as G,ad as K,m as Z,x as w,ae as z,a6 as b,af as c,ag as P,ah as T,G as x,ai as H,aj as M,ak as V,al as W,am as J,an as Q,ao as X,ap as p,aq as q,ar as ee,aa as U,as as te,at as re,au as ne,u as $,av as ae,w as ie,aw as se}from"./index-client.Bm3hC5iA.js";import{e as fe}from"./disclose-version.BbHg_3cr.js";function S(a,l=null,_){if(typeof a!="object"||a===null||L in a)return a;const y=k(a);if(y!==G&&y!==K)return a;var f=new Map,m=Z(a),o=w(0);m&&f.set("length",w(a.length));var u;return new Proxy(a,{defineProperty(s,e,t){(!("value"in t)||t.configurable===!1||t.enumerable===!1||t.writable===!1)&&H();var r=f.get(e);return r===void 0?(r=w(t.value),f.set(e,r)):P(r,S(t.value,u)),!0},deleteProperty(s,e){var t=f.get(e);if(t===void 0)e in s&&f.set(e,w(c));else{if(m&&typeof e=="string"){var r=f.get("length"),n=Number(e);Number.isInteger(n)&&n<r.v&&P(r,n)}P(t,c),j(o)}return!0},get(s,e,t){var v;if(e===L)return a;var r=f.get(e),n=e in s;if(r===void 0&&(!n||(v=T(s,e))!=null&&v.writable)&&(r=w(S(n?s[e]:c,u)),f.set(e,r)),r!==void 0){var i=b(r);return i===c?void 0:i}return Reflect.get(s,e,t)},getOwnPropertyDescriptor(s,e){var t=Reflect.getOwnPropertyDescriptor(s,e);if(t&&"value"in t){var r=f.get(e);r&&(t.value=b(r))}else if(t===void 0){var n=f.get(e),i=n==null?void 0:n.v;if(n!==void 0&&i!==c)return{enumerable:!0,configurable:!0,value:i,writable:!0}}return t},has(s,e){var i;if(e===L)return!0;var t=f.get(e),r=t!==void 0&&t.v!==c||Reflect.has(s,e);if(t!==void 0||x!==null&&(!r||(i=T(s,e))!=null&&i.writable)){t===void 0&&(t=w(r?S(s[e],u):c),f.set(e,t));var n=b(t);if(n===c)return!1}return r},set(s,e,t,r){var E;var n=f.get(e),i=e in s;if(m&&e==="length")for(var v=t;v<n.v;v+=1){var h=f.get(v+"");h!==void 0?P(h,c):v in s&&(h=w(c),f.set(v+"",h))}n===void 0?(!i||(E=T(s,e))!=null&&E.writable)&&(n=w(void 0),P(n,S(t,u)),f.set(e,n)):(i=n.v!==c,P(n,S(t,u)));var g=Reflect.getOwnPropertyDescriptor(s,e);if(g!=null&&g.set&&g.set.call(r,t),!i){if(m&&typeof e=="string"){var I=f.get("length"),O=Number(e);Number.isInteger(O)&&O>=I.v&&P(I,O+1)}j(o)}return!0},ownKeys(s){b(o);var e=Reflect.ownKeys(s).filter(n=>{var i=f.get(n);return i===void 0||i.v!==c});for(var[t,r]of f)r.v!==c&&!(t in s)&&e.push(t);return e},setPrototypeOf(){z()}})}function j(a,l=1){P(a,a.v+l)}function F(a){for(var l=x,_=x;l!==null&&!(l.f&(X|p));)l=l.parent;try{return q(l),a()}finally{q(_)}}function oe(a,l,_,y){var C;var f=(_&ee)!==0,m=!W||(_&J)!==0,o=(_&V)!==0,u=(_&ne)!==0,s=!1,e;o?[e,s]=fe(()=>a[l]):e=a[l];var t=L in a||M in a,r=((C=T(a,l))==null?void 0:C.set)??(t&&o&&l in a?d=>a[l]=d:void 0),n=y,i=!0,v=!1,h=()=>(v=!0,i&&(i=!1,u?n=$(y):n=y),n);e===void 0&&y!==void 0&&(r&&m&&Q(),e=h(),r&&r(e));var g;if(m)g=()=>{var d=a[l];return d===void 0?h():(i=!0,v=!1,d)};else{var I=F(()=>(f?U:te)(()=>a[l]));I.f|=re,g=()=>{var d=b(I);return d!==void 0&&(n=void 0),d===void 0?n:d}}if(!(_&ae))return g;if(r){var O=a.$$legacy;return function(d,R){return arguments.length>0?((!m||!R||O||s)&&r(R?g():d),d):g()}}var E=!1,B=!1,D=ie(e),A=F(()=>U(()=>{var d=g(),R=b(D);return E?(E=!1,B=!0,R):(B=!1,D.v=d)}));return f||(A.equals=se),function(d,R){if(arguments.length>0){const N=R?b(A):m&&o?S(d):d;return A.equals(N)||(E=!0,P(D,N),v&&n!==void 0&&(n=N),$(()=>b(A))),d}return b(A)}}const ue="modulepreload",le=function(a,l){return new URL(a,l).href},Y={},ce=function(l,_,y){let f=Promise.resolve();if(_&&_.length>0){const o=document.getElementsByTagName("link"),u=document.querySelector("meta[property=csp-nonce]"),s=(u==null?void 0:u.nonce)||(u==null?void 0:u.getAttribute("nonce"));f=Promise.allSettled(_.map(e=>{if(e=le(e,y),e in Y)return;Y[e]=!0;const t=e.endsWith(".css"),r=t?'[rel="stylesheet"]':"";if(!!y)for(let v=o.length-1;v>=0;v--){const h=o[v];if(h.href===e&&(!t||h.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${e}"]${r}`))return;const i=document.createElement("link");if(i.rel=t?"stylesheet":ue,t||(i.as="script"),i.crossOrigin="",i.href=e,s&&i.setAttribute("nonce",s),document.head.appendChild(i),t)return new Promise((v,h)=>{i.addEventListener("load",v),i.addEventListener("error",()=>h(new Error(`Unable to preload CSS for ${e}`)))})}))}function m(o){const u=new Event("vite:preloadError",{cancelable:!0});if(u.payload=o,window.dispatchEvent(u),!u.defaultPrevented)throw o}return f.then(o=>{for(const u of o||[])u.status==="rejected"&&m(u.reason);return l().catch(m)})};export{ce as _,S as a,oe as p};
