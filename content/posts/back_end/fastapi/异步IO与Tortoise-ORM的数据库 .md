---
url: /posts/618edd124a0fe8340f766e276faa89fb/
title: 异步IO与Tortoise-ORM的数据库
date: 2025-04-29T13:21:47+08:00
lastmod: 2025-04-29T13:21:47+08:00
author: cmdragon

summary:
  异步IO与同步IO的核心区别在于阻塞与非阻塞模式。Tortoise-ORM通过协议层、连接池层和ORM层实现异步数据库操作，支持高效的并发处理。用户管理系统搭建中，Tortoise-ORM与FastAPI结合，实现了用户创建和查询功能，并通过Pydantic进行数据校验。异步ORM适用于高并发场景，参数化查询可防止SQL注入。最佳实践包括连接池配置、查询优化和事务管理，确保系统性能和数据一致性。

categories:
  - fastapi

tags:
  - 异步IO
  - Tortoise-ORM
  - 数据库操作
  - fastapi
  - 异步编程
  - 连接池
  - 事务管理

---

<img src="https://static.shutu.cn/shutu/jpeg/open6a/2025-04-29/f09146a0e9eb787bd773e557e4dd75d1.jpeg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[探索数千个预构建的 AI 应用，开启你的下一个伟大创意](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

# 第一章：异步IO与Tortoise-ORM原理剖析

## 1.1 同步与异步的本质区别

想象你在快餐店点餐：

- **同步模式**：收银员接单后站在炸薯条机前等待，直到薯条炸好才接待下一位顾客
- **异步模式**：收银员接单后立即将订单交给后厨，转身接待下一位顾客，后厨准备好餐点会主动通知收银员

计算机领域的异步IO正是采用这种"非阻塞"模式：

```python
# 同步操作（线程阻塞）
def sync_query():
    result = db.execute("SELECT * FROM users")  # 线程在此等待
    process(result)


# 异步操作（事件驱动）
async def async_query():
    result = await db.execute("SELECT * FROM users")  # 释放控制权
    process(result)
```

## 1.2 Tortoise-ORM的异步实现

Tortoise-ORM通过三层架构实现异步操作：

| 层级   | 职责        | 关键技术             |
|------|-----------|------------------|
| 协议层  | 数据库通信协议解析 | asyncpg/aiomysql |
| 连接池层 | 管理异步数据库连接 | asyncio.Queue    |
| ORM层 | 模型映射与查询构建 | Python元类编程       |

典型查询流程解析：

```python
async def get_users():
    # 以下三个步骤交替执行，全程无阻塞
    users = await User.filter(age__gt=18)  # 1.生成SQL语句
    # 2.从连接池获取连接
    # 3.等待数据库响应
    return users
```

## 1.3 实战：用户管理系统搭建

### 环境准备

```bash
pip install fastapi uvicorn tortoise-orm aiosqlite pydantic
```

### 项目结构

```
project/
├── config.py
├── models.py
├── schemas.py
└── main.py
```

### 模型定义（models.py）

```python
from tortoise.models import Model
from tortoise import fields


class User(Model):
    id = fields.IntField(pk=True)
    username = fields.CharField(max_length=50, unique=True)
    hashed_password = fields.CharField(max_length=128)
    email = fields.CharField(max_length=100)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "users"
```

### 数据校验（schemas.py）

```python
from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    username: str
    password: str
    email: EmailStr

    class Config:
        schema_extra = {
            "example": {
                "username": "fastapi_user",
                "password": "strongpassword123",
                "email": "user@example.com"
            }
        }
```

### 核心逻辑（main.py）

```python
from fastapi import FastAPI, Depends, HTTPException
from tortoise.contrib.fastapi import register_tortoise
from models import User
from schemas import UserCreate

app = FastAPI()

# 初始化数据库
register_tortoise(
    app,
    db_url="sqlite://db.sqlite3",
    modules={"models": ["models"]},
    generate_schemas=True,
    add_exception_handlers=True,
)


@app.post("/users/", status_code=201)
async def create_user(user_data: UserCreate):
    # 密码哈希处理（实际项目应使用passlib）
    hashed_password = f"hashed_{user_data.password}"

    try:
        user = await User.create(
            username=user_data.username,
            hashed_password=hashed_password,
            email=user_data.email
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email
    }


@app.get("/users/{user_id}")
async def get_user(user_id: int):
    user = await User.get_or_none(id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at.isoformat()
    }
```

## 课后Quiz

**问题1**：以下哪种场景最适合使用异步ORM？  
A) 单用户的桌面应用程序  
B) 需要处理数千并发请求的API服务  
C) 执行复杂事务的财务系统  
D) 数据仓库的批量数据处理

**答案**：B  
解析：异步ORM在高并发IO密集型场景下能显著提升吞吐量，而ACD场景更多需要的是事务完整性或计算能力。

**问题2**：如何避免在ORM查询时发生SQL注入？  
A) 直接拼接字符串  
B) 使用ORM的参数化查询  
C) 手动过滤特殊字符  
D) 限制查询字段长度

**答案**：B  
解析：Tortoise-ORM的查询方法会自动进行参数化处理，有效防止SQL注入，这是最安全的做法。

