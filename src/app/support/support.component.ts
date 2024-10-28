import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/core/auth.service';
import { SUPPORT_OPTIONS, TYPE_URL } from './support-utils';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
import { NotifyService } from 'app/core/notify.service';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'appdashboard-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent extends PricingBaseComponent implements OnInit {

  isChromeVerGreaterThan100: boolean;
  SUPPORT_OPTIONS = SUPPORT_OPTIONS
  cardOptions: { [key: string]: Array<{ key: string, label: string, icon: string, type: TYPE_URL, status: "active" | "inactive", src?: string, description?: string, localIcon?: boolean }> }
  constructor(
    private auth: AuthService,
    public prjctPlanService: ProjectPlanService,
    public notify: NotifyService,
    private logger: LoggerService,
  ) { super(prjctPlanService, notify); }

  ngOnInit(): void {
    this.logger.log('HELP CENTER HELLO !!!!')
    this.getProjectPlan();
    this.getBrowserVersion()

    this.cardOptions = SUPPORT_OPTIONS


    Object.keys(SUPPORT_OPTIONS).forEach(key => {
      this.cardOptions[key] = this.cardOptions[key].filter(el => el.status !== 'inactive')
      this.cardOptions[key].map((el) => {
        el.localIcon = false
        if (el.icon && el.icon.match(new RegExp(/(?=.*?assets|http|https\b)^.*$/))) {
          el.localIcon = true
        }
      })
    })

    let projectBaseInfo = {
      _id: this.prjct_id,
      profile: this.projectProfileData,
      isActiveSubscription: this.subscription_is_active,
      trialExpired: this.trial_expired
    }

    this.logger.log('[SUPPORT] this.cardOptions]', this.cardOptions)
    this.manageWidget("start", projectBaseInfo)
    this.manageWidget('show')

  }

  ngOnDestroy() {
    this.manageWidget("hide")
    // cancellare script
    // cancellare tiledesk da window //
    // 

    this.removelaunchJsScript()
  }

  removelaunchJsScript() {
    const scriptElement = document.getElementById('tiledesk-jssdk');
    this.logger.log('[SUPPORT] scriptElement ', scriptElement)
    if (scriptElement) {
      scriptElement.remove();
      delete window['tiledesk'];
      delete window['Tiledesk'];
    }

    // const scripts = Array.from(document.getElementsByTagName('script'));
    // scripts.forEach(script => {
    //   if (script.id === 'tiledesk-jssdk') {
    //     this.logger.log('[SUPPORT]  script ', script);
    //     script.remove();
    //     delete window['tiledesk']
    //   }
      
    // });

  }

  onCardItemClick(item, section) {
    if (section === 'CONTACT_US') {
      switch (item.key) {
        case 'EMAIL':
        case 'DISCORD':
          window.open(item.src, '_blank')
          break;
        case 'CHAT':
          this.manageWidget('open')
          break;
      }
    }

    if (section === 'SELF_SERVICE') {
      window.open(item.src, '_blank')
    }

  }


  private manageWidget(status: "hide" | "show" | "open" | "close" | "start", projectInfo?: any) {

    this.logger.log('[SUPPORT] manageWidget  window[tiledesk]', window['tiledesk'])
    this.logger.log('[SUPPORT] manageWidget status ', status)
    try {
      if (window && window['tiledesk']) {
        if (status === 'hide') {
          // window['tiledesk'].hide();
          window['tiledesk'].dispose();
        } else if (status === 'show') {
          window['tiledesk'].show();
        } else if (status === 'open') {
          window['tiledesk'].open();
        } else if (status === "close") {
          window['tiledesk'].close();
        }

      }

      if (window && !window['tiledesk']) {
        if (status === "start") {
          window['startWidget']();
          // window['tiledesk_widget_login']();
          // window['tiledesk'].setAttributeParameter({ key: 'payload', value: { project: projectInfo } })
          window['tiledesk_widget_login']({ key: 'payload', value: {project:  projectInfo}});
        }
      }

    } catch (error) {
      this.logger.error('manageWidget ERROR', error)
    }
  }




  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    })
  }

}
