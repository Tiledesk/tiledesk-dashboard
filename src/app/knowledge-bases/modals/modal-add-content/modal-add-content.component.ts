import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrandService } from 'app/services/brand.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { URL_kb } from 'app/utils/util';

@Component({
  selector: 'appdashboard-modal-add-content',
  templateUrl: './modal-add-content.component.html',
  styleUrls: ['./modal-add-content.component.scss']
})
export class ModalAddContentComponent implements OnInit {
  hideHelpLink: boolean;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalAddContentComponent>,
    private logger: LoggerService,
    public brandService: BrandService
  ) { 
    const brand = brandService.getBrand(); 
    this.hideHelpLink= brand['DOCS'];
  }

  ngOnInit(): void {
  }

  onOkPresssed(type){
    this.dialogRef.close(type);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  goToKbDoc() {
    const url = URL_kb;
    window.open(url, '_blank');
  }

}
