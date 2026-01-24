---
url: /posts/ad67c4eb6d76cf7707bdfe6a8146c34f/
title: Vue3跨组件通信中，全局事件总线与provide/inject该如何正确选择？
date: 2026-01-15T05:05:24+08:00
lastmod: 2026-01-15T05:05:24+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/generated_image_867e7740-7267-4a3e-affe-f896f9e9b5a2.png

summary:
  Vue3跨组件通信方案：①全局事件总线用mitt实现“订阅-发布”，创建共享实例，发布用emit，订阅用on，销毁时off防内存泄漏；②provide/inject支持跨层级通信，祖先用provide提供数据/方法，后代用inject获取；③子父通信用defineEmits定义事件，emit发射，父组件@监听事件。

categories:
  - vue

tags:
  - 基础入门
  - 全局事件总线
  - mitt
  - provide/inject
  - 子父组件通信
  - 订阅-发布模式
  - 跨层级通信

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/generated_image_867e7740-7267-4a3e-affe-f896f9e9b5a2.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 全局事件总线：Vue3中的跨组件通信方案

Vue2时代，我们常通过`this.$bus`（基于`Vue.prototype`的事件发射器）实现全局组件通信，但Vue3**移除了`$on`、`$off`、`$once`方法**
——因为这些方法容易引发内存泄漏（忘记销毁监听）和全局状态混乱（事件名冲突）。因此Vue3推荐使用**轻量的第三方事件发射器库**
（如mitt、tiny-emitter）来实现全局事件总线。

#### 原理：“订阅-发布”模式

全局事件总线的核心是一个**全局共享的事件发射器实例**：

1. **发布者**：组件通过实例的`emit`方法触发事件，并传递数据；
2. **订阅者**：组件通过实例的`on`方法监听事件，接收数据；
3. **销毁监听**：组件销毁时用`off`移除监听，避免内存泄漏。

#### 实战：用mitt实现全局事件总线

mitt是Vue官方推荐的事件发射器库（仅200字节），以下是完整实现步骤：

1. **安装mitt**  
   安装最新版本（当前v3.0.1）：
   ```bash
   npm install mitt
   ```

2. **创建全局事件总线实例**  
   在`src/utils/bus.js`中导出共享的mitt实例：
   ```javascript
   // src/utils/bus.js
   import mitt from 'mitt'
   export const bus = mitt() // 全局共享的事件发射器
   ```

3. **发布事件（发送方组件）**  
   比如`UserSender.vue`组件，点击按钮发射“用户更新”事件：
   ```vue
   <template>
     <button @click="sendUser">更新用户信息</button>
   </template>

   <script setup>
   import { bus } from '@/utils/bus'

   const sendUser = () => {
     const user = { id: 1, name: '张三', age: 25 }
     bus.emit('user-updated', user) // 发射事件，传递用户数据
   }
   </script>
   ```

4. **订阅事件（接收方组件）**  
   比如`UserReceiver.vue`组件，监听“用户更新”事件并更新界面：
   ```vue
   <template>
     <div>最新用户：{{ user.name }}（{{ user.age }}岁）</div>
   </template>

   <script setup>
   import { ref, onMounted, onUnmounted } from 'vue'
   import { bus } from '@/utils/bus'

   const user = ref({ name: '', age: 0 })

   // 事件回调函数：更新用户数据
   const handleUserUpdated = (data) => {
     user.value = data
   }

   onMounted(() => {
     bus.on('user-updated', handleUserUpdated) // 组件挂载时订阅事件
   })

   onUnmounted(() => {
     bus.off('user-updated', handleUserUpdated) // 组件销毁时移除监听（关键！）
   })
   </script>
   ```

#### 关键提醒：避免内存泄漏

**必须在组件销毁时用`off`移除监听**！否则即使组件被销毁，事件回调仍会保留在内存中，导致内存泄漏。


---

### provide/inject：层级无关的跨组件通信

`provide/inject`是Vue内置的**依赖注入方案**，用于**祖先组件向任意层级的后代组件传递数据或方法**
——无需逐层传递props，适合“跨多层级”的通信场景（如主题切换、用户权限控制）。

