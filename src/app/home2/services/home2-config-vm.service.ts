import { Injectable } from '@angular/core';
import { AppConfigService } from 'app/services/app-config.service';

export interface Home2ConfigVm {
  chatBaseUrl: string | undefined;
  publicKey: string | undefined;
  promoBannerUrl: string | undefined;
  promoBannerVisible: boolean;
}

export interface Home2PublicKeyFlags {
  isVisiblePay: boolean;
  isVisibleANA: boolean;
  isVisibleAPP: boolean;
  isVisibleOPH: boolean;
  isVisibleHomeBanner: boolean;
  projectPlanBadge: boolean;
  isVisibleKNB: boolean;
  isVisibleQuoteSection: boolean;
}

export function parsePublicKeyFlags(publicKey: string | undefined): Home2PublicKeyFlags {
  const flags: Home2PublicKeyFlags = {
    isVisiblePay: false,
    isVisibleANA: false,
    isVisibleAPP: false,
    isVisibleOPH: false,
    isVisibleHomeBanner: false,
    projectPlanBadge: false,
    isVisibleKNB: false,
    isVisibleQuoteSection: false
  };

  if (!publicKey || typeof publicKey !== 'string') {
    return flags;
  }

  // Public key format is historically loose. We keep backward compatibility by treating
  // a missing value (e.g. "PAY") as enabled and only disabling when value is exactly "F".
  const normalized = publicKey.replace(/\s+/g, '');
  const parts = normalized.split('-');
  for (const rawPart of parts) {
    const part = (rawPart ?? '').trim();
    if (!part) continue;

    const [rawKey, rawValue] = part.split(':', 2);
    const key = (rawKey ?? '').toUpperCase();
    if (!key) continue;

    const value = (rawValue ?? '').toUpperCase();
    const enabled = value !== 'F';

    if (key.includes('PAY')) flags.isVisiblePay = enabled;
    if (key.includes('ANA')) flags.isVisibleANA = enabled;
    if (key.includes('APP')) flags.isVisibleAPP = enabled;
    if (key.includes('OPH')) flags.isVisibleOPH = enabled;
    if (key.includes('HPB')) flags.isVisibleHomeBanner = enabled;
    if (key.includes('PPB')) flags.projectPlanBadge = enabled;
    if (key.includes('KNB')) flags.isVisibleKNB = enabled;
    if (key.includes('QIN')) flags.isVisibleQuoteSection = enabled;
  }

  return flags;
}

@Injectable({ providedIn: 'root' })
export class Home2ConfigVmService {
  constructor(private appConfigService: AppConfigService) {}

  getConfigVm(): Home2ConfigVm {
    const cfg: any = this.appConfigService.getConfig();
    const promoBannerUrl = cfg?.promoBannerUrl;

    return {
      chatBaseUrl: cfg?.CHAT_BASE_URL,
      publicKey: cfg?.t2y12PruGU9wUtEGzBJfolMIgK,
      promoBannerUrl,
      promoBannerVisible: typeof promoBannerUrl === 'string' && promoBannerUrl.length > 0
    };
  }
}

