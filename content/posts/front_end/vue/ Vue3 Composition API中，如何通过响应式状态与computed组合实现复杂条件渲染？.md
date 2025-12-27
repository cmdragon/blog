---
url: /posts/d3560e7248deff48a51790deca08503e/
title: Vue3 Composition API中，如何通过响应式状态与computed组合实现复杂条件渲染？
date: 2025-12-27T10:04:59+08:00
lastmod: 2025-12-27T10:04:59+08:00
author: cmdragon
cover: /images/generated_image_8b35b18f-0f53-41f7-b726-ee407e6f16eb.png

summary:
  Vue3 Composition API条件渲染核心为响应式状态与模板指令配合。v-if控制DOM创建/销毁，v-show仅隐藏；多条件用computed封装；动态组件结合component:is实现切换；列表渲染用computed过滤+状态驱动样式。v-if与v-for同用时需注意优先级，可通过computed或调整结构解决。

categories:
  - vue

tags:
  - 基础入门
  - Composition API
  - 条件渲染
  - v-if
  - v-show
  - computed
  - 动态组件

---

<img src="/images/generated_image_8b35b18f-0f53-41f7-b726-ee407e6f16eb.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/


### Composition API中的条件渲染基础

在Vue3的Composition API中，条件渲染的核心是**响应式状态**与**模板指令**的配合。我们通过`ref`或`reactive`声明响应式变量，再用`v-if`/`v-else`等指令控制DOM的渲染逻辑。

比如一个简单的“弹窗开关”场景：
```vue
<script setup>
import { ref } from 'vue'

// 用ref声明响应式状态（初始隐藏弹窗）
const isModalOpen = ref(false)

// 切换弹窗状态的方法
const toggleModal = () => {
  isModalOpen.value = !isModalOpen.value
}
</script>

<template>
  <button @click="toggleModal">打开弹窗</button>
  <!-- v-if根据isModalOpen的值渲染/销毁弹窗 -->
  <div class="modal" v-if="isModalOpen">
    <p>这是Vue3的条件渲染示例</p>
    <button @click="toggleModal">关闭</button>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
</style>
```
这里的`isModalOpen`是响应式变量，点击按钮时修改它的值，`v-if`会自动响应状态变化——**条件为真时渲染弹窗，为假时销毁弹窗**（官网强调：`v-if`是“真实”的条件渲染，会完整生命周期管理组件）。


### 多条件组合：用Computed简化逻辑

当条件变得复杂（比如需要判断多个状态），直接在模板写冗长的逻辑会降低可读性。这时**`computed`计算属性**是最佳选择——它能封装复杂逻辑，且基于依赖缓存结果。

比如“用户权限控制”场景：不同角色（管理员/编辑/普通用户）显示不同操作按钮：
```vue
<script setup>
import { ref, computed } from 'vue'

// 模拟用户角色（实际从接口获取）
const userRole = ref('editor')

// 用computed封装权限条件
const canEdit = computed(() => userRole.value === 'editor' || userRole.value === 'admin')
const canDelete = computed(() => userRole.value === 'admin')
const canManage = computed(() => userRole.value === 'admin' || userRole.value === 'manager')
</script>

<template>
  <div class="actions">
    <button v-if="canEdit">编辑</button>
    <button v-if="canDelete" class="danger">删除</button>
    <button v-if="canManage" class="primary">管理</button>
  </div>
</template>

<style scoped>
.actions button { margin-right: 1rem; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }
.primary { background: #2196F3; color: white; }
.danger { background: #FF5722; color: white; }
</style>
```
`computed`的优势在于：**逻辑与模板分离**，当`userRole`变化时，所有依赖它的计算属性会自动更新，模板无需修改。


### 动态组件的条件渲染

在复杂场景中，我们常需要**根据条件切换不同的组件**（比如Tab栏、步骤条）。Vue3的`<component :is="...">`动态组件结合Composition API，可以轻松实现这一点。

