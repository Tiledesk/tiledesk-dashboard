import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { NotifyService } from 'app/core/notify.service';
import { ContactsService } from 'app/services/contacts.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'appdashboard-contact-info',
  templateUrl: './contact-info.component.html',
  styleUrls: ['./contact-info.component.scss']
})
export class ContactInfoComponent implements OnInit, OnChanges, OnDestroy {
  @Input() contact_details: any;
  public CHAT_PANEL_MODE: boolean;
  public project_name: string;
  private unsubscribe$: Subject<any> = new Subject<any>();
  public id_project: string;
  public contactNewEmail: string;
  public EMAIL_IS_VALID: boolean = true
  public contactCompany: string;
  public contactPhone: string;


  constructor(
    public router: Router,
    public auth: AuthService,
    public contactsService: ContactsService,
    public notify: NotifyService,
  ) { }


  // -------------------------------------------------------------
  // @ Lifehook
  // -------------------------------------------------------------
  ngOnInit(): void {
    this.getIfRouteUrlIsRequestForPanel();
    this.getCurrentProject();
  }

  ngOnChanges() {
    console.log('[CONTACT-INFO] contact_details', this.contact_details)
    if (this.contact_details) {

      if (this.contact_details.email) {
        this.contactNewEmail = this.contact_details.email
        console.log('contactNewEmail ', this.contactNewEmail)
      }

      if (this.contact_details.company) {
        this.contactCompany = this.contact_details.company
        console.log('contactCompany ', this.contactCompany)
      }

      if (this.contact_details.phone) {
        this.contactPhone = this.contact_details.phone
        console.log('contactPhone ', this.contactPhone)
      }

      

    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


  getIfRouteUrlIsRequestForPanel() {
    this.CHAT_PANEL_MODE = false
    if (this.router.url.indexOf('/request-for-panel') !== -1) {
      this.CHAT_PANEL_MODE = true;
      console.log('[CONTACT-INFO] - CHAT_PANEL_MODE »»» ', this.CHAT_PANEL_MODE);


    } else {
      this.CHAT_PANEL_MODE = false;
      console.log('[CONTACT-INFO] - CHAT_PANEL_MODE »»» ', this.CHAT_PANEL_MODE);
    }
  }

  // -------------------------------------------------------------
  // @ Subscribe to current project
  // -------------------------------------------------------------
  getCurrentProject() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {

        if (project) {
          console.log('[CONTACT-INFO] GET CURRENT PROJECT project._id (NEW)', project._id)
          console.log('[CONTACT-INFO] GET CURRENT PROJECT this.project_id (OLD)', this.id_project)

          this.id_project = project._id;
          this.project_name = project.name;
        }
      });
  }


  emailChange(event) {
    this.EMAIL_IS_VALID = this.validateEmail(event)
    console.log('[CONTACT-INFO] ON EMAIL CHANGE EMAIL_IS_VALID ', this.EMAIL_IS_VALID)
  }

  validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  editContactEmail() {
    console.log('[CONTACT-INFO] editContactEmail contactNewEmail', this.contactNewEmail)
    if (this.EMAIL_IS_VALID && this.contactNewEmail !== undefined) {
      this.updateContactemail(this.contact_details._id, this.contactNewEmail);
    }
  }

  removeEmailAnUpdateContact() {
    this.contactNewEmail = ''
    console.log('[CONTACT-INFO] removeEmailAnUpdateContact contactNewEmail', this.contactNewEmail)
    this.updateContactemail(this.contact_details._id, this.contactNewEmail);
  }

 

  updateContactemail(contatid: string, contatemail: string) {
    this.contactsService.updateLeadEmail(contatid, contatemail)
      .subscribe((contact) => {
        console.log('[CONTACT-INFO] - UPDATED CONTACT ', contact);
      }, (error) => {
        console.error('[CONTACT-INFO] - UPDATE CONTACT - ERROR ', error);
        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error occurred while updating contact', 4, 'report_problem');
      }, () => {
        console.log('[CONTACT-INFO] - UPDATE CONTACT * COMPLETE *');
        // =========== NOTIFY SUCCESS===========
        this.notify.showWidgetStyleUpdateNotification('Contact successfully updated', 2, 'done')
      });
  }


  editContactCompany() {
    if (this.contactCompany !== undefined) {
      this.updateContactCompany(this.contact_details._id, this.contactCompany)
    }
  }



  removeCompanyAnUpdateContact() {
    this.contactCompany = '';
    this.updateContactCompany(this.contact_details._id, this.contactCompany)
  }

  editContactPhone() {
    if (this.contactPhone !== undefined) {
      this.updateContactPhone(this.contact_details._id, this.contactPhone)
    }
  }

  removePhoneAnUpdateContact(){
    this.contactPhone =""
    this.updateContactPhone(this.contact_details._id, this.contactPhone)
  }

 
  updateContactCompany(contactid, contactcompany) {
    this.contactsService.updateLeadCompany(
      contactid,
      contactcompany
    ).subscribe((contact) => {
      console.log('[CONTACT-EDIT] - UPDATED CONTACT updateCompany', contact);

    }, (error) => {

      console.error('[CONTACT-EDIT] - UPDATE CONTACT updateCompany - ERROR ', error);
      // =========== NOTIFY ERROR ===========
      // this.notify.showNotification('An error occurred while updating contact', 4, 'report_problem');
      // this.notify.showWidgetStyleUpdateNotification(this.editContactErrorNoticationMsg, 4, 'report_problem')

    }, () => {
      console.error('[CONTACT-EDIT] - UPDATE CONTACT updateCompany - COMPLETED ');
      this.notify.showWidgetStyleUpdateNotification('Contact successfully updated', 2, 'done')
    })

  }


  updateContactPhone(contactid, contactphone) {
    this.contactsService.updateLeadPhone(
      contactid,
      contactphone
    ).subscribe((contact) => {
      console.log('[CONTACT-EDIT] - UPDATED CONTACT updateContactPhone', contact);

    }, (error) => {

      console.error('[CONTACT-EDIT] - UPDATE CONTACT updateContactPhone - ERROR ', error);
      // =========== NOTIFY ERROR ===========
      // this.notify.showNotification('An error occurred while updating contact', 4, 'report_problem');
      // this.notify.showWidgetStyleUpdateNotification(this.editContactErrorNoticationMsg, 4, 'report_problem')

    }, () => {
      console.error('[CONTACT-EDIT] - UPDATE CONTACT updateContactPhone - COMPLETED ');
      this.notify.showWidgetStyleUpdateNotification('Contact successfully updated', 2, 'done')
    })

  }


}
