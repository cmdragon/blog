---
url: /posts/26614eb7da6c476dde41d367ad888d2f/
title: PostgreSQL的“时光机”MVCC和锁机制是怎么搞定高并发的？
date: 2025-10-15T08:15:14+08:00
lastmod: 2025-10-15T08:15:14+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/25a48a2f118a4643912a960451640eb4~tplv-5jbd59dj06-aigc.png

summary:
  MVCC（多版本并发控制）是PostgreSQL实现高并发的核心机制，通过为每个事务提供数据快照，解决读-写冲突，实现无锁并发。PostgreSQL的锁机制包括表级锁、行级锁等，行级锁粒度小，并发高。锁等待和死锁是常见问题，死锁由循环等待引起。优化实践包括减少事务长度、合理选择锁级别、使用乐观锁、统一资源顺序、利用NOWAIT和SKIP LOCKED避免等待，以及监控锁状态。通过优化事务处理顺序和缩短锁持有时间，可以有效避免锁等待和死锁。

categories:
  - postgresql

tags:
  - 基础入门
  - MVCC
  - 并发控制
  - 锁机制
  - 死锁
  - 锁等待
  - 事务优化

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/25a48a2f118a4643912a960451640eb4~tplv-5jbd59dj06-aigc.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 一、并发控制与MVCC基础

### 1.1 什么是MVCC？

MVCC（Multi-Version Concurrency Control，多版本并发控制）是PostgreSQL实现高并发的核心机制。你可以把它想象成**数据库的“时光机”
**：每个事务启动时，都会拿到一个**数据快照**
——相当于事务开始时刻的数据库状态。事务中的读操作（SELECT）只会看到这个快照里的数据，不会被其他同时运行的事务的修改影响；而写操作（INSERT/UPDATE/DELETE）会生成
**新版本数据**，旧版本会保留到没有事务需要它为止（由事务ID和可见性规则决定）。

比如，事务A在9点启动，读取到用户表中“Alice”的年龄是25；事务B在9点01分修改“Alice”的年龄为26并提交，但事务A在9点02分再次读取时，看到的还是25——因为它的快照是9点的状态。这种“快照隔离”（Snapshot
Isolation）是MVCC的核心特性，让读事务和写事务可以**无锁并发**（除非使用串行化隔离级别）。

### 1.2 MVCC与锁的关系

MVCC减少了锁的使用，但**没有完全替代锁**。比如：

- 写事务之间需要锁：如果两个事务同时修改同一行，PostgreSQL会用**行级锁**保证只有一个事务能修改（避免“脏写”）；
- 某些操作需要显式锁：比如CREATE INDEX需要表级锁，避免其他事务修改表结构；
- 串行化隔离级别：会强制加锁来保证严格的串行执行。

简单来说，MVCC解决了“读-写冲突”（读事务不需要等写事务），而锁解决了“写-写冲突”（写事务之间需要互斥）。

## 二、PostgreSQL的锁机制分类

PostgreSQL的锁按**粒度**分为表级锁、行级锁、页级锁（较少用），按**模式**分为共享锁（Share）、排他锁（Exclusive）等。以下是最常用的锁类型：

### 2.1 表级锁：控制整张表的访问

表级锁的粒度大，影响范围广，尽量少用。常见的表级锁模式：
| 锁模式 | 用途 | 冲突的锁模式 |
|----------------------|---------------------------------------|----------------------------|
| ACCESS SHARE | SELECT（隐式加锁） | EXCLUSIVE、ACCESS EXCLUSIVE |
| ROW EXCLUSIVE | INSERT/UPDATE/DELETE（隐式加锁） | SHARE、SHARE ROW EXCLUSIVE等 |
| SHARE | CREATE INDEX（隐式加锁） | ROW EXCLUSIVE及以上 |
| EXCLUSIVE | ALTER TABLE（部分操作） | 几乎所有锁 |
| ACCESS EXCLUSIVE | DROP TABLE、TRUNCATE（隐式加锁） | 所有锁 |

比如，当你执行`DELETE FROM users WHERE id=1`时，PostgreSQL会自动给`users`表加**ROW EXCLUSIVE锁**
（防止其他事务加SHARE锁创建索引），同时给id=1的行加**行级排他锁**。

### 2.2 行级锁：控制单行的修改

行级锁是最常用的锁类型，粒度小，并发高。常见的行级锁模式：

- **FOR UPDATE**：排他锁，锁定行用于修改，其他事务不能修改或加FOR UPDATE锁；
- **FOR SHARE**：共享锁，锁定行用于读取，其他事务可以加FOR SHARE但不能加FOR UPDATE；
- **NOWAIT**：可选参数，加锁失败时立即报错，不等待；
- **SKIP LOCKED**：可选参数，跳过已锁定的行，不等待。

