// tslint:disable:max-line-length
import { Injectable } from '@angular/core'
import {
  Router,
  NavigationEnd,
  ActivatedRoute,
  NavigationStart,
} from '@angular/router'
import { NotifyService } from './notify.service'
import { Observable } from 'rxjs'
import { environment } from '../../environments/environment'
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { User } from '../models/user-model'
import { Project } from '../models/project-model'
import { LocalDbService } from '../services/users-local-db.service'
import { Location } from '@angular/common'
import { Subscription, BehaviorSubject } from 'rxjs'
import { isDevMode } from '@angular/core'
import * as firebase from 'firebase/app'
import 'firebase/messaging'
import 'firebase/database'
import { AppConfigService } from '../services/app-config.service'
import { WebSocketJs } from '../services/websocket/websocket-js'
import { LoggerService } from '../services/logger/logger.service'
import { ScriptService } from '../services/script/script.service'
import { APP_SUMO_PLAN_NAME, PLAN_NAME } from 'app/utils/util'
import { BrandService } from 'app/services/brand.service'
import { CacheService } from 'app/services/cache.service'
// import { ProjectPlanService } from 'app/services/project-plan.service'

// import { SsoService } from './sso.service';

// start SUPER USER
export class SuperUser {
  constructor(
    public email: string, // FOR SUPERUSER
  ) { }
}
const superusers = [
  new SuperUser('andrea.sponziello21@frontiere21.it'),
  new SuperUser('nicola.lanzilotto@frontiere21.it'),
  new SuperUser('lanzilottonicola74@gmail.com'),
]
// .end SUPER USER

@Injectable()
export class AuthService {
  PLAN_NAME = PLAN_NAME;
  APP_SUMO_PLAN_NAME = APP_SUMO_PLAN_NAME;
  SERVER_BASE_PATH: string
  SIGNUP_BASE_URL: string
  SIGNIN_BASE_URL: string
  VERIFY_EMAIL_URL: string
  CREATE_CUSTOM_TOKEN_URL: string

  // public version: string = require('../../../package.json').version;
  public version: string = environment.VERSION
  token: string
  displayName?: string
  FCMcurrentToken: string

