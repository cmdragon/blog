/**
 * 代码块增强功能
 * 提供代码语言显示、复制功能等交互
 * @module CodeHighlight
 */

(function() {
  'use strict';

  /**
   * 检查元素是否为 Mermaid 图表
   * @param {HTMLElement} element - 待检查元素
   * @returns {boolean} 是否为 Mermaid 图表
   */
  function isMermaid(element) {
    if (!element) return false;
    
    const classList = element.classList;
    if (classList.contains('language-mermaid') || classList.contains('language-merm')) {
      return true;
    }
    
    const parent = element.parentElement;
    if (parent && (parent.classList.contains('language-mermaid') || parent.classList.contains('language-merm'))) {
      return true;
    }
    
    const text = element.textContent?.trim() || '';
    return text.startsWith('graph ') || 
           text.startsWith('sequenceDiagram') || 
           text.startsWith('gantt') || 
           text.startsWith('classDiagram') || 
           text.startsWith('stateDiagram');
  }

  /**
   * 从元素中提取编程语言
   * @param {HTMLElement} codeElement - 代码元素
   * @returns {string} 语言名称
   */
  function detectLanguage(codeElement) {
    if (!codeElement) return 'code';
    
    const className = codeElement.className;
    
    // 尝试从类中提取语言
    const langMatch = className.match(/language-(\w+)/) || className.match(/lang-(\w+)/);
    if (langMatch && langMatch[1]) {
      return langMatch[1];
    }
    
    // 尝试从父元素提取
    const parent = codeElement.parentElement;
    if (parent) {
      const parentLangMatch = parent.className.match(/language-(\w+)/) || parent.className.match(/lang-(\w+)/);
      if (parentLangMatch && parentLangMatch[1]) {
        return parentLangMatch[1];
      }
    }
    
    // 基于内容推断语言
    const content = codeElement.textContent || '';
    if (content.includes('def ') && content.includes(':')) {
      return 'python';
    }
    if (content.includes('function') && content.includes('{') && content.includes('}')) {
      return 'javascript';
    }
    if ((content.includes('class') || content.includes('interface')) && content.includes('{') && content.includes('}')) {
      return 'java';
    }
    if (content.includes('git ') || content.includes('cd ') || content.includes('mkdir ') || 
        content.includes('sudo ') || content.includes('apt ') || content.match(/\$\s*\w+/) ||
        content.includes('for ') && content.includes('do') && content.includes('done') ||
        content.includes('if ') && content.includes('then') && (content.includes('fi') || content.includes('else'))) {
      return 'bash';
    }
    
    return 'code';
  }

  /**
   * 安全地高亮代码元素
   * @param {HTMLElement} element - 代码元素
   */
  function highlightElement(element) {
    if (!element || !window.hljs) return;
    
    try {
      window.hljs.highlightElement(element);
    } catch (error) {
      console.warn('[CodeHighlight] 高亮失败:', error);
    }
  }

  /**
   * 为代码块添加语言标签和复制按钮
   * @param {HTMLElement} preBlock - pre 元素
   */
  function setupCodeBlock(preBlock) {
    if (!preBlock) return;
    
    // 跳过 Mermaid 图表
    if (isMermaid(preBlock) || isMermaid(preBlock.querySelector('code'))) {
      return;
    }
    
    // 确保有 code 元素
    let codeElement = preBlock.querySelector('code');
    if (!codeElement) {
      codeElement = document.createElement('code');
      // 使用 textContent 而不是 innerHTML 避免 XSS 风险
      codeElement.textContent = preBlock.textContent;
      preBlock.textContent = '';
      preBlock.appendChild(codeElement);
    }
    
    // 提取已有语言（从 class 中）
    let existingLang = null;
    const classList = Array.from(codeElement.classList);
    for (const cls of classList) {
      if (cls.startsWith('language-') && cls !== 'language-') {
        existingLang = cls.replace('language-', '');
        break;
      }
    }
    
    // 设置语言
    if (!preBlock.hasAttribute('data-lang')) {
      const lang = existingLang || detectLanguage(codeElement);
      preBlock.setAttribute('data-lang', lang);
    }
    
    // 移除旧的复制按钮和容器
    const oldContainer = preBlock.querySelector('.code-actions-container');
    if (oldContainer) {
      oldContainer.remove();
    }
    
    // 创建操作容器
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'code-actions-container';
    
    // 添加语言标签
    const langLabel = document.createElement('span');
    langLabel.className = 'code-lang-label';
    langLabel.textContent = preBlock.getAttribute('data-lang') || 'code';
    actionsContainer.appendChild(langLabel);
    
    // 创建复制按钮
    const copyButton = document.createElement('button');
    copyButton.className = 'code-copy-btn';
    copyButton.textContent = '复制';
    copyButton.type = 'button';
    
    copyButton.addEventListener('click', handleCopy.bind(null, preBlock, copyButton));
    actionsContainer.appendChild(copyButton);
    
    // 添加到代码块
    preBlock.appendChild(actionsContainer);
  }

  /**
   * 处理复制操作
   * @param {HTMLElement} preBlock - pre 元素
   * @param {HTMLButtonElement} copyButton - 复制按钮
   */
  function handleCopy(preBlock, copyButton) {
    const codeElement = preBlock.querySelector('code');
    if (!codeElement) return;
    
    const code = codeElement.textContent;
    
    const setButtonText = (text) => {
      copyButton.textContent = text;
      setTimeout(() => {
        copyButton.textContent = '复制';
      }, 2000);
    };
    
    // 使用 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code)
        .then(() => setButtonText('已复制!'))
        .catch(() => setButtonText('复制失败'));
    } else {
      // 回退到传统方法
      try {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        const success = document.execCommand('copy');
        setButtonText(success ? '已复制!' : '复制失败');
        
        document.body.removeChild(textarea);
      } catch (error) {
        setButtonText('复制失败');
        console.warn('[CodeHighlight] 复制失败:', error);
      }
    }
  }

  /**
   * 禁用行号功能
   */
  function disableLineNumbers() {
    document.querySelectorAll('.article-content pre').forEach(pre => {
      // 跳过 Mermaid
      if (isMermaid(pre) || isMermaid(pre.querySelector('code'))) {
        return;
      }
      
      pre.classList.remove('line-numbers');
      
      // 移除行号容器
      const lineNumbersContainer = pre.querySelector('.line-numbers-rows');
      if (lineNumbersContainer) {
        lineNumbersContainer.remove();
      }
      
      // 移除表格形式的行号
      const table = pre.querySelector('table.hljs-ln');
      if (table) {
        const code = pre.querySelector('code');
        if (code) {
          const codeContent = Array.from(table.querySelectorAll('td.hljs-ln-code'))
            .map(td => td.textContent)
            .join('\n');
          
          code.textContent = codeContent;
          highlightElement(code);
        }
      }
    });
  }

  /**
   * 初始化代码标签系统
   */
  function setupCodeTabs() {
    document.querySelectorAll('.code-tabs').forEach(tabGroup => {
      const tabs = tabGroup.querySelectorAll('.code-tab-item');
      const panes = tabGroup.querySelectorAll('.code-tab-pane');
      
      if (tabs.length === 0 || panes.length === 0) return;
      
      // 激活第一个标签
      tabs[0].classList.add('active');
      panes[0].classList.add('active');
      
      // 高亮第一个代码块
      const firstCode = panes[0].querySelector('pre code');
      if (firstCode) {
        highlightElement(firstCode);
      }
      
      // 绑定标签点击事件
      tabs.forEach((tab, index) => {
        tab.addEventListener('click', (e) => {
          e.preventDefault();
          
          // 移除所有活动状态
          tabs.forEach(t => t.classList.remove('active'));
          panes.forEach(p => p.classList.remove('active'));
          
          // 激活当前标签
          tab.classList.add('active');
          
          if (panes[index]) {
            panes[index].classList.add('active');
            const code = panes[index].querySelector('pre code');
            if (code) {
              highlightElement(code);
            }
          }
        });
      });
    });
  }

  /**
   * 初始化所有代码块
   */
  function initCodeBlocks() {
    // 移除行号元素
    document.querySelectorAll('.line-numbers-rows, .hljs-ln-numbers, .gutter, .code-line-numbers')
      .forEach(el => el.remove());
    
    // 为所有 pre 块添加语言标签和复制按钮（这也会处理高亮）
    document.querySelectorAll('pre').forEach(setupCodeBlock);
    
    // 禁用行号
    disableLineNumbers();
    
    // 初始化标签系统
    setupCodeTabs();
  }

  /**
   * 页面加载完成后的初始化
   */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initCodeBlocks);
    } else {
      initCodeBlocks();
    }
  }

  // 启动初始化
  init();
})();
