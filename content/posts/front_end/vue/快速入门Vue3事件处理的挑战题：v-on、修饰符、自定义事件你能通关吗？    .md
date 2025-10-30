---
url: /posts/60ce517684f4a418f453d66aa805606c/
title: 快速入门Vue3事件处理的挑战题：v-on、修饰符、自定义事件你能通关吗？
date: 2025-10-30T09:09:07+08:00
lastmod: 2025-10-30T09:09:07+08:00
author: cmdragon
cover: /images/37076889659047936.png

summary:
  Vue3 中的 `v-on` 指令用于处理 DOM 事件，支持内联表达式和方法处理器。事件修饰符如 `.stop` 和 `.prevent` 简化了事件流控制和默认行为阻止。按键修饰符如 `.enter` 和系统修饰符如 `.ctrl` 用于处理键盘和组合键事件。自定义事件通过 `$emit` 实现子组件向父组件传递数据，`defineEmits` 可验证事件参数。常见报错包括 `$event` 未定义、事件名大小写不匹配和修饰符拼写错误。

categories:
  - vue

tags:
  - 基础入门
  - v-on指令
  - 事件处理
  - 事件修饰符
  - 自定义事件
  - 组件通信
  - DOM事件

---

<img src="/images/37076889659047936.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 1. 事件处理的基础：v-on 指令

Vue3 中，`v-on` 是处理 DOM 事件的核心指令，它允许你将组件方法或内联表达式绑定到 DOM 事件（如点击、输入、提交等）。`v-on`
有一个更简洁的缩写：`@`，这是 Vue 开发中的常用写法。

### 1.1 基本用法与缩写

`v-on` 的基本语法是：`v-on:事件名="处理器"`，缩写为 `@事件名="处理器"`。例如：

```vue
<!-- 完整写法 -->
<button v-on:click="count++">点击增加</button>
<!-- 缩写写法（推荐） -->
<button @click="count++">点击增加</button>
```

这里的`count`是组件的响应式数据，点击按钮会直接修改`count`的值——这就是**内联事件处理器**（直接写表达式）。

### 1.2 内联 vs 方法事件处理器

如果事件逻辑复杂（比如需要多个步骤），推荐使用**方法事件处理器**（调用组件的方法）：

```vue

<template>
  <button @click="handleClick">点击按钮</button>
</template>

<script setup>
  import {ref} from 'vue'

  const count = ref(0)

  // 方法事件处理器：逻辑更灵活
  const handleClick = () => {
    count.value++
    console.log(`当前计数：${count.value}`)
  }
</script>
```

**关键区别**：

- 内联处理器适合简单逻辑（如`count++`）；
- 方法处理器适合复杂逻辑（如数据校验、接口请求）。

### 1.3 传递参数与事件对象

如果需要向方法传递自定义参数，同时获取原生 DOM 事件对象（如`event.target`），可以用`$event`占位符：

```vue

<template>
  <!-- 传递自定义参数 + 事件对象 -->
  <button @click="handleClick($event, 'hello')">点击传递参数</button>
</template>

<script setup>
  const handleClick = (event, msg) => {
    // event：原生DOM事件对象（包含target、preventDefault等属性）
    console.log(`自定义消息：${msg}`) // 输出：hello
    console.log(`点击的元素：${event.target.textContent}`) // 输出：点击传递参数
  }
</script>
```

`$event`是 Vue 提供的**特殊变量**，代表原生 DOM 事件对象。

## 2. 事件修饰符：简化重复操作

Vue3 提供了**事件修饰符**（以`.`开头），用于简化常见的 DOM 操作（如阻止冒泡、阻止默认行为）。修饰符可以**链式组合**（如
`.stop.prevent`），执行顺序从左到右。

### 2.1 事件流修饰符：控制事件传递

事件流分为**捕获阶段**（从父到子）和**冒泡阶段**（从子到父）。以下修饰符用于控制事件流：

