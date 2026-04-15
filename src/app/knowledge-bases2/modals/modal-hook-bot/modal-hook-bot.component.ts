import { Component, Inject, NgZone, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from 'app/services/app-config.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'appdashboard-modal-hook-bot',
  templateUrl: './modal-hook-bot.component.html',
  styleUrls: ['./modal-hook-bot.component.scss']
})
export class ModalHookBotComponent implements OnInit {
  depts_without_bot_array: Array<any> = [];
  chatbot: any;
  selectedDeptId: string;
  chatbotId: string;
  chatbotName: string;
  panelOpenState = false;
  WIDGET_URL: string;
  projectId: string;
  has_copied = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalHookBotComponent>,
    private translate: TranslateService,
    private logger: LoggerService,
    public appConfigService: AppConfigService,
    private auth: AuthService,
    private ngZone: NgZone
  ) { 
    // console.log('MODAL-HOOK-BOT data ', data) 

    if (data && data.deptsWithoutBotArray)  {
      this.depts_without_bot_array = data.deptsWithoutBotArray
      // console.log('[MODAL-HOOK-BOT] data > depts_without_bot_array',  this.depts_without_bot_array) 
    } 
    if (data && data.chatbot)  {
      this.chatbot = data.chatbot
      // console.log('[MODAL-HOOK-BOT] data > chatbot',  this.chatbot) 

      this.chatbotName = this.chatbot.name
      // console.log('[MODAL-HOOK-BOT] data > chatbotName',  this.chatbotName) 
    } 
  }

  onSelectDeptId() {
    // console.log('[MODAL-HOOK-BOT] onSelectDeptId > selectedDeptId',  this.selectedDeptId) 
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

  onActivateBotPresssed(): void{
    // console.log('[MODAL-HOOK-BOT] HERE YES!!!!! onActivateBotPresssed chatbot ', this.chatbot)
    // if (this.selectedDeptId) {
        // setTimeout(() => {
          // this.ngZone.run(() => {
            // {deptId: this.selectedDeptId, botId: this.chatbot._id}
      this.dialogRef.close( {deptId: this.selectedDeptId, botId: this.chatbot._id});
    // });
    // this.onNoClick()
    // }, 100);
    // }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
