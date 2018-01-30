import { Component, OnInit } from '@angular/core';

import { UsersService } from '../services/users.service';

import { User } from '../models/user-model';

import { Observable } from 'rxjs/Observable';

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';

@Component({
  selector: 'users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
})

export class UsersListComponent implements OnInit {

  users: Observable<User[]>;
  id: string;

  usersList: User[];
  usersListFromSearch: User[];
  allUsers: User[];

  displayName: string;
  email: string;
  // displayName = 'Torquato Tasso';
  // email = 'torq@tasso.it';

  // set to none the property display of the modal
  display = 'none';

  id_toUpdate: string;
  displayName_toUpdate: string;
  email_toUpdate: string;

  id_toDelete: string;
  displayName_toDelete: string;

  searchFor: any;

  disableCancelSearchBtn = true;

  BTN_ORDER_NAME_AZ = true;
  BTN_ORDER_NAME_ZA = false;

  BTN_ORDER_EMAIL_AZ = true;
  BTN_ORDER_EMAIL_ZA = false;

  BTN_ORDER_TIME_AZ = true;
  BTN_ORDER_TIME_ZA = false;

  BTN_IS_ACTIVE_COLUMN_NAME = true;
  BTN_IS_ACTIVE_COLUMN_EMAIL = false;
  BTN_IS_ACTIVE_COLUMN_TIME = false;

  DISPLAY_DATA_FOR_UPDATE_MODAL = false;
  DISPLAY_DATA_FOR_DELETE_MODAL = false;

  orderBy_field = 'displayName';
  orderBy_direction = 'asc';
  // this.orderBy = 'desc'

  constructor(
    private userService: UsersService,
    private afs: AngularFirestore,
  ) {
    console.log('HELLO USERS-LIST COMPONENT!');
    // this.users = this.userService.getSnapshot();
    // console.log('THIS USERS ', this.users);
  }

  ngOnInit() {

    this.getUserList(this.orderBy_field, this.orderBy_direction = 'asc');

    // this.userService.getData().subscribe((data) => {
    //   this.usersList = data;
    //   console.log('USER-LIST.COMP: SUBSCRIPTION TO getData ', this.usersList);
    // });

    // for test: what is the real difefrence from snapshotChanges and valueChanges
    // this.valueChangesSubscrption();

  } // ngOnInit !

  getUserList(orderBy_field: any, orderBy_direction: any) {
    // SUBSCIPTION TO snapshotChanges
    this.userService.getSnapshot(orderBy_field, orderBy_direction).subscribe((data) => {
      this.usersList = data;
      this.allUsers = data;
      console.log('USER-LIST.COMP: SUBSCRIPTION TO getSnapshot ', this.usersList);
    });

  }

  /**
   * ADD USER
   */
  createUser() {
    this.userService.create(this.displayName, this.email).then((ref) => {
      console.log('Added document with ID: ', ref.id);

      // FIX BUG: WHEN THE BUTTON 'ADD NEW USER' IS CLICKED
      // IS PERFORMED (INEXPLICABLY) searchUsers WITHOUT ANY PARAMETERS
      this.searchFor = '';
      // this.usersList = this.allUsers;
      console.log('ADD USER AND ORDER BY', this.orderBy_direction);
      // FIX BUG: WHEN THE BUTTON 'ADD NEW USER' IS CLICKED THE LIST IS NO MORE ORDERED
      this.getUserList(this.orderBy_field, this.orderBy_direction);

      this.displayName = '';
      this.email = '';
    });
  }
  /**
   * DELETE USER - NO MORE USED: REPLACED WITH onCloseDeleteModalHandled()
   * @param id
   */
  deleteUser(id: string) {
    this.userService.deleteUser(id);

    console.log('DELETE USER AND ORDER BY', this.orderBy_direction);
    // FIX BUG: WHEN THE BUTTON 'DELETE' IS CLICKED THE LIST IS NO MORE ORDERED
    this.getUserList(this.orderBy_field, this.orderBy_direction);
  }

  /**
   * OPEN THE MODAL WITH THE 'CONFIRM' BUTTON THAT DELETE THE USER
   * @param id
   * @param displayName
   * @param hasClickedDeleteModal
   */
  openDeleteModal(id: string, displayName: string, hasClickedDeleteModal: boolean) {
    console.log('HAS CLICKED OPEN MODAL TO CONFIRM BEFORE TO DELETE ', hasClickedDeleteModal);
    console.log('ON MODAL OPEN -> USER ID ', id);
    this.DISPLAY_DATA_FOR_DELETE_MODAL = hasClickedDeleteModal;
    this.DISPLAY_DATA_FOR_UPDATE_MODAL = false;

    if (hasClickedDeleteModal) {
      this.display = 'block';
    }

    this.id_toDelete = id;
    this.displayName_toDelete = displayName;
  }

