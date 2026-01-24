---
url: /posts/6ed51fb844f1329c26155ff2a6ea4cd2/
title: 理解 Vue 的 setup 应用程序钩子
date: 2024-09-30T00:18:53+08:00
updated: 2024-09-30T00:18:53+08:00
author: cmdragon

summary:
   摘要：本文详细介绍了Vue 3中setup函数的应用，包括其概念、特性、使用方法及重要性。setup函数作为组合API的核心，在组件实例化前被调用，用于设置响应式状态、计算属性、方法和生命周期钩子，支持在SSR和CSR中使用。

categories:
   - 前端开发

tags:
   - Vue
   - setup
   - 组件
   - 响应式
   - 计算属性
   - 生命周期
   - 方法
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_09_30 12_17_49.png" title="2024_09_30 12_17_49.png" alt="2024_09_30 12_17_49.png"/>


<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`



在 Vue 3 中，`setup` 函数是组合 API 的核心部分，它为开发者提供了一种新的方式来组织和使用组件的逻辑。在 `setup` 函数内，可以定义组件的响应式状态、计算属性、方法以及生命周期钩子等

## 目录

1. [什么是 setup 函数？](#什么是-setup-函数)
2. [setup 函数的特性](#setup-函数的特性)
3. [如何使用 setup 函数](#如何使用-setup-函数)
   - [1. 创建响应式状态](#1-创建响应式状态)
   - [2. 定义计算属性](#2-定义计算属性)
   - [3. 定义方法](#3-定义方法)
   - [4. 使用生命周期钩子](#4-使用生命周期钩子)
4. [总结](#总结)

---

## 什么是 setup 函数？

`setup` 是一个特殊的生命周期函数，在组件实例化之前调用，用于设置组件的响应式状态、计算属性、方法和其他功能。当组件被创建时，Vue 会先调用 `setup` 函数，并将其返回的对象作为组件的响应式属性。

### 作用范围

- **服务器端和客户端**：`setup` 可以在服务器端渲染（SSR）和客户端渲染（CSR）中使用。

## setup 函数的特性

1. **提前执行**：`setup` 在组件实例创建之前调用。
2. **返回值**：可以返回一个对象，这些值将作为组件的属性和方法可以在模板中使用。
3. **访问 props 和 context**：`setup` 函数接收两个参数：`props` 和 `context`（包含 `attrs`, `slots`, 和 `emit`）。
4. **支持响应式 API**：可以直接使用 Vue 的响应式 API，比如 `ref` 和 `reactive`。

## 如何使用 setup 函数

### 1. 创建响应式状态

使用 `ref` 和 `reactive` 进行状态管理：

```vue
<template>
  <div>
    <h1>{{ count }}</h1>
    <button @click="increment">Increment</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const count = ref(0);

const increment = () => {
  count.value++;
};
</script>
```

### 2. 定义计算属性

计算属性可以通过 `computed` 来定义：

```vue
<template>
  <div>
    <h1>{{ doubledCount }}</h1>
    <button @click="increment">Increment</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const count = ref(0);

const increment = () => {
  count.value++;
};

const doubledCount = computed(() => count.value * 2);
</script>
```

### 3. 定义方法

可以在 `setup` 中定义方法，并将其返回：

```vue
<template>
  <div>
    <h1>{{ message }}</h1>
    <button @click="changeMessage">Change Message</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const message = ref('Hello, Vue 3!');

const changeMessage = () => {
  message.value = 'Message Changed!';
};
</script>
```

### 4. 使用生命周期钩子

可以在 `setup` 中使用生命周期钩子，比如 `onMounted` 和 `onUnmounted`：

```vue
<template>
  <div>
    <h1>{{ count }}</h1>
    <button @click="increment">Increment</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const count = ref(0);

const increment = () => {
  count.value++;
};

// 使用 onMounted 生命周期钩子
onMounted(() => {
  console.log('Component is mounted!');
});

