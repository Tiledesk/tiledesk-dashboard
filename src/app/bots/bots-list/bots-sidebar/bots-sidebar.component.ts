import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'appdashboard-bots-sidebar',
  templateUrl: './bots-sidebar.component.html',
  styleUrls: ['./bots-sidebar.component.scss']
})
export class BotsSidebarComponent implements OnInit, OnChanges {
  @Input() allTemplatesCount: number;
  @Input() customerSatisfactionTemplatesCount: number;
  @Input() increaseSalesTemplatesCount: number;
  @Input() myChatbotOtherCount: number;
  @Input() customerSatisfactionBotsCount: number;
  @Input() increaseSalesBotsCount: number;
  @Input() allCommunityTemplatesCount: number;
  
  USER_ROLE: any
  project: any
  route: string
  IS_OPEN: boolean 
  private unsubscribe$: Subject<any> = new Subject<any>();

 
  public BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE: boolean;
  public BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE: boolean;
  public BOTS_INCREASE_SALES_TEMPALTES_ROUTE_IS_ACTIVE: boolean;
  public BOTS_MYCHATBOT_ALL_ROUTE_IS_ACTIVE: boolean;
  public BOTS_MYCHATBOT_INCREASE_SALES_ROUTE_IS_ACTIVE: boolean;
  public BOTS_MYCHATBOT_CUSTOMER_SATISFACTION_ROUTE_IS_ACTIVE: boolean;
  public BOTS_COMMUNITY_TEMPLATES_ROUTE_IS_ACTIVE: boolean;
  constructor(
    private auth: AuthService,
    private logger: LoggerService,
    public router: Router,
  ) { }

  ngOnInit(): void {
    this.getCurrentRoute()
   
    this.getCurrentProject();
    this.IS_OPEN = true
    // console.log('[BOTS-SIDEBAR] - IS_OPEN ', this.IS_OPEN)

  }
  ngOnChanges() {
    // console.log('[BOTS-SIDEBAR] - allTemplatesCount ', this.allTemplatesCount)
    // console.log('[BOTS-SIDEBAR] - customerSatisfactionTemplatesCount ', this.customerSatisfactionTemplatesCount)
    // console.log('[BOTS-SIDEBAR] - increaseSalesTemplatesCount ', this.increaseSalesTemplatesCount)
    // console.log('[BOTS-SIDEBAR] - myChatbotOtherCount ', this.myChatbotOtherCount)
  }

  getCurrentProject() {
    // console.log('[BOTS-SIDEBAR] - CALLING GET CURRENT PROJECT  ', this.project)
    this.auth.project_bs.subscribe((project) => {
      this.project = project;
    })
  }

 
 

