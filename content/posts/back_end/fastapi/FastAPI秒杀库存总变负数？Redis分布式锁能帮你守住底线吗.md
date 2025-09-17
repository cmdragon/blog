---
url: /posts/65ce343cc5df9faf3a8e2eeaab42ae45/
title: FastAPI秒杀库存总变负数？Redis分布式锁能帮你守住底线吗
date: 2025-09-17T03:43:34+08:00
lastmod: 2025-09-17T03:43:34+08:00
author: cmdragon
cover: /images/2e41703a0e314d5183094f5ee9ba9cad~tplv-5jbd59dj06-image.png

summary:
  分布式锁在FastAPI中用于解决多实例并发访问共享资源时的数据一致性问题。其核心原理包括互斥性、安全性、可用性和容错性，常用Redis分布式锁实现。Redlock算法通过多节点投票确保锁的可靠性。FastAPI中通过aioredis实现异步分布式锁，支持锁的获取、释放和续约。测试策略覆盖单实例、多实例并发及锁超时等场景，确保锁的正确性和稳定性。

categories:
  - fastapi

tags:
  - FastAPI
  - 分布式锁
  - Redis
  - 异步编程
  - Redlock算法
  - 并发控制
  - 测试策略

---

<img src="/images/2e41703a0e314d5183094f5ee9ba9cad~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### 一、分布式锁在FastAPI中的作用与原理

#### 1.1 为什么需要分布式锁？

想象一个场景：你做了个FastAPI秒杀接口，商品库存只有1件。如果同时有100个请求打进来，单实例FastAPI能用`asyncio.Lock`
（本地锁）保证同一时间只有一个请求处理库存。但如果部署了3个FastAPI实例（多进程/多机器），本地锁就失效了——每个实例都有自己的锁，100个请求会同时冲进3个实例，导致库存变成-99，彻底乱套。

**分布式锁的本质**：给跨进程、跨机器的资源竞争“上全局锁”，不管多少个FastAPI实例，同一时间只有一个请求能拿到锁，确保数据一致。

#### 1.2 分布式锁的核心原理

分布式锁要满足4个核心要求：

- **互斥性**：同一时间只有一个请求能拿到锁；
- **安全性**：不能让A的锁被B释放；
- **可用性**：Redis挂了一个节点，还能正常用；
- **容错性**：持有锁的进程崩溃，锁要能自动释放。

FastAPI里最常用的是**Redis分布式锁**（轻量、性能高），底层用**Redlock算法**（解决Redis单点故障问题）。测试环境可以简化成单Redis节点，生产环境建议用3-5个节点。

#### 1.3 Redlock算法简化理解

Redlock是“多节点投票制”：

1. 向5个Redis节点发“锁请求”；
2. 超过3个节点同意（半数以上），就算拿到锁；
3. 计算总耗时，如果比锁超时时间短，锁有效；
4. 否则，把所有节点的锁都删了，重新来。

测试环境不用这么复杂——先拿单Redis节点练手，生产再扩展。

### 二、FastAPI中分布式锁的实现

#### 2.1 依赖准备与配置

首先装依赖：

```bash
pip install fastapi==0.109 aioredis==2.0.1 pydantic==2.5.3 pytest-asyncio==0.23.2
```

用`pydantic`写个配置类（统一管理Redis连接参数）：

```python
# lock_config.py
from pydantic import BaseModel, Field


class RedisLockConfig(BaseModel):
    redis_url: str = Field(default="redis://localhost:6379", description="Redis连接地址")
    lock_prefix: str = Field(default="dist_lock:", description="锁键前缀，避免key冲突")
    timeout: int = Field(default=10, description="锁超时时间（秒），防止死锁")
    renew_interval: int = Field(default=3, description="锁续约间隔（秒），防止业务超时")
```

#### 2.2 异步分布式锁实现（aioredis）

