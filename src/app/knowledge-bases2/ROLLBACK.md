# Guida rollback: tornare a `knowledge-bases` (legacy)

Questo documento spiega **come effettuare il rollback** dalla nuova implementazione KB in `src/app/knowledge-bases2/` a quella legacy in `src/app/knowledge-bases/`.

> Nota naming: in questo repo le cartelle sono **`knowledge-bases`** e **`knowledge-bases2`** (plurale). Se in qualche messaggio vedi “knowledge-base”, interpretalo come questi path reali.

---

## Obiettivo del rollback

- **Routing**: `/project/:projectid/knowledge-bases/...` deve lazy-loadare `KnowledgeBasesModule` da `app/knowledge-bases/`.
- **Compilazione**: la cartella legacy `src/app/knowledge-bases/**` deve tornare ad essere compilata (se era stata esclusa).
- **Home / altre pagine**: gli import delle modali devono tornare a puntare a `app/knowledge-bases/...` (se vuoi un rollback completo).

---

## Step 1 — Ripristinare il routing verso il modulo legacy KB

File: `src/app/app.routing.ts`

Trova queste 3 route (attualmente puntano a `knowledge-bases2`) e riportale al legacy:

- `path: 'project/:projectid/knowledge-bases'`
- `path: 'project/:projectid/knowledge-bases/:namespaceid'`
- `path: 'project/:projectid/knowledge-bases/:calledby'`

Modifica:

- da `import('app/knowledge-bases2/knowledge-bases.module').then(m => m.KnowledgeBases2Module)`
- a  `import('app/knowledge-bases/knowledge-bases.module').then(m => m.KnowledgeBasesModule)`

---

## Step 2 — Riabilitare la compilazione di `knowledge-bases/` (legacy)

File: `src/tsconfig.app.json`

Se hai questo `exclude`:

```json
"exclude": [
  "test.ts",
  "**/*.spec.ts",
  "app/knowledge-bases/**"
]
```

Rimuovi **solo**:

```json
"app/knowledge-bases/**"
```

Perché: durante la migrazione abbiamo escluso il legacy KB per evitare errori di compilazione dei template. Un rollback reale richiede che il legacy KB torni a compilare.

---

## Step 3 — Ripuntare le modali Home verso il legacy (opzionale ma consigliato per rollback completo)

Durante la migrazione alcune pagine sono state aggiornate per usare le modali da `knowledge-bases2`, così da evitare di “tirare dentro” i template legacy nella build.

Se vuoi rollback completo, ripristina questi import:

### 3.1 `HomeKbComponent`

File: `src/app/home-components/home-kb/home-kb.component.ts`

Modifica:

- `app/knowledge-bases2/modals/modal-hook-bot/...` → `app/knowledge-bases/modals/modal-hook-bot/...`
- `app/knowledge-bases2/modals/modal-chatbot-name/...` → `app/knowledge-bases/modals/modal-chatbot-name/...`

### 3.2 `HomeCdsComponent`

File: `src/app/home-components/home-cds/home-cds.component.ts`

Modifica:

- `app/knowledge-bases2/modals/modal-hook-bot/...` → `app/knowledge-bases/modals/modal-hook-bot/...`
- `app/knowledge-bases2/modals/modal-chatbot-name/...` → `app/knowledge-bases/modals/modal-chatbot-name/...`

### 3.3 `CnpTemplatesComponent`

File: `src/app/create-new-project/cnp-templates/cnp-templates.component.ts`

Modifica:

- `app/knowledge-bases2/modals/modal-chatbot-name/...` → `app/knowledge-bases/modals/modal-chatbot-name/...`

### 3.4 `WsRequestsMsgsComponent`

File: `src/app/ws_requests/ws-requests-msgs/ws-requests-msgs.component.ts`

Modifica:

- `app/knowledge-bases2/modals/modal-chatbot-name/...` → `app/knowledge-bases/modals/modal-chatbot-name/...`

---

## Step 4 — (Solo se serve) Annullare il refactor dei widget Home in un modulo condiviso

Abbiamo introdotto `HomeWidgetsModule` per evitare l’errore Angular:
> “The Component 'HomeKbComponent' is declared by more than one NgModule.”

Se vuoi fare rollback anche di questa parte, hai due opzioni:

### Opzione A (consigliata): tenere `HomeWidgetsModule`

Puoi lasciare questi file/cambi: sono indipendenti dal routing KB e in genere migliorano la struttura dei moduli:

- `src/app/home-components/home-widgets.module.ts` (nuovo)
- `src/app/home2/home2.module.ts` importa `HomeWidgetsModule`
- `src/app/home/home.module.ts` importa `HomeWidgetsModule`

Questa opzione in genere è sicura e non impedisce il rollback della KB.

### Opzione B: rimuovere `HomeWidgetsModule` e ripristinare le `declarations` precedenti

File:
- `src/app/home-components/home-widgets.module.ts` (eliminare)
- `src/app/home2/home2.module.ts` (ripristinare la lista precedente in `declarations` + import richiesti)
- `src/app/home/home.module.ts` (idem)

Se scegli l’Opzione B, assicurati che **ogni widget sia dichiarato in un solo NgModule**. Se sia `HomeModule` che `Home2Module` dichiarano lo stesso widget, tornerà l’errore di dichiarazione duplicata.

---

## Step 5 — Riavviare e verificare

Dopo le modifiche:

- ferma tutti i processi `ng serve`
- lancia `npx ng serve`

Checklist verifica:

- Navigando su `/project/<id>/knowledge-bases` viene caricato **il legacy KB**
- Non ci sono errori di build legati a moduli mancanti (Angular Material / Translate / Forms)
- La Home funziona ancora (tooltip, menu, checkbox)

---

## Troubleshooting

### Se vedi errori tipo “No pipe found with name 'translate'” o “ngModel isn't known”
Significa che il modulo che dichiara quel componente/template non importa uno tra:

- `TranslateModule`
- `FormsModule` (per `[(ngModel)]`)
- i moduli Angular Material necessari (`MatFormFieldModule`, `MatInputModule`, `MatExpansionModule`, ecc.)
- `NgSelectModule`

Questi errori non sono “di routing”: sono errori di **import dei moduli**.

