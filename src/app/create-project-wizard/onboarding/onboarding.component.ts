import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs'
import { ActivatedRoute, Router } from '@angular/router';
import { BrandService } from '../../services/brand.service';
import { LoggerService } from '../../services/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { ProjectService } from '../../services/project.service';
import { WidgetService } from '../../services/widget.service';
import { WidgetSetUpBaseComponent } from '../../widget_components/widget-set-up/widget-set-up-base/widget-set-up-base.component';
import { FaqKbService } from '../../services/faq-kb.service';
import { BotLocalDbService } from '../../services/bot-local-db.service';
import { FaqService } from '../../services/faq.service';
import { DepartmentService } from '../../services/department.service';

import{ stripEmojis } from '../../utils/util';
import { HttpClient } from "@angular/common/http"

@Component({
  selector: 'appdashboard-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent extends WidgetSetUpBaseComponent implements OnInit {
  
  sub: Subscription;
  selectedLangCode: string = "en"; 
  selectedLangName: string = "English";
  buttonBackMenu: string = "\n* ↩️ Menu tdIntent:start";
  buttonAgent: string = "\agent";
  companyLogoBlack_Url:string;
  
  projectId: string;
  projectName: string;
  selected: string;
  welcomeMessage: string;
  defaultFallback: string;
  translations: any;
  idQuestionStart: string;

  primaryColor: string;
  secondaryColor: string;

  startNow = false;
  intents = [];
  questions = [];
  answers = [];

  step2Questions = [];
  step2Answers = [];

  step3Questions = [];
  step3Answers = [];

  questionStep4ChatbotConfiguration: string;
  answareStep4ChatbotConfiguration: string;
  stepNumber = 1;
  translateY = 'translateY(0px)';

  // bot variables
  botId: string;
  DISPLAY_SPINNER_SECTION:boolean = false;
  DISPLAY_SPINNER:boolean = false;
  DISPLAY_BOT:boolean = false;
  CREATE_BOT_ERROR: boolean = false;
  DISPLAY_FAQ:boolean = false;
  CREATE_FAQ_ERROR:boolean = false;
  parse_done: boolean;
  parse_err: boolean;
  error_status: number;
  
 

  constructor(
    private faqService: FaqService,
    private faqKbService: FaqKbService,
    private botLocalDbService: BotLocalDbService,
    private router: Router,
    private route: ActivatedRoute,
    public brandService: BrandService,
    private logger: LoggerService,
    public translate: TranslateService,
    private projectService: ProjectService,
    public widgetService: WidgetService,
    private departmentService: DepartmentService,
    private httpClient: HttpClient
  ) { 
    super(translate);
    const brand = brandService.getBrand(); 
    this.companyLogoBlack_Url = brand['company_logo_black__url'];
    this.projectId = this.route.snapshot.params['projectid'];
    this.selectedLangCode = this.route.snapshot.params['langcode'];
    this.selectedLangName = this.route.snapshot.params['langname'];
  }

  ngOnInit() {
    // this.DISPLAY_SPINNER_SECTION = true;
    // this.DISPLAY_SPINNER = false;
    // this.DISPLAY_BOT = true;
    // this.CREATE_BOT_ERROR = false;
    // this.DISPLAY_FAQ = true;
    // this.CREATE_FAQ_ERROR = true;
    this.init();
  }

  
  ngOnDestroy() {
    this.sub.unsubscribe();
    // this.whenCreateBot.unsubscribe();
  }

  /** INIT */
  init(){
    this.selected = 'step0';
    this.welcomeMessage = ''; 
    this.sub = this.projectService.getProjectById(this.projectId).subscribe((project: any) => {
      this.projectName = project.name;
      if (project.widget && project.widget.themeColor) {
        this.primaryColor = project.widget.themeColor;
      } else {
        this.primaryColor = this.widgetDefaultSettings.themeColor;
      }
      if (project.widget && project.widget.themeForegroundColor) {
        this.secondaryColor = project.widget.themeForegroundColor;
      } else {
        this.secondaryColor = this.widgetDefaultSettings.themeForegroundColor;
      }
      this.getCurrentTranslation();
      // this.getLabels();
    });
  }


  /** */
  getCurrentTranslation() {     
    let jsonWidgetLangURL = 'assets/i18n/'+this.selectedLangCode+'.json';
    this.httpClient.get(jsonWidgetLangURL).subscribe(data =>{
      try {
        if(data['OnboardPage']){
          this.translations = data['OnboardPage'];
          this.welcomeMessage = this.translations["WelcomeMessage"];
          this.defaultFallback = this.translations["DefaultFallback"];
          this.step2Questions.push(this.translations["QuestionStep1ChatbotConfiguration"]);
          this.step2Questions.push(this.translations["QuestionStep2ChatbotConfiguration"]);
          this.step2Questions.push(this.translations["QuestionStep3ChatbotConfiguration"]);    
          this.step2Answers.push(this.translations["AnswareStep1ChatbotConfiguration"]);
          this.step2Answers.push(this.translations["AnswareStep2ChatbotConfiguration"]);
          this.step2Answers.push(this.translations["AnswareStep3ChatbotConfiguration"]);
          this.questionStep4ChatbotConfiguration = this.translations["QuestionStep4ChatbotConfiguration"];
          this.answareStep4ChatbotConfiguration = this.translations["AnswareStep4ChatbotConfiguration"];
        }
      } catch (err) {
        this.logger.error('error', err);
      }
    });
  }



  /** generate intent name  */
  prepareIntent(intent: string, prefix: string){
    var str = stripEmojis(intent);
    str = str.replace(/\s+/g, '_');
    str = prefix+str.toLowerCase();
    return str;
  }

  /** SERVICES */
   // -----------------  FUNCTION CALLBACK   ------------------------ //
   callback(step:string, variable?: any){
    if(step === 'createBot'){
      this.getDeptsByProjectId();
    }
    else if(step === 'getDeptsByProjectId'){
      this.hookBotToDept(variable);
    }
    else if(step === 'hookBotToDept'){
      this.createDefaultFaqOnBot();
      this.uploadFaqFromCSV(this.questions, this.answers, this.intents);
    }
    else if(step === 'uploadFaqCsv'){
      // this.searchRemoteFaq(this.botId, '\\start');
    }
    else if(step === 'searchRemoteFaq'){
      // this.updateStartMessage();
    }
    else if(step === 'goToNextStep'){
      this.DISPLAY_SPINNER_SECTION = true;
      this.DISPLAY_SPINNER = false;
      this.DISPLAY_BOT = true;
      //this.continueToNextStep();
    }
  }


  setIntentsAndCreateBot(event){
    // console.log("------------> setIntentsAndCreateBot:", event);
    this.DISPLAY_SPINNER_SECTION = true;
    this.DISPLAY_SPINNER = true;
    this.DISPLAY_BOT = true;
    this.DISPLAY_FAQ = false;
    this.CREATE_BOT_ERROR = false;
    this.CREATE_FAQ_ERROR = false;
    this.questions = event.questions;
    this.answers = event.answers;
    this.questions.forEach((question, index) => {
      let key = index.toString()+"_";
      let intent =this.prepareIntent(question, key);
      this.intents.push(intent);
    });
    // console.log("------------> intents:", this.intents);
    this.createBot();  
  }
      

  // ----------------- 1 : CREATE A BOT ------------------------ // 
  createBot(){    
    let faqKbName = this.projectName;
    let faqKbUrl = '';
    let botType = 'tilebot';
    let bot_description = '';
    let language = this.selectedLangCode;
    let template = '';
    this.faqKbService.createFaqKb(faqKbName, faqKbUrl, botType, bot_description, language, template)
      .subscribe((faqKb) => {
        this.logger.log('[BOT-CREATE] CREATE FAQKB - RES ', faqKb);
        if (faqKb) {
          this.botId = faqKb['_id'];
          this.botLocalDbService.saveBotsInStorage(this.botId, faqKb);
          this.callback('createBot', this.botId);
        }
      }, (error) => {
        this.logger.error('[BOT-CREATE] CREATE FAQKB - POST REQUEST ERROR ', error);
        this.DISPLAY_SPINNER = false;
        this.CREATE_BOT_ERROR = true;
      }, () => {
        this.logger.log('[BOT-CREATE] CREATE FAQKB - POST REQUEST * COMPLETE *');
      });
  }

  // ----------------- 2 : GET DEFAULT DEPARTMENT OF THE PROJECT  ------------------------ // 
  getDeptsByProjectId(){
    this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {
      if (departments && departments.length > 0) {
          const departmentId = departments[0]._id;
          this.callback('getDeptsByProjectId', departmentId);
      } else {
        this.DISPLAY_SPINNER = false;
        this.CREATE_BOT_ERROR = true;
      }     
    }, error => {
      this.logger.error('[BOT-CREATE --->  DEPTS RES - ERROR', error);
      this.DISPLAY_SPINNER = false;
      this.CREATE_BOT_ERROR = true;
    }, () => {
      this.logger.log('[BOT-CREATE --->  DEPTS RES - COMPLETE')
    });
  }


  // ----------------- 3 : ASSIGN BOT TO THE DEFAULT DEPARTMENT  ------------------------ //
  hookBotToDept(departmentId) {
    this.departmentService.updateExistingDeptWithSelectedBot(departmentId, this.botId).subscribe((res) => {
      this.logger.log('[TILEBOT] - UPDATE EXISTING DEPT WITH SELECED BOT - RES ', res);
      this.callback('hookBotToDept', res);
    }, (error) => {
      this.logger.error('[TILEBOT] - UPDATE EXISTING DEPT WITH SELECED BOT - ERROR ', error);
      this.DISPLAY_SPINNER = false;
      this.CREATE_BOT_ERROR = true;
    }, () => {
      this.logger.log('[TILEBOT] - UPDATE EXISTING DEPT WITH SELECED BOT * COMPLETE *');
    });
  }


  // ----------------- 4 : ADD START AND DEFAULTFALLBACK TO FAQ    ------------------------ //
  createDefaultFaqOnBot() {
    // console.log('this.step3Questions::: ', this.step3Questions);
    var buttons = "";
    for(let i=0;i<this.questions.length;i++) {
      let question = this.questions[i];
      buttons += "\n* "+question;
    }
    let answer = this.welcomeMessage+buttons;

    this.answers.forEach((answer, index) => {
      if(!answer.includes(this.buttonAgent)){
        this.answers[index] += this.buttonBackMenu;
      } else {
        // the button "talk with an agent" has been created
        // when add it to defaultFallback
        this.defaultFallback += "\n* "+this.questions[index];
      }
    });
    this.intents = ['start','defaultFallback'].concat(this.intents);
    this.questions = ['\\start','defaultFallback'].concat(this.questions);
    this.answers = [answer,this.defaultFallback].concat(this.answers);
    // this.intents.unshift('defaultFallback');
    // this.questions.unshift('defaultFallback');
    // this.answers.unshift(this.defaultFallback);
    // this.intents.unshift('start');
    // this.questions.unshift('\\start');
    // this.answers.unshift(this.welcomeMessage);
  }


  // ----------------- 5 : ADD FAQ TO CHATBOT VIA CSV UPLOAD   ------------------------ //
  uploadFaqFromCSV(questions, answers, intents) {
    let csvColumnsDelimiter = ';'
    var csv = '';
    let buttons = '';
    for(let i=0;i<questions.length;i++) {
      let domanda = '"'+questions[i]+'";';
      let risposta = '"'+answers[i]+'";';
      let intent = '"'+intents[i]+'";';
      csv += domanda+risposta+';'+intent+'false'+'\r\n';
      buttons += "* "+questions[i]+"\n";
    }
    var myBlob = new Blob([csv], {type: "text/csv"});
    const formData: FormData = new FormData();
    formData.set('id_faq_kb', this.botId);
    formData.set('delimiter', csvColumnsDelimiter);
    formData.append('uploadFile', myBlob, 'csvFile');
    //formData.append('uploadFile', csvContent, 'nomeFile');
    //this.logger.log('FORM DATA ', formData)
    this.faqService.uploadFaqCsv(formData)
      .subscribe(data => {
        this.logger.log('[TILEBOT] UPLOAD CSV DATA ', data);
        if (data['success'] === true) {
          // this.callback('uploadFaqCsv');
          this.callback('goToNextStep');
        } else if (data['success'] === false) {
          this.DISPLAY_SPINNER = false;
          this.CREATE_FAQ_ERROR = true;
        }
      }, (error) => {
        this.logger.error('[TILEBOT] UPLOAD CSV - ERROR ', error);
        this.DISPLAY_SPINNER = false;
        this.CREATE_FAQ_ERROR = true;
      }, () => {
        this.logger.log('[TILEBOT] UPLOAD CSV * COMPLETE *');
      });
  }


  // ----------------- 6 : SEARCH THE 'START' FAQ IN THE BOT CHAT   ------------------------ //
  searchRemoteFaq(idBot, selectedQuestion) {
    this.faqService.searchFaqByFaqKbId(idBot, selectedQuestion)
      .subscribe((remoteFaq) => {
        this.logger.log('[FAQ-TEST-TRAIN-BOT] - REMOTE FAQ FOUND - POST DATA ', remoteFaq);
        let hits = remoteFaq['hits'];
        if (hits && hits.length > 0) {
          this.idQuestionStart = hits[0]._id;
          this.logger.log('[FAQ-TEST-COMP] *** idQuestionStart *** ', this.idQuestionStart);
          this.callback('searchRemoteFaq', this.idQuestionStart);
        } else {
          this.DISPLAY_SPINNER = false;
          this.CREATE_FAQ_ERROR = true;
        }
      }, (error) => {
        this.logger.error('[FAQ-TEST-TRAIN-BOT] - REMOTE FAQ - POST REQUEST ERROR ', error);
        this.DISPLAY_SPINNER = false;
        this.CREATE_FAQ_ERROR = true;
      }, () => {
        this.logger.log('[FAQ-TEST-TRAIN-BOT] - REMOTE FAQ - POST REQUEST * COMPLETE *');
      });
  }

  // ----------------- 8 : UPDATE 'START' FAQ BY ADDING BUTTONS   ------------------------ //
  updateStartMessage(){
    let question = '\\start';
    let intent = 'start';
    var buttons = "";
    for(let i=0;i<this.step3Questions.length;i++) {
      let domanda = this.step3Questions[i];
      buttons += "\n* "+domanda;
    }
    let answer = this.welcomeMessage+buttons;
    this.faqService.updateFaq(this.idQuestionStart, question, answer, intent, null, true)
      .subscribe((data) => {
          this.logger.log('[FAQ-EDIT-ADD] UPDATE FAQ RES', data);
          this.callback('goToNextStep');
      }, (error) => {
        this.logger.error('[FAQ-EDIT-ADD] UPDATE FAQ - ERROR ', error);
        // =========== NOTIFY ERROR ===========
        if (error && error['status']) {
          this.error_status = error['status'];
          this.logger.error('[FAQ-EDIT-ADD] UPDATE FAQ - ERROR - ERROR-STATUS', this.error_status);
          if (this.error_status === 409) {
            this.logger.error('[FAQ-EDIT-ADD] UPDATE FAQ - ERROR - ERROR-STATUS - TRANSLATE & PRESENT MODAL');
          }
          this.DISPLAY_SPINNER = false;
          this.CREATE_FAQ_ERROR = true;
        }
      }, () => {
        this.logger.log('[FAQ-EDIT-ADD] UPDATE FAQ * COMPLETE *');
      });
  }

  /** ACTIONS */
  /** */
  gotToChangePage(event) {
    // console.log('gotToChangePage:::: ',event);
    this.selected = event.step;
    if(event.msg){
      this.welcomeMessage = event.msg;
    }
    if(event.step === 'step2'){
      this.stepNumber = 1;
      this.gotToChangeStepNumber(0);
    }
    else if(event.step === 'step3'){
      if( event.questions){
        this.step3Questions = event.questions;
      }
      if( event.answers){
        this.step3Answers = event.answers;
      }
      // this.createDefaultFaqOnBot();
    }
    else if(event.step === 'createBot'){
      this.setIntentsAndCreateBot(event);
    } 
    else if(event.step === 'next'){
      this.continueToNextStep();
    }
  }

  /** */
  gotToChangeStepNumber(next){
    this.stepNumber = this.stepNumber + next;
    if(this.stepNumber <1){
      this.stepNumber = 1;
    }
    this.translateY = 'translateY('+(-this.stepNumber*20+20)+'px)';
  }
 
  /** */
  continueToPrevStep() {
    this.router.navigate([`/project/${this.projectId}/onboarding/` + this.selectedLangCode + '/' + this.selectedLangName]);
  }

  /** */
  continueToNextStep() {
    this.router.navigate([`/project/${this.projectId}/install-widget/` +  this.selectedLangCode + '/' + this.selectedLangName]);
  }

  /** */
  cancel(step){
    this.DISPLAY_SPINNER_SECTION = false;
    this.DISPLAY_SPINNER = false;
    this.CREATE_BOT_ERROR = false;
    this.CREATE_FAQ_ERROR = false;
    this.selected = step;
    if(step === 'step1'){
      this.stepNumber = 1;
      this.gotToChangePage(step);
    }
    if(step === 'step2'){
      this.stepNumber = 1;
      this.gotToChangeStepNumber(0);
    }
  }

  /** */
  goToNextStep(step){
    if(step){
      this.DISPLAY_SPINNER_SECTION = false;
      this.DISPLAY_SPINNER = false;
      this.CREATE_BOT_ERROR = false;
      this.CREATE_FAQ_ERROR = false;
      this.selected = step;
      // console.log('goToNextStep:: ', this.selected, this.DISPLAY_SPINNER_SECTION);
    } else {
      this.continueToNextStep();
    }
  }

}
