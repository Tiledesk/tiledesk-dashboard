# Piano + Porting — Metering a crediti (`metering: "credits"`)

> **Per agenti:** usare superpowers:subagent-driven-development o superpowers:executing-plans per eseguire il piano task per task. Gli step usano la sintassi checkbox (`- [ ]`).

**Obiettivo:** sui progetti con `metering: "credits"` disattivare i blocchi numerici di piano (chatbot, teammates, KB, quote di consumo), mostrare il contatore crediti e gestire i rifiuti del server per crediti; per tutti gli altri progetti il comportamento resta identico.

**Architettura:** un'unica fonte di verità (`isCreditsMetering(project)` in `metering.util.ts`) alimentata dal project object fresco di `ProjectPlanService` e dal summary crediti, condivisa tramite `MeteringService` (root). `PricingBaseComponent` espone `isCreditsMetering` a tutte le sue sottoclassi senza cambiare i loro costruttori. Ogni blocco legacy viene **avvolto** in `if (!this.isCreditsMetering) { … }` senza modificarne il contenuto. Il frontend **non** blocca in anticipo per i crediti: blocca il server (403 con `error_code` 13010–13013) e la dashboard gestisce l'errore (alert unico dall'interceptor, niente errori generici duplicati nei componenti).

**Tech stack:** Angular 15 su `X-credits` e `master-STAGE-NEW`, **Angular 14.2.2 su `master-ar-roles`** (TypeScript 4.8.4 su tutti e tre), RxJS, Karma/Jasmine (`ng test`), SweetAlert2, ngx-translate. Le modifiche vanno portate su `master-STAGE-NEW` e `master-ar-roles` (vedi "Branch di destinazione"): il codice nuovo deve quindi compilare anche con Angular 14.

**Regola di lavoro:** nessun commit senza revisione. Prima di ogni `git commit` (o `cherry-pick`) l'agente mostra al titolare i file modificati e il codice nuovo, e attende il via libera.

**Vincolo di compatibilità Angular 14:** non usare API introdotte dopo Angular 14. In concreto: niente `signal`, `computed`, `effect`, `DestroyRef`, `takeUntilDestroyed`, `toSignal` (Angular 16), niente input `required`, niente sintassi `@if` / `@for` nei template, niente `provideHttpClient` né interceptor funzionali (Angular 15), niente `inject()` fuori da un contesto di iniezione. `BehaviorSubject`, servizi `providedIn: 'root'`, interceptor a classe, pipe e componenti `standalone: true` (Angular 14) vanno bene. Il Task 10 prevede la build su entrambe le versioni.

**Branch di lavoro:** `X-credits`  
**Branch sorgente contatore crediti (dashboard):** `features-2611/credits-plan` (merge-base `d0738042`, 120 commit dietro `X-credits`)  
**Riferimento server:** repo locale `tiledesk-server`, branch `features-2611/credits-plan` @ `10d3d126` (2026-11-23)

**Indice**

- [Branch di destinazione](#branch-di-destinazione)
- [In breve](#in-breve)
- [Legenda delle sigle](#legenda-delle-sigle)
- [Vincoli globali](#vincoli-globali)
- [Decisioni](#decisioni)
- [Contratto server (da `tiledesk-server` locale)](#contratto-server-da-tiledesk-server-locale)
- [Stato attuale dashboard (mappa dei blocchi)](#stato-attuale-dashboard-mappa-dei-blocchi)
- [Decisioni globali (risposte del 2026-11-24)](#decisioni-globali-risposte-del-2026-11-24)
- [Punti con gating per piano (codici G1…G23)](#punti-con-gating-per-piano-codici-g1g23)
- [Struttura dei file](#struttura-dei-file)
- [Task 1: Port completo di `features-2611/credits-plan`](#task-1-port-completo-di-features-2611credits-plan)
- [Verifiche lato server (da fare con il backend)](#verifiche-lato-server-da-fare-con-il-backend)
- [Task 2: Helper puri + tipi crediti](#task-2-helper-puri--tipi-crediti)
- [Task 3: `MeteringService`, `ProjectPlanService` e interceptor](#task-3-meteringservice-projectplanservice-e-interceptor)
- [Task 4: `PricingBaseComponent`](#task-4-pricingbasecomponent)
- [Componenti che calcolano i limiti da soli](#componenti-che-calcolano-i-limiti-da-soli)
- [Pattern per i Task 5–8](#pattern-per-i-task-58)
- [Task 5: Chatbot](#task-5-chatbot)
- [Task 6: Teammates](#task-6-teammates)
- [Task 7: Knowledge base](#task-7-knowledge-base)
- [Task 8: Quote di consumo (navbar + Home)](#task-8-quote-di-consumo-navbar--home)
- [Task 9: `localStorage` e `project_bs`](#task-9-localstorage-e-project_bs)
- [Task 10: Verifica finale](#task-10-verifica-finale)
- [Task 11: Feature gating per piano](#task-11-feature-gating-per-piano)
- [Porting su altri branch](#porting-su-altri-branch)
- [Log di porting](#log-di-porting)

## Branch di destinazione

Le modifiche si sviluppano su `X-credits` e poi si portano su due branch. Stato verificato con `git` il 2026-11-24:

Stato verificato con `git` il 2026-11-24. `X-credits` è stato creato da `master` il 2026-11-23 e oggi punta allo stesso commit (`cb78a57b2`): i due nomi indicano lo stesso codice.

| Branch | Ruolo | Angular | Contatore crediti (7 commit di `features-2611/credits-plan`) | Footer | Relazione con `master` |
|--------|-------|---------|------|--------|-------------------------|
| `master` | Base da cui è stato staccato `X-credits` | 15.2.10 | Assente (`features-2611/credits-plan` non è antenato di `master`) | `<app-footer>` commentato in `app.component.html` | — |
| `X-credits` | Branch di sviluppo | 15.2.10 | Da portare (Task 1) | `<app-footer>` commentato | Coincide con `master` (stesso commit `cb78a57b2`) |
| `master-STAGE-NEW` | Branch di stage | 15.2.10 | **Già presenti**: tutti e 7 i commit sono antenati del branch; esistono `src/app/credits/`, `credits.service.ts`, la route e il menu in navbar | `<app-footer>` commentato | merge-base con `master` `0fda33ea7` (2026-11-18): 8 commit solo su `master`, 417 solo su `master-STAGE-NEW` |
| `master-ar-roles` | Branch con Angular 14 | **14.2.2** | **Assenti**: nessun commit, nessun file `src/app/credits/` né `credits.service.ts` | `<app-footer>` commentato (come gli altri) | merge-base con `master` `c33b5f498` (2026-02-25): 567 commit solo su `master`, 111 solo su `master-ar-roles` |

Conseguenze per il porting:

- **`master-STAGE-NEW`:** il Task 1 non serve. Prima di cominciare confrontare `credits.service.ts`, `credits-store.service.ts` e la navbar con la versione di `X-credits` dopo il Task 1, perché il branch ha già 417 commit di storia propria e le righe citate nel piano non corrispondono. Applicare i Task 2-9 e 11 cercando i punti per nome di funzione.
- **`master-ar-roles`: merge chirurgico, non un merge di `master`.** Decisione del 2026-11-24: su `master-ar-roles` si porta **solo** la parte crediti e le modifiche fatte dopo l'esecuzione del piano, niente altro di `master` (567 commit non presenti lì, e Angular 14). Cosa si porta, in questo ordine:
  1. i 7 commit del contatore crediti (Task 1), con `git cherry-pick -x`;
  2. i commit di `X-credits` dei Task 2-9 e 11 (metering, `MeteringService`, `PricingBaseComponent`, chatbot, teammates, KB, quote, `localStorage`, gating), con `git cherry-pick -x`, nell'ordine del log di porting.
  
  Si lavora su un branch di appoggio staccato da `master-ar-roles` (nome da concordare, per esempio `master-ar-roles-fix/credits-metering`) e non direttamente su `master-ar-roles`. Verifica fatta con `git`: dei 27 file dei 7 commit, **16 non esistono su `master-ar-roles`** (cartella `src/app/credits/` e servizi collegati, arrivano puliti) e **9 sono stati modificati anche lì** e andranno risolti a mano: `app.routing.ts`, `components.module.ts`, `navbar.component.html`, `navbar.component.ts`, `modal-preview-settings.component.ts`, `util.ts`, `navbar-quotas-usage-menu.scss`, `en.json`, `it.json`. I commit dei Task 2-11 vanno controllati a parte, perché toccano molti componenti che su `master-ar-roles` sono molto diversi: i Task vanno applicati cercando i punti per nome di funzione. Dopo il port, build con Angular 14 (Task 10). Non riportare modifiche di `master` non legate ai crediti.
- **Come ottenere il contatore su `X-credits` (Task 1).** Simulazione fatta il 2026-11-24 con `git merge-tree`, senza toccare il working tree:
  - **Cherry-pick dei 7 commit** (scelta del piano): i 7 commit toccano 27 file; 7 di questi sono stati modificati anche su `X-credits` dopo il merge-base `d0738042`: `app.routing.ts`, `navbar.component.ts`, `modal-preview-settings.component.ts`, `integration.service.ts`, `util.ts`, `en.json`, `it.json` (gli stessi della tabella del Task 1). Gli altri 20 file sono nuovi o non toccati da `X-credits`. Conflitti attesi: su 7 file, da risolvere a mano.
  - **Merge di `master-STAGE-NEW` in `X-credits`:** 18 file in conflitto (`CHANGELOG.md`, `package.json`, `package-lock.json`, `integrations.component.ts`, `ws-requests-msgs.module.ts` e 13 file i18n) e ingresso di 417 commit non legati ai crediti.
  - **Fonte del contatore:** la punta di `features-2611/credits-plan` (`f168fbc1a`) è antenata di `master-STAGE-NEW` e non ci sono commit successivi su `src/app/credits` né su `credits.service.ts`. Le due fonti coincidono: quando i Task 2-11 saranno portati su `master-STAGE-NEW`, il Task 1 è già lì.
  - **Scelta:** cherry-pick dei 7 commit (come da piano).
- **Footer:** su tutti e tre i branch `<app-footer>` è commentato in `app.component.html` (blocco `*ngIf="isMaps('maps')"` commentato). Il componente `FooterComponent` esiste ancora ma non viene renderizzato. Il testo "Need help? write to" (`NeedHelpWriteTo`) è quindi codice morto anche su `master-ar-roles`. G5 non richiede azioni su nessun branch.

## In breve

Cosa cambia in dashboard con `metering: "credits"`:

- **Riconoscimento:** un progetto è a crediti solo se `project.metering === 'credits'`. Chiave assente o `'quotes'` = comportamento di oggi, invariato.
- **Limiti numerici:** su credits spariscono i limiti di piano su chatbot, teammates, namespace e contenuti KB, e le quote di consumo (Task 4-8).
- **Contatore crediti:** si porta da `features-2611/credits-plan` (7 commit, Task 1) e sostituisce il menu "Current usage" nella navbar.
- **Crediti finiti:** non blocca la dashboard in anticipo. Blocca il server con un 403 (codici 13010-13013) e la dashboard mostra un alert unico che porta alla pagina `/credits` (Task 3).
- **Feature per piano:** su credits sono sbloccate su ogni piano. Restano solo Custom message retention, ruoli custom e Smart Assignment (tabella dei punti con gating, Task 11).
- **Trial legacy scaduto:** su credits non si rimanda più alla pricing né si bloccano le route (G1-G4).
- **Escluso, nessuna migrazione:** i progetti Plus e Business esistenti restano come sono. Business non è più selezionabile né creabile in pricing. `home_old` è eliminato (2026-11-24).
- **Dati del progetto:** `metering` arriva dal server con `GET /projects/:id` e `GET /projects/`. Va riallineato in `localStorage` e `project_bs` (Task 9), perché i progetti appena creati non lo hanno.

## Legenda delle sigle

| Sigla | Significato | Dove si trova |
|-------|-------------|---------------|
| 1-5 e A-E | Decisioni di impostazione del piano (chiave assente, UI credits, blocco a crediti esauriti, fonte di `metering`, `home_old`, gating per piano, commit LLM, definizione di "crediti finiti", blocchi preventivi, summary non caricato) | Sezione "Decisioni" |
| GL-1 … GL-5 | Decisioni globali del 2026-11-24: Copilot (GL-1), piano Business (GL-2), piano Plus (GL-3), trial legacy scaduto (GL-4), blocco 13012 del server (GL-5) | Sezione "Decisioni globali" |
| GL-6 | Regola: su credits tutte le feature legate al piano sono sbloccate su ogni piano | Sezione "Decisioni globali", "Regole per i progetti credits" |
| GL-7 | Regola: su credits restano Custom solo message retention, ruoli custom e Smart Assignment | Stessa sezione |
| AS-1 … AS-4 | Assunzioni sui casi limite, tutte risolte: Plus passato a credits (AS-1), Business passato a credits (AS-2), email/activities/tab avanzate (AS-3), flag `customization.*` (AS-4) | Sezione "Decisioni globali", "Assunzioni sui casi limite" |
| B-1 … B-16 | Le singole feature del piano Business e cosa ne facciamo | Sezione "Feature del piano Business da smistare" |
| G1 … G23 | I punti del codice che bloccano o abilitano una funzione in base al piano o al trial | Sezione "Punti con gating per piano" |
| Task 1 … 11 | Passi di implementazione, in ordine | Sezioni "Task N" |
| 13010 … 13013 | Codici di errore del server per crediti: insufficienti (13010), modello senza prezzo (13011), trial finito (13012), limite giornaliero del trial (13013) | "Contratto server" |
| Forme A, A', B, C | Le quattro forme del body di errore del server | "Contratto server" |
| A, B, C, D, E, EE, F nei piani | Codici interni dei piani in `PLAN_NAME`: A Growth, B Scale, C Plus, D Starter, E Pro, EE Business, F Custom | `src/app/utils/util.ts` |

## Vincoli globali

- `metering === 'credits'` → logica a crediti. **Qualsiasi altro valore** (`'quotes'`, `undefined`, `null`, stringa sconosciuta) → logica legacy invariata.
- Il flusso di salvataggio in `localStorage` e `AuthService.project_bs` resta lo stesso.
- Nessun blocco preventivo a crediti nel frontend: il server rifiuta, la dashboard gestisce l'errore.
- `src/app/home_old` è eliminato (2026-11-24): nessun import o rotta lo usava.
- Nessuna modifica al contenuto dei blocchi legacy: solo wrapping condizionale.

---

## Decisioni

| # | Domanda | Decisione |
|---|---------|-----------|
| 1 | Chiave assente | Trattata come `"quotes"` (legacy) |
| 2 | UI progetti credits | Blocchi disattivati; contatore crediti portato da `features-2611/credits-plan` |
| 3 | Blocco a crediti esauriti | Lo fa il server; il frontend gestisce l'errore (vedi riga D, nessun blocco preventivo) |
| 4 | Fonte di `metering` | Project object; flusso `localStorage` / `AuthService` invariato, ma da sistemare cosa salviamo e cosa passiamo nel BehaviorSubject (Task 9) |
| 5 | `home_old` | Eliminato (2026-11-24) |
| A | Feature gating per piano | **Risolta** il 2026-11-24 da GL-6 (feature sbloccate su ogni piano) e GL-7 (retention, ruoli custom e Smart Assignment restano Custom). Casi limite AS-1…AS-4 risolti |
| B | Commit LLM gestiti (`14d887695`, `7768b7900`) | **Portati** insieme al contatore, attenzione ai conflitti (Task 1) |
| C | Cosa vuol dire "crediti finiti" | **Confermata:** saldo disponibile `<= 0`, oppure `billing.status` in `suspended`, `canceled`, `trial_ended` (trial scaduto). Serve solo per la UI (chip rosso in navbar, `areCreditsExhausted`): il blocco lo fa il server. `payment_failed` non conta come finito |
| D | Blocchi preventivi | **Nessuno**: blocca il server, la dashboard gestisce l'errore secondo il codice di `tiledesk-server` |
| E | Summary non ancora caricato | Non bloccare |

---

## Contratto server (da `tiledesk-server` locale)

### `metering`

- **Calcolato a ogni richiesta, non salvato nel DB.** Un progetto è `credits` se ha un `CreditAccount` con `creditsFrom` già passato, altrimenti `quotes` (`pubmodules/credits/creditManager.js:100-145`). Cache dell'account lato server di 30 secondi.
- `GET /projects/:id` → `project.metering` al **livello top** (`routes/project.js:877-904`, aggiunto dopo la cache del progetto).
- `GET /projects/` → `item.id_project.metering` (`routes/project.js:1001-1003`).
- `POST /projects/` → **senza** `metering`. Il trial a crediti parte in modo asincrono su `project.create` per i progetti non `payment` (`pubmodules/credits/listener.js:50-57`, `creditManager.js:891-928`): un progetto nuovo diventa `credits` pochi istanti dopo la creazione.
- `GET /:projectid/credits` → `{ metering: 'quotes', creditsFrom? }` per i progetti a quote (con `creditsFrom` se il passaggio è programmato), summary completo per i progetti a crediti.

Conseguenza: lo script che aggiunge `"quotes"` ai vecchi progetti non serve al server (la chiave arriva sempre); la dashboard deve comunque trattare l'assenza come `quotes`.

### Codici di rifiuto (`errorCodes.js:42-50`), sempre HTTP 403

| Codice | Significato | Testo |
|--------|-------------|-------|
| 13010 | `INSUFFICIENT_CREDITS` | "Credits balance not sufficient" |
| 13011 | `UNPRICED_MODEL` | "Model … is not available with the Tiledesk … key" |
| 13012 | `TRIAL_ENDED` | "Credits trial ended" |
| 13013 | `DAILY_LIMIT` | "Daily credits limit of the trial reached" |

Forme del body (il testo cambia campo):

| Forma | Dove | Body |
|-------|------|------|
| A | middleware `pubmodules/credits/check.js` | `{ success: false, error, error_code, credits_required }` |
| A' | `POST /kb`, `/kb/multi`, `/kb/csv` | `{ success: false, error, plan_limit: undefined, error_code }` |
| B | `POST /kb/qa`, `POST /llm/preview` | `{ success: false, message, error_code }` |
| C | `POST /usage/check` | `{ success: false, ok: false, metering, error_code, error, credits_required? }` |

### Rotte usate dalla dashboard che possono rifiutare per crediti

| Rotta | Servizio dashboard | Codici | Note |
|-------|--------------------|--------|------|
| `POST /:pid/faq_kb` (crea chatbot) | `FaqKbService` create | 13012, 13010 | Gratis in trial (costo mensile) |
| `POST /:pid/faq_kb/fork/:id` | `faq-kb.service.ts:180,199` | 13012, 13010 | Template, duplicate, install, wizard |
| `POST /:pid/faq_kb/importjson/null/?create=true` | `faq.service.ts:297` | 13012, 13010 | Import JSON di un nuovo chatbot |
| `POST /:pid/project_users/invite` | `users.service.ts:127` | 13012, 13010 | Gratis in trial |
| `POST /:pid/kb/namespace` | `knowledge-base.service.ts:111` | 13012, 13013, 13010 | **Non** mensile: paga anche in trial |
| `POST /:pid/kb/namespace/import/:id` | `knowledge-base.service.ts:156` | 13012, 13010 | |
| `POST /:pid/kb`, `/kb/multi`, `/kb/csv` | `knowledge-base.service.ts:254,266,141` | 13012, 13010 | Forma A' |
| `POST /:pid/kb/qa` (preview KB) | `openai.service.ts:97,113` | 13011, 13012, 13013, 13010 | Forma B |
| `POST /:pid/llm/preview` | (preview LLM, dal port) | 13011, 13012, 13013, 13010 | Forma B |

Senza codice 1301x (restano gestiti come oggi): conversazioni ("Requests quota exceeded", 403 senza `error_code`), email (non inviate, nessun errore HTTP). Sitemap, scrape e crawl non hanno controllo crediti.

### Limiti legacy lato server sui progetti credits

Già disattivati dal server: `QuoteManager.getPlanLimits` restituisce `Number.MAX_SAFE_INTEGER` per `requests, messages, email, tokens, agent_tokens, voice_duration, chatbots, kbs, namespace` (`QuoteManager.js:498-507`). Gli errori `plan_limit` sui namespace e contenuti KB e il 13001 sui token non scattano più. Il server non ha nessun limite sui seats.

### Summary crediti (`GET /:projectid/credits`)

```json
{
  "metering": "credits",
  "includedCredits": 5000,
  "period": { "start": "…", "end": "…" },
  "balance": { "included": 0, "extra": 0, "extraFrozen": false, "available": 0 },
  "billing": { "status": "active | payment_failed | suspended | canceled | trial | trial_ended", "courtesyUntil": "…" },
  "trial": { "until": "…", "dailyLimit": 1000, "spentToday": 0 },
  "usageCosts": {}, "monthlyCosts": {}, "extraCreditsMin": 1000
}
```

`trial` è presente solo con stato `trial` o `trial_ended`. In `trial_ended` `available` vale 0. Il `CreditsSummary` del branch dashboard **non** ha ancora `trial` né gli stati `trial` / `trial_ended` (Task 2).

---

## Stato attuale dashboard (mappa dei blocchi)

### Project object: fetch, storage, BehaviorSubject

| Pezzo                                      | Dove                                                                  | Note per metering                                                                                  |
| ------------------------------------------ | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `GET /projects/:id`                        | `project.service.ts:169-217` (cache client 5 min)                     | Contiene `metering`                                                                                |
| `GET /projects/`                           | `project.service.ts:111-139` (cache client 5 min)                     | `id_project.metering`                                                                              |
| `localStorage[<projectId>]`                | `auth.guard.ts:194,198`, autologin, projects, project-edit-add, hours | Oggetto completo da `GET` → `metering` presente                                                    |
| `localStorage[<projectId>]` dopo creazione | signup, onboarding, create-project, build-from-website                | Da `POST /projects/` → **senza** `metering`                                                        |
| `localStorage[<projectId>]` subset         | `activate-appsumo-product.component.ts:375-382`                       | **Perde** `metering`                                                                               |
| Refresh di `localStorage[<projectId>]`     | `auth.guard.ts:171-180` (`checkStoredProject`)                        | Rilegge dal server **solo se la chiave non esiste** → copia vecchia per sempre                     |
| `AuthService.project_bs`                   | `auth.service.ts:313-366, 399-530`                                    | Emette la copia di `localStorage` (può essere vecchia) o `{ _id }`                                 |
| `ProjectPlanService.projectPlan$`          | `project-plan.service.ts:157-229`                                     | Oggetto appiattito da `GET /projects/` (fresco, cache client 5 min). Oggi **non** copia `metering` |

Conseguenza: per i progetti nuovi la copia in `localStorage` non ha mai `metering`, quindi `project_bs` non è affidabile. Le fonti affidabili sono `projectPlan$` e il summary crediti (`GET /credits`, letto dal `CreditsService` a ogni cambio progetto).

### (A) Limiti numerici di piano (da disattivare su credits)

Limiti calcolati in `PricingBaseComponent.getProjectPlan()` (`pricing-base.component.ts:81-1090`) da `PLAN_SEATS`, `CHATBOT_MAX_NUM`, `KB_MAX_NUM`, `APPSUMO_PLAN_SEATS` (`util.ts:293-478`) e `profile.agents` / `profile.quotes.*`.

**Chatbot (**`chatBotCount >= chatBotLimit`**)**

- `bots/bots-list/bots-list.component.ts`: `duplicateChatbot` (781-803), `createBlankTilebot` (1840-1863), `fileChangeUploadChatbotFromJSON` (1934-2008); banner `.html:67-68`
- `bots/bots-list/chatbot-alert/chatbot-alert.component.*` (banner)
- `bots/templates/templates.component.ts` (796-921, 1059-1075); `.html:67-69`
- `bots/templates/template-detail/template-detail.component.ts` (263-318)
- `bots/templates/community-template-dtls/community-template-dtls.component.ts` (173-225)
- `bots/bot-create/bot-create.component.ts` (464-478, 526-543, 763-786, 825-841)
- `home/home.component.ts`: `assertCanCreateChatbot` (3849-3863) per `createHomeVoiceAgent` (3817) e `createHomeAgentFromPrompt` (3891)
- `home-components/home-quick-cards/home-quick-cards.component.ts` (210-216, 239-241, 297-307, 352-373, 474-499, 818-851); `.html:99-147`
- `home-components/home-create-chatbot/home-create-chatbot.component.ts` (301-343); `.html:295-320`
- `home-components/home-kb/home-kb.component.ts` (209-241)
- `home-components/home-cds/home-cds.component.ts` (243-253, 286-310)
- `app-store/app-store.component.ts`: `createExternalBot` (858-910)
- `create-project-wizard/install-template/install-template.component.ts` (426-499)
- `create-project-wizard/get-start-chatbot-fork/get-start-chatbot-fork.component.ts` (316-357, 561-680): limite calcolato **localmente**, non estende `PricingBaseComponent`

**Teammates / seats (**`projectUsersLength + countOfPendingInvites >= seatsLimit`**)**

- `users/users.component.ts` (750-809, 1441-1484); `.html:50-215` (banner, bottone Invite disabilitato)
- `user-edit-add/user-edit-add.component.ts` (549-608, 1017-1054); `.html:45-211`
- `home-components/home-quick-cards/home-quick-cards.component.ts` (226-236, 309-324, 720-734, 916-989); `.html:247-285`
- `home-components/home-create-teammate/home-create-teammate.component.ts` (357-408); `.html:194-261`
- `project-edit-add/project-edit-add.component.ts` (2318-2463, limite calcolato localmente, non estende `PricingBaseComponent`); `.html:278,310,662`

**Knowledge base**

- `home-components/home-quick-cards/home-quick-cards.component.ts`: `kbNamespaceLimit` (da `QuotesService.getProjectQuotes`) e `kbLimit` (218-224, 251-287, 853-914, 1132-1141); `.html:161-228`
- `knowledge-bases/knowledge-bases.component.ts` (881-888); `.html:130-132` (`totalCount/quotas?.kbs`)
- `knowledge-bases/knowledge-bases.component.ts`: gestori `plan_limit` (1338-1365, 2059-2075, 3296-3299, 3683-3948). Su credits non scattano più (server), ma il ramo "errore generico" sì: va escluso per i codici crediti (Task 7)
- `KB_LIMIT_CONTENT = 300` (URL per singolo import): **limite tecnico, resta**

### (B) Quote di consumo (`/quotes`), da sostituire con i crediti

- `components/navbar/navbar.component.*` menu "Current usage" (891-990, 1035-1255; `.html:163-595`): il branch crediti lo sostituisce già con il pannello crediti
- `home/home.component.ts` (1066-1274); `.html:236-676`: banner consumi della Home
- `knowledge-bases/modals/modal-preview-knowledge-base/*` (781-783, 930-932): gestisce solo `error_code === 13001`; su credits arrivano 13010–13013 (Task 7)

---

## Decisioni globali (risposte del 2026-11-24)

| # | Tema | Decisione |
|---|------|-----------|
| GL-1 | Automation Copilot (G6) | Attivo per **tutti** i progetti con `metering: "credits"`, qualunque sia il piano. I progetti `quotes` restano con la regola attuale. Le automazioni sono già rimosse e non si possono creare |
| GL-2 | Piano Business | Non è più selezionabile né creabile in pricing. I progetti esistenti restano come sono: **nessuna migrazione**. Le sue feature vanno smistate (tabella sotto) |
| GL-3 | Piano Plus | Non si crea più (è il vecchio nome del Custom). **Nessuna modifica** ai progetti Plus esistenti: non si fa niente sui vecchi progetti |
| GL-4 | Trial legacy scaduto (G1, G2, G3) | Vale **solo per i progetti credits**: nessun redirect a `/pricing/te` né a `/unauthorized-to-upgrade`, nessun blocco delle route in `ProjectProfileGuard`. Per i progetti `quotes` resta come oggi |
| GL-5 | Blocco crediti del server (13012 trial credits) | **Resta.** La schermata da togliere è solo quella legacy (`/pricing/te`, `/unauthorized-to-upgrade`). Sui credits il 13012 apre l'alert crediti che porta a `/credits`, non alla pricing |

### Regole per i progetti credits (decisioni del 2026-11-24)

| # | Regola |
|---|--------|
| GL-6 (feature sbloccate su credits) | Su `metering: "credits"` tutte le feature legate al piano sono disponibili su **ogni** piano: nessun blocco per piano. Vale per i punti G3, G4, G8, G12–G17, G20–G23 e G19 (esclusa la tab Smart Assignment, vedi GL-7) della tabella dei punti con gating, e per le feature Business B-3, B-5 … B-11, B-13, B-15, B-16 della tabella Business. I flag `customization.*` sono disponibili su tutti i piani, vedi AS-4 |
| GL-7 (restano Custom) | Su `metering: "credits"` restano solo per il piano **Custom**: message retention (G18, B-4), ruoli custom (G10, B-14), Smart Assignment (G11 e tab Smart Assignment in G19, B-12). Eccezione: i progetti Plus, vecchio nome del Custom, mantengono le loro regole attuali (AS-1). Per Business non c'è eccezione (AS-2) |

### Assunzioni sui casi limite (tutte risolte)

| # | Assunzione |
|---|------------|
| AS-1 (Plus passato a credits) | **Risolta: come oggi.** Plus non si può più creare. Progetti Plus passati a credits mantengono retention, Smart Assignment e tab avanzate, senza ruoli custom. Nessun intervento sui vecchi progetti |
| AS-2 (Business passato a credits) | **Risolta.** Business non si può più creare. I progetti Business passati a credits si comportano come gli altri piani: tutto libero tranne Smart Assignment, ruoli custom e message retention, che restano solo Custom (GL-6, GL-7). Nessuna migrazione dei vecchi progetti. Effetto oggi nullo sulla retention, che non è ancora attiva su `master` né su `master-ar-roles` |
| AS-3 (email, activities, tab avanzate) | **Risolta.** Email ticketing, activities log e tab avanzate di project settings (Security, Banned visitors, Advanced, template email, SMTP) sono disponibili a tutti i piani su credits. Smart Assignment, message retention e ruoli custom restano Custom |
| AS-4 (flag `customization.*`) | **Risolta.** I flag `customization.*` (voice, webhook, allowMultipleGroups, widgetUnbranding) sono disponibili su tutti i piani su credits, senza upsell: se il flag è spento resta solo "Contattaci". Il flag `roles` fa eccezione, vedi sotto. Scope risolto: solo progetti `metering: "credits"`; i progetti `quotes` restano come sono. Ruoli (`roles`) su credits: restano Custom (AS-3). Piano non Custom → finestra Upgrade invariata (`presentModalRolesRequiresCustomPlan`, `notify.service.ts:1041`), nessuna modifica. Piano Custom con flag spento → "Contattaci" (già così: `notify.service.ts:994-1000`, `1113-1141`), nessuna modifica. Il pulsante Upgrade resta. |

### Feature del piano Business da smistare

Colonna "Pro ce l'ha già": se è `sì`, la feature non è davvero esclusiva di Business e non serve decidere niente.

Nella colonna "Decisione": **Tutti i piani su credits** = regola GL-6; **Custom su credits** = regola GL-7; **Nessun limite di piano su credits** = i limiti numerici non si applicano (Task 5-7). AS-3 e AS-4 sono i casi limite su tab avanzate e flag `customization.*`.

| # | Feature | Dove (oggi) | Pro ce l'ha già? | Suggerimento | Decisione |
|---|---------|-------------|------------------|--------------|-----------|
| B-1 | Limiti: 50 chatbot, 10 namespace KB, 1.000 contenuti KB, 5.000 conversazioni/mese, 10M token AI | `util.ts` `CHATBOT_MAX_NUM`, `KB_MAX_NUM`, `PLANS_LIST` | No (Pro: 20 / 3 / 300 / 3.000 / 5M) | Custom: i valori sono identici | Nessun limite di piano su credits |
| B-2 | 5 utenti (seat) | `util.ts` `PLAN_SEATS.Business = 5` | No (Pro: 3) | Da decidere: Custom non ha un numero fisso (`profile_agents`) | Nessun limite di piano su credits |
| B-3 | 50 AI agents, "Built-in AI automation", "Dedicated support" (testo pricing) | `pricing.component.ts` `featuresPlanEE` | No (Pro: 20 agents, "Priority support") | Custom | Tutti i piani su credits (GL-6) |
| B-4 | Message retention | `project-edit-add.component.ts:2050-2190` (solo C, EE, F) | No (Pro: forzato a 30 giorni) | Custom | Custom su credits (GL-7, confermato) |
| B-5 | Sincronizzazione sitemap KB (refresh rate) | `knowledge-bases.component.ts:918-1035` (solo C, EE, F) | No | Custom | Tutti i piani su credits (GL-6) |
| B-6 | Gruppi nei dipartimenti | `department-edit-add.component.ts:663-689` | **Sì** (bloccati solo A e D) | Nessuna azione | Tutti i piani su credits (GL-6) |
| B-7 | Download transcript, export CSV conversazioni e contatti | `ws-requests-msgs`, `history-and-nort-convs`, `contacts` (bloccati solo A e D) | **Sì** | Nessuna azione | Tutti i piani su credits (GL-6) |
| B-8 | Widget unbranding | `widget-set-up.component.ts:766-1046` | **Sì** (dal piano E in su) | Nessuna azione | Tutti i piani su credits (GL-6) |
| B-9 | Integrazioni e canali App Store (WhatsApp, Messenger, Zapier, Help Center) | `app-store.component.ts:425-465`, `integrations/utils.ts` | **Sì** (bloccati solo A e D) | Nessuna azione | Tutti i piani su credits (GL-6) |
| B-10 | Email ticketing (`/email`) | `project-profile.guard.ts:210, 286` (solo F) | No | Custom (già così) | Tutti i piani su credits (GL-6, AS-3) |
| B-11 | Activities log (`/activities`) | `project-profile.guard.ts:265-270` (solo C, F) | No | Custom (già così) | Tutti i piani su credits (GL-6, AS-3) |
| B-12 | Smart Assignment | `ws-requests-list.component.ts:1189-1275` (solo C, F) | No | Custom (già così) | Custom su credits (GL-7, confermato) |
| B-13 | Tab avanzate in project settings (Security, Banned visitors, Advanced, template email, SMTP) | `project-edit-add.component.ts` (solo C, F) | No | Custom (già così) | Tutti i piani su credits (GL-6, AS-3) |
| B-14 | Ruoli custom | `groups.component.ts:457-528`, `notify.service.ts:958-1035` (solo F) | No | Custom (già così) | Custom su credits (GL-7, confermato) |
| B-15 | Voice (minuti) | `PLANS_LIST`: Custom 120.000 ms, Business 0 | No | Custom (Business non li aveva) | Tutti i piani su credits (GL-6, AS-4) |
| B-16 | Analytics | `project-profile.guard.ts` (bloccato su A e D); pagina statica `analytics-static` per E/EE | **Da verificare** | Da verificare nel codice prima di decidere | Tutti i piani su credits (GL-6) |

**Incongruenze da sistemare in ogni caso:** nella pricing il Business dice "5 users" ma nelle highlight "4 User"; il Pro dice "3 users" ma nelle highlight "2 User". Le highlight non sono una fonte affidabile dei limiti.

---

## Punti con gating per piano (codici G1…G23)

Questa tabella elenca ogni punto del codice che oggi blocca o abilita una funzione in base al piano o al trial. La colonna "Su credits" dice cosa deve succedere sui progetti `metering: "credits"`; sui progetti `quotes` non cambia niente.

Le regole usate nella colonna "Su credits":

- **Tutti i piani** = regola GL-6 (feature sbloccate su ogni piano): niente blocco per piano, sparisce anche l'eventuale upsell.
- **Solo Custom** = regola GL-7 (message retention, ruoli custom e Smart Assignment restano sul piano Custom).
- **Disattivato** = il blocco o il redirect non scatta più sui progetti credits (regola GL-4 per il trial legacy scaduto).
- **Nessuna azione** = il punto non richiede modifiche.

Il punto più delicato è il **trial legacy**: i progetti nuovi credits hanno anche il trial legacy (`profile.type: 'free'`, `trialExpired`). Quando scade, `AppComponent` rimanda alla pricing anche se il progetto ha crediti, e `ProjectProfileGuard` blocca tutte le route protette. Su credits questo non deve più succedere (G1, G2, G3, G4).

| #   | Blocco                                                                                                | Dove                                                                                      | Regola attuale                                                                                                            | Su credits                                                                                                  |
| --- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| G1  | Redirect a pricing con trial scaduto                                                                  | `app.component.ts:593-683`                                                                | `free` + `trialExpired` → `/pricing/te` o `/unauthorized-to-upgrade`                                                      | Disattivato su credits (2026-11-25, commit `328dd3673`)                                                      |
| G2  | Redirect da sidebar su apertura chat                                                                  | `sidebar.component.ts:3164-3198`                                                          | progetti dopo il 2025-01-16, `free` + `trialExpired`                                                                      | **Codice morto** (verificato 2026-11-25): `redirectToPricing` del sidebar non è chiamato da nessuno (`openChat()` non lo usa, il template non lo usa). Nessun effetto oggi; da rimuovere o lasciare, decisione aperta                                                                                         |
| G3  | Route protette (`ProjectProfileGuard`)                                                                | `core/project-profile.guard.ts:30-322`                                                    | trial scaduto o abbonamento inattivo → pagine `-demo`; per piano blocca analytics, gruppi, automations, email, activities | Disattivato su credits (2026-11-25): il guard ritorna `true` per i progetti credits, quindi anche GL-6 (commit `328dd3673`)                                                                   |
| G4  | Pagine statiche di upsell                                                                             | `static-pages/*`                                                                          | mostrate quando G3 blocca                                                                                                 | Non vengono più raggiunte, segue G3                                                                         |
| G5  | Footer "Contact us"                                                                                   | `footer.component.ts:110-140`                                                             | trial attivo o abbonamento attivo                                                                                         | `X-credits` e `master-STAGE-NEW`: nessuna azione (`<app-footer>` commentato dopo Bootstrap 5). `master-ar-roles`: nessuna azione (footer commentato) |
| G6  | Automation Copilot                                                                                    | `bots-list.component.ts:967-1119`, `home.component.ts:1557-1595`                          | solo Plus, Business, Custom attivi + `customization.webhook`                                                              | Sempre attivo su credits (GL-1)                                                                             |
| G7  | Voice agent (Twilio, VXML)                                                                            | `bots-list`, `templates`, `home`, analytics                                               | `customization.voice_twilio` / `customization.voice`                                                                      | Decide il flag, non il piano; flag spento → solo "Contattaci" (AS-4)                                        |
| G8  | Gruppi nei dipartimenti                                                                               | `department-edit-add.component.ts:663-689,795-813`                                        | blocca Growth, Starter, trial scaduto, abbonamento inattivo                                                               | Tutti i piani (GL-6)                                                                                        |
| G9  | Più gruppi per dipartimento                                                                           | `department-edit-add` (`allowMultipleGroups`)                                             | `customization.allowMultipleGroups`                                                                                       | Nessuna azione; flag spento → solo "Contattaci" (AS-4)                                                      |
| G10 | Ruoli custom                                                                                          | `groups.component.ts:457-528`, `users.component.ts:664-734`, `notify.service.ts:958-1035` | solo Custom attivo + `customization.roles`                                                                                | Solo Custom (GL-7). Non Custom: finestra Upgrade invariata. Custom con flag spento: "Contattaci" (AS-4)     |
| G11 | Operating hours / Smart Assignment in lista conversazioni                                             | `ws-requests-list.component.ts:448-466,1189-1275`                                         | trial o abbonamento inattivo; Smart Assignment solo Plus, Custom                                                          | Operating hours: tutti i piani (GL-6). Smart Assignment: solo Custom (GL-7)                                 |
| G12 | Rating conversazioni                                                                                  | `ws-requests-msgs.component.ts:1113-1133`, `history-and-nort-convs`                       | nascosti con trial scaduto o abbonamento inattivo                                                                         | Tutti i piani (GL-6)                                                                                        |
| G13 | Nota privata                                                                                          | `ws-requests-msgs.component.ts:1135-1152`                                                 | bloccata con trial free scaduto                                                                                           | Tutti i piani (GL-6)                                                                                        |
| G14 | Download transcript                                                                                   | `ws-requests-msgs.component.ts:5500-5583`                                                 | blocca A, D, trial scaduto, abbonamento inattivo                                                                          | Tutti i piani (GL-6)                                                                                        |
| G15 | History limitata a 14 giorni + export CSV                                                             | `history-and-nort-convs.component.ts:2240-2377,3492-3613`                                 | banner e blocco export su trial scaduto, abbonamento inattivo, A, D                                                       | Tutti i piani (GL-6)                                                                                        |
| G16 | Export CSV contatti                                                                                   | `contacts.component.ts:1278-1507`                                                         | come G15 + AppSumo sotto Tier 3                                                                                           | Tutti i piani (GL-6)                                                                                        |
| G17 | Refresh rate KB                                                                                       | `knowledge-bases.component.ts:918-1035` + modali KB                                       | solo Plus, Business, Custom attivi                                                                                        | Tutti i piani (GL-6)                                                                                        |
| G18 | Retention messaggi                                                                                    | `project-edit-add.component.ts:2050-2190`                                                 | solo Plus, Business, Custom attivi; altrimenti 30 giorni                                                                  | Solo Custom (GL-7)                                                                                          |
| G19 | Tab avanzate in project settings (Smart Assignment, Security, Banned, Advanced, template email, SMTP) | `project-edit-add.component.ts:1530-1797, 2530-2550`                                      | solo Plus, Custom                                                                                                         | Tab Smart Assignment: solo Custom (GL-7). Le altre tab: tutti i piani (GL-6, AS-3)                          |
| G20 | Transcript automatico + pagina webhook                                                                | `project-edit-add.component.ts:2500-2597, 4412-4478`                                      | piano pagato o trial attivo                                                                                               | Tutti i piani (GL-6)                                                                                        |
| G21 | Widget unbranding                                                                                     | `widget-set-up.component.ts:766-1046`, `widget-home.component.html:331-336`               | piano + `customization.widgetUnbranding`                                                                                  | Tutti i piani (GL-6); flag spento → solo "Contattaci" (AS-4)                                                |
| G22 | Integrazioni                                                                                          | `integrations.component.ts`, `integrations/utils.ts:114-146`                              | `availableFrom` per piano + `customization.*`                                                                             | Tutti i piani (GL-6)                                                                                        |
| G23 | App Store (WhatsApp, Messenger, Zapier, Help Center, transcript)                                      | `app-store.component.ts:425-465,923-1002`                                                 | blocca A, D, trial scaduto, abbonamento inattivo; AppSumo Tier 3                                                          | Tutti i piani (GL-6)                                                                                        |

Nella colonna "Regola attuale", **A** e **D** sono i codici interni dei piani Growth (A) e Starter (D), vedi `PLAN_NAME` in `util.ts`.

Ogni riga che non sia "Nessuna azione" diventa un sotto-task del Task 11, con lo stesso pattern di wrapping.

---

## Struttura dei file

| File | Azione | Responsabilità |
|------|--------|----------------|
| `src/app/utils/metering.util.ts` | Nuovo | `ProjectMetering`, `getProjectMetering`, `isCreditsMetering`, `CREDITS_ERROR_CODES`, `getCreditsErrorCode`, `isCreditsRefusal` (funzioni pure) |
| `src/app/utils/metering.util.spec.ts` | Nuovo | Test delle funzioni pure |
| `src/app/services/metering.service.ts` | Nuovo | Metering del progetto corrente (`isCredits`, `isCredits$`) + alert unico per i rifiuti crediti |
| `src/app/services/metering.service.spec.ts` | Nuovo | Test del servizio |
| `src/app/services/credits.service.ts` | Modifica (dopo il port) | Tipi `trial`, stati `trial` / `trial_ended`, `metering$` grezzo |
| `src/app/models/project-model.ts` | Modifica | `metering?: ProjectMetering` |
| `src/app/services/project-plan.service.ts` | Modifica | Copia `metering` in `projectPlanData` e lo pubblica in `MeteringService` |
| `src/app/pricing/pricing-base/pricing-base.component.ts` | Modifica | `isCreditsMetering` |
| `src/app/services/interceptor/log-requests.interceptor.ts` | Modifica (dopo il port) | Tutti i codici 13010–13013 → `MeteringService.presentCreditsRefused` |
| File delle sezioni (A) e (B) | Modifica | Wrapping `if (!this.isCreditsMetering)` + esclusione degli errori generici per i rifiuti crediti |
| File di `features-2611/credits-plan` | Port | Contatore, sezione `/credits`, `CreditsService`, interceptor 403, modelli LLM gestiti |

---

## Task 1: Port completo di `features-2611/credits-plan`

Tutti i 7 commit (decisione B), in ordine:

```bash
git cherry-pick -x 6a435ef5d d5d23de83 3e3b6c6b8 14d887695 7768b7900 14811e252 f168fbc1a
```

Conflitti attesi (file modificati anche su `X-credits` dopo il merge-base):

| File | Su `X-credits` | Attenzione |
|------|----------------|------------|
| `src/app/utils/util.ts` | ~1650 righe cambiate | `getLlmModelTokenBounds` (riga ~1509): tenere la versione `X-credits` e applicare **solo** la modifica del branch (liste `LLM_MODEL` prima e filtro `m.max_output_tokens`). Verificare che `LLM_MODEL` esista ancora con quella forma |
| `src/app/knowledge-bases/modals/modal-preview-settings/modal-preview-settings.component.ts` | 50 righe cambiate | Unire a mano: la logica dei modelli gestiti sopra la versione attuale |
| `src/app/services/integration.service.ts` | 14 righe cambiate | Aggiunta di 3 metodi: in genere conflitto solo di contesto |
| `src/app/components/navbar/navbar.component.ts` / `.html` | titolo pagine, monitor | Tenere entrambe le versioni; `getPageTitle` con la regex `/credits` **prima** di `/home` |
| `src/app/app.routing.ts` | 39 righe cambiate | Aggiungere la route `project/:projectid/credits` |
| `src/assets/i18n/en.json`, `it.json` | ~500 righe cambiate | Unire le chiavi `Credits.*` e quelle LLM senza perdere le nuove di `X-credits` |

- [x] **Step 1:** cherry-pick un commit alla volta (`git cherry-pick -x <sha>`); a ogni conflitto risolvere, `git add`, `git cherry-pick --continue`. **Fatto il 2026-11-24.** Conflitti reali: `navbar.component.ts` (import e costruttore, tenute entrambe le versioni) e `integration.service.ts` (due volte, tenuti i nuovi metodi e il commento di `getMcpTools`). `util.ts`, `app.routing.ts`, `modal-preview-settings.component.ts` e i file i18n si sono uniti da soli
- [x] **Step 2:** dopo ogni commit con i18n, controllo JSON (ok dopo ogni commit):

```bash
node -e "['en','it'].forEach(l=>JSON.parse(require('fs').readFileSync('src/assets/i18n/'+l+'.json')));console.log('ok')"
```

Atteso: `ok`.

- [x] **Step 3:** build dopo l'ultimo commit (riuscita il 2026-11-24). Il progetto non ha la configurazione `development` (solo `production` e `pre`): si usa la build senza configurazione, con output temporaneo da cancellare dopo (`rm -rf .credits-build-tmp`):

```bash
npx ng build --output-path=.credits-build-tmp
```

Atteso: build senza errori.

- [x] **Step 4:** test esistenti toccati (navbar e util). Con `CHROME_BIN` impostato su Chrome (`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`) e `TZ=UTC`: 24 su 24 PASS. Senza `TZ=UTC` fallisce un test non legato al port (`projectDefaultsDashletFiltersOff`, la costante `HOME_DASHLET_FILTER_OFF_FROM` è in ora locale e il test usa orari UTC), già presente su `master`:

```bash
npx ng test --watch=false --browsers=ChromeHeadless --include=src/app/components/navbar/navbar.monitor-title.spec.ts --include=src/app/utils/util.spec.ts
```

Atteso: PASS.

- [ ] **Step 5:** verifica manuale: preview KB con un modello gestito (Tiledesk key) e con chiave propria; pagina `/project/:id/credits` aperta su un progetto credits e su uno a quote.
  - [x] Progetto credits: verificato manualmente il 2026-11-24.
  - [x] Progetto a quote: verificato manualmente il 2026-11-25 dopo lo Step 6. Etichetta "Nx tokens" solo sui modelli GPT, come atteso. Non verificata la chiamata con un modello non OpenAI senza chiave propria: resta S5 (sotto).
  - Progetto credits, 2026-11-25: nessuna etichetta "Nx tokens" su nessun modello, come atteso (il moltiplicatore esiste solo sui quote).

- [x] **Step 6 (2026-11-25): commit del collega `ddc7e4180`** ("Refactor LLM model handling in modal preview settings and integration service", Giovanni Troisi, branch `features-2611/credits-plan-tmp`). È l'unico commit di `-tmp` non presente in `X-credits`; il resto di `-tmp` (merge di `master`, executions, MCP) è già nel nostro branch.
  - Applicato con `git cherry-pick -x` (nessun conflitto, auto-merge su 2 file), committato su `X-credits` dopo la revisione del diff (vedi log 2026-11-25).
  - `integration.service.ts`: `getManagedLlmModels()` diventa `getLlmModels()` (stessa URL `GET /:pid/llm/models?managed=true&output_modalities=text`); rimossi `getLlmProviders()` e `getProviderModels()` (nessun altro chiamante).
  - `modal-preview-settings.component.ts`: una sola chiamata a `/llm/models` al posto di `forkJoin(providers, managed)` e delle chiamate per provider con chiave propria; rimossi `getKeyedModels`, `getOwnKeyModels`, `ownKeyModelOption`, `groupManagedModels`, `applyManagedModels`, `KEYED_STATIC_MODELS`. Modelli raggruppati per `tiledesk.provider` e salvati con `tiledesk.model`; i vendor senza provider proprio (Meta, Mistral, ...) diventano gruppi separati (`openRouterVendorGroups`) che chiamano OpenRouter; moltiplicatore "Nx tokens" dal server quando c'è la lista, altrimenti da `ai_models`; senza `tiledesk.provider` nella risposta, liste statiche (Groq compreso).
  - Nostre aggiunte preservate: `gpt-6` (6 occorrenze), `resolveDefaultActiveModelRow`.
  - **Server** (`features-2611/credits-plan`, commit `ee47e4d3`, `7e91242a`, `5f8b17d8` di Giovanni, 24-25/11): nuovo `pubmodules/credits/llmModels.js`; `/llm/models` restituisce `tiledesk: { managed, provider, model, key }`, più `credits` (crediti) e `multiplier` (quote, solo modelli con chiave Tiledesk). Crediti: managed = modelli con prezzo non variant, vendor senza provider come `openrouter`. Quote: managed = openai, google, anthropic, deepseek, cohere, groq; solo OpenAI ha la chiave Tiledesk (`GPTKEY`). Gli endpoint `/llm/providers` restano ma il client non li usa più.
  - Effetto sulle verifiche S1–S5 (sotto): S4 (campi dei modelli a crediti) ora coperto dal server; S1, S2, S3, S5 vanno riletti con il nuovo contratto (la dashboard non scarta più i modelli non OpenAI sui quote, e `/llm/providers` non è più usato).
  - Build Angular 15 OK (`npx ng build --output-path=.credits-build-tmp`, exit 0). Test: 45 su 45 PASS con `TZ=UTC` e Chrome (navbar, `util`, `metering.util`, `metering.service`).
  - Verifica manuale (preview KB) fatta il 2026-11-25 su progetto a crediti e a quote, vedi Step 5.
- [x] **Step 7 (2026-11-25): commit del collega `f7ec9e482`** ("Update credits model and pricing components for improved clarity and functionality", Giovanni Troisi, `features-2611/credits-plan-tmp`, 16:13). Applicato con `git cherry-pick -x --no-commit` (auto-merge su `credits.service.ts`, `en.json`, `it.json`); da committare dopo la revisione.
  - `credits.service.ts`: `CreditsLlmPrice.ownKey` (oggetto con prezzi input/output) sostituito da `ownKeyPerCall: number` (importo fisso per chiamata con chiave propria).
  - `credits-prices.component.html/.ts`: tolte le colonne "chiave propria" Input/Output dalla tabella prezzi; nuovo getter `ownKeyPerCall` (da `store.llmPrices[0]?.ownKeyPerCall`, `null` se assente) e nota `Credits.OwnKeyPerCallHint` sotto la tabella.
  - `credits-models.component.ts`: `perThousand` (crediti ogni 1000 token) calcolato solo per le righe senza chiave propria; per le righe con chiave propria resta `null`.
  - `en.json`, `it.json`: `LlmPricesHint` accorciato, nuova `OwnKeyPerCallHint`, `Hint` aggiornato ("importo fisso per chiamata"). JSON validati.
  - **Server** (`features-2611/credits-plan`, commit `836c3ac5`): `credits.ownKeyPerCall` in `/llm/models` (default 0,2 crediti, `pricing.json`).
  - Verifica: build Angular 15 OK (`npx ng build --output-path=.credits-build-tmp`, exit 0, 2026-11-25 dopo aver liberato spazio). Un primo tentativo si era fermato per disco pieno (`ENOSPC`), non per il codice. Test non rilanciati.
  - **Da fare (manuale):** aprire `/project/:id/credits` su un progetto a crediti e controllare la tabella prezzi (nessuna colonna chiave propria, nota 0,2 crediti per chiamata) e la pagina modelli (nessun "per 1000" sulle righe con chiave propria).

---

## Verifiche lato server (da fare con il backend)

> Nota 2026-11-25: dopo `ddc7e4180` e i commit server `ee47e4d3`, `7e91242a`, `5f8b17d8` il contratto di `/llm/models` è cambiato (campi `tiledesk.provider/model/key/multiplier`, `/llm/providers` non più usato dal client). S1–S5 sotto descrivono il contratto precedente: da riverificare, non da prendere alla lettera.

Repository server: `tiledesk-server`, branch `features-2611/credits-plan`. Non modificare il server: solo verifica. Riferimenti: `pubmodules/credits/routes/llm.js`, `pubmodules/credits/llmPriceList.js`, `pubmodules/credits/catalog.js`, `pubmodules/credits/creditManager.js`.

- [ ] **S1 — quote, lista managed (`GET /:pid/llm/models?managed=true`)**
  - *Cosa verificare:* su un progetto a quote la risposta contiene solo modelli OpenAI, ciascuno con `tiledesk.managed: true` e senza `tiledesk.credits`.
  - *Come:* chiamare l'endpoint con il token di un progetto a quote e contare i vendor nel campo `id`.
  - *Perché:* la dashboard mostra solo i GPT se il server non restituisce altro. **Correzione 2026-11-25:** la frase precedente era errata per il codice attuale. Nel ramo quote di `llmModels.js` (`features-2611/credits-plan`, commit `0f060d31`) `managed` non dipende da `GPTKEY`: dipende solo dal provider gestito e dalla chiave di chat di OpenAI. `GPTKEY` decide soltanto `key: "tiledesk"` e il `multiplier`. Senza `GPTKEY` i modelli OpenAI restano `managed: true` con `key: "own"`. La vecchia regola (`['openai']` solo con `GPTKEY`) era nella route `/llm/models` prima dei commit del 24-25/11.
  - *Esito atteso:* `GPTKEY` impostata su stage e lista OpenAI come descritta. Se `GPTKEY` manca, va impostata o la lista resta vuota.
- [ ] **S2 — quote, chiavi per provider (`GET /:pid/llm/providers`)**
  - *Cosa verificare:* solo `openai` ha `key: "tiledesk"`; gli altri provider (google, anthropic, deepseek, cohere, groq) hanno `key: null`.
  - *Come:* chiamare l'endpoint per il progetto `6afbf72b74dddb00133ead0e` (già visto: risposta conforme) e per un secondo progetto a quote, per escludere casi particolari.
  - *Perché:* la dashboard svuota le liste dei provider con `key: null`. Se un provider deve essere disponibile su quote, il valore sbagliato nasce qui.
  - *Esito atteso:* stesso schema del progetto di esempio su tutti i progetti a quote.
- [ ] **S3 — decisione di prodotto: vendor non OpenAI sui quote**
  - *Decisione 2026-11-25 (quote):* i progetti a quote devono funzionare come prima di `ddc7e4180`. Quindi i vendor non OpenAI senza integrazione del progetto non devono risultare usabili. Il server deve marcare `managed: false` per quei provider nel ramo quote di `llmModels.js` (la regola deve tener conto delle integrazioni del progetto: con integrazione propria il modello resta `managed: true`, `key: "own"`). Il client non può farlo da solo, perché `key: "own"` non dice se l'integrazione esiste. Da portare a Giovanni.
  - *Aperto sui crediti (2026-11-25):* quali modelli mostrare nella select. Opzione A: tutti i modelli con prezzo, anche di vendor fuori dall'elenco (codice attuale del collega). Opzione B (raccomandata): solo i vendor dell'elenco gestito, come prima di `ddc7e4180`, più i modelli OpenRouter già nell'integrazione del progetto. Prima il server marcava `managed` solo per `managedVendors`; il nuovo codice marca tutti i modelli con prezzo. Da discutere con Giovanni.
  - *Cosa decidere (storico):* i modelli Anthropic, Google, DeepSeek e Cohere devono essere usabili con la chiave Tiledesk anche su progetti a quote, oppure no? Risposta: no, vedi sopra.
  - *Se no (comportamento attuale):* nessuna modifica; la dashboard mostra la lista OpenAI statica e liste vuote per gli altri provider finché non c'è una chiave propria.
  - *Se sì:* il server deve gestire quei vendor anche per i quote (`managedVendors` e `hasTiledeskKey`), e la dashboard deve smettere di scartare i modelli senza `tiledesk.credits` in `groupManagedModels`.
  - *Perché serve:* è la regola che decide cosa vede un progetto a quote; non si può decidere in dashboard da sola.
- [ ] **S4 — progetto a crediti (`GET /:pid/llm/models?managed=true`)**
  - *Cosa verificare:* per un progetto a crediti ogni modello managed ha `tiledesk.credits` (con `tiledeskKey` e `ownKey`) e `top_provider.max_completion_tokens` valorizzato.
  - *Come:* chiamare l'endpoint con il token di un progetto a crediti; controllare un modello Google (es. `google/gemini-4-neon`) e un modello OpenAI.
  - *Perché:* la dashboard usa `top_provider.max_completion_tokens` per il massimo dei token dello slider e `tiledesk.credits` per mostrare i prezzi. Senza questi campi il massimo resta al valore di fallback.
  - *Esito atteso:* campi presenti su tutti i modelli managed.
  - *Nota 2026-11-25:* su un progetto a crediti una chiamata con un modello Gemini (Gemini 3.8 Flash) con la chiave Tiledesk è andata a buon fine. Non verifica i campi di risposta della lista (S4 resta aperto finché non si controllano i campi).
- [ ] **S5 — chiamata reale su quote con modello non OpenAI** (esito 2026-11-25: 404, non 13011; aperta in attesa della correzione lato server, da rifare dopo la decisione con Giovanni)
  - *Risultato:* su un progetto a quote, chiamata con DeepSeek senza chiave propria: `404 Integration deepseek not found for project 6afbf72b74dddb00133ead0e`. Il ramo è in `routes/kb.js` (~riga 500–505): sui quote i provider gestiti (`isManagedProvider`) senza integrazione del progetto danno 404. Il server non accetta la chiamata.
  - *Conseguenza:* la lista `/llm/models?managed=true` su quote marca come `managed: true` anche DeepSeek, Anthropic, Google e Cohere (con `key: "own"`), quindi la select li mostra come usabili, ma la chiamata fallisce. Lista e chiamata non coincidono. Causa in `llmModels.js` (ramo quote): `managed` non controlla se il progetto ha l'integrazione del provider; solo Groq è condizionato alla chiave del progetto.
  - *Da decidere (S3):* oppure il server marca `managed: false` per i provider non OpenAI sui quote senza integrazione (e la select li nasconde), oppure il server gestisce quei vendor con la chiave Tiledesk anche sui quote.
  - *Cosa verificare:* con un progetto a quote, una richiesta che usa un modello non OpenAI (es. `anthropic/...`) e nessuna chiave propria: il server risponde 403 `13011` (`UNPRICED_MODEL`) oppure accetta la richiesta.
  - *Come:* eseguire una chiamata di test (es. preview KB) con il modello scelto; registrare la risposta.
  - *Perché:* se il server accetta, la lista vuota della dashboard è più restrittiva del necessario. Se risponde 13011, la lista vuota è coerente con il server. Il percorso `creditManager.managedModel` non è stato verificato.
  - *Esito atteso:* uno dei due comportamenti, da riportare nel piano insieme alla decisione S3.

## Domande per Giovanni (2026-11-25)

Da portare a Giovanni sul branch `features-2611/credits-plan` (commit del 24-25/11: `ee47e4d3`, `7e91242a`, `5f8b17d8`). Le risposte sbloccano S3, S5 e lo Step 5 del Task 1.

**Progetti a quote**
1. Su quote, `/llm/models?managed=true` marca `managed: true` DeepSeek, Anthropic, Google e Cohere anche senza integrazione del progetto (`key: "own"`). Una chiamata senza integrazione risponde `404 Integration deepseek not found for project ...`. Può limitare `managed: true` ai provider per cui il progetto ha un'integrazione propria, e a OpenAI?
2. Il 404 è il rifiuto che vogliamo, o deve essere un codice crediti (es. `13011`), così l'alert dell'interceptor mostra il testo giusto?
3. Senza `GPTKEY`, i modelli OpenAI devono restare in lista con `key: "own"`, come nel codice attuale? (Correzione: la frase precedente sul fatto che la lista sarebbe vuota senza `GPTKEY` era errata, vedi S1.)
4. È voluto aver tolto `GET /llm/providers` e `GET /llm/providers/:provider/models`? Il client non li usa più.

**Progetti a crediti: lista modelli**
5. Quali modelli devono comparire nella select: tutti quelli con prezzo, anche di vendor fuori dall'elenco (come ora), oppure solo i vendor dell'elenco gestito come prima di `ddc7e4180`, più i modelli OpenRouter già nell'integrazione del progetto? (Opzione B raccomandata.)
6. Il server non manda `tiledesk.credits` nella select, quindi nessun prezzo è visibile. È voluto?
7. Sui crediti non c'è `multiplier` (nessuna etichetta "Nx tokens"). Confermi?
8. Confermi che i modelli managed hanno `tiledesk.credits` (con `tiledeskKey` e `ownKey`) e `top_provider.max_completion_tokens`? Chiude S4.
9. Groq: `managed: true` solo con integrazione Groq del progetto, su quote e su crediti. Va bene?

**Progetti a crediti: regole lato server (Q1–Q8 più sotto)**
10. Q1: su conto sospeso o annullato il server risponde `13010`? Il testo del popup sarebbe sbagliato.
11. Q2: `request.js`, `user-request.js`, `department.js`, `widget.js` e `operatingHoursService.js` usano ancora `trialExpired` e `isActiveSubscription`? Attenzione alla precedenza `A && B && (C) || (D)`.
12. Q3: quale orologio blocca i crediti: `billing.status` o `subEnd + 3 giorni`?
13. Q4: chi aggiorna `profile.subEnd` dopo un rinnovo? I webhook Stripe non lo toccano.
14. Q5: `courtesyDays` in produzione è 7 (default in `pricing.json`) o 3?
15. Q6: sui progetti a crediti `profile.type` resta `free`? Oggi il client lo legge come trial legacy.
16. Q7: i price ID Stripe in produzione sono tutti in `plans`?
17. Q8: al cambio piano `metering` resta `credits`?

**Lavoro condiviso**
18. Il suo branch `features-2611/credits-plan-tmp` e il nostro `X-credits` hanno divergenze? Quale branch aggiorniamo da ora, o portiamo solo i suoi commit?
19. Confermiamo che il server non deve dare `13010` sui progetti non a crediti (`metering` assente o `quotes`)?

**Nuovi progetti: trial a 3 seats (solo lato client, da sapere)**
20. Il progetto appena creato riceve profilo `Sandbox` con trial attivo, e il client lo mostra come "Pro (trial)" con 3 seats (`PLAN_SEATS.Pro`, costante in `util.ts`). È un comportamento che il server dovrebbe dichiarare, o basta la costante del client?
21. **Trial e costi mensili (test del 2026-11-25).** Su un progetto a crediti in trial, teammate (`project_user`) e contenuti KB non vengono addebitati: `syncMonthlyFees` esce se lo stato non è `active`, e `checkSpend` con `monthly` lascia passare i trial. Il pannello crediti non mostra quindi alcun costo mensile per seat e contenuti. È voluto? Un utente in trial si aspetta di vedere il costo prima di attivare il piano?
22. **Primo addebito alla attivazione.** `markPaymentSucceeded` addebita in un'unica volta tutti i seat, i chatbot e i contenuti già presenti, al primo passaggio ad `active`. Durante il trial l'utente non vede alcun costo mensile. Esempio con `pricing.json`: 50 teammate (500 crediti ciascuno) e 50 chatbot (100 ciascuno) fanno 30.000 crediti al mese, contro 5.000 inclusi di default (circa 300 euro se 100 crediti = 1 euro). Va bene così, o serve prima una proiezione nel trial ("al passaggio al piano pagherai circa X crediti al mese", con il dettaglio di seat, chatbot e contenuti), una conferma esplicita all'attivazione con l'importo, oppure un limite di seat e chatbot durante il trial? La proiezione e la conferma sono lato client; il tetto è una scelta di prodotto e di server.
23. **Inviti a email non registrate.** L'invito non crea il membro: la seat è addebitata dal task periodico (`CREDITS_TASK_CRON_EXPRESSION`, default ogni 15 minuti), solo dopo la registrazione e solo su account attivo. Il pending invite non conta come seat e non ha costo. È voluto? Il pannello crediti deve mostrare anche gli inviti in sospeso?
24. **`prompt_token_size` nella preview KB (test del 2026-11-25).** Su un progetto a crediti con chiave Tiledesk (`gpt-4o`), la preview mostra `prompt size` 1.988 token e il saldo scende di 0,21 crediti. `getTrackingTokens` (`services/aiManager.js`) sovrascrive `prompt_token_size` con `token × moltiplicatore` (quota) anche sui progetti a crediti, e mette il valore reale in `legacy_prompt_token_size`; i crediti sono invece calcolati sui token reali (`input_tokens`/`output_tokens`). Il numero mostrato non corrisponde quindi ai token addebitati. Sui progetti a crediti il server può lasciare `prompt_token_size` reale (e non applicare il moltiplicatore), o preferite che il client mostri `legacy_prompt_token_size`?

---

## Domande per il server sui progetti a crediti (da chiarire)

Repository server: `tiledesk-server`, branch `features-2611/credits-plan`. Sono domande: il server non si modifica da questo piano. Regola di riferimento: sui progetti `metering: "credits"` il client non mostra paywall né redirect a pricing o pagine `-demo`; il blocco lo decide il server.

- [ ] **Q1 — conto sospeso o annullato: codice di rifiuto**
  - *Cosa verificare:* con `billing.status` `suspended` o `canceled` il saldo va a zero (`zeroGrantPool` in `expireGraces` e `markCanceled`), quindi il server risponde 403 con `error_code: 13010`. Il client mostra "Crediti insufficienti" con il testo "attendi l'inizio del periodo successivo", che non vale per un abbonamento non pagato.
  - *Domanda:* serve un codice dedicato (conto sospeso o annullato) oppure basta cambiare il testo lato client?
  - *Perché:* il popup dice una cosa diversa dalla causa reale.
- [ ] **Q2 — controlli server che usano `trialExpired` e `isActiveSubscription`**
  - *Cosa verificare:* questi controlli non guardano `metering` e scattano anche sui progetti a crediti con trial legacy scaduto o abbonamento inattivo: `routes/request.js` riga ~1409 (`history_search`), `routes/department.js` righe ~185 e ~280, `routes/widget.js` righe ~167 e ~228, `services/operatingHoursService.js` righe ~44 e ~199, `routes/user-request.js` riga ~211.
  - *Effetto (letto nel codice, non è un blocco di route):* sono restrizioni dei dati dentro i gestori, senza errore. (a) lo storico delle conversazioni è limitato agli ultimi 14 giorni (`request.js`, `user-request.js`); (b) la lista dei dipartimenti mostra solo quelli `default` (`department.js`, `widget.js`); (c) gli orari operativi sono ignorati e il progetto risulta sempre aperto (`operatingHoursService.js`).
  - *Bug di precedenza:* le condizioni sono scritte come `A && B && (C) || (D)`, quindi il ramo `payment` + `isActiveSubscription === false` (D) scatta anche quando `history_search` è falso o la parte `free` non c'entra. Nei commenti del codice c'è già "manca una parentesi tonda".
  - *Domanda:* per i progetti a crediti devono restare attive queste tre restrizioni? Se sì, con quali condizioni? Se no, il server deve leggere `metering` e `billing.status`, e la parentesi va corretta.
  - *Perché:* se restano, il blocco arriva con criteri legacy e non con saldo e `billing.status`.
- [ ] **Q3 — quale orologio vale per i crediti**
  - *Cosa verificare:* `isActiveSubscription` è `profile.subEnd + 3 giorni` (`models/project.js`). La cortesia crediti è `failedAt + courtesyDays` (`creditManager.markPaymentFailed`), e `expireGraces` usa solo `billing.graceUntil`.
  - *Domanda:* conferma che per i progetti a crediti il blocco dipende solo da `billing.status` e dal saldo, e non da `isActiveSubscription`?
  - *Perché:* con un pagamento fallito al rinnovo, il legacy blocca circa 4 giorni prima della fine della cortesia.
- [ ] **Q4 — chi aggiorna `profile.subEnd` dopo un rinnovo**
  - *Cosa verificare:* nel codice leggibile non ci sono scritture dirette di `profile.subEnd` per i pagamenti. Il gestore Stripe legacy (`pubmodules/s/stripe/index.js`) è offuscato e non l'ho letto.
  - *Domanda:* quale codice ed evento aggiornano `subEnd` a ogni rinnovo riuscito?
  - *Perché:* serve per sapere quando `isActiveSubscription` cambia.
- [ ] **Q5 — `courtesyDays` in produzione**
  - *Cosa verificare:* `helm/files/credits_pricing.json` (repo `tiledesk-argo`) non sovrascrive `courtesyCredits`: vale il default di `pricing.json`, cioè 50 crediti per 7 giorni.
  - *Domanda:* l'immagine di produzione è costruita da `features-2611/credits-plan` (o da un branch con lo stesso `pricing.json`)?
- [ ] **Q6 — profilo legacy dei progetti a crediti**
  - *Cosa verificare:* il progetto a crediti di test ha `profile.type: "free"`, `profile.trialDays: 14` e `trialExpired` calcolato da `createdAt`.
  - *Domanda:* è voluto che il profilo legacy resti anche sui crediti, o è un residuo della migrazione? Serve ripulirlo oppure basta che il client lo ignori (come ora)?
- [ ] **Q7 — price Stripe fuori da `plans`**
  - *Cosa verificare:* `helm/files/credits_pricing.json` elenca tre price (5000, 10000, 25000 crediti). Un abbonamento su un altro price resta sui quote.
  - *Domanda:* è il comportamento voluto? Come si aggiunge un nuovo piano crediti?
- [ ] **Q8 — campo `metering` al cambio di piano**
  - *Cosa verificare:* `metering` è assegnato da `assignMetering` (`routes/project.js`) in base al conto crediti e a `creditsFrom`; senza conto, o prima di `creditsFrom`, resta `quotes`.
  - *Domanda:* cosa succede al flag quando un progetto passa da quote a crediti o viceversa? Il client deve rileggerlo a ogni cambio?

---

## Task 2: Helper puri + tipi crediti

**File:**

- Nuovo: `src/app/utils/metering.util.ts`
- Nuovo: `src/app/utils/metering.util.spec.ts`
- Modifica: `src/app/models/project-model.ts`
- Modifica: `src/app/services/credits.service.ts` (portato nel Task 1)

**Interfacce prodotte:**

- `type ProjectMetering = 'credits' | 'quotes'`
- `getProjectMetering(project: any): ProjectMetering`
- `isCreditsMetering(project: any): boolean`
- `areCreditsExhausted(summary: CreditsSummary | null): boolean` (decisione C)
- `CREDITS_ERROR_CODES = { INSUFFICIENT_CREDITS: 13010, UNPRICED_MODEL: 13011, TRIAL_ENDED: 13012, DAILY_LIMIT: 13013 }`
- `getCreditsErrorCode(error: any): number | null`
- `isCreditsRefusal(error: any): boolean`

- [x] **Step 1: test che falliscono**

```ts
import { areCreditsExhausted, CREDITS_ERROR_CODES, getCreditsErrorCode, getProjectMetering, isCreditsMetering, isCreditsRefusal } from './metering.util';

describe('metering.util', () => {
  describe('areCreditsExhausted', () => {
    const balance = { included: 10, extra: 0, extraFrozen: false, available: 10 };

    it('is false while the summary is not loaded', () => {
      expect(areCreditsExhausted(null)).toBeFalse();
    });

    it('is true when no credit is available', () => {
      expect(areCreditsExhausted({ metering: 'credits', balance: { ...balance, available: 0 } })).toBeTrue();
      expect(areCreditsExhausted({ metering: 'credits', balance: { ...balance, available: -1 } })).toBeTrue();
    });

    it('is true when billing is suspended, canceled or the trial ended', () => {
      expect(areCreditsExhausted({ metering: 'credits', balance, billing: { status: 'suspended' } })).toBeTrue();
      expect(areCreditsExhausted({ metering: 'credits', balance, billing: { status: 'canceled' } })).toBeTrue();
      expect(areCreditsExhausted({ metering: 'credits', balance, billing: { status: 'trial_ended' } })).toBeTrue();
    });

    it('is false with credits and active or payment_failed billing', () => {
      expect(areCreditsExhausted({ metering: 'credits', balance, billing: { status: 'active' } })).toBeFalse();
      expect(areCreditsExhausted({ metering: 'credits', balance, billing: { status: 'payment_failed' } })).toBeFalse();
      expect(areCreditsExhausted({ metering: 'credits', balance, billing: { status: 'trial' } })).toBeFalse();
    });
  });

  describe('getProjectMetering', () => {
    it('returns credits only for metering credits', () => {
      expect(getProjectMetering({ metering: 'credits' })).toBe('credits');
    });

    it('treats quotes, a missing key and unknown values as quotes', () => {
      expect(getProjectMetering({ metering: 'quotes' })).toBe('quotes');
      expect(getProjectMetering({})).toBe('quotes');
      expect(getProjectMetering({ metering: 'other' })).toBe('quotes');
      expect(getProjectMetering(null)).toBe('quotes');
      expect(getProjectMetering(undefined)).toBe('quotes');
    });
  });

  describe('isCreditsMetering', () => {
    it('is true only for credits projects', () => {
      expect(isCreditsMetering({ metering: 'credits' })).toBeTrue();
      expect(isCreditsMetering({ metering: 'quotes' })).toBeFalse();
      expect(isCreditsMetering({})).toBeFalse();
    });
  });

  describe('getCreditsErrorCode', () => {
    it('reads the code of a 403 credits refusal', () => {
      expect(getCreditsErrorCode({ status: 403, error: { error_code: 13010, error: 'Credits balance not sufficient' } })).toBe(13010);
      expect(getCreditsErrorCode({ status: 403, error: { error_code: 13011, message: 'Model x is not available' } })).toBe(13011);
      expect(getCreditsErrorCode({ status: 403, error: { error_code: 13012 } })).toBe(13012);
      expect(getCreditsErrorCode({ status: 403, error: { error_code: 13013 } })).toBe(13013);
    });

    it('ignores other errors', () => {
      expect(getCreditsErrorCode({ status: 403, error: { error_code: 13001 } })).toBeNull();
      expect(getCreditsErrorCode({ status: 403, error: { message: 'Requests quota exceeded' } })).toBeNull();
      expect(getCreditsErrorCode({ status: 500, error: { error_code: 13010 } })).toBeNull();
      expect(getCreditsErrorCode(null)).toBeNull();
    });
  });

  describe('isCreditsRefusal', () => {
    it('is true for every credits code', () => {
      Object.values(CREDITS_ERROR_CODES).forEach((code) => {
        expect(isCreditsRefusal({ status: 403, error: { error_code: code } })).toBeTrue();
      });
    });

    it('is false for the legacy plan limit errors', () => {
      expect(isCreditsRefusal({ status: 403, error: { error: 'Maximum number of resources reached for the current plan', plan_limit: 3 } })).toBeFalse();
    });
  });
});
```

- [x] **Step 2:** eseguire e verificare il fallimento:

```bash
npx ng test --watch=false --browsers=ChromeHeadless --include=src/app/utils/metering.util.spec.ts
```

Atteso: FAIL, `Cannot find module './metering.util'`.

- [x] **Step 3: implementazione** `metering.util.ts`

```ts
import { CreditsSummary } from 'app/services/credits.service';

export type ProjectMetering = 'credits' | 'quotes';

/** Billing states in which the credits are finished (decision C) */
const EXHAUSTED_BILLING_STATUSES = ['suspended', 'canceled', 'trial_ended'];

/** error_code of the server (403) when a credits project cannot pay for an operation */
export const CREDITS_ERROR_CODES = {
  INSUFFICIENT_CREDITS: 13010,
  UNPRICED_MODEL: 13011,
  TRIAL_ENDED: 13012,
  DAILY_LIMIT: 13013,
};

const CREDITS_CODES: number[] = Object.values(CREDITS_ERROR_CODES);

/** Anything but 'credits' (also the projects stored before the key existed) keeps the plan quotas */
export function getProjectMetering(project: any): ProjectMetering {
  return project?.metering === 'credits' ? 'credits' : 'quotes';
}

export function isCreditsMetering(project: any): boolean {
  return getProjectMetering(project) === 'credits';
}

/** Credits finished (decision C). Unknown while the summary is loading. UI only: the server refuses the operations */
export function areCreditsExhausted(summary: CreditsSummary | null): boolean {
  if (!summary) {
    return false;
  }
  if (summary.billing && EXHAUSTED_BILLING_STATUSES.includes(summary.billing.status)) {
    return true;
  }
  return (summary.balance?.available ?? 1) <= 0;
}

export function getCreditsErrorCode(error: any): number | null {
  const code = error?.status === 403 ? error.error?.error_code : null;
  return CREDITS_CODES.includes(code) ? code : null;
}

export function isCreditsRefusal(error: any): boolean {
  return getCreditsErrorCode(error) !== null;
}
```

- [x] **Step 4:** `project-model.ts`:

```ts
import { ProjectMetering } from 'app/utils/metering.util';
// dentro l'interfaccia Project
  metering?: ProjectMetering;
```

- [x] **Step 5:** `credits.service.ts` (contratto server aggiornato):

```ts
export type CreditsBillingStatus = 'active' | 'payment_failed' | 'suspended' | 'canceled' | 'trial' | 'trial_ended';

// dentro CreditsSummary
  /** only with billing status trial or trial_ended */
  trial?: { until: string; dailyLimit: number | null; spentToday?: number };
```

In `en.json` e `it.json`, dentro `Credits.Billing`, aggiungere `trial` e `trial_ended` (il pannello navbar usa `'Credits.Billing.' + status`). Aggiungere anche i testi dei nuovi rifiuti: `Credits.TrialEndedTitle`, `Credits.TrialEndedText`, `Credits.DailyLimitTitle`, `Credits.DailyLimitText`.

- [x] **Step 6:** rieseguire il test. Atteso: PASS.

- [x] **Step 7: commit** — fatto: `b688308f1`, `feat(credits): project metering helpers and credits refusal codes` (6 file: `metering.util.ts`, `metering.util.spec.ts`, `project-model.ts`, `credits.service.ts`, `en.json`, `it.json`). Scostamenti dal piano: nello spec `toBe(true/false)` al posto di `toBeTrue/toBeFalse` (il progetto non ha `jasmine-matchers`); nel test di `areCreditsExhausted` cast `as any` sul summary.

```bash
git add src/app/utils/metering.util.ts src/app/utils/metering.util.spec.ts src/app/models/project-model.ts src/app/services/credits.service.ts src/assets/i18n/en.json src/assets/i18n/it.json
git commit -m "feat(credits): project metering helpers and credits refusal codes"
```

---

## Task 3: `MeteringService`, `ProjectPlanService` e interceptor

**File:**

- Nuovo: `src/app/services/metering.service.ts`
- Nuovo: `src/app/services/metering.service.spec.ts`
- Modifica: `src/app/services/credits.service.ts` (`metering$`)
- Modifica: `src/app/services/project-plan.service.ts:157-198`
- Modifica: `src/app/services/interceptor/log-requests.interceptor.ts`

**Interfacce:**

- Usa: helper del Task 2, `CreditsService`
- Produce: `MeteringService.setProject(projectId: string, metering: ProjectMetering)`, `isCredits: boolean`, `isCredits$: Observable<boolean>`, `presentCreditsRefused(code: number): void`
- `CreditsService.metering$: Observable<{ projectId: string; metering: ProjectMetering } | null>`, il valore grezzo del summary, anche `quotes`
- Nessuna dipendenza da `ProjectPlanService` (evita il ciclo: è `ProjectPlanService` che chiama `setProject`)

Le due fonti di `metering`: il project object (`projectPlan$`, cache client di 5 minuti) e il summary crediti (`GET /credits`, letto a ogni cambio progetto). Vince l'ultimo valore arrivato per il progetto corrente: così un progetto appena creato, che diventa `credits` dopo l'avvio asincrono del trial, viene riconosciuto senza aspettare la cache.

- [x] **Step 1:** `CreditsService.metering$`**.** In `publish()`, prima del filtro `metering === 'credits'`:

```ts
  private meteringSubject = new BehaviorSubject<{ projectId: string; metering: ProjectMetering } | null>(null);
  /** metering of the current project as the credits API sees it, also 'quotes' */
  metering$ = this.meteringSubject.asObservable();

  // in publish(), subito dopo il controllo projectId
    this.meteringSubject.next({ projectId, metering: getProjectMetering(summary) });
```

- [x] **Step 2: test che falliscono** `metering.service.spec.ts`

```ts
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { CreditsService } from './credits.service';
import { MeteringService } from './metering.service';
import { ProjectMetering } from 'app/utils/metering.util';

describe('MeteringService', () => {
  let service: MeteringService;
  let metering$: BehaviorSubject<{ projectId: string; metering: ProjectMetering } | null>;

  beforeEach(() => {
    metering$ = new BehaviorSubject(null);
    TestBed.configureTestingModule({
      providers: [
        MeteringService,
        { provide: CreditsService, useValue: { metering$ } },
        { provide: Router, useValue: { url: '/project/p1/home', navigate: jasmine.createSpy('navigate') } },
        { provide: TranslateService, useValue: { instant: (k: string) => k } },
      ]
    });
    service = TestBed.inject(MeteringService);
  });

  it('is not credits before a project is set', () => {
    expect(service.isCredits).toBeFalse();
  });

  it('follows the metering of the project object', () => {
    service.setProject('p1', 'credits');
    expect(service.isCredits).toBeTrue();
    service.setProject('p2', 'quotes');
    expect(service.isCredits).toBeFalse();
  });

  it('follows the credits API for the current project', () => {
    service.setProject('p1', 'quotes');
    metering$.next({ projectId: 'p1', metering: 'credits' });
    expect(service.isCredits).toBeTrue();
  });

  it('ignores the credits API of another project', () => {
    service.setProject('p1', 'quotes');
    metering$.next({ projectId: 'p2', metering: 'credits' });
    expect(service.isCredits).toBeFalse();
  });
});
```

- [x] **Step 3:** eseguire. Atteso: FAIL, modulo mancante. Verificato: `Can't resolve './metering.service'`.

```bash
npx ng test --watch=false --browsers=ChromeHeadless --include=src/app/services/metering.service.spec.ts
```

- [x] **Step 4: implementazione** `metering.service.ts`

```ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { CreditsService } from './credits.service';
import { CREDITS_ERROR_CODES, ProjectMetering } from 'app/utils/metering.util';

interface CurrentMetering {
  projectId: string | null;
  metering: ProjectMetering;
}

const REFUSAL_TEXTS: { [code: number]: { title: string; text: string } } = {
  [CREDITS_ERROR_CODES.INSUFFICIENT_CREDITS]: { title: 'Credits.RefusedTitle', text: 'Credits.RefusedText' },
  [CREDITS_ERROR_CODES.UNPRICED_MODEL]: { title: 'Credits.UnpricedRefusedTitle', text: 'Credits.UnpricedRefusedText' },
  [CREDITS_ERROR_CODES.TRIAL_ENDED]: { title: 'Credits.TrialEndedTitle', text: 'Credits.TrialEndedText' },
  [CREDITS_ERROR_CODES.DAILY_LIMIT]: { title: 'Credits.DailyLimitTitle', text: 'Credits.DailyLimitText' },
};

@Injectable({
  providedIn: 'root'
})
export class MeteringService {

  private current = new BehaviorSubject<CurrentMetering>({ projectId: null, metering: 'quotes' });
  isCredits$: Observable<boolean> = this.current.pipe(map((c) => c.metering === 'credits'), distinctUntilChanged());

  private alertOpen = false;

  constructor(
    private creditsService: CreditsService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.creditsService.metering$.subscribe((value) => {
      if (value && value.projectId === this.current.value.projectId) {
        this.current.next(value);
      }
    });
  }

  /** Called by ProjectPlanService with the fresh project object */
  setProject(projectId: string, metering: ProjectMetering) {
    this.current.next({ projectId, metering });
  }

  get isCredits(): boolean {
    return this.current.value.metering === 'credits';
  }

  /** The server refused an operation for the credits: one alert at a time, with the way to the credits page */
  presentCreditsRefused(code: number) {
    const match = this.router.url.match(/\/project\/([^\/?#]+)/);
    if (this.alertOpen || !match) {
      return;
    }
    const texts = REFUSAL_TEXTS[code] || REFUSAL_TEXTS[CREDITS_ERROR_CODES.INSUFFICIENT_CREDITS];
    this.alertOpen = true;
    Swal.fire({
      title: this.translate.instant(texts.title),
      text: this.translate.instant(texts.text),
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: this.translate.instant('Cancel'),
      confirmButtonText: this.translate.instant('Credits.SeeCosts'),
      reverseButtons: true,
    }).then((result) => {
      this.alertOpen = false;
      if (result.isConfirmed) {
        this.router.navigate(['/project', match[1], 'credits']);
      }
    });
  }
}
```

Aggiungere al spec un test per `presentCreditsRefused` (con `spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false }) as any)`): con due chiamate consecutive `Swal.fire` viene chiamato una volta sola; con il codice 13012 il titolo è `Credits.TrialEndedTitle`.

- [x] **Step 5:** `ProjectPlanService`, in `findCurrentProjectAmongAll` (`project-plan.service.ts:167-198`):

```ts
// nel constructor (public: lo usano PricingBaseComponent e i componenti che non la estendono)
    public meteringService: MeteringService,

// dentro projectPlanData
          metering: getProjectMetering(current_prjct.id_project),

// prima di this.projectPlan$.next(projectPlanData)
        this.meteringService.setProject(projectPlanData._id, projectPlanData.metering);
```

- [x] **Step 6: interceptor.** Sostituire il controllo portato dal branch con tutti i codici crediti e la delega al servizio:

```ts
        const creditsCode = getCreditsErrorCode(error);
        if (creditsCode) {
          this.injector.get(MeteringService).presentCreditsRefused(creditsCode);
        }
```

Rimuovere `CREDITS_INSUFFICIENT`, `CREDITS_UNPRICED_MODEL`, `creditsAlertOpen`, il metodo `presentCreditsRefused` locale e gli import di `Router`, `TranslateService` e `Swal` ormai inutilizzati. Resta `Injector` (lettura lazy: `MeteringService` dipende da `TranslateService`, che carica le traduzioni con `HttpClient`, che passa da questo interceptor).

- [x] **Step 7:** eseguire i test del Task 2 e del Task 3. Atteso: PASS. Build `npx ng build --output-path=.credits-build-tmp` senza errori.

- [x] **Step 8: commit** — fatto: `0b0eb1862`, `feat(credits): metering service and one alert for every credits refusal` (5 file: `metering.service.ts`, `metering.service.spec.ts`, `credits.service.ts`, `project-plan.service.ts`, `log-requests.interceptor.ts`). Scostamenti dal piano: (1) lo spec ha 7 test invece dei 4 previsti, anche per il caso "un alert alla volta" e per la coda; (2) `presentCreditsRefused` deduplica per codice e mette in coda i codici diversi (decisione dell'utente, dopo la prima versione che bloccava qualsiasi alert aperto); (3) l'interceptor ora gestisce 13010–13013 (prima solo 13010 e 13011); (4) lo spec `ProjectPlanService should be created` fallisce già prima del Task 3 (TestBed vuoto, il servizio non è fornito in root): non dipende dalle modifiche, da sistemare separatamente. Build e `tsc` senza errori. `environment.ts` escluso dal commit.

```bash
git add src/app/services/metering.service.ts src/app/services/metering.service.spec.ts src/app/services/credits.service.ts src/app/services/project-plan.service.ts src/app/services/interceptor/log-requests.interceptor.ts
git commit -m "feat(credits): metering service and one alert for every credits refusal"
```

---

## Task 4: `PricingBaseComponent`

**File:** `src/app/pricing/pricing-base/pricing-base.component.ts:49-52, 81-90`

**Interfacce:**

- Usa: `prjctPlanService.meteringService.isCredits` (Task 3)
- Produce, per tutte le sottoclassi e per `planLimitsBridge` della Home: `isCreditsMetering: boolean` (getter)

- [x] **Step 1:** aggiungere il getter (non un campo con subscription: tre sottoclassi, `home-cds`, `modal-preview-knowledge-base` e `bots-static`, non chiamano mai `getProjectPlan()` e con la subscription il flag sarebbe rimasto `false`; il getter legge il valore corrente del `BehaviorSubject` e non ha bisogno di unsubscribe):

```ts
  get isCreditsMetering(): boolean {
    return this.prjctPlanService.meteringService.isCredits;
  }
```

- [x] **Step 2:** `getProjectPlan()` non cambia. I limiti (`seatsLimit`, `chatBotLimit`, `kbLimit`) restano calcolati come oggi: sono i punti d'uso a ignorarli. Il getter vale solo per le rotte in cui `ProjectPlanService` aggiorna il progetto corrente: per le altre vedi la sezione "Componenti che calcolano i limiti da soli".

- [x] **Step 3:** build senza errori (`tsc` e `ng build` OK). Commit fatto: `d031a0fac`, 1 file (`pricing-base.component.ts`, +10 righe). Scostamento dal piano: getter al posto di campo e subscription (vedi step 1). Commit:

```bash
git commit -am "feat(credits): expose credits metering to the pricing base"
```

---

## Componenti che calcolano i limiti da soli

`MeteringService.isCredits` e il getter `isCreditsMetering` valgono per i componenti che ricevono il progetto da `ProjectPlanService`. Il servizio però aggiorna `projectPlan$` e il metering solo se l'id progetto è in seconda posizione nell'URL e la rotta non è tra quelle escluse (`get-chatbot`, `activate-product`, `install-template`, `install-template-np`, `create-project-itw`, `/projects`). Controllo del 2026-11-24: i componenti seguenti calcolano i limiti per un'altra via e vanno gestiti a parte.

**Regola:** se il componente ha un oggetto progetto proprio (da `getProjects()` o `GET projects/:id`) e la rotta è esclusa dal servizio, il flag si ricava da quell'oggetto con `isCreditsMetering(project)` di `metering.util`. Se la rotta passa da `ProjectPlanService`, si usa `MeteringService.isCredits` (o il getter della base).

| Componente | Come calcola i limiti | Come si legge il flag | Dove |
|---|---|---|---|
| `get-start-chatbot-fork.component.ts` (non estende la base; rotta `get-chatbot/:botid`) | proprio `getProjectPlan(project)`: `chatBotLimit` da `project.profile`; progetto da `projectService.getProjects()` | `isCreditsMetering(this.project)`, non `MeteringService` | Task 5 step 6 |
| `install-template.component.ts` (estende la base; rotte `install-template*`) | progetto da `getProjects()`; chiama il `getProjectPlan()` della base, ma su queste rotte `projectPlan$` non si aggiorna (valore precedente o `null`) | `isCreditsMetering(project)` con il progetto già in mano; salvare `metering` anche nel sottoinsieme passato a `auth.projectSelected(...)` | Task 5 step 5, Task 9 |
| `project-edit-add.component.ts` (non estende la base) | subscription propria a `projectPlan$`: `seatsLimit` da `PLAN_SEATS` / `profile_agents` | `MeteringService` iniettato (`isCredits`): il progetto arriva da `ProjectPlanService` | Task 6 step 4 |
| `home.component.ts` | `planLimitsBridge` (istanza di `PricingBaseComponent`) più un proprio `getProjectPlan()` | `planLimitsBridge.isCreditsMetering` (getter) | Task 5 step 3, Task 8 step 4 |
| `QuotesService.getQuoteLimits(project)` e `computeAgentTokensUsage` (`quota-usage.util.ts`) | limiti di consumo da `PLANS_LIST` e `profile.quotes`, dopo `GET projects/:id`; non passano da `projectPlan$`. Usati da knowledge-bases, navbar, home-quick-cards e Home | il servizio non cambia: il chiamante salta la chiamata o i limiti con il proprio flag | Task 7 step 1–2, Task 8 |
| `chatbot-modal.component.ts` | riceve `chatBotLimit` dal chiamante, nessuna logica propria | nulla da fare | — |

**Verificati (Task 5):** `create-project-itw` è `CreateProjectComponent`: fa il fork del template (`installTemplate`, solo server), nessun limite client. `activate-product` è `ActivateAppsumoProductComponent`: crea solo il progetto, nessun chatbot. `home_old` è stata eliminata (nessun riferimento).

---

## Pattern per i Task 5–8

**Blocco legacy (contenuto invariato):**

```ts
  // prima
  if (this.chatBotCount < this.chatBotLimit) {
    this.createBlankTilebot();
  } else {
    this.presentDialogReachedChatbotLimit();
  }

  // dopo
  if (this.isCreditsMetering || this.chatBotCount < this.chatBotLimit) {
    this.createBlankTilebot();
  } else {
    this.presentDialogReachedChatbotLimit();
  }
```

Template:

```html
<appdashboard-chatbot-alert *ngIf="!isCreditsMetering && chatBotCount > chatBotLimit && isVisiblePAY">
```

**Errore del server:** l'alert lo mostra l'interceptor. Nei gestori di errore delle chiamate elencate nel "Contratto server", saltare l'errore generico se è un rifiuto crediti:

```ts
  }, (error) => {
    if (isCreditsRefusal(error)) {
      return;
    }
    // ... gestione errore esistente invariata
  });
```

Se il gestore resetta anche uno stato della UI (spinner, bottone disabilitato), il reset va **prima** del `return`.

---

## Task 5: Chatbot

**Inventario dei punti di creazione** (verificato sul codice con ricerca di `createChatbotFromScratch`, `importChatbotFromJSONFromScratch`, `createFaqKb`, `installTemplate`, `duplicateChatbot`). "Controllo client" = gate `isCreditsMetering ||` sul limite; "Solo server" = nessun gate lato client, sul credits il 403 13010–13013 arriva dal server.

| Componente | Punto di creazione | Ingresso utente | Controllo client | Gestore errore |
|---|---|---|---|---|
| `bots-list.component.ts` | `createBlankTilebot` → `createTilebotBotFromScratch` (`POST faq_kb`) | New Flow → AI Agent (`CreateAgentModal`, anche il vibe coder); CreateChatbotModal (Conversational, Voice, Copilot) | Sì (step 1) | Solo log: invariato |
| `bots-list.component.ts` | `duplicateChatbot` / `forkTemplate` | Duplica agente | Sì (step 1) | Solo log: invariato |
| `bots-list.component.ts` | `importChatbotFromJSON` (`importjson/null?create=true`) | Upload JSON | Sì (step 1) | `isCreditsRefusal` (fatto) |
| `templates.component.ts` | `createBlankTilebot`, `importChatbotFromJSON` | Pagina template | Sì (step 2) | `isCreditsRefusal` su import (fatto) |
| `template-detail.component.ts` | `forkTemplate` (`installTemplate`) | Installa template | Sì (step 2) | Solo log: invariato |
| `community-template-dtls.component.ts` | `forkTemplate` | Installa template community | Sì (step 2) | Solo log: invariato |
| `bot-create.component.ts` | `createBlankTilebot`, `createBot` (`createFaqKb`), import JSON | Modale di creazione | Sì (step 2) | `createBot`: toast saltato, flag di errore invariati; import: `isCreditsRefusal` (fatto) |
| `home.component.ts` | `assertCanCreateChatbot` (gate), `createHomeVoiceAgent`, `createHomeAgentFromPrompt` | Home: select Voice/Copilot; box vibe coder (Start); prompt da `/build` e dall'onboarding (arrivano al box, la creazione parte con Start) | Sì (step 3) | `isCreditsRefusal` in entrambi (fatto) |
| `home-create-chatbot.component.ts` | nessuna creazione: `goTocreateBlankTilebot` gate, poi navigazione verso `my-chatbots/all` | Home: card creazione | Sì (step 5) | — |
| `home-quick-cards.component.ts` | `createChatbotFromKbOfficialResponderTemplate`, import JSON | Home: flow / KB | Sì (step 4) | Import senza gestore errore: nessuna modifica |
| `home-kb.component.ts` | import JSON | Home: KB | Sì (step 5) | Solo log: invariato |
| `home-cds.component.ts` | import JSON | Home: CDS | Sì (step 5); il ramo limite non scatta mai (`chatBotLimit` non assegnato) | Solo log: invariato |
| `knowledge-bases.component.ts` | `createChatbotfromKbOfficialResponderTemplate` → import JSON | "Create your AI Agent with one click" | Sì (step 5) | Solo log: invariato |
| `app-store.component.ts` | `createExternalBot` (gate, poi navigazione verso la pagina di creazione) | App store | Sì (step 5) | Non crea direttamente: nessuna modifica |
| `install-template.component.ts` | `forkTemplate`, `importTemplate` | Rotte `install-template*` | Sì, con `isCreditsMetering(project)` (step 5) | Solo log: invariato |
| `get-start-chatbot-fork.component.ts` | `forkTemplate`, `importTemplate` | Rotta `get-chatbot` | Sì, con `isCreditsMetering(this.project)` (step 6) | Solo log: invariato |
| `create-chatbot.component.ts` | import JSON | Modale di import | Solo server | `isCreditsRefusal` (fatto) |
| `cnp-templates.component.ts` | `forkTemplate`, `createChatbotFromScratch`, import JSON | Onboarding nuovo progetto | Solo server | Solo log: invariato |
| `create-new-project/onboarding-content` | `createBot` (`createFaqKb`) esiste ma non è chiamato: in `callback('createNewProject')` la chiamata è commentata | `/create-new-project` (navbar, lista progetti): crea solo il progetto e va in home | — | Saltato dalle modifiche recenti. Nessun `isCreditsRefusal` |
| `create-project-wizard/onboarding` | `createBot` (`createFaqKb`) via `gotToCreateBot` | Rotta `project/:id/onboarding/:lang/:name` | — | Saltato: `configure-widget.continueToNextStep` chiama `goToOnboardingInstallScript`; `goToOnboardingChatbotSetUp` è commentato. Signup va su `/onboarding` (welcome), non su questo wizard |
| `create-project-wizard/create-project` (rotta `create-project-itw/:botid`) | `forkTemplate` (`installTemplate`) | Wizard da chatbot template | Solo server; nessun limite client (verificato) | Solo log: invariato |
| `bots/flow-webhooks` | `createChatbotFromScratch` (webhook) | Nuovo webhook | Solo server | Solo log: invariato |
| `activate-appsumo-product` (rotta `activate-product`) | nessuna creazione di chatbot (solo `createProject`) | Attivazione prodotto | — | — |
| `build-from-website` | nessuna creazione di chatbot (solo progetto); il prompt va alla home | `/build` | — | — |


- [x] **Step 1:** pattern sui limiti in `bots-list.component.ts` (`duplicateChatbot`, `createBlankTilebot`, `fileChangeUploadChatbotFromJSON`) + `.html:67-68`
- [x] **Step 2:** `templates.component.ts` + `.html:67-69`; `template-detail.component.ts`; `community-template-dtls.component.ts`; `bot-create.component.ts`
- [x] **Step 3:** `home.component.ts` → `assertCanCreateChatbot()`: `if (this.planLimitsBridge.isCreditsMetering) { return true; }` prima del corpo legacy
- [x] **Step 4:** `home-quick-cards`: conteggio senza `/ chatBotLimit`, niente `LimitExceeded`, niente CTA Upgrade/Increase su credits (`showFlowsUpgradePlan` e `flowsCountOverLimit` a `false` se `isCreditsMetering`); pattern in `onAddFlowClick` e `createChatbotFromKbOfficialResponderTemplate`
- [x] **Step 5:** `home-create-chatbot`, `home-kb`, `home-cds`, `app-store.component.ts` (`createExternalBot`), `install-template.component.ts` (rotta esclusa da `ProjectPlanService`: flag da `isCreditsMetering(project)`, vedi "Componenti che calcolano i limiti da soli")
- [x] **Step 6:** `get-start-chatbot-fork.component.ts`: la rotta `get-chatbot` è esclusa da `ProjectPlanService`, quindi `MeteringService` non è affidabile; usare `isCreditsMetering(this.project)` (di `metering.util`) in `importTemplate` e nel ramo `chatBotLimit`
- [x] **Step 7:** errori del server: `isCreditsRefusal` nei gestori di create (`POST /faq_kb`), fork (`faq-kb.service.ts:180,199`) e import JSON con `create=true` (`faq.service.ts:297`) in tutti i componenti degli step 1–6 **e** in quelli senza controllo lato client (vedi sotto). Su crediti il 403 13010–13013 arriva dal server: l'alert lo mostra l'interceptor, il gestore del componente deve solo non mostrare il proprio errore generico. Dove il gestore non mostra nulla, non serve modificarlo.
  - Solo lato server, da aggiungere: `create-chatbot.component.ts` (import JSON, riga ~256); `cnp-templates.component.ts` (`installTemplate` ~323, `createChatbotFromScratch` ~383, import JSON ~613); `create-project-wizard/create-project/create-project.component.ts` (`installTemplate` ~418); `flow-webhooks.component.ts` (`createChatbotFromScratch` ~213)
  - `knowledge-bases.component.ts`, bottone "Create your AI Agent with one click" (`CreateYourAIAgentWithOneClick`, `.html:321`) → `createChatbotfromKbOfficialResponderTemplate` (~1712) → `findKbOfficialResponderAndThenExportToJSON` (~1736) → `exportKbOfficialResponderToJSON` (~1762) → dialog "Choose a name for your AI Agent" (`ChooseNameForYourAIAgent`, `ModalChatbotNameComponent`, ~1790) → `importChatbotFromJSON` (~1807) → `importChatbotFromJSONFromScratch` (`POST faq_kb/importjson/null/?create=true`). È creazione di chatbot legata al namespace.
    - **Controllo lato client (non coperto dal piano):** `chatBotLimit` con `myChatbotOtherCount` (~1714–1720), stesso schema di `bots-list`. Va nel Task 5: `this.isCreditsMetering ||` sui due controlli, come negli step 1–2.
    - **Server:** il gestore errore dell'import (~1819) registra solo il log: nessuna modifica necessaria.
    - Non è import di contenuti: `kbService.importContents` (righe ~2053–2287) resta nel Task 7 step 3.
  - **Esito:** gestori modificati con `isCreditsRefusal` (ritorno anticipato o toast saltato): `bots-list`, `templates`, `bot-create` (import JSON; in `createFaqKb` solo il toast, i flag di errore restano perché sono ciò che chiude la modale: senza, la modale mostrerebbe il check di successo), `home.component` (`createHomeVoiceAgent` e `createHomeAgentFromPrompt`, il secondo dopo il reset di `vibeCoderBusy`), `create-chatbot`. Gestori che già non mostrano nulla (solo `logger.error`), lasciati invariati: create/fork di `bots-list`, `templates`, `template-detail`, `community-template-dtls`, `install-template`, `get-start-chatbot-fork`, import di `home-kb`, `home-cds`, `knowledge-bases`; `home-quick-cards` (import senza gestore errore); `cnp-templates` (tre punti), `create-project`, `flow-webhooks`. `onboarding` e `onboarding-content` non creano più il chatbot (vedi inventario): nessuna modifica.
  - **Vibe coder:** tutti gli ingressi passano da `VibeCoderComponent.emitStart` → `home.onHomeVibeCoderStart` (gate `assertCanCreateChatbot`, già su crediti) oppure da `CreateAgentModalComponent` → `bots-list.createBlankTilebot` (gate già presente). `createHomeAgentFromPrompt` (`faq_kb` POST) ha il gate e il gestore errore con `isCreditsRefusal`. Il template del vibe coder non ha limiti propri. Il wizard `create-project-wizard/onboarding` non è più nel flusso (vedi inventario).
  - **`home-quick-cards.onAddFlowClick` (corretto dopo verifica sul server):** su credits resta disattivato solo il controllo trial scaduto (`free` + `trial_expired`): la sua modale porta a `project/:id/pricing` (legacy), contro GL-4 e GL-5. Il controllo abbonamento non attivo (`payment` + `!subscription_is_active`) è **disattivato anche su credits dal 2026-11-25** (regola: nessun paywall client-side, il server blocca). Un progetto credits è pagato con un abbonamento Pro (`CreditManager.activateSubscription`, `profile.type: 'payment'`; i pagamenti one-off usano `profile.subEnd`, con `PREPAID_GRACE_MS` di 3 giorni come `Project.isActiveSubscription`). La modale `displaySubscripionHasExpiredModal` dice "problema di pagamento, contattaci" e apre una mail, senza passare dalla pricing. La prima versione lo aveva disattivato per un'assunzione sbagliata (nessun abbonamento legacy sui progetti credits).
    - **Verificato sul server:** `courtesyDays` di default è **7** (`pubmodules/credits/pricing.json`), non 3. La cortesia parte da `markPaymentFailed` (webhook `invoice.payment_failed`, `failedAt = now`) e finisce a `failedAt + 7 giorni`. `subscription_is_active` diventa falso a `profile.subEnd + 3 giorni` (`models/project.js`). Le due date non coincidono: se il pagamento fallisce al rinnovo, la modale blocca circa 4 giorni prima che il server smetta di accettare la creazione. Non ho verificato eventuali override del pricing in deploy.
    - **Superato (2026-11-25):** la nota precedente chiedeva che il blocco per abbonamento sui crediti seguisse `billing.status`. Con la regola "nessun paywall client-side sui crediti" il client non blocca più per abbonamento su credits, né con `billing.status` né con `subscription_is_active`. Stessa regola per gli altri controlli sull'abbonamento nel file (righe ~826, 860, 927, Task 6 e 7): da applicare quando si arriva a quei Task.
    - **G1 e G3 disattivati su credits (2026-11-25, commit `328dd3673`):** `app.component.ts` (`redirectToPricing`) non rimanda più a `/pricing/te` o `/unauthorized-to-upgrade` se `isCreditsMetering(project)`; `project-profile.guard.ts` ritorna `true` subito per i progetti credits, quindi non scattano né i controlli trial/abbonamento né quelli per piano (GL-6), né il redirect a `-demo`.
    - **G2 (sidebar) non è un redirect attivo:** `redirectToPricing` in `sidebar.component.ts` (riga ~3165) non è chiamato da nessuno. `openChat()` non lo usa e il template non lo usa. La voce precedente del piano ("redirect all'apertura della chat") era sbagliata. Nessuna modifica necessaria per i crediti; resta solo da decidere se rimuovere il metodo morto.
- [ ] **Step 8: verifica manuale** su un progetto credits e uno legacy: sul credits si creano chatbot oltre il limite free e non compare il banner; sul legacy il blocco resta. Con trial a crediti scaduto (13012) la creazione mostra un solo alert e nessun errore generico
- [x] **Step 9:** commit `feat(credits): chatbot limits only on quotes projects` (fatto: `f3d47d4c9`, 2026-11-24)

---

## Task 6: Teammates

- [x] **Step 1:** (fatto 2026-11-25, non committato) `users.component.`*: banner seats con `*ngIf="!isCreditsMetering && …"`; bottone Invite:

```html
[disabled]="(!isCreditsMetering && projectUsersLength + countOfPendingInvites >= seatsLimit) || !PERMISSION_TO_INVITE"
```

`goToAddUser()`: su credits navigazione diretta; ramo legacy invariato.

- [x] **Step 2:** (fatto 2026-11-25, non committato) `user-edit-add.component.`*: stessi `[disabled]` (righe 151, 167, 189, 207), banner 45-125, `invite()` senza controllo seats su credits; `isCreditsRefusal` nel gestore errore di `POST /project_users/invite`
- [x] **Step 3:** (fatto 2026-11-25, non committato) `home-quick-cards` (seats: 226-236, 309-324, 720-734, 916-989; `.html:247-285`), `home-create-teammate`
- [x] **Step 4:** (fatto 2026-11-25, non committato) `project-edit-add` (2318-2463; `.html:278,310,662`): non estende `PricingBaseComponent`, quindi iniettare `MeteringService` e usare `isCredits$`; su credits (decisione 2026-11-25): se `profile.type` è `free`, "Your current plan" mostra `Credits.Billing.trial` ("Trial" / "Prova") senza "( N seats x € 0.00 )" e senza il click verso pricing; la riga "Seats redeemed" è nascosta per tutti i piani a crediti
- [x] **Step 5 (commit):** commit `feat(credits): seats limits only on quotes projects` fatto come `a9fa9df0e` (2026-11-25).
- [x] **Step 5 (verifica manuale, da fare):** inviti oltre `PLAN_SEATS` su credits; progetto legacy invariato

---

## Task 7: Knowledge base

- [x] **Step 1 (fatto 2026-11-25, non committato):** `home-quick-cards`: niente `/ kbNamespaceLimit` e `/ kbLimit`, niente CTA `showKbUpgradePlan` su credits; non chiamare `QuotesService.getProjectQuotes` per i namespace se credits
  - `showKbLimit` e `showKbContentsLimit` con `!isCreditsMetering` (nascondono anche lo stato "oltre il limite"), `showKbUpgradePlan` ritorna `false` su credits, `openModalKbOverLimit` esce subito su credits (come `openModalSeatsOverLimit`), `loadKbData` non chiama `getProjectQuotes` su credits (`kbNamespaceLimit = null`).
- [x] **Step 2 (fatto 2026-11-25, non committato):** `knowledge-bases.component.html:130-132`: `{{ totalCount }}` senza `/{{ quotas?.kbs }}` su credits; in `.ts:881-888` non chiamare `getProjectQuotes` su credits
  - Template: `/{{ quotas?.kbs }}` dentro `<ng-container *ngIf="!isCreditsMetering">`. `getQuotas()` esce subito su credits (`quotas` serve solo a quell'etichetta).
- [x] **Step 3 (fatto 2026-11-25, non committato):** `knowledge-bases.component.ts` (estende `PricingBaseComponent`): `isCreditsRefusal` **prima** dei rami `plan_limit` / errore generico in `createNewNamespace` (1338-1365), import JSON (2059-2075), `onAddKb` (3683-3754), `onAddMultiKb` (3885-3948) e upload CSV. Attenzione: `POST /kb` risponde con `plan_limit: undefined` (forma A'), quindi senza questo controllo finirebbe nel ramo generico
  - Controllo `isCreditsRefusal` con `return` anticipato (l'alert lo mostra l'interceptor) in: `createNewNamespace`, i tre gestori di `importContents` (nel primo, con modale di caricamento, si chiude il caricamento solo se è ancora visibile: `Swal.isLoading()`, perché l'alert dell'interceptor lo sostituisce), `onAddKb` (con `doneCb(false)`), `importSitemap`, `onAddMultiKb` e l'`addKb` del flusso di aggiornamento di un contenuto. Senza il controllo, un 13010 finirebbe nelle modali legacy "Upgrade" (verso `/pricing`) o "Contact us" e la `Swal.fire` generica sostituirebbe l'alert crediti.
  - **Upload CSV (`modal-faqs`): non modificato.** L'errore imposta solo `parse_err = true` e mostra "errore durante l'upload", senza CTA di upgrade né paywall (serve anche per uscire dallo stato "Processing").
  - Non toccato: il ramo "Maximum number of resources reached for the current plan" in `createNewNamespace` e il messaggio `plan_limit` dell'import JSON restano per i quote.
- [x] **Step 4 (fatto 2026-11-25, non committato):** `modal-preview-knowledge-base.component.ts` (781-783, 930-932): accanto al ramo `error_code === 13001`, per `isCreditsRefusal(err)` mostrare nell'area risposta il testo crediti (`Credits.RefusedText`, o il testo specifico per 13011, 13012, 13013) e impostare lo stesso flag che nasconde tempi e dimensione del prompt. L'alert dell'interceptor compare comunque
  - **Correzione al piano: l'alert dell'interceptor NON compare nello streaming.** `OpenaiService.askGptStream` usa `fetch`, non `HttpClient`, e lo streaming è il default (`previewUseStream = true`). Inoltre l'errore arriva come corpo grezzo (`{ success, message, error_code }`, senza `status`), quindi `isCreditsRefusal` non lo riconosceva e l'area mostrava il `message` inglese del server. Il server risponde a `/kb/qa` con `403 { success: false, message, error_code }` (`routes/kb.js` ~486-491, ~512-516).
  - `OpenaiService.askGptStream`: se la risposta non è ok ed è un rifiuto crediti (403 con codice 13010-13013), l'errore viene emesso nella forma di `HttpErrorResponse` (`{ status, error: body }`); gli altri errori restano il corpo grezzo, come prima (i quote non cambiano).
  - Preview KB: nuovo `showCreditsRefusal(err, viaInterceptor)`, primo ramo sia in `askAI` (HttpClient: l'alert c'è già dall'interceptor) sia in `handleAskAIError` (stream: l'alert si presenta con `prjctPlanService.meteringService.presentCreditsRefused(code)`). L'area risposta mostra il testo del codice (`CREDITS_REFUSAL_TEXTS`) e imposta `aiQuotaExceeded`, il flag che nasconde tempi e dimensione del prompt (`*ngIf="!aiQuotaExceeded"`).
  - `REFUSAL_TEXTS` spostato da `metering.service.ts` a `metering.util.ts` come `CREDITS_REFUSAL_TEXTS` (stessi testi, riusato dal servizio e dall'anteprima); nuovi test in `metering.util.spec.ts`.
- [x] **Step 5 (2026-11-25): nessuna modifica necessaria.** `modal-preview-settings` non fa chiamate LLM con un'area risposta: gli unici gestori di errore elencano modelli e integrazioni (`getLlmModels`, `getOpenRouterModels`, ...) e si limitano a loggare, con ripiego sulle liste statiche. La chiamata LLM dell'anteprima è `askGpt`/`askGptStream` in `modal-preview-knowledge-base` (Step 4). Il riferimento a "forma B" del piano non ha un punto di applicazione in questo componente.
- [ ] **Step 6:** verifica manuale + commit `feat(credits): kb limits only on quotes projects`
  - Build Angular 15 OK (exit 0, 2026-11-25). Test: 1028 eseguiti, 279 falliti, tutti `should create` / `should be created` con `NullInjectorError` (preesistenti), nessun fallimento nuovo; i 2 test aggiunti passano.
  - **Verifica manuale da fare (credits):** Home: card Knowledge Base senza `/N` né CTA di upgrade. Pagina KB: "Total contents: N" senza `/N`. Aggiungere contenuti, sitemap, import JSON con crediti insufficienti: un solo alert crediti, nessuna modale "Upgrade"/"Contact us". Preview KB (streaming acceso e spento): testo crediti nell'area risposta, nessun tempo né dimensione del prompt, alert con "Vedi i costi". **Quote:** le stesse azioni si comportano come prima (limiti `/N`, CTA, modali legacy).

---

## Task 8: Quote di consumo (navbar + Home)

> **Nota 2026-11-25:** il pannello crediti della navbar e la pagina `/project/:id/credits` ("Credits and costs") sono opera di Giovanni e se ne occupa lui. Non vanno toccati da questo branch. Restano da chiarire con lui: i due pulsanti "Upgrade Plan" sui progetti a crediti (navbar e pannello), il trial senza data di fine (il pannello mostra solo "Trial"), la data "Included credits renewal" che viene da `period.end` (fine periodo, non fine trial) e la stima di fine periodo che non tiene conto della scadenza del trial.

> **Step 1–3: di Giovanni, non fanno parte del lavoro di questo branch** (pannello crediti della navbar). Restano qui solo come riferimento di cosa gli serve.

- [ ] **Step 1 (Giovanni):** navbar: il pannello crediti è visibile se `meteringService.isCredits$`; se il summary non è ancora caricato mostrare il pannello crediti vuoto, **non** le quote
- [ ] **Step 2 (Giovanni):** navbar: su credits non calcolare `conversationsRunnedOut`, `emailsRunnedOut`, `tokensRunnedOut`, `voiceRunnedOut` (la `POST /quotes` serve ancora per `resp.credits`)
- [ ] **Step 3 (Giovanni):** navbar: nel pannello crediti mostrare i dati del trial quando c'è `credits.trial` (scadenza `until`, `spentToday` / `dailyLimit`) e lo stato `trial_ended`. Il chip rosso (`credits-chip--low` e la riga "Available" in `credits-usage-value--low`) usa `areCreditsExhausted(credits)` invece di `credits.balance?.available <= 0`; l'avviso `payment_failed` resta com'è
- [x] **Step 4:** Home (`home.component.ts:1066-1274`, `.html:236-676`): nascondere il banner consumi su credits. Fatto con il getter `isCreditsProject` (legge `planLimitsBridge.isCreditsMetering`, cioè `MeteringService.isCredits`): `home.component.html:236` ha `&& !isCreditsProject` (il contenitore comprende anche lo skeleton) e `showQuotaBannerDashletToggle` è falso su credits, quindi sparisce anche la voce "Current usage" dal menu dashlet. Il calcolo dei flag `*RunnedOut` nel componente resta: senza banner non ha effetto. La preferenza `quotaBanner` salvata non viene toccata. Su un progetto a quote nulla cambia
- [ ] **Step 5:** verifica manuale + commit `feat(credits): consumption quotas only on quotes projects`. Verifica:
  - **Progetto a crediti**, Home: nessun banner "Current usage" (né il suo skeleton di caricamento); il menu delle impostazioni dashlet non elenca "Current usage"; gli altri blocchi (Flows, Overview) sono come prima. Può comparire un istante lo skeleton al primo caricamento, finché `MeteringService` non conosce il metering: da annotare se succede
  - **Progetto a quote**, Home: banner presente con le barre, l'avviso di quota esaurita come prima; il menu dashlet ha "Current usage" e il toggle lo nasconde e lo mostra
  - Passando da un progetto a crediti a uno a quote senza ricaricare, il banner torna a comparire sul progetto a quote

---

## Task 9: `localStorage` e `project_bs`

- [x] **Step 1:** `activate-appsumo-product.component.ts:375-382`: aggiungere `metering` al subset salvato (la sorgente è `project.id_project.metering`: l'elemento della lista è il project-user, non il progetto)
- [x] **Step 2:** (implementato come `syncStoredProjectMetering` in `metering.util.ts`, testato in `metering.util.spec.ts`, chiamato da `findCurrentProjectAmongAll`) in `ProjectPlanService.findCurrentProjectAmongAll`, se `localStorage[<projectId>]` esiste e il suo `metering` differisce da quello fresco, aggiornare solo quella chiave (stesso flusso di salvataggio, nessuna nuova chiave). Copre anche i progetti salvati dopo `POST /projects/`, che non ha `metering`:

```ts
const storedJson = localStorage.getItem(projectPlanData._id);
if (storedJson) {
  const stored = JSON.parse(storedJson);
  if (stored.metering !== current_prjct.id_project.metering) {
    stored.metering = current_prjct.id_project.metering;
    localStorage.setItem(projectPlanData._id, JSON.stringify(stored));
  }
}
```

- [x] **Step 3:** regola per i componenti: leggere `metering` da `MeteringService` o da `PricingBaseComponent.isCreditsMetering`, **mai** da `project_bs` o da `localStorage` (verificato: nessun componente lo legge da lì; la regola è anche nel doc-comment di `syncStoredProjectMetering`)
- [ ] **Step 4:** commit `fix(credits): keep the stored project metering in sync`

---

## Task 10: Verifica finale

- [ ] `npx ng test --watch=false --browsers=ChromeHeadless --include=src/app/utils/metering.util.spec.ts --include=src/app/services/metering.service.spec.ts` → PASS
- [ ] `npx ng build --output-path=.credits-build-tmp` → nessun errore. Ripetere su ogni branch di destinazione: `master-STAGE-NEW` (Angular 15) e `master-ar-roles` (Angular 14.2.2), dopo `npm install` con il `package.json` del branch
- [ ] QA su stage con: un progetto credits (`6b044d918e0cc80013fbb76c`), un progetto appena creato (diventa credits dopo l'avvio del trial), un progetto legacy:

| Controllo | credits | legacy |
|-----------|---------|--------|
| Crea chatbot oltre il limite free | consentito | modale limite |
| Invita teammate oltre i seats | consentito | bloccato |
| Quick cards: `x / limite` | solo `x` | `x / limite` |
| Menu Current usage | pannello crediti (con trial se presente) | quote |
| Banner consumi Home | nascosto | visibile |
| 403 13010 / 13012 / 13013 (crea chatbot, invita, namespace, KB, preview) | un solo alert con il testo giusto, nessun errore generico | n/a |
| 403 13011 (preview con modello non gestito) | alert + testo nella preview | n/a |
| Progetto appena creato | passa a credits senza logout | n/a |
| Route con `ProjectProfileGuard` e redirect trial | secondo la tabella "Feature gating per piano" | invariate |

### Regressione su progetto a quote (checklist, 2026-11-25)

Verifiche su un progetto **non a crediti**, in base alle modifiche dei Task 1–7: il comportamento deve restare quello di prima. Esito da annotare nel log.

- [x] **Preview LLM e KB (Task 1, 7):** le impostazioni della preview mostrano i modelli come prima, con l'etichetta "Nx tokens" sui GPT; una domanda in preview KB mostra `prompt size` moltiplicato per il moltiplicatore (valore come prima); con token esauriti l'errore 13001 appare come prima
- [x] **Chatbot (Task 5):** oltre il limite del piano la creazione è bloccata con la modale di limite; il banner chatbot in `bots-list` e `templates` compare; da `get-start-chatbot-fork` il limite è lo stesso; il conteggio nella Home è invariato
- [x] **Teammate (Task 6):** oltre `PLAN_SEATS` il banner e l'invito bloccato compaiono; il pulsante di invito della Home mostra il limite seat (`showTeammatesLimit`) e apre il paywall quando serve; in `project-edit-add` la riga "Seats redeemed" è visibile
- [x] **KB (Task 7):** Home con `/N` sui contenuti KB e sul conteggio namespace; pagina KB con "Total contents: N/N"; oltre il limite dei contenuti compaiono l'avviso e il CTA di upgrade e il paywall si apre; namespace e import oltre il limite mostrano il messaggio di limite
- [ ] **Trial e redirect:** il popup "trial terminato" si apre nei casi in cui si apriva; redirect a pricing e `-demo` (`app.component`, `project-profile.guard`) invariati; il gate abbonamento in `onAddFlowClick` è attivo
- [ ] **Errori del server:** su quote non compaiono 13010–13013; gli errori di quota mantengono il messaggio di prima
- [ ] **`localStorage` del progetto (Task 9):** procedura sotto (T9-1 … T9-5)

  Nella console del browser (DevTools → Console), con `<QUOTE_ID>` l'id di un progetto a quote e `<CREDITS_ID>` quello di un progetto a crediti (`6b044d918e0cc80013fbb76c` su stage):

  ```js
  const show = (id) => console.log(JSON.parse(localStorage.getItem(id)));
  ```

  | # | Passi | Esito atteso |
  |---|-------|--------------|
  | T9-1 | Apri `/project/<QUOTE_ID>/home`, aspetta che la pagina carichi, poi `show('<QUOTE_ID>')` | `_id`, `name`, `role`, `operatingHours` (e gli altri campi di prima) presenti; `metering` assente oppure `"quotes"`, **mai** `"credits"` |
  | T9-2 | Stesso progetto: `const p = JSON.parse(localStorage.getItem('<QUOTE_ID>')); delete p.metering; localStorage.setItem('<QUOTE_ID>', JSON.stringify(p));` poi ricarica la pagina e digita di nuovo nella console `show('<QUOTE_ID>')` (stesso comando di T9-1) | gli altri campi sono invariati; `metering` è tornato `"quotes"` (se il server lo manda) o resta assente. Mai `"credits"` |
  | T9-3 | Su quel progetto vai in Home, chatbot, teammate, KB | limiti `x / N`, banner, paywall e redirect come prima (checklist sopra). Nessun errore rosso in console |
  | T9-4 | Apri `/project/<CREDITS_ID>/home`, `show('<CREDITS_ID>')`, poi `show('<QUOTE_ID>')` | il progetto a crediti ha `metering: "credits"`; quello a quote è rimasto com'era in T9-1 (non si mescolano) |
  | T9-5 | Dalla lista progetti passa da quote a crediti e di nuovo a quote, senza logout | niente alert di rifiuto, niente redirect a pricing sul progetto a crediti; il progetto a quote si comporta come in T9-3 |

  Se vuoi simulare un progetto salvato prima dell'esistenza della chiave su uno a crediti: ripeti T9-2 su `<CREDITS_ID>` e dopo il reload `metering` deve tornare `"credits"`.

---

## Task 11: Feature gating per piano

Applicare a tutte le righe della tabella "Punti con gating per piano" la regola indicata nella colonna "Su credits", con lo stesso pattern di wrapping. Le regole sono la GL-6 (feature sbloccate su ogni piano) e la GL-7 (Custom per retention, ruoli custom e Smart Assignment); i casi limite AS-1…AS-4 sono già risolti. Per G1, G2 e G3 (redirect e guard) la condizione va letta da `MeteringService.isCredits`, perché `AppComponent`, `SidebarComponent` e `ProjectProfileGuard` non estendono `PricingBaseComponent`. Nel guard, che rilegge il progetto con `_getProjectById`, si può usare direttamente `isCreditsMetering(project)`.

---

## Porting su altri branch

Ordine consigliato (ogni gruppo è autonomo e compilabile):

1. Port completo della dashboard crediti: cherry-pick `6a435ef5d d5d23de83 3e3b6c6b8 14d887695 7768b7900 14811e252 f168fbc1a`. `master-STAGE-NEW` li ha già (salta il passo); `master-ar-roles` no (passo obbligatorio, Angular 14, merge chirurgico: vedi "Branch di destinazione")
2. Commit dei Task 2 → 9 (e 11) di `X-credits` (hash nel log sotto), in ordine
3. Rieseguire il Task 10

Punti di attenzione:

- Le righe citate si riferiscono a `X-credits` al 2026-11-23: sui branch più vecchi cercare per nome di funzione
- `home.component.ts` usa `planLimitsBridge`: se il branch non ce l'ha, applicare il pattern dove la Home controlla `chatBotLimit`
- `get-start-chatbot-fork` e `project-edit-add` calcolano i limiti localmente: non ereditano `isCreditsMetering`
- Il server deve essere almeno a `10d3d126` (`tiledesk-server`, `features-2611/credits-plan`): prima di `abe1bf33` non esistono 13012, 13013 e il trial; prima di `d51d782c` non c'è `metering` sul project object

## Log di porting

| Data | Branch | Task / commit | Note |
|------|--------|---------------|------|
| 2026-11-23 | `X-credits` | Piano creato | Contratto server letto da `tiledesk-server` @ `10d3d126` |
| 2026-11-23 | `X-credits` | Decisione C | Confermata: crediti finiti = saldo `<= 0` o billing `suspended` / `canceled` / `trial_ended`. Aggiunto `areCreditsExhausted` (Task 2) |
| 2026-11-24 | `X-credits` | Assunzioni | AS-3 risolta (email ticketing, activities log e tab avanzate su tutti i piani; Smart Assignment, retention e ruoli Custom); AS-4 risolta (flag customization per tutti, solo "Contattaci"); AS-1 e AS-2 risolte: Plus e Business passati a credits restano come oggi, senza intervento sui vecchi progetti |
| 2026-11-24 | `X-credits` | Documento | Aggiunti "In breve" e "Legenda delle sigle"; sigle spiegate nel testo; tabella dei punti con gating per piano completata con la colonna "Su credits"; ruoli: la finestra Upgrade resta per i piani non Custom |
| 2026-11-24 | `X-credits` | Business su credits (AS-2) | I progetti Business passati a credits si comportano come gli altri piani: tab avanzate libere (GL-6); Smart Assignment, ruoli custom e message retention solo Custom (GL-7). Effetto oggi nullo: la message retention non è ancora attiva su `master` né su `master-ar-roles`, e lì sono stati creati solo piani Custom. Il codice di `X-credits` gating ancora la retention per piano (B-4, G18): la regola va applicata in Task 11 quando la retention viene attivata |
| 2026-11-24 | `X-credits` | Cerchio trial in navbar (decisione) | Sui progetti a crediti il cerchio dei giorni di trial legacy (`#trial-days-indicator`, navbar) non si mostra: il pannello crediti dà già saldo e stato. Il cerchio legacy usa 14 giorni fissi, il trial crediti dura 7 giorni (`pricing.json`). Condizione `!credits` (summary crediti presente), da sostituire con `isCreditsMetering` nel Task 8. Modifica in `navbar.component.html`, non ancora committata |
| 2026-11-24 | `X-credits` | Task 1 | Cherry-pick dei 7 commit, nuovi hash: `f1921b6e2 c3f8eb367 5c7e9ce5b 94cee3e5b 4bf95d180 b1ca80927 141f2d696` (in ordine, corrispondono a `6a435ef5d d5d23de83 3e3b6c6b8 14d887695 7768b7900 14811e252 f168fbc1a`). I file `credits/*`, `credits.service.ts` e l'interceptor sono identici a `features-2611/credits-plan`. Build OK, test 24/24 con `TZ=UTC`. Resta da fare il Step 5 (verifica manuale) |
| 2026-11-24 | `X-credits` | Strategia `master-ar-roles` | Merge chirurgico: solo i 7 commit del contatore crediti e i commit dei Task 2-9 e 11, via `cherry-pick -x` su un branch di appoggio; nessun merge di `master`. Dei 27 file dei 7 commit, 16 non esistono su `master-ar-roles` e 9 hanno conflitti attesi |
| 2026-11-24 | `X-credits` | Branch di destinazione | Aggiunta la sezione "Branch di destinazione": `master` (base di `X-credits`, stesso commit), `master-STAGE-NEW` (Angular 15, contatore già presente) e `master-ar-roles` (Angular 14.2.2, contatore assente). Aggiunto il vincolo di compatibilità Angular 14 |
| 2026-11-24 | `X-credits` | Decisioni globali | Copilot su credits (GL-1); Business non selezionabile, nessuna migrazione (GL-2); Plus invariato (GL-3); trial legacy solo credits (GL-4); 13012 resta (GL-5); credits = tutto sbloccato tranne Custom per retention, ruoli custom, Smart Assignment (GL-6, GL-7). Le assunzioni AS-1…AS-4 sono state risolte nello stesso giorno |
| 2026-11-24 | `X-credits` | Task 2 | Commit `b688308f1`: helper puri e tipi crediti (`metering.util.ts` + spec, `project-model.ts`, `credits.service.ts`, i18n `trial`/`trial_ended` e testi 13012/13013). 6 file. Test 11/11 |
| 2026-11-24 | `X-credits` | Navbar | Commit `60ed92a7a`: icona `auto_awesome` e tooltip "Current usage" solo sui progetti a crediti; padding del chip `6px 8px`. Verifica visiva fatta dall'utente |
| 2026-11-24 | `X-credits` | Piano (aggiornamento) | Commit `4a7996cba`: stato dello step 5 del Task 1, indice con link alle sezioni, sezione "Verifiche lato server" (S1–S5) |
| 2026-11-24 | `X-credits` | Task 1, step 5 | Verifica manuale: progetto credits OK. Progetto a quote in attesa della verifica lato server (S1–S5) |
| 2026-11-24 | `X-credits` | Task 3 | Commit `0b0eb1862`: `MeteringService`, `metering$`, `ProjectPlanService.setProject`, interceptor delegato al servizio. 5 file. Test 21/21 (Task 2 + 3); build e `tsc` OK |
| 2026-11-24 | `X-credits` | Alert crediti (decisione) | Stesso codice di rifiuto mostrato una sola volta mentre l'alert è aperto o in coda; codici diversi in coda, uno alla volta; "Vedi costi" porta a `/credits` e svuota la coda; dopo la chiusura lo stesso codice può riapparire a un nuovo tentativo (scelta confermata dall'utente) |
| 2026-11-24 | `X-credits` | Preview e creazione (verifica) | Controllati i chiamanti di `/kb/qa`, `/kb/namespace`, `/faq_kb` e inviti: partono da azioni dell'utente. Non controllate tutte le rotte della tabella dei rifiuti |
| 2026-11-24 | `X-credits` | Task 4 | Commit `d031a0fac`: `PricingBaseComponent.isCreditsMetering` come getter su `meteringService.isCredits`. Prima versione con subscription dentro `getProjectPlan()` scartata: `home-cds`, `modal-preview-knowledge-base` e `bots-static` non lo chiamano mai e il flag sarebbe rimasto `false`. `tsc` e `ng build` OK, nessun test nuovo (il piano non lo prevede) |
| 2026-11-24 | `X-credits` | Componenti con limiti propri | Aggiunta la sezione "Componenti che calcolano i limiti da soli": `ProjectPlanService` salta `get-chatbot`, `install-template*`, `create-project-itw`, `activate-product`, quindi su quelle rotte il flag va letto con `isCreditsMetering(project)`. Corretti Task 5 step 5 e 6 (`install-template`, `get-start-chatbot-fork`). `QuotesService.getQuoteLimits` non passa da `projectPlan$`: lo salta il chiamante (Task 7, 8). Da verificare: `create-project-itw`, `activate-product`. `home_old` eliminato (nessun riferimento; resta solo un commento in `project.service.ts`, tolto nello stesso commit) |
| 2026-11-24 | `X-credits` | Task 5 (step 1–7) | Pattern `this.isCreditsMetering ||` applicato a tutti i punti con controllo lato client (`bots-list`, `templates`, `template-detail`, `community-template-dtls`, `bot-create`, `app-store`, `home-create-chatbot`, `home-kb`, `home-cds`, `knowledge-bases`, `install-template`, `get-start-chatbot-fork` con `isCreditsMetering(project)`, `home.assertCanCreateChatbot`, `home-quick-cards`); banner e contatori nascosti su credits (`bots-list.html`, `templates.html`, `home-create-chatbot.html`, `showFlowsLimit`). `isCreditsRefusal` nei gestori che mostravano un errore generico. `tsc` e `ng build` OK. Verifica manuale (step 8) da fare |
| 2026-11-24 | `X-credits` | Aperto | Verifica lato server S1–S5 (backend); decisione S3 sui vendor non OpenAI nei progetti a quote; spec `ProjectPlanService` da sistemare (preesistente) |
| 2026-11-25 | `X-credits` | Paywall crediti (regola) | Regola: sui progetti `metering: "credits"` nessun paywall client-side e nessun redirect a pricing o `-demo`; il blocco lo decide il server. Commit `328dd3673`: `app.component.ts` (G1), `project-profile.guard.ts` (G3, ritorno `true` per i crediti), `home-quick-cards.component.ts` (gate abbonamento in `onAddFlowClick` disattivato su crediti). G2 in `sidebar.component.ts` verificato: codice morto, nessun redirect attivo (il piano lo dava per attivo, errore corretto). Build Angular 15 (`ng build`) OK il 2026-11-25, nessun errore; warning SASS e chart.js preesistenti |
| 2026-11-25 | `X-credits` | Domande al server | Sezione "Domande per il server sui progetti a crediti" (Q1–Q8): codice 13010 su conto sospeso o annullato, controlli server legacy su `trialExpired` e `isActiveSubscription`, orologio di blocco (`billing.status` contro `subEnd + 3 giorni`), chi aggiorna `subEnd`, `courtesyDays` in produzione, profilo legacy dei crediti, price fuori da `plans`, `metering` al cambio di piano |
| 2026-11-25 | `X-credits` | Task 6 step 1-4 (seats) | Credits: nessun limite seats client-side. `users` e `user-edit-add`: banner nascosto, pulsanti non disabilitati, invito diretto, `isCreditsRefusal` nel gestore errore. `home-quick-cards`: `showTeammatesLimit` false su credits, bottone Invita sempre visibile, `openModalSeatsOverLimit` non apre paywall. `home-create-teammate`: riga seats nascosta, pulsante e invito senza controllo. `project-edit-add`: `MeteringService.isCredits$`; piano free mostrato come "Trial" senza i seats, riga "Seats redeemed" nascosta su tutti i piani a crediti. Build Angular 15 OK. Test: 4 spec "should create" falliscono con `NullInjectorError` su servizi non forniti dalla spec (`UsersService`, `ProjectService`, `AuthService`); non legato a questo lavoro, da verificare su `master` |
| 2026-11-25 | `X-credits` | Decisioni S3 | Quote: come prima di `ddc7e4180` (vendor non OpenAI senza integrazione non usabili), correzione lato server da portare a Giovanni. Crediti: scelta tra tutti i modelli con prezzo e solo vendor dell'elenco, ancora aperta con Giovanni |
| 2026-11-25 | `X-credits` | Task 1, commit del collega `ddc7e4180` | Cherry-pick `-x` da `features-2611/credits-plan-tmp`, committato dopo revisione del diff: `getLlmModels()` unico, rimossi `getLlmProviders`/`getProviderModels` e la logica per chiave propria nel modal preview settings; gruppi per vendor su OpenRouter. Dipende dai campi `tiledesk.provider/model/key/multiplier` del server (`credits-plan`, commit `5f8b17d8`). Build Angular 15 OK, 45/45 test PASS (`TZ=UTC`) |
| 2026-11-25 | `X-credits` | Task 1, commit del collega `f7ec9e482` (non committato) | Cherry-pick `-x --no-commit`: prezzi chiave propria come importo fisso per chiamata (`ownKeyPerCall`), tabella prezzi senza colonne chiave propria, `perThousand` solo senza chiave propria, i18n en/it. Server `836c3ac5`. Build Angular 15 OK (exit 0) dopo aver liberato spazio; test non rilanciati. Verifica manuale su `/project/:id/credits` da fare |
| 2026-11-25 | `X-credits` | Task 7 steps 1-5 (KB, non committato) | Credits: niente `/N` su Home e pagina KB, niente CTA/modale di upgrade KB, niente chiamate `getProjectQuotes` per i limiti KB; `isCreditsRefusal` con `return` anticipato nei gestori di errore di namespace, import, sitemap, aggiunta singola e multipla; preview KB mostra il testo crediti (streaming e non). Correzione al piano: lo streaming usa `fetch`, l'interceptor non lo vede e l'errore ha forma diversa: `askGptStream` ora emette i rifiuti crediti come `HttpErrorResponse` e l'anteprima presenta l'alert. `CREDITS_REFUSAL_TEXTS` in `metering.util`. Step 5 senza modifiche (nessuna chiamata LLM in `modal-preview-settings`). Build Angular 15 OK, 1028 test eseguiti con 279 falliti preesistenti (provider mancanti). Manca la verifica manuale (Step 6) |
| 2026-11-25 | `X-credits` | Popup trial terminato (regola) | Sui progetti credits il popup "trial terminato" (`displayTrialHasExpiredModal`) non si apre più: `return` anticipato con `isCreditsMetering` in `openModalSeatsTrialExpired` (`home-quick-cards`, copre anche i gestori over-limit), `openModalTrialExpired` in `home-create-teammate` e `home-create-chatbot`. `home-kb`: `openModalTrialExpired` è commentato, il tooltip non fa nulla, nessuna modifica. Commit `328dd3673`. Build Angular 15 OK il 2026-11-25 (incluso) |
| 2026-11-25 | `X-credits` | Test manuale su progetto a crediti in trial (utente) | (1) Invito di 2 teammate con email nuove (3 membri: Owner e 2 Administrator) e aggiunta di contenuti KB: i crediti non cambiano. Spiegazione dal codice server: in trial `syncMonthlyFees` non addebita seat e contenuti; l'addebito parte all'attivazione (`markPaymentSucceeded`) o dal task periodico per i pending invite dopo la registrazione. Domande 21–23 per Giovanni. (2) Creazione di dipartimenti: nessun addebito, `routes/department.js` non ha controlli crediti. (3) Preview KB con `gpt-4o`, chiave Tiledesk: risposta visualizzata, `prompt size` 1.988 token, saldo 4.990,89 → 4.990,68 (0,21 crediti). Coerente con l'addebito sui token reali (circa 500–660 di input), perché il server mostra `prompt_token_size` moltiplicato per il moltiplicatore quote (`legacy_prompt_token_size` è il valore reale). Domanda 24 per Giovanni. Percorso di rifiuto (13010–13013) in preview ancora da provare |
| 2026-11-25 | `X-credits` | Task 7 step 6, pagina KB (utente) | Progetto a crediti: "Total contents: 3" senza `/N`, come atteso. Progetto a quote: `/N` presente, invariato. Restano da provare il percorso di rifiuto in preview (13010–13013) e il comportamento con contenuti oltre il limite |
| 2026-11-25 | `X-credits` | Regressione progetto a quote (utente) | Progetto non a crediti: test di creazione chatbot, KB/namespace e teammate. Esito da confermare: il comportamento deve restare quello di prima |
| 2026-11-26 | `X-credits` | Rifiuto crediti 13010 (utente) | `INSUFFICIENT_CREDITS` (alert di saldo insufficiente): funziona. Il test è stato fatto in preview KB. Restano da provare 13011, 13012 e 13013 |
| 2026-11-26 | `X-credits` | Task 5 step 8, chatbot su quote (utente) | Progetto a quote, limite chatbot raggiunto: creazione bloccata e banner rosso per il limite superato (`chatBotCount > chatBotLimit`). Esito OK. Da fare ancora il lato credits: creazione oltre il limite consentita e banner assente |
| 2026-11-26 | `X-credits` | Task 6 step 5, teammate su quote (utente) | Progetto a quote, limite teammate: invito bloccato oltre `PLAN_SEATS` e banner di superamento visualizzato. Esito OK. Da fare ancora il lato credits: inviti oltre il limite consentiti, banner assente |
| 2026-11-26 | `X-credits` | Task 8 step 5, banner consumi Home su quote (utente) | Progetto a quote: banner consumi presente in Home. Esito OK. Restano da verificare il lato crediti (nessun banner, nessuna voce "Current usage" nel menu dashlet) e il passaggio tra i due progetti senza ricaricare |
| 2026-11-27 | `X-credits` | Task 8 step 5, banner consumi Home su crediti (utente) | Progetto a crediti: nessun banner "Current usage" e nessuna voce "Current usage" nel menu dashlet. Esito OK. Restano da verificare gli altri blocchi della Home, lo skeleton al primo caricamento e il passaggio tra i due progetti senza ricaricare |
| 2026-11-27 | `X-credits` | Regressione quote, preview LLM e KB (utente) | Impostazioni preview: modelli come prima, con "Nx tokens" sui GPT. OK. Preview KB: mostra il `prompt size`. OK. Token esauriti: errore 13001 come prima. OK. Groq assente: atteso, sui progetti a quote compare solo con l'integrazione Groq del progetto (`tiledesk-server/pubmodules/credits/llmModels.js`, riga 100). DeepSeek selezionabile senza integrazione e risposta con errore: problema lato server, da portare a Giovanni (`catalog.js` righe 17-25 `MANAGED_VENDORS`, `llmModels.js` riga 90). Errore: "Integration deepseek not found for project 6afbf72b74dddb00133ead0e" |
| 2026-11-27 | `X-credits` | Task 7, messaggi di limite KB su quote (utente) | Messaggio di limite per i namespace: OK. Messaggio di limite per i contenuti: OK. Restano da verificare avviso con CTA di upgrade e apertura del paywall oltre il limite dei contenuti |
| 2026-11-27 | `X-credits` | Piano dei test su quote (utente) | I test sul progetto a quote sono stati fatti su un progetto Pro. Limiti attesi: chatbot 20, KB 300 (`CHATBOT_MAX_NUM`, `KB_MAX_NUM` in `util.ts`). Piano Custom e Starter non ancora testati sul lato quote |
| 2026-11-27 | `X-credits` | Checklist chatbot su quote (utente) | Banner chatbot in `bots-list` e `templates`: OK. Limite uguale da `get-start-chatbot-fork` (`/get-chatbot/:botid`), con la modale di limite: OK. Conteggio nella Home invariato: OK. Voce "Chatbot (Task 5)" della checklist quote spuntata |
| 2026-11-27 | `X-credits` | KB su quote, da controllare (utente) | Con limite di 2 contenuti sono stati importati 3 contenuti. Da riprodurre e capire quale import è stato usato. Dal codice del server (`tiledesk-server/routes/kb.js`): `POST /namespace/import/:id` (righe 1376-1390) confronta solo i contenuti del file con `limits.kbs`, il controllo sul numero di contenuti già presenti è commentato; `POST /sitemap/import` ha il controllo commentato (righe 2204-2234). Il dashboard non blocca in anticipo: gestisce solo il 403 `plan_limit`. Probabile comportamento preesistente del server, non legato alle modifiche dei Task 5-8. Da portare a Giovanni se confermato |
| 2026-11-27 | `X-credits` | KB su quote, import JSON dal pulsante "Importa contenuti" (utente) | Il pulsante in alto a destra chiama `presentDialogImportContents` (`knowledge-bases.component.ts`, riga 1983) e poi `POST /kb/namespace/import/:id` (`knowledge-base.service.ts`, riga 156). Il server (`routes/kb.js`, righe 1376-1389) confronta solo il numero di contenuti del file con `limits.kbs` del piano; l'import sostituisce tutti i contenuti. `kbs` per piano (`services/QuoteManager.js`, righe 19-31): Sandbox 50, Starter 150, Pro 300, Business 1000, Custom 1000. Quindi 3 contenuti passano su qualunque piano con `kbs` maggiore o uguale a 3. Il "2" non corrisponde a `kbs`: corrisponde a `CHATBOT_MAX_NUM.free` (`util.ts`). Da chiarire con l'utente dove ha visto il limite 2 e su quale piano |
| 2026-11-27 | `X-credits` | Limiti per progetto da `profile.quotes` (utente) | Il limite 2 è un override del progetto: `profile.quotes = { chatbots: 3, kbs: 2 }`. Il client lo legge in `project-plan.service.ts` (righe 179-180: `profile_chatbots`, `profile_kbs`), il server lo unisce ai limiti del piano in `QuoteManager.getPlanLimits` (righe 566-570). Incoerenza: se `isActiveSubscription === false` su un progetto a pagamento, `getPlanLimits` ritorna `PLANS_LIST.SANDBOX` prima del merge (intorno alle righe 515-519), quindi l'override viene ignorato e `kbs` vale 50. Spiegherebbe l'import di 3 contenuti. Da verificare: `isActiveSubscription` del progetto di prova. Esito (utente): `isActiveSubscription: true`, quindi il ramo Sandbox non è la causa. Nuova ipotesi: il progetto è a crediti. In `QuoteManager.getPlanLimits` (righe 505-507) `creditsQuotes.account(target)` ritorna `CREDITS_LIMITS` (illimitati), prima del merge di `profile.quotes`: l'override 2 non vale. Da verificare il campo `metering` del progetto di prova |
| 2026-11-27 | `X-credits` | KB, sitemap import senza controllo del limite (analisi codice) | `POST /kb/sitemap/import` (`tiledesk-server/routes/kb.js`, righe 2176-2294) non chiama `aiManager.checkQuotaAvailability` e il controllo manuale è commentato (righe 2204-2234): né limite di piano né crediti. `checkQuotaAvailability` (`aiManager.js`, riga 344) è chiamata invece da aggiunta singola (kb.js 1850), aggiunta multipla (1995) e dall'altro inserimento in blocco (2084). `addMultipleUrls` non controlla il limite. Su quote un sitemap può quindi superare `kbs`. Da segnalare a Giovanni; non verificata la gestione dell'errore lato dashboard (non serve finché il server non risponde 403). Preesistente: il blocco commentato risale a `f2d2287b5` (Giovanni Troisi, 2025-08-28) ed è presente anche su `master`, quindi non è stato introdotto dai Task di crediti |
| 2026-11-27 | `X-credits` | Teammate, card Home su quote (utente) | Al limite dei seat il pulsante "Invita teammate" non compare e al suo posto c'è "Aumenta limite". Coerente con il comportamento di prima: la condizione di `home-quick-cards.component.html` per quote (`seatsRemainingCount > 0 && !seatsCountOverLimit && canInviteTeammates && displayInviteTeammateBtn`) è invariata nel commit `a9fa9df0e`, che ha solo aggiunto `isCreditsMetering ||`. Da verificare: apertura del paywall al click su "Aumenta limite" |
| 2026-11-27 | `X-credits` | Riga "Seats redeemed" in project-edit-add su quote (utente) | Sul progetto Pro la riga mostra "Il tuo piano corrente: Pro plan ( 3 posti ) - Posti riscattati 3": visibile su quote, come atteso. OK. Restano da verificare il paywall da "Aumenta limite" in Home e il comportamento su progetto a crediti |
| 2026-11-27 | `X-credits` | Paywall "Aumenta limite" su quote (utente) | Il click su "Aumenta limite" apre "Limite posti raggiunto" con il testo "Contattaci per aumentare il limite di posti". È il comportamento previsto per owner su piano a pagamento (`home-quick-cards.component.ts`, `openModalSeatsOverLimit` → `displayQuickCardsIncreaseSeatLimitModal`, `notify.service.ts` riga 446): il pulsante "Contattaci" apre una mail a sales. Esito OK. Voce "Teammate (Task 6)" spuntata. Da verificare con un utente admin (modale diversa) e sul progetto a crediti |
| 2026-11-27 | `X-credits` | Quick card Home "Aumenta limite" su Flussi e KB contenuti, quote (utente) | Il pulsante "Aumenta limite" delle card Flussi e Contenuti KB è OK. Avviso sulla pagina KB oltre il limite dei contenuti e apertura del paywall: OK (utente). Voce "KB (Task 7)" della checklist quote spuntata. Da verificare con un utente admin e sul progetto a crediti |
| 2026-11-27 | `X-credits` | Progetto a crediti: Home, Flows, Overview, skeleton, inviti e chatbot (utente) | Home: Flows e Overview visibili, come previsto. Primo caricamento: nessun problema sullo skeleton dei Current usage. Inviti oltre il limite e creazione di chatbot oltre il limite: già verificati (OK). Voci "Task 6 step 5" spuntata. Restano da verificare: passaggio tra un progetto a crediti e uno a quote senza ricaricare (Task 8 step 5), e il 13012 con trial scaduto (Task 5 step 8) |
