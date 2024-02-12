import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { IntegrationService } from 'app/services/integration.service';
import { BrevoIntegration, CATEGORIES_LIST, CustomerioIntegration, HubspotIntegration, INTEGRATIONS_KEYS, INTEGRATION_LIST_ARRAY, OpenaiIntegration, QaplaIntegration } from './utils';
import { LoggerService } from 'app/services/logger/logger.service';
import { NotifyService } from 'app/core/notify.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from 'app/services/users.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { BrandService } from 'app/services/brand.service';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { PLAN_NAME } from 'app/utils/util';

const swal = require('sweetalert');

@Component({
  selector: 'appdashboard-integrations',
  templateUrl: './integrations.component.html',
  styleUrls: ['./integrations.component.scss']
})
export class IntegrationsComponent extends PricingBaseComponent implements OnInit{

  project: any;
  project_plan: any;
  isChromeVerGreaterThan100: boolean;
  panelOpenState = true;
  integrationSelectedName: string = "none";

  integrations = [];
  selectedIntegration: any;
  selectedIntegrationModel: null;
  integrationLocked: boolean = false;

  INT_KEYS = INTEGRATIONS_KEYS;
  INTEGRATIONS = INTEGRATION_LIST_ARRAY;
  CATEGORIES = CATEGORIES_LIST;

  plan_expired: boolean = false;
  plan_require: string = "";
  private unsubscribe$: Subject<any> = new Subject<any>();
  USER_ROLE: string;
  ROLE_IS_AGENT: boolean;

  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;

  translateparams: any;

  constructor(
    private auth: AuthService,
    private usersService: UsersService,
    private integrationService: IntegrationService,
    public notify: NotifyService,
    private logger: LoggerService,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    private brand: BrandService,
    public prjctPlanService: ProjectPlanService
  ) { 
    super(prjctPlanService, notify);;
  }

