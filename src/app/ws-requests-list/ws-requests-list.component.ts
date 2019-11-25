import { Component, OnInit, NgZone } from '@angular/core';
import { WsRequestsService } from '../services/websocket/ws-requests.service';
import { UsersLocalDbService } from '../services/users-local-db.service';
import { BotLocalDbService } from '../services/bot-local-db.service';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { avatarPlaceholder, getColorBck } from '../utils/util';
import { NotifyService } from '../core/notify.service';
import { RequestsService } from '../services/requests.service';
import { TranslateService } from '@ngx-translate/core';
import { WsSharedComponent } from '../ws-shared/ws-shared.component';
import * as firebase from 'firebase/app';
@Component({
  selector: 'appdashboard-ws-requests-list',
  templateUrl: './ws-requests-list.component.html',
  styleUrls: ['./ws-requests-list.component.scss']
})
export class WsRequestsListComponent extends WsSharedComponent implements OnInit {

  wsRequestsServed: any;
  wsRequestsUnserved: any;
  projectId: string;
  zone: NgZone;
  SHOW_SIMULATE_REQUEST_BTN: boolean;
  showSpinner = true;

  ws_requests: any[] = [];

  displayArchiveRequestModal = 'none';
  ARCHIVE_REQUEST_ERROR = false;
  id_request_to_archive: string;

  archivingRequestErrorNoticationMsg: string;
  archivingRequestNoticationMsg: string;
  requestHasBeenArchivedNoticationMsg_part1: string;
  requestHasBeenArchivedNoticationMsg_part2: string;

  firebase_token: any;

  OPEN_RIGHT_SIDEBAR = false;
  selectedQuestion: string;
  train_bot_sidebar_height: any;

