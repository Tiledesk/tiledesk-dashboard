# Home module/component analysis (fase 1)

Questo documento sintetizza **logica, flussi e coupling** del componente `HomeComponent` (`src/app/home/home.component.ts`) e del modulo `HomeModule` (`src/app/home/home.module.ts`).

Obiettivo della fase di analisi: preparare la clonazione in un nuovo componente (es. `home2`) e una rifattorizzazione incrementale che **disaccoppi i servizi dal componente**, permettendo di:

- ridurre conflitti di merge con `master`
- limitare regressioni (superficie di cambiamento controllata)
- garantire rollback rapido (sganciare `home2` e ri-agganciare `home`)

---

## Modulo e routing

`HomeModule` registra una singola route:

- `path: ""` → `HomeComponent`

Il modulo dichiara inoltre vari “home-widgets” (componenti figli) usati nel template home (`HomeConvsGraphComponent`, `HomeWhatsappAccountComponent`, `HomeCreateChatbotComponent`, `HomeNewsFeedComponent`, `HomeAnalyticsIndicatorComponent`, `HomeWhatsappAccountWizardComponent`, `HomeCustomizeWidgetComponent`, `HomeCreateTeammateComponent`, `HomeKbComponent`, `HomeCdsComponent`, `HomeGoToChatComponent`).

Implicazione: **HomeComponent è il “composition root” della vista home**, e orchestra sia dati che visibilità dei blocchi UI.

---

## Responsabilità principali del `HomeComponent`

Il componente ha responsabilità multiple, oggi accentrate nello stesso file:

- **Bootstrap**: recupero user/progetto correnti via stream (`auth.user_bs`, `auth.project_bs`) e avvio ascolti.
- **Feature flags / visibilità**: interpreta flag da `AppConfigService` (stringa “public key” con prefissi tipo `PAY`, `ANA`, `APP`, `OPH`, `KNB`, `HPB`, ecc.) e da `BrandService` (branding + toggle “news/documentation”).
- **Permessi**: calcola flag `PERMISSION_TO_*` in base a ruolo e `matchedPermissions` (da `RolesService`).
- **Quote/limiti**: ascolta `quotesService.quotesData$` e calcola percentuali/limiti + banner UI.
- **Preferenze onboarding/dashlets**: legge `project.attributes.dashlets` e `project.attributes.userPreferences` per determinare ordine e visibilità dei blocchi (“child list order” + `display*`).
- **Dati “header”**: carica info su bots/faqKB (usato come “chatbots” nel componente).
- **Side effects**: tracking analytics Segment (`window['analytics']`), uso `localStorage`, navigazioni via `Router`, modali via `NotifyService`, apertura mailto via `window.open`.

Risultato: **alto coupling** fra UI, config, storage, tracking, permessi e dominio “project/quotes”.

---

## Flusso di bootstrap (ordine e dipendenze)

### 1) `ngOnInit()`

Sequenza (in ordine):

1. `getLoggedUser()`
   - si sottoscrive a `auth.user_bs`
   - quando arriva `user`, salva `this.user`
   - side effects: `analytics.identify(...)`
   - side effects: `usersService.getAllUsersOfCurrentProjectAndSaveInStorage()`

2. `getCurrentProjectProjectByIdAndBots()`
   - si sottoscrive a `auth.project_bs`
   - quando arriva `project`, popola:
     - `this.project`, `this.projectId`, `this.projectName`, `this.prjct_name`
     - `this.OPERATING_HOURS_ACTIVE = project.activeOperatingHours`
   - se `projectId` esiste:
     - `displayQuotaSkeleton = true`
     - side effect: `quotesService.requestQuotasUpdate()` (notifica la navbar / trigger refresh quote)
   - chiama:
     - `getProjectById(projectId)` (fetch dettagli + attributes + profile)
     - `getProjectBots()` (carica “faqKb” e li mette in `this.chatbots`)

3. `listenHasChangedProjectFroList()`
   - ascolta `auth.hasChangedProjectFroList$`
   - aggiorna `projectChangedFromList` (usato nella logica skeleton quote)

4. Setup UI/config/tracking:
   - `getBrowserLanguage()`
   - `translateString()` (stringhe UI/modali; non analizzato in dettaglio qui, ma influenza testo modali)
   - `getProjectUser()` (fetch project-user → pubblica ruolo su `UsersService` + set `this.USER_ROLE`)
   - `usersService.getBotsByProjectIdAndSaveInStorage()` (side-effect su storage)
   - `getUserRole()` (subscription a `usersService.project_user_role_bs` per aggiornare `this.USER_ROLE` anche in cambio progetto “al volo”)
   - `getOSCODE()` (feature flags dalla “public key” in config)
   - `checkPromoURL()` (visibilità home banner da config)
   - `getChatUrl()` (config)
   - `getHasOpenBlogKey()` (non analizzato in dettaglio; sembra usare storage)
   - `diplayPopup()` (popup “everything starts here” via storage `dshbrd----hasclosedpopup`)
   - gestione key storage temporanea `swg`

