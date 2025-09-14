---
url: /posts/fc4ef84559e04693a620d0714cb30787/
title: 如何用Git Hook和CI流水线为FastAPI项目保驾护航？
date: 2025-09-14T00:12:42+08:00
lastmod: 2025-09-14T00:12:42+08:00
author: cmdragon
cover: /images/e659b7d8b2374c58a2d66ffb0d2fa001~tplv-5jbd59dj06-image.png

summary:
  持续集成（CI）在FastAPI项目中通过频繁合并代码和自动验证，确保代码变更不会破坏接口功能、模型验证或代码风格。Git Hook作为本地代码质量的第一道防线，通过pre-commit钩子在提交前拦截无效代码。GitHub Actions用于构建CI流水线，自动化测试和构建Docker镜像。两者结合，本地快速反馈，全局统一验证，最大化保障代码质量。

categories:
  - fastapi

tags:
  - FastAPI
  - 持续集成
  - Git Hook
  - GitHub Actions
  - 自动化测试
  - 代码质量
  - CI/CD

---


<img src="/images/e659b7d8b2374c58a2d66ffb0d2fa001~tplv-5jbd59dj06-image.png" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 持续集成：FastAPI项目的自动化质量保障

### 1.1 什么是持续集成？

持续集成（CI）是一种**频繁合并代码+自动验证**的开发实践，核心目标是“让代码变更的风险最小化”。对于FastAPI这样的Web框架，CI的价值在于：
**用自动化替代手动操作**，确保每一次代码变更都不会破坏接口功能、模型验证或代码风格。

### 1.2 FastAPI中的CI核心目标

FastAPI的设计依赖两个关键组件：`pydantic`（数据验证）和`路由`（接口逻辑）。CI需要自动化验证以下内容：

- **接口正确性**：通过`pytest`测试`/items/`等接口是否返回预期结果（如无效`name`是否被拒绝）；
- **模型合法性**：验证`pydantic`模型的约束（如`min_length=3`、`gt=0`）是否生效；
- **代码一致性**：用`flake8`检查代码风格，避免“一人一种写法”；
- **环境兼容性**：确保代码在不同环境（如本地、CI、生产）中行为一致。

## Git Hook：本地代码质量的第一道防线

### 2.1 Git Hook基础

Git Hook是Git在**特定事件**（如提交、推送）时自动运行的脚本，相当于“本地的门禁系统”。最常用的两个钩子是：

- **pre-commit**：在`git commit`前运行，拦截“脏代码”（如测试失败、风格错误）；
- **pre-push**：在`git push`前运行，拦截“未通过集成测试的代码”。

对于FastAPI开发，`pre-commit`是**最有效的本地质量保障**——它能在你提交代码前快速反馈问题，避免将错误推送到远程仓库。

### 2.2 用pre-commit框架配置钩子

手动编写Git Hook脚本容易出错，推荐用**pre-commit**工具（Python库）简化配置：

#### 步骤1：安装pre-commit

```bash
pip install pre-commit==3.6.0  # 最新版本可通过pre-commit官网查询
```

#### 步骤2：配置.pre-commit-config.yaml

在项目根目录创建该文件，定义要运行的“检查项”：

```yaml
repos:
  # 基础代码风格检查
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace  # 去除行尾空格
      - id: end-of-file-fixer    # 确保文件以换行结尾

  # Python代码风格检查
  - repo: https://github.com/PyCQA/flake8
    rev: 7.0.0
    hooks:
      - id: flake8
        args: [ "--max-line-length=120" ]  # 调整行宽限制

  # 自动运行pytest测试
  - repo: local
    hooks:
      - id: pytest
        name: Run API Tests
        entry: pytest            # 运行pytest
        language: system        # 使用本地Python环境
        types: [ python ]         # 只检查Python文件
        pass_filenames: false   # 不传递文件名（运行所有测试）
        always_run: true        # 强制运行（即使无文件修改）
```

