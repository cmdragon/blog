---
url: /posts/199cb3309452cd6e8556d7111b6d8111/
title: Vue组件生命周期钩子：从创建到卸载，如何正确使用每个阶段？
date: 2026-02-20T06:17:54+08:00
lastmod: 2026-02-20T06:17:54+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/generated_image_5a94ddcb-f619-4099-a9e3-fc04c6a81fb8.png

summary:
  Vue组件生命周期分创建、挂载、更新、卸载四阶段，各阶段含两个钩子。创建阶段：beforeCreate（状态未就绪）、created（状态就绪，可发起数据请求）；挂载阶段：beforeMount（即将挂载）、mounted（已挂载，初始化DOM库）；更新阶段：beforeUpdate（保存状态）、updated（避免改状态）；卸载阶段：beforeUnmount（清理资源）、unmounted（完成清理）。各钩子需按需使用，避免在updated改状态，卸载时清理定时器等资源防泄漏。

categories:
  - vue

tags:
  - 基础入门
  - Vue生命周期钩子
  - Vue组件创建阶段
  - Vue组件挂载阶段
  - Vue组件更新阶段
  - Vue组件卸载阶段
  - Vue生命周期流程图

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/generated_image_5a94ddcb-f619-4099-a9e3-fc04c6a81fb8.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 一、Vue组件生命周期概述

Vue组件的生命周期就像一个人的成长历程，从"诞生"（创建）到"融入环境"（挂载），再到"不断成长"（更新），最后"告别世界"
（卸载）。每个阶段都有特定的钩子函数，让我们能在合适的时机执行对应的逻辑。掌握这些钩子，能让你精准控制组件的行为，写出更高效、更健壮的Vue应用。

接下来，我们将按照**创建、挂载、更新、卸载**四个核心阶段，逐一拆解每个生命周期钩子的作用、时机和最佳实践。

## 二、创建阶段：组件的"诞生"过程

创建阶段是组件实例从无到有的过程，主要完成组件的初始化和状态设置。这个阶段不涉及DOM操作，因为组件还未挂载到页面中。

### 2.1 beforeCreate：实例初始化完成，状态未就绪

当组件实例被创建后，第一个被调用的钩子就是`beforeCreate`。此时：

- 组件的props已经被解析，但**data、methods、computed、watchers**等状态相关的选项还未被初始化
- 无法访问`this.data`、`this.methods`等属性
- 适合执行一些不依赖组件状态的全局初始化逻辑，比如加载全局配置、注册全局事件总线

**代码示例**：

```javascript
export default {
    beforeCreate() {
        console.log('beforeCreate: 实例已初始化，状态未就绪')
        console.log('this.message:', this.message) // undefined
        console.log('this.sayHello:', this.sayHello) // undefined
        // 可以在这里加载全局配置，比如从localStorage读取主题设置
        this.theme = localStorage.getItem('theme') || 'light'
    },
    data() {
        return {
            message: 'Hello Vue!'
        }
    },
    methods: {
        sayHello() {
            console.log(this.message)
        }
    }
}
```

### 2.2 created：状态已就绪，DOM未挂载

`created`钩子在组件的状态相关选项（data、computed、methods、watchers）都已设置完成后调用。此时：

- 可以正常访问`this.data`、`this.methods`等所有状态和方法
- 组件的DOM还未生成，`this.$el`属性为`undefined`
- 是发起初始化数据请求的最佳时机（无需等待DOM挂载），也适合设置全局监听、初始化非DOM相关的第三方库

**代码示例**：

```javascript
import axios from 'axios'

export default {
    data() {
        return {
            userInfo: null
        }
    },
    created() {
        console.log('created: 状态已就绪，DOM未挂载')
        console.log('this.message:', this.message) // "Hello Vue!"
        console.log('this.$el:', this.$el) // undefined

        // 发起初始化数据请求
        this.fetchUserInfo()
        // 设置全局监听
        window.addEventListener('resize', this.handleResize)
    },
    methods: {
        async fetchUserInfo() {
            const response = await axios.get('/api/user/info')
            this.userInfo = response.data
        },
        handleResize() {
            console.log('窗口大小变化了')
        }
    },
    beforeUnmount() {
        // 记得在卸载前移除监听
        window.removeEventListener('resize', this.handleResize)
    }
}
```

