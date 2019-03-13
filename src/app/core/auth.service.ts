import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

// import { AngularFireAuth } from 'angularfire2/auth';

import { NotifyService } from './notify.service';

import { Observable } from 'rxjs/Observable';
import { switchMap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Http, Headers, RequestOptions } from '@angular/http';
import { mergeMap } from 'rxjs/operators/mergeMap';

import { User } from '../models/user-model';
import { Project } from '../models/project-model';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/toPromise';
import { UsersLocalDbService } from '../services/users-local-db.service';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';

import { isDevMode } from '@angular/core';
// declare var require: any;


// start SUPER USER
export class SuperUser {
  constructor(
    public email: string // FOR SUPERUSER
  ) { }
}
const superusers = [
  new SuperUser('andrea.sponziello21@frontiere21.it'),
  new SuperUser('nicola.lanzilotto@frontiere21.it'),
  new SuperUser('lanzilottonicola74@gmail.com'),
];
// .end SUPER USER

import * as firebase from 'firebase';
import 'firebase/messaging';
import 'firebase/database'
// import firebase from '@firebase/app';
// import '@firebase/messaging';
// import '@firebase/database';

@Injectable()
export class AuthService {
  http: Http;
  SIGNUP_BASE_URL = environment.mongoDbConfig.SIGNUP_BASE_URL;
  SIGNIN_BASE_URL = environment.mongoDbConfig.SIGNIN_BASE_URL;
  FIREBASE_SIGNIN_BASE_URL = environment.mongoDbConfig.FIREBASE_SIGNIN_BASE_URL;
  VERIFY_EMAIL_BASE_URL = environment.mongoDbConfig.VERIFY_EMAIL_BASE_URL;
  CLOUDFUNCTION_CREATE_CONTACT_URL = environment.cloudFunctions.cloud_func_create_contact_url;

  // public version: string = require('../../../package.json').version;
  public version: string = environment.VERSION;


  token: string;

  displayName?: string;
  FCMcurrentToken: string;

  // user: Observable<User | null>;
  // user: User
  public user_bs: BehaviorSubject<User> = new BehaviorSubject<User>(null);

  public project_bs: BehaviorSubject<Project> = new BehaviorSubject<Project>(null);

  show_ExpiredSessionPopup: boolean;

  _user_role: string;
  nav_project_id: string;
  subscription: Subscription;
  userId: string;
  APP_IS_DEV_MODE: boolean;

  constructor(
    http: Http,
    // private afAuth: AngularFireAuth,
    private router: Router,
    private notify: NotifyService,
    private usersLocalDbService: UsersLocalDbService,
    private route: ActivatedRoute,
    public location: Location
  ) {
    this.http = http;
    console.log('version (AuthService)  ', this.version);

    this.APP_IS_DEV_MODE = isDevMode();
    console.log('!!! ====== AUTH SERVICE !!! ====== isDevMode ', this.APP_IS_DEV_MODE)
    // this.user = this.afAuth.authState
    //   .switchMap((user) => {
    //     if (user) {
    //       return this.afs.doc<User>(`users/${user.uid}`).valueChanges();
    //     } else {
    //       return Observable.of(null);
    //     }
    //   });

    // tslint:disable-next-line:no-debugger
    // debugger
    this.checkCredentials();

    /* !!! NO MORE USED - REPLACED BY checkStoredProjectAndPublish() */
    // this.getProjectFromLocalStorage();

    this.checkStoredProjectAndPublish();

    // this.getParamsProjectId();
  }

  // USED ONLY FOR A TEST
  getParamsProjectId() {
    this.route.params.subscribe((params) => {
      console.log('!!! AUTH SETVICE - »»» TEST »»»- GET PROJECT ID ', params)
    })
  }


  // RECEIVE THE the project (name and id) AND PUBLISHES
  projectSelected(project: Project) {
    // PUBLISH THE project
    console.log('!!C-U AUTH SERVICE: I PUBLISH THE PROJECT RECEIVED FROM PROJECT COMP ', project)
    // tslint:disable-next-line:no-debugger
    // debugger
    this.project_bs.next(project);
  }


