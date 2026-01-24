---
url: /posts/9101b75bdec6faea9b35d54f14e37f36/
title: 想知道数据库怎么给查询“算成本选路线”？EXPLAIN能帮你看明白？
date: 2025-10-07T06:47:24+08:00
lastmod: 2025-10-07T06:47:24+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/6b105d4f619e46a1aa9d34b4352d29ba~tplv-5jbd59dj06-image.png

summary:
  EXPLAIN工具用于展示PostgreSQL查询优化器的执行计划，帮助理解查询的执行方式和优化路径。`EXPLAIN`仅生成估计计划，而`EXPLAIN ANALYZE`会执行查询并提供实际数据。查询计划以树状结构呈现，包含节点类型（如`Seq Scan`、`Index Scan`）和关键列（如`Cost`、`Rows`）。`Cost`是优化器的相对成本，基于I/O和CPU成本计算。通过分析计划，可以优化查询，如添加索引、选择合适的Join类型或避免不必要的排序。

categories:
  - postgresql

tags:
  - 基础入门
    - PostgreSQL
  - EXPLAIN工具
  - 查询优化
  - 索引扫描
  - 查询计划
  - 数据库性能
  - SQL优化

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/6b105d4f619e46a1aa9d34b4352d29ba~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## EXPLAIN工具的基础：作用与基本用法

### 什么是EXPLAIN？

在PostgreSQL中，**查询优化器**会为每个SQL查询生成多种可能的执行方案（比如全表扫描 vs 索引扫描、嵌套循环连接 vs
哈希连接），并选择“成本最低”的方案——这就是**查询计划**。`EXPLAIN`工具的核心作用，是将这个“隐藏的决策过程”转化为可读的文本，帮你理解数据库“为什么这么执行查询”，以及“如何优化”。

简单来说，`EXPLAIN`就像查询的“烹饪说明书”：它不会帮你做“菜”（执行查询），但会告诉你“需要哪些步骤”“每步的成本”“用多少数据”。

### EXPLAIN vs EXPLAIN ANALYZE：关键区别

很多初学者会混淆这两个命令，它们的核心差异在于**是否实际执行查询**：

- **`EXPLAIN`**：仅生成**估计的查询计划**，不执行查询。适合快速查看优化器的决策，但无法验证“估计是否准确”。
- **`EXPLAIN ANALYZE`**：执行查询，并在计划中添加**实际执行数据**
  （比如实际时间、实际行数）。适合分析慢查询，但注意：它会真正执行查询（比如`UPDATE`或`DELETE`会修改数据），因此**不要在生产环境随意使用
  **！

举个例子：

```sql
-- 仅看估计计划（不执行）
EXPLAIN
SELECT *
FROM users
WHERE age > 30;

-- 执行查询并看实际数据
EXPLAIN
ANALYZE
SELECT *
FROM users
WHERE age > 30;
```

### 基本语法示例

`EXPLAIN`的语法非常简单：在要分析的查询前添加`EXPLAIN`（或`EXPLAIN ANALYZE`）即可。以下是常见场景的示例：

```sql
-- 分析简单SELECT查询
EXPLAIN
SELECT name, email
FROM users
WHERE created_at > '2023-01-01';

-- 分析JOIN查询
EXPLAIN
ANALYZE
SELECT u.name, o.amount
FROM users u
         JOIN orders o ON u.id = o.user_id
WHERE u.country = 'China';

-- 分析带排序的查询
EXPLAIN
SELECT *
FROM users
ORDER BY age DESC LIMIT 10;
```

执行后，PostgreSQL会返回一个**树状结构的文本**——这就是查询计划。

## 查询计划的核心结构：节点与输出列

### 查询计划的树状结构

PostgreSQL的查询计划是**自底向上**
执行的树状结构：每个“节点”代表一个操作（比如扫描表、连接表、排序），父节点依赖子节点的输出。例如，一个`JOIN`
节点的子节点是两个`Scan`节点（分别扫描两张表）。

举个简单的例子，查询`SELECT * FROM users WHERE age > 30`的计划可能是这样：

```
Seq Scan on users  (cost=0.00..100.00 rows=2000 width=100)
  Filter: (age > 30)
```

这里的`Seq Scan on users`是根节点（唯一节点），`Filter`是它的筛选条件。

### 常见节点类型解析

查询计划中的节点类型直接反映了数据库的执行方式，以下是最常见的几种（重点掌握）：

1. **Seq Scan（顺序扫描）**：全表扫描，逐个读取表中的每一行。适合**小表**或**筛选条件无索引**的情况（比如`age > 30`但`age`
   无索引）。
