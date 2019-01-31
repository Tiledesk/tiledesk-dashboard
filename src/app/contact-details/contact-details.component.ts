import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RequestsService } from '../services/requests.service';

import { ContactsService } from '../services/contacts.service';
import { BotLocalDbService } from '../services/bot-local-db.service';
import { UsersLocalDbService } from '../services/users-local-db.service';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { avatarPlaceholder, getColorBck } from '../utils/util';
@Component({
  selector: 'appdashboard-contact-details',
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.scss']
})
export class ContactDetailsComponent implements OnInit {

  public colours = [
    '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#16a085',
    '#27ae60', '#2980b9', '#8e44ad', '#2c3e50', '#f1c40f', '#e67e22',
    '#e74c3c', '#95a5a6', '#f39c12', '#d35400', '#c0392b', '#bdc3c7', '#7f8c8d'
  ];

  requester_id: string
  requests_list: any;
  contact_details: any;
  projectId: string
  displaysFooterPagination: boolean;
  pageNo = 0;
  totalPagesNo_roundToUp: number;
  showSpinner = true;
  currentUserID: string;
  CONTACT_IS_VERIFIED = false;
  contact_fullname_initial: string;
  fillColour: string;

  clientStringCutted: string;
  showAllClientString = false;

  senderAuthInfoString: string;
  senderAuthInfoStringCutted: string;
  showAllsenderAuthInfoString = false;
  showAllSourcePageString = false;
  sourcePage: string;
  sourcePageCutted: string;

  constructor(
    public location: Location,
    private route: ActivatedRoute,
    private requestsService: RequestsService,
    private usersLocalDbService: UsersLocalDbService,
    private botLocalDbService: BotLocalDbService,
    private router: Router,
    public auth: AuthService,
    private contactsService: ContactsService
  ) { }

