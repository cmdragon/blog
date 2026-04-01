---
url: /pt-BR/posts/07755af00a1779ac0ab6cb087ff3epfl/
title: Concluído em 10 minutos! Passos detalhados para conectar o AI Magic Resume a serviços de IA gratuitos
date: 2026-03-29T07:40:34+08:00
lastmod: 2026-03-29T07:40:34+08:00
author: cmdragon

summary:
  Este tutorial irá guiá-lo na configuração de serviços de IA gratuitos como o OpenRouter no seu AI Magic Resume.

categories:
  - tweets

tags:
  - AI Magic Resume
  - cmdragon
  - Serviços de IA gratuitos
  - Configurar serviço de IA
  - Chave API
  - Recursos de tutorial
  - Ferramentas online

---

## Passo 1: Acessar o AI Magic Resume

Abra o site do AI Magic Resume:  
**https://magic-resume.cmdragon.cn/app/dashboard/ai**

Selecione a opção **"Fornecedor de IA"** na barra de navegação esquerda.

![Selecionar fornecedor de IA](https://cdn.game-share.store/aBClo3u1L9-mfxakQY_6H.png)

---

## Passo 2: Obter chave API do OpenRouter

### 2.1 Abrir o site do OpenRouter (usando OpenRouter como exemplo)

Na página de configuração do fornecedor de IA, clique no botão **"Obter chave API"**.

![Clique para obter chave API](https://cdn.game-share.store/syW9LMwLw0mBa1zn4p7DI.png)

O sistema abrirá o site oficial do OpenRouter em uma nova aba:

![Site oficial do OpenRouter](https://cdn.game-share.store/kJmBIJzNwEna_Dqixs5Gh.png)

### 2.2 Registrar/Login

- **Já tem uma conta**: Faça login diretamente
- **Ainda não tem conta**: Clique para registrar

> 💡 **Dica**
> : Se não quiser usar seu e-mail habitual, você pode usar nosso [serviço de e-mail temporário](https://tools.cmdragon.cn/zh/apps/temp-email) https://tools.cmdragon.cn/zh/apps/temp-email (certifique-se de que o OpenRouter suporte e-mail temporário).

![Serviço de e-mail temporário](https://cdn.game-share.store/Dn0WKPCb4GJRJzJTViZMl.png)
![Registrar conta](https://cdn.game-share.store/zGVLipU7YiUpQ8LinfcsJ.png)

### 2.3 Criar chave API

Após fazer login, siga este caminho:

1. Clique em **"Settings"** na barra de navegação superior
2. Selecione **"API Keys"** no menu esquerdo
3. Clique no botão **"Create API Key"**

![Página de configurações](https://cdn.game-share.store/lKVZ6Umc3EkhQRowk7O_E.png)
![Gerenciar chaves API](https://cdn.game-share.store/B6lzexbzcIwpT6oltMdNr.png)
![Criar chave API](https://cdn.game-share.store/HQT5zxuf-P6VpJmrwRAfE.png)

### 2.4 Copiar chave API

- Copie a string da chave que começa com `sk-`
- **Importante**: Guarde esta chave com segurança, você não poderá visualizar a chave completa novamente mais tarde

---

## Passo 3: Configurar o AI Magic Resume

Volte para a página de configuração do AI Magic Resume e preencha as seguintes informações:

| Campo          | Conteúdo                           |
|-------------|--------------------------------|
| **Chave API** | A chave que você copiou e começa com `sk-`              |
| **Nome do fornecedor**   | `openrouter`                   |
| **Endpoint da API**  | `https://openrouter.ai/api/v1` |
| **ID do modelo**   | Selecione um modelo gratuito (veja o próximo passo)                   |

![Preencher informações de configuração](https://cdn.game-share.store/JRme33gZtIKB8x-zxZXw-.png)

---

## Passo 4: Selecionar modelo gratuito

### 4.1 Encontrar modelos gratuitos

No site do OpenRouter, digite **`free`** na caixa de pesquisa de modelos para filtrar todos os modelos gratuitos.

![Pesquisar modelos gratuitos](https://cdn.game-share.store/EF-1D1wvVhMMWmtGRXD93.png)

![Copiar ID do modelo](https://cdn.game-share.store/NKIeBOVFdhJUfXZ-SU7j3.png)

### 4.2 Copiar ID do modelo

Selecione qualquer modelo gratuito e copie seu ID completo (formato como: `google/gemma-3-27b-it:free`).

> ⚠️ **Nota**: Modelos gratuitos têm limites de uso e não são ilimitados.

---

## Passo 5: Começar a usar

Após concluir a configuração, você pode usar o modelo de IA para editar seu currículo.

![Configuração concluída](https://cdn.game-share.store/ObI005LhshzPDb6w0qG9W.png)
![Editar currículo](https://cdn.game-share.store/aDU_mXaziu4vj2te6KWvW.png)
![Imagem](https://cdn.game-share.store/RUmsRZYEV-nY4_oswvgaW.png)
![Exibir recursos de IA](https://cdn.game-share.store/hFDK6Na-Fi7gTL2VyMCva.png)
![Resultados gerados](https://cdn.game-share.store/7MEWP09NvTPOC0idG4Pz0.png)

## Passo 6: Exportar e imprimir currículo

### Exportar currículo em PDF

Clique no botão **"Exportar currículo"**, o sistema gerará automaticamente um arquivo de currículo no formato PDF padrão.

![Exportar currículo](https://cdn.game-share.store/XtOsWjb5TvEadMHFbtgD5.png)

**Métodos de exportação**:

- **Exportação do servidor**: Gerar arquivo PDF diretamente no servidor, garantindo formato uniforme e layout bonito, pronto para uso após download
  ![Imagem](https://cdn.game-share.store/80GzYvsfodwhT4jzExPgs.png)
- **Impressão do navegador**: Chama a função de impressão nativa do navegador, pode conectar à impressora para imprimir cópias em papel diretamente
  ![Imagem](https://cdn.game-share.store/v5gj00PLvRkg2Px9RKAEe.png)

**Cenários de uso**:

- 📄 **Versão eletrônica**: Para envio online, envio por e-mail, compartilhamento no WeChat, etc.
- 🖨️ **Versão em papel**: Para entrevistas, feiras de emprego e outros cenários offline

**Dica**: Recomenda-se visualizar o efeito PDF antes do envio, para garantir que informações importantes como informações de contato e experiências de projetos estejam completas e precisas.

---

## Perguntas frequentes

### Código de erro 429: Limite de taxa de solicitação

Se você encontrar o seguinte erro:

![Limite de taxa](https://cdn.game-share.store/N8XAuxGLIdlIRaeAjkGMN.png)

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

**Significado do erro**: O modelo gratuito sendo usado atingiu o limite de taxa de acesso.

**Soluções**:

1. **Aguardar e tentar novamente**: O limite para modelos gratuitos é temporário, geralmente aguarde alguns minutos a horas ou até mais.
2. **Mudar de modelo**: Tente outros modelos gratuitos
3. **Usar modelo pago**: Remova o sufixo `:free` do ID do modelo e use a versão paga, requer recarga
4. **Vincular sua própria chave API**: Vincule sua própria chave API do Google AI Studio nas configurações do OpenRouter para usar cota independente

---

## Dicas de segurança

- **A chave API é uma informação sensível**, não a compartilhe com outros
- Recomenda-se guardar a chave API em um local seguro (como um gerenciador de senhas)
- Se suspeitar de vazamento de chave, exclua-a e recrie-a imediatamente no backend do OpenRouter

---

## Recursos relacionados

- [Site oficial do OpenRouter](https://openrouter.ai): https://openrouter.ai
- [Lista de modelos do OpenRouter](https://openrouter.ai/models): https://openrouter.ai/models
- [Serviço de e-mail temporário](https://tools.cmdragon.cn/zh/apps/temp-email): https://tools.cmdragon.cn/zh/apps/temp-email
- [Gerador de senhas](https://tools.cmdragon.cn/zh/apps/password-generator): https://tools.cmdragon.cn/zh/apps/password-generator
- [Endereço de patrocínio](https://tools.cmdragon.cn/zh/sponsor): https://tools.cmdragon.cn/zh/sponsor
- [Contate-nos](mailto:contact@cmdragon.cn): mailto:contact@cmdragon.cn

---

**Tutorial concluído!** Agora você pode usar o modelo de IA configurado para otimizar e editar seu currículo.