示例：

```sql
-- 锁定id=1的行用于修改，加锁失败立即报错
SELECT * FROM users WHERE id=1 FOR UPDATE NOWAIT;

-- 锁定未被锁定的行，跳过已锁定的行（适用于秒杀、任务队列）
SELECT * FROM orders WHERE status='pending' FOR UPDATE SKIP LOCKED LIMIT 10;
```

### 2.3 其他锁类型

- **页级锁**：锁定数据页（默认8KB），用于批量修改（比如VACUUM）；
- **函数级锁**：锁定用户定义的函数，防止并发修改函数定义。

## 三、锁等待与死锁的成因

### 3.1 锁等待：为什么事务会“卡住”？

锁等待是指**一个事务需要的锁被另一个事务持有**，必须等待对方释放锁才能继续。最常见的场景是**长事务**：

#### 示例：长事务导致锁等待

事务A（终端1）：

```sql
BEGIN;
-- 模拟耗时操作（比如调用外部API）
SELECT pg_sleep(10); -- 睡眠10秒，持有锁10秒
UPDATE users SET name='Alice' WHERE id=1; -- 加行级排他锁
COMMIT;
```

事务B（终端2）：

```sql
BEGIN;
-- 需要修改同一行，等待事务A释放锁
UPDATE users SET name='Bob' WHERE id=1; -- 卡住！
COMMIT;
```

事务B会一直等待，直到事务A提交/回滚，或者触发`lock_timeout`（默认无限等待）。

### 3.2 死锁：循环等待的陷阱

死锁是**两个或多个事务互相等待对方的锁**，形成循环。比如：

- 事务A持有行1的锁，需要行2的锁；
- 事务B持有行2的锁，需要行1的锁；
- 两者互相等待，永远无法结束。

#### 示例：死锁的产生

事务A（终端1）：

```sql
BEGIN;
UPDATE users SET name='Alice' WHERE id=1; -- 持有行1的锁
UPDATE users SET name='Bob' WHERE id=2; -- 等待行2的锁
COMMIT;
```

事务B（终端2）：

```sql
BEGIN;
UPDATE users SET name='Charlie' WHERE id=2; -- 持有行2的锁
UPDATE users SET name='David' WHERE id=1; -- 等待行1的锁
COMMIT;
```

同时运行这两个事务，PostgreSQL会立即检测到死锁，终止其中一个事务并返回：

```
ERROR: deadlock detected
DETAIL: Process 123 waits for ShareLock on transaction 456; blocked by process 789.
Process 789 waits for ShareLock on transaction 123; blocked by process 123.
HINT: See server log for details.
```

## 四、避免锁等待与死锁的优化实践

### 4.1 减少事务长度：短事务是王道

长事务是锁等待和死锁的“罪魁祸首”。优化方法：

- **将非数据库操作移出事务**：比如调用API、处理文件等操作，放到事务外；
- **拆分大事务**：将一个长事务拆成多个短事务（比如批量更新拆成每次更新100行）。

#### 优化后的长事务示例

原长事务：

```sql
BEGIN;
SELECT * FROM users WHERE id=1; -- 业务逻辑：调用API验证用户
SELECT pg_sleep(10); -- 模拟API调用
UPDATE users SET status='verified' WHERE id=1;
COMMIT;
```

优化后（将API调用移出事务）：

```sql
-- 先执行非数据库操作
SELECT * FROM users WHERE id=1; -- 查用户信息
SELECT pg_sleep(10); -- 调用API验证
-- 再启动短事务更新
BEGIN;
UPDATE users SET status='verified' WHERE id=1; -- 锁持有时间仅几毫秒
COMMIT;
```

### 4.2 合理选择锁级别：能行级不表级

表级锁会锁定整张表，导致所有事务等待。比如：

- 不要用`LOCK TABLE users;`（表级排他锁），除非你真的需要锁定整张表；
- 优先用行级锁（`FOR UPDATE`），只锁定需要修改的行。

#### 反例：不必要的表级锁

```sql
-- 错误：锁定整张表，导致其他事务无法操作users表
LOCK TABLE users IN EXCLUSIVE MODE;
UPDATE users SET name='Alice' WHERE id=1;
```

#### 正例：行级锁

```sql
-- 正确：只锁定id=1的行，其他行可以正常操作
UPDATE users SET name='Alice' WHERE id=1; -- 隐式行级锁
```

### 4.3 乐观锁：用版本号替代悲观锁

