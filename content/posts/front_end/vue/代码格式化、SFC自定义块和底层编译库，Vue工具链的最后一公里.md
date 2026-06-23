---
url: /posts/u7v8w9x0y1z2a3b4c5d6e7f8a9b0c1d2e3/
title: 代码格式化、SFC自定义块和底层编译库，Vue工具链的最后一公里
date: 2026-06-01T06:00:00+08:00
lastmod: 2026-06-01T06:00:00+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/2026年6月20日 20_35_46.png

summary: Vue 3工具链的最后部分涵盖代码格式化、SFC自定义块集成和底层编译库。本文详解Vue Official和Prettier的格式化、SFC自定义块（如docs块）怎么用、@vue/compiler-sfc、@vitejs/plugin-vue和vue-loader三个底层库的作用。

categories:
  - vue

tags:
  - 基础入门
  - 工具链
  - 格式化
  - Prettier
  - SFC自定义块
  - compiler-sfc
  - vue-loader
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2026年6月20日 20_35_46.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/zh/apps?category=ai_chat

## 一、代码格式化——让代码整整齐齐

写代码这事儿吧，逻辑写对了是一回事，写得好看不好看又是另一回事。你肯定遇到过这种情况：同事提交的代码缩进忽长忽短，引号一会儿单引号一会儿双引号，看一眼血压就上来了。这时候就需要格式化工具出马了，它就像个强迫症患者，把你写的乱七八糟的代码统一整理成规规矩矩的样子。

### Vue Official 插件——开箱即用的格式化

Vue 官方给 VS Code 准备了一个叫 **Vue Official**（以前叫 Volar）的插件，装上之后它就能直接格式化 `.vue` 文件，啥配置都不用做。它对 SFC 里的 `<template>`、`<script>`、`<style>` 三个块都能处理，模板里的标签嵌套、属性顺序、换行规则都给你安排得明明白白。

用它的好处就是省心，跟 Vue 的语法贴合度最高，毕竟是亲儿子嘛。坏处嘛，就是它的格式化规则可配置项相对少一些，团队要是有一套自己的代码风格规范，可能就不够灵活。

### Prettier——灵活多变的格式化老大哥

Prettier 是前端圈子里用得最多的格式化工具之一，它内置了对 Vue SFC 的支持，能识别 `.vue` 文件并分别处理三个块。跟 Vue Official 比起来，Prettier 的可配置项多得吓人，缩进几个空格、用不用分号、单引号还是双引号、行宽多少……全都能调。

打个比方，格式化就像"整理房间"——Vue Official 是个标准化的保洁阿姨，按固定流程给你收拾；Prettier 则是个能听你指挥的收纳师，你说书放哪、衣服挂哪，它都依你。

下面是个典型的 `.prettierrc` 配置文件：

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 100,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always",
  "vueIndentScriptAndStyle": false,
  "endOfLine": "lf"
}
```

逐行解释下这些配置项：

- `semi: true`：语句末尾加分号，C 系语言老习惯了
- `singleQuote: true`：字符串用单引号，省一个字符是省一个
- `tabWidth: 2`：缩进用 2 个空格，前端圈主流配置
- `printWidth: 100`：一行最多 100 个字符，超了就换行
- `trailingComma: "es5"`：在 ES5 支持的地方加尾逗号，方便 git diff
- `bracketSpacing: true`：对象字面量花括号里加空格，`{ foo }` 比 `{foo}` 好看
- `arrowParens: "always"`：箭头函数参数永远加括号，`(x) => x` 而不是 `x => x`
- `vueIndentScriptAndStyle: false`：`<script>` 和 `<style>` 标签内的内容不额外缩进
- `endOfLine: "lf"`：统一用 LF 换行符，避免 Windows 和 Mac 互相打架

### 两种方式咋选

简单说，如果你一个人写小项目，Vue Official 插件就够用了，装上就完事。要是团队协作，或者项目里除了 Vue 还有 React、TypeScript、JSON 啥的，那 Prettier 更合适，一套规则管全部文件。

还有种常见玩法是俩一起用：Vue Official 负责语法高亮、类型检查、智能提示，Prettier 负责格式化。在 VS Code 的 `settings.json` 里这么配：

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.formatOnSave": true
}
```

