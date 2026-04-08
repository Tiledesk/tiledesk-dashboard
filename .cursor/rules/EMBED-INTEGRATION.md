# Embedding the Analytics Dashboard in tiledesk-dashboard (Angular)

This document describes how to embed the Tiledesk Analytics dashboard as an
`<iframe>` inside the tiledesk-dashboard Angular application.

---

## Overview

The Analytics dashboard is a standalone React SPA served by the analytics API
at the path `/embed/`. Access is controlled by a short-lived **embed token** (JWT,
1-hour TTL). The token is passed to the iframe via the URL query string and refreshed
transparently via the browser's `postMessage` API.

```
tiledesk-dashboard (Angular)
  └── <iframe src="https://analytics.example.com/embed/?token=<embed-token>">
        └── Analytics SPA (React)
              └── all API calls use the embed token transparently
```

---

## Step 1 — Obtain an Embed Token (server-side or Angular service)

Before rendering the iframe, tiledesk-dashboard must obtain an embed token from the
Analytics API. The embed token proves that the current user is authorised to view
analytics for their project.

### Endpoint

```
POST /api/v1/embed-token
Authorization: Bearer <tiledesk-jwt>
Content-Type: application/json

{ "id_project": "<projectId>" }
```

| Field | Description |
|---|---|
| `Authorization` | The user's existing Tiledesk JWT (the same token used for the Tiledesk REST API). |
| `id_project` | The project ID whose analytics the user wants to view. Must match the `id_project` claim in the Tiledesk JWT. |

### Response

```json
{
  "token": "<embed-jwt>",
  "expires_in": 3600,
  "type": "embed"
}
```

The `token` is valid for **1 hour** from issuance.

### Angular service example

```typescript
// analytics-embed.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface EmbedTokenResponse {
  token: string;
  expires_in: number;
  type: string;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsEmbedService {
  // Base URL of the analytics API (e.g. https://analytics.example.com)
  private readonly analyticsApiBase = environment.analyticsApiBase;

  constructor(private http: HttpClient) {}

  getEmbedToken(projectId: string, tiledeskJwt: string): Observable<EmbedTokenResponse> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${tiledeskJwt}` });
    return this.http.post<EmbedTokenResponse>(
      `${this.analyticsApiBase}/api/v1/embed-token`,
      { id_project: projectId },
      { headers }
    );
  }
}
```

---

## Step 2 — Render the iframe

Pass the embed token as a `token` query parameter in the iframe `src`. The
Analytics SPA reads it from the URL on load.

```typescript
// analytics-panel.component.ts
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AnalyticsEmbedService } from './analytics-embed.service';

@Component({
  selector: 'app-analytics-panel',
  template: `
    <iframe
      *ngIf="embedUrl"
      [src]="embedUrl"
      width="100%"
      height="100%"
      frameborder="0"
      allow="clipboard-read; clipboard-write"
    ></iframe>
  `
})
export class AnalyticsPanelComponent implements OnInit, OnDestroy {
  @Input() projectId!: string;
  @Input() tiledeskJwt!: string;

  embedUrl: SafeResourceUrl | null = null;