2. **Index Scan（索引扫描）**：先扫描索引找到符合条件的行的位置，再回表读取完整数据。适合**筛选条件选择性高**（比如`age = 30`
   ，返回少数行）的情况。
3. **Index Only Scan（仅索引扫描）**：不需要回表！如果查询的列都在索引中（比如`SELECT age FROM users WHERE age > 30`
   ，且索引包含`age`），数据库直接从索引获取数据，速度更快。
4. **Hash Join**：将其中一张表的数据做成哈希表，再用另一张表的数据匹配。适合**两张表都较大**的情况（比如`users`
   10万行、`orders`100万行）。
5. **Nested Loop Join**：用一张表的每一行去遍历另一张表。适合**一张表很小（驱动表）、另一张表有索引**的情况（比如`users`
   1万行、`orders`100万行且`user_id`有索引）。
6. **Sort**：对数据排序。如果`ORDER BY`的列没有索引，就会出现这个节点——排序的成本很高，尽量避免。

### 输出列的解读

每个节点的输出会包含几个关键列，理解它们是解读计划的核心：
| 列名 | 含义 |
|---------------|----------------------------------------------------------------------|
| `Cost`        | 优化器估计的“执行成本”（相对值，不是实际时间），格式为`启动成本..总成本`。比如`0.00..100.00`。 |
| `Rows`        | 优化器估计的“该节点输出的行数”（基于统计信息）。 |
| `Width`       | 优化器估计的“每行的字节数”（所有列的字节总和）。 |
| `Actual Time` | 仅`EXPLAIN ANALYZE`有，实际执行时间（格式为`开始时间..结束时间`）。 |
| `Actual Rows` | 仅`EXPLAIN ANALYZE`有，实际输出的行数。 |

举个`EXPLAIN ANALYZE`的示例：

```
Seq Scan on users  (cost=0.00..100.00 rows=2000 width=100) (actual time=0.012..0.500 rows=2000 loops=1)
  Filter: (age > 30)
  Rows Removed by Filter: 8000
```

解读：

- **估计值**：启动成本0（不需要准备数据），总成本100；估计输出2000行，每行100字节。
- **实际值**：总执行时间0.5秒，实际输出2000行，过滤掉8000行（原表共10000行）。

## 深入理解Cost模型：如何计算与解读

### Cost的组成：启动成本与总成本

`Cost`是PostgreSQL优化器的“决策依据”，它是**相对值**（不是毫秒或秒），基于两个核心因素：

1. **I/O成本**：读取数据页的成本（比如全表扫描需要读多少个数据页）。
2. **CPU成本**：处理每行数据的成本（比如过滤、计算）。

具体来说，`Cost`的格式是`启动成本..总成本`：

- **启动成本**：该节点开始输出第一行数据前的成本（比如排序节点需要先收集所有数据，启动成本很高）。
- **总成本**：该节点完成所有输出的总成本（启动成本 + 后续处理成本）。

例如，一个`Sort`节点的`Cost`可能是`50.00..60.00`：启动成本50（排序前需收集所有数据），总成本60（排序+输出）。

### 为什么Cost是相对值？

PostgreSQL的`Cost`不是实际时间，而是**优化器内部的评分标准**。它的计算基于几个配置参数（可通过`show all;`查看）：

- `seq_page_cost`：全表扫描时读取一个数据页的成本（默认1.0）。
- `idx_page_cost`：索引扫描时读取一个索引页的成本（默认0.25，因为索引通常更紧凑）。
- `cpu_tuple_cost`：处理一行数据的CPU成本（默认0.01）。
- `cpu_operator_cost`：执行一个运算符（比如`>`、`=`）的CPU成本（默认0.0025）。

例如，全表扫描的成本计算公式是：
`Cost = (数据页数 × seq_page_cost) + (行数 × cpu_tuple_cost)`

优化器会比较所有可能计划的`总成本`，选最小的那个——这就是“最优计划”。

### Rows与实际行数的差异：统计信息的重要性

`Rows`是优化器根据**统计信息**（比如表的行数、列的分布）估计的输出行数。如果`Rows`和`Actual Rows`
差异很大（比如估计100行，实际10000行），说明统计信息过时了，会导致优化器选“错误的计划”。

**示例**：假设`users`
表原本有1000行，后来插入到100万行，但没更新统计信息。优化器可能还认为“全表扫描很快”，但实际全表扫描需要10秒——这时候你需要执行`ANALYZE users;`
更新统计信息。

