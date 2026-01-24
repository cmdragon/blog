---
url: /posts/9ac29e7085b44b322682133dd07511c8/
title: Nuxt3 的生命周期和钩子函数（五）
date: 2024-06-29T00:18:53+08:00
updated: 2024-06-29T00:18:53+08:00
author: cmdragon

summary:
  摘要：本文详细介绍了Nuxt3中的六个核心生命周期钩子及其用法，包括build:done、build:manifest、builder:generateApp、builder:watch、pages:extend和server:devHandler:handler。内容涵盖各钩子的调用时机、参数、环境、功能描述及具体示例代码，帮助开发者深入理解如何在Nuxt应用的构建、运行、开发及部署等阶段自定义行为和逻辑。

categories:
  - 前端开发

tags:
  - nuxt
  - 生命周期
  - 钩子函数
  - Web开发
  - 前端框架
  - 自定义构建
  - 服务器渲染
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_06_29 14_22_05.png" title="2024_06_29 14_22_05.png" alt="2024_06_29 14_22_05.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

## 钩子：build:done

**参数：**nuxtApp

**环境：**Nuxt.js

**描述：**`build:done`是 Nuxt.js 的一个生命周期钩子，它在应用的打包构建过程完成后被调用。这个钩子允许开发者在构建过程结束后执行一些后续操作，比如清理临时文件、生成额外的资源或者通知外部服务构建完成。

**详细解释与用法：**

- **参数说明：**`nuxtApp`参数是 Nuxt 应用实例的引用，它提供了对 Nuxt 应用的配置和内部状态的访问。
- **使用场景：**通常用于执行构建后的清理工作，或者对构建结果进行最后的修改。
- **调用时机：**在 Nuxt 的构建过程完全结束后，即所有文件都被编译和优化之后。

**案例Demo：**

```javascript
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('build:done', async (builder) => {
    // 示例：构建完成后，打印构建信息
    console.log('构建完成！构建信息如下：');
    console.log(builder.stats);

    // 示例：清理构建目录中的临时文件
    await cleanUpTemporaryFiles();

    // 示例：发送构建完成的通知
    await notifyBuildCompletion();
  });

  async function cleanUpTemporaryFiles() {
    // 这里是清理临时文件的逻辑
    // 例如使用 Node.js 的 fs 模块来删除文件
    const fs = require('fs');
    const path = require('path');
    const tempFilePath = path.join(__dirname, 'temp-file.txt');
    
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
      console.log('临时文件已清理');
    }
  }

  async function notifyBuildCompletion() {
    // 这里是通知构建完成的逻辑
    // 例如发送 HTTP 请求到某个服务
    const axios = require('axios');
    await axios.post('https://example.com/build-completed', {
      message: '构建完成'
    });
    console.log('构建完成通知已发送');
  }
});

```

在这个案例中，`build:done`钩子被用来打印构建信息、清理临时文件，以及向外部服务发送构建完成的通知。这些操作有助于确保构建过程的完整性和后续的自动化流程。

## 钩子：build:manifest

**参数：**manifest

**环境：**Vite 或 Webpack (用于服务端渲染的框架)

**描述：**`build:manifest`是 Vite 或 Webpack 在构建过程中生成清单（manifest.json）时调用的钩子。清单文件通常包含了应用中所有静态资源的哈希值，以便浏览器缓存管理和服务器预加载。在
Nuxt.js 中，通过这个钩子，开发者可以自定义 Nitro（Vite 的预渲染服务）在 HTML 中渲染的`<link>`标签，以及影响资源的缓存策略。

**详细解释与用法：**

- **参数说明：**`manifest`是一个对象，包含了当前构建的清单内容，包括文件名、哈希值、版本等信息。
- **使用场景：**可以根据需要修改清单，比如添加或删除特定资源，或者更改资源的缓存策略。
- **示例用法：**

