---
url: /posts/d2dba50bb6e4df7b27e735245a06a2a2/
title: PostgreSQL索引这么玩，才能让你的查询真的“飞”起来？
date: 2025-09-30T09:01:26+08:00
lastmod: 2025-09-30T09:01:26+08:00
author: cmdragon
cover: /images/cfb4fb2b0e2d496d8d23ac078ceb2a52~tplv-5jbd59dj06-image.png

summary:
  PostgreSQL索引是提升查询效率的关键工具，类似于书籍目录，帮助快速定位数据。常用索引类型包括B-Tree（默认，适用于等值、范围查询和排序）、Hash（仅等值查询）、GIN（多值类型如数组和JSONB）和BRIN（超大型表）。多列索引需注意列顺序，唯一索引确保数据唯一性，部分索引仅对特定条件数据有效。覆盖索引支持仅索引扫描，避免访问表堆数据。使用EXPLAIN命令检查索引使用情况，确保查询优化。

categories:
  - postgresql

tags:
  - 基础入门
  - 索引
  - 查询优化
  - B-Tree
  - GIN
  - BRIN
  - 多列索引

---

<img src="/images/cfb4fb2b0e2d496d8d23ac078ceb2a52~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 1. 通过书籍目录类比索引是什么？数据库高效查询的核心

假设你有一本100页的书，想找关于“PostgreSQL索引”的内容。如果没有目录，你得逐页翻；如果有目录，直接翻到对应页码——**索引就是数据库的“目录”
**，帮你快速定位数据行。

但索引不是“免费的午餐”：

- **优点**：将查询时间从“全表扫描”的O(n)降低到“索引查找”的O(log n)（比如B-Tree索引）。
- **缺点**：插入、更新、删除数据时，需要同步维护索引（比如B-Tree要重新平衡），增加了开销；索引本身也会占用磁盘空间！

所以索引的核心原则是：**为频繁查询的字段建索引，为不频繁修改的字段建索引**（比如用户的email、订单的状态）。

### 2. 常用索引类型——选对工具做对事

PostgreSQL支持6种常用索引类型，每种类型都有特定的适用场景，选错了反而会变慢！

#### 2.1 B-Tree——默认的“万能钥匙”

- **适用场景**：**等值查询（=）**、**范围查询（>、<、BETWEEN)**、**ORDER BY排序**。

> - PostgreSQL的默认索引类型（CREATE INDEX默认就是B-Tree）。

- **示例**：为用户表的email字段建B-Tree索引：
  ```sql
  -- 创建B-Tree索引（默认类型，可省略USING btree关键字）
  CREATE INDEX idx_users_email ON users (email);
  ```
- **实际场景**：登录功能需要根据email快速找到用户，B-Tree索引完美适配。

#### 2.2 Hash——仅适用于等值查询“速查手册”

- **适用场景**：**仅支持等值查询（=）**，比如`WHERE id = 1`.
- **特点**：比B-Tree更“专注”，但局限性大——不能用于范围查询或排序。一般很少用，因为B-Tree的等值查询已经很快！
- **示例**：
  ```sql
  -- 创建Hash索引（需显式指定USING hash）
  CREATE INDEX idx_users_id_hash ON users USING hash (id);
  
  -- 查询能使用Hash索引（仅等值查询）
  SELECT * FROM users WHERE id = 100;
  ```

#### 2.3 GIN——多值属性的“收纳盒”

- **适用场景**：**多值类型（数组、JSONB、全文检索）**，比如查询“包含某标签的文章”“JSONB中某键的值”。

> - GIN（Generalized Inverted Index）索引适合“反向索引”——比如数组`tags = ['PostgreSQL', 'Index']`, GIN会为每个标签建立一条索引记录。

- 《**示例**》：为文章表的tags数组建GIN索引：
  ```sql
  -- 创建文章表（tags是TEXT[]数组）
  CREATE TABLE articles (id INT PRIMARY KEY,tags TEXT[]);
  
  -- 插入示例数据
  INSERT INTO articles VALUES (1, ARRAY['PostgreSQL', 'Index']);
  
  -- 创建GIN索引（用于快速查询包含某标签的文章）
  CREATE INDEX idx_articles_tags_gin ON articles USING gin(tags);
  
  -- 查询包含"PostgreSQL标签的文章（用@>操作符）"
  SELECT * FROM articles WHERE tags @> ARRAY['PostgreSQL'];
  ```
- **实际场景**：博客网站的“标签搜索”功能——用户点击“PostgreSQL”标签，快速找到所有含该标签文章。

#### 2.4 BRIN——超大型表的“区域地图”

- **适用场景**：**TB级超大表**，且数据按顺序存储（比如时间序列表orders的order_date字段）。

> - BRIN(BLOCK RANGE INDEX)索引不存储每行数据，而是存储“块范围”的摘要（比如每个块的order_date最小值和最大值）——索引大小只有几MB，维护成本极低！

