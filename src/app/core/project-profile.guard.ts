import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Location } from '@angular/common';
import { ProjectPlanService } from '../services/project-plan.service';
import { LoggerService } from '../services/logger/logger.service';
import { PLAN_NAME } from 'app/utils/util';
import { UsersService } from 'app/services/users.service';
import { AuthService } from './auth.service';

@Injectable()
export class ProjectProfileGuard implements CanActivate {
  userIsAuthorized: boolean;
  PLAN_NAME = PLAN_NAME;
  USER_ROLE: string
  userId: string
  constructor(
    private router: Router,
    public location: Location,
    private prjctPlanService: ProjectPlanService,
    private logger: LoggerService,
    private usersService: UsersService,
    public auth: AuthService,
  ) {
    this.logger.log('[PROJECT-PROFILE-GUARD] HELLO !!!')
   
  }



  async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    // this.auth.user_bs
    // .subscribe((user) => {
    //   console.log('[PROJECT-PROFILE-GUARD] - user ', user)


    //   if (user) {
      
    //     this.userId = user._id
    //     console.log('[PROJECT-PROFILE-GUARD] - userId ', this.userId)
    //   }
    // })
    // this.logger.log('[PROJECT-PROFILE-GUARD]  canActivate next ', next)
    // this.logger.log('[PROJECT-PROFILE-GUARD]  canActivate state ', state)
    const prjct_id = next.params.projectid;
    // this.logger.log('[PROJECT-PROFILE-GUARD] GUARD canActivate next > ****** PRJCT ID ****** ', prjct_id)

    const url = state.url;
    // console.log('[PROJECT-PROFILE-GUARD] canActivate state > ****** URL ****** ', url);


    const project = await this.prjctPlanService._getProjectById(prjct_id);
    this.logger.log('[PROJECT-PROFILE-GUARD] (NEW WF) checkProjectPlan > ****** project ****** ', project)

    // const userRole = await this.prjctPlanService.getProjectUserByUserId(this.userId, prjct_id );
    // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) checkProjectPlan > ****** userRole ****** ', userRole)

    const type = project['profile'].type;
    const planName = project['profile'].name;
    const isActiveSubscription = project['isActiveSubscription'];
    const trialExpired = project['trialExpired'];

    // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) Plan * type * ', type);
    // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) Plan * planName * ', planName);
    // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) Plan * isActiveSubscription * ', isActiveSubscription);
    // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) Plan * trialExpired * ', trialExpired);


    if (type === 'free') {
      if (trialExpired === true) {

        this.userIsAuthorized = false

        // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) Plan type', type, ' - userIsAuthorized ', this.userIsAuthorized);

      } else if (trialExpired === false) {


        this.userIsAuthorized = true;

        // if (url.indexOf('/wsrequests') !== -1) {
        //   this.userIsAuthorized = false;
        // }

        // if (url.indexOf('/cannedresponses') !== -1) {
        //   this.userIsAuthorized = false;
        // }

        if ((planName !== PLAN_NAME.C && planName !== PLAN_NAME.F && url.indexOf('/activities') !== -1)) {
          this.userIsAuthorized = false;
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> Plan type', type, 'Plan name: ', planName, ' - userIsAuthorized: ', this.userIsAuthorized);
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS ACTIVITIES', url.indexOf('/activities') !== -1);
        }

        if ((planName !== PLAN_NAME.C && planName !== PLAN_NAME.F && url.indexOf('/automations') !== -1)) {
          this.userIsAuthorized = false;
          this.logger.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> Plan type', type, 'Plan name: ', planName, ' - userIsAuthorized: ', this.userIsAuthorized);
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS ACTIVITIES', url.indexOf('/activities') !== -1);
        }

        if ((planName !== PLAN_NAME.C && planName !== PLAN_NAME.F && url.indexOf('/email') !== -1)) {
          this.userIsAuthorized = false;
          this.logger.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> Plan type', type, 'Plan name: ', planName, ' - userIsAuthorized: ', this.userIsAuthorized);
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS ACTIVITIES', url.indexOf('/activities') !== -1);
        }

        // if ((planName !== PLAN_NAME.C && planName !== PLAN_NAME.F && url.indexOf('/notification-email') !== -1)) {
        //   this.userIsAuthorized = false;
        //   this.logger.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> Plan type', type, 'Plan name: ', planName, ' - userIsAuthorized: ', this.userIsAuthorized);
        //   // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS ACTIVITIES', url.indexOf('/activities') !== -1);
        // }


        // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) Plan type', type, ' - userIsAuthorized ', this.userIsAuthorized);
      }
    }

