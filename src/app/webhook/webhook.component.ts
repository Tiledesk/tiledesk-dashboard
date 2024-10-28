import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from './../core/notify.service';
import { WebhookService } from './../services/webhook.service';
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { LoggerService } from '../services/logger/logger.service';
import { AuthService } from 'app/core/auth.service';
import { BrandService } from 'app/services/brand.service';
import { RoleService } from 'app/services/role.service';
@Component({
  selector: 'appdashboard-webhook',
  templateUrl: './webhook.component.html',
  styleUrls: ['./webhook.component.scss']
})
export class WebhookComponent implements OnInit {

  displayModal_AddEditWebhook = 'none';
  displayModal_SecretGeneratedModal = 'none';
  displayModal_ConfirmDeleteModal = 'none';
  modalMode: string;
  selectWebhookId = null;
  showSpinner = true;
  subscriptionsList: Array<any>;
  deleteErrorMsg: string;
  deleteSuccessMsg: string;
  showSecretError: string;
  sharedSecret: string;
  subscriptionIDToDelete: string;
  isChromeVerGreaterThan100: boolean;
  public hideHelpLink: boolean;
  IS_OPEN_SETTINGS_SIDEBAR: boolean;
  
  constructor(
    private webhookService: WebhookService,
    public translate: TranslateService,
    private notify: NotifyService,
    private location: Location,
    private logger: LoggerService,
    private auth: AuthService,
    public brandService: BrandService,
    public roleService: RoleService
  ) { 
    const brand = brandService.getBrand(); 
    this.hideHelpLink= brand['DOCS'];
    
  }

  ngOnInit() {
    // this.roleService.checkRoleForCurrentProject('webhook');
    this.getSubscriptions();
    this.translateNotificationMsgs();
    this.getBrowserVersion() ;
    this.listenSidebarIsOpened();
  }

  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[USER-EDIT-ADD] SETTNGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => { 
     this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    //  console.log("[WS-REQUESTS-LIST] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
   } 

  translateNotificationMsgs() {
    this.translate.get('Webhook.NotificationMsgs')
      .subscribe((translation: any) => {
        this.logger.log('[WEBHOOK]  translateNotificationMsgs text', translation)
        this.deleteErrorMsg = translation.DeleteSubscriptionError;
        this.deleteSuccessMsg = translation.DeleteSubscriptionSuccess;
        this.showSecretError = translation.ShowSecretError;
      });
  }

  getSubscriptions() {
    this.webhookService.getAllSubscriptions().subscribe((res) => {
      this.logger.log("[WEBHOOK] GET ALL SUBSCRIPTIONS RES: ", res);
      this.subscriptionsList = res;
      this.showSpinner = false;
    }, error => {
      this.logger.error('[WEBHOOK] GET ALL SUBSCRIPTIONS - ERROR', error);
    }, () => {
      this.logger.log('[WEBHOOK] GET ALL SUBSCRIPTIONS * COMPLETE *');
    });
  }

  deleteSubscription() {
    this.webhookService.deleteSubscription(this.subscriptionIDToDelete).subscribe((res) => {
      this.logger.log("[WEBHOOK] - DELETE SUBSCRIPTIONS RES: ", res); 
    }, (error) => {
      this.logger.error('[WEBHOOK] - DELETE SUBSCRIPTION - ERROR  ', error);
      this.notify.showWidgetStyleUpdateNotification(this.deleteErrorMsg, 4, 'report_problem');
    }, () => {
      this.logger.log('[WEBHOOK] - DELETE SUBSCRIPTION * COMPLETE *');
      this.notify.showWidgetStyleUpdateNotification(this.deleteSuccessMsg, 2, 'done');
      this.closeModal_ConfirmDeleteModal();
      this.subscriptionIDToDelete = "";
      this.getSubscriptions();
    })
  }

  presentWebhookModal_inAddMode() {
    const webhook_add_subscription_btn = <HTMLElement>document.querySelector('.webhook-add-subscription-btn');
    webhook_add_subscription_btn.blur();
    this.selectWebhookId = null;
    this.displayModal_AddEditWebhook = 'block';
    this.modalMode = 'add';
    this.logger.log('[WEBHOOK] - displayModal ', this.displayModal_AddEditWebhook, ' in Mode', this.modalMode);
  }

  presentWebhookModal_inEditMode(subscriptionID: string) {
    this.selectWebhookId = subscriptionID;
    this.displayModal_AddEditWebhook = 'block';
    this.modalMode = 'edit';
    this.logger.log('[WEBHOOK] - displayModal ', this.displayModal_AddEditWebhook, ' in Mode', this.modalMode, ' subscription-id', subscriptionID);
  }

  copySharedSecret() {
    const copyText = document.getElementById('sharedSecretInput') as HTMLInputElement;
    copyText.select();
    document.execCommand('copy');
  }

  closeModal_AddEditWebhook() {
    this.displayModal_AddEditWebhook = 'none';
  }

  showSecretModal(subscription) {
    this.logger.log("[WEBHOOK] SUBSCRIPTION: ", subscription)
    if (!subscription) {
      this.notify.showWidgetStyleUpdateNotification(this.showSecretError, 4, 'report_problem');
    } else {
      this.sharedSecret = subscription.secret;
      this.displayModal_SecretGeneratedModal = 'block';
    }
  }

  closeModal_JwtSecretGenerated() {
    this.displayModal_SecretGeneratedModal = 'none';
  }

  showModal_ConfirmDeleteSubscription(subscriptionID) {
    this.subscriptionIDToDelete = subscriptionID;
    this.displayModal_ConfirmDeleteModal = 'block';
  }

  closeModal_ConfirmDeleteModal() {
    this.displayModal_ConfirmDeleteModal = 'none';
  }

  goBack() {
    this.location.back();
  }


  onSaveSubscription() {
    this.getSubscriptions();
  }

  openWebhookDoc() {
    const url = 'https://developer.tiledesk.com/apis/webhooks'
    window.open(url, '_blank');
  }

}