  /**
   * // REPLACE getProjectFromLocalStorage()
   * IF THE PROJECT RETURNED FROM THE project_bs SUBSCRIPTION IS NULL
   * GOT THE PROJECT ID FROM THE URL, AND THEN (WITH PROJECT ID) THE NAME OF THE PROJECT FROM LOCAL STORAGE - (^NOTE),
   * THEN PROJECT ID AND PROJECT NAME THAT ARE PUBLISHED
   * **** THIS RESOLVE THE BUG: WHEN A PAGE IS RELOADED (BY HAND OR BY ACCESSING THE DASHBOARD BY LINK)
   *  THE PROJECT ID AND THE PROJECT NAME RETURNED FROM SUBDCRIPTION TO project_bs ARE NULL
   * **** ^NOTE: THE ITEMS PROJECT ID AND PROJECT NAME IN THE STORAGE ARE SETTED IN PROJECT-COMP
   * A SIMILAR 'WORKFLOW' IS PERFORMED IN THE AUTH.GUARD IN CASE, AFTER A CHECK FOR ID PROJECT IN THE STORAGE, THE PROJECT JSON IS NULL */
  // getAndPublish_NavProjectIdAndProjectName() {
  checkStoredProjectAndPublish() {
    this.project_bs.subscribe((prjct) => {

      console.log('!!C-U  - 1) »»»»» AUTH SERV - PROJECT FROM SUBSCRIP', prjct);

      if (prjct === null) {
        console.log('!!C-U »»»»» AUTH SERV - PROJECT IS NULL: ', prjct);

        /**
         * !!!! NO MORE - REPLACES 'router.events.subscribe' WITH 'location.path()'
         * BECAUSE OF 'events.subscribe' THAT IS ACTIVATED FOR THE FIRST
         * TIME WHEN THE PROJECT IS NULL AND THEN IS ALWAYS CALLED EVEN IF THE  PROJECT IS DEFINED */
        this.subscription = this.router.events.subscribe((e) => {
          if (e instanceof NavigationEnd) {
            // if (this.location.path() !== '') {
            // const current_url = this.location.path()
            const current_url = e.url
            console.log('!!C-U »»»»» AUTH SERV - CURRENT URL ', current_url);

            const url_segments = current_url.split('/');
            console.log('!!C-U »»»»» AUTH SERV - CURRENT URL SEGMENTS ', url_segments);


            this.nav_project_id = url_segments[2];
            console.log('!! »»»»» AUTH SERV - CURRENT URL SEGMENTS > NAVIGATION PROJECT ID: ', this.nav_project_id);
            console.log('!! »»»»» AUTH SERV - CURRENT URL SEGMENTS > SEGMENT 1: ', url_segments[1]);

            /*
             * (note: the NAVIGATION PROJECT ID returned from CURRENT URL SEGMENTS is = to 'email'
             * if the user navigate to the e-mail verification page)
             * the url_segments[1] is = to 'user' instead of 'project' when the user not yet has select a project
             * (i.e. from the project list page) and go to user profile > change password
             * */
            if (this.nav_project_id && this.nav_project_id !== 'email' && url_segments[1] !== 'user') {

              console.log('!!C-U »»»»» QUI ENTRO ', this.nav_project_id);
              this.subscription.unsubscribe();

              const storedProjectJson = localStorage.getItem(this.nav_project_id);
              console.log('!! »»»»» AUTH SERV - JSON OF STORED PROJECT: ', storedProjectJson);

              // RUN THE BELOW ONLY IF EXIST THE PROJECT JSON SAVED IN THE STORAGE
              if (storedProjectJson) {

                const storedProjectObject = JSON.parse(storedProjectJson);
                console.log('!! »»»»» AUTH SERV - OBJECT OF STORED PROJECT', storedProjectObject);

                const project_name = storedProjectObject['name'];

                console.log('!! »»»»» AUTH SERV - PROJECT NAME GET FROM STORAGE: ', project_name);

                const project: Project = {
                  _id: this.nav_project_id,
                  name: project_name,
                }
                console.log('!!C-U »»»»» AUTH SERV - 1) PROJECT THAT IS PUBLISHED: ', project);
                // SE NN C'è IL PROJECT NAME COMUNQUE PUBBLICO PERCHè CON L'ID DEL PROGETTO VENGONO EFFETTUATE DIVERSE CALLBACK

                /**** ******* ******* ***** *** ** ***/
                this.project_bs.next(project);

                // NOTA: AUTH GUARD ESEGUE UN CHECK DEL PROGETTO SALVATO NEL LOCAL STORAGE E SE IL PROJECT NAME è NULL DOPO AVER 'GET' IL
                // PROGETTO PER nav_project_id SET THE ID and the NAME OF THE PROJECT IN THE LOCAL STORAGE and
                // SENT THEM TO THE AUTH SERVICE THAT PUBLISHES
                // if (project_name === null) {
                //   console.log('!! »»»»» AUTH SERV - PROJECT NAME IS NULL')
                // }
              } else {
                // USE-CASE: FOR THE ID (GOT FROM URL) OF THE CURRENT PROJECT THERE IS NO THE JSON SAVED IN THE STORAGE:
                // IT IS THE CASE IN WHICH THE USER ACCESS TO A NEW PROJECT IN THE DASHBOARD BY LINKS
                // WITHOUT BEING PASSED FROM THE PROJECT LIST.
                // IF THE STORED JSON OF THE PROJECT IS NULL  IS THE AUTH-GUARD THAT RUNS A REMOTE CALLBACK TO OBTAIN THE
                // PROJECT BY ID AND THAT THEN PUBLISH IT AND SAVE IT (THE REMOTE CALLBACK IS PERFORMED IN AUTH-GUARD BECAUSE
                // IS NOT POSSIBLE TO DO IT IN THIS SERVICE (BECAUSE OF THE CIRCULAR DEPEDENCY WARNING)  )
                console.log('!! »»» AUTH SERV - FOR THE PRJCT ID ', this.nav_project_id, ' THERE IS NOT STORED PRJCT-JSON - SEE AUTH GUARD')
                // this.projectService.getProjectById(this.nav_project_id).subscribe((prjct: any) => {

                // public anyway to immediately make the project id available to subscribers
                // the project name will be published by the auth.guard
                const project: Project = {
                  _id: this.nav_project_id,
                }
                console.log('!! »»»»» AUTH SERV - 2) PROJECT THAT IS PUBLISHED: ', project);
                this.project_bs.next(project);
              }
            }
          }
        }); // this.router.events.subscribe((e)
      }
    });
  }

