---
url: /posts/ba1f545a3410144552fbdbfcf31b5265/
title: PostgreSQL 17安装总翻车？Windows/macOS/Linux避坑指南帮你搞定？
date: 2025-09-21T06:42:48+08:00
lastmod: 2025-09-21T06:42:48+08:00
author: cmdragon
cover: https://api2.cmdragon.cn/upload/cmder/images/4e6b913334804b5c9214d179eac5b015~tplv-5jbd59dj06-image.png

summary:
  PostgreSQL 17安装前需确认系统满足硬件、软件和权限要求，建议选择稳定版。Windows系统通过官方安装包安装，macOS推荐使用Homebrew，Linux系统通过包管理器安装。安装后需配置环境变量和服务管理，确保`psql`等命令全局可用。验证安装时，可通过创建测试数据库和表来确认数据库正常运行。常见报错包括角色不存在、连接被拒绝和密码认证失败，需根据具体原因进行修复。

categories:
  - postgresql

tags:
  - 基础入门
    - PostgreSQL安装
  - 系统要求
  - 版本选择
  - 操作系统安装步骤
  - 环境配置
  - 服务管理
  - 常见报错解决

---

<img src="https://api2.cmdragon.cn/upload/cmder/images/4e6b913334804b5c9214d179eac5b015~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 一、安装前准备

在开始安装PostgreSQL之前，我们需要确认系统满足基本要求，并选择合适的版本，避免后续踩坑。

### 1.1 系统要求

根据PostgreSQL 17官方文档（https://www.postgresql.org/docs/17/install-requirements.html），系统需满足以下条件：

- **硬件**：至少256MB内存（推荐1GB以上）、100MB空闲磁盘空间（数据存储需更多）；
- **软件**：依赖部分系统库（如`libreadline`（命令行历史）、`zlib`（数据压缩）、`openssl`（加密）），多数操作系统会预装这些库；
- **权限**：安装过程需要管理员/root权限（用于创建服务、写入系统目录）。

### 1.2 版本选择

PostgreSQL官网提供**稳定版**（当前为17）和**开发版**（18beta），初学者建议选择**稳定版
**（https://www.postgresql.org/download/），避免开发版的不稳定性。

## 二、不同操作系统的安装步骤

PostgreSQL支持Windows、macOS、Linux三大主流系统，以下是各系统的详细安装流程（均基于官网17版文档）。

### 2.1 Windows系统安装

Windows系统推荐使用**官方安装包**（无需编译，步骤简单）：

1. **下载安装包**：访问PostgreSQL
   Windows下载页（https://www.postgresql.org/download/windows/），选择64位安装包（如`postgresql-17.0-1-windows-x64.exe`）；
2. **运行安装程序**：
    - 双击安装包，点击「Next」，接受许可协议；
    - 选择**安装组件**：建议勾选「PostgreSQL Server」（核心服务）、「pgAdmin 4」（图形化管理工具）、「Command Line Tools」（`psql`
      等命令行工具）；
    - 设置**安装目录**（默认`C:\Program Files\PostgreSQL\17`）和**数据目录**（默认`C:\Program Files\PostgreSQL\17\data`
      ，建议非系统盘，如`D:\PostgreSQL\data`）；
    - 设置**超级用户密码**（`postgres`用户，后续连接数据库的关键密码，务必记住）；
    - 选择**端口**（默认5432，若被MySQL等服务占用，可改为5433）；
3. **完成安装**：点击「Finish」，可选「Launch Stack Builder」安装额外工具（如ODBC驱动）。

### 2.2 macOS系统安装

macOS推荐使用**Homebrew**（包管理器，无需手动配置路径）或官方安装包：

#### 方式1：Homebrew安装（推荐）

1. **安装Homebrew**（若未安装）：打开终端执行
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
2. **安装PostgreSQL 17**：
   ```bash
   brew install postgresql@17
   ```
3. **初始化数据库**（Homebrew不会自动初始化）：
   ```bash
   initdb /usr/local/var/postgresql@17 --locale=en_US.UTF-8  # 设置UTF-8编码
   ```
4. **启动服务**（开机自启）：
   ```bash
   brew services start postgresql@17
   ```

#### 方式2：官方安装包

1. 下载安装包（https://www.postgresql.org/download/macosx/）；
2. 双击安装包，按提示完成安装（步骤类似Windows）；
3. 初始化数据库：打开「终端」，执行
   ```bash
   /Library/PostgreSQL/17/bin/initdb /Library/PostgreSQL/17/data --locale=en_US.UTF-8
   ```
4. 启动服务：
   ```bash
   sudo /Library/PostgreSQL/17/bin/pg_ctl -D /Library/PostgreSQL/17/data start
   ```

