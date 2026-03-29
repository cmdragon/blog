---
url: /es/posts/07755af00a1779ac0ab6cb087ff3epfl/
title: ¡Listo en 10 minutos! Pasos detallados para conectar AI Magic Resume a servicios de IA gratuitos
date: 2026-03-29T07:40:34+08:00
lastmod: 2026-03-29T07:40:34+08:00
author: cmdragon

summary:
  Este tutorial te guiará para configurar servicios de IA gratuitos como OpenRouter en tu AI Magic Resume.

categories:
  - tweets

tags:
  - AI Magic Resume
  - cmdragon
  - Servicios de IA gratuitos
  - Configurar servicio de IA
  - Clave API
  - Recursos de tutorial
  - Herramientas en línea

---

## Paso 1: Acceder a AI Magic Resume

Abre el sitio web de AI Magic Resume:  
**https://magic-resume.cmdragon.cn/app/dashboard/ai**

Selecciona la opción **"Proveedor de IA"** en la barra de navegación izquierda.

![Seleccionar proveedor de IA](https://cdn-cn.cmdragon.cn/aBClo3u1L9-mfxakQY_6H.png)

---

## Paso 2: Obtener clave API de OpenRouter

### 2.1 Abrir el sitio web de OpenRouter (usando OpenRouter como ejemplo)

En la página de configuración del proveedor de IA, haz clic en el botón **"Obtener clave API"**.

![Haz clic para obtener clave API](https://cdn-cn.cmdragon.cn/syW9LMwLw0mBa1zn4p7DI.png)

El sistema abrirá el sitio web oficial de OpenRouter en una nueva pestaña:

![Sitio web oficial de OpenRouter](https://cdn-cn.cmdragon.cn/kJmBIJzNwEna_Dqixs5Gh.png)

### 2.2 Registrarse/Iniciar sesión

- **Ya tienes cuenta**: Inicia sesión directamente
- **No tienes cuenta**: Haz clic en registrarte

> 💡 **Consejo**
> : Si no quieres usar tu correo electrónico habitual, puedes usar nuestro [servicio de correo electrónico temporal](https://tools.cmdragon.cn/zh/apps/temp-email) https://tools.cmdragon.cn/zh/apps/temp-email (asegúrate de que OpenRouter soporte correo electrónico temporal).

![Servicio de correo electrónico temporal](https://cdn-cn.cmdragon.cn/Dn0WKPCb4GJRJzJTViZMl.png)
![Registrar cuenta](https://cdn-cn.cmdragon.cn/zGVLipU7YiUpQ8LinfcsJ.png)

### 2.3 Crear clave API

Después de iniciar sesión, sigue esta ruta:

1. Haz clic en **"Settings"** en la barra de navegación superior
2. Selecciona **"API Keys"** en el menú izquierdo
3. Haz clic en el botón **"Create API Key"**

![Página de configuración](https://cdn-cn.cmdragon.cn/lKVZ6Umc3EkhQRowk7O_E.png)
![Gestionar claves API](https://cdn-cn.cmdragon.cn/B6lzexbzcIwpT6oltMdNr.png)
![Crear clave API](https://cdn-cn.cmdragon.cn/HQT5zxuf-P6VpJmrwRAfE.png)

### 2.4 Copiar clave API

- Copia la cadena de clave que comienza con `sk-`
- **Importante**: Guarda esta clave de forma segura, no podrás ver la clave completa nuevamente más tarde

---

## Paso 3: Configurar AI Magic Resume

Regresa a la página de configuración de AI Magic Resume y completa la siguiente información:

| Campo          | Contenido                           |
|-------------|--------------------------------|
| **Clave API** | La clave que copiaste que comienza con `sk-`              |
| **Nombre del proveedor**   | `openrouter`                   |
| **Punto final de API**  | `https://openrouter.ai/api/v1` |
| **ID del modelo**   | Selecciona un modelo gratuito (ver siguiente paso)                   |

![Completar información de configuración](https://cdn-cn.cmdragon.cn/JRme33gZtIKB8x-zxZXw-.png)

---

## Paso 4: Seleccionar modelo gratuito

### 4.1 Buscar modelos gratuitos

En el sitio web de OpenRouter, ingresa **`free`** en el cuadro de búsqueda de modelos para filtrar todos los modelos gratuitos.

![Buscar modelos gratuitos](https://cdn-cn.cmdragon.cn/EF-1D1wvVhMMWmtGRXD93.png)

![Copiar ID del modelo](https://cdn-cn.cmdragon.cn/NKIeBOVFdhJUfXZ-SU7j3.png)

### 4.2 Copiar ID del modelo

Selecciona cualquier modelo gratuito y copia su ID completo (formato como: `google/gemma-3-27b-it:free`).

> ⚠️ **Nota**: Los modelos gratuitos tienen límites de uso y no son ilimitados.

---

## Paso 5: Comenzar a usar

Después de completar la configuración, puedes usar el modelo de IA para editar tu currículum.

![Configuración completada](https://cdn-cn.cmdragon.cn/ObI005LhshzPDb6w0qG9W.png)
![Editar currículum](https://cdn-cn.cmdragon.cn/aDU_mXaziu4vj2te6KWvW.png)
![Imagen](https://cdn-cn.cmdragon.cn/RUmsRZYEV-nY4_oswvgaW.png)
![Mostrar funciones de IA](https://cdn-cn.cmdragon.cn/hFDK6Na-Fi7gTL2VyMCva.png)
![Resultados generados](https://cdn-cn.cmdragon.cn/7MEWP09NvTPOC0idG4Pz0.png)

## Paso 6: Exportar e imprimir currículum

### Exportar currículum en PDF

Haz clic en el botón **"Exportar currículum"**, el sistema generará automáticamente un archivo de currículum en formato PDF estándar.

![Exportar currículum](https://cdn-cn.cmdragon.cn/XtOsWjb5TvEadMHFbtgD5.png)

**Métodos de exportación**:

- **Exportación del servidor**: Generar archivo PDF directamente en el servidor, asegurando formato uniforme y diseño hermoso, listo para usar después de descargar
  ![Imagen](https://cdn-cn.cmdragon.cn/80GzYvsfodwhT4jzExPgs.png)
- **Impresión del navegador**: Llama a la función de impresión nativa del navegador, puede conectarse a impresora para imprimir copias en papel directamente
  ![Imagen](https://cdn-cn.cmdragon.cn/v5gj00PLvRkg2Px9RKAEe.png)

**Escenarios de uso**:

- 📄 **Versión electrónica**: Para envío en línea, envío por correo electrónico, compartir en WeChat, etc.
- 🖨️ **Versión en papel**: Para entrevistas, ferias de empleo y otros escenarios sin conexión

**Consejo**: Se recomienda previsualizar el efecto PDF antes de enviar, para asegurar que la información clave como información de contacto y experiencia de proyectos esté completa y precisa.

---

## Preguntas frecuentes

### Código de error 429: Límite de frecuencia de solicitud

Si encuentras el siguiente error:

![Límite de frecuencia](https://cdn-cn.cmdragon.cn/N8XAuxGLIdlIRaeAjkGMN.png)

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

**Significado del error**: El modelo gratuito que se usa ha alcanzado el límite de frecuencia de acceso.

**Soluciones**:

1. **Esperar y reintentar**: El límite para modelos gratuitos es temporal, usualmente espera unos minutos a horas o incluso más.
2. **Cambiar modelo**: Prueba otros modelos gratuitos
3. **Usar modelo de pago**: Elimina el sufijo `:free` del ID del modelo y usa la versión de pago, requiere recarga
4. **Vincular tu propia clave API**: Vincula tu propia clave API de Google AI Studio en la configuración de OpenRouter para usar cuota independiente

---

## Consejos de seguridad

- **La clave API es información sensible**, no la compartas con otros
- Se recomienda guardar la clave API en un lugar seguro (como un administrador de contraseñas)
- Si sospechas fuga de clave, elimínala y vuélvela a crear inmediatamente en el backend de OpenRouter

---

## Recursos relacionados

- [Sitio web oficial de OpenRouter](https://openrouter.ai): https://openrouter.ai
- [Lista de modelos de OpenRouter](https://openrouter.ai/models): https://openrouter.ai/models
- [Servicio de correo electrónico temporal](https://tools.cmdragon.cn/zh/apps/temp-email): https://tools.cmdragon.cn/zh/apps/temp-email
- [Generador de contraseñas](https://tools.cmdragon.cn/zh/apps/password-generator): https://tools.cmdragon.cn/zh/apps/password-generator
- [Dirección de patrocinio](https://tools.cmdragon.cn/zh/sponsor): https://tools.cmdragon.cn/zh/sponsor
- [Contáctanos](mailto:contact@cmdragon.cn): mailto:contact@cmdragon.cn

---

**¡Tutorial completado!** Ahora puedes usar el modelo de IA configurado para optimizar y editar tu currículum.
