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
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/pairwise';
import { LoggerService } from '../services/logger/logger.service';
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

  USER_ROLE: string;
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
    private logger: LoggerService
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


    // this.router.events.pairwise().subscribe((event) => {
    //   this.logger.log([AUTH-GUARD] EVENT ', event);
    // });

    /**
     * !!! having made a change of logic getCurrentProject() is no more used
     * NEW: initialize the new project when the id of the project get from url does not match with the current project id  */
    // this.getCurrentProject();
    this.getProjectIdFromUrl();


    // this.canActivate();


  }


  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.logger.log('[AUTH-GUARD] - CURRENT PROJECT: ', project)
      // tslint:disable-next-line:no-debugger
      // debugger

      if (project) {
        this.logger.log('[AUTH-GUARD] - CURRENT PROJECT ID : ', project._id)
        this.current_project_id = project._id;
      }
    });
  }

  getProjectIdFromUrl() {
    this.subscription = this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        const current_url = e.url
        // if (this.location.path() !== '') {
        // const current_url = this.location.path()
        this.logger.log('[AUTH-GUARD] - GET PROJECT ID FROM URL -> CURRENT URL ', current_url);

        const url_segments = current_url.split('/');
        this.logger.log('[AUTH-GUARD] - GET PROJECT ID FROM URL -> CURRENT URL SEGMENTS ', url_segments);

        this.nav_project_id = url_segments[2];
        this.logger.log('[AUTH-GUARD] - GET PROJECT ID FROM URL -> CURRENT URL SEGMENTS > NAVIGATION PROJECT ID: ', this.nav_project_id);


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
          current_url !== '/projects') {

          this.subscription.unsubscribe();

          this.checkStoredProject(this.nav_project_id)
        }
      }
    }); // this.router.events.subscribe((e)
  }

  checkStoredProject(navigationProjectId) {
    const storedProjectJson = localStorage.getItem(navigationProjectId);
    this.logger.log('[AUTH-GUARD] - PROJECT JSON GET FROM STORAGE ', storedProjectJson);


    if (storedProjectJson === null) {
      this.logger.log('[AUTH-GUARD] - PROJECT JSON IS NULL - RUN getProjects and filter for project id ')

      this.getProjectFromRemotePublishAndSaveInStorage();
    }
  }

  getProjectFromRemotePublishAndSaveInStorage() {
    // this.projectService.getProjectAndUserDetailsByProjectId(this.nav_project_id).subscribe((prjct: any) => {
    this.projectService.getProjects().subscribe((prjcts: any) => {
      this.logger.log('[AUTH-GUARD] - PROJECTS OBJCTS FROM REMOTE CALLBACK ', prjcts);

      const prjct = prjcts.filter(p => p.id_project._id === this.nav_project_id);

      this.logger.log('[AUTH-GUARD] - PROJECT OBJCT FILTERED FOR PROJECT ID ', prjct);
      this.logger.log('[AUTH-GUARD] - PROJECT OBJCT FILTERED FOR PROJECT ID LENGHT ', prjct.length);

      if (prjct && prjct.length > 0) {
        this.logger.log('[AUTH-GUARD] - TEST --- HERE YES');
        // this.logger.log('!!!!!! AUTH GUARD - N.P.I DOES NOT MATCH C.P.I - PROJECT GOT BY THE NAV PROJECT ID (N.P.I): ', project);

        this.nav_project_name = prjct[0].id_project.name;
        this.logger.log('[AUTH-GUARD] - PROJECT NAME GOT BY THE NAV PROJECT ID ', this.nav_project_name);
        // tslint:disable-next-line:max-line-length
        // this.notify.showNotificationChangeProject(`You have been redirected to the project <span style="color:#ffffff; display: inline-block; max-width: 100%;"> ${this.nav_project_name} </span>`, 0, 'info');

        const project: Project = {
          _id: this.nav_project_id,
          name: this.nav_project_name,
          profile_name: prjct[0].id_project.profile.name,
          trial_expired: prjct[0].id_project.trialExpired,
          trial_days_left: prjct[0].id_project.trialDaysLeft,
          operatingHours: prjct[0].id_project.activeOperatingHours
        }
        // PROJECT ID and NAME ARE SENT TO THE AUTH SERVICE THAT PUBLISHES
        this.auth.projectSelected(project);
        this.logger.log('[AUTH-GUARD] - PROJECT THAT IS PUBLISHED ', project);
        // this.project_bs.next(project);

        const projectForStorage: Project = {
          _id: this.nav_project_id,
          name: this.nav_project_name,
          role: prjct[0].role,
          profile_name: prjct[0].id_project.profile.name,
          trial_expired: prjct[0].id_project.trialExpired,
          trial_days_left: prjct[0].id_project.trialDaysLeft,
          operatingHours: prjct[0].id_project.activeOperatingHours
        }
        // SET THE ID, the NAME OF THE PROJECT and THE USER ROLE IN THE LOCAL STORAGE.
        this.logger.log('[AUTH-GUARD] - PROJECT THAT IS STORED', projectForStorage);
        localStorage.setItem(this.nav_project_id, JSON.stringify(projectForStorage));

        // GET AND SAVE ALL USERS OF CURRENT PROJECT IN LOCAL STORAGE
        this.logger.log('[AUTH-GUARD] CALL -> getAllUsersOfCurrentProjectAndSaveInStorage')

        this.usersService.getAllUsersOfCurrentProjectAndSaveInStorage();

        // GET AND SAVE ALL BOTS OF CURRENT PROJECT IN LOCAL STORAGE
        this.usersService.getBotsByProjectIdAndSaveInStorage();

      } else {

        this.logger.log('[AUTH-GUARD] - PROJECT OBJCT FILTERED FOR PROJECT ID !! NOT FOUND - GO TO UNAUTHORIZED PAGE ');

        this.router.navigate([`project/${this.nav_project_id}/unauthorized_access`]);
        // this.goToProjects()
        // this.logout()
      }

    }, (error) => {
      this.logger.error('[AUTH-GUARD] - GET PROJECT BY ID - ERROR ', error);
    }, () => {
      this.logger.log('[AUTH-GUARD] - GET PROJECT BY ID - COMPLETE ');

      // this.resetCurrentProjectAndInizializeNewProject();
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
    this.logger.log('[AUTH-GUARD] - SSO - CAN ACTIVATE AlwaysAuthGuard');
    this.logger.log('[AUTH-GUARD] - SSO - CAN ACTIVATE user ', this.user);

    this.logger.log('[AUTH-GUARD] SSO - CAN ACTIVATE next ', next);
    this.logger.log('[AUTH-GUARD] SSO - CAN ACTIVATE state ', state);
    const url = state.url;
    const _url = next['_routerState'].url
    this.logger.log('[AUTH-GUARD] SSO - CAN ACTIVATE state url  ', url);
    this.logger.log('[AUTH-GUARD] SSO - CAN ACTIVATE next _url  ', _url);

    const route = url.substring(0, url.indexOf('?token='));

    this.logger.log('[AUTH-GUARD] SSO - CAN ACTIVATE route in url ', route);


    let queryParams = next.queryParams
    // this.logger.log('SSO - CAN ACTIVATE queryParams ', queryParams);

    let stringifed_queryParams = JSON.stringify(queryParams)
    this.logger.log('[AUTH-GUARD] SSO - CAN ACTIVATE queryParams stringified', stringifed_queryParams);

    const HAS_JWT = stringifed_queryParams.includes('JWT');
    this.logger.log('[AUTH-GUARD] SSO - CAN ACTIVATE queryParams HAS_JWT', HAS_JWT);

    let token = next.queryParams.token
    this.logger.log('[AUTH-GUARD] SSO - CAN ACTIVATE queryParams HAS_JWT Token ', token);


    // tslint:disable-next-line:max-line-length
    if ((this.user && !HAS_JWT) ||
      (this.is_verify_email_page === true) ||
      (this.is_signup_page === true) ||
      (this.is_reset_psw_page === true) ||
      (this.is_handleinvitation_page === true) ||
      (this.is_signup_on_invitation_page === true)) {
      // this.router.navigate(['/home']);
      return true;
      // if ((!this.user) || (this.is_verify_email_page === false))
    } else {

      if (!HAS_JWT) {
        this.router.navigate(['/login']);
        this.logger.log('[AUTH-GUARD] SSO - CAN ACTIVATE queryParams HAS_JWT: NOT HAS  navigate to login ');
      } else {
        this.logger.log('[AUTH-GUARD] SSO - CAN ACTIVATE queryParams HAS_JWT: YES HAS  navigate to autologin ');
        this.router.navigate(['/autologin', route, token]);
        return false;
      }
    }
    // else if ((this.is_verify_email_page === false)) {
    //   this.router.navigate(['verify/email/']);
    //   return false;
    // }
  }

  // ------------------------------------------------------------------------
  // l'esitente funzionante
  // ------------------------------------------------------------------------
  _canActivate() {
    this.logger.log('!! AUTH WF in auth.guard - CAN ACTIVATE AlwaysAuthGuard');

    // tslint:disable-next-line:max-line-length
    if ((this.user) ||
      (this.is_verify_email_page === true) ||
      (this.is_signup_page === true) ||
      (this.is_reset_psw_page === true) ||
      (this.is_handleinvitation_page === true) ||
      (this.is_signup_on_invitation_page === true)) {
      // this.router.navigate(['/home']);
      return true;
      // if ((!this.user) || (this.is_verify_email_page === false))
    } else {
      // tslint:disable-next-line:no-debugger
      // debugger
      this.router.navigate(['/login']);
      return false;
    }
    // else if ((this.is_verify_email_page === false)) {
    //   this.router.navigate(['verify/email/']);
    //   return false;
    // }
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
