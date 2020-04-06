// tslint:disable:max-line-length
import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AuthService } from '../core/auth.service';
import { ProjectService } from '../services/project.service';

import { Project } from '../models/project-model';
import { Observable } from 'rxjs/Observable';
import { Http, Headers, RequestOptions } from '@angular/http';
import { NotifyService } from '../core/notify.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable()

export class ProjectPlanService {
  http: Http;
  public projectPlan$: BehaviorSubject<Project> = new BehaviorSubject<Project>(null);

  projectID: string;
  TOKEN: string
  project_deleted_notification: string

  constructor(
    http: Http,
    private router: Router,
    private auth: AuthService,
    private projectService: ProjectService,
    private notify: NotifyService,
    private translate: TranslateService
  ) {
    this.http = http;
    // this.getCurrentProject();
    this.ckeckProjectPlan();
    this.getUserToken();
    this.translateNotificationMsgs();
  }

  translateNotificationMsgs() {
    this.translate.get('ProjectEditPage.NotificationMsgs')
      .subscribe((translation: any) => {
        // console.log('PROJECT-PLAN-SERVICE  translateNotificationMsgs text', translation)

        this.project_deleted_notification = translation.TheProjectHasBeenDeleted;
       
      });
  }

  getUserToken() {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.TOKEN = user.token
        console.log('ProjectPlanService TOKEN ', this.TOKEN)
      } else {
        console.log('No user is signed in');
      }
    });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.projectID = project._id;
        console.log('ProjectPlanService subscribe to project_bs - projectID', this.projectID)
      }

    });
  }

  ckeckProjectPlan() {
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {


        const current_url = ev.url
        console.log('ProjectPlanService - NavigationEnd current_url', current_url);
        const url_segments = current_url.split('/');
        console.log('ProjectPlanService - CURRENT URL SEGMENTS ', url_segments);
        const nav_project_id = url_segments[2];
        console.log('ProjectPlanService - nav_project_id ', nav_project_id);

        if (nav_project_id && nav_project_id !== 'email' && url_segments[1] !== 'user' && url_segments[1] !== 'handle-invitation' && url_segments[1] !== 'signup-on-invitation') {
          this.getProjectByID(nav_project_id)
        }

        // nav_project_id IS UNDEFINED IN THE LOGIN PAGE - IN THE PROJECT LIST PAGE
        // IN THE PAGE IN WICH THE  nav_project_id IS UNDEFINED SET TO NULL THE VALUE PUBLISHED BY projectPlan
        if (nav_project_id === undefined) {

          this.projectPlan$.next(null);
        }

      }
      // this.projectPlan.next('»»»»»»»»»   change of route »»»»»»»»»');


    });
  }

  getProjectByID(nav_project_id: string) {

    this.projectService.getProjectById(nav_project_id).subscribe((project: any) => {
      console.log('»> »> PROJECT-PROFILE GUARD (NEW WF IN ProjectPlanService) - getProjectByID * project ', project);

      const projectPlanData: Project = {

        _id: project._id,
        name: project.name,
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
      console.log('ProjectPlanService - getProjectByID * error ', error);

      if (error.status === 404) {
        this.router.navigate(['/projects']);
        this.notify.showNotificationChangeProject(this.project_deleted_notification, 2, 'report_problem');
      }

      if (error.status === 401) {
        this.router.navigate(['/login']);
      }


    }, () => {
      console.log('ProjectPlanService - getProjectByID * complete ');
    });
  }


  // USED BY ProjectProfileGuard
  public _getProjectById(prjct_id): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      console.log('»> »> PROJECT-PROFILE GUARD (NEW WF IN ProjectPlanService) - getProjectByID * prjct_id (passed from ProjectProfileGuard) ', prjct_id);
      this.projectService.getProjectById(prjct_id).subscribe((project: any) => {

        resolve(project);
      })
    });
  }



}
