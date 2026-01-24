---
url: /posts/a325ca6534b78c20bd46c816c3f82aee/
title: 快速入门Vue3：条件渲染与列表渲染的小秘密，你居然还不知道？
date: 2025-10-31T00:01:29+08:00
lastmod: 2025-10-31T00:01:29+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/40680a4ca1404cc9ba5819ef69ae21b7~tplv-5jbd59dj06-image.png

summary:
  Vue中的条件渲染通过`v-if`和`v-show`实现，`v-if`根据条件销毁或重建DOM，适合不频繁切换的场景；`v-show`通过CSS控制显隐，适合频繁切换的场景。列表渲染使用`v-for`遍历数组或对象，`key`属性确保节点正确复用，避免使用索引作为`key`。`v-for`与`v-if`不应同时使用，建议通过`computed`属性过滤数据后再渲染。

categories:
  - vue

tags:
  - 基础入门
  - 条件渲染
  - 列表渲染
  - v-if
  - v-show
  - v-for
  - key属性

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/40680a4ca1404cc9ba5819ef69ae21b7~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 一、条件渲染：控制DOM的显隐逻辑

条件渲染是Vue中**根据状态动态添加/移除DOM元素**的核心能力，主要通过`v-if`系列指令和`v-show`实现。

#### 1.1 `v-if`：真正的“条件渲染”

`v-if`是Vue中最基础的条件指令，它会**根据表达式的真假，完全创建或销毁对应的DOM元素**（包括其内部的组件和事件监听器）。

##### 基础用法

```vue

<template>
  <div class="user-profile">
    <!-- 未登录时显示登录按钮 -->
    <button v-if="!isLoggedIn" @click="login">立即登录</button>
    <!-- 登录后显示用户信息 -->
    <div v-else>
      <img src="avatar.png" alt="头像"/>
      <span>欢迎，{{ username }}！</span>
      <button @click="logout">退出登录</button>
    </div>
  </div>
</template>

<script setup>
  import {ref} from 'vue'

  // 登录状态（初始未登录）
  const isLoggedIn = ref(false)
  // 用户名
  const username = ref('')

  // 登录逻辑
  const login = () => {
    isLoggedIn.value = true
    username.value = 'Vue新手'
  }

  // 退出逻辑
  const logout = () => {
    isLoggedIn.value = false
    username.value = ''
  }
</script>
```

##### 多分支条件：`v-else-if`

当需要多个条件分支时，用`v-else-if`连接：

```vue

<template>
  <div class="score-display">
    <p v-if="score >= 90">优秀</p>
    <p v-else-if="score >= 70">良好</p>
    <p v-else-if="score >= 60">及格</p>
    <p v-else>不及格</p>
  </div>
</template>

<script setup>
  import {ref} from 'vue'

  const score = ref(85) // 显示“良好”
</script>
```

##### 批量条件渲染：`template`

若需要**多个元素同时满足条件**，可使用`template`包裹（`template`不会渲染为真实DOM节点）：

```vue

<template>
  <template v-if="isAdmin">
    <button>管理用户</button>
    <button>查看日志</button>
    <button>设置权限</button>
  </template>
</template>
```

#### 1.2 `v-show`：基于CSS的“显示切换”

`v-show`的作用与`v-if`类似，但它**不会销毁DOM元素**，而是通过CSS的`display: none`属性控制显隐。元素始终存在于DOM中，只是“看不见”。

##### 基础用法

```vue

<template>
  <div class="tab-container">
    <button @click="activeTab = 'home'">首页</button>
    <button @click="activeTab = 'about'">关于我们</button>

    <!-- 用v-show切换tab内容 -->
    <div v-show="activeTab === 'home'" class="tab-content">首页内容</div>
    <div v-show="activeTab === 'about'" class="tab-content">关于我们</div>
  </div>
</template>

<script setup>
  import {ref} from 'vue'

  const activeTab = ref('home') // 默认显示首页
</script>
```

#### 1.3 `v-if` vs `v-show`：核心差异与场景选择

| 特性     | `v-if`           | `v-show`           |
|--------|------------------|--------------------|
| DOM操作  | 销毁/重建元素          | 修改CSS样式（display）   |
| 初始渲染成本 | 条件为假时，无成本        | 无论条件真假，都要渲染元素      |
| 切换成本   | 条件切换时，成本高（DOM操作） | 切换成本低（仅修改样式）       |
| 应用场景   | 不频繁切换的场景（如登录状态）  | 频繁切换的场景（如tab、折叠面板） |

### 二、列表渲染：遍历数据生成DOM

列表渲染是Vue中**将数组/对象数据转换为DOM列表**的核心能力，通过`v-for`指令实现。

