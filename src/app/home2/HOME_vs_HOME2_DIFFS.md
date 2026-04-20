# Differenze sostanziali tra `Home` e `Home2`

Questo documento riassume le differenze **funzionali** e **architetturali** tra:

- `Home` → `src/app/home/*` (`HomeComponent`, `HomeModule`)
- `Home2` → `src/app/home2/*` (`Home2Component`, `Home2Module`)

Fonti principali usate:

- `src/app/home2/HOME_COMPONENT_ANALYSIS.md`
- `src/app/home2/HOME2_REFACTOR_PLAN_AND_REPORT.md`
- `src/app/home/home.module.ts`, `src/app/home2/home2.module.ts`
- `src/app/home/home.component.ts`, `src/app/home2/home2.component.ts`

---

## Differenze “visibili” per l’utente (UI/UX)

- **UI molto simile (parity-first)**: `Home2` nasce come clonazione di `Home` con obiettivo di **parità di rendering e comportamento** (stessi blocchi, stessi CTA, stessi gating per ruolo/permessi/feature flags), prima di rifattorizzare.
- **Indicatore temporaneo**: nel template `home2.component.html` compare la stringa `HOME 2 COMPONENT` accanto a `{{ prjct_name }}` (utile per distinguere quale home è attiva).

> Nota: le differenze “di UX” vere e proprie sono volutamente minimizzate; la differenza principale è **nel wiring** e nella manutenzione del codice.

---

## Differenze di routing e attivazione

- **Home (classica)**:
  - route: `project/:projectid/home` → lazy-load `HomeModule`.
- **Home2**:
  - stessa route `project/:projectid/home`, ma viene selezionata in base alla configurazione:
    - **dashboard minimal** → `Home2Module`
    - **dashboard non-minimal** → `HomeModule`

Questo comportamento è implementato via **`canMatch` guards**:

- `MinimalDashboardGuard` (già presente) legge `AppConfigService.getConfig().dashboardType === 'minimal'`.
- `ClassicDashboardGuard` (aggiunta) fa il fallback quando `dashboardType !== 'minimal'`.

---

## Differenze architetturali (la differenza più importante)

### 1) Responsabilità del componente

- **Home (`HomeComponent`)**:
  - componente “monolitico”: contiene nello stesso file:
    - bootstrap (user/project stream)
    - parsing feature flags (public key)
    - permessi (`PERMISSION_TO_*`)
    - quote/limiti (math + mapping)
    - preferenze dashlets/onboarding
    - side effects (analytics, storage, routing, modali)

- **Home2 (`Home2Component`)**:
  - componente più “thin”: molte parti sono state spostate in servizi/facade dedicati.
  - obiettivo: lasciare al component principalmente:
    - stato necessario al template
    - handler UI che delegano ad “actions services”

### 2) Stato derivato (ViewModel) e composizione

- **Home**: calcolo e assegnazioni imperativi distribuiti nel component.
- **Home2**: introduce/usa mapping e VM dedicati (approccio più testabile):
  - `Home2Facade` (orchestrazione di streams base come user/project + stati correlati)
  - mapper/VM services:
    - config/flags: `Home2ConfigVmService` + `parsePublicKeyFlags()`
    - quote VM: `mapQuotesDataToVm()`
    - attributi progetto/dashlets/onboarding VM: `getProjectAttributesVm()`
    - permessi VM: `Home2PermissionsVmService`

### 3) Side effects isolati

- **Home**: side effects diretti nel component (es. `window['analytics']`, `localStorage`, `Swal`/`sweetalert`, `router.navigate`, `window.open`).
- **Home2**: separazione esplicita in servizi:
  - `Home2TrackingService` (analytics)
  - `Home2StorageService` (chiavi e persistenza)
  - `Home2NavigationService` (routing/link esterni/mailto)
  - `Home2ModalService` (modali)
  - `Home2ProjectProfileService` (logica profilo progetto)

Risultato pratico: `Home2Component` è più facile da testare e meno fragile rispetto a cambiamenti trasversali.

---

## Differenze di modulo e “widget composition”

### HomeModule

Storicamente `HomeModule` dichiarava direttamente molti componenti “widget” (grafici, WhatsApp, KB, news feed, ecc.).

### Home2Module

`Home2Module` importa i moduli necessari al template (Material, Translate, ecc.) e compone i widget tramite un modulo condiviso.

### Modulo condiviso dei widget

Per evitare **dichiarazioni duplicate** degli stessi widget in più moduli, è stato introdotto:

- `src/app/home-components/home-widgets.module.ts` → `HomeWidgetsModule`

Che:

- **dichiara** i widget della home
- li **esporta** per essere usati sia da `HomeModule` che da `Home2Module`

In sintesi: `Home2` spinge verso una composizione più modulare e riusabile.

---

## Differenze su permessi, quote e feature flags (semantica)

- **Intento**: `Home2` cerca di mantenere la stessa semantica di `Home` su:
  - gating UI per `USER_ROLE` e `PERMISSION_TO_*`
  - parsing feature flags da “public key”
  - quote e percentuali (cap a 100, runnedOut, label reset)
  - dashlets + onboarding preferences (`project.attributes`)

- **Differenza**: in `Home2` questa logica è più spesso incapsulata in **mapper/VM** e servizi dedicati (meno codice “sparso” nel component).

---

## Impatti pratici (per sviluppo e manutenzione)

- **Home**:
  - più facile introdurre regressioni “silenziose” perché UI/state/side-effects sono intrecciati.
  - refactor più rischiosi e conflitti di merge più probabili (file enorme).

- **Home2**:
  - più facile isolare e testare:
    - mapping di quote
    - parsing flags
    - mapping attributi progetto/onboarding
    - side effects (tracking/storage/navigation/modals)
  - rollback più semplice perché il cambio è principalmente **di routing/wiring**.

---

## Checklist veloce: “quando uso quale”

- **Uso `Home2`** quando:
  - dashboard type è `minimal` (config)
  - vuoi un punto di ingresso home più modulare e testabile

- **Uso `Home`** quando:
  - dashboard non è `minimal`
  - vuoi mantenere il comportamento legacy senza passare dal nuovo wiring

