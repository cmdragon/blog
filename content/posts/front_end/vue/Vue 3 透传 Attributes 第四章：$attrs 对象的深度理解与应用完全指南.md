---
url: /posts/vue3-attributes-fallthrough-chapter4/
title: Vue 3 透传 Attributes 第四章：$attrs 对象的深度理解与应用
date: 2026-04-17
lastmod: 2026-04-17
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/96b08f1bd56f4be9bb6333848c1ee163~tplv-5jbd59dj06-image.png

summary:
  $attrs 对象是 Vue 3 Attributes 透传的核心。本章将深入讲解 $attrs 的结构、在模板和 script 中的访问方法、响应式特性，以及高级应用技巧，帮助你完全掌握 $attrs 的使用。

categories:
  - vue

tags:
- 基础入门
  - $attrs
  - useAttrs
  - 响应式
  - 组件通信
  - 高级应用
  - 属性分发

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/96b08f1bd56f4be9bb6333848c1ee163~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描 [二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg) 关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现 1000+ 提升效率与开发的 AI 工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/


## 一、$attrs 对象的结构与内容

### 1.1 $attrs 是什么

`$attrs` 是一个包含组件所有**未声明**的 attributes 的对象。具体来说，以下 attributes 会进入 `$attrs`：

- 未在 `props` 中声明的属性
- 未在 `emits` 中声明的事件监听器
- 所有 HTML 标准属性（class、style、id 等）
- 自定义属性（data-*、aria-* 等）

**不包括**：

- 已在 `props` 中声明的属性
- 已在 `emits` 中声明的事件（Vue 3 中会从 $attrs 中移除）

### 1.2 $attrs 的结构示例

```vue
<!-- 父组件 -->
<template>
  <ChildComponent
    title="标题"
    class="my-class"
    id="my-id"
    data-foo="bar"
    @click="handleClick"
    @custom-event="handleCustom"
  />
</template>
```

```vue
<!-- 子组件 -->
<script setup>
import { onMounted, useAttrs } from 'vue'

const attrs = useAttrs()

onMounted(() => {
  console.log('$attrs:', attrs)
  // 输出：
  // {
  //   class: 'my-class',
  //   id: 'my-id',
  //   'data-foo': 'bar',
  //   onClick: ƒ,
  //   onCustomEvent: ƒ
  // }
})
</script>

<template>
  <div v-bind="$attrs">内容</div>
</template>
```

注意：
- `title` 在 props 中声明，不会出现在 `$attrs` 中
- `class`、`id`、`data-foo` 会出现在 `$attrs` 中
- `@click` 和 `@custom-event` 会转换为 `onClick` 和 `onCustomEvent`

### 1.3 事件监听器的命名规则

在 `$attrs` 中，事件监听器以 `on` 开头，使用 PascalCase 命名：

```vue
<!-- 父组件 -->
<ChildComponent
  @click="handleClick"
  @custom-event="handleCustom"
  @update:model-value="handleUpdate"
/>
```

```vue
<!-- 子组件 -->
<script setup>
const attrs = useAttrs()
console.log(Object.keys(attrs))
// ['onClick', 'onCustomEvent', 'onUpdate:modelValue']
</script>
```

## 二、在模板中访问和使用 $attrs

### 2.1 直接使用 $attrs

在模板中，可以直接使用 `$attrs` 而无需导入：

```vue
<template>
  <div v-bind="$attrs">
    <slot />
  </div>
</template>
```

### 2.2 访问特定属性

```vue
<template>
  <div
    :id="$attrs.id"
    :class="$attrs.class"
    :data-foo="$attrs['data-foo']"
  >
    <slot />
  </div>
</template>
```

### 2.3 条件渲染

```vue
<template>
  <div>
    <label v-if="$attrs.required" class="required">*</label>
    <input v-bind="$attrs" />
  </div>
</template>
```

### 2.4 动态组件

```vue
<template>
  <component
    :is="componentType"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>

<script setup>
defineProps({
  componentType: {
    type: String,
    default: 'input'
  }
})
</script>
```

## 三、在 script setup 中获取 $attrs

### 3.1 使用 useAttrs 导入

