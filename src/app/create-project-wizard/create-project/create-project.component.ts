import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project-model';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { slideInAnimation } from '../../_animations/index';
// import brand from 'assets/brand/brand.json';
import { BrandService } from '../../services/brand.service';
import { LoggerService } from '../../services/logger/logger.service';

@Component({
  selector: 'appdashboard-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss'],
  animations: [slideInAnimation],
  // tslint:disable-next-line:use-host-property-decorator
  host: { '[@slideInAnimation]': '' }
})


export class CreateProjectComponent implements OnInit {
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
  constructor(
    private projectService: ProjectService,
    private auth: AuthService,
    private router: Router,
    public location: Location,
    public brandService: BrandService,
    private logger: LoggerService
  ) { 
    const brand = brandService.getBrand();
    this.logo_x_rocket = brand['wizard_create_project_page']['logo_x_rocket']
  }

  ngOnInit() {
    this.logger.log('[WIZARD - CREATE-PRJCT] project_name ', this.project_name)
    // this.logger.log('project_name.length', this.project_name.length)


    this.checkCurrentUrlAndHideCloseBtn();
  }

  checkCurrentUrlAndHideCloseBtn() {
    this.logger.log('[WIZARD - CREATE-PRJCT] this.router.url  ', this.router.url)

    if (this.router.url === '/create-project') {
      this.CLOSE_BTN_IS_HIDDEN = true;

    } else {
      this.CLOSE_BTN_IS_HIDDEN = false;

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

    this.projectService.createProject(this.project_name)
      .subscribe((project) => {
        this.logger.log('[WIZARD - CREATE-PRJCT] POST DATA PROJECT RESPONSE ', project);

        // WHEN THE USER SELECT A PROJECT ITS ID IS SEND IN THE PROJECT SERVICE THET PUBLISHES IT
        // THE SIDEBAR SIGNS UP FOR ITS PUBLICATION
        const newproject: Project = {
          _id: project._id,
          name: project.name,
          operatingHours: project.activeOperatingHours
        }

        // SENT THE NEW PROJECT TO THE AUTH SERVICE THAT PUBLISH
        this.auth.projectSelected(newproject)
        this.logger.log('[WIZARD - CREATE-PRJCT] CREATED PROJECT ', newproject)

        this.id_project = newproject._id

        /* !!! NO MORE USED - NOW THE ALL PROJECTS ARE SETTED IN THE STORAGE IN getProjectsAndSaveInStorage()
         * SET THE project_id IN THE LOCAL STORAGE
         * WHEN THE PAGE IS RELOADED THE SIDEBAR GET THE PROJECT ID FROM THE LOCAL STORAGE */
        // localStorage.setItem('project', JSON.stringify(newproject));

      }, (error) => {
        this.DISPLAY_SPINNER = false;
        this.logger.error('[WIZARD - CREATE-PRJCT] CREATE NEW PROJECT - POST REQUEST - ERROR ', error);

      }, () => {
        this.logger.log('[WIZARD - CREATE-PRJCT] CREATE NEW PROJECT - POST REQUEST * COMPLETE *');

        this.projectService.newProjectCreated(true)

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

  continueToConfigureScript() {
    this.router.navigate([`/project/${this.id_project}/configure-widget`]);
  }

}
