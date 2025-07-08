---
url: /posts/56102650d57c260e04435fe72e541ee3/
title: DDD分层设计与异步职责划分：让你的代码不再“异步”混乱
date: 2025-05-04T00:18:53+08:00
lastmod: 2025-05-04T00:18:53+08:00
author: cmdragon

summary:
  DDD分层架构将系统分为用户接口层、应用层、领域层和基础设施层，各层职责明确。领域层处理同步业务逻辑，基础设施层负责异步数据库操作，应用层协调两者。评论模块使用pydantic定义领域模型，保持业务逻辑完整性。Tortoise-ORM实现基础设施层的异步仓储操作。应用层整合领域逻辑与基础设施的异步调用，确保事务管理策略通过原子操作实现。分层调用规则强调领域对象不包含await调用，仓储接口定义在领域层，实现在基础设施层。

categories:
  - fastapi

tags:
  - DDD分层架构
  - 异步编程
  - fastapi
  - 领域驱动设计
  - Tortoise-ORM
  - 事务管理
  - 代码示例

---

<img src="https://static.shutu.cn/shutu/jpeg/open40/2025-05-04/8c0e943689688158f624cd829c58ee70.jpeg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[探索数千个预构建的 AI 应用，开启你的下一个伟大创意](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

# 第一章：DDD分层设计与异步职责划分

## 1.1 DDD分层架构解析

领域驱动设计（DDD）将系统分为四层：用户接口层、应用层、领域层和基础设施层。在FastAPI异步架构中，各层职责需要特别关注异步处理边界：

- **领域层**：包含纯业务逻辑（同步）
- **基础设施层**：处理数据库操作（异步）
- 应用层作为协调者，负责调用领域服务和基础设施的异步方法

架构示例：

```python
# 同步领域服务
class CommentService:
    def validate_comment(self, content: str):
        """领域层保持同步逻辑"""
        if len(content) > 1000:
            raise ValueError("评论内容过长")
        # 其他业务规则...


# 异步基础设施
class CommentRepository:
    async def save(self, comment):
        """基础设施层处理异步IO"""
        await comment.save()
```

## 1.2 评论模块领域模型设计

使用pydantic定义领域模型，保持业务逻辑完整性：

```python
from pydantic import BaseModel, Field
from datetime import datetime


class User(BaseModel):
    id: int
    username: str = Field(..., max_length=50)


class Comment(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)
    author: User
    created_at: datetime = datetime.now()

    def edit(self, new_content: str):
        """领域方法保持同步"""
        if len(new_content) > 1000:
            raise ValueError("内容超过最大限制")
        self.content = new_content
        self.updated_at = datetime.now()
```

## 1.3 基础设施层实现

Tortoise-ORM仓储实现示例：

```python
from tortoise.models import Model
from tortoise import fields


class CommentDBModel(Model):
    """数据库模型"""
    id = fields.IntField(pk=True)
    content = fields.TextField()
    author_id = fields.IntField()
    created_at = fields.DatetimeField(auto_now_add=True)


class TortoiseCommentRepository:
    async def save(self, comment: Comment) -> int:
        """异步保存方法"""
        db_model = await CommentDBModel.create(
            content=comment.content,
            author_id=comment.author.id
        )
        return db_model.id

    async def get(self, comment_id: int) -> Comment:
        """异步查询方法"""
        db_model = await CommentDBModel.get(id=comment_id)
        return Comment(
            content=db_model.content,
            author=User(id=db_model.author_id, username=""),
            created_at=db_model.created_at
        )
```

## 1.4 应用层整合

协调领域逻辑与基础设施的异步调用：

```python
from fastapi import APIRouter, Depends

router = APIRouter()


@router.post("/comments")
async def create_comment(
        comment: Comment,
        repo: TortoiseCommentRepository = Depends()
):
    # 调用同步领域验证
    CommentService().validate_comment(comment.content)

    # 异步保存操作
    comment_id = await repo.save(comment)
    return {"id": comment_id}
```

# 第二章：异步职责边界控制

## 2.1 分层调用规则

异步调用链示例：

```
HTTP请求 -> 路由层（async）-> 应用层（async）-> 领域层（sync）-> 基础设施层（async）
```

关键原则：

1. 领域对象不包含await调用
2. 仓储接口定义在领域层，实现在基础设施层
3. 应用服务负责编排异步流程

## 2.2 事务管理策略

使用Tortoise的原子事务：

```python
from tortoise.transactions import atomic


class CommentRepository:
    @atomic()
    async def create_with_user(self, comment: Comment, user: User):
        """事务操作示例"""
        await UserDBModel.create(id=user.id, username=user.username)
        await CommentDBModel.create(
            content=comment.content,
            author_id=user.id
        )
```

# 课后Quiz

**问题1**：为什么领域层的方法要保持同步？  
A. 简化异步编程复杂度  
B. 保证业务逻辑的原子性  
C. 提高代码执行速度  
D. 方便单元测试

**答案**：A  
解析：业务逻辑保持同步可以避免复杂的async/await处理，使领域模型更专注于业务规则本身。

**问题2**：在事务处理中应该在哪一层实现原子操作？  
A. 应用层调用基础设施层的原子方法  
B. 领域层直接处理事务  
C. 用户接口层控制事务边界  
D. 数据库自动处理所有事务

**答案**：A  
解析：事务属于基础设施实现细节，应用层通过调用基础设施提供的原子方法来管理事务。

# 常见报错解决方案

**422 Validation Error**  
现象：请求返回422状态码  
原因分析：

1. 请求体不符合pydantic模型定义
2. 字段类型不匹配或约束不满足  
   解决方法：
1. 检查请求JSON结构
2. 验证字段类型和长度限制
3. 使用try/except捕获ValidationError

**RuntimeError: Event loop is closed**  
原因：在同步方法中调用了异步代码  
解决方法：

1. 检查领域层是否混入了await调用
2. 确保所有异步操作都在async方法中执行
3. 使用asyncio.run()包装测试代码

**安装与运行**

```bash
# 环境要求
pip install fastapi uvicorn tortoise-orm pydantic

# 启动命令
uvicorn main:app --reload
```

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

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
- [FastAPI中的Pydantic密码验证机制与实现 | cmdragon's Blog](https://blog.cmdragon.cn/posts/2034017b888b8c532d0a136f0eeeca51/)
- [深入掌握FastAPI与OpenAPI规范的高级适配技巧 | cmdragon's Blog](https://blog.cmdragon.cn/posts/84f771a5938908d4287f4b0d3ee77234/)
- [Pydantic字段元数据指南：从基础到企业级文档增强 | cmdragon's Blog](https://blog.cmdragon.cn/posts/25766784d506d6024c0626249e299d09/)

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