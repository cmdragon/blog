---
url: /posts/0a47f405d0a04677bb894315ff0f4c83/
title: Django集成elasticsearch
date: 2024-05-30T9:01:33+08:00
lastmod: 2024-05-30T9:01:33+08:00
categories:
  - 后端开发

tags:
  - django

---
在Django项目中集成Elasticsearch通常涉及以下几个步骤：

### 1. **安装Elasticsearch**：

首先，你需要在你的服务器或本地机器上安装Elasticsearch。可以从[Elasticsearch官网](https://www.elastic.co/downloads/elasticsearch)
下载并安装。

### 2. **安装Elasticsearch客户端库**：

在Django项目中，你需要安装一个Python客户端库来与Elasticsearch通信。最常用的是`elasticsearch-dsl`，它提供了Django
ORM风格的API。

   ```bash
   pip install elasticsearch elasticsearch-dsl
   ```

### 3. **配置Elasticsearch连接**：

在你的Django项目的设置文件（通常是`settings.py`）中，添加Elasticsearch的配置。

```python
   # settings.py
ELASTICSEARCH_DSL = {
    'default': {
        'hosts': 'localhost:9200'
    },
}
```

这里假设Elasticsearch运行在本地，端口为9200。如果Elasticsearch运行在其他地方，请相应地修改地址。

### 4. **创建Elasticsearch索引和文档**：

使用`elasticsearch-dsl`创建索引和文档类。这些类将映射到Elasticsearch中的索引和类型。

```python
   # documents.py
from django_elasticsearch_dsl import Document, fields
from django_elasticsearch_dsl.registries import registry
from .models import Article


@registry.register_document
class ArticleDocument(Document):
    # title = fields.TextField(
    #     analyzer=ik_analyzer,
    #     fields={
    #         'keyword': {
    #             'type': 'text',
    #             'fielddata': True
    #         }
    # 
    #     }
    # )

    class Index:
        name = 'articles'
        settings = {
            # 设置最大索引深度(**重要)  分页查询时要用到
            'max_result_window': 10000000,
            # 切片个数
            'number_of_shards': 1,
            # 保存副本数
            'number_of_replicas': 0
        }

    class Django:
        model = Article  # 你的Django模型
        #  fields 置空 则会根据上方的对象的属性进行映射,  可直接写orm模型类字段名, 会根据orm中的字段类型进行自动选择文档字段类型
        fields = [
            'title',
            'content',
            # 其他字段...
        ]

        # 执行迁移时的 每次从mysql中数据读取的条数.
        queryset_pagination = 50000
```

这里，`ArticleDocument`是一个Elasticsearch文档类，它映射到`Article` Django模型。`Index`类指定了Elasticsearch索引的名称。

### 5. 查询Elasticsearch：

使用`elasticsearch-dsl`提供的查询API来搜索数据。

```python
   # views.py

from django_elasticsearch_dsl_drf.viewsets import DocumentViewSet

from .documents import ArticleDocument


class ArticleSearchView(DocumentViewSet):
   document = ArticleDocument


serializer_class = ArticleDocumentSerializer
lookup_field = 'id'

# 其他配置...

# 不继承DocumentViewSet可以自定义查询
# doc_data = self.document.search().from_dict(
#     {
#         "query": {
#             pattern: {
#                 "title": pattern_items.get(pattern)
#             }
#         },
#         "highlight": {
#             "boundary_scanner_locale": "zh_CN",
#             "fields": {
#                 "title": {
#                     "type": "plain",
#                     "boundary_scanner": "chars",
#                     "pre_tags": [
#                         "<span>"
#                     ],
#                     "post_tags": [
#                         "</span>"
#                     ]
#                 }
#             }
#         },
#         "size": page_size if int(page_size) < self.max_page_size else self.max_page_size,
#         "from": int(page_size) * (int(page) - 1),
#         "sort": self.get_ordering(ordering_param)
#     }
# )
# data = self.get_serializer(doc_data, many=True).data

```

这里，`ArticleSearchView`是一个视图，它使用`ArticleDocument`来执行搜索。

### 6. 使用Django Rest Framework（可选）

如果你正在使用Django Rest Framework（DRF），你可以使用`django_elasticsearch_dsl_drf`库来简化API的创建。

   ```bash
   pip install django_elasticsearch_dsl_drf
   ```

然后，你可以使用`DocumentViewSet`来创建一个RESTful API，它可以直接与Elasticsearch交互。

### 7. 构建索引

`python manage.py search_index` 是 Django 项目中用于管理 Elasticsearch
索引的命令。这个命令通常与 `django-elasticsearch-dsl-drf` 库一起使用，用于创建、更新和重建 Elasticsearch 索引。下面详细说明这个命令的作用：

1. 创建索引 (`--create`) 当使用 `--create` 选项时，`search_index` 命令会根据 Django 应用中定义的 `Document` 类创建一个新的
   Elasticsearch 索引。这个操作通常在首次设置索引时执行，确保 Elasticsearch 中有一个与 Django 模型对应的索引结构。
2. 更新索引 (`--update`) 使用 `--update` 选项时，`search_index` 命令会检查 Django 模型和 `Document` 类的变化，并更新
   Elasticsearch 索引以反映这些变化。这包括添加新的字段、删除不再需要的字段或修改字段的映射。
3. 重建索引 (`--rebuild`) 如果使用 `--rebuild` 选项，`search_index`
   命令会先删除现有的索引，然后重新创建它。这个操作通常在需要完全重建索引时执行，例如在模型结构发生重大变化后。
4. 同步索引 (`--populate`) 使用 `--populate` 选项时，`search_index` 命令会同步 Django 模型数据到 Elasticsearch
   索引中。这个操作会遍历所有相关的 Django 模型实例，并将它们的数据添加到 Elasticsearch 索引中。
5. 清空索引 (`--clear`) 如果使用 `--clear` 选项，`search_index` 命令会从 Elasticsearch
   索引中删除所有文档，但保留索引的结构。这个操作通常在需要快速清空索引内容时执行。
6. 指定应用--models (`<app_name>`) 在命令中指定应用名 `<app_name>`，`search_index` 命令会针对该应用的模型和 `Document` 类执行相应的操作。
7. 指定 Elasticsearch 配置 (`--using=<config_name>`) 使用 `--using` 选项可以指定要使用的 Elasticsearch 配置。这个配置通常在
   Django 项目的设置文件中定义，用于指定 Elasticsearch 服务器的地址和其他相关配置。

#### 相关示例：

`python manage.py search_index --rebuild --models cloud_seeker`



指定构建重新构建哪个APP的索引

