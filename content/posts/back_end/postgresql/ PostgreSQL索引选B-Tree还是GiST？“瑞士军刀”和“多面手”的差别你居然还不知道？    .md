---
url: /posts/d498f63cd0a2d5a77e445c688a8b88db/
title: PostgreSQL索引选B-Tree还是GiST？“瑞士军刀”和“多面手”的差别你居然还不知道？
date: 2025-10-08T01:54:08+08:00
lastmod: 2025-10-08T01:54:08+08:00
author: cmdragon
cover: /images/dde6dfba68f34bfa98aa160bcf409d53~tplv-5jbd59dj06-aigc.png

summary:
  索引是PostgreSQL中优化查询性能的核心工具，本质是表数据的“快速查找目录”，减少磁盘IO次数。B-Tree是默认索引类型，适用于等值查询、范围查询和排序，结构为自平衡树，查询时间稳定。GiST是高级索引类型，支持复杂数据类型和查询场景，如空间数据查询和全文搜索。选择索引时需结合查询需求、数据类型和维护成本，B-Tree适合常规查询，GiST适合复杂查询。

categories:
  - postgresql

tags:
  - 基础入门
  - B-Tree索引
  - GiST索引
  - 查询优化
  - 数据库性能
  - 空间数据查询
  - 全文搜索

---

<img src="/images/dde6dfba68f34bfa98aa160bcf409d53~tplv-5jbd59dj06-aigc.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 1. 索引的基础概念

索引是PostgreSQL中优化查询性能的核心工具，本质是**表数据的“快速查找目录”**——就像书籍的目录，帮你直接定位到目标章节，而不用逐页翻找。其核心作用是
**减少磁盘IO次数**：没有索引时，查询需要全表扫描（Seq Scan），逐行检查条件；有索引时，数据库通过索引快速找到数据的物理位置（行指针），直接读取目标行。

#### 1.1 索引的代价

索引不是“免费的午餐”，使用时需权衡：

- **存储空间**：索引本身需要占用磁盘空间（约为表数据的10%-30%）；
- **写入 overhead**：插入、更新、删除数据时，需同步维护索引（比如B-Tree要调整树结构），因此**写入密集的表（如日志表）应谨慎创建索引
  **。

### 2. B-Tree索引：最常用的“瑞士军刀”

B-Tree（平衡树）是PostgreSQL的**默认索引类型**，适用于90%以上的常规查询场景。它的设计目标是**优化等值查询、范围查询和排序**。

#### 2.1 B-Tree的结构原理

B-Tree是一种**自平衡的树结构**，核心特点是：

- 每个节点（Node）包含若干**键（Key）**和**子节点指针**（Leaf Node除外）；
- 根节点（Root Node）位于内存，叶子节点（Leaf Node）存储实际的键和行指针，且叶子节点用**双向链表**连接（方便范围查询）；
- 所有叶子节点在同一层级（平衡），保证查询时间稳定（O(log n)）。

比如，用户表`users(age INT)`的B-Tree索引结构：

- 根节点：存储年龄范围（如18-30、31-50）；
- 子节点：进一步细分范围（如18-25、26-30）；
- 叶子节点：存储具体年龄值（如20、21）和对应的行指针（指向表中该行的物理位置）。

当查询`WHERE age=25`时，数据库从根节点开始向下遍历，快速定位到叶子节点的“25”，再通过行指针读取数据。

#### 2.2 B-Tree的适用场景

B-Tree对以下查询类型**优化效果最佳**：

1. **等值查询**（`=`）：如`WHERE id=100`；
2. **范围查询**（`>、<、BETWEEN、IN`）：如`WHERE age BETWEEN 18 AND 30`；
3. **排序/分组**（`ORDER BY、GROUP BY`）：如`SELECT age, COUNT(*) FROM users GROUP BY age`（B-Tree的叶子节点已排序，无需额外排序）。

#### 2.3 B-Tree的创建与查询示例

##### 步骤1：准备测试数据

```sql
-- 创建用户表（含10万条测试数据）
CREATE TABLE users
(
    id    SERIAL PRIMARY KEY, -- 主键默认创建B-Tree索引
    name  VARCHAR(50),
    age   INT,
    email VARCHAR(100)
);

-- 插入10万条随机数据
INSERT INTO users (name, age, email)
SELECT 'User ' || generate_series(1, 100000), -- 生成用户名
       floor(random() * 50 + 18)::INT,         -- 年龄：18-67岁 'user' || generate_series(1, 100000) || '@example.com' -- 邮箱
;
```

##### 步骤2：创建B-Tree索引

```sql
-- 为age列创建B-Tree索引（默认类型，可省略USING BTREE）
CREATE INDEX idx_users_age ON users (age);
```

##### 步骤3：分析查询性能

用`EXPLAIN ANALYZE`查看查询计划：

```sql
EXPLAIN
ANALYZE
SELECT *
FROM users
WHERE age = 25;
```

