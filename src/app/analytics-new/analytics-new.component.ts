import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from 'app/services/app-config.service';
import { AnalyticsEmbedService } from 'app/services/analytics-embed.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'appdashboard-analytics-new',
  templateUrl: './analytics-new.component.html',
  styleUrls: ['./analytics-new.component.scss']
})
export class AnalyticsNewComponent implements OnInit, OnDestroy {
  @ViewChild('analyticsIframe') analyticsIframeRef?: ElementRef<HTMLIFrameElement>;

  embedUrl: SafeResourceUrl | null = null;
  loading = true;
  configError = false;
  tokenError = false;

  private refreshTimer?: ReturnType<typeof setTimeout>;
  private userSub?: Subscription;
  private projectId: string | null = null;
  private tiledeskJwt: string | null = null;
  private postMessageTargetOrigin = '*';
  private embedRequestStarted = false;

  constructor(
    private sanitizer: DomSanitizer,
    private embedService: AnalyticsEmbedService,
    private route: ActivatedRoute,
    private auth: AuthService,
    private appConfigService: AppConfigService,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.setPostMessageTargetFromConfig();
    this.projectId = this.resolveProjectIdFromRoute();
    console.log('[AnalyticsNew] projectId' , this.projectId)
    if (!this.projectId) {
      this.logger.error('[AnalyticsNew] Missing projectid in route');
      this.loading = false;
      this.configError = true;
      return;
    }

    this.userSub = this.auth.user_bs.subscribe((user) => {
      if (!user) {
        return;
      }
      this.tiledeskJwt = user.token ?? null;
      if (!this.tiledeskJwt) {
        this.loading = false;
        this.tokenError = true;
        return;
      }
      this.tokenError = false;
      if (!this.embedRequestStarted) {
        this.embedRequestStarted = true;
        this.fetchTokenAndSetUrl();
      }
    });

    window.addEventListener('message', this.handleMessage);
  }

  private resolveProjectIdFromRoute(): string | null {
    let r: ActivatedRoute | null = this.route;
    while (r) {
      const id = r.snapshot.paramMap.get('projectid');
      if (id) {
        return id;
      }
      r = r.parent;
    }
    return null;
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.handleMessage);
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    this.userSub?.unsubscribe();
  }

  private setPostMessageTargetFromConfig(): void {
    const embedBase = this.appConfigService.getConfig()?.analyticsEmbedBase as string | undefined;
    if (!embedBase) {
      return;
    }
    try {
      const origin = new URL(embedBase, window.location.origin).origin;
      if (origin && origin !== 'null') {
        this.postMessageTargetOrigin = origin;
      }
    } catch {
      // keep '*'
    }
  }

  private getEmbedBase(): string {
    const c = this.appConfigService.getConfig();
    const base = c?.analyticsEmbedBase as string | undefined;
    console.log('[AnalyticsNew] EmbedBase ', base);
    return typeof base === 'string' ? base.replace(/\/?$/, '/') : '';
  }

  private fetchTokenAndSetUrl(): void {
    const apiBase = this.appConfigService.getConfig()?.analyticsApiBase as string | undefined;
    const embedBase = this.getEmbedBase();
    if (!apiBase || !embedBase) {
      this.loading = false;
      this.configError = true;
      this.logger.error('[AnalyticsNew] analyticsApiBase or analyticsEmbedBase missing in config');
      return;
    }

    if (!this.projectId || !this.tiledeskJwt) {
      this.loading = false;
      return;
    }

    this.loading = true;
    this.tokenError = false;
    this.embedService.getEmbedToken(this.projectId, this.tiledeskJwt).subscribe({
      next: (resp) => {
        console.log('[AnalyticsNew] resp ', resp);
        const sep = embedBase.includes('?') ? '&' : '?';
        const url = `${embedBase}${sep}token=${encodeURIComponent(resp.token)}`;
        this.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        console.log('[AnalyticsNew] embedUrl ',  this.embedUrl);
        this.loading = false;
        if (this.refreshTimer) {
          clearTimeout(this.refreshTimer);
        }
        const refreshInMs = Math.max((resp.expires_in - 300) * 1000, 60_000);
        this.refreshTimer = setTimeout(() => this.sendRefreshedToken(), refreshInMs);
      },
      error: (err) => {
        this.logger.error('[AnalyticsNew] embed token error', err);
        this.loading = false;
        this.tokenError = true;
      }
    });
  }

  private sendRefreshedToken(): void {
    if (!this.projectId || !this.tiledeskJwt) {
      return;
    }
    this.embedService.getEmbedToken(this.projectId, this.tiledeskJwt).subscribe({
      next: (resp) => {
        const iframe = this.analyticsIframeRef?.nativeElement;
        iframe?.contentWindow?.postMessage(
          { type: 'ANALYTICS_TOKEN', token: resp.token },
          this.postMessageTargetOrigin
        );
        if (this.refreshTimer) {
          clearTimeout(this.refreshTimer);
        }
        const refreshInMs = Math.max((resp.expires_in - 300) * 1000, 60_000);
        this.refreshTimer = setTimeout(() => this.sendRefreshedToken(), refreshInMs);
      },
      error: (err) => this.logger.error('[AnalyticsNew] token refresh failed', err)
    });
  }

  private handleMessage = (event: MessageEvent): void => {
    if (event.data?.type === 'ANALYTICS_TOKEN_REFRESH_NEEDED') {
      this.sendRefreshedToken();
    }
  };
}
