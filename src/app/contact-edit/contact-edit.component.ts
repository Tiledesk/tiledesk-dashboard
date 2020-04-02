import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ContactsService } from '../services/contacts.service';
import { NotifyService } from '../core/notify.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'appdashboard-contact-edit',
  templateUrl: './contact-edit.component.html',
  styleUrls: ['./contact-edit.component.scss']
})
export class ContactEditComponent implements OnInit {
  @ViewChild('editleadbtn') private edit_lead_btn_ref: ElementRef;
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
  constructor(
    public location: Location,
    private route: ActivatedRoute,
    private contactsService: ContactsService,
    private notify: NotifyService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.translateEditContactSuccessMsg();
    this.translateEditContactErrorMsg();

    this.getRequesterIdParam();
  }
  // TRANSLATION
  translateEditContactSuccessMsg() {
    this.translate.get('EditContactSuccessNoticationMsg')
      .subscribe((text: string) => {

        this.editContactSuccessNoticationMsg = text;
        // console.log('+ + + EditContactSuccessNoticationMsg', text)
      });
  }
  // TRANSLATION
  translateEditContactErrorMsg() {
    this.translate.get('EditContactErrorNoticationMsg')
      .subscribe((text: string) => {

        this.editContactErrorNoticationMsg = text;
        // console.log('+ + + EditContactErrorNoticationMsg', text)
      });
  }




  getRequesterIdParam() {
    this.lead_id = this.route.snapshot.params['requesterid'];
    console.log('!!!!! EDIT CONTACT - REQUESTER ID ', this.lead_id);

    if (this.lead_id) {
      this.getContactById();
    }
  }

  getContactById() {
    this.showSpinner = true;
    this.contactsService.getLeadById(this.lead_id)
      .subscribe((lead: any) => {

        if (lead) {
          console.log('!!!!! EDIT CONTACT - GET LEAD BY ID ', lead);
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

        console.log('!!!!! EDIT CONTACT  - GET LEAD BY REQUESTER ID - ERROR ', error);
      }, () => {
        this.showSpinner = false;
        console.log('!!!!! EDIT CONTACT  - GET LEAD BY REQUESTER ID * COMPLETE *');
      });

  }

  editContact() {
    this.HAS_EDIT_FULLNAME = false; // No more used
    this.HAS_EDIT_EMAIL = false; // No more used
    this.EMAIL_IS_VALID = true;
    this.edit_lead_btn_ref.nativeElement.blur();



    this.contactsService.updateLead(
      this.lead_id,
      this.lead_fullname.trim(),
      this.lead_email.trim(),
      this.lead_company.trim(),
      this.lead_street_address.trim(),
      this.lead_city.trim(),
      this.lead_state.trim(),
      this.lead_postalcode.trim(),
      this.lead_country.trim(),
      this.lead_phone_number.trim(),
      this.lead_note.trim()
    )
      .subscribe((contact) => {
        console.log('!!!!! EDIT CONTACT - UPDATED CONTACT ', contact);

      }, (error) => {

        console.log('!!!!! EDIT CONTACT - UPDATE CONTACT - ERROR ', error);
        // =========== NOTIFY ERROR ===========
        // this.notify.showNotification('An error occurred while updating contact', 4, 'report_problem');
        this.notify.showWidgetStyleUpdateNotification(this.editContactErrorNoticationMsg, 4, 'report_problem')

      }, () => {
        console.log('!!!!! EDIT CONTACT - UPDATE CONTACT * COMPLETE *');

        // =========== NOTIFY SUCCESS===========
        // this.notify.showNotification('Contact successfully updated', 2, 'done');
        this.notify.showWidgetStyleUpdateNotification(this.editContactSuccessNoticationMsg, 2, 'done');

      });
  }

  /* !!! no more used */
  // fullnameChange(event) {
  //   console.log('!!!!! EDIT CONTACT - EDITING FULLNAME ', event);
  //   console.log('!!!!! EDIT CONTACT - EDITING FULLNAME CURRENT VALUE ', this.lead_fullnameCurrentValue);
  //   if (event === this.lead_fullnameCurrentValue) {
  //     this.HAS_EDIT_FULLNAME = false;
  //   } else {
  //     this.HAS_EDIT_FULLNAME = true;
  //   }
  // }

  emailChange(event) {
    console.log('!!!!! EDIT CONTACT - EDITING EMAIL ', event);
    console.log('!!!!! EDIT CONTACT - EDITING EMAIL length ', event.length);

    // if (event === this.lead_emailCurrentValue) {
    //   this.HAS_EDIT_EMAIL = false;
    // } else {
    //   this.HAS_EDIT_EMAIL = true;
    // }


    this.EMAIL_IS_VALID = this.validateEmail(event)
    console.log('!!!!! EDIT CONTACT - EMAIL IS VALID ', this.EMAIL_IS_VALID);

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
