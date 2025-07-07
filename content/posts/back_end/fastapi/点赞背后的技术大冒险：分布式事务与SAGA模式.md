---
url: /posts/e586c7819314ad2cb97f35676d143adc/
title: 点赞背后的技术大冒险：分布式事务与SAGA模式
date: 2025-05-07T00:12:40+08:00
lastmod: 2025-05-07T00:12:40+08:00
author: cmdragon

summary:
  在微服务架构中，点赞操作涉及多个服务的数据更新，传统数据库事务在分布式系统中失效，需采用SAGA事务模式。SAGA将事务分解为多个本地事务，通过补偿机制保证最终一致性。每个操作需定义对应的补偿操作，补偿操作需幂等，并记录事务状态和实现超时机制。代码实现包括基础模型定义、事务上下文管理器和核心业务逻辑，测试验证正常和异常流程。生产环境中建议添加事务日志、实现定时补偿任务和服务降级策略。

categories:
  - fastapi

tags:
  - 分布式事务
  - SAGA模式
  - 微服务架构
  - 补偿机制
  - Python实现
  - 事务管理
  - 数据库操作

---

<img src="https://static.shutu.cn/shutu/jpeg/openfe/2025-05-07/7e0d8b41625ff95d3024f145e2fa7f31.jpeg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[探索数千个预构建的 AI 应用，开启你的下一个伟大创意](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

# 1. 分布式事务的挑战与解决方案

在微服务架构中，点赞这类看似简单的操作可能涉及多个服务的数据更新。假设我们有两个微服务：

- 文章服务（存储文章信息和点赞数）
- 用户服务（记录用户点赞行为）

当用户点赞时，需要同时更新：

1. 文章服务的点赞计数器
2. 用户服务的点赞记录

传统数据库事务在分布式系统中失效，我们需要采用SAGA事务模式。这种模式将事务分解为多个本地事务，通过补偿机制保证最终一致性。

# 2. SAGA事务模式原理

## 2.1 执行流程示例

正常流程：

```
[文章服务+1] -> [用户服务创建记录]
```

异常处理：

```
[文章服务+1] -> [用户服务失败] -> [文章服务-1补偿]
```

## 2.2 补偿机制要点

- 每个操作必须定义对应的补偿操作
- 补偿操作需要幂等（重复执行结果一致）
- 必须记录事务状态
- 需要实现事务超时机制

# 3. 实现代码详解

## 3.1 基础模型定义

```python
# 文章服务模型
class Article(Tortoise.Model):
    id = fields.IntField(pk=True)
    title = fields.CharField(max_length=255)
    likes = fields.IntField(default=0)


# 用户服务模型
class UserLikeRecord(Tortoise.Model):
    id = fields.UUIDField(pk=True)
    user_id = fields.BigIntField()
    article_id = fields.BigIntField()
    created_at = fields.DatetimeField(auto_now_add=True)


# Pydantic响应模型
class LikeResponse(BaseModel):
    article_id: int
    current_likes: int
    user_record_id: UUID
```

## 3.2 事务上下文管理器

```python
class SagaTransaction:
    def __init__(self):
        self.compensation_actions = []

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, traceback):
        if exc_type is not None:
            await self.compensate()

    def add_compensation(self, coro_func, *args):
        self.compensation_actions.append((coro_func, args))

    async def compensate(self):
        for coro_func, args in reversed(self.compensation_actions):
            try:
                await coro_func(*args)
            except Exception as e:
                logging.error(f"Compensation failed: {str(e)}")
```

## 3.3 核心业务实现

```python
@app.post("/articles/{article_id}/like", response_model=LikeResponse)
async def like_article(
        article_id: int,
        user_id: int = Header(..., alias="X-User-ID")
):
    async with SagaTransaction() as saga:
        # 第一步：更新文章点赞数
        article = await Article.get(id=article_id)
        original_likes = article.likes
        article.likes += 1
        await article.save()

        # 记录补偿操作（回滚点赞数）
        saga.add_compensation(
            self.compensate_article_likes,
            article_id,
            original_likes
        )

        # 第二步：创建用户点赞记录
        try:
            record = await UserLikeRecord.create(
                user_id=user_id,
                article_id=article_id
            )
        except Exception as e:
            # 自动触发补偿流程
            raise HTTPException(500, "Like record creation failed")

        # 记录补偿操作（删除记录）
        saga.add_compensation(
            self.compensate_user_record,
            record.id
        )

        return LikeResponse(
            article_id=article_id,
            current_likes=article.likes,
            user_record_id=record.id
        )


# 补偿方法示例
async def compensate_article_likes(article_id: int, original_count: int):
    article = await Article.get(id=article_id)
    article.likes = original_count
    await article.save()


async def compensate_user_record(record_id: UUID):
    await UserLikeRecord.filter(id=record_id).delete()
```

# 4. 测试与验证

## 4.1 正常流程测试

```python
async def test_successful_like():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/articles/1/like",
            headers={"X-User-ID": "123"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["current_likes"] == 1
```

## 4.2 异常流程测试

