// tslint:disable:max-line-length
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';

import { Request } from '../models/request-model';
import { Message } from '../models/message-model';

import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

@Injectable()
export class RequestsService {

  requestsCollection: AngularFirestoreCollection<Request>;
  userDocument: AngularFirestoreDocument<Node>;

  messageCollection: AngularFirestoreCollection<Message>;

  constructor(
    private afs: AngularFirestore,
  ) {
    console.log('Hello Request Service!');
  }

  /**
   * CONVERSATION return an observable of ALL FIRESTORE  'conversation' * WITH * ID
   */
  getSnapshot(): Observable<Request[]> {
    // ['added', 'modified', 'removed']

    this.requestsCollection = this.afs.collection('conversations', (ref) => ref.orderBy('timestamp', 'desc'));

    return this.requestsCollection.snapshotChanges().map((actions) => {
      return actions.map((a) => {
        const data = a.payload.doc.data() as Request;
        return { id: a.payload.doc.id, recipient: data.recipient, recipient_fullname: data.recipient_fullname, sender_fullname: data.sender_fullname, text: data.text, timestamp: data.timestamp, membersCount: data.membersCount};
      });
    });
  }

  /**
   * MESSAGES return an observable of ALL FIRESTORE  'message' * WITH * ID
   */
  getSnapshotMsg(recipient: string): Observable<Message[]> {
    // ['added', 'modified', 'removed']
    // .orderBy('timestamp', 'desc')
    this.messageCollection = this.afs.collection('messages',
    (ref) => ref.where('recipient', '==', `${recipient}`).orderBy('timestamp', 'asc') );
    return this.messageCollection.snapshotChanges().map((actions) => {
      return actions.map((a) => {
        const data = a.payload.doc.data() as Message;
        return { id: a.payload.doc.id, recipient: data.recipient, recipient_fullname: data.recipient_fullname, sender_fullname: data.sender_fullname, text: data.text, timestamp: data.timestamp};
      });
    });
  }

}
