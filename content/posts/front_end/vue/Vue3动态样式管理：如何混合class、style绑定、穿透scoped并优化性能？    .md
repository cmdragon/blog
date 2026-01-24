---
url: /posts/8427b068d32c6fc6a84da7eb8d579df6/
title: Vue3动态样式管理：如何混合class/style绑定、穿透scoped并优化性能？
date: 2025-12-18T10:51:13+08:00
lastmod: 2025-12-18T10:51:13+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/generated_image_f79e7b10-8dd2-45c2-b2d9-33185e7b4761.png

summary:
  Vue 3中class与style绑定支持混合使用，可结合静态、动态类名及动态内联样式。组件通过props传递样式参数，用emit同步状态。Scoped样式需用::v-deep穿透修改子组件动态类名，频繁切换样式对象时用computed缓存优化性能。

categories:
  - vue

tags:
  - 基础入门
  - class绑定
  - style绑定
  - 动态样式
  - scoped样式
  - props/emit
  - 性能优化

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/generated_image_f79e7b10-8dd2-45c2-b2d9-33185e7b4761.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 一、class与style绑定的混合使用规则

在Vue 3中，`class`和`style`绑定是我们控制元素样式的核心手段。它们不仅能单独使用，还能**混合搭配**
满足复杂场景需求。我们先回顾基础语法，再看混合使用的规则。

#### 1.1 基础语法快速回顾

- **class绑定**：支持**对象语法**（根据条件切换类名）和**数组语法**（组合多个类名）。
  ```vue
  <!-- 对象语法：isActive为true时添加active类 -->
  <div :class="{ active: isActive }"></div>
  <!-- 数组语法：组合静态和动态类名 -->
  <div :class="['static-class', { active: isActive }]"></div>
  ```  
- **style绑定**：同样支持对象/数组语法，常用于动态设置内联样式。
  ```vue
  <!-- 对象语法：动态设置颜色和字体大小 -->
  <div :style="{ color: textColor, fontSize: '16px' }"></div>
  <!-- 数组语法：组合多个样式对象 -->
  <div :style="[baseStyle, dynamicStyle]"></div>
  ```  

#### 1.2 混合使用的常见场景

实际开发中，我们常需要**静态类名+动态类名+动态内联样式**的组合。比如一个“可切换状态的按钮”：

```vue
<template>
  <button 
    class="btn"  <!-- 静态类名 -->
    :class="{ 'btn--active': isActive }"  <!-- 动态类名 -->
    :style="{ backgroundColor: btnColor }"  <!-- 动态内联样式 -->
    @click="isActive = !isActive"
  >
    {{ isActive ? "激活状态" : "默认状态" }}
  </button>
</template>

<script setup>
import { ref } from 'vue'
const isActive = ref(false)
const btnColor = ref('#409EFF')  // 初始蓝色
</script>

<style scoped>
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
}
.btn--active {
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.5);  /* 激活时的阴影 */
}
</style>
```  

这个例子中：

- `class="btn"`是**静态类名**，负责按钮的基础样式；
- `:class="{ 'btn--active': isActive }"`是**动态类名**，根据`isActive`切换激活状态；
- `:style="{ backgroundColor: btnColor }"`是**动态内联样式**，可以灵活修改按钮背景色（比如从接口获取主题色）。

### 二、动态样式与组件props/emit的结合

组件化开发中，我们常需要**父组件传递样式参数给子组件**，或**子组件触发事件修改父组件的样式状态**。这部分的核心是`props`
（父传子）和`emit`（子传父）的配合。

#### 2.1 用props传递动态样式

比如我们写一个**可定制的Alert组件**，父组件可以传递`type`（成功/错误）来控制样式：

```vue
<!-- 父组件 Parent.vue -->
<template>
  <Alert 
    type="success" 
    message="操作成功！" 
    :show="isShow" 
    @close="isShow = false"
  />
  <button @click="isShow = true">显示成功提示</button>
</template>

<script setup>
import { ref } from 'vue'
import Alert from './Alert.vue'
const isShow = ref(true)
</script>
```  

```vue
<!-- 子组件 Alert.vue -->
<template>
  <div 
    class="alert"
    :class="`alert--${type}`"  <!-- 动态类名：根据type切换样式 -->
    v-if="show"
  >
    {{ message }}
    <button class="alert__close" @click="$emit('close')">×</button>
  </div>
</template>

<script setup>
// 接收父组件传递的props
defineProps({
  type: {
    type: String,
    default: 'info'  // 默认info类型
  },
  message: String,
  show: Boolean
})
// 声明要触发的事件（告诉父组件“我要关闭了”）
defineEmits(['close'])
</script>

<style scoped>
.alert {
  padding: 12px;
  border-radius: 4px;
  margin: 16px 0;
  position: relative;
}
/* 不同type对应的样式 */
.alert--success { background-color: #d4edda; color: #155724; }
.alert--error { background-color: #f8d7da; color: #721c24; }
.alert--info { background-color: #e3f2fd; color: #004085; }
.alert__close {
  position: absolute;
  top: 8px;
  right: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
}
</style>
```  

