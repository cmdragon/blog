---
url: /posts/a7c81698b93b9fa1034ac8c246a62d50/
title: FastAPI依赖注入实践：工厂模式与实例复用的优化策略
date: 2025-04-06T01:22:25+08:00
lastmod: 2025-04-06T01:22:25+08:00
author: cmdragon

summary:
  FastAPI依赖注入系统中，类依赖的默认行为是为每个请求创建新实例，可能导致性能问题。通过工厂模式控制实例创建过程，可解耦配置和服务实例化，支持依赖层级嵌套，符合单一职责原则。使用lru_cache实现带缓存的工厂模式，优化高频调用场景性能。单例模式实现真正的单例依赖，请求级别复用策略在请求处理周期内复用实例。实际应用场景包括配置中心集成和多租户系统，动态配置加载和租户感知的依赖注入。常见报错解决方案涉及422 Validation Error和依赖项初始化失败。

categories:
  - fastapi

tags:
  - fastapi
  - 性能优化
  - 依赖注入
  - 单例模式

---
<img src="https://static.shutu.cn/shutu/jpeg/opene8/2025-04-06/c6d40b8e98c312d60a6e9113e4f609d9.jpeg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[探索数千个预构建的 AI 应用，开启你的下一个伟大创意](https://tools.cmdragon.cn/zh/apps?category=ai_chat)

# FastAPI依赖注入深度实践：类依赖的工厂模式与实例复用

## 一、类依赖的基本原理

在FastAPI的依赖注入系统中，类作为依赖项使用时，框架会自动创建类的实例。当我们这样定义一个路由处理函数时：

```python
@app.get("/items/")
def read_items(service: ItemService = Depends()):
    return service.get_items()
```

FastAPI会为每个请求创建一个新的ItemService实例。这种默认行为在某些场景下可能产生性能问题，特别是当依赖类需要执行初始化数据库连接、加载大文件等耗时操作时。

## 二、工厂模式实现

### 2.1 工厂函数基础实现

通过工厂模式控制实例创建过程：

```python
class DatabaseConfig:
    def __init__(self, url: str = "sqlite:///test.db"):
        self.url = url


class DatabaseService:
    def __init__(self, config: DatabaseConfig):
        self.connection = self.create_connection(config.url)

    def create_connection(self, url):
        # 模拟数据库连接
        print(f"Creating new connection to {url}")
        return f"Connection_{id(self)}"


def get_db_service(config: DatabaseConfig = Depends()) -> DatabaseService:
    return DatabaseService(config)


@app.get("/users/")
def get_users(service: DatabaseService = Depends(get_db_service)):
    return {"connection": service.connection}
```

这个实现的特点：

- 解耦配置和服务的实例化
- 支持依赖层级嵌套（DatabaseConfig自动注入到工厂函数）
- 符合单一职责原则

### 2.2 带缓存的工厂模式

优化高频调用场景的性能：

```python
from fastapi import Depends
from functools import lru_cache


class AnalysisService:
    def __init__(self, config: dict):
        self.model = self.load_ai_model(config["model_path"])

    def load_ai_model(self, path):
        print(f"Loading AI model from {path}")
        return f"Model_{id(self)}"


@lru_cache(maxsize=1)
def get_analysis_service(config: dict = {"model_path": "models/v1"}) -> AnalysisService:
    return AnalysisService(config)


@app.get("/predict")
def make_prediction(service: AnalysisService = Depends(get_analysis_service)):
    return {"model": service.model}
```

缓存机制说明：

- 使用lru_cache实现内存缓存
- maxsize=1表示只缓存最新实例
- 当配置参数变化时会自动创建新实例
- 适合模型加载等重量级初始化场景

## 三、实例复用策略

### 3.1 单例模式实现

实现真正的单例依赖：

```python
from contextlib import contextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


class DatabaseSingleton:
    _instance = None

    def __new__(cls, dsn: str):
        if not cls._instance:
            cls._instance = super().__new__(cls)
            cls._instance.engine = create_engine(dsn)
            cls._instance.Session = sessionmaker(bind=cls._instance.engine)
        return cls._instance


@contextmanager
def get_db_session(dsn: str = "sqlite:///test.db"):
    db = DatabaseSingleton(dsn)
    session = db.Session()
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()


@app.get("/transactions")
def get_transactions(session=Depends(get_db_session)):
    return {"status": "success"}
```