## 三、挂载阶段：组件与DOM的"第一次接触"

挂载阶段是组件从虚拟DOM转换为真实DOM，并插入到页面中的过程。这个阶段可以开始操作DOM元素。

### 3.1 beforeMount：即将挂载，DOM未生成

`beforeMount`钩子在组件即将挂载到DOM前调用。此时：

- 组件的响应式状态已设置完成，但**真实DOM节点还未创建**
- 组件的渲染函数已编译完成，即将第一次执行DOM渲染
- 适合在DOM挂载前做最后一次状态调整，或者准备需要操作DOM的逻辑

**代码示例**：

```javascript
export default {
    beforeMount() {
        console.log('beforeMount: 即将挂载，DOM未生成')
        console.log('this.$el:', this.$el) // undefined（如果是模板渲染）或虚拟DOM占位符

        // 可以在这里调整状态，不会触发额外的更新
        this.message = 'Hello Vue! (beforeMount)'
    },
    data() {
        return {
            message: 'Hello Vue!'
        }
    }
}
```

### 3.2 mounted：DOM已挂载，组件"活"了

`mounted`钩子是组件生命周期中第一个可以访问真实DOM的钩子。此时：

- 组件的DOM树已创建完成并插入到父容器中
- 所有同步子组件已挂载完成（不包括异步组件或<Suspense>中的组件）
- 适合执行需要访问DOM的操作，比如初始化第三方DOM库（如ECharts、jQuery插件）、获取DOM元素的尺寸或位置

**代码示例：初始化ECharts图表**

```javascript
import * as echarts from 'echarts'

export default {
    mounted() {
        console.log('mounted: DOM已挂载，组件"活"了')
        console.log('this.$el:', this.$el) // 真实DOM元素

        // 初始化ECharts图表
        this.initChart()
    },
    methods: {
        initChart() {
            const chartDom = this.$refs.chartContainer
            const myChart = echarts.init(chartDom)
            const option = {
                xAxis: {
                    type: 'category',
                    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        data: [120, 200, 150, 80, 70, 110, 130],
                        type: 'bar'
                    }
                ]
            }
            myChart.setOption(option)

            // 监听窗口大小变化，自动调整图表尺寸
            window.addEventListener('resize', () => {
                myChart.resize()
            })
        }
    }
}
```

```html

<template>
    <div ref="chartContainer" style="width: 100%; height: 400px;"></div>
</template>
```

## 四、更新阶段：组件的"成长与变化"

当组件的响应式状态发生变化时，就会进入更新阶段。这个阶段会重新渲染组件的DOM树，以反映最新的状态。

### 4.1 beforeUpdate：状态改变，DOM即将更新

`beforeUpdate`钩子在组件的响应式状态改变后，DOM即将更新前调用。此时：

- 可以访问更新前的DOM状态（比如输入框的光标位置、滚动条位置）
- 可以安全地修改组件状态（不会触发无限更新循环）
- 适合在DOM更新前保存一些DOM状态，或者做最后一次状态调整

**代码示例**：

```javascript
export default {
    data() {
        return {
            count: 0,
            scrollTop: 0
        }
    },
    beforeUpdate() {
        console.log('beforeUpdate: 状态改变，DOM即将更新')
        // 保存更新前的滚动条位置
        this.scrollTop = window.scrollY
    },
    updated() {
        // 恢复滚动条位置
        window.scrollTo(0, this.scrollTop)
    },
    methods: {
        increment() {
            this.count++
        }
    }
}
```

### 4.2 updated：DOM已更新，组件完成更新

