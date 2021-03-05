import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { MongodbFaqService } from '../../services/mongodb-faq.service';
import { Faq } from '../../models/faq-model';
import { Router, ActivatedRoute } from '@angular/router';
// import { ActivatedRoute } from '@angular/router';

import { Project } from '../../models/project-model';
import { AuthService } from '../../core/auth.service';
import { Http, Headers, RequestOptions } from '@angular/http';
import { FaqKbService } from '../../services/faq-kb.service';
import { NotifyService } from '../../core/notify.service';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { ProjectPlanService } from '../../services/project-plan.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from '../../services/app-config.service';
import { UploadImageService } from '../../services/upload-image.service';
import { UsersService } from '../../services/users.service';
import { BotsBaseComponent } from '../bots-base/bots-base.component';
// import brand from 'assets/brand/brand.json';
import { BrandService } from '../../services/brand.service';
import { DepartmentService } from '../../services/department.service';
import { avatarPlaceholder, getColorBck } from '../../utils/util';
// import $ = require('jquery');
// declare const $: any;
@Component({
  selector: 'faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
})
export class FaqComponent extends BotsBaseComponent implements OnInit {
  @ViewChild('editbotbtn') private elementRef: ElementRef;

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
  display = 'none';

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
  userProfileImageExist: boolean;

  userImageHasBeenUploaded = false;

  userProfileImageurl: string;
  timeStamp: any;
  botType: string;
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

  constructor(
    private mongodbFaqService: MongodbFaqService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private faqKbService: FaqKbService,
    public location: Location,
    private notify: NotifyService,
    private prjctPlanService: ProjectPlanService,
    private translate: TranslateService,
    private uploadImageService: UploadImageService,
    public appConfigService: AppConfigService,
    private usersService: UsersService,
    public brandService: BrandService,
    private departmentService: DepartmentService,

  ) {
    super();

    const brand = brandService.getBrand();
    this.tparams = brand;
  }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();

    console.log('»»» HELLO FAQ COMP')

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

    this.checkUserImageUploadIsComplete();
    this.getParamsBotType();