  ngOnInit() {
    // this.auth.checkRoleForCurrentProject();
    this.getRequesterIdParam();
    this.getCurrentProject();
    this.getCurrentUser();
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      console.log('00 -> NEW REQUEST-LIST HISTORY - PRJCT FROM SUBSCRIPTION TO AUTH SERV  ', project)

      if (project) {
        this.projectId = project._id;

      }
    });
  }

  getCurrentUser() {
    const user = this.auth.user_bs.value
    // this.user = firebase.auth().currentUser;
    console.log('!!!!! CONTACTS DETAILS - LOGGED USER ', user);
    if (user) {
      // this.currentUserFireBaseUID = this.user.uid
      this.currentUserID = user._id
      console.log('!!!!! CONTACTS DETAILS- USER UID ', this.currentUserID);
      // this.getToken();
    } else {
      // console.log('No user is signed in');
    }
  }

  getRequesterIdParam() {
    this.requester_id = this.route.snapshot.params['requesterid'];
    console.log('!!!!! CONTACTS DETAILS - REQUESTER ID ', this.requester_id);

    if (this.requester_id) {
      this.getContactById();
      this.getRequests();

    }
  }

  decreasePageNumber() {
    this.pageNo -= 1;

    console.log('!!!!! CONTACTS DETAILS - DECREASE PAGE NUMBER ', this.pageNo);
    this.getRequests()
  }

  increasePageNumber() {
    this.pageNo += 1;
    console.log('!!!!! CONTACTS DETAILS  - INCREASE PAGE NUMBER ', this.pageNo);
    this.getRequests()
  }


  getRequests() {
    this.requestsService.getNodeJsRequestsByRequesterId(this.requester_id, this.pageNo)
      .subscribe((requests_object: any) => {

        if (requests_object) {
          console.log('!!!!! CONTACTS DETAILS - REQUESTS OBJECTS ', requests_object);
          this.requests_list = requests_object['requests'];
          console.log('!!!!! CONTACTS DETAILS - REQUESTS GOT BY REQUESTER ID ', this.requests_list);

          this.requests_list = requests_object['requests'];


          // to test pagination
          // const requestsCount = 83;
          const requestsCount = requests_object['count'];
          console.log('!!!!! CONTACTS DETAILS - REQUESTS COUNT ', requestsCount);

          this.displayHideFooterPagination(requestsCount);

          const requestsPerPage = requests_object['perPage'];
          console.log('!!!!! CONTACTS DETAILS - N° OF REQUESTS X PAGE ', requestsPerPage);

          const totalPagesNo = requestsCount / requestsPerPage;
          console.log('!!!!! CONTACTS DETAILS - TOTAL PAGES NUMBER', totalPagesNo);

          this.totalPagesNo_roundToUp = Math.ceil(totalPagesNo);
          console.log('!!!!! CONTACTS DETAILS  - TOTAL PAGES NUMBER ROUND TO UP ', this.totalPagesNo_roundToUp);

        }
      }, (error) => {
        this.showSpinner = false;
        console.log('!!!!! CONTACTS DETAILS - GET REQUEST BY REQUESTER ID - ERROR ', error);
      }, () => {
        this.showSpinner = false;
        console.log('!!!!! CONTACTS DETAILS - GET REQUEST BY REQUESTER ID * COMPLETE *');
      });
  }

  displayHideFooterPagination(requests_count) {
    // DISPLAY / HIDE PAGINATION IN THE FOOTER
    if (requests_count >= 16) {
      this.displaysFooterPagination = true;
      // tslint:disable-next-line:max-line-length
      console.log('!!!!! CONTACTS DETAILS ', requests_count, 'DISPLAY FOOTER PAG ', this.displaysFooterPagination);
    } else {
      this.displaysFooterPagination = false;
      // tslint:disable-next-line:max-line-length
      console.log('!!!!! CONTACTS DETAILS ', requests_count, 'DISPLAY FOOTER PAG ', this.displaysFooterPagination);
    }
  }

  getContactById() {
    this.contactsService.getLeadById(this.requester_id)
      .subscribe((lead: any) => {

        if (lead) {
          console.log('!!!!! CONTACTS DETAILS - GET LEAD BY REQUESTER ID ', lead);
          this.contact_details = lead;

          if (this.contact_details.fullname) {

            // this.contact_fullname_initial = this.contact_details.fullname.charAt(0).toUpperCase();
            // console.log('!!!!! CONTACTS DETAILS - CONTACT INITIAL: ', this.contact_fullname_initial);
            // const charIndex = this.contact_fullname_initial.charCodeAt(0) - 65
            // const colourIndex = charIndex % 19;
            // console.log('!!!!! CONTACTS DETAILS - CONTACT colourIndex: ', colourIndex);
            // this.fillColour = this.colours[colourIndex];
            // console.log('!!!!! CONTACTS DETAILS - CONTACT fillColour: ', this.fillColour);

            this.contact_fullname_initial = avatarPlaceholder(this.contact_details.fullname);
            this.fillColour = getColorBck(this.contact_details.fullname);
          } else {

            this.contact_fullname_initial = 'n.a.';
            this.fillColour = '#eeeeee';
          }

          if (this.contact_details.attributes
            && this.contact_details.attributes.senderAuthInfo
            && this.contact_details.attributes.senderAuthInfo.authVar
            && this.contact_details.attributes.senderAuthInfo.authVar.token
            && this.contact_details.attributes.senderAuthInfo.authVar.token.firebase
            && this.contact_details.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider) {

            if (this.contact_details.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider === 'custom') {
              this.CONTACT_IS_VERIFIED = true;
            } else {
              this.CONTACT_IS_VERIFIED = false;
            }
          } else {
            this.CONTACT_IS_VERIFIED = false;
          }


          if (this.contact_details.attributes) {

            if (this.contact_details.attributes.client) {
              console.log('!!!!! CONTACTS DETAILS - ATTRIBUTES > CLIENT: ', this.contact_details.attributes.client);
              const stripHere = 30;
              this.clientStringCutted = this.contact_details.attributes.client.substring(0, stripHere) + '...';
              console.log('!!!!! CONTACTS DETAILS - ATTRIBUTES > CLIENT cutted: ', this.clientStringCutted);
            }

            if (this.contact_details.attributes.senderAuthInfo) {
              console.log('!!!!! CONTACTS DETAILS - ATTRIB. > SENDER AUTH INFO: ', this.contact_details.attributes.senderAuthInfo);
              const _senderAuthInfoString = JSON.stringify(this.contact_details.attributes.senderAuthInfo)

              // add a space after each comma
              this.senderAuthInfoString = _senderAuthInfoString.split(',').join(', ')
              console.log('!!!!! CONTACTS DETAILS - ATTRIB. > SENDER AUTH INFO (STRING): ', this.senderAuthInfoString);

              const stripHere = 20;
              this.senderAuthInfoStringCutted = this.senderAuthInfoString.substring(0, stripHere) + '...';
              // const stripHere = 30;
              // this.clientStringCutted = this.contact_details.attributes.client.substring(0, stripHere)  + '...';
              // console.log('!!!!! CONTACTS DETAILS - ATTRIBUTES > CLIENT cutted: ', this.clientStringCutted);
            }

            if (this.contact_details.attributes.sourcePage) {
              this.sourcePage = this.contact_details.attributes.sourcePage;

              const stripHere = 20;
              console.log('!!!!! CONTACTS DETAILS - ATTRIB. > SOURCR PAGE: ', this.sourcePage);
              this.sourcePageCutted = this.contact_details.attributes.sourcePage.substring(0, stripHere) + '...';
            }
          }
        }

      }, (error) => {

        console.log('!!!!! CONTACTS DETAILS - GET LEAD BY REQUESTER ID - ERROR ', error);

      }, () => {
        console.log('!!!!! CONTACTS DETAILS - GET LEAD BY REQUESTER ID * COMPLETE *');
      });

  }

  toggleShowAllClientString() {
    this.showAllClientString = !this.showAllClientString;
    console.log('SHOW ALL TEXT OF THE ATTRIBUTES > CLIENT ', this.showAllClientString)
  }
  toggleShowAllsenderAuthInfoString() {
    this.showAllsenderAuthInfoString = !this.showAllsenderAuthInfoString;
    console.log('SHOW ALL TEXT OF THE ATTRIBUTES > SENDER AUTH INFO ', this.showAllsenderAuthInfoString);
  }

  toggleShowAllSourcePageString() {
    this.showAllSourcePageString = !this.showAllSourcePageString;
    console.log('SHOW ALL TEXT OF THE ATTRIBUTES > SOURCR PAGE ', this.showAllSourcePageString);
  }

  goBack() {
    this.location.back();
  }

  // members_replace(member_id) {
  //   const participantIsBot = member_id.includes('bot_')

  //   if (participantIsBot === true) {

  //     const bot_id = member_id.slice(4);
  //         const bot = this.botLocalDbService.getBotFromStorage(bot_id);
  //     if (bot) {
  //       return member_id = '- ' + bot['name'] + ' (bot)';
  //     } else {
  //       return '- ' + member_id
  //     }

  //   } else {

  //     const user = this.usersLocalDbService.getMemberFromStorage(member_id);
  //     if (user) {
  //       // console.log('user ', user)
  //       const lastnameInizial = user['lastname'].charAt(0)
  //       return member_id = '- ' + user['firstname'] + ' ' + lastnameInizial + '.'
  //     } else {
  //       return '- ' + member_id
  //     }
  //   }
  // }

  getRequestText(text: string): string {
    if (text) {
      return text.length >= 95 ?
        text.slice(0, 95) + '...' :
        text;
    }
  }

  goToRequestMsgs(request_recipient: string) {
    this.router.navigate(['project/' + this.projectId + '/request/' + request_recipient + '/messages']);
  }

  goToEditContact(requester_id) {
    this.router.navigate(['project/' + this.projectId + '/contact/edit', requester_id]);
  }

  goToMemberProfile(member_id: any) {
    console.log('!!!!! CONTACTS DETAILS has clicked GO To MEMBER ', member_id);
    if (member_id.indexOf('bot_') !== -1) {
      console.log('!!!!! CONTACTS DETAILS IS A BOT !');

      this.router.navigate(['project/' + this.projectId + '/botprofile/' + member_id]);
    } else {
      this.router.navigate(['project/' + this.projectId + '/member/' + member_id]);
    }
  }


}
