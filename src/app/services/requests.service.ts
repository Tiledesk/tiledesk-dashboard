// tslint:disable:max-line-length
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';

import { Request } from '../models/request-model';

import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

@Injectable()
export class RequestsService {

  requestsCollection: AngularFirestoreCollection<Request>;
  userDocument: AngularFirestoreDocument<Node>;

  constructor(
    private afs: AngularFirestore,
  ) {
    console.log('Hello Request Service!');
  }

  /**
   * return an observable of ALL FIRESTORE CHAT-F21 'users' * WITH * ID
   */
  getSnapshot(): Observable<Request[]> {
    // ['added', 'modified', 'removed']

    this.requestsCollection = this.afs.collection('conversations', (ref) => ref.orderBy('timestamp', 'desc'));

    return this.requestsCollection.snapshotChanges().map((actions) => {
      return actions.map((a) => {
        const data = a.payload.doc.data() as Request;
        return { id: a.payload.doc.id, recipient: data.recipient, recipient_fullname: data.recipient_fullname, sender_fullname: data.sender_fullname, text: data.text, timestamp: data.timestamp};
      });
    });
  }

}
