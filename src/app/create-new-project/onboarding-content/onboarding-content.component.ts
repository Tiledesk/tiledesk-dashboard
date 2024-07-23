import { Component, HostListener, OnInit, isDevMode } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from "@angular/common/http";
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
// import { Observable } from 'rxjs';
import { UrlService } from 'app/services/shared/url.service';

import { Project } from 'app/models/project-model';
import { WidgetSetUpBaseComponent } from 'app/widget_components/widget-set-up/widget-set-up-base/widget-set-up-base.component';
import { ProjectService } from 'app/services/project.service';
import { BrandService } from 'app/services/brand.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { AuthService } from 'app/core/auth.service';
import { emailDomainWhiteList, tranlatedLanguage } from 'app/utils/util';
import { FaqKbService } from 'app/services/faq-kb.service';
import { BotLocalDbService } from 'app/services/bot-local-db.service';
import { DepartmentService } from 'app/services/department.service';
import { FaqService } from 'app/services/faq.service';
import { WidgetService } from 'app/services/widget.service';
import { AppConfigService } from 'app/services/app-config.service';
import { UsersService } from 'app/services/users.service';


export enum TYPE_STEP {
  NAME_PROJECT = "nameProject",
  CUSTOM_STEP = "customStep",
  WELCOME_MESSAGE = "welcomeMessage",
  WIDGET_INSTALLATION = "widgetInstallation",
  SELECT_TEMPLATE_OR_KB = 'selectTemplateOrKb',
  TEMPLATES_INSTALLATION = "templateInstallation"

}

@Component({
  selector: 'cnp-onboarding-content',
  templateUrl: './onboarding-content.component.html',
  styleUrls: ['./onboarding-content.component.scss']
})
export class OnboardingContentComponent extends WidgetSetUpBaseComponent implements OnInit {
  previousUrl: string;
  // logo_x_rocket: string;
  DISPLAY_SPINNER_SECTION = false;
  CLOSE_BTN_IS_HIDDEN = true;
  DISPLAY_SPINNER = false;

  companyLogo: string;
  companyLogoNoText: string;
  temp_SelectedLangName: string;
  temp_SelectedLangCode: string;
  botid: string;
  browser_lang: string;

  activeQuestionNumber: number;
  activeQuestion: any;
  DISABLED_NEXT_BUTTON: boolean = true;
  DISABLED_PREV_BUTTON: boolean = true;
  welcomeMessage: string = "";
  defaultFallback: string = "";

  projects: Project[];
  newProject: any;
  projectName: string;
  projectID: string;
  user: any;
  userFullname: string;

  translateY: string;
  typeStep = TYPE_STEP;
  nameLastStep: TYPE_STEP = null;
  nameMsgStep: TYPE_STEP = null;
  arrayOfSteps: TYPE_STEP[] = [];
  activeTypeStepNumber: number = 0;
  activeCustomStepNumber: number;
  customSteps: any[] = [];
  activeStep: any;

  // DISPLAY_BOT:boolean = false;
  CREATE_BOT_ERROR: boolean = false;
  botId: string;
  CREATE_FAQ_ERROR: boolean = false;

  segmentIdentifyAttributes: any = {};
  isFirstProject: boolean = false;
  selectedTranslationCode: string;
  selectedTranslationLabel: string;
  displayLogoWithText: boolean = true;
  isMobile: boolean = true;
  updatedProject: any;
  showSpinner: boolean = false;
  public_Key: string;
  isMTT: boolean;
  USER_ROLE: string;
  hasSelectChatBotOrKb: string

  constructor(
    private auth: AuthService,
    private router: Router,
    public location: Location,
    public brandService: BrandService,
    private logger: LoggerService,
    private route: ActivatedRoute,
    public translate: TranslateService,
    private httpClient: HttpClient,
    private projectService: ProjectService,
    private faqService: FaqService,
    private faqKbService: FaqKbService,
    private botLocalDbService: BotLocalDbService,
    private departmentService: DepartmentService,
    private widgetService: WidgetService,
    public appConfigService: AppConfigService,
    private usersService: UsersService
  ) {
    super(translate);
    const brand = brandService.getBrand();

    this.companyLogo = brand['BASE_LOGO'];
    this.companyLogoNoText = brand['BASE_LOGO_NO_TEXT'];
    this.botid = this.route.snapshot.params['botid'];
  }



  // SYSTEM FUNCTIONS //
  ngOnInit() {

    // this.previousUrl = this.urlService.getPreviousUrl(); //!!! non sempre restituisce la pg di prev !!!
    // this.isFirstProject = false;
    // if(this.previousUrl.endsWith('/signup')){
    //   this.isFirstProject = true;
    // }
    // this.logger.log('previousUrl2:: ', this.previousUrl, this.isSignupPrevPage);
    //this.checkCurrentUrlAndHideCloseBtn();
    // 
    this.getCurrentTranslation();
    // this.logger.log('[WIZARD - CREATE-PRJCT] previousUrl ', this.previousUrl);
    this.initialize();
    this.onInitWindowHeight();
    this.detectMobile();
  }


