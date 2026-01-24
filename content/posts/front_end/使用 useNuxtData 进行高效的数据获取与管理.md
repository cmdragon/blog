---
url: /posts/5097e3f618f180282a847588006a51d8/
title: 使用 useNuxtData 进行高效的数据获取与管理
date: 2024-07-22T00:18:53+08:00
updated: 2024-07-22T00:18:53+08:00
author: cmdragon

summary:
  深入讲解了Nuxt 3中useNuxtData组合函数的应用，演示了如何通过此函数访问缓存数据，实现组件间数据共享，以及如何在数据更新时利用缓存提高用户体验。文章提供了具体的用法示例，包括数据获取、访问缓存数据和数据更新的场景。

categories:
  - 前端开发

tags:
  - nuxt
  - 缓存
  - 数据
  - 共享
  - 组件
  - 更新
  - 性能
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_07_22 14_42_50.png" title="2024_07_22 14_42_50.png" alt="2024_07_22 14_42_50.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

### `useNuxtData` 概述

`useNuxtData`是 Nuxt 3 中的一个组合函数，用于访问通过其他数据获取函数（如`useAsyncData`、`useLazyAsyncData`、`useFetch`
和`useLazyFetch`等）缓存的数据。它允许在不同的组件之间共享数据，避免重复请求，提高性能。

### 主要功能

1. **访问缓存数据**：通过提供一个唯一的键名来访问之前缓存的数据。
2. **数据共享**：不同的组件可以共享同一数据源，确保数据一致性。
3. **更新**：在数据更新时可以使用缓存数据作为占位符，提高用户体验。

### 用法示例

#### 1. 获取数据并缓存

在`pages/posts.vue`中，我们可以使用`useFetch`来获取帖子数据，并将其缓存到`posts`键名下：

```
// pages/posts.vue
<script setup>

// 使用 useFetch 获取数据并缓存
const { data, error } = await useFetch('/api/posts', { key: 'posts' })

// 处理错误
if (error.value) {
  console.error('获取帖子失败:', error.value)
}
</script>

<template>
  <div>
    <h1>帖子列表</h1>
    <ul>
      <li v-for="post in data" :key="post.id">{{ post.title }}</li>
    </ul>
  </div>
</template>

```

#### 2. 访问缓存数据

在`pages/posts/[id].vue`中，我们可以使用`useNuxtData`来访问`posts.vue`中缓存的帖子数据：

```
// pages/posts/[id].vue
<script setup>
import { useRoute } from 'vue-router'

// 获取路由参数
const { id } = useRoute().params

// 访问缓存的帖子数据
const { data: posts } = useNuxtData('posts')

// 使用 useLazyFetch 获取单个帖子的详细信息
const { data, error } = useLazyFetch(`/api/posts/${id}`, {
  key: `post-${id}`,
  default() {
    // 从缓存中找到对应的帖子，并将其设置为默认值
    return posts.value.find(post => post.id === id) || null
  }
})

// 处理错误
if (error.value) {
  console.error('获取帖子详情失败:', error.value)
}
</script>

<template>
  <div>
    <h1>帖子详情</h1>
    <div v-if="data">
      <h2>{{ data.title }}</h2>
      <p>{{ data.content }}</p>
    </div>
  </div>
</template>

```

#### 3. 更新

在`pages/todos.vue`中，我们可以使用`useAsyncData`来获取待办事项，并在添加新待办事项时利用缓存进行乐观更新：

```
// pages/todos.vue
<script setup>

// 获取待办事项数据并缓存
const { data: todos, error } = await useAsyncData('todos', () => $fetch('/api/todos'))

// 处理错误
if (error.value) {
  console.error('获取待办事项失败:', error.value)
}
</script>

<template>
  <div>
    <h1>待办事项</h1>
    <ul>
      <li v-for="todo in todos" :key="todo.id">{{ todo.task }}</li>
    </ul>
    <NewTodo />
  </div>
</template>

```

在`components/NewTodo.vue`中，我们可以实现添加新待办事项的逻辑：

```
// components/NewTodo.vue
<script setup>
import { ref } from 'vue'

const newTodo = ref('')
const previousTodos = ref([])

// 访问 todos.vue 中 useAsyncData 的缓存值
const { data: todos } = useNuxtData('todos')

const addTodo = async () => {
  const { data, error } = await useFetch('/api/addTodo', {
    method: 'post',
    body: {
      todo: newTodo.value
    },
    onRequest() {
      // 在请求开始时保存当前的 todos 数据
      previousTodos.value = [...todos.value]
      // 乐观更新 UI
      todos.value.push({ id: Date.now(), task: newTodo.value }) // 假设 ID 为当前时间戳
    },
    onRequestError() {
      // 请求失败时回滚数据
      todos.value = previousTodos.value
    },
    async onResponse() {
      // 请求成功后刷新 todos 数据
      await refreshNuxtData('todos')
    }
  })

  // 清空输入框
  newTodo.value = ''
}
</script>

<template>
  <div>
    <input v-model="newTodo" placeholder="添加新待办事项" />
    <button @click="addTodo">添加</button>
  </div>
</template>

```

### 类型定义

`useNuxtData`的类型定义如下：

```
useNuxtData<DataT = any> (key: string): { data: Ref<DataT | null> }
```

- `key`: 用于访问缓存数据的键名。
- `data`: 返回一个响应式引用，包含缓存的数据或`null`。

### 注意事项

