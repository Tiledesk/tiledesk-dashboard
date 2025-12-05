import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatPhone' })
export class FormatPhonePipe implements PipeTransform {

  transform(phone: string, format: string = 'international'): string {
    if (!phone) {
      return '';
    }

    // Rimuove tutti i caratteri non numerici tranne il +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // Se il numero inizia con +, mantieni il prefisso internazionale
    const hasPlus = cleaned.startsWith('+');
    if (hasPlus) {
      cleaned = cleaned.substring(1); // Rimuove il + temporaneamente
    }

    // Rimuove eventuali zeri iniziali non necessari
    cleaned = cleaned.replace(/^0+/, '');

    switch (format) {
      case 'international':
        // Formato: +39 123 456 7890
        if (hasPlus && cleaned.length > 0) {
          const countryCode = cleaned.substring(0, 2);
          const rest = cleaned.substring(2);
          return this.formatWithSpaces(`+${countryCode}`, rest);
        } else if (cleaned.length >= 10) {
          // Assumendo formato italiano se non c'è il +
          return this.formatWithSpaces('+39', cleaned);
        }
        return phone;

      case 'national':
        // Formato: 123 456 7890 (senza prefisso internazionale)
        if (hasPlus && cleaned.length > 2) {
          cleaned = cleaned.substring(2); // Rimuove il prefisso paese
        }
        return this.formatWithSpaces('', cleaned);

      case 'spaces':
        // Formato: 123 456 7890 (con spazi ogni 3 cifre)
        return this.formatWithSpaces('', cleaned);

      case 'dashes':
        // Formato: 123-456-7890
        return this.formatWithDashes(cleaned);

      case 'dots':
        // Formato: 123.456.7890
        return this.formatWithDots(cleaned);

      case 'parentheses':
        // Formato: (123) 456-7890 (stile USA)
        if (cleaned.length >= 10) {
          const area = cleaned.substring(0, 3);
          const first = cleaned.substring(3, 6);
          const second = cleaned.substring(6);
          return `(${area}) ${first}-${second}`;
        }
        return phone;

      default:
        return phone;
    }
  }

  private formatWithSpaces(prefix: string, number: string): string {
    if (!number) return prefix;
    
    // Formatta a gruppi di 3 cifre
    const formatted = number.match(/.{1,3}/g)?.join(' ') || number;
    return prefix ? `${prefix} ${formatted}` : formatted;
  }

  private formatWithDashes(number: string): string {
    if (number.length <= 3) return number;
    if (number.length <= 6) {
      return `${number.substring(0, 3)}-${number.substring(3)}`;
    }
    return `${number.substring(0, 3)}-${number.substring(3, 6)}-${number.substring(6)}`;
  }

  private formatWithDots(number: string): string {
    if (number.length <= 3) return number;
    if (number.length <= 6) {
      return `${number.substring(0, 3)}.${number.substring(3)}`;
    }
    return `${number.substring(0, 3)}.${number.substring(3, 6)}.${number.substring(6)}`;
  }
}

