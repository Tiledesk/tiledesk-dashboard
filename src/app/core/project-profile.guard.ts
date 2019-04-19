import { Injectable } from '@angular/core';
// ActivatedRouteSnapshot, RouterStateSnapshot,
// tslint:disable-next-line:max-line-length
import { CanActivate, Router, NavigationEnd, NavigationStart, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { NotifyService } from './notify.service';

import { Observable } from 'rxjs/Observable';
import { map, take, tap } from 'rxjs/operators';

import * as firebase from 'firebase/app';

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
export class ProjectProfileGuard implements CanActivate {

  route: string;
  IS_ANALYTICS_PAGE: boolean;
  IS_ANALYTICS_DEMO_PAGE: boolean;
  current_project_trial_expired: boolean;
  current_project_id: string;

  user: any;
  is_verify_email_page: boolean;
  is_signup_page: boolean;
  is_reset_psw_page: boolean;
  nav_project_id: string;
  nav_project_name: string;
  allow_navigation = true;
  unauthorizedPage: boolean;
  USER_ROLE: string;
  subscription: Subscription;

  project_trial_expired: boolean;
  URL_last_fragment: string;

  constructor(
    private auth: AuthService,
    private authGuard: AuthGuard,
    private router: Router,
    private notify: NotifyService,
    public location: Location,
    private projectService: ProjectService,
    private usersService: UsersService
  ) {
    console.log('HELLO PROJECT-PROFILE GUARD !!!')

    this.user = auth.user_bs.value;
    this.auth.user_bs.subscribe((user) => {
      // tslint:disable-next-line:no-debugger
      // debugger
      this.user = user;
      console.log('AUTH GUARD USER ', user)
    });


    // this.detectNavigationStart();
    this.getCurrentProject();

  }




  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      console.log('»> »> PROJECT-PROFILE GUARD - CURRENT PROJECT: ', project)
      // tslint:disable-next-line:no-debugger
      // debugger

      if (project !== null) {
        console.log('»> »> PROJECT-PROFILE GUARD - CURRENT PROJECT ID : ', project._id)
        this.current_project_id = project._id;

      } else {
        console.log('»> »> PROJECT-PROFILE GUARD - CURRENT PROJECT ID NULL ')
        this.getProjectIdFromUrl();
      }
    });
  }

  getProjectIdFromUrl() {

    this.subscription = this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        const current_url = e.url

        console.log('»> »> PROJECT-PROFILE GUARD - CURRENT URL ', current_url);

        const url_segments = current_url.split('/');
        console.log('»> »> PROJECT-PROFILE GUARD - CURRENT URL SEGMENTS ', url_segments);

        this.nav_project_id = url_segments[2];
        // console.log('»> »> PROJECT-PROFILE GUARD - CURRENT URL SEGMENTS > NAVIGATION PROJECT ID: ', this.nav_project_id);

        if (this.nav_project_id && this.nav_project_id !== 'email') {

          this.subscription.unsubscribe();

          this.checkStoredProject(this.nav_project_id)
        }
      }
    });
  }

  checkStoredProject(navigationProjectId) {
    const storedProjectJson = localStorage.getItem(navigationProjectId);
    // console.log('»> »> PROJECT-PROFILE GUARD  - PROJECT JSON GET FROM STORAGE ', storedProjectJson);


    // if (storedProjectJson !== null) {
    //   console.log('!!C-U  »»»»» AUTH GUARD - PROJECT JSON IS NULL - RUN getProjectById() ')
    //   this.getProjectPublishAndSaveInStorage();
    // }

  }

  // public checkTrialExpired(): Promise<boolean> {

  //   return new Promise<boolean>((resolve, reject) => {
  //     // tslint:disable-next-line:max-line-length
  //     console.log('»> »> PROJECT-PROFILE GUARD called checkTrialExpired  TRIAL EXIPIRED ', this.project_trial_expired);

  //     setTimeout(() => { }, 300)
  //     resolve(this.project_trial_expired);

  //   });
  // }

  // detectNavigationStart() {
  //   console.log('»> »> PROJECT-PROFILE GUARD detectNavigationStart ');
  //   this.router.events.subscribe((val) => {
  //     this.router.events.filter((event: any) => event instanceof NavigationStart)
  //       .subscribe(event => {
  //         // console.log('»> »> PROJECT-PROFILE GUARD event.url', event.url);
  //         const url_spiltted = event.url.split('/');
  //         // console.log('»> »> PROJECT-PROFILE GUARD url_spiltted', url_spiltted);
  //         this.URL_last_fragment = url_spiltted[3];
  //         console.log('»> »> PROJECT-PROFILE GUARD detectNavigationStart ', this.URL_last_fragment);

  //       });
  //   })
  // }

  // public checkRoute(): Promise<string> {

  //   return new Promise<string>((resolve, reject) => {
  //     // tslint:disable-next-line:max-line-length
  //     console.log('»> »> PROJECT-PROFILE GUARD called checkRoute URL last fragment ', this.URL_last_fragment);

  //     setTimeout(() => { }, 300)
  //     resolve(this.URL_last_fragment);

  //   });
  // }






  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    console.log('»> »> PROJECT-PROFILE GUARD  canActivate next ', next)
    // console.log('»> »> PROJECT-PROFILE GUARD  canActivate state ', state)
    const prjct_id = next.params.projectid
    console.log('»> »> PROJECT-PROFILE GUARD canActivate state ****** PRJCT ID ****** ', prjct_id)
    const url = state.url
    console.log('»> »> PROJECT-PROFILE GUARD canActivate state ****** URL ****** ', url)
    // console.log('»> »> PROJECT-PROFILE GUARD AuthWithRedirectGuard.canActivate ');
    // tslint:disable-next-line:max-line-length
    // console.log('»> »> PROJECT-PROFILE GUARD - CAN ACTIVATE - IS ANALYTICS PAGE ', this.IS_ANALYTICS_PAGE, ' TRIAL expired ', this.current_project_trial_expired);
    let trial_expired = await this.auth.checkTrialExpired();
    
    if (trial_expired === undefined) {
      const storedProjectJson = localStorage.getItem(prjct_id);
      
      const storedProjectObject = JSON.parse(storedProjectJson);
      trial_expired = storedProjectObject.trial_expired
      console.log('»> »> PROJECT-PROFILE GUARD canActivate state ****** trial_expired (from stored) ****** ', trial_expired)
    }

    // const URL_last_fragment = await this.auth.checkRoute();

    // let trial_expired = await this.checkTrialExpired();
    // const URL_last_fragment = await this.checkRoute();
    console.log('»> »> PROJECT-PROFILE GUARD canActivate await trial expired: ************* ' + trial_expired);
    // console.log('»> »> PROJECT-PROFILE GUARD canActivate await URL_last_fragment: ************* ' + URL_last_fragment);
    if (trial_expired === undefined) {
      trial_expired = await this.auth.checkTrialExpired();
    }
    let authorized: boolean

    trial_expired === true ? authorized = false : authorized = true;

    if (!authorized) {
      // this.router.navigate(['/redirect']); `${id}`;
      // this.router.navigate([`project/${this.current_project_id}/${URL_last_fragment}-demo`]);
      this.router.navigate([url + '-demo']);

    }
    return authorized;


  }



  // || (this.IS_ANALYTICS_DEMO_PAGE === true) && (this.current_project_trial_expired=== false)

  // canActivate() {
  //   this.detectAnalyticsRoute();
  //   this.getCurrentProject();
  //   // tslint:disable-next-line:max-line-length
  //   console.log('»> »> PROJECT-PROFILE GUARD - CAN ACTIVATE - IS ANALYTICS PAGE ', this.IS_ANALYTICS_PAGE, ' TRIAL expired ', this.current_project_trial_expired);

  //   // tslint:disable-next-line:max-line-length
  //   // && (this.IS_ANALYTICS_PAGE === true) 
  //   if ((this.current_project_trial_expired === true)  && (this.IS_ANALYTICS_PAGE === true) ) {
  //     // this.router.navigate(['/home']);
  //     // this.router.navigate(['project/' + this.current_project_id + '/analytics']);
  //     this.router.navigate(['project/' + this.current_project_id + '/analytics-demo']);
  //     return false;


  //     // if ((!this.user) || (this.is_verify_email_page === false))
  //   } else {
  //     // tslint:disable-next-line:no-debugger
  //     // debugger


  //     // this.router.navigate(['/login']);
  //     return true;
  //   }





  // else if ((this.is_verify_email_page === false)) {
  //   this.router.navigate(['verify/email/']);
  //   return false;
  // }
  // }





  getProjectPublishAndSaveInStorage() {
    // this.projectService.getProjectAndUserDetailsByProjectId(this.nav_project_id).subscribe((prjct: any) => {
    this.projectService.getProjects().subscribe((prjcts: any) => {
      console.log('!! »»»»» AUTH GUARD - PROJECTS OBJCTS FROM REMOTE CALLBACK ', prjcts);

      const prjct = prjcts.filter(p => p.id_project._id === this.nav_project_id);

      console.log('!! »»»»» AUTH GUARD - PROJECT OBJCT FILTERED FOR PROJECT ID ', prjct);
      console.log('!! »»»»» AUTH GUARD - PROJECT OBJCT FILTERED FOR PROJECT ID LENGHT ', prjct.length);

      if (prjct && prjct.length > 0) {
        console.log('!! »»»»» AUTH GUARD - TEST --- QUI ENTRO');
        // console.log('!!!!!! AUTH GUARD - N.P.I DOES NOT MATCH C.P.I - PROJECT GOT BY THE NAV PROJECT ID (N.P.I): ', project);

        this.nav_project_name = prjct[0].id_project.name;
        console.log('!! »»»»» AUTH GUARD - PROJECT NAME GOT BY THE NAV PROJECT ID ', this.nav_project_name);
        // tslint:disable-next-line:max-line-length
        // this.notify.showNotificationChangeProject(`You have been redirected to the project <span style="color:#ffffff; display: inline-block; max-width: 100%;"> ${this.nav_project_name} </span>`, 0, 'info');

        const project: Project = {
          _id: this.nav_project_id,
          name: this.nav_project_name,
          profile_name: prjct[0].id_project.profile.name,
          trial_expired: prjct[0].id_project.trialExpired
        }
        // PROJECT ID and NAME ARE SENT TO THE AUTH SERVICE THAT PUBLISHES
        this.auth.projectSelected(project);
        console.log('!!C-U »»»»» AUTH GUARD - PROJECT THAT IS PUBLISHED ', project);
        // this.project_bs.next(project);

        const projectForStorage: Project = {
          _id: this.nav_project_id,
          name: this.nav_project_name,
          role: prjct[0].role,
          profile_name: prjct[0].id_project.profile.name,
          trial_expired: prjct[0].id_project.trialExpired
        }
        // SET THE ID, the NAME OF THE PROJECT and THE USER ROLE IN THE LOCAL STORAGE.
        console.log('!! »»»»» AUTH GUARD - PROJECT THAT IS STORED', projectForStorage);
        localStorage.setItem(this.nav_project_id, JSON.stringify(projectForStorage));

        // GET AND SAVE ALL USERS OF CURRENT PROJECT IN LOCAL STORAGE
        this.usersService.getAllUsersOfCurrentProjectAndSaveInStorage();

        // GET AND SAVE ALL BOTS OF CURRENT PROJECT IN LOCAL STORAGE
        this.usersService.getBotsByProjectIdAndSaveInStorage();

      } else {

        console.log('!! »»»»» AUTH GUARD - PROJECT OBJCT FILTERED FOR PROJECT ID !! NOT FOUND ');
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
