import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filterArray' })

export class FilterArrayPipe implements PipeTransform {

    transform(array: any, query?: any): any {

        // console.log('PIPE filterArray array ', array);
        // console.log('PIPE filterArray args ', query);
        if (!array) return null;
        if (!query) return array;


        //  USED TO FILTER SYSTEM TRIGGERS (type = 'internal') AND CUSTOM TRIGGERS (in these there is no the property "type" ) 
        if (array && query === 'internal') {

            return array.filter((item: any) => item.type === query)
        }

        if (array && query === 'custom') {

            return array.filter((item: any) => !item.type)
        }
    
    }
}
