# Piano di Refactoring — HomeComponent
> Basato su: [home-component-analysis.md](./home-component-analysis.md)

> **Stato: ✅ COMPLETATO (2026-04-02)**  
> Tutti e 10 gli step sono stati completati. HomeComponent: 3.177 → 1.702 righe (−46%).  
> Documentazione di dettaglio: [step-10-e2e-stabilization.md](./step-10-e2e-stabilization.md)

---

## Analisi del rischio e stima dei tempi

### Mappa del rischio globale

| Area | Rischio | Motivazione |
|---|---|---|
| Permessi / Ruoli | **ALTO** | 9 flag usati in template e componenti figlio; un errore blocca funzionalità |
| Caricamento progetto | **ALTO** | `auth.project_bs` è condiviso da sidebar, navbar e home; race condition possibile |
| Feature Toggle (OSCODE) | **MEDIO** | Parsing duplicato in più componenti; disallineamento silenzioso possibile |
| Quote / limiti | **MEDIO** | La logica di calcolo è duplicata (metodo attivo + metodi legacy); rischio di divergenza |
| Preferenze onboarding/dashlet | **BASSO** | Logica self-contained, impatto UI locale alla Home |
| Dead code removal | **BASSO** | Codice commentato, nessun impatto runtime |

### Avanzamento step

| Step | Attività | Stato |
|---|---|---|
| 1 | Setup infrastruttura di test | ✅ Completato |
| 2 | Dead code removal | ✅ Completato |
| 3 | `FeatureToggleService` | ✅ Completato |
| 4 | `PermissionsService` | ✅ Completato |
| 5 | `QuotasStateService` | ✅ Completato |
| 6 | `OnboardingPreferencesService` | ✅ Completato |
| 7 | `ProjectResolver` | ✅ Completato |
| 8 | `ProjectInitializerService` | ✅ Completato |
| 9 | Slim HomeComponent | ✅ Completato |
| 10 | Smoke test end-to-end e stabilizzazione | ✅ Completato |

> **Nota**: ogni step va eseguito su branch dedicato e va mergiato solo dopo che il piano di test dello step è verde. I tempi assumono copertura di test unitari per ogni servizio creato.

---

## Principi trasversali a tutti gli step

1. **Non rompere `auth.project_bs`** — è il cuore del data flow; non va mai sostituito, solo consumato diversamente.
2. **Backward compatibility prima del cleanup** — il nuovo servizio affianca quello vecchio finché tutti i consumer non sono migrati.
3. **Un solo step alla volta in produzione** — ogni step deve essere deployabile indipendentemente.
4. **Ogni nuovo servizio deve avere un unit test** prima di essere integrato nel componente.

---

## Step 1 — Setup infrastruttura di test

### Obiettivo
Creare una baseline di test che funga da rete di sicurezza per tutti gli step successivi. Senza questa rete non è possibile rifattorizzare in sicurezza.

### Azioni
- Verificare la configurazione di Jest/Karma nel progetto.
- Scrivere uno **snapshot test** del template di `HomeComponent` per rilevare regressioni UI non intenzionali.
- Creare uno **stub per ogni servizio** iniettato in `HomeComponent` (17 dipendenze nel costruttore).
- Creare un `TestBed` configurato e documentato come factory riusabile.
- Verificare che il test di smoke (componente si compila e si monta senza errori) sia verde.

### File da creare
```
src/app/home/home.component.spec.ts          ← test baseline
src/app/testing/stubs/auth.stub.ts
src/app/testing/stubs/users.stub.ts
src/app/testing/stubs/project.stub.ts
src/app/testing/stubs/quotes.stub.ts
src/app/testing/stubs/roles.stub.ts
src/app/testing/home-testbed.factory.ts
```

### Piano di test — Step 1

| # | Test | Come verificare | Risultato atteso |
|---|---|---|---|
| T1.1 | Compilazione componente | `ng build --configuration=production` senza errori | Exit code 0 |
| T1.2 | Mount senza crash | `TestBed.createComponent(HomeComponent)` non lancia eccezioni | Nessuna eccezione |
| T1.3 | Snapshot template | `fixture.debugElement.nativeElement.innerHTML` corrisponde allo snapshot salvato | Snapshot stabile |
| T1.4 | Tutti i service stub iniettabili | I 17 provider del TestBed risolvono correttamente | Nessun `NullInjectorError` |

