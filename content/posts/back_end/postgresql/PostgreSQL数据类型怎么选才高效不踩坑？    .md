---
url: /posts/bf54711525c507c5eacfa7b0151c39d2/  
title: PostgreSQL数据类型怎么选才高效不踩坑？    
date: 2025-09-27T01:23:27+08:00    
lastmod: 2025-09-27T01:23:27+08:00    
author:  cmdragon      
cover: https://api2.cmdragon.cn/upload/cmder/images/47ac5c3328274a08b6b4c8df8ecb8965~tplv-5jbd59dj06-image.png

summary:  
  PostgreSQL 提供丰富的原生数据类型，涵盖数值、字符、日期、几何、网络等多个场景。数值类型包括整数、串行、浮点和精确数值，选择时需权衡范围、精度和存储成本。字符类型有固定长度、可变长度和无长度限制的选项，适用于不同文本存储需求。日期/时间类型支持时区处理，推荐使用`timestamptz`确保跨时区一致性。此外，PostgreSQL 还支持布尔、二进制、几何、网络、JSON 和 UUID 等类型，满足多样化数据存储需求。合理选择数据类型能提升存储效率、避免数据错误并优化查询性能。

categories:  
  - postgresql

tags:  
  - 基础入门
  - 数据类型
  - 数值类型
  - 字符类型
  - 日期时间类型
  - JSON类型
  - UUID类型

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/47ac5c3328274a08b6b4c8df8ecb8965~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 一、PostgreSQL 数据类型概述

PostgreSQL 提供了丰富的原生数据类型，覆盖数值、字符、日期、几何、网络等多个场景。这些类型的设计遵循 SQL
标准，同时扩展了PostgreSQL特有的功能（如几何类型、JSONB）。理解数据类型是设计合理表结构的基础——**选择合适的类型能提升存储效率、避免数据错误、优化查询性能
**。

### 二、核心数据类型详解

#### 2.1 数值类型：精准存储数字

数值类型是最常用的类型之一，分为**整数、串行、浮点、精确数值**四大类，选择时需权衡**范围、精度、存储成本**。

##### 2.1.1 整数类型：固定范围的整数

PostgreSQL 支持3种整数类型，差异在于**存储大小和取值范围**：

- `smallint`（int2）：2字节，范围 `-32768 ~ 32767`，适合存储小范围整数（如“性别编码”“评分1-5”）。
- `integer`（int4/int）：4字节，范围 `-2147483648 ~ 2147483647`，最常用（如“用户ID”“商品数量”）。
- `bigint`（int8）：8字节，范围 `-9223372036854775808 ~ 9223372036854775807`，适合超大整数（如“订单量”“雪花ID”）。

**示例**：创建存储商品库存的表：

```sql
-- 库存表：商品ID用integer，库存数量用smallint（假设库存不超过3万）
CREATE TABLE product_stock (
    product_id integer PRIMARY KEY,
    stock smallint NOT NULL CHECK (stock >= 0)  -- 库存不能为负
);

-- 插入数据
INSERT INTO product_stock (product_id, stock) VALUES (1001, 500), (1002, 1200);
```

##### 2.1.2 串行类型：自动递增的整数

串行类型（`smallserial`/`serial`/`bigserial`）是**自动递增的整数**，本质是“整数类型 + 序列（Sequence）”的组合，适合作为主键（Primary
Key）。

- `smallserial`（serial2）：对应`smallint`，自动递增范围1~32767。
- `serial`（serial4）：对应`integer`，范围1~2147483647（最常用）。
- `bigserial`（serial8）：对应`bigint`，范围1~9223372036854775807。

**示例**：用`serial`作为用户表主键：

```sql
-- 用户表：user_id自动递增
CREATE TABLE users (
    user_id serial PRIMARY KEY,  -- 等价于：user_id integer PRIMARY KEY DEFAULT nextval('users_user_id_seq')
    username varchar(50) NOT NULL UNIQUE
);

-- 插入数据时无需指定user_id，自动生成
INSERT INTO users (username) VALUES ('alice'), ('bob');

-- 查询结果：user_id会是1、2
SELECT * FROM users;
```

##### 2.1.3 浮点类型：近似数值

浮点类型（`real`/`double precision`）用于存储**近似小数**，适合不需要精确计算的场景（如科学计算、统计预估）。

