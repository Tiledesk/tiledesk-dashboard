import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import * as marked from 'marked';
import { BLOCKED_DOMAINS } from './utils/util';


@Pipe({
  name: 'marked'
})
export class MarkedPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) { }

  transform(value: any): any {
    if (!value || value.length === 0) return value;

    const renderer = new marked.Renderer();

    const isBlockedUrl = (urlStr: string): boolean => {
      try {
        const parsed = new URL(urlStr.startsWith('//') ? 'https:' + urlStr : urlStr);
        const hostname = parsed.hostname.toLowerCase();
        return BLOCKED_DOMAINS.some(bd => {
          const b = bd.toLowerCase();
          return hostname === b || hostname.endsWith('.' + b);
        });
      } catch {
        return false;
      }
    };

    // ✅ Renderer personalizzato per i link Markdown
    renderer.link = (href, title, text) => {
      const url = (href || '').trim().toLowerCase();
      // blocca schemi pericolosi o domini blacklistati
      if (!href || url.startsWith('javascript:') || url.startsWith('data:') || url.startsWith('vbscript:') || isBlockedUrl(href)) {
        return `<span>${text} 🔒</span>`; // testo semplice, non cliccabile
      }
      // link sicuro
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    };

    marked.setOptions({
      renderer: renderer,
      gfm: true,
      breaks: true,
    });

    // se il contenuto è JSON, sanitizza ricorsivamente i campi stringa
    const sanitizeJsonString = (input: string): string => {
      try {
        const obj = JSON.parse(input);
        const traverse = (val: any): any => {
          if (typeof val === 'string') return val;
          if (Array.isArray(val)) return val.map(traverse);
          if (typeof val === 'object' && val !== null) {
            const out: any = {};
            Object.keys(val).forEach(k => {
              if (k === 'text' && typeof val[k] === 'string') {
                // usa marked per il rendering sicuro
                out[k] = marked.parse(val[k]);
              } else if (k === 'metadata' && val[k]?.src) {
                out[k] = { ...val[k] };
                if (isBlockedUrl(val[k].src)) out[k].src = val[k].name || '🔒';
              } else {
                out[k] = traverse(val[k]);
              }
            });
            return out;
          }
          return val;
        };
        const sanitizedObj = traverse(obj);
        return JSON.stringify(sanitizedObj);
      } catch {
        return value; // non JSON → ritorna valore originale
      }
    };

    // rileva se è JSON, altrimenti renderizza come testo normale
    const trimmed = value.trim();
    const content = (trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))
      ? sanitizeJsonString(value)
      : marked.parse(value);

    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
}
