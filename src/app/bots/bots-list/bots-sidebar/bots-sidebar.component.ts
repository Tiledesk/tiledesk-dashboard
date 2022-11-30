import { Component, OnInit } from '@angular/core';
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

  constructor(
    private auth: AuthService,
    private logger: LoggerService,
  ) { }

  ngOnInit(): void {
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

}