- 确保在使用`useNuxtData`时，提供的键名与之前缓存数据时使用的键名一致。
- 在进行乐观更新时，要小心处理数据的回滚，以避免用户看到不一致的状态。

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

- [Nuxt 3 使用指南：掌握 useNuxtApp 和运行时上下文 | cmdragon's Blog](https://blog.cmdragon.cn/posts/074b9dedf36fca34d1469e455c71d583/)
- [使用 useLazyFetch 进行异步数据获取 | cmdragon's Blog](https://blog.cmdragon.cn/posts/382133fd6ac27845d845a7fa96e5ba43/)
- [使用 useLazyAsyncData 提升数据加载体验 | cmdragon's Blog](https://blog.cmdragon.cn/posts/954e473bea4ec122949c8c7d84d32c95/)
- [Nuxt.js 中使用 useHydration 实现数据水合与同步 | cmdragon's Blog](https://blog.cmdragon.cn/posts/c7ddeca4690387e7e08c83e6c482a576/)
- [useHeadSafe：安全生成HTML头部元素 | cmdragon's Blog](https://blog.cmdragon.cn/posts/a1ca5111c82292bda5de4994f537d6f8/)
- [Nuxt.js头部魔法：轻松自定义页面元信息，提升用户体验 | cmdragon's Blog](https://blog.cmdragon.cn/posts/d5370e880eaec9085a153caba4961676/)
- [探索Nuxt.js的useFetch：高效数据获取与处理指南 | cmdragon's Blog](https://blog.cmdragon.cn/posts/29ff9113e98725ee69fa0148a47ae735/)
- [Nuxt.js 错误侦探：useError 组合函数 | cmdragon's Blog](https://blog.cmdragon.cn/posts/b73679558bc672550fbbb72ae295fdf5/)
- [useCookie函数：管理SSR环境下的Cookie | cmdragon's Blog](https://blog.cmdragon.cn/posts/cd361e1a7930614f1aaf46ad35b28958/)
- [轻松掌握useAsyncData获取异步数据 | cmdragon's Blog](https://blog.cmdragon.cn/posts/e1b1c62b5975f8ebfa61adc507591cf7/)
- [使用 `useAppConfig` ：轻松管理应用配置 | cmdragon's Blog](https://blog.cmdragon.cn/posts/9e044d4b53eab6a1bec49bb86b4c856c/)
- [Nuxt框架中内置组件详解及使用指南（五） | cmdragon's Blog](https://blog.cmdragon.cn/posts/ff42c6a570627402dbbdd82adbb2ed2a/)
- [Nuxt框架中内置组件详解及使用指南（四） | cmdragon's Blog](https://blog.cmdragon.cn/posts/9032c61e840462c63717de392173b4f5/)
- [Nuxt框架中内置组件详解及使用指南（三） | cmdragon's Blog](https://blog.cmdragon.cn/posts/7ef2264218c32c7cf7f16dfa7cabd2ce/)
- [Nuxt框架中内置组件详解及使用指南（二） | cmdragon's Blog](https://blog.cmdragon.cn/posts/658c8df0cd7e59fe7606507b14b2c37c/)
- [Nuxt框架中内置组件详解及使用指南（一） | cmdragon's Blog](https://blog.cmdragon.cn/posts/214c7ef07a7b90e1787f10ea626320e3/)
- 




## 免费好用的热门在线工具

- [CMDragon 在线工具 - 高级AI工具箱与开发者套件 | 免费好用的在线工具](https://tools.cmdragon.cn/zh)
- [应用商店 - 发现1000+提升效率与开发的AI工具和实用程序 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps?category=trending)
- [CMDragon 更新日志 - 最新更新、功能与改进 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/changelog)
- [支持我们 - 成为赞助者 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/sponsor)
- [AI文本生成图像 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/text-to-image-ai)
- [临时邮箱 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/temp-email)
- [二维码解析器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/qrcode-parser)
- [文本转思维导图 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/text-to-mindmap)
- [正则表达式可视化工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/regex-visualizer)
- [文件隐写工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/steganography-tool)
- [IPTV 频道探索器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/iptv-explorer)
- [快传 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/snapdrop)
- [随机抽奖工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/lucky-draw)
- [动漫场景查找器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/anime-scene-finder)
- [时间工具箱 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/time-toolkit)
- [网速测试 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/speed-test)
- [AI 智能抠图工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/background-remover)
- [背景替换工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/background-replacer)
- [艺术二维码生成器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/artistic-qrcode)
- [Open Graph 元标签生成器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/open-graph-generator)
- [图像对比工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/image-comparison)
- [图片压缩专业版 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/image-compressor)
- [密码生成器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/password-generator)
- [SVG优化器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/svg-optimizer)
- [调色板生成器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/color-palette)
- [在线节拍器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/online-metronome)
- [IP归属地查询 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/ip-geolocation)
- [CSS网格布局生成器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/css-grid-layout)
- [邮箱验证工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/email-validator)
- [书法练习字帖 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/calligraphy-practice)
- [金融计算器套件 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/finance-calculator-suite)
- [中国亲戚关系计算器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/chinese-kinship-calculator)
- [Protocol Buffer 工具箱 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/protobuf-toolkit)
- [图片无损放大 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/image-upscaler)
- [文本比较工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/text-compare)
- [IP批量查询工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/ip-batch-lookup)
- [域名查询工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/domain-finder)
- [DNS工具箱 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/dns-toolkit)
- [网站图标生成器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/favicon-generator)
- [XML Sitemap](https://tools.cmdragon.cn/sitemap_index.xml)
