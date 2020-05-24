
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
                console.log('PIPE SELECT OPTION TRANSLATED text ',text)
            });


            // item.name = this.translate.instant(item.name);
            // console.log('PIPE SELECT OPTION TRANSLATE ITEM ',item.name)
            
        }
        console.log('PIPE SELECT OPTION TRANSLATE ITEMS ',items)
        return items;
    }

    // const observable = Observable.create((observer: Observer<any>) => {
    //     // this.authObserver = observer;
    //     console.log('PIPE authObserver created!')
    //   });
    //   observable.subscribe()

    // transform(items: any) {    
       
        
    //     const observable = Observable.create((observer: Observer<any>) => {

    //         console.log('PIPE SELECT OPTION TRANSLATE items 2',items)

    //         for(let item of items) {
    //         this.translate.get(item.name).subscribe(result => {            
    //             // result will be an object
    //             // e.g. { 'JOBS.UX': 'UX Designer', 'JOBS.DEVELOPER': 'Developer' }
    //               console.log('PIPE SELECT OPTION TRANSLATE result ',result)
    //             observer.next(result);
    //         });        
    //     }
         
    //     });
    //     observable.subscribe(result => {  

    //         console.log('PIPE SELECT OPTION TRANSLATE result 2 ',result)
    //      })
    //     // console.log('PIPE SELECT OPTION TRANSLATE observables ',observable)
    //     // return observable;
    //   }
    
     
}