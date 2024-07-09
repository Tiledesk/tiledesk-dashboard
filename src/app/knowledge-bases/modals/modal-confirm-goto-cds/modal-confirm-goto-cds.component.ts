import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from 'app/services/app-config.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'appdashboard-modal-confirm-goto-cds',
  templateUrl: './modal-confirm-goto-cds.component.html',
  styleUrls: ['./modal-confirm-goto-cds.component.scss']
})
export class ModalConfirmGotoCdsComponent implements OnInit {
  chatbot: any;
  chatbotName: string;
  panelOpenState = false;
  WIDGET_URL: string;
  projectId: string;
  has_copied = false;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalConfirmGotoCdsComponent>,
    private logger: LoggerService,
    public appConfigService: AppConfigService,
    private auth: AuthService,
  ) { 
    if (data && data.chatbot)  {
      this.chatbot = data.chatbot
      console.log('[MODAL-CONFIRM-GOTO-CDS] data > chatbot',  this.chatbot) 

      this.chatbotName = this.chatbot.name
      console.log('[MODAL-CONFIRM-GOTO-CDS] data > chatbotName',  this.chatbotName) 
    } 
  }

  ngOnInit(): void {
    this.getCurrentProject();
    this.getWidgetUrl()
  }

  getCurrentProject() {
    this.auth.project_bs
      .subscribe((project) => {
        if (project) {
          this.projectId = project._id;
        }
        this.logger.log('[MODAL-HOOK-BOT] projectId  ', this.projectId);
      });
  }

  getWidgetUrl() {
    this.WIDGET_URL = this.appConfigService.getConfig().WIDGET_BASE_URL + 'launch.js';
    this.logger.log('[MODAL-HOOK-BOT] AppConfigService getAppConfig WIDGET_URL ', this.WIDGET_URL)
  }


  copyToClipboard() {
    document.querySelector('textarea').select();
    document.execCommand('copy');

    this.has_copied = true;
    setTimeout(() => {
      this.has_copied = false;
    }, 2000);
  }


  onOkPresssed( ){
    this.dialogRef.close({chatbot: this.chatbot});
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
