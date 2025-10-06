---
url: /posts/d527f8ebb6e3dae2c7dfe4c8d8979444/
title: PostgreSQL处理SQL居然像做蛋糕？解析到执行的4步里藏着多少查询优化的小心机？
date: 2025-10-06T02:30:02+08:00
lastmod: 2025-10-06T02:30:02+08:00
author: cmdragon
cover: /images/7908ea0678714e43833653cbfdef40a0~tplv-5jbd59dj06-image.png

summary:
  PostgreSQL处理SQL查询的过程分为解析、重写、规划和执行四个阶段。解析阶段将SQL字符串转换为解析树，重写阶段处理视图和规则，规划阶段选择最优执行计划，执行阶段按计划执行查询。代价模型通过计算IO和CPU成本来优化查询，统计信息影响成本计算的准确性。使用索引、选择合适的连接方式和提前过滤数据是优化查询的关键。定期更新统计信息和合理使用索引可避免性能下降。

categories:
  - postgresql

tags:
  - 基础入门
  - 查询执行生命周期
  - 查询优化
  - 代价模型
  - 统计信息
  - 索引
  - 连接方式

---

<img src="/images/7908ea0678714e43833653cbfdef40a0~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 一、PostgreSQL查询执行的生命周期

PostgreSQL处理一条SQL查询的过程，就像**做蛋糕的完整流程**
：先看懂配方（解析）、调整配方（重写）、选择最快的制作方法（规划）、实际动手做（执行）。每个步骤环环相扣，任何一步出错都会影响最终结果。

### 1.1 解析阶段：从SQL字符串到“可理解的步骤”

当你输入一条SQL（比如`SELECT * FROM users WHERE age > 30;`），PostgreSQL首先要**“看懂”这句话**——这就是解析阶段的任务。

- **词法分析**：把SQL字符串拆成一个个“关键词”（比如`SELECT`、`FROM`、`WHERE`）和“值”（比如`users`、`age`、`30`
  ），就像把“鸡蛋+面粉+糖”拆成单独的食材。
- **语法分析**：检查这些关键词的顺序是否符合SQL语法规则（比如`SELECT`后面必须跟列或`*`，`FROM`后面必须跟表名），生成*
  *解析树（Parse Tree）**——类似把“先打鸡蛋，再混合面粉”写成树状步骤。

如果语法错误（比如把`FROM`写成`FORM`），PostgreSQL会立刻报错：`ERROR: syntax error at or near "FORM"`。

### 1.2 重写阶段：处理“隐藏的规则”

解析后的SQL可能包含**视图（View）**或**规则（Rule）**，重写阶段会把这些“隐藏的逻辑”展开成原始SQL。  
比如你创建了一个视图：

```sql
CREATE VIEW adult_users AS SELECT * FROM users WHERE age >= 18;
```  

当你查询`SELECT * FROM adult_users WHERE age > 30;`时，重写阶段会把视图替换成原始条件，变成：

```sql
SELECT * FROM users WHERE age >= 18 AND age > 30;
```  

这就像recipe里写“用准备好的蛋糕糊”，重写阶段会把它替换成“鸡蛋+面粉+糖混合后的糊”——让规划器能看到完整的逻辑。

### 1.3 规划阶段：选择“最快的执行方法”

规划阶段是查询优化的**核心**。PostgreSQL的**查询规划器（Planner）**会生成**多个可能的执行计划**，然后计算每个计划的*
*成本（Cost）**，选择成本最低的那个。

比如查询`SELECT * FROM users WHERE age > 30;`，可能的计划有两种：

1. **全表扫描（Seq Scan）**：逐行读取整个`users`表，过滤出`age > 30`的行。
2. **索引扫描（Index Scan）**：如果`age`列有索引，先通过索引找到`age > 30`的行的位置，再去表中读取对应的数据。

规划器会计算这两个计划的成本（比如全表扫描成本是100，索引扫描是20），然后选成本低的索引扫描。

### 1.4 执行阶段：按计划“动手做事”

执行阶段由**执行器（Executor）**负责，它会严格按照规划器选好的计划运行，就像按recipe步骤烤蛋糕：

