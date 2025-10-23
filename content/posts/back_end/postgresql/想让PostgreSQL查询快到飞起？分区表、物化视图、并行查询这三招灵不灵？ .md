---
url: /posts/1fee7afbb9abd4540b8aa9c141d6845d/
title: 想让PostgreSQL查询快到飞起？分区表、物化视图、并行查询这三招灵不灵？
date: 2025-10-23T03:20:31+08:00
lastmod: 2025-10-23T03:20:31+08:00
author: cmdragon
cover: /images/6a97d0f496c04e52b3a94f1423c822a8~tplv-5jbd59dj06-image.png

summary:
  分区表通过将大表拆分为小表，优化查询性能、数据维护和存储分层。PostgreSQL支持范围、列表和哈希分区。声明式分区步骤包括创建分区表、分区、索引及验证数据路由。分区维护涉及添加、删除和detach分区。分区剪枝自动跳过无关分区，提升查询效率。物化视图通过存储查询结果加速查询，需手动刷新。并行查询利用多CPU加速大表扫描、聚合和连接，但需函数并行安全。常见报错包括无匹配分区、并发刷新需唯一索引及并行查询未生效。

categories:
  - postgresql

tags:
  - 基础入门
  - 物化视图
  - 并行查询
  - PostgreSQL
  - 查询优化
  - 数据管理
  - 性能优化

---

<img src="/images/6a97d0f496c04e52b3a94f1423c822a8~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 分区表：大规模数据的高效管理

### 1.1 分区表概述

分区表是将**逻辑上的大表**拆分为**物理上的小表**的技术。当表的数据量超过服务器内存时，分区表能解决以下痛点：

- **查询性能优化**：仅扫描相关分区（比如查2023年数据时，跳过2020年的分区）；
- **数据维护高效**：删除旧数据只需 drop 分区（而非逐条删除）；
- **存储分层**：将冷数据（如5年前的记录）存到廉价存储，热数据存到高速存储。

PostgreSQL 支持三种分区方式：

1. **范围分区（Range）**：按连续范围划分（如日期、ID）；
2. **列表分区（List）**：按离散值划分（如地区、状态）；
3. **哈希分区（Hash）**：按哈希值模运算划分（如将用户ID均匀分到10个分区）。

### 1.2 声明式分区的实现步骤

声明式分区是 PostgreSQL 10+ 推荐的方式（无需手动写触发器），以**按日期分区的测量表**为例：

#### 步骤1：创建分区表（父表）

```sql
-- 创建分区表，按logdate（日期）范围分区
CREATE TABLE measurement (
    city_id     int NOT NULL,
    logdate     date NOT NULL,
    peaktemp    int,
    unitsales   int
) PARTITION BY RANGE (logdate); -- 分区方法+分区键
```

#### 步骤2：创建分区

每个分区对应一个时间范围，**上界是排他的**（如`FROM '2023-01-01' TO '2023-02-01'`包含1月但不包含2月1日）：

```sql
-- 创建2023年1月的分区
CREATE TABLE measurement_202301 PARTITION OF measurement
FOR VALUES FROM ('2023-01-01') TO ('2023-02-01');

-- 创建2023年2月的分区（指定高速表空间）
CREATE TABLE measurement_202302 PARTITION OF measurement
FOR VALUES FROM ('2023-02-01') TO ('2023-03-01')
TABLESPACE fast_tablespace;
```

#### 步骤3：创建索引

在父表上创建索引会自动同步到所有分区：

```sql
-- 对分区键logdate创建索引（加速查询与数据路由）
CREATE INDEX ON measurement (logdate);
```

#### 步骤4：验证数据路由

插入数据时，PostgreSQL 会自动将行路由到对应分区：

```sql
INSERT INTO measurement VALUES (1, '2023-01-15', 25, 100); -- 自动存入measurement_202301
INSERT INTO measurement VALUES (2, '2023-02-20', 28, 150); -- 自动存入measurement_202302
```

### 1.3 分区维护：添加、删除与 Detach

#### 1.3.1 删除旧分区

直接 drop 分区即可快速删除大量数据（无需逐行删除）：

```sql
-- 删除2023年1月的分区（瞬间完成）
DROP TABLE measurement_202301;
```

#### 1.3.2  detach 分区（保留数据但移出分区表）

如果需要保留旧数据但不再让它属于分区表，可以用 `DETACH PARTITION`：

```sql
-- 将2023年1月的分区移出measurement表
ALTER TABLE measurement DETACH PARTITION measurement_202301;
```

此时 `measurement_202301` 变成独立表，仍可查询，但不再参与分区表的逻辑。

#### 1.3.3 添加新分区

每月需添加新分区以接收新数据：

