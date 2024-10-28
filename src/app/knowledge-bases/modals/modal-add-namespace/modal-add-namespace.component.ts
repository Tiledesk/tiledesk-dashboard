import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'appdashboard-modal-add-namespace',
  templateUrl: './modal-add-namespace.component.html',
  styleUrls: ['./modal-add-namespace.component.scss']
})
export class ModalAddNamespaceComponent implements OnInit {
  public namespaceName: string
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalAddNamespaceComponent>,
  ) { }

  ngOnInit(): void {
  }

  onOkPresssed(namespaceName ){
    this.dialogRef.close({'namespaceName': namespaceName });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
