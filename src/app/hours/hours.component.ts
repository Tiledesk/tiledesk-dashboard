import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';

import { ProjectService } from '../services/project.service';
import { UsersService } from '../services/users.service';
@Component({
  selector: 'appdashboard-hours',
  templateUrl: './hours.component.html',
  styleUrls: ['./hours.component.scss']
})
export class HoursComponent implements OnInit {
  activeOperatingHours: boolean;
  operatingHours: any;
  constructor(
    private auth: AuthService,
    private projectService: ProjectService,
    private usersService: UsersService
  ) { }

  ngOnInit() {
    this.auth.checkRole();


  }

  onChange($event) {
    this.activeOperatingHours = $event.target.checked;
    console.log('TIMETABLES ARE ACTIVE ', this.activeOperatingHours)
  }


  // UPDATE PROJECT OPERATING HOURS
  updateProjectOperatingHours() {
    console.log('ON UPDATE OPERATING HOURS - OPERATING HOURS ARE ACTIVE ', this.activeOperatingHours)
    console.log('ON UPDATE OPERATING HOURS - OPERATING HOURS ', this.operatingHours)

    this.projectService.updateProjectOperatingHours(this.activeOperatingHours, this.operatingHours).subscribe((project) => {
      console.log('»»»»»»» UPDATED PROJECT ', project)
    })
  }

  testAvailableProjectUserConsideringProjectOperatingHours() {
    const offset = new Date().getTimezoneOffset();
    console.log('OFFEST ', offset);

    const time = new Date('2001-01-01T06:00:00+08:00');
    console.log('TIME ', time);
    console.log('TIME ', time.toUTCString());

    this.usersService.getAvailableProjectUsersConsideringOperatingHours().subscribe((available_project) => {
      console.log('»»»»»»» NEW - GET AVAILABLE PROJECT USERS (CONSIDERING OPERATING HOURS)', available_project)
    })

  }

  changeOpenedClosedStatus() {
console.log('CLICKED CHANGE STATUS OPENED/CLOSED')
  }


}