```python
async def test_failed_transaction():
    with patch("UserLikeRecord.create", side_effect=Exception("DB Error")):
        response = await ac.post(
            "/articles/1/like",
            headers={"X-User-ID": "123"}
        )
        assert response.status_code == 500

        # 验证补偿是否执行
        article = await Article.get(id=1)
        assert article.likes == 0
```

# 5. 课后Quiz

**Q1：为什么补偿操作需要设计为幂等？**
A. 提高系统性能
B. 防止重复补偿导致数据错误
C. 减少数据库连接数
D. 满足HTTP协议规范

**正确答案：B**  
解析：网络重试可能导致补偿操作被多次触发，幂等设计确保多次执行结果一致，避免数据不一致。

**Q2：以下哪些情况需要触发补偿机制？**（多选）
A. 用户服务数据库连接超时
B. 文章不存在返回404错误
C. 用户重复点赞
D. 数据库主从同步延迟

**正确答案：A**  
解析：404属于业务校验错误应在事务开始前检查，重复点赞属于业务逻辑错误，主从同步属于基础架构问题。只有跨服务操作失败需要补偿。

# 6. 常见报错与解决方案

**报错1：TransactionManagementError - 事务已关闭**

```
TransactionManagementError: Transaction already closed
```

**原因**：异步上下文管理器中过早关闭数据库连接  
**解决方案**：

1. 检查事务作用域范围
2. 确保所有数据库操作在同一个事务上下文中
3. 更新Tortoise-ORM到最新版本

**报错2：HTTP 422 Unprocessable Entity**

```
{
  "detail": "Field required"
}
```

**原因**：请求体缺少必要字段或类型不匹配  
**解决方案**：

1. 检查请求头是否包含`X-User-ID`
2. 验证URL参数类型是否正确
3. 使用Swagger文档测试接口格式

**报错3：TimeoutError - 数据库操作超时**

```
TimeoutError: Connection pool exhausted
```

**原因**：数据库连接池不足或查询未优化  
**解决方案**：

1. 增加连接池大小配置：

```python
TORTOISE_CONFIG["connections"]["default"]["pool_size"] = 20
```

2. 为高频查询字段添加索引
3. 使用`select_related`优化关联查询

# 7. 生产环境建议

1. **添加事务日志**：

```python
class TransactionLog(Tortoise.Model):
    transaction_id = fields.UUIDField()
    service_name = fields.CharField(max_length=50)
    action_type = fields.CharField(max_length=20)  # main/compensation
    status = fields.CharField(max_length=10)  # pending/done/failed
    created_at = fields.DatetimeField(auto_now_add=True)
```

2. **实现定时补偿任务**：

```python
async def check_hanging_transactions():
    # 查找超过5分钟未完成的事务
    pending = await TransactionLog.filter(
        status="pending",
        created_at__lt=datetime.now() - timedelta(minutes=5)
    )

    for transaction in pending:
        # 执行补偿逻辑
        await retry_compensation(transaction)
```

3. **服务降级策略**：

- 当连续补偿失败超过阈值时，触发人工干预警报
- 提供强制完成事务的管理员接口
- 实现事务状态查询接口供前端展示

（完整示例代码需配合PostgreSQL数据库运行，安装依赖：`fastapi uvicorn tortoise-orm httpx python-multipart`）

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

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
- [FastAPI依赖注入系统及调试技巧 | cmdragon's Blog](https://blog.cmdragon.cn/posts/410fc13df286ea9e0efcc9d2cf1b5bbd/)
- [FastAPI依赖覆盖与测试环境模拟 | cmdragon's Blog](https://blog.cmdragon.cn/posts/8a2bd816fabac0bc10bd2cf8494e4631/)
- [FastAPI中的依赖注入与数据库事务管理 | cmdragon's Blog](https://blog.cmdragon.cn/posts/112c16d592891ad53a10b10e8127968d/)
- [FastAPI依赖注入实践：工厂模式与实例复用的优化策略 | cmdragon's Blog](https://blog.cmdragon.cn/posts/600434e384fb632e40f37aa20bb673f1/)
- [FastAPI依赖注入：链式调用与多级参数传递 | cmdragon's Blog](https://blog.cmdragon.cn/posts/7c1206bbcb7a5ae74ef57b3d22fae599/)
- [FastAPI依赖注入：从基础概念到应用 | cmdragon's Blog](https://blog.cmdragon.cn/posts/666995a31c7f669ff158ea9f5d59b1b7/)
- [FastAPI中实现动态条件必填字段的实践 | cmdragon's Blog](https://blog.cmdragon.cn/posts/c0adef45ce198a9e28bbac4fe72bb294/)
- [FastAPI中Pydantic异步分布式唯一性校验 | cmdragon's Blog](https://blog.cmdragon.cn/posts/a33be759b816743593c6644f0c4f2899/)
- [掌握FastAPI与Pydantic的跨字段验证技巧 | cmdragon's Blog](https://blog.cmdragon.cn/posts/99ebd315437db53071499b2e9b0bd19a/)

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