```javascript
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('build:manifest', async (manifest) => {
    // 示例：修改清单中的资源哈希值
    manifest['assets/images/my-image.png'].hash = 'new-hash-for-image';

    // 示例：添加自定义的清单项
    manifest['custom-manifest'] = {
      url: '/custom-manifest.json',
      revision: manifest.revision,
      hash: 'custom-manifest-hash'
    };

    // 示例：处理 Nitro 预渲染的 `<link>` 标签
    if (nuxtApp.isServer) {
      const html = nuxtApp.renderToString();
      const modifiedHtml = html.replace(
        '<link rel="preload" href="/manifest.json">',
        '<link rel="preload" href="/custom-manifest.json">'
      );
      nuxtApp.render(modifiedHtml);
    }
  });
});

```

在这个案例中，`build:manifest`钩子被用来：

1. 修改`my-image.png`的哈希值，这可能会影响浏览器缓存。
2. 添加一个自定义的清单项，如`custom-manifest.json`。
3. 如果是在服务器端渲染（SSR）环境中，替换 Nitro 预渲染时使用的清单文件路径。

请注意，Vite 和 Webpack 的具体用法可能略有不同，但基本原理相似，都是在构建阶段对清单进行定制。

## 钩子：builder:generateApp

**参数：**options

**环境：**Nuxt.js 用于生成静态站点或预构建应用

**描述：**`builder:generateApp`是 Nuxt.js 在执行`nuxt generate`或`nuxt build --generate`
命令，即生成应用程序（如静态站点）之前调用的钩子。这个钩子允许开发者在生成过程开始时对生成的文件结构、内容或配置进行定制。

**详细解释与用法：**

- **参数说明：**`options`是一个对象，包含了生成应用时的配置和环境信息，如输出目录、模式（spa、ssr）、路由等。

- **应用场景：**

    - 可以修改输出目录或文件名，如重命名文件、创建子目录结构。
    - 可以根据生成环境（如开发、生产）动态调整内容或配置。
    - 可能会用到`options.context`，它提供了生成过程中的上下文信息，如当前路由、页面数据等。

**示例用法：**

```javascript
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('builder:generateApp', async (options) => {
    // 示例：修改输出目录
    options.outputDir = 'custom-output';

    // 示例：根据环境添加不同的内容
    if (options.mode === 'spa') {
      options.content.push({
        path: 'custom-spa-page.html',
        template: '<h1>Custom SPA Page</h1>'
      });
    } else {
      options.pages['/custom-server-page.vue'] = {
        template: '<h1>Custom Server Page</h1>'
      };
    }

    // 示例：使用 context 获取当前路由信息
    const currentRoute = options.context.route;
    if (currentRoute.name === 'my-custom-route') {
      // 添加或修改特定路由的页面内容
    }
  });
});

```

在这个案例中，`builder:generateApp`钩子被用来：

1. 修改生成的输出目录。
2. 根据应用模式（SPA 或 SSR）动态添加或修改生成的内容。
3. 利用`context`获取当前路由信息，可能用于根据路由条件调整生成的页面。

请确保在实际使用时，遵循 Nuxt.js 的最佳实践和API规范。

## 钩子：builder:watch

**参数：**event, path

**环境：**Nuxt.js 开发环境

**描述：**`builder:watch`是 Nuxt.js
在开发环境中使用的钩子，当文件系统监视器检测到项目中的文件或目录发生变化时，此钩子会被调用。这个钩子允许开发者在文件变化时执行自定义逻辑，例如清除缓存、触发自定义构建步骤等。

**详细解释与用法：**

- **参数说明：**

    - `event`：一个字符串，表示文件变化的类型，通常是`add`,`change`, 或`unlink`（删除）。
    - `path`：一个字符串，表示发生变化文件的路径。

- **应用场景：**

    - 当文件被修改时，清除某些缓存或临时文件。
    - 当文件被添加或删除时，触发某些自定义的构建或编译过程。

**示例用法：**

