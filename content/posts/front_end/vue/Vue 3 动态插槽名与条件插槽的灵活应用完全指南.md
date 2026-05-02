---
url: /posts/c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9/
title: Vue 3 动态插槽名与条件插槽的灵活应用完全指南
date: 2026-05-02T11:30:00+08:00
lastmod: 2026-05-02T11:30:00+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/

summary: 本文深入讲解Vue 3动态插槽名与条件插槽的使用技巧，通过丰富的实战案例展示如何根据运行时状态动态指定插槽名称，以及如何使用$slots属性和v-if实现条件渲染，帮助开发者构建更加灵活的组件。

categories:
  - vue

tags:
  - 基础入门
  - 动态插槽
  - 条件插槽
  - $slots属性
  - 组件设计
  - 高级技巧
  - 灵活布局
  - 运行时渲染
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 一、动态插槽名：运行时决定内容去向

### 1.1 什么是动态插槽名？

在之前的章节中，我们学习了如何使用固定的插槽名来指定内容渲染的位置。但Vue还提供了更强大的功能：动态插槽名。这意味着我们可以在运行时根据组件的状态或props的值，动态决定内容应该渲染到哪个插槽。

动态插槽名使用动态指令参数的语法：`v-slot:[dynamicSlotName]` 或其简写形式 `#[dynamicSlotName]`。

### 1.2 动态插槽名的基础使用

```vue
<!-- DynamicTabs.vue -->
<template>
  <div class="tab-container">
    <!-- 标签页导航 -->
    <nav class="tab-nav">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        :class="['tab-btn', { active: activeTab === tab.name }]"
        @click="activeTab = tab.name"
      >
        {{ tab.label }}
      </button>
    </nav>

    <!-- 动态渲染选中的插槽内容 -->
    <div class="tab-content">
      <slot :name="activeTab"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps } from "vue";

const props = defineProps({
  tabs: {
    type: Array,
    required: true,
    // 期望格式：[{ name: 'tab1', label: '标签1' }, ...]
  },
});

const activeTab = ref(props.tabs[0]?.name || "");
</script>

<style scoped>
.tab-container {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.tab-nav {
  display: flex;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background: none;
  cursor: pointer;
  color: #666;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.tab-btn:hover {
  background-color: #e8e8e8;
  color: #333;
}

.tab-btn.active {
  background-color: #fff;
  color: #42b983;
  border-bottom: 2px solid #42b983;
}

.tab-content {
  padding: 24px;
  background-color: #fff;
  min-height: 200px;
}
</style>
```

使用方式：

```vue
<!-- ParentComponent.vue -->
<template>
  <DynamicTabs :tabs="tabList">
    <!-- 动态指定内容渲染到对应插槽 -->
    <template #profile>
      <h3>个人资料</h3>
      <p>这是用户个人资料页面...</p>
    </template>

    <template #settings>
      <h3>账户设置</h3>
      <p>这是账户设置页面...</p>
    </template>

    <template #notifications>
      <h3>通知中心</h3>
      <p>这是通知中心页面...</p>
    </template>
  </DynamicTabs>
</template>

<script setup>
import { ref } from "vue";
import DynamicTabs from "./DynamicTabs.vue";

const tabList = ref([
  { name: "profile", label: "个人资料" },
  { name: "settings", label: "账户设置" },
  { name: "notifications", label: "通知中心" },
]);
</script>
```

### 1.3 使用变量动态指定插槽

```vue
<!-- DynamicContent.vue -->
<template>
  <div>
    <!-- 使用计算属性动态决定插槽名 -->
    <slot :name="currentSlotName"></slot>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const contentType = ref("text");

// 根据contentType动态计算插槽名
const currentSlotName = computed(() => {
  return `content-${contentType.value}`;
});

// 暴露方法供父组件调用
defineExpose({
  changeContentType: (type) => {
    contentType.value = type;
  },
});
</script>
```

使用方式：

