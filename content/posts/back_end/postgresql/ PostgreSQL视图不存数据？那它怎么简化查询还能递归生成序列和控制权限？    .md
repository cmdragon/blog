---
url: /posts/325047855e3e23b5ef82f7d2db134fbd/
title: PostgreSQL视图不存数据？那它怎么简化查询还能递归生成序列和控制权限？
date: 2025-10-01T06:30:56+08:00
lastmod: 2025-10-01T06:30:56+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/d7debf4a6a784dd6a4eba17af1c2a803~tplv-5jbd59dj06-image.png

summary:
  PostgreSQL视图是基于SQL查询结果的虚拟表，不存储数据，仅保存查询逻辑。视图简化复杂查询、限制数据访问、隔离schema变化。创建视图使用`CREATE VIEW`语句，支持`OR REPLACE`替换已有视图、`TEMPORARY`创建临时视图、`RECURSIVE`递归视图。视图可指定列名、设置`WITH`选项（如`security_barrier`）、`CHECK OPTION`确保更新行可见。可更新视图需满足特定条件，否则通过`INSTEAD OF`触发器实现更新。递归视图处理层级结构或序列生成。视图权限默认基于视图所有者，`security_invoker`以调用者权限访问基础表，`security_barrier`防止信息泄露。

categories:
  - postgresql

tags:
  - 基础入门
  - 视图创建语法
  - 可更新视图
  - 递归视图
  - 视图安全
  - 视图权限
  - 视图常见报错

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/d7debf4a6a784dd6a4eba17af1c2a803~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 一、什么是PostgreSQL视图？

视图（View）是基于SQL查询结果的**虚拟表**——它不物理存储数据，仅保存查询的逻辑定义。当你查询视图时，PostgreSQL会动态执行视图的定义查询，返回基础表的最新结果。视图的核心价值在于：

- **简化复杂查询**：将常用的多表关联、过滤逻辑封装成视图，避免重复写冗长SQL；
- **限制数据访问**：仅暴露基础表的部分列/行给用户，保障数据安全；
- **隔离 schema 变化**：当基础表结构调整时，只需修改视图定义，不影响应用代码。

例如，若你频繁需要查询“喜剧类型的电影”，可以创建`comedies`视图，之后直接查询`comedies`
即可，无需每次写`WHERE kind = 'Comedy'`。

### 二、创建视图的基本语法

PostgreSQL用`CREATE VIEW`语句创建视图，完整语法如下（来自官方文档）：

```sql
CREATE
[ OR REPLACE ] [ TEMP | TEMPORARY ] [ RECURSIVE ] VIEW name [ ( column_name [, ...] ) ]
    [ WITH ( view_option_name [= view_option_value] [, ... ] ) ]
    AS query
    [ WITH [ CASCADED | LOCAL ] CHECK OPTION ]
```

下面拆解关键参数的含义和用法：

#### 1. 可选修饰符：OR REPLACE、TEMPORARY

- **OR REPLACE**：若同名视图已存在，则替换它（需保证新视图的列名、顺序、类型与原视图一致，可添加新列到末尾）；
- **TEMPORARY（或TEMP）**：创建**临时视图**，会话结束后自动删除。若视图引用的表是临时表，视图会自动转为临时视图。

示例：替换已有视图并添加新列：

```sql
-- 原视图：仅包含id、title
CREATE VIEW comedies AS
SELECT id, title
FROM films
WHERE kind = 'Comedy';

-- 替换视图：添加release_year列
CREATE
OR REPLACE VIEW comedies AS
SELECT id, title, release_year
FROM films
WHERE kind = 'Comedy';
```

#### 2. RECURSIVE：递归视图

递归视图用于处理**递归结构**（如层级数据、序列生成），等价于`WITH RECURSIVE`的CTE（公共表表达式）。**必须显式指定列名列表**。

递归视图的结构分为两部分：

- **初始查询（非递归部分）**：返回递归的起始行；
- **递归查询（递归部分）**：引用视图本身，返回下一层行，直到条件不满足。

示例：生成1到100的连续数字：

