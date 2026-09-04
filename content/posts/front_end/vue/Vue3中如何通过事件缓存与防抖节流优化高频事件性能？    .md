---
url: /posts/a5c224e347f70fd63a2d8eeea20041df/
title: Vue3中如何通过事件缓存与防抖节流优化高频事件性能？
date: 2026-01-16T10:09:30+08:00
lastmod: 2026-01-16T10:09:30+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/generated_image_9b7dd8d0-971d-4872-9f4f-5adbce54d226.png

summary:
  Vue3事件处理性能优化：v-on方法引用复用函数避免重复创建；高频事件用Lodash防抖（等待后执行，如搜索）或节流（固定间隔，如滚动）优化；支持动态绑定与事件修饰符（.stop等），手动绑定需onUnmounted解绑；优先事件委托减少监听器，提升性能。

categories:
  - vue

tags:
  - 基础入门
  - 性能优化
  - 事件处理
  - 事件委托
  - 防抖节流

---
<img src="https://api2.cmdragon.cn/upload/cmder/images/generated_image_9b7dd8d0-971d-4872-9f4f-5adbce54d226.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 事件缓存与防抖节流

在Vue3的事件处理中，**性能优化**往往从“减少不必要的重复操作”开始。我们先从最基础的“事件缓存”讲起，再延伸到高频事件的“防抖节流”技巧。

### 什么是事件缓存？

你有没有注意到，Vue的`v-on`绑定有两种常见写法：

```vue
<!-- 写法1：内联函数 -->
<button @click="() => handleClick(id)">点击</button>

<!-- 写法2：方法引用 -->
<button @click="handleClick">点击</button>
```

这两种写法的核心区别在于：**写法2会触发Vue的事件缓存优化**。

当你用`@click="handleClick"`（方法引用）时，Vue会**缓存这个方法的实例**——每次组件渲染时，不会重新创建新的函数，直接复用之前的引用。而写法1的内联函数，
**每次渲染都会生成新的函数对象**，Vue需要频繁解绑旧函数、绑定新函数，增加性能开销。

📌 **小提醒**：如果需要传递参数（比如`id`），尽量用**事件委托**（后面会讲）或`dataset`存储参数，避免内联函数。比如：

```vue
<!-- 用dataset存id -->
<li :data-id="item.id" @click="handleItemClick">{{ item.name }}</li>

<script setup>
  const handleItemClick = (e) => {
    const id = e.target.dataset.id; // 从事件对象中取id
    console.log('点击了项目', id);
  };
</script>
```

### 防抖与节流：解决高频事件的性能问题

在实际开发中，我们经常遇到**高频触发的事件**——比如搜索框输入、窗口
resize、滚动事件。如果每次触发都执行逻辑，会导致性能瓶颈（比如频繁发请求、多次修改DOM）。这时候需要用**防抖（Debounce）**和**
节流（Throttle）**来优化。

#### 概念区分

- **防抖**：事件触发后，等待一段时间（比如1秒）再执行逻辑；如果这段时间内再次触发，重新计时。  
  适用场景：搜索框输入、按钮重复点击。
- **节流**：每隔一段时间（比如500毫秒）执行一次逻辑，不管触发多少次。  
  适用场景：滚动加载、窗口 resize。

### 在Vue3中实现防抖节流

Vue3本身没有内置防抖节流，但我们可以用**Lodash**（一个常用的工具库）快速实现。

#### 步骤1：安装Lodash

Lodash的ES模块版本（`lodash-es`）更适合Vue3的模块化开发：

```bash
npm install lodash-es --save
```

#### 步骤2：用防抖实现搜索框优化

比如一个搜索框，用户输入时等待1秒再发请求：

```vue

<template>
  <input type="text" v-model="query" @input="handleSearch" placeholder="搜索...">
</template>

<script setup>
  import {ref} from 'vue';
  import {debounce} from 'lodash-es';

  const query = ref('');

  // 防抖函数：等待1秒执行
  const handleSearch = debounce((value) => {
    console.log('发送搜索请求：', value);
    // 这里可以写axios请求逻辑，比如：
    // axios.get('/api/search', { params: { q: value } });
  }, 1000);
</script>
```

#### 步骤3：用节流实现滚动加载

比如滚动到底部时加载更多内容：

