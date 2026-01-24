---
url: /posts/8821ab1186b05252feda20836609463e/
title: FastAPI 核心机制：分页参数的实现与最佳实践
date: 2025-03-13T00:18:53+08:00
updated: 2025-03-13T00:18:53+08:00
author: cmdragon

summary:
  在构建现代Web应用程序时，分页是一个不可或缺的功能。无论是处理大量数据还是优化用户体验，分页都起到了至关重要的作用。本文将深入探讨如何在FastAPI中实现分页参数（如page、page_size以及总页数计算），并涵盖相关的核心机制、最佳实践、常见问题及解决方案。

categories:
  - fastapi

tags:
  - fastapi
  - 分页
  - Web开发
  - 数据库查询
  - 性能优化
  - 安全实践
  - 错误处理
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2025_03_13 01_29_33.png" title="2025_03_13 01_29_33.png" alt="2025_03_13 01_29_33.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[探索数千个预构建的 AI 应用，开启你的下一个伟大创意](https://tools.cmdragon.cn/zh/apps?category=ai_chat)

### **1. 分页的基本概念**

分页是将大量数据分割成多个小块（即“页”），以便用户或系统可以逐步加载和处理这些数据。在Web应用中，分页通常用于处理数据库查询结果、API响应等场景。常见的分页参数包括：

- `page`：当前页码。
- `page_size`：每页显示的数据条数。
- `total_pages`：总页数。

### **2. FastAPI中的分页实现**

在FastAPI中，分页可以通过查询参数来实现。以下是一个简单的示例，展示了如何在FastAPI中实现分页功能。

```python
from fastapi import FastAPI, Query
from typing import List, Optional

app = FastAPI()

# 模拟数据库数据
fake_items_db = [{"item_name": f"Item {i}"} for i in range(100)]


@app.get("/items/")
async def read_items(page: int = Query(1, gt=0), page_size: int = Query(10, gt=0)):
    start = (page - 1) * page_size
    end = start + page_size
    items = fake_items_db[start:end]
    total_items = len(fake_items_db)
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": total_pages,
    }
```

在这个示例中，我们定义了两个查询参数`page`和`page_size`，并通过计算`start`和`end`
来获取当前页的数据。我们还计算了总页数`total_pages`，并将其包含在响应中。

### **3. 分页参数的最佳实践**

#### **3.1 参数验证**

为了确保分页参数的有效性，我们需要对`page`和`page_size`进行验证。FastAPI提供了`Query`参数验证功能，可以轻松实现这一点。

```python
from fastapi import Query


@app.get("/items/")
async def read_items(page: int = Query(1, gt=0), page_size: int = Query(10, gt=0, le=100)):
    # 分页逻辑
    pass
```

在这个示例中，我们使用`gt`（大于）和`le`（小于等于）来限制`page`和`page_size`的取值范围。如果用户提供的参数不符合要求，FastAPI会自动返回422
Validation Error。

#### **3.2 默认值设置**

为分页参数设置合理的默认值可以提升用户体验。例如，将`page_size`的默认值设置为10或20，可以避免用户一次性加载过多数据。

```python
@app.get("/items/")
async def read_items(page: int = Query(1, gt=0), page_size: int = Query(10, gt=0, le=100)):
    # 分页逻辑
    pass
```

#### **3.3 总页数计算**

总页数的计算公式为：

```python
total_pages = (total_items + page_size - 1) // page_size
```

这个公式确保了总页数的准确性，即使`total_items`不能被`page_size`整除。

### **4. 数据库查询中的分页**

在实际应用中，分页通常与数据库查询结合使用。以下是一个使用SQLAlchemy进行分页查询的示例。

```python
from sqlalchemy.orm import Session
from fastapi import Depends
from .database import SessionLocal


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/items/")
async def read_items(page: int = Query(1, gt=0), page_size: int = Query(10, gt=0, le=100),
                     db: Session = Depends(get_db)):
    start = (page - 1) * page_size
    items = db.query(Item).offset(start).limit(page_size).all()
    total_items = db.query(Item).count()
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": total_pages,
    }
```

在这个示例中，我们使用`offset`和`limit`来实现分页查询，并通过`count`方法获取总数据条数。

### **5. 分页的安全性**

#### **5.1 避免SQL注入**

在使用原始SQL查询时，必须注意避免SQL注入攻击。SQLAlchemy等ORM框架已经内置了防止SQL注入的机制，但在使用原始SQL时，仍需谨慎。

```python
from sqlalchemy.sql import text


@app.get("/items/")
async def read_items(page: int = Query(1, gt=0), page_size: int = Query(10, gt=0, le=100),
                     db: Session = Depends(get_db)):
    start = (page - 1) * page_size
    query = text("SELECT * FROM items LIMIT :limit OFFSET :offset")
    items = db.execute(query, {"limit": page_size, "offset": start}).fetchall()
    total_items = db.execute(text("SELECT COUNT(*) FROM items")).scalar()
    total_pages = (total_items + page_size - 1) // page_size
    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": total_pages,
    }
```

在这个示例中，我们使用参数化查询来避免SQL注入。

#### **5.2 数据隐私**

在处理敏感数据时，确保分页查询不会泄露隐私信息。例如，避免在分页查询中返回未授权的数据。

### **6. 性能优化**

#### **6.1 索引优化**

在数据库查询中，为分页字段（如`id`、`created_at`等）创建索引可以显著提升查询性能。

```sql
CREATE INDEX idx_items_created_at ON items (created_at);
```

#### **6.2 缓存**

对于频繁访问的分页数据，可以使用缓存机制（如Redis）来减少数据库查询次数。

```python
from fastapi_cache import FastAPICache
from fastapi_cache.decorator import cache


@app.get("/items/")
@cache(expire=60)
async def read_items(page: int = Query(1, gt=0), page_size: int = Query(10, gt=0, le=100)):
    # 分页逻辑
    pass
```

在这个示例中，我们使用`fastapi-cache`库来缓存分页查询结果，缓存有效期为60秒。

### **7. 常见错误及解决方案**

#### **7.1 422 Validation Error**

当分页参数不符合验证规则时，FastAPI会返回422 Validation Error。解决方案是确保分页参数的取值范围正确，并在API文档中明确说明。

```python
@app.get("/items/")
async def read_items(page: int = Query(1, gt=0), page_size: int = Query(10, gt=0, le=100)):
    # 分页逻辑
    pass
```

#### **7.2 500 Internal Server Error**

当数据库查询失败或分页逻辑出现错误时，可能会返回500 Internal Server Error。解决方案是捕获异常并返回友好的错误信息。

```python
from fastapi import HTTPException


@app.get("/items/")
async def read_items(page: int = Query(1, gt=0), page_size: int = Query(10, gt=0, le=100),
                     db: Session = Depends(get_db)):
    try:
        start = (page - 1) * page_size
        items = db.query(Item).offset(start).limit(page_size).all()
        total_items = db.query(Item).count()
        total_pages = (total_items + page_size - 1) // page_size
        return {
            "items": items,
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": total_pages,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

在这个示例中，我们捕获了所有异常，并返回500 Internal Server Error。

### **8. 课后Quiz**

1. **如何避免SQL注入攻击？**
    - 使用参数化查询。
    - 避免拼接SQL语句。
    - 使用ORM框架。

2. **如何优化分页查询的性能？**
    - 为分页字段创建索引。
    - 使用缓存机制。
    - 减少查询返回的字段数量。

3. **如何处理分页参数无效的情况？**
    - 使用FastAPI的`Query`参数验证功能。
    - 返回422 Validation Error。
    - 在API文档中明确说明参数要求。

---

**常见报错解决方案：**

- **422 Validation Error**：检查分页参数的取值范围，确保符合验证规则。
- **500 Internal Server Error**：捕获异常并返回友好的错误信息，检查数据库查询逻辑。
- **404 Not Found**：确保分页参数不会导致查询结果为空，处理边界情况。

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

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
- [Python异步编程进阶指南：破解高并发系统的七重封印 | cmdragon's Blog](https://blog.cmdragon.cn/posts/6163781e0bba17626978fadf63b3e92e/)
- [Python异步编程终极指南：用协程与事件循环重构你的高并发系统 | cmdragon's Blog](https://blog.cmdragon.cn/posts/bac9c0badd47defc03ac5508af4b6e1a/)
- [Python类型提示完全指南：用类型安全重构你的代码，提升10倍开发效率 | cmdragon's Blog](https://blog.cmdragon.cn/posts/ca8d996ad2a9a8a8175899872ebcba85/)
- [三大平台云数据库生态服务对决 | cmdragon's Blog](https://blog.cmdragon.cn/posts/acbd74fc659aaa3d2e0c76387bc3e2d5/)
- [分布式数据库解析 | cmdragon's Blog](https://blog.cmdragon.cn/posts/4c553fe22df1e15c19d37a7dc10c5b3a/)
- [深入解析NoSQL数据库：从文档存储到图数据库的全场景实践 | cmdragon's Blog](https://blog.cmdragon.cn/posts/deed11eed0f84c915ed9e9d5aad6c06d/)
- [数据库审计与智能监控：从日志分析到异常检测 | cmdragon's Blog](https://blog.cmdragon.cn/posts/9c2a135562a18261d70cc5637df435e5/)
- [数据库加密全解析：从传输到存储的安全实践 | cmdragon's Blog](https://blog.cmdragon.cn/posts/123dc22a37df8d53292d1269e39dbbc0/)
- [数据库安全实战：访问控制与行级权限管理 | cmdragon's Blog](https://blog.cmdragon.cn/posts/a49721363d1cea8f5fac980120f52242/)
- [数据库扩展之道：分区、分片与大表优化实战 | cmdragon's Blog](https://blog.cmdragon.cn/posts/ed72acd868f765d0ffbced2236b90190/)
- [查询优化：提升数据库性能的实用技巧 | cmdragon's Blog](https://blog.cmdragon.cn/posts/c2b225e3d0b1e9de613fde47b1d4cacb/)
- [性能优化与调优：全面解析数据库索引 | cmdragon's Blog](https://blog.cmdragon.cn/posts/8dece2eb47ac87272320e579cc6f8591/)
- [存储过程与触发器：提高数据库性能与安全性的利器 | cmdragon's Blog](https://blog.cmdragon.cn/posts/712adcfc99736718e1182040d70fd36b/)
- [数据操作与事务：确保数据一致性的关键 | cmdragon's Blog](https://blog.cmdragon.cn/posts/aff107a909f04dc52a887b45e9bd2484/)
- [深入掌握 SQL 深度应用：复杂查询的艺术与技巧 | cmdragon's Blog](https://blog.cmdragon.cn/posts/0f0a929119a4799c8ea1e087e592c545/)
- [彻底理解数据库设计原则：生命周期、约束与反范式的应用 | cmdragon's Blog](https://blog.cmdragon.cn/posts/934686b6ed93e241883a74eaf236bc96/)
- [深入剖析实体-关系模型（ER 图）：理论与实践全解析 | cmdragon's Blog](https://blog.cmdragon.cn/posts/ec68b3f706bd0db1585b4d150de54100/)
- [数据库范式详解：从第一范式到第五范式 | cmdragon's Blog](https://blog.cmdragon.cn/posts/2b268e76c15d9640a08fed80fccfc562/)
- [PostgreSQL：数据库迁移与版本控制 | cmdragon's Blog](https://blog.cmdragon.cn/posts/649f515b93a6caee9dc38f1249e9216e/)
- [Node.js 与 PostgreSQL 集成：深入 pg 模块的应用与实践 | cmdragon's Blog](https://blog.cmdragon.cn/posts/4798cc064cc3585a3819636b3c23271b/)
-

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
