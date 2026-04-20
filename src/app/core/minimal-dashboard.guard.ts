import { Injectable } from '@angular/core';
import { CanMatch, Route, UrlSegment } from '@angular/router';
import { AppConfigService } from 'app/services/app-config.service';

@Injectable({ providedIn: 'root' })
export class MinimalDashboardGuard implements CanMatch {
  constructor(private appConfigService: AppConfigService) {}

  canMatch(_route: Route, _segments: UrlSegment[]): boolean {
    const cfg: any = this.appConfigService.getConfig?.();
    return cfg?.dashboardType === 'minimal';
  }
}

