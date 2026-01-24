---
url: /posts/27d1ed13ce49de6af99374f9e0f7a534/
title: Vue3 v-if与v-show：销毁还是隐藏，如何抉择？
date: 2025-12-24T03:41:20+08:00
lastmod: 2025-12-24T03:41:20+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/generated_image_c74a9e79-f190-4db1-89f8-3d07d3f044ed.png

summary:
  Vue3中v-if与v-show是条件渲染核心指令。v-if控制组件存在（条件假时销毁，真时创建），v-show控制显示（修改display样式，组件始终存在）。v-if切换成本高（初始化快），v-show切换成本低（初始化高）。频繁切换或需保留状态用v-show，极少变化用v-if。注意v-show不与v-else搭配，v-if/v-for共存需先过滤数组。

categories:
  - vue

tags:
  - 基础入门
  - v-show
  - 条件渲染
  - 原理拆解
  - 性能对比
  - 选择策略
  - 常见问题

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/generated_image_c74a9e79-f190-4db1-89f8-3d07d3f044ed.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 1. v-if 与 v-show 的基本概念

条件渲染是Vue3中控制界面显示的核心能力，而`v-if`和`v-show`是实现这一能力的两大核心指令。它们的本质差异，要从“**是否真正改变组件的存在
**”说起。

#### 1.1 v-if：真正的“存在与否”

`v-if`是“**破坏性条件渲染**”——当条件为`true`时，它会**创建**组件实例并渲染到DOM中；当条件为`false`时，它会**销毁**
组件实例并从DOM中移除。换句话说，`v-if`控制的是“组件是否存在”。

举个例子：

```html

<button @click="toggle">切换文本</button>
<div v-if="isShow">Hello, Vue3!</div>
```  

当`isShow`为`false`时，你在浏览器DevTools里**找不到这个`div`**——它被完全销毁了。而且，组件的生命周期钩子（如`onMounted`/
`onUnmounted`）会随着条件切换触发：销毁时执行`onUnmounted`，重建时执行`onMounted`。

#### 1.2 v-show：只是“看得见看不见”

`v-show`是“**非破坏性条件渲染**”——无论条件真假，它都会先把组件渲染到DOM中，再通过**修改CSS的`display`属性**控制可见性。换句话说，
`v-show`控制的是“组件是否可见”，但组件始终存在。

同样的例子，换成`v-show`：

```html

<button @click="toggle">切换文本</button>
<div v-show="isShow">Hello, Vue3!</div>
```  

当`isShow`为`false`时，`div`依然在DOM中，只是多了`style="display: none"`。此时，组件实例没有被销毁，生命周期钩子也不会触发——它只是“被藏起来了”。

### 2. 原理拆解：为什么行为差异这么大？

理解原理是选择的关键，我们用“生活比喻”帮你快速记住：

- **v-if**像“客房的家具”：客人来了（条件为真），你把家具搬出来（创建组件）；客人走了（条件为假），你把家具收起来（销毁组件）。每次搬运都要花时间（切换成本高），但平时不占空间（初始化成本低）。
- **v-show**像“客厅的电视”：不管你看不看（条件真假），电视都在那里（存在于DOM）；你只是用遥控器（`v-show`
  ）切换“显示/隐藏”（修改CSS）。切换动作很快（成本低），但始终占地方（初始化成本高）。

### 3. 性能对比：初始化 vs 切换成本

`v-if`和`v-show`的性能差异，本质是**“空间换时间”还是“时间换空间”**的选择：

#### 3.1 初始化成本：v-if 更“省空间”

当初始条件为`false`时：

- `v-if`：不渲染任何内容，DOM中无节点，**初始化速度快**；
- `v-show`：强制渲染组件，DOM中存在节点，**初始化速度慢**。

比如，一个“仅管理员可见”的按钮，用`v-if`更合适——普通用户打开页面时，按钮不会被渲染，减少页面加载时间。

#### 3.2 切换成本：v-show 更“省时间”

当条件需要**频繁切换**时：

- `v-if`：每次切换都要销毁重建组件，涉及DOM操作和生命周期钩子，**切换速度慢**；
- `v-show`：仅修改CSS属性，无DOM重建，**切换速度快**。

比如， tabs 切换、弹窗显示隐藏，用`v-show`更流畅——用户点击时不会有延迟。

### 4. 选择策略：到底该用谁？

结合原理和性能，我们总结了**3条黄金法则**：

#### 4.1 频繁切换？选v-show！

如果组件需要反复显示/隐藏（如 tabs、弹窗、折叠面板），优先用`v-show`。比如：

```html
<!-- 频繁切换的弹窗，用v-show -->
<modal v-show="isModalOpen" @close="isModalOpen = false"></modal>
```  

#### 4.2 极少变化？选v-if！

如果条件几乎不会改变（如权限控制、初始化提示），优先用`v-if`。比如：

```html
<!-- 仅管理员可见的按钮，用v-if -->
<button v-if="isAdmin" @click="deleteItem">删除</button>
```  

