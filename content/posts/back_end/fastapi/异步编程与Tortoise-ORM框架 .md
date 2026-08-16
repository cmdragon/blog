---
url: /posts/5265d648f0fd4ea5e11af203bc59301d/
title: 异步编程与Tortoise-ORM框架
date: 2025-04-19T00:13:05+08:00
lastmod: 2025-04-19T00:13:05+08:00
author: cmdragon

summary:
  异步编程通过async/await语法实现协程，单线程可处理多个并发请求，适合IO密集型场景。Tortoise-ORM专为异步设计，支持完整ORM功能和多种数据库，与Pydantic深度集成。整合FastAPI时，通过`register_tortoise`初始化ORM，使用`in_transaction`管理事务，确保操作原子性。常见问题包括未使用await返回协程对象和事件循环关闭错误，需通过正确的事件循环启动和事务管理解决。

categories:
  - fastapi

tags:
  - fastapi
  - 异步编程
  - Tortoise-ORM
  - 异步IO
  - 数据库事务

---
<img src="https://static.shutu.cn/shutu/jpeg/open13/2025-04-19/801f67aaf52a17d16502eb6e3ecadf50.jpeg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[探索数千个预构建的 AI 应用，开启你的下一个伟大创意](https://tools.cmdragon.cn/zh/apps?category=ai_chat)

# 第一章：异步编程基础与Tortoise-ORM框架定位

## 1.1 异步IO原理与协程机制

当你在快餐店排队时，同步IO就像站在队列中干等取餐，而异步IO则是先下单后去玩手机，听到叫号再取餐。现代Web应用需要同时服务成千上万个这样的"
顾客"，这正是异步编程的价值所在。

Python通过async/await语法实现协程：

```python
async def fetch_data():
    # 模拟IO操作
    await asyncio.sleep(1)
    return {"data": "result"}


# 事件循环驱动执行
async def main():
    task1 = fetch_data()
    task2 = fetch_data()
    await asyncio.gather(task1, task2)  # 并发执行


asyncio.run(main())
```

关键点解析：

- `async def` 声明异步函数（协程）
- `await` 将控制权交还事件循环
- 单个线程可处理多个并发请求

与传统同步模型对比：

| 指标     | 同步模式   | 异步模式     |
|--------|--------|----------|
| 线程使用   | 1请求1线程 | 单线程处理多请求 |
| IO等待处理 | 阻塞     | 非阻塞      |
| 适合场景   | CPU密集型 | IO密集型    |

## 1.2 Tortoise-ORM的异步设计哲学

传统ORM（如Django ORM）在异步环境中会形成性能瓶颈。Tortoise-ORM专为异步而生，其架构设计呈现以下特点：

```python
from tortoise.models import Model
from tortoise import fields


class User(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=50)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "auth_user"
```

框架核心优势：

1. 完整的ORM功能支持（关系、事务、聚合）
2. 原生异步查询接口设计
3. 支持PostgreSQL/MySQL/SQLite
4. 与Pydantic深度集成

## 1.3 整合FastAPI的完整示例

创建具备完整功能的API端点：

```python
from fastapi import FastAPI, Depends
from tortoise.contrib.fastapi import register_tortoise
from pydantic import BaseModel

app = FastAPI()


# 请求体模型
class UserCreate(BaseModel):
    name: str


# 响应模型
class UserOut(UserCreate):
    id: int
    created_at: datetime


# 数据库配置
DB_CONFIG = {
    "connections": {"default": "sqlite://db.sqlite3"},
    "apps": {
        "models": {
            "models": ["__main__"],  # 自动发现当前模块的模型
            "default_connection": "default",
        }
    },
}

# 注册Tortoise-ORM
register_tortoise(
    app,
    config=DB_CONFIG,
    generate_schemas=True,  # 自动建表
    add_exception_handlers=True,
)


# 依赖注入数据库连接
async def get_db():
    async with in_transaction() as conn:
        yield conn


@app.post("/users", response_model=UserOut)
async def create_user(user: UserCreate, conn=Depends(get_db)):
    """
    创建用户并返回完整数据
    使用事务保证原子性操作
    """
    db_user = await User.create(**user.dict(), using_db=conn)
    return UserOut.from_orm(db_user)
```

代码要点解析：

- `register_tortoise` 实现ORM初始化
- `in_transaction` 管理事务作用域
- `using_db` 参数确保使用同一连接
- `from_orm` 自动转换模型为Pydantic对象

## 课后Quiz

**Q1：当数据库查询未使用await时会导致什么现象？**
A. 立即返回查询结果  
B. 抛出RuntimeWarning  
C. 返回coroutine对象  
D. 程序崩溃

**正确答案：C**  
解析：异步函数必须使用await执行，否则将返回未被执行的协程对象，这是常见的初学者错误。

**Q2：如何确保多个更新操作在同一个事务中？**
A. 使用@transaction装饰器  
B. 手动begin/commit  
C. 通过in_transaction上下文管理器  
D. 所有操作自动在事务中

**正确答案：C**  
解析：`async with in_transaction() as conn`会创建事务作用域，所有在该上下文中的操作使用同一个连接。

## 常见报错解决方案

**问题1：422 Unprocessable Entity**

```json
{
  "detail": [
    {
      "loc": [
        "body",
        "name"
      ],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**原因分析：**

- 请求体缺少name字段
- 字段类型不匹配（如数字传字符串）
- Pydantic模型校验失败

**解决方案：**

1. 检查请求体是否符合API文档
2. 使用Swagger UI进行测试
3. 查看模型字段定义是否包含required=True

**问题2：RuntimeError: Event loop is closed**
**产生场景：**

```python
# 错误写法
async def get_data():
    await User.all()


# 同步上下文中直接调用
get_data()  
```

**正确处理：**

```python
async def main():
    await get_data()


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
```

**预防建议：**

- 始终通过事件循环启动异步程序
- 在FastAPI路由中自动管理事件循环
- 避免在同步代码中直接调用协程

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

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