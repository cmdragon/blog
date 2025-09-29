---
url: /posts/849ae5bab0f8c66e94c2f6ad1bb798e3/
title: PostgreSQL的表关系和约束，咋帮你搞定用户订单不混乱、学生选课不重复？
date: 2025-09-29T05:53:53+08:00
lastmod: 2025-09-29T05:53:53+08:00
author: cmdragon
cover: /images/52b713decd504b21b534db5ffa7c4560~tplv-5jbd59dj06-image.png

summary:
  在数据库设计中，表关系是连接不同表的关键，旨在避免数据冗余和保证数据一致性。PostgreSQL支持三种表关系：一对一、一对多和多对多。一对一关系通过外键同时作为主键实现；一对多关系通过从表的外键指向主表的主键实现；多对多关系通过中间表包含两个外键实现。此外，约束（如主键、外键、唯一、非空和检查约束）确保数据的完整性和一致性。外键的`ON DELETE CASCADE`和`ON DELETE RESTRICT`分别用于自动删除关联行或阻止主表行删除。

categories:
  - postgresql

tags:
  - 基础入门
  - 数据库设计
  - 表关系
  - 数据一致性
  - 数据冗余
  - 约束
  - 外键

---

<img src="/images/52b713decd504b21b534db5ffa7c4560~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 表关系：为什么需要它？

在数据库设计中，**表关系**是连接不同表的“桥梁”，核心目的是**避免数据冗余**和**保证数据一致性**
。比如，如果你把用户的“用户名”“邮箱”和“地址”“生日”都放在一个表，当用户修改地址时，你需要更新所有包含该用户地址的行——这不仅麻烦，还容易出错。而把“用户基本信息”和“用户详细信息”拆成两个表，通过关系关联，修改地址只需要更新“详细信息表”的一行，既高效又安全。

### 表关系的三种类型

PostgreSQL支持三种常见的表关系，我们用“用户-订单-商品”的例子逐一解释：

#### 1. 一对一关系（One-to-One）

**定义**：两个表中的行**一一对应**（一个用户对应一个详细信息，一个详细信息属于一个用户）。  
**实现方式**：从表（详细信息表）的外键**同时作为主键**（或添加唯一约束），确保一个主表行只能对应一个从表行。

**示例**：用户表（`users`）和用户详细信息表（`user_profiles`）

```sql
-- 主表：用户基本信息
CREATE TABLE users
(
    id       SERIAL PRIMARY KEY,           -- 主键（自增整数），唯一标识用户
    username VARCHAR(50)  NOT NULL UNIQUE, -- 用户名：非空+唯一
    email    VARCHAR(100) NOT NULL UNIQUE  -- 邮箱：非空+唯一
);

-- 从表：用户详细信息（一对一关联）
CREATE TABLE user_profiles
(
    user_id   INT PRIMARY KEY,       -- 主键=外键，保证一对一
    full_name VARCHAR(100) NOT NULL, -- 真实姓名：非空
    bio       TEXT,                  -- 个人简介：可空
    -- 外键约束：user_id引用users表的id
    FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE            -- 主表（users）行删除时，从表（user_profiles）对应行也删除
);
```

**关键逻辑**：`user_profiles`的`user_id`既是主键（唯一）又是外键（关联`users.id`），因此每个用户只能有一个详细信息，反之亦然。

#### 2. 一对多关系（One-to-Many）

**定义**：主表中的一行对应从表中的**多行**（一个用户有多个订单，一个订单属于一个用户）。  
**实现方式**：从表（订单表）添加外键，指向主表（用户表）的主键。

**示例**：订单表（`orders`）和订单项表（`order_items`）

```sql
-- 主表：订单信息
CREATE TABLE orders
(
    id         SERIAL PRIMARY KEY,                  -- 订单主键
    user_id    INT NOT NULL,                        -- 关联用户表的id
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 订单时间：默认当前时间
    -- 外键约束：user_id引用users表的id
    FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE                           -- 用户删除时，其所有订单也删除
);

-- 从表：订单项（一对多关联）
CREATE TABLE order_items
(
    id         SERIAL PRIMARY KEY,                           -- 订单项主键
    order_id   INT            NOT NULL,                      -- 关联订单表的id
    product_id INT            NOT NULL,                      -- 关联商品表的id（假设存在products表）
    quantity   INT            NOT NULL CHECK (quantity > 0), -- 数量：非空+必须>0
    price      DECIMAL(10, 2) NOT NULL CHECK (price > 0),    -- 单价：非空+必须>0
    -- 外键约束：order_id引用orders表的id
    FOREIGN KEY (order_id) REFERENCES orders (id)
        ON DELETE CASCADE                                    -- 订单删除时，其所有订单项也删除
);
```

