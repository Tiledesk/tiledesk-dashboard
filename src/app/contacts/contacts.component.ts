// tslint:disable:max-line-length
import { Component, OnInit } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Http, Headers, RequestOptions} from '@angular/http';
import { MongoDbContactsService } from '../services/mongodb-contacts.service';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Contact } from '../models/contact-model';

@Component({
  selector: 'contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
})
export class ContactsComponent implements OnInit {

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
    private contactsService: MongoDbContactsService,
  ) { }

  ngOnInit() {
    this.getContacts();
  }

  /**
   * GET CONTACTS
   */
  getContacts() {
    this.contactsService.getMongDbContacts().subscribe((contacts: any) => {
      console.log('MONGO DB CONTACTS', contacts);
      this.contacts = contacts;
    });
  }

  /**
   * ADD CONTACT
   */
  createContact() {
    console.log('MONGO DB FULL-NAME DIGIT BY USER ', this.fullName);
    this.contactsService.addMongoDbContacts(this.fullName);

    this.fullName = '';
    // RE-RUN GET CONTACT TO UPDATE THE TABLE
    this.getContacts();
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
   * DELETE CONTACT (WHEN THE 'CONFIRM' BUTTON IN MODAL IS CLICKED)
   */
  onCloseDeleteModalHandled() {
    this.display = 'none';

    this.contactsService.deleteMongoDbContact(this.id_toDelete);

    // RE-RUN GET CONTACT TO UPDATE THE TABLE
    this.getContacts();

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
    this.contactsService.updateMongoDbContact(this.id_toUpdate, this.fullName_toUpdate);

    // RE-RUN GET CONTACT TO UPDATE THE TABLE
    this.getContacts();
  }

  // CLOSE MODAL WITHOUT SAVE THE UPDATES OR WITHOUT CONFIRM THE DELETION
  onCloseModal() {
    this.display = 'none';
  }
}
