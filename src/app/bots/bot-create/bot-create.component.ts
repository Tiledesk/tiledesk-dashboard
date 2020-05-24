import { Component, OnInit } from '@angular/core';
import { FaqKbService } from '../../services/faq-kb.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { Project } from '../../models/project-model';
import { AuthService } from '../../core/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { BotLocalDbService } from '../../services/bot-local-db.service';
import { Location } from '@angular/common';
import brand from 'assets/brand/brand.json';
import { BotsBaseComponent } from '../bots-base/bots-base.component';
import { NotifyService } from '../../core/notify.service';

@Component({
  selector: 'bot-create',
  templateUrl: './bot-create.component.html',
  styleUrls: ['./bot-create.component.scss']
})
export class BotCreateComponent extends BotsBaseComponent implements OnInit {
  tparams = brand;

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

  constructor(
    private faqKbService: FaqKbService,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private translate: TranslateService,
    public location: Location,
    private botLocalDbService: BotLocalDbService,
    private notify: NotifyService
  ) {
    super();
  }

  ngOnInit() {
    console.log('»»»» Bot Create Component')
    this.auth.checkRoleForCurrentProject();

    this.detectBrowserLang();

    // BASED ON THE URL PATH DETERMINE IF THE USER HAS SELECTED (IN FAQ-KB PAGE) 'CREATE' OR 'EDIT'
    // if (this.router.url === '/createfaqkb') {
    // if (this.router.url.indexOf('/createfaqkb') !== -1) {
    //   console.log('HAS CLICKED CREATE ');
    //   this.CREATE_VIEW = true;
    //   this.showSpinner = false;
    // } else {
    //   console.log('HAS CLICKED EDIT ');
    //   this.EDIT_VIEW = true;

    //   // GET THE ID OF FAQ-KB PASSED BY FAQ-KB PAGE
    //   this.getFaqKbId();

    //   // GET THE DETAIL OF FAQ-KB BY THE ID AS ABOVE
    //   this.getFaqKbById();
    // }

    this.getCurrentProject();
    this.getParamsBotType();
    this.translateFileTypeNotSupported()
  }
  getParamsBotType() {
    this.route.params.subscribe((params) => {
      this.botType = params.type;

      if (this.botType && this.botType === 'external') {
        this.is_external_bot = true
      }

      // used in the template for the translation of the card title 
      this.translateparam = { bottype: this.botType };

      console.log('Bot Create --->  PARAMS', params);
      console.log('Bot Create --->  PARAMS botType', this.botType);
    });
  }

  // TRANSLATION
  translateFileTypeNotSupported() {
    this.translate.get('FiletypeNotSupported')
      .subscribe((text: string) => {

        this.filetypeNotSupported = text;
        console.log('+ + + FiletypeNotSupported', text)
      });
  }


  // getFaqKbId() {
  //   this.id_faq_kb = this.route.snapshot.params['faqkbid'];
  //   console.log('FAQ KB HAS PASSED id_faq_kb ', this.id_faq_kb);
  // }

  // /**
  //  * GET FAQ-KB BY ID
  //  */
  // getFaqKbById() {
  //   this.faqKbService.getMongDbFaqKbById(this.id_faq_kb).subscribe((faqKb: any) => {
  //     console.log('MONGO DB FAQ-KB GET BY ID', faqKb);
  //     this.faqKbNameToUpdate = faqKb.name;
  //     this.faqKbUrlToUpdate = faqKb.url;
  //     console.log('MONGO DB FAQ-KB NAME', this.faqKbNameToUpdate);

  //     this.showSpinner = false;
  //   });
  // }

