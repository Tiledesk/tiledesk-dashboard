import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Message } from '../models/message-model';
import { RequestsService } from '../services/requests.service';
import { AuthService } from '../core/auth.service';
import { environment } from '../../environments/environment';
import * as firebase from 'firebase/app';
import { UsersLocalDbService } from '../services/users-local-db.service';
// USED FOR go back last page
import { Location } from '@angular/common';
import { NotifyService } from '../core/notify.service';

import { PlatformLocation } from '@angular/common';
import { BotLocalDbService } from '../services/bot-local-db.service';

@Component({
  selector: 'app-requests-msgs',
  templateUrl: './requests-msgs.component.html',
  styleUrls: ['./requests-msgs.component.scss']
})
export class RequestsMsgsComponent implements OnInit, AfterViewInit, OnDestroy {
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
  rating: string;
  rating_message: string;
  source_page: string;

  displayBtnScrollToBottom = 'none';
  displayArchiveRequestModal = 'none';
  id_request_to_archive: string;

  SHOW_CIRCULAR_SPINNER = false;
  displayArchivingInfoModal = 'none';
  ARCHIVE_REQUEST_ERROR = false;

  newInnerWidth: any;
  windowWidth: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private requestsService: RequestsService,
    private auth: AuthService,
    private usersLocalDbService: UsersLocalDbService,
    private _location: Location,
    private notify: NotifyService,
    private platformLocation: PlatformLocation,
    private botLocalDbService: BotLocalDbService
  ) {

    this.platformLocation.onPopState(() => {

      console.log('PLATFORM LOCATION ON POP STATE')
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {

    this.newInnerWidth = event.target.innerWidth;
    console.log('ON RESIZE -> WINDOW WITH ', this.newInnerWidth);
  }

  // detect browser back button click
  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    console.log('»»»» Back button pressed');
    // window.onbeforeunload = function () {
    //   return 'Are you sure you want to leave?';
    // };
  }

  ngOnInit() {
    // prevent browser back button navigation
    // history.pushState(null, null, location.href);
    // window.onpopstate = function (event) {
    //   history.go(1);
    // };


    this.getRequestId();
    this.getCurrentProject();
    this.getLoggedUser();
  }

  onInitWindowWidth(): any {
    this.windowWidth = window.innerWidth;
    console.log('ON INIT WINDOW WIDTH ', this.windowWidth);

    return;
  }

  ngAfterViewInit() {

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

  messageSenderInitialLetter(sender_fullname) {
    // console.log('SENDER FULLNAME INITIAL LETTER ', sender_fullname.charAt(0))
    if (sender_fullname) {
      return sender_fullname.charAt(0);
    }

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

          if (request[0].attributes) {
            if (request[0].attributes.userFullname) {
              this.user_name = request[0].attributes.userFullname;
              console.log('* USER NAME: ', this.user_name);
            } else {
              this.user_name = 'n.a.'
            }
          } else {

            this.user_name = 'n.a.'
          }

          if (request[0].attributes) {
            if (request[0].attributes.userEmail) {
              this.user_email = request[0].attributes.userEmail;
              console.log('* USER EMAIL: ', this.user_email);
            } else {
              this.user_email = 'n.a.'
            }
          } else {

            this.user_email = 'n.a.'
          }

          if (request[0].attributes) {
            if (request[0].attributes.departmentName) {
              this.department_name = request[0].attributes.departmentName;
              console.log('* DEPATMENT NAME: ', this.department_name);
            } else {
              this.department_name = 'Default'
            }
          } else {
            this.department_name = 'n.a.'
          }

          if (request[0].attributes) {
            if (request[0].attributes.departmentId) {
              this.department_id = request[0].attributes.departmentId;
              console.log('* DEPATMENT ID: ', this.department_id);
            } else {
              this.department_id = 'n.a.'
            }
          } else {
            this.department_id = 'n.a.'
          }

          if (request[0].rating) {
            this.rating = request[0].rating + '/5'
          } else {
            this.rating = 'n.a.'
          }

          if (request[0].rating_message) {
            this.rating_message = request[0].rating_message
          } else {
            this.rating_message = 'n.a.'
          }

          if (request[0].attributes) {
            if (request[0].attributes.sourcePage) {
              this.source_page = request[0].attributes.sourcePage;
              console.log('* SOURCE PAGE: ', this.source_page);
            } else {
              this.source_page = 'n.a.'
              console.log('* SOURCE PAGE: ', this.source_page);
            }
          } else {

            this.source_page = 'n.a.'
          }
        }
      });
  }

  // ARCHIVE REQUEST - OPEN THE POPUP
  openArchiveRequestModal(request_recipient: string) {
    console.log('»»» »»» ID OF REQUEST TO ARCHIVE ', request_recipient)
    this.id_request_to_archive = request_recipient;

    this.displayArchiveRequestModal = 'block'
  }

  onCloseArchiveRequestModal() {
    this.displayArchiveRequestModal = 'none'
  }

  onCloseArchivingInfoModal() {
    this.displayArchivingInfoModal = 'none'
  }

  archiveTheRequestHandler() {
    console.log('HAS CLICKED ARCHIVE REQUEST ');

    this.displayArchiveRequestModal = 'none';

    this.SHOW_CIRCULAR_SPINNER = true;

    this.displayArchivingInfoModal = 'block'

    this.getFirebaseToken(() => {

      this.requestsService.closeSupportGroup(this.id_request_to_archive, this.firebase_token)
        .subscribe((data: any) => {

          console.log('CLOSE SUPPORT GROUP - DATA ', data);
        },
          (err) => {
            console.log('CLOSE SUPPORT GROUP - ERROR ', err);
            this.SHOW_CIRCULAR_SPINNER = false;
            this.ARCHIVE_REQUEST_ERROR = true;
            // =========== NOTIFY ERROR ===========
            // tslint:disable-next-line:quotemark
            this.notify.showNotification("An error has occurred archiving the request", 4, 'report_problem')
          },
          () => {
            // this.ngOnInit();
            console.log('CLOSE SUPPORT GROUP - COMPLETE');
            this.SHOW_CIRCULAR_SPINNER = false;
            this.ARCHIVE_REQUEST_ERROR = false;

            // =========== NOTIFY SUCCESS===========
            this.notify.showNotification(`request with id: ${this.id_request_to_archive} has been moved to History`, 2, 'done');
          });
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
          console.log('!! »»» Firebase Token (for join-to-chat and for archive request)', idToken);
        }).catch(function (error) {
          // Handle error
          console.log('!! »»» idToken.', error);
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
            console.log('JOIN TO CHAT GROUP COMPLETE');

            this.SHOW_JOIN_TO_GROUP_SPINNER_PROCESSING = false;
            this.HAS_COMPLETED_JOIN_TO_GROUP_POST_REQUEST = true;
          });
    });
  }

  // <!--target="_blank" href="{{ CHAT_BASE_URL }}?recipient={{id_request}}"   -->
  openChatInNewWindow() {
    const url = this.CHAT_BASE_URL + '?recipient=' + this.id_request
    window.open(url, '_blank');
  }

  scrollCardContetToBottom() {
    setTimeout(() => {
      const initialScrollPosition = this.myScrollContainer.nativeElement;
      console.log('SCROLL CONTAINER ', initialScrollPosition)
      //  objDiv.scrollTop = objDiv.scrollHeight;
      initialScrollPosition.scrollTop = initialScrollPosition.scrollHeight;
      console.log('SCROLL HEIGHT ', initialScrollPosition.scrollHeight);
    }, 100);

  }

  // LISTEN TO SCROLL POSITION
  onScroll(event: any): void {
    console.log('RICHIAMO ON SCROLL ')
    const scrollPosition = this.myScrollContainer.nativeElement.scrollTop;

    const scrollHeight = this.myScrollContainer.nativeElement.scrollHeight;
    console.log('ON SCROLL - SCROLL POSITION ', scrollPosition);
    console.log('ON SCROLL - SCROLL HEIGHT ', scrollHeight);

    const scrollHeighLessScrollPosition = scrollHeight - scrollPosition;
    console.log('ON SCROLL - SCROLL OVERFLOW ', scrollHeighLessScrollPosition);
    if (scrollHeighLessScrollPosition > 500) {
      this.displayBtnScrollToBottom = 'block';
    } else {
      this.displayBtnScrollToBottom = 'none';
    }
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      // tslint:disable-next-line:max-line-length
      console.log('RUN SCROLL TO BOTTOM - SCROLL TOP ', this.myScrollContainer.nativeElement.scrollHeight, ' SCROLL HEIGHT ', this.myScrollContainer.nativeElement.scrollHeight);
    } catch (err) {
      console.log('ERROR ', err);
    }
  }

  cut_support_group_from_request_id(request_id: string) {
    if (request_id) {
      return request_id.replace('support-group-', '');
    }
  }

  // !!! NO MORE USED SUBSTITUTED BY goBack()
  // SINCE THE COMPONENTS THAT CALL 'requests-msgs' CAN BE 'requests-list.comp' OR 'requests-list-history.comp'
  // -  GO BACK REQUESTS LIST
  goBackToRequestsList() {
    this.router.navigate(['project/' + this.id_project + '/requests']);
  }

  goBack() {
    this._location.back();

    // this._location.replaceState('/')
    // this.router.navigate(['project/' + this.id_project + '/home'], { replaceUrl: true });
    // window.history.replaceState('HOME', 'http://localhost:4200/#/projects')
    // console.log('WINDOWS HISTORY ', window.history.replaceState);
  }

  members_replace(member_id) {
    // console.log('Members replace ', m)
    // const user = JSON.parse((localStorage.getItem(member_id)));
    const memberIsBot = member_id.includes('bot_');

    if (memberIsBot === true) {

      const bot_id = member_id.slice(4);
      // console.log('!!! NEW REQUESTS HISTORY - THE PARTICIP', member_id, 'IS A BOT ', memberIsBot, ' - ID ', bot_id);

      const bot = this.botLocalDbService.getBotFromStorage(bot_id);
      if (bot) {
        return member_id = bot['name'] + '<em>(bot)</em>';
      } else {
        return member_id
      }

    } else {
      const user = this.usersLocalDbService.getMemberFromStorage(member_id);
      if (user) {
        // console.log('user ', user)
        return member_id = user['firstname'] + ' ' + user['lastname']
      } else {
        return member_id
      }
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

  ngOnDestroy() {
    console.log('»»» REQUEST MSG COMP >>>>> ON DESTROY <<<<< ')
  }
}
