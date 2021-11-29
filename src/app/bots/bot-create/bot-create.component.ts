import { Component, OnInit } from '@angular/core';
import { FaqKbService } from '../../services/faq-kb.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { Project } from '../../models/project-model';
import { AuthService } from '../../core/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BotLocalDbService } from '../../services/bot-local-db.service';
import { Location } from '@angular/common';
import { BotsBaseComponent } from '../bots-base/bots-base.component';
import { NotifyService } from '../../core/notify.service';
import { DepartmentService } from '../../services/department.service';
// import brand from 'assets/brand/brand.json';
import { BrandService } from '../../services/brand.service';
import { LoggerService } from '../../services/logger/logger.service';

@Component({
  selector: 'bot-create',
  templateUrl: './bot-create.component.html',
  styleUrls: ['./bot-create.component.scss']
})
export class BotCreateComponent extends BotsBaseComponent implements OnInit {
  // tparams = brand;
  tparams: any;

  faqKbName: string;
  faqKbUrl: string;

  id_faq_kb: string;

  faqKbNameToUpdate: string;
  faqKbUrlToUpdate: string;

  // CREATE_VIEW = false;
  // EDIT_VIEW = false;

  showSpinner = false;
  project: Project;
  displayInfoModal = 'none';
  SHOW_CIRCULAR_SPINNER = false;
  goToEditBot = true;

  newBot_name: string;
  newBot_Id: string;
  newBot_External: boolean;
  browser_lang: string;

  is_external_bot = false;

  botType: string;
  translateparam: any;
  translateparamBotName: any;

  isHovering: boolean;
  loadingFile: any;
  percentLoaded: number;
  reader = new FileReader();
  dropDisabled = false;

  uploadedFile: any;
  hideDropZone = false;
  hideProgressBar = true;

  btn_create_bot_is_disabled = true;
  botNameLength: number;

  CREATE_BOT_ERROR: boolean;
  CREATE_DIALOGFLOW_BOT_ERROR: boolean;
  DIALOGFLOW_BOT_ERROR_MSG: string;

  uploadCompleted = false;
  uploadedFileName: string;

  hasAlreadyUploadAfile = false

  dlgflwSelectedLang = this.dialogflowLanguage[5];
  dlgflwSelectedLangCode = 'en';
  dlgflwKnowledgeBaseID: string;
  filetypeNotSupported: string;
  bot_description: string;
  depts_length: number;

  // DISPLAY_BTN_ACTIVATE_BOT_FOR_NEW_CONV: boolean;
  PRESENTS_MODAL_ATTACH_BOT_TO_DEPT: boolean = false;
  displayModalAttacchBotToDept: string;
  dept_id: string;
  HAS_CLICKED_HOOK_BOOT_TO_DEPT: boolean = false;
  HAS_COMPLETED_HOOK_BOOT_TO_DEPT: boolean = false;
  HAS_COMPLETED_HOOK_BOOT_TO_DEPT_SUCCESS: boolean = false;
  HAS_COMPLETED_HOOK_BOOT_TO_DEPT_ERROR: boolean = false;

  depts_without_bot_array = [];

  DISPLAY_SELECT_DEPTS_WITHOUT_BOT: boolean;
  selected_bot_id: string;
  selected_bot_name: string;

  botDefaultSelectedLang: string = 'English - en';
  botDefaultSelectedLangCode: string = 'en'
  language: string;

  constructor(
    private faqKbService: FaqKbService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private translate: TranslateService,
    public location: Location,
    private botLocalDbService: BotLocalDbService,
    private notify: NotifyService,
    public brandService: BrandService,
    private departmentService: DepartmentService,
    private logger: LoggerService
  ) {
    super();

    const brand = brandService.getBrand();
    this.tparams = brand;
  }

