import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from 'app/services/app-config.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'appdashboard-unauthorized-token',
  templateUrl: './unauthorized-token.component.html',
  styleUrls: ['./unauthorized-token.component.scss']
})
export class UnauthorizedTokenComponent implements OnInit {
  public_Key: string;
  isVisiblePAY: boolean;
  constructor(
    public auth: AuthService,
    private router: Router,
    public appConfigService: AppConfigService,
    private logger: LoggerService
  ) {

  }

  ngOnInit(): void {
    this.getOSCODE()
  }


  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[UNAUTHORIZED-TOKEN-PAGE] AppConfigService getAppConfig public_Key', this.public_Key);

    let keys = this.public_Key.split("-");
    this.logger.log('[UNAUTHORIZED-PAGE] PUBLIC-KEY - public_Key keys', keys)

    keys.forEach(key => {

      if (key.includes("PAY")) {

        let pay = key.split(":");

        if (pay[1] === "F") {
          this.isVisiblePAY = false;
          this.logger.log('[UNAUTHORIZED-TOKEN-PAGE] isVisiblePAY', this.isVisiblePAY)
        } else {
          this.isVisiblePAY = true;
          this.logger.log('[UNAUTHORIZED-TOKEN-PAGE] isVisiblePAY', this.isVisiblePAY)
        }
      }

    });


    if (!this.public_Key.includes("PAY")) {
      this.isVisiblePAY = false;
    }

  }


  goToLoginPage() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.auth.signOut('unauthorized-token');
    } else {
      this.router.navigate(['/login'])
    }
  }

}
