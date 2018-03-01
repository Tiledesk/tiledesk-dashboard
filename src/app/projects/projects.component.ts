import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { Project } from '../models/project-model';
import { Router } from '@angular/router';

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

  constructor(
    private projectService: ProjectService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.getProjects();
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

}
