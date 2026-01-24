---
url: /posts/6bbb5474e945ea9d9a79c6cfcb6ec585/
title: Nuxt.js 应用中的 vite：extendConfig 事件钩子
date: 2024-11-16T00:18:53+08:00
updated: 2024-11-16T00:18:53+08:00
author: cmdragon

summary:
   通过合理使用 vite:extendConfig 钩子，开发者可以极大地增强 Nuxt 3 项目的灵活性和功能性，为不同的项目需求量身定制 Vite 配置。无论是添加插件、调整构建选项还是配置开发服务器，这些扩展可以有效提升开发体验和应用性能。


categories:
   - 前端开发

tags:
   - Nuxt
   - Vite
   - 配置
   - 钩子
   - 插件
   - 构建
   - 环境
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_11_16 15_21_43.png" title="2024_11_16 15_21_43.png" alt="2024_11_16 15_21_43.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`



在 Nuxt 3 中，`vite:extendConfig` 钩子允许开发者扩展默认的 Vite 配置。这意味着你可以在 Nuxt 项目中根据需求自定义 Vite 的配置，包括添加插件、修改构建选项、调整开发服务器设置等。

## 文章大纲

1. [定义与作用](#1-定义与作用)
2. [调用时机](#2-调用时机)
3. [参数说明](#3-参数说明)
4. [示例用法](#4-示例用法)
5. [应用场景](#5-应用场景)
    - [5.1 添加 Vite 插件](#51-添加-vite-插件)
    - [5.2 调整构建配置](#52-调整构建配置)
    - [5.3 自定义开发服务器设置](#53-自定义开发服务器设置)
    - [5.4 根据环境动态调整配置](#54-根据环境动态调整配置)
6. [注意事项](#6-注意事项)
7. [总结](#7-总结)

## 1. 定义与作用

- **`vite:extendConfig`** 是一个事件钩子，提供了机会来修改 Vite 的配置对象。
- 通过该钩子，你可以将额外的 Vite 插件、构建选项、开发服务器设置等添加到项目中。

## 2. 调用时机

`vite:extendConfig` 钩子在 Nuxt 3 启动时进行 Vite 配置的构建阶段被调用，此时你可以访问到 `viteInlineConfig` 和环境变量 `env`。

## 3. 参数说明

钩子接收两个参数：

1. **`viteInlineConfig`**: 当前 Vite 的配置对象。你可以直接修改这个对象的属性。
2. **`env`**: 当前的环境变量。可以根据不同环境配置。

## 4. 示例用法

下面是如何使用 `vite:extendConfig` 钩子的基本示例，展示了如何扩展 Vite 的默认配置。

### 在 `plugins/viteExtendConfig.js` 文件中的实现

```javascript
// plugins/viteExtendConfig.js

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hooks('vite:extendConfig', (viteInlineConfig, env) => {
    // 添加自定义的 Vite 插件，例如 React 支持
    viteInlineConfig.plugins.push(require('@vitejs/plugin-react')());

    // 根据环境动态调整构建选项
    viteInlineConfig.build = {
      ...viteInlineConfig.build,
      sourcemap: env.NODE_ENV === 'development', // 仅在开发模式下开启 sourcemap
    };

    // 修改开发服务器设置
    viteInlineConfig.server = {
      ...viteInlineConfig.server,
      port: 3001, // 将开发服务器的端口修改为 3001
    };
  });
});
```

## 5. 应用场景

### 5.1 添加 Vite 插件

在涉及到使用特定功能的情况下，例如使用 React，你可以在 `vite:extendConfig` 中添加 Vite 插件：

```javascript
// plugins/viteExtendConfig.js
viteInlineConfig.plugins.push(require('@vitejs/plugin-react')());
```

### 5.2 调整构建配置

在不同的环境中，可能需要不同的构建选项。例如，调试开发环境可以开启源码映射：

```javascript
// 根据环境动态调整构建选项
viteInlineConfig.build = {
  ...viteInlineConfig.build,
  sourcemap: env.NODE_ENV === 'development', // 开发环境开启 sourcemap
};
```

### 5.3 自定义开发服务器设置

如果你需要指定开发服务器的端口，可以这样做：

```javascript
// 修改开发服务器设置
viteInlineConfig.server = {
  ...viteInlineConfig.server,
  port: 3001, // 设置开发服务器端口
};
```

### 5.4 根据环境动态调整配置

使用 `env` 参数，可以在生产环境和开发环境中使用不同的配置。这使得你的应用更加灵活：

```javascript
if (env.NODE_ENV === 'production') {
  viteInlineConfig.base = '/my-production-base/';
} else {
  viteInlineConfig.base = '/';
}
```

## 6. 注意事项

- **性能影响**: 添加过多插件或配置可能会影响构建性能，需谨慎选择。
- **兼容性**: 确保你所添加的插件与 Vite 及其他 Nuxt 插件兼容，以避免运行时错误。

## 7. 总结

通过合理使用 `vite:extendConfig` 钩子，开发者可以极大地增强 Nuxt 3 项目的灵活性和功能性，为不同的项目需求量身定制 Vite 配置。无论是添加插件、调整构建选项还是配置开发服务器，这些扩展可以有效提升开发体验和应用性能。

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

- [Nuxt.js 应用中的 schema：written 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/bbc449caa5e31f1084aed152323c2758/)
- [Nuxt.js 应用中的 schema：beforeWrite 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/9303f1529d95797ca3241f21e2fbc34d/)
- [Nuxt.js 应用中的 schema：resolved 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/0a60978d2ce7bbcd5b86f9de0e5c99e2/)
- [Nuxt.js 应用中的 vite：extendConfig 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/7f2f4ee1ef433b4a19daa99da7bd9f07/)
- [Nuxt.js 应用中的 vite：extend 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/cdba81aa5bb32dcc233a8bd29adee923/)
- [Nuxt.js 应用中的 schema：extend事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/b1d6a0b2258a699dc8415d298eecab45/)
- [Nuxt.js 应用中的 listen 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/59f320ae722d9803c0c4eb42ccb295b2/)
- [Nuxt.js 应用中的 prepare：types 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/68419c6dd94db64cbb46673ab19a5146/)
- [Nuxt.js 应用中的 build：error 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/4a5e09829cf63001943fc481d69e01e0/)
- [Nuxt.js 应用中的 prerender：routes 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/7a11deaf9e3d140fd18d7ad3cde4b9d7/)
- [Nuxt.js 应用中的 nitro：build：public-assets 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/271508b42bc005f41e4fa31830a84e83/)
- [Nuxt.js 应用中的 nitro：build：before 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/a2820600faa85b49967d91cb7617c284/)
- [Nuxt.js 应用中的 nitro：init 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/a8d7636d5643bafcee2bcc1767dcfa3b/)
- [Nuxt.js 应用中的 nitro：config 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/927aa434dc4886c8c357c9000e072b19/)
- [Nuxt.js 应用中的 components：extend 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/1189b069abd2cfe9869abbbb4f7f340b/)
- [Nuxt.js 应用中的 components：dirs 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/06467028093d81da701fced5b84150cb/)
- [Nuxt.js 应用中的 imports：dirs 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/d59459d9a47584d99ecdca9732024835/)
- [Nuxt.js 应用中的 imports：context 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/e94c7e1071e2541e95713c53eafd79ef/)
- [Nuxt.js 应用中的 imports：extend 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/1d6dcd3025621c288fddb7d17465133c/)
- [Nuxt.js 应用中的 imports：sources 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/cf392e5071f22b4179114cece7e0e8b1/)
- [Nuxt.js 应用中的 server：devHandler 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/e3271aac91ec30fc15176811b001ed48/)
- [Nuxt.js 应用中的 pages：extend 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/22eb7478a08b6f78043cd5fae24c7ad4/)
- [Nuxt.js 应用中的 builder：watch 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/4cfe5f35f1a903646731a6c05a54d1dc/)
- [Nuxt.js 应用中的 builder：generateApp 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/1191139984bd4df519af6d16a616949e/)
- [Nuxt.js 应用中的 build：manifest 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/d69fdaae50601566d6f15c4e837c7cf3/)
- [Nuxt.js 应用中的 build：done 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/7b79085749b7f156ed36cf16fca42310/)
- [Nuxt.js 应用中的 build：before 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/81e5857d6d3ff5e375f0f6734e25daac/)
- [Nuxt.js 应用中的 app：templatesGenerated 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/3c565b88d4290c513e7c55ef934ec509/)
- [Nuxt.js 应用中的 app：templates 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/628fd1621bd298e33c2182dc18d36ea8/)
- [Nuxt.js 应用中的 app：resolve 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/dd9f1dcc573a828d78d2dc657b7d5c56/)
- [Nuxt.js 应用中的 modules：done 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/6427994cfc82edf8e740eb2b3edcead4/)
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
