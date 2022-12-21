import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FaqService } from '../../services/faq.service';
import { Faq } from '../../models/faq-model';
import { Router, ActivatedRoute, NavigationEnd, RoutesRecognized } from '@angular/router';
// import { ActivatedRoute } from '@angular/router';

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
// import brand from 'assets/brand/brand.json';
import { BrandService } from '../../services/brand.service';
import { DepartmentService } from '../../services/department.service';
import { avatarPlaceholder, getColorBck } from '../../utils/util';
import { LoggerService } from '../../services/logger/logger.service';
import {
  URL_microlanguage_for_dialogflow_images_videos,
  URL_dialogflow_connector_handoff_to_human_agent_example,
  URL_styling_your_chatbot_replies,
  URL_response_bot_images_buttons_videos_and_more,
  URL_handoff_to_human_agents,
  URL_configure_your_first_chatbot,
  URL_dialogflow_connector
} from '../../utils/util';
import { DomSanitizer } from '@angular/platform-browser';


const swal = require('sweetalert');
// import $ = require('jquery');
// declare const $: any;
@Component({
  selector: 'faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
})
export class FaqComponent extends BotsBaseComponent implements OnInit {
  @ViewChild('editbotbtn', { static: false }) elementRef: ElementRef;

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
  rasaServerURL: string;
  rasaBotServerURL: string;
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

  botProfileImageurl: string;
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

  // tparams = brand;
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
  faqPerPageLimit: number = 10;
  fullText: string;
  fullText_temp: string;
  queryString: string;
  paginated_answers_count: number;

  @ViewChild('fileInputBotProfileImage', { static: false }) fileInputBotProfileImage: any;
  isChromeVerGreaterThan100: boolean;
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

    this.logger.log('[FAQ-COMP] »»» HELLO FAQ COMP')

    this.clearSearchedQuestionStored();

    // ------------------------------------------------------------------------------------------------------------------------
    // GET ID_FAQ_KB FROM THE URL PARAMS (IS PASSED FROM THE FAQ-KB-COMPONENT WHEN THE USER CLICK ON EDIT FAQ IN THE TABLE )
    // and then call getStorageBucket() - getFaqKbById() - getFaqByFaqKbIdAndRepliesCount() - getDeptsByProjectId()
    // ------------------------------------------------------------------------------------------------------------------------

    this.getParamsBotIdAndThenInit();

    // GET ALL FAQ
    // this.getFaq();
    this.getCurrentProject();
    this.getWindowWidth();
    this.getProjectPlan();
    this.getBrowserLang();
    this.getOSCODE();

    this.checkBotImageUploadIsComplete();
    this.getParamsBotType();

    this.getTranslations();

    // this.getDeptsByProjectId();
    this.getBrowserVersion();
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  console.log("[BOT-CREATE] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
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
  }


  getParamsBotType() {
    this.route.params.subscribe((params) => {
      this.botType = params.type;
      // console.log('getParamsBotType params', params) 
      if (this.botType && this.botType === 'external') {
        this.botTypeForInput = 'External'
        this.is_external_bot = true
      } else {
        this.is_external_bot = false
      }

      if (this.botType && this.botType === 'dialogflow') {
        this.botTypeForInput = 'Dialogflow'
        this.getDialogFlowBotData(params.faqkbid)
      }

      if (this.botType && this.botType === 'native') {
        this.botTypeForInput = 'Resolution'
      }


      if (this.botType && this.botType === 'rasa') {
        this.botTypeForInput = 'RASA'
      }

      this.logger.log('[FAQ-COMP] --->  PARAMS', params);
      this.logger.log('[FAQ-COMP] ***** PARAMS botType', this.botType);
    });

  }

  toggleWebhook($event) {
    this.logger.log('[FAQ-COMP] toggleWebhook ', $event.target.checked);
    this.webhook_is_enabled = $event.target.checked

    this.validateUrl(this.webhookUrl)

    this.logger.log('[FAQ-COMP] validateUrl URL WEBHOOK_URL_IS_EMPTY (toggleWebhook) ', this.WEBHOOK_URL_IS_EMPTY);
    this.logger.log('[FAQ-COMP] validateUrl URL WEBHOOK_URL_IS_HTTPS (toggleWebhook) ', this.WEBHOOK_URL_IS_HTTPS);
    this.logger.log('[FAQ-COMP] validateUrl URL WEBHOOK_URL_IS_VALID (toggleWebhook) ', this.WEBHOOK_URL_IS_VALID);
    if (this.webhook_is_enabled === false && this.WEBHOOK_URL_IS_EMPTY === false) {

      if (this.WEBHOOK_URL_HAS_ERROR === true) {
        this.webhookUrl = '';
      }
    }
  }