  /**
   * DELETE THE USER WHEN THE 'CONFIRM' BUTTON IS CLICKED
   */
  onCloseDeleteModalHandled() {
    this.display = 'none';

    this.userService.deleteUser(this.id_toDelete);

    console.log('DELETE USER AND ORDER BY', this.orderBy_direction);
    // FIX BUG: WHEN THE BUTTON 'DELETE' IS CLICKED THE LIST IS NO MORE ORDERED
    this.getUserList(this.orderBy_field, this.orderBy_direction);

  }

  /**
   * OPEN THE MODAL WITH THE FORM FOR THE UPDATE OF THE USER
   * @param id
   * @param displayName
   * @param email
   * @param hasClickedUpdateModal
   */
  openUpdateModal(id: string, displayName: string, email: string, hasClickedUpdateModal: boolean) {
    // display the modal windows (change the display value in the view)
    console.log('HAS CLICKED OPEN MODAL TO UPDATE USER DATA ', hasClickedUpdateModal);
    this.DISPLAY_DATA_FOR_UPDATE_MODAL = hasClickedUpdateModal;
    this.DISPLAY_DATA_FOR_DELETE_MODAL = false;

    if (hasClickedUpdateModal) {
      this.display = 'block';
    }

    console.log('ON MODAL OPEN -> USER ID ', id);
    console.log('ON MODAL OPEN -> DISPLAY NAME TO UPDATE', displayName);
    console.log('OPEN MODAL -> EMAIL TO UPDATE', email);

    this.id_toUpdate = id;
    this.displayName_toUpdate = displayName;
    this.email_toUpdate = email;

    /**
     * GET A DOCUMENT BY ID (i.e. GET (BY ID) THE DATA OF A USER: displayName, email and time)
     * source: https://stackoverflow.com/questions/47821073/firebase-firestore-get-not-working
     */
    this.afs.collection('users')
      .doc(`${id}`)
      .ref
      .get().then((doc: any) => {
        if (doc.exists) {
          console.log('Document data:', doc.data());
        } else {
          console.log('No such document!');
        }
      }).catch((error: any) => {
        console.log('Error getting document:', error);
      });

  }

  // CLOSE MODAL WITHOUT SAVE THE UPDATES OR WITHOUT CONFIRM THE DELETION
  onCloseModal() {
    this.display = 'none';
  }

  // CLOSE UPDATE MODAL AND SAVE THE UPDATES DATA
  onCloseUpdateModalHandled() {
    // HIDE THE MODAL
    this.display = 'none';

    console.log('ON MODAL CLOSE -> USER ID ', this.id_toUpdate);
    console.log('ON MODAL CLOSE -> DISPLAY NAME UPDATED ', this.displayName_toUpdate);
    console.log('ON MODAL CLOSE -> EMAIL UPDATED ', this.email_toUpdate);

    const data = {
      displayName: this.displayName_toUpdate,
      email: this.email_toUpdate,
    };

    this.afs.doc<User>(`users/${this.id_toUpdate}`).update(data);

    // FIX BUG: WHEN THE BUTTON 'SAVE' IS CLICKED THE LIST IS NO MORE ORDERED
    this.getUserList(this.orderBy_field, this.orderBy_direction);
  }

  // search() {
  //   // where('state', '==', 'CA');
  //   console.log('SEARCH CLICCHED !', this.search_for);
  //   const usersRef = this.afs.collection('users', (ref) => ref.where('displayName', '==', 'x'));
  //   console.log('SEARCH RESULT !', usersRef);
  // }

  /**
   * SEARCH USERS
   * @param searchParam
   */
  searchUsers(searchParam: any) {
    this.searchFor = searchParam.target.value;
    if (this.searchFor.trim() === '' || this.searchFor.trim().length < 3) {
      // DISABLE CANCEL SEARCH PARAMETERS
      this.disableCancelSearchBtn = true;
      // Load cached products
      this.usersList = this.allUsers;
      console.log('USERS AFTER SEARCH ', this.usersList);
    } else {

      // MORE OF 3 DIGIT: ENABLE CANCEL SEARCH PARAMETERS
      this.disableCancelSearchBtn = false;
      console.log('Sto cercando ', this.searchFor);
      this.userService.searchUsers(this.searchFor).subscribe((result) => {
        this.usersList = result;
        console.log('SEARCH RESULT ', result);
      });
    }
  }

  cancelSearch() {
    this.searchFor = '';
    this.usersList = this.allUsers;
    // DISABLE CANCEL SEARCH PARAMETERS
    this.disableCancelSearchBtn = true;
    console.log('RICHIAMO CANCEL SEARCH -> searchFor ', this.usersList);
  }