#### 步骤3：安装并测试钩子

```bash
pre-commit install  # 将钩子安装到Git
pre-commit run --all-files  # 测试所有文件是否符合要求
```

### 2.3 预测试验证：拦截无效代码

假设你的FastAPI应用有一个`Item`模型（用`pydantic`定义）：

```python
# main.py
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()


class Item(BaseModel):
    name: str = Field(..., min_length=3, description="商品名称，至少3个字符")
    price: float = Field(..., gt=0, description="商品价格，必须大于0")


@app.post("/items/")
def create_item(item: Item):
    return {"message": f"创建商品 {item.name}，价格 {item.price}"}
```

测试用例`test_main.py`验证接口的合法性：

```python
# test_main.py
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_create_item_valid():
    """测试合法输入"""
    response = client.post("/items/", json={"name": "Apple", "price": 1.99})
    assert response.status_code == 200
    assert response.json() == {"message": "创建商品 Apple，价格 1.99"}


def test_create_item_invalid_name():
    """测试名称过短"""
    response = client.post("/items/", json={"name": "Ap", "price": 1.99})
    assert response.status_code == 422  # 验证错误
```

当你尝试提交**名称过短**的代码时，`pre-commit`会自动运行`pytest`，并阻止提交：

```
Run API Tests........................................................Failed
- hook id: pytest
- exit code: 1

============================= test session starts ==============================
collected 2 items

test_main.py .F                                                      [100%]

=================================== FAILURES ===================================
___________________________ test_create_item_invalid_name ___________________________

client = <starlette.testclient.TestClient object at 0x104f8d0d0>

    def test_create_item_invalid_name():
        response = client.post("/items/", json={"name": "Ap", "price": 1.99})
>       assert response.status_code == 422
E       assert 200 == 422  # 错误：接口意外返回了200（代码逻辑有问题）

test_main.py:15: AssertionError
============================== 1 failed, 1 passed in 0.12s ===============================
```

此时你需要**修复代码逻辑**（如确保`Item`模型的`min_length`生效），再重新提交。

## 构建FastAPI的CI流水线：从本地到云端

### 3.1 选择CI工具

推荐使用**GitHub Actions**（与GitHub仓库无缝集成），它能自动处理“代码推送→运行测试→构建镜像”的全流程。

### 3.2 编写GitHub Actions Workflow

在项目根目录创建`.github/workflows/ci.yml`，定义流水线的“触发条件”和“步骤”：

```yaml
name: FastAPI CI/CD  # 流水线名称

# 触发条件：push到main分支或提交PR到main分支
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  # 第一个任务：运行测试
  test:
    runs-on: ubuntu-latest  # 使用Ubuntu环境
    steps:
      - name: 拉取代码
        uses: actions/checkout@v4  # 官方Action，拉取仓库代码

      - name: 配置Python环境
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'  # 与本地开发环境一致

      - name: 安装依赖
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt  # 安装requirements.txt中的依赖

      - name: 运行pytest测试
        run: pytest  # 执行测试用例

  # 第二个任务：构建Docker镜像（依赖test任务成功）
  build:
    needs: test  # 只有test任务成功，才会运行build
    runs-on: ubuntu-latest
    steps:
      - name: 拉取代码
        uses: actions/checkout@v4

      - name: 构建Docker镜像
        run: docker build -t my-fastapi-app:${{ github.sha }} .  # 用commit ID作为标签
```

### 3.3 流水线的作用

当你执行`git push origin main`时，GitHub Actions会自动：

1. **拉取代码**：从main分支获取最新代码；
2. **配置环境**：安装Python3.11和依赖；
3. **运行测试**：执行`pytest`，验证接口和模型；
4. **构建镜像**：如果测试通过，构建Docker镜像（用于后续部署）。

## 完整示例：从Git Hook到CI的全流程

### 4.1 项目结构