比如“Tab切换”场景：
```vue
<script setup>
import { ref } from 'vue'
// 导入需要切换的组件
import Home from './Home.vue'
import Profile from './Profile.vue'
import Settings from './Settings.vue'

// 当前激活的Tab（响应式状态）
const activeTab = ref('Home')

// 根据activeTab返回对应组件
const getCurrentComponent = () => {
  switch (activeTab.value) {
    case 'Home': return Home
    case 'Profile': return Profile
    case 'Settings': return Settings
    default: return Home
  }
}
</script>

<template>
  <div class="tabs">
    <button 
      v-for="tab in ['Home', 'Profile', 'Settings']" 
      :key="tab" 
      @click="activeTab = tab"
      :class="{ active: activeTab === tab }"
    >
      {{ tab }}
    </button>
  </div>
  <!-- 动态渲染组件 -->
  <component :is="getCurrentComponent()" class="tab-content"></component>
</template>

<style scoped>
.tabs button { padding: 0.5rem 1rem; border: 1px solid #eee; border-bottom: none; background: white; cursor: pointer; }
.tabs .active { background: #f5f5f5; font-weight: bold; }
.tab-content { padding: 1rem; border: 1px solid #eee; margin-top: -1px; }
</style>
```
`activeTab`是响应式状态，点击Tab时更新它的值，`getCurrentComponent`根据`activeTab`返回对应组件，`<component :is="...">`负责动态渲染——**这是Vue中动态组件的标准写法**（官网参考：https://vuejs.org/guide/essentials/component-basics.html#dynamic-components）。


### 列表中的条件渲染：过滤与状态切换

处理列表时，我们常需要**根据条件过滤项**或**根据状态显示不同样式**。比如“Todo列表”场景：
```vue
<script setup>
import { ref, computed } from 'vue'

// 模拟Todo数据
const todos = ref([
  { id: 1, text: '学习Composition API', completed: false },
  { id: 2, text: '写条件渲染博客', completed: true },
  { id: 3, text: '运动半小时', completed: false }
])

// 用computed过滤未完成的Todo
const incompleteTodos = computed(() => todos.value.filter(t => !t.completed))

// 切换Todo完成状态
const toggleComplete = (id) => {
  const todo = todos.value.find(t => t.id === id)
  if (todo) todo.completed = !todo.completed
}
</script>

<template>
  <h3>未完成的任务</h3>
  <ul class="todo-list">
    <li 
      v-for="todo in incompleteTodos" 
      :key="todo.id" 
      @click="toggleComplete(todo.id)"
      :class="{ completed: todo.completed }"
    >
      {{ todo.text }}
    </li>
  </ul>
</template>

<style scoped>
.todo-list { list-style: none; padding: 0; }
.todo-list li { padding: 0.5rem 1rem; border-bottom: 1px solid #eee; cursor: pointer; }
.completed { text-decoration: line-through; color: #888; }
</style>
```
这里`incompleteTodos`是计算属性，过滤出未完成的Todo；`toggleComplete`方法修改Todo的`completed`状态，模板通过`v-bind:class`切换样式——**列表中的条件渲染核心是“响应式数据过滤”+“状态驱动样式”**。


### 性能优化：v-show vs v-if

选择`v-show`还是`v-if`是条件渲染的常见问题，两者的核心区别在于**DOM的存在性**：
- **`v-if`**：条件为假时，元素会被**销毁**（从DOM中移除）；条件为真时重新创建。
- **`v-show`**：条件为假时，元素会被**隐藏**（设置`display: none`），但始终存在于DOM中。

比如“频繁切换的Tab”场景，用`v-show`更高效：
```vue
<script setup>
import { ref } from 'vue'

const activeTab = ref('tab1')
</script>

<template>
  <div class="tabs">
    <button @click="activeTab = 'tab1'">Tab 1</button>
    <button @click="activeTab = 'tab2'">Tab 2</button>
  </div>
  <div class="tab-content" v-show="activeTab === 'tab1'">Tab 1 内容</div>
  <div class="tab-content" v-show="activeTab === 'tab2'">Tab 2 内容</div>
</template>

<style scoped>
.tab-content { padding: 1rem; border: 1px solid #eee; margin-top: 1rem; }
</style>
```
官网明确建议（https://vuejs.org/guide/essentials/conditional.html#v-show-vs-v-if）：
- 频繁切换用`v-show`（避免重复销毁/创建组件）；
- 条件很少变化用`v-if`（减少初始DOM节点）。


