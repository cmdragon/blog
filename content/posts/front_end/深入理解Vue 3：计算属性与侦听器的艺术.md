---
url: /posts/b204a37c95c2bd49a83eec82eaa8a6a0/
title: 深入理解Vue 3：计算属性与侦听器的艺术
date: 2024-05-30T3:53:47+08:00
lastmod: 2024-05-30T3:53:47+08:00
categories:
   - 前端开发

tags:
   - Vue3
   - 计算属性
   - 侦听器
   - 路由
   - 模板
   - 性能优化
   - 实战案例
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_05_30 16_02_10.png" title="2024_05_30 16_02_10.png" alt="2024_05_30 16_02_10.png"/>

## 前言

### Vue 3的新特性简介

Vue.js作为当今流行的前端框架之一，以其响应式数据绑定和组件化架构著称。随着技术的不断演进，Vue
3带来了许多令人期待的新特性，这些特性不仅使得Vue.js更加高效和灵活，也为开发者提供了更好的开发体验。

1. Composition API：Vue 3引入了Composition API，它是对原有Options API的补充，使得代码更加模块化和可复用。通过组合式API，开发者可以更方便地组织和重用逻辑。
2. Teleport：Teleport是一个新的内置组件，它允许开发者将子组件的内容移动到DOM的另一部分，而不改变它们的逻辑位置。这对于处理跨页面或跨区域的交互非常有用。
3. Suspense：Suspense是Vue 3中的另一个新特性，它允许组件在等待异步组件或数据时渲染一个占位符。这样，开发者可以更优雅地处理异步内容。
4. Fragment：在Vue 2中，组件的模板必须有一个单一的根元素。Vue 3允许使用Fragment，即多个根元素，使得模板更加灵活。
5. v-memo和v-model：v-memo是一个新的指令，用于缓存计算属性的结果，以提高性能。v-model则得到了改进，支持更多类型的输入，如复选框和下拉菜单。
6. 更快的渲染速度：Vue 3通过优化虚拟DOM的算法，提供了更快的渲染速度，使得应用更加流畅。

### 计算属性与侦听器的重要性

在Vue 3中，计算属性（computed）和侦听器（watch）是处理响应式数据和逻辑的两个重要特性。它们在应用中起着至关重要的作用，使得数据处理更加高效和简洁。

1. 计算属性：计算属性是基于其他响应式数据的计算结果。它们具有缓存特性，只有在依赖的数据发生变化时才会重新计算。这使得开发者能够以声明式的方式定义复杂的计算逻辑，而无需担心不必要的计算。
2. 侦听器：侦听器用于监听响应式数据的变化。当数据发生变化时，侦听器会执行回调函数，从而允许开发者对数据的变化做出响应。侦听器在处理异步操作和复杂的数据依赖时尤为有用。

## 第一章：Vue 3基础

### 1. Vue 3的安装与配置

Vue 3可以通过CDN或NPM安装。以下是使用NPM安装Vue 3的步骤：

1. 创建一个新的项目文件夹，并进入该文件夹。

```
mkdir my-vue-app
cd my-vue-app

```

2. 初始化项目，并安装Vue 3。

```
npm init -y
npm install vue@next

```

3. 安装完成后，可以在项目中使用Vue 3。

```javascript
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')

```

### 2. Vue 3的基本语法

Vue 3的基本语法与Vue 2类似，包括模板语法、数据绑定、条件渲染和循环渲染等。以下是一些基本语法的示例：

- 数据绑定：

```vue
<template>
  <div>
    {{ message }}
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello Vue 3!'
    }
  }
}
</script>

```

- 条件渲染：

```vue
<template>
  <div>
    <p v-if="show">显示内容</p>
    <p v-else>隐藏内容</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: true
    }
  }
}
</script>

```

- 循环渲染：

```vue
<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
    </li>
  </ul>
</template>

<script>
export default {
  data() {
    return {
      items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' }
      ]
    }
  }
}
</script>

```

### 3. 组件与模板

组件是Vue 3最重要的构建块，它允许开发者将应用分解为可重用的、独立的部分。以下是创建和使用组件的基本步骤：

- 创建组件：

```vue
// MyComponent.vue
<template>
  <div>
    <h1>{{ title }}</h1>
    <p>{{ content }}</p>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    }
  }
}
</script>

```

- 注册组件：

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import MyComponent from './components/MyComponent.vue'

createApp(App).component('my-component', MyComponent).mount('#app')

```

- 使用组件：

```vue
<template>
  <div>
    <my-component title="Hello" content="World"></my-component>
  </div>