```
my-fastapi-project/
├── .github/
│   └── workflows/
│       └── ci.yml  # GitHub Actions配置
├── .pre-commit-config.yaml  # pre-commit配置
├── main.py  # FastAPI应用
├── test_main.py  # 测试用例
└── requirements.txt  # 依赖清单
```

### 4.2 依赖清单：requirements.txt

```
fastapi==0.110.0  
uvicorn==0.27.0
pytest==7.4.4
requests==2.31.0
flake8==7.0.0
pre-commit==3.6.0
```

### 4.3 运行流程

1. **本地开发**：修改`main.py`（如添加新接口）；
2. **提交代码**：执行`git commit -m "add item endpoint"`，`pre-commit`自动运行`pytest`和`flake8`；
3. **推送代码**：执行`git push origin main`，GitHub Actions触发CI流水线；
4. **查看结果**：在GitHub仓库的“Actions”标签页查看流水线状态（绿色✔️表示成功，红色❌表示失败）。

## 课后Quiz：巩固你的理解

### 问题

在FastAPI项目中，为什么推荐同时使用Git Hook和CI流水线进行测试验证？

### 答案解析

Git Hook是**本地的快速反馈机制**——能在代码提交前拦截小错误（如测试失败、代码风格），避免将无效代码推送到远程，减少CI的无效运行；而CI流水线是
**全局的统一验证机制**——确保所有代码在一致的环境（如Ubuntu+Python3.11）中通过测试，避免本地环境与生产环境的差异（如Python版本不同导致的问题）。两者结合能
**最大化代码质量的保障效率**：本地解决小问题，全局解决大问题。

## 常见报错及解决方案

### 报错1：pre-commit钩子不运行

- **原因**：Git Hook脚本没有执行权限（手动编写钩子时常见）。
- **解决**：如果使用`pre-commit`工具，重新运行`pre-commit install`
  （工具会自动设置权限）；如果手动编写钩子，执行`chmod +x .git/hooks/pre-commit`。

### 报错2：测试失败导致提交被阻止

- **原因**：`pytest`运行失败（如接口返回状态码不符合预期、模型验证不通过）。
- **解决**：查看测试失败的详细信息（如`test_create_item_invalid_name`的断言错误），修复代码逻辑（如确保`Item`
  模型的`min_length`生效），再重新提交。

### 报错3：CI流水线中安装依赖失败

- **原因**：`requirements.txt`未包含所有依赖（如缺少`fastapi`或`pytest`）。
- **解决**：在本地环境运行`pip freeze > requirements.txt`，更新依赖清单，再重新推送代码。

### 报错4：CI测试通过但本地测试失败

- **原因**：本地环境与CI环境的差异（如Python版本不同、环境变量未设置）。
- **解决**：在CI流水线中配置与本地一致的环境（如`setup-python@v5`指定Python3.11），或使用`python-dotenv`
  加载环境变量（如`.env`文件中的`DEBUG=True`）。

## 写在最后

FastAPI的高级特性（如pydantic模型、依赖注入）让开发更高效，但也需要**自动化工具**保障质量。Git
Hook和CI流水线的结合，能让你在“快速开发”和“代码质量”之间找到平衡——本地用Git Hook快速反馈，云端用CI统一验证，最终实现“放心提交，安心上线”。

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[如何用Git Hook和CI流水线为FastAPI项目保驾护航？](https://blog.cmdragon.cn/posts/fc4ef84559e04693a620d0714cb30787/)



<details>
<summary>往期文章归档</summary>

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
- [BackgroundTasks与Celery：谁才是异步任务的终极赢家？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/792cac4ce6eb96b5001da15b0d52ef83/)
- [如何在 FastAPI 中优雅处理后台任务异常并实现智能重试？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/d5c1d2efbaf6fe4c9e13acc6be6d929a/)
- [BackgroundTasks 如何巧妙驾驭多任务并发？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/8661dc74944bd6fb28092e90d4060161/)

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