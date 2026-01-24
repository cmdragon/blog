---
url: /posts/7ef2264218c32c7cf7f16dfa7cabd2ce/
title: Nuxt框架中内置组件详解及使用指南（三）
date: 2024-07-08T00:18:53+08:00
updated: 2024-07-08T00:18:53+08:00
author: cmdragon

summary:
  摘要：“Nuxt 3框架中<NuxtLink>与<NuxtLoadingIndicator>组件的深度使用教程，包括如何使用这两个组件进行页面导航和加载指示的自定义配置与实战示例。”

categories:
  - 前端开发

tags:
  - nuxt
  - 组件
  - NuxtLink
  - 导航
  - 链接
  - 加载
  - 自定义
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_07_08 16_33_38.png" title="2024_07_08 16_33_38.png" alt="2024_07_08 16_33_38.png"/>


<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

## 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

## **Nuxt 3 中`<NuxtLink>`组件的使用指南与示例**

NuxtLink 是 Nuxt.js 框架提供的一种组件，用于在 Vue.js 应用程序中创建链接。它结合了 Vue Router 的强大功能与 HTML`<a>`
标签的简洁性，使得在 Nuxt.js 应用中创建内部和外部链接变得轻而易举。NuxtLink
组件能够智能地处理链接的优化，如预加载、默认属性等，为开发者提供了一种高效、灵活的链接解决方案。

### 如何使用 NuxtLink？

在 Nuxt.js 应用中，使用 NuxtLink 组件创建链接非常简单。只需要将`<NuxtLink>`标签包裹在你想要链接的文本或内容上，然后指定`to`
属性即可。下面是一个创建内部链接的示例：

```vue
<template>
  <NuxtLink to="/about">
    关于页面
  </NuxtLink>
</template>
```

对于外部链接，只需将链接地址作为`to`属性的值即可：

```vue
<template>
  <NuxtLink to="https://nuxtjs.org">
    Nuxt 网站
  </NuxtLink>
</template>
```

### NuxtLink 的高级属性与功能

NuxtLink 组件提供了丰富的属性来增强链接的交互性和功能：

- **`target`属性**：允许指定链接在新标签页中打开，如`target="_blank"`。
- **`rel`属性**：用于设置链接的 rel 属性，如`rel="noopener noreferrer"`，适用于外部链接。
- **`noRel`属性**：当链接需要外部链接的行为但不需要 rel 属性时，可以使用此属性。
- **`activeClass`和`exactActiveClass`**：用于自定义活动链接和精确活动链接的类，帮助实现更丰富的视觉效果。
- **`replace`属性**：控制链接点击时是否替换当前页面历史记录。
- **`ariaCurrentValue`属性**：用于设置活动链接的 aria-current 属性，提高无障碍访问性。
- **`external`属性**：强制将链接视为外部链接或内部链接。
- **`prefetch`和`noPrefetch`**：控制是否为即将进入视口的链接预加载资源。
- **`prefetchedClass`**：应用于已预加载链接的类。
- **`custom`属性**：允许完全自定义链接的渲染方式和导航行为。

### 覆盖默认值

如果你希望自定义 NuxtLink 的某些行为，可以通过创建自定义组件并使用`defineNuxtLink`函数来实现。这使得你可以根据特定需求调整链接的默认设置。

示例代码：创建自定义链接组件

```vue
// components/MyNuxtLink.vue
export default defineNuxtLink({
  componentName: 'MyNuxtLink',
  externalRelAttribute: 'noopener', // 自定义外部链接的 rel 属性
  activeClass: 'my-active-class', // 自定义活动链接类
  exactActiveClass: 'my-exact-active-class', // 自定义精确活动链接类
  prefetchedClass: 'my-prefetched-class', // 自定义预加载链接类
  trailingSlash: 'remove', // 自定义尾部斜杠行为
})
```

### 完整示例：

1. **项目结构**- 你的 Nuxt.js 项目应该有以下的文件和目录结构：

```
my-nuxt-app/
├── components/
│   └── MyNuxtLink.vue
├── pages/
│   ├── index.vue
│   └── about.vue
├── nuxt.config.js
└── package.json

```

2. **创建自定义链接组件**(`components/MyNuxtLink.vue`):

```vue
<template>
  <NuxtLink
    :to="to"
    :target="target"
    :rel="rel"
    :class="{'my-active-class': isActive, 'my-exact-active-class': isExactActive}"
  >
    <slot></slot>
  </NuxtLink>
</template>

<script>
export default defineNuxtLink({
  componentName: 'MyNuxtLink',
  externalRelAttribute: 'noopener noreferrer',
  activeClass: 'my-active-class',
  exactActiveClass: 'my-exact-active-class',
  prefetchedClass: 'my-prefetched-class',
  trailingSlash: 'remove'
});
</script>

<style>
.my-active-class {
  color: red;
}

.my-exact-active-class {
  font-weight: bold;
}
</style>
```

