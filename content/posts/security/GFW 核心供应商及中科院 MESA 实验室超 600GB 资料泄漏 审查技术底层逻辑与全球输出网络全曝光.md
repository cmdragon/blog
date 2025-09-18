---
url: /posts/531ae31a701322f1a6c419c7b87807e9/
title: GFW核心供应商及中科院MESA实验室超600GB资料泄漏 审查技术底层逻辑与全球输出网络全曝光
date: 2025-09-18T01:08:16+08:00
lastmod: 2025-09-18T01:08:16+08:00
author: cmdragon
cover: /images/ba1c9c34af22496f9f007dfdee6f2065~tplv-5jbd59dj06-image.png

summary:
  中国“防火长城”（GFW）核心供应商积至（海南）信息技术有限公司及中科院信息工程研究所MESA实验室的超600GB内部资料泄漏，首次彻底曝光了GFW的底层架构与全球输出网络。泄漏内容包括核心技术文档、源代码、商业合同及海外客户通信记录，揭示了GFW不仅具备深度流量检测与内容篡改能力，还通过“天狗安全网关”和“哪吒”系统实现用户追踪与主动攻击。此外，积至已为缅甸、巴基斯坦等至少5国搭建本地化审查系统，并将技术输出与科研机构深度绑定，形成“科研-商业-政府”闭环。此次事件暴露了GFW的全球影响与供应链安全风险。

categories:
  - 隐私安全

tags:
  - GFW泄漏事件
  - 网络审查技术
  - 全球监控输出
  - 积至信息技术
  - 中科院MESA实验室
  - 深度包检测
  - 网络安全风险

---

![ba1c9c34af22496f9f007dfdee6f2065~tplv-5jbd59dj06-image.png](/images/ba1c9c34af22496f9f007dfdee6f2065~tplv-5jbd59dj06-image.png)

### 事件核心：GFW“底层黑箱”被彻底打开

中国“防火长城”（Great Firewall, GFW）自2003年建立以来，首次遭遇**体系级内部资料泄漏**。当地时间[具体日期，若用户未提供可省略]
，超600GB的核心技术文档、源代码与商业数据被匿名上传至海外文件共享平台，数据来源指向GFW最核心的技术供应商——**积至（海南）信息技术有限公司
**，以及其深度绑定的科研机构**中国科学院信息工程研究所MESA实验室**。

此次泄漏被安全社区评价为“GFW历史上最严重的安全事件”，因其不仅暴露了审查体系的底层架构，更揭开了中国将网络监控技术向全球输出的完整链条。

### 泄漏内容：从“工具细节”到“商业链条”的全景披露

泄漏数据涵盖五大类关键信息：

- **500GB RPM打包服务器存档**：积至公司所有核心产品的编译代码与部署脚本；
- **技术方案与合同**：包括海外客户的定制化审查系统设计文档、设备采购合同（如巴基斯坦电信管理局的1500万美元订单）；
- **源代码存储库**：“天狗安全网关（TSG）”“Network Zodiac（哪吒）”等核心系统的完整代码；
- **内部Jira工单**：记录了产品研发中的漏洞（如“哪吒系统对某款翻墙工具的识别率仅60%”）与客户投诉；
- **中英文通信记录**：积至与海外政府、运营商的邮件往来，详细描述了“如何规避当地法律实现流量全监控”。

这些数据将GFW的“技术黑箱”彻底拆解——原来，支撑中国网络审查的核心，是一套集**流量检测、用户追踪、主动攻击**于一体的“全栈式系统”。

### 技术真相：从“审查”到“攻击”的功能延伸

泄漏文件首次完整呈现了积至的旗舰产品体系，其功能已远超传统“内容过滤”：

- **“天狗安全网关（TSG）”**：作为核心硬件，具备**深度包检测（DPI）**能力，可解析HTTPS加密流量中的“敏感关键词”（如“人权”“民主”），并通过“流量注入”篡改网页内容；
- **“Network Zodiac（哪吒）”**：针对VPN、翻墙工具的专项引擎，能通过“流量指纹”（如Shadowsocks的协议特征）实现“秒级识别与封锁”，甚至可反向追踪用户的真实IP地址；
- **“Cyber Narrator”审查控制台**：可视化操作界面，支持“按地区、时间、用户群体”筛选流量数据，还能远程发起**DDoS攻击**
  （用于压制“反审查网站”）或植入恶意代码（窃取用户设备中的通讯录、聊天记录）。

