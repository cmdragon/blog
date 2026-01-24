---
url: /posts/ddbce4f2a23aa72c96b1c0473900321e/
title: 快速入门Vue模板引用：从收DOM“快递”到调子组件方法，你玩明白了吗？
date: 2025-11-03T02:55:45+08:00
lastmod: 2025-11-03T02:55:45+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/45615ca51f7b4d1788b190a511393b92~tplv-5jbd59dj06-image.png

summary:
  Vue中的模板引用（Template Refs）用于在声明式编程中直接操作DOM或访问子组件实例。通过`ref`属性标记元素或组件，并在`setup`中使用同名响应式变量访问。子组件需通过`defineExpose`暴露内部方法或属性供父组件调用。操作DOM时，应在`onMounted`或`nextTick`中确保DOM已渲染。常见应用包括自动聚焦输入框、集成第三方库和动态获取元素尺寸。

categories:
  - vue

tags:
  - 基础入门
  - 模板引用
  - DOM操作
  - 组件通信
  - nextTick
  - defineExpose
  - 最佳实践

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/45615ca51f7b4d1788b190a511393b92~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 一、模板引用的基本概念与用法

在Vue的声明式编程模型中，我们通常不需要直接操作DOM——Vue会根据数据自动更新视图。但**有些场景必须直接接触DOM**
：比如聚焦输入框、获取元素尺寸、集成第三方DOM库（如Chart.js）。这时候，**模板引用（Template Refs）**就成了连接声明式世界与命令式DOM操作的桥梁。

#### 1.1 什么是模板引用？

模板引用是Vue提供的一种**标记DOM元素或组件的方式**：通过给元素或组件添加`ref`属性（类似“标签”），我们可以在`setup`
中通过同名的响应式变量，直接访问对应的DOM元素或组件实例。

#### 1.2 如何声明和使用模板引用？

使用模板引用的步骤非常简单，只需两步：

1. **在模板中标记元素**：给需要引用的元素添加`ref="xxx"`属性；
2. **在`setup`中创建响应式变量**：用`ref(null)`创建同名变量，Vue会自动将DOM元素赋值给它。

**注意**：模板引用的变量必须用`ref(null)`初始化（初始值为`null`），因为Vue会在**组件挂载后**才将DOM元素赋值给它。

#### 1.3 示例：自动聚焦输入框

下面是一个最常见的场景——页面加载后自动聚焦输入框：

```vue

<template>
  <!-- 用ref标记输入框 -->
  <input ref="inputRef" type="text" placeholder="请输入内容"/>
</template>

<script setup>
  // 1. 导入需要的API：ref（创建响应式变量）、onMounted（生命周期钩子）
  import {ref, onMounted} from 'vue'

  // 2. 创建响应式变量，初始值为null（此时DOM还未渲染）
  const inputRef = ref(null)

  // 3. 组件挂载后（DOM已渲染），聚焦输入框
  onMounted(() => {
    // inputRef.value 此时指向模板中的<input>元素
    inputRef.value.focus()
  })
</script>
```

**代码解释**：

- `ref="inputRef"`：给输入框贴了个“标签”，告诉Vue“我要引用这个元素”；
- `const inputRef = ref(null)`：在`setup`中创建一个“容器”，等待Vue把DOM元素装进来；
- `onMounted`：组件挂载完成的生命周期钩子，此时DOM已经渲染完成，`inputRef.value`不再是`null`，可以安全调用`focus()`方法。

### 二、组件的模板引用与暴露

模板引用不仅能标记DOM元素，还能标记**子组件**。但组件的引用有个特殊规则：**默认情况下，子组件的内部状态和方法是“私有的”，父组件无法直接访问
**。如果要让父组件调用子组件的方法或访问其内部元素，必须用`defineExpose`显式暴露。

#### 2.1 引用子组件的默认行为

当你给子组件添加`ref`属性时，父组件拿到的是**子组件的根元素**（如果子组件有多个根元素，会报错）。比如：

```vue
<!-- ParentComponent.vue -->
<template>
  <!-- 引用子组件 -->
  <ChildComponent ref="childRef"/>
</template>

<script setup>
  import {ref, onMounted} from 'vue'
  import ChildComponent from './ChildComponent.vue'

  const childRef = ref(null)

  onMounted(() => {
    // childRef.value 指向子组件的根元素（比如<div>）
    console.log(childRef.value)
  })
</script>
```

#### 2.2 暴露子组件内部内容：`defineExpose`

如果父组件需要访问子组件的**内部方法或非根元素**，子组件必须用`defineExpose`将这些内容“公开”。`defineExpose`是Vue
3的内置API，专门用于暴露`setup`中的内容给父组件。

#### 2.3 示例：父组件调用子组件的方法

假设子组件有一个“点击按钮”的方法，父组件需要直接调用它：

**子组件（ChildComponent.vue）**：

