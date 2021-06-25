import { Pipe, PipeTransform } from '@angular/core';
import Autolinker from 'autolinker';
@Pipe({
  name: 'autolinker'
})
export class Autolinkerjs implements PipeTransform {

  transform(value: any): any {
    // console.log('AUTOLINKER PIPE value ', value)
    var linkedText = Autolinker.link(value)
    return linkedText;
  }

}
