---
url: /posts/a7e9abb9691a81e4404d9facabe0f7c3/  
title: Vue 3中reactive函数如何通过Proxy实现响应式？使用时要避开哪些误区？    
date: 2025-11-06T08:05:07+08:00    
lastmod: 2025-11-06T08:05:07+08:00    
author:  cmdragon      
cover: https://api2.cmdragon.cn/upload/cmder/images/c473afe37e1849b48a223ab7aa3625bd~tplv-5jbd59dj06-image.png

summary:  
  Vue 3中的`reactive`函数用于创建响应式对象，自动追踪属性变化并触发视图更新。它基于ES6 Proxy实现，通过拦截对象操作来收集依赖和触发更新。`reactive`适用于管理复杂对象状态，如表单和购物车，但不能处理原始类型，需使用`ref`。解构`reactive`对象会失去响应式，需用`toRefs`或`toRef`转换。直接替换`reactive`对象会导致失去响应式，应修改属性或使用`Object.assign`。

categories:  
  - vue

tags:  
  - 基础入门
  - 响应式对象
  - reactive函数
  - Proxy
  - 数据驱动视图
  - 表单状态管理
  - 购物车状态管理

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/c473afe37e1849b48a223ab7aa3625bd~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 一、响应式对象的核心概念

在Vue 3中，**响应式对象**是指能自动追踪自身属性变化，并触发视图更新的特殊对象。它是Vue“数据驱动视图”核心特性的基石——当你修改响应式对象的属性时，依赖该属性的视图会自动重新渲染，无需手动操作DOM。

举个生活中的例子：响应式对象就像一个“带通知功能的快递箱”——当你往箱子里放新快递（修改属性），它会自动给你发消息（触发视图更新）；而普通对象则像普通快递箱，你放了快递也不会通知你，得自己时不时去看（手动更新DOM）。

### 二、reactive函数的基本用法

`reactive`是Vue 3提供的**创建响应式对象的核心API**，它接收一个**对象或数组**作为参数，返回一个包裹该对象的**响应式Proxy实例
**。

#### 1. 基础示例：计数器

先看一个最简单的组件，用`reactive`实现计数器功能：

```vue
<!-- src/components/Counter.vue -->
<template>
  <!-- 点击按钮时，修改state.count -->
  <button @click="increment">点击了{{ state.count }}次</button>
</template>

<script setup>
  // 从Vue中导入reactive函数
  import {reactive} from 'vue'

  // 创建响应式对象：包含count属性
  const state = reactive({count: 0})

  // 点击事件处理函数：修改响应式对象的属性
  function increment() {
    state.count++ // 修改属性，自动触发视图更新
  }
</script>
```  

**运行步骤**：

- 初始化Vue项目（用Vite）：`npm create vite@latest my-vue-app -- --template vue`
- 进入项目：`cd my-vue-app`
- 安装依赖：`npm install`
- 运行项目：`npm run dev`
- 在浏览器中打开`http://localhost:5173`，点击按钮就能看到计数更新。

#### 2. 关键说明

- **`reactive`的限制**：只能处理**对象或数组**，不能处理原始类型（如`number`、`string`）。如果要让原始类型响应式，需要用`ref`
  （后续章节会讲）。
- **直接修改属性有效**：因为`state`是Proxy实例，修改它的属性会触发`set`陷阱（后面讲原理），从而更新视图。

### 三、reactive的实现原理：Proxy与响应式系统

Vue 3的响应式系统基于**ES6 Proxy**实现，这是它和Vue 2（用`Object.defineProperty`）的核心区别。

#### 1. Proxy的作用

Proxy可以理解为“对象的代理人”——它会拦截对原始对象的**所有操作**（如属性访问、修改、删除等），并在这些操作发生时执行自定义逻辑。

对于`reactive`创建的对象，Vue会做两件事：

