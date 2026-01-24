---
url: /posts/2eca89463454fd4250d7b66243b9fe5a/
title: PostgreSQL选Join策略有啥小九九？Nested Loop/Merge/Hash谁是它的菜？
date: 2025-10-10T03:10:41+08:00
lastmod: 2025-10-10T03:10:41+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/49f3259a2b6e4a3dafa445bad5fc0ded~tplv-5jbd59dj06-image.png

summary:
  PostgreSQL中的连接查询（JOIN）通过查询优化器选择成本最低的执行策略，主要包含三种Join策略：Nested Loop Join、Merge Join和Hash Join。Nested Loop Join适用于小表或内层表有索引的场景；Merge Join适合两个表Join键都有有序索引的情况；Hash Join则用于大表与小表的连接，通过构建Hash表加速查询。优化器还会根据表大小和索引情况选择Join顺序，优先减少中间结果的大小。

categories:
  - postgresql

tags:
  - 基础入门
  - 连接查询
  - Join策略
  - Nested Loop Join
  - Merge Join
  - Hash Join
  - 查询优化器

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/49f3259a2b6e4a3dafa445bad5fc0ded~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 一、连接查询的核心逻辑：PostgreSQL如何选择Join策略

在PostgreSQL中，连接查询（JOIN）的本质是将多个表的行根据指定条件组合成新的结果集。比如查询“每个用户的订单信息”，需要将`users`
表和`orders`表通过`user_id`字段连接。但**同样的查询可以有多种执行方式**
，PostgreSQL的查询优化器（Optimizer）会根据表的大小、索引情况、数据分布等因素，选择“预计成本最低”的执行策略——这就是Join策略的选择过程。

根据官方文档，优化器的工作流程大概分为两步：

1. **单表扫描计划生成**：为每个涉及的表生成可能的扫描计划（比如 sequential scan 全表扫描、index scan 索引扫描）。
2. **Join策略选择**：针对多表连接，从三种基础策略（Nested Loop Join、Merge Join、Hash Join）中选择最优方案，并确定Join的顺序。

接下来，我们逐个拆解这三种Join策略，理解它们的原理、适用场景和优化技巧。

## 二、Nested Loop Join：最“直观”的连接方式

### 2.1 原理：外层循环驱动内层查询

Nested Loop Join（嵌套循环连接）是最基础的Join策略，逻辑类似于编程语言中的“双重循环”：

- **外层表（Left Relation）**：作为“驱动表”，每次取一行数据；
- **内层表（Right Relation）**：对于外层表的每一行，用该行的Join键去查询内层表的匹配行；
- **输出结果**：将匹配的行组合后返回。

用伪代码表示：

```python
for left_row in left_table:
    for right_row in right_table where right_row.key == left_row.key:
        output(left_row, right_row)
```

但直接这样写效率极低——如果内层表是全表扫描，外层有1000行，内层就要扫1000次！**PostgreSQL的优化点**在于：如果内层表的Join键上有
**索引**，那么内层查询会变成快速的索引查找（比如B-tree索引的`index scan`），从而将内层的时间复杂度从O(N)降到O(log N)。

### 2.2 流程图：带索引的Nested Loop Join

```
外层循环（左表行）
    │
    ▼
取出左表行的Join键（如user_id=123）
    │
    ▼
内层查询：用Join键查右表的索引（如orders.user_id索引）
    │
    ▼
找到右表中匹配的行（如orders where user_id=123）
    │
    ▼
组合左表行和右表行，输出结果
```

### 2.3 示例：带索引的Nested Loop Join

假设我们有两个表：

- `users`（用户表）：`user_id`（主键，B-tree索引）、`name`（1000行）；
- `orders`（订单表）：`order_id`（主键）、`user_id`（B-tree索引）、`amount`（10000行）。

查询“所有用户的订单信息”：

```sql
-- 示例1：Nested Loop Join（PostgreSQL会自动选择）
SELECT u.name, o.order_id, o.amount
FROM users u
         JOIN orders o ON u.user_id = o.user_id;
```

