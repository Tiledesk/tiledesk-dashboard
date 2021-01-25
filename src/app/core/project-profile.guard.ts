import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { Location } from '@angular/common';
import { ProjectPlanService } from '../services/project-plan.service';

@Injectable()
export class ProjectProfileGuard implements CanActivate {
  userIsAuthorized: boolean;
  constructor(
    private auth: AuthService,
    private router: Router,
    public location: Location,
    private prjctPlanService: ProjectPlanService
  ) {
    console.log('HELLO PROJECT-PROFILE GUARD !!!')
  }

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    // console.log('»> »> PROJECT-PROFILE GUARD  canActivate next ', next)
    // console.log('»> »> PROJECT-PROFILE GUARD  canActivate state ', state)
    const prjct_id = next.params.projectid;
    // console.log('»> »> PROJECT-PROFILE GUARD canActivate next > ****** PRJCT ID ****** ', prjct_id)

    const url = state.url;
    console.log('»> »> PROJECT-PROFILE GUARD canActivate state > ****** URL ****** ', url);


    const project = await this.prjctPlanService._getProjectById(prjct_id);
    console.log('»> »> PROJECT-PROFILE GUARD (NEW WF) checkProjectPlan > ****** userIsAuthorized ****** ', project)

    const type = project['profile'].type;
    const isActiveSubscription = project['isActiveSubscription'];
    const trialExpired = project['trialExpired'];

    console.log('»> »> PROJECT-PROFILE GUARD (NEW WF) Plan * type * ', type);
    console.log('»> »> PROJECT-PROFILE GUARD (NEW WF) Plan * isActiveSubscription * ', isActiveSubscription);
    console.log('»> »> PROJECT-PROFILE GUARD (NEW WF) Plan * trialExpired * ', trialExpired);

    if (type === 'free') {
      if (trialExpired === true) {
        this.userIsAuthorized = false
        // tslint:disable-next-line:max-line-length
        console.log('»> »> PROJECT-PROFILE GUARD (NEW WF) Plan type', type, ' - userIsAuthorized ', this.userIsAuthorized);
      } else if (trialExpired === false) {
        this.userIsAuthorized = true
        // tslint:disable-next-line:max-line-length
        console.log('»> »> PROJECT-PROFILE GUARD (NEW WF) Plan type', type, ' - userIsAuthorized ', this.userIsAuthorized);
      }
    }

    if (type === 'payment') {
      if (isActiveSubscription === true) {
        this.userIsAuthorized = true;
        // tslint:disable-next-line:max-line-length
        console.log('»> »> PROJECT-PROFILE GUARD (NEW WF) Plan type', type, ' - userIsAuthorized ', this.userIsAuthorized);
      } else if (isActiveSubscription === false) {
        this.userIsAuthorized = false;
        // tslint:disable-next-line:max-line-length
        console.log('»> »> PROJECT-PROFILE GUARD (NEW WF) Plan type', type, ' - userIsAuthorized ', this.userIsAuthorized);
      }
    }


    if (this.userIsAuthorized === true) {

      return true
    } else {
      console.log('»> »> PROJECT-PROFILE GUARD USER NOT AUTHORIZED - URL ',url);
      this.router.navigate([url + '-demo']);
      return false
    }

  }
  // -------- old --------

  // if (!userIsAuthorized) {

  //   this.router.navigate([url + '-demo']);

  // }
  // return userIsAuthorized;

  // let trial_expired = await this.auth.checkTrialExpired();
  // tslint:disable-next-line:max-line-length
  // console.log('»> »> PROJECT-PROFILE GUARD canActivate await (from checkTrialExpired IN auth) trial expired: ********** ', trial_expired);

  // if (trial_expired === undefined) {
  //   const storedProjectJson = localStorage.getItem(prjct_id);

  //   if (storedProjectJson !== null) {
  //     const storedProjectObject = JSON.parse(storedProjectJson);
  //     trial_expired = storedProjectObject.trial_expired
  //     console.log('»> »> PROJECT-PROFILE GUARD canActivate ******  (from stored) TRIAL EXPIRED ****** ', trial_expired)
  //   }
  // }

  // let authorized: boolean

  // trial_expired === true ? authorized = false : authorized = true;

  // if (!authorized) {

  //   this.router.navigate([url + '-demo']);

  // }
  // return authorized;

  // }

}
