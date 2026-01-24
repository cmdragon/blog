---
url: /posts/068b69e100a8e9ec06b2685908e6ae96/
title: FastAPI 请求体参数与 Pydantic 模型完全指南：从基础到嵌套模型实战 🚀
date: 2025-03-07T00:18:53+08:00
updated: 2025-03-07T00:18:53+08:00
author: cmdragon

summary:
  本教程深入探讨 FastAPI 请求体参数与 Pydantic 模型的核心机制，涵盖从基础模型定义到嵌套模型的高级用法。通过详细的代码示例、课后测验和常见错误解决方案，帮助初学者快速掌握 FastAPI 请求体参数的使用技巧。您将学习到如何通过 Pydantic 模型进行数据校验、类型转换和嵌套模型设计，从而构建安全、高效的 API 接口。

categories:
  - fastapi

tags:
  - fastapi
  - 请求体参数
  - Pydantic模型
  - 嵌套模型
  - 数据校验
  - API设计
  - RESTful
---


<img src="https://api2.cmdragon.cn/upload/cmder/images/2025_03_07 00_06_21.png" title="2025_03_07 00_06_21.png" alt="2025_03_07 00_06_21.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[探索数千个预构建的 AI 应用，开启你的下一个伟大创意](https://tools.cmdragon.cn/zh/apps?category=ai_chat)

## 第一章：请求体参数基础

### 1.1 什么是请求体参数？

请求体参数是 RESTful API 中用于传递复杂数据的变量，通常出现在 POST、PUT 等请求的请求体中。例如，创建用户时传递的用户信息就是请求体参数。

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class User(BaseModel):
    name: str
    age: int


@app.post("/users/")
async def create_user(user: User):
    return user
```

### 1.2 Pydantic 模型基础

Pydantic 模型用于定义请求体参数的结构和校验规则。通过继承 `BaseModel`，可以轻松定义模型类。

```python
class Item(BaseModel):
    name: str
    description: str = None
    price: float
    tax: float = None


@app.post("/items/")
async def create_item(item: Item):
    return item
```

**示例请求**：

```json
{
  "name": "Foo",
  "price": 45.2,
  "tax": 3.2
}
```

### 1.3 数据校验

Pydantic 模型支持多种数据校验规则，如 `Field`、`constr` 等。

```python
from pydantic import Field, constr


class Product(BaseModel):
    name: constr(min_length=3, max_length=50)
    price: float = Field(..., gt=0)
    description: str = Field(None, max_length=100)


@app.post("/products/")
async def create_product(product: Product):
    return product
```

**示例请求**：

- 合法：`{"name": "Laptop", "price": 999.99}` → 返回产品信息
- 非法：`{"name": "A", "price": -10}` → 422 错误

### 1.4 常见错误与解决方案

**错误**：422 Validation Error  
**原因**：请求体参数类型转换失败或校验不通过  
**解决方案**：检查请求体参数的类型定义和校验规则。

---

## 第二章：嵌套模型

### 2.1 什么是嵌套模型？

嵌套模型是指在一个模型中包含另一个模型，用于表示复杂的数据结构。

```python
class Address(BaseModel):
    street: str
    city: str
    state: str
    zip_code: str


class User(BaseModel):
    name: str
    age: int
    address: Address
```

### 2.2 嵌套模型的使用

通过嵌套模型，可以处理复杂的请求体参数。

```python
@app.post("/users/")
async def create_user(user: User):
    return user
```

**示例请求**：

```json
{
  "name": "John Doe",
  "age": 30,
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip_code": "12345"
  }
}
```

### 2.3 嵌套模型的校验

嵌套模型同样支持数据校验。

```python
class OrderItem(BaseModel):
    name: str
    quantity: int = Field(..., gt=0)
    price: float = Field(..., gt=0)


class Order(BaseModel):
    items: List[OrderItem]
    total: float = Field(..., gt=0)


@app.post("/orders/")
async def create_order(order: Order):
    return order
```

**示例请求**：

- 合法：`{"items": [{"name": "Laptop", "quantity": 1, "price": 999.99}], "total": 999.99}` → 返回订单信息
- 非法：`{"items": [{"name": "Laptop", "quantity": 0, "price": 999.99}], "total": 999.99}` → 422 错误

### 2.4 常见错误与解决方案

**错误**：422 Validation Error  
**原因**：嵌套模型校验失败  
**解决方案**：检查嵌套模型的校验规则。

---

## 第三章：高级用法与最佳实践

### 3.1 模型继承

通过模型继承，可以复用已有的模型定义。

```python
class BaseUser(BaseModel):
    email: str
    password: str


