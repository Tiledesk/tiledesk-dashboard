import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { AuthService } from 'app/core/auth.service';
import { Location } from '@angular/common';
import { NotifyService } from '../../core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '../../services/logger/logger.service';
const swal = require('sweetalert');

@Component({
  selector: 'appdashboard-smtp-settings',
  templateUrl: './smtp-settings.component.html',
  styleUrls: ['./smtp-settings.component.scss']
})
export class SmtpSettingsComponent implements OnInit {
  SENDER_EMAIL_IS_VALID = true;
  SMTP_LOGIN_EMAIL_IS_VALID = true;
  public smtp_host_name: string;
  public smtp_port: string;
  public sender_email_address: string;
  public smtp_usermame: string;
  public smtp_pswd: string;
  public smtp_connetion_security: boolean = false;
  public projectId: string;
  public showPswd: boolean = false;
  public SMTPConfigurationUpdatedSuccessfullyMsg: string;
  public errorUpdatingSMTPConfigurationMsg: string;
  public resetToDefaultsMsg: string;
  public areYouSureMsg: string;
  public thisActionIsNotReversibleMsg: string;
  public sendToMsg: string;
  public sendMsg: string;
  public cancelMsg: string;
  public authenticationFailedMsg: string;
  public anErrorHasOccurredMsg: string;
  isChromeVerGreaterThan100: boolean
  IS_OPEN_SETTINGS_SIDEBAR: boolean;
  
  constructor(
    public projectService: ProjectService,
    private auth: AuthService,
    public location: Location,
    private notify: NotifyService,
    private translate: TranslateService,
    private logger: LoggerService
  ) { }

  ngOnInit() {
    this.subscribeToCurrentProjectAndGetProjectById();
    this.getTranslations();
    this.getBrowserVersion();
    this.listenSidebarIsOpened();
  }

  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[USER-EDIT-ADD] SETTNGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => { 
     this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    //  console.log("[BOT-CREATE] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
   }


  getTranslations() {
    this.translate.get('ProjectEditPage.SMTPConfigurationUpdatedSuccessfully')
      .subscribe((text: string) => {
        this.SMTPConfigurationUpdatedSuccessfullyMsg = text;
      });

    this.translate.get('ProjectEditPage.AnErrorOccurredWhileUpdatingSMTPConfiguration')
      .subscribe((text: string) => {
        this.errorUpdatingSMTPConfigurationMsg = text;
      });

    this.translate.get('ProjectEditPage.AnErrorOccurredWhileUpdatingSMTPConfiguration')
      .subscribe((text: string) => {
        this.errorUpdatingSMTPConfigurationMsg = text;
      });


    this.translate.get('ProjectEditPage.ResetToDefaults')
      .subscribe((text: string) => {
        this.resetToDefaultsMsg = text;
      });

    this.translate.get('AreYouSure')
      .subscribe((text: string) => {
        this.areYouSureMsg = text;
      });

    this.translate.get('ThisActionIsNotReversible')
      .subscribe((text: string) => {
        this.thisActionIsNotReversibleMsg = text;
      });

    this.translate.get('SendTo')
      .subscribe((text: string) => {
        this.sendToMsg = text;
      });

    this.translate.get('Send')
      .subscribe((text: string) => {
        this.sendMsg = text;
      });

    this.translate.get('Cancel')
      .subscribe((text: string) => {
        this.cancelMsg = text;
      });

    this.translate.get('AuthenticationFailed')
      .subscribe((text: string) => {
        this.authenticationFailedMsg = text;
      });

    this.translate.get('AnErrorHasOccurred')
      .subscribe((text: string) => {
        this.anErrorHasOccurredMsg = text;
      });


  }


