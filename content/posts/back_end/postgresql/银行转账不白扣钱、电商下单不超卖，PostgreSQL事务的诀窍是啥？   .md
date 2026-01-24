---
url: /posts/e463e8a2668abdf00a228c9b79324ded/
title: 银行转账不白扣钱、电商下单不超卖，PostgreSQL事务的诀窍是啥？
date: 2025-10-03T02:02:14+08:00
lastmod: 2025-10-03T02:02:14+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/40025327bd594a968ab73d2889949482~tplv-5jbd59dj06-image.png

summary:
  事务是数据库中不可分割的工作单元，确保多个SQL操作要么全部成功，要么全部回滚。事务的可靠性由ACID四大特性保障：原子性、一致性、隔离性和持久性。PostgreSQL通过BEGIN、COMMIT和ROLLBACK语句控制事务生命周期，并支持四种隔离级别（读未提交、读已提交、可重复读和串行化）来解决并发冲突。保存点允许事务部分回滚，适用于复杂操作和批量处理。事务管理在电商下单等场景中尤为重要，确保多个操作要么全部成功，要么全部回滚。

categories:
  - postgresql

tags:
  - 基础入门
  - 事务基础
  - ACID属性
  - 事务隔离级别
  - 保存点
  - 事务管理实践
  - 常见报错及解决方案

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/40025327bd594a968ab73d2889949482~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 1. 事务的基础概念

### 1.1 什么是事务？

事务是数据库中**不可分割的工作单元**——它将多个SQL操作（如插入、更新、删除）打包成一个整体，确保这些操作要么**全部成功执行**
，要么**全部回滚到初始状态**。  
举个生活中的例子：银行转账时，“从A账户扣100元”和“向B账户加100元”必须同时完成。如果扣了A的钱但加B的钱失败（比如B账户不存在），整个操作必须回滚——A的钱不能白扣，这就是事务的核心作用。

### 1.2 事务的ACID属性

事务的可靠性由**ACID**四大特性保障，这是数据库设计的基石：

- **原子性（Atomicity）**：事务是“原子”的——要么全做，要么全不做。比如转账中，扣钱和加钱是一个原子操作，不会出现“只扣不加”的情况。
- **一致性（Consistency）**：事务执行前后，数据库状态必须符合**业务规则**
  。比如转账前A有200元、B有300元（总500元），转账后A有100元、B有400元（总仍500元），保持“总金额不变”的一致性。
- **隔离性（Isolation）**：多个事务并发执行时，互不干扰。比如事务1在修改A的账户时，事务2不能同时修改A的账户（具体隔离程度取决于
  **隔离级别**）。
- **持久性（Durability）**：事务提交后，修改会**永久保存**到数据库（写入磁盘），即使系统崩溃也不会丢失。比如转账提交后，A和B的余额变化不会因为服务器重启而消失。

## 2. 事务的控制语句

PostgreSQL通过3个核心语句控制事务生命周期，语法简单且直观。

### 2.1 启动事务：BEGIN/START TRANSACTION

用`BEGIN`或`START TRANSACTION`标记事务的开始（两者等价）。  
**例子**：

```sql
-- 启动一个事务
BEGIN;
-- 或 START TRANSACTION;
```

### 2.2 提交事务：COMMIT

用`COMMIT`确认事务中的所有操作，将修改**持久化**到数据库。  
**例子（银行转账）**：

```sql
BEGIN;
-- 从A账户扣100元
UPDATE accounts
SET balance = balance - 100
WHERE id = 1;
-- 向B账户加100元
UPDATE accounts
SET balance = balance + 100
WHERE id = 2;
-- 提交事务（修改生效）
COMMIT;
```

### 2.3 回滚事务：ROLLBACK

用`ROLLBACK`撤销事务中的所有操作，回到事务开始前的状态。  
**例子（转账失败回滚）**：

```sql
BEGIN;
UPDATE accounts
SET balance = balance - 100
WHERE id = 1;
-- 假设B账户不存在，执行失败
UPDATE accounts
SET balance = balance + 100
WHERE id = 999;
-- 无此记录
-- 回滚事务（A的钱恢复）
ROLLBACK;
```

## 3. 事务隔离级别：解决并发冲突

