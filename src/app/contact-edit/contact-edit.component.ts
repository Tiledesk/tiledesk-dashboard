import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ContactsService } from '../services/contacts.service';
import { NotifyService } from '../core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '../services/logger/logger.service';
import { AuthService } from 'app/core/auth.service';

@Component({
  selector: 'appdashboard-contact-edit',
  templateUrl: './contact-edit.component.html',
  styleUrls: ['./contact-edit.component.scss']
})
export class ContactEditComponent implements OnInit {
  @ViewChild('editleadbtn', { static: false }) edit_lead_btn_ref: ElementRef;
  lead_id: string;
  lead_fullname: string;
  lead_email: string;
  lead_company: string;
  lead_street_address: string;
  lead_city: string;
  lead_state: string;
  lead_postalcode: string;
  lead_country: string;
  lead_phone_number: string;
  lead_note: string;

  lead_fullnameCurrentValue: string;
  lead_emailCurrentValue: string;

  EMAIL_IS_VALID = true;
  HAS_EDIT_FULLNAME = false;
  HAS_EDIT_EMAIL = false;

  editContactSuccessNoticationMsg: string;
  editContactErrorNoticationMsg: string;
  showSpinner = false;
  isChromeVerGreaterThan100: boolean;
  HIDE_GO_BACK_BTN: boolean;
  private fragment: string;
  constructor(
    public location: Location,
    private route: ActivatedRoute,
    private contactsService: ContactsService,
    private notify: NotifyService,
    private translate: TranslateService,
    public auth: AuthService,
    private logger: LoggerService,
    private router: Router
  ) { }

  ngOnInit() {
    this.translateEditContactSuccessMsg();
    this.translateEditContactErrorMsg();
    this.getRequesterIdParamAndThenGetContactById();
    this.getBrowserVersion()
    this.getCurrentRouteUrlToHideDisplayGoToBackBtn()
    this.getFragment()
  }

  getFragment() {
    this.route.fragment.subscribe(fragment => {
      this.fragment = fragment;
      // console.log('[CONTACT-EDIT] - FRAGMENT ', this.fragment)
    });
  }

  ngAfterViewInit(): void {
    try {
      // name of the class of the html div = . + fragment
      setTimeout(() => {
        const fragmentEl = <HTMLElement>document.querySelector('.' + this.fragment)
        // console.log('[CONTACT-EDIT] - QUERY SELECTOR fragmentEl  ', fragmentEl)
        if (fragmentEl) {
          fragmentEl.scrollIntoView();
        }
      }, 1000);
      // document.querySelector('#' + this.fragment).scrollIntoView();
      // this.logger.log( document.querySelector('#' + this.fragment).scrollIntoView())
    } catch (e) {
      // console.error('[CONTACT-EDIT] - QUERY SELECTOR language ERROR  ', e)
    }
  }


