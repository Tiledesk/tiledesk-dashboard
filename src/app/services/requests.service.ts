// tslint:disable:max-line-length
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';

import { Request } from '../models/request-model';
import { Message } from '../models/message-model';

import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { environment } from '../../environments/environment';

import * as firebase from 'firebase/app';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Query } from '@angular/core/src/metadata/di';
import { QuerySnapshot, DocumentChange, DocumentSnapshot } from '@firebase/firestore-types';
import { observeOn } from 'rxjs/operators/observeOn';
import { members_as_html } from '../utils/util';



@Injectable()
export class RequestsService {

  requestsCollection: AngularFirestoreCollection<Request>;
  userDocument: AngularFirestoreDocument<Node>;

  messageCollection: AngularFirestoreCollection<Message>;

  http: Http;
  CHAT21_CLOUD_FUNCTIONS_BASE_URL = environment.cloudFunctions.cloud_functions_base_url;
  // FIREBASE_ID_TOKEN = environment.cloudFunctions.firebase_IdToken;
  FIREBASE_ID_TOKEN: any;

  user: any;
  currentUserFireBaseUID: string;
  unservedRequest: any;

  requestList: Request[] = [];

  // public mySubject: BehaviorSubject<any> = new BehaviorSubject<any[]>(null);
  public mySubject: BehaviorSubject<any> = new BehaviorSubject<any[]>(null);

  public requestsList_bs: BehaviorSubject<Request[]> = new BehaviorSubject<Request[]>([]);

  constructor(
    http: Http,
    private afs: AngularFirestore,

  ) {
    this.http = http;
    console.log('Hello Request Service!');

    /* CORRENTLY MANAGED IN REQUEST-LIST.COMPONENT */
    // this.user = firebase.auth().currentUser;
    // console.log('REQUEST SERVICE LOGGED USER ', this.user);
    // if (this.user) {
    //   this.currentUserFireBaseUID = this.user.uid
    //   console.log('FIREBASE SIGNED IN USER UID ', this.currentUserFireBaseUID);
    //   this.getToken();
    // } else {
    //   console.log('No user is signed in');
    // }
  }

  // getToken() {
  //   const that = this;
  //   console.log('Notification permission granted.');
  //   firebase.auth().currentUser.getIdToken(/* forceRefresh */ true)
  //     .then(function (idToken) {
  //       that.FIREBASE_ID_TOKEN = idToken;
  //       console.log('idToken.', idToken);
  //     }).catch(function (error) {
  //       // Handle error
  //       console.log('idToken.', error);
  //     });
  // }

  //  TSTS
  // .where('state', '==', 'CA')
  // : Observable<Request[]> {


  // getConversationsSnapshot(): Observable<QuerySnapshot> {
  //   console.log('GET TEST  ')
  //   // tslint:disable-next-line:no-debugger
  //   // debugger
  //   const db = firebase.firestore();
  //   const query = db.collection('conversations').where('support_status', '<', 1000).orderBy('support_status').orderBy('timestamp', 'desc');
  //   return Observable.create(query.onSnapshot.bind(query));
  //   // .onSnapshot.bind {
  //   // return observable


  //   // snapshot.docChanges.forEach(function (change) {
  //   //   // if (change.type === 'added') {
  //   //   console.log(' +++ ++++ New city: ', change.doc.data());
  //   //   // }
  //   // });

  // }
  startRequestsQuery() {
    console.log('startRequestsQuery()')
    this.getRequests().subscribe((requests: Request[]) => {
      requests.forEach((r: Request) => {
        this.addOrUpdateRequestsList(r);
      });
      this.requestsList_bs.next(this.requestList);
    },
      error => { },
      () => {
        console.log('GET REQUEST COMPLETE')
      });
  }

  addOrUpdateRequestsList(r: Request) {
    // console.log('ID REQUEST  ', r.recipient)
    for (let i = 0; i < this.requestList.length; i++) {
      if (r.recipient === this.requestList[i].recipient) {
        this.requestList[i] = r;
        this.reorderRequests()
        return;
      }
      // console.log('REQUEST RECIPIENT ', this.requestList[i].recipient)
    }
    this.requestList.push(r);
    this.reorderRequests()
  }

  reorderRequests() {
    this.requestList.sort(function compare(a: Request, b: Request) {
      if (a.timestamp > b.timestamp) {
        return -1;
      }
      if (a.timestamp < b.timestamp) {
        return 1;
      }
      return 0;
    });
  }