```vue
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()

console.log(attrs.class)
console.log(attrs.id)
</script>
```

### 3.2 响应式特性

`useAttrs()` 返回的对象是响应式的，当父组件传递的 attributes 变化时，`attrs` 会自动更新。

```vue
<script setup>
import { useAttrs, watch } from 'vue'

const attrs = useAttrs()

// 监听整个 attrs 对象
watch(attrs, (newAttrs) => {
  console.log('attrs 变化:', newAttrs)
}, { deep: true })

// 监听特定属性
watch(
  () => attrs.class,
  (newClass) => {
    console.log('class 变化:', newClass)
  }
)
</script>
```

### 3.3 在计算属性中使用

```vue
<script setup>
import { useAttrs, computed } from 'vue'

const attrs = useAttrs()

const boundAttrs = computed(() => ({
  id: attrs.id,
  class: [attrs.class, 'custom-class'],
  style: attrs.style
}))
</script>

<template>
  <div v-bind="boundAttrs">
    <slot />
  </div>
</template>
```

### 3.4 注意事项：解构失去响应式

```vue
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()

// 错误：解构会失去响应式
const { class: className, id } = attrs

// 正确：使用计算属性或 getter 函数
const className = computed(() => attrs.class)
const getId = () => attrs.id
</script>
```

## 四、在 Options API 中访问 $attrs

### 4.1 使用 this.$attrs

```vue
<script>
export default {
  created() {
    console.log(this.$attrs)
  },
  methods: {
    handleUpdate() {
      console.log(this.$attrs.class)
    }
  }
}
</script>
```

### 4.2 与 setup 混用

```vue
<script>
export default {
  props: ['title'],
  created() {
    console.log(this.$attrs)
  }
}
</script>

<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()
// attrs 和 this.$attrs 是同一个对象
</script>
```

## 五、高级应用技巧

### 5.1 属性过滤和转换

```vue
<!-- SmartInput.vue -->
<template>
  <div class="input-wrapper">
    <input
      class="input"
      v-bind="inputAttrs"
    />
    <span v-if="error" class="error">{{ error }}</span>
  </div>
</template>

<script setup>
import { useAttrs, computed } from 'vue'

const props = defineProps({
  error: String
})

const attrs = useAttrs()

// 过滤出需要绑定到 input 的属性
const inputAttrs = computed(() => {
  const { class: className, style, ...rest } = attrs
  
  return {
    class: ['input', className].filter(Boolean).join(' '),
    style,
    ...rest
  }
})
</script>
```

### 5.2 属性代理

将 attributes 代理到子组件的不同部分：

```vue
<!-- SplitAttrs.vue -->
<template>
  <div class="container">
    <header v-bind="headerAttrs">
      <slot name="header" />
    </header>
    
    <main v-bind="mainAttrs">
      <slot />
    </main>
    
    <footer v-bind="footerAttrs">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup>
import { useAttrs, computed } from 'vue'

const attrs = useAttrs()

const headerAttrs = computed(() => ({
  class: attrs.headerClass,
  style: attrs.headerStyle
}))

const mainAttrs = computed(() => ({
  id: attrs.id,
  class: attrs.mainClass,
  'data-section': attrs['data-section']
}))

const footerAttrs = computed(() => ({
  class: attrs.footerClass
}))
</script>
```

使用：

```vue
<SplitAttrs
  id="page"
  header-class="page-header"
  main-class="page-main"
  footer-class="page-footer"
  data-section="home"
>
  <template #header>头部</template>
  主内容
  <template #footer>底部</template>
</SplitAttrs>
```

### 5.3 条件透传

根据条件决定是否透传某些属性：

```vue
<!-- ConditionalAttrs.vue -->
<template>
  <component
    :is="as"
    v-bind="boundAttrs"
  >
    <slot />
  </component>
</template>

<script setup>
import { useAttrs, computed } from 'vue'

const props = defineProps({
  as: {
    type: String,
    default: 'div'
  },
  allowId: {
    type: Boolean,
    default: true
  },
  allowClass: {
    type: Boolean,
    default: true
  }
})

const attrs = useAttrs()

const boundAttrs = computed(() => {
  const result = {}
  
  if (props.allowId && attrs.id) {
    result.id = attrs.id
  }
  
  if (props.allowClass && attrs.class) {
    result.class = attrs.class
  }
  
  // 始终透传 data-* 和 aria-* 属性
  Object.keys(attrs).forEach(key => {
    if (key.startsWith('data-') || key.startsWith('aria-')) {
      result[key] = attrs[key]
    }
  })
  
  return result
})
</script>
```