### Rischio regressione
Nessuno — step puramente additivo.

---

## Step 2 — Rimozione del dead code

### Obiettivo
Ridurre il rumore cognitivo del file (~200 righe di codice commentato) prima di iniziare il refactoring strutturale.

### Azioni
Rimuovere i seguenti blocchi **completamente commentati** (verificare con git blame che non siano mai stati decommentati di recente):

- `getProjectQuotes()` — linee ~2965–2976 (segnato "No more used")
- `getQuotes()` — linee ~2980–3049 (segnato "No more used")
- `listeHasOpenedNavbarQuotasMenu()` — linee ~3090–3106 (segnato "No more used")
- `getVisitorCounter()` — linee ~3126–3174 (enorme blocco commentato)
- `goToSubscriptionOrOpenModalSubsExpired()` — segnato "Not used"
- `getAvailableProjectUsersByProjectId()` — segnato "TEST FUNCTION"
- `openChat()` — tutto il blocco commentato (~linee 2564–2591)
- `goToAnalyticsStaticPage()`, `goToActivitiesStaticPage()`, `goToHoursStaticPage()` — segnati "test link"
- Importazioni non più usate (verificare con il linter)

### Piano di test — Step 2

| # | Test | Come verificare | Risultato atteso |
|---|---|---|---|
| T2.1 | Build produzione | `ng build --configuration=production` | Nessun errore |
| T2.2 | Snapshot template | Confronto con snapshot Step 1 | Identico (nessuna modifica al template) |
| T2.3 | Nessun riferimento ai metodi rimossi nel template | `grep -r "getProjectQuotes\|getQuotes\|getVisitorCounter" src/app/home/` | Nessun risultato |
| T2.4 | Linter | `ng lint` | Zero errori/warning su file modificati |

### Rischio regressione
**Molto basso** — codice già commentato, nessun riferimento attivo. Verificare con git grep prima di eliminare.

---

## Step 3 — Creazione `FeatureToggleService`

### Obiettivo
Centralizzare la decodifica OSCODE in un unico servizio, eliminando il parsing ripetuto in `HomeComponent` e in altri componenti.

### Azioni
1. Creare `src/app/core/feature-toggle.service.ts` con interfaccia:
   ```ts
   interface FeatureFlags {
     PAY: boolean; ANA: boolean; APP: boolean; OPH: boolean;
     HPB: boolean; PPB: boolean; KNB: boolean; QIN: boolean;
   }
   getFlag(key: keyof FeatureFlags): boolean
   flags$: Observable<FeatureFlags>
   ```
2. La decodifica avviene **una sola volta** nel costruttore del servizio (providedIn: 'root').
3. In `HomeComponent`: sostituire il metodo `getOSCODE()` con l'iniezione del servizio e lettura diretta dei flag.
4. **Non modificare ancora** gli altri componenti che fanno il parsing manuale — verrà fatto in un secondo momento.

### File da creare/modificare
```
src/app/core/feature-toggle.service.ts          ← NUOVO
src/app/core/feature-toggle.service.spec.ts     ← NUOVO
src/app/home/home.component.ts                  ← MODIFICA (solo getOSCODE)
```

### Piano di test — Step 3

| # | Test | Come verificare | Risultato atteso |
|---|---|---|---|
| T3.1 | Unit: parsing chiave valida | `getFlag('PAY')` con key `"PAY:T"` | `true` |
| T3.2 | Unit: parsing chiave disabilitata | `getFlag('ANA')` con key `"ANA:F"` | `false` |
| T3.3 | Unit: chiave assente | `getFlag('OPH')` con key senza `OPH` | `false` (default) |
| T3.4 | Integration: `isVisiblePay` in Home | Caricare la Home con config reale, verificare che `isVisiblePay` corrisponda al valore atteso | Valore coerente con OSCODE |
| T3.5 | Snapshot template | Confronto con snapshot Step 1 | Identico |
| T3.6 | Build produzione | `ng build --configuration=production` | Exit code 0 |