  ngOnInit() {
    this.logger.log('[BOT-CREATE] »»»» Bot Create Component on Init !!!')
    this.auth.checkRoleForCurrentProject();

    this.detectBrowserLang();

    // BASED ON THE URL PATH DETERMINE IF THE USER HAS SELECTED (IN FAQ-KB PAGE) 'CREATE' OR 'EDIT'
    // if (this.router.url === '/createfaqkb') {
    // if (this.router.url.indexOf('/createfaqkb') !== -1) {
    //   this.logger.log('HAS CLICKED CREATE ');
    //   this.CREATE_VIEW = true;
    //   this.showSpinner = false;
    // } else {
    //   this.logger.log('HAS CLICKED EDIT ');
    //   this.EDIT_VIEW = true;

    //   // GET THE ID OF FAQ-KB PASSED BY FAQ-KB PAGE
    //   this.getFaqKbId();

    //   // GET THE DETAIL OF FAQ-KB BY THE ID AS ABOVE
    //   this.getFaqKbById();
    // }

    this.getCurrentProject();
    this.getParamsBotTypeAndDepts();
    this.translateFileTypeNotSupported();

  }

  onSelectBotDefaultlang(selectedDefaultBotLang) {
    this.logger.log('onSelectBotDefaultlang > selectedDefaultBotLang ', selectedDefaultBotLang)
    if (selectedDefaultBotLang) {
      this.botDefaultSelectedLangCode = selectedDefaultBotLang.code;
      this.logger.log('onSelectBotDefaultlang > selectedDefaultBotLang > code', this.botDefaultSelectedLangCode)
    }
  }


  onSelectBotId() {
    this.logger.log('[BOT-CREATE] --->  onSelectBotId ', this.selected_bot_id);
    this.dept_id = this.selected_bot_id


    const hasFound = this.depts_without_bot_array.filter((obj: any) => {
      return obj.id === this.selected_bot_id;
    });
    this.logger.log('[BOT-CREATE] private logger: LoggerService --->  onSelectBotId dept found', hasFound);

    if (hasFound.length > 0) {
      this.selected_bot_name = hasFound[0]['name']
    }
  }


  getParamsBotTypeAndDepts() {
    this.route.params.subscribe((params) => {
      this.botType = params.type;
      this.logger.log('[BOT-CREATE] --->  PARAMS', params);
      this.logger.log('[BOT-CREATE] --->  PARAMS botType', this.botType);


      if (this.botType === 'native') {
        this.botType = 'resolution'
      }

      if (this.botType && this.botType === 'external') {
        this.is_external_bot = true
      }

      // used in the template for the translation of the card title 
      this.translateparam = { bottype: this.botType };

      this.getDeptsByProjectId();
    });
  }

