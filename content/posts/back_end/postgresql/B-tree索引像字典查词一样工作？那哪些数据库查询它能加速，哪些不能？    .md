---
url: /posts/f507856ebfddd592448813c510a53669/
title: B-tree索引像字典查词一样工作？那哪些数据库查询它能加速，哪些不能？
date: 2025-10-17T08:06:28+08:00
lastmod: 2025-10-17T08:06:28+08:00
author: cmdragon
cover: /images/52b0ab4f3f7c428d9965585393bacd1b~tplv-5jbd59dj06-image.png

summary:
  B-tree索引是PostgreSQL默认的索引类型，通过分层结构（根节点、分支节点、叶子节点）快速定位数据，时间复杂度为O(log n)。它支持比较操作符（如`=`、`>`）、范围查询（如`BETWEEN`）、空值判断（如`IS NULL`）以及锚定开头的模式匹配（如`LIKE 'foo%'`）。适用场景包括加速“等于”查询（如用户登录）、范围查询（如订单统计）和空值查询（如查找未激活用户）。不适用于结尾模糊匹配（如`LIKE '%phone'`）、非排序类操作（如`!=`）和低基数列（如性别）。

categories:
  - postgresql

tags:
  - 基础入门
  - B-tree索引
  - 数据库优化
  - 索引原理
  - 查询加速
  - 适用场景
  - 常见报错

---

<img src="/images/52b0ab4f3f7c428d9965585393bacd1b~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### B-tree索引：原理与适用场景

#### 什么是B-tree索引？

B-tree（平衡树）是PostgreSQL默认的索引类型，也是最常用的索引结构。它的设计目标是**快速定位符合条件的行**
，同时保持索引本身的平衡（避免“一边倒”的树形结构导致查询变慢）。你可以把B-tree想象成图书馆的“分类书架目录”：

- 最顶层是“根目录”（根节点），告诉你要找的书在哪个楼层；
- 中间层是“楼层索引”（分支节点），告诉你要找的书在哪个书架；
- 最底层是“书架上的书”（叶子节点），直接指向数据库中具体的行。

这种分层结构让数据库能在**O(log n)**的时间复杂度内找到目标数据（比如从100万行中找1行，只需要约20次查找），远快于全表扫描（O(
n)）。

#### B-tree的工作原理（用“字典查词”类比）

假设你有一本英语字典，要查“PostgreSQL”这个词：

1. **根节点判断**：字典的“首字母目录”（根节点）告诉你“P”开头的单词在第150页；
2. **分支节点定位**：翻到第150页，找到“Po”开头的单词在第160页；
3. **叶子节点查找**：翻到第160页，直接找到“PostgreSQL”的具体解释（对应数据库中的行）。

B-tree的逻辑完全一样：

- **根节点**：存储范围边界（比如“P”的起始位置）；
- **分支节点**：存储更细的范围（比如“Po”的起始位置）；
- **叶子节点**：存储具体的索引值和对应的行指针（比如“PostgreSQL”对应的行ID）。

关键特点：**叶子节点是有序且连续的**，这让B-tree不仅能快速找“等于”的值，还能快速找“范围”（比如“从P到Q的单词”）。

#### B-tree支持的操作符（官方明确列出）

根据PostgreSQL 17文档，B-tree索引能加速以下条件的查询：

1. **比较操作符**：`<`（小于）、`<=`（小于等于）、`=`（等于）、`>=`（大于等于）、`>`（大于）；
2. **组合操作**：`BETWEEN`（范围）、`IN`（多值匹配）、`IS NULL`/`IS NOT NULL`（空值判断）；
3. **模式匹配**：仅当pattern**锚定字符串开头**时，支持`LIKE`或`~`（正则），比如`col LIKE 'foo%'`
   （找以foo开头的字符串）、`col ~ '^foo'`（正则匹配开头）；但**不支持**`col LIKE '%bar'`（结尾模糊匹配）。

#### 适用场景案例

我们用**用户表**和**订单表**的例子，说明B-tree的实际用处：

##### 案例1：加速“等于”查询（用户登录）

