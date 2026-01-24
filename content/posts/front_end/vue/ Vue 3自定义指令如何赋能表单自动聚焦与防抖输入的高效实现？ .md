---
url: /posts/1f5ed5047850ed52c0fd0386f76bd4ae/
title: Vue 3自定义指令如何赋能表单自动聚焦与防抖输入的高效实现？
date: 2026-01-22T04:49:27+08:00
lastmod: 2026-01-22T04:49:27+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/generated_image_96ab9d38-4dc9-416d-a9a4-8f2ef64168ac.png

summary:
  文章围绕Vue 3表单处理，涵盖自定义指令（自动聚焦v-focus、防抖v-debounce）、表单提交优化（防重复提交、状态管理）、动态表单渲染（条件显示、字段类型动态渲染）及常见问题解决。

categories:
  - vue

tags:
  - 基础入门
  - 自定义指令
  - 表单处理
  - 防抖指令
  - 自动聚焦
  - 动态表单
  - 性能优化

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/generated_image_96ab9d38-4dc9-416d-a9a4-8f2ef64168ac.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 自定义指令在表单中的扩展

### 自动聚焦指令（v-focus）

在表单交互中，自动聚焦是一个常见的需求，尤其是在用户打开页面或弹窗时，希望输入框自动获得焦点。Vue 3允许我们通过自定义指令轻松实现这个功能。

```vue

<script setup>
  // 定义v-focus指令
  const vFocus = {
    mounted: (el) => {
      // 当元素挂载到DOM时自动聚焦
      el.focus()
    }
  }
</script>

<template>
  <div>
    <h2>用户登录</h2>
    <input v-focus type="text" placeholder="请输入用户名"/>
    <input type="password" placeholder="请输入密码"/>
  </div>
</template>
```

这个指令比HTML原生的`autofocus`属性更强大，因为它不仅在页面加载时生效，还能在元素动态插入到DOM时自动聚焦，比如在弹窗组件中。

### 防抖输入指令（v-debounce）

在处理搜索输入等场景时，我们不希望用户每输入一个字符就立即发起请求，这会导致频繁的API调用和性能问题。防抖指令可以帮助我们延迟处理输入事件，直到用户停止输入一段时间后再执行。

```vue

<script setup>
  import {ref} from 'vue'

  // 定义防抖指令
  const vDebounce = {
    mounted: (el, binding) => {
      let timeoutId
      const delay = binding.value || 500 // 默认500ms延迟

      // 监听输入事件
      el.addEventListener('input', (e) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          // 触发自定义事件，传递输入值
          el.dispatchEvent(new CustomEvent('debounce-input', {
            detail: e.target.value
          }))
        }, delay)
      })
    }
  }

  const searchQuery = ref('')

  const handleSearch = (e) => {
    searchQuery.value = e.detail
    console.log('发起搜索:', searchQuery.value)
    // 这里可以添加实际的API调用逻辑
  }
</script>

<template>
  <div>
    <input
        v-debounce="300"
        type="text"
        placeholder="请输入搜索关键词"
        @debounce-input="handleSearch"
    />
    <p>搜索关键词: {{ searchQuery }}</p>
  </div>
</template>
```

这个防抖指令接收一个可选的延迟参数，默认500毫秒。当用户输入时，指令会在用户停止输入指定时间后触发自定义的`debounce-input`
事件，我们可以在组件中监听这个事件来处理实际的搜索逻辑。

## 表单提交的事件处理与性能优化

### 避免过度渲染的策略

在处理表单提交时，我们需要注意避免不必要的组件渲染。以下是一些常用的优化策略：

1. **使用`v-once`指令**：对于不需要更新的静态内容，使用`v-once`可以让Vue只渲染一次，之后不再重新渲染。

```vue

<template>
  <div v-once>
    <h2>用户注册</h2>
    <p>请填写以下信息完成注册</p>
  </div>
  <!-- 表单内容 -->
</template>
```

2. **使用计算属性处理复杂逻辑**：将复杂的计算逻辑放在计算属性中，而不是模板中，这样可以缓存计算结果，避免重复计算。

```vue

<script setup>
  import {ref, computed} from 'vue'

  const password = ref('')
  const confirmPassword = ref('')

  // 计算属性：检查密码是否匹配
  const isPasswordMatch = computed(() => {
    return password.value && password.value === confirmPassword.value
  })
</script>

<template>
  <div>
    <input v-model="password" type="password" placeholder="请输入密码"/>
    <input v-model="confirmPassword" type="password" placeholder="请确认密码"/>
    <p :style="{ color: isPasswordMatch ? 'green' : 'red' }">
      {{ isPasswordMatch ? '密码匹配' : '密码不匹配' }}
    </p>
  </div>
</template>
```

3. **使用`watch`监听变化**：对于需要在数据变化时执行异步操作的场景，使用`watch`而不是在模板中直接处理。