**执行计划分析**（用`EXPLAIN ANALYZE`查看）：

```
Nested Loop Join  (cost=0.29..115.32 rows=1000 width=44) (actual time=0.03..1.23 rows=1000 loops=1)
  ->  Seq Scan on users u  (cost=0.00..22.00 rows=1000 width=36) (actual time=0.01..0.21 rows=1000 loops=1)
  ->  Index Scan using orders_user_id_idx on orders o  (cost=0.29..0.09 rows=1 width=16) (actual time=0.00..0.00 rows=1 loops=1000)
        Index Cond: (user_id = u.user_id)
```

- 外层是`users`表的全表扫描（Seq Scan）；
- 内层是`orders`表的`user_id`索引扫描（Index Scan），每次用`u.user_id`作为条件；
- 总时间仅1.23毫秒，因为内层的索引扫描非常快。

### 2.4 适用场景

Nested Loop Join**最适合**：

- 外层表（左表）很小，或者内层表的Join键上有**高效索引**；
- 需要“尽早返回结果”的场景（比如OLTP系统中的点查询）。

**反例**：如果内层表没有索引，且数据量大，Nested Loop会变成“灾难”——比如外层有100万行，内层全表扫描100万次，时间会爆炸。

## 三、Merge Join：排序后的并行匹配

### 3.1 原理：先排序，再“双指针”扫描

Merge Join（合并连接）的核心思想是：**将两个表的Join键排序后，用双指针并行扫描匹配**。步骤如下：

1. **排序阶段**：将左表和右表按Join键排序（可以是显式的`ORDER BY`，也可以利用表上已有的索引避免排序）；
2. **合并阶段**：用两个指针分别指向两个表的起始位置，比较当前行的Join键：
    - 如果相等，输出匹配行，同时移动两个指针；
    - 如果左表键小，移动左指针；
    - 如果右表键小，移动右指针；
3. **结束**：直到其中一个表扫描完毕。

### 3.2 流程图：基于索引的Merge Join

```
左表：通过索引扫描获取排序后的Join键（如category_id）
    │
    ▼
右表：通过主键索引扫描获取排序后的Join键（如category_id）
    │
    ▼
初始化左指针=0，右指针=0
    │
    ▼
循环：
    左键 = 左表[左指针].join_key
    右键 = 右表[右指针].join_key
    │
    ▼
    如果左键 == 右键：
        输出匹配行，左指针+1，右指针+1
     elif 左键 < 右键：
        左指针+1
     else:
        右指针+1
直到左指针或右指针超出范围
```

### 3.3 示例：利用索引避免排序的Merge Join

假设我们有两个表：

- `products`（产品表）：`product_id`（主键）、`category_id`（B-tree索引）、`product_name`（10000行）；
- `categories`（分类表）：`category_id`（主键，B-tree索引）、`category_name`（1000行）。

查询“每个产品所属的分类名称”：

```sql
-- 示例2：Merge Join（PostgreSQL会自动选择，因为两个表的category_id都有索引）
SELECT p.product_name, c.category_name
FROM products p
         JOIN categories c ON p.category_id = c.category_id;
```

**执行计划分析**：

```
Merge Join  (cost=0.56..234.78 rows=10000 width=56) (actual time=0.05..3.12 rows=10000 loops=1)
  Merge Cond: (p.category_id = c.category_id)
  ->  Index Scan using products_category_id_idx on products p  (cost=0.28..154.28 rows=10000 width=40) (actual time=0.02..1.23 rows=10000 loops=1)
  ->  Index Scan using categories_pkey on categories c  (cost=0.28..44.28 rows=1000 width=24) (actual time=0.01..0.32 rows=1000 loops=1)
```

- 两个表都通过索引扫描获取了**排序后的category_id**（避免了显式排序）；
- Merge阶段用双指针并行扫描，效率非常高。

### 3.4 适用场景

Merge Join**最适合**：

