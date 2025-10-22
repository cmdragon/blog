---
url: /posts/0b86f22d9b99fabd6a798d05d5561d7a/
title: PostgreSQL连接的那些弯弯绕：笛卡尔积、外连接和LATERAL你都理明白没？
date: 2025-10-22T09:24:06+08:00
lastmod: 2025-10-22T09:24:06+08:00
author: cmdragon
cover: /images/76dae7f9ab96430dada788ce415b2c25~tplv-5jbd59dj06-image.png

summary:
  PostgreSQL支持多种连接类型，包括交叉连接（CROSS JOIN）、内连接（INNER JOIN）和外连接（LEFT/RIGHT/FULL OUTER JOIN）。交叉连接生成笛卡尔积，内连接仅保留匹配行，外连接保留未匹配行并用NULL填充。USING和NATURAL JOIN可简化连接条件。连接顺序影响性能，建议优先连接小结果集的表。LATERAL子查询允许动态引用前面表的列。PostgreSQL根据表大小、索引和连接条件自动选择连接算法，如嵌套循环、哈希连接和排序合并连接。优化技巧包括避免不必要的外连接、提前过滤数据和避免笛卡尔积。

categories:
  - postgresql

tags:
  - 基础入门
  - 连接类型
  - 查询优化
  - 连接算法
  - SQL语法
  - 数据库性能
  - LATERAL子查询

---

<img src="/images/76dae7f9ab96430dada788ce415b2c25~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 一、PostgreSQL连接类型详解

连接是PostgreSQL中组合多个表数据的核心方式，不同的连接类型决定了数据的组合逻辑和结果集的内容。以下是PostgreSQL支持的主要连接类型及使用场景。

#### 1.1 交叉连接（CROSS JOIN）：笛卡尔积的直接实现

交叉连接会将两个表的所有行进行**笛卡尔积组合**
——左表的每一行与右表的每一行配对，结果集的行数是两表行数的乘积（如左表3行、右表3行，结果为9行）。  
**语法**：

```sql
SELECT * FROM t1 CROSS JOIN t2;
```

**示例**（基于文档中的`t1`和`t2`表）：  
`t1`有`num(1,2,3)`和`name(a,b,c)`，`t2`有`num(1,3,5)`和`value(xxx,yyy,zzz)`
，交叉连接结果会包含所有9种组合（如`1-a-1-xxx`、`1-a-3-yyy`等）。  
**注意**：交叉连接等价于`FROM t1, t2`（逗号分隔），但**优先级更高**——如果同时使用逗号和`JOIN`，`JOIN`
会先执行（比如`t1 CROSS JOIN t2 INNER JOIN t3`不等价于`t1, t2 INNER JOIN t3`）。

#### 1.2 内连接（INNER JOIN）：只保留匹配的行

内连接是最常用的连接类型，仅保留**满足连接条件**的行。连接条件通常是两表列的相等关系（如`t1.num = t2.num`）。  
**语法**：

```sql
SELECT * FROM t1 INNER JOIN t2 ON t1.num = t2.num;
```

**示例**：  
`t1`和`t2`的内连接结果仅包含`num`匹配的行（`1-a-1-xxx`、`3-c-3-yyy`），共2行。  
**等价写法**：`FROM t1, t2 WHERE t1.num = t2.num`（逗号+`WHERE`条件），但`JOIN`语法更清晰，推荐使用。

#### 1.3 外连接：保留未匹配的行

外连接用于**保留某一侧表的所有行**，即使另一侧没有匹配的数据（未匹配的列用`NULL`填充）。分为三种：

- **LEFT OUTER JOIN**：保留左表所有行，右表无匹配则填`NULL`；
- **RIGHT OUTER JOIN**：保留右表所有行，左表无匹配则填`NULL`；
- **FULL OUTER JOIN**：保留左右表所有行，无匹配则填`NULL`。

**示例（LEFT JOIN）**：

```sql
SELECT * FROM t1 LEFT JOIN t2 ON t1.num = t2.num;
```

