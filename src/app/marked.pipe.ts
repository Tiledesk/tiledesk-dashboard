import { Pipe, PipeTransform } from '@angular/core';
import * as marked from 'marked';
@Pipe({
  name: 'marked'
})
export class MarkedPipe implements PipeTransform {

  transform(value: any): any {
    // console.log('MARKED PIPE value ', value)
    const renderer = new marked.Renderer();
    renderer.link = function(href, title, text) {
      // console.log('MARKED PIPE renderer.link text ', text) 
      // console.log('MARKED PIPE renderer.link href ', href) 
        const link = marked.Renderer.prototype.link.call(this, href, title, text);
        return link.replace('<a', '<a target="_blank" ');
    };
    marked.setOptions({
        renderer: renderer
    });
    if (value && value.length > 0) {
      const text = marked(value);
      // console.log('MARKED PIPE value 2', text)
      return text;
    }
    return value;
  }

  // transform(link: string): string {
  //   return this.linkify(link);
  // }

  // private linkify(plainText): string{
  //   let replacedText;
  //   let replacePattern1;
  //   let replacePattern2;
  //   let replacePattern3;

  //   //URLs starting with http://, https://, or ftp://
  //   replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
  //   replacedText = plainText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

  //   //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
  //   replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
  //   replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

  //   //Change email addresses to mailto:: links.
  //   replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
  //   replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

  //   return replacedText;
  //  }
}
