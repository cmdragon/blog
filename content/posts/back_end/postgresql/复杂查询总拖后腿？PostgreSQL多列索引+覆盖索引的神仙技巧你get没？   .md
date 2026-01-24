---
url: /posts/32ca943703226d317d4276a8fb53b0dd/
title: 复杂查询总拖后腿？PostgreSQL多列索引+覆盖索引的神仙技巧你get没？
date: 2025-10-19T06:46:34+08:00
lastmod: 2025-10-19T06:46:34+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/05592ca3758149de81de3acc5f44d04c~tplv-5jbd59dj06-image.png

summary:
  多列索引在PostgreSQL中用于优化包含多列条件的查询，支持B-tree、GiST、GIN和BRIN四种索引类型。B-tree索引遵循左前缀原则，适合等值或等值+范围查询；GiST索引首列选择性影响效率，适合空间数据；GIN索引无左前缀限制，适合多值类型查询；BRIN索引适合大表范围查询。覆盖索引通过`INCLUDE`子句包含查询所需列，避免回表，提升查询效率。最佳实践包括优先使用`INCLUDE`、避免冗余列和注意可见性映射。

categories:
  - postgresql

tags:
  - 基础入门
  - 多列索引
  - 覆盖索引
  - 仅索引扫描
  - B-tree索引
  - INCLUDE子句
  - 查询优化

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/05592ca3758149de81de3acc5f44d04c~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 多列索引：处理复杂查询条件的利器

### 多列索引的基本概念与创建

多列索引是指在表的**多个列**上共同创建的索引，用于优化包含多列条件的查询（如`WHERE col1 = ? AND col2 = ?`
）。PostgreSQL支持在B-tree、GiST、GIN、BRIN这四类索引上创建多列索引，语法如下：

```sql
-- 创建多列B-tree索引（最常用）
CREATE INDEX 索引名 ON 表名 (列1, 列2, ...);
```

**例子**：假设你有一张存储设备信息的表`test2`，结构如下：

```sql
CREATE TABLE test2 (
  major int,  -- 主设备号
  minor int,  -- 次设备号
  name varchar -- 设备名称（如"/dev/sda1"）
);
```

频繁执行查询`SELECT name FROM test2 WHERE major = 8 AND minor = 1;`（查询主设备号8、次设备号1的设备名称）。此时创建**多列索引
**`test2_mm_idx`可以高效定位到目标行：

```sql
CREATE INDEX test2_mm_idx ON test2 (major, minor);
```

### 不同索引类型的多列支持与效率

多列索引的效率取决于**索引类型**和**列的顺序**，以下是各类索引的特点：

1. **B-tree索引（最常用）**
    - 遵循**左前缀原则**：只有当查询条件包含索引的**前N列**时，索引才能高效扫描。例如`test2_mm_idx (major, minor)`：
        - 支持`WHERE major = 8`（使用前1列）、`WHERE major = 8 AND minor = 1`（使用前2列）；
        - 不支持`WHERE minor = 1`（缺少左前缀`major`），此时索引扫描等同于全表扫描，效率极低。
    - 适合：多列**等值查询**或**等值+范围查询**（如`major = 8 AND minor > 5`）。

2. **GiST索引**
    - 首列（左起第一列）的选择性至关重要：如果首列的distinct值很少（如性别列），即使后面的列选择性高，索引效率也会很差。
    - 适合：空间数据（如`point`、`polygon`）的多列查询（如`WHERE location @> 'POINT(10 20)' AND category = 'shop'`）。

3. **GIN索引**
    - 无左前缀限制：任意列的条件都能高效使用索引。例如`CREATE INDEX idx ON docs (title, content)`
      （GIN索引），`WHERE title @@ 'PostgreSQL'`或`WHERE content @@ 'index'`的效率相同。
    - 适合：数组、JSONB等多值类型的查询（如`WHERE tags @> '{"database"}' AND author = 'Alice'`）。

