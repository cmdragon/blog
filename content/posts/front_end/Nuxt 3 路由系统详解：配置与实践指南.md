---
url: /posts/3edf792d5e89f8a9aba11ef2a862f865/
title: Nuxt 3 路由系统详解：配置与实践指南
date: 2024-06-21T00:18:53+08:00
updated: 2024-06-21T00:18:53+08:00
author: cmdragon

summary:
  摘要：本文是一份关于Nuxt 3路由系统的详尽指南。它从介绍Nuxt 3的基本概念开始，包括Nuxt 3与Nuxt 2的区别和选择Nuxt 3的理由。然后，它详细解释了安装和配置Nuxt 3的步骤，以及Nuxt 3路由系统的基础知识，如动态路由和嵌套路由。接着，它介绍了路由中间件的作用和编写自定义中间件的方法，并讨论了页面布局、导航链接和页面过渡效果。最后，它涵盖了高级路由技巧，如异步数据获取、错误页面处理和路由守卫，以及实战案例分析，包括博客系统路由设计、电商网站路由设计和多语言支持的路由实现。最后，它讨论了性能优化与安全，包括路由懒加载、路由安全性和性能监控与调试。

categories:
  - 前端开发

tags:
  - Nuxt
  - 路由
  - Vue
  - SSR
  - 中间件
  - 组件
  - 配置
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_06_21 16_02_00.png" title="2024_06_21 16_02_00.png" alt="2024_06_21 16_02_00.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

### 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

### 第一章：Nuxt 3 简介

#### Nuxt 3 是什么

Nuxt 3 是一个基于 Vue 3 的服务器端渲染（SSR）框架，它为开发者提供了一个优雅的方式来构建服务端渲染的 Vue 应用程序。Nuxt 3 继承了
Nuxt 2 的核心概念和优势，同时引入了 Vue 3 的最新特性，如组合式 API（Composition API）和 TypeScript 支持，使得开发体验更加现代化和高效。

Nuxt 3 提供了一套完整的文件结构，使得项目的组织更加清晰，同时也内置了许多功能，如代码分割、静态站点生成、中间件支持等，帮助开发者快速启动和构建高质量的应用程序。

#### Nuxt 3 与 Nuxt 2 的区别

1. **基于 Vue 3**：Nuxt 3 完全基于 Vue 3 构建而成，这意味着它可以利用 Vue 3 的所有新特性和性能改进，如更快的状态更新、更好的类型支持等。

2. **组合式 API**：Nuxt 3 支持使用 Vue 3 的组合式 API，这使得代码更加模块化和可重用，同时也提高了开发效率。

3. **TypeScript 支持**：Nuxt 3 提供了内置的 TypeScript 支持，使得类型检查和代码提示更加完善，有助于提高代码质量和减少错误。

4. **新的配置系统**：Nuxt 3 引入了一个新的配置系统，使得配置更加灵活和模块化。

5. **改进的构建和部署流程**：Nuxt 3 优化了构建和部署流程，提供了更快的构建速度和更简单的部署步骤。

6. **实验性特性**：Nuxt 3 引入了一些实验性特性，如基于文件的路由系统，使得路由定义更加直观和简单。

#### 为什么选择 Nuxt 3

1. **现代化的开发体验**：Nuxt 3 集成了 Vue 3 的最新特性，提供了更加现代化的开发体验。

2. **性能优化**：Nuxt 3 利用 Vue 3 的性能优势，提供了更快的渲染速度和更高效的代码执行。

3. **清晰的文件结构**：Nuxt 3 的文件结构设计清晰，有助于项目管理和代码维护。

4. **丰富的功能集**：Nuxt 3 内置了许多功能，如代码分割、静态站点生成、中间件支持等，减少了开发者的重复工作。

5. **社区支持**：Nuxt 社区活跃，提供了大量的插件和主题，可以帮助开发者快速构建应用程序。

6. **易于扩展**：Nuxt 3 的模块化设计使得应用程序易于扩展，开发者可以根据需要添加新的功能。

选择 Nuxt 3，开发者可以享受到一个高效、灵活且功能丰富的框架，从而更加专注于业务逻辑的开发，而不是框架本身的配置和实现。

### 第二章：安装与配置

#### 环境准备

在开始使用 Nuxt 3 之前，确保你的开发环境满足以下要求：