- 如果是索引扫描，执行器会先读索引文件，找到符合条件的行的`id`，再去表文件中读取完整的行数据。
- 如果是全表扫描，执行器会逐行读取表文件，过滤出符合条件的行。

执行器还会处理**并发控制**（比如锁）和**结果返回**（把数据传给客户端）。

## 二、代价模型：PostgreSQL选计划的“计算器”

PostgreSQL为什么选索引扫描而不是全表扫描？因为它有一套**成本计算规则**——代价模型（Cost Model）。成本越低，计划越好。

### 2.1 成本的两大组成：IO vs CPU

PostgreSQL的成本分为两类：

1. **IO成本**：从磁盘读取数据的时间（比如读一个数据页需要1个单位成本）。
2. **CPU成本**：处理数据的时间（比如计算一行的条件需要0.01个单位成本）。

比如全表扫描的成本公式：

```
全表扫描成本 = （表的总数据页数 × 1） + （表的总行数 × 0.01）
```  

索引扫描的成本公式：

```
索引扫描成本 = （索引的总数据页数 × 1） + （索引的总行数 × 0.01） + （符合条件的行数 × 1）
```  

（最后一项是“回表读”的IO成本——从索引找到行位置后，再去表中读数据。）

### 2.2 统计信息：成本计算的“情报源”

代价模型的准确性，完全依赖**统计信息（Statistics）**——就像做蛋糕前要知道“冰箱里有多少鸡蛋”。  
PostgreSQL把统计信息存在`pg_statistic`表中，包含：

- 列的**distinct值数量**（比如`age`列有多少不同的年龄）；
- 列的**最频值（Most Common Values, MCV）**（比如`age`列最常见的年龄是25）；
- 列的**直方图**（比如`age`在18-30之间的行占比多少）。

如果统计信息**过时**（比如表新增了10万行但没更新统计信息），规划器会算错成本。比如：

- 实际`users`表有100万行，但统计信息显示只有1万行；
- 规划器会认为全表扫描成本是100（1万行×0.01 + 1万页×1），但实际成本是10000（100万行×0.01 + 100万页×1）；
- 这时候规划器会错误地选择全表扫描，导致查询变慢。

### 2.3 如何看成本？用`EXPLAIN ANALYZE`

想知道规划器选了什么计划、成本是多少，用`EXPLAIN ANALYZE`命令。比如：

```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE age > 30;
```  

输出结果（简化版）：

```
Index Scan using idx_users_age on users  (cost=0.29..8.30 rows=4000 width=58) (actual time=0.015..0.600 rows=4000 loops=1)
  Index Cond: (age > 30)
Planning Time: 0.120 ms
Execution Time: 0.800 ms
```  

- `cost=0.29..8.30`：计划的**预估成本**（0.29是启动成本，8.30是总执行成本）；
- `actual time=0.015..0.600`：**实际执行时间**（毫秒）；
- `rows=4000`：**预估返回行数**（实际返回4000行）。

## 三、优化的核心理念：用“最小代价”拿结果

查询优化的本质，就是**让规划器选成本最低的计划**。核心思路有三个：

### 3.1 减少数据扫描量：用索引“精准定位”

索引的作用就像**书的目录**——找第100页不用翻完整本书，直接看目录。PostgreSQL支持多种索引（B-tree、GiST、GIN等），其中最常用的是*
*B-tree索引**（适合范围查询和等值查询）。

比如在`users`表的`age`列建索引：

```sql
CREATE INDEX idx_users_age ON users (age);
```  

查询`age > 30`时，规划器会选索引扫描，扫描的行数从100万变成40万，成本大幅降低。

**注意**：索引不是越多越好！每个索引会增加写操作的成本（比如插入行时要更新索引）。只给**常用查询的条件列**建索引。

### 3.2 选对连接方式：Nested Loop vs Hash Join vs Merge Join

当查询涉及多个表连接（比如`SELECT * FROM users JOIN orders ON users.id = orders.user_id;`），规划器会选三种连接方式之一：

1. **嵌套循环连接（Nested Loop）**：适合**小表连大表**（比如`users`是小表，`orders`
   是大表）。逻辑是：先遍历小表的每一行，再去大表中找对应的行（类似“先拿一个用户，再找他的所有订单”）。