| 修饰符        | 作用                    | 示例场景          |
|------------|-----------------------|---------------|
| `.stop`    | 阻止事件冒泡（停止向上传递）        | 子元素点击不触发父元素事件 |
| `.prevent` | 阻止默认行为（如表单提交、链接跳转）    | 阻止表单刷新页面      |
| `.self`    | 仅当事件目标是元素本身时触发（排除子元素） | 点击父元素的背景才触发   |
| `.once`    | 事件仅触发一次（之后失效）         | 仅允许点击一次的按钮    |
| `.capture` | 在捕获阶段触发事件（而非冒泡阶段）     | 父元素先于子元素触发    |

**示例：.stop 阻止冒泡**  
父元素的点击事件会被子元素的`.stop`修饰符阻止：

```vue
<template>
  <div @click="parentClick" style="padding: 20px; background: #eee">
    <!-- .stop：阻止点击事件冒泡到父元素 -->
    <button @click.stop="childClick">点击子按钮</button>
  </div>
</template>

<script setup>
const parentClick = () => console.log('父元素被点击')
const childClick = () => console.log('子按钮被点击') // 仅输出这个
</script>
```

**示例：.prevent 阻止默认行为**  
阻止表单提交的默认刷新行为：

```vue

<template>
  <!-- .prevent：阻止表单默认提交（刷新页面） -->
  <form @submit.prevent="handleSubmit">
    <input type="text" placeholder="输入内容"/>
    <button type="submit">提交</button>
  </form>
</template>

<script setup>
  const handleSubmit = () => {
    console.log('表单提交逻辑（不会刷新页面）')
  }
</script>
```

### 2.2 按键修饰符：处理键盘事件

针对键盘事件（如`keyup`、`keydown`），Vue3 提供了**按键修饰符**，直接绑定常用按键：

| 修饰符           | 对应按键   |
|---------------|--------|
| `.enter`      | 回车键    |
| `.tab`        | Tab键   |
| `.delete`     | 删除/退格键 |
| `.esc`        | Esc键   |
| `.space`      | 空格键    |
| `.up`/.`down` | 上下箭头键  |

**示例：监听回车键提交**  
输入完成后按回车键触发提交：

```vue

<template>
  <input
      @keyup.enter="submitForm"
      placeholder="按回车键提交"
  />
</template>

<script setup>
  const submitForm = () => {
    console.log('表单提交成功！')
  }
</script>
```

### 2.3 系统修饰符：组合键操作

系统修饰符（如`Ctrl`、`Alt`）用于绑定**组合键**（如`Ctrl+Click`）：

| 修饰符      | 对应按键                         |
|----------|------------------------------|
| `.ctrl`  | Ctrl键（Windows/Linux）         |
| `.alt`   | Alt键                         |
| `.shift` | Shift键                       |
| `.meta`  | Win键（Windows）/ Command键（Mac） |

**示例：Ctrl+Click 触发操作**  
需要按住`Ctrl`键再点击按钮才生效：

```vue

<template>
  <button @click.ctrl="handleCtrlClick">Ctrl+点击我</button>
</template>

<script setup>
  const handleCtrlClick = () => {
    console.log('Ctrl键被按住了！')
  }
</script>
```

### 2.4 精确修饰符：严格匹配组合键

`.exact`修饰符用于**严格匹配**组合键（避免多余按键干扰）。例如：

```vue
<!-- 仅当按住Ctrl键（无其他键）时触发 -->
<button @click.ctrl.exact="handleExactClick">仅Ctrl+点击</button>
```

如果同时按住`Ctrl+Shift`点击，不会触发`handleExactClick`——`.exact`确保只有指定的系统修饰键被按住。

## 3. 自定义事件：组件间通信

Vue3 中，**子组件向父组件传递数据**的核心方式是**自定义事件**：子组件用`$emit`触发事件，父组件用`@事件名`监听。

### 3.1 基本用法

**子组件（Child.vue）**：触发自定义事件`add`，并传递数据`1`：

```vue

<template>
  <button @click="$emit('add', 1)">增加1</button>
</template>
```

**父组件（Parent.vue）**：监听`add`事件，接收子组件传递的数据：

