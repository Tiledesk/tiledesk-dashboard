import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'appdashboard-modal-chatbot-name',
  templateUrl: './modal-chatbot-name.component.html',
  styleUrls: ['./modal-chatbot-name.component.scss']
})
export class ModalChatbotNameComponent implements OnInit {
  chatbotName: string;
  chatbot: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalChatbotNameComponent>,
  ) {
    // console.log('[MODAL-CHATBOT-NAME] data ', data)
    if (data && data.chatbot) {
      this.chatbot = data.chatbot
    }
   }

  ngOnInit(): void {
  }

  onChangeChatbotName(event) {
    // console.log('[MODAL-CHATBOT-NAME] ON CHANGE CHATBOT NAME event', event)
    this.chatbot.name = event
  }

  onOkPresssed(chatbot){
    // console.log('[MODAL-CHATBOT-NAME] chatbot ', this.chatbot)
    this.dialogRef.close(this.chatbot);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
