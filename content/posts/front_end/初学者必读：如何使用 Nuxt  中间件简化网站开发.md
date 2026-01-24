---
url: /posts/5f903ecf37e457f68874ec0e3e7fac54/
title: 初学者必读：如何使用 Nuxt  中间件简化网站开发
date: 2024-06-24T00:18:53+08:00
updated: 2024-06-24T00:18:53+08:00
author: cmdragon

summary:
  本文概述了Nuxt 3框架的升级特点，对比Nuxt 2，详细解析中间件应用、配置策略与实战示例，涵盖功能、错误管理、优化技巧，并探讨与Nuxt 3核心组件集成方法，给出最佳实践和问题解决方案，强调利用Vue 3和Serverless Functions提升中间件效能。

categories:
  - 前端开发

tags:
  - Nuxt 3
  - 中间件
  - Vue 3
  - 服务器less
  - 性能优化
  - 实战案例
  - 集成技巧
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_06_24 13_55_41.png" title="2024_06_24 13_55_41.png" alt="2024_06_24 13_55_41.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`


## 第一章：Nuxt 3简介

**Nuxt 3的架构和特性**

Nuxt 3是一款基于Vue.js 3的通用型应用框架，它继承了Nuxt.js 2中的许多优秀特性，并在此基础上进行了改进和优化。Nuxt 3的核心思想是提供一个更加简单、高效、可扩展的方式来开发和部署Vue.js应用。

Nuxt 3的主要特性包括：

-   **自动化**：Nuxt 3可以自动化生成页面和路由，让您不必手动编写路由配置。
-   **性能优化**：Nuxt 3采用了更加先进的构建工具和优化技术，如Webpack 5、ES Modules、Vite和Partytown等，以提供更快的构建速度和更小的bundle size。
-   **内置支持**：Nuxt 3内置了许多常用的功能，如SSR、SSG、ISR、TypeScript、ESLint、Vuex和Vue Router等。
-   **可扩展性**：Nuxt 3的插件和模块系统使得它易于扩展和定制。
-   **生态系统**：Nuxt 3继承了Nuxt.js 2的生态系统，并且在此基础上进行了扩展和改进。

**为什么选择Nuxt 3**

Nuxt 3是一个优秀的Vue.js框架，它可以帮助您快速开发和部署高质量的应用。以下是一些选择Nuxt 3的原因：

-   **简单易用**：Nuxt 3的自动化和内置支持可以让您更快、更容易地开发应用。
-   **高性能**：Nuxt 3的构建工具和优化技术可以让您的应用更快、更流畅。
-   **可扩展性**：Nuxt 3的插件和模块系统可以让您定制和扩展应用。
-   **生态系统**：Nuxt 3的生态系统可以让您更容易地找到解决方案和社区支持。

**Nuxt 3与Nuxt 2的比较**

Nuxt 3与Nuxt 2有很多相同的地方，但也有一些区别。以下是一些主要的区别：

-   **Vue.js 3**：Nuxt 3是基于Vue.js 3开发的，而Nuxt.js 2是基于Vue.js 2开发的。
-   **构建工具**：Nuxt 3采用了更加先进的构建工具和优化技术，如Webpack 5、ES Modules、Vite和Partytown等。
-   **API**：Nuxt 3的API有所改变，例如`nuxt-link`和`nuxt-child`等组件已被废弃，取而代之的是`<NuxtLink>`和`<NuxtChild>`等新组件。
-   **插件和模块**：Nuxt 3的插件和模块系统有所改变，例如`buildModules`和`modules`已被合并为`modules`，`plugins`已被移动到`server`目录下。



## **第二章：中间件基础**

**什么是中间件**

在Nuxt.js（包括Nuxt 3）中，中间件（Middleware）是一种特殊的JavaScript函数，它们在请求到达服务器路由处理程序之前或之后执行。它们可以用来处理请求的生命周期，执行一些通用的操作，如验证用户身份、记录请求日志、处理API调用前的设置等。中间件是Nuxt.js中实现路由级别的功能扩展的一种方式。

**中间件的作用和重要性**

中间件在Nuxt应用中的作用和重要性主要体现在以下几个方面：

1. **路由控制**：中间件可以用来控制哪些请求可以访问特定的路由，或者在访问特定路由前执行特定操作。
2. **数据处理**：例如，可以使用中间件来统一处理API调用，或者在请求发送前或返回后进行数据格式转换。
3. **错误处理**：中间件可以捕获和处理路由执行过程中的错误，提供统一的错误处理机制。
4. **性能优化**：例如，缓存中间件可以用来缓存某些数据，减少服务器的负载。

**中间件的类型**

Nuxt.js中的中间件主要分为三类：

1. **全局中间件**（Global Middleware）：这些中间件在所有请求之前或之后执行，无论请求的目标路由是什么。它们通常用于执行全局性的任务，如认证、日志记录等。
2. **页面中间件**（Page Middleware）：这些中间件只在特定的页面或一组页面请求时执行。它们可以用于定制页面的渲染过程，如在页面加载前或加载后执行特定操作。
3. **模块中间件**（Module Middleware）：在Nuxt 3中，模块（Modules）引入了它们自己的中间件，这些中间件与模块关联，只在模块的路由中执行。这使得模块能够更专注于自己的功能，同时保持代码的组织和隔离。



## **第三章：配置和使用中间件**

**如何定义和配置中间件**

在Nuxt.js中定义和配置中间件通常遵循以下步骤：

1.  **定义中间件**：创建一个JavaScript文件作为中间件。例如，创建一个名为`auth.js`的文件。

```javascript
// middlewares/auth.js
export default function (context) {
  // 中间件的逻辑
  if (!context.store.state.user.isAuthenticated) {
    return context.redirect('/login');
  }
}

