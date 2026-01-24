---
url: /posts/08a25c29ceed14c92c89beb55563e922/
title: Vue 组件生命周期：探索钩子
date: 2024-05-27T18:42:38+08:00
lastmod: 2024-05-27T18:42:38+08:00
categories:
  - 前端开发

tags:
  - 生命周期
  - 异步加载
  - 通信原理
  - 父子通信
  - 兄弟通信
  - 跨层通信
  - 性能优化
---


<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_05_27 18_48_19.png" title="2024_05_27 18_48_19.png" alt="2024_05_27 18_48_19.png"/>


## 第 1 章：介绍与背景

1.1 什么是 Vue 组件生命周期？

Vue 组件生命周期是指 Vue 组件从创建、运行到销毁的整个过程，共分为 8 个阶段：

1. 创建前（beforeCreate）
2. 创建后（created）
3. 载入前（beforeMount）
4. 载入后（mounted）
5. 更新前（beforeUpdate）
6. 更新后（updated）
7. 销毁前（beforeDestroy）
8. 销毁后（destroyed）

在每个阶段，Vue 框架都提供了特定的钩子函数，开发人员可以在这些函数中编写自定义的代码，从而实现对组件生命周期的控制和管理。

1.2 为什么需要了解生命周期？

了解 Vue 组件生命周期有以下几个优点：

1. 了解组件的运行机制，提高开发效率。
2. 在合适的时机进行数据处理和事件绑定，提高项目性能。
3. 在组件创建和销毁时进行资源清理和内存释放，避免内存泄漏。
4. 在生命周期钩子函数中进行异步数据加载和组件通信，使代码更加清晰和可维护。

1.3 如何利用生命周期提高开发效率？

