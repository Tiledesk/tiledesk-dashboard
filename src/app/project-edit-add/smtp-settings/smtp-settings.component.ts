import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../services/project.service';
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

  constructor(
   public projectService: ProjectService
  ) { }

  ngOnInit() {
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

  sendSMTPTestEmail() {
    console.log('[SMTP-SETTINGS] - HAS CLICKED SEND TEST EMAIL')
  }


  saveSMTPConfiguration() {
    console.log('[SMTP-SETTINGS] - HAS CLICKED SAVE SMTP SETTINGS')
    console.log('[SMTP-SETTINGS] - smtp_host_name', this.smtp_host_name)
    console.log('[SMTP-SETTINGS] - smtp_port', this.smtp_port)
    console.log('[SMTP-SETTINGS] - sender_email_address', this.sender_email_address)
    console.log('[SMTP-SETTINGS] - smtp_usermame', this.smtp_usermame)
    console.log('[SMTP-SETTINGS] - smtp_pswd', this.smtp_pswd)
    console.log('[SMTP-SETTINGS] - smtp_connetion_security', this.smtp_connetion_security)

    this.projectService.updateSMPTSettigs(this.smtp_host_name,  this.smtp_port, this.sender_email_address, this.smtp_usermame, this.smtp_pswd, this.smtp_connetion_security)
    .subscribe((res: any) => {
      console.log('[[SMTP-SETTINGS] - SAVE SMTP SETTINGS res ', res)
      if (res) {
    
      }
    }, (error) => {
      console.log('[SMTP-SETTINGS] - SAVE SMTP SETTINGS error ', error);
    }, () => {
      console.log('[SMTP-SETTINGS] - SAVE SMTP SETTINGS  * COMPLETE *');

    });
  }

}
