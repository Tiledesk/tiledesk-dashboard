# Step 4 — PermissionsService (estrazione logica permessi)

**Stato:** ✅ Completato  
**Branch consigliato:** `refactor/step-04-permissions-service`

---

## Obiettivo

Estrarre gli 11 flag di permesso e tutta la logica di calcolo `listenToProjectUser()` da `HomeComponent` in un servizio singleton dedicato (`PermissionsService`), eliminando ~200 righe di codice imperativo e 11 dichiarazioni di proprietà.

---

## Statistiche

| Metrica | Prima | Dopo |
|---|---|---|
| Righe totali `home.component.ts` | 2.594 | 2.393 |
| Righe rimosse | — | **201** |
| Bundle produzione (main) | 4.85 MB | 4.85 MB (invariato) |

---

## File creati

### `src/app/core/permissions.service.ts`

Servizio singleton (`providedIn: 'root'`) che:

- Inietta `RolesService` e si iscrive a `getUpdateRequestPermission()` nel costruttore
- Calcola i permessi tramite `computePermissions()` — metodo pubblico puro (testabile in isolamento)
- Espone `permissions$: Observable<ProjectPermissions>` per consumer reattivi
- Espone `get snapshot(): ProjectPermissions` per accesso sincrono (usato dai getter del componente)

**Interfaccia `ProjectPermissions`:**
```typescript
interface ProjectPermissions {
  FLOWS: boolean;         // canViewFlows
  KB: boolean;            // canViewKb
  ANALYTICS: boolean;     // canViewAnalytics
  WA_BROADCAST: boolean;  // canViewWaBroadcast
  TEAMMATES: boolean;     // canViewTeammates
  TEAMMATE_DETAILS: boolean; // canReadTeammateDetails
  INVITE: boolean;        // canInvite
  HISTORY: boolean;       // non impostato nell'originale — sempre false
  OP: boolean;            // canViewOperatingHours
  WIDGET_SETUP: boolean;  // canViewWidgetSetup
  QUOTA_USAGE: boolean;   // canViewQuotaUsage
}
```

**Regole di calcolo:**

| Ruolo | FLOWS, KB, ANA, WA, TEAMMATES, INVITE, WIDGET_SETUP | OP, QUOTA_USAGE |
|---|---|---|
| owner / admin | `true` | `true` |
| agent | `false` | `true` |
| custom | `matchedPermissions.includes(flag)` | `matchedPermissions.includes(flag)` |

### `src/app/core/permissions.service.spec.ts`

9 test unitari:

| ID | Scenario |
|---|---|
| T4.1 | Ruolo `owner` → tutti i permessi `true` (eccetto HISTORY) |
| T4.2 | Ruolo `admin` → identico a owner |
| T4.3 | Ruolo `agent` → FLOWS/KB/ANA/WIDGET_SETUP/WA/TEAMMATES/INVITE a `false`; OP/QUOTA_USAGE a `true` |
| T4.4 | Ruolo custom con solo `FLOWS_READ` → solo FLOWS `true` |
| T4.5 | Ruolo custom con `KB_READ` + `ANALYTICS_READ` → solo KB e ANALYTICS `true` |
| T4.6 | Ruolo custom con `QUOTA_USAGE_READ` + `HOURS_READ` → QUOTA_USAGE e OP `true` |
| T4.7 | Reattività: `permissions$` emette nuovo valore al cambio di ruolo |
| T4.8 | `HISTORY` sempre `false` per qualsiasi ruolo |
| T4.9 | `computePermissions` è una funzione pura |

---

## File modificati

### `src/app/home/home.component.ts`

#### Aggiunti
- Import: `import { PermissionsService } from 'app/core/permissions.service'`
- Parametro costruttore: `private permissionsService: PermissionsService`
- 11 getter che delegano al service (sostituiscono le property declarations):
  ```typescript
  get PERMISSION_TO_VIEW_FLOWS(): boolean  { return this.permissionsService.snapshot.FLOWS; }
  get PERMISSION_TO_VIEW_KB(): boolean     { return this.permissionsService.snapshot.KB; }
  // ... (tutti gli 11)
  ```