`updated`钩子在组件的DOM树更新完成后调用。此时：

- 可以访问更新后的DOM状态
- 父组件的`updated`钩子会在所有子组件的`updated`钩子之后调用
- **禁止在这个钩子中修改组件状态**，否则会触发无限更新循环
- 如果需要在DOM更新后执行操作，建议优先使用`this.$nextTick()`（确保DOM已完全更新）

**代码示例**：

```javascript
export default {
    data() {
        return {
            message: 'Hello Vue!'
        }
    },
    methods: {
        updateMessage() {
            this.message = 'Updated message!'
            // 直接访问DOM可能获取到更新前的内容
            console.log('直接访问DOM:', this.$el.textContent) // "Hello Vue!"

            // 使用$nextTick确保DOM已更新
            this.$nextTick(() => {
                console.log('$nextTick访问DOM:', this.$el.textContent) // "Updated message!"
            })
        }
    },
    updated() {
        console.log('updated: DOM已更新，组件完成更新')
        console.log('DOM内容:', this.$el.textContent) // "Updated message!"

        // 错误示例：在updated中修改状态会导致无限循环
        // this.message = 'Updated again!'
    }
}
```

## 五、卸载阶段：组件的"告别"过程

当组件从页面中移除时，就会进入卸载阶段。这个阶段主要用于清理组件创建的资源，避免内存泄漏。

### 5.1 beforeUnmount：即将卸载，组件仍可用

`beforeUnmount`钩子在组件即将被卸载前调用。此时：

- 组件实例仍然完全可用，可以访问所有状态和DOM
- 适合做一些卸载前的确认操作，比如提示用户保存未提交的内容

**代码示例**：

```javascript
export default {
    data() {
        return {
            unsavedChanges: true
        }
    },
    beforeUnmount() {
        console.log('beforeUnmount: 即将卸载，组件仍可用')
        // 提示用户保存未提交的内容
        if (this.unsavedChanges) {
            const confirmLeave = confirm('你有未保存的内容，确定要离开吗？')
            if (!confirmLeave) {
                // 阻止组件卸载（需要配合路由守卫等实现）
                return false
            }
        }
    }
}
```

### 5.2 unmounted：组件已卸载，清理工作完成

`unmounted`钩子在组件完全卸载后调用。此时：

- 组件的DOM已从页面中移除，所有子组件也已卸载
- 组件的所有响应式效果（渲染效果、computed、watchers）已停止
- 必须在这里清理所有手动创建的资源：定时器、DOM事件监听器、服务器连接、第三方库实例等，避免内存泄漏

**代码示例**：

```javascript
export default {
    data() {
        return {
            timer: null
        }
    },
    mounted() {
        // 设置定时器
        this.timer = setInterval(() => {
            console.log('定时器运行中...')
        }, 1000)
        // 添加DOM事件监听器
        window.addEventListener('resize', this.handleResize)
    },
    beforeUnmount() {
        console.log('beforeUnmount: 即将卸载，开始清理资源')
    },
    unmounted() {
        console.log('unmounted: 组件已卸载，清理工作完成')
        // 清理定时器
        clearInterval(this.timer)
        // 移除DOM事件监听器
        window.removeEventListener('resize', this.handleResize)
    },
    methods: {
        handleResize() {
            console.log('窗口大小变化了')
        }
    }
}
```

## 六、Vue组件生命周期流程图

为了更直观地理解生命周期的执行顺序，我们可以用以下流程图展示：

```mermaid
graph TD
    A[实例化组件] --> B[beforeCreate]
    B --> C[初始化状态(data/computed/methods/watchers)]
    C --> D[created]
    D --> E[编译模板为渲染函数]
    E --> F[beforeMount]
    F --> G[创建DOM并挂载到父容器]
    G --> H[mounted]
    H --> I{响应式状态改变？}
    I -->|是| J[beforeUpdate]
    J --> K[更新DOM]
    K --> L[updated]
    L --> I
    I -->|否| M{组件即将被卸载？}
    M -->|是| N[beforeUnmount]
    N --> O[卸载DOM和组件实例]
    O --> P[unmounted]
```