因为FastAPI是异步的，必须用**aioredis**（异步Redis客户端）。写个`RedisDistributedLock`类，封装锁的获取、释放、续约：

```python
# distributed_lock.py
from aioredis import Redis, RedisError
from pydantic import BaseModel
import uuid
import asyncio

class RedisDistributedLock:
    def __init__(self, config: RedisLockConfig):
        self.config = config
        self.redis: Redis | None = None  # Redis客户端实例
        self.lock_key: str | None = None  # 当前锁的key
        self.lock_value: str | None = None  # 唯一标识（防误删别人的锁）
        self.renew_task: asyncio.Task | None = None  # 锁续约任务

    # 异步上下文管理器：自动连接/断开Redis
    async def __aenter__(self) -> "RedisDistributedLock":
        await self._connect()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.release()
        await self._disconnect()

    # 连接Redis
    async def _connect(self):
        if not self.redis:
            self.redis = await Redis.from_url(self.config.redis_url)

    # 断开Redis连接
    async def _disconnect(self):
        if self.redis:
            await self.redis.close()
            await self.redis.wait_closed()
            self.redis = None

    # 获取锁：原子操作（SETNX + EX）
    async def acquire(self, lock_name: str) -> bool:
        self.lock_key = f"{self.config.lock_prefix}{lock_name}"
        self.lock_value = str(uuid.uuid4())  # 生成唯一值，防误删

        try:
            # SET key value NX（不存在才设置） EX（过期时间）
            success = await self.redis.set(
                self.lock_key, self.lock_value,
                nx=True,
                ex=self.config.timeout
            )
        except RedisError as e:
            print(f"获取锁失败: {e}")
            return False

        if success:
            # 启动锁续约任务（防止业务超时）
            self.renew_task = asyncio.create_task(self._renew_lock())
            return True
        return False

    # 锁续约：用Lua脚本原子验证+续期
    async def _renew_lock(self):
        while self.lock_key and self.lock_value:
            try:
                # Lua脚本：如果锁是自己的，就续期
                script = """
                    if redis.call('GET', KEYS[1]) == ARGV[1] then
                        return redis.call('EXPIRE', KEYS[1], ARGV[2])
                    else
                        return 0
                    end
                """
                # 执行脚本：KEYS是锁key，ARGV是锁值+超时时间
                result = await self.redis.eval(
                    script,
                    keys=[self.lock_key],
                    args=[self.lock_value, self.config.timeout]
                )
                if result == 0:  # 续约失败（锁不是自己的）
                    break
            except Exception as e:
                print(f"续约失败: {e}")
                break
            await asyncio.sleep(self.config.renew_interval)  # 每隔3秒续一次

    # 释放锁：用Lua脚本原子验证+删除
    async def release(self):
        # 先取消续约任务
        if self.renew_task:
            self.renew_task.cancel()
            try:
                await self.renew_task
            except asyncio.CancelledError:
                pass

        if self.lock_key and self.lock_value and self.redis:
            try:
                # Lua脚本：只有锁是自己的，才删除
                script = """
                    if redis.call('GET', KEYS[1]) == ARGV[1] then
                        return redis.call('DEL', KEYS[1])
                    else
                        return 0
                    end
                """
                await self.redis.eval(
                    script,
                    keys=[self.lock_key],
                    args=[self.lock_value]
                )
            except RedisError as e:
                print(f"释放锁失败: {e}")

        # 重置状态
        self.lock_key = None
        self.lock_value = None
```

#### 2.3 FastAPI路由中使用锁（依赖注入）

把锁封装成依赖，方便路由调用：