```sql
CREATE RECURSIVE VIEW nums_1_100 (n) AS
VALUES (1) -- 初始查询：起始值1
UNION ALL
SELECT n + 1
FROM nums_1_100
WHERE n < 100; -- 递归查询：每次加1，直到n=99
```

查询结果：`SELECT * FROM nums_1_100;`（返回1~100的整数）

#### 3. 列名指定

若不指定`column_name`，视图列名将从查询中**自动推导**（如`SELECT id, title`的列名是`id`、`title`
）。但建议显式指定，避免默认的`?column?`或歧义。

示例：显式指定列名：

```sql
CREATE VIEW film_ratings (film_id, average_rating) AS
SELECT film_id, AVG(rating)
FROM user_ratings
GROUP BY film_id;
```

#### 4. WITH选项：视图的高级参数

`WITH` clause 用于设置视图的附加属性，常见参数：

- **security_barrier**（布尔值）：用于**行级安全（RLS）**，确保视图的`WHERE`条件先于用户的查询条件执行，防止信息泄露；
- **security_invoker**（布尔值）：默认`false`。若设为`true`，访问基础表的权限检查将使用**执行查询的用户**（而非视图所有者）的权限；
- **check_option**（枚举值）：等价于后面的`CHECK OPTION`（`local`或`cascaded`）。

示例：创建安全屏障视图（用于RLS）：

```sql
CREATE VIEW secure_films WITH (security_barrier = true) AS
SELECT *
FROM films
WHERE is_public = true;
```

#### 5. AS query：视图的核心逻辑

`query`是视图的定义查询，必须是有效的`SELECT`或`VALUES`语句。例如：

```sql
-- 查询“2020年以后上映的喜剧电影”
CREATE VIEW recent_comedies AS
SELECT id, title, release_year, director
FROM films
WHERE kind = 'Comedy'
  AND release_year >= 2020;
```

#### 6. CHECK OPTION：确保更新的行可见

`CHECK OPTION`用于**可更新视图**，确保`INSERT`/`UPDATE`/`MERGE`操作产生的行仍满足视图的定义条件（即能通过视图看到）。有两种模式：

- **LOCAL**：仅检查当前视图的条件，不检查基础视图；
- **CASCADED**：检查当前视图和所有基础视图的条件（默认）。

示例：

```sql
-- 基础视图：喜剧电影
CREATE VIEW comedies AS
SELECT *
FROM films
WHERE kind = 'Comedy';

-- 子视图：U级喜剧（LOCAL CHECK OPTION）
CREATE VIEW universal_comedies AS
SELECT *
FROM comedies
WHERE classification = 'U'
WITH LOCAL CHECK OPTION; -- 仅检查classification='U'

-- 子视图：PG级喜剧（CASCADED CHECK OPTION）
CREATE VIEW pg_comedies AS
SELECT *
FROM comedies
WHERE classification = 'PG'
WITH CASCADED CHECK OPTION; -- 检查classification='PG' + kind='Comedy'
```

### 三、可更新视图（Updatable Views）

不是所有视图都能执行`INSERT`/`UPDATE`/`DELETE`/`MERGE`——PostgreSQL会自动判断视图是否“可更新”。

#### 1. 自动可更新的条件

视图需满足以下所有条件：

- `FROM`子句仅包含**一个表或另一个可更新视图**；
- 视图定义无`WITH`/`DISTINCT`/`GROUP BY`/`HAVING`/`LIMIT`/`OFFSET`；
- 无顶层集合操作（`UNION`/`INTERSECT`/`EXCEPT`）；
- `SELECT`列表无聚合函数（`AVG`/`SUM`）、窗口函数（`ROW_NUMBER`）或返回集合的函数（`generate_series`）。

#### 2. 可更新列 vs 只读列

- **可更新列**：直接引用基础表的可更新列（如`films.id`）；
- **只读列**：计算列（函数结果）、聚合结果、子查询结果等。

示例：混合列的视图：

```sql
CREATE VIEW comedy_details AS
SELECT f.id,                                                                           -- 可更新（来自films.id）
       f.title,                                                                        -- 可更新（来自films.title）
       country_code_to_name(f.country_code)                              AS country,   -- 只读（函数结果）
       (SELECT AVG(r.rating) FROM user_ratings r WHERE r.film_id = f.id) AS avg_rating -- 只读（聚合结果）
FROM films f
WHERE f.kind = 'Comedy';
```

