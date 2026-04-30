import { Pipe, PipeTransform } from '@angular/core';

/**
 * Wraps an HTML tag name with angle brackets so that lists of tag names
 * (e.g. `body`, `main`, `article`) render as `<body>`, `<main>`, etc. in
 * the UI without forcing every consumer to template the brackets inline.
 *
 * Used by the scrape-settings/scrape-summary chips for `extract_tags` and
 * `unwanted_tags`. NOT meant for `unwanted_classnames`, which are CSS class
 * names and must render as-is.
 */
@Pipe({ name: 'htmlTag' })
export class HtmlTagPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) {
      return value;
    }
    return `<${value}>`;
  }
}
