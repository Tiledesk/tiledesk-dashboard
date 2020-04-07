// tslint:disable:max-line-length
import { Injectable } from '@angular/core';

import { Request } from '../models/request-model';
import { Message } from '../models/message-model';

import { Observable } from 'rxjs/Observable';

import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { members_as_html } from '../utils/util';
import { currentUserUidIsInMembers } from '../utils/util';
import { AuthService } from '../core/auth.service';
import { Project } from '../models/project-model';
import { Department } from '../models/department-model';
import { DepartmentService } from '../services/mongodb-department.service';
import { UsersService } from '../services/users.service';
import { environment } from '../../environments/environment';


import * as firebase from 'firebase';
import 'firebase/firestore';
// import { QuerySnapshot, DocumentChange, DocumentSnapshot } from '@firebase/firestore-types';
import { AppConfigService } from '../services/app-config.service';
@Injectable()
export class RequestsService {

  // requestsCollection: AngularFirestoreCollection<Request>;
  // userDocument: AngularFirestoreDocument<Node>;
  // messageCollection: AngularFirestoreCollection<Message>;

  http: Http;
  CHAT21_CLOUD_FUNCTIONS_BASE_URL: any;
  // CHAT21_CLOUD_FUNCTIONS_BASE_URL = environment.cloudFunctions.cloud_functions_base_url;
  CHAT21_CLOUD_FUNC_CLOSE_GROUP_BASE_URL: any
  // CHAT21_CLOUD_FUNC_CLOSE_GROUP_BASE_URL = environment.cloudFunctions.cloud_func_close_support_group_base_url
  // FIREBASE_ID_TOKEN = environment.cloudFunctions.firebase_IdToken;
  FIREBASE_ID_TOKEN: any;

  user: any;
  currentUserID: string;
  unservedRequest: any;

  requestList: Request[] = [];
  allRequestList: Request[] = [];

  unsubscribe: any;

  myDepts: Department[]

  // BASE_URL = environment.mongoDbConfig.BASE_URL; // replaced with SERVER_BASE_PATH
 
  // SERVER_BASE_PATH = environment.SERVER_BASE_URL; // now get from appconfig
  SERVER_BASE_PATH: string;

  TOKEN: string
  // MY_DEPTS_BASE_URL: any; // NOT USED

  // public mySubject: BehaviorSubject<any> = new BehaviorSubject<any[]>(null);
  public mySubject: BehaviorSubject<any> = new BehaviorSubject<any[]>(null);

  public requestsList_bs: BehaviorSubject<Request[]> = new BehaviorSubject<Request[]>([]);
  public allRequestsList_bs: BehaviorSubject<Request[]> = new BehaviorSubject<Request[]>([]);

  _seeAllRequests = true
  _seeOnlyRequestsHaveCurrentUserAsAgent = false

  project: Project;

  constructor(
    http: Http,
    // private afs: AngularFirestore,
    public auth: AuthService,
    private departmentService: DepartmentService,
    private usersService: UsersService,
    public appConfigService: AppConfigService
  ) {

    console.log('SEE REQUEST IM AGENT (REQUESTS SERVICE - ON INIT) ', this._seeOnlyRequestsHaveCurrentUserAsAgent)
    this.http = http;
    console.log(' ============ HELLO REQUESTS SERVICE! ============ ');

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
    this.getProjectUserRole();

    this.user = auth.user_bs.value
    this.checkUser()

    this.auth.user_bs.subscribe((user) => {

      this.user = user;
      this.checkUser()
    });

    /** UNCOMMENT THIS IF WHANT TO SUBSCRIBE TO FIRESTORE REQUESTS  */
    this.getCurrentProject();
    
    // this.getMyDepts(); // !! NO MORE USED

    // const firebase_conf = appConfigService.getConfig().firebase;
    // const cloudBaseUrl = firebase_conf['chat21ApiUrl']
    // this.CHAT21_CLOUD_FUNCTIONS_BASE_URL = cloudBaseUrl + '/api/tilechat/groups/'
    // this.CHAT21_CLOUD_FUNC_CLOSE_GROUP_BASE_URL = cloudBaseUrl + '/supportapi/tilechat/groups/'

    this.SERVER_BASE_PATH = appConfigService.getConfig().SERVER_BASE_URL;
    console.log('AppConfigService getAppConfig (REQUESTS SERV.) SERVER_BASE_PATH ', this.SERVER_BASE_PATH);
  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs.subscribe((user_role) => {
      // this.USER_ROLE = user_role;
      console.log('SEE REQUEST IM AGENT - in GET USER ROLE (REQUESTS SERVICE) ', user_role);
      if (user_role) {

        if (user_role === 'agent') {
          this._seeOnlyRequestsHaveCurrentUserAsAgent = true;
          console.log('SEE REQUEST IM AGENT - in GET USER ROLE (REQUESTS SERVICE) ', this._seeOnlyRequestsHaveCurrentUserAsAgent)
        } else {
          this._seeOnlyRequestsHaveCurrentUserAsAgent = false;
        }
      }

    }, (err) => {
      console.log('SEE REQUEST IM AGENT - GET USER ROLE - ERROR ', err);
    }, () => {
      console.log('SEE REQUEST IM AGENT - GET USER ROLE * COMPLETE *');
    });
  }

  getCurrentProject() {
    // IF EXIST A PROJECT UNSUSCRIBE query.onSnapshot AND RESET REQUEST LIST
    this.auth.project_bs.subscribe((project) => {
      console.log('!!! REQUEST SERVICE: SUBSCRIBE TO THE PROJECT PUBLISHED BY AUTH SERVICE ', project)
      // // tslint:disable-next-line:no-debugger
      // debugger
      if (project) {
        this.project = project;

      /* start old */
      //   if (this.unsubscribe) {
      //     this.unsubscribe();
      //     console.log('!!! REQUEST SERVICE: unsubscribe ', this.unsubscribe)
      //     this.resetRequestsList();
      //   }
      //   this.project = project;

      //   this.startRequestsQuery();

      // } else {
      //   if (this.unsubscribe) {
      //     this.unsubscribe();
      //     this.resetRequestsList();
      //   }
      //   this.project = project;
      /* end old */

      }

      // console.log('00 -> REQUEST SERVICE project from AUTH service subscription ', project)
    });
  }

  checkUser() {
    if (this.user) {
      this.TOKEN = this.user.token
      // this.currentUserFireBaseUID = this.user.uid
      this.currentUserID = this.user._id
      console.log('USER UID GET IN REQUEST-SERV', this.currentUserID);
      // this.getToken();
    } else {
      console.log('No user is signed in');
    }
  }


