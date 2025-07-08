---
url: /posts/ddb1976c3f6b7b52a03dd0c383e9a790/
title: useCookie函数：管理SSR环境下的Cookie
date: 2024-07-13T00:18:53+08:00
updated: 2024-07-13T00:18:53+08:00
author: cmdragon

summary:
  摘要：本文详述了useCookie函数在服务器端渲染(SSR)中的应用，包括读写Cookie、配置选项如maxAge、expires、httpOnly、secure、domain、path及SameSite，并提供了encode、decode、default、watch等高级用法示例，以及如何在API路由中操作Cookie。

categories:
  - 前端开发

tags:
  - nuxt
  - SSR
  - Cookies
  - HTTP
  - 安全
  - 编程
  - 前端
---

<img src="/images/2024_07_13 16_23_21.png" title="2024_07_13 16_23_21.png" alt="2024_07_13 16_23_21.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

`useCookie` 是一个在服务器端渲染（SSR）环境中管理 Cookie 的工具函数。它允许开发者在页面、组件或插件中读取和写入 Cookie。这个函数通过创建一个响应式引用（ref）来管理 Cookie 的值，并自动将 Cookie 的值序列化和反序列化为 JSON 格式，以确保在不同环境（如浏览器和服务器）之间的一致性。

## 基本用法

`useCookie` 函数接受两个参数：

1. **name**：这是一个字符串，用于标识特定的 Cookie。
2. **options**：这是一个对象，包含了用于配置 Cookie 的选项。


## 简单示例

下面的示例创建了一个名为`counter`的cookie。如果该cookie不存在，它将被初始设置为一个随机值。每当我们更新`counter`变量时，cookie也会相应地更新。

app.vue

```
<script setup>
const counter = useCookie('counter')

counter.value = counter.value || Math.round(Math.random() * 1000)
</script>

<template>
  <div>
    <h1>计数器: {{ counter || '-' }}</h1>
    <button @click="counter = null">重置</button>
    <button @click="counter--">减少</button>
    <button @click="counter++">增加</button>
  </div>
</template>
```
## options选项

### `maxAge` / `expires`

#### `maxAge`

-   **用途**：`maxAge` 用于指定cookie在客户端存储的时间长度（以秒为单位）。
-   **优先级**：当 `maxAge` 和 `expires` 同时设置时，`maxAge` 优先。这意味着如果设置了 `maxAge`，则不会使用 `expires`。
-   **客户端行为**：如果设置了 `maxAge`，cookie将在服务器设置的时间后过期，即使浏览器关闭也会保留。
-   **示例**：`Set-Cookie: mycookie=123; max-age=3600;`

#### `expires`

-   **用途**：`expires` 用于指定cookie的过期时间，它是一个特定的日期和时间，格式为 `Wdy, DD-Mon-YYYY HH:MM:SS GMT`。
-   **客户端行为**：如果设置了 `expires`，cookie将在这个日期和时间后过期，无论浏览器是否关闭。
-   **示例**：`Set-Cookie: mycookie=123; expires=Thu, 01 Dec 2023 12:00:00 GMT;`

#### 同时设置 `maxAge` 和 `expires`

-   **规范**：根据cookie存储模型规范，如果同时设置了 `maxAge` 和 `expires`，则 `maxAge` 应该优先。
-   **兼容性**：尽管规范如此，但并非所有客户端都会严格遵循这一规定。因此，如果需要确保cookie的过期行为一致，应该在服务器端只设置一个。
-   **示例**：如果需要同时设置，确保它们指向相同的日期和时间。

#### 默认行为

-   **无设置**：如果没有设置 `maxAge` 和 `expires`，cookie将仅在会话期间存在，这意味着一旦用户关闭浏览器，cookie将被删除。

#### 实际应用

在实际应用中，通常建议只使用 `maxAge` 或 `expires` 中的一个，以避免潜在的不一致性和兼容性问题。如果需要cookie在用户关闭浏览器后仍然存在，可以使用 `maxAge`。如果需要cookie在特定日期和时间后过期，则使用 `expires`。

以下是一个使用 `maxAge` 和 `expires` 的示例：

