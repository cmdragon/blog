---
url: /posts/6283a304a4209252b72add92aa6346e7/
title: Mars Hydro数据库配置错误导致27亿条用户数据泄露，暴露Wi-Fi密码与设备API
date: 2025-09-09T07:43:23+08:00
lastmod: 2025-09-09T07:43:23+08:00
author: cmdragon

summary:
  中国智能设备制造商Mars Hydro因数据库安全配置错误，导致27亿条用户敏感数据暴露，包括Wi-Fi密码、API密钥和设备ID等。此次泄露使黑客能够入侵用户网络、劫持设备并渗透云基础设施。尽管公司迅速封锁数据库，但数据暴露时长和第三方窃取风险仍不明确。事件暴露了物联网行业在数据存储和供应链安全方面的系统性缺陷，用户需立即更换密码并检查设备安全。随着物联网设备数量激增，厂商需加强数据最小化和零信任架构等安全措施。

categories:
  - 隐私安全

tags:
  - 数据泄露
  - 物联网安全
  - Mars Hydro
  - Wi-Fi密码
  - API密钥
  - 网络安全漏洞
  - 用户隐私保护

---

### 27亿条用户数据遭裸奔！中国物联网公司Mars Hydro重大安全泄露暴露Wi-Fi密码与设备API

#### 事件概述

中国智能设备制造商Mars Hydro因数据库安全配置错误，导致**27亿条用户敏感数据**在互联网上完全暴露。据安全研究员Jeremiah
Fowler披露，该未加密数据库容量达1.17TB，包含全球用户设备的Wi-Fi密码、API密钥、设备ID及操作日志，攻击者可借此直接接管物联网设备并实施网络入侵。

#### 泄露数据深度解析

暴露数据涉及美国加州注册的母公司LG-LED SOLUTIONS LIMITED旗下两大智能生长灯品牌Mars Hydro与Spider
Farmer，风险覆盖全球用户。具体泄露内容包括：

- **核心凭证**：Wi-Fi SSID（网络名称）及明文密码、设备远程控制API密钥
- **用户隐私**：智能手机操作系统版本、授权令牌、IP地理定位日志
- **攻击载体**：设备错误日志中泄露的固件漏洞信息，可被用于中间人攻击(MITM)

研究人员警告，这些数据将使黑客具备三重攻击能力：

1. 直接入侵用户家庭/企业网络
2. 劫持物联网设备组建僵尸网络发动DDoS攻击
3. 通过API密钥反向渗透企业云基础设施

#### 安全响应滞后暴露行业顽疾

虽然Mars Hydro在接到通知后数小时内封锁数据库，但**关键疑点仍未澄清**：

- 数据库暴露时长不明，无法确认是否有第三方已窃取数据
- 公司未公开回应事件，仅通过客服承认Mars Pro App属官方产品
- 无法判定数据管理方为Mars Hydro自身或第三方承包商

值得注意的是，该公司的Google Play与Apple App Store隐私声明明确宣称**“不收集用户数据”**，与实际泄露的27亿条记录形成尖锐矛盾。

#### 物联网安全危机升级

此次事件印证了Palo Alto Networks最新研究报告的警示：

- **57%的IoT设备存在高危漏洞**
- **98%的物联网数据传输未加密**
- 厂商普遍忽视设备生命周期维护，停产产品仍在线运行

安全专家指出，Mars Hydro泄露事件暴露物联网行业两大系统性缺陷：

- **敏感数据存储失控**：厂商过度收集Wi-Fi密码等非必要信息
- **供应链安全缺位**：第三方承包商数据库运维缺乏审计机制

#### 用户紧急防护指南

受影响用户应立即执行以下措施：

- 立即更换所有关联Wi-Fi密码，禁用默认设备口令
- 启用路由器WPA3加密协议，检查异常连接日志
- 停用未获安全更新的老旧IoT设备
- 向网络服务商申请IP地址更换

#### 行业警示与未来走向

本次27亿数据裸奔事件再次敲响物联网安全警钟。随着全球IoT设备预计在2025年突破750亿台，厂商必须建立：

- **数据最小化原则**：避免存储Wi-Fi密码等高危信息
- **零信任架构**：强制API密钥轮换与多因素认证
- **第三方审计机制**：对承包商实施等同于自营的安全标准

尽管Mars Hydro快速封锁了访问入口，但用户敏感数据已在暗网流通的风险将持续存在。随着欧盟《网络韧性法案》等法规落地，缺乏基础安全实践的IoT厂商将面临严苛制裁。

---
^^[1] 事件技术细节与初始报告 - vpnMentor  
https://www.vpnmentor.com/news/report-marshydro-breach/  
^^[2] 欧盟《网络韧性法案》物联网设备规范  
https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act


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