  startRequestsQuery() {
    console.log('****** START REQUEST QUERY ******')
    // GET ALL REQUESTS AND EVALUATING THE REQUEST'S ID ADD OR UPDATE
    this.getRequests().subscribe((requests: Request[]) => {
      // console.log('START REQUEST QUERY - REQUESTS ', requests)
      requests.forEach((r: Request) => {


        this.addOrUpdateRequestsList(r);
        this.addOrUpdate_AllRequestsList(r)

      });
      // PUBLISH THE REQUESTS LIST (ORDERED AND WITH THE CHANGES MANAGED BY addOrUpdateRequestsList)
      this.requestsList_bs.next(this.requestList);
      
      // console.log('!!! REQUESTS-SERVICE PUBLISH REQUEST LIST ', this.requestList);

      this.allRequestsList_bs.next(this.allRequestList);
      // console.log('!!! REQUESTS-SERVICE PUBLISH THE LIST OF * ALL * REQUESTS ', this.allRequestList)
    }, error => {
      console.log('GET REQUEST - ERROR ', error)
    }, () => {
      console.log('GET REQUEST * COMPLETE')
    });


  }

  seeOnlyRequestsHaveCurrentUserAsAgent(seeIamAgentReq) {
    console.log('SEE REQUEST IM AGENT (REQUESTS SERVICE) ', seeIamAgentReq)
    this._seeOnlyRequestsHaveCurrentUserAsAgent = seeIamAgentReq
    this.getCurrentProject()
    // if (this._seeAllRequests === true) {

    // }
  }

  addOrUpdateRequestsList(r: Request) {
    // console.log('****** ADD OR UPDATE REQUEST LIST ******')

    // r.hasAgent(this.currentUserID)) PASS THE CURRENT USER ID TO THE 'REQUEST' MODEL WHICH AFTER COMPARING
    // THE CURRENT USER ID WITH THE 'USER ID' CONTAINED IN THE ARRAY 'AGENTS' (NESTED IN THE 'REQUEST' OBJECT)
    // RETURNS TRUE OR FALSE
    // || !r.hasAgent(this.currentUserID)
    if (r !== null && r !== undefined) {
      // console.log('THE REQUEST AS ME AS AGENT ', r.hasAgent(this.currentUserID))

      /**
       * IN THE CONSTRUCTOR IS GET THE USER ROLE:
       * IF THE CURRENT USER HAS OWNER/ADMIN ROLE:
       *    ARE DISPLAYED ALL THE REQUESTS
       *    (THE FILTER hasAgent IS NOT VALUED i.e., IT IS NOT VALUED IF THE CURRENT USER IS AMONG THE AGENTS OF THE REQUEST)
       *    MOREOVER IS DISPLAYED THE SWITCH BUTTON "SEE ALL REQUESTS / SEE ONLY MY REQUEST".
       *    WHEN THE TILEDESK USER SWITCH THE BUTTON ON "SEE ONLY MY REQUESTS" THE REQUESTS ARE FILTERED FOR hasAgent
       * IF THE CURRENT USER HAS AGENT ROLE: THE REQUESTS ARE FILTERED FOR hasAgent AND ARE NOT DISPLAYED THE SWITCH BUTTON
       */
      // SE hasAgent è = TRUE IL CURRENT USER è UN AGENT
      // SE HAS AGENT è = FALSE IL CURRENT USER NON è UN AGENT  IL WORK FLOW SI BLOCCA E PASSA AL CICLO SUCCESSIVO
      if (!r.hasAgent(this.currentUserID) && this._seeOnlyRequestsHaveCurrentUserAsAgent === true) {
        // console.log('THE REQUEST AS ME AS AGENT ', r.hasAgent(this.currentUserID), ' SHOW ONLY Im AGENT REQUEST ', this._seeOnlyRequestsHaveCurrentUserAsAgent)
        return;
      }
      // console.log('THE REQUEST AS ME AS AGENT ', r.hasAgent(this.currentUserID), ' SHOW ONLY Im AGENT REQUEST ', this._seeOnlyRequestsHaveCurrentUserAsAgent)
      // console.log('THE REQUEST AS ME AS AGENT ', r.hasAgent(this.currentUserID))
      for (let i = 0; i < this.requestList.length; i++) {
        // IF THE ID OF THE REQUEST RETURNED FROM DOCUMENT CHANGE (i.e. r.recipient) IS ALREADY IN THE REQUEST LIST this.requestList[i].recipient
        // THIS MEAN THAT THE TYPE OF DocumentChange RETURNED FROM THE QUERY IS MODIFIED OR REMOVED
        if (r.recipient === this.requestList[i].recipient) {

          // USE CASE: DocumentChange TYPE = MODIFIED
          // - run an UPDATE: SUBSTITUTE THE EXISTING REQUEST WITH THE MODIFIED ONE ...
          if (r.firebaseDocChangeType === 'modified') {
            // console.log('2) »»»»» DOCUMENT CHANGE TYPE ', r.firebaseDocChangeType)
            this.requestList[i] = r;
            this.reorderRequests()
            return;
          } else {
            // USE CASE REQUEST ARCHIVED - DocumentChange TYPE = REMOVED
            // run a SPLICE to remove the request from the list
            // console.log('2) »»»»» DOCUMENT CHANGE TYPE ', r.firebaseDocChangeType)
            const index = this.requestList.indexOf(this.requestList[i]);
            // console.log('INDEX OF THE REQUEST TO REMOVE ', index)
            if (index > -1) {
              this.requestList.splice(index, 1);
            }
            return;
          }
        }
        // console.log('REQUEST RECIPIENT ', this.requestList[i].recipient)
      }
      // ... ELSE ADD THE REQUEST
      this.requestList.push(r);
      this.reorderRequests()

    }
  }