假设你有一张`users`表，存储用户的邮箱和密码：

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);
```  

用户登录时，需要根据`email`查密码：

```sql
SELECT password_hash FROM users WHERE email = 'test@example.com';
```  

如果`email`列没有索引，数据库会扫描全表（比如100万行）找匹配的邮箱；如果创建B-tree索引：

```sql
-- PostgreSQL默认创建B-tree索引（无需写USING btree）
CREATE INDEX idx_users_email ON users (email);
```  

查询会直接通过索引定位到`email = 'test@example.com'`的行，速度提升100倍以上。

##### 案例2：加速“范围”查询（订单统计）

假设你有一张`orders`表，存储订单的时间和金额：

```sql
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    order_date TIMESTAMP NOT NULL,
    amount NUMERIC(10,2) NOT NULL
);
```  

要统计2024年上半年的订单总金额：

```sql
SELECT SUM(amount) FROM orders WHERE order_date BETWEEN '2024-01-01' AND '2024-06-30';
```  

如果`order_date`列有B-tree索引：

```sql
CREATE INDEX idx_orders_order_date ON orders (order_date);
```  

数据库会快速定位到`order_date`在2024年上半年的所有行，无需扫描全表。

##### 案例3：加速“空值”查询（查找未激活用户）

如果`users`表有一个`activated_at`列（记录激活时间，未激活则为NULL）：

```sql
ALTER TABLE users ADD COLUMN activated_at TIMESTAMP;
```  

要找所有未激活的用户：

```sql
SELECT * FROM users WHERE activated_at IS NULL;
```  

创建B-tree索引后，这个查询会被加速：

```sql
CREATE INDEX idx_users_activated_at ON users (activated_at);
```  

#### 不适用的场景

B-tree不是“万能索引”，以下情况不建议用：

1. **结尾模糊匹配**：比如`name LIKE '%phone'`（找以phone结尾的名字），B-tree无法加速；
2. **非排序类操作**：比如`!=`（不等于）、`NOT IN`（不在某个集合），这些操作需要扫描大部分索引，效率不如全表扫描；
3. **低基数列**：比如“性别”列（只有男/女/未知三个值），索引的区分度太低，查询时还是要扫描大部分行，不如不建。

### 课后Quiz：测试你的理解

**问题**：以下哪些查询可以使用B-tree索引？（多选）  
A. `SELECT * FROM products WHERE price > 100;`  
B. `SELECT * FROM products WHERE name LIKE '%phone';`  
C. `SELECT * FROM users WHERE email IS NULL;`  
D. `SELECT * FROM orders WHERE order_id IN (1001, 1002, 1003);`

**答案与解析**：

- **A**：支持（`>`是B-tree的操作符）；
- **B**：不支持（模糊匹配结尾）；
- **C**：支持（`IS NULL`是B-tree的操作）；
- **D**：支持（`IN`等价于多个`=`的组合）。  
  正确选项：**A、C、D**。

### 常见报错及解决方案

#### 报错1：`ERROR:  index "idx_users_email" does not exist`

**原因**：索引名称错误，或未创建索引。  
**解决**：

1. 检查索引名称是否正确（比如拼写错误）；
2. 用`CREATE INDEX`创建索引：`CREATE INDEX idx_users_email ON users (email);`  
   **预防**：创建索引后，用`\d users`（psql命令）或`SELECT * FROM pg_indexes WHERE tablename = 'users';`确认索引存在。

#### 报错2：`ERROR:  operator class "varchar_pattern_ops" does not exist for access method "btree"`

**原因**：在**非C locale**（比如中文、英文UTF-8）下，要支持`LIKE 'foo%'`这样的模式匹配，需要指定特殊的操作符类（operator
class）。  
**解决**：创建索引时指定`varchar_pattern_ops`（针对`VARCHAR`类型）：

```sql
CREATE INDEX idx_users_name ON users (name varchar_pattern_ops);
```  

**说明**：`varchar_pattern_ops`让B-tree能正确索引字符串的前缀匹配，适用于非C locale的数据库。

### 参考链接

- PostgreSQL 17官方文档：索引类型（B-tree部分）：https://www.postgresql.org/docs/17/indexes-types.html#INDEXES-TYPES-BTREE
- PostgreSQL 17官方文档：索引基础：https://www.postgresql.org/docs/17/indexes.html
- 索引与 ORDER BY：https://www.postgresql.org/docs/17/indexes-ordering.html
- 唯一索引：https://www.postgresql.org/docs/17/indexes-unique.html
- 索引 - only 扫描：https://www.postgresql.org/docs/17/indexes-index-only-scans.html

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[B-tree索引像字典查词一样工作？那哪些数据库查询它能加速，哪些不能？](https://blog.cmdragon.cn/posts/f507856ebfddd592448813c510a53669/)



<details>
<summary>往期文章归档</summary>

- [想抓PostgreSQL里的慢SQL？pg_stat_statements基础黑匣子和pg_stat_monitor时间窗，谁能帮你更准揪出性能小偷？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/b2213bfcb5b88a862f2138404c03d596/)
- [PostgreSQL的“时光机”MVCC和锁机制是怎么搞定高并发的？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/26614eb7da6c476dde41d367ad888d2f/)
- [PostgreSQL性能暴涨的关键？内存IO并发参数居然要这么设置？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/69f99bc6972a860d559c74aad7280da4/)
- [大表查询慢到翻遍整个书架？PostgreSQL分区表教你怎么“分类”才高效](https://blog.cmdragon.cn/posts/7b7053f392147a8b3b1a16bebeb08d0a/)
- [PostgreSQL 查询慢？是不是忘了优化 GROUP BY、ORDER BY 和窗口函数？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c856e3cb073822349f3bf2d29995dcfc/)
- [PostgreSQL里的子查询和CTE居然在性能上“掐架”？到底该站哪边？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c096347d18e67b7431faacd2c4757093/)
- [PostgreSQL选Join策略有啥小九九？Nested Loop/Merge/Hash谁是它的菜？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/2eca89463454fd4250d7b66243b9fe5a/)
- [PostgreSQL新手SQL总翻车？这7个性能陷阱你踩过没？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/068ecb772a87d7df20a8c9fb4b233f8e/)
- [PostgreSQL索引选B-Tree还是GiST？“瑞士军刀”和“多面手”的差别你居然还不知道？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/d498f63cd0a2d5a77e445c688a8b88db/)
- [想知道数据库怎么给查询“算成本选路线”？EXPLAIN能帮你看明白？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/9101b75bdec6faea9b35d54f14e37f36/)
- [PostgreSQL处理SQL居然像做蛋糕？解析到执行的4步里藏着多少查询优化的小心机？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/d527f8ebb6e3dae2c7dfe4c8d8979444/)
- [PostgreSQL备份不是复制文件？物理vs逻辑咋选？误删还能精准恢复到1分钟前？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/6bfdae84f313cf7ad0bb7045c4392347/)
- [转账不翻车、并发不干扰，PostgreSQL的ACID特性到底有啥魔法？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/de3672803de34dbad244d0a8d48b0eb5/)
- [银行转账不白扣钱、电商下单不超卖，PostgreSQL事务的诀窍是啥？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/e463e8a2668abdf00a228c9b79324ded/)
- [PostgreSQL里的PL/pgSQL到底是啥？能让SQL从“说目标”变“讲步骤”？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/5c967e595058c4a1fc4474a68e64031d/)
- [PostgreSQL视图不存数据？那它怎么简化查询还能递归生成序列和控制权限？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/325047855e3e23b5ef82f7d2db134fbd/)
- [PostgreSQL索引这么玩，才能让你的查询真的“飞”起来？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/d2dba50bb6e4df7b27e735245a06a2a2/)
- [PostgreSQL的表关系和约束，咋帮你搞定用户订单不混乱、学生选课不重复？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/849ae5bab0f8c66e94c2f6ad1bb798e3/)
- [PostgreSQL查询的筛子、排序、聚合、分组？你会用它们搞定数据吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/ef4800975ffa84f1ca51976a70a1585b/)
- [PostgreSQL数据类型怎么选才高效不踩坑？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/bf54711525c507c5eacfa7b0151c39d2/)
- [想解锁PostgreSQL查询从基础到进阶的核心知识点？你都get了吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/887809b3e0375f5956873cd442f516d8/)
- [PostgreSQL DELETE居然有这些操作？返回数据、连表删你试过没？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/934be1203725e8be9d6f6e9104e5abcc/)
- [PostgreSQL UPDATE语句怎么玩？从改邮箱到批量更新的避坑技巧你都会吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/0f0622e9b7402b599e618150d0596ffe/)
- [PostgreSQL插入数据还在逐条敲？批量、冲突处理、返回自增ID的技巧你会吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/0e3bf7efc030b024ea67ee855a00f2de/)
- [PostgreSQL的“仓库-房间-货架”游戏，你能建出电商数据库和表吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/b6cd3c86da6aac26ed829e472d34078e/)
- [PostgreSQL 17安装总翻车？Windows/macOS/Linux避坑指南帮你搞定？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/ba1f545a3410144552fbdbfcf31b5265/)
- [能当关系型数据库还能玩对象特性，能拆复杂查询还能自动管库存，PostgreSQL凭什么这么香？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/b5474d1480509c5072085abc80b3dd9f/)
- [给接口加新字段又不搞崩老客户端？FastAPI的多版本API靠哪三招实现？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/cc098d8836e787baa8a4d92e4d56d5c5/)
- [流量突增要搞崩FastAPI？熔断测试是怎么防系统雪崩的？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/46d05151c5bd31cf37a7bcf0b8f5b0b8/)
- [FastAPI秒杀库存总变负数？Redis分布式锁能帮你守住底线吗 - cmdragon's Blog](https://blog.cmdragon.cn/posts/65ce343cc5df9faf3a8e2eeaab42ae45/)
- [FastAPI的CI流水线怎么自动测端点，还能让Allure报告美到犯规？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/eed6cd8985d9be0a4b092a7da38b3e0c/)
- [如何用GitHub Actions为FastAPI项目打造自动化测试流水线？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/6157d87338ce894d18c013c3c4777abb/)
- [如何用Git Hook和CI流水线为FastAPI项目保驾护航？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/fc4ef84559e04693a620d0714cb30787/)
- [FastAPI如何用契约测试确保API的「菜单」与「菜品」一致？](https://blog.cmdragon.cn/posts/02b0c96842d1481c72dab63a149ce0dd/)
- [为什么TDD能让你的FastAPI开发飞起来？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c9c1e3bb0fdc15303b9b3b1f20124b0b/)
- [如何用FastAPI玩转多模块测试与异步任务，让代码不再“闹脾气”？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/ddbfa0447a5d0d6f9af12e7a6b206f70/)
- [如何在FastAPI中玩转“时光倒流”的数据库事务回滚测试？](https://blog.cmdragon.cn/posts/bf9883a75ffa46b523a03b16ec56ce48/)
- [如何在FastAPI中优雅地模拟多模块集成测试？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/be553dbd5d51835d2c69553f4a773e2d/)
- [多环境配置切换机制能否让开发与生产无缝衔接？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/533874f5700b8506d4c68781597db659/)
- [如何在 FastAPI 中巧妙覆盖依赖注入并拦截第三方服务调用？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/2d992ef9e8962dc0a4a0b5348d486114/)
- [为什么你的单元测试需要Mock数据库才能飞起来？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/6e69c0eedd8b1e5a74a148d36c85d7ce/)
- [如何在FastAPI中巧妙隔离依赖项，让单元测试不再头疼？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/77ae327dc941b0e74ecc6a8794c084d0/)
- [如何在FastAPI中巧妙隔离依赖项，让单元测试不再头疼？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/77ae327dc941b0e74ecc6a8794c084d0/)
- [测试覆盖率不够高？这些技巧让你的FastAPI测试无懈可击！ - cmdragon's Blog](https://blog.cmdragon.cn/posts/0577d0e24f48b3153b510e74d3d1a822/)
- [为什么你的FastAPI测试覆盖率总是低得让人想哭？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/985c18ca802f1b6da828b92e082b4d4e/)
- [如何让FastAPI测试不再成为你的噩梦？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/29858a7a10d20b4e4649cb75fb422eab/)
- [FastAPI测试环境配置的秘诀，你真的掌握了吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/6f9e71e8313db6de8c1431877a70b67e/)
- [全链路追踪如何让FastAPI微服务架构的每个请求都无所遁形？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/30e1d2fbf1ad8123eaf0e1e0dbe7c675/)

</details>


<details>
<summary>免费好用的热门在线工具</summary>

- [Mermaid 在线编辑器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/mermaid-live-editor)
- [数学求解计算器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/math-solver-calculator)
- [智能提词器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/smart-teleprompter)
- [魔法简历 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/magic-resume)
- [Image Puzzle Tool - 图片拼图工具 | By cmdragon](https://tools.cmdragon.cn/zh/apps/image-puzzle-tool)
- [字幕下载工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/subtitle-downloader)
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