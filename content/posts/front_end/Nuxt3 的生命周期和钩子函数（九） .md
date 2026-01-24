---
url: /posts/b80c188353cc5f1e84aad57aea45c848/
title: Nuxt3 的生命周期和钩子函数（九）
date: 2024-07-03T00:18:53+08:00
updated: 2024-07-03T00:18:53+08:00
author: cmdragon

summary:
  摘要：本文介绍了Nuxt3中与Vite相关的五个生命周期钩子，包括vite:extend、vite:extendConfig、vite:configResolved、vite:serverCreated和vite:compiled，展示了如何在每个钩子中扩展Vite配置、读取配置、添加中间件和处理编译事件。每个钩子都有详细的描述和示例代码，帮助开发者在Nuxt应用中实现自定义构建逻辑和服务器配置。

categories:
  - 前端开发

tags:
  - nuxt
  - Vite
  - 生命周期
  - 钩子函数
  - 前端开发
  - Webpack
  - 编译优化
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_07_03 18_40_37.png" title="2024_07_03 18_40_37.png" alt="2024_07_03 18_40_37.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

## 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`


## vite:extend

### 参数

-   `viteBuildContext`: Vite 的构建上下文对象，允许开发者访问和修改 Vite 的构建过程。

### 详细描述

`vite:extend` 钩子用于在 Vite 的构建过程中扩展默认的构建上下文。通过这个钩子，开发者可以访问到 Vite 的内部构建过程，并对其进行自定义扩展，比如添加自定义插件、修改配置或注册额外的中间件等。

### Demo

以下是一个示例，展示如何在 Nuxt 插件中使用 `vite:extend` 钩子来扩展 Vite 的构建上下文：

```javascript
// plugins/viteExtend.js

export default defineNuxtPlugin((nuxtApp) => {
  // 使用 vite:extend 钩子
  nuxtApp.hook('vite:extend', (viteConfig, { isServer, isClient }) => {
    // 在这里可以扩展或修改 Vite 的配置
    if (isClient) {
      // 修改客户端的 Vite 配置
      viteConfig.plugins.push(...additionalClientPlugins);
    } else if (isServer) {
      // 修改服务端的 Vite 配置
      viteConfig.plugins.push(...additionalServerPlugins);
    }

    // 例如，添加一个自定义的插件
    viteConfig.plugins.push({
      name: 'custom-plugin',
      apply: 'build', // 插件应用阶段
      enforce: 'post', // 插件执行顺序
      transform(code, id) {
        // 对代码进行转换
        return code.replace(/console\.log\(/g, 'console.error(');
      }
    });

    // 注意：这里只是示例代码，实际使用时需要根据实际情况来修改
  });
});

```

在这个示例中，我们注册了一个 `vite:extend` 钩子，它会在 Vite 的配置阶段被调用。我们通过访问 `viteConfig` 对象来修改 Vite 的配置，比如添加自定义插件。我们根据是否是客户端或服务端构建来决定应用哪些插件。此外，我们还演示了如何添加一个简单的自定义插件，该插件会在构建时对代码进行转换。

通过这种方式，开发者可以深入到 Vite 的构建过程中，进行更加细致的自定义操作。






## vite:extendConfig

### 参数

-   `viteInlineConfig`: Vite 的内联配置对象，用于直接修改 Vite 的配置。
-   `env`: 环境变量对象，包含了当前环境下的所有环境变量。

### 详细描述

`vite:extendConfig` 钩子允许开发者在 Nuxt 应用中扩展或修改 Vite 的默认配置。这个钩子在 Vite 配置阶段被调用，可以用来添加或修改插件、配置项等。通过这个钩子，开发者可以利用 Vite 的灵活性来满足特定项目的需求。

### Demo

以下是一个示例，展示如何在 Nuxt 插件中使用 `vite:extendConfig` 钩子来扩展 Vite 的配置：

```javascript
// plugins/viteExtendConfig.js

export default defineNuxtPlugin((nuxtApp) => {
  // 使用 vite:extendConfig 钩子
  nuxtApp.hook('vite:extendConfig', (config, { mode }) => {
    // 在这里可以扩展或修改 Vite 的配置
    // 例如，根据不同的环境变量添加不同的配置
    if (mode === 'production') {
      // 修改生产环境的 Vite 配置
      config.plugins.push(...additionalProductionPlugins);
    } else {
      // 修改开发环境的 Vite 配置
      config.plugins.push(...additionalDevelopmentPlugins);
    }

    // 修改 Vite 的基本配置
    config.base = '/custom_base_path/';

    // 添加一个自定义的别名
    config.resolve.alias['@custom'] = '/path/to/custom';

    // 注意：这里只是示例代码，实际使用时需要根据实际情况来修改
  });
});

```

在这个示例中，我们注册了一个 `vite:extendConfig` 钩子，它会在 Vite 的配置阶段被调用。我们通过访问 `config` 对象来修改 Vite 的配置，比如添加插件、修改基础路径、添加别名等。我们还根据当前的模式（开发或生产）来决定应用哪些插件。

