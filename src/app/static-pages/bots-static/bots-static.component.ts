import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'app/core/auth.service';
import { NotifyService } from 'app/core/notify.service';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
import { LoggerService } from 'app/services/logger/logger.service';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { UsersService } from 'app/services/users.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'

@Component({
  selector: 'appdashboard-bots-static',
  templateUrl: './bots-static.component.html',
  styleUrls: ['./bots-static.component.scss']
})


export class BotsStaticComponent extends PricingBaseComponent implements OnInit , OnDestroy {
  isChromeVerGreaterThan100: boolean;
  projectId: string;
  USER_ROLE: string;
  private unsubscribe$: Subject<any> = new Subject<any>();

  imageObject = [
    {
      image: 'assets/img/bots-demo-img-1.png',
      thumbImage: 'assets/img/bots-demo-img-1.png'
    },
    {
      image: 'assets/img/bots-demo-img-2.png',
      thumbImage: 'assets/img/bots-demo-img-2.png'
    },
    {
      image: 'assets/img/bots-demo-img-3.png',
      thumbImage: 'assets/img/bots-demo-img-3.png'
    }
  ];

  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;

  constructor(
    public auth: AuthService,
    private usersService: UsersService,
    private logger: LoggerService,
    public prjctPlanService: ProjectPlanService,
    public notify: NotifyService,
    private router: Router,
    public translate: TranslateService,
  ) {
    super(prjctPlanService, notify);
  }

  ngOnInit(): void {
    this.getBrowserVersion();
    this.getCurrentProject();
    this.getProjectUserRole();
    this.getTranslationStrings();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100
    .pipe(
      takeUntil(this.unsubscribe$)
    )
    .subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  console.log("[BOT-CREATE] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs
    .pipe(
      takeUntil(this.unsubscribe$)
    )
    .subscribe((user_role) => {
      this.USER_ROLE = user_role;
      this.logger.log('[BOTS-STATIC] - PROJECT USER ROLE: ', this.USER_ROLE);
    });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectId = project._id
        this.logger.log('[BOTS-STATIC] - project Id ', this.projectId)
      }
    });
  }

  goToPricing() {
    this.logger.log('[CNTCTS-STATIC] - goToPricing projectId ', this.projectId);
    
      if (this.USER_ROLE === 'owner') {
        this.notify._displayContactUsModal(true, 'upgrade_plan');
        // if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
        //   this.notify._displayContactUsModal(true, 'upgrade_plan');
        // } else {
        //   this.router.navigate(['project/' + this.projectId + '/pricing']);
      
        // }
      } else {
        this.presentModalOnlyOwnerCanManageTheAccountPlan();
      }
   
  }

  presentModalOnlyOwnerCanManageTheAccountPlan() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageTheAccountPlanMsg, this.learnMoreAboutDefaultRoles)
  }


  getTranslationStrings() {
    this.translateModalOnlyOwnerCanManageProjectAccount()
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
