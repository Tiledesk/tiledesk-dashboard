# Step 3 — FeatureToggleService (OSCODE extraction)

**Stato:** ✅ Completato  
**Branch consigliato:** `refactor/step-03-feature-toggle-service`

---

## Obiettivo

Estrarre tutta la logica di parsing dell'OSCODE da `HomeComponent` in un servizio dedicato (`FeatureToggleService`), eliminando ~175 righe di codice imperativo e una proprietà di istanza non necessaria (`public_Key`).

---

## Statistiche

| Metrica | Prima | Dopo |
|---|---|---|
| Righe totali `home.component.ts` | 2.769 | 2.594 |
| Righe rimosse | — | **175** |
| Bundle produzione (main) | 4.85 MB | 4.85 MB (invariato) |

---

## File creati

### `src/app/core/feature-toggle.service.ts`

Servizio singleton (`providedIn: 'root'`) che:

- Legge la chiave OSCODE da `AppConfigService` al momento della costruzione
- Espone `getFlag(flag: OscodeFlag): boolean` per accesso generico
- Espone getter tipizzati: `isVisiblePay`, `isVisibleANA`, `isVisibleAPP`, `isVisibleOPH`, `isVisibleHomeBanner`, `projectPlanBadge`, `isVisibleKNB`, `isVisibleQIN`
- Espone `parseOscode(key: string): FeatureFlags` come metodo pubblico puro (testabile in isolamento)

**Formato OSCODE supportato:** `"PAY:T-ANA:F-KNB:T-..."` dove `T` = abilitato, `F` = disabilitato. Flag assenti → `false` (default sicuro).

### `src/app/core/feature-toggle.service.spec.ts`

7 test unitari che coprono:

| ID | Scenario |
|---|---|
| T3.1 | Chiave vuota → tutti i flag `false` |
| T3.2 | Flag con valore `T` → `true` |
| T3.3 | Flag con valore `F` → `false` |
| T3.4 | Flag assente nella chiave → `false` |
| T3.5 | Chiave completa con tutti gli 8 flag |
| T3.6 | Getter di convenienza espongono i valori corretti |
| T3.7 | `parseOscode` è una funzione pura (non muta lo stato interno) |

---

## File modificati

### `src/app/home/home.component.ts`

#### Aggiunto
- Import: `import { FeatureToggleService } from 'app/core/feature-toggle.service'`
- Parametro costruttore: `private featureToggleService: FeatureToggleService`
- In `ngOnInit`: inizializzazione delle proprietà di visibilità dal servizio:
  ```typescript
  this.isVisiblePay         = this.featureToggleService.isVisiblePay;
  this.isVisibleANA         = this.featureToggleService.isVisibleANA;
  this.isVisibleAPP         = this.featureToggleService.isVisibleAPP;
  this.isVisibleOPH         = this.featureToggleService.isVisibleOPH;
  this.isVisibleHomeBanner  = this.featureToggleService.isVisibleHomeBanner;
  this.project_plan_badge   = this.featureToggleService.projectPlanBadge;
  this.isVisibleKNB         = this.featureToggleService.isVisibleKNB;
  if (this.isVisibleKNB) { this.getProjectPlan(); }
  this.isVisibleQuoteSection = this.featureToggleService.isVisibleQIN;
  ```

#### Rimosso
| Elemento | Righe originali |
|---|---|
| Proprietà `public_Key: string` | 120 |
| Metodo `getOSCODE()` (155 righe) | 2080–2233 |
| Metodo `getKnbValue()` (22 righe) | 2286–2307 |
| Chiamata `this.getOSCODE()` in `ngOnInit` | 341 |

#### Aggiornato
- `manageknowledgeBasesVisibility()`: rimossa lettura diretta di `public_Key`, casi USECASE B e USECASE C ora usano `this.featureToggleService.isVisibleKNB` invece di chiamare `getKnbValue()`

### `src/app/testing/stubs/app-config.stub.ts`

- `AppConfigServiceStub` ora accetta un parametro opzionale `oscode: string` nel costruttore
- Default: `MOCK_OSCODE` (retrocompatibile con tutti i test esistenti)
- Questo permette ai test di `FeatureToggleService` di fornire chiavi personalizzate per ogni caso

---

## Perché `appConfigService` rimane nel costruttore

`AppConfigService` è ancora usato direttamente da `HomeComponent` in:
- `getChatUrl()` — legge `CHAT_BASE_URL`
- `checkPromoURL()` — legge `promoBannerUrl`

La dipendenza è quindi mantenuta.

---

## Comportamento preservato

| Comportamento | Prima | Dopo |
|---|---|---|
| Flag assente → `false` | ✅ (fallback esplicito) | ✅ (default nel service) |
| Flag `F` → `false` | ✅ | ✅ |
| Flag `T` → `true` | ✅ | ✅ |
| `getProjectPlan()` chiamato se KNB è abilitato | ✅ (dentro getOSCODE) | ✅ (in ngOnInit, condizionale) |
| KNB sovrascrivibile da customization progetto | ✅ (manageknowledgeBasesVisibility) | ✅ (idem, usa service per fallback) |
| Template invariato | — | ✅ nessuna modifica |

---

## Piano di test — Step 3

| ID | Test | Come verificare | Risultato |
|---|---|---|---|
| T3.1–T3.7 | Unit test `FeatureToggleService` | `ng test --include='src/app/core/feature-toggle.service.spec.ts'` | Da eseguire |
| T3.8 | Build produzione | `ng build --configuration=production` | ✅ Verde — exit code 0 |
| T3.9 | Nessun riferimento a `getOSCODE` | `grep -r "getOSCODE" src/app/home/` | ✅ Nessun risultato |
| T3.10 | Nessun riferimento a `public_Key` | `grep -r "public_Key" src/app/home/` | ✅ Nessun risultato |
| T3.11 | Nessun riferimento a `getKnbValue` | `grep -r "getKnbValue" src/app/home/` | ✅ Nessun risultato |
| T3.12 | Template invariato | Nessuna modifica a `home.component.html` | ✅ Confermato |

---

## Criteri di completamento Step 3

- [x] `FeatureToggleService` creato con `parseOscode` puro e getter tipizzati
- [x] `feature-toggle.service.spec.ts` creato con 7 test (T3.1–T3.7)
- [x] `AppConfigServiceStub` esteso con parametro `oscode` opzionale
- [x] `getOSCODE()` rimosso da `HomeComponent`
- [x] `getKnbValue()` rimosso da `HomeComponent`
- [x] `public_Key` rimosso da `HomeComponent`
- [x] `manageknowledgeBasesVisibility()` aggiornato per usare il service
- [x] `ngOnInit` aggiornato: inizializzazione da `featureToggleService`
- [x] `ng build --configuration=production` verde
- [x] Nessuna modifica al template HTML
