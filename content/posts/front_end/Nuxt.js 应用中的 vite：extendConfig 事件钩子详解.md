---
url: /posts/7f2f4ee1ef433b4a19daa99da7bd9f07/
title: Nuxt.js 应用中的 vite：extendConfig 事件钩子详解
date: 2024-11-12T00:18:53+08:00
updated: 2024-11-12T00:18:53+08:00
author: cmdragon

summary:
   vite:extendConfig 钩子允许开发者在 Vite 项目中扩展默认配置。这使得开发者可以根据特定需求自定义 Vite 的构建和开发行为，增强开发体验。

categories:
   - 前端开发

tags:
   - Nuxt
   - Vite
   - 钩子
   - 配置
   - 自定义
   - 构建
   - 开发
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_11_12 14_10_52.png" title="2024_11_12 14_10_52.png" alt="2024_11_12 14_10_52.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`


## 目录

1. 概述
2. `vite:extendConfig` 钩子的详细说明
   - 1. 钩子的定义与作用
   - 2. 调用时机
   - 3. 参数说明
3. 具体使用示例
   - 1. 示例：基本用法
   - 2. 示例：添加全局 CSS
4. 应用场景
   - 1. 动态修改 Vite 配置
   - 2. 根据环境变量调整配置
   - 3. 扩展插件和构建设置
5. 注意事项
   - 1. 配置验证
   - 2. 效能影响
6. 总结

## 1. 概述

`vite:extendConfig` 钩子允许开发者在 Vite 项目中扩展默认配置。这使得开发者可以根据特定需求自定义 Vite 的构建和开发行为，增强开发体验。

## 2. `vite:extendConfig` 钩子的详细说明

### 2.1 钩子的定义与作用

`vite:extendConfig` 钩子用于扩展 Vite 的默认配置。通过这一钩子，开发者可以添加或修改 Vite 的配置项，以满足应用的需求。

### 2.2 调用时机

`vite:extendConfig` 钩子通常在 Vite 初始化和构建开始之前被调用，这样配置的修改可以在应用构建和启动过程中生效。

### 2.3 参数说明

该钩子接收一个 `viteInlineConfig` 对象和 `env` 对象作为参数，`viteInlineConfig` 包含了当前的 Vite 配置，而 `env` 提供了运行时的环境变量信息。

## 3. 具体使用示例

### 3.1 示例：基本用法

```javascript
// plugins/viteExtendConfig.js
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hooks('vite:extendConfig', (viteInlineConfig, env) => {
    // 修改根目录
    viteInlineConfig.root = 'src';

    // 添加到环境变量中
    console.log('Current environment:', env.MODE);
  });
});
```

在这个示例中，我们修改了 Vite 的根目录配置，同时打印了当前的运行环境。

### 3.2 示例：添加全局 CSS

```javascript
// plugins/viteAddGlobalCss.js
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hooks('vite:extendConfig', (viteInlineConfig) => {
    viteInlineConfig.css = {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "src/styles/global.scss";`,
        },
      },
    };
  });
});
```

在这个示例中，我们为 Vite 配置添加了全局的 SCSS 文件，以便在项目中任何地方使用。

## 4. 应用场景

### 4.1 动态修改 Vite 配置

可以根据不同的环境动态修改 Vite 配置，例如根据 NODE_ENV 来设置 API 地址。

```javascript
// plugins/viteDynamicConfig.js
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hooks('vite:extendConfig', (viteInlineConfig) => {
    if (process.env.NODE_ENV === 'production') {
      viteInlineConfig.server = {
        proxy: {
          '/api': 'https://api.example.com',
        },
      };
    }
  });
});
```

### 4.2 根据环境变量调整配置

根据环境变量，可以灵活调整 Vite 的构建设置。

```javascript
// plugins/viteEnvConfig.js
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hooks('vite:extendConfig', (viteInlineConfig, env) => {
    if (env.MODE === 'development') {
      viteInlineConfig.base = '/dev/';
    } else {
      viteInlineConfig.base = '/prod/';
    }
  });
});
```

### 4.3 扩展插件和构建设置

添加和配置 Vite 插件。

```javascript
// plugins/viteAddPlugin.js
import someVitePlugin from 'some-vite-plugin';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hooks('vite:extendConfig', (viteInlineConfig) => {
    viteInlineConfig.plugins = [
      ...(viteInlineConfig.plugins || []),
      someVitePlugin(),
    ];
  });
});
```

## 5. 注意事项

### 5.1 配置验证

在更改 Vite 配置时，务必确认配置项的有效性，以防止构建失败。

### 5.2 效能影响

不合理的配置更改可能会影响构建和开发服务器的性能，因此需谨慎添加或修改配置项。

## 6. 总结

通过使用 `vite:extendConfig` 钩子，开发者可以灵活扩展 Vite 的默认配置，以满足特定的项目需求。这种自定义能力不仅增强了开发效率，还可以适应不同的环境和构建要求。合理使用这一钩子，将有助于提升开发体验和项目维护性。

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

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
- [Nuxt.js 应用中的 modules：before 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/62721fbcf90812e7cb4f8192dad8c51b/)
- [Nuxt.js 应用中的 restart 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/b9f8b670ae04035bbe73a4e4e0ef26f1/)
- [Nuxt.js 应用中的 close 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/e16f122a2b0ff1157b75ce6cc609f9f1/)
- [Nuxt.js 应用中的 ready 事件钩子详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/bf27341c381e447f9e64e2d4e9b36db4/)
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
