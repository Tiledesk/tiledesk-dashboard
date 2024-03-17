import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'app/core/auth.service';
import { LoggerService } from 'app/services/logger/logger.service';
// import { MultichannelService } from 'app/services/multichannel.service';

@Component({
  selector: 'appdashboard-home-whatsapp-account-wizard-modal',
  templateUrl: './home-whatsapp-account-wizard-modal.component.html',
  styleUrls: ['./home-whatsapp-account-wizard-modal.component.scss']
})
export class HomeWhatsappAccountWizardModalComponent implements OnInit {
  activeStep: string;
  t_params: any;
  waDeptName : string;
  phoneNumber: number
  projectID:string;
  waBotId:string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<HomeWhatsappAccountWizardModalComponent>,
    public dialog: MatDialog,
    public logger: LoggerService,
    // private multichannelService: MultichannelService,
    private auth: AuthService,
  ) { 
    this.logger.log('[HOME-WHATSAPP-ACCOUNT-WIZARD-MODAL] data ', data)
    if (data.calledBy === "step1") {
      this.activeStep = "step1"
     
    }
    if (data.calledBy === "step2") {
      this.activeStep = "step2"
      this.waDeptName = data.waDeptName
      this.t_params = { 'select_dep': this.waDeptName }
    }

    if (data.calledBy === "step3") {
      this.activeStep = "step3"
      this.waBotId = data.waBotId
    }
  }

  ngOnInit(): void {
    this.getCurrentProject()
  }

  getCurrentProject() {
   this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectID = project._id

      }
    });
  }

  goToConnectWACard() {
    // const action = { label: this.leadPropertyLabel, internal_name: this.leadPropertyName }
    this.dialogRef.close("go-to-next-step")
  }

  goToConnectCreateChatbot() {
    this.dialogRef.close("go-to-next-step")
  }


  // testItOutWABot() {
  //   this.dialogRef.close()
  //   this.logger.log('[HOME-WHATSAPP-ACCOUNT-WIZARD-MODAL] TEST IT OUT ' )
  //   let info = {
  //     project_id: this.projectID,
  //     bot_id: this.waBotId
  //   }

  //   this.logger.log("[HOME-WHATSAPP-ACCOUNT-WIZARD-MODAL] TEST IT OUT WA BOT: ", info)

  //   this.multichannelService.getCodeForWhatsappTest(info).then((response: any) => {
  //     this.logger.log("[HOME-WHATSAPP-ACCOUNT-WIZARD-MODAL]  GET CODE FOR WA TEST : ", response);
  //     // let code = "%23td" + response.short_uid;
  //     let text = "%23td" + response.short_uid + " Send me to start testing your bot";
  //     const testItOutOnWhatsappUrl = `https://api.whatsapp.com/send/?phone=${this.phoneNumber}&text=${text}&type=phone_number&app_absent=0`
  //     let left = (screen.width - 815) / 2;
  //     var top = (screen.height - 727) / 4;
  //     let params = `toolbar=no,menubar=no,width=815,height=727,left=${left},top=${top}`;
  //     window.open(testItOutOnWhatsappUrl, 'blank', params);
  //   }).catch((err) => {
  //    console.error("[HOME-WHATSAPP-ACCOUNT-WIZARD-MODAL] error getting testing code from whatsapp: ", err);
  //   })
  // }

}
