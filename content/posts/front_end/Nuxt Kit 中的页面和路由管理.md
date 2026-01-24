---
url: /posts/ca15f62138ac0f090f2b9c215756b50a/
title: Nuxt Kit 中的页面和路由管理
date: 2024-09-17T00:18:53+08:00
updated: 2024-09-17T00:18:53+08:00
author: cmdragon

summary:
  摘要：本文介绍了Nuxt Kit中页面和路由管理的高级功能，包括extendPages自定义页面路由、extendRouteRules定义复杂路由逻辑及addRouteMiddleware注册路由中间件。通过这些功能，开发者能够灵活地添加、修改路由，设置缓存、重定向等，并实现访问控制等中间件处理，以提升Web应用的开发效率和可维护性。

categories:
  - 前端开发

tags:
  - Nuxt
  - 路由
  - 管理
  - 中间件
  - 缓存
  - 重定向
  - 动态
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_09_17 11_19_20.png" title="2024_09_17 11_19_20.png" alt="2024_09_17 11_19_20.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`



在构建现代 Web 应用时，路由管理是一个核心功能。Nuxt.js 提供了一系列强大且灵活的工具来帮助您创建和管理页面及其路由。

## 1. `extendPages`：自定义页面路由

### 1.1 功能说明

`extendPages` 允许您根据需要添加、删除或修改自动生成的路由。默认情况下，Nuxt 会自动根据 `pages` 目录中的文件结构生成路由，但有时您可能需要更复杂的路由逻辑。

### 1.2 类型签名

```typescript
function extendPages(callback: (pages: NuxtPage[]) => void): void
```

#### 参数

- **callback**: 一个函数，该函数接受一个 `NuxtPage` 数组作为参数，您可以对该数组进行修改。

### 1.3 `NuxtPage` 接口

```typescript
type NuxtPage = {
  name?: string; // 可选的姓名
  path: string; // 路由路径
  file?: string; // 关联的文件路径
  meta?: Record<string, any>; // 路由元数据
  alias?: string[] | string; // 别名
  redirect?: RouteLocationRaw; // 重定向配置
  children?: NuxtPage[]; // 子路由
}
```

### 1.4 示例

下面是如何使用 `extendPages` 添加新路由的完整示例：

```typescript
// my-module.ts
import { createResolver, defineNuxtModule, extendPages } from '@nuxt/kit';

export default defineNuxtModule({
  setup(options) {
    const resolver = createResolver(import.meta.url);

    extendPages((pages) => {
      pages.unshift({
        name: 'custom-preview',
        path: '/custom-preview',
        file: resolver.resolve('runtime/customPreview.vue'), // 指向组件文件
      });
    });
  }
});
```

### 1.5 实际应用场景

- **动态路由**: 如果有不在 `pages` 目录中的动态路由（如用户配置的路由），您可以使用此功能来添加这些路由。
- **修改默认路由**: 有时，您可能希望更改或删除默认路由，以满足特定需求。

## 2. `extendRouteRules`：定义复杂路由逻辑

### 2.1 功能说明

`extendRouteRules` 允许您在 Nitro 服务器引擎中定义复杂的路由逻辑，包括缓存、重定向、代理等。

### 2.2 类型签名

```typescript
function extendRouteRules(route: string, rule: NitroRouteConfig, options: ExtendRouteRulesOptions): void
```

#### 参数

- **route**: 要匹配的路由模式。
- **rule**: 应用到匹配路由的规则配置。
- **options**: 传递给配置的可选参数，是否覆盖已有配置。

### 2.3 `NitroRouteConfig` 接口

```typescript
interface NitroRouteConfig {
  cache?: CacheOptions | false; // 缓存设置
  headers?: Record<string, string>; // HTTP 头
  redirect?: string | { to: string; statusCode?: HTTPStatusCode }; // 重定向
  prerender?: boolean; // 预渲染设置
  proxy?: string | ({ to: string } & ProxyOptions); // 代理设置
  isr?: number | boolean; // 增量静态再生设置
  cors?: boolean; // CORS 支持
  swr?: boolean | number; // 重新验证请求
  static?: boolean | number; // 静态请求设置
}
```

### 2.4 示例

以下是设置重定向和缓存的完整示例：

```typescript
// redirects.ts
import { createResolver, defineNuxtModule, extendRouteRules, extendPages } from '@nuxt/kit';

