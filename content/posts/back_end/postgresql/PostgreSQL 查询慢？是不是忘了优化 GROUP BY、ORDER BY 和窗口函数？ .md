---
url: /posts/c856e3cb073822349f3bf2d29995dcfc/
title: PostgreSQL 查询慢？是不是忘了优化 GROUP BY、ORDER BY 和窗口函数？
date: 2025-10-12T07:13:23+08:00
lastmod: 2025-10-12T07:13:23+08:00
author: cmdragon
cover: /images/849998198ab34b5d8e5f1e8d6009a78b~tplv-5jbd59dj06-aigc.png

summary:
  GROUP BY用于分组聚合，将相同值的行归为一组并计算聚合函数。PostgreSQL支持功能依赖优化，若`GROUP BY`列为主键或唯一约束，其他依赖列无需加入`GROUP BY`。`GROUPING SETS`、`CUBE`、`ROLLUP`可一次性生成多组聚合，提升效率。`HAVING`用于过滤分组结果，`WHERE`过滤原始行。`ORDER BY`性能依赖索引，Top-N查询可使用Top-N Heapsort优化。窗口函数在`GROUP BY`后执行，`PARTITION BY`和`ORDER BY`的索引可提升性能。`work_mem`控制排序内存，超出则触发外部排序。

categories:
  - postgresql

tags:
  - 基础入门
  - GROUP BY
  - 优化策略
  - 窗口函数
  - ORDER BY
  - 功能依赖
  - 聚合查询

---

<img src="/images/849998198ab34b5d8e5f1e8d6009a78b~tplv-5jbd59dj06-aigc.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### GROUP BY的原理与优化

#### GROUP BY的基本概念

`GROUP BY`是PostgreSQL中用于**分组聚合**
的核心子句，它将表中具有相同值的行归为一组，然后对每组计算聚合函数（如`sum`、`avg`、`count`
）。例如，我们有一张记录商品销售的`test1`表：

```sql
CREATE TABLE test1 (x TEXT, y INT);
INSERT INTO test1 VALUES ('a', 3), ('c', 2), ('b', 5), ('a', 1);
```

若要计算每个`x`对应的`y`之和，可使用：

```sql
SELECT x, sum(y) FROM test1 GROUP BY x;
```

结果会按`x`分组，返回每组的求和结果：

```
 x | sum
---+-----
 a |   4
 b |   5
 c |   2
```

**关键规则**：`SELECT`列表中的列要么在`GROUP BY`中（分组键），要么被聚合函数包裹（否则会因“非分组列无法确定唯一值”报错）。

#### 功能依赖与GROUP BY简化

PostgreSQL支持**功能依赖（Functional Dependency）**优化：若`GROUP BY`的列是表的**主键或唯一约束**
，则其他依赖于该列的列（即主键能唯一确定的列）无需加入`GROUP BY`。例如，`products`表的`product_id`是主键，`name`和`price`
依赖于`product_id`：

```sql
CREATE TABLE products (
    product_id INT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL
);
CREATE TABLE sales (
    sale_id INT PRIMARY KEY,
    product_id INT REFERENCES products(product_id),
    units INT NOT NULL,
    sale_date DATE NOT NULL
);
```

查询每个产品的总销售额时，无需将`name`和`price`加入`GROUP BY`：

```sql
SELECT 
    p.product_id, 
    p.name,  -- 依赖于product_id，无需GROUP BY
    sum(s.units * p.price) AS total_sales
FROM products p
LEFT JOIN sales s ON p.product_id = s.product_id
GROUP BY p.product_id;  -- 仅需分组主键
```

这一优化**减少了分组的复杂度**，因为PostgreSQL知道主键能唯一确定其他列的值，无需额外分组检查。

#### GROUPING SETS、CUBE与ROLLUP的高效聚合

当需要生成**多个分组的聚合结果**
时（如同时按“品牌”“尺寸”“总合计”分组），多次查询会重复扫描数据，而`GROUPING SETS`、`CUBE`、`ROLLUP`能**一次性生成多组聚合**
，大幅提升效率。

