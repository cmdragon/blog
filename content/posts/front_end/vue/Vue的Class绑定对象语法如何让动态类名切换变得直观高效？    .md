---
url: /posts/a9e7ed9dc135b1dc2120fda6242905a1/
title: Vue的Class绑定对象语法如何让动态类名切换变得直观高效？
date: 2025-12-14T08:10:27+08:00
lastmod: 2025-12-14T08:10:27+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/exbix_00026_.png

summary:
  Vue的Class绑定对象语法（:class）通过对象键值对动态控制类名，键为类名、值为布尔值/表达式决定类是否生效。可同时使用静态类与动态类，支持reactive定义响应式类对象、computed处理复杂逻辑。适用于按钮激活、Tabs高亮、输入验证等场景，数据变化时类名自动更新，避免手动拼接类名。

categories:
  - vue

tags:
  - 基础入门
  - Vue class对象语法
  - Vue Composition API
  - 响应式类绑定
  - Vue Tabs组件
  - 静态动态类合并
  - 类名连字符处理

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/exbix_00026_.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

大家在开发Vue项目时，肯定遇到过这样的场景：按钮点击后要切换“激活状态”的样式，表单验证失败要显示“错误提示”的红色文本，或者
tabs 切换时高亮当前标签。这些**动态切换类名**的需求，Vue 的 `Class 绑定对象语法`
能完美解决——它就像一个“样式开关”，让类名跟着数据状态自动变化，彻底告别手动拼接字符串的麻烦。

### 一、对象语法基础：键是类名，值是“开关”

Vue 为 `class` 属性提供了特殊的 `v-bind`（简写为 `:`）增强：当你绑定一个**对象**时，**对象的键是要添加的类名**，**值是布尔值
**（或返回布尔值的表达式），用来决定这个类是否“生效”。

#### 最基础的例子：按钮激活状态

```vue

<template>
  <!-- 当 isActive 为 true 时，添加 active 类 -->
  <button :class="{ active: isActive }" @click="toggleActive">
    {{ isActive ? '激活' : '未激活' }}
  </button>
</template>

<script setup>
  import {ref} from 'vue'
  // 响应式变量：控制按钮是否激活
  const isActive = ref(false)
  // 点击事件：切换 isActive 状态
  const toggleActive = () => isActive.value = !isActive.value
</script>

<style>
  .active {
    background-color: #42b983;
    color: white;
    border: none;
  }

  button {
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }
</style>
```

这段代码的逻辑很直观：

- `isActive` 是用 `ref` 定义的**响应式变量**（初始为 `false`）；
- 点击按钮时，`toggleActive` 函数翻转 `isActive` 的值；
- `:class="{ active: isActive }"` 会根据 `isActive` 的值自动添加/移除 `active` 类。

#### 小细节：类名带连字符怎么办？

如果类名像 `text-danger` 这样包含连字符（不符合 JavaScript 标识符规则），**必须用引号把键包起来**，否则会报语法错误：

```vue
<!-- 正确写法：'text-danger' 作为字符串键 -->
<div :class="{ 'text-danger': hasError }"></div>
```

### 二、静态类与动态类的“和平共处”

实际开发中，元素往往既有**固定不变的静态类**（比如布局类 `container`），又有**动态切换的类**（比如 `active`）。Vue 允许你同时使用
`class` 属性和 `:class` 绑定，两者会自动合并：

```vue

<template>
  <!-- 静态类 container + 动态类 active/text-danger -->
  <div class="container" :class="{ active: isActive, 'text-danger': hasError }">
    内容区域
  </div>
</template>

<script setup>
  import {ref} from 'vue'

  const isActive = ref(true)   // 激活状态
  const hasError = ref(false) // 错误状态
</script>

<style>
  .container {
    padding: 20px;
    border: 1px solid #eee;
  }

  .active {
    border-color: #42b983;
  }

  .text-danger {
    color: #e53935;
  }
</style>
```

此时渲染的结果是：`<div class="container active">内容区域</div>`。如果 `hasError` 变为 `true`，结果会变成
`container active text-danger`——完全不用手动拼接字符串！

### 三、从“Inline 对象”到“响应式对象”：让代码更整洁

如果动态类很多，inline 对象会让模板变得拥挤。这时可以把类对象抽到**响应式变量**或**计算属性**里，让代码更可读。

#### 1. 用 `reactive` 定义类对象（Composition API）

如果类的状态比较固定，可以用 `reactive` 定义一个响应式的类对象，直接绑定到 `:class`：

```vue

<template>
  <div :class="classObject">响应式类对象示例</div>
</template>

<script setup>
  import {reactive} from 'vue'
  // 用 reactive 定义响应式的类对象
  const classObject = reactive({
    active: true,
    'text-danger': false,
    'font-large': true
  })
</script>

<style>
  .font-large {
    font-size: 18px;
  }
</style>
```

这里 `classObject` 是响应式的，修改它的属性会直接更新类名：比如 `classObject['text-danger'] = true`，会立即添加
`text-danger` 类。

#### 2. 计算属性：处理复杂逻辑的“神器”

当类名的切换依赖**多个状态**时，计算属性（`computed`）是最佳选择。比如一个提交按钮，要根据“是否加载中”和“是否有错误”来切换样式：

