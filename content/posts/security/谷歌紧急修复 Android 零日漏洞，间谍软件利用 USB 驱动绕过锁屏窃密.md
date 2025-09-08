---
url: /posts/ca6e32cce4c1b8632a966508589ac4de/
title: 谷歌紧急修复Android零日漏洞，间谍软件利用USB驱动绕过锁屏窃密
date: 2025-09-08T02:55:00+08:00
lastmod: 2025-09-08T02:55:00+08:00
author: cmdragon

summary:
  谷歌紧急修复了Android USB驱动程序中的零日漏洞（CVE-2024-53104），该漏洞已被以色列公司Cellebrite的间谍软件利用，攻击者可通过物理接触设备绕过锁屏，窃取敏感数据。漏洞影响Android 9及以上版本，攻击链包括绕过锁屏、静默安装间谍软件及全权控制设备。Cellebrite工具被指流向威权政府用于监控，塞尔维亚政府被曝利用该漏洞实施非法监听。谷歌已发布修复补丁，但相关漏洞仍存隐患。用户应尽快更新系统并加强物理防护。

categories:
  - 隐私安全

tags:
  - Android安全漏洞
  - 零日漏洞
  - 间谍软件
  - 锁屏绕过
  - Cellebrite
  - 物理接触攻击
  - 用户防护建议

---

### 谷歌紧急修复Android零日漏洞，间谍软件曾利用其绕过锁屏窃密

**2025年3月2日**

谷歌今日发布Android安全更新，紧急修复USB驱动程序中的零日漏洞（**CVE-2024-53104**
）。该漏洞已被以色列公司Cellebrite提供的间谍软件武器化，攻击者可借此完全绕过Android设备的锁屏保护，窃取用户敏感数据。调查显示，塞尔维亚政府曾利用该技术对目标设备进行非法监听与数据采集。

---  

#### **漏洞深度解析：物理接触即可触发**

漏洞位于Linux内核的USB驱动层，影响搭载Android 9及更高版本的设备及部分Linux系统。攻击者需物理接触目标设备，通过恶意USB设备（如伪装的充电器或U盘）触发漏洞。一旦成功，攻击链将：

1. **绕过锁屏**：直接访问设备主界面；
2. **静默安装间谍软件**：部署Cellebrite等工具；
3. **全权控制设备**：窃取通讯录、短信、定位数据，甚至启用麦克风实时监听。

安全研究人员指出，此类漏洞尤其威胁记者、政治活动人士等高风险群体——攻击者仅需短暂接触设备即可完成入侵。

---  

#### **商业间谍工具的灰色地带**

Cellebrite作为数字取证公司，长期向执法机构提供技术方案。然而，其工具被曝多次流向威权政府，用于针对公民社会的监控。本次漏洞利用进一步凸显商业监控软件的双刃剑属性：
> “合法工具被滥用为监控武器，暴露供应链监管的致命缺陷。”  
> ——国际数字权利组织报告

塞尔维亚政府被指利用该漏洞实施定向监控，细节由跨国调查联盟“黑暗室”（Dark Room）披露。

---  

#### **修复进展与遗留风险**

谷歌已在3月安全补丁中修复CVE-2024-53104，但两项关联漏洞仍存隐患：

- **CVE-2024-53197**（USB协议栈内存溢出）
- **CVE-2024-50302**（权限提升漏洞）  
  二者尚未完全同步至Android开源项目（AOSP）代码库，恐为后续攻击埋下伏笔。

---  

#### **用户防护建议**

1. **立即更新系统**：前往设置→系统→安全更新，安装2025年3月补丁；
2. **禁用USB调试模式**：非必要时不开启开发者选项；
3. **物理防护优先**：避免设备离身，拒接未知USB设备。

谷歌强调，此次修复覆盖Pixel系列及合作厂商设备，但碎片化导致旧机型仍面临威胁。

---  
**结语**  
本次事件再次敲响移动安全的警钟——系统底层驱动的微小漏洞，足以瓦解整个设备的安全防线。随着监控技术的武器化扩散，科技企业需重新审视安全供应链的责任边界。

> ^^参考文献：  
> [1] Android Security Bulletin—March 2025, Google. https://source.android.com/docs/security/bulletin/2025-03-01  
> [2] CVE-2024-53104 Technical Analysis, MITRE. https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2024-53104


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
