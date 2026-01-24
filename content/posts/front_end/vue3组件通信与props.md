---
url: /posts/038af0ce9a794d8c6df8b4ab08bd2c65/
title: vue3组件通信与props
date: 2024-05-31T9:00:57+08:00
lastmod: 2024-05-31T9:00:57+08:00
categories:
  - 前端开发

tags:
  - Vue3组件
  - Props详解
  - 生命周期
  - 数据通信
  - 模板语法
  - Composition API
  - 单向数据流
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_05_31 21_06_03.png" title="2024_05_31 21_06_03.png" alt="2024_05_31 21_06_03.png"/>

## Vue 3 组件基础

在 Vue 3 中，组件是构建用户界面的基本单位，它们是可复用的 Vue 实例，具有自己的模板、数据、方法等。组件化开发使得代码更加模块化，易于管理和维护。以下是 Vue 3 组件的基础知识：

### 1. 组件的创建与注册

在 Vue 3 中，组件需要先定义后使用。定义组件的方式有两种：全局注册和局部注册。

#### 全局注册

全局注册的组件可以在任何地方使用，通过 `app.component` 方法进行注册：

```javascript
import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);

app.component('my-component', {
  // 组件选项
});

app.mount('#app');

```

#### 局部注册

局部注册的组件只能在注册它的组件内部使用，通常在组件的 `components` 选项中进行注册：

```javascript
export default {
  components: {
    'my-component': {
      // 组件选项
    }
  }
}

```

### 2. 组件选项

组件选项包括模板、数据、方法、生命周期钩子等。

#### 模板 (Template)

组件的模板定义了组件的结构，可以使用 HTML 和 Vue 的模板语法：

```html
<template>
  <div>
    <h1>{{ title }}</h1>
    <p>{{ content }}</p>
  </div>
</template>

```

#### 数据 (Data)

组件的数据是响应式的，需要是一个函数，返回一个数据对象：

```javascript
export default {
  data() {
    return {
      title: 'Hello Vue 3',
      content: 'Welcome to Vue 3 component basics.'
    };
  }
}

```

#### 方法 (Methods)

组件的方法定义在 `methods` 选项中，可以在模板中通过事件绑定来调用：

```javascript
export default {
  methods: {
    greet() {
      alert('Hello from Vue 3 component!');
    }
  }
}

```

#### 生命周期钩子 (Lifecycle Hooks)

Vue 3 提供了多个生命周期钩子，允许你在组件的不同阶段执行代码。例如：

```javascript
export default {
  created() {
    console.log('Component created');
  },
  mounted() {
    console.log('Component mounted');
  }
}

```

### 3. 组件通信

组件之间的通信是 Vue 应用中的常见需求，Vue 3 提供了多种通信方式，包括 props、自定义事件、插槽等。

#### Props

Props 允许父组件向子组件传递数据：

```html
// 子组件
export default {
  props: {
    message: String
  }
}

// 父组件
<child-component :message="hello"></child-component>

```

#### 自定义事件

子组件可以通过自定义事件向父组件传递数据：

```html
// 子组件
this.$emit('my-event', data);

// 父组件
<child-component @my-event="handleEvent"></child-component>

```

#### 插槽 (Slots)

插槽允许父组件向子组件传递内容：

```html
<!-- 子组件 -->
<slot></slot>

<!-- 父组件 -->
<child-component>
  <p>This content is passed to the child component via slot.</p>
</child-component>

```

### 4. 组件的复用与组合

Vue 3 鼓励组件的复用和组合，通过 props、插槽等方式，可以构建出高度可复用的组件库。同时，Vue 3 还引入了 Composition API，使得组件的逻辑更加清晰和易于复用。


## 什么是 props？

在 Vue.js 框架中，`props` 是一个组件的属性，它可以接收来自父组件的数据，并将其传递到子组件中。`props` 使得子组件能够接收外部传入的信息，从而可以在不需要知道外部具体细节的情况下，实现与父组件的交互和数据传递。

### Props 的作用

1. **传参**：父组件可以通过 `props` 将数据传递给子组件。
2. **验证数据类型**：在定义 `props` 时，可以指定期望的数据类型，这样 Vue 会在开发过程中进行类型检查，并在浏览器控制台中抛出警告，有助于提前发现潜在问题。
3. **设置默认值**：如果父组件没有传递相应的 `prop`，可以设置默认值以确保子组件能够接收到一个合理的默认值。

### Props 的使用

在 Vue 3 中，定义 `props` 的方式有几种，包括使用字符串数组、对象形式以及使用 TypeScript 的类型注解。

#### 字符串数组形式

```javascript
export default {
  props: ['message']
}

```

这表示组件期望接收一个名为 `message` 的 `prop`，它是一个字符串类型。

#### 对象形式

```javascript
export default {
  props: {
    message: String,
    title: {
      type: String,
      default: 'Default Title'
    }
  }
}

```

这种方式下，`message` 被指定为字符串类型，而 `title` 被指定为字符串类型，并且有一个默认值。

#### TypeScript 类型注解

在使用 TypeScript 时，可以利用类型注解来定义 `props`：

```javascript
export default {
  props: {
    message: string,
    title: string
  }
}

```

### Props 的传递

在父组件中，通过在模板中使用 `v-bind` 指令或者简写为 `:` 来传递 `props`：

```vue
<!-- 父组件 -->
<child-component :message="parentMessage"></child-component>

```

