---
url: /posts/1bc94247adf6eba156f12ce9810503fa/
title: Vue CLI 4与项目构建实战指南
date: 2024-06-09T00:18:53+08:00
updated: 2024-06-09T00:18:53+08:00

summary:
   这篇文章介绍了如何使用Vue CLI优化项目构建配置，提高开发效率，涉及配置管理、项目部署策略、插件系统定制以及Webpack和TypeScript的深度集成技巧。

categories:
   - 前端开发

tags:
   - Vue CLI
   - 优化构建
   - 配置管理
   - 项目部署
   - 插件系统
   - Webpack
   - TypeScript集成
---


<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_06_09 01_13_22.png" title="2024_06_09 01_13_22.png" alt="2024_06_09 01_13_22.png"/>


### 第一部分：Vue CLI 4入门

#### 第1章 Vue CLI概述

**Vue CLI的作用和优势**

Vue CLI（Vue.js Command Line Interface）是官方提供的一个标准工具，用于快速搭建Vue项目架构。它具有以下作用和优势：

- **标准化开发流程**：Vue CLI提供了一套标准的开发流程和项目结构，有助于团队协作和项目维护。
- **快速原型开发**：通过Vue CLI可以快速创建项目原型，提高开发效率。
- **丰富的插件生态**：Vue CLI拥有丰富的插件，可以轻松集成各种功能，如路由、状态管理、打包优化等。
- **易于定制和扩展**：Vue CLI支持对构建配置的深度定制，满足不同项目的需求。

**Vue CLI的发展历程**

Vue CLI自Vue.js诞生以来，就作为官方推荐的脚手架工具，随着Vue.js的发展而不断迭代。从最初的Vue CLI 2到Vue CLI 3，再到现在的Vue
CLI 4，它一直在优化项目结构和构建配置，提高开发效率和用户体验。

**Vue CLI 4的主要特性**

Vue CLI 4带来了以下主要特性：

- **更快的构建速度**：利用Webpack 4和缓存优化，提高构建速度。
- **零配置**：默认配置即可满足大多数项目的需求，无需额外配置。
- **插件系统**：通过插件系统，可以轻松集成Vue Router、Vuex等Vue生态系统中的其他工具。
- **图形化界面**：提供了Vue UI，一个图形化的管理界面，用于创建和管理项目。

#### 第2章 环境准备与安装

