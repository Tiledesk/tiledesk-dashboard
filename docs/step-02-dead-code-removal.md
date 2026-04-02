# Step 2 — Rimozione del dead code

**Stato:** ✅ Completato  
**Branch consigliato:** `refactor/step-02-dead-code`

---

## Obiettivo

Eliminare ~400 righe di codice non più eseguito da `home.component.ts` per ridurre il rumore cognitivo prima di iniziare il refactoring strutturale.

---

## Statistiche

| Metrica | Prima | Dopo |
|---|---|---|
| Righe totali `home.component.ts` | 3.177 | 2.769 |
| Righe rimosse | — | **408** |
| Bundle produzione | 6.50 MB | 6.50 MB (invariato — dead code non incluso nel bundle) |

---

## Cosa è stato rimosso

### Metodi eliminati (codice attivo ma non più chiamato)

| Metodo | Motivo rimozione | Riga originale |
|---|---|---|
| `getProjectQuotes()` | Segnato "No more used", non chiamato | 2965 |
| `getQuotes()` | Segnato "No more used", non chiamato | 2981 |
| `getRunnedOutQuotes()` | Chiamato solo da `getQuotes()` | 3051 |
| `listeHasOpenedNavbarQuotasMenu()` | Segnato "No more used", non chiamato | 3090 |
| `getAvailableProjectUsersByProjectId()` | Segnato "TEST FUNCTION", non chiamato | 2537 |
| `goToAnalyticsStaticPage()` | Segnato "test link", binding nel template commentato | 2545 |
| `goToActivitiesStaticPage()` | Segnato "test link", binding nel template commentato | 2550 |
| `goToHoursStaticPage()` | Segnato "test link", binding nel template commentato | 2555 |
| `goToPricing()` | Segnato "test link", binding nel template commentato | 2560 |
| `goToSubscriptionOrOpenModalSubsExpired()` | Segnato "Not used" | 2479 |
| `presentModalFeautureAvailableFromBPlan()` | Segnato "No more used - replaced by Tier2Plan" | 1921 |
| `openWindow()` | Usato solo da `openChat()` commentato | 2593 |
| `focusWin()` | Usato solo da `openChat()` commentato | 2602 |

### Blocchi commentati rimossi

| Blocco | Descrizione |
|---|---|
| `openChat()` | Metodo completamente commentato (~28 righe) |
| `openChatWindow()` | Metodo completamente commentato (~22 righe) |
| `superUserAuth()` | Segnato "NOT YET USED", commentato |
| `displayCheckListModal()` | Commentato |
| `getVisitorCounter()` | Segnato "OLD - NOW NOT WORKS" — 50+ righe con dati di test hardcoded |

### Proprietà di classe rimosse

| Proprietà | Motivo |
|---|---|
| `project_limits: any` | Usata solo da `getProjectQuotes()`/`getQuotes()`/`getRunnedOutQuotes()` |
| `quotes: any` | Usata solo da `getQuotes()`/`getRunnedOutQuotes()` |
| `all_quotes: any` | Mai usata nel codice attivo |

### Import e dipendenze rimossi

| Elemento | Motivo |
|---|---|
| `import { DepartmentService }` | Usato solo da `getVisitorCounter()` |
| `private departmentService: DepartmentService` nel costruttore | Come sopra |

### Commenti inline rimossi da `ngOnInit`

- `// TEST FUNCTION : GET ALL AVAILABLE PROJECT USER` + `// this.getAvailableProjectUsersByProjectId();`
- `// this.getProjectPlan();`
- `// this.getVisitorCounter();`
- `// this.pauseResumeLastUpdateSlider()`
- `// this.getPromoBanner()`
- `// this.listeHasOpenedNavbarQuotasMenu()`
- `// this.getProjectQuotes();` (dentro `getCurrentProjectProjectByIdAndBots`)
- `// this.findCurrentProjectAmongAll(this.projectId)`
- `// this.init()`

---

## Cosa NON è stato rimosso

| Elemento | Motivazione |
|---|---|
| `presentModalFeautureAvailableFromBPlan` → rimossa | Già eliminata (vedi sopra) |
| `presentModalAppSumoFeautureAvailableFromBPlan` | **Mantenuta** — ancora chiamata da `checkPlanAndPresentModal()` |
| `updatedProjectTrialEndedEmitted()` | Commentata in uso, ma potenzialmente riattivabile in futuro — lasciata |
| `openWindow` nel template | Tutti i binding erano già commentati — i metodi rimossi non hanno impatto |

---

## Piano di test — Step 2

| ID | Test | Come verificare | Risultato |
|---|---|---|---|
| T2.1 | Build produzione | `ng build --configuration=production` | ✅ Verde — nessun errore |
| T2.2 | Nessun riferimento ai metodi rimossi | `grep -r "getProjectQuotes\|getQuotes\|getVisitorCounter\|goToAnalyticsStaticPage" src/app/home/` | ✅ Nessun risultato |
| T2.3 | Nessun riferimento a DepartmentService | `grep "DepartmentService" src/app/home/home.component.ts` | ✅ Nessun risultato |
| T2.4 | Template invariato | Nessuna modifica a `home.component.html` | ✅ Confermato |
| T2.5 | Binding attivi nel template non rimossi | Grep dei metodi attivi rimasti nel template | ✅ Nessun binding rotto |

---

## Criteri di completamento Step 2

- [x] Tutti i metodi segnati "No more used" / "test link" / "NOT YET USED" rimossi
- [x] Blocchi di codice completamente commentati rimossi
- [x] Proprietà usate solo dal dead code rimosse (`project_limits`, `quotes`, `all_quotes`)
- [x] Import e provider orfani rimossi (`DepartmentService`)
- [x] Commenti inline obsoleti in `ngOnInit` rimossi
- [x] `ng build --configuration=production` verde
- [x] Nessuna modifica al template HTML