### 3.2 请求级别复用

在请求处理周期内复用实例：

```python
from fastapi import Request


class RequestTracker:
    def __init__(self, request: Request):
        self.request = request
        self.start_time = time.time()

    @property
    def duration(self):
        return time.time() - self.start_time


def get_tracker(request: Request) -> RequestTracker:
    if not hasattr(request.state, "tracker"):
        request.state.tracker = RequestTracker(request)
    return request.state.tracker


@app.get("/status")
def get_status(tracker: RequestTracker = Depends(get_tracker)):
    return {"duration": tracker.duration}
```

## 四、实际应用场景

### 4.1 配置中心集成

动态配置加载示例：

```python
from pydantic import BaseSettings


class AppSettings(BaseSettings):
    env: str = "dev"
    api_version: str = "v1"

    class Config:
        env_file = ".env"


def config_factory() -> AppSettings:
    return AppSettings()


def get_http_client(settings: AppSettings = Depends(config_factory)):
    timeout = 30 if settings.env == "prod" else 100
    return httpx.Client(timeout=timeout)
```

### 4.2 多租户系统

租户感知的依赖注入：

```python
class TenantContext:
    def __init__(self, tenant_id: str):
        self.tenant_id = tenant_id
        self.config = self.load_tenant_config()

    def load_tenant_config(self):
        # 模拟从数据库加载配置
        return {
            "db_url": f"sqlite:///tenant_{self.tenant_id}.db",
            "theme": "dark" if self.tenant_id == "acme" else "light"
        }


def tenant_factory(tenant_id: str = Header(...)) -> TenantContext:
    return TenantContext(tenant_id)


@app.get("/dashboard")
def get_dashboard(ctx: TenantContext = Depends(tenant_factory)):
    return {"theme": ctx.config["theme"]}
```

## 五、课后Quiz

1. 工厂模式在依赖注入中的主要作用是？
   A) 减少代码量  
   B) 控制实例创建过程  
   C) 提高路由处理速度  
   D) 自动生成API文档

2. 使用lru_cache装饰器缓存服务实例时，当什么情况下会创建新实例？
   A) 每次请求时  
   B) 输入参数变化时  
   C) 服务类代码修改时  
   D) 服务器重启时

3. 在多租户系统中，如何实现不同租户的数据库隔离？
   A) 使用不同的路由前缀  
   B) 基于租户ID动态生成数据库连接  
   C) 为每个租户创建独立应用实例  
   D) 使用请求头认证

（答案：1.B 2.B 3.B）

## 六、常见报错解决方案

### 错误1：422 Validation Error

**现象**：

```json
{
  "detail": [
    {
      "loc": [
        "header",
        "x-tenant-id"
      ],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**原因分析**：

- 请求缺少必要的Header参数
- 工厂函数参数类型声明错误
- 依赖项层级结构不匹配

**解决方案**：

1. 检查请求是否包含所有必需的Header
2. 验证工厂函数的参数类型声明
3. 使用依赖关系图工具调试：
   ```bash
   uvicorn main:app --reload --debug
   ```

### 错误2：依赖项初始化失败

**现象**：

```
RuntimeError: Unable to initialize service - missing config
```

**排查步骤**：

1. 检查依赖项的参数传递链路
2. 验证配置对象的默认值设置
3. 在工厂函数中添加调试日志：
   ```python
   def get_service(config: AppSettings):
       print("Current config:", config.dict())
       return MyService(config)
   ```

**预防建议**：

- 为所有配置参数设置合理的默认值
- 使用pydantic的Field验证：
  ```python
  class AppSettings(BaseSettings):
      db_url: str = Field(..., env="DATABASE_URL")
  ```

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

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
- [从零构建你的第一个RESTful API：HTTP协议与API设计超图解指南 🌐 | cmdragon's Blog](https://blog.cmdragon.cn/posts/1960fe96ab7bb621305c9524cc451a2f/)


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