通过这种方式，开发者可以灵活地调整 Vite 的配置，以适应不同的构建环境和需求。









## vite:configResolved

### 参数

-   `viteInlineConfig`: Vite 的内联配置对象，它包含了所有用户定义的 Vite 配置。
-   `env`: 环境变量对象，包含了当前环境下的所有环境变量。

### 详细描述

`vite:configResolved` 钩子允许开发者在 Nuxt 应用中读取已经解析完成的 Vite 配置。这个钩子在 Vite 配置已经被解析并且所有插件已经被应用之后被调用。开发者可以利用这个钩子来获取最终的配置信息，以便进行一些基于配置的后处理操作，例如根据配置信息进行条件编译或者打印配置信息等。

### Demo

以下是一个示例，展示如何在 Nuxt 插件中使用 `vite:configResolved` 钩子来读取已解析的 Vite 配置：

```javascript
// plugins/viteConfigResolved.js

export default defineNuxtPlugin((nuxtApp) => {
  // 使用 vite:configResolved 钩子
  nuxtApp.hook('vite:configResolved', (config) => {
    // 在这里可以读取到最终的 Vite 配置
    console.log('Resolved Vite config:', config);

    // 例如，你可以根据配置做一些逻辑处理
    if (config.plugins.some(plugin => plugin.name === 'some-plugin-name')) {
      // 执行一些操作，比如启用某个功能
    }

    // 注意：这里只是示例代码，实际使用时需要根据实际情况来处理
  });
});

```

在这个示例中，我们注册了一个 `vite:configResolved` 钩子，它会在 Vite 的配置解析完成后被调用。我们通过访问 `config` 参数来获取最终的 Vite 配置对象，并可以对其进行检查或操作。在这个例子中，我们仅仅是将配置打印到控制台，但在实际应用中，开发者可能需要根据配置信息执行更复杂的逻辑。

通过使用 `vite:configResolved` 钩子，开发者可以确保在执行任何基于配置的操作之前，所有的 Vite 配置都已经完全加载和解析完毕。








## vite:serverCreated

### 参数

-   `viteServer`: 已经创建的 Vite 服务器实例，包含了所有 Vite 服务器的属性和方法。
-   `env`: 环境变量对象，包含了当前环境下的所有环境变量。

### 详细描述

`vite:serverCreated` 钩子允许开发者在 Nuxt 应用中在 Vite 服务器创建时进行一些自定义操作。这个钩子在 Vite 服务器实例被创建后立即调用，开发者可以利用这个钩子来访问和修改 Vite 服务器的配置，或者添加自定义的中间件和处理逻辑。

### Demo

以下是一个示例，展示如何在 Nuxt 插件中使用 `vite:serverCreated` 钩子来在 Vite 服务器创建时执行自定义操作：

```javascript
// plugins/viteServerCreated.js

export default defineNuxtPlugin((nuxtApp) => {
  // 使用 vite:serverCreated 钩子
  nuxtApp.hook('vite:serverCreated', (server, env) => {
    // 在这里可以访问到 Vite 服务器实例
    console.log('Vite server created:', server);

    // 例如，你可以添加一个自定义的中间件
    server.middlewares.use((req, res, next) => {
      console.log('Custom middleware executed:', req.url);
      next();
    });

    // 或者根据环境变量做一些逻辑处理
    if (env.NODE_ENV === 'development') {
      // 开发环境下的特殊处理
    }

    // 注意：这里只是示例代码，实际使用时需要根据实际情况来处理
  });
});

```

在这个示例中，我们注册了一个 `vite:serverCreated` 钩子，它会在 Vite 服务器创建后被调用。我们通过访问 `server` 参数来获取 Vite 服务器实例，并可以对其进行操作，例如添加自定义的中间件。在这个例子中，我们添加了一个简单的中间件来打印请求的 URL，但在实际应用中，开发者可能需要根据具体需求执行更复杂的逻辑。

通过使用 `vite:serverCreated` 钩子，开发者可以确保在 Vite 服务器启动之前，所有的自定义配置和中间件都已经准备就绪。



## vite:compiled

### 参数

-   无特定参数传递，但可以通过 `nuxtApp` 访问 Nuxt 应用实例。

### 详细描述

`vite:compiled` 钩子在 Vite 服务器完成编译过程后调用。这个钩子允许开发者在编译完成后执行一些自定义操作，例如记录编译时间、处理编译结果或执行其他与编译相关的任务。

### Demo

以下是一个示例，展示如何在 Nuxt 插件中使用 `vite:compiled` 钩子来在 Vite 编译完成后执行自定义操作：

```javascript
// plugins/viteCompiled.js

export default defineNuxtPlugin((nuxtApp) => {
  // 使用 vite:compiled 钩子
  nuxtApp.hook('vite:compiled', () => {
    // 在这里可以执行编译完成后的自定义操作
    console.log('Vite compilation completed');

    // 例如，你可以记录编译时间
    const endTime = Date.now();
    const startTime = nuxtApp.payload.compilationStartTime || endTime;
    const duration = endTime - startTime;
    console.log(`Compilation took ${duration} ms`);

    // 或者执行其他与编译相关的任务
    // 注意：这里只是示例代码，实际使用时需要根据实际情况来处理
  });
});

```

