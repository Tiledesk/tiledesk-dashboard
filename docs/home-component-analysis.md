# Analisi HomeComponent — Logica di inizializzazione progetto

## 1. Contesto

`HomeComponent` ([src/app/home/home.component.ts](../src/app/home/home.component.ts)) è il punto di atterraggio dell'applicazione dopo la login. Oltre a renderizzare la dashboard, **contiene al suo interno la logica di bootstrapping del progetto corrente**, rendendosi responsabile di operazioni che non riguardano la UI ma il ciclo di vita dell'intera sessione.

---

## 2. Logica di inizializzazione identificata nel `ngOnInit`

### 2.1 Utente corrente

```ts
this.getLoggedUser()
```
- Sottoscrive `auth.user_bs` (BehaviorSubject globale).
- Chiama `usersService.getAllUsersOfCurrentProjectAndSaveInStorage()` — persiste tutti gli utenti del progetto nello storage locale.
- Invia `analytics.identify()` con i dati utente.

**Problema**: questa operazione è necessaria ovunque ci sia un progetto attivo, non solo nella Home.

---

### 2.2 Progetto corrente + bots

```ts
this.getCurrentProjectProjectByIdAndBots()
```
- Sottoscrive `auth.project_bs` (BehaviorSubject globale).
- Per ogni cambio di progetto esegue:
  - `getProjectById(projectId)` — carica profilo piano, attributi dashlet, preferenze onboarding, trial expired, track group Segment.
  - `getProjectBots()` — carica i chatbot del progetto via `faqKbService`.
  - `quotesService.requestQuotasUpdate()` — notifica la navbar di aggiornare le quote.

**Problema**: il caricamento del piano, del profilo e dei bot è stato accoppiato con la logica di rendering della Home. Qualunque altra pagina che voglia usare queste informazioni è costretta a passare dalla Home.

---

### 2.3 Ruolo utente nel progetto

```ts
this.getProjectUser()
this.getUserRole()
```
- `getProjectUser()` chiama `usersService.getCurrentProjectUser()` (HTTP) e pubblica il ruolo su `usersService.project_user_role_bs`.
- `getUserRole()` si sottoscrive a quel BehaviorSubject e aggiorna `this.USER_ROLE`.

**Problema**: il commento nel codice stesso (`// IS USED TO GET THE PROJECT-USER AND DETERMINE IF THE USER IS AVAILABLE WHEN THE USER ENTER IN HOME`) ammette che questa chiamata viene fatta qui perché la sidebar non fa in tempo. È una dipendenza implicita e fragile.

---

### 2.4 Permessi (Roles Service)

```ts
this.listenToProjectUser()
```
- Chiama `rolesService.listenToProjectUserPermissions(this.unsubscribe$)`.
- Riceve un oggetto `{ role, matchedPermissions }` e imposta **9 flag di permesso** locali (`PERMISSION_TO_VIEW_FLOWS`, `PERMISSION_TO_VIEW_KB`, `PERMISSION_TO_VIEW_ANALYTICS`, ecc.).

**Problema grave**: questi flag sono stati dichiarati come proprietà del componente ma rappresentano autorizzazioni dell'utente corrente per il progetto corrente — uno stato **globale** che viene inizializzato solo se si passa dalla Home.

---

### 2.5 Feature toggle (OSCODE)

```ts
this.getOSCODE()
```
- Legge la chiave pubblica da `appConfigService` e la decodifica per determinare la visibilità di: `PAY`, `ANA`, `APP`, `OPH`, `HPB`, `PPB`, `KNB`, `QIN`.

**Problema**: la decodifica OSCODE si ripete in altri componenti (es. Navbar). Non esiste un servizio centralizzato che esponga questi flag come Observable.

---

### 2.6 Quote / limiti di utilizzo