**Node.js和npm的安装与配置**
Vue CLI 4需要Node.js环境，因此首先需要安装Node.js。Node.js通常与npm（node package manager）一同安装。可以从
[cmdragon's Blog](https://cmdragon.cn)  [Node.js官网](https://nodejs.org/)下载并安装最新版本的Node.js。

- 确保安装Node.js版本在12以上。
- 安装完成后，在命令行中执行`node -v`和`npm -v`，检查安装是否成功。

**Vue CLI 4的安装**

Vue CLI 4可以通过npm全局安装：

```
npm install -g @vue/cli
# 或者
yarn global add @vue/cli

```

**Vue CLI 4的升级**

如果需要升级Vue CLI 4到最新版本，可以使用以下命令：

```
npm update -g @vue/cli
# 或者
yarn global upgrade --latest @vue/cli

```

#### 第3章 创建和管理Vue项目

**使用Vue CLI 4创建新项目**

使用Vue CLI 4创建新项目，可以执行以下命令：

```
vue create project-name

```

在命令执行过程中，CLI会提供一系列选项，包括预设配置、Vue版本选择、添加插件等。

**项目的目录结构和文件解释**

Vue CLI 4创建的项目具有以下目录结构：

```
project-name/
│
├── node_modules/ # 项目依赖
├── public/        # 公共文件，如index.html
│   └── index.html
├── src/           # 源代码目录
│   ├── assets/    # 静态资源
│   ├── components/ # Vue组件
│   ├── App.vue    # 根组件
│   └── main.js    # 入口文件
├── .gitignore     # Git忽略文件
├── babel.config.js # Babel配置文件
├── package.json   # 项目配置文件
└── vue.config.js  # Vue项目配置文件

```

**项目的配置和管理**

项目的配置主要通过`vue.config.js`
文件进行。该文件提供了对Webpack配置的细粒度控制。此外，还可以通过环境变量来控制不同环境下的项目配置。项目的管理主要包括项目的启动、构建和测试等，这些都可以通过`package.json`
中的scripts字段来配置。
AD：[等你探索](https://movie.cmdragon.cn/)

### 第二部分：Vue CLI 4高级配置

#### 第4章 个性化项目配置

**修改项目配置文件（vue.config.js）**

`vue.config.js`是Vue CLI项目的可选配置文件，如果项目的构建系统和webpack配置满足你的需求，那么你不需要这个文件。但如果需要自定义配置，可以通过这个文件来修改。

例如，以下是一个简单的`vue.config.js`文件，它修改了基本的webpack配置：

```js
module.exports = {
  // 基本路径
  publicPath: process.env.NODE_ENV === 'production' ? '/production-sub-path/' : '/',
  // 构建时的输出目录
  outputDir: 'dist',
  // 放置静态资源的目录
  assetsDir: 'static',
  // html的输出路径
  indexPath: 'index.html',
  // 文件名哈希
  filenameHashing: true,
  // eslint-loader 是否在保存的时候检查
  lintOnSave: process.env.NODE_ENV !== 'production',

  // 是否使用包含运行时编译器的Vue核心的构建
  runtimeCompiler: false,

  // 默认情况下 babel-loader 忽略其中的所有文件 node_modules
  transpileDependencies: [],

  // 生产环境 sourceMap
  productionSourceMap: false,

  // 跨域设置
  devServer: {
    open: process.platform === 'darwin',
    host: '0.0.0.0',
    port: 8080,
    https: false,
    hotOnly: false,
    proxy: null // 设置代理
  },

  // webpack配置 - 简单配置方式
  configureWebpack: {
    // 插件等配置
  },

  // webpack配置 - 链式配置方式
  chainWebpack: (config) => {
    // 链式配置
  }
};

```

**链接Webpack配置（chainWebpack）**

Vue CLI 4推荐使用`chainWebpack`方法来修改Webpack配置，这是一个链式调用方法，可以更精细地控制Webpack配置。

```js
chainWebpack: (config) => {
  // 修改loader
  config.module
    .rule('vue')
    .use('vue-loader')
    .loader('vue-loader/lib/loader.js')
    .tap(options => {
      // 修改选项...
      return options;
    });

  // 添加插件
  config.plugin('example').use(ExamplePlugin, [/* options */]);
}

```

**插件的使用和自定义**

Vue CLI 4允许通过`vue.config.js`文件中的`plugins`选项来添加自定义插件。

```js
const ExamplePlugin = require('example-webpack-plugin');

module.exports = {
  // ...其他配置
  plugins: [
    new ExamplePlugin({
      // 插件选项
    })
  ]
};

```

#### 第5章 构建优化

**代码分割和懒加载**

Vue CLI 4支持动态导入，这可以让你的应用实现代码分割和懒加载。
AD：[享受无干扰的沉浸式阅读之旅](https://comic.cmdragon.cn/)

```
// 示例：动态导入组件
const MyComponent = () => import('./MyComponent.vue');

```

**Tree-shaking和依赖优化**

Webpack 4支持tree-shaking，可以帮助你去除未使用的代码。在`vue.config.js`中，可以通过配置来启用这项功能。

```js
module.exports = {
  // ...其他配置
  configureWebpack: {
    optimization: {
      usedExports: true,
    },
  },
};

```

**使用CDN加速项目加载**

在`vue.config.js`中，可以配置外部链接来使用CDN。

```js
module.exports = {
  // ...其他配置
  configureWebpack: {
    externals: {
      vue: 'Vue',
      'vue-router': 'VueRouter',
      vuex: 'Vuex',
      // ...其他库
    },
  },
};

```

在HTML模板中，通过`<script>`和`<link>`标签引入CDN资源。

#### 第6章 多环境配置

**开发环境、测试环境和生产环境的配置**

Vue CLI 4支持通过`.env`文件来配置不同环境的环境变量。例如：

```
// .env.development
VUE_APP_API_URL=http://localhost:3000/api

// .env.production
VUE_APP_API_URL=https://production-api.com/api

```

在`package.json`中，可以定义不同的启动和构建命令：

```
{
  "scripts": {
    "serve": "vue-cli-service serve",
    "build": "vue-cli-service build",
    "build:prod": "vue-cli-service build --mode production",
    "build:test": "vue-cli-service build --mode test"
  }
}

```

**环境变量的使用**

环境变量可以通过`process.env`在代码中访问。Vue CLI会自动加载以`VUE_APP_`开头的环境变量到客户端侧的代码中。

**构建命令的定制**

Vue CLI 允许你自定义构建命令，以适应不同的构建需求。你可以通过修改`package.json`中的`scripts`字段来达到这个目的。

例如，你可能想要创建一个特定的构建命令来构建生产环境的版本，并且使用一个特定的配置文件：

```
{
  "scripts": {
    "build": "vue-cli-service build",
    "build:prod": "vue-cli-service build --mode production --config vue.config.prod.js"
  }
}

```

在上面的例子中，`build:prod`命令会使用生产环境的模式 (`--mode production`)
并指定一个特定的配置文件 (`--config vue.config.prod.js`) 来进行构建。

此外，你还可以创建自定义的启动命令，以便在不同的开发环境中使用：

```
{
  "scripts": {
    "serve": "vue-cli-service serve",
    "serve:mock": "vue-cli-service serve --mode mock --config vue.config.mock.js"
  }
}

```

在这里，`serve:mock`命令会使用模拟数据的环境 (`--mode mock`) 并指定一个模拟数据的配置文件 (`--config vue.config.mock.js`)
来启动开发服务器。

**总结**

Vue CLI 4 提供了强大的配置选项，允许开发者根据具体需求定制化项目配置。通过`vue.config.js`文件，你可以修改 Webpack
配置、定义环境变量、使用插件以及优化构建过程。同时，CLI 也支持多环境配置，使得开发者能够更容易地管理不同环境下的项目设置。掌握这些高级配置技巧，可以帮助开发者更高效地开发和管理
Vue 项目。
AD：[覆盖广泛主题工具可供使用](https://toolkit.cmdragon.cn/)

### 第三部分：项目构建与部署

### 第7章 项目构建流程

#### 7.1 构建命令的使用

在 Vue CLI 项目中，构建命令通常指的是用来编译和打包项目文件的命令。Vue CLI 提供了以下常用的构建命令：

- `vue-cli-service build`：这是默认的构建命令，用于构建生产环境的代码。它将编译源码并生成`dist`目录，其中包含了压缩后的静态文件。
- `vue-cli-service serve`：这个命令用于启动开发服务器，通常在开发阶段使用。

#### 7.2 项目的编译和打包

项目的编译和打包通常指的是将`.vue`文件和其他资源文件（如 JavaScript、CSS、图片等）转换成浏览器可以理解的静态文件的过程。Vue
CLI 使用 Webpack 来处理这一过程，以下是编译和打包的基本步骤：

1. **依赖安装**：确保所有项目依赖都已正确安装。
2. **配置检查**：检查`vue.config.js`文件中的配置是否正确。
3. **编译**：Webpack 开始编译源码，将`.vue`文件编译成 JavaScript 代码，同时处理 CSS 预处理器、图片等资源。
4. **打包**：编译后的代码和资源被打包成一个或多个 bundle 文件。
5. **优化**：Webpack 会进行代码分割、压缩等优化操作。
6. **输出**：最终生成的静态文件被放置在`dist`目录下。

#### 7.3 热重载和监控

热重载（Hot Module Replacement，HMR）是 Vue CLI 提供的一个功能，它可以在不刷新整个页面的情况下，通过替换更新的模块来实现实时预览更新。使用
Vue CLI 的`vue-cli-service serve`命令启动开发服务器时，默认就开启了热重载功能。

监控通常指的是对构建过程的监控，Vue CLI 提供了详细的构建日志和进度指示，以便开发者了解构建过程的状态。

### 第8章 部署与自动化

#### 8.1 静态资源的部署

静态资源的部署通常涉及到将构建后的`dist`目录中的文件上传到服务器或 CDN。以下是一些常见的部署方式：

- **FTP**：使用 FTP 将文件上传到服务器。
- **SCP**：使用 SCP 命令通过 SSH 将文件复制到服务器。
- **CDN**：将文件上传到 CDN 提供商，然后通过 CDN 分发到用户。

#### 8.2 CI/CD流程的集成

持续集成（CI）和持续部署（CD）是现代软件开发的重要组成部分。集成 Vue CLI 项目到 CI/CD 流程通常涉及以下步骤：

1. **代码提交**：当代码被提交到版本控制系统时，CI 流程被触发。
2. **自动化测试**：运行自动化测试来验证代码更改。
3. **构建**：执行构建命令，生成生产环境的代码。
4. **部署**：将构建后的代码部署到生产环境或测试环境。

#### 8.3 自动化部署脚本编写

自动化部署脚本可以帮助开发者自动化部署过程。以下是一个简单的自动化部署脚本的示例，使用 SSH 和 SCP 命令将文件部署到远程服务器：

```
#!/bin/bash

# 服务器配置
SERVER_IP="123.45.67.89"
SERVER_USER="username"
SERVER_PATH="/var/www/html"

# 本地构建目录
BUILD_PATH="./dist"

# 构建项目
npm run build

# 使用 SSH 连接到服务器，并使用 SCP 部署文件
scp -r $BUILD_PATH/* $SERVER_USER@$SERVER_IP:$SERVER_PATH

echo "部署完成"

```

这个脚本首先定义了服务器的 IP 地址、用户名和路径，然后构建项目，最后通过 SCP
将构建后的文件上传到服务器指定目录。在实际使用中，需要根据具体的服务器配置和项目需求来编写脚本。

### 第9章 商城项目实战

#### 9.1 项目需求分析和设计

在开始一个商城项目之前，需要进行详细的需求分析和设计。以下是一些关键步骤：

- **需求收集**：与客户沟通，了解商城的基本功能，如商品展示、购物车、订单管理、支付接口等。
- **功能规划**：根据需求确定功能模块，如用户模块、商品模块、订单模块等。
- **界面设计**：设计用户界面，包括首页、商品列表、商品详情、购物车页面等。
- **技术选型**：选择合适的技术栈，如前端使用 Vue CLI 4，后端可能使用 Node.js、Express、MongoDB 等。
- **数据库设计**：设计数据库模型，确定数据存储结构。

#### 9.2 使用Vue CLI 4构建项目

使用 Vue CLI 4 创建项目的基本步骤如下：

1. 安装 Vue CLI 4：

   ```
   npm install -g @vue/cli
   
   ```

2. 创建新项目：

   ```
   vue create mall-project
   
   ```

   在创建过程中，可以选择预设配置或手动设置，包括 Vue 版本、添加的插件等。

3. 进入项目并添加所需依赖：

   ```
   cd mall-project
   npm install vue-router vuex axios --save
   
   ```

4. 根据设计图和功能规划，编写前端代码，配置路由和状态管理。

#### 9.3 项目构建和部署

项目开发完成后，需要构建和部署：

1. 构建项目：

   ```
   npm run build
   
   ```

   这将生成`dist`目录，包含了生产环境下的静态文件。

1. 部署到服务器或云平台，可以使用自动化部署脚本或 CI/CD 工具。

### 第10章 企业官网项目实战

#### 10.1 项目需求分析和设计

企业官网的项目需求分析和设计通常包括以下内容：

- **需求调研**：了解企业的业务和目标受众，确定网站需要展示的内容和信息架构。
- **设计风格**：根据企业的品牌形象设计网站的整体风格和布局。
- **功能规划**：确定网站的功能，如公司介绍、产品展示、新闻动态、联系我们等页面。
- **响应式设计**：确保网站在不同设备上都能良好展示。

#### 10.2 使用Vue CLI 4构建项目

构建企业官网的步骤与商城项目类似：

1. 使用 Vue CLI 4 创建项目。
2. 安装必要的依赖，如路由、状态管理、UI 库等。
3. 根据设计图实现页面布局和交互。

#### 10.3 优化和部署

项目完成后，进行优化和部署：

1. **性能优化**：优化图片、代码，减少HTTP请求，使用Webpack的优化功能等。
2. **SEO优化**：确保网站内容对搜索引擎友好，提高搜索排名。
3. **部署**：将构建后的静态文件部署到服务器或云平台，如 Netlify、Vercel 等。
4. **监控和维护**：部署后监控网站性能，定期进行内容更新和维护。

### 附录A Vue CLI 4常见问题解答

#### 常见错误和解决方案

1. **错误：`Error: Invalid or unexpected token`**

    - **解决方案**：通常是语法错误，检查代码中的语法，特别是 JSON 配置文件中是否使用了错误的引号。

2. **错误：`Module not found`**

    - **解决方案**：确保已经正确安装了所有依赖。如果问题仍然存在，尝试删除`node_modules`目录和`package-lock.json`
      文件，然后重新安装依赖。

3. **错误：`Cannot find name 'xxx'`**

    - **解决方案**：检查是否正确导入了所需的模块或组件。

#### 性能优化建议

- **代码分割**：使用动态导入（`import()`）实现代码分割，减少初始加载时间。
- **Tree Shaking**：移除未使用的代码，减少最终构建的文件大小。
- **图片优化**：使用图片压缩工具减小图片文件大小。
- **缓存策略**：合理设置 HTTP 缓存头，利用浏览器缓存。

#### 版本更新和迁移指南

- **备份**：在进行版本更新前，备份当前项目。
- **更新 CLI**：使用`npm update -g @vue/cli`更新 Vue CLI。
- **更新项目**：在项目目录中运行`vue upgrade`。
- **检查配置**：检查项目配置文件，确保兼容新版本。

### 附录B Vue CLI 4插件列表

#### 官方插件介绍

- `@vue/cli-plugin-babel`：Babel 插件，用于转译 JavaScript 代码。
- `@vue/cli-plugin-eslint`：ESLint 插件，用于代码质量和风格检查。
- `@vue/cli-plugin-router`：Vue Router 插件，用于页面路由管理。
- `@vue/cli-plugin Vuex`：Vuex 插件，用于状态管理。

#### 第三方插件推荐

- `vue-cli-plugin-element`：Element UI 插件，用于快速搭建界面。
- `vue-cli-plugin-i18n`：国际化插件，用于多语言支持。
- `vue-cli-plugin-lighthouse`：Lighthouse 插件，用于性能检测。

#### 插件的安装和使用方法

安装插件：

```
vue add plugin-name

```

或在`vue.config.js`中配置：

```js
module.exports = {
  plugins: [
    ['plugin-name', { /* 配置选项 */ }]
  ]
}

```

### 附录C Vue CLI 4配置参考

#### 配置文件的结构和示例

Vue CLI 4 项目通常包含一个`vue.config.js`文件，用于配置项目：

```js
module.exports = {
  // 基本路径
  publicPath: process.env.NODE_ENV === 'production' ? '/production-sub-path/' : '/',
  // 构建时的输出目录
  outputDir: 'dist',
  // 放置静态资源的目录
  assetsDir: 'static',
  // html的输出路径
  indexPath: 'index.html',
  // 文件名哈希
  filenameHashing: true,
  // eslint-loader 是否在保存的时候检查
  lintOnSave: process.env.NODE_ENV !== 'production',
  // 是否使用包含运行时编译器的Vue核心的构建
  runtimeCompiler: false,
  // 默认情况下 babel-loader 忽略其中的所有文件 node_modules
  transpileDependencies: [],
  // 生产环境 sourceMap
  productionSourceMap: false,
  // 跨域设置
  devServer: {
    open: process.platform === 'darwin',
    host: '0.0.0.0',
    port: 8080,
    https: false,
    hotOnly: false,
    proxy: null // 设置代理
  },
  // webpack配置 - 简单配置方式
  configureWebpack: {
    // 插件等配置
  },
  // webpack配置 - 链式配置方式
  chainWebpack: (config) => {
    // 链式配置
  },
  // PWA 插件相关配置
  pwa: {},
  // 第三方插件配置
  pluginOptions: {}
}

```

#### 常用配置项详解

- `publicPath`：设置基础路径，用于部署到非根路径。
- `outputDir`：设置构建输出目录。
- `assetsDir`：设置放置静态资源的目录。
- `indexPath`：设置 HTML 输出路径。
- `filenameHashing`：设置文件名是否包含hash，用于缓存控制。
- `lintOnSave`：设置是否在保存时进行ESLint检查。
- `devServer`：设置开发服务器相关配置。

#### 高级配置技巧

- **链式配置**：使用`chainWebpack`方法进行细粒度的配置。
- **环境变量**：通过 `process.env`访问环境变量，可以在`vue.config.js`中使用环境变量来设置不同的配置。

- **多环境配置**
  ：通过设置不同的环境变量，可以实现开发环境、测试环境和生产环境的配置切换。可以在项目根目录下创建`.env.development`、`.env.test`
  和`.env.production`文件，分别配置不同环境的变量。
- **外部配置文件**：如果配置信息较为复杂，可以将配置抽离到外部的 JSON 或 YAML 文件中，然后在`vue.config.js`中引入。
- **自定义插件**：如果官方插件或第三方插件不能满足需求，可以开发自定义插件。通过`webpack`的插件系统，可以创建具有特定功能的插件。
- **优化构建性能**：通过配置`webpack`的`externals`选项，可以将一些大型库如`lodash`或`moment`等排除在构建之外，减少构建时间。
- **缓存策略**：配置`webpack`的`cache`选项，可以提高构建的缓存命中率，加快构建速度。
- **CSS 相关配置**：通过`css`选项，可以配置 CSS 的相关处理，如提取 CSS 文件、启用 CSS Modules 等。

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