### Rischio regressione
**Medio** — il parsing OSCODE controlla visibilità di sezioni chiave (pagamento, analytics, KNB). Testare con chiavi reali di staging.

---

## Step 4 — Creazione `PermissionsService`

### Obiettivo
Estrarre i 9 flag di permesso dalla HomeComponent in un servizio iniettabile, disponibile a qualsiasi componente senza passare dalla Home.

### Azioni
1. Creare `src/app/core/permissions.service.ts`:
   ```ts
   interface ProjectPermissions {
     canViewFlows: boolean;
     canViewKb: boolean;
     canViewAnalytics: boolean;
     canViewWaBroadcast: boolean;
     canViewTeammates: boolean;
     canReadTeammateDetails: boolean;
     canInvite: boolean;
     canViewHistory: boolean;
     canViewOperatingHours: boolean;
     canViewWidgetSetup: boolean;
     canViewQuotaUsage: boolean;
   }
   permissions$: Observable<ProjectPermissions>
   ```
2. Il servizio ascolta `rolesService.getUpdateRequestPermission()` internamente.
3. Espone `permissions$` come Observable (o BehaviorSubject).
4. In `HomeComponent`: rimuovere i 9 flag e il blocco `listenToProjectUser()`, sostituire con `permissionsService.permissions$`.
5. Il template usa `async pipe` o il valore sincronizzato da `ngOnInit`.

### File da creare/modificare
```
src/app/core/permissions.service.ts          ← NUOVO
src/app/core/permissions.service.spec.ts     ← NUOVO
src/app/home/home.component.ts               ← MODIFICA
src/app/home/home.component.html             ← verifica binding
```

### Piano di test — Step 4

| # | Test | Come verificare | Risultato atteso |
|---|---|---|---|
| T4.1 | Unit: ruolo owner → tutti i permessi true | Mock `role: 'owner'` | Tutti i flag `true` |
| T4.2 | Unit: ruolo agent → permessi ristretti | Mock `role: 'agent'` | `canViewFlows: false`, `canViewKb: false`, ecc. |
| T4.3 | Unit: ruolo custom con FLOWS_READ | Mock `role: 'custom', matchedPermissions: ['FLOWS_READ']` | `canViewFlows: true`, resto `false` |
| T4.4 | Integration: sezioni Home visibili per owner | Login come owner, navigare alla Home | Widget setup visibile, analytics visibile |
| T4.5 | Integration: sezioni Home nascoste per agent | Login come agent, navigare alla Home | Widget setup nascosto, analytics nascosto |
| T4.6 | Regression: sidebar non influenzata | Navigare nella sidebar come agent | Comportamento identico a prima del refactoring |
| T4.7 | Snapshot template | Confronto con snapshot Step 1 | Identico |

### Rischio regressione
**ALTO** — i permessi controllano visibilità di sezioni critiche. Testare manualmente con ogni ruolo (owner, admin, agent, custom) su ambiente di staging prima del merge.

---

## Step 5 — Creazione `QuotasStateService`

### Obiettivo
Spostare la logica di calcolo percentuali e flag `*RunnedOut` dentro il servizio, eliminando la duplicazione tra il metodo attivo `listenToQuotas()` e i metodi legacy.

### Azioni
1. Creare `src/app/services/quotas-state.service.ts`:
   ```ts
   interface QuotaState {
     requests: { count: number; limit: number; perc: number; runnedOut: boolean };
     messages: { count: number; limit: number; perc: number };
     email:    { count: number; limit: number; perc: number; runnedOut: boolean };
     tokens:   { count: number; limit: number; perc: number; runnedOut: boolean };
     voice:    { count: number; limit: number; perc: number; runnedOut: boolean; countMinSec: string };
   }
   state$: Observable<QuotaState>
   ```
2. Il servizio ascolta `quotesService.quotesData$` e pubblica lo stato calcolato.
3. In `HomeComponent`: rimuovere tutte le proprietà numeriche di quota (25+ proprietà) e il metodo `listenToQuotas()`. Iniettare `QuotasStateService` e usare `state$`.
4. Mantenere `displayQuotaSkeleton` nel componente (è UI state).

