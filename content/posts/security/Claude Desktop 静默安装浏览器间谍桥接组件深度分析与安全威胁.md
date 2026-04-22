---
url: /posts/anthropic-claude-desktop-spyware-bridge-analysis/
title: Anthropic Claude Desktop 静默安装浏览器间谍桥接组件深度分析
date: 2026-04-21
lastmod: 2026-04-21
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/b871c6e44cda4e71ae8bb85ce7475577~tplv-5jbd59dj06-image.png

summary: 安全研究员发现 Anthropic Claude Desktop 应用在未告知用户的情况下，向 7 款主流 Chromium 浏览器静默注册 Native Messaging 桥接组件。该组件以用户权限运行于浏览器沙箱之外，具备完整的浏览器自动化能力，引发严重的安全与隐私争议。本文深入剖析技术细节、攻击面扩大风险、合规问题及防御策略。

categories:
  - security

tags:
  - AI 安全
  - Claude Desktop
  - 隐私泄露
  - Native Messaging
  - 浏览器安全
  - 供应链攻击
  - 零信任
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/b871c6e44cda4e71ae8bb85ce7475577~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

扫描 [二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg) 关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现 1000+ 提升效率与开发的 AI 工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 一、事件概述：AI 巨头的"暗门"操作

2026 年 4 月，安全研究员 Alexander Hanff 在其个人博客发表了一篇引发全球关注的技术分析文章，揭露 Anthropic 公司在其桌面应用 Claude Desktop 中，未经用户同意、未作任何说明的情况下，静默向用户设备上的 7 款主流 Chromium 浏览器注册了 Native Messaging 桥接组件（Native Messaging Host Manifest）。

该桥接组件一旦激活，可赋予 AI 代理完整的浏览器自动化能力，包括读取用户已登录的银行账户、填写表单、截取屏幕、提取 DOM 数据等敏感操作。更令人震惊的是，这些文件不仅写入用户已安装的浏览器，甚至预先注册到未安装的浏览器目录中，且每次启动 Claude Desktop 都会自动重建被删除的桥接文件。

该事件迅速在安全社区引发轩然大波，涉及 AI 安全边界、用户隐私权、软件供应链信任模型等多重核心议题。

## 二、Native Messaging 技术原理与桥接机制

### 2.1 什么是 Native Messaging？

Native Messaging 是 Chromium 浏览器提供的一种机制，允许浏览器扩展与本地机器上的可执行程序进行通信。其核心设计目的是为浏览器扩展提供超越沙箱限制的系统级能力。

**工作流程：**

```mermaid
graph LR
    A[浏览器扩展] -->|调用 connectNative| B[浏览器内核]
    B -->|读取 Manifest 文件| C[获取本地程序路径]
    C -->|启动进程| D[Native Host 二进制]
    D -->|stdio 通信| A
```

**Manifest 文件示例（被发现的桥接配置）：**

```json
{
  "name": "com.anthropic.claude_browser_extension",
  "description": "Claude Browser Extension Native Host",
  "path": "/Applications/Claude.app/Contents/Helpers/chrome-native-host",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://dihbgbndebgnbjfmelmegjepbnkhlgni/",
    "chrome-extension://fcoeoabgfenejglbffodgkkbkcdhcgfn/",
    "chrome-extension://dngcpimnedloihjnnfngkgjoidhnaolf/"
  ]
}
```

**关键参数解析：**

| 参数              | 含义                    | 安全风险                                    |
| ----------------- | ----------------------- | ------------------------------------------- |
| `path`            | 本地二进制程序路径      | 指向 Claude.app 内置的 `chrome-native-host` |
| `allowed_origins` | 允许调用此桥接的扩展 ID | 预授权 3 个 Anthropic 扩展 ID               |
| `type: stdio`     | 通信方式为标准输入输出  | 绕过网络沙箱限制                            |

### 2.2 桥接能力的官方文档描述

Anthropic 在官方文档中明确列出了桥接激活后的能力：

- **标签页控制**：Claude 可打开新标签页并共享浏览器登录状态
- **实时调试**：直接读取控制台错误和 DOM 状态
- **数据提取**：从网页提取结构化信息并保存到本地
- **任务自动化**：自动化表单填写、数据录入等重复操作
- **会话录制**：将浏览器交互录制为 GIF

