---
url: /posts/1e03ef2ae917ee8f6e9c9e63cdb6174d/
title: 深入理解 Nuxt 中的 app created 钩子
date: 2024-09-26T00:18:53+08:00
updated: 2024-09-26T00:18:53+08:00
author: cmdragon

summary:
   摘要：本文深入介绍了 Nuxt.js 中的 app:created 钩子，包括其触发时机、用途及使用方法。通过创建 Nuxt 项目、编写插件实现钩子、注册全局组件和配置，展示了在应用初始化阶段执行相关逻辑的实践过程。文中还提供了步骤说明和示例代码，帮助开发者理解如何在项目中有效利用此钩子进行全局设置。

categories:
   - 前端开发

tags:
   - nuxt
   - 生命周期
   - 钩子
   - 全局组件
   - 应用初始化
   - Vue.js
   - 插件系统
---

<img src="/images/2024_09_26 10_11_55.png" title="2024_09_26 10_11_55.png" alt="2024_09_26 10_11_55.png"/>


<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`



Nuxt.js 是一个强大的 Vue.js 框架，提供了各种生命周期钩子来控制应用的行为。其中，`app:created` 钩子是在初始 Vue 应用实例创建时调用的。

## 目录

1. [什么是 app:created 钩子？](#什么是-appcreated-钩子)
2. [app:created 钩子的用途](#appcreated-钩子的用途)
3. [如何使用 app:created 钩子](#如何使用-appcreated-钩子)
   - [1. 创建 Nuxt 项目](#1-创建-nuxt-项目)
   - [2. 创建插件并实现钩子](#2-创建插件并实现钩子)
   - [3. 更新页面以使用全局组件](#3-更新页面以使用全局组件)
   - [4. 运行应用](#4-运行应用)
4. [总结](#总结)

---

## 什么是 app:created 钩子？

`app:created` 钩子是在 Vue 应用实例创建时触发的，意味着你可以在应用真正开始渲染之前执行一些逻辑。它是 Nuxt.js 的插件系统的一部分，允许你在启动应用时执行初始化代码。

### 特性

- **触发时机**：在根 Vue 实例创建时。
- **可访问性**：可以访问到 Vue 应用实例，允许你进行全局配置和操作。

## app:created 钩子的用途

使用 `app:created` 钩子，你可以：

- 注册全局组件，使其可以在应用的任何地方使用。
- 初始化全局状态或配置，如 Vuex 状态管理或 Composition API。
- 设置全局属性，比如自定义的工具函数或配置。

## 如何使用 app:created 钩子

### 1. 创建 Nuxt 项目

首先，创建一个新的 Nuxt 项目。使用以下命令：

```bash
npx nuxi init nuxt-app-created-demo
cd nuxt-app-created-demo
npm install
```

### 2. 创建插件并实现钩子

在 `plugins` 文件夹中创建一个新的插件文件 `app-created.ts`，并添加以下代码：

```javascript
// plugins/app-created.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:created', (vueApp) => {
    console.log('Vue App has been created!');

    // 注册全局组件
    vueApp.component('GlobalButton', {
      template: `<button>A Global Button</button>`
    });

    // 可以初始化全局状态
    vueApp.config.globalProperties.$myGlobalValue = "Hello, this is a global value!";
  });
});
```

**代码解析**：
- 当 Vue 应用被创建时，`app:created` 钩子被调用并在控制台输出相应消息。
- 注册一个名为 `GlobalButton` 的组件，之后可以在应用的任何地方使用。
- 还初始化了一个全局属性 `$myGlobalValue`，可以在组件中访问。

### 3. 更新页面以使用全局组件

在 `pages/index.vue` 中使用刚刚创建的全局组件：

```vue
<template>
  <div>
    <h1>Nuxt.js App Created Hook Example</h1>
    <GlobalButton />
    <p>{{ myGlobalValue }}</p>
  </div>
</template>

<script setup>
const myGlobalValue = useNuxtApp().$myGlobalValue;
</script>
```

### 4. 运行应用

使用以下命令启动应用：

```bash
npm run dev
```

打开浏览器并访问 `http://localhost:3000`，你将看到页面显示了标题和全局按钮，同时在控制台中能够看到 `Vue App has been created!` 的输出。

## 总结

 `app:created` 钩子的用途以及如何在 Nuxt.js 应用中使用它。这个钩子为你提供了一个强大的入口点来初始化全局配置、注册组件以及执行其他启动任务。

### 关键要点

1. **全局组件注册**：通过 `app:created` 钩子可以方便地注册全局组件。
2. **初始化全局状态**：可以在应用创建时设置全局属性和状态。
3. **应用初始化**：为你的应用提供了一个灵活的初始化点。


余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

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
- [使用 nuxi prepare 命令准备 Nuxt 项目 | cmdragon's Blog](https://blog.cmdragon.cn/posts/f00fdc02feaaf3525efceaf3e2dc5814/)
- [使用 nuxi init 创建全新 Nuxt 项目 | cmdragon's Blog](https://blog.cmdragon.cn/posts/e215ae9d731aea9f7b5d6aef7aa1a4db/)
- [使用 nuxi info 查看 Nuxt 项目详细信息 | cmdragon's Blog](https://blog.cmdragon.cn/posts/f7aeb6ad9c1c9cf3980419a88a66b082/)
- [使用 nuxi generate 进行预渲染和部署 | cmdragon's Blog](https://blog.cmdragon.cn/posts/82f081b254205e6c18a5d415f97f2519/)
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
