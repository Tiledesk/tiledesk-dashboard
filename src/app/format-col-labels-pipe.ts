import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'formatColLabels' })
export class FormatColLabelsPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: any): any {
    if (!value) return value;

    // Se è un SafeHtml, estrai il valore stringa
    let stringValue: string;
    if (value && typeof value === 'object' && 'changingThisBreaksApplicationSecurity' in value) {
      // È un SafeHtml, estrai il valore stringa
      stringValue = (value as any).changingThisBreaksApplicationSecurity || '';
    } else {
      // Converti il valore in stringa se non lo è già
      stringValue = String(value);
    }

    // Regex che cattura [body_0], [header_0], [buttons_0], ecc.
    const regex = /\[(body|header|buttons)_\d+\]/g;

    const result = stringValue.replace(regex, (match) => {
      return `<span class="csv-col-label">${match}</span>`;
    });

    // Se il valore originale era un SafeHtml, restituisci un SafeHtml
    if (value && typeof value === 'object' && 'changingThisBreaksApplicationSecurity' in value) {
      return this.sanitizer.bypassSecurityTrustHtml(result);
    }

    return result;
  }
}

