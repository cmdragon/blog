---
url: /posts/021636c2a06f5e2d3d01977a12ddf559/
title: 从捕获到冒泡：Vue事件修饰符如何重塑事件执行顺序？
date: 2026-01-10T06:58:15+08:00
lastmod: 2026-01-10T06:58:15+08:00
author: cmdragon
cover: /images/generated_image_527d5f3a-836e-4150-ba8d-86197a81175f.png

summary:
  DOM事件流分捕获、目标、冒泡三阶段，Vue默认冒泡阶段触发事件。事件修饰符改变这一行为：.stop（阻止冒泡）、.prevent（阻止默认行为）、.capture（捕获阶段触发）、.passive（优化滚动性能）、.once（只触发一次）。修饰符可串联，如.click.stop.prevent。

categories:
  - vue

tags:
  - 基础入门
  - DOM事件流
  - stop修饰符
  - prevent修饰符
  - capture修饰符
  - once修饰符
  - passive修饰符

---

<img src="/images/generated_image_527d5f3a-836e-4150-ba8d-86197a81175f.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 事件流基础：理解修饰符的前提

在讲事件修饰符前，我们得先搞懂**DOM事件流**——这是所有事件修饰符的底层逻辑。DOM事件流分为三个阶段：

1. **捕获阶段**：事件从文档根节点出发，「从外到内」遍历目标元素的所有祖先节点（比如外层div→内层div）；
2. **目标阶段**：事件到达实际触发的元素（比如点击的内层div）；
3. **冒泡阶段**：事件从目标元素「从内到外」反向传播回根节点（内层div→外层div）。

用一张流程图直观展示（Mermaid语法，可复制到Mermaid编辑器查看）：

```mermaid
graph TD
  A[文档根节点] --> B[外层div（捕获阶段）]
  B --> C[内层div（捕获阶段）]
  C --> D[内层div（目标阶段，触发点击）]
  D --> E[内层div（冒泡阶段）]
  E --> F[外层div（冒泡阶段）]
  F --> G[文档根节点（冒泡阶段）]
```

默认情况下，Vue的事件是在**冒泡阶段**触发的。而事件修饰符的作用，就是改变这个默认行为。

### .stop修饰符：把冒泡的“路”堵死

#### 什么是冒泡？

比如你有个嵌套div：点击内层div，默认会先触发内层的click，再触发外层的click——这就是**冒泡**。如果不想让父元素“躺枪”，就用
`.stop`。

#### 示例代码

```vue

<template>
  <!-- 外层div，点击会打印“外层被点了” -->
  <div class="outer" @click="log('外层被点了')">
    外层盒子
    <!-- 内层div，用.stop阻止冒泡 -->
    <div class="inner" @click.stop="log('内层被点了')">
      内层盒子
    </div>
  </div>
</template>

<script setup>
  // 简化log函数
  const log = (msg) => console.log(msg);
</script>

<style scoped>
  .outer {
    padding: 20px;
    background: #f0f0f0;
  }

  .inner {
    padding: 10px;
    background: #ccc;
    margin-top: 10px;
  }
</style>
```

#### 效果 & 原理

点击内层盒子，只会打印「内层被点了」——`.stop`直接截断了事件的冒泡路径，父元素的click事件根本没机会触发。

#### 应用场景

- 嵌套组件的点击事件（比如子组件是按钮，父组件是卡片，点击按钮不想触发卡片的点击）；
- 弹窗的关闭按钮（点击关闭按钮，不想让弹窗背景的点击事件触发）。

### .prevent修饰符：让默认行为“失效”

#### 什么是默认行为？

HTML元素自带一些默认动作：

- `<form>`提交会刷新页面；
- `<a>`点击会跳转链接；
- 右键点击会弹出浏览器菜单。

`.prevent`的作用，就是**阻止这些默认动作**，让我们能自定义行为。

#### 示例1：阻止表单刷新

```vue

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="inputVal" placeholder="输入内容"/>
    <button type="submit">提交</button>
  </form>
</template>

<script setup>
  import {ref} from 'vue';

  const inputVal = ref('');

  // 自定义提交逻辑（不会刷新页面）
  const handleSubmit = () => {
    console.log('提交的内容：', inputVal.value);
    // 这里可以写axios请求，把数据发去后端
  };
</script>
```

#### 示例2：阻止a标签跳转

```vue

<template>
  <!-- 点击不会跳转，只会打印日志 -->
  <a href="https://vuejs.org" @click.prevent="log('点了链接但没跳')">
    Vue官网（不跳转）
  </a>
</template>
```

#### 应用场景

- 自定义表单提交（用Ajax代替刷新）；
- 单页应用（SPA）中的导航链接（用路由跳转代替默认跳转）；
- 阻止右键菜单（`@contextmenu.prevent`）。

### .capture修饰符：让父元素“先动手”

默认情况下，事件是在**冒泡阶段**触发的（内层→外层）。而`.capture`修饰符会让事件在**捕获阶段**就触发（外层→内层）——也就是父元素先处理事件，再轮到子元素。

#### 示例代码

```vue

<template>
  <div class="outer"
       @click.capture="log('外层（捕获阶段）')"  <!-- 捕获阶段触发 -->
  @click="log('外层（冒泡阶段）')">         <!-- 冒泡阶段触发 -->
  外层盒子
  <div class="inner" @click="log('内层（目标阶段）')">
    内层盒子
  </div>
  </div>
</template>
```

#### 效果

点击内层盒子，打印顺序是：  
「外层（捕获阶段）」→「内层（目标阶段）」→「外层（冒泡阶段）」

#### 原理

事件流的顺序是：捕获→目标→冒泡。`.capture`把父元素的事件提前到捕获阶段执行，所以父元素先“动手”。