- `real`（float4）：4字节，精度约6位有效数字。
- `double precision`（float8/float）：8字节，精度约15位有效数字。

**注意**：浮点类型有精度损失，比如`0.1`无法精确存储，因此**财务计算（如金额）绝对不能用浮点类型**！

**示例**：存储商品重量（允许近似）：

```sql
CREATE TABLE products (
    product_id integer PRIMARY KEY,
    weight real  -- 重量，单位kg（如1.23kg）
);

INSERT INTO products VALUES (1001, 1.23), (1002, 4.5678);
```

##### 2.1.4 精确数值类型：无精度损失

`numeric`（或`decimal`）用于存储**精确小数**，适合财务、金融等需要高精度的场景（如金额、税率）。格式为`numeric(p, s)`：

- `p`：总有效位数（精度），范围1~1000。
- `s`：小数位数（刻度），范围0~p（默认0）。

**示例**：存储订单金额（精确到分）：

```sql
CREATE TABLE orders (
    order_id serial PRIMARY KEY,
    amount numeric(10, 2) NOT NULL  -- 总金额，最多10位数字，2位小数（如99999999.99）
);

INSERT INTO orders (amount) VALUES (123.45), (6789.01);

-- 计算总和（无精度损失）
SELECT SUM(amount) FROM orders;  -- 结果：6912.46
```

#### 2.2 字符类型：存储文本数据

PostgreSQL 提供3种字符类型，核心区别是**长度限制和存储方式**：
| 类型 | 格式 | 描述 | 应用场景 |
|---------------|---------------|---------------------------------------|---------------------------|
| `char(n)`     | 固定长度 | 长度不足时补空格，超过则报错 | 固定长度文本（身份证号） |
| `varchar(n)`  | 可变长度 | 最多存储n个字符，超过则报错 | 可变长度文本（用户名、标题）|
| `text`        | 可变长度 | 无长度限制（最多1GB） | 长文本（文章、评论） |

**注意**：`char(n)`会自动补空格，查询时需注意（如`'abc'::char(5)`存储为`'abc  '`），因此非必要不推荐使用。

**示例**：存储用户信息：

```sql
CREATE TABLE user_profile (
    user_id integer PRIMARY KEY,
    id_card char(18) NOT NULL UNIQUE,  -- 身份证号固定18位
    username varchar(50) NOT NULL,     -- 用户名最长50字
    bio text                           -- 个人简介，无长度限制
);

INSERT INTO user_profile VALUES (
    1,
    '110101199001011234',  -- 身份证号
    'alice',                -- 用户名
    '喜欢旅行和读书...'      -- 个人简介
);
```

#### 2.3 日期/时间类型：处理时间数据

日期/时间类型是业务系统的核心类型之一，PostgreSQL 提供4种核心类型：

##### 2.3.1 核心类型说明

| 类型                                        | 格式                           | 描述                                      |
|-------------------------------------------|------------------------------|-----------------------------------------|
| `date`                                    | YYYY-MM-DD                   | 日期（如2023-12-31）                         |
| `time [without time zone]`                | HH:MI:SS[.FFF]               | 时间（如14:30:00）                           |
| `time with time zone`                     | HH:MI:SS[.FFF]+TZ            | 带时区的时间（如14:30:00+08:00）                 |
| `timestamp [without time zone]`           | YYYY-MM-DD HH:MI:SS[.FFF]    | 日期时间（无时区，如2023-12-31 14:30:00）          |
| `timestamp with time zone`（`timestamptz`） | YYYY-MM-DD HH:MI:SS[.FFF]+TZ | 带时区的日期时间（推荐！如2023-12-31 14:30:00+08:00） |
| `interval`                                | 例如1 day 2 hours              | 时间间隔（如2天3小时）                            |

**关键建议**：

- 跨时区应用必须用`timestamptz`（PostgreSQL会将其转换为UTC存储，查询时自动转换为当前会话时区）。
- 避免用`time with time zone`（意义不大，因为时间带时区但无日期，无法处理 daylight saving time）。

##### 2.3.2 示例：存储订单时间

