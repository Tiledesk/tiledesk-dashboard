import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrandService } from 'app/services/brand.service';

@Component({
  selector: 'appdashboard-modal-add-namespace',
  templateUrl: './modal-add-namespace.component.html',
  styleUrls: ['./modal-add-namespace.component.scss']
})
export class ModalAddNamespaceComponent implements OnInit {
  public namespaceName: string;
  selectedNamespaceType: string = "standard";
  hybridActive: boolean = false;
  salesEmail: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalAddNamespaceComponent>,
    public brandService: BrandService,
  ) { 
    this.hybridActive = data.hybridActive;

    const brand = brandService.getBrand();
    this.salesEmail = brand['CONTACT_SALES_EMAIL'];
  }

  ngOnInit(): void {
  }
  
  contactUs() {
    window.open(`mailto:${this.salesEmail}?subject=Increase quotas`);
  }

  onOkPresssed(namespaceName, selectedNamespaceType){
    this.dialogRef.close({
      'namespaceName': namespaceName,
      'hybrid': selectedNamespaceType !== 'standard'
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