这样保存文件时 Prettier 就自动出手，把代码收拾得干干净净。

来看个格式化前后的对比，感受下差别。格式化前：

```vue
<template>
  <div class="user-card">
    <h2>{{user.name}}</h2>
    <p v-if="user.email">邮箱：{{user.email}}</p>
    <ul>
      <li v-for="skill in user.skills" v-bind:key="skill.id">{{skill.name}}</li>
    </ul>
  </div>
</template>
<script setup>
import {ref} from 'vue'
const user = ref({name:'张三',email:'zhangsan@example.com',skills:[{id:1,name:'Vue'}]})
</script>
<style scoped>
.user-card{padding:20px;background:#fff;border-radius:8px;}
.user-card h2{color:#333;font-size:18px;}
</style>
```

格式化后（Prettier 处理）：

```vue
<template>
  <div class="user-card">
    <h2>{{ user.name }}</h2>
    <p v-if="user.email">邮箱：{{ user.email }}</p>
    <ul>
      <li v-for="skill in user.skills" v-bind:key="skill.id">{{ skill.name }}</li>
    </ul>
  </div>
</template>
<script setup>
import { ref } from 'vue';

const user = ref({
  name: '张三',
  email: 'zhangsan@example.com',
  skills: [{ id: 1, name: 'Vue' }],
});
</script>
<style scoped>
.user-card {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}

.user-card h2 {
  color: #333;
  font-size: 18px;
}
</style>
```

差别一眼就能看出来：插值表达式里加了空格、对象换行铺开、CSS 规则之间加了空行、语句末尾补了分号。这种代码看着就舒服，review 的时候也省心。

## 二、SFC自定义块——除了template/script/style还能加啥

平时写 `.vue` 文件，咱们都习惯了三大块：`<template>` 写模板、`<script>` 写逻辑、`<style>` 写样式。但你可能不知道，SFC 还能加别的块，名字随你取，这就是所谓的**自定义块（Custom Blocks）**。

### 自定义块是咋回事

SFC 编译器在解析 `.vue` 文件时，遇到不认识的块（不是 template/script/style），不会报错，而是把它当作自定义块处理。编译后，这些自定义块会被转换成对同一 Vue 文件的**不同请求查询**的导入。

啥意思呢？打个比方，自定义块就像 SFC 上的"扩展插槽"——你想加啥就加啥，但加进去的东西能不能用、咋用，得看你的构建工具（Vite、webpack 啥的）配不配合。编译器只负责把块拆出来打成导入请求，具体怎么处理这些请求，是底层工具链的事。

### 常见的自定义块用途

实际项目里，自定义块用得最多的有这么几种：

- **文档块（`<docs>`）**：把组件的文档说明直接写在 `.vue` 文件里，方便维护
- **国际化块（`<i18n>`**：把多语言文案和组件放一起，vue-i18n 就支持这种玩法
- **测试块（`<test>`）**：把单元测试和组件写一块儿
- **路由配置块（`<route>`）**：vue-router 配合 unplugin-vue-router 可以这么玩

来看个 `<docs>` 块的写法：

```vue
<template>
  <button class="btn" :class="`btn-${type}`" @click="handleClick">
    <slot />
  </button>
</template>

<script setup>
// 定义组件的 props，type 控制按钮样式
defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (val) => ['default', 'primary', 'danger'].includes(val),
  },
});

// 定义点击事件
const emit = defineEmits(['click']);
const handleClick = (e) => emit('click', e);
</script>

<style scoped>
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-primary {
  background: #409eff;
  color: #fff;
}
.btn-danger {
  background: #f56c6c;
  color: #fff;
}
</style>

<docs>
# MyButton 按钮组件

一个简单的按钮组件，支持三种样式类型。

## 用法

```vue
<MyButton type="primary">点我</MyButton>
```

## Props

| 参数  | 说明     | 类型   | 可选值                        | 默认值   |
| ----- | -------- | ------ | ----------------------------- | -------- |
| type  | 按钮类型 | String | default / primary / danger    | default |

## Events

| 事件名 | 说明           | 回调参数       |
| ------ | -------------- | -------------- |
| click  | 点击按钮时触发 | MouseEvent     |
</docs>
```

