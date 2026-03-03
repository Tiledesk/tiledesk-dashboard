import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
// import * as marked from 'marked';
// import { marked } from 'marked';
import { marked } from 'marked';
import { BLOCKED_DOMAINS } from './utils/util';
@Pipe({
  name: 'marked'
})
export class MarkedPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) { }


  transform(value: any): any {
    // console.log('MARKED PIPE value ', value)
    if (!value || value.length === 0) return value;
    const renderer = new marked.Renderer();

    // renderer.heading = (text, level) => {
    //   const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
    //   return `<h${level} id="${escapedText}">${text}</h${level}>`;
    // };  

    //  // ✅ Renderer per blockquote (assicurati che funzioni)
    // renderer.blockquote = (quote) => {
    //   return `<blockquote>${quote}</blockquote>`;
    // };

    // // ✅ Renderer per heading (assicurati che funzioni)
    // renderer.heading = (text, level) => {
    //   return `<h${level}>${text}</h${level}>`;
    // };
    
    
    renderer.link = (href, title, text) => {
      // console.log('MARKED PIPE renderer.link text ', text) 
      // console.log('MARKED PIPE renderer.link href ', href) 

      // const safeHref = this.validateUrl(href);
      const safeHref = href || '#';
      // const link = marked.Renderer.prototype.link.call(renderer, href, title, text);
      // return link.replace('<a', '<a target="_blank" rel="noopener noreferrer" ');
      return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    };

    marked.setOptions({
      renderer: renderer,
      gfm: true,
      breaks: true,
      mangle: false,
      headerIds: false,
    });

  
    // if (value && value.length > 0) {
      const cleanValue = this.cleanInput(value);
      const text = marked.parse(cleanValue);
      // console.log('MARKED PIPE value 2', text)
      // PROTEZIONE XSS: Sanificazione Angular
      return this.sanitizer.bypassSecurityTrustHtml(text);

    // }
    // return value;
  }

  private cleanInput(input: string): string {
    if (!input) return '';

    let cleaned = input;
    // console.log('MARKED PIPE cleaned ', cleaned)
    BLOCKED_DOMAINS.forEach(domain => {
    const escapedDomain = domain.replace(/\./g, '\\.');
    
    // Pattern che copre TUTTI i casi
    const comprehensivePattern = new RegExp(
      `(\\[([^\\]]*)\\]\\([^)]*(?:https?://)?(?:www\\.)?${escapedDomain}(?:/[^)]*)?\\))|((?:https?://)?(?:www\\.)?${escapedDomain}(?:/\\S*)?)`,
      'gi'
    );
    
    cleaned = cleaned.replace(comprehensivePattern, (match, p1, p2, p3) => {
      // Se è un link markdown [text](url), mantieni il testo
      if (p2) return `${p2} 🔒`;
      // Se è un URL diretto, sostituisci con dominio + 🔒
      if (p3) return `${domain} 🔒`;
      return match;
      });
   
    });


    // Pattern che sostituisce i link pericolosi con solo il testo
    const dangerousLinkPatterns = [
      // Sostituisce [text](javascript:...) con "text"
      /\[([^\]]*)\]\(javascript:[^)]*\)/gi,
      /\[([^\]]*)\]\(data:[^)]*\)/gi,
      /\[([^\]]*)\]\(vbscript:[^)]*\)/gi,
      /\[([^\]]*)\]\([^)]*alert\([^)]*\)/gi
    ];

    dangerousLinkPatterns.forEach(pattern => {
      // console.log('Marked pipe here yes ')
      cleaned = cleaned.replace(pattern, '$1'); // $1 = il testo del link
    });

    // Pattern generali per sicurezza (rimuovono completamente)
    const generalPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<script[^>]*>[\s\S]*?<\/script>/gi, // Script multi-linea
      /<script[^>]*>.*?<\/script>/gi, // Script single-line
      /<script[^>]*>/gi, // Solo tag di apertura
      /<\/script>/gi, // Solo tag di chiusura
      /javascript:/gi,
      /vbscript:/gi,
      /data:/gi,
      /on\w+\s*=/gi,
      /alert\(/gi,
      /eval\(/gi,
      /document\./gi,
      /window\./gi,
      /\(function\s*\(\)\s*\{/gi,
      /\.appendChild\(/gi,
      /\.createElement\(/gi,
      /\.getElementsByTagName\(/gi,
    
      // ✅ PATTERN PER FUNZIONI IIFE (Immediately Invoked Function Expression):
      /\(function\s*\(\s*\)\s*\{[\s\S]*?\}\)\(\s*\)\s*;/gi,
      /\(function\s*\(\)\s*\{/gi
    ];

    generalPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });

    return cleaned;
  }

  private quickClean(input: string): string {
  if (!input) return '';

  // 1) rimuove script tag (multiline, case-insensitive)
  let s = input.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');

  // 2) rimuove iframe/object/embed
  s = s.replace(/<(iframe|object|embed)[\s\S]*?>[\s\S]*?<\/\1>/gi, '');

  // 3) rimuove attributi onX= e javascript: in href/src
  s = s.replace(/\son\w+\s*=\s*(['"])[\s\S]*?\1/gi, ''); // on*
  s = s.replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, ''); // href="javascript:..."
  s = s.replace(/\s(href|src)\s*=\s*(['"])\s*data:[\s\S]*?\2/gi, ''); // data:
  
  // 4) rimuove tag <style> se vuoi
  s = s.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');

  return s;
}
}
