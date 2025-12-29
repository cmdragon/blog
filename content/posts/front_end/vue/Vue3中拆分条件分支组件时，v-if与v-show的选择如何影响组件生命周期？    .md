---
url: /posts/d6278c0f8cf1427502429213070386ac/
title: Vue3中拆分条件分支组件时，v-if与v-show的选择如何影响组件生命周期？
date: 2025-12-29T05:32:03+08:00
lastmod: 2025-12-29T05:32:03+08:00
author: cmdragon
cover: /images/generated_image_a8423174-52ef-47c8-ac78-15c509f56a44.png

summary:
  Vue3条件渲染核心是`v-if`系列指令，`v-if`真实销毁/创建组件，`v-show`仅切换CSS控制显示/隐藏；复杂分支需拆分组件，父组件控制条件渲染，子组件（如`UserProfile`和`GuestLogin`）处理具体内容，通过`props`传数据、`emit`发事件通信，提升可读性与复用性。

categories:
  - vue

tags:
  - 基础入门
  - 条件渲染
  - v-if
  - v-show
  - 组件拆分
  - 单文件组件
  - 组件通信

---

<img src="/images/generated_image_a8423174-52ef-47c8-ac78-15c509f56a44.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/


### 一、条件渲染的基础：v-if与组件的初次相遇  
在Vue3中，条件渲染的核心是`v-if`系列指令——`v-if`、`v-else-if`、`v-else`。它们的作用很直接：**根据表达式的真假，决定是否渲染对应的DOM元素或组件**。比如一个简单的登录状态判断：  

```vue
<template>
  <div class="auth-container">
    <!-- 用户登录时显示：欢迎信息 -->
    <div v-if="isLoggedIn">
      <h3>欢迎回来，{{ username }}！</h3>
      <button @click="logout">注销</button>
    </div>
    <!-- 未登录时显示：登录表单 -->
    <div v-else>
      <input type="text" placeholder="用户名" v-model="username" />
      <input type="password" placeholder="密码" v-model="password" />
      <button @click="login">登录</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const isLoggedIn = ref(false) // 初始未登录
const username = ref('')
const password = ref('')

const login = () => {
  isLoggedIn.value = true // 模拟登录成功
}
const logout = () => {
  isLoggedIn.value = false // 模拟注销
}
</script>
```  

这里需要注意`v-if`和`v-show`的本质区别：  
- `v-if`是**“真实”的条件渲染**：当条件从`false`变为`true`时，Vue会**创建**对应的组件；当条件从`true`变为`false`时，Vue会**销毁**组件（触发`beforeDestroy`、`destroyed`钩子）。  
- `v-show`是**“视觉”的条件渲染**：它仅通过切换CSS的`display: none`属性控制显示/隐藏，组件始终保持挂载状态（生命周期钩子只触发一次）。  


### 二、当条件渲染遇到复杂分支：为什么要拆分组件？  
上面的例子很简单，但实际开发中，条件分支往往会变得很“厚重”——比如登录后的内容可能包含**用户头像、等级、个性化设置**，未登录的内容可能包含**注册入口、忘记密码链接、第三方登录按钮**。此时模板会变成“一锅粥”：  

```vue
<!-- 反例：臃肿的条件分支 -->
<template>
  <div v-if="isLoggedIn">
    <img :src="user.avatar" alt="头像" />
    <div class="user-info">
      <h4>{{ user.name }}</h4>
      <p>等级：{{ user.level }}</p>
      <button @click="goSettings">设置</button>
    </div>
    <div class="message-center">
      <p>未读消息：{{ unreadCount }}</p>
      <button @click="markAsRead">标记已读</button>
    </div>
  </div>
  <div v-else>
    <form @submit.prevent="login">
      <input type="text" v-model="username" />
      <input type="password" v-model="password" />
      <button type="submit">登录</button>
    </form>
    <div class="extra-links">
      <a @click="goRegister">注册</a>
      <a @click="forgotPassword">忘记密码？</a>
      <button @click="loginWithWechat">微信登录</button>
    </div>
  </div>
</template>
```  

