# Porting — modifiche alle esecuzioni (sopra la 2.9.0)

Delta non committato rispetto a HEAD. La 2.9.0 (lista, grafo, dettaglio, View data, retention, pulsante in lista agenti, righe in Attività) è già su questo branch: non va riportata. Questo file copre solo quello che c’è sopra.

`src/app/services/executions.service.ts` ha solo una riga vuota in meno. Non porta comportamento.

## Non portare con questo pacchetto

- `src/environments/environment.ts` e `environment.prod.ts` (switch locali: `remoteConfig`, URL eu.rtmv3).
- `src/app/bots/executions/executions-mock.ts` (aggiunto e poi rimosso; `executionsMock` non esiste più).
- OpenRouter (solo `openrouter-icon.png` e `openrouter-logo.png`; il nome resta "OpenRouter").
- Vibe coder: 5 MB per file, 15 MB totali, prompt 32.000 caratteri, e la card Home `showVbcGoToChat`.
- `proxy.conf.json`.

## 1. Titoli navbar e freccia indietro

`monitor-title.ts`, `navbar.component.ts`, `navbar.monitor-title.spec.ts`.

- Dettaglio esecuzione (`/monitor/:agent/executions/:id`): titolo `Executions.Detail.PageTitle`, freccia indietro. Il dettaglio si iscrive a `NavigationService.onBack()` e chiama `backToList()`.
- Ogni altra pagina `/monitor/`: titolo `Executions.Executions`, con o senza la barra dei tab. `/monitor/graph` resta il redirect alla vista grafo.
- Lista conversazioni (`/wsrequests`): il titolo resta quello della navbar (Requests). Non azzerarlo quando i tab sono visibili.
- Attività aperte con `?activities=EXECUTION*`: freccia indietro. `activities-new` fa `location.back()`. Il query **non** va tolto dall’URL: è il segnale che la pagina chiamante è l’esecuzione.

## 2. Deep link Attività

`activities-new.component.ts`, `activities-new.executions.spec.ts`.

- I verbi `EXECUTION_*` letti da `?activities=` restano fuori dalla prima query finché il ruolo è noto (`holdActivitiesForAudit`).
- `role === ''` è il reset tra progetti: `applyExecutionsAuditPermission` ritorna senza decidere.
- Se l’utente ha l’audit, i verbi entrano nel filtro e parte `getActivities()`. Se non ce l’ha, la query parte senza quei verbi.
- Se il permesso cade dopo, i verbi `EXECUTION_*` vengono tolti dal filtro e la lista ricaricata.
- Il gruppo Executions nel menu filtri resta visibile solo con `canViewExecutionsAudit`.

Trappola dei test: diversi spec costruiscono il componente con `Object.create(prototype)`, quindi gli inizializzatori dei campi non girano. `holdActivitiesForAudit` può essere `undefined` (il ramo hold va saltato) e `selectedActivities` va letto come `this.selectedActivities || []`.

## 3. Tab Audit nel dettaglio

`execution-audit.ts` (`auditActivityVerb`), `execution-detail.component.ts/html/scss`, `execution-detail.audit.spec.ts`.

- Dall’header del tab (`au-head`) è stato tolto il pulsante «Apri Attività». Restano l’hint e, nel menu overflow, la voce che chiama `goToActivities()` senza verbo (`Executions.Audit.OpenActivitiesPage`).
- Ogni riga di audit con un verbo mappato ha «Apri in Attività» (`OpenActivities`) che naviga a `/project/:id/activities?activities=<VERBO>`. `data_access_requested` non ha filtro: `auditActivityVerb` ritorna `null`.
- Il tab mostra il conteggio della prima pagina, con `+` se c’è `next_cursor` (`auditCountLabel`, «50+»). Il prefetch parte quando esecuzione e permesso audit sono noti. La subscribe dell’audit è anche su `reset$`, così un cambio esecuzione non applica la pagina vecchia.
- Il breadcrumb sopra il dettaglio è commentato: lo coprono la freccia in navbar e la card dell’id.

Mappa verbo → activity id: `stop_soft/hard`, `destroy`, `resume`, `start_new`, `data_viewed`, `data_access_denied`, `retention_update`, `stop_notice_update`.

Il costruttore del dettaglio ha un `NavigationService` in più. Gli spec che fanno `new ExecutionDetailComponent(...)` vanno allineati (i file `*.spec.ts` del dettaglio hanno tutti quel `+1`).

