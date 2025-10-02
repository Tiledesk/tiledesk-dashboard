import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
// import * as marked from 'marked';
// import { marked } from 'marked';
import { marked } from 'marked';
@Pipe({
  name: 'marked'
})
export class MarkedPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) { }


  transform(value: any): any {
    // console.log('MARKED PIPE value ', value)
    const renderer = new marked.Renderer();

    renderer.heading = (text, level) => {
      const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
      return `<h${level} id="${escapedText}">${text}</h${level}>`;
    };  
    
    renderer.link = (href, title, text) => {
      // console.log('MARKED PIPE renderer.link text ', text) 
      // console.log('MARKED PIPE renderer.link href ', href) 

      // const safeHref = this.validateUrl(href);

      const link = marked.Renderer.prototype.link.call(renderer, href, title, text);
      return link.replace('<a', '<a target="_blank" rel="noopener noreferrer" ');
    };

    marked.setOptions({
      renderer,
      gfm: true,
      breaks: true,
    });

    if (value && value.length > 0) {
      const cleanValue = this.cleanInput(value);

      const text = marked(cleanValue);
      // console.log('MARKED PIPE value 2', text)
      // PROTEZIONE XSS: Sanificazione Angular
      return this.sanitizer.bypassSecurityTrustHtml(text);

    }
    return value;
  }

  private cleanInput(input: string): string {
    if (!input) return '';

    let cleaned = input;

    // Pattern che sostituisce i link pericolosi con solo il testo
    const dangerousLinkPatterns = [
      // Sostituisce [text](javascript:...) con "text"
      /\[([^\]]*)\]\(javascript:[^)]*\)/gi,
      /\[([^\]]*)\]\(data:[^)]*\)/gi,
      /\[([^\]]*)\]\(vbscript:[^)]*\)/gi,
      /\[([^\]]*)\]\([^)]*alert\([^)]*\)/gi
    ];

    dangerousLinkPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '$1'); // $1 = il testo del link
    });

    // Pattern generali per sicurezza (rimuovono completamente)
    const generalPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /data:/gi,
      /on\w+\s*=/gi,
      /alert\(/gi,
      /eval\(/gi,
      /document\./gi,
      /window\./gi
    ];

    generalPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });

    return cleaned;
  }
}