你看，文档直接跟组件代码放一块儿，改组件的时候顺手就把文档改了，不用再开个 `README.md` 来回切。这就是自定义块的魅力——把相关的东西聚到一起。

但要注意，光这么写还不够。如果你直接跑项目，浏览器拿到 `<docs>` 块的导入请求会一脸懵——它不知道这玩意儿咋处理。所以得在构建工具里配置一下，告诉它遇到这种请求该咋办。

## 三、Vite中怎么处理自定义块

用 Vite 的话，处理自定义块得写个 Vite 插件。原理就是拦截自定义块产生的导入请求，把它转换成能跑的 JavaScript 代码。

### 自定义块的处理流程

先看下整个流程是咋走的，心里有个数：

```mermaid
flowchart TD
    A[.vue 文件含自定义块] --> B[@vitejs/plugin-vue 解析 SFC]
    B --> C[自定义块被编译成导入请求<br/>如 MyButton.vue?vue&type=docs]
    C --> D[Vite 插件拦截请求]
    D --> E[插件读取块内容并转换成 JS]
    E --> F[返回可执行的 JS 模块]
    F --> G[应用代码 import 使用]
    
    style A fill:#e1f5fe
    style B fill:#fff3e0
    style C fill:#fff9c4
    style D fill:#f3e5f5
    style E fill:#e8f5e9
    style F fill:#fce4ec
    style G fill:#e0f2f1
```

简单说就是：SFC 编译器把自定义块拆成带查询参数的导入请求 → Vite 插件拦截这个请求 → 插件把块内容转成 JS → 应用代码就能 import 到转好的内容。

### 写一个处理 docs 块的 Vite 插件

下面是个完整的 Vite 插件示例，专门处理 `<docs>` 块，把它导出成字符串：

```javascript
// vite-plugin-vue-docs.js
// 这是一个 Vite 插件，用于处理 .vue 文件中的 <docs> 自定义块

export default function vueDocsPlugin() {
  return {
    // 插件名字，Vite 用来标识插件
    name: 'vite-plugin-vue-docs',

    // enforce: 'pre' 表示在核心插件之前执行
    // 这样我们能在 @vitejs/plugin-vue 处理之前就介入
    enforce: 'pre',

    // resolveId 钩子：拦截自定义块的导入请求
    // 当 Vite 遇到 import 语句时会调用这个钩子
    resolveId(id) {
      // 检查是不是 docs 类型的自定义块请求
      // 请求形如：xxx.vue?vue&type=docs&index=0&lang.md
      if (id.includes('vue&type=docs')) {
        // 返回 id 表示我们接管这个模块的解析
        return id;
      }
      return null;
    },

    // load 钩子：根据 id 加载模块内容
    // 在 resolveId 返回非 null 后会调用这里
    load(id) {
      if (id.includes('vue&type=docs')) {
        // 从查询参数里拿到原始 .vue 文件的路径
        // 去掉 ?vue&type=docs... 这部分查询串
        const filePath = id.split('?')[0];

        // 用 Node 的 fs 模块读取原始文件
        const fs = require('fs');
        const source = fs.readFileSync(filePath, 'utf-8');

        // 用正则把 <docs>...</docs> 块的内容抠出来
        // [\s\S] 能匹配包括换行在内的所有字符
        const match = source.match(/<docs>([\s\S]*?)<\/docs>/);

        if (match) {
          // 拿到 docs 块的内容
          const docsContent = match[1].trim();

          // 转义字符串里的特殊字符，防止字符串提前结束
          // 反斜杠、反引号、${ 都要处理
          const escaped = docsContent
            .replace(/\\/g, '\\\\')
            .replace(/`/g, '\\`')
            .replace(/\$\{/g, '\\${');

          // 返回一个 ES 模块，默认导出 docs 内容字符串
          return `export default \`${escaped}\`;`;
        }
      }
      return null;
    },
  };
}
```

然后在 `vite.config.js` 里把它用上：

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDocsPlugin from './vite-plugin-vue-docs';

export default defineConfig({
  plugins: [
    // Vue SFC 支持插件，必须放在前面
    vue(),
    // 我们自定义的 docs 块处理插件
    vueDocsPlugin(),
  ],
});
```

