---
url: /posts/15bd053c99809dcdfb4e663b20880f8c/
title: Clash Verge rev高危提权漏洞威胁全系统安全
date: 2025-09-07T05:47:45+08:00
lastmod: 2025-09-07T05:47:45+08:00
author: cmdragon

summary:
  跨平台代理工具Clash Verge rev曝高危提权漏洞，影响Linux、Windows和macOS系统，攻击者可获取最高权限（root或SYSTEM）。漏洞存在于后台服务模块，涉及权限隔离失效、自启动组件缺陷和未授权访问路径。受影响版本包括最新2.2.4-alpha版，风险评级为高危（CVSS 9.0+）。建议用户立即停用服务，并关注官方修复更新。漏洞可能被勒索软件组织利用，形成APT级攻击链，需启用系统完整性保护并审查异常进程。

categories:
  - 隐私安全

tags:
  - Clash Verge rev
  - 提权漏洞
  - 系统安全
  - 高危漏洞
  - 跨平台风险
  - 权限控制缺陷
  - 临时缓解措施

---

### 跨平台代理工具Clash Verge rev曝高危提权漏洞，全系统面临入侵风险

#### 漏洞概述

近日，安全研究人员披露跨平台代理客户端**Clash Verge rev**存在高危提权漏洞（CVE编号待分配）。该漏洞可使攻击者在未经授权的情况下获取系统最高权限：Linux/Mac系统可提权至
**root权限**，Windows系统可提权至**SYSTEM权限**。受影响版本包括当前最新发布的2.2.4-alpha版，漏洞暂未修复，风险评级为*
*高危（CVSS 9.0+）**。

#### 技术细节

漏洞存在于Clash Verge rev的后台服务模块，其权限控制机制存在设计缺陷：

1. **权限隔离失效**  
   服务组件未正确实施权限沙箱机制，攻击者可通过本地或远程注入恶意载荷，绕过权限限制直接控制系统核心资源。
2. **自启动组件缺陷**  
   macOS系统中名为“won fen”的后台自启动模块存在配置漏洞，允许恶意进程通过进程间通信（IPC）劫持执行流。
3. **未授权访问路径**  
   服务端口（默认未公开）暴露系统级API，攻击者可构造特制请求实现权限升级。

#### 影响范围

| 操作系统    | 影响程度       | 风险场景        |  
|---------|------------|-------------|  
| Windows | SYSTEM权限获取 | 系统文件篡改/勒索软件 |  
| Linux   | root权限获取   | 容器逃逸/供应链攻击  |  
| macOS   | root权限获取   | 密钥窃取/持久化后门  |  

该漏洞尤其威胁长期开机的服务器环境及高权限账户设备，攻击者可实现**持久化控制**或**横向渗透**企业内网。

#### 临时缓解措施

**Windows用户**

```powershell
# 打开服务管理器，禁用Clash Verge服务
Stop-Service "ClashVergeService" -Force  
Set-Service "ClashVergeService" -StartupType Disabled
```  

**Linux用户**

```bash
# 立即停用并禁用服务
sudo systemctl stop clash-verge-service  
sudo systemctl disable clash-verge-service
```  

**macOS用户**

1. 进入“系统设置 → 隐私与安全性”
2. 在“后台服务”列表中关闭“won fen”模块的执行权限
3. 执行终端命令：`sudo launchctl unload /Library/LaunchDaemons/com.clashverge.service.plist`

#### 现状与建议

目前开发者尚未发布补丁，安全团队正紧急协调修复流程。研究人员**强烈建议**：

1. 企业用户立即在网络层阻断Clash Verge流量（端口检测策略）
2. 个人用户若非必要应暂时停用该软件
3. 关注官方GitHub仓库更新（[Clash Verge rev](https://github.com/zzzgydi/clash-verge)）

> **安全警示**：该漏洞可被勒索软件组织武器化，结合远程代码执行（RCE）漏洞将形成APT级攻击链。用户应启用系统完整性保护（SIP/TPM）并审查异常进程活动。

^^  
**参考资料**

1. 漏洞披露原始报告, [@KawaiiZapic](https://twitter.com/KawaiiZapic/status/1812146321071333520)
2. Clash Verge rev服务架构分析, [GitHub Issue #148](https://github.com/zzzgydi/clash-verge/issues/148)
3. 提权漏洞防护指南, [MITRE ATT&CK T1548](https://attack.mitre.org/techniques/T1548/)  
   ^^

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
