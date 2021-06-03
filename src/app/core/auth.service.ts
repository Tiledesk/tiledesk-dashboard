// tslint:disable:max-line-length
import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, NavigationStart } from '@angular/router';
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
import { LocalDbService } from '../services/users-local-db.service';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs/Subscription';
import { isDevMode } from '@angular/core';
import * as firebase from 'firebase';
import 'firebase/messaging';
import 'firebase/database'
import { AppConfigService } from '../services/app-config.service';
import { WebSocketJs } from '../services/websocket/websocket-js';
// import { SsoService } from './sso.service';

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

  // SERVER_BASE_PATH = environment.SERVER_BASE_URL; // now get from appconfig


  // SIGNUP_BASE_URL = environment.mongoDbConfig.SIGNUP_BASE_URL;
  // SIGNIN_BASE_URL = environment.mongoDbConfig.SIGNIN_BASE_URL;
  // VERIFY_EMAIL_BASE_URL = environment.mongoDbConfig.VERIFY_EMAIL_BASE_URL;
  // FIREBASE_SIGNIN_BASE_URL = environment.mongoDbConfig.FIREBASE_SIGNIN_BASE_URL; // deprecated - now used CREATE_CUSTOM_TOKEN

  // SIGNUP_BASE_URL = this.SERVER_BASE_PATH + 'auth/signup'; // now built after get SERVER_BASE_PATH from appconfig
  // SIGNIN_BASE_URL = this.SERVER_BASE_PATH + 'auth/signin'; // now built after get SERVER_BASE_PATH from appconfig
  // VERIFY_EMAIL_URL = this.SERVER_BASE_PATH + 'auth/verifyemail/'; // now build after get SERVER_BASE_PATH from appconfig
  // CREATE_CUSTOM_TOKEN_URL = this.SERVER_BASE_PATH + 'chat21/firebase/auth/createCustomToken'; // now build after get SERVER_BASE_PATH from appconfig

  SERVER_BASE_PATH: string;
  SIGNUP_BASE_URL: string;
  SIGNIN_BASE_URL: string;
  VERIFY_EMAIL_URL: string;
  CREATE_CUSTOM_TOKEN_URL: string

  // CLOUDFUNCTION_CREATE_CONTACT_URL = environment.cloudFunctions.cloud_func_create_contact_url;
  // CLOUDFUNCTION_CREATE_CONTACT_URL: string; // NO MORE USED


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
  // FCM: Firebase Cloud Massaging
  FCM_Supported: boolean;

  project_trial_expired: boolean;
  IS_ANALYTICS_PAGE: boolean;
  IS_ANALYTICS_DEMO_PAGE: boolean;
  current_project_trial_expired: boolean;

  URL_last_fragment: string;
  HAS_JWT: boolean;

  selected_project_id: string;
  public_Key: string;

  constructor(
    http: Http,
    // private afAuth: AngularFireAuth,
    private router: Router,
    private notify: NotifyService,
    private usersLocalDbService: LocalDbService,
    private route: ActivatedRoute,
    public location: Location,
    public appConfigService: AppConfigService,
    public webSocketJs: WebSocketJs,
    // public ssoService: SsoService
  ) {
    this.http = http;
    console.log('version (AuthService)  ', this.version);
    console.log('!!! ====== AUTH SERVICE ====== !!!')
    this.APP_IS_DEV_MODE = isDevMode();
    console.log('!!! ====== AUTH SERVICE !!! ====== isDevMode ', this.APP_IS_DEV_MODE);

    this.checkCredentials();

    /* !!! NO MORE USED - REPLACED BY checkStoredProjectAndPublish() */
    // this.getProjectFromLocalStorage();

    this.checkStoredProjectAndPublish();

    // this.getParamsProjectId();
    // const messaging = firebase.messaging();

    if (appConfigService.getConfig().pushEngine === 'firebase') {
      this.checkIfFCMIsSupported();
    }


    this.checkIfExpiredSessionModalIsOpened();

    this.getAppConfigAnBuildUrl();
  }

  getAppConfigAnBuildUrl() {
    const firebase_conf = this.appConfigService.getConfig().firebase;
    // console.log('% appConfigService.getConfig().firebase ', firebase_conf)

    // const cloudBaseUrl = firebase_conf['chat21ApiUrl']; // NO MORE USED
    // this.CLOUDFUNCTION_CREATE_CONTACT_URL = cloudBaseUrl + '/api/tilechat/contacts'; // NO MORE USED
    // console.log('AppConfigService getAppConfig (AUTH SERVICE) CLOUDFUNCTION_CREATE_CONTACT_URL', this.CLOUDFUNCTION_CREATE_CONTACT_URL);

    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    this.SIGNUP_BASE_URL = this.SERVER_BASE_PATH + 'auth/signup';
    this.SIGNIN_BASE_URL = this.SERVER_BASE_PATH + 'auth/signin';
    this.VERIFY_EMAIL_URL = this.SERVER_BASE_PATH + 'auth/verifyemail/';
    this.CREATE_CUSTOM_TOKEN_URL = this.SERVER_BASE_PATH + 'chat21/firebase/auth/createCustomToken';

    console.log('AppConfigService getAppConfig (AUTH SERVICE) SERVER_BASE_PATH', this.SERVER_BASE_PATH);
    console.log('AppConfigService getAppConfig (AUTH SERVICE) SIGNUP_BASE_URL', this.SIGNUP_BASE_URL);
    console.log('AppConfigService getAppConfig (AUTH SERVICE) SIGNIN_BASE_URL', this.SIGNIN_BASE_URL);
    console.log('AppConfigService getAppConfig (AUTH SERVICE) VERIFY_EMAIL_URL', this.VERIFY_EMAIL_URL);
    console.log('AppConfigService getAppConfig (AUTH SERVICE) CREATE_CUSTOM_TOKEN_URL', this.CREATE_CUSTOM_TOKEN_URL);

  }


  public checkTrialExpired(): Promise<boolean> {
    // this.getProjectById();
    return new Promise<boolean>((resolve, reject) => {

      // console.log('»> »> PROJECT-PROFILE GUARD (WF in AUTH SERV) called checkTrialExpired! TRIAL EXPIRED ', this.project_trial_expired);
      console.log('»> »> PROJECT-PROFILE GUARD (WF in AUTH SERV) called checkTrialExpired!');
      resolve(this.project_trial_expired);

    });
  }




  // GET THE USER OBJECT FROM LOCAL STORAGE AND PASS IT IN user_bs
  checkCredentials() {
    const storedUser = localStorage.getItem('user')
    console.log('SSO AUTH SERVICE - CHECK CREDENTIAL - STORED USER  ', storedUser)


    this.subscription = this.router.events
      .subscribe((e) => {
        // if (e instanceof NavigationEnd) {
          if (e instanceof NavigationStart) {
          console.log('SSO - AUTH SERVICE - CHECK CREDENTIAL - params e ', e);
          console.log('SSO - AUTH SERVICE - CHECK CREDENTIAL - params e.url ', e.url);

          const current_url = e.url;
          this.HAS_JWT = current_url.includes('JWT');
          console.log('SSO - AUTH SERVICE - CHECK CREDENTIAL - current url HAS_JWT ', this.HAS_JWT);

        }
      })
    // console.log('USER BS VALUE', this.user_bs.value)
    if (storedUser !== null) {

      // /**
      //  * *** WIDGET - pass data to the widget function setTiledeskWidgetUser in index.html ***
      //  */
      // const _storedUser = JSON.parse(storedUser);
      // console.log('SetTiledeskWidgetUserSignin (AUTH-SERVICE) - storedUser', _storedUser)
      // const userFullname = _storedUser['firstname'] + ' ' + _storedUser['lastname'];
      // console.log('SetTiledeskWidgetUserSignin (AUTH-SERVICE) - userFullname', userFullname);
      // const userEmail = _storedUser['email']
      // console.log('SetTiledeskWidgetUserSignin (AUTH-SERVICE) - userEmail', userEmail);
      // const userId = _storedUser['_id']
      // console.log('SetTiledeskWidgetUserSignin (AUTH-SERVICE) - userId', userId);
      // console.log('SetTiledeskWidgetUserSignin (AUTH-SERVICE) - window', window);
      // // window['setTiledeskWidgetUser'](userFullname, userEmail, userId)


      this.user_bs.next(JSON.parse(storedUser));
      // this.user_bs.next(null);
      // this.router.navigate(['/home']);
    }
  }


  publishSSOloggedUser() {
    const storedUser = localStorage.getItem('user')
    if (storedUser !== null) {

      this.user_bs.next(JSON.parse(storedUser));
    }
  }


  checkIfFCMIsSupported() {
    if (firebase.messaging.isSupported()) {
      // Supported
      this.FCM_Supported = true;
      console.log('*** >>>> FCM is Supported: ', this.FCM_Supported);


    } else {
      // NOT Supported
      this.FCM_Supported = false;
      console.log('*** >>>> FCM is Supported: ', this.FCM_Supported);
    }
  }

  // USED ONLY FOR A TEST
  getParamsProjectId() {
    this.route.params.subscribe((params) => {
      console.log('!!! AUTH SETVICE - »»» TEST »»»- GET PROJECT ID ', params)
    })
  }


  // RECEIVE THE the project (name, id, profile_name, trial_expired and trial_days_left) AND PUBLISHES
  projectSelected(project: Project) {
    // PUBLISH THE project
    console.log('!!C-U AUTH SERVICE: I PUBLISH THE PROJECT RECEIVED FROM PROJECT COMP ', project);
    console.log('NAVBAR-FOR-PANEL - PUBLISH THE PROJECT RECEIVED FROM PROJECTS X PANEL ', project);
    // tslint:disable-next-line:no-debugger
    // debugger
    console.log('% »»» WebSocketJs WF +++++ ws-requests--- auth service PUBLISH THE PROJECT RECEIVED FROM PROJECT COMP', project._id)
    this.selected_project_id = project._id // used in checkRoleForCurrentProject if nav_project_id is undefined
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
      console.log('% »»» WebSocketJs WF +++++ ws-requests--- auth service checkStoredProjectAndPublish prjct (1)', prjct)

      console.log('»> »> PROJECT-PROFILE GUARD (WF in AUTH SERV checkStoredProjectAndPublish) prjct', prjct);
      console.log('!!C-U  - 1) »»»»» AUTH SERV - PROJECT FROM SUBSCRIP', prjct);

      if (prjct !== null && prjct._id !== undefined) {
        this.project_trial_expired = prjct.trial_expired;
        // tslint:disable-next-line:max-line-length
        console.log('»> »> PROJECT-PROFILE GUARD (WF in AUTH SERV checkStoredProjectAndPublish) TRIAL expired 1', this.project_trial_expired);
      }
      console.log('% »»» WebSocketJs WF +++++ ws-requests--- auth service checkStoredProjectAndPublish PROJECT (2)', prjct)
      if (prjct == null) {
        // console.log('!!C-U »»»»» AUTH SERV - PROJECT IS NULL: ', prjct);
        console.log('% »»» WebSocketJs WF +++++ ws-requests--- auth service checkStoredProjectAndPublish PROJECT IS NULL (3) ', prjct)

        /**
         * !!!! NO MORE - REPLACES 'router.events.subscribe' WITH 'location.path()'
         * BECAUSE OF 'events.subscribe' THAT IS ACTIVATED FOR THE FIRST
         * TIME WHEN THE PROJECT IS NULL AND THEN IS ALWAYS CALLED EVEN IF THE  PROJECT IS DEFINED */
        this.subscription = this.router.events
          .subscribe((e) => {
            if (e instanceof NavigationEnd) {
              // if (this.location.path() !== '') {
              // const current_url = this.location.path()
              const current_url = e.url
              console.log('% »»» WebSocketJs WF +++++ ws-requests--- auth service checkStoredProjectAndPublish NavigationEnd current_url (4)', current_url)
              console.log('!!C-U »»»»» AUTH SERV - CURRENT URL ', current_url);


              // ------------------------------------------------------------------
              // SINGLE SIGN-ON - STEP 1 - Check if the current url contains "?JWT" 
              // ------------------------------------------------------------------

              // const string_to_check = '?JWT';
              // if (current_url.includes(string_to_check)) {
              //   console.log('SSO (AUTH SERV) - ⚡️⚡️⚡️ HEY THERE IS A JWT IN THE CURRENT URL > SET USER TO NULL');

              //   this.user_bs.next(null);
              //   // this.router.navigate(['/autologin']);
              //   // this.ssoService.current_url_has_JWT_token(decodeURI(current_url));

              //   // this.subscription.unsubscribe();
              // }


              const url_segments = current_url.split('/');
              console.log('!!C-U »»»»» AUTH SERV - CURRENT URL SEGMENTS ', url_segments);


              this.nav_project_id = url_segments[2];
              console.log('% »»» WebSocketJs WF +++++ ws-requests--- auth service checkStoredProjectAndPublish this.nav_project_id (5)', this.nav_project_id)
              console.log('!! »»»»» AUTH SERV - CURRENT URL SEGMENTS > NAVIGATION PROJECT ID: ', this.nav_project_id);
              console.log('!! »»»»» AUTH SERV - CURRENT URL SEGMENTS > SEGMENT 1: ', url_segments[1]);

              // USECASE: ROUTES /projects (i.e., Recent Projects) /create-new-project 
              if (this.nav_project_id === undefined) {
                console.log('% »»» WebSocketJs WF +++++ ws-requests--- auth service --- QUI ENTRO 1 --- checkStoredProjectAndPublish this.nav_project_id (6)', this.nav_project_id)
                this.subscription.unsubscribe();
              }
              /**
               * (note: the NAVIGATION PROJECT ID returned from CURRENT URL SEGMENTS is = to 'email'
               * if the user navigate to the e-mail verification page)
               * the url_segments[1] is = to 'user' instead of 'project' when the user not yet has select a project
               * (i.e. from the project list page) and go to user profile > change password
               * If the CURRENT URL has only one element (for example /create-project (i.e. the wizard for the creation a of a project) 
               * the url_segments[2] (that is the project id) is undefined)
               * and the Workflow not proceed with the below code
               */
              // -----------------------------------------------------------------
              // this check is in auth.guard - auth.service - project-plan.service
              // -----------------------------------------------------------------
              if (this.nav_project_id &&
                this.nav_project_id !== 'email' &&
                url_segments[1] !== 'user' &&
                url_segments[1] !== 'handle-invitation' &&
                url_segments[1] !== 'signup-on-invitation' &&
                url_segments[1] !== 'resetpassword' &&
                url_segments[1] !== 'autologin' &&
                current_url !== '/projects'
              ) {

                console.log('!!C-U »»»»» QUI ENTRO ', this.nav_project_id);
                console.log('% »»» WebSocketJs WF +++++ ws-requests--- auth service --- QUI ENTRO 2 --- checkStoredProjectAndPublish this.nav_project_id (7)', this.nav_project_id)

                this.subscription.unsubscribe();

                const storedProjectJson = localStorage.getItem(this.nav_project_id);
                console.log('!! »»»»» AUTH SERV - JSON OF STORED PROJECT: ', storedProjectJson);

                // RUN THE BELOW ONLY IF EXIST THE PROJECT JSON SAVED IN THE STORAGE
                if (storedProjectJson) {
                  console.log('% »»» WebSocketJs WF +++++ ws-requests--- auth service checkStoredProjectAndPublish storedProjectJson (8)')

                  const storedProjectObject = JSON.parse(storedProjectJson);
                  console.log('!! »»»»» AUTH SERV - OBJECT OF STORED PROJECT', storedProjectObject);

                  const project_name = storedProjectObject['name'];
                  const project_profile_name = storedProjectObject['profile_name'];
                  const project_trial_expired = storedProjectObject['trial_expired'];
                  const project_trial_days_left = storedProjectObject['trial_days_left'];
                  this.project_trial_expired = storedProjectObject['trial_expired'];
                  const storedProjectOH = storedProjectObject['operatingHours'];

                  // tslint:disable-next-line:max-line-length
                  // console.log('»> »> PROJECT-PROFILE GUARD (WF in AUTH SERV checkStoredProjectAndPublish) TRIAL expired 2', this.project_trial_expired);

                  console.log('!! »»»»» AUTH SERV - PROJECT NAME GET FROM STORAGE: ', project_name);

                  const project: Project = {
                    _id: this.nav_project_id,
                    name: project_name,
                    profile_name: project_profile_name,
                    trial_expired: project_trial_expired,
                    trial_days_left: project_trial_days_left,
                    operatingHours: storedProjectOH
                  }
                  // console.log('!! AUTH in auth.serv  - 1) PROJECT THAT IS PUBLISHED: ', project);
                  // SE NN C'è IL PROJECT NAME COMUNQUE PUBBLICO PERCHè CON L'ID DEL PROGETTO VENGONO EFFETTUATE DIVERSE CALLBACK

                  /**** ******* ******* NEW BUG FIX ***** *** ** ***/

                  // if(prjct.id ) { }

                  // if (prjct && prjct._id !== this.nav_project_id) {

                  console.log('% »»» WebSocketJs WF +++++ ws-requests--- auth service checkStoredProjectAndPublish BEFORE TO PUBLISH this.project_bs.value (9) ', this.project_bs.value)
                  if (this.project_bs.value == null) {
                    console.log('% »»» WebSocketJs WF +++++ ws-requests--- auth service checkStoredProjectAndPublish PROJECT (get from storage) THAT IS PUBLISHED (10) ', project)
                    this.project_bs.next(project);
                  }

                  // }

                  // NOTA: AUTH GUARD ESEGUE UN CHECK DEL PROGETTO SALVATO NEL LOCAL STORAGE E SE IL PROJECT NAME è NULL DOPO AVER 'GET' IL
                  // PROGETTO PER nav_project_id SET THE ID and the NAME OF THE PROJECT IN THE LOCAL STORAGE and
                  // SENT THEM TO THE AUTH SERVICE THAT PUBLISHES
                  // if (project_name === null) {
                  //   console.log('!! »»»»» AUTH SERV - PROJECT NAME IS NULL')
                  // }
                } else {
                  console.log('% »»» WebSocketJs WF +++++ ws-requests--- auth service checkStoredProjectAndPublish FOR THE PRJCT ID ', this.nav_project_id, ' THERE IS NOT STORED PRJCT-JSON - SEE AUTH GUARD (11)')
                  // USE-CASE: FOR THE ID (GOT FROM URL) OF THE CURRENT PROJECT THERE IS NO THE JSON SAVED IN THE STORAGE:
                  // IT IS THE CASE IN WHICH THE USER ACCESS TO A NEW PROJECT IN THE DASHBOARD BY LINKS
                  // WITHOUT BEING PASSED FROM THE PROJECT LIST.
                  // IF THE STORED JSON OF THE PROJECT IS NULL  IS THE AUTH-GUARD THAT RUNS A REMOTE CALLBACK TO OBTAIN THE
                  // PROJECT BY ID AND THAT THEN PUBLISH IT AND SAVE IT (THE REMOTE CALLBACK IS PERFORMED IN AUTH-GUARD BECAUSE
                  // IS NOT POSSIBLE TO DO IT IN THIS SERVICE (BECAUSE OF THE CIRCULAR DEPEDENCY WARNING)  )
                  // tslint:disable-next-line:max-line-length
                  console.log('!! AUTH WF in auth.serv - FOR THE PRJCT ID ', this.nav_project_id, ' THERE IS NOT STORED PRJCT-JSON - SEE AUTH GUARD')
                  // this.projectService.getProjectById(this.nav_project_id).subscribe((prjct: any) => {

                  // public anyway to immediately make the project id available to subscribers
                  // the project name will be published by the auth.guard
                  const project: Project = {
                    _id: this.nav_project_id,
                  }
                  console.log('!! AUTH in auth.serv - 2) PROJECT THAT IS PUBLISHED: ', project);

                  this.project_bs.next(project);
                  console.log('% »»» WebSocketJs WF +++++ ws-requests--- auth service 2) PROJECT THAT IS PUBLISHED ', project)
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
    // this.selected_project_id

    let project_id = ''
    if (this.nav_project_id !== undefined) {
      project_id = this.nav_project_id
    } else {
      project_id = this.selected_project_id
    }

    const storedProjectJson = localStorage.getItem(project_id);
    console.log('!! »»»»» AUTH SERV - CHECK ROLE - JSON OF STORED PROJECT iD', project_id);
    console.log('!! »»»»» AUTH SERV - CHECK ROLE - JSON OF STORED PROJECT', storedProjectJson);
    if (storedProjectJson) {

      const storedProjectObject = JSON.parse(storedProjectJson);
      console.log('!! »»»»» AUTH SERV - CHECK ROLE - OBJECT OF STORED PROJECT', storedProjectObject);

      this._user_role = storedProjectObject['role'];

      if (this._user_role) {
        if (this._user_role === 'agent' || this._user_role === undefined) {
          console.log('!! »»»»» AUTH SERV - CHECK ROLE (GOT FROM STORAGE) »»» ', this._user_role);

          this.router.navigate([`project/${project_id}/unauthorized`]);
          // this.router.navigate(['/unauthorized']);
        } else {
          console.log('!! »»»»» AUTH SERV - CHECK ROLE (GOT FROM STORAGE) »»» ', this._user_role)
        }
      }
    }
  }

  // USED FOR PRICING WHOSE ACCESS IS PERMITTED ONLY TO THE OWNERS
  checkRoleForCurrentProjectAndRedirectAdminAndAgent() {
    console.log('!! »»»»» AUTH SERV - CHECK ROLE »»»»» CALLING CHECK-ROLE-FOR-CURRENT-PRJCT AND BLOCK ADMIN AND AGEBT');

    let project_id = ''
    if (this.nav_project_id !== undefined) {
      project_id = this.nav_project_id
    } else {
      project_id = this.selected_project_id
    }

    const storedProjectJson = localStorage.getItem(project_id);
    console.log('!! »»»»» AUTH SERV - CHECK ROLE - JSON OF STORED PROJECT iD', project_id);
    console.log('!! »»»»» AUTH SERV - CHECK ROLE - JSON OF STORED PROJECT', storedProjectJson);
    if (storedProjectJson) {

      const storedProjectObject = JSON.parse(storedProjectJson);
      console.log('!! »»»»» AUTH SERV - CHECK ROLE - OBJECT OF STORED PROJECT', storedProjectObject);

      this._user_role = storedProjectObject['role'];

      if (this._user_role) {
        if (this._user_role === 'agent' || this._user_role === 'admin' || this._user_role === undefined) {
          console.log('!! »»»»» AUTH SERV - CHECK ROLE (GOT FROM STORAGE) »»» ', this._user_role);

          this.router.navigate([`project/${project_id}/unauthorized-access`]);
          // this.router.navigate(['/unauthorized']);
        } else {
          console.log('!! »»»»» AUTH SERV - CHECK ROLE (GOT FROM STORAGE) »»» ', this._user_role)
        }
      }
    }
  }



  // !!! NO MORE USED
  // WHEN THE PAGE IS RELOADED THE project_id RETURNED FROM THE SUBSCRIPTION IS NULL SO IT IS GET FROM LOCAL STORAGE
  // getProjectFromLocalStorage() {
  //   const storedProject = localStorage.getItem('project')
  //   console.log('!! getProjectFromLocalStorage ', storedProject)
  //   this.project_bs.next(JSON.parse(storedProject));
  // }



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
        localStorage.setItem('chat_sv5__tiledeskToken', user.token); // x autologin of Chat ionic

        console.log('++ USER ', user)

        ///////////////////
        console.log('SSO - LOGIN 1. POST DATA ', jsonRes);
        if (jsonRes['success'] === true) {
          // ----------------------------------------------------------------------------------------------------------------------------------------------
          // Run chat21CreateFirebaseCustomToken() and signInWithCustomToken() if firebaseAuth === true - RUN getPermission() IF pushEngine  === 'firebase'
          // ----------------------------------------------------------------------------------------------------------------------------------------------
          // this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK
          console.log('SSO - LOGIN getConfig firebaseAuth', this.appConfigService.getConfig().firebaseAuth)
          // if (this.appConfigService.getConfig().chatEngine && this.appConfigService.getConfig().chatEngine !== 'mqtt') {
          if (this.appConfigService.getConfig().firebaseAuth === true) {
            console.log('SSO - LOGIN - WORKS WITH FIREBASE ')
            // '/chat21/firebase/auth/createCustomToken'
            this.chat21CreateFirebaseCustomToken(jsonRes['token']).subscribe(fbtoken => {

              // this.firebaseSignin(email, password).subscribe(fbtoken => {
              console.log('SSO - LOGIN 2. FIREBASE SIGNIN RESPO ', fbtoken)

              if (fbtoken) {
                // Firebase Sign in using custom token
                // firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE).then(() => {

                console.log('SSO - LOGIN - 3. FIREBASE CUSTOM AUTH setPersistence ');

                firebase.auth().signInWithCustomToken(fbtoken)
                  .then(firebase_user => {
                    console.log('SSO - LOGIN - 4. FIREBASE CUSTOM AUTH DATA ', firebase_user);

                    if (this.appConfigService.getConfig().pushEngine === 'firebase') {
                      if (!this.APP_IS_DEV_MODE && this.FCM_Supported === true) {
                        this.getPermission();
                      }
                    }

                    callback(null, user);
                  })
                  .catch(function (error) {
                    // return error;
                    callback(error);
                    // Handle Errors here.
                    // const errorCode = error.code;
                    console.log('SSO - LOGIN - FIREBASE CUSTOM AUTH ERROR CODE ', error)
                    // const errorMessage = error.message;
                    // console.log('FIREBASE CUSTOM AUTH ERROR MSG ', errorMessage)
                  });


                // }).catch(function (error) {
                //   callback(error);
                //   console.log('SSO - LOGIN - SET PERSISTENCE ERR ', error)
                // });

              } else {
                callback({ code: '4569', message: 'Error token not generated' });
              }
              // tslint:disable-next-line:no-debugger
              // debugger
            })

          } else {
            console.log('SSO - LOGIN - FIREBASE- AUTH false - !!!! SIGNIN WITHOUT FIREBASE CUSTOM TOKEN ')
            
            callback(null, user);

          } // ./end condition for X FIREBASE- AUTH
        } else {
          console.log('SSO - LOGIN - POST REQUEST ERROR jsonRes[success] NOT IS === true')
          callback({ code: jsonRes.code, message: jsonRes.message });
        }

      }).catch(function (error) {
        console.log('SSO - LOGIN - SIGNIN POST REQUEST ERROR', error);
        callback(error);
      })
  }


  getPermission() {
    console.log('SSO - LOGIN - 5. getPermission ')
    const messaging = firebase.messaging();
    if (firebase.messaging.isSupported()) {
      // messaging.requestPermission()
      Notification.requestPermission()
        .then(() => {
          console.log('SSO - LOGIN - 5B. >>>> getPermission Notification permission granted.');
          return messaging.getToken()
        })
        .then(FCMtoken => {
          console.log('>>>> getPermission FCMtoken', FCMtoken)
          // Save FCM Token in Firebase
          this.FCMcurrentToken = FCMtoken;
          this.updateToken(FCMtoken)
        })
        .catch((err) => {
          console.log('SSO - LOGIN - 5C. >>>> getPermission Unable to get permission to notify.', err);
        });
    }
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

  // !!!!!! NO MORE USED CREATE CONTACT ON FIREBASE Realtime Database
  // cloudFunctionsCreateContact(firstname, lastname, email) {
  //   const self = this;
  //   firebase.auth().currentUser.getIdToken(/* forceRefresh */ true)
  //     .then(function (token) {
  //       console.log('cloudFunctionsCreateContact idToken.', token);
  //       // console.log('idToken.', idToken);
  //       const headers = new Headers();
  //       headers.append('Accept', 'application/json');
  //       headers.append('Content-type', 'application/json');
  //       headers.append('Authorization', 'Bearer ' + token);

  //       const options = new RequestOptions({ headers });
  //       // const url = 'https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/contacts';
  //       const url = self.CLOUDFUNCTION_CREATE_CONTACT_URL
  //       const body = { 'firstname': firstname, 'lastname': lastname, 'email': email };

  //       self.http
  //         .post(url, JSON.stringify(body), options)
  //         .toPromise().then(res => {
  //           console.log('Cloud Functions Create Contact RES ', res)
  //         }).catch(function (error) {
  //           // Handle error
  //           console.log('Cloud Functions Create Contact RES ERROR', error);
  //         })

  //     }).catch(function (error) {
  //       // Handle error
  //       console.log('idToken.', error);
  //     });
  // }

  // !!!! DEPRECATED
  // NODE.JS FIREBASE SIGNIN (USED TO GET THE TOKEN THEN USED FOR Firebase Signin using custom token)
  // firebaseSignin(email: string, password: string) {
  //   const headers = new Headers();
  //   headers.append('Accept', 'application/json');
  //   headers.append('Content-type', 'application/json');
  //   const options = new RequestOptions({ headers });
  //   const url = this.FIREBASE_SIGNIN_BASE_URL;
  //   console.log('FIREBASE SIGNIN URL ', url)

  //   const body = { 'email': email, 'password': password };
  //   console.log('FIREBASE SIGNIN URL BODY ', body);
  //   // tslint:disable-next-line:no-debugger
  //   // debugger
  //   return this.http
  //     .post(url, JSON.stringify(body), options)
  //     .map((res) => {
  //       // tslint:disable-next-line:no-debugger
  //       // debugger
  //       // console.log('FIREBASE SIGNIN RES TOKEN', res.text())
  //       // const firebaseToken = res.text()
  //       return res.text()

  //     });
  // }

  chat21CreateFirebaseCustomToken(JWT_token: any) {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-type', 'application/json');
    headers.append('Authorization', JWT_token);
    const options = new RequestOptions({ headers });

    const url = this.CREATE_CUSTOM_TOKEN_URL;

    console.log('chat21CreateFirebaseCustomToken ', url)


    // tslint:disable-next-line:no-debugger
    // debugger
    return this.http
      .post(url, null, options)
      .map((res) => {
        // tslint:disable-next-line:no-debugger
        // debugger
        console.log('SSO - chat21CreateFirebaseCustomToken RES: ', res)
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

    const url = this.VERIFY_EMAIL_URL + user_id;
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


  /**
   * OLD CODE NOT USED
   */
  // // Sends email allowing user to reset password
  // resetPassword(email: string) {
  //   const fbAuth = firebase.auth();

  //   return fbAuth.sendPasswordResetEmail(email)
  //     .then(() => this.notify.update('Password update email sent', 'info'))
  //     .catch((error) => this.handleError(error));
  // }

  // // If error, console log and notify user
  // private handleError(error: Error) {
  //   console.error(error);
  //   this.notify.update(error.message, 'error');
  // }

  hasClickedGoToProjects() {
    this.project_bs.next(null);
    console.log('% »»» WebSocketJs WF +++++ ws-requests--- auth service  PUBLISH PRJCT = ', this.project_bs.next(null))
    console.log('% »»» WebSocketJs WF +++++ ws-requests--- auth service  PUBLISH PRJCT VALUE = ', this.project_bs.value)
    // console.log('!!C-U »»»»» AUTH SERV - HAS BEEN CALLED "HAS CLICKED GOTO PROJECTS" - PUBLISH PRJCT = ', this.project_bs.next(null))
    localStorage.removeItem('project');
  }

  // -----------------------------------------------------------------------
  // EXIPRED SESSION MODAL
  // -----------------------------------------------------------------------
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

      // -----------------------------------------------------------------------------------------------------------
    // Run showExpiredSessionPopup(); with the passed parameter IF firebaseAuth === 'firebase' else is always False
    // -------------------------------------------------------------------------------------------------------------
  showExpiredSessionPopup(showExpiredSessionPopup) {

    if (this.appConfigService.getConfig().firebaseAuth === 'firebase') {
      this.show_ExpiredSessionPopup = showExpiredSessionPopup;
      console.log('AUTH SERV - SHOW EXPIRED SESSION POPUP - (USE CASE FIREBASE AUTH) ', this.show_ExpiredSessionPopup)
    } else {
      this.show_ExpiredSessionPopup = false;
      console.log('AUTH SERV - SHOW EXPIRED SESSION POPUP - (USE CASE NO FIREBASE AUTH) ', this.show_ExpiredSessionPopup)
    }
  }


    // ----------------------------------------------------------------------------------------------------------------------------
    // @ ShowExiperdSessionPopup  when userIsSignedIn if firebaseAuth === 'firebase else is always False
    // ----------------------------------------------------------------------------------------------------------------------------
  // PASSED FROM APP.COMPONENT.TS
  userIsSignedIn(user_is_signed_in: boolean) {
    if (this.appConfigService.getConfig().firebaseAuth === 'firebase') {
      console.log('AUTH SERV - USER-IS-SIGNED-IN - SHOW EXPIRED SESSION POPUP - (USE CASE FIREBASE AUTH) ', user_is_signed_in);

      if (this.show_ExpiredSessionPopup === true) {
        this.notify.showExiperdSessionPopup(user_is_signed_in);
      }
    } else {
      console.log('AUTH SERV - USER-IS-SIGNED-IN - SHOW EXPIRED SESSION POPUP - (USE CASE NO FIREBASE AUTH) - DOES NOT RUN this.notify.showExiperdSessionPopup');
    }

  }

  // --------------------------------------------------------------------------------------------------------------
  // @ Subscribe to isOpenedExpiredSessionModal (which the run checkIfFCMIsSupported) IF firebaseAuth === 'firebase'
  // -------------------------------------------------------------------------------------------------------------- 
  checkIfExpiredSessionModalIsOpened() {
    if (this.appConfigService.getConfig().firebaseAuth === 'firebase') {
      console.log('AUTH SERV - CHECK-IF-EXPIRED-SESSSION-MODAL-IS-OPENED (USE CASE FIREBASE AUTH) subscribe to isOpenedExpiredSessionModal');
      this.notify.isOpenedExpiredSessionModal.subscribe((isOpenedExpiredSession: boolean) => {
        console.log('isOpenedExpiredSession ', isOpenedExpiredSession, '*** >>>> FCM is Supported: ', this.FCM_Supported);
        if (isOpenedExpiredSession) {
          console.log('AUTH SERV - CHECK-IF-EXPIRED-SESSSION-MODAL-IS-OPENED (USE CASE FIREBASE) checkIfFCMIsSupported');
          if (this.FCM_Supported === undefined) {
            this.checkIfFCMIsSupported()
          }
        }
      })

    } else {
      console.log('AUTH SERV - CHECK-IF-EXPIRED-SESSSION-MODAL-IS-OPENED (USE CASE NO FIREBASE AUTH) DOES subscribe to isOpenedExpiredSessionModal');
    }
  }


  // -----------------------------------------------------------------------------------
  // @ Run when hasOpenedLogoutModal checkIfFCMIsSupported IF uploadEngine === 'firebase'
  // ----------------------------------------------------------------------------------- 
  hasOpenedLogoutModal(isOpenedlogoutModal: boolean) {
    console.log('AUTH SERV - HAS-OPENED-LOGOUT-MODAL getConfig chatEngine', this.appConfigService.getConfig().uploadEngine)
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      console.log('AUTH SERV - HAS-OPENED-LOGOUT-MODAL - WORKS WITH FIREBASE  RUN checkIfFCMIsSupported');
      console.log('AUTH SERV - HAS-OPENED-LOGOUT-MODAL ', isOpenedlogoutModal, '*** >>>> FCM is Supported: ', this.FCM_Supported);
      if (isOpenedlogoutModal) {
        if (this.FCM_Supported === undefined) {
          this.checkIfFCMIsSupported()
        }
      }
    } else {
      console.log('AUTH SERV - HAS-OPENED-LOGOUT-MODAL - WORKS WITHOUT FIREBASE DOES NOT RUN checkIfFCMIsSupported');
    }
  }


  signOut(calledby: string ) {
    console.log('Signout calledby +++++ ', calledby)

    this.user_bs.next(null);
    this.project_bs.next(null);
    console.log('SIGNOUT project_bs VALUE: ', this.project_bs.value);

    localStorage.removeItem('user');
    localStorage.removeItem('project');
    localStorage.removeItem('role')
    this.webSocketClose();
    // ------------------------------------------------------------------------------------------------------------
    // RUN removeInstanceIdAndSignout() if pushEngine === 'firebase' + 
    // in  removeInstanceIdAndSignout if  firebaseAuth === 'firebase' run  firebaseSignout else signoutNoFirebase
    // --------------------------------------------------------------------------------------------------------- 
    // this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK
    console.log('Signout getConfig pushEngine', this.appConfigService.getConfig().chatEngine)
    if (this.appConfigService.getConfig().pushEngine === 'firebase') {
      console.log('signOut WITH FIREBASE');
      if (!this.APP_IS_DEV_MODE && this.FCM_Supported === true) {

        console.log('this.FCMcurrentToken ', this.FCMcurrentToken);
        console.log('here 1 ');
        if (this.FCMcurrentToken !== undefined && this.userId !== undefined) {
          console.log('here 2 ');

          this.removeInstanceIdAndSignout(calledby);

        } else {
          console.log('here 3 ');
          // use case: FCMcurrentToken is undefined
          // (e.g. the user refresh the page or not is FCMcurrentToken created at the login)
          const messaging = firebase.messaging();
          messaging.getToken()
            .then(FCMtoken => {
              console.log('>>>> getPermission FCMtoken', FCMtoken)
              this.FCMcurrentToken = FCMtoken;
              const storedUser = localStorage.getItem('user');
              const storedUserObj = JSON.parse(storedUser);
              console.log('signOut - storedUserObj ', storedUserObj);
              this.userId = storedUserObj._id;

              this.removeInstanceIdAndSignout(calledby);

            }).catch((err) => {
              console.log('err: ', err);
              if (this.appConfigService.getConfig().firebaseAuth === true) {
                this.firebaseSignout(calledby);
              } else {
                this.signoutNoFirebase(calledby)
              }

            });
        }
      } else {
        if (this.appConfigService.getConfig().firebaseAuth === true) {
          this.firebaseSignout(calledby);
        } else {
          this.signoutNoFirebase(calledby)
        }
      }
    } else {
      if (this.appConfigService.getConfig().firebaseAuth === true) {
        this.firebaseSignout(calledby);
      } else {
        this.signoutNoFirebase(calledby)
      }
    }
  }


  removeInstanceIdAndSignout(calledby) {
    console.log('here 4')
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

          if (this.appConfigService.getConfig().firebaseAuth === 'firebase') {
            that.firebaseSignout(calledby);
          } else {
            that.signoutNoFirebase(calledby)
          }

        }).catch((err) => {
          console.log('removeInstanceId - err: ', err);

          if (this.appConfigService.getConfig().firebaseAuth === 'firebase') {
            that.firebaseSignout(calledby);
          } else {
            that.signoutNoFirebase(calledby)
          }
        });
    }
  }



  firebaseSignout(calledby) {
    const that = this;
    firebase.auth().signOut()
      .then(function () {
        console.log('Signed Out');
        that.widgetReInit()

        // if (!that.HAS_JWT) {
        //   that.router.navigate(['/login']);
        // }

        if (calledby !== 'autologin') {
          that.router.navigate(['/login']);
        }
      }, function (error) {
        console.error('Sign Out Error', error);
        that.widgetReInit()

        // if (!that.HAS_JWT) {
        //   that.router.navigate(['/login']);
        // }

        if (calledby !== 'autologin') {
          that.router.navigate(['/login']);
        }
      });
  }

  signoutNoFirebase(calledby) {
    // console.log('SIMPLE LOGOUT (NO-FIREBASE SIGN-OUT)')
    // this.user_bs.next(null);
    // this.project_bs.next(null);
    // console.log('SIGNOUT project_bs VALUE: ', this.project_bs.value);

    // localStorage.removeItem('user');
    // localStorage.removeItem('project');
    // localStorage.removeItem('role');
    // this.webSocketClose();
    // if (!this.HAS_JWT) {
    //   this.router.navigate(['/login']);
    // }

    if (calledby !== 'autologin') {
      this.router.navigate(['/login']);
    }
  }


  webSocketClose() {
    this.webSocketJs.close()
  }

  widgetReInit() {
    if (window && window['tiledesk']) {
      console.log('AUTH-SERVICE   window[-tiledesk ', window['tiledesk'])
      try {
        window['tiledesk'].reInit();
      } catch (err) {
        console.log('AUTH-SERVICE  widgetReInit error ', err);
      }
      // alert('logout');
    }
  }

}
