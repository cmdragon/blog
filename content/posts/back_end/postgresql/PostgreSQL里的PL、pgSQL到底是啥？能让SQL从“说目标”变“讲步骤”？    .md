---
url: /posts/5c967e595058c4a1fc4474a68e64031d/
title: PostgreSQL里的PL/pgSQL到底是啥？能让SQL从“说目标”变“讲步骤”？
date: 2025-10-02T09:01:23+08:00
lastmod: 2025-10-02T09:01:23+08:00
author: cmdragon
cover: /images/077edb46078d4bcdac95b88720e8afd1~tplv-5jbd59dj06-image.png

summary:
  PL/pgSQL 是 PostgreSQL 的过程化 SQL 语言，结合了 SQL 的声明式语法和过程式控制结构，用于编写复杂的数据库逻辑。其基本结构包括函数和过程，支持变量声明、参数传递、动态 SQL、条件判断、循环以及错误处理。通过 PL/pgSQL，用户可以实现计算、批量操作、事务控制等功能。函数通过 `SELECT` 调用，过程通过 `CALL` 调用，且过程支持显式事务控制。动态 SQL 需使用 `EXECUTE` 和 `USING` 避免 SQL 注入。

categories:
  - postgresql

tags:
  - 基础入门
  - PL/pgSQL
  - 存储过程
  - 数据库编程
  - 动态SQL
  - 事务管理
  - 错误处理

---

<img src="/images/077edb46078d4bcdac95b88720e8afd1~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### PL/pgSQL 是什么？

PL/pgSQL 是 PostgreSQL 自带的**过程化SQL语言**（Procedural Language/PostgreSQL Structured Query Language），它将 SQL 的*
*声明式语法**（比如 SELECT、INSERT）与**过程式控制结构**（比如条件判断、循环、错误处理）结合，让你能编写更复杂的数据库逻辑——比如计算、批量操作、事务控制等。

简单来说，SQL 是“做什么”，PL/pgSQL 是“怎么一步步做”。比如：用 SQL 可以查“用户表有多少人”，用 PL/pgSQL
可以写一个函数，先查数量，再根据数量发送通知，最后返回结果。

### PL/pgSQL 函数的基本结构

在 PostgreSQL 中，**存储过程**通常以**函数（FUNCTION）**或**过程（PROCEDURE）**的形式存在。我们先从最基础的**函数**讲起，它的核心结构是：

```sql
CREATE
OR REPLACE FUNCTION 函数名(参数列表)
RETURNS 返回类型 AS $$  -- $$ 是字符串分隔符（代替单引号）
DECLARE
    -- 变量声明（可选）
BEGIN
    -- 逻辑代码（必须）
EXCEPTION
    -- 错误处理（可选）
END;
$$
LANGUAGE plpgsql;  -- 指定语言为PL/pgSQL
```

#### 示例：一个简单的加法函数

我们写一个计算两个整数之和的函数：

```sql
-- 创建函数：计算两数之和
CREATE
OR REPLACE FUNCTION add_two_numbers(
    a INT,  -- 输入参数：整数a
    b INT   -- 输入参数：整数b
)
RETURNS INT AS $$
BEGIN
RETURN a + b; -- 返回结果
END;
$$
LANGUAGE plpgsql;

-- 调用函数：用SELECT获取返回值
SELECT add_two_numbers(3, 5); -- 结果：8
```

**关键点**：

- `CREATE OR REPLACE`：如果函数已存在，替换它（避免重复删除重建）；
- `RETURNS INT`：指定函数返回整数；
- `$$ ... $$`：是**美元引号**，用于包裹PL/pgSQL代码（避免与SQL中的单引号冲突）；
- 调用函数用`SELECT`（因为函数有返回值）。

### 变量与参数声明

PL/pgSQL 允许你声明**变量**（存储中间结果）和**参数**（接收外部输入），常见类型包括：

#### 1. 参数类型

参数支持 `IN`（默认，输入）、`OUT`（输出）、`INOUT`（既输入又输出）三种模式：

