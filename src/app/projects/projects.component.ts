import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { Project } from '../models/project-model';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

import { RequestsService } from '../services/requests.service';
import { MongodbDepartmentService } from '../services/mongodb-department.service';
import { isDevMode } from '@angular/core';
import { UsersService } from '../services/users.service';
import { UploadImageService } from '../services/upload-image.service';

@Component({
  selector: 'projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

  projects: Project[];

  id_project: string;
  project_name: string;

  // set to none the property display of the modal
  displayCreateModal = 'none';
  displayInfoModal = 'none';

  projectName_toDelete: string;
  id_toDelete: string;

  user: any;
  private toggleButton: any;
  private sidebarVisible: boolean;
  newInnerWidth: any;
  showSpinner = true;

  SHOW_CIRCULAR_SPINNER = false;
  displayLogoutModal = 'none';

  APP_IS_DEV_MODE: boolean;
  userProfileImageExist: boolean;
  userImageHasBeenUploaded: boolean;
  constructor(
    private projectService: ProjectService,
    private router: Router,
    private auth: AuthService,
    private requestsService: RequestsService,
    private element: ElementRef,
    private departmentService: MongodbDepartmentService,
    private usersService: UsersService,
    private uploadImageService: UploadImageService
  ) {
    console.log('IS DEV MODE ', isDevMode());
    this.APP_IS_DEV_MODE = isDevMode()
  }

  ngOnInit() {
    const navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];

    this.getProjectsAndSaveInStorage();
    this.getLoggedUser();

    this.checkUserImageUploadIsComplete()

    // used when the page is refreshed
    this.checkUserImageExist()
  }

  checkUserImageExist() {
    this.usersService.userProfileImageExist.subscribe((image_exist) => {
      console.log('USER-PROFILE - USER PROFILE EXIST ? ', image_exist);
      this.userProfileImageExist = image_exist;
    });
  }
  checkUserImageUploadIsComplete() {
    this.uploadImageService.imageExist.subscribe((image_exist) => {
      console.log('USER-PROFILE - IMAGE UPLOADING IS COMPLETE ? ', image_exist);
      this.userImageHasBeenUploaded = image_exist;
    });
  }


  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      console.log('USER GET IN PROJECT COMP ', user)
      this.user = user;
    });
  }

  // project/:projectid/home
  // , available: boolean
  goToHome(project_id: string, project_name: string) {
    this.router.navigate([`/project/${project_id}/home`]);

    // WHEN THE USER SELECT A PROJECT ITS ID and NAME IS SEND IN THE AUTH SERVICE THAT PUBLISHES IT
    const project: Project = {
      _id: project_id,
      name: project_name,
    }

    this.auth.projectSelected(project)
    console.log('!!! GO TO HOME PROJECT ', project)

   /* !!! NO MORE USED - NOW THE ALL PROJECTS ARE SETTED IN THE STORAGE IN getProjectsAndSaveInStorage()
    * SET THE project_id IN THE LOCAL STORAGE
    * WHEN THE PAGE IS RELOADED THE SIDEBAR GET THE PROJECT ID FROM THE LOCAL STORAGE */
    // localStorage.setItem('project', JSON.stringify(project));
  }

  // GO TO  PROJECT-EDIT-ADD COMPONENT
  goToEditAddPage_CREATE() {
    this.router.navigate(['/project/create']);
  }

  // TEST VERIFY-EMAIL
  testVerifyEmail() {
    if (this.user) {
      this.router.navigate(['/verify/email/', this.user._id]);
    }
  }

  // GO TO PROJECT-EDIT-ADD COMPONENT AND PASS THE PROJECT ID (RECEIVED FROM THE VIEW)
  goToEditAddPage_EDIT(project_id: string) {
    console.log('PROJECT ID ', project_id);
    this.router.navigate(['project/edit', project_id]);
  }

  /**
   * GET PROJECTS AND SAVE IN THE STORAGE: PROJECT ID - PROJECT NAME - USE ROLE   */
  getProjectsAndSaveInStorage() {
    this.projectService.getProjects().subscribe((projects: any) => {
      console.log('!!! GET PROJECTS ', projects);

      this.showSpinner = false;

      if (projects) {
        this.projects = projects;

        // SET THE IDs and the NAMES OF THE PROJECT IN THE LOCAL STORAGE.
        // WHEN IS REFRESHED A PAGE THE AUTSERVICE USE THE NAVIGATION PROJECT ID TO GET FROM STORAGE THE NAME OF THE PROJECT
        // AND THEN PUBLISH PROJECT ID AND PROJECT NAME
        this.projects.forEach(project => {
          console.log('!!! SET PROJECT IN STORAGE')

          const prjct: Project = {
            _id: project.id_project._id,
            name: project.id_project.name,
            role: project.role
          }
          localStorage.setItem(project.id_project._id,  JSON.stringify(prjct));
        });
      }

    }, error => {
      this.showSpinner = false;
      console.log('GET PROJECTS - ERROR ', error)
    }, () => {
      console.log('GET PROJECTS - COMPLETE')

    });
  }

  /**
   * MODAL DELETE PROJECT
   * @param id
   * @param projectName
   */
  // openDeleteModal(id: string, projectName: string) {
  //   console.log('OPEN DELETE MODAL');
  //   this.display = 'block';
  //   this.id_toDelete = id;
  //   this.projectName_toDelete = projectName;
  // }


  openCreateModal() {
    console.log('OPEN CREATE MODAL ');

    this.displayCreateModal = 'block';

  }

  // CLOSE MODAL WITHOUT SAVE THE UPDATES OR WITHOUT CONFIRM THE DELETION
  onCloseModal() {
    this.displayCreateModal = 'none';
    this.displayInfoModal = 'none';
    this.displayLogoutModal = 'none';
  }

  /** !! NO MORE USED
   * DELETE PROJECT (WHEN THE 'CONFIRM' BUTTON IN MODAL IS CLICKED)
   */
  // onCloseDeleteModalHandled() {
  //   this.displayCreateModal = 'none';
  //   this.projectService.deleteMongoDbProject(this.id_toDelete).subscribe((data) => {
  //     console.log('DELETE DATA ', data);
  //     // RE-RUN GET CONTACT TO UPDATE THE TABLE
  //     // this.getDepartments();
  //     this.ngOnInit();
  //   },
  //     (error) => {
  //       console.log('DELETE REQUEST ERROR ', error);
  //     },
  //     () => {
  //       console.log('DELETE REQUEST * COMPLETE *');
  //     });
  // }

  createProject() {
    console.log('OPEN CREATE MODAL ');
    // hide the create Modal and display the info Modal and the spinner in the info Modal
    this.displayInfoModal = 'block'
    this.displayCreateModal = 'none';
    this.SHOW_CIRCULAR_SPINNER = true;

    console.log('CREATE PROJECT - PROJECT-NAME DIGIT BY USER ', this.project_name);

    this.projectService.addMongoDbProject(this.project_name)
      .subscribe((project) => {
        console.log('POST DATA PROJECT', project);

        // WHEN THE USER SELECT A PROJECT ITS ID IS SEND IN THE PROJECT SERVICE THET PUBLISHES IT
        // THE SIDEBAR SIGNS UP FOR ITS PUBLICATION
        const newproject: Project = {
          _id: project._id,
          name: project.name
        }

        // SENT THE NEW PROJECT TO THE AUTH SERVICE THAT PUBLISH
        this.auth.projectSelected(newproject)
        console.log('!!! CREATED PROJECT ', newproject)

        this.id_project = newproject._id

       /* !!! NO MORE USED - NOW THE ALL PROJECTS ARE SETTED IN THE STORAGE IN getProjectsAndSaveInStorage()
        * SET THE project_id IN THE LOCAL STORAGE
        * WHEN THE PAGE IS RELOADED THE SIDEBAR GET THE PROJECT ID FROM THE LOCAL STORAGE */
        // localStorage.setItem('project', JSON.stringify(newproject));

        // this.display = 'none';

        // this.router.navigate([`/project/${project._id}/home`]);

      }, (error) => {
        this.SHOW_CIRCULAR_SPINNER = false;
        console.log('CREATE PROJECT - POST REQUEST ERROR ', error);
      }, () => {
        console.log('CREATE PROJECT - POST REQUEST COMPLETE ');

        setTimeout(() => {
          this.SHOW_CIRCULAR_SPINNER = false
        }, 300);

        // this.router.navigate(['/projects']);
      });
  }

  onCloseInfoModalHandled() {
    this.router.navigate([`/project/${this.id_project}/home`]);
  }


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.newInnerWidth = event.target.innerWidth;
    console.log('INNER WIDTH ', this.newInnerWidth)

    if (this.newInnerWidth >= 992) {
      const elemAppSidebar = <HTMLElement>document.querySelector('app-sidebar');
      elemAppSidebar.setAttribute('style', 'display:none;');
    }
  }

  sidebarOpen() {
    const toggleButton = this.toggleButton;
    const body = document.getElementsByTagName('body')[0];
    setTimeout(function () {
      toggleButton.classList.add('toggled');
    }, 500);
    body.classList.add('nav-open');

    this.sidebarVisible = true;
    const elemAppSidebar = <HTMLElement>document.querySelector('app-sidebar');
    elemAppSidebar.setAttribute('style', 'display:block;');
  };
  sidebarClose() {
    const body = document.getElementsByTagName('body')[0];
    this.toggleButton.classList.remove('toggled');
    this.sidebarVisible = false;
    body.classList.remove('nav-open');

    const elemAppSidebar = <HTMLElement>document.querySelector('app-sidebar');
    elemAppSidebar.setAttribute('style', 'display:none;');
  };
  sidebarToggle() {
    // const toggleButton = this.toggleButton;
    // const body = document.getElementsByTagName('body')[0];
    if (this.sidebarVisible === false) {
      this.sidebarOpen();
    } else {
      this.sidebarClose();
    }
  };


  openLogoutModal() {
    this.displayLogoutModal = 'block';
  }

  onCloseLogoutModalHandled() {
    this.displayLogoutModal = 'none';
  }

  onLogoutModalHandled() {
    this.logout();
    this.displayLogoutModal = 'none';
  }

  logout() {
    this.auth.showExpiredSessionPopup(false);
    this.auth.signOut();
  }

  testExpiredSessionFirebaseLogout() {
    this.auth.testExpiredSessionFirebaseLogout(true)
  }
}
