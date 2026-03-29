---
url: /nl/posts/07755af00a1779ac0ab6cb087ff3epfl/
title: Klaar in 10 minuten! Gedetailleerde stappen om AI Magic Resume te verbinden met gratis AI-diensten
date: 2026-03-29T07:40:34+08:00
lastmod: 2026-03-29T07:40:34+08:00
author: cmdragon

summary:
  Deze tutorial leidt u door het configureren van gratis AI-diensten zoals OpenRouter in uw AI Magic Resume.

categories:
  - tweets

tags:
  - AI Magic Resume
  - cmdragon
  - Gratis AI-diensten
  - AI-dienst configureren
  - API-sleutel
  - Tutorial-bronnen
  - Online tools

---

## Stap 1: Toegang tot AI Magic Resume

Open de AI Magic Resume-website:  
**https://magic-resume.cmdragon.cn/app/dashboard/ai**

Selecteer de optie **"AI-provider"** in de linkernavigatiebalk.

![AI-provider selecteren](https://cdn-cn.cmdragon.cn/aBClo3u1L9-mfxakQY_6H.png)

---

## Stap 2: OpenRouter API-sleutel verkrijgen

### 2.1 Open de OpenRouter-website (met OpenRouter als voorbeeld)

Klik op de configuratiepagina van de AI-provider op de knop **"API-sleutel verkrijgen"**.

![Klik om API-sleutel te verkrijgen](https://cdn-cn.cmdragon.cn/syW9LMwLw0mBa1zn4p7DI.png)

Het systeem opent de officiële OpenRouter-website in een nieuw tabblad:

![OpenRouter officiële website](https://cdn-cn.cmdragon.cn/kJmBIJzNwEna_Dqixs5Gh.png)

### 2.2 Registreren/Inloggen

- **Heeft u al een account**: Log direct in
- **Nog geen account**: Klik om te registreren

> 💡 **Tip**
> : Als u uw gebruikelijke e-mailadres niet wilt gebruiken, kunt u onze [tijdelijke e-maildienst](https://tools.cmdragon.cn/zh/apps/temp-email) https://tools.cmdragon.cn/zh/apps/temp-email gebruiken (zorg ervoor dat OpenRouter tijdelijke e-mail ondersteunt).

![Tijdelijke e-maildienst](https://cdn-cn.cmdragon.cn/Dn0WKPCb4GJRJzJTViZMl.png)
![Account registreren](https://cdn-cn.cmdragon.cn/zGVLipU7YiUpQ8LinfcsJ.png)

### 2.3 API-sleutel aanmaken

Volg na het inloggen dit pad:

1. Klik op **"Settings"** in de bovenste navigatiebalk
2. Selecteer **"API Keys"** in het linkermenu
3. Klik op de knop **"Create API Key"**

![Instellingenpagina](https://cdn-cn.cmdragon.cn/lKVZ6Umc3EkhQRowk7O_E.png)
![API-sleutels beheren](https://cdn-cn.cmdragon.cn/B6lzexbzcIwpT6oltMdNr.png)
![API-sleutel aanmaken](https://cdn-cn.cmdragon.cn/HQT5zxuf-P6VpJmrwRAfE.png)

### 2.4 API-sleutel kopiëren

- Kopieer de sleutelreeks die begint met `sk-`
- **Belangrijk**: Bewaar deze sleutel veilig, u kunt de volledige sleutel later niet opnieuw bekijken

---

## Stap 3: AI Magic Resume configureren

Ga terug naar de AI Magic Resume-configuratiepagina en vul de volgende informatie in:

| Veld          | Inhoud                           |
|-------------|--------------------------------|
| **API-sleutel** | De sleutel die u hebt gekopieerd en begint met `sk-`              |
| **Providernaam**   | `openrouter`                   |
| **API-eindpunt**  | `https://openrouter.ai/api/v1` |
| **Model-ID**   | Selecteer een gratis model (zie volgende stap)                   |

![Configuratie-informatie invullen](https://cdn-cn.cmdragon.cn/JRme33gZtIKB8x-zxZXw-.png)

---

## Stap 4: Gratis model selecteren

### 4.1 Gratis modellen vinden

Voer op de OpenRouter-website **`free`** in het modelzoekvak in om alle gratis modellen te filteren.

![Gratis modellen zoeken](https://cdn-cn.cmdragon.cn/EF-1D1wvVhMMWmtGRXD93.png)

![Model-ID kopiëren](https://cdn-cn.cmdragon.cn/NKIeBOVFdhJUfXZ-SU7j3.png)

### 4.2 Model-ID kopiëren

Selecteer een gratis model en kopieer de volledige ID (formaat zoals: `google/gemma-3-27b-it:free`).

> ⚠️ **Opmerking**: Gratis modellen hebben gebruikslimieten en zijn niet onbeperkt gratis.

---

## Stap 5: Beginnen met gebruiken

Na het voltooien van de configuratie kunt u het AI-model gebruiken om uw cv te bewerken.

![Configuratie voltooid](https://cdn-cn.cmdragon.cn/ObI005LhshzPDb6w0qG9W.png)
![Cv bewerken](https://cdn-cn.cmdragon.cn/aDU_mXaziu4vj2te6KWvW.png)
![Afbeelding](https://cdn-cn.cmdragon.cn/RUmsRZYEV-nY4_oswvgaW.png)
![AI-functies weergeven](https://cdn-cn.cmdragon.cn/hFDK6Na-Fi7gTL2VyMCva.png)
![Gegenereerde resultaten](https://cdn-cn.cmdragon.cn/7MEWP09NvTPOC0idG4Pz0.png)

## Stap 6: Cv exporteren en afdrukken

### PDF-cv exporteren

Klik op de knop **"Cv exporteren"**, het systeem genereert automatisch een cv-bestand in standaard PDF-formaat.

![Cv exporteren](https://cdn-cn.cmdragon.cn/XtOsWjb5TvEadMHFbtgD5.png)

**Exportmethoden**:

- **Serverexport**: Genereer PDF-bestand direct op de server, zorg voor uniform formaat en mooie lay-out, klaar voor gebruik na downloaden
  ![Afbeelding](https://cdn-cn.cmdragon.cn/80GzYvsfodwhT4jzExPgs.png)
- **Browserafdruk**: Roept de oorspronkelijke afdrukfunctie van de browser op, kan worden verbonden met een printer om direct papieren kopieën uit te voeren
  ![Afbeelding](https://cdn-cn.cmdragon.cn/v5gj00PLvRkg2Px9RKAEe.png)

**Gebruiksscenario's**:

- 📄 **Elektronische versie**: Voor online indiening, e-mailverzending, WeChat-deling, enz.
- 🖨️ **Papieren versie**: Voor sollicitatiegesprekken, banenbeurzen en andere offline scenario's

**Tip**: Het wordt aanbevolen om het PDF-effect vooraf te bekijken voordat u indient, om ervoor te zorgen dat belangrijke informatie zoals contactgegevens en projectervaringen compleet en nauwkeurig zijn.

---

## Veelgestelde vragen

### Foutcode 429: Verzoeksfrequentielimiet

Als u de volgende fout tegenkomt:

![Frequentielimiet](https://cdn-cn.cmdragon.cn/N8XAuxGLIdlIRaeAjkGMN.png)

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

**Foutbetekenis**: Het gebruikte gratis model heeft de toegangsfrequentielimiet bereikt.

**Oplossingen**:

1. **Wachten en opnieuw proberen**: De limiet voor gratis modellen is tijdelijk, wacht meestal een paar minuten tot uren of zelfs langer.
2. **Model wijzigen**: Probeer andere gratis modellen
3. **Betaald model gebruiken**: Verwijder het achtervoegsel `:free` van de model-ID en gebruik de betaalde versie, vereist opladen
4. **Eigen API-sleutel binden**: Bind uw eigen Google AI Studio API-sleutel in OpenRouter-instellingen om onafhankelijk quotum te gebruiken

---

## Beveiligingstips

- **API-sleutel is gevoelige informatie**, deel deze niet met anderen
- Het wordt aanbevolen om de API-sleutel op een veilige plaats te bewaren (zoals een wachtwoordbeheerder)
- Als u vermoedt dat de sleutel is gelekt, verwijder en maak deze dan onmiddellijk opnieuw aan in de OpenRouter-backend

---

## Gerelateerde bronnen

- [OpenRouter officiële website](https://openrouter.ai): https://openrouter.ai
- [OpenRouter-modellenlijst](https://openrouter.ai/models): https://openrouter.ai/models
- [Tijdelijke e-maildienst](https://tools.cmdragon.cn/zh/apps/temp-email): https://tools.cmdragon.cn/zh/apps/temp-email
- [Wachtwoordgenerator](https://tools.cmdragon.cn/zh/apps/password-generator): https://tools.cmdragon.cn/zh/apps/password-generator
- [Sponsoradres](https://tools.cmdragon.cn/zh/sponsor): https://tools.cmdragon.cn/zh/sponsor
- [Neem contact met ons op](mailto:contact@cmdragon.cn): mailto:contact@cmdragon.cn

---

**Tutorial voltooid!** U kunt nu het geconfigureerde AI-model gebruiken om uw cv te optimaliseren en te bewerken.
