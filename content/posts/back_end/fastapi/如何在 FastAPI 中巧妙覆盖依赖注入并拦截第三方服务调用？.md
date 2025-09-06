---
url: /posts/2d992ef9e8962dc0a4a0b5348d486114/
title: 如何在 FastAPI 中巧妙覆盖依赖注入并拦截第三方服务调用？
date: 2025-09-06T03:34:14+08:00
lastmod: 2025-09-06T03:34:14+08:00
author: cmdragon
cover: /images/xw_20250906095706.png

summary:
  FastAPI 的依赖注入系统允许解耦复杂依赖关系，便于代码重用。在测试中，可通过 `dependencies_overrides` 覆盖真实依赖，避免影响实际服务。多层依赖覆盖时，需特别注意共享资源（如数据库连接）的处理。对于第三方服务调用，可使用自定义 HTTP 客户端拦截器实现请求拦截、模拟和降级处理，确保在服务异常时返回降级数据。常见报错如 `422 Unprocessable Entity` 和 `500 Internal Server Error` 可通过模型验证和异常处理解决，而 `TimeoutError` 则可通过设置超时和重试机制预防。

categories:
  - fastapi

tags:
  - FastAPI
  - 依赖注入
  - 单元测试
  - 请求拦截
  - 第三方服务调用
  - 错误处理
  - 模拟与覆盖

---


<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 1. 依赖注入系统模拟与覆盖

#### 1.1 依赖注入的核心概念

FastAPI 的依赖注入系统是其核心特性之一，它允许你将复杂依赖关系解耦并重用代码。例如数据库连接、授权验证等场景：

```python
# 示例：基本依赖注入
from fastapi import Depends, FastAPI

app = FastAPI()


async def common_params(limit: int = 100, offset: int = 0):
    return {"limit": limit, "offset": offset}


@app.get("/items/")
async def read_items(params: dict = Depends(common_params)):
    return {"params": params}
```

#### 1.2 测试场景中的覆盖技术

在单元测试中，需要覆盖真实依赖（如数据库连接），避免对实际服务产生影响。使用 FastAPI 的 `dependencies_overrides`：

```python
# 测试覆盖真实数据库的示例
from fastapi.testclient import TestClient
from .main import app, get_db  # 原始依赖

client = TestClient(app)


# 创建虚假的数据库依赖
async def fake_db():
    return MockDatabase()


# 覆盖原始依赖
app.dependency_overrides[get_db] = fake_db


def test_read_items():
    response = client.get("/items")
    assert response.status_code == 200
```

#### 1.3 多层依赖覆盖

```mermaid
graph TD
    A[路由处理函数] --> B[依赖A]
    A --> C[依赖B]
    B --> D[子依赖A1]
    C --> E[子依赖B1]
    D --> F[数据库连接]
    E --> F[数据库连接]
    
    style F fill:#f9f,stroke:#333
```

要特别注意底层依赖的覆盖，比如共享的数据库连接对象：

```python
# 覆盖共享资源
class MockDBConnection:
    async def execute(self, query):
        return ["mock_data"]


def override_db():
    return MockDBConnection()


app.dependency_overrides[get_db_connection] = override_db
```

### 2. 第三方服务调用的请求拦截

#### 2.1 拦截模式与应用场景

当需要调用外部 API 时，可能遇到：

- 测试时避免实际 API 调用
- 实现请求降级（如外部服务宕机）
- 调试时记录请求内容
  FastAPI 推荐使用自定义 HTTP 客户端拦截器。

#### 2.2 请求拦截实现

```python
from httpx import AsyncClient, Request, Response


class LoggingClient(AsyncClient):
    async def send(self, request: Request, **kwargs) -> Response:
        print(f"Sending: {request.method} {request.url}")
        return await super().send(request, **kwargs)


# 在路由中使用
@app.get("/external")
async def external_data(
        client: LoggingClient = Depends(lambda: LoggingClient())
):
    response = await client.get("https://api.example.com/data")
    return response.json()
```

#### 2.3 请求模拟与降级处理

```mermaid
flowchart LR
    A[业务代码] --> B{拦截器检查}
    B -->|服务正常| C[调用真实API]
    B -->|服务异常| D[返回缓存数据]
    B -->|测试模式| E[返回模拟数据]
```