## 应用：用EXPLAIN优化查询的步骤

### 案例1：从Seq Scan到Index Scan——索引的作用

**场景**：`users`表有100万行，`age`列无索引，执行查询`SELECT * FROM users WHERE age = 30;`。

**原始计划**（`EXPLAIN ANALYZE`输出）：

```
Seq Scan on users  (cost=0.00..2000.00 rows=10000 width=100) (actual time=0.015..5.000 rows=10000 loops=1)
  Filter: (age = 30)
  Rows Removed by Filter: 990000
```

**解读**：全表扫描（`Seq Scan`），实际用了5秒，过滤掉99万行——效率极低。

**优化方法**：给`age`列加索引：

```sql
CREATE INDEX idx_users_age ON users (age);
```

**优化后计划**：

```
Index Scan using idx_users_age on users  (cost=0.29..80.00 rows=10000 width=100) (actual time=0.008..0.100 rows=10000 loops=1)
  Index Cond: (age = 30)
```

**解读**：索引扫描（`Index Scan`），实际时间从5秒降到0.1秒——成本从2000降到80，效果显著！

### 案例2：Join类型的选择——Nested Loop vs Hash Join

**场景**：有两张表：

- `users`：1万行（小表），`id`是主键。
- `orders`：100万行（大表），`user_id`是外键（无索引）。

执行查询`SELECT u.name, o.amount FROM users u JOIN orders o ON u.id = o.user_id;`。

**原始计划**：

```
Nested Loop  (cost=0.00..15000.00 rows=1000000 width=20) (actual time=0.010..10.000 rows=1000000 loops=1)
  ->  Seq Scan on users u  (cost=0.00..20.00 rows=10000 width=10) (actual time=0.005..0.100 rows=10000 loops=1)
  ->  Seq Scan on orders o  (cost=0.00..1.00 rows=100 width=10) (actual time=0.000..0.000 rows=100 loops=10000)
        Filter: (user_id = u.id)
```

**解读**：`Nested Loop`连接（用`users`的每一行去遍历`orders`），实际用了10秒——因为`orders`没有`user_id`的索引，每次遍历都要全表扫描。

**优化方法**：给`orders.user_id`加索引：

```sql
CREATE INDEX idx_orders_user_id ON orders (user_id);
```

**优化后计划**：

```
Hash Join  (cost=200.00..5000.00 rows=1000000 width=20) (actual time=1.000..3.000 rows=1000000 loops=1)
  Hash Cond: (o.user_id = u.id)
  ->  Seq Scan on orders o  (cost=0.00..2000.00 rows=1000000 width=10) (actual time=0.005..0.500 rows=1000000 loops=1)
  ->  Hash  (cost=20.00..20.00 rows=10000 width=10) (actual time=0.900..0.900 rows=10000 loops=1)
        ->  Seq Scan on users u  (cost=0.00..20.00 rows=10000 width=10) (actual time=0.003..0.100 rows=10000 loops=1)
```

**解读**：优化器切换到`Hash Join`（把`users`做成哈希表，再匹配`orders`），实际时间从10秒降到3秒——因为索引让`orders`
的查找更快，优化器选了更适合大数据集的连接方式。

### 案例3：避免不必要的排序——ORDER BY的优化

**场景**：执行查询`SELECT * FROM users WHERE age > 30 ORDER BY created_at;`，`created_at`无索引。

**原始计划**：

```
Sort  (cost=150.00..160.00 rows=2000 width=100) (actual time=1.000..1.500 rows=2000 loops=1)
  Sort Key: created_at
  Sort Method: quicksort  Memory: 200kB
  ->  Seq Scan on users  (cost=0.00..100.00 rows=2000 width=100) (actual time=0.010..0.500 rows=2000 loops=1)
        Filter: (age > 30)
```

**解读**：`Sort`节点的成本是150..160，实际用了1.5秒——因为`ORDER BY created_at`需要排序，而`created_at`无索引。

**优化方法**：创建**复合索引**（覆盖筛选条件和排序字段）：

```sql
CREATE INDEX idx_users_age_created_at ON users (age, created_at);
```

**优化后计划**：

```
Index Scan using idx_users_age_created_at on users  (cost=0.29..80.00 rows=2000 width=100) (actual time=0.008..0.200 rows=2000 loops=1)
  Index Cond: (age > 30)
```

**解读**：`Sort`节点消失了！因为复合索引的顺序是`age`→`created_at`，数据库可以直接从索引中读取“按`created_at`
排序”的行，不需要额外排序——实际时间从1.5秒降到0.2秒。

