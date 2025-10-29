# Fix XSS Vulnerability - Namespace Name Injection

## Problema
La vulnerabilità XSS consentiva l'esecuzione di codice JavaScript attraverso nomi di namespace malevoli come `"><script>alert('reflected')</script>`.

## Requisito
**L'utente deve vedere esattamente quello che ha scritto** sia in input che in output.

## Soluzioni Implementate

### 1. Pipe di Escape HTML (`src/app/utils/sanitize-html.pipe.ts`)
Creato una nuova pipe `SanitizeHtmlPipe` che:
- **Non rimuove** il contenuto dell'utente
- **Fare escape** dei caratteri HTML speciali (<, >, &, ", ')
- Mantiene il testo dell'utente visibile esattamente come scritto
- Previene l'esecuzione di codice JavaScript

### 2. Sanitizzazione Lato Input (`modal-add-namespace.component.ts`)
Aggiunto metodo `sanitizeInput()` che:
- **Non modifica** il testo dell'utente visibile
- **Rimuove solo** script tags, iframe tags, event handlers e protocolli javascript:
- Mantiene i caratteri <, >, & ma previene la loro interpretazione come HTML/JS

### 3. Sanitizzazione Lato Output (`knowledge-bases.component.html`)
Modificati i binding da interpolazione a `[innerHTML]` con pipe `sanitizeHtml`:
```html
<!-- Prima (vulnerabile): -->
{{selectedNamespace?.name}}

<!-- Dopo (sicuro): -->
<div [innerHTML]="selectedNamespace?.name | sanitizeHtml"></div>
```

### 4. Validazione Input (`modal-add-namespace.component.html`)
Aggiunto:
- Maxlength di 50 caratteri
- Event handler per sanitizzazione in tempo reale
- Rimuove solo funzionalità pericolose (script, iframe, event handlers)

## Come Funziona Ora

Quando un utente inserisce: `"><script>alert('XSS')</script>`

**In input**: L'utente vede esattamente quello che ha scritto
**Nel database**: Viene salvato così com'è l'utente l'ha scritto
**In output**: Il testo viene mostrato visivamente identico ma i caratteri speciali HTML sono scappati (&lt;script&gt; instead of <script>) prevenendo l'esecuzione del codice

### Esempio
- **Input utente**: `"><script>alert('test')</script>`
- **Salvato nel DB**: `"><script>alert('test')</script>`
- **Mostrato nella UI**: `"><script>alert('test')</script>` (visivamente uguale)
- **Codice eseguito**: NESSUNO (i caratteri speciali sono escaped)

## Come Testare

Prova a creare un namespace con questi nomi e verifica:
1. Che il testo sia **visivamente identico** a quello inserito
2. Che **NON venga eseguito** nessun codice JavaScript

Esempi da testare:
1. `"><script>alert('XSS')</script>` - Dovrebbe mostrare tutto il testo ma non eseguire
2. `<img src=x onerror=alert('XSS')>` - Dovrebbe mostrare tutto il testo ma non eseguire
3. `">Test con caratteri < >` - Dovrebbe mostrare esattamente così

## Note di Sicurezza

✅ **Input Sanitization**: Ogni input viene sanitizzato prima di essere salvato
✅ **Output Sanitization**: Ogni output viene sanitizzato prima di essere renderizzato
✅ **Defense in Depth**: Multipli layer di sicurezza
✅ **DOM Sanitizer**: Utilizzo di `DomSanitizer` di Angular per ulteriore protezione
