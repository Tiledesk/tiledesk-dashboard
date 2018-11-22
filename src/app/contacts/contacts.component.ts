// tslint:disable:max-line-length
import { Component, OnInit } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Http, Headers, RequestOptions} from '@angular/http';
import { ContactsService } from '../services/contacts.service';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Contact } from '../models/contact-model';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { NotifyService } from '../core/notify.service';

@Component({
  selector: 'appdashboard-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
})
export class ContactsComponent implements OnInit {

  public colours = [
    '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#16a085',
    '#27ae60', '#2980b9', '#8e44ad', '#2c3e50', '#f1c40f', '#e67e22',
    '#e74c3c', '#95a5a6', '#f39c12', '#d35400', '#c0392b', '#bdc3c7', '#7f8c8d'
  ];

  fullText: string;
  pageNo = 0;
  totalPagesNo_roundToUp: number;
  displaysFooterPagination: boolean;
  showSpinner = true;
  fullTextValue: string;
  queryString: string;
  projectId: string;

  contacts: Contact[];

  fullName: string;

  // SWITCH DISPLAYED DATA IN THE MODAL DEPENDING ON WHETHER THE
  // USER CLICK ON DELETE BTN OR ON EDIT BUTTON
  DISPLAY_DATA_FOR_UPDATE_MODAL = false;
  DISPLAY_DATA_FOR_DELETE_MODAL = false;
  // set to none the property display of the modal
  displayDeleteModal = 'none';

  // DATA DISPLAYED IN THE 'DELETE' MODAL
  id_toDelete: string;
  fullName_toDelete: string;

  // DATA DISPLAYED IN THE 'UPDATE' MODAL
  id_toUpdate: string;
  fullName_toUpdate: string;
  CONTACT_IS_VERIFIED = false;

  constructor(
    private http: Http,
    private contactsService: ContactsService,
    private router: Router,
    private auth: AuthService,
    private notify: NotifyService
  ) { }