结果包含`t1`的所有3行：`1-a-1-xxx`（匹配）、`2-b-NULL-NULL`（右表无匹配）、`3-c-3-yyy`（匹配）。

**示例（FULL JOIN）**：

```sql
SELECT * FROM t1 FULL JOIN t2 ON t1.num = t2.num;
```

结果包含左右表所有行：`1-a-1-xxx`、`2-b-NULL-NULL`、`3-c-3-yyy`、`NULL-NULL-5-zzz`（右表`num=5`无匹配）。

#### 1.4 USING与NATURAL JOIN：简化连接条件

当连接的两表有**相同列名**时，可使用`USING`或`NATURAL JOIN`简化语法：

- **USING**：指定共享列名，自动生成`ON t1.col = t2.col`的条件，并**合并重复列**（只保留一列）；
- **NATURAL JOIN**：自动匹配所有相同列名，等价于`USING`所有共同列。

**示例（USING）**：

```sql
SELECT * FROM t1 INNER JOIN t2 USING (num);
```

结果合并`num`列，输出`num, name, value`（而非`t1.num`和`t2.num`）。

**注意**：

- `USING`更安全（仅合并指定列），`NATURAL`风险高（若表新增相同列名，会意外合并）；
- `NATURAL JOIN`无共同列时，等价于`CROSS JOIN`（笛卡尔积）。

### 二、连接顺序的控制与优化

连接顺序决定了PostgreSQL如何组合表数据，直接影响查询性能（比如小表先连接可减少后续处理的数据量）。

#### 2.1 连接的嵌套与顺序规则

PostgreSQL中，`JOIN`的顺序默认**左到右嵌套**（如`A JOIN B JOIN C`等价于`(A JOIN B) JOIN C`）。可通过**括号**
控制顺序（如`A JOIN (B JOIN C)`）。

**优化原则**：

- 优先连接**小结果集的表**（比如过滤后的表），减少后续连接的数据量；
- 避免不必要的笛卡尔积（比如先连接有过滤条件的表，再连接大表）。

#### 2.2 LATERAL子查询：动态连接的利器

`LATERAL`关键字允许**子查询引用前面表的列**，实现“动态连接”——后面的子查询可根据前面表的行动态生成结果。

**示例**：  
假设`polygons`表存储多边形，`vertices(poly)`函数返回多边形的顶点集合。要找顶点距离小于10的多边形对：

```sql
SELECT p1.id, p2.id, v1, v2
FROM polygons p1, polygons p2,
     LATERAL vertices(p1.poly) v1,  -- 引用p1的poly列
     LATERAL vertices(p2.poly) v2   -- 引用p2的poly列
WHERE (v1 <-> v2) < 10 AND p1.id != p2.id;
```

`LATERAL`让`vertices`函数能根据每个多边形的`poly`动态生成顶点，再计算距离。若无`LATERAL`，子查询无法引用前面的`p1`或`p2`
列（会报错“cannot use column reference without LATERAL”）。

### 三、连接算法的选择与优化

PostgreSQL会根据**表大小、索引、连接条件**自动选择连接算法，常见的有三种：

#### 3.1 嵌套循环连接（Nested Loop Join）

- **原理**：遍历左表的每一行，逐一查找右表中匹配的行（类似“嵌套循环”）；
- **适用场景**：左表很小（如100行），右表连接列有索引（快速查找）；
- **优点**：内存消耗小，适合小数据量；
- **示例**：小表`A`（100行）连接大表`B`（100万行），`A.id`有索引——遍历`A`的每一行，用`A.id`查`B`的索引，仅需100次查找，速度快。

#### 3.2 哈希连接（Hash Join）

- **原理**：先将小表的连接列生成**哈希表**（内存中），再遍历大表的每一行，用哈希表快速匹配；
- **适用场景**：两表都较大（如100万行），连接条件是**等值连接**（`=`）；
- **优点**：处理大表效率高，哈希查找是`O(1)`；
- **注意**：哈希表需放入内存，若表太大超过内存，会写临时文件（性能下降）。

#### 3.3 排序合并连接（Merge Join）

