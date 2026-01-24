---
url: /posts/ca93f1d53aa910e7ba5ffd8df611c12b/
title: 只给表子集建索引？用函数结果建索引？PostgreSQL这俩操作凭啥能省空间又加速？
date: 2025-10-18T02:13:12+08:00
lastmod: 2025-10-18T02:13:12+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/e211b2119c9d43aaafefee6e23e774c1~tplv-5jbd59dj06-image.png

summary:
  部分索引是建立在表子集上的索引，通过条件表达式定义，仅包含满足条件的行。其优势在于体积小、维护成本低、查询匹配精准。典型应用包括排除常见值、优化高频查询、实现部分唯一约束及修正错误查询计划。表达式索引则基于函数或标量表达式的结果，预存常用计算逻辑，加快查询速度，适用于查询频率远高于更新频率的场景。两者均能显著提升数据库性能，但需注意避免滥用部分索引替代分区表。

categories:
  - postgresql

tags:
  - 基础入门
  - 表达式索引
  - 数据库优化
  - PostgreSQL
  - 索引维护
  - 查询性能
  - 数据库索引

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/e211b2119c9d43aaafefee6e23e774c1~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 1. 部分索引（Partial Indexes）

#### 1.1 什么是部分索引？

部分索引是建立在**表子集**上的索引，子集由一个**条件表达式（谓词）**定义。只有满足谓词的表行才会被写入索引。相比全表索引，它的优势是：

- **更小的体积**：减少磁盘占用，加快索引查询速度；
- **更低的维护成本**：表更新时，只有满足谓词的行需要同步更新索引；
- **更精准的查询匹配**：只针对特定场景生效。

#### 1.2 部分索引的典型应用场景

##### 1.2.1 排除常见值，减小索引 size

如果某列的**常见值占比极高**（比如90%以上），且查询很少涉及这些常见值，部分索引可以过滤掉它们，节省空间。

**示例：Web访问日志的外部IP查询**  
假设你存储了Web服务器的访问日志，大部分访问来自公司内部子网（192.168.100.0/24），而你只关心**外部IP**的访问记录。

```sql
-- 创建访问日志表
CREATE TABLE access_log (
    url varchar(255),       -- 访问的URL
    client_ip inet,         -- 客户端IP
    access_time timestamp   -- 访问时间
);

-- 创建部分索引：排除内部IP（192.168.100.0-192.168.100.255）
CREATE INDEX access_log_client_ip_ix 
ON access_log (client_ip)
WHERE NOT (client_ip >= inet '192.168.100.0' AND client_ip <= inet '192.168.100.255');

-- 可使用索引的查询（外部IP）
SELECT * FROM access_log 
WHERE url = '/index.html' AND client_ip = inet '212.78.10.32';

-- 无法使用索引的查询（内部IP，索引中无数据）
SELECT * FROM access_log 
WHERE url = '/index.html' AND client_ip = inet '192.168.100.23';
```

**原理**：索引只包含外部IP的记录，查询外部IP时直接扫描小索引；查询内部IP时，PostgreSQL自动选择全表扫描（本来就是更高效的方式）。

##### 1.2.2 排除不感兴趣的值，优化高频查询

如果你的查询**只关注表中的小部分行**（比如“未结算的订单”），部分索引可以只保留这些行，加快查询速度。

**示例：未结算订单的快速查询**  
假设订单表`orders`中，90%的订单是“已结算”（`billed = true`），而你经常查询“未结算订单”（`billed = false`）。

```sql
-- 创建订单表
CREATE TABLE orders (
    order_nr serial PRIMARY KEY,  -- 订单号
    amount numeric(10,2),         -- 订单金额
    billed boolean DEFAULT false  -- 是否结算
);

-- 创建部分索引：只包含未结算的订单
CREATE INDEX orders_unbilled_idx 
ON orders (order_nr)
WHERE NOT billed;

-- 可使用索引的查询（未结算且金额>5000）
SELECT * FROM orders 
WHERE NOT billed AND amount > 5000.00;

-- 无法使用索引的查询（不确定订单是否未结算）
SELECT * FROM orders 
WHERE order_nr = 3501;
```