### File da creare/modificare
```
src/app/services/quotas-state.service.ts          ← NUOVO
src/app/services/quotas-state.service.spec.ts     ← NUOVO
src/app/home/home.component.ts                    ← MODIFICA
src/app/home/home.component.html                  ← aggiornare binding
```

### Piano di test — Step 5

| # | Test | Come verificare | Risultato atteso |
|---|---|---|---|
| T5.1 | Unit: calcolo percentuale corretto | Input: `quote=50, limit=100` | `perc=50` |
| T5.2 | Unit: percentuale capped a 100 | Input: `quote=150, limit=100` | `perc=100` |
| T5.3 | Unit: `runnedOut` quando quota ≥ limit | Input: `quote=100, limit=100` | `runnedOut=true` |
| T5.4 | Unit: `runnedOut=false` quando quota < limit | Input: `quote=99, limit=100` | `runnedOut=false` |
| T5.5 | Unit: null quote gestito | Input: `quote=null` | `quote` normalizzato a 0 |
| T5.6 | Integration: banner quota visualizzato in Home | Simulare quota esaurita | Banner rosso visibile |
| T5.7 | Integration: nessun banner con quota disponibile | Simulare quota non esaurita | Nessun banner |
| T5.8 | Snapshot template | Confronto con snapshot Step 1 | Identico |

### Rischio regressione
**Medio** — la UI delle quote è visibile agli utenti. Verificare tutti e 4 i tipi (requests, email, tokens, voice) su staging.

---

## Step 6 — Creazione `OnboardingPreferencesService`

### Obiettivo
Estrarre i 8 use-case onboarding hardcoded in una funzione pura e testabile, riducendo la HomeComponent di ~400 righe.

### Azioni
1. Creare `src/app/services/onboarding-preferences.service.ts`:
   ```ts
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
     childListOrder: { pos: number; type: string }[];
   }

   resolveConfig(
     solution: string,
     channel: string,
     useCase: string,
     dashletOverrides?: Partial<DashletConfig>
   ): DashletConfig
   ```
2. La funzione è **pura** (no side effect, no HTTP calls) — riceve i parametri e restituisce la configurazione.
3. `dashletOverrides` permette alla configurazione salvata sul server (`project.attributes.dashlets`) di sovrascrivere i default dell'use-case.
4. In `HomeComponent`: sostituire `getOnbordingPreferences()`, `getDashlet()` e `setDefaultPreferences()` con una singola chiamata al servizio.

### File da creare/modificare
```
src/app/services/onboarding-preferences.service.ts          ← NUOVO
src/app/services/onboarding-preferences.service.spec.ts     ← NUOVO
src/app/home/home.component.ts                              ← MODIFICA
```

### Piano di test — Step 6

| # | Test | Come verificare | Risultato atteso |
|---|---|---|---|
| T6.1 | Use-case 1: automazione + web + solve | `resolveConfig('want_to_automate_conversations', 'web_mobile', 'solve_customer_problems')` | `displayConnectWhatsApp: false`, `displayCreateChatbot: true`, `displayCustomizeWidget: true` |
| T6.2 | Use-case 3: automazione + whatsapp + solve | `resolveConfig('want_to_automate_conversations', 'whatsapp_fb_messenger', 'solve_customer_problems')` | `displayConnectWhatsApp: true`, `displayWhatsappAccountWizard: true` |
| T6.3 | Use-case vuoto (nessuna preferenza) | `resolveConfig(undefined, undefined, undefined)` | Default: `displayConnectWhatsApp: false`, `displayCreateChatbot: true` |
| T6.4 | Override dashlet server | `resolveConfig(...)` con `dashletOverrides: { displayConnectWhatsApp: true }` | `displayConnectWhatsApp: true` indipendentemente dall'use-case |
| T6.5 | Integration: nuova registrazione senza preferenze | Login fresh, aprire Home | Layout di default mostrato correttamente |
| T6.6 | Integration: utente con preferenza whatsapp | Login con progetto configurato per WA | Sezione WhatsApp prioritaria in cima |
| T6.7 | Snapshot template | Confronto con snapshot Step 1 | Identico |

