---
url: /posts/edd7eaa71626c5d5d95f7a07c538cfe1/
title: FastAPI中的依赖注入与数据库事务管理
date: 2025-04-09T00:10:29+08:00
lastmod: 2025-04-09T00:10:29+08:00
author: cmdragon

summary:
  文章介绍了在FastAPI中使用依赖注入和SQLAlchemy进行数据库会话封装的方法，提供了三种事务管理模式的实现：自动事务模式、手动控制模式和装饰器模式。通过代码示例展示了如何创建用户注册功能，并处理事务和错误。强调了使用参数化查询防止SQL注入攻击的重要性，并提供了常见报错的解决方案，包括检查数据库连接参数、管理会话生命周期和调整连接池设置。

categories:
  - fastapi

tags:
  - fastapi
  - 依赖注入
  - 异步编程
  - SQLAlchemy
  - 事务管理

---
<img src="https://static.shutu.cn/shutu/jpeg/open66/2025-04-09/b80006aec612e1d5c8ba0fa6099c30a3.jpeg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[探索数千个预构建的 AI 应用，开启你的下一个伟大创意](https://tools.cmdragon.cn/zh/apps?category=ai_chat)

1. 依赖注入基础与数据库会话封装  
   （代码示例运行环境：Python 3.8+，需安装fastapi, uvicorn, sqlalchemy, asyncpg）

```python
from fastapi import Depends, FastAPI
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

# 初始化数据库连接（使用异步引擎）
DATABASE_URL = "postgresql+asyncpg://user:password@localhost/dbname"
engine = create_async_engine(DATABASE_URL, echo=True)
async_session_maker = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


# 封装数据库会话依赖
async def get_db() -> AsyncSession:
    """
    生成器函数创建数据库会话上下文
    使用yield代替return实现资源自动释放
    会话自动关闭机制保证连接池回收
    """
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


app = FastAPI()


@app.post("/users/")
async def create_user(
        name: str,
        session: AsyncSession = Depends(get_db)
):
    """
    路由函数通过Depends自动获取数据库会话
    事务管理需要在业务逻辑中显式控制
    注意异步await关键字的正确使用
    """
    from sqlalchemy import text
    try:
        # 执行原生SQL示例（实际建议使用ORM）
        await session.execute(
            text("INSERT INTO users (name) VALUES (:name)"),
            {"name": name}
        )
        await session.commit()
        return {"status": "created"}
    except Exception as e:
        await session.rollback()
        raise HTTPException(500, str(e))
```

2. 事务管理的三种实现模式

（1）自动事务模式（适合简单操作）：

```python
from fastapi import Depends
from databases import Database


async def transaction_wrapper(db: Database = Depends(get_db)):
    async with db.transaction():
        yield
```

（2）手动控制模式（复杂业务场景）：

```python
@app.post("/orders/")
async def create_order(
        user_id: int,
        db: AsyncSession = Depends(get_db)
):
    try:
        await db.begin()
        # 执行多个数据库操作
        await db.commit()
    except SQLAlchemyError:
        await db.rollback()
        raise
```

（3）装饰器模式（代码复用最佳实践）：

```python
from contextlib import asynccontextmanager


@asynccontextmanager
async def managed_transaction(db: AsyncSession):
    try:
        yield
        await db.commit()
    except Exception:
        await db.rollback()
        raise


# 在路由中使用
async def create_order(db: AsyncSession = Depends(get_db)):
    async with managed_transaction(db):
# 业务逻辑代码
```

3. 完整案例：用户注册连带创建档案  
   （包含事务管理和错误处理的最佳实践）

```python
from sqlalchemy import insert
from pydantic import BaseModel


class UserCreate(BaseModel):
    username: str
    email: str
    profile: dict


@app.post("/register/")
async def register_user(
        user_data: UserCreate,
        db: AsyncSession = Depends(get_db)
):
    async with db.begin():
        try:
            # 插入用户主表
            user_result = await db.execute(
                insert(users_table).values(
                    username=user_data.username,
                    email=user_data.email
                ).returning(users_table.c.id)
            )
            user_id = user_result.scalar()

            # 插入档案子表
            await db.execute(
                insert(profiles_table).values(
                    user_id=user_id,
                    **user_data.profile
                )
            )

            return {"user_id": user_id}

        except IntegrityError as e:
            await db.rollback()
            if "unique constraint" in str(e):
                raise HTTPException(400, "Username already exists")
            raise HTTPException(500, "Database error")
```

课后Quiz：  
Q1：使用原生SQL查询时，如何防止SQL注入攻击？  
A) 直接拼接字符串  
B) 使用参数化查询  
C) 过滤特殊字符  
D) 使用ORM自动处理

正确答案：B  
解析：参数化查询通过将用户输入与SQL语句分离的方式，从根本上阻止注入攻击。示例中的text()
函数配合参数字典即为正确做法。即使用ORM，也需要避免直接拼接查询字符串。