```vue

<script setup>
  import {ref, watch} from 'vue'

  const email = ref('')
  const isEmailAvailable = ref(true)

  // 监听邮箱变化，检查邮箱是否已注册
  watch(email, async (newEmail) => {
    if (newEmail) {
      // 模拟API调用
      const response = await fetch(`/api/check-email?email=${newEmail}`)
      isEmailAvailable.value = await response.json()
    }
  })
</script>

<template>
  <div>
    <input v-model="email" type="email" placeholder="请输入邮箱"/>
    <p v-if="email" :style="{ color: isEmailAvailable ? 'green' : 'red' }">
      {{ isEmailAvailable ? '邮箱可用' : '邮箱已被注册' }}
    </p>
  </div>
</template>
```

### 表单提交的优化处理

在处理表单提交时，我们需要防止用户重复提交，同时优化提交过程中的性能。

```vue

<script setup>
  import {ref} from 'vue'

  const formData = ref({
    username: '',
    password: ''
  })
  const isSubmitting = ref(false)

  const handleSubmit = async () => {
    if (isSubmitting.value) return // 防止重复提交

    isSubmitting.value = true

    try {
      // 模拟API提交
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('表单提交成功:', formData.value)
      alert('注册成功！')
    } catch (error) {
      console.error('表单提交失败:', error)
      alert('注册失败，请稍后重试')
    } finally {
      isSubmitting.value = false
    }
  }
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input
        v-model="formData.username"
        type="text"
        placeholder="请输入用户名"
        required
    />
    <input
        v-model="formData.password"
        type="password"
        placeholder="请输入密码"
        required
    />
    <button type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? '提交中...' : '注册' }}
    </button>
  </form>
</template>
```

这个示例中，我们使用`isSubmitting`状态来防止用户重复提交，同时在提交过程中禁用按钮并显示加载状态，提升用户体验。

## 动态表单渲染

### 根据条件显示/隐藏字段

在实际应用中，我们经常需要根据用户的选择动态显示或隐藏某些表单字段。Vue 3的条件渲染指令可以轻松实现这个功能。

```vue

<script setup>
  import {ref} from 'vue'

  const userType = ref('personal') // personal: 个人用户, company: 企业用户
  const formData = ref({
    username: '',
    password: '',
    companyName: '',
    companyAddress: ''
  })
</script>

<template>
  <form>
    <select v-model="userType">
      <option value="personal">个人用户</option>
      <option value="company">企业用户</option>
    </select>

    <input
        v-model="formData.username"
        type="text"
        placeholder="请输入用户名"
        required
    />
    <input
        v-model="formData.password"
        type="password"
        placeholder="请输入密码"
        required
    />

    <!-- 企业用户专属字段 -->
    <div v-if="userType === 'company'">
      <input
          v-model="formData.companyName"
          type="text"
          placeholder="请输入企业名称"
          required
      />
      <input
          v-model="formData.companyAddress"
          type="text"
          placeholder="请输入企业地址"
          required
      />
    </div>

    <button type="submit">注册</button>
  </form>
</template>
```

### 动态生成表单字段

在更复杂的场景中，我们可能需要根据后端返回的配置动态生成整个表单。这时可以结合`v-for`和动态组件来实现。

```vue

<script setup>
  import {ref, computed} from 'vue'

  // 模拟后端返回的表单配置
  const formConfig = ref([
    {
      type: 'text',
      label: '用户名',
      name: 'username',
      placeholder: '请输入用户名',
      required: true
    },
    {
      type: 'password',
      label: '密码',
      name: 'password',
      placeholder: '请输入密码',
      required: true
    },
    {
      type: 'email',
      label: '邮箱',
      name: 'email',
      placeholder: '请输入邮箱',
      required: false
    },
    {
      type: 'select',
      label: '用户类型',
      name: 'userType',
      options: [
        {value: 'personal', label: '个人用户'},
        {value: 'company', label: '企业用户'}
      ],
      required: true
    }
  ])

  const formData = ref({})

  // 计算属性：检查表单是否完整
  const isFormValid = computed(() => {
    return formConfig.value.every(field => {
      if (!field.required) return true
      return formData.value[field.name] && formData.value[field.name].trim() !== ''
    })
  })

  const handleSubmit = () => {
    if (isFormValid.value) {
      console.log('表单提交:', formData.value)
      alert('表单提交成功！')
    } else {
      alert('请填写所有必填字段！')
    }
  }
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <div v-for="field in formConfig" :key="field.name" class="form-group">
      <label>{{ field.label }} {{ field.required ? '*' : '' }}</label>

      <input
          v-if="field.type === 'text' || field.type === 'password' || field.type === 'email'"
          :type="field.type"
          :placeholder="field.placeholder"
          v-model="formData[field.name]"
      />

      <select v-else-if="field.type === 'select'" v-model="formData[field.name]">
        <option
            v-for="option in field.options"
            :key="option.value"
            :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>

    <button type="submit" :disabled="!isFormValid">提交</button>
  </form>
</template>

<style scoped>
  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }

  input, select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  button {
    padding: 0.5rem 1rem;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
</style>
```