```vue

<template>
  <div class="scroll-box" @scroll="handleScroll">
    <!-- 内容 -->
  </div>
</template>

<script setup>
  import {throttle} from 'lodash-es';

  const handleScroll = throttle(() => {
    const scrollBox = document.querySelector('.scroll-box');
    const isBottom = scrollBox.scrollTop + scrollBox.clientHeight >= scrollBox.scrollHeight;
    if (isBottom) {
      console.log('加载更多内容');
    }
  }, 500); // 每隔500毫秒检查一次
</script>
```

## 动态事件绑定与解绑

有时候，我们需要**根据场景切换事件类型**（比如点击变双击），或**手动控制事件的生命周期**
（比如给非Vue管理的DOM绑定事件）。这时候需要用到动态事件绑定和解绑。

### 方式1：用v-on动态参数绑定事件

Vue3支持**动态参数**——`v-on`的参数可以是变量，用方括号`[]`包裹。比如：

```vue

<template>
  <button @[eventName]="handleClick">
    {{ eventName === 'click' ? '点击' : '双击' }}我
  </button>
  <button @click="toggleEvent">切换事件类型</button>
</template>

<script setup>
  import {ref} from 'vue';

  const eventName = ref('click'); // 初始事件是click
  const handleClick = () => {
    alert('触发了' + eventName.value + '事件');
  };

  // 切换事件类型
  const toggleEvent = () => {
    eventName.value = eventName.value === 'click' ? 'dblclick' : 'click';
  };
</script>
```

点击“切换事件类型”按钮，`eventName`会在`click`和`dblclick`之间切换，按钮的事件类型也会跟着变。

### 方式2：手动绑定与解绑事件

如果需要更灵活的控制（比如给第三方组件的DOM绑定事件），可以用`ref`获取DOM元素，再手动调用`addEventListener`和
`removeEventListener`。

#### 示例：手动绑定点击事件

```vue

<template>
  <div ref="myDiv" class="box">点击我</div>
</template>

<script setup>
  import {ref, onMounted, onUnmounted} from 'vue';

  const myDiv = ref(null); // 用ref关联DOM元素

  const handleClick = () => {
    console.log('div被点击了');
  };

  // 组件挂载后绑定事件
  onMounted(() => {
    myDiv.value.addEventListener('click', handleClick); // 绑定
  });

  // 组件销毁前解绑事件
  onUnmounted(() => {
    myDiv.value.removeEventListener('click', handleClick); // 解绑
  });
</script>

<style scoped>
  .box {
    width: 200px;
    height: 200px;
    background: #f0f0f0;
    text-align: center;
    line-height: 200px;
    cursor: pointer;
  }
</style>
```

📌 **关键注意点**：  
必须在`onUnmounted`中解绑事件！否则组件销毁后，事件监听器仍会引用组件实例，导致**内存泄漏**（页面卡顿、内存占用过高）。

## 事件处理性能分析与优化建议

Vue的事件处理本身已经做了很多优化，但我们还可以通过以下技巧进一步提升性能：

### 技巧1：优先使用事件委托

**事件委托**是利用**事件冒泡**的特性——把事件绑定到父元素，让父元素处理子元素的事件。比如一个长列表，给每个`li`绑定点击事件不如给
`ul`绑定：

```vue

<template>
  <ul @click="handleItemClick" class="list">
    <li v-for="item in items" :key="item.id" :data-id="item.id">
      {{ item.name }}
    </li>
  </ul>
</template>

<script setup>
  import {ref} from 'vue';

  const items = ref([
    {id: 1, name: '项目1'},
    {id: 2, name: '项目2'},
    // ... 1000个项目
  ]);

  const handleItemClick = (e) => {
    if (e.target.tagName === 'LI') { // 确保是li触发的事件
      const id = e.target.dataset.id;
      console.log('点击了项目', id);
    }
  };
</script>
```

这样不管列表有多少项，都只需要1个事件监听器，大大减少内存占用。

### 技巧2：避免不必要的事件绑定

- **能用事件委托就不用子元素绑定**：减少事件监听器数量。
- **不用内联事件函数**：比如`@click="() => doSomething()"`，尽量用方法引用（`@click="doSomething"`）。
- **不用重复绑定**：比如组件渲染时多次绑定同一个事件，会导致重复执行逻辑。

### 技巧3：用Vue的事件修饰符优化

Vue提供了**事件修饰符**，这些修饰符是编译阶段处理的，比手动调用`e.stopPropagation()`更高效。常见修饰符：
| 修饰符 | 作用 | 替代代码 |
|----------|--------------------------------------|--------------------------|
| `.stop`  | 阻止事件冒泡 | `e.stopPropagation()`    |
| `.prevent`| 阻止默认行为（比如链接跳转） | `e.preventDefault()`     |
| `.passive`| 告诉浏览器不会阻止默认行为（优化滚动）| —— |
| `.once`  | 事件只触发一次，自动解绑 | `removeEventListener`    |