3. **首页**(`pages/index.vue`):

```vue
<template>
  <div>
    <h1>欢迎来到首页</h1>
    <MyNuxtLink to="/about">关于页面</MyNuxtLink>
    <MyNuxtLink to="https://nuxtjs.org" target="_blank" external>访问 Nuxt.js 官网</MyNuxtLink>
  </div>
</template>

<script>
export default {
  components: {
    MyNuxtLink: () => import('~/components/MyNuxtLink.vue')
  }
}
</script>
```

4. **关于页面**(`pages/about.vue`):

```vue
<template>
  <div>
    <h1>关于我们</h1>
    <MyNuxtLink to="/">返回首页</MyNuxtLink>
  </div>
</template>

<script>
export default {
  components: {
    MyNuxtLink: () => import('~/components/MyNuxtLink.vue')
  }
}
</script>
```

5. **配置文件**(`nuxt.config.js`):

```javascript
export default {
  components: true, // 启用自动导入组件
  // 其他配置...
}

```

6. **启动项目**- 在项目根目录下运行以下命令启动开发服务器：

```
npm run dev

```

打开浏览器并访问`http://localhost:3000`，你应该能看到首页，并且可以通过自定义的 MyNuxtLink 组件导航到“关于页面”或者打开新标签页访问
Nuxt.js 官网。

## **Nuxt 3 中`<NuxtLoadingIndicator>`组件的使用指南与示例**

Nuxt Loading Indicator 是 Nuxt.js 应用程序中一个实用的组件，用于在页面加载或导航时显示加载进度条。这不仅提升用户体验，还能为用户显示应用程序正在执行的操作，从而减少不确定性。

### 如何使用 Nuxt Loading Indicator？

在 Nuxt.js 应用中，要使用 Nuxt Loading Indicator，首先需要在你的`app.vue`或任何布局文件中引入并添加此组件。以下是一个简单的示例：

```vue
<template>
  <NuxtLayout>
    <div>
      <NuxtLoadingIndicator /> <!-- 这里是加载指示器的位置 -->
      <NuxtPage />
    </div>
  </NuxtLayout>
</template>

```

### Nuxt Loading Indicator 的关键属性

1. **color**：设置进度条的颜色。默认为黑色，你可以根据需要调整颜色。
2. **height**：进度条的高度，以像素为单位。默认值为 3px。
3. **duration**：进度条显示的持续时间，以毫秒为单位。默认为 2000 毫秒。
4. **throttle**：进度条出现和隐藏的节流时间，以毫秒为单位。默认为 200 毫秒。

### 如何自定义 Nuxt Loading Indicator

Nuxt Loading Indicator 支持通过默认插槽传递自定义 HTML 或组件，允许你根据特定需求定制进度条的外观和行为。

### 示例代码

假设你想要创建一个更自定义的进度条，可以使用以下代码：

```vue
<template>
  <NuxtLayout>
    <div>
      <NuxtLoadingIndicator
        :color="customColor"
        :height="customHeight"
        :duration="customDuration"
        :throttle="customThrottle"
      >
        <!-- 自定义内容 -->
        <div class="custom-loading-text">加载中...</div>
      </NuxtLoadingIndicator>
      <NuxtPage />
    </div>
  </NuxtLayout>
</template>

<script>
export default {
  data() {
    return {
      customColor: '#FF5733', // 自定义颜色
      customHeight: 5, // 自定义高度
      customDuration: 1500, // 自定义持续时间
      customThrottle: 500, // 自定义节流时间
    };
  },
};
</script>

<style scoped>
.custom-loading-text {
  color: #fff;
  font-size: 18px;
  text-align: center;
  margin-top: 50px;
}
</style>

```

### 完整示例：

首先，假设你的 Nuxt.js 项目的结构如下：

```
my-nuxt-app/
├── layouts/
│   └── default.vue
├── pages/
│   ├── _app.vue
│   ├── index.vue
│   └── about.vue
└── app.vue

```

接下来，我们将修改`app.vue`文件以包含`NuxtLoadingIndicator`组件。

**app.vue:**

```vue
<template>
  <NuxtLayout>
    <NuxtLoadingIndicator
      color="#673AB7"
      :height="5"
      :duration="3000"
      :throttle="500"
    />
    <div>
      <NuxtPage />
    </div>
  </NuxtLayout>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
/* 这里可以添加一些全局样式 */
</style>

```