乐观锁假设**冲突很少发生**，通过**版本号字段**来检测冲突，不需要加锁。适用于读多写少的场景（比如商品库存扣减）。

#### 示例：乐观锁实现库存扣减

1. 创建表（加`version`字段）：

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    version INT NOT NULL DEFAULT 0 -- 版本号，每次更新+1
);
```

2. 插入测试数据：

```sql
INSERT INTO products (name, stock) VALUES ('Apple', 100);
```

3. 扣减库存（只有版本号匹配时才更新）：

```sql
-- 事务A：扣减1个库存
BEGIN;
UPDATE products 
SET stock = stock - 1, version = version + 1 
WHERE id=1 AND version=0; -- 版本号为0时才更新
COMMIT; -- 成功，version变为1

-- 事务B：此时版本号已变为1，更新失败
BEGIN;
UPDATE products 
SET stock = stock - 1, version = version + 1 
WHERE id=1 AND version=0; -- 返回0行，更新失败
COMMIT;
```

4. 处理失败：重试（重新查版本号再更新）或提示用户“库存已变化，请刷新”。

### 4.4 避免循环依赖：统一资源顺序

死锁的核心是**循环等待**，解决方法是**统一事务处理资源的顺序**。比如：

- 所有事务修改行时，都按`id`从小到大处理；
- 所有事务修改表时，都按表名字典序处理。

#### 优化后的死锁示例

事务A（终端1）：

```sql
BEGIN;
UPDATE users SET name='Alice' WHERE id=1; -- 先处理id=1
UPDATE users SET name='Bob' WHERE id=2; -- 再处理id=2
COMMIT;
```

事务B（终端2）：

```sql
BEGIN;
UPDATE users SET name='David' WHERE id=1; -- 先处理id=1（和A顺序一致）
UPDATE users SET name='Charlie' WHERE id=2; -- 再处理id=2
COMMIT;
```

这样事务B不会持有id=2的锁等待id=1，循环被打破，死锁消失。

### 4.5 NOWAIT与SKIP LOCKED：拒绝无限等待

- **NOWAIT**：加锁失败时立即报错，不等待；
- **SKIP LOCKED**：跳过已锁定的行，只处理未被锁定的行。

#### 示例1：用NOWAIT避免等待

```sql
-- 尝试锁定id=1的行，失败立即报错
SELECT * FROM users WHERE id=1 FOR UPDATE NOWAIT;
-- 如果行已被锁定，返回：ERROR: could not obtain lock on row in relation "users"
```

#### 示例2：用SKIP LOCKED处理任务队列

假设你有一个任务表`tasks`，状态为`pending`的任务需要被 worker 处理：

```sql
-- 每个worker获取10个未被锁定的任务（避免多个worker抢同一任务）
SELECT * FROM tasks WHERE status='pending' FOR UPDATE SKIP LOCKED LIMIT 10;
```

SKIP LOCKED适用于**不需要处理所有行**的场景（比如秒杀、任务队列），避免 worker 之间互相等待。

### 4.6 监控锁状态：用pg_locks看透锁持有情况

PostgreSQL提供`pg_locks`视图，用于查看当前的锁状态。比如：

```sql
-- 查看所有持有锁的事务
SELECT 
    pg_stat_activity.pid, -- 进程ID
    pg_stat_activity.query, -- 执行的SQL
    pg_locks.relation::regclass, -- 锁的表名
    pg_locks.locktype, -- 锁类型（表/行）
    pg_locks.mode -- 锁模式
FROM pg_locks
JOIN pg_stat_activity ON pg_locks.pid = pg_stat_activity.pid
WHERE pg_stat_activity.waiting = 'f'; -- 不包含等待中的事务
```

如果发现某个进程持有锁超过1分钟，可能是长事务，需要终止：

```sql
-- 终止进程ID为123的事务（注意：会回滚事务）
SELECT pg_terminate_backend(123);
```

## 五、实践示例：从问题到优化

### 5.1 示例1：长事务导致锁等待的优化

**问题**：事务A持有锁10秒，事务B等待。  
**优化**：将非数据库操作移出事务，缩短锁持有时间。  
**优化后代码**：

```sql
-- 事务A（终端1）：先处理非数据库操作
SELECT * FROM users WHERE id=1; -- 查用户信息
SELECT pg_sleep(10); -- 调用API（移出事务）
-- 启动短事务更新
BEGIN;
UPDATE users SET name='Alice' WHERE id=1; -- 锁持有时间<1ms
COMMIT;

