---
url: /posts/218c3a59282c3b757447ee08a01937bb/
title: Vue3动态样式控制：ref、reactive、watch与computed的应用场景与区别是什么？
date: 2025-12-19T04:54:59+08:00
lastmod: 2025-12-19T04:54:59+08:00
author: cmdragon
cover: /images/generated_image_84188769-98f0-44ed-a6a8-a183825c3e69.png

summary:
  Vue3动态样式开发通过响应式数据（ref/reactive）、watch（监听滚动/输入等变化）、computed（计算复合样式并缓存）及生命周期（onMounted初始化、onUnmounted清理）实现。ref管理简单样式，reactive封装复杂对象，watch触发样式动态调整，computed高效计算多数据依赖样式，生命周期确保DOM操作安全和资源清理。

categories:
  - vue

tags:
  - 基础入门
  - 响应式数据
  - ref
  - reactive
  - Watch
  - Computed
  - 生命周期

---

<img src="/images/generated_image_84188769-98f0-44ed-a6a8-a183825c3e69.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 一、响应式数据：动态样式的“开关”

在Vue3中，**响应式数据**是动态样式的核心驱动力——当数据变化时，Vue会自动追踪并更新关联的样式。我们常用`ref`（用于基本类型）和
`reactive`（用于对象/数组）来定义响应式数据，再通过`v-bind:style`或`v-bind:class`绑定到模板。

#### 1.1 用`ref`绑定简单样式

`ref`适合管理**单一或少量样式属性**（如颜色、字体大小）。比如一个可切换主题的按钮：

```vue

<template>
  <!-- 用:style绑定ref变量 -->
  <button
      class="dynamic-btn"
      :style="{ 
      backgroundColor: btnColor, 
      fontSize: `${fontSize}px` 
    }"
      @click="toggleStyle"
  >
    点击切换样式
  </button>
</template>

<script setup>
  import {ref} from 'vue'

  // 用ref定义响应式样式数据
  const btnColor = ref('#42b983') // 初始绿色
  const fontSize = ref(16)        // 初始字体大小16px

  // 点击事件：修改响应式数据
  const toggleStyle = () => {
    btnColor.value = btnColor.value === '#42b983' ? '#2196f3' : '#42b983'
    fontSize.value += 2 // 每次点击字体增大2px
  }
</script>

<style scoped>
  .dynamic-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease; /* 过渡动画，让变化更平滑 */
  }
</style>
```  

**关键解释**：

- `btnColor.value`和`fontSize.value`是响应式的，修改它们会触发Vue的重新渲染。
- `:style`绑定的是一个对象，键是CSS属性（驼峰式或短横线式都可以，Vue会自动转换），值是响应式变量。

#### 1.2 用`reactive`管理复杂样式对象

当样式属性较多时，`reactive`更适合——它能将多个样式属性封装成一个响应式对象，便于维护。比如一个可切换风格的卡片：

```vue

<template>
  <div class="card" :style="cardStyle">
    <h3>响应式卡片</h3>
    <p>这是一张用reactive管理样式的卡片</p>
  </div>
  <button @click="toggleCardStyle">切换卡片风格</button>
</template>

<script setup>
  import {reactive} from 'vue'

  // 用reactive定义复杂样式对象
  const cardStyle = reactive({
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease'
  })

  // 切换卡片样式：修改reactive对象的属性
  const toggleCardStyle = () => {
    cardStyle.backgroundColor = cardStyle.backgroundColor === '#fff' ? '#f5f5f5' : '#fff'
    cardStyle.boxShadow = cardStyle.boxShadow === '0 2px 4px rgba(0,0,0,0.1)' ? '0 4px 8px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)'
  }
</script>
```  

**优势**：

- 样式属性集中管理，避免`ref`变量泛滥；
- 修改`reactive`对象的属性时，Vue会自动追踪变化（深层响应式）。

### 二、`watch`：监听变化的“样式控制器”

`watch`能监听响应式数据的变化，**根据数据变化动态调整样式**。常见场景如：监听滚动位置、用户输入、窗口大小等。

#### 2.1 案例：监听滚动，实现导航栏固定

很多网页的导航栏会在滚动超过一定距离后“固定”在顶部，这个效果可以用`watch`结合滚动事件实现：

