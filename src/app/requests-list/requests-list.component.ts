// tslint:disable:max-line-length
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, NgZone } from '@angular/core';
import { RequestsService } from '../services/requests.service';
import { Request } from '../models/request-model';
import { Message } from '../models/message-model';
import * as moment from 'moment';
import 'moment/locale/it.js';

import { AuthService } from '../core/auth.service';
import { Project } from '../models/project-model';
import { Router } from '@angular/router';
import { UsersLocalDbService } from '../services/users-local-db.service';
import { environment } from '../../environments/environment';
import { NotifyService } from '../core/notify.service';
import { BotLocalDbService } from '../services/bot-local-db.service';
import { DepartmentService } from '../services/mongodb-department.service';
import { UsersService } from '../services/users.service';

import { avatarPlaceholder, getColorBck } from '../utils/util';
import { TranslateService } from '@ngx-translate/core';

import * as firebase from 'firebase/app';

@Component({
  selector: 'appdashboard-requests-list',
  templateUrl: './requests-list.component.html',
  styleUrls: ['./requests-list.component.scss'],
})
export class RequestsListComponent implements OnInit {

  public colours = [
    '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e', '#16a085',
    '#27ae60', '#2980b9', '#8e44ad', '#2c3e50', '#f1c40f', '#e67e22',
    '#e74c3c', '#95a5a6', '#f39c12', '#d35400', '#c0392b', '#bdc3c7', '#7f8c8d'
  ];


  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  zone: NgZone;

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
  SHOW_SIMULATE_REQUEST_BTN: boolean

  project_depts_id_array = [];
  departments: any;
  // requestsDepts_array = [];
  // requestsDeptsId_array = [];
  // requestsDepts_uniqueArray = [];
  // requestsDepts_uniqueArrayWithCount = [];

  depts_array_noduplicate = [];
  seeImAgentRequestsSwitchBtn: boolean;

  displayBtnLabelSeeYourRequets = false;
  REQUESTER_IS_VERIFIED = false;
  ROLE_IS_AGENT: boolean;

  archivingRequestErrorNoticationMsg: string;
  archivingRequestNoticationMsg: string;
  requestHasBeenArchivedNoticationMsg_part1: string;
  requestHasBeenArchivedNoticationMsg_part2: string;
  seeAll: boolean;
  constructor(
    private requestsService: RequestsService,
    private elRef: ElementRef,
    public auth: AuthService,
    private router: Router,
    private usersLocalDbService: UsersLocalDbService,
    private notify: NotifyService,
    private botLocalDbService: BotLocalDbService,
    private departmentService: DepartmentService,
    private usersService: UsersService,
    private translate: TranslateService
  ) {
    this.zone = new NgZone({ enableLongStackTrace: false });

    this.user = auth.user_bs.value

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

    this.translateArchivingRequestErrorMsg();
    this.translateArchivingRequestMsg();
    this.translateRequestHasBeenArchivedNoticationMsg_part1();
    this.translateRequestHasBeenArchivedNoticationMsg_part2();
    // localStorage.getItem('show_settings_submenu'))
    // GET THE CURRENT PROJECT ID
    this.getProjectUserRole();
    this.getCurrentProject();

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

    // this.getCountOfRequestsforDepts();
  }

  // TRANSLATION
  translateArchivingRequestErrorMsg() {
    this.translate.get('ArchivingRequestErrorNoticationMsg')
      .subscribe((text: string) => {

        this.archivingRequestErrorNoticationMsg = text;
        console.log('+ + + ArchivingRequestErrorNoticationMsg', text)
      });
  }
  // TRANSLATION
  translateArchivingRequestMsg() {
    this.translate.get('ArchivingRequestNoticationMsg')
      .subscribe((text: string) => {

        this.archivingRequestNoticationMsg = text;
        console.log('+ + + ArchivingRequestNoticationMsg', text)
      });
  }

