---
url: /posts/b5f7f3269f2d566db22388cd24d1c441/
title: Vue条件渲染中v-if与v-show如何抉择？重复渲染问题又该如何优化？
date: 2025-12-25T08:55:18+08:00
lastmod: 2025-12-25T08:55:18+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/generated_image_cfd2b6cf-50b8-42fc-810f-3725ef5d8985.png

summary:
  Vue条件渲染中，v-if与v-show核心区别在DOM销毁（v-if销毁，v-show仅切换display）。重复渲染因条件表达式复杂、子组件无必要更新、节点复用状态残留。优化：用key贴标识，按切换频率选指令，复杂条件抽计算属性，Teleport隔离组件，KeepAlive缓存组件，拆分响应式依赖。

categories:
  - vue

tags:
  - 基础入门
  - v-if vs v-show
  - 重复渲染优化
  - key优化
  - KeepAlive缓存
  - 计算属性
  - Teleport隔离

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/generated_image_cfd2b6cf-50b8-42fc-810f-3725ef5d8985.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 条件渲染的基本逻辑：v-if vs v-show

先从最基础的说起——Vue里最常用的两个条件渲染指令：`v-if`和`v-show`。很多初学者刚接触时会混淆它们，其实核心区别就一个：*
*是否真正销毁DOM节点**。

`v-if`是“惰性选手”：只有当条件为真时，才会创建DOM节点；条件为假时，直接把节点从DOM树里删掉。比如一个管理员才能看到的按钮，用
`v-if="isAdmin"`，如果用户不是管理员，这个按钮根本不会出现在DOM里。

`v-show`是“隐藏选手”：不管条件真假，先把DOM节点渲染出来，然后用CSS的`display: none`来切换显隐。比如一个频繁切换的tab栏，用
`v-show`就比`v-if`更划算——因为切换时只是改个CSS属性，不用反复创建/销毁节点。

举个直观的例子：假设你有个“夜间模式”开关，需要频繁点按。用`v-show`的话，第一次渲染时就把夜间模式的样式容器建好，切换时只需要把
`display`从`none`改成`block`；而用`v-if`的话，每次切换都要重新创建/销毁这个容器，相当于反复拆建房子，肯定更费性能。

### 为什么会出现“重复渲染”？

在讲优化之前，得先搞明白：**为什么条件渲染会导致重复渲染？**

Vue的响应式系统是“依赖收集+触发更新”的模式：当你用`ref`或`reactive`
定义数据时，Vue会跟踪每个数据被哪些组件/表达式使用（依赖收集）；当数据变化时，Vue会通知所有依赖它的部分重新渲染（触发更新）。

如果你的条件表达式里藏了很多“不必要的依赖”，或者条件切换时触发了过多的节点重建，就会导致**重复渲染**——比如：

1. **条件表达式太复杂**：比如`v-if="a && b || c && !d"`，其中`a`、`b`、`c`、`d`都是响应式数据，任何一个变化都会触发条件重新计算，进而导致组件更新。
2. **子组件被“连坐”**：父组件的条件变化时，即使子组件的props没改，子组件也会跟着重新渲染（因为父组件更新会触发所有子组件的更新）。
3. **节点复用导致的“状态残留”**：Vue为了性能会复用相同结构的节点，比如两个`v-if`分支里的输入框，如果不用`key`
   区分，切换时输入框的内容会保留，看似“省性能”，但实际可能导致逻辑错误（比如登录和注册表单的输入框复用）。

### 优化技巧1：用`key`给节点“贴身份证”

`key`是Vue里最被低估的优化工具之一——它相当于节点的“唯一标识”，Vue通过`key`判断两个节点是不是同一个，从而决定是复用还是重建。

#### 场景1：条件分支的“状态隔离”

比如你有个切换登录/注册的组件：

```vue

<div v-if="isLogin">
  <input placeholder="用户名"/>
</div>
<div v-else>
  <input placeholder="邮箱"/>
</div>
```

如果没有`key`，切换`isLogin`时，Vue会复用输入框节点—— placeholder变了，但输入的内容会保留（比如你在登录框输入了“张三”，切换到注册框，输入框里还是“张三”）。这显然不符合预期。

解决办法很简单：给两个分支加不同的`key`：

```vue

<div v-if="isLogin" key="login">
  <input placeholder="用户名"/>
</div>
<div v-else key="register">
  <input placeholder="邮箱"/>
</div>
```

`key`变了，Vue就会认为这是两个完全不同的节点，切换时会销毁旧节点、创建新节点，输入框的内容自然就清空了。

#### 场景2：列表渲染的“性能保障”

列表渲染里的`key`更重要。比如你有个 todo 列表：

