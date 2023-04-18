import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { WidgetSetUpBaseComponent } from 'app/widget_components/widget-set-up/widget-set-up-base/widget-set-up-base.component';
import { AuthService } from '../../core/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BrandService } from '../../services/brand.service';
import { LoggerService } from '../../services/logger/logger.service';
import { TranslateService } from '@ngx-translate/core';
import { tranlatedLanguage } from 'app/utils/util';
import { HttpClient } from "@angular/common/http";
import { emailDomainWhiteList } from 'app/utils/util';


@Component({
  selector: 'cnp-onboarding-content',
  templateUrl: './onboarding-content.component.html',
  styleUrls: ['./onboarding-content.component.scss']
})
export class OnboardingContentComponent extends WidgetSetUpBaseComponent implements OnInit {
  logo_x_rocket: string;
  project_name: string;
  DISPLAY_SPINNER_SECTION = false;
  CLOSE_BTN_IS_HIDDEN = true
  user: any;
  companyLogoBlack_Url: string;
  CREATE_PRJCT_FOR_TEMPLATE_INSTALLATION: boolean = false;
  temp_SelectedLangName: string;
  temp_SelectedLangCode: string;
  botid: string;
  browser_lang: string;

  translateY: string;
  steps: any[] = [];
  activeStep: any;
  activeStepNumber: number;
  activeQuestionNumber: number;
  activeQuestion: any;
  // stepDirectionIn: boolean = false;
  disabledNextButton: boolean = true;
  disabledFirstPass: boolean = false;


  welcomeMessage  = "";

  // (nextPageNoFaq)="gotToHumanConfigurationWithoutFaq($event)"
  // (nextPage)="gotToHumanConfiguration($event)"
  // (prevPage) = "goToWelcomeMessage($event)"
  // questionDirectionIn: boolean = false;

  projectName: string;
  userFullname: string;
  // onboardingConfig: any;

  showPass: number = 0;

  numberTotalPass: number = 0;
  arrayNumberTotalPass: any;
  activeNumberPass: number = 0;


  constructor(
    private auth: AuthService,
    private router: Router,
    public location: Location,
    public brandService: BrandService,
    private logger: LoggerService,
    private route: ActivatedRoute,
    public translate: TranslateService,
    private httpClient: HttpClient
  ) {
    super(translate);
    const brand = brandService.getBrand();
    this.logo_x_rocket = brand['wizard_create_project_page']['logo_x_rocket'];
    this.companyLogoBlack_Url = brand['company_logo_black__url'];
    this.botid = this.route.snapshot.params['botid'];
  }


  // SYSTEM FUNCTIONS //
  ngOnInit() {
    this.logger.log('[WIZARD - CREATE-PRJCT] project_name ', this.project_name);
    this.checkCurrentUrlAndHideCloseBtn();
    this.getLoggedUser();
    this.getCurrentTranslation();
  }


  // CUSTOM FUNCTIONS //
  private getCurrentTranslation() {  
    let langDashboard = 'en';
    if(this.translate.currentLang){
      langDashboard = this.translate.currentLang;
    }  
    let jsonWidgetLangURL = 'assets/i18n/'+langDashboard+'.json';
    this.httpClient.get(jsonWidgetLangURL).subscribe(data =>{
      try {
        if(data['OnboardPage']){
          let translations = data['OnboardPage'];
          this.welcomeMessage = translations["WelcomeMessage"];
        }
      } catch (err) {
        this.logger.error('error', err);
      }
    });
  }

  private checkCurrentUrlAndHideCloseBtn() {
    if (this.router.url.startsWith('/create-project-itw/')) {
      this.CREATE_PRJCT_FOR_TEMPLATE_INSTALLATION = true;
      this.browser_lang = this.translate.getBrowserLang();
      if (tranlatedLanguage.includes(this.browser_lang)) {
        const langName = this.getLanguageNameFromCode(this.browser_lang);
        this.temp_SelectedLangName = langName;
        this.temp_SelectedLangCode = this.browser_lang;
      } else {
        this.temp_SelectedLangName = 'English';
        this.temp_SelectedLangCode = 'en';
      }
    }  else if (this.router.url === '/create-project') {
      this.CLOSE_BTN_IS_HIDDEN = true;
      this.CREATE_PRJCT_FOR_TEMPLATE_INSTALLATION = false;
    } else if (this.router.url === '/create-new-project') {
      this.CLOSE_BTN_IS_HIDDEN = false;
      this.CREATE_PRJCT_FOR_TEMPLATE_INSTALLATION = false;
    }
  }