## 七、课后Quiz：巩固你的生命周期知识

### 问题1：在哪个钩子函数中可以安全地发起初始化数据请求？为什么？

**答案解析**：
应该在`created`钩子中发起初始化数据请求。因为`created`钩子在组件状态就绪后调用，可以正常访问`this`
和方法，而且无需等待DOM挂载，能更早地获取数据，提升页面加载速度。如果在`mounted`中发起请求，会延迟数据获取的时机。

### 问题2：为什么不能在`updated`钩子中修改组件状态？

**答案解析**：
在`updated`钩子中修改组件状态会触发组件重新渲染，而重新渲染完成后又会再次调用`updated`
钩子，形成无限更新循环，导致页面卡顿甚至崩溃。如果需要在DOM更新后修改状态，应该使用`this.$nextTick()`或者将逻辑移到
`beforeUpdate`钩子中。

### 问题3：当你需要在组件挂载后初始化一个第三方DOM库（如ECharts），应该用哪个钩子？

**答案解析**：
应该使用`mounted`钩子。因为`mounted`钩子在组件DOM挂载完成后调用，可以确保第三方库能正确获取到DOM元素并初始化。如果在
`beforeMount`中初始化，DOM还未生成，会导致初始化失败。

### 问题4：清理定时器和DOM事件监听器应该在哪个钩子中进行？

**答案解析**：
应该在`beforeUnmount`或`unmounted`钩子中进行。`beforeUnmount`钩子在组件即将卸载时调用，此时组件实例仍然可用，可以安全地清理资源；
`unmounted`钩子在组件完全卸载后调用，也可以清理资源，但建议优先使用`beforeUnmount`，确保资源在组件卸载前被清理。

## 八、常见报错与解决方案

### 错误1：在`beforeCreate`中访问`this.data`导致`undefined`

**原因**：`beforeCreate`钩子调用时，组件的data还未初始化，无法访问。
**解决方案**：将访问data的逻辑移到`created`钩子中，或者如果不需要依赖data，可以继续留在`beforeCreate`中。

### 错误2：在`mounted`中操作DOM时元素不存在

**原因**：如果组件是异步组件或者包含在`<Suspense>`中，`mounted`钩子调用时子组件可能还未挂载，导致DOM元素不存在。
**解决方案**：使用`this.$nextTick()`确保DOM已完全渲染，或者检查元素是否存在后再操作：

```javascript
mounted()
{
    this.$nextTick(() => {
        const element = this.$refs.myElement
        if (element) {
            // 操作DOM
        }
    })
}
```

### 错误3：无限更新循环（页面卡顿）

**原因**：在`updated`钩子中修改组件状态，导致组件不断重新渲染。
**解决方案**：将状态修改逻辑移到`beforeUpdate`钩子中，或者使用条件判断避免重复修改：

```javascript
// 错误示例
updated()
{
    this.count++ // 导致无限循环
}

// 正确示例
beforeUpdate()
{
    if (this.needUpdate) {
        this.count++
        this.needUpdate = false
    }
}
```

### 错误4：内存泄漏（组件卸载后定时器仍在运行）

**原因**：组件卸载时未清理定时器、DOM事件监听器等资源，导致这些资源仍然占用内存。
**解决方案**：在`beforeUnmount`或`unmounted`钩子中清理所有手动创建的资源：

```javascript
beforeUnmount()
{
    clearInterval(this.timer)
    window.removeEventListener('resize', this.handleResize)
}
```

## 参考链接

https://vuejs.org/api/options-lifecycle.html

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[Vue组件生命周期钩子：从创建到卸载，如何正确使用每个阶段？](https://blog.cmdragon.cn/posts/199cb3309452cd6e8556d7111b6d8111/)



<details>
<summary>往期文章归档</summary>

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