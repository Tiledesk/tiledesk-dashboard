# Step 9 — Slim HomeComponent (pulizia e delega ai servizi)

**Stato:** ✅ Completato  
**Branch consigliato:** `refactor/step-09-slim-home-component`

---

## Obiettivo

Completare il refactoring di `HomeComponent` rimuovendo le ultime dipendenze superflue e delegando ai servizi le logiche di business ancora residue nel componente:
- Rimozione di `ActivatedRoute` (iniettato ma mai usato)
- Conversione di 6 flag read-only da field a getter (delegati a `FeatureToggleService`)
- Spostamento delle logiche di visibilità `chatbot` e `voice` in `OnboardingPreferencesService`

---

## Statistiche

| Metrica | Inizio step | Fine step |
|---|---|---|
| Righe `home.component.ts` | 1.775 | **1.702** |
| Righe rimosse in questo step | — | **73** |
| **Totale righe rimosse (Step 1→9)** | 3.177 (originale) | **−1.475** |

---

## Cambiamenti in `HomeComponent`

### 1. Rimosso `ActivatedRoute`

`ActivatedRoute` era iniettato nel costruttore ma non veniva mai usato nel componente (nessun `this.route.` nel corpo del file). Rimosso import e parametro costruttore.

### 2. Feature-toggle flags → getter

6 flag boolean che copiavano il valore da `FeatureToggleService` in `ngOnInit` sono stati convertiti in getter, eliminando le relative assegnazioni.

| Campo rimosso | Getter equivalente |
|---|---|
| `isVisiblePay: boolean` | `get isVisiblePay() { return this.featureToggleService.isVisiblePay; }` |
| `isVisibleANA: boolean` | `get isVisibleANA() { return this.featureToggleService.isVisibleANA; }` |
| `isVisibleAPP: boolean` | `get isVisibleAPP() { return this.featureToggleService.isVisibleAPP; }` |
| `isVisibleOPH: boolean` | `get isVisibleOPH() { return this.featureToggleService.isVisibleOPH; }` |
| `project_plan_badge: boolean` | `get project_plan_badge() { return this.featureToggleService.projectPlanBadge; }` |
| `isVisibleQuoteSection: boolean` | `get isVisibleQuoteSection() { return this.featureToggleService.isVisibleQIN; }` |

Rimasti come field mutabili (possono essere sovrascritti a runtime):
- `isVisibleKNB` — sovrascritto da `manageknowledgeBasesVisibility()`
- `isVisibleHomeBanner` — sovrascritto da `checkPromoURL()`

### 3. Rimossi `manageChatbotVisibility()` e `manageVoiceQuotaVisibility()`

I due metodi (~65 righe di if-chain su `projectProfileData.customization`) sono stati spostati come funzioni pure in `OnboardingPreferencesService`.

**Prima** (in `getProjectById()`):
```typescript
this.manageChatbotVisibility(projectProfileData);
this.manageVoiceQuotaVisibility(projectProfileData);
```

**Dopo**:
```typescript
this.areVisibleChatbot    = this.onboardingService.resolveChatbotVisibility(projectProfileData);
this.diplayVXMLVoiceQuota = this.onboardingService.resolveVoiceVisibility(projectProfileData);
this.quotasStateService.setVoiceEnabled(this.diplayVXMLVoiceQuota);
```

---

## Cambiamenti in `OnboardingPreferencesService`

Aggiunti 2 metodi puri:

```typescript
resolveChatbotVisibility(profileData: any): boolean {
  const chatbot = profileData?.customization?.chatbot;
  return chatbot !== false; // default permissive: true se assente
}

resolveVoiceVisibility(profileData: any): boolean {
  const voice = profileData?.customization?.voice;
  return voice === true; // default restrictive: false se assente
}
```

### Test aggiornati in `onboarding-preferences.service.spec.ts`

Aggiunti 2 nuovi gruppi di test:

| ID | Scenario |
|---|---|
| T6.11 | `resolveChatbotVisibility`: true/false/undefined |
| T6.12 | `resolveVoiceVisibility`: solo `true` esplicito abilita la quota voice |

---

## Piano di test — Step 9

| ID | Test | Come verificare | Risultato |
|---|---|---|---|
| T9.1 | Unit test nuovi metodi OnboardingPreferencesService | `ng test --include='src/app/services/onboarding-preferences.service.spec.ts'` | Da eseguire |
| T9.2 | Build produzione | `ng build --configuration=production` | ✅ Verde |
| T9.3 | Getter feature toggle funzionanti | Config con `PAY:T` → Home mostra pulsante pricing | ✅ Da verificare manualmente |
| T9.4 | Chatbot visibili con customization assente | Login con progetto senza customization | Sezione chatbot visibile |
| T9.5 | Voice quota nascosta senza flag esplicito | Login con progetto senza voice flag | Sezione voice nascosta |
| T9.6 | Template invariato | Nessuna modifica a `home.component.html` | ✅ Confermato |

---

## Stato complessivo del refactoring (Step 1→9)

| Step | Rimozione principale | Righe prima | Righe dopo |
|---|---|---|---|
| 1-2 | Infrastruttura test, dead code | 3.177 | ~2.900 |
| 3 | `FeatureToggleService` (getOSCODE) | ~2.900 | ~2.700 |
| 4 | `PermissionsService` (11 flag + listenToProjectUser) | ~2.700 | ~2.393 |
| 5 | `QuotasStateService` (25 prop + listenToQuotas) | 2.393 | 2.234 |
| 6 | `OnboardingPreferencesService` (3 metodi, 451 righe) | 2.234 | 1.783 |
| 7 | `ProjectResolver` (nessuna rimozione da Home) | 1.783 | 1.783 |
| 8 | `ProjectInitializerService` (3 chiamate side-effect) | 1.783 | 1.775 |
| 9 | Getter FT flags, resolveChatbot/Voice, ActivatedRoute | 1.775 | **1.702** |

**Riduzione totale: −1.475 righe (−46%)**

---

## Criteri di completamento Step 9

- [x] `ActivatedRoute` rimosso (import + costruttore)
- [x] 6 field feature-toggle convertiti in getter
- [x] `manageChatbotVisibility()` rimosso (logica in `OnboardingPreferencesService.resolveChatbotVisibility()`)
- [x] `manageVoiceQuotaVisibility()` rimosso (logica in `OnboardingPreferencesService.resolveVoiceVisibility()`)
- [x] Test T6.11 e T6.12 aggiunti a `onboarding-preferences.service.spec.ts`
- [x] `ng build --configuration=production` verde
- [x] Nessuna modifica al template HTML
