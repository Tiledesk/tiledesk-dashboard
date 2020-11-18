import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from './../core/notify.service';
import { WebhookService } from './../services/webhook.service';
import { Component, OnInit } from '@angular/core';

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

  constructor(
    private webhookService: WebhookService,
    public translate: TranslateService,
    private notify: NotifyService
  ) { }

  ngOnInit() {
    this.getSubscriptions();
    this.translateNotificationMsgs();
  }

  translateNotificationMsgs() {
    this.translate.get('Webhook.NotificationMsgs')
      .subscribe((translation: any) => {
        console.log('WEBHOOK  translateNotificationMsgs text', translation)
        this.deleteErrorMsg = translation.DeleteSubscriptionError;
        this.deleteSuccessMsg = translation.DeleteSubscriptionSuccess;
        this.showSecretError = translation.ShowSecretError;
      });
  }

  getSubscriptions() {
    this.webhookService.getAllSubscriptions().subscribe((res) => {
      console.log("ALL SUBSCRIPTIONS RESPONSE: ", res);
      this.subscriptionsList = res;
      this.showSpinner = false;
    })
  }

  deleteSubscription() {
    this.webhookService.deleteSubscription(this.subscriptionIDToDelete).subscribe((res) => {
      console.log("DELETE SUBSCRIPTIONS RESPONSE: ", res); 
    }, (error) => {
      console.log('WEBHOOK.COMP - DELETE SUBSCRIPTION - ERROR  ', error);
      this.notify.showWidgetStyleUpdateNotification(this.deleteErrorMsg, 4, 'report_problem');
    }, () => {
      console.log('WEBHOOK.COMP - DELETE SUBSCRIPTION * COMPLETE *');
      this.notify.showWidgetStyleUpdateNotification(this.deleteSuccessMsg, 2, 'done');
      this.closeModal_ConfirmDeleteModal();
      this.subscriptionIDToDelete = "";
      this.getSubscriptions();
    })
  }

  presentWebhookModal_inAddMode() {
    this.selectWebhookId = null;
    this.displayModal_AddEditWebhook = 'block';
    this.modalMode = 'add';
    console.log('WEBHOOK.COMP - displayModal ', this.displayModal_AddEditWebhook, ' in Mode', this.modalMode);
  }

  presentWebhookModal_inEditMode(subscriptionID: string) {
    this.selectWebhookId = subscriptionID;
    this.displayModal_AddEditWebhook = 'block';
    this.modalMode = 'edit';
    console.log('CANNED-RES.COMP - displayModal ', this.displayModal_AddEditWebhook, ' in Mode', this.modalMode, ' subscription-id', subscriptionID);
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
    console.log("SUBSCRIPTION RITORNATA: ", subscription)
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

  onSaveSubscription() {
    this.getSubscriptions();
  }

}
