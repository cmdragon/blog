---
url: /posts/9864ca7da0f35e47de9787f07fc29d2e/
title: Vue Router 4与路由管理实战
date: 2024-06-07T00:18:53+08:00
updated: 2024-06-07T00:18:53+08:00

summary:
  这篇文章介绍了如何在Vue.js应用中利用Vue Router实现单页面应用的路由管理，包括配置路由、导航守卫的使用、路由懒加载以优化性能以及动态路由的实现方法，旨在提升用户体验和应用加载效率

categories:
  - 前端开发

tags:
  - Vue Router
  - 单页面应用
  - 路由管理
  - 导航守卫
  - 路由懒加载
  - 代码分割
  - 动态路由
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_06_07 18_24_06.png" title="2024_06_07 18_24_06.png" alt="2024_06_07 18_24_06.png"/>


## **第1章 Vue Router简介**

### **1.1 Vue Router的概念与作用**

Vue Router 是 Vue.js 的官方路由管理器，它用于构建单页面应用程序（Single Page Application，SPA）。在单页面应用中，页面不会重新加载，而是通过异步请求来更新页面内容。Vue Router 允许我们通过定义路由规则来实现不同页面组件的切换，它提供了一种简洁的、声明式的路由方式，使得页面之间的导航变得简单直观。



Vue Router 的主要作用包括：

-   维护应用的状态，即当前处于哪个路由。
-   为应用提供路由视图，即显示当前路由对应的组件。
-   管理路由之间的切换，包括页面跳转、数据加载等。
-   提供路由守卫，用于在路由切换过程中执行代码，例如权限验证、页面访问日志记录等。

### **1.2 Vue Router的发展历程**

Vue Router 的发展可以分为几个阶段：

