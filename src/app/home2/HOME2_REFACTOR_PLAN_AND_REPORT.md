# Home2 refactor plan & report (4 step)

Questo documento è sia:

- un **piano di rifattorizzazione in 4 step**
- un **report di avanzamento** (da aggiornare step-by-step durante l’implementazione)

Vincoli guida (best practices, anti-regressioni):

- **Parità di comportamento**: ogni step deve mantenere invariato il comportamento osservabile (UI/permessi/quote/redirect/modali) salvo bugfix espliciti.
- **Superficie di cambiamento minima**: estrarre logica senza “ripulire tutto” subito.
- **Incrementalità**: piccoli commit (quando richiesto), con verifiche ripetibili.
- **Rollback facile**: niente refactor che renda impossibile tornare al vecchio wiring.

Scope: `src/app/home2/home2.component.ts` (attualmente monolitico) + nuovi servizi/facade dedicati a Home2.

Riferimento analisi: `src/app/home2/HOME_COMPONENT_ANALYSIS.md`.

---

## Step 1 — Introdurre un ViewModel + Facade “read-only” (no behavior change)

### Obiettivo
Centralizzare la costruzione dello stato home in un *single source of truth* (RxJS) senza cambiare template o logica di navigazione.

### Cosa fare
- Creare `Home2Facade` che esponga:
  - **streams base**: `user$`, `project$`, `projectId$`
  - **role$**: ruolo progetto (mantenendo la semantica attuale: doppia sorgente `getCurrentProjectUser()` + `project_user_role_bs`)
  - **permissions$**: oggetto con i flag `PERMISSION_TO_*`
  - **featureFlags$**: `isVisiblePay/isVisibleANA/isVisibleOPH/...` derivati da config
  - **quotesVm$**: `{ limits, used, perc, runnedOut, resetLabel, loading }`
  - **dashletsVm$** e **onboardingVm$**: `{ display*, child_list_order, displayKbHeroSection, ... }`
- Nel `Home2Component`:
  - sostituire gradualmente assignment imperativi con subscription “thin” (o async pipe dove possibile).
  - mantenere l’ordine di init e gli side effect invariati.

### Definition of done
- `Home2Component` continua a renderizzare come prima.
- Stato derivato esposto dalla facade e consumato dal component senza cambiare output.

### Verifica & test plan
- **Smoke manuale (ng serve)**:
  - aprire `project/:projectid/home` con vari ruoli (owner/admin/agent e custom) e verificare:
    - visibilità blocchi (quota banner, operating hours, dashlet menu)
    - dati quota e percentuali
    - banner promo/popup
  - cambio progetto “al volo” e back navigation → `USER_ROLE` aggiornato correttamente (caso commentato nel codice).
- **Regressions checklist**:
  - nessun doppio tracking analytics (page/identify) rispetto a prima
  - nessun doppio fetch quote (una richiesta per cambio progetto)
- **Unit test minimi** (nuovi):
  - test del mapping `quotesVm$` (null → 0, percentuali capped, runnedOut)
  - test parsing feature flags config → boolean

---

## Step 2 — Estrarre “pure logic” in servizi dedicati (quote/flags/preferences)

### Obiettivo
Ridurre la complessità nel component e nella facade spostando logiche *deterministiche* in funzioni pure/utility + services piccoli.

### Cosa fare
- `Home2FeatureFlagsService`
  - parsing robusto della “public key” (no duplicazioni, gestione missing keys)
  - API: `getFlags(config): Home2FeatureFlags`
- `Home2QuotesMapper` (pure function) o `Home2QuotesService` (se serve stato)
  - API: `mapQuotesDataToVm(data, projectId): QuotesVm`
  - gestione safe dei limiti \(0/undefined) per evitare divisione per zero
- `Home2PreferencesService`
  - mapping `project.attributes.dashlets` → display flags
  - mapping `userPreferences` → `child_list_order` + display flags (onboarding use cases)

### Definition of done
- `Home2Facade` diventa principalmente “orchestrator” (compose streams), non contiene logica di mapping complessa.
- `Home2Component` non contiene più parsing/config mapping/quote math.

### Verifica & test plan
- **Unit test**:
  - test esaustivi su:
    - parsing public key (chiavi presenti/assenti, valori T/F, formati inattesi)
    - quotes mapping (null, limit 0, voice quota assente)
    - preferences mapping (dashlets assenti, onboarding_type assente, combinazioni note)