## 4. Lista esecuzioni e card

`executions-list.component.html/scss`, `execution-stat-cards.component.ts`, `execution-status-chip.component.ts`, spec relativi.

- Il periodo («Adesso», «Ultima ora», …) sta nell’header, accanto al titolo. Non più come hint sotto le card.
- «Con errori» non è uno stato: la card può essere premuta insieme a una card di stato. Input nuovi: `[active]="filters.status"` e `[errorsActive]="filters.has_errors"`.
- Lo stato `destroyed` non ha più il testo barrato.

## 5. Barra Monitor e scope conversazioni

`monitor-tabs.component.html/scss`, `ws-requests-list.component.html/scss/ts`.

- I tab Conversazioni | Esecuzioni usano gli stessi `li` con bordo della bottom-nav (`btn-with-border-effect`, `li-active`, `border-from-center`).
- Sulla lista conversazioni, se la barra Monitor è visibile, «Tutti gli agenti | Le tue conversazioni» diventa un pill (`.conv-scope`) e la bottom-nav perde l’ombra. Se la barra non c’è, restano i tab originali.
- Il pill è solo per owner e admin: `showConversationScope` è `hasDefaultRole === true && ROLE_IS_AGENT === false`. Un agente vede solo le sue.

`AllAgentsRequests` è stato accorciato (en: «All agents», it: «Tutti gli agenti») perché nel pill non c’entra la frase intera. Va portato in tutte le 15 lingue.

## 6. Link all’esecuzione dalla conversazione

`ws-requests-msgs.component.ts/html/scss`.

- `executionShortId`: ultime 8 cifre hex dell’uuid (stessa coda del dettaglio).
- Il link usa `Executions.OpenExecution` con `{ id }` («Visualizza esecuzione {{id}}») e l’icona di uscita. L’icona a sinistra è l’ingranaggio/timeline, con tooltip `Executions.Detail.Execution`.

## 7. Icone Attività

`activity-verbs.constants.ts` più i 9 svg non tracciati in `src/assets/img/activities/`:

`execution-stop-soft`, `execution-stop-hard`, `execution-destroy`, `execution-resume`, `execution-start-new`, `execution-data-access`, `execution-data-access-denied`, `execution-retention`, `execution-stop-notice`.

Sostituiscono le icone di flow/utente riusate. Senza i file le righe restano senza icona.

## 8. Ruoli

`users-new-role.component.ts/html/scss`, `users-new-role.module.ts` (`MatTooltipModule`), `users-new-role.executions.spec.ts`.

- Tipo del child: `{ key, label, info?: string }`. Se c’è `info`, icona `help_outline` con `matTooltip`.
- Le label del form restano in inglese, hardcoded. Anche i testi `info`.
- Testi:
  - `RATING_READ`: controlla anche la colonna Rating e il filtro «Only rated conversations» in History.
  - `EXECUTIONS_READ`: accende e tiene «Able to view» in Flows.
  - `EXECUTIONS_CONTROL`, `DESTROY`, `DATA_ACCESS`: accendono e tengono «Able to view executions» e «Able to view» in Flows.
  - `EXECUTIONS_AUDIT_READ`: accende e tiene «Able to view» in Flows e «Able to view Activities». Non richiede `EXECUTIONS_READ`.
- `visibleSections` nasconde la sezione esecuzioni quando `executionsService.isConfigured()` è falso. I form control restano: un save non spegne permessi già salvati sul ruolo.
- La regola è solo nel tooltip. `PERMISSION_DEPENDENCIES` non è cambiato: spuntare Flows non accende le esecuzioni.

## 9. History e rating

`history-and-nort-convs.component.ts/html`. Va portato insieme all’icona di `RATING_READ`, altrimenti il tooltip descrive un controllo che non c’è.

- `PERMISSION_TO_VIEW_RATING_SECTION`: owner, admin e agent sempre true; un ruolo custom solo con `rating_read`. Stessa regola del dettaglio conversazione.
- `canFilterRatedConversations` = quel permesso e `planAllowsConversationRatings` (free solo se `trial_expired === false`; payment solo se `subscription_is_active`; altrimenti true).
- Colonna Rating, checkbox «Solo conversazioni valutate», chip del filtro applicato e i due colspan (11 / 10) stanno dietro `IS_HERE_FOR_HISTORY && canFilterRatedConversations`.
- `getRequests` e `dwnldCSV` mandano `_rated` solo se quel gate è vero. Altrimenti `false`.

