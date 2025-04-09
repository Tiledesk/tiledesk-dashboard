import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from 'app/services/logger/logger.service';
import { CreateChatbotModalComponent } from '../create-chatbot-modal/create-chatbot-modal.component';
@Component({
  selector: 'appdashboard-flows-chatbot-modal',
  templateUrl: './create-flows-modal.component.html',
  styleUrls: ['./create-flows-modal.component.scss']
})
export class CreateFlowsModalComponent implements OnInit {
  public isChatbotRoute: boolean;
  public diplayTwilioVoiceChabotCard: boolean;
  public diplayVXMLVoiceChabotCard: boolean;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CreateFlowsModalComponent>,
    private logger: LoggerService,
    private translate: TranslateService,
      public dialog: MatDialog,
  ) {
    console.log('[CREATE FLOWS MODAL] data ', data)
    if (data ) {
      this.isChatbotRoute = data.isChatbotRoute
      this.diplayTwilioVoiceChabotCard = data.diplayTwilioVoiceChabotCard
      this.diplayVXMLVoiceChabotCard = data.diplayVXMLVoiceChabotCard
      console.log('[CREATE FLOWS MODAL] isChatbotRoute ', this.isChatbotRoute)
      console.log('[CREATE FLOWS MODAL] diplayVXMLVoiceChabotCard ', this.diplayVXMLVoiceChabotCard)
      console.log('[CREATE FLOWS MODAL] diplayVXMLVoiceChabotCard ', this.diplayVXMLVoiceChabotCard)
    }
  }

  ngOnInit(): void {
  }

  onFileSelected(event: Event) {
    // const input = event.target as HTMLInputElement;
    // const file = input.files?.[0];
  
    if (event) {
      this.dialogRef.close(event); // Pass event back to parent
    }
  }


  onOkPresssed(subType) {
    console.log('[CREATE FLOWS MODAL] onOkPresssed subType ', subType) 
      this.dialogRef.close(subType);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

    presentModalAddBotFromScratch(subtype) {
       console.log('[BOTS-LIST] - presentModalAddBotFromScratch subtype ',subtype);
        // const createBotFromScratchBtnEl = <HTMLElement>document.querySelector('#home-material-btn');
        // this.logger.log('[HOME-CREATE-CHATBOT] - presentModalAddBotFromScratch addKbBtnEl ', addKbBtnEl);
        // createBotFromScratchBtnEl.blur()
        const dialogRef = this.dialog.open(CreateChatbotModalComponent, {
          width: '400px',
          data: {
            'subtype': subtype
          },
        })
        dialogRef.afterClosed().subscribe(result => {
          console.log(`[BOTS-LIST] Dialog result:`, result);
    
          // if (result) {
          //   this.chatbotName = result.chatbotName;
    
          //   if (this.chatbotName) {
          //     this.createBlankTilebot(result.subType)
          //   }
          // }
        });
      }

}