- **Snapshot manuale**:
  - confrontare visibilità sezioni con prima (stessi ruoli/config).

---

## Step 3 — Isolare side-effects e “actions” (routing/modali/storage/analytics)

### Obiettivo
Separare chiaramente:
- **state** (streams/view model)
- **actions** (navigate, open modal, storage writes, tracking)

### Cosa fare
- Creare `Home2ActionsService` (o split per dominio):
  - `Home2NavigationService` (Router)
  - `Home2ModalService` (NotifyService + Swal wrappers)
  - `Home2TrackingService` (Segment calls)
  - `Home2StorageService` (localStorage keys usate in home)
- `Home2Component` chiama solo metodi “actions” (nessun `localStorage` / `window['analytics']` diretto).

### Definition of done
- Nessun accesso diretto in `Home2Component` a:
  - `localStorage`
  - `window['analytics']`
  - `Swal` / `sweetalert` require
- Tutti gli handler UI (click) delegano ad actions service.

### Verifica & test plan
- **Smoke manuale**:
  - clic sui principali CTA (goToSubscription/payment/history/bots/kb/widget/op hours) → navigazione corretta
  - modali owner-only / agent restrictions → copy e condizioni invariati
  - popup close (storage) → persist come prima
- **Unit test** (mock Router/Notify/Tracking):
  - verifica che dato un input/condizione, venga chiamata la navigation/modale corretta.

---

## Step 4 — Stabilizzazione + hardening + deprecazione Home legacy (opzionale)

### Obiettivo
Consolidare, ridurre rischio regressioni future e preparare il “detach/attach” definitivo.

### Cosa fare
- Convertire il component a pattern più reattivo:
  - preferire `async` pipe dove fattibile (riduce leak/subscription)
  - `takeUntilDestroyed` (se Angular versione lo supporta) o pattern uniforme `takeUntil`
- Introdurre “guard rails”:
  - tipi `Home2Vm` e sotto-vm (quotes/flags/permissions)
  - eliminare state duplicato o incoerente (es. `USER_ROLE` vs permission flags)
- Documentare rollback:
  - una riga di routing per tornare a `home` (chiara, tracciabile)

### Definition of done
- Home2 è la home di default, con wiring pulito e test minimi affidabili.
- Possibilità di rollback (routing) immediata e documentata.

### Verifica & test plan
- **Regression suite manuale** (checklist ripetibile):
  - ruoli: owner/admin/agent/custom
  - progetti: trial attivo/scaduto, payment attivo/scaduto, config flags diversi
  - quote: limiti vicini al cap e “runnedOut”
  - cambio progetto on-the-fly
- **CI/local**:
  - build `ng build` (se disponibile) + lint

---

## Report di avanzamento

### Stato attuale
- **Routing**: `project/:projectid/home` carica `Home2Module` ✅
- **Clone**: files duplicati e rinominati ✅
- **Refactor**: Step 1 in corso ✅/⏳

### Log step-by-step

