import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { LoggerService } from '../../services/logger/logger.service';
import { AppConfigService } from 'app/services/app-config.service';
@Component({
  selector: 'appdashboard-unauthorized-for-project',
  templateUrl: './unauthorized-for-project.component.html',
  styleUrls: ['./unauthorized-for-project.component.scss']
})
export class UnauthorizedForProjectComponent implements OnInit {
  CHAT_PANEL_MODE: boolean;
  public_Key: string;
  isVisiblePAY: boolean;
  constructor(
    private auth: AuthService,
    private router: Router,
    private logger: LoggerService,
    public appConfigService: AppConfigService,
  ) { }

  ngOnInit() {
    this.CHAT_PANEL_MODE = this.inIframe();
    this.getOSCODE();
    this.logger.log('[UNAUTHORIZED-FOR-PROJECT] IS IN IFRAME ', this.CHAT_PANEL_MODE)
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[UNAUTHORIZED-FOR-PROJECT] AppConfigService getAppConfig public_Key', this.public_Key);

    let keys = this.public_Key.split("-");
    this.logger.log('[UNAUTHORIZED-FOR-PROJECT] PUBLIC-KEY - public_Key keys', keys)

    keys.forEach(key => {

      if (key.includes("PAY")) {

        let pay = key.split(":");

        if (pay[1] === "F") {
          this.isVisiblePAY = false;
          this.logger.log('[UNAUTHORIZED-FOR-PROJECT] isVisiblePAY', this.isVisiblePAY)
        } else {
          this.isVisiblePAY = true;
          this.logger.log('[UNAUTHORIZED-FOR-PROJECT] isVisiblePAY', this.isVisiblePAY)
        }
      }

    });


    if (!this.public_Key.includes("PAY")) {
      this.isVisiblePAY = false;
    }

  }

  inIframe() {
    try {

      return window.self !== window.parent;
    } catch (e) {
      this.logger.log('[UNAUTHORIZED-FOR-PROJECT] error ', e)
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
