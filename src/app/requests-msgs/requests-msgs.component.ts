import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Message } from '../models/message-model';
import { RequestsService } from '../services/requests.service';
import { AuthService } from '../core/auth.service';
import { environment } from '../../environments/environment';
import * as firebase from 'firebase/app';
import { UsersLocalDbService } from '../services/users-local-db.service';

@Component({
  selector: 'app-requests-msgs',
  templateUrl: './requests-msgs.component.html',
  styleUrls: ['./requests-msgs.component.scss']
})
export class RequestsMsgsComponent implements OnInit {
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  CHAT_BASE_URL = environment.chat.CHAT_BASE_URL

  id_request: string;
  messagesList: Message[];
  showSpinner = true;
  id_project: string;

  IS_CURRENT_USER_JOINED: boolean;
  HAS_COMPLETED_JOIN_TO_GROUP_POST_REQUEST = false;
  SHOW_JOIN_TO_GROUP_SPINNER_PROCESSING = false;
  JOIN_TO_GROUP_HAS_ERROR = false;

  user: any;
  firebase_token: any;
  currentUserID: string;

  request: any;
  members_array: any

  requester_fullname: string;
  requester_id: string;
  user_name: string;
  user_email: string;
  department_name: string;
  department_id: string;
  source_page: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private requestsService: RequestsService,
    private auth: AuthService,
    private usersLocalDbService: UsersLocalDbService
  ) { }

  ngOnInit() {

    this.getRequestId();
    this.getCurrentProject();
    this.getLoggedUser();
  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      console.log('USER GET IN REQUEST-MSGS COMP ', user)

      this.user = user;
      if (this.user) {
        this.currentUserID = this.user._id
        console.log('USER UID GET IN REQUEST-MSGS COMPONENT', this.currentUserID);
      }
    });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.id_project = project._id
        // console.log('00 -> BOT EDIT/ADD COMP project ID from AUTH service subscription  ', this.project._id)
      }
    });
  }

  getRequestId() {
    this.id_request = this.route.snapshot.params['requestid'];
    console.log('REQUESTS-LIST COMP HAS PASSED REQUEST-ID ', this.id_request);

    if (this.id_request) {
      this.getMessagesList();
      this.getRequestByRecipient();
    }
  }

  /**
   * REQUEST' MESSAGES (on FIRESTORE the COLLECTION is 'MESSAGES')
   */
  getMessagesList() {
    // SUBSCIPTION TO snapshotChanges
    this.requestsService.getSnapshotMsg(this.id_request)
      .subscribe((data) => {
        this.messagesList = data;
        console.log('REQUESTS-MSGS.COMP: SUBSCRIPTION TO getSnapshot MSG ', data);
        this.showSpinner = false;

        this.scrollCardContetToBottom();
        // console.log('TIMESTAMP ', this.messagesList);
        // if (data.length) {
        // this.scrollToBottom();
        // }
      },
        (err) => {
          console.log('GET MESSAGES LIST ERROR ', err);
          this.showSpinner = false;
        },
        () => {
          console.log('GET MESSAGES LIST * COMPLETE *');
          // this.showSpinner = false;
        });

  }

  // GET DETAIL OF THE REQUEST - USED FOR:
  // GET IF THE USER IS JOINED OR NOT JOINED
  getRequestByRecipient() {
    this.requestsService.getSnapshotConversationByRecipient(this.id_request)
      .subscribe((request) => {
        // console.log('--> REQUEST ', request);

        if (request) {
          this.request = request[0];
          console.log('--> THIS REQUEST ', this.request);

          this.members_array = Object.keys(request[0].members);
          console.log('MEMBERS ARRAY ', this.members_array)

          this.IS_CURRENT_USER_JOINED = request[0].currentUserIsJoined;
          console.log('* IS_CURRENT_USER_JOINED: ', this.IS_CURRENT_USER_JOINED);

          this.requester_fullname = request[0].requester_fullname;
          console.log('* REQUESTER FULLNAME: ', this.requester_fullname);

          this.requester_id = request[0].requester_id;
          console.log('* REQUESTER ID: ', this.requester_id);

          if (request[0].attributes.userName) {
            this.user_name = request[0].attributes.userName;
            console.log('* USER NAME: ', this.user_name);
          } else {
            this.user_name = 'n.a.'
          }


          if (request[0].attributes.userEmail) {
            this.user_email = request[0].attributes.userEmail;
            console.log('* USER EMAIL: ', this.user_email);
          } else {
            this.user_email = 'n.a.'
          }

          if (request[0].attributes.departmentName) {
            this.department_name = request[0].attributes.departmentName;
            console.log('* DEPATMENT NAME: ', this.department_name);
          } else {
            this.department_name = 'n.a.'
          }

          if (request[0].attributes.departmentId) {
            this.department_id = request[0].attributes.departmentId;
            console.log('* DEPATMENT ID: ', this.department_id);
          } else {
            this.department_id = 'n.a.'
          }

          if (request[0].attributes.sourcePage) {
            this.source_page = request[0].attributes.sourcePage;
            console.log('* SOURCE PAGE: ', this.source_page);
          } else {
            this.source_page = 'n.a.'
            console.log('* SOURCE PAGE: ', this.source_page);
          }
        }
      });
  }

  // USED TO JOIN TO CHAT GROUP (SEE onJoinHandled())
  getFirebaseToken(callback) {
    const that = this;
    // console.log('Notification permission granted.');
    const firebase_currentUser = firebase.auth().currentUser;
    console.log(' // firebase current user ', firebase_currentUser);
    if (firebase_currentUser) {
      firebase_currentUser.getIdToken(/* forceRefresh */ true)
        .then(function (idToken) {
          that.firebase_token = idToken;

          // qui richiama la callback
          callback();
          console.log('Firebase Token (for join-to-chat)', idToken);
        }).catch(function (error) {
          // Handle error
          console.log('idToken.', error);
          callback();
        });
    }
  }

  // JOIN TO CHAT GROUP
  onJoinHandled() {
    this.getFirebaseToken(() => {

      console.log('JOIN PRESSED');
      this.SHOW_JOIN_TO_GROUP_SPINNER_PROCESSING = true;
      // this.requestsService.joinToGroup(this.currentUserFireBaseUID, this.requestRecipient)
      this.requestsService.joinToGroup(this.id_request, this.firebase_token, this.currentUserID)
        .subscribe((data: any) => {

          console.log('JOIN TO CHAT GROUP ', data);
        },
          (err) => {
            console.log('JOIN TO CHAT GROUP ERROR ', err);
            this.SHOW_JOIN_TO_GROUP_SPINNER_PROCESSING = false;
            this.HAS_COMPLETED_JOIN_TO_GROUP_POST_REQUEST = false;
            this.JOIN_TO_GROUP_HAS_ERROR = true;
          },
          () => {
            console.log('JOIN TO CHAT GROUP COMPLETE', );

            this.SHOW_JOIN_TO_GROUP_SPINNER_PROCESSING = false;
            this.HAS_COMPLETED_JOIN_TO_GROUP_POST_REQUEST = true;
          });
    });
  }

  scrollCardContetToBottom() {
    setTimeout(() => {
      const initialScrollPosition = this.myScrollContainer.nativeElement;
      console.log('SCROLL CONTAINER ', initialScrollPosition)
      //  objDiv.scrollTop = objDiv.scrollHeight;
      initialScrollPosition.scrollTop = initialScrollPosition.scrollHeight
      console.log('SCROLL HEIGHT ', initialScrollPosition.scrollHeight)
    }, 100);

  }

  cut_support_group_from_request_id(request_id: string) {
    if (request_id) {
      return request_id.replace('support-group-', '');
    }
  }

  // GO BACK REQUESTS LIST
  goBackToRequestsList() {
    this.router.navigate(['project/' + this.id_project + '/requests']);
  }

  members_replace(member_id) {
    // console.log('Members replace ', m)
    // const user = JSON.parse((localStorage.getItem(member_id)));
    const user = this.usersLocalDbService.getMemberFromStorage(member_id);
    if (user) {
      // console.log('user ', user)
      return member_id = user['firstname'] + ' ' + user['lastname']
    } else {
      return member_id
    }
  }

  goToMemberProfile(member_id: any) {
    console.log('has clicked GO To MEMBER ', member_id);
    if (member_id.indexOf('bot_') !== -1) {
      console.log('IS A BOT !');

      this.router.navigate(['project/' + this.id_project + '/botprofile/' + member_id]);
    } else {
      this.router.navigate(['project/' + this.id_project + '/member/' + member_id]);
    }
  }
}