  // TRANSLATION
  translateRequestHasBeenArchivedNoticationMsg_part1() {
    this.translate.get('RequestHasBeenArchivedNoticationMsg_part1')
      .subscribe((text: string) => {

        this.requestHasBeenArchivedNoticationMsg_part1 = text;
        console.log('+ + + RequestHasBeenArchivedNoticationMsg_part1', text)
      });
  }

  // TRANSLATION
  translateRequestHasBeenArchivedNoticationMsg_part2() {
    this.translate.get('RequestHasBeenArchivedNoticationMsg_part2')
      .subscribe((text: string) => {

        this.requestHasBeenArchivedNoticationMsg_part2 = text;
        console.log('+ + + RequestHasBeenArchivedNoticationMsg_part2', text)
      });
  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs.subscribe((user_role) => {

      console.log('SEE REQUEST IM AGENT - in GET USER ROLE (REQUESTS COMP) ', user_role);
      if (user_role) {

        if (user_role === 'agent') {
          this.ROLE_IS_AGENT = true
          this.seeImAgentRequestsSwitchBtn = false;
          this.displayBtnLabelSeeYourRequets = true
        } else {
          this.ROLE_IS_AGENT = false
          this.seeImAgentRequestsSwitchBtn = true;
          this.displayBtnLabelSeeYourRequets = false;
        }
      }
    });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      console.log('00 -> REQUEST-LIST COMP project from AUTH service subscription  ', project)

      if (project) {
        this.projectId = project._id;
        this.projectName = project.name;
      }
    });
  }

  seeIamAgentRequests(seeIamAgentReq: boolean) {
    this.showSpinner = true;
    console.log('SEE REQUEST IM AGENT (REQUEST LIST) ', seeIamAgentReq)
    this.requestsService.seeOnlyRequestsHaveCurrentUserAsAgent(seeIamAgentReq);

    // RESOLVE THE BUG: THE BUTTON SEE ALL REQUESTS / SEE MY REQUESTS REMAIN FOCUSED AFTER PRESSED
    // const switchAagentAadminRequestsBbtn = <HTMLElement>document.querySelector('.switch-agent-admin-requests-btn');
    // console.log('REQUESTS COMP switchAagentAadminRequestsBbtn ', switchAagentAadminRequestsBbtn)
    // switchAagentAadminRequestsBbtn.blur();

    if (seeIamAgentReq === false) {
      this.displayBtnLabelSeeYourRequets = false;
    } else {
      this.displayBtnLabelSeeYourRequets = true;
    }

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
  goToDept(deptid) {
    this.router.navigate(['project/' + this.projectId + '/department/edit/' + deptid]);
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
        // '- ' +
        return member_id = bot['name'] + ' (bot)';
      } else {
        // '- ' +
        return member_id
      }

    } else {

      const user = this.usersLocalDbService.getMemberFromStorage(member_id);
      if (user) {
        // console.log('user ', user)
        const lastnameInizial = user['lastname'].charAt(0)
        // '- ' +
        return member_id = user['firstname'] + ' ' + lastnameInizial + '.'
      } else {
        // '- ' +
        return member_id
      }
    }
  }

  // members_replace2(memberArray, requesterId) {
  //   console.log('OLA!  MEMBERS ARRAY Members replace ', memberArray, requesterId)
  //   let user = []
  //   memberArray.forEach(member_id => {
  //     if (member_id !== requesterId && member_id !== 'system') {
  //       console.log('OLA!  MEMBER ', member_id);

  //       user = JSON.parse((localStorage.getItem(member_id)));

  //       const memberIsBot = member_id.includes('bot_');

  //       if (memberIsBot === true) {

  //         const bot_id = member_id.slice(4);
  //         // console.log('!!! NEW REQUESTS HISTORY - THE PARTICIP', member_id, 'IS A BOT ', memberIsBot, ' - ID ', bot_id);

  //         const bot = this.botLocalDbService.getBotFromStorage(bot_id);
  //         if (bot) {
  //           return member_id = '- ' + bot['name'] + ' (bot)';
  //         } else {
  //           return '- ' + member_id
  //         }

  //       } else {

  //         user = this.usersLocalDbService.getMemberFromStorage(member_id);
  //         if (user) {
  //           // console.log('user ', user)
  //           const lastnameInizial = user['lastname'].charAt(0)
  //           return member_id = '- ' + user['firstname'] + ' ' + lastnameInizial + '.'
  //         } else {
  //           return '- ' + member_id
  //         }
  //       }
  //     }

  //   });
  // }

  getRequestListBS() {
    this.requestsService.requestsList_bs.subscribe((requests) => {
      if (requests) {

        this.getCountOfDeptsInRequests(requests)
        // this.zone.run(() RESOLVE THE BUG: View Not Changing After Data Is Updated
        // https://stackoverflow.com/questions/31706948/angular2-view-not-changing-after-data-is-updated?rq=1
        this.zone.run(() => {

          if (requests.length > 0) {
            this.SHOW_SIMULATE_REQUEST_BTN = false;
            console.log('REQUESTS-LIST COMP - SHOW_SIMULATE_REQUEST_BTN ', this.SHOW_SIMULATE_REQUEST_BTN)
          } else {
            this.SHOW_SIMULATE_REQUEST_BTN = true;
          }

        })
        // console.log('REQUESTS-LIST COMP - REQUESTS ', requests)

        for (const request of requests) {
          // console.log('request', request);
          // console.log('REQUESTER FULL NAME: ', request.requester_fullname);



          // let initial = '';
          // let fillColour = '';

          let newInitials = '';
          let newFillColour = '';
          if (request.requester_fullname) {

            // NEW - FULL NAME INITIAL AS DISPLAYED IN THE WIDGET
            newInitials = avatarPlaceholder(request.requester_fullname);
            newFillColour = getColorBck(request.requester_fullname)


            // AVATAR WITH REQUESTER FULL NAME INITIAL AND RANDOM BACKGROUND
            // initial = request.requester_fullname.charAt(0).toUpperCase();
            // const charIndex = initial.charCodeAt(0) - 65
            // const colourIndex = charIndex % 19;
            // fillColour = this.colours[colourIndex];

          } else {
            // initial = 'n.a.';
            // fillColour = '#eeeeee';
            newInitials = 'n.a.';
            newFillColour = '#eeeeee';
          }

          if (request.first_message
            && request.first_message.senderAuthInfo
            && request.first_message.senderAuthInfo.authVar
            && request.first_message.senderAuthInfo.authVar.token
            && request.first_message.senderAuthInfo.authVar.token.firebase
            && request.first_message.senderAuthInfo.authVar.token.firebase.sign_in_provider) {

            if (request.first_message.senderAuthInfo.authVar.token.firebase.sign_in_provider === 'custom') {
              this.REQUESTER_IS_VERIFIED = true;
            } else {
              this.REQUESTER_IS_VERIFIED = false;
            }

          } else {
            this.REQUESTER_IS_VERIFIED = false;
          }

          // console.log('REQUEST TEXT ', request.first_text, ' , SUPP STATUS ', request.support_status)

          requests.forEach(r => {
            if (request.id === r.id) {

              // GET MEMBERS
              r.members_array = Object.keys(r.members);
              // console.log('OLA!  MEMBERS ARRAY ', r.members_array);
              //  this.members_replace2(r.members_array, r.requester_id); // to implement to replace the [innerHTML]="members_replace( m )"

              // r.requester_fullname_initial = initial
              // r.requester_fullname_fillColour = fillColour
              r.requester_fullname_initial = newInitials
              r.requester_fullname_fillColour = newFillColour

              r.requester_is_verified = this.REQUESTER_IS_VERIFIED
              // console.log('!!! REQUEST LIST MEMBERS ARRAY  ', r.members_array)

            }
          })
        }

        // console.log('REQUESTS-LIST COMP - REQUESTS LENGHT', requests.length)

        /**
         * FOR THE UNSERVED REQUEST THE OLDEST IS THE MORE IMPORTANT SO IS DISPLAYED ON TOP OF THE
         * LIST  */
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

  getCountOfDeptsInRequests(requests_array) {
    const depts_array = [];
    const deptsIDs = [];

    const deptsNames = [];

    requests_array.forEach((request, index) => {
      if (request && request.attributes) {
        // console.log('REQUESTS-LIST COMP - REQUEST ', request, '#', index);

        // CREATES AN ARRAY WITH ALL THE DEPTS RETURNED IN THE REQUESTS OBJCTS
        // (FROM THIS IS CREATED requestsDepts_uniqueArray)
        depts_array.push({ '_id': request.attributes.departmentId, 'deptName': request.attributes.departmentName })

        // CREATES AN ARRAY WITH * ONLY THE IDs * OF THE DEPTS RETURNED IN THE REQUESTS OBJCTS
        // THIS IS USED TO GET THE OCCURRENCE IN IT OF THE ID OF THE ARRAY this.requestsDepts_array

        /**
         * USING DEPT ID  */
        deptsIDs.push(request.attributes.departmentId)
        /**
         * USING DEPT NAME  */
        // deptsNames.push(request.attributes.departmentName)
      } else {
        // console.log('REQUESTS-LIST COMP - REQUEST (else)', request, '#', index);

      }
    });
    // console.log('REQUESTS-LIST COMP - DEPTS ARRAY NK', depts_array);
    // console.log('REQUESTS-LIST COMP - DEPTS ID ARRAY NK', deptsIDs);
    // console.log('REQUESTS-LIST COMP - DEPTS NAME ARRAY NK', deptsNames)

    /**
     * *********************************************************************
     * ************************* REMOVE DUPLICATE **************************
     * *********************************************************************
     * */

    /**
     * USING DEPT ID  */
    this.depts_array_noduplicate = this.removeDuplicates(depts_array, '_id');

    /**
     * USING DEPT NAME  */
    //  this.depts_array_noduplicate = this.removeDuplicates(depts_array, 'deptName');



    console.log('REQUESTS-LIST COMP - DEPTS ARRAY [no duplicate] NK', this.depts_array_noduplicate)

    // GET OCCURRENCY OF THE DEPT ID IN THE ARRAY OF THE TOTAL DEPT ID
    this.depts_array_noduplicate.forEach(dept => {

      /**
       * USING DEPT ID  */
      this.getDeptIdOccurrence(deptsIDs, dept._id)

      /**
       * USING DEPT NAME  */
      // this.getDeptNameOccurrence(deptsNames, dept.deptName)
    });
  }

  getDeptNameOccurrence(array_of_all_depts_name, dept_name) {
    // console.log('!!! ANALYTICS - ALL REQUESTS X DEPT - GET DEP OCCURRENCE FOR DEPTS ');
    const newUnicArray = []
    let count = 0;
    array_of_all_depts_name.forEach((v) => (v === dept_name && count++));
    console.log('!!! REQUESTS LIST - DEPT - #', count, ' REQUESTS ASSIGNED TO DEPT ', dept_name);
    let i
    for (i = 0; i < this.depts_array_noduplicate.length; ++i) {

      for (const dept of this.depts_array_noduplicate) {
        if (dept_name === dept.deptName) {
          dept.requestsCount = count
        }
      }
      // console.log('REQUESTS-LIST COMP - DEPTS ARRAY [no duplicate] NK * 2 * : ' + JSON.stringify(this.depts_array_noduplicate));
    }
  }

  getDeptIdOccurrence(array_of_all_depts_ids, dept_id) {
    // console.log('!!! ANALYTICS - ALL REQUESTS X DEPT - GET DEP OCCURRENCE FOR DEPTS ');
    const newUnicArray = []
    let count = 0;
    array_of_all_depts_ids.forEach((v) => (v === dept_id && count++));
    console.log('!!! REQUESTS LIST - DEPT - #', count, ' REQUESTS ASSIGNED TO DEPT ', dept_id);
    let i
    for (i = 0; i < this.depts_array_noduplicate.length; ++i) {

      for (const dept of this.depts_array_noduplicate) {
        if (dept_id === dept._id) {
          dept.requestsCount = count
        }
      }
      // console.log('REQUESTS-LIST COMP - DEPTS ARRAY [no duplicate] NK * 2 * : ' + JSON.stringify(this.depts_array_noduplicate));
    }
  }

  removeDuplicates(originalArray, prop) {
    const newArray = [];
    const lookupObject = {};

    // tslint:disable-next-line:forin
    for (const i in originalArray) {
      lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    // tslint:disable-next-line:forin
    for (const i in lookupObject) {
      newArray.push(lookupObject[i]);
    }
    return newArray;
  }

  // + '&prechatform=' + this.preChatForm
  testWidgetPage() {
    // const url = 'http://support.tiledesk.com/testsite/?projectid=' + this.projectId;
    // + '&projectname=' + this.projectName
    const url = 'http://testwidget.tiledesk.com/testsitenw?projectname=' + this.projectName + ' &projectid=' + this.projectId + '&prechatform=' + false + '&callout_timer=' + false + '&align=right';
    window.open(url, '_blank');
  }

  // ======================== ARCHIVE A REQUEST ========================
  openDeleteRequestModal(request_recipient: string) {
    console.log('ID OF REQUEST TO ARCHIVE ', request_recipient)
    this.id_request_to_archive = request_recipient;

    this.displayArchiveRequestModal = 'block'
  }

  archiveTheRequestHandler() {
    this.notify.showArchivingRequestNotification(this.archivingRequestNoticationMsg);
    console.log('HAS CLICKED ARCHIVE REQUEST ');

    this.displayArchiveRequestModal = 'none';

    this.SHOW_CIRCULAR_SPINNER = true;

    // this.displayArchivingInfoModal = 'block'

    this.getFirebaseToken(() => {

      this.requestsService.closeSupportGroup(this.id_request_to_archive, this.firebase_token)
        .subscribe((data: any) => {

          console.log('CLOSE SUPPORT GROUP - DATA ', data);
        }, (err) => {
          console.log('CLOSE SUPPORT GROUP - ERROR ', err);
          this.SHOW_CIRCULAR_SPINNER = false;
          this.ARCHIVE_REQUEST_ERROR = true;
          // =========== NOTIFY ERROR ===========

          // this.notify.showNotification('An error has occurred archiving the request', 4, 'report_problem');
          this.notify.showNotification(this.archivingRequestErrorNoticationMsg, 4, 'report_problem');
        }, () => {
          // this.ngOnInit();
          console.log('CLOSE SUPPORT GROUP - COMPLETE');
          this.SHOW_CIRCULAR_SPINNER = false;
          this.ARCHIVE_REQUEST_ERROR = false;

          // =========== NOTIFY SUCCESS===========
          // this.notify.showNotification(`request with id: ${this.id_request_to_archive} has been moved to History`, 2, 'done');
          this.notify.showRequestIsArchivedNotification(this.requestHasBeenArchivedNoticationMsg_part1, this.id_request_to_archive, this.requestHasBeenArchivedNoticationMsg_part2);
        });
    });
  }

  onCloseArchiveRequestModal() {
    this.displayArchiveRequestModal = 'none'
  }
  onCloseArchivingInfoModal() {
    this.displayArchivingInfoModal = 'none'
  }

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


  goToRequestMsgs(request_recipient: string) {
    this.router.navigate(['project/' + this.projectId + '/request/' + request_recipient + '/messages']);
  }


  // USED:
  // TO JOIN TO CHAT GROUP (SEE onJoinHandled())
  // TO  CLOSE THE SUPPORT GROUP (SEE archiveTheRequestHandler())
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

  // msgLenght() {
  //   this.requestsService.getSnapshotMsg(this.requestRecipient)
  //     .subscribe((data) => {
  //       this.initialMsgsArrayLength = data.length;
  //       console.log('WHEN OPEN MODAL MSGS ARRAY LENGHT (FIXED) ', this.x);
  //     });
  // }

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