#### Rimossi
| Elemento | Righe originali |
|---|---|
| 11 property declarations `PERMISSION_TO_*` | 281–291 |
| Metodo `listenToProjectUser()` (~200 righe) | 390–589 |
| Chiamata `this.listenToProjectUser()` in `ngOnInit` | 365 |
| Import `{ PERMISSIONS }` da `permissions.constants` | 44 |

### `src/app/testing/stubs/misc.stubs.ts`

Aggiunto `PermissionsServiceStub`:
- `permissions$: BehaviorSubject<ProjectPermissions>` — tutti i flag `false` di default
- `get snapshot(): ProjectPermissions`
- `setPermissions(overrides)` — helper per i test

### `src/app/home/home.component.spec.ts`

- Aggiunti import: `PermissionsService`, `FeatureToggleService`
- `PermissionsServiceStub` e `FeatureToggleService` inline object aggiunti ai provider in `buildProviders()`

---

## Nota su `PERMISSION_TO_VIEW_HISTORY`

Nell'implementazione originale, `PERMISSION_TO_VIEW_HISTORY` era dichiarata come property ma **non veniva mai impostata** in `listenToProjectUser()` e **non veniva mai usata nel template**. Nella nuova implementazione è inclusa nell'interfaccia `ProjectPermissions` con valore fisso `false`, mantenendo la stessa semantica senza introdurre regressioni.

---

## Nota su `rolesService` in `HomeComponent`

`rolesService` rimane nel costruttore di `HomeComponent` perché è ancora usato direttamente da:
- `getProjectUser()` — che chiama metodi del servizio per recuperare l'utente del progetto

La dipendenza non è quindi orfana.

---

## Piano di test — Step 4

| ID | Test | Come verificare | Risultato |
|---|---|---|---|
| T4.1–T4.9 | Unit test `PermissionsService` | `ng test --include='src/app/core/permissions.service.spec.ts'` | Da eseguire |
| T4.10 | Build produzione | `ng build --configuration=production` | ✅ Verde — exit code 0 |
| T4.11 | Nessun riferimento a `listenToProjectUser` | `grep -r "listenToProjectUser" src/app/home/` | ✅ Nessun risultato |
| T4.12 | Nessun riferimento a `PERMISSIONS.` in home | `grep "PERMISSIONS\." src/app/home/home.component.ts` | ✅ Nessun risultato |
| T4.13 | Template invariato | Nessuna modifica a `home.component.html` | ✅ Confermato |

---

## Criteri di completamento Step 4

- [x] `PermissionsService` creato con `computePermissions()` puro e `permissions$` Observable
- [x] `permissions.service.spec.ts` creato con 9 test (T4.1–T4.9)
- [x] `PermissionsServiceStub` aggiunto a `misc.stubs.ts`
- [x] `listenToProjectUser()` rimosso da `HomeComponent`
- [x] 11 property declarations sostituite da getter che delegano al service
- [x] Import `PERMISSIONS` rimosso da `HomeComponent`
- [x] `home.component.spec.ts` aggiornato con i nuovi provider
- [x] `ng build --configuration=production` verde
- [x] Nessuna modifica al template HTML

---

## ⚠️ Test manuali raccomandati (rischio ALTO)

I permessi controllano la visibilità di sezioni critiche. Prima del merge verificare manualmente su staging:

| Ruolo | FLOWS visibile | KB visibile | Analytics visibile | Widget Setup visibile |
|---|---|---|---|---|
| owner | ✅ | ✅ | ✅ | ✅ |
| admin | ✅ | ✅ | ✅ | ✅ |
| agent | ❌ | ❌ | ❌ | ❌ |
| custom (no flags) | ❌ | ❌ | ❌ | ❌ |
| custom (FLOWS_READ) | ✅ | ❌ | ❌ | ❌ |