配好之后，你就能在代码里这么用：

```vue
<script setup>
// 直接 import .vue 文件，会拿到 docs 块的内容字符串
import docsContent from './MyButton.vue?vue&type=docs';

// 打印出来看看，就是 <docs> 标签里的那段 markdown
console.log(docsContent);
</script>
```

这样一来，你就能把组件文档抽出来做展示页、生成文档站点啥的，玩法很多。

## 四、webpack/Vue CLI中怎么处理自定义块

要是你用的是 Vue CLI 或者 webpack，处理方式不太一样，得用 **loader** 来搞。`vue-loader` 提供了个 `rules` 配置项，可以针对不同的自定义块类型指定用哪个 loader 来处理。

### 配置 vue-loader 处理自定义块

下面是 `vue.config.js` 里配置 vue-loader 处理 `<docs>` 块的示例：

```javascript
// vue.config.js
const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  chainWebpack: (config) => {
    // 拿到 vue-loader 的规则
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => {
        // 在 vue-loader 的选项里加 rules 配置
        // rules 是个对象，key 是自定义块的类型，value 是 loader 配置
        options.compilerOptions = options.compilerOptions || {};
        options.compilerOptions.rules = {
          // 处理 docs 类型的自定义块
          docs: [
            {
              // 用 raw-loader 把 docs 块内容作为字符串导入
              loader: 'raw-loader',
            },
          ],
          // 也可以处理 i18n 块，配合 vue-i18n-loader
          // i18n: 'vue-i18n-loader',
        };
        return options;
      });
  },
});
```

如果你不用 Vue CLI，直接配 webpack，写法是这样：

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          compilerOptions: {
            // 自定义块的处理规则
            rules: {
              // docs 块用 raw-loader 处理，导出为字符串
              docs: [{ loader: 'raw-loader' }],
            },
          },
        },
      },
    ],
  },
};
```

### Vite 插件和 webpack loader 的写法差异

两种写法思路差不多，但细节有别，对比着看更清楚：

| 对比项 | Vite 插件 | webpack loader |
| ------ | --------- | -------------- |
| 拦截方式 | `resolveId` + `load` 钩子拦截请求 | `vue-loader` 的 `rules` 配置指定 loader |
| 配置位置 | `vite.config.js` 的 `plugins` 数组 | `vue.config.js` 或 `webpack.config.js` 的 loader 选项 |
| 处理逻辑 | 自己写 JS 转换逻辑，灵活度高 | 用现成 loader（如 raw-loader）或自己写 loader |
| 请求格式 | `xxx.vue?vue&type=docs` | `vue-loader` 内部处理，不用关心请求格式 |
| 上手难度 | 稍高，要懂 Vite 插件机制 | 较低，配个 loader 路径就行 |

简单说，Vite 插件更灵活但要自己写转换逻辑；webpack loader 配置简单但灵活性差点，得靠现成 loader 或者自己写一个。两种方式殊途同归，都是把自定义块的内容转成 JS 能用的东西。

## 五、三个底层库——工具链的基石

前面说了这么多格式化、自定义块的事，背后都离不开几个底层库在默默干活。这一节就来聊聊 Vue 工具链的三大基石：`@vue/compiler-sfc`、`@vitejs/plugin-vue`、`vue-loader`。

### @vue/compiler-sfc——SFC 编译的发动机

`@vue/compiler-sfc` 是 Vue 核心 monorepo 的一部分，跟 `vue` 主包的版本号保持一致。从某个版本开始，它已经成为 `vue` 主包的依赖，并被代理到 `vue/compiler-sfc` 目录下，所以你**不需要单独安装**它。

这个库提供了处理 Vue SFC 的所有底层功能：解析 `.vue` 文件、拆分三个块、编译模板、编译脚本、处理样式作用域等等。它是所有上层工具（Vite 插件、webpack loader）的基础。

官方特别强调一点：**始终通过 `vue/compiler-sfc` 的深度导入来使用它**，这样能确保编译器版本和 Vue 运行时版本严格同步，避免版本不匹配的坑。比如：

```javascript
// 正确：从 vue/compiler-sfc 深度导入
import { parse, compileScript, compileTemplate, compileStyle } from 'vue/compiler-sfc';

