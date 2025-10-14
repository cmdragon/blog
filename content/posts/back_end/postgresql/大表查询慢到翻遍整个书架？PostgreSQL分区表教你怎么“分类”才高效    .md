---
url: /posts/7b7053f392147a8b3b1a16bebeb08d0a/
title: 大表查询慢到翻遍整个书架？PostgreSQL分区表教你怎么“分类”才高效
date: 2025-10-13T03:29:44+08:00
lastmod: 2025-10-13T03:29:44+08:00
author: cmdragon
cover: /images/ade3054cba0c47409871c87bb7050a08~tplv-5jbd59dj06-aigc.png

summary:
  分区表通过将逻辑上的大表拆分为物理上的小表，提升数据库性能。PostgreSQL支持范围分区、列表分区和哈希分区三种方式，分别适用于按连续区间、枚举值和哈希值拆分数据的场景。分区表的核心优势包括查询加速、批量操作高效、冷数据存储优化和索引性能提升。声明式分区是推荐实现方式，通过创建分区表、分区和索引，结合分区剪枝优化查询性能。维护分区表时，可添加、删除或修改分区，并可通过子分区进一步优化。最佳实践包括选择合适的分区键、控制分区数量、考虑扩展性、避免跨分区操作和谨慎使用默认分区。

categories:
  - postgresql

tags:
  - 基础入门
  - PostgreSQL
  - 范围分区
  - 列表分区
  - 哈希分区
  - 分区剪枝
  - 声明式分区

---

<img src="/images/ade3054cba0c47409871c87bb7050a08~tplv-5jbd59dj06-aigc.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 1. 分区表概述

### 1.1 什么是分区表？

分区表是将**逻辑上的大表**拆分为**物理上的小表**
的技术。想象你有一个放了10年日记的书架：如果不分类，找某一天的日记要翻遍整个书架；但如果按“年份→月份”分层，找2023年10月的日记只需翻对应层——这就是分区的核心逻辑：
**把数据按规则“归类”，让查询/操作只触达必要的数据**。

### 1.2 分区的核心优势

PostgreSQL官网明确提到，分区的价值主要体现在4点：

- **查询加速**：如果查询只涉及少数分区（比如“最近1个月的订单”），数据库会自动跳过其他分区（称为“分区剪枝”），避免全表扫描。
- **批量操作高效**：删除旧数据只需`DROP TABLE 旧分区`（比`DELETE`快10倍以上），添加新数据只需`CREATE TABLE 新分区`。
- **冷数据存储优化**：将不常用的历史数据（比如3年前的日志）迁移到廉价存储（如S3），降低成本。
- **索引性能提升**：每个分区的索引更小，更容易被缓存到内存，减少磁盘IO。

## 2. 三种常见的分区类型

PostgreSQL支持**范围分区、列表分区、哈希分区**三种内置方式，覆盖90%以上的业务场景。下面用“电商订单表”为例，逐一解释：

### 2.1 范围分区（RANGE Partitioning）

**定义**：按**连续区间**拆分数据，比如时间、数值范围。  
**适用场景**：数据有自然的“顺序性”，且查询常按区间过滤（如“最近7天的订单”“金额100-500元的订单”）。  
**例子**：订单表按`create_time`（创建时间）分月存储：

```sql
-- 1. 创建分区表（指定分区方式为RANGE，分区键为create_time）
CREATE TABLE orders (
    order_id bigserial PRIMARY KEY,
    create_time timestamp NOT NULL,
    user_id int NOT NULL,
    amount decimal(10,2) NOT NULL
) PARTITION BY RANGE (create_time);

-- 2. 创建2023年10月的分区（区间：2023-10-01 ≤ create_time < 2023-11-01）
CREATE TABLE orders_202310 PARTITION OF orders
    FOR VALUES FROM ('2023-10-01') TO ('2023-11-01');

-- 3. 创建2023年11月的分区（依此类推）
CREATE TABLE orders_202311 PARTITION OF orders
    FOR VALUES FROM ('2023-11-01') TO ('2023-12-01');
```

**关键细节**：范围分区的区间是**左闭右开**（`FROM`包含，`TO`不包含），避免数据重叠（比如`2023-11-01`会落到`orders_202311`分区）。

