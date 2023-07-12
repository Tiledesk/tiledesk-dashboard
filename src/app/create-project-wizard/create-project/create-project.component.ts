import { Component, isDevMode, OnInit } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project-model';
import { AuthService } from '../../core/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
// import { slideInAnimation } from '../../_animations/index';
// import brand from 'assets/brand/brand.json';
import { BrandService } from '../../services/brand.service';
import { LoggerService } from '../../services/logger/logger.service';
import moment from 'moment';
import { tranlatedLanguage } from 'app/utils/util';
import { TranslateService } from '@ngx-translate/core';
import { WidgetSetUpBaseComponent } from 'app/widget_components/widget-set-up/widget-set-up-base/widget-set-up-base.component';

@Component({
  selector: 'appdashboard-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss'],
  // animations: [slideInAnimation],
  // host: { '[@slideInAnimation]': '' }
})


export class CreateProjectComponent extends WidgetSetUpBaseComponent implements OnInit {
  // company_logo_in_spinner = brand.wizard_create_project_page.company_logo_in_spinner; // no more used - removed from brand
  // logo_x_rocket = brand.wizard_create_project_page.logo_x_rocket
  logo_x_rocket: string;
  projects: Project[];
  project_name: string;
  id_project: string;
  DISPLAY_SPINNER_SECTION = false;
  DISPLAY_SPINNER = false;
  previousUrl: string;
  CLOSE_BTN_IS_HIDDEN = true
  new_project: any;
  user: any;
  companyLogoBlack_Url: string;
  CREATE_PRJCT_FOR_TEMPLATE_INSTALLATION: boolean = false;

  temp_SelectedLangName: string;
  temp_SelectedLangCode: string;
  botid: string;
  browser_lang: string;

  constructor(
    private projectService: ProjectService,
    private auth: AuthService,
    private router: Router,
    public location: Location,
    public brandService: BrandService,
    private logger: LoggerService,
    private route: ActivatedRoute,
    public translate: TranslateService,
  ) {
    super(translate);
    const brand = brandService.getBrand();
    this.logo_x_rocket = brand['wizard_create_project_page']['logo_x_rocket'];
    this.companyLogoBlack_Url = brand['company_logo_black__url'];
    this.botid = this.route.snapshot.params['botid'];
  }