```vue

<template>
  <nav :style="navStyle">
    <a href="#home">首页</a>
    <a href="#about">关于我们</a>
    <a href="#contact">联系我们</a>
  </nav>
  <!-- 模拟长内容 -->
  <div class="content" :style="{ height: '2000px' }"></div>
</template>

<script setup>
  import {ref, watch, onMounted, onUnmounted, reactive} from 'vue'

  // 1. 定义响应式数据：记录滚动距离
  const scrollTop = ref(0)

  // 2. 定义导航栏样式
  const navStyle = reactive({
    position: 'relative',
    top: 0,
    width: '100%',
    padding: '16px 0',
    backgroundColor: '#fff',
    boxShadow: 'none',
    transition: 'all 0.3s ease',
    zIndex: 999
  })

  // 3. 监听滚动事件：更新scrollTop
  const handleScroll = () => {
    scrollTop.value = window.scrollY
  }

  // 4. 生命周期钩子：挂载时添加事件监听，卸载时移除
  onMounted(() => window.addEventListener('scroll', handleScroll))
  onUnmounted(() => window.removeEventListener('scroll', handleScroll))

  // 5. watch监听scrollTop：调整导航栏样式
  watch(scrollTop, (newVal) => {
    if (newVal > 100) { // 滚动超过100px时固定
      navStyle.position = 'fixed'
      navStyle.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'
      navStyle.backgroundColor = '#f8f8f8'
    } else { // 恢复默认样式
      navStyle.position = 'relative'
      navStyle.boxShadow = 'none'
      navStyle.backgroundColor = '#fff'
    }
  })
</script>

<style scoped>
  nav a {
    margin: 0 16px;
    text-decoration: none;
    color: #333;
  }

  .content {
    margin-top: 20px;
    background-color: #f0f0f0;
  }
</style>
```  

**关键逻辑**：

- `onMounted`中添加滚动事件监听，`onUnmounted`中移除（避免内存泄漏）；
- `watch`监听`scrollTop`的变化，当超过100px时修改导航栏的`position`为`fixed`，并添加阴影。

#### 2.2 案例：监听输入，调整输入框样式

当用户输入内容时，我们可以根据输入长度调整输入框的边框颜色（比如输入过短提示红色，足够长提示绿色）：

```vue

<template>
  <input
      type="text"
      v-model="inputValue"
      :style="inputStyle"
      placeholder="请输入内容（至少5字）"
  >
</template>

<script setup>
  import {ref, watch, reactive} from 'vue'

  const inputValue = ref('')
  const inputStyle = reactive({
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    transition: 'border-color 0.3s ease'
  })

  // 监听输入内容长度
  watch(inputValue, (newVal) => {
    if (newVal.length < 5) {
      inputStyle.borderColor = '#ff4444' // 红色：输入过短
    } else {
      inputStyle.borderColor = '#00C851' // 绿色：输入足够
    }
  })
</script>
```  

### 三、`computed`：计算式样式的“高效缓存机”

`computed`用于**根据多个响应式数据计算样式**，它会**缓存计算结果**——只有依赖的数据变化时才会重新计算，比`watch`更高效。

#### 3.1 案例：进度条的动态样式

进度条是`computed`的经典场景：根据进度值计算宽度和颜色（比如进度低于30%红色，高于70%绿色）：

```vue

<template>
  <div class="progress-container">
    <div class="progress-bar" :style="progressStyle"></div>
  </div>
  <!-- 用滑块控制进度 -->
  <input type="range" min="0" max="100" v-model="progress">
  <p>当前进度：{{ progress }}%</p>
</template>

<script setup>
  import {ref, computed} from 'vue'

  const progress = ref(50) // 初始进度50%

  // 用computed计算进度条样式
  const progressStyle = computed(() => {
    // 根据进度值判断颜色
    let barColor = ''
    if (progress.value < 30) barColor = '#ff4444'
    else if (progress.value < 70) barColor = '#ffbb33'
    else barColor = '#00C851'

    return {
      width: `${progress.value}%`, // 进度条宽度
      backgroundColor: barColor,
      transition: 'width 0.3s ease'
    }
  })
</script>

<style scoped>
  .progress-container {
    width: 100%;
    height: 20px;
    background-color: #e0e0e0;
    border-radius: 10px;
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    border-radius: 10px;
  }
</style>
```  

**优势**：

- `progressStyle`是`computed`属性，依赖`progress`——只有`progress`变化时才会重新计算；
- 缓存计算结果，避免重复计算（比如`progress`不变时，多次访问`progressStyle`不会重新执行函数）。

#### 3.2 案例：结合多个数据的复合样式

假设我们有一个“动态按钮”，样式由`size`（小/中/大）和`type`（ primary / secondary ）共同决定：

```vue

<template>
  <button :style="buttonStyle">
    动态按钮
  </button>
  <select v-model="size">
    <option value="small">小</option>
    <option value="medium">中</option>
    <option value="large">大</option>
  </select>
  <select v-model="type">
    <option value="primary">primary</option>
    <option value="secondary">secondary</option>
  </select>
</template>

<script setup>
  import {ref, computed} from 'vue'

  const size = ref('medium')
  const type = ref('primary')

  // 根据size和type计算按钮样式
  const buttonStyle = computed(() => {
    // 尺寸对应的 padding 和 font-size
    const sizeMap = {
      small: {padding: '4px 8px', fontSize: '12px'},
      medium: {padding: '8px 16px', fontSize: '14px'},
      large: {padding: '12px 24px', fontSize: '16px'}
    }
    // 类型对应的背景色
    const typeMap = {
      primary: '#2196f3',
      secondary: '#9e9e9e'
    }

    return {
      ...sizeMap[size.value], // 合并尺寸样式
      backgroundColor: typeMap[type.value],
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }
  })
</script>
```  