  onInitWindowHeight(): any {
    this.logger.log('[ONBOARDING-CONTENT] ACTUAL WIDTH ', window.innerWidth);

    if (window.innerWidth < 452) {
      if (window && window['Tiledesk']) {
        window['Tiledesk']('hide')
      }
    }
    if (window.innerWidth < 371) {
      this.displayLogoWithText = false
    } else {
      this.displayLogoWithText = true
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.logger.log('[ONBOARDING-CONTENT] NEW WIDTH ', window.innerWidth);
    if (window.innerWidth < 452) {
      if (window && window['Tiledesk']) {
        window['Tiledesk']('hide')
      }
    }

    if (window.innerWidth < 371) {
      this.displayLogoWithText = false
    } else {
      this.displayLogoWithText = true
    }

  }

  // CUSTOM FUNCTIONS //
  private getCurrentTranslation() {
    let langDashboard = 'en';
    if (this.translate.currentLang) {
      langDashboard = this.translate.currentLang;
    }
    let jsonWidgetLangURL = 'assets/i18n/' + langDashboard + '.json';
    this.httpClient.get(jsonWidgetLangURL).subscribe(data => {
      try {
        if (data['OnboardPage']) {
          let translations = data['OnboardPage'];
          this.welcomeMessage = translations["WelcomeMessage"];
          this.defaultFallback = translations["DefaultFallback"];
        }
      } catch (err) {
        this.logger.error('error', err);
      }
    });
  }


  private setProjectName() {
    let projectName = null;
    //const email = this.userForm.value['email'];
    const email = this.user.email;
    if (email.includes('@')) {
      const emailAfterAt = email.split('@')[1];
      if (!emailDomainWhiteList.includes(emailAfterAt)) {
        if (emailAfterAt.includes('.'))
          projectName = emailAfterAt.split('.')[0]
        else if (!emailAfterAt.includes('.')) {
          projectName = emailAfterAt;
        }
      }
    }
    return projectName;
  }


  private initialize() {
    this.translateY = 'translateY(0px)';
    this.activeQuestionNumber = 0;
    // this.setFirstStep();
    this.getProjects();
  }


  private getProjects() {
    this.showSpinner = true;
    this.projectService.getProjects().subscribe((projects: any) => {
     this.logger.log('[ONBOARDING-CONTENT] projects ', projects)
     this.logger.log('[ONBOARDING-CONTENT] projects length ', projects.length)
      this.isFirstProject = true;
      if (projects) {
        this.projects = projects;
      }
      if (projects.length > 0) {
        this.isFirstProject = false; // the good one
        // this.isFirstProject = true; // for test onbording without sign up
        this.logger.log('[ONBOARDING-CONTENT] isFirstProject ', this.isFirstProject)
      }
      this.logger.log('[ONBOARDING-CONTENT] getProjects  projects:   ', projects, ' isFirstProject ', this.isFirstProject);
      this.getLoggedUser();
    }, (error) => {
      this.logger.error('[ONBOARDING-CONTENT] - GET PROJECTS ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[AONBOARDING-CONTENT] - GET PROJECTS * COMPLETE *');
      this.showSpinner = false;
    });

    // this.auth.project_bs
    //   .subscribe((project) => {
    //     this.isFirstProject = true;
    //     if (project) {
    //       this.projectID = project._id;
    //       this.projectName = project.name;
    //       this.isFirstProject = false;
    //     }
    //     this.logger.log('getCurrentProject:: ', project);
    //     this.getLoggedUser();
    //   });
  }

  getMTTValue() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;

    let parts = this.public_Key.split('-');
  

    let mtt = parts.find((part) => part.startsWith('MTT'));
    this.logger.log('[ONBOARDING-CONTENT] getMTTValue  mtt ', mtt);
    let mttParts = mtt.split(':');
    this.logger.log('[ONBOARDING-CONTENT] getMTTValue  mttParts ', mttParts);
    let mttValue = mttParts[1]
    this.logger.log('[ONBOARDING-CONTENT] getMTTValue  mttValue ', mttValue);
    if (mttValue === 'T') {
      return true
    } else if (mttValue === 'F') {
      return false
    }

  }