```vue

<template>
  <button :class="buttonClass" @click="handleSubmit" :disabled="isLoading">
    {{ buttonText }}
  </button>
</template>

<script setup>
  import {ref, computed} from 'vue'

  // 状态变量
  const isLoading = ref(false)  // 加载中状态
  const hasError = ref(false)   // 错误状态

  // 计算按钮类：根据状态动态生成
  const buttonClass = computed(() => ({
    // 加载中时添加 loading 类
    loading: isLoading.value,
    // 有错误时添加 error 类
    error: hasError.value,
    // 正常状态添加 active 类
    active: !isLoading.value && !hasError.value
  }))

  // 计算按钮文字
  const buttonText = computed(() => {
    if (isLoading.value) return '加载中...'
    if (hasError.value) return '提交失败'
    return '提交表单'
  })

  // 模拟提交请求
  const handleSubmit = async () => {
    isLoading.value = true
    hasError.value = false

    // 模拟异步请求（比如调用接口）
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 模拟随机结果（50% 成功，50% 失败）
    hasError.value = Math.random() > 0.5
    isLoading.value = false
  }
</script>

<style>
  button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .loading {
    background-color: #bbdefb;
    color: #2196f3;
  }

  .error {
    background-color: #ffcdd2;
    color: #e53935;
  }

  .active {
    background-color: #42b983;
    color: white;
  }
</style>
```

这个例子中：

- `buttonClass` 是一个计算属性，**依赖 `isLoading` 和 `hasError`**；
- 当 `isLoading` 变为 `true`，`loading` 类自动添加；
- 当 `hasError` 变为 `true`，`error` 类自动添加；
- 所有状态变化都由计算属性“自动处理”，模板无需关心逻辑——这就是计算属性的魅力！

### 四、响应式的“魔法”：数据变，类名自动变

为什么数据变化时类名会自动更新？因为 Vue 的**响应式系统**在背后工作：

1. **跟踪依赖**：当你用 `ref` 或 `reactive` 定义变量时，Vue 会跟踪它的依赖（比如 `isActive` 被 `:class` 用到）；
2. **触发更新**：当变量变化时，Vue 会重新计算依赖它的表达式（比如 `{ active: isActive }`）；
3. **更新 DOM**：最后自动更新 DOM 上的类名——全程不需要你手动操作！

比如下面的例子，输入框内容长度超过5时，添加 `valid` 类，否则添加 `invalid` 类：

```vue

<template>
  <input
      type="text"
      v-model="inputValue"
      :class="{ valid: inputValue.length > 5, invalid: inputValue.length <= 5 }"
      placeholder="输入至少6个字符"
  >
</template>

<script setup>
  import {ref} from 'vue'

  const inputValue = ref('') // 输入框内容（响应式）
</script>

<style>
  input {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .valid {
    border-color: #42b983;
  }

  .invalid {
    border-color: #e53935;
  }
</style>
```

当输入内容长度超过5时，`valid` 类自动添加；否则添加 `invalid` 类——完全由 `inputValue` 的变化驱动！

### 五、实际案例：Tabs 组件的高亮切换

我们用对象语法实现一个常见的 Tabs 组件，点击 tab 时高亮当前标签：

```vue

<template>
  <div class="tabs">
    <button
        v-for="(tab, index) in tabs"
        :key="index"
        :class="{ active: currentTab === index }"
        @click="currentTab = index"
    >
      {{ tab.title }}
    </button>
    <div class="tab-content">
      {{ tabs[currentTab].content }}
    </div>
  </div>
</template>

<script setup>
  import {ref} from 'vue'

  // Tabs 数据
  const tabs = ref([
    {title: '首页', content: '首页内容...'},
    {title: '文章', content: '文章内容...'},
    {title: '关于', content: '关于我们...'}
  ])
  // 当前激活的 tab 索引
  const currentTab = ref(0)
</script>

<style>
  .tabs {
    border-bottom: 1px solid #eee;
    margin-bottom: 16px;
  }

  .tabs button {
    padding: 8px 16px;
    border: none;
    background: none;
    cursor: pointer;
  }

  .tabs button.active {
    border-bottom: 2px solid #42b983;
    color: #42b983;
  }

  .tab-content {
    padding: 16px;
  }
</style>
```

这段代码的核心逻辑：

- `v-for` 循环渲染 tabs 按钮；
- `:class="{ active: currentTab === index }"`：当当前 tab 索引等于按钮索引时，添加 `active` 类；
- 点击按钮时，更新 `currentTab` 的值——高亮效果自动切换！

### 六、常见报错与解决

#### 报错1：类名不生效，控制台无错误

**原因**：响应式变量没有正确定义（比如用 `let` 而不是 `ref`/`reactive`），导致数据变化时无法触发重新渲染。  
**解决**：用 `ref` 或 `reactive` 定义状态变量，比如 `const isActive = ref(false)` 而不是 `let isActive = false`。

#### 报错2：“Uncaught SyntaxError: Unexpected token '-'”

**原因**：带连字符的类名没有用引号包裹，比如 `{ text-danger: hasError }`，JavaScript 会解析成 `text - danger`（变量 `text`
减变量 `danger`）。  
**解决**：把类名用引号包裹：`{ 'text-danger': hasError }`。

#### 报错3：计算属性返回的类对象不更新

**原因**：计算属性没有正确依赖响应式变量，比如在计算属性中使用了非响应式的数据。  
**解决**：确保计算属性内部用到的所有变量都是响应式的（用 `ref`/`reactive` 定义），比如
`computed(() => ({ active: isActive.value }))` 中的 `isActive` 是 `ref`。

### 参考链接

https://vuejs.org/guide/essentials/class-and-style.html#object-syntax

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[Vue的Class绑定对象语法如何让动态类名切换变得直观高效？](https://blog.cmdragon.cn/posts/a9e7ed9dc135b1dc2120fda6242905a1/)



<details>
<summary>往期文章归档</summary>

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