```sql
CREATE TABLE orders (
    order_id serial PRIMARY KEY,
    order_time timestamptz NOT NULL,  -- 带时区的订单时间
    delivery_time interval  -- 预计配送时间（如1天2小时）
);

-- 插入北京时区的订单时间（UTC+8）
INSERT INTO orders (order_time, delivery_time) VALUES (
    '2023-12-31 14:30:00+08',  -- 北京时间14:30
    '1 day 2 hours'             -- 预计1天2小时后送达
);

-- 查询订单的预计送达时间（order_time + delivery_time）
SELECT order_id, order_time, order_time + delivery_time AS estimated_delivery FROM orders;
-- 结果：estimated_delivery会是2024-01-01 16:30:00+08
```

#### 2.4 布尔类型：逻辑值存储

布尔类型（`boolean`或`bool`）用于存储**真/假**值，取值为`true`、`false`或`NULL`（表示未知）。

**示例**：存储用户激活状态：

```sql
CREATE TABLE users (
    user_id serial PRIMARY KEY,
    username varchar(50) NOT NULL,
    is_active boolean NOT NULL DEFAULT false  -- 默认未激活
);

-- 激活用户
UPDATE users SET is_active = true WHERE user_id = 1;

-- 查询激活的用户
SELECT * FROM users WHERE is_active = true;
```

#### 2.5 二进制类型：存储二进制数据

`bytea`类型用于存储**二进制数据**（如图片、文件、压缩包），最大存储1GB。

**示例**：存储用户头像（需先将图片文件放在PostgreSQL的数据目录或指定位置）：

```sql
CREATE TABLE user_avatar (
    user_id integer PRIMARY KEY,
    avatar bytea NOT NULL  -- 头像二进制数据
);

-- 插入头像（假设图片在/var/lib/postgresql/data/avatar.png）
INSERT INTO user_avatar (user_id, avatar) VALUES (
    1,
    pg_read_binary_file('avatar.png')  -- 读取二进制文件内容
);

-- 导出头像（将二进制数据写入文件）
SELECT pg_write_binary_file('avatar_export.png', avatar) FROM user_avatar WHERE user_id = 1;
```

#### 2.6 几何类型：处理空间数据

PostgreSQL 提供丰富的几何类型，用于存储**空间数据**（如地图坐标、图形），常见类型：

- `point`：点（如`(x, y)`）。
- `line`：无限直线（如`{a, b, c}`表示ax + by + c = 0）。
- `polygon`：多边形（如`((0,0), (1,0), (1,1), (0,1))`）。

**示例**：存储店铺位置（经纬度）：

```sql
CREATE TABLE shops (
    shop_id serial PRIMARY KEY,
    name varchar(100) NOT NULL,
    location point NOT NULL  -- 经纬度（如(116.40, 39.90)表示北京天安门）
);

-- 插入店铺位置
INSERT INTO shops (name, location) VALUES ('星巴克', '(116.40, 39.90)');

-- 查询距离某个点1公里内的店铺（需安装postgis扩展，此处简化用几何距离）
SELECT name FROM shops WHERE distance(location, '(116.41, 39.91)') < 1000;  -- distance返回米
```

#### 2.7 网络类型：存储网络地址

网络类型用于存储**IP地址、MAC地址**等网络信息，常见类型：

- `inet`：IPv4/IPv6地址（如`192.168.1.1`、`2001:db8::1`）。
- `cidr`：IPv4/IPv6网络地址（如`192.168.1.0/24`表示整个网段）。
- `macaddr`：MAC地址（如`00:11:22:33:44:55`）。

**示例**：存储用户登录IP：

```sql
CREATE TABLE user_login (
    login_id serial PRIMARY KEY,
    user_id integer NOT NULL,
    login_ip inet NOT NULL,  -- 用户登录IP
    login_time timestamptz NOT NULL
);

-- 插入登录记录
INSERT INTO user_login (user_id, login_ip, login_time) VALUES (
    1,
    '192.168.1.100',  -- IPv4地址
    '2023-12-31 14:30:00+08'
);

-- 查询某个网段的登录记录（如192.168.1.0/24）
SELECT * FROM user_login WHERE login_ip <<= '192.168.1.0/24';  -- <<= 表示“属于该网段”
```

#### 2.8 JSON类型：存储半结构化数据

PostgreSQL 支持两种JSON类型：`json`和`jsonb`，核心区别是**存储方式和查询性能**：
| 类型 | 存储方式 | 特点 | 应用场景 |
|-------|----------|---------------------------------------|---------------------------|
| `json`| 文本 | 保留原始格式，查询慢 | 存储不常查询的JSON |
| `jsonb`| 二进制 | 解析为树形结构，支持索引，查询快 | 频繁查询、更新的JSON |

