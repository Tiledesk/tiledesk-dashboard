// tslint:disable:max-line-length
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { RequestsService } from '../services/requests.service';
import { Request } from '../models/request-model';
import { Message } from '../models/message-model';
// import { error } from 'util';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/takeWhile';

import 'rxjs/add/operator/finally';

import * as firebase from 'firebase/app';
// import { Response } from '@angular/http/src/static_response';
import { Headers } from '@angular/http/src/headers';
import { Response } from '@angular/http';

import * as moment from 'moment';
import 'moment/locale/it.js';
import { forEach } from '@angular/router/src/utils/collection';
import { DocumentChange } from '@firebase/firestore-types';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { AuthService } from '../core/auth.service';
import { Project } from '../models/project-model';
import { Router } from '@angular/router';
import { UsersLocalDbService } from '../services/users-local-db.service';
import { environment } from '../../environments/environment';
import { NotifyService } from '../core/notify.service';
import { BotLocalDbService } from '../services/bot-local-db.service';

@Component({
  selector: 'requests-list',
  templateUrl: './requests-list.component.html',
  styleUrls: ['./requests-list.component.scss'],
})
export class RequestsListComponent implements OnInit {
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;

  CHAT_BASE_URL = environment.chat.CHAT_BASE_URL
  // user: Observable<User | null>;
  user: any;
  firebase_token: any;

  requestListUnserved: Request[] = [];
  requestListServed: Request[] = [];

  showSpinner = true;

  messagesList: Message[];

  display = 'none';

  // SCROLL TO BOTTON AND SCROLL POSITION
  displayBtnScrollToBottom = 'none';
  initialScrollPosition: number;
  initialMsgsArrayLength: number;

  // initScrollPositionHalf: number;
  // initScrollPositionPlusTwoScroll: number;

  requestRecipient: string;
  currentUserID: string;

  membersObjectInRequestArray: any;

  // no more used
  CURRENT_USER_IS_ALREADY_MEMBER = false;

  SEARCH_FOR_SAME_UID_FINISHED = false;
  IS_CURRENT_USER_JOINED: boolean;
  SHOW_JOIN_TO_GROUP_SPINNER_PROCESSING = false;
  HAS_COMPLETED_JOIN_TO_GROUP_POST_REQUEST = false;
  JOIN_TO_GROUP_HAS_ERROR = false;

  request_timestamp: any;
  request_fromNow_date: any;
  id_request: string;

  members_as_string: any;

  requester_id: string;
  served_by: string;

  openTagstrong: string;
  closeTagstrong: string;
  uidMenbersKey: string;

  project: Project;
  projectId: string;
  projectName: string;

  displayArchiveRequestModal = 'none';
  displayArchivingInfoModal = 'none';
  SHOW_CIRCULAR_SPINNER = false;
  ARCHIVE_REQUEST_ERROR = false;
  id_request_to_archive: string;

  constructor(
    private requestsService: RequestsService,
    private elRef: ElementRef,
    public auth: AuthService,
    private router: Router,
    private usersLocalDbService: UsersLocalDbService,
    private notify: NotifyService,
    private botLocalDbService: BotLocalDbService
  ) {

    this.user = auth.user_bs.value
    // this.user = firebase.auth().currentUser;
    console.log('LOGGED USER ', this.user);
    if (this.user) {
      // this.currentUserFireBaseUID = this.user.uid
      this.currentUserID = this.user._id
      console.log('USER UID GET IN REQUEST-LIST COMPONENT', this.currentUserID);
      // this.getToken();
    } else {
      // console.log('No user is signed in');
    }
  }