</template>

```

组件可以接受Props，并通过事件和插槽进行通信。组件还可以使用模板来定义其渲染结果，从而使得应用更加模块化和可重用。在Vue
3中，组件的创建和使用与Vue 2类似，但是有一些细节上的改动。本章将详细介绍组件的创建、注册和使用方法，以及如何使用Props、事件和插槽进行通信。

## 第二章：计算属性

### 1. 计算属性的概念与作用

计算属性（Computed
Properties）是Vue.js中一种特殊类型的响应式属性，用于基于其他数据属性的值来动态计算新的值。它们的主要作用是将数据处理逻辑从模板中分离出来，保持模板的简洁，并确保性能优化，因为Vue会检测依赖并仅在必要时重新计算。

### 2. 计算属性的基本用法

计算属性的定义通常在组件的`data`或`methods`对象中，但更推荐使用`computed`对象。例如：

```javascript
export default {
  data() {
    return {
      a: 1,
      b: 2
    }
  },
  computed: {
    product() {
      return this.a * this.b;
    }
  }
}

```

在模板中，可以直接使用`{{ product }}`来显示计算结果。

### 3. 计算属性的高级用法

- 多级计算：可以基于其他计算属性来计算新的值。

```
computed: {
  product() {
    return this.a * this.b;
  },
  product3() {
    return this.product * this.c;
  }
}

```

- 去除依赖：`deep`属性可以用来控制是否深度检测依赖，`immediate`属性可以设置是否立即执行计算。

```
computed: {
  product3({ a, b, c }, { deep }) {
    return deep ? a * b * c : a * b + c;
  }
}

```

### 4. 缓存机制

Vue的计算属性有一个内部缓存机制，如果计算结果没有改变，Vue就不会再次执行计算函数。这对于计算密集型的属性非常有用，避免了不必要的计算。

### 5. 依赖追踪

Vue会自动追踪计算属性依赖的数据属性变化，并在依赖变化时重新计算。这使得计算属性总是反映出其依赖属性的最新值。

### 6. 计算属性的最佳实践

- 避免在计算属性中执行昂贵的计算，尽可能在组件的`methods`中处理。
- 尽量保持计算属性的简洁，只做必要的计算。
- 使用`deep`属性时要小心，因为它可能会导致不必要的重新渲染。

## 第三章：侦听器

### 1. 侦听器的概念与作用

侦听器（Watcher）是Vue.js中的一个核心概念，它用于观察和响应Vue实例上的数据变动。当被观察的数据发生变化时，侦听器会触发相应的回调函数，从而允许开发者执行响应的操作。侦听器对于处理数据变化响应和执行副作用（例如数据加载、表单验证等）非常有用。

### 2. 侦听器的基本用法

在Vue中，可以通过`watch`选项来创建侦听器。基本用法如下：

```javascript
export default {
  data() {
    return {
      message: 'Hello, Vue!'
    }
  },
  watch: {
    message(newVal, oldVal) {
      console.log('Message changed from', oldVal, 'to', newVal);
    }
  }
}

```

在这个例子中，`message`属性的任何变化都会触发`message`侦听器的回调函数，该函数会接收到新值和旧值作为参数。

### 3. 侦听器的高级用法

- 配置选项：Vue的侦听器提供了几个配置选项，如`deep`、`immediate`和`flush`，用于控制侦听器的行为。

```
watch: {
  message(newVal, oldVal) {
    // ...
  },
  deep: true, // 深度侦听
  immediate: true, // 立即执行
  flush: 'post' // 副作用在事件循环的“post”阶段执行
}

```

- 侦听器对象：也可以向`watch`选项提供一个对象，其中包含了多个侦听器配置：

```
watch: {
  // 监听data中的message属性
  message: {
    handler(newVal, oldVal) {
      // ...
    },
    deep: true,
    immediate: true
  },
  // 监听data中的age属性，但只在变化后执行
  age: {
    handler(newVal, oldVal) {
      // ...
    },
    immediate: false
  }
}

```

### 4. 深度侦听

当侦听一个对象或数组时，默认情况下Vue只侦听它们的顶级属性变化。要启用深度侦听，需要在侦听器的配置中设置`deep: true`。

```
watch: {
  someObject: {
    handler(newVal, oldVal) {
      // ...
    },
    deep: true
  }
}

```

### 5. 立即执行的侦听器

如果希望在组件挂载后立即执行侦听器的回调函数，可以在配置中设置`immediate: true`。

```
watch: {
  someData: {
    handler(newVal, oldVal) {
      // ...
    },
    immediate: true
  }
}