```vue
<template>
  <DynamicContent ref="dynamicContentRef">
    <template #content-text>
      <p>这是文本内容...</p>
    </template>

    <template #content-image>
      <img src="https://via.placeholder.com/400" alt="示例图片" />
    </template>

    <template #content-video>
      <video controls>
        <source src="video.mp4" type="video/mp4" />
      </video>
    </template>
  </DynamicContent>

  <div class="controls">
    <button @click="dynamicContentRef?.changeContentType('text')">文本</button>
    <button @click="dynamicContentRef?.changeContentType('image')">图片</button>
    <button @click="dynamicContentRef?.changeContentType('video')">视频</button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import DynamicContent from "./DynamicContent.vue";

const dynamicContentRef = ref(null);
</script>
```

### 1.4 父组件中使用动态插槽名

```vue
<!-- ParentWithDynamicSlots.vue -->
<template>
  <BaseLayout>
    <!-- 使用变量动态指定插槽名 -->
    <template #[currentSlot]>
      <p>动态插槽内容</p>
    </template>

    <!-- 使用表达式动态指定插槽名 -->
    <template #[`section-${sectionIndex}`]>
      <p>第 {{ sectionIndex }} 节内容</p>
    </template>
  </BaseLayout>
</template>

<script setup>
import { ref } from "vue";
import BaseLayout from "./BaseLayout.vue";

const currentSlot = ref("header");
const sectionIndex = ref(1);
</script>
```

## 二、条件插槽：根据插槽是否存在渲染内容

### 2.1 为什么需要条件插槽？

有时我们需要根据插槽是否存在来渲染某些内容。例如，当父组件提供了header插槽内容时，我们才渲染header容器；如果没有提供，就不渲染header容器，避免多余的DOM节点和样式。

Vue提供了`$slots`属性，我们可以在模板中使用它来检查插槽是否存在。

### 2.2 使用 $slots 属性检查插槽

```vue
<!-- ConditionalCard.vue -->
<template>
  <div class="card">
    <!-- 只有当header插槽存在时才渲染 -->
    <header v-if="$slots.header" class="card-header">
      <slot name="header" />
    </header>

    <!-- 只有当默认插槽存在时才渲染 -->
    <div v-if="$slots.default" class="card-content">
      <slot />
    </div>

    <!-- 只有当footer插槽存在时才渲染 -->
    <footer v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<style scoped>
.card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
}

.card-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #f9f9f9;
}

.card-content {
  padding: 24px;
}

.card-footer {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  background-color: #f9f9f9;
}
</style>
```

### 2.3 $slots 属性的工作原理

```
子组件模板渲染
    ↓
Vue 收集父组件传递的所有插槽
    ↓
$slots 对象包含所有已定义的插槽
    ↓
{
  header: ƒ(),     // header 插槽存在
  default: ƒ(),    // 默认插槽存在
  footer: undefined // footer 插槽不存在
}
    ↓
使用 v-if="$slots.header" 检查
    ↓
如果存在，渲染 header 容器
如果不存在，跳过 header 容器
```

### 2.4 条件插槽的实际应用

```vue
<!-- SmartModal.vue -->
<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <!-- 条件渲染：header -->
        <header v-if="$slots.header" class="modal-header">
          <slot name="header" />
          <button class="modal-close" @click="$emit('close')">×</button>
        </header>

        <!-- 始终渲染：body -->
        <main class="modal-body">
          <slot />
        </main>

        <!-- 条件渲染：footer -->
        <footer v-if="$slots.footer" class="modal-footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["close"]);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e0e0e0;
}
</style>
```

使用方式：