- 两个表的Join键都有**有序索引**（避免排序成本）；
- 需要处理**大表连接**，且Join键的分布比较均匀；
- 输出结果需要按Join键排序的场景（比如`ORDER BY category_id`）。

**反例**：如果两个表都没有有序索引，Merge Join需要先做两次`Sort`操作——排序的时间可能比Join本身还长，这时Hash Join会更优。

## 四、Hash Join：用Hash表加速大表连接

### 4.1 原理：构建Hash表，快速查找

Hash Join（哈希连接）是PostgreSQL处理**大表连接**的“秘密武器”，核心步骤是：

1. **构建阶段（Build Phase）**：选择较小的表作为“构建表”（通常是右表），将其Join键作为Hash键，构建一个**Hash表**
   （内存中，如果内存不够会写临时文件）；
2. **探测阶段（Probe Phase）**：扫描较大的表（左表），对每行的Join键计算Hash值，然后到Hash表中查找匹配的行；
3. **输出结果**：将匹配的行组合后返回。

### 4.2 流程图：Hash Join的两个阶段

```
构建阶段：
    选择右表（小表）→ 遍历每一行→ 计算Join键的Hash值→ 存入Hash表
        │
        ▼
探测阶段：
    遍历左表（大表）→ 计算每行Join键的Hash值→ 查Hash表→ 输出匹配行
```

### 4.3 示例：大表与小表的Hash Join

假设我们有两个表：

- `orders`（订单表，大表）：`order_id`（主键）、`user_id`、`amount`（100万行）；
- `users`（用户表，小表）：`user_id`（主键）、`name`（1万行）。

查询“所有订单的用户姓名”：

```sql
-- 示例3：Hash Join（PostgreSQL会自动选择，因为右表users较小）
SELECT o.order_id, o.amount, u.name
FROM orders o
         JOIN users u ON o.user_id = u.user_id;
```

**执行计划分析**：

```
Hash Join  (cost=22.00..1894.00 rows=1000000 width=44) (actual time=0.52..12.34 rows=1000000 loops=1)
  Hash Cond: (o.user_id = u.user_id)
  ->  Seq Scan on orders o  (cost=0.00..1442.00 rows=1000000 width=24) (actual time=0.01..3.45 rows=1000000 loops=1)
  ->  Hash  (cost=14.00..14.00 rows=1000 width=28) (actual time=0.50..0.50 rows=1000 loops=1)
        Buckets: 1024  Batches: 1  Memory Usage: 44kB
        ->  Seq Scan on users u  (cost=0.00..14.00 rows=1000 width=28) (actual time=0.01..0.21 rows=1000 loops=1)
```

- **构建阶段**：将小表`users`全表扫描，构建Hash表（内存使用44kB，非常小）；
- **探测阶段**：扫描大表`orders`，每行计算`user_id`的Hash值，查Hash表；
- 总时间12.34毫秒，处理100万行效率极高。

### 4.4 适用场景

Hash Join**最适合**：

- 连接**大表和小表**（小表作为构建表，Hash表可以放入内存）；
- 不需要结果排序的场景；
- OLAP系统中的复杂查询（比如数据仓库中的多表连接）。

**反例**：如果构建表太大，无法放入内存（超过`work_mem`参数），Hash
Join会将Hash表写入临时文件（磁盘），这时性能会急剧下降——解决办法是调大`work_mem`，或者换用Merge Join。

## 五、Join顺序：为什么“先小表后大表”更优？

除了Join策略，PostgreSQL优化器还会选择**Join的顺序**（比如先Join表A和表B，再Join表C，还是先Join表B和表C，再Join表A）。根据官方文档，Join顺序的选择遵循一个核心原则：
**尽早减少中间结果的大小**。

比如，假设我们要连接三个表：`users`（1万行）、`orders`（100万行）、`order_items`（1000万行）。优化器会优先选择**先Join小表`users`
和`orders`**（得到100万行中间结果），再Join`order_items`（1000万行）——而不是先Join`orders`和`order_items`
（1000万行中间结果）再Join`users`（这样中间结果更大，处理时间更长）。