## 10. UI e stili

Valori esatti dal diff. Senza questi il comportamento è portato ma la pagina non ha lo stesso aspetto.

### Lista esecuzioni (`executions-list.component.html/scss`)

- **Periodo spostato**: prima era `.exec-cards-hint` sotto le card (`display: block; margin-top: 6px; font-size: 12px`). Ora è `.exec-period` sotto il titolo `h1.exec-title`, dentro il primo `div` di `.exec-head`, con icona `timer` e testo `Executions.RangeLabel: <periodo>`.
  - `.exec-period`: `display: inline-flex; align-items: center; gap: 4px; margin: 4px 0 0; color: var(--exec-muted); font-size: 13px; font-weight: 400; line-height: 16px`.
  - icona `.material-icons-outlined`: `font-size: 16px; width: 16px; height: 16px; line-height: 16px`.
  - `.exec-cards-hint` rimosso, sia dall’HTML sia dallo SCSS.
- `.exec-empty`: aggiunto `font-size: 14px`.

### Dettaglio esecuzione (`execution-detail.component.scss`)

Testo:

- `.ex-muted`: aggiunto `font-size: 12px`.
- `.ex-link`: `font-size: inherit` diventa `font-size: 12px`.
- `.ex-empty`: aggiunto `font-size: 14px`.

Link «Visualizza conversazione» (card dei fatti):

- `.ex-conversation`: `display: inline-flex; align-items: center; gap: 4px`.
- `.ex-conversation:hover .ex-conversation-label`: `text-decoration: underline`.
- `.ex-conversation-exit` (svg lucide square-arrow-up-right-exit): `width: 12px; height: 12px; flex: none`. Sostituisce la freccia testuale `↗`.

Barra dei tab (Timeline | Stato del flow | Audit):

- `.ex-tabs-bar`: da `flex` a `display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: end; column-gap: 8px; min-height: 49px` (bordo inferiore e padding invariati).
- `.tl-filters`: `justify-content: flex-end; align-self: center; margin: 6px 0` (prima `margin: 6px 0 6px auto`).
- `.tl-filters .ex-seg`: `height: 36px; box-sizing: border-box; border-radius: 4px`.
- `.tl-filters .ex-seg button`: `height: 100%; padding: 0 12px`.
- `.ex-tabs`: aggiunto `font-family: var(--header-font-family)`.
- `.ex-tabs button`: aggiunti `display: inline-flex; align-items: center; gap: 6px; font-size: 12px` (`font-weight: 500` invariato).
- `.ex-tabs .ex-tag` (conteggio audit): `margin-left: 0; color: var(--exec-muted); font-variant-numeric: tabular-nums`.
- Tab attivo: colore e bordo da `var(--exec-accent)` a `var(--blue-20)`.

Tab Audit:

- `.au-head .ex-muted`: `font-weight: 400`.
- `.au-sentence`: aggiunti `font-size: 12px; font-weight: 400`.
- `.au-filter` (link per riga): `display: inline-flex; align-items: center; gap: 4px`; hover `text-decoration: underline`. Usa la stessa icona `.ex-conversation-exit`.

### Chip di stato (`execution-status-chip.component.ts`)

- `.s-destroyed`: tolto `text-decoration: line-through`.

### Barra Monitor (`monitor-tabs.component.html/scss`)

Riscritta per avere lo stesso aspetto della bottom-nav del profilo. Prima: `nav.monitor-tabs` flex con `a` (14px, `#5f6368`, attivo `#1a73e8` e `font-weight: 500`). Ora: `nav > ul.monitor-tabs > li > a`.

- `.monitor-tabs`: `position: relative; top: 61px; z-index: 2; width: 100%; height: 50px; margin: 0; padding: 0 0 5px 0; background-color: #fff; box-shadow: 0 2px 2px rgba(0, 0, 60, 0.08); list-style: none`. Il bordo inferiore grigio è sostituito dall’ombra.
- `li`: `float: left; padding: 15px; height: 52px; font-size: 14px; font-weight: 300`, con `::before/::after` assoluti al 100%.
- `li a`: `padding: 18px 15px; color: #797979 !important; line-height: 20px; font-family: var(--header-font-family); font-size: 14px; font-weight: 400`.
- `li.li-active`: `border-bottom: 3px solid var(--blue-20); color: var(--blue-20)`; il link attivo è `var(--blue-20)`. La linea blu è larga quanto la cella, non quanto la parola.
- `li.border-from-center`: hover con la linea che si apre dal centro (`scale3d(0,1,1)` → `scale3d(1,1,1)`, `transition: transform 0.5s`).
- Media query: `max-width: 991px` → `li { z-index: 1049 }`; `max-width: 370px` → barra 37px, `li { padding: 6px; height: 39px }`.