#### 核心概念

- **Provide（提供）**：祖先组件通过`provide`方法暴露数据或方法；
- **Inject（注入）**：后代组件通过`inject`方法获取祖先提供的内容。

#### 实战：跨层级的主题切换

假设我们有一个`App.vue`（祖先）、`Header.vue`（子）、`Setting.vue`（孙），需要实现“点击孙组件按钮，切换整个应用主题”：

1. **祖先组件（App.vue）：提供切换主题的方法**  
   祖先组件`provide`一个“切换主题”的方法，供后代调用：
   ```vue
   <template>
     <div :class="theme">
       <Header />
       <Setting />
     </div>
   </template>

   <script setup>
   import { ref, provide } from 'vue'
   import Header from './Header.vue'
   import Setting from './Setting.vue'

   const theme = ref('light') // 默认浅色主题

   // 切换主题的方法：修改theme的值
   const toggleTheme = () => {
     theme.value = theme.value === 'light' ? 'dark' : 'light'
   }

   // 提供方法：key为'toggleTheme'，值为toggleTheme函数
   provide('toggleTheme', toggleTheme)
   </script>

   <style>
   .light { background: white; color: #333; }
   .dark { background: #333; color: white; }
   </style>
   ```

2. **孙组件（Setting.vue）：注入方法并调用**  
   孙组件`inject`祖先提供的方法，直接调用即可切换主题：
   ```vue
   <template>
     <button @click="toggleTheme">切换主题</button>
   </template>

   <script setup>
   import { inject } from 'vue'

   // 注入祖先提供的'toggleTheme'方法
   const toggleTheme = inject('toggleTheme')
   </script>
   ```

#### 关键知识点

1. **可以传递方法**：`provide/inject`不仅能传数据，还能传**方法**——后代通过调用方法，实现“反向通信”（后代触发祖先的逻辑）。
2. **响应式支持**：若`provide`的是`ref`或`reactive`对象，`inject`后会保持响应式（比如上面的`theme`是`ref`，修改后界面会自动更新）。
3. **默认值与唯一性**：
    - 若`inject`找不到对应的key，会返回`undefined`，可设置默认值：`inject('toggleTheme', () => {})`；
    - 为避免key冲突，推荐用`Symbol`作为key（如`const THEME_KEY = Symbol('toggleTheme')`）。

---

### Composition API中的事件处理：子父组件通信

在Composition API中，子组件向父组件传递数据的核心是**`defineEmits`宏**和**`emit`函数**——通过“事件发射”实现子父通信。

#### 实战：子组件向父组件传递表单数据

假设我们有一个`LoginForm.vue`（子组件），需要将用户输入的账号密码传递给`Parent.vue`（父组件）处理：

1. **子组件（LoginForm.vue）：定义并发射事件**  
   用`defineEmits`定义要发射的事件，用`emit`函数传递数据：
   ```vue
   <template>
     <form @submit.prevent="handleSubmit">
       <input v-model="username" placeholder="账号" />
       <input v-model="password" type="password" placeholder="密码" />
       <button type="submit">登录</button>
     </form>
   </template>

   <script setup>
   import { ref, defineEmits } from 'vue'

   // 1. 定义要发射的事件：'submit'（数组形式，仅事件名）
   // 或用对象形式验证参数：defineEmits({ submit: (username, password) => !!username && !!password })
   const emit = defineEmits(['submit'])

   const username = ref('')
   const password = ref('')

   const handleSubmit = () => {
     // 2. 发射事件，传递账号密码
     emit('submit', username.value, password.value)
   }
   </script>
   ```

2. **父组件（Parent.vue）：监听事件并处理**  
   父组件用`@事件名`监听子组件的事件，接收数据并处理：
   ```vue
   <template>
     <div>
       <LoginForm @submit="handleLogin" />
     </div>
   </template>

   <script setup>
   import LoginForm from './LoginForm.vue'

   const handleLogin = (username, password) => {
     console.log('收到登录请求：', username, password)
     // 这里可以调用接口验证账号密码
   }
   </script>
   ```