  checkRoleForCurrentProject() {
    console.log('!! »»»»» AUTH SERV - CHECK ROLE »»»»» CALLING CHECK-ROLE-FOR-CURRENT-PRJCT');
    // this.router.events.subscribe((e) => {
    //   console.log('!! »»»»» AUTH SERV - CHECK ROLE »»»»» CALLING checkRoleForCurrentProjectAndRedirect');
    //   console.log('!! »»»»» AUTH SERV - CHECK ROLE - EVENT ', e);
    //   if (e instanceof NavigationEnd) {
    // console.log('!! AUTH GUARD - EVENT ', e);
    // const current_url = e.url
    // console.log('!! »»»»» AUTH SERV - CHECK ROLE - CURRENT URL ', current_url);

    // const url_segments = current_url.split('/');
    // console.log('!! »»»»» AUTH SERV - CHECK ROLE - CURRENT URL SEGMENTS ', url_segments);

    // const nav_project_id = url_segments[2];
    // console.log('!! »»»»» AUTH SERV - CHECK ROLE - NAVIGATION PROJECT ID: ', nav_project_id);

    const storedProjectJson = localStorage.getItem(this.nav_project_id);
    if (storedProjectJson) {

      const storedProjectObject = JSON.parse(storedProjectJson);
      console.log('!! »»»»» AUTH SERV - CHECK ROLE - OBJECT OF STORED PROJECT', storedProjectObject);

      this._user_role = storedProjectObject['role'];

      if (this._user_role) {
        if (this._user_role === 'agent' || this._user_role === undefined) {
          console.log('!! »»»»» AUTH SERV - CHECK ROLE (GOT FROM STORAGE) »»» ', this._user_role);

          this.router.navigate([`project/${this.nav_project_id}/unauthorized`]);
          // this.router.navigate(['/unauthorized']);
        } else {
          console.log('!! »»»»» AUTH SERV - CHECK ROLE (GOT FROM STORAGE) »»» ', this._user_role)
        }
      }

    }
    //   }
    // });
  }

  // !!! NO MORE USED
  // WHEN THE PAGE IS RELOADED THE project_id RETURNED FROM THE SUBSCRIPTION IS NULL SO IT IS GET FROM LOCAL STORAGE
  // getProjectFromLocalStorage() {
  //   const storedProject = localStorage.getItem('project')
  //   console.log('!! getProjectFromLocalStorage ', storedProject)
  //   this.project_bs.next(JSON.parse(storedProject));
  // }