```
// 使用 maxAge
res.setHeader('Set-Cookie', 'mycookie=123; max-age=3600;');

// 使用 expires
res.setHeader('Set-Cookie', 'mycookie=123; expires=Thu, 01 Dec 2023 12:00:00 GMT;');
```

### `httpOnly`

`httpOnly` 是一个用于设置cookie属性的布尔值，它的主要目的是增强Web应用程序的安全性。

#### `httpOnly` 属性的用途

-   **用途**：当 `httpOnly` 设置为 `true` 时，它会指示浏览器不允许通过JavaScript的 `document.cookie` API访问该cookie。这意味着，即使cookie存储在用户的浏览器中，也无法通过客户端脚本（如JavaScript）读取它。
-   **安全性**：这个属性可以防止跨站脚本攻击（XSS），因为即使攻击者通过脚本注入攻击控制了用户的会话，他们也无法通过脚本获取到设置了 `httpOnly` 的cookie。

#### 设置 `httpOnly`

-   **值**：`httpOnly` 可以是 `true` 或 `false`。如果是 `true`，则设置HttpOnly属性；如果是 `false` 或未设置，则不设置HttpOnly属性。
-   **默认值**：默认情况下，`httpOnly` 属性是不设置的。

#### 实际应用

在实际应用中，建议对所有涉及身份验证、敏感信息的cookie设置 `httpOnly` 属性。例如，对于存储用户会话ID的cookie，应该始终设置 `httpOnly`。

以下是如何在设置cookie时使用 `httpOnly` 属性的示例：

```
// 设置 httpOnly 为 true
res.setHeader('Set-Cookie', 'sessionToken=abc123; httpOnly;');

// 在某些服务器框架中，可能需要这样设置
// res.cookie('sessionToken', 'abc123', { httpOnly: true });

```

#### 注意事项

-   当 `httpOnly` 设置为 `true` 时，请确保您的JavaScript代码中不要尝试通过 `document.cookie` 访问该cookie，因为这会导致错误。
-   由于 `httpOnly` cookie不能通过客户端脚本访问，因此如果您需要在客户端脚本中使用这些cookie（例如，用于客户端逻辑或显示），则需要考虑其他方法来安全地传输所需的信息。

通过使用 `httpOnly`，您可以显著提高应用程序的安全性，减少XSS攻击的风险。

### `secure`

`secure` 是另一个用于设置cookie属性的布尔值，它的目的是确保cookie仅通过安全的HTTPS连接发送到服务器。下面是关于 `secure` 属性的详细信息：

#### `secure` 属性的用途

-   **用途**：当 `secure` 设置为 `true` 时，cookie将只通过HTTPS连接发送。这意味着如果浏览器尝试通过不安全的HTTP连接发送设置了 `secure` 属性的cookie，浏览器会忽略这个cookie，并且不会将其发送到服务器。
-   **安全性**：这个属性有助于防止中间人攻击，因为它确保了cookie在客户端和服务器之间传输时的加密。

#### 设置 `secure`

-   **值**：`secure` 可以是 `true` 或 `false`。如果是 `true`，则设置Secure属性；如果是 `false` 或未设置，则不设置Secure属性。
-   **默认值**：默认情况下，`secure` 属性是不设置的。

#### 实际应用

在实际应用中，对于包含敏感信息的cookie，如会话cookie，通常建议设置 `secure` 属性为 `true`。

以下是如何在设置cookie时使用 `secure` 属性的示例：

```
// 设置 secure 为 true
res.setHeader('Set-Cookie', 'sessionToken=abc123; secure;');

```

#### 注意事项

-   **HTTPS连接**：当 `secure` 设置为 `true` 时，如果网站没有启用HTTPS，那么设置了 `secure` 属性的cookie不会被发送到服务器。这可能导致用户在浏览器中看到“无法连接到服务器”的错误消息，或者在某些情况下，可能导致所谓的“hydration错误”，即服务器无法识别客户端发送的cookie。
-   **混合内容**：如果网站中包含一些通过HTTP加载的静态资源（如图片、CSS、JavaScript文件），并且设置了 `secure` 属性的cookie，那么这些资源可能会因为浏览器尝试发送安全的cookie而不被正确加载。
-   **兼容性**：大多数现代浏览器都支持 `secure` 属性，但在某些旧版浏览器中可能不支持。