这些能力意味着：如果用户打开了银行页面、税务系统、健康门户或生产环境管理控制台，桥接程序可以以用户身份直接读取和操作这些敏感系统。

## 三、深度技术分析：静默安装的证据链

### 3.1 跨浏览器大规模注册

研究员在 macOS 系统上执行全面审计，发现 Claude Desktop 向以下 7 款浏览器目录写入了桥接清单文件：

1. Google Chrome
2. Microsoft Edge
3. Brave Browser
4. Chromium
5. Arc
6. Vivaldi
7. Opera

**关键发现：**

```bash
# 执行命令：查找所有 Anthropic 桥接清单文件
find ~/Library/Application\ Support -name "com.anthropic.claude_browser_extension*"

# 输出结果（7 个路径）：
~/Library/Application Support/Arc/User Data/NativeMessagingHosts/...
~/Library/Application Support/BraveSoftware/Brave-Browser/NativeMessagingHosts/...
~/Library/Application Support/Chromium/NativeMessagingHosts/...
~/Library/Application Support/Google/Chrome/NativeMessagingHosts/...
~/Library/Application Support/Microsoft Edge/NativeMessagingHosts/...
~/Library/Application Support/Vivaldi/NativeMessagingHosts/...
~/Library/Application Support/com.operasoftware.Opera/NativeMessagingHosts/...
```

### 3.2 文件一致性验证

通过 MD5 哈希校验，确认所有 7 个清单文件内容完全相同：

```bash
md5 -q ~/Library/Application\ Support/*/NativeMessagingHosts/com.anthropic.claude_browser_extension.json

# 输出（全部一致）：
1e927a9e7796d0175a2a1f30028f4baa
1e927a9e7796d0175a2a1f30028f4baa
...（共 7 条相同哈希值）
```

### 3.3 写入时间线分析

```bash
# 检查文件创建与修改时间
stat -f "birth:%SB  mod:%Sm  %N" .../NativeMessagingHosts/...

# Chrome 清单：
birth:Dec 20 04:18:42 2025  mod:Apr 16 23:42:18 2026

# 其余 6 个清单：
birth:Jan 19 08:19:15 2026  mod:Apr 16 23:42:19 2026
```

**时间线解读：**

- Chrome 清单最早创建于 2025 年 12 月 20 日
- 其余 6 个清单在 2026 年 1 月 19 日同时创建
- 所有文件在 2026 年 4 月 16 日被统一重写（修改时间与创建时间相差数月，证明非一次性写入，而是持续重建）

### 3.4 日志证据：31 次安装记录

Claude Desktop 自身日志完整记录了桥接安装过程：

```bash
grep -E "Chrome Extension MCP|App is installed" ~/Library/Logs/Claude/main.log

# 输出：
2026-03-21 14:54:39 [info] App is installed, enabling initial check and auto-updates
2026-03-21 14:54:40 [info] [Chrome Extension MCP] Installed native host manifest for Chrome at ...
2026-03-21 14:54:40 [info] [Chrome Extension MCP] Installed native host manifest for Brave at ...
2026-03-21 14:54:40 [info] [Chrome Extension MCP] Installed native host manifest for Edge at ...
2026-03-21 14:54:40 [info] [Chrome Extension MCP] Installed native host manifest for Chromium at ...
2026-03-21 14:54:40 [info] [Chrome Extension MCP] Installed native host manifest for Arc at ...
2026-03-21 14:54:40 [info] [Chrome Extension MCP] Installed native host manifest for Vivaldi at ...
2026-03-21 14:54:40 [info] [Chrome Extension MCP] Installed native host manifest for Opera at ...
2026-03-21 14:54:40 [info] [Chrome Extension MCP] Native host installation complete
```

跨日志文件统计显示，共有 **31 次安装事件**被记录，每次启动 Claude Desktop 都会重新安装桥接文件。

### 3.5 macOS 来源验证：无法伪造的系统级证据

现代 macOS 通过扩展属性 `com.apple.provenance` 跟踪哪个应用程序写入了特定文件。该属性由操作系统控制，无法被应用程序伪造。

```bash
xattr -p -x com.apple.provenance .../com.anthropic.claude_browser_extension.json
# 输出：01 02 00 35 B5 F7 46 B2 6C 42 87

xattr -p -x com.apple.provenance ~/Library/Logs/Claude/main.log
# 输出：01 02 00 35 B5 F7 46 B2 6C 42 87（完全相同）
```