4. **BRIN索引**
    - 无左前缀限制：任意列的条件效率相同。
    -
    适合：大表（如TB级）的范围查询（如时间序列表的`WHERE create_time BETWEEN '2023-01-01' AND '2023-12-31' AND region = 'China'`）。

### 多列索引的使用技巧与限制

- **适用场景**：仅当查询频繁使用**多列组合条件**时创建，例如电商的“分类+品牌”查询、日志的“时间+级别”查询。
- **限制**：
    - 多列索引最多支持32列（可通过编译PostgreSQL修改，但不建议）；
    - 超过3列的索引很少有用（空间占用大、维护成本高）；
    - 避免将**低选择性列**（如性别、状态）作为首列（B-tree/GiST索引），否则索引扫描范围过大。

## 覆盖索引与仅索引扫描：避免回表的关键

### 仅索引扫描的工作原理

PostgreSQL的索引是**二级索引**（索引与表数据分开存储），普通索引扫描需要两步：

1. 从索引中找到符合条件的行指针（`ctid`，指向表堆的物理位置）；
2. **回表**：通过行指针从表堆中读取完整行数据。

而**仅索引扫描（Index-Only Scan）**可以跳过回表，直接从索引中获取所有需要的数据——前提是：

1. 索引**包含查询需要的所有列**（即覆盖索引）；
2. **可见性映射（Visibility Map）**标记对应表堆页为“全可见”（即页内所有行对当前事务可见，无需检查行的可见性）。

**可见性映射**是PostgreSQL的核心优化：它记录了表堆中每个页的“全可见”状态（1 bit/页）。如果页是全可见的，仅索引扫描可以直接返回索引中的数据，无需回表。

### 如何创建覆盖索引

覆盖索引的核心是**包含查询所需的所有列**，PostgreSQL提供两种方式：

#### 1. 传统方式：将所有列作为索引列

```sql
-- 覆盖查询`SELECT product_name FROM products WHERE category_id = 1 AND brand_id = 101`
CREATE INDEX products_cat_brand_name_idx ON products (category_id, brand_id, product_name);
```

- 缺点：`product_name`作为索引列会增加索引的宽度，影响上层索引页的存储效率；如果需要`category_id + brand_id`
  的唯一性约束，这种方式无法实现（因为`product_name`会破坏唯一性）。

#### 2. 推荐方式：使用`INCLUDE` clause（PostgreSQL 11+）

`INCLUDE`用于添加**非键列**（payload列），这些列不参与索引的搜索，仅作为“附加数据”存储在索引中。语法如下：

```sql
CREATE INDEX 索引名 ON table (键列1, 键列2, ...) INCLUDE (非键列列表);
```

**例子**：优化上述查询，创建覆盖索引：

```sql
-- 键列：category_id、brand_id（用于定位行）；非键列：product_name（用于返回结果）
CREATE INDEX products_cat_brand_name_idx ON products (category_id, brand_id) INCLUDE (product_name);
```

### 覆盖索引的最佳实践

1. **优先使用`INCLUDE`**：
    - 非键列不会出现在B-tree的上层索引页，减少索引的存储空间和扫描时间；
    - 在键列上创建`UNIQUE`约束时，非键列不会影响唯一性（例如`CREATE UNIQUE INDEX idx ON users(email) INCLUDE(name)`
      ，确保email唯一，同时包含name）。

**例子**：用户表的唯一约束与覆盖索引：  
需求：确保`email`唯一，且频繁查询`SELECT name FROM users WHERE email = 'user@example.com'`。

```sql
-- 正确：用INCLUDE创建覆盖索引，同时保证email唯一
CREATE UNIQUE INDEX users_email_name_idx ON users (email）INCLUDE (name);

-- 错误：传统方式无法保证email唯一（因为name会被包含在索引键中）
CREATE UNIQUE INDEX users_email_name_idx ON users (email, name);
```

2. **避免冗余列**：
    - 仅包含查询**必须返回**
      的列，不要添加无关列（会增加索引大小，降低效率）。例如查询`SELECT total_amount FROM orders WHERE user_id = 123`
      ，只需`INCLUDE (total_amount)`，无需添加`status`列。

