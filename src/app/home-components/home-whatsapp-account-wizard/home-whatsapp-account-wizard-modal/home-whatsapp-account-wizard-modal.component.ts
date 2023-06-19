import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'appdashboard-home-whatsapp-account-wizard-modal',
  templateUrl: './home-whatsapp-account-wizard-modal.component.html',
  styleUrls: ['./home-whatsapp-account-wizard-modal.component.scss']
})
export class HomeWhatsappAccountWizardModalComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<HomeWhatsappAccountWizardModalComponent>,
    public dialog: MatDialog,
    public logger: LoggerService
  ) { }

  ngOnInit(): void {
  }

  goToConnectWACard() {
    // const action = { label: this.leadPropertyLabel, internal_name: this.leadPropertyName }
    this.dialogRef.close("go-to-next-step")
  }

}