以`items_sold`表为例：

```sql
CREATE TABLE items_sold (brand TEXT, size TEXT, sales INT);
INSERT INTO items_sold VALUES 
('Foo', 'L', 10), ('Foo', 'M', 20), ('Bar', 'M', 15), ('Bar', 'L', 5);
```

若要同时按`brand`、`size`和“总合计”分组，使用`GROUPING SETS`：

```sql
SELECT brand, size, sum(sales) 
FROM items_sold 
GROUP BY GROUPING SETS ((brand), (size), ());  -- 三组分组
```

结果会返回三组聚合：

```
 brand | size | sum
-------+------+-----
 Foo   |      |  30  -- 按brand分组
 Bar   |      |  20
       | L    |  15  -- 按size分组
       | M    |  35
       |      |  50  -- 总合计（空分组）
```

- `CUBE(a, b)`：生成`a`、`b`、`a+b`、空分组的所有组合（即“立方体”聚合）；
- `ROLLUP(a, b)`：生成`a+b`、`a`、空分组的层级聚合（如“省份+城市”“省份”“全国”）。

这些扩展避免了多次全表扫描，是处理**多维度分析**的高效工具。

#### HAVING与WHERE的区别

`HAVING`用于**过滤分组后的结果**，而`WHERE`用于过滤原始行。例如：

```sql
-- 过滤“sum(y) > 3”的分组
SELECT x, sum(y) FROM test1 GROUP BY x HAVING sum(y) > 3;

-- 过滤“x < 'c'”的原始行，再分组
SELECT x, sum(y) FROM test1 WHERE x < 'c' GROUP BY x;
```

**注意**：`HAVING`可以使用聚合函数，`WHERE`不能（`WHERE`过滤的是未分组的行，聚合函数尚未计算）。

### ORDER BY的优化策略

#### 索引与排序的关系

`ORDER BY`的性能核心是**是否能利用索引避免排序**。PostgreSQL的索引是有序的（如B-tree索引），若`ORDER BY`
的列顺序与索引完全一致（包括ASC/DESC），则可直接通过索引获取有序数据，跳过`Sort`操作。

例如，`orders`表的`order_date`列有索引：

```sql
CREATE INDEX idx_orders_order_date ON orders(order_date DESC);
```

查询最新订单时，执行计划会使用`Index Scan`而非`Seq Scan + Sort`：

```sql
SELECT * FROM orders ORDER BY order_date DESC LIMIT 10;
```

**执行计划示例**：

```
Limit  (cost=0.29..1.04 rows=10 width=44)
  ->  Index Scan using idx_orders_order_date on orders  (cost=0.29..74.29 rows=1000 width=44)
```

若`ORDER BY`的列没有索引，PostgreSQL会进行**内存排序（in-memory sort）**，若数据量超过`work_mem`（默认4MB），则会写入临时文件（*
*外部排序**），性能骤降。

#### Top-N查询的优化

Top-N查询（如“取最新10条数据”）是`ORDER BY`的常见场景，PostgreSQL会使用**Top-N Heapsort**
优化：只需维护一个大小为N的堆（如10），遍历数据时不断替换堆中最小的元素，无需排序整个结果集。

例如，查询销量最高的5个产品：

```sql
SELECT product_id, sum(units) AS total_units
FROM sales
GROUP BY product_id
ORDER BY total_units DESC
LIMIT 5;
```

若`sum(units)`无法用索引，Top-N Heapsort仍比全排序高效——因为堆的大小远小于总数据量。

#### 内存与外部排序

`work_mem`参数控制PostgreSQL用于排序、哈希等操作的内存上限。若排序数据量超过`work_mem`，会触发**外部排序**
（将数据分成多个块，每个块内存排序后写入临时文件，最后合并块），性能下降明显。

**优化方法**：

