---
url: /posts/b5474d1480509c5072085abc80b3dd9f/
title: 能当关系型数据库还能玩对象特性，能拆复杂查询还能自动管库存，PostgreSQL凭什么这么香？
date: 2025-09-20T06:58:38+08:00
lastmod: 2025-09-20T06:58:38+08:00
author: cmdragon
cover: /images/f68692acb80048e2ba9030bc6fea2186~tplv-5jbd59dj06-image.png

summary:
  PostgreSQL是一种对象-关系型数据库（ORDBMS），结合了关系型数据库的结构化特性和对象型数据库的灵活性，支持自定义数据类型和方法。它起源于1986年的POSTGRES项目，1996年开源后成为全球流行的数据库之一。PostgreSQL的核心特性包括复杂查询、事务完整性、MVCC（多版本并发控制）、外键和触发器，能够高效处理高并发和复杂数据操作。此外，PostgreSQL具有强大的可扩展性，支持自定义数据类型、函数和索引，满足多样化需求。

categories:
  - postgresql

tags:
  - 基础入门
  - 对象-关系型数据库
  - 数据库特性
  - 事务完整性
  - MVCC
  - 自定义数据类型
  - 触发器

---

<img src="/images/f68692acb80048e2ba9030bc6fea2186~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 1.1 PostgreSQL的核心定位：对象-关系型数据库（ORDBMS）

如果你接触过数据库，一定听过“关系型数据库”（比如MySQL、Oracle）——它们用**表、行、列**存储数据，用SQL语言操作。而PostgreSQL不一样，它是
**对象-关系型数据库（ORDBMS）**：既保留了关系型数据库的“规矩”（比如表结构、SQL标准），又融入了对象型数据库的“灵活”（比如自定义数据类型、方法）。

举个通俗的例子：如果要存储“几何图形”数据，传统关系型数据库可能会用多个字段（比如`x1,y1,x2,y2`存矩形），但PostgreSQL允许你*
*自定义一个`rectangle`类型**，直接存储矩形的坐标，还能给这个类型加个`area()`
方法（计算面积）。这就是“对象”特性的体现——把“数据”和“操作数据的方法”打包在一起；而“关系”特性则是它依然遵守SQL规则，能用表、JOIN、外键这些传统玩法。

### 1.2 PostgreSQL的起源与发展：从伯克利到全球社区

PostgreSQL不是“凭空造出来的”，它的祖先叫**POSTGRES**，是1986年美国加州大学伯克利分校（UC Berkeley）的科研项目。当时的关系型数据库有个大痛点：
**无法处理复杂数据类型**（比如几何图形、文档）。POSTGRES的目标就是解决这个问题——它首次提出“对象-关系”模型，允许用户自定义数据类型和函数。

1996年，POSTGRES的开源版本发布，改名为“PostgreSQL”（意为“PostgreSQL是POSTGRES的后继者”）。从那以后，全球开发者一起维护它，现在已经更新到17版本（2024年），成为
**最流行的开源数据库之一**。

### 1.3 PostgreSQL的核心特性：为什么它能打？

PostgreSQL能火，不是因为“开源免费”，而是因为它的“硬实力”——支持很多现代数据库的核心特性，而且做得很极致。我们逐一拆解：

#### 1.3.1 复杂查询：搞定“绕弯子”的需求

PostgreSQL的查询能力堪称“全能”，支持：

- **多表JOIN**：比如查“每个订单的用户姓名和商品名称”，可以把`orders`（订单表）、`users`（用户表）、`products`（商品表）JOIN起来；
- **子查询**：比如查“工资高于平均工资的员工”，先用子查询算出平均工资，再筛选；
- **CTE（Common Table Expressions）**：用`WITH`语句把复杂查询拆成“临时表”，比如查“每个部门的TOP3工资员工”，用CTE先算每个部门的工资排名，再取前3。

举个电商系统的实际例子——**热销商品统计**：

```sql
-- 第一步：用CTE算出每个商品的总销量
WITH product_sales AS (
  SELECT product_id, SUM(quantity) AS total_sold
  FROM orders
  GROUP BY product_id
)
-- 第二步：关联商品表，得到热销TOP10
SELECT p.name, ps.total_sold
FROM products p
JOIN product_sales ps ON p.id = ps.product_id
ORDER BY ps.total_sold DESC LIMIT 10;
```  

这个查询用CTE拆解了复杂逻辑，PostgreSQL处理起来毫无压力。

#### 1.3.2 事务完整性：保证数据“不出错”

你肯定遇到过“转账失败”的坑：从A账户扣了钱，B账户却没收到——这就是“事务不完整”。PostgreSQL支持**ACID特性**，彻底解决这个问题：

