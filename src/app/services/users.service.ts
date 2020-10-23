import { Injectable } from '@angular/core';

// import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';

import { User } from '../models/user-model';
import { Activity } from '../models/activity-model';
import { PendingInvitation } from '../models/pending-invitation-model';
import { ProjectUser } from '../models/project-user';

import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

import { AuthService } from '../core/auth.service';
import { Http, Headers, RequestOptions } from '@angular/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as firebase from 'firebase/app';

import { LocalDbService } from '../services/users-local-db.service';
import { Router } from '@angular/router';
import { Project } from '../models/project-model';
import { FaqKbService } from '../services/faq-kb.service';
import { BotLocalDbService } from '../services/bot-local-db.service';
import { AppConfigService } from '../services/app-config.service';
import { WebSocketJs } from "../services/websocket/websocket-js";

interface NewUser {
  displayName: string;
  email: string;
  time: number;
}

@Injectable()
export class UsersService {

  wsService: WebSocketJs;
  public user_is_available_bs: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public user_is_busy$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public project_user_id_bs: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public project_user_role_bs: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public has_changed_availability_in_sidebar: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public has_changed_availability_in_users: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public userProfileImageExist: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public currentUserWsAvailability$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public currentUserWsIsBusy$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public currentUserWsBusyAndAvailabilityForProject$: BehaviorSubject<[]> = new BehaviorSubject<[]>([]);
  public contactsEvents$: BehaviorSubject<[]> = new BehaviorSubject<[]>([]);
  
  public storageBucket$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  // public has_clicked_logoutfrom_mobile_sidebar: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // public has_clicked_logoutfrom_mobile_sidebar_project_undefined: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  http: Http;

  // BASE_URL = environment.mongoDbConfig.BASE_URL; // replaced with SERVER_BASE_PATH
  // PROJECT_BASE_URL = environment.mongoDbConfig.PROJECTS_BASE_URL; // moved
  // UPDATE_USER_URL = environment.mongoDbConfig.UPDATE_USER_LASTNAME_FIRSTNAME; // moved
  // CHANGE_PSW_URL = environment.mongoDbConfig.CHANGE_PSW; // moved
  // RESEND_VERIFY_EMAIL = environment.mongoDbConfig.RESEND_VERIFY_EMAIL; // moved

  // SERVER_BASE_PATH = environment.SERVER_BASE_URL; // now get from appconfig
  // PROJECTS_URL = this.SERVER_BASE_PATH + 'projects/' // now built after get SERVER_BASE_PATH from appconfig
  // UPDATE_USER_URL = this.SERVER_BASE_PATH + 'users/' // now built after get SERVER_BASE_PATH from appconfig
  // CHANGE_PSW_URL = this.SERVER_BASE_PATH + 'users/changepsw/'; // now built after get SERVER_BASE_PATH from appconfig
  // RESEND_VERIFY_EMAIL = this.SERVER_BASE_PATH + 'users/resendverifyemail/'; // now built after get SERVER_BASE_PATH from appconfig

  SERVER_BASE_PATH: string;
  PROJECTS_URL: string;
  UPDATE_USER_URL: string;
  CHANGE_PSW_URL: string;
  RESEND_VERIFY_EMAIL: string;

  AVAILABLE_USERS_URL: any;
  // NEW_AVAILABLE_USERS_URL: any; // NO MORE USED
  USERS_ACTIVITIES_URL: any;
  // CLOUD_FUNC_UPDATE_USER_URL: any; // NO MORE USED 
  PROJECT_USER_URL: any;
  INVITE_USER_URL: any;
  PENDING_INVITATION_URL: string;

  // http://localhost:3000/users/updateuser/'
  // CLOUD_FUNC_UPDATE_USER_URL = environment.cloudFunctions.cloud_func_update_firstname_and_lastname;
  // MONGODB_BASE_URL: any;
  // PROJECT_USER_DTLS_URL: any;
  // GET_PROJECT_USER_URL: any;

  TOKEN: string
  user: any;
  orderBy_field: any;
  orderBy_direction: any;

  // usersCollection: AngularFirestoreCollection<User>;
  // userDocument: AngularFirestoreDocument<Node>;
  // searchUserCollection: AngularFirestoreCollection<User>;

  project: any;
  currentUserId: string;
  project_id: string;
  project_name: string;
  storageBucket: string;
  eventlist: any;
  constructor(
    http: Http,
    // private afs: AngularFirestore,
    private auth: AuthService,
    private usersLocalDbService: LocalDbService,
    private router: Router,
    private faqKbService: FaqKbService,
    private botLocalDbService: BotLocalDbService,
    public appConfigService: AppConfigService,
    public webSocketJs: WebSocketJs
  ) {
    // this.usersCollection = this.afs.collection('users', (ref) => ref.orderBy('time', 'desc').limit(5));
    // this.searchUserCollection = this.afs.collection('users', (ref) => ref.where('displayName', '>=', 'B'));

    this.http = http;
    // SUBSCRIBE TO USER BS
    this.user = auth.user_bs.value
    console.log('++ ++++ 1. USER SERVICE User', this.user)
    this.checkUser()

    this.auth.user_bs.subscribe((user) => {
      this.user = user;
      console.log('++ ++++ 2. USER SERVICE User', this.user)
      this.checkUser()
    });

    this.getAppConfigAndBuildUrl();
    this.getCurrentProject();
  }




  // public sumUpAuth() {
  //   const headers = new Headers();
  //   headers.append('Accept', 'application/json');
  //   headers.append('Content-type', 'application/x-www-form-urlencoded');
  //   // headers.append(' Authorization': 'Basic ' + btoa('yourClientId' + ':' + 'yourClientSecret')');


  //   const options = new RequestOptions({ headers });

