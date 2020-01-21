import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NotifyService } from '../../../core/notify.service';
import { WsRequestsService } from '../../../services/websocket/ws-requests.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'appdashboard-close-request-modal',
  templateUrl: './close-request-modal.component.html',
  styleUrls: ['./close-request-modal.component.scss']
})
export class CloseRequestModalComponent implements OnInit {

  @Input() id_request_to_archive: string;
  @Input() displayArchiveRequestModal = 'none';
  ARCHIVE_REQUEST_ERROR = false;
  @Output() closeModal = new EventEmitter();

  archivingRequestNoticationMsg: string;
  archivingRequestErrorNoticationMsg: string;
  requestHasBeenArchivedNoticationMsg_part1: string;
  requestHasBeenArchivedNoticationMsg_part2: string;


  constructor(
    private notify: NotifyService,
    public wsRequestsService: WsRequestsService,
    private translate: TranslateService
  ) { }

  ngOnInit() {

    console.log('% »»» WebSocketJs WF Close Request Modal id_request_to_archive ', this.id_request_to_archive);
    console.log('% »»» WebSocketJs WF Close Request Modal displayArchiveRequestModal', this.displayArchiveRequestModal);
    this.getTranslations();
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
  translateArchivingRequestMsg() {
    this.translate.get('ArchivingRequestNoticationMsg')
      .subscribe((text: string) => {
        this.archivingRequestNoticationMsg = text;
        // console.log('+ + + ArchivingRequestNoticationMsg', text)
      });
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




  archiveTheRequestHandler() {
    this.closeModal.emit();
    this.displayArchiveRequestModal = 'none';

    this.notify.showArchivingRequestNotification(this.archivingRequestNoticationMsg);
    console.log('HAS CLICKED ARCHIVE REQUEST ');


    this.wsRequestsService.closeSupportGroup(this.id_request_to_archive)
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

  }

  onCloseArchiveRequestModal() {
    // this.displayArchiveRequestModal = 'none'
    
      // console.log('calling closemodalEditForm');
      this.closeModal.emit();
    
  }


  // _archiveTheRequestHandler() {
  //   this.notify.showArchivingRequestNotification(this.archivingRequestNoticationMsg);
  //   console.log('HAS CLICKED ARCHIVE REQUEST ');

  //   this.displayArchiveRequestModal = 'none';

  //   this.getFirebaseToken(() => {

  //     this.requestsService.closeSupportGroup(this.id_request_to_archive, this.firebase_token)
  //       .subscribe((data: any) => {

  //         console.log('CLOSE SUPPORT GROUP - DATA ', data);
  //       }, (err) => {
  //         console.log('CLOSE SUPPORT GROUP - ERROR ', err);

  //         this.ARCHIVE_REQUEST_ERROR = true;
  //         // =========== NOTIFY ERROR ===========

  //         // this.notify.showNotification('An error has occurred archiving the request', 4, 'report_problem');
  //         this.notify.showNotification(this.archivingRequestErrorNoticationMsg, 4, 'report_problem');
  //       }, () => {
  //         // this.ngOnInit();
  //         console.log('CLOSE SUPPORT GROUP - COMPLETE');

  //         this.ARCHIVE_REQUEST_ERROR = false;

  //         // =========== NOTIFY SUCCESS===========
  //         // this.notify.showNotification(`request with id: ${this.id_request_to_archive} has been moved to History`, 2, 'done');
  //         this.notify.showRequestIsArchivedNotification(this.requestHasBeenArchivedNoticationMsg_part1, this.id_request_to_archive, this.requestHasBeenArchivedNoticationMsg_part2);
  //       });
  //   });
  // }

  // getFirebaseToken(callback) {
  //   const that = this;
  //   // console.log('Notification permission granted.');
  //   const firebase_currentUser = firebase.auth().currentUser;
  //   console.log(' // firebase current user ', firebase_currentUser);
  //   if (firebase_currentUser) {
  //     firebase_currentUser.getIdToken(/* forceRefresh */ true)
  //       .then(function (idToken) {
  //         that.firebase_token = idToken;

  //         // qui richiama la callback
  //         callback();
  //         console.log('Firebase Token (for join-to-chat & close-support-group)', idToken);
  //       }).catch(function (error) {
  //         // Handle error
  //         console.log('idToken.', error);
  //         callback();
  //       });
  //   }
  // }


}