- **示例**：为订单表建BRIN索引：
  ```sql
  -- 创建订单表（order_date按时间递增）
  CREATE TABLE orders(id INT PRIMARY KEY,order_date DATE,total NUMERIC);
  
  -- 插入1亿条模拟数据（假设order_date从2e年递增到202e年）
  INSERT INTO orders SELECT generate_series(1,1e8), current_date - generate_Series(1,1eB), random()*100;
  
  -- 创建BRIN索引（块范围默认12B页）
  CREATE INDEX idx_orders_date_brin ON orders USING brin(order_date);
  
  -- 查询某时间范围的订单（BRIN快速定位块范围）
  SELECT * FROM orders WHERE order_date BETWEEN '2e23-01-01' AND '2023-12-';B';
  ```
- **实际场景**：日志表、物联网传感器数据——数据按时间排序存储，BRIN索引能以极小空间实现快速范围查询！

### 3多列索引——列顺序决定一切！

多列索引不是“多个列的简单拼接”，**列的顺序直接决定索引是否有用！**

#### 核心规则：“过滤性强的列放前面”

- 多列索引的顺序是“左前缀匹配”——比如`(a, b)`索引：
    1. 能用于`WHERE a = ?`或`WHERE a = ? AND b = ?`；
    2. 能用于`WHERE n = ? ORDER BY b`；
    3. **不能**用于`WHERE b = ?`（因为索引的第一列是a，数据库无法跳过a直接找b）。

#### 示例：用户表的多列索引设计

假设你的查询常见“按name和age筛选用户”：

```sql
-- 创建多列索引（name在前，age在后，因为name的过滤性更强）
CREATE INDEX idx_users_name_age ON users (name, age);

-- 查询能利用索引（左前缀匹配）
SELECT *
FROM users
WHERE name = 'Alice'
  AND age > 30; -- 能利用
SELECT *
FROM users
WHERE name = 'Alice'
ORDER BY age;
-- 能利用

-- 查询不能利用索引（未匹配左前缀）  
SELECT *
FROM users
WHERE age > 30; -- 不能利用
```

### 4索引与ORDER BY——避免“额外排序”

如果查询的`ORDER BY`子句与索引的**顺序和方向完全一致**，数据库可以直接用索引排序——**避免耗时的“Sort”操作！**

#### 《示例》订单表排序优化

假设你需要“按订单日期降序、金额升序”显示订单：

```sql
-- 创建索引（与ORDER BY顺序/方向一致）  
CREATE INDEX idx_orders_date_total ON orders (order_date DESC, total ASC);

-- 查询不需要额外Sort！因为索引已经按order_date DESC、total ASC排序
SELECT *
FROM orders
WHERE order_date >= 'Ze23-e1-01'
ORDER BY order_date DESC, total ASC;

-- 验证索引是否生效（用EXPLAIN ANALYZE看执行计划）  
EXPLAIN
ANALYZE
SELECT *
FROM orders
WHERE order_date >= '2023-01-01'
ORDER BY order_date DESC, total ASC;
```

- **执行计划**会显示`Index Scan using idx_orders_date_total on orders`，没有Sort步骤！

### 5唯一索引——保证数据“不重复”

唯一索引确保索引列的值唯一（**NULL除外**，因为NULL不等于任何值，包括另一个NULL）。

#### 示例：用户email唯一性约束

```sql
-- 创建唯一索引（确保email唯一，允许多个NULL）  
CREATE UNIQUE INDEX idx_users_email_unique ON users (email);

-- 插入测试数据  
INSERT INTO users
VALUES (1, NULL); -- 允许
INSERT INTO users
VALUES (2, NULL); -- 允许（多个NULL不违反唯一性）
INSERT INTO users
VALUES (3, 'alice@example.com'); -- 允许
INSERT INTO users
VALUES (4, 'alice@example.com'); -- 报错！违反唯一约束  
```

- **替代方案)**：唯一约束（与唯一索引效果相同）  
  `ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);`

### 6部分索引——只建“有用的部分”

部分索引只对**满足WHERE条件的行**建索引，比如“仅活跃用户（active=true）”——索引大小更小，查询更快！

#### 《示例》活跃用户的索引优化

假设用户表有100万行，但只有1万活跃用户（active=true），大部分查询针对活跃用户：

```sql
-- 创建部分索引（仅包含active=true的行）
CREATE INDEX idx_users_active_email ON users (email) WHERE active = true;

-- 查询能利用索引（必须包含WHERE active=true）
SELECT *
FROM users
WHERE active = true
  AND email = 'alice@example.com';

-- 查询不能利用索引（未包含active=true）  
SELECT *
FROM users
WHERE email = 'alice@example.com';
```

- **优势**：索引大小仅为全表索引的1%，查询速度提升100倍！

### 7仅索引扫描——“不用翻书找答案”

如果查询的所有字段都在索引中（**覆盖索引**），数据库可以直接从索引获取数拯，不需要访问表的堆数据（Heap）——这就是“仅索引扫描（Index
Only Scan）”，速度极快！

