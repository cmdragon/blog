---
url: /posts/0a9bd58f517145142b0f3b24c2a08bd7/
title: Chrome紧急更新修复高危远程代码执行漏洞
date: 2025-09-05T07:33:31+08:00
lastmod: 2025-09-05T07:33:31+08:00
author: cmdragon

summary:
  谷歌于2025年6月17日发布Chrome浏览器紧急安全更新（版本137.0.7151.119/.120），修复三个关键漏洞，其中包括两个高危远程代码执行（RCE）漏洞：CVE-2025-6191（V8引擎整数溢出）和CVE-2025-6192（Profiler组件释放后使用）。这些漏洞可能被攻击者利用完全控制用户设备。谷歌建议用户立即更新至最新版本，并警告基于Chromium的衍生浏览器同样受影响。此次更新覆盖Windows、Mac和Linux平台，凸显浏览器安全攻防的持续升级。

categories:
  - 隐私安全

tags:
  - Chrome安全更新
  - 远程代码执行漏洞
  - V8引擎漏洞
  - Profiler组件漏洞
  - 漏洞赏金
  - 浏览器安全
  - 谷歌漏洞响应

---

### Chrome紧急安全更新修复高危漏洞：防止远程代码执行攻击

**2025年6月17日** —— 谷歌今日面向全球用户发布Chrome浏览器（版本137.0.7151.119/.120）的紧急安全更新，修复三个关键漏洞，其中包括两个可被利用执行
**远程代码执行（RCE）** 的高危漏洞。此次更新覆盖Windows、Mac及Linux三大平台，旨在应对黑客利用漏洞完全控制用户设备的潜在威胁。

#### 漏洞技术细节

1. **CVE-2025-6191：V8引擎整数溢出漏洞**  
   由安全研究员Shaheen
   Fazim于5月27日报告，该漏洞存在于Chrome核心JavaScript引擎V8中。通过精心构造的恶意网页代码，攻击者可触发整数溢出导致内存破坏，进而绕过安全机制执行任意指令。谷歌为此漏洞支付了
   **7000美元漏洞赏金**。

2. **CVE-2025-6192：Profiler组件释放后使用漏洞**  
   研究员Chaoyuan Peng（@ret2happy）发现此漏洞，存在于浏览器性能分析组件Profiler中。攻击者利用"释放后使用"
   （Use-After-Free）内存错误，可能突破Chrome沙箱隔离机制，直接控制系统进程，漏洞被评级为**高危级**（Critical），获得4000美元奖励。

#### 应对措施与用户建议

谷歌在公告中强调，**技术细节仍处保密状态**，以避免攻击者抢在用户更新前开发武器化工具。安全团队警告，此类漏洞同样影响所有基于Chromium开源组件的衍生浏览器（如Microsoft
Edge、Opera等）。

**用户应立即采取行动**：

1. 浏览器地址栏输入 `chrome://settings/help`
2. 或通过菜单栏选择：`设置` → `关于Chrome`
3. 确保版本更新至 **137.0.7151.119**（Windows/Linux）或 **137.0.7151.120**（Mac）

#### 行业影响分析

RCE漏洞始终是网络攻击中的"皇冠明珠"。2024年Recorded
Future报告显示，浏览器漏洞占比高达31%的初始入侵路径。此次谷歌在外部研究员协助下48小时内完成补丁开发，凸显其漏洞响应机制的成熟度，但同时也反映了现代浏览器复杂组件生态的攻防博弈将持续升级。

安全专家呼吁企业IT部门优先部署终端更新策略，个人用户应启用浏览器的**自动更新功能**。谷歌预计在90%活跃用户完成更新后，于7月上旬公开完整技术分析报告。


<details>
<summary>免费好用的热门在线工具</summary>

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
