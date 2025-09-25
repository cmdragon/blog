---
url: /posts/0f0622e9b7402b599e618150d0596ffe/
title: PostgreSQL UPDATE语句怎么玩？从改邮箱到批量更新的避坑技巧你都会吗？
date: 2025-09-25T01:03:40+08:00
lastmod: 2025-09-25T01:03:40+08:00
author: cmdragon
cover: /images/4d9200bf46c148008a63805ace2db034~tplv-5jbd59dj06-image.png

summary:
  PostgreSQL的`UPDATE`语句用于修改数据库中的已有数据，通过`SET`子句定义新值，`WHERE`子句精准定位行，`FROM`子句关联其他表，`RETURNING`子句返回修改结果。高级用法包括分批更新减少锁冲突、使用`WITH`子句分步处理复杂逻辑、结合游标逐行修改。实践案例展示了电商订单状态更新的具体实现，常见报错如语法错误、唯一约束冲突等也提供了解决方案。

categories:
  - postgresql

tags:
  - 基础入门
  - UPDATE语句
  - 数据库操作
  - 数据修改
  - SQL语法
  - 批量更新
  - 数据过滤

---

<img src="/images/4d9200bf46c148008a63805ace2db034~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 一、UPDATE语句的核心作用与基本语法

在数据库操作中，**修改已有数据**
是日常开发的高频需求——比如调整用户的联系信息、更新订单的支付状态、修正错误的统计数据。PostgreSQL通过`UPDATE`
语句实现这一功能，它允许你精准定位需要修改的行，并灵活设置新值。

#### 1.1 语法结构拆解

`UPDATE`的完整语法如下：

```sql
[ WITH [ RECURSIVE ] with_query [, ...] ]
UPDATE [ ONLY ] table_name [ * ] [ [ AS ] alias ]
SET {
    column_name = { expression | DEFAULT } |
    ( column_name [, ...] ) = [ ROW ] ( { expression | DEFAULT } [, ...] ) |
    ( column_name [, ...] ) = ( sub- SELECT )
    } [, ...]
    [
FROM from_item [, ...] ]
    [
WHERE condition |
WHERE CURRENT OF cursor_name ]
    [ RETURNING { * | output_expression [ [ AS ] output_name ] } [
    , ...] ]
```

我们可以将其简化为**“定位目标→设置新值→可选关联→过滤条件→返回结果”**的逻辑流程：

1. **定位目标**：通过`table_name`指定要修改的表；
2. **设置新值**：通过`SET`子句定义列的新值；
3. **可选关联**：通过`FROM`子句关联其他表（如需跨表更新）；
4. **过滤条件**：通过`WHERE`精准定位需要修改的行；
5. **返回结果**：通过`RETURNING`获取修改后的行数据（方便验证）。

### 二、关键参数详解与基础用法

#### 2.1 SET子句：如何设置新值？

`SET`是`UPDATE`的核心，用于定义“要修改哪些列”和“修改成什么值”，支持3种常见写法：

##### （1）单个列赋值

最基础的用法：直接给某一列赋新值（可以是常量、表达式或函数结果）。
**示例**：将ID为1的用户邮箱修改为`new@example.com`：

```sql
UPDATE users
SET email = 'new@example.com' -- 列名=新值
WHERE id = 1; -- 定位行
```

##### （2）多列批量赋值

如果需要修改多个列，可以用**括号+行构造器**（`ROW`）或**子查询**批量赋值，避免重复写`SET`。
**示例**：同时修改用户的手机号和状态：

```sql
-- 方式1：行构造器
UPDATE users
SET (phone, status) = ROW('138xxxx1234', 'active') -- 多列对应多值
WHERE id = 1;

-- 方式2：子查询（适用于从其他表取数）
UPDATE users
SET (email, avatar) = (SELECT new_email, new_avatar FROM user_profiles WHERE user_id = 1)
WHERE id = 1;
```

##### （3）使用DEFAULT重置默认值

如果列定义了默认值（比如`created_at`默认是当前时间），可以用`DEFAULT`将其重置为默认值。
**示例**：重置用户的“最后登录时间”为当前时间（假设`last_login`的默认值是`CURRENT_TIMESTAMP`）：

```sql
UPDATE users
SET last_login = DEFAULT -- 用DEFAULT触发默认值
WHERE id = 1;
```

#### 2.2 WHERE子句：精准定位要修改的行

`WHERE`是`UPDATE`的“安全锁”——**没有`WHERE`的`UPDATE`会修改表中所有行**，这几乎是开发中的“致命操作”！
`WHERE`支持所有布尔表达式，比如：

- 等于（`id = 1`）；
- 范围（`age BETWEEN 18 AND 30`）；
- 模糊匹配（`email LIKE '%@example.com'`）；
- 子查询（`id IN (SELECT user_id FROM orders WHERE amount > 100)`）。