  addOrUpdate_AllRequestsList(r: Request) {
    console.log('****** ADD OR UPDATE * ALL * REQUEST LIST ******')

    if (r === null || r === undefined) {
      return;
    }
    for (let i = 0; i < this.allRequestList.length; i++) {
      // IF THE ID OF THE REQUEST RETURNED FROM DOCUMENT CHANGE (i.e. r.recipient) IS ALREADY IN THE REQUEST LIST this.requestList[i].recipient
      // THIS MEAN THAT THE TYPE OF DocumentChange RETURNED FROM THE QUERY IS MODIFIED OR REMOVED
      if (r.recipient === this.allRequestList[i].recipient) {

        // USE CASE: DocumentChange TYPE = MODIFIED
        // - run an UPDATE: SUBSTITUTE THE EXISTING REQUEST WITH THE MODIFIED ONE ...
        if (r.firebaseDocChangeType === 'modified') {
          // console.log('2) »»»»» DOCUMENT CHANGE TYPE ', r.firebaseDocChangeType)
          this.allRequestList[i] = r;
          // this.reorderRequests()
          return;
        } else {
          // USE CASE REQUEST ARCHIVED - DocumentChange TYPE = REMOVED
          // run a SPLICE to remove the request from the list
          // console.log('2) »»»»» DOCUMENT CHANGE TYPE ', r.firebaseDocChangeType)
          const index = this.allRequestList.indexOf(this.requestList[i]);
          // console.log('INDEX OF THE REQUEST TO REMOVE ', index)
          if (index > -1) {
            this.allRequestList.splice(index, 1);
          }
          return;
        }
      }
      // console.log('REQUEST RECIPIENT ', this.requestList[i].recipient)
    }
    // ... ELSE ADD THE REQUEST
    this.allRequestList.push(r);
    // this.reorderRequests()
  }

  // reorderRequests() {
  //   this.requestList.sort(function compare(a: Request, b: Request) {
  //     if (a.timestamp > b.timestamp) {
  //       return -1;
  //     }
  //     if (a.timestamp < b.timestamp) {
  //       return 1;
  //     }
  //     return 0;
  //   });
  // }

  reorderRequests() {
    this.requestList.sort(function compare(a: Request, b: Request) {
      if (a.created_on > b.created_on) {
        // console.log('zone a > b - A CREATED ON ', a.created_on);
        // console.log('zone a > b - B CREATED ON ', b.created_on);
        return -1;
      }
      if (a.created_on < b.created_on) {
        // console.log('zone a < b - A CREATED ON ', a.created_on);
        // console.log('zone a < b - B CREATED ON ', b.created_on);
        return 1;
      }
      return 0;
    });
  }

  resetRequestsList() {
    this.requestList = []
    this.allRequestList = []
    console.log('RESET LIST OF REQUESTS  - REQUEST-LIST ', this.requestList);
    console.log('RESET LIST OF ALL REQUESTS  - ALL-REQUEST-LIST ', this.allRequestList);
    this.requestsList_bs.next(this.requestList);
    this.allRequestsList_bs.next(this.allRequestList);
  }

  getRequests(): Observable<Request[]> {
    console.log('getRequests ', typeof firebase.firestore)
    const db = firebase.firestore();
    // RESOLVE THE ISSUE: The behavior for Date objects stored in Firestore is going to change AND YOUR APP MAY BREAK.
    //    !!! COMMENT THE LINE BELOW TO SEE THE ERROR MESSAGE IN CONSOLE !!!
    // db.settings({ timestampsInSnapshots: true });

    // .where('departmentId', '==', '5b05319ffb1e724de404df57')   '5b44c82def5dca0014d777ac' this.project._id
    const query = db.collection('conversations')
      .where('support_status', '<', 1000)
      .where('projectid', '==', this.project._id)
      .orderBy('support_status')
      .orderBy('created_on', 'desc');
    // const observer = Observable.create(query.onSnapshot.bind(query));
    const observable = new Observable<Request[]>(observer => {
      this.unsubscribe = query.onSnapshot(snapshot => {
        // console.log('REQUEST SNAPSHOT ', snapshot)
        const requestListReturned: Request[] = snapshot.docChanges().map((c: any) => {
          // console.log(' »»» »»» »»» »»» »»» »»» REQUEST SERVICE - DOCUMENT CHANGE - TYPE: ', c.type);
          // console.log(' »»» »»» DOCUMENT CHANGE - DOC DATA ', c.doc.data())
          // const requestListReturned: Request[] = snapshot.docs.map((c: DocumentSnapshot) => {
          const r: Request = new Request();
          const data = c.doc.data()
          // const data = c.data()
          r.id = data.recipient;
          r.recipient_fullname = data.recipient_fullname;
          r.recipient = data.recipient;
          r.sender_fullname = data.sender_fullname
          r.text = data.text
          r.first_text = data.first_text
          r.timestamp = data.timestamp
          r.created_on = data.created_on.toDate()
          r.membersCount = data.membersCount
          r.support_status = data.support_status
          r.members = data.members
          // r.members_as_string = members_as_html(data.members, data.requester_id, this.currentUserID)
          r.currentUserIsJoined = currentUserUidIsInMembers(data.members, this.currentUserID, data.recipient)
          r.requester_fullname = data.requester_fullname
          r.requester_id = data.requester_id
          r.agents = data.agents
          r.first_message = data.first_message
          r.attributes = data.attributes
          r.rating = data.rating
          r.rating_message = data.rating_message
          r.firebaseDocChangeType = c.type
          // r.hasAgent(this.currentUserID)
          return r;

        });
        observer.next(requestListReturned);
        // console.log('requestListReturned', requestListReturned)
      });
    });
    return observable;
  }


  getRequestsById(recipient: string): Observable<Request[]> {
    console.log('getRequestsById ', typeof firebase.firestore)
    const db = firebase.firestore();
    const query = db.collection('conversations')
      .where('recipient', '==', `${recipient}`)
    const observable = new Observable<Request[]>(observer => {
      this.unsubscribe = query.onSnapshot(snapshot => {
        // console.log('REQUEST SNAPSHOT ', snapshot)
        const requestReturned: Request[] = snapshot.docChanges().map((c: any) => {
          // console.log(' »»» »»» »»» »»» »»» »»» REQUEST SERVICE - DOCUMENT CHANGE - TYPE: ', c.type);
          // console.log(' »»» »»» DOCUMENT CHANGE - DOC DATA ', c.doc.data())
          // const requestListReturned: Request[] = snapshot.docs.map((c: DocumentSnapshot) => {
          const r: Request = new Request();
          const data = c.doc.data()
          // const data = c.data()
          r.id = data.recipient;
          r.recipient = data.recipient;
          r.recipient_fullname = data.recipient_fullname;
          r.sender_fullname = data.sender_fullname
          r.text = data.text
          r.first_text = data.first_text
          r.timestamp = data.timestamp
          r.created_on = data.created_on.toDate()
          r.membersCount = data.membersCount
          r.support_status = data.support_status
          r.members = data.members
          // r.members_as_string = members_as_html(data.members, data.requester_id, this.currentUserID)
          r.currentUserIsJoined = currentUserUidIsInMembers(data.members, this.currentUserID, data.recipient)
          r.requester_fullname = data.requester_fullname
          r.requester_id = data.requester_id
          r.agents = data.agents
          r.first_message = data.first_message
          r.attributes = data.attributes
          r.rating = data.rating
          r.rating_message = data.rating_message
          r.firebaseDocChangeType = c.type
          // r.hasAgent(this.currentUserID)
          return r;

        });
        observer.next(requestReturned);
        // console.log('requestListReturned', requestListReturned)
      });
    });
    return observable;
  }