#### 应用场景

- 权限校验：父元素先检查用户是否有权限，再决定是否让子元素触发事件；
- 日志埋点：父元素先记录事件，再让子元素处理业务逻辑。

### .once修饰符：让事件“只做一次”

`.once`修饰符让事件**只能触发一次**，之后再点击也没用——适合“一次性操作”。

#### 示例代码

```vue

<template>
  <button @click.once="openModal">打开弹框（只点一次）</button>
  <!-- 弹框：v-if控制显示 -->
  <div v-if="isModalShow" class="modal">
    <p>这是只显示一次的弹框</p>
    <button @click="closeModal">关闭</button>
  </div>
</template>

<script setup>
  import {ref} from 'vue';

  const isModalShow = ref(false);

  // 打开弹框（只触发一次）
  const openModal = () => {
    isModalShow.value = true;
    console.log('弹框打开了');
  };

  // 关闭弹框
  const closeModal = () => {
    isModalShow.value = false;
  };
</script>

<style scoped>
  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 20px;
    background: white;
    border: 1px solid #ccc;
  }
</style>
```

#### 效果

点击“打开弹框”按钮一次后，弹框出现；再点击按钮，`openModal`不会再触发——避免重复打开弹框。

#### 应用场景

- 首次访问提示弹框；
- 抽奖按钮（只能抽一次）；
- 协议确认（只能点击一次“同意”）。

### .passive修饰符：让滚动更流畅

`.passive`是性能优化的利器，主要用于**滚动事件**（`scroll`、`touchmove`）。它告诉浏览器：“我不会阻止默认的滚动行为”，这样浏览器可以提前优化滚动，避免卡顿。

#### 为什么需要它？

在移动端，浏览器会等待事件处理函数执行完，再执行默认的滚动行为。如果处理函数里有复杂逻辑，就会导致滚动卡顿。`.passive`
让浏览器“放心”提前滚动，提升体验。

#### 示例代码

```vue

<template>
  <!-- 长列表：用.passive优化滚动 -->
  <div class="scroll-list" @scroll.passive="handleScroll">
    <p v-for="i in 100" :key="i">第{{ i }}条内容</p>
  </div>
</template>

<script setup>
  const handleScroll = () => {
    console.log('滚动了');
    // 这里可以写滚动加载逻辑（比如触底加载更多）
  };
</script>

<style scoped>
  .scroll-list {
    height: 300px;
    overflow-y: auto; /* 显示滚动条 */
    border: 1px solid #ccc;
  }
</style>
```

#### 注意事项

- **不能和.prevent一起用**：`.passive`承诺不会阻止默认行为，所以和`.prevent`冲突（Vue会报警告）；
- 只用于滚动相关事件：比如`scroll`、`touchmove`，其他事件用了也没效果。

### 修饰符的串联：组合使用更强大

Vue的事件修饰符可以**串联**使用，比如同时阻止冒泡和默认行为：

```vue

<template>
  <div class="outer" @click="log('外层被点了')">
    <!-- .stop.prevent：阻止冒泡+阻止跳转 -->
    <a href="https://vuejs.org"
       @click.stop.prevent="log('点了链接，没跳转也没冒泡')">
      点我试试
    </a>
  </div>
</template>
```

效果：点击链接不会跳转，也不会触发外层div的click事件。

### 课后小测：巩固一下

1. 要实现“点击a标签时，既不跳转页面，也不触发父元素的点击事件”，事件绑定应该怎么写？
2. 点击下面的内层div，打印顺序是什么？

```vue

<template>
  <div @click.capture="log('A')" @click="log('B')">
    <div @click.capture="log('C')" @click="log('D')">
      内层
    </div>
  </div>
</template>
```

3. 为什么在滚动事件中用`.passive`可以提升性能？

#### 答案解析

1. **答**：`@click.stop.prevent="handleClick"`。`.stop`阻止冒泡到父元素，`.prevent`阻止a标签跳转。
2. **答**：A→C→D→B。捕获阶段从外到内（A→C），目标阶段（D），冒泡阶段从内到外（B）。
3. **答**：`.passive`告诉浏览器“我不会阻止滚动”，浏览器可以提前执行默认滚动，不用等待事件处理函数完成，避免卡顿。

### 常见报错及解决

#### 1. 错误：[Vue warn]: Passive event listeners cannot be used with preventDefault.

- **原因**：`.passive`和`.prevent`冲突了——`.passive`承诺不会阻止默认行为，所以不能同时用`.prevent`。
- **解决**：去掉`.prevent`，或者不用`.passive`。

#### 2. 错误：.stop没阻止冒泡？

- **原因**：事件本身不支持冒泡（比如`focus`、`blur`），或者`.stop`用错了元素（比如用在父元素上，而不是触发事件的子元素）。
- **解决**：
    - 查MDN确认事件是否支持冒泡（比如`click`支持，`focus`不支持）；
    - 把`.stop`用在**触发事件的子元素**上（比如内层div）。

#### 3. 错误：.once修饰的事件触发多次？

- **原因**：组件被重新渲染了（比如`v-if`切换），导致事件监听器被重新绑定。
- **解决**：
    - 用`v-once`保持组件状态（` <component v-once />`）；
    - 确保组件不会重复渲染（比如用`v-show`代替`v-if`）。

参考链接：https://vuejs.org/guide/essentials/event-handling.html#event-modifiers

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[从捕获到冒泡：Vue事件修饰符如何重塑事件执行顺序？](https://blog.cmdragon.cn/posts/021636c2a06f5e2d3d01977a12ddf559/)



<details>
<summary>往期文章归档</summary>

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