**关键逻辑**：

1. 父组件通过`type="success"`将“成功”类型传递给子组件；
2. 子组件用`:class="`alert--${type}`"`生成动态类名`alert--success`；
3. 子组件通过`$emit('close')`触发关闭事件，父组件接收后修改`isShow`隐藏Alert。

#### 2.2 用emit同步样式状态

比如一个**可折叠的面板组件**，点击标题切换展开/折叠状态，同时修改箭头的旋转样式：

```vue
<!-- Collapse.vue -->
<template>
  <div class="collapse">
    <div class="collapse__header" @click="toggle">
      {{ title }}
      <span class="collapse__arrow" :class="{ 'rotate': isOpen }">↓</span>
    </div>
    <div class="collapse__content" v-if="isOpen">
      {{ content }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps(['title', 'content'])
const isOpen = ref(false)
const emit = defineEmits(['toggle'])  // 声明触发的事件

const toggle = () => {
  isOpen.value = !isOpen.value
  emit('toggle', isOpen.value)  // 传递当前状态给父组件
}
</script>

<style scoped>
.collapse__header {
  padding: 12px;
  background-color: #f5f5f5;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.collapse__arrow {
  transition: transform 0.3s ease;  // 过渡动画
}
.rotate {
  transform: rotate(180deg);  // 展开时旋转箭头
}
.collapse__content {
  padding: 12px;
  border: 1px solid #f5f5f5;
  border-top: none;
}
</style>
```  

父组件使用时，可以监听`toggle`事件获取展开状态，甚至修改其他组件的样式：

```vue
<!-- 父组件 -->
<template>
  <Collapse
      title="面板1"
      content="面板内容..."
      @toggle="handleToggle"
  />
  <div :style="{ margin: isOpen ? '20px 0' : '0' }">
    面板下方的内容
  </div>
</template>

<script setup>
  import {ref} from 'vue'
  import Collapse from './Collapse.vue'

  const isOpen = ref(false)
  const handleToggle = (status) => {
    isOpen.value = status  // 同步展开状态
  }
</script>
```  

### 三、作用域样式（scoped）对动态类名的影响

在Vue单文件组件（SFC）中，`style scoped`会给组件的所有元素添加一个**唯一的属性**（比如`data-v-123`
），确保样式只作用于当前组件，避免样式污染。但动态类名会不会受影响？

#### 3.1 scoped的工作原理

比如子组件的`style scoped`：

```css
/* 子组件的scoped样式 */
.child {
    color: red;
}
```  

编译后会变成：

```css
.child[data-v-123] {
  color: red;
}
```  

而子组件的元素会被添加`data-v-123`属性：

```html
<div class="child" data-v-123>子组件内容</div>
```  

#### 3.2 动态类名与scoped的兼容问题

动态类名（比如`:class="{ active: isActive }"`）是在组件内部生成的，所以scoped会自动给动态类名添加属性选择器。例如：

```vue
<!-- 子组件 -->
<template>
  <div :class="{ 'active': isActive }" class="child">...</div>
</template>

<style scoped>
  .child { /* 编译后带data-v-123 */
  }

  .active { /* 编译后变成.active[data-v-123] */
  }
</style>
```  

这种情况下，动态类名`active`会正常生效，因为它和`child`类一样，都带有`data-v-123`属性。

#### 3.3 父组件如何修改子组件的动态类名？

如果父组件想修改子组件的动态类名（比如`active`），直接写样式是无效的，因为父组件的样式没有子组件的`data-v-123`属性。这时候需要用
**深度选择器**`::v-deep`（或`/deep/`、`>>>`，但Vue3推荐`::v-deep`）。

比如父组件想修改子组件的`active`类：

```vue
<!-- 父组件的样式 -->
<style scoped>
/* 无效：父组件的样式没有子组件的data-v-123 */
.child .active {
  background-color: yellow;
}

/* 有效：用::v-deep穿透scoped */
::v-deep .child .active {
  background-color: yellow;
}
</style>
```  

**注意**：深度选择器会穿透当前组件的scoped，影响所有子组件的对应类名，所以要谨慎使用（比如给子组件加独特的class前缀）。

