import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { Project } from '../models/project-model';
import { AuthService } from '../core/auth.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { slideInAnimation } from '../_animations/index';
import brand from 'assets/brand/brand.json';

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
  logo_x_rocket = brand.wizard_create_project_page.logo_x_rocket

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
    public location: Location
  ) { }

  ngOnInit() {
    console.log('CreateProjectComponent project_name ', this.project_name)
    // console.log('project_name.length', this.project_name.length)


    this.checkCurrentUrlAndHideCloseBtn();
  }

  checkCurrentUrlAndHideCloseBtn() {
    console.log('CreateProjectComponent this.router.url  ', this.router.url)

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
    console.log('CreateProjectComponent CREATE NEW PROJECT - PROJECT-NAME DIGIT BY USER ', this.project_name);

    this.projectService.addMongoDbProject(this.project_name)
      .subscribe((project) => {
        console.log('POST DATA PROJECT RESPONSE ', project);

        // WHEN THE USER SELECT A PROJECT ITS ID IS SEND IN THE PROJECT SERVICE THET PUBLISHES IT
        // THE SIDEBAR SIGNS UP FOR ITS PUBLICATION
        const newproject: Project = {
          _id: project._id,
          name: project.name
        }

        // SENT THE NEW PROJECT TO THE AUTH SERVICE THAT PUBLISH
        this.auth.projectSelected(newproject)
        console.log('CreateProjectComponent CREATED PROJECT ', newproject)

        this.id_project = newproject._id

        /* !!! NO MORE USED - NOW THE ALL PROJECTS ARE SETTED IN THE STORAGE IN getProjectsAndSaveInStorage()
         * SET THE project_id IN THE LOCAL STORAGE
         * WHEN THE PAGE IS RELOADED THE SIDEBAR GET THE PROJECT ID FROM THE LOCAL STORAGE */
        // localStorage.setItem('project', JSON.stringify(newproject));

      }, (error) => {

        this.DISPLAY_SPINNER = false;

        console.log('CreateProjectComponent CREATE NEW PROJECT - POST REQUEST ERROR ', error);
      }, () => {
        console.log('CreateProjectComponent CREATE NEW PROJECT - POST REQUEST COMPLETE ');

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
      console.log('!!! getProjectsAndSaveInStorage PROJECTS ', projects);

      if (projects) {
        this.projects = projects;

        // SET THE IDs and the NAMES OF THE PROJECT IN THE LOCAL STORAGE.
        // WHEN IS REFRESHED A PAGE THE AUTSERVICE USE THE NAVIGATION PROJECT ID TO GET FROM STORAGE THE NAME OF THE PROJECT
        // AND THEN PUBLISH PROJECT ID AND PROJECT NAME
        this.projects.forEach(project => {
          console.log('!!! getProjectsAndSaveInStorage SET PROJECT IN STORAGE')
          if (project.id_project) {
            const prjct: Project = {
              _id: project.id_project._id,
              name: project.id_project.name,
              role: project.role,

            }

            localStorage.setItem(project.id_project._id, JSON.stringify(prjct));
          }
        });
      }
    }, error => {
      console.log('getProjectsAndSaveInStorage - ERROR ', error)
    }, () => {
      console.log('getProjectsAndSaveInStorage - COMPLETE')
    });
  }


  continueToInstallScript() {

    this.router.navigate([`/project/${this.id_project}/install-tiledesk`]);
    
    // if (this.router.url === '/create-project') {
    //   this.router.navigate([`/project/${this.id_project}/install-tiledesk`]);
    // } else {
    //   this.router.navigate([`/project/${this.id_project}/home`]);
    // }
  }

}
