// tslint:disable:max-line-length
import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { ProjectService } from '../services/project.service';
import { Project } from '../models/project-model';
import { NotifyService } from '../core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '../services/logger/logger.service';
@Injectable()

export class ProjectPlanService {

  public projectPlan$: BehaviorSubject<Project> = new BehaviorSubject<Project>(null);

  projectID: string;
  TOKEN: string
  project_deleted_notification: string
  progetIdGetFromParams: string
  constructor(
    private router: Router,
    private auth: AuthService,
    private projectService: ProjectService,
    private notify: NotifyService,
    private translate: TranslateService,
    private logger: LoggerService
  ) {
    this.getProjectIdFroUrlAndIfExistGetProjectByIdAndPublish('costructor');
    this.getUserToken();
    this.translateNotificationMsgs();
  }

  translateNotificationMsgs() {
    this.translate.get('ProjectEditPage.NotificationMsgs')
      .subscribe((translation: any) => {
        // this.logger.log('[PROJECT-PLAN-SERV] translateNotificationMsgs text', translation)
        this.project_deleted_notification = translation.TheProjectHasBeenDeleted;
      });
  }

  getUserToken() {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.TOKEN = user.token
        // this.logger.log('[PROJECT-PLAN-SERV] - User is signed in)
      } else {
        this.logger.log('[PROJECT-PLAN-SERV] - No user is signed in');
      }
    });
  }

  planUpdated(projectId: string) {
    this.logger.log('[PROJECT-PLAN-SERV] - planUpdated (called by payment success page)');

    // this.getProjectByIdAndPublish(projectId, 'planUpdated');
  }


  getProjectIdFroUrlAndIfExistGetProjectByIdAndPublish(calledBy) {
    console.log('[PROJECT-PLAN-SERV] - getProjectIdFroUrlAndIfExistGetProjectByIdAndPublish (called', calledBy);
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {

        const current_url = ev.url
        // console.log('[PROJECT-PLAN-SERV] - NavigationEnd current_url', current_url);
        const url_segments = current_url.split('/');
        console.log('[PROJECT-PLAN-SERV] - CURRENT URL SEGMENTS ', url_segments);
        const nav_project_id = url_segments[2];
        console.log('[PROJECT-PLAN-SERV] - nav_project_id ', nav_project_id);

        this.progetIdGetFromParams = nav_project_id
        // -----------------------------------------------------------------
        // this check is in auth.guard - auth.service - project-plan.service
        // -----------------------------------------------------------------
        // url_segments[1] !== 'install-template' &&
        // url_segments[1] !== 'install-template-np' &&
        if (
          nav_project_id &&
          nav_project_id !== 'email' &&
          url_segments[1] !== 'user' &&
          url_segments[1] !== 'handle-invitation' &&
          url_segments[1] !== 'signup-on-invitation' &&
          url_segments[1] !== 'resetpassword' &&
          url_segments[1] !== 'autologin' &&
          url_segments[1] !== 'get-chatbot' &&
          url_segments[1] !== 'activate-product' &&
          url_segments[1] !== 'create-project-itw' &&
          url_segments[1] !== 'success' &&
          current_url !== '/projects'
        ) {
          // this.getProjectByIdAndPublish(nav_project_id, calledBy)
          console.log('[PROJECT-PLAN-SERV] url_segments ',url_segments[1] ) 
          this.findCurrentProjectAmongAll(nav_project_id)
        }

        // nav_project_id IS UNDEFINED IN THE LOGIN PAGE - IN THE PROJECT LIST PAGE
        // IN THE PAGE IN WICH THE  nav_project_id IS UNDEFINED SET TO NULL THE VALUE PUBLISHED BY projectPlan
        if (nav_project_id === undefined) {
          this.projectPlan$.next(null);
        }
      }
    });
  }


  findCurrentProjectAmongAll(projectId: string) {
    console.log('[PROJECT-PLAN-SERV] - GET PROJECTS - projectId ', projectId)
    this.projectService.getProjects().subscribe((projects: any) => {
      console.log('[PROJECT-PLAN-SERV] - GET PROJECTS - projects ', projects)

      const current_prjct = projects.find(prj => prj.id_project.id === projectId);
      console.log('[PROJECT-PLAN-SERV] - FIND CURRENT PROJECT AMONG ALL - current_prjct ', current_prjct);
     
      if (current_prjct) {
        const projectPlanData: Project = {

          _id: current_prjct.id_project._id,
          name: current_prjct.id_project.name,
          createdAt: current_prjct.id_project.createdAt,
          profile_name: current_prjct.id_project.profile['name'],
          profile_agents: current_prjct.id_project.profile['agents'],
          trial_days: current_prjct.id_project.profile['trialDays'],
          trial_days_left: current_prjct.id_project.trialDaysLeft,
          trial_expired: current_prjct.id_project.trialExpired,
          subscription_is_active: current_prjct.id_project.isActiveSubscription,
          profile_type: current_prjct.id_project.profile['type'],
          subscription_start_date: current_prjct.id_project.profile['subStart'],
          subscription_end_date: current_prjct.id_project.profile['subEnd'],
          subscription_id: current_prjct.id_project.profile['subscriptionId'],
          subscription_creation_date: current_prjct.id_project.profile['subscription_creation_date'],
          extra3: current_prjct.id_project.profile['extra3'],
          extra4: current_prjct.id_project.profile['extra4'],
          user_role: current_prjct.role
        }


        console.log('[PROJECT-PLAN-SERV] - FIND CURRENT PROJECT AMONG ALL - projectPlanData ', projectPlanData) 

        this.projectPlan$.next(projectPlanData);
      } else {
        this.logger.error('[PROJECT-PLAN-SERV] - FIND CURRENT PROJECT AMONG ALL - ERROR - PROJECT NOT FOUND') 
      }

    }, error => {
      this.logger.error('[PROJECT-PLAN-SERV] - FIND CURRENT PROJECT AMONG ALL - ERROR ', error);

      if (error.status === 404) {
        this.router.navigate(['/projects']);
        this.notify.showNotificationChangeProject(this.project_deleted_notification, 2, 'report_problem');
        this.logger.log('[PROJECT-PLAN-SERV] - FIND CURRENT PROJECT AMONG ALL - hey i redirect to projects');
      }

      if (error.status === 401) {
        this.router.navigate(['/login']);
        this.logger.log('[PROJECT-PLAN-SERV] - FIND CURRENT PROJECT AMONG ALL - hey i redirect to login');
      }

      if (error.status === 403) {

        this.logger.log('[PROJECT-PLAN-SERV] - FIND CURRENT PROJECT AMONG ALL - hey i redirect to unauthorized_access progetIdGetFromParams', this.progetIdGetFromParams);
        this.logger.log('[PROJECT-PLAN-SERV] - FIND CURRENT PROJECT AMONG ALL - hey i redirect to unauthorized_access projectID', this.projectID);
        this.router.navigate([`project/${this.progetIdGetFromParams}/unauthorized_access`]);
      }
    }, () => {
      this.logger.log('[PROJECT-PLAN-SERV] - FIND CURRENT PROJECT AMONG ALL -  * complete ');

    })
  }

  getProjectByIdAndPublish(project_id: string, calledBy: string) {
    // console.log('[PROJECT-PLAN-SERV] - getProjectByIdAndPublish (called', calledBy );
    this.projectService.getProjectById(project_id).subscribe((project: any) => {
      this.logger.log('[PROJECT-PLAN-SERV] - GET PROJECT BY ID - project ', project, '(called', calledBy, ')');

      const projectPlanData: Project = {

        _id: project._id,
        name: project.name,
        createdAt: project.createdAt,
        profile_name: project.profile['name'],
        profile_agents: project.profile['agents'],
        trial_days: project.profile['trialDays'],
        trial_days_left: project.trialDaysLeft,
        trial_expired: project.trialExpired,
        subscription_is_active: project.isActiveSubscription,
        profile_type: project.profile['type'],
        subscription_start_date: project.profile['subStart'],
        subscription_end_date: project.profile['subEnd'],
        subscription_id: project.profile['subscriptionId'],
        subscription_creation_date: project.profile['subscription_creation_date']
      }

      this.projectPlan$.next(projectPlanData);

    }, error => {
      this.logger.error('[PROJECT-PLAN-SERV] - GET PROJECT BY ID - ERROR ', error);

      if (error.status === 404) {
        this.router.navigate(['/projects']);
        this.notify.showNotificationChangeProject(this.project_deleted_notification, 2, 'report_problem');
        this.logger.log('[PROJECT-PLAN-SERV] - hey i redirect to projects');
      }

      if (error.status === 401) {
        this.router.navigate(['/login']);
        this.logger.log('[PROJECT-PLAN-SERV] - hey i redirect to login');
      }

      if (error.status === 403) {

        this.logger.log('[PROJECT-PLAN-SERV] - hey i redirect to unauthorized_access progetIdGetFromParams', this.progetIdGetFromParams);
        this.logger.log('[PROJECT-PLAN-SERV] - hey i redirect to unauthorized_access projectID', this.projectID);
        this.router.navigate([`project/${this.progetIdGetFromParams}/unauthorized_access`]);
      }
    }, () => {
      this.logger.log('[PROJECT-PLAN-SERV] - getProjectByID * complete ');
    });
  }

  // ------------------------------------
  // USED BY PROJECT-PROFILE-GUARD
  // ------------------------------------
  public _getProjectById(prjct_id): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.logger.log('[PROJECT-PLAN-SERV] - _GET PROJECT BY ID WHITH PROJECT-ID PASSED FROM PROJECT-PROFILE-GUARD ', prjct_id);
      this.projectService.getProjectById(prjct_id).subscribe((project: any) => {
        resolve(project);
      })
    });
  }



}
