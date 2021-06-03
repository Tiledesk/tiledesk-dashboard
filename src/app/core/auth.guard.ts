import { Injectable } from '@angular/core';
// ActivatedRouteSnapshot, RouterStateSnapshot,
// tslint:disable-next-line:max-line-length
import { CanActivate, Router, NavigationEnd, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthService } from './auth.service';
import { NotifyService } from './notify.service';

// import { Observable } from 'rxjs/Observable';
// import { map, take, tap } from 'rxjs/operators';
// import * as firebase from 'firebase/app';

import { Location } from '@angular/common';
import { ProjectService } from '../services/project.service';
import { Project } from '../models/project-model';
import { UsersService } from '../services/users.service';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/pairwise';
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
    private usersService: UsersService
  ) {
    console.log('!! AUTH WF in auth.guard  hello !!!')

    this.user = auth.user_bs.value;
    this.auth.user_bs.subscribe((user) => {
      // tslint:disable-next-line:no-debugger
      // debugger
      this.user = user;
      console.log('!! AUTH WF USER ', user)
    });

    this.detectRoute();
    this.detectVerifyEmailRoute();
    this.detectSignUpRoute();
    this.detectResetPswRoute();


    // this.router.events.pairwise().subscribe((event) => {
    //   console.log('-» -» -» AUTH GUARD EVENT ', event);
    // });

    /**
     * !!! having made a change of logic getCurrentProject() is no more used
     * NEW: initialize the new project when the id of the project get from url does not match with the current project id  */
    // this.getCurrentProject();
    this.getProjectIdFromUrl();


    // this.canActivate();


  }




  // canDeactivate(
  //   component: RequestsMsgsComponent | HomeComponent,
  //   route: ActivatedRouteSnapshot,
  //   state: RouterStateSnapshot
  // ): Observable<boolean> | boolean {
  //   console.log('!! CAN DEACTIVATE !! - ALLOW NAVIGATION ', this.allow_navigation)
  //   return this.allow_navigation;
  // }


  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      console.log('!! AUTH WF in auth.guard - CURRENT PROJECT: ', project)
      // tslint:disable-next-line:no-debugger
      // debugger

      if (project) {
        console.log('!! AUTH WF in auth.guard - CURRENT PROJECT ID : ', project._id)
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
        console.log('!! AUTH WF in auth.guard - CURRENT URL ', current_url);

        const url_segments = current_url.split('/');
        console.log('!! AUTH WF in auth.guard- CURRENT URL SEGMENTS ', url_segments);

        this.nav_project_id = url_segments[2];
        console.log('!! AUTH WF in auth.guard - CURRENT URL SEGMENTS > NAVIGATION PROJECT ID: ', this.nav_project_id);


        // -----------------------------------------------------------------
        // SINGLE SIGN-ON - STEP 1 - Check if the current url contains "?JWT" 
        // -----------------------------------------------------------------
        // const string_to_check = '?JWT';
        // if (current_url.includes(string_to_check)) {
        //   console.log('SSO (AUTH GUARD) - ⚡️⚡️⚡️ HEY THERE IS A JWT IN THE CURRENT URL');
        //   this.URL_HAS_JWT = true;
        //   // this.router.navigate(['/autologin']);
        //   // this.ssoService.current_url_has_JWT_token(decodeURI(current_url));

        //   // this.subscription.unsubscribe();
        // } else {
        //   this.URL_HAS_JWT = false;
        // }

        /**
         * !!! NO MORE USED checkIf_NavPrjctIdMatchesCurrentPrjctId()
         * *** CHECK IF THE PROJECT ID GET FROM THE CURRENT URL IS THE SAME OF THE CURRENT PROJECT ***
         * THE ID OF THE CURRENT PROJECT MAY BE DIFFERENT FROM THE ID OF THE PROJECT RETURNS FROM
         * THE URL (the navigation project id) FOR EXAMPLE IN CASE THE USER ACCESSES A PAGE OF THE
         * DASHBOARD FROM A LINK PRESENT IN THE EMAIL OF A REQUEST OR IN THE EMAIL OF INVITATION
         * TO A NEW PROJECT  */
        // this.checkIf_NavPrjctIdMatchesCurrentPrjctId();

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
    console.log('!! AUTH WF in auth.guard - PROJECT JSON GET FROM STORAGE ', storedProjectJson);


    if (storedProjectJson === null) {
      console.log('!! AUTH WF in auth.guard - PROJECT JSON IS NULL - RUN getProjects and filter for project id ')


      this.getProjectPublishAndSaveInStorage();



    }

    // else {
    //   const projectObject = JSON.parse(storedProjectJson);
    //   const projectNameStored = projectObject['name']
    //   console.log('!! »»»»» AUTH GUARD - PROJECT NAME FROM STORAGE ', projectNameStored);

    //   if (projectNameStored === undefined) {
    //     console.log('!! »»»»» AUTH GUARD - PROJECT NAME IS UNDEFINED - RUN getProjectById() ')
    //     // this.getProjectPublishAndSaveInStorage();
    //   }

    //   this.usersService.project_user_role_bs.subscribe((user_role) => {
    //     console.log('!! »»»»» AUTH GUARD - USER ROLE FROM SUBSCRIPTION ', user_role);
    //     if (user_role !== null) {

    //       const userRoleStored = projectObject['role'];
    //       console.log('!! »»»»» AUTH GUARD - USER ROLE FROM STORAGE ', userRoleStored);

    //       if (userRoleStored !== user_role) {
    //         console.log('!! »»»»» AUTH GUARD - USER ROLE STORED NOT MATCHES USER ROLE PUBLISHED  - RUN getProjectById() ')
    //         this.getProjectPublishAndSaveInStorage();

    //       }
    //     }
    //   })
    // }
  }

  getProjectPublishAndSaveInStorage() {
    // this.projectService.getProjectAndUserDetailsByProjectId(this.nav_project_id).subscribe((prjct: any) => {
    this.projectService.getProjects().subscribe((prjcts: any) => {
      console.log('!! AUTH WF in auth.guard - PROJECTS OBJCTS FROM REMOTE CALLBACK ', prjcts);

      const prjct = prjcts.filter(p => p.id_project._id === this.nav_project_id);

      console.log('!! AUTH WF in auth.guard - PROJECT OBJCT FILTERED FOR PROJECT ID ', prjct);
      console.log('!! AUTH WF in auth.guard - PROJECT OBJCT FILTERED FOR PROJECT ID LENGHT ', prjct.length);

      if (prjct && prjct.length > 0) {
        console.log('!! AUTH WF in auth.guard - TEST --- QUI ENTRO');
        // console.log('!!!!!! AUTH GUARD - N.P.I DOES NOT MATCH C.P.I - PROJECT GOT BY THE NAV PROJECT ID (N.P.I): ', project);

        this.nav_project_name = prjct[0].id_project.name;
        console.log('!! AUTH WF in auth.guard - PROJECT NAME GOT BY THE NAV PROJECT ID ', this.nav_project_name);
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
        console.log('!! AUTH WF in auth.guard - PROJECT THAT IS PUBLISHED ', project);
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
        console.log('!! »»»»» AUTH GUARD - PROJECT THAT IS STORED', projectForStorage);
        localStorage.setItem(this.nav_project_id, JSON.stringify(projectForStorage));

        // GET AND SAVE ALL USERS OF CURRENT PROJECT IN LOCAL STORAGE
        console.log('AUTH GUARD CALL -> getAllUsersOfCurrentProjectAndSaveInStorage')

        this.usersService.getAllUsersOfCurrentProjectAndSaveInStorage();

        // GET AND SAVE ALL BOTS OF CURRENT PROJECT IN LOCAL STORAGE
        this.usersService.getBotsByProjectIdAndSaveInStorage();

      } else {

        console.log('!! »»»»» AUTH GUARD - PROJECT OBJCT FILTERED FOR PROJECT ID !! NOT FOUND - GO TO PROJECTS ');

        this.goToProjects()
      }

    }, (error) => {
      console.log('!!!!!! AUTH GUARD - GET PROJECT BY ID - ERROR ', error);
    }, () => {
      console.log('!!!!!! AUTH GUARD - GET PROJECT BY ID - COMPLETE ');

      // this.resetCurrentProjectAndInizializeNewProject();
    });
  }

  goToProjects() {
    console.log('HAS CLICCKED GO TO PROJECT ')
    this.router.navigate(['/projects']);
    // (in AUTH SERVICE ) RESET PROJECT_BS AND REMOVE ITEM PROJECT FROM STORAGE WHEN THE USER GO TO PROJECTS PAGE
    this.auth.hasClickedGoToProjects();

    // this.project = null

    // this.subscription.unsubscribe();
    // this.unsubscribe$.next();
    // this.unsubscribe$.complete();

  
}

  // !!! NO MORE USED
  checkIf_NavPrjctIdMatchesCurrentPrjctId() {
    if (this.nav_project_id && this.current_project_id) {
      // this.allow_navigation = true;
      if (this.nav_project_id === this.current_project_id) {
        console.log('!!!!!! OOOOOK - AUTH GUARD - (N.P.I) NAVIGATION-PROJECT-ID >>> MATCHES <<< (C.P.I) CURRENT-PROJECT-ID')
      } else {
        // this.allow_navigation = false;

        // this.notify.showExiperdSessionPopup(false);
        // window.confirm('Discard changes?');

        console.log('!!!!!! KKKKKO - AUTH GUARD - (N.P.I) NAVIGATION-PROJECT-ID >>> DOES NOT MATCHES <<< (C.P.I) CURRENT-PROJECT-ID')

        // for debug get the current storedProject
        const storedProject = localStorage.getItem('project')
        console.log('!!!!!! 1) AUTH GUARD - CURRENT STORED PROJECT: ', storedProject);


        /*
         * *** GET PROJECT BY NAV PROJECT ID ***
         * THE PROJECT NAME IS NECESSARY TO INITIALIZE THE PROJECT SO RUN getProjectById()
         * TO GET THE PROJECT OBJECT (AND FROM THIS THE PROJECT NAME) BY THE PROJECT-ID GET FROM URL
         * (i.e., BY THE (N.P.I) NAVIGATION-PROJECT-ID)  */
        // this.getProjectById();

      }
    }
  }

  // !!! NO MORE USED
  // resetCurrentProjectAndInizializeNewProject() {
  //   this.resetProject();

  //   if (this.nav_project_name) {

  //     const project: Project = {
  //       _id: this.nav_project_id,
  //       name: this.nav_project_name,
  //     }

  //     // PROJECT ID and NAME ARE SENT TO THE AUTH SERVICE THAT PUBLISHES THEM
  //     this.auth.projectSelected(project)
  //     console.log('!!!!!! AUTH GUARD - PROJECT SENT TO THE AUTH SERVICE ', project)

  //     // PROJECT ID and NAME ARE SETTED IN THE STORAGE
  //     // localStorage.setItem('project', JSON.stringify(project));

  //     // GET AND SAVE ALL USERS OF CURRENT PROJECT IN LOCAL STORAGE
  //     this.usersService.getAllUsersOfCurrentProjectAndSaveInStorage();

  //     // for debug get the current storedProject
  //     const storedProject = localStorage.getItem('project')
  //     console.log('!!!!!! 2) AUTH GUARD - CURRENT STORED PROJECT: ', storedProject);
  //   }
  // }

  // !!! NO MORE USED
  // resetProject() {

  //   console.log('!!!!!! AUTH GUARD - RESET CURRENT PROJECT');
  //   this.auth.project_bs.next(null);
  //   localStorage.removeItem('project');
  // }

  detectVerifyEmailRoute() {
    // this.router.events.subscribe((val) => {
    if (this.location.path() !== '') {
      this.route = this.location.path();
      // console.log('»> »> AUTH GUARD »> »> ', this.route);
      if (this.route.indexOf('/verify') !== -1) {
        // this.router.navigate([`${this.route}`]);
        this.is_verify_email_page = true;
        console.log('%AUTH GUARD - IS VERIFY EMAIL PAGE »> »> ', this.is_verify_email_page);

      } else {
        this.is_verify_email_page = false;
        console.log('%AUTH GUARD - IS VERIFY EMAIL PAGE »> »> ', this.is_verify_email_page);

      }
    }
    // });
  }

  // 
  detectRoute() {
    if (this.location.path() !== '') {
      this.route = this.location.path();
      // console.log('»> »> AUTH GUARD »> »> ', this.route);
      if (this.route.indexOf('/handle-invitation') !== -1) {
        // this.router.navigate([`${this.route}`]);
        this.is_handleinvitation_page = true;
        console.log('%AUTH GUARD - IS HANDLE-INVITATION PAGE »> »> ', this.is_handleinvitation_page);

      } else {
        this.is_handleinvitation_page = false;
        console.log('%AUTH GUARD - IS HANDLE-INVITATION PAGE »> »> ', this.is_handleinvitation_page);
      }

      if (this.route.indexOf('/signup-on-invitation') !== -1) {
        // this.router.navigate([`${this.route}`]);
        this.is_signup_on_invitation_page = true;
        console.log('%AUTH GUARD - IS SIGNUP-ON-INVITATION PAGE »> »> ', this.is_signup_on_invitation_page);
      } else {
        this.is_signup_on_invitation_page = false;
        console.log('%AUTH GUARD - IS SIGNUP-ON-INVITATION  PAGE »> »> ', this.is_signup_on_invitation_page);
      }
    }
  }

  detectSignUpRoute() {
    if (this.location.path() !== '') {
      this.route = this.location.path();
      // console.log('»> »> AUTH GUARD »> »> ', this.route);
      if (this.route.indexOf('/signup') !== -1) {
        // this.router.navigate([`${this.route}`]);
        this.is_signup_page = true;
        console.log('%AUTH GUARD  - IS SIGNUP PAGE »> »> ', this.is_signup_page);

      } else {
        this.is_signup_page = false;
        console.log('%AUTH GUARD  - IS SIGNUP PAGE »> »> ', this.is_signup_page);

      }
    }
  }

  detectResetPswRoute() {
    if (this.location.path() !== '') {
      this.route = this.location.path();
      // console.log('»> »> AUTH GUARD »> »> ', this.route);
      if (this.route.indexOf('/resetpassword') !== -1) {
        // this.router.navigate([`${this.route}`]);
        this.is_reset_psw_page = true;
        console.log('%AUTH GUARD  - IS RESET PSW PAGE »> »> ', this.is_reset_psw_page);
      } else {
        this.is_reset_psw_page = false;
        console.log('%AUTH GUARD  - IS RESET PSW PAGE »> »> ', this.is_reset_psw_page);
      }
    }
  }

 


  // ------------------------------------------------------------------------
  // canActivate SSO 
  // ------------------------------------------------------------------------
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log('!! AUTH WF in auth.guard - CAN ACTIVATE AlwaysAuthGuard');
    console.log('SSO - CAN ACTIVATE user ', this.user);

    console.log('SSO - CAN ACTIVATE next ', next);
    console.log('SSO - CAN ACTIVATE state ', state);
    const url = state.url;

    console.log('SSO - CAN ACTIVATE state url  ', url);

    const route = url.substring(0, url.indexOf('?token=')); 
    console.log('SSO - CAN ACTIVATE route in url ', route);


    let queryParams = next.queryParams
    // console.log('SSO - CAN ACTIVATE queryParams ', queryParams);

  

    let stringifed_queryParams = JSON.stringify(queryParams)
    console.log('SSO - CAN ACTIVATE queryParams stringified', stringifed_queryParams);

    const HAS_JWT = stringifed_queryParams.includes('JWT');
    console.log('SSO - CAN ACTIVATE queryParams HAS_JWT', HAS_JWT);


    let token = next.queryParams.token
    console.log('SSO - CAN ACTIVATE queryParams HAS_JWT Token ', token);


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
        console.log('SSO - CAN ACTIVATE queryParams HAS_JWT: NOT HAS  navigate to login ');
      } else {
        console.log('SSO - CAN ACTIVATE queryParams HAS_JWT: YES HAS  navigate to autologin ');
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
    console.log('!! AUTH WF in auth.guard - CAN ACTIVATE AlwaysAuthGuard');

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

  //   console.log('CAN ACTIVATE (auth.guard.ts) ', firebase.auth().currentUser);
  //   return this.auth.user_bs.pipe(
  //     take(1),
  //     map((user) => !!user),
  //     tap((loggedIn) => {
  //       console.log('--- > LOGGED IN ', loggedIn);
  //       this.IS_LOGGED_IN.next(loggedIn);

  //       if (!loggedIn) {
  //         console.log('access denied');
  //         this.notify.update('You must be logged in!', 'error');
  //         this.router.navigate(['/login']);
  //       }
  //     }),
  //   );


  // }
  // canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
  //   if (this.auth.user_bs !== null) {
  //     console.log('AUTH GUARD ', this.auth.user_bs)
  //     return true;
  //   }
  //   return false;
  // }


}
