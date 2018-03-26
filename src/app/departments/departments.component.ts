import { Component, OnInit } from '@angular/core';
import { MongodbDepartmentService } from '../services/mongodb-department.service';
import { Department } from '../models/department-model';
import { Router } from '@angular/router';

import { Project } from '../models/project-model';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'mongodb-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss'],
})
export class DepartmentsComponent implements OnInit {

  departments: Department[];

  dept_name: string;

  // SWITCH DISPLAYED DATA IN THE MODAL DEPENDING ON WHETHER THE
  // USER CLICK ON DELETE BTN OR ON EDIT BUTTON
  DISPLAY_DATA_FOR_UPDATE_MODAL = false;
  DISPLAY_DATA_FOR_DELETE_MODAL = false;
  // set to none the property display of the modal
  display = 'none';

  // DATA DISPLAYED IN THE 'DELETE' MODAL
  id_toDelete: string;
  deptName_toDelete: string;

  // DATA DISPLAYED IN THE 'UPDATE' MODAL
  id_toUpdate: string;
  deptName_toUpdate: string;

  project: Project;

  constructor(
    private mongodbDepartmentService: MongodbDepartmentService,
    private router: Router,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.getCurrentProject();

    // this.getDepartments();
    this.getDeptsByProjectId();
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      console.log('00 -> DEPT COMP project ID from AUTH service subscription  ', this.project._id)
    });
  }

  // GO TO  BOT-EDIT-ADD COMPONENT
  goToEditAddPage_CREATE() {
    this.router.navigate(['project/' + this.project._id + '/department/create']);
  }

  // GO TO BOT-EDIT-ADD COMPONENT AND PASS THE BOT ID (RECEIVED FROM THE VIEW)
  goToEditAddPage_EDIT(dept_id: string) {
    console.log('DEPT ID ', dept_id);
    this.router.navigate(['project/' + this.project._id + '/department/edit', dept_id]);
  }

  /**
   * GETS ONLY THE DEPTs WITH THE CURRENT PROJECT ID
   */
  getDeptsByProjectId() {
    this.mongodbDepartmentService.getDeptsByProjectId(this.project._id).subscribe((departments: any) => {
      console.log('MONGO DB DEPARTMENTS (FILTERED FOR PROJECT ID)', departments);
      this.departments = departments;
    });
  }

  /**
   * !!! NO MORE USED
   * - CURRENTLY ARE DISPLAYED ONLY THE DEPTS WITH THAT HAVE THE ID OF THE CURRENT PROJECT (see ABOVE)
   *
   * GET DEPTS (READ)
   */
  // getDepartments() {
  //   this.mongodbDepartmentService.getMongDbDepartments().subscribe((departments: any) => {
  //     console.log('MONGO DB DEPARTMENTS', departments);
  //     this.departments = departments;
  //   });
  // }

  /**
   * ADD DEPARMENT
   * !! MOVED IN DEPARTMENT-EDIT-ADD COMPONENT
   */
  // createDepartment() {
  //   console.log('MONGO DB DEPT-NAME DIGIT BY USER ', this.dept_name);
  //   this.mongodbDepartmentService.addMongoDbDepartments(this.dept_name)
  //     .subscribe((department) => {
  //       console.log('POST DATA ', department);

  //       this.dept_name = '';

  //       // RE-RUN GET CONTACT TO UPDATE THE TABLE
  //       // this.getDepartments();
  //       this.ngOnInit();
  //     },
  //     (error) => {

  //       console.log('POST REQUEST ERROR ', error);

  //     },
  //     () => {
  //       console.log('POST REQUEST * COMPLETE *');
  //     });

  // }

  /**
   * MODAL DELETE DEPARTMENT
   * @param id
   * @param deptName
   * @param hasClickedDeleteModal
   */
  openDeleteModal(id: string, deptName: string, hasClickedDeleteModal: boolean) {
    console.log('HAS CLICKED OPEN DELETE MODAL TO CONFIRM BEFORE TO DELETE ', hasClickedDeleteModal);
    console.log('ON MODAL DELETE OPEN -> USER ID ', id);
    this.DISPLAY_DATA_FOR_DELETE_MODAL = hasClickedDeleteModal;
    this.DISPLAY_DATA_FOR_UPDATE_MODAL = false;

    if (hasClickedDeleteModal) {
      this.display = 'block';
    }

    this.id_toDelete = id;
    this.deptName_toDelete = deptName;
  }

  /**
   * DELETE DEPARTMENT (WHEN THE 'CONFIRM' BUTTON IN MODAL IS CLICKED)
   */
  onCloseDeleteModalHandled() {
    this.display = 'none';

    this.mongodbDepartmentService.deleteMongoDbDeparment(this.id_toDelete).subscribe((data) => {
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

  /**
   * MODAL UPDATE DEPARTMENT
   * @param id
   * @param deptName
   * @param hasClickedUpdateModal
   */
  openUpdateModal(id: string, deptName: string, hasClickedUpdateModal: boolean) {
    // display the modal windows (change the display value in the view)
    console.log('HAS CLICKED OPEN MODAL TO UPDATE USER DATA ', hasClickedUpdateModal);
    this.DISPLAY_DATA_FOR_UPDATE_MODAL = hasClickedUpdateModal;
    this.DISPLAY_DATA_FOR_DELETE_MODAL = false;

    if (hasClickedUpdateModal) {
      this.display = 'block';
    }

    console.log('ON MODAL OPEN -> CONTACT ID ', id);
    console.log('ON MODAL OPEN -> CONTACT FULL-NAME TO UPDATE', deptName);

    this.id_toUpdate = id;
    this.deptName_toUpdate = deptName;
  }

  /**
   * UPDATE CONTACT (WHEN THE 'SAVE' BUTTON IN MODAL IS CLICKED)
   */
  // onCloseUpdateModalHandled() {
  //   // HIDE THE MODAL
  //   this.display = 'none';

  //   console.log('ON MODAL UPDATE CLOSE -> CONTACT ID ', this.id_toUpdate);
  //   console.log('ON MODAL UPDATE CLOSE -> CONTACT FULL-NAME UPDATED ', this.deptName_toUpdate);
  //   this.mongodbDepartmentService.updateMongoDbDepartment(this.id_toUpdate, this.deptName_toUpdate).subscribe((data) => {
  //     console.log('PUT DATA ', data);

  //     // RE-RUN GET CONTACT TO UPDATE THE TABLE
  //     // this.getDepartments();
  //     this.ngOnInit();
  //   },
  //     (error) => {

  //       console.log('PUT REQUEST ERROR ', error);

  //     },
  //     () => {
  //       console.log('PUT REQUEST * COMPLETE *');
  //     });

  // }

  // CLOSE MODAL WITHOUT SAVE THE UPDATES OR WITHOUT CONFIRM THE DELETION
  onCloseModal() {
    this.display = 'none';
  }

}
