(()=>{
const css=document.createElement('style');css.textContent=`
/* FRAME v20 — choose, choose again, export */
body.simpleFrame .studioTop{padding:18px 18px 10px!important}body.simpleFrame .studioTop h1{display:none!important}body.simpleFrame .studioTop small{font-size:12px!important;color:#777780!important}body.simpleFrame #modeLabel,body.simpleFrame #controlBar,body.simpleFrame .quickbar,body.simpleFrame .dock,body.simpleFrame .coverageBadge,body.simpleFrame #spreadBadge,body.simpleFrame #randomStudioBtn,body.simpleFrame #safeBtn{display:none!important}
.simpleActions{display:grid;grid-template-columns:1fr 1.22fr 1fr;gap:8px;padding:0 18px 13px;position:relative;z-index:20}.simpleActions button{height:44px;border-radius:999px;border:1px solid #29292f;background:#121215;color:#f4f4f5;font-size:12px;font-weight:750}.simpleActions .again{background:#f4f4f5;color:#09090b;border-color:#f4f4f5}.simpleActions button:active{transform:scale(.97)}
.simpleHelp{padding:0 19px 11px;color:#6f6f78;font-size:10px;letter-spacing:.01em}.simpleFrame .canvasWrap{margin-top:0!important}.simpleFrame .filmstrip{margin-top:10px!important}.simpleFrame .pager{bottom:92px!important}
.simpleContext{position:fixed;left:50%;bottom:calc(22px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:150;display:none;gap:6px;padding:6px;border-radius:18px;background:rgba(16,16,19,.96);border:1px solid rgba(255,255,255,.1);box-shadow:0 18px 50px rgba(0,0,0,.48);backdrop-filter:blur(20px)}.simpleContext.on{display:flex}.simpleContext button{height:40px;padding:0 13px;border:0;border-radius:12px;background:#29292f;color:#f4f4f5;font-size:11px;font-weight:750}.simpleContext .danger{color:#ff969e;background:#35171b}
.simpleFrame .editHint{display:none!important}.simpleFrame .randomStudioSheet{display:none!important}.simpleFrame .emptyQuick{margin-top:105px!important}.simpleFrame.emptyStateFast .simpleActions,.simpleFrame.emptyStateFast .simpleHelp{display:none!important}
`;document.head.appendChild(css);document.body.classList.add('simpleFrame');
const studio=$('#studioScreen'),top=studio?.querySelector('.studioTop');
const actions=document.createElement('div');actions.className='simpleActions';actions.innerHTML='<button id="simplePhotos">＋ Fotos</button><button class="again" id="simpleAgain">✦ Otra opción</button><button id="simpleExport">↑ Exportar</button>';if(top)top.after(actions);
const help=document.createElement('div');help.className='simpleHelp';help.textContent='Toca una foto o un texto para cambiarlo.';actions.after(help);
const ctx=document.createElement('div');ctx.className='simpleContext';ctx.innerHTML='<button id="simplePrimary">Editar</button><button id="simpleReplace">Cambiar foto</button><button class="danger" id="simpleDelete">Eliminar</button>';document.body.appendChild(ctx);
const add=$('#fastAdd'),again=$('#fastNewDesign'),exp=$('#fastExport');
$('#simplePhotos').onclick=()=>add?.click();$('#simpleAgain').onclick=()=>again?.click();$('#simpleExport').onclick=()=>exp?.click();
function selectedLayer(){if(!S.selected)return null;return S.slides[S.currentSlide]?.layers.find(l=>l.id===S.selected)||null}
function showContext(){const l=selectedLayer();if(!l){ctx.classList.remove('on');return}const isText=l.type==='text';$('#simplePrimary').textContent=isText?'Editar texto':'Reencuadrar';$('#simpleReplace').style.display=isText?'none':'';ctx.classList.add('on')}
function clearContext(){ctx.classList.remove('on')}
// Mirror selection made by the safe interaction layer, but present only plain-language actions.
document.addEventListener('click',e=>{if(e.target.closest?.('.imgLayer,.textLayer'))setTimeout(showContext,0);else if(!e.target.closest?.('.simpleContext,.sheet,.photoEditorV2'))clearContext()},true);
document.addEventListener('touchend',e=>{if(e.target.closest?.('.imgLayer,.textLayer'))setTimeout(showContext,0)},{passive:true,capture:true});
$('#simplePrimary').onclick=()=>{const l=selectedLayer();if(!l)return;if(l.type==='text'){renderTextSheet?.();openSheet?.('#textSheet');setTimeout(()=>$('#textInput')?.focus(),80)}else if(typeof openPhotoEditorV2==='function')openPhotoEditorV2();else $('#uxEdit')?.click();clearContext()};
$('#simpleReplace').onclick=()=>{if(!selectedLayer())return;renderPhotoSheet?.();openSheet?.('#photoSheet');clearContext()};
$('#simpleDelete').onclick=()=>{$('#uxDelete')?.click();clearContext()};
// Hide legacy terminology that leaks implementation details.
function clean(){document.querySelectorAll('button').forEach(b=>{const t=(b.textContent||'').trim();if(t==='Mover marco')b.textContent='Mover marco';});const brand=document.querySelector('.brand');if(brand&&brand.textContent.includes('Director'))brand.innerHTML=brand.innerHTML.replace('Director','')}
clean();new MutationObserver(clean).observe(document.body,{childList:true,subtree:true});
})();