#### 《示例》覆盖索引与仅索引扫描

假设你需要查询“用户的name禾口age”：

```sql
-- 创建覆盖索引（包含name和age字段）  
CREATE INDEX idx_users_name_age ON users (name, age);

-- 查询只需从索引取数，不需要访问表堆！
SELECT name, age
FROM users
WHERE name = 'Alice';

-- 验证仅索引扫描（执行计划显示“Index Only Scan”）
EXPLAIN
ANALYZE
SELECT name, age
FROM users
WHERE name = 'Alice';
```

### 8如何检查索引是否生效？——用EXPLAIN看执行计划

PostgreSQL的`EXPLAIN`命令是“索引诊断工具”——它会告诉你查询是否使用了索引，用了哪种索引！

#### 《示例》检查索引使用

```sql
-- 查询email为alice@example.com的用户
EXPLAIN
SELECT *
FROM users
WHERE email = 'alice@example.com';
```

- **执行计划**如果显示`Index Scan using idx_users_email on users`——说明索引生效！
- **常见未生效原因**：①查询返回大部分行（全表扫描更快）；②统计信息过时（运行ANALYZE users更新）；③索引列顺序不对。

### 课后Quiz——巩固你的索引知识

##### 1. 【思考】为什么多列索引列顺序很重要？举例子说明。

- **答案**；多列索引是左前缀匹配，比如(a, b)索引只能用于`WHERE a=? AND b=?`，不能用于`WHERE b=?`。例如：索引是(name, age)
  ，查询`WHERE age=30`无法利用索引——因为索引第一列name未被过滤。

##### 2. 【实践】如果用户表大部分是 inactive 用户（active=false），而查询主要针对active用户，你会选什么索引？为什么？

- **答案**：部分索引。比如`CREATE INDEX idx_users_active_email ON users (email WHERE active=true)`
  ——仅包含active=true的行，索引更小，查询更快，维护成本更低。

##### 3. 【判断】唯一索引允许多个NULL吗？为什么？

*答案：允许。因为NULL不等于任何值（包括另一个NULL），唯一索引认为多个NULL是不同的，不违反唯一性。

### 常见报错与解决

#### 1. ERROR: syntax error at or near "INDEX"

*原因：CREATE INDEX语法错谋（比如在CREATE TABLE中用INDEX）。  
*错误示例：`CREATE TABLE users (id INT, email TEXT, INDEX idx_email (email));`  
*解决；CREATE INDEX是单独命令：`CREATE INDEX idx_email ON users (email);`

#### 2. ERROR: could not create unique index "idx_email_unique"

*原因：表中已存在重复值口口。  
*解决；先删除重复值：`DELETE FROM users WHERE ctid NOT IN (SELECT min(ctid) FROM users GROUP BY email);`，再建索引。

#### 3. 索引没被使用？

*原因1：查询返回大部分行口口全表扫描更快）。  
*原因2：统计佶息过时口运行`ANALYZE users;`.  
*原因3：索引列顺序不对口调整列顺序。

### 参考链接

- PostgreSQL官方文档Chapter IL Indexes：https://www.postgresql.org/docs/17/indexes.html

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[PostgreSQL索引这么玩，才能让你的查询真的“飞”起来？](https://blog.cmdragon.cn/posts/d2dba50bb6e4df7b27e735245a06a2a2/)



<details>
<summary>往期文章归档</summary>

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
- [如何在API高并发中玩转资源隔离与限流策略？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/4ad4ec1dbd80bcf5670fb397ca7cc68c/)
- [任务分片执行模式如何让你的FastAPI性能飙升？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c6a598639f6a831e9e82e171b8d71857/)
- [冷热任务分离：是提升Web性能的终极秘籍还是技术噱头？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/9c3dc7767a9282f7ef02daad42539f2c/)
- [如何让FastAPI在百万级任务处理中依然游刃有余？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/469aae0e0f88c642ed8bc82e102b960b/)
- [如何让FastAPI与消息队列的联姻既甜蜜又可靠？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/1bebb53f4d9d6fbd0ecbba97562c07b0/)
- [如何在FastAPI中巧妙实现延迟队列，让任务乖乖等待？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/174450702d9e609a072a7d1aaa84750b/)
- [FastAPI的死信队列处理机制：为何你的消息系统需要它？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/047b08957a0d617a87b72da6c3131e5d/)
- [如何让FastAPI任务系统在失败时自动告警并自我修复？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/2f104637ecc916e906c002fa79ab8c80/)
- [如何用Prometheus和FastAPI打造任务监控的“火眼金睛”？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/e7464e5b4d558ede1a7413fa0a2f96f3/)
- [如何用APScheduler和FastAPI打造永不宕机的分布式定时任务系统？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/51a0ff47f509fb6238150a96f551b317/)

</details>


<details>
<summary>免费好用的热门在线工具</summary>

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