/**
 * 网站通用工具函数库
 * 提供常用的 DOM 操作、事件处理等功能
 */

// 确保在浏览器环境中执行
(function(global) {
  'use strict';
  
  /**
   * 平滑滚动到页面顶部
   * @param {number} duration - 滚动持续时间 (毫秒)
   */
  function scrollToTop(duration = 500) {
    const start = window.pageYOffset;
    const change = -start;
    const startTime = performance.now();
    
    function animateScroll(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用 easeInOutQuad 缓动函数
      const ease = progress < 0.5 
        ? 2 * progress * progress 
        : -1 + (4 - 2 * progress) * progress;
      
      window.scrollTo(0, start + change * ease);
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    }
    
    requestAnimationFrame(animateScroll);
  }
  
  /**
   * 显示/隐藏元素
   * @param {HTMLElement} element - 目标元素
   * @param {boolean} show - 显示或隐藏
   */
  function toggleElement(element, show) {
    if (!element) return;
    
    if (show === undefined) {
      element.classList.toggle('hidden');
    } else if (show) {
      element.classList.remove('hidden');
    } else {
      element.classList.add('hidden');
    }
  }
  
  /**
   * 创建防抖函数
   * @param {Function} func - 要防抖的函数
   * @param {number} wait - 等待时间 (毫秒)
   * @returns {Function} 防抖后的函数
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  /**
   * 创建节流函数
   * @param {Function} func - 要节流的函数
   * @param {number} limit - 时间限制 (毫秒)
   * @returns {Function} 节流后的函数
   */
  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  /**
   * 检查元素是否在视口中
   * @param {HTMLElement} element - 要检查的元素
   * @param {number} threshold - 阈值 (0-1)
   * @returns {boolean} 是否在视口中
   */
  function isInViewport(element, threshold = 0) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    
    return (
      rect.top <= viewportHeight * (1 - threshold) &&
      rect.bottom >= viewportHeight * threshold &&
      rect.left <= viewportWidth * (1 - threshold) &&
      rect.right >= viewportWidth * threshold
    );
  }
  
  /**
   * 懒加载图片
   * @param {NodeList} images - 图片元素列表
   * @param {string} dataAttribute - 数据属性名 (默认 data-src)
   */
  function lazyLoadImages(images, dataAttribute = 'data-src') {
    if (!images || images.length === 0) return;
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        
        const img = entry.target;
        const src = img.getAttribute(dataAttribute);
        
        if (src) {
          img.src = src;
          img.removeAttribute(dataAttribute);
          img.classList.add('loaded');
        }
        
        observer.unobserve(img);
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  }
  
  /**
   * 复制文本到剪贴板
   * @param {string} text - 要复制的文本
   * @returns {Promise<boolean>} 是否成功
   */
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('复制失败:', err);
      return false;
    }
  }
  
  /**
   * 显示 Toast 提示
   * @param {string} message - 提示信息
   * @param {string} type - 提示类型 (success, error, info, warning)
   * @param {number} duration - 显示时长 (毫秒)
   */
  function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // 基础样式
    Object.assign(toast.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '12px 24px',
      borderRadius: '8px',
      backgroundColor: type === 'success' ? '#10b981' : 
                       type === 'error' ? '#ef4444' : 
                       type === 'warning' ? '#f59e0b' : '#3b82f6',
      color: 'white',
      fontWeight: '500',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: '9999',
      animation: 'slideIn 0.3s ease-out',
      transition: 'opacity 0.3s ease'
    });
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
  
  /**
   * 本地存储封装
   */
  const storage = {
    /**
     * 设置存储
     * @param {string} key - 键
     * @param {any} value - 值
     */
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error('Storage set error:', e);
      }
    },
    
    /**
     * 获取存储
     * @param {string} key - 键
     * @param {any} defaultValue - 默认值
     * @returns {any} 存储的值
     */
    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        console.error('Storage get error:', e);
        return defaultValue;
      }
    },
    
    /**
     * 移除存储
     * @param {string} key - 键
     */
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error('Storage remove error:', e);
      }
    },
    
    /**
     * 清空存储
     */
    clear() {
      try {
        localStorage.clear();
      } catch (e) {
        console.error('Storage clear error:', e);
      }
    }
  };
  
  /**
   * 深色模式管理
   */
  const themeManager = {
    /**
     * 初始化主题
     */
    init() {
      const savedTheme = storage.get('color-theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        this.setDark(true);
      }
    },
    
    /**
     * 设置深色模式
     * @param {boolean} isDark - 是否为深色模式
     */
    setDark(isDark) {
      if (isDark) {
        document.documentElement.classList.add('dark');
        storage.set('color-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        storage.set('color-theme', 'light');
      }
    },
    
    /**
     * 切换主题
     */
    toggle() {
      const isDark = document.documentElement.classList.contains('dark');
      this.setDark(!isDark);
      return !isDark;
    },
    
    /**
     * 获取当前主题
     * @returns {boolean} 是否为深色模式
     */
    isDark() {
      return document.documentElement.classList.contains('dark');
    }
  };
  
  // 导出到全局
  global.SiteUtils = {
    scrollToTop,
    toggleElement,
    debounce,
    throttle,
    isInViewport,
    lazyLoadImages,
    copyToClipboard,
    showToast,
    storage,
    themeManager
  };
  
})(typeof window !== 'undefined' ? window : this);

// 添加 CSS 动画
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
}