  ngOnInit() {
    // localStorage.getItem('show_settings_submenu'))
    // GET THE CURRENT PROJECT ID
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      console.log('00 -> REQUEST-LIST COMP project from AUTH service subscription  ', project)

      if (project) {
        this.projectId = project._id;
        this.projectName = project.name;
      }
    });

    console.log('REQUEST LIST ON INIT ')

    this.getRequestListBS()

    // this.requestsService.getRequests().subscribe((requests: Request[]) => {
    //   this.showSpinner = false;
    //   requests.forEach((r: Request) => {
    //     this.addOrUpdateRequestsList(r);
    //   });
    // },
    //   error => { },
    //   () => {
    //     console.log('GET REQUEST COMPLETE')
    //   });

  }


  goToMemberProfile(member_id: any) {
    console.log('has clicked GO To MEMBER ', member_id);
    if (member_id.indexOf('bot_') !== -1) {
      console.log('IS A BOT !');

      this.router.navigate(['project/' + this.projectId + '/botprofile/' + member_id]);
    } else {
      this.router.navigate(['project/' + this.projectId + '/member/' + member_id]);
    }
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
        return member_id = '- ' + bot['name'] + ' (bot)';
      } else {
        return '- ' + member_id
      }

    } else {

      const user = this.usersLocalDbService.getMemberFromStorage(member_id);
      if (user) {
        // console.log('user ', user)
        const lastnameInizial = user['lastname'].charAt(0)
        return member_id = '- ' + user['firstname'] + ' ' + lastnameInizial + '.'
      } else {
        return '- ' + member_id
      }
    }
  }

  getRequestListBS() {
    this.requestsService.requestsList_bs.subscribe((requests) => {
      if (requests) {

        console.log('REQUESTS-LIST COMP - REQUESTS ', requests)

        // start NEW: GET MEMBERS
        for (const request of requests) {
          // console.log('request', request)
          console.log('REQUEST TEXT ', request.first_text, ' , SUPP STATUS ', request.support_status)
          requests.forEach(r => {
            if (request.id === r.id) {

              r.members_array = Object.keys(r.members);
              // console.log('!!! REQUEST LIST MEMBERS ARRAY  ', r.members_array)
            }
          })

        }
        // end NEW: GET MEMBERS
        console.log('REQUESTS-LIST COMP - REQUESTS LENGHT', requests.length)
        /**
         * FOR THE UNSERVED REQUEST THE OLDEST IS THE MORE IMPORTANT SO IS DISPLAYED ON TOP OF THE
         * LIST
         */
        this.requestListUnserved = requests
          .filter(r => {
            if (r.support_status === 100) {
              this.showSpinner = false;
              return true
            } else {
              return false
            }
          }).sort(function compare(a: Request, b: Request) {
            if (a.created_on > b.created_on) {
              return 1;
            }
            if (a.created_on < b.created_on) {
              return -1;
            }
            return 0;
          });
        this.requestListServed = requests
          .filter(r => {
            if (r.support_status !== 100) {
              this.showSpinner = false;
              return true
            } else {
              return false
            }
          });
      }
      setTimeout(() => {
        if (requests.length === 0) {
          this.showSpinner = false
        }
      }, 2000);

    }, error => {
      this.showSpinner = false
    });
  }

  // + '&prechatform=' + this.preChatForm
  testWidgetPage() {
    // const url = 'http://support.tiledesk.com/testsite/?projectid=' + this.projectId;
    // + '&projectname=' + this.projectName
    const url = 'http://testwidget.tiledesk.com/testsite?projectid=' + this.projectId + '&prechatform=' + false + '&callout_timer=' + false;
    window.open(url, '_blank');
  }

  // ======================== ARCHIVE A REQUEST ========================
  openDeleteRequestModal(request_recipient: string) {
    console.log('ID OF REQUEST TO ARCHIVE ', request_recipient)
    this.id_request_to_archive = request_recipient;

    this.displayArchiveRequestModal = 'block'
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

  onCloseArchiveRequestModal() {
    this.displayArchiveRequestModal = 'none'
  }
  onCloseArchivingInfoModal() {
    this.displayArchivingInfoModal = 'none'
  }


  // addOrUpdateRequestsList(r: Request) {
  //   console.log('ID REQUEST  ', r.recipient)

  //   for (let i = 0; i < this.requestList.length; i++) {
  //     if (r.recipient === this.requestList[i].recipient) {
  //       this.requestList[i] = r;
  //       return;
  //     }
  //     console.log('REQUEST RECIPIENT ', this.requestList[i].recipient)
  //   }

  //   this.requestList.push(r);

  //   this.requestList.sort(function compare(a: Request, b: Request) {
  //     if (a.timestamp > b.timestamp) {
  //       return -1;
  //     }
  //     if (a.timestamp < b.timestamp) {
  //       return 1;
  //     }
  //     return 0;
  //   });

  // for (let i = 0; i < this.requestList.length; i++) {

  // if (this.ID_request !== this.requestList[0].recipient) {

  //   this.requestList.push(r);
  //   console.log('REQUESTS LIST: ++  ', this.requestList[0].recipient)

  // } else {

  //   console.log('this item is to update ')
  // }


  // this.requestList.forEach(checkedRequest => {
  //   if (checkedRequest.recipient === r.recipient) {
  //     console.log('THIS REQUEST ALREADY EXIST ')
  //   } else {

  //     console.log('! THIS IS A NEW REQUEST ', checkedRequest.recipient)
  //   }
  // });

  // itero l'array this.requestList
  // cerco r per id (recipient)
  // se trovo un elemento corrispondente lo sostituisco con r
  // else this.requestList.push(r)
  // }
  // funzionedapassare(r: Request) {
  //   console.log('full_name: ', r.recipient_fullname);
  //   this.requestList.push(r);
  // }

  // ngAfterViewInit() {
  //   // this.elRef.nativeElement.querySelector('.modal');
  //   console.log('MM ', this.elRef.nativeElement.querySelector('.modal').animate({ scrollTop: 0 }, 'slow') );
  // }

  // FIRESTORE
  // getTest() {
  //   console.log('GET TEST  ')
  //   const db = firebase.firestore();
  //   db.collection('conversations')
  //     .onSnapshot(function (snapshot) {
  //       snapshot.docChanges.forEach(function (change) {
  //         // if (change.type === 'added') {
  //         // this.requestList = data;
  //         console.log(' +++ ++++ DATA: ', change.doc.data());
  //         // }
  //       });
  //     });
  // }
  //

  replace_recipient(request_recipient: string) {
    if (request_recipient) {
      return request_recipient.replace('support-group-', '');
    }
  }

  // NO MORE USED - REPLACED MOMENT WITH ANGULAR2-MOMENT
  /* CALCULATE THE DATE AS FROM-NOW FORMAT */
  getTimestampAsMoment(timestamp: number): string {
    const timestampMs = timestamp / 1000
    return moment.unix(timestampMs).fromNow();
  }

  /* TRUNCATE THE TEXT DISPLAYED IN THE COLUMN 'LAST MESSAGE' */
  getRequestText(text: string): string {
    if (text) {
      // console.log('text ', text)
      return text.length >= 30 ?
        text.slice(0, 30) + '...' :
        text;
    }
  }
  /**
   * REQUESTS (on FIRESTORE the COLLECTION is 'CONVERSATIONS')
   */
  // getRequestList() {
  //   // SUBSCIPTION TO snapshotChanges Conversations '<', 1000
  //   this.requestsService.getSnapshotConversations().subscribe((data) => {
  //     this.requestList = data;
  //     console.log('REQUESTS-LIST.COMP: SUBSCRIPTION TO REQUESTS ', data);

  //     let i: any;
  //     for (i = 0; i < this.requestList.length; i++) {
  //       // console.log('REQUEST TIMESTAMP ', this.requestList[i].timestamp)

  //       // REQUESTER ID IS USED TO OBTAIN 'SERVED BY'
  //       // ('SERVED BY' IS EQUAL TO 'MEMBERS' TO WHICH IS SUBSTRACTED 'REQUESTER ID' AND 'SYSTEM' )
  //       this.requester_id = this.requestList[i].requester_id
  //       // console.log('REQUESTER ID ', this.requester_id)

  //       /**
  //        * CALCULATE THE DATE AS FROM-NOW FORMAT
  //        * AND SET THIS IN THE REQUEST'S JSON KEY request.request_date_fromnow
  //        */
  //       const timestampMs = this.requestList[i].timestamp / 1000
  //       this.request_fromNow_date = moment.unix(timestampMs).fromNow();
  //       // console.log('REQUEST FROM NOW DATE ', this.request_fromNow_date)
  //       this.id_request = this.requestList[i].recipient;

  //       // set date from-now in request object
  //       for (const request of this.requestList) {
  //         if (this.id_request === request.recipient) {
  //           request.request_date_fromnow = this.request_fromNow_date;

  //         }

  //       }

  //       /**
  //        * CREATE A STRING OF ALL MEMBERS OF THE REQUEST AND
  //        * SET THIS IN THE REQUEST'S JSON KEY request.members_as_string
  //        * THEN, IF BETWEEN THE UID KEY THERE IS THE CURRENT USER UID, REPALCE IT WITH 'ME' or 'IO'
  //        */
  //       this.membersObjectInRequestArray = this.requestList[i].members;
  //       // console.log('OBJECT MEMBERS IN REQUESTS (GET REQUETS LIST) ', this.membersObjectInRequestArray);
  //       if (this.membersObjectInRequestArray !== undefined) {
  //         const uidKeysInMemberObject = Object.keys(this.membersObjectInRequestArray)
  //         // console.log('KEYS OF MEMBER OBJECT (GET REQUETS LIST)', Object.keys(this.membersObjectInRequestArray))

  //         const lengthOfUidKeysInMemberObject = uidKeysInMemberObject.length;
  //         // console.log('KEYS LENGHT OF MEMBER OBJECT (GET REQUETS LIST)', lengthOfUidKeysInMemberObject)

  //         let w: number;
  //         this.members_as_string = '';
  //         this.served_by = '';
  //         for (w = 0; w < lengthOfUidKeysInMemberObject; w++) {

  //           const uidMenbersKey = uidKeysInMemberObject[w];
  //           // console.log('UID KEY ', uidMenbersKey)

  //           // ** CREATE A STRING OF ALL MEMBERS OF THE REQUEST AND SET THIS IN THE REQUEST'S JSON
  //           // USED TO SHOW THE LIST OF MEMBERS (LESS 'REQUESTER ID' AND 'SYSTEM') IN THE COLUMN MEMBERS OF THE TABLE
  //           if ((uidMenbersKey !== 'system') && ((uidMenbersKey !== this.requester_id))) {
  //             for (const request of this.requestList) {
  //               if (this.id_request === request.recipient) {

  //                 // FORMAT IN BOLD STYLE THE MEMBERS KEY (IN THE MEMBER LIST) THAT IS EQUAL TO THE REQUESTER ID
  //                 // ONLY FOR DEBUG -- note: if decomment this ** REMEMBER TO COMMENT ABOVE (uidMenbersKey !== this.requester_id)
  //                 // if (uidMenbersKey === this.requester_id) {
  //                 //   this.openTagstrong = '<strong>'
  //                 //   this.closeTagstrong = '</strong>'
  //                 // } else {
  //                 //   this.openTagstrong = ''
  //                 //   this.closeTagstrong = ''
  //                 // }
  //                 // this.members_as_string += '- ' + this.openTagstrong + uidMenbersKey + this.closeTagstrong + '<br>';

  //                 this.members_as_string += '- ' + uidMenbersKey + ' <br>';
  //                 const members_as_string_replaceCurrentUserUid = this.members_as_string.replace(this.currentUserFireBaseUID, '<strong>IO</strong>');
  //                 // console.log('MEMBERS AS STRING REPLACE CURRENT USER UID WITH ME ', members_as_stringReplace);

  //                 // SET MEMBERS AS STRING IN THE REQUEST'S JSON
  //                 request.members_as_string = members_as_string_replaceCurrentUserUid;
  //                 // request.members_as_string = this.members_as_string;

  //                 // console.log('MEMBERS AS STRING ', request.members_as_string);
  //               }
  //             }
  //           }


  //           // SERVED BY (AS FOR ALL MEMBERS) IF BETWEEN THE UID KEY THERE IS THE CURRENT USER UID, REPALCE IT WITH 'MYSELF' or 'ME'
  //           if ((uidMenbersKey !== this.requester_id) && (uidMenbersKey !== 'system')) {
  //             for (const request of this.requestList) {
  //               if (this.id_request === request.recipient) {
  //                 this.served_by += '- ' + uidMenbersKey + ' <br>'

  //                 const served_by_replaceCurrentUserUid = this.served_by.replace(this.currentUserFireBaseUID, '<strong>ME</strong>');
  //                 // SET SERVED BY IN THE REQUEST'S JSON
  //                 request.served_by = served_by_replaceCurrentUserUid
  //                 // request.served_by = this.served_by
  //                 // console.log('SERVED BY ', request.served_by);

  //               }
  //             }
  //           }

  //           /**
  //            * CHECK IF THE CURRENT USER IS ALREADY JOINED TO CONVERSATION
  //            * (IF THE CURRENT USER UID IS BETWEEN THE UID KEY OF THE OBJECT MEMBER (CONTAINED IN THE REQUEST ARRAY)
  //            * IT MEANS THAT THE CURRENT USER IS ALREADY JOINED TO CONVERSATION SO SET TRUE TO THE REQUEST'S JSON KEY request.currentUserIsJoined)
  //            *
  //            * IF uidMenbersKey === this.currentUserFireBaseUID THE CURRENT USER IS ALREADY JOINED TO THE CONVERSATION
  //            */
  //           if (uidMenbersKey === this.currentUserFireBaseUID) {

  //             // console.log('THE MEMBER UID: ', uidMenbersKey, ' IS = TO CUR.USER UID')
  //             // SET IN THE REQUEST ARRAY currentUserIsJoined = true
  //             for (const request of this.requestList) {
  //               if (request.recipient === this.id_request) {
  //                 request.currentUserIsJoined = true;
  //               }
  //             }

  //             // break;
  //           }
  //         }
  //       }
  //     }

  //     this.showSpinner = false;

  //   },
  //     (err) => {
  //       console.log('GET REQUEST LIST ERROR ', err);
  //     },
  //     () => {
  //       console.log('GET REQUEST LIST * COMPLETE *');
  //       // this.showSpinner = false;
  //     });

  // }

  goToRequestMsgs(request_recipient: string) {

    this.router.navigate(['project/' + this.projectId + '/request/' + request_recipient + '/messages']);

  }



  //   ====== THE USER OPEN THE MODAL WINDOW ======
  // * ON CLICK THE VIEW PASS THE VALUE OF 'RECIPIENT' THAT ASSIGN TO THE LOCAL VARIABLE this.requestRecipient
  // * GET THE MESSAGE LIST BY this.requestRecipient
  // *  (!!! GET THE REQUEST DETAILS is NO MORE USED AS PERFORM THIS VERIFICATION ABOVE
  //    - see CHECK IF THE CURRENT USER IS ALREADY JOINED TO CONVERSATION and
  //    - see the comment "NO MORE USED THE REASON" in requests-lists.component.html)
  // * GET THE REQUEST DETAILS (GET THE CONVESATION BY RECIPIENT using this.getRequestByRecipient()) - IS USED FOR:
  //   IF THE VALUE OF THE UID OF CURRENT USER IS FOUND BETWEEN THE UID KEY IN MEMBERS (is contained in the request object)
  //   IN THE MODAL WITH THE MSGS LIST THE 'ENTER BTN' (AND NOT THE 'JOIN BTN') WILL BE DISPLAYED
  openViewMsgsModal(recipient: string, currentUserIsJoined: boolean, requester_id: string) {

    // NEW LOGIC
    this.HAS_COMPLETED_JOIN_TO_GROUP_POST_REQUEST = false;
    this.SHOW_JOIN_TO_GROUP_SPINNER_PROCESSING = false;
    this.requester_id = requester_id;

    // NEW LOGIC
    this.IS_CURRENT_USER_JOINED = currentUserIsJoined
    console.log('WHEN OPEN THE MODAL - CURRENt USER IS JOINED ', this.IS_CURRENT_USER_JOINED)
    console.log('WHEN OPEN THE MODAL - REQUESTER ID ', requester_id)
    console.log('WHEN OPEN THE MODAL - SHOW_JOIN_TO_GROUP_SPINNER_PROCESSING ', this.SHOW_JOIN_TO_GROUP_SPINNER_PROCESSING)

    this.JOIN_TO_GROUP_HAS_ERROR = false;

    // NO MORE USED (see comment "NO MORE USED THE REASON" in requests-lists.component.html  )
    // this.SEARCH_FOR_SAME_UID_FINISHED = false;

    this.display = 'block';
    console.log(' ++ ++ request recipient ', recipient);

    this.requestRecipient = recipient;

    // (!!! NO MORE USED)
    // this.getRequestByRecipient()

    this.getMessagesList();

    // .animate({ scrollTop: 0, duration: 100 })
    this.msgLenght();
    // SCROOL TO BOTTOM THE MESSAGES LIST WHEN THE MODAL IS OPEN
    setTimeout(() => {
      this.scrollToBottom();
    }, 1000);

    /**
     *  *** SCROLL TOP - SCROLL HEIGHT - VISIBLE CONTENT HEIGHT ***
     * scrollTop - sets or return the vertical scrollbar position
     * scrollHeight - read-only property is a measurement of the height of an element content, including content not visible due to overflow
     * height of visible content is set to 250px in the view
     */
    // SET IN A VARIABLE THE INITIAL SCROLL POSITION (FORCED TO BOTTOM OF THE VISIBLE CONTENT AREA WITH THE PREVIOUS scrollToBottom())
    // WHEN THE USER MOVE UPWARDS THE SCROLLBAR THE SCROLL POSITION VALUE DECREASES UP TO 0
    setTimeout(() => {
      this.initialScrollPosition = this.myScrollContainer.nativeElement.scrollTop;
      console.log('SCROLL POSITION WHEN MODAL IS OPEN (INITIAL SCROLL POSITION) ', this.initialScrollPosition);
      // console.log(' SCROLL HEIGHT ', this.myScrollContainer.nativeElement.scrollHeight);
      // console.log(' SCROLL TOP (ALIAS SCROLL POSITION) )', this.myScrollContainer.nativeElement.scrollTop);
      // this.initScrollPositionHalf = this.myScrollContainer.nativeElement.scrollTop / 2;
      // console.log('SCROLL POSITION / 2 WHEN MODAL IS OPEN ', this.initScrollPositionHalf);
      // this.initScrollPositionPlusTwoScroll = this.myScrollContainer.nativeElement.scrollTop + 320;
      // console.log('SCROLL POSITION / 2 WHEN MODAL IS OPEN ', this.initScrollPositionHalf);

    }, 300);

  }

  /**
   * MESSAGES (on FIRESTORE the COLLECTION is 'MESSAGES')
   */
  getMessagesList() {
    // SUBSCIPTION TO snapshotChanges
    this.requestsService.getSnapshotMsg(this.requestRecipient)
      // .finally(() => {
      //   console.log('- -- -- FINISH TO GET MESSAGE !!');
      // })
      .subscribe((data) => {
        this.messagesList = data;
        console.log('REQUESTS-LIST.COMP: SUBSCRIPTION TO getSnapshot MSG ', data);
        // this.showSpinner = false;
        // console.log('TIMESTAMP ', this.messagesList);
        // if (data.length) {
        // this.scrollToBottom();
        // }
      },
        (err) => {
          console.log('GET MESSAGE LIST ERROR ', err);
        },
        () => {
          console.log('GET MESSAGE LIST * COMPLETE *');
          // this.showSpinner = false;
        });

  }

  /* (!!! GET THE REQUEST DETAILS is NO MORE USED AS PERFORM THIS VERIFICATION ABOVE
      - see CHECK IF THE CURRENT USER IS ALREADY JOINED TO CONVERSATION) */
  // GET REQUEST DETAIL (IS THE REQUEST CORRESPONDING TO THE ROW OF REQUESTS LIST ON WHICH THE USER CLICK)
  // THEN IN THE ARRAY RETURNED GET THE 'UID KEYS' CONTAINED IN THE OBJECT MEMBERS
  // THEN COMPARE ANY 'UID KEY' WITH THE CURRENT USER UID
  // IF THE 'UID KEY' IS = TO 'CURRENT USER ID' SHOWS THE BUTTON ENTER AND NOT THE BUTTON JOIN WHEN THE MODAL IS OPENED
  getRequestByRecipient() {
    this.requestsService.getSnapshotConversationByRecipient(this.requestRecipient)
      .subscribe((request) => {

        console.log('REQUEST (ALIAS CONVERSATION) GET BY RECIPIENT ', request);

        this.membersObjectInRequestArray = request[0].members;
        console.log('OBJECT MEMBERS IN THIS REQUEST ', this.membersObjectInRequestArray);

        const uidKeysInMemberObject = Object.keys(this.membersObjectInRequestArray)
        console.log('UID KEYS CONTAINED IN MEMBER OBJECT ', Object.keys(this.membersObjectInRequestArray))

        const lengthOfUidKeysInMemberObject = uidKeysInMemberObject.length;
        console.log('LENGHT OF UID KEY CONTAINED IN MEMBER OBJECT ', lengthOfUidKeysInMemberObject)

        let i: number;
        for (i = 0; i < lengthOfUidKeysInMemberObject; i++) {
          const uidKey = uidKeysInMemberObject[i];
          // console.log('UID KEY ', uidKey)
          if (uidKey === this.currentUserID) {

            // console.log('THE CURRENT USER IS ALREADY JOINED TO THIS CONVERSATION - SHOW BTN ENTER')
            console.log('THE MEMBER UID: ', uidKey, '  IS === TO CURRENT USER UID - SHOW BTN ENTER')
            this.CURRENT_USER_IS_ALREADY_MEMBER = true;
            this.HAS_COMPLETED_JOIN_TO_GROUP_POST_REQUEST = false

            this.SEARCH_FOR_SAME_UID_FINISHED = true;
            break;


          } else {
            // console.log('THE CURRENT USER !IS NOT JOINED TO THIS CONVERSATION - SHOW BTN JOIN')
            console.log('THE MEMBER UID: ', uidKey, '  IS !== TO CURRENT USER UID - SHOW BTN JOIN')
            this.CURRENT_USER_IS_ALREADY_MEMBER = false;
            this.HAS_COMPLETED_JOIN_TO_GROUP_POST_REQUEST = false
            console.log('CYCLE NUMBER ', i)
            if (i + 1 === lengthOfUidKeysInMemberObject) {
              console.log('END OF LOOP')
              this.SEARCH_FOR_SAME_UID_FINISHED = true;
            }
          }
        }
      },
        (err) => {
          this.SEARCH_FOR_SAME_UID_FINISHED = true;
          console.log('REQUEST (ALIAS CONVERSATION) GET BY RECIPIENT ERROR ', err);
        },
        () => {
          console.log('REQUEST (ALIAS CONVERSATION) GET BY RECIPIENT COMPLETE');
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
          console.log('Firebase Token (for join-to-chat & close-support-group)', idToken);
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
      this.requestsService.joinToGroup(this.requestRecipient, this.firebase_token, this.currentUserID)
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

  // LISTEN TO SCROLL POSITION
  onScroll(event: any): void {
    const scrollPosition = this.myScrollContainer.nativeElement.scrollTop;

    const scrollHeight = this.myScrollContainer.nativeElement.scrollHeight;
    console.log('ON SCROLL - SCROLL POSITION ', scrollPosition);
    console.log('ON SCROLL - SCROLL HEIGHT ', scrollHeight);

    /* scrollHeighLessScrollPosition */
    // IS EQUAL TO 250 (HEIGHT OF THE VISIBLE AREA) WHEN THE SCROLLBAR IS AT THE BOTTOM
    // IS EQUAL TO SCROLL HEIGHT (VISIBLE AREA + OVERFLOW) WHEN THE SCROLLBAR IS AT THE TOP
    const scrollHeighLessScrollPosition = scrollHeight - scrollPosition;
    console.log('ON SCROLL - SCROLL OVERFLOW ', scrollHeighLessScrollPosition);
    // console.log('ON SCROLL - SCROLL POSITION / 2 WHEN MODAL IS OPEN ', this.initScrollPositionHalf);

    // const scrollPositionHalf = this.myScrollContainer.nativeElement.scrollTop / 2;
    // console.log('ON SCROLL - SCROLL POSITION HALF ', scrollPositionHalf);

    const currentScrollPosition = this.myScrollContainer.nativeElement.scrollTop;

    // scrollDifference ASSUME THAT initScrollPosition IS CALCULATE WITH THE SCROLLBAR FORCED TO BOTTOM
    const scrollDifference = this.initialScrollPosition - currentScrollPosition;
    console.log('SCROLL DIFFERENCE (INIT SCROLL POSITION - CURRENT SCROLL POSITION)', scrollDifference);

    // 320 IS +/- THE HEIGHT CONSUMED WITH TWO SCROLL
    if (scrollDifference >= 320) {
      this.displayBtnScrollToBottom = 'block';
    }
    if (scrollHeighLessScrollPosition === 250 || scrollDifference <= 320) {
      this.displayBtnScrollToBottom = 'none';
    }
    console.log('ON SCROLL - initial MSGS ARRAY LENGTH ', this.initialMsgsArrayLength);

  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      console.log('RUN SCROLL TO BOTTOM - SCROLL TOP ', this.myScrollContainer.nativeElement.scrollHeight, ' SCROLL HEIGHT ', this.myScrollContainer.nativeElement.scrollHeight);
    } catch (err) {
      console.log('ERROR ', err);
    }
  }

  // bottomFunction() {
  //   const objDiv = document.getElementById('scrollMe');
  //   console.log('objDiv ::', objDiv);
  //   if (objDiv) {
  //     objDiv.scrollIntoView(false);
  //     // objDiv.scrollToBottom()
  //   }
  // }

  msgLenght() {
    this.requestsService.getSnapshotMsg(this.requestRecipient)
      .subscribe((data) => {
        this.initialMsgsArrayLength = data.length;
        console.log('WHEN OPEN MODAL MSGS ARRAY LENGHT (FIXED) ', this.initialMsgsArrayLength);

      });

  }

  /// - DARIO
  //   scrollToBottom() {
  //     const that = this;
  //     setTimeout(function() {
  //         try {
  //             const objDiv = document.getElementById('scrollMe');
  //             //objDiv.addEventListener('scroll', this.setScrolling());
  //             console.log('scrollTop1 ::', objDiv.scrollTop,  objDiv.scrollHeight);
  //             // if (objDiv.scrollTop !== objDiv.scrollHeight) {
  //             //     objDiv.scrollTop = objDiv.scrollHeight + 10;
  //             //     console.log('scrollTop1 ::', objDiv.scrollTop);
  //             // }
  //             //// https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
  //             document.getElementById('scrollMe').scrollIntoView(false);
  //             //that.badgeNewMessages = 0;
  //             that.showButtonToBottom = false;
  //         } catch (err) {
  //             console.log('RIPROVO ::', that.isShowed);
  //             if (that.isShowed === true) {
  //                 that.scrollToBottom();
  //             }
  //         }
  //     }, 300);
  // }


  ///

  // CLOSE MODAL
  onCloseModal() {
    this.display = 'none';
  }


}
