---
url: /posts/57817ab039f0919c6af2a70557e03cee/
title: Nuxt Kit中的 Nitro 处理程序
date: 2024-09-21T00:18:53+08:00
updated: 2024-09-21T00:18:53+08:00
author: cmdragon

summary:
  摘要：本文详细介绍了在Nuxt 3框架中使用Nitro服务器引擎的实践，包括创建处理程序处理HTTP请求、路由和中间件的基本概念。通过示例展示了如何创建服务器和开发处理程序，运用addServerHandler和addDevServerHandler方法，以及如何使用useNitro获取Nitro实例和添加自定义插件以扩展功能。

categories:
  - 前端开发

tags:
  - Nuxt 3
  - Nitro
  - 服务器
  - 处理程序
  - 插件
  - 预渲染
  - 模块化
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_09_21 12_51_47.png" title="2024_09_21 12_51_47.png" alt="2024_09_21 12_51_47.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`



**Nitro** 是 Nuxt 3 的服务器引擎，支持多种运行环境。它允许你创建高性能的服务器端应用程序，处理各种 HTTP 请求，动态生成内容等。

## 2. 基本概念

- **处理程序**：函数，用于处理特定的 HTTP 请求或路由。
- **路由**：URL 路径，用于匹配处理程序。
- **中间件**：在处理请求前处理某些操作的函数，通常用于身份验证或请求修改。

## 3. 创建 Nuxt 3 项目

首先，在你的开发环境中创建一个新的 Nuxt 3 项目：

```bash
npx nuxi init my-nuxt-app
cd my-nuxt-app
npm install
```

## 4. 添加服务器处理程序

### 4.1 使用 `addServerHandler`

#### 4.1.1 创建处理程序

1. 在项目根目录下创建 `module.ts` 文件。
2. 创建 `runtime/robots.get.ts` 文件来定义处理程序。

```typescript
// module.ts
import { createResolver, defineNuxtModule, addServerHandler } from '@nuxt/kit';

export default defineNuxtModule({
  setup(options) {
    const resolver = createResolver(import.meta.url); // 解析路径

    addServerHandler({
      route: '/robots.txt', // 定义路由
      handler: resolver.resolve('./runtime/robots.get.ts'), // 指向处理程序
    });
  }
});
```

#### 4.1.2 定义处理程序

```typescript
// runtime/robots.get.ts
export default defineEventHandler((event) => {
  return `User-agent: *
Disallow: /`;
});
```

#### 4.1.3 完整项目结构

```
my-nuxt-app/
├── module.ts
├── runtime/
│   └── robots.get.ts
└── nuxt.config.ts
```

### 4.2 运行项目

使用以下命令启动开发服务器：

```bash
npx nuxi dev
```

访问 `http://localhost:3000/robots.txt`，应该能看到处理程序返回的内容。

## 5. 添加开发处理程序

### 5.1 使用 `addDevServerHandler`

#### 5.1.1 创建开发处理程序

在同一 `module.ts` 中添加开发专用的处理程序。

```typescript
// module.ts
import { createResolver, defineNuxtModule, addDevServerHandler } from '@nuxt/kit';

export default defineNuxtModule({
  setup() {
    const resolver = createResolver(import.meta.url);

    addDevServerHandler({
      handler: resolver.resolve('./runtime/timer.get.ts'), // 开发处理程序路径
      route: '/_timer', // 路由
    });
  }
});

// runtime/timer.get.ts
export default defineEventHandler((event) => {
  return { uptime: process.uptime() }; // 返回应用的运行时
});
```

### 5.2 测试开发处理程序

访问 `http://localhost:3000/_timer` 查看返回的运行时信息。

## 6. 使用 `useNitro`

### 6.1 获取 Nitro 实例

通过 `useNitro` 方法在 Nuxt 中使用 Nitro 实例。

```typescript
// module.ts
import { defineNuxtModule, useNitro } from '@nuxt/kit';

export default defineNuxtModule({
  setup() {
    nuxt.hook('ready', () => {
      const nitro = useNitro(); // 获取 Nitro 实例
      console.log('Nitro Options:', nitro.options); // 打印 Nitro 配置信息
    });
  }
});
```

## 7. 添加 Nitro 插件

### 7.1 使用 `addServerPlugin`

通过 `addServerPlugin` 添加一个插件来扩展 Nitro 的功能。

#### 7.1.1 创建插件

在 `runtime/plugin.ts` 文件中定义插件。

```typescript
// runtime/plugin.ts
export default (nitro) => {
  nitro.hooks.hook('render:route', (route) => {
    console.log(`Rendering route: ${route}`); // 当路由被渲染时打印
  });
};
```

#### 7.1.2 注册插件

在 `module.ts` 中注册插件：

```typescript
// module.ts
import { createResolver, defineNuxtModule, addServerPlugin } from '@nuxt/kit';

export default defineNuxtModule({
  setup() {
    const resolver = createResolver(import.meta.url);
    addServerPlugin(resolver.resolve('./runtime/plugin.ts')); // 注册插件
  }
});
```

## 8. 预渲染路由

### 8.1 使用 `addPrerenderRoutes`

可以为静态站点指定需要预渲染的路由。

```typescript
import { defineNuxtModule, addPrerenderRoutes } from '@nuxt/kit';

export default defineNuxtModule({
  setup(options) {
    const routesToPrerender = ['/about', '/contact']; // 需要预渲染的路由

    addPrerenderRoutes(routesToPrerender); // 添加预渲染路由
  }
});
```

## 9. 最佳实践

- **代码组织**: 把模块、插件和处理程序分开，确保项目结构清晰。
- **使用钩子**: 利用 `nuxt.hook` 使代码在适当位置执行，尤其是处理服务器设置时。
- **异常处理**: 在处理程序中添加错误日志记录，以便在开发过程中调试。


余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

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
- [探索 Nuxt Devtools：功能全面指南 | cmdragon's Blog](https://blog.cmdragon.cn/posts/ba266042f1b1b5d48140c44161ea0421/)
- [使用 nuxi dev 启动 Nuxt 应用程序的详细指南 | cmdragon's Blog](https://blog.cmdragon.cn/posts/ffaecaca091c2823b255244bbf0e4e6e/)
- [使用 nuxi clean 命令清理 Nuxt 项目 | cmdragon's Blog](https://blog.cmdragon.cn/posts/4382efd355d49a6c8c6ca9f96c90fe8d/)
- [使用 nuxi build-module 命令构建 Nuxt 模块 | cmdragon's Blog](https://blog.cmdragon.cn/posts/7a131f2e511146460683c0b6d2c4e911/)
- [使用 nuxi build 命令构建你的 Nuxt 应用程序 | cmdragon's Blog](https://blog.cmdragon.cn/posts/bc2bfb4e25c5fe348c22bcd59db71579/)
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
