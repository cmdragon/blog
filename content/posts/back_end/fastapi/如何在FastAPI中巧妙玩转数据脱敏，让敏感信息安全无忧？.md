---
url: /posts/045021f8831a03bcdf71e44cb793baf4/
title: 如何在FastAPI中巧妙玩转数据脱敏，让敏感信息安全无忧？
date: 2025-07-01T15:37:22+08:00
lastmod: 2025-07-01T15:37:22+08:00
author: cmdragon

summary:
  FastAPI框架中，数据脱敏通过Pydantic模型标记敏感字段，使用SecretStr类型自动隐藏敏感数据，并配置模型以排除特定字段。响应数据动态脱敏策略包括响应模型过滤、动态字段排除和条件脱敏实现。第三方加密服务集成如Vault，提供加密数据和密钥管理功能。常见问题如422验证错误和Vault连接超时，通过检查请求体、验证字段类型和更新客户端令牌解决。环境配置和代码验证方法确保安全实践的有效性。

categories:
  - fastapi

tags:
  - fastapi
  - 数据脱敏
  - Pydantic模型
  - 敏感字段处理
  - Vault加密
  - 动态脱敏策略
  - 安全实践

---

<img src="/images/8917b3ffc1f2ba22b8806a397fe73176.jpeg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 一、Pydantic模型敏感字段标记

### 1.1 基础字段标记方法

通过Field函数的description参数声明敏感字段：

```python
from pydantic import BaseModel, Field


class User(BaseModel):
    username: str
    password: str = Field(..., description="敏感字段-用户密码")
    phone: str = Field(..., example="138****7890")
```

### 1.2 高级安全类型应用

使用SecretStr类型自动隐藏敏感数据：

```python
from pydantic import SecretStr


class SafeUser(BaseModel):
    api_key: SecretStr
    db_password: SecretStr


# 输出时将自动转为********
print(SafeUser(api_key="sk-1234", db_password="db@123").json())
# 输出：{"api_key": "**********", "db_password": "**********"}
```

### 1.3 模型配置示例

```python
class SensitiveModel(BaseModel):
    class Config:
        json_encoders = {
            SecretStr: lambda v: "*******" if v else None
        }
        exclude_fields = ['password']
```

流程图说明：

```mermaid
graph TD
    A[用户请求] --> B[模型验证]
    B --> C[敏感字段标记]
    C --> D[数据持久化]
	
```

## 二、响应数据动态脱敏策略

### 2.1 响应模型过滤

```python
class UserResponse(BaseModel):
    username: str
    email: str


@app.get("/users/me", response_model=UserResponse)
async def read_user_me():
    return current_user.dict()
```

### 2.2 动态字段排除

```python
from fastapi import Depends


def mask_sensitive_data(user: User):
    return user.dict(exclude={"password", "ssn"})


@app.get("/users/{id}")
async def get_user(data: dict = Depends(mask_sensitive_data)):
    return data
```

### 2.3 条件脱敏实现

```python
from typing import Optional


class DynamicResponse(BaseModel):
    name: str
    phone: Optional[str]
    email: Optional[str]

    @classmethod
    def create_with_mask(cls, user: User, is_admin: bool):
        fields = user.dict()
        if not is_admin:
            fields.update({"phone": "138****7890", "email": "***@example.com"})
        return cls(**fields)
```

流程图说明：

```mermaid
graph TD
    A[原始数据] --> B{权限判断}
    B -->|通过| C[字段替换]
    B -->|拒绝| D[返回错误]
    C --> E[响应输出]
    D --> E
```

## 三、第三方加密服务集成（Vault）

### 3.1 Vault配置示例

```python
import hvac

vault_client = hvac.Client(
    url="http://vault:8200",
    token="s.4zNq3Z8gKj9R6tY1"
)


def encrypt_data(data: str) -> str:
    return vault_client.secrets.transit.encrypt_data(
        name="fastapi-key",
        plaintext=data.encode()
    )["data"]["ciphertext"]
```

### 3.2 集成到数据模型

```python
from pydantic import validator


class EncryptedUser(User):
    @validator('password', pre=True)
    def encrypt_password(cls, v):
        return encrypt_data(v)
```

### 3.3 完整工作流程

```mermaid
graph TD
    A[客户端请求] --> B[参数验证]
    B --> C{敏感字段判断}
    C -->|是| D[Vault加密]
    C -->|否| E[直接存储]
    D --> F[数据库保存]
    E --> F
```

## 课后Quiz

1. 当需要在前端显示用户手机号时，应该使用哪种脱敏方式？
   A) 完全显示
   B) 中间四位星号
   C) 全部加密
   D) 随机替换

   **答案：B**  
   答案解析：根据PCI DSS规范要求，敏感信息需要部分隐藏但保持可识别性