5. Sottoscrizioni runtime:
   - `listenToQuotas()`
   - `listenToProjectUser()`

### 2) `ngAfterViewInit()`

Se non in dev-mode e `window['analytics']` esiste: `analytics.page("Home Page, Home", {})`.

### 3) `ngOnDestroy()`

- completa `unsubscribe$` (usato per `takeUntil` su molte subscription)
- `quotasSubscription.unsubscribe()` (questa subscription **non** usa `takeUntil`)

---

## Stream / sorgenti dati principali

### Auth (user/project)

- **User**: `auth.user_bs` → `getLoggedUser()`
- **Project**: `auth.project_bs` → `getCurrentProjectProjectByIdAndBots()`

Queste due subscription “accendono” gran parte del componente (stato + side effects).

### Ruoli e permessi

- `getProjectUser()` chiama `usersService.getCurrentProjectUser()` e:
  - pubblica ruolo: `usersService.user_role(projectUser[0].role)`
  - set locale: `this.USER_ROLE = projectUser[0].role`
- `getUserRole()` ascolta `usersService.project_user_role_bs` per mantenere `USER_ROLE` aggiornato in casi di cambio progetto “on the fly”.
- `listenToProjectUser()` delega a `rolesService.listenToProjectUserPermissions(unsubscribe$)` e ascolta `rolesService.getUpdateRequestPermission()` per valorizzare una matrice di flag `PERMISSION_TO_*`.

Nota: la logica permessi è duplicata in pattern “owner/admin always true, agent always false, custom roles check matchedPermissions”.

### Quote / limiti

`listenToQuotas()`:

- subscription a `quotesService.quotesData$`
- filtra per `data.projectId === this.projectId`
- aggiorna:
  - limiti: `messages_limit`, `requests_limit`, `email_limit`, `tokens_limit`, `voice_limit_in_sec`, `voice_limit`
  - quote usate: `requests_count`, `messages_count`, `email_count`, `tokens_count`, `voice_count`
  - percentuali: `*_perc = Math.min(100, floor(quote/limit*100))`
  - flags “runnedOut”: `conversationsRunnedOut`, `emailsRunnedOut`, `tokensRunnedOut`, `voiceRunnedOut`
  - skeleton: `displayQuotaSkeleton = false`
  - UI: `quotaResetEndDateLabel = data.slot?.endDate ?? null`

Punti fragili:

- non c’è protezione esplicita da divisione per 0 (se un limit fosse 0/undefined).
- normalizzazione `quote === null` → 0 è fatta solo per alcune quote.

---

## Preferenze UI: dashlets e onboarding

### Dashlets (`project.attributes.dashlets`)

`getDashlet(project_attributes)` setta i boolean:

- `displayAnalyticsConvsGraph`
- `displayAnalyticsIndicators`
- `displayConnectWhatsApp`
- `displayCreateChatbot`
- `displayKnowledgeBase`
- `displayInviteTeammate`
- `displayCustomizeWidget`
- `displayNewsFeed`

### User preferences / onboarding (`project.attributes.userPreferences`)

`getOnbordingPreferences(project_attributes)`:

- `displayKbHeroSection` dipende da `userPreferences.onboarding_type === "kb"`
- setta variabili onboarding:
  - `solution`, `solution_channel`, `use_case`
  - e i corrispettivi `*_for_child`
- in base a combinazioni di queste tre chiavi, ricalcola:
  - `child_list_order` (ordine dei blocchi home)
  - i flag `displayWhatsappAccountWizard`, `displayConnectWhatsApp`, `displayCreateChatbot`, `displayInviteTeammate`, `displayKnowledgeBase`, `displayCustomizeWidget` (e altri)

In assenza di preferenze, usa una configurazione “default” simile a `setDefaultPreferences()`.

Implicazione: il template è molto sensibile a questi flag e all’ordine `child_list_order`.

---

## Feature flags e config environment

### Public key (feature visibility)

`getOSCODE()` e `getKnbValue()` parsano `appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK` (stringa con segmenti `-`):

- `PAY`, `ANA`, `APP`, `OPH`, `HPB`, `KNB` ecc.
- set di flag `isVisiblePay`, `isVisibleANA`, `isVisibleAPP`, `isVisibleOPH`, `isVisibleHomeBanner`, `isVisibleKNB`, ecc.

Nota: parsing “manuale” ripetuto (split + find + split “:”).

### Promo banner

`checkPromoURL()`:

- se config ha chiave `promoBannerUrl`:
  - vuota → `isVisibleHomeBanner = false`
  - non vuota → `isVisibleHomeBanner = true`
- altrimenti `false`

---

## Template: gating principale (alto livello)

Dal template `home.component.html` emergono guardie principali:

