import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/auth.service';

import { ProjectService } from '../services/project.service';
import { UsersService } from '../services/users.service';

import { AmazingTimePickerService } from 'amazing-time-picker';
import { TranslateService } from '@ngx-translate/core';

// import * as moment from 'moment';
import * as moment from 'moment-timezone'

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
    {
      _id: '0',
      weekday: 'Sunday',
      isOpen: false,
      isOpenPm: true,
      operatingHours: '',
      operatingHoursAmStart: '',
      operatingHoursAmEnd: '',
      operatingHoursPmStart: '',
      operatingHoursPmEnd: ''
    },
    // tslint:disable-next-line:max-line-length
    {
      _id: '1',
      weekday: 'Monday',
      isOpen: false,
      isOpenPm: true,
      operatingHours: '',
      operatingHoursAmStart: '',
      operatingHoursAmEnd: '',
      operatingHoursPmStart: '',
      operatingHoursPmEnd: ''
    },
    // tslint:disable-next-line:max-line-length
    {
      _id: '2',
      weekday: 'Tuesday',
      isOpen: false,
      isOpenPm: true,
      operatingHours: '',
      operatingHoursAmStart: '',
      operatingHoursAmEnd: '',
      operatingHoursPmStart: '',
      operatingHoursPmEnd: ''
    },
    // tslint:disable-next-line:max-line-length
    {
      _id: '3',
      weekday: 'Wednesday',
      isOpen: false,
      isOpenPm: true,
      operatingHours: '',
      operatingHoursAmStart: '',
      operatingHoursAmEnd: '',
      operatingHoursPmStart: '',
      operatingHoursPmEnd: ''
    },
    // tslint:disable-next-line:max-line-length
    {
      _id: '4',
      weekday: 'Thursday',
      isOpen: false,
      isOpenPm: true,
      operatingHours: '',
      operatingHoursAmStart: '',
      operatingHoursAmEnd: '',
      operatingHoursPmStart: '',
      operatingHoursPmEnd: ''
    },
    // tslint:disable-next-line:max-line-length
    {
      _id: '5',
      weekday: 'Friday',
      isOpen: false,
      isOpenPm: true,
      operatingHours: '',
      operatingHoursAmStart: '',
      operatingHoursAmEnd: '',
      operatingHoursPmStart: '',
      operatingHoursPmEnd: ''
    },
    // tslint:disable-next-line:max-line-length
    {
      _id: '6',
      weekday: 'Saturday',
      isOpen: false,
      isOpenPm: true,
      operatingHours: '',
      operatingHoursAmStart: '',
      operatingHoursAmEnd: '',
      operatingHoursPmStart: '',
      operatingHoursPmEnd: ''
    }
  ];

  // daysList: any;
  IS_OPEN = false;

  projectid: string;
  project_operatingHours: any;
  public selectedTime: any;
  projectOffsetfromUtcZero: any;
  offsetDirectionFromUtcZero: any;
  isActiveOperatingHours: boolean;
  browser_lang: string;
  IS_CLOSED_IN_PM: boolean;
  timezone_name: string;

  constructor(
    private auth: AuthService,
    private projectService: ProjectService,
    private usersService: UsersService,
    private atp: AmazingTimePickerService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    console.log('DAYS ', this.days);
    this.getCurrentProject();
    // this.daysList = this.days
    this.auth.checkRole();

    this.projectOffsetfromUtcZero = this.getPrjctOffsetHoursfromTzOffset();
    console.log('»» »» HOURS COMP - PRJCT OFFSET FROM UTC 0::: ', this.projectOffsetfromUtcZero);

    this.browser_lang = this.translate.getBrowserLang();
    console.log('»» »» HOURS COMP - BROWSER LANGUAGE ', this.browser_lang);


    // console.log('TIMEZONE NAME ', Intl.DateTimeFormat().resolvedOptions().timeZone)

    this.timezone_name = moment.tz.guess();
    console.log('»» »» HOURS COMP - TIMEZONE NAME ', this.timezone_name);

    // const timezone_offset = moment.tz(timezone_name).utcOffset()
    // const timezone_offset = moment.tz(moment.utc(), 'America/New_York').utcOffset()
    const timezone_offset = moment.tz(moment.utc(), 'Europe/Rome').utcOffset()

    console.log('»» »» HOURS COMP - TIMEZONE * OFFSET * ', timezone_offset);
  }

  getPrjctOffsetHoursfromTzOffset() {
    // The getTimezoneOffset() method returns the time difference between UTC time and local time, in minutes
    // e.g.: -120
    const offset = new Date().getTimezoneOffset();
    console.log('»» »» HOURS COMP - GET CURRENT DATE', new Date());


    console.log('»» »» HOURS COMP - GET TIMEZONE OFFSET ', offset);

    const a = moment.tz('2013-11-18 11:55', 'Asia/Taipei');
    const testdate = a.format();
    console.log('TEST DATE  ', testdate);
    const _testdate = new Date(testdate);
    console.log('NEW TEST DATE ', _testdate);
    console.log('OFFSET OF TEST DATE  ', _testdate.getTimezoneOffset())

    // moment.tz.zone('America/Los_Angeles').utcOffset(1403465838805);
    // NEW  FOR DEBUG ==============================================
    //  -3 | -2 | -1 | UTC | +1 | +2 | +3 |
    if (offset < 0) {
      // EXAMPLE -2 hours after UTC
      console.log(offset / 60 + ' hours after UTC');
    } else {
      document.write(offset / 60 + ' hours before UTC')
    }

    const offsetStr = offset.toString();
    console.log('»» »» HOURS COMP - GET TIMEZONE OFFSET (AS STRING) ', offsetStr);

    const offsetOperator = offsetStr.substring(0, 1);
    console.log('»» »» HOURS COMP - TIMEZONE OFFSET OPERATOR ', offsetOperator);
    // the purpose is to transform the timezone from -120 into the form +2
    // that is, transform the difference in minutes between the local time of the client and the utc in the form UTC +/- (hours)
    if (offsetOperator === '-') {
      this.offsetDirectionFromUtcZero = '+';
      console.log('»» »» HOURS COMP - TIMEZONE OFFSET DIRECTION from UTC 0: ', this.offsetDirectionFromUtcZero);
    } else if (offsetOperator === '+') {
      this.offsetDirectionFromUtcZero = '-';
      console.log('»» »» HOURS COMP - TIMEZONE OFFSET DIRECTION from UTC 0: ', this.offsetDirectionFromUtcZero);
    }
    const offsetMinutesAsString = offsetStr.substr(1);
    const offsetMinutes = parseInt(offsetMinutesAsString, 0);
    console.log('»» »» HOURS COMP - TIMEZONE OFFSET MINUTES: ', offsetMinutes);
    const offsetHours = offsetMinutes / 60;
    console.log('»» »» HOURS COMP - TIMEZONE OFFSET HOURS: ', offsetHours);

    return this.offsetDirectionFromUtcZero + offsetHours;
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe(project => {
      if (project) {
        this.projectid = project._id;
        console.log('00 -> HOURS project from AUTH service subscription  ', project);

        console.log('00 -> HOURS project ID PROJECT  ', this.projectid);

        if (this.projectid) {
          this.getProjectById();
        }
      }
    });
  }

  getProjectById() {
    this.projectService.getMongDbProjectById(this.projectid).subscribe(
      (project: any) => {
        console.log('≈≈≈≈ > HOURS comp - on init PROJECT (DETAILS) BY ID - PROJECT OBJECT: ', project);

        if (project) {
          this.project_operatingHours = JSON.parse(project.operatingHours);
          console.log('≈≈≈≈ > HOURS comp - on init PROJECT OPERARITING HOURS: ', this.project_operatingHours);

          // used for the checkbox "Activate operating hours"

          this.isActiveOperatingHours = project.activeOperatingHours;
          console.log('≈≈≈≈ > HOURS comp - on init PROJECT OPERARITING HOURS IS ACTIVE: ',
            this.isActiveOperatingHours
          );

          // SE NEL OGGETTO OPERATING HOURS DEL PROGETTO E PRESENTE LA KEY CHE INDICA IL GIORNO AGGIUNGO OPERATING
          // HOURS ALL OBJECT DAY (CREO COSì L'OGGETTO DAYS CHE USO NEL TEMPLATE)
          let i;
          for (i = 0; i < 7; i++) {
            // console.log('CICLO I =  ', i)
            if (this.project_operatingHours.hasOwnProperty(i)) {
              console.log(this.days[i].weekday, ' IS SETTED');
              console.log('operating hours start ', this.project_operatingHours[i]);

              this.days[i].operatingHours = this.project_operatingHours[i];

              this.days[i].isOpen = true;

              this.days[i].operatingHoursAmStart = this.project_operatingHours[i][0].start;
              this.days[i].operatingHoursAmEnd = this.project_operatingHours[i][0].end;

              if (this.project_operatingHours[i][1]) {
                this.days[i].operatingHoursPmStart = this.project_operatingHours[i][1].start;
                this.days[i].operatingHoursPmEnd = this.project_operatingHours[i][1].end;
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
              console.log('DAYS ON INIT ', this.days);
              if (this.days[i].operatingHoursPmStart === '') {
                this.days[i].isOpenPm = false;
              }
              //   }
              // });
            } else {
              console.log(this.days[i].weekday, ' IS ! NOT SETTED ');
            }
          }
        }
      },
      error => {
        console.log('HOURS COMP - PROJECT BY ID - ERROR ', error);
      },
      () => {
        console.log('HOURS COMP - PROJECT BY ID - COMPLETE ');
      }
    );
  }

  onChange($event) {
    this.activeOperatingHours = $event.target.checked;
    console.log('OPERATING HOURS ARE ACTIVE ', this.activeOperatingHours);
  }

  // UPDATE PROJECT OPERATING HOURS
  updateProjectOperatingHours() {
    console.log('ON UPDATE OPERATING HOURS - OPERATING HOURS ARE ACTIVE ', this.activeOperatingHours);
    console.log('ON UPDATE OPERATING HOURS - OPERATING HOURS ', this.operatingHours);

    this.projectService
      .updateProjectOperatingHours(this.activeOperatingHours, this.operatingHours)
      .subscribe(project => {
        console.log('»»»»»»» UPDATED PROJECT ', project);
      });
  }

  testAvailableProjectUserConsideringProjectOperatingHours() {
    const offset = new Date().getTimezoneOffset();
    console.log('OFFEST ', offset);

    const time = new Date('2001-01-01T06:00:00+08:00');
    console.log('TIME ', time);
    console.log('TIME ', time.toUTCString());

    this.usersService
      .getAvailableProjectUsersConsideringOperatingHours()
      .subscribe(available_project => {
        console.log('»»»»»»» NEW - GET AVAILABLE PROJECT USERS (CONSIDERING OPERATING HOURS)', available_project);
      });
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
    // tslint:disable-next-line:max-line-length
    console.log('CLICKED CHANGE STATUS OPENED/CLOSED for the WEEKDAY ID ', weekdayid, ' - ', weekdayname, 'IS OPEN ', $event.target.checked);

    this.days.forEach(day => {
      if (weekdayid === day._id && $event.target.checked === true) {
        day.isOpen = true;
        console.log('DAY IS OPEN ', day.isOpen);
        console.log('DAYS ', this.days);
        day.operatingHoursAmStart = '09:00';
        day.operatingHoursAmEnd = '13:00';
        day.operatingHoursPmStart = '14:00';
        day.operatingHoursPmEnd = '18:00';
        console.log('AM START ', day.operatingHoursAmStart, 'AM END ', day.operatingHoursAmEnd);
        console.log('PM START ', day.operatingHoursPmStart, 'PM END ', day.operatingHoursPmEnd);

        // SET to TRUE isOpenPm
        day.isOpenPm = true;
      } else if (weekdayid === day._id && $event.target.checked === false) {
        day.isOpen = false;
        console.log('DAYS ', this.days);
        day.operatingHoursAmStart = '';
        day.operatingHoursAmEnd = '';
        day.operatingHoursPmStart = '';
        day.operatingHoursPmEnd = '';
      }
    });
    // this.days = $event.target.checked;
  }

  // open(dayid) {
  //   console.log('DAY ID ', dayid)
  //   const amazingTimePicker = this.atp.open({
  //     // time: this.selectedTime,
  //     time: this.days[dayid].operatingHoursAmStart,
  //     theme: 'dark',
  //     arrowStyle: {
  //       background: 'red',
  //       color: 'white'
  //     }
  //   });
  //   amazingTimePicker.afterClose().subscribe(time => {
  //     this.days[dayid].operatingHoursAmStart = time;
  //     console.log('SELECTED TIME  ', this.days[dayid].operatingHoursAmStart)
  //     console.log('DAYS  ', this.days)
  //   });
  // }

  save() {
    console.log('WHEN SAVE - DAYS ', this.days);

    const operatingHoursUpdated = {};

    let j;
    for (j = 0; j < 7; j++) {
      if (this.days[j].isOpen === true) {
        // tslint:disable-next-line:max-line-length
        operatingHoursUpdated[j] = [
          {
            start: this.days[j].operatingHoursAmStart, end: this.days[j].operatingHoursAmEnd
          },
          {
            start: this.days[j].operatingHoursPmStart, end: this.days[j].operatingHoursPmEnd
          }
        ];
      }
    }

    // e.g.: operatingHoursUpdated = '"tz": "+2"'
    operatingHoursUpdated['tz'] = this.projectOffsetfromUtcZero;

    // e.g.: Europe/Rome
    operatingHoursUpdated['tzname'] = this.timezone_name;
    console.log('OPERATING HOURS UPDATED: ', operatingHoursUpdated);
    const operatingHoursUpdatedStr = JSON.stringify(operatingHoursUpdated);
    this.projectService
      .updateProjectOperatingHours(
        this.activeOperatingHours,
        operatingHoursUpdatedStr
      )
      .subscribe(project => {
        console.log('»»»»»»» UPDATED PROJECT ', project);
      });
  }

  onChangeAmStartFromArrow(time, weekdayid) {
    console.log('ON CHANGE AM START FROM  UP/DOWN ARROW - DAY ID', weekdayid, ' - TIME: ', time);
    this.days[weekdayid].operatingHoursAmStart = time;
  }

  onChangeAmEndFromArrow(time, weekdayid) {
    console.log('ON CHANGE AM END FROM  UP/DOWN ARROW - DAY ID', weekdayid, ' - TIME: ', time);
    this.days[weekdayid].operatingHoursAmEnd = time;
  }

  onChangePmStartFromArrow(time, weekdayid) {
    console.log('ON CHANGE PM START FROM  UP/DOWN ARROW - DAY ID:', weekdayid, ' - TIME: ', time);
    this.days[weekdayid].operatingHoursPmStart = time;

    // IF THE PM START TIME IS EMPTY SET TO EMPTY ALSO THE PM END TIME
    if (this.days[weekdayid].operatingHoursPmStart === '') {
      this.days[weekdayid].operatingHoursPmEnd = '';

      // used to set the 'disabled class' to the buttons and input when the pm start time and pm end time are empty
      this.days[weekdayid].isOpenPm = false;
    } else {
      this.days[weekdayid].isOpenPm = true;
    }
  }

  onChangePmEndFromArrow(time, weekdayid) {
    console.log('ON CHANGE PM END FROM  UP/DOWN ARROW - DAY ID: ', weekdayid, ' - TIME: ', time);
    this.days[weekdayid].operatingHoursPmEnd = time;
  }

  close_Pm(dayid) {
    console.log('CLOSE PM FOR THE DAY ID  ', dayid);
    this.days[dayid].operatingHoursPmStart = '';
    this.days[dayid].operatingHoursPmEnd = '';
    this.days[dayid].isOpenPm = false;
  }

  open_Pm(dayid) {
    console.log('OPEN PM FOR THE DAY ID  ', dayid);
    this.days[dayid].isOpenPm = true;
    this.days[dayid].operatingHoursPmStart = '14:00';
    this.days[dayid].operatingHoursPmEnd = '18:00';
  }

  openAmStart(dayid) {
    console.log('DAY ID ', dayid);
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
      console.log('SELECTED TIME  ', this.days[dayid].operatingHoursAmStart);
      console.log('DAYS  ', this.days);
    });
  }

  openAmEnd(dayid) {
    console.log('DAY ID ', dayid);
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
      console.log('SELECTED TIME  ', this.days[dayid].operatingHoursAmEnd);
      console.log('DAYS  ', this.days);
    });
  }

  openPmStart(dayid) {
    console.log('DAY ID ', dayid);
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
      console.log('SELECTED TIME  ', this.days[dayid].operatingHoursPmStart);
      console.log('DAYS  ', this.days);

      // IF THE PM START TIME IS not EMPTY SET to TRUE isOpenPm
      if (this.days[dayid].operatingHoursPmStart !== '') {
        this.days[dayid].isOpenPm = true;
      }
    });
  }

  openPmEnd(dayid) {
    console.log('DAY ID ', dayid);
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
      console.log('SELECTED TIME  ', this.days[dayid].operatingHoursPmEnd);
      console.log('DAYS  ', this.days);

      // IF THE PM END TIME IS not EMPTY SET to TRUE isOpenPm
      if (this.days[dayid].operatingHoursPmEnd !== '') {
        this.days[dayid].isOpenPm = true;
      }
    });
  }
}
