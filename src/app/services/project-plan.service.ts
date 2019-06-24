import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AuthService } from '../core/auth.service';
import { ProjectService } from '../services/project.service';
import { threadId } from 'worker_threads';

@Injectable()

export class ProjectPlanService {

  public projectPlan: BehaviorSubject<String> = new BehaviorSubject<String>(null);

  projectID: string;

  constructor(
    private router: Router,
    private auth: AuthService,
    private projectService: ProjectService
  ) {

    this.getCurrentProject();
    this.ckeckProjrctPlan();


  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.projectID = project._id;
        console.log('ProjectPlanService subscribe to project_bs - projectID', this.projectID)
      }

    });
  }

  ckeckProjrctPlan() {

    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {

        console.log('ProjectPlanService - NavigationEnd');


        this.getProjectByID()

      }
      // this.projectPlan.next('»»»»»»»»»   change of route »»»»»»»»»');


    });
  }

  getProjectByID() {

    this.projectService.getProjectById(this.projectID).subscribe((project: any) => {
      console.log('ProjectPlanService - getProjectByID * project ', project);
    }, error => {
      console.log('ProjectPlanService - getProjectByID * error ', error);
    }, () => {
      console.log('ProjectPlanService - getProjectByID * complete ');
    });
  }



}