### 5.4 属性合并策略

```vue
<!-- MergeAttrs.vue -->
<template>
  <div v-bind="mergedAttrs">
    <slot />
  </div>
</template>

<script setup>
import { useAttrs, computed } from 'vue'

const props = defineProps({
  baseClass: String,
  baseStyle: Object
})

const attrs = useAttrs()

const mergedAttrs = computed(() => {
  const result = { ...attrs }
  
  // 合并 class
  if (props.baseClass || attrs.class) {
    const classes = []
    if (props.baseClass) classes.push(props.baseClass)
    if (attrs.class) classes.push(attrs.class)
    result.class = classes.join(' ')
  }
  
  // 合并 style
  if (props.baseStyle || attrs.style) {
    result.style = {
      ...props.baseStyle,
      ...attrs.style
    }
  }
  
  return result
})
</script>
```

### 5.5 监听 attrs 变化执行副作用

```vue
<!-- WatchAttrs.vue -->
<template>
  <div v-bind="$attrs">
    <slot />
  </div>
</template>

<script setup>
import { useAttrs, watch, onMounted, onUnmounted } from 'vue'

const attrs = useAttrs()

let cleanupFn = null

// 监听 attrs 变化
watch(
  attrs,
  (newAttrs, oldAttrs) => {
    // 清理旧的副作用
    if (cleanupFn) {
      cleanupFn()
    }
    
    // 根据新 attrs 执行副作用
    if (newAttrs['data-auto-focus']) {
      const el = document.getElementById(newAttrs.id)
      if (el) {
        el.focus()
        cleanupFn = () => el.blur()
      }
    }
  },
  { deep: true }
)

onUnmounted(() => {
  if (cleanupFn) {
    cleanupFn()
  }
})
</script>
```

## 六、实际应用场景

### 6.1 可配置的图标组件

```vue
<!-- Icon.vue -->
<template>
  <component
    :is="as"
    class="icon"
    :class="iconClass"
    v-bind="boundAttrs"
  >
    <slot>
      <svg v-if="iconType" viewBox="0 0 24 24">
        <path :d="iconPaths[iconType]" />
      </svg>
    </slot>
  </component>
</template>

<script setup>
import { useAttrs, computed } from 'vue'

const props = defineProps({
  as: {
    type: String,
    default: 'i'
  },
  iconType: String,
  size: {
    type: String,
    default: 'medium'
  }
})

const attrs = useAttrs()

const iconClass = computed(() => ({
  [`icon-${props.size}`]: true
}))

const iconPaths = {
  home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  user: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  settings: 'M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z'
}

const boundAttrs = computed(() => {
  const { class: className, style, ...rest } = attrs
  
  return {
    ...rest,
    'aria-hidden': attrs['aria-hidden'] ?? true
  }
})
</script>

<style scoped>
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.icon svg {
  width: 1em;
  height: 1em;
  fill: currentColor;
}

.icon-small {
  font-size: 12px;
}

.icon-medium {
  font-size: 16px;
}

.icon-large {
  font-size: 24px;
}
</style>
```

使用：

```vue
<template>
  <Icon icon-type="home" size="large" class="home-icon" />
  <Icon icon-type="user" @click="handleUserClick" />
  <Icon as="button" icon-type="settings" aria-label="设置" />
</template>
```

### 6.2 高阶组件：带日志的属性透传