2. **哈希连接（Hash Join）**：适合**两个大表连接**。逻辑是：先把小表的数据做成哈希表（比如把`users.id`
   做成key），再遍历大表的每一行，用哈希表快速找对应的行（类似“先把用户做成字典，再快速查订单对应的用户”）。
3. **合并连接（Merge Join）**：适合**两个已排序的表**。逻辑是：把两个表按连接键排序，然后一一对应（类似“把用户和订单都按id排序，然后依次配对”）。

比如`users`有1万行，`orders`有100万行，规划器会选**嵌套循环连接**——因为小表遍历快，大表用索引找行也快。

### 3.3 避免不必要的计算：Early Pruning与Predicate Pushdown

PostgreSQL会尽可能**早地过滤数据**，减少后续计算量：

- **Early Pruning**：在扫描表时，提前跳过不符合条件的分区（比如按年份分区的表，查询2023年的数据，直接跳过2022年的分区）。
- **Predicate Pushdown**：把过滤条件“推”到数据源（比如查询视图时，把`age > 30`推到视图的原始表中，而不是先查视图再过滤）。

比如查询`SELECT * FROM adult_users WHERE age > 30;`，重写阶段会把`age > 30`合并到视图的`age >= 18`条件中，变成`age > 30`
——减少扫描的行数。

## 四、课后Quiz：巩固你的理解

### 问题1：为什么统计信息过时会导致查询性能下降？

**答案解析**：  
PostgreSQL的规划器依赖统计信息计算成本。如果统计信息过时（比如表行数从1万变成100万，但统计信息没更新），规划器会算错成本——比如误以为全表扫描的成本是100，但实际是10000。这会导致规划器选择
**成本更低但实际更慢的计划**（比如全表扫描而不是索引扫描），最终查询变慢。

解决办法：定期运行`ANALYZE`命令更新统计信息（比如`ANALYZE users;`）。

### 问题2：索引越多越好吗？为什么？

**答案解析**：  
不是。索引会增加**写操作的成本**——比如插入一行数据时，不仅要写表文件，还要更新所有相关的索引文件。如果一个表有10个索引，插入一行的时间会比没有索引时慢10倍。

建议：只给**常用查询的条件列**建索引（比如`users`表的`age`列如果经常被用来过滤，就建索引）。

## 五、常见报错解决方案

### 报错1：`ERROR: relation "users" does not exist`

**原因**：

1. 表名拼写错误（比如写成`user`而不是`users`）；
2. 表不在当前schema中（比如表在`app` schema下，但当前schema是`public`）；
3. 表没有被创建。

**解决办法**：

- 用`\dt`命令查看当前数据库中的表（psql中）；
- 用schema限定表名（比如`app.users`）；
- 如果表没创建，执行`CREATE TABLE`语句。

**预防建议**：使用显式的schema名（比如`app.users`），避免依赖`search_path`（搜索路径）。

### 报错2：`ERROR: syntax error at or near "SELECT"`

**原因**：  
SQL语句有语法错误（比如两个`SELECT`之间没有分号或`UNION`）。例如：

```sql
SELECT id FROM users WHERE age > 30 SELECT name FROM orders;
```  

**解决办法**：

- 检查SQL语句的语法，确保每个语句正确结束（用分号）；
- 用pgAdmin的“语法检查”功能（点击“检查语法”按钮）。

**预防建议**：写SQL时逐步测试（比如先写`SELECT id FROM users;`，再添加`WHERE`条件），避免一次性写复杂语句。

## 参考链接

- 代价模型与规划器：https://www.postgresql.org/docs/17/planner-optimizer.html
- 统计信息：https://www.postgresql.org/docs/17/planner-stats.html
- `EXPLAIN`的使用：https://www.postgresql.org/docs/17/using-explain.html
- 常见错误代码：https://www.postgresql.org/docs/17/errcodes-appendix.html

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[PostgreSQL处理SQL居然像做蛋糕？解析到执行的4步里藏着多少查询优化的小心机？](https://blog.cmdragon.cn/posts/d527f8ebb6e3dae2c7dfe4c8d8979444/)



<details>
<summary>往期文章归档</summary>

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
- [如何让FastAPI与消息队列的联姻既甜蜜又可靠？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/1bebb53f4d9d6fbd0ecbba97562c07b0/)

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