- Sezioni quote: `*ngIf="isVisibleQuoteSection && PERMISSION_TO_VIEW_QUOTA_USAGE"` e skeleton `displayQuotaSkeleton`.
- Operating hours: `*ngIf="isVisibleOPH && USER_ROLE !== 'agent'"` + `*ngIf="PERMISSION_TO_VIEW_OP"`.
- Menu dashlets (checkbox) visibile solo per `USER_ROLE !== 'agent'`.

Implicazione: **`USER_ROLE` e `PERMISSION_TO_*` sono centrali** per non “rompere” la UI home.

---

## Inventario dipendenze (coupling diretto nel componente)

Servizi iniettati in `constructor`:

- `AuthService`: user/project stream, cambio progetto.
- `ActivatedRoute`, `Router`: navigazioni + query params (history).
- `UsersService`, `LocalDbService`: project-user, ruolo, bots, storage locale.
- `NotifyService`: modali e publish/notify UI cross-component.
- `TranslateService`: i18n + `getBrowserLang()`.
- `ProjectPlanService`: presente ma non ancora analizzato qui (nel file appare usato per plan/badge/modali).
- `AppConfigService`: config env + feature flags + chat base url.
- `BrandService`: brand tokens e copy (company name, logos, toggle news).
- `FaqKbService`: usato per `getFaqKbByProjectId()` (lista bot/faqkb).
- `LoggerService`: logging.
- `ProjectService`: `getProjectById()` (attributes + profile + trial logic) + update.
- `AppStoreService`: presente ma non ancora analizzato qui (probabile install/uninstall app whatsapp).
- `DepartmentService`: presente ma non ancora analizzato qui.
- `QuotesService`: quote stream + request update.
- `RolesService`: permessi.

Side effects extra-servizi:

- `localStorage` diretto (diversi key pattern).
- `window['analytics']` diretto.
- `window.open('mailto:...')`.
- `Swal` / `swal` (sweetalert2 / sweetalert) per modali.
- accesso DOM via `ViewChild` + `ElementRef` per scroll e blur.

---

## Rischi principali per una clonazione (home → home2)

- **Ordine di inizializzazione**: molte funzioni dipendono implicitamente da `projectId`, `user`, `USER_ROLE`, `profile_name_for_segment`. Cambiare l’ordine può introdurre regressioni “silenziose”.
- **Doppia fonte ruolo**: `getProjectUser()` e `getUserRole()` concorrono a settare `USER_ROLE`; home2 deve mantenere questa semantica (in particolare il caso “change project on the fly” descritto nei commenti).
- **Quote stream non cancellato via `takeUntil`**: in home2 conviene uniformare (o mantenere identico, ma consapevolmente).
- **Feature flags parsing**: errori qui cambiano la visibilità di intere sezioni.
- **Template gating**: piccoli cambi su `PERMISSION_TO_*` cambiano rendering e abilità utente.
- **Side effects**: analytics/modali/storage non sono isolati → difficile testare e facile introdurre duplicazioni.

---

## Proposta di strategia per `home2` (senza ancora implementare)

L’obiettivo è mantenere l’output UI identico e spostare la logica in “facade/services” testabili.

### Step A — clonazione “zero behavior change”

- Creare `Home2Component` copiando template+scss e mantenendo stessi input/output verso child components.
- In routing, aggiungere una route alternativa (feature flag o path dedicato) senza rimuovere home.
- Verificare che `home2` consumi gli stessi stream e setti gli stessi flag (output parity).

### Step B — introdurre una facade (disaccoppiamento)

Creare un servizio (es. `HomeFacade`) che esponga:

- `user$`, `project$`, `projectId$` (derivati da `AuthService`)
- `userRole$` (derivato da `UsersService` + `getCurrentProjectUser()` orchestrato)
- `permissions$` (derivato da `RolesService`)
- `quotesVm$` (view-model per quote: limiti, percentuali, runnedOut, reset label)
- `featureFlags$` (parsing config key)
- `dashletsVm$` + `onboardingVm$` (flag `display*`, `child_list_order`, ecc.)

e lasciare nel componente solo:

- binding al template
- gestione eventi UI (click → navigate / open modal) eventualmente delegati alla facade

### Step C — switch controllato

- Sostituire progressivamente `HomeComponent` con `Home2Component` nella route principale.
- Mantenere un toggle rapido (env flag o remote config) per tornare a `HomeComponent`.

---

## Prossimi punti di analisi (rimasti fuori in questo pass)

Nel file sono presenti ulteriori aree che impattano il flusso ma che vanno analizzate in dettaglio nella prossima iterazione:

- logica WhatsApp/app store install/uninstall/connect (dipende da `AppStoreService`)
- logica KB / widget / operating hours: metodi di navigazione e condizioni “plan/role”
- gestione “news feed”, “CDS”, e ordering completo dei child “child1..child8” nel template
- `translateString()` (copy e chiavi i18n usate nei modali)