**关键逻辑**：`order_items`的`order_id`指向`orders.id`，一个订单可以有多个订单项，但一个订单项只能属于一个订单——这就是“一对多”。

#### 3. 多对多关系（Many-to-Many）

**定义**：两个表中的行**互相对应多行**（一个学生选多门课，一门课有多个学生）。  
**实现方式**：创建**中间表**，包含两个外键（分别指向两个主表的主键），并将这两个外键设为**组合主键**（保证唯一）。

**示例**：学生表（`students`）和课程表（`courses`）

```sql
-- 主表1：学生信息
CREATE TABLE students
(
    id   SERIAL PRIMARY KEY,  -- 学生主键
    name VARCHAR(50) NOT NULL -- 学生姓名：非空
);

-- 主表2：课程信息
CREATE TABLE courses
(
    id          SERIAL PRIMARY KEY,          -- 课程主键
    course_name VARCHAR(100) NOT NULL UNIQUE -- 课程名称：非空+唯一
);

-- 中间表：学生-课程关联（多对多）
CREATE TABLE student_courses
(
    student_id INT NOT NULL, -- 关联学生表的id
    course_id  INT NOT NULL, -- 关联课程表的id
    -- 组合主键：保证学生-课程组合唯一（一个学生不能重复选同一门课）
    PRIMARY KEY (student_id, course_id),
    -- 外键约束1：student_id引用students表的id
    FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
    -- 外键约束2：course_id引用courses表的id
    FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
);
```

**关键逻辑**：中间表`student_courses`的`student_id`和`course_id`
组合成主键，确保“学生A选课程B”的记录唯一。当学生或课程被删除时，中间表的关联记录也会自动删除（`ON DELETE CASCADE`）。

### 约束：数据的“安全护栏”

表关系依赖**约束**（Constraint）来保证数据的**完整性**和**一致性**。约束是数据库的“规则”，违反规则的数据会被直接拒绝。PostgreSQL支持5种核心约束：

#### 1. 主键约束（Primary Key）

**作用**：唯一标识表中的每一行，**非空且唯一**。  
**语法**：创建表时用`PRIMARY KEY`，或用`ALTER TABLE`添加。  
**示例**：

```sql
-- 创建表时指定主键
CREATE TABLE products
(
    id   SERIAL PRIMARY KEY, -- SERIAL：自增整数（PostgreSQL特有）
    name VARCHAR(100) NOT NULL
);

-- 修改表添加主键（如果表已存在）
ALTER TABLE products
    ADD PRIMARY KEY (id);
```

**注意**：一个表只能有一个主键，可以是**单个列**（如`id`）或**多个列**（复合主键，如`student_courses`
的`student_id+course_id`）。

#### 2. 外键约束（Foreign Key）

**作用**：维护表之间的**引用完整性**，确保从表中的值必须存在于主表中（比如订单项的`order_id`必须是订单表中存在的id）。  
**语法**：`FOREIGN KEY (从表列) REFERENCES 主表(主表列) [ON DELETE/UPDATE 动作]`  
**常见动作**（重点！）：

- `CASCADE`：主表行删除/更新时，从表关联行**自动删除/更新**（比如删除用户时，其订单也删除）。
- `SET NULL`：主表行删除/更新时，从表关联列**设为NULL**（比如产品下架时，订单项的`product_id`设为NULL，需从表列允许NULL）。
- `RESTRICT`：**阻止**主表行删除/更新，如果从表有关联行（比如有订单项的订单不能删除）。

**示例**：

```sql-- 订单项的product_id引用商品表的id，商品删除时订单项的product_id设为NULL
ALTER TABLE order_items
ADD FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;
```

#### 3. 唯一约束（Unique Constraint）

**作用**：保证列或列组合的值**唯一**，可以为空，但最多一个空值（因为`NULL`不等于任何值，包括自身）。  
**语法**：创建表时用`UNIQUE`，或用`ALTER TABLE`添加。  
**示例**：

```sql
-- 用户表的邮箱和用户名都唯一
CREATE TABLE users
(
    id       SERIAL PRIMARY KEY,
    username VARCHAR(50)  NOT NULL UNIQUE, -- 用户名唯一
    email    VARCHAR(100) NOT NULL UNIQUE  -- 邮箱唯一
);
```

#### 4. 非空约束（Not Null Constraint）

**作用**：保证列**不能为NULL**，必须有值。  
**语法**：创建表时用`NOT NULL`，或用`ALTER TABLE`修改。  
**示例**：

