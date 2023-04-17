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
  // projects: Project[];
  project_name: string;
  // id_project: string;
  DISPLAY_SPINNER_SECTION = false;
  // DISPLAY_SPINNER = false;
  // previousUrl: string;
  CLOSE_BTN_IS_HIDDEN = true
  // new_project: any;
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
  stepDirectionIn: boolean = false;
  questionDirectionIn: boolean = false;

  projectName: string;
  userFullname: string;
  

  onboardingConfig: any;

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
  }


  // CUSTOM FUNCTIONS //

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
    this.projectName = this.setProjectName();
    this.translateY = 'translateY(0px)';
    this.activeStepNumber = 0;
    this.activeQuestionNumber = 0;
    this.onboardingConfig = this.loadJsonOnboardingConfig();
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
        projectName = 'prova';
      }
    } else {
      projectName = 'prova';;
    }
    return projectName;
  }

  loadJsonOnboardingConfig(){
    let onboardingConfig = 'assets/config/onboarding-config.json';
    let jsonSteps: any;
    this.httpClient.get(onboardingConfig).subscribe(data => {
      //console.log('loadJsonOnboardingConfig::: ', data);
      let jsonString = JSON.stringify(data);
      jsonString = jsonString.split('${userFullname}').join(this.userFullname);
      // jsonString = jsonString.replace('${userFullname}', this.userFullname);
      //console.log('jsonString::: ', jsonString);
      let jsonParse = JSON.parse(jsonString);
      //console.log('jsonParse::: ', jsonParse);
      if (jsonParse) {
        jsonSteps = jsonParse['steps'];
        //console.log('jsonSteps::: ', jsonSteps);
        jsonSteps.forEach(step => {
          this.steps.push(step);
          //console.log('step::: ', step);
        });
        this.activeStep = this.steps[0];
        this.activeQuestion = this.activeStep.questions[0];
        //console.log('activeQuestion::: ', this.activeQuestion);
      }
    });
  }



  // EVENTS FUNCTIONS //
  goToSetProjectName($event){
    this.projectName = $event;
    this.goToNextQuestion();
  }

  goToPrevQuestion() {
    if(this.activeQuestionNumber>0){
      this.activeQuestionNumber--;
      this.activeQuestion = this.activeStep.questions[this.activeQuestionNumber];
      this.questionDirectionIn = false;
    } else {
      this.goToPrevStep();
    }
  }

  goToNextQuestion(){
    if(this.activeStep.questions && this.activeQuestionNumber<this.activeStep.questions.length-1){
      this.activeQuestionNumber++;
      this.activeQuestion = this.activeStep.questions[this.activeQuestionNumber];
      this.questionDirectionIn = true;
    } else {
      this.goToNextStep();
    }
  }

  goToPrevStep() {
    if(this.activeStepNumber > 0){
      this.activeStepNumber--;
      this.activeStep = this.steps[this.activeStepNumber];
      this.activeQuestionNumber = this.activeStep.questions.length-1;
      this.translateY = 'translateY('+(-(this.activeStepNumber+1)*20+20)+'px)';
      this.stepDirectionIn = false;
    }
  }

  goToNextStep(){
    if(this.activeStepNumber < (this.steps.length-1)){
      this.activeStepNumber++;
      this.activeStep = this.steps[this.activeStepNumber];
      this.activeQuestionNumber = 0;
      this.translateY = 'translateY('+(-(this.activeStepNumber+1)*20+20)+'px)';
      this.stepDirectionIn = true;
    }
  }

  goBack() {
    this.location.back();
  }

}
