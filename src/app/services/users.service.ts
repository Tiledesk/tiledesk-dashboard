import { Injectable } from '@angular/core';

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';

import { User } from '../models/user-model';
import { ProjectUser } from '../models/project-user';

import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

import { AuthService } from '../core/auth.service';
import { Http, Headers, RequestOptions } from '@angular/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as firebase from 'firebase/app';

interface NewUser {
  displayName: string;
  email: string;
  time: number;
}

@Injectable()
export class UsersService {

  public user_is_available_bs: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public project_user_id_bs: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public project_user_role_bs: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public has_changed_availability_in_sidebar: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public has_changed_availability_in_users: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

  http: Http;
  BASE_URL = environment.mongoDbConfig.BASE_URL;
  CLOUD_FUNC_UPDATE_USER_URL = environment.cloudFunctions.cloud_func_update_firstname_and_lastname;
  MONGODB_BASE_URL: any;
  INVITE_USER_URL: any;
  PROJECT_USER_DTLS_URL: any;

  // GET_PROJECT_USER_URL: any;
  TOKEN: string
  user: any;

  orderBy_field: any;
  orderBy_direction: any;

  usersCollection: AngularFirestoreCollection<User>;
  userDocument: AngularFirestoreDocument<Node>;

  searchUserCollection: AngularFirestoreCollection<User>;

  project: any;
  PROJECT_BASE_URL = environment.mongoDbConfig.PROJECTS_BASE_URL;
  AVAILABLE_USERS_URL: any;


  // http://localhost:3000/users/updateuser/'
  UPDATE_USER_URL = environment.mongoDbConfig.UPDATE_USER_LASTNAME_FIRSTNAME;
  CHANGE_PSW_URL = environment.mongoDbConfig.CHANGE_PSW;
  currentUserId: string;