### 2.2 列表分区（LIST Partitioning）

**定义**：按**枚举值**拆分数据，比如地区、状态。  
**适用场景**：数据有明确的“分类标签”，且查询常按标签过滤（如“华东地区的订单”“已完成的订单”）。  
**例子**：订单表按`region`（地区）拆分：

```sql
-- 1. 创建分区表（分区方式为LIST，分区键为region）
CREATE TABLE orders (
    order_id bigserial PRIMARY KEY,
    region text NOT NULL,
    amount decimal(10,2) NOT NULL
) PARTITION BY LIST (region);

-- 2. 创建“华东”分区（包含值：'华东'）
CREATE TABLE orders_east PARTITION OF orders
    FOR VALUES IN ('华东');

-- 3. 创建“华南”分区（包含值：'华南'）
CREATE TABLE orders_south PARTITION OF orders
    FOR VALUES IN ('华南');
```

**关键细节**：列表分区的`IN`子句必须覆盖所有可能的取值（否则插入未定义的值会报错），或添加**默认分区**（但默认分区会影响剪枝性能，谨慎使用）。

### 2.3 哈希分区（HASH Partitioning）

**定义**：按**哈希算法**拆分数据，将分区键的哈希值对`modulus`取余，分配到不同分区。  
**适用场景**：数据无明显顺序/分类，但需要**均匀分布**（比如用户数据、设备日志），避免单分区过大。  
**例子**：用户数据表按`user_id`拆分到8个分区：

```sql
-- 1. 创建分区表（分区方式为HASH，分区键为user_id）
CREATE TABLE user_data (
    user_id int NOT NULL,
    data text NOT NULL
) PARTITION BY HASH (user_id);

-- 2. 创建8个分区（modulus=8，余数0-7）
CREATE TABLE user_data_0 PARTITION OF user_data
    FOR VALUES WITH (modulus 8, remainder 0);
CREATE TABLE user_data_1 PARTITION OF user_data
    FOR VALUES WITH (modulus 8, remainder 1);
...
CREATE TABLE user_data_7 PARTITION OF user_data
    FOR VALUES WITH (modulus 8, remainder 7);
```

**关键细节**：`modulus`（模数）决定分区数量，建议选**2的幂**（如8、16、32），保证数据分布更均匀。

## 3. 声明式分区的实现步骤

PostgreSQL的**声明式分区**（Declarative Partitioning）是推荐的方式（比传统继承分区更高效），核心步骤如下（以“measurement”表为例，官网经典案例）：

### 3.1 步骤1：创建分区表

首先定义**父表**（虚拟表，无实际数据），指定分区方式和分区键：

```sql
CREATE TABLE measurement (
    city_id int NOT NULL,
    logdate date NOT NULL,
    peaktemp int,
    unitsales int
) PARTITION BY RANGE (logdate); -- 按logdate（日期）范围分区
```

### 3.2 步骤2：创建分区

为每个区间创建**子表**（实际存储数据的物理表），指定区间边界：

```sql
-- 2006年2月的分区：logdate ∈ [2006-02-01, 2006-03-01)
CREATE TABLE measurement_y2006m02 PARTITION OF measurement
    FOR VALUES FROM ('2006-02-01') TO ('2006-03-01');

-- 2006年3月的分区：logdate ∈ [2006-03-01, 2006-04-01)
CREATE TABLE measurement_y2006m03 PARTITION OF measurement
    FOR VALUES FROM ('2006-03-01') TO ('2006-04-01');
```

### 3.3 步骤3：创建索引

在父表上创建索引，PostgreSQL会**自动同步到所有分区**（包括未来新增的分区）：

```sql
-- 在logdate列创建索引（加速按日期的查询）
CREATE INDEX ON measurement (logdate);
```

这等价于在每个分区上创建`logdate`索引，无需手动操作。

### 3.4 步骤4：验证分区剪枝

分区剪枝（Partition Pruning）是分区表的“灵魂”——让查询只扫描必要的分区。验证方法：用`EXPLAIN`查看执行计划。

**例子**：查询2008年1月的记录：