```

1. **配置中间件**：在`nuxt.config.js`文件中配置中间件。

```javascript
// nuxt.config.js
export default {
  modules: [],
  middleware: [
    'auth', // 引用中间件文件名，不需要.js后缀
    'another' // 可以添加多个中间件
  ]
}

```

或者，如果你希望对特定页面使用中间件，你可以在页面文件中的`layout`属性中指定。

```
// pages/index.vue
export default {
  layout: 'auth', // 使用名为auth的布局，该布局中定义了中间件
  // ...
}

```

**中间件的执行顺序**

中间件的执行顺序取决于它们在`nuxt.config.js`中的定义顺序。Nuxt.js会按照数组中的顺序依次调用中间件。如果需要改变执行顺序，只需调整数组中中间件的顺序即可。

**中间件的参数和返回值**

中间件函数接收一个`context`参数，这个`context`对象包含了Nuxt.js的上下文信息，如`req`（请求对象）、`res`（响应对象）、`store`（Vuex store实例）、`redirect`（重定向函数）等。

中间件可以返回一个`Promise`，允许执行异步操作。如果中间件需要异步操作（例如，从数据库获取数据），则应该返回一个`Promise`。

```javascript
// middlewares/auth.js
export default function (context) {
  return new Promise((resolve, reject) => {
    // 异步操作，例如验证用户
    checkUser(context).then(() => {
      resolve(); // 如果验证成功，继续执行后续中间件或路由处理
    }).catch(error => {
      reject(error); // 如果验证失败，抛出错误
    });
  });
}

```

如果中间件不需要执行异步操作，它可以是一个同步函数，直接执行逻辑后调用`next()`（在Nuxt 2中）或`resolve()`（在Nuxt 3中）继续执行后续中间件或路由处理。

```javascript
// middlewares/auth.js
export default function (context, next) {
  // 同步操作
  if (!context.store.state.user.isAuthenticated) {
    return context.redirect('/login');
  }
  next(); // 继续执行
}

```

在Nuxt 3中，中间件不再接收`next`函数作为参数，而是返回一个`Promise`。

请注意，如果中间件中发生了错误，应该使用`reject()`或抛出错误，以便Nuxt.js可以捕获并处理这些错误。


## **第四章：高级中间件技巧**

**异步中间件**

在中间件中，可以使用异步函数或返回一个`Promise`来处理异步操作，如从数据库中获取数据、调用API等。

在Nuxt 2中，中间件可以返回一个`Promise`，如下所示：

```javascript
// middlewares/getData.js
export default function (context) {
  return new Promise((resolve, reject) => {
    // 异步操作，例如从API获取数据
    getDataFromAPI().then(data => {
      context.data = data;
      resolve();
    }).catch(error => {
      reject(error);
    });
  });
}

