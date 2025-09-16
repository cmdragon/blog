---
url: /posts/eed6cd8985d9be0a4b092a7da38b3e0c/
title: FastAPI的CI流水线怎么自动测端点，还能让Allure报告美到犯规？
date: 2025-09-16T01:32:40+08:00
lastmod: 2025-09-16T01:32:40+08:00
author: cmdragon
cover: /images/ef10204d56ff47b1b5db99188b0f088b~tplv-5jbd59dj06-image.png

summary:
  持续集成（CI）是一种软件开发实践，开发人员频繁提交代码，CI工具自动触发构建和测试流程，以尽早发现错误。FastAPI项目通过CI保证类型安全、避免端点失效和一致性验证。GitHub Actions是常用的CI工具，通过Workflow、Job和Step定义CI流程。FastAPI的CI流水线包括代码拉取、Python环境设置、依赖安装、测试和Docker镜像构建。Allure测试报告框架生成可视化报告，支持结构化展示和跨平台兼容，与FastAPI的Pytest测试结合，通过Allure装饰器标记测试用例，生成并查看报告。

categories:
  - fastapi

tags:
  - FastAPI
  - 持续集成
  - GitHub Actions
  - CI流水线
  - Pytest
  - Allure
  - 测试报告

---

<img src="/images/ef10204d56ff47b1b5db99188b0f088b~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

### FastAPI与持续集成流水线构建

#### 1.1 什么是持续集成（CI）？

持续集成（Continuous Integration，简称CI）是一种软件开发实践：**开发人员频繁将代码提交到共享仓库（如GitHub的main分支），CI工具自动触发构建、测试流程
**，尽早发现代码中的错误。其核心目标是“快速反馈”——避免代码集成时出现大规模冲突，或因单个提交破坏整个项目的功能。

对于FastAPI项目而言，CI的价值在于：

- 保证**类型安全**：FastAPI依赖Pydantic模型做请求验证，CI能自动检查提交的代码是否违反类型约束；
- 避免**端点失效**：自动测试FastAPI的API端点（如`GET /items/`、`POST /users/`），确保接口功能正常；
- 一致性验证：确保代码在不同环境（开发、测试、生产）中的行为一致。

#### 1.2 选择CI工具：GitHub Actions为例

目前主流的CI工具包括GitHub Actions、GitLab CI、Jenkins等。本文以**GitHub Actions**为例（因多数FastAPI项目托管在GitHub，配置简单且免费）。

GitHub Actions的核心概念：

- **Workflow（工作流）**：定义CI的触发条件和执行步骤，存储在项目根目录的`.github/workflows/`文件夹中；
- **Job（任务）**：一个Workflow可包含多个Job，如“构建代码”“运行测试”“推送镜像”；
- **Step（步骤）**：Job的具体执行单元，如“拉取代码”“安装依赖”。

#### 1.3 编写FastAPI项目的CI流水线配置

以下是一个**完整的FastAPI CI工作流文件**（`.github/workflows/ci.yml`），涵盖“代码拉取→依赖安装→测试→构建Docker镜像”：

```yaml
name: FastAPI CI  # 工作流名称
on: # 触发条件：Push到main分支或PR到main分支
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test: # 定义一个名为build-and-test的Job
    runs-on: ubuntu-latest  # 运行在Ubuntu最新版本的虚拟环境中
    steps:
      # 步骤1：拉取项目代码（必须第一步，否则后续步骤无代码可操作）
      - name: Checkout code
        uses: actions/checkout@v4  # 使用官方的checkout动作，拉取代码到虚拟环境

      # 步骤2：设置Python环境（匹配项目的Python版本）
      - name: Set up Python 3.11
        uses: actions/setup-python@v5  # 官方的Python环境配置动作
        with:
          python-version: "3.11"  # 指定Python版本（需与项目依赖一致）

      # 步骤3：安装项目依赖（使用requirements.txt）
      - name: Install dependencies
        run: |  # 运行Shell命令
          python -m pip install --upgrade pip  # 升级pip到最新版
          pip install -r requirements.txt  # 安装requirements.txt中的依赖

      # 步骤4：运行Pytest测试（生成JUnit格式的测试报告）
      - name: Run tests with Pytest
        run: pytest --junitxml=test-results.xml  # 运行测试并生成JUnit报告（方便后续查看）

      # 步骤5：构建Docker镜像（可选，若项目用Docker部署）
      - name: Build Docker image
        run: docker build -t my-fastapi-app:${{ github.sha }} .  # 构建镜像，标签用Git提交的SHA值（唯一标识）
```

