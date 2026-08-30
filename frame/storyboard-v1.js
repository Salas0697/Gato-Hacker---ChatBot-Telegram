(()=>{
const CW=340,CH=425;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const score=p=>Number(p?.score||0);
const imgTemplate=()=>S.slides.flatMap(s=>s.layers).find(l=>l.type==='img')||null;
const photoLayers=sl=>sl.layers.filter(l=>l.type==='img'&&!l.hidden);
function rgb(c){return Array.isArray(c)?`rgb(${c[0]},${c[1]},${c[2]})`:'#111114'}
function palette(p){try{return palFromPhoto(p)}catch(e){return [[10,10,12],[245,245,245],[95,118,255],[255,84,124]]}}
function ink(bg){if(Array.isArray(bg))return contrastText(bg);return '#f7f7f5'}
function layer(t,p,props={}){const l=clone(t);Object.assign(l,{id:uid(),type:'img',photo:p,hidden:false,locked:false,userTouched:true,storyAuto:true,rot:0,zoom:1,offX:0,offY:0,z:10},props);return l}
function clearAuto(sl){sl.layers=sl.layers.filter(l=>!(l.storyAuto||l.storyDeco));sl.layers.forEach(l=>{if(l.type==='text'&&!l.userTouched){const s=String(l.text??l.value??l.content??'').trim();if(/^(TITLE|LOCATION|NYC|CITY NOTES|MOMENTS|MEMORIES|VOL\.?\s*\d*|AUG\s*2026)$/i.test(s))l.hidden=true}})}
function deco(kind,x,y,w,h,color,rot=0){const d=makeDeco(kind,x,y,w,h,color,rot);d.storyDeco=true;d.userTouched=true;return d}
function ensureSlides(n){while(S.slides.length<n)S.slides.push({id:uid(),layers:[],bg:'#0b0b0d',palette:null});if(S.slides.length>n)S.slides=S.slides.slice(0,n);S.slides.forEach(clearAuto)}
function quietBg(p,mode){const pal=palette(p);if(mode==='light')return '#f2efe8';if(mode==='accent')return rgb(pal[2]||pal[0]);return '#0b0b0d'}
function addFrame(sl,color='#f2efe8'){sl.layers.unshift(deco('block',0,0,CW,CH,color,0))}
function fullBleed(sl,t,p){sl.layers.push(layer(t,p,{x:0,y:0,w:CW,h:CH,z:10}))}
function framed(sl,t,p,accent){addFrame(sl,accent||'#f1eee7');sl.layers.push(layer(t,p,{x:18,y:22,w:304,h:381,z:10}))}
function duo(sl,t,a,b,mode=0){const pal=palette(a);sl.bg=mode%2?'#0b0b0d':'#f1eee7';if(mode%3===0){sl.layers.push(layer(t,a,{x:0,y:0,w:218,h:CH,z:10}));sl.layers.push(layer(t,b,{x:226,y:56,w:114,h:313,z:11}))}
else if(mode%3===1){sl.layers.push(layer(t,a,{x:18,y:18,w:304,h:252,z:10}));sl.layers.push(layer(t,b,{x:168,y:282,w:154,h:125,z:11}));sl.layers.unshift(deco('block',0,270,CW,155,rgb(pal[2]||pal[0]),0))}
else{sl.layers.push(layer(t,a,{x:0,y:0,w:CW,h:255,z:10}));sl.layers.push(layer(t,b,{x:20,y:276,w:300,h:131,z:11}));}}
function trio(sl,t,a,b,c,mode=0){const pal=palette(a);sl.bg='#0b0b0d';if(mode%2===0){sl.layers.push(layer(t,a,{x:0,y:0,w:214,h:CH,z:10}));sl.layers.push(layer(t,b,{x:222,y:0,w:118,h:206,z:11}));sl.layers.push(layer(t,c,{x:222,y:218,w:118,h:207,z:11}))}
else{sl.layers.unshift(deco('block',0,0,CW,CH,'#f1eee7',0));sl.layers.push(layer(t,a,{x:18,y:18,w:304,h:235,z:10}));sl.layers.push(layer(t,b,{x:18,y:266,w:145,h:141,z:11}));sl.layers.push(layer(t,c,{x:177,y:266,w:145,h:141,z:11}))}}
function spread(slides,start,span,t,p,style=0){const pal=palette(p), total=CW*span;for(let seg=0;seg<span;seg++){const sl=slides[start+seg];sl.bg=style%2?'#0b0b0d':rgb(pal[0]);sl.storySpan={photoId:p.id,start,span,seg};sl.layers.push(layer(t,p,{x:-CW*seg,y:0,w:total,h:CH,z:10,storySpan:true,storySeg:seg,storySpanCount:span}));if(seg===0){const c=style%2?'#f4f1ea':rgb(pal[2]||pal[1]);sl.layers.push(deco('line',18,22,82,2,c,0))}if(seg===span-1){const c=style%2?'#f4f1ea':rgb(pal[2]||pal[1]);sl.layers.push(deco('line',240,401,82,2,c,0))}}}
function desired(n,span){if(n<=3)return n;return clamp(Math.ceil((n+(span-1))/1.65),5,10)}
function buildStory(){if(!S.photos?.length)return;const t=imgTemplate();if(!t)return;const photos=[...S.photos];const hero=S.heroPhotoId?photos.find(p=>p.id===S.heroPhotoId):[...photos].sort((a,b)=>score(b)-score(a))[0];const rest=photos.filter(p=>p.id!==hero?.id);const span=photos.length>=9?(Math.random()<.32?3:2):(photos.length>=6?2:1);const count=desired(photos.length,span);ensureSlides(count);
  const slides=S.slides;slides.forEach((sl,i)=>{sl.storySpan=null;sl.palette=palette(photos[i%photos.length]);sl.bg='#0b0b0d'});
  let start=count>=6?pick([0,1]):0;if(start+span>count)start=0;spread(slides,start,span,t,hero,Math.floor(Math.random()*3));
  const occupied=new Set(Array.from({length:span},(_,i)=>start+i));let pi=0;
  for(let si=0;si<count;si++){
    if(occupied.has(si))continue;const left=rest.length-pi;if(left<=0)break;const sl=slides[si];const remainingSlots=[...Array(count-si).keys()].filter(k=>!occupied.has(si+k)).length;
    let take=left>remainingSlots*2?3:(left>remainingSlots?2:1);take=Math.min(take,left,3);const set=rest.slice(pi,pi+take);pi+=take;
    if(take===1){if(si%3===0)framed(sl,t,set[0],si%2?'#0b0b0d':'#f1eee7');else fullBleed(sl,t,set[0])}
    else if(take===2)duo(sl,t,set[0],set[1],si);
    else trio(sl,t,set[0],set[1],set[2],si);
  }
  // Safety: any photo not yet represented gets appended to the last non-spread slide as a deliberate card.
  const used=new Set(slides.flatMap(photoLayers).map(l=>l.photo?.id).filter(Boolean));photos.filter(p=>!used.has(p.id)).forEach((p,j)=>{let si=slides.length-1-j%Math.max(1,slides.length);while(occupied.has(si)&&si>0)si--;const sl=slides[si];const n=photoLayers(sl).length;sl.layers.push(layer(t,p,{x:n%2?176:18,y:278,w:146,h:129,z:20+n}))});
  S.currentSlide=Math.min(S.currentSlide||0,slides.length-1);S.selected=null;S.selectedType=null;saveProject();
}
function rerender(label){buildStory();renderAll();if(label)toast(label)}
const prevBuild=buildSlides;buildSlides=function(){prevBuild();buildStory()};
// Recompose only when the user asks for a new design/layout. Color/type randomization leaves the storyboard intact.
['remixAllBtn','variationBtn'].forEach(id=>{const b=$('#'+id);if(!b)return;b.addEventListener('click',()=>setTimeout(()=>rerender(id==='remixAllBtn'?'Nuevo storyboard':'Nueva composición'),45))});
const random=$('#randomStudio');if(random)random.addEventListener('click',e=>{const r=e.target.closest('[data-r]')?.dataset.r;if(r==='layout'||r==='surprise')setTimeout(()=>rerender(r==='layout'?'Nuevo layout':'Nuevo storyboard'),70)});
// A small label explains intentional repeats caused by continuity, without cluttering the UI.
const css=document.createElement('style');css.textContent='.storyBadge{font-size:10px;color:#71717a;margin-left:8px}.slide[data-story-span="1"]{box-shadow:none!important}';document.head.appendChild(css);
function mark(){const els=$$('.slide');els.forEach((el,i)=>{if(S.slides[i]?.storySpan)el.dataset.storySpan='1';else delete el.dataset.storySpan});let b=$('#storyBadge');const top=$('.studioTop small');if(top&&!b){b=document.createElement('span');b.id='storyBadge';b.className='storyBadge';top.after(b)}const spans=S.slides.filter(s=>s.storySpan).length;b&&(b.textContent=spans?`· ${spans} slides conectados`:'')}
const oldRender=renderAll;renderAll=function(){oldRender();mark()};
buildStory();oldRender();mark();
})();