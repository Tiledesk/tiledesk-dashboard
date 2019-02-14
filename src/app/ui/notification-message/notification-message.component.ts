import { Component, ViewEncapsulation, OnInit } from '@angular/core';

import { NotifyService } from '../../core/notify.service';
import { AuthService } from '../../core/auth.service';
import { ProjectService } from '../../services/project.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';


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

  CHAT_BASE_URL = environment.chat.CHAT_BASE_URL;
  showSpinnerInModal = true;
  constructor(
    public notify: NotifyService,
    public auth: AuthService,
    public projectService: ProjectService,
    private router: Router
  ) { }

  ngOnInit() {
    this.getCurrentProject()
    this.getProjectById();
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
        this.projectService.getProjectById(this.projectId)
          .subscribe((project: any) => {


            if (project) {
              console.log('Notification-Message-Component - GET PROJECT BY ID : ', project);

              if (project.gettingStarted) {
                this.gettingStartedChecklist = project.gettingStarted;
                console.log('Notification-Message-Component - GET PROJECT Getting Started Checklist : ', this.gettingStartedChecklist);
              }
            }
          }, (error) => {
            this.showSpinnerInModal = false;
            console.log('GET PROJECT BY ID - ERROR ', error);
          }, () => {
            this.showSpinnerInModal = false;
            console.log('GET PROJECT BY ID * COMPLETE *');
          });
      }
    })
  }

  hasClickedChecklist(event) {
    console.log('Notification-Message-Component - event : ', event);
    console.log('Notification-Message-Component - target name : ', event.target.name);

    if (event.target.name === 'openChat') {
      // this.openChat()
      this.notify.onCloseCheckLIstModal();

      this.updateGettingStarted('openChat');
    } else if (event.target.name === 'openWidget') {

      // this.router.navigate(['project/' + this.projectId + '/widget']);
      this.notify.onCloseCheckLIstModal();

      // const updatedGettingStarted = this.gettingStartedChecklist[1].done = true;

      this.updateGettingStarted('openWidget')


    } else if (event.target.name === 'openUserProfile') {

      // this.router.navigate(['project/' + this.projectId + '/user-profile']);

      this.notify.onCloseCheckLIstModal();
      // const updatedGettingStarted = this.gettingStartedChecklist[2].done = true;
      this.updateGettingStarted('openUserProfile')
    }
  }

  updateGettingStarted(selectesTask) {
    // const updatedGettingStarted = [
    //   { 'task': 'openChat', 'taskDesc': 'openChatDesc', 'done': false },
    //   { 'task': 'openWidget', 'taskDesc': 'openWidgetDesc', 'done': false },
    //   { 'task': 'openUserProfile', 'taskDesc': 'openUserProfileDesc', 'done': false }
    // ]


    const objIndex = this.gettingStartedChecklist.findIndex((obj => obj.task === selectesTask));
    // Log object to Console.
    console.log('666 Before update: ', this.gettingStartedChecklist[objIndex])
    console.log('666 updatedGettingStarted ', this.gettingStartedChecklist);
    // Update object's name property.
    this.gettingStartedChecklist[objIndex].done = true;

    // Log object to console again.
    console.log('666 After update: ', this.gettingStartedChecklist[objIndex]),

      console.log('666 After update 2: ', this.gettingStartedChecklist)

    this.projectService.updateGettingStartedProject(this.gettingStartedChecklist)
      .subscribe((res) => {
        console.log('GETTING-STARTED UPDATED: ', res.gettingStarted);
      },
        (error) => {
          console.log('GETTING-STARTED UPDATED - ERROR ', error);
        },
        () => {
          console.log('GETTING-STARTED UPDATED * COMPLETE *');
        });
  }

  openChat() {
    localStorage.setItem('chatOpened', 'true');
    const url = this.CHAT_BASE_URL;
    window.open(url, '_blank');

    this.notify.publishHasClickedChat(true);
  }



}
