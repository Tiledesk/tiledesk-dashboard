
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';

import { ProjectService } from '../services/project.service';
import { UsersService } from '../services/users.service';

import { AmazingTimePickerService } from 'amazing-time-picker';
@Component({
  selector: 'appdashboard-hours',
  templateUrl: './hours.component.html',
  styleUrls: ['./hours.component.scss']
})


export class HoursComponent implements OnInit {
  activeOperatingHours: boolean;
  operatingHours: any;

  public days = [
    // tslint:disable-next-line:max-line-length
    { '_id': '0', 'weekday': 'Sunday', 'isOpen': false, 'operatingHours': '', 'operatingHoursAmStart': '', 'operatingHoursAmEnd': '', 'operatingHoursPmStart': '', 'operatingHoursPmEnd': '' },

    // tslint:disable-next-line:max-line-length
    { '_id': '1', 'weekday': 'Monday', 'isOpen': false, 'operatingHours': '', 'operatingHoursAmStart': '', 'operatingHoursAmEnd': '', 'operatingHoursPmStart': '', 'operatingHoursPmEnd': '' },
    // tslint:disable-next-line:max-line-length
    { '_id': '2', 'weekday': 'Tuesday', 'isOpen': false, 'operatingHours': '', 'operatingHoursAmStart': '', 'operatingHoursAmEnd': '', 'operatingHoursPmStart': '', 'operatingHoursPmEnd': '' },
    // tslint:disable-next-line:max-line-length
    { '_id': '3', 'weekday': 'Wednesday', 'isOpen': false, 'operatingHours': '', 'operatingHoursAmStart': '', 'operatingHoursAmEnd': '', 'operatingHoursPmStart': '', 'operatingHoursPmEnd': '' },
    // tslint:disable-next-line:max-line-length
    { '_id': '4', 'weekday': 'Thursday', 'isOpen': false, 'operatingHours': '', 'operatingHoursAmStart': '', 'operatingHoursAmEnd': '', 'operatingHoursPmStart': '', 'operatingHoursPmEnd': '' },
    // tslint:disable-next-line:max-line-length
    { '_id': '5', 'weekday': 'Friday', 'isOpen': false, 'operatingHours': '', 'operatingHoursAmStart': '', 'operatingHoursAmEnd': '', 'operatingHoursPmStart': '', 'operatingHoursPmEnd': '' },
    // tslint:disable-next-line:max-line-length
    { '_id': '6', 'weekday': 'Saturday', 'isOpen': false, 'operatingHours': '', 'operatingHoursAmStart': '', 'operatingHoursAmEnd': '', 'operatingHoursPmStart': '', 'operatingHoursPmEnd': '' }
  ];

  // daysList: any;
  IS_OPEN = false;

  projectid: string
  project_operatingHours: any;
  public selectedTime: any;

  constructor(
    private auth: AuthService,
    private projectService: ProjectService,
    private usersService: UsersService,
    private atp: AmazingTimePickerService
  ) { }

