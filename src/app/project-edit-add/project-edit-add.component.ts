import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

// USED FOR go back last page
import { Location } from '@angular/common';
import { AuthService } from '../core/auth.service';
import { Project } from '../models/project-model';
import { ProjectPlanService } from '../services/project-plan.service';
@Component({
  selector: 'app-project-edit-add',
  templateUrl: './project-edit-add.component.html',
  styleUrls: ['./project-edit-add.component.scss']
})
export class ProjectEditAddComponent implements OnInit {

  CREATE_VIEW = false;
  EDIT_VIEW = false;
  showSpinner = true;

  project_name: string;
  projectName_toUpdate: string;
  id_project: string;

  display = 'none';
  displayJwtSecretGeneratedModal = 'none';
  displayConfirmJwtSecretCreationModal = 'none';
  sharedSecret: string;

  DISABLE_UPDATE_BTN = true;
  project: Project;

  AUTO_SEND_TRANSCRIPT_IS_ON: boolean;

  prjct_name: string;
  prjct_profile_name: string;
  prjct_trial_expired: boolean;
  prjc_trial_days_left: any;

  displayContactUsModal = 'none';

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute,
    private _location: Location,
    private auth: AuthService,
    private prjctPlanService: ProjectPlanService
  ) { }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.getProjectPlan();
    /**
     * BASED ON THE URL PATH DETERMINE IF THE USER HAS SELECTED (IN BOT PAGE) 'CREATE' OR 'EDIT'
     */
    if (this.router.url.indexOf('/create') !== -1) {

      console.log('HAS CLICKED CREATE ');
      this.CREATE_VIEW = true;
      this.showSpinner = false;

    } else {
      console.log('HAS CLICKED EDIT ');
      this.EDIT_VIEW = true;

      // *** GET BOT ID FROM URL PARAMS ***
      // IS USED TO GET THE BOT OBJECT ( THE ID IS PASSED FROM BOTS COMPONENT - goToEditAddPage_EDIT())
      this.getProjectId();
      // this.getBotIdAndFaqKbId();
      if (this.id_project) {
        this.getProjectById();
      }
    }
  }

  getProjectPlan() {
    this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      console.log('ProjectPlanService (navbar) project Profile Data', projectProfileData)
      if (projectProfileData) {
        this.prjct_name = projectProfileData.name;
        this.prjct_profile_name = projectProfileData.profile_name;
        this.prjct_trial_expired = projectProfileData.trial_expired;
        this.prjc_trial_days_left = projectProfileData.trial_days_left;

        if (this.prjct_profile_name === 'free') {
          if (this.prjct_trial_expired === false) {
            this.prjct_profile_name = 'Pro (trial)'
          } else {
            this.prjct_profile_name = projectProfileData.profile_name;
          }
        } else if (this.prjct_profile_name === 'pro') {

          this.prjct_profile_name = projectProfileData.profile_name;
        }
      }
    })
  }

  openLetsChatModal() {
    this.displayContactUsModal = 'block';
    console.log('openLetsChatModal')
  }

  closeContactUsModal() {
    this.displayContactUsModal = 'none';
  }

  launchWidget() {
    if (window && window['tiledesk']) {
      window['tiledesk'].open();
    }
  }

  goToPricing() {
    this.router.navigate(['project/' + this.id_project + '/pricing']);
  }

  // !!! NO MORE USED - GO BACK TO PROJECT LIST
  goBackToProjectsList() {
    this.router.navigate(['/projects']);
  }

  goBack() {
    this._location.back();
  }

  getProjectId() {
    this.id_project = this.route.snapshot.params['projectid'];
    console.log('PROJECT COMPONENT HAS PASSED id_project ', this.id_project);
  }

  /**
   * *** GET PROJECT OBJECT BY ID (EDIT VIEW) ***
   * THE ID USED TO RUN THIS getMongDbBotById IS PASSED FROM BOTS LIST (BOTS COMPONENT goToEditAddPage_EDIT))
   * FROM THE BOT OBJECT IS USED:
   */
  getProjectById() {
    this.projectService.getProjectById(this.id_project).subscribe((project: any) => {
      console.log('PRJCT-EDIT-ADD - GET PROJECT (DETAILS) BY ID - PROJECT OBJECT: ', project);

      if (project) {
        this.projectName_toUpdate = project.name;
        console.log('PRJCT-EDIT-ADD - PROJECT NAME TO UPDATE: ', this.projectName_toUpdate);

        // used in onProjectNameChange to enable / disable the 'update project name' btn
        this.project_name = project.name;

        if (project.settings) {

          if (project.settings.email.autoSendTranscriptToRequester === true) {
            console.log('PRJCT-EDIT-ADD - ON INIT AUTO SEND TRANSCRIPT IS ', project.settings.email.autoSendTranscriptToRequester);

            this.AUTO_SEND_TRANSCRIPT_IS_ON = true;
            console.log('PRJCT-EDIT-ADD - ON INIT AUTO SEND TRANSCRIPT IS ON ', this.AUTO_SEND_TRANSCRIPT_IS_ON);

          } else {
            this.AUTO_SEND_TRANSCRIPT_IS_ON = false;
            console.log('PRJCT-EDIT-ADD - ON INIT AUTO SEND TRANSCRIPT IS ON ', this.AUTO_SEND_TRANSCRIPT_IS_ON);
          }
        } else {

          this.AUTO_SEND_TRANSCRIPT_IS_ON = false;
          console.log('PRJCT-EDIT-ADD - ON INIT AUTO SEND TRANSCRIPT IS ON ', this.AUTO_SEND_TRANSCRIPT_IS_ON);
        }
      }

    }, (error) => {
      console.log('PRJCT-EDIT-ADD - GET PROJECT BY ID - ERROR ', error);
      this.showSpinner = false;
    }, () => {
      console.log('PRJCT-EDIT-ADD - GET PROJECT BY ID - COMPLETE ');
      this.showSpinner = false;
    });
  }

  /**
   * ADD PROJECT (CREATE VIEW)  */
  // createProject() {
  //   console.log('CREATE PROJECT - PROJECT-NAME DIGIT BY USER ', this.project_name);

  //   this.projectService.addMongoDbProject(this.project_name)
  //     .subscribe((project) => {
  //       console.log('POST DATA PROJECT', project);

  //       // if (project) {
  //       //   this.projectService.createUserProject(project._id)
  //       //   .subscribe((project_user) => {

  //       //     console.log('POST DATA PROJECT-USER ', project_user);
  //       //   },
  //       //   (error) => {
  //       //     console.log('CREATE PROJECT-USER - POST REQUEST ERROR ', error);
  //       //   },
  //       // );
  //       // }
  //     }, (error) => {
  //       console.log('CREATE PROJECT - POST REQUEST ERROR ', error);
  //     }, () => {
  //       console.log('CREATE PROJECT - POST REQUEST COMPLETE ');

  //       this.router.navigate(['/projects']);
  //     });
  // }

  onProjectNameChange(event) {

    console.log('ON PROJECT NAME CHANGE ', event);
    console.log('ON PROJECT NAME TO UPDATE ', this.project_name);

    if (event === this.project_name) {
      this.DISABLE_UPDATE_BTN = true;

    } else {
      this.DISABLE_UPDATE_BTN = false;
    }
  }

  edit() {
    console.log('PROJECT ID WHEN EDIT IS PRESSED ', this.id_project);
    console.log('PROJECT NAME WHEN EDIT IS PRESSED ', this.projectName_toUpdate);

    this.projectService.updateMongoDbProject(this.id_project, this.projectName_toUpdate)
      .subscribe((prjct) => {
        console.log('UPDATE PROJECT - RESPONSE ', prjct);

        if (prjct) {
          if (prjct.name === this.projectName_toUpdate) {
            this.DISABLE_UPDATE_BTN = true;
          }

          // WHEN THE USER UPDATE THE PROJECT ITS ID and NAME IS SEND IN THE AUTH SERVICE THAT RE-PUBLISHES IT
          const project: Project = {
            _id: this.id_project,
            name: prjct.name,
          }
          this.auth.projectSelected(project)

          const storedProjectJson = localStorage.getItem(this.id_project);
          console.log('PRJCT-EDIT-ADD - STORED PROJECT JSON ', storedProjectJson);

          if (storedProjectJson) {
            const projectObject = JSON.parse(storedProjectJson);
            console.log('PRJCT-EDIT-ADD - STORED PROJECT OBJ ', projectObject);
            const storedUserRole = projectObject['role'];
            console.log('PRJCT-EDIT-ADD - STORED PROJECT OBJ - USER ROLE ', storedUserRole);
            const storedProjectName = projectObject['name'];
            console.log('PRJCT-EDIT-ADD - STORED PROJECT OBJ - PRJ NAME ', storedProjectName);
            const storedProjectId = projectObject['_id'];
            console.log('PRJCT-EDIT-ADD - STORED PROJECT OBJ - PRJ ID ', storedProjectId);

            if (storedProjectName !== prjct.name) {

              const updatedProjectForStorage: Project = {
                _id: storedProjectId,
                name: prjct.name,
                role: storedUserRole
              }

              // RE-SET THE PROJECT IN THE STORAGE WITH THE UPDATED NAME
              localStorage.setItem(storedProjectId, JSON.stringify(updatedProjectForStorage));

            }
          }
        }

      }, (error) => {
        console.log('UPDATE PROJECT - ERROR ', error);
      }, () => {
        console.log('UPDATE PROJECT * COMPLETE *');
        // this.router.navigate(['/projects']);
      });
  }


  autoSendTranscriptOnOff($event) {
    console.log('»» PRJCT-EDIT-ADD - AUTO SEND TRANSCRIPT BY EMAIL ON ', $event.target.checked);

    this.projectService.updateAutoSendTranscriptToRequester($event.target.checked)
      .subscribe((prjct) => {
        console.log('PRJCT-EDIT-ADD AUTO SEND TRANSCRIPT UPDATE PROJECT - RES ', prjct);

      }, (error) => {
        console.log('PRJCT-EDIT-ADD AUTO SEND TRANSCRIPT UPDATE PROJECT - ERROR ', error);
      }, () => {
        console.log('PRJCT-EDIT-ADD AUTO SEND TRANSCRIPT UPDATE PROJECT * COMPLETE *');
        // this.router.navigate(['/projects']);
      });
  }

  openConfirmJwtSecretCreationModal() {
    this.displayConfirmJwtSecretCreationModal = 'block';
  }

  closeConfirmJwtSecretCreationModal() {
    this.displayConfirmJwtSecretCreationModal = 'none';
  }

  generateSharedSecret() {
    this.displayConfirmJwtSecretCreationModal = 'none';
    this.projectService.generateSharedSecret()
      .subscribe((res) => {
        console.log('PRJCT-EDIT-ADD GENERATE SHARED SECRET - RESPONSE ', res);
        this.sharedSecret = res.jwtSecret

      }, (error) => {
        console.log('PRJCT-EDIT-ADD GENERATE SHARED SECRET - ERROR ', error);
      }, () => {
        console.log('PRJCT-EDIT-ADD GENERATE SHARED SECRET  * COMPLETE *');

        this.displayJwtSecretGeneratedModal = 'block'
      });
  }

  closeJwtSecretGeneratedModal() {
    this.displayJwtSecretGeneratedModal = 'none'
  }

  copySharedSecret() {
    const copyText = document.getElementById('sharedSecretInput') as HTMLInputElement;
    copyText.select();
    document.execCommand('copy');
  }


  /**
   * MODAL DELETE PROJECT
   * @param id
   * @param projectName
   */
  openDeleteModal() {
    console.log('OPEN DELETE MODAL -> PROJECT ID ', this.id_project);
    this.display = 'block';
  }

  onCloseModal() {
    this.display = 'none';
  }

  goToWidgetAuthenticationDocs() {
    const url = 'https://docs.tiledesk.com/widget/auth'
    window.open(url, '_blank');
  }



}