#### 示例：优化滚动事件

对于滚动、触摸等高频事件，用`.passive`修饰符能显著提升性能：

```vue
<!-- 滚动事件用passive优化 -->
<div @scroll.passive="handleScroll" class="scroll-box">
  <!-- 内容 -->
</div>
```

`.passive`会告诉浏览器：“这个事件处理函数不会阻止滚动”，浏览器可以提前优化滚动行为（比如预渲染滚动内容）。

## 课后小测：巩固你的理解

1. 请写出在Vue3中使用防抖函数处理搜索输入的代码示例（使用Lodash）。
2. 动态绑定事件的两种方式是什么？请分别举例。
3. 为什么要在组件销毁时解绑手动绑定的事件？

### 答案与解析

1. **防抖搜索示例**：

```vue

<template>
  <input type="text" v-model="query" @input="handleSearch" placeholder="搜索...">
</template>

<script setup>
  import {ref} from 'vue';
  import {debounce} from 'lodash-es';

  const query = ref('');
  const handleSearch = debounce((value) => {
    console.log('发送请求：', value);
  }, 1000);
</script>
```

**解析**：用`debounce`包裹搜索逻辑，等待1秒再执行，避免频繁请求。

2. **动态绑定的两种方式**：
    - **方式1：动态参数**：用`@[eventName]`绑定，`eventName`是ref变量。  
      示例：`@[eventName]="handleClick"`（`eventName`可以是`click`或`dblclick`）。
    - **方式2：手动绑定**：用`ref`获取DOM，再调用`addEventListener`。  
      示例：`onMounted(() => myDiv.value.addEventListener('click', handleClick))`。


3. **为什么要解绑手动绑定的事件？**：
   手动绑定的事件（`addEventListener`）不会被Vue自动解绑。如果组件销毁后事件仍存在，会引用组件实例，导致**内存泄漏**
   （页面卡顿、内存占用过高）。因此必须在`onUnmounted`中调用`removeEventListener`。

## 常见报错与解决方法

### 1. 动态事件名报错：`Invalid event name: undefined`

**原因**：动态事件名的`ref`变量没有初始化（比如`const eventName = ref()`）。  
**解决**：给`eventName`一个初始值，比如`const eventName = ref('click')`。

### 2. 防抖函数的`this`指向错误（Options API）

**现象**：在Options API中，用箭头函数定义防抖函数，`this`是`undefined`：

```js
// 错误写法
methods: {
    handleSearch: debounce(() => {
        console.log(this.query); // this是undefined
    }, 1000)
}
```

**原因**：箭头函数的`this`指向定义时的上下文（全局），不是组件实例。  
**解决**：用普通函数或绑定`this`：

```js
// 正确写法1：普通函数
methods: {
    handleSearch: debounce(function () {
        console.log(this.query); // this是组件实例
    }, 1000)
}

// 正确写法2：绑定this
methods: {
    handleSearch: debounce(function () {
        console.log(this.query);
    }.bind(this), 1000)
}
```

### 3. 事件未解绑导致内存泄漏

**现象**：组件销毁后，事件仍触发，页面卡顿。  
**原因**：手动绑定的事件没有在`onUnmounted`中解绑。  
**解决**：在`onUnmounted`中调用`removeEventListener`：

```js
onUnmounted(() => {
    myDiv.value.removeEventListener('click', handleClick);
});
```

## 参考链接