```vue
<!-- WithLogging.vue -->
<template>
  <component
    :is="component"
    v-bind="loggedAttrs"
  >
    <slot />
  </component>
</template>

<script setup>
import { useAttrs, computed, watch } from 'vue'

const props = defineProps({
  component: {
    type: String,
    required: true
  },
  logChanges: {
    type: Boolean,
    default: true
  }
})

const attrs = useAttrs()

const loggedAttrs = computed(() => {
  if (props.logChanges) {
    console.log('透传的 attributes:', attrs)
  }
  return attrs
})

watch(attrs, (newAttrs, oldAttrs) => {
  if (props.logChanges) {
    console.log('Attributes 变化:')
    console.log('旧:', oldAttrs)
    console.log('新:', newAttrs)
  }
}, { deep: true })
</script>
```

### 6.3 动态表单字段组件

```vue
<!-- DynamicField.vue -->
<template>
  <div class="field">
    <label v-if="label" :for="fieldId">{{ label }}</label>
    <component
      :is="fieldType"
      :id="fieldId"
      class="field-control"
      v-bind="fieldAttrs"
    >
      <slot />
    </component>
  </div>
</template>

<script setup>
import { useAttrs, computed } from 'vue'

const props = defineProps({
  label: String,
  fieldType: {
    type: String,
    default: 'input'
  },
  fieldId: String
})

const attrs = useAttrs()

const fieldAttrs = computed(() => {
  const { class: className, ...rest } = attrs
  
  return {
    class: ['field-control', className].filter(Boolean).join(' '),
    ...rest
  }
})
</script>

<style scoped>
.field {
  margin-bottom: 16px;
}

.field label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.field-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
```

使用：

```vue
<template>
  <DynamicField
    label="用户名"
    field-type="input"
    field-id="username"
    type="text"
    placeholder="请输入用户名"
    required
  />
  
  <DynamicField
    label="性别"
    field-type="select"
    field-id="gender"
  >
    <option value="male">男</option>
    <option value="female">女</option>
  </DynamicField>
  
  <DynamicField
    label="备注"
    field-type="textarea"
    field-id="note"
    rows="4"
  />
</template>
```

## 七、性能优化

### 7.1 使用计算属性缓存

```vue
<script setup>
import { useAttrs, computed } from 'vue'

const attrs = useAttrs()

// 推荐：使用计算属性缓存
const processedAttrs = computed(() => {
  const result = {}
  Object.keys(attrs).forEach(key => {
    if (key.startsWith('data-')) {
      result[key] = attrs[key]
    }
  })
  return result
})
</script>
```

### 7.2 避免不必要的 watch

```vue
<script setup>
import { useAttrs, watch } from 'vue'

const attrs = useAttrs()

// 不推荐：深度监听整个 attrs
watch(attrs, handler, { deep: true })

// 推荐：只监听特定属性
watch(
  () => attrs.class,
  handler
)
</script>
```

### 7.3 清理副作用

```vue
<script setup>
import { useAttrs, watch, onUnmounted } from 'vue'

const attrs = useAttrs()
let cleanup = null

watch(
  () => attrs['data-tooltip'],
  (tooltip) => {
    if (cleanup) cleanup()
    
    if (tooltip) {
      // 创建 tooltip
      cleanup = () => {
        // 销毁 tooltip
      }
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  if (cleanup) cleanup()
})
</script>
```

## 课后 Quiz

**问题 1**：如何在 script setup 中正确访问 $attrs？

**答案**：使用 `useAttrs()` 导入：
```vue
<script setup>
import { useAttrs } from 'vue'
const attrs = useAttrs()
</script>
```

---

**问题 2**：为什么解构 $attrs 会失去响应式？

**答案**：`useAttrs()` 返回的是一个响应式代理对象，解构会破坏代理关系，导致失去响应式。应该使用计算属性或 getter 函数来访问特定属性。

---

**问题 3**：如何在 Options API 和 Composition API 混用时访问 $attrs？

**答案**：
- Options API 中使用 `this.$attrs`
- Composition API 中使用 `useAttrs()`
- 两者引用的是同一个对象

## 常见报错解决方案

### 报错 1：useAttrs 未定义

**现象**：在 script setup 中使用 `$attrs` 报错。

**原因**：没有导入 `useAttrs`。

**解决方案**：

```vue
<script setup>
import { useAttrs } from 'vue'

const attrs = useAttrs()
</script>
```

### 报错 2：解构后属性不更新

**现象**：解构 $attrs 后，属性变化不响应。

**原因**：解构失去响应式。

