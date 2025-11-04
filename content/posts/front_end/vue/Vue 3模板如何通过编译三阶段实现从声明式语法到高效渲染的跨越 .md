---
url: /posts/53e3f270a80675df662c6857a3332c0f/
title: Vue 3模板如何通过编译三阶段实现从声明式语法到高效渲染的跨越
date: 2025-11-04T08:02:04+08:00
lastmod: 2025-11-04T08:02:04+08:00
author: cmdragon
cover: /images/1bc49dcbd6ea4a8f8949c42c6634e6a9~tplv-5jbd59dj06-image.png

summary:
  Vue 3的模板编译分为解析、转换和生成三个阶段，将声明式模板转换为命令式渲染函数。解析阶段将模板字符串转换为抽象语法树（AST），转换阶段优化AST并处理指令逻辑，生成阶段将AST转换为可执行的渲染函数。编译优化策略包括静态提升、Patch Flags和Tree-shaking支持，减少渲染次数和提升diff效率。实践中的优化技巧包括使用`v-once`缓存静态内容、减少动态绑定范围以及避免“过度响应式”。

categories:
  - vue

tags:
  - 基础入门
  - 模板编译
  - 抽象语法树 (AST)
  - 渲染函数
  - 性能优化
  - Patch Flags
  - 静态提升

---

<img src="/images/1bc49dcbd6ea4a8f8949c42c6634e6a9~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 一、模板编译的基本概念

Vue 3的模板是**声明式**的（描述“应该是什么样”），但浏览器无法直接理解模板语法——Vue需要将模板**编译**成**命令式**
的渲染函数（描述“如何渲染”），才能执行DOM渲染和更新。这个编译过程是Vue框架的核心环节之一。

### 1.1 编译的三个核心阶段

模板编译分为**解析（Parse）**、**转换（Transform）**、**生成（Generate）**三个阶段，最终输出可执行的渲染函数。我们用一个简单模板
`'<div>{{ msg }}</div>'`为例，拆解每个阶段的作用：

#### 1.1.1 解析（Parse）：从字符串到抽象语法树（AST）

解析阶段的目标是将模板字符串转换成**抽象语法树（AST）**——一种描述模板结构的JavaScript对象。它会识别模板中的HTML标签、指令（如
`v-if`）、表达式（如`{{ msg }}`）等内容，并将其映射为AST节点。

例如，模板`'<div>{{ msg }}</div>'`解析后的AST结构（简化版）：

```javascript
{
    type: 'Root', // 根节点
        children
:
    [
        {
            type: 'Element', // 元素节点
            tag: 'div', // 标签名
            children: [
                {
                    type: 'Interpolation', // 插值表达式节点
                    content: {
                        type: 'SimpleExpression', // 简单表达式
                        content: 'msg' // 表达式内容（对应组件的msg属性）
                    }
                }
            ]
        }
    ]
}
```

解析过程由`@vue/compiler-core`中的`parse`函数完成，它会逐字符扫描模板，处理嵌套、闭合、引号等语法细节。

#### 1.1.2 转换（Transform）：优化AST并注入逻辑

转换阶段是编译的**核心优化环节**，它会修改AST的结构，处理指令、组件、插槽等逻辑，并标记**静态节点**（无需重新渲染的内容）。

常见的转换操作：

- **指令处理**：将`v-if`转换为条件渲染逻辑，`v-for`转换为循环逻辑；
- **静态标记**：识别静态节点（如无动态绑定的`<h1>标题</h1>`），标记为`hoistable`（可提升）；
- **组件处理**：将组件标签（如`<MyComponent>`）转换为组件渲染逻辑。

例如，原AST中的`<div>{{ msg }}</div>`会被标记为“包含动态内容”，而静态的`<h1>标题</h1>`会被标记为“可提升”。

#### 1.1.3 生成（Generate）：从AST到渲染函数

生成阶段将转换后的AST转换为**渲染函数代码**（即`render`函数）。渲染函数的核心是调用Vue的`h`函数（或`createVNode`
），描述如何创建虚拟DOM（VNode）。

例如，模板`'<div>{{ msg }}</div>'`生成的渲染函数：

```javascript
export function render(_ctx, _cache) {
  // _toDisplayString将响应式数据转换为字符串
  return _createVNode('div', null, _toDisplayString(_ctx.msg), 1 /* TEXT */)
}
```

这里的`_createVNode`是`h`函数的别名，`1 /* TEXT */`是**Patch Flag**（下文详解）。

## 二、编译阶段的性能优化策略

Vue 3的编译优化目标是**减少渲染次数**和**提升diff效率**，核心优化手段包括**静态提升**、**Patch Flags**和**Tree-shaking支持
**。

### 2.1 静态提升（Hoisting）：复用静态节点

静态节点（如无动态绑定的标签、文本）不需要每次渲染都重新创建。Vue 3会将这些节点**提升到渲染函数之外**，作为常量复用，避免重复开销。

#### 示例：静态节点的提升

模板：

```vue
<template>
  <div class="static-container">
    <!-- 静态标题：无动态绑定 -->
    <h1 class="static-title">Hello Vue 3</h1>
    <!-- 动态内容：依赖msg -->
    <p class="dynamic-content">{{ msg }}</p>
  </div>
</template>
```

编译后的渲染函数：

```javascript
// 静态节点被提升为常量（_hoisted_1、_hoisted_2）
const _hoisted_1 = /*#__PURE__*/ _createVNode('div', {class: 'static-container'}, null, 8 /* PROPS */)
const _hoisted_2 = /*#__PURE__*/ _createVNode('h1', {class: 'static-title'}, 'Hello Vue 3', -1 /* HOISTED */)

export function render(_ctx, _cache) {
    return _createVNode(_hoisted_1, null, [
        _hoisted_2, // 复用静态标题
        // 动态节点：仅文本变化
        _createVNode('p', {class: 'dynamic-content'}, _toDisplayString(_ctx.msg), 1 /* TEXT */)
    ])
}
```