- Vue3事件处理官方文档：https://vuejs.org/guide/essentials/event-handling.html
- Vue3动态参数官方文档：https://vuejs.org/guide/essentials/template-syntax.html#dynamic-arguments
- Lodash Debounce文档：https://lodash.com/docs/4.17.15#debounce
- Lodash Throttle文档：https://lodash.com/docs/4.17.15#throttle

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[Vue3中如何通过事件缓存与防抖节流优化高频事件性能？](https://blog.cmdragon.cn/posts/a5c224e347f70fd63a2d8eeea20041df/)



<details>
<summary>往期文章归档</summary>

- [Vue3跨组件通信中，全局事件总线与provide/inject该如何正确选择？](https://blog.cmdragon.cn/posts/ad67c4eb6d76cf7707bdfe6a8146c34f/)
- [Vue3表单事件处理：v-model如何实现数据绑定、验证与提交？](https://blog.cmdragon.cn/posts/1c1e80d697cca0923f29ec70ebb8ccd1/)
- [Vue应用如何基于DOM事件传播机制与事件修饰符实现高效事件处理？](https://blog.cmdragon.cn/posts/b990828143d70aa87f9aa52e16692e48/)
- [Vue3中如何在调用事件处理函数时同时传递自定义参数和原生DOM事件？参数顺序有哪些注意事项？](https://blog.cmdragon.cn/posts/b44316e0866e9f2e6aef927dbcf5152b/)
- [从捕获到冒泡：Vue事件修饰符如何重塑事件执行顺序？](https://blog.cmdragon.cn/posts/021636c2a06f5e2d3d01977a12ddf559/)
- [Vue事件处理：内联还是方法事件处理器，该如何抉择？](https://blog.cmdragon.cn/posts/b3cddf7023ab537e623a61bc01dab6bb/)
- [Vue事件绑定中v-on与@语法如何取舍？参数传递与原生事件处理有哪些实战技巧？](https://blog.cmdragon.cn/posts/bd4d9607ce1bc34cc3bda0a1a46c40f6/)
- [Vue 3中列表排序时为何必须复制数组而非直接修改原始数据？](https://blog.cmdragon.cn/posts/a5f2bacb74476fd7f5e02bb3f1ba6b2b/)
- [Vue虚拟滚动如何将列表DOM数量从万级降至十位数？](https://blog.cmdragon.cn/posts/d3b06b57fb7f126787e6ed22dce1e341/)
- [Vue3中v-if与v-for直接混用为何会报错？计算属性如何解决优先级冲突？](https://blog.cmdragon.cn/posts/3100cc5a2e16f8dac36f722594e6af32/)
- [为何在Vue3递归组件中必须用v-if判断子项存在？](https://blog.cmdragon.cn/posts/455dc2d47c38d12c1cf350e490041e8b/)
- [Vue3列表渲染中，如何用数组方法与计算属性优化v-for的数据处理？](https://blog.cmdragon.cn/posts/3f842bbd7ba0f9c91151b983bf784c8b/)
- [Vue v-for的key：为什么它能解决列表渲染中的“玄学错误”？选错会有哪些后果？](https://blog.cmdragon.cn/posts/1eb3ffac668a743843b5ea1738301d40/)
- [Vue3中v-for与v-if为何不能直接共存于同一元素？](https://blog.cmdragon.cn/posts/138b13c5341f6a1fa9015400433a3611/)
- [Vue3中v-if与v-show的本质区别及动态组件状态保持的关键策略是什么？](https://blog.cmdragon.cn/posts/0242a94dc552b93a1bc335ac4fc33db5/)
- [Vue3中v-show如何通过CSS修改display属性控制条件显示？与v-if的应用场景该如何区分？](https://blog.cmdragon.cn/posts/97c66a18ae0e9b57c6a69b8b3a41ddf6/)
- [Vue3条件渲染中v-if系列指令如何合理使用与规避错误？](https://blog.cmdragon.cn/posts/8a1ddfac64b25062ac56403e4c1201d2/)
- [Vue3动态样式控制：ref、reactive、watch与computed的应用场景与区别是什么？](https://blog.cmdragon.cn/posts/218c3a59282c3b757447ee08a01937bb/)
- [Vue3中动态样式数组的后项覆盖规则如何与计算属性结合实现复杂状态样式管理？](https://blog.cmdragon.cn/posts/1bab953e41f66ac53de099fa9fe76483/)
- [Vue浅响应式如何解决深层响应式的性能问题？适用场景有哪些？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c85e1fe16a7ae45e965b4e2df4d9d2f4/)
- [Vue 3组合式API中ref与reactive的核心响应式差异及使用最佳实践是什么？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/be04b02d2723994632de0d4ca22a3391/)
- [Vue 3组合式API中ref与reactive的核心响应式差异及使用最佳实践是什么？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/be04b02d2723994632de0d4ca22a3391/)
- [Vue3响应式系统中，对象新增属性、数组改索引、原始值代理的问题如何解决？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/a0af08dd60a37b9a890a9957f2cbfc9f/)
- [Vue 3中watch侦听器的正确使用姿势你掌握了吗？深度监听、与watchEffect的差异及常见报错解析 - cmdragon's Blog](https://blog.cmdragon.cn/posts/bc287e1e36287afd90750fd907eca85e/)
- [Vue响应式声明的API差异、底层原理与常见陷阱你都搞懂了吗 - cmdragon's Blog](https://blog.cmdragon.cn/posts/654b9447ef1ba7ec1126a1bc26a4726d/)
- [Vue响应式声明的API差异、底层原理与常见陷阱你都搞懂了吗 - cmdragon's Blog](https://blog.cmdragon.cn/posts/654b9447ef1ba7ec1126a1bc26a4726d/)
- [为什么Vue 3需要ref函数？它的响应式原理与正确用法是什么？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c405a8d9950af5b7c63b56c348ac36b6/)
- [Vue 3中reactive函数如何通过Proxy实现响应式？使用时要避开哪些误区？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/a7e9abb9691a81e4404d9facabe0f7c3/)
- [Vue3响应式系统的底层原理与实践要点你真的懂吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/bd995ea45161727597fb85b62566c43d/)
- [Vue 3模板如何通过编译三阶段实现从声明式语法到高效渲染的跨越 - cmdragon's Blog](https://blog.cmdragon.cn/posts/53e3f270a80675df662c6857a3332c0f/)
- [快速入门Vue模板引用：从收DOM“快递”到调子组件方法，你玩明白了吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/ddbce4f2a23aa72c96b1c0473900321e/)
- [快速入门Vue模板里的JS表达式有啥不能碰？计算属性为啥比方法更能打？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/23a2d5a334e15575277814c16e45df50/)
- [快速入门Vue的v-model表单绑定：语法糖、动态值、修饰符的小技巧你都掌握了吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/6be38de6382e31d282659b689c5b17f0/)
- [快速入门Vue3事件处理的挑战题：v-on、修饰符、自定义事件你能通关吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/60ce517684f4a418f453d66aa805606c/)
- [快速入门Vue3的v-指令：数据和DOM的“翻译官”到底有多少本事？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/e4ae7d5e4a9205bb11b2baccb230c637/)
- [快速入门Vue3，插值、动态绑定和避坑技巧你都搞懂了吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/999ce4fb32259ff4fbf4bf7bcb851654/)
- [想让PostgreSQL快到飞起？先找健康密码还是先换引擎？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/a6997d81b49cd232b87e1cf603888ad1/)
- [想让PostgreSQL查询快到飞起？分区表、物化视图、并行查询这三招灵不灵？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/1fee7afbb9abd4540b8aa9c141d6845d/)
- [子查询总拖慢查询？把它变成连接就能解决？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/79c590fbd87ece535b11a71c9667884f/)
- [PostgreSQL全表扫描慢到崩溃？建索引+改查询+更统计信息三招能破？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/748cdac2536008199abf8a8a2cd0ec85/)
- [复杂查询总拖后腿？PostgreSQL多列索引+覆盖索引的神仙技巧你get没？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/32ca943703226d317d4276a8fb53b0dd/)
- [只给表子集建索引？用函数结果建索引？PostgreSQL这俩操作凭啥能省空间又加速？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/ca93f1d53aa910e7ba5ffd8df611c12b/)
- [B-tree索引像字典查词一样工作？那哪些数据库查询它能加速，哪些不能？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/f507856ebfddd592448813c510a53669/)
- [想抓PostgreSQL里的慢SQL？pg_stat_statements基础黑匣子和pg_stat_monitor时间窗，谁能帮你更准揪出性能小偷？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/b2213bfcb5b88a862f2138404c03d596/)
- [PostgreSQL的“时光机”MVCC和锁机制是怎么搞定高并发的？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/26614eb7da6c476dde41d367ad888d2f/)
- [PostgreSQL性能暴涨的关键？内存IO并发参数居然要这么设置？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/69f99bc6972a860d559c74aad7280da4/)
- [大表查询慢到翻遍整个书架？PostgreSQL分区表教你怎么“分类”才高效](https://blog.cmdragon.cn/posts/7b7053f392147a8b3b1a16bebeb08d0a/)
- [PostgreSQL 查询慢？是不是忘了优化 GROUP BY、ORDER BY 和窗口函数？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c856e3cb073822349f3bf2d29995dcfc/)
- [PostgreSQL里的子查询和CTE居然在性能上“掐架”？到底该站哪边？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c096347d18e67b7431faacd2c4757093/)
- [PostgreSQL选Join策略有啥小九九？Nested Loop/Merge/Hash谁是它的菜？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/2eca89463454fd4250d7b66243b9fe5a/)
- [PostgreSQL新手SQL总翻车？这7个性能陷阱你踩过没？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/068ecb772a87d7df20a8c9fb4b233f8e/)
- [PostgreSQL索引选B-Tree还是GiST？“瑞士军刀”和“多面手”的差别你居然还不知道？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/d498f63cd0a2d5a77e445c688a8b88db/)
- [想知道数据库怎么给查询“算成本选路线”？EXPLAIN能帮你看明白？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/9101b75bdec6faea9b35d54f14e37f36/)
- [PostgreSQL处理SQL居然像做蛋糕？解析到执行的4步里藏着多少查询优化的小心机？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/d527f8ebb6e3dae2c7dfe4c8d8979444/)
- [PostgreSQL备份不是复制文件？物理vs逻辑咋选？误删还能精准恢复到1分钟前？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/6bfdae84f313cf7ad0bb7045c4392347/)
- [转账不翻车、并发不干扰，PostgreSQL的ACID特性到底有啥魔法？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/de3672803de34dbad244d0a8d48b0eb5/)
- [银行转账不白扣钱、电商下单不超卖，PostgreSQL事务的诀窍是啥？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/e463e8a2668abdf00a228c9b79324ded/)
- [PostgreSQL里的PL/pgSQL到底是啥？能让SQL从“说目标”变“讲步骤”？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/5c967e595058c4a1fc4474a68e64031d/)
- [PostgreSQL视图不存数据？那它怎么简化查询还能递归生成序列和控制权限？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/325047855e3e23b5ef82f7d2db134fbd/)
- [PostgreSQL索引这么玩，才能让你的查询真的“飞”起来？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/d2dba50bb6e4df7b27e735245a06a2a2/)
- [PostgreSQL的表关系和约束，咋帮你搞定用户订单不混乱、学生选课不重复？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/849ae5bab0f8c66e94c2f6ad1bb798e3/)
- [PostgreSQL查询的筛子、排序、聚合、分组？你会用它们搞定数据吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/ef4800975ffa84f1ca51976a70a1585b/)
- [PostgreSQL数据类型怎么选才高效不踩坑？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/bf54711525c507c5eacfa7b0151c39d2/)
- [想解锁PostgreSQL查询从基础到进阶的核心知识点？你都get了吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/887809b3e0375f5956873cd442f516d8/)
- [PostgreSQL DELETE居然有这些操作？返回数据、连表删你试过没？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/934be1203725e8be9d6f6e9104e5abcc/)
- [PostgreSQL UPDATE语句怎么玩？从改邮箱到批量更新的避坑技巧你都会吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/0f0622e9b7402b599e618150d0596ffe/)
- [PostgreSQL插入数据还在逐条敲？批量、冲突处理、返回自增ID的技巧你会吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/0e3bf7efc030b024ea67ee855a00f2de/)
- [PostgreSQL的“仓库-房间-货架”游戏，你能建出电商数据库和表吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/b6cd3c86da6aac26ed829e472d34078e/)
- [PostgreSQL 17安装总翻车？Windows/macOS/Linux避坑指南帮你搞定？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/ba1f545a3410144552fbdbfcf31b5265/)
- [能当关系型数据库还能玩对象特性，能拆复杂查询还能自动管库存，PostgreSQL凭什么这么香？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/b5474d1480509c5072085abc80b3dd9f/)
- [给接口加新字段又不搞崩老客户端？FastAPI的多版本API靠哪三招实现？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/cc098d8836e787baa8a4d92e4d56d5c5/)
- [流量突增要搞崩FastAPI？熔断测试是怎么防系统雪崩的？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/46d05151c5bd31cf37a7bcf0b8f5b0b8/)
- [FastAPI秒杀库存总变负数？Redis分布式锁能帮你守住底线吗 - cmdragon's Blog](https://blog.cmdragon.cn/posts/65ce343cc5df9faf3a8e2eeaab42ae45/)
- [FastAPI的CI流水线怎么自动测端点，还能让Allure报告美到犯规？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/eed6cd8985d9be0a4b092a7da38b3e0c/)
- [如何用GitHub Actions为FastAPI项目打造自动化测试流水线？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/6157d87338ce894d18c013c3c4777abb/)

</details>


<details>
<summary>免费好用的热门在线工具</summary>

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
- [IP归属地查询 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/ip-geolocation)
- [图片无损放大 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/image-upscaler)
- [文本比较工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/text-compare)
- [IP批量查询工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/ip-batch-lookup)
- [域名查询工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/domain-finder)
- [DNS工具箱 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/dns-toolkit)
- [网站图标生成器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/favicon-generator)
- [XML Sitemap](https://tools.cmdragon.cn/sitemap_index.xml)

</details>