### 3.1 隔离级别的作用

当多个事务**同时执行**时，会出现以下问题：

- **脏读（Dirty Read）**：读到其他事务**未提交**的修改（比如看到别人“未最终确认”的转账）。
- **不可重复读（Non-repeatable Read）**：同一事务中多次读同一数据，结果不同（比如第一次读A有200元，第二次读变成100元）。
- **幻读（Phantom Read）**：同一事务中多次查询，结果集**行数不同**（比如第一次查有10条订单，第二次查变成11条）。

隔离级别就是用来**控制这些问题的严重程度**——级别越高，隔离性越好，但性能越低（因为要排队执行）。

### 3.2 PostgreSQL支持的隔离级别

PostgreSQL支持4个标准隔离级别，**默认是“读已提交”**：
| 隔离级别 | 避免脏读？ | 避免不可重复读？ | 避免幻读？ | 性能 | 适用场景 |
|-------------------|------------|--------------------|------------|------|------------------------|
| 读未提交（Read Uncommitted） | ✅（实际等价读已提交） | ❌ | ❌ | 最高 | 几乎不用（PostgreSQL中无意义） |
| 读已提交（Read Committed） | ✅ | ❌ | ❌ | 高 | 大多数OLTP场景（如电商、支付） |
| 可重复读（Repeatable Read） | ✅ | ✅ | ✅ | 中 | 报表、数据分析（需要一致结果） |
| 串行化（Serializable） | ✅ | ✅ | ✅ | 最低 | 严格一致性场景（如金融清算） |

#### 3.2.1 读未提交（Read Uncommitted）

理论上允许脏读，但**PostgreSQL中这个级别和“读已提交”完全一样**
——PostgreSQL不会让你读到未提交的修改（官网明确说明）。所以这个级别在PostgreSQL中是“摆设”，不用关注。

#### 3.2.2 读已提交（Read Committed，默认）

只能读到**已提交**的修改，是最常用的级别。  
**例子**：

- 事务1：修改A的余额为100元，但未提交。
- 事务2：读A的余额，看到的还是原来的200元。
- 事务1提交后，事务2再读A的余额，才会看到100元。

#### 3.2.3 可重复读（Repeatable Read）

同一事务中**多次读同一数据，结果完全一致**，即使其他事务修改并提交了该数据。  
**例子**：

- 事务1（可重复读）：读A的余额是200元。
- 事务2：修改A的余额为100元，提交。
- 事务1再读A的余额，**还是200元**（直到事务1提交，才会看到最新值）。

#### 3.2.4 串行化（Serializable）

最高级别，**完全隔离**——事务像“排队”一样执行，避免所有并发问题，但性能最低。  
**例子**：

- 事务1（串行化）：修改A的余额。
- 事务2（串行化）：同时修改A的余额，会被PostgreSQL**终止**（报错“could not serialize access due to concurrent
  update”），确保只有一个事务能修改。

### 3.3 如何设置隔离级别

可以在**启动事务时指定隔离级别**，语法：

```sql
-- 方式1：启动事务时指定
BEGIN
TRANSACTION ISOLATION LEVEL 隔离级别;

-- 方式2：事务中动态修改（不推荐，容易混乱）
SET TRANSACTION ISOLATION LEVEL 隔离级别;
```

**例子**：启动一个“可重复读”事务：

```sql
BEGIN
TRANSACTION ISOLATION LEVEL REPEATABLE READ;
-- 后续操作...
COMMIT;
```

## 4. 保存点：灵活控制事务回滚

### 4.1 保存点的基本用法

保存点（Savepoint）是事务中的**“中间 checkpoint”**——可以回滚到某个保存点，而不是整个事务。  
语法：

- `SAVEPOINT 保存点名称`：设置保存点。
- `ROLLBACK TO 保存点名称`：回滚到保存点（保存点之前的操作保留，之后的操作撤销）。
- `RELEASE SAVEPOINT 保存点名称`：删除保存点（可选）。

**例子**：复杂事务中的部分回滚：

