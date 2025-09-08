---
url: /posts/1b56f0970834f6217ce4dc1f80453896/
title: 谷歌SafetyCore静默安装引发安卓用户控制权危机与隐私风险
date: 2025-09-08T05:01:14+08:00
lastmod: 2025-09-08T05:01:14+08:00
author: cmdragon

summary:
  2025年2月24日，谷歌通过Google Play Store向Android 9及以上设备静默安装系统级应用SafetyCore，引发全球隐私争议。该应用使用本地机器学习模型扫描设备内容，声称不主动上传数据，但用户无法永久卸载，且预留云端接口，存在隐私泄露风险。隐私组织批评此举侵犯用户控制权，欧盟等监管机构已启动调查。谷歌未解释为何不提供可选安装机制，技术专家指出禁用流程复杂，普通用户难以操作。该事件正值全球强化数据主权立法期，相关法律可能限制此类行为。

categories:
  - 隐私安全

tags:
  - 谷歌
  - SafetyCore
  - 隐私争议
  - 用户控制权
  - 强制安装
  - 数据主权
  - 科技伦理

---

### 严肃新闻：谷歌静默安装 SafetyCore 引发隐私争议，安卓用户控制权遭削弱

2025年2月24日，科技巨头谷歌在未提前告知用户的情况下，通过 Google Play Store 向运行 Android 9 及以上版本的设备**静默部署**
一款名为 **SafetyCore** 的系统级应用。该行为迅速引发全球隐私保护组织和安全研究人员的强烈质疑，核心争议点在于用户对自身设备的
**控制权被实质性剥夺**。

#### 技术机制与隐私隐忧

SafetyCore 的核心功能是通过**本地机器学习模型**
对设备内容进行实时扫描与分析，主要目标为识别钓鱼网站、金融欺诈等高风险内容，并向其他应用程序提供安全检测支持。谷歌在声明中强调，当前版本仅执行本地扫描，
**不会主动上传用户数据**至云端服务器。

然而，这一技术实现存在双重隐患：

1. **强制安装与持久化**  
   即使用户主动卸载 SafetyCore，系统仍会通过后台进程自动重新安装并静默更新，形成「卸载无效」的技术闭环。移动安全专家指出，此举实质上建立了
   **OS 级特权通道**，破坏了应用沙箱隔离原则。

2. **未来扩展性风险**  
   隐私研究机构观察到 SafetyCore 的通信模块预留了**云端交互接口**
   。一旦谷歌启用远程扫描功能，本地文件内容哈希值甚至部分文件片段可能被上传至谷歌服务器，形成隐私泄露高危路径。欧盟数据保护委员会已要求谷歌澄清该应用与争议性内容审查系统
   **CASM (Content Annotation and Safety Model)** 的关联性。

#### 用户控制权危机

谷歌声称 SafetyCore 是「提升设备安全性的必要基础设施」，但隐私倡导组织 *Electronic Frontier Foundation* 提出尖锐批评：
> 「以安全为名的系统性监控是对数字主权的侵犯。当用户无法永久禁用预装应用时，安全与隐私的天平已明显失衡——这本质上是利用系统特权强制推行技术霸权。」

技术解决方案方面，用户目前只能通过**开发者调试工具 (ADB)** 执行强制禁用命令。普通用户需要连接计算机并输入专业指令，这一复杂流程被专家评价为「故意设置技术屏障」。

#### 行业影响与法律风险

该事件正值全球强化数据主权立法关键期：

- 欧盟 *Digital Markets Act* 要求「守门人」企业保障用户卸载预装软件的权利
- 美国国会近期拟议的《算法问责法案》明确限制后台数据采集行为
- 印度、巴西等多国监管机构已启动对该强制安装行为的合规性调查

谷歌尚未回应关于「为何不提供用户可选安装机制」的核心质询。随着柏林黑客大会和 Black Hat Asia 将 SafetyCore 列入安全研讨议题，这场关于
**科技伦理边界**的争议将持续发酵。

***


<details>
<summary>免费好用的热门在线工具</summary>

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