```vue
<!-- 错误：用索引当key -->
<li v-for="(item, index) in todos" :key="index">
  {{ item.text }}
</li>
```

如果删除中间的一个todo，后面的所有`index`都会变（比如第3个变成第2个），Vue会认为这些节点都“变了”，从而重新渲染所有后续节点——如果列表很长，这会非常卡。

正确的做法是用**唯一标识**当`key`（比如后端返回的`id`）：

```vue

<li v-for="item in todos" :key="item.id">
  {{ item.text }}
</li>
```

这样即使列表变化，Vue也能准确识别哪些节点需要保留、哪些需要更新，避免不必要的重新渲染。

### 优化技巧2：选对`v-if`和`v-show`，别“用错工具”

很多人问：“到底什么时候用`v-if`，什么时候用`v-show`？”其实判断标准就一个：**切换频率**。

- **频繁切换（比如tab、弹窗）**：用`v-show`。虽然初始化时要渲染节点，但切换成本低（改CSS）。
- **不频繁切换（比如权限控制、页面初始化）**：用`v-if`。虽然切换成本高，但初始化时不渲染节点，节省DOM资源。

举个例子：你的页面有个“反馈弹窗”，用户可能频繁点击开关——用`v-show`；而“管理员设置”页面，只有管理员登录才会显示——用`v-if`。

### 优化技巧3：用计算属性“简化条件”

如果你的条件表达式越来越复杂（比如`v-if="a && b || (c && !d) && e"`），千万别直接写在模板里！因为**模板里的表达式会在每次组件更新时重新计算
**，即使依赖的数据没变化。

正确的做法是把复杂条件抽到**计算属性**里——计算属性会缓存结果，只有依赖的数据变化时才会重新计算。

比如你有个商品列表，要显示“折扣且有库存”的商品：

```vue
<!-- 错误：模板里写复杂条件 -->
<div v-for="item in items" v-if="item.discount > 0 && item.stock > 0" :key="item.id">
  {{ item.name }}
</div>
```

改成计算属性：

```vue

<template>
  <div v-for="item in discountedItems" :key="item.id">
    {{ item.name }}
  </div>
</template>

<script setup>
  import {ref, computed} from 'vue'

  const items = ref([
    {id: 1, name: '手机', discount: 0.8, stock: 10},
    {id: 2, name: '电脑', discount: 0, stock: 5},
    {id: 3, name: '平板', discount: 0.7, stock: 0}
  ])

  // 计算属性：过滤折扣且有库存的商品
  const discountedItems = computed(() => {
    return items.value.filter(item => item.discount > 0 && item.stock > 0)
  })
</script>
```

这样一来，只有`items`里的`discount`或`stock`变化时，`discountedItems`才会重新计算，比模板里的条件表达式高效得多。

### 优化技巧4：用`Teleport`隔离“独立组件”

有没有遇到过这种情况？你的模态框放在父组件里，父组件的条件变化时，模态框也跟着重新渲染？比如父组件用`v-if`
控制一个列表，每次列表更新，模态框都要重新创建——这其实是没必要的，因为模态框的逻辑和父组件无关。

这时候`Teleport`就派上用场了——它能把组件的DOM节点“传送”到其他位置（比如`body`），从而脱离父组件的DOM树，避免父组件的更新影响它。

比如一个模态框：

```vue
<template>
  <button @click="showModal = true">打开模态框</button>

  <!-- 用Teleport把模态框传送到body下 -->
  <Teleport to="body">
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>我是模态框</h3>
        <button @click="showModal = false">关闭</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
const showModal = ref(false)
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
}
</style>
```

`Teleport`把模态框的DOM节点放到了`body`下，父组件的任何更新都不会影响它——因为它已经“跳出”了父组件的DOM树。

### 优化技巧5：拆分组件+`KeepAlive`，缓存“频繁切换的组件”

如果你的条件渲染涉及频繁切换的复杂组件（比如tab栏里的表单），反复创建/销毁组件会很耗性能——这时候`KeepAlive`
组件能帮你“缓存”组件实例，避免重复渲染。

比如一个切换登录/注册的tab栏：

```vue
<template>
  <div class="tab-bar">
    <button @click="activeTab = 'login'" :class="{ active: activeTab === 'login' }">登录</button>
    <button @click="activeTab = 'register'" :class="{ active: activeTab === 'register' }">注册</button>
  </div>

  <!-- 用KeepAlive缓存组件 -->
  <KeepAlive>
    <component :is="activeTab === 'login' ? LoginForm : RegisterForm" :key="activeTab" />
  </KeepAlive>
</template>

<script setup>
import { ref } from 'vue'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'

const activeTab = ref('login')
</script>

<style scoped>
.tab-bar {
  margin-bottom: 20px;
}
.tab-bar button {
  padding: 8px 16px;
  margin-right: 10px;
  cursor: pointer;
}
.tab-bar button.active {
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
}
</style>
```