  orderNameAZ() {
    console.log('HO CLICCATO ORDER NAME AZ ');
    this.BTN_ORDER_NAME_AZ = false;
    this.BTN_ORDER_NAME_ZA = true;

    this.orderBy_field = 'displayName';
    this.orderBy_direction = 'desc';
    this.getUserList(this.orderBy_field = 'displayName', this.orderBy_direction = 'desc');
  }

  orderNameZA() {
    console.log('HO CLICCATO ORDER NAME ZA ');
    this.BTN_ORDER_NAME_AZ = true;
    this.BTN_ORDER_NAME_ZA = false;

    this.orderBy_field = 'displayName';
    this.orderBy_direction = 'asc';
    this.getUserList(this.orderBy_field = 'displayName', this.orderBy_direction = 'asc');

  }

  orderEmailAZ() {
    this.BTN_ORDER_EMAIL_AZ = false;
    this.BTN_ORDER_EMAIL_ZA = true;

    this.orderBy_field = 'email';
    this.orderBy_direction = 'desc';
    this.getUserList(this.orderBy_field = 'email', this.orderBy_direction = 'desc');
  }

  orderEmailZA() {
    this.BTN_ORDER_EMAIL_AZ = true;
    this.BTN_ORDER_EMAIL_ZA = false;

    this.orderBy_field = 'email';
    this.orderBy_direction = 'asc';
    this.getUserList(this.orderBy_field = 'email', this.orderBy_direction = 'asc');
  }

  orderTimeAZ() {
    this.BTN_ORDER_TIME_AZ = false;
    this.BTN_ORDER_TIME_ZA = true;

    this.orderBy_field = 'time';
    this.orderBy_direction = 'desc';
    this.getUserList(this.orderBy_field = 'time', this.orderBy_direction = 'desc');
  }

  orderTimeZA() {
    this.BTN_ORDER_TIME_AZ = true;
    this.BTN_ORDER_TIME_ZA = false;

    this.orderBy_field = 'time';
    this.orderBy_direction = 'asc';
    this.getUserList(this.orderBy_field = 'time', this.orderBy_direction = 'asc');
  }

  isActiveColumnName() {

    this.BTN_IS_ACTIVE_COLUMN_NAME = true;
    this.BTN_IS_ACTIVE_COLUMN_EMAIL = false;
    this.BTN_IS_ACTIVE_COLUMN_TIME = false;
    console.log('IS ACTIVE COLUMN NAME ', this.BTN_IS_ACTIVE_COLUMN_NAME);
    console.log('IS ACTIVE COLUMN EMAIL ', this.BTN_IS_ACTIVE_COLUMN_EMAIL);
    console.log('IS ACTIVE COLUMN TIME ', this.BTN_IS_ACTIVE_COLUMN_TIME);

    this.orderBy_field = 'displayName';
    this.orderBy_direction = 'asc';
    this.getUserList(this.orderBy_field = 'displayName', this.orderBy_direction = 'asc');

  }

  isActiveColumnEmail() {
    this.BTN_IS_ACTIVE_COLUMN_NAME = false;
    this.BTN_IS_ACTIVE_COLUMN_EMAIL = true;
    this.BTN_IS_ACTIVE_COLUMN_TIME = false;
    console.log('IS ACTIVE COLUMN NAME ', this.BTN_IS_ACTIVE_COLUMN_NAME);
    console.log('IS ACTIVE COLUMN EMAIL ', this.BTN_IS_ACTIVE_COLUMN_EMAIL);
    console.log('IS ACTIVE COLUMN TIME ', this.BTN_IS_ACTIVE_COLUMN_TIME);

    this.orderBy_field = 'email';
    this.orderBy_direction = 'asc';
    this.getUserList(this.orderBy_field = 'email', this.orderBy_direction = 'asc');
  }

  isActiveColumnTime() {
    this.BTN_IS_ACTIVE_COLUMN_NAME = false;
    this.BTN_IS_ACTIVE_COLUMN_EMAIL = false;
    this.BTN_IS_ACTIVE_COLUMN_TIME = true;
    console.log('IS ACTIVE COLUMN NAME ', this.BTN_IS_ACTIVE_COLUMN_NAME);
    console.log('IS ACTIVE COLUMN EMAIL ', this.BTN_IS_ACTIVE_COLUMN_EMAIL);
    console.log('IS ACTIVE COLUMN TIME ', this.BTN_IS_ACTIVE_COLUMN_TIME);

    this.orderBy_field = 'time';
    this.orderBy_direction = 'asc';
    this.getUserList(this.orderBy_field = 'time', this.orderBy_direction = 'asc');
  }

  // valueChangesSubscrption() {
  //   this.userService.getDataFilter().subscribe((data) => {
  //     console.log('USER-LIST.COMP: SUBSCRIPTION TO getData Filter ', data);
  //   });
  // }

}