```sql
BEGIN;
-- 步骤1：扣减库存（成功）
UPDATE products
SET stock = stock - 1
WHERE id = 100;
-- 设置保存点sp1
SAVEPOINT sp1;
-- 步骤2：创建订单（失败，比如用户ID错误）
INSERT INTO orders (user_id, product_id)
VALUES (999, 100);
-- 无此用户
-- 回滚到sp1（步骤2撤销，但步骤1保留）
ROLLBACK TO sp1;
-- 修正步骤2：用正确的用户ID
INSERT INTO orders (user_id, product_id)
VALUES (1, 100);
-- 提交事务（步骤1和修正后的步骤2生效）
COMMIT;
```

### 4.2 保存点的实践场景

- **复杂表单提交**：比如用户填写多步表单（个人信息→地址→支付），每步设置保存点，某步出错时回滚到该步，不用重新填写所有内容。
- **批量操作**：比如导入1000条数据，每100条设置一个保存点，某批出错时回滚到该批的起点，重新导入。

## 5. 事务管理实践：电商下单案例

### 5.1 场景需求

电商下单需要完成3个操作：

1. 扣减商品库存（确保有货）；
2. 创建订单记录；
3. 扣减用户余额（支付）。

这3个操作必须**全部成功**，否则全部回滚（比如库存不足时，不能创建订单；余额不足时，不能扣库存）。

### 5.2 事务实现代码

首先创建表并插入测试数据：

```sql
-- 商品表（库存）
CREATE TABLE products
(
    id    INT PRIMARY KEY,
    name  VARCHAR(100),
    stock INT CHECK (stock >= 0) -- 库存不能为负
);
-- 订单表
CREATE TABLE orders
(
    id          SERIAL PRIMARY KEY,                 -- 自增ID
    user_id     INT,
    product_id  INT,
    quantity    INT,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 下单时间
);
-- 用户表（余额）
CREATE TABLE users
(
    id      INT PRIMARY KEY,
    name    VARCHAR(100),
    balance NUMERIC(10, 2) CHECK (balance >= 0) -- 余额不能为负
);

-- 插入测试数据：商品ID100有10件库存，用户ID1有5000元余额
INSERT INTO products
VALUES (100, '笔记本电脑', 10);
INSERT INTO users
VALUES (1, '张三', 5000.00);
```

然后用**PL/pgSQL（PostgreSQL的存储过程语言）**实现事务（带异常处理）：

```sql
CREATE
OR REPLACE FUNCTION place_order(
    p_user_id INT,    -- 用户ID
    p_product_id INT, -- 商品ID
    p_quantity INT    -- 购买数量
) RETURNS VARCHAR AS $$
BEGIN
    -- 启动事务（默认读已提交）
BEGIN
TRANSACTION;

    -- 1. 扣减库存（检查库存是否足够）
UPDATE products
SET stock = stock - p_quantity
WHERE id = p_product_id
  AND stock >= p_quantity;
-- 如果更新行数为0（库存不足），抛出异常
IF
NOT FOUND THEN
        ROLLBACK;
RETURN '库存不足';
END IF;

    -- 2. 创建订单
INSERT INTO orders (user_id, product_id, quantity)
VALUES (p_user_id, p_product_id, p_quantity);

-- 3. 扣减用户余额（假设商品单价5000元）
UPDATE users
SET balance = balance - (5000.00 * p_quantity)
WHERE id = p_user_id
  AND balance >= (5000.00 * p_quantity);
-- 如果更新行数为0（余额不足），抛出异常
IF
NOT FOUND THEN
        ROLLBACK;
RETURN '余额不足';
END IF;

    -- 提交事务（所有操作生效）
COMMIT;
RETURN '下单成功';

-- 捕获所有异常，回滚事务
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
RETURN '下单失败：' || SQLERRM; -- 返回错误信息
END;
$$
LANGUAGE plpgsql;
```

### 5.3 调用与测试

```sql
-- 测试1：正常下单（库存10→9，余额5000→0）
SELECT place_order(1, 100, 1);
-- 返回“下单成功”

-- 测试2：库存不足（库存9→8？不，购买2件的话库存只有9，不够）
SELECT place_order(1, 100, 2);
-- 返回“库存不足”

-- 测试3：余额不足（余额0，再买1件需要5000元）
SELECT place_order(1, 100, 1); -- 返回“余额不足”
```

## 6. 课后Quiz：巩固事务知识