// 错误：不要单独安装 @vue/compiler-sfc 再导入
// import { parse } from '@vue/compiler-sfc';  // 别这么干
```

不过说实话，这个库主要是给**做工具链的开发者**用的，普通业务开发基本不会直接碰它。你要是自己想写个 Vue SFC 相关的工具（比如代码生成器、文档工具），才会用到它。

### @vitejs/plugin-vue——Vite 的 Vue 适配器

`@vitejs/plugin-vue` 是 Vue 官方为 Vite 提供的 SFC 支持插件。装上它，Vite 就能识别和处理 `.vue` 文件了。它内部调用的就是 `@vue/compiler-sfc`，把 SFC 编译成浏览器能跑的 JS。

新建 Vite + Vue 项目时，`create-vue` 脚手架会自动帮你装好这个插件。基本用法：

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
});
```

它还能传一些选项，比如开启响应式变换、自定义 SFC 编译选项啥的：

```javascript
export default defineConfig({
  plugins: [
    vue({
      // 开启响应式语法糖（实验性）
      reactivityTransform: true,
      // 传给 @vue/compiler-sfc 的选项
      script: {
        // 启用 props 解构
        propsDestructure: true,
      },
    }),
  ],
});
```

### vue-loader——webpack 的 Vue 适配器

`vue-loader` 是 Vue 官方为 webpack 提供的 SFC 支持 loader，作用跟 `@vitejs/plugin-vue` 类似，只是适配的是 webpack。Vue CLI 项目默认就用的它。

如果你是 Vue CLI 用户，想改 vue-loader 的选项，可以这么搞：

```javascript
// vue.config.js
module.exports = {
  chainWebpack: (config) => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap((options) => {
        // 修改 vue-loader 的选项
        options.compilerOptions = {
          // 比如关闭 whitespace 压缩
          whitespace: 'preserve',
        };
        return options;
      });
  },
};
```

### 三个库的定位对比

来个表格对比下三个库，一目了然：

| 库名 | 定位 | 适配的构建工具 | 是否需单独安装 | 主要使用者 |
| ---- | ---- | -------------- | -------------- | ---------- |
| `@vue/compiler-sfc` | SFC 编译核心库 | 无（被上层调用） | 否（vue 主包依赖） | 工具链开发者 |
| `@vitejs/plugin-vue` | Vite 的 Vue 插件 | Vite | 是 | Vite 项目开发者 |
| `vue-loader` | webpack 的 Vue loader | webpack / Vue CLI | 是（Vue CLI 已内置） | webpack 项目开发者 |

### 三个库在工具链中的位置

用流程图看下它们咋配合的：

```mermaid
flowchart TB
    subgraph 顶层[构建工具层]
        Vite[Vite]
        Webpack[webpack / Vue CLI]
    end

    subgraph 适配层[适配层——变速箱]
        PluginVue[@vitejs/plugin-vue]
        VueLoader[vue-loader]
    end

    subgraph 核心层[核心层——发动机]
        CompilerSFC[@vue/compiler-sfc]
    end

    subgraph 输出[编译产物]
        JS[浏览器可执行的 JS]
    end

    Vite --> PluginVue
    Webpack --> VueLoader
    PluginVue --> CompilerSFC
    VueLoader --> CompilerSFC
    CompilerSFC --> JS

    style Vite fill:#e1f5fe
    style Webpack fill:#e1f5fe
    style PluginVue fill:#fff3e0
    style VueLoader fill:#fff3e0
    style CompilerSFC fill:#fce4ec
    style JS fill:#e8f5e9
```