  ngOnInit() {
    this.logger.log('[WIZARD - CREATE-PRJCT] project_name ', this.project_name)
    // this.logger.log('project_name.length', this.project_name.length)
    this.checkCurrentUrlAndHideCloseBtn();
    this.getLoggedUser();
  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      // console.log('[WIZARD - CREATE-PRJCT] - USER ', user)
      if (user) {
        this.user = user;
      }
    });
  }

  checkCurrentUrlAndHideCloseBtn() {
    // console.log('[WIZARD - CREATE-PRJCT] this.router.url  ', this.router.url)
    if (this.router.url.startsWith('/create-project-itw/')) {
      
      this.CREATE_PRJCT_FOR_TEMPLATE_INSTALLATION = true
      // console.log('[WIZARD - CREATE-PRJCT] CREATE_PRJCT_FOR_TEMPLATE_INSTALLATION ', this.CREATE_PRJCT_FOR_TEMPLATE_INSTALLATION)
      this.browser_lang = this.translate.getBrowserLang();
      
      if (tranlatedLanguage.includes(this.browser_lang)) {
        const langName = this.getLanguageNameFromCode(this.browser_lang)
        // console.log('[WIZARD - CREATE-PRJCT] - langName ', langName)
       
        this.temp_SelectedLangName = langName;
        this.temp_SelectedLangCode = this.browser_lang
      } else {
        // this.selectedTranslationLabel = 'en'
        // ENGLISH ARE USED AS DEFAULT IF THE USER DOESN'T SELECT ANY OTHER ONE LANGUAGE
        this.temp_SelectedLangName = 'English';
        this.temp_SelectedLangCode = 'en'
      }

    }  else if (this.router.url === '/create-project') {
      this.CLOSE_BTN_IS_HIDDEN = true;
      this.CREATE_PRJCT_FOR_TEMPLATE_INSTALLATION = false;
      // console.log('[WIZARD - CREATE-PRJCT] CREATE_PRJCT_FOR_TEMPLATE_INSTALLATION ', this.CREATE_PRJCT_FOR_TEMPLATE_INSTALLATION)
    } else if (this.router.url === '/create-new-project') {
      this.CLOSE_BTN_IS_HIDDEN = false;
      this.CREATE_PRJCT_FOR_TEMPLATE_INSTALLATION = false
      // console.log('[WIZARD - CREATE-PRJCT] CREATE_PRJCT_FOR_TEMPLATE_INSTALLATION ', this.CREATE_PRJCT_FOR_TEMPLATE_INSTALLATION)
    }
  }

  goBack() {
    this.location.back();
  }


  /**
   *  to test the wizard  without crete a project
   */
  // createNewProject() {
  //   this.DISPLAY_SPINNER_SECTION = true;
  //   this.DISPLAY_SPINNER = true;
  //   setTimeout(() => {
  //     this.DISPLAY_SPINNER = false;
  //   }, 2000);
  // }
  createNewProject() {
    this.DISPLAY_SPINNER_SECTION = true;
    this.DISPLAY_SPINNER = true;
    this.logger.log('[WIZARD - CREATE-PRJCT] CREATE NEW PROJECT - PROJECT-NAME DIGIT BY USER ', this.project_name);

    this.projectService.createProject(this.project_name, 'create-project')
      .subscribe((project) => {
        this.logger.log('[WIZARD - CREATE-PRJCT] POST DATA PROJECT RESPONSE ', project);
        if (project) {
          this.new_project = project
          // WHEN THE USER SELECT A PROJECT ITS ID IS SEND IN THE PROJECT SERVICE THET PUBLISHES IT
          // THE SIDEBAR SIGNS UP FOR ITS PUBLICATION
          const newproject: Project = {
            _id: project['_id'],
            name: project['name'],
            operatingHours: project['activeOperatingHours'],
            profile_type: project['profile'].type,
            profile_name: project['profile'].name,
            trial_expired: project['trialExpired']
          }

          // SENT THE NEW PROJECT TO THE AUTH SERVICE THAT PUBLISH
          this.auth.projectSelected(newproject)
          this.logger.log('[WIZARD - CREATE-PRJCT] CREATED PROJECT ', newproject)

          this.id_project = newproject._id

        }

        /* !!! NO MORE USED - NOW THE ALL PROJECTS ARE SETTED IN THE STORAGE IN getProjectsAndSaveInStorage()
         * SET THE project_id IN THE LOCAL STORAGE
         * WHEN THE PAGE IS RELOADED THE SIDEBAR GET THE PROJECT ID FROM THE LOCAL STORAGE */
        // localStorage.setItem('project', JSON.stringify(newproject));

      }, (error) => {
        this.DISPLAY_SPINNER = false;
        this.logger.error('[WIZARD - CREATE-PRJCT] CREATE NEW PROJECT - POST REQUEST - ERROR ', error);

      }, () => {
        this.logger.log('[WIZARD - CREATE-PRJCT] CREATE NEW PROJECT - POST REQUEST * COMPLETE *');
        this.projectService.newProjectCreated(true);

        const trialStarDate = moment(new Date(this.new_project.createdAt)).format("YYYY-MM-DD hh:mm:ss")
        // console.log('[WIZARD - CREATE-PRJCT] POST DATA PROJECT trialStarDate ', trialStarDate);
        const trialEndDate = moment(new Date(this.new_project.createdAt)).add(14, 'days').format("YYYY-MM-DD hh:mm:ss")
        // console.log('[WIZARD - CREATE-PRJCT] POST DATA PROJECT trialEndDate', trialEndDate)

        if (!isDevMode()) {
          if (window['analytics']) {
            try {
              window['analytics'].page("Wizard, Create project", {

              });
            } catch (err) {
              this.logger.error('Wizard Create project page error', err);
            }

            let userFullname = ''
            if (this.user.firstname && this.user.lastname)  {
              userFullname = this.user.firstname + ' ' + this.user.lastname
            } else if (this.user.firstname && !this.user.lastname) {
              userFullname = this.user.firstname
            }


            try {
              window['analytics'].identify(this.user._id, {
                name: userFullname,
                email: this.user.email,
                logins: 5,
                plan: "Scale (trial)"
              });
            } catch (err) {
              this.logger.error('Wizard Create project identify error', err);
            }

            try {
              window['analytics'].track('Trial Started', {
                "userId": this.user._id,
                "trial_start_date": trialStarDate,
                "trial_end_date": trialEndDate,
                "trial_plan_name": "Scale (trial)",
                "context": {
                  "groupId": this.new_project._id
                }
              });
            } catch (err) {
              this.logger.error('Wizard Create track Trial Started event error', err);
            }

            try {
              window['analytics'].group(this.new_project._id, {
                name: this.new_project.name,
                plan: "Scale (trial)",
              });
            } catch (err) {
              this.logger.error('Wizard Create project group error', err);
            }
          }
        }

        setTimeout(() => {
          this.DISPLAY_SPINNER = false;
        }, 2000);

        // 'getProjectsAndSaveInStorage()' was called only on the onInit lifehook, now recalling also after the creation 
        // of the new project resolve the bug  'the auth service not find the project in the storage'
        this.getProjectsAndSaveInStorage();

      });
  }



  /**
   * GET PROJECTS AND SAVE IN THE STORAGE: PROJECT ID - PROJECT NAME - USE ROLE   */
  getProjectsAndSaveInStorage() {
    this.projectService.getProjects().subscribe((projects: any) => {
      this.logger.log('[WIZARD - CREATE-PRJCT] !!! getProjectsAndSaveInStorage PROJECTS ', projects);

      if (projects) {
        this.projects = projects;

        // SET THE IDs and the NAMES OF THE PROJECT IN THE LOCAL STORAGE.
        // WHEN IS REFRESHED A PAGE THE AUTSERVICE USE THE NAVIGATION PROJECT ID TO GET FROM STORAGE THE NAME OF THE PROJECT
        // AND THEN PUBLISH PROJECT ID AND PROJECT NAME
        this.projects.forEach(project => {
          this.logger.log('[WIZARD - CREATE-PRJCT] !!! getProjectsAndSaveInStorage SET PROJECT IN STORAGE')
          if (project.id_project) {
            const prjct: Project = {
              _id: project.id_project._id,
              name: project.id_project.name,
              role: project.role,
              operatingHours: project.id_project.activeOperatingHours
            }

            localStorage.setItem(project.id_project._id, JSON.stringify(prjct));
          }
        });
      }
    }, error => {
      this.logger.error('[WIZARD - CREATE-PRJCT] getProjectsAndSaveInStorage - ERROR ', error)
    }, () => {
      this.logger.log('[WIZARD - CREATE-PRJCT] getProjectsAndSaveInStorage - COMPLETE')
    });
  }

  continueToNextStep() {
    if (this.CREATE_PRJCT_FOR_TEMPLATE_INSTALLATION === false) {
      // this.goToWidgetOnBoading()
      this.goToConfigureWidget()
      this.logger.log('[WIZARD - CREATE-PRJCT] CREATE_PRJCT_FOR_TEMPLATE_INSTALLATION',  this.CREATE_PRJCT_FOR_TEMPLATE_INSTALLATION, ' - goToConfigureWidget') 
    } else {
      this.goToInstallTemplate()
      this.logger.log('[WIZARD - CREATE-PRJCT] CREATE_PRJCT_FOR_TEMPLATE_INSTALLATION',  this.CREATE_PRJCT_FOR_TEMPLATE_INSTALLATION, ' - goToInstallTemplate') 
    }
  }

  goToConfigureWidget() {
    this.router.navigate([`/project/${this.id_project}/configure-widget`]);
  }

  goToWidgetOnBoading(){
    this.router.navigate([`/project/${this.id_project}/onboarding-widget`]);
  }

  goToInstallTemplate() {
    this.router.navigate([`install-template-np/${this.botid}/${this.id_project}` + '/' + this.temp_SelectedLangCode + '/' + this.temp_SelectedLangName]);
  }

}