  getCurrentRouteUrlToHideDisplayGoToBackBtn() {
    const currentUrl = this.router.url;

    if ((currentUrl.indexOf('/_edit') !== -1)) {
      // console.log('Hide go back btn')
      this.HIDE_GO_BACK_BTN = true
    } else if ((currentUrl.indexOf('/edit') !== -1)) {
      // console.log('display go back btn')
      this.HIDE_GO_BACK_BTN = false
    }
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  console.log("[BOT-CREATE] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }
  // TRANSLATION
  translateEditContactSuccessMsg() {
    this.translate.get('EditContactSuccessNoticationMsg')
      .subscribe((text: string) => {

        this.editContactSuccessNoticationMsg = text;
        // this.logger.log('[CONTACT-EDIT] + + + EditContactSuccessNoticationMsg', text)
      });
  }
  // TRANSLATION
  translateEditContactErrorMsg() {
    this.translate.get('EditContactErrorNoticationMsg')
      .subscribe((text: string) => {

        this.editContactErrorNoticationMsg = text;
        // this.logger.log('[CONTACT-EDIT] + + + EditContactErrorNoticationMsg', text)
      });
  }




  getRequesterIdParamAndThenGetContactById() {
    this.lead_id = this.route.snapshot.params['requesterid'];
    this.logger.log('[CONTACT-EDIT] GET REQUESTER ID PARAM AND THEN GET CONTACT BY ID -> REQUESTER ID ', this.lead_id);

    if (this.lead_id) {
      this.getContactById();
    }
  }

  getContactById() {
    this.showSpinner = true;
    this.contactsService.getLeadById(this.lead_id)
      .subscribe((lead: any) => {

        if (lead) {
          this.logger.log('[CONTACT-EDIT] - GET LEAD BY ID ', lead);
          this.lead_fullname = lead.fullname;
          this.lead_email = lead.email;
          this.lead_company = lead.company;
          this.lead_street_address = lead.streetAddress;
          this.lead_city = lead.city;
          this.lead_state = lead.region;
          this.lead_postalcode = lead.zipcode;
          this.lead_country = lead.country;
          this.lead_phone_number = lead.phone;
          this.lead_note = lead.note;

          // this.lead_fullnameCurrentValue = lead.fullname; // No more used
          // this.lead_emailCurrentValue = lead.email; // No more used
        }
      }, (error) => {
        this.showSpinner = false;

        this.logger.error('[CONTACT-EDIT]  - GET LEAD BY REQUESTER ID - ERROR ', error);
      }, () => {
        this.showSpinner = false;
        this.logger.log('[CONTACT-EDIT]  - GET LEAD BY REQUESTER ID * COMPLETE *');
      });

  }

  editContact() {
    this.HAS_EDIT_FULLNAME = false; // No more used
    this.HAS_EDIT_EMAIL = false; // No more used
    this.EMAIL_IS_VALID = true;
    this.edit_lead_btn_ref.nativeElement.blur();

    if (this.lead_fullname) {
      this.lead_fullname = this.lead_fullname.trim()
    }

    if (this.lead_email) {
      this.lead_email = this.lead_email.trim()
    }

    if (this.lead_company) {
      this.lead_company = this.lead_company.trim()
    }

    if (this.lead_street_address) {
      this.lead_street_address = this.lead_street_address.trim()
    }

    if (this.lead_city) {
      this.lead_city = this.lead_city.trim()
    }

    if (this.lead_state) {
      this.lead_state = this.lead_state.trim()
    }

    if (this.lead_postalcode) {
      this.lead_postalcode = this.lead_postalcode.trim()
    }

    if (this.lead_country) {
      this.lead_country = this.lead_country.trim()
    }

    if (this.lead_phone_number) {
      this.lead_phone_number = this.lead_phone_number.trim()
    }

    if (this.lead_note) {
      this.lead_note = this.lead_note.trim()
    }

    this.contactsService.updateLead(
      this.lead_id,
      this.lead_fullname,
      this.lead_email,
      this.lead_company,
      this.lead_street_address,
      this.lead_city,
      this.lead_state,
      this.lead_postalcode,
      this.lead_country,
      this.lead_phone_number,
      this.lead_note
    )
      .subscribe((contact) => {
        this.logger.log('[CONTACT-EDIT] - UPDATED CONTACT ', contact);

      }, (error) => {

        this.logger.error('[CONTACT-EDIT] - UPDATE CONTACT - ERROR ', error);
        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error occurred while updating contact', 4, 'report_problem');
        this.notify.showWidgetStyleUpdateNotification(this.editContactErrorNoticationMsg, 4, 'report_problem')

      }, () => {
        this.logger.log('[CONTACT-EDIT] - UPDATE CONTACT * COMPLETE *');

        // =========== NOTIFY SUCCESS===========
        // this.notify.showNotification('Contact successfully updated', 2, 'done');
        this.notify.showWidgetStyleUpdateNotification(this.editContactSuccessNoticationMsg, 2, 'done');

      });
  }

  /* !!! no more used */
  // fullnameChange(event) {
  //   this.logger.log('!!!!! EDIT CONTACT - EDITING FULLNAME ', event);
  //   this.logger.log('!!!!! EDIT CONTACT - EDITING FULLNAME CURRENT VALUE ', this.lead_fullnameCurrentValue);
  //   if (event === this.lead_fullnameCurrentValue) {
  //     this.HAS_EDIT_FULLNAME = false;
  //   } else {
  //     this.HAS_EDIT_FULLNAME = true;
  //   }
  // }

  emailChange(event) {
    this.logger.log('[CONTACT-EDIT] - EDITING EMAIL ', event);
    this.logger.log('[CONTACT-EDIT] - EDITING EMAIL length ', event.length);

    // if (event === this.lead_emailCurrentValue) {
    //   this.HAS_EDIT_EMAIL = false;
    // } else {
    //   this.HAS_EDIT_EMAIL = true;
    // }


    this.EMAIL_IS_VALID = this.validateEmail(event)
    this.logger.log('[CONTACT-EDIT] - EMAIL IS VALID ', this.EMAIL_IS_VALID);

    if (event.length === 0) {
      this.EMAIL_IS_VALID = true;
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

}
