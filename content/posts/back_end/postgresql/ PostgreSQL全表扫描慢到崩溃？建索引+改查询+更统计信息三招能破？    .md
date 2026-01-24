---
url: /posts/748cdac2536008199abf8a8a2cd0ec85/
title: PostgreSQL全表扫描慢到崩溃？建索引+改查询+更统计信息三招能破？
date: 2025-10-20T03:15:06+08:00
lastmod: 2025-10-20T03:15:06+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/85378aa2dd324c30baec694854257732~tplv-5jbd59dj06-image.png

summary:
  全表扫描在PostgreSQL中会逐行读取表数据，适用于小表，但对大表会导致性能问题。查询规划器通过生成候选计划、计算代价并选择最优执行计划来优化查询。避免全表扫描的核心是为关键列创建索引，如WHERE子句、JOIN条件和排序/分组列。查询语句应避免前缀通配符、列函数和隐式类型转换，使用显式JOIN。统计信息的准确性对规划器决策至关重要，可通过ANALYZE命令手动更新或调整autovacuum参数自动更新。

categories:
  - postgresql

tags:
  - 基础入门
  - 全表扫描
  - 查询优化
  - 索引创建
  - 查询规划器
  - SQL性能
  - 统计信息

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/85378aa2dd324c30baec694854257732~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 一、为什么要避免全表扫描？

全表扫描（Sequential
Scan）是PostgreSQL最“直白”的查询方式——它会像翻书一样逐行读取表中所有数据，不管你要的内容在开头还是结尾。比如你有一本1000页的字典，要找“PostgreSQL”这个词，如果没有目录（索引），你得从第一页翻到最后一页，这就是全表扫描。  
当表的数据量很小（比如几百行），全表扫描的代价可以忽略；但如果表有100万行甚至1亿行，全表扫描会吃掉大量磁盘I/O和内存资源，导致查询卡半天，还会影响其他业务的正常运行。

### 二、PostgreSQL是怎么选择执行计划的？

要避免全表扫描，得先理解PostgreSQL的“大脑”——**查询规划器（Query Planner）**。它的工作流程像“导航软件”：

1. **接收查询**：比如你写了`SELECT * FROM users WHERE age > 30;`。
2. **生成候选计划**：规划器会想出几种执行方式——比如全表扫描、用`age`列的索引扫描、甚至哈希扫描。
3. **计算代价**：规划器根据**统计信息**（比如表的大小、`age`列有多少不同值）给每个计划打分，代价最低的胜出。
4. **执行计划**：PostgreSQL按照最优计划执行查询。

你可以用`EXPLAIN ANALYZE`命令“看”规划器的选择，比如：

```sql
-- 查看执行计划（带实际执行统计）
EXPLAIN ANALYZE SELECT * FROM users WHERE age > 30;
```

如果输出里有`Seq Scan on users`，说明用了全表扫描；如果有`Index Scan using idx_users_age on users`，说明用了索引扫描。

### 三、避免全表扫描的核心：给“关键列”建索引

索引是PostgreSQL的“目录”，能快速定位到你要的数据。最常用的索引类型是**B-tree**（适用于等值查询、范围查询），就像字典的拼音目录——按顺序排列，找起来很快。

#### 1. 哪些列需要建索引？

- **WHERE子句里的列**：比如`age`（`WHERE age > 30`）、`email`（`WHERE email = 'user@example.com'`）。
- **JOIN条件里的列**：比如订单表`orders`的`user_id`（`JOIN users ON orders.user_id = users.id`）。
- **排序/分组的列**：比如`ORDER BY create_time`、`GROUP BY category_id`。

#### 2. 建索引的正确姿势

以`users`表的`age`列为例，创建B-tree索引：

```sql
-- 为users表的age列创建B-tree索引
CREATE INDEX idx_users_age ON users(age);
```

- `idx_users_age`：索引名称（建议用“idx_表名_列名”的格式，容易识别）。
- `ON users(age)`：指定要建索引的表和列。

#### 3. 哪些情况不适合建索引？

- **低基数列**：比如`gender`（只有“男”“女”两个值），建索引反而会增加维护成本（插入/更新时要同步更新索引）。
- **经常更新的列**：比如`last_login_time`（每次登录都要更新），频繁更新会导致索引频繁重构，影响性能。
- **小表**：比如只有100行的`config`表，全表扫描比索引扫描更快（索引本身也需要读取磁盘）。

### 四、查询语句改写：让规划器“愿意”用索引

有时候不是没有索引，而是你的SQL写法让规划器“放弃”了索引。以下是常见的“坑”和改写技巧：

#### 1. 避免前缀通配符

**坏例子**（会全表扫描）：

```sql
-- 查找邮箱以@example.com结尾的用户（前缀通配符%导致索引失效）
SELECT * FROM users WHERE email LIKE '%@example.com';
```

**好例子**（会用索引）：

```sql
-- 查找邮箱以user开头的用户（后缀通配符%不影响索引）
SELECT * FROM users WHERE email LIKE 'user%@example.com';
```

**原理**
：B-tree索引是按字符串顺序存储的，比如“user1@example.com”“user2@example.com”会排在一起。前缀通配符（%在开头）会破坏顺序，规划器无法快速定位；后缀通配符（%在结尾）不影响顺序，可以用索引。

#### 2. 避免对列用函数

**坏例子**（会全表扫描）：

```sql
-- 查找邮箱前4个字符是user的用户（SUBSTRING函数导致索引失效）
SELECT * FROM users WHERE SUBSTRING(email, 1, 4) = 'user';
```

**好例子**（会用索引）：

```sql
-- 等价于上面的查询，但能用email列的索引
SELECT * FROM users WHERE email LIKE 'user%';
```