### 2.3 Linux系统安装

Linux系统推荐使用**包管理器**（apt/yum），无需手动编译，以下以Ubuntu 22.04和CentOS 9为例：

#### 2.3.1 Ubuntu/Debian系统（apt）

1. **添加PostgreSQL apt源**：
   ```bash
   sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
   ```
2. **导入官方密钥**：
   ```bash
   wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
   ```
3. **更新包列表**：
   ```bash
   sudo apt update
   ```
4. **安装PostgreSQL 17**：
   ```bash
   sudo apt install postgresql-17
   ```
5. **验证服务**：安装完成后服务自动启动，执行
   ```bash
   sudo systemctl status postgresql-17  # 查看状态（active为正常）
   ```

#### 2.3.2 CentOS/RHEL系统（yum）

1. **安装PostgreSQL YUM库**：
   ```bash
   sudo dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm
   ```
2. **安装PostgreSQL 17**：
   ```bash
   sudo dnf install postgresql17-server
   ```
3. **初始化数据库**：
   ```bash
   sudo /usr/pgsql-17/bin/postgresql-17-setup initdb
   ```
4. **启动服务并设置开机自启**：
   ```bash
   sudo systemctl start postgresql-17  # 启动服务
   sudo systemctl enable postgresql-17  # 开机自启
   ```

## 三、环境配置（关键！否则命令行无法使用）

安装完成后，需配置**环境变量**（让`psql`等命令全局可用）和**服务管理**（控制数据库启动/停止）。

### 3.1 设置环境变量（PATH）

`psql`等命令位于PostgreSQL的`bin`目录下，需将该目录添加到系统`PATH`中：

#### Windows系统

1. 右键「此电脑」→「属性」→「高级系统设置」→「环境变量」；
2. 在「系统变量」中找到「Path」，点击「编辑」→「新建」，添加`C:\Program Files\PostgreSQL\17\bin`（替换为你的安装路径）；
3. 关闭所有终端，重新打开，执行`psql --version`（显示版本号则成功）。

#### macOS系统（Homebrew安装）

1. 打开终端，编辑`~/.zshrc`（若用bash则编辑`~/.bash_profile`）：
   ```bash
   vi ~/.zshrc
   ```
2. 添加一行（PostgreSQL 17的`bin`目录路径）：
   ```bash
   export PATH="/usr/local/opt/postgresql@17/bin:$PATH"
   ```
3. 使配置生效：
   ```bash
   source ~/.zshrc
   ```
4. 验证：`psql --version`。

#### Linux系统（Ubuntu/CentOS）

1. 编辑`/etc/profile`（系统级，所有用户可用）或`~/.bashrc`（用户级）：
   ```bash
   sudo vi /etc/profile
   ```
2. 添加一行（PostgreSQL 17的`bin`目录路径）：
   ```bash
   export PATH="/usr/lib/postgresql/17/bin:$PATH"  # Ubuntu路径
   # export PATH="/usr/pgsql-17/bin:$PATH"  # CentOS路径
   ```
3. 使配置生效：
   ```bash
   source /etc/profile
   ```
4. 验证：`psql --version`。

### 3.2 服务管理（启动/停止/开机自启）

PostgreSQL以**系统服务**形式运行，以下是各系统的服务管理命令：

| 系统              | 启动服务                                 | 停止服务                                | 查看状态                                  | 开机自启                                      |
|-----------------|--------------------------------------|-------------------------------------|---------------------------------------|-------------------------------------------|
| Windows         | `net start postgresql-x64-17`        | `net stop postgresql-x64-17`        | `sc query postgresql-x64-17`          | 安装时默认开启                                   |
| macOS（Homebrew） | `brew services start postgresql@17`  | `brew services stop postgresql@17`  | `brew services list`                  | `brew services start postgresql@17`（自动开机） |
| Linux（systemd）  | `sudo systemctl start postgresql-17` | `sudo systemctl stop postgresql-17` | `sudo systemctl status postgresql-17` | `sudo systemctl enable postgresql-17`     |

## 四、验证安装（确保数据库可用）

安装完成后，需验证数据库是否正常运行，步骤如下：

1. **连接数据库**：打开终端，执行
   ```bash
   psql -U postgres  # -U指定用户（postgres是超级用户）
   ```
   输入安装时设置的`postgres`密码，成功后会看到`postgres=#`提示符（表示已连接到默认数据库`postgres`）。

2. **创建测试数据库**：
   ```sql
   CREATE DATABASE testdb;  -- 创建名为testdb的数据库（分号是SQL语句结束符）
   ```

3. **切换数据库**：
   ```sql
   \c testdb  -- 切换到testdb，提示符变为testdb=#
   ```

