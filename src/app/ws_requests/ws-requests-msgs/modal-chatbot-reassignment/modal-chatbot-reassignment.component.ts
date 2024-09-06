import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FaqService } from 'app/services/faq.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'appdashboard-modal-chatbot-reassignment',
  templateUrl: './modal-chatbot-reassignment.component.html',
  styleUrls: ['./modal-chatbot-reassignment.component.scss']
})
export class ModalChatbotReassignmentComponent implements OnInit {
  intent_display_name_array: any;
  intent_display_name: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalChatbotReassignmentComponent>,
    private logger: LoggerService,
    private faqService: FaqService,
  ) {
    this.logger.log('[MODAL-CHATBOT-REASSIGNMENT] data ', data)

    if (data && data.chatbot_id) {

      this.getAllFaqByFaqKbId(data.chatbot_id)
    }

  }


  getAllFaqByFaqKbId(chatbot_id) {
    this.faqService.getAllFaqByFaqKbId(chatbot_id).subscribe((faqs: any) => {
      this.logger.log('[MODAL-CHATBOT-REASSIGNMENT] - GET ALL FAQ BY BOT ID', faqs);
      this.intent_display_name_array = []

      if (faqs) {
        faqs.forEach((faq, index) => {

          this.intent_display_name_array.push({id:index,  name: faq.intent_display_name})

        });
        this.logger.log('[MODAL-CHATBOT-REASSIGNMENT] - intent_display_name_array', this.intent_display_name_array);
        this.intent_display_name_array = this.intent_display_name_array.slice(0)
      }
    }, (error) => {
      this.logger.error('[MODAL-CHATBOT-REASSIGNMENT] >> FAQs GOT BY FAQ-KB ID - ERR ', error);
    }, () => {
      this.logger.log('[MODAL-CHATBOT-REASSIGNMENT] >> FAQs GOT BY FAQ-KB ID - COMPLETE');
    });
  }

  ngOnInit(): void { }

  onChangeBlock() {
    this.logger.log('[MODAL-CHATBOT-REASSIGNMENT] - onChangeBlock intent_display_name', this.intent_display_name);

    
  }

  onOkPresssed() {
    this.dialogRef.close();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
