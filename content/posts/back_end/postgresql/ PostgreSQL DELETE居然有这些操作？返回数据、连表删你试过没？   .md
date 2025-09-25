---
url: /posts/934be1203725e8be9d6f6e9104e5abcc/
title: PostgreSQL DELETE居然有这些操作？返回数据、连表删你试过没？
date: 2025-09-24T01:49:02+08:00
lastmod: 2025-09-24T01:49:02+08:00
author: cmdragon
cover: /images/061dcd35000f49bd90b456f49a2ca121~tplv-5jbd59dj06-image.png

summary:
  PostgreSQL的`DELETE`语句用于从表中删除满足条件的行，核心逻辑通过`WHERE`条件筛选。若无`WHERE`，将删除所有行。`USING`子句可连接其他表进行关联删除，`RETURNING`子句可返回被删除的行。`WHERE CURRENT OF`用于删除游标当前指向的行。批量删除可通过`WITH`子查询模拟`LIMIT`。清空表时，`TRUNCATE`比`DELETE`更快，但不触发触发器。常见报错包括权限不足、语法错误等，需根据具体原因解决。

categories:
  - postgresql

tags:
  - 基础入门
    - SQL
  - DELETE语句
  - PostgreSQL
  - 数据库操作
  - WHERE条件
  - 批量删除
  - 清空表

---

<img src="/images/061dcd35000f49bd90b456f49a2ca121~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## DELETE语句的基本用法

### 语法与核心逻辑

`DELETE`语句用于从表中删除满足条件的行，其基本语法（源自官方文档）如下：

```sql
[ WITH [ RECURSIVE ] with_query [, ...] ]
DELETE
FROM [ ONLY ] table_name [ * ] [ [ AS ] alias ]
    [ USING from_item [, ...] ]
    [
WHERE condition |
WHERE CURRENT OF cursor_name ]
    [ RETURNING { * | output_expression [ [ AS ] output_name ] } [
    , ...] ]
```

核心逻辑：通过`WHERE`条件筛选要删除的行，若省略`WHERE`，则**删除表中所有行**（需谨慎使用）。

### 示例：删除特定条件的行

假设`films`表存储电影信息，`kind`字段表示类型，要删除所有非音乐剧类型的电影：

```sql
-- 删除所有非音乐剧的电影
DELETE
FROM films
WHERE kind <> 'Musical';
```

执行后，`films`表中所有`kind`不等于'Musical'的行将被删除。

### 注意事项

- **无WHERE条件的风险**：`DELETE FROM films;`会清空表中所有行，生产环境中务必避免这种操作，除非你明确要清空表。

## 使用WHERE条件精准控制删除范围

`WHERE`条件是`DELETE`的核心，它通过布尔表达式决定哪些行会被删除。常见的条件包括：

- 比较运算：`=`（等于）、`<>（不等于）`、`>`（大于）、`<`（小于）等；
- 逻辑运算：`AND`（并且）、`OR`（或者）、`NOT`（非）；
- 子查询：`IN`、`EXISTS`等。

### 示例：多条件组合删除

要删除2020年之前上映且评分低于6.0的电影：

```sql
DELETE
FROM films
WHERE release_year < 2020
  AND rating < 6.0;
```

只有同时满足“2020年前上映”和“评分<6.0”的行才会被删除。

## 连接其他表删除关联数据（USING clause）

当需要根据**其他表的数据**决定删除哪些行时，`USING`子句可以简化关联删除的逻辑。它允许在`DELETE`中连接其他表，类似`SELECT`
的`FROM`子句。

### 示例：删除指定制片人的电影

假设`films`（电影）和`producers`（制片人）通过`producer_id`关联，要删除由名为'foo'的制片人制作的电影：

```sql
-- 方法1：使用USING clause（PostgreSQL扩展）
DELETE
FROM films USING producers
WHERE films.producer_id = producers.id
  AND producers.name = 'foo';
```

逻辑：将`films`与`producers`连接，找到`producer_id`匹配且制片人名为'foo'的电影行，删除这些电影。

