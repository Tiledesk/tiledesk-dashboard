import { Component, HostListener, OnInit } from '@angular/core';
import { CannedResponsesService } from '../services/canned-responses.service';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from '../core/notify.service';
import { LoggerService } from '../services/logger/logger.service';
import { AuthService } from 'app/core/auth.service';
import { LocalDbService } from 'app/services/users-local-db.service';
import { UsersService } from 'app/services/users.service';
import { AppConfigService } from '../services/app-config.service';
import { RoleService } from 'app/services/role.service';
import { BrandService } from 'app/services/brand.service';
import { URL_canned_responses_doc } from 'app/utils/util';
@Component({
  selector: 'appdashboard-canned-responses-list',
  templateUrl: './canned-responses-list.component.html',
  styleUrls: ['./canned-responses-list.component.scss']
})
export class CannedResponsesListComponent implements OnInit {

  public canned_responses_docs_url = URL_canned_responses_doc
  displayModal_AddEditResponse = 'none';
  displayModalDeleteResponse = 'none';
  cannedResponseIdToDelete: string;
  // displayEditResponseModal = 'none'
  responsesList: Array<any>;
  modalMode: string;
  selectCannedResponseId = null;
  deleteErrorMsg: string;
  deleteSuccessMsg: string;
  showSpinner = true;
  innerWidthLessThan992: boolean;
  IS_OPEN_SETTINGS_SIDEBAR: boolean;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;
  storageBucket: string;
  baseUrl: string;
  isChromeVerGreaterThan100: boolean
  public hideHelpLink: boolean;

  currentUserId: string;

  constructor(
    public cannedResponsesService: CannedResponsesService,
    public translate: TranslateService,
    private notify: NotifyService,
    private logger: LoggerService,
    private auth: AuthService,
    private usersLocalDbService: LocalDbService,
    private usersService: UsersService,
    public appConfigService: AppConfigService,
    public roleService: RoleService,
    public brandService: BrandService,
  ) {
    const brand = brandService.getBrand(); 
    this.hideHelpLink= brand['DOCS'];
   }

  ngOnInit() {
    // this.auth.checkRoleForCurrentProject();
    this.roleService.checkRoleForCurrentProject('canned-list')
    this.getResponses();
    this.translateNotificationMsgs();
    // this.getMainPanelAndSetOverflow();
    this.listenSidebarIsOpened();
    this.getImageStorage();
    this.getBrowserVersion();
    this.getCurrentUser()
  }

   getCurrentUser() {
    this.auth.user_bs.subscribe((user) => {
      this.logger.log('[CANNED-RES-LIST] - LoggedUser ', user);

      if (user && user._id) {
        this.currentUserId = user._id;
      }
    });
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  this.logger.log("[WS-REQUESTS-LIST] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }

  getImageStorage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[CANNED-RES-LIST IMAGE STORAGE ', this.storageBucket, 'usecase native')
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;

      this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;
      this.logger.log('[CANNED-RES-LIST IMAGE STORAGE ', this.baseUrl, 'usecase native')
    }
  }

  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[CANNED-RES-LIST] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }

  translateNotificationMsgs() {
    this.translate.get('CannedResponses.NotificationMsgs')
      .subscribe((translation: any) => {
        this.logger.log('[CANNED-RES-LIST] translateNotificationMsgs text', translation)
        this.deleteErrorMsg = translation.DeleteCannedResError;
        this.deleteSuccessMsg = translation.DeleteCannedResSuccess;

      });
  }

  getMainPanelAndSetOverflow() {
    const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    this.logger.log('[CANNED-RES-LIST] elemMainPanel ', elemMainPanel)
    const elemMainPanelClientWidth = elemMainPanel.clientWidth
    this.logger.log('[CANNED-RES-LIST] elemMainPanelClientWidth  ', elemMainPanelClientWidth)
    if (elemMainPanelClientWidth < 992) {
      this.innerWidthLessThan992 = true;
      elemMainPanel.style.overflowX = "visible"
    }
  }

  // @HostListener('window:resize', ['$event'])
  // onResize(event: any) {

  //   const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
  //   this.logger.log('[CANNED-RES-LIST] elemMainPanel ', elemMainPanel)
  //   const innerWidth = event.target.innerWidth;
  //   this.logger.log('[CANNED-RES-LIST] onResize innerWidth', innerWidth)
  //   if (innerWidth < 992) {
  //     this.innerWidthLessThan992 = true;
  //     elemMainPanel.style.overflowX = "visible"
  //   } else {
  //     this.innerWidthLessThan992 = false;
  //     elemMainPanel.style.overflowX = "hidden"
  //   }
  // }
  //   "NotificationMsgs": {
  //     "DeleteCannedResError": "An error occurred while deleting response",
  //     "DeleteCannedResSuccess": "Response successfully deleted"
  // }