```vue

<template>
  <!-- 监听子组件的add事件 -->
  <Child @add="handleAdd"/>
  <p>当前计数：{{ count }}</p>
</template>

<script setup>
  import {ref} from 'vue'
  import Child from './Child.vue'

  const count = ref(0)
  // 处理子组件的add事件：接收传递的参数（1）
  const handleAdd = (value) => {
    count.value += value
  }
</script>
```

**关键规则**：

- 事件名推荐用`kebab-case`（短横线命名），如`add-item`而非`addItem`（符合 HTML attribute 规范）；
- `$emit`的第一个参数是事件名，第二个及以后是传递给父组件的数据。

### 3.2 验证自定义事件（可选）

如果需要限制自定义事件的参数类型（如必须是数字），可以用`defineEmits`宏定义事件：

```vue
<!-- Child.vue（带事件验证） -->
<script setup>
  // 定义自定义事件：add（参数必须是数字）
  const emit = defineEmits({
    add: (value) => typeof value === 'number'
  })

  const handleClick = () => {
    emit('add', 1) // 合法：参数是数字
    // emit('add', '1') // 非法：参数是字符串（会报警告）
  }
</script>
```

`defineEmits`会在开发环境下验证事件参数——如果参数类型错误，控制台会抛出警告。

## 4. 课后 Quiz：巩固理解

### 问题1：如何阻止点击事件的冒泡，并阻止默认行为？

**答案**：用`.stop.prevent`组合修饰符：

```vue

<button @click.stop.prevent="handleClick">阻止冒泡+默认行为</button>
```

**解析**：`.stop`阻止冒泡，`.prevent`阻止默认行为，顺序不影响效果。

### 问题2：子组件如何向父组件传递多个参数？

**答案**：`$emit`可以传递多个参数，父组件用多个参数接收：

- 子组件：`$emit('send-data', '参数1', '参数2')`
- 父组件：`@send-data="handleData($event, arg2)"` 或直接用解构：
  ```vue
  <Child @send-data="(a, b) => handleData(a, b)" />
  ```

### 问题3：`.exact`修饰符的作用是什么？

**答案**：严格匹配系统修饰键的组合（避免多余按键）。例如：

```vue
<!-- 仅当按住Ctrl键（无其他键）时触发 -->
<button @click.ctrl.exact="handleExact">仅Ctrl+点击</button>
```

## 5. 常见报错与解决方案

### 报错1：$event is undefined

**原因**：方法事件处理器中未传递`$event`，但尝试使用它。  
**错误示例**：

```vue
<!-- 未传递$event -->
<button @click="handleClick">点击</button>
<script setup>
  const handleClick = (event) => {
    console.log(event) // undefined
  }
</script>
```

**解决**：传递`$event`或直接使用方法（Vue 会自动传递`event`）：

```vue
<!-- 方式1：传递$event -->
<button @click="handleClick($event)">点击</button>
<!-- 方式2：直接用方法（Vue自动传递event） -->
<button @click="handleClick">点击</button>
<script setup>
  const handleClick = (event) => {
    console.log(event) // 正常输出事件对象
  }
</script>
```

### 报错2：自定义事件不触发

**原因**：事件名大小写不匹配（Vue3 事件名**大小写敏感**）。  
**错误示例**：

- 子组件：`$emit('customEvent')`（camelCase）
- 父组件：`@custom-event="handleEvent"`（kebab-case）  
  **解决**：统一用`kebab-case`命名事件：
- 子组件：`$emit('custom-event')`
- 父组件：`@custom-event="handleEvent"`

### 报错3：修饰符不生效

**原因**：使用了不存在的修饰符（如`.stopp`拼错成`.stopp`）。  
**解决**：核对 Vue 官网的修饰符列表（https://vuejs.org/guide/essentials/event-handling.html#event-modifiers），确保拼写正确。

## 参考链接

参考链接：https://vuejs.org/guide/essentials/event-handling.html

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[Vue3事件处理的挑战题：v-on、修饰符、自定义事件你能通关吗？](https://blog.cmdragon.cn/posts/60ce517684f4a418f453d66aa805606c/)




<details>
<summary>往期文章归档</summary>

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