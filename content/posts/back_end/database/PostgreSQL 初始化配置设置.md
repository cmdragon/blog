---
url: /posts/a1bc69c557daefb565b048c1ea26aa4f/
title: PostgreSQL 初始化配置设置
date: 2024-12-27T00:18:53+08:00
updated: 2024-12-27T00:18:53+08:00
author: cmdragon

summary:
  PostgreSQL是一款广泛应用于企业级应用、数据仓库以及Web应用程序的强大数据库管理系统。在完成数据库的安装后，进行合理而有效的初始配置是确保数据库性能和安全性的关键步骤。PostgreSQL的初始设置，包括如何配置数据目录、管理用户权限、设定连接参数、增强安全性、调整内存参数和管理日志等

categories:
  - 前端开发

tags:
  - PostgreSQL
  - 初始设置
  - 数据库配置
  - 性能优化
  - 安全性
  - 用户管理
  - 日志管理
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_12_26 23_49_29.png" title="2024_12_26 23_49_29.png" alt="2024_12_26 23_49_29.png"/>

<img src="https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg" title="cmdragon_cn.png" alt="cmdragon_cn.png"/>


扫描[二维码](https://api2.cmdragon.cn/upload/cmder/20250304_012821924.jpg)关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`


PostgreSQL是一款功能强大的开源关系数据库管理系统，其性能优化和安全性设置对于创建高效的数据库环境至关重要。在安装完成后，合理配置初始设置能够显著提升数据库的运行效率与安全性。PostgreSQL的初始配置设置，包括数据目录的设置、用户权限管理、连接设置、安全性配置、内存参数的调整以及日志管理等方面。这些设置将为数据库的长期稳定运行打下坚实的基础。



### 1. 引言
PostgreSQL是一款广泛应用于企业级应用、数据仓库以及Web应用程序的强大数据库管理系统。在完成数据库的安装后，进行合理而有效的初始配置是确保数据库性能和安全性的关键步骤。PostgreSQL的初始设置，包括如何配置数据目录、管理用户权限、设定连接参数、增强安全性、调整内存参数和管理日志等。

### 2. 数据目录配置
数据目录是PostgreSQL存储用户所有数据的地方。设置数据目录时，合理的设计不仅能提高性能，还能增强数据的安全性。

#### 2.1 数据目录的位置
PostgreSQL默认为数据存放位置设置为`/var/lib/pgsql/data`（在Linux中）或`C:\Program Files\PostgreSQL\<version>\data`（在Windows中）。根据特定需求，可以选择自定义路径。

#### 2.2 权限管理
确保PostgreSQL服务用户对数据目录有适当的读写权限。使用以下命令更改权限：

```bash
sudo chown -R postgres:postgres /path/to/data/directory
sudo chmod 700 /path/to/data/directory
```

这种配置可以确保只有PostgreSQL服务能够访问数据，从而提升数据安全性。

#### 2.3 检查数据完整性
在数据目录配置完成后，使用`pg_checksums`功能检查数据完整性，确保没有损坏。这一检查可以定期进行，以防止潜在的数据丢失和损坏。

### 3. 用户和角色管理
PostgreSQL采用基于角色的认证机制，正确配置用户和角色是确保安全和权限管理的基本要求。

#### 3.1 创建超级用户
使用PostgreSQL时，通常会创建一个超级用户（如`postgres`），用来管理数据库。可以通过以下命令创建用户：

```sql
CREATE ROLE my_user WITH LOGIN PASSWORD 'strong_password';
ALTER ROLE my_user CREATEROLE CREATEDB;
```

确保设置强密码，避免使用字典词，增强数据库安全性。

#### 3.2 权限的授予和撤销
根据业务需求将特定权限授予用户。例如：

```sql
GRANT SELECT, INSERT ON my_table TO my_user;
REVOKE DELETE ON my_table FROM my_user;
```

通过定期审查用户的权限配置，确保用户只能访问其所需的最小权限，不设置不必要的权限。

### 4. 连接设置
在配置数据库与客户端之间的连接时，PostgreSQL提供了一系列的选项。

#### 4.1 配置连接参数
在`postgresql.conf`文件中，可以配置如下连接参数：

```plaintext
listen_addresses = '*'
port = 5432
```

`listen_addresses`可以设置为`*`以开放所有IP地址，或者只能为特定的IP，这样有助于控制对数据库服务的访问。

#### 4.2 配置连接限制
可以通过以下参数控制最多允许的连接数：

```plaintext
max_connections = 100
```

根据实际需求合理设置连接数，避免数据库过载造成性能下降。

#### 4.3 配置`pg_hba.conf`文件
`pg_hba.conf`文件用于控制用户的身份验证。此文件的重要性不言而喻，标准案例：

```plaintext
# IPv4 local connections
host    all             all             127.0.0.1/32            md5
host    all             all             192.168.1.0/24          md5
```

确保限制用户仅能从信任的IP地址连接到数据库，同时为不同的主机设置适当的身份验证方法（如`md5`、`scram-sha-256`等）。

### 5. 性能优化及内存设置
PostgreSQL的性能依赖于恰当的内存参数配置，合理的内存利用可以显著提升查询效率。

#### 5.1 设置共享缓冲区
`shared_buffers`参数设定PostgreSQL使用的共享内存量，建议为系统内存的15%-25%进行配置：

```plaintext
shared_buffers = 2GB
```

该参数直接影响缓存的命中率与I/O性能。

#### 5.2 工作内存和维护工作内存设置
`work_mem`用于控制每个操作的排序或哈希表使用的内存量，而`maintenance_work_mem`影响数据维护操作（如VACUUM、CREATE INDEX等）的内存使用量。

```plaintext
work_mem = 64MB
maintenance_work_mem = 512MB
```

#### 5.3 调整其他相关配置
可根据需求调整以下参数：

- `effective_cache_size`: 设置为系统总内存的50%-75%以协助查询优化器作出更好的决策。
- `checkpoint_segments`: 增加日志_checkpoint_segments_的数量，减少频繁的写入操作。
  
确保这些设置经过监控和分析后进行调整，以匹配系统的实际负载。

### 6. 日志管理配置
日志在评估数据库性能和解决问题时极为重要。合理配置日志可以帮助开发者和管理员及时获取重要信息。

#### 6.1 日志位置
在`postgresql.conf`中设置日志文件的位置和文件名格式：

```plaintext
log_directory = '/var/log/postgresql'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
```

#### 6.2 日志记录格式
配置如何记录日志，使用如下参数：

```plaintext
logging_collector = on
log_destination = 'stderr'
log_line_prefix = '%t [%p]: [%l-1] user=%u db=%d '
log_statement = 'all'
```

`log_statement`可以设置为`all`，在开发阶段记录所有SQL语句以供调试。但在生产环境中，建议改为`none`或`ddl`以减少日志量。

#### 6.3 日志轮换和保留
配置日志文件的轮换和保留策略：

```plaintext
log_rotation_age = 1d
log_rotation_size = 10MB
log_truncate_on_rotation = on
```

定期清理日志文件，以节省磁盘空间。

### 7. 安全性设置
PostgreSQL的安全性配置是维护数据库机密性、完整性和可用性的重要步骤。

#### 7.1 身份验证方法
选择适当的身份验证方法，如`md5`或`scram-sha-256`。确保生产设置使用强加密机制。

#### 7.2 加密连接
启用SSL/TLS连接以加密客户端与数据库之间的通讯，保护数据传输的安全。设置SSL参数：

```plaintext
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
ssl_ca_file = 'root.crt'
```

#### 7.3 安全更新
定期检查PostgreSQL版本和相关包的安全更新，确保使用最新的补丁版本以防止安全漏洞。

### 8. 常见问题与最佳实践
在数据库初始化配置中，用户可能会面临一系列问题，以下是一些解决方案和最佳实践。

#### 8.1 性能问题
创建索引、优化查询以及定期执行VACUUM和ANALYZE操作都能有效提升数据库性能。

#### 8.2 连接失败
如果出现连接问题，应检查`pg_hba.conf`和`postgresql.conf`文件的设置，确保服务正在运行且为防火墙设置了正确的端口。

#### 8.3 日志过于庞大
可通过调整日志记录策略和记录级别以控制日志文件的大小，并定期清理不再使用的日志文件。

### 9. 结论
PostgreSQL的初始配置设置为数据库的稳定、安全和高效运行奠定了基础。通过合理配置数据目录、用户权限管理、连接设置、内存参数及日志记录等，用户能够创建出符合需求的数据库环境。在实际操作中，通过持续的监测与优化，确保PostgreSQL的性能与安全性达成动态平衡，能够有效支持不断增长的业务需求。

余下文章内容请点击跳转至 个人博客页面 或者 扫码关注或者微信搜一搜：`编程智域 前端至全栈交流与成长`，阅读完整的文章：

## 往期文章归档：

- [在不同操作系统上安装 PostgreSQL | cmdragon's Blog](https://blog.cmdragon.cn/posts/fa06acfda3deefb94725714fe93e6ecb/)
- [PostgreSQL 的系统要求 | cmdragon's Blog](https://blog.cmdragon.cn/posts/470bb6899affac77deeb5f9a73fa47b3/)
- [PostgreSQL 的特点 | cmdragon's Blog](https://blog.cmdragon.cn/posts/85f705fff8b5d3b6de86201182505997/)
- [ORM框架与数据库交互 | cmdragon's Blog](https://blog.cmdragon.cn/posts/4748dacd8cb1ebab02a32f43d1d026f6/)
- [数据库与编程语言的连接 | cmdragon's Blog](https://blog.cmdragon.cn/posts/3583d4a61f90f952097bd2b1f63cacff/)
- [数据库审计与监控 | cmdragon's Blog](https://blog.cmdragon.cn/posts/0dbe53ca415995914ef7c59e7ca6e79a/)
- [数据库高可用性与容灾 | cmdragon's Blog](https://blog.cmdragon.cn/posts/9b112ce59562391d4d1715085047b32c/)
- [数据库性能优化 | cmdragon's Blog](https://blog.cmdragon.cn/posts/d988cbeacdae71a7e16e34c4db5bd1ff/)
- [备份与恢复策略 | cmdragon's Blog](https://blog.cmdragon.cn/posts/a22fcaa0314ca7b176601d9cdba5a82a/)
- [索引与性能优化 | cmdragon's Blog](https://blog.cmdragon.cn/posts/13b7f4e1c2f9ab927929f3931a8ee9b7/)
- [事务管理与锁机制 | cmdragon's Blog](https://blog.cmdragon.cn/posts/6881aed7e5aa53915d50985da8f2fcda/)
- [子查询与嵌套查询 | cmdragon's Blog](https://blog.cmdragon.cn/posts/bcd3e0ebc574b81d52115c1ed465430e/)
- [多表查询与连接 | cmdragon's Blog](https://blog.cmdragon.cn/posts/c519449fd08619f38f836ac7e9d21a61/)
- [查询与操作 | cmdragon's Blog](https://blog.cmdragon.cn/posts/b60d658ecf76bd9c3f3d3a7b5a158e73/)
- [数据类型与约束 | cmdragon's Blog](https://blog.cmdragon.cn/posts/a35131ef884098e57ab3d003271122ae/)
- [数据库的基本操作 | cmdragon's Blog](https://blog.cmdragon.cn/posts/52871e67360d4f6882d13086749f02dc/)
- [数据库设计原则与方法 | cmdragon's Blog](https://blog.cmdragon.cn/posts/0857c93758c59bc14ebc46611d81358f/)
- [数据库与数据库管理系统概述 | cmdragon's Blog](https://blog.cmdragon.cn/posts/495759d2b2ea6ec77f578da7b4bb69b5/)
- [Nuxt.js 应用中的 afterResponse 事件钩子 | cmdragon's Blog](https://blog.cmdragon.cn/posts/0099146574320c07d4d7bae1b6b526e4/)
- [Nuxt.js 应用中的 request 事件钩子 | cmdragon's Blog](https://blog.cmdragon.cn/posts/d821e2e0d8af1f6e0a02aa2f6cddf24e/)
- [Nuxt.js 应用中的 error 事件钩子 | cmdragon's Blog](https://blog.cmdragon.cn/posts/759227261e4312110b135b98dc240788/)
- [Nuxt.js 应用中的 close 事件钩子 | cmdragon's Blog](https://blog.cmdragon.cn/posts/0b73d77cbbe52c67c56d4a15a499885e/)
- [Nuxt.js 应用中的 render：island 事件钩子 | cmdragon's Blog](https://blog.cmdragon.cn/posts/a788981a66c14c5edd407545ac29b6ee/)
- [Nuxt.js 应用中的 render：html 事件钩子 | cmdragon's Blog](https://blog.cmdragon.cn/posts/e2e4ffc078733570a7b98d6f0dd9ea13/)
- [Nuxt.js 应用中的 render：response 事件钩子 | cmdragon's Blog](https://blog.cmdragon.cn/posts/b12508be9c4fb6b8f0499948ecd68ad9/)
- [Nuxt.js 应用中的 dev：ssr-logs 事件钩子 | cmdragon's Blog](https://blog.cmdragon.cn/posts/ef86af3b9be34b11d75fa32951b147bd/)
- [Nuxt.js 应用中的 webpack：progress 事件钩子 | cmdragon's Blog](https://blog.cmdragon.cn/posts/47b46cd0c184932afc8428cccb2e3bc8/)
- [Nuxt.js 应用中的 webpack：done 事件钩子 | cmdragon's Blog](https://blog.cmdragon.cn/posts/4d17f3c1bc0c28b6f117688edab9cd9a/)
- [Nuxt.js 应用中的 webpack：error 事件钩子 | cmdragon's Blog](https://blog.cmdragon.cn/posts/8de760bec83aa6eedb15a70959e37ac5/)
-