  private getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      if (user) {
        this.user = user;
        this.userFullname = user.displayName ? user.displayName : user.firstname;
        this.logger.log('[ONBOARDING-CONTENT] getLoggedUser:: ', user);
        // this.projectName = this.setProjectName();
        // this.logger.log('setProjectName:: ', this.projectName, this.isSignupPrevPage);
        this.logger.log('[ONBOARDING-CONTENT]  isFirstProject  ', this.isFirstProject);
        if (this.isFirstProject) {

          this.projectName = this.setProjectName();
          if (!this.projectName) {
            this.logger.log('[ONBOARDING-CONTENT] - CREATE-PRJCT] here yes ', this.projectName);
            this.arrayOfSteps.push(TYPE_STEP.NAME_PROJECT);
          }
          this.setFirstStep();

          this.logger.log('[ONBOARDING-CONTENT]  isFirstProject  ', this.isFirstProject, ' arrayOfSteps ', this.arrayOfSteps);
        } else {
          this.isMTT = this.getMTTValue()
          this.logger.log('[ONBOARDING-CONTENT]  isFirstProject  (else) ', this.isFirstProject, ' this.isMTT ', this.isMTT);
          if (this.isMTT) {
            this.arrayOfSteps.push(TYPE_STEP.NAME_PROJECT);

            this.logger.log('[ONBOARDING-CONTENT]  isFirstProject  ', this.isFirstProject, ' arrayOfSteps ', this.arrayOfSteps , ' isMTT ', this.isMTT )
          } else  if (this.isMTT === false) {
            this.logger.log('[ONBOARDING-CONTENT] isMTT  ', this.isMTT)
            this.router.navigate(['/unauthorized']);
          }
          // this.arrayOfSteps.push(TYPE_STEP.WELCOME_MESSAGE);
          // this.arrayOfSteps.push(TYPE_STEP.WIDGET_INSTALLATION);
        }

      }
    });
  }


  private setFirstStep() {
    // this.logger.log('setFirstStep:: ');
    // if(this.previousUrl.endsWith('/signup')){
    let lang = "en";
    if (this.translate.currentLang) {
      lang = this.translate.currentLang;
    }
    let onboardingConfig = 'assets/config/onboarding-config-' + lang + '.json';
    // this.logger.log('onboardingConfig:: ', onboardingConfig, lang);
    this.checkFileExists(onboardingConfig).then(result => {
      if (result === false) {
        onboardingConfig = 'assets/config/onboarding-config.json';
      }
      this.loadJsonOnboardingConfig(onboardingConfig);
    });
  }



  private loadJsonOnboardingConfig(onboardingConfig) {
    // let lang = "en";
    // if(this.translate.currentLang){
    //   lang = this.translate.currentLang;
    // }
    // let onboardingConfig = 'assets/config/onboarding-config-'+lang+'.json';
    this.logger.log('loadJsonOnboardingConfig:: ', onboardingConfig);
    let jsonSteps: any;
    this.httpClient.get(onboardingConfig).subscribe(data => {
      let jsonString = JSON.stringify(data);
      jsonString = jsonString.split('${userFullname}').join(this.userFullname);
      let jsonParse = JSON.parse(jsonString);
      if (jsonParse) {
        jsonSteps = jsonParse['steps'];
        jsonSteps.forEach(step => {
          this.customSteps.push(step);
          this.arrayOfSteps.push(TYPE_STEP.CUSTOM_STEP);
        });
      }
      if (this.customSteps.length > 0) {
        // this.arrayOfSteps.push(TYPE_STEP.CUSTOM_STEP);
        this.activeCustomStepNumber = 0;
        this.activeStep = this.customSteps[0];
        this.activeQuestion = this.customSteps[0].questions[0];
      }
      // this.arrayOfSteps.push(TYPE_STEP.WELCOME_MESSAGE);


      // this.arrayOfSteps.push(TYPE_STEP.WIDGET_INSTALLATION);

      // this.arrayOfSteps.push(TYPE_STEP.TEMPLATES_INSTALLATION);
      this.arrayOfSteps.push(TYPE_STEP.SELECT_TEMPLATE_OR_KB);
      this.arrayOfSteps.push(TYPE_STEP.TEMPLATES_INSTALLATION);
      this.logger.log('[ONBOARDING-CONTENT] arrayOfSteps ', this.arrayOfSteps)

    });
  }

  private checkFileExists(fileName: string): Promise<boolean> {
    const url = `${fileName}`;
    return this.httpClient.get(url, { responseType: 'json' })
      .toPromise()
      .then(() => true)
      .catch(() => false);
  }

  private nextNumberStep() {

    this.activeTypeStepNumber++;
    // this.logger.log('[ONBOARDING-CONTENT] nextNumberStep activeTypeStepNumber', this.activeTypeStepNumber)
    this.translateY = 'translateY(' + (-(this.activeTypeStepNumber + 1) * 20 + 20) + 'px)';
  }

  private prevNumberStep() {
    this.activeTypeStepNumber--;
    this.translateY = 'translateY(' + (-(this.activeTypeStepNumber + 1) * 20 + 20) + 'px)';
  }

  private checkQuestions() {
    this.activeStep = this.customSteps[this.activeCustomStepNumber];
    this.activeQuestionNumber = this.activeStep.questions.length;
    for (let i = 0; i < this.activeStep.questions.length; i++) {
      let action = this.activeStep.questions[i];
      if (!action.answer) {
        this.activeQuestionNumber = i;
        break;
      }
    }
    this.activeQuestion = this.activeStep.questions[this.activeQuestionNumber];
    if (this.activeQuestionNumber < this.activeStep.questions.length) {
      this.DISABLED_NEXT_BUTTON = true;
    } else {
      this.DISABLED_NEXT_BUTTON = false;
    }
  }


  private checkPrevButton() {
    // || (this.activeTypeStepNumber == 1 && this.arrayOfSteps[0] === TYPE_STEP.NAME_PROJECT)
    if (this.activeTypeStepNumber == 0) {
      this.DISABLED_PREV_BUTTON = true;
    } else {
      this.DISABLED_PREV_BUTTON = false
    }
  }



  // ---------- EVENTS FUNCTIONS -------------- //
  goToSetProjectName($event) {
    this.projectName = $event;
    this.nextNumberStep();
    this.logger.log('[ONBOARDING-CONTENT] goToSetProjectName ', this.projectName)
    this.createNewProject('goToSetProjectName output of cnp-project-name');
  }

  goToNextQuestion($event) {
    this.segmentIdentifyAttributes = $event;
    // this.logger.log('[ONBOARDING-CONTENT] goToNextQuestion::: ', $event, this.segmentIdentifyAttributes)
    this.checkQuestions();
  }

  goToNextCustomStep() {
    if (this.activeCustomStepNumber < (this.customSteps.length - 1)) {
      this.activeCustomStepNumber++;
      this.activeStep = this.customSteps[this.activeCustomStepNumber];
      this.checkQuestions();
      this.activeQuestionNumber = 0;
      this.activeQuestion = this.activeStep.questions[0];
      // this.logger.log('[ONBOARDING-CONTENT]  goToNextCustomStep activeTypeStepNumber: ', this.activeTypeStepNumber)
      this.goToNextStep();
    } else {
      // this.logger.log('[ONBOARDING-CONTENT]  goToNextCustomStep activeTypeStepNumber: ', this.activeTypeStepNumber)
      this.goToNextStep();
    }
  }

  goToPrevCustomStep() {
    if (this.activeCustomStepNumber > 0) {
      this.activeCustomStepNumber--;
      this.activeStep = this.customSteps[this.activeCustomStepNumber];
      this.activeQuestionNumber = this.activeStep.questions.length - 1;
      this.activeQuestion = this.activeStep.questions[this.activeQuestionNumber];
      this.DISABLED_NEXT_BUTTON = false;
      this.goToPrevStep();
    } else {
      this.goToPrevStep();
    }
  }

  goToPrevStep() {
    this.prevNumberStep();
    this.checkPrevButton();
  }

  goToNextStep() {

    // this.DISPLAY_SPINNER_SECTION = false;  
    // this.logger.log('[ONBOARDING-CONTENT] activeTypeStepNumber: ', this.activeTypeStepNumber)

    if (this.segmentIdentifyAttributes && this.segmentIdentifyAttributes["solution_channel"] === "whatsapp_fb_messenger") {
      this.logger.log('[ONBOARDING-CONTENT] this.arrayOfSteps[this.activeTypeStepNumber] ', this.arrayOfSteps[this.activeTypeStepNumber])
      // if(this.arrayOfSteps[this.activeTypeStepNumber] === TYPE_STEP.WIDGET_INSTALLATION) {

      // this.logger.log('[ONBOARDING-CONTENT] goToNextStep (1): ', this.arrayOfSteps)

      this.arrayOfSteps = this.arrayOfSteps.filter(item => item !== TYPE_STEP.WIDGET_INSTALLATION);
      this.logger.log('[ONBOARDING-CONTENT] goToNextStep (2): ', this.arrayOfSteps)

      // this.arrayOfSteps.splice((this.arrayOfSteps.length - 2), 1);
      // } 
      // if(this.arrayOfSteps[this.activeTypeStepNumber] === TYPE_STEP.TEMPLATES_INSTALLATION) {
    }
   
    this.nextNumberStep();
    this.checkPrevButton();
    // else {
    //   this.nextNumberStep();
    //   this.checkPrevButton();
    // }
  }


  goToSaveWelcomeMessage($event) {
    try {
      this.welcomeMessage = $event.msg;
    } catch (error) {
      this.logger.error('[WIZARD - error: ', error);
    }
    // this.logger.log('segmentAttributes:: ',this.segmentAttributes);
    this.goToNextStep();
  }

  createProjectFromTemplates() {
    this.logger.log('[ONBOARDING-CONTENT] createProjectFromTemplates arrayOfSteps: ', this.arrayOfSteps)
    this.logger.log('[ONBOARDING-CONTENT] createProjectFromTemplates this.arrayOfSteps.includes(nameProject) ', this.arrayOfSteps.includes(TYPE_STEP.NAME_PROJECT))
    if (!this.arrayOfSteps.includes(TYPE_STEP.NAME_PROJECT)) {
      this.createNewProject('createProjectFromTemplates')
    }
  }

  userSelection(event) {
    this.logger.log('[ONBOARDING-CONTENT] userSelection event: ', event)
   this.hasSelectChatBotOrKb = event
  }

  goToTemplatesInstallation($event) {
    this.goToNextStep();
  }

  goToSaveProjectAndCreateBot($event) {
    this.goToNextStep()
  }

  goBack() {
    this.location.back();
  }


  /** 
   * SERVICES  
   * create project 
   * */
  private createNewProject(calledBy) {
    this.logger.log('[ONBOARDING-CONTENT] CREATE NEW PROJECT - calledBy ', calledBy);
    this.DISPLAY_SPINNER_SECTION = true;
    this.DISPLAY_SPINNER = true;
    this.projectService.createProject(this.projectName, 'onboarding-content').subscribe((project: Project) => {
      this.logger.log('[ONBOARDING-CONTENT] CREATE NEW PROJECT - RES ', project);
      if (project) {
        this.logger.log('[ONBOARDING-CONTENT] CREATE NEW PROJECT - USER_ROLE ', this.USER_ROLE);
        this.logger.log('[ONBOARDING-CONTENT] CREATE NEW PROJECT - RES ', project);
        project['role'] = 'owner';
        this.auth.projectSelected(project, 'onboarding-content')
        localStorage.setItem(project._id, JSON.stringify(project));
        this.newProject = project;

        
        // WHEN THE USER SELECT A PROJECT ITS ID IS SEND IN THE PROJECT SERVICE THET PUBLISHES IT
        // THE SIDEBAR SIGNS UP FOR ITS PUBLICATION
        // const newproject: Project = {
        //   _id: project['_id'],
        //   name: project['name'],
        //   operatingHours: project['activeOperatingHours'],
        //   profile_type: project['profile'].type,
        //   profile_name: project['profile'].name,
        //   trial_expired: project['trialExpired']
        // }
        // SENT THE NEW PROJECT TO THE AUTH SERVICE THAT PUBLISH
        // this.auth.projectSelected(project, 'onboarding-content')
        // this.logger.log('[ONBOARDING-D] NEW CREATED PROJECT ', newproject)
        // this.projectID = newproject._id
      }
      /* 
        * !!! NO MORE USED - NOW THE ALL PROJECTS ARE SETTED IN THE STORAGE IN getProjectsAndSaveInStorage()
        * SET THE project_id IN THE LOCAL STORAGE
        * WHEN THE PAGE IS RELOADED THE SIDEBAR GET THE PROJECT ID FROM THE LOCAL STORAGE 
      */
    }, (error) => {
      this.DISPLAY_SPINNER = false;
      this.logger.error('[ONBOARDING-CONTENT] CREATE NEW PROJECT - ERROR ', error);
    }, () => {
      this.logger.log('[ONBOARDING-CONTENT] CREATE NEW PROJECT * COMPLETE *');
      this.projectService.newProjectCreated(true);
      const trialStarDate = moment(new Date(this.newProject.createdAt)).format("YYYY-MM-DD hh:mm:ss")
      const trialEndDate = moment(new Date(this.newProject.createdAt)).add(14, 'days').format("YYYY-MM-DD hh:mm:ss")
      this.trackNewProjectCreated(trialStarDate, trialEndDate)
      
      this.projectService.newProjectCreated(true);
      this.getProjectsAndSaveLastProject(this.newProject._id)
      
      // this.getProjectsAndSaveInStorage();
      this.callback('createNewProject');
    });
  }

  getProjectsAndSaveLastProject(project_id) {
    this.projectService.getProjects().subscribe((projects: any) => {
      this.logger.log('[ONBOARDING-CONTENT] getProjects projects ', projects)
      if (projects) {
        const populateProjectUser = projects.find(prj => prj.id_project.id === project_id);
        this.logger.log('[ONBOARDING-CONTENT] currentProjectUser ', populateProjectUser)
        localStorage.setItem('last_project', JSON.stringify(populateProjectUser))
      }
    });
  }

  /** 
   *  GET PROJECTS AND SAVE IN THE STORAGE: PROJECT ID - PROJECT NAME - USE ROLE   
   * */
  // getProjectsAndSaveInStorage() {

  //   this.projectService.getProjects().subscribe((projects: any) => {
  //     // this.logger.log('[WIZARD - CREATE-PRJCT] !!! getProjectsAndSaveInStorage PROJECTS ', projects);
  //     this.logger.log('[ONBOARDING-CONTENT] !!! getProjectsAndSaveInStorage PROJECTS ', projects);
  //     if (projects) {
  //       this.projects = projects;
  //       // SET THE IDs and the NAMES OF THE PROJECT IN THE LOCAL STORAGE.
  //       // WHEN IS REFRESHED A PAGE THE AUTSERVICE USE THE NAVIGATION PROJECT ID TO GET FROM STORAGE THE NAME OF THE PROJECT
  //       // AND THEN PUBLISH PROJECT ID AND PROJECT NAME
  //       this.projects.forEach(project => {
  //         // this.logger.log('[WIZARD - CREATE-PRJCT] !!! getProjectsAndSaveInStorage SET PROJECT IN STORAGE')
  //         if (project.id_project) {
  //           const prjct: Project = {
  //             _id: project.id_project._id,
  //             name: project.id_project.name,
  //             role: project.role,
  //             operatingHours: project.id_project.activeOperatingHours
  //           }
  //           localStorage.setItem(project.id_project._id, JSON.stringify(prjct));
  //         }
  //       });
  //     } else {

  //     }
  //   }, error => {
  //     this.logger.error('[ONBOARDING-CONTENT] getProjectsAndSaveInStorage - ERROR ', error)
  //   }, () => {
  //     this.logger.log('[ONBOARDING-CONTENT] getProjectsAndSaveInStorage - COMPLETE')
  //   });
  // }


  trackNewProjectCreated(trialStarDate, trialEndDate) {
    if (!isDevMode()) {
      if (window['analytics']) {
        try {
          window['analytics'].page("Wizard, Create project", {
          });
        } catch (err) {
          this.logger.error('Wizard Create project page error', err);
        }

        let userFullname = ''
        if (this.user.firstname && this.user.lastname) {
          userFullname = this.user.firstname + ' ' + this.user.lastname
        } else if (this.user.firstname && !this.user.lastname) {
          userFullname = this.user.firstname
        }

        try {
          window['analytics'].identify(this.user._id, {
            name: userFullname,
            email: this.user.email,
            logins: 5,
            plan: "Premium (trial)"
          });
        } catch (err) {
          this.logger.error('Wizard Create project identify error', err);
        }
        try {
          window['analytics'].track('Trial Started', {
            "userId": this.user._id,
            "trial_start_date": trialStarDate,
            "trial_end_date": trialEndDate,
            "trial_plan_name": "Premium (trial)",
            "context": {
              "groupId": this.newProject._id
            }
          });
        } catch (err) {
          this.logger.error('Wizard Create track Trial Started event error', err);
        }
        try {
          window['analytics'].group(this.newProject._id, {
            name: this.newProject.name,
            plan: "Premium (trial)",
          });
        } catch (err) {
          this.logger.error('Wizard Create project group error', err);
        }
      }
    }
  }


  // -----------------  FUNCTION CALLBACK   ------------------------ //
  callback(step: string, variable?: any) {
    // this.logger.log('[ONBOARDING-CONTENT] callback HRE YESSSSS step ', step)
    this.logger.log('[ONBOARDING-CONTENT] callback: ', this.arrayOfSteps)
    if (step === 'createNewProject') {

      //   this.createBot();
      // }
      // else if(step === 'createBot'){
      //   this.hookBotToDept(variable);
      // }
      // else if(step === 'hookBotToDept'){
      //   this.createDefaultFaqOnBot();
      // }
      // else if(step === 'uploadFaqFromCSV'){
      //this.goToNextStep();
      this.DISPLAY_SPINNER_SECTION = false;
      this.DISPLAY_SPINNER = false;

      this.addWidgetDefaultLanguage()



      // this.segmentAttributes["projectId"] = this.projectID;
      // this.segmentAttributes["projectName"] = this.projectName;
      // this.segmentAttributes["userId"] = this.user._id;
      // this.segmentAttributes["username"] = this.user.firstname + ' ' + this.user.lastname;
      // this.segmentAttributes["botId"] = this.botId;

      let segmentPageName = "Wizard, Onboarding";
      let segmentTrackName = "Onboarding";
      var segmentTrackAttr = {};
      segmentTrackAttr["projectId"] = this.projectID;
      segmentTrackAttr["projectName"] = this.projectName;
      segmentTrackAttr["userId"] = this.user._id;
      segmentTrackAttr["username"] = this.user.firstname + ' ' + this.user.lastname;
      segmentTrackAttr["botId"] = this.botId;
      // let segmentTrackAttr = this.segmentAttributes;
      this.segment(segmentPageName, segmentTrackName, segmentTrackAttr, this.segmentIdentifyAttributes);

      this.logger.log('[ONBOARDING-CONTENT]  segmentIdentifyAttributes ', this.segmentIdentifyAttributes)
      this.saveUserPreferences(this.segmentIdentifyAttributes)
      // this.DISPLAY_SPINNER_SECTION = false;
      // this.DISPLAY_BOT = true;

    }
  }
  // -----------------  FUNCTION CALLBACK   ------------------------ //

  // for new home
  saveUserPreferences(segmentIdentifyAttributes) {
    this.logger.log('[ONBOARDING-CONTENT] saveUserPreferences arrayOfSteps: ', this.arrayOfSteps)
    this.projectService.updateProjectWithUserPreferences(segmentIdentifyAttributes)
      .subscribe((res: any) => {

        this.logger.log('[ONBOARDING-D] - UPDATE PRJCT WITH USER PREFERENCES RES ', res);
        this.updatedProject = res

      }, error => {
        this.logger.error('[ONBOARDING-D] - UPDATE PRJCT WITH USER PREFERENCES - ERROR ', error)
      }, () => {
        this.logger.log('[ONBOARDING-D] - UPDATE PRJCT WITH USER PREFERENCES * COMPLETE *')
        // this.goToExitOnboarding();
        // this.goToOnbordingTemplates()
        if (this.arrayOfSteps.length === 1) {
          this.logger.log('[ONBOARDING-D] - this.arrayOfSteps ', this.arrayOfSteps);
          this.goToHome()
        }

      });
  }

  goToHome() {
    this.router.navigate(['project/' + this.newProject.id + '/home'])
  }

  goToOnbordingTemplates() {
    this.router.navigate(['project/' + this.newProject.id + '/onboarding-templates'])

  }

  detectMobile() {
    // const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    // if (isMobile) {
    //   /* your code here */
    // }
    this.isMobile = /Android|iPhone/i.test(window.navigator.userAgent);
    this.logger.log('[ONBOARDING-CONTENT] - IS MOBILE ', this.isMobile);
  }


  goToExitOnboarding() {
    if (this.isMobile === false) {
      this.router.navigate(['project/' + this.newProject.id + '/home'])
    } else {
      this.router.navigate(['project/' + this.newProject.id + '/desktop-access'])
    }
  }

  addWidgetDefaultLanguage() {
    this.browser_lang = this.translate.getBrowserLang();

    if (tranlatedLanguage.includes(this.browser_lang)) {
      const langName = this.getLanguageNameFromCode(this.browser_lang)
      // this.logger.log('[WIZARD - CREATE-PRJCT] - langName ', langName)

      this.temp_SelectedLangName = langName;
      this.temp_SelectedLangCode = this.browser_lang
    } else {

      this.temp_SelectedLangName = 'English';
      this.temp_SelectedLangCode = 'en'
    }

    this.addNewLanguage(this.temp_SelectedLangCode, this.temp_SelectedLangName)

  }


  addNewLanguage(langCode, langName) {
    this.selectedTranslationCode = langCode;
    this.selectedTranslationLabel = langName;
    this.logger.log('[ONBOARDING-D] ADD-NEW-LANG selectedTranslationCode', this.selectedTranslationCode);
    this.logger.log('[ONBOARDING-D] ADD-NEW-LANG selectedTranslationLabel', this.selectedTranslationLabel);

    this.widgetService.cloneLabel(this.temp_SelectedLangCode.toUpperCase())
      .subscribe((res: any) => {
        // this.logger.log('Multilanguage - addNewLanguage - CLONE LABEL RES ', res);
        this.logger.log('[ONBOARDING-D] - ADD-NEW-LANG (clone-label) RES ', res.data);

      }, error => {
        this.logger.error('[ONBOARDING-D] ADD-NEW-LANG (clone-label) - ERROR ', error)
      }, () => {
        this.logger.log('[ONBOARDING-D] ADD-NEW-LANG (clone-label) * COMPLETE *')
      });

    // // ADD THE NEW LANGUAGE TO BOTTOM NAV
    const newLang = { code: this.temp_SelectedLangCode, name: this.temp_SelectedLangName };
    this.logger.log('[ONBOARDING-D] Multilanguage saveNewLanguage newLang objct ', newLang);

    this.availableTranslations.push(newLang)
    this.logger.log('[ONBOARDING-D] Multilanguage saveNewLanguage availableTranslations ', this.availableTranslations)
  }



  segment(pageName, trackName, trackAttr, segmentIdentifyAttributes) {
    // this.logger.log('segment::: ', segmentIdentifyAttributes);

    segmentIdentifyAttributes['name'] = this.user.firstname + ' ' + this.user.lastname;
    segmentIdentifyAttributes['email'] = this.user.email;
    segmentIdentifyAttributes['logins'] = 5;
    if (!isDevMode()) {
      try {
        window['analytics'].page(pageName, {
        });
      } catch (err) {
        this.logger.error(pageName + ' error', err);
      }
      try {
        window['analytics'].identify(this.user._id,
          segmentIdentifyAttributes
          // {
          //   name: this.user.firstname + ' ' + this.user.lastname,
          //   email: this.user.email,
          //   logins: 5,
          //   segmentIdentifyAttributes
          // }

        );
      } catch (err) {
        this.logger.error(pageName + ' identify error', err);
      }
      try {
        window['analytics'].track(trackName, trackAttr);
      } catch (err) {
        this.logger.error(pageName + ' track error', err);
      }
    }
  }

  // ----------------- 1 : CREATE A BOT ------------------------ // 
  createBot() {
    // this.DISPLAY_BOT = true;
    this.DISPLAY_SPINNER_SECTION = true;
    let faqKbName = this.projectName;
    let faqKbUrl = '';
    let botType = 'tilebot';
    let bot_description = '';
    let language = this.translate.currentLang;
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
        // this.logger.log('[BOT-CREATE] CREATE FAQKB - POST REQUEST * COMPLETE *');
      });
  }

  // ----------------- 2 : GET DEFAULT DEPARTMENT OF THE PROJECT  ------------------------ // 
  getDeptsByProjectId() {
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
      // this.logger.log('[BOT-CREATE --->  DEPTS RES - COMPLETE')
    });
  }


  // ----------------- 3 : ASSIGN BOT TO THE DEFAULT DEPARTMENT  ------------------------ //
  hookBotToDept(departmentId) {
    this.departmentService.updateExistingDeptWithSelectedBot(departmentId, this.botId).subscribe((res) => {
      // this.logger.log('[TILEBOT] - UPDATE EXISTING DEPT WITH SELECED BOT - RES ', res);
      this.callback('hookBotToDept', res);
    }, (error) => {
      this.logger.error('[TILEBOT] - UPDATE EXISTING DEPT WITH SELECED BOT - ERROR ', error);
      this.DISPLAY_SPINNER = false;
      this.CREATE_BOT_ERROR = true;
    }, () => {
      // this.logger.log('[TILEBOT] - UPDATE EXISTING DEPT WITH SELECED BOT * COMPLETE *');
    });
  }


  // ----------------- 4 : ADD START AND DEFAULTFALLBACK TO FAQ    ------------------------ //
  createDefaultFaqOnBot() {
    let answer = this.welcomeMessage;
    let intents = ['start', 'defaultFallback'];
    let questions = ['\\start', 'defaultFallback'];
    let answers = [answer, this.defaultFallback];
    this.uploadFaqFromCSV(questions, answers, intents);
  }

  // ----------------- 5 : ADD FAQ TO CHATBOT VIA CSV UPLOAD   ------------------------ //
  uploadFaqFromCSV(questions, answers, intents) {
    let csvColumnsDelimiter = ';'
    var csv = '';
    let buttons = '';
    for (let i = 0; i < questions.length; i++) {
      let domanda = '"' + questions[i] + '";';
      let risposta = '"' + answers[i] + '";';
      let intent = '"' + intents[i] + '";';
      csv += domanda + risposta + ';' + intent + 'false' + '\r\n';
      buttons += "* " + questions[i] + "\n";
    }
    var myBlob = new Blob([csv], { type: "text/csv" });
    const formData: FormData = new FormData();
    formData.set('id_faq_kb', this.botId);
    formData.set('delimiter', csvColumnsDelimiter);
    formData.append('uploadFile', myBlob, 'csvFile');
    //formData.append('uploadFile', csvContent, 'nomeFile');
    //this.logger.log('FORM DATA ', formData)
    this.faqService.uploadFaqCsv(formData)
      .subscribe(data => {
        // this.logger.log('uploadFaqCsv()::: ', data);
        // this.logger.log('[TILEBOT] UPLOAD CSV DATA ', data);
        if (data['success'] === true) {
          // this.callback('uploadFaqCsv');
          this.callback('uploadFaqFromCSV');
        } else if (data['success'] === false) {
          this.DISPLAY_SPINNER = false;
          this.CREATE_FAQ_ERROR = true;
        }
      }, (error) => {
        this.logger.error('[TILEBOT] UPLOAD CSV - ERROR ', error);
        this.DISPLAY_SPINNER = false;
        this.CREATE_FAQ_ERROR = true;
      }, () => {
        // this.logger.log('[TILEBOT] UPLOAD CSV * COMPLETE *');
        // setTimeout(() => {
        //   this.DISPLAY_SPINNER_SECTION = false;
        //   this.DISPLAY_SPINNER = false;
        // }, 2000);
      });
  }
}
