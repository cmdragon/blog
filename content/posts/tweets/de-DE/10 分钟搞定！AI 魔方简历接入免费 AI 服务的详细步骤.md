---
url: /de-DE/posts/07755af00a1779ac0ab6cb087ff3epfl/
title: In 10 Minuten erledigt! Detaillierte Schritte zur Integration kostenloser KI-Dienste in den AI Magic Resume
date: 2026-03-29T07:40:34+08:00
lastmod: 2026-03-29T07:40:34+08:00
author: cmdragon

summary:
  Diese Anleitung führt Sie durch die Konfiguration kostenloser KI-Dienste wie OpenRouter in Ihrem AI Magic Resume.

categories:
  - tweets

tags:
  - AI Magic Resume
  - cmdragon
  - Kostenlose KI-Dienste
  - KI-Dienst konfigurieren
  - API-Schlüssel
  - Tutorial-Ressourcen
  - Online-Tools

---

## Schritt 1: Zugriff auf AI Magic Resume

Öffnen Sie die AI Magic Resume-Website:  
**https://magic-resume.cmdragon.cn/app/dashboard/ai**

Wählen Sie in der linken Navigationsleiste die Option **"AI-Anbieter"**.

![AI-Anbieter auswählen](https://cdn.game-share.store/aBClo3u1L9-mfxakQY_6H.png)

---

## Schritt 2: OpenRouter API-Schlüssel abrufen

### 2.1 Öffnen Sie die OpenRouter-Website (am Beispiel von OpenRouter)

Klicken Sie auf der Konfigurationsseite des KI-Anbieters auf die Schaltfläche **"API-Schlüssel abrufen"**.

![Klicken, um API-Schlüssel zu erhalten](https://cdn.game-share.store/syW9LMwLw0mBa1zn4p7DI.png)

Das System öffnet die offizielle OpenRouter-Website in einem neuen Tab:

![OpenRouter offizielle Website](https://cdn.game-share.store/kJmBIJzNwEna_Dqixs5Gh.png)

### 2.2 Registrieren/Anmelden

- **Bereits ein Konto vorhanden**: Melden Sie sich direkt an
- **Kein Konto vorhanden**: Klicken Sie auf Registrieren

> 💡 **Tipp**
> : Wenn Sie Ihre übliche E-Mail-Adresse nicht verwenden möchten, können Sie unseren [ temporären E-Mail-Dienst](https://tools.cmdragon.cn/zh/apps/temp-email) https://tools.cmdragon.cn/zh/apps/temp-email verwenden (stellen Sie sicher, dass OpenRouter temporäre E-Mails unterstützt).

![Temporärer E-Mail-Dienst](https://cdn.game-share.store/Dn0WKPCb4GJRJzJTViZMl.png)
![Konto registrieren](https://cdn.game-share.store/zGVLipU7YiUpQ8LinfcsJ.png)

### 2.3 API-Schlüssel erstellen

Melden Sie sich an und folgen Sie diesem Pfad:

1. Klicken Sie in der oberen Navigationsleiste auf **"Settings"**
2. Wählen Sie im linken Menü **"API Keys"**
3. Klicken Sie auf die Schaltfläche **"Create API Key"**

![Einstellungen-Seite](https://cdn.game-share.store/lKVZ6Umc3EkhQRowk7O_E.png)
![API-Schlüssel verwalten](https://cdn.game-share.store/B6lzexbzcIwpT6oltMdNr.png)
![API-Schlüssel erstellen](https://cdn.game-share.store/HQT5zxuf-P6VpJmrwRAfE.png)

### 2.4 API-Schlüssel kopieren

- Kopieren Sie die Schlüsselzeichenfolge, die mit `sk-` beginnt
- **Wichtig**: Bitte bewahren Sie diesen Schlüssel sicher auf, der vollständige Schlüssel kann später nicht erneut angezeigt werden

---

## Schritt 3: AI Magic Resume konfigurieren

Zurück auf der AI Magic Resume-Konfigurationsseite füllen Sie die folgenden Informationen aus:

| Feld          | Inhalt                           |
|-------------|--------------------------------|
| **API-Schlüssel** | Der zuvor kopierte Schlüssel, der mit `sk-` beginnt              |
| **Anbietername**   | `openrouter`                   |
| **API-Endpunkt**  | `https://openrouter.ai/api/v1` |
| **Modell-ID**   | Wählen Sie ein kostenloses Modell (siehe nächster Schritt)                   |

![Konfigurationsinformationen ausfüllen](https://cdn.game-share.store/JRme33gZtIKB8x-zxZXw-.png)

---

## Schritt 4: Kostenloses Modell auswählen

### 4.1 Kostenlose Modelle suchen

Geben Sie auf der OpenRouter-Website im Modellsuchfeld **`free`** ein, um alle kostenlosen Modelle zu filtern.

![Kostenlose Modelle suchen](https://cdn.game-share.store/EF-1D1wvVhMMWmtGRXD93.png)

![Modell-ID kopieren](https://cdn.game-share.store/NKIeBOVFdhJUfXZ-SU7j3.png)

### 4.2 Modell-ID kopieren

Wählen Sie ein beliebiges kostenloses Modell aus und kopieren Sie die vollständige ID (Format wie: `google/gemma-3-27b-it:free`).

> ⚠️ **Hinweis**: Kostenlose Modelle haben Nutzungslimits und sind nicht unbegrenzt kostenlos.

---

## Schritt 5: Verwendung beginnen

Nach Abschluss der Konfiguration können Sie das KI-Modell zur Bearbeitung Ihres Lebenslaufs verwenden.

![Konfiguration abgeschlossen](https://cdn.game-share.store/ObI005LhshzPDb6w0qG9W.png)
![Lebenslauf bearbeiten](https://cdn.game-share.store/aDU_mXaziu4vj2te6KWvW.png)
![Bild](https://cdn.game-share.store/RUmsRZYEV-nY4_oswvgaW.png)
![KI-Funktionen anzeigen](https://cdn.game-share.store/hFDK6Na-Fi7gTL2VyMCva.png)
![Erstellte Ergebnisse](https://cdn.game-share.store/7MEWP09NvTPOC0idG4Pz0.png)

## Schritt 6: Lebenslauf exportieren und drucken

### PDF-Lebenslauf exportieren

Klicken Sie auf die Schaltfläche **"Lebenslauf exportieren"**, das System erstellt automatisch eine standardmäßige PDF-Lebenslaufdatei.

![Lebenslauf exportieren](https://cdn.game-share.store/XtOsWjb5TvEadMHFbtgD5.png)

**Exportmethoden**:

- **Server-Export**: PDF-Datei direkt auf dem Server erstellen, um einheitliches Format und schönes Layout zu gewährleisten, nach dem Download sofort verwendbar
  ![Bild](https://cdn.game-share.store/80GzYvsfodwhT4jzExPgs.png)
- **Browser-Druck**: Ruft die native Druckfunktion des Browsers auf, kann an einen Drucker angeschlossen werden, um direkt Papierkopien auszugeben
  ![Bild](https://cdn.game-share.store/v5gj00PLvRkg2Px9RKAEe.png)

**Verwendungsszenarien**:

- 📄 **Elektronische Version**: Zum Online-Einreichen, E-Mail-Versand, WeChat-Freigabe usw.
- 🖨️ **Papierversion**: Für Vorstellungsgespräche, Karrieremessen und andere Offline-Szenarien

**Tipp**: Es wird empfohlen, den PDF-Effekt vor dem Einreichen in der Vorschau anzuzeigen, um sicherzustellen, dass wichtige Informationen wie Kontaktinformationen und Projekterfahrungen vollständig und korrekt sind.

---

## Häufig gestellte Fragen

### Fehlercode 429: Anforderungs-Ratenbegrenzung

Wenn Sie den folgenden Fehler erhalten:

![Ratenbegrenzung](https://cdn.game-share.store/N8XAuxGLIdlIRaeAjkGMN.png)

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

**Fehlerbedeutung**: Das verwendete kostenlose Modell hat das Zugriffsratenlimit erreicht.

**Lösungen**:

1. **Warten und erneut versuchen**: Die Begrenzung für kostenlose Modelle ist vorübergehend, warten Sie normalerweise einige Minuten bis Stunden oder sogar länger.
2. **Modell wechseln**: Versuchen Sie andere kostenlose Modelle
3. **Kostenpflichtiges Modell verwenden**: Entfernen Sie das `:free`-Suffix von der Modell-ID und verwenden Sie die kostenpflichtige Version, erfordert Aufladung
4. **Eigenen API-Schlüssel binden**: Binden Sie Ihren eigenen Google AI Studio API-Schlüssel in den OpenRouter-Einstellungen, um ein unabhängiges Kontingent zu verwenden

---

## Sicherheitshinweise

- **API-Schlüssel sind sensible Informationen**, bitte nicht mit anderen teilen
- Es wird empfohlen, den API-Schlüssel an einem sicheren Ort zu speichern (z. B. Passwort-Manager)
- Wenn Sie einen Schlüsselverlust vermuten, löschen Sie ihn bitte sofort im OpenRouter-Backend und erstellen Sie ihn neu

---

## Verwandte Ressourcen

- [OpenRouter offizielle Website](https://openrouter.ai): https://openrouter.ai
- [OpenRouter Modellliste](https://openrouter.ai/models): https://openrouter.ai/models
- [Temporärer E-Mail-Dienst](https://tools.cmdragon.cn/zh/apps/temp-email): https://tools.cmdragon.cn/zh/apps/temp-email
- [Passwort-Generator](https://tools.cmdragon.cn/zh/apps/password-generator): https://tools.cmdragon.cn/zh/apps/password-generator
- [Spenden-Adresse](https://tools.cmdragon.cn/zh/sponsor): https://tools.cmdragon.cn/zh/sponsor
- [Kontaktieren Sie uns](mailto:contact@cmdragon.cn): mailto:contact@cmdragon.cn

---

**Tutorial abgeschlossen!** Sie können jetzt das konfigurierte KI-Modell verwenden, um Ihren Lebenslauf zu optimieren und zu bearbeiten.