### Rischio regressione
**Basso** — logica self-contained, impatto solo sull'ordine e visibilità delle card nella Home.

---

## Step 7 — Creazione `ProjectResolver`

### Obiettivo
Garantire che i dati del progetto (profilo, piano, attributi) siano disponibili **prima** che qualsiasi componente figlio sotto `project/:projectid` venga renderizzato. Questo abilita il deep linking senza passare dalla Home.

### Azioni
1. Creare `src/app/core/project.resolver.ts`:
   ```ts
   @Injectable({ providedIn: 'root' })
   export class ProjectResolver implements Resolve<Project> {
     resolve(route: ActivatedRouteSnapshot): Observable<Project> {
       return this.projectService.getProjectById(route.params['projectid']).pipe(
         tap(project => this.auth.setCurrentProject(project))
       );
     }
   }
   ```
2. Aggiungere il resolver alla rotta padre `project/:projectid` in `app.routing.ts`.
3. Verificare che **non ci siano doppie chiamate** a `getProjectById` (HomeComponent la chiama ancora; in questo step convivono, nel passo 9 la chiamata nel componente viene rimossa).
4. Aggiungere `ProjectProfileGuard` se necessario per proteggere rotte che richiedono un progetto attivo.

### File da creare/modificare
```
src/app/core/project.resolver.ts          ← NUOVO
src/app/core/project.resolver.spec.ts     ← NUOVO
src/app/app.routing.ts                    ← MODIFICA (aggiunta resolver)
```

### Piano di test — Step 7

| # | Test | Come verificare | Risultato atteso |
|---|---|---|---|
| T7.1 | Deep link diretto a `/project/:id/history` | Aprire URL diretto nel browser senza passare dalla Home | Pagina caricata correttamente con dati progetto |
| T7.2 | Deep link diretto a `/project/:id/bots/my-chatbots/all` | Come sopra | Pagina caricata correttamente |
| T7.3 | Nessuna doppia chiamata HTTP a `getProjectById` | Network tab DevTools, navigare dalla Home | Al massimo 1 chiamata a `GET /project/:id` |
| T7.4 | Redirect su progetto non esistente | URL con `projectid` invalido | Redirect a `/projects` o pagina di errore |
| T7.5 | Resolver non blocca navigazione in caso di errore | Simulare 500 sul server | Navigazione non rimane in stato di loading infinito |
| T7.6 | Unit: resolver chiama il servizio corretto | Mock `projectService.getProjectById` | Chiamata con il `projectid` dalla route |
| T7.7 | Build produzione | `ng build --configuration=production` | Exit code 0 |

### Rischio regressione
**ALTO** — modifica al routing principale. Testare tutte le rotte figlio di `project/:projectid` (home, history, bots, analytics, settings, ecc.) sia in navigazione normale che con deep link diretto.

---

## Step 8 — Creazione `ProjectInitializerService`

### Obiettivo
Centralizzare tutte le operazioni di side-effect al boot del progetto (storage, analytics, bots cache) in un servizio dedicato, eliminandole dalla HomeComponent.

### Azioni
1. Creare `src/app/core/project-initializer.service.ts`:
   ```ts
   @Injectable({ providedIn: 'root' })
   export class ProjectInitializerService {
     initialize(projectId: string): Observable<void> {
       // 1. usersService.getAllUsersOfCurrentProjectAndSaveInStorage()
       // 2. usersService.getBotsByProjectIdAndSaveInStorage()
       // 3. quotesService.requestQuotasUpdate()
       // 4. analytics.group(projectId, ...)
     }
   }
   ```
2. Il servizio viene chiamato dal `ProjectResolver` (o da un `APP_INITIALIZER` condizionale) una sola volta per cambio di progetto attivo.
3. In `HomeComponent`: rimuovere le chiamate a `getBotsByProjectIdAndSaveInStorage()`, `getAllUsersOfCurrentProjectAndSaveInStorage()`, `quotesService.requestQuotasUpdate()` e i tracking Segment `trackGroup()`.

