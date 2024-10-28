import { Injectable } from '@angular/core';
// ActivatedRouteSnapshot, RouterStateSnapshot,
// tslint:disable-next-line:max-line-length
import { CanActivate, Router, NavigationEnd, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthService } from './auth.service';
import { NotifyService } from './notify.service';
import { Location } from '@angular/common';
import { ProjectService } from '../services/project.service';
import { Project } from '../models/project-model';
import { UsersService } from '../services/users.service';
import { Subscription } from 'rxjs';

import { LoggerService } from '../services/logger/logger.service';
import { LocalDbService } from 'app/services/users-local-db.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppConfigService } from 'app/services/app-config.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// import { RequestsMsgsComponent } from '../requests-msgs/requests-msgs.component';
// import { HomeComponent } from '../home/home.component';

// CanDeactivate<RequestsMsgsComponent | HomeComponent>
@Injectable()
export class AuthGuard implements CanActivate {

  route: string;
  user: any;
  is_verify_email_page: boolean;
  is_signup_page: boolean;
  is_reset_psw_page: boolean;
  is_handleinvitation_page: boolean;
  is_signup_on_invitation_page: boolean;

  nav_project_id: string;
  current_project_id: string;
  nav_project_name: string;

  allow_navigation = true;
  unauthorizedPage: boolean;

  
  subscription: Subscription;

  // »> »> PROJECT-PROFILE GUARD (WF in AUTH GUARD)
  IS_ANALYTICS_PAGE: boolean;
  IS_ANALYTICS_DEMO_PAGE: boolean;
  current_project_trial_expired: boolean;
  URL_HAS_JWT: boolean


  constructor(
    private auth: AuthService,
    private router: Router,
    private notify: NotifyService,
    public location: Location,
    private projectService: ProjectService,
    private usersService: UsersService,
    private logger: LoggerService,
    public localDbService: LocalDbService,
    private _snackBar: MatSnackBar,
    public appConfigService: AppConfigService,
    private _httpClient: HttpClient,
  ) {
    this.logger.log('[AUTH-GUARD] hello !!!')

    this.user = auth.user_bs.value;
    this.auth.user_bs.subscribe((user) => {
      // tslint:disable-next-line:no-debugger
      // debugger
      this.user = user;
      this.logger.log('[AUTH-GUARD] USER ', user)
     
    });

    this.detectRoute();
    this.detectVerifyEmailRoute();
    this.detectSignUpRoute();
    this.detectResetPswRoute();
    this.getProjectIdFromUrl();
  }



