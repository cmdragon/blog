---
url: /posts/6bfdae84f313cf7ad0bb7045c4392347/
title: PostgreSQL备份不是复制文件？物理vs逻辑咋选？误删还能精准恢复到1分钟前？
date: 2025-10-05T04:41:45+08:00
lastmod: 2025-10-05T04:41:45+08:00
author: cmdragon
cover: /images/e5f85f7295db4e70ac6d8b4e85a6e41d~tplv-5jbd59dj06-image.png

summary:
  PostgreSQL的备份与恢复是数据安全的关键，分为物理备份和逻辑备份。物理备份通过`pg_basebackup`直接复制数据文件，适合全量备份和快速恢复；逻辑备份使用`pg_dump`和`pg_dumpall`导出数据的逻辑结构，适合跨版本迁移和部分数据恢复。恢复时，逻辑备份通过`psql`或`pg_restore`还原，物理备份则通过替换数据目录和应用WAL日志完成。时间点恢复（PITR）允许精准还原到任意时刻，需开启WAL日志归档。常见报错包括用户权限、连接配置和文件格式问题，需根据具体情况进行调整。

categories:
  - postgresql

tags:
  - 基础入门
    - 数据备份
  - 数据恢复
  - PostgreSQL
  - 物理备份
  - 逻辑备份
  - 时间点恢复
  - 数据库安全

---

<img src="/images/e5f85f7295db4e70ac6d8b4e85a6e41d~tplv-5jbd59dj06-image.png" title="cover.png" alt="cmdragon_cn.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)
关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`

[发现1000+提升效率与开发的AI工具和实用程序](https://tools.cmdragon.cn/zh/apps?category=ai_chat)：https://tools.cmdragon.cn/

## 1. 备份与恢复的核心目标

备份不是“复制文件”这么简单——它是**数据安全的最后一道防线**。当遇到以下场景时，备份能帮你“起死回生”：

- 误删数据（比如`DROP TABLE`）；
- 硬件故障（硬盘损坏）；
- 软件bug（数据库崩溃）；
- 自然灾害（机房火灾）。

备份的终极目标是**可恢复性**：确保你能从备份中还原出“完整、一致”的数据，且还原过程可重复、可验证。

## 2. 备份的两种核心类型：物理 vs 逻辑

PostgreSQL的备份分为**物理备份**和**逻辑备份**，二者的本质区别在于“备份的是‘数据文件’还是‘数据的逻辑结构’”。我们用“搬家”类比：

- 物理备份=“搬整个房子”：直接复制数据库的数据文件（如`base`目录、`pg_wal`日志），速度快，但只能还原到相同版本的PostgreSQL。
- 逻辑备份=“搬房子里的东西”：导出数据的逻辑结构（如`CREATE TABLE`语句、`INSERT`数据），灵活但速度慢，支持跨版本迁移。

### 2.1 物理备份：直接复制数据文件

物理备份的核心工具是`pg_basebackup`，它通过**流复制协议**从数据库服务器复制数据文件和WAL（Write-Ahead Log，预写日志）。

#### 适用场景：

- 全量备份整个数据库集群；
- 需要快速恢复（比如TB级数据）；
- 时间点恢复（PITR，Point-in-Time Recovery）。

#### 示例：用`pg_basebackup`做基础备份

```bash
# -D：指定备份目录（必须为空）
# -U replication：使用有“replication”权限的用户（需提前创建）
# -h：数据库服务器地址（本地用localhost）
# -p：端口号（默认5432）
# -X stream：同步复制WAL日志（确保备份一致性）
# -P：显示进度条
pg_basebackup -D /var/lib/postgresql/17/backups/base_20240520 \
              -U replication \
              -h localhost \
              -p 5432 \
              -X stream \
              -P