```

在Nuxt 3中，中间件本身就是一个异步函数，可以直接使用`async/await`，如下所示：

```javascript
// middlewares/getData.js
export default async function (context) {
  try {
    const data = await getDataFromAPI();
    context.data = data;
  } catch (error) {
    context.error(error);
  }
}

```

**中间件的错误处理**

在中间件中，如果发生错误，可以通过抛出错误或返回一个`Promise`来进行错误处理。在Nuxt 2中，可以使用`context.error()`方法来记录错误。

在Nuxt 3中，中间件本身就是一个异步函数，可以使用`try/catch`来捕获错误。

```javascript
// middlewares/errorHandling.js
export default async function (context) {
  try {
    // 可能会抛出错误的代码
  } catch (error) {
    context.error(error);
  }
}

```

在中间件中捕获错误后，可以在`nuxt.config.js`中配置`error`页面，以便在发生错误时显示自定义错误页面。

```javascript
// nuxt.config.js
export default {
  router: {
    extendRoutes(routes, resolve) {
      routes.unshift({
        path: '*',
        name: 'error',
        component: resolve(__dirname, 'components/Error.vue')
      });
    }
  }
}

```

**中间件的测试和调试**

在开发中，可以使用`console.log()`、`debugger`等方法来输出调试信息，以便查看中间件的执行情况。

在进行单元测试时，可以使用`jest`等测试框架来测试中间件的功能。可以使用`sinon`等模拟库来模拟中间件的依赖项，如`context`对象、数据库连接等。

在进行端到端测试时，可以使用`cypress`等测试框架来测试中间件的功能。可以模拟用户操作，如点击按钮、输入表单等，以便测试中间件的执行情况。

在使用中间件时，可以使用`nuxt-start`等工具来启动开发服务器，以便在浏览器中查看中间件的执行情况。可以使用`nuxt generate`等工具来生成静态站点，以便在生产环境中查看中间件的执行情况。



## **第五章：实战案例分析**

**用户认证中间件**

用户认证中间件可以在用户请求访问受保护资源时进行用户身份验证，以确保用户的合法性。

在Nuxt中，可以使用`context.store`对象来存储用户信息，并在中间件中进行用户身份验证。

```javascript
// middlewares/auth.js
export default function (context) {
  if (!context.store.state.user) {
    context.redirect('/login');
  }
}

```

在路由中，可以使用`middleware`属性来指定中间件，以便在用户请求访问路由时进行用户身份验证。

```javascript
// pages/index.vue
export default {
  middleware: 'auth'
}

```

**权限控制中间件**

权限控制中间件可以在用户请求访问受限资源时进行权限控制，以确保用户的权限是否足够。

在Nuxt中，可以使用`context.store`对象来存储用户权限信息，并在中间件中进行权限控制。

```javascript
// middlewares/permission.js
export default function (context) {
  if (context.store.state.user.permission < 2) {
    context.redirect('/forbidden');
  }
}

```

在路由中，可以使用`middleware`属性来指定中间件，以便在用户请求访问路由时进行权限控制。

```
// pages/admin.vue
export default {
  middleware: 'permission'
}

```

**页面性能优化中间件**

页面性能优化中间件可以在用户请求访问页面时进行页面性能优化，以提高用户体验。

在Nuxt中，可以使用`context.app`对象来获取应用实例，并在中间件中进行页面性能优化。

```javascript
// middlewares/performance.js
export default function (context) {
  if (process.client) {
    const app = context.app;
    const router = app.router;
    const route = router.currentRoute;

    // 延迟加载图片
    const images = document.querySelectorAll('img');
    images.forEach(image => {
      if (image.getAttribute('data-src')) {
        image.src = image.getAttribute('data-src');
        image.removeAttribute('data-src');
      }
    });

    // 懒加载组件
    const components = document.querySelectorAll('[data-component]');
    components.forEach(component => {
      if (component.getAttribute('data-component')) {
        const componentName = component.getAttribute('data-component');
        const Component = require(`~/components/${componentName}.vue`).default;
        context.app.component(`dynamic-${componentName}`, Component);
        component.removeAttribute('data-component');
      }
    });

    // 监听路由变化，进行页面性能优化
    router.afterEach(() => {
      // 延迟加载图片
      const images = document.querySelectorAll('img');
      images.forEach(image => {
        if (image.getAttribute('data-src')) {
          image.src = image.getAttribute('data-src');
          image.removeAttribute('data-src');
        }
      });

      // 懒加载组件
      const components = document.querySelectorAll('[data-component]');
      components.forEach(component => {
        if (component.getAttribute('data-component')) {
          const componentName = component.getAttribute('data-component');
          const Component = require(`~/components/${componentName}.vue`).default;
          context.app.component(`dynamic-${componentName}`, Component);
          component.removeAttribute('data-component');
        }
      });
    });
  }
}

