---
url: /posts/4d141a1c68a913fdfd7bc3ce756c4627/
title: v-if与v-show如何选择？响应式条件渲染的联动机制是什么？
date: 2025-12-23T08:27:25+08:00
lastmod: 2025-12-23T08:27:25+08:00
author: cmdragon
cover: /images/generated_image_063ccb41-243d-4f10-855d-ff253f3c78cb.png

summary:
  Vue条件渲染核心指令：v-if（创建/销毁DOM）、v-else-if/v-else（多条件分支）、v-show（切换display），前者用于条件不常变场景，后者适用于频繁切换。响应式数据用ref/reactive创建，依赖变化触发DOM更新，复杂条件用计算属性优化，常见错误如v-else未紧跟需避免。

categories:
  - vue

tags:
  - 基础入门
  - v-if
  - v-show
  - v-if vs v-show
  - 响应式数据
  - 计算属性
  - 常见报错解决

---

<img src="/images/generated_image_063ccb41-243d-4f10-855d-ff253f3c78cb.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 一、条件渲染的基本模板语法

条件渲染是Vue中**根据状态动态控制内容显示**的核心能力，它让我们不用手动操作DOM，就能实现“不同状态展示不同内容”的需求。Vue提供了4个核心指令：
`v-if`、`v-else-if`、`v-else`和`v-show`，每个都有明确的适用场景。

#### 1. v-if：动态创建/销毁DOM元素

`v-if`是最常用的条件渲染指令，它会**根据表达式的真假**，决定是否将元素插入或移除DOM。例如：

```vue
<template>
  <!-- 当isLogin为true时，显示用户信息 -->
  <div v-if="isLogin">
    欢迎回来，{{ username }}！
  </div>
</template>

<script setup>
import { ref } from 'vue'
const isLogin = ref(false) // 初始为未登录状态
const username = ref('')
</script>
```

当`isLogin`从`false`变为`true`时，`div`会被**创建**并插入DOM；反之则被**销毁**。

如果需要同时控制多个元素，但不想添加额外DOM节点（比如`<div>`），可以用`<template>`标签包裹——`v-if`可以直接作用于`<template>`
，渲染后不会留下多余节点：

```vue
<template>
  <template v-if="isLogin">
    <h3>用户中心</h3>
    <p>用户名：{{ username }}</p>
    <p>邮箱：{{ email }}</p>
  </template>
</template>
```

#### 2. v-else与v-else-if：多条件分支

`v-else`用于添加`v-if`的“否则”分支，**必须紧跟在`v-if`或`v-else-if`之后**（否则会报错）。`v-else-if`则用于多条件判断，例如：

```vue
<template>
  <div v-if="score >= 90">优秀（≥90）</div>
  <div v-else-if="score >= 80">良好（≥80）</div>
  <div v-else-if="score >= 60">及格（≥60）</div>
  <div v-else>不及格（<60）</div>
</template>

<script setup>
import { ref } from 'vue'
const score = ref(75) // 显示“及格”
</script>
```

这里的条件会**按顺序匹配**：如果`score`是75，会命中`v-else-if="score >= 60"`，显示“及格”。

#### 3. v-show：切换元素的显示状态

`v-show`和`v-if`功能类似，但**不会销毁DOM**——它通过切换`display: none`样式来控制显示。例如：

```vue

<template>
  <!-- 屏幕宽度<768时显示移动端菜单 -->
  <button v-show="isMobile">移动端菜单</button>
</template>

<script setup>
  import {ref} from 'vue'

  const isMobile = ref(window.innerWidth < 768)
</script>
```

当`isMobile`为`false`时，按钮仍存在于DOM中，只是`display`属性被设为`none`。

#### 4. v-if vs v-show：该选哪个？

很多初学者会混淆这两个指令，我们用一张表总结核心区别：