// 使用 onUnmounted 生命周期钩子
onUnmounted(() => {
  console.log('Component is unmounted!');
});
</script>
```

## 总结

`setup` 函数是 Vue 3 中一个非常强大的功能，允许开发者以更灵活和模块化的方式组织组件逻辑。通过合理使用 `setup` 函数及其提供的 API，你可以提高组件之间的可重用性和可维护性。

### 关键要点

1. **响应式状态管理**：使用 `ref` 和 `reactive` 轻松管理状态。
2. **计算属性和方法**：通过 `computed` 定义计算属性以及在 `setup` 中定义方法。
3. **生命周期钩子**：可以在 `setup` 中使用各种生命周期钩子来处理组件的生命周期。
4. **优化性能**：`setup` 函数的使用能够在组件之间更好地组织逻辑，提高性能和可维护性。


余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

- [深入理解 Nuxt.js 中的 app：data：refresh 钩子 | cmdragon's Blog](https://blog.cmdragon.cn/posts/64d5872b7beb55312b9d4537c9366d2b/)
- [深入理解 Nuxt.js 中的 app：error：cleared 钩子 | cmdragon's Blog](https://blog.cmdragon.cn/posts/b77d43b884a1b04d68230c5963b5e15a/)
- [深入理解 Nuxt.js 中的 app：error 钩子 | cmdragon's Blog](https://blog.cmdragon.cn/posts/cb374534e888fe4a800e013eda896737/)
- [深入理解 Nuxt 中的 app created 钩子 | cmdragon's Blog](https://blog.cmdragon.cn/posts/1e03ef2ae917ee8f6e9c9e63cdb6174d/)
- [Nuxt Kit 实用工具的使用示例 | cmdragon's Blog](https://blog.cmdragon.cn/posts/da99cebfd9827341b9b542b233ed4a09/)
- [使用 Nuxt Kit 的构建器 API 来扩展配置 | cmdragon's Blog](https://blog.cmdragon.cn/posts/bdeb7bbd58b884c871d4a545bab57769/)
- [Nuxt Kit 使用日志记录工具 | cmdragon's Blog](https://blog.cmdragon.cn/posts/fab35b7214614128957a0da96b8705ed/)
- [Nuxt Kit API ：路径解析工具 | cmdragon's Blog](https://blog.cmdragon.cn/posts/68b1b6f9d726f331612d5dcf9dc96914/)
- [Nuxt Kit中的 Nitro 处理程序 | cmdragon's Blog](https://blog.cmdragon.cn/posts/d192f328c97955dd3e3ed3f1cb0c54fa/)
- [Nuxt Kit 中的模板处理 | cmdragon's Blog](https://blog.cmdragon.cn/posts/65413519c80ce2a292bf056178a0d195/)
- [Nuxt Kit 中的插件：创建与使用 | cmdragon's Blog](https://blog.cmdragon.cn/posts/cb753641cae33519dd339d523c5afa32/)
- [Nuxt Kit 中的布局管理 | cmdragon's Blog](https://blog.cmdragon.cn/posts/b4ffad87d300777dc9674a9251b6dc1e/)
- [Nuxt Kit 中的页面和路由管理 | cmdragon's Blog](https://blog.cmdragon.cn/posts/ca15f62138ac0f090f2b9c215756b50a/)
- [Nuxt Kit 中的上下文处理 | cmdragon's Blog](https://blog.cmdragon.cn/posts/a1f6b30121d27466cf8fd474dd962eda/)
- [Nuxt Kit 组件管理：注册与自动导入 | cmdragon's Blog](https://blog.cmdragon.cn/posts/c5f0133bf1d896616b703a00c560fb9b/)
- [Nuxt Kit 自动导入功能：高效管理你的模块和组合式函数 | cmdragon's Blog](https://blog.cmdragon.cn/posts/5640663d513476298fbd449f82a67e09/)
- [使用 Nuxt Kit 检查模块与 Nuxt 版本兼容性 | cmdragon's Blog](https://blog.cmdragon.cn/posts/b80a57c1b7ed8f18b9d72567e3bc9d71/)
- [Nuxt Kit 的使用指南：从加载到构建 | cmdragon's Blog](https://blog.cmdragon.cn/posts/a19304accfa8f913a68caae99dfa8a68/)
- [Nuxt Kit 的使用指南：模块创建与管理 | cmdragon's Blog](https://blog.cmdragon.cn/posts/4ab50831d8bbee635f407ecba9971360/)
- [使用 nuxi upgrade 升级现有nuxt项目版本 | cmdragon's Blog](https://blog.cmdragon.cn/posts/0e0c114dbed4df069069c50bc4b57510/)
- [如何在 Nuxt 3 中有效使用 TypeScript | cmdragon's Blog](https://blog.cmdragon.cn/posts/3121b9f162f334cf3f36524ef4a0a21c/)
- [使用 nuxi preview 命令预览 Nuxt 应用 | cmdragon's Blog](https://blog.cmdragon.cn/posts/5b05eb48f0dc0e960be86be0f59de2fa/)
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
