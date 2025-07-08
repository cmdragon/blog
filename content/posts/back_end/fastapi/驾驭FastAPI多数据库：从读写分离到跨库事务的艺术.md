---
url: /posts/82c823f30695c4f6a2bbd95931894efe/
title: 驾驭FastAPI多数据库：从读写分离到跨库事务的艺术
date: 2025-05-16T00:58:24+08:00
lastmod: 2025-05-16T00:58:24+08:00
author: cmdragon

summary:
  在微服务架构中，FastAPI 多数据库配置管理通过独立数据存储实现隔离性、扩展性和性能优化。配置主从数据库时，使用 SQLAlchemy 创建异步引擎和会话工厂，并通过中间件实现动态数据库路由，实现读写分离。跨库事务处理采用 Saga 事务模式，确保分布式事务的一致性。以电商订单系统为例，展示了如何在 PostgreSQL、MongoDB 和 MySQL 之间进行跨库操作，并通过补偿机制处理事务失败。常见报错解决方案包括精确查询条件、正确管理会话和处理事务回滚。

categories:
  - fastapi

tags:
  - fastapi
  - 多数据库配置
  - 微服务架构
  - 分布式事务
  - Saga模式
  - 数据库连接池
  - 电商系统

---

<img src="https://static.shutu.cn/shutu/jpeg/open60/2025-05-16/94ffc8da972664ac8a7ab725cf51e805.jpeg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[探索数千个预构建的 AI 应用，开启你的下一个伟大创意](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

# 1. FastAPI多数据库配置管理实战

## 1.1 微服务架构下的数据库挑战

在微服务架构中，每个服务通常需要独立的数据存储。就像大型图书馆需要将不同学科的书籍分馆存放一样，电商系统可能将用户数据、订单数据、商品数据分别存储在不同数据库。这种架构带来三个核心需求：

1. **隔离性**：每个服务的数据库独立运行，避免单点故障
2. **扩展性**：不同数据库可按需选择存储引擎（如MySQL、MongoDB）
3. **性能优化**：读写分离配置可提升系统吞吐量

## 1.2 多数据库配置实现

以下示例展示如何在FastAPI中配置主从数据库：

```python
# database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# 主数据库配置（写操作）
MASTER_DATABASE_URL = "postgresql+asyncpg://user:password@master-host/dbname"
master_engine = create_async_engine(MASTER_DATABASE_URL, pool_size=10)

# 从数据库配置（读操作） 
REPLICA_DATABASE_URL = "postgresql+asyncpg://user:password@replica-host/dbname"
replica_engine = create_async_engine(REPLICA_DATABASE_URL, pool_size=20)

# 创建会话工厂
MasterSession = sessionmaker(master_engine, class_=AsyncSession, expire_on_commit=False)
ReplicaSession = sessionmaker(replica_engine, class_=AsyncSession, expire_on_commit=False)
```

关键配置参数说明：

- `pool_size`：连接池大小，根据服务负载调整
- `max_overflow`：允许超出连接池数量的临时连接
- `pool_timeout`：获取连接的超时时间（秒）

## 1.3 动态数据库路由

通过中间件实现读写分离：

```python
# dependencies.py
from fastapi import Request, Depends
from database import MasterSession, ReplicaSession


async def get_db(request: Request):
    """智能路由数据库连接"""
    # 写操作路由到主库
    if request.method in ['POST', 'PUT', 'DELETE']:
        db = MasterSession()
    else:  # 读操作使用从库
        db = ReplicaSession()

    try:
        yield db
    finally:
        await db.close()


# 在路由中使用
@app.post("/orders")
async def create_order(
        order: OrderSchema,
        db: AsyncSession = Depends(get_db)
):
# 业务逻辑
```

## 2. 跨库事务处理方案

### 2.1 分布式事务的挑战

当订单服务需要同时更新订单库和扣减库存库时，传统ACID事务不再适用。这就像需要同时在两个不同银行账户之间转账，必须保证要么全部成功，要么全部失败。

### 2.2 Saga事务模式实现

```python
# services/transaction_coordinator.py
from typing import List
from fastapi import HTTPException


class SagaCoordinator:
    def __init__(self):
        self.compensation_actions = []

    async def execute_transaction(self, steps: List[callable]):
        """执行Saga事务"""
        try:
            for step in steps:
                await step()
        except Exception as e:
            await self.compensate()
            raise HTTPException(500, "Transaction failed")

    async def compensate(self):
        """补偿操作执行"""
        for action in reversed(self.compensation_actions):
            try:
                await action()
            except Exception as compen_e:
                # 记录补偿失败日志
                logger.error(f"Compensation failed: {compen_e}")


# 使用示例
async def create_order_transaction():
    coordinator = SagaCoordinator()

    async def deduct_inventory():
        # 预留库存
        coordinator.compensation_actions.append(restore_inventory)

    async def create_order_record():
        # 创建订单记录
        coordinator.compensation_actions.append(delete_order_record)

    await coordinator.execute_transaction([
        deduct_inventory,
        create_order_record
    ])
```