```python
# main.py
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from lock_config import RedisLockConfig
from distributed_lock import RedisDistributedLock
import asyncio

app = FastAPI()


# 1. 配置依赖（读取Redis连接参数）
async def get_lock_config() -> RedisLockConfig:
    return RedisLockConfig()  # 实际项目可以从环境变量读，比如os.getenv("REDIS_URL")


# 2. 锁依赖：用异步生成器管理生命周期
async def get_distributed_lock(
        config: RedisLockConfig = Depends(get_lock_config)
) -> RedisDistributedLock:
    async with RedisDistributedLock(config) as lock:
        yield lock


# 模拟库存（实际用数据库）
fake_inventory = {"iphone15": 1}


# 3. 秒杀接口（用锁保护库存扣减）
@app.post("/seckill/{product_id}")
async def seckill(
        product_id: str,
        lock: RedisDistributedLock = Depends(get_distributed_lock)
):
    # 先拿锁，拿不到返回429（请求过多）
    if not await lock.acquire(lock_name=product_id):
        raise HTTPException(status_code=429, detail="抢的人太多啦，再试一次～")

    try:
        # 业务逻辑：扣减库存
        if fake_inventory.get(product_id, 0) <= 0:
            raise HTTPException(status_code=400, detail="手慢了，商品已售罄！")
        fake_inventory[product_id] -= 1
        return {"msg": "秒杀成功！", "剩余库存": fake_inventory[product_id]}
    finally:
        # 不管成功失败，都释放锁（重要！）
        await lock.release()
```

### 三、分布式锁的测试策略与用例设计

#### 3.1 要测什么？

分布式锁的测试要覆盖**正常场景**和**异常场景**：

1. **单实例并发**：同一FastAPI实例下，多个请求抢锁；
2. **多实例并发**：启动多个FastAPI实例（比如用`uvicorn main:app --port 8000`和`--port 8001`），用Postman批量发请求；
3. **锁超时**：持有锁的进程超时，锁自动释放；
4. **异常崩溃**：持有锁的进程突然死掉，锁是否自动释放；
5. **锁续约**：业务逻辑超时，续约是否成功。

#### 3.2 异步测试用例（pytest-asyncio）

用`pytest-asyncio`写异步测试，示例：

```python
# test_seckill.py
import pytest
from httpx import AsyncClient
from main import app, fake_inventory
import asyncio


# 1. 测试客户端 fixture
@pytest.fixture(scope="module")
async def client():
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client


# 2. 重置库存 fixture（每个测试前重置）
@pytest.fixture(autouse=True)
def reset_inv():
    fake_inventory["iphone15"] = 1
    yield


# 3. 测试1：单请求秒杀成功
@pytest.mark.asyncio
async def test_seckill_success(client: AsyncClient):
    resp = await client.post("/seckill/iphone15")
    assert resp.status_code == 200
    assert resp.json() == {"msg": "秒杀成功！", "剩余库存": 0}


# 4. 测试2：并发请求，只有1个成功
@pytest.mark.asyncio
async def test_seckill_concurrent(client: AsyncClient):
    # 定义并发请求函数
    async def send_req():
        resp = await client.post("/seckill/iphone15")
        return resp.status_code, resp.json()

    # 发5个并发请求
    tasks = [send_req() for _ in range(5)]
    results = await asyncio.gather(*tasks)

    # 统计结果：1个200（成功），4个429/400（失败）
    success = sum(1 for status, _ in results if status == 200)
    assert success == 1


# 5. 测试3：锁超时后释放
@pytest.mark.asyncio
async def test_lock_timeout(client: AsyncClient):
    fake_inventory["iphone15"] = 2  # 库存改成2，方便测试

    # 模拟一个持有锁超时的进程
    async def hold_lock():
        async with RedisDistributedLock(RedisLockConfig(timeout=2)) as lock:
            await lock.acquire("iphone15")
            await asyncio.sleep(3)  # 超过锁超时时间（2秒）

    # 先启动hold_lock，1秒后发秒杀请求
    task = asyncio.create_task(hold_lock())
    await asyncio.sleep(1)
    resp = await client.post("/seckill/iphone15")
    await task

    # 验证：锁超时释放，请求成功
    assert resp.status_code == 200
    assert fake_inventory["iphone15"] == 1
```

