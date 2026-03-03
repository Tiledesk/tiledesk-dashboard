import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatColLabels' })
export class FormatColLabelsPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;

    // Regex che cattura [body_0], [header_0], [buttons_0], ecc.
    const regex = /\[(body|header|buttons)_\d+\]/g;

    return value.replace(regex, (match) => {
      return `<span class="csv-col-label">${match}</span>`;
    });
  }
}

