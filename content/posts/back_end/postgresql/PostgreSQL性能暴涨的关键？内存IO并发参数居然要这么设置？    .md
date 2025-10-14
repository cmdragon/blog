---
url: /posts/69f99bc6972a860d559c74aad7280da4/
title: PostgreSQL性能暴涨的关键？内存IO并发参数居然要这么设置？
date: 2025-10-14T00:18:21+08:00
lastmod: 2025-10-14T00:18:21+08:00
author: cmdragon
cover: /images/d56e39d1af3e47e2994b0970d54794c7~tplv-5jbd59dj06-aigc.png

summary:
  PostgreSQL性能调优涉及内存、IO和并发参数的合理配置。内存调优中，`shared_buffers`建议设置为系统内存的25%，`work_mem`和`maintenance_work_mem`分别用于查询和维护操作的内存上限。IO调优通过背景写入器和异步IO参数减少磁盘访问延迟。并发调优则通过`max_worker_processes`和`max_parallel_workers_per_gather`提升并行处理能力。合理配置这些参数能显著提升数据库性能，减少磁盘IO和内存竞争。

categories:
  - postgresql

tags:
  - 基础入门
  - 内存调优
  - IO调优
  - 并发调优
  - 性能优化
  - 数据库配置
  - 参数调优

---

<img src="/images/d56e39d1af3e47e2994b0970d54794c7~tplv-5jbd59dj06-aigc.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 一、内存参数调优：合理分配内存资源

内存是PostgreSQL性能的核心资源之一，合理配置内存参数能大幅减少磁盘IO，提升查询速度。以下是关键内存参数的调优方法：

### 1.1 shared_buffers：共享内存缓冲区的核心

`shared_buffers`是PostgreSQL用于缓存数据页的**共享内存缓冲区**，所有连接共享这部分内存。它决定了PostgreSQL能在内存中保留多少热点数据，减少对磁盘的访问。

#### 配置建议：

- **专用数据库服务器（1GB内存以上）**：设置为系统内存的25%（官方推荐）。例如：
    - 8GB内存 → `shared_buffers = 2GB`
    - 16GB内存 → `shared_buffers = 4GB`
    - 32GB内存 → `shared_buffers = 8GB`
- **内存小于1GB的服务器**：设置为内存的10%-20%，避免占用过多操作系统内存。

#### 示例配置：

修改`postgresql.conf`文件（通常位于`/var/lib/postgresql/17/main/`或`/etc/postgresql/17/main/`）：

```ini
# postgresql.conf
shared_buffers = 4GB  # 16GB内存的25%
```

修改后需**重启PostgreSQL**使配置生效：

```bash
sudo systemctl restart postgresql-17
```

#### 原理说明：

PostgreSQL依赖操作系统缓存（OS Cache）和自身的`shared_buffers`共同缓存数据。若`shared_buffers`过大，会挤压OS
Cache的空间；过小则无法有效缓存热点数据。25%的比例是平衡两者的最优起点。

### 1.2 work_mem：查询操作的内存上限

`work_mem`是**单个查询操作**（如排序、哈希表、合并连接）能使用的最大内存。若操作超出此限制，PostgreSQL会将数据写入临时文件（磁盘），导致性能骤降。

#### 配置建议：

- 默认值为`4MB`，适用于简单查询。
- 对于需要大量排序/哈希的复杂查询（如`ORDER BY`、`DISTINCT`、`GROUP BY`），可适当调大（如`16MB`或`32MB`）。
- **注意并发风险**：若有10个并发查询，每个使用`16MB`，总内存消耗为`160MB`，需确保系统有足够剩余内存。

#### 示例配置：

```ini
# postgresql.conf
work_mem = 16MB  # 每个查询操作的内存上限
```

#### 实践场景：

假设你有一个查询需要对100万行数据排序，默认`4MB`内存可能不够，会生成临时文件。调大`work_mem`到`16MB`
后，排序可在内存中完成，查询时间从10秒缩短到2秒。

### 1.3 maintenance_work_mem：维护操作的内存保障

