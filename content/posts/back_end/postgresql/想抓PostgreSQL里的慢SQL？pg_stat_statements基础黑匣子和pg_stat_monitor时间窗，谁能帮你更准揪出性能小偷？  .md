---
url: /posts/b2213bfcb5b88a862f2138404c03d596/
title: 想抓PostgreSQL里的慢SQL？pg_stat_statements基础黑匣子和pg_stat_monitor时间窗，谁能帮你更准揪出性能小偷？
date: 2025-10-16T02:00:15+08:00
lastmod: 2025-10-16T02:00:15+08:00
author: cmdragon
cover: /images/781d5d3d0c6e4f4c99c71fecc18478c9~tplv-5jbd59dj06-aigc.png

summary:
  pg_stat_statements是PostgreSQL的核心性能监控模块，用于跟踪SQL语句的计划与执行统计信息，帮助定位性能瓶颈。通过修改配置文件并重启数据库，可以启用该模块。核心配置参数包括跟踪SQL的最大数量、跟踪范围等。`pg_stat_statements`视图提供SQL的详细统计信息，如执行次数、总执行时间、缓存命中率等。`pg_stat_monitor`是增强版模块，支持按时间窗口统计和响应时间直方图，适合持续监控。结合这两个模块，可以持续优化数据库性能，通过定位瓶颈SQL、分析执行计划、优化索引等步骤提升效率。

categories:
  - postgresql

tags:
  - 基础入门
    - PostgreSQL
  - 性能监控
  - pg_stat_statements
  - SQL优化
  - 数据库管理
  - 性能分析
  - pg_stat_monitor

---

<img src="/images/781d5d3d0c6e4f4c99c71fecc18478c9~tplv-5jbd59dj06-aigc.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 1. pg_stat_statements：基础性能统计模块

#### 1.1 什么是pg_stat_statements？

`pg_stat_statements`是PostgreSQL官方提供的**核心性能监控模块**，用于跟踪所有SQL语句的**计划与执行统计信息**。它能帮你回答：

- 哪些SQL执行次数最多？
- 哪些SQL总执行时间最长？
- 哪些SQL的缓存命中率最低（IO开销大）？
- 某条SQL的平均执行时间是多少？

简单来说，它是PostgreSQL性能优化的“**黑匣子**”——记录所有SQL的运行痕迹，帮你定位瓶颈。

#### 1.2 安装与启用

`pg_stat_statements`需要**预加载**（因为它需要共享内存），安装步骤分3步：

##### 步骤1：修改配置文件

编辑`postgresql.conf`（通常在`/var/lib/postgresql/17/main/`或`$PGDATA`目录）：

```ini
# 1. 预加载模块（必须）
shared_preload_libraries = 'pg_stat_statements'

# 2. 启用查询ID计算（必须，用于唯一标识相同结构的查询）
compute_query_id = on

# 3. 可选配置（根据需求调整）
pg_stat_statements.max = 10000       # 最多跟踪10000条不同的SQL
pg_stat_statements.track = all       # 跟踪顶级+嵌套语句（比如函数内的SQL）
pg_stat_statements.track_utility = on # 跟踪工具命令（如CREATE TABLE）
```

##### 步骤2：重启PostgreSQL

修改配置后需要重启数据库使生效：

```bash
sudo systemctl restart postgresql
```

##### 步骤3：创建扩展

登录数据库（如`psql -U postgres`），执行以下命令启用扩展：

