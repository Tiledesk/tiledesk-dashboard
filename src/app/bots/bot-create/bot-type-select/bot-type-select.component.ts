import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';
import { Location } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { AppConfigService } from '../../../services/app-config.service';

// import brand from 'assets/brand/brand.json';
import { BrandService } from '../../../services/brand.service';
import { LoggerService } from '../../../services/logger/logger.service';
import { URL_configure_your_first_chatbot, URL_connect_your_dialogflow_agent } from '../../../utils/util';

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
  rasaIsVisible: boolean;
  tilebotIsVisible: boolean;
  show3Card: boolean;
  // tparams = brand;
  tparams: any;
  isChromeVerGreaterThan100: boolean;
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
    this.getBrowserVersion();
    this.getCurrentProject()
    this.getOSCODE();
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  console.log("[BOT-TYPE-SELECT] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
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
        //  console.log('PUBLIC-KEY (BOT-TYPE-SELECT) - dgf dgfIsVisible', this.dgfIsVisible);
        } else {
          this.dgfIsVisible = true;
          // console.log('PUBLIC-KEY (BOT-TYPE-SELECT) - dgf dgfIsVisible', this.dgfIsVisible);
        }
      }
      if (key.includes("NAT")) {
        // this.logger.log('PUBLIC-KEY (SIDEBAR) - key', key);
        let nat = key.split(":");
        // console.log('PUBLIC-KEY (BOT-TYPE-SELECT) - nat key&value', nat);

        if (nat[1] === "F") {
          this.natIsVisible = false;
          // console.log('PUBLIC-KEY (BOT-TYPE-SELECT) - nat natIsVisible', this.natIsVisible);
        } else {
          this.natIsVisible = true;
          // console.log('PUBLIC-KEY (BOT-TYPE-SELECT) - nat natIsVisible', this.natIsVisible);
        }
      }

      if (key.includes("RAS")) {
        // this.logger.log('PUBLIC-KEY (SIDEBAR) - key', key);
        let rasa = key.split(":");
        // console.log('PUBLIC-KEY (BOT-TYPE-SELECT) - rasa key&value',rasa);
        if (rasa[1] === "F") {
          this.rasaIsVisible = false;
          //  console.log('PUBLIC-KEY (BOT-TYPE-SELECT) - rasa rasaIsVisible', this.rasaIsVisible);
        } else {
          this.rasaIsVisible = true;
          // console.log('PUBLIC-KEY (BOT-TYPE-SELECT) - rasa rasaIsVisible', this.rasaIsVisible);
        }
      }

      if (key.includes("TIL")) {
        // this.logger.log('PUBLIC-KEY (SIDEBAR) - key', key);
        let tb = key.split(":");
        // this.logger.log('PUBLIC-KEY (BOT-TYPE-SELECT) - nat key&value', nat);
        if (tb[1] === "F") {
          this.tilebotIsVisible = false;
          // console.log('PUBLIC-KEY (BOT-TYPE-SELECT) - rasa tilebotIsVisible', this.tilebotIsVisible);
        } else {
          this.tilebotIsVisible = true;
          // console.log('PUBLIC-KEY (BOT-TYPE-SELECT) - rasa tilebotIsVisible', this.tilebotIsVisible);
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

    if (!this.public_Key.includes("RAS")) {
      // this.logger.log('PUBLIC-KEY (BOT-TYPE-SELECT) - key.includes("PAY")', this.public_Key.includes("DGF"));
      this.rasaIsVisible = false;
    }

    if (!this.public_Key.includes("TIL")) {
      // this.logger.log('PUBLIC-KEY (BOT-TYPE-SELECT) - key.includes("PAY")', this.public_Key.includes("DGF"));
      this.tilebotIsVisible = false;
    }

    if (this.dgfIsVisible === true && this.natIsVisible === true && this.rasaIsVisible === true) {
    }
  }




  goToCreateBot(type: string) {
    //  console.log('[BOT-TYPE-SELECT] Bot Type Selected type ', type)
    if (type !== 'native' && type !== 'tilebot') {
      this.router.navigate(['project/' + this.projectId + '/bots/create/' + type]);
    } else if (type === 'native') {
      this.router.navigate(['project/' + this.projectId + '/bots/prebuilt']);
      // this.router.navigate(['project/' + this.projectId + '/bots/create/' + type]);

    } else if (type === 'tilebot') {
      // console.log('[BOT-TYPE-SELECT] HERE Y ')
      this.router.navigate(['project/' + this.projectId + '/tilebot/prebuilt']);
    }
  }

  goToCreateRasaBot() {
    this.router.navigate(['project/' + this.projectId + '/bot/rasa/create']);
  }

  goBack() {
    this.location.back();
  }

  openExternalBotIntegrationTutorial() {
    const url = 'https://developer.tiledesk.com/external-chatbot/connect-your-own-chatbot';

    window.open(url, '_blank');
  }

  openDocsTiledeskCreateABot() {

    // const url = 'https://gethelp.tiledesk.com/articles/configure-your-first-chatbot/';
    const url = URL_configure_your_first_chatbot;
    window.open(url, '_blank');
  }

  openDocsTiledeskDialogflowConnector() {
    // const url = 'https://docs.tiledesk.com/knowledge-base/connect-your-dialogflow-agent/'; // NOT FOUND on gethelp
    const url = URL_connect_your_dialogflow_agent
    window.open(url, '_blank');
  }


  openRasaIntegrationTutorial() {
    const url = 'https://gethelp.tiledesk.com/articles/rasa-ai-integration/';
    window.open(url, '_blank');
  }


}