```sql
-- 创建表时指定非空
CREATE TABLE users
(
    id       SERIAL PRIMARY KEY,
    password VARCHAR(255) NOT NULL -- 密码非空
);

-- 修改表添加非空约束
ALTER TABLE users
    ALTER COLUMN username SET NOT NULL;

-- 取消非空约束（如果业务允许）
ALTER TABLE users
    ALTER COLUMN username DROP NOT NULL;
```

#### 5. 检查约束（Check Constraint）

**作用**：自定义条件，保证列值满足**特定规则**（比如“价格>0”“年龄≥18”）。  
**语法**：创建表时用`CHECK (条件)`，或用`ALTER TABLE`添加。  
**示例**：

```sql
-- 商品表：价格>0，库存≥0
CREATE TABLE products
(
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(100)   NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),           -- 价格必须>0
    stock INT            NOT NULL DEFAULT 0 CHECK (stock >= 0) -- 库存≥0，默认0
);

-- 修改表添加检查约束：年龄在18-60之间
ALTER TABLE users
    ADD CHECK (age BETWEEN 18 AND 60);
```

### 约束的“管理技巧”

- **命名约束**：默认情况下，PostgreSQL会自动生成约束名（如`users_email_key`），但你可以自定义名称，方便后续管理：
  ```sql
  CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(100) NOT NULL,
      -- 自定义唯一约束名
      CONSTRAINT unique_user_email UNIQUE (email)
  );
  ```
- **删除约束**：用`ALTER TABLE`删除不再需要的约束：
  ```sql
  -- 删除用户表的唯一约束
  ALTER TABLE users DROP CONSTRAINT unique_user_email;
  ```

### 课后Quiz：巩固你的知识

1. **问题**：设计一个“博客系统”，用户表（`users`）和文章表（`posts`
   ）的关系是“一个用户写多篇文章，一篇文章属于一个用户”。这是什么关系？如何实现？  
   **答案**：一对多关系。在文章表添加`user_id`外键指向用户表的`id`：
   ```sql
   CREATE TABLE posts (
       id SERIAL PRIMARY KEY,
       title VARCHAR(200) NOT NULL,
       content TEXT NOT NULL,
       user_id INT NOT NULL,
       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
   );
   ```

2. **问题**：外键的`ON DELETE CASCADE`和`ON DELETE RESTRICT`有什么区别？  
   **答案**：`CASCADE`会自动删除从表关联行；`RESTRICT`会阻止主表行删除（如果从表有关联行）。

3. **问题**：如何给用户表的`age`列添加检查约束，确保年龄在18到60之间？  
   **答案**：
   ```sql
   ALTER TABLE users ADD CHECK (age BETWEEN 18 AND 60);
   ```

### 常见报错与解决办法

#### 1. `ERROR: there is no unique constraint matching given keys for referenced table "orders"`

**原因**：创建外键时，主表的被引用列**没有主键或唯一约束**（比如`order_items`的`order_id`引用`orders`的`id`，但`orders.id`
不是主键）。  
**解决**：给主表添加主键约束：

```sql
ALTER TABLE orders
    ADD PRIMARY KEY (id);
```

#### 2. `ERROR: duplicate key value violates unique constraint "users_email_key"`

**原因**：插入/更新数据时违反唯一约束（比如用户表的`email`重复）。  
**解决**：检查重复数据（`SELECT * FROM users WHERE email = 'test@example.com'`），或修改唯一约束（如添加组合唯一）。

#### 3. `ERROR: null value in column "username" violates not-null constraint`

**原因**：插入数据时，非空列（如`username`）未赋值。  
**解决**：插入时提供非空值（`INSERT INTO users (username, email) VALUES ('test', 'test@example.com')`），或取消非空约束（如果业务允许）。

### 参考链接

- PostgreSQL约束官方文档：https://www.postgresql.org/docs/17/ddl-constraints.html
- 外键约束详细说明：https://www.postgresql.org/docs/17/ddl-constraints.html#DDL-CONSTRAINTS-FK
- 检查约束语法：https://www.postgresql.org/docs/17/ddl-constraints.html#DDL-CONSTRAINTS-CHECK-CONSTRAINTS

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[PostgreSQL的表关系和约束，咋帮你搞定用户订单不混乱、学生选课不重复？](https://blog.cmdragon.cn/posts/849ae5bab0f8c66e94c2f6ad1bb798e3/)




<details>
<summary>往期文章归档</summary>

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
- [如何在 FastAPI 中玩转 APScheduler，让任务定时自动执行？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/85564dd901c6d9b1a79d320970843caa/)

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