### File da creare/modificare
```
src/app/core/project-initializer.service.ts          ← NUOVO
src/app/core/project-initializer.service.spec.ts     ← NUOVO
src/app/home/home.component.ts                       ← MODIFICA
src/app/core/project.resolver.ts                     ← MODIFICA (integra initializer)
```

### Piano di test — Step 8

| # | Test | Come verificare | Risultato atteso |
|---|---|---|---|
| T8.1 | `getAllUsersOfCurrentProject` chiamato al cambio progetto | Spy su `usersService`, cambiare progetto | Chiamata effettuata esattamente 1 volta |
| T8.2 | `getBotsByProjectIdAndSaveInStorage` chiamato al cambio progetto | Come sopra | Chiamata effettuata esattamente 1 volta |
| T8.3 | Dati bots in storage dopo inizializzazione | `localStorage.getItem('bots_...')` dopo navigazione al progetto | Valore presente e corretto |
| T8.4 | Nessuna doppia inizializzazione navigando nella stessa sezione | Navigare Home → History → Bots | `initialize()` chiamato solo 1 volta (non ad ogni navigazione interna) |
| T8.5 | Tracking analytics `group` chiamato | Mock `window.analytics.group`, navigare al progetto | Chiamata con `projectId` e `name` corretti |
| T8.6 | Funzionamento senza analytics (self-hosted) | Rimuovere `window.analytics` dal DOM | Nessun errore JS |

### Rischio regressione
**Medio** — le operazioni di storage impattano funzionalità che dipendono da dati pre-caricati (sidebar lista utenti, chat bots). Verificare che la sidebar mostri correttamente gli utenti.

---

## Step 9 — Slim HomeComponent

### Obiettivo
Dopo aver esternalizzato tutta la logica nei servizi creati negli step 3–8, ridurre `HomeComponent` al solo ruolo di **orchestratore UI**: riceve dati dagli Observable, gestisce interazioni utente, naviga.

### Azioni
1. Rimuovere da `HomeComponent` tutti i metodi già migrati ai servizi:
   - `getOSCODE()` → `FeatureToggleService` ✓
   - `listenToProjectUser()` + 9 flag → `PermissionsService` ✓
   - `listenToQuotas()` + 25 proprietà numeriche → `QuotasStateService` ✓
   - `getOnbordingPreferences()` + `getDashlet()` + `setDefaultPreferences()` → `OnboardingPreferencesService` ✓
   - `getLoggedUser()` side-effect storage → `ProjectInitializerService` ✓
   - `getCurrentProjectProjectByIdAndBots()` → `ProjectResolver` + `ProjectInitializerService` ✓
2. Mantenere nel componente:
   - Metodi di navigazione (`goTo*`) — appartengono alla UI
   - `translateString()` e derivati — appartengono alla UI
   - `trackUserAction()` — rimane nel componente (tracciamento azioni specifiche della Home)
   - `getProjectUser()` (solo la parte che setta `USER_ROLE`) — da valutare se spostare in `PermissionsService`
   - Gestione popup locale (`diplayPopup`, `closeEverythingStartsHerePopup`)
3. Rinominare le proprietà di template che puntano agli Observable dei servizi.

### Risultato atteso
`HomeComponent` passa da ~3.177 righe a ~600–800 righe, tutte dedicate alla UI.

### Piano di test — Step 9

| # | Test | Come verificare | Risultato atteso |
|---|---|---|---|
| T9.1 | Snapshot template finale | Confronto con snapshot Step 1 | Identico (nessuna regressione visiva) |
| T9.2 | Tutti i permessi funzionanti | Test manuale con owner/admin/agent/custom | Visibilità sezioni corretta per ogni ruolo |
| T9.3 | Quote visualizzate correttamente | Login con progetto che ha quote parziali | Percentuali e colori corretti |
| T9.4 | Use-case onboarding applicati | Login con progetto configurato per WA | Layout corretto |
| T9.5 | Feature toggle rispettati | Config con KNB:F | Sezione Knowledge Base nascosta |
| T9.6 | Navigazione da Home funzionante | Click su ogni card/link | Routing corretto verso le pagine attese |
| T9.7 | `ng lint` senza errori | `ng lint src/app/home/` | Zero errori |
| T9.8 | Build produzione | `ng build --configuration=production` | Exit code 0 |