该来源签名与 Claude Desktop 日志文件完全一致，从操作系统层面铁证如山地证明：**写入这些清单文件的应用程序正是 Claude Desktop**。

### 3.6 代码签名与公证状态

```bash
codesign -dvv /Applications/Claude.app/Contents/Helpers/chrome-native-host

# 关键信息：
Executable=/Applications/Claude.app/Contents/Helpers/chrome-native-host
Authority=Developer ID Application: Anthropic PBC (Q6L2SF6YDW)
Timestamp=16 Apr 2026 at 18:39:18
TeamIdentifier=Q6L2SF6YDW

stapler validate /Applications/Claude.app
# The validate action worked!（主程序已通过 Apple 公证）
```

该桥接二进制文件使用 Anthropic PBC 的 Developer ID 证书签名，带有 Apple RFC 3161 安全时间戳，并通过主程序包的公证验证。**这不是测试版本或开发产物，而是正式发布渠道分发的签名组件。**

## 四、11 种暗模式（Dark Patterns）行为剖析

### 4.1 跨信任边界强制捆绑

用户仅安装了 Claude Desktop，但应用程序越过了独立软件厂商之间的信任边界，直接向 Brave 等第三方浏览器目录写入配置。违反了"应用程序不应静默修改其他应用程序数据"的基本安全原则。

### 4.2 无默认选择、无明确同意

在 Claude Desktop 安装、首次启动或正常使用过程中，用户从未看到任何询问对话框、复选框或设置面板。桥接安装完全在后台静默执行。

### 4.3 删除比安装更困难

- **安装**：用户零点击，自动完成
- **发现**：需要知道 Native Messaging 机制、了解 macOS 隐藏目录路径、打开终端执行命令
- **删除**：删除文件无效，下次启动 Claude Desktop 时会自动重建

### 4.4 预授权未安装的扩展

清单文件预授权了 3 个 Chrome 扩展 ID，但用户从未安装过其中任何一个。这意味着任何具有这些 ID 的扩展都可以随时调用沙箱外的本地程序。

### 4.5 通用命名掩盖真实作用范围

文件名为 `com.anthropic.claude_browser_extension`，看起来像是普通的浏览器集成。但实际功能是：沙箱外代码执行、认证会话访问、完整 DOM 读取。准确命名应为 `com.anthropic.browser_agent_bridge`。

### 4.6 向未安装的浏览器注册

在测试机器上，Edge、Arc、Vivaldi、Opera 四款浏览器并未安装，但 Claude Desktop 在 2026 年 1 月 19 日就创建了这些浏览器的 `NativeMessagingHosts` 父目录并写入清单。**如果用户未来安装这些浏览器，桥接将在首次启动时就已就位。**

### 4.7 与官方文档声明矛盾

Anthropic 官方文档声称：

> "Chrome 集成处于 beta 阶段，目前仅支持 Google Chrome 和 Microsoft Edge，尚不支持 Brave、Arc 等其他基于 Chromium 的浏览器。"

但实际安装行为却覆盖了 Brave、Arc、Chromium、Vivaldi 和 Opera。**文档声明与实际行为完全不一致。**

### 4.8 固定目标列表，无用户可见性

日志显示安装针对固定的 7 款浏览器列表。macOS 系统 UI、浏览器 UI、Claude.app 设置界面中均无已注册 Native Messaging 主机的列表。用户只能通过读取日志或搜索文件系统才能发现。

### 4.9 每次运行自动重装

跨日志文件统计显示 31 次安装完成事件。清单文件的修改时间戳证明文件在初始创建后被多次重写。**删除文件无法持久化，每次启动 Claude Desktop 都会重建。**

### 4.10 同意的时间倒置

即使未来用户安装了 Claude for Chrome 并给出明确同意，该同意仅针对扩展本身，而非针对之前未经同意已预装的桥接组件。

### 4.11 签名、公证、正式发布

桥接二进制使用 Anthropic Developer ID 签名，带有 Apple 安全时间戳，内置于已通过公证的 Claude.app 中。**这是签名、公证、正式发布的产品组件，而非测试或开发产物。**

## 五、安全威胁面分析

### 5.1 休眠能力≠安全能力

虽然桥接二进制在未激活时处于休眠状态，但其存在本身就扩大了攻击面。

