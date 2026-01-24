---
url: /posts/30e1d2fbf1ad8123eaf0e1e0dbe7c675/
title: 全链路追踪如何让FastAPI微服务架构的每个请求都无所遁形？
date: 2025-08-28T23:40:47+08:00
lastmod: 2025-08-28T23:40:47+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/xw_20250829094505.png

summary:
  全链路追踪是现代微服务架构中监控系统行为的核心技术，通过为每个用户请求分配唯一ID（Trace ID）并记录关键信息。核心概念包括Trace、Span和Context Propagation。FastAPI实现方案采用OpenTelemetry、Jaeger和Prometheus，通过初始化追踪配置、集成FastAPI应用和手动添加自定义Span来实现。实战案例展示了电商订单追踪的场景模拟和问题诊断。最佳实践包括关键数据采集、采样策略配置和跨服务追踪传递。常见报错解决方案涉及TracerProvider未设置、上下文传播失败和Jaeger UI无数据显示等问题。

categories:
  - fastapi

tags:
  - 全链路追踪
  - FastAPI
  - OpenTelemetry
  - Jaeger
  - 微服务监控
  - 分布式系统
  - 性能优化

---


<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 1. 全链路追踪的核心概念

**全链路追踪（Distributed Tracing）**是现代微服务架构中监控系统行为的核心技术。想象一下快递物流：每个包裹都有唯一条形码，经过扫描站时记录时间和位置。类似地，全链路追踪会给每个用户请求分配唯一ID（Trace
ID），在服务间传递时记录关键信息。

```mermaid
graph LR
    A[用户请求] -->|分配TraceID| B[服务A]
    B -->|传递TraceID| C[服务B]
    C -->|传递TraceID| D[数据库]
    D -->|记录Span| E[追踪系统]
    E --> F[可视化链路图]
```

核心概念解析：

1. **Trace**：一个完整请求的生命周期，包含多个Span
2. **Span**：请求在单个服务中的处理单元（如数据库查询、API调用）
3. **Context Propagation**：在服务间传递Trace信息的机制（如HTTP Header）

这种技术提供了三大关键能力：

1. **端到端请求追踪**
    - 系统为每个请求生成全局唯一的Trace ID
    - 每个服务处理时创建Span并记录操作明细
    - 父子Span关系构建出完整调用链路

2. **性能瓶颈定位**
    - 精确测量每个服务的处理时间
    - 标识耗时超过阈值的操作节点
    - 可视化展示各服务依赖关系

3. **故障快速诊断**
    - 当请求失败时，1秒内定位故障服务
    - 关联错误日志与追踪数据
    - 识别异常传播路径

### 2. FastAPI实现方案

#### 2.1 基础架构选择

我们使用行业标准方案：

- **OpenTelemetry**：CNCF开源的可观测性框架
- **Jaeger**：分布式追踪系统（可视化工具）
- **Prometheus**：指标监控系统（配合使用）

#### 2.2 核心依赖安装

需安装以下库（使用`pip install`）：

```bash
opentelemetry-api==1.23.0
opentelemetry-sdk==1.23.0
opentelemetry-instrumentation-fastapi==0.45b0
opentelemetry-exporter-jaeger==1.23.0
prometheus-client==0.20.0
```

### 3. 实现代码

#### 3.1 初始化追踪配置

```python
from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor


def init_tracing():
    # 创建Jaeger导出器
    jaeger_exporter = JaegerExporter(
        agent_host_name="localhost",
        agent_port=6831,
    )

    # 配置Tracer提供者
    tracer_provider = TracerProvider()
    tracer_provider.add_span_processor(
        BatchSpanProcessor(jaeger_exporter)
    )
    trace.set_tracer_provider(tracer_provider)

    # 返回可用tracer实例
    return trace.get_tracer(__name__)
```

#### 3.2 集成FastAPI应用

```python
from fastapi import FastAPI

app = FastAPI()

# 初始化追踪
tracer = init_tracing()

# 自动化仪表器注入
FastAPIInstrumentor.instrument_app(app)


@app.get("/order/{order_id}")
async def get_order(order_id: str):
    with tracer.start_as_current_span("process_order") as span:
        span.set_attribute("order.id", order_id)

        # 模拟业务处理
        await check_inventory(order_id)
        await process_payment(order_id)

        return {"status": "completed"}
```

#### 3.3 手动添加自定义Span

```python
async def check_inventory(order_id: str):
    # 在当前trace中创建子span
    with tracer.start_as_current_span("check_inventory") as span:
        span.set_attribute("order.id", order_id)
        span.add_event("Checking warehouse stock")

        # 模拟数据库调用
        await asyncio.sleep(0.1)
        return True
```

### 4. Jaeger可视化实战

启动Jaeger服务后查看追踪结果：

```
docker run -d -p 16686:16686 -p 6831:6831/udp jaegertracing/all-in-one:1.48
```

Jaeger界面展示三层信息：

1. **时间线视图**：水平条形图展示各Span耗时
2. **Span详情**：包含操作名称、耗时、标签信息
3. **火焰图**：垂直展示调用栈深度

