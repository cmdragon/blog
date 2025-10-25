---
url: /posts/d12e323fb80dc4309985c68a5d45a85c/
title: PostgreSQL查不动？分区表+覆盖索引+物化视图的优化魔法了解下？
date: 2025-10-25T05:38:49+08:00
lastmod: 2025-10-25T05:38:49+08:00
author: cmdragon
cover: /images/2a4b756e442d4f81a9c1e73df77a9cce~tplv-5jbd59dj06-image.png

summary:
  大数据量查询优化中，分区表和索引策略是关键。分区表通过将大表拆分为多个物理子表，减少IO，适用于时间序列、类别化和均匀分布数据。索引优化中，覆盖索引和部分索引能显著提升查询效率。报表查询优化可通过物化视图预计算结果和并行查询加速复杂聚合。混合负载优化需通过资源管理和`pg_stat_statements`定位慢查询，隔离OLTP与OLAP资源，确保系统性能平衡。

categories:
  - postgresql

tags:
  - 基础入门
  - 大数据查询优化
  - 分区表
  - 索引策略
  - 物化视图
  - 并行查询
  - 混合负载优化

---

<img src="/images/2a4b756e442d4f81a9c1e73df77a9cce~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 一、大数据量查询优化：分区表与索引策略

在数据量达到千万甚至亿级时，传统的单表查询会因为**全表扫描**或**索引失效**导致性能骤降。此时的核心优化思路是**“拆分数据”*
*和**“减少IO”**，对应的工具是**分区表**和**精准索引**。

#### 1.1 分区表：将大表拆分成可管理的小块

分区表的本质是将一张逻辑上的大表，按**规则拆分成多个物理子表**（称为“分区”）。查询时，PostgreSQL会自动过滤掉无关分区，只扫描需要的数据，从而大幅减少IO。

##### 1.1.1 分区类型与适用场景