### 5.2 潜在威胁场景

| 威胁场景           | 触发条件                                      | 影响               |
| ------------------ | --------------------------------------------- | ------------------ |
| 供应链攻击         | 预授权的 3 个扩展 ID 之一被劫持               | 沙箱外代码执行     |
| 提示注入攻击       | 恶意网页注入隐藏指令                          | 11.2%-23.6% 成功率 |
| 浏览器信任模型反转 | 用户选择 Brave 强化安全却获得 Chrome 等效暴露 | 安全 posture 失效  |
| 未来能力扩展       | Anthropic 控制扩展 ID，可随时扩展桥接能力     | 无额外可见安装动作 |

### 5.3 提示注入风险量化

Anthropic 自身安全数据显示：

- **无缓解措施时**：提示注入成功率 23.6%
- **当前缓解措施下**：成功率仍达 11.2%

这意味着每 9 次恶意页面访问中，就可能有 1 次成功注入指令，通过扩展和桥接路径到达用户权限级别的本地程序。

## 六、隐私威胁深度剖析

### 6.1 认证会话暴露

桥接继承浏览器登录状态，可以以用户身份访问任何已登录站点，无需重新登录或额外提示。

### 6.2 渲染后 DOM 访问

文档化能力包括读取 DOM 状态和提取网页结构化信息。这包括：

- 永远不会出现在 URL 或网络日志中的内容
- 解密的私人消息
- 表单输入中间状态
- 内存中的值

### 6.3 表单填写能力

能够填写表单的工具也能检查表单字段，包括：

- 密码输入瞬间的值
- 信用卡号码
- 双因素验证码
- 浏览器自动填充的任何值

### 6.4 跨配置文件关联

macOS 上的 Native Messaging 主机在浏览器级别注册，而非按配置文件注册。一个桥接可同时从浏览器的所有配置文件访问。使用配置文件隔离个人、工作和研究浏览的用户在桥接层失去了这种隔离。

## 七、法律与合规问题

### 7.1 欧盟 ePrivacy 指令违规

该行为直接违反 **欧盟指令 2002/58/EC（ePrivacy 指令）第 5(3) 条**，该条款规定在用户终端设备上存储或访问信息必须获得用户的知情同意。

### 7.2 计算机访问与滥用法

在多个司法管辖区，未经授权向他人设备写入可执行组件可能触犯计算机访问和滥用法（通常为刑事法律）。

### 7.3 同意有效性问题

即使用户后续安装了 Claude for Chrome 扩展并给出同意，该同意：

- 仅针对扩展本身
- 不涵盖之前未经同意已预装的桥接
- 不涵盖比扩展所需更广泛的作用范围
- 不涵盖超出同意浏览器的其他浏览器

## 八、正确的做法应该是什么？

### 8.1 标准桌面软件实践（2026 年基准）

| 正确做法         | 说明                                             |
| ---------------- | ------------------------------------------------ |
| **明确询问**     | 首次启动时弹出对话框，说明浏览器集成的作用和权限 |
| **拉取而非推送** | 仅当用户主动安装浏览器扩展后才安装 NM 清单       |
| **严格限定范围** | 仅安装到用户选择集成的浏览器                     |
| **透明化**       | 在设置中列出所有已注册的系统集成                 |
| **完整文档**     | 文档应覆盖所有安装位置，使用不同文件名区分产品   |
| **追溯同意**     | 通知已安装旧版本的用户，提供一键撤销功能         |
| **首次连接提示** | 扩展首次调用桥接时，提示用户确认                 |

### 8.2 具体实现示例

```
Claude Desktop 首次启动对话框：

┌─────────────────────────────────────────────┐
│  浏览器集成设置                               │
│                                             │
│  是否允许 Claude 控制您的浏览器？              │
│  这需要安装浏览器集成组件，允许 Claude 读取    │
│  网页内容、填写表单、自动化任务。               │
│                                             │
│  [立即配置]    [跳过，稍后在设置中启用]         │
└─────────────────────────────────────────────┘
```

## 九、用户防御与检测指南

### 9.1 检测是否受到影响

```bash
# 检查系统中是否存在 Anthropic 桥接清单文件
find ~/Library/Application\ Support -name "com.anthropic.claude_browser_extension.json"

# 检查 Claude Desktop 日志中的安装记录
grep -c "Native host installation complete" ~/Library/Logs/Claude/main.log
```