若尝试更新`country`列，会报错：`ERROR: column "country" is read only`。

#### 3. 不可更新视图的解决方案

若视图不满足自动可更新条件，可通过**`INSTEAD OF`触发器**实现更新——将视图的操作转换为基础表的操作。

示例：为聚合视图添加更新触发器：

```sql
-- 不可更新视图（有GROUP BY）
CREATE VIEW film_ratings AS
SELECT film_id, AVG(rating) AS avg_rating
FROM user_ratings
GROUP BY film_id;

-- 创建触发器函数：将视图更新转为基础表更新
CREATE
OR REPLACE FUNCTION update_film_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- 简化逻辑：将avg_rating更新到user_ratings表的对应film_id
UPDATE user_ratings
SET rating = NEW.avg_rating
WHERE film_id = NEW.film_id;
RETURN NEW;
END;
$$
LANGUAGE plpgsql;

-- 绑定INSTEAD OF触发器到视图
CREATE TRIGGER trigger_update_film_rating
    INSTEAD OF UPDATE
    ON film_ratings
    FOR EACH ROW EXECUTE FUNCTION update_film_rating();
```

### 四、递归视图的高级应用

递归视图常用于处理**层级结构**或**序列生成**，以下是两个典型场景：

#### 1. 场景1：生成日期序列

需求：生成2024年1月的所有日期：

```sql
CREATE RECURSIVE VIEW jan_2024_dates (date) AS
VALUES ('2024-01-01'::date) -- 初始日期
UNION ALL
SELECT
        date + INTERVAL '1 day' FROM jan_2024_dates WHERE date < '2024-01-31'; -- 每天加1天
```

查询结果：`SELECT * FROM jan_2024_dates;`（返回31行日期）

#### 2. 场景2：查询组织层级

假设`employees`表有`id`（员工ID）、`name`（姓名）、`manager_id`（上级ID），需求：查询所有员工的层级关系：

```sql
CREATE RECURSIVE VIEW employee_hierarchy (id, name, manager_id, level) AS
-- 初始查询：顶层管理者（无上级）
SELECT id, name, manager_id, 1
FROM employees
WHERE manager_id IS NULL
UNION ALL
-- 递归查询：关联上级，层级+1
SELECT e.id, e.name, e.manager_id, eh.level + 1
FROM employees e
         JOIN employee_hierarchy eh ON e.manager_id = eh.id;
```

查询结果：`SELECT * FROM employee_hierarchy;`（返回所有员工的层级，如顶层管理者`level=1`，下属`level=2`）

### 五、视图的安全与权限

PostgreSQL视图的权限默认**基于视图所有者**：用户访问视图时，PostgreSQL检查**视图所有者**对基础表的权限，而非用户自己的权限。

#### 1. security_invoker：以调用者权限访问基础表

若视图的`security_invoker`设为`true`，则权限检查会使用**执行查询的用户**的权限。例如：

```sql
-- 视图：仅显示当前用户的电影
CREATE VIEW user_films WITH (security_invoker = true) AS
SELECT *
FROM films
WHERE user_id = current_user;
```

当用户`alice`查询`user_films`时，PostgreSQL会检查`alice`对`films`表的权限，而非视图所有者的权限。

#### 2. security_barrier：防止信息泄露

`security_barrier`用于**行级安全（RLS）**，确保视图的`WHERE`条件先于用户的查询条件执行，避免“条件泄露”。例如：

```sql
-- 视图：仅显示公开电影
CREATE VIEW secure_films WITH (security_barrier = true) AS
SELECT *
FROM films
WHERE is_public = true;
```

当用户查询`secure_films WHERE title LIKE '%secret%'`时，PostgreSQL会先过滤`is_public = true`的电影，再执行用户的条件，确保不泄露非公开电影的信息。

### 六、课后Quiz

#### 问题1：如何确保插入到视图的行满足所有基础视图的条件？