-   早期版本：Vue Router 最初是作为 Vue.js 的一个插件出现的，它为 Vue.js 提供了路由功能。
-   Vue Router 2.x：随着 Vue.js 的发展，Vue Router 也在 2016 年发布了 2.0 版本，这个版本支持 Vue 2.x，并引入了许多新特性和改进。
-   Vue Router 3.x：在 Vue 3 发布之前，Vue Router 3.x 版本进行了大量的优化和改进，包括更好的类型支持、异步组件等。
-   Vue Router 4：随着 Vue 3 的发布，Vue Router 4 也随之而来，它完全兼容 Vue 3，并带来了一些重要的新特性和性能优化。[cmdragon's Blog](https://cmdragon.cn)  



### **1.3 Vue Router 4的新特性**

Vue Router 4 带来了以下新特性：

-   兼容 Vue 3：Vue Router 4 专为 Vue 3 设计，与 Vue 3 的组合式 API 完全兼容。
-   更简洁的 API：Vue Router 4 简化了一些 API，使得路由的配置和使用更加直观。
-   更好的类型支持：Vue Router 4 提供了更好的 TypeScript 支持，使得类型检查更加严格和可靠。
-   嵌套路由的改进：Vue Router 4 对嵌套路由进行了优化，使得嵌套路由的配置更加灵活。
-   路由懒加载：Vue Router 4 支持路由懒加载，有助于提高应用的加载速度和性能。
-   更强大的路由守卫：Vue Router 4 提供了更细粒度的路由守卫，使得路由控制更加灵活。

## **第2章 Vue Router 4的安装与配置**

### **2.1 环境搭建**

在开始使用 Vue Router 4 之前，需要确保已经安装了 Node.js 和 npm。然后可以使用 Vue CLI 来创建一个新的 Vue 3 项目，Vue CLI 会自动安装 Vue Router 4。

```
npm install -g @vue/cli
vue create my-vue-router-project

```

### **2.2 安装Vue Router 4**

在创建好的项目中，可以使用 npm 或 yarn 来安装 Vue Router 4。

```
npm install vue-router@4
# 或者
yarn add vue-router@4

```

### **2.3 配置路由表**

在 Vue 3 项目中，通常会在 `src/router` 目录下创建一个 `index.js` 文件来配置路由表。

```js
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import About from '../views/About.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;

```

### **2.4 路由的懒加载**

路由懒加载可以帮助我们将不同路由对应的组件分割成不同的代码块，从而提高应用的加载速度。在 Vue Router 4 中，可以使用动态导入（Dynamic Imports）来实现路由的懒加载。
AD：[等你探索](https://movie.cmdragon.cn/)  

```js
const routes = [
  { 
    path: '/', 
    component: () => import('../views/Home.vue')
  },
  { 
    path: '/about', 
    component: () => import('../views/About.vue')
  }
];

```

## **第3章 路由的基本使用**

### **3.1 定义路由**

定义路由就是创建一个路由表，它由一组路由规则组成，每个规则都定义了一个路径和对应的组件。

```js
const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About }
];
```

### **3.2 路由的跳转与导航**

使用 `<router-link>` 组件进行声明式导航：

```js
<template>
  <router-link to="/">Home</router-link>
  <router-link to="/about">About</router-link>
</template>

```

使用 `router.push` 方法进行编程式导航：

```js
// 在 Vue 组件的 methods 中
methods: {
  navigateToAbout() {
    this.$router.push('/about');
  }
}

```

### **3.3 动态路由匹配**

动态路由允许我们在路由路径中定义参数部分，从而使得一个路由可以匹配多个路径。动态片段用 `:` 来标识。

```js
const routes = [
  // 动态路径参数以冒号 `:` 开头
  { path: '/user/:userId', component: User }
];

```

在组件中可以通过 `$route.params` 访问这些参数：

```js
export default {
  computed: {
    userId() {
      return this.$route.params.userId;
    }
  }
}

```

### **3.4 路由的嵌套**

Vue Router 允许我们嵌套路由，这意味着你可以在路由中定义路由，实现组件的嵌套显示。

```js
const routes = [
  {
    path: '/user/:userId',
    component: User,
    children: [
      // 当 /user/:userId 匹配成功后，会渲染 User 组件，
      // User 组件内部会渲染嵌套的 <router-view>，显示 UserPosts
      {
        path: 'posts',
        component: UserPosts
      },
      // ...其他子路由
    ]
  }
];

```

在 `User` 组件内部，你可以使用 `<router-view>` 来显示子路由匹配到的组件：

```js
<template>
  <div>
    <h2>User {{ userId }}</h2>
    <router-view></router-view> <!-- 子路由匹配到的组件将在这里渲染 -->
  </div>
</template>

```


## **第4章 路由的导航守卫**

### **4.1 导航守卫的概念**

导航守卫是 Vue Router 提供的一种机制，用于在路由发生改变时执行一些逻辑，如权限验证、日志记录等。导航守卫可以控制路由是否允许跳转，以及在跳转前后执行特定的操作。
AD：[享受无干扰的沉浸式阅读之旅](https://comic.cmdragon.cn/)  

### **4.2 全局守卫**

全局守卫作用于整个应用的所有路由。Vue Router 提供了三种全局守卫：

-   `router.beforeEach`：全局前置守卫，在路由切换前被调用。
-   `router.beforeResolve`：全局解析守卫，在导航被确认前，所有组件内守卫和异步路由组件被解析之后调用。
-   `router.afterEach`：全局后置守卫，在路由切换后被调用。

```js
// 注册一个全局前置守卫
router.beforeEach((to, from, next) => {
  // to 和 from 都是路由信息对象
  // next 是一个函数，必须调用它来 resolve 这个钩子
  next(); // 确保一定要调用 next()
});

```

### **4.3 路由独享守卫**

路由独享守卫是在路由配置上直接定义的守卫，只作用于当前路由或嵌套路由。

```js
const routes = [
  {
    path: '/foo',
    component: Foo,
    beforeEnter: (to, from, next) => {
      // 在进入路由前执行的逻辑
      next();
    }
  }
];

```

### **4.4 组件内守卫**

组件内守卫是在组件内部定义的守卫，包括：

-   `beforeRouteEnter`：在路由进入前调用，此时组件实例还未创建。
-   `beforeRouteUpdate`：在当前路由改变，但是该组件被复用时调用。
-   `beforeRouteLeave`：在离开当前路由时调用。

```js
export default {
  beforeRouteEnter(to, from, next) {
    // 在渲染该组件的对应路由被 confirm 前调用
    // 不！能！获取组件实例 `this`
    // 因为当守卫执行前，组件实例还没被创建
    next();
  },
  beforeRouteUpdate(to, from, next) {
    // 在当前路由改变，但是该组件被复用时调用
    // 举例来说，对于 /foo/bar 路由来说，当 /foo/baz 导航时，
    // 由于两个路由都渲染同一个 Foo 组件，因此这个守卫会被调用
    next();
  },
  beforeRouteLeave(to, from, next) {
    // 导航离开该组件的对应路由时调用
    // 可以访问组件实例 `this`
    next();
  }
}

```

## **第5章 路由的懒加载与代码分割**

### **5.1 路由懒加载的概念**

路由懒加载是一种优化技术，它允许我们在需要时才加载路由对应的组件，而不是在应用初始化时就加载所有组件。这可以减少初始加载时间，提高应用性能。
AD：[覆盖广泛主题工具可供使用](https://toolkit.cmdragon.cn/)  

### **5.2 使用 import 语句实现懒加载**

```js
const Foo = () => import('./Foo.vue');

const routes = [
  { path: '/foo', component: Foo }
];

```

### **5.3 使用动态 import 语法实现懒加载**

```js
const routes = [
  {
    path: '/bar',
    component: () => import(/* webpackChunkName: "group-bar" */ './Bar.vue')
  }
];

```

### **5.4 代码分割与优化**

代码分割是一种将代码库分割成小块的技术，这些小块可以在需要时按需加载。这通常通过 Webpack 等打包工具实现，可以显著提高应用的加载速度和性能。

## **第6章 路由的参数传递与数据获取**

### **6.1 路由参数的传递方式**

路由参数可以通过路由路径、查询参数或路由元信息传递。

### **6.2 路由的 query 参数**

查询参数是通过 URL 的查询字符串传递的参数，可以通过 `$route.query` 访问。

```js
const routes = [
  { path: '/search', component: Search }
];

```

在组件中访问：

```js
export default {
  computed: {
    query() {
      return this.$route.query;
    }
  }
}

```

### **6.3 路由的 params 参数**

路径参数是通过路由路径中的动态片段传递的参数，可以通过 `$route.params` 访问。

```js
const routes = [
  { path: '/user/:id', component: User }
];

```

在组件中访问：

```js
export default {
  computed: {
    userId() {
      return this.$route.params.id;
    }
  }
}

```

### **6.4 路由的 meta 字段**

路由元信息是在路由配置中定义的额外信息，可以通过 `$route.meta` 访问。

```js
const routes = [
  {
    path: '/foo',
    component: Foo,
    meta: { requiresAuth: true }
  }
];

```

在守卫中访问：

```js
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

```

### **6.5 数据获取与路由守卫的结合**

在路由守卫中，我们可以结合数据获取逻辑，确保在路由切换前获取到必要的数据。

```js
export default {
  beforeRouteEnter(to, from, next) {
    // 在进入路由前获取数据
    fetchData().then(() => {
      next();
    });
  }
}

```

以上是 Vue Router 高级部分的内容概述，涵盖了导航守卫、路由懒加载、代码分割以及参数传递和数据获取等高级主题。这些内容对于构建复杂、高性能的单页面应用至关重要。


## **第7章 Vue Router 4在项目中的应用**

### **7.1 项目结构规划**

在项目开始时，合理规划项目结构是非常重要的。通常，我们会将路由配置文件、组件、视图等分别放置在不同的目录中，以便于管理和维护。

```js
/src
  /router
    index.js // 路由配置文件
  /views // 视图组件
    Home.vue
    About.vue
  /components // 可复用组件
    Header.vue
    Footer.vue
  App.vue
  main.js

```

### **7.2 路由配置与导航**

在 `index.js` 中配置路由，并使用 `<router-link>` 和 `<router-view>` 进行导航和视图渲染。

```js
import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home.vue';
import About from '@/views/About.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/about',
      name: 'about',
      component: About
    }
  ]
});

```

在 `App.vue` 中使用：

```js
<template>
  <div id="app">
    <router-link to="/">Home</router-link>
    <router-link to="/about">About</router-link>
    <router-view></router-view>
  </div>
</template>

```

### **7.3 路由守卫的应用**

在项目中应用路由守卫，例如使用 `beforeEach` 进行权限验证。

```js
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

```

### **7.4 路由懒加载与代码分割**

使用路由懒加载和代码分割提高应用性能。

```js
const Home = () => import(/* webpackChunkName: "home" */ '@/views/Home.vue');
const About = () => import(/* webpackChunkName: "about" */ '@/views/About.vue');

```

## **第8章 基于角色的动态路由管理**

### **8.1 动态路由的概念**

动态路由允许我们根据用户的角色或权限动态地添加或移除路由。

### **8.2 用户角色与权限管理**

在用户登录后，根据用户的角色或权限信息，动态配置路由。

### **8.3 动态添加路由**

使用 `router.addRoute` 方法动态添加路由。

```js
if (user.role === 'admin') {
  router.addRoute({
    path: '/admin',
    component: Admin,
    meta: { requiresAdmin: true }
  });
}

```

### **8.4 路由守卫与权限验证**

结合路由守卫进行权限验证，确保用户只能访问其权限范围内的路由。

```js
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAdmin && !isAdmin) {
    next('/');
  } else {
    next();
  }
});

```

## **第9章 Vue Router 4与Vuex的结合**

### **9.1 Vuex简介**

Vuex 是一个专为 Vue.js 应用程序开发的状态管理模式。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。

### **9.2 Vuex与Vue Router 4的整合**

在 Vuex 中存储路由状态，如当前路由信息、历史记录等。

```js
// store/index.js
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    currentRoute: null
  },
  mutations: {
    setCurrentRoute(state, route) {
      state.currentRoute = route;
    }
  },
  actions: {
    updateRoute({ commit }, route) {
      commit('setCurrentRoute', route);
    }
  }
});

```

### **9.3 使用Vuex管理路由状态**

在路由守卫中更新 Vuex 状态。

```js
router.beforeEach((to, from, next) => {
  store.dispatch('updateRoute', to);
  next();
});

```

### **9.4 实现路由的面包屑导航**

使用 Vuex 存储的路由状态实现面包屑导航。

```js
<template>
  <div>
    <router-link v-for="route in breadcrumbs" :key="route.path" :to="route.path">
      {{ route.name }}
    </router-link>
  </div>
</template>

<script>
export default {
  computed: {
    breadcrumbs() {
      const currentRoute = this.$store.state.currentRoute;
      // 根据当前路由生成面包屑
      // ...
    }
  }
}
</script>

```

以上内容涵盖了 Vue Router 4 在实际项目中的应用，包括项目结构规划、路由配置、路由守卫、动态路由管理以及与 Vuex 的结合。这些知识点对于构建复杂的前端应用至关重要。



## **附录

### A Vue Router 4 API参考**

Vue Router 4 提供了丰富的 API 用于路由管理。以下是一些核心 API 的简要参考：

1.  `createRouter`: 创建并返回一个路由器实例。

```js
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  // 路由配置数组
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

```

2.  `router.beforeEach`: 全局前置守卫。

```js
router.beforeEach((to, from, next) => {
  // ...
});

```

3.  `router.addRoute`: 动态添加路由。

```js
router.addRoute({
  path: '/new-route',
  component: NewRouteComponent,
});

```

4.  `router.replace`: 替换当前路由。

```js
router.replace('/new-route');

```

5.  `router.push`: 导航到一个新的路由。

```js
router.push('/new-route');

```

6.  `router.go`: 在历史记录中前进或后退。

```js
router.go(-1); // 后退一步
router.go(1); // 前进一步

```

7.  `router.currentRoute`: 当前路由信息。

```js
console.log(router.currentRoute.value); // 当前路由对象

```

8.  `router.resolve`: 解析路由记录。

```js
const resolvedRoute = router.resolve('/path');

```

9.  `router.addRoutes`: 动态添加多个路由。

```js
router.addRoutes([
  // 路由配置数组
]);

```

更多 API 请参考 Vue Router 4 的官方文档。

### B Vue Router 4常见问题解答**

以下是一些 Vue Router 4 使用过程中常见的问题及解答：

1.  如何在 Vue Router 4 中进行路由懒加载？

使用动态导入语法 (`import()`) 实现路由组件的懒加载。

```js
const Home = () => import(/* webpackChunkName: "home" */ './views/Home.vue');

```

2.  如何在 Vue Router 4 中使用路由守卫？

可以在路由配置中使用 `beforeEnter` 守卫，或者在全局范围内使用 `router.beforeEach`。

3.  如何动态添加路由？

使用 `router.addRoute` 方法动态添加路由。

4.  如何在 Vue Router 4 中获取当前路由？

通过 `router.currentRoute` 获取当前路由信息。

5.  如何在 Vue Router 4 中进行路由导航？

使用 `router.push` 或 `router.replace` 进行路由导航。

### C Vue Router 4版本更新日志**

Vue Router 4 的版本更新日志记录了每个版本的更新内容、新特性、改进和修复的 bug。以下是一些主要的更新内容：

-   **4.0.0**: Vue Router 4 的初始版本，与 Vue 3 兼容，引入了新的 API 和改进。
-   **4.0.1**: 修复了一些在 4.0.0 中引入的 bug。
-   **4.x.x**: 随后的版本继续修复 bug、改进性能和增加新的功能。

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
