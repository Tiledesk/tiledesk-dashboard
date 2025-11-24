import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatParamBadges' })
export class FormatParamBadgesPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;

    // Regex che cattura __PARAM_BADGE_X__ e lo sostituisce con il badge HTML
    const regex = /__PARAM_BADGE_(\d+)__/g;

    return value.replace(regex, (match, paramNumber) => {
      return `<span class="param-badge-preview">${paramNumber}</span>`;
    });
  }
}

