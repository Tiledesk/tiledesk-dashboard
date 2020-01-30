import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { TriggerService } from 'app/services/trigger.service';
import { Router } from '@angular/router';
import { Project } from 'app/models/project-model';
import { AuthService } from 'app/core/auth.service';
import { NotifyService } from 'app/core/notify.service';
import { Trigger } from 'app/models/trigger-model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'appdashboard-trigger',
  templateUrl: './trigger.component.html',
  styleUrls: ['./trigger.component.scss']
})
export class TriggerComponent implements OnInit {


  triggers: any;
  trigger: Trigger;
  triggerName: string;

  project: Project;
  id_project: string;

  showSpinner: boolean;

  subscription: Subscription;

  messageServerError: string;
  messageDeleteTriggerError: string;
  messageTriggerSuccessDelete: string;


  displayMODAL = 'none';

  constructor(  private auth: AuthService,
                private triggerService: TriggerService,
                private router: Router,
                private notify: NotifyService,
                private translate: TranslateService ) { }

  ngOnInit() {
    this.showSpinner = true;
    this.getCurrentProject();
    this.getAllTrigger();
    this.translateNotifyMsg();

  }


  ngOnDestroy() {
    console.log('!!! TRIGGER - !!!!! UN - SUBSCRIPTION TO REQUESTS-LIST-BS');
    this.subscription.unsubscribe();
  }


  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project;
      console.log('UsersComponent - getCurrentProject -> project', this.project)
      if (this.project) {
        this.id_project = project._id

      }
    });
  }

  goToEditTrigger(triggeriD) {
    console.log('EDIT TRIGGER')
    this.router.navigate(['project/' + this.id_project + '/trigger/' + triggeriD])
  }

  goToAddTrigger() {
    console.log('ADD TRIGGER')
    this.router.navigate(['project/' + this.id_project + '/trigger/add' ])
  }

  getAllTrigger() {

    this.subscription = this.triggerService.getAllTrigger().subscribe((res: any) => {
      console.log('TRIGGER', res);
      if (res) {
        this.triggers = res;
      }
    }, (error) => {
      this.notify.showNotification(this.messageServerError, 4, 'report_problem')
      this.showSpinner = false;
      // this.triggers = []
      console.log('»» !!! TRIGGER -  GET ALL REQUESTS  - ERROR ', error);
    }, () => {
      this.showSpinner = false;
      console.log('»» !!! TRIGGER -  GET ALL REQUESTS * COMPLETE *');

    });

  }

  translateNotifyMsg() {
    this.translate.get('Trigger.ServerError')
    .subscribe((text: string) => {

      this.messageServerError = text;
      // console.log('+ + + DeleteLeadSuccessNoticationMsg', text)
    });
    this.translate.get('Trigger.DeleteServerError')
    .subscribe((text: string) => {

      this.messageDeleteTriggerError = text;
      // console.log('+ + + DeleteLeadSuccessNoticationMsg', text)
    });
    this.translate.get('Trigger.DeleteTriggerSuccess')
    .subscribe((text: string) => {

      this.messageTriggerSuccessDelete = text;
      // console.log('+ + + DeleteLeadSuccessNoticationMsg', text)
    });
  }


  onDeleteTriggerModal(trigger: Trigger) {
    this.displayMODAL = 'block';
    console.log('triggerrrr', trigger)
    this.trigger = trigger;
    this.triggerName = this.trigger.name;

  }
  closeDeleteTriggerModal() {
    this.displayMODAL = 'none';
  }

  deleteTrigger() {
    this.displayMODAL = 'none';
    console.log('DELETE TRIGGER WITH ID:', this.trigger._id);

    this.triggerService.deleteTrigger(this.trigger._id).subscribe((res: any) => {
      console.log('TRIGGER DELETE', res);

    }, (error) => {
      this.notify.showNotification(this.messageDeleteTriggerError , 4, 'report_problem');
      console.log('»» !!! TRIGGER -  DELETE TRIGGER REQUESTS  - ERROR ', error);
    }, () => {
      this.notify.showNotification(this.messageTriggerSuccessDelete, 2, 'done');
      this.getAllTrigger();
      console.log('»» !!! TRIGGER -  DELETE TRIGGER REQUESTS * COMPLETE *');

    });
  }

}