- **原子性（Atomicity）**：事务里的操作要么全做，要么全不做。比如转账的两个步骤（扣钱、加钱），只要有一个失败，整个事务回滚；
- **一致性（Consistency）**：事务前后数据要符合规则。比如你的账户余额不能是负数，PostgreSQL会自动检查；
- **隔离性（Isolation）**：多个事务同时运行，互不干扰。比如你在查余额时，别人在转账，你看到的是转账前的余额；
- **持久性（Durability）**：事务提交后，数据永远不会丢（即使服务器宕机）。

#### 1.3.3 MVCC：让“读写”互不干扰

传统数据库里，“读”和“写”会互相阻塞——比如你在看数据时，别人不能改；别人在改数据时，你不能看。这在高并发场景下（比如秒杀、电商大促）会卡死。

PostgreSQL用**MVCC（多版本并发控制）**解决了这个问题：**每个事务看到的数据是一个“快照”**。比如：

- 用户A在“读”订单表（看自己的订单）；
- 用户B在“写”订单表（修改订单状态）；
- 用户A看到的还是修改前的订单状态，直到用户B提交事务。

这样一来，“读”和“写”可以同时进行，不会阻塞，大大提高了并发性能。

#### 1.3.4 外键、触发器：自动维护数据“规矩”

PostgreSQL还能帮你“自动做事”，不用手动检查数据：

- **外键（Foreign Key）**：比如`orders`表的`user_id`必须指向`users`表的`id`。如果有人想插入一个不存在的`user_id`
  ，PostgreSQL会直接拒绝，防止“无效订单”；
- **触发器（Trigger）**：比如当订单状态改为“完成”时，自动减少商品库存。你不用写代码调库存接口，PostgreSQL会帮你做：

```sql
-- 1. 创建触发器函数（要做的事情）
CREATE OR REPLACE FUNCTION update_inventory()
RETURNS TRIGGER AS $$
BEGIN
  -- 减少商品库存（NEW代表新插入的订单记录）
  UPDATE products
  SET stock = stock - NEW.quantity
  WHERE id = NEW.product_id;
  RETURN NEW; -- 返回新记录，继续执行插入操作
END;
$$ LANGUAGE plpgsql; -- 用PL/pgSQL写函数（PostgreSQL内置语言）

-- 2. 绑定触发器到orders表的INSERT操作
CREATE TRIGGER order_insert_trigger
AFTER INSERT ON orders -- 当插入订单后执行
FOR EACH ROW -- 每插入一行都执行
EXECUTE FUNCTION update_inventory(); -- 执行上面的函数
```  

当你插入一个订单时，这个触发器会自动更新商品库存——是不是很省心？

### 1.4 PostgreSQL的“超能力”：可扩展性

如果你觉得PostgreSQL的“默认功能”不够用，没关系——它允许你**自定义几乎所有东西**，堪称“数据库里的乐高”：

#### 1.4.1 自定义数据类型

比如你要存储“电话号码”，可以定义一个`phone_number`类型：

```sql
-- 1. 创建自定义类型（包含国家码、区号、号码）
CREATE TYPE phone_number AS (
  country_code VARCHAR(3), -- 国家码（比如+86）
  area_code VARCHAR(3),    -- 区号（比如010）
  number VARCHAR(8)        -- 号码（比如12345678）
);

-- 2. 用这个类型建表
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  phone phone_number -- 使用自定义类型
);

-- 3. 插入数据（用ROW()包裹自定义类型的值）
INSERT INTO users (name, phone)
VALUES ('张三', ROW('+86', '010', '12345678'));

-- 4. 查询数据（用.(字段名)取自定义类型的值）
SELECT name, (phone).country_code || '-' || (phone).area_code || '-' || (phone).number AS full_phone
FROM users;
```  

#### 1.4.2 自定义函数

PostgreSQL支持用多种语言写函数（比如PL/pgSQL、Python、Java）。比如你要计算两个点之间的距离，可以写一个函数：

```sql
-- 1. 定义点类型（PostgreSQL内置了geometry类型，但这里用自定义类型举例）
CREATE TYPE point AS (x INT, y INT);

-- 2. 定义计算距离的函数
CREATE OR REPLACE FUNCTION distance(p1 point, p2 point)
RETURNS FLOAT AS $$ -- 返回浮点型（距离）
BEGIN
  -- 勾股定理计算距离：√[(x1-x2)² + (y1-y2)²]
  RETURN SQRT(POW(p1.x - p2.x, 2) + POW(p1.y - p2.y, 2));
END;
$$ LANGUAGE plpgsql;

-- 3. 使用函数（计算(0,0)到(3,4)的距离）
SELECT distance(ROW(0,0)::point, ROW(3,4)::point); -- 返回5.0
```  