### 四、性能优化：避免频繁切换样式对象

Vue中，`:style`绑定的对象如果**频繁变化**（比如每秒切换一次颜色），会导致Vue频繁重新计算样式，影响性能。我们需要**缓存样式对象
**，减少不必要的渲染。

#### 4.1 问题根源：对象引用变化

比如下面的写法，每次渲染都会创建一个**新的样式对象**：

```vue
<!-- 不好的写法：每次渲染都生成新对象 -->
<template>
  <div :style="{ 
    color: isActive ? 'red' : 'blue', 
    fontSize: `${fontSize}px` 
  }">
    动态样式
  </div>
</template>
```  

Vue会认为“样式对象变了”，即使里面的属性值没变化，也会重新应用样式。

#### 4.2 优化方案：用计算属性缓存

计算属性（`computed`）会缓存结果，只有当依赖的响应式变量变化时，才会重新计算。比如：

```vue
<!-- 好的写法：用computed缓存样式对象 -->
<template>
  <div :style="dynamicStyle">动态样式</div>
</template>

<script setup>
import { ref, computed } from 'vue'
const isActive = ref(false)
const fontSize = ref(16)

// 计算属性缓存样式对象
const dynamicStyle = computed(() => ({
  color: isActive.value ? 'red' : 'blue',
  fontSize: `${fontSize.value}px`
}))
</script>
```  

这样，只有`isActive`或`fontSize`变化时，`dynamicStyle`才会更新，避免了频繁创建新对象。

#### 4.3 最佳实践：静态与动态分离

如果样式对象中有**静态属性**（不会变化的），可以把它们放到`computed`之外，进一步优化：

```vue
<script setup>
const baseStyle = {
  padding: '16px',
  border: '1px solid #ccc'  // 静态样式
}
const dynamicStyle = computed(() => ({
  ...baseStyle,  // 合并静态样式
  color: isActive.value ? 'red' : 'blue'  // 动态样式
}))
</script>
```  

### 课后Quiz：巩固你的知识

#### 问题1：如何在Vue3中混合使用class和style绑定？

**答案**：可以同时使用`class`（静态/动态）和`:style`（动态）绑定。例如：

```vue
<div class="static-class" :class="{ active: isActive }" :style="{ color: textColor }">...</div>
```  

#### 问题2：scoped样式下，父组件如何修改子组件的动态类名？

**答案**：使用深度选择器`::v-deep`。例如父组件想修改子组件的`active`类：

```css
::v-deep .child-component .active {
  background-color: yellow;
}
```  

#### 问题3：如何优化频繁切换样式对象的性能？

**答案**：用`computed`计算属性缓存样式对象，避免每次渲染都创建新对象。例如：

```vue
const dynamicStyle = computed(() => ({
  color: isActive.value ? 'red' : 'blue'
}))
```  

### 常见报错解决方案

#### 1. 动态类名不生效

**原因**：

- 类名拼写错误（比如`btn--active`写成`btn-active`）；
- scoped样式导致父组件的类名无法作用于子组件；
- 动态条件错误（比如`isActive`始终为`false`）。

**解决**：

- 检查类名拼写；
- 用`console.log(isActive)`验证动态条件；
- 父组件修改子组件样式时，用`::v-deep`。

#### 2. 样式对象频繁切换导致卡顿

**原因**：

- 在`template`中直接写`:style="{ ... }"`，每次渲染都创建新对象。

**解决**：

- 用`computed`缓存样式对象；
- 把静态样式放到`computed`之外，减少计算量。

#### 3. 父组件无法修改子组件的scoped样式

**原因**：

- scoped样式给子组件元素添加了唯一属性，父组件的样式没有该属性，无法匹配。

**解决**：

- 使用深度选择器`::v-deep`；
- 子组件暴露`props`接收父组件的样式（比如`:custom-style="parentStyle"`）；
- 子组件使用非scoped样式（不推荐，容易污染全局）。

### 参考链接

- Vue class与style绑定：https://vuejs.org/guide/essentials/class-and-style.html
- Vue scoped样式：https://vuejs.org/api/sfc-css-features.html#scoped-css
- Vue 计算属性：https://vuejs.org/guide/essentials/computed.html

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[Vue3动态样式管理：如何混合class/style绑定、穿透scoped并优化性能？](https://blog.cmdragon.cn/posts/8427b068d32c6fc6a84da7eb8d579df6/)



<details>
<summary>往期文章归档</summary>

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
- [如何用Git Hook和CI流水线为FastAPI项目保驾护航？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/fc4ef84559e04693a620d0714cb30787/)

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