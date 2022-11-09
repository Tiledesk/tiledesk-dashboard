import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NotifyService } from '../../../core/notify.service';
import { WsRequestsService } from '../../../services/websocket/ws-requests.service';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '../../../services/logger/logger.service';
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
  @Output() archive_completed = new EventEmitter();

  archivingRequestNoticationMsg: string;
  archivingRequestErrorNoticationMsg: string;
  requestHasBeenArchivedNoticationMsg_part1: string;
  requestHasBeenArchivedNoticationMsg_part2: string;


  constructor(
    private notify: NotifyService,
    public wsRequestsService: WsRequestsService,
    private translate: TranslateService,
    private logger: LoggerService
  ) { }

  ngOnInit() {
    this.logger.log('[WS-REQUEST][CLOSE-REQUEST-MODAL] - id_request_to_archive ', this.id_request_to_archive);
    this.logger.log('[WS-REQUEST][CLOSE-REQUEST-MODAL] - displayArchiveRequestModal', this.displayArchiveRequestModal);
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
        // this.logger.log('+ + + ArchivingRequestNoticationMsg', text)
      });
  }

  // TRANSLATION
  translateArchivingRequestErrorMsg() {
    this.translate.get('ArchivingRequestErrorNoticationMsg')
      .subscribe((text: string) => {

        this.archivingRequestErrorNoticationMsg = text;
        // this.logger.log('+ + + ArchivingRequestErrorNoticationMsg', text)
      });
  }

  // TRANSLATION
  translateRequestHasBeenArchivedNoticationMsg_part1() {
    // this.translate.get('RequestHasBeenArchivedNoticationMsg_part1')
    this.translate.get('RequestSuccessfullyClosed')
      .subscribe((text: string) => {
        this.requestHasBeenArchivedNoticationMsg_part1 = text;
        // this.logger.log('+ + + RequestHasBeenArchivedNoticationMsg_part1', text)
      });
  }

  // TRANSLATION
  translateRequestHasBeenArchivedNoticationMsg_part2() {
    this.translate.get('RequestHasBeenArchivedNoticationMsg_part2')
      .subscribe((text: string) => {
        this.requestHasBeenArchivedNoticationMsg_part2 = text;
        // this.logger.log('+ + + RequestHasBeenArchivedNoticationMsg_part2', text)
      });
  }


  archiveTheRequestHandler() {
    this.closeModal.emit();
    this.displayArchiveRequestModal = 'none';

    this.notify.showArchivingRequestNotification(this.archivingRequestNoticationMsg);
    this.logger.log('[WS-REQUEST][CLOSE-REQUEST-MODAL] - HAS CLICKED ARCHIVE REQUEST ');


    this.wsRequestsService.closeSupportGroup(this.id_request_to_archive)
      .subscribe((data: any) => {
        this.logger.log('[WS-REQUEST][CLOSE-REQUEST-MODAL] - CLOSE SUPPORT GROUP - RES ', data);
      }, (err) => {
        this.logger.error('[WS-REQUEST][CLOSE-REQUEST-MODAL] - CLOSE SUPPORT GROUP - ERROR ', err);

        this.ARCHIVE_REQUEST_ERROR = true;
        //  NOTIFY ERROR 
        this.notify.showNotification(this.archivingRequestErrorNoticationMsg, 4, 'report_problem');
      }, () => {
   
        this.logger.log('[WS-REQUEST][CLOSE-REQUEST-MODAL] - CLOSE SUPPORT GROUP * COMPLETE *');

        this.ARCHIVE_REQUEST_ERROR = false;

        //  NOTIFY SUCCESS
        this.notify.showRequestIsArchivedNotification(this.requestHasBeenArchivedNoticationMsg_part1);
      });
  }

  onArchiveRequestCompleted() {
    this.logger.log('onArchiveRequestCompleted ');
    this.archive_completed.emit()
  }

  onCloseArchiveRequestModal() {
    this.closeModal.emit();
  }


}