  ngOnInit(): void {
    this.getProjectPlan();
    console.log("xxxx profile_name: ", this.profile_name);
    this.getCurrentProject();
    this.getBrowserVersion();
    this.translateModalOnlyOwnerCanManageProjectAccount();
    this.getAllIntegrations().then(() => {

      const brand = this.brand.getBrand();
      console.log("brand: ", brand);
      this.translateparams = brand;

      const name = this.route.snapshot.queryParamMap.get('name');
      console.log("name: ", name);

      if (name) {
        this.onIntegrationSelect(this.INTEGRATIONS.find(i => i.key === name));
      }

    })

  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      console.log("Project: ", this.project);
      // this.project_plan = this.project.profile_name;
      // console.log("Current project plan: ", this.project_plan);
      // if ((this.project.profile_name === 'Sandbox' || this.project.profile_name === 'free') && this.project.trial_expired === true) {
      //   this.plan_expired = true;
      // }
    });
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.logger.debug("[INTEGRATION-COMP] isChromeVerGreaterThan100: ", isChromeVerGreaterThan100)
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    })
  }

  getProjectUserRole() {
    // const user___role =  this.usersService.project_user_role_bs.value;
    // this.logger.log('[NAVBAR] % »»» WebSocketJs WF +++++ ws-requests--- navbar - USER ROLE 1 ', user___role);

    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user_role) => {
        console.log("[INTEGRATION-COMP] user is ", user_role);
        if (user_role) {
          this.USER_ROLE = user_role
          if (user_role === 'agent') {
            this.ROLE_IS_AGENT = true;

          } else {
            this.ROLE_IS_AGENT = false;
          }
        }
      });
  }

  getAllIntegrations() {
    return new Promise((resolve, reject) => {
      this.integrationService.getAllIntegrations().subscribe((integrations: Array<any>) => {
        this.logger.debug("[INTEGRATION-COMP] Integrations for this project ", integrations)
        console.log("[INTEGRATION-COMP] Integrations for this project ", integrations)
        this.integrations = integrations;
        resolve(true);
      }, (error) => {
        this.logger.error("[INTEGRATION-COMP] Get all integrations error: ", error);
        reject()
      })
    })
  }

  onIntegrationSelect(integration) {
    this.integrationLocked = false;
    this.checkPlan(integration.plan).then(() => {
      this.integrationSelectedName = integration.key;
      this.selectedIntegration = this.integrations.find(i => i.name === integration.key);
      if (!this.selectedIntegration) {
        this.selectedIntegration = this.initializeIntegration(integration.key);
      }
      this.selectedIntegrationModel = integration;
      this.changeRoute(integration.key);
    }).catch(() => {
      this.integrationLocked = true;
      this.plan_require = integration.plan;
      this.integrationSelectedName = integration.key;
      this.selectedIntegration = this.integrations.find(i => i.name === integration.key);
      if (!this.selectedIntegration) {
        this.selectedIntegration = this.initializeIntegration(integration.key);
      }
      this.selectedIntegrationModel = integration;
      this.changeRoute(integration.key);

      // this.integrationSelectedName = 'none';
      // this.integrationLocked = true;
      // this.plan_require = integration.plan;
      console.log("Integration unavailable for your project")
      console.log("available for plan ", integration.plan)
    })
  }

  integrationUpdateEvent(data) {
    this.integrationService.saveIntegration(data.integration).subscribe((result) => {
      this.logger.debug("[INTEGRATION-COMP] Save integration result: ", result);
      // this.notify.showNotification("Saved successfully", 2, 'done');
      this.reloadSelectedIntegration(data.integration);
      if (data.isVerified === true) {
        this.notify.showWidgetStyleUpdateNotification("Saved successfully", 2, 'done');
      } else {
        this.notify.showWidgetStyleUpdateNotification("Saved but not verified", 3, 'priority_high');
      }
    }, (error) => {
      this.logger.error("[INTEGRATION-COMP] Save integration error: ", error);
    })
  }

  integrationDeletedEvent(integration) {
    this.presentDeleteConfirmModal(integration);
    // this.integrationService.deleteIntegration(integration._id).subscribe((result) => {
    //   this.logger.debug("[INTEGRATION-COMP] Delete integration result: ", result);
    //   this.reloadSelectedIntegration(integration);
    // }, (error) => {
    //   this.logger.error("[INTEGRATION-COMP] Delete integration error: ", error);
    // })
  }

  reloadSelectedIntegration(integration) {
    this.getAllIntegrations().then(() => {
      this.onIntegrationSelect(this.INTEGRATIONS.find(i => i.key === integration.name));
    })
  }

  presentDeleteConfirmModal(integration) {
    swal({
      title: "Are you sure?",
      text: "Are you sure you want to delete this integration?",
      icon: "warning",
      buttons: ["Cancel", "Delete"],
      dangerMode: true,
    }).then((WillDelete) => {
      if (WillDelete) {

        this.integrationService.deleteIntegration(integration._id).subscribe((result) => {
          this.logger.debug("[INTEGRATION-COMP] Delete integration result: ", result);
          swal("Deleted" + "!", "You will no longer use this integration", {
            icon: "success",
          }).then((okpressed) => {
            console.log("ok pressed")
          });
          this.reloadSelectedIntegration(integration);

        }, (error) => {
          this.logger.error("[INTEGRATION-COMP] Delete integration error: ", error);
          swal("Unable to delete the integration", {
            icon: "error",
          });
        })
      } else {
        this.logger.log('operation aborted')
      }
    });
  }

  presentUpgradePlanModal() {
    console.log("apro la modale");
    swal({
      title: "Upgrade plan",
      text: "Upgrade your plan to get this feature",
      icon: "warning",
      buttons: ["Cancel", "Upgrade!"],
      dangerMode: true,
    }).then((WillUpgrade) => {
      if (WillUpgrade) {

        console.log("route verso gestione piani");
        this.goToPricing();
        // this.integrationService.deleteIntegration(integration._id).subscribe((result) => {
        //   this.logger.debug("[INTEGRATION-COMP] Delete integration result: ", result);
        //   swal("Deleted" + "!", "You will no longer use this integration", {
        //     icon: "success",
        //   }).then((okpressed) => {
        //     console.log("ok pressed")
        //   });
        //   this.reloadSelectedIntegration(integration);

        // }, (error) => {
        //   this.logger.error("[INTEGRATION-COMP] Delete integration error: ", error);
        //   swal("Unable to delete the integration", {
        //     icon: "error",
        //   });
        // })
      } else {
        this.logger.log('operation aborted')
      }
    });
  }

  changeRoute(key) {
    console.log("change route in ", key);
    this.router.navigate(['project/' + this.project._id + '/integrations/'], { queryParams: { name: key } })
  }

  goToPricing() {
    // if (this.ROLE_IS_AGENT === false) {
    if (this.USER_ROLE === 'owner') {
      // this.presentModalUpgradePlan()
      this.router.navigate(['project/' + this.project._id + '/pricing']);
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan()
    }
  }

  presentModalOnlyOwnerCanManageTheAccountPlan() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageTheAccountPlanMsg, this.learnMoreAboutDefaultRoles)
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


  initializeIntegration(key: INTEGRATIONS_KEYS) {
    if (key === INTEGRATIONS_KEYS.OPENAI) {
      return new OpenaiIntegration();
    }
    if (key === INTEGRATIONS_KEYS.QAPLA) {
      return new QaplaIntegration();
    }
    if (key === INTEGRATIONS_KEYS.HUBSPOT) {
      return new HubspotIntegration();
    }
    if (key === INTEGRATIONS_KEYS.CUSTOMERIO) {
      return new CustomerioIntegration();
    }
    if (key === INTEGRATIONS_KEYS.BREVO) {
      return new BrevoIntegration();
    }
  }

  checkPlan(integration_plan) {
    console.log("check if " + this.profile_name + " > " + integration_plan);

    return new Promise((resolve, reject) => {
      // FREE or SANDBOX PLAN
      if (this.profile_name === 'free' || this.profile_name === 'Sandbox') {
        if (integration_plan !== 'Sandbox') {
          reject(false);
        }
        resolve(true)
      }

      // BASIC PLAN
      else if (this.profile_name === PLAN_NAME.A || this.profile_name === 'Basic') {
        if (integration_plan === 'Premium' || integration_plan === 'Custom') {
          reject(false);
        }
        resolve(true)
      }

      // PREMIUM PLAN
      else if (this.profile_name === 'Scale' || this.profile_name === 'Premium') {
        if ( integration_plan === 'Custom') {
          reject(false);
        }
        resolve(true)
      }

      else {
        console.log("Custom plan?")
        resolve(true)
      }
    })

  }

}
