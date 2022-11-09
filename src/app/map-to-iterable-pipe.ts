import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'mapToIterable'})

export class MapToIterable implements PipeTransform {
    
    transform(dict: Object) {
        return Object.keys(dict).map(key => ({ key, val: dict[key] }));
    }
}