  getRequests(): Observable<Request[]> {
    const db = firebase.firestore();
    const query = db.collection('conversations')
      .where('support_status', '<', 1000)
      .orderBy('support_status')
      .orderBy('timestamp', 'desc');
    // const observer = Observable.create(query.onSnapshot.bind(query));
    const observable = new Observable<Request[]>(observer => {
      query.onSnapshot(snapshot => {
        const requestListReturned: Request[] = snapshot.docChanges.map((c: DocumentChange) => {
          // const requestListReturned: Request[] = snapshot.docs.map((c: DocumentSnapshot) => {
          const r: Request = {};
          const data = c.doc.data()
          // const data = c.data()
          r.id = data.recipient;
          r.recipient_fullname = data.recipient_fullname;
          r.recipient = data.recipient;
          r.sender_fullname = data.sender_fullname
          r.text = data.text
          r.first_text = data.first_text
          r.timestamp = data.timestamp
          r.membersCount = data.membersCount
          r.support_status = data.support_status
          r.members = data.members
          r.members_as_string = members_as_html(data.members, data.requester_id, firebase.auth().currentUser.uid)
          r.requester_fullname = data.requester_fullname
          r.requester_id = data.requester_id
          return r;
        });
        observer.next(requestListReturned);
        // console.log('requestListReturned', requestListReturned)
      });
    });
    return observable;
  }
  // TEST

  /**
   * CONVERSATION (ALIAS REQUESTS - IN THE VIEW IS VISITORS)return an observable of ALL FIRESTORE  'conversation' * WITH * ID
   */
  getSnapshotConversations(): Observable<Request[]> {

    // ['added', 'modified', 'removed']

    this.requestsCollection = this.afs.collection('conversations',
      (ref) => ref.where('support_status', '<', 1000).orderBy('support_status').orderBy('timestamp', 'desc'));
    // .orderBy('support_status', 'desc').orderBy('timestamp', 'desc')

    return this.requestsCollection.snapshotChanges().map((actions) => {
      // return this.requestsCollection.stateChanges().map((actions) => {
      return actions.map((a) => {
        const data = a.payload.doc.data() as Request;
        return {
          id: a.payload.doc.id,
          recipient: data.recipient,
          recipient_fullname: data.recipient_fullname,
          sender_fullname: data.sender_fullname,
          text: data.text,
          first_text: data.first_text,
          timestamp: data.timestamp,
          membersCount: data.membersCount,
          support_status: data.support_status,
          members: data.members,
          requester_fullname: data.requester_fullname,
          requester_id: data.requester_id
        };
      });
    });
  }

  /**
   * HISTORY OF CONVERSATION (ALIAS REQUESTS - IN THE VIEW IS VISITORS)return an observable of ALL FIRESTORE  'conversation' * WITH * ID
   */
  getSnapshotHistoryOfConversations(): Observable<Request[]> {
    // ['added', 'modified', 'removed']

    this.requestsCollection = this.afs.collection('conversations',
      (ref) => ref.where('support_status', '>=', 1000).orderBy('support_status').orderBy('timestamp', 'desc'));
    // .orderBy('support_status', 'desc').orderBy('timestamp', 'desc')

    return this.requestsCollection.snapshotChanges().map((actions) => {
      return actions.map((a) => {
        const data = a.payload.doc.data() as Request;
        return {
          id: a.payload.doc.id,
          recipient: data.recipient,
          recipient_fullname: data.recipient_fullname,
          sender_fullname: data.sender_fullname,
          text: data.text, timestamp: data.timestamp,
          first_text: data.first_text,
          membersCount: data.membersCount,
          support_status: data.support_status,
          members: data.members,
          requester_fullname: data.requester_fullname,
          requester_id: data.requester_id
        };
      });
    });
  }

  // searchUsers(searchParams: any) {
  //   this.searchUserCollection = this.afs.collection('users',
  //     (ref) => ref.where('displayName', '>=', `${searchParams}`));
  //   return this.searchUserCollection.snapshotChanges().map((actions) => {
  //     return actions.map((a) => {
  //       const data = a.payload.doc.data() as User;
  //       return { id: a.payload.doc.id, displayName: data.displayName, email: data.email, time: data.time };
  //     });
  //   });
  // }

  getSnapshotConversationByRecipient(recipient: string): Observable<Request[]> {
    // ['added', 'modified', 'removed']

    this.requestsCollection = this.afs.collection('conversations',
      (ref) => ref.where('recipient', '==', `${recipient}`));

    return this.requestsCollection.snapshotChanges().map((actions) => {
      return actions.map((a) => {
        const data = a.payload.doc.data() as Request;
        return {
          id: a.payload.doc.id,
          recipient: data.recipient,
          recipient_fullname: data.recipient_fullname,
          sender_fullname: data.sender_fullname,
          text: data.text,
          timestamp: data.timestamp,
          membersCount: data.membersCount,
          support_status: data.support_status,
          members: data.members
        };
      });
    });
  }