```sql
-- 开启分区剪枝（默认开启）
SET enable_partition_pruning = on;

-- 查看执行计划
EXPLAIN SELECT count(*) FROM measurement WHERE logdate >= '2008-01-01';
```

**预期输出**（只扫描2008年1月的分区）：

```
Aggregate  (cost=37.75..37.76 rows=1 width=8)
  ->  Seq Scan on measurement_y2008m01  (cost=0.00..33.12 rows=617 width=0)
        Filter: (logdate >= '2008-01-01'::date)
```

如果关闭分区剪枝（`SET enable_partition_pruning = off`），执行计划会显示**扫描所有分区**，性能差异巨大。

## 4. 分区维护：添加、删除与修改

分区表的价值，很大程度体现在**快速维护**上。下面介绍常见操作：

### 4.1 添加新分区

当有新数据写入时（比如下个月的订单），需要提前创建分区，避免插入失败。有两种方式：

#### 方式1：直接创建分区（简单）

```sql
-- 创建2024年1月的订单分区
CREATE TABLE orders_202401 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

#### 方式2：先创建表再关联（灵活）

如果需要先导入数据再关联到父表（比如批量导入历史数据），可以用`ATTACH PARTITION`：

```sql
-- 1. 创建独立表（复制父表结构）
CREATE TABLE orders_202401 (LIKE orders INCLUDING DEFAULTS INCLUDING CONSTRAINTS);

-- 2. 添加CHECK约束（确保数据符合分区边界）
ALTER TABLE orders_202401 ADD CONSTRAINT orders_202401_check
    CHECK (create_time >= '2024-01-01' AND create_time < '2024-02-01');

-- 3. 导入数据（比如从CSV文件）
\copy orders_202401 FROM 'orders_202401.csv' CSV HEADER;

-- 4. 关联到父表（成为分区）
ALTER TABLE orders ATTACH PARTITION orders_202401
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

**关键**：步骤2的`CHECK`约束会让PostgreSQL信任数据符合边界，避免扫描整个表验证（大幅提升效率）。

### 4.2 删除旧分区

删除历史数据只需**DROP分区表**，比`DELETE`快几个数量级（无需VACUUM清理）：

```sql
-- 删除2006年2月的measurement分区（直接物理删除）
DROP TABLE measurement_y2006m02;
```

如果需要保留数据但从父表分离，可以用`DETACH PARTITION`：

```sql
-- 从父表分离分区（仍可单独查询）
ALTER TABLE measurement DETACH PARTITION measurement_y2006m02;
```

### 4.3 子分区的使用

如果单个分区过大（比如“2023年的订单”分区有1000万行），可以**子分区**（比如按`user_id`哈希再拆分成8个分区）：

```sql
-- 1. 创建父分区（2023年订单）
CREATE TABLE orders_2023 PARTITION OF orders
    FOR VALUES FROM ('2023-01-01') TO ('2024-01-01')
    PARTITION BY HASH (user_id); -- 子分区方式：按user_id哈希

-- 2. 创建子分区（8个）
CREATE TABLE orders_2023_0 PARTITION OF orders_2023
    FOR VALUES WITH (modulus 8, remainder 0);
CREATE TABLE orders_2023_1 PARTITION OF orders_2023
    FOR VALUES WITH (modulus 8, remainder 1);
...
```

**注意**：子分区会增加规划时间，建议最多嵌套2层（比如“年→月→用户哈希”就过了）。

## 5. 分区剪枝：让查询飞起来

### 5.1 什么是分区剪枝？

分区剪枝（Partition Pruning）是PostgreSQL的**自动优化**：当查询包含分区键的过滤条件时，数据库会**跳过不需要的分区**
，只扫描必要的分区。

比如查询“2023年10月的订单”，数据库会自动跳过`orders_202309`（9月）、`orders_202311`（11月）等分区，只扫描`orders_202310`。

### 5.2 如何验证分区剪枝？

用`EXPLAIN`命令查看执行计划中的“Append”节点：

- 开启剪枝：`Append`节点只包含需要的分区（比如`orders_202310`）。
- 关闭剪枝：`Append`节点包含所有分区（比如`orders_202309`、`orders_202310`、`orders_202311`）。

