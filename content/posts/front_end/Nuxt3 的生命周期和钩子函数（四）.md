---
url: /posts/7ce28296234629061401246df9db573b/
title: Nuxt3 的生命周期和钩子函数（四）
date: 2024-06-28T00:18:53+08:00
updated: 2024-06-28T00:18:53+08:00
author: cmdragon

summary:
  概述了Nuxt3的六个关键生命周期钩子用途：modules:before至build:before，指导如何在应用初始化、模块管理、配置解析、模板处理及构建前执行自定义操作，附带实例代码，强化Nuxt应用的灵活性和可控性。

categories:
  - 前端开发

tags:
  - nuxt
  - 生命周期
  - 钩子函数
  - 模块管理
  - 应用构建
  - 配置优化
  - 模板定制
---

<img src="/images/2024_06_28 13_47_21.png" title="2024_06_28 13_47_21.png" alt="2024_06_28 13_47_21.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`


## 钩子：`modules:before`

**参数：**

-   **nuxtApp**: Nuxt 应用实例，提供核心 API 和应用配置访问。

**环境：**

-   **开发环境 (dev)**
-   **生产环境 (prod)**

**描述：**  `modules:before` 是 Nuxt.js 中的一个生命周期钩子，它在应用初始化阶段，且在安装用户自定义模块之前被调用。这个钩子允许开发者在模块安装前执行一些全局设置、数据准备或者进行必要的配置检查。

**详细解释：**

用法示例

要使用 `modules:before`，你需要创建一个 Nuxt 插件（`plugins`文件夹内），并使用`defineNuxtPlugin` 函数来定义这个钩子：

```javascript
// plugins/my-plugin.js
export default defineNuxtPlugin((nuxtApp) => {
  // 在这里编写你的代码
  nuxtApp.$emit('my-plugin-event', 'Before modules installation');

  // 例如，你可以设置全局变量或配置
  nuxtApp.config.globalProperties.$myPluginValue = 'Initial value';
});

```

案例演示

下面是一个简单的案例，展示了如何在 `modules:before` 钩子中执行一些操作：

```javascript
// plugins/my-plugin.js
export default defineNuxtPlugin((nuxtApp) => {
  // 检查并设置全局变量
  if (!nuxtApp.config.someGlobalVariable) {
    nuxtApp.config.someGlobalVariable = 'Default value';
    console.log('Setting default global variable');
  }

  // 触发一个自定义事件
  nuxtApp.$emit('my-plugin-event', 'Before modules');

  // 如果是开发环境，添加额外的调试信息
  if (process.env.NODE_ENV === 'development') {
    console.log('Running in development mode');
  }
});

```

在这个案例中，`modules:before` 钩子确保了全局变量的存在，触发了一个自定义事件，并根据环境提供不同的提示。这有助于确保模块安装前应用的状态是正确的。


## 钩子：`modules:done`

**参数：**

-   `nuxtApp`: Nuxt.js 应用实例，提供了与应用交互的接口。

**环境：**

-   Nuxt.js 初始化阶段
-   在所有用户自定义模块（plugins 或 custom modules）安装并初始化后

**描述：**

`modules:done` 是 Nuxt.js 的生命周期钩子之一，它在所有模块（包括用户定义的模块和第三方模块）安装完成之后被调用。这个钩子允许开发者在所有模块都已经设置好之后执行一些后续操作，例如初始化某些功能或执行跨模块的检查。

**详细解释与用法实例：**

在 Nuxt 3 中，插件可以通过 `defineNuxtPlugin` 函数定义，并在其中使用 `nuxtApp` 实例的 `$on` 方法来监听 `modules:done` 钩子。以下是一个使用该钩子的插件示例：

```javascript
// plugins/my-plugin.js
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('modules:done', () => {
    // 执行一些所有模块安装完成后的操作
    console.log('所有模块已安装完成！');
    // 这里可以执行一些逻辑，比如初始化全局状态或设置全局配置
  });
});

```

**实战案例demo：**

以下是一个实战案例，其中我们使用 `modules:done` 钩子来确保所有模块加载完成后，执行一个检查所有模块是否正确配置的函数。

```javascript
// plugins/check-modules.js
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('modules:done', async () => {
    // 检查是否所有必须的模块都已加载
    const requiredModules = ['@nuxtjs/axios', 'nuxt-i18n'];
    const loadedModules = nuxtApp.$options.nuxt.modules.map(module => module.name);

    const missingModules = requiredModules.filter(module => !loadedModules.includes(module));

    if (missingModules.length > 0) {
      console.error(`以下模块未加载：${missingModules.join(', ')}`);
    } else {
      console.log('所有必须的模块已加载！');
      // 如果所有必须的模块都已加载，执行一些初始化操作
      // 例如，初始化API服务
      await nuxtApp.$axios.get('/api/initialize');
    }
  });
});

```

