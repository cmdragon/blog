---
url: /posts/16e6c55234a5fd9caeea0fcff47f8b6d/
title: Nuxt3 的生命周期和钩子函数（六）
date: 2024-06-30T00:18:53+08:00
updated: 2024-06-30T00:18:53+08:00
author: cmdragon

summary:
  摘要：本文深入解析了Nuxt3框架中的多个核心生命周期钩子和组件注册功能，包括imports:sources、imports:extend、imports:context、imports:dirs、components:dirs及components:extend，通过实例代码指导开发者如何在不同场景下有效运用这些钩子函数来扩展导入源、优化组件导入流程及增强项目结构灵活性。

categories:
  - 前端开发

tags:
  - nuxt
  - 生命周期
  - 钩子函数
  - 模块导入
  - 全局组件
  - 导入源
  - 目录扩展
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_06_30 15_28_59.png" title="2024_06_30 15_28_59.png" alt="2024_06_30 15_28_59.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`


## imports:sources

### 参数

-   `presets`

### 描述

`imports:sources` 是 Nuxt 3 提供的一个钩子函数，在 Nuxt 应用的设置过程中被调用。它允许模块扩展导入源，使得模块可以添加自定义的导入路径，这些路径下的组件、工具函数等可以在 Nuxt 应用中全局导入。`presets` 参数是一个数组，包含了预定义的导入源配置集合，模块可以通过这个参数来添加或修改导入源。

### 详细用法解释和完整demo示例

以下是如何在 Nuxt 3 插件中使用 `imports:sources` 钩子的详细解释和完整示例：

#### 步骤 1: 创建插件文件

在 Nuxt 3 项目的 `plugins` 目录下创建一个新的插件文件，例如 `custom-imports.js`。

#### 步骤 2: 编写插件代码

在 `custom-imports.js` 文件中，使用 `defineNuxtPlugin` 函数定义插件，并在插件中使用 `imports:sources` 钩子：

```javascript
// plugins/custom-imports.js
import { defineNuxtPlugin } from '#app';
import path from 'path';

export default defineNuxtPlugin((nuxtApp) => {
  // 使用 imports:sources 钩子扩展导入源
  nuxtApp.hook('imports:sources', (presets) => {
    // 定义一个新的预设配置
    const customPreset = {
      name: 'customPreset',
      sources: [
        {
          find: /^@custom/, // 当导入路径以 @custom 开头时
          path: path.resolve(__dirname, '../composables'), // 指向 composable 目录的绝对路径
        },
      ],
    };

    // 将自定义的预设配置添加到预设数组中
    presets.push(customPreset);
  });
});

```

#### 步骤 3: 注册插件

在 `nuxt.config.ts` 或 `nuxt.config.js` 文件中注册这个插件：

```javascript
// nuxt.config.ts 或 nuxt.config.js
export default defineNuxtConfig({
  // ...
  plugins: [
    // ...
    './plugins/custom-imports',
  ],
  // ...
});

```

#### 完整demo示例

以下是一个完整的示例，展示了如何在 Nuxt 3 应用中使用 `imports:sources` 钩子来添加自定义导入源预设：

```javascript
// plugins/custom-imports.js
import { defineNuxtPlugin } from '#app';
import path from 'path';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('imports:sources', (presets) => {
    // 定义一个新的预设配置
    const customPreset = {
      name: 'customPreset',
      sources: [
        {
          find: /^@custom/,
          path: path.resolve(__dirname, '../composables'),
        },
      ],
    };

    // 将自定义的预设配置添加到预设数组中
    presets.push(customPreset);
  });
});

// nuxt.config.ts 或 nuxt.config.js
export default defineNuxtConfig({
  plugins: [
    './plugins/custom-imports',
  ],
});