```vue
<template>
  <div>
    <button @click="showModal = true">打开模态框</button>

    <!-- 只提供默认插槽，header 和 footer 不会渲染 -->
    <SmartModal :visible="showModal" @close="showModal = false">
      <p>这是一个简单的提示框</p>
    </SmartModal>

    <!-- 提供所有插槽，header 和 footer 会渲染 -->
    <SmartModal :visible="showFullModal" @close="showFullModal = false">
      <template #header>
        <h2>确认删除</h2>
      </template>

      <p>此操作将永久删除该条目，是否继续？</p>

      <template #footer>
        <button class="btn" @click="showFullModal = false">取消</button>
        <button class="btn btn-danger" @click="handleDelete">确认删除</button>
      </template>
    </SmartModal>
  </div>
</template>

<script setup>
import { ref } from "vue";
import SmartModal from "./SmartModal.vue";

const showModal = ref(false);
const showFullModal = ref(false);

const handleDelete = () => {
  console.log("删除操作");
  showFullModal.value = false;
};
</script>
```

## 三、动态插槽名与条件插槽的结合使用

### 3.1 综合案例：动态表单组件

```vue
<!-- DynamicForm.vue -->
<template>
  <form class="dynamic-form" @submit.prevent="$emit('submit')">
    <!-- 动态渲染表单字段 -->
    <div v-for="field in fields" :key="field.name" class="form-field">
      <label :for="field.name" class="field-label">
        {{ field.label }}
      </label>

      <!-- 使用动态插槽名渲染自定义字段 -->
      <slot :name="field.type" :field="field" :value="formData[field.name]">
        <!-- 默认渲染 -->
        <input
          :id="field.name"
          :type="field.type"
          v-model="formData[field.name]"
          class="field-input"
        />
      </slot>
    </div>

    <!-- 条件渲染：操作按钮区域 -->
    <footer v-if="$slots.actions" class="form-actions">
      <slot name="actions" />
    </footer>
  </form>
</template>

<script setup>
import { ref, reactive } from "vue";

const props = defineProps({
  fields: {
    type: Array,
    required: true,
    // 期望格式：[{ name: 'username', label: '用户名', type: 'text' }, ...]
  },
});

const emits = defineEmits(["submit"]);

// 初始化表单数据
const formData = reactive(
  props.fields.reduce((acc, field) => {
    acc[field.name] = "";
    return acc;
  }, {}),
);

// 暴露表单数据供父组件使用
defineExpose({ formData });
</script>

<style scoped>
.dynamic-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-weight: 500;
  color: #333;
}

.field-input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
```

使用方式：

```vue
<template>
  <DynamicForm :fields="formFields" @submit="handleSubmit">
    <!-- 自定义 email 字段的渲染 -->
    <template #email="{ field, value }">
      <input
        :id="field.name"
        type="email"
        :value="value"
        @input="
          $emit('update:modelValue', {
            ...modelValue,
            [field.name]: $event.target.value,
          })
        "
        class="field-input email-input"
        placeholder="请输入邮箱地址"
      />
    </template>

    <!-- 自定义 textarea 字段的渲染 -->
    <template #textarea="{ field, value }">
      <textarea
        :id="field.name"
        :value="value"
        @input="
          $emit('update:modelValue', {
            ...modelValue,
            [field.name]: $event.target.value,
          })
        "
        class="field-input textarea-input"
        rows="4"
      ></textarea>
    </template>

    <!-- 自定义操作按钮 -->
    <template #actions>
      <button type="button" class="btn btn-secondary">重置</button>
      <button type="submit" class="btn btn-primary">提交</button>
    </template>
  </DynamicForm>
</template>

<script setup>
import { ref } from "vue";
import DynamicForm from "./DynamicForm.vue";

const formFields = ref([
  { name: "username", label: "用户名", type: "text" },
  { name: "email", label: "邮箱", type: "email" },
  { name: "bio", label: "个人简介", type: "textarea" },
  { name: "age", label: "年龄", type: "number" },
]);

const handleSubmit = () => {
  console.log("表单提交");
};
</script>
```

## 四、课后Quiz

### 题目1：以下哪种语法可以动态指定插槽名？

A. `<template v-slot="slotName">`
B. `<template v-slot:[slotName]>`
C. `<template #[slotName]>`
D. `<template :name="slotName">`

