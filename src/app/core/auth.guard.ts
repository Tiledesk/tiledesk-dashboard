import { Injectable } from '@angular/core';
// ActivatedRouteSnapshot, RouterStateSnapshot,
// tslint:disable-next-line:max-line-length
import { CanActivate, Router, NavigationStart, NavigationEnd, NavigationError, NavigationCancel, RoutesRecognized, ActivatedRoute } from '@angular/router';

import { AngularFireAuth } from 'angularfire2/auth';
import { AuthService } from './auth.service';
import { NotifyService } from './notify.service';

import { Observable } from 'rxjs/Observable';
import { map, take, tap } from 'rxjs/operators';

import * as firebase from 'firebase/app';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Location } from '@angular/common';
import { ProjectService } from '../services/project.service';

import 'rxjs/add/operator/pairwise';

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

  constructor(
    private auth: AuthService,
    private router: Router,
    private notify: NotifyService,
    public location: Location,
    private activatedRoute: ActivatedRoute,
    private projectService: ProjectService
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

    // router.events.subscribe((val) => {
    //   // see also RoutesRecognized
    //   // console.log('AUTH GUARD - NavigationEnd ', val instanceof NavigationEnd);
    //   console.log('AUTH GUARD - RoutesRecognized ', val instanceof RoutesRecognized)
    // });

    // this.router.events.pairwise().subscribe((event) => {
    //   console.log('-» -» -» AUTH GUARD EVENT ', event);
    // });


    this.getCurrentProject();
    this.getProjectIdFromUrl();




  }

  getProjectIdFromUrl() {
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
         * *** CHECK IF THE PROJECT ID GET FROM THE CURRENT URL IS THE SAME OF THE CURRENT PROJECT ***
         * THE ID OF THE CURRENT PROJECT MAY BE DIFFERENT FROM THE ID OF THE PROJECT RETURNS FROM
         * THE URL (the navigation project id) FOR EXAMPLE IN CASE THE USER ACCESSES A PAGE OF THE
         * DASHBOARD FROM A LINK PRESENT IN THE EMAIL OF A REQUEST OR IN THE EMAIL OF INVITATION
         * TO A NEW PROJECT
         */
        this.checkIf_NavPrjctIdMatchesCurrentPrjctId();
      }
    });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      console.log('!! AUTH GUARD - CURRENT PROJECT: ', project)

      if (project) {
        console.log('!! AUTH GUARD - CURRENT PROJECT ID : ', project._id)
        this.current_project_id = project._id;
      }
    });
  }

  checkIf_NavPrjctIdMatchesCurrentPrjctId() {

    if (this.nav_project_id && this.current_project_id && this.nav_project_id === this.current_project_id) {
      console.log('!!!!!! OOOOOK - AUTH GUARD - NAVIGATION-PROJECT-ID MATCHES CURRENT-PROJECT-ID')
    } else {
      console.log('!!!!!! KKKKKO - AUTH GUARD - NAVIGATION-PROJECT-ID DO NOT MATCHES CURRENT-PROJECT-ID')
      // this.getProjectById();
    }
  }

  /**
   * *** GET PROJECT OBJECT BY ID ***
   */
  getProjectById() {
    this.projectService.getMongDbProjectById(this.nav_project_id).subscribe((project: any) => {
      console.log('++ > GET PROJECT (DETAILS) BY ID - PROJECT OBJECT: ', project);
    },
      (error) => {
        console.log('GET PROJECT BY ID - ERROR ', error);
      },
      () => {
        console.log('GET PROJECT BY ID - COMPLETE ');

      });
  }

  detectVerifyEmailRoute() {
    // this.router.events.subscribe((val) => {
    if (this.location.path() !== '') {
      this.route = this.location.path();
      // console.log('AUTH GUARD »> »> ', this.route);
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
      // console.log('AUTH GUARD »> »> ', this.route);
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
      // console.log('AUTH GUARD »> »> ', this.route);
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
    console.log('AlwaysAuthGuard');

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
