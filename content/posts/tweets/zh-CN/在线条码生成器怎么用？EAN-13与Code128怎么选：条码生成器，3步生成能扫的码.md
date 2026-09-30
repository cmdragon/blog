---
url: /posts/online-barcode-generator-guide-2026/
title: 在线条码生成器怎么用？EAN-13与Code128怎么选：条码生成器，3步生成能扫的码
date: 2026-09-09T00:00:00+08:00
lastmod: 2026-09-09T00:00:00+08:00
author: cmdragon

summary: 条码生成的难点不是"画出来"，而是选对码制并保证扫得出来。一维码里 EAN-13 固定 13 位数字、用于零售商品，Code128 支持字母数字、密度高、适合物流与仓储，Code39 简单但冗余大；需要存更多信息则用二维码。3步：先定码制，再填数据，最后按静区与分辨率导出并实机试扫。

categories:
  - tweets

tags:
  - 免费工具
  - 条码生成器
  - EAN-13
  - Code128
  - 开发工具
---

> **立即体验**：[条码生成器 - 免费在线工具](https://tools.cmdragon.cn/zh/apps/barcode-generator) | [艺术二维码 - 免费在线工具](https://tools.cmdragon.cn/zh/apps/artistic-qrcode) | [更多1000+免费工具](https://tools.cmdragon.cn/zh/apps?category=trending)
>
> 无需下载安装，打开浏览器即用，完全免费！

扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

## 条码生成，难在哪？

条码看起来只是黑白条纹，但生成时最容易出问题的两步是**选错码制**和**导出参数不对**——前者导致业务系统读不懂，后者导致打印出来扫不出。

**先给结论**：按用途选码制——零售商品用 **EAN-13**（固定 13 位数字）；物流、仓储、内部编号用 **Code128**（支持字母数字、密度高）；简单工业标识可用 **Code39**；需要放网址、长文本或汉字时用二维码。定好码制后，用 [条码生成器](https://tools.cmdragon.cn/zh/apps/barcode-generator) 填入数据，导出时留意**静区、条宽与分辨率**三个参数，最后用手机实机扫一次。

## EAN-13、Code128、Code39 有什么区别？

这几种是最常见的一维码，区别集中在"能装什么"和"装多少"。

| 码制 | 字符集 | 长度 | 典型用途 | 特点 |
|------|--------|------|----------|------|
| EAN-13 | 纯数字 | 固定 13 位 | 零售商品 | 含校验位，全球通用 |
| EAN-8 | 纯数字 | 固定 8 位 | 小包装商品 | 尺寸小、容量低 |
| Code128 | 字母数字+符号 | 可变，密度高 | 物流、仓储、内部编号 | 同样长度装更多信息 |
| Code39 | 大写字母+数字+少量符号 | 可变 | 工业标识、资产管理 | 简单，但冗余大、条码长 |
| Code93 | 字母数字 | 可变 | 物流 | Code39 的紧凑改进版 |
| QR 码 | 任意文本/字节 | 可变，容量大 | 网址、名片、支付 | 可含汉字，容错可调 |

选择时可以用两句话判断：**要给别人扫的零售商品 → EAN-13；内部流转的编号、含字母 → Code128；要放网址或一段文字 → 二维码。**

关于 EAN-13 有一点必须说清楚：**零售商品条码的厂商识别代码需要向所在国家的编码机构（国内为中国物品编码中心）申请。自行生成的 EAN-13 只适合内部管理、样品或演示，不能用于正式上架销售**，否则会造成编码冲突与合规问题。

## 3步生成能扫的条码

👉 [立即体验 条码生成器](https://tools.cmdragon.cn/zh/apps/barcode-generator) ｜ [艺术二维码](https://tools.cmdragon.cn/zh/apps/artistic-qrcode)

### 3步从"选码制"到"扫得出来"

1. **定码制**：商品用 EAN-13，内部编号用 Code128，网址或长文本改用 [艺术二维码](https://tools.cmdragon.cn/zh/apps/artistic-qrcode)
2. **填数据**：在 [条码生成器](https://tools.cmdragon.cn/zh/apps/barcode-generator) 里输入内容；EAN-13 输满 13 位（末位为校验位，多数工具会自动补）
3. **调导出**：导出时保证左右**静区**留白、条宽不缩放变形、打印分辨率不低于 300 dpi，导出后用手机实机扫一次再批量印刷

| 环节 | 用什么工具 | 解决什么 |
|------|------------|----------|
| 生成一维码 | [条码生成器](https://tools.cmdragon.cn/zh/apps/barcode-generator) | EAN-13 / Code128 / Code39 |
| 生成二维码 | [艺术二维码](https://tools.cmdragon.cn/zh/apps/artistic-qrcode) | 网址、文本、汉字 |
| 转成印刷文件 | [图片转PDF](https://tools.cmdragon.cn/zh/apps/image-to-pdf) | 拼版与打印 |
| 核对色值 | [图片取色器](https://tools.cmdragon.cn/zh/apps/image-color-picker) | 检查深浅对比 |

两个实用提醒：

- **静区比图案更重要**：条码左右必须留出空白区，被文字或边框压住会直接导致扫不出，这是最常见的失败原因
- **颜色要够反差**：深条浅底最稳，避免红底、渐变底或低对比配色；打印后先扫一张样张再批量

需要拼版打印时，可以把导出的图片用 [图片转PDF](https://tools.cmdragon.cn/zh/apps/image-to-pdf) 合成一页，避免排版时二次缩放导致条宽失真。

## 更多免费工具推荐

生成条码之外，这些工具也能帮上忙。

- [条码生成器](https://tools.cmdragon.cn/zh/apps/barcode-generator) - 生成 EAN-13 / Code128 等一维码
- [艺术二维码](https://tools.cmdragon.cn/zh/apps/artistic-qrcode) - 生成可定制二维码
- [二维码解析器](https://tools.cmdragon.cn/zh/apps/qrcode-parser) - 解析已有二维码内容
- [图片转PDF](https://tools.cmdragon.cn/zh/apps/image-to-pdf) - 拼版与打印
- [图片取色器](https://tools.cmdragon.cn/zh/apps/image-color-picker) - 核对配色反差

[cmdragon工具站](https://tools.cmdragon.cn/zh) 上有**1000+免费在线工具**，不用下载安装，打开网页就能用，全部免费！

👉 [发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=trending)

## 常见问题解答

**EAN-13 和 Code128 该选哪个？**

看场景。EAN-13 是零售商品条码，固定 13 位纯数字，全球通用；Code128 支持字母数字且密度更高，适合物流单号、仓储库位、内部资产编号。含字母的场景不要硬塞进 EAN-13。

**EAN-13 最后一位校验位怎么来的？**

由前 12 位按固定权重计算得出，用于防止录入错误。多数条码工具会自动计算并补上末位，手动填时不要自己编造，否则扫码会校验失败。

**打印出来扫不出来是什么原因？**

按概率排查：静区被压住或留白不够、条宽被拉伸变形、打印分辨率过低导致边缘发虚、颜色对比不足、尺寸被缩得太小。先放大尺寸、加深颜色、留足静区，再换 300 dpi 以上打印。

**条码里能放汉字吗？**

一维码一般不行。需要汉字、网址或长文本时用二维码，用 [艺术二维码](https://tools.cmdragon.cn/zh/apps/artistic-qrcode) 生成，容错等级可以适当调高。

**自己生成的商品条码能直接上架销售吗？**

不能。零售商品条码的厂商识别代码需向中国物品编码中心等官方机构申请。自行生成的 EAN-13 只适合内部管理、样品或演示，正式流通请使用合法申请的编码。

**条码和二维码有什么本质区别？**

容量和维度不同。一维码只在水平方向存信息，容量小、需激光或影像式扫描枪识别；二维码在纵横两个方向存信息，容量大、手机直接可扫，还能设置容错等级。

---

**最后总结**：

条码生成关键是选对码制并保住可扫性：零售用 EAN-13，内部编号用 Code128，长文本与汉字用二维码。用 [条码生成器](https://tools.cmdragon.cn/zh/apps/barcode-generator) 填数据后，务必留足静区、保证 300 dpi 以上与足够颜色反差，批量印刷前先实机试扫一张。**正式销售的商品条码需向编码机构申请，自造码仅限内部使用。**

余下文章内容请点击跳转至 个人博客页面 或者 扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：[在线条码生成器怎么用？EAN-13与Code128怎么选：条码生成器，3步生成能扫的码](https://blog.cmdragon.cn/posts/online-barcode-generator-guide-2026/)

<details>
<summary>往期文章归档</summary>

- [Vue 3 静态与动态 Props 如何传递？TypeScript 类型约束有何必要？](https://blog.cmdragon.cn/posts/94ab48753b64780ca3ab7a7115ae8522/)
- [Vue 3中组件局部注册的优势与实现方式如何？](https://blog.cmdragon.cn/posts/dbf576e744870f6de26fd8a2e03e47da/)
- [如何在Vue3中优化生命周期钩子性能并规避常见陷阱？](https://blog.cmdragon.cn/posts/12d98b3b9ccd6c19a1b169d720ac5c80/)

</details>

<details>
<summary>免费好用的热门在线工具</summary>

- [条码生成器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/barcode-generator)
- [艺术二维码 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/artistic-qrcode)
- [图片转PDF - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/image-to-pdf)
- [CMDragon 在线工具 - 高级AI工具箱与开发者套件 | 免费好用的在线工具](https://tools.cmdragon.cn/zh)
- [应用商店 - 发现1000+提升效率与开发的AI工具和实用程序 | 免费好用的在线工具](https://tools.cmdragon.cn/zh/apps?category=trending)

</details>