PostgreSQL支持3种分区方式（官网文档：[DDL Partitioning](https://www.postgresql.org/docs/17/ddl-partitioning.html)）：

- **范围分区（RANGE）**：按连续的数值范围拆分（如时间、金额），适合**时间序列数据**（如订单、日志）。
- **列表分区（LIST）**：按离散的取值拆分（如地区、状态），适合**类别化数据**（如按“华北/华东”分区的用户表）。
- **哈希分区（HASH）**：按字段的哈希值拆分，适合**均匀分布数据**（如按用户ID分区，避免热点）。

##### 1.1.2 实战：按时间范围分区的订单表

假设我们有一张存储5年订单的表`orders`，每天新增10万条数据，查询通常只涉及最近3个月的数据。我们用**范围分区**按`order_date`
拆分：

```sql
-- 1. 创建主表（定义分区规则）
CREATE TABLE orders (
    order_id bigint PRIMARY KEY,    -- 订单ID（主键）
    order_date date NOT NULL,       -- 订单日期（分区键）
    customer_id bigint,             -- 客户ID
    amount numeric(10,2)            -- 订单金额
) PARTITION BY RANGE (order_date); -- 关键：指定分区键和类型（范围）

-- 2. 创建分区（按年份拆分）
-- 2023年分区（左闭右开：包含2023-01-01，不包含2024-01-01）
CREATE TABLE orders_2023 PARTITION OF orders
FOR VALUES FROM ('2023-01-01') TO ('2024-01-01');

-- 2024年分区
CREATE TABLE orders_2024 PARTITION OF orders
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

-- 3. 插入测试数据（自动路由到对应分区）
INSERT INTO orders VALUES 
(1, '2023-05-10', 100, 50.00), 
(2, '2024-02-15', 200, 100.00);

-- 4. 查询2023年的订单（仅扫描orders_2023分区）
SELECT * FROM orders WHERE order_date BETWEEN '2023-01-01' AND '2023-12-31';
```

**效果**：查询2023年数据时，PostgreSQL不会扫描2024年的分区，数据扫描量减少50%以上（若按年份分区）。

#### 1.2 索引优化：减少IO的关键技巧

索引的核心作用是**快速定位数据**，但不合理的索引会导致“索引膨胀”或“索引失效”。针对大数据量，需重点关注**覆盖索引**和**部分索引
**。

##### 1.2.1 覆盖索引：不用回表的“全能索引”

覆盖索引是指**包含查询所需的所有列**的索引。查询时，PostgreSQL直接从索引中获取数据，无需访问表的主数据块（称为“回表”），从而减少IO。

**例子**：查询2023年5月的订单的客户ID和金额：

```sql
-- 创建覆盖索引（包含过滤条件+查询列）
CREATE INDEX idx_orders_date_customer_amount 
ON orders (order_date, customer_id, amount);

-- 查询（无需回表）
SELECT customer_id, amount 
FROM orders 
WHERE order_date BETWEEN '2023-05-01' AND '2023-05-31';
```

**原理**：索引`idx_orders_date_customer_amount`包含了`order_date`（过滤条件）、`customer_id`（查询列）、`amount`（查询列），因此查询可以
**完全依赖索引**，无需访问`orders`表的主数据。

##### 1.2.2 部分索引：只索引有用的数据

部分索引是指**仅对满足特定条件的行创建索引**，适合**高频过滤场景**（如“仅索引未删除的订单”）。它的优势是**更小的索引体积**和
**更快的查询速度**。

**例子**：仅索引金额大于1000元的高价值订单：

```sql
CREATE INDEX idx_orders_high_amount 
ON orders (amount) 
WHERE amount > 1000; -- 仅索引高价值订单

-- 查询高价值订单（使用部分索引）
SELECT * FROM orders WHERE amount > 1500;
```

**效果**：索引体积仅为全表索引的10%（假设高价值订单占比10%），查询速度提升5-10倍。

### 二、报表查询优化：预计算与并行处理

报表查询的特点是**复杂聚合**（如`SUM`/`COUNT`/`GROUP BY`）、**重复执行**（如每日/每月报表），核心优化思路是**“预计算结果”**和
**“并行处理”**。

#### 2.1 物化视图：报表查询的“缓存神器”

普通视图（`VIEW`）是**虚拟表**，每次查询都会实时计算；而物化视图（`MATERIALIZED VIEW`）是**物理表**，会存储预计算的结果，适合*
*重复执行的复杂查询**。

##### 2.1.1 实战：创建销售日报物化视图

假设需要每天生成“按日期汇总的销售额”报表，直接查询`orders`表会因为`GROUP BY`操作缓慢，此时用物化视图预存结果：

```sql
-- 创建物化视图（按天聚合）
CREATE MATERIALIZED VIEW daily_sales AS
SELECT
    order_date,
    SUM(amount) AS total_sales,  -- 总销售额
    COUNT(*) AS order_count      -- 订单数量
FROM orders
GROUP BY order_date
WITH DATA; -- 立即填充数据（也可选WITH NO DATA，后续手动刷新）

-- 查询报表（比直接查orders快10倍以上）
SELECT * FROM daily_sales WHERE order_date BETWEEN '2024-01-01' AND '2024-01-31';

-- 刷新物化视图（当orders有新数据时）
REFRESH MATERIALIZED VIEW daily_sales; -- 全量刷新（会锁表）
-- 或增量刷新（PostgreSQL 15+支持，需创建时指定增量键）
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_sales; -- 并发刷新（不锁表）
```

**关键区别**：

- 普通视图：`SELECT * FROM v_daily_sales` → 实时计算`orders`表的`GROUP BY`。
- 物化视图：`SELECT * FROM daily_sales` → 直接取预存的结果。

**注意**：物化视图的结果是**静态的**，需定期刷新才能反映最新数据。可通过`pg_cron`
扩展（官网：[pg_cron](https://www.postgresql.org/docs/17/pgcron.html)）实现**定时自动刷新**：

```sql
-- 启用pg_cron扩展
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 每天凌晨1点刷新物化视图
SELECT cron.schedule('0 1 * * *', 'REFRESH MATERIALIZED VIEW CONCURRENTLY daily_sales');
```

#### 2.2 并行查询：加速复杂聚合的利器

PostgreSQL从**11版本**开始支持**并行查询**（Parallel Query），可将复杂任务拆分给多个CPU核心同时执行，适合**大表聚合**或*
*多表连接**。

##### 2.2.1 实战：启用并行查询

并行查询的核心参数是`max_parallel_workers_per_gather`（控制每个查询的并行worker数量），默认值为2，可根据CPU核心数调整（如4核CPU设为3）。

```sql
-- 会话级启用并行（或在postgresql.conf中全局设置）
SET max_parallel_workers_per_gather = 4;

-- 执行复杂聚合查询（查看执行计划）
EXPLAIN ANALYZE
SELECT
    order_date,
    SUM(amount) AS total_sales
FROM orders
GROUP BY order_date;
```

**执行计划解读**：

```
HashAggregate  (cost=1000.00..2000.00 rows=1000 width=16) (actual time=100.00..200.00 rows=365 loops=1)
  Group Key: order_date
  ->  Parallel Seq Scan on orders  (cost=0.00..1500.00 rows=100000 width=12) (actual time=0.00..50.00 rows=80000 loops=4)
Planning Time: 1.00 ms
Execution Time: 250.00 ms
```

- `Parallel Seq Scan`：表示使用4个worker进程并行扫描`orders`表。
- `HashAggregate`：将worker的结果汇总，得到最终的聚合值。

**效果**：并行查询的执行时间通常是串行的1/2~1/4（取决于CPU核心数）。

### 三、混合负载优化：平衡OLTP与OLAP的资源争用

混合负载（如“实时交易+报表查询”）的痛点是**资源争用**：OLAP的大查询会占用CPU/IO，导致OLTP的小查询延迟增加。此时的核心思路是**
“定位瓶颈”**和**“隔离资源”**。

#### 3.1 pg_stat_statements：定位慢查询的“显微镜”

`pg_stat_statements`是PostgreSQL的**查询统计扩展**，能跟踪所有SQL语句的执行情况（调用次数、执行时间、IO等），是定位慢查询的“神器”。

##### 3.1.1 实战：用pg_stat_statements分析慢查询

```sql
-- 1. 启用扩展（需超级用户权限）
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 2. 查询Top 10 慢查询（按总执行时间排序）
SELECT
    query,                -- 原始SQL语句（自动截断长语句）
    calls,                -- 调用次数
    round(total_time::numeric, 2) AS total_time, -- 总执行时间（毫秒）
    round(mean_time::numeric, 2) AS mean_time,   -- 平均执行时间（毫秒）
    rows,                 -- 返回行数
    -- 缓存命中率（越高越好，说明数据在内存中，不用读磁盘）
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;
```

**关键指标解读**：

- `total_time`：总执行时间（若某条查询的`total_time`占比高，说明是性能瓶颈）。
- `hit_percent`：缓存命中率（若低于90%，说明内存不足，需增加`shared_buffers`参数）。
- `calls`：调用次数（高频慢查询需优先优化，如加索引或物化视图）。

#### 3.2 资源管理：隔离不同类型的工作负载

混合负载下，OLTP的“小快查询”（如用户登录、下单）可能被OLAP的“大慢查询”（如年度报表）阻塞。此时需通过**资源组**（Resource
Groups）隔离资源。

##### 3.2.1 实战：创建资源组隔离OLAP查询

```sql
-- 1. 启用资源组（需在postgresql.conf中设置shared_preload_libraries = 'resource_group'，并重启数据库）
CREATE EXTENSION IF NOT EXISTS resource_group;

-- 2. 创建OLAP资源组（限制CPU使用）
CREATE RESOURCE GROUP olap_group WITH (
    cpu_weight = 20,    -- CPU权重（相对比例，数值越小，占用的CPU时间越少）
    max_cpu = 4,        -- 最多使用4个CPU核心
    memory_limit = 50%  -- 最多使用50%的内存
);

-- 3. 将OLAP用户分配到该资源组
ALTER USER olap_user SET resource_group = olap_group;
```

**效果**：`olap_user`执行的报表查询会被限制在4个CPU核心内，不会占用所有CPU资源，从而保证OLTP用户的查询延迟。

### 四、课后Quiz：巩固所学知识

#### 问题1

假设你有一张存储了5年订单数据的表`orders`，每天新增10万条数据，查询通常只涉及最近3个月的数据。你会选择哪种分区方式？为什么？

**答案**：  
选择**范围分区（按order_date）**。因为查询是按**时间范围过滤**的，范围分区能让PostgreSQL只扫描最近3个月的分区，避免全表扫描，减少80%以上的数据量。

#### 问题2

物化视图和普通视图的核心区别是什么？如果报表需要**实时数据**，应该用哪个？

**答案**：

- 核心区别：**数据存储**。普通视图不存储数据，每次查询实时计算；物化视图存储预计算的结果。
- 实时数据场景：用**普通视图**，因为物化视图的结果是静态的，需刷新才能更新，无法满足实时需求。

#### 问题3

如何用`pg_stat_statements`找出“高频慢查询”？

**答案**：  
执行以下SQL，按`calls`（调用次数）和`total_time`（总执行时间）排序：

```sql
SELECT query, calls, total_time 
FROM pg_stat_statements 
ORDER BY calls DESC, total_time DESC 
LIMIT 10;
```

高频慢查询的特征是`calls`高（频繁执行）且`total_time`高（每次执行慢），需优先优化（如加索引或物化视图）。

### 五、常见报错解决方案

#### 错误1：创建分区表时提示“ERROR:  relation "orders" does not exist”

**原因**：先创建了分区（如`orders_2023`），再创建主表（`orders`）。  
**解决**：需**先创建主表**（带`PARTITION BY`子句），再创建分区。  
**预防**：严格遵循“主表→分区”的创建顺序。

#### 错误2：刷新物化视图时提示“ERROR:  cannot refresh materialized view "daily_sales" concurrently”

**原因**：`CONCURRENTLY`（并发刷新）要求物化视图有**唯一索引**，否则无法并发刷新。  
**解决**：给物化视图添加唯一索引：

```sql
CREATE UNIQUE INDEX idx_daily_sales_date ON daily_sales (order_date);
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_sales;
```

#### 错误3：启用`pg_stat_statements`时提示“ERROR:  extension "pg_stat_statements" must be loaded via shared_preload_libraries”

**原因**：`pg_stat_statements`需要**预加载**（在数据库启动时加载），未在`postgresql.conf`中配置。  
**解决**：

1. 编辑`postgresql.conf`，添加：`shared_preload_libraries = 'pg_stat_statements'`。
2. 重启PostgreSQL：`sudo systemctl restart postgresql`。
3. 重新创建扩展：`CREATE EXTENSION pg_stat_statements;`。

### 参考链接

- 分区表：https://www.postgresql.org/docs/17/ddl-partitioning.html
- 索引：https://www.postgresql.org/docs/17/indexes.html
- 物化视图：https://www.postgresql.org/docs/17/sql-creatematerializedview.html
- 并行查询：https://www.postgresql.org/docs/17/parallel-query.html
- pg_stat_statements：https://www.postgresql.org/docs/17/pgstatstatements.html

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[PostgreSQL查不动？分区表+覆盖索引+物化视图的优化魔法了解下？](https://blog.cmdragon.cn/posts/d12e323fb80dc4309985c68a5d45a85c/)




<details>
<summary>往期文章归档</summary>

- [想让PostgreSQL快到飞起？先找健康密码还是先换引擎？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/a6997d81b49cd232b87e1cf603888ad1/)
- [想让PostgreSQL查询快到飞起？分区表、物化视图、并行查询这三招灵不灵？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/1fee7afbb9abd4540b8aa9c141d6845d/)
- [子查询总拖慢查询？把它变成连接就能解决？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/79c590fbd87ece535b11a71c9667884f/)
- [PostgreSQL全表扫描慢到崩溃？建索引+改查询+更统计信息三招能破？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/748cdac2536008199abf8a8a2cd0ec85/)
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