  currentUserID: string;
  depts_array_noduplicate = [];
  /**
   * Constructor
   * 
   * @param {WsRequestsService} wsRequestsService 
   * @param {Router} router 
   * @param {UsersLocalDbService} usersLocalDbService 
   * @param {BotLocalDbService} botLocalDbService 
   * @param {AuthService} auth 
   * @param {NotifyService} notify 
   * @param {RequestsService} requestsService
   * @param {TranslateService} translate  
   */
  constructor(
    public wsRequestsService: WsRequestsService,
    private router: Router,
    public usersLocalDbService: UsersLocalDbService,
    public botLocalDbService: BotLocalDbService,
    public auth: AuthService,
    private notify: NotifyService,
    private requestsService: RequestsService,
    private translate: TranslateService

  ) {
    super(botLocalDbService, usersLocalDbService);
    this.zone = new NgZone({ enableLongStackTrace: false });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit() {
    this.getWsRequests$();
    this.getCurrentProject();
    this.getTranslations();
    this.getLoggedUser();
  }


  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      console.log('%%% WsRequestsListComponent  USER ', user)

      // this.user = user;
      if (user) {
        this.currentUserID = user._id
        console.log('%%% WsRequestsListComponent currentUser ID', this.currentUserID);

      }
    });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Translations (called On init)
  // -----------------------------------------------------------------------------------------------------

  getTranslations() {
    this.translateArchivingRequestErrorMsg();
    this.translateArchivingRequestMsg();
    this.translateRequestHasBeenArchivedNoticationMsg_part1();
    this.translateRequestHasBeenArchivedNoticationMsg_part2();

  }


  // TRANSLATION
  translateArchivingRequestErrorMsg() {
    this.translate.get('ArchivingRequestErrorNoticationMsg')
      .subscribe((text: string) => {

        this.archivingRequestErrorNoticationMsg = text;
        // console.log('+ + + ArchivingRequestErrorNoticationMsg', text)
      });
  }
  // TRANSLATION
  translateArchivingRequestMsg() {
    this.translate.get('ArchivingRequestNoticationMsg')
      .subscribe((text: string) => {

        this.archivingRequestNoticationMsg = text;
        // console.log('+ + + ArchivingRequestNoticationMsg', text)
      });
  }

  // TRANSLATION
  translateRequestHasBeenArchivedNoticationMsg_part1() {
    this.translate.get('RequestHasBeenArchivedNoticationMsg_part1')
      .subscribe((text: string) => {

        this.requestHasBeenArchivedNoticationMsg_part1 = text;
        // console.log('+ + + RequestHasBeenArchivedNoticationMsg_part1', text)
      });
  }

  // TRANSLATION
  translateRequestHasBeenArchivedNoticationMsg_part2() {
    this.translate.get('RequestHasBeenArchivedNoticationMsg_part2')
      .subscribe((text: string) => {

        this.requestHasBeenArchivedNoticationMsg_part2 = text;
        // console.log('+ + + RequestHasBeenArchivedNoticationMsg_part2', text)
      });
  }


  // -----------------------------------------------------------------------------------------------------
  // @ Subscribe to get the published current project (called On init)
  // -----------------------------------------------------------------------------------------------------
  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      console.log('WsRequestsListComponent  project', project)

      if (project) {
        this.projectId = project._id;
      }
    });
  }


  // -----------------------------------------------------------------------------------------------------
  // @ Subscribe to get the published requests (called On init)
  // -----------------------------------------------------------------------------------------------------
  getWsRequests$() {
    this.wsRequestsService.wsRequestsList$.subscribe((wsrequests) => {
     
      if (wsrequests) {

        this.getCountOfDeptsInRequests(wsrequests);

        this.ws_requests = wsrequests;
      }

      console.log('%%% WsRequestsListComponent getWsRequests$ ws_request ', wsrequests)

      console.log('%%% WsRequestsListComponent getWsRequests$ typeof ws_request ', typeof wsrequests)

      // this.zone.run(() => {

      if (wsrequests.length > 0) {
        this.SHOW_SIMULATE_REQUEST_BTN = false;
        // console.log('%%% WS REQUESTS-LIST COMP - SHOW_SIMULATE_REQUEST_BTN ', this.SHOW_SIMULATE_REQUEST_BTN)
      } else {
        this.SHOW_SIMULATE_REQUEST_BTN = true;
      }


      this.ws_requests.forEach(request => {
        // console.log('%%% WsRequestsListComponent getWsRequests$ typeof ws_request ', typeof wsrequests)

        request['currentUserIsJoined'] = this.currentUserIdIsInParticipants(request.participants, this.currentUserID, request.request_id);

        if (request.lead && request.lead.fullname) {
          request['requester_fullname_initial'] = avatarPlaceholder(request.lead.fullname);
          request['requester_fullname_fillColour'] = getColorBck(request.lead.fullname)
        } else {

          request['requester_fullname_initial'] = 'n.a.';
          request['requester_fullname_fillColour'] = '#eeeeee';
        }

        if (request.lead
          && request.lead.attributes
          && request.lead.attributes.senderAuthInfo
          && request.lead.attributes.senderAuthInfo.authVar
          && request.lead.attributes.senderAuthInfo.authVar.token
          && request.lead.attributes.senderAuthInfo.authVar.token.firebase
          && request.lead.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider
        ) {
          if (request.lead.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider === 'custom') {

            // console.log('- lead sign_in_provider ',  request.lead.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider);
            request['requester_is_verified'] = true;
          } else {
            // console.log('- lead sign_in_provider ',  request.lead.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider);
            request['requester_is_verified'] = false;
          }

        } else {
          request['requester_is_verified'] = false;
        }

      });


      /**
       * Sort requests and manage spinner
       */
      if (wsrequests) {
        this.wsRequestsUnserved = wsrequests
          .filter(r => {
            if (r['status'] === 100) {
              this.showSpinner = false;
              return true
            } else {
              return false
            }
          }).sort(function compare(a: Request, b: Request) {
            if (a['createdAt'] > b['createdAt']) {
              return 1;
            }
            if (a['createdAt'] < b['createdAt']) {
              return -1;
            }
            return 0;
          });

        this.wsRequestsServed = wsrequests
          .filter(r => {
            if (r['status'] !== 100) {
              this.showSpinner = false;
              return true
            } else {
              return false
            }
          });


      }

    }, error => {
      console.log('%%% WsRequestsListComponent getWsRequests$ * error * ', error)
    });

  }

  _getWsRequests$() {
    this.wsRequestsService.messages.subscribe((websocketResponse) => {

      if (websocketResponse) {
        console.log('% WsRequestsListComponent getWsRequests$websocket Response', websocketResponse)

        const wsRequests = websocketResponse['payload']['message']
        console.log('% WsRequestsListComponent getWsRequests$websocket Requests (all)', wsRequests);

        this.wsRequestsUnserved = wsRequests
          .filter(r => {
            if (r['status'] === 100) {
              // this.showSpinner = false;
              return true
            } else {
              return false
            }
          }).sort(function compare(a: Request, b: Request) {
            if (a['createdAt'] > b['createdAt']) {
              return 1;
            }
            if (a['createdAt'] < b['createdAt']) {
              return -1;
            }
            return 0;
          });

        this.wsRequestsServed = wsRequests
          .filter(r => {
            if (r['status'] !== 100) {
              // this.showSpinner = false;
              return true
            } else {
              return false
            }
          });
      }

      console.log('% WsRequestsListComponent getWsRequests$ (served)', this.wsRequestsServed);
      console.log('% WsRequestsListComponent getWsRequests$ (unserved)', this.wsRequestsUnserved);

    }, error => {
      console.log('% WsRequestsListComponent getWsRequests$ * error * ', error)
    });
  }


  members_replace(member_id) {
    // console.log('!!! NEW REQUESTS HISTORY  - SERVED BY ID ', member_id)
    // console.log(' !!! NEW REQUESTS HISTORY underscore found in the participant id  ', member_id, member_id.includes('bot_'));

    const participantIsBot = member_id.includes('bot_')

    if (participantIsBot === true) {

      const bot_id = member_id.slice(4);
      // console.log('!!! NEW REQUESTS HISTORY - THE PARTICIP', member_id, 'IS A BOT ', participantIsBot, ' - ID ', bot_id);

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
        const lastnameInizial = user['lastname'].charAt(0);
        // '- ' +
        return member_id = user['firstname'] + ' ' + lastnameInizial + '.'
      } else {
        // '- ' +
        return member_id
      }
    }
  }

  goToMemberProfile(member_id: any) {
    console.log('!!! NEW REQUESTS HISTORY has clicked GO To MEMBER ', member_id);
    if (member_id.indexOf('bot_') !== -1) {
      console.log('!!! NEW REQUESTS HISTORY IS A BOT !');

      this.router.navigate(['project/' + this.projectId + '/botprofile/' + member_id]);
    } else {
      this.router.navigate(['project/' + this.projectId + '/member/' + member_id]);
    }
  }

  getRequestText(text: string): string {
    if (text) {
      return text.length >= 30 ?
        text.slice(0, 30) + '...' :
        text;
    }
  }

  goToRequestMsgs(request_id: string) {
    this.router.navigate(['project/' + this.projectId + '/wsrequest/' + request_id + '/messages']);
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



    this.getFirebaseToken(() => {

      this.requestsService.closeSupportGroup(this.id_request_to_archive, this.firebase_token)
        .subscribe((data: any) => {

          console.log('CLOSE SUPPORT GROUP - DATA ', data);
        }, (err) => {
          console.log('CLOSE SUPPORT GROUP - ERROR ', err);

          this.ARCHIVE_REQUEST_ERROR = true;
          // =========== NOTIFY ERROR ===========

          // this.notify.showNotification('An error has occurred archiving the request', 4, 'report_problem');
          this.notify.showNotification(this.archivingRequestErrorNoticationMsg, 4, 'report_problem');
        }, () => {
          // this.ngOnInit();
          console.log('CLOSE SUPPORT GROUP - COMPLETE');

          this.ARCHIVE_REQUEST_ERROR = false;

          // =========== NOTIFY SUCCESS===========
          // this.notify.showNotification(`request with id: ${this.id_request_to_archive} has been moved to History`, 2, 'done');
          this.notify.showRequestIsArchivedNotification(this.requestHasBeenArchivedNoticationMsg_part1, this.id_request_to_archive, this.requestHasBeenArchivedNoticationMsg_part2);
        });
    });
  }

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

  onCloseArchiveRequestModal() {
    this.displayArchiveRequestModal = 'none'
  }


  replace_recipient(request_recipient: string) {
    if (request_recipient) {
      return request_recipient.replace('support-group-', '');
    }
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Train bot sidebar
  // -----------------------------------------------------------------------------------------------------

  openRightSideBar(message: string) {
    this.OPEN_RIGHT_SIDEBAR = true;
    console.log('»»»» OPEN RIGHT SIDEBAR ', this.OPEN_RIGHT_SIDEBAR, ' MSG: ', message);
    this.selectedQuestion = message;


    // questo non funziona se è commented BUG RESOLVE
    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.train_bot_sidebar_height = elemMainContent.clientHeight + 10 + 'px'
    console.log('REQUEST-MSGS - ON OPEN RIGHT SIDEBAR -> RIGHT SIDEBAR HEIGHT', this.train_bot_sidebar_height);

  }

  // closeRightSidebar(event) {
  //   console.log('»»»» CLOSE RIGHT SIDEBAR ', event);
  //   this.OPEN_RIGHT_SIDEBAR = event;
  // }



  // -----------------------------------------------------------------------------------------------------
  // @ Requests for department
  // -----------------------------------------------------------------------------------------------------

  /**
   * Count of depts in requests
   * 
   * @param requests_array 
   */
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





}