3. **注意可见性映射**：
    - 仅索引扫描的优势取决于**全可见页的比例**。如果表频繁更新（如订单表），全可见页很少，仅索引扫描的效率提升有限；
    - 对于**静态表**（如数据仓库的维度表），全可见页比例高，覆盖索引的效果最好。

## 课后Quiz：巩固与实践

### 问题：优化订单查询

假设你有一张订单表`orders`：

```sql
CREATE TABLE orders (
    order_id serial PRIMARY KEY,
    user_id int,
    order_date date,
    total_amount numeric(10,2),
    status varchar(50)
);
```

频繁执行的查询是：

```sql
SELECT total_amount FROM orders WHERE user_id = 123 AND order_date BETWEEN '2023-01-01' AND 'job5';
```

请回答以下问题：

1. 如何创建索引优化该查询？写出SQL语句。（提示：覆盖索引+多列B-tree）
2. 为什么用`INCLUDE`而不是传统方式？

### 答案解析

#### 问题1：索引创建语句（覆盖+多列B-tree）

```sql
CREATE INDEX orders_user_date_total_idx ON orders (user_id, order_date) INCLUDE (total_amount);
```

**理由**：

- `user_id`（等值查询）作为首列，`order_date`（范围查询）作为第二列，符合B-tree的左前缀原则；
- `INCLUDE (total_amount)`覆盖查询需要返回的列，实现仅索引扫描。

#### 问题2：`INCLUDE`的优势

1. **唯一性支持**：如果未来需要`user_id + order_date`的唯一约束（防止重复订单），可以修改为：
   ```sql
   CREATE UNIQUE INDEX orders_user_date_total_idx ON orders (user_id, order_date) INCLUDE (total_amount);
   ```
   传统方式（`user_id, order_date, total_amount`）无法实现，因为`total_amount`会破坏唯一性。
2. **索引效率**：`total_amount`作为非键列，不会出现在B-tree的上层索引页，减少索引的存储空间和扫描时间。

## 常见报错解决方案

### 报错1：`ERROR:  syntax error at or near "INCLUDE"`

**原因**：

- 使用了不支持`INCLUDE`的索引类型（如GIN、BRIN）；
- PostgreSQL版本低于11（`INCLUDE`是11及以上版本的特性）。

**解决办法**：

- 更换索引类型：B-tree、GiST、SP-GiST支持`INCLUDE`；
- 升级PostgreSQL到11+。

### 报错2：`ERROR:  included column "upper(product_name)" must be a simple column reference`

**原因**：`INCLUDE`不支持**表达式列**（如`upper(product_name)`、`price * 0.8`）。

**解决办法**：

- 将表达式作为索引列（适合表达式查询）：
  ```sql
  CREATE INDEX products_name_upper_idx ON products (category_id, upper(product_name));
  ```
- 或包含原始列，在查询中计算表达式：
  ```sql
  -- 索引包含原始列`product_name`
  CREATE INDEX products_cat_brand_name_idx ON products (category_id, brand_id) INCLUDE (product_name);
  -- 查询中计算表达式
  SELECT upper(product_name) FROM products WHERE category_id = 1 AND brand_id = 101;
  ```

### 报错3：`ERROR:  index "idx_name" does not support covering indexes`

**原因**：使用了不支持覆盖索引的索引类型（如Hash索引）。

**解决办法**：更换为支持覆盖索引的类型（如B-tree）。

参考链接：

- 多列索引：https://www.postgresql.org/docs/17/indexes-multicolumn.html
- 覆盖索引与仅索引扫描：https://www.postgresql.org/docs/17/indexes-index-only-scans.html

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[复杂查询总拖后腿？PostgreSQL多列索引+覆盖索引的神仙技巧你get没？](https://blog.cmdragon.cn/posts/32ca943703226d317d4276a8fb53b0dd/)



<details>
<summary>往期文章归档</summary>

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