2. 以下哪项是Vault的核心功能？
   A) 自动生成API文档
   B) 动态密钥管理
   C) 请求速率限制
   D) 数据库迁移

   **答案：B**  
   答案解析：Vault提供加密即服务、密钥轮换等安全功能

## 常见报错解决方案

### 问题1：422 Validation Error

**现象**：
`{"detail":[{"loc":["body","password"],"msg":"field required","type":"value_error.missing"}]}`

**解决方法**：

1. 检查请求体是否包含必填字段
2. 验证字段类型是否符合模型定义
3. 使用try-except块捕获ValidationError：

```python
from fastapi import HTTPException
from pydantic import ValidationError


@app.post("/users")
async def create_user(data: dict):
    try:
        return User(**data)
    except ValidationError as e:
        raise HTTPException(422, detail=e.errors())
```

### 问题2：Vault连接超时

**现象**：`hvac.exceptions.VaultDown: Unable to connect to Vault server`

**排查步骤**：

1. 检查Vault服务状态：`vault status`
2. 验证网络连通性：`telnet vault 8200`
3. 更新客户端令牌：`vault token renew`

---

**环境配置**：

```bash
pip install fastapi==0.68.0 pydantic==1.8.2 python-multipart==0.0.5 hvac==0.11.2
```

**代码验证方法**：

```python
import pytest
from fastapi.testclient import TestClient

client = TestClient(app)


def test_sensitive_masking():
    response = client.get("/users/1")
    assert "****" in response.json()["phone"]
```