打个比方好理解：`@vue/compiler-sfc` 是"发动机"，干的是把 SFC 拆解、编译的硬活；`@vitejs/plugin-vue` 和 `vue-loader` 是"变速箱"，分别适配 Vite 和 webpack 两辆车，把发动机的动力转换成车子能用的形式。你开车（写业务代码）的时候不用管发动机和变速箱咋工作，但要是想改装（自定义工具链），就得懂点它们的原理了。

## 课后 Quiz

### 问题 1：Vue Official 插件和 Prettier 都能格式化 Vue SFC，啥时候该用哪个？

**答案解析：**

这俩不是非此即彼的关系，可以搭配用。Vue Official 插件的优势是跟 Vue 语法贴合度高，提供语法高亮、类型检查、智能提示这些功能，开箱即用不用配置。Prettier 的优势是可配置项多，能统一处理项目里各种文件（Vue、JS、TS、JSON、CSS 等），适合团队协作定统一规范。

实际选择上：个人小项目用 Vue Official 就够了；团队项目或者多技术栈项目，建议 Prettier 管格式化，Vue Official 管语法支持。常见配置是把 Prettier 设为默认格式化工具，保存时自动格式化。

### 问题 2：SFC 自定义块被编译后，会变成什么样的导入请求？为啥需要构建工具额外配置？

**答案解析：**

自定义块会被编译成对同一 Vue 文件的不同请求查询。比如 `<docs>` 块会变成类似 `MyButton.vue?vue&type=docs&index=0&lang.md` 的导入请求。这种带查询参数的请求，浏览器和构建工具默认不认识，不知道该返回啥内容。

所以需要构建工具（Vite 插件或 webpack loader）拦截这种请求，读取块内容并转换成可执行的 JavaScript 代码。编译器只负责拆分和生成请求，具体怎么处理请求是工具链的事。这就好比快递员（编译器）把包裹（自定义块）送到门口，但拆包裹、用里面的东西得你自己来（构建工具配置）。

### 问题 3：为啥官方推荐通过 `vue/compiler-sfc` 深度导入，而不是单独安装 `@vue/compiler-sfc`？

**答案解析：**

`@vue/compiler-sfc` 是 Vue 核心 monorepo 的一部分，版本号跟 `vue` 主包严格一致。从某个版本起，它已经成为 `vue` 主包的依赖，并被代理到 `vue/compiler-sfc` 目录下。

通过 `vue/compiler-sfc` 深度导入，能保证编译器版本和 Vue 运行时版本完全同步，避免版本不匹配导致的兼容性问题。要是单独安装 `@vue/compiler-sfc`，可能会装到跟 `vue` 主包不一致的版本，编译产物和运行时对不上，就容易出各种玄学 bug。所以官方明确建议：始终选择通过 `vue/compiler-sfc` 的深度导入来使用，确保与 Vue 运行时版本同步。

## 常见报错解决方案

### 报错 1：`Failed to resolve loader: raw-loader`

**产生原因：** 在 webpack 里配置自定义块处理时，用了 `raw-loader` 但没安装这个包。`raw-loader` 不是 webpack 内置的，得单独装。

**解决方案：**

安装 `raw-loader`：

```bash
npm install raw-loader --save-dev
```

