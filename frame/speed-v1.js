(()=>{
const PREF='frame_speed_prefs_v1';
const css=document.createElement('style');css.textContent=`
.quickbar{display:grid;grid-template-columns:1.15fr 1fr .9fr .9fr;gap:7px;padding:0 16px 11px}.quickbar button{min-height:43px;border-radius:15px;border:1px solid #292930;background:#121215;font-size:11px;font-weight:700}.quickbar .newDesign{background:#f2f2f4;color:#09090b;border-color:#f2f2f4}.quickbar .addPhotos{font-size:18px}.speedHidden{display:none!important}.fastToastAction{position:fixed;left:50%;bottom:calc(96px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:110;background:#f4f4f5;color:#09090b;padding:9px 13px;border-radius:999px;font-size:11px;font-weight:750;box-shadow:0 12px 40px rgba(0,0,0,.4);opacity:0;pointer-events:none;transition:.18s}.fastToastAction.on{opacity:1;pointer-events:auto}.preloadDot{display:inline-block;width:5px;height:5px;border-radius:50%;background:#8f8f98;margin-left:5px;vertical-align:middle}.studioTop{padding-bottom:7px}`;document.head.appendChild(css);
let prefs={};try{prefs=JSON.parse(localStorage.getItem(PREF)||'{}')}catch(e){}
const studio=$('#studioScreen'),top=studio?.querySelector('.studioTop');
const qb=document.createElement('div');qb.className='quickbar';qb.innerHTML='<button class="newDesign" id="fastNewDesign">✦ Nuevo diseño</button><button id="fastVariation">≈ Variación</button><button id="fastAdd" class="addPhotos">＋</button><button id="fastExport">↑ Exportar</button>';if(top)top.after(qb);
const addInput=document.createElement('input');addInput.type='file';addInput.accept='image/*';addInput.multiple=true;addInput.style.display='none';document.body.appendChild(addInput);
const undoAction=document.createElement('button');undoAction.className='fastToastAction';undoAction.textContent='Deshacer';document.body.appendChild(undoAction);
function hideClutter(){const keep=new Set(['safeBtn']);$$('#controlBar .pill').forEach(b=>{if(!keep.has(b.id))b.classList.add('speedHidden')});const dock=$('.dock');if(dock)dock.style.gridTemplateColumns='repeat(4,1fr)';$('#randomBtn')?.classList.add('speedHidden');$('#slideBtn')?.classList.add('speedHidden');}
hideClutter();
const observer=new MutationObserver(hideClutter);if($('#controlBar'))observer.observe($('#controlBar'),{childList:true});
function remember(){prefs.designDNA=S.designDNA||prefs.designDNA;prefs.finish=S.finish||prefs.finish;prefs.slides=S.slides?.length||prefs.slides;localStorage.setItem(PREF,JSON.stringify(prefs))}
function applyPrefs(){if(prefs.designDNA&&typeof DNAs!=='undefined'&&DNAs[prefs.designDNA])S.designDNA=prefs.designDNA;if(prefs.finish)S.finish=prefs.finish}
function protectManual(){S.slides.forEach(sl=>sl.layers.forEach(l=>{if(l.userTouched)l.locked=true}))}
function restoreManualLocks(){S.slides.forEach(sl=>sl.layers.forEach(l=>{if(l.userTouched)l.locked=false}))}
function markTouched(){const l=currentLayer?.();if(l)l.userTouched=true}
['textInput','sizeRange','zoomRange'].forEach(id=>$('#'+id)?.addEventListener('input',markTouched));
$('#fontRow')?.addEventListener('click',markTouched);$('#weightRow')?.addEventListener('click',markTouched);$('#colorRow')?.addEventListener('click',markTouched);$('#photoTray')?.addEventListener('click',markTouched);
document.addEventListener('touchend',()=>{if(S.selected)markTouched()},{passive:true});
function snapshot(){return clone({slides:S.slides,currentSlide:S.currentSlide,randomMode:S.randomMode,showSafe:S.showSafe,finish:S.finish,designDNA:S.designDNA})}
let quickUndo=null,undoTimer=null;function offerUndo(snap,label='Cambio aplicado'){quickUndo=snap;undoAction.textContent='Deshacer';undoAction.classList.add('on');clearTimeout(undoTimer);undoTimer=setTimeout(()=>undoAction.classList.remove('on'),3200);toast(label)}undoAction.onclick=()=>{if(!quickUndo)return;S.slides=quickUndo.slides;S.currentSlide=quickUndo.currentSlide;S.randomMode=quickUndo.randomMode;S.showSafe=quickUndo.showSafe;S.finish=quickUndo.finish;if(quickUndo.designDNA)S.designDNA=quickUndo.designDNA;quickUndo=null;undoAction.classList.remove('on');renderAll();toast('Deshecho')};
function fastVariation(){const snap=snapshot();protectManual();const b=$('#variationBtn');if(b)b.click();else $('#randomBtn')?.click();restoreManualLocks();remember();offerUndo(snap,'Variación lista')}
function fastNew(){const snap=snapshot();protectManual();const b=$('#remixAllBtn');if(b)b.click();else $('#directorBtn')?.click();restoreManualLocks();remember();offerUndo(snap,'Nuevo diseño')}
$('#fastVariation').onclick=fastVariation;$('#fastNewDesign').onclick=fastNew;$('#fastExport').onclick=()=>$('#exportAllBtn')?.click()||$('#exportBtn')?.click();$('#fastAdd').onclick=()=>addInput.click();
addInput.onchange=async e=>{const files=[...e.target.files];if(!files.length)return;const loading=$('#loading');loading?.classList.add('on');try{for(const f of files){const p={id:uid(),name:f.name,url:URL.createObjectURL(f)};S.photos.push(await analyzePhoto(p))}renderPhotoSheet();renderAll();toast(`${files.length} foto${files.length>1?'s':''} añadida${files.length>1?'s':''}`)}catch(err){toast('No pude añadir esas fotos')}finally{loading?.classList.remove('on');addInput.value=''}};
// Make ordinary export one tap: all slides. Long press keeps advanced sheet.
const exportTool=$('#exportBtn');if(exportTool){let hold=false,timer;exportTool.onclick=null;exportTool.addEventListener('touchstart',()=>{hold=false;timer=setTimeout(()=>{hold=true;openSheet('#exportSheet')},520)},{passive:true});exportTool.addEventListener('touchend',e=>{clearTimeout(timer);if(!hold){e.preventDefault();$('#exportAllBtn')?.click()}},{passive:false});exportTool.addEventListener('click',()=>{if(!hold)$('#exportAllBtn')?.click()})}
// Auto-resume: if a usable project exists, skip the extra resume tap.
setTimeout(()=>{if($('#uploadScreen')?.classList.contains('on')&&localStorage.getItem('frame_director_project_v1')){$('#resumeBtn')?.click()}},80);
// Save preferences whenever the project settles.
const oldSave=saveProject;saveProject=function(){oldSave();remember()};applyPrefs();remember();
})();