```sql
-- 示例：计算两数之和与乘积（INOUT参数）
CREATE
OR REPLACE FUNCTION calc_sum_product(
    IN a INT,
    IN b INT,
    OUT sum INT,
    OUT product INT
) AS $$
BEGIN
sum := a + b;       -- 赋值给OUT参数sum
    product
:= a * b;   -- 赋值给OUT参数product
END;
$$
LANGUAGE plpgsql;

-- 调用：获取多个返回值
SELECT *
FROM calc_sum_product(3, 5); -- 结果：sum=8, product=15
```

#### 2. 变量声明

用 `DECLARE` 块声明变量，支持：

- **基本类型**（如 `INT`、`TEXT`、`NUMERIC`）；
- **表行类型**（`%ROWTYPE`，对应表的一行数据）；
- **记录类型**（`RECORD`，动态存储一行数据，无固定结构）；
- **引用类型**（`%TYPE`，继承列或变量的类型）。

**示例**：

```sql
CREATE
OR REPLACE FUNCTION get_user_info(
    user_id INT
) RETURNS TEXT AS $$
DECLARE
v_user users%ROWTYPE;  -- 行类型变量：对应users表的一行
    v_age
INT;             -- 基本类型变量
BEGIN
    -- 查询用户信息存入v_user
SELECT *
INTO v_user
FROM users
WHERE id = user_id;

-- 计算年龄（假设users表有birth_year列）
v_age
:= EXTRACT(YEAR FROM CURRENT_DATE) - v_user.birth_year;
    
    -- 返回用户信息
RETURN 'User: ' || v_user.name || ', Age: ' || v_age;
END;
$$
LANGUAGE plpgsql;
```

**关键点**：

- `%ROWTYPE`：确保变量结构与表一致（表结构变化时，变量自动同步）；
- `:=`：是PL/pgSQL的**赋值运算符**（代替SQL的`=`）；
- `||`：字符串拼接运算符（类似Java的`+`）。

### 基本语句与动态SQL

PL/pgSQL 的核心是**执行SQL语句**和**处理结果**，常见操作包括：

#### 1. 直接执行SQL

如果SQL语句是固定的，可以直接写在`BEGIN...END`中：

```sql
-- 示例：插入用户并返回ID
CREATE
OR REPLACE FUNCTION insert_user(
    user_name TEXT,
    user_age INT
) RETURNS INT AS $$
DECLARE
new_user_id INT;
BEGIN
INSERT INTO users (name, age)
VALUES (user_name, user_age) RETURNING id
INTO new_user_id; -- 将插入的ID存入变量

RETURN new_user_id;
END;
$$
LANGUAGE plpgsql;
```

**关键点**：`RETURNING ... INTO`：将INSERT/UPDATE/DELETE的结果存入变量。

#### 2. 动态SQL（处理可变SQL）

如果SQL语句是动态的（比如表名或条件由参数决定），需要用 `EXECUTE` 语句，**必须结合`USING`绑定参数**（避免SQL注入）：

```sql
-- 示例：动态查询表的行数
CREATE
OR REPLACE FUNCTION get_table_row_count(
    table_name TEXT
) RETURNS BIGINT AS $$
DECLARE
row_count BIGINT;
BEGIN
    -- 动态执行SQL：用$1占位符，USING传递参数
EXECUTE 'SELECT COUNT(*) FROM ' || quote_ident(table_name)
    INTO row_count;

RETURN row_count;
END;
$$
LANGUAGE plpgsql;

-- 调用：查询users表的行数
SELECT get_table_row_count('users'); -- 结果：100（假设）
```

**关键点**：

- `quote_ident(table_name)`：将表名转义（避免表名包含特殊字符，比如`user`是关键字）；
- `EXECUTE 'SQL' USING 参数`：绑定参数（`$1`对应第一个参数，`$2`对应第二个，依此类推）；
- 动态SQL必须用`EXECUTE`，否则PL/pgSQL会提前解析SQL（导致表名未找到错误）。

### 控制结构：条件与循环

PL/pgSQL 支持**过程式控制结构**，让你能根据条件分支或重复执行代码。

#### 1. 条件判断（IF...THEN...ELSE）

