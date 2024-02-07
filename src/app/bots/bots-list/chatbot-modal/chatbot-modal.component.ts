import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BrandService } from 'app/services/brand.service';

@Component({
  selector: 'appdashboard-chatbot-modal',
  templateUrl: './chatbot-modal.component.html',
  styleUrls: ['./chatbot-modal.component.scss']
})
export class ChatbotModalComponent implements OnInit {
  public chatbotLimitReached: string;
  public callingPage: string;
  public id_project: string;
  salesEmail: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ChatbotModalComponent>,
    private translate: TranslateService,
    private router: Router,
    public brandService: BrandService,
  ) {
    console.log('[CHATBOT-MODAL] data ', data)
    if (data && data.projectProfile) {
      this.getTranslatedStringChatbotLimitReached(data.projectProfile)
    }
    if (data && data.callingPage) { 
      this.callingPage = data.callingPage
    } else {
      this.callingPage = null;
    }
    if (data && data.projectId) {
      this.id_project = data.projectId
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
        console.log('+ + + ChatbotLimitReached', text)
      });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onOkPresssed() {
    this.dialogRef.close();
    this.contacUsViaEmail()
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