在这个示例中，我们注册了一个 `vite:compiled` 钩子，它会在 Vite 编译完成后被调用。我们通过访问 `nuxtApp` 实例来获取编译开始时间，并计算编译持续时间。这个钩子可以用于记录编译性能指标，或者在编译完成后执行其他必要的操作。

通过使用 `vite:compiled` 钩子，开发者可以确保在 Vite 编译完成后，所有的自定义操作都已经执行完毕，从而确保应用在编译阶段的行为符合预期。



## webpack:config

### 参数

-   `webpackConfigs`：一个数组，包含了 webpack 编译器的配置对象。

### 详细描述

`webpack:config` 钩子在配置 webpack 编译器之前被调用。这个钩子允许开发者在 webpack 配置生成之前对其进行修改或扩展。

### Demo

以下是一个示例，展示如何在 Nuxt 插件中使用 `webpack:config` 钩子来修改 webpack 配置：

```javascript
// plugins/webpackConfig.js

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('webpack:config', (webpackConfigs) => {
    // 在这里可以修改 webpack 配置
    webpackConfigs.forEach((config) => {
      // 例如，添加一个新的 loader
      config.module.rules.push({
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      });
    });
  });
});

```

在这个示例中，我们注册了一个 `webpack:config` 钩子，它会在 webpack 配置生成之前被调用。我们遍历 `webpackConfigs` 数组，对每个配置对象进行修改。在这个例子中，我们添加了一个处理 CSS 文件的 loader。

通过使用 `webpack:config` 钩子，开发者可以根据自己的需求灵活地修改 webpack 配置，以满足项目的特定要求。


## 往期文章归档：

- [Nuxt3 的生命周期和钩子函数（八） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-29/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E5%85%AB%EF%BC%89%20/)
- [Nuxt3 的生命周期和钩子函数（七） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-29/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E4%B8%83%EF%BC%89/)
- [Nuxt3 的生命周期和钩子函数（六） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-29/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E5%85%AD%EF%BC%89/)
- [Nuxt3 的生命周期和钩子函数（五） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-28/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E4%BA%94%EF%BC%89/)
- [Nuxt3 的生命周期和钩子函数（四） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-27/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E5%9B%9B%EF%BC%89/)
- [Nuxt3 的生命周期和钩子函数（三） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-26/front_end/%20nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E4%B8%89%EF%BC%89/#%E5%BE%80%E6%9C%9F%E6%96%87%E7%AB%A0%E5%BD%92%E6%A1%A3%EF%BC%9A)
- [Nuxt3 的生命周期和钩子函数（二） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-25/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E4%BA%8C%EF%BC%89/)
- [Nuxt3 的生命周期和钩子函数（一） | cmdragon’s Blog](https://blog.cmdragon.cn/2024-06-24/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E4%B8%80%EF%BC%89/)
- [初学者必读：如何使用 Nuxt 中间件简化网站开发 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-23/front_end/%E5%88%9D%E5%AD%A6%E8%80%85%E5%BF%85%E8%AF%BB%EF%BC%9A%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8%20nuxt%20%20%E4%B8%AD%E9%97%B4%E4%BB%B6%E7%AE%80%E5%8C%96%E7%BD%91%E7%AB%99%E5%BC%80%E5%8F%91/)
- [深入探索 Nuxt3 Composables：掌握目录架构与内置API的高效应用 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-22/front_end/%E6%B7%B1%E5%85%A5%E6%8E%A2%E7%B4%A2%20nuxt3%20composables%EF%BC%9A%E6%8E%8C%E6%8F%A1%E7%9B%AE%E5%BD%95%E6%9E%B6%E6%9E%84%E4%B8%8E%E5%86%85%E7%BD%AEapi%E7%9A%84%E9%AB%98%E6%95%88%E5%BA%94%E7%94%A8/)
- [掌握 Nuxt 3 中的状态管理：实践指南 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-21/front_end/%E6%8E%8C%E6%8F%A1%20nuxt%203%20%E4%B8%AD%E7%9A%84%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86%EF%BC%9A%E5%AE%9E%E8%B7%B5%E6%8C%87%E5%8D%97/)
- [Nuxt 3 路由系统详解：配置与实践指南 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-20/front_end/nuxt%203%20%E8%B7%AF%E7%94%B1%E7%B3%BB%E7%BB%9F%E8%AF%A6%E8%A7%A3%EF%BC%9A%E9%85%8D%E7%BD%AE%E4%B8%8E%E5%AE%9E%E8%B7%B5%E6%8C%87%E5%8D%97/)
- [Nuxt 3组件开发与管理 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-19/front_end/nuxt%203%E7%BB%84%E4%BB%B6%E5%BC%80%E5%8F%91%E4%B8%8E%E7%AE%A1%E7%90%86/)
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