**答案解析：B、C**

`v-slot:[slotName]` 是完整语法，`#[slotName]` 是简写形式，两者都可以动态指定插槽名。选项A是作用域插槽的语法，不是动态插槽名。选项D不是有效的Vue语法。

### 题目2：如何在子组件中检查某个插槽是否存在？

A. `this.slots.header`
B. `this.$slots.header`
C. `$slots.header`
D. `slots.header`

**答案解析：C**

在`<script setup>`中，我们可以直接使用`$slots`对象来检查插槽是否存在。`$slots`是Vue提供的模板中可用的属性。

### 题目3：条件插槽的主要应用场景是什么？

A. 动态改变插槽名
B. 根据插槽是否存在来决定渲染哪些容器或样式
C. 传递数据给插槽
D. 设置插槽的默认内容

**答案解析：B**

条件插槽的核心用途是根据父组件是否提供了某个插槽，来决定子组件是否渲染对应的容器或应用特定的样式。这可以避免多余的DOM节点和不必要的样式。

## 五、常见报错解决方案

### 1. 报错：动态插槽名表达式无效

**原因**：动态插槽名的表达式受到与动态指令参数相同的语法限制。

**错误示例**：

```vue
<template>
  <BaseLayout>
    <!-- 错误：表达式包含空格 -->
    <template #[slotName + ' ']">内容</template>

    <!-- 错误：表达式返回undefined -->
    <template #[undefinedSlot]">内容</template>
  </BaseLayout>
</template>
```

**解决办法**：

```vue
<template>
  <BaseLayout>
    <!-- 正确：使用有效的表达式 -->
    <template #[`${slotName}-section`]">内容</template>

    <!-- 正确：确保表达式返回有效的字符串 -->
    <template #[currentSlot || 'default']">内容</template>
  </BaseLayout>
</template>
```

### 2. 报错：条件插槽判断错误

**原因**：`$slots`属性返回的是渲染函数，不是布尔值，直接判断可能不符合预期。

**解决办法**：

```vue
<!-- 正确：使用 v-if 检查插槽是否存在 -->
<header v-if="$slots.header">
  <slot name="header" />
</header>

<!-- 也可以使用计算属性进行更复杂的判断 -->
<script setup>
import { computed } from "vue";

const hasHeader = computed(() => !!$slots.header);
const hasFooter = computed(() => !!$slots.footer);
</script>
```

### 3. 预防建议

- 动态插槽名表达式应该返回有效的字符串
- 使用`$slots`检查插槽时，使用`!!`转换为布尔值
- 对于复杂的插槽判断逻辑，考虑使用计算属性
- 为动态插槽提供合理的默认值，避免undefined情况