  // GET THE USER OBJECT FROM LOCAL STORAGE AND PASS IT IN user_bs
  checkCredentials() {
    const storedUser = localStorage.getItem('user')
    console.log('AUTH SERVICE - CHECK CREDENTIAL - STORED USER  ', storedUser)
    // console.log('USER BS VALUE', this.user_bs.value)
    if (storedUser !== null) {

      /**
       * *** WIDGET - pass data to the widget function setTiledeskWidgetUser in index.html ***
       */
      // const _storedUser = JSON.parse(storedUser);
      // console.log('SetTiledeskWidgetUserSignin (AUTH-SERVICE) - storedUser', _storedUser)
      // const userFullname = _storedUser['firstname'] + ' ' + _storedUser['lastname'];
      // console.log('SetTiledeskWidgetUserSignin (AUTH-SERVICE) - userFullname', userFullname);
      // const userEmail = _storedUser['email']
      // console.log('SetTiledeskWidgetUserSignin (AUTH-SERVICE) - userEmail', userEmail);
      // const userId = _storedUser['_id']
      // console.log('SetTiledeskWidgetUserSignin (AUTH-SERVICE) - userId', userId);
      // window['setTiledeskWidgetUser'](userFullname, userEmail, userId)


      this.user_bs.next(JSON.parse(storedUser));
      // this.router.navigate(['/home']);
    }
  }

  /**
   *  //// NODEJS SIGNUP //// CREATE (POST)
   * @param email
   * @param password
   * @param first_name
   * @param last_name
   */
  public signup(email: string, password: string, first_name: string, last_name: string): Observable<any> {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    // headers.append('Authorization', this.TOKEN);
    const options = new RequestOptions({ headers });
    // const optionsp = new RequestOptions({ headers });

    const body = { 'email': email, 'password': password, 'firstname': first_name, 'lastname': last_name };
    // const bodyperson = { 'firstname': `${first_name}`, 'lastname': `${last_name}` };

    console.log('SIGNUP POST REQUEST BODY ', body);

    const url = this.SIGNUP_BASE_URL;
    // const personurl = this.MONGODB_PEOPLE_BASE_URL;
    console.log('SIGNUP URL ', url)
    // console.log('PEOPLE URL ', personurl)

    return this.http
      .post(url, JSON.stringify(body), options)
      .map(res => {
        // tslint:disable-next-line:no-debugger
        // debugger
        console.log('res: ', res.json())
        return res.json()
      })
    // .pipe(mergeMap(e => {
    //   console.log('e: ', e)
    //   return this.http.post(personurl, JSON.stringify(bodyperson), options)
    //   .map((res) => {res.json()})
    // }))
    // .map((res) => {res.json()})))
  }

  /**
   * NODEJS SIGN-IN: SIGN-IN THE USER AND CREATE THE 'OBJECT USER' INCLUDED THE RETURNED (FROM SIGNIN) JWT TOKEN
   * NODEJS FIREBASE SIGN-IN: GET FIREBASE TOKEN THEN USED FOR
   * FIREBASE SIGN-IN USING CUSTOM TOKEN
   * @param email
   * @param password
   */
  signin(email: string, password: string, callback) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    const options = new RequestOptions({ headers });
    const body = { 'email': email, 'password': password };
    console.log('SIGNIN POST REQUEST BODY ', body);
    const url = this.SIGNIN_BASE_URL;
    console.log('SIGNIN URL ', url)

