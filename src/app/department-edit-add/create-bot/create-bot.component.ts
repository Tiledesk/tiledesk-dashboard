import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { slideInOutAnimation } from './../../_animations/index';
import { AppConfigService } from './../../services/app-config.service';
import { BrandService } from './../../services/brand.service';
import { AuthService } from './../../core/auth.service';
import { LoggerService } from './../../services/logger/logger.service';
@Component({
  selector: 'appdashboard-create-bot',
  templateUrl: './create-bot.component.html',
  styleUrls: ['./create-bot.component.scss'],
  animations: [slideInOutAnimation],
  // tslint:disable-next-line:use-host-property-decorator
  host: { '[@slideInOutAnimation]': '' }
})

export class CreateBotComponent implements OnInit {

  public_Key: string;

  projectId: string;
  dgfIsVisible: boolean;
  natIsVisible: boolean;
  tparams:any;

  @Output() valueChange = new EventEmitter();

  constructor(
    public appConfigService: AppConfigService,
    public brandService: BrandService,
    public auth: AuthService,
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
    this.logger.log('[DEPT-EDIT-ADD - CREATE-BOT] AppConfigService getAppConfig public_Key', this.public_Key)
    
    let keys = this.public_Key.split("-");
    // this.logger.log('[DEPT-EDIT-ADD - CREATE-BOT] PUBLIC-KEY - public_Key keys', keys)

    keys.forEach(key => {
      // this.logger.log('NavbarComponent public_Key key', key)
      if (key.includes("DGF")) {
        // this.logger.log('PUBLIC-KEY (SIDEBAR) - key', key);
        let dgf = key.split(":");
        // this.logger.log('[DEPT-EDIT-ADD - CREATE-BOT] PUBLIC-KEY - dgf key&value', dgf);

        if (dgf[1] === "F") {
          this.dgfIsVisible = false;
          // this.logger.log('[DEPT-EDIT-ADD - CREATE-BOT] PUBLIC-KEY - dgf dgfIsVisible', this.dgfIsVisible);
        } else {
          this.dgfIsVisible = true;
          // this.logger.log('[DEPT-EDIT-ADD - CREATE-BOT] PUBLIC-KEY - dgf dgfIsVisible', this.dgfIsVisible);
        }
      }
      if (key.includes("NAT")) {
        // this.logger.log('PUBLIC-KEY (SIDEBAR) - key', key);
        let nat = key.split(":");
        // this.logger.log('[DEPT-EDIT-ADD - CREATE-BOT] PUBLIC-KEY - nat key&value', nat);

        if (nat[1] === "F") {
          this.natIsVisible = false;
          // this.logger.log('[DEPT-EDIT-ADD - CREATE-BOT] PUBLIC-KEY - nat natIsVisible', this.natIsVisible);
        } else {
          this.natIsVisible = true;
          // this.logger.log('[DEPT-EDIT-ADD - CREATE-BOT] PUBLIC-KEY - nat natIsVisible', this.natIsVisible);
        }
      }
    });
  }

  openExternalBotIntegrationTutorial() {
    const url = 'https://developer.tiledesk.com/apis/tutorials/connect-your-own-chatbot';
    window.open(url, '_blank');
  }


  closeCreateBotRightSideBar() {
    this.logger.log('[DEPT-EDIT-ADD - CREATE-BOT] - CALLING CLOSE ')
    this.valueChange.emit(false);
  }


  goToCreateBot(type) {

  }



}