```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

#### 1.3 核心配置参数解析

| 参数                                  | 作用                                         | 默认值   |
|-------------------------------------|--------------------------------------------|-------|
| `pg_stat_statements.max`            | 最多跟踪多少条不同的SQL（超过则丢弃最不常用的条目）                | 5000  |
| `pg_stat_statements.track`          | 跟踪范围：`top`（仅顶级语句）、`all`（顶级+嵌套）、`none`（不跟踪） | `top` |
| `pg_stat_statements.track_utility`  | 是否跟踪工具命令（如`VACUUM`、`CREATE`）               | `on`  |
| `pg_stat_statements.track_planning` | 是否跟踪计划时间（会增加性能开销）                          | `off` |
| `pg_stat_statements.save`           | 重启后是否保留统计信息                                | `on`  |

#### 1.4 关键视图与字段说明

`pg_stat_statements`提供两个核心视图：

##### 1.4.1 `pg_stat_statements`：SQL统计详情

这个视图是性能分析的**核心**，每一行对应一条不同结构的SQL（用`queryid`标识）。关键字段如下：

| 字段                 | 含义                                                            |
|--------------------|---------------------------------------------------------------|
| `queryid`          | SQL的唯一哈希ID（相同结构的SQL哈希值相同）                                     |
| `query`            | SQL文本（常量会被替换为`$1`、`$2`，比如`SELECT * FROM users WHERE id = $1`） |
| `calls`            | 执行次数                                                          |
| `total_exec_time`  | 总执行时间（毫秒，**最常用的慢查询指标**）                                       |
| `mean_exec_time`   | 平均执行时间（毫秒）                                                    |
| `rows`             | 总返回/影响的行数                                                     |
| `shared_blks_hit`  | 共享缓存命中次数（越高越好，说明少读磁盘）                                         |
| `shared_blks_read` | 共享缓存未命中次数（需要读磁盘，IO开销大）                                        |
| `stats_since`      | 统计开始时间                                                        |

**示例**：计算缓存命中率（越高越好）：

```sql
SELECT 
  query,
  calls,
  total_exec_time,
  100.0 * shared_blks_hit / NULLIF(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 5;
```

##### 1.4.2 `pg_stat_statements_info`：模块自身统计

这个视图只有1行，记录模块的运行状态：
| 字段 | 含义 |
|--------------|----------------------------------------------------------------------|
| `dealloc`    | 因超过`pg_stat_statements.max`而丢弃的SQL条目数（值大说明`max`太小） |
| `stats_reset`| 统计信息最后重置时间 |

#### 1.5 实际使用示例

##### 示例1：找最耗时的前5条SQL

```sql
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  rows
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 5;
```

**结果解读**：`total_exec_time`最高的SQL是性能优化的优先目标（比如总时间10秒的SQL，即使平均时间短，但执行次数多也会拖慢整体性能）。

##### 示例2：找缓存命中率低的SQL

```sql
SELECT 
  query,
  calls,
  100.0 * shared_blks_hit / NULLIF(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements
WHERE hit_percent < 90  -- 命中率低于90%
ORDER BY hit_percent ASC;
```

**优化思路**：命中率低说明SQL经常读磁盘，可能需要**添加索引**或**加大`shared_buffers`**（数据库缓存）。

##### 示例3：重置统计信息

如果统计信息太旧（比如测试环境），可以重置：

```sql
-- 重置所有统计（仅超级用户可执行）
SELECT pg_stat_statements_reset();

-- 重置某条SQL的统计（需指定queryid）
SELECT pg_stat_statements_reset(0, 0, '1234567890'); -- 0表示不限制用户/数据库，queryid替换为实际值
```

### 2. pg_stat_monitor：增强型性能监控工具

`pg_stat_statements`是基础，但有个明显局限——**统计是累计的**（比如某条SQL的总执行时间是从启动到现在的总和），无法看到*
*时间维度的变化**（比如“最近1小时这条SQL的执行时间是否变长？”）。

`pg_stat_monitor`是Percona开发的**增强版模块**，解决了这个问题，适合**持续监控**。

#### 2.1 核心特性（对比`pg_stat_statements`）

| 特性              | `pg_stat_statements` | `pg_stat_monitor` |
|-----------------|----------------------|-------------------|
| 累计统计            | ✅                    | ✅                 |
| 按时间窗口统计         | ❌                    | ✅（比如每1分钟一个窗口）     |
| 响应时间直方图         | ❌                    | ✅（看SQL的响应时间分布）    |
| 慢查询日志集成         | ❌                    | ✅（自动标记慢查询）        |
| 更多维度过滤（如用户、数据库） | ✅                    | ✅（更细粒度）           |

#### 2.2 安装与配置

`pg_stat_monitor`需要从Percona仓库安装（或编译源码）：

```bash
# 安装Percona仓库（以Debian/Ubuntu为例）
sudo apt install percona-postgresql-17-pg_stat_monitor
```

修改`postgresql.conf`：

```ini
shared_preload_libraries = 'pg_stat_monitor'  # 替换或新增
pg_stat_monitor.interval = 60                 # 时间窗口大小（秒，默认60）
pg_stat_monitor.max = 10000                   # 最多跟踪10000条SQL
```

重启数据库后创建扩展：

```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_monitor;
```

#### 2.3 常用查询示例

##### 示例：看最近1小时每条SQL的平均执行时间

```sql
SELECT 
  query,
  sum(calls) AS total_calls,
  avg(mean_exec_time) AS avg_mean_exec_time,
  time
FROM pg_stat_monitor
WHERE time >= NOW() - INTERVAL '1 hour'
GROUP BY query, time
ORDER BY avg_mean_exec_time DESC;
```

### 3. 持续优化工作流：从监控到优化

性能优化不是“一次性操作”，而是**持续循环**。结合`pg_stat_statements`和`pg_stat_monitor`，流程如下：

#### 3.1 步骤1：定位瓶颈SQL

用`pg_stat_statements`找**总执行时间最长**或**缓存命中率最低**的SQL；用`pg_stat_monitor`看**时间维度的性能变化**
（比如某条SQL的执行时间从10ms涨到100ms）。

#### 3.2 步骤2：分析执行计划

对瓶颈SQL运行`EXPLAIN ANALYZE`，看是否缺少索引、是否全表扫描：

```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE customer_id = 123;
```

**结果解读**：如果看到`Seq Scan on orders`（全表扫描），说明缺少`customer_id`的索引。

#### 3.3 步骤3：优化SQL或索引

比如给`orders`表的`customer_id`添加索引：

```sql
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
```

#### 3.4 步骤4：验证优化效果

优化后，用`pg_stat_statements`重新查询该SQL的`total_exec_time`和`shared_blks_read`，看是否下降；用`pg_stat_monitor`
看时间窗口内的执行时间是否恢复正常。

### 4. 最佳实践与注意事项

1. **定期重置统计信息**：比如每周重置一次（`SELECT pg_stat_statements_reset();`），避免旧数据干扰分析。
2. **设置合适的`pg_stat_statements.max`**：如果`dealloc`值很大（看`pg_stat_statements_info`），说明`max`
   太小，需要增大（比如从5000改到10000）。
3. **开启`track_planning`谨慎**：`track_planning`会跟踪计划时间，但会增加性能开销，仅在需要分析计划问题时开启。
4. **权限控制**：`pg_stat_statements`的`query`字段包含SQL文本，仅**超级用户**和`pg_read_all_stats`角色能看其他用户的SQL（避免敏感信息泄露）。

### 5. 课后Quiz

##### 问题1：如何用`pg_stat_statements`找出最耗时的前3条SQL？

**答案**：

```sql
SELECT query, calls, total_exec_time FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 3;
```

##### 问题2：`pg_stat_statements.track`设置为`all`会跟踪哪些语句？

**答案**：会跟踪**顶级语句**（如客户端直接执行的SQL）和**嵌套语句**（如函数或存储过程内的SQL）。

##### 问题3：如果`pg_stat_statements_info`中的`dealloc`值很大，说明什么？

**答案**：说明`pg_stat_statements.max`设置太小，导致很多SQL条目被丢弃，需要增大`max`值。

### 6. 常见报错与解决方法

##### 报错1：`ERROR: could not access file "pg_stat_statements": No such file or directory`

**原因**：没有安装`pg_stat_statements`扩展，或没有预加载模块。  
**解决**：

1. 安装扩展（如`apt install postgresql-17-pg-stat-statements`）。
2. 修改`shared_preload_libraries`为`pg_stat_statements`并重启数据库。

##### 报错2：`ERROR: permission denied for function pg_stat_statements_reset`

**原因**：当前用户没有执行`pg_stat_statements_reset`的权限。  
**解决**：

1. 切换到超级用户（如`postgres`）执行。
2. 给用户授予权限：`GRANT EXECUTE ON FUNCTION pg_stat_statements_reset() TO your_user;`

##### 报错3：`ERROR: pg_stat_statements must be loaded via shared_preload_libraries`

**原因**：没有在`postgresql.conf`中预加载`pg_stat_statements`。  
**解决**：修改`shared_preload_libraries`并重启数据库。

### 7. 参考链接

1. PostgreSQL官方文档：`pg_stat_statements`模块  
   https://www.postgresql.org/docs/17/pgstatstatements.html
2. Percona文档：`pg_stat_monitor`模块  
   https://docs.percona.com/pg-stat-monitor/
3. PostgreSQL配置参数：`compute_query_id`  
   https://www.postgresql.org/docs/17/runtime-config-statistics.html#GUC-COMPUTE-QUERY-ID

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[想抓PostgreSQL里的慢SQL？pg_stat_statements基础黑匣子和pg_stat_monitor时间窗，谁能帮你更准揪出性能小偷？](https://blog.cmdragon.cn/posts/b2213bfcb5b88a862f2138404c03d596/)


<details>
<summary>往期文章归档</summary>

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