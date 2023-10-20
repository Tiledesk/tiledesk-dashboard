import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ChatbotModalComponent } from 'app/bots/bots-list/chatbot-modal/chatbot-modal.component';

@Component({
  selector: 'appdashboard-kb-modal',
  templateUrl: './kb-modal.component.html',
  styleUrls: ['./kb-modal.component.scss']
})
export class KbModalComponent implements OnInit {
  public KBLimitReached: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ChatbotModalComponent>,
    private translate: TranslateService,
  ) {
    console.log('[CHATBOT-MODAL] data ', data)
    if (data && data.projectProfile) {
      this.getTranslatedStringKBLimitReached(data.projectProfile)
    }
   }

  ngOnInit(): void {
  }

  getTranslatedStringKBLimitReached(projectProfile) {
    this.translate.get('KbPage.KBLimitReached', { plan_name: projectProfile })
      .subscribe((text: string) => {

        this.KBLimitReached = text;
        console.log('+ + + KBLimitReached', text)
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
