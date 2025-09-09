---
url: /posts/f3d1dbb6fde9e163171258869c861fd6/
title: DeepSeek遭遇Mirai变种僵尸网络攻击，AI行业安全面临严峻挑战
date: 2025-09-09T06:11:52+08:00
lastmod: 2025-09-09T06:11:52+08:00
author: cmdragon

summary:
  近期，中国人工智能企业深度求索（DeepSeek）遭受大规模网络攻击，涉及分布式拒绝服务攻击（DDoS）、HTTP 代理渗透及僵尸网络协同作战。幕后黑手为 Mirai 僵尸网络变种 HailBot 和 RapperBot，利用物联网设备漏洞发起混合流量攻击。攻击导致服务器频繁宕机，用户数据泄露。黑产借机通过仿冒官网、虚假加密货币骗局及 IPO 股权诈骗牟利。DeepSeek 已发布安全公告，建议用户通过官方渠道访问服务，并启用 DNS-over-HTTPS 及广告拦截插件。事件暴露了 AI 企业安全防护短板，警示行业需加强威胁情报共享与防护体系升级。

categories:
  - 隐私安全

tags:
  - DeepSeek
  - 网络攻击
  - Mirai僵尸网络
  - DDoS攻击
  - 黑产诈骗
  - AI安全
  - 网络安全防护

---

### DeepSeek 遭大规模网络攻击：Mirai 僵尸网络变种浮出水面，AI 行业安全再亮红灯

近期，中国人工智能企业深度求索（DeepSeek）持续遭受高强度网络攻击，服务器频繁宕机导致用户体验严重受损。经多家安全机构联合调查，此次攻击涉及
**分布式拒绝服务攻击（DDoS）、HTTP 代理渗透及僵尸网络协同作战**，幕后黑手为 Mirai 僵尸网络变种 **HailBot 和 RapperBot**
。事件不仅暴露了 AI 企业安全防护短板，更揭示了黑产借机牟利的新动向。

---

#### 攻击时间线与技术分析

根据安全机构披露的日志，攻击事件脉络已清晰显现：

- **1 月 27 日**：DeepSeek 因持续恶意攻击宣布暂停新用户注册。
- **1 月 28 日**：安全公司 Wiz.io 发现其 ClickHouse 数据库配置失误，导致 API 密钥、用户聊天记录及后端系统信息遭泄露。
- **1 月 29 日**：《环球时报》溯源显示，攻击源主要来自美国 IP 地址，攻击类型涵盖 **DDoS 洪水攻击、HTTP 代理层穿透及暴力破解尝试
  **。
- **1 月 30 日**：网络安全机构 XLab 确认 **HailBot 与 RapperBot 僵尸网络**为攻击核心，二者通过数万台被控设备发起协同攻击。

---

#### 僵尸网络攻击手法详解

1. **HailBot：Mirai 源码的“进化版”**
    - 基于开源僵尸网络 Mirai 开发，强化 DDoS 攻击能力。
    - 利用 **CVE-2017-17215（华为路由器漏洞）** 横向传播，通过 TCP/UDP 协议发动混合流量攻击。
    - 内置弱口令扫描模块，可对 Telnet/SSH 服务实施暴力破解，进一步扩大僵尸网络规模。

2. **RapperBot：IoT 设备的“隐形杀手”**
    - 专注入侵物联网设备（如摄像头、路由器），通过 SSH 弱口令爆破建立持久化控制。
    - 攻击载荷具备 **反检测能力**，可伪装合法流量躲避安全设备筛查。
    - 被控设备形成“攻击资源池”，长期服务于 DDoS 租用黑市。

---

#### 黑产借势牟利：三大诈骗链路曝光

在技术攻击外，黑客借 DeepSeek 知名度构建诈骗生态：

1. **仿冒官网传播恶意软件**  
   克隆 DeepSeek 官方网站，诱导用户下载携带远控木马的“安装包”，窃取设备权限。
2. **虚假加密货币骗局**  
   伪造“DeepSeek Token”投资项目，利用社媒推广吸引用户注资，资金随后转移至匿名钱包。
3. **IPO 股权诈骗**  
   谎称出售 DeepSeek 上市前股权，伪造法律文件与投资协议，实施定向金融欺诈。

---

#### 官方响应与安全建议

DeepSeek 已通过微信公众号、X（Twitter）等平台发布安全公告，并呼吁用户：

- 仅通过官方渠道（[deepseek.com](https://www.deepseek.com)）访问服务，警惕仿冒链接。
- 启用 **DNS-over-HTTPS（DoH）及广告拦截插件**，阻截恶意跳转。
- 避免参与任何以 DeepSeek 为名的加密货币或股权投资。

同时，XLab 建议企业用户：
> “部署 **AI 驱动流量分析系统**（如 Cloudflare Radar、AWS Shield），实时识别 DDoS 攻击特征；对暴露在公网的数据库服务实施 *
*零信任访问控制**，避免配置失误导致数据泄露。”

---

#### 行业警示：AI 成安全攻防“新高地”

此次事件标志着人工智能企业正式成为全球黑客的重点目标。随着 AI 模型商业化进程加速，其背后庞大的计算资源、用户数据及品牌价值，均成为黑产眼中的“高价值目标”。安全专家警告：
> “2024 年针对 AI 基础设施的 **供应链攻击、模型投毒（Model Poisoning）及 API 劫持**风险将持续攀升，需建立跨企业威胁情报共享机制。”

目前，DeepSeek 已联合腾讯安全、奇安信等技术团队升级防护体系，后续攻击态势仍在监控中。

---

**引用来源**
CVE-2017-17215 漏洞详情：  
[https://nvd.nist.gov/vuln/detail/CVE-2017-17215](https://nvd.nist.gov/vuln/detail/CVE-2017-17215) ^^

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
