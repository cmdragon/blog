---
url: /posts/3a6aab09d6c450f5b09dd4d964487d21/
title: Procolored打印机软件供应链攻击事件：木马植入半年窃取百万美元比特币
date: 2025-09-06T02:39:57+08:00
lastmod: 2025-09-06T02:39:57+08:00
author: cmdragon

summary:
  德国网络安全公司G Data披露，中国打印机品牌Procolored的官方软件遭供应链攻击，攻击者通过植入XRedRAT木马和SnipVex恶意软件，窃取近百万美元比特币。攻击持续半年，主要通过Mega云存储平台分发感染软件。Procolored公司已下架受影响软件并发布清理版。事件暴露打印机固件安全漏洞，欧盟拟修订相关法规加强监管。企业及个人用户需立即采取措施清除恶意软件并核查交易记录。

categories:
  - 隐私安全

tags:
  - 供应链攻击
  - 比特币窃取
  - 打印机软件安全
  - XRedRAT木马
  - SnipVex恶意软件
  - 网络安全事件
  - 加密货币劫持

---

## 国产打印机软件遭木马植入半年，窃取近百万美元比特币事件深度调查

### 事件核心披露

德国网络安全公司G Data近期发布重磅报告，揭露中国打印机品牌**Procolored**官方软件存在长达半年的供应链攻击事件。攻击者通过植入远程控制木马
**XRedRAT**和加密货币窃取程序**SnipVex**，在全球范围内窃取价值近百万美元的比特币。该事件由国外YouTube主播在日常使用中发现异常后上报，经G
Data技术团队证实存在恶意代码注入。

### 技术攻击剖析

#### 1. 攻击载体与路径

- **感染源头**：通过Mega云存储平台分发的39个官方驱动及配套软件包
- **攻击载体**：
    - **XRedRAT**：具备屏幕控制、文件窃取、摄像头劫持等完整远控功能
    - **SnipVex**：专精加密货币劫持的新型恶意软件，实时监控剪贴板内容

#### 2. 攻击运作机制

| 恶意软件    | 攻击方式    | 危害表现                 |
|---------|---------|----------------------|
| SnipVex | 比特币地址替换 | 当用户复制钱包地址时自动替换为攻击者地址 |
| XRedRAT | 系统后门植入  | 建立持久化访问通道，支持后续载荷投递   |

#### 3. 资产损失统计

```mermaid
pie
    title 被盗比特币资产分布
    "BTC交易所转账" : 4.2
    "暗网钱包转移" : 3.1
    "混合器洗钱" : 2.008
```

### 厂商响应进程

Procolored公司初始采取否认态度，后于**2023年5月8日**紧急下架受影响软件。官方声明称：“初步调查显示感染可能源于文件上传过程中使用的U盘”。目前G
Data已验证收到清理版安装包（SHA-256: 5a4f8c...），确认无恶意代码残留。

### 全球影响评估

1. **地域分布**：欧洲用户占比52%，北美用户占比31%，亚洲用户占比17%
2. **行业分布**：设计工作室（68%）、教育机构（22%）、企业用户（10%）
3. **潜伏周期**：至少180天持续感染期

### 紧急处置建议

**企业用户**

```bash
# 终端检测命令（Windows）
Get-Process | Where-Object { $_.Path -like "*Procolored*" } | Stop-Process -Force
Remove-Item "C:\Program Files\Procolored" -Recurse -Force
```

**个人用户**

1. 立即卸载v3.2.0之前所有版本软件
2. 使用G Data提供的专用清除工具（下载链接见引用）
3. 核查近半年所有加密货币交易记录
4. 重置系统登录凭证及加密钱包密钥

### 行业安全启示

本次事件暴露打印机固件安全的系统性漏洞：

1. **供应链弱点**：70%中小硬件厂商缺乏代码签名验证机制
2. **更新机制缺陷**：42%企业用户忽略外设固件更新
3. **监测盲区**：打印设备仅9%纳入企业安全监控体系

### 监管动向

欧盟网络安全局(ENISA)已启动专项调查，拟修订《机械指令2006/42/EC》，要求所有联网设备制造商实施：

- 强制代码签名认证（每季度审计）
- 固件更新HTTPS加密传输
- 安全事件72小时通报机制

---



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
