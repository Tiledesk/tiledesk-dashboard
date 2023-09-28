import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BotLocalDbService } from 'app/services/bot-local-db.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'appdashboard-home-create-chatbot-modal',
  templateUrl: './home-create-chatbot-modal.component.html',
  styleUrls: ['./home-create-chatbot-modal.component.scss']
})
export class HomeCreateChatbotModalComponent implements OnInit {
  public chatbotName: string
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<HomeCreateChatbotModalComponent>,
    
    private logger: LoggerService,
  ) { }

  ngOnInit(): void {
  }

  onOkPresssed(chatbotName ){
    this.dialogRef.close({'chatbotName': chatbotName });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


}