  ngOnInit() {
    console.log('DAYS ', this.days)
    this.getCurrentProject()
    // this.daysList = this.days
    this.auth.checkRole();

  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {


      if (project) {
        this.projectid = project._id
        console.log('00 -> HOURS project from AUTH service subscription  ', project);

        console.log('00 -> HOURS project ID PROJECT  ', this.projectid)

        if (this.projectid) {
          this.getProjectById();
        }
      }
    });
  }

  getProjectById() {
    this.projectService.getMongDbProjectById(this.projectid).subscribe((project: any) => {
      console.log('≈≈≈≈ > HOURS - PROJECT (DETAILS) BY ID - PROJECT OBJECT: ', project);

      this.project_operatingHours = JSON.parse(project.operatingHours);
      console.log('≈≈≈≈ > HOURS - PROJECT OPERARITING HOURS: ', this.project_operatingHours);

      // SE NEL OGGETTO OPERATING HOURS DEL PROGETTO E PRESENTE LA KEY CHE INDICA IL GIORNO AGGIUNGO OPERATING 
      // HOURS ALL OBJECT DAY
      let i;
      for (i = 0; i < 7; i++) {
        console.log('CICLO I =  ', i)
        if (this.project_operatingHours.hasOwnProperty(i)) {

          console.log(this.days[i].weekday, ' IS SETTED ')
          console.log('operating hours start', this.project_operatingHours[i]);

          this.days[i].operatingHours = this.project_operatingHours[i];

          this.days[i].isOpen = true;
          this.days[i].operatingHoursAmStart = this.project_operatingHours[i][0].start
          this.days[i].operatingHoursAmEnd = this.project_operatingHours[i][0].end

          if (this.project_operatingHours[i][1]) {
            this.days[i].operatingHoursPmStart = this.project_operatingHours[i][1].start
            this.days[i].operatingHoursPmEnd = this.project_operatingHours[i][1].end
          }

          // this.project_operatingHours[i].forEach(hours => {
          //   console.log('hours start  ', hours.start, 'hours end  ', hours.end)
          //   this.days[i].operatingHoursAmStart = hours.start
          //   this.days[i].operatingHoursAmEnd =  hours.end
          // });

          // this.days.forEach(day => {
          //   const num = i
          //   console.log('operating hours ', this.project_operatingHours[i] )

          //   if (day._id === this.project_operatingHours[i]) {
          //     console.log('day id ', day._id, ' i:  ', i)
          //     day.isOpen = true;
          //     day.operatingHours = this.project_operatingHours[i]
          //     // console.log('DAY IS OPEN ', day.isOpen)
          console.log('DAYS ON INIT ', this.days)
          //   }
          // });

        } else {
          console.log(this.days[i].weekday, ' IS ! NOT SETTED ')
        }
      }


    },
      (error) => {
        console.log('HOURS COMP - PROJECT BY ID - ERROR ', error);
      },
      () => {
        console.log('HOURS COMP - PROJECT BY ID - COMPLETE ');
      });
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

  // changeOpenedClosedStatus(weekdayid: number, weekdayname: string, isOpen: boolean) {
  //   console.log('CLICKED CHANGE STATUS OPENED/CLOSED for the WEEKDAY ID ', weekdayid, ' - ', weekdayname, 'IS OPEN ', isOpen)
  //   // if (isOpen === true) {
  //   //   for 
  //   //   this.days.weekday = true
  //   // }
  // }

  onChangeOpenedClosedStatus($event, weekdayid: string, weekdayname: string) {
    // console.log('XXXX ', $event.target.checked)
    console.log('CLICKED CHANGE STATUS OPENED/CLOSED for the WEEKDAY ID ', weekdayid, ' - ', weekdayname, 'IS OPEN ', $event.target.checked)

    this.days.forEach(day => {
      if (weekdayid === day._id && $event.target.checked === true) {
        day.isOpen = true;
        console.log('DAY IS OPEN ', day.isOpen)
      } else if (weekdayid === day._id && $event.target.checked === false) {
        day.isOpen = false;
      }

    });
    // this.days = $event.target.checked;
  }

  openAmStart(dayid) {
    console.log('DAY ID ', dayid)
    const amazingTimePicker = this.atp.open({
      // time: this.selectedTime,
      time: this.days[dayid].operatingHoursAmStart,
      theme: 'dark',
      arrowStyle: {
        background: 'red',
        color: 'white'
      }
    });
    amazingTimePicker.afterClose().subscribe(time => {
      this.days[dayid].operatingHoursAmStart = time;
      console.log('SELECTED TIME  ', this.days[dayid].operatingHoursAmStart)
      console.log('DAYS  ', this.days)
    });
  }

  openAmEnd(dayid) {
    console.log('DAY ID ', dayid)
    const amazingTimePicker = this.atp.open({
      // time: this.selectedTime,
      time: this.days[dayid].operatingHoursAmEnd,
      theme: 'dark',
      arrowStyle: {
        background: 'red',
        color: 'white'
      }
    });
    amazingTimePicker.afterClose().subscribe(time => {
      this.days[dayid].operatingHoursAmEnd = time;
      console.log('SELECTED TIME  ', this.selectedTime)
    });
  }

  openPmStart(dayid) {
    console.log('DAY ID ', dayid)
    const amazingTimePicker = this.atp.open({
      // time: this.selectedTime,
      time: this.days[dayid].operatingHoursPmStart,
      theme: 'dark',
      arrowStyle: {
        background: 'red',
        color: 'white'
      }
    });
    amazingTimePicker.afterClose().subscribe(time => {
      this.days[dayid].operatingHoursPmStart = time;
      console.log('SELECTED TIME  ', this.selectedTime)
    });
  }
  openPmEnd(dayid) {
    console.log('DAY ID ', dayid)
    const amazingTimePicker = this.atp.open({
      // time: this.selectedTime,
      time: this.days[dayid].operatingHoursPmEnd,
      theme: 'dark',
      arrowStyle: {
        background: 'red',
        color: 'white'
      }
    });
    amazingTimePicker.afterClose().subscribe(time => {
      this.days[dayid].operatingHoursPmEnd = time;
      console.log('SELECTED TIME  ', this.selectedTime)
    });
  }
}