```python
# 完整的拦截器实现
import httpx
from fastapi import Depends


class ResilientClient(AsyncClient):
    def __init__(self, mock_mode=False):
        self.mock_mode = mock_mode

    async def send(self, request: Request, **kwargs) -> Response:
        if self.mock_mode:
            return self.create_mock_response(request)

        try:
            return await super().send(request, timeout=10, **kwargs)
        except httpx.ConnectError:
            return self.return_fallback_data(request)

    def create_mock_response(self, request):
        return Response(200, json={"mock": "data"})

    def return_fallback_data(self, request):
        return Response(503, json={"error": "Service unavailable"})
```

### 3. 课后 Quiz

1. **问题**: 当覆盖多层依赖时，需要特别注意哪种共享资源的处理？  
   **答案**: 共享的数据库连接对象。如果上层依赖和下层依赖使用了相同的数据库连接，需要确保整个链路上的依赖都被正确覆盖，否则可能造成依赖泄漏。

2. **问题**: 当第三方服务返回 503 错误时，我们的拦截器会如何响应？  
   **答案**: 通过 `return_fallback_data` 方法返回 503 响应和降级数据。这实现了请求降级，避免因外部服务问题导致整个应用不可用。

---

### 4. 常见报错解决方案

#### 4.1 `422 Unprocessable Entity`

**产生原因**:

- Pydantic 模型验证失败
- 依赖项类型不匹配  
  **解决方案**:

```python
# 检查模型定义
class Item(BaseModel):
    name: str  # 确保没有类型错误
    price: float


# 添加验证提示
@app.exception_handler(RequestValidationError)
async def validation_handler(request, exc):
    return JSONResponse(
        status_code=400,
        content=jsonable_encoder({"detail": exc.errors()})
    )
```

#### 4.2 `500 Internal Server Error in Dependency`

**产生原因**:

- 依赖项函数中出现未处理异常
- 依赖覆盖未生效  
  **解决方案**:

```python
# 增加依赖项的异常处理
async def secure_dependency():
    try:
        yield connection
    except Exception:
        raise HTTPException(500, "Dependency error")
    finally:
        clean_up_resources()


# 确认测试中执行了覆盖
app.dependency_overrides[real_dependency] = mock_dependency
```

#### 4.3 `TimeoutError in HTTP Client`

**产生原因**:

- 外部API响应超时
- 网络波动  
  **预防建议**:

```python
# 设置合理超时时间
client = ResilientClient(timeout=5.0)

# 添加重试机制
import backoff


@backoff.on_exception(backoff.expo, httpx.RequestError)
async def safe_request(url):
    return await client.get(url)
```

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[如何在 FastAPI 中巧妙覆盖依赖注入并拦截第三方服务调用？](https://blog.cmdragon.cn/posts/2d992ef9e8962dc0a4a0b5348d486114/)



<details>
<summary>往期文章归档</summary>

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
- [FastAPI的BackgroundTasks如何玩转生产者-消费者模式？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/1549a6bd7e47e7006e7ba8f52bcfe8eb/)
- [BackgroundTasks 还是 RabbitMQ？你的异步任务到底该选谁？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/d26fdc150ff9dd70c7482381ff4c77c4/)
- [BackgroundTasks与Celery：谁才是异步任务的终极赢家？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/792cac4ce6eb96b5001da15b0d52ef83/)
- [如何在 FastAPI 中优雅处理后台任务异常并实现智能重试？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/d5c1d2efbaf6fe4c9e13acc6be6d929a/)
- [BackgroundTasks 如何巧妙驾驭多任务并发？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/8661dc74944bd6fb28092e90d4060161/)
- [如何让FastAPI后台任务像多米诺骨牌一样井然有序地执行？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/7693d3430a6256c2abefc1e4aba21a4a/)
- [FastAPI后台任务：是时候让你的代码飞起来了吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/6145d88d5154d5cd38cee7ddc2d46e1d/)
- [FastAPI后台任务为何能让邮件发送如此丝滑？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/19241679a1852122f740391cbdc21bae/)
- [FastAPI的请求-响应周期为何需要后台任务分离？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c7b54d6b3b6b5041654e69e5610bf3b9/)
- [如何在FastAPI中让后台任务既高效又不会让你的应用崩溃？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/5ad8d0a4c8f2d05e9c1a42d828aad7b3/)
- [FastAPI后台任务：异步魔法还是同步噩梦？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/6a69eca9fd14ba8f6fa41502c5014edd/)
- [如何在FastAPI中玩转Schema版本管理和灰度发布？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/6d9d20cd8d8528da4193f13aaf98575c/)

</details>


<details>
<summary>免费好用的热门在线工具</summary>

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