1. **收集依赖（Track）**：当访问Proxy对象的属性时（如`state.count`），Vue会记录“谁在使用这个属性”（比如组件的渲染函数）。
2. **触发更新（Trigger）**：当修改Proxy对象的属性时（如`state.count++`），Vue会通知所有依赖该属性的“使用者”，让它们重新执行（比如重新渲染组件）。

#### 2. 响应式流程流程图

```mermaid
graph TD
  A[原始对象（如{ count: 0 }）] --> B[reactive函数]
  B --> C[Proxy对象（响应式代理）]
  C --> D[访问属性（如state.count）]
  D --> E[收集依赖（Track）：记录使用该属性的组件]
  C --> F[修改属性（如state.count++）]
  F --> G[触发更新（Trigger）：通知依赖组件重新渲染]
  G --> H[视图更新]
```  

### 四、reactive的应用场景

`reactive`最适合处理**复杂的响应式对象**，比如：

#### 1. 表单状态管理

表单数据通常是多个字段的组合，用`reactive`可以统一管理：

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="formState.username" placeholder="用户名" />
    <input v-model="formState.password" type="password" placeholder="密码" />
    <button type="submit">登录</button>
  </form>
</template>

<script setup>
import { reactive } from 'vue'

// 用reactive管理表单状态
const formState = reactive({
  username: '',
  password: ''
})

function handleSubmit() {
  console.log('提交的表单数据：', formState)
  // 在这里发送请求到后端...
}
</script>
```  

#### 2. 购物车状态管理

购物车包含商品列表、总金额等多个属性，用`reactive`可以轻松维护：

```javascript
import {reactive} from 'vue'

const cart = reactive({
    items: [], // 商品列表，每个item包含id、name、price、quantity
    total: 0   // 总金额
})

// 添加商品到购物车
function addToCart(product) {
    const existingItem = cart.items.find(item => item.id === product.id)
    if (existingItem) {
        existingItem.quantity++ // 修改嵌套属性，仍能触发更新
    } else {
        cart.items.push({...product, quantity: 1})
    }
    // 更新总金额
    cart.total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}
```  

### 五、使用reactive的注意事项

#### 1. 不能解构reactive对象（否则失去响应式）

**错误示例**：

```javascript
const state = reactive({count: 0})
const {count} = state // 解构得到的count是原始值，不是响应式的
count++ // 修改count不会触发视图更新
```  

**原因**：解构会把Proxy对象的属性“提取”成原始值，失去了Proxy的代理能力。

**解决方案**：用`toRefs`或`toRef`将属性转换为响应式的`ref`：

```javascript
import {reactive, toRefs} from 'vue'

const state = reactive({count: 0})
const {count} = toRefs(state) // count变成ref对象，需用.count.value访问
count.value++ // 仍能触发视图更新
```  

#### 2. 不能直接替换reactive对象

**错误示例**：

```javascript
let state = reactive({ count: 0 })
state = { count: 1 } // 错误！state不再是Proxy对象，失去响应式
```  

**原因**：`reactive`返回的是Proxy实例，直接替换`state`会让它指向一个普通对象，不再具备响应式能力。

**解决方案**：修改对象的**属性**而非替换整个对象：

```javascript
// 正确做法1：直接修改属性
state.count = 1