![Jaeger界面示例](https://jaegertracing.io/img/trace-detail-ss.png)

---

### 5. 高级应用场景

#### 自定义追踪标签

```python
with tracer.start_as_current_span("payment") as span:
    span.set_attribute("payment.method", "credit_card")
    span.set_attribute("payment.amount", 99.99)
```

#### 错误追踪

```python
try:
# 可能出现异常的代码
except Exception as e:
    span = trace.get_current_span()
    span.record_exception(e)
    span.set_status(trace.StatusCode.ERROR)
```

#### 跨服务追踪

```python
from opentelemetry.propagate import inject, extract

# 服务A发送请求时注入上下文
headers = {}
inject(headers)
requests.get("http://service-b", headers=headers)

# 服务B提取上下文
context = extract(request.headers)
with tracer.start_as_current_span("service_b_op", context=context):
    ...
```

### 6.电商订单追踪

**场景模拟**：
当用户查询订单时，系统经过：

1. API网关 → 2.订单服务 → 3.库存服务 → 4.支付服务

**问题诊断**：
通过Jaeger的追踪图可发现：

1. 库存检查耗时200ms（超预期）
2. 支付服务调用失败率高
3. 服务间网络延迟突增

```
Trace View in Jaeger:
[GET /order/123] 450ms
├── [OrderService] 120ms
│   ├── [InventoryService] 200ms ← 瓶颈!
│   └── [PaymentService] ERROR
└── [RecommendationService] 80ms
```

### 7. 最佳实践指南

#### 7.1 关键数据采集

在Span中记录这些黄金指标：

```python
span.set_attributes({
    "http.method": "GET",
    "http.route": "/order/{order_id}",
    "response.code": 200,
    "db.query.time": 42.5,  # 毫秒
    "cache.hit": False
})
```

#### 7.2 采样策略配置

```python
from opentelemetry.sdk.trace.sampling import TraceIdRatioBased

# 只采样10%的请求减轻负载
sampler = TraceIdRatioBased(0.1)
TracerProvider(sampler=sampler)
```

#### 7.3 跨服务追踪传递

确保服务间传递Trace上下文：

```python
headers = {}
# 注入当前上下文到请求头
otel.inject(headers)

# 使用requests库时自动传播
response = requests.get(
    "http://inventory/check",
    headers=headers
)
```

### Quiz：知识巩固测试

1. 下列哪种数据**不应该**记录在Span中？
   A) 用户ID B) 信用卡号 C) API响应时间 D) HTTP方法

2. 为何需要设置采样率(Sampling Rate)？
   A) 降低存储成本 B) 避免泄露敏感数据
   C) 提高追踪精度 D) 减少网络流量

3. 当服务A调用服务B时，TraceID如何传递？
   A) 通过HTTP Cookies B) 使用gRPC元数据
   C) 附加到消息队列 D) 以上所有方式

<details>
<summary>查看答案与解析</summary>

1. **B) 信用卡号**
    - 追踪数据可能被未授权访问，永远不要记录敏感信息

2. **A) 降低存储成本**
    - 生产环境中全量采样会产生海量数据，采样是成本/精度权衡

3. **D) 以上所有方式**
    - OpenTelemetry支持多种传播器：HTTP头/W3C规范/消息头等

</details>

### 8. 常见报错解决方案

#### 8.1 "TracerProvider not set" 错误

**原因**：
在`init_tracing()`前调用了`trace.get_tracer()`

**解决方案**：

```python
# 正确顺序：先初始化再获取
init_tracing()  # ← 必须先执行
tracer = trace.get_tracer(__name__)
```

#### 8.2 "Context propagation failed" 警告

**原因**：
跨进程调用时未正确传播上下文

**预防措施**：

```python
# 使用官方传播器（代码示例）
from opentelemetry.propagate import inject, extract

# 发送方设置
headers = {}
inject(headers)

# 接收方提取
context = extract(headers)
tokens = attach(context)
```

#### 8.3 Jaeger UI无数据显示

**排查步骤**：

1. 检查Jaeger agent端口（默认6831）
2. 确认采样率未设置为0
3. 查看OpenTelemetry日志：
   ```bash
   docker logs otel-collector
   ```
4. 测试端口连通性：
   ```bash
   telnet localhost 6831
   ```

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[全链路追踪如何让FastAPI微服务架构的每个请求都无所遁形？](https://blog.cmdragon.cn/posts/30e1d2fbf1ad8123eaf0e1e0dbe7c675/)



<details>
<summary>往期文章归档</summary>

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
- [FastAPI的查询白名单和安全沙箱机制如何确保你的API坚不可摧？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/ca141239cfc5c0d510960acd266de9cd/)
- [如何在 FastAPI 中玩转 GraphQL 性能监控与 APM 集成？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/52fe9ea73b0e26de308ae0e539df21d2/)
- [如何在 FastAPI 中玩转 GraphQL 和 WebSocket 的实时数据推送魔法？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/ae484cf6bcf3f44fd8392a8272e57db4/)
- [如何在FastAPI中玩转GraphQL联邦架构，让数据源手拉手跳探戈？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/9b9086ff5d8464b0810cfb55f7768513/)
- [GraphQL批量查询优化：DataLoader如何让数据库访问速度飞起来？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/0e236dbe717bde52bda290e89f4f6eca/)
- [如何在FastAPI中整合GraphQL的复杂度与限流？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/ace8bb3f01589994f51d748ab5c73652/)
- [GraphQL错误处理为何让你又爱又恨？FastAPI中间件能否成为你的救星？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/a28d5c1b32feadb18b406a849455dfe5/)
- [FastAPI遇上GraphQL：异步解析器如何让API性能飙升？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/35fced261e8ff834e68e07c93902cc13/)

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