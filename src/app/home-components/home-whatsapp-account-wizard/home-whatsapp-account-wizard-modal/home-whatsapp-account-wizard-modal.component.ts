import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'appdashboard-home-whatsapp-account-wizard-modal',
  templateUrl: './home-whatsapp-account-wizard-modal.component.html',
  styleUrls: ['./home-whatsapp-account-wizard-modal.component.scss']
})
export class HomeWhatsappAccountWizardModalComponent implements OnInit {
  activeStep: string;
  t_params: any;
  waDeptName : string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<HomeWhatsappAccountWizardModalComponent>,
    public dialog: MatDialog,
    public logger: LoggerService
  ) { 
    console.log('[HOME-WHATSAPP-ACCOUNT-WIZARD-MODAL] data ', data)
    if (data.calledBy === "step1") {
      this.activeStep = "step1"
     
    }
    if (data.calledBy === "step2") {
      this.activeStep = "step2"
      this.waDeptName = data.waDeptName
      this.t_params = { 'select_dep': this.waDeptName }
    }
  }

  ngOnInit(): void {
  }

  goToConnectWACard() {
    // const action = { label: this.leadPropertyLabel, internal_name: this.leadPropertyName }
    this.dialogRef.close("go-to-next-step")
  }

  goToConnectCreateChatbot() {
    this.dialogRef.close("go-to-next-step")
  }

}