### 课后Quiz：如何实现多条件动态渲染？

**问题**：假设你有一个电商页面，需要根据“用户等级”（普通/VIP/超级VIP）和“促销状态”（是否在促销期）显示不同的优惠组件。请用Composition API实现，并说明关键步骤。

**答案解析**：
1. **声明响应式状态**：用`ref`存储用户等级和促销状态（实际从接口获取）：
   ```javascript
   const userLevel = ref('普通')
   const isPromotion = ref(true)
   ```
2. **用Computed封装条件**：计算每个优惠组件的显示条件：
   ```javascript
   const showNormalDiscount = computed(() => userLevel.value === '普通' && isPromotion.value)
   const showVipDiscount = computed(() => userLevel.value === 'VIP' && isPromotion.value)
   const showSuperVipDiscount = computed(() => userLevel.value === '超级VIP' || !isPromotion.value)
   ```
3. **模板中条件渲染**：用`v-if`/`v-else-if`切换组件：
   ```vue
   <template>
     <NormalDiscount v-if="showNormalDiscount" />
     <VipDiscount v-else-if="showVipDiscount" />
     <SuperVipDiscount v-else />
   </template>
   ```
**关键思路**：用`computed`封装多条件逻辑，让模板更简洁；响应式状态变化时，计算属性自动更新，触发组件切换。


### 常见报错及解决方案

#### 1. 错误：v-if与v-for同用导致变量未定义
**报错信息**：`Property "item" was accessed during render but is not defined`  
**原因**：Vue中`v-if`的优先级高于`v-for`（官网明确说明），同一元素上使用时，`v-if`会先执行，导致`v-for`的`item`变量未定义。  
**解决办法**：
- 把`v-for`放在父元素，`v-if`放在子元素：
  ```vue
  <ul>
    <li v-for="item in list" :key="item.id">
      <span v-if="item.active">{{ item.text }}</span>
    </li>
  </ul>
  ```
- 用`computed`过滤列表（推荐）：
  ```javascript
  const activeItems = computed(() => list.value.filter(item => item.active))
  ```
  模板中遍历`activeItems`：
  ```vue
  <ul>
    <li v-for="item in activeItems" :key="item.id">{{ item.text }}</li>
  </ul>
  ```

#### 2. 错误：ref未初始化导致条件异常
**报错信息**：`Cannot read properties of undefined (reading 'value')`  
**原因**：`ref`未初始化时，初始值为`undefined`，比如`const isShow = ref()`，模板中`v-if="isShow"`会把`undefined`当作`false`，但异步赋值时可能导致渲染闪烁。  
**解决办法**：
- 总是给`ref`初始化为明确值：
  ```javascript
  const isShow = ref(false) // 布尔值
  const user = ref(null) // 异步数据用null
  ```

#### 3. 错误：动态组件切换丢失状态
**报错信息**：切换Tab后，输入框内容丢失  
**原因**：`v-if`或动态组件切换时，组件会被销毁，状态重置。  
**解决办法**：用`<KeepAlive>`缓存组件状态（官网参考：https://vuejs.org/guide/built-ins/keep-alive.html）：
  ```vue
  <template>
    <KeepAlive>
      <component :is="currentComponent"></component>
    </KeepAlive>
  </template>
  ```
`<KeepAlive>`会缓存不活动的组件实例，保留组件状态（比如输入框内容）。


### 参考链接
1. Vue条件渲染官方文档：https://vuejs.org/guide/essentials/conditional.html  
2. Vue动态组件官方文档：https://vuejs.org/guide/essentials/component-basics.html#dynamic-components  
3. Vue Computed属性官方文档：https://vuejs.org/guide/essentials/computed.html  
4. Vue KeepAlive官方文档：https://vuejs.org/guide/built-ins/keep-alive.html

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：[Vue3 Composition API中，如何通过响应式状态与computed组合实现复杂条件渲染？](https://blog.cmdragon.cn/posts/d3560e7248deff48a51790deca08503e/)



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