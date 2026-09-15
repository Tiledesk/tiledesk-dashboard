import { Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from 'app/core/auth.service';
import { AnalyticsEmbedService } from 'app/services/analytics-embed.service';
import { AppConfigService } from 'app/services/app-config.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'home-analytics-embed',
  templateUrl: './home-analytics-embed.component.html',
  styleUrls: ['./home-analytics-embed.component.scss']
})
export class HomeAnalyticsEmbedComponent implements OnInit, OnChanges, OnDestroy {
  @Input() projectId: string | null = null;
  @ViewChild('analyticsIframe') analyticsIframeRef?: ElementRef<HTMLIFrameElement>;

  embedUrl: SafeResourceUrl | null = null;
  loading = true;
  configError = false;
  tokenError = false;

  private refreshTimer?: ReturnType<typeof setTimeout>;
  private userSub?: Subscription;
  private tiledeskJwt: string | null = null;
  private postMessageTargetOrigin = '*';
  private embedRequestStarted = false;

  constructor(
    private sanitizer: DomSanitizer,
    private embedService: AnalyticsEmbedService,
    private auth: AuthService,
    private appConfigService: AppConfigService,
    private logger: LoggerService
  ) {}

  ngOnInit(): void {
    this.setPostMessageTargetFromConfig();
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
      this.tryStartEmbed();
    });
    window.addEventListener('message', this.handleMessage);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId'] && !changes['projectId'].firstChange) {
      this.embedRequestStarted = false;
      this.embedUrl = null;
      this.tryStartEmbed();
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.handleMessage);
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    this.userSub?.unsubscribe();
  }

  onAnalyticsIframeLoad(): void {
    this.loading = false;
  }

  private tryStartEmbed(): void {
    if (this.embedRequestStarted || !this.projectId || !this.tiledeskJwt) {
      if (!this.projectId) {
        this.loading = false;
        this.configError = true;
        this.logger.error('[HomeAnalyticsEmbed] Missing projectId');
      }
      return;
    }
    this.embedRequestStarted = true;
    this.fetchTokenAndSetUrl();
  }

  private setPostMessageTargetFromConfig(): void {
    this.postMessageTargetOrigin = this.embedService.getEmbedPostMessageTargetOrigin();
  }

  private getEmbedBase(): string {
    const c = this.appConfigService.getConfig();
    const base = c?.analyticsEmbedBase as string | undefined;
    return typeof base === 'string' ? base.replace(/\/?$/, '/') : '';
  }

  private fetchTokenAndSetUrl(): void {
    const apiBase = this.appConfigService.getConfig()?.analyticsApiBase as string | undefined;
    const embedBase = this.getEmbedBase();
    if (!apiBase || !embedBase) {
      this.loading = false;
      this.configError = true;
      this.logger.error('[HomeAnalyticsEmbed] analyticsApiBase or analyticsEmbedBase missing in config');
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
        const sep = embedBase.includes('?') ? '&' : '?';
        // context=home → analytics SPA shows Overview only (no tabs/toolbar/header)
        const url = `${embedBase}${sep}token=${encodeURIComponent(resp.token)}&context=home`;
        this.embedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        if (this.refreshTimer) {
          clearTimeout(this.refreshTimer);
        }
        const refreshInMs = Math.max((resp.expires_in - 300) * 1000, 60_000);
        this.refreshTimer = setTimeout(() => this.sendRefreshedToken(), refreshInMs);
      },
      error: (err) => {
        this.logger.error('[HomeAnalyticsEmbed] embed token error', err);
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
      error: (err) => this.logger.error('[HomeAnalyticsEmbed] token refresh failed', err)
    });
  }

  private handleMessage = (event: MessageEvent): void => {
    if (event.data?.type === 'ANALYTICS_TOKEN_REFRESH_NEEDED') {
      this.sendRefreshedToken();
    }
  };
}