**示例**：修改“状态为未激活且30天未登录”的用户状态为“休眠”：

```sql
UPDATE users
SET status = 'dormant'
WHERE status = 'inactive' -- 条件1：未激活
  AND last_login < CURRENT_DATE - INTERVAL '30 days'; -- 条件2：30天未登录
```

#### 2.3 FROM子句：关联其他表更新

当需要**根据其他表的数据修改当前表**时，`FROM`子句就派上用场了——比如“根据订单表更新用户的总消费额”。
**语法**：`UPDATE 目标表 SET 列=值 FROM 关联表 WHERE 关联条件`。

**示例**：根据订单表`orders`更新用户表`users`的总消费额`total_spent`：

```sql
-- 用户表：users(id, total_spent)
-- 订单表：orders(user_id, amount)
UPDATE users u
SET total_spent = u.total_spent + o.amount -- 总消费增加订单金额
    FROM orders o  -- 关联订单表
WHERE u.id = o.user_id -- 关联条件：用户ID=订单的用户ID
  AND o.id = 123; -- 仅更新订单123对应的用户
```

#### 2.4 RETURNING子句：获取修改后的结果

`RETURNING`是PostgreSQL的扩展功能，用于**执行`UPDATE`后返回修改的行数据**，方便验证或后续处理（比如返回给前端）。
**语法**：`RETURNING *`（返回所有列）或`RETURNING 列1, 列2`（返回指定列）。

**示例**：修改用户密码并返回修改后的关键信息：

```sql
UPDATE users
SET password = 'hashed_new_pass' -- 假设密码已哈希
WHERE id = 1 RETURNING id, email, updated_at; -- 返回ID、邮箱、更新时间
```

执行后会返回类似`SELECT`的结果集，包含修改后的行数据：
| id | email | updated_at |
|----|----------------|---------------------|
| 1 | test@example.com | 2024-05-20 14:30:00 |

### 三、高级用法与最佳实践

#### 3.1 批量更新：避免全表锁的技巧

当需要更新**10万+行**时，直接`UPDATE`会导致**表级锁**，阻塞其他并发请求。解决方案是**分批更新**——用CTE（Common Table
Expression，公共表表达式）和`LIMIT`限制每次更新的行数。

**原理**：通过`ctid`（PostgreSQL的系统列，代表行的“物理地址”）快速定位行，每次更新小批量（比如1000行），减少锁的范围。
**示例**：分批修改“重试次数超过10次”的任务状态为“失败”：

```sql
WITH batch AS (SELECT ctid
               FROM work_items -- 选择要更新的行的物理地址
               WHERE status = 'active'
                 AND retries > 10
    LIMIT 1000 -- 每次更新1000行
    )
UPDATE work_items
SET status = 'failed' FROM batch
WHERE work_items.ctid = batch.ctid; -- 通过ctid关联
```

**执行方式**：重复运行此SQL，直到返回`UPDATE 0`（表示没有需要更新的行）。

#### 3.2 结合WITH子句：复杂逻辑的分步处理

`WITH`子句（也叫“CTE”）可以将复杂的更新逻辑拆分成多个“步骤”，提高可读性。比如“先计算每个用户的总订单金额，再更新用户表”。

**示例**：更新用户的总消费额（从订单表汇总）：

```sql
-- 第一步：计算每个用户的总订单金额（子查询）
WITH order_totals AS (SELECT user_id, SUM(amount) AS total
                      FROM orders
                      GROUP BY user_id)
-- 第二步：用子查询结果更新用户表
UPDATE users u
SET total_spent = ot.total -- 总消费=订单汇总金额
    FROM order_totals ot  -- 关联子查询结果
WHERE u.id = ot.user_id; -- 用户ID关联
```

#### 3.3 使用游标：逐行修改（适合存储过程）

在PL/pgSQL存储过程中，有时需要**逐行处理数据**（比如审核任务），这时可以用游标定位当前行，再用`WHERE CURRENT OF`修改。

**示例**：用游标修改“ Drama ”类型的电影为“ Dramatic ”：

```sql
BEGIN;
-- 1. 声明游标：指向所有Drama类型的电影
DECLARE
c_films CURSOR FOR
SELECT *
FROM films
WHERE kind = 'Drama';
-- 2. 打开游标
OPEN c_films;
-- 3. 逐行处理：修改当前游标指向的行
FETCH c_films INTO film_rec; -- 将当前行存入变量film_rec
UPDATE films
SET kind = 'Dramatic'
WHERE CURRENT OF c_films;
-- 修改当前行
-- 4. 关闭游标
CLOSE c_films;
COMMIT;
```

### 四、电商订单状态更新

