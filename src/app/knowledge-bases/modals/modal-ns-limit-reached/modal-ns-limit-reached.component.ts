import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BrandService } from 'app/services/brand.service';

@Component({
  selector: 'appdashboard-modal-ns-limit-reached',
  templateUrl: './modal-ns-limit-reached.component.html',
  styleUrls: ['./modal-ns-limit-reached.component.scss']
})
export class ModalNsLimitReachedComponent implements OnInit {

  planType: string;
  allowedNamespaceNum: number; 
  planName: string;
  id_project: string;
  public salesEmail: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ModalNsLimitReachedComponent>,
    private router: Router,
    public brandService: BrandService,
  ) {
    // console.log('[MODAL-NS-LIMIT-REACHED] data ', data)

    if (data && data.planName ) {
      this.planName = data.planName
    }

    if (data && data.planLimit ) {
      this.allowedNamespaceNum = data.planLimit
    }

    if (data && data.planType ) {
      this.planType = data.planType
    }

    if (data && data.id_project ) {
      this.id_project = data.id_project
    }


    const brand = brandService.getBrand();
    this.salesEmail = brand['CONTACT_SALES_EMAIL'];
    
   }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onOkPresssed() {
    this.dialogRef.close();
    this.contacUsViaEmail()
  }

  onUpgradePlan() {
    this.dialogRef.close();
    this.router.navigate(['project/' + this.id_project + '/pricing']);
  }


  contacUsViaEmail() {
    this.dialogRef.close();
    window.open(`mailto:${this.salesEmail}?subject=Upgrade plan`);
  }

}