以上内容通过实际案例演示了从字段标记到加密集成的完整数据脱敏流程，采用符合行业标准的安全实践，建议在生产环境中配合HTTPS和访问日志审计共同使用。

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[如何在FastAPI中巧妙玩转数据脱敏，让敏感信息安全无忧？](https://blog.cmdragon.cn/posts/045021f8831a03bcdf71e44cb793baf4/)

## 往期文章归档：

- [RBAC权限模型如何让API访问控制既安全又灵活？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/9f01e838545ae8d34016c759ef461423/)
- [FastAPI中的敏感数据如何在不泄露的情况下翩翩起舞？](https://blog.cmdragon.cn/posts/88e8615e4c961e7a4f0ef31c0e41cb0b/)
- [FastAPI安全认证的终极秘籍：OAuth2与JWT如何完美融合？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/17d5c40ff6c84ad652f962fed0ce46ab/)
- [如何在FastAPI中打造坚不可摧的Web安全防线？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/9d6200ae7ce0a1a1a523591e3d65a82e/)
- [如何用 FastAPI 和 RBAC 打造坚不可摧的安全堡垒？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/d878b5dbef959058b8098551c70594f8/)
- [FastAPI权限配置：你的系统真的安全吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/96b6ede65030daa4613ab92da1d739a6/#%E5%BE%80%E6%9C%9F%E6%96%87%E7%AB%A0%E5%BD%92%E6%A1%A3)
- [FastAPI权限缓存：你的性能瓶颈是否藏在这只“看不见的手”里？ | cmdragon's Blog](https://blog.cmdragon.cn/posts/0c8c5a3fdaf69250ac3db7429b102625/)
- [FastAPI日志审计：你的权限系统是否真的安全无虞？ | cmdragon's Blog](https://blog.cmdragon.cn/posts/84bf7b11b342415bddb50e0521c64dfe/)
- [如何在FastAPI中打造坚不可摧的安全防线？ | cmdragon's Blog](https://blog.cmdragon.cn/posts/e2ec1e31dd5d97e0f32d2125385fd955/)
- [如何在FastAPI中实现权限隔离并让用户乖乖听话？ | cmdragon's Blog](https://blog.cmdragon.cn/posts/74777546a240b16b32196e5eb29ec8f7/)
- [如何在FastAPI中玩转权限控制与测试，让代码安全又优雅？ | cmdragon's Blog](https://blog.cmdragon.cn/posts/9dd24a9753ba15f98f24c1e5134fe40e/)
- [如何在FastAPI中打造一个既安全又灵活的权限管理系统？ | cmdragon's Blog](https://blog.cmdragon.cn/posts/277aa1628a2fa9855cdfe5f7c302bd92/)
- [FastAPI访问令牌的权限声明与作用域管理：你的API安全真的无懈可击吗？ | cmdragon's Blog](https://blog.cmdragon.cn/posts/82bae833ad460aec0965cc77b7d6f652/)
- [如何在FastAPI中构建一个既安全又灵活的多层级权限系统？ | cmdragon's Blog](https://blog.cmdragon.cn/posts/13fc113ef1dff03927d46235ad333a7f/)
- [FastAPI如何用角色权限让Web应用安全又灵活？ | cmdragon's Blog](https://blog.cmdragon.cn/posts/cc7aa0af577ae2bc0694e76886373e12/)
- [FastAPI权限验证依赖项究竟藏着什么秘密？ | cmdragon's Blog](https://blog.cmdragon.cn/posts/3e287e8b907561728ded1be34a19b22c/)
- [如何用FastAPI和Tortoise-ORM打造一个既高效又灵活的角色管理系统？ | cmdragon's Blog](https://blog.cmdragon.cn/posts/2b0a2003074eba56a6f6c57aa9690900/)
- [JWT令牌如何在FastAPI中实现安全又高效的生成与验证？ | cmdragon's Blog](https://blog.cmdragon.cn/posts/031a4b22bb8d624cf23ef593f72d1ec6/)
- [你的密码存储方式是否在向黑客招手？ | cmdragon's Blog](https://blog.cmdragon.cn/posts/5f8821250c5a4e9cc08bd08faef76c77/)
- [如何在FastAPI中轻松实现OAuth2认证并保护你的API？ | cmdragon's Blog](https://blog.cmdragon.cn/posts/c290754b532ebf91c5415aa0b30715d0/)
- [FastAPI安全机制：从OAuth2到JWT的魔法通关秘籍 | cmdragon's Blog](https://blog.cmdragon.cn/posts/30ed200ec25b55e1ba159366401ed6ee/)
- [FastAPI认证系统：从零到令牌大师的奇幻之旅 | cmdragon's Blog](https://blog.cmdragon.cn/posts/69f7189d3ff058334889eb2e02f2ea2c/)
- [FastAPI安全异常处理：从401到422的奇妙冒险 | cmdragon's Blog](https://blog.cmdragon.cn/posts/92a7a3de40eb9ce71620716632f68676/)
- [FastAPI权限迷宫：RBAC与多层级依赖的魔法通关秘籍 | cmdragon's Blog](https://blog.cmdragon.cn/posts/ee5486714707d4835d4a774696dca30a/)
- [JWT令牌：从身份证到代码防伪的奇妙之旅 | cmdragon's Blog](https://blog.cmdragon.cn/posts/a39277914464b007ac61874292578de0/)
- [FastAPI安全认证：从密码到令牌的魔法之旅 | cmdragon's Blog](https://blog.cmdragon.cn/posts/7d79b5a5c4a3adad15117a45d7976554/)
- [密码哈希：Bcrypt的魔法与盐值的秘密 | cmdragon's Blog](https://blog.cmdragon.cn/posts/f3671b2501c23bd156bfd75c5b56ce4c/)
- [用户认证的魔法配方：从模型设计到密码安全的奇幻之旅 | cmdragon's Blog](https://blog.cmdragon.cn/posts/ac5bec89ea446ce4f6b01891f640fbfe/)
- [FastAPI安全门神：OAuth2PasswordBearer的奇妙冒险 | cmdragon's Blog](https://blog.cmdragon.cn/posts/53653fa69249a339b6727107deaf2608/)
- [OAuth2密码模式：信任的甜蜜陷阱与安全指南 | cmdragon's Blog](https://blog.cmdragon.cn/posts/c27c69799af51ce0bde2ccea9d456fe4/)
- [API安全大揭秘：认证与授权的双面舞会 | cmdragon's Blog](https://blog.cmdragon.cn/posts/b443c33ca4bfb2b8fb64828fcfbcb0d1/)
- [异步日志监控：FastAPI与MongoDB的高效整合之道 | cmdragon's Blog](https://blog.cmdragon.cn/posts/91fb351897e237f4c9f800a0d540d563/)
- [FastAPI与MongoDB分片集群：异步数据路由与聚合优化 | cmdragon's Blog](https://blog.cmdragon.cn/posts/d76caa4fa21663a571b5402f6c338e4d/)
- [FastAPI与MongoDB Change Stream的实时数据交响曲 | cmdragon's Blog](https://blog.cmdragon.cn/posts/1d058d1c4c16f98110a65a452b45e297/)
- [地理空间索引：解锁日志分析中的位置智慧 | cmdragon's Blog](https://blog.cmdragon.cn/posts/ff7035fd370df44b9951ebab5c17d09d/)
- [异步之舞：FastAPI与MongoDB的极致性能优化之旅 | cmdragon's Blog](https://blog.cmdragon.cn/posts/a63d90eaa312a74e7fd5ed3bc312692f/)

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