class UserCreate(BaseUser):
    name: str


@app.post("/users/")
async def create_user(user: UserCreate):
    return user
```

### 3.2 模型配置

通过 `Config` 类，可以配置模型的行为，如别名生成、额外字段处理等。

```python
class Item(BaseModel):
    name: str
    description: str = None

    class Config:
        alias_generator = lambda x: x.upper()
        allow_population_by_field_name = True


@app.post("/items/")
async def create_item(item: Item):
    return item
```

### 3.3 模型文档

通过 `Field` 的 `description` 参数，可以为模型字段添加描述信息，这些信息将显示在 API 文档中。

```python
class Product(BaseModel):
    name: str = Field(..., description="产品名称")
    price: float = Field(..., description="产品价格", gt=0)


@app.post("/products/")
async def create_product(product: Product):
    return product
```

### 3.4 常见错误与解决方案

**错误**：422 Validation Error  
**原因**：模型校验失败  
**解决方案**：检查模型的校验规则和配置。

---

## 课后测验

### 测验 1：请求体参数校验

**问题**：如何定义一个包含校验规则的请求体参数？  
**答案**：

```python
from pydantic import BaseModel, Field


class Item(BaseModel):
    name: str = Field(..., min_length=3)
    price: float = Field(..., gt=0)


@app.post("/items/")
async def create_item(item: Item):
    return item
```

### 测验 2：嵌套模型

**问题**：如何定义一个嵌套模型？  
**答案**：

```python
class Address(BaseModel):
    street: str
    city: str


class User(BaseModel):
    name: str
    address: Address


@app.post("/users/")
async def create_user(user: User):
    return user
```

---

## 错误代码应急手册

| 错误代码 | 典型触发场景        | 解决方案                 |
|------|---------------|----------------------|
| 422  | 类型转换失败/校验不通过  | 检查模型定义的校验规则          |
| 404  | 请求体格式正确但资源不存在 | 验证业务逻辑中的数据存在性        |
| 500  | 未捕获的模型处理异常    | 添加 try/except 包裹敏感操作 |
| 400  | 自定义校验规则触发拒绝   | 检查验证器的逻辑条件           |

---

## 常见问题解答

**Q：请求体参数能否使用枚举类型？**  
A：可以，使用 `Enum` 类实现：

```python
from enum import Enum


class Status(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"


class User(BaseModel):
    name: str
    status: Status


@app.post("/users/")
async def create_user(user: User):
    return user
```

**Q：如何处理嵌套模型的默认值？**  
A：在嵌套模型中为字段设置默认值：

```python
class Address(BaseModel):
    street: str
    city: str = "Anytown"


class User(BaseModel):
    name: str
    address: Address = Address(street="123 Main St")


@app.post("/users/")
async def create_user(user: User):
    return user
```

---

通过详细讲解和实战项目，您已掌握 FastAPI 请求体参数与 Pydantic 模型的核心知识。现在可以通过以下命令测试您的学习成果：

```bash
curl -X POST "http://localhost:8000/users/" -H "Content-Type: application/json" -d '{"name": "John Doe", "age": 30, "address": {"street": "123 Main St", "city": "Anytown", "state": "CA", "zip_code": "12345"}}'
```

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

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
- [Python 与 PostgreSQL 集成：深入 psycopg2 的应用与实践 | cmdragon's Blog](https://blog.cmdragon.cn/posts/e533225633ac9f276b7771c03e1ba5e0/)
- [应用中的 PostgreSQL项目案例 | cmdragon's Blog](https://blog.cmdragon.cn/posts/415ac1ac3cb9593b00d398c26b40c768/)
- [数据库安全管理中的权限控制：保护数据资产的关键措施 | cmdragon's Blog](https://blog.cmdragon.cn/posts/42a3ec4c7e9cdded4e3c4db24fb4dad8/)
- [数据库安全管理中的用户和角色管理：打造安全高效的数据环境 | cmdragon's Blog](https://blog.cmdragon.cn/posts/92d56b1325c898ad3efc89cb2b42d84d/)
- [数据库查询优化：提升性能的关键实践 | cmdragon's Blog](https://blog.cmdragon.cn/posts/b87998b03d2638a19ecf589691b6f0ae/)
- [数据库物理备份：保障数据完整性和业务连续性的关键策略 | cmdragon's Blog](https://blog.cmdragon.cn/posts/5399d4194db9a94b2649763cb81284de/)
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

