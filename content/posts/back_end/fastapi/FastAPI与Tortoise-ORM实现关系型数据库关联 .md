---
url: /posts/75c1dff8b6b9960d1d47750094e29f2c/
title: FastAPI与Tortoise-ORM实现关系型数据库关联
date: 2025-04-21T10:51:41+08:00
lastmod: 2025-04-21T10:51:41+08:00
author: cmdragon

summary:
  FastAPI与Tortoise-ORM结合实现关系型数据库关联，支持1:1、1:N和M:N关系。1:N关系通过`ForeignKeyField`定义，M:N关系使用`ManyToManyField`处理。Pydantic模型用于数据验证和序列化，路由实现中通过`prefetch_related`优化查询性能。M:N关系通过中间表操作，支持复杂查询。常见报错包括422验证错误和外键约束失败，可通过事务和类型检查解决。安装依赖后，使用uvicorn启动服务进行测试。

categories:
  - fastapi

tags:
  - fastapi
  - Tortoise-ORM
  - 关系型数据库
  - 异步数据库操作

---
<img src="https://static.shutu.cn/shutu/jpeg/open3a/2025-04-21/a32558b89ccfb655042065f22b8f0a8f.jpeg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[探索数千个预构建的 AI 应用，开启你的下一个伟大创意](https://tools.cmdragon.cn/zh/apps?category=ai_chat)

# 一、FastAPI与Tortoise-ORM关系型数据库关联实现

## 1. 关系型数据库关联基础

在关系型数据库中，表与表之间的关联主要分为三种类型：

- **1:1关系**（如用户与身份证）
- **1:N关系**（如作者与书籍）
- **M:N关系**（如学生与课程）

FastAPI通过Tortoise-ORM实现异步数据库操作时，使用`ForeignKeyField`和`ManyToManyField`
字段类型处理关联关系。相比同步ORM，异步实现需要特别注意await的使用和查询优化。

## 2. 1:N关系实现（作者与书籍案例）

### 2.1 模型定义

```python
# models.py
from tortoise.models import Model
from tortoise import fields


class Author(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255)
    # 反向关系查询字段
    books = fields.ReverseRelation["Book"]


class Book(Model):
    id = fields.IntField(pk=True)
    title = fields.CharField(max_length=255)
    author = fields.ForeignKeyField(
        "models.Author",
        related_name="books",
        on_delete=fields.CASCADE
    )
```

### 2.2 Pydantic模型

```python
# schemas.py
from pydantic import BaseModel


class AuthorCreate(BaseModel):
    name: str


class BookCreate(BaseModel):
    title: str
    author_id: int


class AuthorOut(BaseModel):
    id: int
    name: str
    books: list[dict] = []

    class Config:
        orm_mode = True
```

### 2.3 路由实现

```python
# main.py
from fastapi import FastAPI, HTTPException
from models import Author, Book
from schemas import AuthorCreate, BookCreate, AuthorOut

app = FastAPI()


@app.post("/authors/", response_model=AuthorOut)
async def create_author(author: AuthorCreate):
    db_author = await Author.create(**author.dict())
    return await AuthorOut.from_tortoise_orm(db_author)


@app.get("/authors/{author_id}", response_model=AuthorOut)
async def get_author(author_id: int):
    author = await Author.get(id=author_id).prefetch_related("books")
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    return await AuthorOut.from_tortoise_orm(author)
```

## 3. M:N关系实现（学生与课程案例）

### 3.1 模型定义

```python
# models.py
class Student(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255)
    courses = fields.ManyToManyField(
        "models.Course",
        related_name="students",
        through="student_course"
    )


class Course(Model):
    id = fields.IntField(pk=True)
    name = fields.CharField(max_length=255)
```

### 3.2 中间表操作

```python
# 添加选课关系
student = await Student.get(id=1)
course = await Course.get(id=2)
await student.courses.add(course)

# 查询学生选课
student_with_courses = await Student.get(id=1).prefetch_related("courses")
```

### 3.3 复杂查询示例

