# Bootstrap 3 to Bootstrap 5 Migration Summary

## Modifiche Effettuate

### 1. Aggiornamento Dipendenze (`package.json`)

- **Bootstrap**: da `^3.4.0` a `^5.3.2`
- **Aggiunto**: `@popperjs/core` versione `^2.11.8` (necessario per Bootstrap 5)
- **Rimosso**: 
  - `bootstrap-material-design` (non compatibile con Bootstrap 5)
  - `bootstrap-notify` (non compatibile con Bootstrap 5)
- **Aggiornato**: `@types/bootstrap` rimosso (non disponibile per Bootstrap 5)

### 2. Aggiornamento File di Configurazione (`angular.json`)

- Aggiornati gli script JavaScript caricati:
  - Aggiunto: `@popperjs/core/dist/umd/popper.min.js`
  - Sostituito: `bootstrap/dist/js/bootstrap.bundle.min.js` (include Popper.js)
  - Rimossi: `bootstrap-material-design` e `bootstrap-notify`

### 3. Migrazione Classi CSS

Sono stati aggiornati **tutti i file HTML** per utilizzare le nuove classi Bootstrap 5:

#### Grid System
- `col-xs-*` → `col-*`
- Le classi `col-sm-*`, `col-md-*`, `col-lg-*`, `col-xl-*` sono rimaste invariate

#### Visibility Classes
- `hidden-xs` → `d-none d-sm-block`
- `hidden-sm` → `d-sm-none d-md-block`
- `hidden-md` → `d-md-none d-lg-block`
- `hidden-lg` → `d-lg-none d-xl-block`
- `hidden-xl` → `d-xl-none`
- `visible-xs` → `d-block d-sm-none`
- `visible-sm` → `d-none d-sm-block d-md-none`
- E così via...

#### Margin e Padding
- `ml-*` → `ms-*` (margin-left → margin-start)
- `mr-*` → `me-*` (margin-right → margin-end)
- `pl-*` → `ps-*` (padding-left → padding-start)
- `pr-*` → `pe-*` (padding-right → padding-end)

#### Text Alignment
- `text-left` → `text-start`
- `text-right` → `text-end`

#### Float
- `pull-left` → `float-start`
- `pull-right` → `float-end`

#### Form Classes
- `form-group` → `mb-3`
- `form-control-static` → `form-control-plaintext`
- `input-group-addon` → `input-group-text`
- `btn-default` → `btn-secondary`
- `btn-xs` → `btn-sm`

#### Panel → Card
- `panel` → `card`
- `panel-default` → `card`
- `panel-primary` → `card border-primary`
- `panel-success` → `card border-success`
- `panel-info` → `card border-info`
- `panel-warning` → `card border-warning`
- `panel-danger` → `card border-danger`
- `panel-heading` → `card-header`
- `panel-body` → `card-body`
- `panel-footer` → `card-footer`

#### Well → Card
- `well` → `card`
- `well-sm` → `card card-body`
- `well-lg` → `card card-body`

#### Label → Badge
- `label` → `badge`
- `label-default` → `badge bg-secondary`
- `label-primary` → `badge bg-primary`
- `label-success` → `badge bg-success`
- `label-info` → `badge bg-info`
- `label-warning` → `badge bg-warning`
- `label-danger` → `badge bg-danger`

#### Altri Cambiamenti
- `table-condensed` → `table-sm`
- `center-block` → `mx-auto`
- `sr-only` → `visually-hidden`
- `sr-only-focusable` → `visually-hidden-focusable`

### 4. Aggiornamento Variabili SCSS

Creato file `src/assets/sass/bootstrap5-variables.scss` con:
- Nuove variabili di breakpoint Bootstrap 5
- Supporto per compatibilità con variabili Bootstrap 3
- Unità coerenti (px invece di rem)

Aggiornato `src/assets/sass/md/_variables.scss`:
- Correzioni per unità incompatibili nei calcoli container
- Fix per `navbar-padding-horizontal`

### 5. Correzioni Errori

- Risolto errore "unterminated string" in `user-profile.component.scss`
- Risolto errore "incompatible units" nelle variabili Bootstrap
- **Risolto errore `$.material.init()`**: Commentata la chiamata in `app.component.ts` e `documentation/js/material-dashboard.js`
- **Risolto errore `updateUrl is not a function`**: Aggiunto metodo mancante in `history-and-nort-convs.component.ts`

## Risultati

✅ **Build completata con successo**
- Nessun errore di compilazione
- Solo avvisi di deprecazione per l'uso di `/` in Sass (non critici)
- Tutti i bundle generati correttamente

## Note Importanti

1. **Material Design**: La libreria `bootstrap-material-design` è stata rimossa in quanto non compatibile con Bootstrap 5. Se necessario, dovrete trovare un'alternativa o reimplementare gli stili.

2. **Notifiche**: La libreria `bootstrap-notify` è stata rimossa. Dovrete utilizzare un sistema di notifiche alternativo (ad esempio, Angular Material Snackbar o Sweetalert2 che è già nel progetto).

3. **Media Queries**: I file SCSS che utilizzano media queries dovrebbero funzionare correttamente grazie alle variabili di compatibilità aggiunte.

## Prossimi Passi Consigliati

1. **Testare l'applicazione** in ambienti di sviluppo, pre-produzione e produzione
2. **Verificare gli stili** delle pagine principali per assicurarsi che tutto appaia correttamente
3. **Sostituire bootstrap-material-design** con un'alternativa o reimplementare gli stili necessari
4. **Sostituire bootstrap-notify** con il sistema di notifiche preferito
5. **Aggiornare eventuali plugin jQuery** che dipendono da Bootstrap 3

## Backup

Prima di procedere, è stato consigliato di creare un backup del progetto. Se necessario, i file possono essere ripristinati dal repository Git.

## File Modificati

- `package.json`: Dipendenze aggiornate
- `angular.json`: Script e stili aggiornati
- Tutti i file `.html` in `src/`: Classi Bootstrap aggiornate
- `src/assets/sass/md/_variables.scss`: Variabili corrette
- `src/assets/sass/bootstrap5-variables.scss`: Nuove variabili Bootstrap 5
- `src/assets/sass/md/_responsive.scss`: Media queries aggiornate
- `src/app/user-profile/user-profile.component.scss`: Fix stringa non terminata