**配置说明**：

- `on`字段：触发CI的场景——当代码推送到`main`分支，或有PR合并到`main`时，自动运行；
- `runs-on: ubuntu-latest`：使用GitHub提供的Ubuntu虚拟环境，无需自己搭建服务器；
- `--junitxml=test-results.xml`：生成JUnit格式的测试报告，方便GitHub Actions展示测试结果；
- `${{ github.sha }}`：GitHub的内置变量，代表当前提交的SHA哈希值，用于标记Docker镜像版本（避免重复）。

#### 1.4 流水线的关键步骤解析

1. **拉取代码（Checkout）**：  
   使用`actions/checkout@v4`动作，将GitHub仓库的代码复制到CI的虚拟环境中，是所有CI工作流的基础。

2. **设置Python环境**：  
   FastAPI依赖特定版本的Python（如3.9+），`actions/setup-python@v5`会自动安装指定版本的Python，并配置`pip`
   等工具。若不设置，虚拟环境的Python版本可能与项目不兼容（如默认Python 3.8，而项目用Python 3.11），导致依赖安装失败。

3. **安装依赖**：  
   通过`pip install -r requirements.txt`安装项目所有依赖（包括FastAPI、Pydantic、Uvicorn等）。`requirements.txt`
   需包含项目的所有第三方库及其版本（可通过`pip freeze > requirements.txt`生成）。

4. **运行测试**：  
   使用`pytest`运行测试用例（测试文件需以`test_`开头，如`test_main.py`）。`--junitxml`参数生成的报告可在GitHub
   Actions的“Tests”标签中查看，方便快速定位失败的测试用例。

### Allure测试报告可视化分析

#### 2.1 Allure是什么？

Allure是一款**开源的测试报告框架**，能生成**美观、互动的可视化报告**（支持图表、筛选、历史对比）。与传统的JUnit报告相比，Allure的优势：

- 结构化展示：按“功能模块→用户故事→测试用例”分层，清晰呈现测试覆盖范围；
- 丰富的元数据：支持标记测试用例的“优先级”“标签”“附件”（如接口请求日志）；
- 跨平台兼容：支持Python、Java、JavaScript等多语言，完美适配FastAPI的Pytest测试。

#### 2.2 FastAPI与Allure的结合方式

FastAPI的测试通常使用`pytest`和`fastapi.TestClient`（模拟HTTP请求），而Allure通过**pytest插件**（`allure-pytest`
）集成到测试流程中。具体步骤：

1. 安装Allure CLI和`allure-pytest`插件；
2. 用Allure装饰器标记测试用例（如`@allure.feature`“功能模块”、`@allure.story`“用户故事”）；
3. 运行测试生成Allure结果文件；
4. 启动Allure服务查看可视化报告。

#### 2.3 配置Allure环境

##### 2.3.1 本地开发环境配置

1. **安装Java**：Allure基于Java开发，需安装JRE 8+（如OpenJDK 11）：
    - Ubuntu：`sudo apt install openjdk-11-jre`；
    - Mac：`brew install openjdk@11`；
    - Windows：下载OpenJDK安装包（https://adoptium.net/）。

2. **安装Allure CLI**：
   从Allure官网下载最新版本的CLI（https://github.com/allure-framework/allure2/releases），解压后将`bin`目录添加到系统PATH（如`export
   PATH=$PATH:/path/to/allure-2.24.0/bin`）。

3. **安装pytest插件**：
   ```bash
   pip install allure-pytest==2.13.2  # 最新版本（2024年3月）
   ```

##### 2.3.2 CI环境配置（GitHub Actions）

在CI中安装Allure需添加以下步骤（修改`.github/workflows/ci.yml`）：

```yaml
# 在“安装依赖”步骤后添加：
- name: Set up Java 11
  uses: actions/setup-java@v4
  with:
    java-version: "11"
    distribution: "temurin"  # 使用Eclipse Temurin JDK（稳定且常用）