### 9.2 手动清除步骤

```bash
# 1. 删除所有桥接清单文件
find ~/Library/Application\ Support -name "com.anthropic.claude_browser_extension.json" -delete

# 2. 检查并删除未授权的 NativeMessagingHosts 目录
find ~/Library/Application\ Support -type d -name "NativeMessagingHosts" -exec ls -la {} \;

# 3. 验证清理结果
find ~/Library/Application\ Support -name "com.anthropic*"
```

**注意**：只要 Claude Desktop 仍在运行，下次启动时这些文件可能会被重新创建。彻底的解决方案需要卸载 Claude Desktop 或等待 Anthropic 官方修复。

### 9.3 长期防护建议

1. **监控应用行为**：使用 Little Snitch 等网络监控工具观察异常连接
2. **定期检查扩展**：审查浏览器已安装扩展及其权限
3. **关注安全更新**：跟踪 Anthropic 官方公告和安全社区动态
4. **权限最小化**：仅在必要时授予应用系统级权限
5. **使用沙箱环境**：在虚拟机或沙箱中运行 AI 桌面应用

## 十、总结与反思

此次事件暴露出 AI 行业在快速发展过程中对基础安全原则的忽视。Anthropic 一直以"安全优先"的 AI 实验室形象示人，但此次行为与其公开宣称的价值观形成鲜明对比。

**核心教训：**

1. **信任不可预设**：安全 posture 不应仅靠品牌声誉，而应通过透明的技术实践建立
2. **默认应安全**：静默安装是黑暗模式，知情同意才是行业标准
3. **文档与行为一致**：官方声明与实际实现必须保持一致，否则将失去技术社区信任
4. **AI 安全边界需要重新定义**：当 AI 代理获得浏览器自动化能力时，传统安全模型需要根本性升级

AI 公司不能一方面倡导人权和反对技术用于战争，另一方面却 undermines 用户基本的隐私权和数据保护权。此次事件的后续处理将直接影响整个 AI 行业的信任基础。

## 参考链接

