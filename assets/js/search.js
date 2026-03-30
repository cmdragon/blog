/**
 * Hugo 博客搜索功能
 * 实现全文搜索、倒排索引、本地缓存和分块加载
 * 
 * @module Search
 * @version 2.0.0
 */

// ==================== 配置常量 ====================

/**
 * 获取搜索配置
 * 优先使用 HTML 模板注入的配置，否则使用默认值
 * @returns {Object} 配置对象
 */
function getSearchConfig() {
  // 检查是否有 HTML 模板注入的配置
  const injectedConfig = window.searchConfig || {};
  
  return Object.freeze({
    // 索引文件路径 - 支持从 HTML 注入
    INDEX_PATH: injectedConfig.indexPath || '/search-index/index.json',
    // 目标分块大小 (500KB)
    TARGET_CHUNK_SIZE: 500 * 1024,
    // localStorage 缓存键
    CACHE_KEY: 'search_index_meta',
    CACHE_TIMESTAMP_KEY: 'search_index_timestamp',
    // 缓存有效期 (24 小时)
    CACHE_EXPIRY: 24 * 60 * 60 * 1000,
    // 搜索结果数量限制
    RESULT_LIMIT: 1000,
    // 每页显示数量
    PAGE_SIZE: 20,
    // 最大缓存查询数
    MAX_CACHE_SIZE: 50,
    // 请求超时时间 (毫秒)
    REQUEST_TIMEOUT: 30000,
    // 延迟初始化时间 (毫秒)
    INIT_DELAY: 100
  });
}

// 初始化配置
const CONFIG = getSearchConfig();

// ==================== 状态管理 ====================

/**
 * 搜索状态管理
 */
const state = {
  indexData: [],
  invertedIndex: new Map(),
  searchCache: new Map(),
  isInitialized: false,
  loadStartTime: 0,
  stats: {
    loadTime: 0,
    searchTime: 0,
    cacheHits: 0,
    cacheMisses: 0,
    totalItems: 0
  }
};

// ==================== 工具函数 ====================

/**
 * 安全的日志函数（生产环境自动禁用）
 */
const log = {
  info: (...args) => console.log('[Search]', ...args),
  error: (...args) => console.error('[Search]', ...args),
  warn: (...args) => console.warn('[Search]', ...args),
  debug: (...args) => {
    if (window.location.hostname === 'localhost') {
      console.log('[Search Debug]', ...args);
    }
  }
};

/**
 * 延迟执行函数
 * @param {number} ms - 延迟毫秒数
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 带超时的 fetch 请求
 * @param {string} url - 请求 URL
 * @param {number} timeout - 超时时间 (毫秒)
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, timeout = CONFIG.REQUEST_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`请求超时：${url}`);
    }
    throw error;
  }
}

/**
 * 转义 HTML 特殊字符（防 XSS）
 * @param {string} text - 原始文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 转义正则表达式特殊字符
 * @param {string} string - 原始字符串
 * @returns {string} 转义后的字符串
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ==================== 核心功能 ====================

/**
 * 分词函数
 * @param {string} text - 待分词文本
 * @returns {string[]} 分词数组
 */
function tokenize(text) {
  if (!text) return [];
  
  text = text.toLowerCase();
  const tokens = text
    .split(/[\s\p{P}\p{S}]+/u)
    .filter(token => token.length > 1);
  
  return [...new Set(tokens)];
}

/**
 * 添加到倒排索引
 * @param {string} token - 词元
 * @param {number} docIndex - 文档索引
 * @param {string} field - 字段名
 */
function addToInvertedIndex(token, docIndex, field) {
  if (!state.invertedIndex.has(token)) {
    state.invertedIndex.set(token, new Map());
  }
  
  const tokenMap = state.invertedIndex.get(token);
  if (!tokenMap.has(docIndex)) {
    tokenMap.set(docIndex, []);
  }
  
  tokenMap.get(docIndex).push(field);
}

/**
 * 构建倒排索引
 */