## 参考链接：https://cn.vuejs.org/guide/components/slots.html#dynamic-slot-names

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：[Vue 3 动态插槽名与条件插槽的灵活应用完全指南](https://blog.cmdragon.cn/posts/c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8/)

<details>
<summary>往期文章归档</summary>

- [Vue 3 具名插槽的精准内容定位与多区域布局实战完全解析](https://blog.cmdragon.cn/posts/b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7/)
- [Vue 3 默认插槽的深入应用与默认内容设计策略完全解析](https://blog.cmdragon.cn/posts/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6/)
- [Vue 3 插槽内容分发机制的基础概念与工作原理完全解析](https://blog.cmdragon.cn/posts/f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6/)
- [Vue 3 静态与动态 Props 如何传递？TypeScript 类型约束有何必要？](https://blog.cmdragon.cn/posts/94ab48753b64780ca3ab7a7115ae8522/)
- [Vue3中组件局部注册的优势与实现方式如何？](https://blog.cmdragon.cn/posts/dbf576e744870f6de26fd8a2e03e47da/)
- [如何在Vue3中优化生命周期钩子性能并规避常见陷阱？](https://blog.cmdragon.cn/posts/12d98b3b9ccd6c19a1b169d720ac5c80/)
- [Vue 3 Composition API生命周期钩子：如何实现从基础理解到高阶复用？](https://blog.cmdragon.cn/posts/8884e2b70287fcb263c57648eeb27419/)
- [Vue 3生命周期钩子实战指南：如何正确选择onMounted、onUpdated与onUnmounted的应用场景？](https://blog.cmdragon.cn/posts/883c6dbc50ae4183770a4462e0b8ae4d/)
- [Vue 3中生命周期钩子与响应式系统如何实现协同工作？](https://blog.cmdragon.cn/posts/70dad360ffa9dce14d0d69611b8cb019/)
- [Vue 3组件生命周期钩子的执行顺序与使用场景是什么？](https://blog.cmdragon.cn/posts/db44294a78dc9f666f67b053f6c83567/)
- [Vue组件全局注册与局部注册如何抉择？](https://blog.cmdragon.cn/posts/43ead630ea17da65d99ad2eb8188e472/)
- [Vue3组件化开发中，Props与Emits如何实现数据流转与事件协作？](https://blog.cmdragon.cn/posts/8cff7d2df113da66ea7be560c4d1d22a/)
- [Vue 3模板引用如何与其他特性协同实现复杂交互？](https://blog.cmdragon.cn/posts/331bf75d114ab09116eadfcdca602b58/)
- [Vue 3 v-for中模板引用如何实现高效管理与动态控制？](https://blog.cmdragon.cn/posts/cb380897ddc3578b180ecf8843c774c1/)
- [Vue 3的defineExpose：如何突破script setup组件默认封装，实现精准的父子通讯？](https://blog.cmdragon.cn/posts/202ae0f4acde7128e0e31baf63732fb5/)
- [Vue 3模板引用的生命周期时机如何把握？常见陷阱该如何避免？](https://blog.cmdragon.cn/posts/7d2a0f6555ecbe92afd7d2491c427463/)
- [Vue 3模板引用如何实现父组件与子组件的高效交互？](https://blog.cmdragon.cn/posts/3fb7bdd84128b7efaaa1c979e1f28dee/)
- [Vue中为何需要模板引用？又如何高效实现DOM与组件实例的直接访问？](https://blog.cmdragon.cn/posts/23f3464ba16c7054b4783cded50c04c6/)
- [Vue 3 watch与watchEffect如何区分使用？常见陷阱与性能优化技巧有哪些？](https://blog.cmdragon.cn/posts/68a26cc0023e4994a6bc54fb767365c8/)
- [Vue3侦听器实战：组件与Pinia状态监听如何高效应用？](https://blog.cmdragon.cn/posts/fd4695f668d64332dda9962c24214f32/)
- [Vue 3中何时用watch，何时用watchEffect？核心区别及性能优化策略是什么？](https://blog.cmdragon.cn/posts/cdbbb1837f8c093252e61f46dbf0a2e7/)
- [Vue 3中如何有效管理侦听器的暂停、恢复与副作用清理？](https://blog.cmdragon.cn/posts/09551ab614c463a6d6ca69818e8c2d52/)
- [Vue 3 watchEffect：如何实现响应式依赖的自动追踪与副作用管理？](https://blog.cmdragon.cn/posts/b7bca5d20f628ac09f7192ad935ef664/)
- [Vue 3 watch如何利用immediate、once、deep选项实现初始化、一次性与深度监听？](https://blog.cmdragon.cn/posts/2c6cdb100a20f10c7e7d4413617c7ea9/)
- [Vue 3中watch如何高效监听多数据源、计算结果与数组变化？](https://blog.cmdragon.cn/posts/757a1728bc1b9c0c8b317b0354d85568/)
- [Vue 3中watch监听ref和reactive的核心差异与注意事项是什么？](https://blog.cmdragon.cn/posts/8e70552f0f61e0dc8c7f567a2d272345/)
- [Vue3中Watch与watchEffect的核心差异及适用场景是什么？](https://blog.cmdragon.cn/posts/dde70ab90dc5062c435e0501f5a6e7cb/)
- [Vue 3自定义指令如何赋能表单自动聚焦与防抖输入的高效实现？](https://blog.cmdragon.cn/posts/1f5ed5047850ed52c0fd0386f76bd4ae/)
- [Vue3中如何优雅实现支持多绑定变量和修饰符的双向绑定组件？](https://blog.cmdragon.cn/posts/e3d4e128815ad731611b8ef29e37616b/)
- [Vue 3表单验证如何从基础规则到异步交互构建完整验证体系？](https://blog.cmdragon.cn/posts/7d1caedd822f70542aa0eed67e30963b/)
- [Vue3响应式系统如何支撑表单数据的集中管理、动态扩展与实时计算？](https://blog.cmdragon.cn/posts/3687a5437ab56cb082b5b813d5577a40/)
- [Vue3跨组件通信中，全局事件总线与provide/inject该如何正确选择？](https://blog.cmdragon.cn/posts/ad67c4eb6d76cf7707bdfe6a8146c34f/)
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
- [Vue v-for的key：为什么它能解决列表渲染中的"玄学错误"？选错会有哪些后果？](https://blog.cmdragon.cn/posts/1eb3ffac668a743843b5ea1738301d40/)
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
- [快速入门Vue模板引用：从收DOM"快递"到调子组件方法，你玩明白了吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/ddbce4f2a23aa72c96b1c0473900321e/)
- [快速入门Vue模板里的JS表达式有啥不能碰？计算属性为啥比方法更能打？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/23a2d5a334e15575277814c16e45df50/)
- [快速入门Vue的v-model表单绑定：语法糖、动态值、修饰符的小技巧你都掌握了吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/6be38de6382e31d282659b689c5b17f0/)
- [快速入门Vue3事件处理的挑战题：v-on、修饰符、自定义事件你能通关吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/60ce517684f4a418f453d66aa805606c/)
- [快速入门Vue3的v-指令：数据和DOM的"翻译官"到底有多少本事？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/e4ae7d5e4a9205bb11b2baccb230c637/)
- [快速入门Vue3，插值、动态绑定和避坑技巧你都搞懂了吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/999ce4fb32259ff4fbf4bf7bcb851654/)
- [想让PostgreSQL快到飞起？先找健康密码还是先换引擎？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/a6997d81b49cd232b87e1cf603888ad1/)
- [想让PostgreSQL查询快到飞起？分区表、物化视图、并行查询这三招灵不灵？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/1fee7afbb9abd4540b8aa9c141d6845d/)
- [子查询总拖慢查询？把它变成连接就能解决？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/79c590fbd87ece535b11a71c9667884f/)
- [PostgreSQL全表扫描慢到崩溃？建索引+改查询+更统计信息三招能破？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/748cdac2536008199abf8a8a2cd0ec85/)
- [复杂查询总拖后腿？PostgreSQL多列索引+覆盖索引的神仙技巧你get没？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/32ca943703226d317d4276a8fb53b0dd/)
- [只给表子集建索引？用函数结果建索引？PostgreSQL这俩操作凭啥能省空间又加速？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/ca93f1d53aa910e7ba5ffd8df611c12b/)
- [B-tree索引像字典查词一样工作？那哪些数据库查询它能加速，哪些不能？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/f507856ebfddd592448813c510a53669/)
- [想抓PostgreSQL里的慢SQL？pg_stat_statements基础黑匣子和pg_stat_monitor时间窗，谁能帮你更准揪出性能小偷？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/b2213bfcb5b88a862f2138404c03d596/)
- [PostgreSQL的"时光机"MVCC和锁机制是怎么搞定高并发的？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/26614eb7da6c476dde41d367ad888d2f/)
- [PostgreSQL性能暴涨的关键？内存IO并发参数居然要这么设置？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/69f99bc6972a860d559c74aad7280da4/)
- [大表查询慢到翻遍整个书架？PostgreSQL分区表教你怎么"分类"才高效](https://blog.cmdragon.cn/posts/7b7053f392147a8b3b1a16bebeb08d0a/)
- [PostgreSQL 查询慢？是不是忘了优化 GROUP BY、ORDER BY 和窗口函数？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c856e3cb073822349f3bf2d29995dcfc/)
- [PostgreSQL里的子查询和CTE居然在性能上"掐架"？到底该站哪边？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c096347d18e67b7431faacd2c4757093/)
- [PostgreSQL选Join策略有啥小九九？Nested Loop/Merge/Hash谁是它的菜？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/2eca89463454fd4250d7b66243b9fe5a/)
- [PostgreSQL新手SQL总翻车？这7个性能陷阱你踩过没？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/068ecb772a87d7df20a8c9fb4b233f8e/)
- [PostgreSQL索引选B-Tree还是GiST？"瑞士军刀"和"多面手"的差别你居然还不知道？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/d498f63cd0a2d5a77e445c688a8b88db/)
- [想知道数据库怎么给查询"算成本选路线"？EXPLAIN能帮你看明白？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/9101b75bdec6faea9b35d54f14e37f36/)
- [PostgreSQL处理SQL居然像做蛋糕？解析到执行的4步里藏着多少查询优化的小心机？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/d527f8ebb6e3dae2c7dfe4c8d8979444/)
- [PostgreSQL备份不是复制文件？物理vs逻辑咋选？误删还能精准恢复到1分钟前？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/6bfdae84f313cf7ad0bb7045c4392347/)
- [转账不翻车、并发不干扰，PostgreSQL的ACID特性到底有啥魔法？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/de3672803de34dbad244d0a8d48b0eb5/)
- [银行转账不白扣钱、电商下单不超卖，PostgreSQL事务的诀窍是啥？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/e463e8a2668abdf00a228c9b79324ded/)
- [PostgreSQL里的PL/pgSQL到底是啥？能让SQL从"说目标"变"讲步骤"？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/5c967e595058c4a1fc4474a68e64031d/)
- [PostgreSQL视图不存数据？那它怎么简化查询还能递归生成序列和控制权限？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/325047855e3e23b5ef82f7d2db134fbd/)
- [PostgreSQL索引这么玩，才能让你的查询真的"飞"起来？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/d2dba50bb6e4df7b27e735245a06a2a2/)
- [PostgreSQL的表关系和约束，咋帮你搞定用户订单不混乱、学生选课不重复？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/849ae5bab0f8c66e94c2f6ad1bb798e3/)
- [PostgreSQL查询的筛子、排序、聚合、分组？你会用它们搞定数据吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/ef4800975ffa84f1ca51976a70a1585b/)
- [PostgreSQL数据类型怎么选才高效不踩坑？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/bf54711525c507c5eacfa7b0151c39d2/)
- [想解锁PostgreSQL查询从基础到进阶的核心知识点？你都get了吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/887809b3e0375f5956873cd442f516d8/)
- [PostgreSQL DELETE居然有这些操作？返回数据、连表删你试过没？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/934be1203725e8be9d6f6e9104e5abcc/)
- [PostgreSQL UPDATE语句怎么玩？从改邮箱到批量更新的避坑技巧你都会吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/0f0622e9b7402b599e618150d0596ffe/)
- [PostgreSQL插入数据还在逐条敲？批量、冲突处理、返回自增ID的技巧你会吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/0e3bf7efc030b024ea67ee855a00f2de/)
- [PostgreSQL的"仓库-房间-货架"游戏，你能建出电商数据库和表吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/b6cd3c86da6aac26ed829e472d34078e/)
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

- [多直播聚合器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/multi-live-aggregator)
- [Proto文件生成器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/proto-file-generator)
- [图片转粒子 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/image-to-particles)
- [视频下载器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/video-downloader)
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
