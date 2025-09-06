---
url: /posts/b1fa0214d2d5d15016dbb81af17b2af8/
title: Clash Verge远程执行漏洞威胁全球超1.3万资产安全
date: 2025-09-06T03:19:06+08:00
lastmod: 2025-09-06T03:19:06+08:00
author: cmdragon

summary:
  Goby安全团队披露Clash Verge代理客户端存在高危远程命令执行漏洞（CVE-2025-XXXXX），全球超过13,700个暴露资产面临直接威胁。该漏洞通过默认暴露的Web控制服务、CORS跨域绕过和路径穿越攻击，允许攻击者完全控制用户设备。成功利用可导致流量劫持、系统沦陷、网络破坏和供应链攻击。中国、美国、德国为受影响最严重地区。建议用户立即升级至Clash Verge ≥ v2.3.0或Mihomo核心 ≥ v1.20.1，并关闭暴露端口以防范风险。

categories:
  - 隐私安全

tags:
  - 网络安全漏洞
  - 远程命令执行
  - Clash Verge
  - 全球风险分布
  - 紧急修复方案
  - 系统沦陷
  - 供应链攻击

---


## Clash Verge 爆高危远程执行漏洞，全球超1.3万资产面临劫持风险

**2025年5月19日** - Goby安全团队今日披露Clash Verge代理客户端存在高危远程命令执行（RCE）漏洞（CVE-2025-XXXXX），该漏洞允许攻击者通过恶意网页
**完全控制用户设备**。据网络空间测绘平台FOFA统计，全球已有**超过13,700个暴露资产**面临直接威胁，涉及代理服务器、企业网关及个人用户等多种场景。

### 漏洞技术原理：三重缺陷构成的完美攻击链

该漏洞构建在三个关键技术缺陷上：

1. **默认暴露隐患**：所有历史版本（Clash ≤ v2.2.4 / Mihomo ≤ v1.19.8）默认开启9090/9097端口的Web控制服务，且无访问控制机制
2. **CORS跨域绕过**：REST API未验证请求来源，允许任意网站跨域修改核心配置
3. **路径穿越攻击**：通过`external-ui`字段注入恶意路径，实现任意文件写入

攻击者仅需诱导用户访问恶意网页，即可通过以下链式攻击：

```http
POST /configs HTTP/1.1
Host: target-ip:9090
{
  "external-ui": "../../../../../tmp/malicious_zip"
}
```

该操作将恶意ZIP包写入系统目录，后续通过UI模块异常触发解压执行，最终获取系统级控制权限。

### 灾难性危害场景

成功利用该漏洞可造成多重后果：

1. **流量劫持**：篡改代理规则，窃取银行凭证、企业VPN账号等敏感信息
2. **系统沦陷**：植入远控木马、勒索软件或加密货币挖矿程序
3. **网络破坏**：通过`iptables`规则清空实现永久断网
4. **供应链攻击**：在企业内部网络横向移动，渗透核心系统

### 全球风险分布

根据网络空间测绘数据分析：

- **中国**（42%）、美国（23%）、德国（8%）为受影响最严重地区
- 企业级部署占比67%，多为分支机构网络出口网关
- 23%为教育机构代理服务器，存大量学生隐私数据

### 紧急修复方案

Goby团队联合开发者发布以下应对措施：

1. **立即升级**：
    - Clash Verge ≥ v2.3.0
    - Mihomo核心 ≥ v1.20.1
2. **网络隔离**：
   ```bash
   # 紧急关闭暴露端口
   sudo firewall-cmd --permanent --remove-port=9090/tcp
   sudo firewall-cmd --permanent --remove-port=9097/tcp
   ```
3. **配置审查**：
    - 检查所有`config.yaml`中`external-ui`路径
    - 删除未授权的第三方UI插件

安全专家警告，该漏洞已存在野外利用迹象，建议用户**在24小时内完成修补**，尤其是金融、医疗等关键基础设施单位需启动应急响应预案。

^^
参考文献：

1. Goby安全团队漏洞公告 [gobies.org/updates?v=15]
2. FOFA网络空间测绘报告 [fofa.info/clash_verge_scan]

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