  private getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.user = user;
        this.userFullname = user.displayName?user.displayName:user.firstname;
        this.initialize();
      }
    });
  }

  private initialize(){
    this.numberTotalPass = 2;
    this.translateY = 'translateY(0px)';
    this.activeStepNumber = 0;
    this.activeQuestionNumber = 0;
    this.loadJsonOnboardingConfig();
    this.projectName = this.setProjectName();
    if(!this.projectName){
      this.disabledFirstPass = true;
      this.showPass = 1;
    } else {
      this.numberTotalPass += 1;
      this.disabledFirstPass = false;
      this.showPass = 0;
    }
  }
 
  private setProjectName() {
    let projectName = '';
    const email = this.user.email;
    if (email.includes('@')) {
      const emailAfterAt = email.split('@')[1];
      if (!emailDomainWhiteList.includes(emailAfterAt)) {
        if (emailAfterAt.includes('.'))
          projectName = emailAfterAt.split('.')[0];
        else if (!emailAfterAt.includes('.')) {
          projectName = emailAfterAt;
        }
      } else {
        projectName = null;
      }
    } else {
      projectName = null;
    }
    return projectName;
  }



  private loadJsonOnboardingConfig(){
    let onboardingConfig = 'assets/config/onboarding-config.json';
    let jsonSteps: any;
    this.httpClient.get(onboardingConfig).subscribe(data => {
      let jsonString = JSON.stringify(data);
      jsonString = jsonString.split('${userFullname}').join(this.userFullname);
      let jsonParse = JSON.parse(jsonString);
      if (jsonParse) {
        jsonSteps = jsonParse['steps'];
        jsonSteps.forEach(step => {
          this.steps.push(step);
        });
        this.activeStep = this.steps[0];
        this.activeQuestion = this.activeStep.questions[0];
        this.numberTotalPass += this.steps.length;
        this.arrayNumberTotalPass = Array(this.numberTotalPass);
      }
    });
  }


  private nextNumberPass(){
    this.activeNumberPass++;
    this.translateY = 'translateY('+(-(this.activeNumberPass+1)*20+20)+'px)';
  }

  private prevNumberPass(){
    this.activeNumberPass--;
    this.translateY = 'translateY('+(-(this.activeNumberPass+1)*20+20)+'px)';
  }

  // EVENTS FUNCTIONS //
  goToSetProjectName($event){
    this.projectName = $event;
    this.showPass++;
    this.nextNumberPass();
  }

  goToNextQuestion(){
    this.checkQuestions();
    // console.log('goToNextQuestion:: ', this.activeQuestionNumber,this.activeStep.questions.length );
  }


  private checkQuestions(){
    this.activeQuestionNumber = this.activeStep.questions.length;
    for (let i = 0; i < this.activeStep.questions.length; i++) {
      let action = this.activeStep.questions[i];
      if(!action.answer){
        this.activeQuestionNumber = i;
        break;
      }
    }
    this.activeQuestion = this.activeStep.questions[this.activeQuestionNumber];
    if(this.activeQuestionNumber<this.activeStep.questions.length){
      this.disabledNextButton = true;
    } else {
      this.disabledNextButton = false;
    }
  }

  goToNextStep(){
    this.activeQuestionNumber = 0;
    this.activeQuestion = this.activeStep.questions[0];
    if(this.activeStepNumber < (this.steps.length-1)){
      this.activeStepNumber++;
      this.activeStep = this.steps[this.activeStepNumber];
      //this.translateY = 'translateY('+(-(this.activeStepNumber+1)*20+20)+'px)';
      // this.stepDirectionIn = true;
      this.checkQuestions();
      this.activeQuestion = this.activeStep.questions[this.activeQuestionNumber];
      // console.log('goToNextStep: ', this.disabledNextButton, this.activeStep);
      this.nextNumberPass();
    } else {
      this.goToNextPassage();
    }
  }


  goToPrevStep() {
    if(this.activeStepNumber > 0){
      this.activeStepNumber--;
      this.activeStep = this.steps[this.activeStepNumber];
      this.activeQuestionNumber = 0;
      this.activeQuestion = this.activeStep.questions[0];
      // this.stepDirectionIn = false;
      this.activeQuestionNumber = this.activeStep.questions.length-1;
      this.disabledNextButton = false;
      this.prevNumberPass();
    } else {
      this.goToPrevPassage();
    }
  }


  


  goToPrevPassage() {
    this.showPass--;
    this.prevNumberPass();
    console.log('goToPrevPassage::: ',  this.showPass, this.welcomeMessage);
  }

  goToNextPassage() {
    this.showPass++;
    this.nextNumberPass();
    console.log('goToNextPassage::: ', this.showPass);
  }



  goBack() {
    this.location.back();
  }

}