4. **创建测试表并插入数据**：
   ```sql
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,  -- 自增主键
     name VARCHAR(50) NOT NULL  -- 姓名（非空）
   );
   INSERT INTO users (name) VALUES ('Alice');  -- 插入一条数据
   ```

5. **查询数据**：
   ```sql
   SELECT * FROM users;  -- 查询users表所有数据
   ```
   输出结果：
   ```
   id | name
   ----+-------
     1 | Alice
   (1 row)
   ```

6. **退出psql**：
   ```sql
   \q  -- 退出命令行工具
   ```

## 五、课后Quiz（巩固知识点）

### Quiz 1：如何在CentOS 9中安装PostgreSQL 17并设置开机自启？

**答案解析**：

1. 安装YUM库：`sudo dnf install
   -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm`；
2. 安装服务：`sudo dnf install postgresql17-server`；
3. 初始化数据库：`sudo /usr/pgsql-17/bin/postgresql-17-setup initdb`；
4. 启动服务：`sudo systemctl start postgresql-17`；
5. 开机自启：`sudo systemctl enable postgresql-17`。

### Quiz 2：Windows下执行`psql`提示「不是内部或外部命令」，怎么办？

**答案解析**：
原因是`psql`所在的`bin`目录未添加到`PATH`环境变量。解决步骤：

1. 检查`PostgreSQL\17\bin`目录路径（如`C:\Program Files\PostgreSQL\17\bin`）；
2. 按照「3.1 Windows系统」的步骤添加环境变量；
3. 重启终端，执行`psql --version`验证。

## 六、常见报错及解决办法

以下是安装/配置过程中**高频报错**
的原因分析和解决办法（官网错误文档：https://www.postgresql.org/docs/17/errcodes-appendix.html）。

### 报错1：`psql: FATAL:  role "postgres" does not exist`

**原因**：PostgreSQL未初始化数据库，导致默认的`postgres`角色（超级用户）不存在。  
**解决**：

- Windows：重新运行安装程序，选择「Repair」修复并重新初始化；
- macOS（Homebrew）：执行`initdb /usr/local/var/postgresql@17 --locale=en_US.UTF-8`；
- Linux（Ubuntu）：执行`sudo pg_createcluster 17 main --start`（创建数据库集群）。

### 报错2：`could not connect to server: Connection refused`

**原因**：数据库服务未启动、端口被占用或防火墙阻止连接。  
**解决**：

1. 检查服务状态（如`systemctl status postgresql-17`），未启动则启动；
2. 检查端口占用：`netstat -tuln | grep 5432`（Windows用`netstat -ano | findstr :5432`），若被占用则修改`postgresql.conf`
   中的`port`参数（如改为5433），重启服务；
3. 开放防火墙端口：Linux执行`sudo ufw allow 5432`（Ubuntu），Windows在防火墙中添加5432端口的入站规则。

### 报错3：`password authentication failed for user "postgres"`

**原因**：密码错误，或`pg_hba.conf`文件的认证方式设置不当。  
**解决**：

1. **重置密码**：
    - 修改`pg_hba.conf`文件（路径：Windows`C:\Program Files\PostgreSQL\17\data\pg_hba.conf`
      ；Linux`/var/lib/postgresql/17/main/pg_hba.conf`）；
    - 将`local all postgres peer`改为`local all postgres trust`（临时允许无密码登录）；
    - 重启服务，执行`psql -U postgres`（无密码登录），重置密码：`ALTER USER postgres WITH PASSWORD 'new_password';`；
    - 恢复`pg_hba.conf`中的认证方式（改回`peer`或`scram-sha-256`），重启服务。

## 参考链接

- PostgreSQL 17安装指南：https://www.postgresql.org/docs/17/installation.html
- 服务管理文档：https://www.postgresql.org/docs/17/server-start.html
- 环境变量文档：https://www.postgresql.org/docs/17/reference-client.html#REFCLIENT-PATH

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[PostgreSQL 17安装总翻车？Windows/macOS/Linux避坑指南帮你搞定？](https://blog.cmdragon.cn/posts/ba1f545a3410144552fbdbfcf31b5265/)





<details>
<summary>往期文章归档</summary>

- [给接口加新字段又不搞崩老客户端？FastAPI的多版本API靠哪三招实现？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/cc098d8836e787baa8a4d92e4d56d5c5/)
- [流量突增要搞崩FastAPI？熔断测试是怎么防系统雪崩的？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/46d05151c5bd31cf37a7bcf0b8f5b0b8/)
- [FastAPI秒杀库存总变负数？Redis分布式锁能帮你守住底线吗 - cmdragon's Blog](https://blog.cmdragon.cn/posts/65ce343cc5df9faf3a8e2eeaab42ae45/)
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