## 3. 企业级案例：电商订单系统

### 3.1 场景描述

用户下单时需要同时操作：

- 订单数据库（PostgreSQL）
- 库存数据库（MongoDB）
- 用户积分数据库（MySQL）

### 3.2 完整实现代码

```python
# models.py
from pydantic import BaseModel


class OrderCreate(BaseModel):
    user_id: int
    product_id: str
    quantity: int


# services/order_service.py
from sqlalchemy import text
from motor.motor_asyncio import AsyncIOMotorClient


class OrderService:
    def __init__(self):
        # 初始化各数据库连接
        self.pg_pool = MasterSession
        self.mongo_client = AsyncIOMotorClient(MONGO_URI)
        self.mysql_pool = create_async_engine(MYSQL_URI)

    async def create_order(self, order_data: OrderCreate):
        """创建订单事务"""
        async with self.pg_pool() as pg_session,
                self.mysql_pool.begin() as mysql_conn:
            # 步骤1：扣减MySQL库存
            mysql_update = text("""
                UPDATE inventory 
                SET stock = stock - :quantity 
                WHERE product_id = :product_id
                AND stock >= :quantity
            """)
            await mysql_conn.execute(
                mysql_update,
                product_id=order_data.product_id,
                quantity=order_data.quantity
            )

            # 步骤2：创建PostgreSQL订单
            pg_insert = text("""
                INSERT INTO orders (user_id, product_id, quantity)
                VALUES (:user_id, :product_id, :quantity)
            """)
            await pg_session.execute(pg_insert, order_data.dict())

            # 步骤3：更新MongoDB用户行为
            mongo_db = self.mongo_client.user_behavior
            await mongo_db.events.insert_one({
                "user_id": order_data.user_id,
                "event_type": "order_created",
                "timestamp": datetime.now()
            })

            # 提交PostgreSQL事务
            await pg_session.commit()
```

## 课后Quiz

**问题1：** 当使用多个数据库时，如何保证跨库查询的事务一致性？

A. 使用数据库自带的分布式事务功能  
B. 采用最终一致性模式配合补偿机制  
C. 强制所有操作使用同个数据库  
D. 增加重试机制自动处理失败

**答案：** B  
**解析：** 在微服务架构中，不同服务通常使用不同数据库实例，传统ACID事务难以实施。采用Saga模式等最终一致性方案，配合补偿事务（如订单取消时的库存回补），是更可行的解决方案。

---

## 常见报错解决方案

**错误1：** `MultipleResultsFound: Multiple rows were found when one was required`

**原因：** 查询语句返回了多个结果，但期望单个结果  
**解决：**

1. 检查查询条件是否足够精确
2. 使用`.first()`代替`.one()`
3. 添加LIMIT 1子句

**错误2：** `InterfaceError: Connection already closed`

**原因：** 数据库连接过早关闭  
**预防：**

1. 使用上下文管理器管理会话
2. 检查连接池配置
3. 增加连接存活检测

```python
# 正确使用方式
async def get_db():
    async with Session() as session:
        yield session
```

**错误3：** `DBAPIError: Can't reconnect until invalid transaction is rolled back`

**原因：** 未正确处理事务回滚  
**解决：**

1. 在异常处理中添加显式回滚
2. 设置事务自动回滚

```python
async def safe_transaction():
    async with session.begin():
        try:
            # 业务操作
            await session.commit()
        except:
            await session.rollback()
            raise
```

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