**解释**：

- `buttonStyle`依赖`size`和`type`两个响应式数据；
- 当`size`或`type`变化时，`computed`会重新计算样式，否则直接返回缓存的结果。

### 四、生命周期：样式的“初始化与清理”

Vue的生命周期钩子（如`onMounted`、`onUnmounted`）用于**在特定阶段处理样式**——比如初始化时获取DOM尺寸、卸载时清理事件监听。

#### 4.1 案例：`onMounted`初始化样式

`onMounted`会在**组件DOM渲染完成后执行**，适合获取DOM元素的尺寸或位置，从而初始化样式。比如一个卡片组件，初始化时根据父元素宽度调整自己的宽度：

```vue

<template>
  <div class="parent-container">
    <div ref="cardRef" class="card">
      <h3>动态初始化的卡片</h3>
      <p>宽度由父元素决定</p>
    </div>
  </div>
</template>

<script setup>
  import {ref, onMounted} from 'vue'

  const cardRef = ref(null) // 引用卡片DOM元素

  onMounted(() => {
    // 确保DOM已渲染，才能获取父元素宽度
    const parentWidth = cardRef.value.parentElement.offsetWidth
    // 设置卡片的max-width为父元素宽度的80%
    cardRef.value.style.maxWidth = `${parentWidth * 0.8}px`
  })
</script>

<style scoped>
  .parent-container {
    width: 80%;
    margin: 0 auto;
    padding: 20px;
    background-color: #f5f5f5;
  }

  .card {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin: 0 auto;
  }
</style>
```  

**注意**：

- `onMounted`中`cardRef.value`已指向真实DOM元素，因此能安全获取`parentElement`；
- 如果在`setup`直接访问`cardRef.value`，会得到`null`（因为DOM还没渲染）。

#### 4.2 `onUnmounted`：清理样式相关的副作用

当组件卸载时，需要清理**全局事件监听**或**定时器**，避免内存泄漏。比如之前的滚动监听案例，我们在`onUnmounted`中移除了滚动事件：

```javascript
onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})
```  

### 课后Quiz：巩固你的动态样式知识

1. **问题**：用`reactive`定义的样式对象，修改其深层属性时样式没更新，可能的原因是什么？如何解决？
2. **问题**：为什么`computed`比`watch`更适合处理动态样式？

#### 答案解析

1. **原因**：`reactive`的响应式是深层的，但如果**直接替换整个对象**（比如`cardStyle = { ... }`），会丢失响应式；或修改*
   *未被追踪的属性**（比如`cardStyle.newProp = 'value'`，而`newProp`不是初始对象的属性）。  
   **解决**：始终修改`reactive`对象的现有属性，而非替换整个对象；若需添加新属性，用`reactive`包裹深层对象（比如
   `cardStyle.deep = reactive({ color: 'red' })`）。

2. **原因**：`computed`会**缓存计算结果**——只有依赖的数据变化时才会重新计算；而`watch`会在每次监听的数据变化时执行回调（即使结果不变）。例如进度条案例，
   `computed`仅在`progress`变化时重新计算，`watch`则每次`progress`变化都执行回调，效率更低。

### 常见报错及解决方案

#### 1. 报错：`TypeError: Cannot read properties of null (reading 'offsetWidth')`

- **原因**：在`onMounted`之前访问`ref.value`（此时DOM未渲染，`ref.value`为`null`）。
- **解决**：确保在`onMounted`中访问DOM元素（`onMounted`会等待DOM渲染完成）。
- **预防**：访问`ref.value`前检查是否存在（如`if (cardRef.value) { ... }`）。

#### 2. 报错：响应式数据修改后，样式没更新

- **原因**：用了**非响应式变量**（比如`let color = 'red'`而非`const color = ref('red')`）；或修改了`reactive`对象的**未被追踪的属性
  **。
- **解决**：用`ref`/`reactive`正确包裹数据；修改`reactive`对象的现有属性（而非替换整个对象）。

#### 3. 报错：`watch`监听的变量没触发回调

- **原因**：监听的是**普通变量**（非响应式）；或监听`reactive`对象的**深层属性**但未开启`deep: true`。
- **解决**：监听响应式数据（`ref`/`reactive`）；监听深层属性时，用箭头函数返回该属性（比如
  `watch(() => obj.deep.color, (val) => { ... })`）。

### 参考链接

- Vue3 响应式基础：https://vuejs.org/guide/essentials/reactivity-fundamentals.html

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[Vue3动态样式控制：ref、reactive、watch与computed的应用场景与区别是什么？](https://blog.cmdragon.cn/posts/218c3a59282c3b757447ee08a01937bb/)



<details>
<summary>往期文章归档</summary>

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
- [如何用Git Hook和CI流水线为FastAPI项目保驾护航？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/fc4ef84559e04693a620d0714cb30787/)

</details>


<details>
<summary>免费好用的热门在线工具</summary>

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