### `domain` 

`domain` 属性在设置 `Set-Cookie` 的时候用于指定 cookie 的作用域。这个属性允许你定义 cookie 可以被哪些子域名或顶级域访问。默认情况下，cookie 只在当前请求的域内有效。

#### `domain` 属性的用途

-   **定义作用域**：`domain` 属性允许你指定 cookie 的作用域，使得 cookie 可以在指定的域及其所有子域下被访问。
-   **跨域共享**：通过设置 `domain` 属性，可以让 cookie 跨越多个子域共享，这对于需要在不同子域间共享状态信息的网站特别有用。

#### 实际应用

以下是如何在设置 cookie 时使用 `domain` 属性的示例：

```
// 设置 domain 为 'example.com'
res.setHeader('Set-Cookie', 'sessionToken=abc123; domain=example.com;');

```

#### 注意事项

1. **子域兼容性**：确保所有子域都支持相同的 `domain` 值。如果不兼容，可能会导致 cookie 不被正确设置或访问。
2. **安全性**：设置 `domain` 为顶级域（如 `.example.com`）可以增加安全性，因为这限制了 cookie 的访问范围。然而，这也会限制了跨子域的 cookie 使用。
3. **浏览器兼容性**：大多数现代浏览器都支持 `domain` 属性，但在一些旧版浏览器中可能不支持。

#### 示例

假设你有一个包含多个子域的网站，例如 `www.example.com`、`sub.example.com` 和 `api.example.com`。如果你想让一个 cookie 能在所有这些子域下被访问，你可以设置 `domain` 为 `example.com`：

```
res.setHeader('Set-Cookie', 'sessionToken=abc123; domain=example.com;');

```

这样设置后，`sessionToken` 将在 `www.example.com`、`sub.example.com` 和 `api.example.com` 下都能被访问。

### `path` 

`path` 属性在设置 `Set-Cookie` 的时候用于指定 cookie 的有效路径。这个属性允许你定义 cookie 可以被哪些路径下的请求访问。默认情况下，路径被设置为当前请求的路径。

#### `path` 属性的用途

-   **定义有效路径**：`path` 属性允许你指定 cookie 的有效路径，使得 cookie 只能在指定的路径及其子路径下被访问。
-   **路径限制**：通过设置 `path` 属性，可以限制 cookie 的使用范围，从而提高安全性。

#### 实际应用

以下是如何在设置 cookie 时使用 `path` 属性的示例：

```
// 设置 path 为 '/admin'
res.setHeader('Set-Cookie', 'sessionToken=abc123; path=/admin;');

```

#### 注意事项

1. **路径匹配**：路径是前缀匹配的，所以设置 `path=/admin` 意味着 cookie 在 `/admin`、`/admin/settings` 等路径下都有效。
2. **默认路径**：如果没有指定 `path` 属性，默认路径是当前请求的路径。例如，如果请求的路径是 `/user/profile`，那么默认路径就是 `/user/profile`。
3. **安全性**：通过设置 `path` 属性，可以限制 cookie 的使用范围，从而提高安全性。例如，将 cookie 限制在 `/admin` 路径下，可以防止它在其他非管理区域被访问。

#### 示例

假设你有一个网站，其中 `/admin` 路径下的内容需要特殊的 cookie 来验证用户权限。你可以设置 `path` 为 `/admin`：

```
res.setHeader('Set-Cookie', 'adminToken=xyz789; path=/admin;');

```

这样设置后，`adminToken` 只能在 `/admin` 及其子路径（如 `/admin/settings`）下被访问。

### `SameSite`

`SameSite` 属性是用于控制 `Cookie` 在跨站点请求中的行为的一个重要属性。

以下是对不同 `SameSite` 值的详细解释：

