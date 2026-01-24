---
url: /posts/a0af08dd60a37b9a890a9957f2cbfc9f/
title: Vue3响应式系统中，对象新增属性、数组改索引、原始值代理的问题如何解决？
date: 2025-11-11T07:54:39+08:00
lastmod: 2025-11-11T07:54:39+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/92658990fb79478a986f693dcfa6ec08~tplv-5jbd59dj06-image.png

summary:
  Vue3的响应式系统基于Proxy实现，跟踪对象属性的读取和修改操作，但存在局限性。对于对象，新增或删除属性无法自动触发响应，可通过`set`/`delete`函数、扩展运算符或初始定义所有属性解决。对于数组，直接修改索引或长度早期版本不响应，推荐使用数组变异方法或`set`函数。`reactive`无法代理原始值，需使用`ref`。实践中，购物车功能通过`ref`包裹数组、`computed`计算总价及使用数组变异方法实现响应式更新。

categories:
  - vue

tags:
  - 基础入门
  - 响应式系统
  - Proxy
  - 数组变异方法
  - 购物车功能
  - 常见报错
  - 规避方案

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/92658990fb79478a986f693dcfa6ec08~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 一、响应式系统的工作原理

Vue3的响应式系统基于**Proxy**实现，通过代理对象（或数组）跟踪属性的**读取**（`get`）和**修改**（`set`
）操作。当属性变化时，Vue会自动触发依赖更新，同步视图。

但Proxy并非“全能”——它只能跟踪**初始存在的属性**和**已知的变更操作**，对于一些“非常规”修改（如新增属性、直接修改数组索引），无法自动触发响应，需要我们手动规避。

### 二、对象的局限性：新增/删除属性不响应

#### 1. 问题描述

用`reactive`创建的响应式对象，**新增属性**或**删除属性**时，无法触发视图更新。因为Proxy默认只跟踪对象初始化时的**已有属性**
，新增/删除的属性不在初始跟踪范围内。

示例（错误用法）：

```javascript
import {reactive} from 'vue';

const user = reactive({name: 'Alice'});

// 新增属性：视图不更新
user.age = 20;

// 删除属性：视图不更新
delete user.name;
```

#### 2. 规避方案

针对对象的新增/删除操作，Vue3提供了3种标准解决方案：

##### (1) 使用`set`/`delete`函数

`set`（`Vue.set`的简写）用于向响应式对象**新增属性**，`delete`（`Vue.delete`的简写）用于**删除属性**，两者都会触发响应式更新。

示例（正确用法）：

```javascript
import {reactive, set, delete as vueDelete} from 'vue';

const user = reactive({name: 'Alice'});

// 新增响应式属性
set(user, 'age', 20); // 视图更新为 { name: 'Alice', age: 20 }

// 删除响应式属性
vueDelete(user, 'name'); // 视图更新为 { age: 20 }
```

##### (2) 扩展运算符生成新对象

通过**扩展运算符**（`...`）创建新对象，替换原对象。新对象会继承原对象的响应式能力，触发视图更新。

示例：

```javascript
const userRef = ref({name: 'Alice'}); // 用ref包裹对象

// 新增属性：生成新对象
userRef.value = {...userRef.value, age: 20}; // 响应式更新
```

##### (3) 初始定义所有可能的属性

如果提前知道对象的所有属性，可以在`reactive`初始化时就定义（值为`undefined`），后续修改时会自动触发响应。

示例：

```javascript
const user = reactive({ name: 'Alice', age: undefined }); // 初始定义age

user.age = 20; // 响应式更新（视图显示20）
```

### 三、数组的局限性：直接修改索引/长度不响应

#### 1. 问题描述

用`reactive`或`ref`包裹的数组，**直接修改索引**或**修改长度**时，Vue3早期版本无法触发响应（官网文档仍保留此说明）。尽管最新版本（v3.4+）已支持，但为了兼容性，仍建议用
**变异方法**或`set`函数。

示例（不推荐用法）：

```javascript
const list = ref([1, 2, 3]);

// 直接修改索引：早期版本不响应
list.value[0] = 4;

// 修改长度：早期版本不响应
list.value.length = 2;
```

#### 2. 规避方案

Vue3推荐用**数组变异方法**或`set`函数修改数组，确保响应式：

##### (1) 使用数组变异方法