    return this.http
      .post(url, JSON.stringify(body), options)
      .toPromise().then(res => {

        console.log('SIGNIN RES: ', res.json())
        const jsonRes = res.json()
        const user: User = jsonRes.user

        if (user) {
          // used in signOut > removeInstanceId
          this.userId = user._id
        }

        // ASSIGN THE RETURNED TOKEN TO THE USER OBJECT
        user.token = jsonRes.token

        // PUBLISH THE USER OBJECT
        this.user_bs.next(user);

        // SET USER IN LOCAL STORAGE
        localStorage.setItem('user', JSON.stringify(user));
        console.log('++ USER ', user)


        ///////////////////
        console.log('1. POST DATA ', jsonRes);
        if (jsonRes['success'] === true) {

          this.firebaseSignin(email, password).subscribe(token => {

            console.log('2. FIREBASE SIGNIN RESPO ', token)
            if (token) {

              // Firebase Sign in using custom token
              firebase.auth().signInWithCustomToken(token)
                .then(firebase_user => {
                  console.log('3. FIREBASE CUSTOM AUTH DATA ', firebase_user);

                  /* UPDATE THE THE USER CREATE ON FIREBASE WITH THE CUSTOM TOKEN WITH THE EMAIL AND THE PASSWORD */
                  // firebase_user.updatePassword(password).then(function () {
                  //   firebase_user.updateEmail(email);
                  //   // Update successful.
                  //   console.log('// Firebase credentials - Update successful.')
                  // }).catch(function (error) {
                  //   // An error happened.
                  //   console.log('// Firebase credentials - An error happened.', error)
                  // });

                  //   const credential = firebase.auth.EmailAuthProvider.credential(
                  //     user.email,
                  //     userProvidedPassword
                  // );

                  if (!this.APP_IS_DEV_MODE) {
                    this.getPermission();
                  }


                  /* CHAT21-CLOUD-FUNCTIONS - CREATE CONTACT */
                  this.cloudFunctionsCreateContact(user.firstname, user.lastname, user.email);
                  callback(null, user);
                })
                .catch(function (error) {
                  // return error;
                  callback(error);
                  // Handle Errors here.
                  // const errorCode = error.code;
                  // console.log('FIREBASE CUSTOM AUTH ERROR CODE ', errorCode)
                  // const errorMessage = error.message;
                  // console.log('FIREBASE CUSTOM AUTH ERROR MSG ', errorMessage)
                });
            } else {
              callback({ code: '4569', message: 'Error token not generated' });
            }
            // tslint:disable-next-line:no-debugger
            // debugger
          })
        } else {
          callback({ code: jsonRes.code, message: jsonRes.message });
        }

      }).catch(function (error) {
        console.log('TO PROMISE ERROR ', error);
        callback(error);
      })
  }


  getPermission() {
    const messaging = firebase.messaging();
    messaging.requestPermission()
      .then(() => {
        console.log('>>>> getPermission Notification permission granted.');
        return messaging.getToken()
      })
      .then(FCMtoken => {
        console.log('>>>> getPermission FCMtoken', FCMtoken)
        // Save FCM Token in Firebase
        this.FCMcurrentToken = FCMtoken;
        this.updateToken(FCMtoken)
      })
      .catch((err) => {
        console.log('>>>> getPermission Unable to get permission to notify.', err);
      });
  }

  // requestPermissionGetFCMTokenAndRegisterInstanceId(userId) {
  //   const messaging = firebase.messaging();
  //   const that = this;
  //   messaging.requestPermission()
  //     .then(function () {
  //       console.log('Notification permission granted.');
  //       // TODO(developer): Retrieve a Instance ID token for use with FCM.
  //       // ...
  //       that.getFCMregistrationToken(userId)
  //     })
  //     .catch(function (err) {
  //       console.log('Unable to get permission to notify. ', err);
  //     });
  // }

  // getFCMregistrationToken(userId) {
  //   const that = this;
  //   console.log('>>>>  messaging.getToken - Notification permission granted.');

  //   // /* forceRefresh */ true
  //   const messaging = firebase.messaging();
  //   messaging.getToken().then(function (FCMcurrentToken) {
  //     if (FCMcurrentToken) {
  //       console.log('>>>>  messaging.getToken - FCM registration token ', FCMcurrentToken);

  //       that.FCMcurrentToken = FCMcurrentToken;

  //       that.registerInstanceId(FCMcurrentToken);

  //     } else {
  //       // Show permission request.
  //       console.log('>>>>  messaging.getToken - No Instance ID token available. Request permission to generate one.');
  //     }
  //   }).catch(function (err) {
  //     console.log('>>>>  messaging.getToken - An error occurred while retrieving token. ', err);
  //   });
  // }

  updateToken(FCMcurrentToken) {
    console.log('>>>> updateToken ', FCMcurrentToken);
    // this.afAuth.authState.take(1).subscribe(user => {
    if (!this.userId || !FCMcurrentToken) {
      return
    };
    console.log('aggiorno token nel db');
    const connection = FCMcurrentToken;
    const updates = {};
    const urlNodeFirebase = '/apps/tilechat'
    const connectionsRefinstancesId = urlNodeFirebase + '/users/' + this.userId + '/instances/';

    // this.connectionsRefinstancesId = this.urlNodeFirebase + "/users/" + userUid + "/instances/";
    const device_model = {
      device_model: navigator.userAgent,
      language: navigator.language,
      platform: 'web/dashboard',
      platform_version: this.version
    }

    updates[connectionsRefinstancesId + connection] = device_model;

    console.log('Firebase Cloud Messaging  - Aggiorno token ------------>', updates);
    firebase.database().ref().update(updates)
  }

  // CREATE CONTACT ON FIREBASE Realtime Database
  cloudFunctionsCreateContact(firstname, lastname, email) {
    const self = this;
    firebase.auth().currentUser.getIdToken(/* forceRefresh */ true)
      .then(function (token) {
        console.log('cloudFunctionsCreateContact idToken.', token);
        // console.log('idToken.', idToken);
        const headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Content-type', 'application/json');
        headers.append('Authorization', 'Bearer ' + token);

        const options = new RequestOptions({ headers });
        // const url = 'https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/contacts';
        const url = self.CLOUDFUNCTION_CREATE_CONTACT_URL
        const body = { 'firstname': firstname, 'lastname': lastname, 'email': email };

        self.http
          .post(url, JSON.stringify(body), options)
          .toPromise().then(res => {
            console.log('Cloud Functions Create Contact RES ', res)
          });

      }).catch(function (error) {
        // Handle error
        console.log('idToken.', error);
      });
  }

  // NODE.JS FIREBASE SIGNIN (USED TO GET THE TOKEN THEN USED FOR Firebase Signin using custom token)
  firebaseSignin(email: string, password: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    const options = new RequestOptions({ headers });
    const url = this.FIREBASE_SIGNIN_BASE_URL;
    console.log('FIREBASE SIGNIN URL ', url)

    const body = { 'email': email, 'password': password };
    console.log('FIREBASE SIGNIN URL BODY ', body);
    // tslint:disable-next-line:no-debugger
    // debugger
    return this.http
      .post(url, JSON.stringify(body), options)
      .map((res) => {
        // tslint:disable-next-line:no-debugger
        // debugger
        // console.log('FIREBASE SIGNIN RES TOKEN', res.text())
        // const firebaseToken = res.text()
        return res.text()

      });
  }

  /// ===================== VERIFY EMAIL ===================== ///
  emailVerify(user_id: string): Observable<User[]> {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    const options = new RequestOptions({ headers });

    const url = this.VERIFY_EMAIL_BASE_URL + user_id;
    console.log('VERIFY EMAIL URL ', url)
    const body = { 'emailverified': true };
    return this.http
      // .get(url, { headers })
      .put(url, JSON.stringify(body), options)
      .map((res) => res.json());
  }


  /* ===================== REPUBLISH AND RESET IN STORAGE THE (UPDATED) USER ===================== */
  // * WHEN THE USER UPGRADES HIS OWN PROFILE (NAME AND / OR SURNAME) THE USER-SERVICE
  //   SEND THE UPDATED USER OBJECT TO AUTH SERVICE (THIS COMPONENT) THAT REPUBLISH IT
  // * WHEN THE USER VERIFY HIS EMAIL THE VERIFY-EMAIL.COMP SENT UPDATED USER OBJECT 
  // TO AUTH SERVICE (THIS COMPONENT) THAT REPUBLISH IT
  public publishUpdatedUser(updated_user) {
    console.log('AUTH SERV - UPDATED USER OBJECT RECEIVED FROM USER.SERV or VERY-EMAIL.COM (BEFORE TO REPUBLISH IT): ', updated_user);

    // REPUBLISH THE (UPDATED) USER OBJECT
    this.user_bs.next(updated_user);

    // RESET THE (UPDATED) USER OBJECT IN LOCAL STORAGE
    localStorage.setItem('user', JSON.stringify(updated_user));
  }

  ////// SUPER USER AUTH //////
  superUserAuth(currentUserEmailgetFromStorage) {
    const authenticatedSuperUser = superusers.find(u => u.email === currentUserEmailgetFromStorage);
    if (authenticatedSuperUser && authenticatedSuperUser.email === currentUserEmailgetFromStorage) {
      // console.log('AUTENTICATED SUPER USER ', authenticatedUser)
      // console.log('AUTENTICATED SUPER USER EMAIL ', authenticatedUser.email)
      // console.log('AUTH SERVICE C. USER EMAIL ', authenticatedUser.email)
      return true;
    }
    return false;
  }



  // Sends email allowing user to reset password
  resetPassword(email: string) {
    const fbAuth = firebase.auth();

    return fbAuth.sendPasswordResetEmail(email)
      .then(() => this.notify.update('Password update email sent', 'info'))
      .catch((error) => this.handleError(error));
  }

  hasClickedGoToProjects() {
    this.project_bs.next(null);
    console.log('!!C-U »»»»» AUTH SERV - HAS BEEN CALLED "HAS CLICKED GOTO PROJECTS" - PUBLISH PRJCT = ', this.project_bs.next(null))
    localStorage.removeItem('project');
  }

  // RUN THE FIREBASE LOGOUT FOR TEST OF THE EXIPERD SESIION MODAL WINDOW
  testExpiredSessionFirebaseLogout(logoutFromFireBase) {

    console.log('TEST EXIPERD SESSION - LOGOUT FROM FIREBASE');
    firebase.auth().signOut()
      .then(function () {
        console.log('Signed Out');
      }, function (error) {
        console.error('Sign Out Error', error);
      });

  }

  showExpiredSessionPopup(showExpiredSessionPopup) {
    this.show_ExpiredSessionPopup = showExpiredSessionPopup;
    console.log('AUTH SERV - SHOW EXPIRED SESSION POPUP ', this.show_ExpiredSessionPopup)
  }

  // hasPressedLogOut(logoutPressed) {
  //   this.logoutPressed = logoutPressed
  //   console.log('AUTH SERV - HAS PRESSED LOGOUT ', this.logoutPressed)
  // }
  // PASSED FROM APP.COMPONENT.TS
  userIsSignedIn(user_is_signed_in: boolean) {
    console.log('AUTH SERVICE - USER IS SIGNED IN ', user_is_signed_in);

    if (this.show_ExpiredSessionPopup === true) {
      this.notify.showExiperdSessionPopup(user_is_signed_in);
    }

  }

  signOut() {
    if (!this.APP_IS_DEV_MODE) {

      if (this.FCMcurrentToken !== undefined && this.userId !== undefined) {

        this.removeInstanceIdAndFireabseSignout();

      } else {
        // use case: the user refresh the page
        const messaging = firebase.messaging();
        messaging.getToken()
          .then(FCMtoken => {
            this.FCMcurrentToken = FCMtoken;
            const storedUser = localStorage.getItem('user');
            const storedUserObj = JSON.parse(storedUser);
            console.log('signOut - storedUserObj ', storedUserObj);
            this.userId = storedUserObj._id;

            this.removeInstanceIdAndFireabseSignout();
          })
      }
    } else {

      this.firebaseSignout();
    }
    // !!! NO MORE USED
    // this.afAuth.auth.signOut()

    // this.router.navigate(['/login']);
    // this.firebaseSignout();
  }

  removeInstanceIdAndFireabseSignout() {
    console.log('removeInstanceId - FCM Token: ', this.FCMcurrentToken);
    console.log('removeInstanceId - USER ID: ', this.userId);
    // this.connectionsRefinstancesId = this.urlNodeFirebase+"/users/"+userUid+"/instances/";
    const urlNodeFirebase = '/apps/tilechat'
    const connectionsRefinstancesId = urlNodeFirebase + '/users/' + this.userId + '/instances/';

    let connectionsRefURL = '';
    if (connectionsRefinstancesId) {
      connectionsRefURL = connectionsRefinstancesId + '/' + this.FCMcurrentToken;
      const connectionsRef = firebase.database().ref().child(connectionsRefURL);
      const that = this;
      connectionsRef.remove()
        .then(function () {

          that.firebaseSignout();

        }).catch((err) => {
          console.log('removeInstanceId - err: ', err);

          that.firebaseSignout();

        });
    }
  }

  firebaseSignout() {
    this.user_bs.next(null);
    this.project_bs.next(null);

    localStorage.removeItem('user');
    localStorage.removeItem('project');
    localStorage.removeItem('role')

    const that = this;
    firebase.auth().signOut()
      .then(function () {
        console.log('Signed Out');
        that.router.navigate(['/login']);
      }, function (error) {
        console.error('Sign Out Error', error);
        that.router.navigate(['/login']);
      });
  }

  // If error, console log and notify user
  private handleError(error: Error) {
    console.error(error);
    this.notify.update(error.message, 'error');
  }

}