#### 关键点：事件参数验证

用**对象形式**的`defineEmits`可以验证事件参数的有效性，避免父组件处理无效数据：

```javascript
const emit = defineEmits({
    // 验证submit事件的参数：账号和密码都不能为空
    submit: (username, password) => {
        if (!username || !password) {
            console.warn('账号或密码不能为空！')
            return false // 阻止事件发射
        }
        return true // 参数有效，允许发射
    }
})
```

---

### 课后Quiz：巩固你的理解

#### 问题1：Vue3为什么需要用第三方库实现全局事件总线？

**答案解析**：  
Vue3移除了`Vue.prototype`上的`$on`、`$off`、`$once`方法（这些方法来自Vue2的`EventEmitter`），因为它们容易引发**内存泄漏**
（忘记销毁监听）和**全局状态混乱**（事件名冲突）。第三方库（如mitt）更轻量、更可控，是Vue官方推荐的方案。

#### 问题2：`provide/inject`可以传递方法吗？请举例说明。

**答案解析**：  
可以。比如祖先组件`provide`一个“切换主题”的方法，后代组件`inject`后调用，实现跨层级的主题切换（参考上文“跨层级主题切换”示例）。

#### 问题3：`setup`函数中如何发射事件？

**答案解析**：  
步骤如下：

1. 用`defineEmits`宏定义要发射的事件（如`const emit = defineEmits(['submit'])`）；
2. 调用`emit`函数发射事件，并传递参数（如`emit('submit', username, password)`）。

---

### 常见报错与解决方案

#### 报错1：mitt的`on`方法监听不到事件

**错误表现**：组件A`emit`事件，但组件B`on`没反应。  
**原因分析**：

- 两个组件引入的`bus`实例不是同一个（比如每个组件都新建了mitt实例）；
- 事件名拼写错误（如`emit('userUpdated')` vs `on('user-updated')`）；
- 组件B的`on`在`emit`之后执行（如组件B还没挂载就发射了事件）。  
  **解决方案**：
- 确保所有组件引入的是**同一个`bus`实例**（如`src/utils/bus.js`导出的实例）；
- 检查事件名的大小写和连字符是否一致；
- 在`onMounted`中执行`on`（确保组件挂载后再监听）。

#### 报错2：`inject`找不到`provide`的内容

**错误表现**：`const toggleTheme = inject('toggleTheme')`返回`undefined`。  
**原因分析**：

- 祖先组件没有`provide`对应的key；
- 后代组件不在祖先的“后代链”中（如通过`slot`插入的组件，属于父组件层级）；
- key拼写错误。  
  **解决方案**：
- 检查祖先组件是否`provide`了正确的key；
- 用`console.log(this.$parent)`（Options API）或`getCurrentInstance().parent`（Composition API）确认组件层级；
- 用`Symbol`作为key（如`const THEME_KEY = Symbol('toggleTheme')`），避免冲突。

#### 报错3：`defineEmits`报“is not defined”

**错误表现**：`const emit = defineEmits(['submit'])`报错“defineEmits is not defined”。  
**原因分析**：

- Vue版本低于3.2（`defineEmits`是Vue3.2+的宏，无需导入）；
- 不在`script setup`中使用（`defineEmits`只能在`<script setup>`标签内使用）；
- 构建工具未配置`.vue`文件支持（如Webpack未用`vue-loader`）。  
  **解决方案**：
- 升级Vue到3.2+（`npm install vue@latest`）；
- 确保`defineEmits`在`script setup`中使用；
- 检查构建工具配置（Vite默认支持`.vue`，Webpack需配置`vue-loader`）。

---

### 参考链接

- Vue官方文档：事件处理 https://vuejs.org/guide/components/events.html
- Vue官方文档：provide/inject https://vuejs.org/guide/components/provide-inject.html
- mitt库文档：https://github.com/developit/mitt

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[Vue3跨组件通信中，全局事件总线与provide/inject该如何正确选择？](https://blog.cmdragon.cn/posts/ad67c4eb6d76cf7707bdfe6a8146c34f/)



<details>
<summary>往期文章归档</summary>

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