import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Location } from '@angular/common';
import { ProjectPlanService } from '../services/project-plan.service';
import { LoggerService } from '../services/logger/logger.service';

@Injectable()
export class ProjectProfileGuard implements CanActivate {
  userIsAuthorized: boolean;
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
    this.logger.log('[PROJECT-PROFILE-GUARD] canActivate state > ****** URL ****** ', url);


    const project = await this.prjctPlanService._getProjectById(prjct_id);
    this.logger.log('[PROJECT-PROFILE-GUARD] (NEW WF) checkProjectPlan > ****** userIsAuthorized ****** ', project)

    const type = project['profile'].type;
    const isActiveSubscription = project['isActiveSubscription'];
    const trialExpired = project['trialExpired'];

    this.logger.log('[PROJECT-PROFILE-GUARD] (NEW WF) Plan * type * ', type);
    this.logger.log('[PROJECT-PROFILE-GUARD] (NEW WF) Plan * isActiveSubscription * ', isActiveSubscription);
    this.logger.log('[PROJECT-PROFILE-GUARD] (NEW WF) Plan * trialExpired * ', trialExpired);

    if (type === 'free') {
      if (trialExpired === true) {

        this.userIsAuthorized = false

        this.logger.log('[PROJECT-PROFILE-GUARD] (NEW WF) Plan type', type, ' - userIsAuthorized ', this.userIsAuthorized);

      } else if (trialExpired === false) {

        this.userIsAuthorized = true

        this.logger.log('[PROJECT-PROFILE-GUARD] (NEW WF) Plan type', type, ' - userIsAuthorized ', this.userIsAuthorized);
      }
    }

    if (type === 'payment') {
      if (isActiveSubscription === true) {

        this.userIsAuthorized = true;

        this.logger.log('[PROJECT-PROFILE-GUARD] (NEW WF) Plan type', type, ' - userIsAuthorized ', this.userIsAuthorized);

      } else if (isActiveSubscription === false) {

        this.userIsAuthorized = false;

        this.logger.log('[PROJECT-PROFILE-GUARD] (NEW WF) Plan type', type, ' - userIsAuthorized ', this.userIsAuthorized);
      }
    }


    if (this.userIsAuthorized === true) {
      return true
    } else {
      this.logger.log('[PROJECT-PROFILE-GUARD] USER NOT AUTHORIZED - URL ', url);
      this.router.navigate([url + '-demo']);
      return false
    }

  }

}
