import { Injectable } from '@angular/core';
// ActivatedRouteSnapshot, RouterStateSnapshot,
// tslint:disable-next-line:max-line-length
import { CanActivate, Router, NavigationEnd, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from './auth.service';
import { NotifyService } from './notify.service';

import { Observable } from 'rxjs/Observable';
import { map, take, tap } from 'rxjs/operators';

import * as firebase from 'firebase/app';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Location } from '@angular/common';
import { ProjectService } from '../services/project.service';
import { Project } from '../models/project-model';
import { UsersService } from '../services/users.service';

import 'rxjs/add/operator/pairwise';
// import { RequestsMsgsComponent } from '../requests-msgs/requests-msgs.component';
// import { HomeComponent } from '../home/home.component';

// CanDeactivate<RequestsMsgsComponent | HomeComponent>
@Injectable()
export class AuthGuard implements CanActivate {

  // public IS_LOGGED_IN: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  route: string;
  user: any;
  is_verify_email_page: boolean;
  is_signup_page: boolean;
  is_reset_psw_page: boolean;

  nav_project_id: string;
  current_project_id: string;
  nav_project_name: string;

  allow_navigation = true;
  unauthorizedPage: boolean;

  USER_ROLE: string;

  constructor(
    private auth: AuthService,
    private router: Router,
    private notify: NotifyService,
    public location: Location,
    private projectService: ProjectService,
    private usersService: UsersService
  ) {
    console.log('HELLO AUTH GUARD !!!')

    this.user = auth.user_bs.value;
    this.auth.user_bs.subscribe((user) => {
      // tslint:disable-next-line:no-debugger
      // debugger
      this.user = user;
      console.log('AUTH GUARD USER ', user)
    });

    this.detectVerifyEmailRoute();
    this.detectSignUpRoute();
    this.detectResetPswRoute();
    this.canActivate();

    // this.router.events.pairwise().subscribe((event) => {
    //   console.log('-» -» -» AUTH GUARD EVENT ', event);
    // });

    /**
     * !!! having made a change of logic getCurrentProject() is no more used
     * NEW: initialize the new project when the id of the project get from url does not match with the current project id  */
    // this.getCurrentProject();
    this.getProjectIdFromUrl();

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
      console.log('!! AUTH GUARD - CURRENT PROJECT: ', project)
      // tslint:disable-next-line:no-debugger
      // debugger

      if (project) {
        console.log('!! AUTH GUARD - CURRENT PROJECT ID : ', project._id)
        this.current_project_id = project._id;

      }
    });
  }

  getProjectIdFromUrl() {
    // tslint:disable-next-line:no-debugger
    // debugger
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        // console.log('!! AUTH GUARD - EVENT ', e);
        const current_url = e.url
        console.log('!! AUTH GUARD - CURRENT URL ', current_url);

        const url_segments = current_url.split('/');
        console.log('!! AUTH GUARD - CURRENT URL SEGMENTS ', url_segments);


        this.nav_project_id = url_segments[2];
        console.log('!! AUTH GUARD - CURRENT URL SEGMENTS > NAVIGATION PROJECT ID: ', this.nav_project_id);

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
         * AND NAME OF THE PROJECT ARE SAVED IN THE LOCAL STORAGE AND PASSES TO THE SERVICE THAT PUBLISHES */
        if (this.nav_project_id) {
          this.checkStoredProject(this.nav_project_id)
        }
      }
    });
  }

  checkStoredProject(navigationProjectId) {
    const storedProjectJson = localStorage.getItem(navigationProjectId);
    console.log('!! »»»»» AUTH GUARD - PROJECT JSON GET FROM STORAGE ', storedProjectJson);


    if (storedProjectJson === null) {
      console.log('!! »»»»» AUTH GUARD - PROJECT JSON IS NULL - RUN getProjectById() ')
      this.getProjectPublishAndSaveInStorage();

    } else {
      const projectObject = JSON.parse(storedProjectJson);
      const projectNameStored = projectObject['name']
      console.log('!! »»»»» AUTH GUARD - PROJECT NAME FROM STORAGE ', projectNameStored);

      if (projectNameStored === undefined) {
        console.log('!! »»»»» AUTH GUARD - PROJECT NAME IS UNDEFINED - RUN getProjectById() ')
        // this.getProjectPublishAndSaveInStorage();
      }

      // const userRoleStored = projectObject['role']
      // if ( )

      this.usersService.project_user_role_bs.subscribe((user_role) => {
        console.log('!! »»»»» AUTH GUARD - USER ROLE FROM SUBSCRIPTION ', user_role);
        const userRoleStored = projectObject['role'];
        console.log('!! »»»»» AUTH GUARD - USER ROLE FROM STORAGE ', userRoleStored);

        if (userRoleStored !== user_role) {
          console.log('!! »»»»» AUTH GUARD - USER ROLE STORED NOT MATCHES USER ROLE PUBLISHED  - RUN getProjectById() ')
          // this.getProjectPublishAndSaveInStorage();

        }
      })
    }
  }

  getProjectPublishAndSaveInStorage() {
    // this.projectService.getProjectAndUserDetailsByProjectId(this.nav_project_id).subscribe((prjct: any) => {
    this.projectService.getProjects().subscribe((prjcts: any) => {
      console.log('!! »»»»» AUTH GUARD - PROJECTS OBJCTS FROM REMOTE CALLBACK ', prjcts);

      const prjct = prjcts.filter(p => p.id_project._id === this.nav_project_id);

      console.log('!! »»»»» AUTH GUARD - PROJECT OBJCT FILTERED FOR PROJECT ID ', prjct);

      if (prjct) {
        console.log('!! »»»»» AUTH GUARD - TEST --- QUI ENTRO');
        // console.log('!!!!!! AUTH GUARD - N.P.I DOES NOT MATCH C.P.I - PROJECT GOT BY THE NAV PROJECT ID (N.P.I): ', project);

        this.nav_project_name = prjct[0].id_project.name;
        console.log('!! »»»»» AUTH GUARD - PROJECT NAME GOT BY THE NAV PROJECT ID ', this.nav_project_name);
        // tslint:disable-next-line:max-line-length
        // this.notify.showNotificationChangeProject(`You have been redirected to the project <span style="color:#ffffff; display: inline-block; max-width: 100%;"> ${this.nav_project_name} </span>`, 0, 'info');

        const project: Project = {
          _id: this.nav_project_id,
          name: this.nav_project_name,
        }
        // PROJECT ID and NAME ARE SENT TO THE AUTH SERVICE THAT PUBLISHES
        this.auth.projectSelected(project);
        console.log('!! »»»»» AUTH GUARD - PROJECT THAT IS PUBLISHED ', project);
        // this.project_bs.next(project);

        const projectForStorage: Project = {
          _id: this.nav_project_id,
          name: this.nav_project_name,
          role: prjct[0].role
        }
        // SET THE ID, the NAME OF THE PROJECT and THE USER ROLE IN THE LOCAL STORAGE.
        console.log('!! »»»»» AUTH GUARD - PROJECT THAT IS STORED', projectForStorage);
        localStorage.setItem(this.nav_project_id, JSON.stringify(projectForStorage));

        // GET AND SAVE ALL USERS OF CURRENT PROJECT IN LOCAL STORAGE
        this.usersService.getAllUsersOfCurrentProjectAndSaveInStorage();

      }

    }, (error) => {
      console.log('!!!!!! AUTH GUARD - GET PROJECT BY ID - ERROR ', error);
    }, () => {
      console.log('!!!!!! AUTH GUARD - GET PROJECT BY ID - COMPLETE ');

      // this.resetCurrentProjectAndInizializeNewProject();
    });
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
  resetCurrentProjectAndInizializeNewProject() {
    this.resetProject();

    if (this.nav_project_name) {

      const project: Project = {
        _id: this.nav_project_id,
        name: this.nav_project_name,
      }

      // PROJECT ID and NAME ARE SENT TO THE AUTH SERVICE THAT PUBLISHES THEM
      this.auth.projectSelected(project)
      console.log('!!!!!! AUTH GUARD - PROJECT SENT TO THE AUTH SERVICE ', project)

      // PROJECT ID and NAME ARE SETTED IN THE STORAGE
      // localStorage.setItem('project', JSON.stringify(project));

      // GET AND SAVE ALL USERS OF CURRENT PROJECT IN LOCAL STORAGE
      this.usersService.getAllUsersOfCurrentProjectAndSaveInStorage();

      // for debug get the current storedProject
      const storedProject = localStorage.getItem('project')
      console.log('!!!!!! 2) AUTH GUARD - CURRENT STORED PROJECT: ', storedProject);
    }
  }

  // !!! NO MORE USED
  resetProject() {
    // tslint:disable-next-line:no-debugger
    // debugger
    console.log('!!!!!! AUTH GUARD - RESET CURRENT PROJECT');
    this.auth.project_bs.next(null);
    localStorage.removeItem('project');
  }

  detectVerifyEmailRoute() {
    // this.router.events.subscribe((val) => {
    if (this.location.path() !== '') {
      this.route = this.location.path();
      // console.log('»> »> AUTH GUARD »> »> ', this.route);
      if (this.route.indexOf('/verify') !== -1) {
        // this.router.navigate([`${this.route}`]);
        this.is_verify_email_page = true;
        console.log('»> »>  AUTH GUARD - IS VERIFY EMAIL PAGE »> »> ', this.is_verify_email_page);

      } else {
        this.is_verify_email_page = false;
        console.log('»> »>  AUTH GUARD - IS VERIFY EMAIL PAGE »> »> ', this.is_verify_email_page);

      }
    }
    // });
  }

  detectSignUpRoute() {
    if (this.location.path() !== '') {
      this.route = this.location.path();
      // console.log('»> »> AUTH GUARD »> »> ', this.route);
      if (this.route.indexOf('/signup') !== -1) {
        // this.router.navigate([`${this.route}`]);
        this.is_signup_page = true;
        console.log('»> »>  AUTH GUARD - IS SIGNUP PAGE »> »> ', this.is_signup_page);

      } else {
        this.is_signup_page = false;
        console.log('»> »>  AUTH GUARD - IS SIGNUP PAGE »> »> ', this.is_signup_page);

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
        console.log('»> »>  AUTH GUARD - IS RESET PSW PAGE »> »> ', this.is_reset_psw_page);
      } else {
        this.is_reset_psw_page = false;
        console.log('»> »>  AUTH GUARD - IS RESET PSW PAGE »> »> ', this.is_reset_psw_page);
      }
    }
  }

  canActivate() {
    console.log('»> »> !!! »»» AUTH GUARD - CAN ACTIVATE AlwaysAuthGuard');

    // tslint:disable-next-line:max-line-length
    if ((this.user) || (this.is_verify_email_page === true) || (this.is_signup_page === true) || (this.is_reset_psw_page === true)) {
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