  validateUrl(str) {
    this.logger.log('[FAQ-COMP] validateUrl WEBHOOK URL ', str)
    if (str && str.length > 0) {
      this.WEBHOOK_URL_IS_EMPTY = false;
      this.logger.log('[FAQ-COMP] validateUrl WEBHOOK URL is EMPTY ', this.WEBHOOK_URL_IS_EMPTY)
      var url = str;

      if (url.indexOf("http://") == 0 || (url.indexOf("https://") == 0)) {
        this.WEBHOOK_URL_IS_HTTP_or_HTTPS = true
        this.WEBHOOK_URL_IS_HTTPS = false
        this.WEBHOOK_URL_HAS_ERROR = false;
        this.logger.log('[FAQ-COMP] validateUrl URL START WITH HTTP ', this.WEBHOOK_URL_IS_HTTPS)
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

    this.logger.log('[FAQ-COMP] validateUrl URL - URL IS VALID (pattern.test)', pattern.test(str));

    if (pattern.test(str) === true) {
      this.WEBHOOK_URL_IS_VALID = true;
      this.WEBHOOK_URL_HAS_ERROR = false;
      this.logger.log('[FAQ-COMP] validateUrl URL - URL IS VALID ', this.WEBHOOK_URL_IS_VALID);
    } else {
      this.WEBHOOK_URL_IS_VALID = false;
      this.WEBHOOK_URL_HAS_ERROR = true;
      this.logger.log('[FAQ-COMP] validateUrl URL - URL IS VALID ', this.WEBHOOK_URL_IS_VALID);
    }

    // return !!pattern.test(str);
  }

  onChangeWebhookUrl($event) {
    this.logger.log('[FAQ-COMP] validateUrl URL - onChangeWebhookUrl ', $event);
    this.validateUrl($event)
  }

  checkValueIntentName(event: any) {
    // this.logger.log('Faqcomponent check value display_intent_name_in_table event' , event) 
    this.logger.log('[FAQ-COMP] check value display_intent_name_in_table', this.display_intent_name_in_table)
  }

  checkValueMessage($event) {
    this.logger.log('[FAQ-COMP] check value display_message_in_table', this.display_message_in_table)
  }
  checkQuestions($event) {
    this.logger.log('[FAQ-COMP] check value display_questions_in_table', this.display_questions_in_table)
  }

  checkAnswer($event) {
    this.logger.log('[FAQ-COMP] check value display_answer_in_table', this.display_answer_in_table)
  }


  checkValueTopic(event: any) {
    this.logger.log('[FAQ-COMP] check value display_topic_in_table', this.display_topic_in_table)
  }


  getDialogFlowBotData(dlgflwbotid: string) {
    this.faqKbService.getDialogflowBotCredetial(dlgflwbotid).subscribe((res) => {
      this.logger.log('[FAQ-COMP] getDialogFlowBotData - RES ', res);

      this.uploadedFileName = res['credentials'];
      this.logger.log('[FAQ-COMP] getDialogFlowBotData (FaqComponent) - RES > uploadedFileName ', this.uploadedFileName);

      this.dlgflwSelectedLangCode = res['language'];
      this.logger.log('[FAQ-COMP] getDialogFlowBotData (FaqComponent) - RES > dlgflwSelectedLangCode ', this.dlgflwSelectedLangCode);

      this.dlgflwSelectedLang = this.dialogflowLanguage[this.getIndexOfdialogflowLanguage(res['language'])]
      this.logger.log('getDialogFlowBotData (FaqComponent) - RES > dlgflwSelectedLang ', this.dlgflwSelectedLang);

      if (res['kbs'] && res['kbs'] !== 'undefined' && res['kbs'] !== 'null' && res['kbs'] !== null) {
        this.dlgflwKnowledgeBaseID = res['kbs'].trim();
        this.logger.log('[FAQ-COMP] getDialogFlowBotData - RES > dlgflwKnowledgeBaseID (kbs) ', this.dlgflwKnowledgeBaseID);
      } else {
        this.dlgflwKnowledgeBaseID = ''
      }

    }, (error) => {
      this.logger.error('[FAQ-COMP] getDialogFlowBotData - ERROR ', error);

    }, () => {

      this.logger.log('[FAQ-COMP] getDialogFlowBotData * COMPLETE *');

    });
  }


  onFileChange(event: any) {


    this.logger.log('[FAQ-COMP] onFileChange - event.target.files ', event.target.files);
    this.logger.log('[FAQ-COMP] onFileChange - event.target.files.length ', event.target.files.length);
    if (event.target.files && event.target.files.length) {
      const fileList = event.target.files;
      this.logger.log('[FAQ-COMP] onFileChange - fileList ', fileList);

      if (fileList.length > 0) { }
      const file: File = fileList[0];
      this.logger.log('[FAQ-COMP] onFileChange - file ', file);

      this.uploadedFile = file;
      this.logger.log('[FAQ-COMP] onFileChange - onFileChange this.uploadedFile ', this.uploadedFile);
      this.uploadedFileName = this.uploadedFile.name
      this.logger.log('[FAQ-COMP] onFileChange - onFileChange uploadedFileName ', this.uploadedFileName);

      // this.handleFileUploading(file);

    }
  }


  onSelectDialogFlowBotLang(selectedLangCode: string) {
    if (selectedLangCode) {
      this.logger.log('[FAQ-COMP] onSelectDialogFlowBotLang - Bot Type: ', this.botType, ' - selectedLang CODE : ', selectedLangCode);
      this.dlgflwSelectedLangCode = selectedLangCode
    }
  }

  getParamsBotIdAndThenInit() {
    this.id_faq_kb = this.route.snapshot.params['faqkbid'];
    this.logger.log('[FAQ-COMP] FAQ KB HAS PASSED id_faq_kb ', this.id_faq_kb);

    if (this.id_faq_kb) {
      if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
        this.checkBotImageExistOnFirebase();
      } else {
        this.checkBotImageExistOnNative();
      }
      this.getFaqKbById();
      // this.getAllFaqByFaqKbId();
      // this.getPaginatedFaqByFaqKbIdAndRepliesCount()
      this.getDeptsByProjectId();
    }
  }


  getDeptsByProjectId() {
    this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {
      this.logger.log('[FAQ-COMP] - DEPT GET DEPTS ', departments);
      this.logger.log('[FAQ-COMP] - DEPT BOT ID ', this.id_faq_kb);

      if (departments) {
        this.all_depts = departments;

        let count = 0;
        let countOfVisibleDepts = 0;

        departments.forEach((dept: any) => {
          this.logger.log('[FAQ-COMP] - DEPT', dept);

          if (dept.hasBot === true) {
            if (this.id_faq_kb === dept.id_bot) {
              this.logger.log('[FAQ-COMP] - DEPT DEPT WITH CURRENT BOT ', dept);

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
            this.logger.log('[FAQ-COMP] --->  DEPT botType ', this.botType);

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

        this.logger.log('[FAQ-COMP] ---> Current bot is found in DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY', this.DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY);

        const hasFoundBotIn = this.DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY.filter((obj: any) => {
          return obj.id_bot === this.id_faq_kb;
        });

        if (hasFoundBotIn.length > 0) {
          this.DEPTS_HAVE_BOT_BUT_NOT_THIS = false
          this.logger.log('[FAQ-COMP] ---> Current bot is found in DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY', this.DEPTS_HAVE_BOT_BUT_NOT_THIS);
        } else {
          this.DEPTS_HAVE_BOT_BUT_NOT_THIS = true
          this.logger.log('[FAQ-COMP] ---> Current bot is NOT found in DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY', this.DEPTS_HAVE_BOT_BUT_NOT_THIS);
        }

        this.logger.log('[FAQ-COMP] - DEPT - DEPTS WITHOUT BOT', this.depts_without_bot_array);

        this.COUNT_DEPTS_BOT_IS_ASSOCIATED_WITH = count;
        this.logger.log('[FAQ-COMP] - DEPT - COUNT_DEPTS_BOT_IS_ASSOCIATED_WITH', this.COUNT_DEPTS_BOT_IS_ASSOCIATED_WITH);

        this.COUNT_OF_VISIBLE_DEPT = countOfVisibleDepts;
        this.logger.log('[FAQ-COMP] - DEPT - COUNT_OF_VISIBLE_DEPT', this.COUNT_OF_VISIBLE_DEPT);
      }
    }, error => {

      this.logger.error('[FAQ-COMP] - DEPT - GET DEPTS  - ERROR', error);
    }, () => {
      this.logger.log('[FAQ-COMP] - DEPT - GET DEPTS - COMPLETE')

    });
  }

  onSelectBotId() {
    this.logger.log('[FAQ-COMP] --->  onSelectBotId dept_id', this.dept_id);
    this.logger.log('[FAQ-COMP] --->  onSelectBotId selected_dept_id', this.selected_dept_id);
    this.logger.log('[FAQ-COMP] --->  onSelectBotId id_faq_kb', this.id_faq_kb);
    this.dept_id = this.selected_dept_id


    const hasFound = this.depts_without_bot_array.filter((obj: any) => {
      return obj.id === this.selected_dept_id;
    });
    this.logger.log('[FAQ-COMP] --->  onSelectBotId dept found', hasFound);

    if (hasFound.length > 0) {
      this.selected_dept_name = hasFound[0]['name']
    }
    // this.hookBotToDept()
  }

  hookBotToDept() {
    this.departmentService.updateExistingDeptWithSelectedBot(this.dept_id, this.id_faq_kb).subscribe((res) => {
      this.logger.log('[FAQ-COMP] - UPDATE EXISTING DEPT WITH SELECED BOT - RES ', res);
    }, (error) => {
      this.logger.error('[FAQ-COMP] - UPDATE EXISTING DEPT WITH SELECED BOT - ERROR ', error);
    }, () => {
      this.logger.log('[FAQ-COMP] - UPDATE EXISTING DEPT WITH SELECED BOT * COMPLETE *');
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
    })
      .then((WillUpdated) => {
        this.getDeptsByProjectId()
        this.depts_without_bot_array = []
      })
  }

  // ---------------------------------------------------
  // Upload bot photo
  // ---------------------------------------------------
  upload(event) {
    this.logger.log('[FAQ-COMP] BOT PROFILE IMAGE (FAQ-COMP) upload')
    this.showSpinnerInUploadImageBtn = true;
    const file = event.target.files[0]

    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.uploadImageService.uploadBotAvatar(file, this.id_faq_kb);
    } else {

      // Native upload
      this.logger.log('[FAQ-COMP] BOT PROFILE IMAGE (FAQ-COMP) upload with native service')

      this.uploadImageNativeService.uploadBotPhotoProfile_Native(file, this.id_faq_kb).subscribe((downoloadurl) => {
        this.logger.log('[FAQ-COMP] BOT PROFILE IMAGE (FAQ-COMP) upload with native service - RES downoloadurl', downoloadurl);

        this.botProfileImageurl = downoloadurl
        this.timeStamp = (new Date()).getTime();
      }, (error) => {

        this.logger.error('[FAQ-COMP] BOT PROFILE IMAGE (FAQ-COMP) upload with native service - ERR ', error);
      })

    }
    this.fileInputBotProfileImage.nativeElement.value = '';
  }

  // ---------------------------------------------------
  // Delete bot photo
  // ---------------------------------------------------
  deleteBotProfileImage() {
    // const file = event.target.files[0]
    this.logger.log('[FAQ-COMP] BOT PROFILE IMAGE (FAQ-COMP) deleteBotProfileImage')

    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.uploadImageService.deleteBotProfileImage(this.id_faq_kb);
    } else {
      this.logger.log('[FAQ-COMP] BOT PROFILE IMAGE (FAQ-COMP) deleteUserProfileImage with native service')
      this.uploadImageNativeService.deletePhotoProfile_Native(this.id_faq_kb, 'bot')
    }
    this.botProfileImageExist = false;
    this.botImageHasBeenUploaded = false;

    const delete_bot_image_btn = <HTMLElement>document.querySelector('.delete_bot_image_btn');
    delete_bot_image_btn.blur();
  }


  checkBotImageExistOnFirebase() {
    this.logger.log('[FAQ-COMP] checkBotImageExistOnFirebase (FAQ-COMP) ')
    this.logger.log('[FAQ-COMP] STORAGE-BUCKET (FAQ-COMP) firebase_conf ', this.appConfigService.getConfig().firebase)

    const firebase_conf = this.appConfigService.getConfig().firebase;
    if (firebase_conf) {
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[FAQ-COMP] STORAGE-BUCKET (FAQ-COMP) ', this.storageBucket)
    }

    const imageUrl = 'https://firebasestorage.googleapis.com/v0/b/' + this.storageBucket + '/o/profiles%2F' + this.id_faq_kb + '%2Fphoto.jpg?alt=media';

    const self = this;
    this.verifyImageURL(imageUrl, function (imageExists) {

      if (imageExists === true) {
        self.botProfileImageExist = imageExists
        self.logger.log('[FAQ-COMP] BOT PROFILE IMAGE (FAQ-COMP) - BOT PROFILE IMAGE EXIST ? ', imageExists, 'usecase firebase')
        self.setImageProfileUrl(self.storageBucket);
      } else {
        self.botProfileImageExist = imageExists
        self.logger.log('[FAQ-COMP] BOT PROFILE IMAGE (FAQ-COMP) - BOT PROFILE IMAGE EXIST ? ', imageExists, 'usecase firebase')
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
        self.logger.log('[FAQ-COMP] BOT PROFILE IMAGE (FAQ-COMP) - BOT PROFILE IMAGE EXIST ? ', imageExists, 'usecase native')

        self.setImageProfileUrl_Native(baseUrl)

      } else {
        self.botProfileImageExist = imageExists
        self.logger.log('[FAQ-COMP] BOT PROFILE IMAGE (FAQ-COMP) - BOT PROFILE IMAGE EXIST ? ', imageExists, 'usecase native')
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
    this.logger.log('[FAQ-COMP] checkBotImageUploadIsComplete')
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {

      this.uploadImageService.botImageWasUploaded.subscribe((imageuploaded) => {
        this.logger.log('[FAQ-COMP] BOT PROFILE IMAGE - IMAGE UPLOADING IS COMPLETE ? ', imageuploaded, '(usecase Firebase)');
        this.botImageHasBeenUploaded = imageuploaded;
        if (this.storageBucket && this.botImageHasBeenUploaded === true) {

          this.showSpinnerInUploadImageBtn = false;

          this.logger.log('[FAQ-COMP] BOT PROFILE IMAGE (FAQ-COMP) - IMAGE UPLOADING IS COMPLETE - BUILD botProfileImageurl ');

          this.setImageProfileUrl(this.storageBucket)
        }
      });
    } else {
      // Native
      this.uploadImageNativeService.botImageWasUploaded_Native.subscribe((imageuploaded) => {
        this.logger.log('[FAQ-COMP] BOT PROFILE IMAGE - IMAGE UPLOADING IS COMPLETE ? ', imageuploaded, '(usecase Native)');

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

      if (key.includes("ANA")) {

        let ana = key.split(":");

        if (ana[1] === "F") {
          this.isVisibleAnalytics = false;
        } else {
          this.isVisibleAnalytics = true;
        }
      }
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
        this.logger.log('[FAQ-COMP] PUBLIC-KEY - key', key);
        let pay = key.split(":");
        // this.logger.log('PUBLIC-KEY (Navbar) - pay key&value', pay);
        if (pay[1] === "F") {
          this.payIsVisible = false;
          this.logger.log('[FAQ-COMP] - pay isVisible', this.payIsVisible);
        } else {
          this.payIsVisible = true;
          this.logger.log('[FAQ-COMP] - pay isVisible', this.payIsVisible);
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
      this.logger.log('[FAQ-COMP] - pay isVisible', this.payIsVisible);
    }

  }

  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      this.logger.log('[FAQ-COMP] -getProjectPlan - project Profile Data', projectProfileData)
      if (projectProfileData) {

        this.prjct_profile_type = projectProfileData.profile_type;
        this.subscription_is_active = projectProfileData.subscription_is_active;

        this.subscription_end_date = projectProfileData.subscription_end_date;
        this.trial_expired = projectProfileData.trial_expired

        this.buildPlanName(projectProfileData.profile_name, this.browserLang, this.prjct_profile_type);
      }
    }, error => {

      this.logger.error('[FAQ-COMP] - getProjectPlan - ERROR', error);
    }, () => {

      this.logger.log('[FAQ-COMP] - getProjectPlan - COMPLETE')

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
    this.logger.log('[FAQ-COMP] - ACTUAL WIDTH ', actualWidth);

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
    this.logger.log('[FAQ-COMP] - NEW INNER WIDTH ', newInnerWidth);
    if (newInnerWidth > 764) {
      this.windowWidthMore764 = true;
    } else {
      this.windowWidthMore764 = false;
    }

    if (newInnerWidth > 991) {
      this.windowWidthMore991 = true;
      this.logger.log('[FAQ-COMP] - windowWidthMore991 ', this.windowWidthMore991);
    } else {
      this.windowWidthMore991 = false;
      this.logger.log('[FAQ-COMP] - windowWidthMore991 ', this.windowWidthMore991);
    }
  }

  /**
   * ****** CLEAR SEARCHED QUESTION FROM LOCAL STORAGE ******
   * IN THE FAQ-TEST COMP, WHEN THE USER SEARCH FOR A QUESTION TO TEST
   * THE QUESTION IS SAVED IN THE STORAGE SO, IN THE EVENT THAT CLICK ON THE FAQ
   * TO EDIT IT, WHEN CLICK ON THE BACK BUTTON IN THE FAQ EDIT PAGE AND RETURN IN THE FAQ TEST PAGE, THE
   * TEST PAGE DISPLAY THE PREVIOUS RESULT OF RESEARCH.
   * WHEN THE USER RETURN IN THE EDIT BOT PAGE (THIS COMPONENT) THE RESEARCHED QUESTION IS RESETTED */
  clearSearchedQuestionStored() {
    // localStorage.setItem('searchedQuestion', '');
    localStorage.removeItem('searchedQuestion')
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      this.logger.log('[FAQ-COMP] project from AUTH service subscription  ', this.project)
    });
  }



  /**
   * *** GET FAQ-KB BY ID (FAQ-KB DETAILS) ***
   * USED TO OBTAIN THE FAQ-KB REMOTE KEY NECESSARY TO PASS IT
   * TO THE FAQ-TEST COMPONENT WHEN THE USER PRESS ON THE "FAQ TEST" BUTTON
   * AND ALSO TO OBTAIN THE NAME of the FAQ-KB TO DISPLAY IT IN THE DIV navbar-brand
   * *** NEW IMPLENTATION ***
   * THE 'EDIT BOT' LOGIC HAS BEEN MOVED FROM THE COMPONENT editBotName TO THIS COMPONENT
   * SO THE DATA RETURNED FROM getFaqKbById ARE ALSO USED TO DISPLAY THE NAME OF THE BOT IN TH 'UPDATE BOT' SECTION
   * AND THE FAQ-KB ID, ID AND REMOTE ID IN THE 'BOT ATTRIBUTE' SECTION
   */
  getFaqKbById() {
    this.showSpinnerInUpdateBotCard = true

    this.faqKbService.getFaqKbById(this.id_faq_kb).subscribe((faqkb: any) => {
      this.logger.log('[FAQ-COMP] GET FAQ-KB (DETAILS) BY ID (SUBSTITUTE BOT) ', faqkb);

      this.faq_kb_remoteKey = faqkb.kbkey_remote
      this.logger.log('[FAQ-COMP] GET FAQ-KB (DETAILS) BY ID - FAQKB REMOTE KEY ', this.faq_kb_remoteKey);

      this.faqKb_name = faqkb.name;
      this.logger.log('[FAQ-COMP] GET FAQ-KB (DETAILS) BY ID - FAQKB NAME', this.faqKb_name);

      this.faqKb_id = faqkb._id;
      this.logger.log('[FAQ-COMP] GET FAQ-KB (DETAILS) BY ID - FAQKB ID', this.faqKb_id);

      this.faqKb_created_at = faqkb.createdAt;
      this.logger.log('[FAQ-COMP] GET FAQ-KB (DETAILS) BY ID - CREATED AT ', this.faqKb_created_at);

      this.faqKb_description = faqkb.description;
      this.logger.log('[FAQ-COMP] GET FAQ-KB (DETAILS) BY ID - Description ', this.faqKb_description);

      this.webhook_is_enabled = faqkb.webhook_enabled
      this.logger.log('[FAQ-COMP] GET FAQ-KB (DETAILS) BY ID - webhook_is_enabled ', this.webhook_is_enabled);

      this.webhookUrl = faqkb.webhook_url
      this.logger.log('[FAQ-COMP] GET FAQ-KB (DETAILS) BY ID - webhookUrl ', this.webhookUrl);

      this.logger.log('[FAQ-COMP] GET FAQ-KB (DETAILS) BY ID - LANGUAGE ', faqkb.language);

      if (faqkb.type === 'rasa') {
        this.getRasaBotServer()
      }

      // for the comnobobox "select bot language" -now not used because the user cannot change the language of the bot he chose during creation
      // this.botDefaultSelectedLang = this.botDefaultLanguages[this.getIndexOfbotDefaultLanguages(faqkb.language)]
      // this.logger.log('[FAQ-COMP] GET FAQ-KB (DETAILS) BY ID  (ONLY FOR NATIVE BOT i.e. Resolution) LANGUAGE ', this.botDefaultSelectedLang);
      if (faqkb && faqkb.language) {
        this.faqkb_language = faqkb.language;
        this.botDefaultSelectedLang = this.botDefaultLanguages[this.getIndexOfbotDefaultLanguages(faqkb.language)].name
        this.logger.log('[FAQ-COMP] GET FAQ-KB (DETAILS) BY ID  (ONLY FOR NATIVE BOT i.e. Resolution) LANGUAGE ', this.botDefaultSelectedLang);
      }

      if (faqkb.webhook_enabled) {
        this.validateUrl(this.webhookUrl)
      }

      // ---------------------------------------------------------------------------------------------------------------
      // Bot internal ed external
      // ---------------------------------------------------------------------------------------------------------------

      /** IN PRE  */
      if (faqkb.type === 'external') {
        this.is_external_bot = true;
      } else {
        this.is_external_bot = false;
      }


      /** IN PROD  */
      // this.is_external_bot = faqkb.external;
      this.logger.log('[FAQ-COMP] GET FAQ-KB (DETAILS) BY ID - BOT IS EXTERNAL ', this.is_external_bot);

      if (faqkb.url !== 'undefined') {
        this.faqKbUrlToUpdate = faqkb.url;
        this.logger.log('[FAQ-COMP] GET FAQ-KB (DETAILS) BY ID - BOT URL ', this.faqKbUrlToUpdate);
      } else {
        this.logger.log('[FAQ-COMP]GET FAQ-KB (DETAILS) BY ID - BOT URL is undefined ', faqkb.url);
      }

    }, (error) => {
      this.logger.error('[FAQ-COMP] GET FAQ-KB BY ID (SUBSTITUTE BOT) - ERROR ', error);
      this.showSpinnerInUpdateBotCard = false
    }, () => {
      this.logger.log('[FAQ-COMP] GET FAQ-KB ID (SUBSTITUTE BOT) - COMPLETE ');
      this.showSpinnerInUpdateBotCard = false
    });
  }

  getRasaBotServer() {
    this.faqKbService.getRasaBotServer(this.id_faq_kb)
      .subscribe((rasabotdata) => {
        this.logger.log('[FAQ-COMP] - GET RASA BOT DATA ', rasabotdata);
        if (rasabotdata['success'] !== false) {
          this.logger.log('[FAQ-COMP] - GET RASA BOT DATA value ', rasabotdata['value']);
          this.rasaServerURL = rasabotdata['value'].serverUrl
        } else {
          this.logger.error('[FAQ-COMP] - The bot was not configured correctly')
        }
      }, (error) => {
        this.logger.error('[FAQ-COMP] -  ERROR ', error);
      }, () => {
        this.logger.log('[FAQ-COMP] -  COMPLETE ');
      });

  }

  /* !!NOT MORE USED - was used whith the 'bot external' checkbox - now the bot type is passwd from the component bot-type-select  */
  // hasClickedExternalBot(externalBotselected: boolean) {
  //   this.is_external_bot = externalBotselected;
  //   this.logger.log('hasClickedExternalBot - externalBotselected: ', this.is_external_bot);
  // }


  /**
   * *** EDIT BOT ***
   * HAS BEEN MOVED in this COMPONENT FROM faq-kb-edit-add.component  */
  editBot() {
    // RESOLVE THE BUG 'edit button remains focused after clicking'
    this.elementRef.nativeElement.blur();

    this.logger.log('[FAQ-COMP] FAQ KB NAME TO UPDATE ', this.faqKb_name);

    let _botType = ''
    if (this.botType === 'native') {
      // the type 'native' needs to be changed into 'internal' for the service
      _botType = 'internal'
      this.language = this.botDefaultSelectedLangCode
    } else {

      _botType = this.botType
    }

    this.faqKbService.updateFaqKb(this.id_faq_kb, this.faqKb_name, this.faqKbUrlToUpdate, _botType, this.faqKb_description, this.webhook_is_enabled, this.webhookUrl, this.language)
      .subscribe((faqKb) => {
        this.logger.log('[FAQ-COMP] EDIT BOT - FAQ KB UPDATED ', faqKb);
      }, (error) => {
        this.logger.error('[FAQ-COMP] EDIT BOT -  ERROR ', error);

        if (this.botType !== 'dialogflow') {
          // =========== NOTIFY ERROR ===========
          this.notify.showWidgetStyleUpdateNotification(this.updateBotError, 4, 'report_problem');
        }
      }, () => {
        this.logger.log('[FAQ-COMP] EDIT BOT - * COMPLETE *');
        if (this.botType !== 'dialogflow' && this.botType !== 'rasa') {
          // =========== NOTIFY SUCCESS===========
          this.notify.showWidgetStyleUpdateNotification(this.updateBotSuccess, 2, 'done');
        }

        if (this.botType === 'dialogflow') {

          // --------------------------------------------------------------------------------
          // Update dialogflow bot
          // --------------------------------------------------------------------------------
          this.logger.log('[FAQ-COMP] Update BOT dialogflow »»»»»»»»»»» Bot Type: ', this.botType, ' - uploadedFile: ', this.uploadedFile, ' - lang Code ', this.dlgflwSelectedLangCode, ' - kbs (knowledgeBaseID) ', this.dlgflwKnowledgeBaseID);


          const formData = new FormData();

          // --------------------------------------------------------------------------
          // formData.append language
          // --------------------------------------------------------------------------
          formData.append('language', this.dlgflwSelectedLangCode);

          // --------------------------------------------------------------------------
          // formData.append Knowledge Base ID
          // --------------------------------------------------------------------------
          if (this.dlgflwKnowledgeBaseID !== undefined) {
            if (this.dlgflwKnowledgeBaseID.length > 0) {
              this.logger.log('[FAQ-COMP] Update BOT (dialogflow) »»»»»»»»» - dlgflwKnowledgeBaseID.length ', this.dlgflwKnowledgeBaseID.length);
              formData.append('kbs', this.dlgflwKnowledgeBaseID.trim());
            } else {
              this.logger.log('[FAQ-COMP] Update BOT (dialogflow) »»»»»»»»» - dlgflwKnowledgeBaseID.length ', this.dlgflwKnowledgeBaseID.length);
              formData.append('kbs', "");
            }

          } else if (this.dlgflwKnowledgeBaseID === undefined || this.dlgflwKnowledgeBaseID === 'undefined' || this.dlgflwKnowledgeBaseID === null || this.dlgflwKnowledgeBaseID === 'null') {
            this.logger.log('[FAQ-COMP] Update BOT (dialogflow) »»»»»»»»» - dlgflwKnowledgeBaseID ', this.dlgflwKnowledgeBaseID);
            formData.append('kbs', "");
          }

          // --------------------------------------------------------------------------
          // formData.append file
          // --------------------------------------------------------------------------
          if (this.uploadedFile !== undefined) {
            formData.append('file', this.uploadedFile, this.uploadedFile.name);
          }
          this.logger.log('[FAQ-COMP] Create dialogflow BOT FORM DATA ', formData)
          this.uploaddialogflowBotCredential(this.id_faq_kb, formData);

        }
        if (this.botType === 'rasa') {
          this.connectRasaBotToRasaServer(this.id_faq_kb, this.rasaServerURL)
        }
      });
  }

  connectRasaBotToRasaServer(bot_Id, rasaServerUrl) {
    this.faqKbService.connectBotToRasaServer(bot_Id, rasaServerUrl).subscribe((res) => {
      this.logger.log('[BOT-CREATE] CREATE FAQKB - connectRasaServer - RES ', res);

    }, (error) => {
      this.logger.error('[BOT-CREATE] UPDATE  - RasaServer - ERROR ', error);
      this.notify.showWidgetStyleUpdateNotification(this.updateBotError, 4, 'report_problem');
    }, () => {
      this.notify.showWidgetStyleUpdateNotification(this.updateBotSuccess, 2, 'done');
      this.logger.log('[BOT-CREATE] CREATE FAQKB - RasaServer * COMPLETE *');
    });
  }



  uploaddialogflowBotCredential(bot_Id, formData) {
    this.faqKbService.uploadDialogflowBotCredetial(bot_Id, formData).subscribe((res) => {

      this.logger.log('[FAQ-COMP] - uploadDialogflowBotCredetial - RES ', res);

    }, (error) => {
      this.logger.error('[FAQ-COMP] - uploadDialogflowBotCredetial - ERROR ', error);
      // =========== NOTIFY ERROR ===========
      const errorMsg = error['error']['msg']
      if (errorMsg && errorMsg === 'Not a valid JSON file.') {
        this.notify.showWidgetStyleUpdateNotification(this.updateBotError + ': ' + this.notValidJson, 4, 'report_problem');
      } else {
        this.notify.showWidgetStyleUpdateNotification(this.updateBotError, 4, 'report_problem');
      }

    }, () => {

      this.logger.log('[FAQ-COMP]- uploadDialogflowBotCredetial * COMPLETE *');
      // =========== NOTIFY SUCCESS===========
      this.notify.showWidgetStyleUpdateNotification(this.updateBotSuccess, 2, 'done');

    });

  }

  goToTestFaqPage() {
    // - REMOTE FAQKB KEY ', this.faq_kb_remoteKey
    this.logger.log('[FAQ-COMP] GO TO TEST FAQ PAGE ');
    // if (this.faq_kb_remoteKey) {
    this.router.navigate(['project/' + this.project._id + '/faq/test', this.id_faq_kb]);
    // }
  }

  goToRoutingAndDepts() {
    this.router.navigate(['project/' + this.project._id + '/departments']);
  }

  goToEditAddPage_EDIT_DEPT(deptid, deptdefaut) {
    this.router.navigate(['project/' + this.project._id + '/department/edit', deptid]);
  }


  // GO TO FAQ-EDIT-ADD COMPONENT AND PASS THE FAQ-KB ID (RECEIVED FROM FAQ-KB COMPONENT)
  goToEditAddPage_CREATE() {
    this.logger.log('[FAQ-COMP] ID OF FAQKB ', this.id_faq_kb);
    // console.log('2 goToEditAddPage_CREATE:   ', this.faqkb_language);
    this.router.navigate(['project/' + this.project._id + '/createfaq', this.id_faq_kb, this.botType, this.faqkb_language]);
  }

  // GO TO FAQ-EDIT-ADD COMPONENT AND PASS THE FAQ ID (RECEIVED FROM THE VIEW) AND
  // THE FAQ-KB ID (RECEIVED FROM FAQ-KB COMPONENT)
  goToEditAddPage_EDIT(faq_id: string) {
    this.logger.log('[FAQ-COMP] ID OF FAQ ', faq_id);
    this.router.navigate(['project/' + this.project._id + '/editfaq', this.id_faq_kb, faq_id, this.botType]);
  }

  goBack() {
    // this.logger.log('FaqComponent NAVIGATION - urlAfterRedirects PREVIOUS PAGE IS CREATE BOT (goBack) ', this.previousPageIsCreateBot);
    // this.router.navigate(['project/' + this.project._id + '/bots']);
    this.location.back();
    // if (this.previousPageIsCreateBot === true) {
    //   this.router.navigate(['project/' + this.project._id + '/bots']);
    // } else {
    //   this.location.back();
    // }

  }



  // -----------------------------------------------------------------------------------------
  // GET ONLY THE FAQ WITH THE FAQ-KB ID PASSED FROM FAQ-KB COMPONENT & THEN GET REPLIES COUNT
  // -----------------------------------------------------------------------------------------
  getAllFaqByFaqKbId() {
    this.faqService.getAllFaqByFaqKbId(this.id_faq_kb).subscribe((faq: any) => {
      this.logger.log('[FAQ-COMP] - GET FAQS', faq);
      // this.faq = faq;

      if (faq) {

        if (this.has_searched === false) {
          this.faq_lenght = faq.length
          const totalPagesNo = faq.length / this.faqPerPageLimit;
          this.totalPagesNo_roundToUp = Math.ceil(totalPagesNo);
        }
        // this.faqService.getCountOfFaqReplies(this.id_faq_kb).subscribe((res: any) => {
        //   this.logger.log("[FAQ-COMP] REPLIES COUNT RESPONSE: ", res);

        //   for (let fq of this.faq) {
        //     this.logger.log("[FAQ-COMP] FQ id: ", fq._id)
        //     let reply: any;
        //     for (reply of res) {
        //       // this.logger.log("REPLY id: ", reply._id._answerid)
        //       if (fq._id == reply._id._answerid) {
        //         this.logger.log("[FAQ-COMP] RES count: ", reply.count);
        //         fq['message_count'] = reply.count;
        //         this.logger.log("[FAQ-COMP] MESSAGE COUNT: ", fq['message_count'])
        //       }
        //     }
        //   }
        // })
      }
    }, (error) => {
      this.logger.log('[FAQ-COMP] >> FAQs GOT BY FAQ-KB ID - ERR ', error);
    }, () => {
      this.logger.log('[FAQ-COMP] >> FAQs GOT BY FAQ-KB ID - COMPLETE');
    });
  }

  fulltextChange($event) {
    this.logger.log('[FAQ-COMP] - fulltextChange ', $event);
    this.fullText = $event
    this.logger.log('[FAQ-COMP] - fulltextChange  $event length', $event.length);
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
    //   console.log('[FAQ-COMP] - FULL TEXT SEARCH ', this.fullText);
    //   this.fullText_temp = '';
    // }

    // this.queryString = this.fullText_temp
    this.logger.log('[FAQ-COMP] - FULL TEXT SEARCH ', this.queryString)
    this.getPaginatedFaqByFaqKbIdAndRepliesCount();
    this.getAllSearcedFaq()
  }


  // ------------------------------------------------------------------------------
  // PAGINATION
  // ------------------------------------------------------------------------------
  decreasePageNumber() {
    this.pageNo -= 1;
    this.logger.log('[FAQ-COMP] - DECREASE PAGE NUMBER ', this.pageNo);
    this.getPaginatedFaqByFaqKbIdAndRepliesCount()
  }

  increasePageNumber() {
    this.pageNo += 1;
    this.logger.log('[FAQ-COMP] - INCREASE PAGE NUMBER ', this.pageNo);
    this.getPaginatedFaqByFaqKbIdAndRepliesCount()
  }

  // -----------------------------------------------------------------------------------------
  // GET PAGINATED FAQS
  // -----------------------------------------------------------------------------------------
  getPaginatedFaqByFaqKbIdAndRepliesCount() {
    this.showSpinner = true;
    this.faqService.getPaginatedFaqByFaqKbId(this.id_faq_kb, this.pageNo, this.faqPerPageLimit, this.queryString).subscribe((faq: any) => {
      this.logger.log('[FAQ-COMP] - GET Paginated FAQS', faq);


      if (faq) {
        this.faq = faq;
        this.paginated_answers_count = faq.length
        // if (this.has_searched === true) {
        //   this.faq_lenght = faq.length
        //   const totalPagesNo = faq.length / this.faqPerPageLimit;
        //   this.totalPagesNo_roundToUp = Math.ceil(totalPagesNo);
        // }
        // this.faq_lenght = faq.length
        // in aggiornamento
        this.faqService.getCountOfFaqReplies(this.id_faq_kb).subscribe((res: any) => {
          this.logger.log("[FAQ-COMP] REPLIES COUNT RESPONSE: ", res);

          for (let fq of this.faq) {
            this.logger.log("[FAQ-COMP] FQ id: ", fq._id)
            let reply: any;
            for (reply of res) {
              // this.logger.log("REPLY id: ", reply._id._answerid)
              if (fq._id == reply._id._answerid) {
                this.logger.log("[FAQ-COMP] RES count: ", reply.count);
                fq['message_count'] = reply.count;
                this.logger.log("[FAQ-COMP] MESSAGE COUNT: ", fq['message_count'])
              }
            }
          }
        })
      }
    }, (error) => {
      this.showSpinner = false;
      this.logger.error('[FAQ-COMP] >> FAQs GOT BY FAQ-KB ID - ERROR', error);
    }, () => {
      setTimeout(() => {
        this.showSpinner = false;
      }, 800);
      this.logger.log('[FAQ-COMP] >> FAQs GOT BY FAQ-KB ID - COMPLETE');
    });
  }

  // -----------------------------------------------------------------------------------------
  // GET ALL serched faq
  // -----------------------------------------------------------------------------------------
  getAllSearcedFaq() {

    this.faqService.getCountOfAllSearcedFaq(this.id_faq_kb, this.queryString).subscribe((faq: any) => {
      this.logger.log('[FAQ-COMP] - GET ALL SEARCHED FAQS', faq);
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

      this.logger.error('[FAQ-COMP] >> GET ALL SEARCHED FAQS - ERROR', error);
    }, () => {

      this.logger.log('[FAQ-COMP] >> GET ALL SEARCHED FAQS - COMPLETE');
    });

  }



  exportFaqsToCsv() {
    this.faqService.exsportFaqsToCsv(this.id_faq_kb).subscribe((faq: any) => {
      this.logger.log('[FAQ-COMP] - EXPORT FAQ TO CSV - FAQS', faq)

      if (faq) {
        this.downloadFile(faq, 'faqs.csv');
      }
    }, (error) => {
      this.logger.error('[FAQ-COMP] - EXPORT FAQ TO CSV - ERROR', error);
    }, () => {
      this.logger.log('[FAQ-COMP] - EXPORT FAQ TO CSV - COMPLETE');
    });

    // if (this.payIsVisible) {
    //   if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false || this.prjct_profile_type === 'free' && this.trial_expired === true) {
    //     this.notify.openDataExportNotAvailable()
    //   } else {
    //     this.faqService.exsportFaqsToCsv(this.id_faq_kb).subscribe((faq: any) => {
    //       this.logger.log('[FAQ-COMP] - EXPORT FAQ TO CSV - FAQS', faq)

    //       if (faq) {
    //         this.downloadFile(faq, 'faqs.csv');
    //       }
    //     }, (error) => {
    //       this.logger.error('[FAQ-COMP] - EXPORT FAQ TO CSV - ERROR', error);
    //     }, () => {
    //       this.logger.log('[FAQ-COMP] - EXPORT FAQ TO CSV - COMPLETE');
    //     });
    //   }
    // } else {
    //   this.notify._displayContactUsModal(true, 'upgrade_plan');
    // }
  }

  //   var link = document.createElement("a");
  // link.id = "csvDwnLink";

  // document.body.appendChild(link);
  // window.URL = window.URL || window.webkitURL;
  // var csv = "\ufeff" + CSV,
  //     csvData = 'data:attachment/csv;charset=utf-8,' + encodeURIComponent(csv),
  //     filename = 'filename.csv';
  // $("#csvDwnLink").attr({'download': filename, 'href': csvData});
  // $('#csvDwnLink')[0].click();
  // document.body.removeChild(link);

  downloadFile(data, filename) {
    const blob = new Blob(['\ufeff' + data], { type: 'text/csv;charset=utf-8;' });
    const dwldLink = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const isSafariBrowser = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
    this.logger.log('[FAQ-COMP] isSafariBrowser ', isSafariBrowser)
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
    const examplecsv = 'Question; Answer; intent_id (must be unique); intent_display_name; webhook_enabled (must be false)'
    this.downloadFile(examplecsv, 'example.csv');
  }


  /**
   * MODAL DELETE FAQ
   * @param id
   * @param hasClickedDeleteModal
   */
  // deptName: string,
  openDeleteModal(id: string) {
    this.logger.log('[FAQ-COMP] ON OPEN MODAL TO DELETE FAQ -> FAQ ID ', id);
    this.displayDeleteFaqModal = 'block';
    this.id_toDelete = id;
    // this.faq_toDelete = deptName;
  }

  /**
   * DELETE FAQ (WHEN THE 'CONFIRM' BUTTON IN MODAL IS CLICKED)  */
  onCloseDeleteModalHandled() {
    this.displayDeleteFaqModal = 'none';

    this.faqService.deleteFaq(this.id_toDelete).subscribe((data) => {
      this.logger.log('[FAQ-COMP] DELETE FAQ ', data);


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
      this.logger.error('[FAQ-COMP] DELETE FAQ ERROR ', error);
      // =========== NOTIFY ERROR ===========
      this.notify.showNotification(this.errorDeletingAnswerMsg, 4, 'report_problem');
    }, () => {
      this.logger.log('[FAQ-COMP] DELETE FAQ * COMPLETE *');
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
    this.logger.log('[FAQ-COMP] onCloseInfoModalHandledSuccess')
    this.displayInfoModal = 'none';
    this.ngOnInit();
  }
  onCloseInfoModalHandledError() {
    this.logger.log('[FAQ-COMP] onCloseInfoModalHandledError')
    this.displayInfoModal = 'none';
    // this.router.navigate(['project/' + this.project._id + '/faqkb']);
    this.ngOnInit();
  }

  countDelimiterDigit(event) {
    this.logger.log('[FAQ-COMP] # OF DIGIT ', this.csvColumnsDelimiter.length)
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
    this.displayInfoModal = 'block';

    this.SHOW_CIRCULAR_SPINNER = true;

    this.logger.log('[FAQ-COMP] CSV COLUMNS DELIMITER ', this.csvColumnsDelimiter)
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
          this.logger.log('[FAQ-COMP] UPLOAD CSV DATA ', data);
          if (data['success'] === true) {
            this.parse_done = true;
            this.parse_err = false;
          } else if (data['success'] === false) {
            this.parse_done = false;
            this.parse_err = true;
          }
        }, (error) => {
          this.logger.error('[FAQ-COMP] UPLOAD CSV - ERROR ', error);
          this.SHOW_CIRCULAR_SPINNER = false;
        }, () => {
          this.logger.log('[FAQ-COMP] UPLOAD CSV * COMPLETE *');
          setTimeout(() => {
            this.SHOW_CIRCULAR_SPINNER = false
          }, 300);
        });

    }
  }

  openRightSidebar() {
    this.OPEN_RIGHT_SIDEBAR = true;
    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.train_bot_sidebar_height = elemMainContent.clientHeight + 10 + 'px'
    this.logger.log('[FAQ-COMP] - ON OPEN RIGHT SIDEBAR -> RIGHT SIDEBAR HEIGHT', this.train_bot_sidebar_height);
  }

  closeRightSidebar(event) {
    this.logger.log('[FAQ-COMP] »»»» CLOSE RIGHT SIDEBAR ', event);
    this.OPEN_RIGHT_SIDEBAR = event;

  }

  // launchWidget() {
  //   if (window && window['tiledesk']) {
  //     window['tiledesk'].open();
  //   }
  // }

  openBotExternalUrl() {
    const url = this.faqKbUrlToUpdate;
    window.open(url, '_blank');
  }


  openRasaIntegrationTutorial() {
    const url = 'https://gethelp.tiledesk.com/articles/rasa-ai-integration/';
    window.open(url, '_blank');
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