在这个案例中，我们定义了一个必须加载的模块列表 `requiredModules`，然后在 `modules:done` 钩子中检查这些模块是否已经加载。如果有缺失的模块，我们会在控制台中打印错误消息；如果所有模块都已加载，我们将执行一些初始化操作，例如调用一个API来初始化应用程序。


## **钩子：`app:resolve`**

**参数：**

-   `nuxtApp`: Nuxt.js 应用实例，包含了应用的核心配置和功能。

**环境：**

-   Nuxt.js 初始化阶段
-   在 `nuxtApp` 实例解析完成之后调用

**描述：**

`app:resolve` 是 Nuxt.js 的一个生命周期钩子，它在 Nuxt 应用实例解析完成，但可能还未完全初始化之前被调用。这个钩子适合在应用的配置被解析后执行一些操作，比如修改默认配置、添加全局中间件等。

**详细解释与用法实例：**

在 Nuxt 3 中，你可以使用 `defineNuxtPlugin` 函数定义插件，并在 `app:resolve` 钩子中进行配置修改。以下是一个简单的例子：

```javascript
// plugins/my-plugin.js
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:resolve', (resolve) => {
    // 修改默认配置
    resolve.options.someGlobalOption = 'myCustomValue';

    // 添加全局中间件
    resolve.addMiddleware('myMiddleware', (to, from, next) => {
      console.log('Middleware executed before route change');
      next();
    });
  });
});

```

**实战案例demo：**

在以下案例中，我们使用 `app:resolve` 钩子来添加一个全局的全局头部组件和修改路由守卫：

```javascript
// plugins/global-config.js
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:resolve', async (resolve) => {
    // 添加全局头部组件
    resolve.options.headComponents = ['~/components/global-header.vue'];

    // 修改路由守卫
    resolve.options.router.beforeEach = (to, from, next) => {
      console.log('Before each route:', to, from);
      next();
    };
  });
});

```

在这个例子中，当 Nuxt 应用解析时，会自动添加全局头部组件 `global-header.vue`，并在所有路由跳转前执行我们自定义的路由守卫。这在全局配置或者需要在所有页面共享的逻辑中非常有用。


## **钩子：`app:templates`**

**参数：**

-   `nuxtApp`: Nuxt.js 应用实例，包含了应用的核心配置和功能。

**环境：**

-   Nuxt.js 应用生成过程中
-   在 NuxtApp 的模板文件被处理之前调用

**描述：**

`app:templates` 是 Nuxt.js 的一个生命周期钩子，它允许开发者在 Nuxt 应用生成过程中自定义、修改或添加新的文件到构建目录。这个钩子可以用来添加自定义的模板文件，或者根据项目需求修改现有的模板。

**详细解释与用法实例：**

使用 `app:templates` 钩子，你可以访问和修改 Nuxt 应用的模板文件。以下是一个如何使用这个钩子的例子：

```javascript
// plugins/custom-templates.js
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:templates', (templates) => {
    // 修改现有模板
    templates['index.html'] = templates['index.html'].replace(
      '<title>Nuxt App</title>',
      '<title>My Custom Title</title>'
    );

    // 添加新模板文件
    templates['custom-template.html'] = `
      <div>My custom template content</div>
    `;
  });
});

```

在这个例子中，我们修改了 `index.html` 模板文件中的 `<title>` 标签，并添加了一个名为 `custom-template.html` 的新模板文件。

**实战案例demo：**

以下是一个实战案例，展示如何使用 `app:templates` 钩子来为 Nuxt 应用添加一个自定义的布局文件：

```javascript
// plugins/add-layout.js
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:templates', (templates) => {
    // 添加自定义布局文件
    templates['layouts/custom.vue'] = `
      <template>
        <div class="custom-layout">
          <slot></slot>
        </div>
      </template>

      <script>
      export default {
        name: 'custom-layout'
      }
      </script>

      <style scoped>
      .custom-layout {
        padding: 20px;
        background-color: #f0f0f0;
      }
      </style>
    `;
  });
});

```

在这个案例中，我们通过 `app:templates` 钩子添加了一个自定义的布局文件 `custom.vue`。这个布局文件可以在 Nuxt 应用的任何页面中使用，为页面提供一个带有特定样式和结构的容器。通过这种方式，你可以轻松地为你的 Nuxt 应用添加全局样式或结构，而不需要修改每个页面。