#### 4.3 要保留状态？选v-show！

如果组件包含需要保留的状态（如表单输入、播放器进度），必须用`v-show`——`v-if`会销毁组件，导致状态丢失。

举个直观的例子：

```html

<template>
    <button @click="toggle">切换输入框</button>
    <!-- v-if：输入内容会重置 -->
    <div v-if="isShow">
        <input type="text" placeholder="v-if 输入框"/>
    </div>
    <!-- v-show：输入内容保留 -->
    <div v-show="isShow">
        <input type="text" placeholder="v-show 输入框"/>
    </div>
</template>

<script setup>
    import {ref} from 'vue'

    const isShow = ref(true)
    const toggle = () => isShow.value = !isShow.value
</script>
```  

试着输入内容后切换：`v-if`的输入框会清空（组件销毁），`v-show`的输入框内容不变（组件存在）。

### 5. 动手实践：看得到的差异

为了更直观，我们用**生命周期钩子**验证两者的区别：

1. 创建子组件`Child.vue`：
   ```html
   <template><div>我是子组件</div></template>
   <script setup>
   import { onMounted, onUnmounted } from 'vue'
   onMounted(() => console.log('子组件挂载了！'))
   onUnmounted(() => console.log('子组件销毁了！'))
   </script>
   ```  

2. 父组件中切换：
   ```html
   <template>
     <button @click="toggle">切换子组件</button>
     <!-- 用v-if时，切换会打印日志 -->
     <Child v-if="isShow" />
     <!-- 用v-show时，切换无日志 -->
     <!-- <Child v-show="isShow" /> -->
   </template>

   <script setup>
   import { ref } from 'vue'
   import Child from './Child.vue'
   const isShow = ref(true)
   const toggle = () => isShow.value = !isShow.value
   </script>
   ```  

运行后点击按钮：

- 用`v-if`：切换会打印“子组件销毁了！”和“子组件挂载了！”（组件生死轮回）；
- 用`v-show`：无日志（组件始终存在）。

### 6. 课后Quiz：巩固你的理解

**问题**：你在开发“用户设置”页面，其中“高级设置”面板可以点击“展开/收起”切换。面板包含多个输入框（如“个性签名”），需要保留用户输入。请问该用
`v-if`还是`v-show`？为什么？

**答案解析**：  
用**v-show**。原因有二：

1. **频繁切换**：用户可能多次展开/收起，`v-show`切换成本更低；
2. **状态保留**：输入框需要保留内容，`v-show`不会销毁组件，状态不会丢失。

### 7. 常见报错与解决

使用`v-if`/`v-show`时，这些“坑”要避开：

#### 问题1：v-show 不能和 v-else 一起用

**报错**：`v-else can only be used with v-if`  
**原因**：`v-else`是`v-if`的配套指令，`v-show`是CSS控制，无法配合。  
**解决**：用`v-if`代替`v-show`，或分开写`v-show`：

```html
<!-- 错误 -->
<div v-show="isShow">内容A</div>
<div v-else>内容B</div>

<!-- 正确：用v-if -->
<div v-if="isShow">内容A</div>
<div v-else>内容B</div>

<!-- 正确：分开写v-show -->
<div v-show="isShow">内容A</div>
<div v-show="!isShow">内容B</div>
```  

#### 问题2：v-if 和 v-for 一起用导致性能低

**报错场景**：同一个元素同时用`v-if`和`v-for`：

```html

<li v-for="item in list" v-if="item.isActive">{{ item.name }}</li>
```  

**原因**：Vue3中`v-for`优先级高于`v-if`，会先循环所有元素，再逐个判断条件，重复计算导致性能差。  
**解决**：用`computed`先过滤数组：

```html

<template>
    <li v-for="item in activeItems" :key="item.id">{{ item.name }}</li>
</template>

<script setup>
    import {ref, computed} from 'vue'

    const list = ref([/* 数据 */])
    // 先过滤出active的item
    const activeItems = computed(() => list.value.filter(item => item.isActive))
</script>
```  

#### 问题3：v-show 对 template 无效

**报错场景**：用`v-show`控制`<template>`标签：

```html

<template v-show="isShow">
    <div>内容</div>
</template>
```  

**原因**：`<template>`是Vue的虚拟标签，不会渲染成真实DOM，`v-show`无法修改其`display`属性。  
**解决**：用真实DOM元素（如`<div>`）包裹，或用`<template v-if>`：

```html
<!-- 正确：用div包裹 -->
<div v-show="isShow">
    <div>内容</div>
</div>

<!-- 正确：用v-if -->
<template v-if="isShow">
    <div>内容</div>
</template>
```  

### 8. 参考链接

参考链接：https://vuejs.org/guide/essentials/conditional.html#v-if-vs-v-show

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[Vue3 v-if与v-show：销毁还是隐藏，如何抉择？](https://blog.cmdragon.cn/posts/27d1ed13ce49de6af99374f9e0f7a534/)



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