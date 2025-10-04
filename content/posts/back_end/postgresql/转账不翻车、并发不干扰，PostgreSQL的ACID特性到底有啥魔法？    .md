---
url: /posts/de3672803de34dbad244d0a8d48b0eb5/
title: 转账不翻车、并发不干扰，PostgreSQL的ACID特性到底有啥魔法？
date: 2025-10-04T04:57:25+08:00
lastmod: 2025-10-04T04:57:25+08:00
author: cmdragon
cover: /images/cb91fc57e9f54d70a3caec4aaa43e329~tplv-5jbd59dj06-image.png

summary:
  ACID是数据库事务的四个核心特性，包括原子性、一致性、隔离性和持久性。原子性确保事务要么完全执行，要么完全不执行；一致性保证事务执行前后数据库处于合法状态；隔离性确保并发事务互不干扰；持久性保证事务提交后修改永久保存。PostgreSQL通过事务日志、MVCC和锁机制等技术实现ACID特性，确保数据可靠性和一致性。

categories:
  - postgresql

tags:
  - 基础入门
  - ACID
  - 数据库事务
  - 原子性
  - 一致性
  - 隔离性
  - 持久性

---

<img src="/images/cb91fc57e9f54d70a3caec4aaa43e329~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 1. 什么是ACID？

ACID是数据库事务的四个核心特性，是保证数据可靠性和一致性的基石。这四个字母分别代表：

- **原子性（Atomicity）**：事务是“不可分割的最小单位”，要么完全执行（Commit），要么完全不执行（Rollback）；
- **一致性（Consistency）**：事务执行前后，数据库始终处于“合法状态”（满足所有约束条件）；
- **隔离性（Isolation）**：多个并发事务之间“互不干扰”，每个事务都像独自在数据库中运行；
- **持久性（Durability）**：事务提交后，修改会**永久保存**，即使系统崩溃也不会丢失。

PostgreSQL作为关系型数据库的佼佼者，通过**事务日志（WAL）**、**MVCC（多版本并发控制）**、**锁机制**等技术，完整实现了ACID特性。

### 2. 原子性：要么全做，要么全不做

原子性是事务的“灵魂”——它保证了复杂操作的“整体性”。比如转账业务中，“扣减A账户余额”和“增加B账户余额”必须同时成功或同时失败，不能出现“钱扣了但没到账”的情况。

#### 2.1 事务的开始与结束

PostgreSQL中，事务通过`BEGIN`（或`START TRANSACTION`）开启，`COMMIT`提交（确认修改），`ROLLBACK`回滚（撤销所有修改）：

```sql
-- 开启事务
BEGIN;
-- 执行操作：扣减A账户200元
UPDATE accounts
SET balance = balance - 200
WHERE id = 1;
-- 执行操作：增加B账户200元
UPDATE accounts
SET balance = balance + 200
WHERE id = 2;
-- 提交事务（修改生效）
COMMIT;
```

如果中间任何一步出错（比如B账户不存在），PostgreSQL会自动回滚整个事务，所有修改都会被撤销。

#### 2.2 回滚与保存点（Savepoint）

当事务需要“部分回滚”时，可以用**保存点（Savepoint）**。比如，在一个长事务中，你可能想尝试某个操作，失败后只回滚该操作，而保留之前的修改：

```sql
BEGIN;
-- 第一步：扣减A账户200元（成功）
UPDATE accounts
SET balance = balance - 200
WHERE id = 1;
-- 创建保存点sp1
SAVEPOINT sp1;
-- 第二步：尝试给C账户转200元（失败，C账户不存在）
UPDATE accounts
SET balance = balance + 200
WHERE id = 3;
-- 回滚到保存点sp1（仅撤销第二步）
ROLLBACK TO sp1;
-- 调整操作：给B账户转200元（成功）
UPDATE accounts
SET balance = balance + 200
WHERE id = 2;
-- 提交事务（最终A扣200，B加200）
COMMIT;
```

保存点的作用是将原子性“细分”，但整个事务依然保持原子性——只有`COMMIT`后，所有修改才会永久生效。

### 2. 一致性：从“合法状态”到“合法状态”

一致性是指**事务执行前后，数据库必须满足所有“数据完整性约束”**。这些约束包括：

- **主键约束（Primary Key）**：确保每行数据的唯一性；
- **外键约束（Foreign Key）**：确保关联表的数据一致性（比如订单表的`user_id`必须存在于用户表）；
- **Check约束**：确保字段值符合自定义规则（比如`balance >= 0`）；
- **非空约束（NOT NULL）**：确保字段不存空值。

#### 2.1 约束的“强制检查”

PostgreSQL会在事务执行**每个修改操作**时自动检查约束。比如，当你尝试插入一条`balance=-100`的记录时：

```sql
-- 尝试插入非法数据（balance为负）
INSERT INTO accounts (user_id, balance)
VALUES (3, -100);
```

PostgreSQL会立即抛出错误：

```
ERROR:  check constraint "accounts_balance_check" violated by row
```

此时事务会进入“终止状态”，必须通过`ROLLBACK`撤销所有修改，才能继续操作。