1. **Node.js**：Nuxt 3 需要 Node.js 14.17.0 或更高版本。你可以从[Node.js 官方网站](https://nodejs.org/)下载并安装。
1. **npm 或 yarn**：Node.js 包管理器，npm 是默认的，但 yarn 也可以用于管理依赖。确保已安装其中之一。
1. **Git**：版本控制系统，用于管理代码仓库。
1. **文本编辑器/IDE**：推荐使用支持 Vue 3 的编辑器，如 Visual Studio Code、IntelliJ IDEA 或 WebStorm。

#### 创建 Nuxt 3 项目

1. **使用 CLI**：在命令行中，运行以下命令来创建一个新的 Nuxt 3 项目：

   ```
   npx create-nuxt-app my-project
   
   ```

   这将创建一个名为`my-project`的新目录，其中包含初始的 Nuxt 3 项目结构。

1. **选择预设**：如果`create-nuxt-app`提示，可以选择使用预设（如`@nuxtjs/kit`或`@nuxtjs/next`
   ），根据项目需求选择。默认情况下，`@nuxtjs/kit`适用于 SSR 项目，而`@nuxtjs/next`适用于 Next.js 集成。

#### 项目结构概览

Nuxt 3 项目的基本结构如下：

- **`my-project`**(项目根目录)：

    - **`pages`**：包含应用程序的路由页面，每个文件夹代表一个路由层级，如`pages/index.vue`。
    - **`components`**：全局复用的 Vue 组件。
    - **`layouts`**：定义页面布局，如基础布局、分页布局等。
    - **`store`**：Vuex 状态管理。
    - **`scripts`**：包含全局脚本，如公共模块。
    - **`styles`**：全局样式，可以使用 CSS、SCSS、SASS 等。
    - **`.nuxt`**：Nuxt 3 的内部目录，包含构建相关的文件和配置。
    - **`package.json`**：项目依赖和配置。
    - **`nuxt.config.js`**：核心配置文件，定义项目设置和构建选项。

### 第三章：Nuxt 3 路由基础

#### 路由概念

在 Nuxt 3 中，路由是用于定义应用程序中不同页面之间导航的方式。Nuxt 3
基于文件系统自动生成路由配置，这意味着你不需要手动编写路由定义，只需按照约定在`pages`目录下创建对应的`.vue`文件即可。

#### Nuxt 3 路由配置

Nuxt 3 会根据`pages`目录中的文件结构自动生成路由配置。以下是一些基本的路由配置示例：

- 对于`pages/index.vue`，Nuxt 会生成根路由`/`。
- 对于`pages/about.vue`，Nuxt 会生成`/about`路由。
- 对于`pages/user/_id.vue`，Nuxt 会生成一个动态路由`/user/:id`。

如果需要自定义路由配置，可以在`nuxt.config.js`文件中通过`router`选项进行设置。

#### 动态路由

动态路由允许你创建基于参数的路由。在 Nuxt 3 中，动态路由通过在文件名中使用下划线`_`前缀来定义。以下是一个动态路由的例子：

- 文件夹结构：`pages/user/_id.vue`
- 自动生成的路由：`/user/:id`
- 在组件中访问参数：`this.$route.params.id`

动态路由可以嵌套使用，例如`pages/user/_id/post/_postId.vue`会生成`/user/:id/post/:postId`的路由。

#### 嵌套路由

嵌套路由（也称为二级路由）允许你在页面中嵌套其他页面或组件。在 Nuxt 3 中，你可以通过在`pages`目录中创建子目录来定义嵌套路由。

以下是一个嵌套路由的例子：

- 文件夹结构：`pages/user/index.vue`和`pages/user/profile.vue`

- 自动生成的路由：

    - `/user`对应`pages/user/index.vue`
    - `/user/profile`对应`pages/user/profile.vue`

如果需要在页面中定义嵌套路由，可以在页面组件中通过`<router-view>`标签来指定路由出口。例如，在`pages/user/index.vue`
中，你可以这样定义嵌套路由：

```
<template>
  <div>
    <router-view></router-view> <!-- 嵌套路由出口 -->
  </div>
</template>
```

在`nuxt.config.js`中，你也可以使用`extendRoutes`方法来扩展或修改路由配置，实现更复杂的路由逻辑。

### 第四章：路由中间件

#### 中间件的作用

在 Nuxt 3 中，路由中间件允许你在处理路由之前执行一些代码，这些代码可以是验证、权限检查、日志记录等。中间件可以用来确保只有满足特定条件的用户才能访问某些页面，或者在用户访问页面之前执行一些预处理操作。

#### 编写自定义中间件

在 Nuxt 3 中，你可以通过在`middleware`目录下创建`.js`
文件来编写自定义中间件。每个文件都会被自动注册为一个中间件。中间件函数接收一个`context`对象，你可以通过这个对象访问路由信息、请求和响应等。

以下是一个简单的中间件示例：

```
// middleware/auth.js
export default function (context) {
  if (!context.store.getters.isAuthenticated) {
    context.redirect('/login')
  }
}

```

在这个例子中，如果用户未认证，中间件会将用户重定向到登录页面。

#### 全局中间件与局部中间件

- **全局中间件**：全局中间件会在每个路由之前执行。要定义全局中间件，只需将中间件文件放在`middleware`目录下，Nuxt 3
  会自动将其应用于所有路由。
- **局部中间件**：局部中间件只应用于特定的页面。你可以在`pages`目录下的`.vue`文件中通过`middleware`属性指定要使用的中间件。

例如，在`pages/user/_id.vue`中使用局部中间件：

```
<script>
export default {
  middleware: 'auth', // 使用名为 'auth' 的中间件
}
</script>
```

在这个例子中，`auth`中间件只会在访问`/user/:id`路由时执行。

通过合理使用路由中间件，你可以增强 Nuxt 3 应用程序的安全性和用户体验，确保只有授权用户可以访问敏感页面，并在用户访问页面之前执行必要的预处理操作。

### 第五章：页面布局与导航

#### 布局组件

在 Nuxt 3 中，你可以使用布局组件来定义应用程序的布局结构。布局组件是一种特殊的 Vue
组件，用于包裹应用程序的其余部分。通常，你可以在`layouts`目录下创建布局组件。

以下是一个简单的布局组件示例：

```
<!-- layouts/default.vue -->
<template>
  <div>
    <header>
      <nav>
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/about">About</NuxtLink>
      </nav>
    </header>
    <main>
      <slot />
    </main>
    <footer>
      <p>right © 2023 My App</p>
    </footer>
  </div>
</template>
```

在这个例子中，我们创建了一个名为`default`的布局组件，它包含一个头部、主体和页脚。在页面中，你可以使用`layout`属性来指定要使用的布局组件。

#### 导航链接

在 Nuxt 3 中，你可以使用`<NuxtLink>`组件来创建导航链接。`<NuxtLink>`组件是一个特殊的 Vue 组件，用于在不刷新整个页面的情况下在不同页面之间进行导航。

以下是一个简单的导航链接示例：

```
<template>
  <div>
    <NuxtLink to="/">Home</NuxtLink>
    <NuxtLink to="/about">About</NuxtLink>
  </div>
</template>
```

在这个例子中，我们创建了两个导航链接，用户可以点击这些链接在不同页面之间进行导航。

#### 页面过渡效果

在 Nuxt 3 中，你可以使用页面过渡效果来增强用户体验。页面过渡效果可以让用户在导航不同页面时感受到流畅的过渡动画。

你可以在`nuxt.config.ts`文件中配置页面过渡效果，如下所示：

```
// nuxt.config.ts
export default defineNuxtConfig({
  pageTransition: {
    name: 'page',
    mode: 'out-in',
    appear: true,
    css: false,
    beforeEnter(el) {
      el.style.opacity = 0
    },
    enter(el, done) {
      const animation = el.animate(
        [
          { opacity: 0 },
          { opacity: 1 },
        ],
        {
          duration: 500,
          easing: 'ease-in-out',
        }
      )

      animation.onfinish = () => {
        done()
      }
    },
    leave(el, done) {
      const animation = el.animate(
        [
          { opacity: 1 },
          { opacity: 0 },
        ],
        {
          duration: 500,
          easing: 'ease-in-out',
        }
      )

      animation.onfinish = () => {
        done()
      }
    },
  },
})

```

在这个例子中，我们配置了一个名为`page`的页面过渡效果，它使用了一个简单的淡入淡出动画。你可以根据需要自定义页面过渡效果。

### 第六章：高级路由技巧

在Vue和Nuxt中，路由不仅仅是导航那么简单，它们还允许我们执行更复杂的操作，比如在页面渲染前获取数据、处理错误页面以及保护路由等。

#### 异步数据获取

在Vue中，可以使用组件的生命周期钩子如`created`、`mounted`来获取数据。但在Nuxt中，推荐使用`asyncData`
方法来在服务器端渲染（SSR）之前获取数据，这样可以在页面加载前就获取到数据，提高首屏加载速度。

以下是一个使用`asyncData`的例子：

```
<template>
  <div>
    <h1>文章详情</h1>
    <p>{{ article.title }}</p>
    <p>{{ article.content }}</p>
  </div>
</template>

<script>
export default {
  async asyncData({ params, $http }) {
    const response = await $http.get(`/api/articles/${params.id}`);
    return {
      article: response.data
    };
  }
}
</script>
```

在这个例子中，`asyncData`方法在服务器端被调用，通过HTTP请求获取与路由参数`id`对应的文章数据。

#### 错误页面处理

在Nuxt中，可以创建专门的错误页面来处理客户端和服务器端错误。例如，可以创建一个`error.vue`页面来显示错误信息。

以下是一个简单的错误页面示例：

```
<template>
  <div>
    <h1>发生错误</h1>
    <p>抱歉，页面无法加载。</p>
    <p>错误代码：{{ error.statusCode }}</p>
  </div>
</template>

<script>
export default {
  props: ['error'],
}
</script>
```

当Nuxt遇到错误时，如404或500错误，它会自动渲染这个`error.vue`页面，并将错误对象作为属性传递给组件。

#### 路由守卫

路由守卫是Vue Router提供的一个功能，允许我们在导航发生前后执行代码。在Nuxt中，可以使用全局守卫、路由独享守卫和组件内守卫。

- **全局前置守卫**：使用`router.beforeEach`注册，例如用于检查用户权限。

```
export default {
  setup() {
    const router = useRouter();
    
    router.beforeEach((to, from, next) => {
      if (to.matched.some(record => record.meta.requiresAuth)) {
        // 检查用户是否已认证
        if (!isUserAuthenticated()) {
          next('/login');
        } else {
          next();
        }
      } else {
        next();
      }
    });
  }
}

```

- **路由独享守卫**：在路由配置中使用`beforeEnter`。

```
export default {
  routes: [
    {
      path: '/profile',
      component: ProfilePage,
      beforeEnter: (to, from, next) => {
        // 独享守卫逻辑
      }
    }
  ]
}

```

- **组件内守卫**：在组件内部定义，如`beforeRouteEnter`、`beforeRouteUpdate`、`beforeRouteLeave`。

```
<template>
  <div>...</div>
</template>

<script>
export default {
  beforeRouteEnter(to, from, next) {
    // 进入组件之前
  },
  beforeRouteUpdate(to, from, next) {
    // 路由参数变化时
  },
  beforeRouteLeave(to, from, next) {
    // 离开组件之前
  }
}
</script>
```

使用路由守卫，你可以执行如权限验证、页面访问控制等操作。

### 第七章：实战案例分析

#### 博客系统路由设计

在设计博客系统的路由时，需要考虑博客文章的展示、分类、标签、搜索、分页等功能。以下是一个简单的博客系统路由设计示例：

```
export default {
  routes: [
    // 首页
    {
      path: '/',
      name: 'home',
      component: () => import('@/components/Home.vue')
    },
    // 文章列表
    {
      path: '/articles',
      name: 'articles',
      component: () => import('@/components/Articles.vue')
    },
    // 文章详情
    {
      path: '/articles/:id',
      name: 'article-detail',
      component: () => import('@/components/ArticleDetail.vue')
    },
    // 文章分类
    {
      path: '/categories/:category',
      name: 'category',
      component: () => import('@/components/Category.vue')
    },
    // 标签页
    {
      path: '/tags/:tag',
      name: 'tag',
      component: () => import('@/components/Tag.vue')
    },
    // 搜索结果
    {
      path: '/search',
      name: 'search',
      component: () => import('@/components/Search.vue')
    },
    // 404页面
    {
      path: '*',
      name: '404',
      component: () => import('@/components/NotFound.vue')
    }
  ]
}

```

在这个设计中，`:id`、`:category`和`:tag`是动态路由参数，用于获取具体的文章、分类或标签。

#### 电商网站路由设计

电商网站的路由设计需要考虑商品展示、分类、购物车、订单、用户账户等功能。以下是一个电商网站的路由设计示例：

```
export default {
  routes: [
    // 首页
    {
      path: '/',
      name: 'home',
      component: () => import('@/components/Home.vue')
    },
    // 商品分类
    {
      path: '/category/:id',
      name: 'category',
      component: () => import('@/components/Category.vue')
    },
    // 商品详情
    {
      path: '/product/:id',
      name: 'product-detail',
      component: () => import('@/components/ProductDetail.vue')
    },
    // 购物车
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/components/Cart.vue')
    },
    // 订单确认
    {
      path: '/order/confirm',
      name: 'order-confirm',
      component: () => import('@/components/OrderConfirm.vue')
    },
    // 订单列表
    {
      path: '/orders',
      name: 'orders',
      component: () => import('@/components/Orders.vue')
    },
    // 用户账户
    {
      path: '/account',
      name: 'account',
      component: () => import('@/components/Account.vue')
    },
    // 登录/注册
    {
      path: '/login',
      name: 'login',
      component: () => import('@/components/Login.vue')
    },
    // 404页面
    {
      path: '*',
      name: '404',
      component: () => import('@/components/NotFound.vue')
    }
  ]
}

```

在这个设计中，`:id`用于获取具体的商品或分类信息。

#### 多语言支持的路由实现

多语言支持是跨境电商网站的重要特性。以下是一个多语言支持的路由实现示例：

```
export default {
  routes: [
    {
      path: '/:lang',
      component: () => import('@/components/Layout.vue'),
      children: [
        // 首页
        {
          path: '/',
          name: 'home',
          component: () => import('@/components/Home.vue')
        },
        // 其他路由...
      ]
    },
    {
      path: '*',
      name: '404',
      component: () => import('@/components/NotFound.vue')
    }
  ]
}

```

在这个设计中，`:lang`是一个路由参数，用于表示当前页面的语言。例如，`/en`将显示英文版的首页，`/fr`
将显示法文版的首页。通过这种方式，可以为每种语言设置不同的路由和视图。

### 第八章：性能优化与安全

在构建大型应用时，性能和安全是至关重要的因素。在本章中，我们将讨论三个与路由相关的性能优化和安全问题：路由懒加载、路由安全性和性能监控与调试。

#### 路由懒加载

路由懒加载是一种在需要时加载路由组件的技术，可以提高应用的初始加载速度和性能。在路由配置中，可以使用动态导入语法（`import()`
）来实现路由懒加载：

```
const router = new VueRouter({
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/components/Home.vue')
    },
    // 其他路由...
  ]
})

```

在这个示例中，`Home`组件将在访问`/`路径时动态导入和渲染。这意味着在应用启动时，`Home`组件的代码不会被加载，直到用户访问`/`
路径时才会加载。

路由懒加载还可以结合代码分割和按需加载来进一步优化应用性能。

#### 路由安全性

在路由配置中，可以使用`beforeEnter`守卫来实现路由安全性。`beforeEnter`守卫是一个函数，在路由导航被确认之前被调用，可以用于检查用户是否具有访问路由所需的权限。

以下是一个简单的路由安全性示例：

```
const router = new VueRouter({
  routes: [
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/components/Admin.vue'),
      beforeEnter: (to, from, next) => {
        // 检查用户是否登录
        if (isUserLoggedIn()) {
          next()
        } else {
          next('/login')
        }
      }
    },
    // 其他路由...
  ]
})

```

在这个示例中，`beforeEnter`守卫检查用户是否登录，如果用户未登录，则会重定向到登录页面。

#### 性能监控与调试

在开发过程中，可以使用浏览器的开发工具和性能分析工具来监控和调试应用的性能。

在Chrome开发工具中，可以使用“性能”面板来记录和分析应用的性能数据，包括页面加载时间、CPU使用率、内存使用率和布局抖动等指标。

在Vue应用中，可以使用`performance.mark()`和`performance.measure()`API来记录和分析应用的性能数据。以下是一个简单的性能监控示例：

```
const router = new VueRouter({
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/components/Home.vue'),
      beforeRouteEnter: (to, from, next) => {
        performance.mark('beforeRouteEnter')
        next(() => {
          performance.measure('beforeRouteEnter', 'beforeRouteEnter')
        })
      }
    },
    // 其他路由...
  ]
})

```

在这个示例中，`beforeRouteEnter`生命周期钩子记录了一个名为`beforeRouteEnter`
的标记，并在路由导航被确认后记录了一个名为`beforeRouteEnter`的度量。这些数据可以在Chrome开发工具中的“性能”面板中查看和分析。



余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

### 往期文章推荐：

- [Nuxt 3组件开发与管理 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-19/front_end/nuxt%203%E7%BB%84%E4%BB%B6%E5%BC%80%E5%8F%91%E4%B8%8E%E7%AE%A1%E7%90%86/)
- [Nuxt.js 深入浅出：目录结构与文件组织详解 | cmdragon’s Blog**](https://www.cmdragon.cn/2024-06-17/front_end/nuxt.js%20%E6%B7%B1%E5%85%A5%E6%B5%85%E5%87%BA%EF%BC%9A%E7%9B%AE%E5%BD%95%E7%BB%93%E6%9E%84%E4%B8%8E%E6%96%87%E4%BB%B6%E7%BB%84%E7%BB%87%E8%AF%A6%E8%A7%A3/)
- [友情链接 | cmdragon’s Blog**](https://www.cmdragon.cn/links/)
- [安装 Nuxt.js 的步骤和注意事项 | cmdragon’s Blog**](https://www.cmdragon.cn/2024-06-16/front_end/%E5%AE%89%E8%A3%85%20nuxt.js%20%E7%9A%84%E6%AD%A5%E9%AA%A4%E5%92%8C%E6%B3%A8%E6%84%8F%E4%BA%8B%E9%A1%B9/)
- [探索Web Components | cmdragon’s Blog**](https://www.cmdragon.cn/2024-06-15/front_end/%E6%8E%A2%E7%B4%A2web%20components/)
- [Vue微前端架构与Qiankun实践理论指南 | cmdragon’s Blog**](https://www.cmdragon.cn/2024-06-14/front_end/vue%E5%BE%AE%E5%89%8D%E7%AB%AF%E6%9E%B6%E6%9E%84%E4%B8%8Eqiankun%E5%AE%9E%E8%B7%B5%E7%90%86%E8%AE%BA%E6%8C%87%E5%8D%97/)
- [Vue 3深度探索：自定义渲染器与服务端渲染 | cmdragon’s Blog**](https://www.cmdragon.cn/2024-06-13/front_end/vue%203%E6%B7%B1%E5%BA%A6%E6%8E%A2%E7%B4%A2%EF%BC%9A%E8%87%AA%E5%AE%9A%E4%B9%89%E6%B8%B2%E6%9F%93%E5%99%A8%E4%B8%8E%E6%9C%8D%E5%8A%A1%E7%AB%AF%E6%B8%B2%E6%9F%93/)
- [Tailwind CSS 响应式设计实战指南 | cmdragon’s Blog**](https://www.cmdragon.cn/2024-06-12/front_end/tailwind%20css%20%E5%93%8D%E5%BA%94%E5%BC%8F%E8%AE%BE%E8%AE%A1%E5%AE%9E%E6%88%98%E6%8C%87%E5%8D%97/)
- [Tailwind CSS 实战指南：快速构建响应式网页设计 | cmdragon’s Blog**](https://www.cmdragon.cn/2024-06-11/front_end/tailwind%20css%20%E5%AE%9E%E6%88%98%E6%8C%87%E5%8D%97%EF%BC%9A%E5%BF%AB%E9%80%9F%E6%9E%84%E5%BB%BA%E5%93%8D%E5%BA%94%E5%BC%8F%E7%BD%91%E9%A1%B5%E8%AE%BE%E8%AE%A1/)
- [Vue 3与ESLint、Prettier：构建规范化的前端开发环境 | cmdragon’s Blog**](https://www.cmdragon.cn/2024-06-10/front_end/vue%203%E4%B8%8Eeslint%E3%80%81prettier%EF%BC%9A%E6%9E%84%E5%BB%BA%E8%A7%84%E8%8C%83%E5%8C%96%E7%9A%84%E5%89%8D%E7%AB%AF%E5%BC%80%E5%8F%91%E7%8E%AF%E5%A2%83/)
- [Vue TypeScript 实战：掌握静态类型编程 | cmdragon’s Blog**](https://www.cmdragon.cn/2024-06-09/front_end/vue%20typescript%20%E5%AE%9E%E6%88%98%EF%BC%9A%E6%8E%8C%E6%8F%A1%E9%9D%99%E6%80%81%E7%B1%BB%E5%9E%8B%E7%BC%96%E7%A8%8B/)
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