1. `true`：将 `SameSite` 属性设置为 `Strict` 。这意味着 `Cookie` 在跨站点请求中（包括从链接点击和表单提交）将不会被发送，只有在当前网站的请求中才会发送。
2. `false`：不设置 `SameSite` 属性，浏览器将根据其默认策略处理 `Cookie` 的跨站点行为。
3. `'lax'`：将 `SameSite` 属性设置为 `Lax` 。在这种模式下，从第三方网站链接到目标网站的 GET 请求会携带 `Cookie` ，但其他跨站请求（如表单提交）不会携带。
4. `'none'`：将 `SameSite` 属性设置为 `None` 。这表示 `Cookie` 可以在跨站点请求中被发送，但需要同时设置 `Secure` 属性（即只能通过 HTTPS 协议发送）以增强安全性。
5. `'strict'`：与 `true` 效果相同，将 `SameSite` 属性设置为 `Strict` ，严格限制跨站点携带 `Cookie` 。

在实际应用中，选择合适的 `SameSite` 值取决于您的网站需求和安全策略。例如，如果您的网站对跨站点请求中的 `Cookie` 传递有严格限制，可以选择 `Strict` ；如果希望在某些情况下允许跨站携带 `Cookie` ，可以选择 `Lax` 或 `None` ，但要注意相应的安全设置。



### `  encode `和`decode`

指定一个函数，用于编码cookie的值。由于cookie的值具有有限的字符集（必须是简单字符串），因此此函数可用于将一个值编码为适合cookie值的字符串。默认的编码器使用了`JSON.stringify`来将对象转换成JSON字符串，然后使用`encodeURIComponent`来确保字符串符合cookie的字符集限制。下面是一个自定义编码器的示例，它遵循了默认编码器的逻辑：

```
// 自定义编码器函数
function encodeCookieValue(value) {
  // 将对象转换为JSON字符串
  const jsonString = JSON.stringify(value);
  // 使用encodeURIComponent对字符串进行编码
  return encodeURIComponent(jsonString);
}

// 使用自定义编码器的useCookie方法
function useCustomEncodedCookie(cookieName) {
  const cookie = useCookie(cookieName, {
    // 设置编码器函数
    encode: encodeCookieValue,
    // 如果需要也可以设置解码器函数，这里假设使用JSON.parse来解码
    decode: (encodedValue) => JSON.parse(decodeURIComponent(encodedValue))
  });

  return cookie;
}
```


### `default`

指定一个返回cookie的默认值的函数。该函数还可以返回一个`Ref`。



### `watch`