  public user_bs: BehaviorSubject<User> = new BehaviorSubject<User>(null)
  public project_bs: BehaviorSubject<Project> = new BehaviorSubject<Project>(null)
  public settingSidebarIsOpned: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true)
  public nativeBotSidebarIsOpened: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null)
  public tilebotSidebarIsOpened: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null)
  public botsSidebarIsOpened: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null)
  public isChromeVerGreaterThan100: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null)

  show_ExpiredSessionPopup: boolean

  _user_role: string
  nav_project_id: string
  subscription: Subscription
  userId: string
  APP_IS_DEV_MODE: boolean
  // FCM: Firebase Cloud Massaging
  FCM_Supported: boolean

  project_trial_expired: boolean
  IS_ANALYTICS_PAGE: boolean
  IS_ANALYTICS_DEMO_PAGE: boolean
  current_project_trial_expired: boolean

  URL_last_fragment: string
  HAS_JWT: boolean

  selected_project_id: string
  public_Key: string;
  appSumoProfile: string;
  prjct_profile_name_for_segment: string;
  customRedirectAfterLogout: boolean;
  afterLogoutRedirectURL: string

  constructor(
    private _httpClient: HttpClient,
    private router: Router,
    private notify: NotifyService,
    private localDbService: LocalDbService,
    private route: ActivatedRoute,
    public location: Location,
    public appConfigService: AppConfigService,
    public webSocketJs: WebSocketJs,
    private logger: LoggerService,
    public brandService: BrandService,
    private scriptService: ScriptService,
    private cacheService:  CacheService
    // private prjctPlanService: ProjectPlanService,
  ) // public ssoService: SsoService
  {

    const brand = brandService.getBrand();
    this.customRedirectAfterLogout = brand['custom_redirect_after_logout'];
    this.logger.log('[AUTH-SERV] customRedirectAfterLogout ', this.customRedirectAfterLogout)
    if (this.customRedirectAfterLogout === true) {
      this.afterLogoutRedirectURL = brand['after_logout_redirect_URL'];
      this.logger.log('[AUTH-SERV] afterLogoutRedirectURL ', this.afterLogoutRedirectURL)
    }

    this.logger.log('[AUTH-SERV] !!! ====== HELLO AUTH SERVICE ====== DASHBOARD version ', this.version)
    this.APP_IS_DEV_MODE = isDevMode()
    // this.logger.log('[AUTH-SERV] ====== isDevMode ', this.APP_IS_DEV_MODE);

    this.checkIfExistStoredUserAndPublish()
    this.checkStoredProjectAndPublishIfPublishedProjectIsNull()

    this.logger.log('[AUTH-SERV] appConfigService.getConfig().pushEngine 1 ', appConfigService.getConfig().pushEngine)
    if (appConfigService.getConfig().pushEngine === 'firebase') {
      this.logger.log('[AUTH-SERV] appConfigService.getConfig().pushEngine 2 ', appConfigService.getConfig().pushEngine)
      this.checkIfFCMIsSupported()
    }

    this.checkIfExpiredSessionModalIsOpened()
    this.getAppConfigAnBuildUrl()
    // this.getProjectPlan()
  }



  browserNameAndVersion(browserName, browserVersion) {
    // this.logger.log('[AUTH-SERV] browserName ', browserName)
    // this.logger.log('[AUTH-SERV] browserVersion ', browserVersion)
    const browserbrowserVersionArray = browserVersion.split(" ")
    // this.logger.log('[AUTH-SERV] browserbrowserVersionArray ', browserbrowserVersionArray)
    if (browserName === 'chrome') {
      const version = +browserbrowserVersionArray[1];
      // this.logger.log('[AUTH-SERV] version ', version)
      if (version === 101 || version > 101) {
        this.isChromeVerGreaterThan100.next(true)
      }
    }
  }

  getAppConfigAnBuildUrl() {
    const firebase_conf = this.appConfigService.getConfig().firebase
    // this.logger.log('[AUTH-SERV] AppConfigService getAppConfig firebase_conf', firebase_conf)

    this.SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL
    this.SIGNUP_BASE_URL = this.SERVER_BASE_PATH + 'auth/signup'
    this.SIGNIN_BASE_URL = this.SERVER_BASE_PATH + 'auth/signin'
    this.VERIFY_EMAIL_URL = this.SERVER_BASE_PATH + 'auth/verifyemail/'
    this.CREATE_CUSTOM_TOKEN_URL = this.SERVER_BASE_PATH + 'chat21/firebase/auth/createCustomToken'

    // this.logger.log('[AUTH-SERV] AppConfigService getAppConfig SERVER_BASE_PATH', this.SERVER_BASE_PATH);
    // this.logger.log('[AUTH-SERV] AppConfigService getAppConfig SIGNUP_BASE_URL', this.SIGNUP_BASE_URL);
    // this.logger.log('[AUTH-SERV] AppConfigService getAppConfig SIGNIN_BASE_URL', this.SIGNIN_BASE_URL);
    // this.logger.log('[AUTH-SERV] AppConfigService getAppConfig VERIFY_EMAIL_URL', this.VERIFY_EMAIL_URL);
    // this.logger.log('[AUTH-SERV] AppConfigService getAppConfig CREATE_CUSTOM_TOKEN_URL', this.CREATE_CUSTOM_TOKEN_URL);
  }

  // -------------------------------------------------------------------------
  // CHECK IF TRIAL HAS EXPIRED - THE VALUE IS PASSED TO PROJECT-PROFILE-GUARD
  // -------------------------------------------------------------------------
  public checkTrialExpired(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.logger.log('[AUTH-SERV] »> »> PROJECT-PROFILE GUARD (WF in AUTH SERV) called checkTrialExpired!')
      resolve(this.project_trial_expired)
    })
  }

  // --------------------------------------------------------------------------------------
  // GET THE USER OBJECT FROM LOCAL STORAGE AND PUBLISH IT WITH THE BehaviorSubject user_bs
  // --------------------------------------------------------------------------------------
  checkIfExistStoredUserAndPublish() {
    const storedUser = localStorage.getItem('user')
    // this.logger.log('[AUTH-SERV] »> »> PUBLISH STORED USER ', storedUser);
    if (storedUser !== null) {
      this.user_bs.next(JSON.parse(storedUser))

      window.addEventListener('load', () => {
        try {
          this.logger.log('[AUTH-SERV] Calling tiledesk_widget_login ')
          if (window && window['tiledesk_widget_login']) {
            // this.logger.log('window', window)
            window['tiledesk_widget_login']()
          }
        } catch (err) {
          this.logger.error('[AUTH-SERV] Calling tiledesk_widget_login err', err)
        }
      })

      // /**
      //  * *** WIDGET - pass data to the widget function setTiledeskWidgetUser in index.html ***
      //  */
      // const _storedUser = JSON.parse(storedUser);
      // this.logger.log('SetTiledeskWidgetUserSignin (AUTH-SERVICE) - storedUser', _storedUser)
      // const userFullname = _storedUser['firstname'] + ' ' + _storedUser['lastname'];
      // this.logger.log('SetTiledeskWidgetUserSignin (AUTH-SERVICE) - userFullname', userFullname);
      // const userEmail = _storedUser['email']
      // this.logger.log('SetTiledeskWidgetUserSignin (AUTH-SERVICE) - userEmail', userEmail);
      // const userId = _storedUser['_id']
      // this.logger.log('SetTiledeskWidgetUserSignin (AUTH-SERVICE) - userId', userId);
      // this.logger.log('SetTiledeskWidgetUserSignin (AUTH-SERVICE) - window', window);
      // // window['setTiledeskWidgetUser'](userFullname, userEmail, userId)
    }
  }

  // --------------------------------------------------------------------------------------
  // CALLED BY AUTOLOGIN AFTER  getCurrentAuthenticatedUser(JWT)
  // --------------------------------------------------------------------------------------
  publishSSOloggedUser() {
    const storedUser = localStorage.getItem('user')
    // this.logger.log('[AUTH-SERV] publishSSOloggedUser storedUser ', storedUser)
    if (storedUser !== null) {
      this.user_bs.next(JSON.parse(storedUser))

      window.addEventListener('load', () => {
        this.logger.log('[AUTH-SERV] window load - window ', window)
        try {
          this.logger.log('[AUTH-SERV] Calling tiledesk_widget_autologin ')
          if (window && window['tiledesk_widget_autologin']) {
            // this.logger.log('window', window)
            window['tiledesk_widget_autologin']()
          }
        } catch (err) {
          this.logger.error('[AUTH-SERV] Calling tiledesk_widget_autologin err', err)
        }
      })
    }
  }

  checkIfFCMIsSupported() {
    if (firebase.messaging.isSupported()) {
      // Supported
      this.FCM_Supported = true
      this.logger.log('[AUTH-SERV] *** >>>> FCM is Supported: ', this.FCM_Supported)
    } else {
      // NOT Supported
      this.FCM_Supported = false
      this.logger.log('[AUTH-SERV] *** >>>> FCM is Supported: ', this.FCM_Supported)
    }
  }

  // USED ONLY FOR A TEST
  getParamsProjectId() {
    this.route.params.subscribe((params) => {
      this.logger.log('[AUTH-SERV] - »»» TEST »»»- GET PROJECT ID ', params)
    })
  }

  // RECEIVE FROM VARIOUS COMP THE OBJECT PROJECT AND PUBLISH
  projectSelected(project: Project, calledBy) {
    // PUBLISH THE project
    this.logger.log('[AUTH-SERV] - PUBLISH THE PROJECT OBJECT RECEIVED project', project , ' calledBy ', calledBy)
    this.logger.log('[AUTH-SERV] PUBLISH THE PROJECT OBJECT RECEIVED  > selected_project_id ', project._id,)
    this.selected_project_id = project._id // used in checkRoleForCurrentProject if nav_project_id is undefined
    this.project_bs.next(project)
  }

  projectProfile(projectprofile) {
    this.logger.log('[AUTH-SERV] - PROJECT PROFILE ', projectprofile)
    this.prjct_profile_name_for_segment = projectprofile
  }

  toggleSettingsSidebar(isopened) {
    this.logger.log('[AUTH-SERV] - TOGGLE SETTINGS SIDEBAR IS OPENED ', isopened)
    this.settingSidebarIsOpned.next(isopened)
  }

  toggleNativeBotSidebar(isopened) {
    this.logger.log('[AUTH-SERV] - TOGGLE NATIVE BOT SIDEBAR IS OPENED ', isopened)
    this.nativeBotSidebarIsOpened.next(isopened)
  }

  toggletilebotSidebar(isopened) {
    this.tilebotSidebarIsOpened.next(isopened)
    // this.logger.log('[AUTH-SERV] - TOGGLE NATIVE BOT SIDEBAR IS OPENED ', isopened)
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
  checkStoredProjectAndPublishIfPublishedProjectIsNull() {
    this.project_bs.subscribe((prjct) => {
     this.logger.log('[AUTH-SERV] - PROJECT FROM SUBSCRIPTION TO project_bs ', prjct)

      if (prjct !== null && prjct._id !== undefined) {
        this.project_trial_expired = prjct.trial_expired
        // tslint:disable-next-line:max-line-length
        this.logger.log('[AUTH-SERV] - PROJECT FROM SUBSCRIPTION TO project_bs > project_trial_expired',
          this.project_trial_expired,
        )
      }

      if (prjct == null) {
        this.logger.log('[AUTH-SERV] - PROJECT FROM SUBSCRIPTION TO project_bs IS NULL ', prjct)

        this.subscription = this.router.events.subscribe((e) => {
          if (e instanceof NavigationEnd) {
            const current_url = e.url
            this.logger.log('[AUTH-SERV] - NavigationEnd CURRENT-URL ', current_url,)

            const url_segments = current_url.split('/')
            this.logger.log('[AUTH-SERV] - NavigationEnd CURRENT-URL SEGMENTS ', url_segments)

            this.nav_project_id = url_segments[2]
            this.logger.log('[AUTH-SERV] - CURRENT-URL SEGMENTS > NAVIGATION PROJECT ID: ', this.nav_project_id,)

            // USECASE: ROUTES /projects (i.e., Recent Projects) /create-new-project
            if (this.nav_project_id === undefined) {
              this.logger.log('[AUTH-SERV] - CURRENT-URL SEGMENTS > NAVIGATION-PROJECT-ID IS UNDEFINED 1', this.nav_project_id, ' - UNSUBSCRIBE FROM ROUTER-EVENTS')
              this.subscription.unsubscribe()
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
            if (
              this.nav_project_id &&
              this.nav_project_id !== 'email' &&
              url_segments[1] !== 'user' &&
              url_segments[1] !== 'handle-invitation' &&
              url_segments[1] !== 'signup-on-invitation' &&
              url_segments[1] !== 'resetpassword' &&
              url_segments[1] !== 'autologin' &&
              url_segments[1] !== 'get-chatbot' &&
              url_segments[1] !== 'activate-product' &&
              url_segments[1] !== 'install-template' &&
              url_segments[1] !== 'create-project-itw' &&
              url_segments[1] !== 'install-template-np' &&
              url_segments[1] !== 'install-template-np' &&
              url_segments[1] !== 'success' &&
              current_url !== '/projects'
            ) {
              this.logger.log( '[AUTH-SERV] NAVIGATION-PROJECT-ID IS UNDEFINED 2', this.nav_project_id, ' - UNSUBSCRIBE FROM ROUTER-EVENTS')

              this.subscription.unsubscribe()

              const storedProjectJson = localStorage.getItem(this.nav_project_id)
              this.logger.log('[AUTH-SERV] - STORED PROJECT: ', storedProjectJson)

              // RUN THE BELOW ONLY IF EXIST THE PROJECT JSON SAVED IN THE STORAGE
              if (storedProjectJson) {
                const storedProjectObject = JSON.parse(storedProjectJson)
                this.logger.log('[AUTH-SERV] - STORED PROJECT OBJECT', storedProjectObject)

                this.logger.log('[AUTH-SERV] BEFORE TO PUBLISH this.project_bs.value ', this.project_bs.value)
                if (this.project_bs.value == null) {
                  this.logger.log('[AUTH-SERV] PROJECT (get from storage) THAT IS PUBLISHED ', storedProjectObject)
                  this.project_bs.next(storedProjectObject)
                }

                // const project_name = storedProjectObject['name']
                // const project_profile_name = storedProjectObject['profile_name']
                // const project_trial_expired = storedProjectObject['trial_expired']
                // const project_trial_days_left = storedProjectObject['trial_days_left']
                // this.project_trial_expired = storedProjectObject['trial_expired']
                // const storedProjectOH = storedProjectObject['operatingHours']

                // // tslint:disable-next-line:max-line-length
                // this.logger.log('[AUTH-SERV] - PROJECT NAME GET FROM STORAGE: ', project_name)

                // const project: Project = {
                //   _id: this.nav_project_id,
                //   name: project_name,
                //   profile_name: project_profile_name,
                //   trial_expired: project_trial_expired,
                //   trial_days_left: project_trial_days_left,
                //   operatingHours: storedProjectOH,
                // }
                // this.logger.log('!! AUTH in auth.serv  - 1) PROJECT THAT IS PUBLISHED: ', project);
                // // SE NN C'è IL PROJECT NAME COMUNQUE PUBBLICO PERCHè CON L'ID DEL PROGETTO VENGONO EFFETTUATE DIVERSE CALLBACK

                // /**** ******* ******* NEW BUG FIX ***** *** ** ***/

                // this.logger.log('[AUTH-SERV] BEFORE TO PUBLISH this.project_bs.value ', this.project_bs.value)
                // if (this.project_bs.value == null) {
                //   this.logger.log('[AUTH-SERV] PROJECT (get from storage) THAT IS PUBLISHED ', project)
                //   this.project_bs.next(project)
                // }
              } else {
                this.logger.log('[AUTH-SERV] THERE IS NOT STORED PRJCT-JSON - FOR THE PROJECT WITH ID ', this.nav_project_id, 'SEE AUTH GUARD')
                // USE-CASE: FOR THE ID (GOT FROM URL) OF THE CURRENT PROJECT THERE IS NO THE JSON SAVED IN THE STORAGE:
                // IT IS THE CASE IN WHICH THE USER ACCESS TO A NEW PROJECT IN THE DASHBOARD BY LINKS
                // WITHOUT BEING PASSED FROM THE PROJECT LIST.
                // IF THE STORED JSON OF THE PROJECT IS NULL  IS THE AUTH-GUARD THAT RUNS A REMOTE CALLBACK TO OBTAIN THE
                // PROJECT BY ID AND THAT THEN PUBLISH IT AND SAVE IT (THE REMOTE CALLBACK IS PERFORMED IN AUTH-GUARD BECAUSE
                // IS NOT POSSIBLE TO DO IT IN THIS SERVICE (BECAUSE OF THE CIRCULAR DEPEDENCY WARNING)

                // -------------------------------------------------------------------------
                // PUBLISH anyway to immediately make the project id available to subscribers
                // the project name will be published by the auth.guard
                // -------------------------------------------------------------------------
                const project: Project = {
                  _id: this.nav_project_id,
                }
                this.logger.log('[AUTH-SERV] PROJECT THAT IS PUBLISHED (ONLY THE PROJECT ID BECAUSE THE PROJECT IS NOT PRESENT IN THE STORAGE)', project)

                this.project_bs.next(project)
              }
            }
          }
        }) // this.router.events.subscribe((e)
      }
    })
  }

  checkRoleForCurrentProjectPermissionOnlyToOwner() {
    this.logger.log(  '[AUTH-SERV] - CHECK ROLE »»»»» CALLING CHECK-ROLE-FOR-CURRENT-PRJCT')
    let project_id = ''
    if (this.nav_project_id !== undefined) {
      project_id = this.nav_project_id
    } else {
      project_id = this.selected_project_id
    }

    const storedProjectJson = localStorage.getItem(project_id)
    this.logger.log('[AUTH-SERV] - CHECK ROLE - JSON OF STORED PROJECT iD', project_id)
    this.logger.log('[AUTH-SERV] - CHECK ROLE - JSON OF STORED PROJECT', storedProjectJson)
    if (storedProjectJson) {
      const storedProjectObject = JSON.parse(storedProjectJson)
      this.logger.log('[AUTH-SERV] - CHECK ROLE - OBJECT OF STORED PROJECT', storedProjectObject)

      this._user_role = storedProjectObject['role']

      if (this._user_role) {
        if (
          this._user_role === 'agent' ||
          this._user_role === 'admin' ||
          this._user_role === undefined
        ) {
          this.logger.log('[AUTH-SERV] - CHECK ROLE (GOT FROM STORAGE) »»» ', this._user_role)

          this.router.navigate([`project/${project_id}/unauthorized`])
          // this.router.navigate(['/unauthorized']);
        } else {
          this.logger.log('[AUTH-SERV] - CHECK ROLE (GOT FROM STORAGE) »»» ', this._user_role)
        }
      }
    }
  }

  checkRoleForCurrentProject() {
    this.logger.log('[AUTH-SERV] - CHECK ROLE »»»»» CALLING CHECK-ROLE-FOR-CURRENT-PRJCT')
    let project_id = ''
    if (this.nav_project_id !== undefined) {
      project_id = this.nav_project_id
    } else {
      project_id = this.selected_project_id
    }
    const storedProjectJson = localStorage.getItem(project_id)
    this.logger.log('[AUTH-SERV] - CHECK ROLE - JSON OF STORED PROJECT iD', project_id)
    this.logger.log('[AUTH-SERV] - CHECK ROLE - JSON OF STORED PROJECT', storedProjectJson)
    if (storedProjectJson) {
      const storedProjectObject = JSON.parse(storedProjectJson)
      this.logger.log('[AUTH-SERV] - CHECK ROLE - OBJECT OF STORED PROJECT', storedProjectObject)
      this._user_role = storedProjectObject['role']
      if (this._user_role) {
        if (this._user_role === 'agent' || this._user_role === undefined) {
          this.logger.log('[AUTH-SERV] - CHECK ROLE (GOT FROM STORAGE) »»» ', this._user_role)
          this.router.navigate([`project/${project_id}/unauthorized`])
          // this.router.navigate(['/unauthorized']);
        } else {
          this.logger.log('[AUTH-SERV] - CHECK ROLE (GOT FROM STORAGE) »»» ', this._user_role)
        }
      }
    }
  }

  // -------------------------------------------------------------
  // USED FOR PRICING WHOSE ACCESS IS PERMITTED ONLY TO THE OWNERS
  // -------------------------------------------------------------
  checkRoleForCurrentProjectAndRedirectAdminAndAgent() {
    this.logger.log('[AUTH-SERV] - CHECK ROLE »»»»» CALLING CHECK-ROLE-FOR-CURRENT-PRJCT (USED X PRICING) AND BLOCK ADMIN AND AGENT')

    let project_id = ''
    if (this.nav_project_id !== undefined) {
      project_id = this.nav_project_id
    } else {
      project_id = this.selected_project_id
    }

    const storedProjectJson = localStorage.getItem(project_id)
    this.logger.log('[AUTH-SERV] - CHECK ROLE - JSON OF STORED PROJECT iD', project_id)
    this.logger.log('[AUTH-SERV] - CHECK ROLE - JSON OF STORED PROJECT', storedProjectJson,)
    if (storedProjectJson) {
      const storedProjectObject = JSON.parse(storedProjectJson)
      this.logger.log('[AUTH-SERV] - CHECK ROLE - OBJECT OF STORED PROJECT', storedProjectObject)

      this._user_role = storedProjectObject['role']

      if (this._user_role) {
        if (
          this._user_role === 'agent' ||
          this._user_role === 'admin' ||
          this._user_role === undefined
        ) {
          this.logger.log('[AUTH-SERV] - CHECK ROLE (GOT FROM STORAGE) »»» ', this._user_role)

          this.router.navigate([`project/${project_id}/unauthorized-access`])
          // this.router.navigate(['/unauthorized']);
        } else {
          this.logger.log('[AUTH-SERV] - CHECK ROLE (GOT FROM STORAGE) »»» ', this._user_role)
        }
      }
    }
  }

  /**
   * SIGNUP - CREATE (POST)
   * @param email
   * @param password
   * @param first_name
   * @param last_name
   */
  public signup(email: string, password: string, first_name: string, last_name: string): Observable<any> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      })
    };

    const body = {
      email: email,
      password: password,
      firstname: first_name,
      lastname: last_name,
    }
    this.logger.log('[AUTH-SERV] - SIGNUP POST REQUEST BODY ', body)

    const url = this.SIGNUP_BASE_URL
    this.logger.log('[AUTH-SERV] - SIGNUP URL ', url)

    return this._httpClient
      .post(url, JSON.stringify(body), httpOptions)

  }

  /**
   * NODEJS SIGN-IN: SIGN-IN THE USER AND CREATE THE 'OBJECT USER' INCLUDED THE RETURNED (FROM SIGNIN) JWT TOKEN
   * NODEJS FIREBASE SIGN-IN: GET FIREBASE TOKEN THEN USED FOR
   * FIREBASE SIGN-IN USING CUSTOM TOKEN
   * @param email
   * @param password
   */
  signin(email: string, password: string, baseUrl: string, callback) {
    const self = this

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      })
    };

    const body = { email: email, password: password }
    this.logger.log('[AUTH-SERV] - SIGNIN POST REQUEST BODY ', body)

    // const url = this.SIGNIN_BASE_URL
    const url = baseUrl + 'auth/signin';
    // this.logger.log('[AUTH-SERV] - SIGNIN URL ', url)

    return this._httpClient
      .post(url, JSON.stringify(body), httpOptions)
      .toPromise()
      .then((res) => {
        this.logger.log('[AUTH-SERV] SIGNIN RES: ', res)
        const jsonRes = res
        const user: User = jsonRes['user']

        if (user) {
          // used in signOut > removeInstanceId
          this.userId = user._id
        }

        // ASSIGN THE RETURNED TOKEN TO THE USER OBJECT
        user.token = jsonRes['token']

        // const userRole = 
       

        // PUBLISH THE USER OBJECT
        this.user_bs.next(user)

        // SET USER IN LOCAL STORAGE
        localStorage.setItem('user', JSON.stringify(user))    
        localStorage.setItem('tiledesk_token', user.token) // x autologin of Chat ionic
        this.logger.log('[AUTH-SERV] > USER ', user)

        ///////////////////
        this.logger.log('[AUH-SERV] SSO - LOGIN 1. POST DATA ', jsonRes)
        if (jsonRes['success'] === true) {
          this.logger.log( '[AUTH-SERV] SSO - LOGIN getConfig firebaseAuth',this.appConfigService.getConfig().firebaseAuth )

          if (this.appConfigService.getConfig().firebaseAuth === true) {
            this.logger.log('[AUTH-SERV] SSO - LOGIN - WORKS WITH FIREBASE ')

            this.chat21CreateFirebaseCustomToken(jsonRes['token']).subscribe(
              (fbtoken: string) => {
                // this.firebaseSignin(email, password).subscribe(fbtoken => {
                this.logger.log('[AUTH-SERV] SSO - LOGIN 2. FIREBASE SIGNIN RESPO ', fbtoken)

                if (fbtoken) {
                  // Firebase Sign in using custom token
                  // firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE).then(() => {

                  // this.logger.log('[AUTH-SERV] SSO - LOGIN - 3. FIREBASE CUSTOM AUTH setPersistence ');

                  firebase
                    .auth()
                    .signInWithCustomToken(fbtoken)
                    .then((firebase_user) => {
                      this.logger.log('[AUTH-SERV] SSO - LOGIN - 4. FIREBASE CUSTOM AUTH DATA ', firebase_user)

                      if (this.appConfigService.getConfig().pushEngine === 'firebase') {
                        // if (!this.APP_IS_DEV_MODE && this.FCM_Supported === true) {
                        this.getPermission()
                        // } else {
                        //   this.logger.log('[AUTH-SERV] SSO - Unable to get permission FCM_Supported because of ', this.FCM_Supported , 'but APP_IS_DEV_MODE ', this.APP_IS_DEV_MODE);
                        // }
                      }

                      callback(null, user)
                    })
                    .catch((error) => {
                      // return error;
                      callback(error)
                      // Handle Errors here.
                      // const errorCode = error.code;
                      this.logger.error('[AUTH-SERV] SSO - LOGIN - FIREBASE CUSTOM AUTH ERROR CODE ', error)
                    })
                } else {
                  callback({
                    code: '4569',
                    message: 'Error token not generated',
                  })
                }
              },
            )
          } else {
            this.logger.log('[AUTH-SERV] SSO - LOGIN - FIREBASE- AUTH false - !!!! SIGNIN WITHOUT FIREBASE CUSTOM TOKEN ')

            if (this.appConfigService.getConfig().pushEngine === 'firebase') {
              this.getPermission()
            }

            callback(null, user)
          } // ./end condition for X FIREBASE- AUTH
        } else {
          this.logger.error('[AUTH-SERV] SSO - LOGIN - POST REQUEST ERROR jsonRes[success] NOT IS === true')
          callback({ code: jsonRes['code'], message: jsonRes['message'] })
        }
      })
      .catch((error) => {
        this.logger.error('[AUTH-SERV] SSO - LOGIN - SIGNIN POST REQUEST ERROR', error)
        callback(error)
      })
  }




  getPermission() {
    this.logger.log('[AUTH-SERV] SSO - LOGIN - 5. getPermission ')

    if (firebase.messaging.isSupported()) {
      const messaging = firebase.messaging()
      // messaging.requestPermission()
      Notification.requestPermission()
        .then((permission) => {
          this.logger.log('[AUTH-SERV] SSO - LOGIN - 5B. >>>> getPermission Notification permission granted. - permission', permission)
          this.logger.log('[AUTH-SERV] SSO - LOGIN - 5B. - vapidKey >>>> ', this.appConfigService.getConfig().firebase.vapidKey)

          return messaging.getToken({
            vapidKey: this.appConfigService.getConfig().firebase.vapidKey,
          })

        })
        .then((FCMtoken) => {
          this.logger.log('[AUTH-SERV] >>>> getPermission FCMtoken', FCMtoken)
          // Save FCM Token in Firebase
          this.FCMcurrentToken = FCMtoken
          this.updateToken(FCMtoken)
        })
        .catch((err) => {
          this.logger.error('[AUTH-SERV] SSO - LOGIN - 5C. >>>> getPermission Unable to get permission to notify.', err)
        })
    } else {
      this.logger.log('[AUTH-SERV] SSO - LOGIN - 5F. FCM NOT SUPPORTED')
    }
  }

  updateToken(FCMcurrentToken) {
    this.logger.log('[AUTH-SERV] >>>> updateToken ', FCMcurrentToken)
    // this.afAuth.authState.take(1).subscribe(user => {
    if (!this.userId || !FCMcurrentToken) {
      return
    }
    this.logger.log('[AUTH-SERV] updated token in db')
    const connection = FCMcurrentToken
    const updates = {}
    const urlNodeFirebase = '/apps/tilechat'
    const connectionsRefinstancesId =
      urlNodeFirebase + '/users/' + this.userId + '/instances/'

    // this.connectionsRefinstancesId = this.urlNodeFirebase + "/users/" + userUid + "/instances/";
    const device_model = {
      device_model: navigator.userAgent,
      language: navigator.language,
      platform: 'web/dashboard',
      platform_version: this.version,
    }

    updates[connectionsRefinstancesId + connection] = device_model

    this.logger.log('[AUTH-SERV] Firebase Cloud Messaging  - Update token updates ', updates)
    firebase.database().ref().update(updates)
  }

  chat21CreateFirebaseCustomToken(JWT_token: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': JWT_token
      }),
      responseType: 'text' as 'json'
    };

    const url = this.CREATE_CUSTOM_TOKEN_URL

    this.logger.log('[AUTH-SERV] chat21CreateFirebaseCustomToken  URL', url)

    return this._httpClient
      .post(url, null, httpOptions)
  }

  // ------------------------------------------------------------
  // VERIFY EMAIL
  // ------------------------------------------------------------
  emailVerify(user_id: string): Observable<User[]> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      })
    };

    const url = this.VERIFY_EMAIL_URL + user_id
    this.logger.log('[AUTH-SERV] VERIFY EMAIL URL ', url)
    const body = { emailverified: true }
    return this._httpClient
      .put<User[]>(url, JSON.stringify(body), httpOptions)
  }



  // --------------------------------------------------
  // REPUBLISH AND RESET IN STORAGE THE (UPDATED) USER
  // --------------------------------------------------

  // * WHEN THE USER UPGRADES HIS OWN PROFILE (NAME AND / OR SURNAME) THE USER-SERVICE
  //   SEND THE UPDATED USER OBJECT TO AUTH SERVICE (THIS COMPONENT) THAT REPUBLISH IT
  // * WHEN THE USER VERIFY HIS EMAIL THE VERIFY-EMAIL.COMP SENT UPDATED USER OBJECT
  // TO AUTH SERVICE (THIS COMPONENT) THAT REPUBLISH IT
  public publishUpdatedUser(updated_user) {
    this.logger.log('[AUTH-SERV] - UPDATED USER OBJECT RECEIVED FROM USER.SERV or VERY-EMAIL.COM (BEFORE TO REPUBLISH IT): ', updated_user)

    // REPUBLISH THE (UPDATED) USER OBJECT
    this.user_bs.next(updated_user)

    // RESET THE (UPDATED) USER OBJECT IN LOCAL STORAGE
    localStorage.setItem('user', JSON.stringify(updated_user))
  }

  ////// SUPER USER AUTH //////
  superUserAuth(currentUserEmailgetFromStorage) {
    const authenticatedSuperUser = superusers.find(
      (u) => u.email === currentUserEmailgetFromStorage,
    )
    if (
      authenticatedSuperUser &&
      authenticatedSuperUser.email === currentUserEmailgetFromStorage
    ) {
      // this.logger.log('AUTENTICATED SUPER USER ', authenticatedUser)
      // this.logger.log('AUTENTICATED SUPER USER EMAIL ', authenticatedUser.email)
      // this.logger.log('AUTH SERVICE C. USER EMAIL ', authenticatedUser.email)
      return true
    }
    return false
  }

  hasClickedGoToProjects() {
    this.project_bs.next(null)
    this.logger.log('[AUTH-SERV] - HAS CLICKED GO TO PROJECT - PUBLISH PRJCT = ', this.project_bs.next(null))
    this.logger.log('[AUTH-SERV] - HAS CLICKED GO TO PROJECT - PRJCT VALUE = ', this.project_bs.value)
    // this.logger.log('!!C-U »»»»» AUTH SERV - HAS BEEN CALLED "HAS CLICKED GOTO PROJECTS" - PUBLISH PRJCT = ', this.project_bs.next(null))
    localStorage.removeItem('project') // NOTE: questo serve????
  }

  // -----------------------------------------------------------------------
  // EXPIRED SESSION MODAL
  // -----------------------------------------------------------------------
  // RUN THE FIREBASE LOGOUT FOR TEST OF THE EXIPERD SESIION MODAL WINDOW
  testExpiredSessionFirebaseLogout(logoutFromFireBase) {
    const self = this
    this.logger.log('[AUTH-SERV] TEST EXIPERD SESSION - LOGOUT FROM FIREBASE')
    firebase
      .auth()
      .signOut()
      .then(
        function () {
          self.logger.log('[AUTH-SERV] Signed Out')
        },
        function (error) {
          self.logger.error('[AUTH-SERV] Sign Out Error', error)
        },
      )
  }

  // -----------------------------------------------------------------------------------------------------------
  // Run showExpiredSessionPopup(); with the passed parameter IF firebaseAuth === 'firebase' else is always False
  // -------------------------------------------------------------------------------------------------------------
  showExpiredSessionPopup(showExpiredSessionPopup) {
    if (this.appConfigService.getConfig().firebaseAuth === true) {
      this.show_ExpiredSessionPopup = showExpiredSessionPopup
      this.logger.log('[AUTH-SERV]- SHOW EXPIRED SESSION POPUP - (USE CASE FIREBASE AUTH) ', this.show_ExpiredSessionPopup)
    } else {
      this.show_ExpiredSessionPopup = false
      this.logger.log('[AUTH-SERV] - SHOW EXPIRED SESSION POPUP - (USE CASE NO FIREBASE AUTH) ', this.show_ExpiredSessionPopup)
    }
  }

  // ----------------------------------------------------------------------------------------------------------------------------
  // @ ShowExiperdSessionPopup  when userIsSignedIn if firebaseAuth === 'firebase else is always False
  // ----------------------------------------------------------------------------------------------------------------------------
  // PASSED FROM APP.COMPONENT.TS
  userIsSignedIn(user_is_signed_in: boolean) {
    if (this.appConfigService.getConfig().firebaseAuth === true) {
      this.logger.log('[AUTH-SERV] - USER-IS-SIGNED-IN - SHOW EXPIRED SESSION POPUP - (USE CASE FIREBASE AUTH) ', user_is_signed_in)

      if (this.show_ExpiredSessionPopup === true) {
        this.notify.showExiperdSessionPopup(user_is_signed_in)
      }
    } else {
      this.logger.log('[AUTH-SERV] - USER-IS-SIGNED-IN - SHOW EXPIRED SESSION POPUP - (USE CASE NO FIREBASE AUTH) - DOES NOT RUN this.notify.showExiperdSessionPopup')
    }
  }

  // --------------------------------------------------------------------------------------------------------------
  // @ Subscribe to isOpenedExpiredSessionModal (which the run checkIfFCMIsSupported) IF firebaseAuth === 'firebase'
  // --------------------------------------------------------------------------------------------------------------
  checkIfExpiredSessionModalIsOpened() {
    if (this.appConfigService.getConfig().firebaseAuth === true) {
      this.logger.log(
        '[AUTH-SERV] - CHECK-IF-EXPIRED-SESSSION-MODAL-IS-OPENED (USE CASE FIREBASE AUTH) subscribe to isOpenedExpiredSessionModal',
      )
      this.notify.isOpenedExpiredSessionModal.subscribe(
        (isOpenedExpiredSession: boolean) => {
          this.logger.log('[AUTH-SERV] - isOpenedExpiredSession ', isOpenedExpiredSession, '*** >>>> FCM is Supported: ', this.FCM_Supported)
          if (isOpenedExpiredSession) {
            this.logger.log('[AUTH-SERV] - CHECK-IF-EXPIRED-SESSSION-MODAL-IS-OPENED (USE CASE FIREBASE) checkIfFCMIsSupported')
            if (this.FCM_Supported === undefined) {
              this.checkIfFCMIsSupported()
            }
          }
        },
      )
    } else {
      this.logger.log('[AUTH-SERV]- CHECK-IF-EXPIRED-SESSSION-MODAL-IS-OPENED (USE CASE NO FIREBASE AUTH) DOES subscribe to isOpenedExpiredSessionModal')
    }
  }

  // -----------------------------------------------------------------------------------
  // @ Run when hasOpenedLogoutModal checkIfFCMIsSupported IF uploadEngine === 'firebase'
  // -----------------------------------------------------------------------------------
  hasOpenedLogoutModal(isOpenedlogoutModal: boolean) {
    this.logger.log('[AUTH-SERV] - HAS-OPENED-LOGOUT-MODAL getConfig pushEngine', this.appConfigService.getConfig().pushEngine)
    if (this.appConfigService.getConfig().pushEngine === 'firebase') {
      this.logger.log('[AUTH-SERV] - HAS-OPENED-LOGOUT-MODAL - WORKS WITH FIREBASE  RUN checkIfFCMIsSupported',)
      this.logger.log('[AUTH-SERV] - HAS-OPENED-LOGOUT-MODAL ', isOpenedlogoutModal, '*** >>>> FCM is Supported: ', this.FCM_Supported)
      if (isOpenedlogoutModal) {
        if (this.FCM_Supported === undefined) {
          this.checkIfFCMIsSupported()
        }
      }
    } else {
      this.logger.log('[AUTH-SERV] - HAS-OPENED-LOGOUT-MODAL - WORKS WITHOUT FIREBASE DOES NOT RUN checkIfFCMIsSupported')
    }
  }

  signOut(calledby: string) {
    this.cacheService.clearCache()
    // this.logger.log('[AUTH-SERV] Signout calledby +++++ ', calledby)
    if (calledby !== 'autologin') {
      try {
        if (window && window['tiledesk_widget_logout']) {
          // this.logger.log('window', window)
          window['tiledesk_widget_logout']()
        }
      } catch (err) {
        this.logger.error('[AUTH-SERV] tiledesk_widget_logout err ', err)
      }
    }

    if (calledby !== 'account-settings' && calledby !== 'autologin') { // in account-settings in tracked the acccont deleted event 
      const storedUser = localStorage.getItem('user')
      let storedUserParsed = null
      if (storedUser) {
        storedUserParsed = JSON.parse(storedUser)
      }

      const currentUrl = this.router.url;
      // this.logger.log('[AUTH-SERV] currentUrl ', currentUrl)
      const currentUrlSegment = currentUrl.split('/')
      // this.logger.log('[AUTH-SERV] currentUrlSegment ', currentUrlSegment)

      let projectId = null;
      let storedPrjctParsed = null;
      let projectProfileName = null;

      if (currentUrlSegment[2] && currentUrlSegment[2].match(/^\d+/)[0]) { // regex exp to Check if String starts with Number -> .match(/^\d+/)[0]
        projectId = currentUrlSegment[2]
      }
      // this.logger.log('[AUTH-SERV] projectId ', projectId)

      if (projectId) {

        // this.logger.log('[AUTH-SERV] projectProfileName ', projectProfileName)
        if (!isDevMode()) {
          if (window['analytics']) {

            let userFullname = ''
            if (storedUserParsed.firstname && storedUserParsed.lastname) {
              userFullname = storedUserParsed.firstname + ' ' + storedUserParsed.lastname
            } else if (storedUserParsed.firstname && !storedUserParsed.lastname) {
              userFullname = storedUserParsed.firstname
            }

            try {
              window['analytics'].identify(storedUserParsed._id, {
                name: userFullname,
                email: storedUserParsed.email,
                logins: 5,
                plan: this.prjct_profile_name_for_segment
              });
            } catch (err) {
              this.logger.error('identify Signed Out error', err);
            }

            try {
              window['analytics'].track('Signed Out', {
                "username": userFullname,
                "userId": storedUserParsed._id,
              }, {
                "context": {
                  "groupId": projectId
                }
              });
            } catch (err) {
              this.logger.error('track Signed Out event error', err);
            }

            try {
              window['analytics'].group(projectId, {
                name: storedPrjctParsed.name,
                plan: this.prjct_profile_name_for_segment,
              });
            } catch (err) {
              this.logger.error('group Signed Out error', err);
            }
          }
        }
      }

      if (!projectId) {
        if (!isDevMode()) {
          if (window['analytics']) {

            let userFullname = ''
            if (storedUserParsed.firstname && storedUserParsed.lastname) {
              userFullname = storedUserParsed.firstname + ' ' + storedUserParsed.lastname
            } else if (storedUserParsed.firstname && !storedUserParsed.lastname) {
              userFullname = storedUserParsed.firstname
            }

            try {
              window['analytics'].identify(storedUserParsed._id, {
                name: userFullname,
                email: storedUserParsed.email,
                logins: 5,
                plan: 'not project selected'
              });
            } catch (err) {
              this.logger.error('identify Signed Out error', err);
            }

            try {
              window['analytics'].track('Signed Out', {
                "username": userFullname,
                "userId": storedUserParsed._id
              });
            } catch (err) {
              this.logger.error('track Signed Out event error', err);
            }
          }
        }
      }

      if (!isDevMode()) {
        if (window['analytics']) {
          try {
            window['analytics'].reset()
          } catch (err) {
            this.logger.error('analytics reset', err);
          }
        }
      }

    }

    this.user_bs.next(null)
    this.project_bs.next(null)
    this.logger.log('[AUTH-SERV] SIGNOUT project_bs VALUE: ', this.project_bs.value)

    const storedRoute = this.localDbService.getFromStorage('wannago')
    this.logger.log('[AUTH-SERV] storedRoute: ', storedRoute)
    if (storedRoute) {
      this.localDbService.removeFromStorage('wannago')
    }

    localStorage.removeItem('user')
    localStorage.removeItem('project')
    localStorage.removeItem('role')

    // if (calledby !== 'autologin') {
    this.logger.log('[AUTH-SERV] Signout this.router.url +++++ ', this.router.url)
    const current_url = this.router.url
    // const chatPrefix = this.appConfigService.getConfig().chatStoragePrefix;

    if (current_url.indexOf('request-for-panel') === -1) {
      this.logger.log('[AUTH-SERV] Signout current url  NOT contains request-for-panel ')

      const stored__tiledeskToken = localStorage.getItem('tiledesk_token')
      if (stored__tiledeskToken) {
        localStorage.removeItem('tiledesk_token')
        this.logger.log('[AUTH-SERV] SIGNOUT - STORED stored__tiledeskToken : ', stored__tiledeskToken)
      }

      const stored__lastProject = localStorage.getItem('last_project') 
      if (stored__lastProject) {
        localStorage.removeItem('last_project')
        this.logger.log('[AUTH-SERV] SIGNOUT - STORED stored__lastProjectn : ', stored__lastProject)
      }

      this.webSocketClose()
    } else {
      this.logger.log('[AUTH-SERV] Signout current url contains request-for-panel ')
    }

    // ------------------------------------------------------------------------------------------------------------
    // RUN removeInstanceIdAndSignout() if pushEngine === 'firebase' +
    // in  removeInstanceIdAndSignout if  firebaseAuth === 'firebase' run  firebaseSignout else signoutNoFirebase
    // ---------------------------------------------------------------------------------------------------------
    // this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK
    this.logger.log(
      '[AUTH-SERV] signOut getConfig pushEngine',
      this.appConfigService.getConfig().pushEngine,
    )
    this.logger.log(
      '[AUTH-SERV] signOut getConfig firebaseAuth',
      this.appConfigService.getConfig().firebaseAuth,
    )

    // && this.appConfigService.getConfig().firebaseAuth === true
    if (this.appConfigService.getConfig().pushEngine === 'firebase') {
      this.logger.log('[AUTH-SERV] signOut pushEngine FIREBASE')
      if (!this.APP_IS_DEV_MODE && this.FCM_Supported === true) {
        this.logger.log('[AUTH-SERV] signOut this.FCMcurrentToken ', this.FCMcurrentToken)
        this.logger.log('[AUTH-SERV] signOut here 1 ')
        if (this.FCMcurrentToken !== undefined && this.userId !== undefined) {
          this.logger.log('[AUTH-SERV] signOut here 2 ')

          // if (this.appConfigService.getConfig().firebaseAuth === true) {
          this.removeInstanceIdAndSignout(
            calledby,
            this.FCMcurrentToken,
            this.userId,
          )
          // }
        } else {
          this.logger.log('AUTH-SERV] signOut here 3 ')
          // use case: FCMcurrentToken is undefined
          // (e.g. the user refresh the page or not is FCMcurrentToken created at the login)
          const messaging = firebase.messaging()
          messaging
            .getToken({
              vapidKey: this.appConfigService.getConfig().firebase.vapidKey,
            })
            .then((FCMtoken) => {
              this.logger.log( '[AUTH-SERV] signOut >>>> getToken FCMtoken',  FCMtoken)
              this.FCMcurrentToken = FCMtoken
              const storedUser = localStorage.getItem('user')
              const storedUserObj = JSON.parse(storedUser)
              this.logger.log('[AUTH-SERV] signOut >>>> getToken storedUserObj ', storedUserObj)
              if (storedUserObj) {
                this.userId = storedUserObj._id
              }
              // if (this.appConfigService.getConfig().firebaseAuth === true) {
              this.removeInstanceIdAndSignout(
                calledby,
                this.FCMcurrentToken,
                this.userId,
              )
              // }
            })
            .catch((err) => {
              this.logger.error('[AUTH-SERV] signOut >>>> getToken err: ', err)
              if (this.appConfigService.getConfig().firebaseAuth === true) {
                this.firebaseSignout(calledby)
              } else {
                this.signoutNoFirebase(calledby)
              }
            })
        }
      } else {
        if (this.appConfigService.getConfig().firebaseAuth === true) {
          this.firebaseSignout(calledby)
        } else {
          this.signoutNoFirebase(calledby)
        }
      }
    } else {
      this.logger.log('[AUTH-SERV] signOut here 4 ')
      if (this.appConfigService.getConfig().firebaseAuth === true) {
        this.firebaseSignout(calledby)
      } else {
        this.signoutNoFirebase(calledby)
      }
    }
  }

  removeInstanceIdAndSignout(calledby, FCMcurrentToken, userId) {
    // this.logger.log('[AUTH-SERV] - removeInstanceIdAndSignout calledby ', calledby)
    // this.logger.log('[AUTH-SERV] - removeInstanceIdAndSignout - FCM Token: ', FCMcurrentToken);
    // this.logger.log('[AUTH-SERV] - removeInstanceIdAndSignout - USER ID: ', userId);
    // this.connectionsRefinstancesId = this.urlNodeFirebase+"/users/"+userUid+"/instances/";
    const urlNodeFirebase = '/apps/tilechat'
    const connectionsRefinstancesId = urlNodeFirebase + '/users/' + userId + '/instances/'

    let connectionsRefURL = ''
    if (connectionsRefinstancesId) {
      connectionsRefURL = connectionsRefinstancesId + '/' + FCMcurrentToken
      const connectionsRef = firebase.database().ref().child(connectionsRefURL)
      const that = this
      connectionsRef
        .remove()
        .then(function () {
          if (that.appConfigService.getConfig().firebaseAuth === true) {
            that.firebaseSignout(calledby)
          } else {
            that.signoutNoFirebase(calledby)
          }
        })
        .catch((err) => {
          that.logger.error('[AUTH-SERV] - removeInstanceId - err: ', err)

          if (that.appConfigService.getConfig().firebaseAuth === true) {
            that.firebaseSignout(calledby)
          } else {
            that.signoutNoFirebase(calledby)
          }
        })
    }
  }

  firebaseSignout(calledby) {
    const that = this
    firebase
      .auth()
      .signOut()
      .then(
        function () {
          that.logger.log('[AUTH-SERV] firebaseSignout SIGN-OUT OK')
          // that.widgetReInit()

          if (calledby !== 'autologin') {
            that.router.navigate(['/login'])
            // if ( this.customRedirectAfterLogout  === false) {
            //   that.router.navigate(['/login'])
            // } else {
            //   window.open( this.afterLogoutRedirectURL, '_self');
            // }
          }
        },
        function (error) {
          that.logger.error('[AUTH-SERV] firebaseSignout SIGN-OUT - Error', error)
          // that.widgetReInit()

          if (calledby !== 'autologin') {
            that.router.navigate(['/login'])
            // if ( this.customRedirectAfterLogout  === false) {
            //   that.router.navigate(['/login'])
            // } else {
            //   window.open( this.afterLogoutRedirectURL, '_self');
            // }
          }
        },
      )
  }

  signoutNoFirebase(calledby) {
    this.logger.log('[AUTH-SERV] signoutNoFirebase called By (1)', calledby)
    if (calledby !== 'autologin') {
      this.logger.log('[AUTH-SERV] signoutNoFirebase called By (2)', calledby)
      this.router.navigate(['/login'])
      // if ( this.customRedirectAfterLogout  === false) {
      //   this.router.navigate(['/login'])
      // } else {
      //   window.open( this.afterLogoutRedirectURL, '_self');
      // }
    }
  }

  webSocketClose() {
    this.logger.log('[AUTH-SERV] SIGNOUT has called webSocketClose')
    this.webSocketJs.close()
  }

  widgetReInit() {
    if (window && window['tiledesk']) {
      this.logger.log('[AUTH-SERV] window[tiledesk] ', window['tiledesk'])
      try {
        window['tiledesk'].reInit()
      } catch (err) {
        this.logger.error('[AUTH-SERV] widgetReInit error ', err)
      }
      // alert('logout');
    }
  }



  public siginWithGoogle() {
    // this.logger.log('[AUTH-SERV] siginWithGoogle HERE YES!!!')
    // const url = this.SERVER_BASE_PATH + "auth/google"
    const url = "https://eu.rtmv3.tiledesk.com/api/auth/google"
    window.open(url, '_self');

    this.localDbService.setInStorage('swg', 'true')

  }

  public siginUpWithGoogle() {

    const url = "https://eu.rtmv3.tiledesk.com/api/auth/google?redirect_url=%23%2Fcreate-project-gs"

    // this.logger.log('siginUpWithGoogle ', url)
    window.open(url, '_self');

  }




}