```sql
-- 添加2023年3月的分区
CREATE TABLE measurement_202303 PARTITION OF measurement
FOR VALUES FROM ('2023-03-01') TO ('2023-04-01');
```

### 1.4 分区剪枝：让查询跳过无用分区

**分区剪枝（Partition Pruning）**是分区表的核心优化：查询时，PostgreSQL 会自动跳过不包含目标数据的分区。

#### 例子：查询2023年2月的数据

```sql
-- 开启分区剪枝（默认开启）
SET enable_partition_pruning = on;

EXPLAIN ANALYZE
SELECT COUNT(*) FROM measurement WHERE logdate >= '2023-02-01';
```

**剪枝前**的执行计划（会扫描所有分区）：

```
Aggregate  (cost=188.76..188.77 rows=1 width=8)
  ->  Append  (cost=0.00..181.05 rows=3085 width=0)
        ->  Seq Scan on measurement_202301  (cost=0.00..33.12 rows=617 width=0)
              Filter: (logdate >= '2023-02-01'::date)
        ->  Seq Scan on measurement_202302  (cost=0.00..33.12 rows=617 width=0)
              Filter: (logdate >= '2023-02-01'::date)
        ->  Seq Scan on measurement_202303  (cost=0.00..33.12 rows=617 width=0)
              Filter: (logdate >= '2023-02-01'::date)
```

**剪枝后**的执行计划（仅扫描202302分区）：

```
Aggregate  (cost=37.75..37.76 rows=1 width=8)
  ->  Seq Scan on measurement_202302  (cost=0.00..33.12 rows=617 width=0)
        Filter: (logdate >= '2023-02-01'::date)
```

## 物化视图：用空间换时间的查询优化

### 2.1 物化视图与普通视图的区别

| **特性** | **普通视图（View）** | **物化视图（Materialized View）** |
|--------|----------------|-----------------------------|
| 数据存储   | 不存储数据，实时计算     | 存储查询结果（类似表）                 |
| 查询性能   | 每次查询重新计算，慢     | 直接读存储的结果，快                  |
| 数据新鲜度  | 实时更新           | 需要手动刷新（REFRESH）             |
| 索引支持   | 不支持（依赖基表索引）    | 支持创建索引（进一步加速查询）             |

### 2.2 物化视图的创建与刷新

以**销售汇总物化视图**为例：

#### 步骤1：创建物化视图

```sql
-- 创建销售汇总物化视图（按销售日期+销售员分组）
CREATE MATERIALIZED VIEW sales_summary AS
SELECT
    seller_no,
    invoice_date,
    SUM(invoice_amt) AS total_sales
FROM invoice
WHERE invoice_date < CURRENT_DATE -- 排除今日未完成的订单
GROUP BY seller_no, invoice_date;

-- 添加唯一索引（用于并发刷新）
CREATE UNIQUE INDEX idx_sales_summary ON sales_summary (seller_no, invoice_date);
```

#### 步骤2：刷新物化视图

物化视图的结果不会自动更新，需手动刷新：

```sql
-- 普通刷新（会锁表，期间无法查询）
REFRESH MATERIALIZED VIEW sales_summary;

-- 并发刷新（不锁表，但需要唯一索引）
REFRESH MATERIALIZED VIEW CONCURRENTLY sales_summary;
```

### 2.3 物化视图的性能优势案例

官网中的**Foreign Data Wrapper（FDW）案例**很直观：  
假设用 `file_fdw` 读取本地字典文件（47万行），直接查询需188ms，而物化视图加索引后仅需0.1ms！

```sql
-- 1. 直接查询FDW表（慢）
SELECT COUNT(*) FROM words WHERE word = 'caterpiler'; -- 188ms

-- 2. 查询物化视图（快）
CREATE MATERIALIZED VIEW wrd AS SELECT * FROM words;
CREATE UNIQUE INDEX wrd_word ON wrd (word);
SELECT COUNT(*) FROM wrd WHERE word = 'caterpiler'; -- 0.1ms
```

## 并行查询：利用多CPU加速查询

### 3.1 并行查询的工作原理

并行查询将一个大任务拆分成多个子任务，由**多个工作进程**同时执行，最后合并结果。例如：

- 并行扫描：多个进程同时扫描一个大表的不同片段；
- 并行聚合：多个进程分别计算部分结果，最后汇总总和；
- 并行连接：两个大表连接时，多个进程同时处理不同的数据块。

### 3.2 并行查询的适用场景

并非所有查询都能并行，以下场景最有效：

1. **大表全表扫描**（如 `SELECT COUNT(*) FROM big_table`）；
2. **大表聚合操作**（如 `SUM`、`AVG`、`COUNT`）；
3. **大表连接**（如 `JOIN` 两个千万行级别的表）；
4. **分区表扫描**（多个分区同时扫描）。