| 特性     | v-if      | v-show      |
|--------|-----------|-------------|
| DOM操作  | 创建/销毁元素   | 切换display样式 |
| 初始渲染成本 | 低（假值时不渲染） | 高（无论真假都渲染）  |
| 切换成本   | 高（需销毁/重建） | 低（仅切换样式）    |
| 适用场景   | 条件不常变化    | 频繁切换的元素     |

**举个例子**：

- 登录状态（仅切换1次）：用`v-if`；
- 标签页切换（频繁点击）：用`v-show`。

### 二、响应式数据与条件渲染的联动机制

条件渲染的灵魂是**“响应式数据变化→DOM自动更新”**，这背后依赖Vue的**响应式系统**。我们需要先理解响应式数据的创建，再看它如何驱动条件渲染。

#### 1. 响应式数据的创建：ref与reactive

Vue3中，响应式数据必须用`ref`（基本类型，如`Boolean`/`String`）或`reactive`（对象/数组）包裹——它们会“劫持”数据的变化，让Vue能检测到更新。

**示例**：

```javascript
import { ref, reactive } from 'vue'

// 基本类型：用ref包裹，通过.value访问
const isLogin = ref(false) // 未登录
isLogin.value = true // 修改值，触发更新

// 对象类型：用reactive包裹，直接修改属性
const user = reactive({
  name: '张三',
  role: 'user'
})
user.role = 'admin' // 修改属性，触发更新
```

#### 2. 联动的核心：依赖追踪与更新

当组件首次渲染时，Vue会**收集依赖**——即模板中用到的响应式数据（比如`v-if="isLogin"`中的`isLogin`）。当响应式数据变化时，Vue会
**触发依赖更新**，重新计算条件表达式，并更新DOM。

我们用一个**登录状态切换**的案例，看完整流程：

##### 案例：登录状态控制

```vue

<template>
  <div class="login-page">
    <!-- 未登录：显示登录表单 -->
    <div v-if="!isLogin">
      <input v-model="username" placeholder="用户名"/>
      <input v-model="password" type="password" placeholder="密码"/>
      <button @click="handleLogin">登录</button>
    </div>
    <!-- 已登录：显示用户信息 -->
    <div v-else>
      欢迎你，{{ username }}！
      <button @click="handleLogout">退出</button>
    </div>
  </div>
</template>

<script setup>
  import {ref} from 'vue'

  // 响应式数据：登录状态、用户名、密码
  const isLogin = ref(false)
  const username = ref('')
  const password = ref('')

  // 登录逻辑：模拟接口请求成功后切换状态
  const handleLogin = () => {
    if (username.value && password.value) {
      isLogin.value = true // 触发更新！
    }
  }

  // 退出逻辑：重置状态
  const handleLogout = () => {
    isLogin.value = false
    username.value = ''
    password.value = ''
  }
</script>
```

**流程拆解**（用流程图展示）：

```mermaid
graph TD
A[用户点击“登录”] --> B[修改isLogin.value为true]
B --> C[Vue检测到响应式数据变化]
C --> D[触发依赖更新：v-if="!isLogin"变为false]
D --> E[DOM更新：销毁登录表单，创建用户信息]
```

#### 3. 优化：用计算属性简化复杂表达式

如果条件表达式很复杂（比如“已登录且是管理员”），直接写在模板里会让代码变乱。这时可以用**计算属性**把逻辑移到`script`
部分，让模板更简洁。

**示例**：判断“是否是管理员且已登录”

```vue

<template>
  <!-- 用计算属性代替复杂表达式 -->
  <div v-if="isAdminAndLogin">管理员面板</div>
</template>

<script setup>
  import {ref, computed} from 'vue'

  const isLogin = ref(true)
  const user = ref({
    role: 'admin' // 管理员角色
  })

  // 计算属性：缓存结果，只有依赖变化时才重新计算
  const isAdminAndLogin = computed(() => {
    return isLogin.value && user.value.role === 'admin'
  })
</script>
```