  // GET THE COUNT OF UNSERVED REQUEST TO SHOW IN THE NAVBAR NOTIFICATIONS
  getCountUnservedRequest(): Observable<number> {
    // ['added', 'modified', 'removed']
    // <=
    this.requestsCollection = this.afs.collection('conversations',
      (ref) => ref.where('support_status', '==', 100));

    return this.requestsCollection.valueChanges().map((values) => {

      console.log('Request Service VALUeS LENGHT ', values.length)
      // console.log('Request Service VALUeS', values)
      if (values) {
        this.unservedRequest = values;
        this.mySubject.next(this.unservedRequest);
        console.log(' ++ UNSERVED REQUESTS PUBLISHED BY REQ. SERVICE ', this.unservedRequest)
      }
      return values.length;
    });
  }

  /**
   * LAST CONVERSATION (ALIAS LAST REQUESTS - IN THE VIEW IS VISITORS)
   * USED TO SHOW THE LAST REQUEST (ONLY IF HAS SUPPORT-STATUS = 100) IN THE NOTIFICATION
   */
  getSnapshotLastConversation(): Observable<Request[]> {
    // ['added', 'modified', 'removed']

    this.requestsCollection = this.afs.collection('conversations',
      (ref) => ref.where('support_status', '==', 100));
    // .orderBy('support_status', 'desc').orderBy('timestamp', 'desc')

    return this.requestsCollection.snapshotChanges().map((actions) => {
      return actions.map((a) => {
        const data = a.payload.doc.data() as Request;
        return {
          id: a.payload.doc.id,
          recipient: data.recipient,
          text: data.text,
          first_text: data.first_text,
          timestamp: data.timestamp,
          support_status: data.support_status,
          members: data.members,
        };
      });
    });
  }


  // getIfStatusChange(): Observable<Request[]> {
  //   // ['added', 'modified', 'removed']
  //   this.requestsCollection = this.afs.collection('conversations',
  //     (ref) => ref.where('support_status', '==', 100)
  //   );
  //   // .orderBy('support_status', 'desc').orderBy('timestamp', 'desc')

  //   return this.requestsCollection.stateChanges(function (snapshot) {
  //     snapshot.docChanges.forEach(function (change) {
  //       if (change.type === 'added') {
  //         console.log('Status Changed: ', change.doc.data());
  //       }
  //     });
  //   });
  // }



  // getSnapshotLastConversationX(): Observable<Request[]> {
  //   db.collection("cities").where("state", "==", "CA")
  //     .onSnapshot(function (snapshot) {
  //       snapshot.docChanges.forEach(function (change) {
  //         if (change.type === "added") {
  //           console.log("New city: ", change.doc.data());
  //         }
  //         if (change.type === "modified") {
  //           console.log("Modified city: ", change.doc.data());
  //         }
  //         if (change.type === "removed") {
  //           console.log("Removed city: ", change.doc.data());
  //         }
  //       });
  //     });
  // }

  /**
   * MESSAGES return an observable of ALL FIRESTORE  'message' * WITH * ID
   */
  getSnapshotMsg(recipient: string): Observable<Message[]> {
    // ['added', 'modified', 'removed']
    // .orderBy('timestamp', 'desc')
    this.messageCollection = this.afs.collection('messages',
      (ref) => ref.where('recipient', '==', `${recipient}`).orderBy('timestamp', 'asc'));
    return this.messageCollection.snapshotChanges().map((actions) => {
      return actions.map((a) => {
        const data = a.payload.doc.data() as Message;
        return { id: a.payload.doc.id, recipient: data.recipient, recipient_fullname: data.recipient_fullname, sender_fullname: data.sender_fullname, text: data.text, timestamp: data.timestamp };
      });
    });
  }

