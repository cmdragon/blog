document.addEventListener("DOMContentLoaded",()=>{const y=document.querySelectorAll(".mermaid");if(y.length===0)return;const e=document.createElement("div");e.id="mermaid-viewer-container",e.className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-md hidden",e.setAttribute("aria-hidden","true"),e.setAttribute("role","dialog"),e.setAttribute("aria-modal","true"),e.setAttribute("aria-label","图表查看器"),e.innerHTML=`
    <div class="relative w-full h-full p-4 md:p-8 flex items-center justify-center">
      <div class="mermaid-viewer-content w-full h-full flex items-center justify-center overflow-auto">
        <div class="mermaid-loader"></div>
        <div class="mermaid-canvas-container relative opacity-0 transition-opacity duration-300">
          <svg class="mermaid-canvas max-w-full max-h-full" style="display: block;"></svg>
        </div>
      </div>
      
      <div class="top-controls-container absolute top-0 left-0 right-0 flex justify-between items-start p-4">
        <div class="mermaid-title-container">
          <div id="mermaid-title" class="px-4 py-2 bg-gray-800 bg-opacity-70 backdrop-blur-md text-white rounded-lg text-sm font-medium"></div>
        </div>
        
        <div class="top-right-controls flex gap-2">
          <button id="mermaid-viewer-copy" class="p-2 rounded-full text-white hover:bg-gray-700 transition-colors relative z-10" aria-label="复制图表代码" tabindex="0">
            <iconify-icon icon="mdi:content-copy" width="20" height="20"></iconify-icon>
          </button>
          <button id="mermaid-viewer-fullscreen" class="p-2 rounded-full text-white hover:bg-gray-700 transition-colors relative z-10" aria-label="全屏显示" tabindex="0">
            <iconify-icon icon="mdi:fullscreen" width="20" height="20"></iconify-icon>
          </button>
          <button id="mermaid-viewer-close" class="p-2 rounded-full text-white hover:bg-gray-700 transition-colors relative z-10" aria-label="关闭查看器" tabindex="0">
            <iconify-icon icon="mdi:close" width="20" height="20"></iconify-icon>
          </button>
        </div>
      </div>
      
      <div class="bottom-controls-container absolute bottom-0 left-0 right-0 flex flex-col items-center justify-center pb-4">
        <div class="control-bar flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-full">
          <button id="mermaid-viewer-zoom-out" class="p-2 rounded-full text-white hover:bg-gray-700 transition-colors" aria-label="缩小" tabindex="0">
            <iconify-icon icon="mdi:magnify-minus" width="20" height="20"></iconify-icon>
          </button>
          
          <button id="mermaid-viewer-reset" class="p-2 rounded-full text-white hover:bg-gray-700 transition-colors" aria-label="重置大小" tabindex="0">
            <iconify-icon icon="mdi:refresh" width="20" height="20"></iconify-icon>
          </button>
          
          <button id="mermaid-viewer-zoom-in" class="p-2 rounded-full text-white hover:bg-gray-700 transition-colors" aria-label="放大" tabindex="0">
            <iconify-icon icon="mdi:magnify-plus" width="20" height="20"></iconify-icon>
          </button>
          
          <div class="mx-2 h-6 w-px bg-gray-400 bg-opacity-50"></div>
          
          <span id="mermaid-zoom-level" class="text-white text-sm px-2 min-w-[60px] text-center">100%</span>
          
          <div class="mx-2 h-6 w-px bg-gray-400 bg-opacity-50"></div>
          
          <button id="mermaid-viewer-rotate-left" class="p-2 rounded-full text-white hover:bg-gray-700 transition-colors" aria-label="向左旋转" tabindex="0">
            <iconify-icon icon="mdi:rotate-left" width="20" height="20"></iconify-icon>
          </button>
          
          <button id="mermaid-viewer-rotate-right" class="p-2 rounded-full text-white hover:bg-gray-700 transition-colors" aria-label="向右旋转" tabindex="0">
            <iconify-icon icon="mdi:rotate-right" width="20" height="20"></iconify-icon>
          </button>
        </div>
      </div>
    </div>
  `,document.body.appendChild(e);const h=e.querySelector(".mermaid-canvas-container"),s=e.querySelector(".mermaid-canvas"),v=e.querySelector(".mermaid-loader"),k=e.querySelector("#mermaid-viewer-close"),n=e.querySelector("#mermaid-viewer-copy"),m=e.querySelector("#mermaid-viewer-fullscreen"),I=e.querySelector("#mermaid-viewer-zoom-in"),V=e.querySelector("#mermaid-viewer-zoom-out"),$=e.querySelector("#mermaid-viewer-reset"),H=e.querySelector("#mermaid-viewer-rotate-left"),P=e.querySelector("#mermaid-viewer-rotate-right"),W=e.querySelector("#mermaid-zoom-level"),R=e.querySelector("#mermaid-title");let t=1,f=0,a=!1,E=0,L=0,c=0,r=0,w="",B=0;y.forEach((e,t)=>{e.setAttribute("data-index",t),e.style.cursor="zoom-in",e.setAttribute("tabindex","0"),e.setAttribute("aria-label","图表 (点击查看放大)"),e.style.position="relative";const n=document.createElement("div");n.className="mermaid-hint-icon absolute top-2 right-2 opacity-0 transition-opacity duration-200 pointer-events-none",n.innerHTML='<iconify-icon icon="mdi:magnify" width="16" height="16" style="color: #6b7280;"></iconify-icon>',e.appendChild(n),e.addEventListener("mouseenter",()=>{n.classList.remove("opacity-0")}),e.addEventListener("mouseleave",()=>{n.classList.add("opacity-0")}),e.addEventListener("click",()=>{T(t)}),e.addEventListener("keydown",e=>{(e.key==="Enter"||e.key===" ")&&(e.preventDefault(),T(t))})});function T(t){B=t;const n=y[t];d(),w=n.getAttribute("data-mermaid-code")||"",v.style.display="block",h.classList.add("opacity-0");const s=n.getAttribute("data-title")||`图表 ${t+1}`;R.textContent=s,e.classList.remove("hidden"),document.body.style.overflow="hidden",setTimeout(()=>{U(w)},100),setTimeout(()=>{k.focus()},300),b()}async function U(e){try{if(!window.mermaid)throw new Error("Mermaid library not loaded");const t=`mermaid-viewer-svg-${Date.now()}`,{svg:n}=await window.mermaid.render(t,e);s.innerHTML=n,v.style.display="none",h.classList.remove("opacity-0"),o()}catch(e){console.error("[Mermaid Viewer] Failed to render:",e),v.style.display="none",h.innerHTML='<div class="text-red-500 text-center p-4">图表渲染失败</div>'}}function d(){t=1,f=0,c=0,r=0,A(),o()}function o(){s.style.transform=`translate(${c}px, ${r}px) rotate(${f}deg) scale(${t})`,A()}function A(){W.textContent=`${Math.round(t*100)}%`}const g=()=>{e.classList.add("hidden"),document.body.style.overflow="",d(),setTimeout(()=>{s.innerHTML=""},300)},M=async()=>{try{await navigator.clipboard.writeText(w);const e=n.innerHTML;n.innerHTML='<iconify-icon icon="mdi:check" width="20" height="20"></iconify-icon>',n.classList.add("bg-green-600"),setTimeout(()=>{n.innerHTML=e,n.classList.remove("bg-green-600")},2e3)}catch(e){console.error("[Mermaid Viewer] Failed to copy:",e);const t=n.innerHTML;n.innerHTML='<iconify-icon icon="mdi:close" width="20" height="20"></iconify-icon>',n.classList.add("bg-red-600"),setTimeout(()=>{n.innerHTML=t,n.classList.remove("bg-red-600")},2e3)}},F=()=>{const t=e.querySelector(".mermaid-viewer-content");document.fullscreenElement?(document.exitFullscreen().catch(e=>{console.error("[Mermaid Viewer] Failed to exit fullscreen:",e)}),m.innerHTML='<iconify-icon icon="mdi:fullscreen" width="20" height="20"></iconify-icon>'):(e.requestFullscreen().catch(e=>{console.error("[Mermaid Viewer] Failed to enter fullscreen:",e)}),m.innerHTML='<iconify-icon icon="mdi:fullscreen-exit" width="20" height="20"></iconify-icon>')};document.addEventListener("fullscreenchange",()=>{document.fullscreenElement||(m.innerHTML='<iconify-icon icon="mdi:fullscreen" width="20" height="20"></iconify-icon>')});const _=()=>{t+=.1,t=Math.min(5,t),o()},p=()=>{t-=.1,t=Math.max(.1,t),o()},D=()=>{f-=90,o()},N=()=>{f+=90,o()};k.addEventListener("click",g),n.addEventListener("click",M),m.addEventListener("click",F),I.addEventListener("click",_),V.addEventListener("click",p),$.addEventListener("click",d),H.addEventListener("click",D),P.addEventListener("click",N),document.addEventListener("keydown",t=>{if(e.classList.contains("hidden"))return;switch(t.key){case"Escape":g();break;case"+":case"=":_();break;case"-":p();break;case"0":d();break;case"r":N();break;case"l":D();break;case"c":(t.ctrlKey||t.metaKey)&&(t.preventDefault(),M());break;case"f":F();break}}),e.addEventListener("click",t=>{(t.target===e||t.target.classList.contains("mermaid-viewer-content"))&&g()}),s.addEventListener("mousedown",e=>{if(e.button!==0)return;a=!0,E=e.clientX-c,L=e.clientY-r,s.style.cursor="grabbing",e.preventDefault()}),document.addEventListener("mousemove",e=>{if(!a)return;c=e.clientX-E,r=e.clientY-L,o(),e.preventDefault()}),document.addEventListener("mouseup",()=>{if(!a)return;a=!1,s.style.cursor="grab"}),s.addEventListener("dragstart",e=>{e.preventDefault()}),h.addEventListener("wheel",t=>{e.classList.contains("hidden")||(t.preventDefault(),t.deltaY<0?_():p())},{passive:!1});let j=0,O=1,z=0,x=0;s.addEventListener("touchstart",e=>{if(e.touches.length===1)a=!0,z=e.touches[0].clientX-c,x=e.touches[0].clientY-r;else if(e.touches.length===2){e.preventDefault();const n=e.touches[0],s=e.touches[1];j=Math.hypot(s.clientX-n.clientX,s.clientY-n.clientY),O=t}},{passive:!1}),s.addEventListener("touchmove",e=>{if(e.touches.length===1&&a)c=e.touches[0].clientX-z,r=e.touches[0].clientY-x,o();else if(e.touches.length===2){e.preventDefault();const n=e.touches[0],s=e.touches[1],i=Math.hypot(s.clientX-n.clientX,s.clientY-n.clientY);t=O*(i/j),t=Math.max(.1,Math.min(5,t)),o()}},{passive:!1}),s.addEventListener("touchend",()=>{a=!1,j=0}),s.addEventListener("dblclick",e=>{t===1?t=2:d(),o()});const l=e.querySelector(".bottom-controls-container"),S=e.querySelector(".top-controls-container");let u;const b=()=>{l.classList.remove("control-bar-hidden"),S.classList.remove("controls-hidden"),clearTimeout(u),u=setTimeout(()=>{e.classList.contains("hidden")||(l.classList.add("control-bar-hidden"),S.classList.add("controls-hidden"))},3e3)};e.addEventListener("mousemove",b),e.addEventListener("touchstart",b),l.addEventListener("mouseenter",()=>{clearTimeout(u)}),l.addEventListener("mouseleave",()=>{u=setTimeout(()=>{e.classList.contains("hidden")||l.classList.add("control-bar-hidden")},3e3)});const i=document.createElement("div");i.className="mermaid-gesture-indicator fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm hidden",i.innerHTML="双指缩放 • 拖动移动 • 双击放大",document.body.appendChild(i);let C=!1;const K=new MutationObserver(t=>{t.forEach(t=>{if(t.attributeName==="class"){const t=e.classList.contains("hidden");!t&&!C&&(i.classList.remove("hidden"),i.classList.add("fade-in"),setTimeout(()=>{i.classList.add("fade-out"),setTimeout(()=>{i.classList.add("hidden"),i.classList.remove("fade-in","fade-out")},500)},3e3),C=!0)}})});K.observe(e,{attributes:!0})})