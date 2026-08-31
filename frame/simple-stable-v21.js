(()=>{
/* v21 only simplifies existing controls. It does not wrap render/build/photo flows. */
const css=document.createElement('style');css.textContent=`
body.frameSimple .quickbar>*{display:none!important}body.frameSimple .quickbar #fastAdd,body.frameSimple .quickbar #fastNewDesign,body.frameSimple .quickbar #fastExport{display:inline-flex!important}body.frameSimple .quickbar{display:flex!important;gap:8px!important;justify-content:center!important;padding:8px 12px!important;overflow:visible!important}body.frameSimple .quickbar button{flex:1!important;max-width:150px!important;min-width:0!important;height:42px!important;border-radius:999px!important;font-size:12px!important;font-weight:750!important}body.frameSimple #fastNewDesign{background:#f2f2f4!important;color:#09090b!important;border-color:#f2f2f4!important}
body.frameSimple .dock{display:none!important}body.frameSimple #safeBtn,body.frameSimple #randomBtn,body.frameSimple #randomStudioBtn,body.frameSimple #variationBtn,body.frameSimple #remixAllBtn,body.frameSimple #moreLikeBtn{display:none!important}body.frameSimple .studioTop{padding-bottom:6px!important}body.frameSimple .studioTop small{font-size:11px!important;color:#74747d!important}body.frameSimple .filmstrip{margin-bottom:calc(14px + env(safe-area-inset-bottom))!important}
.frameSimpleHint{text-align:center;color:#707079;font-size:10px;padding:2px 12px 5px;pointer-events:none}.frameSimple .emptyQuick{margin-top:96px!important}
`;document.head.appendChild(css);document.body.classList.add('frameSimple');
function setLabel(id,label){const el=document.getElementById(id);if(el)el.textContent=label}
setLabel('fastAdd','＋ Fotos');setLabel('fastNewDesign','✦ Otra opción');setLabel('fastExport','↑ Exportar');
const q=document.querySelector('.quickbar');if(q&&!document.querySelector('.frameSimpleHint')){const h=document.createElement('div');h.className='frameSimpleHint';h.textContent='Toca cualquier foto o texto para editarlo.';q.after(h)}
// Rename only visible legacy wording; all original event handlers remain untouched.
function labels(){setLabel('fastAdd','＋ Fotos');setLabel('fastNewDesign','✦ Otra opción');setLabel('fastExport','↑ Exportar');const u=document.getElementById('uxEdit');if(u&&S?.selectedType==='img')u.textContent='Reencuadrar';if(u&&S?.selectedType==='text')u.textContent='Editar texto'}
labels();new MutationObserver(labels).observe(document.body,{childList:true,subtree:true});
})();