`maintenance_work_mem`是**维护操作**（如`VACUUM`、`CREATE INDEX`、`ALTER TABLE ADD FOREIGN KEY`
）的最大内存。这些操作对内存敏感，足够的内存能大幅提升效率。

#### 配置建议：

- 默认值为`64MB`，可根据维护任务的大小调大（如`256MB`或`512MB`）。
- 注意：`autovacuum`进程会使用`autovacuum_work_mem`（默认继承`maintenance_work_mem`），若开启自动清理，需避免设置过大导致内存竞争。

#### 示例配置：

```ini
# postgresql.conf
maintenance_work_mem = 256MB  # 加速CREATE INDEX和VACUUM
```

#### 实践场景：

创建一个包含1000万行数据的索引，默认`64MB`可能需要30分钟；调大到`256MB`后，时间缩短到10分钟。

### 1.4 temp_buffers：临时表的内存缓冲区

`temp_buffers`是**单个会话**用于临时表（`CREATE TEMP TABLE`）的最大内存。默认值为`8MB`，若需频繁使用大临时表，可适当调大。

#### 示例配置：

```ini
# postgresql.conf
temp_buffers = 32MB  # 增加临时表的内存缓冲区
```

## 二、IO参数调优：降低磁盘IO延迟

磁盘IO是PostgreSQL性能的常见瓶颈，通过调优IO参数可减少磁盘访问频率，提升响应速度。

### 2.1 背景写入器（Background Writer）：减少用户进程的IO等待

背景写入器是一个独立进程，负责将“脏页”（修改过但未写入磁盘的数据页）异步写入磁盘。合理配置其参数能减少用户查询的IO阻塞。

#### 关键参数：

- `bgwriter_delay`：背景写入器的循环间隔（默认`200ms`）。调小此值可增加写入频率，减少脏页积累。
- `bgwriter_lru_maxpages`：每次循环最多写入的脏页数（默认`100`）。调大此值可加快脏页清理。
- `bgwriter_lru_multiplier`：写入页数的乘数（默认`2.0`）。值越大，预留的干净页越多，减少用户进程的IO等待。

#### 示例配置（适用于高IO负载场景）：

```ini
# postgresql.conf
bgwriter_delay = 100ms         # 每100ms检查一次脏页
bgwriter_lru_maxpages = 200    # 每次最多写200个脏页
bgwriter_lru_multiplier = 3.0  # 预留更多干净页
```

### 2.2 effective_io_concurrency：异步IO的并发度

`effective_io_concurrency`控制PostgreSQL能同时发起的**异步IO请求数**，适用于支持异步IO的存储（如SSD、RAID）。

#### 配置建议：

- **机械硬盘（HDD）**：设为RAID组的磁盘数量（如4块盘的RAID 0→`4`）。
- **固态硬盘（SSD）**：设为较高值（如`200`-`500`），利用SSD的高并发特性。

#### 示例配置：

```ini
# postgresql.conf
effective_io_concurrency = 200  # SSD存储的最优值
```

### 2.3 temp_file_limit：限制临时文件大小

`temp_file_limit`是**单个进程**能使用的最大临时文件空间（默认`-1`，无限制）。若临时文件过大，会占满磁盘空间，导致查询失败。

#### 配置建议：

根据磁盘空间设置合理上限（如`1GB`或`10GB`）。

#### 示例配置：

```ini
# postgresql.conf
temp_file_limit = 1GB  # 限制临时文件最大1GB
```

## 三、并发参数调优：提升并行处理能力

PostgreSQL支持**并行查询**和**并行维护操作**，通过调优并发参数可充分利用多核CPU资源。

### 3.1 max_worker_processes：最大后台进程数

`max_worker_processes`是PostgreSQL能启动的**最大后台进程数**（包括并行查询worker、autovacuum进程等）。默认值为`8`
，若需更多并行任务，可适当调大。

#### 示例配置：

```ini
# postgresql.conf
max_worker_processes = 16  # 支持更多后台进程
```

### 3.2 max_parallel_workers_per_gather：查询的并行worker数

`max_parallel_workers_per_gather`是**单个查询**能启动的最大并行worker数（默认`2`
）。调大此值可增加查询的并行度，但需注意CPU和内存的消耗（每个worker会占用`work_mem`内存）。

