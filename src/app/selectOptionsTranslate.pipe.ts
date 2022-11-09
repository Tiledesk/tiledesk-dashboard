
import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Observer } from 'rxjs';


@Pipe({name: 'selectOptionsTranslate'})

export class SelectOptionsTranslatePipe implements PipeTransform {
  
    constructor(public translate: TranslateService){}

    transform(items: Array<any>)  {
        for(let item of items) {
           
            
            // console.log('PIPE SELECT OPTION TRANSLATED translated ',translated)

            this.translate.get(item.name)
            .subscribe((text: any) => {
                
                item.name = text
                // console.log('PIPE SELECT OPTION TRANSLATED text ',text)
            });


            // item.name = this.translate.instant(item.name);
            // console.log('PIPE SELECT OPTION TRANSLATE ITEM ',item.name)
            
        }
        // console.log('PIPE SELECT OPTION TRANSLATE ITEMS ',items)
        return items;
    }

  
    
     
}