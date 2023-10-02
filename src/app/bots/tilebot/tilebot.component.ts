
import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FaqService } from '../../services/faq.service';
import { Faq } from '../../models/faq-model';
import { Router, ActivatedRoute } from '@angular/router';
import { Project } from '../../models/project-model';
import { AuthService } from '../../core/auth.service';
import { FaqKbService } from '../../services/faq-kb.service';
import { NotifyService } from '../../core/notify.service';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { ProjectPlanService } from '../../services/project-plan.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from '../../services/app-config.service';
import { UploadImageService } from '../../services/upload-image.service';
import { UploadImageNativeService } from '../../services/upload-image-native.service';
import { UsersService } from '../../services/users.service';
import { BotsBaseComponent } from '../bots-base/bots-base.component';
import { BrandService } from '../../services/brand.service';
import { DepartmentService } from '../../services/department.service';
import { LoggerService } from '../../services/logger/logger.service';
import {
  URL_microlanguage_for_dialogflow_images_videos,
  URL_dialogflow_connector_handoff_to_human_agent_example,
  URL_styling_your_chatbot_replies,
  URL_response_bot_images_buttons_videos_and_more,
  URL_handoff_to_human_agents,
  URL_configure_your_first_chatbot,
  URL_dialogflow_connector,
  avatarPlaceholder,
  getColorBck
} from '../../utils/util';
import { DomSanitizer } from '@angular/platform-browser';
const swal = require('sweetalert');
@Component({
  selector: 'appdashboard-tilebot',
  templateUrl: './tilebot.component.html',
  styleUrls: ['./tilebot.component.scss']
})
export class TilebotComponent extends BotsBaseComponent implements OnInit {
  @ViewChild('editbotbtn', { static: false }) private elementRef: ElementRef;
  @ViewChild('filechangeuploadCSV', { static: false }) private filechangeuploadCSV: ElementRef;
  faq: Faq[];
  question: string;
  answer: string;

  id_toDelete: any;
  id_toUpdate: any;

  question_toUpdate: string;
  answer_toUpdate: string;

  DISPLAY_DATA_FOR_UPDATE_MODAL = false;
  DISPLAY_DATA_FOR_DELETE_MODAL = false;
  // set to none the property display of the modal
  displayDeleteFaqModal = 'none';

  id_faq_kb: string;
  faq_kb_remoteKey: string;

  project: Project;

  displayInfoModal = 'none';
  SHOW_CIRCULAR_SPINNER = false;
  displayImportModal = 'none';
  csvColumnsDelimiter = ';'
  parse_done: boolean;
  parse_err: boolean;

  modalChoosefileDisabled: boolean;

  faqKb_name: string;
  faqkb_language: string;
  faqKbUrlToUpdate: string;
  faqKb_id: string;
  faqKb_created_at: any;
  faqKb_description: string;
  faq_lenght: number;
  showSpinner = true;
  showSpinnerInUpdateBotCard = true;
  // is_external_bot: boolean;
  is_external_bot = true;


  windowWidthMore764: boolean;
  windowWidthMore991: boolean;

  subscription: Subscription;
  prjct_profile_type: string;
  subscription_is_active: any;
  prjct_profile_name: string;
  subscription_end_date: Date;
  trial_expired: boolean;
  browserLang: string;
  OPEN_RIGHT_SIDEBAR = false;
  train_bot_sidebar_height: any;

  storageBucket: string;
  showSpinnerInUploadImageBtn = false;
  botProfileImageExist: boolean;
  botImageHasBeenUploaded = false;

  botProfileImageurl: any;
  timeStamp: any;
  botType: string;
  botTypeForInput: string;
  uploadedFileName: string;
  dlgflwSelectedLang: any;
  dlgflwSelectedLangCode: any;
  dlgflwKnowledgeBaseID: string;
  uploadedFile: any;
  updateBotError: string;
  updateBotSuccess: string;
  notValidJson: string;
  tparams: any;
  isVisibleAnalytics: boolean;
  public_Key: string;
  COUNT_DEPTS_BOT_IS_ASSOCIATED_WITH: number;
  DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY = [];
  all_depts: any
  isVisibleDEP: boolean;

  webhook_is_enabled: any;
  webhookUrl: string;

  WEBHOOK_URL_IS_EMPTY: boolean;
  WEBHOOK_URL_IS_HTTPS: boolean;
  WEBHOOK_URL_IS_HTTP: boolean;
  WEBHOOK_URL_IS_HTTP_or_HTTPS: boolean;
  WEBHOOK_URL_IS_VALID: boolean;
  WEBHOOK_URL_HAS_ERROR: boolean;

  display_intent_name_in_table: boolean = true;
  display_message_in_table: boolean = false;
  display_questions_in_table: boolean = true;
  display_answer_in_table: boolean = true;
  display_topic_in_table: boolean = false;
  previousUrl: string;
  currentUrl: string;
  navigation_history = []
  previousPageIsCreateBot: boolean;

  errorDeletingAnswerMsg: string;
  answerSuccessfullyDeleted: string;

  depts_length: number;
  depts_without_bot_array = [];

  COUNT_OF_VISIBLE_DEPT: number;

  selected_dept_id: string;
  selected_dept_name: string;
  dept_id: string;
  done_msg: string;
  botHasBeenAssociatedWithDept: string;
  DEPTS_HAVE_BOT_BUT_NOT_THIS: boolean

  botDefaultSelectedLangCode: string
  botDefaultSelectedLang: any
  language: string;
  payIsVisible: boolean;
  pageNo = 0;
  has_searched: boolean = false;
  totalPagesNo_roundToUp: number;
  totalPagesAfterSearchNo_roundToUp: number;
  faqPerPageLimit: number = 25;
  fullText: string;
  fullText_temp: string;
  queryString: string;
  paginated_answers_count: number;
  IS_OPEN_SETTINGS_SIDEBAR: boolean;
  HAS_SELECTED_BOT_DETAILS: boolean = true;
  HAS_SELECTED_BOT_IMPORTEXORT: boolean = false;
  _route: string;
  public GENERAL_ROUTE_IS_ACTIVE: boolean = false;
  public INTENTS_ROUTE_IS_ACTIVE: boolean = false;
  public FULFILLMENT_ROUTE_IS_ACTIVE: boolean = false;
  public TRAINING_ROUTE_IS_ACTIVE: boolean = false;
  public TESTSITE_BASE_URL: string;
  public defaultDepartmentId: string;
  isChromeVerGreaterThan100: boolean;
  thereHasBeenAnErrorProcessing: string;
  displayImportJSONModal = 'none'
  @ViewChild('fileInputBotProfileImage', { static: false }) fileInputBotProfileImage: any;