1. **临时调整`work_mem`**（会话级别，不影响全局）：
   ```sql
   SET work_mem = '64MB';  -- 将排序内存提升至64MB
   ```
2. **创建合适的索引**：避免排序（推荐）。
3. **减少排序数据量**：使用`WHERE`过滤不必要的行，或`LIMIT`限制结果数。

### 窗口函数OVER()的效率提升

#### 窗口函数的执行时机

窗口函数（如`row_number()`、`sum() OVER()`）用于计算**每行的“窗口内”聚合**（如累计销售额、排名），其执行顺序在`GROUP BY`
之后、`SELECT`之前：

```
FROM → WHERE → GROUP BY → HAVING → 窗口函数 → SELECT → ORDER BY
```

例如，计算每个产品的累计销售额：

```sql
SELECT 
    s.product_id,
    s.sale_date,
    s.units * p.price AS daily_sales,
    sum(s.units * p.price) OVER (
        PARTITION BY s.product_id  -- 按产品分区
        ORDER BY s.sale_date       -- 按日期排序
    ) AS running_total
FROM sales s
JOIN products p ON s.product_id = p.product_id;
```

`PARTITION BY`将数据分成多个“窗口”（如每个产品一组），`ORDER BY`定义窗口内的行顺序，`sum() OVER()`计算窗口内的累计和。

#### 窗口定义的索引优化

窗口函数的性能取决于**窗口内数据的有序性**。若`PARTITION BY`和`ORDER BY`
的列有复合索引，PostgreSQL可快速分区并排序，避免额外的`Sort`操作。

例如，为`sales`表创建`product_id + sale_date`的复合索引：

```sql
CREATE INDEX idx_sales_product_date ON sales(product_id, sale_date);
```

上述累计销售额查询的执行计划会跳过排序，直接使用索引获取有序数据：

```
WindowAgg  (cost=0.56..1.71 rows=100 width=56)
  ->  Index Scan using idx_sales_product_date on sales s  (cost=0.29..1.21 rows=100 width=28)
        Join Filter: (s.product_id = p.product_id)
```

#### 窗口复用与合并

若多个窗口函数使用**完全相同的`PARTITION BY`和`ORDER BY`**，可通过`WINDOW`子句定义窗口并复用，减少重复计算。

例如，同时计算累计销售额和排名：

```sql
SELECT 
    product_id,
    sale_date,
    daily_sales,
    sum(daily_sales) OVER w AS running_total,  -- 复用窗口w
    row_number() OVER w AS rank               -- 复用窗口w
FROM (
    SELECT 
        s.product_id,
        s.sale_date,
        s.units * p.price AS daily_sales
    FROM sales s
    JOIN products p ON s.product_id = p.product_id
) AS subquery
WINDOW w AS (PARTITION BY product_id ORDER BY sale_date);  -- 定义窗口w
```

`WINDOW`子句将窗口逻辑集中定义，PostgreSQL只需计算一次窗口，提升效率。

#### Frame Clause的选择

窗口函数的`Frame Clause`（如`ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`）定义窗口内的行范围，不同类型的Frame性能差异显著：

- **ROWS Frame**：基于行位置（如“前所有行到当前行”），计算最快（直接按顺序累加）。
- **RANGE Frame**：基于值范围（如“所有sale_date ≤ 当前行的行”），需比较值，性能较慢。

例如，累计销售额应使用`ROWS Frame`（默认即`ROWS UNBOUNDED PRECEDING`）：

```sql
sum(daily_sales) OVER (PARTITION BY product_id ORDER BY sale_date)  -- 默认ROWS
```

若需按值范围计算（如“最近7天的销售额”），则需使用`RANGE Frame`，但需注意性能：

```sql
sum(daily_sales) OVER (
    PARTITION BY product_id 
    ORDER BY sale_date 
    RANGE BETWEEN INTERVAL '7 days' PRECEDING AND CURRENT ROW
)
```

### 课后Quiz

#### 问题1：为什么GROUP BY主键列时，不需要将其他依赖列加入GROUP BY子句？