##### 1.2.3 实现“部分唯一约束”

部分唯一索引可以**仅约束满足条件的记录**，比全表唯一约束更灵活。

**示例：测试结果的成功记录唯一**  
假设你需要确保“每个受试者+测试目标的成功记录唯一”，但失败记录可以任意添加。

```sql
-- 创建测试结果表
CREATE TABLE tests (
    subject text,       -- 受试者
    target text,        -- 测试目标
    success boolean,    -- 是否成功
    score int           -- 分数
);

-- 创建部分唯一索引：success为true时，subject+target组合唯一
CREATE UNIQUE INDEX tests_success_unique 
ON tests (subject, target)
WHERE success;

-- 允许：同一个subject+target的失败记录
INSERT INTO tests VALUES ('Alice', 'Math', false, 60);
INSERT INTO tests VALUES ('Alice', 'Math', false, 70);

-- 禁止：同一个subject+target的成功记录（会报错）
INSERT INTO tests VALUES ('Alice', 'Math', true, 90);
INSERT INTO tests VALUES ('Alice', 'Math', true, 85);
```

##### 1.2.4 修正错误的查询计划

如果PostgreSQL的查询 planner 错误地选择了索引扫描（比如数据分布异常），部分索引可以“屏蔽”不适合的查询，强制选择更优的方式（此场景很少见，仅作为最后的优化手段）。

#### 1.3 部分索引的“红线”：不要替代分区！

不要用**大量非重叠的部分索引**替代分区（Partitioning）。比如对`category`字段的每个值创建部分索引：

```sql
-- 错误示例：用部分索引替代分区
CREATE INDEX mytable_cat_1 ON mytable (data) WHERE category = 1;
CREATE INDEX mytable_cat_2 ON mytable (data) WHERE category = 2;
-- ... 直到 category = N
```

这种做法会让查询 planner 花费大量时间选择索引，反而降低性能。**正确的做法**是创建**复合索引**（将`category`作为前缀）：

```sql
-- 正确示例：复合索引替代多个部分索引
CREATE INDEX mytable_cat_data ON mytable (category, data);
```