```python
# 查询选修数学课的学生
math_students = await Student.filter(
    courses__name="Math"
).prefetch_related("courses")
```

## 4. 课后Quiz

**Q1：当建立1:N关系时，为什么要使用prefetch_related()方法？**
A. 提高查询性能
B. 避免循环引用
C. 处理分页请求
D. 验证数据格式

正确答案：A  
解析：prefetch_related()用于预加载关联数据，通过单次数据库查询获取所有相关记录，避免N+1查询问题，显著提升查询效率。

**Q2：M:N关系中，through参数的作用是什么？**
A. 定义中间表名称
B. 指定关联字段类型
C. 设置级联删除规则
D. 声明索引字段

正确答案：A  
解析：through参数用于自定义中间表名称，当需要向中间表添加额外字段时，可以显式创建中间模型。

## 5. 常见报错解决方案

**报错1：422 Validation Error**

```json
{
  "detail": [
    {
      "loc": [
        "body",
        "author_id"
      ],
      "msg": "value is not a valid integer",
      "type": "type_error.integer"
    }
  ]
}
```

解决方法：

1. 检查请求体数据格式是否符合JSON规范
2. 确认字段类型与Pydantic模型定义一致
3. 使用try/except捕获类型转换异常

**报错2：IntegrityError外键约束失败**

```
sqlite3.IntegrityError: FOREIGN KEY constraint failed
```

解决方法：

1. 检查关联ID是否存在
2. 确认数据库事务完整性
3. 使用atomic()包裹关联操作：

```python
async with in_transaction():
    author = await Author.create(name="J.K. Rowling")
    await Book.create(title="Harry Potter", author=author)
```

**预防建议：**

1. 始终在数据库操作中使用事务
2. 为关联字段添加索引
3. 使用select_related和prefetch_related优化查询

## 运行准备

安装依赖：

```bash
pip install fastapi uvicorn tortoise-orm pydantic
```

启动服务：

```bash
uvicorn main:app --reload
```

通过以上实现，开发者可以完整掌握FastAPI中异步数据库关联操作的核心要点。建议在Postman中测试接口时，重点关注关联数据的完整性和查询效率表现。

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

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
- [Pydantic配置继承抽象基类模式 | cmdragon's Blog](https://blog.cmdragon.cn/posts/48005c4f39db6b2ac899df96448a6fd2/)
- [Pydantic多态模型：用鉴别器构建类型安全的API接口 | cmdragon's Blog](https://blog.cmdragon.cn/posts/fc7b42c24414cb24dd920fb2eae164f5/)
- [FastAPI性能优化指南：参数解析与惰性加载 | cmdragon's Blog](https://blog.cmdragon.cn/posts/d2210ab0f56b1e3ae62117530498ee85/)
- [FastAPI依赖注入：参数共享与逻辑复用 | cmdragon's Blog](https://blog.cmdragon.cn/posts/1821d820e2f8526b106ce0747b811faf/)
- [FastAPI安全防护指南：构建坚不可摧的参数处理体系 | cmdragon's Blog](https://blog.cmdragon.cn/posts/ed25f1c3c737f67a6474196cc8394113/)
- [FastAPI复杂查询终极指南：告别if-else的现代化过滤架构 | cmdragon's Blog](https://blog.cmdragon.cn/posts/eab4df2bac65cb8cde7f6a04b2aa624c/)
- [FastAPI 核心机制：分页参数的实现与最佳实践 | cmdragon's Blog](https://blog.cmdragon.cn/posts/8821ab1186b05252feda20836609463e/)
- [FastAPI 错误处理与自定义错误消息完全指南：构建健壮的 API 应用 🛠️ | cmdragon's Blog](https://blog.cmdragon.cn/posts/cebad7a36a676e5e20b90d616b726489/)
- [FastAPI 自定义参数验证器完全指南：从基础到高级实战 | cmdragon's Blog](https://blog.cmdragon.cn/posts/9d0a403c8be2b1dc31f54f2a32e4af6d/)


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