**原理**：规划器无法“提前计算”函数的结果——它不能把`SUBSTRING(email,1,4)`和索引里的`email`值直接对比，所以只能全表扫描。

#### 3. 避免隐式类型转换

**坏例子**（会全表扫描）：

```sql
-- id是整数类型，但查询用了字符串（隐式类型转换导致索引失效）
SELECT * FROM users WHERE id = '123';
```

**好例子**（会用索引）：

```sql
-- 使用正确的整数类型
SELECT * FROM users WHERE id = 123;
```

**原理**：PostgreSQL会把`id`列的每一行都转换成字符串再和`'123'`对比，这个过程无法用索引。

#### 4. 用显式JOIN代替隐式JOIN

**坏例子**（隐式JOIN，规划器可能选差的执行计划）：

```sql
-- 隐式JOIN（用逗号连接表，WHERE写连接条件）
SELECT u.name, o.order_id 
FROM users u, orders o 
WHERE u.id = o.user_id;
```

**好例子**（显式INNER JOIN，规划器更易优化）：

```sql
-- 显式INNER JOIN（用JOIN关键字，ON写连接条件）
SELECT u.name, o.order_id 
FROM users u 
INNER JOIN orders o ON u.id = o.user_id;
```

**原理**：显式JOIN让规划器更清楚表之间的关系，能更智能地选择连接顺序（比如先查小表再关联大表）和连接方式（比如Nested Loop
Join适合小结果集，Hash Join适合大结果集）。

### 五、统计信息：规划器的“眼睛”

PostgreSQL的规划器不是“猜”执行计划的，它靠**统计信息**
（比如表的行数、列的不同值数量、数据分布）来计算代价。如果统计信息过时，规划器会做出错误的选择——比如明明`age>30`
的行只有10%，却因为统计信息没更新，继续用全表扫描。

#### 1. 手动更新统计信息

用`ANALYZE`命令更新表的统计信息：

```sql
-- 更新users表的统计信息
ANALYZE users;
```

#### 2. 自动更新统计信息

PostgreSQL有个`autovacuum`进程（默认开启），会定期自动运行`ANALYZE`，保持统计信息新鲜。你可以通过以下参数调整：

- `autovacuum_analyze_threshold`：触发自动ANALYZE的行数阈值（默认50行）。
- `autovacuum_analyze_scale_factor`：触发自动ANALYZE的比例阈值（默认0.1，即10%）。

### 六、课后Quiz

#### 1. 问题1（基础题）

以下查询为什么会全表扫描？如何优化？

```sql
SELECT * FROM orders WHERE order_date BETWEEN '2023-01-01' AND '2023-12-31';
```

**答案解析**：  
如果`order_date`列没有索引，PostgreSQL会全表扫描所有订单，过滤出2023年的订单。优化方法是为`order_date`列创建索引：

```sql
CREATE INDEX idx_orders_order_date ON orders(order_date);
```

#### 2. 问题2（原理题）

为什么`WHERE LOWER(email) = 'user@example.com'`不会使用`email`列的索引？如何优化？
**答案解析**：  
因为对`email`列用了`LOWER`函数，规划器无法将函数结果与索引中的`email`值直接匹配，所以不会用索引。优化方法是：

- 方法1：将`email`列存储为小写（插入时转小写），查询时不用函数：`WHERE email = 'user@example.com'`。
- 方法2：创建**函数索引**（针对函数结果建索引）：
  ```sql
  CREATE INDEX idx_users_email_lower ON users(LOWER(email));
  ```

### 七、常见报错解决方案

#### 1. 报错：`ERROR:  syntax error at or near "INDEX"`

**产生原因**：创建索引的语法错误（比如漏写`ON`关键字、拼写错误）。  
**错误例子**：

```sql
-- 漏写ON关键字，导致语法错误
CREATE INDEX idx_users_age users(age);
```

**解决办法**：检查语法，正确写法是`CREATE INDEX 索引名 ON 表名(列名);`。

#### 2. 报错：`ERROR:  duplicate key value violates unique constraint "idx_users_email"`

**产生原因**：尝试插入重复值到有唯一索引的列（比如`email`列建了唯一索引，却插入了相同的邮箱）。  
**解决办法**：

- 检查插入的数据，确保`email`列的值唯一。
- 如果是误操作，删除重复值后重新插入。

#### 3. 报错：`ERROR:  index "idx_users_age" does not exist`

**产生原因**：试图删除或使用不存在的索引（比如索引名称拼写错误）。  
**解决办法**：

- 用`\d 表名`查看表的索引（比如`\d users`查看`users`表的索引）。
- 确认索引名称正确后再操作。

### 参考链接

1. https://www.postgresql.org/docs/17/sql-createindex.html（创建索引的语法）
2. https://www.postgresql.org/docs/17/performance-tips.html（PostgreSQL性能优化提示）
3. https://www.postgresql.org/docs/17/sql-explain.html（EXPLAIN命令：查看执行计划）

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[PostgreSQL全表扫描慢到崩溃？建索引+改查询+更统计信息三招能破？](https://blog.cmdragon.cn/posts/748cdac2536008199abf8a8a2cd0ec85/)




<details>
<summary>往期文章归档</summary>

- [复杂查询总拖后腿？PostgreSQL多列索引+覆盖索引的神仙技巧你get没？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/32ca943703226d317d4276a8fb53b0dd/)
- [只给表子集建索引？用函数结果建索引？PostgreSQL这俩操作凭啥能省空间又加速？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/ca93f1d53aa910e7ba5ffd8df611c12b/)
- [B-tree索引像字典查词一样工作？那哪些数据库查询它能加速，哪些不能？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/f507856ebfddd592448813c510a53669/)
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