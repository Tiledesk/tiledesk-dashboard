import { Component, OnInit,Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'appdashboard-cds-publish-on-community-modal',
  templateUrl: './cds-publish-on-community-modal.component.html',
  styleUrls: ['./cds-publish-on-community-modal.component.scss']
})
export class CdsPublishOnCommunityModalComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CdsPublishOnCommunityModalComponent>,
  ) { 
    console.log('[PUBLISH-ON-COMMUNITY-MODAL-COMPONENT] data ', data)
  }

  ngOnInit(): void {
  }

}
