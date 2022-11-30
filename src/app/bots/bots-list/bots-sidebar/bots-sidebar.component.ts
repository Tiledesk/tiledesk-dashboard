import { Component, OnInit } from '@angular/core';
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
export class BotsSidebarComponent implements OnInit {


  USER_ROLE: any
  project: any
  route: string
  IS_OPEN: boolean = true
  private unsubscribe$: Subject<any> = new Subject<any>();

  public BOTS_LIST_ROUTE_IS_ACTIVE: boolean;
  public BOT_TEMPALTE_ROUTE_IS_ACTIVE: boolean;

  constructor(
    private auth: AuthService,
    private logger: LoggerService,
    public router: Router,
  ) { }

  ngOnInit(): void {
    this.getCurrentRoute()
    this.listenSidebarIsOpened() 
    this.getCurrentProject();
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
    })
  }

  toggletBotsSidebar(IS_OPEN) {
    this.IS_OPEN = IS_OPEN;
    this.auth.togglebotsSidebar(IS_OPEN)
  }

  getCurrentRoute() {
    this.route = this.router.url
    if (this.route.indexOf('/bots') !== -1) {
      this.BOTS_LIST_ROUTE_IS_ACTIVE = true
      console.log('[BOTS-SIDEBAR] - BOTS_LIST_ROUTE_IS_ACTIVE  ', this.BOTS_LIST_ROUTE_IS_ACTIVE)
    } else {
      this.BOTS_LIST_ROUTE_IS_ACTIVE = false
      // console.log('[NATIVE-BOT-SIDEBAR] - GENERAL_ROUTE_IS_ACTIVE  ', this.GENERAL_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/bots/templates') !== -1) {
      this.BOT_TEMPALTE_ROUTE_IS_ACTIVE = true
      console.log('[BOTS-SIDEBAR] - BOT_TEMPALTE_ROUTE_IS_ACTIVE  ', this.BOT_TEMPALTE_ROUTE_IS_ACTIVE)
    } else {
      this.BOT_TEMPALTE_ROUTE_IS_ACTIVE = false
      console.log('[BOTS-SIDEBAR] - BOT_TEMPALTE_ROUTE_IS_ACTIVE  ', this.BOT_TEMPALTE_ROUTE_IS_ACTIVE)
    }
  }


  goToBotsList() {
    this.router.navigate(['project/' + this.project._id + '/bots']);
  }

  goToBotTemplates() {
    this.router.navigate(['project/' + this.project._id + '/bots/templates']);
  }

}
