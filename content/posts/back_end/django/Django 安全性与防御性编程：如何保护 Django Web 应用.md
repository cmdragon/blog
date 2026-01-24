---
url: /posts/f8ba40152b39d84f918402253b9e3158/
title: Django 安全性与防御性编程：如何保护 Django Web 应用
date: 2024-05-13T20:26:58+08:00
lastmod: 2024-05-13T20:26:58+08:00
categories:
  - 后端开发

tags:
  - CSRF
  - XSS
  - SQL
  - Upload
  - HTTPOnly
  - Password
  - Session
---

<img src="https://api2.cmdragon.cn/upload/cmder/images/2024_05_13 20_31_47.png" title="2024_05_13 20_31_47.png" alt="2024_05_13 20_31_47.png"/>

## 跨站请求伪造（CSRF）

跨站请求伪造（CSRF）是一种常见的网络攻击，它利用用户的身份和权限，欺骗服务器执行非预期的操作。Django 提供了一种内置的 CSRF
保护机制，可以帮助保护应用免受 CSRF 攻击。

Django 的 CSRF 保护机制是通过 CSRF 令牌（CSRF Token）实现的，它是一个加密字符串，包含了一些关于用户会话和请求的信息。在每个
POST、PUT、PATCH 和 DELETE 请求中，都需要在表单或 AJAX 请求中包含这个 CSRF 令牌，以便服务器可以验证请求的合法性。
AD：[首页 | 一个覆盖广泛主题工具的高效在线平台](https://cmdragon.cn/)
在 Django 中，可以通过以下几种方式获取 CSRF 令牌：

1. 在 HTML 模板中，使用`{% csrf_token %}`标签，在表单中插入 CSRF 令牌。

    ```html
    <form method="post">
        {% csrf_token %}
        {{ form.as_p }}
        <button type="submit">提交</button>
    </form>
    ```

2. 在 AJAX 请求中，可以从`csrfmiddlewaretoken`的 cookie 中获取 CSRF 令牌，并在请求头中添加`X-CSRFToken`字段。

    ```javascript
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }
        }
    });
    ```

3. 在 Django 视图函数中，可以使用`request.META`获取 CSRF 令牌，并在请求中验证它的合法性。

    ```python
    from django.middleware.csrf import get_token

    def my_view(request):
        token = get_token(request)
        # ...
        if request.method == 'POST':
            # ...
            if not request.is_csrf_token_valid():
                return HttpResponseBadRequest('Invalid CSRF token.')
    ```

Django 的 CSRF 保护机制可以帮助开发人员快速实现安全的 Web 应用，但是也需要注意一些问题，例如在使用 AJAX 请求时，需要确保请求头中包含了
CSRF 令牌，否则服务器会拒绝处理该请求。同时，在使用 CSRF 令牌时，也需要注意防止 CSRF 令牌被泄露，例如在表单中使用 HTTP GET
方法时，需要注意 CSRF 令牌的隐藏性。

AD：[专业搜索引擎](https://movie.cmdragon.cn:2083/)
总之，Django 的 CSRF 保护机制是一个强大的工具，可以帮助开发人员快速实现安全的 Web 应用，但是也需要注意一些问题，以确保 CSRF
令牌的安全性。

## 跨站脚本（XSS）

跨站脚本（XSS，Cross-site Scripting）攻击是一种常见的网络安全威胁，攻击者通过注入恶意脚本到用户的浏览器中，来窃取用户的敏感信息或者执行非授权操作。Django
提供了一套内置的安全特性来帮助防止 XSS 攻击，其中包括过滤器（filters）和模板标签（template tags）。

1. **内置过滤器**： Django 的模板引擎（如 Django 的`{{ }}`模板标签）提供了`safe`过滤器，用于标记字符串为安全的，不会进行 HTML
   实体转义。当需要在模板中显示用户输入的内容，但不想进行转义时，可以使用`safe`过滤器。

    ```html
    <p>{{ user_input|safe }}</p>
    ```

   如果`user_input`可能包含恶意脚本，你需要确保它是可信的，或者在输出之前进行适当的清理和验证。

2. **模板标签**： Django 提供了`safe`标签，可以将整个块标记为安全，不会进行转义。

    ```html
    {% autoescape off %}
    <p>{{ user_input|safe }}</p>
    {% endautoescape %}
    ```

   这里`autoescape off`指令关闭了模板的自动转义功能，如果在块内部使用`safe`标签，可以确保用户输入不会被转义。

3. **Content Security Policy (CSP)** ： Django 的`django.middleware.clickjacking.XSSMiddleware`
   和`django.middleware.security.SecurityMiddleware`中包含了 Content Security Policy 的支持，可以限制页面可以加载的内容来源，防止恶意脚本的执行。

4. **HTML5 模式**： Django 的`X_FRAME_OPTIONS`设置可以控制页面是否可以嵌入到其他页面中，防止点击劫持（Clickjacking）攻击，这是一种变相的
   XSS 攻击。

5. **输入验证**： 在接收用户输入时，始终进行适当的验证和清理，确保数据的格式和内容符合预期，避免恶意脚本的注入。

尽管 Django
提供了这些内置的保护机制，但开发人员仍然需要保持警惕，因为攻击者可能会使用各种手段绕过这些防御。在处理用户输入时，始终遵循“最小权限原则”，只允许必要的数据和功能，并且在必要时使用第三方库（如`django-csp`
或`django-xss-filter`）进行额外的安全增强。

## SQL注入

Django 使用 Object-Relational Mapping (ORM) 技术，可以有效帮助开发人员避免 SQL 注入攻击。ORM 是一种在应用程序中使用高级编程语言（如
Python）来操作数据库的方法，它可以将 SQL 语句的构造转移到框架内部，从而减少直接编写 SQL 语句的需求。

AD：[漫画首页](https://comic.cmdragon.cn:2087/)
Django 的 ORM 将参数化查询作为默认行为，这意味着在构造 SQL 语句时，用户提供的数据会被自动转义，避免了直接将用户输入拼接到
SQL 语句中，这是 SQL 注入攻击的主要入口。

以下是使用 Django ORM 时应该遵循的安全最佳实践：

1. **使用 ORM 而不是原生 SQL**：尽可能地使用 Django ORM 来操作数据库，而不是直接编写原生 SQL 语句。ORM 会帮助你自动转义用户输入，避免
   SQL 注入攻击。

2. **使用参数化查询**：当需要使用原生 SQL 时，始终使用参数化查询，避免将用户输入直接拼接到 SQL 语句中。例如，使用 Django
   的`execute`方法：

    ```python
    from django.db import connection

    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM myapp_model WHERE id = %s", [user_id])
        result = cursor.fetchone()
    ```

   这里，`%s`是一个占位符，`[user_id]`是一个列表，其中包含用户输入的数据，ORM 会自动将其转义，避免 SQL 注入攻击。

3. **使用预定义的查询**：使用 Django ORM 提供的查询方法，如`get`、`filter`、`exclude`等，而不是直接使用原生的 SQL
   查询。这些查询方法也会自动转义用户输入，避免 SQL 注入攻击。

4. **输入验证**：在接收用户输入时，始终进行适当的验证和清理，确保数据的格式和内容符合预期，避免恶意输入。

虽然 Django ORM 可以有效帮助开发人员避免 SQL
注入攻击，但不能完全消除这种风险。因此，在处理用户输入时，始终应该遵循“最小权限原则”，只允许必要的数据和功能，并在必要时使用第三方库（如`django-sql-security`
）进行额外的安全增强。

## 文件上传攻击

Django 提供了一些内置的安全特性来帮助处理文件上传，以减少文件上传攻击的风险。以下是一些关键的安全措施和最佳实践：

1. **文件存储和路径安全**：

    - **避免使用用户提供的文件名**：不要直接使用用户上传的文件名来保存文件，因为这可能导致路径遍历攻击。应该生成一个随机的文件名，并确保文件存储在安全的目录中。
    - **限制文件存储位置**：确保文件存储在应用程序的受控目录中，避免将文件存储在可由Web服务器直接访问的位置，这样可以防止直接访问上传的文件。

2. **文件类型和大小限制**：

    - **检查文件类型**：使用`mimetype`、`content_type`或文件的扩展名来验证文件类型，确保只接受预期的文件类型。
    - **限制文件大小**：在`settings.py`中设置`FILE_UPLOAD_MAX_MEMORY_SIZE`和`FILE_UPLOAD_MAX_NUMBER_PER_FIELD`
      来限制单个文件上传的大小和每个表单字段可以上传的文件数量。

3. **文件内容验证**：

    - **检查文件内容**：对于某些文件类型（如图像），可以使用库（如`PIL`）来检查文件内容是否符合预期格式，以防止嵌入恶意代码。

4. **使用 Django 的`FileField`和`ImageField`**：

    - 这些字段类型提供了内置的验证，可以检查文件的`mimetype`和大小。

5. **安全处理上传的文件**：

    - **不要执行不可信的文件**：永远不要在服务器上执行用户上传的文件，这可能导致代码执行攻击。
    - **隔离上传文件**：如果可能，将上传的文件存储在隔离的环境中，以减少潜在的安全风险。

6. **使用 Django 的中间件和视图**：

    - Django 的中间件可以用来在文件上传到视图之前进行额外的安全检查。
    - 使用 Django 的视图装饰器，如`@login_required`，来确保只有认证用户才能上传文件。

7. **定期更新和安全审计**：

    - 定期更新 Django 和所有依赖库，以确保使用最新的安全修复。
    - 进行安全审计，检查文件上传功能是否存在潜在的安全漏洞。

通过遵循这些最佳实践，可以大大降低文件上传攻击的风险。然而，安全是一个持续的过程，需要不断地评估和改进。

## HTTPOnly cookie

Django 框架支持 HTTPOnly cookie，这是一种有助于提高网站安全性的措施。HTTPOnly cookie 是一种特殊的 cookie，它通过在设置
cookie 时添加`HttpOnly`标志来实现。这个标志告诉浏览器，该 cookie 不应该通过客户端脚本（如 JavaScript）访问。

以下是 HTTPOnly cookie 的一些关键点：

1. **防止 XSS 攻击**： HTTPOnly cookie 可以防止跨站脚本（XSS）攻击，因为攻击者无法通过注入恶意脚本来读取用户的
   cookie。这有助于保护用户的会话信息不被窃取。

2. **增强会话安全**： 当用户登录到一个网站时，服务器通常会创建一个会话 cookie，用于在后续请求中识别用户。如果这个 cookie 是
   HTTPOnly 的，那么即使网站存在 XSS 漏洞，攻击者也无法通过 JavaScript 获取这个 cookie。

3. **Django 中的设置**： Django 默认会为 session cookie 和 CSRF token cookie 启用 HTTPOnly 标志。你可以在 Django
   的设置文件`settings.py`中找到以下配置：

    ```python
    SESSION_COOKIE_HTTPONLY = True
    CSRF_COOKIE_HTTPONLY = True
    ```

   这些设置确保了 Django 生成的 session cookie 和 CSRF token cookie 都是 HTTPOnly 的。

4. **手动设置 HTTPOnly cookie**： 如果你需要在 Django 视图中手动设置 cookie，并且希望它是 HTTPOnly 的，你可以这样做：

    ```python
    response = HttpResponse()
    response.set_cookie('my_cookie', 'value', httponly=True)
    ```

   在这个例子中，`my_cookie`将被设置为 HTTPOnly cookie。

虽然 HTTPOnly cookie 提供了额外的安全层，但它并不能完全防止所有类型的攻击。例如，它不能防止中间人攻击或通过其他方式（如网络嗅探）获取
cookie。因此，除了使用 HTTPOnly cookie 之外，还应该采取其他安全措施，如使用 HTTPS、实施内容安全策略（CSP）等，以进一步提高网站的安全性。

## 密码安全性

Django 提供了内置的安全密码存储功能，这是通过其内置的`django.contrib.auth`库中的`User`
模型和密码哈希处理机制实现的。当用户注册并设置密码时，Django并不会直接存储明文密码，而是存储密码的哈希值和一个随机盐值（salt）。

以下是 Django 安全密码存储的关键点：

1. **哈希算法**： Django 使用了 bcrypt 和 PBKDF2（取决于你的 Django
   版本）这样的安全哈希算法来加密密码。这些算法经过精心设计，即使攻击者知道哈希值，也无法轻易地通过暴力破解或彩虹表来恢复原始密码。

2. **盐值**： 每个用户的密码哈希值都会与一个唯一的随机盐值结合，这样即使相同的密码，由于盐值不同，生成的哈希值也会不同。这进一步增加了破解的难度。

3. **`set_password()`方法**： 当用户设置密码时，Django 提供了`set_password()`方法，它会自动处理密码的哈希和盐值生成。示例代码如下：

    ```python
    user = User.objects.create_user(username='myuser', password='mypassword')
    user.set_password('mypassword')
    user.save()
    ```

4. **验证密码**： 当用户尝试登录时，Django 会计算他们提供的密码与数据库中存储的哈希值和盐值的匹配。这通过`authenticate()`
   函数完成，而不是直接比较密码。

5. **`check_password()`方法**： 为了验证密码，可以使用`check_password()`方法，如：

    ```python
    if user.check_password('mynewpassword'):
        # 密码正确
    else:
        # 密码错误
    ```

通过这种方式，Django 有效地保护了用户的密码，即使数据库被泄露，攻击者也无法直接获取到用户的密码，从而提高了安全性。

## 安全会话

Django 使用加密和签名的方式来保护会话数据，以确保会话的安全性。下面是 Django 中安全会话的实现方式：

1. **加密会话数据**： Django 默认会将会话数据加密后存储在用户的浏览器中。这样即使用户可以查看浏览器的 cookie
   数据，也无法直接读取和理解其中的内容。Django 使用密钥来加密和解密会话数据，确保数据的机密性。
2. **签名会话数据**： 除了加密数据外，Django
   还会对会话数据进行签名。签名是通过使用密钥和哈希算法来生成一个签名值，用于验证数据的完整性和真实性。如果会话数据在传输过程中被篡改，签名验证将失败，从而防止数据被篡改。
3. **SESSION_ENGINE 设置**： 在 Django 的设置文件中，可以通过`SESSION_ENGINE`设置来选择会话引擎。默认情况下，Django
   使用`django.contrib.sessions.backends.db`
   作为会话引擎，将加密和签名的会话数据存储在数据库中。也可以选择其他会话引擎，如`django.contrib.sessions.backends.cache`
   或`django.contrib.sessions.backends.file`。
4. **SESSION_COOKIE_SECURE 设置**： 可以通过设置`SESSION_COOKIE_SECURE = True`来确保会话 cookie 只能通过 HTTPS
   连接传输，增加会话数据的安全性。
5. **SESSION_COOKIE_HTTPONLY 设置**： 同样可以通过设置`SESSION_COOKIE_HTTPONLY = True`来禁止 JavaScript 访问会话
   cookie，减少 XSS 攻击的可能性。

通过加密和签名会话数据，Django 确保了用户的会话信息在传输和存储过程中的安全性，防止敏感数据泄露和篡改。这是保护用户隐私和确保系统安全的重要措施之一。