### 对比：标准SQL子查询方式

如果你更习惯标准SQL，也可以用子查询实现：

```sql
-- 方法2：子查询（标准SQL）
DELETE
FROM films
WHERE producer_id IN (SELECT id
                      FROM producers
                      WHERE name = 'foo');
```

两种方法结果一致，但`USING`在关联表较大时可能更高效。

## 返回删除的行（RETURNING clause）

默认情况下，`DELETE`仅返回删除的行数（如`DELETE 5`表示删除5行）。若需确认**具体删除了哪些数据**
（比如审计或回滚），可使用`RETURNING`子句返回被删除行的字段或计算结果。

### 示例1：返回删除的完整行

删除`tasks`表中状态为'DONE'的任务，并返回所有字段：

```sql
DELETE
FROM tasks
WHERE status = 'DONE' RETURNING *;
```

执行结果类似`SELECT`，会显示被删除行的所有列（如`id`、`title`、`status`）。

### 示例2：返回计算字段

删除任务时，返回任务`id`和删除时间：

```sql
DELETE
FROM tasks
WHERE status = 'DONE' RETURNING id, now() AS deleted_at;
```

结果会包含`id`（任务ID）和`deleted_at`（当前时间，由`now()`函数生成）。

## 使用游标删除特定行（WHERE CURRENT OF）

若需删除**游标当前指向的行**（比如逐行处理数据时），可使用`WHERE CURRENT OF`子句。这种方式适用于精准定位某一行的场景。

### 步骤与示例

1. **声明游标**：针对目标表创建非分组查询的游标：
   ```sql
   -- 声明游标c_tasks，指向tasks表的所有行
   DECLARE c_tasks CURSOR FOR SELECT * FROM tasks;
   ```
2. **移动游标**：用`FETCH`将游标定位到目标行（比如第一行）：
   ```sql
   -- 定位到第一行
   FETCH NEXT FROM c_tasks;
   ```
3. **删除当前行**：通过`WHERE CURRENT OF`删除游标指向的行：
   ```sql
   -- 删除游标当前指向的行
   DELETE FROM tasks WHERE CURRENT OF c_tasks;
   ```

### 注意事项

- 游标必须是针对`DELETE`目标表的**非分组查询**（不能用`GROUP BY`）；
- 不能同时使用`WHERE CURRENT OF`和布尔条件（如`WHERE CURRENT OF c_tasks AND status = 'DONE'`是错误的）。

## 批量删除（模拟LIMIT）

PostgreSQL的`DELETE`**没有LIMIT子句**（不能直接写`DELETE FROM table LIMIT 1000`），但可通过`WITH`
子查询模拟批量删除，避免一次性删除过多行导致锁表或性能问题。

### 示例：批量删除归档日志

假设`user_logs`表存储用户日志，`status`为'archived'表示已归档。每次删除10000行归档日志：

```sql
WITH delete_batch AS (
    -- 选择10000行归档日志，按创建时间排序并加锁（FOR UPDATE）
    SELECT ctid
    FROM user_logs
    WHERE status = 'archived'
    ORDER BY creation_date
    FOR UPDATE LIMIT 10000
)
-- 删除选中的行（通过ctid定位）
DELETE
FROM user_logs USING delete_batch
WHERE user_logs.ctid = delete_batch.ctid;
```

### 关键解释

- **ctid**：PostgreSQL中每行的物理位置标识符（格式为`(块号, 行号)`），用于精准定位行；
- **WITH子查询**：先选出要删除的10000行（`delete_batch`），再通过`USING`连接`user_logs`表删除这些行；
- **FOR UPDATE**：为选中的行加排它锁，防止并发修改，避免删除时的冲突。

## 清空表：DELETE vs TRUNCATE

若需清空表中所有行，`DELETE FROM table;`和`TRUNCATE TABLE table;`均可，但二者有显著区别：