```

现在，你可以在 Nuxt 应用中的任何组件或页面中通过 `@custom/xxx` 的方式导入 `composables` 目录下的内容，前提是在你的代码中已经定义了相应的 `@custom` 别名。




## `imports:extend` 

### 参数

-   **imports**: 这是一个对象，包含了所有在 Nuxt 应用中全局可用的导入。

### 详细描述

`imports:extend` 钩子是 Nuxt.js 提供的一个扩展机制，它允许插件或模块向 Nuxt 应用的全局范围内添加额外的导入。这意味着，你可以在任何组件、页面或 Nuxt 插件中访问这些导入，而不需要重复导入它们。

当 Nuxt 应用启动时，Nuxt 会自动调用 `imports:extend` 钩子，并且传递一个包含当前全局导入的对象给这个钩子。插件或模块可以修改这个对象，添加新的属性，从而使得新的导入在整个应用中可用。

### 使用场景

这个钩子特别有用，当你想要：

-   在全局范围内添加自定义函数或方法。
-   将第三方库或模块注册为全局变量，以便在应用的任何部分都可以方便地使用。
-   为 Nuxt 应用提供全局的辅助函数或工具。

### Demo

以下是如何在插件中使用 `imports:extend` 钩子的详细示例：

```javascript
// plugins/my-plugin.js

// 导出一个默认的 Nuxt 插件定义
export default defineNuxtPlugin((nuxtApp) => {
  // 在插件内部，使用 imports:extend 钩子来扩展全局导入
  nuxtApp.hook('imports:extend', (imports) => {
    // 添加自定义函数到 imports 对象
    imports.myCustomFunction = function() {
      console.log('This is a custom function imported globally.');
    };

    // 添加一个第三方库到 imports 对象
    // 假设我们有一个第三方库 'some-lib'，我们需要将其导出
    const someLib = require('some-lib');
    imports.someLib = someLib;

    // 如果需要，还可以添加模块
    // 假设我们有一个自定义模块 'myCustomModule'
    const myCustomModule = require('./path/to/myCustomModule');
    imports.myCustomModule = myCustomModule;
  });
});

// 现在，在任何组件或页面中，我们可以直接使用这些导入
// 例如，在页面中使用 myCustomFunction
export default {
  methods: {
    greet() {
      this.myCustomFunction(); // 输出: This is a custom function imported globally.
    }
  }
};

```

在这个例子中，我们定义了一个插件 `my-plugin.js`，它通过 `imports:extend` 钩子向 Nuxt 应用的全局导入中添加了一个自定义函数 `myCustomFunction` 和一个第三方库 `someLib`，以及一个自定义模块 `myCustomModule`。之后，在应用的任何组件或页面中，我们都可以直接使用这些全局导入，而不需要单独导入它们。

通过这种方式，`imports:extend` 钩子极大地简化了在 Nuxt 应用中共享和重用代码的过程。









## imports:context

### 参数

-   **context**：这是一个对象，包含了创建 unimport 上下文时的相关信息。

### 详细描述

`imports:context` 钩子在创建 unimport 上下文时被调用。这个钩子提供了一个机会，让插件或模块能够访问和修改 unimport 上下文。通过这个钩子，你可以对模块的导入和卸载进行更精细的控制。

具体来说，`context` 对象包含了以下重要信息：

-   `imports`：一个数组，用于存储要导入的模块路径。
-   `unimports`：一个数组，用于存储要卸载的模块路径。

你可以在钩子函数中根据具体的需求，对 `imports` 和 `unimports` 数组进行操作，例如：

-   添加或移除模块路径。
-   根据条件动态地决定是否导入或卸载特定模块。

这样，你可以根据应用的不同状态或用户的操作，灵活地管理模块的导入和卸载，以优化性能、减少不必要的资源加载或实现特定的功能。

### Demo

以下是一个更详细的示例，展示如何在插件中使用 `imports:context` 钩子：

```javascript
// plugins/my-plugin.js