**示例**：存储商品属性（半结构化数据）：

```sql
CREATE TABLE products (
    product_id serial PRIMARY KEY,
    name varchar(100) NOT NULL,
    attributes jsonb NOT NULL  -- 商品属性（如颜色、尺寸）
);

-- 插入商品（属性为JSON对象）
INSERT INTO products (name, attributes) VALUES (
    'T恤',
    '{"color": "red", "size": "M", "material": "cotton"}'::jsonb
);

-- 查询红色T恤（用->>运算符提取JSON字段值）
SELECT * FROM products WHERE attributes->>'color' = 'red';

-- 创建GIN索引（优化JSON查询）
CREATE INDEX idx_products_attributes ON products USING GIN (attributes);
```

#### 2.9 UUID类型：通用唯一标识符

`uuid`类型用于存储**UUID（Universally Unique Identifier）**，是128位的唯一标识符，适合**分布式系统**中的唯一标识（如订单ID、用户ID）。

**示例**：用UUID作为订单ID：

```sql
-- 先安装uuid-ossp扩展（生成UUID）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE orders (
    order_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),  -- 生成随机UUID
    user_id integer NOT NULL,
    amount numeric(10,2) NOT NULL
);

-- 插入订单（无需指定order_id）
INSERT INTO orders (user_id, amount) VALUES (1, 123.45);

-- 查询订单
SELECT * FROM orders;
-- 结果：order_id会是类似'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'的UUID
```

### 三、课后 Quiz：巩固所学

#### 问题1：财务系统中存储金额，应该选择哪种数值类型？为什么？

**答案**：选择`numeric(p, s)`（或`decimal`）。因为`numeric`是精确数值类型，无精度损失；而浮点类型（`real`/`double precision`
）会有精度损失，无法保证金额的准确性。

#### 问题2：`char(10)`、`varchar(10)`、`text`的核心区别是什么？

**答案**：

- `char(10)`：固定长度，存储10个字符，不足补空格，超过报错。
- `varchar(10)`：可变长度，最多存储10个字符，超过报错。
- `text`：可变长度，无字符限制（最多1GB）。

#### 问题3：跨时区应用中，日期时间类型应该选`timestamp`还是`timestamptz`？为什么？

**答案**：选`timestamptz`（带时区的timestamp）。因为`timestamptz`
会将时间转换为UTC存储，查询时自动转换为当前会话的时区，确保跨时区的时间一致性；而`timestamp`无时区信息，会导致不同时区的用户看到的时间不一致。

### 四、常见报错与解决方案

### 报错1：`ERROR: value "32768" is out of range for type smallint`

**原因**：`smallint`的最大值是32767，插入32768超出范围。  
**解决**：

- 将字段类型改为`integer`（最大值2147483647）；
- 检查应用程序是否生成了过大的值（比如年龄不可能到32768）。

### 报错2：`ERROR: invalid input syntax for type boolean: "1"`

**原因**：试图插入整数`1`到`boolean`字段（PostgreSQL的`boolean`只认`true/false`或`'t'/'f'`）。  
**解决**：

- 改为插入`true`（正确）：`INSERT INTO tasks (is_completed) VALUES (true);`
- 或用`CAST`转换：`INSERT INTO tasks (is_completed) VALUES (CAST(1 AS boolean));`

### 报错3：`ERROR: column "sku" is of type char(8) but expression is of type text`

**原因**：插入的字符串类型与字段类型不匹配（比如用`text`插入到`char(8)`）。  
**解决**：

- 显式转换类型：`INSERT INTO products (sku) VALUES (CAST('ABC12345' AS char(8)));`
- 或确保应用程序输出`char(8)`类型的字符串。

### 报错4：`ERROR: cannot execute UPDATE in a read-only transaction`

（注：此报错与数据类型无关，但常见）  
**原因**：数据库处于只读模式（比如备份时）。  
**解决**：

- 切换到可写模式：`SET default_transaction_read_only = false;`

## 参考链接

https://www.postgresql.org/docs/17/datatype.html

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[PostgreSQL数据类型怎么选才高效不踩坑？](https://blog.cmdragon.cn/posts/bf54711525c507c5eacfa7b0151c39d2/)




<details>
<summary>往期文章归档</summary>

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