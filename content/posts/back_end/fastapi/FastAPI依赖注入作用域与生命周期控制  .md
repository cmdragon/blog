---
url: /posts/17629ae4ff3670792f832752e5cb8c33/
title: FastAPI依赖注入作用域与生命周期控制
date: 2025-04-08T00:02:10+08:00
lastmod: 2025-04-08T00:02:10+08:00
author: cmdragon

summary:
  FastAPI框架中，依赖项的作用域决定了它们的创建和销毁时机，主要分为应用级和请求级两种。应用级依赖在整个应用生命周期内只初始化一次，适合长期保持的昂贵资源；请求级依赖在每个HTTP请求时创建新实例，适合需要频繁初始化的资源。通过`yield`语法可以实现请求级依赖的生命周期控制，确保资源在使用后正确释放。合理划分依赖项作用域和精确控制生命周期，能显著提升应用性能和资源利用率。

categories:
  - fastapi

tags:
  - fastapi
  - 依赖注入
  - 资源管理

---
<img src="https://static.shutu.cn/shutu/jpeg/open5b/2025-04-08/778f5f30b05305afdd003e2d86fedf14.jpeg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[探索数千个预构建的 AI 应用，开启你的下一个伟大创意](https://tools.cmdragon.cn/zh/apps?category=ai_chat)

# FastAPI依赖注入作用域与生命周期控制详解

## 1. 依赖项作用域基础概念

在FastAPI框架中，依赖项的作用域决定了它们的创建和销毁时机。就像图书馆里的公共设施（应用级）与个人借阅的书籍（请求级）的区别，不同作用域的依赖项适用于不同的使用场景。

作用域主要分为两种类型：

1. **应用级作用域（Singleton）**：整个应用生命周期内只初始化一次
2. **请求级作用域（Request）**：每个HTTP请求都会创建新的实例

```python
from fastapi import Depends, FastAPI

app = FastAPI()


# 应用级依赖示例
class DatabasePool:
    def __init__(self):
        print("创建数据库连接池")
        self.pool = "模拟连接池"


db_pool = DatabasePool()


@app.get("/data")
async def get_data(pool: str = Depends(lambda: db_pool.pool)):
    return {"pool": pool}
```

## 2. 作用域划分实践技巧

### 2.1 应用级作用域配置

适合需要长期保持的昂贵资源，推荐在应用启动事件中初始化：

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 应用启动时初始化
    app.state.db_pool = await create_db_pool()
    yield
    # 应用关闭时清理
    await app.state.db_pool.close()


app = FastAPI(lifespan=lifespan)


@app.get("/items")
async def read_items(pool=Depends(lambda: app.state.db_pool)):
    return {"pool": pool.status}
```

### 2.2 请求级作用域实现

使用`yield`语法实现请求级依赖的生命周期控制：

```python
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession


async def get_db():
    # 每个请求创建新会话
    db_session = AsyncSession(bind=engine)
    try:
        yield db_session
    finally:
        # 请求结束后关闭会话
        await db_session.close()


@app.post("/users")
async def create_user(
        user: UserSchema,
        db: AsyncSession = Depends(get_db)
):
    db.add(User(**user.dict()))
    await db.commit()
    return {"status": "created"}
```

## 3. 生命周期控制模式

### 3.1 初始化-使用-销毁流程

```python
from typing import Generator
from fastapi import Depends


class FileProcessor:
    def __init__(self, filename):
        self.file = open(filename, "r")
        print(f"打开文件 {filename}")

    def process(self):
        return self.file.read()

    def close(self):
        self.file.close()
        print("文件已关闭")


def get_processor() -> Generator[FileProcessor, None, None]:
    processor = FileProcessor("data.txt")
    try:
        yield processor
    finally:
        processor.close()


@app.get("/process")
async def process_file(
        processor: FileProcessor = Depends(get_processor)
):
    content = processor.process()
    return {"content": content[:100]}
```

## 4. 混合作用域实战案例

组合不同作用域的依赖项实现高效资源管理：

```python
from fastapi import Depends, BackgroundTasks

# 应用级缓存
cache = {}


# 请求级数据库连接
async def get_db():
    ...


# 缓存依赖（应用级）
def get_cache():
    return cache


@app.post("/cached-data")
async def get_data(
        db: AsyncSession = Depends(get_db),
        cache: dict = Depends(get_cache),
        bg: BackgroundTasks = Depends()
):
    if "data" not in cache:
        result = await db.execute("SELECT ...")
        cache["data"] = result
        bg.add_task(lambda: cache.pop("data", None), delay=3600)
    return cache["data"]
```

## 5. 课后Quiz

### 问题1：请求级依赖的yield语句必须放在try/finally块中吗？

**答案**：不是必须，但推荐使用。finally块确保无论是否发生异常都会执行清理操作，避免资源泄漏

### 问题2：应用级依赖能否访问请求上下文？

**答案**：不能。应用级依赖在请求上下文创建之前就已经初始化，无法访问请求相关信息

## 6. 常见报错解决方案

### 错误1：RuntimeError: Dependency is not yield

**原因**：在异步依赖项中忘记使用yield语法

```python
# 错误示例
async def get_db():
    return Session()


# 正确写法
async def get_db():
    db = Session()
    try:
        yield db
    finally:
        db.close()
```

### 错误2：DependencyOveruseWarning

**现象**：频繁创建昂贵资源导致性能问题
**解决**：检查依赖项作用域是否合理，将数据库连接池等昂贵资源改为应用级作用域

### 错误3：ContextVariableNotFound

**场景**：在应用级依赖中尝试访问请求信息
**处理**：将需要请求信息的依赖改为请求级作用域，或通过参数传递所需数据

## 7. 环境配置与运行

安装依赖：

```bash
pip install fastapi uvicorn sqlalchemy python-dotenv
```

启动服务：

```bash
uvicorn main:app --reload --port 8000
```

测试端点：

```bash
curl http://localhost:8000/items
curl -X POST http://localhost:8000/users -H "Content-Type: application/json" -d '{"name":"John"}'
```

通过合理划分依赖项的作用域和精确控制生命周期，开发者可以显著提升FastAPI应用的性能和资源利用率。建议在实践中结合具体业务需求，通过性能测试确定最佳作用域配置方案。

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

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
- [HTTP协议与RESTful API实战手册（二）：用披萨店故事说透API设计奥秘 🍕 | cmdragon's Blog](https://blog.cmdragon.cn/posts/c8336c13112f68c7f9fe1490aa8d43fe/)


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