指定一个`boolean`或`string`值，用于[监听](https://vuejs.org/api/reactivity-core.html#watch)cookie的ref数据。

-   `true` - 将监听cookie的ref数据变化以及其嵌套属性（默认）。
-   `shallow` - 只监听cookie的ref数据的顶级属性变化。
-   `false` - 不监听cookie的ref数据变化。

**示例1：**

```
<script setup lang="ts">
/**
 * 使用 useCookie 插件来管理 userInfo cookie。
 * 
 * 使用 useCookie 函数来获取和操作名为 userInfo 的 cookie。
 * 这里设置了默认值为一个对象，其中 score 初始值为 -1。
 * 并且通过设置 watch 为 false，禁止对 cookie 的自动监听和更新。
 * 这种方式有利于控制 cookie 的更新时机，避免不必要的性能开销。
 */
const user = useCookie(
  'userInfo',
  {
    default: () => ({ score: -1 }),
    watch: false
  }
)

/**
 * 如果 user 存在且不为 null，则增加 user 的 score 值。
 * 
 * 这段代码检查 user 的值是否存在，以确保在增加 score 前 user 是有效的。
 * 增加 score 的操作表明用户可能进行了一些操作，导致分数增加。
 * 注意，这里的操作不会自动更新 cookie，因为 watch 被设置为 false。
 */
if (user.value && user.value !== null) {
  user.value.score++; // userInfo cookie不会随此更改而更新
}
</script>

<template>
  <div>用户分数: {{ user?.score }}</div>
</template>

```

**示例2：**

```
 模板
<script setup lang="ts">
/**
 * 使用 useCookie 自定义指令来管理名为 'list' 的 Cookie。
 * 默认情况下，如果 Cookie 不存在，则返回一个空数组。
 * 使用 'shallow' 观察者模式来监听 Cookie 的变化。
 */
const list = useCookie(
  'list',
  {
    default: () => [],
    watch: 'shallow'
  }
)

/**
 * 添加一个随机数到列表中。
 * 通过调用 list.value?.push 方法向列表中添加一个计算得到的随机数。
 * 注意：此操作不会直接触发 Cookie 的更新。
 */
function add() {
  list.value?.push(Math.round(Math.random() * 1000))
  // list cookie不会随此更改而更新
}

/**
 * 保存当前列表到 Cookie。
 * 首先，通过创建 list.value 的浅拷贝来确保操作的原子性。
 * 然后，更新 list.value 以触发 Cookie 的更新。
 */
function save() {
  if (list.value && list.value !== null) {
    list.value = [...list.value]
    // list cookie随此更改而更新
  }
}
</script>

<template>
  <div>
    <h1>列表</h1>
    <pre>{{ list }}</pre>
    <button @click="add">添加</button>
    <button @click="save">保存</button>
  </div>
</template>

```


###  API路由中的Cookies
你可以使用[`h3`](https://github.com/unjs/h3)包中的`getCookie`和`setCookie`来在服务端API路由中设置cookie。

server/api/counter.ts

```
export default defineEventHandler(event => {
  // 读取counter cookie
  let counter = getCookie(event, 'counter') || 0

   // 将counter cookie增加1
  setCookie(event, 'counter', ++counter)

  // 发送JSON响应
  return { counter }
})
```

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：


## 往期文章归档：

- [轻松掌握useAsyncData获取异步数据 | cmdragon's Blog](https://blog.cmdragon.cn/posts/e1b1c62b5975f8ebfa61adc507591cf7/)
- [使用 `useAppConfig` ：轻松管理应用配置 | cmdragon's Blog](https://blog.cmdragon.cn/posts/9e044d4b53eab6a1bec49bb86b4c856c/)
- [Nuxt框架中内置组件详解及使用指南（五） | cmdragon's Blog](https://blog.cmdragon.cn/posts/ff42c6a570627402dbbdd82adbb2ed2a/)
- [Nuxt框架中内置组件详解及使用指南（四） | cmdragon's Blog](https://blog.cmdragon.cn/posts/9032c61e840462c63717de392173b4f5/)
- [Nuxt框架中内置组件详解及使用指南（三） | cmdragon's Blog](https://blog.cmdragon.cn/posts/7ef2264218c32c7cf7f16dfa7cabd2ce/)
- [Nuxt框架中内置组件详解及使用指南（二） | cmdragon's Blog](https://blog.cmdragon.cn/posts/658c8df0cd7e59fe7606507b14b2c37c/)
- [Nuxt框架中内置组件详解及使用指南（一） | cmdragon's Blog](https://blog.cmdragon.cn/posts/214c7ef07a7b90e1787f10ea626320e3/)
- [Nuxt3 的生命周期和钩子函数（十一） | cmdragon's Blog](https://blog.cmdragon.cn/posts/4807b70f6729c39ff090d7e8ac1e2f6d/)
- [Nuxt3 的生命周期和钩子函数（十） | cmdragon's Blog](https://blog.cmdragon.cn/posts/df209e19c18baa3bc7e0ebfa473099d8/)
- [Nuxt3 的生命周期和钩子函数（九） | cmdragon's Blog](https://blog.cmdragon.cn/2024-07-02/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E4%B9%9D%EF%BC%89%20/)
- [Nuxt3 的生命周期和钩子函数（八） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-29/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E5%85%AB%EF%BC%89%20/)
- [Nuxt3 的生命周期和钩子函数（七） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-29/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E4%B8%83%EF%BC%89/)
- [Nuxt3 的生命周期和钩子函数（六） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-29/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E5%85%AD%EF%BC%89/)
- [Nuxt3 的生命周期和钩子函数（五） | cmdragon's Blog](https://blog.cmdragon.cn/2024-06-28/front_end/nuxt3%20%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%92%8C%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0%EF%BC%88%E4%BA%94%EF%BC%89/)
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