```

### 6. 侦听器的最佳实践

- 避免在侦听器中进行复杂的计算或副作用，这可能会导致性能问题。
- 尽量使用计算属性而不是侦听器来处理响应式数据的变化，因为计算属性具有缓存机制，可以更高效。
- 只有在确实需要响应数据变化时才使用侦听器，不要滥用。
  AD：[漫画首页](https://comic.cmdragon.cn:2087/)

## 第四章：计算属性与侦听器的对比

### 1. 计算属性与侦听器的异同

- 计算属性和侦听器都是Vue.js中用于处理数据变化的工具，它们之间的主要区别在于使用场景和实现原理。
- 计算属性是一个返回值的函数，它依赖于其他数据源，并且在数据变化时重新计算返回值。计算属性具有缓存机制，只有在依赖数据发生变化时才会重新计算。
- 侦听器是一个监听数据变化并执行特定操作的函数，它可以配置深度侦听和立即执行。

### 2. 何时使用计算属性

- 当需要从其他数据源派生出一个新值时，可以使用计算属性。
- 当需要对数据进行格式化、过滤或排序时，可以使用计算属性。
- 当需要在模板中使用的数据是由其他数据计算而来时，可以使用计算属性。

### 3. 何时使用侦听器

- 当需要在数据变化时执行特定操作，但不需要返回新值时，可以使用侦听器。
- 当需要监听一个深度嵌套的对象或数组时，可以使用侦听器。
- 当需要在数据变化后执行异步操作或执行复杂计算时，可以使用侦听器。

### 4. 结合使用计算属性与侦听器

- 在某些情况下，可能需要使用计算属性和侦听器来实现更复杂的功能。例如，当需要在数据变化时执行特定操作，同时需要在模板中使用新计算出的值时，可以使用计算属性和侦听器结合。
- 在这种情况下，可以在侦听器中执行特定操作，同时在计算属性中返回新值。

总结：计算属性和侦听器是Vue.js中处理数据变化的重要工具，它们之间的选择取决于具体的使用场景。通过合理使用计算属性和侦听器，可以提高应用的响应性和灵活性。

## 第五章：实战案例分析

### 案例一：购物车计算总价

为了实现一个简单的购物车功能，我们需要按照以下步骤进行：

1. **定义商品数组**：

    - 创建一个数组，用于存储商品信息。每个商品对象应包含名称、价格和数量等属性。

2. **定义计算属性**：

    - 创建一个计算属性，用于计算购物车中所有商品的总价。这个计算属性会遍历商品数组，将每个商品的价格乘以其数量，并将所有结果相加。

3. **定义添加商品方法**：

    - 创建一个方法，用于向商品数组中添加新的商品。这个方法需要接收商品的名称、价格和数量作为参数，并创建一个新的商品对象添加到数组中。

4. **定义删除商品方法**：

    - 创建一个方法，用于从商品数组中删除指定的商品。这个方法需要接收商品的名称或索引作为参数，并从数组中移除相应的商品对象。

下面是一个简单的JavaScript示例代码，展示了如何实现上述功能：

```javascript
// 定义商品数组
let cart = [];

// 定义计算属性
function calculateTotalPrice() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// 定义添加商品方法
function addToCart(name, price, quantity) {
    cart.push({ name, price, quantity });
}

// 定义删除商品方法
function removeFromCart(name) {
    cart = cart.filter(item => item.name !== name);
}

// 使用示例
addToCart('Apple', 1.0, 5);
addToCart('Banana', 0.5, 10);
console.log('Total Price:', calculateTotalPrice()); // 输出总价
removeFromCart('Apple');
console.log('Total Price after removing Apple:', calculateTotalPrice()); // 输出移除苹果后的总价

```

这段代码首先定义了一个空的商品数组`cart`，然后定义了计算总价、添加商品和删除商品的方法。通过调用这些方法，可以实现购物车的基本功能。

### 案例二：表单验证与状态侦听

为了实现表单验证和状态侦听的功能，我们可以使用Vue.js框架来展示这个案例，因为Vue.js提供了响应式数据和事件侦听的机制。以下是一个简单的Vue.js示例代码：

```vue
<template>
  <div>
    <input v-model="formData.inputValue" placeholder="请输入内容">
    <button :disabled="!isValid">提交</button>
    <p v-if="formError">{{ formError }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        inputValue: '',
      },
      formError: null,
    };
  },
  computed: {
    isValid() {
      // 这里可以添加更复杂的验证逻辑
      return this.formData.inputValue.length >= 5; // 至少输入5个字符才能提交
    }
  },
  methods: {
    submitForm() {
      if (this.isValid) {
        // 表单提交逻辑
        console.log('Form submitted with value:', this.formData.inputValue);
        // 提交成功后，可以清除错误信息
        this.formError = null;
      } else {
        // 如果表单无效，显示错误信息
        this.formError = '输入内容不能少于5个字符';
      }
    }
  },
  watch: {
    // 侦听输入框数据变化
    formData: {
      handler(newValue) {
        // 当formData发生变化时，执行某些操作
        if (newValue.inputValue.length < 5) {
          this.formError = '输入内容不能少于5个字符';
        } else {
          this.formError = null;
        }
      },
      deep: true // 深度监听
    }
  }
};
</script>

