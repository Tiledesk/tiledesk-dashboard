import { Injectable } from '@angular/core';

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';

import { User } from '../models/user-model';

import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

interface NewUser {
  displayName: string;
  email: string;
  time: number;
}

@Injectable()
export class UsersService {

  orderBy_field: any;
  orderBy_direction: any;

  usersCollection: AngularFirestoreCollection<User>;
  userDocument: AngularFirestoreDocument<Node>;

  searchUserCollection: AngularFirestoreCollection<User>;

  constructor(
    private afs: AngularFirestore,
  ) {
    // this.usersCollection = this.afs.collection('users', (ref) => ref.orderBy('time', 'desc').limit(5));
    // this.searchUserCollection = this.afs.collection('users', (ref) => ref.where('displayName', '>=', 'B'));
  }

  /**
   * return an observable of ALL FIRESTORE 'users' * WITH * ID
   */
  getSnapshot(orderBy_field: any, orderBy_direction: any): Observable<User[]> {
    // ['added', 'modified', 'removed']

    this.orderBy_field = orderBy_field;
    this.orderBy_direction = orderBy_direction;

    this.usersCollection = this.afs.collection('users', (ref) => ref.orderBy(this.orderBy_field, this.orderBy_direction));
    console.log('Hello User Service!');
    console.log('COLLECTION ORDERED BY FIELD', this.orderBy_field);
    console.log('COLLECTION ORDERED BY DIRECTION', this.orderBy_direction);
    return this.usersCollection.snapshotChanges().map((actions) => {
      return actions.map((a) => {
        const data = a.payload.doc.data() as User;
        return { id: a.payload.doc.id, displayName: data.displayName, email: data.email, time: data.time };
      });
    });
  }

  searchUsers(searchParams: any) {
    this.searchUserCollection = this.afs.collection('users',
      (ref) => ref.where('displayName', '>=', `${searchParams}`));
    return this.searchUserCollection.snapshotChanges().map((actions) => {
      return actions.map((a) => {
        const data = a.payload.doc.data() as User;
        return { id: a.payload.doc.id, displayName: data.displayName, email: data.email, time: data.time };
      });
    });
  }


  // this.afs.collection('users');
  // getDataFilter(): Observable<User[]> {
  //   this.searchUserCollection = this.afs.collection('users', (ref) => ref.where('displayName', '>=', 'Kopolla' ));
  //   return this.searchUserCollection.valueChanges();
  // }

  getUser(id: string) {
    return this.afs.doc<User>(`users/${id}`);
  }

  deleteUser(id: string) {
    return this.getUser(id).delete();
  }
  /**
   * return an observable of ALL FIRESTORE CHAT-F21 'users' * WITHOUT * ID
   */
  getData(): Observable<User[]> {
    return this.usersCollection.valueChanges();
  }


  // displayName: string
  create(displayName: string, email: string) {
    const user = {
      displayName: `${displayName}`,
      email: `${email}`,
      time: new Date().getTime(),
    };
    return this.usersCollection.add(user);
    // return this.usersCollection.doc('PXmRJVrtzFAHsxjs7voD5R').set(user);
  }


}
