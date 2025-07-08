---
url: /posts/53eb62f578931146081c71537fd0c013/
title: Nuxt.js 环境变量配置与使用
date: 2024-07-25T00:18:53+08:00
updated: 2024-07-25T00:18:53+08:00
author: cmdragon

summary:
  摘要：“该文探讨了Nuxt.js框架下环境变量配置的详细过程，涉及.env文件配置、运行时访问、安全性考量、在不同场景下的实践（如Vue应用、插件、服务器路由）及多环境配置下的最佳实践。”

categories:
  - 前端开发

tags:
  - nuxt
  - 环境变量
  - 配置管理
  - 运行时配置
  - 安全性
  - TypeScript
  - 多环境部署
---

<img src="/images/2024_07_25 15_23_16.png" title="2024_07_25 15_23_16.png" alt="2024_07_25 15_23_16.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

环境变量是配置应用程序的一种常见方式，特别是在不同的环境（如开发、测试、生产）中管理不同的配置值时。在 Nuxt.js
中，环境变量可以通过`.env`文件来设置，并在应用程序中读取。以下是对您提供信息的总结和解释：

## 环境变量配置

1. **`.env`文件**：

    - Nuxt CLI 支持在开发、构建和生成过程中读取`.env`文件。
    - 当运行构建后的服务器时，不会读取`.env`文件。

2. **环境变量要求**：

    - 变量必须在`nuxt.config`中定义，以避免环境变量直接暴露给应用程序代码。
    - 只有以`NUXT_`开头的大写环境变量，并且使用`_`分隔键和大小写变化的环境变量可以覆盖运行时配置属性。

3. **示例**：

    - `.env`文件内容：

      ```
      NUXT_API_SECRET=api_secret_token
      NUXT_PUBLIC_API_BASE=https://nuxtjs.org
      
      ```

    - `nuxt.config.ts`配置：

      ```
      export default defineNuxtConfig({
        runtimeConfig: {
          apiSecret: '', // 可以由 NUXT_API_SECRET 环境变量覆盖
          public: {
            apiBase: '', // 可以由 NUXT_PUBLIC_API_BASE 环境变量覆盖
          }
        },
      });
      
      ```

### 读取运行时配置

1. **在 Vue 应用中**：

    - 使用`useRuntimeConfig()`方法来访问运行时配置。
    - 在客户端，只有`runtimeConfig.public`中的键可用，并且是可写和响应式的。
    - 在服务器端，整个运行时配置都可用，但它是只读的。

2. **示例**：

    - `pages/index.vue`页面：

      ```
      <script setup>
      const config = useRuntimeConfig()

      console.log('运行时配置:', config)
      if (process.server) {
        console.log('API 密钥:', config.apiSecret)
      }
      </script>

      <template>
        <div>
          <div>请检查开发者控制台！</div>
        </div>
      </template>
      ```

### 安全提示

- 不要通过渲染或传递给`useState`来暴露运行时配置键给客户端。

### 插件中使用运行时配置

- 在自定义插件中，可以在`defineNuxtPlugin`函数内部使用`useRuntimeConfig()`。

- 示例：`plugins/config.ts`

  ```
  export default defineNuxtPlugin((nuxtApp) => {
    const config = useRuntimeConfig()

    console.log('API 基础 URL:', config.public.apiBase)
  });
  
  ```

### 服务器路由中使用运行时配置

- 在服务器路由中，可以使用`useRuntimeConfig`访问运行时配置。

- 示例：`server/api/test.ts`

  ```
  export default defineEventHandler(async (event) => {
    const { apiSecret } = useRuntimeConfig(event)
    const result = await $fetch('https://my.api.com/test', {
      headers: {
        Authorization: `Bearer ${apiSecret}`
      }
    })
    return result
  })
  
  ```

### 对运行时配置进行类型定义

- Nuxt 尝试自动生成 TypeScript 接口，但也可以手动添加类型。

- 示例：`index.d.ts`

  ```
  declare module 'nuxt/schema' {
    interface RuntimeConfig {
      apiSecret: string
    }
    interface PublicRuntimeConfig {
      apiBase: string
    }
  }
  // 当增强类型时，确保始终导入/导出某些内容是很重要的
  export {}
  ```

## 指定不同环境的配置

### **创建自定义环境文件**：

    首先，你需要创建一个自定义的环境文件，例如 `.env.local`。这个文件应该包含你希望在开发环境中使用的环境变量。

    ```
    # .env.local
    MY_VARIABLE=my_value
    
    ```

### **使用`--dotenv`参数启动 Nuxt 开发服务器**：

使用`npx nuxi dev --dotenv .env.local`命令来启动 Nuxt 开发服务器，并指定要加载的环境文件为`.env.local`。

    ```
    npx nuxi dev --dotenv .env.local
    
    ```

    这条命令会执行以下操作：

    -   加载 `.env.local` 文件中的环境变量。
    -   将这些环境变量添加到 `process.env` 对象中。
    -   启动 Nuxt 开发服务器。

### **自动重启机制**：

在开发模式下，Nuxt 会监视`.env.local`文件的变化。如果你修改了`.env.local`文件并保存，Nuxt 会自动检测到这些变化，并重启开发服务器以应用新的环境变量值。

    这意味着你不需要手动重启服务器，Nuxt 会自动完成这一步骤，确保你的环境变量始终是最新的。

### 示例

假设你有一个`.env.local`文件，内容如下：

```
# .env.local
API_URL=http://localhost:3000/api
DEBUG_MODE=true

```

你可以使用以下命令启动 Nuxt 开发服务器：

```
npx nuxi dev --dotenv .env.local

```

在开发过程中，如果你修改了`.env.local`文件，例如将`DEBUG_MODE`改为`false`：

```
# .env.local
API_URL=http://localhost:3000/api
DEBUG_MODE=false

```

保存文件后，Nuxt 会自动检测到变化并重启服务器，使新的环境变量生效。

> i .env.local changed, restarting server...      
> i server restarted.


## 往期文章归档：

- [服务端渲染中的数据获取：结合 useRequestHeaders 与 useFetch | cmdragon's Blog](https://blog.cmdragon.cn/posts/c88fddf7a8ad9112ff80c9a25cda09d2/)
- [使用 useRequestEvent Hook 访问请求事件 | cmdragon's Blog](https://blog.cmdragon.cn/posts/7f6aeaffdd673a716b7f013f59aa69af/)
- [使用 useNuxtData 进行高效的数据获取与管理 | cmdragon's Blog](https://blog.cmdragon.cn/posts/5097e3f618f180282a847588006a51d8/)
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