这样的代码有两个致命问题：  
1. **可读性差**：后续维护者需要“层层剥开”条件分支才能找到具体逻辑；  
2. **可复用性低**：如果其他页面也需要显示“用户信息”或“登录表单”，只能复制粘贴代码。  

这时候，**将条件分支拆分为单文件组件（SFC）**就成了最优解——把每个分支的内容封装成独立的组件，让父组件只负责“条件判断”，子组件负责“具体内容”。  


### 三、实战：将条件分支拆分为单文件组件  
我们以“用户信息展示”和“访客登录页”为例，演示如何拆分组件。最终的结构会是这样：  
```
src/
├── App.vue（父组件：控制条件渲染）
└── components/
    ├── UserProfile.vue（子组件：登录后展示）
    └── GuestLogin.vue（子组件：未登录展示）
```  


#### 1. 父组件：App.vue（负责条件判断）  
父组件的职责很明确：**管理登录状态，根据状态渲染不同子组件**。它不需要关心子组件的内部逻辑，只需要传递数据（通过`props`）和接收事件（通过`emit`）：  

```vue
<template>
  <div class="app-container">
    <!-- 登录状态：渲染UserProfile组件 -->
    <UserProfile 
      v-if="isLoggedIn" 
      :user="currentUser" 
      :unread-count="unreadCount" 
      @logout="handleLogout"
      @go-settings="goSettings"
    />
    <!-- 未登录状态：渲染GuestLogin组件 -->
    <GuestLogin 
      v-else 
      @login="handleLogin" 
      @go-register="goRegister"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
// 导入拆分后的子组件
import UserProfile from './components/UserProfile.vue'
import GuestLogin from './components/GuestLogin.vue'

// 模拟登录状态和用户数据
const isLoggedIn = ref(false)
const currentUser = ref({
  name: 'Vue新手',
  avatar: 'https://via.placeholder.com/40',
  level: 3
})
const unreadCount = ref(5) // 未读消息数

// 处理登录逻辑
const handleLogin = (username, password) => {
  // 这里可以替换为真实的接口请求
  isLoggedIn.value = true
  currentUser.value.name = username
}

// 处理注销逻辑
const handleLogout = () => {
  isLoggedIn.value = false
}

// 跳转设置页（示例）
const goSettings = () => {
  console.log('前往设置页')
}

// 跳转注册页（示例）
const goRegister = () => {
  console.log('前往注册页')
}
</script>
```  


#### 2. 子组件1：UserProfile.vue（登录后展示）  
子组件的职责是**展示用户信息，处理自身逻辑**。它通过`defineProps`接收父组件传递的数据，通过`defineEmits`向父组件发送事件：  

```vue
<template>
  <div class="user-profile">
    <!-- 头像 -->
    <img :src="user.avatar" alt="用户头像" class="avatar" />
    <!-- 用户基础信息 -->
    <div class="user-info">
      <h4>{{ user.name }}</h4>
      <p>等级：{{ user.level }}</p>
    </div>
    <!-- 未读消息 -->
    <div class="message-box">
      <span>未读消息：{{ unreadCount }}</span>
      <button @click="markAsRead">标记已读</button>
    </div>
    <!-- 操作按钮 -->
    <button @click="$emit('logout')" class="logout-btn">注销</button>
    <button @click="$emit('go-settings')" class="settings-btn">设置</button>
  </div>
</template>

<script setup>
// 1. 声明接收的props（父组件传递的数据）
defineProps({
  user: Object, // 用户信息对象
  unreadCount: Number // 未读消息数
})

// 2. 声明可触发的事件（向父组件传递动作）
defineEmits(['logout', 'go-settings'])

// 子组件自身的逻辑：标记消息为已读
const markAsRead = () => {
  // 这里可以调用接口更新未读状态
  console.log('消息已标记为已读')
}
</script>

<style scoped>
.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
}
.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
.logout-btn {
  margin-left: auto;
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.settings-btn {
  margin-left: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```  


#### 3. 子组件2：GuestLogin.vue（未登录展示）  
这个组件负责展示登录表单，同样通过`emit`向父组件传递“登录”或“注册”动作：  

