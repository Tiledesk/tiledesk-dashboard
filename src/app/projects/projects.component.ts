import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { Project } from '../models/project-model';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

import { RequestsService } from '../services/requests.service';



@Component({
  selector: 'projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

  projects: Project[];

  project_name: string;

  // set to none the property display of the modal
  display = 'none';

  projectName_toDelete: string;
  id_toDelete: string;

  user: any;
  private toggleButton: any;
  private sidebarVisible: boolean;
  newInnerWidth: any;

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private auth: AuthService,
    private requestsService: RequestsService,
    private element: ElementRef,
  ) { }

  ngOnInit() {
    const navbar: HTMLElement = this.element.nativeElement;
    this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];

    this.getProjects();
    this.getLoggedUser();

  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      console.log('USER GET IN PROJECT COMP ', user)
      this.user = user;
    });
  }

  logout() {
    this.auth.signOut();
  }

  // project/:projectid/home
  goToHome(project_id: string, project_name: string) {
    this.router.navigate([`/project/${project_id}/home`]);

    // WHEN THE USER SELECT A PROJECT ITS ID IS SEND IN THE PROJECT SERVICE THET PUBLISHES IT
    // THE SIDEBAR SIGNS UP FOR ITS PUBLICATION
    const project: Project = {
      _id: project_id,
      name: project_name
    }

    this.auth.projectSelected(project)
    console.log('PROJECT ', project)

    // SET THE project_id IN THE LOCAL STORAGE
    // WHEN THE PAGE IS RELOADED THE SIDEBAR GET THE PROJECT ID FROM THE LOCAL STORAGE
    localStorage.setItem('project', JSON.stringify(project));


  }

  // GO TO  PROJECT-EDIT-ADD COMPONENT
  goToEditAddPage_CREATE() {
    this.router.navigate(['/project/create']);
  }

  // GO TO PROJECT-EDIT-ADD COMPONENT AND PASS THE PROJECT ID (RECEIVED FROM THE VIEW)
  goToEditAddPage_EDIT(project_id: string) {
    console.log('PROJECT ID ', project_id);
    this.router.navigate(['project/edit', project_id]);
  }

  /**
   * GET BOTS (READ)
   */
  getProjects() {
    this.projectService.getMongDbProjects().subscribe((projects: any) => {
      console.log('GET PROJECTS ', projects);
      this.projects = projects;
    });
  }

  /**
   * MODAL DELETE PROJECT
   * @param id
   * @param projectName
   */
  openDeleteModal(id: string, projectName: string) {
    console.log('ON OPEN DELETE MODAL -> PROJECT ID ', id);

    this.display = 'block';


    this.id_toDelete = id;
    this.projectName_toDelete = projectName;
  }

  // CLOSE MODAL WITHOUT SAVE THE UPDATES OR WITHOUT CONFIRM THE DELETION
  onCloseModal() {
    this.display = 'none';
  }

  /**
   * DELETE PROJECT (WHEN THE 'CONFIRM' BUTTON IN MODAL IS CLICKED)
   */
  onCloseDeleteModalHandled() {
    this.display = 'none';

    this.projectService.deleteMongoDbProject(this.id_toDelete).subscribe((data) => {
      console.log('DELETE DATA ', data);

      // RE-RUN GET CONTACT TO UPDATE THE TABLE
      // this.getDepartments();
      this.ngOnInit();

    },
      (error) => {

        console.log('DELETE REQUEST ERROR ', error);

      },
      () => {
        console.log('DELETE REQUEST * COMPLETE *');
      });

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

}