  // public joinToGroup(member_id: string, group_id: string) {
  public joinToGroup(group_id: string, firebaseToken: any, currentUserUid: string) {

    this.FIREBASE_ID_TOKEN = firebaseToken;
    this.currentUserFireBaseUID = currentUserUid;

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');

    // TEST WITH HARDCODED VALUES
    // headers.append('Authorization', 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjcyYTAxZTRhZWI0MDU3Yjc5OTZkYjEwMjhkMWVjZmY0NWFhMjM5ZTEifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY2hhdC12Mi1kZXYiLCJhdWQiOiJjaGF0LXYyLWRldiIsImF1dGhfdGltZSI6MTUxOTAzNTQ0NSwidXNlcl9pZCI6Ikh6eUtTWFN1empnWXExaWI2bjlFOFBNam9ZcDEiLCJzdWIiOiJIenlLU1hTdXpqZ1lxMWliNm45RThQTWpvWXAxIiwiaWF0IjoxNTE5MTE0NTcyLCJleHAiOjE1MTkxMTgxNzIsImVtYWlsIjoibmljb2xhLmxhbnppbG90dG9AZnJvbnRpZXJlMjEuaXQiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsibmljb2xhLmxhbnppbG90dG9AZnJvbnRpZXJlMjEuaXQiXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.M6tfeX0Y3xZg7K5ARvcxVefQv_psyDHLXYDrWDlLcx38vi66FqRssQT5I0_pVW6qL_bmSQTVPB8SEy3gnMYCQoVxAq5Z3nBMtWXftnqVYPj2-SqMACraBcz1_ptaN3GqBaQlkRFDfLbMVvfhBDWRuhm5yMmCh_8yvkjFbuTUaajmrY0-GAnrcDvxGgSxN_eV-_9qzBxsDna601fiB3ILafPl0zRG5JRTeK-JjLNtVSeMNcrolKzX2porAa8hA4Gf7DDpEr8rBOq-HtrZnyMLb1y9O77fiA270B70uJ5TExzynzjA9pi2tRZW_MOhLCy_igpz3AbMFKxwgeWXWFFMNA');
    // headers.append('Authorization', 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImUxNmI4ZWFlNTczOTk2NGM1MWJjMTUyNWI1ZmU2ZmRjY2Y1ODJjZDQifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY2hhdC12Mi1kZXYiLCJhdWQiOiJjaGF0LXYyLWRldiIsImF1dGhfdGltZSI6MTUxOTAzNTQ0NSwidXNlcl9pZCI6Ikh6eUtTWFN1empnWXExaWI2bjlFOFBNam9ZcDEiLCJzdWIiOiJIenlLU1hTdXpqZ1lxMWliNm45RThQTWpvWXAxIiwiaWF0IjoxNTE5MTE0Nzk4LCJleHAiOjE1MTkxMTgzOTgsImVtYWlsIjoibmljb2xhLmxhbnppbG90dG9AZnJvbnRpZXJlMjEuaXQiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsibmljb2xhLmxhbnppbG90dG9AZnJvbnRpZXJlMjEuaXQiXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.bEgRyEjbBhvR6dLNn745wzOSgeRoh2KehTUtS_rCQ9UnzlODFAPjIBRpWsHl5Arl2dJIxL_-x7nPxFnAmWtc7Ixq0sUf0uM9vzN2iioHdjEruFIhOo2k5Drqi8Ks5cqmKKks4XQy59f7TQPoYpGsM2o2lr9Im51oE48KOSw51VWzMJW9t3M2da9-wM4MQb91RYhMOK69-S2GbeEmkiSQdtSym4LugN0NTcdwfUQtKFLJOrSp4WWAfvy7W7VrqtlNgo-Q-EtFv93TEhjtF1uVpU5Sq6J6l6P6H9lqpixLo19vsNfAquEQnXQ4lNEArE5vuha5A06wvYLeqA5KB1ibNw');

    headers.append('Authorization', 'Bearer ' + this.FIREBASE_ID_TOKEN);
    const options = new RequestOptions({ headers });

    // TEST WITH HARDCODED VALUES
    // const body = { 'member_id': 'HzyKSXSuzjgYq1ib6n9E8PMjoYp1' };

    // IF THE MEMBER ID VALUE IS PASSED FROM REQUEST LIST COMPONENT
    // const body = { 'member_id': `${member_id}` };

    const body = { 'member_id': this.currentUserFireBaseUID };
    console.log('JOIN TO GROUP POST REQUEST BODY ', body);

    // TEST WITH HARDCODED VALUES
    // const url = 'https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/groups/support-group-L5jBny8-9XBZd9IMD04/members';
    // const url = this.CHAT21_CLOUD_FUNCTIONS_BASE_URL + '-L5SkLKulk4V9BcVnfNT/members';
    const url = this.CHAT21_CLOUD_FUNCTIONS_BASE_URL + `${group_id}` + '/members';
    console.log('CLOUD FUNCT JOIN A GROUP URL ', url)

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }





}
