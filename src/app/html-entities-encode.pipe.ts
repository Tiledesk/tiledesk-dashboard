import { Pipe, PipeTransform } from '@angular/core';
import { htmlEntities, replaceEndOfLine } from './utils/util';

@Pipe({
  name: 'htmlEntitiesEncode'
})
export class HtmlEntitiesEncodePipe implements PipeTransform {

  transform(text: any, args?: any): any {

    // console.log('htmlEntitiesEncode text ', text)
    // if (text.indexOf("href") === -1 && text.indexOf("</a>") === -1) {
    //   text = htmlEntities(text);
    // }
    text = htmlEntities(text);
    text = replaceEndOfLine(text);
    text = text.trim();

    return text;
  }

}