```sql
-- 示例：判断用户年龄阶段
CREATE
OR REPLACE FUNCTION get_age_group(
    user_age INT
) RETURNS TEXT AS $$
BEGIN
    IF
user_age < 18 THEN
        RETURN 'Minor';
    ELSIF
user_age BETWEEN 18 AND 60 THEN
        RETURN 'Adult';
ELSE
        RETURN 'Senior';
END IF;
END;
$$
LANGUAGE plpgsql;

-- 调用：
SELECT get_age_group(25); -- 结果：Adult
```

#### 2. 循环（LOOP/WHILE/FOR）

**(1) 简单循环（LOOP）**：用`EXIT`退出循环：

```sql
-- 示例：计算1到n的和
CREATE
OR REPLACE FUNCTION sum_from_1_to_n(
    n INT
) RETURNS INT AS $$
DECLARE
total INT := 0;
    i
INT := 1;
BEGIN
    LOOP
total := total + i;
        i
:= i + 1;
        EXIT
WHEN i > n;  -- 当i超过n时退出循环
END LOOP;
RETURN total;
END;
$$
LANGUAGE plpgsql;
```

**(2) 遍历查询结果（FOR循环）**：最常用的循环方式，直接遍历SQL查询的结果集：

```sql
-- 示例：批量更新用户年龄（增加1岁）
CREATE
OR REPLACE FUNCTION increment_all_ages() RETURNS VOID AS $$
DECLARE
user_rec users%ROWTYPE;  -- 行类型变量，存储每个用户的信息
BEGIN
    -- 遍历users表的所有记录
FOR user_rec IN
SELECT *
FROM users LOOP
UPDATE users
SET age = user_rec.age + 1
WHERE id = user_rec.id;
END LOOP;
END;
$$
LANGUAGE plpgsql;

-- 调用（无返回值，用SELECT）：
SELECT increment_all_ages();
```

### 错误处理与事务管理

#### 1. 错误捕获（EXCEPTION块）

用 `EXCEPTION` 块捕获并处理错误（比如除以零、主键冲突）：

```sql
-- 示例：处理除以零的错误
CREATE
OR REPLACE FUNCTION safe_divide(
    numerator NUMERIC,
    denominator NUMERIC
) RETURNS NUMERIC AS $$
BEGIN
RETURN numerator / denominator;
EXCEPTION
    WHEN division_by_zero THEN  -- 捕获除以零的错误
        RAISE NOTICE 'Cannot divide by zero! Returning 0.';  -- 发送通知
RETURN 0; -- 返回默认值
WHEN OTHERS THEN  -- 捕获其他所有错误
        RAISE EXCEPTION 'Unexpected error: %', SQLERRM;  -- 重新抛出错误
END;
$$
LANGUAGE plpgsql;

-- 调用：
SELECT safe_divide(10, 0); -- 结果：0，控制台输出NOTICE
```

**关键点**：

- `RAISE NOTICE`：输出调试信息（不会中断执行）；
- `RAISE EXCEPTION`：抛出错误（中断执行）；
- `SQLERRM`：返回错误信息（比如“division by zero”）。

#### 2. 事务控制（过程PROCEDURE）

PostgreSQL 11 引入了**过程（PROCEDURE）**，它与函数的核心区别是：

- 过程可以**显式控制事务**（执行`COMMIT`/`ROLLBACK`）；
- 过程用`CALL`命令调用（不是`SELECT`）；
- 过程可以没有返回值。

**示例：批量插入用户并处理事务**

```sql
-- 创建过程：批量插入用户，失败则回滚
CREATE
OR REPLACE PROCEDURE batch_insert_users(
    user_list JSONB[]  -- 输入参数：JSON数组，每个元素是用户信息
) LANGUAGE plpgsql AS $$
BEGIN
    -- 开始事务（可选，PostgreSQL自动开启）
FOR i IN 1..array_length(user_list, 1) LOOP
        INSERT INTO users (name, age)
        VALUES (
            user_list[i]->>'name',  -- 取JSON中的name字段
            (user_list[i]->>'age')::INT  -- 转换为整数
        );
END LOOP;
COMMIT; -- 提交事务
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;  -- 回滚事务
        RAISE
EXCEPTION 'Batch insert failed: %', SQLERRM;  -- 抛出错误
END;
$$;

-- 调用过程：
CALL batch_insert_users(
    ARRAY[
        '{"name":"Alice","age":30}'::JSONB,
        '{"name":"Bob","age":25}'::JSONB
    ]
);
```

