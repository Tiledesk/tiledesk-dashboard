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

  USER_ROLE: any
  project: any
  route: string
  IS_OPEN: boolean 
  private unsubscribe$: Subject<any> = new Subject<any>();

  public BOTS_LIST_ROUTE_IS_ACTIVE: boolean;
  public BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE: boolean;
  public BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE: boolean;
  public BOTS_INCREASE_SALES_ROUTE_IS_ACTIVE: boolean;
  constructor(
    private auth: AuthService,
    private logger: LoggerService,
    public router: Router,
  ) { }

  ngOnInit(): void {
    this.getCurrentRoute()
    this.listenSidebarIsOpened() 
    this.getCurrentProject();
    this.IS_OPEN = true
    console.log('[BOTS-SIDEBAR] - IS_OPEN ', this.IS_OPEN)
    // console.log('[BOTS-SIDEBAR] - allTemplatesCount ', this.allTemplatesCount)
    this.goToBotAllTemplates()
  }
  ngOnChanges() {
    console.log('[BOTS-SIDEBAR] - allTemplatesCount ', this.allTemplatesCount)
  }

  getCurrentProject() {
    console.log('[BOTS-SIDEBAR] - CALLING GET CURRENT PROJECT  ', this.project)
    this.auth.project_bs.subscribe((project) => {
      this.project = project
    
      
    })
  }

  listenSidebarIsOpened() {
    this.auth.botsSidebarIsOpened.subscribe((isopened) => {
      this.logger.log('[BOTS-SIDEBAR] BOT-SIDEBAR is opened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN = isopened
      console.log('[BOTS-SIDEBAR] - IS_OPEN listenSidebarIsOpened', this.IS_OPEN)
    })
  }

  toggletBotsSidebar(IS_OPEN) {
    this.IS_OPEN = IS_OPEN;
    this.auth.togglebotsSidebar(IS_OPEN)
    console.log('[BOTS-SIDEBAR] - IS_OPEN toggletBotsSidebar', this.IS_OPEN)
  }

  getCurrentRoute() {
    this.route = this.router.url
    // if (this.route.indexOf('/bots') !== -1) {
    //   this.BOTS_LIST_ROUTE_IS_ACTIVE = true
    //   console.log('[BOTS-SIDEBAR] - BOTS_LIST_ROUTE_IS_ACTIVE  ', this.BOTS_LIST_ROUTE_IS_ACTIVE)
    // } else {
    //   this.BOTS_LIST_ROUTE_IS_ACTIVE = false
    //   // console.log('[NATIVE-BOT-SIDEBAR] - GENERAL_ROUTE_IS_ACTIVE  ', this.GENERAL_ROUTE_IS_ACTIVE)
    // }

    if (this.route.indexOf('bots/templates/all') !== -1) {
      this.BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE = true
      this.BOTS_LIST_ROUTE_IS_ACTIVE = false
      console.log('[BOTS-SIDEBAR] - BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE  ', this.BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE)
      console.log('[BOTS-SIDEBAR] - BOTS_LIST_ROUTE_IS_ACTIVE  ', this.BOTS_LIST_ROUTE_IS_ACTIVE)
    } else {
      this.BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE = false
      this.BOTS_LIST_ROUTE_IS_ACTIVE = true
      console.log('[BOTS-SIDEBAR] - BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE  ', this.BOTS_ALL_TEMPALTES_ROUTE_IS_ACTIVE)
      console.log('[BOTS-SIDEBAR] - BOTS_LIST_ROUTE_IS_ACTIVE  ', this.BOTS_LIST_ROUTE_IS_ACTIVE)
    }
    if (this.route.indexOf('bots/templates/customer-satisfaction') !== -1) {
      this.BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE = true
      this.BOTS_LIST_ROUTE_IS_ACTIVE = false
      console.log('[BOTS-SIDEBAR] - BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE  ', this.BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE)
      console.log('[BOTS-SIDEBAR] - BOTS_LIST_ROUTE_IS_ACTIVE  ', this.BOTS_LIST_ROUTE_IS_ACTIVE)
    } else {
      this.BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE = false
      this.BOTS_LIST_ROUTE_IS_ACTIVE = true
      console.log('[BOTS-SIDEBAR] - BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE  ', this.BOTS_CUSTOMER_SATISFACTION_TEMPALTES_ROUTE_IS_ACTIVE)
      console.log('[BOTS-SIDEBAR] - BOTS_LIST_ROUTE_IS_ACTIVE  ', this.BOTS_LIST_ROUTE_IS_ACTIVE)
    }
    if (this.route.indexOf('bots/templates/increase-sales') !== -1) {
      this.BOTS_INCREASE_SALES_ROUTE_IS_ACTIVE = true
      this.BOTS_LIST_ROUTE_IS_ACTIVE = false
      console.log('[BOTS-SIDEBAR] - BOTS_INCREASE_SALES_ROUTE_IS_ACTIVE  ', this.BOTS_INCREASE_SALES_ROUTE_IS_ACTIVE)
      console.log('[BOTS-SIDEBAR] - BOTS_LIST_ROUTE_IS_ACTIVE  ', this.BOTS_LIST_ROUTE_IS_ACTIVE)
    } else {
      this.BOTS_INCREASE_SALES_ROUTE_IS_ACTIVE = false
      this.BOTS_LIST_ROUTE_IS_ACTIVE = true
      console.log('[BOTS-SIDEBAR] - BOTS_INCREASE_SALES_ROUTE_IS_ACTIVE  ', this.BOTS_INCREASE_SALES_ROUTE_IS_ACTIVE)
      console.log('[BOTS-SIDEBAR] - BOTS_LIST_ROUTE_IS_ACTIVE  ', this.BOTS_LIST_ROUTE_IS_ACTIVE)
    }
  }


  goToBotsList() {
    this.router.navigate(['project/' + this.project._id + '/bots']);
  }

  goToBotAllTemplates() {
    this.router.navigate(['project/' + this.project._id + '/bots/templates/all']);
  }

  goToBotIncreaseSalesTemplates() {
    this.router.navigate(['project/' + this.project._id + '/bots/templates/increase-sales']);
  }

  goToBotCustomerSatisfactionTemplates() {
    this.router.navigate(['project/' + this.project._id + '/bots/templates/customer-satisfaction']);
  }

}
