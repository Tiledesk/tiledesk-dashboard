import { of } from 'rxjs';

export class TranslateServiceStub {
  getBrowserLang(): string {
    return 'en';
  }

  get(key: string | string[], _interpolateParams?: any) {
    // Restituisce la chiave come valore (comportamento identico a TranslateModule in test)
    const value = Array.isArray(key) ? key[0] : key;
    return of(value);
  }

  instant(key: string): string {
    return key;
  }
}
