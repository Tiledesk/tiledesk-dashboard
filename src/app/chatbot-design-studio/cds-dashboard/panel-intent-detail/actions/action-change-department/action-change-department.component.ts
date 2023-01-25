import { DepartmentService } from 'app/services/department.service';
import { ActionChangeDepartment } from 'app/models/intent-model';
import { Component, Input, OnInit } from '@angular/core';
import { Department } from 'app/models/department-model';

@Component({
  selector: 'cds-action-change-department',
  templateUrl: './action-change-department.component.html',
  styleUrls: ['./action-change-department.component.scss']
})
export class ActionChangeDepartmentComponent implements OnInit {

  @Input() action: ActionChangeDepartment

  deps_name_list: string[] = [];
  dep_selected: Department;

  constructor(private departmentService: DepartmentService) { }

  ngOnInit(): void {
    console.log("[ACTION CHANGE DEPARTMENT] action: ", this.action)
    this.getAllDepartments();
  }

  getAllDepartments() {
    this.departmentService.getDeptsByProjectId().subscribe((deps) => {
      console.log("[ACTION CHANGE DEPARTMENT] deps: ", deps);
      this.deps_name_list = deps.map(a => a.name);
    }, (error) => {
      console.error("[ACTION CHANGE DEPARTMENT] error get deps: ", error);
    }, () => {
      console.log("[ACTION CHANGE DEPARTMENT] get all deps completed.");
    })
  }

  onChangeActionButton(event) {
    //console.log("[ACTION REPLACE BOT] onChangeActionButton event: ", event)
    this.action.depName = event;
    console.log("[ACTION REPLACE BOT] action edited: ", this.action)
  }


}