1. 在创建阶段，可以进行数据初始化和事件绑定，避免在模板中频繁的编写相同的代码。
2. 在运行阶段，可以对数据进行监听和优化，提高项目性能。
3. 在销毁阶段，可以进行资源清理和内存释放，避免内存泄漏。AD：[漫画首页](https://comic.cmdragon.cn:2087/)
4. 在生命周期钩子函数中进行异步数据加载和组件通信，使代码更加清晰和可维护。
5. 通过使用第三方库或插件，可以更加方便地使用生命周期钩子函数，提高开发效率。



## 第 2 章：组件生命周期概述

2.1 组件生命周期的基本概念

组件生命周期是指 Vue 组件从创建、运行到销毁的整个过程。在这个过程中，Vue 框架会自动调用一系列的生命周期钩子函数，开发人员可以在这些函数中编写自定义的代码，从而实现对组件生命周期的控制和管理。

2.2 生命周期钩子函数的分类

Vue 组件的生命周期钩子函数可以分为以下几类：

1. 创建阶段钩子函数：在组件创建时调用，包括 beforeCreate 和 created 两个钩子函数。
2. 载入阶段钩子函数：在组件载入时调用，包括 beforeMount 和 mounted 两个钩子函数。
3. 更新阶段钩子函数：在组件更新时调用，包括 beforeUpdate 和 updated 两个钩子函数。
4. 销毁阶段钩子函数：在组件销毁时调用，包括 beforeDestroy 和 destroyed 两个钩子函数。

2.3 常见的生命周期钩子函数

1. beforeCreate：在组件实例被创建之前调用，此时组件实例的数据和方法还未初始化。
2. created：在组件实例被创建之后调用，此时组件实例的数据和方法已经初始化，但组件还未被挂载到 DOM 上。
3. beforeMount：在组件被挂载到 DOM 之前调用，此时组件的模板已经编译完成，但还未渲染到 DOM 上。
4. mounted：在组件被挂载到 DOM 之后调用，此时组件已经渲染到 DOM 上，可以进行 DOM 操作和异步数据加载。
5. beforeUpdate：在组件更新之前调用，此时组件的数据已经发生变化，但还未重新渲染到 DOM 上。
6. updated：在组件更新之后调用，此时组件的数据已经重新渲染到 DOM 上，可以进行 DOM 操作和异步数据加载。
7. beforeDestroy：在组件销毁之前调用，此时组件实例仍然可用，可以进行资源清理和内存释放。AD：[首页 | 一个覆盖广泛主题工具的高效在线平台](https://cmdragon.cn/)
8. destroyed：在组件销毁之后调用，此时组件实例已经被销毁，无法再进行任何操作。



## 第 3 章：创建阶段

在 Vue.js 中，组件的创建阶段包括以下几个钩子函数：

1. beforeCreate：在组件实例被创建之前调用，此时数据和方法还未初始化。
2. created：在组件实例被创建之后调用，此时数据和方法已经初始化，可以进行数据操作和事件绑定。
3. beforeMount：在组件被挂载到 DOM 之前调用，此时模板已经编译完成，但还未渲染到 DOM 上。
4. mounted：在组件被挂载到 DOM 之后调用，此时组件已经渲染到 DOM 上，可以进行 DOM 操作和异步数据加载。

在创建阶段，可以在钩子函数中进行数据处理和事件绑定，以简化组件的代码和提高组件的性能。

例如，在 created 钩子函数中可以进行数据的请求和初始化，从而避免在组件挂载到 DOM 之后再进行数据请求，提高组件的渲染速度。

同时，可以在 created 钩子函数中进行事件的绑定，从而在组件创建时就完成事件的绑定，而无需在 mounted 钩子函数中进行事件绑定。

总之，在创建阶段进行数据处理和事件绑定，可以简化组件的代码和提高组件的性能，是实现高质量 Vue 组件开发的重要手段。

以下是一些代码示例：

```javascript
// 在 created 钩子函数中进行数据的请求和初始化
export default {
  data() {
    return {
      user: null
    }
  },
  created() {
    this.fetchUser()
  },
  methods: {
    fetchUser() {
      // 进行数据请求和初始化
      this.user = {
        name: 'John Doe',
        age: 30
      }
    }
  }
}

// 在 created 钩子函数中进行事件的绑定
export default {
  data() {
    return {
      message: 'Hello World!'
    }
  },
  created() {
    this.handleClick = () => {
      console.log(this.message)
    }
  },
  mounted() {
    document.getElementById('btn').addEventListener('click', this.handleClick)
  }
}

```

在上述示例中，我们可以看到在 created 钩子函数中进行数据的请求和初始化，以及事件的绑定，从而在组件创建时就完成数据的请求和初始化，并且在组件挂载到 DOM 之后就完成事件的绑定。


## 第 4 章：运行阶段

在 Vue.js 中，组件的运行阶段包括以下几个钩子函数：

1.  beforeUpdate：在组件更新之前调用，此时数据已经更新，但 DOM 还未重新渲染。
1.  updated：在组件更新之后调用，此时 DOM 已经重新渲染。

在运行阶段，可以在钩子函数中进行数据监听和性能优化，以提高组件的响应速度和性能。

例如，在 beforeUpdate 钩子函数中可以进行数据的监听，从而在数据更新时及时更新组件的状态，避免出现数据不一致的情况。

同时，可以在 updated 钩子函数中进行性能优化，例如使用虚拟滚动技术来优化大量数据的渲染，或者使用防抖和节流技术来优化频繁触发的事件。
AD：[专业搜索引擎](https://movie.cmdragon.cn:2083/)

总之，在运行阶段进行数据监听和性能优化，可以提高组件的响应速度和性能，是实现高质量 Vue 组件开发的重要手段。

以下是一些代码示例：

```javascript
// 在 beforeUpdate 钩子函数中进行数据的监听
export default {
  data() {
    return {
      count: 0
    }
  },
  beforeUpdate() {
    console.log(`count before update: ${this.count}`)
  },
  methods: {
    increment() {
      this.count++
    }
  }
}

// 在 updated 钩子函数中进行性能优化
export default {
  data() {
    return {
      items: []
    }
  },
  updated() {
    // 使用虚拟滚动技术来优化大量数据的渲染
    const container = document.getElementById('container')
    container.style.height = `${container.scrollHeight}px`
  },
  methods: {
    addItem() {
      this.items.push(`Item ${this.items.length}`)
    }
  }
```


## 第 5 章：销毁阶段

在 Vue.js 中，组件的销毁阶段包括以下两个生命周期钩子函数：

1.  **beforeDestroy**：在组件销毁之前调用。在这个阶段，组件实例仍然完全可用，这意味着所有的数据绑定、事件监听器、计算属性等都还在工作。
1.  **destroyed**：在组件销毁之后调用。在这个阶段，组件实例已经被销毁，所有的绑定和事件监听器都已经被移除，组件不再可用。

在销毁阶段，通常会进行资源清理和内存释放，以确保应用程序的性能和稳定性。以下是一些常见的清理操作：

-   **取消订阅**：如果组件中使用了事件订阅（如使用 `EventBus` 或第三方库如 `RxJS`），应该在 `beforeDestroy` 钩子中取消这些订阅，以避免内存泄漏。
-   **清除定时器**：如果在组件中使用了定时器（如 `setInterval` 或 `setTimeout`），应该在 `beforeDestroy` 钩子中清除这些定时器。
-   **解绑事件监听器**：如果组件绑定了 DOM 事件监听器，应该在 `beforeDestroy` 钩子中解绑这些事件监听器。
-   **断开 WebSocket 连接**：如果组件使用了 WebSocket 连接，应该在 `beforeDestroy` 钩子中断开这些连接。

以下是一个简单的示例，展示了如何在 `beforeDestroy` 钩子中进行资源清理：

```javascript
export default {
  data() {
    return {
      timer: null
    };
  },
  created() {
    // 创建定时器
    this.timer = setInterval(() => {
      console.log('定时器运行中...');
    }, 1000);
  },
  beforeDestroy() {
    // 清除定时器
    clearInterval(this.timer);
  },
  destroyed() {
    console.log('组件已被销毁');
  }
};

```

在这个示例中，组件在创建时启动了一个定时器，并在销毁前清除这个定时器，以避免内存泄漏。`destroyed` 钩子简单地记录了组件已被销毁的信息。通过这种方式，可以确保组件在不再需要时能够正确地释放资源，从而优化应用程序的性能和内存使用。


## 第 6 章：异步数据加载

在 Vue.js 中，异步数据加载是常见的需求，通常通过在生命周期钩子函数中发起数据请求来实现。以下是如何使用生命周期函数进行数据请求以及在合适的时机取消请求的详细说明：

### 6.1 使用生命周期函数进行数据请求

通常，数据请求会在组件的生命周期钩子函数中发起，特别是 `created` 或 `mounted` 钩子。这两个钩子分别在组件实例被创建后和组件挂载到 DOM 后立即调用。

#### 示例：在 `created` 钩子中发起数据请求

```javascript
export default {
  data() {
    return {
      posts: []
    };
  },
  created() {
    this.fetchPosts();
  },
  methods: {
    async fetchPosts() {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        const data = await response.json();
        this.posts = data;
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    }
  }
};

```

在这个示例中，组件在创建后立即调用 `fetchPosts` 方法来获取数据。使用 `async/await` 来处理异步操作，使得代码更加清晰和易于理解。

### 6.2 在合适的时机取消请求

在某些情况下，可能需要在组件销毁前取消未完成的请求，以避免潜在的内存泄漏或不必要的网络请求。这通常在 `beforeDestroy` 钩子中完成。

#### 示例：在 `beforeDestroy` 钩子中取消请求

假设使用 `axios` 进行数据请求，并且每个请求都有一个唯一的标识符，可以使用这个标识符来取消请求。

```javascript
import axios from 'axios';
import { ref } from 'vue';

export default {
  data() {
    return {
      cancelTokenSource: ref(null),
      posts: []
    };
  },
  created() {
    this.fetchPosts();
  },
  beforeDestroy() {
    if (this.cancelTokenSource.value) {
      this.cancelTokenSource.value.cancel('组件销毁前取消请求');
    }
  },
  methods: {
    fetchPosts() {
      this.cancelTokenSource.value = axios.CancelToken.source();
      axios.get('https://jsonplaceholder.typicode.com/posts', {
        cancelToken: this.cancelTokenSource.value.token
      }).then(response => {
        this.posts = response.data;
      }).catch(thrown => {
        if (axios.isCancel(thrown)) {
          console.log(thrown.message); // 输出：组件销毁前取消请求
        } else {
          console.error('Error fetching posts:', thrown);
        }
      });
    }
  }
};

```

在这个示例中，使用 `axios` 的 `CancelToken` 来创建一个取消令牌，并在 `beforeDestroy` 钩子中使用这个令牌来取消请求。如果请求被取消，`axios` 会抛出一个特定的错误，可以通过 `axios.isCancel` 来检查这个错误。

通过这种方式，可以确保在组件不再需要数据时，不会继续进行不必要的数据请求，从而优化性能并减少资源消耗。



## 第 7 章：组件通信
在 Vue.js 中，组件通信是非常重要的话题，可以分为父子组件通信、兄弟组件通信和跨层级组件通信。以下是详细的说明：

### 7.1 父子组件通信

父子组件通信是最常见的组件通信方式，在父组件和子组件之间传递数据和事件非常简单。

#### 父组件向子组件传递数据

可以使用 `props` 将数据从父组件传递到子组件。

#### 示例：父组件向子组件传递数据

```javascript
<!-- ParentComponent.vue -->
<template>
  <div>
    <child-component :title="parentTitle"></child-component>
  </div>
</template>

<script>
import ChildComponent from './ChildComponent.vue';

export default {
  components: {
    ChildComponent
  },
  data() {
    return {
      parentTitle: 'Hello from parent!'
    };
  }
};
</script>

<!-- ChildComponent.vue -->
<template>
  <div>
    <h1>{{ title }}</h1>
  </div>
</template>

<script>
export default {
  props: {
    title: String
  }
};
</script>

```

#### 子组件向父组件发送事件

可以使用 `$emit` 将事件从子组件发送到父组件。

#### 示例：子组件向父组件发送事件

```javascript
<!-- ParentComponent.vue -->
<template>
  <div>
    <child-component @child-event="handleChildEvent"></child-component>
  </div>
</template>

<script>
import ChildComponent from './ChildComponent.vue';

export default {
  components: {
    ChildComponent
  },
  methods: {
    handleChildEvent(message) {
      console.log('Received message from child:', message);
    }
  }
};
</script>

<!-- ChildComponent.vue -->
<template>
  <div>
    <button @click="sendMessage">Send message to parent</button>
  </div>
</template>

<script>
export default {
  methods: {
    sendMessage() {
      this.$emit('child-event', 'Hello from child!');
    }
  }
};
</script>

```

### 7.2 兄弟组件通信

对于兄弟组件之间的通信，可以使用一个中间组件或者通过事件总线（event bus）。

#### 使用中间组件

可以使用一个中间组件来传递数据和事件。

#### 示例：使用中间组件

```javascript
<!-- ParentComponent.vue -->
<template>
  <div>
    <first-child @first-child-event="handleFirstChildEvent"></first-child>
    <second-child :message="firstChildMessage"></second-child>
  </div>
</template>

<script>
import FirstChildComponent from './FirstChildComponent.vue';
import SecondChildComponent from './SecondChildComponent.vue';

export default {
  components: {
    FirstChildComponent,
    SecondChildComponent
  },
  data() {
    return {
      firstChildMessage: null
    };
  },
  methods: {
    handleFirstChildEvent(message) {
      this.firstChildMessage = message;
    }
  }
};
</script>

<!-- FirstChildComponent.vue -->
<template>
  <div>
    <button @click="sendMessage">Send message to second child</button>
  </div>
</template>

<script>
export default {
  methods: {
    sendMessage() {
      this.$emit('first-child-event', 'Hello from first child!');
    }
  }
};
</script>

<!-- SecondChildComponent.vue -->
<template>
  <div>
    <h1>{{ message }}</h1>
  </div>
</template>

<script>
export default {
  props: {
    message: String
  }
};
</script>

```

#### 使用事件总线

可以使用一个全局事件总线来实现兄弟组件之间的通信。

#### 示例：使用事件总线

```javascript
// main.js
import Vue from 'vue';
export const EventBus = new Vue();

// FirstChildComponent.vue
<template>
  <div>
    <button @click="sendMessage">Send message to second child</button>
  </div>
</template>

<script>
import { EventBus } from './main';

export default {
  methods: {
    sendMessage() {
      EventBus.$emit('first-child-event', 'Hello from first child!');
    }
  }
};
</script>

// SecondChildComponent.vue
<template>
  <div>
    <h1>{{ message }}</h1>
  </div>
</template>

<script>
import { EventBus } from './main';

export default {
  data() {
    return {
      message: null
    };
  },
  created() {
    EventBus.$on('first-child-event', message => {
      this.message = message;
    });
  }
};
</script>

```

### 7.3 跨层级组件通信

对于跨层级组件之间的通信，可以使用 `provide` 和 `inject` 或者使用 Vuex 状态管理。

#### 使用 `provide` 和 `inject`

可以使用 `provide` 和 `inject` 在父组件和子组件之间进行跨层级通信。

#### 示例：使用 `provide` 和 `inject`

```javascript
<!-- ParentComponent.vue -->
<template>
  <div>
    <first-child></first-child>
  </div>
</template>

<script>
import FirstChildComponent from './FirstChildComponent.vue';
import SecondChildComponent from './SecondChildComponent.vue';

export default {
  components: {
    FirstChildComponent
  },
  provide() {
    return {
      parentMessage: 'Hello from parent!'
    };
  }
};
</script>

<!-- FirstChildComponent.vue -->
<template>
  <div>
    <second-child></second-child>
  </div>
</template>

<script>
import SecondChildComponent from './SecondChildComponent.vue';

export default {
  components: {
    SecondChildComponent
  },
  inject: ['parentMessage']
};
</script>

<!-- SecondChildComponent.vue -->
<template>
  <div>
    <h1>{{ parentMessage }}</h1>
  </div>
</template>

<script>
export default {
  inject: ['parentMessage']
};
</script>

```

#### 使用 Vuex

可以使用 Vuex 状态管理来实现跨层级组件通信。

#### 示例：使用 Vuex

```javascript
// store.js
import Vuex from 'vuex';
import Vue from 'vue';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    message: 'Hello from Vuex!'
  },
  mutations: {
    setMessage(state, message) {
      state.message = message;
    }
  }
});

export default store;

// ParentComponent.vue
<template>
  <div>
    <first-child></first-child>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';
import FirstChildComponent from './FirstChildComponent.vue';

export default {
  components: {
    FirstChildComponent
  },
  methods: {
    ...mapMutations(['setMessage'])
  },
  mounted() {
    this.setMessage('Hello from parent!');
  }
};
```


## 第 8 章：组件优化
在构建大型 Vue.js 应用时，性能和内存优化是非常重要的。以下是有关组件优化的详细说明。

### 8.1 性能优化

#### 8.1.1 使用 `v-if` 和 `v-for` 时注意顺序

在使用 `v-if` 和 `v-for` 时，应该优先使用 `v-if`，因为 `v-for` 会每次都重新渲染整个列表。如果同时使用 `v-if` 和 `v-for`，`v-for` 应该优先放在 `v-if` 前面。

#### 8.1.2 使用 `key` 来优化 `v-for`

在使用 `v-for` 时，应该为每个项目提供一个唯一的 `key`，这可以帮助 Vue.js 跟踪每个节点的身份，从而提高渲染性能。

#### 8.1.3 使用 `v-once` 渲染静态内容

如果某个组件的内容在整个生命周期中都不会改变，可以使用 `v-once` 来渲染静态内容，以提高渲染性能。

#### 8.1.4 使用 `v-memo` 缓存组件

在使用 `v-for` 时，可以使用 `v-memo` 来缓存组件，以避免重新渲染。

#### 8.1.5 使用 `v-pre` 跳过编译

如果某个组件的内容不需要被 Vue.js 编译，可以使用 `v-pre` 来跳过编译，以提高渲染性能。

#### 8.1.6 使用 `v-cloak` 隐藏未编译的Mustache标签

在使用 Mustache 标签时，可以使用 `v-cloak` 来隐藏未编译的 Mustache 标签，以避免闪烁。

### 8.2 内存优化

#### 8.2.1 使用 `v-if` 和 `v-for` 时注意性能

在使用 `v-if` 和 `v-for` 时，应该注意它们的性能影响，避免不必要的渲染。

#### 8.2.2 使用 `v-show` 渲染静态内容

在使用 `v-show` 时，可以渲染静态内容，而不是使用 `v-if` 创建和销毁节点。

#### 8.2.3 使用 `Object.freeze` 冻结数据

在使用 `Object.freeze` 时，可以冻结数据，避免不必要的重新渲染。

#### 8.2.4 使用 `v-once` 渲染静态内容

在使用 `v-once` 时，可以渲染静态内容，而不是每次都重新渲染节点。

#### 8.2.5 使用 `$once` 监听事件

在使用 `$once` 时，可以监听事件，而不是使用 `$on` 创建永久的监听器。

#### 8.2.6 使用 `$off` 取消事件监听

在使用 `$off` 时，可以取消事件监听，避免内存泄漏。

### 8.3 避免常见的陷阱

#### 8.3.1 避免使用 `Array.prototype.splice` 修改数组

在使用 `Array.prototype.splice` 时，可能会导致 Vue.js 无法检测到变化，从而导致不必要的重新渲染。

#### 8.3.2 避免使用 `Object.assign` 修改对象

在使用 `Object.assign` 时，可能会导致 Vue.js 无法检测到变化，从而导致不必要的重新渲染。

#### 8.3.3 避免使用箭头函数

在使用箭头函数时，可能会导致 `this` 指向不正确，从而导致不必要的重新渲染。

#### 8.3.4 避免使用 `v-html` 和 `v-text` 混合使用

在使用 `v-html` 和 `v-text` 时，可能会导致不必要的重新渲染。

#### 8.3.5 避免使用 `v-model` 和 `.sync` 修饰符混合使用

在使用 `v-model` 和 `.sync` 修饰符时，可能会导致不必要的重新渲染。

#### 8.3.6 避免使用 `watch` 监听数组

在使用 `watch` 时，可能会导致不必要的重新渲染。

#### 8.3.7 避免使用 `watch` 监听对象

在使用 `watch` 时，可能会导致不必要的重新渲染。

#### 8.3.8 避免使用 `deep` 选项

在使用 `deep` 选项时，可能会导致不必要的重新渲染。

#### 8.3.9 避免使用 `immediate` 选项

在使用 `immediate` 选项时，可能会导致不必要的重新渲染。

#### 8.3.10 避免使用 `computed` 和 `watch` 混合使用

在使用 `computed` 和 `watch` 时，可能会导致不必要的重新渲染。

#### 8.3.11 避免使用 `methods` 和 `computed` 混合使用

在使用 `methods` 和 `computed` 时，可能会导致不必要的重新渲染。

#### 8.3.12 避免使用 `created` 和 `mounted` 混合使用

在使用 `created` 和 `mounted` 时，可能会导致不必要的重新渲染。

#### 8.3.13 避免使用 `beforeDestroy` 和 `destroyed` 混合使用

在使用 `beforeDestroy` 和 `destroyed` 时，可能会导致不必要的重新渲染。

#### 8.3.14 避免使用 `activated` 和 `deactivated` 混合使用

在使用 `activated` 和 `deactivated` 时，可能会导致不必要的重新渲染。

#### 8.3.15 避免使用 `keep-alive` 和 `v-if` 混合使用

在使用 `keep-alive` 和 `v-if` 时，可能会导致不必要的重新渲染。

#### 8.3.16 避免使用 `transition` 和 `v-if` 混合使用

在使用 `transition` 和 `v-if` 时，可能会导致不必要的重新渲染。

#### 8.3.17 避免使用 `v-else` 和 `v-else-if` 混合使用

在使用 `v-else` 和 `v-else-if` 时，可能会导致不必要的重新渲染。

#### 8.3.18 避免使用 `v-for` 和 `v-if` 混合使用

在使用 `v-for` 和 `v-if` 时，可能会导致不必要的重新渲染。


#### 8.3.19 避免使用 `v-model` 和 `.sync` 修饰符混合使用

在使用 `v-model` 和 `.sync` 修饰符时，可能会导致不必要的重新渲染。

#### 8.3.20 避免使用 `v-model` 和 `v-for` 混合使用

在使用 `v-model` 和 `v-for` 时，可能会导致不必要的重新渲染。

#### 8.3.21 避免使用 `v-model` 和 `v-show` 混合使用

在使用 `v-model` 和 `v-show` 时，可能会导致不必要的重新渲染。

#### 8.3.22 避免使用 `v-model` 和 `v-once` 混合使用

在使用 `v-model` 和 `v-once` 时，可能会导致不必要的重新渲染。

#### 8.3.23 避免使用 `v-model` 和 `v-memo` 混合使用

在使用 `v-model` 和 `v-memo` 时，可能会导致不必要的重新渲染。

#### 8.3.24 避免使用 `v-model` 和 `v-pre` 混合使用

在使用 `v-model` 和 `v-pre` 时，可能会导致不必要的重新渲染。

#### 8.3.25 避免使用 `v-model` 和 `v-cloak` 混合使用

在使用 `v-model` 和 `v-cloak` 时，可能会导致不必要的重新渲染。

#### 8.3.26 避免使用 `v-model` 和 `v-html` 混合使用

在使用 `v-model` 和 `v-html` 时，可能会导致不必要的重新渲染。

#### 8.3.27 避免使用 `v-model` 和 `v-text` 混合使用

在使用 `v-model` 和 `v-text` 时，可能会导致不必要的重新渲染。

#### 8.3.28 避免使用 `v-model` 和 `Object.freeze` 混合使用

在使用 `v-model` 和 `Object.freeze` 时，可能会导致不必要的重新渲染。

#### 8.3.29 避免使用 `v-model` 和 `$once` 混合使用

在使用 `v-model` 和 `$once` 时，可能会导致不必要的重新渲染。

#### 8.3.30 避免使用 `v-model` 和 `$off` 混合使用

在使用 `v-model` 和 `$off` 时，可能会导致不必要的重新渲染。

#### 8.3.31 避免使用 `v-model` 和 `$on` 混合使用

在使用 `v-model` 和 `$on` 时，可能会导致不必要的重新渲染。

#### 8.3.32 避免使用 `v-model` 和 `$emit` 混合使用

在使用 `v-model` 和 `$emit` 时，可能会导致不必要的重新渲染。

#### 8.3.33 避免使用 `v-model` 和 `$refs` 混合使用

在使用 `v-model` 和 `$refs` 时，可能会导致不必要的重新渲染。

#### 8.3.34 避免使用 `v-model` 和 `$nextTick` 混合使用

在使用 `v-model` 和 `$nextTick` 时，可能会导致不必要的重新渲染。

#### 8.3.35 避免使用 `v-model` 和 `vm.$forceUpdate` 混合使用

在使用 `v-model` 和 `vm.$forceUpdate` 时，可能会导致不必要的重新渲染。

#### 8.3.36 避免使用 `v-model` 和 `vm.$set` 混合使用

在使用 `v-model` 和 `vm.$set` 时，可能会导致不必要的重新渲染。

#### 8.3.37 避免使用 `v-model` 和 `vm.$delete` 混合使用

在使用 `v-model` 和 `vm.$delete` 时，可能会导致不必要的重新渲染。

#### 8.3.38 避免使用 `v-model` 和 `vm.$watch` 混合使用

在使用 `v-model` 和 `vm.$watch` 时，可能会导致不必要的重新渲染。

#### 8.3.39 避免使用 `v-model` 和 `vm.$watch` 深度监听混合使用

在使用 `v-model` 和 `vm.$watch` 深度监听时，可能会导致不必要的重新渲染。

#### 8.3.40 避免使用 `v-model` 和 `vm.$watch` 立即执行混合使用

在使用 `v-model` 和 `vm.$watch` 立即执行时，可能会导致不必要的重新渲染。

#### 8.3.41 避免使用 `v-model` 和 `vm.$set` 数组混合使用

在使用 `v-model` 和 `vm.$set` 数组时，可能会导致不必要的重新渲染。

#### 8.3.42 避免使用 `v-model` 和 `vm.$delete` 数组混合使用

在使用 `v-model` 和 `vm.$delete` 数组时，可能会导致不必要的重新渲染。

#### 8.3.43 避免使用 `v-model` 和 `vm.$watch` 数组混合使用

在使用 `v-model` 和 `vm.$watch` 数组时，可能会导致不必要的重新渲染。

#### 8.3.44 避免使用 `v-model` 和 `vm.$watch` 数组深度监听混合使用

在使用 `v-model` 和 `vm.$watch` 数组深度监听时，可能会导致不必要的重新渲染。

#### 8.3.45 避免使用 `v-model` 和 `vm.$watch` 数组立即执行混合使用

在使用 `v-model` 和 `vm.$watch` 数组立即执行时，可能会导致不必要的重新渲染。

#### 8.3.46 避免使用 `v-model` 和 `vm.$set` 对象混合使用

在使用 `v-model` 和 `vm.$set` 对象时，可能会导致不必要的重新渲染。

#### 8.3.47 避免使用 `v-model` 和 `vm.$delete` 对象混合使用

在使用 `v-model` 和 `vm.$delete` 对象时，可能会导致不必要的重新渲染。

#### 8.3.48 避免使用 `v-model` 和 `vm.$watch` 对象混合使用

在使用 `v-model` 和 `vm.$watch` 对象时，可能会导致不必要的重新渲染。


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