**答案**：使用`WITH CASCADED CHECK OPTION`。例如：

```sql
CREATE VIEW pg_comedies AS
SELECT *
FROM comedies
WHERE classification = 'PG'
WITH CASCADED CHECK OPTION;
```

插入时会检查`comedies`视图的`kind = 'Comedy'`和当前视图的`classification = 'PG'`。

#### 问题2：请写出创建“1到50的数字”的递归视图的SQL。

**答案**：

```sql
CREATE RECURSIVE VIEW nums_1_50 (n) AS
VALUES (1) -- 初始值
UNION ALL
SELECT n + 1
FROM nums_1_50
WHERE n < 50; -- 递归加1
```

#### 问题3：为什么聚合视图无法自动更新？如何解决？

**答案**：聚合视图包含`GROUP BY`或聚合函数（如`AVG`），不满足自动可更新的条件。解决方法是为视图创建`INSTEAD OF`
触发器，将更新操作转换为基础表的操作。

### 七、常见报错及解决方案

#### 报错1：ERROR: cannot create view without a query

**原因**：创建视图时缺少`AS query`，例如：

```sql
CREATE VIEW comedies; -- 错误：无查询逻辑
```

**解决**：添加`AS`和有效查询：

```sql
CREATE VIEW comedies AS
SELECT *
FROM films
WHERE kind = 'Comedy';
```

#### 报错2：ERROR: view "view_name" cannot be modified because it contains a non-updatable column

**原因**：尝试更新视图中的只读列（如聚合结果），例如：

```sql
-- 视图有avg_rating（聚合列，只读）
CREATE VIEW film_ratings AS
SELECT film_id, AVG(rating) AS avg_rating
FROM user_ratings
GROUP BY film_id;

-- 错误：更新只读列
UPDATE film_ratings
SET avg_rating = 4
WHERE film_id = 1;
```

**解决**：

1. 去掉视图中的只读列，使其成为自动可更新视图；
2. 为视图创建`INSTEAD OF`触发器。

#### 报错3：ERROR: recursive view "view_name" must have a column list

**原因**：创建递归视图时未指定列名列表，例如：

```sql
-- 错误：无列名列表
CREATE RECURSIVE VIEW nums_1_100 AS
VALUES (1)
UNION ALL
SELECT n + 1
FROM nums_1_100
WHERE n < 100;
```

**解决**：显式指定列名列表：

```sql
CREATE RECURSIVE VIEW nums_1_100 (n) AS
VALUES (1)
UNION ALL
SELECT n + 1
FROM nums_1_100
WHERE n < 100;
```

#### 报错4：ERROR: permission denied for table base_table

**原因**：视图所有者无基础表的权限，例如：

```sql
-- 视图所有者view_owner无films表的SELECT权限
CREATE VIEW comedies AS
SELECT *
FROM films
WHERE kind = 'Comedy';
```

**解决**：授予视图所有者基础表的权限：

```sql
GRANT SELECT ON films TO view_owner;
```

若视图的`security_invoker = true`，则需授予**执行查询的用户**基础表的权限。

### 八、参考链接

参考链接：https://www.postgresql.org/docs/17/sql-createview.html

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[PostgreSQL视图不存数据？那它怎么简化查询还能递归生成序列和控制权限？](https://blog.cmdragon.cn/posts/325047855e3e23b5ef82f7d2db134fbd/)




<details>
<summary>往期文章归档</summary>

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
- [如何在FastAPI中巧妙实现延迟队列，让任务乖乖等待？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/174450702d9e609a072a7d1aaa84750b/)
- [FastAPI的死信队列处理机制：为何你的消息系统需要它？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/047b08957a0d617a87b72da6c3131e5d/)
- [如何让FastAPI任务系统在失败时自动告警并自我修复？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/2f104637ecc916e906c002fa79ab8c80/)
- [如何用Prometheus和FastAPI打造任务监控的“火眼金睛”？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/e7464e5b4d558ede1a7413fa0a2f96f3/)
- [如何用APScheduler和FastAPI打造永不宕机的分布式定时任务系统？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/51a0ff47f509fb6238150a96f551b317/)

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