#### 1.4.3 自定义索引

如果默认的B-tree索引不够用（比如要查“距离某点1公里内的商店”），PostgreSQL允许你用**GiST**或**GIN**索引。比如用GiST索引加速几何查询：

```sql
-- 1. 创建存储商店位置的表（用PostgreSQL内置的geometry类型）
CREATE TABLE shops (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  location geometry(Point, 4326) -- Point代表点，4326是坐标系（WGS84）
);

-- 2. 添加GiST索引（加速几何查询）
CREATE INDEX shops_location_idx ON shops USING GIST (location);

-- 3. 查询“天安门附近1公里内的商店”（116.403874, 39.914885是天安门的坐标）
SELECT name
FROM shops
WHERE ST_DWithin(
  location, 
  ST_SetSRID(ST_MakePoint(116.403874, 39.914885), 4326), -- 天安门的点
  1000 -- 距离（米）
);
```  

### 1.5 课后Quiz：巩固你的理解

Q1：PostgreSQL作为ORDBMS，“对象”特性主要体现在哪里？  
**A1**：支持用户自定义数据类型、函数、运算符等“对象”特性。比如你可以定义`phone_number`
类型（包含国家码、区号、号码），或定义`distance`函数（像“对象的方法”一样计算距离）。

Q2：MVCC（多版本并发控制）解决了什么问题？  
**A2**：解决了“读”和“写”互相阻塞的问题。每个事务看到的是数据的“快照”，比如你在查订单时，别人可以修改订单，你看到的还是修改前的状态，直到别人提交事务。高并发场景下（比如秒杀），读写可以同时进行，不会卡死。

Q3：PostgreSQL的触发器能做什么？举个例子。  
**A3**：触发器可以在表发生插入、更新、删除时自动执行操作。比如当订单状态改为“完成”时，自动减少商品库存；或当用户注册时，自动发送欢迎邮件（需要结合外部服务）。

### 1.6 常见报错及解决

#### 报错1：`ERROR: relation "table_name" does not exist`

**原因**：

- 表名拼写错误（比如把`orders`写成`order`）；
- 表不在当前schema下（比如表在`sales` schema里，但你用了`public` schema）；
- 用户没有访问表的权限。

**解决办法**：

1. 检查表名拼写：用`\dt`命令（psql客户端）查看当前schema下的表；
2. 指定schema：比如`SELECT * FROM sales.orders;`（如果表在`sales` schema里）；
3. 授予权限：用`GRANT SELECT ON orders TO your_user;`给用户读权限。

**预防**：

- 用全小写、下划线分隔的命名规范（比如`user_orders`而不是`UserOrders`）；
- 总是指定schema（比如`public.orders`）；
- 给用户最小必要的权限（比如只读用户只给`SELECT`权限）。

#### 报错2：`ERROR: insert or update on table "orders" violates foreign key constraint "orders_user_id_fkey"`

**原因**：你插入的`user_id`在`users`表中不存在（比如`users`表没有`id=100`的用户，但你插入了`user_id=100`的订单）。

**解决办法**：

1. 检查`user_id`是否存在：`SELECT * FROM users WHERE id = 100;`；
2. 如果不存在，先插入用户，再插入订单。

**预防**：

- 用外键约束（PostgreSQL会自动检查）；
- 插入数据前先验证关联ID的存在。

### 参考链接

1. What Is PostgreSQL?：https://www.postgresql.org/docs/17/intro-whatis.html
2. Data Types：https://www.postgresql.org/docs/17/datatype.html
3. Triggers：https://www.postgresql.org/docs/17/triggers.html
4. MVCC：https://www.postgresql.org/docs/17/mvcc.html

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[能当关系型数据库还能玩对象特性，能拆复杂查询还能自动管库存，PostgreSQL凭什么这么香？](https://blog.cmdragon.cn/posts/b5474d1480509c5072085abc80b3dd9f/)



<details>
<summary>往期文章归档</summary>

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
- [如何让Celery任务像VIP客户一样享受优先待遇？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c24491a7ac7f7c5e9cf77596ebb27c51/)
- [如何让你的FastAPI Celery Worker在压力下优雅起舞？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c3129f4b424d2ed2330484b82ec31875/)
- [FastAPI与Celery的完美邂逅，如何让异步任务飞起来？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/b79c2c1805fe9b1ea28326b5b8f3b709/)
- [FastAPI消息持久化与ACK机制：如何确保你的任务永不迷路？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/13a59846aaab71b44ab6f3dadc5b5ec7/)

</details>


<details>
<summary>免费好用的热门在线工具</summary>

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