| 特性   | DELETE           | TRUNCATE            |
|------|------------------|---------------------|
| 执行速度 | 慢（逐行删除，写WAL日志）   | 快（直接清空表，少写WAL日志）    |
| 触发器  | 触发DELETE触发器      | 不触发任何触发器            |
| 权限   | 需要DELETE权限       | 需要TRUNCATE权限（或超级用户） |
| 子表处理 | 删除子表行（若用INHERIT） | 默认只清空父表，需加`CASCADE` |

### 示例：快速清空表

若要快速清空`films`表（无需触发触发器），用`TRUNCATE`：

```sql
-- 快速清空films表（推荐）
TRUNCATE TABLE films;
```

若需触发`DELETE`触发器（比如审计），则用`DELETE`：

```sql
-- 逐行删除所有行（触发触发器）
DELETE
FROM films;
```

## 课后Quiz

### 问题1：如何删除`films`表中由名为'bar'的制片人制作的所有电影？写出两种方法。

**答案**：
方法1（`USING`子句）：

```sql
DELETE
FROM films USING producers
WHERE films.producer_id = producers.id
  AND producers.name = 'bar';
```

方法2（子查询）：

```sql
DELETE
FROM films
WHERE producer_id IN (SELECT id
                      FROM producers
                      WHERE name = 'bar');
```

### 问题2：如何在删除`tasks`表中已完成的任务时，返回被删除行的`id`和`title`？

**答案**：
使用`RETURNING`子句：

```sql
DELETE
FROM tasks
WHERE status = 'DONE' RETURNING id, title;
```

### 问题3：为什么有时候用`TRUNCATE`代替`DELETE`清空表？

**答案**：
`TRUNCATE`比`DELETE`
更快，因为它直接清空表的物理存储（不逐行删除），且仅写少量WAL日志（用于恢复）。适合清空大表时提升性能。但`TRUNCATE`
不会触发`DELETE`触发器，若需触发触发器则仍用`DELETE`。

## 常见报错及解决方案

### 报错1：`ERROR:  syntax error at or near "LIMIT"`

**原因**：`DELETE`没有`LIMIT`子句，直接写`DELETE FROM user_logs LIMIT 1000`会报错。  
**解决**：用`WITH`子查询模拟`LIMIT`（参考“批量删除”部分示例）。

### 报错2：`ERROR:  permission denied for table films`

**原因**：当前用户无`films`表的`DELETE`权限。  
**解决**：授予权限（需表所有者或超级用户执行）：

```sql
GRANT DELETE ON films TO your_username;
```

### 报错3：`ERROR:  cannot use WHERE CURRENT OF with a condition`

**原因**：同时使用`WHERE CURRENT OF`和布尔条件（如`WHERE CURRENT OF c_tasks AND status = 'DONE'`）。  
**解决**：去掉布尔条件，或在游标查询时加条件（如`DECLARE c_tasks CURSOR FOR SELECT * FROM tasks WHERE status = 'DONE'`）。

### 报错4：`ERROR:  relation "producers" does not exist`

**原因**：`USING`子句中引用的表不存在或拼写错误。  
**解决**：检查表名拼写，用`\d producers`在psql中确认表存在。

## 参考链接

- PostgreSQL官方文档：`DELETE`语句详解 https://www.postgresql.org/docs/17/sql-delete.html
- PostgreSQL官方文档：`TRUNCATE`语句 https://www.postgresql.org/docs/17/sql-truncate.html
- PostgreSQL官方文档：游标（`CURSOR`） https://www.postgresql.org/docs/17/sql-declare.html

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[PostgreSQL DELETE居然有这些操作？返回数据、连表删你试过没？](https://blog.cmdragon.cn/posts/934be1203725e8be9d6f6e9104e5abcc/)



<details>
<summary>往期文章归档</summary>

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
- [如何在 FastAPI 中玩转 APScheduler，让任务定时自动执行？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/85564dd901c6d9b1a79d320970843caa/)
- [定时任务系统如何让你的Web应用自动完成那些烦人的重复工作？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/2b27950aab76203a1af4e9e3deda8699/)
- [Celery任务监控的魔法背后藏着什么秘密？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/f43335725bb3372ebc774db1b9f28d2d/)

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