```javascript
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('builder:watch', (event, path) => {
    // 当文件发生变化时执行的操作
    if (event === 'change') {
      console.log(`文件 ${path} 发生了变化，需要执行某些操作。`);
      // 例如，清除缓存
      // nuxtApp.cache.verify();
    } else if (event === 'add') {
      console.log(`文件 ${path} 被添加了。`);
      // 触发自定义构建步骤
      // customBuildStep(path);
    } else if (event === 'unlink') {
      console.log(`文件 ${path} 被删除了。`);
      // 可能需要清理一些与该文件相关的资源
      // cleanUpResources(path);
    }
  });
});

```

在这个案例中，`builder:watch`钩子被用来：

1. 监听文件变化事件，并根据事件类型打印消息。
2. 根据文件变化类型执行不同的操作，例如清除缓存、触发自定义构建步骤或清理资源。

请注意，在实际使用中，应谨慎使用此钩子，因为过多的自定义操作可能会影响开发服务器的性能。

## 钩子：pages:extend

**参数：**pages

**环境：**Nuxt.js 应用开发环境

**描述：**`pages:extend`是 Nuxt.js 提供的一个页面路由处理钩子，它在页面路由解析完成之后调用。这个钩子允许开发者在路由加载和配置完成后，动态修改或扩展页面路由。

**详细解释与用法：**

- **参数说明：**

    - `pages`：一个对象，包含了当前应用的所有页面路由配置，每个路由项包含路径（path）、组件（component）、元信息（meta）等属性。

- **应用场景：**

    - 动态添加或修改路由，如根据用户权限或环境配置不同的页面。
    - 根据路由路径动态设置页面的特性，如设置SEO元信息、加载时的预加载行为等。

**示例用法：**

```javascript
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('pages:extend', (pages) => {
    // 遍历所有页面
    pages.forEach((page) => {
      if (page.path === '/admin') {
        // 如果路径是 '/admin'，添加管理员权限检查
        page.meta.auth = ['admin'];
      } else if (process.env.NODE_ENV === 'production') {
        // 在生产环境中，对所有非 '/admin' 的页面添加预加载
        page.preload = true;
      }
    });
  });
});

```

在这个案例中，`pages:extend`钩子被用来：

1. 遍历所有页面路由，检查路径是否为 '/admin'，如果是则添加`meta.auth`属性，表示需要管理员权限访问。
2. 在生产环境中，对所有非 '/admin' 的页面设置`preload`为`true`，表示在页面首次加载时预加载资源。

请注意，修改后的路由配置不会影响已经注册的页面，只会对新添加或修改的路由生效。在实际使用时，要确保对路由的修改不会破坏原有的功能。

## 钩子：server:devHandler:handler

**参数：**handler

**环境：**Nuxt.js 服务器端开发环境 (使用 Nitro 或者其他本地开发服务器)

**描述：**`server:devHandler:handler`是 Nuxt.js 的一个服务器端开发中间件处理钩子，它在注册开发服务器的中间件时被调用。这个钩子允许开发者自定义开发服务器的行为，特别是在处理请求和响应时。

**详细解释与用法：**

- **参数说明：**

    - `handler`：一个函数，通常接收一个`req`（请求对象）和`res`（响应对象）作为参数，可以用来处理请求，执行自定义逻辑，然后返回响应。

- **应用场景：**

    - 添加或修改开发服务器的请求处理逻辑，如添加日志记录、错误处理、性能分析等。
    - 在开发环境中实现特殊的路由或功能，如模拟 API 接口或处理特定的开发环境请求。

**示例用法：**

```javascript
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('server:devHandler:handler', (req, res, next) => {
    // 在每次请求开始时添加日志
    console.log(`Received request: ${req.url}`);

    // 在处理请求前执行自定义逻辑
    if (req.url === '/api/v1/development') {
      // 如果是开发环境的特定API请求，模拟数据
      const simulatedData = { key: 'development-data' };
      res.json(simulatedData);
    } else {
      next(); // 继续执行默认的请求处理
    }
  });
});

```

在这个案例中，`server:devHandler:handler`钩子被用来：

