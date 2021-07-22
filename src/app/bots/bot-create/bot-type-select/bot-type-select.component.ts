import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { Location } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { AppConfigService } from '../../../services/app-config.service';

// import brand from 'assets/brand/brand.json';
import { BrandService } from '../../../services/brand.service';
import { LoggerService } from '../../../services/logger/logger.service';

@Component({
  selector: 'appdashboard-bot-type-select',
  templateUrl: './bot-type-select.component.html',
  styleUrls: ['./bot-type-select.component.scss']
})
export class BotTypeSelectComponent implements OnInit {
  
  // public_Key = environment.t2y12PruGU9wUtEGzBJfolMIgK; // now get from appconfig
  public_Key: string;

  projectId: string;
  dgfIsVisible: boolean;
  natIsVisible: boolean;

  // tparams = brand;
  tparams:any;

  constructor(
    private router: Router,
    public location: Location,
    public auth: AuthService,
    public appConfigService: AppConfigService,
    public brandService: BrandService,
    private logger: LoggerService
  ) {

    const brand = brandService.getBrand();
    this.tparams = brand;
   }

  ngOnInit() {
    this.getCurrentProject()
    this.getOSCODE();
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.projectId = project._id;
      }
    });
  }


  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[BOT-TYPE-SELECT] AppConfigService getAppConfigpublic_Key', this.public_Key)
    
    let keys = this.public_Key.split("-");
    // this.logger.log('PUBLIC-KEY (BOT-TYPE-SELECT) - public_Key keys', keys)

    keys.forEach(key => {
      // this.logger.log('NavbarComponent public_Key key', key)
      if (key.includes("DGF")) {
        // this.logger.log('PUBLIC-KEY (SIDEBAR) - key', key);
        let dgf = key.split(":");
        // this.logger.log('PUBLIC-KEY (BOT-TYPE-SELECT) - dgf key&value', dgf);

        if (dgf[1] === "F") {
          this.dgfIsVisible = false;
          // this.logger.log('PUBLIC-KEY (BOT-TYPE-SELECT) - dgf dgfIsVisible', this.dgfIsVisible);
        } else {
          this.dgfIsVisible = true;
          // this.logger.log('PUBLIC-KEY (BOT-TYPE-SELECT) - dgf dgfIsVisible', this.dgfIsVisible);
        }
      }
      if (key.includes("NAT")) {
        // this.logger.log('PUBLIC-KEY (SIDEBAR) - key', key);
        let nat = key.split(":");
        // this.logger.log('PUBLIC-KEY (BOT-TYPE-SELECT) - nat key&value', nat);

        if (nat[1] === "F") {
          this.natIsVisible = false;
          // this.logger.log('PUBLIC-KEY (BOT-TYPE-SELECT) - nat natIsVisible', this.natIsVisible);
        } else {
          this.natIsVisible = true;
          // this.logger.log('PUBLIC-KEY (BOT-TYPE-SELECT) - nat natIsVisible', this.natIsVisible);
        }
      }
    });

    if (!this.public_Key.includes("DGF")) {
      // this.logger.log('PUBLIC-KEY (BOT-TYPE-SELECT) - key.includes("PAY")', this.public_Key.includes("DGF"));
      this.dgfIsVisible = false;
    }

    if (!this.public_Key.includes("NAT")) {
      // this.logger.log('PUBLIC-KEY (BOT-TYPE-SELECT) - key.includes("PAY")', this.public_Key.includes("DGF"));
      this.natIsVisible = false;
    }
  }




  goToCreateBot(type: string) {
    this.logger.log('[BOT-TYPE-SELECT] Bot Type Selected type ', type)
    this.router.navigate(['project/' + this.projectId + '/bots/create/' + type]);
  }

  goBack() {
    this.location.back();
  }

  openExternalBotIntegrationTutorial() {
    const url = 'https://developer.tiledesk.com/external-chatbot/connect-your-own-chatbot';
    window.open(url, '_blank');
  }

  openDocsTiledeskCreateABot() {
    const url = 'https://docs.tiledesk.com/knowledge-base/configure-your-first-chatbot/';
    window.open(url, '_blank');
  }

  openDocsTiledeskDialogflowConnector() {
    const url = 'https://docs.tiledesk.com/knowledge-base/connect-your-dialogflow-agent/';
    window.open(url, '_blank');
  }



}
