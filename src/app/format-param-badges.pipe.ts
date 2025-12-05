import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'formatParamBadges' })
export class FormatParamBadgesPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): SafeHtml {
    if (!value) return this.sanitizer.bypassSecurityTrustHtml(value || '');

    // Regex che cattura [PARAM_BADGE_X] e lo sostituisce con il badge HTML
    // Usiamo [PARAM_BADGE_X] invece di __PARAM_BADGE_X__ per evitare conflitti con markdown (__ è grassetto)
    const regex = /\[PARAM_BADGE_(\d+)\]/g;

    const result = value.replace(regex, (match, paramNumber) => {
      return `<span class="param-badge-preview">${paramNumber}</span>`;
    });

    return this.sanitizer.bypassSecurityTrustHtml(result);
  }
}