```

在路由中，可以使用`middleware`属性来指定中间件，以便在用户请求访问路由时进行页面性能优化。

```
// pages/index.vue
export default {
  middleware: 'performance'
}

```

通过使用中间件，可以在用户请求访问页面时进行用户认证、权限控制和页面性能优化，以提高用户体验。


## 第六章：中间件与Nuxt 3的其他特性结合

在 Nuxt 3 中，中间件是一种在服务器和客户端之间传输请求和响应的函数。它可以用来执行一些操作，例如验证用户身份、检查用户权限、记录访问日志等。中间件可以与 Nuxt 3 的其他特性，如路由、状态管理和插件，结合使用，以提高应用的功能和性能。

### 中间件与路由

在 Nuxt 3 中，可以在路由级别应用中间件。这意味着可以为每个路由定义不同的中间件，以执行特定于该路由的操作。

要在路由级别应用中间件，可以在 `pages` 目录下的每个页面文件的 `middleware` 选项中指定中间件的名称。例如：

```
<template>
  <div>
    <h1>Welcome to the home page!</h1>
  </div>
</template>

<script>
export default {
  middleware: 'auth'
}
</script>

```

在上面的示例中，`auth` 是中间件的名称，它将在访问 home 页面时执行。

### 中间件与状态管理

中间件可以与 Nuxt 3 的状态管理结合使用，以在应用的不同部分共享状态。可以使用 Vuex 或 Pinia 等状态管理库来实现这一点。

要在中间件中使用状态管理库，可以使用 `this` 对象来访问应用的状态。例如：

```javascript
export default function ({ store }) {
  if (!store.state.user.isAuthenticated) {
    return this.$router.push('/login')
  }
}

```

在上面的示例中，中间件使用 Vuex 的 `store` 对象来检查用户是否已经登录。如果用户未登录，中间件将重定向用户到登录页面。

### 中间件与插件

中间件可以与 Nuxt 3 的插件结合使用，以在应用的不同部分共享功能。可以使用 Nuxt 3 的插件系统来实现这一点。

要在中间件中使用插件，可以使用 `this` 对象来访问插件的方法。例如：

```javascript
export default function ({ app }) {
  app.myPluginMethod()
}