运行测试：

```bash
pytest test_seckill.py -v
```

### 四、课后Quiz：巩固知识

#### 问题1：为什么FastAPI异步应用要用aioredis而不是redis-py？

**答案解析**：  
redis-py是**同步库**，会阻塞FastAPI的事件循环（相当于“堵住了水管”），导致所有请求变慢。而aioredis是**异步库**
，能和FastAPI的异步机制完美配合，不会阻塞，性能更高。

#### 问题2：锁的“超时时间”设太短或太长有什么问题？

**答案解析**：

- 设太短：如果业务逻辑没处理完，锁就自动释放了，其他请求会拿到锁，导致**数据冲突**（比如库存变成负数）；
- 设太长：如果持有锁的进程崩溃，锁要等很久才释放，其他请求一直拿不到锁，导致**假死锁**（系统像“卡住了”）。

### 五、常见报错与解决

#### 报错1：aioredis.exceptions.ConnectionClosedError

**原因**：Redis没启动，或者连接URL错了（比如端口不是6379）。  
**解决**：

1. 检查Redis是否在运行：`redis-cli ping`（返回PONG就对了）；
2. 验证`RedisLockConfig`里的`redis_url`是否正确（比如`redis://localhost:6379`）；
3. 增加连接超时时间：`Redis.from_url(redis_url, timeout=10)`。

#### 报错2：HTTP 429 Too Many Requests

**原因**：并发请求太多，锁被占了。  
**解决**：

1. 优化业务逻辑，缩短锁的持有时间（比如把非核心逻辑移到锁外面）；
2. 用队列限流（比如Redis队列，把请求排成队，一个一个处理）；
3. 返回友好提示（比如“再试一次”）。

#### 报错3：锁释放失败（Lua脚本返回0）

**原因**：锁已经被其他进程释放了（比如超时），或者锁值不对。  
**解决**：

1. 确保`release`方法在`finally`块里（不管成功失败都释放）；
2. 检查锁的`timeout`设置，不要太短；
3. 用唯一锁值（`uuid`），避免释放别人的锁。

### 六、实战运行步骤

1. **启动Redis**：`redis-server`（Windows用`redis-server.exe`）；
2. **启动FastAPI**：`uvicorn main:app --reload`；
3. **测试接口**：用Postman发`POST http://localhost:8000/seckill/iphone15`，看返回结果；
4. **运行测试**：`pytest test_seckill.py -v`。

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[FastAPI秒杀库存总变负数？Redis分布式锁能帮你守住底线吗](https://blog.cmdragon.cn/posts/65ce343cc5df9faf3a8e2eeaab42ae45/)





<details>
<summary>往期文章归档</summary>

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
- [定时任务系统如何让你的Web应用自动完成那些烦人的重复工作？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/2b27950aab76203a1af4e9e3deda8699/)
- [Celery任务监控的魔法背后藏着什么秘密？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/f43335725bb3372ebc774db1b9f28d2d/)
- [如何让Celery任务像VIP客户一样享受优先待遇？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c24491a7ac7f7c5e9cf77596ebb27c51/)
- [如何让你的FastAPI Celery Worker在压力下优雅起舞？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/c3129f4b424d2ed2330484b82ec31875/)
- [FastAPI与Celery的完美邂逅，如何让异步任务飞起来？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/b79c2c1805fe9b1ea28326b5b8f3b709/)
- [FastAPI消息持久化与ACK机制：如何确保你的任务永不迷路？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/13a59846aaab71b44ab6f3dadc5b5ec7/)
- [FastAPI的BackgroundTasks如何玩转生产者-消费者模式？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/1549a6bd7e47e7006e7ba8f52bcfe8eb/)
- [BackgroundTasks 还是 RabbitMQ？你的异步任务到底该选谁？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/d26fdc150ff9dd70c7482381ff4c77c4/)

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