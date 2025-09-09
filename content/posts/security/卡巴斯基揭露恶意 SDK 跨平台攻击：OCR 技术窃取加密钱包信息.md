---
url: /posts/812851475ebe8b5d56fd6757378716a3/
title: 卡巴斯基揭露恶意SDK跨平台攻击：OCR技术窃取加密钱包信息
date: 2025-09-09T06:16:28+08:00
lastmod: 2025-09-09T06:16:28+08:00
author: cmdragon

summary:
  卡巴斯基实验室揭露了一起名为**SparkCat**的恶意SDK攻击事件，该SDK通过光学字符识别（OCR）技术窃取用户加密货币钱包的助记词与恢复密钥。攻击波及Google Play和Apple App Store中的数十款应用，主要影响使用中文、日文、韩文及拉丁语系的用户。黑客通过伪造服务器域名隐藏数据回传行为，攻击机制包括静默扫描、OCR识别和资产窃取。卡巴斯基建议用户立即卸载受感染应用，转移资产并启用双因素认证。此次事件暴露了应用商店审核机制的漏洞，跨平台攻击或成未来主流威胁。

categories:
  - 隐私安全

tags:
  - 恶意SDK
  - OCR技术
  - 加密货币安全
  - 跨平台攻击
  - 应用商店漏洞
  - 卡巴斯基
  - 数字资产防护

---

### 卡巴斯基揭露大规模恶意SDK攻击：加密钱包信息遭OCR窃取

**2025年2月6日** —— 卡巴斯基实验室今日发布安全警报，揭露一起波及全球应用商店的恶意软件渗透事件。名为**SparkCat**
的恶意SDK被发现嵌入Google Play与Apple App
Store中数十款应用中，通过光学字符识别（OCR）技术非法窃取用户加密货币钱包的助记词与恢复密钥。这是首次在iOS平台捕获利用OCR技术精准盗取加密资产的高危攻击，标志着移动安全威胁的进一步升级。

#### 跨平台攻击影响范围广泛

攻击主要针对使用中文、日文、韩文及拉丁语系语言的用户群体，但实际风险覆盖全球加密货币持有者。据卡巴斯基统计：

- **安卓用户**：至少24.2万次应用下载记录被确认感染；
- **iOS用户**：具体下载量尚难统计，但涉及应用数量远超安卓平台，包括主流工具、金融及社交类应用。  
  黑客通过伪造服务器域名（如仿冒阿里云的 `aliyung[.]com` 和 `aliyung[.]org`）掩藏数据回传行为，使攻击更具隐蔽性。

#### 攻击机制：OCR技术的恶意滥用

SparkCat SDK的攻击路径分为三步精密操作：

1. **静默扫描**：用户安装受感染应用后，后台自动启动屏幕扫描功能；
2. **OCR识别**：实时捕捉并解析屏幕中显示的加密钱包助记词或恢复密钥文本；
3. **资产窃取**：将数据发送至黑客控制的C2服务器，攻击者随即恢复用户钱包并转移全部资产。  
   该技术突破传统键盘记录或截屏攻击的局限，直接针对敏感信息可视化界面实施窃取，防御难度显著提升。

#### 部分高风险应用名单

卡巴斯基公布了部分感染应用，用户需立即检查设备是否安装以下程序：

- **安卓平台**：`com.crownplay.vanity.address`、`com.websea.exchange`、`org.safew.messenger`等；
- **iOS平台**：`im.pop.app.iOS.Messenger`、`com.blockchain.uttool`、`com.wukongwaimai.client`
  等共计37款应用（[完整清单](https://securelist.ru/sparkcat-stealer-in-app-store-and-google-play/111638/)）。

#### 关键应对措施

卡巴斯基提出四点紧急防护建议：

1. **立即卸载**：排查设备并删除所有列出的受感染应用；
2. **资产迁移**：将加密货币转移至新建钱包，原钱包密钥作废；
3. **强化验证**：启用双因素认证（2FA），优先使用硬件钱包；
4. **权限管控**：仅从官方渠道下载应用，警惕过度索权的程序。

#### 行业警示：应用商店安全防线亟待加固

此次事件暴露出应用商店审核机制的深层漏洞——即便谷歌与苹果的严格审查亦未能拦截高度伪装的恶意SDK。卡巴斯基研究员强调：“攻击者正利用OCR等新兴技术绕过传统防护体系，跨平台攻击将成为未来主流威胁范式。”

加密货币安全专家呼吁用户提升主动防御意识，并敦促应用商店运营商加强动态代码行为监测。随着数字资产普及率攀升，此类攻击的经济破坏力将呈指数级增长，协同防控已成当务之急。

---  
^^[卡巴斯基完整报告：SparkCat Stealer感染事件技术分析](https://securelist.ru/sparkcat-stealer-in-app-store-and-google-play/111638/)


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
