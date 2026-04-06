/**
 * Mermaid 图表查看器 - 为 Mermaid 图表提供全屏查看、复制、放大、缩小和重置功能
 * 提供流畅的图表浏览体验，支持键盘导航、手势操作和辅助功能
 */

document.addEventListener('DOMContentLoaded', () => {
  // 查找所有 Mermaid 图表容器
  const mermaidContainers = document.querySelectorAll('.mermaid');
  if (mermaidContainers.length === 0) return;

  // 创建图表查看器容器
  const viewerContainer = document.createElement('div');
  viewerContainer.id = 'mermaid-viewer-container';
  viewerContainer.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-md hidden';
  viewerContainer.setAttribute('aria-hidden', 'true');
  viewerContainer.setAttribute('role', 'dialog');
  viewerContainer.setAttribute('aria-modal', 'true');
  viewerContainer.setAttribute('aria-label', '图表查看器');
  
  // 创建查看器内容
  viewerContainer.innerHTML = `
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
  `;
  
  // 添加到 DOM
  document.body.appendChild(viewerContainer);
  
  // 获取元素引用
  const canvasContainer = viewerContainer.querySelector('.mermaid-canvas-container');
  const canvasSvg = viewerContainer.querySelector('.mermaid-canvas');
  const loader = viewerContainer.querySelector('.mermaid-loader');
  const closeButton = viewerContainer.querySelector('#mermaid-viewer-close');
  const copyButton = viewerContainer.querySelector('#mermaid-viewer-copy');
  const fullscreenButton = viewerContainer.querySelector('#mermaid-viewer-fullscreen');
  const zoomInButton = viewerContainer.querySelector('#mermaid-viewer-zoom-in');
  const zoomOutButton = viewerContainer.querySelector('#mermaid-viewer-zoom-out');
  const resetButton = viewerContainer.querySelector('#mermaid-viewer-reset');
  const rotateLeftButton = viewerContainer.querySelector('#mermaid-viewer-rotate-left');
  const rotateRightButton = viewerContainer.querySelector('#mermaid-viewer-rotate-right');
  const zoomLevelDisplay = viewerContainer.querySelector('#mermaid-zoom-level');
  const titleDisplay = viewerContainer.querySelector('#mermaid-title');
  
  // 状态变量
  let currentScale = 1;
  let currentRotation = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let translateX = 0;
  let translateY = 0;
  let currentMermaidCode = '';
  let currentDiagramIndex = 0;
  
  // 为每个 Mermaid 图表添加点击事件
  mermaidContainers.forEach((container, index) => {
    container.setAttribute('data-index', index);
    container.style.cursor = 'zoom-in';
    container.setAttribute('tabindex', '0');
    container.setAttribute('aria-label', '图表 (点击查看放大)');
    container.style.position = 'relative';
    
    // 添加提示图标
    const hintIcon = document.createElement('div');
    hintIcon.className = 'mermaid-hint-icon absolute top-2 right-2 opacity-0 transition-opacity duration-200 pointer-events-none';
    hintIcon.innerHTML = '<iconify-icon icon="mdi:magnify" width="16" height="16" style="color: #6b7280;"></iconify-icon>';
    container.appendChild(hintIcon);
    
    container.addEventListener('mouseenter', () => {
      hintIcon.classList.remove('opacity-0');
    });
    
    container.addEventListener('mouseleave', () => {
      hintIcon.classList.add('opacity-0');
    });
    
    // 鼠标点击
    container.addEventListener('click', () => {
      openViewer(index);
    });
    
    // 键盘访问
    container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openViewer(index);
      }
    });
  });
  
  // 打开查看器
  function openViewer(index) {
    currentDiagramIndex = index;
    const container = mermaidContainers[index];
    
    // 重置状态
    resetTransform();
    
    // 获取 Mermaid 代码
    currentMermaidCode = container.getAttribute('data-mermaid-code') || '';
    
    // 显示加载指示器
    loader.style.display = 'block';
    canvasContainer.classList.add('opacity-0');
    
    // 设置标题
    const title = container.getAttribute('data-title') || `图表 ${index + 1}`;
    titleDisplay.textContent = title;
    
    // 显示查看器
    viewerContainer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // 渲染图表
    setTimeout(() => {
      renderMermaidDiagram(currentMermaidCode);
    }, 100);
    
    // 焦点管理
    setTimeout(() => {
      closeButton.focus();
    }, 300);
    
    // 显示控制栏
    showControlBars();
  }
  
  // 渲染 Mermaid 图表
  async function renderMermaidDiagram(code) {
    try {
      if (!window.mermaid) {
        throw new Error('Mermaid library not loaded');
      }
      
      // 生成唯一 ID
      const id = `mermaid-viewer-svg-${Date.now()}`;
      
      // 使用 mermaid.render 渲染图表
      const { svg } = await window.mermaid.render(id, code);
      
      // 设置 SVG 内容
      canvasSvg.innerHTML = svg;
      
      // 隐藏加载器，显示图表
      loader.style.display = 'none';
      canvasContainer.classList.remove('opacity-0');
      
      // 应用当前变换
      applyTransform();
      
    } catch (error) {
      console.error('[Mermaid Viewer] Failed to render:', error);
      loader.style.display = 'none';
      canvasContainer.innerHTML = '<div class="text-red-500 text-center p-4">图表渲染失败</div>';
    }
  }
  
  // 重置变换
  function resetTransform() {
    currentScale = 1;
    currentRotation = 0;
    translateX = 0;
    translateY = 0;
    updateZoomLevel();
    applyTransform();
  }
  
  // 应用变换
  function applyTransform() {
    canvasSvg.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${currentRotation}deg) scale(${currentScale})`;
    updateZoomLevel();
  }
  
  // 更新缩放级别显示
  function updateZoomLevel() {
    zoomLevelDisplay.textContent = `${Math.round(currentScale * 100)}%`;
  }
  
  // 关闭查看器
  const handleClose = () => {
    viewerContainer.classList.add('hidden');
    document.body.style.overflow = '';
    resetTransform();
    
    // 清空内容
    setTimeout(() => {
      canvasSvg.innerHTML = '';
    }, 300);
  };
  
  // 复制图表代码
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentMermaidCode);
      
      // 显示复制成功提示
      const originalIcon = copyButton.innerHTML;
      copyButton.innerHTML = '<iconify-icon icon="mdi:check" width="20" height="20"></iconify-icon>';
      copyButton.classList.add('bg-green-600');
      
      setTimeout(() => {
        copyButton.innerHTML = originalIcon;
        copyButton.classList.remove('bg-green-600');
      }, 2000);
      
    } catch (error) {
      console.error('[Mermaid Viewer] Failed to copy:', error);
      
      // 显示复制失败提示
      const originalIcon = copyButton.innerHTML;
      copyButton.innerHTML = '<iconify-icon icon="mdi:close" width="20" height="20"></iconify-icon>';
      copyButton.classList.add('bg-red-600');
      
      setTimeout(() => {
        copyButton.innerHTML = originalIcon;
        copyButton.classList.remove('bg-red-600');
      }, 2000);
    }
  };
  
  // 全屏显示
  const handleFullscreen = () => {
    const viewerContent = viewerContainer.querySelector('.mermaid-viewer-content');
    
    if (!document.fullscreenElement) {
      viewerContainer.requestFullscreen().catch(err => {
        console.error('[Mermaid Viewer] Failed to enter fullscreen:', err);
      });
      fullscreenButton.innerHTML = '<iconify-icon icon="mdi:fullscreen-exit" width="20" height="20"></iconify-icon>';
    } else {
      document.exitFullscreen().catch(err => {
        console.error('[Mermaid Viewer] Failed to exit fullscreen:', err);
      });
      fullscreenButton.innerHTML = '<iconify-icon icon="mdi:fullscreen" width="20" height="20"></iconify-icon>';
    }
  };
  
  // 监听全屏变化
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
      fullscreenButton.innerHTML = '<iconify-icon icon="mdi:fullscreen" width="20" height="20"></iconify-icon>';
    }
  });
  
  // 缩放控制
  const zoomIn = () => {
    currentScale += 0.1;
    currentScale = Math.min(5, currentScale);
    applyTransform();
  };
  
  const zoomOut = () => {
    currentScale -= 0.1;
    currentScale = Math.max(0.1, currentScale);
    applyTransform();
  };
  
  // 旋转控制
  const rotateLeft = () => {
    currentRotation -= 90;
    applyTransform();
  };
  
  const rotateRight = () => {
    currentRotation += 90;
    applyTransform();
  };
  
  // 绑定事件处理程序
  closeButton.addEventListener('click', handleClose);
  copyButton.addEventListener('click', handleCopy);
  fullscreenButton.addEventListener('click', handleFullscreen);
  zoomInButton.addEventListener('click', zoomIn);
  zoomOutButton.addEventListener('click', zoomOut);
  resetButton.addEventListener('click', resetTransform);
  rotateLeftButton.addEventListener('click', rotateLeft);
  rotateRightButton.addEventListener('click', rotateRight);
  
  // 键盘事件处理
  document.addEventListener('keydown', (e) => {
    if (viewerContainer.classList.contains('hidden')) return;
    
    switch (e.key) {
      case 'Escape':
        handleClose();
        break;
      case '+':
      case '=':
        zoomIn();
        break;
      case '-':
        zoomOut();
        break;
      case '0':
        resetTransform();
        break;
      case 'r':
        rotateRight();
        break;
      case 'l':
        rotateLeft();
        break;
      case 'c':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleCopy();
        }
        break;
      case 'f':
        handleFullscreen();
        break;
    }
  });
  
  // 点击背景关闭
  viewerContainer.addEventListener('click', (e) => {
    if (e.target === viewerContainer || e.target.classList.contains('mermaid-viewer-content')) {
      handleClose();
    }
  });
  
  // 图表拖动功能
  canvasSvg.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    canvasSvg.style.cursor = 'grabbing';
    e.preventDefault();
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    applyTransform();
    e.preventDefault();
  });
  
  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    canvasSvg.style.cursor = 'grab';
  });
  
  // 阻止 SVG 默认拖拽行为
  canvasSvg.addEventListener('dragstart', (e) => {
    e.preventDefault();
  });
  
  // 滚轮缩放
  canvasContainer.addEventListener('wheel', (e) => {
    if (!viewerContainer.classList.contains('hidden')) {
      e.preventDefault();
      if (e.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    }
  }, { passive: false });
  
  // 触摸支持
  let initialTouchDistance = 0;
  let initialScale = 1;
  let touchStartX = 0;
  let touchStartY = 0;
  
  canvasSvg.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      touchStartX = e.touches[0].clientX - translateX;
      touchStartY = e.touches[0].clientY - translateY;
    } else if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      initialTouchDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      initialScale = currentScale;
    }
  }, { passive: false });
  
  canvasSvg.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && isDragging) {
      translateX = e.touches[0].clientX - touchStartX;
      translateY = e.touches[0].clientY - touchStartY;
      applyTransform();
    } else if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      currentScale = initialScale * (currentDistance / initialTouchDistance);
      currentScale = Math.max(0.1, Math.min(5, currentScale));
      applyTransform();
    }
  }, { passive: false });
  
  canvasSvg.addEventListener('touchend', () => {
    isDragging = false;
    initialTouchDistance = 0;
  });
  
  // 双击缩放
  canvasSvg.addEventListener('dblclick', (e) => {
    if (currentScale === 1) {
      currentScale = 2;
    } else {
      resetTransform();
    }
    applyTransform();
  });
  
  // 控制栏自动隐藏功能
  const controlBarContainer = viewerContainer.querySelector('.bottom-controls-container');
  const topControlsContainer = viewerContainer.querySelector('.top-controls-container');
  let controlBarTimeout;
  
  const showControlBars = () => {
    controlBarContainer.classList.remove('control-bar-hidden');
    topControlsContainer.classList.remove('controls-hidden');
    clearTimeout(controlBarTimeout);
    
    controlBarTimeout = setTimeout(() => {
      if (!viewerContainer.classList.contains('hidden')) {
        controlBarContainer.classList.add('control-bar-hidden');
        topControlsContainer.classList.add('controls-hidden');
      }
    }, 3000);
  };
  
  viewerContainer.addEventListener('mousemove', showControlBars);
  viewerContainer.addEventListener('touchstart', showControlBars);
  
  controlBarContainer.addEventListener('mouseenter', () => {
    clearTimeout(controlBarTimeout);
  });
  
  controlBarContainer.addEventListener('mouseleave', () => {
    controlBarTimeout = setTimeout(() => {
      if (!viewerContainer.classList.contains('hidden')) {
        controlBarContainer.classList.add('control-bar-hidden');
      }
    }, 3000);
  });
  
  // 添加手势提示
  const gestureIndicator = document.createElement('div');
  gestureIndicator.className = 'mermaid-gesture-indicator fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm hidden';
  gestureIndicator.innerHTML = '双指缩放 • 拖动移动 • 双击放大';
  document.body.appendChild(gestureIndicator);
  
  let hasShownGestureIndicator = false;
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'class') {
        const isHidden = viewerContainer.classList.contains('hidden');
        if (!isHidden && !hasShownGestureIndicator) {
          gestureIndicator.classList.remove('hidden');
          gestureIndicator.classList.add('fade-in');
          
          setTimeout(() => {
            gestureIndicator.classList.add('fade-out');
            setTimeout(() => {
              gestureIndicator.classList.add('hidden');
              gestureIndicator.classList.remove('fade-in', 'fade-out');
            }, 500);
          }, 3000);
          
          hasShownGestureIndicator = true;
        }
      }
    });
  });
  
  observer.observe(viewerContainer, { attributes: true });
});
