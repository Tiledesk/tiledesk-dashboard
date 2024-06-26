import { NotifyService } from 'app/core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { WebhookService } from './../../services/webhook.service';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { LoggerService } from './../../services/logger/logger.service';
@Component({
  selector: 'appdashboard-webhook-add-edit',
  templateUrl: './webhook-add-edit.component.html',
  styleUrls: ['./webhook-add-edit.component.scss']
})
export class WebhookAddEditComponent implements OnInit {

  displayModal_AddEditWebhook = 'block';
  
  @Input() modalMode: string;
  @Input() selectWebhookId: string; 

  @Output() closeModal = new EventEmitter();
  @Output() hasSavedSubscription = new EventEmitter();
  @Output() createdWebhook = new EventEmitter();

  webhookTarget: string;
  subscriptionEvent: string;
  targetIsEmpty: boolean = false;
  eventIsEmpty: boolean = false;
  webhook_modal_height: any
  showSkeleton = false;
  createSuccessMsg: string;
  createErrorMsg: string;
  updateSuccessMsg: string;
  updateErrorMsg: string;
  response: any;


  webHookEvents = [
    { id: "request.create", name:"Request Create"},
    { id: "request.update", name:"Request Update"},
    { id: "request.close", name:"Request Close"},
    { id: "message.create", name:"Message Create"},
    { id: "message.create.request.channel.telegram", name:"Message Create (only for Telegram channel)"},
    { id: "message.create.request.channel.messenger", name:"Message Create (only for Facebook Messenger channel)"},
    { id: "message.create.request.channel.whatsapp", name:"Message Create (only for WhatsApp channel)"},
    { id: "message.create.request.channel.voice", name:"Message Create (only for Voice channel)"},
    { id: "lead.create", name:"Lead Create"},
    { id: "faq.create", name:"Faq Create"},
    { id: "faq.update", name:"Faq Update"},
    { id: "faq.delete", name:"Faq Delete"},
    { id: "faqbot.create", name:"Faqbot Create"},
    { id: "faqbot.update", name:"Faqbot Update"},
    { id: "faqbot.delete", name:"Faqbot Delete"},
    { id: "department.create", name:"Department Create"},
    { id: "department.update", name:"Department Update"},
    { id: "department.delete", name:"Department Delete"},
    { id: "project_user.invite", name:"Project User Invite"},
    { id: "project_user.update", name:"Project User Update"},
    { id: "project_user.delete", name:"Project User Deletee"},
    { id: "group.create", name:"Group Create"},
    { id: "group.update", name:"Group Update"},
    { id: "group.delete", name:"Group Delete"},
    { id: "operator.select", name:"Operator Selection"},
    { id: "event.emit", name:"Event Emit"},
  ]

  constructor(
    private webhookService: WebhookService,
    public translate: TranslateService,
    private notify: NotifyService,
    private logger: LoggerService
  ) { }

  ngOnInit() {
    this.logger.log('[WEBHOOK][WEBHOOK-ADD-EDIT] - modalMode ', this.modalMode);
    this.logger.log('[WEBHOOK][WEBHOOK-ADD-EDIT] - selectWebhookId ', this.selectWebhookId);

    // MI SERVE?
    // this.auth.checkRoleForCurrentProject();

    if (this.modalMode === 'edit') {
      this.showSkeleton = true;
      this.getWebhookSubscriptionById();
    
    }
    this.translateNotificationMsgs();
  }

  createSubscription() {
    this.logger.log('[WEBHOOK][WEBHOOK-ADD-EDIT] - CREATE SUBSCRIPTION - TARGET ', this.webhookTarget);
    this.logger.log('[WEBHOOK][WEBHOOK-ADD-EDIT] - CREATE SUBSCRIPTION - EVENT ', this.subscriptionEvent);

    if (!this.webhookTarget) {
      this.targetIsEmpty = true;
    } else if (!this.subscriptionEvent) {
      this.eventIsEmpty = true;
    } else {
      this.webhookService.createNewSubscription(this.webhookTarget, this.subscriptionEvent).subscribe((res) => {
        this.logger.log("[WEBHOOK][WEBHOOK-ADD-EDIT] - CREATE SUBSCRIPTION - RES: ", res);
        this.response = res;
      }, (error) => {
        this.logger.error('[WEBHOOK][WEBHOOK-ADD-EDIT]- CREATE SUBSCRIPTION - ERR ', error);
        this.notify.showWidgetStyleUpdateNotification(this.createErrorMsg, 4, 'report_problem');
      }, () => {
        this.logger.log('[WEBHOOK][WEBHOOK-ADD-EDIT] - CREATE SUBSCRIPTION - * COMPLETE *');
        this.notify.showWidgetStyleUpdateNotification(this.createSuccessMsg, 2, 'done');
        this.hasSavedSubscription.emit();
        this.createdWebhook.emit(this.response);
        this.closeModal_AddEditWebhook();
      })
    }
  }

  getWebhookSubscriptionById() {
    this.webhookService.getWHSubscritionById(this.selectWebhookId).subscribe((response: any) => {
      this.logger.log('[WEBHOOK][WEBHOOK-ADD-EDIT] - GET SUBSCRIPTION BY ID - RES ', response);
      
      if(response) {
        this.webhookTarget = response.target,
        this.subscriptionEvent = response.event
      }
    }, (error) => {
      this.logger.error('[WEBHOOK][WEBHOOK-ADD-EDIT] - GET SUBSCRIPTION BY ID - ERROR  ', error);
      this.showSkeleton = false;
    }, () => {
      this.logger.log('[WEBHOOK][WEBHOOK-ADD-EDIT] - GET SUBSCRIPTION BY ID * COMPLETE *');
      this.showSkeleton = false;
    })
  }

  updateSubscription() {
    if (!this.webhookTarget) {
      this.targetIsEmpty = true;
    } else if (!this.subscriptionEvent) {
      this.eventIsEmpty = true;
    } else {
      this.webhookService.updateSubscription(this.selectWebhookId, this.webhookTarget, this.subscriptionEvent).subscribe((response) => {
        this.logger.log("[WEBHOOK][WEBHOOK-ADD-EDIT] - UPDATE SUBSCRIPTION - RES: ", response);
      }, (error) => {
        this.logger.error('[WEBHOOK][WEBHOOK-ADD-EDIT] - UPDATE SUBSCRIPTION - ERR ', error);
        this.notify.showWidgetStyleUpdateNotification(this.updateErrorMsg, 4, 'report_problem');
      }, () => {
        this.logger.log('[WEBHOOK][WEBHOOK-ADD-EDIT] - UPDATE SUBSCRIPTION - * COMPLETE *');
        this.notify.showWidgetStyleUpdateNotification(this.updateSuccessMsg, 2, 'done');
        this.hasSavedSubscription.emit();
        this.closeModal_AddEditWebhook();
      })
    }
  }

  translateNotificationMsgs() {
    this.translate.get('Webhook.NotificationMsgs')
      .subscribe((translation: any) => {
        // this.logger.log('[WEBHOOK][WEBHOOK-ADD-EDIT]  translateNotificationMsgs text', translation)
        this.createSuccessMsg = translation.CreateSubscriptionSuccess;
        this.createErrorMsg = translation.CreateSubscriptionError;
        this.updateSuccessMsg = translation.UpdateSubscriptionSuccess;
        this.updateErrorMsg = translation.UpdateSubscriptionError;
      });
  }

  closeModal_AddEditWebhook() {
    this.closeModal.emit();
  }

}
