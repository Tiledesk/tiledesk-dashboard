import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'appdashboard-chatbot-modal',
  templateUrl: './chatbot-modal.component.html',
  styleUrls: ['./chatbot-modal.component.scss']
})
export class ChatbotModalComponent implements OnInit {
  public chatbotLimitReached: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ChatbotModalComponent>,
    private translate: TranslateService,
  ) {
    console.log('[CHATBOT-MODAL] data ', data)
    if (data && data.projectProfile) {
      this.getTranslatedStringChatbotLimitReached(data.projectProfile)
    }
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

  contacUsViaEmail() {
    window.open('mailto:sales@tiledesk.com?subject=Upgrade Tiledesk plan');
  }

}