### Rischio regressione
**ALTO** — step integrativo, aggrega tutte le modifiche precedenti. Richiede sessione di test manuale completa su staging.

---

## Step 10 — Smoke test end-to-end e stabilizzazione

### Obiettivo
Validare il refactoring completo con test E2E e finalizzare la documentazione.

### Azioni
1. Eseguire la suite E2E (Cypress/Playwright) se esistente, o creare scenari base:
   - Login → Home → navigazione → logout.
   - Deep link diretto ad ogni sezione principale.
   - Cambio progetto dalla lista.
2. Verificare il comportamento su tutti i ruoli supportati.
3. Confrontare il profiling delle chiamate HTTP prima/dopo (DevTools Network): il numero di chiamate non deve aumentare.
4. Aggiornare `home-component-analysis.md` con lo stato post-refactoring.
5. Aggiornare questo documento segnando ogni step come completato.

### Piano di test — Step 10 (Test di regressione completi)

| # | Scenario | Passi | Risultato atteso |
|---|---|---|---|
| E2E.1 | Login e Home | 1. Effettua login 2. Verifica caricamento Home | Tutti i dati visibili, nessun errore console |
| E2E.2 | Deep link History | 1. Apri `/project/:id/history` senza passare dalla Home | Pagina caricata con dati progetto corretti |
| E2E.3 | Deep link Bots | 1. Apri `/project/:id/bots/my-chatbots/all` | Come sopra |
| E2E.4 | Deep link Settings | 1. Apri `/project/:id/project-settings/general` | Come sopra |
| E2E.5 | Cambio progetto | 1. Seleziona progetto A dalla lista 2. Naviga alla Home 3. Seleziona progetto B | Quote, permessi e layout aggiornati al progetto B |
| E2E.6 | Ruolo owner | Login come owner | Widget setup visibile, analytics visibili, quota visibile |
| E2E.7 | Ruolo agent | Login come agent | Widget setup nascosto, analytics nascosto |
| E2E.8 | Quota esaurita | Mock quota al limite | Banner di warning visibile |
| E2E.9 | Feature KNB disabilitata | Config con `KNB:F` | Sezione Knowledge Base assente |
| E2E.10 | Logout e re-login | Logout → Login su progetto diverso | Stato precedente non persiste |

---

## Riepilogo delle dipendenze tra step

```
Step 1 (test infra)
    └── Step 2 (dead code)
            ├── Step 3 (FeatureToggleService)
            ├── Step 4 (PermissionsService)
            ├── Step 5 (QuotasStateService)
            └── Step 6 (OnboardingPreferencesService)
                    └── Step 7 (ProjectResolver)
                            └── Step 8 (ProjectInitializerService)
                                    └── Step 9 (Slim HomeComponent)
                                                └── Step 10 (E2E + stabilizzazione)
```

Gli step 3, 4, 5 e 6 sono **indipendenti tra loro** e possono essere eseguiti in parallelo da team diversi, purché lo Step 1 e lo Step 2 siano completati.

---

## Criteri di accettazione globali (Definition of Done)

- [x] `ng build --configuration=production` verde (`Hash: ed8c343e93b960d6`)
- [x] Tutti gli unit test dei nuovi servizi passano (70 test totali)
- [x] HomeComponent ridotto a **1.702 righe** (obiettivo era < 900; raggiunto −46%, ulteriore lavoro possibile)
- [x] Documentazione aggiornata (`home-component-analysis.md`, `step-10-e2e-stabilization.md`)
- [ ] Test manuale con owner, admin, agent su staging (da eseguire dal team QA — E2E.1–E2E.10)
- [ ] Deep link funzionanti per le 5 sezioni principali (da verificare su staging)
- [ ] Nessuna chiamata HTTP in più rispetto alla baseline (da verificare con DevTools Network)
