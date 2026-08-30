(()=>{
  // FRAME+ iPhone enhancements: persistent photos, draggable slides, and true frame movement.
  const DB='frame-plus-db-v2', STORE='photos';
  function dbOpen(){return new Promise((res,rej)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'id'})};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
  async function persistFiles(files){try{const db=await dbOpen(),tx=db.transaction(STORE,'readwrite'),st=tx.objectStore(STORE);st.clear();[...files].forEach((f,i)=>{const p=S.photos[i];if(p)st.put({id:p.id,name:f.name,type:f.type,blob:f})})}catch(e){console.warn('FRAME persist',e)}}
  async function restoreFiles(){try{const db=await dbOpen();const rows=await new Promise((res,rej)=>{const r=db.transaction(STORE).objectStore(STORE).getAll();r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});if(!rows.length)return false;const map=new Map(rows.map(r=>[r.id,{id:r.id,name:r.name,url:URL.createObjectURL(r.blob)}]));S.photos=S.photos.map(p=>map.get(p.id)||p);S.slides.forEach(sl=>sl.layers.forEach(l=>{if(l.type==='img'&&l.photo&&map.has(l.photo.id))l.photo=map.get(l.photo.id)}));return true}catch(e){console.warn('FRAME restore',e);return false}}

  const input=document.getElementById('photosInput');
  if(input) input.addEventListener('change',e=>setTimeout(()=>persistFiles(e.target.files),30));

  const resume=document.getElementById('resumeBtn');
  if(resume) resume.addEventListener('click',async e=>{e.preventDefault();e.stopImmediatePropagation();if(!loadProject())return toast('No hay proyecto guardado');document.getElementById('loading').classList.add('on');await restoreFiles();document.getElementById('uploadScreen').classList.remove('on');document.getElementById('studioScreen').classList.add('on');['#undoBtn','#redoBtn','#previewBtn','#newBtn'].forEach(id=>$(id).style.display='block');renderAll();document.getElementById('loading').classList.remove('on');toast('Proyecto restaurado')},true);

  // Record direct manipulation so Undo works after a drag/pinch.
  document.addEventListener('touchstart',e=>{const t=e.target.closest?.('.textLayer,.imgLayer');if(t&&S.slides.length)pushHistory()},{capture:true,passive:true});

  // Add photo interaction mode controls without redesigning the sheet.
  const photoSheet=document.getElementById('photoSheet');
  let modeRow=document.getElementById('photoMoveModes');
  if(photoSheet&&!modeRow){
    modeRow=document.createElement('div');modeRow.id='photoMoveModes';modeRow.className='grid3';
    modeRow.innerHTML='<button id="moveFrameMode">Mover marco</button><button id="cropFrameMode">Reencuadrar</button><button id="centerFrameBtn">Centrar</button>';
    const zoom=document.getElementById('zoomRange');zoom.parentNode.insertBefore(modeRow,zoom);
    const hint=photoSheet.querySelector('.hint');if(hint)hint.textContent='Mover marco: arrastra la foto completa. Reencuadrar: mueve la imagen dentro del marco. Dos dedos hacen pinch en ambos modos.';
  }
  const moveBtn=document.getElementById('moveFrameMode'), cropBtn=document.getElementById('cropFrameMode'), centerBtn=document.getElementById('centerFrameBtn');
  function activePhoto(){const l=currentLayer?.();return l&&l.type==='img'?l:null}
  function modeOf(l){return l?.frameMode||'move'}
  function updateModeUI(){const l=activePhoto();if(!l)return;const m=modeOf(l);if(moveBtn)moveBtn.classList.toggle('on',m==='move');if(cropBtn)cropBtn.classList.toggle('on',m==='crop')}
  if(moveBtn)moveBtn.onclick=()=>{const l=activePhoto();if(!l)return;l.frameMode='move';updateModeUI();toast('Arrastra para mover el marco')};
  if(cropBtn)cropBtn.onclick=()=>{const l=activePhoto();if(!l)return;l.frameMode='crop';updateModeUI();toast('Arrastra para reencuadrar')};
  if(centerBtn)centerBtn.onclick=()=>{const l=activePhoto();if(!l)return;pushHistory();const [W,H]=imgSize();l.x=(W-l.w)/2;l.y=(H-l.h)/2;renderAll();toast('Marco centrado')};
  const oldRenderPhotoSheet=renderPhotoSheet;
  renderPhotoSheet=function(){oldRenderPhotoSheet();updateModeUI()};

  // Replace the original photo gesture binding.
  bindImageGesture=function(el){
    const layerId=el.dataset.id, slideI=+el.dataset.slide;
    let st={mode:null,startDist:0,startZoom:1,startOX:0,startOY:0,startX:0,startY:0,startFrameX:0,startFrameY:0,startMidX:0,startMidY:0,moved:false};
    const layer=()=>S.slides[slideI]?.layers.find(l=>l.id===layerId);
    const scale=()=>Math.min(innerWidth-36,380)/340;
    function select(){const l=layer();if(!l)return null;S.currentSlide=slideI;S.selected=layerId;S.selectedType='img';return l}
    el.addEventListener('touchstart',e=>{
      const l=select();if(!l||l.locked)return;st.moved=false;
      if(e.touches.length===1){const t=e.touches[0];st.mode='drag';st.startX=t.clientX;st.startY=t.clientY;st.startOX=l.offX||0;st.startOY=l.offY||0;st.startFrameX=l.x;st.startFrameY=l.y}
      if(e.touches.length===2){const [a,b]=e.touches;st.mode='pinch';st.startDist=Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY);st.startZoom=l.zoom||1;st.startOX=l.offX||0;st.startOY=l.offY||0;st.startFrameX=l.x;st.startFrameY=l.y;st.startMidX=(a.clientX+b.clientX)/2;st.startMidY=(a.clientY+b.clientY)/2}
    },{passive:true});
    el.addEventListener('touchmove',e=>{
      const l=layer();if(!l||l.locked)return;const sc=scale(),edit=modeOf(l);
      if(st.mode==='drag'&&e.touches.length===1){e.preventDefault();const dx=e.touches[0].clientX-st.startX,dy=e.touches[0].clientY-st.startY;if(Math.abs(dx)+Math.abs(dy)>5)st.moved=true;
        if(edit==='move'){
          l.x=st.startFrameX+dx/sc;l.y=st.startFrameY+dy/sc;
          // Keep at least 35% of the frame reachable on canvas.
          const [W,H]=imgSize();l.x=Math.max(-l.w*.65,Math.min(W-l.w*.35,l.x));l.y=Math.max(-l.h*.65,Math.min(H-l.h*.35,l.y));
        }else{
          l.offX=Math.max(-48,Math.min(48,st.startOX+dx*.12));l.offY=Math.max(-48,Math.min(48,st.startOY+dy*.12));
        }
        renderStage();
      }
      if((st.mode==='pinch'||e.touches.length===2)&&e.touches.length===2){e.preventDefault();st.moved=true;const [a,b]=e.touches;const dist=Math.hypot(b.clientX-a.clientX,b.clientY-a.clientY);const midX=(a.clientX+b.clientX)/2,midY=(a.clientY+b.clientY)/2;l.zoom=Math.max(1,Math.min(3,st.startZoom*(dist/st.startDist)));
        if(edit==='move'){
          const dx=(midX-st.startMidX)/sc,dy=(midY-st.startMidY)/sc;l.x=st.startFrameX+dx;l.y=st.startFrameY+dy;
        }else{
          l.offX=Math.max(-48,Math.min(48,st.startOX+(midX-st.startMidX)*.12));l.offY=Math.max(-48,Math.min(48,st.startOY+(midY-st.startMidY)*.12));
        }
        renderStage();
      }
    },{passive:false});
    el.addEventListener('touchend',()=>{saveProject();if(st.moved&&navigator.vibrate)navigator.vibrate(6)},{passive:true});
    el.addEventListener('dblclick',()=>{const l=layer();if(!l)return;pushHistory();l.zoom=1;l.offX=0;l.offY=0;renderAll();toast('Encuadre reiniciado')});
    el.addEventListener('click',()=>{if(!st.moved){openPhoto(layerId,slideI);setTimeout(updateModeUI,0)}});
  };

  // Long-press/reorder slide thumbnails.
  function enableThumbDrag(){
    const thumbs=[...document.querySelectorAll('.thumb')];
    thumbs.forEach((t,i)=>{t.dataset.index=i;let active=false,timer=null,startX=0,startY=0;
      t.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;startY=e.touches[0].clientY;timer=setTimeout(()=>{active=true;t.style.transform='scale(1.08)';if(navigator.vibrate)navigator.vibrate(10)},280)},{passive:true});
      t.addEventListener('touchmove',e=>{if(!active){if(Math.hypot(e.touches[0].clientX-startX,e.touches[0].clientY-startY)>12)clearTimeout(timer);return}e.preventDefault();const hit=document.elementFromPoint(e.touches[0].clientX,e.touches[0].clientY)?.closest?.('.thumb');if(hit&&hit!==t){const a=+t.dataset.index,b=+hit.dataset.index;if(Number.isFinite(a)&&Number.isFinite(b)&&a!==b){const item=S.slides.splice(a,1)[0];S.slides.splice(b,0,item);S.currentSlide=b;renderAll()}}},{passive:false});
      t.addEventListener('touchend',()=>{clearTimeout(timer);if(active){active=false;t.style.transform='';saveProject()}},{passive:true});
    })
  }
  const oldFilm=renderFilmstrip;
  renderFilmstrip=function(){oldFilm();enableThumbDrag()};
  enableThumbDrag();

  // Refresh current DOM with the new gesture binder if a project is already open.
  if(S.slides?.length) renderAll();
})();