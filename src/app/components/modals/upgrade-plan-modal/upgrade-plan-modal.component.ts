import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from 'app/core/notify.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'appdashboard-upgrade-plan-modal',
  templateUrl: './upgrade-plan-modal.component.html',
  styleUrls: ['./upgrade-plan-modal.component.scss']
})
export class UpgradePlanModalComponent implements OnInit {
  tparams: any;
  
  id_project: string;
  USER_ROLE: string;
  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<UpgradePlanModalComponent>,
    private router: Router,
    public dialog: MatDialog,
    private logger: LoggerService,
    private notifyService: NotifyService,
    private translate: TranslateService
  ) { 
    // console.log('[UPGRADE-PLAN-MODAL] data ', data)
    this.tparams = {'plan_name': data.featureAvailableFrom}
   
    this.id_project = data.projectId;
    this.USER_ROLE = data.userRole
    // console.log('[UPGRADE-PLAN-MODAL] data > USER_ROLE  ',  this.USER_ROLE)
  }

  ngOnInit(): void {
    this.translateModalOnlyOwnerCanManageProjectAccount()
  }

  closeDialog() {
    this.dialogRef.close()
  }


  goToPricing() {
    this.closeDialog()
    if (this.USER_ROLE === 'owner') {
      this.router.navigate(['project/' + this.id_project + '/pricing']);
      
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan();
    }
  }

  presentModalOnlyOwnerCanManageTheAccountPlan() {
    this.notifyService.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageTheAccountPlanMsg, this.learnMoreAboutDefaultRoles)
  }

  translateModalOnlyOwnerCanManageProjectAccount() {
    this.translate.get('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan')
      .subscribe((translation: any) => {
        this.onlyOwnerCanManageTheAccountPlanMsg = translation;
      });

    this.translate.get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {
        this.learnMoreAboutDefaultRoles = translation;
      });
  }

}