或者用 webpack 5 内置的资源模块替代，不用装额外包：

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          compilerOptions: {
            rules: {
              // 用 webpack 5 的 asset/source 替代 raw-loader
              docs: [
                {
                  loader: 'webpack-loader',
                  options: { type: 'asset/source' },
                },
              ],
            },
          },
        },
      },
    ],
  },
};
```

**预防建议：** 配置 loader 前先查 `package.json` 看依赖装没装，webpack 5 项目优先用内置的资源模块，少装第三方包。

### 报错 2：`[vue/compiler-sfc] X is not exported by vue/compiler-sfc`

**产生原因：** 从 `vue/compiler-sfc` 导入的 API 名字写错了，或者你用的 Vue 版本里这个 API 不存在/被重命名了。比如把 `parse` 写成 `parseSFC`，或者用了旧版本的 API。

**解决方案：**

先确认你的 Vue 版本，然后查对应版本的 `@vue/compiler-sfc` 文档，看 API 是否存在。常见的正确导入：

```javascript
// 正确的 API 名字
import {
  parse,           // 解析 SFC
  compileScript,   // 编译 <script>
  compileTemplate, // 编译 <template>
  compileStyle,    // 编译 <style>
  compileStyleAsync,
} from 'vue/compiler-sfc';
```

如果是从旧版本升级，注意 API 可能有变化。比如 Vue 3.2 之前 `parse` 返回结果的结构跟之后不一样，`compileScript` 的选项也有调整。

**预防建议：** 升级 Vue 版本时，同步看下 `@vue/compiler-sfc` 的 changelog，确认 API 没有破坏性变更。写工具代码时加个版本检查，避免在不兼容的版本上跑。

### 报错 3：`Custom block type "xxx" is not supported`

**产生原因：** SFC 里有自定义块，但构建工具（Vite 插件或 webpack loader）没配置对应类型的处理规则，工具不知道咋处理这种块。

**解决方案：**

在构建工具配置里加上对应类型的处理规则。Vite 的话写个插件拦截请求：

```javascript
// vite.config.js
function customBlockPlugin() {
  return {
    name: 'custom-block-plugin',
    enforce: 'pre',
    resolveId(id) {
      // 拦截 xxx 类型的自定义块请求
      if (id.includes('vue&type=xxx')) {
        return id;
      }
      return null;
    },
    load(id) {
      if (id.includes('vue&type=xxx')) {
        const filePath = id.split('?')[0];
        const fs = require('fs');
        const source = fs.readFileSync(filePath, 'utf-8');
        const match = source.match(/<xxx>([\s\S]*?)<\/xxx>/);
        if (match) {
          const content = match[1].trim().replace(/`/g, '\\`');
          return `export default \`${content}\`;`;
        }
      }
      return null;
    },
  };
}
```

webpack 的话在 vue-loader 的 rules 里加：

```javascript
compilerOptions: {
  rules: {
    xxx: [{ loader: 'raw-loader' }],
  },
}
```

**预防建议：** 用自定义块前先把构建工具配置好，别写完块再配。团队协作时，把自定义块的处理配置写进项目文档，避免新人踩坑。

参考链接：https://vuejs.org/guide/scaling-up/tooling.html

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：[代码格式化、SFC自定义块和底层编译库，Vue工具链的最后一公里](https://blog.cmdragon.cn/posts/u7v8w9x0y1z2a3b4c5d6e7f8a9b0c1d2e3/)

<details>
<summary>往期文章归档</summary>

- [Vue 3 静态与动态 Props 如何传递？TypeScript 类型约束有何必要？](https://blog.cmdragon.cn/posts/94ab48753b64780ca3ab7a7115ae8522/)
- [Vue 3中组件局部注册的优势与实现方式如何？](https://blog.cmdragon.cn/posts/dbf576e744870f6de26fd8a2e03e47da/)
- [如何在Vue3中优化生命周期钩子性能并规避常见陷阱？](https://blog.cmdragon.cn/posts/12d98b3b9ccd6c19a1b169d720ac5c80/)
- [Vue 3 Composition API生命周期钩子：如何实现从基础理解到高阶复用？](https://blog.cmdragon.cn/posts/8884e2b70287fcb263c57648eeb27419/)
- [Vue 3生命周期钩子实战指南：如何正确选择onMounted、onUpdated与onUnmounted的应用场景？](https://blog.cmdragon.cn/posts/883c6dbc50ae4183770a4462e0b8ae4d/)
- [Vue 3中生命周期钩子与响应式系统如何实现协同工作？](https://blog.cmdragon.cn/posts/70dad360ffa9dce14d0d69611b8cb019/)
- [Vue 3组件生命周期钩子的执行顺序与使用场景是什么？](https://blog.cmdragon.cn/posts/db44294a78dc9f666f67b053f6c83567/)
- [Vue组件全局注册与局部注册如何抉择？](https://blog.cmdragon.cn/posts/43ead630ea17da65d99ad2eb8188e472/)
- [Vue3组件化开发中，Props与Emits如何实现数据流转与事件协作？](https://blog.cmdragon.cn/posts/8cff7d2df113da66ea7be560c4d1d22a/)
- [Vue 3模板引用如何与其他特性协同实现复杂交互？](https://blog.cmdragon.cn/posts/331bf75d114ab09116eadfcdca602b58/)
- [Vue 3 v-for中模板引用如何实现高效管理与动态控制？](https://blog.cmdragon.cn/posts/cb380897ddc3578b180ecf8843c774c1/)
- [Vue 3的defineExpose：如何突破script setup组件默认封装，实现精准的父子通讯？](https://blog.cmdragon.cn/posts/202ae0f4acde7128e0e31baf63732fb5/)
- [Vue 3模板引用的生命周期时机如何把握？常见陷阱该如何避免？](https://blog.cmdragon.cn/posts/7d2a0f6555ecbe92afd7d2491c427463/)
- [Vue 3模板引用如何实现父组件与子组件的高效交互？](https://blog.cmdragon.cn/posts/3fb7bdd84128b7efaaa1c979e1f28dee/)
- [Vue中为何需要模板引用？又如何高效实现DOM与组件实例的直接访问？](https://blog.cmdragon.cn/posts/23f3464ba16c7054b4783cded50c04c6/)

</details>

<details>
<summary>免费好用的热门在线工具</summary>

- [多直播聚合器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/multi-live-aggregator)
- [Proto文件生成器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/proto-file-generator)
- [图片转粒子 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/image-to-particles)
- [视频下载器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/video-downloader)
- [文件格式转换器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/file-converter)
- [M3U8在线播放器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/m3u8-player)
- [快图设计 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/quick-image-design)
- [高级文字转图片转换器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/text-to-image-advanced)
- [RAID 计算器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/raid-calculator)
- [在线PS - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/photoshop-online)
- [Mermaid 在线编辑器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/mermaid-live-editor)
- [数学求解计算器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/math-solver-calculator)
- [智能提词器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/smart-teleprompter)
- [魔法简历 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/magic-resume)
- [Image Puzzle Tool - 图片拼图工具 | By cmdragon](https://tools.cmdragon.cn/zh/apps/image-puzzle-tool)
- [字幕下载工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/subtitle-downloader)
- [歌词生成工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/lyrics-generator)
- [网盘资源聚合搜索 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/cloud-drive-search)
- [ASCII字符画生成器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/ascii-art-generator)
- [JSON Web Tokens 工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/jwt-tool)
- [Bcrypt 密码工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/bcrypt-tool)
- [GIF 合成器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/gif-composer)
- [GIF 分解器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/gif-decomposer)
- [文本隐写术 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/text-steganography)
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
- [快传 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/snapdrop)
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
- [IP归属地查询 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/ip-geolocation)
- [CSS网格布局生成器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/css-grid-layout)
- [邮箱验证工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/email-validator)
- [书法练习字帖 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/calligraphy-practice)
- [金融计算器套件 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/finance-calculator-suite)
- [中国亲戚关系计算器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/chinese-kinship-calculator)
- [Protocol Buffer 工具箱 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/protobuf-toolkit)
- [IP归属地查询 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/ip-geolocation)
- [图片无损放大 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/image-upscaler)
- [文本比较工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/text-compare)
- [IP批量查询工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/ip-batch-lookup)
- [域名查询工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/domain-finder)
- [DNS工具箱 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/dns-toolkit)
- [网站图标生成器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/favicon-generator)
- [XML Sitemap](https://tools.cmdragon.cn/sitemap_index.xml)

</details>