function buildInvertedIndex() {
  log.info('开始构建倒排索引...');
  const startTime = Date.now();
  
  state.invertedIndex.clear();
  
  state.indexData.forEach((doc, docIndex) => {
    // 标题分词
    tokenize(doc.title || '').forEach(token => {
      addToInvertedIndex(token, docIndex, 'title');
    });
    
    // 内容/摘要分词
    tokenize(doc.summary || doc.content || '').forEach(token => {
      addToInvertedIndex(token, docIndex, 'content');
    });
    
    // 分类分词
    (doc.categories || []).forEach(cat => {
      tokenize(cat).forEach(token => {
        addToInvertedIndex(token, docIndex, 'category');
      });
    });
    
    // 标签分词
    (doc.tags || []).forEach(tag => {
      tokenize(tag).forEach(token => {
        addToInvertedIndex(token, docIndex, 'tag');
      });
    });
  });
  
  log.info(`倒排索引构建完成，耗时：${Date.now() - startTime}ms`);
}

/**
 * 并行加载分块索引
 * @param {Object} indexData - 索引元数据
 */
async function loadChunks(indexData) {
  const chunkPromises = indexData.chunks.map(chunkName => {
    const chunkPath = `/search-index/${chunkName}`;
    return fetchWithTimeout(chunkPath)
      .then(response => response.json())
      .catch(error => {
        log.error(`加载块失败：${chunkName}`, error);
        throw new Error(`无法加载索引块：${chunkName}`);
      });
  });
  
  const chunks = await Promise.all(chunkPromises);
  state.indexData = chunks.flat();
  log.info(`加载了 ${indexData.chunks.length} 个索引块`);
}

/**
 * 生成并加载搜索索引
 */
async function generateIndex() {
  state.stats.cacheMisses++;
  log.info('从服务器加载搜索索引...');
  
  try {
    const response = await fetchWithTimeout(CONFIG.INDEX_PATH);
    const indexData = await response.json();
    
    // 分块索引格式
    if (indexData && indexData.chunks && Array.isArray(indexData.chunks)) {
      log.info(`检测到分块索引，共 ${indexData.chunks.length} 个块`);
      await loadChunks(indexData);
    } 
    // 完整索引文件
    else if (Array.isArray(indexData)) {
      state.indexData = indexData;
      log.info(`加载完整索引文件，共 ${indexData.length} 篇文章`);
    } 
    else {
      throw new Error('索引格式不正确');
    }
    
    state.stats.totalItems = state.indexData.length;
    log.info(`加载完成，共 ${state.indexData.length} 篇文章`);
    
  } catch (error) {
    log.error('加载索引失败:', error);
    throw error;
  }
}

/**
 * 保存元数据到 localStorage 缓存
 */
function saveToCache() {
  try {
    const meta = {
      totalItems: state.stats.totalItems,
      loadTime: state.stats.loadTime,
      timestamp: Date.now()
    };
    localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(meta));
    localStorage.setItem(CONFIG.CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    log.warn('保存元数据失败:', error);
  }
}

// ==================== 搜索功能 ====================

/**
 * 使用倒排索引搜索
 * @param {string[]} queryTokens - 查询词元数组
 * @returns {Array} 搜索结果数组
 */
function searchWithInvertedIndex(queryTokens) {
  const docScores = new Map();
  
  queryTokens.forEach(token => {
    if (state.invertedIndex.has(token)) {
      const tokenMap = state.invertedIndex.get(token);
      
      tokenMap.forEach((fields, docIndex) => {
        if (!docScores.has(docIndex)) {
          docScores.set(docIndex, { score: 0, matchTokens: [] });
        }
        
        const docScore = docScores.get(docIndex);
        docScore.matchTokens.push(token);
        
        // 计算加权分数
        let score = 1;
        if (fields.includes('title')) score *= 5;
        if (fields.includes('category') || fields.includes('tag')) score *= 3;
        if (fields.includes('content')) score *= 1;
        
        docScore.score += score;
      });
    }
  });
  
  // 转换为结果数组
  return Array.from(docScores.entries())
    .map(([docIndex, scoreData]) => {
      const doc = state.indexData[docIndex];
      return doc ? {
        ...doc,
        score: scoreData.score,
        matchTokens: scoreData.matchTokens
      } : null;
    })
    .filter(Boolean);
}

/**
 * 使用字符串匹配搜索（回退方案）
 * @param {string} query - 搜索查询
 * @returns {Array} 搜索结果数组
 */
