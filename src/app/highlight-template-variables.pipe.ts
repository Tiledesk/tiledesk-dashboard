import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'highlightTemplateVariables' })
export class HighlightTemplateVariablesPipe implements PipeTransform {
  transform(value: string, bodyParamsValues: string[]): string {
    if (!value || !bodyParamsValues || bodyParamsValues.length === 0) return value;

    // Cerca i marker temporanei inseriti nel componente e sostituiscili con span evidenziati
    let result = value;
    
    // Processa i marker in ordine inverso per evitare problemi con sostituzioni multiple
    for (let i = bodyParamsValues.length - 1; i >= 0; i--) {
      // Cerca il marker testuale __TEMPLATE_VAR_${i}__...__TEMPLATE_VAR_${i}__
      // Il marker può essere presente nel testo HTML già processato dal markdown
      const markerStart = `__TEMPLATE_VAR_${i}__`;
      const markerEnd = `__TEMPLATE_VAR_${i}__`;
      // Usa una regex non-greedy che cattura tutto tra i marker, anche se contiene underscore
      // Il pattern cerca il marker di inizio, poi cattura tutto fino al marker di fine
      const markerRegex = new RegExp(`${this.escapeRegex(markerStart)}(.*?)${this.escapeRegex(markerEnd)}`, 'gs');
      
      result = result.replace(markerRegex, (match, content) => {
        // Sostituisce il marker con lo span evidenziato
        return `<span class="template-variable-highlight">${content}</span>`;
      });
    }
    
    return result;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

