# Step 5 — QuotasStateService (estrazione logica quote)

**Stato:** ✅ Completato  
**Branch consigliato:** `refactor/step-05-quotas-state-service`

---

## Obiettivo

Estrarre tutta la logica di calcolo delle quote (25+ proprietà, metodo `listenToQuotas()` di ~145 righe) da `HomeComponent` in un servizio singleton dedicato (`QuotasStateService`).

---

## Statistiche

| Metrica | Prima | Dopo |
|---|---|---|
| Righe totali `home.component.ts` | 2.393 | 2.234 |
| Righe rimosse | — | **159** |
| Bundle produzione (main) | 4.85 MB | 4.85 MB (invariato) |

---

## File creati

### `src/app/services/quotas-state.service.ts`

Servizio singleton (`providedIn: 'root'`) che:

- Usa `combineLatest([quotesData$, _projectId$, _voiceEnabled$])` filtrato per `projectId`
- Calcola lo stato delle quote tramite `computeState()` — metodo pubblico puro (testabile)
- Espone `state$: Observable<QuotaState>` per consumer reattivi
- Espone `get snapshot(): QuotaState` per accesso sincrono (usato dai getter del componente)
- Espone `setProjectId(id)`, `setVoiceEnabled(enabled)` per configurazione runtime

**Interfaccia `QuotaState`:**
```typescript
interface QuotaMetric {
  count: number; limit: number; perc: number; runnedOut: boolean;
}
interface QuotaState {
  requests: QuotaMetric;
  messages: { count: number; limit: number; perc: number };  // no runnedOut (come l'originale)
  email: QuotaMetric;
  tokens: QuotaMetric;
  voice: { count: number; countMinSec: string; limit: number; limitInSec: number; perc: number; runnedOut: boolean; };
}
```

**Miglioramenti rispetto all'originale:**
- `runnedOut` è `false` se `limit === 0` (evita false positives con dati non ancora caricati)
- `null` quote normalizzato a `0` tramite `?? 0` invece di if-chain espliciti
- `perc` usa helper `perc(used, limit)` con guard su `limit > 0`
- `secondsToMinutes_seconds()` spostato nel servizio e tipizzato

### `src/app/services/quotas-state.service.spec.ts`

9 test unitari:

| ID | Scenario |
|---|---|
| T5.1 | Calcolo percentuale corretto (`quota=50, limit=100 → perc=50`) |
| T5.2 | Percentuale capped a 100 anche se quota > limit |
| T5.3 | `runnedOut=true` quando `quota >= limit` |
| T5.4 | `runnedOut=false` quando `quota < limit` |
| T5.5 | `quota=null` normalizzato a 0 |
| T5.6 | `voiceRunnedOut` rispetta il flag `voiceEnabled` |
| T5.7 | `state$` emette dopo `setProjectId` con projectId corrispondente |
| T5.8 | `secondsToMinutes_seconds` formatta correttamente |
| T5.9 | Dati di un progetto diverso vengono ignorati |

---

## File modificati

### `src/app/home/home.component.ts`

#### Aggiunti
- Import: `import { QuotasStateService } from 'app/services/quotas-state.service'`
- Parametro costruttore: `private quotasStateService: QuotasStateService`
- 20 getter che delegano a `quotasStateService.snapshot`
- In `ngOnInit`: subscription a `quotasStateService.state$` per impostare `displayQuotaSkeleton = false`
- In `getCurrentProjectProjectByIdAndBots()`: `quotasStateService.setProjectId(this.projectId)`
- In `manageVoiceQuotaVisibility()`: `quotasStateService.setVoiceEnabled(this.diplayVXMLVoiceQuota)`

#### Rimossi
| Elemento | Note |
|---|---|
| `quotasSubscription: Subscription` | Gestita dal servizio |
| 25 property declarations quota (count/perc/limit/runnedOut per 5 tipi) | Sostituite da getter |
| `quotasLimits`, `allQuotas` | Usate solo dentro `listenToQuotas()` |
| Metodo `listenToQuotas()` (~145 righe) | Logica nel servizio |
| Metodo `secondsToMinutes_seconds()` | Spostato nel servizio |
| `if (this.quotasSubscription) { this.quotasSubscription.unsubscribe(); }` in `ngOnDestroy` | Non più necessario |

#### Mantenuti nel componente
| Elemento | Motivazione |
|---|---|
| `diplayVXMLVoiceQuota` | Usato nel template + impostato da `manageVoiceQuotaVisibility()` |
| `displayQuotaSkeleton` | UI state che bridging project-change e data-arrival; impostato `true` dal componente |
| `quotesService` (injection) | `requestQuotasUpdate()` ancora chiamato in `getCurrentProjectProjectByIdAndBots()` |

### `src/app/testing/stubs/misc.stubs.ts`

Aggiunto `QuotasStateServiceStub`:
- `state$: BehaviorSubject<QuotaState>` con valori tutti a zero
- `get snapshot(): QuotaState`
- `setProjectId()`, `setVoiceEnabled()` — no-op
- `secondsToMinutes_seconds()` — implementazione reale
- `setState(overrides)` — helper per i test

### `src/app/home/home.component.spec.ts`

- Aggiunto import `QuotasStateService`
- Aggiunto import `QuotasStateServiceStub`
- `QuotasStateServiceStub` aggiunto ai provider in `buildProviders()`

---

## Piano di test — Step 5

| ID | Test | Come verificare | Risultato |
|---|---|---|---|
| T5.1–T5.9 | Unit test `QuotasStateService` | `ng test --include='src/app/services/quotas-state.service.spec.ts'` | Da eseguire |
| T5.10 | Build produzione | `ng build --configuration=production` | ✅ Verde |
| T5.11 | Nessun riferimento a `listenToQuotas` | `grep "listenToQuotas" src/app/home/home.component.ts` | ✅ Nessun risultato |
| T5.12 | Nessun riferimento a `quotasSubscription` | `grep "quotasSubscription" src/app/home/home.component.ts` | ✅ Nessun risultato |
| T5.13 | Template invariato | Nessuna modifica a `home.component.html` | ✅ Confermato |

---

## Criteri di completamento Step 5

- [x] `QuotasStateService` creato con `computeState()` puro e `state$` Observable
- [x] `quotas-state.service.spec.ts` con 9 test (T5.1–T5.9)
- [x] `QuotasStateServiceStub` aggiunto a `misc.stubs.ts`
- [x] `listenToQuotas()` rimosso da `HomeComponent`
- [x] `secondsToMinutes_seconds()` rimosso da `HomeComponent` (nel servizio)
- [x] 25 property declarations sostituite da getter
- [x] `quotasSubscription` rimosso
- [x] `setProjectId()` e `setVoiceEnabled()` integrati nei punti giusti del componente
- [x] `ng build --configuration=production` verde
- [x] Nessuna modifica al template HTML
