import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sortByDes' })

export class SortByDesPipe implements PipeTransform {

    transform(array: Array<string>, args: string): Array<string> {
        // console.log('// PIPE SORT BY - ARRAY: ', array)
        array.sort((a: any, b: any) => {
            if (a[args] > b[args]) {
                return -1;
            } else if (a[args] < b[args]) {
                return 1;
            } else {
                return 0;
            }
        });
        return array;
    }
}
