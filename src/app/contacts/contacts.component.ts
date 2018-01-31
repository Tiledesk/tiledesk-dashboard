// tslint:disable:max-line-length
import { Component, OnInit } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Http, Headers, RequestOptions} from '@angular/http';
import { ContactsService } from '../services/contacts.service';
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

  // SWITCH DISPLAYED DATA IN THE SAME MODAL DEPENDING ON WHETHER THE
  // USER CLICK ON DELETE BTN OR ON EDIT BUTTON
  DISPLAY_DATA_FOR_UPDATE_MODAL = false;
  DISPLAY_DATA_FOR_DELETE_MODAL = false;
  // set to none the property display of the modal
  display = 'none';

  // DATA DISPALYED IN THE 'DELETE' MODAL
  id_toDelete: string;
  fullName_toDelete: string;

  constructor(
    private http: Http,
    private contactsService: ContactsService,
  ) { }

  ngOnInit() {

    this.getContacts();

  }

  getContacts() {
    this.contactsService.getMongDbContacts().subscribe((contacts: any) => {
      console.log('MONGO DB CONTACTS', contacts);
      this.contacts = contacts;
    });

  }
  createContact() {
    console.log('MONGO DB FULL-NAME DIGIT BY USER ', this.fullName);
    this.contactsService.postMongoDbContacts(this.fullName);

    this.getContacts();
  }

  /**
   * DELETE THE CONTACT WHEN THE 'CONFIRM' BUTTON IS CLICKED
   */
  onCloseDeleteModalHandled() {
    this.display = 'none';

    this.contactsService.deleteContact(this.id_toDelete);

  }

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

   // CLOSE MODAL WITHOUT SAVE THE UPDATES OR WITHOUT CONFIRM THE DELETION
   onCloseModal() {
    this.display = 'none';
  }
}