  subscribeToCurrentProjectAndGetProjectById() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectId = project._id
        this.logger.log('[SMTP-SETTINGS] - projectId ', this.projectId)
        this.getProjectById(this.projectId)
      }
    });
  }

  getProjectById(project_id: string) {
    this.projectService.getProjectById(project_id).subscribe((project: any) => {
      this.logger.log('[SMTP-SETTINGS] - GET PROJECT BY ID - project ', project);

      if (project && project.settings && project.settings.email && project.settings.email.from) {
        this.sender_email_address = project.settings.email.from;
      }

      if (project && project.settings && project.settings.email && project.settings.email.config && project.settings.email.config.host) {
        this.smtp_host_name = project.settings.email.config.host;
      }

      if (project && project.settings && project.settings.email && project.settings.email.config && project.settings.email.config.pass) {
        this.smtp_pswd = project.settings.email.config.pass;
      }

      if (project && project.settings && project.settings.email && project.settings.email.config && project.settings.email.config.port) {
        this.smtp_port = project.settings.email.config.port;
      }

      if (project && project.settings && project.settings.email && project.settings.email.config && project.settings.email.config.secure) {
        this.smtp_connetion_security = project.settings.email.config.secure;
      }

      if (project && project.settings && project.settings.email && project.settings.email.config && project.settings.email.config.user) {
        this.smtp_usermame = project.settings.email.config.user;
      }

    }, error => {
      this.logger.error('[SMTP-SETTINGS] - GET PROJECT BY ID - ERROR ', error);

    }, () => {
      this.logger.log('[SMTP-SETTINGS] - getProjectByID * complete ');
    });
  }


  senderEmailChange(event) {
    this.SENDER_EMAIL_IS_VALID = this.validateEmail(event)
    if (event.length === 0) {
      this.SENDER_EMAIL_IS_VALID = true;
    }
  }

  smtpLoginEmailChange(event) {
    this.SMTP_LOGIN_EMAIL_IS_VALID = this.validateEmail(event)
    if (event.length === 0) {
      this.SMTP_LOGIN_EMAIL_IS_VALID = true;
    }
  }

  validateEmail(email) {
    // tslint:disable-next-line:max-line-length
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return re.test(String(email).toLowerCase());
  }

  goBack() {
    this.location.back();
  }

  showPassword() {
    const show_password_btn = <HTMLElement>document.querySelector('.show-password-btn');
    show_password_btn.blur();
    this.showPswd = !this.showPswd;
  }

  sendSMTPTestEmail() {
    const send_smtp_test_email = <HTMLElement>document.querySelector('.send-smtp-test-email');
    send_smtp_test_email.blur();

    this.logger.log('[SMTP-SETTINGS] - HAS CLICKED SEND TEST EMAIL')

    this.presentModalWithInputSendToAndTestEmailButton()
  }

  presentModalWithInputSendToAndTestEmailButton() {
    swal(this.sendToMsg, {
      content: "input",
      buttons: [this.cancelMsg, this.sendMsg],
    })
      .then((recipientemail) => {
        this.logger.log('[SMTP-SETTINGS] - HAS CLICKED SEND RECIPIENT EMAIL', recipientemail)
        this.sendTestEmail(recipientemail)
      });
  }


  sendTestEmail(recipientemail) {
    this.smtp_usermame, this.smtp_pswd, this.smtp_connetion_security
    // this.smtp_port, this.smtp_connetion_security, this.smtp_usermame, this.smtp_pswd,
    this.projectService.sendTestEmail(recipientemail.toLowerCase(), this.smtp_host_name,  this.smtp_port,this.smtp_connetion_security,  this.smtp_usermame, this.smtp_pswd)
      .subscribe((res: any) => {
      //  console.log('[SMTP-SETTINGS] sendTestEmail res ', res)
        if (res && res.error && res.error.code === "EAUTH") {
          this.notify.showWidgetStyleUpdateNotification(this.authenticationFailedMsg, 4, 'report_problem');
        }

        if (res && res.error && res.error.code !== "EAUTH") {
          this.notify.showWidgetStyleUpdateNotification(this.anErrorHasOccurredMsg, 4, 'report_problem');
        }

      }, (error) => {
        this.logger.error('[SMTP-SETTINGS] sendTestEmail - ERROR ', error);
        this.notify.showWidgetStyleUpdateNotification(this.anErrorHasOccurredMsg, 4, 'report_problem');
      }, () => {
        this.logger.log('[CONTACTS-DTLS] sendTestEmail * COMPLETE *');

      });
  }



  resetToDefaultSMTPConfiguration() {
    this.presentModalResetToDefault()
  }


  // ------------
  presentModalResetToDefault() {
    swal({
      title: this.areYouSureMsg + '?',
      text: this.thisActionIsNotReversibleMsg,
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
      .then((willResetToDefault) => {
        if (willResetToDefault) {
          this.logger.log('[SMTP-SETTINGS] swal willResetToDefault', willResetToDefault)

          this.projectService.resetToDefaultSMPTSettings()
            .subscribe((res: any) => {
              this.logger.log('[SMTP-SETTINGS] in swal willResetToDefault res ', res)

            }, (error) => {
              this.logger.error('[SMTP-SETTINGS] in swal willResetToDefault - ERROR ', error);

            }, () => {
              this.logger.log('[CONTACTS-DTLS] in swal willResetToDefault * COMPLETE *');

            });
        } else {
          this.logger.log('[CONTACTS-DTLS] swal willDelete', willResetToDefault)

        }
      });
  }




  // ----------

  updateSMTPConfiguration() {
    const update_smtp_configuration = <HTMLElement>document.querySelector('.update-smtp-configuration');
    update_smtp_configuration.blur();
    // console.log('[SMTP-SETTINGS] - HAS CLICKED SAVE SMTP SETTINGS')
    // console.log('[SMTP-SETTINGS] - smtp_host_name', this.smtp_host_name)
    // console.log('[SMTP-SETTINGS] - smtp_port', this.smtp_port)
    // console.log('[SMTP-SETTINGS] - sender_email_address', this.sender_email_address)
    // console.log('[SMTP-SETTINGS] - smtp_usermame', this.smtp_usermame)
    // console.log('[SMTP-SETTINGS] - smtp_pswd', this.smtp_pswd)
    // console.log('[SMTP-SETTINGS] - smtp_connetion_security', this.smtp_connetion_security)

    this.projectService.updateSMPTSettings(this.smtp_host_name, this.smtp_port, this.sender_email_address.toLowerCase(), this.smtp_usermame, this.smtp_pswd, this.smtp_connetion_security)
      .subscribe((res: any) => {
        this.logger.log('[[SMTP-SETTINGS] - SAVE SMTP SETTINGS res ', res)
        if (res) {

        }
      }, (error) => {
        this.logger.log('[SMTP-SETTINGS] - SAVE SMTP SETTINGS error ', error);
        this.notify.showWidgetStyleUpdateNotification(this.errorUpdatingSMTPConfigurationMsg, 4, 'report_problem');
      }, () => {
        this.logger.log('[SMTP-SETTINGS] - SAVE SMTP SETTINGS  * COMPLETE *');
        this.notify.showWidgetStyleUpdateNotification(this.SMTPConfigurationUpdatedSuccessfullyMsg, 2, 'done');

      });
  }

}