  getDeptsByProjectId() {
    this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {

      this.logger.log('[BOT-CREATE] --->  DEPTS RES ', departments);

      if (departments) {
        this.depts_length = departments.length
        this.logger.log('[BOT-CREATE] --->  DEPTS LENGHT ', this.depts_length);

        if (this.depts_length === 1) {
          this.DISPLAY_SELECT_DEPTS_WITHOUT_BOT = false
          this.dept_id = departments[0]['_id']

          this.logger.log('[BOT-CREATE] --->  DEFAULT DEPT HAS BOT ', departments[0].hasBot);
          if (departments[0].hasBot === true) {

            this.logger.log('[BOT-CREATE] --->  DEFAULT DEPT HAS BOT ');
            // this.DISPLAY_BTN_ACTIVATE_BOT_FOR_NEW_CONV = false;
            // this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = false

            // this.logger.log('Bot Create --->  DEFAULT DEPT HAS BOT DISPLAY_BTN_ACTIVATE_BOT_FOR_NEW_CONV ', this.DISPLAY_BTN_ACTIVATE_BOT_FOR_NEW_CONV);
            this.logger.log('[BOT-CREATE] --->  DEFAULT DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);
          } else {

            // this.DISPLAY_BTN_ACTIVATE_BOT_FOR_NEW_CONV = true;
            this.logger.log('[BOT-CREATE] --->  DEFAULT DEPT botType selected ', this.botType);
            if (this.botType !== 'identity') {
              this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = true;
            }

            this.logger.log('[BOT-CREATE] --->  DEFAULT DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);
          }

        }


        if (this.depts_length > 1) {
          this.DISPLAY_SELECT_DEPTS_WITHOUT_BOT = true;
          departments.forEach(dept => {

            // if (dept.default === false) {

            if (dept.hasBot === true) {
              this.logger.log('[BOT-CREATE] --->  DEPT HAS BOT ');

              this.logger.log('[BOT-CREATE] --->  DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);
            } else {

              this.logger.log('[BOT-CREATE] --->  DEPT botType selected ', this.botType);
              if (this.botType !== 'identity') {
                this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = true;
              }
              this.logger.log('[BOT-CREATE] --->  DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);

              this.depts_without_bot_array.push({ id: dept._id, name: dept.name })
            }

          });

          this.logger.log('[BOT-CREATE] --->  DEPT ARRAY OF DEPT WITHOUT BOT ', this.depts_without_bot_array);
        }

      }
    }, error => {

      this.logger.error('[BOT-CREATE --->  DEPTS RES - ERROR', error);
    }, () => {
      this.logger.log('[BOT-CREATE --->  DEPTS RES - COMPLETE')

    });
  }


  // TRANSLATION
  translateFileTypeNotSupported() {
    this.translate.get('FiletypeNotSupported')
      .subscribe((text: string) => {

        this.filetypeNotSupported = text;
        // this.logger.log('[BOT-CREATE+ + + FiletypeNotSupported', text)
      });
  }


  // getFaqKbId() {
  //   this.id_faq_kb = this.route.snapshot.params['faqkbid'];
  //   this.logger.log('FAQ KB HAS PASSED id_faq_kb ', this.id_faq_kb);
  // }

  // /**
  //  * GET FAQ-KB BY ID
  //  */
  // getFaqKbById() {
  //   this.faqKbService.getFaqKbById(this.id_faq_kb).subscribe((faqKb: any) => {
  //     this.logger.log('MONGO DB FAQ-KB GET BY ID', faqKb);
  //     this.faqKbNameToUpdate = faqKb.name;
  //     this.faqKbUrlToUpdate = faqKb.url;
  //     this.logger.log('MONGO DB FAQ-KB NAME', this.faqKbNameToUpdate);

  //     this.showSpinner = false;
  //   });
  // }

  detectBrowserLang() {
    this.browser_lang = this.translate.getBrowserLang();
    this.logger.log('[BOT-CREATE - BROWSER LANGUAGE ', this.browser_lang);
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      // this.logger.log('[BOT-CREATE 00 -> FAQ-KB EDIT ADD COMP project ID from AUTH service subscription  ', this.project._id)
    });
  }



  /* !!NOT MORE USED - was used whith the 'bot external' checkbox - now the bot type is passwd from the component bot-type-select  */
  // hasClickedExternalBot(externalBotselected: boolean) {
  //   this.is_external_bot = externalBotselected;
  //   this.logger.log('[BOT-CREATE hasClickedExternalBot - externalBotselected: ', this.is_external_bot);
  // }

  botNameChanged($event) {
    // this.logger.log('»» »» BOT-CREATE-COMP - bot Name Changed ', $event);
    this.botNameLength = $event.length
    if (this.botType !== 'dialogflow') {
      if ($event.length > 1) {
        this.btn_create_bot_is_disabled = false;
      } else {
        this.btn_create_bot_is_disabled = true;
      }
    } else if (this.botType === 'dialogflow') {
      if ($event.length > 1 && this.percentLoaded === 100) {
        this.logger.log('[BOT-CREATEE] - bot Name Changed - this.percentLoaded', this.percentLoaded);
        this.btn_create_bot_is_disabled = false;
      } else {
        this.btn_create_bot_is_disabled = true;
      }
    }
  }


  // CREATE (mongoDB)
  createBot() {
    this.displayInfoModal = 'block'
    this.SHOW_CIRCULAR_SPINNER = true;

    this.logger.log('[BOT-CREATE] HAS CLICKED CREATE NEW FAQ-KB');
    this.logger.log('[BOT-CREATE] Create Bot - NAME ', this.faqKbName);
    this.logger.log('[BOT-CREATE] Create Bot - URL ', this.faqKbUrl);
    this.logger.log('[BOT-CREATE] Create Bot - PROJ ID ', this.project._id);
    this.logger.log('[BOT-CREATE] Create Bot - Bot Type ', this.botType);
    this.logger.log('[BOT-CREATE] Create Bot - Bot DESCRIPTION ', this.bot_description);

    let _botType = ''
    // if (this.botType === 'native') {
    if (this.botType === 'resolution') {
      // the type 'native' needs to be changed into 'internal' for the service
      _botType = 'internal'
      this.language = this.botDefaultSelectedLangCode;
    } else {
      _botType = this.botType
    }

    // this.is_external_bot
    // ------------------------------------------------------------------------------------------------------------------------------
    // Create bot - note for the creation of a dialogflow bot see the bottom uploaddialogflowBotCredential() called in the complete() 
    // ------------------------------------------------------------------------------------------------------------------------------
    this.faqKbService.addFaqKb(this.faqKbName, this.faqKbUrl, _botType, this.bot_description, this.language)

      .subscribe((faqKb) => {
        this.logger.log('[BOT-CREATE] CREATE FAQKB - RES ', faqKb);

        if (faqKb) {
          this.newBot_name = faqKb.name;
          this.newBot_Id = faqKb._id;

          this.translateparamBotName = { bot_name: this.newBot_name }

          if (faqKb.type === 'external') {
            this.newBot_External = true;
          } else {
            this.newBot_External = false;
          }

          // SAVE THE BOT IN LOCAL STORAGE
          this.botLocalDbService.saveBotsInStorage(this.newBot_Id, faqKb);
        }

      },
        (error) => {

          this.logger.error('[BOT-CREATE] CREATE FAQKB - POST REQUEST ERROR ', error);

          this.SHOW_CIRCULAR_SPINNER = false;
          this.CREATE_DIALOGFLOW_BOT_ERROR = true;

          if (this.botType !== 'dialogflow') {
            this.CREATE_BOT_ERROR = true;
          }
        },
        () => {
          this.logger.log('[BOT-CREATE] CREATE FAQKB - POST REQUEST * COMPLETE *');

          if (this.botType !== 'dialogflow') {
            this.SHOW_CIRCULAR_SPINNER = false;
            this.CREATE_BOT_ERROR = false;
          }

          // if the bot type is 'dialogflow' with the bot-id returned from the response of 'createBot()' run another POST CALLBACK with the uploaded credential
          if (this.botType === 'dialogflow') {

            this.logger.log('Create Bot (dialogflow) »»»»»»»»» - Bot Type: ', this.botType,
              ' - uploadedFile: ', this.uploadedFile,
              ' - lang Code ', this.dlgflwSelectedLangCode,
              ' - kbs (dlgflwKnowledgeBaseID) ', this.dlgflwKnowledgeBaseID);

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
                this.logger.log('[BOT-CREATE] Create BOT (dialogflow) »»»»»»»»» - dlgflwKnowledgeBaseID.length ', this.dlgflwKnowledgeBaseID.length);
                formData.append('kbs', this.dlgflwKnowledgeBaseID.trim());
              } else {
                this.logger.log('[BOT-CREATE] Create BOT (dialogflow) »»»»»»»»» - dlgflwKnowledgeBaseID.length ', this.dlgflwKnowledgeBaseID.length);
                formData.append('kbs', "");
              }

            } else if (this.dlgflwKnowledgeBaseID === undefined || this.dlgflwKnowledgeBaseID === 'undefined' || this.dlgflwKnowledgeBaseID === null || this.dlgflwKnowledgeBaseID === 'null') {
              this.logger.log('[BOT-CREATE] Create BOT (dialogflow) »»»»»»»»» - dlgflwKnowledgeBaseID ', this.dlgflwKnowledgeBaseID);
              formData.append('kbs', "");
            }

            // --------------------------------------------------------------------------
            // formData.append file
            // --------------------------------------------------------------------------
            formData.append('file', this.uploadedFile, this.uploadedFile.name);
            this.logger.log('[BOT-CREATE] Create BOT FORM DATA ', formData)

            this.uploaddialogflowBotCredential(this.newBot_Id, formData);
            //
          }
        });
  }

  uploaddialogflowBotCredential(bot_Id, formData) {
    this.faqKbService.uploadDialogflowBotCredetial(bot_Id, formData).subscribe((res) => {
      this.logger.log('[BOT-CREATE] CREATE FAQKB - uploadDialogflowBotCredetial - RES ', res);

    }, (error) => {
      this.logger.log('[BOT-CREATE] CREATE FAQKB - uploadDialogflowBotCredetial - ERROR ', error);
      if (error) {
        const objctErrorBody = JSON.parse(error._body)
        this.DIALOGFLOW_BOT_ERROR_MSG = objctErrorBody.msg
        this.logger.error('[BOT-CREATE] CREATE FAQKB - DIALOGFLOW_BOT_ERROR_MSG ', this.DIALOGFLOW_BOT_ERROR_MSG);
      }

      this.CREATE_DIALOGFLOW_BOT_ERROR = true;
      this.SHOW_CIRCULAR_SPINNER = false;

    }, () => {


      this.CREATE_DIALOGFLOW_BOT_ERROR = false;
      this.SHOW_CIRCULAR_SPINNER = false;

      this.logger.log('[BOT-CREATE] CREATE FAQKB - uploadDialogflowBotCredetial * COMPLETE *');
    });
  }

  onSelectDialogFlowBotLang(selectedLangCode: string) {
    if (selectedLangCode) {
      this.logger.log('[BOT-CREATE] Create Faq Kb - Bot Type: ', this.botType, ' - selectedLang CODE : ', selectedLangCode);
      this.dlgflwSelectedLangCode = selectedLangCode
    }
  }

  goTo_EditBot() {
    if (this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT === false) {
      let bot_type = ''
      if (this.botType === 'resolution') {
        bot_type = 'native'
      } else {
        bot_type = this.botType
      }
      // this.router.navigate(['project/' + this.project._id + '/bots/' + this.newBot_Id + "/" + this.botType]);
      this.router.navigate(['project/' + this.project._id + '/bots/' + this.newBot_Id + "/" + bot_type]);
    } else {
      this.present_modal_attacch_bot_to_dept()
    }
  }

  present_modal_attacch_bot_to_dept() {
    this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = false
    this.displayModalAttacchBotToDept = 'block'
    this.onCloseModal();
  }

  onCloseModalAttacchBotToDept() {
    let bot_type = ''
    if (this.botType === 'resolution') {
      bot_type = 'native'
    } else {
      bot_type = this.botType
    }
    // this.router.navigate(['project/' + this.project._id + '/bots/' + this.newBot_Id + "/" + this.botType]);
    this.router.navigate(['project/' + this.project._id + '/bots/' + this.newBot_Id + "/" + bot_type]);

  }

  hookBotToDept() {
    this.HAS_CLICKED_HOOK_BOOT_TO_DEPT = true;
    this.departmentService.updateExistingDeptWithSelectedBot(this.dept_id, this.newBot_Id).subscribe((res) => {
      this.logger.log('[BOT-CREATE] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - RES ', res);
    }, (error) => {
      this.logger.error('[BOT-CREATE] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - ERROR ', error);

      this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT = true


      this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT_ERROR = true;

      this.logger.log('[BOT-CREATE] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - ERROR - HAS_COMPLETED_HOOK_BOOT_TO_DEPT', this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT);
    }, () => {
      this.logger.log('[BOT-CREATE] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - COMPLETE ');

      this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT = true
      this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT_SUCCESS = true;
      this.logger.log('[BOT-CREATE] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - COMPLETE - HAS_COMPLETED_HOOK_BOOT_TO_DEPT', this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT);
    });
  }


  onCloseModal() {
    this.displayInfoModal = 'none';
    this.CREATE_DIALOGFLOW_BOT_ERROR = null;
    this.CREATE_BOT_ERROR = null;
  }

  goBackToFaqKbList() {
    // this.router.navigate(['project/' + this.project._id + '/faqkb']);
    this.router.navigate(['project/' + this.project._id + '/bots']);
  }

  goBack() {
    this.location.back();
  }

  // launchWidget() {
  //   if (window && window['tiledesk']) {
  //     window['tiledesk'].open();
  //   }
  // }
  hasClickedChangeFile() {
    this.hideProgressBar = true;
    this.uploadCompleted = true;
    this.hasAlreadyUploadAfile = true;
    this.logger.log('[BOT-CREATE] Create Faq Kb - hasClickedChangeFile hideProgressBar - ', this.hideProgressBar);
  }

  onFileChange(event: any) {

    // this.elemProgressPercent = <HTMLElement>document.querySelector('.percent');
    // this.logger.log('PROGRESS ELEMENT ', this.elemProgressPercent);

    this.logger.log('[BOT-CREATE] ----> FILE - event.target.files ', event.target.files);
    this.logger.log('[BOT-CREATE] ----> FILE - event.target.files.length ', event.target.files.length);
    if (event.target.files && event.target.files.length) {
      const fileList = event.target.files;
      this.logger.log('[BOT-CREATE] ----> FILE - fileList ', fileList);

      if (fileList.length > 0) { }
      const file: File = fileList[0];
      this.logger.log('[BOT-CREATE] ----> FILE - file ', file);

      this.uploadedFile = file;
      this.logger.log('[BOT-CREATE] ----> FILE - onFileChange this.uploadedFile ', this.uploadedFile);
      this.uploadedFileName = this.uploadedFile.name
      this.logger.log('[BOT-CREATE] create Faq Kb - onFileChange uploadedFileName ', this.uploadedFileName);
      // const formData: FormData = new FormData();
      // formData.append('uploadFile', file, file.name);
      // this.logger.log('FORM DATA ', formData)

      this.handleFileUploading(file);

      // this.doFormData(file)

    }
  }

  // not used
  dragstart_handler(ev: any) {
    this.logger.log('[BOT-CREATE] ----> FILE - dragstart_handler ', ev);
    ev.dataTransfer.setData("application/JSON", ev.target.id);
  }

  // DROP (WHEN THE FILE IS RELEASED ON THE DROP ZONE)
  drop(ev: any) {
    ev.preventDefault();
    ev.stopPropagation();

    this.logger.log('[BOT-CREATE] ----> FILE - DROP ev ', ev);
    const fileList = ev.dataTransfer.files;
    // this.logger.log('----> FILE - DROP ev.dataTransfer.files ', fileList);

    if (fileList.length > 0) {
      const file: File = fileList[0];
      this.logger.log('[BOT-CREATE] ----> FILE - DROP file ', file);

      var mimeType = fileList[0].type;
      this.logger.log('[BOT-CREATE] ----> FILE - drop mimeType files ', mimeType);

      if (mimeType === "application/JSON" || mimeType === "application/json") {

        this.uploadedFile = file;
        this.logger.log('[BOT-CREATE] ----> FILE - drop this.uploadedFile ', this.uploadedFile);
        this.uploadedFileName = this.uploadedFile.name
        this.logger.log('[BOT-CREATE] Create Faq Kb - drop uploadedFileName ', this.uploadedFileName);

        this.handleFileUploading(file);
        // this.doFormData(file)
      } else {
        this.logger.log('[BOT-CREATE] ----> FILE - drop mimeType files ', mimeType, 'NOT SUPPORTED FILE TYPE');

        this.notify.showWidgetStyleUpdateNotification(this.filetypeNotSupported, 4, 'report_problem');

      }
    }
  }

  // DRAG OVER (WHEN HOVER OVER ON THE "DROP ZONE")
  allowDrop(ev: any) {
    ev.preventDefault();
    ev.stopPropagation();
    // this.logger.log('[BOT-CREATE] ----> FILE - (dragover) allowDrop ev ', ev);
    this.isHovering = true;
  }

  // DRAG LEAVE (WHEN LEAVE FROM THE DROP ZONE)
  drag(ev: any) {
    ev.preventDefault();
    ev.stopPropagation();
    this.logger.log('[BOT-CREATE] ----> FILE - (dragleave) drag ev ', ev);
    this.isHovering = false;
  }

  handleFileUploading(file: any) {
    if (this.hasAlreadyUploadAfile === false) {
      this.hideProgressBar = false;
      this.hideDropZone = true;
    }

    // const reader = new FileReader();
    this.reader.readAsDataURL(file);
    // this.logger.log('[BOT-CREATE] ----> FILE - file ', reader.readAsDataURL(file));


    this.reader.onloadstart = () => {
      this.loadingFile = true;
    };

    this.reader.onprogress = (data) => {
      // this.logger.log('[BOT-CREATE] READER ON PROGRESS DATA', data);
      if (data.lengthComputable) {
        // const progress = parseInt(((data.loaded / data.total) * 100), 10 );
        this.percentLoaded = Math.round((data.loaded / data.total) * 100);
        this.logger.log('[BOT-CREATE] READER ON PROGRESS PROGRESS ', this.percentLoaded);

        if (this.percentLoaded === 100) {
          setTimeout(() => {
            this.hideProgressBar = true;
            this.uploadCompleted = true;
          }, 500);
        }

        if (this.botNameLength > 1 && this.percentLoaded === 100) {
          this.btn_create_bot_is_disabled = false;
        }
      }
    };

    // triggered each time the reading operation is successfully completed.
    this.reader.onload = () => {
      setTimeout(() => {
        this.loadingFile = false;
      }, 500);

      // this.logger.log('READER ON LOAD result', reader.result);
      if (this.reader.result) {

        // this.form.get(this.field.name).patchValue({ 'value': file['name'] });

        // if (!this.field.hasNotes) {
        //   this.form.get(this.field.name).patchValue(file['name']);
        // } else {
        //   this.form.get(this.field.name).patchValue({ 'value': file['name'] });
        // }

      }
    };
  }








  // openDialogGenerateCredentialTutorial() {
  //   const url = 'https://developer.tiledesk.com/apis/tutorials/generate-dialgoflow-google-credentials-file';
  //   window.open(url, '_blank');
  // }

  // -----------------------------------------------------------------------
  // Dialogflow bot doc link
  // -----------------------------------------------------------------------
  openDeveloperTiledeskGenerateDFCredentialFile() {
    const url = 'https://developer.tiledesk.com/external-chatbot/build-your-own-dialogflow-connnector/generate-dialgoflow-google-credentials-file';
    window.open(url, '_blank');
  }

  openDocsTiledeskDialogflowConnector() {
    const url = 'https://docs.tiledesk.com/knowledge-base/microlanguage-for-dialogflow-images-videos/';
    window.open(url, '_blank');
  }

  openDocsDialogFlowHandoffToHumanAgent() {
    const url = 'https://docs.tiledesk.com/knowledge-base/dialogflow-connector-handoff-to-human-agent-example/';
    window.open(url, '_blank');
  }

  // used during the creation
  openDialogflowKbFeatureTutorial() {
    const url = 'https://cloud.google.com/dialogflow/docs/knowledge-connectors';
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





  // -----------------------------------------------------------------------
  // Resolution bot doc link
  // -----------------------------------------------------------------------
  openResolutionBotDocsStylingYourChatbotReplies() {
    const url = 'https://docs.tiledesk.com/knowledge-base/styling-your-chatbot-replies/';
    window.open(url, '_blank');
  }

  openDocsResolutionBotSendImageVideosMore() {
    const url = 'https://docs.tiledesk.com/knowledge-base/response-bot-images-buttons-videos-and-more/';
    window.open(url, '_blank');
  }

  openDocsResolutionBotHandoffToHumanAgent() {
    const url = 'https://docs.tiledesk.com/knowledge-base/handoff-to-human-agents/';
    window.open(url, '_blank');
  }

  openDocsResolutionBotConfigureYourFirstChatbot() {
    // const url = 'https://docs.tiledesk.com/knowledge-base/create-a-bot/';
    const url = 'https://docs.tiledesk.com/knowledge-base/configure-your-first-chatbot/';
    window.open(url, '_blank');
  }


  // !!! NO MORE USED - WHEN A BOT IS CREATED IN THE MODAL WINDOW 'CREATE BOT', TWO ACTIONS ARE POSSIBLE:
  // "ADD FAQS NOW" and "RETURN TO THE BOT LIST (ADD AFTER)". DEFAULT IS SELECTED THE FIRST ACTION.
  // WHEN THE USER CLICK ON "CONTINUE" WILL BE ADDRESSED: TO THE VIEW OF "EDIT BOT" or,
  // IF THE USER SELECT THE SECOND OPTION, TO THE LIST OF BOT
  actionAfterGroupCreation(goToEditBot) {
    this.goToEditBot = goToEditBot;
    this.logger.log('[BOT-CREATE] »»» »»» GO TO EDIT BOT ', goToEditBot)
  }


  goToKBArticle_Connect_your_Dialogflow_Agent() {
    this.logger.log('[BOT-CREATE] goToKBArticle_Connect_your_Dialogflow_Agent');
    const url = 'https://docs.tiledesk.com/knowledge-base/connect-your-dialogflow-agent/';
    window.open(url, '_blank');
  }





}