    if (type === 'payment') {
      // console.log('[PROJECT-PROFILE-GUARD] -> (NEW WF) url', url);
      // console.log('[PROJECT-PROFILE-GUARD] -> (NEW WF) isActiveSubscription 1', isActiveSubscription);
      if (isActiveSubscription === true) {
        this.userIsAuthorized = true;
        // PLAN A and D UNAUTHORIZED TO Analytics + Departments + GROUPS 
        if (
          (planName === PLAN_NAME.A && url.indexOf('/analytics') !== -1) ||
          (planName === PLAN_NAME.A && url.indexOf('/department/create') !== -1) ||
          (planName === PLAN_NAME.A && url.indexOf('/groups') !== -1) ||
          (planName === PLAN_NAME.D && url.indexOf('/analytics') !== -1) ||
          (planName === PLAN_NAME.D && url.indexOf('/department/create') !== -1) ||
          (planName === PLAN_NAME.D && url.indexOf('/groups') !== -1)

        ) {
          this.userIsAuthorized = false;
          this.logger.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> Plan type', type, 'Plan name: ', planName, ' - userIsAuthorized: ', this.userIsAuthorized);
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS ', url);
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PLAN_NAME.A ', PLAN_NAME.A);
        }

        // PLAN A and  AUTHORIZED TO CONTACTS
       if (planName === PLAN_NAME.A && url.indexOf('/contacts') !== -1) { 
          this.userIsAuthorized = true;
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> Plan type', type, 'Plan name: ', planName, ' - userIsAuthorized: ', this.userIsAuthorized);
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS ', url);
        }
        else {
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS ', url.indexOf('/analytics') !== -1);
        }
        
        //  PLAN A and PLAN B and PLAN C AUTHORIZED TO MONITOR
        if ((planName === PLAN_NAME.A && url.indexOf('/wsrequests') !== -1) || (planName === PLAN_NAME.B && url.indexOf('/wsrequests') !== -1) || (planName === PLAN_NAME.C && url.indexOf('/wsrequests') !== -1)) {
          this.userIsAuthorized = true;
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> Plan type', type, 'Plan name: ', planName, ' - userIsAuthorized: ', this.userIsAuthorized);
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS wsrequests', url.indexOf('/wsrequests') !== -1);

        }
        // else {
        //   console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS wsrequests', url.indexOf('/wsrequests') !== -1);
        // }

        // PLAN B and PLAN C AUTHORIZED TO CRM
        if ((planName === PLAN_NAME.B && url.indexOf('/contacts') !== -1) || (planName === PLAN_NAME.C && url.indexOf('/contacts') !== -1)) {
          this.userIsAuthorized = true;
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> Plan type', type, 'Plan name: ', planName, ' - userIsAuthorized: ', this.userIsAuthorized);
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS contacts', url.indexOf('/contacts') !== -1);

        }
        // else {
        //   console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS contacts', url.indexOf('/contacts') !== -1);
        // }

        // PLAN B and PLAN C  AUTHORIZED TO MONITOR
        if ((planName === PLAN_NAME.B && url.indexOf('/wsrequests') !== -1) || (planName === PLAN_NAME.C && url.indexOf('/wsrequests') !== -1)) {
          this.userIsAuthorized = true;
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> Plan type', type, 'Plan name: ', planName, ' - userIsAuthorized: ', this.userIsAuthorized);
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS wsrequests', url.indexOf('/wsrequests') !== -1);

        }
        // else {
        //   console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS wsrequests', url.indexOf('/wsrequests') !== -1);
        // }

        // PLAN B and PLAN C  AUTHORIZED TO OPERATING HOURS
        if ((planName === PLAN_NAME.B && url.indexOf('/hours') !== -1) || (planName === PLAN_NAME.C && url.indexOf('/hours') !== -1)) {
          this.userIsAuthorized = true;
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> Plan type', type, 'Plan name: ', planName, ' - userIsAuthorized: ', this.userIsAuthorized);
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS hours', url.indexOf('/hours') !== -1);

        }
        // else {
        //   console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS wsrequests', url.indexOf('/hours') !== -1);
        // }

        // PLAN B and PLAN C  AUTHORIZED TO  email ticketing
        // (planName === PLAN_NAME.B && url.indexOf('/email') !== -1) ||
        if ( (planName === PLAN_NAME.C && url.indexOf('/email') !== -1)) {
          this.userIsAuthorized = true;
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> Plan type', type, 'Plan name: ', planName, ' - userIsAuthorized: ', this.userIsAuthorized);
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS email ticketing', url.indexOf('/email') !== -1);

        }

        
        // else {
        //   console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS email ticketing', url.indexOf('/email') !== -1);
        // }

        // PLAN D (Basic) + PLAN E (Premium) + PLAN EE (Team) UNAUTHORIZED TO email ticketing
        if (( planName === PLAN_NAME.A && url.indexOf('/email') !== -1) ||  (planName === PLAN_NAME.B && url.indexOf('/email') !== -1)  || (planName === PLAN_NAME.D && url.indexOf('/email') !== -1 ) ||  (planName === PLAN_NAME.E && url.indexOf('/email') !== -1) ||  (planName === PLAN_NAME.EE && url.indexOf('/email') !== -1)) {
          this.userIsAuthorized = false;
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> Plan type', type, 'Plan name: ', planName, ' - userIsAuthorized: ', this.userIsAuthorized);
        }

        // if (( planName === PLAN_NAME.A && url.indexOf('/notification-email') !== -1) ||  (planName === PLAN_NAME.B && url.indexOf('/notification-email') !== -1)  || (planName === PLAN_NAME.D && url.indexOf('/notification-email') !== -1 ) ||  (planName === PLAN_NAME.E && url.indexOf('/notification-email') !== -1) ||  (planName === PLAN_NAME.EE && url.indexOf('/notification-email') !== -1)) {
        //   this.userIsAuthorized = false;
        //   // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> Plan type', type, 'Plan name: ', planName, ' - userIsAuthorized: ', this.userIsAuthorized);
        // }

        // PLAN B and PLAN C  AUTHORIZED TO OPERATING CANNED RESPONSES
        if ((planName === PLAN_NAME.B && url.indexOf('/cannedresponses') !== -1) || (planName === PLAN_NAME.C && url.indexOf('/cannedresponses') !== -1)) {
          this.userIsAuthorized = true;
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> Plan type', type, 'Plan name: ', planName, ' - userIsAuthorized: ', this.userIsAuthorized);
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS cannedresponses', url.indexOf('/cannedresponses') !== -1);

        }
        // else {
        //   console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS cannedresponses', url.indexOf('/cannedresponses') !== -1);
        // }

        // PLAN B and PLAN C AUTHORIZED TO DEPARTMENTS
        // if ((planName === PLAN_NAME.B && url.indexOf('/departments') !== -1) || (planName === PLAN_NAME.C && url.indexOf('/departments') !== -1)) {
        //   this.userIsAuthorized = true;
        //   // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> Plan type', type, 'Plan name: ', planName, ' - userIsAuthorized: ', this.userIsAuthorized);
        //   // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS departments', url.indexOf('/departments') !== -1);

        // }
        // // else {
        // //   console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS departments', url.indexOf('/departments') !== -1);
        // // }

        // PLAN B and PLAN C AUTHORIZED TO GROUPS
        if ((planName === PLAN_NAME.B && url.indexOf('/groups') !== -1) || (planName === PLAN_NAME.C && url.indexOf('/groups') !== -1)) {
          this.userIsAuthorized = true;
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> Plan type', type, 'Plan name: ', planName, ' - userIsAuthorized: ', this.userIsAuthorized);
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS  groups', url.indexOf('/groups') !== -1);

        }
        // else {
        //   console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS  groups', url.indexOf('/groups') !== -1);
        // }

        // PLAN B and PLAN C AUTHORIZED TO ANALYTICS
        if ((planName === PLAN_NAME.B && url.indexOf('/analytics') !== -1) || (planName === PLAN_NAME.C && url.indexOf('/analytics') !== -1)) {
          this.userIsAuthorized = true;
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> Plan type', type, 'Plan name: ', planName, ' - userIsAuthorized: ', this.userIsAuthorized);
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS analytics', url.indexOf('/analytics') !== -1);

        }
        // else {
        //   console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS analytics', url.indexOf('/analytics') !== -1);
        // }


        if ((planName !== PLAN_NAME.C && planName !== PLAN_NAME.F && url.indexOf('/activities') !== -1)) {
          this.userIsAuthorized = false;
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> Plan type', type, 'Plan name: ', planName, ' - userIsAuthorized: ', this.userIsAuthorized);
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS ACTIVITIES', url.indexOf('/activities') !== -1);

        } else {
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS ACTIVITIES', url.indexOf('/activities') !== -1);
        }

        if ((planName !== PLAN_NAME.C && planName !== PLAN_NAME.F && url.indexOf('/automations') !== -1)) {
          this.userIsAuthorized = false;
          this.logger.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> Plan type', type, 'Plan name: ', planName, ' - userIsAuthorized: ', this.userIsAuthorized);
          this.logger.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS automations', url.indexOf('/automations') !== -1);

        } else {
          // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> PAGE IS ACTIVITIES', url.indexOf('/activities') !== -1);
        }
      } else if (isActiveSubscription === false) {
        this.logger.log('[PROJECT-PROFILE-GUARD] -> (NEW WF) isActiveSubscription 2', isActiveSubscription);
        this.userIsAuthorized = false;

        if (( planName === PLAN_NAME.D && url.indexOf('/email') !== -1 ) ||  (planName === PLAN_NAME.E && url.indexOf('/email') !== -1) ||  (planName === PLAN_NAME.EE && url.indexOf('/email') !== -1) ||  (planName === PLAN_NAME.F && url.indexOf('/email') !== -1)) {
          this.userIsAuthorized = false;
          this.logger.log('[PROJECT-PROFILE-GUARD] (NEW WF) -> Plan type', type, 'Plan name: ', planName, ' - userIsAuthorized: ', this.userIsAuthorized);
        }

        // console.log('[PROJECT-PROFILE-GUARD] (NEW WF) Plan type', type, ' - userIsAuthorized ', this.userIsAuthorized);
      }
    }

    
    if (this.userIsAuthorized === true) {
      return true
      // if (this.userIsAuthorized === false &&  userRole !== 'agent')
    } else {
      this.logger.log('[PROJECT-PROFILE-GUARD] USER NOT AUTHORIZED - URL ', url);
      this.router.navigate([url + '-demo']);
      return false
    }


    // if (this.userIsAuthorized === true) {
    //   return true
    // } else if (this.userIsAuthorized === false && this.USER_ROLE !== 'agent' ){
    //   // console.log('[PROJECT-PROFILE-GUARD] USER NOT AUTHORIZED - URL ', url);
    //   console.log('[PROJECT-PROFILE-GUARD] YERE GO TO DEMO USER_ROLE ', this.USER_ROLE);
    //   this.router.navigate([url + '-demo']);
    //   return false
    // }

  }

}