#### 2.2 一致性的“双重保障”

一致性是**应用层+数据库层**共同作用的结果：

- 应用层：在数据进入数据库前，先验证合法性（比如前端检查“转账金额不能为负”）；
- 数据库层：通过约束强制拦截非法数据，避免“脏数据”进入系统。

### 3. 隔离性：并发事务的“互不干扰”

当多个用户同时操作数据库时，隔离性保证每个事务“看不到”其他事务的中间状态。PostgreSQL通过**隔离级别**和**
MVCC（多版本并发控制）**实现这一特性。

#### 3.1 隔离级别的“四种境界”

PostgreSQL支持四种隔离级别（从弱到强）：
| 隔离级别 | 脏读（Dirty Read） | 不可重复读（Non-repeatable Read） | 幻读（Phantom Read） |
|----------------------|--------------------|------------------------------------|-----------------------|
| 读未提交（Read Uncommitted） | 允许 | 允许 | 允许 |
| 读已提交（Read Committed） | 禁止 | 允许 | 允许 |
| 可重复读（Repeatable Read） | 禁止 | 禁止 | 禁止 |
| 串行化（Serializable） | 禁止 | 禁止 | 禁止 |

**注意**：PostgreSQL的默认隔离级别是**读已提交（Read Committed）**，这是“性能与一致性的平衡选择”。

#### 3.2 隔离级别的“实战演示”

我们用一个简单的例子，看不同隔离级别的行为差异：

##### 场景：查询账户余额

假设`accounts`表中有一条记录：`id=1, balance=1000`。

###### （1）读已提交（默认）

```sql
-- 事务A（读已提交）
BEGIN;
-- 第一次查询：得到1000
SELECT balance
FROM accounts
WHERE id = 1;
-- 此时事务B执行：UPDATE accounts SET balance=1500 WHERE id=1; COMMIT;
-- 第二次查询：得到1500（不可重复读）
SELECT balance
FROM accounts
WHERE id = 1;
COMMIT;
```

**结论**：读已提交级别下，每个语句都会读取“最新的已提交数据”，因此会出现“不可重复读”。

###### （2）可重复读

```sql
-- 事务A（可重复读）
BEGIN
TRANSACTION ISOLATION LEVEL REPEATABLE READ;
-- 第一次查询：得到1000（快照生成）
SELECT balance
FROM accounts
WHERE id = 1;
-- 事务B执行UPDATE并提交
-- 第二次查询：依然得到1000（快照一致）
SELECT balance
FROM accounts
WHERE id = 1;
COMMIT;
```

**结论**：可重复读级别下，事务会基于“开始时的快照”进行所有查询，避免了不可重复读和幻读。

###### （3）串行化

```sql
-- 事务A（串行化）
BEGIN
TRANSACTION ISOLATION LEVEL SERIALIZABLE;
SELECT balance
FROM accounts
WHERE id = 1;
-- 1000
-- 事务B尝试UPDATE accounts SET balance=1500 WHERE id=1;
-- 此时事务B会被阻塞，直到事务A提交或回滚
COMMIT;
```

**结论**：串行化级别下，事务会“串行执行”，完全避免所有并发问题，但性能最低（适合对一致性要求极高的场景，比如金融交易）。

#### 3.3 MVCC：“多版本数据”的魔法

PostgreSQL的隔离性依赖**MVCC（多版本并发控制）**。它的核心思想是：

- 每个修改操作都会生成“新版本数据”，而不是直接覆盖旧版本；
- 事务根据“快照（Snapshot）”读取数据——快照包含事务开始时所有“已提交的数据版本”；
- 旧版本数据会在“没有事务引用”时被自动清理（通过`VACUUM`）。

比如，当事务B修改`balance`为1500时，PostgreSQL会：

1. 保留旧版本（balance=1000）；
2. 生成新版本（balance=1500）；
3. 事务A的快照依然指向旧版本，因此看不到事务B的修改。

### 4. 持久性：提交后的数据“永不丢失”

持久性是指**事务提交后，修改会永久保存，即使系统崩溃也不会丢失**。PostgreSQL通过**WAL（Write-Ahead Logging，预写日志）**
实现这一特性。

#### 4.1 WAL的“预写原则”

WAL的核心逻辑是：**所有修改必须先写入日志，再写入数据文件**。具体流程如下：

1. 事务执行`UPDATE`操作时，PostgreSQL先将修改内容写入**WAL日志**（顺序写入，速度快）；
2. WAL日志会被**同步到磁盘**（通过`fsync`调用，保证日志不丢失）；
3. 定期将WAL中的修改“刷入”数据文件（通过`Checkpoint`机制）。

即使系统突然崩溃（比如断电），重启后PostgreSQL会：

- 读取WAL日志；
- 重放所有“已提交但未刷入数据文件”的修改；
- 回滚所有“未提交”的修改。

#### 4.2 Checkpoint：“缩短恢复时间”的关键

`Checkpoint`是PostgreSQL定期执行的“磁盘同步操作”，它会：

1. 将所有“脏页”（修改过但未写入数据文件的内存页）写入数据文件；
2. 在WAL日志中标记一个“检查点”，表示“之前的修改已安全写入磁盘”。