### 5.3 执行时的分区剪枝

PostgreSQL不仅在**规划阶段**剪枝，还会在**执行阶段**剪枝——比如处理`PREPARE`语句（参数化查询）或嵌套循环 join 时，能根据
runtime 参数动态跳过分区。

比如：

```sql
-- 预处理查询（logdate为参数）
PREPARE get_measurement(date) AS
    SELECT * FROM measurement WHERE logdate >= $1;

-- 执行时传入参数（2008-01-01），会剪枝到2008年1月的分区
EXECUTE get_measurement('2008-01-01');
```

## 6. 声明式分区的最佳实践

总结了5条关键建议，避免踩坑：

### 6.1 选择合适的分区键

**核心原则**：分区键必须是**查询中最常出现的过滤条件**（比如订单表的`create_time`、用户表的`user_id`）。  
**反例**：如果查询很少按`city_id`过滤，却用`city_id`做分区键，会导致分区剪枝失效，查询变慢。

### 6.2 控制分区数量

- **太少**：比如1个分区（等于没分区），索引过大，缓存命中率低。
- **太多**：比如1000个分区，查询规划时间变长，内存消耗增加（每个分区的元数据需要加载到内存）。  
  **建议**：分区数量控制在**几十到几百**（比如按月份分区，3年就是36个分区）。

### 6.3 考虑未来的扩展性

比如按“客户ID”列表分区，但如果未来客户数量从100增长到10000，分区数量会爆炸——此时**哈希分区**
更合适（比如选32个分区，不管客户数量多少，数据都均匀分布）。

### 6.4 避免跨分区的操作

比如`UPDATE measurement SET logdate = '2008-02-01' WHERE logdate = '2008-01-01'`——会将数据从`measurement_y2008m01`
迁移到`measurement_y2008m02`，性能很差。**建议**：尽量避免修改分区键的值。

### 6.5 不要滥用默认分区

默认分区（`FOR VALUES DEFAULT`）会接收所有未匹配的行，但会导致**分区剪枝失效**（因为数据库无法确定默认分区是否包含需要的数据）。
**仅在必要时使用**（比如临时接收未知数据）。

## 7. 课后Quiz：巩固你的知识

### 7.1 问题1

假设你有一个“电商订单表”，需要按“订单状态”（`status`，值为`'pending'`（待支付）、`'paid'`（已支付）、`'cancelled'`
（已取消））存储，且经常查询“已支付的订单”。应该选择哪种分区类型？请写出创建分区表的核心SQL。

**答案**：选择**列表分区**（LIST），因为“订单状态”是枚举值，符合列表分区的场景。  
核心SQL：

```sql
CREATE TABLE orders (
    order_id bigserial PRIMARY KEY,
    status text NOT NULL,
    amount decimal(10,2) NOT NULL
) PARTITION BY LIST (status);

CREATE TABLE orders_pending PARTITION OF orders FOR VALUES IN ('pending');
CREATE TABLE orders_paid PARTITION OF orders FOR VALUES IN ('paid');
CREATE TABLE orders_cancelled PARTITION OF orders FOR VALUES IN ('cancelled');
```

### 7.2 问题2

当插入数据到分区表时遇到`ERROR: no partition of relation "orders" found for row`，可能的原因是什么？如何解决？

**答案**：

- **原因**：插入的行的**分区键值**不在任何已有的分区范围内（比如插入`status = 'refunded'`（已退款），但未创建对应分区）。
- **解决**：
    1. 检查插入的分区键值是否正确（比如是否拼写错误）；
    2. 添加对应的分区（比如`CREATE TABLE orders_refunded PARTITION OF orders FOR VALUES IN ('refunded')`）；
    3. （可选）添加默认分区（`CREATE TABLE orders_default PARTITION OF orders FOR

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[大表查询慢到翻遍整个书架？PostgreSQL分区表教你怎么“分类”才高效](https://blog.cmdragon.cn/posts/7b7053f392147a8b3b1a16bebeb08d0a/)



<details>
<summary>往期文章归档</summary>

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
- [如何在API高并发中玩转资源隔离与限流策略？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/4ad4ec1dbd80bcf5670fb397ca7cc68c/)

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