  constructor(
    http: Http,
    private afs: AngularFirestore,
    private auth: AuthService
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

    this.getCurrentProject();

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
        console.log('-- -- >>>> 00 -> USERS SERVICE project ID from AUTH service subscription  ', this.project._id)
        this.MONGODB_BASE_URL = this.BASE_URL + this.project._id + '/project_users/'
        this.INVITE_USER_URL = this.BASE_URL + this.project._id + '/project_users/invite'

        // MAYBE NOT USED anymore
        this.PROJECT_USER_DTLS_URL = this.BASE_URL + this.project._id + '/member/'

        this.AVAILABLE_USERS_URL = this.PROJECT_BASE_URL + this.project._id + '/users/availables'

        // PROJECT-USER BY PROJECT ID AND CURRENT USER ID
        // this.PROJECT_USER_URL = this.BASE_URL + this.project._id + '/project_users/'
      }
    });
  }

  checkUser() {
    if (this.user) {
      this.TOKEN = this.user.token
      this.currentUserId = this.user._id
      // this.getToken();
    } else {
      console.log('No user is signed in');
    }
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


  /// ================================== ALL PROJECT-USER FROM MONGO DB ================================== ///
  /**
   * NOTE: the PROJECT-USER returned has nested the user's object
   */
  public getProjectUsersByProjectId(): Observable<ProjectUser[]> {
    const url = this.MONGODB_BASE_URL;

    console.log('PROJECT USERS URL', url);
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

 

  /// ================================== INVITE USER (ALIAS CREATE A MEMBER) ================================== ///
  public inviteUser(email: string, role: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'email': email, 'role': role, 'id_project': this.project._id };

    console.log('POST INVITE USER - REQUEST BODY ', body);

    const url = this.INVITE_USER_URL;

    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }

  /// ============================= GET PROJECT-USER BY CURRENT-PROJECT-ID AND CURRENT-USER-ID ============================= ///
  public getProjectUsersByProjectIdAndUserId(user_id: string, project_id: string): Observable<ProjectUser[]> {
    const url = this.MONGODB_BASE_URL + user_id + '/' + project_id;

    console.log('GET PROJECT USERS BY PROJECT-ID & CURRENT-USER-ID URL', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    // console.log('TOKEN TO COPY ', this.TOKEN)
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  /// ========================= GET PROJECT-USER BY ID (PROJECT USER DETAIL) ======================= ///
  public getProjectUsersById(projectuser_id: string): Observable<ProjectUser[]> {
    const url = this.MONGODB_BASE_URL + 'details/' + projectuser_id;

    console.log('GET PROJECT USERS BY ID ', url);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    // console.log('TOKEN TO COPY ', this.TOKEN)
    return this.http
      .get(url, { headers })
      .map((response) => response.json());
  }

  // ======================  PUBLISH projectUser_id AND user_available ======================
  // NOTE: THE projectUser_id AND user_available ARE PASSED FROM HOME.COMPONENT
  public user_availability(projectUser_id: string, user_available: boolean) {
    console.log('USER SERVICE - PROJECT-USER-ID ', projectUser_id)
    console.log('USER SERVICE - USER AVAILABLE ', user_available)

    this.project_user_id_bs.next(projectUser_id);
    this.user_is_available_bs.next(user_available);
  }

  // ======================  PUBLISH WHEN THE SIDEBAR AVAILABLE / UNAVAILABLE BUTTON IS CLICKED  ======================
  // NOTE: USER COMP SUBSCRIBES TO has_changed_availability TO RE-RUN getAllUsersOfCurrentProject
  // WITCH UPDATE THE LIST OF THE PROJECT' MEMBER
  public availability_btn_clicked(clicked: boolean) {
    this.has_changed_availability_in_sidebar.next(clicked)
  }

  // ======================  PUBLISH WHEN THE USERS-COMP AVAILABLE / UNAVAILABLE Toggle Switch BTN IS CLICKED  ======================
  // NOTE: SIDEBAR SUBSCRIBES TO has_changed_availability TO RE-RUN getAllUsersOfCurrentProject
  // WITCH UPDATE THE LIST OF THE PROJECT' MEMBER
  public availability_switch_clicked(clicked: boolean) {
    this.has_changed_availability_in_users.next(clicked)

  }

  // ======================  PUBLISH PROJECT-USER ROLE ======================
  // NOTE: THE projectUser_role IS PASSED FROM HOME.COMPONENT
  public user_role(projectUser_role: string) {
    console.log('USER SERVICE - USER ROLE ', projectUser_role);
    this.project_user_role_bs.next(projectUser_role);
  }


  /**
   * UPDATE PROJECT-USER AVAILABILITY (PUT)
   */
  public updateProjectUser(projectUser_id: string, user_is_available: boolean) {

    let url = this.MONGODB_BASE_URL;
    url += projectUser_id;
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
  public updateProjectUserRole(projectUser_id: string, user_role: string) {

    let url = this.MONGODB_BASE_URL;
    url += projectUser_id;
    console.log('PROJECT-USER UPDATE (PUT) URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'role': user_role };

    console.log('PUT REQUEST BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }

  /**
   * DELETE PROJECT-USER (PUT)  */
  public deleteProjectUser(projectUser_id: string) {
    let url = this.MONGODB_BASE_URL;
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

    const url = this.UPDATE_USER_URL + this.currentUserId;

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

          callback('user successfully updated on mdb');

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

          // chat21-cloud-functions - Update my FirstName and Last Name
          // on firebase Realtime Database
          this.cloudFunctionsUpdateContact(user_firstname, user_lastname, callback);

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

  cloudFunctionsUpdateContact(updated_firstname: string, updated_lastname: string, callback) {

    const self = this;
    firebase.auth().currentUser.getIdToken(/* forceRefresh */ true)
      .then(function (token) {
        console.log('USER SERV - FIREBASE idToken.', token);


        const headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Content-type', 'application/json');
        headers.append('Authorization', 'Bearer ' + token);

        const options = new RequestOptions({ headers });
        const url = self.CLOUD_FUNC_UPDATE_USER_URL;

        console.log('CLOUD FUNCT - UPDATE CONTACT URL ', url)

        const body = { 'firstname': updated_firstname, 'lastname': updated_lastname };

        self.http
          .put(url, JSON.stringify(body), options)
          .toPromise().then(res => {
            console.log('Cloud Functions Update Contact RESPONSE ', res)
            console.log('Cloud Functions Update Contact RESPONSE STATUS', res.status)

            if (res.status === 200) {
              callback('user successfully updated on firebase')
            }
          });

      }).catch(function (error) {
        // Handle error
        console.log('idToken.', error);
        callback('error')
      });
  }

  public changePassword(user_id: string, old_psw: string, new_psw: string) {
    const url = this.CHANGE_PSW_URL;

    console.log('CHSNGE PSW (PUT) URL ', url);

    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });

    const body = { 'userid': user_id, 'oldpsw': old_psw, 'newpsw': new_psw };

    console.log('PUT REQUEST BODY ', body);

    return this.http
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());

  }


}