```vue

<template>
  <button @click="handleClick">子组件按钮</button>
</template>

<script setup>
  // 导入defineExpose API
  import {defineExpose} from 'vue'

  // 子组件的内部方法
  const handleClick = () => {
    console.log('子组件按钮被点击！')
  }

  // 关键：将handleClick方法暴露给父组件
  defineExpose({
    handleClick
  })
</script>
```

**父组件（ParentComponent.vue）**：

```vue

<template>
  <ChildComponent ref="childRef"/>
  <button @click="callChildMethod">调用子组件方法</button>
</template>

<script setup>
  import {ref} from 'vue'
  import ChildComponent from './ChildComponent.vue'

  // 引用子组件实例
  const childRef = ref(null)

  // 父组件调用子组件方法
  const callChildMethod = () => {
    // 通过childRef.value访问子组件暴露的handleClick
    childRef.value.handleClick()
  }
</script>
```

**效果**：点击父组件的“调用子组件方法”按钮，会触发子组件的`handleClick`，控制台输出“子组件按钮被点击！”。

### 三、DOM操作的最佳实践

直接操作DOM虽然灵活，但容易破坏Vue的响应式流程。以下是**避免踩坑的关键原则**：

#### 3.1 何时可以安全操作DOM？

DOM元素只有在**组件挂载后**才会存在，因此：

- 不要在`setup`的顶级 scope 直接访问模板引用（此时`xxx.value`还是`null`）；
- 不要在`onBeforeMount`钩子中操作DOM（组件还没挂载，元素未渲染）；
- **安全时机**：`onMounted`钩子（组件首次挂载完成）、`nextTick`（DOM更新后）。

#### 3.2 `nextTick`：处理DOM更新后的操作

Vue的DOM更新是**异步的**——当你修改数据后，Vue不会立即更新DOM，而是等到下一个“事件循环”再批量更新。如果此时直接访问DOM，拿到的会是
**旧的DOM状态**。

比如，修改`message`后想立即获取元素尺寸：

```vue

<template>
  <div ref="boxRef">{{ message }}</div>
  <button @click="updateMessage">更新内容</button>
</template>

<script setup>
  import {ref, nextTick} from 'vue'

  const message = ref('初始内容')
  const boxRef = ref(null)

  const updateMessage = async () => {
    message.value = '新的内容' // 修改数据

    // 错误：此时DOM还未更新，拿到的是旧尺寸
    console.log('旧尺寸：', boxRef.value.offsetWidth)

    // 正确：用nextTick等待DOM更新完成
    await nextTick()
    console.log('新尺寸：', boxRef.value.offsetWidth)
  }
</script>
```

**`nextTick`的作用**：将回调函数延迟到**下一次DOM更新循环后**执行，确保能拿到最新的DOM状态。

#### 3.3 示例：动态调整弹窗位置

假设我们有一个弹窗，需要根据按钮位置动态调整坐标：

```vue

<template>
  <button ref="btnRef" @click="showPopup">打开弹窗</button>
  <div ref="popupRef" class="popup" v-if="isPopupShow">
    我是弹窗
  </div>
</template>

<script setup>
  import {ref, nextTick} from 'vue'

  const btnRef = ref(null)
  const popupRef = ref(null)
  const isPopupShow = ref(false)

  const showPopup = async () => {
    isPopupShow.value = true // 显示弹窗

    // 等待弹窗渲染完成
    await nextTick()

    // 获取按钮的位置信息
    const btnRect = btnRef.value.getBoundingClientRect()

    // 调整弹窗位置（在按钮下方）
    popupRef.value.style.left = `${btnRect.left}px`
    popupRef.value.style.top = `${btnRect.bottom + 10}px`
  }
</script>

<style scoped>
  .popup {
    position: fixed;
    padding: 10px;
    background: white;
    border: 1px solid #ccc;
  }
</style>
```

**效果**：点击按钮后，弹窗会精准出现在按钮下方——`nextTick`确保我们拿到了弹窗和按钮的最新DOM状态。

### 四、模板引用的原理剖析

模板引用的底层逻辑其实很简单，我们可以用“快递比喻”理解：

1. **贴标签**：你给DOM元素贴了个`ref="inputRef"`的“快递单”；
2. **派件**：Vue在组件挂载时（`onMounted`前），会把DOM元素“快递”到`setup`中同名的`inputRef`变量里；
3. **签收**：`onMounted`钩子触发时，你已经“签收”了快递（`inputRef.value`指向DOM元素）。

对于组件引用，Vue会先将**子组件的根元素**赋值给父组件的ref变量；如果子组件用`defineExpose`
暴露了内容，Vue会将暴露的对象与根元素合并，让父组件能访问内部方法。

### 五、常见应用场景

模板引用的核心价值是**解决“声明式无法覆盖的场景”**，以下是几个典型案例：

#### 5.1 表单元素的自动聚焦

比如登录页加载后，自动聚焦用户名输入框（见1.3的示例）。

#### 5.2 第三方DOM库的集成

很多第三方库（如Chart.js、Swiper）需要直接操作DOM元素。以Chart.js为例：