    this.getTranslations();
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


  }

  getParamsBotType() {
    this.route.params.subscribe((params) => {
      this.botType = params.type;

      if (this.botType && this.botType === 'external') {
        this.is_external_bot = true
      } else {
        this.is_external_bot = false
      }

      if (this.botType && this.botType === 'dialogflow') {

        this.getDialogFlowBotData(params.faqkbid)
      }

      console.log('Bot Create (FaqComponent) --->  PARAMS', params);
      console.log('Bot Create (FaqComponent)--->  PARAMS botType', this.botType);
    });

  }

  toggleWebhook($event) {
    console.log('Faqcomponent toggleWebhook ', $event.target.checked);
    this.webhook_is_enabled = $event.target.checked
  }




  getDialogFlowBotData(dlgflwbotid: string) {
    this.faqKbService.getDialogflowBotCredetial(dlgflwbotid).subscribe((res) => {
      console.log('getDialogFlowBotData (FaqComponent) - RES ', res);

      this.uploadedFileName = res.credentials;
      console.log('getDialogFlowBotData (FaqComponent) - RES > uploadedFileName ', this.uploadedFileName);

      this.dlgflwSelectedLangCode = res.language;
      console.log('getDialogFlowBotData (FaqComponent) - RES > dlgflwSelectedLangCode ', this.dlgflwSelectedLangCode);

      this.dlgflwSelectedLang = this.dialogflowLanguage[this.getIndexOfdialogflowLanguage(res.language)]
      console.log('getDialogFlowBotData (FaqComponent) - RES > dlgflwSelectedLang ', this.dlgflwSelectedLang);

      if (res.kbs && res.kbs !== 'undefined' && res.kbs !== 'null' && res.kbs !== null) {
        this.dlgflwKnowledgeBaseID = res.kbs.trim();
        console.log('getDialogFlowBotData (FaqComponent) - RES > dlgflwKnowledgeBaseID (kbs) ', this.dlgflwKnowledgeBaseID);
      } else {
        this.dlgflwKnowledgeBaseID = ''
      }

    }, (error) => {
      console.log('getDialogFlowBotData (FaqComponent) - ERROR ', error);

    }, () => {

      console.log('getDialogFlowBotData (FaqComponent) * COMPLETE *');

    });
  }


  onFileChange(event: any) {

    // this.elemProgressPercent = <HTMLElement>document.querySelector('.percent');
    // console.log('PROGRESS ELEMENT ', this.elemProgressPercent);

    console.log('onFileChange (FaqComponent) - event.target.files ', event.target.files);
    console.log('onFileChange(FaqComponent) - event.target.files.length ', event.target.files.length);
    if (event.target.files && event.target.files.length) {
      const fileList = event.target.files;
      console.log('onFileChange (FaqComponent) - fileList ', fileList);

      if (fileList.length > 0) { }
      const file: File = fileList[0];
      console.log('onFileChange (FaqComponent) - file ', file);

      this.uploadedFile = file;
      console.log('onFileChange (FaqComponent) - onFileChange this.uploadedFile ', this.uploadedFile);
      this.uploadedFileName = this.uploadedFile.name
      console.log('onFileChange (FaqComponent) - onFileChange uploadedFileName ', this.uploadedFileName);

      // this.handleFileUploading(file);

    }
  }


  onSelectDialogFlowBotLang(selectedLangCode: string) {
    if (selectedLangCode) {

      console.log('onSelectDialogFlowBotLang (FaqComponent) - Bot Type: ', this.botType, ' - selectedLang CODE : ', selectedLangCode);
      this.dlgflwSelectedLangCode = selectedLangCode

    }
  }

  getParamsBotIdAndThenInit() {
    this.id_faq_kb = this.route.snapshot.params['faqkbid'];
    console.log('FAQ KB HAS PASSED id_faq_kb ', this.id_faq_kb);

    if (this.id_faq_kb) {
      this.getStorageBucket();
      this.getFaqKbById();
      this.getFaqByFaqKbIdAndRepliesCount();
      this.getDeptsByProjectId();
    }
  }


  getDeptsByProjectId() {
    this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {
      console.log('FaqComponent - DEPT GET DEPTS ', departments);
      console.log('FaqComponent - DEPT BOT ID ', this.id_faq_kb);

      if (departments) {
        this.all_depts = departments;

        let count = 0;
        departments.forEach((dept: any) => {
          console.log('FaqComponent - DEPT)', dept);

          if (dept.hasBot === true) {
            if (this.id_faq_kb === dept.id_bot) {
              console.log('FaqComponent - DEPT DEPT WITH CURRENT BOT ', dept);

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
              this.DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY.push(dept)
            }
          }

        });

        console.log('FaqComponent - DEPT - DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY', this.DEPTS_BOT_IS_ASSOCIATED_WITH_ARRAY);

        this.COUNT_DEPTS_BOT_IS_ASSOCIATED_WITH = count;
        console.log('FaqComponent - DEPT - COUNT_DEPTS_BOT_IS_ASSOCIATED_WITH', this.COUNT_DEPTS_BOT_IS_ASSOCIATED_WITH);
      }
    }, error => {

      console.log('FaqComponent - DEPT - GET DEPTS  - ERROR', error);
    }, () => {
      console.log('FaqComponent - DEPT - GET DEPTS - COMPLETE')

    });
  }

  getStorageBucket() {
    const firebase_conf = this.appConfigService.getConfig().firebase;
    this.storageBucket = firebase_conf['storageBucket'];
    console.log('STORAGE-BUCKET Users-profile ', this.storageBucket)

    this.checkBotImageExist(this.storageBucket)
  }

  upload(event) {
    this.showSpinnerInUploadImageBtn = true;
    const file = event.target.files[0]
    this.uploadImageService.uploadUserAvatar(file, this.id_faq_kb)
  }

  checkBotImageExist(storageBucket) {
    const url = 'https://firebasestorage.googleapis.com/v0/b/' + storageBucket + '/o/profiles%2F' + this.id_faq_kb + '%2Fphoto.jpg?alt=media';
    const self = this;
    this.verifyImageURL(url, function (imageExists) {

      if (imageExists === true) {
        self.userProfileImageExist = imageExists
        console.log('PROFILE IMAGE (FAQ-COMP) - BOT PROFILE IMAGE EXIST ? ', imageExists)

        self.setImageProfileUrl(storageBucket)

      } else {
        self.userProfileImageExist = imageExists
        console.log('PROFILE IMAGE (FAQ-COMP) - BOT PROFILE IMAGE EXIST ? ', imageExists)


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

  checkUserImageUploadIsComplete() {
    this.uploadImageService.imageExist.subscribe((image_exist) => {
      console.log('PROFILE IMAGE - IMAGE UPLOADING IS COMPLETE ? ', image_exist);
      this.userImageHasBeenUploaded = image_exist;
      if (this.storageBucket && this.userImageHasBeenUploaded === true) {

        this.showSpinnerInUploadImageBtn = false;

        console.log('PROFILE IMAGE (FAQ-COMP) - IMAGE UPLOADING IS COMPLETE - BUILD userProfileImageurl ');

        this.setImageProfileUrl(this.storageBucket)
      }
    });
  }

  setImageProfileUrl(storageBucket) {
    this.userProfileImageurl = 'https://firebasestorage.googleapis.com/v0/b/' + storageBucket + '/o/profiles%2F' + this.id_faq_kb + '%2Fphoto.jpg?alt=media';
    // console.log('PROFILE IMAGE (USER-PROFILE ) - userProfileImageurl ', this.userProfileImageurl);
    this.timeStamp = (new Date()).getTime();
  }

  getUserProfileImage() {
    if (this.timeStamp) {
      // console.log('PROFILE IMAGE (BOT-PROFILE IN FAQ COMP) - getUserProfileImage ', this.userProfileImageurl);
      // setTimeout(() => {
      return this.userProfileImageurl + '&' + this.timeStamp;
      // }, 200);
    }
    return this.userProfileImageurl
  }

  getBrowserLang() {
    this.browserLang = this.translate.getBrowserLang();
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    console.log('AppConfigService getAppConfig (BOT LIST) public_Key', this.public_Key);
    let keys = this.public_Key.split("-");
    console.log('PUBLIC-KEY (BOT LIST) keys', keys)
    keys.forEach(key => {

      if (key.includes("ANA")) {
        console.log('PUBLIC-KEY (BOT LIST) - key', key);
        let ana = key.split(":");
        console.log('PUBLIC-KEY (BOT LIST) - ana key&value', ana);
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
          console.log('PUBLIC-KEY (Faqcomponent) - isVisibleDEP', this.isVisibleDEP);
        } else {
          this.isVisibleDEP = true;
          console.log('PUBLIC-KEY (Faqcomponent) - isVisibleDEP', this.isVisibleDEP);
        }
      }
    });

    if (!this.public_Key.includes("DEP")) {
   
      this.isVisibleDEP = false;
    }

    if (!this.public_Key.includes("ANA")) {
    
      this.isVisibleAnalytics = false;
    }

  }

  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      console.log('ProjectPlanService (RequestsListHistoryNewComponent) project Profile Data', projectProfileData)
      if (projectProfileData) {

        this.prjct_profile_type = projectProfileData.profile_type;
        this.subscription_is_active = projectProfileData.subscription_is_active;

        this.subscription_end_date = projectProfileData.subscription_end_date;
        this.trial_expired = projectProfileData.trial_expired

        this.prjct_profile_name = this.buildPlanName(projectProfileData.profile_name, this.browserLang, this.prjct_profile_type);
      }
    })
  }

  buildPlanName(planName: string, browserLang: string, planType: string) {
    if (planType === 'payment') {
      if (browserLang === 'it') {
        this.prjct_profile_name = 'Piano ' + planName;
        return this.prjct_profile_name
      } else if (browserLang !== 'it') {
        this.prjct_profile_name = planName + ' Plan';
        return this.prjct_profile_name
      }
    }
  }

  getWindowWidth() {
    const actualWidth = window.innerWidth;
    console.log('FaqComponent - ACTUAL WIDTH ', actualWidth);

    if (actualWidth > 764) {
      this.windowWidthMore764 = true;
    } else {
      this.windowWidthMore764 = false;
    }

  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const newInnerWidth = event.target.innerWidth;
    console.log('FaqComponent - NEW INNER WIDTH ', newInnerWidth);
    if (newInnerWidth > 764) {
      this.windowWidthMore764 = true;
    } else {
      this.windowWidthMore764 = false;
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
      console.log('00 -> FAQ COMP project from AUTH service subscription  ', this.project)
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
    // this.botService.getMongDbBotById(this.botId).subscribe((bot: any) => { // NO MORE USED
    this.faqKbService.getMongDbFaqKbById(this.id_faq_kb).subscribe((faqkb: any) => {
      console.log('Faqcomponent GET FAQ-KB (DETAILS) BY ID (SUBSTITUTE BOT) ', faqkb);

      this.faq_kb_remoteKey = faqkb.kbkey_remote
      console.log('Faqcomponent GET FAQ-KB (DETAILS) BY ID - FAQKB REMOTE KEY ', this.faq_kb_remoteKey);

      this.faqKb_name = faqkb.name;
      console.log('Faqcomponent GET FAQ-KB (DETAILS) BY ID - FAQKB NAME', this.faqKb_name);

      this.faqKb_id = faqkb._id;
      console.log('Faqcomponent GET FAQ-KB (DETAILS) BY ID - FAQKB ID', this.faqKb_id);

      this.faqKb_created_at = faqkb.createdAt;
      console.log('Faqcomponent GET FAQ-KB (DETAILS) BY ID - CREATED AT ', this.faqKb_created_at);

      this.faqKb_description = faqkb.description;
      console.log('Faqcomponent GET FAQ-KB (DETAILS) BY ID - Description ', this.faqKb_description);

      this.webhook_is_enabled = faqkb.webhook_enabled
      console.log('Faqcomponent GET FAQ-KB (DETAILS) BY ID - webhook_is_enabled ', this.webhook_is_enabled);

      this.webhookUrl = faqkb.webhook_url
      console.log('Faqcomponent GET FAQ-KB (DETAILS) BY ID - webhookUrl ', this.webhookUrl);
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
      console.log('GET FAQ-KB (DETAILS) BY ID - BOT IS EXTERNAL ', this.is_external_bot);

      if (faqkb.url !== 'undefined') {
        this.faqKbUrlToUpdate = faqkb.url;
        console.log('GET FAQ-KB (DETAILS) BY ID - BOT URL ', this.faqKbUrlToUpdate);
      } else {
        console.log('GET FAQ-KB (DETAILS) BY ID - BOT URL is undefined ', faqkb.url);
      }

    },
      (error) => {
        console.log('GET FAQ-KB BY ID (SUBSTITUTE BOT) - ERROR ', error);
        this.showSpinnerInUpdateBotCard = false
      },
      () => {
        console.log('GET FAQ-KB ID (SUBSTITUTE BOT) - COMPLETE ');
        this.showSpinnerInUpdateBotCard = false
      });

  }

  /* !!NOT MORE USED - was used whith the 'bot external' checkbox - now the bot type is passwd from the component bot-type-select  */
  // hasClickedExternalBot(externalBotselected: boolean) {
  //   this.is_external_bot = externalBotselected;
  //   console.log('hasClickedExternalBot - externalBotselected: ', this.is_external_bot);
  // }


  /**
   * *** EDIT BOT ***
   * HAS BEEN MOVED in this COMPONENT FROM faq-kb-edit-add.component  */
  editBot() {
    // RESOLVE THE BUG 'edit button remains focused after clicking'
    this.elementRef.nativeElement.blur();

    console.log('FAQ KB NAME TO UPDATE ', this.faqKb_name);

    let _botType = ''
    if (this.botType === 'native') {
      // the type 'native' needs to be changed into 'internal' for the service
      _botType = 'internal'
    } else {

      _botType = this.botType
    }
    // this.faqKbService.updateMongoDbFaqKb(this.id_faq_kb, this.faqKb_name, this.faqKbUrlToUpdate, this.is_external_bot)
    this.faqKbService.updateMongoDbFaqKb(this.id_faq_kb, this.faqKb_name, this.faqKbUrlToUpdate, _botType, this.faqKb_description, this.webhook_is_enabled, this.webhookUrl)
      .subscribe((faqKb) => {
        console.log('Faqcomponent EDIT BOT - FAQ KB UPDATED ', faqKb);
      },
        (error) => {
          console.log('Faqcomponent EDIT BOT -  ERROR ', error);

          if (this.botType !== 'dialogflow') {
            // =========== NOTIFY ERROR ===========
            this.notify.showWidgetStyleUpdateNotification(this.updateBotError, 4, 'report_problem');
          }
        },
        () => {
          console.log('EDIT BOT - * COMPLETE *');
          if (this.botType !== 'dialogflow') {
            // =========== NOTIFY SUCCESS===========
            this.notify.showWidgetStyleUpdateNotification(this.updateBotSuccess, 2, 'done');

          }

          if (this.botType === 'dialogflow') {

            // --------------------------------------------------------------------------------
            // Update dialogflow bot
            // --------------------------------------------------------------------------------
            console.log(
              'Update BOT dialogflow »»»»»»»»»»» Bot Type: ', this.botType,
              ' - uploadedFile: ', this.uploadedFile,
              ' - lang Code ', this.dlgflwSelectedLangCode,
              ' - kbs (knowledgeBaseID) ', this.dlgflwKnowledgeBaseID);


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
                console.log('Update BOT (dialogflow) »»»»»»»»» - dlgflwKnowledgeBaseID.length ', this.dlgflwKnowledgeBaseID.length);
                formData.append('kbs', this.dlgflwKnowledgeBaseID.trim());
              } else {
                console.log('Update BOT (dialogflow) »»»»»»»»» - dlgflwKnowledgeBaseID.length ', this.dlgflwKnowledgeBaseID.length);
                formData.append('kbs', "");
              }

            } else if (this.dlgflwKnowledgeBaseID === undefined || this.dlgflwKnowledgeBaseID === 'undefined' || this.dlgflwKnowledgeBaseID === null || this.dlgflwKnowledgeBaseID === 'null') {
              console.log('Update BOT (dialogflow) »»»»»»»»» - dlgflwKnowledgeBaseID ', this.dlgflwKnowledgeBaseID);
              formData.append('kbs', "");
            }

            // --------------------------------------------------------------------------
            // formData.append file
            // --------------------------------------------------------------------------
            if (this.uploadedFile !== undefined) {
              formData.append('file', this.uploadedFile, this.uploadedFile.name);
            }
            console.log('FaqComponent Create dialogflow BOT FORM DATA ', formData)


            this.uploaddialogflowBotCredential(this.id_faq_kb, formData);
            //
          }
        });
  }

  uploaddialogflowBotCredential(bot_Id, formData) {
    this.faqKbService.uploadDialogflowBotCredetial(bot_Id, formData).subscribe((res) => {

      console.log('FaqComponent - uploadDialogflowBotCredetial - RES ', res);

    }, (error) => {
      console.log('FaqComponent - uploadDialogflowBotCredetial - ERROR ', error);
      // =========== NOTIFY ERROR ===========

      const objctErrorBody = JSON.parse(error._body)
      if (objctErrorBody && objctErrorBody.msg === 'Not a valid JSON file.') {
        this.notify.showWidgetStyleUpdateNotification(this.updateBotError + ': ' + this.notValidJson, 4, 'report_problem');
      } else {
        this.notify.showWidgetStyleUpdateNotification(this.updateBotError, 4, 'report_problem');
      }

    }, () => {

      console.log('FaqComponent- uploadDialogflowBotCredetial * COMPLETE *');
      // =========== NOTIFY SUCCESS===========
      this.notify.showWidgetStyleUpdateNotification(this.updateBotSuccess, 2, 'done');

    });

  }

  goToTestFaqPage() {
    // - REMOTE FAQKB KEY ', this.faq_kb_remoteKey
    console.log('GO TO TEST FAQ PAGE ');
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
    console.log('ID OF FAQKB ', this.id_faq_kb);
    this.router.navigate(['project/' + this.project._id + '/createfaq', this.id_faq_kb, this.botType]);
  }

  // GO TO FAQ-EDIT-ADD COMPONENT AND PASS THE FAQ ID (RECEIVED FROM THE VIEW) AND
  // THE FAQ-KB ID (RECEIVED FROM FAQ-KB COMPONENT)
  goToEditAddPage_EDIT(faq_id: string) {
    console.log('ID OF FAQ ', faq_id);
    this.router.navigate(['project/' + this.project._id + '/editfaq', this.id_faq_kb, faq_id, this.botType]);
  }

  goBackToFaqKbList() {
    // this.router.navigate(['project/' + this.project._id + '/bots']);
    this.location.back();
  }


  // -----------------------------------------------------------------------------------------
  // GET ONLY THE FAQ WITH THE FAQ-KB ID PASSED FROM FAQ-KB COMPONENT & THEN GET REPLIES COUNT
  // -----------------------------------------------------------------------------------------
  getFaqByFaqKbIdAndRepliesCount() {
    this.mongodbFaqService.getMongoDbFaqByFaqKbId(this.id_faq_kb).subscribe((faq: any) => {
      console.log('>> FAQs GOT BY FAQ-KB ID', faq);
      this.faq = faq;

      if (faq) {
        this.faq_lenght = faq.length
        // in aggiornamento
        this.mongodbFaqService.getRepliesCount(this.id_faq_kb).subscribe((res: any) => {
          console.log("REPLIES COUNT RESPONSE: ", res);

          for (let fq of this.faq) {
            console.log("FQ id: ", fq._id)
            let reply: any;
            for (reply of res) {
              console.log("REPLY id: ", reply._id._answerid)
              if (fq._id == reply._id._answerid) {
                console.log("RES count: ", reply.count);
                fq['message_count'] = reply.count;
                console.log("MESSAGE COUNT: ", fq['message_count'])
              }
            }
          }
        })
      }
    }, (error) => {
      this.showSpinner = false;
      console.log('>> FAQs GOT BY FAQ-KB ID - ERROR', error);

    }, () => {

      setTimeout(() => {
        this.showSpinner = false;
      }, 800);

      console.log('>> FAQs GOT BY FAQ-KB ID - COMPLETE');
    });
  }

  exportFaqsToCsv() {
    // tslint:disable-next-line:max-line-length
    if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false || this.prjct_profile_type === 'free' && this.trial_expired === true) {
      this.notify.openDataExportNotAvailable()
    } else {
      this.mongodbFaqService.exsportFaqsToCsv(this.id_faq_kb).subscribe((faq: any) => {
        console.log('FAQ COMP - EXPORT FAQ TO CSV - FAQS', faq)

        if (faq) {
          this.downloadFile(faq, 'faqs.csv');
        }
      }, (error) => {
        console.log('FAQ COMP - EXPORT FAQ TO CSV - ERROR', error);

      }, () => {
        console.log('FAQ COMP - EXPORT FAQ TO CSV - COMPLETE');
      });
    }
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
    console.log('isSafariBrowser ', isSafariBrowser)
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
    const examplecsv = 'Question 1; Answer 1'
    this.downloadFile(examplecsv, 'example.csv');
  }



  /**
   * ADD FAQ
   */
  // createFaq() {
  //   console.log('MONGO DB CREATE FAQ QUESTION: ', this.question, ' ANSWER: ', this.answer, ' ID FAQ KB ', this.id_faq_kb);
  //   this.mongodbFaqService.addMongoDbFaq(this.question, this.answer, this.id_faq_kb)
  //     .subscribe((faq) => {
  //       console.log('POST DATA ', faq);

  //       this.question = '';
  //       this.answer = '';
  //       // RE-RUN GET FAQ TO UPDATE THE TABLE
  //       // this.getDepartments();
  //       this.ngOnInit();
  //     },
  //     (error) => {

  //       console.log('POST REQUEST ERROR ', error);

  //     },
  //     () => {
  //       console.log('POST REQUEST * COMPLETE *');
  //     });

  // }

  /**
   * MODAL DELETE FAQ
   * @param id
   * @param hasClickedDeleteModal
   */
  // deptName: string,
  openDeleteModal(id: string) {

    console.log('ON OPEN MODAL TO DELETE FAQ -> FAQ ID ', id);

    this.display = 'block';

    this.id_toDelete = id;
    // this.faq_toDelete = deptName;
  }

  /**
   * DELETE FAQ (WHEN THE 'CONFIRM' BUTTON IN MODAL IS CLICKED)  */
  onCloseDeleteModalHandled() {
    this.display = 'none';

    this.mongodbFaqService.deleteMongoDbFaq(this.id_toDelete).subscribe((data) => {
      console.log('DELETE FAQ ', data);


      this.ngOnInit();

      /* https://stackoverflow.com/questions/21315306/how-to-stop-window-scroll-after-specific-event */
      // const $window = $(window);
      // let previousScrollTop = 0;
      // const scrollLock = true;
      // console.log('»»» 1) SCROLL LOCK ', scrollLock)
      // $window.scroll(function (event) {
      //   if (scrollLock) {
      //     console.log('»»» 2)SCROLL LOCK ', scrollLock)
      //     $window.scrollTop(previousScrollTop);
      //   }

      //   previousScrollTop = $window.scrollTop();

      // });
    }, (error) => {

      console.log('DELETE FAQ ERROR ', error);
      // =========== NOTIFY ERROR ===========
      this.notify.showNotification('An error occurred while deleting the FAQ', 4, 'report_problem');
    }, () => {
      console.log('DELETE FAQ * COMPLETE *');
      // =========== NOTIFY SUCCESS===========
      this.notify.showNotification('FAQ successfully deleted', 2, 'done');
    });

  }

  /**
   * MODAL UPDATE FAQ
   * !!! NO MORE USED: THE ACTION UPDATE IS IN FAQ- EDIT-ADD COMPONENT
   * @param id
   * @param question
   * @param answer
   * @param hasClickedUpdateModal
   */
  openUpdateModal(id: string, question: string, answer: string, hasClickedUpdateModal: boolean) {
    // display the modal windows (change the display value in the view)
    console.log('HAS CLICKED OPEN MODAL TO UPDATE USER DATA ', hasClickedUpdateModal);
    this.DISPLAY_DATA_FOR_UPDATE_MODAL = hasClickedUpdateModal;
    this.DISPLAY_DATA_FOR_DELETE_MODAL = false;

    if (hasClickedUpdateModal) {
      this.display = 'block';
    }

    console.log('ON MODAL OPEN -> FAQ ID ', id);
    console.log('ON MODAL OPEN -> FAQ QUESTION TO UPDATE', question);
    console.log('ON MODAL OPEN -> FAQ ANSWER TO UPDATE', answer);

    this.id_toUpdate = id;
    this.question_toUpdate = question;
    this.answer_toUpdate = answer;
  }

  /**
   * UPDATE FAQ (WHEN THE 'SAVE' BUTTON IN MODAL IS CLICKED)
   * !!! NO MORE USED: THE ACTION UPDATE IS IN FAQ- EDIT-ADD COMPONENT
   */
  // onCloseUpdateModalHandled() {
   
  //   this.display = 'none';

  //   console.log('ON MODAL UPDATE CLOSE -> FAQ ID ', this.id_toUpdate);
  //   console.log('ON MODAL UPDATE CLOSE -> FAQ QUESTION UPDATED ', this.question_toUpdate);
  //   console.log('ON MODAL UPDATE CLOSE -> FAQ ANSWER UPDATED ', this.answer_toUpdate);

  //   this.mongodbFaqService.updateMongoDbFaq(this.id_toUpdate, this.question_toUpdate, this.answer_toUpdate).subscribe((data) => {
  //     console.log('PUT DATA ', data);

  //     // RE-RUN GET CONTACT TO UPDATE THE TABLE
  //     // this.getDepartments();
  //     this.ngOnInit();
  //   }, (error) => {

  //     console.log('PUT REQUEST ERROR ', error);

  //   }, () => {
  //     console.log('PUT REQUEST * COMPLETE *');
  //   });

  // }

  // CLOSE MODAL WITHOUT SAVE THE UPDATES OR WITHOUT CONFIRM THE DELETION
  onCloseModal() {
    this.display = 'none';
    this.displayInfoModal = 'none';
    this.displayImportModal = 'none';
  }

  openImportModal() {
    this.displayImportModal = 'block';
  }

  onCloseInfoModalHandledSuccess() {
    console.log('onCloseInfoModalHandledSuccess')
    this.displayInfoModal = 'none';
    this.ngOnInit();
  }
  onCloseInfoModalHandledError() {
    console.log('onCloseInfoModalHandledError')
    this.displayInfoModal = 'none';
    // this.router.navigate(['project/' + this.project._id + '/faqkb']);
    this.ngOnInit();
  }

  countDelimiterDigit(event) {
    console.log(' # OF DIGIT ', this.csvColumnsDelimiter.length)
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

    console.log('CSV COLUMNS DELIMITER ', this.csvColumnsDelimiter)
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      const formData: FormData = new FormData();
      formData.set('id_faq_kb', this.id_faq_kb);
      formData.set('delimiter', this.csvColumnsDelimiter);
      formData.append('uploadFile', file, file.name);
      console.log('FORM DATA ', formData)

      this.mongodbFaqService.uploadFaqCsv(formData)
        .subscribe(data => {
          console.log('UPLOAD CSV DATA ', data);
          if (data['success'] === true) {
            this.parse_done = true;
            this.parse_err = false;
          } else if (data['success'] === false) {
            this.parse_done = false;
            this.parse_err = true;
          }
        }, (error) => {
          console.log('UPLOAD CSV - ERROR ', error);
          this.SHOW_CIRCULAR_SPINNER = false;
        }, () => {
          console.log('UPLOAD CSV * COMPLETE *');
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
    console.log('FaqComponent - ON OPEN RIGHT SIDEBAR -> RIGHT SIDEBAR HEIGHT', this.train_bot_sidebar_height);
  }

  closeRightSidebar(event) {
    console.log('»»»» CLOSE RIGHT SIDEBAR ', event);
    this.OPEN_RIGHT_SIDEBAR = event;

    // const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    // _elemMainPanel.setAttribute('style', 'overflow-x: hidden !important;');
  }

  launchWidget() {
    if (window && window['tiledesk']) {
      window['tiledesk'].open();
    }
  }

  openBotExternalUrl() {
    const url = this.faqKbUrlToUpdate;
    window.open(url, '_blank');

  }

  // public changeListener(files: FileList) {
  //   console.log(files);
  //   if (files && files.length > 0) {
  //     const file: File = files.item(0);
  //     console.log(file.name);
  //     console.log(file.size);
  //     console.log(file.type);
  //     const reader: FileReader = new FileReader();
  //     reader.readAsText(file);
  //     reader.onload = (e) => {
  //       const csv: string = reader.result;
  //       console.log(csv);
  //     }
  //   }
  // }

}