**解决方案**：

```vue
<script setup>
import { useAttrs, computed } from 'vue'

const attrs = useAttrs()

// 错误
// const { class: className } = attrs

// 正确
const className = computed(() => attrs.class)
</script>
```

### 报错 3：watch attrs 不触发

**现象**：监听 attrs 对象变化不触发。

**原因**：需要设置 `deep: true` 或监听具体属性。

**解决方案**：

```vue
<script setup>
import { useAttrs, watch } from 'vue'

const attrs = useAttrs()

// 监听整个对象
watch(attrs, handler, { deep: true })

// 或监听具体属性
watch(() => attrs.class, handler)
</script>
```

## 参考链接

- [Vue 3 useAttrs API](https://vuejs.org/api/composition-api-dependency-injection.html#useattrs)
- [Vue 3 Attributes 透传官方文档](https://vuejs.org/guide/components/attrs.html)
- [Vue 3 响应式基础](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)

余下文章内容请点击跳转至 个人博客页面 或者 扫描 [二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg) 关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：[Vue 3 透传 Attributes 第四章：$attrs 对象的深度理解与应用完全指南](https://blog.cmdragon.cn/posts/vue3-attributes-fallthrough-chapter4/)

<details>
<summary>往期文章归档</summary>

</details>


<details>
<summary>免费好用的热门在线工具</summary>

- [多直播聚合器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/multi-live-aggregator)
- [Proto 文件生成器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/proto-file-generator)
- [图片转粒子 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/image-to-particles)
- [视频下载器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/video-downloader)
- [文件格式转换器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/file-converter)
- [M3U8 在线播放器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/m3u8-player)
- [快图设计 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/quick-image-design)
- [高级文字转图片转换器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/text-to-image-advanced)
- [RAID 计算器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/raid-calculator)
- [在线 PS - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/photoshop-online)
- [Mermaid 在线编辑器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/mermaid-live-editor)
- [数学求解计算器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/math-solver-calculator)
- [智能提词器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/smart-teleprompter)
- [魔法简历 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/magic-resume)
- [Image Puzzle Tool - 图片拼图工具 | By cmdragon](https://tools.cmdragon.cn/zh/apps/image-puzzle-tool)
- [字幕下载工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/subtitle-downloader)
- [歌词生成工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/lyrics-generator)
- [网盘资源聚合搜索 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/cloud-drive-search)
- [ASCII 字符画生成器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/ascii-art-generator)
- [JSON Web Tokens 工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/jwt-tool)
- [Bcrypt 密码工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/bcrypt-tool)
- [GIF 合成器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/gif-composer)
- [GIF 分解器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/gif-decomposer)
- [文本隐写术 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/text-steganography)
- [CMDragon 在线工具 - 高级 AI 工具箱与开发者套件 | 免费好用的在线工具](https://tools.cmdragon.cn/zh)
- [应用商店 - 发现 1000+ 提升效率与开发的 AI 工具和实用程序 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps?category=trending)
- [CMDragon 更新日志 - 最新更新、功能与改进 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/changelog)
- [支持我们 - 成为赞助者 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/sponsor)
- [AI 文本生成图像 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/text-to-image-ai)
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
- [SVG 优化器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/svg-optimizer)
- [调色板生成器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/color-palette)
- [在线节拍器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/online-metronome)
- [IP 归属地查询 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/ip-geolocation)
- [CSS 网格布局生成器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/css-grid-layout)
- [邮箱验证工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/email-validator)
- [书法练习字帖 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/calligraphy-practice)
- [金融计算器套件 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/finance-calculator-suite)
- [中国亲戚关系计算器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/chinese-kinship-calculator)
- [Protocol Buffer 工具箱 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/protobuf-toolkit)
- [IP 归属地查询 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/ip-geolocation)
- [图片无损放大 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/image-upscaler)
- [文本比较工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/text-compare)
- [IP 批量查询工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/ip-batch-lookup)
- [域名查询工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/domain-finder)
- [DNS 工具箱 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/dns-toolkit)
- [网站图标生成器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/favicon-generator)
- [XML Sitemap](https://tools.cmdragon.cn/sitemap_index.xml)

</details>