## 常见报错解决方案

**错误1**：`422 Validation Error`  
原因分析：请求体不符合Pydantic模型要求  
解决方法：

1. 检查请求头`Content-Type`是否为`application/json`
2. 使用Swagger文档测试接口
3. 查看返回信息中的错误字段提示

**错误2**：`RuntimeError: Event loop is closed`  
原因分析：异步代码在错误的位置执行  
解决方法：

1. 确保所有异步操作都在async函数内
2. 使用`asyncio.run()`正确启动事件循环
3. 检查数据库连接是否正确关闭

**错误3**：`OperationalError: Connection refused`  
原因分析：数据库连接配置错误  
解决方法：

1. 检查`db_url`格式：`dialect://user:password@host:port/database`
2. 确认数据库服务是否正常运行
3. 验证网络防火墙设置

## 最佳实践建议

1. **连接池配置**：根据数据库最大连接数设置`maxsize`

```python
register_tortoise(
    app,
    db_url="postgres://user:pass@localhost:5432/mydb",
    modules={"models": ["models"]},
    generate_schemas=True,
    add_exception_handlers=True,
    connection_params={
        "maxsize": 20  # 控制连接池大小
    }
)
```

2. **查询优化**：使用`select_related`预加载关联数据

```python
# 获取用户及其所有文章
async def get_user_with_posts(user_id: int):
    user = await User.get(id=user_id).prefetch_related('posts')
    return user
```

3. **事务管理**：确保数据一致性

```python
async def transfer_funds(from_id, to_id, amount):
    async with in_transaction() as conn:
        from_user = await User.get(id=from_id).for_update()
        to_user = await User.get(id=to_id).for_update()

        if from_user.balance < amount:
            raise ValueError("Insufficient balance")

        from_user.balance -= amount
        to_user.balance += amount

        await from_user.save(using_db=conn)
        await to_user.save(using_db=conn)
```

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

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
- [FastAPI依赖注入系统及调试技巧 | cmdragon's Blog](https://blog.cmdragon.cn/posts/410fc13df286ea9e0efcc9d2cf1b5bbd/)
- [FastAPI依赖覆盖与测试环境模拟 | cmdragon's Blog](https://blog.cmdragon.cn/posts/8a2bd816fabac0bc10bd2cf8494e4631/)
- [FastAPI中的依赖注入与数据库事务管理 | cmdragon's Blog](https://blog.cmdragon.cn/posts/112c16d592891ad53a10b10e8127968d/)
- [FastAPI依赖注入实践：工厂模式与实例复用的优化策略 | cmdragon's Blog](https://blog.cmdragon.cn/posts/600434e384fb632e40f37aa20bb673f1/)
- [FastAPI依赖注入：链式调用与多级参数传递 | cmdragon's Blog](https://blog.cmdragon.cn/posts/7c1206bbcb7a5ae74ef57b3d22fae599/)
- [FastAPI依赖注入：从基础概念到应用 | cmdragon's Blog](https://blog.cmdragon.cn/posts/666995a31c7f669ff158ea9f5d59b1b7/)
- [FastAPI中实现动态条件必填字段的实践 | cmdragon's Blog](https://blog.cmdragon.cn/posts/c0adef45ce198a9e28bbac4fe72bb294/)
- [FastAPI中Pydantic异步分布式唯一性校验 | cmdragon's Blog](https://blog.cmdragon.cn/posts/a33be759b816743593c6644f0c4f2899/)
- [掌握FastAPI与Pydantic的跨字段验证技巧 | cmdragon's Blog](https://blog.cmdragon.cn/posts/99ebd315437db53071499b2e9b0bd19a/)
- [FastAPI中的Pydantic密码验证机制与实现 | cmdragon's Blog](https://blog.cmdragon.cn/posts/2034017b888b8c532d0a136f0eeeca51/)
- [深入掌握FastAPI与OpenAPI规范的高级适配技巧 | cmdragon's Blog](https://blog.cmdragon.cn/posts/84f771a5938908d4287f4b0d3ee77234/)
- [Pydantic字段元数据指南：从基础到企业级文档增强 | cmdragon's Blog](https://blog.cmdragon.cn/posts/25766784d506d6024c0626249e299d09/)
- [Pydantic Schema生成指南：自定义JSON Schema | cmdragon's Blog](https://blog.cmdragon.cn/posts/620198727c7909e8dea287430dcf67eb/)
- [Pydantic递归模型深度校验36计：从无限嵌套到亿级数据的优化法则 | cmdragon's Blog](https://blog.cmdragon.cn/posts/448b2f4522926a7bdf477332fa57df2b/)
- [Pydantic异步校验器深：构建高并发验证系统 | cmdragon's Blog](https://blog.cmdragon.cn/posts/38a93fe6312bbee008f3c11d9ecbb557/)
- [Pydantic根校验器：构建跨字段验证系统 | cmdragon's Blog](https://blog.cmdragon.cn/posts/3c17dfcf84fdc8190e40286d114cebb7/)
- [Pydantic配置继承抽象基类模式 | cmdragon's Blog](https://blog.cmdragon.cn/posts/48005c4f39db6b2ac899df96448a6fd2/)

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