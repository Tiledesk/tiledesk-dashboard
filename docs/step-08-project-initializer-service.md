# Step 8 — ProjectInitializerService (centralizzazione side-effect di avvio)

**Stato:** ✅ Completato  
**Branch consigliato:** `refactor/step-08-project-initializer-service`

---

## Obiettivo

Centralizzare i tre side-effect eseguiti da `HomeComponent` al cambio di progetto attivo in un servizio dedicato, rimuovendo la dipendenza diretta del componente da `UsersService` (per il salvataggio in storage) e da `QuotesService` (per l'aggiornamento delle quote).

---

## Statistiche

| Metrica | Prima | Dopo |
|---|---|---|
| Righe `home.component.ts` | 1.783 | **1.775** |
| `QuotesService` rimosso dal costruttore | no | **sì** |
| File creati | — | 2 (`project-initializer.service.ts`, `.spec.ts`) |
| File modificati | — | 3 (`home.component.ts`, `.spec.ts`, `misc.stubs.ts`) |

---

## Operazioni centralizzate

| Operazione | Posizione originale | Posizione dopo |
|---|---|---|
| `usersService.getAllUsersOfCurrentProjectAndSaveInStorage()` | `getLoggedUser()` (subscription a `user_bs`) | `ProjectInitializerService.initialize()` |
| `usersService.getBotsByProjectIdAndSaveInStorage()` | `ngOnInit()` | `ProjectInitializerService.initialize()` |
| `quotesService.requestQuotasUpdate()` | `getCurrentProjectProjectByIdAndBots()` | `ProjectInitializerService.initialize()` |

---

## File creati

### `src/app/core/project-initializer.service.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class ProjectInitializerService {
  initialize(projectId: string): void {
    this.usersService.getAllUsersOfCurrentProjectAndSaveInStorage();
    this.usersService.getBotsByProjectIdAndSaveInStorage();
    this.quotesService.requestQuotasUpdate();
  }
}
```

Fire-and-forget: non restituisce Observable. Chiamato da `HomeComponent` ogni volta che `project_bs` emette un projectId valido.

### `src/app/core/project-initializer.service.spec.ts`

6 test unitari:

| ID | Scenario |
|---|---|
| T8.1 | `initialize()` chiama `getAllUsersOfCurrentProjectAndSaveInStorage()` |
| T8.2 | `initialize()` chiama `getBotsByProjectIdAndSaveInStorage()` |
| T8.3 | `initialize()` chiama `requestQuotasUpdate()` |
| T8.4 | Tutte e tre le operazioni avvengono in un singolo invocation |
| T8.5 | Chiamate multiple (cambio progetto) — ogni `initialize()` esegue le operazioni |
| T8.6 | Nessuna eccezione con un projectId valido |

---

## File modificati

### `src/app/home/home.component.ts`

#### Aggiunti
- Import: `ProjectInitializerService`
- Parametro costruttore: `private projectInitializerService: ProjectInitializerService`
- In `getCurrentProjectProjectByIdAndBots()` (nel blocco `if (this.projectId)`): `this.projectInitializerService.initialize(this.projectId)`

#### Rimossi
| Elemento | Posizione originale |
|---|---|
| `import { QuotesService }` | import |
| `private quotesService: QuotesService` | costruttore |
| `this.quotesService.requestQuotasUpdate()` | `getCurrentProjectProjectByIdAndBots()` |
| `this.usersService.getBotsByProjectIdAndSaveInStorage()` | `ngOnInit()` |
| `this.usersService.getAllUsersOfCurrentProjectAndSaveInStorage()` | `getLoggedUser()` |

### `src/app/testing/stubs/misc.stubs.ts`

Aggiunto `ProjectInitializerServiceStub`:
```typescript
export class ProjectInitializerServiceStub {
  initialize(_projectId: string): void {}
}
```

### `src/app/home/home.component.spec.ts`

- Aggiunto import `ProjectInitializerService`
- Aggiunto import `ProjectInitializerServiceStub`
- `ProjectInitializerServiceStub` aggiunto ai provider in `buildProviders()`

---

## Piano di test — Step 8

| ID | Test | Come verificare | Risultato |
|---|---|---|---|
| T8.1–T8.6 | Unit test `ProjectInitializerService` | `ng test --include='src/app/core/project-initializer.service.spec.ts'` | Da eseguire |
| T8.7 | Build produzione | `ng build --configuration=production` | ✅ Verde |
| T8.8 | Sidebar mostra utenti dopo cambio progetto | Navigare da progetto A a progetto B | Lista utenti aggiornata nella sidebar |
| T8.9 | Quote aggiornate in Navbar dopo cambio progetto | Come sopra | Valori quote corretti |
| T8.10 | Template invariato | Nessuna modifica a `home.component.html` | ✅ Confermato |
| T8.11 | Nessun riferimento a `requestQuotasUpdate` in HomeComponent | `grep "requestQuotasUpdate" home.component.ts` | ✅ Nessun risultato |

---

## Note per Step 9

In Step 9 (Slim HomeComponent), il punto di chiamata a `initialize()` potrà essere spostato nel `ProjectResolver`, così da eseguire tutti i side-effect **prima** che il componente venga istanziato e indipendentemente dalla Home.

---

## Criteri di completamento Step 8

- [x] `ProjectInitializerService` creato con `initialize()` che esegue i 3 side-effect
- [x] `project-initializer.service.spec.ts` con 6 test (T8.1–T8.6)
- [x] `ProjectInitializerServiceStub` aggiunto a `misc.stubs.ts`
- [x] `QuotesService` rimosso dal costruttore di `HomeComponent`
- [x] Le 3 chiamate rimosse da `HomeComponent` e sostituite da `initialize()`
- [x] `ng build --configuration=production` verde
- [x] Nessuna modifica al template HTML