## **钩子：`app:templatesGenerated`**

**参数：**

-   `nuxtApp`: Nuxt.js 应用实例，包含了编译后的模板和相关配置。

**环境：**

-   Nuxt.js 应用编译阶段
-   在模板编译到虚拟文件系统（Virtual File System, VFS）之后

**描述：**

`app:templatesGenerated` 是 Nuxt.js 的一个生命周期钩子，它在模板编译完成并转换为虚拟文件系统（VFS）后被调用。这个钩子可以用来处理编译后的模板，比如修改、重命名、或根据需要进行进一步的处理。

**详细解释与用法实例：**

```javascript
// plugins/modify-templates.js
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:templatesGenerated', (templates) => {
    // 修改已生成的模板文件名
    templates['new-template.html'] = templates['old-template.html'];

    // 或者，对模板内容进行处理
    templates['index.html'] = templates['index.html'].replace(
      '<title>Nuxt App</title>',
      '<title>Modified Title</title>'
    );
  });
});

```

在这个例子中，我们使用 `app:templatesGenerated` 钩子，将名为 `old-template.html` 的模板文件重命名为 `new-template.html`，并修改了 `index.html` 中的 `<title>` 标签。

**实战案例demo：**

假设你想要根据用户的登录状态动态地添加或移除模板中的某些部分：

```javascript
// plugins/conditional-templates.js
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:templatesGenerated', async (templates) => {
    const isLoggedIn = await nuxtApp.$store.state.isLoggedIn;

    if (isLoggedIn) {
      templates['footer.html'] = `
        <footer>
          Welcome, logged in user!
        </footer>
      `;
    } else {
      delete templates['footer.html'];
    }
  });
});

```

在这个案例中，我们检查用户是否登录，如果登录，就添加一个包含欢迎信息的 `footer.html` 模板；否则，删除这个模板。这样，根据用户的登录状态，应用的布局会有所不同。

请注意，这些操作通常需要确保在模板编译和渲染之前进行，以确保模板的正确性和一致性。


## **钩子：`build:before`**

**参数：**

-   `nuxtApp`: Nuxt.js 应用实例，包含了应用的配置和插件。

**环境：**

-   Nuxt.js 应用构建阶段
-   在打包构建器开始工作之前

**描述：**

`build:before` 是 Nuxt.js 的一个生命周期钩子，它在 Nuxt 的打包构建器开始工作之前被调用。这个钩子可以用来执行一些在构建过程开始之前需要的操作，比如清理构建目录、设置环境变量或者修改构建配置。

**详细解释与用法实例：**

```javascript
// plugins/build:before.js
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('build:before', (builder) => {
    // 在构建开始前执行的操作
    console.log('构建过程即将开始...');

    // 示例：清理 dist 目录
    const fs = require('fs');
    const path = require('path');
    const distDir = path.resolve(__dirname, '../dist');

    if (fs.existsSync(distDir)) {
      fs.rmdirSync(distDir, { recursive: true });
    }
  });
});

```

在这个例子中，我们使用 `build:before` 钩子来在构建过程开始之前清理 `dist` 目录。

**实战案例demo：**

假设你想要在构建前根据环境变量来调整构建配置：

```javascript
// plugins/configure-build.js
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('build:before', (builder) => {
    // 检查环境变量，根据其值调整构建配置
    if (process.env.BUILD_MODE === 'production') {
      nuxtApp.config.buildOptimization = {
        // 生产环境特定的构建优化配置
      };
    } else {
      nuxtApp.config.buildOptimization = {
        // 开发环境特定的构建优化配置
      };
    }
  });
});

```

在这个案例中，我们根据环境变量 `BUILD_MODE` 的值来调整 Nuxt 应用的构建优化配置。这样做可以根据不同的部署环境来优化构建结果，例如在开发环境中启用更多的调试信息，而在生产环境中启用更严格的优化策略。

使用这些钩子时，需要确保不会对构建过程造成负面影响，比如不要在构建过程中执行耗时的操作。



### 往期文章归档：

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
- [Vue微前端架构与Qiankun实践理论指南 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-14/front_end/vue%E5%BE%AE%E5%89%8D%E7%AB%AF%E6%9E%B6%E6%9E%84%E4%B8%8Eqiankun%E5%AE%9E%E8%B7%B5%E7%90%86%E8%AE%BA%E6%8C%87%E5%8D%97/)
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