**不支持并行的场景**：

- 使用了 `LIMIT`（无法拆分任务）；
- 使用了并行不安全的函数（如 `random()`、`current_timestamp`）；
- 事务中修改了数据库（如 `INSERT`/`UPDATE`/`DELETE`）。

### 3.3 并行安全：函数与聚合的并行标签

函数/聚合的**并行安全性**决定了能否在并行查询中使用，分为三类：

1. **PARALLEL SAFE**：完全安全（如 `abs()`、`concat()`）；
2. **PARALLEL RESTRICTED**：仅能在 leader 进程执行（如 `currval()`）；
3. **PARALLEL UNSAFE**：不安全（如 `setval()`、`pg_sleep()`）。

#### 查看函数的并行标签

```sql
-- 查看concat函数的并行标签
SELECT proname, proparallel FROM pg_proc WHERE proname = 'concat';
-- 结果：proparallel = 's'（即SAFE）
```

#### 修改函数的并行标签

如果自定义函数是安全的，可以手动标记：

```sql
-- 将自定义函数标记为PARALLEL SAFE
ALTER FUNCTION my_safe_function() SET PARALLEL SAFE;
```

## 课后 Quiz

### 问题1：插入数据到声明式分区表时，提示“no partition of relation found for row”，原因是什么？如何解决？

**答案**：  
原因：插入的数据没有匹配的分区（如插入2023-04-01的数据，但未创建4月的分区）。  
解决：

1.
提前创建对应分区（如 `CREATE TABLE measurement_202304 PARTITION OF measurement FOR VALUES FROM ('2023-04-01') TO ('2023-05-01')`）；
2. 创建默认分区（接收所有未匹配的数据）：`CREATE TABLE measurement_default PARTITION OF measurement DEFAULT;`。

### 问题2：为什么并发刷新物化视图需要唯一索引？

**答案**：  
并发刷新（`REFRESH CONCURRENTLY`）需要比较旧数据与新数据的差异，唯一索引用于快速定位修改的行，避免全表扫描。如果没有唯一索引，PostgreSQL
无法安全地并发更新物化视图。

### 问题3：并行查询没有生效，可能的原因是什么？

**答案**：

1. `enable_parallel_query` 参数关闭（默认开启，需检查 `postgresql.conf`）；
2. 查询使用了并行不安全的函数（如 `random()`）；
3. 表的数据量太小（PostgreSQL 认为并行的 overhead 大于收益）；
4. 查询包含 `LIMIT` 或 `FOR UPDATE`（无法并行）。

## 常见报错解决方案

### 报错1：`ERROR: no partition of relation "measurement" found for row`

**原因**：插入的数据没有匹配的分区。  
**解决**：创建对应分区或默认分区（参考Quiz问题1）。

### 报错2：`ERROR: cannot refresh materialized view "sales_summary" concurrently without a unique index`

**原因**：并发刷新需要唯一索引。  
**解决**：给物化视图添加唯一索引（如 `CREATE UNIQUE INDEX idx_sales_summary ON sales_summary (seller_no, invoice_date)`）。

### 报错3：并行查询未生效（执行计划中无 `Parallel Seq Scan`）

**原因**：

- `enable_parallel_query` = off；
- 查询使用了并行不安全的函数；
- 表太小（小于 `min_parallel_table_scan_size` 参数，默认8MB）。  
  **解决**：

1. 检查 `postgresql.conf`：`enable_parallel_query = on`；
2. 将函数标记为 `PARALLEL SAFE`；
3. 确认表大小超过 `min_parallel_table_scan_size`。

## 参考链接

1. 分区表：https://www.postgresql.org/docs/17/ddl-partitioning.html
2. 物化视图：https://www.postgresql.org/docs/17/rules-materializedviews.html
3. 并行查询：https://www.postgresql.org/docs/17/parallel-query.html

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[想让PostgreSQL查询快到飞起？分区表、物化视图、并行查询这三招灵不灵？](https://blog.cmdragon.cn/posts/1fee7afbb9abd4540b8aa9c141d6845d/)




<details>
<summary>往期文章归档</summary>

- [子查询总拖慢查询？把它变成连接就能解决？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/79c590fbd87ece535b11a71c9667884f/)
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
- [如何在FastAPI中巧妙隔离依赖项，让单元测试不再头疼？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/77ae327dc941b0e74ecc6a8794c084d0/)
- [测试覆盖率不够高？这些技巧让你的FastAPI测试无懈可击！ - cmdragon's Blog](https://blog.cmdragon.cn/posts/0577d0e24f48b3153b510e74d3d1a822/)

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