**场景**：用户支付了订单（ID=123），需要做两件事：

1. 将订单状态从“unpaid”改为“paid”；
2. 将用户的总消费额增加订单金额。

**表结构**：

- `users`：`id`（用户ID）、`total_spent`（总消费，默认0）；
- `orders`：`id`（订单ID）、`user_id`（用户ID）、`amount`（金额）、`status`（状态）。

**实现代码**（用事务保证原子性）：

```sql
BEGIN;
-- 1. 更新订单状态（仅当状态是unpaid时）
UPDATE orders
SET status = 'paid'
WHERE id = 123
  AND status = 'unpaid';
-- 避免重复更新

-- 2. 更新用户总消费（从订单表取金额）
UPDATE users u
SET total_spent = u.total_spent + (SELECT amount FROM orders WHERE id = 123)
WHERE u.id = (SELECT user_id FROM orders WHERE id = 123); -- 关联用户ID

COMMIT; -- 提交事务，确保两步都成功
```

### 五、课后Quiz：

#### 问题1：如何修改`users`表中所有`email`结尾为`@old.com`的用户，将其`email`替换为`@new.com`，并返回修改后的`id`和`new_email`？

**答案**：使用`REPLACE`函数和`RETURNING`子句：

```sql
UPDATE users
SET email = REPLACE(email, '@old.com', '@new.com') -- 替换字符串
WHERE email LIKE '%@old.com' -- 匹配结尾为@old.com的邮箱
    RETURNING id, email AS new_email; -- 返回ID和新邮箱
```

**解析**：`REPLACE(str, old_sub, new_sub)`用于替换字符串中的子串；`LIKE '%@old.com'`匹配“以@old.com结尾”的邮箱；`RETURNING`
返回修改后的结果。

#### 问题2：为什么更新大量行时要分批处理？如何实现？

**答案**：

- **原因**：全表更新会导致**表级锁**，阻塞其他并发请求（比如用户查询），影响系统性能。
- **实现**：用CTE和`LIMIT`分批更新，每次更新小批量行（比如1000行）：

```sql
WITH batch AS (SELECT ctid
               FROM work_items -- 取行的物理地址
               WHERE status = 'active'
                 AND retries > 10
    LIMIT 1000 -- 每次更新1000行
    )
UPDATE work_items
SET status = 'failed' FROM batch
WHERE work_items.ctid = batch.ctid; -- 关联物理地址
```

**解析**：`ctid`是PostgreSQL的系统列，代表行的物理位置，快速定位行；`LIMIT`限制每次更新的行数，减少锁的范围。

### 六、常见报错与解决办法

#### 报错1：`ERROR:  syntax error at or near "FROM"`

- **原因**：`FROM`子句的位置错误（比如放在`SET`之前）。
- **解决**：`FROM`必须在`SET`之后、`WHERE`之前，正确语法：
  ```sql
  UPDATE users SET total_spent = 100 FROM orders WHERE users.id = orders.user_id;
  ```
- **预防**：严格按照`UPDATE`的语法顺序书写（参考官方文档的语法结构）。

#### 报错2：`ERROR:  duplicate key value violates unique constraint`

- **原因**：更新后的值违反了**唯一约束**（比如邮箱必须唯一，修改后的邮箱已存在）。
- **解决**：更新前验证唯一性，或用`NOT EXISTS`过滤重复值：
  ```sql
  UPDATE users 
  SET email = 'new@example.com' 
  WHERE id = 1 
    AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'new@example.com');  -- 确保新邮箱不存在
  ```
- **预防**：在更新前通过`SELECT`检查值是否唯一，或使用`UPSERT`（`INSERT ... ON CONFLICT UPDATE`）处理冲突。

#### 报错3：`ERROR:  column "users" of relation "users" does not exist`

- **原因**：在`SET`子句中**添加了表名前缀**（比如`SET users.email = 'new@example.com'`），PostgreSQL不允许。
- **解决**：去掉表名前缀，直接写列名：
  ```sql
  UPDATE users SET email = 'new@example.com' WHERE id = 1;
  ```
- **预防**：记住`SET`子句中的列名不需要表名——目标表已经在`UPDATE`后指定了。

### 参考链接

- PostgreSQL官方文档：`UPDATE`语句语法与用法：https://www.postgresql.org/docs/17/sql-update.html
- PostgreSQL官方文档：CTE（`WITH`子句）：https://www.postgresql.org/docs/17/queries-with.html
- PostgreSQL官方文档：游标使用：https://www.postgresql.org/docs/17/sql-declare.html

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[PostgreSQL UPDATE语句怎么玩？从改邮箱到批量更新的避坑技巧你都会吗？](https://blog.cmdragon.cn/posts/0f0622e9b7402b599e618150d0596ffe/)




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