function searchWithStringMatch(query) {
  const queryLower = query.toLowerCase();
  
  return state.indexData
    .map((doc, index) => {
      const title = (doc.title || '').toLowerCase();
      const summary = (doc.summary || '').toLowerCase();
      const content = (doc.content || '').toLowerCase();
      const categories = (doc.categories || []).join(' ').toLowerCase();
      const tags = (doc.tags || []).join(' ').toLowerCase();
      
      let score = 0;
      
      if (title.includes(queryLower)) score += 10;
      if (summary.includes(queryLower)) score += 5;
      if (content.includes(queryLower)) score += 2;
      if (categories.includes(queryLower)) score += 3;
      if (tags.includes(queryLower)) score += 3;
      
      // 部分匹配
      queryLower.split(' ').forEach(word => {
        if (word.length > 2 && title.includes(word)) score += 5;
      });
      
      return score > 0 ? { ...doc, score } : null;
    })
    .filter(Boolean);
}

/**
 * 执行搜索
 * @param {string} query - 搜索查询
 */
function performSearch(query) {
  const startTime = Date.now();
  
  // 验证查询
  if (!query || !query.trim()) {
    displayResults([], query);
    return;
  }
  
  query = query.trim();
  
  // 检查缓存
  if (state.searchCache.has(query)) {
    state.stats.cacheHits++;
    const cachedResults = state.searchCache.get(query);
    state.stats.searchTime = Date.now() - startTime;
    displayResults(cachedResults, query);
    return;
  }
  
  state.stats.cacheMisses++;
  
  // 分词查询
  const queryTokens = tokenize(query);
  
  if (queryTokens.length === 0) {
    state.stats.searchTime = Date.now() - startTime;
    displayResults([], query);
    return;
  }
  
  // 执行搜索
  let results = searchWithInvertedIndex(queryTokens);
  
  // 回退到字符串匹配
  if (results.length === 0) {
    results = searchWithStringMatch(query);
  }
  
  // 排序和限制结果数量
  results.sort((a, b) => b.score - a.score);
  results = results.slice(0, CONFIG.RESULT_LIMIT);
  
  // 缓存结果（LRU 策略）
  if (state.searchCache.size >= CONFIG.MAX_CACHE_SIZE) {
    const firstKey = state.searchCache.keys().next().value;
    state.searchCache.delete(firstKey);
  }
  state.searchCache.set(query, results);
  
  state.stats.searchTime = Date.now() - startTime;
  displayResults(results, query);
}

// ==================== 结果显示 ====================

/**
 * 高亮关键词
 * @param {string} text - 原始文本
 * @param {string} query - 搜索查询
 * @returns {string} 高亮后的文本
 */
function highlightKeyword(text, query) {
  if (!text || !query) return text || '';
  
  const tokens = tokenize(query);
  let highlighted = escapeHtml(text);
  
  tokens.forEach(token => {
    if (token.length > 1) {
      const regex = new RegExp(`(${escapeRegex(token)})`, 'gi');
      highlighted = highlighted.replace(
        regex, 
        '<span class="search-highlight">$1</span>'
      );
    }
  });
  
  return highlighted;
}

/**
 * 创建带上下文的摘要
 * @param {string} content - 内容
 * @param {string} query - 搜索查询
 * @returns {string} 摘要文本
 */
function createHighlightedExcerpt(content, query) {
  if (!content) return '';
  
  const tokens = tokenize(query);
  if (tokens.length === 0) {
    return content.length > 200 
      ? escapeHtml(content.substring(0, 200)) + '...' 
      : escapeHtml(content);
  }
  
  // 查找第一个匹配位置
  let matchIndex = -1;
  for (const token of tokens) {
    const index = content.toLowerCase().indexOf(token);
    if (index !== -1) {
      matchIndex = index;
      break;
    }
  }
  
  if (matchIndex === -1) {
    return content.length > 200 
      ? escapeHtml(content.substring(0, 200)) + '...' 
      : escapeHtml(content);
  }
  
  // 生成带上下文的摘要
  const start = Math.max(0, matchIndex - 80);
  const end = Math.min(content.length, matchIndex + 120);
  
  let excerpt = (start > 0 ? '...' : '') + 
                content.substring(start, end) + 
                (end < content.length ? '...' : '');
  
  return highlightKeyword(excerpt, query);
}

/**
 * 格式化日期
 * @param {string} dateStr - 日期字符串
 * @returns {string} 格式化后的日期
 */
