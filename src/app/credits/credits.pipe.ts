import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Credits with the separators of the dashboard language: 4997.43 -> "4.997,43" (it), "4,997.43" (en).
 * The server keeps 4 decimals; `digits` shown, 2 by default.
 */
@Pipe({
  name: 'credits',
  standalone: true
})
export class CreditsPipe implements PipeTransform {

  constructor(private translate: TranslateService) { }

  transform(value: number | null | undefined, digits = 2): string {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return '-';
    }
    const lang = this.translate.currentLang || this.translate.defaultLang || 'en';
    try {
      return new Intl.NumberFormat(lang, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(Number(value));
    } catch (err) {
      return Number(value).toFixed(digits);
    }
  }
}
