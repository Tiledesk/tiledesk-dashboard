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

import { UsersLocalDbService } from '../services/users-local-db.service';
import { Router } from '@angular/router';
import { Project } from '../models/project-model';
import { FaqKbService } from '../services/faq-kb.service';
import { BotLocalDbService } from '../services/bot-local-db.service';

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
  public userProfileImageExist: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);

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
  NEW_AVAILABLE_USERS_URL: any;


  // http://localhost:3000/users/updateuser/'
  UPDATE_USER_URL = environment.mongoDbConfig.UPDATE_USER_LASTNAME_FIRSTNAME;
  CHANGE_PSW_URL = environment.mongoDbConfig.CHANGE_PSW;
  RESEND_VERIFY_EMAIL = environment.mongoDbConfig.RESEND_VERIFY_EMAIL;
  currentUserId: string;
  project_id: string;
  project_name: string;

  constructor(
    http: Http,
    private afs: AngularFirestore,
    private auth: AuthService,
    private usersLocalDbService: UsersLocalDbService,
    private router: Router,
    private faqKbService: FaqKbService,
    private botLocalDbService: BotLocalDbService
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
        this.project_id = this.project._id;
        this.project_name = this.project.name;
        console.log('-- -- >>>> 00 -> USERS SERVICE project ID from AUTH service subscription  ', this.project._id)
        this.MONGODB_BASE_URL = this.BASE_URL + this.project._id + '/project_users/'
        this.INVITE_USER_URL = this.BASE_URL + this.project._id + '/project_users/invite'

        // MAYBE NOT USED anymore
        this.PROJECT_USER_DTLS_URL = this.BASE_URL + this.project._id + '/member/'

        this.AVAILABLE_USERS_URL = this.PROJECT_BASE_URL + this.project._id + '/users/availables'
        this.NEW_AVAILABLE_USERS_URL = this.PROJECT_BASE_URL + this.project._id + '/users/availables'
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
      this.verifyUserProfileImageOnFirebaseStorage(this.currentUserId);
    } else {
      console.log('No user is signed in');
    }
  }


  verifyUserProfileImageOnFirebaseStorage(user_id) {
    // tslint:disable-next-line:max-line-length
    const url = 'https://firebasestorage.googleapis.com/v0/b/chat-v2-dev.appspot.com/o/profiles%2F' + user_id + '%2Fphoto.jpg?alt=media';
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

  /// ================================== GET USER BY ID ================================== ///
  public getUsersById(user_id): Observable<User[]> {
    const url = this.BASE_URL + 'users/' + user_id;

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
  public getProjectUsersByProjectId(): Observable<ProjectUser[]> {
    const url = this.MONGODB_BASE_URL;

    console.log('!! GET PROJECT USERS BY PROJECT ID - URL', url);
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
    const url = this.NEW_AVAILABLE_USERS_URL;
    console.log('»»»» »»»» PROJECT USERS NEW AVAILABLE URL', url);
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

    const body = { 'email': email, 'role': role, 'id_project': this.project_id, 'project_name': this.project_name };

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

  // NEW - 22 AGO - DA SOSTITUIRE A getProjectUser() USATO COMPONENTI SIDEBAR AND HOME
  getProjectUserAvailabilityAndRole() {
    this.getProjectUsersByProjectIdAndUserId(this.currentUserId, this.project_id).subscribe((projectUser: any) => {
      console.log('!! USER SERVICE - PROJECT-USER GET BY PROJECT-ID ', this.project_id);
      console.log('!! USER SERVICE - GET BY CURRENT-USER-ID ', this.currentUserId);
      console.log('!! USER SERVICE - PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID ', projectUser);
      console.log('!! USER SERVICE - PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID LENGTH', projectUser.length);
      if ((projectUser) && (projectUser.length !== 0)) {
        console.log('!! USER SERVICE - PROJECT-USER ID ', projectUser[0]._id)
        console.log('!! USER SERVICE - USER IS AVAILABLE ', projectUser[0].user_available)
        // this.user_is_available_bs = projectUser.user_available;

        if (projectUser[0].user_available !== undefined) {
          this.user_availability(projectUser[0]._id, projectUser[0].user_available)
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

  // ======================  PUBLISH projectUser_id AND user_available ======================
  // NOTE: THE projectUser_id AND user_available ARE PASSED FROM HOME.COMPONENT and from SIDEBAR.COMP
  public user_availability(projectUser_id: string, user_available: boolean) {
    console.log('!!! USER SERVICE - PROJECT-USER-ID ', projectUser_id)
    console.log('!!! USER SERVICE - USER AVAILABLE ', user_available)

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
      console.log('!! »»»»» USER SERVICE USER ROLE FROM STORAGE >>', storedUserRole, '<<');
      console.log('!! »»»»» USER SERVICE PROJECT NAME FROM STORAGE ', storedProjectName);
      console.log('!! »»»»» USER SERVICE PROJECT ID FROM STORAGE ', storedProjectId);

      if (storedUserRole !== projectUser_role) {
        console.log('!! »»»»» USER SERVICE - USER ROLE STORED !!! NOT MATCHES USER ROLE PUBLISHED - RESET PROJECT IN STORAGE ');

        const projectForStorage: Project = {
          _id: storedProjectId,
          name: storedProjectName,
          role: projectUser_role
        }

        // RE-SET THE PROJECT IN THE STORAGE WITH THE UPDATED ROLE
        localStorage.setItem(storedProjectId, JSON.stringify(projectForStorage));

      }
    }

  }

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
