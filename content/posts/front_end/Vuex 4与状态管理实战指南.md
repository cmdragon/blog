---
url: /posts/d0021a87e1b3ff948b990434dae7df80/
title: Vuex 4与状态管理实战指南
date: 2024-06-06T00:18:53+08:00
updated: 2024-06-06T00:18:53+08:00

summary:
  这篇文章介绍了使用Vuex进行Vue应用状态管理的最佳实践，包括为何需要状态管理，Vuex的核心概念如store、actions、mutations和getters，以及如何处理异步操作和模块化组织状态。通过例子展示了如何动态注册模块，以实现可复用和可扩展的状态管理解决方案。

categories:
  - 前端开发

tags:
  - Vuex
  - 状态管理
  - Vue.js
  - 模块化
  - 异步操作
  - 状态变更
  - 动态注册

---


<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_06_06 21_12_22.png" title="2024_06_06 21_12_22.png" alt="2024_06_06 21_12_22.png"/>

## **第一部分 Vuex基础**

### **第1章 Vuex概述**

#### **1.1 Vue与Vuex的关系**

Vue是一个渐进式JavaScript框架，它被设计为易于上手同时也能够强大到驱动复杂的单页应用（SPA）。Vue的核心库只关注视图层，不仅易于学习，而且容易与其他库或现有项目整合。Vuex是一个专门为Vue.js应用程序开发的状态管理模式和库。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。

Vuex与Vue的关系是互补的，Vue负责视图层的渲染，而Vuex则负责管理应用的状态。在没有Vuex的情况下，Vue组件之间的状态管理可能会变得复杂且难以维护，Vuex的出现解决了这一问题。

#### **1.2 Vuex的核心概念**

Vuex的核心概念包括以下几个部分：

-   **State**：是存储在Vuex中的状态（数据），可以是任意类型的数据。
-   **Getters**：可以看作是store的计算属性，用于派生出一些状态。
-   **Mutations**：是更改Vuex中状态的唯一方式，是同步操作。
-   **Actions**：类似于Mutations，但它包含任意异步操作。
-   **Modules**：Vuex允许将store分割成模块（module），每个模块拥有自己的state、mutation、action、getter。

#### **1.3 Vuex的工作流程**

Vuex的工作流程通常如下：

1. 组件通过`dispatch`调用一个action。
2. Action通过调用mutation来更改状态。
3. Mutation直接更改状态。
4. 由于状态变更，Vue组件会自动重新渲染，显示新的状态。

### **第2章 Vuex安装与初始化**

#### **2.1 Vuex的安装**

Vuex可以通过npm进行安装：

```
npm install vuex@next --save # 安装Vuex 4版本

```

#### **2.2 创建Vuex Store**

创建Vuex Store通常需要定义一个store对象，并在其中包含state、mutations、actions、getters等：

```js
import { createStore } from 'vuex';

const store = createStore({
  state() {
    return {
      // 初始状态
    };
  },
  mutations: {
    // 变更状态的方法
  },
  actions: {
    // 提交mutation的方法
  },
  getters: {
    // 获取状态的方法
  }
});

```

#### **2.3 在Vue应用中集成Vuex**

在Vue应用中集成Vuex，需要在Vue实例的创建过程中将store实例作为插件使用：

```js
import { createApp } from 'vue';
import App from './App.vue';
import store from './store';

const app = createApp(App);

app.use(store);

app.mount('#app');

```

### **第3章 Vuex核心概念详解**

#### **3.1 State：状态管理**