**答案**：因为主键列具有**功能依赖性**——主键的值唯一确定了其他列的值（如`product_id`确定`name`和`price`
）。PostgreSQL支持这一优化，允许`SELECT`列表中包含依赖列，无需将它们加入`GROUP BY`，减少分组的复杂度和计算量。

#### 问题2：如何优化包含ORDER BY和LIMIT的Top-N查询？

**答案**：

1. **创建匹配的索引**：使`ORDER BY`的列顺序与索引完全一致（包括ASC/DESC），直接通过索引获取有序数据。
2. **利用Top-N Heapsort**：LIMIT的行数越小，HeapSort的优势越明显（无需排序全表）。
3. **避免表达式排序**：若`ORDER BY`使用表达式（如`LOWER(name)`
   ），需为表达式创建索引（如`CREATE INDEX idx_name_lower ON users(LOWER(name))`）。

#### 问题3：窗口函数的PARTITION BY和ORDER BY如何影响性能？

**答案**：

- `PARTITION BY`的列若有索引，可快速将数据分成不同窗口，避免额外的分组操作。
- `ORDER BY`的列若有索引，可直接获取窗口内的有序数据，跳过`Sort`操作。
- 复合索引（`PARTITION BY列 + ORDER BY列`）能最大化窗口函数的性能，因为无需任何额外排序或分组。

### 常见报错解决方案

#### 报错1：`ERROR: column "table.column" must appear in the GROUP BY clause or be used in an aggregate function`

**原因**：`SELECT`列表中的列既不在`GROUP BY`中，也未被聚合函数包裹（违反分组规则）。  
**解决方法**：

1. 将列加入`GROUP BY`（如`GROUP BY x, y`）。
2. 对列使用聚合函数（如`sum(y)`）。
3. 利用功能依赖（若列依赖于`GROUP BY`的主键，无需加入）。  
   **预防建议**：分组时尽量只包含必要的列，优先使用主键作为分组键。

#### 报错2：`ERROR: window function requires an OVER clause`

**原因**：使用了窗口函数（如`row_number()`）但未指定`OVER`子句（窗口函数必须通过`OVER`定义窗口）。  
**解决方法**：为窗口函数添加`OVER`子句，指定`PARTITION BY`和`ORDER BY`
（如`row_number() OVER (PARTITION BY product_id ORDER BY sale_date)`）。  
**预防建议**：编写窗口函数时，确保每个函数都有对应的`OVER`子句。

#### 报错3：`ERROR: could not sort because work_mem exceeded`

**原因**：排序数据量超过`work_mem`，触发外部排序（写入临时文件）。  
**解决方法**：

1. **临时调整`work_mem`**：`SET work_mem = '64MB'`（会话级别，不影响全局）。
2. **创建索引**：避免排序（优先选择）。
3. **减少排序数据量**：使用`WHERE`过滤或`LIMIT`限制结果数。  
   **预防建议**：根据查询需求合理调整`work_mem`，避免不必要的排序。

### 参考链接

参考链接：https://www.postgresql.org/docs/17/queries-table-expressions.html#QUERIES-GROUPBY  
参考链接：https://www.postgresql.org/docs/17/queries-table-expressions.html#QUERIES-WINDOW  
参考链接：https://www.postgresql.org/docs/17/indexes-ordering.html  
参考链接：https://www.postgresql.org/docs/17/sql-select.html#SQL-ORDERBY  
参考链接：https://www.postgresql.org/docs/17/runtime-config-resource.html#GUC-WORK-MEM

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[PostgreSQL 查询慢？是不是忘了优化 GROUP BY、ORDER BY 和窗口函数？
](https://blog.cmdragon.cn/posts/c856e3cb073822349f3bf2d29995dcfc/)




<details>
<summary>往期文章归档</summary>

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
- [任务分片执行模式如何让你的FastAPI性能飙升？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c6a598639f6a831e9e82e171b8d71857/)

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