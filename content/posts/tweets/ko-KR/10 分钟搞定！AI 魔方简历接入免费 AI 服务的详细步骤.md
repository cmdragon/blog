---
url: /ko-KR/posts/07755af00a1779ac0ab6cb087ff3epfl/
title: 10 분 만에 완료! AI 매직 이력서에 무료 AI 서비스 연결하는 상세 단계
date: 2026-03-29T07:40:34+08:00
lastmod: 2026-03-29T07:40:34+08:00
author: cmdragon

summary:
  이 튜토리얼에서는 AI 매직 이력서에서 OpenRouter 와 같은 무료 AI 서비스를 구성하는 방법을 안내합니다.

categories:
  - tweets

tags:
  - AI 매직 이력서
  - cmdragon
  - 무료 AI 서비스
  - AI 서비스 구성
  - API 키
  - 튜토리얼 리소스
  - 온라인 도구

---

## 1 단계: AI 매직 이력서에 액세스

AI 매직 이력서 웹사이트를 엽니다:  
**https://magic-resume.cmdragon.cn/app/dashboard/ai**

왼쪽 탐색 바에서 **"AI 공급자"** 옵션을 선택합니다.

![AI 공급자 선택](https://cdn.game-share.store/aBClo3u1L9-mfxakQY_6H.png)

---

## 2 단계: OpenRouter API 키 가져오기

### 2.1 OpenRouter 웹사이트 열기 (OpenRouter 를 예로 사용)

AI 공급자 구성 페이지에서 **"API 키 가져오기"** 버튼을 클릭합니다.

![API 키 가져오기 클릭](https://cdn.game-share.store/syW9LMwLw0mBa1zn4p7DI.png)

시스템이 새 탭에서 OpenRouter 공식 웹사이트를 엽니다:

![OpenRouter 공식 웹사이트](https://cdn.game-share.store/kJmBIJzNwEna_Dqixs5Gh.png)

### 2.2 등록/로그인

- **이미 계정이 있음**: 직접 로그인
- **계정이 없음**: 등록 클릭

> 💡 **팁**
> : 일반 이메일을 사용하고 싶지 않다면 [임시 이메일 서비스](https://tools.cmdragon.cn/zh/apps/temp-email) https://tools.cmdragon.cn/zh/apps/temp-email 를 사용할 수 있습니다 (OpenRouter 가 임시 이메일을 지원하는지 확인하세요).

![임시 이메일 서비스](https://cdn.game-share.store/Dn0WKPCb4GJRJzJTViZMl.png)
![계정 등록](https://cdn.game-share.store/zGVLipU7YiUpQ8LinfcsJ.png)

### 2.3 API 키 생성

로그인 후 다음 경로를 따릅니다:

1. 상단 탐색 바에서 **"Settings"** 클릭
2. 왼쪽 메뉴에서 **"API Keys"** 선택
3. **"Create API Key"** 버튼 클릭

![설정 페이지](https://cdn.game-share.store/lKVZ6Umc3EkhQRowk7O_E.png)
![API 키 관리](https://cdn.game-share.store/B6lzexbzcIwpT6oltMdNr.png)
![API 키 생성](https://cdn.game-share.store/HQT5zxuf-P6VpJmrwRAfE.png)

### 2.4 API 키 복사

- `sk-` 로 시작하는 키 문자열을 복사
- **중요**: 이 키는 안전하게 보관하세요. 나중에 전체 키를 다시 볼 수 없습니다

---

## 3 단계: AI 매직 이력서 구성

AI 매직 이력서 구성 페이지로 돌아가 다음 정보를 입력합니다:

| 필드          | 콘텐츠                           |
|-------------|--------------------------------|
| **API 키** | 복사한 `sk-` 로 시작하는 키              |
| **공급자 이름**   | `openrouter`                   |
| **API 엔드포인트**  | `https://openrouter.ai/api/v1` |
| **모델 ID**   | 무료 모델 선택 (다음 단계 참조)                   |

![구성 정보 입력](https://cdn.game-share.store/JRme33gZtIKB8x-zxZXw-.png)

---

## 4 단계: 무료 모델 선택

### 4.1 무료 모델 찾기

OpenRouter 웹사이트에서 모델 검색 상자에 **`free`** 를 입력하여 모든 무료 모델을 필터링합니다.

![무료 모델 검색](https://cdn.game-share.store/EF-1D1wvVhMMWmtGRXD93.png)

![모델 ID 복사](https://cdn.game-share.store/NKIeBOVFdhJUfXZ-SU7j3.png)

### 4.2 모델 ID 복사

무료 모델을 선택하고 전체 ID 를 복사합니다 (형식: `google/gemma-3-27b-it:free`).

> ⚠️ **참고**: 무료 모델에는 사용 제한이 있으며 무제한 무료가 아닙니다.

---

## 5 단계: 사용 시작

구성 완료 후 AI 모델을 사용하여 이력서를 편집할 수 있습니다.

![구성 완료](https://cdn.game-share.store/ObI005LhshzPDb6w0qG9W.png)
![이력서 편집](https://cdn.game-share.store/aDU_mXaziu4vj2te6KWvW.png)
![이미지](https://cdn.game-share.store/RUmsRZYEV-nY4_oswvgaW.png)
![AI 기능 표시](https://cdn.game-share.store/hFDK6Na-Fi7gTL2VyMCva.png)
![생성된 결과](https://cdn.game-share.store/7MEWP09NvTPOC0idG4Pz0.png)

## 6 단계: 이력서 내보내기 및 인쇄

### PDF 이력서 내보내기

**"이력서 내보내기"** 버튼을 클릭하면 시스템이 자동으로 표준 PDF 형식의 이력서 파일을 생성합니다.

![이력서 내보내기](https://cdn.game-share.store/XtOsWjb5TvEadMHFbtgD5.png)

**내보내기 방법**:

- **서버 내보내기**: 서버에서 직접 PDF 파일 생성, 통일된 형식과 아름다운 레이아웃 보장, 다운로드 후 즉시 사용 가능
  ![이미지](https://cdn.game-share.store/80GzYvsfodwhT4jzExPgs.png)
- **브라우저 인쇄**: 브라우저의 기본 인쇄 기능 호출, 프린터에 연결하여 직접 용지 사본 출력 가능
  ![이미지](https://cdn.game-share.store/v5gj00PLvRkg2Px9RKAEe.png)

**사용 시나리오**:

- 📄 **전자 버전**: 온라인 제출, 이메일 전송, WeChat 공유 등
- 🖨️ **용지 버전**: 면접, 채용 박람회 및 기타 오프라인 시나리오용

**팁**: 제출 전 PDF 효과를 미리 보는 것이 좋습니다. 연락처 정보 및 프로젝트 경험과 같은 중요한 정보가 완전하고 정확한지 확인하세요.

---

## 자주 묻는 질문

### 오류 코드 429: 요청 속도 제한

다음 오류가 발생하는 경우:

![속도 제한](https://cdn.game-share.store/N8XAuxGLIdlIRaeAjkGMN.png)

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

**오류 의미**: 사용 중인 무료 모델이 액세스 속도 제한에 도달했습니다.

**해결 방법**:

1. **대기 후 재시도**: 무료 모델 제한은 일시적입니다. 일반적으로 몇 분에서 몇 시간 또는 그 이상 대기합니다.
2. **모델 변경**: 다른 무료 모델 시도
3. **유료 모델 사용**: 모델 ID 에서 `:free` 접미사를 제거하고 유료 버전 사용, 충전 필요
4. **자체 API 키 바인드**: OpenRouter 설정에서 자체 Google AI Studio API 키를 바인드하여 독립 할당량 사용

---

## 보안 팁

- **API 키는 민감한 정보입니다**. 다른 사람과 공유하지 마세요
- API 키는 안전한 곳 (비밀번호 관리자 등) 에 저장하는 것이 좋습니다
- 키 유출이 의심되면 OpenRouter 백엔드에서 즉시 삭제하고 다시 생성하세요

---

## 관련 리소스

- [OpenRouter 공식 웹사이트](https://openrouter.ai): https://openrouter.ai
- [OpenRouter 모델 목록](https://openrouter.ai/models): https://openrouter.ai/models
- [임시 이메일 서비스](https://tools.cmdragon.cn/zh/apps/temp-email): https://tools.cmdragon.cn/zh/apps/temp-email
- [비밀번호 생성기](https://tools.cmdragon.cn/zh/apps/password-generator): https://tools.cmdragon.cn/zh/apps/password-generator
- [후원 주소](https://tools.cmdragon.cn/zh/sponsor): https://tools.cmdragon.cn/zh/sponsor
- [문의하기](mailto:contact@cmdragon.cn): mailto:contact@cmdragon.cn

---

**튜토리얼 완료!** 이제 구성된 AI 모델을 사용하여 이력서를 최적화하고 편집할 수 있습니다.