  //   // , 'id_project': this.project_id, 'project_name': this.project_name
  //   const body =  {
  //     "grant_type": "password",
  //     "client_id": "mNQskKOqbZ0VL0NmI9hk30gDjzTX",
  //     "username": "lorenzo@prinzsrl.it",
  //     "password": "PosPrinz$20"
  //   }

  //   console.log('POST INVITE USER - REQUEST BODY ', body);

  //   const url = 'https://api.sumup.com/token';

  //   return this.http
  //     .post(url, JSON.stringify(body), options)
  //     .map((res) => res.json());

  // }

  getAppConfigAndBuildUrl() {

    // const firebase_conf = this.appConfigService.getConfig().firebase;
    // const cloudBaseUrl = firebase_conf['chat21ApiUrl']
    // this.CLOUD_FUNC_UPDATE_USER_URL = cloudBaseUrl + '/api/tilechat/contacts/me';  // NO MORE USED

    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    console.log('AppConfigService getAppConfig (USERS SERV.) SERVER_BASE_PATH ', this.SERVER_BASE_PATH);
    this.PROJECTS_URL = this.SERVER_BASE_PATH + 'projects/';
    this.UPDATE_USER_URL = this.SERVER_BASE_PATH + 'users/';
    this.CHANGE_PSW_URL = this.SERVER_BASE_PATH + 'users/changepsw/';
    this.RESEND_VERIFY_EMAIL = this.SERVER_BASE_PATH + 'users/resendverifyemail/';

    console.log('AppConfigService getAppConfig (USERS SERV.) PROJECTS_URL (built with SERVER_BASE_PATH) ', this.PROJECTS_URL);
    console.log('AppConfigService getAppConfig (USERS SERV.) UPDATE_USER_URL (built with SERVER_BASE_PATH) ', this.UPDATE_USER_URL);
    console.log('AppConfigService getAppConfig (USERS SERV.) CHANGE_PSW_URL (built with SERVER_BASE_PATH) ', this.CHANGE_PSW_URL);
    console.log('AppConfigService getAppConfig (USERS SERV.) RESEND_VERIFY_EMAIL (built with SERVER_BASE_PATH) ', this.RESEND_VERIFY_EMAIL);
  }

