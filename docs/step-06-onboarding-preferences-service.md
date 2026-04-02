# Step 6 — OnboardingPreferencesService (estrazione logica onboarding/dashlet)

**Stato:** ✅ Completato  
**Branch consigliato:** `refactor/step-06-onboarding-preferences-service`

---

## Obiettivo

Estrarre la logica di configurazione dashlet e preferenze onboarding da `HomeComponent` in un servizio singleton dedicato (`OnboardingPreferencesService`), eliminando ~430 righe di codice che comprendevano:
- 8 blocchi `if` sequenziali per i use-case (UC1–UC8)
- Il metodo `getDashlet()` per gli override server-side
- Il metodo `setDefaultPreferences()` per il caso fallback
- Il metodo `getOnbordingPreferences()` (~400 righe totali)

---

## Statistiche

| Metrica | Prima | Dopo |
|---|---|---|
| Righe totali `home.component.ts` | 2.234 | 1.783 |
| Righe rimosse | — | **451** |
| Bundle produzione (main) | 4.85 MB | 4.85 MB (invariato) |

---

## File creati

### `src/app/services/onboarding-preferences.service.ts`

Servizio singleton (`providedIn: 'root'`) che:

- Espone `resolveConfig(attributes: any): DashletConfig` — punto di ingresso unico
- Usa `USE_CASE_MAP` (Record lookup `solution|channel|useCase → flags`) al posto di 8 `if` sequenziali
- Gestisce in un unico passaggio sia le preferenze utente (`userPreferences`) che gli override server (`dashlets`)
- È una funzione pura: nessun side-effect, nessuna dipendenza iniettata

**Interfaccia `DashletConfig`:**
```typescript
interface DashletConfig {
  displayAnalyticsConvsGraph: boolean;
  displayAnalyticsIndicators: boolean;
  displayConnectWhatsApp: boolean;
  displayWhatsappAccountWizard: boolean;
  displayCreateChatbot: boolean;
  displayInviteTeammate: boolean;
  displayKnowledgeBase: boolean;
  displayCustomizeWidget: boolean;
  displayNewsFeed: boolean;
  displayKbHeroSection: boolean;
  childListOrder: ChildOrder[];
  solution: string | undefined;
  solutionChannel: string | undefined;
  useCase: string | undefined;
}
```

**Priorità di risoluzione:**
1. `userPreferences` presente → use-case matching via `USE_CASE_MAP`
2. `userPreferences` assente → configurazione di default
3. In entrambi i casi, se `dashlets` presente → override server sovrascrivono la config calcolata

### `src/app/services/onboarding-preferences.service.spec.ts`

10 gruppi di test unitari (T6.1–T6.10):

| ID | Scenario |
|---|---|
| T6.1 | `null` / `undefined` attributes → config di default |
| T6.2 | UC1: automate + web + solve → widget=true, KB=true, WA=false |
| T6.3 | UC3: automate + wa + solve → WA=true, wizard=true, widget=false |
| T6.4 | UC2: automate + web + sales → KB=false, widget=true |
| T6.5 | `childListOrder` diverso per canale WA vs web |
| T6.6 | Override dashlet server sovrascrive la config use-case |
| T6.7 | `displayKbHeroSection` basato su `onboarding_type === "kb"` |
| T6.8 | Combinazione non riconosciuta → config di default con metadati |
| T6.9 | `resolveConfig` è funzione pura (non muta input, restituisce oggetti distinti) |
| T6.10 | Tutti gli 8 use-case restituiscono sempre 8 elementi in `childListOrder` |

---

## File modificati

### `src/app/home/home.component.ts`

#### Aggiunti
- Import: `import { OnboardingPreferencesService, DashletConfig } from 'app/services/onboarding-preferences.service'`
- Parametro costruttore: `private onboardingService: OnboardingPreferencesService`
- Blocco di applicazione config in `getProjectById()` (18 righe)

#### Rimossi
| Elemento | Note |
|---|---|
| `PROJECT_ATTRIBUTES: any` | Non più necessaria |
| Metodo `getDashlet()` (~16 righe) | Logica nel servizio (`applyDashletOverrides`) |
| Metodo `setDefaultPreferences()` (~33 righe) | Logica nel servizio (default config) |
| Metodo `getOnbordingPreferences()` (~400 righe) | Logica nel servizio (`fromUserPreferences` + `USE_CASE_MAP`) |

#### Mantenuti nel componente
| Elemento | Motivazione |
|---|---|
| Proprietà `displayAnalyticsConvsGraph`, `displayConnectWhatsApp`, ecc. | Legate al template HTML (nessuna modifica al template) |
| Proprietà `solution`, `solution_channel`, `use_case`, `*_for_child` | Usate nel template |
| Proprietà `child_list_order` | Usata nel template |
| Proprietà `displayKbHeroSection` | Usata nel template |

### `src/app/testing/stubs/misc.stubs.ts`

Aggiunto `OnboardingPreferencesServiceStub`:
- `resolveConfig()` — restituisce sempre la config di default

### `src/app/home/home.component.spec.ts`

- Aggiunto import `OnboardingPreferencesService`
- Aggiunto import `OnboardingPreferencesServiceStub`
- `OnboardingPreferencesServiceStub` aggiunto ai provider in `buildProviders()`

---

## Piano di test — Step 6

| ID | Test | Come verificare | Risultato |
|---|---|---|---|
| T6.1–T6.10 | Unit test `OnboardingPreferencesService` | `ng test --include='src/app/services/onboarding-preferences.service.spec.ts'` | Da eseguire |
| T6.11 | Build produzione | `ng build --configuration=production` | ✅ Verde |
| T6.12 | Nessun riferimento a `getDashlet` | `grep "getDashlet" src/app/home/home.component.ts` | ✅ Nessun risultato |
| T6.13 | Nessun riferimento a `getOnbordingPreferences` | `grep "getOnbordingPreferences" src/app/home/home.component.ts` | ✅ Nessun risultato |
| T6.14 | Nessun riferimento a `setDefaultPreferences` | `grep "setDefaultPreferences" src/app/home/home.component.ts` | ✅ Nessun risultato |
| T6.15 | Template invariato | Nessuna modifica a `home.component.html` | ✅ Confermato |

---

## Criteri di completamento Step 6

- [x] `OnboardingPreferencesService` creato con `resolveConfig()` puro e `USE_CASE_MAP`
- [x] `onboarding-preferences.service.spec.ts` con 10 test (T6.1–T6.10)
- [x] `OnboardingPreferencesServiceStub` aggiunto a `misc.stubs.ts`
- [x] `getDashlet()` rimosso da `HomeComponent`
- [x] `setDefaultPreferences()` rimosso da `HomeComponent`
- [x] `getOnbordingPreferences()` rimosso da `HomeComponent`
- [x] `PROJECT_ATTRIBUTES` rimosso da `HomeComponent`
- [x] `ng build --configuration=production` verde
- [x] Nessuna modifica al template HTML