// 正确做法2：用Object.assign合并对象
Object.assign(state, { count: 1 })
```  

#### 3. 嵌套对象会自动响应式

`reactive`是**深度代理**的，嵌套对象的属性也会被Proxy包裹。比如：

```javascript
const state = reactive({
    user: {name: 'Alice'} // 嵌套对象
})
state.user.name = 'Bob' // 修改嵌套属性，仍能触发视图更新
```  

### 六、课后Quiz

#### 问题1：为什么解构reactive对象后修改属性不会触发视图更新？如何解决？

**答案**：

- 原因：解构会将Proxy对象的属性提取为**原始值**（如`state.count`是`0`，解构后`count`就是`0`），失去了Proxy的代理能力，修改原始值不会触发
  `set`陷阱。
- 解决方案：用`toRefs`将reactive对象的所有属性转换为`ref`，或用`toRef`转换单个属性。

#### 问题2：reactive函数和ref函数的核心区别是什么？分别适用于什么场景？

**答案**：

- **`reactive`**：
    - 只能处理**对象/数组**；
    - 不需要`.value`访问属性；
    - 适合管理**复杂的多属性状态**（如表单、购物车）。
- **`ref`**：
    - 可以处理**原始类型**（如`number`、`string`）或**单个值**；
    - 需要用`.value`访问属性（在`<script>`中）；
    - 适合管理**简单的单个响应式值**（如计数器的`count`、开关的`isOpen`）。

### 七、常见报错与解决方案

#### 1. 错误：`reactive`传入原始类型导致无效

**报错场景**：

```javascript
const num = reactive(1) // 错误：reactive只能处理对象/数组
num.value++ // 无效果，因为num不是Proxy对象
```  

**原因**：`reactive`的参数必须是对象或数组，传入原始类型会返回原值（非响应式）。

**解决方案**：用`ref`处理原始类型：

```javascript
import { ref } from 'vue'
const num = ref(1)
num.value++ // 正确，视图会更新
```  

#### 2. 错误：修改解构后的属性不更新视图

**报错场景**：

```javascript
const state = reactive({ count: 0 })
const { count } = state
count++ // 视图不更新
```  

**原因**：解构失去响应式（见第五章注意事项1）。

**解决方案**：用`toRefs`或`toRef`：

```javascript
const { count } = toRefs(state)
count.value++ // 正确
```  

#### 3. 错误：直接替换reactive对象导致失去响应式

**报错场景**：

```javascript
let state = reactive({count: 0})
state = {count: 1} // 错误：state变成普通对象
```  

**原因**：`state`不再指向Proxy实例，修改它的属性不会触发更新。

**解决方案**：修改对象的**属性**而非替换整个对象：

```javascript
state.count = 1 // 正确
// 或合并对象
Object.assign(state, {count: 1})
```  

### 参考链接

- Vue 3响应式基础：https://vuejs.org/guide/essentials/reactivity-fundamentals.html
- `reactive` API文档：https://vuejs.org/api/reactivity-core.html#reactive
- `toRefs` API文档：https://vuejs.org/api/reactivity-utilities.html#torefs

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[Vue 3中reactive函数如何通过Proxy实现响应式？使用时要避开哪些误区？](https://blog.cmdragon.cn/posts/a7e9abb9691a81e4404d9facabe0f7c3/)



<details>
<summary>往期文章归档</summary>

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
- [FastAPI如何用契约测试确保API的「菜单」与「菜品」一致？](https://blog.cmdragon.cn/posts/02b0c96842d1481c72dab63a149ce0dd/)
- [为什么TDD能让你的FastAPI开发飞起来？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c9c1e3bb0fdc15303b9b3b1f20124b0b/)
- [如何用FastAPI玩转多模块测试与异步任务，让代码不再“闹脾气”？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/ddbfa0447a5d0d6f9af12e7a6b206f70/)
- [如何在FastAPI中玩转“时光倒流”的数据库事务回滚测试？](https://blog.cmdragon.cn/posts/bf9883a75ffa46b523a03b16ec56ce48/)
- [如何在FastAPI中优雅地模拟多模块集成测试？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/be553dbd5d51835d2c69553f4a773e2d/)
- [多环境配置切换机制能否让开发与生产无缝衔接？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/533874f5700b8506d4c68781597db659/)
- [如何在 FastAPI 中巧妙覆盖依赖注入并拦截第三方服务调用？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/2d992ef9e8962dc0a4a0b5348d486114/)
- [为什么你的单元测试需要Mock数据库才能飞起来？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/6e69c0eedd8b1e5a74a148d36c85d7ce/)

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