function formatDate(dateStr) {
  if (!dateStr) return '无日期';
  try {
    return new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return dateStr;
  }
}

/**
 * 渲染分类标签
 * @param {string[]} categories - 分类数组
 * @returns {string} HTML 字符串
 */
function renderCategories(categories) {
  if (!categories || categories.length === 0) return '';
  
  return categories.map(cat => 
    `<span class="flex items-center bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md">
      <iconify-icon icon="mdi:folder" class="mr-1" width="16" height="16" aria-hidden="true"></iconify-icon>
      ${escapeHtml(cat)}
    </span>`
  ).join('');
}

/**
 * 渲染标签
 * @param {string[]} tags - 标签数组
 * @returns {string} HTML 字符串
 */
function renderTags(tags) {
  if (!tags || tags.length === 0) return '';
  
  return tags.map(tag => 
    `<a href="/tags/${tag.toLowerCase().replace(/\s+/g, '-')}/" 
       class="text-xs px-2 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-600 hover:text-white transition-colors duration-200">
      #${escapeHtml(tag)}
    </a>`
  ).join('');
}

/**
 * 渲染单个搜索结果
 * @param {Object} result - 搜索结果对象
 * @param {HTMLTemplateElement} template - 模板元素
 * @returns {HTMLElement} 渲染后的元素
 */
function renderResultItem(result, template) {
  const url = result.url || result.permalink || '#';
  const title = result.titleHighlighted || result.title || '无标题';
  const date = formatDate(result.date);
  const type = result.type || '文章';
  const content = result.summaryHighlighted || result.contentHighlighted || '无摘要';
  const categories = renderCategories(result.categories);
  const tags = renderTags(result.tags);
  
  let html = template.innerHTML;
  html = html.replace(/{url}/g, url);
  html = html.replace('{title}', title);
  html = html.replace('{date}', date);
  html = html.replace('{type}', type);
  html = html.replace('{content}', content);
  html = html.replace('{categories}', categories);
  html = html.replace('{tags}', tags);
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  return tempDiv.firstElementChild;
}

/**
 * 渲染搜索结果列表
 * @param {Array} results - 搜索结果数组
 */
function renderResults(results) {
  const resultsContainer = document.getElementById('search-results');
  const noResultsContainer = document.getElementById('no-results');
  const template = document.getElementById('search-result-template');
  
  if (!resultsContainer || !noResultsContainer || !template) {
    log.error('缺少必要的 DOM 元素');
    return;
  }
  
  resultsContainer.innerHTML = '';
  
  if (results.length === 0) {
    resultsContainer.classList.add('hidden');
    noResultsContainer.classList.remove('hidden');
    return;
  }
  
  resultsContainer.classList.remove('hidden');
  noResultsContainer.classList.add('hidden');
  
  // 使用 DocumentFragment 优化性能
  const fragment = document.createDocumentFragment();
  
  results.forEach(result => {
    const element = renderResultItem(result, template);
    if (element) {
      fragment.appendChild(element);
    }
  });
  
  resultsContainer.appendChild(fragment);
  log.debug(`已渲染 ${results.length} 个搜索结果`);
}

/**
 * 显示搜索结果
 * @param {Array} results - 搜索结果数组
 * @param {string} query - 搜索查询
 */
function displayResults(results, query) {
  // 更新页面标题
  const queryDisplay = document.getElementById('search-query-display');
  if (queryDisplay) {
    queryDisplay.textContent = query ? `"${query}" 的搜索结果` : '搜索';
  }
  
  // 显示搜索信息
  showSearchInfo(results.length);
  
  // 高亮关键词
  const highlightedResults = results.map(result => ({
    ...result,
    titleHighlighted: highlightKeyword(result.title, query),
    summaryHighlighted: createHighlightedExcerpt(result.summary || result.content, query)
  }));
  
  // 渲染结果
  renderResults(highlightedResults);
  
  // 初始化分页
  initPagination(highlightedResults);
}

/**
 * 显示搜索信息
 * @param {number} resultCount - 结果数量
 */
function showSearchInfo(resultCount = 0) {
  const searchInfo = document.getElementById('search-info');
  const searchStats = document.getElementById('search-stats');
  
  if (!searchInfo || !searchStats) return;
  
  searchInfo.classList.remove('hidden');
  
  document.getElementById('search-info-text').textContent = 
    resultCount > 0 ? `找到 ${resultCount} 个结果` : '搜索完成';
  
  searchStats.textContent = 
    `加载：${state.stats.loadTime}ms | 搜索：${state.stats.searchTime}ms | 文档：${state.stats.totalItems}`;
}