```  

**参数解释**：

- `-X stream`：关键参数！确保备份过程中产生的WAL日志被同步复制，避免备份“脏数据”。
- `-U replication`：需要在`pg_hba.conf`中允许该用户的复制连接（参考下文“常见报错”）。

### 2.2 逻辑备份：导出数据的“逻辑结构”

逻辑备份的核心工具是`pg_dump`（单数据库）和`pg_dumpall`（全集群），它们导出的是**可执行的SQL语句**或**自定义格式文件**。

#### 适用场景：

- 备份单个数据库或部分表；
- 跨版本迁移（比如从PostgreSQL 15迁移到17）；
- 导出数据到其他数据库（如MySQL，需转换格式）。

#### 2.2.1 `pg_dump`：单数据库逻辑备份

`pg_dump`是最常用的逻辑备份工具，支持多种输出格式：

- **Plain Text（默认）**：导出SQL文件，可直接用`psql`恢复；
- **Custom（-F c）**：自定义格式，支持压缩、并行恢复；
- **Tar（-F t）**：Tar归档格式，适合跨平台。

##### 示例1：备份单个数据库到SQL文件

```bash
# -U postgres：使用超级用户（需有数据库备份权限）
# -d mydb：备份“mydb”数据库
# -f mydb.sql：输出到“mydb.sql”文件
pg_dump -U postgres -d mydb -f mydb.sql
```  

##### 示例2：备份到自定义格式（支持压缩）

```bash
# -F c：自定义格式（推荐，支持压缩和并行）
# -Z 5：压缩级别（0=无压缩，9=最高压缩，5是平衡）
# -v：显示详细日志（verbose）
pg_dump -U postgres -d mydb -F c -Z 5 -v -f mydb.dump
```  

#### 2.2.2 `pg_dumpall`：全集群逻辑备份

`pg_dump`只能备份单个数据库，而`pg_dumpall`可以备份**全局对象**（如角色、表空间）和**所有数据库**。

##### 示例：备份全集群

```bash
# -f full_cluster.sql：输出到“full_cluster.sql”文件
pg_dumpall -U postgres -f full_cluster.sql
```  

## 3. 恢复的实践：从备份到数据还原

恢复的核心原则是“**先恢复全局对象，再恢复数据库**”——因为数据库的表、视图可能依赖角色（用户）或表空间。

### 3.1 逻辑恢复：用`psql`或`pg_restore`

#### 场景1：恢复SQL格式备份（`pg_dump`导出）

```bash
# 1. 先连接到“postgres”系统数据库（所有数据库的父数据库）
# 2. -f mydb.sql：恢复“mydb.sql”文件
psql -U postgres -d postgres -f mydb.sql
```  

#### 场景2：恢复自定义格式备份（`pg_dump -F c`导出）

```bash
# -d mydb：恢复到“mydb”数据库（需提前创建：CREATE DATABASE mydb;）
# -F c：输入格式是自定义格式
# -j 4：并行恢复（用4个线程，加快速度）
pg_restore -U postgres -d mydb -F c -j 4 -v mydb.dump
```  

### 3.2 物理恢复：用`pg_basebackup`备份还原

物理恢复的本质是“**替换数据目录+应用WAL日志**”，步骤如下：

#### 步骤1：停止PostgreSQL服务

```bash
# 以Ubuntu为例，PostgreSQL 17的服务名是“postgresql@17-main”
sudo systemctl stop postgresql@17-main
```  

#### 步骤2：清空数据目录（注意备份原有数据！）

```bash
# 数据目录默认是/var/lib/postgresql/17/main（根据安装路径调整）
sudo rm -rf /var/lib/postgresql/17/main/*
```  

#### 步骤3：复制基础备份到数据目录

```bash
# 将备份目录的内容复制到数据目录
sudo cp -R /var/lib/postgresql/17/backups/base_20240520/* /var/lib/postgresql/17/main/
```  

#### 步骤4：配置恢复信号文件（PostgreSQL 12+）

PostgreSQL 12以后，恢复不再需要`recovery.conf`，而是通过`recovery.signal`文件触发：

```bash
# 在数据目录创建recovery.signal（告诉PostgreSQL启动恢复模式）
sudo touch /var/lib/postgresql/17/main/recovery.signal
```  

#### 步骤5：启动PostgreSQL服务

```bash
sudo systemctl start postgresql@17-main
```  

#### 验证恢复：

```bash
# 连接到数据库，检查数据是否存在
psql -U postgres -d mydb -c "SELECT count(*) FROM my_table;"
```  

### 3.3 时间点恢复（PITR）：精准还原到任意时刻

如果数据被误删，你可能不需要恢复到“最后一次备份”，而是“误删前的1分钟”——这就是**时间点恢复（PITR）**。

#### 前提条件：

1. 已做过**物理基础备份**（`pg_basebackup`）；
2. 已开启**WAL日志归档**（在`postgresql.conf`
   中设置`wal_level = replica`，`archive_mode = on`，`archive_command = 'cp %p /path/to/archive/%f'`）。

#### 步骤：

1. 按照“物理恢复”步骤1-4操作（复制基础备份、创建`recovery.signal`）；
2. 在数据目录创建`recovery.conf`（或在`postgresql.conf`中设置恢复目标）：
   ```ini
   # 恢复到2024-05-20 14:30:00（误删前的时间）
   recovery_target_time = '2024-05-20 14:30:00'
   # 恢复后自动提升为正常服务器（不再接受WAL日志）
   recovery_target_action = 'promote'
   ```  
3. 启动PostgreSQL服务，等待恢复完成；
4. 验证数据：检查误删的表是否恢复。

## 4. 课后Quiz：巩固你的理解

### 问题1：如何备份PostgreSQL集群的所有角色（用户）和表空间？

**答案**：用`pg_dumpall`——它能备份全局对象（角色、表空间）和所有数据库。命令如下：

```bash
pg_dumpall -U postgres -f globals.sql
```  

**参考链接**：https://www.postgresql.org/docs/17/backup-dump.html#BACKUP-DUMP-ALL

### 问题2：物理备份和逻辑备份的主要区别是什么？分别适用于哪些场景？

**答案**：

- **物理备份**：复制数据文件，速度快，适合全量备份和快速恢复（如TB级数据）；
- **逻辑备份**：导出逻辑结构（SQL/自定义格式），灵活，适合跨版本迁移、部分数据恢复（如导出单个表）。  
  **参考链接**：https://www.postgresql.org/docs/17/backup.html#BACKUP-TYPES

### 问题3：用`pg_restore`恢复自定义格式备份时，为什么需要提前创建数据库？

**答案**：`pg_restore`只能恢复数据库的内容（表、数据），不能创建数据库本身。因此需要提前用`CREATE DATABASE mydb;`创建目标数据库。

## 5. 常见报错与解决办法

### 报错1：`pg_dump: error: connection to database "mydb" failed: FATAL:  role "postgres" does not exist`

**原因**：指定的用户（`postgres`）不存在于数据库集群中。  
**解决**：

1. 检查现有用户：`psql -U your_user -d postgres -c "SELECT rolname FROM pg_roles;"`；
2. 使用存在的超级用户（如`admin`）：`pg_dump -U admin -d mydb -f mydb.sql`；
3. 若需要`postgres`用户，创建它：`CREATE ROLE postgres SUPERUSER LOGIN;`。

### 报错2：`pg_basebackup: error: could not connect to server: FATAL:  no pg_hba.conf entry for replication connection from host "127.0.0.1"`

**原因**：`pg_hba.conf`未允许`replication`用户从该主机连接。  
**解决**：

1. 编辑`pg_hba.conf`（默认路径：`/var/lib/postgresql/17/main/pg_hba.conf`）；
2. 添加一行：`host replication replication 127.0.0.1/32 trust`（允许`replication`用户从本地连接）；
3. 重新加载配置：`pg_ctl reload -D /var/lib/postgresql/17/main/`。

### 报错3：`pg_restore: error: input file does not appear to be a valid archive`

**原因**：输入文件格式错误（如用`pg_restore`恢复SQL文件）或文件损坏。  
**解决**：

1. 检查备份格式：若备份时用`-F p`（SQL文件），需用`psql`恢复；若用`-F c`（自定义格式），需用`pg_restore`；
2. 验证文件完整性：`pg_restore -l mydb.dump`（列出文件内容，若报错则文件损坏）。

## 参考链接

1. PostgreSQL备份与恢复总览：https://www.postgresql.org/docs/17/backup.html
2. `pg_dump`文档：https://www.postgresql.org/docs/17/app-pgdump.html
3. `pg_dumpall`文档：https://www.postgresql.org/docs/17/backup-dump.html#BACKUP-DUMP-ALL
4. `pg_basebackup`文档：https://www.postgresql.org/docs/17/app-pgbasebackup.html
5. 时间点恢复文档：https://www.postgresql.org/docs/17/continuous-archiving.html#POINT-IN-TIME-RECOVERY

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`
，阅读完整的文章：[PostgreSQL备份不是复制文件？物理vs逻辑咋选？误删还能精准恢复到1分钟前？](https://blog.cmdragon.cn/posts/6bfdae84f313cf7ad0bb7045c4392347/)



<details>
<summary>往期文章归档</summary>

- [转账不翻车、并发不干扰，PostgreSQL的ACID特性到底有啥魔法？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/de3672803de34dbad244d0a8d48b0eb5/)
- [银行转账不白扣钱、电商下单不超卖，PostgreSQL事务的诀窍是啥？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/e463e8a2668abdf00a228c9b79324ded/)
- [PostgreSQL里的PL/pgSQL到底是啥？能让SQL从“说目标”变“讲步骤”？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/5c967e595058c4a1fc4474a68e64031d/)
- [PostgreSQL视图不存数据？那它怎么简化查询还能递归生成序列和控制权限？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/325047855e3e23b5ef82f7d2db134fbd/)
- [PostgreSQL索引这么玩，才能让你的查询真的“飞”起来？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/d2dba50bb6e4df7b27e735245a06a2a2/)
- [PostgreSQL的表关系和约束，咋帮你搞定用户订单不混乱、学生选课不重复？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/849ae5bab0f8c66e94c2f6ad1bb798e3/)
- [PostgreSQL查询的筛子、排序、聚合、分组？你会用它们搞定数据吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/ef4800975ffa84f1ca51976a70a1585b/)
- [PostgreSQL数据类型怎么选才高效不踩坑？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/bf54711525c507c5eacfa7b0151c39d2/)
- [想解锁PostgreSQL查询从基础到进阶的核心知识点？你都get了吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/887809b3e0375f5956873cd442f516d8/)
- [PostgreSQL DELETE居然有这些操作？返回数据、连表删你试过没？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/934be1203725e8be9d6f6e9104e5abcc/)
- [PostgreSQL UPDATE语句怎么玩？从改邮箱到批量更新的避坑技巧你都会吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/0f0622e9b7402b599e618150d0596ffe/)
- [PostgreSQL插入数据还在逐条敲？批量、冲突处理、返回自增ID的技巧你会吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/0e3bf7efc030b024ea67ee855a00f2de/)
- [PostgreSQL的“仓库-房间-货架”游戏，你能建出电商数据库和表吗？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/b6cd3c86da6aac26ed829e472d34078e/)
- [PostgreSQL 17安装总翻车？Windows/macOS/Linux避坑指南帮你搞定？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/ba1f545a3410144552fbdbfcf31b5265/)
- [能当关系型数据库还能玩对象特性，能拆复杂查询还能自动管库存，PostgreSQL凭什么这么香？ - cmdragon's Blog](https://blog.cmdragon.cn/posts/b5474d1480509c5072085abc80b3dd9f/)
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

</details>


<details>
<summary>免费好用的热门在线工具</summary>

- [智能提词器 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/smart-teleprompter)
- [魔法简历 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/magic-resume)
- [Image Puzzle Tool - 图片拼图工具 | By cmdragon](https://tools.cmdragon.cn/zh/apps/image-puzzle-tool)
- [字幕下载工具 - 应用商店 | By cmdragon](https://tools.cmdragon.cn/zh/apps/subtitle-downloader)
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