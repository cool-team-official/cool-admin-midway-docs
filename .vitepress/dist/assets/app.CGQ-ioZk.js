import{U as o,ap as p,aq as u,ar as l,as as c,at as f,au as d,av as m,aw as h,ax as A,ay as g,d as v,u as y,y as P,x as w,az as C,aA as R,aB as b,aC as E}from"./chunks/framework._6WXoDa9.js";import{R as S}from"./chunks/theme.CojQ41Jj.js";function i(e){if(e.extends){const a=i(e.extends);return{...a,...e,async enhanceApp(t){a.enhanceApp&&await a.enhanceApp(t),e.enhanceApp&&await e.enhanceApp(t)}}}return e}const s=i(S),T=v({name:"VitePressApp",setup(){const{site:e,lang:a,dir:t}=y();return P(()=>{w(()=>{document.documentElement.lang=a.value,document.documentElement.dir=t.value})}),e.value.router.prefetchLinks&&C(),R(),b(),s.setup&&s.setup(),()=>E(s.Layout)}});async function _(){globalThis.__VITEPRESS__=!0;const e=D(),a=x();a.provide(u,e);const t=l(e.route);return a.provide(c,t),a.component("Content",f),a.component("ClientOnly",d),Object.defineProperties(a.config.globalProperties,{$frontmatter:{get(){return t.frontmatter.value}},$params:{get(){return t.page.value.params}}}),s.enhanceApp&&await s.enhanceApp({app:a,router:e,siteData:m}),{app:a,router:e,data:t}}function x(){return h(T)}function D(){let e=o,a;return A(t=>{let n=g(t),r=null;return n&&(e&&(a=n),(e||a===n)&&(n=n.replace(/\.js$/,".lean.js")),r=import(n)),o&&(e=!1),r},s.NotFound)}o&&_().then(({app:e,router:a,data:t})=>{a.go().then(()=>{p(a.route,t.site),e.mount("#app")})});export{_ as createApp};