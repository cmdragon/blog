---
url: /posts/2d04d6400f02c7b73c2d8c496e3f91da/
title: 华硕AMIBIOS高危漏洞曝光，远程攻击可导致硬件永久损毁
date: 2025-09-07T06:57:00+08:00
lastmod: 2025-09-07T06:57:00+08:00
author: cmdragon

summary:
  华硕紧急修复四款工作站主板中的高危漏洞（CVE-2024-54085），该漏洞CVSS风险评级为满分10分，源于AMI开发的MegaRAC基板控制器软件，存在于AMIBIOS固件层。攻击者可通过Redfish远程管理接口或BMC物理接口完全控制服务器，甚至通过电压超载永久烧毁硬件设备。受影响主板包括PRO WS W790E-SAGE SE等四款型号，华硕已发布修复固件。安全专家建议强制启用“完全刷新”模式并隔离BMC接口访问，预计48小时内将出现自动化攻击工具。AMI公司同步发布全球安全通告，确认漏洞影响多品牌服务器设备。

categories:
  - 隐私安全

tags:
  - 华硕
  - AMIBIOS漏洞
  - 远程接管
  - 硬件损坏
  - 安全更新
  - 工作站主板
  - 供应链安全

---

### 华硕紧急修复AMIBIOS高危漏洞，黑客可远程接管服务器并烧毁硬件

**导语**  
华硕（ASUS）今日发布紧急安全更新，修复四款工作站主板中的高危漏洞（CVE-2024-54085）。该漏洞CVSS风险评级达满分10分，允许攻击者通过远程管理接口完全控制服务器，甚至通过电压超载永久烧毁硬件设备。

---

#### **漏洞核心风险：远程接管与硬件毁灭**

该漏洞源于AMI（American Megatrends International）开发的**MegaRAC基板控制器软件**，存在于工作站主板的AMIBIOS固件层。攻击者可通过两种路径发起攻击：

1. **Redfish远程管理接口**（基于RESTful API的硬件控制协议）
2. **BMC（基板管理控制器）物理接口**

成功利用后，黑客可实施四类攻击：

- ⚠️ 植入恶意软件或勒索软件
- ⚠️ 篡改固件实现持久化后门
- ⚠️ **触发电压超载永久损坏CPU/内存等硬件**
- ⚠️ 发起循环重启攻击导致服务瘫痪

安全研究机构强调，此类漏洞属于**硬件级威胁**，常规杀毒软件无法检测，且硬件损毁后无法通过系统重置恢复。

---

#### **受影响设备清单**

华硕确认四款高端工作站主板需立即更新：  
| 主板型号 | 修复固件版本 | 发布时间 |  
|---------|-------------|----------|  
| PRO WS W790E-SAGE SE | v1.1.57 | 2024年3月 |  
| PRO WS W680M-ACE SE | v1.1.21 | 2024年3月 |  
| PRO WS WRX90E-SAGE SE | v2.1.28 | 2024年3月 |  
| Pro WS WRX80E-SAGE SE WIFI | v1.34.0 | 2024年3月 |

**注**：虽然固件于3月发布，但漏洞细节直至近期公开，华硕提前部署以降低0day攻击风险。

---

#### **修复方案与防护建议**

1. **强制启用“完全刷新”模式**  
   华硕强调更新时必须勾选该选项，否则残留漏洞可能被二次利用。
2. **隔离BMC接口访问**  
   企业用户应限制BMC端口的网络暴露范围，建议仅通过VPN访问。
3. **消费级主板需同步排查**  
   尽管主要影响工作站设备，但采用同款AMIBIOS的消费级主板也需检查厂商更新。

安全专家警告：**该漏洞攻击链成熟，预计48小时内将出现自动化攻击工具。**

---

#### **行业联动响应**

AMI公司同步发布MegaRAC基板控制器的全球安全通告，确认漏洞影响多品牌服务器设备，惠普、戴尔等厂商正协调修复方案。监管机构呼吁建立
**硬件固件漏洞的强制披露机制**，避免供应链风险扩散。

---

**引用**  
[1] NVD Vulnerability Database: CVE-2024-54085  
https://nvd.nist.gov/vuln/detail/CVE-2024-54085


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
