import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

// USED FOR go back last page
import { Location } from '@angular/common';
import { AuthService } from '../core/auth.service';

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

  display = 'none'

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute,
    private _location: Location,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
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
      console.log('++ > GET PROJECT (DETAILS) BY ID - PROJECT OBJECT: ', project);

      this.projectName_toUpdate = project.name;
      console.log('PROJECT NAME TO UPDATE: ', this.projectName_toUpdate);

    },
      (error) => {
        console.log('GET PROJECT BY ID - ERROR ', error);
        this.showSpinner = false;
      },
      () => {
        console.log('GET PROJECT BY ID - COMPLETE ');
        this.showSpinner = false;
      });
  }

  /**
   * ADD PROJECT (CREATE VIEW)
   */
  createProject() {
    console.log('CREATE PROJECT - PROJECT-NAME DIGIT BY USER ', this.project_name);

    this.projectService.addMongoDbProject(this.project_name)
      .subscribe((project) => {
        console.log('POST DATA PROJECT', project);

        // if (project) {

        //   this.projectService.createUserProject(project._id)
        //   .subscribe((project_user) => {

        //     console.log('POST DATA PROJECT-USER ', project_user);
        //   },
        //   (error) => {
        //     console.log('CREATE PROJECT-USER - POST REQUEST ERROR ', error);
        //   },
        // );

        // }
      },
      (error) => {
        console.log('CREATE PROJECT - POST REQUEST ERROR ', error);
      },
      () => {
        console.log('CREATE PROJECT - POST REQUEST COMPLETE ');

        this.router.navigate(['/projects']);
      });
  }

  edit() {
    console.log('PROJECT ID WHEN EDIT IS PRESSED ', this.id_project);
    console.log('PROJECT NAME WHEN EDIT IS PRESSED ', this.projectName_toUpdate);

    this.projectService.updateMongoDbProject(this.id_project, this.projectName_toUpdate)
      .subscribe((data) => {
        console.log('PUT DATA ', data);
      },
      (error) => {
        console.log('PUT REQUEST ERROR ', error);
      },
      () => {
        console.log('PUT REQUEST * COMPLETE *');
        this.router.navigate(['/projects']);
      });
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



}
