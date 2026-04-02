import { Injectable } from '@angular/core';
import { AppConfigService } from 'app/services/app-config.service';

/**
 * Flag supportati nella chiave OSCODE.
 * Formato chiave: "PAY:T-ANA:F-APP:T-..." dove T=abilitato, F=disabilitato.
 * Se un flag è assente nella chiave, il valore di default è false.
 */
export type OscodeFlag = 'PAY' | 'ANA' | 'APP' | 'OPH' | 'HPB' | 'PPB' | 'KNB' | 'QIN';

export interface FeatureFlags {
  PAY: boolean;  // Pagamenti / upgrade plan
  ANA: boolean;  // Analytics
  APP: boolean;  // App store / integrazioni
  OPH: boolean;  // Operating hours
  HPB: boolean;  // Home promo banner
  PPB: boolean;  // Project plan badge
  KNB: boolean;  // Knowledge bases
  QIN: boolean;  // Quota indicators
}

@Injectable({
  providedIn: 'root'
})
export class FeatureToggleService {

  private flags: FeatureFlags;

  constructor(private appConfigService: AppConfigService) {
    this.flags = this.parseOscode(this.getKey());
  }

  /**
   * Restituisce il valore di un singolo flag.
   * Fallback a false se il flag non è riconosciuto.
   */
  getFlag(flag: OscodeFlag): boolean {
    return this.flags[flag] ?? false;
  }

  /**
   * Restituisce una copia di tutti i flag.
   */
  getFlags(): FeatureFlags {
    return { ...this.flags };
  }

  // ─── Getters convenienti (evitano il getFlag() generico in template semplici) ───

  get isVisiblePay(): boolean        { return this.flags.PAY; }
  get isVisibleANA(): boolean        { return this.flags.ANA; }
  get isVisibleAPP(): boolean        { return this.flags.APP; }
  get isVisibleOPH(): boolean        { return this.flags.OPH; }
  get isVisibleHomeBanner(): boolean { return this.flags.HPB; }
  get projectPlanBadge(): boolean    { return this.flags.PPB; }
  get isVisibleKNB(): boolean        { return this.flags.KNB; }
  get isVisibleQIN(): boolean        { return this.flags.QIN; }

  // ─── Logica di parsing ──────────────────────────────────────────────────────

  private getKey(): string {
    return this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK || '';
  }

  /**
   * Decodifica una stringa OSCODE del formato "PAY:T-ANA:F-KNB:T-..."
   * e restituisce un oggetto FeatureFlags.
   *
   * Regole:
   * - Se il segmento KEY:T è presente → flag = true
   * - Se il segmento KEY:F è presente → flag = false
   * - Se il segmento è assente → flag = false (default sicuro)
   */
  parseOscode(key: string): FeatureFlags {
    const defaults: FeatureFlags = {
      PAY: false,
      ANA: false,
      APP: false,
      OPH: false,
      HPB: false,
      PPB: false,
      KNB: false,
      QIN: false,
    };

    if (!key) { return defaults; }

    const segments = key.split('-');

    segments.forEach(segment => {
      const [flagName, value] = segment.split(':');
      const flag = flagName as OscodeFlag;
      if (flag in defaults) {
        defaults[flag] = value !== 'F';
      }
    });

    return defaults;
  }
}