- [原始分析文章：Anthropic secretly installs spyware when you install Claude Desktop](https://www.thatprivacyguy.com/blog/anthropic-spyware/)
- [Chrome Native Messaging 官方文档](https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging)
- [Anthropic Claude Code Chrome 集成文档](https://code.claude.com/docs/en/chrome)
- [欧盟 ePrivacy 指令 2002/58/EC 第 5(3) 条](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02002L0058-20091219)
- [Anthropic Claude for Chrome 公告](https://claude.com/blog/claude-for-chrome)
- [Claude in Chrome 扩展（Chrome Web Store）](https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn)

余下文章内容请点击跳转至 个人博客页面 或者 扫描 [二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg) 关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：[Anthropic Claude Desktop 静默安装浏览器间谍桥接组件深度分析](https://blog.cmdragon.cn/posts/anthropic-claude-desktop-spyware-bridge-analysis/)

<details>
<summary>往期文章归档</summary>

- [Vue 3 透传 Attributes 第五章：inheritAttrs 配置项的作用与使用完全指南](https://blog.cmdragon.cn/posts/vue3-attributes-fallthrough-chapter5/)
- [Vue 3 透传 Attributes 第四章：$attrs 对象的深度理解与应用完全指南](https://blog.cmdragon.cn/posts/vue3-attributes-fallthrough-chapter4/)
- [Vue 3 透传 Attributes 第三章：多根组件的 Attributes 透传策略完全指南](https://blog.cmdragon.cn/posts/vue3-attributes-fallthrough-chapter3/)
- [Vue 3 透传 Attributes 第二章：单根组件的 Attributes 自动透传完全指南](https://blog.cmdragon.cn/posts/vue3-attributes-fallthrough-chapter2/)
- [Vue 3 透传 Attributes 第一章：基本概念与工作原理完全解析](https://blog.cmdragon.cn/posts/vue3-attributes-fallthrough-chapter1/)
- [Vue 3 静态与动态 Props 如何传递？TypeScript 类型约束有何必要？](https://blog.cmdragon.cn/posts/94ab48753b64780ca3ab7a7115ae8522/)
- [Vue 3 中组件局部注册的优势与实现方式如何？](https://blog.cmdragon.cn/posts/dbf576e744870f6de26fd8a2e03e47da/)
- [如何在 Vue3 中优化生命周期钩子性能并规避常见陷阱？](https://blog.cmdragon.cn/posts/12d98b3b9ccd6c19a1b169d720ac5c80/)
- [Vue 3 Composition API 生命周期钩子：如何实现从基础理解到高阶复用？](https://blog.cmdragon.cn/posts/8884e2b70287fcb263c57648eeb27419/)
- [Vue 3 生命周期钩子实战指南：如何正确选择 onMounted、onUpdated 与 onUnmounted 的应用场景？](https://blog.cmdragon.cn/posts/883c6dbc50ae4183770a4462e0b8ae4d/)
- [Vue 3 中生命周期钩子与响应式系统如何实现协同工作？](https://blog.cmdragon.cn/posts/70dad360ffa9dce14d0d69611b8cb019/)
- [Vue3 组件生命周期钩子的执行顺序与使用场景是什么？](https://blog.cmdragon.cn/posts/db44294a78dc9f666f67b053f6c83567/)
- [Vue 组件全局注册与局部注册如何抉择？](https://blog.cmdragon.cn/posts/43ead630ea17da65d99ad2eb8188e472/)
- [Vue3 组件化开发中，Props 与 Emits 如何实现数据流转与事件协作？](https://blog.cmdragon.cn/posts/8cff7d2df113da66ea7be560c4d1d22a/)
- [Vue 3 模板引用如何与其他特性协同实现复杂交互？](https://blog.cmdragon.cn/posts/331bf75d114ab09116eadfcdca602b58/)
- [Vue 3 v-for 中模板引用如何实现高效管理与动态控制？](https://blog.cmdragon.cn/posts/cb380897ddc3578b180ecf8843c774c1/)
- [Vue 3 的 defineExpose：如何突破 script setup 组件默认封装，实现精准的父子通讯？](https://blog.cmdragon.cn/posts/202ae0f4acde7128e0e31baf63732fb5/)
- [Vue 3 模板引用的生命周期时机如何把握？常见陷阱该如何避免？](https://blog.cmdragon.cn/posts/7d2a0f6555ecbe92afd7d2491c427463/)
- [Vue 3 模板引用如何实现父组件与子组件的高效交互？](https://blog.cmdragon.cn/posts/3fb7bdd84128b7efaaa1c979e1f28dee/)
- [Vue 中为何需要模板引用？又如何高效实现 DOM 与组件实例的直接访问？](https://blog.cmdragon.cn/posts/23f3464ba16c7054b4783cded5c04c6/)

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
- [二维码解析器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/qrcode-parser)
- [文本转思维导图 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/text-to-mindmap)
- [正则表达式可视化工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/regex-visualizer)
- [文件隐写工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/steganography-tool)
- [IPTV 频道探索器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/iptv-explorer)
- [快传 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/snapdrop)
- [随机抽奖工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/lucky-draw)
- [动漫场景查找器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/anime-scene-finder)
- [时间工具箱 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/time-toolkit)
- [网速测试 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/speed-test)
- [AI 智能抠图工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/background-remover)
- [背景替换工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/background-replacer)
- [艺术二维码生成器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/artistic-qrcode)
- [Open Graph 元标签生成器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/open-graph-generator)
- [图像对比工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/image-comparison)
- [图片压缩专业版 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/image-compressor)
- [密码生成器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/password-generator)
- [SVG 优化器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/svg-optimizer)
- [调色板生成器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/color-palette)
- [在线节拍器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/online-metronome)
- [IP 归属地查询 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/ip-geolocation)
- [CSS 网格布局生成器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/css-grid-layout)
- [邮箱验证工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/email-validator)
- [书法练习字帖 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/calligraphy-practice)
- [金融计算器套件 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/finance-calculator-suite)
- [中国亲戚关系计算器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/chinese-kinship-calculator)
- [Protocol Buffer 工具箱 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/protobuf-toolkit)
- [IP 归属地查询 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/ip-geolocation)
- [图片无损放大 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/image-upscaler)
- [文本比较工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/text-compare)
- [IP 批量查询工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/ip-batch-lookup)
- [域名查询工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/domain-finder)
- [DNS 工具箱 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/dns-toolkit)
- [网站图标生成器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/favicon-generator)
- [XML Sitemap](https://tools.cmdragon.cn/sitemap_index.xml)

</details>
