import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'sortBy' })

export class SortByPipe implements PipeTransform {

    transform(array: Array<string>, args: string): Array<string> {
        // console.log('// PIPE SORT BY - ARRAY: ', array)
        if (array) {
            array.sort((a: any, b: any) => {
                if (a[args] < b[args]) {
                    return -1;
                } else if (a[args] > b[args]) {
                    return 1;
                } else {
                    return 0;
                }
            });
            return array;
        }
    }
}