```vue
<template>
  <div class="guest-login">
    <h3>欢迎访问，请登录</h3>
    <!-- 登录表单 -->
    <form @submit.prevent="handleSubmit">
      <input 
        type="text" 
        placeholder="用户名" 
        v-model="username" 
        required
      />
      <input 
        type="password" 
        placeholder="密码" 
        v-model="password" 
        required
      />
      <button type="submit" class="login-btn">登录</button>
    </form>
    <!-- 额外链接 -->
    <div class="extra-links">
      <a @click="$emit('go-register')">还没有账号？注册</a>
      <a @click="forgotPassword">忘记密码？</a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 声明可触发的事件
defineEmits(['login', 'go-register'])

// 表单数据
const username = ref('')
const password = ref('')

// 处理表单提交
const handleSubmit = () => {
  // 向父组件发送登录事件，并传递用户名和密码
  $emit('login', username.value, password.value)
}

// 忘记密码逻辑（示例）
const forgotPassword = () => {
  console.log('前往忘记密码页')
}
</script>

<style scoped>
.guest-login {
  padding: 2rem;
  border: 1px solid #eee;
  border-radius: 8px;
  max-width: 300px;
  margin: 0 auto;
}
.login-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.extra-links {
  margin-top: 1rem;
  text-align: center;
}
.extra-links a {
  color: #007bff;
  text-decoration: none;
  margin: 0 0.5rem;
}
</style>
```  


### 四、课后Quiz：巩固核心逻辑  
**问题**：当使用`v-if`渲染子组件时，子组件的`created`和`mounted`钩子会在什么时机触发？如果换成`v-show`，结果会有不同吗？  

**答案解析**：  
1. 用`v-if`时：  
   - 当条件从`false`变为`true`，子组件会被**创建并挂载**，触发`created` → `mounted`钩子；  
   - 当条件从`true`变为`false`，子组件会被**销毁**，触发`beforeDestroy` → `destroyed`钩子。  
2. 用`v-show`时：  
   - 子组件**始终保持挂载状态**（仅切换`display`属性），因此`created`和`mounted`钩子只会在组件首次渲染时触发一次，后续条件变化不会重复触发。  


### 五、常见报错与解决：避开拆分组件的“坑”  
在组件拆分过程中，新手常遇到以下问题：  


#### 1. 报错：`[Vue warn]: Failed to resolve component: UserProfile`  
**原因**：未导入组件，或导入路径错误（比如拼写错误、文件夹层级错误）。  
**解决**：  
- 检查`App.vue`中是否有`import UserProfile from './components/UserProfile.vue'`；  
- 确认`UserProfile.vue`确实在`components`文件夹下，文件名拼写正确（区分大小写）。  


#### 2. 报错：`[Vue warn]: Property "user" was accessed during render but is not defined`  
**原因**：子组件使用了`props`中的`user`，但未显式声明。  
**解决**：在子组件中通过`defineProps`声明`user`：  
```javascript
// UserProfile.vue 中的<script setup>
defineProps({
  user: Object // 声明接收user props
})
```  


#### 3. 报错：`[Vue warn]: Extraneous non-props attributes passed to component`  
**原因**：父组件向子组件传递了未在`props`中声明的属性（比如`class`、`style`），而子组件没有根元素（Vue3支持Fragment），无法自动继承这些属性。  
**解决**：  
- 给子组件添加一个根元素（比如`<div class="user-profile">`）；  
- 或关闭自动继承，手动绑定`$attrs`：  
  ```javascript
  // UserProfile.vue 中的<script setup>
  defineProps({ /* ... */ })
  defineEmits([/* ... */])
  // 关闭自动继承
  const inheritAttrs = false
  ```  


### 参考链接  
- Vue3条件渲染官方文档：https://vuejs.org/guide/essentials/conditional.html  
- Vue3组件基础官方文档：https://vuejs.org/guide/essentials/component-basics.html

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：[Vue3中拆分条件分支组件时，v-if与v-show的选择如何影响组件生命周期？](https://blog.cmdragon.cn/posts/d6278c0f8cf1427502429213070386ac/)



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