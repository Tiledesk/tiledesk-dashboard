import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BotLocalDbService } from 'app/services/bot-local-db.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'appdashboard-home-create-chatbot-modal',
  templateUrl: './create-chatbot-modal.component.html',
  styleUrls: ['./create-chatbot-modal.component.scss']
})
export class CreateChatbotModalComponent implements OnInit {
  public chatbotName: string;
  public botSubType: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CreateChatbotModalComponent>,
     private translate: TranslateService,
    private logger: LoggerService,
  ) { 
    console.log('Home create chatbot ', data)
    if (data && data.subtype) {
      this.botSubType = data.subtype
    } 
  } 

  ngOnInit(): void {
  }

  onOkPresssed(chatbotName ){
    this.dialogRef.close({'chatbotName': chatbotName , 'subType': this.botSubType});
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


}