  getMsgsByRequestId(recipient: string): Observable<Message[]> {
    console.log('getMsgsByRequestId ', typeof firebase.firestore)
    const db = firebase.firestore();
    const query = db.collection('messages')
      .where('recipient', '==', `${recipient}`).orderBy('timestamp', 'asc')
    const observable = new Observable<Message[]>(observer => {
      this.unsubscribe = query.onSnapshot(snapshot => {
        // console.log('*MSGS - REQUESTS-SERV getMessagesList SNAPSHOT ', snapshot);

        const msgReturned: Message[] = snapshot.docs.map((c: any) => {
          const m: Message = new Message();
          const data = c.data();
          m.id = data.recipient;
          m.recipient = data.recipient;
          m.recipient_fullname = data.recipient_fullname;
          m.sender_fullname = data.sender_fullname;
          m.sender = data.sender;
          m.text = data.text;
          m.timestamp = data.timestamp;

          return m;
        });
        observer.next(msgReturned);
        // console.log('*MSGS - REQUESTS-SERV getMessagesList msgReturned', msgReturned)
      });
    });
    return observable;
  }


  // public joinToGroup(member_id: string, group_id: string) {
  public joinToGroup(group_id: string, firebaseToken: any, userUid: string) {
    this.FIREBASE_ID_TOKEN = firebaseToken;
    // this.currentUserID = currentUserUid;

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');

    // TEST WITH HARDCODED VALUES
    // headers.append('Authorization', 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjcyYTAxZTRhZWI0MDU3Yjc5OTZkYjEwMjhkMWVjZmY0NWFhMjM5ZTEifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY2hhdC12Mi1kZXYiLCJhdWQiOiJjaGF0LXYyLWRldiIsImF1dGhfdGltZSI6MTUxOTAzNTQ0NSwidXNlcl9pZCI6Ikh6eUtTWFN1empnWXExaWI2bjlFOFBNam9ZcDEiLCJzdWIiOiJIenlLU1hTdXpqZ1lxMWliNm45RThQTWpvWXAxIiwiaWF0IjoxNTE5MTE0NTcyLCJleHAiOjE1MTkxMTgxNzIsImVtYWlsIjoibmljb2xhLmxhbnppbG90dG9AZnJvbnRpZXJlMjEuaXQiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsibmljb2xhLmxhbnppbG90dG9AZnJvbnRpZXJlMjEuaXQiXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.M6tfeX0Y3xZg7K5ARvcxVefQv_psyDHLXYDrWDlLcx38vi66FqRssQT5I0_pVW6qL_bmSQTVPB8SEy3gnMYCQoVxAq5Z3nBMtWXftnqVYPj2-SqMACraBcz1_ptaN3GqBaQlkRFDfLbMVvfhBDWRuhm5yMmCh_8yvkjFbuTUaajmrY0-GAnrcDvxGgSxN_eV-_9qzBxsDna601fiB3ILafPl0zRG5JRTeK-JjLNtVSeMNcrolKzX2porAa8hA4Gf7DDpEr8rBOq-HtrZnyMLb1y9O77fiA270B70uJ5TExzynzjA9pi2tRZW_MOhLCy_igpz3AbMFKxwgeWXWFFMNA');
    // headers.append('Authorization', 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImUxNmI4ZWFlNTczOTk2NGM1MWJjMTUyNWI1ZmU2ZmRjY2Y1ODJjZDQifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY2hhdC12Mi1kZXYiLCJhdWQiOiJjaGF0LXYyLWRldiIsImF1dGhfdGltZSI6MTUxOTAzNTQ0NSwidXNlcl9pZCI6Ikh6eUtTWFN1empnWXExaWI2bjlFOFBNam9ZcDEiLCJzdWIiOiJIenlLU1hTdXpqZ1lxMWliNm45RThQTWpvWXAxIiwiaWF0IjoxNTE5MTE0Nzk4LCJleHAiOjE1MTkxMTgzOTgsImVtYWlsIjoibmljb2xhLmxhbnppbG90dG9AZnJvbnRpZXJlMjEuaXQiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsiZW1haWwiOlsibmljb2xhLmxhbnppbG90dG9AZnJvbnRpZXJlMjEuaXQiXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.bEgRyEjbBhvR6dLNn745wzOSgeRoh2KehTUtS_rCQ9UnzlODFAPjIBRpWsHl5Arl2dJIxL_-x7nPxFnAmWtc7Ixq0sUf0uM9vzN2iioHdjEruFIhOo2k5Drqi8Ks5cqmKKks4XQy59f7TQPoYpGsM2o2lr9Im51oE48KOSw51VWzMJW9t3M2da9-wM4MQb91RYhMOK69-S2GbeEmkiSQdtSym4LugN0NTcdwfUQtKFLJOrSp4WWAfvy7W7VrqtlNgo-Q-EtFv93TEhjtF1uVpU5Sq6J6l6P6H9lqpixLo19vsNfAquEQnXQ4lNEArE5vuha5A06wvYLeqA5KB1ibNw');

    headers.append('Authorization', 'Bearer ' + this.FIREBASE_ID_TOKEN);
    const options = new RequestOptions({ headers });
    console.log('JOIN FUNCT OPTIONS  ', options)
    // TEST WITH HARDCODED VALUES
    // const body = { 'member_id': 'HzyKSXSuzjgYq1ib6n9E8PMjoYp1' };

    // IF THE MEMBER ID VALUE IS PASSED FROM REQUEST LIST COMPONENT
    // const body = { 'member_id': `${member_id}` };

    const body = { 'member_id': userUid };
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

  public leaveTheGroup(group_id: string, firebaseToken: any, userUid: string) {
    this.FIREBASE_ID_TOKEN = firebaseToken;
    // this.currentUserID = currentUserUid;

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', 'Bearer ' + this.FIREBASE_ID_TOKEN);
    const options = new RequestOptions({ headers });
    console.log('LEAVE THE GROUP OPTIONS  ', options)

    const url = this.CHAT21_CLOUD_FUNCTIONS_BASE_URL + `${group_id}` + '/members/' + userUid;
    console.log('LEAVE THE GROUP URL ', url)

    return this.http
      .delete(url, options)
      .map((res) => res.json());

  }

  // CLOSE SUPPORT GROUP !!!!! THIS IS NO MORE USED - REPLACED BY 
  // closeSupportGroup IN WS-REQUESTS-SERVICE (this.wsRequestsService.closeSupportGroup)
  public closeSupportGroup(group_id: string, firebaseToken: any) {

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', 'Bearer ' + firebaseToken);

    const options = new RequestOptions({ headers });
    console.log('CLOUD FUNCT CLOSE SUPPORT OPTIONS  ', options)

    const body = {};
    // console.log('CLOUD FUNCT CLOSE SUPPORT GROUP REQUEST BODY ', body);

    const url = this.CHAT21_CLOUD_FUNC_CLOSE_GROUP_BASE_URL + group_id;
    console.log('CLOUD FUNCT CLOSE SUPPORT GROUP URL ', url);
    return this.http
      .put(url, body, options)
    // commented because the service not return nothing and if try to map the json obtain the error:
    // ERROR  SyntaxError: Unexpected end of JSON
    // .map((res) => res.json());
  }

  // ------------- MOVED TO ANALYTICS SERVICE----------------------
  // public requestsByDay() {
  //   // USED TO TEST (note: this service doesn't work in localhost)
  //   // const url = 'https://api.tiledesk.com/v1/' + '5c28b587348b680015feecca' + '/analytics/requests/aggregate/day';
  //   const url = this.SERVER_BASE_PATH + this.project._id + '/analytics/requests/aggregate/day';
  //   console.log('!!! ANALYTICS - REQUESTS BY DAY - URL ', url);

  //   const headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //   // USED TO TEST (note: this service doesn't work in localhost)
  //   // headers.append('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YzI4YjU0ODM0OGI2ODAwMTVmZWVjYzkiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJlbWFpbHZlcmlmaWVkIjoiaW5pdCIsImxhc3RuYW1lIjoiaW5pdCIsImZpcnN0bmFtZSI6ImluaXQiLCJfaWQiOiJpbml0In0sInN0YXRlcyI6eyJpZ25vcmUiOnt9LCJkZWZhdWx0Ijp7fSwiaW5pdCI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6dHJ1ZSwiZmlyc3RuYW1lIjp0cnVlLCJwYXNzd29yZCI6dHJ1ZSwiZW1haWwiOnRydWUsIl9pZCI6dHJ1ZX0sIm1vZGlmeSI6e30sInJlcXVpcmUiOnt9fSwic3RhdGVOYW1lcyI6WyJyZXF1aXJlIiwibW9kaWZ5IiwiaW5pdCIsImRlZmF1bHQiLCJpZ25vcmUiXX0sInBhdGhzVG9TY29wZXMiOnt9LCJlbWl0dGVyIjp7Il9ldmVudHMiOnt9LCJfZXZlbnRzQ291bnQiOjAsIl9tYXhMaXN0ZW5lcnMiOjB9LCIkb3B0aW9ucyI6dHJ1ZX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6IlBhbmljbyIsImZpcnN0bmFtZSI6IkdhYnJpZWxlIiwicGFzc3dvcmQiOiIkMmEkMTAkMUJ0b0xEVmJFaDU5YmhPVlRRckRCT3NoMm8zU3Zlam5aY2VFU0VCZGRFVTc2dDk0d1lIRi4iLCJlbWFpbCI6ImdhYnJpZWxlLnBhbmljbzk1QGdtYWlsLmNvbSIsIl9pZCI6IjVjMjhiNTQ4MzQ4YjY4MDAxNWZlZWNjOSJ9LCIkaW5pdCI6dHJ1ZSwiaWF0IjoxNTU2MjY1MjI0fQ.aJkbYc2D-kMFZR3GgTiGA85sW-ZB5VWrQW7fLNQnICQ');
  //   headers.append('Authorization', this.TOKEN);
  //   return this.http
  //     .get(url, { headers })
  //     .map((response) => response.json());
  // }


  // Waiting Time Average
  // public averageWait() {
  //   // USED TO TEST (note: this service doesn't work in localhost)
  //   // const url = 'https://api.tiledesk.com/v1/' + '5ad5bd52c975820014ba900a' + '/analytics/requests/waiting';
  //   const url = this.SERVER_BASE_PATH + this.project._id + '/analytics/requests/waiting';
  //   console.log('!!! ANALYTICS - AVERAGE WAIT - URL ', url);

  //   const headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //   // USED TO TEST (note: this service doesn't work in localhost)
  //   // headers.append('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWM3NTIxNzg3ZjZiNTAwMTRlMGI1OTIiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJlbWFpbHZlcmlmaWVkIjoiaW5pdCIsImxhc3RuYW1lIjoiaW5pdCIsImZpcnN0bmFtZSI6ImluaXQiLCJfaWQiOiJpbml0In0sInN0YXRlcyI6eyJpZ25vcmUiOnt9LCJkZWZhdWx0Ijp7fSwiaW5pdCI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6dHJ1ZSwiZmlyc3RuYW1lIjp0cnVlLCJwYXNzd29yZCI6dHJ1ZSwiZW1haWwiOnRydWUsIl9pZCI6dHJ1ZX0sIm1vZGlmeSI6e30sInJlcXVpcmUiOnt9fSwic3RhdGVOYW1lcyI6WyJyZXF1aXJlIiwibW9kaWZ5IiwiaW5pdCIsImRlZmF1bHQiLCJpZ25vcmUiXX0sInBhdGhzVG9TY29wZXMiOnt9LCJlbWl0dGVyIjp7ImRvbWFpbiI6bnVsbCwiX2V2ZW50cyI6e30sIl9ldmVudHNDb3VudCI6MCwiX21heExpc3RlbmVycyI6MH0sIiRvcHRpb25zIjp0cnVlfSwiaXNOZXciOmZhbHNlLCJfZG9jIjp7ImVtYWlsdmVyaWZpZWQiOnRydWUsImxhc3RuYW1lIjoiTGFuemlsb3R0byIsImZpcnN0bmFtZSI6Ik5pY29sYSIsInBhc3N3b3JkIjoiJDJhJDEwJDEzZlROSnA3OUx5RVYvdzh6NXRrbmVrc3pYRUtuaWFxZm83TnR2aTZpSHdaQ2ZLRUZKd1kuIiwiZW1haWwiOiJuaWNvbGEubGFuemlsb3R0b0Bmcm9udGllcmUyMS5pdCIsIl9pZCI6IjVhYzc1MjE3ODdmNmI1MDAxNGUwYjU5MiJ9LCIkaW5pdCI6dHJ1ZSwiaWF0IjoxNTUwMDc3Mzg5fQ.temvv0C-EsHNbjgj7p5ZmF_CmjykLaZn8fNhI-_tV0M');
  //   headers.append('Authorization', this.TOKEN);
  //   return this.http
  //     .get(url, { headers })
  //     .map((response) => response.json());

  // }

  // NOT  USED (NOTE the timezone is variable - see email 3 jan)
  // public daysHoursRequestsDistribution() {
  //   const url = this.SERVER_BASE_PATH + this.project._id + '/analytics/requests/aggregate/dayoftheweek/hours?timezone=%2B01';
  //   console.log('!!! ANALYTICS - Requests Distribution IN THE HOURS OF THE DAYS - URL ', url);

  //   const headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //   // USED TO TEST (note: this service doesn't work in localhost)
  //   // headers.append('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWM3NTIxNzg3ZjZiNTAwMTRlMGI1OTIiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJlbWFpbHZlcmlmaWVkIjoiaW5pdCIsImxhc3RuYW1lIjoiaW5pdCIsImZpcnN0bmFtZSI6ImluaXQiLCJfaWQiOiJpbml0In0sInN0YXRlcyI6eyJpZ25vcmUiOnt9LCJkZWZhdWx0Ijp7fSwiaW5pdCI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6dHJ1ZSwiZmlyc3RuYW1lIjp0cnVlLCJwYXNzd29yZCI6dHJ1ZSwiZW1haWwiOnRydWUsIl9pZCI6dHJ1ZX0sIm1vZGlmeSI6e30sInJlcXVpcmUiOnt9fSwic3RhdGVOYW1lcyI6WyJyZXF1aXJlIiwibW9kaWZ5IiwiaW5pdCIsImRlZmF1bHQiLCJpZ25vcmUiXX0sInBhdGhzVG9TY29wZXMiOnt9LCJlbWl0dGVyIjp7ImRvbWFpbiI6bnVsbCwiX2V2ZW50cyI6e30sIl9ldmVudHNDb3VudCI6MCwiX21heExpc3RlbmVycyI6MH0sIiRvcHRpb25zIjp0cnVlfSwiaXNOZXciOmZhbHNlLCJfZG9jIjp7ImVtYWlsdmVyaWZpZWQiOnRydWUsImxhc3RuYW1lIjoiTGFuemlsb3R0byIsImZpcnN0bmFtZSI6Ik5pY29sYSIsInBhc3N3b3JkIjoiJDJhJDEwJDEzZlROSnA3OUx5RVYvdzh6NXRrbmVrc3pYRUtuaWFxZm83TnR2aTZpSHdaQ2ZLRUZKd1kuIiwiZW1haWwiOiJuaWNvbGEubGFuemlsb3R0b0Bmcm9udGllcmUyMS5pdCIsIl9pZCI6IjVhYzc1MjE3ODdmNmI1MDAxNGUwYjU5MiJ9LCIkaW5pdCI6dHJ1ZSwiaWF0IjoxNTM3MjkxNzcwfQ.dxovfEleb6I33rtWObY8SwyjfMVfaY7vXwHvQDeNTEY');
  //   headers.append('Authorization', this.TOKEN);
  //   return this.http
  //     .get(url, { headers })
  //     .map((response) => response.json());
  // }


  public lastMonthRequetsCount() {
    // USED TO TEST (note: this service doesn't work in localhost)
    //  const url = 'https://api.tiledesk.com/v1/' + '5ba35f0b9acdd40015d350b6' + '/analytics/requests/count';
    const url = this.SERVER_BASE_PATH + this.project._id + '/analytics/requests/count';
    console.log('!!! ANALYTICS - REQUESTS BY DAY - URL ', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    //  USED TO TEST (note: this service doesn't work in localhost)
    //  headers.append('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWM3NTIxNzg3ZjZiNTAwMTRlMGI1OTIiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJlbWFpbHZlcmlmaWVkIjoiaW5pdCIsImxhc3RuYW1lIjoiaW5pdCIsImZpcnN0bmFtZSI6ImluaXQiLCJfaWQiOiJpbml0In0sInN0YXRlcyI6eyJpZ25vcmUiOnt9LCJkZWZhdWx0Ijp7fSwiaW5pdCI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6dHJ1ZSwiZmlyc3RuYW1lIjp0cnVlLCJwYXNzd29yZCI6dHJ1ZSwiZW1haWwiOnRydWUsIl9pZCI6dHJ1ZX0sIm1vZGlmeSI6e30sInJlcXVpcmUiOnt9fSwic3RhdGVOYW1lcyI6WyJyZXF1aXJlIiwibW9kaWZ5IiwiaW5pdCIsImRlZmF1bHQiLCJpZ25vcmUiXX0sInBhdGhzVG9TY29wZXMiOnt9LCJlbWl0dGVyIjp7ImRvbWFpbiI6bnVsbCwiX2V2ZW50cyI6e30sIl9ldmVudHNDb3VudCI6MCwiX21heExpc3RlbmVycyI6MH0sIiRvcHRpb25zIjp0cnVlfSwiaXNOZXciOmZhbHNlLCJfZG9jIjp7ImVtYWlsdmVyaWZpZWQiOnRydWUsImxhc3RuYW1lIjoiTGFuemlsb3R0byIsImZpcnN0bmFtZSI6Ik5pY29sYSIsInBhc3N3b3JkIjoiJDJhJDEwJDEzZlROSnA3OUx5RVYvdzh6NXRrbmVrc3pYRUtuaWFxZm83TnR2aTZpSHdaQ2ZLRUZKd1kuIiwiZW1haWwiOiJuaWNvbGEubGFuemlsb3R0b0Bmcm9udGllcmUyMS5pdCIsIl9pZCI6IjVhYzc1MjE3ODdmNmI1MDAxNGUwYjU5MiJ9LCIkaW5pdCI6dHJ1ZSwiaWF0IjoxNTM3MjkxNzcwfQ.dxovfEleb6I33rtWObY8SwyjfMVfaY7vXwHvQDeNTEY');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  public downloadNodeJsHistoryRequestsAsCsv(querystring: string, pagenumber: number) {
    let _querystring = '&' + querystring
    if (querystring === undefined || !querystring) {
      _querystring = ''
    }
    const url = this.SERVER_BASE_PATH + this.project._id + '/requests/csv?status=1000' + _querystring + '&page=' + pagenumber;
    console.log('!!! NEW REQUESTS HISTORY - DOWNLOAD REQUESTS AS CSV URL ', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/csv');
    /* *** USED TO TEST IN LOCALHOST (note: this service doesn't work in localhost) *** */
    // headers.append('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWFhOTJmZjRjM2IxMTAwMTRiNDc4Y2IiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJsYXN0bmFtZSI6ImluaXQiLCJmaXJzdG5hbWUiOiJpbml0IiwiX2lkIjoiaW5pdCJ9LCJzdGF0ZXMiOnsiaWdub3JlIjp7fSwiZGVmYXVsdCI6e30sImluaXQiOnsibGFzdG5hbWUiOnRydWUsImZpcnN0bmFtZSI6dHJ1ZSwicGFzc3dvcmQiOnRydWUsImVtYWlsIjp0cnVlLCJfaWQiOnRydWV9LCJtb2RpZnkiOnt9LCJyZXF1aXJlIjp7fX0sInN0YXRlTmFtZXMiOlsicmVxdWlyZSIsIm1vZGlmeSIsImluaXQiLCJkZWZhdWx0IiwiaWdub3JlIl19LCJwYXRoc1RvU2NvcGVzIjp7fSwiZW1pdHRlciI6eyJkb21haW4iOm51bGwsIl9ldmVudHMiOnt9LCJfZXZlbnRzQ291bnQiOjAsIl9tYXhMaXN0ZW5lcnMiOjB9LCIkb3B0aW9ucyI6dHJ1ZX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJsYXN0bmFtZSI6IkxhbnppbG90dG8iLCJmaXJzdG5hbWUiOiJOaWNvbGEgNzQiLCJwYXNzd29yZCI6IiQyYSQxMCRwVWdocTVJclgxMzhTOXBEY1pkbG1lcnNjVTdVOXJiNlFKaVliMXlEckljOHJDMFh6c2hUcSIsImVtYWlsIjoibGFuemlsb3R0b25pY29sYTc0QGdtYWlsLmNvbSIsIl9pZCI6IjVhYWE5MmZmNGMzYjExMDAxNGI0NzhjYiJ9LCIkaW5pdCI6dHJ1ZSwiaWF0IjoxNTM4MTIzNTcyfQ.CYnxkLbg5XWk2JWAxQg1QNGDpNgNbZAzs5PEQpLCCnI');
    /* *** USED IN PRODUCTION *** */
    headers.append('Authorization', this.TOKEN);

    return this.http
      .get(url, { headers })
      .map((response) => response.text());
    // .map((response) => JSON.stringify(response.text()));
  }


  // ******* HISTORY *******
  public getNodeJsHistoryRequests(querystring: string, pagenumber: number) {
    let _querystring = '&' + querystring
    if (querystring === undefined || !querystring) {
      _querystring = ''
    }
    /* *** USED TO TEST IN LOCALHOST (note: this service doen't work in localhost) *** */
    // const url = 'https://api.tiledesk.com/v1/' + '5af02d8f705ac600147f0cbb' + '/requests?status=1000' + _querystring + '&page=' + pagenumber;
    /* *** USED IN PRODUCTION *** */
    const url = this.SERVER_BASE_PATH + this.project._id + '/requests?status=1000' + _querystring + '&page=' + pagenumber;

    console.log('!!! NEW REQUESTS HISTORY - REQUESTS SERVICE URL ', url);

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    /* *** USED TO TEST IN LOCALHOST (note: this service doesn't work in localhost) *** */
    // headers.append('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWM3NTIxNzg3ZjZiNTAwMTRlMGI1OTIiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJlbWFpbHZlcmlmaWVkIjoiaW5pdCIsImxhc3RuYW1lIjoiaW5pdCIsImZpcnN0bmFtZSI6ImluaXQiLCJfaWQiOiJpbml0In0sInN0YXRlcyI6eyJpZ25vcmUiOnt9LCJkZWZhdWx0Ijp7fSwiaW5pdCI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6dHJ1ZSwiZmlyc3RuYW1lIjp0cnVlLCJwYXNzd29yZCI6dHJ1ZSwiZW1haWwiOnRydWUsIl9pZCI6dHJ1ZX0sIm1vZGlmeSI6e30sInJlcXVpcmUiOnt9fSwic3RhdGVOYW1lcyI6WyJyZXF1aXJlIiwibW9kaWZ5IiwiaW5pdCIsImRlZmF1bHQiLCJpZ25vcmUiXX0sInBhdGhzVG9TY29wZXMiOnt9LCJlbWl0dGVyIjp7Il9ldmVudHMiOnt9LCJfZXZlbnRzQ291bnQiOjAsIl9tYXhMaXN0ZW5lcnMiOjB9LCIkb3B0aW9ucyI6dHJ1ZX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJlbWFpbHZlcmlmaWVkIjp0cnVlLCJsYXN0bmFtZSI6IkxhbnppbG90dG8iLCJmaXJzdG5hbWUiOiJOaWNvIiwicGFzc3dvcmQiOiIkMmEkMTAkTlBoSk5VNVZDYlU2d05idG1Jck5lT3MxR0dBSW5rMERMeGVYWXN2dklHZ1JnY1dMWW1kYkciLCJlbWFpbCI6Im5pY29sYS5sYW56aWxvdHRvQGZyb250aWVyZTIxLml0IiwiX2lkIjoiNWFjNzUyMTc4N2Y2YjUwMDE0ZTBiNTkyIn0sIiRpbml0Ijp0cnVlLCJpYXQiOjE1NjgzMDg2OTl9.sl2zMzVv__5Gc7Xj6TV1lkzxkqnRVMv7-U3YHBbpq20');
    /* *** USED IN PRODUCTION *** */
    headers.append('Authorization', this.TOKEN);

    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }


  /**
   * moved in contact service
   */

  // public getNodeJsRequestsByRequesterId(requesterid: string, pagenumber: number) {
  //   /* *** USED TO TEST IN LOCALHOST (note: this service doen't work in localhost) *** */
  //   // const url = 'https://api.tiledesk.com/v1/' + '5ba35f0b9acdd40015d350b6' + '/requests?requester_id=' + requesterid + '&page=' + pagenumber;
  //   /* *** USED IN PRODUCTION *** */
  //   const url = this.SERVER_BASE_PATH + this.project._id + '/requests?lead=' + requesterid + '&page=' + pagenumber;

  //   console.log('!!!! CONTACT DETAILS - REQUESTS SERVICE URL ', url);

  //   const headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //   /* *** USED TO TEST IN LOCALHOST (note: this service doesn't work in localhost) *** */
  //   // headers.append('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWFhOTJmZjRjM2IxMTAwMTRiNDc4Y2IiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJsYXN0bmFtZSI6ImluaXQiLCJmaXJzdG5hbWUiOiJpbml0IiwiX2lkIjoiaW5pdCJ9LCJzdGF0ZXMiOnsiaWdub3JlIjp7fSwiZGVmYXVsdCI6e30sImluaXQiOnsibGFzdG5hbWUiOnRydWUsImZpcnN0bmFtZSI6dHJ1ZSwicGFzc3dvcmQiOnRydWUsImVtYWlsIjp0cnVlLCJfaWQiOnRydWV9LCJtb2RpZnkiOnt9LCJyZXF1aXJlIjp7fX0sInN0YXRlTmFtZXMiOlsicmVxdWlyZSIsIm1vZGlmeSIsImluaXQiLCJkZWZhdWx0IiwiaWdub3JlIl19LCJwYXRoc1RvU2NvcGVzIjp7fSwiZW1pdHRlciI6eyJkb21haW4iOm51bGwsIl9ldmVudHMiOnt9LCJfZXZlbnRzQ291bnQiOjAsIl9tYXhMaXN0ZW5lcnMiOjB9LCIkb3B0aW9ucyI6dHJ1ZX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJsYXN0bmFtZSI6IkxhbnppbG90dG8iLCJmaXJzdG5hbWUiOiJOaWNvbGEgNzQiLCJwYXNzd29yZCI6IiQyYSQxMCRwVWdocTVJclgxMzhTOXBEY1pkbG1lcnNjVTdVOXJiNlFKaVliMXlEckljOHJDMFh6c2hUcSIsImVtYWlsIjoibGFuemlsb3R0b25pY29sYTc0QGdtYWlsLmNvbSIsIl9pZCI6IjVhYWE5MmZmNGMzYjExMDAxNGI0NzhjYiJ9LCIkaW5pdCI6dHJ1ZSwiaWF0IjoxNTM4MTIzNTcyfQ.CYnxkLbg5XWk2JWAxQg1QNGDpNgNbZAzs5PEQpLCCnI');
  //   /* *** USED IN PRODUCTION *** */
  //   headers.append('Authorization', this.TOKEN);

  //   return this.http
  //     .get(url, { headers })
  //     .map((response) => response.json());
  // }


  /**
   * was used in requests-msgs.components.ts (commented also here)
   */

  // public getNodeJsRequestByFirebaseRequestId(requestid: string, pagenumber: number) {
  //   /* *** USED TO TEST IN LOCALHOST (note: this service doen't work in localhost) *** */
  //   // const url = 'https://api.tiledesk.com/v1/' + '5ba35f0b9acdd40015d350b6' + '/requests?requester_id=' + requesterid + '&page=' + pagenumber;
  //   /* *** USED IN PRODUCTION *** */
  //   // const url = this.BASE_URL + this.project._id + '/requests?request_id=' + requestid;
  //   const url = this.SERVER_BASE_PATH + this.project._id + '/requests/' + requestid;

  //   console.log('!!!! CONTACT DETAILS - GET NODEJS REQUEST BYSERVICE URL ', url);

  //   const headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //   /* *** USED TO TEST IN LOCALHOST (note: this service doesn't work in localhost) *** */
  //   // headers.append('Authorization', 'JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyIkX18iOnsic3RyaWN0TW9kZSI6dHJ1ZSwic2VsZWN0ZWQiOnsiZW1haWwiOjEsImZpcnN0bmFtZSI6MSwibGFzdG5hbWUiOjEsInBhc3N3b3JkIjoxLCJlbWFpbHZlcmlmaWVkIjoxLCJpZCI6MX0sImdldHRlcnMiOnt9LCJfaWQiOiI1YWFhOTJmZjRjM2IxMTAwMTRiNDc4Y2IiLCJ3YXNQb3B1bGF0ZWQiOmZhbHNlLCJhY3RpdmVQYXRocyI6eyJwYXRocyI6eyJwYXNzd29yZCI6ImluaXQiLCJlbWFpbCI6ImluaXQiLCJsYXN0bmFtZSI6ImluaXQiLCJmaXJzdG5hbWUiOiJpbml0IiwiX2lkIjoiaW5pdCJ9LCJzdGF0ZXMiOnsiaWdub3JlIjp7fSwiZGVmYXVsdCI6e30sImluaXQiOnsibGFzdG5hbWUiOnRydWUsImZpcnN0bmFtZSI6dHJ1ZSwicGFzc3dvcmQiOnRydWUsImVtYWlsIjp0cnVlLCJfaWQiOnRydWV9LCJtb2RpZnkiOnt9LCJyZXF1aXJlIjp7fX0sInN0YXRlTmFtZXMiOlsicmVxdWlyZSIsIm1vZGlmeSIsImluaXQiLCJkZWZhdWx0IiwiaWdub3JlIl19LCJwYXRoc1RvU2NvcGVzIjp7fSwiZW1pdHRlciI6eyJkb21haW4iOm51bGwsIl9ldmVudHMiOnt9LCJfZXZlbnRzQ291bnQiOjAsIl9tYXhMaXN0ZW5lcnMiOjB9LCIkb3B0aW9ucyI6dHJ1ZX0sImlzTmV3IjpmYWxzZSwiX2RvYyI6eyJsYXN0bmFtZSI6IkxhbnppbG90dG8iLCJmaXJzdG5hbWUiOiJOaWNvbGEgNzQiLCJwYXNzd29yZCI6IiQyYSQxMCRwVWdocTVJclgxMzhTOXBEY1pkbG1lcnNjVTdVOXJiNlFKaVliMXlEckljOHJDMFh6c2hUcSIsImVtYWlsIjoibGFuemlsb3R0b25pY29sYTc0QGdtYWlsLmNvbSIsIl9pZCI6IjVhYWE5MmZmNGMzYjExMDAxNGI0NzhjYiJ9LCIkaW5pdCI6dHJ1ZSwiaWF0IjoxNTM4MTIzNTcyfQ.CYnxkLbg5XWk2JWAxQg1QNGDpNgNbZAzs5PEQpLCCnI');
  //   /* *** USED IN PRODUCTION *** */
  //   headers.append('Authorization', this.TOKEN);

  //   return this.http
  //     .get(url, { headers })
  //     .map((response) => response.json());
  // }

}
