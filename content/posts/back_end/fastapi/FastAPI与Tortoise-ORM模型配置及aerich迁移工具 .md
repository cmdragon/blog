---
url: /posts/785a04f3db818a55f0ddc27edc59d471/
title: FastAPI与Tortoise-ORM模型配置及aerich迁移工具
date: 2025-04-30T00:11:45+08:00
lastmod: 2025-04-30T00:11:45+08:00
author: cmdragon

summary:
  FastAPI中使用Tortoise-ORM时，模型类通过继承`tortoise.models.Model`并定义`class Meta`来映射数据库字段。元数据配置包括表名、schema、表注释和联合唯一约束等。初始化数据库连接推荐使用`lifespan`事件处理，配置参数包括数据库URL、模型模块路径等。aerich迁移工具用于管理数据库迁移，通过`init-db`、`migrate`和`upgrade`等命令实现迁移文件的生成和应用。常见问题包括模型注册失败和迁移文件冲突，需检查模型路径和清除冲突文件。

categories:
  - fastapi

tags:
  - fastapi
  - Tortoise-ORM
  - 数据库迁移
  - aerich工具
  - 模型元数据
  - 数据库初始化
  - 常见问题解决方案

---

<img src="https://static.shutu.cn/shutu/jpeg/openf0/2025-04-30/91b7f72f2939f2e0dc1f747d386e4e5d.jpeg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[探索数千个预构建的 AI 应用，开启你的下一个伟大创意](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

# 第一章：模型类元数据配置基础

## 1.1 模型定义与元数据

在FastAPI中使用Tortoise-ORM时，模型类通过Python类属性与数据库字段建立映射关系。每个模型类必须继承自`tortoise.models.Model`
，并通过`class Meta`定义元数据：

```python
from tortoise.models import Model
from tortoise import fields


class User(Model):
    id = fields.IntField(pk=True)
    username = fields.CharField(max_length=50, unique=True)
    created_at = fields.DatetimeField(auto_now_add=True)

    class Meta:
        table = "auth_users"
        table_description = "系统用户数据表"
        schema = "public"
        unique_together = (("username", "email"),)
```

代码解析：

- `table`：指定物理表名称（默认使用类名小写）
- `schema`：数据库schema（适用于PostgreSQL）
- `table_description`：表注释（生成DDL语句时会包含）
- `unique_together`：联合唯一约束

## 1.2 Tortoise-ORM初始化配置

在FastAPI启动时初始化数据库连接，推荐使用`lifespan`事件处理：

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from tortoise import Tortoise


@asynccontextmanager
async def lifespan(app: FastAPI):
    await Tortoise.init(
        db_url='postgres://user:pass@localhost:5432/mydb',
        modules={'models': ['app.models']},
        _create_db=True
    )
    await Tortoise.generate_schemas()
    yield
    await Tortoise.close_connections()


app = FastAPI(lifespan=lifespan)
```

关键参数说明：

- `modules`：指定模型所在模块路径
- `_create_db`：自动创建数据库（仅限开发环境）
- `generate_schemas`：自动生成数据库表结构

# 第二章：aerich迁移工具实战

## 2.1 aerich安装与初始化

安装命令：

```bash
pip install aerich
```

初始化迁移环境：

```bash
aerich init -t app.config.TORTOISE_ORM
aerich init-db
```

在项目根目录创建`aerich_config.py`：

```python
TORTOISE_ORM = {
    "connections": {"default": "postgres://user:pass@localhost:5432/mydb"},
    "apps": {
        "models": {
            "models": ["app.models", "aerich.models"],
            "default_connection": "default",
        }
    },
}
```

## 2.2 迁移操作流程

1. 创建迁移文件：

```bash
aerich migrate --name add_user_table
```

2. 查看未应用的迁移：

```bash
aerich show migrations
```

3. 执行升级：

```bash
aerich upgrade
```

4. 回滚变更：

```bash
aerich downgrade -v -1
```

## 2.3 迁移文件示例

生成的迁移文件`migrations/20231111_1200_add_user_table.sql`：

```sql
-- upgrade --
CREATE TABLE "auth_users"
(
    "id"         SERIAL      NOT NULL PRIMARY KEY,
    "username"   VARCHAR(50) NOT NULL UNIQUE,
    "created_at" TIMESTAMP   NOT NULL
);
COMMENT
ON TABLE "auth_users" IS '系统用户数据表';
-- downgrade --
DROP TABLE "auth_users";
```

# 第三章：常见问题解决方案

## 3.1 模型注册失败

错误现象：
`tortoise.exceptions.ConfigurationError: No models in config`

解决方案：

1. 检查`aerich_config.py`中的模型路径是否包含实际模型文件
2. 确认`__init__.py`文件中已导入模型类
3. 确保`aerich migrate`命令在项目根目录执行

## 3.2 迁移文件冲突

错误现象：
`aerich.exceptions.MigrationConflictError: Duplicate migration version`

处理步骤：

1. 删除`migrations`目录下冲突的迁移文件
2. 清空数据库中的`aerich`表记录
3. 重新生成迁移文件

# 课后Quiz

1. 在模型类Meta配置中，table和schema参数有什么区别？
   A) table定义逻辑表名，schema定义物理存储位置  
   B) table定义物理表名，schema定义数据库模式  
   C) 两者可以互换使用  
   D) schema用于定义索引结构

**答案：B**  
解析：table参数指定数据库中的实际表名，schema用于定义数据库模式（如PostgreSQL的schema），两者共同决定表的物理存储位置。

2. 使用aerich进行数据库迁移的正确步骤是：
   A) init-db → migrate → upgrade  
   B) migrate → init-db → upgrade  
   C) upgrade → migrate → init-db  
   D) init-db → upgrade → migrate

**答案：A**  
解析：正确流程为初始化数据库（init-db）、生成迁移文件（migrate）、应用变更（upgrade）。需先初始化迁移环境才能生成有效的迁移文件。

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

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
- [Pydantic Schema生成指南：自定义JSON Schema | cmdragon's Blog](https://blog.cmdragon.cn/posts/620198727c7909e8dea287430dcf67eb/)
- [Pydantic递归模型深度校验36计：从无限嵌套到亿级数据的优化法则 | cmdragon's Blog](https://blog.cmdragon.cn/posts/448b2f4522926a7bdf477332fa57df2b/)
- [Pydantic异步校验器深：构建高并发验证系统 | cmdragon's Blog](https://blog.cmdragon.cn/posts/38a93fe6312bbee008f3c11d9ecbb557/)
- [Pydantic根校验器：构建跨字段验证系统 | cmdragon's Blog](https://blog.cmdragon.cn/posts/3c17dfcf84fdc8190e40286d114cebb7/)


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