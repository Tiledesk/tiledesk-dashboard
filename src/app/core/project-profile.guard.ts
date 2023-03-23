import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Location } from '@angular/common';
import { ProjectPlanService } from '../services/project-plan.service';
import { LoggerService } from '../services/logger/logger.service';
import { PLAN_NAME } from 'app/utils/util';

@Injectable()
export class ProjectProfileGuard implements CanActivate {
  userIsAuthorized: boolean;
  PLAN_NAME = PLAN_NAME
  constructor(
    private router: Router,
    public location: Location,
    private prjctPlanService: ProjectPlanService,
    private logger: LoggerService
  ) {
    this.logger.log('[PROJECT-PROFILE-GUARD] HELLO !!!')

  }

  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {


    // this.logger.log('[PROJECT-PROFILE-GUARD]  canActivate next ', next)
    // this.logger.log('[PROJECT-PROFILE-GUARD]  canActivate state ', state)
    const prjct_id = next.params.projectid;
    // this.logger.log('[PROJECT-PROFILE-GUARD] GUARD canActivate next > ****** PRJCT ID ****** ', prjct_id)

    const url = state.url;
    console.log('[PROJECT-PROFILE-GUARD] canActivate state > ****** URL ****** ', url);


    const project = await this.prjctPlanService._getProjectById(prjct_id);
    console.log('[PROJECT-PROFILE-GUARD] (NEW WF) checkProjectPlan > ****** userIsAuthorized ****** ', project)

    const type = project['profile'].type;
    const planName = project['profile'].name;
    const isActiveSubscription = project['isActiveSubscription'];
    const trialExpired = project['trialExpired'];

    console.log('[PROJECT-PROFILE-GUARD] (NEW WF) Plan * type * ', type);
    console.log('[PROJECT-PROFILE-GUARD] (NEW WF) Plan * planName * ', planName);
    console.log('[PROJECT-PROFILE-GUARD] (NEW WF) Plan * isActiveSubscription * ', isActiveSubscription);
    console.log('[PROJECT-PROFILE-GUARD] (NEW WF) Plan * trialExpired * ', trialExpired);


    if (type === 'free') {
      if (trialExpired === true) {

        this.userIsAuthorized = false

        console.log('[PROJECT-PROFILE-GUARD] (NEW WF) Plan type', type, ' - userIsAuthorized ', this.userIsAuthorized);

      } else if (trialExpired === false) {

        this.userIsAuthorized = true;
        if ((planName !== PLAN_NAME.C && url.indexOf('/activities') !== -1)) {
          this.userIsAuthorized = false;
          console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> Plan type', type, 'Plan name: ', planName, ' - userIsAuthorized: ', this.userIsAuthorized);
          console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS ACTIVITIES', url.indexOf('/activities') !== -1);
        }

        console.log('[PROJECT-PROFILE-GUARD] (NEW WF) Plan type', type, ' - userIsAuthorized ', this.userIsAuthorized);
      }
    }



    if (type === 'payment') {
      console.log('[PROJECT-PROFILE-GUARD] -> (NEW WF) url', url);
      if (isActiveSubscription === true) {
        this.userIsAuthorized = true;
        if ((planName === PLAN_NAME.A && url.indexOf('/analytics') !== -1)) {
          this.userIsAuthorized = false;
          console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> Plan type', type, 'Plan name: ', planName, ' - userIsAuthorized: ', this.userIsAuthorized);
          console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS ANALYTICS', url.indexOf('/analytics') !== -1);

        } else {
          console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS ANALYTICS', url.indexOf('/analytics') !== -1);
        }


        if ((planName !== PLAN_NAME.C && url.indexOf('/activities') !== -1)) {
          this.userIsAuthorized = false;
          console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> Plan type', type, 'Plan name: ', planName, ' - userIsAuthorized: ', this.userIsAuthorized);
          console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS ACTIVITIES', url.indexOf('/activities') !== -1);

        } else {
          console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS ACTIVITIES', url.indexOf('/activities') !== -1);
        }
      } else if (isActiveSubscription === false) {

        this.userIsAuthorized = false;

        console.log('[PROJECT-PROFILE-GUARD] (NEW WF) Plan type', type, ' - userIsAuthorized ', this.userIsAuthorized);
      }
    }


    if (this.userIsAuthorized === true) {
      return true
    } else {
      // console.log('[PROJECT-PROFILE-GUARD] USER NOT AUTHORIZED - URL ', url);
      this.router.navigate([url + '-demo']);
      return false
    }

  }

}