Vue3自动跟踪数组的**变异方法**（修改原数组的方法），这些方法会触发响应式更新。常用变异方法：

- `push()`：末尾添加元素
- `pop()`：末尾删除元素
- `splice()`：插入/删除/替换元素
- `sort()`：排序
- `reverse()`：反转

示例：

```javascript
const list = ref([1, 2, 3]);

// 修改索引0的值：用splice
list.value.splice(0, 1, 4); // 替换第0个元素为4（响应式）

// 修改长度：用splice
list.value.splice(2); // 删除索引2及之后的元素（长度变为2，响应式）
```

##### (2) 使用`set`函数

`set`函数可直接修改数组的指定索引，触发响应式更新。

示例：

```javascript
import { ref, set } from 'vue';

const list = ref([1, 2, 3]);

// 修改索引0的值：响应式
set(list.value, 0, 4);
```

### 四、原始值的局限性：`reactive`无法代理

#### 1. 问题描述

`reactive`只能代理**对象或数组**，无法代理**原始值**（如`number`、`string`、`boolean`）。直接用`reactive`包裹原始值会报错。

示例（错误用法）：

```javascript
import { reactive } from 'vue';

// 报错：value cannot be made reactive: 0
const count = reactive(0);
```

#### 2. 规避方案：使用`ref`

`ref`是Vue3专门用于代理**原始值**的API，它会将原始值包裹在一个带`value`属性的响应式对象中。访问或修改时需通过`.value`
（模板中无需`.value`，Vue会自动解包）。

示例（正确用法）：

```javascript
import {ref} from 'vue';

// 用ref代理原始值
const count = ref(0);

// 修改值：响应式
count.value++; // 变为1

// 模板中使用：自动解包
// <div>{{ count }}</div> // 显示1
```

### 五、实践案例：购物车功能的响应式处理

我们用上述知识实现一个**购物车功能**，包含商品的添加、删除和数量修改：

#### 1. 需求分析

- 商品列表：响应式数组，支持添加、删除。
- 数量修改：点击“+”/“-”按钮，更新商品数量并同步总价。
- 总价计算：根据商品数量和单价，实时更新。

#### 2. 完整代码

```vue
<template>
  <div class="cart">
    <h2>购物车</h2>
    <!-- 商品列表 -->
    <div v-for="(item, index) in cart" :key="item.id" class="cart-item">
      <span>{{ item.name }}</span>
      <button @click="decrement(index)">-</button>
      <span>{{ item.quantity }}</span>
      <button @click="increment(index)">+</button>
      <button @click="removeItem(index)">删除</button>
    </div>
    <!-- 总价 -->
    <p class="total">总价：{{ totalPrice }} 元</p>
    <!-- 添加商品按钮 -->
    <button @click="addItem" class="add-btn">添加商品</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// 1. 用ref包裹购物车数组（支持响应式）
const cart = ref([
  { id: 1, name: '商品A', quantity: 1, price: 100 },
  { id: 2, name: '商品B', quantity: 2, price: 200 }
]);

// 2. 计算总价（响应式：依赖cart的变化）
const totalPrice = computed(() => {
  return cart.value.reduce((sum, item) => sum + item.quantity * item.price, 0);
});

// 3. 增加数量：用splice修改数组（遵循官网推荐）
function increment(index) {
  const item = cart.value[index];
  // 生成新商品对象（避免直接修改原对象）
  const newItem = { ...item, quantity: item.quantity + 1 };
  // 用splice替换原商品（触发响应式）
  cart.value.splice(index, 1, newItem);
}

// 4. 减少数量：用splice修改数组
function decrement(index) {
  const item = cart.value[index];
  if (item.quantity > 1) {
    const newItem = { ...item, quantity: item.quantity - 1 };
    cart.value.splice(index, 1, newItem);
  }
}

// 5. 删除商品：用splice修改数组
function removeItem(index) {
  cart.value.splice(index, 1);
}

// 6. 添加商品：用push修改数组
function addItem() {
  const newItem = {
    id: Date.now(), // 用时间戳作为唯一ID
    name: `商品${cart.value.length + 1}`,
    quantity: 1,
    price: Math.floor(Math.random() * 100) + 50 // 随机单价（50-149元）
  };
  cart.value.push(newItem); // push是变异方法，触发响应式
}
</script>

<style scoped>
.cart { max-width: 400px; margin: 20px auto; padding: 20px; border: 1px solid #eee; }
.cart-item { display: flex; align-items: center; margin: 10px 0; }
.cart-item span { margin: 0 10px; }
.total { font-weight: bold; margin: 20px 0; }
.add-btn { padding: 8px 16px; background: #42b983; color: #fff; border: none; border-radius: 4px; }
</style>
```