export default defineNuxtPlugin((nuxtApp) => {
  // 使用 imports:context 钩子
  nuxtApp.hook('imports:context', (context) => {
    // 在这里可以访问和修改 context 对象

    // 假设我们有一个功能模块，只在特定页面需要
    if (nuxtApp.route.path === '/specific-page') {
      context.imports.push('path/to/featureModule');
    }

    // 监听路由变化事件，根据需要动态添加或移除模块
    nuxtApp.$router.afterEach((to, from) => {
      if (to.path === '/another-specific-page') {
        context.imports.push('path/to/anotherModule');
      } else {
        context.unimports.push('path/to/anotherModule');
      }
    });
  });
});

```

在这个示例中，我们根据当前路由路径来决定是否导入特定的功能模块。如果当前页面是 `/specific-page`，则将 `featureModule` 添加到导入列表中。同时，我们还监听了路由变化事件，根据新的路由路径动态地添加或移除模块。

这样，通过使用 `imports:context` 钩子，我们可以根据应用的具体情况，灵活地控制模块的导入和卸载，以实现更好的性能和用户体验。



## imports:dirs

### 参数

-   **dirs**：一个字符串数组，用于指定额外的导入目录。

### 详细描述

`imports:dirs` 钩子允许你扩展 Nuxt 项目的导入目录。这意味着你可以指定额外的目录，使得这些目录中的模块可以被 Nuxt 项目导入和使用。这对于组织代码、分离关注点或重用代码片段非常有用。

当你在 Nuxt 应用中使用 `import` 或 `require` 语句时，Nuxt 会首先在默认的导入目录中查找模块。通过使用 `imports:dirs` 钩子，你可以添加自定义的目录到搜索路径中，使得这些目录中的模块也可以被导入。

### Demo

以下是一个示例，展示如何在插件中使用 `imports:dirs` 钩子：

```javascript
// plugins/extend-imports.js

export default defineNuxtPlugin((nuxtApp) => {
  // 使用 imports:dirs 钩子
  nuxtApp.hook('imports:dirs', (dirs) => {
    // 添加自定义的导入目录
    dirs.push('path/to/custom/directory');
    dirs.push('path/to/another/directory');

    // 你也可以根据条件动态添加目录
    if (process.env.DEBUG_MODE === 'true') {
      dirs.push('path/to/debug/directory');
    }
  });
});

```

在这个示例中，我们通过 `imports:dirs` 钩子添加了两个自定义的导入目录。此外，我们还根据环境变量 `DEBUG_MODE` 的值，有条件地添加了一个额外的调试目录。

这样配置后，你就可以在 Nuxt 应用中直接导入这些目录下的模块，而不需要指定完整的路径。例如，如果你有一个模块位于 `path/to/custom/directory` 下的 `myModule.js`，你现在可以这样导入它：

```javascript
import myModule from 'myModule';

```

而不需要这样：

```javascript
import myModule from 'path/to/custom/directory/myModule';

```

通过这种方式，`imports:dirs` 钩子使得模块导入更加灵活和方便，有助于维护一个清晰和模块化的项目结构。








## components:dirs

### 参数

-   **dirs**：一个字符串数组，用于指定额外的自动导入组件的目录。

### 详细描述

`components:dirs` 钩子在 `app:resolve` 阶段被调用，它允许你扩展 Nuxt 应用自动导入组件的目录。这意味着你可以指定额外的目录，使得这些目录中的组件可以被 Nuxt 自动识别和导入。

当 Nuxt 应用启动时，它会扫描默认的组件目录以及通过 `components:dirs` 钩子指定的目录，查找符合条件的组件。这些组件可以在模板中直接使用，而无需手动导入。

通过使用 `components:dirs` 钩子，你可以更好地组织和管理组件，将它们分组到不同的目录中，提高代码的可读性和可维护性。

### Demo

以下是一个示例，展示如何在插件中使用 `components:dirs` 钩子：

```javascript
// plugins/extend-components.js

export default defineNuxtPlugin((nuxtApp) => {
  // 使用 components:dirs 钩子
  nuxtApp.hook('components:dirs', (dirs) => {
    // 添加自定义的组件目录
    dirs.push('path/to/custom/components');
    dirs.push('path/to/another/components');

    // 你也可以根据条件动态添加目录
    if (process.env.DEBUG_MODE === 'true') {
      dirs.push('path/to/debug/components');
    }
  });
});

