// tslint:disable:max-line-length
import { Component, OnInit } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Http, Headers, RequestOptions} from '@angular/http';
import { ContactsService } from '../services/contacts.service';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Contact } from '../models/contact-model';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

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
  display = 'none';

  // DATA DISPLAYED IN THE 'DELETE' MODAL
  id_toDelete: string;
  fullName_toDelete: string;

  // DATA DISPLAYED IN THE 'UPDATE' MODAL
  id_toUpdate: string;
  fullName_toUpdate: string;

  constructor(
    private http: Http,
    private contactsService: ContactsService,
    private router: Router,
    private auth: AuthService
  ) { }

  ngOnInit() {
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

  generateAvatarFromName(contacts_list) {
    contacts_list.forEach(contact => {
      const id_contact = contact._id
      const name = contact.fullname;
      // console.log('!!!!! CONTACTS - NAME OF THE CONTACT ', name);
      const initial = name.charAt(0).toUpperCase();
      // console.log('!!!!! CONTACTS - INITIAL OF NAME OF THE CONTACT ', initial);

      const charIndex = initial.charCodeAt(0) - 65
      const colourIndex = charIndex % 19;
      // console.log('!!!!! CONTACTS - COLOUR INDEX ', colourIndex);

      const fillColour = this.colours[colourIndex];
      // console.log('!!!!! CONTACTS - FILL COLOUR ', fillColour);

      for (const c of contacts_list) {
        if (c._id === id_contact) {
          c.avatar_fill_colour = fillColour;
          c.name_initial = initial
        }
      }

    });
  }

  goToContactDetails(requester_id) {
    this.router.navigate(['project/' + this.projectId + '/contact', requester_id]);
  }


  // -----------------=============== NOTE: THE CODE BELOW IS NOT USED ===============-----------------
  /**
   * ADD CONTACT  */
  createContact() {
    console.log('MONGO DB FULL-NAME DIGIT BY USER ', this.fullName);
    this.contactsService.addMongoDbContacts(this.fullName).subscribe((contact) => {
      console.log('POST DATA ', contact);
      this.fullName = '';
      // RE-RUN GET CONTACT TO UPDATE THE TABLE
      // this.getContacts();
      this.ngOnInit();
    },
      (error) => {

        console.log('POST REQUEST ERROR ', error);

      },
      () => {
        console.log('POST REQUEST * COMPLETE *');
      });

  }

  /**
   * MODAL DELETE CONTACT
   * @param id
   * @param fullName
   * @param hasClickedDeleteModal
   */
  openDeleteModal(id: string, fullName: string, hasClickedDeleteModal: boolean) {
    console.log('HAS CLICKED OPEN DELETE MODAL TO CONFIRM BEFORE TO DELETE ', hasClickedDeleteModal);
    console.log('ON MODAL DELETE OPEN -> USER ID ', id);
    this.DISPLAY_DATA_FOR_DELETE_MODAL = hasClickedDeleteModal;
    this.DISPLAY_DATA_FOR_UPDATE_MODAL = false;

    if (hasClickedDeleteModal) {
      this.display = 'block';
    }

    this.id_toDelete = id;
    this.fullName_toDelete = fullName;
  }

  /**
   * DELETE CONTACT (WHEN THE 'CONFIRM' BUTTON IN MODAL IS CLICKED)  */
  onCloseDeleteModalHandled() {
    this.display = 'none';

    this.contactsService.deleteMongoDbContact(this.id_toDelete).subscribe((contact: any) => {
      console.log('DELETE CONTACT ', contact);

      // RE-RUN GET CONTACT TO UPDATE THE TABLE
      // this.getContacts();
      this.ngOnInit();
    },
      (error) => {
        console.log('DELETE REQUEST ERROR ', error);
      },
      () => {
        console.log('DELETE REQUEST * COMPLETE *');
      });

  }

  /**
   * MODAL UPDATE CONTACT
   * @param id
   * @param fullName
   * @param hasClickedUpdateModal
   */
  openUpdateModal(id: string, fullName: string, hasClickedUpdateModal: boolean) {
    // display the modal windows (change the display value in the view)
    console.log('HAS CLICKED OPEN MODAL TO UPDATE USER DATA ', hasClickedUpdateModal);
    this.DISPLAY_DATA_FOR_UPDATE_MODAL = hasClickedUpdateModal;
    this.DISPLAY_DATA_FOR_DELETE_MODAL = false;

    if (hasClickedUpdateModal) {
      this.display = 'block';
    }

    console.log('ON MODAL OPEN -> CONTACT ID ', id);
    console.log('ON MODAL OPEN -> CONTACT FULL-NAME TO UPDATE', fullName);

    this.id_toUpdate = id;
    this.fullName_toUpdate = fullName;
  }

  /**
   * UPDATE CONTACT (WHEN THE 'SAVE' BUTTON IN MODAL IS CLICKED)
   */
  onCloseUpdateModalHandled() {
    // HIDE THE MODAL
    this.display = 'none';

    console.log('ON MODAL UPDATE CLOSE -> CONTACT ID ', this.id_toUpdate);
    console.log('ON MODAL UPDATE CLOSE -> CONTACT FULL-NAME UPDATED ', this.fullName_toUpdate);
    this.contactsService.updateMongoDbContact(this.id_toUpdate, this.fullName_toUpdate).subscribe((contact) => {
      console.log('PUT DATA (UPDATED CONTACT) ', contact);

      // RE-RUN GET CONTACT TO UPDATE THE TABLE
      // this.getContacts();
      this.ngOnInit();
    },
      (error) => {

        console.log('PUT REQUEST ERROR ', error);

      },
      () => {
        console.log('PUT REQUEST * COMPLETE *');
      });
  }

  // CLOSE MODAL WITHOUT SAVE THE UPDATES OR WITHOUT CONFIRM THE DELETION
  onCloseModal() {
    this.display = 'none';
  }
}