-- 事务B（终端2）：立即执行，无需等待
BEGIN;
UPDATE users SET name='Bob' WHERE id=1; -- 成功
COMMIT;
```

### 5.2 示例2：死锁的解决

**问题**：两个事务互相等待对方的锁。  
**优化**：统一事务处理行的顺序（先id=1，再id=2）。  
**优化后代码**：

```sql
-- 事务A（终端1）：先id=1，再id=2
BEGIN;
UPDATE users SET name='Alice' WHERE id=1;
UPDATE users SET name='Bob' WHERE id=2;
COMMIT;

-- 事务B（终端2）：同样先id=1，再id=2
BEGIN;
UPDATE users SET name='David' WHERE id=1;
UPDATE users SET name='Charlie' WHERE id=2;
COMMIT;
```

### 5.3 示例3：乐观锁解决库存超卖

**问题**：两个事务同时扣减库存，导致超卖（比如库存100，扣减两次后变成98，而不是99）。  
**优化**：用版本号字段检测冲突。  
**优化后代码**：

```sql
-- 事务A：扣减1个库存（version=0）
BEGIN;
UPDATE products SET stock=stock-1, version=version+1 WHERE id=1 AND version=0; -- 成功，version=1
COMMIT;

-- 事务B：此时version=1，更新失败（返回0行）
BEGIN;
UPDATE products SET stock=stock-1, version=version+1 WHERE id=1 AND version=0; -- 失败
COMMIT;

-- 处理失败：重试
-- 重新查版本号
SELECT version FROM products WHERE id=1; -- 得到version=1
-- 再次更新
BEGIN;
UPDATE products SET stock=stock-1, version=version+1 WHERE id=1 AND version=1; -- 成功
COMMIT;
```

## 六、课后Quiz

### 问题1：MVCC的“快照隔离”是什么？它解决了什么问题？

**答案**：快照隔离是指事务启动时拿到数据的快照，读操作只看到快照里的数据。它解决了**读-写冲突**
——读事务不需要等待写事务释放锁，写事务也不需要等待读事务，大大提升了并发性能。

### 问题2：如何用SKIP LOCKED处理秒杀场景？

**答案**：假设你有一个商品表`seckill_products`，库存为100：

```sql
-- 用户秒杀时，获取1个未被锁定的商品（避免多个用户抢同一商品）
BEGIN;
SELECT * FROM seckill_products WHERE stock>0 FOR UPDATE SKIP LOCKED LIMIT 1;
-- 扣减库存
UPDATE seckill_products SET stock=stock-1 WHERE id=?;
COMMIT;
```

SKIP LOCKED会跳过已被其他用户锁定的商品，每个用户只能拿到未被锁定的商品，避免超卖和等待。

### 问题3：死锁的四个必要条件是什么？如何打破？

**答案**：死锁的四个条件是：互斥（资源只能被一个事务持有）、请求保持（持有资源的同时请求新资源）、不可剥夺（资源不能被强制夺取）、循环等待（事务互相等待对方的资源）。打破死锁的关键是
**打破循环等待**——统一事务处理资源的顺序。

## 七、常见报错与解决方案

### 报错1：ERROR: deadlock detected

**原因**：两个或多个事务形成循环等待（比如A等B的锁，B等A的锁）。  
**解决步骤**：

1. 查看死锁日志（`postgresql.log`），找到冲突的事务；
2. 统一事务处理资源的顺序（比如按id排序）；
3. 缩短事务长度，尽快释放锁。

### 报错2：ERROR: could not obtain lock on

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[PostgreSQL的“时光机”MVCC和锁机制是怎么搞定高并发的？](https://blog.cmdragon.cn/posts/26614eb7da6c476dde41d367ad888d2f/)

## 参考链接

PostgreSQL 17 并发控制文档：https://www.postgresql.org/docs/17/mvcc.html
PostgreSQL 17 事务隔离级别文档：https://www.postgresql.org/docs/17/transaction-iso.html
PostgreSQL 17 显式锁文档：https://www.postgresql.org/docs/17/explicit-locking.html

<details>
<summary>往期文章归档</summary>

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
- [如何让FastAPI测试不再成为你的噩梦？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/29858a7a10d20b4e4649cb75fb422eab/)
- [FastAPI测试环境配置的秘诀，你真的掌握了吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/6f9e71e8313db6de8c1431877a70b67e/)
- [全链路追踪如何让FastAPI微服务架构的每个请求都无所遁形？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/30e1d2fbf1ad8123eaf0e1e0dbe7c675/)
- [如何在API高并发中玩转资源隔离与限流策略？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/4ad4ec1dbd80bcf5670fb397ca7cc68c/)

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