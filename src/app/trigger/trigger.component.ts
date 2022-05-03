import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { TriggerService } from 'app/services/trigger.service';
import { Router } from '@angular/router';
import { Project } from 'app/models/project-model';
import { AuthService } from 'app/core/auth.service';
import { NotifyService } from 'app/core/notify.service';
import { Trigger } from 'app/models/trigger-model';
import { TranslateService } from '@ngx-translate/core';
import { URL_getting_started_with_triggers } from '../utils/util';
import { LoggerService } from '../services/logger/logger.service';

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
  has_selected_system: boolean;
  query: any;

  // input passed to docs-url-row
  trigger_docs_url = URL_getting_started_with_triggers;
  trigger_docs_title = 'trigger'; // is diplayed if customtext = false
  customtext = false;
  text_to_display = '' // is diplayed if customtext = true
  translateparam: any; 
  IS_OPEN_SETTINGS_SIDEBAR: boolean;
  isChromeVerGreaterThan100: boolean;
  constructor(
    private auth: AuthService,
    private triggerService: TriggerService,
    private router: Router,
    private notify: NotifyService,
    private translate: TranslateService,
    private logger: LoggerService
  ) { }

  ngOnInit() {
    this.translateparam = { helpdoc: this.trigger_docs_title };
    this.getBrowserVersion() 
    this.showSpinner = true;
    this.getCurrentProject();
    this.getAllTrigger();
    this.translateNotifyMsg();

    this.query = 'custom';
    this.has_selected_system = false;
    this.listenSidebarIsOpened();
  }


  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => { 
     this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    //  console.log("[WS-REQUESTS-LIST] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
   } 

  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[TRIGGER] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }


  ngOnDestroy() {
    this.logger.log('[TRIGGER] - GET ALL TRIGGER UNSUBSCRIPTION ');
    this.subscription.unsubscribe();
  }


  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project;
      this.logger.log('[TRIGGER] - getCurrentProject -> project', this.project)
      if (this.project) {
        this.id_project = project._id
        this.logger.log('[TRIGGER] - getCurrentProject -> project id', this.id_project)
      }
    });
  }

  goToEditTrigger(triggeriD) {
    this.logger.log('[TRIGGER] - GOTO EDIT TRIGGER')
    this.router.navigate(['project/' + this.id_project + '/trigger/' + triggeriD])
  }

  goToAddTrigger() {
    this.logger.log('[TRIGGER] - GOTO ADD TRIGGER')
    this.router.navigate(['project/' + this.id_project + '/trigger/add'])
  }

  getAllTrigger() {
    this.subscription = this.triggerService.getAllTrigger().subscribe((res: any) => {
      this.logger.log('[TRIGGER] - GET ALL TRIGGER - RES ', res);
      if (res) {
        this.triggers = res;

      }
    }, (error) => {
      this.logger.error('[TRIGGER] - GET ALL TRIGGER - ERROR ', error);

      this.notify.showNotification(this.messageServerError, 4, 'report_problem')
      this.showSpinner = false;

    }, () => {
      this.showSpinner = false;
      this.logger.log('[TRIGGER] - GET ALL TRIGGER * COMPLETE *');

    });

  }

  translateNotifyMsg() {
    this.translate.get('Trigger.ServerError')
      .subscribe((text: string) => {

        this.messageServerError = text;
        // this.logger.log('+ + + DeleteLeadSuccessNoticationMsg', text)
      });
    this.translate.get('Trigger.DeleteServerError')
      .subscribe((text: string) => {

        this.messageDeleteTriggerError = text;
        // this.logger.log('+ + + DeleteLeadSuccessNoticationMsg', text)
      });
    this.translate.get('Trigger.DeleteTriggerSuccess')
      .subscribe((text: string) => {

        this.messageTriggerSuccessDelete = text;
        // this.logger.log('+ + + DeleteLeadSuccessNoticationMsg', text)
      });
  }


  onDeleteTriggerModal(trigger: Trigger) {
    this.displayMODAL = 'block';
    this.logger.log('[TRIGGER] - onDeleteTriggerModal - TRIGGER', trigger)
    this.trigger = trigger;
    this.triggerName = this.trigger.name;

  }
  closeDeleteTriggerModal() {
    this.displayMODAL = 'none';
  }

  deleteTrigger() {
    this.displayMODAL = 'none';
    this.logger.log('[TRIGGER] - DELETE TRIGGER WITH ID:', this.trigger._id);

    this.triggerService.deleteTrigger(this.trigger._id).subscribe((res: any) => {
      this.logger.log('[TRIGGER] - DELETE TRIGGER -  RES ', res);

    }, (error) => {
      this.notify.showNotification(this.messageDeleteTriggerError, 4, 'report_problem');
      this.logger.error('[TRIGGER] - DELETE TRIGGER - ERROR ', error);
    }, () => {
      this.notify.showNotification(this.messageTriggerSuccessDelete, 2, 'done');
      this.getAllTrigger();
      this.logger.log('[TRIGGER] - DELETE TRIGGER * COMPLETE *');

    });
  }


  triggerTabSelected(tabselected) {
    if (tabselected === 'systemtrigger') {
      this.logger.log('[TRIGGER] - triggerTabSelected ', tabselected);

      this.has_selected_system = true
      this.query = 'internal'

    }

    if (tabselected === 'customtrigger') {

      this.logger.log('[TRIGGER] - triggerTabSelected ', tabselected);
      this.has_selected_system = false;
      this.query = 'custom'
    }

  }

  goToTriggerDocs() {
    const url = this.trigger_docs_url;
    window.open(url, '_blank');
  }

}