#### 2.1 `v-for`的基本用法

`v-for`可以遍历**数组、对象、字符串、数字**，语法为：`v-for="(item, index) in data"`（数组）或
`v-for="(value, key, index) in object"`（对象）。

##### 1. 遍历数组（最常见）

```vue

<template>
  <ul class="todo-list">
    <!-- 遍历todos数组，item是当前项，index是索引 -->
    <li v-for="(todo, index) in todos" :key="todo.id">
      {{ index + 1 }}. {{ todo.text }}
      <button @click="deleteTodo(index)">删除</button>
    </li>
  </ul>
</template>

<script setup>
  import {ref} from 'vue'

  // 待办事项列表
  const todos = ref([
    {id: 1, text: '学习Vue条件渲染'},
    {id: 2, text: '掌握v-for的key用法'},
    {id: 3, text: '完成一篇博客'}
  ])

  // 删除待办项
  const deleteTodo = (index) => {
    todos.value.splice(index, 1)
  }
</script>
```

##### 2. 遍历对象

```vue

<template>
  <ul class="user-info">
    <!-- 遍历user对象，value是属性值，key是属性名 -->
    <li v-for="(value, key) in user" :key="key">
      {{ key }}: {{ value }}
    </li>
  </ul>
</template>

<script setup>
  import {ref} from 'vue'

  const user = ref({name: '张三', age: 25, job: '前端开发'})
</script>
```

##### 3. 遍历字符串/数字

```vue

<template>
  <!-- 遍历字符串（每个字符） -->
  <p v-for="char in 'Vue3'" :key="char">{{ char }}</p>
  <!-- 遍历数字（从1到5） -->
  <p v-for="num in 5" :key="num">{{ num }}</p>
</template>
```

#### 2.2 `key`：列表渲染的“身份证”

`key`是`v-for`的**必填属性**（Vue3会强制报警告），它的作用是**给每个列表项一个唯一标识**，帮助Vue的**虚拟DOM diff算法**
识别节点，避免错误的复用。

##### 为什么需要`key`？

Vue的diff算法会**复用相同key的节点**。若没有key或key重复，Vue会错误地复用节点，导致：

- 输入框内容不更新（如todo项的输入框，删除前面的项后，后面的输入框内容会“串位”）；
- 组件状态丢失（如计数器组件，重新排序后计数不会重置）。

##### 正确的`key`选择

- 优先用**数据的唯一ID**（如后端返回的`id`）；
- 避免用**索引（index）**作为key（索引会随数组变化而变化，导致key失效）。

错误示例（用index作为key）：

```vue
<!-- 错误：当数组排序/删除时，index会变化，导致节点复用错误 -->
<li v-for="(todo, index) in todos" :key="index">
  {{ todo.text }}
  <input type="text" placeholder="备注"/>
</li>
```

正确示例（用唯一ID作为key）：

```vue
<!-- 正确：用todo.id作为唯一标识，无论数组如何变化，节点都能正确复用 -->
<li v-for="(todo, index) in todos" :key="todo.id">
  {{ todo.text }}
  <input type="text" placeholder="备注"/>
</li>
```

#### 2.3 `v-for`与`v-if`的“正确结合”

Vue3**不建议在同一元素上同时使用`v-for`和`v-if`**（`v-for`优先级更高，会先遍历所有项再判断条件，导致性能浪费）。

正确的做法是：**用`computed`属性过滤数据**，再用`v-for`遍历过滤后的数组。

示例：显示未完成的待办项

```vue

<template>
  <ul class="uncompleted-todos">
    <!-- 遍历过滤后的未完成列表 -->
    <li v-for="todo in uncompletedTodos" :key="todo.id">
      {{ todo.text }}
    </li>
  </ul>
</template>

<script setup>
  import {ref, computed} from 'vue'

  const todos = ref([
    {id: 1, text: '学习条件渲染', completed: false},
    {id: 2, text: '掌握列表渲染', completed: true},
    {id: 3, text: '写博客', completed: false}
  ])

  // 计算属性：过滤未完成的待办项
  const uncompletedTodos = computed(() => {
    return todos.value.filter(todo => !todo.completed)
  })
</script>
```

### 三、实战：结合条件与列表渲染的Todo应用

我们用**条件渲染**（显示登录状态）+**列表渲染**（显示待办项）+**计算属性**（过滤未完成项），实现一个完整的Todo应用：