```ts
this.listenToQuotas()
```
- Sottoscrive `quotesService.quotesData$` e calcola percentuali di utilizzo, flag `conversationsRunnedOut`, `emailsRunnedOut`, `tokensRunnedOut`, `voiceRunnedOut`.

**Problema**: la logica di calcolo percentuali è duplicata nel componente (anche il metodo legacy `getQuotes()` fa la stessa cosa). Dovrebbe vivere nel `QuotesService`.

---

### 2.7 Preferenze onboarding / dashlet

```ts
this.getOnbordingPreferences(project_attributes)
this.getDashlet(project_attributes)
this.setDefaultPreferences()
```
- 8 use-case basati su `(solution × solution_channel × use_case)` determinano quali "dashlet" mostrare e in quale ordine.
- Ogni use-case ripete le stesse 5-6 assegnazioni con valori leggermente diversi.

**Problema**: logica decisionale hardcoded nel componente, non reutilizzabile e difficile da testare.

---

### 2.8 Chiamate side-effect al boot

```ts
this.usersService.getBotsByProjectIdAndSaveInStorage()
this.checkPromoURL()
this.getChatUrl()
this.getHasOpenBlogKey()
this.diplayPopup()
this.getBrowserLanguage()
this.translateString()
this.listenHasChangedProjectFroList()
```

Queste operazioni non hanno nulla a che fare con la renderizzazione della Home ma vengono eseguite solo perché la Home è la "prima pagina" della sessione.

---

## 3. Conseguenze attuali

| Problema | Impatto |
|---|---|
| Avviare il progetto richiede passare dalla Home | Un deep link diretto a `/project/:id/history` non inizializza correttamente il ruolo utente e i permessi |
| `USER_ROLE` e i 9 flag di permesso sono locali al componente | Le stesse guardie devono essere reimplementate in altri componenti |
| `getProjectUser()` viene chiamato sia dalla Home che dalla Sidebar | Duplicazione, race condition potenziale |
| La decodifica OSCODE viene ripetuta | Ogni componente che legge i feature toggle reimplementa il parsing |
| Logica quote nel componente | Non testabile, non condivisibile |
| 8 use-case onboarding hardcoded | Ogni modifica richiede toccare il componente più grande dell'app |

---

## 4. Soluzioni secondo le best practice Angular

### 4.1 `ProjectInitializerService` — bootstrapping del progetto

Creare un servizio `ProjectInitializerService` che centralizzi tutta la logica di avvio del progetto:

```
src/app/core/project-initializer.service.ts
```

Responsabilità:
- Sottoscrizione a `auth.project_bs` e `auth.user_bs`.
- Chiamata a `getProjectById`, `getProjectBots`, `getBotsByProjectIdAndSaveInStorage`.
- `requestQuotasUpdate()`.
- `getAllUsersOfCurrentProjectAndSaveInStorage()`.

Il servizio espone uno stato reattivo (BehaviorSubject o Signal) che indica quando il progetto è stato inizializzato. Un `APP_INITIALIZER` o un `RouteResolver` può bloccare la navigazione fino al completamento.

```ts
// Utilizzo nel routing
{
  path: 'project/:projectid',
  resolve: { project: ProjectResolver },
  children: [...]
}
```

---

### 4.2 `PermissionsService` — stato dei permessi come servizio

Estrarre i 9 flag di permesso in un `PermissionsService` (o estendere `RolesService`):

```ts
// src/app/core/permissions.service.ts
canViewFlows$: Observable<boolean>
canViewKb$: Observable<boolean>
canViewAnalytics$: Observable<boolean>
// ...
```

Il servizio ascolta `rolesService.getUpdateRequestPermission()` e calcola i flag una sola volta. Qualsiasi componente o guard può iniettare `PermissionsService` senza duplicare la logica.

---

### 4.3 `FeatureToggleService` — OSCODE centralizzato

Creare un `FeatureToggleService` che decodifichi la chiave OSCODE una volta sola (idealmente in `APP_INITIALIZER`) ed esponga i flag come proprietà sincrone o Observable:

```ts
// src/app/core/feature-toggle.service.ts
isVisible(flag: 'PAY' | 'ANA' | 'APP' | 'OPH' | 'HPB' | 'PPB' | 'KNB' | 'QIN'): boolean
```

---

### 4.4 `QuotasStateService` — logica quote nel servizio

Spostare il calcolo di percentuali e flag `*RunnedOut` dentro `QuotesService` (o un `QuotasStateService` dedicato):

```ts
// src/app/services/quotas-state.service.ts
quotaState$: Observable<QuotaState>  // { requests_perc, conversationsRunnedOut, ... }
```

`HomeComponent` (e qualunque altro componente) si limita a consumare l'Observable, senza contenere calcoli.

---

### 4.5 `OnboardingPreferencesService` — logica dashlet separata

I 8 use-case onboarding devono diventare una funzione pura in un servizio:

```ts
// src/app/services/onboarding-preferences.service.ts
resolveDashletConfig(solution, channel, useCase): DashletConfig
```

`HomeComponent` chiama il servizio e ottiene la configurazione da applicare al template, senza if-chain annidati.

---

### 4.6 `RouteResolver` per il progetto

Usare un `Resolver` sulla rotta padre `project/:projectid` per garantire che i dati del progetto siano disponibili **prima** che qualsiasi componente figlio venga renderizzato:

```ts
// src/app/core/project.resolver.ts
@Injectable()
export class ProjectResolver implements Resolve<Project> {
  resolve(route: ActivatedRouteSnapshot): Observable<Project> {
    return this.projectService.getProjectById(route.params['projectid']);
  }
}
```

Questo elimina la necessità che la Home (o qualsiasi altra pagina) si faccia carico del caricamento del progetto.

---

## 5. Schema della dipendenza attuale vs. proposta

### Attuale (accoppiato)
```
Login → /projects → /project/:id/home
                         │
                         ├── getLoggedUser()
                         ├── getCurrentProjectProjectByIdAndBots()
                         ├── getProjectUser() → USER_ROLE
                         ├── listenToProjectUser() → 9 PERMISSION flags
                         ├── getOSCODE() → feature toggle
                         ├── listenToQuotas() → quota state
                         └── getOnbordingPreferences() → dashlet config
```

### Proposta (disaccoppiata)
```
Login → APP_INITIALIZER
            └── ProjectInitializerService.init()
                    ├── auth.project_bs  →  ProjectResolver (rotta padre)
                    ├── PermissionsService  →  disponibile ovunque
                    ├── FeatureToggleService  →  disponibile ovunque
                    └── QuotasStateService  →  disponibile ovunque

/project/:id/home  →  HomeComponent (solo UI + dashlet config)
/project/:id/history  →  già funzionante senza passare dalla Home
/project/:id/bots/...  →  già funzionante senza passare dalla Home
```

---

## 6. Priorità di intervento

| Priorità | Azione | Beneficio |
|---|---|---|
| **Alta** | Creare `ProjectResolver` sulla rotta padre | Deep link funzionanti senza passare dalla Home |
| **Alta** | Estrarre permessi in `PermissionsService` | Rimuove le 9 proprietà duplicate dal componente |
| **Media** | Creare `FeatureToggleService` | Rimuove parsing OSCODE duplicato in più componenti |
| **Media** | Spostare logica quote in `QuotasStateService` | Componente snello, logica testabile |
| **Bassa** | `OnboardingPreferencesService` | Migliora manutenibilità degli use-case onboarding |

---

## 7. Nota sul dead code

Il file contiene circa 200 righe di codice commentato (metodi legacy `getProjectQuotes`, `getQuotes`, `listeHasOpenedNavbarQuotasMenu`, tutta la sezione `getVisitorCounter`) che possono essere rimossi in sicurezza per ridurre il cognitive load del componente.
