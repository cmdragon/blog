---
url: /vi-VN/posts/07755af00a1779ac0ab6cb087ff3epfl/
title: Hoàn thành trong 10 phút! Các bước chi tiết để kết nối AI Magic Resume với các dịch vụ AI miễn phí
date: 2026-03-29T07:40:34+08:00
lastmod: 2026-03-29T07:40:34+08:00
author: cmdragon

summary:
  Hướng dẫn này sẽ hướng dẫn bạn cấu hình các dịch vụ AI miễn phí như OpenRouter trong AI Magic Resume của bạn.

categories:
  - tweets

tags:
  - AI Magic Resume
  - cmdragon
  - Dịch vụ AI miễn phí
  - Cấu hình dịch vụ AI
  - Khóa API
  - Tài nguyên hướng dẫn
  - Công cụ trực tuyến

---

## Bước 1: Truy cập AI Magic Resume

Mở trang web AI Magic Resume:  
**https://magic-resume.cmdragon.cn/app/dashboard/ai**

Chọn tùy chọn **"Nhà cung cấp AI"** trong thanh điều hướng bên trái.

![Chọn nhà cung cấp AI](https://cdn-cn.cmdragon.cn/aBClo3u1L9-mfxakQY_6H.png)

---

## Bước 2: Lấy khóa API OpenRouter

### 2.1 Mở trang web OpenRouter (sử dụng OpenRouter làm ví dụ)

Trên trang cấu hình nhà cung cấp AI, nhấp vào nút **"Lấy khóa API"**.

![Nhấp để lấy khóa API](https://cdn-cn.cmdragon.cn/syW9LMwLw0mBa1zn4p7DI.png)

Hệ thống sẽ mở trang web chính thức của OpenRouter trong tab mới:

![Trang web chính thức của OpenRouter](https://cdn-cn.cmdragon.cn/kJmBIJzNwEna_Dqixs5Gh.png)

### 2.2 Đăng ký/Đăng nhập

- **Đã có tài khoản**: Đăng nhập trực tiếp
- **Chưa có tài khoản**: Nhấp để đăng ký

> 💡 **Mẹo**
> : Nếu bạn không muốn sử dụng email thông thường của mình, bạn có thể sử dụng [dịch vụ email tạm thời của chúng tôi](https://tools.cmdragon.cn/zh/apps/temp-email) https://tools.cmdragon.cn/zh/apps/temp-email (đảm bảo rằng OpenRouter hỗ trợ email tạm thời).

![Dịch vụ email tạm thời](https://cdn-cn.cmdragon.cn/Dn0WKPCb4GJRJzJTViZMl.png)
![Đăng ký tài khoản](https://cdn-cn.cmdragon.cn/zGVLipU7YiUpQ8LinfcsJ.png)

### 2.3 Tạo khóa API

Sau khi đăng nhập, làm theo đường dẫn sau:

1. Nhấp vào **"Settings"** trên thanh điều hướng trên cùng
2. Chọn **"API Keys"** từ menu bên trái
3. Nhấp vào nút **"Create API Key"**

![Trang cài đặt](https://cdn-cn.cmdragon.cn/lKVZ6Umc3EkhQRowk7O_E.png)
![Quản lý khóa API](https://cdn-cn.cmdragon.cn/B6lzexbzcIwpT6oltMdNr.png)
![Tạo khóa API](https://cdn-cn.cmdragon.cn/HQT5zxuf-P6VpJmrwRAfE.png)

### 2.4 Sao chép khóa API

- Sao chép chuỗi khóa bắt đầu bằng `sk-`
- **Quan trọng**: Vui lòng lưu khóa này ở nơi an toàn, bạn không thể xem lại khóa đầy đủ sau này

---

## Bước 3: Cấu hình AI Magic Resume

Quay lại trang cấu hình AI Magic Resume và điền thông tin sau:

| Trường          | Nội dung                           |
|-------------|--------------------------------|
| **Khóa API** | Khóa bạn đã sao chép và bắt đầu bằng `sk-`              |
| **Tên nhà cung cấp**   | `openrouter`                   |
| **Điểm cuối API**  | `https://openrouter.ai/api/v1` |
| **ID mô hình**   | Chọn một mô hình miễn phí (xem bước tiếp theo)                   |

![Điền thông tin cấu hình](https://cdn-cn.cmdragon.cn/JRme33gZtIKB8x-zxZXw-.png)

---

## Bước 4: Chọn mô hình miễn phí

### 4.1 Tìm mô hình miễn phí

Trên trang web OpenRouter, nhập **`free`** vào hộp tìm kiếm mô hình để lọc tất cả các mô hình miễn phí.

![Tìm kiếm mô hình miễn phí](https://cdn-cn.cmdragon.cn/EF-1D1wvVhMMWmtGRXD93.png)

![Sao chép ID mô hình](https://cdn-cn.cmdragon.cn/NKIeBOVFdhJUfXZ-SU7j3.png)

### 4.2 Sao chép ID mô hình

Chọn bất kỳ mô hình miễn phí nào và sao chép ID đầy đủ của nó (định dạng như: `google/gemma-3-27b-it:free`).

> ⚠️ **Lưu ý**: Các mô hình miễn phí có giới hạn sử dụng và không phải miễn phí không giới hạn.

---

## Bước 5: Bắt đầu sử dụng

Sau khi cấu hình hoàn tất, bạn có thể sử dụng mô hình AI để chỉnh sửa sơ yếu lý lịch của mình.

![Cấu hình hoàn tất](https://cdn-cn.cmdragon.cn/ObI005LhshzPDb6w0qG9W.png)
![Chỉnh sửa sơ yếu lý lịch](https://cdn-cn.cmdragon.cn/aDU_mXaziu4vj2te6KWvW.png)
![Hình ảnh](https://cdn-cn.cmdragon.cn/RUmsRZYEV-nY4_oswvgaW.png)
![Hiển thị tính năng AI](https://cdn-cn.cmdragon.cn/hFDK6Na-Fi7gTL2VyMCva.png)
![Kết quả được tạo](https://cdn-cn.cmdragon.cn/7MEWP09NvTPOC0idG4Pz0.png)

## Bước 6: Xuất và in sơ yếu lý lịch

### Xuất sơ yếu lý lịch PDF

Nhấp vào nút **"Xuất sơ yếu lý lịch"**, hệ thống sẽ tự động tạo một tệp sơ yếu lý lịch định dạng PDF tiêu chuẩn.

![Xuất sơ yếu lý lịch](https://cdn-cn.cmdragon.cn/XtOsWjb5TvEadMHFbtgD5.png)

**Phương thức xuất**:

- **Xuất từ máy chủ**: Tạo tệp PDF trực tiếp trên máy chủ, đảm bảo định dạng thống nhất và bố cục đẹp, sẵn sàng sử dụng sau khi tải xuống
  ![Hình ảnh](https://cdn-cn.cmdragon.cn/80GzYvsfodwhT4jzExPgs.png)
- **In từ trình duyệt**: Gọi chức năng in gốc của trình duyệt, có thể kết nối với máy in để xuất bản in trực tiếp
  ![Hình ảnh](https://cdn-cn.cmdragon.cn/v5gj00PLvRkg2Px9RKAEe.png)

**Kịch bản sử dụng**:

- 📄 **Phiên bản điện tử**: Để nộp trực tuyến, gửi email, chia sẻ WeChat, v.v.
- 🖨️ **Phiên bản giấy**: Để phỏng vấn, hội chợ việc làm và các kịch bản ngoại tuyến khác

**Mẹo**: Nên xem trước hiệu ứng PDF trước khi nộp, để đảm bảo rằng thông tin quan trọng như thông tin liên hệ và kinh nghiệm dự án là đầy đủ và chính xác.

---

## Câu hỏi thường gặp

### Mã lỗi 429: Giới hạn tần suất yêu cầu

Nếu bạn gặp lỗi sau:

![Giới hạn tần suất](https://cdn-cn.cmdragon.cn/N8XAuxGLIdlIRaeAjkGMN.png)

```json
{
  "error": {
    "message": "Provider returned Error",
    "code": 429,
    "metadata": {
      "raw": "google/gemma-3-27b-it:free is temporarily rate-limited upstream. Please retry shortly, or add your own key to accumulate your rate limits: https://openrouter.ai/settings/integrations",
      "provider_name": "Google AI Studio",
      "is_byok": false
    }
  },
  "user_id": "user_2vDtkMeeWdLNDw24VQIEI0SunB3"
}
```

**Ý nghĩa lỗi**: Mô hình miễn phí đang sử dụng đã đạt đến giới hạn tần suất truy cập.

**Giải pháp**:

1. **Chờ và thử lại**: Giới hạn đối với mô hình miễn phí là tạm thời, thường chờ vài phút đến vài giờ hoặc thậm chí lâu hơn.
2. **Thay đổi mô hình**: Thử các mô hình miễn phí khác
3. **Sử dụng mô hình trả phí**: Xóa hậu tố `:free` khỏi ID mô hình và sử dụng phiên bản trả phí, cần nạp tiền
4. **Liên kết khóa API của riêng bạn**: Liên kết khóa API Google AI Studio của riêng bạn trong cài đặt OpenRouter để sử dụng hạn ngạch độc lập

---

## Mẹo bảo mật

- **Khóa API là thông tin nhạy cảm**, vui lòng không chia sẻ với người khác
- Nên lưu khóa API ở nơi an toàn (như trình quản lý mật khẩu)
- Nếu nghi ngờ khóa bị rò rỉ, vui lòng xóa và tạo lại ngay lập tức trong backend OpenRouter

---

## Tài nguyên liên quan

- [Trang web chính thức của OpenRouter](https://openrouter.ai): https://openrouter.ai
- [Danh sách mô hình OpenRouter](https://openrouter.ai/models): https://openrouter.ai/models
- [Dịch vụ email tạm thời](https://tools.cmdragon.cn/zh/apps/temp-email): https://tools.cmdragon.cn/zh/apps/temp-email
- [Trình tạo mật khẩu](https://tools.cmdragon.cn/zh/apps/password-generator): https://tools.cmdragon.cn/zh/apps/password-generator
- [Địa chỉ tài trợ](https://tools.cmdragon.cn/zh/sponsor): https://tools.cmdragon.cn/zh/sponsor
- [Liên hệ với chúng tôi](mailto:contact@cmdragon.cn): mailto:contact@cmdragon.cn

---

**Hướng dẫn hoàn tất!** Bây giờ bạn có thể sử dụng mô hình AI đã cấu hình để tối ưu hóa và chỉnh sửa sơ yếu lý lịch của mình.