```

在上面的示例中，中间件使用 Nuxt 3 的插件系统来调用 `myPluginMethod` 方法。这样可以在应用的不同部分重用该方法，而无需在每个部分中都编写相同的代码。


## 第七章：最佳实践和常见问题

### 编写高效中间件的技巧

1. **异步处理**：确保中间件函数是异步的，以便可以处理异步操作，如 API 调用或数据库查询。
2. **避免阻塞操作**：在中间件中避免执行耗时的同步操作，这可能会阻塞应用的性能。
3. **最小化中间件逻辑**：保持中间件逻辑简洁，只处理必要的验证和逻辑，将复杂的业务逻辑放在服务或控制器中。
4. **使用依赖注入**：通过 Nuxt 3 的上下文对象访问应用的服务和资源，而不是直接导入或实例化。
5. **错误处理**：在中间件中实现错误处理逻辑，确保可以优雅地处理异常情况。

### 常见问题及解决方案

1. **中间件未按预期执行**：确保中间件已正确注册，并且命名和路径设置正确。
2. **异步中间件问题**：如果中间件是异步的，确保返回一个 Promise，以便 Nuxt 3 可以等待中间件完成。
3. **中间件冲突**：如果多个中间件之间存在逻辑冲突，确保它们的执行顺序正确，或者调整中间件逻辑以避免冲突。
4. **性能问题**：如果中间件导致性能问题，检查是否有不必要的同步操作或循环，优化这些部分。

### 性能优化建议

1. **懒加载中间件**：如果中间件不是在每个路由都需要，可以考虑使用懒加载来减少初始加载时间。
2. **缓存结果**：如果中间件执行的操作结果不会频繁变化，可以考虑缓存结果以减少重复计算。
3. **优化数据库查询**：如果中间件涉及数据库操作，确保使用索引和优化查询以提高性能。
4. **使用轻量级库**：如果中间件依赖第三方库，选择轻量级且性能优化的库。
5. **代码分割**：对于大型应用，使用代码分割来减少单个请求的 JavaScript 负载。



往期文章推荐：

### 往期文章归档：

- [深入探索 Nuxt3 Composables：掌握目录架构与内置API的高效应用 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-22/front_end/%E6%B7%B1%E5%85%A5%E6%8E%A2%E7%B4%A2%20nuxt3%20composables%EF%BC%9A%E6%8E%8C%E6%8F%A1%E7%9B%AE%E5%BD%95%E6%9E%B6%E6%9E%84%E4%B8%8E%E5%86%85%E7%BD%AEapi%E7%9A%84%E9%AB%98%E6%95%88%E5%BA%94%E7%94%A8/)
- [掌握 Nuxt 3 中的状态管理：实践指南 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-21/front_end/%E6%8E%8C%E6%8F%A1%20nuxt%203%20%E4%B8%AD%E7%9A%84%E7%8A%B6%E6%80%81%E7%AE%A1%E7%90%86%EF%BC%9A%E5%AE%9E%E8%B7%B5%E6%8C%87%E5%8D%97/)
- [Nuxt 3 路由系统详解：配置与实践指南 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-20/front_end/nuxt%203%20%E8%B7%AF%E7%94%B1%E7%B3%BB%E7%BB%9F%E8%AF%A6%E8%A7%A3%EF%BC%9A%E9%85%8D%E7%BD%AE%E4%B8%8E%E5%AE%9E%E8%B7%B5%E6%8C%87%E5%8D%97/)
- [Nuxt 3组件开发与管理 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-19/front_end/nuxt%203%E7%BB%84%E4%BB%B6%E5%BC%80%E5%8F%91%E4%B8%8E%E7%AE%A1%E7%90%86/)
- [Nuxt3页面开发实战探索 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-18/front_end/nuxt3%E9%A1%B5%E9%9D%A2%E5%BC%80%E5%8F%91%E5%AE%9E%E6%88%98%E6%8E%A2%E7%B4%A2/)
- [Nuxt.js 深入浅出：目录结构与文件组织详解 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-17/front_end/nuxt.js%20%E6%B7%B1%E5%85%A5%E6%B5%85%E5%87%BA%EF%BC%9A%E7%9B%AE%E5%BD%95%E7%BB%93%E6%9E%84%E4%B8%8E%E6%96%87%E4%BB%B6%E7%BB%84%E7%BB%87%E8%AF%A6%E8%A7%A3/)
- [安装 Nuxt.js 的步骤和注意事项 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-16/front_end/%E5%AE%89%E8%A3%85%20nuxt.js%20%E7%9A%84%E6%AD%A5%E9%AA%A4%E5%92%8C%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9/)
- [探索Web Components | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-15/front_end/%E6%8E%A2%E7%B4%A2web%20components/)
- [Vue微前端架构与Qiankun实践理论指南 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-14/front_end/vue%E5%BE%AE%E5%89%8D%E7%AB%AF%E6%9E%B6%E6%9E%84%E4%B8%8Eqiankun%E5%AE%9E%E8%B7%B5%E7%90%86%E8%AE%BA%E6%8C%87%E5%8D%97/)
- [Vue 3深度探索：自定义渲染器与服务端渲染 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-13/front_end/vue%203%E6%B7%B1%E5%BA%A6%E6%8E%A2%E7%B4%A2%EF%BC%9A%E8%87%AA%E5%AE%9A%E4%B9%89%E6%B8%B2%E6%9F%93%E5%99%A8%E4%B8%8E%E6%9C%8D%E5%8A%A1%E7%AB%AF%E6%B8%B2%E6%9F%93/)
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