计算属性的好处：

- **逻辑复用**：多个地方需要判断时，只需写一次；
- **模板简洁**：模板不用写复杂表达式；
- **缓存优化**：只有`isLogin`或`user.role`变化时，才重新计算。

### 三、课后Quiz：巩固所学知识

#### 问题1：`v-if`和`v-show`的核心区别是什么？分别适用于什么场景？

**答案解析**：

- 核心区别：`v-if`是**创建/销毁DOM**，`v-show`是**切换display样式**；
- 适用场景：
    - `v-if`：条件不常变化（如登录状态、权限判断）；
    - `v-show`：频繁切换的元素（如标签页、移动端菜单）。

#### 问题2：如何优化模板中复杂的`v-if`表达式？

**答案解析**：
用**计算属性**将逻辑移到`script`部分。例如：

- 复杂表达式：`v-if="isLogin && user.role === 'admin' && user.status === 'active'"`；
- 优化后：用计算属性
  `const isActiveAdmin = computed(() => isLogin.value && user.value.role === 'admin' && user.value.status === 'active')`
  ，模板中写`v-if="isActiveAdmin"`。

### 四、常见报错解决方案

在学习条件渲染时，你可能会遇到以下3类常见错误，我们一一解答：

#### 1. 报错：`v-else/v-else-if has no adjacent v-if`

**原因**：`v-else`或`v-else-if`没有紧跟在`v-if`或`v-else-if`之后（中间插入了其他元素）。  
**错误代码**：

```vue

<template>
  <div v-if="isLogin">用户信息</div>
  <p>无关内容</p> <!-- 中间插入了p标签 -->
  <div v-else>登录表单</div> <!-- 报错！ -->
</template>
```

**解决办法**：调整结构，让`v-else`紧跟`v-if`：

```vue
<template>
  <div v-if="isLogin">用户信息</div>
  <div v-else>登录表单</div> <!-- 正确 -->
  <p>无关内容</p>
</template>
```

**预防建议**：写条件分支时，先完成`v-if`→`v-else-if`→`v-else`的结构，再添加其他内容。

#### 2. 报错：`Cannot read properties of undefined (reading 'value')`

**原因**：未声明响应式数据，或数据不是响应式的。  
**错误代码**：

```vue
<template>
  <div v-if="isLogin">欢迎回来！</div> <!-- isLogin未声明 -->
</template>

<script setup>
// 忘记导入ref和声明isLogin
// import { ref } from 'vue'
// const isLogin = ref(false)
</script>
```

**解决办法**：

1. 导入`ref`或`reactive`；
2. 用`ref`/`reactive`声明响应式数据：

```javascript
import {ref} from 'vue'

const isLogin = ref(false) // 正确声明
```

#### 3. 报错：`Template compilation error: Unexpected token`

**原因**：`v-if`的表达式语法错误（比如用了赋值运算符`=`而不是判断运算符`===`）。  
**错误代码**：

```vue
<template>
  <div v-if="user.role = 'admin'">管理员</div> <!-- 错误：用了= -->
</template>
```

**解决办法**：用`===`做全等判断：

```vue

<div v-if="user.role === 'admin'">管理员</div> <!-- 正确 -->
```

**预防建议**：写条件表达式时，避免使用`=`（赋值），优先用`===`（全等）或`==`（相等）。

### 参考链接

- Vue3条件渲染官方文档：https://vuejs.org/guide/essentials/conditional.html
- Vue3响应式基础官方文档：https://vuejs.org/guide/essentials/reactivity-fundamentals.html
- Vue3计算属性官方文档：https://vuejs.org/guide/essentials/computed.html

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[v-if与v-show如何选择？响应式条件渲染的联动机制是什么？](https://blog.cmdragon.cn/posts/4d141a1c68a913fdfd7bc3ce756c4627/)



<details>
<summary>往期文章归档</summary>

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