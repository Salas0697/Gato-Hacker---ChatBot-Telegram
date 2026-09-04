(()=>{
const CW=340,CH=425,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),pick=a=>a[Math.floor(Math.random()*a.length)];
const score=p=>Number(p?.score||0), layers=sl=>sl.layers.filter(l=>l.type==='img'&&!l.hidden);
const cloneImg=(t,p,o={})=>{const l=clone(t);Object.assign(l,{id:uid(),type:'img',photo:p,hidden:false,locked:false,userTouched:true,storyAuto:true,rot:0,zoom:1,offX:0,offY:0,z:10},o);return l};
function template(){return S.slides?.flatMap(s=>s.layers||[]).find(l=>l.type==='img')||null}
function pal(p){try{return palFromPhoto(p)}catch(e){return [[18,18,20],[244,241,234],[126,126,132],[202,92,72]]}}
function css(c){return Array.isArray(c)?`rgb(${c[0]},${c[1]},${c[2]})`:c}
function lum(c){return Array.isArray(c)?c[0]*.299+c[1]*.587+c[2]*.114:128}
function bg(p,variant=0){const a=pal(p), base=a[0];if(variant===1)return '#f3f0e9';if(variant===2)return '#0b0b0d';if(variant===3&&a[2])return css(a[2]);return lum(base)<95?'#111114':'#f3f0e9'}
function meta(p){const w=Number(p?.width||p?.w||0),h=Number(p?.height||p?.h||0),r=w&&h?w/h:1;const g=Array.isArray(p?.grid)?p.grid.map(Number):null;let quiet='bottom';if(g?.length>=9){const z={top:(g[0]+g[1]+g[2])/3,bottom:(g[6]+g[7]+g[8])/3,left:(g[0]+g[3]+g[6])/3,right:(g[2]+g[5]+g[8])/3};quiet=Object.entries(z).sort((a,b)=>a[1]-b[1])[0][0]}return{r,portrait:r<.82,landscape:r>1.18,quiet,score:score(p)}}
function ensure(n){while(S.slides.length<n)S.slides.push({id:uid(),layers:[],bg:'#0b0b0d',palette:null});S.slides=S.slides.slice(0,n)}
function wipe(sl){sl.layers=(sl.layers||[]).filter(l=>l.type==='text'&&l.userTouched);sl.storySpan=null}
function full(sl,t,p){sl.bg='#0b0b0d';sl.layers.push(cloneImg(t,p,{x:0,y:0,w:CW,h:CH}))}
function gallery(sl,t,p,side=0){sl.bg=bg(p,1);const m=meta(p);const pad=m.landscape?18:28;sl.layers.push(cloneImg(t,p,{x:pad,y:m.landscape?55:20,w:CW-pad*2,h:m.landscape?315:385}));}
function offset(sl,t,p,side=0){sl.bg=bg(p,side?2:1);const m=meta(p);if(m.portrait)sl.layers.push(cloneImg(t,p,{x:side?72:18,y:18,w:250,h:389}));else sl.layers.push(cloneImg(t,p,{x:18,y:side?90:34,w:304,h:300}));}
function split(sl,t,a,b,mode=0){sl.bg=bg(a,mode%3===2?2:1);const A=meta(a),B=meta(b);if(A.portrait&&B.portrait){sl.layers.push(cloneImg(t,a,{x:14,y:18,w:151,h:389}));sl.layers.push(cloneImg(t,b,{x:175,y:18,w:151,h:389,z:11}))}else if(mode%2===0){sl.layers.push(cloneImg(t,a,{x:0,y:0,w:214,h:CH}));sl.layers.push(cloneImg(t,b,{x:224,y:58,w:116,h:309,z:11}))}else{sl.layers.push(cloneImg(t,a,{x:18,y:18,w:304,h:250}));sl.layers.push(cloneImg(t,b,{x:82,y:280,w:240,h:127,z:11}))}}
function mosaic(sl,t,a,b,c,mode=0){sl.bg=bg(a,mode%2?1:2);if(mode%2===0){sl.layers.push(cloneImg(t,a,{x:0,y:0,w:218,h:CH}));sl.layers.push(cloneImg(t,b,{x:228,y:0,w:112,h:207,z:11}));sl.layers.push(cloneImg(t,c,{x:228,y:217,w:112,h:208,z:12}))}else{sl.layers.push(cloneImg(t,a,{x:18,y:18,w:304,h:235}));sl.layers.push(cloneImg(t,b,{x:18,y:266,w:145,h:141,z:11}));sl.layers.push(cloneImg(t,c,{x:177,y:266,w:145,h:141,z:12}))}}
function spread(slides,start,span,t,p,style=0){for(let i=0;i<span;i++){const sl=slides[start+i];sl.bg=style%2?bg(p,1):'#0b0b0d';sl.storySpan={photoId:p.id,start,span,seg:i};sl.layers.push(cloneImg(t,p,{x:-CW*i,y:0,w:CW*span,h:CH,storySpan:true,storySeg:i,storySpanCount:span}))}}
function countFor(n,span){if(n<=3)return n;return clamp(Math.ceil((n+span-1)/1.72),4,10)}
function weightedHero(photos){const sorted=[...photos].sort((a,b)=>score(b)-score(a));return pick(sorted.slice(0,Math.min(3,sorted.length)))}
function buildStory(){if(!S.photos?.length)return;const t=template();if(!t)return;const photos=[...S.photos],hero=weightedHero(photos);let span=1;if(photos.length>=9)span=Math.random()<.34?3:2;else if(photos.length>=6)span=Math.random()<.72?2:1;const count=countFor(photos.length,span);ensure(count);S.slides.forEach(wipe);
 const occupied=new Set();if(span>1&&count>=span+2){const max=Math.min(2,count-span);const start=Math.floor(Math.random()*(max+1));spread(S.slides,start,span,t,hero,Math.floor(Math.random()*3));for(let i=0;i<span;i++)occupied.add(start+i)}
 const rest=span>1?photos.filter(p=>p.id!==hero.id):photos;let pi=0,prevKind='';
 for(let si=0;si<count;si++){if(occupied.has(si))continue;const sl=S.slides[si],left=rest.length-pi;if(left<=0)break;const future=[...Array(count-si).keys()].map(k=>si+k).filter(i=>!occupied.has(i)).length;let take=left>future*2?3:left>future?2:1;take=Math.min(take,left,3);const set=rest.slice(pi,pi+take);pi+=take;sl.palette=pal(set[0]);let kind;
   if(take===1){const m=meta(set[0]);const choices=m.score>0.7?['full','gallery','offset']:m.landscape?['gallery','offset','full']:['full','offset','gallery'];kind=pick(choices.filter(x=>x!==prevKind)||choices);if(kind==='full')full(sl,t,set[0]);else if(kind==='gallery')gallery(sl,t,set[0],si%2);else offset(sl,t,set[0],si%2)}
   else if(take===2){kind='split';split(sl,t,set[0],set[1],si+Math.floor(Math.random()*3))}
   else{kind='mosaic';mosaic(sl,t,set[0],set[1],set[2],si+Math.floor(Math.random()*2))}prevKind=kind;
 }
 const used=new Set(S.slides.flatMap(layers).map(l=>l.photo?.id).filter(Boolean));for(const p of photos){if(used.has(p.id))continue;let sl=S.slides.find((s,i)=>!occupied.has(i)&&layers(s).length<3);if(!sl)sl=S.slides[S.slides.length-1];const n=layers(sl).length;sl.layers.push(cloneImg(t,p,{x:n===0?18:n===1?177:228,y:n===0?18:n===1?266:217,w:n===0?304:n===1?145:112,h:n===0?235:n===1?141:208,z:15+n}));used.add(p.id)}
 S.slides.forEach(sl=>{sl.layers=sl.layers.filter(l=>l.type==='img'||(l.type==='text'&&l.userTouched));});S.currentSlide=Math.min(S.currentSlide||0,S.slides.length-1);S.selected=null;S.selectedType=null;saveProject();
}
window.FRAME_rebuildStory=()=>{try{if(typeof pushHistory==='function')pushHistory()}catch(e){}buildStory();renderAll();saveProject();toast('Nueva composición ✦')};
const prevBuild=buildSlides;buildSlides=function(){prevBuild();buildStory()};
const style=document.createElement('style');style.textContent='#storyBadge,.storyBadge,.coverageBadge{display:none!important}';document.head.appendChild(style);
if(S.photos?.length){buildStory();renderAll()}
})();