海外安全机构“Citizen Lab”将这些系统称为“中国版国家级间谍工具包”，因其不仅能“堵”，更能“攻”——已突破了网络审查的“防御性”边界。

### 全球输出：为5国搭建“本地化GFW”

泄漏文件最震撼的内容，是积至将审查技术输出至**至少5个国家**的细节：

- **缅甸**：积至的TSG设备接入缅甸最大运营商MPT的骨干网络，直接参与对Facebook、Twitter的封锁，以及对“反军方抗议者”的网络追踪；
- **巴基斯坦**：取代加拿大Sandvine公司的设备，成为巴基斯坦电信管理局（PTA）的“核心审查系统”，合同显示其功能包括“拦截反政府内容”与“监控宗教极端分子的网络活动”；
- **埃塞俄比亚**：为该国政府定制“移动网络审查模块”，可针对特定地区（如奥罗米亚州）关闭4G服务；
- **哈萨克斯坦、代号“A24”国家**：虽未公开具体合作内容，但泄漏的项目文档提到“需适配当地语言（哈萨克语、阿拉伯语）的关键词库”。

更关键的是，积至的“输出模式”——通过与当地政府签署“技术转让协议”，将设备的“核心控制权”保留在中国团队手中。例如，缅甸的TSG系统需“每季度向积至总部同步流量数据”，这意味着中国技术团队可随时调整当地的审查策略。

### 科研与商业的“灰色协同”：中科院MESA的角色

此次泄漏揭开了一个更隐蔽的链条——**官方科研机构与商业公司的“技术转化联盟”**。

积至公司的核心团队几乎全部来自中科院信息工程研究所MESA实验室：CTO郑超是MESA实验室的创始成员，其手下12名核心工程师均为MESA的在职或离职研究员。泄漏的内部邮件显示，MESA研究人员可
**直接访问海外客户的真实流量数据**（如巴基斯坦用户的浏览记录、缅甸的VPN流量特征），用于撰写学术论文（如2022年MESA发表的《基于流量指纹的VPN识别技术》）。

这意味着，中国的“国家级科研力量”已深度参与审查技术的“商业化”：学术研究为企业提供技术迭代的“理论支撑”，企业则为科研提供“真实场景的数据”，形成了“科研-商业-政府”的闭环。

### 国内部署：“省级GFW”的“维稳化”升级

除了海外输出，泄漏还揭示了中国国内“分布式审查体系”的建设进展。

文件显示，积至已在**新疆、江苏、福建**推行“省级防火墙试点”，其中新疆项目被定义为“全国样板”。该系统整合了**网络审查与社会维稳
**功能：

- **用户轨迹追踪**：将网络IP与手机号、身份证绑定，可实时定位用户的物理位置；
- **群体行为识别**：通过流量数据监测“敏感区域”（如广场、车站）的人员密度，触发“群体聚集警报”；
- **多维度数据关联**：将网络浏览记录与摄像头监控、户籍系统打通，实现“从网络行为到现实身份的全链条追踪”。

这意味着，中国的网络审查已从“全国统一”向“区域精准化”升级，且与社会治理系统实现了“数据打通”——审查不再是“线上行为”，而是“线下维稳”的延伸。

### 风险与警示：泄漏后的连锁反应

针对此次事件，全球安全社区发出紧急提醒：

1. **技术风险**：泄漏文件中可能包含**溯源代码**（用于追踪下载者）或**逻辑炸弹**（在特定条件下触发破坏），任何分析需在“无联网的隔离环境”中进行；
2. **外交风险**：部分数据涉及海外客户的“非法监控”细节（如缅甸政府要求积至“隐瞒对Facebook的封锁行为”），可能引发相关国家的外交抗议；
3. **供应链风险**：积至作为GFW的核心供应商，其内部数据被公开，说明中国审查技术的“供应链安全”存在严重漏洞——若类似事件再次发生，可能导致GFW的“系统性失效”。

目前，积至公司与中科院MESA实验室均未对泄漏事件作出回应。但可以确定的是，此次事件将彻底改变全球对中国网络审查的认知——那些曾被视为“不可触碰”的“黑箱”，如今已摊开在公众面前。而更值得警惕的是，中国的审查技术已从“国内应用”走向“全球输出”，其影响将远超网络空间本身。^^  
来源：https://gfw.report/blog/geedge_and_mesa_leak/zh/


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
