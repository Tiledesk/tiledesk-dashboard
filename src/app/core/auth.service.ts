import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
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

// import { RequestsService } from '../services/requests.service';
// interface CUser {
//   uid: string;
//   email?: string | null;
//   displayName?: string;
//   firstname?: string;
//   lastname?: string;
//   token?: string;
// }

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


@Injectable()
export class AuthService {
  http: Http;
  SIGNUP_BASE_URL = environment.mongoDbConfig.SIGNUP_BASE_URL;
  SIGNIN_BASE_URL = environment.mongoDbConfig.SIGNIN_BASE_URL;
  FIREBASE_SIGNIN_BASE_URL = environment.mongoDbConfig.FIREBASE_SIGNIN_BASE_URL;
  VERIFY_EMAIL_BASE_URL = environment.mongoDbConfig.VERIFY_EMAIL_BASE_URL;
  CLOUDFUNCTION_CREATE_CONTACT_URL = environment.cloudFunctions.cloud_func_create_contact_url;
  // MONGODB_PEOPLE_BASE_URL = environment.mongoDbConfig.MONGODB_PEOPLE_BASE_URL;

  // TOKEN = environment.mongoDbConfig.TOKEN;

  token: string;

  displayName?: string;

  // user: Observable<User | null>;


  // user: User
  public user_bs: BehaviorSubject<User> = new BehaviorSubject<User>(null);

  public project_bs: BehaviorSubject<Project> = new BehaviorSubject<Project>(null);

  show_ExpiredSessionPopup: boolean;

  _user_role: string;

  constructor(
    http: Http,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    private notify: NotifyService,
    private usersLocalDbService: UsersLocalDbService,
    private route: ActivatedRoute


  ) {
    this.http = http;
    console.log('====== AUTH SERVICE !!! ====== ')
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

    /* !!! NO MORE USED - REPLACED BY getAndPublish_NavProjectIdAndProjectName() */
    // this.getProjectFromLocalStorage();

    this.getAndPublish_NavProjectIdAndProjectName();

    // this.getParamsProjectId();
  }

  // USED ONLY FOR A TEST
  getParamsProjectId() {
    this.route.params.subscribe((params) => {
      console.log('!!! AUTH SETVICE - »»» TEST »»»- GET PROJECT ID ', params)
    })
  }