```

在这个示例中，我们使用了Vue.js的`v-model`来创建双向数据绑定，这样输入框的内容就会实时更新到`formData.inputValue`
。我们定义了一个计算属性`isValid`来判断输入是否有效，只有当输入框的内容满足条件时，按钮才可用。

同时，我们添加了一个`submitForm`方法来处理表单提交，并且在表单验证失败时显示错误信息。我们还使用了一个`watch`
侦听器来监听`formData`的变化，这样即使输入框的内容是逐渐变化的，我们也能及时响应并更新按钮状态和错误信息。
AD：[专业搜索引擎](https://movie.cmdragon.cn:2083/)

这个案例展示了Vue.js在处理表单验证和状态侦听方面的能力，通过响应式系统和事件机制，可以轻松实现动态表单处理。

### 案例三：动态路由与页面渲染

为了实现动态路由和页面渲染的功能，我们可以使用Vue Router，它是Vue.js官方的路由管理器。以下是一个简单的Vue Router示例代码：

```javascript
// 1. 定义路由数组
const routes = [
  { path: '/home', component: Home },
  { path: '/about', component: About },
  { path: '/contact', component: Contact }
];

// 2. 创建Vue Router实例
const router = new VueRouter({
  routes // 将路由数组传递给VueRouter
});

// 3. 定义动态路由匹配函数（这里不需要，因为Vue Router会自动处理）

// 4. 定义钩子函数，在路由切换时更新页面标题
router.beforeEach((to, from, next) => {
  // 更新页面标题
  document.title = to.meta.title || '默认标题';
  next();
});

// 在Vue实例中使用路由
new Vue({
  router,
  render: h => h(App)
}).$mount('#app');