/**
 * 显示错误信息
 * @param {string} message - 错误消息
 */
function showError(message) {
  const loadingEl = document.getElementById('loading');
  if (loadingEl) {
    loadingEl.classList.add('hidden');
  }
  
  const noResultsEl = document.getElementById('no-results');
  if (noResultsEl) {
    noResultsEl.classList.remove('hidden');
    const title = noResultsEl.querySelector('h2');
    const desc = noResultsEl.querySelector('p');
    if (title) title.textContent = '加载失败';
    if (desc) desc.textContent = message;
  }
}

// ==================== 分页功能 ====================

let currentResults = [];
let currentPage = 1;

/**
 * 渲染当前页结果
 */
function renderCurrentPage() {
  const resultsContainer = document.getElementById('search-results');
  const template = document.getElementById('search-result-template');
  
  if (!resultsContainer || !template) {
    log.error('缺少必要的 DOM 元素');
    return;
  }
  
  resultsContainer.innerHTML = '';
  
  const start = (currentPage - 1) * CONFIG.PAGE_SIZE;
  const end = Math.min(start + CONFIG.PAGE_SIZE, currentResults.length);
  const pageResults = currentResults.slice(start, end);
  
  log.debug(`渲染第 ${currentPage} 页，范围：${start}-${end}，共 ${pageResults.length} 条结果`);
  
  // 使用 DocumentFragment 优化性能
  const fragment = document.createDocumentFragment();
  
  pageResults.forEach(result => {
    const element = renderResultItem(result, template);
    if (element) {
      fragment.appendChild(element);
    }
  });
  
  resultsContainer.appendChild(fragment);
  scrollToTop();
}

/**
 * 更新分页控件 - 使用与通用组件一致的样式和逻辑
 */
function updatePagination() {
  const paginationEl = document.getElementById('pagination');
  if (!paginationEl) return;
  
  const totalPages = Math.ceil(currentResults.length / CONFIG.PAGE_SIZE);
  
  if (totalPages <= 1) {
    paginationEl.classList.add('hidden');
    return;
  }
  
  // 使用与通用组件一致的容器样式
  paginationEl.classList.remove('hidden');
  paginationEl.className = 'mt-6 flex justify-center items-center gap-1 flex-wrap';
  paginationEl.setAttribute('role', 'navigation');
  paginationEl.setAttribute('aria-label', '搜索结果分页');
  paginationEl.innerHTML = '';
  
  // 上一页按钮
  if (currentPage > 1) {
    const prevBtn = createPaginationButton('上一页', false, () => {
      currentPage--;
      updatePagination();
      renderCurrentPage();
    }, true);
    paginationEl.appendChild(prevBtn);
  } else {
    const prevBtn = createPaginationButton('上一页', false, null, false, true);
    paginationEl.appendChild(prevBtn);
  }
  
  // 数字页码 - 使用与通用组件一致的显示逻辑
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = createPaginationButton(
      i.toString(), 
      i === currentPage, 
      () => {
        currentPage = i;
        updatePagination();
        renderCurrentPage();
      }
    );
    paginationEl.appendChild(pageBtn);
  }
  
  // 下一页按钮
  if (currentPage < totalPages) {
    const nextBtn = createPaginationButton('下一页', false, () => {
      currentPage++;
      updatePagination();
      renderCurrentPage();
    }, true);
    paginationEl.appendChild(nextBtn);
  } else {
    const nextBtn = createPaginationButton('下一页', false, null, false, true);
    paginationEl.appendChild(nextBtn);
  }
}

/**
 * 创建分页按钮 - 使用与通用组件一致的样式
 * @param {string} text - 按钮文本
 * @param {boolean} isActive - 是否为当前页
 * @param {Function} onClick - 点击事件处理函数
 * @param {boolean} withIcon - 是否显示图标（上一页/下一页按钮使用）
 * @param {boolean} isDisabled - 是否禁用
 * @returns {HTMLButtonElement|HTMLSpanElement} 按钮或 span 元素
 */