  ngOnInit() {
    // this.auth.checkRoleForCurrentProject();
    this.getContacts();
    this.getCurrentProject();
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.projectId = project._id
        // console.log('00 -> !!!! CONTACTS project ID from AUTH service subscription  ', this.projectId)
      }
    });
  }

  decreasePageNumber() {
    this.pageNo -= 1;

    console.log('!!!! CONTACTS - DECREASE PAGE NUMBER ', this.pageNo);
    this.getContacts()
  }

  increasePageNumber() {
    this.pageNo += 1;
    console.log('!!!! CONTACTS  - INCREASE PAGE NUMBER ', this.pageNo);
    this.getContacts()
  }

  search() {

    // RESOLVE THE BUG: THE BUTTON SEARCH REMAIN FOCUSED AFTER PRESSED
    const searchBtn = <HTMLElement>document.querySelector('.searchbtn');
    console.log('!!! CONTACTS - SEARCH BTN ', searchBtn)
    searchBtn.blur();

    this.pageNo = 0
    if (this.fullText) {

      this.fullTextValue = this.fullText;
      console.log('!!!! CONTACTS - SEARCH FOR FULL TEXT ', this.fullTextValue);
    } else {
      console.log('!!!! CONTACTS - SEARCH FOR DEPT TEXT ', this.fullText);
      this.fullTextValue = ''
    }

    this.queryString = 'full_text=' + this.fullTextValue;
    console.log('!!!! CONTACTS - SEARCH - QUERY STRING ', this.queryString);

    this.getContacts();
  }

  clearFullText() {
    this.pageNo = 0
    this.fullText = '';

    this.queryString = '';
    console.log('!!!! CONTACTS - CLEAR SEARCH - QUERY STRING ', this.queryString);


    this.getContacts();
  }

  /**
   * GET CONTACTS  */
  getContacts() {
    this.contactsService.getLeads(this.queryString, this.pageNo).subscribe((leads_object: any) => {
      console.log('!!!! CONTACTS - GET LEADS RESPONSE ', leads_object);

      this.contacts = leads_object['leads'];
      console.log('!!!! CONTACTS - CONTACTS LIST ', this.contacts);

      /* to test pagination */
      // const contactsCount = 0;
      const contactsCount = leads_object['count'];
      console.log('!!!! CONTACTS - CONTACTS COUNT ', contactsCount);

      this.displayHideFooterPagination(contactsCount);

      const contactsPerPage = leads_object['perPage'];
      console.log('!!!! CONTACTS - N° OF CONTACTS X PAGE ', contactsCount);

      const totalPagesNo = contactsCount / contactsPerPage;
      console.log('!!!! CONTACTS - TOTAL PAGES NUMBER', totalPagesNo);

      this.totalPagesNo_roundToUp = Math.ceil(totalPagesNo);
      console.log('!!!!! CONTACTS - TOTAL PAGES No ROUND TO UP ', this.totalPagesNo_roundToUp);


      this.generateAvatarFromName(this.contacts);


    }, (error) => {

      console.log('!!!! CONTACTS - GET LEADS - ERROR  ', error);
      this.showSpinner = false;
    }, () => {
      console.log('!!!! CONTACTS - GET LEADS * COMPLETE *');

      this.showSpinner = false;
    });

  }

  displayHideFooterPagination(contacts_count) {
    // DISPLAY / HIDE PAGINATION IN THE FOOTER
    if (contacts_count >= 16) {
      this.displaysFooterPagination = true;
      // tslint:disable-next-line:max-line-length
      console.log('!!!! CONTACTS  ', contacts_count, 'DISPLAY FOOTER PAG ', this.displaysFooterPagination);
    } else {
      this.displaysFooterPagination = false;
      // tslint:disable-next-line:max-line-length
      console.log('!!!! CONTACTS  ', contacts_count, 'DISPLAY FOOTER PAG ', this.displaysFooterPagination);
    }
  }

  generateAvatarFromName(contacts_list) {
    contacts_list.forEach(contact => {

      if (contact) {
        const id_contact = contact._id

        let initial = '';
        let fillColour = ''
        if (contact.fullname) {
          const name = contact.fullname;
          // console.log('!!!!! CONTACTS - NAME OF THE CONTACT ', name);
          initial = name.charAt(0).toUpperCase();
          // console.log('!!!!! CONTACTS - INITIAL OF NAME OF THE CONTACT ', initial);

          const charIndex = initial.charCodeAt(0) - 65
          const colourIndex = charIndex % 19;
          // console.log('!!!!! CONTACTS - COLOUR INDEX ', colourIndex);

          fillColour = this.colours[colourIndex];
          // console.log('!!!!! CONTACTS - NAME INITIAL ', initial, ' COLOUR INDEX ', colourIndex, 'FILL COLOUR ', fillColour);
        } else {

          initial = 'n.a.';
          fillColour = '#eeeeee';
        }

        if (contact.attributes
          && contact.attributes.senderAuthInfo
          && contact.attributes.senderAuthInfo.authVar
          && contact.attributes.senderAuthInfo.authVar.token
          && contact.attributes.senderAuthInfo.authVar.token.firebase
          && contact.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider) {

          if (contact.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider === 'custom') {
            this.CONTACT_IS_VERIFIED = true;
            // console.log('!!!! CONTACTS  - CONTACT_IS_VERIFIED ', this.CONTACT_IS_VERIFIED, 'for id_contact ', id_contact)
          } else {
            this.CONTACT_IS_VERIFIED = false;
            // console.log('!!!! CONTACTS  - CONTACT_IS_VERIFIED ', this.CONTACT_IS_VERIFIED, 'for id_contact ', id_contact)
          }
        } else {
          this.CONTACT_IS_VERIFIED = false;
          // console.log('!!!! CONTACTS  - CONTACT_IS_VERIFIED ', this.CONTACT_IS_VERIFIED, 'for id_contact ', id_contact)
        }

        for (const c of contacts_list) {

          if (c._id === id_contact) {
            // console.log('!!!! CONTACTS  - c._id ', c._id, 'id_contact ', id_contact)
            c.avatar_fill_colour = fillColour;
            c.name_initial = initial
            c.contact_is_verified = this.CONTACT_IS_VERIFIED
          }
        }

      }

    });
  }

  goToContactDetails(requester_id) {
    this.router.navigate(['project/' + this.projectId + '/contact', requester_id]);
  }


  goToEditContact(requester_id) {
    this.router.navigate(['project/' + this.projectId + '/contact/edit', requester_id]);
  }

  /**
 * MODAL DELETE CONTACT
 * @param id
 * @param fullName
 * @param hasClickedDeleteModal
 */
  openDeleteContactModal(id: string, fullName: string) {
    console.log('!!!!! CONTACTS - ON MODAL DELETE OPEN -> USER ID ', id);

    this.displayDeleteModal = 'block';

    this.id_toDelete = id;
    this.fullName_toDelete = fullName;
  }

  // CLOSE MODAL WITHOUT SAVE THE UPDATES OR WITHOUT CONFIRM THE DELETION
  onCloseDeleteModal() {
    this.displayDeleteModal = 'none';
  }

  /**
   * DELETE CONTACT (WHEN THE 'CONFIRM' BUTTON IN MODAL IS CLICKED)  */
  deleteContact() {
    this.displayDeleteModal = 'none';

    this.contactsService.deleteLead(this.id_toDelete)
      .subscribe((lead: any) => {
        console.log('!!!!! CONTACTS - DELETE CONTACT RES ', lead);

        // RE-RUN GET CONTACT TO UPDATE THE TABLE

        this.ngOnInit();
      }, (error) => {
        console.log('!!!!! CONTACTS - DELETE REQUEST - ERROR ', error);
        // =========== NOTIFY ERROR ===========
        this.notify.showNotification('An error occurred while deleting contact', 4, 'report_problem')
      }, () => {
        console.log('!!!!! CONTACTS - DELETE REQUEST * COMPLETE *');
        // =========== NOTIFY SUCCESS===========
        this.notify.showNotification('Contact successfully deleted', 2, 'done');
      });

  }

  // -----------------=============== NOTE: THE CODE BELOW IS NOT USED ===============-----------------
  /**
   * ADD CONTACT  */
  // createContact() {
  //   console.log('MONGO DB FULL-NAME DIGIT BY USER ', this.fullName);
  //   this.contactsService.addMongoDbContacts(this.fullName).subscribe((contact) => {
  //     console.log('POST DATA ', contact);
  //     this.fullName = '';
  //     // RE-RUN GET CONTACT TO UPDATE THE TABLE
  //     // this.getContacts();
  //     this.ngOnInit();
  //   }, (error) => {

  //     console.log('POST REQUEST ERROR ', error);

  //   }, () => {
  //     console.log('POST REQUEST * COMPLETE *');
  //   });

  // }









}
