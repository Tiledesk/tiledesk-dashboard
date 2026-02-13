import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrandService } from 'app/services/brand.service';
import { URL_hybrid_search_doc, URL_standard_search_doc } from 'app/utils/util';

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
  hideHelpLink: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalAddNamespaceComponent>,
    public brandService: BrandService,
  ) { 
    this.hybridActive = data.hybridActive;

    const brand = brandService.getBrand();
    this.salesEmail = brand['CONTACT_SALES_EMAIL'];
    this.hideHelpLink= brand['DOCS'];
  }

  ngOnInit(): void {
  }
  
  contactUs() {
    window.open(`mailto:${this.salesEmail}?subject=Activate Hibrid search`);
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

  goToHybridSearchDoc() {
      const url = URL_hybrid_search_doc;
      window.open(url, '_blank');
  }

  goToStandardSearchDoc(){
      const url = URL_standard_search_doc;
      window.open(url, '_blank');
  }

}