- name: Install Allure CLI
  run: |
    wget https://repo1.maven.org/maven2/io/qameta/allure/allure-commandline/2.24.0/allure-commandline-2.24.0.zip
    unzip allure-commandline-2.24.0.zip
    sudo mv allure-2.24.0 /opt/allure
    sudo ln -s /opt/allure/bin/allure /usr/bin/allure  # 添加到系统PATH

- name: Run tests with Allure
  run: pytest --alluredir=allure-results  # 生成Allure结果文件（存储在allure-results目录）

- name: Upload Allure results
  uses: actions/upload-artifact@v4  # 将结果文件上传为GitHub artifact
  with:
    name: allure-results
    path: allure-results
    retention-days: 7  # 结果文件保留7天
```

#### 2.4 编写带Allure标记的测试用例

以下是**FastAPI的Allure测试用例示例**（`test_main.py`），覆盖`GET /`和`POST /items/`端点：

```python
from fastapi.testclient import TestClient
from main import app  # 导入FastAPI应用实例
import allure

# 初始化TestClient（模拟HTTP客户端，用于测试FastAPI端点）
client = TestClient(app)


# 定义Item模型（与main.py中的模型一致，确保测试数据符合约束）
class Item:
    name: str
    price: float
    description: str | None = None


@allure.feature("Root Endpoint")  # 功能模块：根路径端点
@allure.story("Get Root Message")  # 用户故事：获取根路径的欢迎信息
@allure.title("Test root endpoint returns 200 OK")  # 测试用例标题
@allure.severity(allure.severity_level.CRITICAL)  # 优先级： critical（核心功能）
def test_read_root():
    # 发送GET请求到根路径
    response = client.get("/")
    # 断言状态码为200
    assert response.status_code == 200
    # 断言响应内容符合预期
    assert response.json() == {"message": "Hello FastAPI"}


@allure.feature("Item Management")  # 功能模块：商品管理
@allure.story("Create New Item")  # 用户故事：创建新商品
@allure.title("Test create item with valid data")  # 测试用例标题
@allure.severity(allure.severity_level.NORMAL)  # 优先级：normal（普通功能）
def test_create_item_valid_data():
    # 构造符合Pydantic约束的请求数据（price>0）
    item_data = {
        "name": "iPhone 15",
        "price": 9999.99,
        "description": "A new smartphone"
    }
    # 发送POST请求到/items/端点（JSON格式）
    response = client.post("/items/", json=item_data)
    # 断言状态码为200
    assert response.status_code == 200
    # 断言响应内容包含提交的数据（假设id自增）
    assert response.json() == {"id": 1, **item_data}


@allure.feature("Item Management")
@allure.story("Create New Item")
@allure.title("Test create item with invalid price")  # 测试用例标题：无效价格（price≤0）
@allure.severity(allure.severity_level.MINOR)  # 优先级：minor（次要功能）
def test_create_item_invalid_price():
    # 构造无效数据（price=0，违反Pydantic的gt=0约束）
    item_data = {
        "name": "Fake Phone",
        "price": 0,
        "description": "Invalid price"
    }
    # 发送POST请求
    response = client.post("/items/", json=item_data)
    # 断言状态码为422（验证错误）
    assert response.status_code == 422
```

#### 2.5 生成与查看Allure报告

1. **本地环境生成报告**：  
   运行测试用例并生成Allure结果文件：
   ```bash
   pytest --alluredir=allure-results
   ```
   启动Allure服务查看报告：
   ```bash
   allure serve allure-results
   ```
   浏览器会自动打开报告页面（如`http://localhost:5050`），展示测试结果的统计信息（通过率、失败率）和详细的用例列表。

2. **CI环境查看报告**：  
   在GitHub Actions的“Artifacts”标签中下载`allure-results`压缩包，解压后在本地运行`allure serve allure-results`即可查看报告。

### 课后Quiz