  getResponses() {
    // this.contactsService.getLeads(this.queryString, this.pageNo).subscribe((leads_object: any) => {
    this.cannedResponsesService.getCannedResponses().subscribe((responses: any) => {
      // this.logger.log('[CANNED-RES-LIST] - GET CANNED RESP - RES ', responses);
      if (responses) {
        this.responsesList = responses;

        this.responsesList.forEach(cannedresponse => {
          const user = this.usersLocalDbService.getMemberFromStorage(cannedresponse.createdBy);
          // this.logger.log('[CANNED-RES-LIST] - GET CANNED RESP - canned response user from local', user);
          // this.logger.log('[CANNED-RES-LIST] - GET CANNED RESP - canned response ', cannedresponse);
          if (user !== null) {
            cannedresponse.createdBy_user = user;
          } else {
            // -----------------------------------------------------
            // From remote if not exist in the local storage
            // -----------------------------------------------------
            this.getMemberFromRemote(cannedresponse, cannedresponse.createdBy);
          }
        });
      }

    }, (error) => {
      this.logger.error('[CANNED-RES-LIST]- GET CANNED RESP - ERROR  ', error);
      this.showSpinner = false
    }, () => {
      this.logger.log('[CANNED-RES-LIST] - GET CANNED RESP * COMPLETE *');
      this.showSpinner = false
    });
  }

  getMemberFromRemote(tag: any, userid: string) {
    this.usersService.getProjectUserById(userid)
      .subscribe((projectuser) => {
        this.logger.log('[CANNED-RES-LIST]- getMemberFromRemote ID ', projectuser);

        tag.createdBy_user = projectuser[0].id_user;

      }, (error) => {
        this.logger.error('[CANNED-RES-LIST] - getMemberFromRemote - ERROR ', error);
      }, () => {
        this.logger.log('[CANNED-RES-LIST] - getMemberFromRemote * COMPLETE *');
      });
  }


  openConfirmDialogDeleteResponse(cannedresponseid) {
    this.displayModalDeleteResponse = 'block'
    this.cannedResponseIdToDelete = cannedresponseid;
  }

  closeModalDeleteResponse() {
     this.displayModalDeleteResponse = 'none'
  }

  deleteCannedResponse() {
    this.cannedResponsesService.deleteCannedResponse(this.cannedResponseIdToDelete).subscribe((responses: any) => {
      this.logger.log('[CANNED-RES-LIST] - DELETE CANNED RESP - RES ', responses);

    }, (error) => {
      this.logger.error('[CANNED-RES-LIST] - DELETE CANNED RESP - ERROR  ', error);
      this.displayModalDeleteResponse = 'none'
      this.notify.showWidgetStyleUpdateNotification(this.deleteErrorMsg, 4, 'report_problem');
    }, () => {
      this.logger.log('[CANNED-RES-LIST] - DELETE CANNED RESP * COMPLETE *');
      this.notify.showWidgetStyleUpdateNotification(this.deleteSuccessMsg, 2, 'done');
      // this.getResponses()
      this.displayModalDeleteResponse = 'none'
      for (var i = 0; i < this.responsesList.length; i++) {
        if (this.responsesList[i]._id === this.cannedResponseIdToDelete) {
          this.responsesList.splice(i, 1);
          i--;
        }
      }

    });
  }


  presentResponseModal_inAddMode() {
    this.selectCannedResponseId = null;
    this.displayModal_AddEditResponse = 'block';
    this.modalMode = 'add';
    this.logger.log('[CANNED-RES-LIST] - displayModal ', this.displayModal_AddEditResponse, ' in Mode', this.modalMode);
  }

  presentResponseModal_inEditMode(cannedresponseid: string, createdby) {
    if (createdby !== this.currentUserId) {
      return
    }
    this.getScrollPos();
    this.selectCannedResponseId = cannedresponseid;
    this.displayModal_AddEditResponse = 'block';
    this.modalMode = 'edit';
    this.logger.log('[CANNED-RES-LIST] - displayModal ', this.displayModal_AddEditResponse, ' in Mode', this.modalMode, ' canned-response-id', cannedresponseid);

  }

  getScrollPos() {
    const actualWidth = window.innerWidth;
    if (actualWidth <= 991) {
      // this.hideQuickTips = true
      const elemMainContent = <HTMLElement>document.querySelector('.main-content');
      const elemMainContClientHeight = elemMainContent.clientHeight;
      const elemMainContScrollHeight = elemMainContent.scrollHeight;
      this.logger.log('[CANNED-RES-LIST]  elemMainContentHeight', elemMainContClientHeight)
      this.logger.log('[CANNED-RES-LIST]  elemMainContScrollHeight', elemMainContScrollHeight)

      // var scrollPos = elemMainContScrollHeight - elemMainContClientHeight;

      var scrollPos = document.getElementsByTagName("html")[0].scrollTop;
      this.logger.log('[CANNED-RES-LIST]  scrollPos', scrollPos)
    }
  }

  closeModal_AddEditResponse() {
    this.displayModal_AddEditResponse = 'none'
  }

  onSaveResponse() {
    this.getResponses();
  }

  goCannedResponseDocs() {
    const url = this.canned_responses_docs_url;
    window.open(url, '_blank');
  }

}