State是Vuex store的核心，它存储了所有组件的状态。组件可以通过`mapState`辅助函数或`store.state`直接访问状态。
[归档 | cmdragon's Blog](http://blog.cmdragon.cn/archives/)

#### **3.2 Getters：派生状态**

Getters可以让我们从store的state中派生出一些状态，例如过滤列表、计数器的值等。它们可以被看作是store的计算属性。

```
getters: {
  filteredList: (state) => {
    // 返回过滤后的列表
  }
}

```

#### **3.3 Mutations：同步状态变更**

Mutations是更改Vuex store中状态的唯一方式，它们是同步的，每个mutation都有一个字符串类型的事件类型（type）和一个回调函数（handler）。

```
mutations: {
  increment(state) {
    // 更改状态的逻辑
  }
}

```

#### **3.4 Actions：异步状态变更**

Actions类似于mutations，但它们支持异步操作。Action提交的是mutation，而不是直接变更状态。

```
actions: {
  incrementAsync({ commit }) {
    setTimeout(() => {
      commit('increment');
    }, 1000);
  }
}

```

#### **3.5 Modules：模块化管理**

对于大型应用，Vuex允许将store分割成模块。每个模块拥有自己的state、mutation、action、getter，使得代码结构更清晰，易于管理。

```js
const moduleA = {
  state() { /* ... */ },
  mutations: { /* ... */ },
  actions: { /* ... */ },
  getters: { /* ... */ }
};

const store = createStore({
  modules: {
    a: moduleA
  }
});
```


## **第二部分 Vuex 4新特性**

### **第4章 Vuex 4新特性概述**

#### **4.1 Vuex 4的主要改进**

Vuex 4是Vuex的最新版本，它与Vue 3兼容，并带来了一些重要的改进：

-   **与Vue 3的Composition API兼容**：Vuex 4提供了与Vue 3的Composition API更好的集成，使得状态管理更加灵活和高效。
-   **改进的模块系统**：Vuex 4增强了模块化管理，使得大型应用的状态管理更加清晰和易于维护。
-   **API的现代化**：Vuex 4更新了API，使其更加现代化，同时也保持了与Vuex 3的向后兼容性。

#### **4.2 Vuex 4的API变化**

Vuex 4的API变化主要包括：

-   **createStore函数**：用于创建一个新的store实例，替代了Vuex 3中的`new Vuex.Store`。
-   **useStore函数**：在Vue组件中使用，用于获取store实例。
-   **模块的自动命名空间**：Vuex 4默认启用模块的自动命名空间，简化了模块的管理。

### **第5章 Vuex 4的模块化管理**

#### **5.1 模块的注册与自动命名空间**

在Vuex 4中，模块的注册更加简单，并且默认启用了自动命名空间。这意味着每个模块都有自己的命名空间，可以避免不同模块之间的命名冲突。

```js
const store = createStore({
  modules: {
    account: {
      state: () => ({ ... }),
      getters: { ... },
      mutations: { ... },
      actions: { ... }
    }
  }
});

```

#### **5.2 模块的动态注册**

Vuex 4支持动态注册模块，这使得模块的加载更加灵活。

```js
store.registerModule('myModule', {
  state: () => ({ ... }),
  getters: { ... },
  mutations: { ... },
  actions: { ... }
});

```

#### **5.3 模块的重写与合并**

Vuex 4允许对现有模块进行重写或合并，这在需要更新或扩展模块时非常有用。

```js
store.hotUpdate({
  modules: {
    myModule: {
      ...myModule,
      state: () => ({ ... }),
      getters: { ... },
      mutations: { ... },
      actions: { ... }
    }
  }
});

```

### **第6章 Vuex 4的Getters改进**

#### **6.1 直接访问Getters**

在Vuex 4中，可以直接通过store实例访问getters，而不需要使用`mapGetters`辅助函数。

```
computed: {
  ...mapState(['myState']),
  myGetter() {
    return this.$store.getters.myGetter;
  }
}

```

#### **6.2 使用Getters进行派生状态的简化**

Vuex 4简化了使用getters进行派生状态的过程，使得代码更加简洁。

```
getters: {
  myGetter(state) {
    return state.myState.filter(item => item.active);
  }
}

```

在组件中使用时，可以直接访问：

```
computed: {
  myFilteredList() {
    return this.$store.getters.myGetter;
  }
}

```

这些改进使得Vuex 4在处理复杂状态管理时更加高效和易于维护。



## **第三部分 Vuex实战应用**

### **第7章 Vuex在Vue组件中的应用**

#### **7.1 在组件中访问State和Getters**

在Vue组件中，可以通过`this.$store.state`来访问store中的状态，通过`this.$store.getters`来访问getters。

```
computed: {
  // 直接访问state
  myState() {
    return this.$store.state.myState;
  },
  // 直接访问getter
  myGetter() {
    return this.$store.getters.myGetter;
  }
}

```

#### **7.2 使用mapState、mapGetters辅助函数**

为了简化组件中对store的访问，可以使用`mapState`和`mapGetters`辅助函数。

```
import { mapState, mapGetters } from 'vuex';

computed: {
  // 使用mapState
  ...mapState({
    myState: state => state.myState
  }),
  // 使用mapGetters
  ...mapGetters(['myGetter'])
}

```

#### **7.3 在组件中调用Actions和Mutations**

在组件中，可以使用`this.$store.dispatch`来调用actions，使用`this.$store.commit`来调用mutations。

```
methods: {
  updateState() {
    // 调用mutation
    this.$store.commit('updateMutation', payload);
    // 调用action
    this.$store.dispatch('updateAction', payload);
  }
}

```

### **第8章 Vuex与组件通信**

#### **8.1 Vuex状态与组件props的关系**

Vuex的状态不应该直接作为组件的props，因为props通常用于父组件向子组件传递数据。如果需要在组件中使用Vuex状态，应该通过computed属性来访问。
AD：[漫画首页](https://comic.cmdragon.cn:2087/)

#### **8.2 Vuex状态在组件间的共享**

Vuex的状态是全局的，可以被多个组件共享。组件间通过访问相同的Vuex状态来保持数据的一致性。

#### **8.3 Vuex状态与组件生命周期**

组件的生命周期钩子可以用来监听Vuex状态的变化，并执行相应的操作。

```
watch: {
  '$store.state.myState': function(newValue, oldValue) {
    // 当myState变化时执行的操作
  }
},
created() {
  // 组件创建时获取数据
  this.$store.dispatch('fetchData');
}

```

### **第9章 Vuex在大型项目中的应用**

#### **9.1 Vuex在复杂应用中的结构设计**

在大型项目中，Vuex的状态结构设计非常重要。通常建议按照功能模块来划分state、getters、mutations和actions。

```js
const store = createStore({
  modules: {
    moduleA: moduleAState,
    moduleB: moduleBState,
    // 更多模块
  }
});

```

#### **9.2 Vuex与路由的结合**

在Vue项目中，经常需要结合Vuex和Vue Router来管理路由状态。可以在路由守卫中使用Vuex状态来控制访问权限或加载必要的数据。

```js
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.getters.isAuthenticated) {
      next({ path: '/login' });
    } else {
      next();
    }
  } else {
    next();
  }
});

```

#### **9.3 Vuex与服务器端的交互**

Vuex经常与后端服务器进行交互，通过actions来处理异步请求。

```
actions: {
  async fetchData({ commit }) {
    try {
      const response = await axios.get('/api/data');
      commit('setData', response.data);
    } catch (error) {
      // 处理错误
    }
  }
}

```

在大型项目中，合理地使用Vuex可以极大地提高项目的可维护性和扩展性。


## **第四部分 Vuex高级特性**

### **第10章 Vuex的插件系统**

#### **10.1 Vuex插件的概念**

Vuex插件是一个返回函数的对象，这个函数接收`store`作为参数。插件可以在store创建之后被添加到store中，用于监听store的变化或执行一些额外的逻辑。

```js
const myPlugin = store => {
  store.subscribe((mutation, state) => {
    // 当mutation被提交时执行的操作
  });
};

```

#### **10.2 创建自定义插件**

创建自定义插件时，你可以利用`store.subscribe`来监听mutation的变化，或者使用`store.subscribeAction`来监听action的变化。

```js
const loggerPlugin = store => {
  store.subscribe((mutation, state) => {
    console.log(mutation.type, mutation.payload);
  });
  store.subscribeAction((action, state) => {
    console.log(action.type, action.payload);
  });
};

```

#### **10.3 Vuex插件的最佳实践**

使用Vuex插件时，以下是一些最佳实践：

-   保持插件的功能单一，易于维护。
-   插件中避免直接修改state，而是通过commit或dispatch来改变状态。
-   在插件中处理错误和异常，避免影响到正常的应用逻辑。

### **第11章 Vuex的性能优化**

#### **11.1 Vuex的性能考量**

在大型应用中，Vuex的状态树可能会变得非常庞大，这可能会影响到应用的性能。以下是一些性能考量的方面：

-   减少不必要的mutation和action。
-   使用计算属性和getters来避免重复的数据处理。
-   避免在组件中直接监听整个state的变化。

#### **11.2 Vuex状态树的扁平化**

Vuex状态树的扁平化是指将嵌套的状态结构转换为扁平的结构，这有助于减少组件的计算负担。

```js
// 假设原始状态树
const state = {
  user: {
    id: 1,
    name: '张三'
  },
  settings: {
    theme: 'dark'
  }
};

// 扁平化的状态
const flatState = {
  userId: state.user.id,
  userName: state.user.name,
  settingsTheme: state.settings.theme
};

```

#### **11.3 Vuex的持久化与缓存**

为了防止页面刷新导致Vuex状态丢失，可以使用持久化和缓存机制。

-   **持久化**：通常结合本地存储（如localStorage）来保存状态。
-   **缓存**：可以使用缓存策略，比如LRU（最近最少使用）缓存来存储常用的状态。

```js
// 使用localStorage进行持久化
const saveStateToLocalStorage = state => {
  localStorage.setItem('vuexState', JSON.stringify(state));
};

const loadStateFromLocalStorage = () => {
  const state = localStorage.getItem('vuexState');
  return state ? JSON.parse(state) : undefined;
};

```

在实现持久化和缓存时，需要考虑数据的安全性和性能，避免敏感数据的泄露和性能的下降。


## **第五部分 Vuex与前端框架的集成**

### **第12章 Vuex与Vue 3的集成**

#### **12.1 Vue 3的新特性**

Vue 3带来了多项新特性，包括但不限于：

-   组合式API（Composition API）：允许更加灵活地组合和复用逻辑。
-   性能提升：通过Tree Shaking、Proxy-based observation等手段，提高了框架的性能。
-   类型支持：更好的TypeScript集成。
-   自定义渲染器API：允许开发者创建自定义渲染器。
-   多事件监听和Teleport组件等新功能。

#### **12.2 Vuex在Vue 3中的使用**

在Vue 3中使用Vuex与Vue 2类似，但需要确保使用与Vue 3兼容的Vuex版本。在Vue 3中，你可以通过`app.use(store)`来安装Vuex。

```js
import { createApp } from 'vue';
import { createStore } from 'vuex';

// 创建一个新的store实例
const store = createStore({ /* ... */ });

// 创建Vue应用实例并使用store
const app = createApp({ /* ... */ });
app.use(store);
app.mount('#app');

```

#### **12.3 Vuex与Vue 3的组合式API**

在Vue 3中，可以使用组合式API来使用Vuex。以下是如何在组件中使用Vuex的状态和操作：

```js
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  setup() {
    const store = useStore();

    // 使用store.state和store.getters
    const count = computed(() => store.state.count);
    const doubleCount = computed(() => store.getters.doubleCount);

    // 使用store.dispatch和store.commit
    function increment() {
      store.dispatch('increment');
    }

    function decrement() {
      store.commit('decrement');
    }

    return { count, doubleCount, increment, decrement };
  }
};

```

### **第13章 Vuex与其他前端框架的集成**

#### **13.1 Vuex在React中的应用**

虽然Vuex是为Vue设计的，但理论上也可以在React应用中使用。然而，通常推荐使用更符合React生态的数据流管理库，如Redux。如果需要在React中使用Vuex，可以通过创建相应的包装器和桥接代码来实现。
AD：[专业搜索引擎](https://movie.cmdragon.cn:2083/)

#### **13.2 Vuex在Angular中的应用**

Vuex不是为Angular设计的，Angular有自己的状态管理库——NgRx。不过，如果你想在Angular项目中使用Vuex，需要创建一个服务来模拟Vuex的核心功能，但这通常不是一个好的实践。

#### **13.3 Vuex在跨框架项目中的实践**

在跨框架项目中使用Vuex是非常不常见的，因为每个框架都有自己的状态管理解决方案。如果确实需要在跨框架的项目中使用Vuex，可能需要创建一个统一的状态管理层，然后为每个框架提供适配器来与这个状态管理层交互。这种做法通常很复杂，并且可能带来不必要的性能和维护成本。

在实际开发中，推荐使用每个框架对应的状态管理解决方案，例如在React中使用Redux，在Vue中使用Vuex，在Angular中使用NgRx。这样可以更好地利用每个框架的特性和生态。



## **第六部分 Vuex的最佳实践**

### **第14章 Vuex的项目结构设计**

#### **14.1 Vuex在项目中的目录结构**

在项目中，Vuex的目录结构应当清晰明确，以下是一个推荐的目录结构示例：

```
src/
|-- store/
    |-- index.js          # Vuex的入口文件，用于创建store实例
    |-- modules/          # 存放各个Vuex模块
        |-- user.js       # 用户模块
        |-- products.js   # 产品模块
    |-- getters.js        # 公共getters
    |-- actions.js        # 公共actions
    |-- mutations.js      # 公共mutations

```

#### **14.2 Vuex模块的划分原则**

模块的划分应遵循以下原则：

-   按功能划分：将逻辑上紧密相关的状态、getter、action和mutation组合在一起。
-   单一职责：每个模块只处理一个具体的功能或领域。
-   保持扁平：避免模块嵌套过深，保持模块结构的扁平化。

#### **14.3 Vuex状态的命名规范**

状态的命名应遵循以下规范：

-   使用小写字母和下划线（snake_case）命名。
-   保持命名简洁明了，易于理解。
-   避免使用缩写，除非是广泛接受的缩写。

### **第15章 Vuex的测试**

#### **15.1 Vuex状态的单元测试**

对Vuex状态进行单元测试时，可以使用Vue Test Utils和Jest等测试工具。以下是一个简单的测试示例：

```js
import { createStore } from 'vuex';

const store = createStore({
  state: {
    count: 0
  },
  mutations: {
    increment(state) {
      state.count++;
    }
  }
});

describe('Vuex state', () => {
  it('mutations should increment count', () => {
    store.commit('increment');
    expect(store.state.count).toBe(1);
  });
});

```

#### **15.2 Vuex的集成测试**
。AD：[首页 | 一个覆盖广泛主题工具的高效在线平台](https://cmdragon.cn/)
集成测试通常涉及组件和Vuex store的交互。以下是一个集成测试的示例：

```js
import { mount } from '@vue/test-utils';
import MyComponent from '@/components/MyComponent.vue';
import { createStore } from 'vuex';

const store = createStore({
  state: {
    count: 0
  },
  mutations: {
    increment(state) {
      state.count++;
    }
  }
});

const wrapper = mount(MyComponent, {
  global: {
    plugins: [store]
  }
});

// 触发组件中的方法，并断言状态的变化
wrapper.find('button').trigger('click');
expect(wrapper.vm.$store.state.count).toBe(1);

```

#### **15.3 Vuex测试的最佳实践**

-   保持测试的独立性，每个测试用例只测试一个功能点。
-   使用模拟数据和真实数据相结合，确保测试的准确性。
-   保持测试的可维护性，随着Vuex状态的变化更新测试用例。

### **第16章 Vuex的维护与迭代**

#### **16.1 Vuex代码的维护**

为了维护Vuex代码，以下是一些最佳实践：

-   保持模块化和组件化。
-   使用清晰的命名和文档。
-   定期审查和重构代码。

#### **16.2 Vuex状态的迭代管理**

在迭代管理Vuex状态时：

-   小步快跑，避免一次性进行大规模的重构。
-   使用版本控制工具（如Git）来跟踪状态变化。
-   保持与团队成员的沟通，确保状态的变更是可预测和可管理的。

#### **16.3 Vuex的版本升级策略**

当升级Vuex版本时：

-   阅读官方的升级指南，了解所有的变更点。
-   在升级之前，在分支或副本上进行测试，确保应用兼容性。
-   如果可能，先升级到次要版本，逐步过渡到最新版本。


## **附录**

### **Vuex资源列表**

以下是一些Vuex学习的资源列表，可以帮助开发者更好地理解和掌握Vuex：

1. **官方文档**：[Vuex官网](https://vuex.vuejs.org/zh/)，Vue.js官方提供的Vuex文档，是最权威的学习资源。
2. **Vue.js官方教程**：Vue.js官方提供的 Vuex 教程，涵盖基础概念和高级用法。
3. **Vuex GitHub 仓库**：[Vuex GitHub](https://github.com/vuejs/vuex)，可以查看Vuex的源码和最新动态。
4. **Vue.js社区**：[Vue.js中文社区](https://www.vuejs.cn/)，国内Vue.js爱好者的交流社区，有关于Vuex的讨论和教程。
5. **视频教程**：Bilibili、慕课网等平台上有许多关于Vuex的视频教程，适合喜欢看视频学习的开发者。
6. **开源项目**：GitHub上有很多使用Vuex的开源项目，通过阅读源码可以学习到实际项目中Vuex的使用方式。

### **Vuex常见问题解答**

以下是关于Vuex的一些常见问题及其解答：

1. **什么是Vuex？**  Vuex是Vue.js的官方状态管理库，用于集中管理所有组件的状态。
2. **Vuex与组件的data有什么区别？**  Vuex是全局的状态管理，而组件的data是局部状态。Vuex的状态是响应式的，可以被多个组件共享和修改。
3. **为什么要使用Vuex？**  在大型应用中，Vuex可以帮助你更好地组织状态，并保持组件间的状态同步。
4. **Vuex中的mutation和action有什么区别？**  Mutation是同步操作，直接修改状态；Action是异步操作，提交mutation来修改状态。
5. **如何调试Vuex中的状态变化？**  可以使用Vue Devtools来跟踪和调试Vuex的状态变化。
6. **Vuex如何处理模块化？**  Vuex支持模块化，可以将状态分割成模块，每个模块拥有自己的状态、getter、action和mutation。

### **Vuex版本更新日志**

以下是Vuex的一些主要版本更新日志摘要：

-   **Vuex 3.x**：引入了模块化，增强了插件系统，改进了性能。
-   **Vuex 4.x**：与Vue 3兼容，支持Composition API，改进了类型支持，移除了一些过时的API。

具体每个版本的详细更新内容，可以查看Vuex的官方GitHub仓库中的[Release Notes](https://github.com/vuejs/vuex/releases)。


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