#### 示例配置：

```ini
# postgresql.conf
max_parallel_workers_per_gather = 4  # 每个查询用4个worker并行处理
max_parallel_workers = 8             # 全局并行worker总数（不超过max_worker_processes）
```

#### 实践场景：

一个扫描1000万行的`SELECT`查询，默认`2`个worker需要10秒；调大到`4`个worker后，时间缩短到5秒。

### 3.3 max_parallel_maintenance_workers：维护操作的并行worker数

`max_parallel_maintenance_workers`是**维护操作**（如`CREATE INDEX`、`VACUUM`）能启动的最大并行worker数（默认`2`
）。调大此值可加速维护任务。

#### 示例配置：

```ini
# postgresql.conf
max_parallel_maintenance_workers = 4  # 并行创建索引
```

## 四、课后Quiz：巩固调优知识

### 问题1

对于一台32GB内存的专用PostgreSQL服务器，`shared_buffers`的推荐配置是多少？请说明理由。

### 问题2

当查询出现`ERROR: temporary file size exceeds temp_file_limit`时，可能的原因是什么？如何解决？

### 答案与解析

#### 问题1答案：

推荐配置为`8GB`（32GB的25%）。  
理由：官方文档建议**专用数据库服务器（1GB内存以上）**将`shared_buffers`设置为内存的25%，平衡PostgreSQL共享缓冲区与操作系统缓存的使用，避免资源浪费。

#### 问题2答案：

**原因**：查询的临时文件（如排序、哈希操作产生的临时文件）大小超过了`temp_file_limit`的限制。  
**解决办法**：

1. 调大`temp_file_limit`（如从`1GB`改为`2GB`）；
2. 优化查询：添加索引减少排序操作，或重写查询逻辑（如用`JOIN`代替子查询）；
3. 增加`work_mem`，让更多操作在内存中完成，减少临时文件的产生。

## 五、常见报错解决方案

### 报错1：`ERROR: out of memory`

**原因**：`work_mem`或`shared_buffers`设置过小，导致查询/共享内存不足；或并发数过高，总内存超过系统限制。  
**解决**：

- 调大`work_mem`（如从`4MB`改为`16MB`）；
- 调大`shared_buffers`（若内存充足）；
- 优化查询：减少结果集大小，或添加索引避免全表扫描；
- 限制并发数（如用`max_connections`控制连接数）。  
  **预防**：根据服务器内存和并发数合理设置`work_mem`和`shared_buffers`，避免过度分配。

### 报错2：`ERROR: temporary file size exceeds temp_file_limit`

**原因**：临时文件大小超过`temp_file_limit`的限制。  
**解决**：参考[课后Quiz问题2](#问题2)的解决办法。  
**预防**：根据查询需求设置合理的`temp_file_limit`，同时优化查询减少临时文件的产生。

### 报错3：`WARNING: bgwriter could not free enough memory`

**原因**：背景写入器无法释放足够的干净缓冲区，导致用户进程需要等待IO。  
**解决**：

- 调大`shared_buffers`，增加缓冲区数量；
- 减小`bgwriter_delay`（如从`200ms`改为`100ms`），增加背景写入频率；
- 增加`bgwriter_lru_maxpages`（如从`100`改为`200`），每次写入更多脏页。  
  **预防**：根据磁盘IO负载调整背景写入器参数，确保及时清理脏页。

## 参考链接

- shared_buffers：https://www.postgresql.org/docs/17/runtime-config-resource.html#GUC-SHARED-BUFFERS
- work_mem：https://www.postgresql.org/docs/17/runtime-config-resource.html#GUC-WORK-MEM
- 背景写入器参数：https://www.postgresql.org/docs/17/runtime-config-resource.html#GUC-BGWRITER-DELAY
- 并行查询参数：https://www.postgresql.org/docs/17/runtime-config-resource.html#GUC-MAX-WORKER-PROCESSES

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[PostgreSQL性能暴涨的关键？内存IO并发参数居然要这么设置？](https://blog.cmdragon.cn/posts/69f99bc6972a860d559c74aad7280da4/)



<details>
<summary>往期文章归档</summary>

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