  private refreshTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private sanitizer: DomSanitizer,
    private embedService: AnalyticsEmbedService
  ) {}

  ngOnInit(): void {
    this.fetchTokenAndSetUrl();
    // Listen for token-refresh requests from the iframe
    window.addEventListener('message', this.handleMessage);
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.handleMessage);
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
  }

  private fetchTokenAndSetUrl(): void {
    this.embedService.getEmbedToken(this.projectId, this.tiledeskJwt).subscribe({
      next: (resp) => {
        const url = `${environment.analyticsEmbedBase}?token=${resp.token}`;
        this.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        // Schedule proactive refresh 5 minutes before expiry
        const refreshIn = (resp.expires_in - 300) * 1000;
        this.refreshTimer = setTimeout(() => this.sendRefreshedToken(), refreshIn);
      },
      error: (err) => console.error('Failed to obtain analytics embed token', err)
    });
  }

  /**
   * Send a fresh token to the iframe via postMessage.
   * Called either proactively (timer) or in response to ANALYTICS_TOKEN_REFRESH_NEEDED.
   */
  private sendRefreshedToken(): void {
    this.embedService.getEmbedToken(this.projectId, this.tiledeskJwt).subscribe({
      next: (resp) => {
        const iframe = document.querySelector('app-analytics-panel iframe') as HTMLIFrameElement;
        iframe?.contentWindow?.postMessage({ type: 'ANALYTICS_TOKEN', token: resp.token }, '*');
        // Re-arm the refresh timer
        const refreshIn = (resp.expires_in - 300) * 1000;
        this.refreshTimer = setTimeout(() => this.sendRefreshedToken(), refreshIn);
      }
    });
  }

  private handleMessage = (event: MessageEvent): void => {
    if (event.data?.type === 'ANALYTICS_TOKEN_REFRESH_NEEDED') {
      this.sendRefreshedToken();
    }
  };
}
```

---

## Step 3 — Token refresh protocol

The token lifecycle is managed by a two-way `postMessage` protocol between the
Angular parent and the Analytics iframe.

| Direction | Message type | Payload | When |
|---|---|---|---|
| iframe → parent | `ANALYTICS_TOKEN_REFRESH_NEEDED` | *(none)* | 5 minutes before the current token expires |
| parent → iframe | `ANALYTICS_TOKEN` | `{ token: "<new-embed-jwt>" }` | In response to `ANALYTICS_TOKEN_REFRESH_NEEDED`, or proactively |

The Angular component should:
1. Listen for `ANALYTICS_TOKEN_REFRESH_NEEDED` on `window`.
2. Call `POST /api/v1/embed-token` to get a fresh token.
3. Post `{ type: 'ANALYTICS_TOKEN', token: '<new-token>' }` to `iframe.contentWindow`.

The Analytics SPA will update its in-memory token store without reloading the page.

---

## Step 4 — Infrastructure configuration

Two environment variables on the Analytics API must be set correctly for embedding
to work. Both are managed in Helm `values.yaml` (or the environment-specific override).

### `ALLOWED_FRAME_ORIGINS` — Content-Security-Policy `frame-ancestors`

Controls which origins are allowed to embed the Analytics SPA in an `<iframe>`.
Set this to the origin(s) of tiledesk-dashboard.

```yaml
# helm/values-stage.yaml  (or values-production.yaml)
config:
  cors:
    allowedFrameOrigins: "https://dashboard.tiledesk.com"
```

Multiple origins are space-separated:
```yaml
allowedFrameOrigins: "https://dashboard.tiledesk.com https://dashboard-staging.tiledesk.com"
```

> **If this is not set correctly the browser will block the iframe** with a CSP error.

### `ALLOWED_FRAME_ORIGINS` vs `CORS_ORIGINS`

| Variable | Purpose |
|---|---|
| `CORS_ORIGINS` | API requests from browser JS (comma-separated) |
| `ALLOWED_FRAME_ORIGINS` | `frame-ancestors` CSP for iframe embedding (space-separated) |

Both should include the tiledesk-dashboard origin.

### Angular environment variables

Add the analytics URLs to the Angular `environment.ts`:

```typescript
// environment.ts / environment.prod.ts
export const environment = {
  production: false,
  analyticsApiBase: 'https://stage.eks.tiledesk.com/analyticsapi/',   // Used to call /api/v1/embed-token
  analyticsEmbedBase: 'https://analytics.example.com/analytics', // iframe src base
};
```

---

## Step 5 — Security considerations

| Topic | Guidance |
|---|---|
| **Token storage** | The embed token lives only in the iframe URL and in-memory inside the SPA. Never store it in `localStorage`. |
| **`postMessage` origin** | Production code should replace the `'*'` target origin in `postMessage` calls with the exact analytics origin (e.g. `'https://analytics.example.com'`). |
| **Project isolation** | The embed token is scoped to a single `id_project`. A user cannot use their token to view another project's data. |
| **Token TTL** | Tokens expire after 1 hour. The refresh protocol ensures seamless continuation without page reload. |
| **`EMBED_JWT_SECRET`** | This secret must differ from `JWT_SECRET`. It signs only embed tokens and is never shared with tiledesk-server. |

---

## Summary — integration checklist

- [ ] Add `AnalyticsEmbedService` to call `POST /api/v1/embed-token`
- [ ] Add `AnalyticsPanelComponent` with iframe + postMessage listener
- [ ] Add `environment.analyticsApiBase` and `environment.analyticsEmbedBase`
- [ ] Set `ALLOWED_FRAME_ORIGINS` in Analytics Helm values to include the dashboard origin
- [ ] Set `CORS_ORIGINS` to include the dashboard origin
- [ ] Verify `EMBED_JWT_SECRET` is set and differs from `JWT_SECRET`
