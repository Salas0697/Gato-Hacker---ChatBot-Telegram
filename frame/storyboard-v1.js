(()=>{
const CW=340,CH=425;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const score=p=>Number(p?.score||0);
const photoLayers=sl=>sl.layers.filter(l=>l.type==='img'&&!l.hidden);
const cloneImg=(t,p,props={})=>{const l=clone(t);Object.assign(l,{id:uid(),type:'img',photo:p,hidden:false,locked:false,userTouched:true,storyAuto:true,rot:0,zoom:1,offX:0,offY:0,z:10},props);return l};
function template(){return S.slides?.flatMap(s=>s.layers||[]).find(l=>l.type==='img')||null}
function palette(p){try{return palFromPhoto(p)}catch(e){return [[12,12,14],[244,242,236],[140,140,145]]}}
function neutralFor(p){const pal=palette(p);const c=pal?.[0];if(!Array.isArray(c))return '#f3f0e9';const lum=(c[0]*.299+c[1]*.587+c[2]*.114);return lum<105?'#0b0b0d':'#f3f0e9'}
function ensureSlides(n){while(S.slides.length<n)S.slides.push({id:uid(),layers:[],bg:'#0b0b0d',palette:null});if(S.slides.length>n)S.slides=S.slides.slice(0,n)}
function wipe(sl){const manualText=(sl.layers||[]).filter(l=>l.type==='text'&&l.userTouched);sl.layers=manualText;sl.storySpan=null}
function full(sl,t,p){sl.bg='#0b0b0d';sl.layers.push(cloneImg(t,p,{x:0,y:0,w:CW,h:CH}))}
function framed(sl,t,p){sl.bg=neutralFor(p);sl.layers.push(cloneImg(t,p,{x:18,y:18,w:304,h:389}))}
function split(sl,t,a,b,flip=false){sl.bg='#f3f0e9';if(!flip){sl.layers.push(cloneImg(t,a,{x:0,y:0,w:210,h:CH}));sl.layers.push(cloneImg(t,b,{x:220,y:44,w:120,h:337,z:11}))}else{sl.layers.push(cloneImg(t,a,{x:0,y:0,w:CW,h:262}));sl.layers.push(cloneImg(t,b,{x:18,y:276,w:304,h:131,z:11}))}}
function duo(sl,t,a,b,flip=false){sl.bg=flip?'#0b0b0d':'#f3f0e9';sl.layers.push(cloneImg(t,a,{x:18,y:18,w:304,h:238}));sl.layers.push(cloneImg(t,b,{x:flip?176:18,y:270,w:146,h:137,z:11}))}
function spread(slides,start,t,p){for(let seg=0;seg<2;seg++){const sl=slides[start+seg];sl.bg='#0b0b0d';sl.storySpan={photoId:p.id,start,span:2,seg};sl.layers.push(cloneImg(t,p,{x:-CW*seg,y:0,w:CW*2,h:CH,storySpan:true,storySeg:seg,storySpanCount:2}))}}
function desired(n,hasSpread){if(n<=3)return n;const effective=n+(hasSpread?1:0);return clamp(Math.ceil(effective/1.65),4,10)}
function buildStory(){if(!S.photos?.length)return;const t=template();if(!t)return;const photos=[...S.photos];const hero=[...photos].sort((a,b)=>score(b)-score(a))[0]||photos[0];const useSpread=photos.length>=6&&Math.random()<.58;const count=desired(photos.length,useSpread);ensureSlides(count);S.slides.forEach(wipe);
 let spreadStart=-1;const occupied=new Set();if(useSpread&&count>=5){spreadStart=Math.random()<.55?0:1;spread(S.slides,spreadStart,t,hero);occupied.add(spreadStart);occupied.add(spreadStart+1)}
 const rest=useSpread?photos.filter(p=>p.id!==hero.id):photos;let pi=0;
 for(let si=0;si<count;si++){if(occupied.has(si))continue;const left=rest.length-pi;if(left<=0)break;const slotsLeft=[...Array(count-si).keys()].map(k=>si+k).filter(i=>!occupied.has(i)).length;const take=left>slotsLeft?2:1;const a=rest[pi++],b=take===2?rest[pi++]:null;const sl=S.slides[si];sl.palette=palette(a);if(!b){(si%3===1?framed:full)(sl,t,a)}else if(si%2===0)split(sl,t,a,b,si%4===0);else duo(sl,t,a,b,si%3===0)}
 // Safety: no photo is omitted. Add any missed photo as a second editorial card, never as a new random slide.
 const used=new Set(S.slides.flatMap(photoLayers).map(l=>l.photo?.id).filter(Boolean));for(const p of photos){if(used.has(p.id))continue;const sl=S.slides.find((s,i)=>!occupied.has(i)&&photoLayers(s).length<2)||S.slides[S.slides.length-1];const n=photoLayers(sl).length;sl.layers.push(cloneImg(t,p,{x:n?176:18,y:270,w:146,h:137,z:12+n}));used.add(p.id)}
 // FRAME never invents copy. Remove any legacy/generated text and decoration left by old templates.
 S.slides.forEach(sl=>{sl.layers=sl.layers.filter(l=>l.type==='img'||(l.type==='text'&&l.userTouched));});
 S.currentSlide=Math.min(S.currentSlide||0,S.slides.length-1);S.selected=null;S.selectedType=null;saveProject();
}
window.FRAME_rebuildStory=()=>{pushHistory?.();buildStory();renderAll();saveProject();toast('Otra opción lista')};
const prevBuild=buildSlides;buildSlides=function(){prevBuild();buildStory()};
// Remove legacy badges if an old project/runtime left them around.
const style=document.createElement('style');style.textContent='#storyBadge,.storyBadge,.coverageBadge{display:none!important}';document.head.appendChild(style);
if(S.photos?.length){buildStory();renderAll()}
})();