  getCurrentProject() {
    console.log('============ USER SERVICE - SUBSCRIBE TO CURRENT PROJ ============')
    // tslint:disable-next-line:no-debugger
    // debugger
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      // tslint:disable-next-line:no-debugger
      // debugger
      if (this.project) {
        this.project_id = this.project._id;
        this.project_name = this.project.name;
        console.log('-- -- >>>> 00 -> USERS SERVICE project ID from AUTH service subscription  ', this.project._id);
        // this.MONGODB_BASE_URL = this.SERVER_BASE_PATH + this.project._id + '/project_users/';

        this.PROJECT_USER_URL = this.SERVER_BASE_PATH + this.project._id + '/project_users/';

        this.INVITE_USER_URL = this.SERVER_BASE_PATH + this.project._id + '/project_users/invite';
        this.PENDING_INVITATION_URL = this.SERVER_BASE_PATH + this.project._id + '/pendinginvitations';
        this.AVAILABLE_USERS_URL = this.PROJECTS_URL + this.project._id + '/users/availables';
        // this.NEW_AVAILABLE_USERS_URL = this.PROJECTS_URL + this.project._id + '/users/availables';
        this.USERS_ACTIVITIES_URL = this.SERVER_BASE_PATH + this.project._id + '/activities';

        console.log('AppConfigService getAppConfig (USERS SERV.) PROJECT_USER_URL (built with SERVER_BASE_PATH) ', this.PROJECT_USER_URL);
        console.log('AppConfigService getAppConfig (USERS SERV.) INVITE_USER_URL (built with SERVER_BASE_PATH) ', this.INVITE_USER_URL);
        console.log('AppConfigService getAppConfig (USERS SERV.) PENDING_INVITATION_URL (built with SERVER_BASE_PATH) ', this.PENDING_INVITATION_URL);
        console.log('AppConfigService getAppConfig (USERS SERV.) AVAILABLE_USERS_URL (built with SERVER_BASE_PATH) ', this.AVAILABLE_USERS_URL);
        // console.log('AppConfigService getAppConfig (USERS SERV.) NEW_AVAILABLE_USERS_URL (built with SERVER_BASE_PATH) ', this.NEW_AVAILABLE_USERS_URL);
        console.log('AppConfigService getAppConfig (USERS SERV.) USERS_ACTIVITIES_URL (built with SERVER_BASE_PATH) ', this.USERS_ACTIVITIES_URL);

        // PROJECT-USER BY PROJECT ID AND CURRENT USER ID
        // this.PROJECT_USER_URL = this.BASE_URL + this.project._id + '/project_users/'

        // MAYBE NOT USED anymore
        // this.PROJECT_USER_DTLS_URL = this.SERVER_BASE_PATH + this.project._id + '/member/';
      }
    });
  }

  checkUser() {
    if (this.user) {
      this.TOKEN = this.user.token
      this.currentUserId = this.user._id

      const storageBucket = this.getStorageBucket();
      console.log('STORAGE-BUCKET Users service ', storageBucket)

      if (storageBucket) {

        this.storageBucket$.next(storageBucket)


        this.verifyUserProfileImageOnFirebaseStorage(this.currentUserId, storageBucket);
      }

      // this.getToken();
      // this.verifyUserProfileImageOnFirebaseStorage(this.currentUserId);
    } else {
      console.log('No user is signed in');
    }
  }

  getStorageBucket() {
    const firebase_conf = this.appConfigService.getConfig().firebase;

    // console.log('STORAGE-BUCKET Users service ', this.storageBucket)
    return this.storageBucket = firebase_conf['storageBucket'];

  }


  verifyUserProfileImageOnFirebaseStorage(user_id, storageBucket) {
    // tslint:disable-next-line:max-line-length
    // const url = 'https://firebasestorage.googleapis.com/v0/b/{{storageBucket}}/o/profiles%2F' + user_id + '%2Fphoto.jpg?alt=media';
    const url = 'https://firebasestorage.googleapis.com/v0/b/' + storageBucket + '/o/profiles%2F' + user_id + '%2Fphoto.jpg?alt=media';
    const self = this;
    this.verifyImageURL(url, function (imageExists) {

      if (imageExists === true) {
        // alert('Image Exists');
        console.log('=== === USER-SERV PUBLISH - USER PROFILE IMAGE EXIST ', imageExists)
        self.userProfileImageExist.next(imageExists);
      } else {
        // alert('Image does not Exist');
        console.log('=== === USER-SERV PUBLISH - USER PROFILE IMAGE EXIST ', imageExists)
        // self.userProfileImageExist = false;
        self.userProfileImageExist.next(imageExists);
      }
    });
  }

  verifyImageURL(image_url, callBack) {
    const img = new Image();
    img.src = image_url;
    img.onload = function () {
      callBack(true);
    };
    img.onerror = function () {
      callBack(false);
    };
  }

  // curl -v -X GET -u andrea.leo@frontiere21.it:258456 
  // https://api.tiledesk.com/v1/5ad5bd52c975820014ba900a/activities
  // https://api.tiledesk.com/v1/

  /// ================================== GET USER ACTIVITIES ================================== ///
  public getUsersActivities(querystring: string, pagenumber: number): Observable<Activity[]> {

    let _querystring = '&' + querystring
    if (querystring === undefined || !querystring) {
      _querystring = ''
    }

    const url = this.USERS_ACTIVITIES_URL + '?page=' + pagenumber + _querystring;

    // *** TEST URL  ***
    // const url = 'https://api.tiledesk.com/v1/' + this.project_id + '/activities?page=' + pagenumber;

    console.log('!! USERS ACTIVITIES URL ', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  public downloadActivitiesAsCsv(querystring: string, pagenumber: number, language: string) {

    let _querystring = '&' + querystring
    if (querystring === undefined || !querystring) {
      _querystring = ''
    }

    const url = this.USERS_ACTIVITIES_URL + '/csv' + '?page=' + pagenumber + _querystring + '&lang=' + language;

    console.log('!! USERS ACTIVITIES URL ', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/csv');
    headers.append('Authorization', this.TOKEN);

    return this.http
      .get(url, { headers })
      .map((response) => response.text());

  }


  /**
   * return an observable of ALL FIRESTORE 'users' * WITH * ID
   */
  // getSnapshot(orderBy_field: any, orderBy_direction: any): Observable<User[]> {
  //   // ['added', 'modified', 'removed']

  //   this.orderBy_field = orderBy_field;
  //   this.orderBy_direction = orderBy_direction;

  //   this.usersCollection = this.afs.collection('users', (ref) => ref.orderBy(this.orderBy_field, this.orderBy_direction));
  //   console.log('Hello User Service!');
  //   console.log('COLLECTION ORDERED BY FIELD', this.orderBy_field);
  //   console.log('COLLECTION ORDERED BY DIRECTION', this.orderBy_direction);
  //   return this.usersCollection.snapshotChanges().map((actions) => {
  //     return actions.map((a) => {
  //       const data = a.payload.doc.data() as User;
  //       return { id: a.payload.doc.id, displayName: data.displayName, email: data.email, time: data.time };
  //     });
  //   });
  // }

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


  // this.afs.collection('users');
  // getDataFilter(): Observable<User[]> {
  //   this.searchUserCollection = this.afs.collection('users', (ref) => ref.where('displayName', '>=', 'Kopolla' ));
  //   return this.searchUserCollection.valueChanges();
  // }

  // getUser(id: string) {
  //   return this.afs.doc<User>(`users/${id}`);
  // }

  // deleteUser(id: string) {
  //   return this.getUser(id).delete();
  // }
  /**
   * return an observable of ALL FIRESTORE CHAT-F21 'users' * WITHOUT * ID
   */
  // getData(): Observable<User[]> {
  //   return this.usersCollection.valueChanges();
  // }


  // displayName: string
  // create(displayName: string, email: string) {
  //   const user = {
  //     displayName: `${displayName}`,
  //     email: `${email}`,
  //     time: new Date().getTime(),
  //   };
  //   return this.usersCollection.add(user);
  //   // return this.usersCollection.doc('PXmRJVrtzFAHsxjs7voD5R').set(user);
  // }


  /**
   * !!!! NOT YET USED
   * Get Name Surname and id of the logged user
   */
  public getCurrentUserProfile(): Observable<User[]> {
    // const url = this.BASE_URL + 'users/' + user_id;
    const url = this.SERVER_BASE_PATH + 'users';
    // const url = this.BASE_URL + 'project_users/users/' + user_id;

    console.log('!! GET USERS BY ID - URL', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  // ---------------------------------------------------------
  // Delete user account 
  // ---------------------------------------------------------
  public deleteUserAccount() {
    const url = this.SERVER_BASE_PATH + 'users';
    console.log('DELETE ACCOUNT URL ', url);
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });
    return this.http
      .delete(url, options)
      .map((res) => res.json());
  }



  /// ================================== GET USER BY ID ================================== ///

  // DONE- WORKS - NK-TO-TEST - questo va sostituito con /project_users/users/:user_id',
  public getProjectUserById(user_id): Observable<User[]> {
    // const url = this.BASE_URL + 'users/' + user_id; 
    const url = this.SERVER_BASE_PATH + this.project._id + '/project_users/users/' + user_id;;


    console.log('!! GET USERS BY ID - URL', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  /// ================================== ALL PROJECT-USER FROM MONGO DB ================================== ///
  /**
   * NOTE: the PROJECT-USER returned has nested the user's object
   */
  // DONE - WORKS NK-TO-TEST - da testare dopo che L. esegue il commit del servizio aggiornato (is used to get the list of users in "Users & Groups")
  public getProjectUsersByProjectId(): Observable<ProjectUser[]> {
    const url = this.PROJECT_USER_URL;

    console.log('!! GET PROJECT USERS BY PROJECT ID - URL', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  public getProjectUsersByProjectId_GuestRole(): Observable<ProjectUser[]> {
    const url = this.PROJECT_USER_URL + '?role=guest&presencestatus=online';

    console.log('»» VISITOR SERV - GET VISITOR - URL', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  /// ================ TEST FUNCTION -- ALL AVAILABLE PROJECT-USER (OF CURRENT PROJECT) ====================== ///
  public getAvailableProjectUsersByProjectId(): Observable<ProjectUser[]> {
    // const url = this.MONGODB_BASE_URL + 'availables';
    const url = this.AVAILABLE_USERS_URL;
    console.log('»»»» »»»» PROJECT USERS AVAILABLE URL', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  /* // ================ TEST FUNCTION -- ALL AVAILABLE PROJECT-USER (OF CURRENT PROJECT)
  ALSO CONSIDERING OPERATING HOURS ====================== */
  public getAvailableProjectUsersConsideringOperatingHours(): Observable<ProjectUser[]> {
    // const url = this.MONGODB_BASE_URL + 'availables';
    const url = this.AVAILABLE_USERS_URL;
    console.log('»»»» »»»» PROJECT USERS NEW AVAILABLE URL', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  /// ================================== INVITE USER (ALIAS CREATE A MEMBER) ================================== ///
  // DONE - WORKS NK-TO-TEST - da testare dopo che L. esegue il commit del servizio aggiornato (può falo solo l'admin)
  public inviteUser(email: string, role: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    // , 'id_project': this.project_id, 'project_name': this.project_name
    const body = { 'email': email, 'role': role, 'user_available': false };

    console.log('POST INVITE USER - REQUEST BODY ', body);

    const url = this.INVITE_USER_URL;

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }

  /// ================================== GET PENDING USERS ================================== ///
  public getPendingUsers(): Observable<PendingInvitation[]> {
    const url = this.PENDING_INVITATION_URL;

    console.log('GET PENDING USERS ', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    // console.log('TOKEN TO COPY ', this.TOKEN)
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  /// ================================== GET PENDING USERS ================================== ///
  public deletePendingInvitation(pendingInvitationId): Observable<PendingInvitation[]> {
    const url = this.PENDING_INVITATION_URL + '/' + pendingInvitationId;
    console.log('DELETE PENDING INVITATION URL ', url);
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });
    return this.http
      .delete(url, options)
      .map((res) => res.json());
  }

  /// ================================== RESEND EMAIL TO PENDING USERS ================================== ///
  public getPendingUsersByIdAndResendEmail(pendingInvitationId): Observable<PendingInvitation[]> {
    const url = this.PENDING_INVITATION_URL + '/resendinvite/' + pendingInvitationId;

    console.log('GET PENDING USERS ', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    // console.log('TOKEN TO COPY ', this.TOKEN)
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  /// ================================== GET PENDING USER BY ID ================================== ///
  public getPendingUsersById(pendingInvitationId): Observable<PendingInvitation[]> {
    // const url = this.PENDING_INVITATION_URL + '/' + pendingInvitationId;
    const url = this.SERVER_BASE_PATH + 'auth/pendinginvitationsnoauth/' + pendingInvitationId;
    console.log('GET PENDING USER BY ID URL', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    // console.log('TOKEN TO COPY ', this.TOKEN)
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  // public getProjectUserByUser_AllProjects(project_id: string, user_id: string): Observable<ProjectUser[]> {


  //   const url = this.SERVER_BASE_PATH + project_id + '/project_users/users/' + user_id;
  //   console.log('GET PROJECT USERS BY PROJECT-ID & CURRENT-USER-ID (All Projects) URL', url);
  //   const headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //   headers.append('Authorization', this.TOKEN);
  //   // console.log('TOKEN TO COPY ', this.TOKEN)
  //   return this.http
  //     .get(url, { headers })
  //     .map((response) => response.json());
  // }



  /// ============================= GET PROJECT-USER BY CURRENT-PROJECT-ID AND CURRENT-USER-ID ============================= ///
  public getProjectUserByUserId(user_id: string): Observable<ProjectUser[]> {
    // const url = this.MONGODB_BASE_URL + user_id + '/' + project_id; 
    const url = this.PROJECT_USER_URL + 'users/' + user_id;


    console.log('GET PROJECT USERS BY PROJECT-ID & CURRENT-USER-ID URL', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    // console.log('TOKEN TO COPY ', this.TOKEN)
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  /// ======================== GET PROJECT-USER ROLE BY CURRENT-PROJECT-ID AND CURRENT-USER-ID To PROMISE ===================== ///
  // !! NOT USED  (to use with AdminGuard)
  // public getUserRole(user_id: string, project_id: string): Promise<ProjectUser[]> {
  //   const url = this.MONGODB_BASE_URL + user_id + '/' + project_id;

  //   console.log('GET PROJECT USERS BY PROJECT-ID & CURRENT-USER-ID URL', url);
  //   const headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //   headers.append('Authorization', this.TOKEN);
  //   // console.log('TOKEN TO COPY ', this.TOKEN)

  //   return this.http
  //     .get(url, { headers })
  //     .toPromise()
  //     .then(response => {
  //       console.log('»> »> !!! »»» USER SERVICE - GET USER ROLE RESPONSE ', response.json());
  //       return 'nicol';
  //     })
  //     .catch(err => err);
  // }
  // end To PROMISE

  /// ========================= GET PROJECT-USER BY ID (PROJECT USER DETAIL) ======================= ///
  public getProjectUsersById(projectuser_id: string): Observable<ProjectUser[]> {
    // const url = this.MONGODB_BASE_URL + 'details/' + projectuser_id; // old
    const url = this.PROJECT_USER_URL + '/' + projectuser_id;

    console.log('GET PROJECT USERS BY ID ', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    // console.log('TOKEN TO COPY ', this.TOKEN)
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  // NEW - 22 AGO - DA SOSTITUIRE A getProjectUser() USATO COMPONENTI SIDEBAR AND HOME
  getProjectUserAvailabilityAndRole() {
    this.getProjectUserByUserId(this.currentUserId).subscribe((projectUser: any) => {
      // console.log('!! USER SERVICE - PROJECT-USER GET BY PROJECT-ID ', this.project_id);
      console.log('!! USER SERVICE - GET BY CURRENT-USER-ID ', this.currentUserId);
      console.log('!! USER SERVICE - PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID ', projectUser);
      console.log('!! USER SERVICE - PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID LENGTH', projectUser.length);
      if ((projectUser) && (projectUser.length !== 0)) {
        console.log('!! USER SERVICE - PROJECT-USER ID ', projectUser[0]._id)
        console.log('!! USER SERVICE - USER IS AVAILABLE ', projectUser[0].user_available)
        // this.user_is_available_bs = projectUser.user_available;

        if (projectUser[0].user_available !== undefined) {
          this.user_availability(projectUser[0]._id, projectUser[0].user_available, projectUser[0].isBusy)
        }

        // ADDED 21 AGO
        if (projectUser[0].role !== undefined) {
          console.log('!! USER SERVICE - CURRENT USER ROLE IN THIS PROJECT ', projectUser[0].role);
          this.user_role(projectUser[0].role);

          // save the user role in storage - then the value is get by auth.service:
          // the user with agent role can not access to the pages under the settings sub-menu
          // this.auth.user_role(projectUser[0].role);

          this.usersLocalDbService.saveUserRoleInStorage(projectUser[0].role);
        }
      } else {
        // this could be the case in which the current user was deleted as a member of the current project
        console.log('!! USER SERVICE - PROJECT-USER UNDEFINED ')
      }

    }, (error) => {
      console.log('!! USER SERVICE - PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID  ', error);
    }, () => {
      console.log('!! USER SERVICE - PROJECT-USER GET BY PROJECT ID & CURRENT-USER-ID  * COMPLETE *');
    });
  }

  // NEW 22 AGO - GET AND SAVE ALL USERS OF CURRENT PROJECT IN LOCAL STORAGE
  getAllUsersOfCurrentProjectAndSaveInStorage() {
    console.log('!! USER SERVICE  - PROJECT-USERS FILTERED FOR PROJECT ID ', this.project_id);

    this.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      console.log('!! USER SERVICE  - PROJECT-USERS (FILTERED FOR PROJECT ID ', this.project_id, ')', projectUsers);

      if (projectUsers) {
        projectUsers.forEach(projectUser => {
          if (projectUser && projectUser !== null) {
            if (projectUser.id_user) {
              console.log('!! USER SERVICE  - PROJECT-USERS - USER ', projectUser.id_user, projectUser.id_user._id)

              // localStorage.setItem(projectUser.id_user._id, JSON.stringify(projectUser.id_user));
              this.usersLocalDbService.saveMembersInStorage(projectUser.id_user._id, projectUser.id_user);
            }
          }
        });
      }
      // localStorage.setItem('project', JSON.stringify(project));
      //   this.showSpinner = false;
      //   this.projectUsersList = projectUsers;
    }, error => {
      // this.showSpinner = false;
      console.log('!! USER SERVICE - PROJECT-USERS (FILTERED FOR PROJECT ID) - ERROR', error);
    }, () => {
      console.log('!! USER SERVICE - PROJECT-USERS (FILTERED FOR PROJECT ID) - COMPLETE')
    });
  }

  // GET AND SAVE ALL BOTS OF CURRENT PROJECT IN LOCAL STORAGE
  getBotsByProjectIdAndSaveInStorage() {
    this.faqKbService.getFaqKbByProjectId().subscribe((bots: any) => {

      if (bots && bots !== null) {

        bots.forEach(bot => {
          console.log('!! USER SERVICE - FAQs-KB (i.e. BOT) GET BY PROJECT ID', bot);
          console.log('!! USER SERVICE - FAQs-KB ID (i.e. BOT) GET BY PROJECT ID', bot._id);
          this.botLocalDbService.saveBotsInStorage(bot._id, bot);
        });

      }
    }, (error) => {
      console.log('!! USER SERVICE - GET FAQs-KB (i.e. BOT) - ERROR ', error);
    }, () => {
      console.log('!! USER SERVICE - GET FAQs-KB * COMPLETE');

    });

  }


  // -----------------------------------------------------------------------------------------------------
  // Project User ID, Availability; Busy - PUBLISH projectUser_id, user_available, isBusy
  // -----------------------------------------------------------------------------------------------------
  // NOTE: THE projectUser_id AND user_available ARE PASSED FROM HOME.COMPONENT and from SIDEBAR.COMP
  public user_availability(projectUser_id: string, user_available: boolean, user_isbusy: boolean) {
    console.log('!!! USER SERVICE - PROJECT-USER-ID ', projectUser_id);
    console.log('!!! USER SERVICE - USER AVAILABLE ', user_available);
    console.log('!!! USER SERVICE - USER IS BUSY ', user_isbusy);

    this.project_user_id_bs.next(projectUser_id);
    this.user_is_available_bs.next(user_available);
    this.user_is_busy$.next(user_isbusy);
  }


  // -----------------------------------------------------------------------------------------------------
  // Availability - PUBLISH WHEN THE SIDEBAR AVAILABLE / UNAVAILABLE BUTTON IS CLICKED
  // -----------------------------------------------------------------------------------------------------
  // NOTE: USER COMP SUBSCRIBES TO has_changed_availability TO RE-RUN getAllUsersOfCurrentProject
  // WITCH UPDATE THE LIST OF THE PROJECT' MEMBER
  public availability_btn_clicked(clicked: boolean) {
    this.has_changed_availability_in_sidebar.next(clicked)
  }


  // -----------------------------------------------------------------------------------------------------
  // Availability - PUBLISH WHEN THE USERS-COMP AVAILABLE / UNAVAILABLE Toggle Switch BTN IS CLICKED
  // -----------------------------------------------------------------------------------------------------
  // NOTE: SIDEBAR SUBSCRIBES TO has_changed_availability TO RE-RUN getAllUsersOfCurrentProject
  // WITCH UPDATE THE LIST OF THE PROJECT' MEMBER
  public availability_switch_clicked(clicked: boolean) {
    this.has_changed_availability_in_users.next(clicked)

  }


  // -----------------------------------------------------------------------------------------------------
  // Availability - subscribe to WS Current user availability
  // -----------------------------------------------------------------------------------------------------
  subscriptionToWsCurrentUser_allProject(projectid, prjctuserid) {
    var self = this;

    console.log('PROJECT COMP (user-service) SUBSCR TO WS CURRENT USERS projectid: ', projectid, ' prjctuserid: ', prjctuserid);
    const path = '/' + projectid + '/project_users/' + prjctuserid
    
    return new Promise(function (resolve, reject) {

      self.webSocketJs.ref(path, function (data, notification) {
        // console.log("SB >>> user-service - SUBSCR To CURRENT-USER AVAILABILITY - CREATE - data ", data , ' path ', path);
        // console.log("PROJECT COMP (user-service) SUBSCR TO WS CURRENT USERS - CREATE - data ", data);
        // console.log("PROJECT COMP (user-service) SUBSCR TO WS CURRENT USERS - CREATE - data  user_available ", data.user_available);
        // console.log("PROJECT COMP (user-service) SUBSCR TO WS CURRENT USERS - CREATE - data  isBusy ", data.isBusy);

        resolve(data)
        // self.currentUserWsAvailability$.next(data.user_available);
        self.currentUserWsBusyAndAvailabilityForProject$.next(data)
        
      }, function (data, notification) {
        resolve(data)
        console.log("PROJECT COMP (user-service) SUBSCR TO WS CURRENT USERS - UPDATE - data ", data);


      }, function (data, notification) {
        resolve(data)
        if (data) {
          console.log("PROJECT COMP (user-service) SUBSCR TO WS CURRENT USERS - ON-DATA - data", data);

        }
      });

    })
  }


    // -----------------------------------------------------------------------------------------------------
  // Contact Events
  // -----------------------------------------------------------------------------------------------------
  subscriptionToWsContactEvents(projectid, leadid) {
    
    var self = this;
    self.eventlist = []
    console.log('EVENTS SERV (user-service) SUBSCR TO WS CONTACT EVENTS projectid: ', projectid, ' prjctuserid: ', leadid);
    const path = '/' + projectid + '/events/' + leadid
    
    return new Promise(function (resolve, reject) {

      self.webSocketJs.ref(path, function (data, notification) {
        console.log('EVENTS SERV (user-service) SUBSCR TO WS CONTACT EVENTS data: ', data);
        // console.log("PROJECT COMP (user-service) SUBSCR TO WS CURRENT USERS - CREATE - data ", data);
        // console.log("PROJECT COMP (user-service) SUBSCR TO WS CURRENT USERS - CREATE - data  user_available ", data.user_available);
        // console.log("PROJECT COMP (user-service) SUBSCR TO WS CURRENT USERS - CREATE - data  isBusy ", data.isBusy);

       
        const index = self.eventlist.findIndex((e) => e._id === data._id);
        if (index === -1) {
         
          
          console.log("EVENTS SERV (user-service) SUBSCR TO WS CONTACT EVENTS CREATE the event not exist - ADD");
          self.eventlist.push(data)

          self.contactsEvents$.next(self.eventlist)
        }

        // resolve(data)
        // self.currentUserWsAvailability$.next(data.user_available);
        
        
      }, function (data, notification) {
        resolve(data)
        console.log("EVENTS SERV (user-service) SUBSCR TO WS CONTACT EVENTS - UPDATE - data ", data);


      }, function (data, notification) {
        resolve(data)
        if (data) {
          console.log("EVENTS SERV (user-service) SUBSCR TO WS CONTACT EVENTS - ON-DATA - data", data);

        }
      });

    })
  }


  unsubsToWS_CurrentUser_allProject(projectid, prjctuserid) {
    this.webSocketJs.unsubscribe('/' + projectid + '/project_users/' + prjctuserid);
    console.log("PROJECT COMP (user-service) UN-SUBSCR TO WS CURRENT USERS  projectid: ", projectid, ' prjctuserid:', prjctuserid);
  }


  // -----------------------------------------------------------------------------------------------------
  // Availability - subscribe to WS Current user availability
  // -----------------------------------------------------------------------------------------------------
  subscriptionToWsCurrentUser(prjctuserid) {
    var self = this;

    console.log('% »»» WebSocketJs WF >>> ws-msgs--- m-service - SUBSCR To WS MSGS ****** CALLING REF ****** ');
    const path = '/' + this.project_id + '/project_users/' + prjctuserid

    this.webSocketJs.ref(path,
      function (data, notification) {
        // console.log("SB >>> user-service - SUBSCR To CURRENT-USER AVAILABILITY - CREATE - data ", data , ' path ', path);
        console.log("NAVBAR-FOR-PANEL & SB >>> user-service - SUBSCR To CURRENT-USER AVAILABILITY - CREATE - data ", data);
        console.log("NAVBAR-FOR-PANEL & SB >>> user-service - SUBSCR To CURRENT-USER AVAILABILITY - CREATE - data  user_available ", data.user_available);

        self.currentUserWsAvailability$.next(data.user_available);
        if (data.isBusy) {
          self.currentUserWsIsBusy$.next(data.isBusy)
        } else {
          self.currentUserWsIsBusy$.next(false)
        }
        self.availability_btn_clicked(true)

      }, function (data, notification) {
        console.log("SB >>> user-service - SUBSCR To CURRENT-USER AVAILABILITY - UPDATE - data ", data);

      }, function (data, notification) {
        if (data) {
          console.log("SB >>> user-service - SUBSCR To CURRENT-USER AVAILABILITY - ON-DATA - data", data);

        }
      }
    );
  }


  unsubscriptionToWsCurrentUser(prjctuserid) {
    this.webSocketJs.unsubscribe('/' + this.project_id + '/project_users/' + prjctuserid);
    console.log("NAVBAR-FOR-PANEL - UN-SUBSCR TO WS CURRENT USERS  projectid: ", this.project_id, ' prjctuserid:', prjctuserid);
  }



  // ===================  PUBLISH PROJECT-USER ROLE AND CHECK THE ROLE (FOR THE CURRENT PROJECT) SAVED IN THE STORAGE ======================
  // NOTE: THE projectUser_role IS PASSED FROM HOME.COMPONENT AND FROM SIDEBAR
  // NOTE: IF THE USER ROLE STORED NOT MATCHES THE USER ROLE PUBLISHED IS RESER IN THE STORAGE YìTJE JSON PROJECT UPDATED WITH THE NEW ROLE
  public user_role(projectUser_role: string) {
    console.log('!! »»»»» USER SERVICE PUBLISH THE USER-ROLE  >>', projectUser_role, '<< FOR THE PROJECT ID ', this.project_id);

    // PUBLISH THE USER ROLE
    this.project_user_role_bs.next(projectUser_role);

    // COMPARE THE STORED ROLE WITH THE USER ROLE PUBLISHED
    const storedProjectJson = localStorage.getItem(this.project_id);
    if (storedProjectJson) {
      const projectObject = JSON.parse(storedProjectJson);
      const storedUserRole = projectObject['role'];
      const storedProjectName = projectObject['name'];
      const storedProjectId = projectObject['_id'];
      const storedProjectOH = projectObject['operatingHours'];
      console.log('!! »»»»» USER SERVICE USER ROLE FROM STORAGE >>', storedUserRole, '<<');
      console.log('!! »»»»» USER SERVICE PROJECT NAME FROM STORAGE ', storedProjectName);
      console.log('!! »»»»» USER SERVICE PROJECT ID FROM STORAGE ', storedProjectId);

      if (storedUserRole !== projectUser_role) {
        console.log('!! »»»»» USER SERVICE - USER ROLE STORED !!! NOT MATCHES USER ROLE PUBLISHED - RESET PROJECT IN STORAGE ');

        const projectForStorage: Project = {
          _id: storedProjectId,
          name: storedProjectName,
          role: projectUser_role,
          operatingHours: storedProjectOH
        }

        // RE-SET THE PROJECT IN THE STORAGE WITH THE UPDATED ROLE
        localStorage.setItem(storedProjectId, JSON.stringify(projectForStorage));

      }
    }

  }


  // ====================== (WHEN PROJEC IS DEFINED) IS PASSED FROM THE SIDEBAR COMP  > nav-mobile-menu WHEN IS CLICKED THE LOGOUT BTN IN IT
  // THE NAVBAR SUBISCIBE THE EVENT SO WILL BE OPEN THE LOGOUT MODAL THAT IS IN THE NAVBAR COMPONENT AND NO MORE THE LOG
  // LOGOUT MODAL IN THE SIDEBAR COMP ======================
  // public logout_btn_clicked_from_mobile_sidebar(clicked: boolean) {
  //   this.has_clicked_logoutfrom_mobile_sidebar.next(clicked)
  //   console.log('USER-SERVICE: - HAS CLICKED LOGOUT IN THE SIDEBAR (prjct defined) ')
  // }

  // public logout_btn_clicked_from_mobile_sidebar_project_undefined(clicked: boolean) {
  //   this.has_clicked_logoutfrom_mobile_sidebar_project_undefined.next(clicked)
  //   console.log('USER-SERVICE: - HAS CLICKED LOGOUT IN THE SIDEBAR (prjct undefined)')
  // }


  /* used by admin.guard (for the moment not used) */
  // checkRole() {
  //   let result: boolean
  //   this.project_user_role_bs.subscribe((user_role) => {
  //     if (user_role) {
  //       if (user_role !== 'agent') {
  //         console.log('»> »> !!! »»» USERS SERV - CHECK ROLE (FROM SUBSCRIPTION) »»» ', user_role);

  //         result = true
  //         // this.router.navigate(['/unauthorized']);
  //         // || user_role === undefined
  //       } else if (user_role === 'agent' || user_role === undefined) {
  //         console.log('»> »> !!! »»» USERS SERV - CHECK ROLE (GOT SUBSCRIPTION) »»» ', user_role);

  //         result = false
  //       }
  //     }
  //   })
  //   return result
  // }



  /**
   * UPDATE PROJECT-USER AVAILABILITY (PUT)
   */
  // DONE - WORKS NK-TO-TEST - da testare dopo che L. esegue il commit del servizio aggiornato (lo puo fare solo l'admin)
  public updateProjectUser(projectUser_id: string, user_is_available: boolean) {

    let url = this.SERVER_BASE_PATH + this.project._id + '/project_users/' + projectUser_id;

    console.log('PROJECT-USER UPDATE (PUT) URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'user_available': user_is_available };

    console.log('PUT REQUEST BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }

  // DONE - WORKS NK-TO-TEST - da fare e da testare dopo che L. esegue il commit del servizio aggiornato (lo puo fare solo l'admin)
  // this is a service equal to updateProjectUser() in which project User_id was not passed
  // must be implemented for to change the availability status (available / unavailable) of the current user
  public updateCurrentUserAvailability(projectId: string, user_is_available: boolean) {

    // let url = this.MONGODB_BASE_URL;
    let url = this.SERVER_BASE_PATH + projectId + '/project_users/';

    console.log('PROJECT-USER UPDATE (PUT) URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'user_available': user_is_available };

    console.log('PUT REQUEST BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }

  /**
   * UPDATE PROJECT-USER ROLE (PUT) */
  // DONE - WORKS NK-TO-TEST - da testare dopo che L. esegue il commit del servizio aggiornato (lo puo fare solo l'admin)
  public updateProjectUserRoleAndMaxchat(projectUser_id: string, user_role: string, max_served_chat: number) {

    let url = this.PROJECT_USER_URL + projectUser_id;
    console.log('PROJECT-USER DETAILS (calling from) - PROJECT-USER UPDATE ROLE & MAX-CHAT (PUT) URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'role': user_role, 'max_served_chat': max_served_chat };

    console.log('PROJECT-USER DETAILS (calling from) - PROJECT-USER UPDATE ROLE & MAX-CHAT BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }

  /**
   * DELETE PROJECT-USER (PUT)  */
  public deleteProjectUser(projectUser_id: string) {
    let url = this.PROJECT_USER_URL;
    url += projectUser_id + '# chat21-api-nodejs';
    console.log('PROJECT-USER DELETE URL ', url);
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    return this.http
      .delete(url, options)
      .map((res) => res.json());

  }

  // ================== UPDATE CURRENT USER LASTNAME / FIRSTNAME ==================
  public updateCurrentUserLastnameFirstname(user_firstname: string, user_lastname: string, callback) {

    // DONE - WORKS NK-TO-TEST - da testare dopo che L. esegue il commit del servizio aggiornato
    // const url = this.UPDATE_USER_URL + this.currentUserId; // old
    const url = this.UPDATE_USER_URL;

    // ERROR TEST WITH A currentUserId that does not exist
    // const url = this.UPDATE_USER_URL + '5ad08846ea181e2e9cc2d20g';

    console.log('UPDATE CURRENT USER (PUT) URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    console.log('»»» »»» UPDATE CURRENT USER - LASTNAME ', user_lastname);

    const body = { 'firstname': user_firstname, 'lastname': user_lastname };

    console.log('»»» »»» UPDATE CURRENT USER - BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .toPromise()
      .then(res => {

        console.log('NODEJS: UPDATED USER RESPONSE: ', res.json())

        const jsonRes = res.json()

        if (jsonRes['success'] === true) {

          callback('success');

          const user: User = jsonRes.updatedUser;

          user.token = this.TOKEN;
          console.log('UPDATED USER + token (before to set in storage) ', user)

          /* REPUBLISH AND RESET IN STORAGE THE (UPDATED) USER */
          // that, when the user logged in, the AUTH SERVICE had published and set in memory)
          // this.user_bs.next(user);
          // localStorage.setItem('user', JSON.stringify(user));

          // SEND THE UPDATED USER OBJECT TO THE AUTH SERVICE THAT:
          // -  PUBLISHES IT AGAIN and
          // -  RESET IT IN LOCAL STORAGE
          this.auth.publishUpdatedUser(user)

          /** 
           * !!!! NO MORE USED
           */
          // chat21-cloud-functions - Update my FirstName and Last Name
          // on firebase Realtime Database
          // this.cloudFunctionsUpdateContact(user_firstname, user_lastname, callback);

        } else {

          callback('error');

        }
      })
      .catch(res => Promise.reject(`my error is: ${res}`))
      .then(res => console.log('good', res),
        err => {
          console.log('* Bad *', err)
          callback('error')
        });
  }

  // cloudFunctionsUpdateContact(updated_firstname: string, updated_lastname: string, callback) {
  //   const self = this;
  //   firebase.auth().currentUser.getIdToken(/* forceRefresh */ true)
  //     .then(function (token) {
  //       console.log('USER SERV - FIREBASE idToken.', token);

  //       const headers = new Headers();
  //       headers.append('Accept', 'application/json');
  //       headers.append('Content-type', 'application/json');
  //       headers.append('Authorization', 'Bearer ' + token);
  //       const options = new RequestOptions({ headers });
  //       const url = self.CLOUD_FUNC_UPDATE_USER_URL;
  //       console.log('CLOUD FUNCT - UPDATE CONTACT URL ', url)
  //       const body = { 'firstname': updated_firstname, 'lastname': updated_lastname };
  //       self.http
  //         .put(url, JSON.stringify(body), options)
  //         .toPromise().then(res => {
  //           console.log('Cloud Functions Update Contact RESPONSE ', res)
  //           console.log('Cloud Functions Update Contact RESPONSE STATUS', res.status)
  //           if (res.status === 200) {
  //             callback('user successfully updated on firebase')
  //           }
  //         });

  //     }).catch(function (error) {
  //       // Handle error
  //       console.log('idToken.', error);
  //       callback('error')
  //     });
  // }


  public changePassword(user_id: string, old_psw: string, new_psw: string) {
    const url = this.CHANGE_PSW_URL;

    console.log('CHSNGE PSW (PUT) URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    // DONE -> WORKS NK-TO-TEST - nn passare + userid  -- 'userid': user_id, 
    const body = { 'oldpsw': old_psw, 'newpsw': new_psw };

    console.log('PUT REQUEST BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }

  public resendVerifyEmail() {
    const url = this.RESEND_VERIFY_EMAIL;

    console.log('RESEND VERIFY EMAIL URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    return this.http
      .get(url, options)
      .map((res) => res.json());
  }


}