#### Step 1
- **Status**: in_progress
- **Changes**:
  - Aggiunta `Home2Facade` (nuovo file) come facade read-only per esporre `user$`, `project$`, `projectId$`.
  - `Home2Component` ora consuma `home2Facade.user$` e `home2Facade.project$` dentro `getLoggedUser()` e `getCurrentProjectProjectByIdAndBots()` (nessun cambio di side-effect/ordine).
  - Aggiunto `Home2BrandVmService` (nuovo file) per incapsulare il mapping del brand in un view-model.
  - `Home2Component` ora inizializza i campi brand (`company_name`, loghi, `displayNewsAndDocumentation`, `tparams`, `salesEmail`) tramite `Home2BrandVmService` (comportamento invariato).
  - Estesa `Home2Facade` con `projectVm$` (project + id/nome/operatingHours) e aggiornato `Home2Component` per consumarlo in `getCurrentProjectProjectByIdAndBots()` (side-effect invariati).
  - Pulizia iniziale `home2.component.ts`: rimossi import non usati e grandi blocchi di codice commentato (openChat/openChatWindow/debugger), riordinati alcuni import.
  - Pulizia ulteriore `home2.component.ts`: rimossi metodi non usati (`openWindow`, `focusWin`, `listeHasOpenedNavbarQuotasMenu`) e rimossi grandi blocchi legacy/commentati (es. visitor counter), mantenendo invariata la logica usata dal template.
  - Rimossa ulteriore logica legacy non usata: vecchio flow quote `getProjectQuotes()`/`getQuotes()`/`getRunnedOutQuotes()` e metodi di test AppSumo; rimosso anche `presentModalFeautureAvailableFromBPlan()` (non referenziato).
  - Pulizia aggiuntiva: rimossi `ActivatedRoute` e import `Chart` non usati; rimossi campi `countOf*` inutilizzati; rimossi metodi non usati `goToSubscriptionOrOpenModalSubsExpired()` e `getAvailableProjectUsersByProjectId()`.
  - Rimossi metodi di navigazione/debug non usati (static/demo pages, templates/community/projects/history). Ripulito anche il template `home2.component.html` rimuovendo vecchi blocchi di “test buttons” commentati.
  - Rimossi campi e dipendenze non usate da `home2.component.ts` (es. `DepartmentService`, `FaqKb`, `subscription`, `projects`, vari campi legacy non referenziati).
  - Rimossi ulteriori campi/metodi non usati: visitor graph fields (`monthNames/initDay/endDay`), metodi history non referenziati e relativa state, e traduzione `translateInstallWidget()`/`installWidgetText` (non usati dal template).
  - Rimossi campi dichiarati ma non usati legati a header/app list/test (`projectUsers`, `storageBucket`, `baseUrl`, `apps`, `botIdForTestWA`).
  - Disaccoppiata la lettura config/feature flags: aggiunto `Home2ConfigVmService` e aggiornato `Home2Component` per leggere `CHAT_BASE_URL`, `public_Key` e visibilità promo tramite il nuovo service (nessuna modifica attesa al comportamento).
  - Disaccoppiato il brand: `Home2Facade` ora espone `brandVm$` e `Home2Component` inizializza i campi brand tramite la facade (rimossa dipendenza diretta da `BrandService`/`Home2BrandVmService` nel component).
  - Disaccoppiati i permessi: aggiunto `Home2PermissionsVmService` e `Home2Component` ora riceve i flag `PERMISSION_TO_*` da un VM (logica invariata, componente più sottile).
  - Disaccoppiate le quote: aggiunto `Home2QuotesVmService` e `Home2Component` ora mappa `quotesService.quotesData$` in un VM (limiti, percentuali, runnedOut, reset label) mantenendo semantica e UI invariati.
  - Disaccoppiati gli attributi progetto: aggiunto `Home2ProjectAttributesVmService` per mappare `project.attributes.dashlets` e la base `userPreferences` in un VM; il componente applica il VM e mantiene la logica legacy per i casi onboarding complessi (per minimizzare regressioni).
- **Verifiche eseguite**:
  - Typecheck/lint sui file toccati.
  - Compilazione in dev server (ng serve) senza errori TypeScript (nessuna regressione evidente).
  - Build applicazione (`ng build`) completata con successo (solo warning Sass deprecati già presenti).
  - Smoke test manuale (parity) **da eseguire**:
    - Login come **owner/admin/agent** + ruolo custom (se disponibile) e verifica visibilità sezioni in base ai `PERMISSION_TO_*` (Analytics, KB, Flows, Team, Widget setup, quota).
    - Cambio progetto da selettore: verifica che **quote** e **dashlets/onboarding** si aggiornino correttamente e che lo skeleton quota si chiuda.
    - Progetto con `attributes.userPreferences` assente: verifica applicazione default (ordine card + toggle visibilità).
    - Progetto con `attributes.dashlets` presente: verifica che le card mostrate corrispondano alle preferenze.
    - Progetto con profilo voce abilitato/disabilitato: verifica `voice` quota (visibilità + percentuali + runned out).
- **Esito**:
  - OK per build/typecheck. Parità comportamento **attesa**, smoke test manuale **in attesa**.

**Note**:
- In questo step ho volutamente lasciato `AuthService` ancora iniettato nel component (non rimosso) per minimizzare la superficie di cambiamento. Verrà eliminato quando la facade diventerà l’unica sorgente (step successivi).

#### Step 2
- **Status**: pending
- **Changes**:
  - -
- **Verifiche eseguite**:
  - -
- **Esito**:
  - -

#### Step 3
- **Status**: pending
- **Changes**:
  - -
- **Verifiche eseguite**:
  - -
- **Esito**:
  - -

#### Step 4
- **Status**: pending
- **Changes**:
  - -
- **Verifiche eseguite**:
  - -
- **Esito**:
  - -