  detectBrowserLang() {
    this.browser_lang = this.translate.getBrowserLang();
    console.log('»» »» BOT-CREATE-COMP - BROWSER LANGUAGE ', this.browser_lang);
  }
  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      // console.log('00 -> FAQ-KB EDIT ADD COMP project ID from AUTH service subscription  ', this.project._id)
    });
  }



  /* !!NOT MORE USED - was used whith the 'bot external' checkbox - now the bot type is passwd from the component bot-type-select  */
  // hasClickedExternalBot(externalBotselected: boolean) {
  //   this.is_external_bot = externalBotselected;
  //   console.log('hasClickedExternalBot - externalBotselected: ', this.is_external_bot);
  // }

  botNameChanged($event) {
    // console.log('»» »» BOT-CREATE-COMP - bot Name Changed ', $event);
    this.botNameLength = $event.length
    if (this.botType !== 'dialogflow') {
      if ($event.length > 1) {
        this.btn_create_bot_is_disabled = false;
      } else {
        this.btn_create_bot_is_disabled = true;
      }
    } else if (this.botType === 'dialogflow') {
      if ($event.length > 1 && this.percentLoaded === 100) {
        console.log('»» »» BOT-CREATE-COMP - bot Name Changed - this.percentLoaded', this.percentLoaded);
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

    console.log('HAS CLICKED CREATE NEW FAQ-KB');
    console.log('BOT-CREATE-COMP Create Bot - NAME ', this.faqKbName);
    console.log('BOT-CREATE-COMP Create Bot - URL ', this.faqKbUrl);
    console.log('BOT-CREATE-COMP Create Bot - PROJ ID ', this.project._id);
    console.log('BOT-CREATE-COMP Create Bot - Bot Type ', this.botType);
    console.log('BOT-CREATE-COMP Create Bot - Bot DESCRIPTION ', this.bot_description);

    let _botType = ''
    if (this.botType === 'native') {
      // the type 'native' needs to be changed into 'internal' for the service
      _botType = 'internal'
    } else {
      _botType = this.botType
    }

    // this.is_external_bot
    // ------------------------------------------------------------------------------------------------------------------------------
    // Create bot - note for the creation of a dialogflow bot see the bottom uploaddialogflowBotCredential() called in the complete() 
    // ------------------------------------------------------------------------------------------------------------------------------
    this.faqKbService.addMongoDbFaqKb(this.faqKbName, this.faqKbUrl, _botType , this.bot_description)

      .subscribe((faqKb) => {
        console.log('»»»»»»»» »»»»»»»» »»»»»»»» CREATE FAQKB - POST DATA ', faqKb);

        if (faqKb) {
          this.newBot_name = faqKb.name;
          this.newBot_Id = faqKb._id;

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

          console.log('CREATE FAQKB - POST REQUEST ERROR ', error);

          this.SHOW_CIRCULAR_SPINNER = false;
          this.CREATE_DIALOGFLOW_BOT_ERROR = true;

          if (this.botType !== 'dialogflow') {
            this.CREATE_BOT_ERROR = true;
          }
        },
        () => {
          console.log('CREATE FAQKB - POST REQUEST * COMPLETE *');

          if (this.botType !== 'dialogflow') {
            this.SHOW_CIRCULAR_SPINNER = false;
            this.CREATE_BOT_ERROR = false;
          }

          // if the bot type is 'dialogflow' with the bot-id returned from the response of 'createBot()' run another POST CALLBACK with the uploaded credential
          if (this.botType === 'dialogflow') {

            console.log('Create Bot (dialogflow) »»»»»»»»» - Bot Type: ', this.botType,
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
                console.log('Create BOT (dialogflow) »»»»»»»»» - dlgflwKnowledgeBaseID.length ', this.dlgflwKnowledgeBaseID.length);
                formData.append('kbs', this.dlgflwKnowledgeBaseID.trim());
              } else {
                console.log('Create BOT (dialogflow) »»»»»»»»» - dlgflwKnowledgeBaseID.length ', this.dlgflwKnowledgeBaseID.length);
                formData.append('kbs', "");
              }

            } else if (this.dlgflwKnowledgeBaseID === undefined || this.dlgflwKnowledgeBaseID === 'undefined' || this.dlgflwKnowledgeBaseID === null || this.dlgflwKnowledgeBaseID === 'null') {
              console.log('Create BOT (dialogflow) »»»»»»»»» - dlgflwKnowledgeBaseID ', this.dlgflwKnowledgeBaseID);
              formData.append('kbs', "");
            }

            // --------------------------------------------------------------------------
            // formData.append file
            // --------------------------------------------------------------------------
            formData.append('file', this.uploadedFile, this.uploadedFile.name);
            console.log('Create BOT FORM DATA ', formData)

            this.uploaddialogflowBotCredential(this.newBot_Id, formData);
            //
          }
        });
  }

  uploaddialogflowBotCredential(bot_Id, formData) {
    this.faqKbService.uploadDialogflowBotCredetial(bot_Id, formData).subscribe((res) => {
      console.log('CREATE FAQKB - uploadDialogflowBotCredetial - RES ', res);

    }, (error) => {
      console.log('CREATE FAQKB - uploadDialogflowBotCredetial - ERROR ', error);
      if (error) {
       const objctErrorBody = JSON.parse(error._body)
        this.DIALOGFLOW_BOT_ERROR_MSG = objctErrorBody.msg
        console.log('CREATE FAQKB - DIALOGFLOW_BOT_ERROR_MSG ',  this.DIALOGFLOW_BOT_ERROR_MSG);
      }

      this.CREATE_DIALOGFLOW_BOT_ERROR = true;
      this.SHOW_CIRCULAR_SPINNER = false;

    }, () => {
      console.log('CREATE FAQKB - uploadDialogflowBotCredetial - COMPLETE ');

      this.CREATE_DIALOGFLOW_BOT_ERROR = false;
      this.SHOW_CIRCULAR_SPINNER = false;

      console.log('CREATE FAQKB - uploadDialogflowBotCredetial * COMPLETE *');
    });
  }

  onSelectDialogFlowBotLang(selectedLangCode: string) {
    if (selectedLangCode) {
      console.log('Create Faq Kb - Bot Type: ', this.botType, ' - selectedLang CODE : ', selectedLangCode);
      this.dlgflwSelectedLangCode = selectedLangCode
    }
  }

  goTo_EditBot() {
    this.router.navigate(['project/' + this.project._id + '/bots/' + this.newBot_Id + "/" + this.botType]);
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

  launchWidget() {
    if (window && window['tiledesk']) {
      window['tiledesk'].open();
    }
  }
  hasClickedChangeFile() {
    this.hideProgressBar = true;
    this.uploadCompleted = true;
    this.hasAlreadyUploadAfile = true;
    console.log('Create Faq Kb - hasClickedChangeFile hideProgressBar - ', this.hideProgressBar);
  }

  onFileChange(event: any) {

    // this.elemProgressPercent = <HTMLElement>document.querySelector('.percent');
    // console.log('PROGRESS ELEMENT ', this.elemProgressPercent);

    console.log('----> FILE - event.target.files ', event.target.files);
    console.log('----> FILE - event.target.files.length ', event.target.files.length);
    if (event.target.files && event.target.files.length) {
      const fileList = event.target.files;
      console.log('----> FILE - fileList ', fileList);

      if (fileList.length > 0) { }
      const file: File = fileList[0];
      console.log('----> FILE - file ', file);

      this.uploadedFile = file;
      console.log('----> FILE - onFileChange this.uploadedFile ', this.uploadedFile);
      this.uploadedFileName = this.uploadedFile.name
      console.log('Create Faq Kb - onFileChange uploadedFileName ', this.uploadedFileName);
      // const formData: FormData = new FormData();
      // formData.append('uploadFile', file, file.name);
      // console.log('FORM DATA ', formData)

      this.handleFileUploading(file);

      // this.doFormData(file)

    }
  }

  // not used
  dragstart_handler(ev: any) {
    console.log('----> FILE - dragstart_handler ', ev);
    ev.dataTransfer.setData("application/JSON", ev.target.id);
  }

  // DROP (WHEN THE FILE IS RELEASED ON THE DROP ZONE)
  drop(ev: any) {
    ev.preventDefault();
    ev.stopPropagation();

    console.log('----> FILE - DROP ev ', ev);
    const fileList = ev.dataTransfer.files;
    // console.log('----> FILE - DROP ev.dataTransfer.files ', fileList);

    if (fileList.length > 0) {
      const file: File = fileList[0];
      console.log('----> FILE - DROP file ', file);

      var mimeType = fileList[0].type;
      console.log('----> FILE - drop mimeType files ', mimeType);

      if (mimeType === "application/JSON" || mimeType === "application/json") {

        this.uploadedFile = file;
        console.log('----> FILE - drop this.uploadedFile ', this.uploadedFile);
        this.uploadedFileName = this.uploadedFile.name
        console.log('Create Faq Kb - drop uploadedFileName ', this.uploadedFileName);

        this.handleFileUploading(file);
        // this.doFormData(file)
      } else {
        console.log('----> FILE - drop mimeType files ', mimeType, 'NOT SUPPORTED FILE TYPE');

        this.notify.showWidgetStyleUpdateNotification(this.filetypeNotSupported, 4, 'report_problem');

      }
    }
  }

  // DRAG OVER (WHEN HOVER OVER ON THE "DROP ZONE")
  allowDrop(ev: any) {
    ev.preventDefault();
    ev.stopPropagation();
    // console.log('----> FILE - (dragover) allowDrop ev ', ev);
    this.isHovering = true;
  }

  // DRAG LEAVE (WHEN LEAVE FROM THE DROP ZONE)
  drag(ev: any) {
    ev.preventDefault();
    ev.stopPropagation();
    console.log('----> FILE - (dragleave) drag ev ', ev);
    this.isHovering = false;
  }


  // doFormData(file) {
  //   const formData: FormData = new FormData();
  //   formData.append('uploadFile', file, file.name);
  //   console.log('FORM DATA ', formData)

  //   // return formData
  // }

  handleFileUploading(file: any) {

    if (this.hasAlreadyUploadAfile === false) {
      this.hideProgressBar = false;
      this.hideDropZone = true;
    }

    // const reader = new FileReader();
    this.reader.readAsDataURL(file);
    // console.log('----> FILE - file ', reader.readAsDataURL(file));


    this.reader.onloadstart = () => {
      this.loadingFile = true;
    };

    this.reader.onprogress = (data) => {
      // console.log('READER ON PROGRESS DATA', data);
      if (data.lengthComputable) {
        // const progress = parseInt(((data.loaded / data.total) * 100), 10 );
        this.percentLoaded = Math.round((data.loaded / data.total) * 100);
        console.log('READER ON PROGRESS PROGRESS ', this.percentLoaded);

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

      // console.log('READER ON LOAD result', reader.result);
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

  openExternalBotIntegrationTutorial() {
    const url = 'https://developer.tiledesk.com/apis/tutorials/connect-your-own-chatbot';
    window.open(url, '_blank');
  }

  openDialogflowConsole() {
    const url = 'https://dialogflow.cloud.google.com/#/login';
    window.open(url, '_blank');
  }

  openDialogGenerateCredentialTutorial() {
    const url = 'https://developer.tiledesk.com/apis/tutorials/generate-dialgoflow-google-credentials-file';
    window.open(url, '_blank');
  }

  openDialogflowKbFeatureTutorial() {
    const url = 'https://cloud.google.com/dialogflow/docs/knowledge-connectors';
    window.open(url, '_blank');
  }



  // !!! NO MORE USED - WHEN A BOT IS CREATED IN THE MODAL WINDOW 'CREATE BOT', TWO ACTIONS ARE POSSIBLE:
  // "ADD FAQS NOW" and "RETURN TO THE BOT LIST (ADD AFTER)". DEFAULT IS SELECTED THE FIRST ACTION.
  // WHEN THE USER CLICK ON "CONTINUE" WILL BE ADDRESSED: TO THE VIEW OF "EDIT BOT" or,
  // IF THE USER SELECT THE SECOND OPTION, TO THE LIST OF BOT
  actionAfterGroupCreation(goToEditBot) {
    this.goToEditBot = goToEditBot;
    console.log('»»» »»» GO TO EDIT BOT ', goToEditBot)
  }

  // !!! NO MORE USED IN THIS COMPONENT - MOVED IN faq.component.html
  // edit() {
  //   console.log('FAQ KB NAME TO UPDATE ', this.faqKbNameToUpdate);
  //   console.log('FAQ KB URL TO UPDATE ', this.faqKbUrlToUpdate);

  //   this.faqKbService.updateMongoDbFaqKb(this.id_faq_kb, this.faqKbNameToUpdate, this.faqKbUrlToUpdate).subscribe((data) => {
  //     console.log('PUT DATA ', data);

  //     // RE-RUN GET CONTACT TO UPDATE THE TABLE
  //     // this.getDepartments();
  //     this.ngOnInit();
  //   },
  //     (error) => {

  //       console.log('PUT REQUEST ERROR ', error);

  //     },
  //     () => {
  //       console.log('PUT REQUEST * COMPLETE *');

  //       this.router.navigate(['project/' + this.project._id + '/faqkb']);
  //     });
  // }



}