#### 3. 代码说明

- **`ref`包裹数组**：`cart`是`ref`对象，`cart.value`是响应式数组，修改时需通过`.value`。
- **变异方法的使用**：`splice`（修改数量、删除商品）、`push`（添加商品）都是数组变异方法，确保响应式。
- **计算属性`computed`**：`totalPrice`依赖`cart`的变化，自动更新总价，无需手动触发。

### 课后Quiz：测试你的理解

#### 问题1

用`reactive`创建的对象`const user = reactive({ name: 'Alice' })`，如何新增响应式属性`age`？（至少2种方法）

#### 问题2

用`ref`包裹的数组`const list = ref([1,2,3])`，如何修改索引0的值为4？（至少2种方法）

#### 答案解析

**问题1答案**：

1. 使用`set`函数：`set(user, 'age', 20)`。
2. 扩展运算符生成新对象：`const userRef = ref(user); userRef.value = { ...userRef.value, age: 20 }`（`reactive`对象不能直接赋值，需用
   `ref`包裹）。

**问题2答案**：

1. 用`splice`：`list.value.splice(0, 1, 4)`。
2. 用`set`函数：`set(list.value, 0, 4)`。
3. 直接修改（最新版本支持）：`list.value[0] = 4`。

### 常见报错解决方案

#### 报错1：`value cannot be made reactive: 0`

- **原因**：`reactive`无法代理原始值（如`number`）。
- **解决**：用`ref`代替`reactive`：`const count = ref(0)`。

#### 报错2：`Cannot add property age, object is not extensible`

- **原因**：`reactive`对象被冻结（`Object.freeze`），无法新增属性。
- **解决**：不要冻结响应式对象，或用`ref`包裹后修改`.value`。

#### 报错3：`TypeError: Cannot read properties of undefined (reading 'value')`

- **原因**：`ref`对象未初始化，或模板中错误使用`.value`。
- **解决**：确保`ref`初始值非`undefined`，模板中直接用变量名（如`{{ count }}`而非`{{ count.value }}`）。

### 预防报错的建议

1. **原始值用`ref`**：`reactive`只代理对象/数组，原始值优先用`ref`。
2. **数组用变异方法**：修改数组时，优先用`push`、`splice`等变异方法，避免直接修改索引。
3. **对象新增属性用`set`**：新增对象属性时，用`set`函数而非直接赋值。

### 参考链接

- Vue3官网“响应式系统的局限性”：https://vuejs.org/guide/essentials/reactivity-fundamentals.html#limitations-of-reactive
- Vue3官网“Ref API”：https://vuejs.org/api/reactivity-core.html#ref
-
Vue3官网“数组变异方法”：https://vuejs.org/guide/essentials/reactivity-fundamentals.html#caveat-in-arrays-and-collections

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[Vue3响应式系统中，对象新增属性、数组改索引、原始值代理的问题如何解决？](https://blog.cmdragon.cn/posts/a0af08dd60a37b9a890a9957f2cbfc9f/)




<details>
<summary>往期文章归档</summary>

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
- [FastAPI如何用契约测试确保API的「菜单」与「菜品」一致？](https://blog.cmdragon.cn/posts/02b0c96842d1481c72dab63a149ce0dd/)
- [为什么TDD能让你的FastAPI开发飞起来？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c9c1e3bb0fdc15303b9b3b1f20124b0b/)
- [如何用FastAPI玩转多模块测试与异步任务，让代码不再“闹脾气”？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/ddbfa0447a5d0d6f9af12e7a6b206f70/)
- [如何在FastAPI中玩转“时光倒流”的数据库事务回滚测试？](https://blog.cmdragon.cn/posts/bf9883a75ffa46b523a03b16ec56ce48/)
- [如何在FastAPI中优雅地模拟多模块集成测试？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/be553dbd5d51835d2c69553f4a773e2d/)

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