  getProjectIdFromUrl() {
    this.subscription = this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        const current_url = e.url

        this.logger.log('[AUTH-GUARD] - GET PROJECT ID FROM URL -> CURRENT URL ', current_url);

        const url_segments = current_url.split('/');

        // this.logger.log('[AUTH-GUARD] - GET PROJECT ID FROM URL -> CURRENT URL SEGMENTS ', url_segments);

        this.nav_project_id = url_segments[2];
        // this.logger.log('[AUTH-GUARD] - GET PROJECT ID FROM URL -> CURRENT URL SEGMENTS > NAVIGATION PROJECT ID: ', this.nav_project_id);


        /**
         * WITH THE PROJECT ID GOT FROM URL RUN A CHECK FOR PROJECT NAME
         * IF THE PROJECT NAME IS NULL MEANS THAT THE USER IS ACCESSING A PAGE OF A NEW
         * PROJECT WITHOUT BEING PASSED FROM THE LIST OF PROJECTS (FOR EXAMPLE AFTER HAVING
         * CLICKED ON THE LINK IN THE INVITATION EMAIL TO PARTICIPATE IN A PROJECT)
         * IN THIS CASE, A CALL IS DONE TO OBTAIN THE NAME OF THE PROJECT AND AFTER THE ID
         * AND NAME OF THE PROJECT ARE SAVED IN THE LOCAL STORAGE AND PASSES TO THE SERVICE THAT PUBLISHES
         * (note: the NAVIGATION PROJECT ID returned from CURRENT URL SEGMENTS is = to 'email'
         * if the user navigate to the e-mail verification page)
         * If the CURRENT URL has only one element (for example /create-project (i.e. the wizard for the creation a of a project)
         * the url_segments[2] (that is the project id) is undefined)
         * and the Workflow not proceed with the below code
         */
        // tslint:disable-next-line:max-line-length

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
          url_segments[1] !== 'get-chatbot' &&
          url_segments[1] !== 'activate-product' &&
          url_segments[1] !== 'install-template' &&
          url_segments[1] !== 'create-project-itw' &&
          url_segments[1] !== 'install-template-np' &&
          url_segments[1] !== 'success' &&
          current_url !== '/projects') {

          this.subscription.unsubscribe();

          this.checkStoredProject(this.nav_project_id)
          // this.getUserRole(this.user, this.nav_project_id).then(userRole => { 
          //   this.logger.log('[AUTH-GUARD] getUserRole ', userRole);
          //  }, (error) => {
          //   this.logger.error('[AUTH-GUARD] getUserRole ', error);
          // });
        }
      }
    }); // this.router.events.subscribe((e)

   
    
  }

  getUserRole(user, project_id): Promise <any> {
    this.logger.log('[AUTH-GUARD] getUserRole user' , user, ' project_id ', project_id) 
    const SERVER_BASE_PATH = this.appConfigService.getConfig().SERVER_BASE_URL;
    const PROJECTS_URL = SERVER_BASE_PATH + project_id + '/project_users/users/' + user._id

    const headers = new HttpHeaders({
      'Content-type': 'application/json',
      Authorization: user.token
    });
    const requestOptions = { headers: headers };
    return new Promise((resolve, reject) => { 
      this._httpClient.get(PROJECTS_URL, requestOptions).subscribe((data) => {
        this.logger.log('[AUTH-GUARD] data' , data ) 
        resolve(data[0].role)
        }, (error) => {
          this.logger.log('[AUTH-GUARD] error' , error ) 
          reject(error)
        });

    })
  }

  

  checkStoredProject(navigationProjectId) {
    const storedProjectJson = localStorage.getItem(navigationProjectId);
    this.logger.log('[AUTH-GUARD] - PROJECT JSON GET FROM STORAGE ', storedProjectJson);


    if (storedProjectJson === null) {
      this.logger.log('[AUTH-GUARD] - PROJECT JSON IS NULL - RUN getProjectsById ')

      this.getProjectFromRemotePublishAndSaveInStorage(navigationProjectId);
    }
  }

  getProjectFromRemotePublishAndSaveInStorage(navigationProjectId) {
    this.logger.log('[AUTH-GUARD] - PROJECT JSON IS NULL - RUN getProjectFromRemotePublishAndSaveInStorage ', navigationProjectId)
    // this.projectService.getProjectAndUserDetailsByProjectId(this.nav_project_id).subscribe((prjct: any) => {
    this.projectService.getProjectById(navigationProjectId).subscribe((project: any) => {
      if (project) {
        this.logger.log('[AUTH-GUARD] - PROJECT FROM REMOTE CALLBACK project', project);

        this.getUserRole(this.user, this.nav_project_id).then(userRole => { 
          this.logger.log('[AUTH-GUARD] getUserRole ', userRole);
          project['role'] = userRole
          this.auth.projectSelected(project, 'auth-guard');
          localStorage.setItem(this.nav_project_id, JSON.stringify(project))
         }, (error) => {
          this.logger.error('[AUTH-GUARD] getUserRole ', error);
          this.auth.projectSelected(project, 'auth-guard');
          localStorage.setItem(this.nav_project_id, JSON.stringify(project));
        });
        
        this.getProjectsAndSaveLastProject(navigationProjectId)
        // GET AND SAVE ALL USERS OF CURRENT PROJECT IN LOCAL STORAGE
        this.usersService.getAllUsersOfCurrentProjectAndSaveInStorage();

        // GET AND SAVE ALL BOTS OF CURRENT PROJECT IN LOCAL STORAGE
        this.usersService.getBotsByProjectIdAndSaveInStorage();

      } else {
        this.logger.log('[AUTH-GUARD] - PROJECT OBJCT FILTERED FOR PROJECT ID !! NOT FOUND - GO TO UNAUTHORIZED PAGE ');
        this.router.navigate([`project/${this.nav_project_id}/unauthorized_access`]);
      }

    }, (error) => {
      this.logger.error('[AUTH-GUARD] - GET PROJECT BY ID - ERROR ', error);
      this.logger.log('[AUTH-GUARD] error', error.error)
      if (error.error.msg === "you dont belong to the project.") {

        this._snackBar.open("Oops! " + error.error.msg, null, {
          duration: 5000,
          verticalPosition: 'top',
          panelClass: 'error-snackbar'
        });
      }


    }, () => {
      this.logger.log('[AUTH-GUARD] - GET PROJECT BY ID - COMPLETE ');

      // this.resetCurrentProjectAndInizializeNewProject();
    });
  }

  getProjectsAndSaveLastProject(project_id) {
    this.projectService.getProjects().subscribe((projects: any) => {
      this.logger.log('[AUTOLOGIN] getProjects projects ', projects)
      if (projects) {
        const populateProjectUser = projects.find(prj => prj.id_project.id === project_id);
        this.logger.log('[AUTOLOGIN] populateProjectUser ', populateProjectUser)
        localStorage.setItem('last_project', JSON.stringify(populateProjectUser))
      }
    });
  }



  goToProjects() {
    this.logger.log('[AUTH-GUARD] - HAS CLICCKED GO TO PROJECT ')
    this.router.navigate(['/projects']);
    // (in AUTH SERVICE ) RESET PROJECT_BS AND REMOVE ITEM PROJECT FROM STORAGE WHEN THE USER GO TO PROJECTS PAGE
    this.auth.hasClickedGoToProjects();

    // this.project = null

    // this.subscription.unsubscribe();
    // this.unsubscribe$.next();
    // this.unsubscribe$.complete();  
  }


  detectVerifyEmailRoute() {
    if (this.location.path() !== '') {
      this.route = this.location.path();
      // this.logger.log('»> »> AUTH GUARD »> »> ', this.route);
      if (this.route.indexOf('/verify') !== -1) {
        // this.router.navigate([`${this.route}`]);
        this.is_verify_email_page = true;
        this.logger.log('[AUTH-GUARD]- IS VERIFY EMAIL PAGE »> »> ', this.is_verify_email_page);

      } else {
        this.is_verify_email_page = false;
        this.logger.log('[AUTH-GUARD] - IS VERIFY EMAIL PAGE »> »> ', this.is_verify_email_page);

      }
    }
  }


  detectRoute() {
    if (this.location.path() !== '') {
      this.route = this.location.path();
      // this.logger.log('»> »> AUTH GUARD »> »> ', this.route);
      if (this.route.indexOf('/handle-invitation') !== -1) {
        // this.router.navigate([`${this.route}`]);
        this.is_handleinvitation_page = true;
        this.logger.log('[AUTH-GUARD] - IS HANDLE-INVITATION PAGE »> »> ', this.is_handleinvitation_page);

      } else {
        this.is_handleinvitation_page = false;
        this.logger.log('[AUTH-GUARD] - IS HANDLE-INVITATION PAGE »> »> ', this.is_handleinvitation_page);
      }

      if (this.route.indexOf('/signup-on-invitation') !== -1) {
        // this.router.navigate([`${this.route}`]);
        this.is_signup_on_invitation_page = true;
        this.logger.log('[AUTH-GUARD] - IS SIGNUP-ON-INVITATION PAGE »> »> ', this.is_signup_on_invitation_page);
      } else {
        this.is_signup_on_invitation_page = false;
        this.logger.log('[AUTH-GUARD] - IS SIGNUP-ON-INVITATION  PAGE »> »> ', this.is_signup_on_invitation_page);
      }
    }
  }

  detectSignUpRoute() {
    if (this.location.path() !== '') {
      this.route = this.location.path();
      // this.logger.log('»> »> AUTH GUARD »> »> ', this.route);
      if (this.route.indexOf('/signup') !== -1) {
        // this.router.navigate([`${this.route}`]);
        this.is_signup_page = true;
        this.logger.log('[AUTH-GUARD] - IS SIGNUP PAGE »> »> ', this.is_signup_page);

      } else {
        this.is_signup_page = false;
        this.logger.log('[AUTH-GUARD] - IS SIGNUP PAGE »> »> ', this.is_signup_page);

      }
    }
  }

  detectResetPswRoute() {
    if (this.location.path() !== '') {
      this.route = this.location.path();
      // this.logger.log('»> »> AUTH GUARD »> »> ', this.route);
      if (this.route.indexOf('/resetpassword') !== -1) {
        // this.router.navigate([`${this.route}`]);
        this.is_reset_psw_page = true;
        this.logger.log('[AUTH-GUARD] - IS RESET PSW PAGE »> »> ', this.is_reset_psw_page);
      } else {
        this.is_reset_psw_page = false;
        this.logger.log('[AUTH-GUARD]  - IS RESET PSW PAGE »> »> ', this.is_reset_psw_page);
      }
    }
  }

  // ------------------------------------------------------------------------
  // canActivate SSO 
  // ------------------------------------------------------------------------
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.logger.log('[AUTH-GUARD] - SSO - CAN ACTIVATE !!! AlwaysAuthGuard');
    this.logger.log('[AUTH-GUARD] - SSO - CAN ACTIVATE user ', this.user);

    // this.logger.log('[AUTH-GUARD] SSO - CAN ACTIVATE next ', next);
    // this.logger.log('[AUTH-GUARD] SSO - CAN ACTIVATE state ', state);
    // this.logger.log('[AUTH-GUARD] SSO - CAN ACTIVATE state _root queryParams', state['_root']['value'].queryParams )
    // if () 
    const url = state.url;
    const _url = next['_routerState'].url
    // this.logger.log('[AUTH-GUARD] SSO - CAN ACTIVATE state url  ', url);
    // this.logger.log('[AUTH-GUARD] SSO - CAN ACTIVATE next _url  ', _url);

    // ----------------------------------------
    // Check if a wannaurl is stored and remove it when the _decodeCurrentUrl is equal to it
    // ----------------------------------------
    const decodeCurrentUrl = decodeURIComponent(url)
    // this.logger.log('[AUTH-GUARD] _decodeCurrentUrl ', decodeCurrentUrl)

    if (decodeCurrentUrl === '/projects') {
      // get if user has used Signin with Google
      const hasSigninWithGoogle = this.localDbService.getFromStorage('swg')
      if (hasSigninWithGoogle) {
        this.localDbService.removeFromStorage('swg')
        // this.logger.log('[AUTH-GUARD] removeFromStorage swg')
      }
    }


    const storedRoute = this.localDbService.getFromStorage('wannago')
    // this.logger.log('[AUTH-GUARD] storedRoute getFromStorage ', storedRoute)

    if (decodeCurrentUrl === storedRoute) {
      this.localDbService.removeFromStorage('wannago')
      // this.logger.log('Hey baby - I removes the wannago stored url')
    }

    // ----------------------------------------
    // Check if the url has the JWT token
    // ----------------------------------------
    const route = url.substring(0, url.indexOf('?token='));
    // this.logger.log('[AUTH-GUARD] SSO - CAN ACTIVATE route in url ', route);
    let queryParams = next.queryParams
    // this.logger.log('SSO - CAN ACTIVATE queryParams ', queryParams);

    let stringifed_queryParams = JSON.stringify(queryParams)
    // this.logger.log('[AUTH-GUARD] SSO - CAN ACTIVATE queryParams stringified', stringifed_queryParams);

    const HAS_JWT = stringifed_queryParams.includes('JWT');
    this.logger.log('[AUTH-GUARD] SSO - CAN ACTIVATE queryParams HAS_JWT', HAS_JWT);

    let token = next.queryParams.token
    // this.logger.log('[AUTH-GUARD] SSO - CAN ACTIVATE queryParams HAS_JWT Token ', token);

    if ((this.user && !HAS_JWT) ||
      (this.is_verify_email_page === true) ||
      (this.is_signup_page === true) ||
      (this.is_reset_psw_page === true) ||
      (this.is_handleinvitation_page === true) ||
      (this.is_signup_on_invitation_page === true)) {

      return true;

    } else {
      this.logger.log('[AUTH-GUARD] SSO - CAN ACTIVATE queryParams HAS JWT (2)', HAS_JWT);
      this.logger.log('[AUTH-GUARD] SSO - CAN ACTIVATE queryParams user (2)', this.user);
      if (!HAS_JWT) {

        this.router.navigate(['/login']);
        // this.auth.signOut('canActivate');

        // this.logger.log('[AUTH-GUARD] SSO - CAN ACTIVATE queryParams HAS_JWT: NOT HAS - navigate to login ');
        // this.logger.log('[AUTH-GUARD] - CAN ACTIVATE queryParams HAS_JWT: NOT HAS - wanna go url ', url);
        const storedRoute = this.localDbService.getFromStorage('wannago')
        // this.logger.log('[AUTH-GUARD] - CAN ACTIVATE queryParams HAS_JWT: NOT HAS - wanna go url storedRoute', storedRoute);

        if (!storedRoute) {
          const URLtoStore = url;
          // this.logger.log('[AUTH-GUARD] - CAN ACTIVATE queryParams HAS_JWT: NOT HAS - wanna go url - URLtoStore', URLtoStore);
          if (URLtoStore !== '/projects') {
            this.localDbService.setInStorage('wannago', URLtoStore);
          }
          if (URLtoStore.indexOf('/activate-product') !== -1) {
            this.router.navigate(['/signup']);
          }
        }
      } else {
        this.logger.log('[AUTH-GUARD] SSO - CAN ACTIVATE queryParams HAS_JWT: YES HAS  navigate to autologin ');
        this.router.navigate(['/autologin', route, token]);
        return false;
      }
    }
  }

  // ------------------------------------------------------------------------
  // l'esitente funzionante
  // ------------------------------------------------------------------------
  _canActivate() {
    this.logger.log('!! AUTH WF in auth.guard - CAN ACTIVATE AlwaysAuthGuard');

    if ((this.user) ||
      (this.is_verify_email_page === true) ||
      (this.is_signup_page === true) ||
      (this.is_reset_psw_page === true) ||
      (this.is_handleinvitation_page === true) ||
      (this.is_signup_on_invitation_page === true)) {
      // this.router.navigate(['/home']);
      return true;

    } else {

      this.router.navigate(['/login']);
      return false;
    }
  }

  // ------------------------------------
  // Already commented
  // ------------------------------------
  // canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {

  //   this.logger.log('CAN ACTIVATE (auth.guard.ts) ', firebase.auth().currentUser);
  //   return this.auth.user_bs.pipe(
  //     take(1),
  //     map((user) => !!user),
  //     tap((loggedIn) => {
  //       this.logger.log('--- > LOGGED IN ', loggedIn);
  //       this.IS_LOGGED_IN.next(loggedIn);

  //       if (!loggedIn) {
  //         this.logger.log('access denied');
  //         this.notify.update('You must be logged in!', 'error');
  //         this.router.navigate(['/login']);
  //       }
  //     }),
  //   );


  // }
  // canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
  //   if (this.auth.user_bs !== null) {
  //     this.logger.log('AUTH GUARD ', this.auth.user_bs)
  //     return true;
  //   }
  //   return false;
  // }


}