这样，当系统崩溃时，PostgreSQL只需要重放**检查点之后**的WAL日志，大大减少恢复时间。

### 5. 实战：用ACID保障“转账业务”

我们用一个经典的“转账场景”，演示如何用ACID特性保证数据正确性：

#### 5.1 准备工作

首先创建账户表（包含`Check`约束，保证余额非负）：

```sql
-- 创建账户表
CREATE TABLE accounts
(
    id      SERIAL PRIMARY KEY,
    user_id INT            NOT NULL,
    balance NUMERIC(10, 2) NOT NULL CHECK (balance >= 0)
);

-- 插入测试数据：用户1有1000元，用户2有500元
INSERT INTO accounts (user_id, balance)
VALUES (1, 1000.00),
       (2, 500.00);
```

#### 5.2 转账事务

用户1给用户2转200元，事务必须保证：

- 原子性：要么“用户1扣200+用户2加200”，要么都不执行；
- 一致性：转账后双方余额都非负；
- 隔离性：并发转账时，看不到对方的中间状态；
- 持久性：转账成功后，数据永久保存。

```sql
-- 开启转账事务
BEGIN;
-- 步骤1：扣减用户1的余额
UPDATE accounts
SET balance = balance - 200.00
WHERE user_id = 1;
-- 步骤2：增加用户2的余额
UPDATE accounts
SET balance = balance + 200.00
WHERE user_id = 2;
-- 步骤3：检查是否有错误（比如用户1余额不足）
-- 如果一切正常，提交事务
COMMIT;
```

#### 5.3 异常处理

如果用户1的余额不足（比如只有100元），步骤1会触发`Check`约束错误：

```
ERROR:  check constraint "accounts_balance_check" violated by row
```

此时事务会自动终止，必须通过`ROLLBACK`撤销所有修改：

```sql
ROLLBACK;
```

### 6. 课后Quiz：巩固ACID知识

#### 问题1：什么是原子性？PostgreSQL如何保证原子性？

**答案**：原子性是事务要么全做要么全不做。PostgreSQL通过`ROLLBACK`（回滚）和`Savepoint`
（保存点）实现原子性——当事务出错时，回滚所有修改；保存点允许部分回滚，但整个事务依然原子。

#### 问题2：PostgreSQL的默认隔离级别是什么？它能避免哪些并发问题？

**答案**：默认隔离级别是**读已提交（Read Committed）**。它能避免脏读，但不能避免不可重复读和幻读。

#### 问题3：持久性是如何通过WAL实现的？

**答案**：WAL要求所有修改先写入日志（同步到磁盘），再写入数据文件。即使系统崩溃，重启后PostgreSQL会重放WAL日志中的未完成修改，保证数据不丢失。

#### 问题4：假设你在开发一个电商系统，用户下订单时需要“扣减库存”和“创建订单”，如何用事务保证原子性？

**答案**：将两个操作包裹在一个事务中：

```sql
BEGIN;
-- 扣减库存
UPDATE products
SET stock = stock - 1
WHERE id = 100;
-- 创建订单
INSERT INTO orders (user_id, product_id)
VALUES (1, 100);
COMMIT;
```

如果任何一步出错，`ROLLBACK`会撤销所有修改，避免“库存扣了但订单没创建”的情况。

### 7. 常见报错及解决

#### 报错1：`current transaction is aborted, commands ignored until end of transaction block`

**原因**：事务中某条语句出错（比如违反约束），导致事务进入“终止状态”。
**解决**：执行`ROLLBACK`撤销所有修改，再重新执行正确的语句。
**预防**：在应用层捕获错误，及时回滚事务。

#### 报错2：`could not serialize access due to read/write dependencies among transactions`

**原因**：使用`Serializable`隔离级别时，并发事务存在“读写依赖”，无法串行执行。
**解决**：重试事务，或降低隔离级别到`Repeatable Read`。
**预防**：避免在高并发场景使用`Serializable`级别。

#### 报错3：`check constraint "xxx" violated by row`

**原因**：修改操作违反了`Check`约束（比如余额为负）。
**解决**：检查数据合法性，修改后重新执行。
**预防**：应用层先验证数据（比如前端检查“转账金额不能为负”）。

### 参考链接

- PostgreSQL隔离级别：https://www.postgresql.org/docs/17/transaction-iso.html
- PostgreSQL WAL日志：https://www.postgresql.org/docs/17/wal.html
- PostgreSQL约束：https://www.postgresql.org/docs/17/ddl-constraints.html

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[转账不翻车、并发不干扰，PostgreSQL的ACID特性到底有啥魔法？](https://blog.cmdragon.cn/posts/de3672803de34dbad244d0a8d48b0eb5/)



<details>
<summary>往期文章归档</summary>

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
- [如何在FastAPI中巧妙实现延迟队列，让任务乖乖等待？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/174450702d9e609a072a7d1aaa84750b/)
- [FastAPI的死信队列处理机制：为何你的消息系统需要它？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/047b08957a0d617a87b72da6c3131e5d/)

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