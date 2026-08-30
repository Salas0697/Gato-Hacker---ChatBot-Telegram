(()=>{
const CW=340,CH=425;
const imgLayers=sl=>sl.layers.filter(l=>l.type==='img'&&!l.hidden);
function photoId(l){return l?.photo?.id}
function template(){return S.slides.flatMap(s=>s.layers).find(l=>l.type==='img')||null}
function freshLayer(t,p){if(!t||!p)return null;const l=clone(t);Object.assign(l,{id:uid(),photo:p,hidden:false,locked:false,userTouched:false,rot:0,zoom:1,offX:0,offY:0,z:10});return l}
function full(l){Object.assign(l,{x:0,y:0,w:CW,h:CH,rot:0,zoom:1,offX:0,offY:0,z:10})}
function inset(l,side){Object.assign(l,side?{x:178,y:242,w:144,h:164}:{x:18,y:244,w:144,h:164}, {rot:0,zoom:1,offX:0,offY:0,z:16})}
function desiredSlides(n){if(n<=0)return 0;if(n<=3)return n;if(n<=6)return Math.ceil(n/1.5);return Math.ceil(n/2)}
function distribute(){if(!S.photos?.length)return;const photos=[...S.photos],need=desiredSlides(photos.length),t=template();if(!t)return;
  // Preserve slide objects where possible, but make the automatic photo assignment deterministic and exhaustive.
  while(S.slides.length<need)S.slides.push({id:uid(),layers:[],bg:'#09090b',palette:null});
  if(S.slides.length>need)S.slides=S.slides.slice(0,need);
  let cursor=0;
  S.slides.forEach((sl,si)=>{
    // Keep user-created text/deco, rebuild only automatic image slots. This prevents stale duplicated photos.
    const manualImgs=sl.layers.filter(l=>l.type==='img'&&l.userTouched);
    const other=sl.layers.filter(l=>l.type!=='img'||l.userTouched);
    sl.layers=other;
    const slots=Math.min(2,photos.length-cursor);
    for(let k=0;k<slots;k++){
      const p=photos[cursor++];let l=manualImgs.find(x=>photoId(x)===p.id);
      if(!l)l=freshLayer(t,p);if(!l)continue;
      if(k===0)full(l);else inset(l,si%2);sl.layers.push(l);
    }
  });
  // If manual layers caused a photo to be skipped, append missing photos to new/available second slots.
  const used=new Set(S.slides.flatMap(imgLayers).map(photoId).filter(Boolean));
  photos.filter(p=>!used.has(p.id)).forEach(p=>{
    let sl=S.slides.find(s=>imgLayers(s).length<2);if(!sl){sl={id:uid(),layers:[],bg:'#09090b',palette:null};S.slides.push(sl)}
    const l=freshLayer(t,p);if(l){if(imgLayers(sl).length===0)full(l);else inset(l,S.slides.indexOf(sl)%2);sl.layers.push(l);used.add(p.id)}
  });
  // Remove automatic duplicate occurrences. One selected photo = one appearance by default.
  const seen=new Set();S.slides.forEach(sl=>{sl.layers=sl.layers.filter(l=>{if(l.type!=='img'||l.hidden)return true;const id=photoId(l);if(!id)return true;if(l.userTouched){seen.add(id);return true}if(seen.has(id))return false;seen.add(id);return true})});
  S.currentSlide=Math.min(S.currentSlide||0,S.slides.length-1);S.selected=null;S.selectedType=null;
}
function run(label){distribute();if(typeof surgery==='function')try{surgery()}catch(e){};renderAll();saveProject();if(label)toast(label)}
// Override build outcome: after any initial build, every selected photo must be represented once.
const prevBuild=buildSlides;buildSlides=function(){prevBuild();distribute()};
// Design randomization may change styling/layout, never photo membership.
function preservePhotos(fn){const assignment=S.slides.map(sl=>imgLayers(sl).map(l=>l.photo));fn();distribute();}
['variationBtn','remixAllBtn','randomBtn','moreLikeBtn'].forEach(id=>{const b=$('#'+id);if(!b)return;b.addEventListener('click',()=>requestAnimationFrame(()=>run()),{capture:false})});
// Visible coverage indicator so the user can immediately see whether all photos are represented.
const css=document.createElement('style');css.textContent='.coverageBadge{font-size:10px;color:#777780;margin-left:8px;white-space:nowrap}.coverageBadge.good{color:#8b8b94}';document.head.appendChild(css);
function badge(){const top=$('.studioTop small');if(!top)return;let b=$('#coverageBadge');if(!b){b=document.createElement('span');b.id='coverageBadge';b.className='coverageBadge';top.after(b)}const unique=new Set(S.slides.flatMap(imgLayers).map(photoId).filter(Boolean)).size;b.textContent=`${unique}/${S.photos?.length||0} usadas`;b.classList.toggle('good',unique===(S.photos?.length||0))}
const oldRender=renderAll;renderAll=function(){oldRender();badge()};
distribute();oldRender();badge();saveProject();
})();