1. 在每次请求开始时，记录请求的URL到控制台。
2. 检查请求URL，如果是 `/api/v1/development`，则返回模拟的数据，而不是实际的API请求。

请注意，这个钩子仅在开发环境中生效，且主要用于开发过程中的调试和定制，生产环境通常不需要使用。


## 往期文章归档：

- [Nuxt3 的生命周期和钩子函数（四） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-27/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E5%9B%9B%EF%BC%89/)
- [Nuxt3 的生命周期和钩子函数（三） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-26/front_end/%20nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E4%B8%89%EF%BC%89/#%E5%BE%80%E6%9C%9F%E6%96%87%E7%AB%A0%E5%BD%92%E6%A1%A3%EF%BC%9A)
- [Nuxt3 的生命周期和钩子函数（二） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-25/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E4%BA%8C%EF%BC%89/)
- [Nuxt3 的生命周期和钩子函数（一） | cmdragon’s Blog](https://blog.cmdragon.cn/2024-06-24/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E4%B8%80%EF%BC%89/)
- [初学者必读：如何使用 Nuxt 中间件简化网站开发 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-23/front_end/%E5%88%9D%E5%AD%A6%E8%80%85%E5%BF%85%E8%AF%BB%EF%BC%9A%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8%20nuxt%20%20%E4%B8%AD%E9%97%B4%E4%BB%B6%E7%AE%80%E5%8C%96%E7%BD%91%E7%AB%99%E5%BC%80%E5%8F%91/)
- [深入探索 Nuxt3 Composables：掌握目录架构与内置API的高效应用 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-22/front_end/%E6%B7%B1%E5%85%A5%E6%8E%A2%E7%B4%A2%20nuxt3%20composables%EF%BC%9A%E6%8E%8C%E6%8F%A1%E7%9B%AE%E5%BD%95%E6%9E%B6%E6%9E%84%E4%B8%8E%E5%86%85%E7%BD%AEapi%E7%9A%84%E9%AB%98%E6%95%88%E5%BA%94%E7%94%A8/)
- [掌握 Nuxt 3 中的状态管理：实践指南 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-21/front_end/%E6%8E%8C%E6%8F%A1%20nuxt%203%20%E4%B8%AD%E7%9A%84%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86%EF%BC%9A%E5%AE%9E%E8%B7%B5%E6%8C%87%E5%8D%97/)
- [Nuxt 3 路由系统详解：配置与实践指南 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-20/front_end/nuxt%203%20%E8%B7%AF%E7%94%B1%E7%B3%BB%E7%BB%9F%E8%AF%A6%E8%A7%A3%EF%BC%9A%E9%85%8D%E7%BD%AE%E4%B8%8E%E5%AE%9E%E8%B7%B5%E6%8C%87%E5%8D%97/)
- [Nuxt 3组件开发与管理 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-19/front_end/nuxt%203%E7%BB%84%E4%BB%B6%E5%BC%80%E5%8F%91%E4%B8%8E%E7%AE%A1%E7%90%86/)
- [Nuxt3页面开发实战探索 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-18/front_end/nuxt3%E9%A1%B5%E9%9D%A2%E5%BC%80%E5%8F%91%E5%AE%9E%E6%88%98%E6%8E%A2%E7%B4%A2/)
- [Nuxt.js 深入浅出：目录结构与文件组织详解 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-17/front_end/nuxt.js%20%E6%B7%B1%E5%85%A5%E6%B5%85%E5%87%BA%EF%BC%9A%E7%9B%AE%E5%BD%95%E7%BB%93%E6%9E%84%E4%B8%8E%E6%96%87%E4%BB%B6%E7%BB%84%E7%BB%87%E8%AF%A6%E8%A7%A3/)
- [安装 Nuxt.js 的步骤和注意事项 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-16/front_end/%E5%AE%89%E8%A3%85%20nuxt.js%20%E7%9A%84%E6%AD%A5%E9%AA%A4%E5%92%8C%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9/)
- [探索Web Components | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-15/front_end/%E6%8E%A2%E7%B4%A2web%20components/)
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
