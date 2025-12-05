import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'waToMarkdown' })
export class WaToMarkdownPipe implements PipeTransform {
  transform(text?: string): string {
    if (!text) return '';
    // ~strike~ -> ~~strike~~ (Markdown)
    let s = text.replace(/~([^~\n]+)~/g, '~~$1~~');
    // opzionale: forza il line break di markdown
    s = s.replace(/\r?\n/g, '  \n');
    return s;
  }
}