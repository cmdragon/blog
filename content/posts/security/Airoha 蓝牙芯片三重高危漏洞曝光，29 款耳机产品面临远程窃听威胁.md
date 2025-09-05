---
url: /posts/71b85753b6b79460d3177b892840e710/
title: Airoha蓝牙芯片三重高危漏洞曝光，29款耳机产品面临远程窃听威胁
date: 2025-09-05T02:03:58+08:00
lastmod: 2025-09-05T02:03:58+08:00
author: cmdragon

summary:
  2025年6月26日，德国安全研究机构ERNW披露台湾络达科技（Airoha）蓝牙音频芯片存在三项高危漏洞（CVE-2025-20700至CVE-2025-20702）。这些漏洞允许攻击者远程访问设备内存和蓝牙通信协议，导致用户隐私数据泄露。影响范围涵盖索尼、Bose等十大品牌的29款高端耳机与音箱设备，波及数百万用户。漏洞涉及芯片底层调试接口未启用身份验证机制和蓝牙协议层设计缺陷，攻击者可在10米范围内窃取音频流并控制设备。由于漏洞存在于芯片固件层，传统软件更新无法修复，部分设备尚未发布安全补丁，高价值用户面临持续监听风险。

categories:
  - 隐私安全

tags:
  - 蓝牙芯片漏洞
  - 远程窃听风险
  - 高价值用户威胁
  - 供应链安全缺陷
  - 设备固件更新滞后
  - 隐私数据泄露
  - 硬件协议层审计缺失

---

### 漏洞安全警报：Airoha蓝牙芯片三重高危漏洞威胁29款耳机产品，高价值用户面临远程窃听风险

---

#### **漏洞核心概述**

德国安全研究机构ERNW于2025年6月26日在TROOPERS安全大会上披露，台湾络达科技（Airoha）生产的蓝牙音频芯片存在三项高危零日漏洞（CVE-2025-20700至CVE-2025-20702）。这些漏洞允许攻击者在未授权状态下远程访问设备内存和蓝牙通信协议，导致用户隐私数据的系统性泄露。影响范围覆盖
**索尼、Bose、JBL、马歇尔**等全球十大品牌的29款高端耳机与音箱设备，保守估计波及用户量达数百万级别。

#### **技术机理与攻击链分析**

1. **芯片级内存暴露（CVE-2025-20702）**  
   漏洞源于芯片底层调试接口未启用身份验证机制。攻击者可利用蓝牙通信信道直接访问设备内存和闪存区域，完整提取包括*
   *蓝牙配对密钥、音频流数据和设备识别信息**在内的敏感内容。ERNW团队通过索尼WH-1000XM5耳机复现攻击，成功导出设备存储的核心加密凭证。

2. **蓝牙协议层设计缺陷（CVE-2025-20700/CVE-2025-20701）**  
   芯片GATT服务层（通用属性配置文件）未实施通信认证流程，同时经典蓝牙协议可绕过标准配对验证。通过组合利用这两项漏洞，攻击者可在10米有效范围内注入恶意指令——ERNW演示了劫持用户安卓手机拨出监听电话的完整路径，实现
   **实时音频流窃取与设备控制权夺取**。

#### **厂商响应滞后，修复进程受阻**

由于漏洞存在于芯片固件层，传统应用端软件更新无法修复缺陷。Airoha虽已向设备制造商提供新版SDK，但截至6月底：

- **索尼、马歇尔旗舰型号（如WH-1000XM6、Stanmore III音箱）尚未发布安全补丁**
- 近半数受影响设备缺乏明确的漏洞修复时间表  
  供应链信息断层进一步加剧风险：部分品牌商在ERNW通报前，甚至未能识别自身产品搭载了问题芯片。

#### **高危场景预警**

尽管攻击需具备较高技术门槛，ERNW重点警示两类高风险场景：

1. **高价值目标威胁**：政要、企业高管、记者等目标在机场、会议室等场景持续暴露风险
2. **持续性监听危害**：攻击者可固化恶意固件，实现设备长期监控  
   安全团队建议上述用户**立即暂停使用相关耳机产品**，转用有线设备或经认证的端到端加密音频方案。

#### **供应链安全体系缺陷再敲警钟**

本次事件揭示消费电子行业长期存在的安全盲区：

- **硬件协议层审计缺失**：芯片厂商未对底层通信协议实施标准化认证
- **漏洞响应机制割裂**：设备制造商与芯片供应商协同滞后，安全责任界定模糊  
  ERNW呼吁建立**全栈式硬件安全认证框架**，强制要求芯片级安全审计纳入供应链准入标准。

---

### 引用

^^[1] ERNW Research Team. *"BLEed: Breaking Bluetooth Low Energy through Airoha Chipset Vulnerabilities"*. TROOPERS25
Security Conference Presentation. June 26, 2025. [https://www.ernw.com/)  
[2] CVE Details. *CVE-2025-20700/CVE-2025-20701/CVE-2025-20702 Technical Analysis*. National Vulnerability
Database. [https://nvd.nist.gov/vuln/detail/CVE-2025-20702](https://nvd.nist.gov/)  
[3] Marshall Speaker Security Bulletin. *Stanmore III Vulnerability Mitigation Status*. July 1,
2025. [https://support.marshall.com/security/stanmore-III-CVE-2025](https://support.marshall.com/security/stanmore-III-CVE-2025)^^


<details>
<summary>免费好用的热门在线工具</summary>

 1. 拜亚动力 - Amiron 300
 2. Bose - QuietComfort 耳塞
 3. EarisMax - 蓝牙 Auracast 发送器
 4. Jabra - Elite 8 Active
 5. JBL - 耐力赛 2
 6. JBL - Live Buds 3
 7. JLab - Epic Air Sport ANC
 8. 马歇尔 - Acton III（阿克顿三世）
 9. 马歇尔 - Major V（少校五世）
 10. 马歇尔 - Minor IV（米诺四世）
 11. 马歇尔 - MOTIF II
 12. 马歇尔 - Stanmore III（斯坦莫尔三世）
 13. 马歇尔 - Woburn III（沃本三世）
 14. MoerLabs - EchoBeatz
 15. 索尼 - CH-720N
 16. 索尼 - Link Buds S
 17. 索尼 - ULT Wear
 18. 索尼 - WF-1000XM3
 19. 索尼 - WF-1000XM4
 20. 索尼 - WF-1000XM5
 21. 索尼 - WF-C500
 22. 索尼 - WF-C510-GFP
 23. 索尼 - WH-1000XM4
 24. 索尼 - WH-1000XM5
 25. 索尼 - WH-1000XM6
 26. 索尼 - WH-CH520
 27. 索尼 - WH-XB910N
 28. 索尼 - WI-C100
 29. Teufel - Tatws2

</details>

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