### 5.1 PostgreSQL的Join顺序选择算法

- **Exhaustive Search（穷举搜索）**：当Join的表数量≤`geqo_threshold`（默认12）时，优化器会尝试所有可能的Join顺序，选择成本最低的；
- **Genetic Query Optimizer（遗传算法）**：当Join的表数量> `geqo_threshold`时，优化器用遗传算法快速找到“较优”的Join顺序（而非最优，因为穷举的时间成本太高）。

**优化建议**：如果你的查询涉及多个表的Join，可以通过`EXPLAIN ANALYZE`
查看Join顺序，若发现不合理（比如先Join大表），可以尝试用`JOIN ... ON ...`的顺序引导优化器，或者调整`geqo_threshold`参数。

## 六、课后Quiz：巩固你的理解

### 问题1

当连接一个**大表A（100万行）**和一个**小表B（1万行）**时，PostgreSQL最可能选择哪种Join策略？为什么？

### 问题2

如果两个表的Join键都没有索引，且需要连接大表，哪种Join策略会更优？为什么？

### 答案解析

**问题1答案**：Hash Join。因为小表B可以作为“构建表”，快速构建内存中的Hash表；大表A作为“探测表”，扫描时通过Hash值快速查找匹配行——这种方式避免了Nested
Loop的多次扫描，也避免了Merge Join的排序成本。

**问题2答案**：Hash Join。因为Merge Join需要先排序两个大表（成本很高），而Hash
Join只需要构建小表的Hash表（如果小表的话），或者即使大表，Hash表的构建成本也比两次排序低。

## 七、常见报错与解决办法

### 报错1：ERROR:  could not find join condition for table "b"

**错误原因**：连接两个表时没有指定Join条件（比如`FROM a JOIN b`而没有`ON a.id = b.a_id`），导致PostgreSQL尝试做**笛卡尔积**
（Cartesian Product）——这会返回`a的行数 × b的行数`行，通常是无意的，所以PostgreSQL会报错阻止。

**解决办法**：添加正确的Join条件，比如`ON a.id = b.a_id`。

**预防建议**：永远不要省略`JOIN`的`ON`条件，除非你明确需要笛卡尔积（此时用`CROSS JOIN`）。

### 报错2：ERROR:  insufficient memory for hash join

**错误原因**：Hash Join的构建表太大，无法放入`work_mem`参数指定的内存（默认`work_mem`
是4MB），导致需要写入临时文件（磁盘），PostgreSQL会报错（或警告，取决于配置）。

**解决办法**：

1. 调大`work_mem`参数（比如`SET work_mem = '32MB'`）；
2. 如果构建表太大，换用Merge Join（确保Join键有索引）；
3. 优化查询，减少构建表的大小（比如先过滤小表的行）。

**预防建议**：对于大表连接，提前检查`work_mem`的大小，确保构建表可以放入内存。

## 参考链接

1. PostgreSQL Planner/Optimizer官方文档：https://www.postgresql.org/docs/17/planner-optimizer.html
2. PostgreSQL Explicit Joins官方文档：https://www.postgresql.org/docs/17/explicit-joins.html
3. PostgreSQL Work Mem参数官方文档：https://www.postgresql.org/docs/17/runtime-config-query.html#GUC-WORK-MEM

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[PostgreSQL选Join策略有啥小九九？Nested Loop/Merge/Hash谁是它的菜？](https://blog.cmdragon.cn/posts/2eca89463454fd4250d7b66243b9fe5a/)




<details>
<summary>往期文章归档</summary>

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
- [如何在API高并发中玩转资源隔离与限流策略？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/4ad4ec1dbd80bcf5670fb397ca7cc68c/)
- [任务分片执行模式如何让你的FastAPI性能飙升？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c6a598639f6a831e9e82e171b8d71857/)
- [冷热任务分离：是提升Web性能的终极秘籍还是技术噱头？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/9c3dc7767a9282f7ef02daad42539f2c/)

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