### Lista conversazioni (`ws-requests-list.component.html/scss`)

- Con la barra Monitor visibile, la bottom-nav va a `top: 65px` (60 senza) e perde l’ombra (`box-shadow: none`). Serve `#monitor` sul tag `<monitor-tabs>`.
- `.bottom-nav li.conv-scope-li`: `padding: 7px 16px; height: 50px; cursor: default`.
- `.conv-scope` (pill): `display: inline-flex; align-items: center; height: 36px; box-sizing: border-box; border: 1px solid #d5dbe3; border-radius: 18px; background: #fff; overflow: hidden`.
- `.conv-scope button`: `height: 100%; padding: 0 14px; font-family: var(--header-font-family); font-size: 13px; font-weight: 400; color: #5d6b82; white-space: nowrap`.
- `.conv-scope button[aria-pressed="true"]`: `background: #e8f1fe; color: var(--blue-20); font-weight: 500; border-radius: 18px`.

### Link all’esecuzione nella conversazione (`ws-requests-msgs.component.html/scss`)

- L’icona material `timeline` è sostituita da uno svg 22×22 con tooltip `Executions.Detail.Execution` (`matTooltipPosition="right"`).
- Dall’`a` sono tolti gli stili inline (`margin-left: 8px; cursor: pointer`).
- `.execution-link-a`: `font-size: 14px; color: var(--icon-hover-color); cursor: pointer; text-decoration: none`; hover della riga `.execution-link` → underline.
- `.ul-wpr li .execution-link-a svg.execution-link-exit`: `width: 14px; height: 14px; margin: 0 0 0 4px; fill: none; stroke: currentColor; vertical-align: -2px`.

### Ruoli (`users-new-role.component.scss`)

- `.permission-child-row`: `display: flex; align-items: center`.
- `.permission-info-icon`: `font-size: 16px; margin-left: 6px; color: var(--icon-color, #8796af); cursor: help`; hover `var(--icon-hover-color, rgb(5, 102, 255))`.

## 11. Chiavi i18n

In `Executions`, in tutte e 15 le lingue:

- `OpenExecution` ora ha `{{id}}`.
- `Detail.ViewConversation`.
- `Audit.OpenActivitiesPage` (la voce di menu senza filtro). `Audit.OpenActivities` resta «Apri in Attività» sulla riga.

`Detail.PageTitle` oggi c’è solo in `en.json` («Execution detail») e `it.json` («Dettaglio esecuzione»). Nelle altre 13 lingue la navbar mostra la chiave. Va aggiunta nel porting.

`AllAgentsRequests` accorciato in tutte e 15 (vedi sezione 5).

## Verifica dopo il porting

- Dettaglio esecuzione: titolo «Dettaglio esecuzione», freccia che torna alla lista. Breadcrumb assente. Tab Audit senza pulsante nell’header; la riga apre Attività già filtrate; la freccia di Attività torna all’esecuzione.
- Un ruolo senza `executions_audit_read` che apre `?activities=EXECUTION_STOP_SOFT` non manda quel verbo nella query.
- Lista esecuzioni: periodo sotto il titolo con icona timer, 13px peso 400; niente testo del periodo sotto le card; card «con errori» selezionabile insieme a uno stato.
- Dettaglio: tab a 12px con font header e attivo in `--blue-20`; numero accanto ad Audit; frasi di audit a 12px peso 400.
- Barra Monitor: stessa altezza, ombra e linea blu della bottom-nav del profilo.
- Conversazioni con la barra Monitor visibile: pill «Tutti gli agenti | Le tue», solo owner/admin.
- History: colonna Rating e «Solo conversazioni valutate» solo con permesso e piano che le consente.
- Ruoli: icona info su Rating e sulle cinque voci Executions; sezione Executions assente se `EXECUTIONS_BASE_URL` non è configurato.
