import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'htmlTag' })
export class HtmlTagPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;
    return `<${value}>`;
  }
}
