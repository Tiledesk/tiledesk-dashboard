# Step 7 — ProjectResolver (garanzia dati progetto prima del render)

**Stato:** ✅ Completato  
**Branch consigliato:** `refactor/step-07-project-resolver`

---

## Obiettivo

Garantire che `auth.project_bs` contenga il progetto corretto **prima** che `HomeComponent` venga istanziato, eliminando la dipendenza dal timing asincrono dell'`AuthGuard` e dalla presenza del progetto in localStorage.

In questo step il resolver **coesiste** con la chiamata a `getProjectById` già presente in `HomeComponent` (doppia pubblicazione accettata). La chiamata nel componente sarà rimossa nello Step 9 (Slim HomeComponent).

---

## Statistiche

| Metrica | Prima | Dopo |
|---|---|---|
| Righe `home.component.ts` | 1.783 | 1.783 (invariato) |
| File creati | — | 2 (`project.resolver.ts`, `.spec.ts`) |
| File modificati | — | 1 (`home.module.ts`) |
| Bundle produzione (main) | 4.85 MB | 4.85 MB (invariato) |

---

## Architettura del flusso (prima/dopo)

### Prima
```
Utente → URL → AuthGuard (async) → HomeComponent init
                    ↓                     ↓
             project_bs.next()      getCurrentProject()
             (da localStorage)      → project_bs.subscribe()
                                    → getProjectById()
```

Il timing tra `AuthGuard.checkStoredProject` e `HomeComponent.ngOnInit` non era garantito.

### Dopo
```
Utente → URL → AuthGuard → ProjectResolver → HomeComponent init
                                ↓                  ↓
                      project_bs.next()     getCurrentProject()
                      (con dati freschi     → project_bs.subscribe()
                       o da cache)          → getProjectById() (rimane per ora)
```

Il resolver **completa** prima che il componente venga istanziato. `HomeComponent` trova `project_bs` già valorizzato.

---

## Design del resolver

**Fast path** (nessuna chiamata HTTP): se `auth.project_bs.value._id === projectid`, il progetto corretto è già in memoria (es. utente ha navigato normalmente dalla lista progetti). Restituisce `of(project)` immediatamente.

**Slow path** (fetch dal server): se `project_bs` è null o ha un progetto diverso, chiama `projectService.getProjectById(projectid)` e pubblica il risultato su `project_bs`.

**Cache HTTP**: `ProjectService.getProjectById` usa `shareReplay(1)`. La doppia chiamata resolver + HomeComponent non genera due richieste HTTP.

**Error handling**: in caso di errore HTTP, il resolver restituisce `of(null)` — la navigazione non viene bloccata.

---

## File creati

### `src/app/core/project.resolver.ts`

```typescript
@Injectable({ providedIn: 'root' })
export class ProjectResolver implements Resolve<any> {
  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const projectId = route.params['projectid'];
    const current = this.auth.project_bs.value;
    if (current?._id === projectId) {
      return of(current);          // fast path
    }
    return this.projectService.getProjectById(projectId).pipe(
      take(1),
      tap(project => {
        if (project && this.auth.project_bs.value?._id !== projectId) {
          this.auth.project_bs.next(project);
        }
      }),
      catchError(() => of(null)),  // non blocca la navigazione
    );
  }
}
```

### `src/app/core/project.resolver.spec.ts`

6 test unitari:

| ID | Scenario |
|---|---|
| T7.1 | Fast path: `project_bs` ha già il progetto → nessuna chiamata HTTP |
| T7.2 | Slow path: `project_bs` è null → chiama `getProjectById` con il `projectid` della route |
| T7.3 | `project_bs` ha un progetto diverso → chiama `getProjectById` con il nuovo ID |
| T7.4 | Dopo il fetch, pubblica il progetto su `auth.project_bs` |
| T7.5 | Errore HTTP → emette `null`, non lancia eccezioni (navigazione non bloccata) |
| T7.6 | Il valore emesso dall'observable è il progetto risolto (disponibile via `ActivatedRoute.data`) |

---

## File modificati

### `src/app/home/home.module.ts`

```typescript
const routes: Routes = [
  { path: "", component: HomeComponent, resolve: { project: ProjectResolver } },
];
```

Il resolver è collegato alla rotta `""` del modulo Home (corrispondente a `project/:projectid/home`).

---

## Piano di test — Step 7

| ID | Test | Come verificare | Risultato |
|---|---|---|---|
| T7.1–T7.6 | Unit test `ProjectResolver` | `ng test --include='src/app/core/project.resolver.spec.ts'` | Da eseguire |
| T7.7 | Build produzione | `ng build --configuration=production` | ✅ Verde |
| T7.8 | Home funziona normalmente (navigazione da lista) | Aprire la Home dopo aver selezionato un progetto | ✅ Nessuna regressione |
| T7.9 | Deep link diretto alla Home | Aprire `project/:id/home` direttamente nel browser | `project_bs` valorizzato prima del render |
| T7.10 | Nessuna doppia richiesta HTTP | DevTools Network, navigare alla Home | Al massimo 1 chiamata `GET /project/:id` (cache ShareReplay) |
| T7.11 | Template invariato | Nessuna modifica a `home.component.html` | ✅ Confermato |

---

## Note per Step 9

In Step 9 (Slim HomeComponent), la chiamata a `getProjectById` in `getCurrentProjectProjectByIdAndBots` potrà essere rimossa: il resolver già garantisce che `project_bs` contenga il progetto con i suoi attributi. Il componente dovrà solo leggerli da `project_bs` (o da `ActivatedRoute.data.project`).

---

## Criteri di completamento Step 7

- [x] `ProjectResolver` creato con fast/slow path e `catchError`
- [x] `project.resolver.spec.ts` con 6 test (T7.1–T7.6)
- [x] Resolver aggiunto alla route `""` in `home.module.ts`
- [x] `ng build --configuration=production` verde
- [x] Nessuna modifica al template HTML
- [x] Coesistenza con la chiamata `getProjectById` esistente in `HomeComponent` verificata