```vue
<template>
  <div class="todo-app">
    <!-- 登录状态判断 -->
    <div v-if="!isLoggedIn" class="login-section">
      <input v-model="username" placeholder="用户名" />
      <button @click="login">登录</button>
    </div>

    <!-- 登录后显示Todo列表 -->
    <div v-else class="todo-container">
      <h2>未完成的任务</h2>
      <ul>
        <li v-for="todo in uncompletedTodos" :key="todo.id">
          {{ todo.text }}
          <button @click="markAsCompleted(todo)">完成</button>
        </li>
      </ul>

      <h2>已完成的任务</h2>
      <ul class="completed-list">
        <li v-for="todo in completedTodos" :key="todo.id">
          {{ todo.text }}
          <button @click="markAsUncompleted(todo)">撤销</button>
        </li>
      </ul>

      <div class="add-todo">
        <input v-model="newTodoText" placeholder="输入新任务" />
        <button @click="addTodo">添加</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 登录状态
const isLoggedIn = ref(false)
const username = ref('')

// 待办项列表
const todos = ref([
  { id: 1, text: '学习条件渲染', completed: false },
  { id: 2, text: '掌握列表渲染', completed: false },
  { id: 3, text: '写博客', completed: true }
])
const newTodoText = ref('')

// 计算属性：未完成的待办项
const uncompletedTodos = computed(() => {
  return todos.value.filter(t => !t.completed)
})

// 计算属性：已完成的待办项
const completedTodos = computed(() => {
  return todos.value.filter(t => t.completed)
})

// 登录逻辑
const login = () => {
  if (username.value.trim()) {
    isLoggedIn.value = true
  }
}

// 添加待办项
const addTodo = () => {
  if (newTodoText.value.trim()) {
    todos.value.push({
      id: Date.now(), // 用时间戳作为唯一ID
      text: newTodoText.value.trim(),
      completed: false
    })
    newTodoText.value = ''
  }
}

// 标记为完成
const markAsCompleted = (todo) => {
  todo.completed = true
}

// 撤销完成
const markAsUncompleted = (todo) => {
  todo.completed = false
}
</script>

<style scoped>
.todo-app { max-width: 600px; margin: 20px auto; }
.login-section { margin-bottom: 20px; }
.completed-list { color: #888; text-decoration: line-through; }
.add-todo { margin-top: 20px; }
</style>
```

### 四、课后Quiz：巩固核心知识点

#### 问题1：`v-if`与`v-show`的核心区别是什么？分别适合什么场景？

**答案**：

- `v-if`是**销毁/重建DOM**（真正的条件渲染），适合**不频繁切换**的场景（如登录状态）；
- `v-show`是**修改CSS样式**（display: none），适合**频繁切换**的场景（如tab、折叠面板）。

#### 问题2：为什么`v-for`必须指定`key`？用`index`作为`key`会有什么问题？

**答案**：

- `key`是Vue识别节点的**唯一标识**，用于diff算法，确保节点正确复用；
- 用`index`作为`key`时，若数组发生排序/新增/删除，`index`会变化，导致Vue错误地复用节点（如输入框内容“串位”）。

#### 问题3：如何正确结合`v-for`与`v-if`？

**答案**：

- 不建议在同一元素上同时使用（`v-for`优先级更高，会先遍历再判断，性能差）；
- 正确做法：用`computed`属性过滤数组（如过滤未完成的todo），再用`v-for`遍历过滤后的数组。

### 五、常见报错与解决方案

#### 1. 报错：“v-for requires a key attribute”

- **原因**：`v-for`渲染的元素未指定唯一`key`；
- **解决**：给`v-for`的元素添加`:key="唯一标识"`（如`item.id`）；
- **预防**：养成写`v-for`必加`key`的习惯。

#### 2. 报错：“Duplicate keys detected: x. This may cause an update error.”

- **原因**：`key`重复（如多个元素用了相同的`id`）；
- **解决**：确保`key`的唯一性（如用后端返回的`id`、时间戳）；
- **预防**：避免用`index`或重复值作为`key`。

#### 3. 报错：“v-if and v-for used on the same element”

- **原因**：同一元素同时使用`v-for`和`v-if`（Vue3会报警告）；
- **解决**：用`computed`属性过滤数组，再用`v-for`遍历；
- **预防**：优先用`computed`处理条件，再渲染列表。

参考链接：  
条件渲染：https://vuejs.org/guide/essentials/conditional.html  
列表渲染：https://vuejs.org/guide/essentials/list.html  
key的作用：https://vuejs.org/guide/essentials/list.html#maintaining-state-with-key

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[快速入门Vue3：条件渲染与列表渲染的小秘密，你居然还不知道？  ](https://blog.cmdragon.cn/posts/a325ca6534b78c20bd46c816c3f82aee/)



<details>
<summary>往期文章归档</summary>

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