// CDN 自动检测和回退机制
(function() {
  'use strict';
  
  // CDN 配置
  const CDN_CONFIG = {
    primary: 'unpkg',
    fallback: 'cloudflare',
    cdns: {
      unpkg: {
        base: 'https://unpkg.com',
        testUrl: 'https://unpkg.com/katex@0.16.8/dist/katex.js',
        timeout: 5000
      },
      cloudflare: {
        base: 'https://cdnjs.cloudflare.com/ajax/libs',
        testUrl: 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.8/katex.js',
        timeout: 5000
      }
    }
  };
  
  // 存储键名
  const STORAGE_KEY = 'cdn_status';
  const CACHE_DURATION = 30 * 60 * 1000; // 30 分钟缓存
  
  /**
   * 获取缓存的 CDN 状态
   */
  function getCachedStatus() {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (!cached) return null;
      
      const { cdn, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_DURATION) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return cdn;
    } catch (e) {
      return null;
    }
  }
  
  /**
   * 缓存 CDN 状态
   */
  function cacheStatus(cdn) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        cdn: cdn,
        timestamp: Date.now()
      }));
    } catch (e) {
      // localStorage 不可用时忽略
    }
  }
  
  /**
   * 测试 CDN 可用性
   */
  function testCDN(url, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error('Timeout'));
      }, timeout);
      
      fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache'
      })
        .then(response => {
          clearTimeout(timeoutId);
          if (response.ok && response.status === 200) {
            resolve(true);
          } else {
            reject(new Error(`HTTP ${response.status}`));
          }
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }
  
  /**
   * 检测主 CDN 是否可用
   */
  async function detectCDN() {
    // 检查缓存
    const cached = getCachedStatus();
    if (cached) {
      console.log(`[CDN] Using cached: ${cached}`);
      return cached;
    }
    
    // 测试主 CDN
    const primary = CDN_CONFIG.cdns[CDN_CONFIG.primary];
    try {
      await testCDN(primary.testUrl, primary.timeout);
      console.log(`[CDN] ${CDN_CONFIG.primary} is available`);
      cacheStatus(CDN_CONFIG.primary);
      return CDN_CONFIG.primary;
    } catch (e) {
      console.warn(`[CDN] ${CDN_CONFIG.primary} failed:`, e.message);
    }
    
    // 测试备用 CDN
    const fallback = CDN_CONFIG.cdns[CDN_CONFIG.fallback];
    try {
      await testCDN(fallback.testUrl, fallback.timeout);
      console.log(`[CDN] ${CDN_CONFIG.fallback} is available`);
      cacheStatus(CDN_CONFIG.fallback);
      return CDN_CONFIG.fallback;
    } catch (e) {
      console.warn(`[CDN] ${CDN_CONFIG.fallback} failed:`, e.message);
    }
    
    // 都失败，返回主 CDN（至少链接存在）
    console.warn('[CDN] All CDNs failed, using primary');
    return CDN_CONFIG.primary;
  }
  
  /**
   * 获取当前 CDN 的基础 URL
   */
  function getCDNBase(cdnName) {
    return CDN_CONFIG.cdns[cdnName]?.base || CDN_CONFIG.cdns[CDN_CONFIG.primary].base;
  }
  
  /**
   * 替换页面中的 CDN 链接
   */
  function replaceCDNLinks(cdnName) {
    if (cdnName === CDN_CONFIG.primary) return; // 已经是主 CDN，无需替换
    
    const cdnBase = getCDNBase(cdnName);
    const primaryBase = getCDNBase(CDN_CONFIG.primary);
    
    // 替换所有 unpkg.com 的链接
    document.querySelectorAll('link[href*="unpkg.com"], script[src*="unpkg.com"]').forEach(el => {
      const isLink = el.tagName === 'LINK';
      const attr = isLink ? 'href' : 'src';
      const url = el.getAttribute(attr);
      
      if (url && url.includes('unpkg.com')) {
        // 提取路径部分
        const pathMatch = url.match(/unpkg\.com\/(.+)/);
        if (pathMatch) {
          const path = pathMatch[1];
          // 转换为 cloudflare 格式
          let newPath = path;
          
          // 特殊处理 mermaid
          if (path.startsWith('mermaid@')) {
            const version = path.match(/mermaid@([\d.]+)/);
            if (version) {
              newPath = `mermaid/${version[1]}/mermaid.min.js`;
            }
          }
          // 特殊处理 katex
          else if (path.startsWith('katex@')) {
            const version = path.match(/katex@([\d.]+)/);
            if (version) {
              const file = path.split('/').slice(2).join('/');
              newPath = `KaTeX/${version[1]}/${file}`;
            }
          }
          
          const newUrl = `${cdnBase}/${newPath}`;
          el.setAttribute(attr, newUrl);
          console.log(`[CDN] Replaced: ${url} -> ${newUrl}`);
        }
      }
    });
  }
  
  /**
   * 重新加载失败的脚本
   */
  function reloadFailedScripts() {
    document.querySelectorAll('script[src*="unpkg.com"], script[src*="cdnjs.cloudflare.com"]').forEach(script => {
      script.addEventListener('error', function() {
        console.warn(`[CDN] Script failed to load: ${this.src}`);
        // 尝试切换到备用 CDN
        const currentCDN = this.src.includes('unpkg.com') ? 'unpkg' : 'cloudflare';
        const newCDN = currentCDN === 'unpkg' ? 'cloudflare' : 'unpkg';
        
        if (newCDN === 'cloudflare') {
          const pathMatch = this.src.match(/unpkg\.com\/(.+)/);
          if (pathMatch) {
            const path = pathMatch[1];
            let newPath = path;
            
            if (path.startsWith('mermaid@')) {
              const version = path.match(/mermaid@([\d.]+)/);
              if (version) {
                newPath = `mermaid/${version[1]}/mermaid.min.js`;
              }
            }
            else if (path.startsWith('katex@')) {
              const version = path.match(/katex@([\d.]+)/);
              if (version) {
                const file = path.split('/').slice(2).join('/');
                newPath = `KaTeX/${version[1]}/${file}`;
              }
            }
            
            const newSrc = `${CDN_CONFIG.cdns.cloudflare.base}/${newPath}`;
            console.log(`[CDN] Retrying with fallback: ${newSrc}`);
            
            const newScript = document.createElement('script');
            newScript.src = newSrc;
            newScript.defer = script.hasAttribute('defer');
            newScript.async = script.hasAttribute('async');
            document.head.appendChild(newScript);
          }
        }
      }, { once: true });
    });
  }
  
  /**
   * 初始化 CDN 检测和回退
   */
  async function init() {
    try {
      const cdn = await detectCDN();
      replaceCDNLinks(cdn);
      reloadFailedScripts();
    } catch (e) {
      console.error('[CDN] Detection failed:', e);
    }
  }
  
  // 暴露全局方法供外部调用
  window.CDNHelper = {
    detect: detectCDN,
    replace: replaceCDNLinks,
    getBase: getCDNBase,
    config: CDN_CONFIG
  };
  
  // 页面加载时执行
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
