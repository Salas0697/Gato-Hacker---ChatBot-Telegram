(()=>{
const CW=340,CH=425;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function imgs(sl){return sl.layers.filter(l=>l.type==='img'&&!l.hidden)}
function texts(sl){return sl.layers.filter(l=>l.type==='text'&&!l.hidden)}
function allImgLayers(){return S.slides.flatMap(sl=>sl.layers.filter(l=>l.type==='img'))}
function baseImg(){return allImgLayers()[0]||null}
function nextPhoto(i){return S.photos?.[i%Math.max(1,S.photos.length)]||null}
function cloneImgTemplate(t,p){if(!t||!p)return null;const l=clone(t);l.id=uid();l.photo=p;l.hidden=false;l.locked=false;l.userTouched=false;l.rot=0;l.zoom=1;l.offX=0;l.offY=0;l.z=10;return l}
function useFullBleed(l){l.x=0;l.y=0;l.w=CW;l.h=CH;l.rot=0;l.zoom=Math.max(1,l.zoom||1);l.offX=clamp(l.offX||0,-18,18);l.offY=clamp(l.offY||0,-18,18)}
function useEditorialInset(l,mode=0){l.rot=0;l.zoom=Math.max(1,l.zoom||1);if(mode===0){l.x=18;l.y=22;l.w=304;l.h=381}else if(mode===1){l.x=0;l.y=0;l.w=340;l.h=300}else{l.x=24;l.y=35;l.w=292;l.h=355}}
function photoActivity(p){const g=p?.grid;if(!Array.isArray(g)||g.length<9)return null;return g.map(Number)}
function quietZone(p){const g=photoActivity(p);if(!g)return 'bottom';const zones={top:(g[0]+g[1]+g[2])/3,bottom:(g[6]+g[7]+g[8])/3,left:(g[0]+g[3]+g[6])/3,right:(g[2]+g[5]+g[8])/3};return Object.entries(zones).sort((a,b)=>a[1]-b[1])[0][0]}
function sanitizeText(sl){const ts=texts(sl);for(const t of ts){if(t.userTouched)continue;const raw=String(t.text??t.value??t.content??'').trim();const bad=/^(NYC|CITY NOTES|MOMENTS|MEMORIES|VOL\.?\s*0?1?|AUG\s*2026)$/i.test(raw);if(bad)t.hidden=true;else{t.rot=0;t.size=clamp(t.size||24,14,42);t.w=clamp(t.w||180,90,270)}}}
function placeText(sl){const im=imgs(sl)[0],ts=texts(sl).filter(t=>!t.userTouched);if(!im||!ts.length)return;const q=quietZone(im.photo);ts.forEach((t,i)=>{if(i>0){t.hidden=true;return}t.rot=0;t.size=clamp(t.size||28,18,38);t.w=clamp(t.w||220,130,280);if(q==='top'){t.x=22;t.y=22}else if(q==='bottom'){t.x=22;t.y=CH-t.size*1.8-18}else if(q==='left'){t.x=20;t.y=CH*.48}else{t.x=CW-t.w-20;t.y=CH*.48};t.z=26})}
function removeNoise(sl){sl.layers=sl.layers.filter(l=>{if(l.userTouched)return true;if(l.type==='deco')return false;return true})}
function ensurePhoto(sl,idx,template){let arr=imgs(sl);if(!arr.length){const l=cloneImgTemplate(template,nextPhoto(idx));if(l){sl.layers.unshift(l);arr=[l]}}return arr}
function normalizeSlide(sl,idx,template){removeNoise(sl);let arr=ensurePhoto(sl,idx,template);if(!arr.length)return;
  // At most 2 visible photos. Preserve user-edited layers, hide surplus automatic ones.
  const manual=arr.filter(l=>l.userTouched),automatic=arr.filter(l=>!l.userTouched);automatic.slice(Math.max(0,2-manual.length)).forEach(l=>l.hidden=true);arr=imgs(sl);
  const lead=arr[0];if(!lead.userTouched){const mode=idx%4;if(mode===0||mode===3)useFullBleed(lead);else useEditorialInset(lead,mode===1?0:2)}
  if(arr[1]&&!arr[1].userTouched){const b=arr[1];b.rot=0;b.zoom=Math.max(1,b.zoom||1);if(idx%2){b.x=188;b.y=245;b.w=132;b.h=158}else{b.x=18;b.y=268;b.w=126;b.h=139}b.z=16}
  sanitizeText(sl);placeText(sl);
  // Reject near-empty visual coverage: an automatic lead photo must cover substantial canvas.
  if(!lead.userTouched&&lead.w*lead.h<CW*CH*.55)useFullBleed(lead);
  // Keep photo offsets conservative so crops don't feel random.
  arr.forEach(l=>{if(!l.userTouched){l.offX=clamp(l.offX||0,-22,22);l.offY=clamp(l.offY||0,-22,22);l.zoom=clamp(l.zoom||1,1,1.35);l.rot=clamp(l.rot||0,-1.2,1.2)}})
}
function deDuplicatePhotos(){const used=new Map();S.slides.forEach((sl,i)=>{const lead=imgs(sl)[0];if(!lead||lead.userTouched)return;const id=lead.photo?.id;if(!id)return;const n=used.get(id)||0;if(n>0&&S.photos?.length>S.slides.length*.6){const replacement=S.photos.find(p=>!used.has(p.id));if(replacement)lead.photo=replacement}used.set(lead.photo?.id,(used.get(lead.photo?.id)||0)+1)})}
function surgery(){if(!S.slides?.length||!S.photos?.length)return;const t=baseImg();S.slides.forEach((sl,i)=>normalizeSlide(sl,i,t));deDuplicatePhotos()}
const oldBuild=buildSlides;buildSlides=function(){oldBuild();surgery()};
const oldRenderAll=renderAll;renderAll=function(){surgery();oldRenderAll()};
// Re-normalize after the existing design actions.
['variationBtn','remixAllBtn','randomBtn','moreLikeBtn','wildBtn'].forEach(id=>{const b=$('#'+id);if(!b)return;b.addEventListener('click',()=>requestAnimationFrame(()=>{surgery();oldRenderAll();saveProject()}))});
// Disable Wild as an automatic default path: it was a major source of arbitrary rectangles/text.
const wild=$('#wildBtn');if(wild)wild.classList.add('speedHidden');
surgery();oldRenderAll();saveProject();
})();