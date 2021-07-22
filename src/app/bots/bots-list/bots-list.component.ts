import { Component, OnInit } from '@angular/core';
import { FaqKbService } from '../../services/faq-kb.service';
import { FaqKb } from '../../models/faq_kb-model';
import { Router, RoutesRecognized } from '@angular/router';
import { FaqService } from '../../services/faq.service';

import { Project } from '../../models/project-model';
import { AuthService } from '../../core/auth.service';
import { Location } from '@angular/common';
import { NotifyService } from '../../core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from '../../services/app-config.service';
import { DepartmentService } from '../../services/department.service';
// import brand from 'assets/brand/brand.json';
import { BrandService } from '../../services/brand.service';
import { LoggerService } from '../../services/logger/logger.service';
const swal = require('sweetalert');
@Component({
  selector: 'bots-list',
  templateUrl: './bots-list.component.html',
  styleUrls: ['./bots-list.component.scss'],
})

export class BotListComponent implements OnInit {
  // tparams = brand;
  tparams: any;

  faqkbList: FaqKb[];

  // set to none the property display of the modal
  display = 'none';  // NO MORE USED (IS THE OLD MODAL USED TO DELETE THE BOT)
  displayDeleteBotModal = 'none'; // THE NEW MODAL USED TO DELETE THE BOT
  displayDeleteInfoModal = 'none';
  SHOW_CIRCULAR_SPINNER = false;

  id_toDelete: string;

  faqKbId: string;
  faq_faqKbId: string;

  HAS_FAQ_RELATED = false;

  project: Project;
  showSpinner = true;

  NUMBER_OF_CICLE: number;

  DELETE_BOT_ERROR = false;
  bot_id_typed: string;
  ID_BOT_TYPED_MATCHES_THE_BOT_ID: boolean;
  bot_name_to_delete: string;

  trashBotSuccessNoticationMsg: string;
  trashBotErrorNoticationMsg: string;
  is_external_bot: boolean;
  text_is_truncated = true;
  rowIndexSelected: number;

  storageBucket: string;
  baseUrl: string;
  _botType: string;

  deptsNameAssociatedToBot: any

  botIsAssociatedWithDepartments: string;
  botIsAssociatedWithTheDepartment: string;
  disassociateTheBot: string;
  warning: string;

  public_Key: string;
  isVisibleAnalytics: boolean;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;

  constructor(
    private faqKbService: FaqKbService,
    private router: Router,
    private faqService: FaqService,
    private auth: AuthService,
    private _location: Location,
    private notify: NotifyService,
    public appConfigService: AppConfigService,
    private translate: TranslateService,
    public brandService: BrandService,
    public departmentService: DepartmentService,
    private logger: LoggerService
  ) {

    const brand = brandService.getBrand();
    this.tparams = brand;
  }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.getProfileImageStorage();
    this.translateTrashBotSuccessMsg();
    this.translateTrashBotErrorMsg();

    this.getCurrentProject();
    this.getOSCODE();
    // this.getFaqKb();
    this.getFaqKbByProjectId();