- **原理**：先将两表的连接列**排序**，再合并两个有序集（类似“归并排序”）；
- **适用场景**：连接列已排序（如主键、有索引），或需要**非等值连接**（如`>`、`<`）；
- **优点**：无内存限制，适合超大型表；
- **示例**：`A.id`和`B.a_id`都是主键（已排序），连接时无需额外排序，直接合并，效率高。

#### 3.4 如何让PostgreSQL选择最优算法

- **给连接列建索引**：嵌套循环和排序合并连接依赖索引；
- **避免非等值连接**：哈希连接仅支持等值连接，非等值连接只能用嵌套循环或排序合并；
- **分析表统计信息**：用`ANALYZE`更新表的统计信息（如行数、列值分布），帮助PostgreSQL选择正确的算法。

### 四、连接查询的实战优化技巧

1. **避免不必要的外连接**：如果不需要保留未匹配的行，用`INNER JOIN`代替`LEFT JOIN`（结果集更小，处理更快）；
2. **用表别名简化语法**：如`FROM t1 AS a JOIN t2 AS b ON a.id = b.a_id`，避免列歧义（如“ambiguous column”错误）；
3. **过滤条件提前**：在`WHERE`或`JOIN ON`中提前过滤数据（如`WHERE t2.value = 'xxx'`），减少连接的数据量；
4. **避免笛卡尔积**：确保连接条件完整（如`ON a.id = b.a_id`），否则会生成大量无用行（如`CROSS JOIN`的笛卡尔积）。

### 五、课后Quiz

1. **问题**：`LEFT JOIN`和`INNER JOIN`的核心区别是什么？如何选择？  
   **答案**：`LEFT JOIN`保留左表所有行，`INNER JOIN`仅保留匹配行。若需要左表的所有数据（即使右表无匹配），用`LEFT JOIN`
   ；否则用`INNER JOIN`（性能更好）。

2. **问题**：`LATERAL`子查询的作用是什么？举一个实际场景的例子。  
   **答案**：允许子查询引用前面表的列，实现动态连接。比如查询每个多边形的顶点，并计算顶点间的距离（如文档中的`polygons`
   和`vertices`函数例子）。

3. **问题**：PostgreSQL在什么情况下会选择哈希连接？  
   **答案**：当两表都较大，且连接条件是等值连接（`=`）时，哈希连接效率最高。

### 六、常见报错与解决方案

#### 1. ERROR: column reference "num" is ambiguous

- **原因**：连接的表（如`t1`和`t2`）有相同列名`num`，查询中未指明属于哪个表；
- **解决**：用表别名或列限定符，如`t1.num`或`t2.num`；
- **预防**：始终为连接的表指定别名（如`FROM t1 AS a JOIN t2 AS b`），并使用别名限定列。

#### 2. ERROR: cannot use column reference in FROM clause without LATERAL

- **原因**：子查询中引用了前面表的列（如`p1.poly`），但没加`LATERAL`关键字；
- **解决**：在子查询前加`LATERAL`，如`LATERAL vertices(p1.poly)`；
- **预防**：当子查询需要引用前面表的列时，记得加`LATERAL`。

#### 3. ERROR: syntax error at or near "JOIN"

- **原因**：`FROM` clause语法错误，如逗号和`JOIN`混用的顺序错误（如`FROM t1, t2 JOIN t3`）；
- **解决**：调整顺序或用括号明确优先级，如`FROM (t1, t2) JOIN t3`或`FROM t1 JOIN t2 JOIN t3`；
- **预防**：尽量用`JOIN`语法代替逗号分隔表，避免歧义。

参考链接：https://www.postgresql.org/docs/17/queries-table-expressions.html#QUERIES-JOIN

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[PostgreSQL连接的那些弯弯绕：笛卡尔积、外连接和LATERAL你都理明白没？](https://blog.cmdragon.cn/posts/0b86f22d9b99fabd6a798d05d5561d7a/)



<details>
<summary>往期文章归档</summary>

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
- [为什么你的FastAPI测试覆盖率总是低得让人想哭？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/985c18ca802f1b6da828b92e082b4d4e/)

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