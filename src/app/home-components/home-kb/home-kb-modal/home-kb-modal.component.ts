import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { KB, KbSettings } from 'app/models/kbsettings-model';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { LoggerService } from 'app/services/logger/logger.service';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'appdashboard-home-kb-modal',
  templateUrl: './home-kb-modal.component.html',
  styleUrls: ['./home-kb-modal.component.scss']
})
export class HomeKbModalComponent implements OnInit {
  URLFormControl = new FormControl('', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]);
  // addButtonDisabled: boolean = false;
  isValidURL: boolean = false;
  kbSettings: KbSettings = {
    _id: null,
    id_project: null,
    gptkey: null,
    maxKbsNumber: null,
    maxPagesNumber: null,
    kbs: []
  }

  newKb: KB = {
    _id: null,
    name: '',
    url: ''
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<HomeKbModalComponent>,
    public dialog: MatDialog,
    public logger: LoggerService,
    private kbService: KnowledgeBaseService
  ) { }

  ngOnInit(): void {
    // this.getKnowledgeBaseSettings()
  }

  // getKnowledgeBaseSettings() {
  //   this.kbService.getKbSettings().subscribe((kbSettings: KbSettings) => {
  //     this.logger.log("[HOME-KB MODAL] get kbSettings: ", kbSettings);
  //     this.kbSettings = kbSettings;
  //     // this.kbsList = kbSettings.kbs;
  //     if (this.kbSettings.kbs.length < kbSettings.maxKbsNumber) {
  //       // this.addButtonDisabled = false;
  //     } else {
  //       // this.addButtonDisabled = true;
  //     }
  //     // this.checkAllStatuses();
  //   }, (error) => {
  //     this.logger.error("[HOME-KB  MODAL] ERROR get kbSettings: ", error);
  //   }, () => {
  //     this.logger.log("[HOME-KB MODAL] get kbSettings *COMPLETE*");
  //   })
  // }

  onOkPresssed(newKb ){
    this.dialogRef.close({'newKb': newKb, kbSettings: this.kbSettings });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }


  onChangeURL(event) {
    this.logger.log("[HOME-KB MODAL] onChangeInput event", event);
   this.isValidURL = this.isValidUrl(event)
    this.logger.log("[HOME-KB MODAL] onChangeInput isValidURL", this.isValidURL);
  }

  isValidUrl = (urlString) => {
    var urlPattern = new RegExp('^(https?:\\/\\/)?' + // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator
    return !!urlPattern.test(urlString);
  }
}