## 课后Quiz：巩固EXPLAIN知识

### 问题1：`EXPLAIN`和`EXPLAIN ANALYZE`的主要区别是什么？

**答案**：`EXPLAIN`仅生成估计的查询计划，不执行查询；`EXPLAIN ANALYZE`会执行查询，并返回实际执行时间、实际行数等数据。  
**解析**：`EXPLAIN`适合快速查看优化器的决策，`EXPLAIN ANALYZE`适合验证“估计是否准确”（比如`Rows`是否接近`Actual Rows`
）。但注意，`EXPLAIN ANALYZE`会执行写操作（比如`UPDATE`
），所以不要在生产环境随意使用。参考链接：https://www.postgresql.org/docs/17/sql-explain.html#SQL-EXPLAIN-ANALYZE。

### 问题2：当`EXPLAIN`输出中出现`Seq Scan`时，是否一定需要添加索引？为什么？

**答案**：不一定。  
**解析**：`Seq Scan`的成本并不总是更高——如果表很小（比如只有100行），全表扫描比索引扫描更快（因为索引需要额外的I/O去读取索引文件）。只有当表很大（比如100万行）且筛选条件
**选择性高**
（比如返回行数占总表行数的5%以下）时，添加索引才有意义。参考链接：https://www.postgresql.org/docs/17/using-explain.html#USING-EXPLAIN-SELECTIVITY。

### 问题3：为什么`Rows`和`Actual Rows`差异大会导致查询变慢？

**答案**：因为`Rows`是优化器选择查询计划的关键依据。如果`Rows`
估计过小（比如实际10000行，估计100行），优化器可能会选不适合大数据集的计划（比如`Nested Loop Join`），导致实际执行时间变长。  
**解决方法**：执行`ANALYZE`命令更新表的统计信息（比如`ANALYZE users;`
）。参考链接：https://www.postgresql.org/docs/17/planner-stats.html。

## 常见报错与解决方案

### 报错1：`ERROR: syntax error at or near \"EXPLAIN\"`

**原因**：`EXPLAIN`语法错误（比如缺少查询语句）。  
**示例**：`EXPLAIN;`（缺少查询）或`SELECT * FROM users EXPLAIN;`（位置错误）。  
**解决**：确保`EXPLAIN`后紧跟完整查询，比如`EXPLAIN SELECT * FROM users;`。

### 报错2：`ERROR: could not open relation with OID 12345`

**原因**：表不存在，或用户无`SELECT`权限。  
**解决**：

1. 检查表名拼写（比如`users`写成`user`）；
2. 授予权限：`GRANT SELECT ON users TO your_user;`。

### 报错3：估算行数与实际相差大

**现象**：`EXPLAIN ANALYZE`显示`actual rows=1000`但`rows=100`。  
**原因**：统计信息过时。  
**解决**：运行`ANALYZE users;`更新统计信息。

### 报错4：`EXPLAIN ANALYZE`执行慢

**原因**：查询本身耗时（比如全表扫描1000万行）。  
**解决**：加`LIMIT`限制行数（比如`EXPLAIN ANALYZE SELECT * FROM orders LIMIT 100;`），但注意这会改变执行计划。

## 参考链接

- PostgreSQL 17官方文档：Using EXPLAIN https://www.postgresql.org/docs/17/using-explain.html
- PostgreSQL 17官方文档：Query Planning https://www.postgresql.org/docs/17/query-planning.html
- PostgreSQL 17官方文档：Plan Node Types https://www.postgresql.org/docs/17/planner-node-types.html
- PostgreSQL 17官方文档：Runtime Configuration for Queries https://www.postgresql.org/docs/17/runtime-config-query.html

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[想知道数据库怎么给查询“算成本选路线”？EXPLAIN能帮你看明白？](https://blog.cmdragon.cn/posts/9101b75bdec6faea9b35d54f14e37f36/)




<details>
<summary>往期文章归档</summary>

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
- [如何在API高并发中玩转资源隔离与限流策略？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/4ad4ec1dbd80bcf5670fb397ca7cc68c/)
- [任务分片执行模式如何让你的FastAPI性能飙升？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c6a598639f6a831e9e82e171b8d71857/)
- [冷热任务分离：是提升Web性能的终极秘籍还是技术噱头？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/9c3dc7767a9282f7ef02daad42539f2c/)
- [如何让FastAPI在百万级任务处理中依然游刃有余？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/469aae0e0f88c642ed8bc82e102b960b/)

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