  getCurrentRoute() {
    this.route = this.router.url
    if (this.route.indexOf('/bots/my-chatbots/all') !== -1) {
      this.BOTS_MYCHATBOT_ALL_ROUTE_IS_ACTIVE = true
      // console.log('[BOTS-SIDEBAR] - BOTS_MYCHATBOT_ALL_ROUTE_IS_ACTIVE  ', this.BOTS_MYCHATBOT_ALL_ROUTE_IS_ACTIVE)
    } else {
      this.BOTS_MYCHATBOT_ALL_ROUTE_IS_ACTIVE = false
      // console.log('[BOTS-SIDEBAR] - BOTS_MYCHATBOT_ALL_ROUTE_IS_ACTIVE  ', this.BOTS_MYCHATBOT_ALL_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/bots/my-chatbots/increase-sales') !== -1) {
      this.BOTS_MYCHATBOT_INCREASE_SALES_ROUTE_IS_ACTIVE = true
      // console.log('[BOTS-SIDEBAR] - BOTS_MYCHATBOT_INCREASE_SALES_ROUTE_IS_ACTIVE  ', this.BOTS_MYCHATBOT_INCREASE_SALES_ROUTE_IS_ACTIVE)
    } else {
      this.BOTS_MYCHATBOT_INCREASE_SALES_ROUTE_IS_ACTIVE = false
      // console.log('[BOTS-SIDEBAR] - BOTS_MYCHATBOT_INCREASE_SALES_ROUTE_IS_ACTIVE  ', this.BOTS_MYCHATBOT_INCREASE_SALES_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/bots/my-chatbots/customer-satisfaction') !== -1) {
      this.BOTS_MYCHATBOT_CUSTOMER_SATISFACTION_ROUTE_IS_ACTIVE = true
      // console.log('[BOTS-SIDEBAR] - BOTS_MYCHATBOT_CUSTOMER_SATISFACTION_ROUTE_IS_ACTIVE  ', this.BOTS_MYCHATBOT_CUSTOMER_SATISFACTION_ROUTE_IS_ACTIVE)
    } else {
      this.BOTS_MYCHATBOT_CUSTOMER_SATISFACTION_ROUTE_IS_ACTIVE = false
      // console.log('[BOTS-SIDEBAR] - BOTS_MYCHATBOT_CUSTOMER_SATISFACTION_ROUTE_IS_ACTIVE  ', this.BOTS_MYCHATBOT_CUSTOMER_SATISFACTION_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/bots/templates/all') !== -1) {
      this.BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE = true
      // console.log('[BOTS-SIDEBAR] - BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE  ', this.BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE)
    } else {
      this.BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE = false
      // console.log('[BOTS-SIDEBAR] - BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE  ', this.BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE)
    }
    if (this.route.indexOf('/bots/templates/customer-satisfaction') !== -1) {
      this.BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE = true
      // console.log('[BOTS-SIDEBAR] - BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE  ', this.BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE)
    } else {
      this.BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE = false
      // console.log('[BOTS-SIDEBAR] - BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE  ', this.BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE)
    }
    if (this.route.indexOf('/bots/templates/increase-sales') !== -1) {
      this.BOTS_INCREASE_SALES_TEMPALTES_ROUTE_IS_ACTIVE = true
      // console.log('[BOTS-SIDEBAR] - BOTS_INCREASE_SALES_ROUTE_IS_ACTIVE  ', this.BOTS_INCREASE_SALES_TEMPALTES_ROUTE_IS_ACTIVE)
    } else {
      this.BOTS_INCREASE_SALES_TEMPALTES_ROUTE_IS_ACTIVE = false
      // console.log('[BOTS-SIDEBAR] - BOTS_INCREASE_SALES_TEMPALTES_ROUTE_IS_ACTIVE  ', this.BOTS_INCREASE_SALES_TEMPALTES_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/bots/templates/community') !== -1) {
      this. BOTS_COMMUNITY_TEMPLATES_ROUTE_IS_ACTIVE = true
      // console.log('[BOTS-SIDEBAR] - BOTS_INCREASE_SALES_ROUTE_IS_ACTIVE  ', this.BOTS_INCREASE_SALES_TEMPALTES_ROUTE_IS_ACTIVE)
    } else {
      this. BOTS_COMMUNITY_TEMPLATES_ROUTE_IS_ACTIVE = false
      // console.log('[BOTS-SIDEBAR] - BOTS_INCREASE_SALES_TEMPALTES_ROUTE_IS_ACTIVE  ', this.BOTS_INCREASE_SALES_TEMPALTES_ROUTE_IS_ACTIVE)
    }


   
  }


 

  goToBotAllTemplates() {
    this.router.navigate(['project/' + this.project._id + '/bots/templates/all']);
  }

  goToBotCommunityTemplates() {
    this.router.navigate(['project/' + this.project._id + '/bots/templates/community']);
  }

  goToBotIncreaseSalesTemplates() {
    this.router.navigate(['project/' + this.project._id + '/bots/templates/increase-sales']);
  }

  goToBotCustomerSatisfactionTemplates() {
    this.router.navigate(['project/' + this.project._id + '/bots/templates/customer-satisfaction']);
  }

  goToOtherMyChatbotOther() {
    this.router.navigate(['project/' + this.project._id + '/bots/my-chatbots/all']);
  }

  goToBotCustomerSatisfactionBots () {
    this.router.navigate(['project/' + this.project._id + '/bots/my-chatbots/customer-satisfaction']);
  }

  goToBotIncreaseSalesBots() {
    this.router.navigate(['project/' + this.project._id + '/bots/my-chatbots/increase-sales']);
  }

}
