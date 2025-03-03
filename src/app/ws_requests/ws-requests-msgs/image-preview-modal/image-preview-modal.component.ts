import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'appdashboard-image-preview-modal',
  templateUrl: './image-preview-modal.component.html',
  styleUrls: ['./image-preview-modal.component.scss']
})
export class ImagePreviewModalComponent implements OnInit {
  public imagePreview: string;
  public file: any;
 

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ImagePreviewModalComponent>,
      private logger: LoggerService,
  ) { 
   this.logger.log('[MODAL-IMAGE-PREVIEW] data ', data)
   if (data) {
    this.imagePreview = data.imagePreview
    this.file = data.file
   }
  }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
 

  onOkPresssed() {
    const result = {
      file: this.file,
      imagePreview: this.imagePreview
     }
    this.dialogRef.close(result)
  }

}
