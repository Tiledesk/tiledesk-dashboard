import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from 'app/services/logger/logger.service';
import { CreateChatbotModalComponent } from '../create-chatbot-modal/create-chatbot-modal.component';
import { AppConfigService } from 'app/services/app-config.service';
@Component({
  selector: 'appdashboard-flows-chatbot-modal',
  templateUrl: './create-flows-modal.component.html',
  styleUrls: ['./create-flows-modal.component.scss']
})
export class CreateFlowsModalComponent implements OnInit {
  public isChatbotRoute: boolean;
  public diplayTwilioVoiceChabotCard: boolean;
  public diplayVXMLVoiceChabotCard: boolean;
  public_Key: string;
  isVisibleCOP: boolean;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CreateFlowsModalComponent>,
    private logger: LoggerService,
    private translate: TranslateService,
    public dialog: MatDialog,
    public appConfigService: AppConfigService,
  ) {
    this.logger.log('[CREATE FLOWS MODAL] data ', data)
    if (data ) {
      this.isChatbotRoute = data.isChatbotRoute
      this.diplayTwilioVoiceChabotCard = data.diplayTwilioVoiceChabotCard
      this.diplayVXMLVoiceChabotCard = data.diplayVXMLVoiceChabotCard
      this.logger.log('[CREATE FLOWS MODAL] isChatbotRoute ', this.isChatbotRoute)
      this.logger.log('[CREATE FLOWS MODAL] diplayVXMLVoiceChabotCard ', this.diplayVXMLVoiceChabotCard)
      this.logger.log('[CREATE FLOWS MODAL] diplayVXMLVoiceChabotCard ', this.diplayVXMLVoiceChabotCard)
    }
  }

  ngOnInit(): void {
    this.getOSCODE();
  }

    getOSCODE() {
      this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;

      let keys = this.public_Key.split("-");

      keys.forEach(key => {
        if (key.includes("COP")) {
          let cop = key.split(":");
          console.log('PUBLIC-KEY [CREATE FLOWS MODAL] - cop key&value', cop);
          if (cop[1] === "F") {
            this.isVisibleCOP = false;
            console.log("[CREATE FLOWS MODAL]isVisibleCOP: ", this.isVisibleCOP)
          } else {
            this.isVisibleCOP = true;
           console.log("[CREATE FLOWS MODAL] isVisibleCOP: ", this.isVisibleCOP)
          }
        }
      });

    if (!this.public_Key.includes("COP")) {
      this.isVisibleCOP = false;
      console.log("[CREATE FLOWS MODAL] isVisibleCOP: ", this.isVisibleCOP)
    }
  }

  onFileSelected(event: Event) {
    // const input = event.target as HTMLInputElement;
    // const file = input.files?.[0];
  
    if (event) {
      this.dialogRef.close(event); // Pass event back to parent
    }
  }


  onOkPresssed(subType) {
    this.logger.log('[CREATE FLOWS MODAL] onOkPresssed subType ', subType) 
      this.dialogRef.close(subType);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

    presentModalAddBotFromScratch(subtype) {
      this.logger.log('[BOTS-LIST] - presentModalAddBotFromScratch subtype ',subtype);
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
          this.logger.log(`[BOTS-LIST] Dialog result:`, result);
    
          // if (result) {
          //   this.chatbotName = result.chatbotName;
    
          //   if (this.chatbotName) {
          //     this.createBlankTilebot(result.subType)
          //   }
          // }
        });
      }

}