export default defineNuxtModule({
  setup(options) {
    const resolver = createResolver(import.meta.url);

    extendPages((pages) => {
      pages.unshift({
        name: 'new-preview',
        path: '/new-preview',
        file: resolver.resolve('runtime/newPreview.vue'),
      });
    });

    extendRouteRules('/preview', {
      redirect: {
        to: '/new-preview',
        statusCode: 302, // 301 为永久重定向，302 为临时重定向
      },
    });

    extendRouteRules('/new-preview', {
      cache: {
        maxAge: 60 * 60 * 24, // 设置缓存时间为一天
      },
    });
  }
});
```

### 2.5 实际应用场景

- **SEO 优化**: 重定向旧路由至新路由，可改善用户体验和 SEO 性能。
- **缓存控制**: 根据内容的变化设置不同的缓存策略，提高应用性能。

## 3. `addRouteMiddleware`：注册路由中间件

### 3.1 功能说明

`addRouteMiddleware` 允许您注册一个或多个中间件以处理路由请求，如身份验证、权限检查等。

### 3.2 类型签名

```typescript
function addRouteMiddleware(input: NuxtMiddleware | NuxtMiddleware[], options: AddRouteMiddlewareOptions): void
```

#### 参数

- **input**: 中间件对象或中间件对象数组，必须包含名称和路径。
- **options**: 可选参数，控制是否覆盖已有中间件。

### 3.3 `NuxtMiddleware` 类型

```typescript
type NuxtMiddleware = {
  name: string; // 中间件名称
  path: string; // 中间件路径
  global?: boolean; // 是否为全局中间件
}
```

### 3.4 示例代码

以下是一个身份验证中间件示例：

```typescript
// runtime/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  if (to.path !== '/login' && !isAuthenticated()) {
    return navigateTo('/login'); // 如果用户未认证，则导航到登录页
  }
});
```

### 3.5 实际应用场景

- **访问控制**: 检查用户是否已登录，控制访问某些敏感页面。
- **日志跟踪**: 记录请求日志，便于后续分析和调试。

## 4. 代码结构示例

以下是一个简单的 Nuxt 模块的代码结构示例，结合前面的概念：

```typescript
// my-module.ts
import { createResolver, defineNuxtModule, extendPages, extendRouteRules, addRouteMiddleware } from '@nuxt/kit';

export default defineNuxtModule({
  setup(options) {
    const resolver = createResolver(import.meta.url);

    // 拓展页面路由
    extendPages((pages) => {
      pages.unshift({
        name: 'example',
        path: '/example',
        file: resolver.resolve('runtime/example.vue'),
      });
    });

    // 拓展路由规则
    extendRouteRules('/home', {
      redirect: {
        to: '/example',
        statusCode: 301,
      },
    });

    // 添加中间件
    addRouteMiddleware(
      { name: 'auth', path: '/auth', global: true },
      { override: true }
    );
  }
});
```

通过这个示例，您可以看到如何将多个功能结合在一个模块中，实现复杂的路由逻辑和功能。

## 总结

Nuxt Kit 提供的页面和路由管理功能极为强大，可以满足各种开发需求。通过 `extendPages`、`extendRouteRules` 和 `addRouteMiddleware`，开发者可以自由地修改和扩展应用的路由逻辑。在构建大型应用时，这些工具可以极大地提高开发效率和应用的可维护性。

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

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
- [使用 nuxi analyze 命令分析 Nuxt 应用的生产包 | cmdragon's Blog](https://blog.cmdragon.cn/posts/2e9061a0c24ee58d41b70de7b45040d5/)
- [使用 nuxi add 快速创建 Nuxt 应用组件 | cmdragon's Blog](https://blog.cmdragon.cn/posts/917849288e8e1cc200cdd37a60e48387/)
- [使用 updateAppConfig 更新 Nuxt 应用配置 | cmdragon's Blog](https://blog.cmdragon.cn/posts/870198cdff2bbd91a5af2182da7662a8/)
- [使用 Nuxt 的 showError 显示全屏错误页面 | cmdragon's Blog](https://blog.cmdragon.cn/posts/54debfbfcb8e75989b8e0efe82573a86/)
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