    this.getTranslations()
  }

  getTranslations() {
    this.translate.get('BotsPage')
      .subscribe((text: string) => {
        // this.deleteContact_msg = text;
        this.logger.log('[BOTS-LIST] getTranslations BotsPage : ', text)

        this.botIsAssociatedWithDepartments = text['TheBotIsAssociatedWithDepartments'];
        this.botIsAssociatedWithTheDepartment = text['TheBotIsAssociatedWithTheDepartment'];
        this.disassociateTheBot = text['DisassociateTheBot'];
      });


    this.translate.get('Warning')
      .subscribe((text: string) => {
        // this.deleteContact_msg = text;
        // this.logger.log('+ + + BotsPage translation: ', text)
        this.warning = text;
      });

  }

  getProfileImageStorage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[BOTS-LIST] IMAGE STORAGE ', this.storageBucket, 'usecase Firebase')
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;

      this.logger.log('[BOTS-LIST] IMAGE STORAGE ', this.baseUrl, 'usecase native')
    }
  }

  translateTrashBotSuccessMsg() {
    this.translate.get('TrashBotSuccessNoticationMsg')
      .subscribe((text: string) => {

        this.trashBotSuccessNoticationMsg = text;
        // this.logger.log('+ + + TrashBotSuccessNoticationMsg', text)
      });
  }

  translateTrashBotErrorMsg() {
    this.translate.get('TrashBotErrorNoticationMsg')
      .subscribe((text: string) => {

        this.trashBotErrorNoticationMsg = text;
        // this.logger.log('+ + + TrashBotErrorNoticationMsg', text)
      });
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      if (this.project) {
        // this.logger.log('[BOTS-LIST] 00 -> FAQKB COMP project ID from AUTH service subscription  ', this.project._id)
      }
    });
  }

  /**
   * GETS ONLY THE FAQ-KB WITH THE CURRENT PROJECT ID
   * NOTE: THE CURRENT PROJECT-ID IS OBTAINED IN THE FAQ-KB SERVICE
   */
  getFaqKbByProjectId() {
    // this.faqKbService.getFaqKbByProjectId().subscribe((faqKb: any) => {
    this.faqKbService.getAllBotByProjectId().subscribe((faqKb: any) => {
      this.logger.log('[BOTS-LIST] - GET BOTS BY PROJECT ID', faqKb);
      this.faqkbList = faqKb;

      if (this.faqkbList) {
        if (this.faqkbList.length === 0) {
          this.showSpinner = false;
        }


        // ------------------------------------------------------------------------------------
        // FOR PRE
        // ------------------------------------------------------------------------------------
        let i: number;
        for (i = 0; i < this.faqkbList.length; i++) {
          if (this.faqkbList[i].type === 'external') {
            this.faqkbList[i].external = true;
          } else if (this.faqkbList[i].type === 'internal') {
            this.faqkbList[i].external = false;
          }
          if (this.faqkbList[i].description) {
            let stripHere = 40;
            this.faqkbList[i]['truncated_desc'] = this.faqkbList[i].description.substring(0, stripHere) + '...';
          }
          if (this.faqkbList[i].createdBy === 'system' && this.faqkbList[i].type === 'identity') {
            this.faqkbList[i]['is_system_identity_bot'] = true;
          }
        }

        for (let bot of this.faqkbList) {
          // this.logger.log("BOT LIST - GET NUM OF MESSAGE - BOT : ", bot);
          this.faqKbService.getNumberOfMessages(bot._id, bot.type).subscribe((res: any) => {
            this.logger.log("[BOTS-LIST] Messages sent from bot: ", res);
            if (res.length == 0) {
              bot.message_count = 0;
            } else {
              bot.message_count = res[0].totalCount;
            }
          })
        }
      }


      /* this.showSpinner = false moved in getFaqByFaqKbId:
       * in this callback stop the spinner only if there isn't faq-kb and
       * if there is an error */
      // this.showSpinner = false;
    },
      (error) => {
        this.logger.error('[BOTS-LIST] GET BOTS ERROR ', error);
        this.showSpinner = false;
      },
      () => {
        this.logger.log('[BOTS-LIST] GET BOTS COMPLETE');
        // FOR ANY FAQ-KB ID GET THE FAQ ASSOCIATED
        this.getFaqByFaqKbId();
      });

  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    // this.logger.log('AppConfigService getAppConfig (BOT LIST) public_Key', this.public_Key);
    let keys = this.public_Key.split("-");
    // this.logger.log('PUBLIC-KEY (BOT LIST) keys', keys)
    keys.forEach(key => {

      if (key.includes("ANA")) {
        // this.logger.log('PUBLIC-KEY (BOT LIST) - key', key);
        let ana = key.split(":");
        // this.logger.log('PUBLIC-KEY (BOT LIST) - ana key&value', ana);
        if (ana[1] === "F") {
          this.isVisibleAnalytics = false;
        } else {
          this.isVisibleAnalytics = true;
        }

      }
    })
  }

  goToBotExternalUrl(botExternalUrl) {
    this.logger.log('[BOTS-LIST] botExternalUrl ', botExternalUrl);
    window.open(botExternalUrl, '_blank');
  }

  disableTruncateText(i: number) {
    this.text_is_truncated = false;
    // this.logger.log('toggleShowUrl ', this.truncate_text);
    this.rowIndexSelected = i;
    this.logger.log('[BOTS-LIST] toggleShowUrl index ', i);
  }

  enableTruncateText() {
    this.text_is_truncated = true;
    this.rowIndexSelected = undefined;
  }

 

  getFaqByFaqKbId() {
    // FOR ANY FAQ-KB ID GET THE FAQ ASSOCIATED
    let i: number;
    for (i = 0; i < this.faqkbList.length; i++) {
      this.logger.log('[BOTS-LIST] getFaqByFaqKbId ID FAQ KB ', this.faqkbList[i]._id);
      this.faqKbId = this.faqkbList[i]._id;

      this.faqService.getFaqByFaqKbId(this.faqKbId).subscribe((faq: any) => {
        this.logger.log('[BOTS-LIST] getFaqByFaqKbId GET BOT FAQs - FAQs ARRAY ', faq);

        if (faq) {
          let j: number;
          for (j = 0; j < faq.length; j++) {
            // this.logger.log('MONGO DB FAQ - FAQ ID', faq[j]._id);
            // this.logger.log('MONGO DB FAQ - FAQ-KB ID', faq[j].id_faq_kb);

            // this.logger.log('WITH THE FAQ-KB ID ', faq[j].id_faq_kb, 'FOUND FAQ WITH ID ', faq[j]._id)
            this.faq_faqKbId = faq[j].id_faq_kb;

            for (const faqkb of this.faqkbList) {

              if (faqkb._id === this.faq_faqKbId) {
                // this.logger.log('+> ID COINCIDONO');
                faqkb.faqs_number = faq.length
                // this.logger.log('»»» BOT ID', faqkb._id, 'FAQ LENGHT ', faq.length);
                // set in the json the value true to the property has_faq
                faqkb.has_faq = true;
              }
            }
          }
        }
      }, (error) => {
        this.logger.error('[BOTS-LIST] GET BOT FAQs - ERROR ', error)
        this.showSpinner = false;
      }, () => {
        this.logger.log('[BOTS-LIST] GET BOT FAQs - COMPLETE ');
        setTimeout(() => {
          this.showSpinner = false;
        }, 100);
      });
    }
  }


  /**
   * MODAL DELETE FAQ KB
   * @param id
   */
  openDeleteModal(id: string, bot_name: string, HAS_FAQ_RELATED: boolean, botType: string) {
    const deptsArray = this.getDepartments(id)
    this.logger.log('[BOTS-LIST] »» ON MODAL DELETE OPEN - deptsArray', deptsArray);
    // FIX THE BUG: WHEN THE MODAL IS OPENED, IF ANOTHER BOT HAS BEEN DELETED PREVIOUSLY, IS DISPLAYED THE ID OF THE BOT DELETED PREVIOUSLY
    this.bot_id_typed = '';
    // FIX THE BUG: WHEN THE MODAL IS OPENED, IF ANOTHER BOT HAS BEEN DELETED PREVIOUSLY, THE BUTTON 'DELETE BOT' IS ACTIVE
    this.ID_BOT_TYPED_MATCHES_THE_BOT_ID = false;

    this.logger.log('[BOTS-LIST] »» ON MODAL DELETE OPEN - BOT ID TYPED BY USER', this.bot_id_typed);
    this.logger.log('[BOTS-LIST] ON MODAL DELETE OPEN -> FAQ-KB ID ', id);
    this.logger.log('[BOTS-LIST] ON MODAL DELETE OPEN -> FAQ-KB NAME ', bot_name);
    this.logger.log('[BOTS-LIST] ON MODAL DELETE OPEN -> HAS_FAQ_RELATED ', HAS_FAQ_RELATED);
    this.logger.log('[BOTS-LIST] ON MODAL DELETE OPEN -> botType ', botType);
    this._botType = botType
    this.HAS_FAQ_RELATED = HAS_FAQ_RELATED;

    // this.display = 'block'; // NO MORE USED (IS THE OLD MODAL USED TO DELETE THE BOT

    this.id_toDelete = id;
    this.bot_name_to_delete = bot_name;
  }


  getDepartments(selectedBotId) {
    this.departmentService.getDeptsByProjectId().subscribe((_departments: any) => {
      this.logger.log('[BOTS-LIST] ON MODAL DELETE OPEN - GET DEPTS RES', _departments);
      // this.departments = _departments

      const foundDeptsArray = _departments.filter((obj: any) => {
        return obj.id_bot === selectedBotId;
      });

      if (foundDeptsArray.length === 0) {
        this.logger.log('[BOTS-LIST] ON MODAL DELETE OPEN - BOT NOT ASSOCIATED');
        this.displayDeleteBotModal = 'block'; // THE NEW MODAL USED TO DELETE THE BOT
      } else {
        this.logger.log('[BOTS-LIST] ON MODAL DELETE OPEN - BOT !!! ASSOCIATED');
        this.logger.log('[BOTS-LIST] ON MODAL DELETE OPEN - foundDeptsArray', foundDeptsArray);

        this.deptsNameAssociatedToBot = []

        foundDeptsArray.forEach(dept => {
          this.deptsNameAssociatedToBot.push(dept.name)
        });

        this.logger.log('[BOTS-LIST] ON MODAL DELETE OPEN - depts Names Associated To Bot', this.deptsNameAssociatedToBot);

        // this.botIsAssociatedWithDepartments = text['TheBotIsAssociatedWithDepartments'];
        // this.botIsAssociatedWithTheDepartment = text['TheBotIsAssociatedWithTheDepartment'];
        if (foundDeptsArray.length === 1) {
          swal({
            title: this.warning,
            text: this.botIsAssociatedWithTheDepartment + ' ' + this.deptsNameAssociatedToBot + '. ' + this.disassociateTheBot,
            icon: "warning",
            button: true,
            dangerMode: false,
          })
        }

        if (foundDeptsArray.length > 1) {
          swal({
            title: this.warning,
            text: this.botIsAssociatedWithDepartments + ' ' + this.deptsNameAssociatedToBot + '. ' + this.disassociateTheBot,
            icon: "warning",
            button: true,
            dangerMode: false,
          })

        }

      }

    }, error => {
      this.logger.error('[BOTS-LIST] ON MODAL DELETE OPEN - GET DEPTS - ERROR: ', error);
    }, () => {
      this.logger.log('[BOTS-LIST] ON MODAL DELETE OPEN - GET DEPTS * COMPLETE *')
    });


  }

  /**
   * ********************* NEW DELETE BOT *********************
   * THE BOT (AND THE ANY RELATED FAQ) ARE NO MORE REALLY DELETED
   * BUT THE BOT IS ONLY EDITED WITH THE PROPERTY trashed = true
   */

  onCloseDeleteBotModal() {

    this.displayDeleteBotModal = 'none';
  }
  // ENABLED THE BUTTON 'DELETE BOT' IF THE BOT ID TYPED BY THE USER
  // MATCHES TO THE BOT ID
  checkIdBotTyped() {
    this.logger.log('[BOTS-LIST] BOT ID TYPED BY USER', this.bot_id_typed);

    if (this.id_toDelete === this.bot_id_typed) {
      this.ID_BOT_TYPED_MATCHES_THE_BOT_ID = true;
      this.logger.log('[BOTS-LIST] »» BOT ID TYPED MATCHES THE BOT ID ', this.ID_BOT_TYPED_MATCHES_THE_BOT_ID)
    } else {
      this.ID_BOT_TYPED_MATCHES_THE_BOT_ID = false;
      this.logger.log('[BOTS-LIST] »» BOT ID TYPED MATCHES THE BOT ID ', this.ID_BOT_TYPED_MATCHES_THE_BOT_ID)
    }
  }

  trashTheBot() {
    this.showSpinner = true;
    if (this._botType !== 'dialogflow') {

      this.updateBotAsTrashed();
    } else {
      this.deleteDlflwBotCredentialAndUpdateBotAsTrashed();
    }
  }


  deleteDlflwBotCredentialAndUpdateBotAsTrashed() {
    // ------------------------------------------------------------------
    // Delete Dialogflow Bot Credetial
    // ------------------------------------------------------------------
    this.faqKbService.deleteDialogflowBotCredetial(this.id_toDelete).subscribe((res: any) => {
      this.logger.log('[BOTS-LIST] deleteDlflwBotCredentialAndUpdateBotAsTrashed - RES ', res);

    }, (error) => {
      this.logger.error('[BOTS-LIST] deleteDlflwBotCredentialAndUpdateBotAsTrashed - ERROR ', error);

      // =========== NOTIFY ERROR ===========
      this.notify.showWidgetStyleUpdateNotification(this.trashBotErrorNoticationMsg, 4, 'report_problem');

    }, () => {
      this.logger.log('[BOTS-LIST] deleteDlflwBotCredentialAndUpdateBotAsTrashed * COMPLETE *');

      // ------------------------------------------------------------------
      // Update as trashed the bot on our db
      // ------------------------------------------------------------------
      this.updateBotAsTrashed()
    });
  }


  updateBotAsTrashed() {
    this.faqKbService.updateFaqKbAsTrashed(this.id_toDelete, true).subscribe((updatedFaqKb: any) => {
      this.logger.log('[BOTS-LIST] TRASH THE BOT - UPDATED FAQ-KB ', updatedFaqKb);
    }, (error) => {
      // =========== NOTIFY ERROR ===========
      // this.notify.showNotification('An error occurred while deleting the bot', 4, 'report_problem');
      this.notify.showWidgetStyleUpdateNotification(this.trashBotErrorNoticationMsg, 4, 'report_problem');

      this.logger.error('[BOTS-LIST] TRASH THE BOT - ERROR ', error);
      this.showSpinner = false;
      this.displayDeleteBotModal = 'none'
    }, () => {
      this.logger.log('[BOTS-LIST] TRASH THE BOT - COMPLETE');
      // =========== NOTIFY SUCCESS===========
      // this.notify.showNotification('bot successfully deleted', 2, 'done');
      this.notify.showWidgetStyleUpdateNotification(this.trashBotSuccessNoticationMsg, 2, 'done');

      this.getFaqKbByProjectId();

      this.displayDeleteBotModal = 'none';
      setTimeout(() => {
        this.showSpinner = false;
      }, 100);
    });
  }

  deleteFaqKb() {
    this.faqKbService.deleteFaqKb(this.id_toDelete)
      .subscribe((data) => {
        this.logger.log('[BOTS-LIST] DELETE FAQ-KB ', data);
      }, (error) => {
        this.logger.error('[BOTS-LIST] DELETE FAQ-KB (BOT) REQUEST ERROR ', error);
        this.SHOW_CIRCULAR_SPINNER = false;
        this.DELETE_BOT_ERROR = true;
      },
        () => {
          this.logger.log('[BOTS-LIST] DELETE FAQ-KB (BOT) REQUEST * COMPLETE *');
          // RE-RUN ngOnInit() TO UPDATE THE TABLE
          // this.ngOnInit()
          this.DELETE_BOT_ERROR = false;
        });

  }

  onCloseInfoModalHandled() {
    this.displayDeleteInfoModal = 'none';
    this.ngOnInit()
  }

  // CLOSE MODAL WITHOUT SAVE THE UPDATES OR WITHOUT CONFIRM THE DELETION
  onCloseModal() {
    this.display = 'none';
    this.displayDeleteInfoModal = 'none';
  }

  // !!!! NO MORE USED IN THIS COMPONENT - when the user click 'ADD BOT' is redirected to bot-type-select
  /* GO TO THE COMPONENT FAQ-KB-EDIT-ADD */
  // goToEditAddPage_CREATE() {
  //   this.router.navigate(['project/' + this.project._id + '/createfaqkb']);
  // }

  // ---------------------------------------------------
  // Go to select bot type
  // ---------------------------------------------------
  goToSelectBotType() {
    this.router.navigate(['project/' + this.project._id + '/bots/bot-select-type']);
  }


  // ---------------------------------------------------------------------------
  // Go to faq.component to: Add / Edit FAQ, Edit Bot name
  // ---------------------------------------------------------------------------
  goToFaqPage(idFaqKb: string, botType: string) {

    let _botType = ""
    if (botType === 'internal') {
      _botType = 'native'
    } else {
      _botType = botType
    }

    this.logger.log('[BOTS-LIST] ID OF THE BOT (FAQKB) SELECTED ', idFaqKb, 'bot type ', botType);
    this.router.navigate(['project/' + this.project._id + '/bots', idFaqKb, _botType]);
  }


  // !! NO MORE USED - REPLACED WITH goToFaqPage (see above)
  // GO TO THE COMPONENT FAQ-KB-EDIT-ADD
  // goToEditAddPage_EDIT(idFaqKb: string) {
  //   this.router.navigate(['project/' + this.project._id + '/editfaqkb', idFaqKb]);
  // }



  goToTestFaqPage(remoteFaqKbKey: string) {
    this.logger.log('[BOTS-LIST] REMOTE FAQKB KEY SELECTED ', remoteFaqKbKey);

    this.router.navigate(['project/' + this.project._id + '/faq/test', remoteFaqKbKey]);
  }

}