在这个例子中，我们为`NuxtLoadingIndicator`设置了一些自定义属性：

- `color`设置为`#673AB7`，这是一个紫色的颜色代码。
- `height`设置为`5`像素，使进度条更厚一些。
- `duration`设置为`3000`毫秒，即进度条完成一次加载动画需要 3 秒。
- `throttle`设置为`500`毫秒，这是进度条显示和隐藏之间的最小间隔时间。

接下来，我们可以创建一个简单的布局文件`layouts/default.vue`，它将用于包裹页面内容。

**layouts/default.vue:**

```vue
<template>
  <div>
    <slot />
  </div>
</template>

<script>
export default {
  name: 'DefaultLayout',
};
</script>

<style>
/* 这里可以添加一些布局样式 */
</style>

```

现在，让我们创建两个页面`index.vue`和`about.vue`。

**pages/index.vue:**

```vue
<template>
  <div>
    <h1>首页</h1>
    <p>欢迎来到首页！</p>
  </div>
</template>

<script>
export default {
  name: 'IndexPage',
};
</script>

<style>
/* 这里可以添加一些页面样式 */
</style>

```

**pages/about.vue:**

```vue
<template>
  <div>
    <h1>关于我们</h1>
    <p>这是关于我们页面的内容。</p>
  </div>
</template>

<script>
export default {
  name: 'AboutPage',
};
</script>

<style>
/* 这里可以添加一些页面样式 */
</style>

```

最后，确保在`nuxt.config.ts`或`nuxt.config.js`文件中，你已经启用了布局和页面：

```javascript
// nuxt.config.ts 或 nuxt.config.js
export default {
  // ...
  components: true, // 确保启用了自动导入组件
  // ...
};

```

现在，你可以启动你的 Nuxt.js
应用程序，并在页面导航之间看到一个自定义的进度条。当你从一个页面导航到另一个页面时，`NuxtLoadingIndicator`将显示进度条，为用户提供视觉反馈。


## 往期文章归档：

- [Nuxt框架中内置组件详解及使用指南（二） | cmdragon's Blog](https://blog.cmdragon.cn/posts/658c8df0cd7e59fe7606507b14b2c37c/)
- [Nuxt框架中内置组件详解及使用指南（一） | cmdragon's Blog](https://blog.cmdragon.cn/posts/214c7ef07a7b90e1787f10ea626320e3/)
- [Nuxt3 的生命周期和钩子函数（十一） | cmdragon's Blog](https://blog.cmdragon.cn/posts/4807b70f6729c39ff090d7e8ac1e2f6d/)
- [Nuxt3 的生命周期和钩子函数（十） | cmdragon's Blog](https://blog.cmdragon.cn/posts/df209e19c18baa3bc7e0ebfa473099d8/)
- [Nuxt3 的生命周期和钩子函数（九） | cmdragon's Blog](https://blog.cmdragon.cn/2024-07-02/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E4%B9%9D%EF%BC%89%20/)
- [Nuxt3 的生命周期和钩子函数（八） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-29/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E5%85%AB%EF%BC%89%20/)
- [Nuxt3 的生命周期和钩子函数（七） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-29/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E4%B8%83%EF%BC%89/)
- [Nuxt3 的生命周期和钩子函数（六） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-29/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E5%85%AD%EF%BC%89/)
- [Nuxt3 的生命周期和钩子函数（五） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-28/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E4%BA%94%EF%BC%89/)
- [Nuxt3 的生命周期和钩子函数（四） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-27/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E5%9B%9B%EF%BC%89/)
- [Nuxt3 的生命周期和钩子函数（三） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-26/front_end/%20nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E4%B8%89%EF%BC%89/#%E5%BE%80%E6%9C%9F%E6%96%87%E7%AB%A0%E5%BD%92%E6%A1%A3%EF%BC%9A)
- [Nuxt3 的生命周期和钩子函数（二） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-25/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E4%BA%8C%EF%BC%89/)
- [Nuxt3 的生命周期和钩子函数（一） | cmdragon’s Blog](https://blog.cmdragon.cn/2024-06-24/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E4%B8%80%EF%BC%89/)
- [初学者必读：如何使用 Nuxt 中间件简化网站开发 | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-23/front_end/%E5%88%9D%E5%AD%A6%E8%80%85%E5%BF%85%E8%AF%BB%EF%BC%9A%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8%20nuxt%20%20%E4%B8%AD%E9%97%B4%E4%BB%B6%E7%AE%80%E5%8C%96%E7%BD%91%E7%AB%99%E5%BC%80%E5%8F%91/)
- 


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