**关键点**：

- 过程用`CREATE PROCEDURE`创建；
- 输入参数`JSONB[]`：JSON数组（适合批量数据）；
- `array_length(user_list, 1)`：获取JSON数组的长度；
- `EXCEPTION`块中`ROLLBACK`：如果插入失败，回滚所有操作。

### 课后 Quiz

#### 问题1：如何在PL/pgSQL中避免动态SQL的注入问题？

**答案**：使用`EXECUTE`语句结合`USING`子句绑定参数，而非直接拼接字符串。例如：

```sql
EXECUTE 'SELECT * FROM users WHERE name = $1' USING user_name;
```

`$1`是占位符，`USING`传递的参数会被PostgreSQL自动转义，彻底避免SQL注入。

#### 问题2：PostgreSQL中的函数（FUNCTION）和过程（PROCEDURE）有什么核心区别？

**答案**：

1. **事务控制**：过程可以显式执行`COMMIT`/`ROLLBACK`，函数不能（默认运行在事务块中）；
2. **调用方式**：过程用`CALL`调用，函数用`SELECT`调用；
3. **返回值**：函数必须有返回值（除非`RETURNS VOID`），过程可以没有；
4. **用途**：过程适合批量操作或需要事务的任务（比如数据迁移），函数适合计算或返回结果（比如统计）。

### 常见报错与解决方案

#### 1. 报错：`ERROR: syntax error at or near "END"`

**原因**：`BEGIN...END`块中的语句缺少分号，或`END`后面没有分号。  
**解决**：检查每个语句末尾的分号，确保`END;`后面有分号。例如：

```sql
-- 错误写法：
BEGIN
RETURN 1 -- 缺少分号
END  -- 缺少分号

-- 正确写法：
BEGIN
RETURN 1;
END;
```

#### 2. 报错：`ERROR: column "v_name" does not exist`

**原因**：变量名与表的列名冲突（PL/pgSQL优先解析为列名）。  
**解决**：

- 给变量加前缀（比如`v_name`代替`name`）；
- 使用`%ROWTYPE`或`%TYPE`声明变量时，确保表结构正确；
- 在查询中用别名区分：`SELECT name INTO v_name FROM users WHERE id = 1;`。

#### 3. 报错：`ERROR: query has no destination for result data`

**原因**：函数中执行了返回结果集的`SELECT`，但没有将结果存入变量或返回。  
**解决**：

- 将结果存入变量：`SELECT COUNT(*) INTO v_count FROM users;`；
- 如果要返回结果集，定义函数为`RETURNS TABLE(...)`或`RETURNS SETOF ...`，并用`RETURN QUERY`返回结果：
  ```sql
  CREATE OR REPLACE FUNCTION get_all_users()
  RETURNS TABLE(name TEXT, age INT) AS $$
  BEGIN
      RETURN QUERY SELECT name, age FROM users;  -- 返回结果集
  END;
  $$ LANGUAGE plpgsql;
  ```

### 参考链接

1. PostgreSQL PL/pgSQL官方文档：https://www.postgresql.org/docs/17/plpgsql.html
2.
PL/pgSQL函数与过程：https://www.postgresql.org/docs/17/sql-createfunction.html、https://www.postgresql.org/docs/17/sql-createprocedure.html
3. PL/pgSQL错误处理：https://www.postgresql.org/docs/17/plpgsql-errors-and-messages.html

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[PostgreSQL里的PL/pgSQL到底是啥？能让SQL从“说目标”变“讲步骤”？](https://blog.cmdragon.cn/posts/5c967e595058c4a1fc4474a68e64031d/)


<details>
<summary>往期文章归档</summary>

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
- [如何在FastAPI中巧妙实现延迟队列，让任务乖乖等待？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/174450702d9e609a072a7d1aaa84750b/)
- [FastAPI的死信队列处理机制：为何你的消息系统需要它？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/047b08957a0d617a87b72da6c3131e5d/)
- [如何让FastAPI任务系统在失败时自动告警并自我修复？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/2f104637ecc916e906c002fa79ab8c80/)
- [如何用Prometheus和FastAPI打造任务监控的“火眼金睛”？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/e7464e5b4d558ede1a7413fa0a2f96f3/)

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