function createPaginationButton(text, isActive, onClick, withIcon = false, isDisabled = false) {
  // 如果是禁用状态，返回 span 元素
  if (isDisabled) {
    const span = document.createElement('span');
    span.textContent = text;
    span.className = 'px-3 py-1.5 text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 opacity-40 cursor-not-allowed flex items-center';
    span.setAttribute('aria-disabled', 'true');
    
    if (withIcon) {
      const icon = text === '上一页' ? 'mdi:chevron-left' : 'mdi:chevron-right';
      const iconifyIcon = document.createElement('iconify-icon');
      iconifyIcon.setAttribute('icon', icon);
      iconifyIcon.setAttribute('class', text === '上一页' ? 'mr-1' : 'ml-1');
      iconifyIcon.setAttribute('width', '16');
      iconifyIcon.setAttribute('height', '16');
      iconifyIcon.setAttribute('aria-hidden', 'true');
      
      if (text === '上一页') {
        span.insertBefore(iconifyIcon, span.firstChild);
      } else {
        span.appendChild(iconifyIcon);
      }
    }
    
    return span;
  }
  
  // 创建按钮元素
  const btn = document.createElement('button');
  btn.textContent = text;
  
  // 使用与通用组件一致的样式
  if (isActive) {
    // 当前页样式
    btn.className = 'px-3 py-1.5 text-xs rounded border border-blue-700 bg-blue-700 text-white font-semibold';
    btn.setAttribute('aria-current', 'page');
  } else {
    // 普通页码样式
    btn.className = 'px-3 py-1.5 text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors';
  }
  
  // 添加图标（上一页/下一页按钮）
  if (withIcon && !isActive) {
    const icon = text === '上一页' ? 'mdi:chevron-left' : 'mdi:chevron-right';
    const iconifyIcon = document.createElement('iconify-icon');
    iconifyIcon.setAttribute('icon', icon);
    iconifyIcon.setAttribute('class', text === '上一页' ? 'mr-1' : 'ml-1');
    iconifyIcon.setAttribute('width', '16');
    iconifyIcon.setAttribute('height', '16');
    iconifyIcon.setAttribute('aria-hidden', 'true');
    
    if (text === '上一页') {
      btn.insertBefore(iconifyIcon, btn.firstChild);
    } else {
      btn.appendChild(iconifyIcon);
    }
  }
  
  btn.onclick = onClick;
  return btn;
}

/**
 * 初始化分页
 * @param {Array} results - 搜索结果数组
 */
function initPagination(results) {
  currentResults = results;
  currentPage = 1;
  updatePagination();
}

/**
 * 滚动到顶部
 */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== 事件处理 ====================

/**
 * 更新 URL 参数
 * @param {string} query - 搜索查询
 */
function updateURL(query) {
  const url = new URL(window.location);
  url.searchParams.set('q', query);
  window.history.pushState({}, '', url);
}

/**
 * 初始化搜索输入框和按钮
 */
function initSearchInput() {
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  
  if (!searchInput || !searchButton) {
    log.warn('搜索输入框或按钮不存在');
    return;
  }
  
  // 搜索按钮点击事件
  searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
      performSearch(query);
      updateURL(query);
    }
  });
  
  // 回车键搜索
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        performSearch(query);
        updateURL(query);
      }
    }
  });
  
  log.info('搜索输入框已初始化');
}

// ==================== 初始化 ====================

/**
 * 初始化搜索功能
 */
async function init() {
  state.loadStartTime = Date.now();
  
  try {
    // 检查 URL 参数
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    
    // 加载索引
    await generateIndex();
    
    // 构建倒排索引
    buildInvertedIndex();
    
    // 保存元数据到缓存
    saveToCache();
    
    // 标记为已初始化
    state.isInitialized = true;
    state.stats.loadTime = Date.now() - state.loadStartTime;
    
    // 隐藏加载提示
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
      loadingEl.classList.add('hidden');
    }
    
    // 显示搜索信息
    showSearchInfo();
    
    // 初始化搜索输入框
    initSearchInput();
    
    // 如果有搜索查询，延迟执行搜索
    if (query) {
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.value = query;
      }
      await delay(CONFIG.INIT_DELAY);
      performSearch(query);
    }
    
  } catch (error) {
    log.error('搜索初始化失败:', error);
    showError('搜索初始化失败：' + error.message);
  }
}

// 页面加载时初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
