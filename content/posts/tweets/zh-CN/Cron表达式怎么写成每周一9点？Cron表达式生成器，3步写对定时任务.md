---
url: /posts/cron-expression-generator-guide-2026/
title: Cron表达式怎么写成每周一9点？Cron表达式生成器，3步写对定时任务
date: 2026-09-10T00:00:00+08:00
lastmod: 2026-09-10T00:00:00+08:00
author: cmdragon

summary: Cron表达式最容易错在两处：字段顺序搞混，以及"日"和"周"同时指定时的或关系。标准5段格式为分、时、日、月、周，部分平台还有第6段（秒或年），字段数不同表达式就不通用。3步：先确定执行平台与时区，再用生成器拼表达式并核对接下来几次执行时间，最后用时间工具验证首次触发点。

categories:
  - tweets

tags:
  - 免费工具
  - Cron表达式
  - 定时任务
  - 时间工具箱
  - 开发工具
---

> **立即体验**：[Cron表达式 - 免费在线工具](https://tools.cmdragon.cn/zh/apps/cron-expression-generator) | [时间工具箱 - 免费在线工具](https://tools.cmdragon.cn/zh/apps/time-toolkit) | [更多1000+免费工具](https://tools.cmdragon.cn/zh/apps?category=trending)
>
> 无需下载安装，打开浏览器即用，完全免费！

扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

## 为什么我写的 Cron 就是不执行？

**先给结论**：Cron 表达式写错，绝大多数栽在两个地方——**字段顺序搞混**，以及**"日"和"周"同时指定时的"或"关系**。标准 5 段格式是`分 时 日 月 周`，但不同平台字段数并不一致（有的多一个"秒"，有的多一个"年"），**字段数不同，表达式就不通用**。最可靠的做法是：先明确执行平台与时区，再用 [Cron表达式](https://tools.cmdragon.cn/zh/apps/cron-expression-generator) 拼好后核对"接下来几次执行时间"，确认与预期一致再上线。

举例："每周一 9 点"在标准 5 段 cron 里写作 `0 9 * * 1`。注意第一位是**分钟**，写成 `9 0 * * 1` 就变成了"周一 0 点 09 分"。

## 5 个字段各是什么，有哪些常用符号？

| 字段位置 | 含义 | 取值范围 | 示例 |
|----------|------|----------|------|
| 第 1 段 | 分钟 | 0-59 | `0` 表示整点 |
| 第 2 段 | 小时 | 0-23 | `9` 表示上午 9 点 |
| 第 3 段 | 日 | 1-31 | `1` 表示每月 1 号 |
| 第 4 段 | 月 | 1-12 或 JAN-DEC | `*` 表示每月 |
| 第 5 段 | 周 | 0-7（0 和 7 均为周日） | `1` 表示周一 |

| 符号 | 含义 | 示例 |
|------|------|------|
| `*` | 每一单位 | `* * * * *` 每分钟 |
| `,` | 列举 | `0 9,18 * * *` 每天 9 点和 18 点 |
| `-` | 区间 | `0 9-18 * * *` 9 点到 18 点整点 |
| `/` | 步长 | `*/10 * * * *` 每 10 分钟 |
| `?` | 不指定（部分平台支持） | 用于避免"日/周"冲突 |

一句话理解：**"日"和"周"同时给了具体值，多数实现按"或"处理**——`0 9 1 * 1` 不是"每月 1 号且是周一"，而是"每月 1 号**或**每周一"都会执行。想限定两者之一，另一个字段要用 `?`（若平台支持）或改用脚本内判断。

## 3步写对一条 Cron 表达式

👉 [立即体验 Cron表达式](https://tools.cmdragon.cn/zh/apps/cron-expression-generator) ｜ [时间工具箱](https://tools.cmdragon.cn/zh/apps/time-toolkit)

### 3步从"想要的时间"到"确认会执行"

1. **定平台与时区**：先确认运行环境（Linux crontab、Quartz、Kubernetes CronJob 等）的字段数与星期起始，以及执行用的是 UTC 还是本地时区
2. **拼表达式并核对**：在 [Cron表达式](https://tools.cmdragon.cn/zh/apps/cron-expression-generator) 中选择时间规则，生成表达式后**查看接下来 5 次执行时间**，逐条与预期比对
3. **验证首次触发点**：用 [时间工具箱](https://tools.cmdragon.cn/zh/apps/time-toolkit) 或 [时间戳转换](https://tools.cmdragon.cn/zh/apps/timestamp-converter) 换算成具体日期时间，确认第一次触发不在业务高峰期

| 环节 | 用什么工具 | 解决什么 |
|------|------------|----------|
| 拼表达式 | [Cron表达式](https://tools.cmdragon.cn/zh/apps/cron-expression-generator) | 可视化生成与预演 |
| 算日期差 | [时间工具箱](https://tools.cmdragon.cn/zh/apps/time-toolkit) | 日期与间隔计算 |
| 对时区 | [时间戳转换](https://tools.cmdragon.cn/zh/apps/timestamp-converter) | 时间戳与时区换算 |
| 记规则 | [Markdown编辑器](https://tools.cmdragon.cn/zh/apps/markdown-editor) | 记录任务与负责人 |

三条实用提醒：

- **时区是第一坑**：服务器跑 UTC、你按本地时间写，任务就会在"错误的时间"准时执行。上线前务必用时间戳工具换算确认
- **月末日期要小心**：`0 9 31 * *` 在没有 31 号的月份不会执行，也不会顺延；需要"每月最后一天"要用平台支持的关键字（如 `L`）或改在脚本里判断
- **先预演再上线**：生成后看"接下来 5 次执行时间"是最省事的验证方式，能在几秒内发现字段顺序错位

任务多了以后，建议用 [Markdown编辑器](https://tools.cmdragon.cn/zh/apps/markdown-editor) 维护一份"表达式 — 含义 — 时区 — 负责人"清单，交接和排查时能省下大量时间。

## 更多免费工具推荐

写 Cron 之外，这些工具也能帮上忙。

- [Cron表达式](https://tools.cmdragon.cn/zh/apps/cron-expression-generator) - 可视化生成与预演
- [时间工具箱](https://tools.cmdragon.cn/zh/apps/time-toolkit) - 日期差与间隔计算
- [时间戳转换](https://tools.cmdragon.cn/zh/apps/timestamp-converter) - 时区与时间戳换算
- [Markdown编辑器](https://tools.cmdragon.cn/zh/apps/markdown-editor) - 维护任务清单
- [JSON可视化](https://tools.cmdragon.cn/zh/apps/json-visualizer) - 查看任务配置

[cmdragon工具站](https://tools.cmdragon.cn/zh) 上有**1000+免费在线工具**，不用下载安装，打开网页就能用，全部免费！

👉 [发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=trending)

## 常见问题解答

**"每周一9点"该怎么写？**

标准 5 段写成 `0 9 * * 1`。第一位是分钟、第二位是小时，写反就变成"0 点 09 分"。若平台为 6 段（含秒），则写作 `0 0 9 * * 1`，以平台字段说明为准。

**"日"和"周"一起写会怎样？**

多数实现按"或"处理：`0 9 1 * 1` 会在每月 1 号**和**每个周一都执行。只想取其中一个时，另一个字段用 `?`（若平台支持），或在脚本内加判断。

**为什么任务在错误的时间执行了？**

最常见是时区不一致：系统按 UTC 解析，而你按本地时间编写。用时间戳转换工具把预期时间换算成服务器时区，再核对一次。

**每月最后一天怎么表示？**

部分平台支持 `L` 关键字，标准是 `0 9 L * *`，但并非所有实现都支持。不支持时可写每天执行、由脚本判断是否为月末。

**`*/10` 是从整点开始算吗？**

`*/10 * * * *` 表示每小时的 0、10、20、30、40、50 分执行，不是"从任务启动起每 10 分钟"，起点固定在小时边界。

**Kubernetes CronJob 的写法一样吗？**

Kubernetes 使用 5 段格式，与标准 crontab 一致，但时区需通过 `timeZone` 字段显式指定（否则按控制器时区）。字段数与带秒的实现（如 Quartz）不同，不能直接照搬。

---

**最后总结**：

写对 Cron 的关键是**先定平台与时区，再拼表达式，最后看预演结果**：用 [Cron表达式](https://tools.cmdragon.cn/zh/apps/cron-expression-generator) 生成后一定要核对"接下来几次执行时间"，并用 [时间戳转换](https://tools.cmdragon.cn/zh/apps/timestamp-converter) 确认首次触发点。**两个高频坑：字段顺序写反（分/时颠倒）、"日"与"周"同时指定时的"或"关系。**

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：[Cron表达式怎么写成每周一9点？Cron表达式生成器，3步写对定时任务](https://blog.cmdragon.cn/posts/cron-expression-generator-guide-2026/)

<details>
<summary>往期文章归档</summary>

- [Vue 3 静态与动态 Props 如何传递？TypeScript 类型约束有何必要？](https://blog.cmdragon.cn/posts/94ab48753b64780ca3ab7a7115ae8522/)
- [Vue 3中组件局部注册的优势与实现方式如何？](https://blog.cmdragon.cn/posts/dbf576e744870f6de26fd8a2e03e47da/)
- [如何在Vue3中优化生命周期钩子性能并规避常见陷阱？](https://blog.cmdragon.cn/posts/12d98b3b9ccd6c19a1b169d720ac5c80/)

</details>

<details>
<summary>免费好用的热门在线工具</summary>

- [Cron表达式 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/cron-expression-generator)
- [时间工具箱 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/time-toolkit)
- [时间戳转换 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/timestamp-converter)
- [CMDragon 在线工具 - 高级AI工具箱与开发者套件 | 免费好用的在线工具](https://tools.cmdragon.cn/zh)
- [应用商店 - 发现1000+提升效率与开发的AI工具和实用程序 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps?category=trending)

</details>
