---
url: /posts/bf9883a75ffa46b523a03b16ec56ce48/
title: 如何在FastAPI中玩转“时光倒流”的数据库事务回滚测试？
date: 2025-09-09T04:07:19+08:00
lastmod: 2025-09-09T04:07:19+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/uJAPxolpA-Xw7k2fVKqr2.png

summary:
  在 FastAPI 项目中，集成测试通过事务回滚机制确保测试环境的干净性。使用 `pytest`、`SQLAlchemy` 和 `FastAPI TestClient` 组合，实现数据库事务的嵌套控制，测试中的所有数据库操作在用例结束时自动回滚。通过 `begin_nested()` 创建保存点，确保每个测试用例在独立的事务中执行，避免数据污染。测试案例模拟用户注册和资料修改，验证数据库写入和接口请求的正确性。常见问题如 `IntegrityError` 和连接未释放，通过检查事务回滚机制和显式关闭连接解决。

categories:
  - fastapi

tags:
  - FastAPI
  - 集成测试
  - 事务回滚
  - pytest
  - SQLAlchemy
  - 异步测试
  - 数据库测试

---

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 1. 多模块集成测试实践

在 FastAPI 项目中，随着功能模块增多，**集成测试**成为确保系统整体稳定性的关键。

#### 1.1 为何需要事务回滚测试

> 想象你正在玩一个电子游戏：每次测试用例就像一局新游戏。如果上一局的修改没有撤销，下一局就会在脏数据上开始，导致结果不可预测。事务回滚测试正是通过
**"时光倒流"机制**，让每个测试用例都在干净的数据库环境中运行。

#### 1.2 核心实现方案

使用 `pytest` + `SQLAlchemy` + `FastAPI TestClient` 组合，通过以下组件实现事务控制：

| 组件                 | 作用         | 版本要求      |
|--------------------|------------|-----------|
| pytest             | 测试框架       | >=7.0     |
| SQLAlchemy         | ORM 数据库操作  | ==2.0.28  |
| FastAPI TestClient | 模拟 HTTP 请求 | ==0.109.0 |
| pytest-asyncio     | 支持异步测试     | ==0.23.6  |

### 2. 数据库事务回滚测试模式

通过事务嵌套实现 **"沙盒环境"**，测试中所有数据库操作会在用例结束时自动回滚，就像从未发生过。

#### 2.1 实现流程图

```mermaid
graph TD
    A[测试开始] --> B[创建新事务]
    B --> C[执行测试操作]
    C --> D[接口请求]
    D --> E[数据库修改]
    E --> F[结果断言]
    F --> G[事务回滚]
    G --> H[清理资源]
```

#### 2.2 代码实现

创建 `tests/conftest.py` 配置文件：

```python
# 所需依赖：pytest==7.4.4, sqlalchemy==2.0.28, pytest-asyncio==0.23.6
import pytest
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

# 初始化异步数据库引擎
TEST_DATABASE_URL = "postgresql+asyncpg://user:pass@localhost/test_db"
engine = create_async_engine(TEST_DATABASE_URL, echo=True)

# 配置异步session工厂
AsyncTestingSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


# 核心事务回滚夹具
@pytest.fixture(scope="function")
async def db_session():
    """创建嵌套事务的沙盒环境"""
    async with AsyncTestingSessionLocal() as session:
        async with session.begin_nested():  # 创建SAVEPOINT
            yield session
        # 退出时自动回滚所有操作
```

### 3. 完整测试案例

模拟用户注册+资料修改的集成测试场景。

#### 3.1 测试代码

```python
# tests/test_user_integration.py
from fastapi.testclient import TestClient
from sqlalchemy import select
from app.main import app
from app.models import User

client = TestClient(app)


@pytest.mark.asyncio
async def test_user_flow(db_session: AsyncSession):
    # 1. 注册新用户
    res = client.post("/users/", json={"name": "test", "email": "test@demo.com"})
    assert res.status_code == 201

    # 2. 验证数据库写入（此时在事务内可见）
    result = await db_session.execute(select(User).where(User.email == "test@demo.com"))
    user = result.scalar_one()
    assert user.name == "test"

    # 3. 修改用户资料
    res = client.patch(f"/users/{user.id}", json={"name": "updated"})
    assert res.status_code == 200

    # 4. 再次验证
    await db_session.refresh(user)
    assert user.name == "updated"

# 测试结束时，所有数据库操作自动回滚
```

#### 3.2 关键机制解析