在这里，`parentMessage` 是父组件中的一个数据属性，它将被传递给名为 `child-component` 的子组件。

### Props 的验证

在 Vue.js 中，`props` 验证是指对组件传入的 `props` 进行类型检查和默认值设置等验证。Vue 提供了一个可选的验证功能，可以在定义 `props` 时进行设置。以下是一些常见的 `props` 验证规则：

1. **类型验证**：可以指定 `props` 的类型，如 `String`、`Number`、`Boolean`、`Array`、`Object` 等。
2. **默认值**：可以为 `props` 设置默认值，如果未传入 `prop`，则使用默认值。
3. **必需性**：可以指定 `props` 是否为必需，如果为必需，则必须在父组件中传入。
4. **自定义验证**：可以使用 `validator` 函数进行自定义验证。
5. **单位转换**：对于数值类型，可以指定单位，如 `px`、`%` 等，Vue 会自动进行单位转换。

下面是一个使用 `props` 验证的例子：

```javascript
export default {
  props: {
    // 基本类型验证
    title: {
      type: String,
      default: '默认标题'
    },
    // 数值类型验证，可以指定单位
    width: {
      type: Number,
      default: 100,
      validator: (value) => {
        return value >= 0; // 自定义验证，确保宽度非负
      }
    },
    // 数组类型验证
    items: {
      type: Array,
      default: () => []
    },
    // 对象类型验证
    config: {
      type: Object,
      default: () => ({})
    },
    // 布尔值类型验证
    isActive: {
      type: Boolean,
      default: false
    }
  }
}

```

在这个例子中，`title` 被验证为字符串类型，有一个默认值；`width` 被验证为数值类型，有一个默认值，并且有一个自定义的验证函数确保它非负；`items` 被验证为数组类型，有一个默认的空数组；`config` 被验证为对象类型，有一个默认的空对象；`isActive` 被验证为布尔类型，有一个默认的 `false` 值。

如果父组件传递给子组件的 `props` 不满足这些验证规则，Vue 将抛出一个警告。这些验证规则有助于确保组件接收到的数据是预期的类型和格式，从而提高组件的健壮性。AD：[首页 | 一个覆盖广泛主题工具的高效在线平台](https://cmdragon.cn/)


### 动态Props

在Vue中，动态Props指的是父组件向子组件传递的Props值可以在运行时动态确定。这可以通过使用`v-bind`指令或简写为`:`来实现。动态Props的值可以是表达式、计算属性或方法返回的结果。

```vue
<template>
  <ChildComponent :prop-name="dynamicValue" />
</template>
<script>
import ChildComponent from './ChildComponent.vue';

export default {
  components: {
    ChildComponent
  },
  data() {
    return {
      dynamicValue: '动态值'
    };
  }
};
</script>
```

### 单向数据流

在Vue中，单向数据流指的是数据只能从父组件流向子组件，不能反向流动。这是通过`props`和`emit`方法实现的。`props`用于父组件向子组件传递数据，而`emit`方法允许子组件向父组件发送事件。
AD：[专业搜索引擎](https://movie.cmdragon.cn:2083/)

### 父子组件通信

父子组件通信主要有以下几种方式：

1. **Props**：父组件通过Props向子组件传递数据。
2. **$emit 方法**：子组件通过`$emit`方法触发事件，父组件通过`@eventName`监听这些事件。

```vue
<!-- 父组件 -->
<template>
  <ChildComponent @child-event="handleChildEvent" />
</template>
<script>
import ChildComponent from './ChildComponent.vue';

export default {
  components: {
    ChildComponent
  },
  methods: {
    handleChildEvent(data) {
      console.log('收到子组件的事件:', data);
    }
  }
};
</script>
```

```
<!-- 子组件 -->
<template>
  <button @click="sendMessageToParent">发送消息给父组件</button>
</template>
<script>
export default {
  methods: {
    sendMessageToParent() {
      this.$emit('child-event', 'Hello from child!');
    }
  }
};
</script>
```

### 非父子组件通信

非父子组件通信有以下几种方式：

1. **Provide 和 Inject**：祖先组件通过`provide`选项来提供变量，所有的子孙组件都可以通过`inject`选项来接收这个变量。
AD：[漫画首页](https://comic.cmdragon.cn:2087/)
2. **Event Bus**：创建一个中央事件总线实例，不同组件通过触发或监听事件来进行通信。

```javascript
// 创建Event Bus实例
const eventBus = new Vue();

// 祖先组件
eventBus.$emit('update-data', 'some data');

// 后代组件
eventBus.$on('update-data', (data) => {
  console.log('收到数据:', data);
});

```

### Props 的限制

1. **类型限制**：可以指定`props`的类型，如`String`、`Number`、`Boolean`等。
2. **默认值**：可以为`props`设置默认值。
3. **必需性**：可以指定`props`是否为必需。
4. **自定义验证**：可以使用`validator`函数进行自定义验证。
5. **单位转换**：对于数值类型，可以指定单位，如`px`、`%`等，Vue会自动进行单位转换。

## 总结

Vue.js通过提供灵活的组件通信机制，使得前端开发更加高效和模块化。父子组件之间的通信通过`props`和`emit`实现，遵循单向数据流原则；非父子组件间则可以通过`provide`和`inject`，或者事件总线来实现。这些通信机制不仅使得组件之间的数据传递更加清晰，也提高了应用的可维护性。同时，`props`的验证机制确保了组件接收到的数据是符合预期格式的，增加了组件的稳定性。

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
