import { Component, ViewEncapsulation, OnInit } from '@angular/core';

import { NotifyService } from '../../core/notify.service';
import { AuthService } from '../../core/auth.service';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'notification-message',
  templateUrl: './notification-message.component.html',
  styleUrls: ['./notification-message.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NotificationMessageComponent implements OnInit {
  displayExpiredSessionModal: string;
  projectId: string;
  gettingStartedChecklist: any;

  constructor(
    public notify: NotifyService,
    public auth: AuthService,
    public projectService: ProjectService
  ) { }

  ngOnInit() {
    // this.getCurrentProject()
    // this.getProjectById();
  }

  onOkExpiredSessionModal() {
    this.notify.onOkExpiredSessionModal();
    this.auth.signOut();
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      // console.log('00 -> Notification Message Component project from AUTH service subscription  ', project)

      if (project) {
        this.projectId = project._id
      }
    });
  }


  getProjectById() {
    this.notify.hasOpenChecklistModal.subscribe((hasOpen: boolean) => {
      console.log('Notification-Message-Component - THE checklist modal has been opened ', hasOpen);

      if (hasOpen === true) {
        this.projectService.getProjectById(this.projectId).subscribe((project: any) => {


          if (project) {
            console.log('Notification-Message-Component - GET PROJECT BY ID : ', project);

            if (project.gettingStarted) {
              this.gettingStartedChecklist = project.gettingStarted;
              console.log('Notification-Message-Component - GET PROJECT Getting Started Checklist : ', this.gettingStartedChecklist );
            }
          }
        });
      }
    })
  }

  isAnswerProvided($event, check) {
    console.log('Notification-Message-Component - event : ', $event);
    console.log('Notification-Message-Component - check : ', check);
    console.log('Notification-Message-Component - target name : ', $event.target.name);
  }



}