## 课后Quiz

### 问题1：如何在Vue 3中创建一个自定义指令，实现输入框的防抖功能？

**答案解析：**

```vue

<script setup>
  const vDebounce = {
    mounted: (el, binding) => {
      let timeoutId
      const delay = binding.value || 500

      el.addEventListener('input', (e) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          el.dispatchEvent(new CustomEvent('debounce', {
            detail: e.target.value
          }))
        }, delay)
      })
    }
  }

  const handleDebounce = (e) => {
    console.log('防抖输入:', e.detail)
  }
</script>

<template>
  <input v-debounce="300" @debounce="handleDebounce" placeholder="请输入内容"/>
</template>
```

这个防抖指令通过监听输入事件，使用setTimeout延迟处理，每次输入时清除之前的定时器，确保只有在用户停止输入指定时间后才会触发处理函数。

### 问题2：在动态表单渲染中，如何根据不同的字段类型渲染不同的输入组件？

**答案解析：**
可以使用`v-if`、`v-else-if`和`v-else`指令结合`v-for`来实现：

```vue

<template>
  <div v-for="field in fields" :key="field.name">
    <input
        v-if="field.type === 'text'"
        type="text"
        v-model="formData[field.name]"
    />

    <input
        v-else-if="field.type === 'password'"
        type="password"
        v-model="formData[field.name]"
    />

    <select
        v-else-if="field.type === 'select'"
        v-model="formData[field.name]"
    >
      <option
          v-for="option in field.options"
          :key="option.value"
          :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>

    <!-- 可以继续扩展其他字段类型 -->
  </div>
</template>
```

这种方法可以根据字段的`type`属性动态渲染不同的输入组件，实现灵活的动态表单。

## 常见报错解决方案

### 1. 自定义指令无法生效

**错误现象：** 自定义指令在模板中使用后没有产生预期效果。

**可能原因：**

- 指令名称注册错误：在`<script setup>`中，自定义指令需要以`v`开头的驼峰命名，如`vFocus`，在模板中使用`v-focus`。
- 钩子函数使用错误：比如在`created`钩子中操作DOM，此时元素还未挂载到DOM树中。
- 指令作用在组件上：自定义指令默认作用于组件的根元素，如果组件有多个根元素，可能会导致意外行为。

**解决方案：**

- 确保指令名称正确注册，在`<script setup>`中使用`v`开头的驼峰命名。
- 在正确的钩子函数中操作DOM，如`mounted`或`updated`。
- 避免在组件上使用自定义指令，或者确保组件只有一个根元素。

### 2. 动态表单渲染性能问题

**错误现象：** 当表单字段较多时，渲染速度慢，用户输入卡顿。

**可能原因：**

- 不必要的响应式更新：表单数据的每个字段都被设置为响应式，导致频繁的更新。
- 复杂的计算属性：在计算属性中执行复杂的逻辑，导致每次更新都需要大量计算。
- 没有合理使用`v-for`的`key`属性：导致Vue无法正确跟踪元素的变化，进行不必要的DOM操作。

**解决方案：**

- 使用`markRaw`标记不需要响应式的静态数据，如表单配置。
- 优化计算属性，将复杂逻辑拆分为多个简单的计算属性，或者使用`watch`处理异步逻辑。
- 确保`v-for`的`key`属性使用唯一且稳定的值，如字段的`name`属性。

### 3. 表单提交重复触发

**错误现象：** 用户点击提交按钮后，表单被多次提交。

**可能原因：**

- 没有防止重复提交的机制：用户快速点击按钮导致多次触发提交事件。
- 异步操作没有正确处理：在提交过程中，状态没有及时更新，导致用户可以再次点击。

**解决方案：**

- 使用一个状态变量（如`isSubmitting`）来标记提交状态，在提交过程中禁用按钮。
- 在`finally`块中重置提交状态，确保无论成功还是失败都能恢复按钮状态。

```javascript
const handleSubmit = async () => {
    if (isSubmitting.value) return

    isSubmitting.value = true

    try {
        // 提交逻辑
    } catch (error) {
        // 错误处理
    } finally {
        isSubmitting.value = false
    }
}
```

参考链接：

- https://vuejs.org/guide/reusability/custom-directives.html
- https://vuejs.org/guide/essentials/template-syntax.html
- https://vuejs.org/guide/essentials/conditional.html

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[Vue 3自定义指令如何赋能表单自动聚焦与防抖输入的高效实现？](https://blog.cmdragon.cn/posts/1f5ed5047850ed52c0fd0386f76bd4ae/)



<details>
<summary>往期文章归档</summary>

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