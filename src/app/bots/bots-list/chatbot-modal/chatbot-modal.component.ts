import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BrandService } from 'app/services/brand.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'appdashboard-chatbot-modal',
  templateUrl: './chatbot-modal.component.html',
  styleUrls: ['./chatbot-modal.component.scss']
})
export class ChatbotModalComponent implements OnInit {
  public chatbotLimitReached: string;
  public callingPage: string;
  public id_project: string;
  public prjctProfileType : string;
  public subscriptionIsActive : boolean;
  public trialExpired: boolean;
  public salesEmail: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ChatbotModalComponent>,
    private translate: TranslateService,
    private router: Router,
    public brandService: BrandService,
    private logger: LoggerService
  ) {
    this.logger.log('[CHATBOT-MODAL] data ', data)
    if (data && data.projectProfile && data.chatBotLimit != 0) {
      this.logger.log('[CHATBOT-MODAL] projectProfile ', data.projectProfile , ' USECASE chatBotLimit ', data.chatBotLimit)
      this.getTranslatedStringChatbotLimitReached(data.projectProfile)
    } else  if (data && data.projectProfile && data.chatBotLimit == 0) {
      this.logger.log('[CHATBOT-MODAL] projectProfile ', data.projectProfile , ' USECASE chatBotLimit ', data.chatBotLimit)
      this.getTranslatedStringChatbotAreNotAvailableInYourCurrentPlan()
    }
    if (data && data.callingPage) { 
      this.callingPage = data.callingPage
    } else {
      this.callingPage = null;
    }
    if (data && data.projectId) {
      this.id_project = data.projectId;
      this.logger.log('[CHATBOT-MODAL] id_project ', this.id_project)
    }

    if (data && data.prjctProfileType) {
      this.prjctProfileType = data.prjctProfileType;
      this.logger.log('[CHATBOT-MODAL] prjctProfileType ', this.prjctProfileType)
    }

    if (data && data.subscriptionIsActive) {
      this.subscriptionIsActive = data.subscriptionIsActive;
      this.logger.log('[CHATBOT-MODAL] subscriptionIsActive ', this.subscriptionIsActive)
    }

    if (data && data.trialExpired) {
      this.trialExpired = data.trialExpired;
      this.logger.log('[CHATBOT-MODAL] trialExpired ', this.trialExpired)
    }

    if (data && data.chatBotLimit) { 
      this.logger.log('[CHATBOT-MODAL] chatBotLimit ', data.chatBotLimit)
    }
    
 

    const brand = brandService.getBrand();
    this.salesEmail = brand['CONTACT_SALES_EMAIL'];
   
  }

  ngOnInit(): void {
  }

  getTranslatedStringChatbotLimitReached(projectProfile) {
    this.translate.get('Pricing.ChatbotLimitReached', { plan_name: projectProfile })
      .subscribe((text: string) => {

        this.chatbotLimitReached = text;
        this.logger.log('+ + + ChatbotLimitReached', text)
      });
  }

  getTranslatedStringChatbotAreNotAvailableInYourCurrentPlan() {
    this.translate.get('Pricing.ChatbotsNotAvailableWithCurrentPlan')
      .subscribe((text: string) => {

        this.chatbotLimitReached = text;
        this.logger.log('+ + + ChatbotLimitReached', text)
      });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onOkPresssed() {
    this.dialogRef.close();
    this.contacUsViaEmail()
  }

  onUpgradePlan() {
    this.dialogRef.close();
    this.router.navigate(['project/' + this.id_project + '/pricing']);
  }

  onGoToHomePresssed () {
    this.dialogRef.close();
    this.router.navigate([`/project/${this.id_project}/home`]);
  }

  contacUsViaEmail() {
    this.dialogRef.close();
    window.open(`mailto:${this.salesEmail}?subject=Upgrade plan`);
  }

}