#### 问题1：

在FastAPI的CI流水线中，为什么需要**设置Python环境**？请结合示例说明其作用。

#### 答案解析：

CI的虚拟环境是“干净”的（默认没有安装任何Python库），设置Python环境的作用是**确保虚拟环境的Python版本与项目一致**。例如：

- 若项目用Python 3.11开发，而CI虚拟环境默认是Python 3.8，安装FastAPI时会报错（FastAPI 0.110.0要求Python ≥3.9）；
- 通过`actions/setup-python@v5`指定`python-version: "3.11"`，可避免版本不兼容问题，确保依赖安装和测试正常运行。

#### 问题2：

Allure的`@allure.feature`和`@allure.story`有什么区别？请用FastAPI的“商品管理”模块举例说明。

#### 答案解析：

- `@allure.feature`：标记**大的功能模块**（如“商品管理”“用户管理”）；
- `@allure.story`：标记功能模块下的**具体用户故事**（如“创建商品”“删除商品”“查询商品列表”）。

举例：

```python
@allure.feature("商品管理")  # 功能模块
@allure.story("创建商品")  # 用户故事
def test_create_item():
# 测试用例代码
```

### 常见报错解决方案

#### 报错1：CI中运行pytest提示“ImportError: cannot import name 'app' from 'main'”

**原因**：

- 测试文件（如`test_main.py`）与`main.py`不在同一目录，导致Python无法找到`main`模块；
- `main.py`中未定义`app`变量（`app = FastAPI()`）。

**解决**：

1. 确保测试文件与`main.py`在同一目录；
2. 若测试文件在`tests`目录下，需在`conftest.py`中添加以下代码（将项目根目录加入Python路径）：
   ```python
   import sys
   sys.path.append(".")  # 项目根目录（包含main.py的目录）
   ```

**预防**：
保持清晰的项目结构（如`tests`目录存放测试文件，`main.py`在根目录），并在`pyproject.toml`中配置Pytest的根目录：

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["."]
```

#### 报错2：Allure报告提示“Empty test suite”（无测试结果）

**原因**：

- 测试文件未以`test_`开头（如`main_test.py`，Pytest默认不会识别）；
- 测试函数未以`test_`开头（如`create_item_test()`，Pytest不会执行）；
- `--alluredir`参数指定的目录错误（如`allure-results`拼写错误）。

**解决**：

1. 修改测试文件/函数名称，确保以`test_`开头；
2. 检查`pytest`命令的`--alluredir`参数，确保目录名称正确（如`allure-results`）。

**预防**：
遵循Pytest的命名规范（测试文件`test_*.py`、测试函数`test_*`），并在`pyproject.toml`中配置Pytest的测试文件匹配规则：

```toml
[tool.pytest.ini_options]
python_files = "test_*.py"
python_functions = "test_*"
```

#### 报错3：FastAPI测试提示“422 Unprocessable Entity”

**原因**：
请求数据违反Pydantic模型的约束（如`price`字段小于等于0，或`name`字段为空）。

**解决**：

1. 检查测试用例的请求数据，确保符合Pydantic模型的所有约束；
2. 使用`response.json()`查看详细的错误信息（如`"msg": "Input should be greater than 0"`）。

**示例**：
若`Item`模型的`price`字段定义为`price: float = Field(..., gt=0)`，则测试用例中的`price`必须大于0：

```python
# 错误数据（price=0）
item_data = {"name": "Fake Phone", "price": 0}
# 正确数据（price=999.99）
item_data = {"name": "iPhone 15", "price": 999.99}
```

**预防**：
在编写测试用例前，仔细阅读Pydantic模型的约束条件（如`gt`、`min_length`、`regex`），确保测试数据符合要求。

###

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[FastAPI的CI流水线怎么自动测端点，还能让Allure报告美到犯规？](https://blog.cmdragon.cn/posts/eed6cd8985d9be0a4b092a7da38b3e0c/)




<details>
<summary>往期文章归档</summary>

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
- [BackgroundTasks与Celery：谁才是异步任务的终极赢家？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/792cac4ce6eb96b5001da15b0d52ef83/)

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