import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { LoggerService } from '../../services/logger/logger.service';
@Component({
  selector: 'appdashboard-unauthorized-for-project',
  templateUrl: './unauthorized-for-project.component.html',
  styleUrls: ['./unauthorized-for-project.component.scss']
})
export class UnauthorizedForProjectComponent implements OnInit {
  CHAT_PANEL_MODE: boolean;
  constructor(
    private auth: AuthService,
    private router: Router,
    private logger: LoggerService
  ) { }

  ngOnInit() {
    this.CHAT_PANEL_MODE = this.inIframe();
    this.logger.log('[UNAUTHORIZED-FOR-PROJECT] IS IN IFRAME ' , this.CHAT_PANEL_MODE)
  }

  inIframe() {
    try {

      return window.self !== window.parent;
    } catch (e) {
      this.logger.log('[UNAUTHORIZED-FOR-PROJECT] error ' ,e)
      return true;
    }
  }

  // getIfRouteUrlIsRequestForPanel() {
  //   this.CHAT_PANEL_MODE = false
  //   if (this.router.url.indexOf('/request-for-panel') !== -1) {
  //     this.CHAT_PANEL_MODE = true;
  //     this.logger.log('[UNAUTHORIZED-FOR-PROJECT] - CHAT_PANEL_MODE »»» ', this.CHAT_PANEL_MODE);

  //   } else {
  //     this.CHAT_PANEL_MODE = false;
  //     this.logger.log('[UNAUTHORIZED-FOR-PROJECT] - CHAT_PANEL_MODE »»» ', this.CHAT_PANEL_MODE);

  //   }
  // }

  goToProjects() {
    this.logger.log('[UNAUTHORIZED-FOR-PROJECT] HAS CLICCKED GO TO PROJECT ')
    this.router.navigate(['/projects']);
    // (in AUTH SERVICE ) RESET PROJECT_BS AND REMOVE ITEM PROJECT FROM STORAGE WHEN THE USER GO TO PROJECTS PAGE
    this.auth.hasClickedGoToProjects();

  }

}