1. `begin_nested()`：创建 SQL SAVEPOINT 保存点
2. yield session：测试代码在此作用域执行
3. 退出作用域：自动执行 `ROLLBACK TO SAVEPOINT`
4. 原子性：整个测试过程中即使有多个 DB 操作，也会被视作单一事务单元

### 4. 常见场景适配方案

#### 4.1 第三方服务模拟

当集成支付等外部服务时，使用 `responses` 库拦截 HTTP 请求：

```python
# 新增依赖：responses==0.24.1
import responses


@responses.activate
def test_payment_flow():
    responses.post("https://pay.demo.com", json={"success": True})
    res = client.post("/payments", json={"amount": 100})
    assert res.json()["status"] == "completed"
```

#### 4.2 异步任务测试

对于 Celery 等异步任务，采用 `pytest_celery` 插件：

```python
# 新增依赖：pytest-celery==0.0.1
from pytest_celery import CeleryTestWorker


def test_async_task(celery_worker: CeleryTestWorker):
    res = client.post("/tasks/email", json={"to": "user@ex.com"})
    task_id = res.json()["id"]

    # 显式等待任务完成
    result = celery_worker.wait_for_result(task_id)
    assert result["status"] == "sent"
```

---

### Quiz: 集成测试陷阱排查

❓ 当测试中遇到 `IntegrityError` 唯一约束冲突时，最可能的原因是什么？
A) 测试数据清理不彻底  
B) 事务隔离级别配置错误  
C) 未正确启用回滚机制  
D) 数据库连接池耗尽

<details>
<summary>查看答案</summary>
正确答案：C  
解析：事务回滚机制失效会导致测试间数据残留。应检查：
1. 是否使用 begin_nested() 创建保存点
2. yield 后的清理代码是否被执行
3. 测试数据库是否配置为可回滚的事务模式
</details>

---

### 常见报错解决方案

#### 报错 1：`SAVEPOINT does not exist`

**现象**：

```python
sqlalchemy.exc.InvalidRequestError: This
session
's transaction has been rolled back
due
to
a
previous
exception
during
flush...
```

**原因**：嵌套事务中执行了 DDL 操作（如 CREATE TABLE）

**解决方案**：

1. 避免在测试事务中执行迁移操作
2. 初始化时创建好测试表结构：

```python
# 在 conftest.py 中添加
@pytest.fixture(scope="session", autouse=True)
def initialize_db():
# 在此处运行数据库迁移脚本
```

#### 报错 2：`Connection is not acquired`

**现象**：

```python
RuntimeError: < Task... > ...
Connection is not acquired.
```

**原因**：异步连接未正确释放

**解决方案**：

```python
# 改造夹具确保资源释放
@pytest.fixture
async def db_session():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncTestingSessionLocal() as session:
        try:
            async with session.begin_nested():
                yield session
        finally:
            await session.close()  # 确保显式关闭连接
```

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[如何在FastAPI中玩转“时光倒流”的数据库事务回滚测试？](https://blog.cmdragon.cn/posts/bf9883a75ffa46b523a03b16ec56ce48/)




<details>
<summary>往期文章归档</summary>

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
- [FastAPI的BackgroundTasks如何玩转生产者-消费者模式？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/1549a6bd7e47e7006e7ba8f52bcfe8eb/)
- [BackgroundTasks 还是 RabbitMQ？你的异步任务到底该选谁？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/d26fdc150ff9dd70c7482381ff4c77c4/)
- [BackgroundTasks与Celery：谁才是异步任务的终极赢家？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/792cac4ce6eb96b5001da15b0d52ef83/)
- [如何在 FastAPI 中优雅处理后台任务异常并实现智能重试？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/d5c1d2efbaf6fe4c9e13acc6be6d929a/)
- [BackgroundTasks 如何巧妙驾驭多任务并发？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/8661dc74944bd6fb28092e90d4060161/)
- [如何让FastAPI后台任务像多米诺骨牌一样井然有序地执行？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/7693d3430a6256c2abefc1e4aba21a4a/)
- [FastAPI后台任务：是时候让你的代码飞起来了吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/6145d88d5154d5cd38cee7ddc2d46e1d/)
- [FastAPI后台任务为何能让邮件发送如此丝滑？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/19241679a1852122f740391cbdc21bae/)
- [FastAPI的请求-响应周期为何需要后台任务分离？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c7b54d6b3b6b5041654e69e5610bf3b9/)

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