- `/*#__PURE__*/`：告诉Tree-shaking工具，这个函数调用是“纯的”（无副作用），未使用时可以安全删除；
- `-1 /* HOISTED */`：标记该节点是静态的，无需diff。

### 2.2 Patch Flags：精准的更新标记

Vue 3的diff算法通过**Patch Flags**（补丁标记）精准定位需要更新的节点，避免全树遍历。Patch Flag是一个数字，标记VNode的**更新类型
**（如文本变化、class变化）。

#### 常见Patch Flag类型

| 标记值 | 类型         | 说明                    |
|-----|------------|-----------------------|
| 1   | TEXT       | 仅文本内容变化               |
| 2   | CLASS      | 仅class属性变化            |
| 4   | STYLE      | 仅style属性变化            |
| 8   | PROPS      | 仅普通属性变化（非class/style） |
| 16  | FULL_PROPS | 所有属性变化（如组件props）      |

#### 示例：动态文本的Patch Flag

模板中的`<p>{{ msg }}</p>`会被标记为`1 /* TEXT */`，表示**只有文本内容会变化**。diff时，Vue仅需比较文本内容，无需检查整个节点，大幅提升效率。

### 2.3 Tree-shaking支持：剔除未使用的特性

Vue 3的编译输出支持**Tree-shaking**（树摇）：未使用的特性（如Vue 2中的过滤器）会被打包工具（如Webpack、Vite）剔除，减小bundle体积。

例如，若模板中未使用`v-html`，编译后的代码不会包含`v-html`的处理逻辑。

## 三、实践中的性能优化技巧

### 3.1 用v-once缓存静态内容

`v-once`指令标记的节点会被**永久缓存**，仅渲染一次。适用于完全静态的内容（如版权信息、静态标题）。

示例：

```vue

<template>
  <!-- 仅渲染一次，之后不再更新 -->
  <footer v-once>© 2024 Vue 3 Guide</footer>
</template>
```

编译后的渲染函数会将该节点提升为常量，避免重复渲染。

### 3.2 减少动态绑定的范围

动态绑定（如`:class`、`:style`）会增加渲染开销。尽量将动态绑定限制在**最小范围**，避免整个节点树都成为动态节点。

#### 反例：不必要的动态class

```vue
<!-- 错误：静态class用了动态绑定 -->
<div :class="'static-class'">...</div>
```

#### 正例：直接用静态class

```vue
<!-- 正确：静态class无需动态绑定 -->
<div class="static-class">...</div>
```

### 3.3 避免“过度响应式”

响应式数据的变化会触发重新渲染。若数据不需要响应式（如静态配置），请避免用`ref`或`reactive`包裹，减少响应式追踪的开销。

示例：

```javascript
// 静态配置：无需响应式
const staticConfig = {title: 'Vue 3 Guide'}

// 响应式数据：仅用于动态内容
const dynamicMsg = ref('Hello World')
```

## 四、课后Quiz

### 问题1：Vue 3模板编译的三个阶段是什么？请简述每个阶段的核心任务。

**答案**：

- 解析（Parse）：将模板字符串转换为AST；
- 转换（Transform）：优化AST（如标记静态节点）并处理指令逻辑；
- 生成（Generate）：将AST转换为渲染函数。

### 问题2：Patch Flags的作用是什么？请列举两种常见类型及适用场景。

**答案**：
作用：标记VNode的更新类型，提升diff效率。

- TEXT（1）：适用于动态文本（如`{{ msg }}`），仅文本变化时更新；
- CLASS（2）：适用于动态class（如`:class="{ active: isActive }"`），仅class变化时更新。

## 五、常见报错及解决方案

### 报错1：Template compilation error: Unexpected token

**原因**：模板存在语法错误（如未闭合标签、无效表达式）。  
**示例**：`<div>{{ msg （缺少闭合括号）`  
**解决**：检查模板语法，补全闭合符号：`<div>{{ msg }}</div>`。  
**预防**：使用ESLint插件`eslint-plugin-vue`检查模板语法。

### 报错2：[Vue warn]: Property "msg" was accessed during render but is not defined

**原因**：模板中使用的变量未在组件中声明（如`data`、`setup`中未定义）。  
**示例**：模板用了`{{ msg }}`，但`setup`中未定义`msg`。  
**解决**：在`setup`中声明响应式数据：

```javascript
import { ref } from 'vue'
export default {
  setup() {
    const msg = ref('Hello') // 声明msg
    return { msg }
  }
}
```

### 报错3：[Vue warn]: Invalid v-on expression: "handleClick( )"

**原因**：事件处理函数的表达式存在语法错误（如多余空格）。  
**示例**：`<button @click="handleClick( )">点击</button>`（括号内有空格）  
**解决**：修正表达式：`<button @click="handleClick()">点击</button>`。

## 参考链接

参考链接：  
https://vuejs.org/guide/extras/render-function.html（渲染函数文档）  
https://vuejs.org/guide/best-practices/performance.html#template-compilation-optimizations（编译优化文档）  
https://play.vuejs.org/（Vue SFC Playground，查看编译后的代码）

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[Vue 3模板如何通过编译三阶段实现从声明式语法到高效渲染的跨越](https://blog.cmdragon.cn/posts/53e3f270a80675df662c6857a3332c0f/)




<details>
<summary>往期文章归档</summary>

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