**查询计划输出**（关键部分）：

```
Index Scan using idx_users_age on users  (cost=0.43..8.45 rows=1 width=57) (actual time=0.021..0.023 rows=2000 loops=1)
  Index Cond: (age = 25)
```

**解释**：

- `Index Scan`：使用了`idx_users_age`索引，直接定位到`age=25`的行；
- `cost=0.43..8.45`：预估IO和CPU成本（远低于全表扫描的`cost=0.00..1793.00`）；
- `actual time=0.021..0.023`：实际执行时间（毫秒级）。

### 3. GiST索引：通用搜索的“多面手”

GiST（Generalized Search Tree，通用搜索树）是PostgreSQL的**高级索引类型**，专为**复杂数据类型和查询场景**设计。它的核心优势是
**支持B-Tree无法处理的“非传统”查询**。

#### 3.1 GiST的结构原理

GiST是一种**动态的、可扩展的树结构**，每个节点存储：

- **键（Key）**：表示子树的“覆盖范围”（比如几何类型的`bounding box`，全文搜索的`词汇集合`）；
- **子节点指针**：指向子树。

例如，几何表`locations(geom GEOMETRY)`的GiST索引：

- 根节点：存储整个区域的bounding box（如`(-180,-90)到(180,90)`）；
- 子节点：细分区域（如`(-180,-90)到(0,0)`、`(0,0)到(180,90)`）；
- 叶子节点：存储具体点的bounding box和行指针。

当查询`WHERE geom @> point(1,2)`（判断点是否在几何对象内）时，GiST会快速过滤掉不包含该点的子树，只检查符合条件的叶子节点。

#### 3.2 GiST的适用场景

GiST适用于**B-Tree无法处理的复杂查询**，典型场景包括：

1. **空间数据查询**：如“距离某点1公里内的商店”（`ST_DWithin`）、“几何对象重叠”（`&&`）；
2. **全文搜索**：如“包含关键词‘PostgreSQL’的文章”（`@@`）；
3. **数组/范围查询**：如“数组标签包含‘数据库’”（`@>`）、“时间范围重叠”（`&&`）。

#### 3.3 GiST的创建与查询示例

以**空间数据查询**为例（需安装PostGIS扩展）：

##### 步骤1：安装PostGIS扩展

```sql
-- 需超级用户权限（创建处理几何类型的函数和操作符）
CREATE
EXTENSION IF NOT EXISTS postgis;
```

##### 步骤2：准备空间数据

```sql
-- 创建位置表（存储POI点）
CREATE TABLE locations
(
    id   SERIAL PRIMARY KEY,
    name VARCHAR(100),
    geom GEOMETRY(Point, 4326) -- WGS84坐标系的点
);

-- 插入测试数据（波士顿的知名地点）
INSERT INTO locations (name, geom)
VALUES ('Fenway Park', ST_SetSRID(ST_MakePoint(-71.091542, 42.346681), 4326)),
       ('TD Garden', ST_SetSRID(ST_MakePoint(-71.062207, 42.365554), 4326)),
       ('Boston Common', ST_SetSRID(ST_MakePoint(-71.070739, 42.355505), 4326))
;
```

##### 步骤3：创建GiST索引

```sql
-- 为geom列创建GiST索引（必须指定USING GIST）
CREATE INDEX idx_locations_geom ON locations USING GIST(geom);
```

##### 步骤4：空间查询示例

查询“距离波士顿市政厅（-71.057083, 42.361145）1公里内的地点”：

```sql
EXPLAIN
ANALYZE
SELECT *
FROM locations
WHERE ST_DWithin(
              geom::geography, -- 转换为地理类型（米为单位）
              ST_MakePoint(-71.057083, 42.361145)::geography,
              1000 -- 1公里=1000米
      );
```

**查询计划输出**（关键部分）：

```
Index Scan using idx_locations_geom on locations  (cost=0.29..8.31 rows=1 width=44) (actual time=0.018..0.020 rows=2 loops=1)
  Index Cond: (geom && '0101000020E61000009A999999999951C014AE47E17A144540'::geometry)
  Filter: (ST_DWithin((geom)::geography, '0101000020E61000009A999999999951C014AE47E17A144540'::geography, 1000::double precision))
```

**解释**：

- `Index Scan`：使用GiST索引快速过滤掉不在bounding box内的点；
- `Filter`：进一步用`ST_DWithin`验证精确距离（GiST索引无法完全替代精确计算，但能大幅减少需要检查的行数）。

### 4. 索引选择的决策框架

B-Tree和GiST各有优势，选择时需**结合查询需求、数据类型和维护成本**。以下是一套通用决策框架：

#### 4.1 核心差异对比