### 6.1 问题1：如何启动一个“可重复读”隔离级别的事务？

答案：`BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;`  
解析：PostgreSQL中可以在启动事务时直接指定隔离级别，语法是`BEGIN TRANSACTION ISOLATION LEVEL [级别名称]`。

### 6.2 问题2：保存点和事务回滚（ROLLBACK）的区别是什么？

答案：

- `ROLLBACK`：回滚**整个事务**，所有操作都撤销。
- `ROLLBACK TO [保存点]`：只回滚到**保存点之后的操作**，保存点之前的操作保留。  
  例子：事务中有`SAVEPOINT sp1`，`ROLLBACK TO sp1`会撤销sp1之后的操作，但sp1之前的操作仍然有效。

### 6.3 问题3：PostgreSQL默认的事务隔离级别是什么？如何查看当前隔离级别？

答案：

- 默认是**读已提交（Read Committed）**。
- 查看当前隔离级别：`SHOW transaction_isolation;`（返回`read committed`）。

## 7. 常见报错及解决方案

### 7.1 报错1：ERROR: current transaction is aborted, commands ignored until end of transaction block

**原因**：事务中的某条语句失败（比如违反约束、语法错误），导致事务进入“aborted”状态（报废），后续语句会被忽略。  
**例子**：

```sql
BEGIN;
-- 违反CHECK约束（stock不能为负）
UPDATE products
SET stock = -1
WHERE id = 100;
-- 报错
-- 后续语句会被忽略
INSERT INTO orders...; -- 报错“current transaction is aborted”
```

**解决**：执行`ROLLBACK`回滚事务，然后重新执行正确的语句。  
**预防**：用PL/pgSQL的`EXCEPTION`块捕获错误，自动回滚（如5.2中的例子）。

### 7.2 报错2：ERROR: cannot BEGIN/COMMIT inside a transaction block

**原因**：已经处于一个事务中，又执行了`BEGIN`或`COMMIT`（嵌套事务）。  
**例子**：

```sql
BEGIN; -- 启动事务
UPDATE products...;
BEGIN; -- 错误：已经在事务中
```

**解决**：检查事务控制语句的顺序，确保每个`BEGIN`对应一个`COMMIT`或`ROLLBACK`，不要嵌套。  
**预防**：执行`BEGIN`前，用`SELECT pg_transaction_status();`查看当前事务状态——返回`idle`表示没有活跃事务。

### 7.3 报错3：ERROR: could not serialize access due to concurrent update

**原因**：在**串行化（Serializable）**隔离级别下，两个事务并发修改同一数据，PostgreSQL为了保证串行化，终止其中一个事务。  
**例子**：

- 事务1：`BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE; UPDATE products SET stock = 9 WHERE id = 100;`
- 事务2：`BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE; UPDATE products SET stock = 8 WHERE id = 100;`
- 事务2会报错“could not serialize access due to concurrent update”。

**解决**：捕获这个错误，**重试被终止的事务**（比如在应用层加重试逻辑）。  
**预防**：如果经常出现这个错误，可以降低隔离级别到“可重复读”（大多数场景不需要串行化）。

## 参考链接

- PostgreSQL事务基础：https://www.postgresql.org/docs/17/tutorial-transactions.html
- 事务隔离级别：https://www.postgresql.org/docs/17/transaction-iso.html
- 保存点：https://www.postgresql.org/docs/17/sql-savepoint.html
- 事务状态查询：https://www.postgresql.org/docs/17/functions-info.html#FUNCTIONS-INFO-SESSION-TABLE

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[银行转账不白扣钱、电商下单不超卖，PostgreSQL事务的诀窍是啥？](https://blog.cmdragon.cn/posts/e463e8a2668abdf00a228c9b79324ded/)



<details>
<summary>往期文章归档</summary>

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
- [如何在FastAPI中巧妙实现延迟队列，让任务乖乖等待？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/174450702d9e609a072a7d1aaa84750b/)
- [FastAPI的死信队列处理机制：为何你的消息系统需要它？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/047b08957a0d617a87b72da6c3131e5d/)
- [如何让FastAPI任务系统在失败时自动告警并自我修复？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/2f104637ecc916e906c002fa79ab8c80/)

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