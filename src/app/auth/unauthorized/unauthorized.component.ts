import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from 'app/services/app-config.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.scss']
})
export class UnauthorizedComponent implements OnInit {

  projectid: string;
  public_Key: string;
  isVisiblePAY: boolean;

  constructor(
    private router: Router,
    private auth: AuthService,
    public appConfigService: AppConfigService,
    private logger: LoggerService
  ) { }

  ngOnInit() {
    this.getCurrentProject();
    this.getOSCODE();
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[UNAUTHORIZED-PAGE] AppConfigService getAppConfig public_Key', this.public_Key);

    let keys = this.public_Key.split("-");
    this.logger.log('[UNAUTHORIZED-PAGE] PUBLIC-KEY - public_Key keys', keys)

    keys.forEach(key => {

      if (key.includes("PAY")) {

        let pay = key.split(":");

        if (pay[1] === "F") {
          this.isVisiblePAY = false;
          this.logger.log('[UNAUTHORIZED-PAGE] isVisiblePAY', this.isVisiblePAY)
        } else {
          this.isVisiblePAY = true;
          this.logger.log('[UNAUTHORIZED-PAGE] isVisiblePAY', this.isVisiblePAY)
        }
      }

    });


    if (!this.public_Key.includes("PAY")) {
      this.isVisiblePAY = false;
    }
   
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {

        this.projectid = project._id

      }
      // this.logger.log('[BOT-CREATE] 00 -> FAQ-KB EDIT ADD COMP project ID from AUTH service subscription  ', this.project._id)
    });
  }

  goToDashboard() {
    this.router.navigate(['/project/' + this.projectid + '/home']);
  }

}
