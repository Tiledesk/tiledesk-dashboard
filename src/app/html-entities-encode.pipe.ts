import { Pipe, PipeTransform } from '@angular/core';
import { htmlEntities, replaceEndOfLine } from './utils/util';

@Pipe({
  name: 'htmlEntitiesEncode'
})
export class HtmlEntitiesEncodePipe implements PipeTransform {

  transform(text: any, args?: any): any {

    // console.log('htmlEntitiesEncode text ', text)
    // if (this.isAnchor(text)) {
    //   console.log('htmlEntitiesEncode here yes ', text)
    //   return
    // }
    text = htmlEntities(text);
    text = replaceEndOfLine(text);
    text = text.trim();

    return text;
  }

  // isAnchor(str){
  //   return /^\<a.*\>.*\<\/a\>/i.test(str);
  // }

}