  /**
   * // REPLACE getProjectFromLocalStorage()
   * GOT THE PROJECT ID FROM THE URL, AND THEN (WITH PROJECT ID) THE NAME OF THE PROJECT FROM LOCAL STORAGE - (^NOTE),
   * THEN PROJECT ID AND PROJECT NAME THAT ARE PUBLISHED
   * **** THIS RESOLVE THE BUG: WHEN A PAGE IS RELOADED (BY HAND OR BY ACCESSING THE DASHBOARD BY LINK)
   *  THE PROJECT ID AND THE PROJECT NAME RETURNED FROM SUBDCRIPTION TO project_bs ARE NULL
   * **** ^NOTE: THE ITEMS PROJECT ID AND PROJECT NAME IN THE STORAGE ARE SETTED IN PROJECT-COMP
   * A SIMILAR 'WORKFLOW' IS PERFORMED IN THE AUTH.GUARD IN CASE, AFTER A CHECK FOR ID PROJECT IN THE STORAGE, THE PROJECT NAME IS NULL */
  getAndPublish_NavProjectIdAndProjectName() {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        // console.log('!! AUTH GUARD - EVENT ', e);
        const current_url = e.url
        console.log('!! »»»»» AUTH SERV - CURRENT URL ', current_url);

        const url_segments = current_url.split('/');
        console.log('!! »»»»» AUTH SERV - CURRENT URL SEGMENTS ', url_segments);


        const nav_project_id = url_segments[2];
        console.log('!! »»»»» AUTH SERV - CURRENT URL SEGMENTS > NAVIGATION PROJECT ID: ', nav_project_id);

        if (nav_project_id) {

          const project_name = (localStorage.getItem(nav_project_id));

          console.log('!! »»»»» AUTH SERV - PROJECT NAME GET FROM STORAGE: ', project_name);

          const project: Project = {
            _id: nav_project_id,
            name: project_name,
          }
          console.log('!! »»»»» AUTH SERV - PROJECT THAT IS PUBLISHED: ', project);
          // SE NN C'è IL PROJECT NAME COMUNQUE PUBBLICO PERCHè CON L'ID DEL PROGETTO VENGONO EFFETTUATE DIVERSE CALLBACK
          this.project_bs.next(project);

          // NOTA: AUTH GUARD ESEGUE UN CHECK DEL PROGETTO SALVATO NEL LOCAL STORAGE E SE IL PROJECT NAME è NULL DOPO AVER 'GET' IL
          // PROGETTO PER nav_project_id SET THE ID and the NAME OF THE PROJECT IN THE LOCAL STORAGE and
          // SENT THEM TO THE AUTH SERVICE THAT PUBLISHES
          if (project_name === null) {
            console.log('!! »»»»» AUTH SERV - PROJECT NAME IS NULL')
          }
        }
      }
    });
  }

  // !!! NO MORE USED
  // WHEN THE PAGE IS RELOADED THE project_id RETURNED FROM THE SUBSCRIPTION IS NULL SO IT IS GET FROM LOCAL STORAGE
  getProjectFromLocalStorage() {
    const storedProject = localStorage.getItem('project')
    console.log('!! getProjectFromLocalStorage ', storedProject)
    this.project_bs.next(JSON.parse(storedProject));
  }

  // GET THE USER OBJECT FROM LOCAL STORAGE AND PASS IT IN user_bs
  checkCredentials() {
    const storedUser = localStorage.getItem('user')
    console.log('LOCAL STORAGE USER  ', storedUser)
    // console.log('USER BS VALUE', this.user_bs.value)
    if (storedUser !== null) {

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


                  /* CHAT21-CLOUD-FUNCTIONS - CREATE CONTACT */
                  this.cloudFunctionsCreateContact(user.firstname, user.lastname, user.email);
                  callback(null);
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
        /////////////
      }).catch(function (error) {
        console.log('TO PROMISE ERROR ', error);
        callback(error);
      })
  }

  // CREATE CONTACT ON FIREBASE Realtime Database
  cloudFunctionsCreateContact(firstname, lastname, email) {
    const self = this;
    firebase.auth().currentUser.getIdToken(/* forceRefresh */ true)
      .then(function (token) {

        // console.log('idToken.', idToken);
        const headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Content-type', 'application/json');
        headers.append('Authorization', 'Bearer ' + token);

        const options = new RequestOptions({ headers });
        // const url = 'https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/contacts';
        const url = this.CLOUDFUNCTION_CREATE_CONTACT_URL
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
  // WHEN THE USER UPGRADES HIS OWN PROFILE (NAME AND / OR SURNAME) THE USER-SERVICE
  // SEND THE UPDATED USER OBJECT TO AUTH SERVICE (THIS COMPONENT) THAT REPUBLISH IT
  public publishUpdatedUser(updated_user) {
    console.log('AUTH SERV - UPDATED USER OBJECT RECEIVED FROM USER SERV (BEFORE TO REPUBLISH IT): ', updated_user);

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

  ////// OAuth Methods /////

  googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.oAuthLogin(provider);
  }

  githubLogin() {
    const provider = new firebase.auth.GithubAuthProvider();
    return this.oAuthLogin(provider);
  }

  facebookLogin() {
    const provider = new firebase.auth.FacebookAuthProvider();
    return this.oAuthLogin(provider);
  }

  twitterLogin() {
    const provider = new firebase.auth.TwitterAuthProvider();
    return this.oAuthLogin(provider);
  }

  private oAuthLogin(provider: firebase.auth.AuthProvider) {
    return this.afAuth.auth.signInWithPopup(provider)
      .then((credential) => {
        this.notify.update('Welcome to Chat21 dashboard!!!', 'success');
        // return this.updateUserData(credential.user); // !!! NO MORE USED
      })
      .catch((error) => this.handleError(error));
  }

  //// Anonymous Auth ////

  anonymousLogin() {
    return this.afAuth.auth.signInAnonymously()
      .then((user) => {
        this.notify.update('Welcome to Firestarter!!!', 'success');
        // return this.updateUserData(user); // if using firestore !!! NO MORE USED
      })
      .catch((error) => {
        console.error(error.code);
        console.error(error.message);
        this.handleError(error);
      });
  }



  //// Email/Password Auth //// NO MORE USED see ABOVE mDbEmailSignUp
  emailSignUp(email: string, password: string, displayName: string) {
    console.log('x USER display name ', displayName);
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then((user) => {
        console.log('x USER ', user);
        console.log('x USER email ', user.email);
        console.log('x USER psw ', user.password);
        // user.displayName = displayName;
        // user.updateProfile({ 'displayName': displayName });
        this.displayName = displayName;
        this.notify.update('Welcome to Chat21 dashboard!!!', 'success');
        this.router.navigate(['/']);
        // return this.updateUserData(user); // if using firestore !!! NO MORE USED
      })
      .catch((error) => this.handleError(error));
  }
  // emailSignUpWithDisplayName(email: string, password: string, displayName: string) {
  //     return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
  //      .then((user) => {
  //         // Add a display name to the user.
  //      user.updateProfile({ 'displayName': displayName }).then(() => {
  //       // Update successful
  //         this.authState = user
  //       });
  //         this.updateUserData()
  //       })
  //       .catch(error =>{
  //         console.log(error);
  //         // THrow the exception which results when user signsup
  //          throw(error);
  //         });
  //   }

  emailLogin(email: string, password: string) {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password)
      .then((user) => {
        console.log('LOGGED USER ', user);
        this.notify.update('Welcome to Chat21 dashboard!!!', 'success');
        this.router.navigate(['/']);
        // return this.updateUserDataLogin(user); // if using firestore !!! NO MORE USED
      })
      .catch((error) => {
        this.handleError(error);
        console.log('xx ', error);
      });

  }

  // Sends email allowing user to reset password
  resetPassword(email: string) {
    const fbAuth = firebase.auth();

    return fbAuth.sendPasswordResetEmail(email)
      .then(() => this.notify.update('Password update email sent', 'info'))
      .catch((error) => this.handleError(error));
  }



  // RECEIVE THE the project (name and id) AND PUBLISHES
  projectSelected(project: Project) {
    // PUBLISH THE project
    console.log('!!!AUTH SERVICE: I PUBLISH THE PROJECT RECEIVED FROM PROJECT COMP ', project)
    // tslint:disable-next-line:no-debugger
    // debugger
    this.project_bs.next(project);
  }

  hasClickedGoToProjects() {
    console.log('HAS BEEN CALLED HAS CLICKED GOTO PROJECTS')
    this.project_bs.next(null);
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
    // !!! NO MORE USED
    // this.afAuth.auth.signOut()

    this.user_bs.next(null);
    this.project_bs.next(null);

    localStorage.removeItem('user');
    localStorage.removeItem('project');
    localStorage.removeItem('role')

    firebase.auth().signOut()
      .then(function () {
        console.log('Signed Out');
      }, function (error) {
        console.error('Sign Out Error', error);
      });
    this.router.navigate(['/login']);
  }

  // If error, console log and notify user
  private handleError(error: Error) {
    console.error(error);
    this.notify.update(error.message, 'error');
  }


  // NOTE: THE projectUser_role IS PASSED FROM HOME.COMPONENT
  // public user_role(projectUser_role: string) {

  //   this._user_role = projectUser_role;
  //   console.log('AUTH SERV - USER ROLE ', this._user_role)
  // }

  // NOTE: THE projectUser_role is saved in storage from home.comp


  checkRole() {
    // setTimeout(() => {
    // this._user_role = this.usersLocalDbService.getUserRoleFromStorage();
    // this._user_role = 'agent';

    // if (this._user_role) {
    //   if (this._user_role === 'agent' || this._user_role === undefined) {
    //     console.log('!!! »»» AUTH SERV - CHECK ROLE (GOT FROM STORAGE) »»» ', this._user_role)
    //     this.router.navigate(['/unauthorized']);
    //   } else {
    //     console.log('!!! »»» AUTH SERV - CHECK ROLE (GOT FROM STORAGE) »»» ', this._user_role)
    //   }
    // }
    // }, 50);
  }

  // Sets user data to firestore after succesful login - !!! NO MORE USED
  // private updateUserData(user: User) {

  //   const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);

  //   const data: User = {
  //     uid: user.uid,
  //     email: user.email || null,
  //     displayName: this.displayName || 'nameless user',
  //     photoURL: user.photoURL || 'https://goo.gl/Fz9nrQ',
  //     time: new Date().getTime(),
  //   };
  //   return userRef.set(data);
  // }

  // Sets user data to firestore after succesful login - !!! NO MORE USED
  // private updateUserDataLogin(user: User) {

  //   const userRef: AngularFirestoreDocument<User> = this.afs.doc(`users/${user.uid}`);

  //   const data: User = {
  //     uid: user.uid,
  //     email: user.email || null,
  //     photoURL: user.photoURL || 'https://goo.gl/Fz9nrQ',
  //     time: new Date().getTime(),
  //   };
  //   return userRef.set(data);
  // }
}