- [数据库事务隔离与Alembic数据恢复的实战艺术 | cmdragon's Blog](https://blog.cmdragon.cn/posts/fa80b06b9f4ffd6c564533d90eb5880d/)
- [FastAPI与Alembic：数据库迁移的隐秘艺术 | cmdragon's Blog](https://blog.cmdragon.cn/posts/74f3348d6729c1bfe7cdde6ac5885633/)
- [飞行中的引擎更换：生产环境数据库迁移的艺术与科学 | cmdragon's Blog](https://blog.cmdragon.cn/posts/1c688674c3fa827553fcf0df2921704c/)
- [Alembic迁移脚本冲突的智能检测与优雅合并之道 | cmdragon's Blog](https://blog.cmdragon.cn/posts/547a5fe6da9ffe075425ff2528812991/)
- [多数据库迁移的艺术：Alembic在复杂环境中的精妙应用 | cmdragon's Blog](https://blog.cmdragon.cn/posts/3bcf24764e240d3cc8f0ef128cdf59c5/)
- [数据库事务回滚：FastAPI中的存档与读档大法 | cmdragon's Blog](https://blog.cmdragon.cn/posts/61f400974ef7e1af22b578822f89237c/)
- [Alembic迁移脚本：让数据库变身时间旅行者 | cmdragon's Blog](https://blog.cmdragon.cn/posts/4cbe05929a9b90555dc214eec17131c7/)
- [数据库连接池：从银行柜台到代码世界的奇妙旅程 | cmdragon's Blog](https://blog.cmdragon.cn/posts/1d808e4e97f59c12d2e5cf3302f3e1a7/)
- [点赞背后的技术大冒险：分布式事务与SAGA模式 | cmdragon's Blog](https://blog.cmdragon.cn/posts/e586c7819314ad2cb97f35676d143adc/)
- [N+1查询：数据库性能的隐形杀手与终极拯救指南 | cmdragon's Blog](https://blog.cmdragon.cn/posts/8ef22119705af92675eac4f3406ea37f/)
- [FastAPI与Tortoise-ORM开发的神奇之旅 | cmdragon's Blog](https://blog.cmdragon.cn/posts/895fc0bba54c53f76a03f00495a4503e/)
- [DDD分层设计与异步职责划分：让你的代码不再“异步”混乱 | cmdragon's Blog](https://blog.cmdragon.cn/posts/f2143b377ecc988d563b29100ca4ff77/)
- [异步数据库事务锁：电商库存扣减的防超卖秘籍 | cmdragon's Blog](https://blog.cmdragon.cn/posts/dd8b49ce80066db8c2671d365a9e9e32/)
- [FastAPI中的复杂查询与原子更新指南 | cmdragon's Blog](https://blog.cmdragon.cn/posts/f8a2c5f2662532fe5dca3a3e1f7e0b20/)
- [深入解析Tortoise-ORM关系型字段与异步查询 | cmdragon's Blog](https://blog.cmdragon.cn/posts/7a69d1a7450d4d145503b289dbf21aa6/)
- [FastAPI与Tortoise-ORM模型配置及aerich迁移工具 | cmdragon's Blog](https://blog.cmdragon.cn/posts/acef6b096283b5ab1913f132aac1809e/)
- [异步IO与Tortoise-ORM的数据库 | cmdragon's Blog](https://blog.cmdragon.cn/posts/1789d4e5a38dafd99e42844199ad0afd/)
- [FastAPI数据库连接池配置与监控 | cmdragon's Blog](https://blog.cmdragon.cn/posts/c8fb8790dcb16b2823d65c792391e9a9/)
- [分布式事务在点赞功能中的实现 | cmdragon's Blog](https://blog.cmdragon.cn/posts/863390c56aa08b3d8d0f89e268352f3d/)
- [Tortoise-ORM级联查询与预加载性能优化 | cmdragon's Blog](https://blog.cmdragon.cn/posts/a152345e1380d0c70021d29045600a17/)
- [使用Tortoise-ORM和FastAPI构建评论系统 | cmdragon's Blog](https://blog.cmdragon.cn/posts/df5931d400033ee5e8df91d8144d7f63/)
- [分层架构在博客评论功能中的应用与实现 | cmdragon's Blog](https://blog.cmdragon.cn/posts/5c632c0277535434021491de6641be44/)
- [深入解析事务基础与原子操作原理 | cmdragon's Blog](https://blog.cmdragon.cn/posts/6f4ae59a09bfa05596ed8632ca772076/)
- [掌握Tortoise-ORM高级异步查询技巧 | cmdragon's Blog](https://blog.cmdragon.cn/posts/d34050404ca8a9a7949fcb2b006a3eee/)
- [FastAPI与Tortoise-ORM实现关系型数据库关联 | cmdragon's Blog](https://blog.cmdragon.cn/posts/a41051bdc4551c2cdf3d55d230c3d8b9/)
- [Tortoise-ORM与FastAPI集成：异步模型定义与实践 | cmdragon's Blog](https://blog.cmdragon.cn/posts/c41e34782be5f4aa82d189539b6ae975/)
- [异步编程与Tortoise-ORM框架 | cmdragon's Blog](https://blog.cmdragon.cn/posts/5d60017354ebcd5459eea4d5c7788bf1/)
- [FastAPI数据库集成与事务管理 | cmdragon's Blog](https://blog.cmdragon.cn/posts/0df867e01706fcb9c2e16ea07671a9e4/)
- [FastAPI与SQLAlchemy数据库集成 | cmdragon's Blog](https://blog.cmdragon.cn/posts/5eec661b6296af84c7e64b3da6ed1030/)
- [FastAPI与SQLAlchemy数据库集成与CRUD操作 | cmdragon's Blog](https://blog.cmdragon.cn/posts/60dc55ce30e09273ab6c5dd7ba92de4b/)
- [FastAPI与SQLAlchemy同步数据库集成 | cmdragon's Blog](https://blog.cmdragon.cn/posts/b3bb21bb0bd4c0c405cde6e4f370652c/)
- [SQLAlchemy 核心概念与同步引擎配置详解 | cmdragon's Blog](https://blog.cmdragon.cn/posts/c29f29ac3472c48c9a320d322880fd35/)
- [FastAPI依赖注入性能优化策略 | cmdragon's Blog](https://blog.cmdragon.cn/posts/fbd07ee5d0cef3ec358543a033fa286a/)
- [FastAPI安全认证中的依赖组合 | cmdragon's Blog](https://blog.cmdragon.cn/posts/bc2e02e1be3e8281c9589bdb87bf9b50/)

## 免费好用的热门在线工具

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
-