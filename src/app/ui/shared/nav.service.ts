import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Request } from '../../models/request-model';


@Injectable()
export class NavService {
    

    constructor(
       
      ) {}

  // GET THE COUNT OF UNSERVED REQUEST TO SHOW IN THE NAVBAR NOTIFICATIONS
  // getCountUnservedRequest(): Observable<number> {
  //   // ['added', 'modified', 'removed']
  //   this.requestsCollection = this.afs.collection('conversations', (ref) => ref.where('support_status', '<=', 100) );

  //   return this.requestsCollection.valueChanges().map((values) => {
  //     return values.length;
  //   });
  // }

}