  constructor(
    private faqService: FaqService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private faqKbService: FaqKbService,
    public location: Location,
    private notify: NotifyService,
    private prjctPlanService: ProjectPlanService,
    private translate: TranslateService,
    private uploadImageService: UploadImageService,
    private uploadImageNativeService: UploadImageNativeService,
    public appConfigService: AppConfigService,
    private usersService: UsersService,
    public brandService: BrandService,
    private departmentService: DepartmentService,
    private logger: LoggerService,
    private sanitizer: DomSanitizer
  ) {
    super();
    const brand = brandService.getBrand();
    this.tparams = brand;
  }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.getCurrentRoute();
    this.clearSearchedQuestionStored();
    this.getParamsBotIdAndThenInit();
    this.getCurrentProject();
    this.getWindowWidth();
    this.getProjectPlan();
    this.getBrowserLang();
    this.getOSCODE();
    this.checkBotImageUploadIsComplete();
    this.getParamsBotType();
    this.getTranslations();
    // this.getDeptsByProjectId();
    this.listenSidebarIsOpened();
    this.getBrowserVersion();
    this.getTestSiteUrl();
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  console.log("[WS-REQUESTS-LIST] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }

  listenSidebarIsOpened() {
    this.auth.tilebotSidebarIsOpened.subscribe((isopened) => {
      this.logger.log('[TILEBOT] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }

  getParamsBotIdAndThenInit() {
    this.id_faq_kb = this.route.snapshot.params['faqkbid'];
    this.logger.log('[NATIVE-BOT] id_faq_kb ', this.id_faq_kb);

    if (this.id_faq_kb) {
      if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
        this.checkBotImageExistOnFirebase();
      } else {
        this.checkBotImageExistOnNative();
      }

      this.getFaqKbById();
      this.getAllFaqByFaqKbId();
      this.getPaginatedFaqByFaqKbIdAndRepliesCount()
      this.getDeptsByProjectId();
    }
  }

  getCurrentRoute() {
    this._route = this.router.url
    if (this._route.indexOf('/tilebot/general') !== -1) {
      this.GENERAL_ROUTE_IS_ACTIVE = true
      this.logger.log('[TILEBOT] - GENERAL_ROUTE_IS_ACTIVE  ', this.GENERAL_ROUTE_IS_ACTIVE)
    } else {
      this.GENERAL_ROUTE_IS_ACTIVE = false
      this.logger.log('[TILEBOT] - GENERAL_ROUTE_IS_ACTIVE  ', this.GENERAL_ROUTE_IS_ACTIVE)
    }

    if (this._route.indexOf('/tilebot/intents') !== -1) {
      this.INTENTS_ROUTE_IS_ACTIVE = true
      this.logger.log('[TILEBOT] - INTENTS_ROUTE_IS_ACTIVE  ', this.INTENTS_ROUTE_IS_ACTIVE)
    } else {
      this.INTENTS_ROUTE_IS_ACTIVE = false
      this.logger.log('[TILEBOT] - INTENTS_ROUTE_IS_ACTIVE  ', this.INTENTS_ROUTE_IS_ACTIVE)
    }

    if (this._route.indexOf('/tilebot/fulfillment') !== -1) {
      this.FULFILLMENT_ROUTE_IS_ACTIVE = true
      this.logger.log('[TILEBOT] - FULFILLMENT_ROUTE_IS_ACTIVE  ', this.FULFILLMENT_ROUTE_IS_ACTIVE)
    } else {
      this.FULFILLMENT_ROUTE_IS_ACTIVE = false
      this.logger.log('[TILEBOT] - FULFILLMENT_ROUTE_IS_ACTIVE  ', this.FULFILLMENT_ROUTE_IS_ACTIVE)
    }
  }

  toggleTab(displaysecodtab) {

    // console.log('[TILEBOT] displaydetails', displaysecodtab)
    if (displaysecodtab) {
      this.HAS_SELECTED_BOT_DETAILS = false;
      this.HAS_SELECTED_BOT_IMPORTEXORT = true;
    } else {
      this.HAS_SELECTED_BOT_DETAILS = true;
      this.HAS_SELECTED_BOT_IMPORTEXORT = false;
    }

    // console.log('[TILEBOT] toggle Tab Detail / Import Export HAS_SELECTED_BOT_DETAILS', this.HAS_SELECTED_BOT_DETAILS)
    // console.log('[TILEBOT] toggle Tab Detail / Import Export HAS_SELECTED_BOT_IMPORTEXORT', this.HAS_SELECTED_BOT_IMPORTEXORT)
  }
  // hasSelectBotdetails () {
  //   this.HAS_SELECTED_BOT_DETAILS = true;
  //   this.HAS_SELECTED_BOT_IMPORTEXORT= false;

  // }

  // hasSelectImportExport () {
  //   this.HAS_SELECTED_BOT_DETAILS = false;
  //   this.HAS_SELECTED_BOT_IMPORTEXORT= true;
  // }

  // -------------------------------------------------------------------------------------- 
  // Export chatbot to JSON
  // -------------------------------------------------------------------------------------- 
  exportChatbotToJSON() {
    const exportFaqToJsonBtnEl = <HTMLElement>document.querySelector('.export-chatbot-to-json-btn');
    exportFaqToJsonBtnEl.blur();
    this.faqService.exportChatbotToJSON(this.id_faq_kb).subscribe((faq: any) => {
      // console.log('[TILEBOT] - EXPORT CHATBOT TO JSON - FAQS', faq)
      // console.log('[TILEBOT] - EXPORT FAQ TO JSON - FAQS INTENTS', faq.intents)
      if (faq) {
        this.downloadObjectAsJson(faq, faq.name);
      }
    }, (error) => {
      this.logger.error('[TILEBOT] - EXPORT BOT TO JSON - ERROR', error);
    }, () => {
      this.logger.log('[TILEBOT] - EXPORT BOT TO JSON - COMPLETE');
    });
  }

  // -------------------------------------------------------------------------------------- 
  // Export intents to JSON
  // -------------------------------------------------------------------------------------- 
  exportIntentsToJSON() {
    const exportFaqToJsonBtnEl = <HTMLElement>document.querySelector('.export-intents-to-json-btn');
    exportFaqToJsonBtnEl.blur();
    this.faqService.exportIntentsToJSON(this.id_faq_kb).subscribe((faq: any) => {
      // console.log('[TILEBOT] - EXPORT BOT TO JSON - FAQS', faq)
      // console.log('[TILEBOT] - EXPORT FAQ TO JSON - FAQS INTENTS', faq.intents)
      if (faq) {
        this.downloadObjectAsJson(faq, this.faqKb_name + ' intents');
      }
    }, (error) => {
      this.logger.error('[TILEBOT] - EXPORT BOT TO JSON - ERROR', error);
    }, () => {
      this.logger.log('[TILEBOT] - EXPORT BOT TO JSON - COMPLETE');

    });
  }

  downloadObjectAsJson(exportObj, exportName) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  // --------------------------------------------------------------------------
  // @ Import chatbot from json ! NOT USED
  // --------------------------------------------------------------------------
  fileChangeUploadChatbotFromJSON(event) {

    this.logger.log('[TILEBOT] - fileChangeUploadChatbotFromJSON $event ', event);
    let fileJsonToUpload = ''
    // console.log('[TILEBOT] - fileChangeUploadChatbotFromJSON $event  target', event.target);
    const selectedFile = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(selectedFile, "UTF-8");
    fileReader.onload = () => {
      fileJsonToUpload = JSON.parse(fileReader.result as string)
      this.logger.log('fileJsonToUpload CHATBOT', fileJsonToUpload);
    }
    fileReader.onerror = (error) => {
      this.logger.log(error);
    }

    this.faqService.importChatbotFromJSON(this.id_faq_kb, fileJsonToUpload).subscribe((res: any) => {
      this.logger.log('[TILEBOT] - IMPORT CHATBOT FROM JSON - ', res)

    }, (error) => {
      this.logger.error('[TILEBOT] -  IMPORT CHATBOT FROM JSON- ERROR', error);

      this.notify.showWidgetStyleUpdateNotification("thereHasBeenAnErrorProcessing", 4, 'report_problem');
    }, () => {
      this.logger.log('[TILEBOT] - IMPORT CHATBOT FROM JSON - COMPLETE');
    });
  }


  // --------------------------------------------------------------------------
  // @ Import Itents from JSON
  // --------------------------------------------------------------------------
  presentModalImportIntentsFromJson() {
    this.displayImportJSONModal = "block"
  }

  onCloseImportJSONModal() {
    this.displayImportJSONModal = "none"
  }

  fileChangeUploadIntentsFromJSON(event, action) {
    // console.log('[TILEBOT] - fileChangeUploadJSON event ', event);
    // console.log('[TILEBOT] - fileChangeUploadJSON action ', action);
    const fileList: FileList = event.target.files;
    const file: File = fileList[0];
    const formData: FormData = new FormData();
    formData.set('id_faq_kb', this.id_faq_kb);
    formData.append('uploadFile', file, file.name);
    this.logger.log('FORM DATA ', formData)

    this.faqService.importIntentsFromJSON(this.id_faq_kb, formData ,action).subscribe((res: any) => {
      this.logger.log('[TILEBOT] - IMPORT INTENTS FROM JSON - ', res)

    }, (error) => {
      this.logger.error('[TILEBOT] -  IMPORT INTENTS FROM JSON- ERROR', error);

      this.notify.showWidgetStyleUpdateNotification("thereHasBeenAnErrorProcessing", 4, 'report_problem');
    }, () => {
      this.logger.log('[TILEBOT] - IMPORT INTENTS FROM JSON - * COMPLETE *');
      this.notify.showWidgetStyleUpdateNotification("File was uploaded succesfully", 2, 'done');

      this.onCloseImportJSONModal();
      
    });
  }


  onSelectBotDefaultlang(selectedDefaultBotLang) {
    this.logger.log('onSelectBotDefaultlang > selectedDefaultBotLang ', selectedDefaultBotLang)
    if (selectedDefaultBotLang) {
      this.botDefaultSelectedLangCode = selectedDefaultBotLang.code;
      this.logger.log('onSelectBotDefaultlang > selectedDefaultBotLang > code', this.botDefaultSelectedLangCode)
    }
  }

  getTranslations() {
    this.translate.get('UpdateBotError')
      .subscribe((text: string) => {
        this.updateBotError = text;
      });

    this.translate.get('UpdateBotSuccess')
      .subscribe((text: string) => {
        this.updateBotSuccess = text;
      });

    this.translate.get('Not a valid JSON file.')
      .subscribe((text: string) => {
        this.notValidJson = text;
      });

    this.translate.get('FaqPage.AnErrorOccurredWhilDeletingTheAnswer')
      .subscribe((text: string) => {
        this.errorDeletingAnswerMsg = text;
      });

    this.translate.get('FaqPage.AnswerSuccessfullyDeleted')
      .subscribe((text: string) => {
        this.answerSuccessfullyDeleted = text;
      });

    this.translate.get('Done')
      .subscribe((text: string) => {
        this.done_msg = text;
      });


    this.translate.get('ThereHasBeenAnErrorProcessing')
      .subscribe((translation: any) => {
        this.thereHasBeenAnErrorProcessing = translation;
      });

  }

  getParamsBotType() {
    this.route.params.subscribe((params) => {
      this.logger.log('[TILEBOT] - params ', params)
      this.botType = params.type;
      this.logger.log('[TILEBOT] - this.botType ', this.botType)
      if (this.botType && this.botType === 'tilebot') {
        this.botTypeForInput = 'Tilebot'
      }

      this.logger.log('[TILEBOT] --->  PARAMS', params);
      this.logger.log('[TILEBOT] ***** PARAMS botType', this.botType);
    });
  }

  toggleWebhook($event) {
    this.logger.log('[TILEBOT] toggleWebhook ', $event.target.checked);
    this.webhook_is_enabled = $event.target.checked

    this.validateUrl(this.webhookUrl)

    this.logger.log('[TILEBOT] validateUrl URL WEBHOOK_URL_IS_EMPTY (toggleWebhook) ', this.WEBHOOK_URL_IS_EMPTY);
    this.logger.log('[TILEBOT] validateUrl URL WEBHOOK_URL_IS_HTTPS (toggleWebhook) ', this.WEBHOOK_URL_IS_HTTPS);
    this.logger.log('[TILEBOT] validateUrl URL WEBHOOK_URL_IS_VALID (toggleWebhook) ', this.WEBHOOK_URL_IS_VALID);
    if (this.webhook_is_enabled === false && this.WEBHOOK_URL_IS_EMPTY === false) {

      if (this.WEBHOOK_URL_HAS_ERROR === true) {
        this.webhookUrl = '';
      }
    }
  }

  validateUrl(str) {
    this.logger.log('[TILEBOT] validateUrl WEBHOOK URL ', str)
    if (str && str.length > 0) {
      this.WEBHOOK_URL_IS_EMPTY = false;
      this.logger.log('[TILEBOT] validateUrl WEBHOOK URL is EMPTY ', this.WEBHOOK_URL_IS_EMPTY)
      var url = str;

      if (url.indexOf("http://") == 0 || (url.indexOf("https://") == 0)) {
        this.WEBHOOK_URL_IS_HTTP_or_HTTPS = true
        this.WEBHOOK_URL_IS_HTTPS = false
        this.WEBHOOK_URL_HAS_ERROR = false;
        this.logger.log('[TILEBOT] validateUrl URL START WITH HTTP ', this.WEBHOOK_URL_IS_HTTPS)
        this.checkIfIsValidUrl(str)

      } else {
        this.WEBHOOK_URL_IS_HTTP_or_HTTPS = false
      }

    } else {
      this.WEBHOOK_URL_IS_EMPTY = true;
      this.WEBHOOK_URL_HAS_ERROR = true;
    }
  }

  checkIfIsValidUrl(str) {
    var pattern = /^(http|https):\/\/(([a-zA-Z0-9$\-_.+!*'(),;:&=]|%[0-9a-fA-F]{2})+@)?(((25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])){3})|localhost|([a-zA-Z0-9\-\u00C0-\u017F]+\.)+([a-zA-Z]{2,}))(:[0-9]+)?(\/(([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*(\/([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*)*)?(\?([a-zA-Z0-9$\-_.+!*'(),;:@&=\/?]|%[0-9a-fA-F]{2})*)?(\#([a-zA-Z0-9$\-_.+!*'(),;:@&=\/?]|%[0-9a-fA-F]{2})*)?)?$/; // fragment locator

    this.logger.log('[TILEBOT] validateUrl URL - URL IS VALID (pattern.test)', pattern.test(str));

    if (pattern.test(str) === true) {
      this.WEBHOOK_URL_IS_VALID = true;
      this.WEBHOOK_URL_HAS_ERROR = false;
      this.logger.log('[TILEBOT] validateUrl URL - URL IS VALID ', this.WEBHOOK_URL_IS_VALID);
    } else {
      this.WEBHOOK_URL_IS_VALID = false;
      this.WEBHOOK_URL_HAS_ERROR = true;
      this.logger.log('[TILEBOT] validateUrl URL - URL IS VALID ', this.WEBHOOK_URL_IS_VALID);
    }

    // return !!pattern.test(str);
  }

  onChangeWebhookUrl($event) {
    this.logger.log('[TILEBOT] validateUrl URL - onChangeWebhookUrl ', $event);
    this.validateUrl($event)
  }

  checkValueIntentName(event: any) {
    // this.logger.log('Faqcomponent check value display_intent_name_in_table event' , event) 
    this.logger.log('[TILEBOT] check value display_intent_name_in_table', this.display_intent_name_in_table)
  }
  checkValueMessage($event) {
    this.logger.log('[TILEBOT] check value display_message_in_table', this.display_message_in_table)
  }
  checkQuestions($event) {
    this.logger.log('[TILEBOT] check value display_questions_in_table', this.display_questions_in_table)
  }

  checkAnswer($event) {
    this.logger.log('[TILEBOT] check value display_answer_in_table', this.display_answer_in_table)
  }

  checkValueTopic(event: any) {
    this.logger.log('[TILEBOT] check value display_topic_in_table', this.display_topic_in_table)
  }

  getDeptsByProjectId() {
    this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {
      this.logger.log('[TILEBOT] - DEPT GET DEPTS ', departments);
      this.logger.log('[TILEBOT] - DEPT BOT ID ', this.id_faq_kb);

      if (departments) {
        this.all_depts = departments;

        let count = 0;
        let countOfVisibleDepts = 0;

        departments.forEach((dept: any) => {
          // console.log('[TILEBOT] - DEPT', dept);

          if (dept.default === true) {
            this.defaultDepartmentId = dept._id;
            this.logger.log('[TILEBOT] - DEFAULT DEPT ID ',  this.defaultDepartmentId);
          }

          if (dept.hasBot === true) {
            if (this.id_faq_kb === dept.id_bot) {
              this.logger.log('[TILEBOT] - DEPT DEPT WITH CURRENT BOT ', dept);

              count = count + 1;
              // -------------------------------------------------------------------
              // Dept's avatar
              // -------------------------------------------------------------------
              let newInitials = '';
              let newFillColour = '';
              if (dept.name) {
                newInitials = avatarPlaceholder(dept.name);
                if (dept.default !== true) {
                  newFillColour = getColorBck(dept.name);
                } else if (dept.default === true && departments.length === 1) {
                  newFillColour = '#6264A7'
                } else if (dept.default === true && departments.length > 1) {
                  newFillColour = 'rgba(98, 100, 167, 0.6) '
                }
              } else {
                newInitials = 'N/A.';
                newFillColour = '#eeeeee';
              }

              dept['dept_name_initial'] = newInitials;
              dept['dept_name_fillcolour'] = newFillColour;

              // // -------------------------------------------------------------------
              // // Dept's description
              // // -------------------------------------------------------------------
              // if (dept.description) {
              //   let stripHere = 20;
              //   dept['truncated_desc'] = dept.description.substring(0, stripHere) + '...';
              // }
              const index = this.DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY.findIndex((d) => d._id === dept._id);

              if (index === -1) {
                this.DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY.push(dept)
              }
              // this.DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY.indexOf(dept) === -1 ? this.DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY.push(dept) : this.logger.log("This item already exists");

              // this.DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY.push(dept)
            }
          } else if (dept.hasBot === false) {
            // this.depts_length = departments.length
            this.logger.log('[TILEBOT] --->  DEPT botType ', this.botType);

            if (this.botType !== 'identity') {
              const index = this.depts_without_bot_array.findIndex((d) => d._id === dept._id);

              if (index === -1) {
                this.depts_without_bot_array.push(dept)
              }

              if (dept.default === false && dept.status === 1) {
                countOfVisibleDepts = countOfVisibleDepts + 1;
              }

            }
          }
        });

        this.logger.log('[TILEBOT] ---> Current bot is found in DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY', this.DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY);

        const hasFoundBotIn = this.DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY.filter((obj: any) => {
          return obj.id_bot === this.id_faq_kb;
        });

        if (hasFoundBotIn.length > 0) {
          this.DEPTS_HAVE_BOT_BUT_NOT_THIS = false
          this.logger.log('[TILEBOT] ---> Current bot is found in DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY', this.DEPTS_HAVE_BOT_BUT_NOT_THIS);
        } else {
          this.DEPTS_HAVE_BOT_BUT_NOT_THIS = true
          this.logger.log('[TILEBOT] ---> Current bot is NOT found in DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY', this.DEPTS_HAVE_BOT_BUT_NOT_THIS);
        }

        this.logger.log('[TILEBOT] - DEPT - DEPTS WITHOUT BOT', this.depts_without_bot_array);

        this.COUNT_DEPTS_BOT_IS_ASSOCIATED_WITH = count;
        this.logger.log('[TILEBOT] - DEPT - COUNT_DEPTS_BOT_IS_ASSOCIATED_WITH', this.COUNT_DEPTS_BOT_IS_ASSOCIATED_WITH);

        this.COUNT_OF_VISIBLE_DEPT = countOfVisibleDepts;
        this.logger.log('[TILEBOT] - DEPT - COUNT_OF_VISIBLE_DEPT', this.COUNT_OF_VISIBLE_DEPT);
      }
    }, error => {

      this.logger.error('[TILEBOT] - DEPT - GET DEPTS  - ERROR', error);
    }, () => {
      this.logger.log('[TILEBOT] - DEPT - GET DEPTS - COMPLETE')

    });
  }

  onSelectDept() {
    this.logger.log('[TILEBOT] --->  onSelectDept dept_id', this.dept_id);
    this.logger.log('[TILEBOT] --->  onSelectDept selected_dept_id', this.selected_dept_id);
    this.logger.log('[TILEBOT] --->  onSelectDept id_faq_kb', this.id_faq_kb);
    this.dept_id = this.selected_dept_id


    const hasFound = this.depts_without_bot_array.filter((obj: any) => {
      return obj.id === this.selected_dept_id;
    });
    this.logger.log('[TILEBOT] --->  onSelectBotId dept found', hasFound);

    if (hasFound.length > 0) {
      this.selected_dept_name = hasFound[0]['name']
    }
    // this.hookBotToDept()
  }

  hookBotToDept() {
    this.departmentService.updateExistingDeptWithSelectedBot(this.dept_id, this.id_faq_kb).subscribe((res) => {
      this.logger.log('[TILEBOT] - UPDATE EXISTING DEPT WITH SELECED BOT - RES ', res);
    }, (error) => {
      this.logger.error('[TILEBOT] - UPDATE EXISTING DEPT WITH SELECED BOT - ERROR ', error);
    }, () => {
      this.logger.log('[TILEBOT] - UPDATE EXISTING DEPT WITH SELECED BOT * COMPLETE *');
      this.translateAndPresentModalBotAssociatedWithDepartment();
    });
  }

  translateAndPresentModalBotAssociatedWithDepartment() {
    let parametres = { bot_name: this.faqKb_name, dept_name: this.selected_dept_name };

    this.translate.get("BotHasBeenAssociatedWithDepartment", parametres).subscribe((res: string) => {
      this.botHasBeenAssociatedWithDept = res
    });

    swal({
      title: this.done_msg + "!",
      text: this.botHasBeenAssociatedWithDept,
      icon: "success",
      button: "OK",
      dangerMode: false,
    }).then((WillUpdated) => {
      this.getDeptsByProjectId()
      this.depts_without_bot_array = []
    })
  }

  // ---------------------------------------------------
  // Upload bot photo
  // ---------------------------------------------------
  upload(event) {
    this.logger.log('[TILEBOT] BOT PROFILE IMAGE (FAQ-COMP) upload')
    this.showSpinnerInUploadImageBtn = true;
    const file = event.target.files[0]

    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.uploadImageService.uploadBotAvatar(file, this.id_faq_kb);
    } else {

      // Native upload
      this.logger.log('[TILEBOT] BOT PROFILE IMAGE upload with native service')

      this.uploadImageNativeService.uploadBotPhotoProfile_Native(file, this.id_faq_kb).subscribe((downoloadurl) => {
        this.logger.log('[TILEBOT] BOT PROFILE IMAGE upload with native service - RES downoloadurl', downoloadurl);

        this.botProfileImageurl = downoloadurl

        this.timeStamp = (new Date()).getTime();
      }, (error) => {

        this.logger.error('[TILEBOT] BOT PROFILE IMAGE (FAQ-COMP) upload with native service - ERR ', error);
      })

    }
    this.fileInputBotProfileImage.nativeElement.value = '';
  }

  // ---------------------------------------------------
  // Delete bot photo
  // ---------------------------------------------------
  deleteBotProfileImage() {
    // const file = event.target.files[0]
    this.logger.log('[TILEBOT] BOT PROFILE IMAGE (FAQ-COMP) deleteBotProfileImage')

    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.uploadImageService.deleteBotProfileImage(this.id_faq_kb);
    } else {
      this.logger.log('[TILEBOT] BOT PROFILE IMAGE (FAQ-COMP) deleteUserProfileImage with native service')
      this.uploadImageNativeService.deletePhotoProfile_Native(this.id_faq_kb, 'bot')
    }
    this.botProfileImageExist = false;
    this.botImageHasBeenUploaded = false;

    const delete_bot_image_btn = <HTMLElement>document.querySelector('.delete_bot_image_btn');
    delete_bot_image_btn.blur();
  }

  checkBotImageExistOnFirebase() {
    this.logger.log('[TILEBOT] checkBotImageExistOnFirebase (FAQ-COMP) ')
    this.logger.log('[TILEBOT] STORAGE-BUCKET (FAQ-COMP) firebase_conf ', this.appConfigService.getConfig().firebase)

    const firebase_conf = this.appConfigService.getConfig().firebase;
    if (firebase_conf) {
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[TILEBOT] STORAGE-BUCKET (FAQ-COMP) ', this.storageBucket)
    }

    const imageUrl = 'https://firebasestorage.googleapis.com/v0/b/' + this.storageBucket + '/o/profiles%2F' + this.id_faq_kb + '%2Fphoto.jpg?alt=media';

    const self = this;
    this.verifyImageURL(imageUrl, function (imageExists) {

      if (imageExists === true) {
        self.botProfileImageExist = imageExists

        self.logger.log('[TILEBOT] BOT PROFILE IMAGE (FAQ-COMP) - BOT PROFILE IMAGE EXIST ? ', imageExists, 'usecase firebase')
        self.setImageProfileUrl(self.storageBucket);
      } else {
        self.botProfileImageExist = imageExists

        self.logger.log('[TILEBOT] BOT PROFILE IMAGE (FAQ-COMP) - BOT PROFILE IMAGE EXIST ? ', imageExists, 'usecase firebase')
      }
    })
  }

  checkBotImageExistOnNative() {
    const baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;
    const imageUrl = baseUrl + 'images?path=uploads%2Fusers%2F' + this.id_faq_kb + '%2Fimages%2Fthumbnails_200_200-photo.jpg';
    const self = this;
    this.verifyImageURL(imageUrl, function (imageExists) {

      if (imageExists === true) {
        self.botProfileImageExist = imageExists

        self.logger.log('[TILEBOT] BOT PROFILE IMAGE (FAQ-COMP) - BOT PROFILE IMAGE EXIST ? ', imageExists, 'usecase native')

        self.setImageProfileUrl_Native(baseUrl)

      } else {
        self.botProfileImageExist = imageExists

        self.logger.log('[TILEBOT] BOT PROFILE IMAGE (FAQ-COMP) - BOT PROFILE IMAGE EXIST ? ', imageExists, 'usecase native')
      }
    })
  }

  verifyImageURL(image_url, callBack) {
    const img = new Image();
    img.src = image_url;
    img.onload = function () {
      callBack(true);
    };
    img.onerror = function () {
      callBack(false);
    };
  }

  checkBotImageUploadIsComplete() {
    this.logger.log('[TILEBOT] checkBotImageUploadIsComplete')
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {

      this.uploadImageService.botImageWasUploaded.subscribe((imageuploaded) => {
        this.logger.log('[TILEBOT] BOT PROFILE IMAGE - IMAGE UPLOADING IS COMPLETE ? ', imageuploaded, '(usecase Firebase)');
        this.botImageHasBeenUploaded = imageuploaded;

        if (this.storageBucket && this.botImageHasBeenUploaded === true) {

          this.showSpinnerInUploadImageBtn = false;

          this.logger.log('[TILEBOT] BOT PROFILE IMAGE (FAQ-COMP) - IMAGE UPLOADING IS COMPLETE - BUILD botProfileImageurl ');

          this.setImageProfileUrl(this.storageBucket)
        }
      });
    } else {
      // Native
      this.uploadImageNativeService.botImageWasUploaded_Native.subscribe((imageuploaded) => {
        this.logger.log('[TILEBOT] BOT PROFILE IMAGE - IMAGE UPLOADING IS COMPLETE ? ', imageuploaded, '(usecase Native)');

        this.botImageHasBeenUploaded = imageuploaded;

        this.showSpinnerInUploadImageBtn = false;

        // here "setImageProfileUrl" is missing because in the "upload" method there is the subscription to the downoload
        // url published by the BehaviourSubject in the service
      })
    }
  }

  setImageProfileUrl(storageBucket) {
    this.botProfileImageurl = 'https://firebasestorage.googleapis.com/v0/b/' + storageBucket + '/o/profiles%2F' + this.id_faq_kb + '%2Fphoto.jpg?alt=media';

    this.timeStamp = (new Date()).getTime();
  }

  setImageProfileUrl_Native(storage) {
    this.botProfileImageurl = storage + 'images?path=uploads%2Fusers%2F' + this.id_faq_kb + '%2Fimages%2Fthumbnails_200_200-photo.jpg';
    // this.logger.log('PROFILE IMAGE (USER-PROFILE ) - userProfileImageurl ', this.userProfileImageurl);
    this.timeStamp = (new Date()).getTime();
  }

  getBotProfileImage() {
    if (this.timeStamp) {
      return this.sanitizer.bypassSecurityTrustUrl(this.botProfileImageurl + '&' + this.timeStamp);
    }
    return this.sanitizer.bypassSecurityTrustUrl(this.botProfileImageurl)
  }

  getBrowserLang() {
    this.browserLang = this.translate.getBrowserLang();
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;

    let keys = this.public_Key.split("-");

    keys.forEach(key => {

      if (key.includes("DEP")) {
        let dep = key.split(":");
        if (dep[1] === "F") {
          this.isVisibleDEP = false;
          // this.logger.log('PUBLIC-KEY (Faqcomponent) - isVisibleDEP', this.isVisibleDEP);
        } else {
          this.isVisibleDEP = true;
          // this.logger.log('PUBLIC-KEY (Faqcomponent) - isVisibleDEP', this.isVisibleDEP);
        }
      }
      if (key.includes("PAY")) {
        this.logger.log('[TILEBOT] PUBLIC-KEY - key', key);
        let pay = key.split(":");
        // this.logger.log('PUBLIC-KEY (Navbar) - pay key&value', pay);
        if (pay[1] === "F") {
          this.payIsVisible = false;
          this.logger.log('[TILEBOT] - pay isVisible', this.payIsVisible);
        } else {
          this.payIsVisible = true;
          this.logger.log('[TILEBOT] - pay isVisible', this.payIsVisible);
        }
      }
      if (key.includes("ANA")) {

        let ana = key.split(":");

        if (ana[1] === "F") {
          this.isVisibleAnalytics = false;
        } else {
          this.isVisibleAnalytics = true;
        }
      }

    });

    if (!this.public_Key.includes("DEP")) {
      this.isVisibleDEP = false;
    }

    if (!this.public_Key.includes("ANA")) {
      this.isVisibleAnalytics = false;
    }

    if (!this.public_Key.includes("PAY")) {
      this.payIsVisible = false;
      // this.logger.log('[TILEBOT] - pay isVisible', this.payIsVisible);
    }
  }

  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      this.logger.log('[TILEBOT] -getProjectPlan - project Profile Data', projectProfileData)
      if (projectProfileData) {

        this.prjct_profile_type = projectProfileData.profile_type;
        this.subscription_is_active = projectProfileData.subscription_is_active;

        this.subscription_end_date = projectProfileData.subscription_end_date;
        this.trial_expired = projectProfileData.trial_expired

        this.buildPlanName(projectProfileData.profile_name, this.browserLang, this.prjct_profile_type);
      }
    }, error => {
      this.logger.error('[TILEBOT] - getProjectPlan - ERROR', error);
    }, () => {
      this.logger.log('[TILEBOT] - getProjectPlan - COMPLETE')
    });
  }

  buildPlanName(planName: string, browserLang: string, planType: string) {
    if (planType === 'payment') {
      this.getPaidPlanTranslation(planName)
      // if (browserLang === 'it') {
      //   this.prjct_profile_name = 'Piano ' + planName;
      //   return this.prjct_profile_name
      // } else if (browserLang !== 'it') {
      //   this.prjct_profile_name = planName + ' Plan';
      //   return this.prjct_profile_name
      // }
    }
  }

  getPaidPlanTranslation(project_profile_name) {
    this.translate.get('PaydPlanName', { projectprofile: project_profile_name })
      .subscribe((text: string) => {
        this.prjct_profile_name = text;
        // this.logger.log('+ + + PaydPlanName ', text)
      });
  }

  getWindowWidth() {
    const actualWidth = window.innerWidth;
    this.logger.log('[TILEBOT] - ACTUAL WIDTH ', actualWidth);

    if (actualWidth > 764) {
      this.windowWidthMore764 = true;
    } else {
      this.windowWidthMore764 = false;
    }

    if (actualWidth > 991) {
      this.windowWidthMore991 = true;
    } else {
      this.windowWidthMore991 = false;
    }

  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const newInnerWidth = event.target.innerWidth;
    this.logger.log('[TILEBOT] - NEW INNER WIDTH ', newInnerWidth);
    if (newInnerWidth > 764) {
      this.windowWidthMore764 = true;
    } else {
      this.windowWidthMore764 = false;
    }

    if (newInnerWidth > 991) {
      this.windowWidthMore991 = true;
      this.logger.log('[TILEBOT] - windowWidthMore991 ', this.windowWidthMore991);
    } else {
      this.windowWidthMore991 = false;
      this.logger.log('[TILEBOT] - windowWidthMore991 ', this.windowWidthMore991);
    }
  }

  clearSearchedQuestionStored() {
    // localStorage.setItem('searchedQuestion', '');
    localStorage.removeItem('searchedQuestion')
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project;
      this.logger.log('[TILEBOT] project from AUTH service subscription  ', this.project)
    });
  }

  getFaqKbById() {
    this.showSpinnerInUpdateBotCard = true

    this.faqKbService.getFaqKbById(this.id_faq_kb).subscribe((faqkb: any) => {
      this.logger.log('[TILEBOT] GET FAQ-KB (DETAILS) BY ID (SUBSTITUTE BOT) ', faqkb);

      this.faq_kb_remoteKey = faqkb.kbkey_remote
      this.logger.log('[TILEBOT] GET FAQ-KB (DETAILS) BY ID - FAQKB REMOTE KEY ', this.faq_kb_remoteKey);

      this.faqKb_name = faqkb.name;
      this.logger.log('[TILEBOT] GET FAQ-KB (DETAILS) BY ID - FAQKB NAME', this.faqKb_name);

      // this.faqKbService.publishFaqName(this.faqKb_name)

      this.faqKb_id = faqkb._id;
      this.logger.log('[TILEBOT] GET FAQ-KB (DETAILS) BY ID - FAQKB ID', this.faqKb_id);

      this.faqKb_created_at = faqkb.createdAt;
      this.logger.log('[TILEBOT] GET FAQ-KB (DETAILS) BY ID - CREATED AT ', this.faqKb_created_at);

      this.faqKb_description = faqkb.description;
      this.logger.log('[TILEBOT] GET FAQ-KB (DETAILS) BY ID - Description ', this.faqKb_description);

      this.webhook_is_enabled = faqkb.webhook_enabled
      this.logger.log('[TILEBOT] GET FAQ-KB (DETAILS) BY ID - webhook_is_enabled ', this.webhook_is_enabled);

      this.webhookUrl = faqkb.webhook_url
      this.logger.log('[TILEBOT] GET FAQ-KB (DETAILS) BY ID - webhookUrl ', this.webhookUrl);

      this.logger.log('[TILEBOT] GET FAQ-KB (DETAILS) BY ID - LANGUAGE ', faqkb.language);

      // for the comnobobox "select bot language" -now not used because the user cannot change the language of the bot he chose during creation
      // this.botDefaultSelectedLang = this.botDefaultLanguages[this.getIndexOfbotDefaultLanguages(faqkb.language)]
      // this.logger.log('[TILEBOT] GET FAQ-KB (DETAILS) BY ID  (ONLY FOR NATIVE BOT i.e. Resolution) LANGUAGE ', this.botDefaultSelectedLang);
      if (faqkb && faqkb.language) {
        this.faqkb_language = faqkb.language;
        this.botDefaultSelectedLang = this.botDefaultLanguages[this.getIndexOfbotDefaultLanguages(faqkb.language)].name
        this.logger.log('[TILEBOT] GET FAQ-KB (DETAILS) BY ID  (ONLY FOR NATIVE BOT i.e. Resolution) LANGUAGE ', this.botDefaultSelectedLang);
      }

      if (faqkb.webhook_enabled) {
        this.validateUrl(this.webhookUrl)
      }


      if (faqkb.url !== 'undefined') {
        this.faqKbUrlToUpdate = faqkb.url;
        this.logger.log('[TILEBOT] GET FAQ-KB (DETAILS) BY ID - BOT URL ', this.faqKbUrlToUpdate);
      } else {
        this.logger.log('[TILEBOT] GET FAQ-KB (DETAILS) BY ID - BOT URL is undefined ', faqkb.url);
      }

    },
      (error) => {
        this.logger.error('[TILEBOT] GET FAQ-KB BY ID (SUBSTITUTE BOT) - ERROR ', error);
        this.showSpinnerInUpdateBotCard = false
      },
      () => {
        this.logger.log('[TILEBOT] GET FAQ-KB ID (SUBSTITUTE BOT) - COMPLETE ');
        this.showSpinnerInUpdateBotCard = false
      });

  }

  editBot() {
    // RESOLVE THE BUG 'edit button remains focused after clicking'
    this.elementRef.nativeElement.blur();

    // console.log('[TILEBOT] FAQ KB NAME TO UPDATE ', this.faqKb_name);


    this.faqKbService.updateFaqKb(this.id_faq_kb, this.faqKb_name, this.faqKbUrlToUpdate, this.botType, this.faqKb_description, this.webhook_is_enabled, this.webhookUrl, this.language)
      .subscribe((faqKb) => {
        this.logger.log('[TILEBOT] EDIT BOT - FAQ KB UPDATED ', faqKb);
      }, (error) => {
        this.logger.error('[TILEBOT] EDIT BOT -  ERROR ', error);


        // =========== NOTIFY ERROR ===========
        this.notify.showWidgetStyleUpdateNotification(this.updateBotError, 4, 'report_problem');

      }, () => {
        this.logger.log('[TILEBOT] EDIT BOT - * COMPLETE *');
        // =========== NOTIFY SUCCESS===========
        this.notify.showWidgetStyleUpdateNotification(this.updateBotSuccess, 2, 'done');
      });
  }

  goToRoutingAndDepts() {
    this.router.navigate(['project/' + this.project._id + '/departments']);
  }

  goToEditAddPage_EDIT_DEPT(deptid, deptdefaut) {
    this.router.navigate(['project/' + this.project._id + '/department/edit', deptid]);
  }

  goToEditAddPage_CREATE() {
    this.logger.log('[TILEBOT] ID OF FAQKB ', this.id_faq_kb);
    // console.log('1 goToEditAddPage_CREATE:   ', this.faqkb_language);
    this.router.navigate(['project/' + this.project._id + '/createfaq', this.id_faq_kb, this.botType, this.faqkb_language]);
  }

  // GO TO FAQ-EDIT-ADD COMPONENT AND PASS THE FAQ ID (RECEIVED FROM THE VIEW) AND
  // THE FAQ-KB ID (RECEIVED FROM FAQ-KB COMPONENT)
  goToEditAddPage_EDIT(faq_id: string) {
    this.logger.log('[TILEBOT] ID OF FAQ ', faq_id);
    this.router.navigate(['project/' + this.project._id + '/editfaq', this.id_faq_kb, faq_id, this.botType]);
  }

  getTestSiteUrl() {
    this.TESTSITE_BASE_URL = this.appConfigService.getConfig().WIDGET_BASE_URL + 'assets/twp/index.html';
    this.logger.log('[TEMPLATE DETAIL] AppConfigService getAppConfig TESTSITE_BASE_URL', this.TESTSITE_BASE_URL);
  }

  openTestSiteInPopupWindow() {
    // console.log('openTestSiteInPopupWindow TESTSITE_BASE_URL', this.TESTSITE_BASE_URL)
    const testItOutBaseUrl = this.TESTSITE_BASE_URL.substring(0, this.TESTSITE_BASE_URL.lastIndexOf('/'));
    const testItOutUrl = testItOutBaseUrl + '/chatbot-panel.html'
    // console.log('openTestSiteInPopupWindow testItOutBaseUrl' , testItOutBaseUrl )  
    const url = testItOutUrl + '?tiledesk_projectid=' + this.project._id + '&tiledesk_participants=bot_' + this.id_faq_kb + "&tiledesk_departmentID=" + this.defaultDepartmentId
    // console.log('openTestSiteInPopupWindow URL ', url) 
    let params = `toolbar=no,menubar=no,width=815,height=727,left=100,top=100`;
    window.open(url, '_blank', params);
  }
  // old
  goToOLDEditAddPage_EDIT(faq_id) {
    this.router.navigate(['project/' + this.project._id + '/_editfaq', this.id_faq_kb, faq_id, this.botType]);
  }
  goOLDToEditAddPage_CREATE () {
    this.router.navigate(['project/' + this.project._id + '/_createfaq', this.id_faq_kb, this.botType, this.faqkb_language]);
  }

  goBack() {
    // this.router.navigate(['project/' + this.project._id + '/bots']);
    this.router.navigate(['project/' + this.project._id + '/bots/my-chatbots/all']);
  }

  // ----------------------------------------------------------------
  // GET ONLY THE FAQ WITH THE FAQ-KB ID PASSED FROM FAQ-KB COMPONENT 
  // ----------------------------------------------------------------
  getAllFaqByFaqKbId() {
    this.faqService.getAllFaqByFaqKbId(this.id_faq_kb).subscribe((faq: any) => {
      this.logger.log('[TILEBOT] - GET ALL FAQ BY BOT ID', faq);

      if (faq) {

        if (this.has_searched === false) {
          this.faq_lenght = faq.length
          const totalPagesNo = faq.length / this.faqPerPageLimit;
          this.totalPagesNo_roundToUp = Math.ceil(totalPagesNo);
        }

      }
    }, (error) => {
      this.logger.error('[TILEBOT] >> FAQs GOT BY FAQ-KB ID - ERR ', error);
    }, () => {
      this.logger.log('[TILEBOT] >> FAQs GOT BY FAQ-KB ID - COMPLETE');
    });
  }

  fulltextChange($event) {
    this.logger.log('[TILEBOT] - fulltextChange ', $event);
    this.fullText = $event
    this.logger.log('[TILEBOT] - fulltextChange  $event length', $event.length);
    if ($event.length === 0) {
      this.queryString = undefined;
      this.has_searched = false;
      this.getPaginatedFaqByFaqKbIdAndRepliesCount();
      this.getAllFaqByFaqKbId()
    }
  }

  clearFullText() {
    this.fullText = '';
    this.queryString = undefined;
    this.has_searched = false;
    this.getPaginatedFaqByFaqKbIdAndRepliesCount();
    this.getAllFaqByFaqKbId()
  }

  searchOnEnterPressed(event: any) {
    this.logger.log('searchOnEnterPressed event', event);
    if (event.key === "Enter") {
      this.search()
    }
  }

  search() {
    this.pageNo = 0
    if (this.fullText && this.fullText.length > 0) {
      this.has_searched = true;
      this.queryString = this.fullText;
    }
    // else {
    //   console.log('[TILEBOT] - FULL TEXT SEARCH ', this.fullText);
    //   this.fullText_temp = '';
    // }

    // this.queryString = this.fullText_temp
    this.logger.log('[TILEBOT] - FULL TEXT SEARCH ', this.queryString)
    this.getPaginatedFaqByFaqKbIdAndRepliesCount();
    this.getAllSearcedFaq()
  }

  // ------------------------------------------------------------------------------
  // PAGINATION
  // ------------------------------------------------------------------------------
  decreasePageNumber() {
    this.pageNo -= 1;
    this.logger.log('[TILEBOT] - DECREASE PAGE NUMBER ', this.pageNo);
    this.getPaginatedFaqByFaqKbIdAndRepliesCount()
  }

  increasePageNumber() {
    this.pageNo += 1;
    this.logger.log('[TILEBOT] - INCREASE PAGE NUMBER ', this.pageNo);
    this.getPaginatedFaqByFaqKbIdAndRepliesCount()
  }

  // -----------------------------------------------------------------------------------------
  // GET PAGINATED FAQS
  // -----------------------------------------------------------------------------------------
  getPaginatedFaqByFaqKbIdAndRepliesCount() {
    this.showSpinner = true;
    this.faqService.getPaginatedFaqByFaqKbId(this.id_faq_kb, this.pageNo, this.faqPerPageLimit, this.queryString).subscribe((faq: any) => {
      this.logger.log('[TILEBOT] - GET Paginated FAQS', faq);
      if (faq) {
        this.faq = faq;
        this.paginated_answers_count = faq.length
        // if (this.has_searched === true) {
        //   this.faq_lenght = faq.length
        //   const totalPagesNo = faq.length / this.faqPerPageLimit;
        //   this.totalPagesNo_roundToUp = Math.ceil(totalPagesNo);
        // }
        // this.faq_lenght = faq.length

        this.faqService.getCountOfFaqReplies(this.id_faq_kb).subscribe((res: any) => {
          this.logger.log("[TILEBOT] REPLIES COUNT RESPONSE: ", res);

          for (let fq of this.faq) {
            this.logger.log("[TILEBOT] FQ id: ", fq._id)
            let reply: any;
            for (reply of res) {
              // this.logger.log("REPLY id: ", reply._id._answerid)
              if (fq._id == reply._id._answerid) {
                this.logger.log("[TILEBOT] RES count: ", reply.count);
                fq['message_count'] = reply.count;
                this.logger.log("[TILEBOT] MESSAGE COUNT: ", fq['message_count'])
              }
            }
          }
        })
      }
    }, (error) => {
      this.showSpinner = false;
      this.logger.error('[TILEBOT] >> FAQs GOT BY FAQ-KB ID - ERROR', error);
    }, () => {
      setTimeout(() => {
        this.showSpinner = false;
      }, 800);
      this.logger.log('[TILEBOT] >> FAQs GOT BY FAQ-KB ID - COMPLETE');
    });
  }

  // -----------------------------------------------------------------------------------------
  // GET ALL serched faq
  // -----------------------------------------------------------------------------------------
  getAllSearcedFaq() {

    this.faqService.getCountOfAllSearcedFaq(this.id_faq_kb, this.queryString).subscribe((faq: any) => {
      this.logger.log('[TILEBOT] - GET ALL SEARCHED FAQS', faq);
      // this.faq = faq;

      if (faq) {
        // this.paginated_answers_count = faq.length
        if (this.has_searched === true) {
          this.faq_lenght = faq.length
          const totalPagesNo = faq.length / this.faqPerPageLimit;
          this.totalPagesNo_roundToUp = Math.ceil(totalPagesNo);
        }
        // this.faq_lenght = faq.length

      }
    }, (error) => {

      this.logger.error('[TILEBOT] >> GET ALL SEARCHED FAQS - ERROR', error);
    }, () => {

      this.logger.log('[TILEBOT] >> GET ALL SEARCHED FAQS - COMPLETE');
    });

  }

  exportFaqsToCsv() {
    this.faqService.exsportFaqsToCsv(this.id_faq_kb).subscribe((faq: any) => {
      this.logger.log('[TILEBOT] - EXPORT FAQ TO CSV - FAQS', faq)

      if (faq) {
        this.downloadFile(faq, 'faqs.csv');
      }
    }, (error) => {
      this.logger.error('[TILEBOT] - EXPORT FAQ TO CSV - ERROR', error);
    }, () => {
      this.logger.log('[TILEBOT] - EXPORT FAQ TO CSV - COMPLETE');
    });


    // if (this.payIsVisible) {
    //   if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false || this.prjct_profile_type === 'free' && this.trial_expired === true) {
    //     this.notify.openDataExportNotAvailable()
    //   } else {
    //     this.faqService.exsportFaqsToCsv(this.id_faq_kb).subscribe((faq: any) => {
    //       this.logger.log('[TILEBOT] - EXPORT FAQ TO CSV - FAQS', faq)

    //       if (faq) {
    //         this.downloadFile(faq, 'faqs.csv');
    //       }
    //     }, (error) => {
    //       this.logger.error('[TILEBOT] - EXPORT FAQ TO CSV - ERROR', error);
    //     }, () => {
    //       this.logger.log('[TILEBOT] - EXPORT FAQ TO CSV - COMPLETE');
    //     });
    //   }
    // } else {
    //   this.notify._displayContactUsModal(true, 'upgrade_plan');
    // }
  }

  downloadFile(data, filename) {
    const blob = new Blob(['\ufeff' + data], { type: 'text/csv;charset=utf-8;' });
    const dwldLink = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const isSafariBrowser = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
    this.logger.log('[TILEBOT] isSafariBrowser ', isSafariBrowser)
    if (isSafariBrowser) {  // if Safari open in new window to save file with random filename.
      dwldLink.setAttribute('target', '_blank');

      /**
       * *** FOR SAFARI TO UNCOMMENT AND TEST ***
       */
      // https://stackoverflow.com/questions/29799696/saving-csv-file-using-blob-in-safari/46641236
      // const link = document.createElement('a');
      // link.id = 'csvDwnLink';

      // document.body.appendChild(link);
      // window.URL = window.URL;
      // const csv = '\ufeff' + data,
      //   csvData = 'data:attachment/csv;charset=utf-8,' + encodeURIComponent(csv),
      //   filename = 'filename.csv';
      // $('#csvDwnLink').attr({ 'download': filename, 'href': csvData });
      // $('#csvDwnLink')[0].click();
      // document.body.removeChild(link);
    }
    dwldLink.setAttribute('href', url);
    dwldLink.setAttribute('download', filename);
    dwldLink.style.visibility = 'hidden';
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  downloadExampleCsv() {
    // const examplecsv = 'Question; Answer; intent_id (must be unique); intent_display_name; webhook_enabled (must be false)'
    const examplecsv = 'Where is standard shipping available?;Standard shipping is only available to the contiguous US, excluding Alaska, Hawaii, and all US territories. If you are shipping to any of these excluded regions, you are ineligible for standard shipping\nHow is software delivered?;Unless otherwise stated, Software shall be delivered digitally. Instructions for download orders will be sent via email\nWhen will my backorder ship?;Although we try to maintain inventory of all products in the warehouse, occasionally an item will be backordered. Normally, the product will become available in a week. You will receive an email notification as soon as the product ships. As a reminder, your credit card will not be charged until your order has been shipped. If you use a third-party payment or billing provider (e.g., PayPal), you may be charged before your order ships pursuant to their terms and conditions\nCan I change my shipping address?;Unfortunately, you cannot change your shipping address after your order has been submitted. The order is immediately sent to the fulfilment agency and can no longer be changed by our system. If your package is not successfully delivered, it will be returned to the warehouse and a credit will be made to your account\nCan I change my shipping method?;Unfortunately, you cannot change your shipment method after your order has been submitted. The order is immediately sent to the fulfilment agency and can no longer be changed by our system\nShipping notification;Shipment confirmation emails with tracking numbers are sent the business day after your order ships\nDelivery costs;Delivery costs are calculated and displayed after you have entered your shipping information on the checkout page\nDo you ship to P.O. Boxes?;Due to shipping restrictions, we cannot deliver to P.O. Boxes\nWhen is your shipping cut off time?;Orders placed for in-stock items before 10am PST (Pacific Standard Time), Monday through Friday will usually ship within one business day. We do not offer Saturday, Sunday, or holiday shipping or deliveries. Please note that we may have to verify your billing information. Any incomplete or incorrect information may result in processing delays or cancellations\n'
    this.downloadFile(examplecsv, 'example.csv');
  }

  /**
 * MODAL DELETE FAQ
 * @param id
 * @param hasClickedDeleteModal
 */
  // deptName: string,
  openDeleteModal(id: string) {
    this.logger.log('[TILEBOT] ON OPEN MODAL TO DELETE FAQ -> FAQ ID ', id);
    this.displayDeleteFaqModal = 'block';
    this.id_toDelete = id;
    // this.faq_toDelete = deptName;
  }

  /**
 * DELETE FAQ (WHEN THE 'CONFIRM' BUTTON IN MODAL IS CLICKED)  */
  onCloseDeleteModalHandled() {
    this.displayDeleteFaqModal = 'none';

    this.faqService.deleteFaq(this.id_toDelete).subscribe((data) => {
      this.logger.log('[TILEBOT] DELETE FAQ ', data);


      this.ngOnInit();

      /* https://stackoverflow.com/questions/21315306/how-to-stop-window-scroll-after-specific-event */
      // const $window = $(window);
      // let previousScrollTop = 0;
      // const scrollLock = true;
      // this.logger.log('»»» 1) SCROLL LOCK ', scrollLock)
      // $window.scroll(function (event) {
      //   if (scrollLock) {
      //     this.logger.log('»»» 2)SCROLL LOCK ', scrollLock)
      //     $window.scrollTop(previousScrollTop);
      //   }

      //   previousScrollTop = $window.scrollTop();

      // });
    }, (error) => {
      this.logger.error('[TILEBOT] DELETE FAQ ERROR ', error);
      // =========== NOTIFY ERROR ===========
      this.notify.showNotification(this.errorDeletingAnswerMsg, 4, 'report_problem');
    }, () => {
      this.logger.log('[TILEBOT] DELETE FAQ * COMPLETE *');
      // =========== NOTIFY SUCCESS===========
      this.notify.showNotification(this.answerSuccessfullyDeleted, 2, 'done');
    });

  }

  // CLOSE MODAL WITHOUT SAVE THE UPDATES OR WITHOUT CONFIRM THE DELETION
  onCloseModal() {
    this.displayDeleteFaqModal = 'none';
    this.displayInfoModal = 'none';
    this.displayImportModal = 'none';
  }

  openImportModal() {
    this.displayImportModal = 'block';
  }

  onCloseInfoModalHandledSuccess() {
    this.logger.log('[TILEBOT] onCloseInfoModalHandledSuccess')
    // this.displayInfoModal = 'none';
    // this.ngOnInit();
  }
  onCloseInfoModalHandledError() {
    this.logger.log('[TILEBOT] onCloseInfoModalHandledError')
    this.displayInfoModal = 'none';
    // this.router.navigate(['project/' + this.project._id + '/faqkb']);
    this.ngOnInit();
  }

  countDelimiterDigit(event) {
    this.logger.log('[TILEBOT] # OF DIGIT ', this.csvColumnsDelimiter.length)
    if (this.csvColumnsDelimiter.length !== 1) {
      (<HTMLInputElement>document.getElementById('file')).disabled = true;
      this.modalChoosefileDisabled = true;
    } else {
      (<HTMLInputElement>document.getElementById('file')).disabled = false;
      this.modalChoosefileDisabled = false;
    }
  }

  // UPLOAD FAQ FROM CSV
  fileChangeUploadCSV(event) {
    this.displayImportModal = 'none';
    // this.displayInfoModal = 'block';

    this.SHOW_CIRCULAR_SPINNER = true;

    this.logger.log('[TILEBOT] CSV COLUMNS DELIMITER ', this.csvColumnsDelimiter)
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      const formData: FormData = new FormData();
      formData.set('id_faq_kb', this.id_faq_kb);
      formData.set('delimiter', this.csvColumnsDelimiter);
      formData.append('uploadFile', file, file.name);
      this.logger.log('FORM DATA ', formData)

      this.faqService.uploadFaqCsv(formData)
        .subscribe(data => {
          this.logger.log('[TILEBOT] UPLOAD CSV DATA ', data);
          if (data['success'] === true) {
            this.parse_done = true;
            this.parse_err = false;
          } else if (data['success'] === false) {
            this.parse_done = false;
            this.parse_err = true;
          }
        }, (error) => {
          this.logger.error('[TILEBOT] UPLOAD CSV - ERROR ', error);
          this.SHOW_CIRCULAR_SPINNER = false;
        }, () => {
          this.logger.log('[TILEBOT] UPLOAD CSV * COMPLETE *');
          // setTimeout(() => {
          // this.SHOW_CIRCULAR_SPINNER = false
          this.filechangeuploadCSV.nativeElement.value = '';
          this.displayImportModal = 'none';
          this.notify.showWidgetStyleUpdateNotification("File was uploaded succesfully", 2, 'done');
          // }, 300);
        });

    }
  }

  openRightSidebar() {
    this.OPEN_RIGHT_SIDEBAR = true;
    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.train_bot_sidebar_height = elemMainContent.clientHeight + 10 + 'px'
    this.logger.log('[TILEBOT] - ON OPEN RIGHT SIDEBAR -> RIGHT SIDEBAR HEIGHT', this.train_bot_sidebar_height);
  }

  closeRightSidebar(event) {
    this.logger.log('[TILEBOT] »»»» CLOSE RIGHT SIDEBAR ', event);
    this.OPEN_RIGHT_SIDEBAR = event;
  }


  // -----------------------------------------------------------------------
  // Resolution bot doc link
  // -----------------------------------------------------------------------
  openResolutionBotDocsStylingYourChatbotReplies() {
    const url = URL_styling_your_chatbot_replies;
    window.open(url, '_blank');
  }

  openDocsResolutionBotSendImageVideosMore() {
    const url = URL_response_bot_images_buttons_videos_and_more
    window.open(url, '_blank');
  }

  openDocsResolutionBotHandoffToHumanAgent() {
    // const url = 'https://gethelp.tiledesk.com/articles/handoff-to-human-agents/';
    const url = URL_handoff_to_human_agents
    window.open(url, '_blank');
  }

  openDocsResolutionBotConfigureYourFirstChatbot() {
    // const url = 'https://docs.tiledesk.com/knowledge-base/create-a-bot/'; (replaced by configure-your-first-chatbot/ )
    // const url = 'https://gethelp.tiledesk.com/articles/configure-your-first-chatbot/';
    const url = URL_configure_your_first_chatbot;
    window.open(url, '_blank');
  }

  // -----------------------------------------------------------------------
  // Dialogflow bot doc link
  // -----------------------------------------------------------------------
  openDeveloperTiledeskGenerateDFCredentialFile() {
    const url = 'https://developer.tiledesk.com/external-chatbot/build-your-own-dialogflow-connnector/generate-dialgoflow-google-credentials-file';
    window.open(url, '_blank');
  }

  openDocsTiledeskDialogflowConnector() {
    // const url = 'https://docs.tiledesk.com/knowledge-base/microlanguage-for-dialogflow-images-videos/'; // NOT FOUND on gethelp
    const url = URL_microlanguage_for_dialogflow_images_videos // NOT FOUND on gethelp
    window.open(url, '_blank');
  }

  openDocsDialogFlowHandoffToHumanAgent() {
    // https://docs.tiledesk.com/knowledge-base/dialogflow-connector-handoff-to-human-agent-example/ 
    const url = URL_dialogflow_connector_handoff_to_human_agent_example
    window.open(url, '_blank');
  }

  openDialogflowConnectorDoc() {
    const url = URL_dialogflow_connector
    window.open(url, '_blank');
  }

  // -----------------------------------------------------------------------
  // External bot doc link
  // -----------------------------------------------------------------------
  openExternalBotIntegrationTutorial() {
    // const url = 'https://developer.tiledesk.com/apis/tutorials/connect-your-own-chatbot';
    const url = 'https://developer.tiledesk.com/external-chatbot/connect-your-own-chatbot';
    window.open(url, '_blank');
  }

  openWebhookRequirementsDoc() {
    const url = 'https://developer.tiledesk.com/resolution-bot-programming/webhook-data-model';
    window.open(url, '_blank');
  }



}