```vue

<template>
  <canvas ref="chartRef"></canvas>
</template>

<script setup>
  import {ref, onMounted} from 'vue'
  import Chart from 'chart.js/auto'

  const chartRef = ref(null)
  let chartInstance = null

  onMounted(() => {
    // 用模板引用获取canvas元素，初始化Chart实例
    chartInstance = new Chart(chartRef.value, {
      type: 'bar',
      data: {
        labels: ['周一', '周二', '周三'],
        datasets: [{
          label: '销售额',
          data: [1000, 1500, 1200],
          backgroundColor: '#42b983'
        }]
      }
    })
  })
</script>
```

#### 5.3 动态获取元素尺寸

比如响应式布局中，需要根据容器宽度调整内部元素的排版：

```vue

<template>
  <div ref="containerRef" class="container">
    <div class="item" v-for="item in items" :key="item.id">{{ item.name }}</div>
  </div>
</template>

<script setup>
  import {ref, onMounted, onResize} from 'vue'

  const containerRef = ref(null)
  const items = ref([{id: 1, name: 'Item 1'}, {id: 2, name: 'Item 2'}])

  // 监听窗口resize事件
  onResize(() => {
    if (containerRef.value) {
      const width = containerRef.value.offsetWidth
      console.log('容器宽度：', width)
      // 根据宽度调整item的排列方式（如flex-wrap）
    }
  })

  onMounted(() => {
    // 初始加载时获取尺寸
    onResize()
  })
</script>
```

### 六、课后Quiz

#### 6.1 问题1：父组件如何调用子组件内部的方法？

**答案**：

1. 子组件用`defineExpose`暴露内部方法（如`defineExpose({ handleClick })`）；
2. 父组件用`ref`引用子组件（`const childRef = ref(null)`）；
3. 通过`childRef.value.xxx`调用暴露的方法（如`childRef.value.handleClick()`）。

#### 6.2 问题2：为什么修改数据后直接获取DOM尺寸会得到旧值？如何解决？

**答案**：

- 原因：Vue的DOM更新是异步的，修改数据后DOM不会立即更新；
- 解决：用`nextTick`等待DOM更新完成（如`await nextTick()`后再获取尺寸）。

### 七、常见报错与解决方案

#### 7.1 报错：`Cannot read properties of null (reading 'focus')`

**错误原因**：

- 访问模板引用时，对应的DOM元素还未渲染（如`setup`顶级scope、`onBeforeMount`）；
- 元素被`v-if`条件渲染隐藏（如`v-if="show"`刚设为`true`，DOM还未更新）。

**解决方法**：

1. 将操作放在`onMounted`钩子中；
2. 用`nextTick`等待DOM更新（如条件渲染的场景）；
3. 检查`xxx.value`是否为`null`（防御性编程）：
   ```javascript
   if (inputRef.value) {
     inputRef.value.focus()
   }
   ```

#### 7.2 报错：`Component is missing expose declaration`

**错误原因**：  
父组件引用了子组件的内部方法，但子组件未用`defineExpose`暴露。

**解决方法**：  
在子组件中用`defineExpose`暴露需要的方法或属性：

```javascript
// 子组件中
defineExpose({
    handleClick, // 暴露方法
    count        // 暴露属性
})
```

参考链接：https://vuejs.org/guide/essentials/template-refs.html

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[Vue模板引用：从收DOM“快递”到调子组件方法，你玩明白了吗？](https://blog.cmdragon.cn/posts/ddbce4f2a23aa72c96b1c0473900321e/)




<details>
<summary>往期文章归档</summary>

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
- [FastAPI如何用契约测试确保API的「菜单」与「菜品」一致？](https://blog.cmdragon.cn/posts/02b0c96842d1481c72dab63a149ce0dd/)
- [为什么TDD能让你的FastAPI开发飞起来？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c9c1e3bb0fdc15303b9b3b1f20124b0b/)
- [如何用FastAPI玩转多模块测试与异步任务，让代码不再“闹脾气”？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/ddbfa0447a5d0d6f9af12e7a6b206f70/)
- [如何在FastAPI中玩转“时光倒流”的数据库事务回滚测试？](https://blog.cmdragon.cn/posts/bf9883a75ffa46b523a03b16ec56ce48/)
- [如何在FastAPI中优雅地模拟多模块集成测试？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/be553dbd5d51835d2c69553f4a773e2d/)
- [多环境配置切换机制能否让开发与生产无缝衔接？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/533874f5700b8506d4c68781597db659/)
- [如何在 FastAPI 中巧妙覆盖依赖注入并拦截第三方服务调用？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/2d992ef9e8962dc0a4a0b5348d486114/)
- [为什么你的单元测试需要Mock数据库才能飞起来？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/6e69c0eedd8b1e5a74a148d36c85d7ce/)
- [如何在FastAPI中巧妙隔离依赖项，让单元测试不再头疼？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/77ae327dc941b0e74ecc6a8794c084d0/)

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