常见报错解决方案：  
错误现象：  
`sqlalchemy.exc.InterfaceError: (sqlalchemy.dialects.postgresql.asyncpg.InterfaceError) <class 'asyncpg.exceptions.ConnectionDoesNotExistError'>`

原因分析：

1. 数据库连接参数配置错误
2. 连接池耗尽未正确释放
3. 异步上下文管理不当

解决步骤：

1. 检查DATABASE_URL格式：postgresql+asyncpg://
2. 确保数据库服务正常运行
3. 在依赖项中正确使用async with管理会话生命周期
4. 调整连接池设置：

```python
engine = create_async_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_timeout=30
)
```

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

- [FastAPI依赖注入作用域与生命周期控制 | cmdragon's Blog](https://blog.cmdragon.cn/posts/ba3f8d095300f51122f8384c2bb23286/)
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
- [Pydantic多态模型：用鉴别器构建类型安全的API接口 | cmdragon's Blog](https://blog.cmdragon.cn/posts/fc7b42c24414cb24dd920fb2eae164f5/)
- [FastAPI性能优化指南：参数解析与惰性加载 | cmdragon's Blog](https://blog.cmdragon.cn/posts/d2210ab0f56b1e3ae62117530498ee85/)
- [FastAPI依赖注入：参数共享与逻辑复用 | cmdragon's Blog](https://blog.cmdragon.cn/posts/1821d820e2f8526b106ce0747b811faf/)
- [FastAPI安全防护指南：构建坚不可摧的参数处理体系 | cmdragon's Blog](https://blog.cmdragon.cn/posts/ed25f1c3c737f67a6474196cc8394113/)
- [FastAPI复杂查询终极指南：告别if-else的现代化过滤架构 | cmdragon's Blog](https://blog.cmdragon.cn/posts/eab4df2bac65cb8cde7f6a04b2aa624c/)
- [FastAPI 核心机制：分页参数的实现与最佳实践 | cmdragon's Blog](https://blog.cmdragon.cn/posts/8821ab1186b05252feda20836609463e/)
- [FastAPI 错误处理与自定义错误消息完全指南：构建健壮的 API 应用 🛠️ | cmdragon's Blog](https://blog.cmdragon.cn/posts/cebad7a36a676e5e20b90d616b726489/)
- [FastAPI 自定义参数验证器完全指南：从基础到高级实战 | cmdragon's Blog](https://blog.cmdragon.cn/posts/9d0a403c8be2b1dc31f54f2a32e4af6d/)
- [FastAPI 参数别名与自动文档生成完全指南：从基础到高级实战 🚀 | cmdragon's Blog](https://blog.cmdragon.cn/posts/2a912968ba048bad95a092487126f2ed/)
- [FastAPI Cookie 和 Header 参数完全指南：从基础到高级实战 🚀 | cmdragon's Blog](https://blog.cmdragon.cn/posts/f4cd8ed98ef3989d7c5c627f9adf7dea/)
- [FastAPI 表单参数与文件上传完全指南：从基础到高级实战 🚀 | cmdragon's Blog](https://blog.cmdragon.cn/posts/d386eb9996fa2245ce3ed0fa4473ce2b/)
- [FastAPI 请求体参数与 Pydantic 模型完全指南：从基础到嵌套模型实战 🚀 | cmdragon's Blog](https://blog.cmdragon.cn/posts/068b69e100a8e9ec06b2685908e6ae96/)
- [FastAPI 查询参数完全指南：从基础到高级用法 🚀 | cmdragon's Blog](https://blog.cmdragon.cn/posts/20e3eee2e462e49827506244c90c065a/)
- [FastAPI 路径参数完全指南：从基础到高级校验实战 🚀 | cmdragon's Blog](https://blog.cmdragon.cn/posts/c2afc335d7e290e99c72969806120f32/)
- [FastAPI路由专家课：微服务架构下的路由艺术与工程实践 🌐 | cmdragon's Blog](https://blog.cmdragon.cn/posts/be774b3724c7f10ca55defb76ff99656/)
- [FastAPI路由与请求处理进阶指南：解锁企业级API开发黑科技 🔥 | cmdragon's Blog](https://blog.cmdragon.cn/posts/23320e6c7e7736b3faeeea06c6fa2a9b/)
- [FastAPI路由与请求处理全解：手把手打造用户管理系统 🔌 | cmdragon's Blog](https://blog.cmdragon.cn/posts/9d842fb802a1650ff94a76ccf85e38bf/)
- [FastAPI极速入门：15分钟搭建你的首个智能API（附自动文档生成）🚀 | cmdragon's Blog](https://blog.cmdragon.cn/posts/f00c92e523b0105ed423cb8edeeb0266/)
- [HTTP协议与RESTful API实战手册（终章）：构建企业级API的九大秘籍 🔐 | cmdragon's Blog](https://blog.cmdragon.cn/posts/1aaea6dee0155d4100825ddc61d600c0/)


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