| 特性       | B-Tree        | GiST                  |
|----------|---------------|-----------------------|
| 支持的数据类型  | 整数、文本、日期等常规类型 | 几何、全文、数组、范围等          |
| 适用查询类型   | 等值、范围、排序      | 空间、全文、包含、重叠           |
| 查询性能（等值） | 快             | 可能慢（取决于类型）            |
| 插入/更新性能  | 快             | 慢（需维护复杂结构）            |
| 存储空间     | 小             | 大                     |
| 唯一索引支持   | 原生支持          | 仅部分operator classes支持 |

#### 4.2 四步选对索引

1. **明确查询需求**：是“找某个年龄的用户”（B-Tree）还是“找某区域的商店”（GiST）？
2. **检查数据类型**：如果是几何、全文等复杂类型，直接选GiST；
3. **测试查询性能**：用`EXPLAIN ANALYZE`对比两种索引的执行时间（比如对`users`表的`age`列，B-Tree的查询时间远低于GiST）；
4. **评估维护成本**：如果表是**写入密集型**（如日志表，每秒插入100条数据），GiST的插入 overhead会导致性能下降，优先选B-Tree。

#### 4.3 案例：电商商品搜索的索引设计

**需求**：电商平台需要支持两种查询：

- 按“价格范围”搜索（如“价格在100-200元之间的手机”）；
- 按“商品标签”搜索（如“标签包含‘智能’和‘5G’的手机”）。

**索引设计**：

- 价格范围查询：用B-Tree索引（`CREATE INDEX idx_products_price ON products(price)`）；
- 标签包含查询：用GiST索引（`CREATE INDEX idx_products_tags ON products USING GIST(tags)`，假设`tags`是`TEXT[]`类型）。

### 5. 课后Quiz：巩固你的索引知识

#### 问题1：以下哪种场景最适合使用B-Tree索引？

A. 查询“距离某点1公里内的商店”  
B. 查询“年龄在20-30岁之间的用户”  
C. 查询“包含关键词‘PostgreSQL’的文章”  
D. 查询“数组标签中包含‘数据库’的帖子”

**答案**：B  
**解析**：B是范围查询，B-Tree对范围查询优化最佳。A（空间）、C（全文）、D（数组包含）均需GiST。

#### 问题2：GiST索引的核心优势是什么？

A. 插入速度快  
B. 支持更多复杂数据类型和查询类型  
C. 存储空间更小  
D. 唯一索引支持更好

**答案**：B  
**解析**：GiST是通用搜索树，支持B-Tree无法处理的复杂场景（如空间、全文）。A/C/D是B-Tree的优势。

### 6. 常见报错解决方案

#### 报错1：`ERROR: index type "gist" does not support unique indexes`

- **原因**：GiST的大多数operator classes（如几何类型的`gist_geometry_ops_2d`）不支持唯一约束。
- **解决办法**：
    1. 如果数据类型支持，优先用B-Tree创建唯一索引（如`CREATE UNIQUE INDEX idx_users_email ON users(email)`）；
    2. 如果必须用GiST（如空间数据），在应用层保证唯一性（如插入前检查是否存在）。
- **预防建议**：创建唯一索引前，查文档确认索引类型是否支持（B-Tree原生支持，GiST需参考operator class文档）。

#### 报错2：`ERROR: function gist_geometry_ops_2d(geometry) does not exist`

- **原因**：未安装PostGIS扩展，无法使用GiST处理几何类型。
- **解决办法**：安装PostGIS（需超级用户权限）：
  ```sql
  CREATE EXTENSION IF NOT EXISTS postgis;
  ```
- **预防建议**：使用空间数据前，确保已安装PostGIS扩展。

#### 报错3：`ERROR: could not create index "idx_users_age" because column "age" is of type jsonb`

- **原因**：B-Tree不支持直接在`jsonb`列上创建索引（`jsonb`无默认排序规则）。
- **解决办法**：
    1. 提取`jsonb`中的字段并转换为常规类型（推荐）：
       ```sql
       -- 假设age存储在jsonb的"age"键中
       CREATE INDEX idx_users_age ON users((age->>'age')::INT);
       ```
    2. 用GiST索引处理`jsonb`的包含查询：
       ```sql
       CREATE INDEX idx_users_age_gist ON users USING GIST(age jsonb_path_ops);
       ```
- **预防建议**：常用查询字段尽量设计为单独列（如`age INT`），避免存放在`jsonb`中

### 参考链接

1. PostgreSQL索引介绍：https://www.postgresql.org/docs/17/indexes-intro.html
2. B-Tree索引类型：https://www.postgresql.org/docs/17/indexes-types.html#INDEXES-TYPES-BTREE
3. GiST索引：https://www.postgresql.org/docs/17/gist.html
4. jsonb索引：https://www.postgresql.org/docs/17/indexes-types.html#INDEXES-TYPES-JSONB

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[PostgreSQL索引选B-Tree还是GiST？“瑞士军刀”和“多面手”的差别你居然还不知道？](https://blog.cmdragon.cn/posts/d498f63cd0a2d5a77e445c688a8b88db/)




<details>
<summary>往期文章归档</summary>

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