```

在这个示例中，我们首先定义了一个路由数组`routes`，其中包含了不同的路由路径和对应的组件。然后，我们创建了一个Vue
Router实例，并将路由数组传递给它。

Vue Router会自动处理动态路由匹配，因此我们不需要额外定义一个动态路由匹配函数。

为了在路由切换时更新页面标题，我们使用了Vue Router的全局前置守卫`beforeEach`。在这个钩子函数中，我们根据当前路由对象`to`
的`meta`属性中的`title`来更新页面标题。如果`meta`属性中没有定义`title`，则使用默认标题。

## 第六章：性能优化

### 计算属性与侦听器的性能考量

**计算属性**：

- 计算属性是基于它们的依赖进行缓存的。只有在相关依赖发生改变时，它们才会重新计算。这意味着，如果一个计算属性依赖的数据没有变化，多次访问该计算属性将立即返回缓存的结果，而不是重新执行计算逻辑。
- 性能优化：确保计算属性的依赖尽可能少，这样可以减少不必要的计算。

**侦听器**：

- 侦听器（`watch`）用于观察和响应Vue实例上的数据变动。当需要在数据变化时执行异步或开销较大的操作时，这是很有用的。
- 性能优化：避免在侦听器中执行复杂的计算或操作，因为侦听器没有缓存机制，每次数据变化都会触发侦听器。

### 避免不必要的计算与侦听

- **避免在模板中进行复杂计算**：模板应该保持简洁，避免在模板中进行复杂的逻辑运算，这些应该放在计算属性中。
- **合理使用侦听器**：只在必要时使用侦听器，例如，当需要在数据变化时执行异步操作或开销较大的操作时。
- **使用`computed`代替`watch`**：如果一个操作可以被缓存，那么应该优先使用计算属性而不是侦听器。

### 使用Vue Devtools进行性能分析

Vue Devtools是一个浏览器扩展，它允许开发者检查Vue应用的状态，包括组件树、数据、事件和性能。

- **性能面板**：Vue Devtools提供了一个性能面板，可以用来分析组件的渲染时间和更新时间。
- **时间线**：通过时间线视图，可以查看应用在运行时的性能表现，包括组件的渲染和更新。
- **组件检查**：可以检查特定组件的性能，查看其计算属性和侦听器的执行情况。

使用Vue Devtools进行性能分析的步骤通常包括：AD：[首页 | 一个覆盖广泛主题工具的高效在线平台](https://cmdragon.cn/)

1. 安装并启用Vue Devtools扩展。
2. 在浏览器中打开Vue应用。
3. 打开Vue Devtools，切换到性能面板。
4. 分析组件的渲染和更新性能，识别性能瓶颈。
5. 根据分析结果优化代码，例如减少不必要的计算属性或侦听器。
   最后，我们将Vue Router实例注入到Vue应用中，并在根组件`App`中使用`<router-view>`来渲染匹配的组件。

这个案例展示了如何使用Vue Router来实现动态路由和页面渲染，以及如何在路由切换时动态更新页面标题。通过Vue
Router，我们可以轻松地管理复杂的应用路由，并提供流畅的用户体验。

## 第七章：常见问题与解决方案

### 计算属性与侦听器的常见错误

1. **计算属性错误**：

    - 忘记在计算属性中使用`return`语句。
    - 计算属性依赖的数据变化时，没有重新计算。
    - 在计算属性中更改响应式数据，导致视图更新异常。

2. **侦听器错误**：

    - 侦听器回调函数中使用`this`时，`this`的上下文不正确。
    - 侦听器没有正确地设置`deep`属性，导致深层次对象变化不被监听。
    - 在侦听器回调中进行异步操作时，可能忘记处理错误情况。

### 如何调试计算属性与侦听器

1. **计算属性调试**：

    - 使用浏览器的开发者工具，检查计算属性是否在预期的时候被重新计算。
    - 在计算属性的`getter`函数中添加调试日志，查看依赖数据变化时是否被正确更新。
    - 使用Vue Devtools监控计算属性的缓存情况。

2. **侦听器调试**：

    - 同样使用开发者工具的日志功能，检查侦听器是否在数据变化时被触发。
    - 在侦听器的回调函数中添加调试日志，确保异步操作按预期执行。
    - Vue Devtools也可以帮助你监控和调试侦听器。

### 社区中的常见问题与解答

1. **计算属性与侦听器的选择**：

    - 社区中经常讨论的问题是，何时应该使用计算属性，何时应该使用侦听器。
    - 一般建议是，如果数据变化需要同步计算，且结果需要被复用，使用计算属性。如果数据变化需要执行异步操作或深层次的数据监听，使用侦听器。

2. **性能优化**：

    - 社区中关于性能优化的讨论非常活跃，因为性能对于大型应用至关重要。
    - 常见的优化建议包括避免不必要的计算和侦听，合理使用计算属性和侦听器，以及使用Vue Devtools进行性能分析。

3. **复杂逻辑的处理**：

    - 在处理复杂逻辑时，社区通常建议将逻辑提取到方法中，而不是直接在模板或计算属性中实现。
    - 对于需要多次读取的结果，使用计算属性；对于一次性读取的结果，使用方法。

## 附录

### Vue 3官方文档参考

- [Vue 3官方文档](https://vuejs.org/)：英文版
- [Vue 3官方文档（中文版）](https://cn.vuejs.org/)：中文版翻译
- [Vue 3官方文档（旧版中文版）](https://github.com/vuejs/docs/graphs/contributors)：旧版中文版

### 相关资源与社区链接

- [Vue.js GitHub](https://github.com/vuejs)
- [Vue.js 中文社区](https://www.vuejs.org/zh/)
- [Vue.js 论坛](https://forum.vuejs.org/)
- [Vue.js 示例和组件库](https://github.com/vuejs/awesome-vue)
- [Vue Devtools](https://github.com/vuejs/vue-devtools)
- [Vite](https://vitejs.dev/)：Vue 3的构建工具，用于快速开发和构建Vue应用
- [Vue Router](https://router.vuejs.org/)：Vue 3的官方路由管理器
- [Vuex](https://vuex.vuejs.org/)：Vue 3的官方状态管理库

## 免费好用的热门在线工具

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
- [图片无损放大 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/image-upscaler)
- [文本比较工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/text-compare)
- [IP批量查询工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/ip-batch-lookup)
- [域名查询工具 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/domain-finder)
- [DNS工具箱 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/dns-toolkit)
- [网站图标生成器 - 应用商店 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps/favicon-generator)
- [XML Sitemap](https://tools.cmdragon.cn/sitemap_index.xml)