`KeepAlive`会把`LoginForm`和`RegisterForm`的实例缓存起来，切换tab时不会重新创建——输入框的内容会保留，性能也提升了。

### 优化技巧6：避免“不必要的响应式依赖”

有时候，条件渲染的重复渲染是因为**条件表达式里包含了太多响应式数据**。比如：

```vue

<div v-if="user && user.address && user.address.city === 'Beijing'">
  你在北京！
</div>
```

这里`user`是一个`reactive`对象，任何`user`的属性变化（比如`user.name`）都会触发条件重新计算——即使`city`没改。

解决办法有两个：

1. **把需要的属性单独抽成`ref`**：
   ```javascript
   import { ref, computed } from 'vue'

   const user = ref({
     name: '张三',
     address: { city: 'Beijing' }
   })

   // 把city单独抽成ref
   const city = ref(user.value.address.city)

   // 条件用city的值
   const isBeijing = computed(() => city.value === 'Beijing')
   ```
2. **用`toRaw`获取原始对象**：
   ```javascript
   import { ref, toRaw, computed } from 'vue'

   const user = ref({
     name: '张三',
     address: { city: 'Beijing' }
   })

   // 获取原始对象（非响应式）
   const rawUser = toRaw(user.value)

   // 条件用原始对象的属性
   const isBeijing = computed(() => rawUser.address.city === 'Beijing')
   ```

这样一来，只有`city`变化时，条件才会重新计算，避免了不必要的更新。

### 课后Quiz：巩固一下

1. **问题**：`v-if`和`v-show`的核心区别是什么？分别适合什么场景？
   **答案**：`v-if`是“销毁/创建DOM节点”，适合不频繁切换的场景（如权限控制）；`v-show`是“CSS显隐”，适合频繁切换的场景（如tab栏）。
   **解析**：参考Vue官网的条件渲染文档：https://vuejs.org/guide/essentials/conditional.html#v-if-vs-v-show。

2. **问题**：为什么列表渲染时不能用索引当`key`？
   **答案**：索引是动态的，当列表添加/删除/排序时，索引会变化，导致Vue认为是不同的节点，从而重新渲染所有后续节点，影响性能。
   **解析**：参考Vue官网的列表渲染文档：https://vuejs.org/guide/essentials/list.html#maintaining-state-with-key。

3. **问题**：`KeepAlive`组件的作用是什么？请写出一个使用`KeepAlive`的示例。
   **答案**：`KeepAlive`用于缓存组件实例，避免频繁创建/销毁。示例：
   ```vue
   <KeepAlive>
     <component :is="activeComponent" :key="activeComponent" />
   </KeepAlive>
   ```
   **解析**：参考Vue官网的`KeepAlive`文档：https://vuejs.org/guide/built-ins/keep-alive.html。

### 常见报错解决方案

#### 报错1：`Duplicate keys detected: 'xxx'. This may cause an update error.`

- **原因**：多个节点用了相同的`key`，Vue无法识别唯一节点。
- **解决**：确保每个节点的`key`唯一，比如用数据的`id`代替索引。
- **预防**：列表渲染时优先用唯一标识当`key`，条件分支用不同的`key`。

#### 报错2：`v-if and v-for on the same element is not recommended.`

- **原因**：`v-for`优先级比`v-if`高，导致每次循环都要判断条件，性能差。
- **解决**：用计算属性过滤列表，再用`v-for`循环过滤后的结果。
- **预防**：避免在同一个元素上同时用`v-for`和`v-if`。

#### 报错3：`Component is missing template or render function.`

- **原因**：组件没有定义模板或渲染函数，比如忘记写`<template>`标签。
- **解决**：检查组件是否有`<template>`标签（单文件组件）或`render`函数（函数式组件）。
- **预防**：创建组件时确保有模板或渲染函数。

### 参考链接

- Vue 条件渲染：https://vuejs.org/guide/essentials/conditional.html
- Vue 列表渲染中的`key`：https://vuejs.org/guide/essentials/list.html#maintaining-state-with-key
- Vue `KeepAlive`组件：https://vuejs.org/guide/built-ins/keep-alive.html
- Vue 计算属性：https://vuejs.org/guide/essentials/computed.html
- Vue `Teleport`组件：https://vuejs.org/guide/built-ins/teleport.html

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[Vue条件渲染中v-if与v-show如何抉择？重复渲染问题又该如何优化？](https://blog.cmdragon.cn/posts/b5f7f3269f2d566db22388cd24d1c441/)



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