```

在这个示例中，我们通过 `components:dirs` 钩子添加了两个自定义的组件目录。此外，我们还根据环境变量 `DEBUG_MODE` 的值，有条件地添加了一个额外的调试组件目录。

这样配置后，Nuxt 应用将自动扫描这些目录中的组件，并在模板中直接使用它们。例如，如果你有一个组件位于 `path/to/custom/components` 下的 `MyComponent.vue`，你现在可以在模板中这样使用它：

```
<MyComponent />
```

而不需要这样：

```javascript
<template>
  <MyComponent />
</template>

<script>
import MyComponent from 'path/to/custom/components/MyComponent.vue';
</script>

```

通过这种方式，`components:dirs` 钩子使得组件的使用更加方便和简洁，有助于提高开发效率。








## components:extend

### 参数

-   **components**：一个对象，其中的键是组件的名称，值是组件的定义（可以是组件的路径或者一个 Vue 组件对象）。

### 详细描述

`components:extend` 钩子允许你在 Nuxt 应用中扩展新的组件。这意味着你可以在运行时动态地注册额外的组件，使得它们可以在整个应用中被使用。这个钩子特别有用，当你需要在不修改现有代码结构的情况下，添加第三方组件库或自定义组件时。

通过 `components:extend` 钩子注册的组件，可以在 Nuxt 的页面和组件中像内置组件一样使用，无需额外的导入步骤。

### Demo

以下是一个示例，展示如何在插件中使用 `components:extend` 钩子：

```javascript
// plugins/register-components.js

export default defineNuxtPlugin((nuxtApp) => {
  // 使用 components:extend 钩子
  nuxtApp.hook('components:extend', (components) => {
    // 扩展新的组件
    components['MyCustomComponent'] = {
      // 组件定义，可以是组件的路径或者直接是 Vue 组件对象
      template: '<div>This is a custom component!</div>',
      // 如果是路径，则如下：
      // require('path/to/MyCustomComponent.vue').default
    };

    // 也可以注册第三方库的组件
    components['ThirdPartyComponent'] = {
      // 直接使用第三方组件对象
      ...require('third-party-component-library').MyComponent
    };
  });
});

```

在这个示例中，我们通过 `components:extend` 钩子注册了两个新组件。第一个是自定义组件 `MyCustomComponent`，它直接在钩子函数中定义。第二个是第三方库中的组件 `ThirdPartyComponent`，它通过引入第三方库的模块并解构出相应的组件对象来注册。

注册完成后，你可以在 Nuxt 应用的任何地方像使用内置组件一样使用这些新组件：

```vue
<template>
  <MyCustomComponent />
  <ThirdPartyComponent />
</template>

```

这样，`components:extend` 钩子使得添加和使用新的组件变得非常灵活和方便。




## 往期文章归档：

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
- [Nuxt3页面开发实战探索 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-18/front_end/nuxt3%E9%A1%B5%E9%9D%A2%E5%BC%80%E5%8F%91%E5%AE%9E%E6%88%98%E6%8E%A2%E7%B4%A2/)
- [Nuxt.js 深入浅出：目录结构与文件组织详解 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-17/front_end/nuxt.js%20%E6%B7%B1%E5%85%A5%E6%B5%85%E5%87%BA%EF%BC%9A%E7%9B%AE%E5%BD%95%E7%BB%93%E6%9E%84%E4%B8%8E%E6%96%87%E4%BB%B6%E7%BB%84%E7%BB%87%E8%AF%A6%E8%A7%A3/)
- [安装 Nuxt.js 的步骤和注意事项 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-16/front_end/%E5%AE%89%E8%A3%85%20nuxt.js%20%E7%9A%84%E6%AD%A5%E9%AA%A4%E5%92%8C%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9/)
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
