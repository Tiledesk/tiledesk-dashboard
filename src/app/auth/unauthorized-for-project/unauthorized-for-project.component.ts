import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { LoggerService } from 'app/services/chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from 'app/services/chat21-core/providers/logger/loggerInstance';
@Component({
  selector: 'appdashboard-unauthorized-for-project',
  templateUrl: './unauthorized-for-project.component.html',
  styleUrls: ['./unauthorized-for-project.component.scss']
})
export class UnauthorizedForProjectComponent implements OnInit {
  CHAT_PANEL_MODE: boolean;
  private logger: LoggerService = LoggerInstance.getInstance();

  constructor(
    private auth: AuthService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.CHAT_PANEL_MODE = this.inIframe();
    this.logger.log('[UNAUTHORIZED-FOR-PROJECT] IS IN IFRAME ' , this.CHAT_PANEL_MODE)
  }

  inIframe() {
    try {

      return window.self !== window.top;
    } catch (e) {
      this.logger.log('[UNAUTHORIZED-FOR-PROJECT] error ' ,e)
      return true;
    }
  }

  // getIfRouteUrlIsRequestForPanel() {
  //   this.CHAT_PANEL_MODE = false
  //   if (this.router.url.indexOf('/request-for-panel') !== -1) {
  //     this.CHAT_PANEL_MODE = true;
  //     console.log('[UNAUTHORIZED-FOR-PROJECT] - CHAT_PANEL_MODE »»» ', this.CHAT_PANEL_MODE);

  //   } else {
  //     this.CHAT_PANEL_MODE = false;
  //     console.log('[UNAUTHORIZED-FOR-PROJECT] - CHAT_PANEL_MODE »»» ', this.CHAT_PANEL_MODE);

  //   }
  // }

  goToProjects() {
    this.logger.log('[UNAUTHORIZED-FOR-PROJECT] HAS CLICCKED GO TO PROJECT ')
    this.router.navigate(['/projects']);
    // (in AUTH SERVICE ) RESET PROJECT_BS AND REMOVE ITEM PROJECT FROM STORAGE WHEN THE USER GO TO PROJECTS PAGE
    this.auth.hasClickedGoToProjects();

  }

}