如果表数据量极大，复合索引仍不够用，应该使用**分区表**
（参考 [官方分区文档](https://www.postgresql.org/docs/17/ddl-partitioning.html)）。

### 2. 表达式索引（Indexes on Expressions）

#### 2.1 什么是表达式索引？

普通索引的列是表的**原始列**，而表达式索引的列是**函数或标量表达式的结果**。比如对`lower(email)`
（小写转换）或`first_name || ' ' || last_name`（字符串拼接）创建索引。

它的核心价值是：**将常用计算逻辑预存到索引中**，避免查询时重复计算，从而加快查询速度。

#### 2.2 表达式索引的实用示例

##### 2.2.1 大小写不敏感的快速查询

如果经常需要执行**大小写不敏感的字符串查询**（比如`WHERE lower(email) = 'alice@example.com'`），表达式索引可以将小写转换的结果预存，避免全表扫描。

**示例：用户表的邮箱查询**

```sql
-- 创建用户表
CREATE TABLE users (
    id serial PRIMARY KEY,
    email varchar(255) NOT NULL  -- 邮箱（大小写混合）
);

-- 创建表达式索引：存储email的小写形式
CREATE INDEX users_lower_email_idx ON users (lower(email));

-- 可使用索引的查询（大小写不敏感）
SELECT * FROM users 
WHERE lower(email) = 'alice@example.com';

-- 注意：ILIKE无法使用该索引（表达式不同）
SELECT * FROM users 
WHERE email ILIKE 'alice@example.com';  -- 效率更低
```

##### 2.2.2 组合字段的精确匹配

如果经常需要查询**多个字段的组合结果**（比如`first_name || ' ' || last_name = 'John Smith'`），表达式索引可以预存组合后的字符串，加快查询速度。

**示例：联系人表的全称查询**

```sql
-- 创建联系人表
CREATE TABLE people (
    first_name varchar(50),  -- 名
    last_name varchar(50)    -- 姓
);

-- 创建表达式索引：存储姓名全称（注意括号！）
CREATE INDEX people_fullname_idx 
ON people ((first_name || ' ' || last_name));

-- 可使用索引的查询（全称匹配）
SELECT * FROM people 
WHERE (first_name || ' ' || last_name) = 'John Smith';
```

#### 2.3 表达式索引的维护成本

表达式索引的**插入/更新代价更高**：每次插入或修改表行时，PostgreSQL需要重新计算表达式的值，并同步更新索引。因此，它适合*
*查询频率远高于更新频率**的场景（比如用户表的邮箱查询，更新频率低，但查询频繁）。

### 课后 Quiz：巩固你的理解

#### 问题1：如何用部分索引优化“在售商品的价格查询”？

假设你有一张`products`表，`status`字段表示商品状态（`in_stock`：在售，`out_of_stock`：缺货，`discontinued`
：停产）。你经常查询“在售商品的价格<100”，但很少查询缺货/停产商品。如何用部分索引优化？

**答案解析**：  
创建部分索引，只包含在售商品的`price`字段：

```sql
CREATE INDEX products_in_stock_price_idx 
ON products (price)
WHERE status = 'in_stock';
```

这样查询在售商品时会扫描小索引，加快速度；更新缺货/停产商品时，不需要修改索引。

#### 问题2：为什么下面的表达式索引会报错？如何修正？

```sql
CREATE INDEX people_fullname_idx 
ON people (first_name || ' ' || last_name);
```

**答案解析**：  
报错原因是**复杂表达式缺少括号**。PostgreSQL要求：非单一函数调用的表达式必须用括号包裹。修正后的语句：

```sql
CREATE INDEX people_fullname_idx 
ON people ((first_name || ' ' || last_name));
```

### 常见报错解决方案

#### 报错1：部分索引的WHERE条件引用不存在的列

```sql
-- 错误示例：WHERE条件用了非表字段`ip`
CREATE INDEX access_log_client_ip_ix 
ON access_log (client_ip)
WHERE NOT (client_ip > inet '192.168.100.0' AND ip < inet '192.168.100.255');
```

**报错信息**：`ERROR:  column "ip" does not exist`  
**解决办法**：检查WHERE条件中的字段是否属于当前表，修正为`client_ip`：

```sql
CREATE INDEX access_log_client_ip_ix 
ON access_log (client_ip)
WHERE NOT (client_ip > inet '192.168.100.0' AND client_ip < inet '192.168.100.255');
```

#### 报错2：表达式索引缺少括号

```sql
-- 错误示例：复杂表达式未用括号
CREATE INDEX people_fullname_idx 
ON people (first_name || ' ' || last_name);
```

**报错信息**：`ERROR:  syntax error at or near "||"`  
**解决办法**：给表达式添加括号：

```sql
CREATE INDEX people_fullname_idx 
ON people ((first_name || ' ' || last_name));
```

#### 报错3：部分唯一索引的重复插入

```sql
-- 示例：部分唯一索引`tests_success_unique`（success=true时subject+target唯一）
INSERT INTO tests VALUES ('Alice', 'Math', true, 90);
INSERT INTO tests VALUES ('Alice', 'Math', true, 85);  -- 重复插入
```

**报错信息**：`ERROR:  duplicate key value violates unique constraint "tests_success_unique"`  
**解决办法**：检查插入的数据是否符合业务规则，或调整索引谓词（比如允许特定情况的重复）。

### 参考链接

- 部分索引官方文档：https://www.postgresql.org/docs/17/indexes-partial.html
- 表达式索引官方文档：https://www.postgresql.org/docs/17/indexes-expressional.html
- 分区表官方文档：https://www.postgresql.org/docs/17/ddl-partitioning.html

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[只给表子集建索引？用函数结果建索引？PostgreSQL这俩操作凭啥能省空间又加速？](https://blog.cmdragon.cn/posts/ca93f1d53aa910e7ba5ffd8df611c12b/)




<details>
<summary>往期文章归档</summary>

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