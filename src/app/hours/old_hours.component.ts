import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild } from '@angular/core';
import { AuthService } from '../core/auth.service';

import { ProjectService } from '../services/project.service';
import { UsersService } from '../services/users.service';

// import { AmazingTimePickerService } from 'amazing-time-picker';
import { TranslateService } from '@ngx-translate/core';

// import * as moment from 'moment';
import * as moment from 'moment-timezone'
import { NotifyService } from '../core/notify.service';

import { Router } from '@angular/router';
import { Project } from '../models/project-model';
import { AppConfigService } from '../services/app-config.service';
import { LoggerService } from '../services/logger/logger.service';
import { FormControl } from "@angular/forms";
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NewSlotModalComponent } from './modals/new-slot-modal/new-slot-modal.component';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'appdashboard-hours',
  templateUrl: './old_hours.component.html',
  styleUrls: ['./hours.component.scss'],
  encapsulation: ViewEncapsulation.None
})


export class HoursComponent implements OnInit, OnDestroy {

  // time picker
  formControlItem: FormControl = new FormControl("");
  required: boolean = !1;
  @ViewChild("timepicker") timepicker: any;



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
  projectname: string;
  project_operatingHours: any;
  project_timeSlots: any;
  public selectedTime: any;
  projectOffsetfromUtcZero: any;
  offsetDirectionFromUtcZero: any;
  isActiveOperatingHours: boolean;
  browser_lang: string;
  IS_CLOSED_IN_PM: boolean;
  timezone_name: string;
  current_prjct_timezone_name: string;
  current_prjct_UTC: any;
  timezone_NamesAndUTC_list: any;
  timezoneNameForTooltip: any;
  timezoneUTCOffsetForTooltip: any;
  displayModalUpdatingOperatingHours = 'none'
  SHOW_CIRCULAR_SPINNER = false;
  UPDATE_HOURS_ERROR = false;
  TIMEZONE_NAME_IS_NULL = false;
  timeZoneSelectedIsUnlikeCurrentTimezone: boolean;

  showSpinner = true;
  public_Key: string;
  IS_OPEN_SETTINGS_SIDEBAR: boolean;
  // hasSaved: boolean
  isChromeVerGreaterThan100: boolean;
  USER_ROLE: string;

  timeSlotsArray: Array<any> = [];

  constructor(
    private auth: AuthService,
    private projectService: ProjectService,
    private usersService: UsersService,
    // private atp: AmazingTimePickerService,
    private translate: TranslateService,
    public notify: NotifyService,
    private router: Router,
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.logger.log('[HOURS] - on init DAYS ', this.days);

    // getCurrentProject > getProjectById > BUILD THE OBJECT DAYS
    this.getCurrentProject();
    this.getOSCODE();
    // this.daysList = this.days
   

    // this.projectOffsetfromUtcZero = this.getPrjctOffsetHoursfromTzOffset();
    // this.logger.log('[HOURS] - PRJCT OFFSET FROM UTC 0::: ', this.projectOffsetfromUtcZero);

    this.browser_lang = this.translate.getBrowserLang();
    this.logger.log('[HOURS] - BROWSER LANGUAGE ', this.browser_lang);


    this.current_prjct_UTC = moment.tz(this.current_prjct_timezone_name).format('Z');
    this.logger.log('[HOURS] - CURRENT PROJECT TIMEZONE-UTC ', this.current_prjct_UTC);

    // current TIMEZONE NAME - USED IN THE BOX 'You are currently at:' and
    // to set to the current timezone the timezone selected in the option input
    this.timezoneNameForTooltip = moment.tz.guess();
    this.logger.log('[HOURS] - TIMEZONE NAME FOR TOOLTIP  ', this.timezoneNameForTooltip);

    // current TIMEZONE OFFSET - USED IN THE BOX 'You are currently at:'
    this.timezoneUTCOffsetForTooltip = moment.tz(this.timezoneNameForTooltip).format('Z')
    this.logger.log('[HOURS] - TIMEZONE OFFSET FOR TOOLTIP  ', this.timezoneUTCOffsetForTooltip);


    /* ====== DEBUG ====== */
    // const timezone_offset = moment.tz(timezone_name).utcOffset()
    // const timezone_offset = moment.tz(moment.utc(), 'America/New_York').utcOffset()
    // const timezone_offset = moment.tz(moment.utc(), 'EST5EDT').utcOffset()
    // const timezone_offset = moment.tz(moment.utc(), 'Europe/Rome').utcOffset()
    // this.logger.log('»» »» HOURS COMP - TIMEZONE OOOFFSET ', timezone_offset);

    const timezone_names = moment.tz.names();
    // this.logger.log('»» »» HOURS COMP - TIMEZONE NAMES ', timezone_names);

    this.timezone_NamesAndUTC_list = []
    timezone_names.forEach(timezone_name => {
      const tzNameAndUTC = '(UTC ' + moment.tz(timezone_name).format('Z') + ') ' + timezone_name
      // this.logger.log('(UTC ', moment.tz(timezone_name).format('Z'), ') ', timezone_name);
      this.timezone_NamesAndUTC_list.push({ tz: tzNameAndUTC, value: timezone_name })

    });
    this.logger.log('[HOURS] - TIMEZONE NAME & OFFSET ARRAY ', this.timezone_NamesAndUTC_list);
    this.listenSidebarIsOpened();
    this.getBrowserVersion();
    this.getUserRole()
  }

  getUserRole() {
    this.usersService.project_user_role_bs
      .subscribe((userRole) => {
        this.logger.log('[HOURS] - $UBSCRIPTION TO USER ROLE »»» ', userRole)
        this.USER_ROLE = userRole;
      })
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => { 
     this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    //  this.logger.log("[WS-REQUESTS-LIST] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  } 

  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[HOURS] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }


  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    // this.logger.log('[HOURS] AppConfigService getAppConfig public_Key', this.public_Key);
    let keys = this.public_Key.split("-");
    // this.logger.log('[HOURS] PUBLIC-KEY keys', keys)
    keys.forEach(key => {
      // this.logger.log('HOURS COMP public_Key key', key)
      if (key.includes("OPH")) {
        // this.logger.log('[HOURS] PUBLIC-KEY - key', key);
        let oph = key.split(":");
        // this.logger.log('[HOURS] PUBLIC-KEY - oph key&value', oph);
        if (oph[1] === "F") {
          this.router.navigate([`project/${this.projectid}/unauthorized`]);
        }
      }
    });


    if (!this.public_Key.includes("OPH")) {
      // this.logger.log('PUBLIC-KEY (Home) - key.includes("OPH")', this.public_Key.includes("OPH"));
      this.router.navigate([`project/${this.projectid}/unauthorized`]);
    }
  }

  ngOnDestroy() {
    // this.logger.log('[HOURS] - NG-ON-DESTROY ')

  }

  setProjectToYourTimezone() {
    this.logger.log('[HOURS] - SET TIMEZONE TO YOUR TIMEZONE ', this.timezoneNameForTooltip);
    this.current_prjct_timezone_name = this.timezoneNameForTooltip

    if (this.current_prjct_timezone_name !== this.timezoneNameForTooltip) {
      this.timeZoneSelectedIsUnlikeCurrentTimezone = true;
      this.logger.log('[HOURS] - TIMEZONE SELECTED id != OF CURRENT TIMEZONE ? ', this.timeZoneSelectedIsUnlikeCurrentTimezone);
    } else {
      this.timeZoneSelectedIsUnlikeCurrentTimezone = false;
    }
  }

  setSelectedTimeZone(): void {
    this.logger.log('[HOURS] - TIMEZONE SELECTED ', this.current_prjct_timezone_name);

    if (this.current_prjct_timezone_name !== this.timezoneNameForTooltip) {
      this.timeZoneSelectedIsUnlikeCurrentTimezone = true;
      this.logger.log('[HOURS] - TIMEZONE SELECTED id != OF CURRENT TIMEZONE ? ', this.timeZoneSelectedIsUnlikeCurrentTimezone);
    } else {
      this.timeZoneSelectedIsUnlikeCurrentTimezone = false;
    }
  }

  // !! NO MORE USED
  getPrjctOffsetHoursfromTzOffset() {
    // The getTimezoneOffset() method returns the time difference between UTC time and local time, in minutes
    // e.g.: -120
    const offset = new Date().getTimezoneOffset();
    this.logger.log('[HOURS] - GET CURRENT DATE', new Date());


    this.logger.log('[HOURS] - GET TIMEZONE OFFSET ', offset);

    const a = moment.tz('2013-11-18 11:55', 'Asia/Taipei');
    const testdate = a.format();
    this.logger.log('[HOURS] - TEST DATE  ', testdate);
    const _testdate = new Date(testdate);
    this.logger.log('[HOURS] - NEW TEST DATE ', _testdate);
    this.logger.log('[HOURS] - OFFSET OF TEST DATE  ', _testdate.getTimezoneOffset())

    // moment.tz.zone('America/Los_Angeles').utcOffset(1403465838805);
    // NEW  FOR DEBUG ==============================================
    //  -3 | -2 | -1 | UTC | +1 | +2 | +3 |
    if (offset < 0) {
      // EXAMPLE -2 hours after UTC
      this.logger.log(offset / 60 + ' hours after UTC');
    } else {
      document.write(offset / 60 + ' hours before UTC')
    }

    const offsetStr = offset.toString();
    this.logger.log('[HOURS] - GET TIMEZONE OFFSET (AS STRING) ', offsetStr);

    const offsetOperator = offsetStr.substring(0, 1);
    this.logger.log('[HOURS] - TIMEZONE OFFSET OPERATOR ', offsetOperator);
    // the purpose is to transform the timezone from -120 into the form +2
    // that is, transform the difference in minutes between the local time of the client and the utc in the form UTC +/- (hours)
    if (offsetOperator === '-') {
      this.offsetDirectionFromUtcZero = '+';
      this.logger.log('[HOURS] - TIMEZONE OFFSET DIRECTION from UTC 0: ', this.offsetDirectionFromUtcZero);
    } else if (offsetOperator === '+') {
      this.offsetDirectionFromUtcZero = '-';
      this.logger.log('[HOURS] - TIMEZONE OFFSET DIRECTION from UTC 0: ', this.offsetDirectionFromUtcZero);
    }
    const offsetMinutesAsString = offsetStr.substr(1);
    const offsetMinutes = parseInt(offsetMinutesAsString, 0);
    this.logger.log('[HOURS] - TIMEZONE OFFSET MINUTES: ', offsetMinutes);
    const offsetHours = offsetMinutes / 60;
    this.logger.log('[HOURS] - TIMEZONE OFFSET HOURS: ', offsetHours);

    return this.offsetDirectionFromUtcZero + offsetHours;
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe(project => {
      if (project) {
        this.projectid = project._id;
        this.projectname = project.name;
        this.logger.log('[HOURS] - PROJECT (from AUTH SERV subscription) ', project);
        this.logger.log('[HOURS] - PROJECT: PROJECT ID ', this.projectid);
        this.logger.log('[HOURS] - PROJECT: PROJECT NAME ', this.projectname);

        if (this.projectid) {
          this.getProjectById();
        }
      }
    });
  }

  /* --------------------------------------------------------------------------------------------------
   * GET THE PROJECT BY ID AND WITH THE DATA OF OPERATING HOURS (PRESENT OR LESS)
   * BUILD THE OBJECT DAYS
   * --------------------------------------------------------------------------------------------------*/
  getProjectById() {
    this.projectService.getProjectById(this.projectid).subscribe(
      (project: any) => {
        this.logger.log('[HOURS] - on init PROJECT (DETAILS) BY ID - PROJECT OBJECT: ', project);

        if (project) {
          this.logger.log('[HOURS] - on init PROJECT OPERATING HOURS (first to assign): ', project.operatingHours);

          /*  CHECK IF THE PROPERTY activeOperatingHours IS DEFINED */
          // (e.g. THE VALUE OF activeOperatingHours WILL BE 'undefined' FOR A PROJECT CREATED BEFORE
          // THE IMPLEMENTATION IN CHAT21-NODEJS-API > ROUTES > PROJECT OF THE PROPERTY activeOperatingHours = false)
          if (project.activeOperatingHours !== undefined) {
            // used for the checkbox "Activate operating hours"
            this.isActiveOperatingHours = project.activeOperatingHours;
            this.logger.log('[HOURS] - on init PROJECT OPERATING HOURS IS ACTIVE: ', this.isActiveOperatingHours);
          } else {
            this.logger.log('[HOURS] - on init PROJECT OPERATING HOURS IS ACTIVE: ', this.isActiveOperatingHours);
            // this.isActiveOperatingHours = false
          }

          /*  CHECK IF THE OBJECT activeOperatingHours IS DEFINED */
          // (e.g. FOR NEW PROJECT THE OBJECT activeOperatingHours WILL BE ALWAYS 'undefined'
          // NOTE: if activeOperatingHours is 'undefined' the value of the timezone name selected is setted equal to
          // the current tiemzone get with moment (see the else block)
          if (project.operatingHours !== undefined) {
            this.project_operatingHours = JSON.parse(project.operatingHours);
            this.logger.log('[HOURS]- on init PROJECT OPERATING HOURS: ', this.project_operatingHours);
            this.logger.log('[HOURS] - on init PROJECT TIMEZONE NAME: ', this.project_operatingHours['tzname']);

            this.current_prjct_timezone_name = this.project_operatingHours['tzname'];

            // GET THE TIMEZONE NAME FROM THE OBJECT OPERATING HOURS PF THE PROJECT
            // IF IT IS != BY THE CURRENT TIMEZONE SET TO TRUE timeZoneSelectedIsUnlikeCurrentTimezone
            // USED TO DISABLED / ENABLED THE BTN 'SET PROJWCT TIMEZONE TO CURRENT TIMEZONE'

            if (this.current_prjct_timezone_name !== this.timezoneNameForTooltip) {
              this.timeZoneSelectedIsUnlikeCurrentTimezone = true
              // tslint:disable-next-line:max-line-length
              this.logger.log('[HOURS] - on init TIMEZONE SELECTED id != OF CURRENT TIMEZONE? ', this.timeZoneSelectedIsUnlikeCurrentTimezone);

            } else {
              this.timeZoneSelectedIsUnlikeCurrentTimezone = false
            }



            // SE NEL OGGETTO OPERATING HOURS DEL PROGETTO E PRESENTE LA KEY CHE INDICA IL GIORNO AGGIUNGO OPERATING
            // HOURS ALL OBJECT DAY (CREO COSì L'OGGETTO DAYS CHE USO NEL TEMPLATE)
            let i: number;
            for (i = 0; i < 7; i++) {
              // this.logger.log('CICLO I =  ', i)
              if (this.project_operatingHours.hasOwnProperty(i)) {
                this.logger.log('[HOURS]', this.days[i].weekday, ' IS SETTED');
                this.logger.log('[HOURS] operating hours start ', this.project_operatingHours[i]);

                this.days[i].operatingHours = this.project_operatingHours[i];

                this.days[i].isOpen = true;

                this.days[i].operatingHoursAmStart = this.project_operatingHours[i][0].start;
                this.days[i].operatingHoursAmEnd = this.project_operatingHours[i][0].end;

                if (this.project_operatingHours[i][1]) {
                  this.days[i].operatingHoursPmStart = this.project_operatingHours[i][1].start;
                  this.days[i].operatingHoursPmEnd = this.project_operatingHours[i][1].end;
                }

                // this.project_operatingHours[i].forEach(hours => {
                //   this.logger.log('hours start  ', hours.start, 'hours end  ', hours.end)
                //   this.days[i].operatingHoursAmStart = hours.start
                //   this.days[i].operatingHoursAmEnd =  hours.end
                // });

                // this.days.forEach(day => {
                //   const num = i
                //   this.logger.log('operating hours ', this.project_operatingHours[i] )

                //   if (day._id === this.project_operatingHours[i]) {
                //     this.logger.log('day id ', day._id, ' i:  ', i)
                //     day.isOpen = true;
                //     day.operatingHours = this.project_operatingHours[i]
                //     // this.logger.log('DAY IS OPEN ', day.isOpen)
                this.logger.log('[HOURS] - DAYS ON INIT ', this.days);
                if (this.days[i].operatingHoursPmStart === '') {
                  this.days[i].isOpenPm = false;
                }
                //   }
                // });
              } else {
                this.logger.log('[HOURS] ', this.days[i].weekday, ' IS ! NOT SETTED ');
              }
            }
          } else {
            this.logger.log('[HOURS] - OPERATING HOURS ARE UNDEFINED', project.operatingHours);

            // IF THE OPERATING HOURS OBJECT IS UNDEFINED TAKES THE NAME OF THE TIMEZONE FROM THE MOMENT LIBRARY
            // note: current_prjct_timezone_name is the timezone name displayed as selected in the timezone deropdownlist
            this.current_prjct_timezone_name = moment.tz.guess();
            this.logger.log('[HOURS] - CURRENT PROJECT TIMEZONE-NAME DETECTED ', this.current_prjct_timezone_name);

            this.timeZoneSelectedIsUnlikeCurrentTimezone = false
          }

          if (project.timeSlots) {
            console.log("project.timeSlots: ", project.timeSlots)
            this.project_timeSlots = project.timeSlots;
            this.timeSlotsArray = Object.keys(project.timeSlots).map(key => ({
              id: key,
              ...project.timeSlots[key]
            }));
            console.log("this.timeSlotsArray: ", this.timeSlotsArray)
          } else {
            this.project_timeSlots = {};
            console.log("this.timeSlotsArray: ", this.timeSlotsArray)
          }

        }
      }, error => {
        this.showSpinner = false;
        this.logger.error('[HOURS] - GET PROJECT BY ID - ERROR ', error);
      }, () => {
        this.showSpinner = false;
        this.logger.log('[HOURS] - GET PROJECT BY ID - COMPLETE ');
      }
    );
  }

  onChange($event) {
    this.activeOperatingHours = $event.target.checked;
    // used in the template to change the checkbox label text
    this.isActiveOperatingHours = this.activeOperatingHours;
    this.logger.log('[HOURS] - onChange OPERATING HOURS ARE ACTIVE ', this.activeOperatingHours);
  }

  // !!! TEST METHOD - UPDATE PROJECT OPERATING HOURS - USED (FOR TEST) TO 'INIECT' THE JSON 'OPERATING HOURS' FROM THE INPUT FIELD
  // (see in the template)
  updateProjectOperatingHours() {
    this.logger.log('[HOURS] - ON UPDATE OPERATING HOURS - OPERATING HOURS ARE ACTIVE ', this.activeOperatingHours);
    this.logger.log('[HOURS] - ON UPDATE OPERATING HOURS - OPERATING HOURS ', this.operatingHours);

    this.projectService
      .updateProjectOperatingHours(this.activeOperatingHours, this.operatingHours)
      .subscribe(project => {
        this.logger.log('[HOURS]  »»»»»» UPDATED PROJECT ', project);
      });
  }

  testAvailableProjectUserConsideringProjectOperatingHours() {
    const offset = new Date().getTimezoneOffset();
    this.logger.log('[HOURS] - OFFEST ', offset);

    const time = new Date('2001-01-01T06:00:00+08:00');
    this.logger.log('[HOURS] - TIME ', time);
    this.logger.log('[HOURS] - TIME ', time.toUTCString());

    this.usersService
      .getAvailableProjectUsersConsideringOperatingHours()
      .subscribe(available_project => {
        this.logger.log('[HOURS] »»»»»»» NEW - GET AVAILABLE PROJECT USERS (CONSIDERING OPERATING HOURS)', available_project);
      }, (error) => {
        this.logger.error('[HOURS] »»»»»»» NEW - GET AVAILABLE PROJECT USERS (CONSIDERING OPERATING HOURS) - ERROR ', error);
        // this.showSpinner = false;
      }, () => {
        this.logger.log('[HOURS] »»»»»»» NEW - GET AVAILABLE PROJECT USERS (CONSIDERING OPERATING HOURS) * COMPLETE');
      });

  }


  onChangeOpenedClosedStatus($event, weekdayid: string, weekdayname: string) {
    // this.logger.log('XXXX ', $event.target.checked)
    // tslint:disable-next-line:max-line-length
    this.logger.log('[HOURS] - CLICKED CHANGE STATUS OPENED/CLOSED for the WEEKDAY ID ', weekdayid, ' - ', weekdayname, 'IS OPEN ', $event.target.checked);

    this.days.forEach(day => {
      if (weekdayid === day._id && $event.target.checked === true) {
        day.isOpen = true;
        this.logger.log('[HOURS] - DAY IS OPEN ', day.isOpen);
        this.logger.log('[HOURS] - DAYS ', this.days);
        day.operatingHoursAmStart = '09:00';
        day.operatingHoursAmEnd = '13:00';
        day.operatingHoursPmStart = '14:00';
        day.operatingHoursPmEnd = '18:00';
        this.logger.log('[HOURS] - AM START ', day.operatingHoursAmStart, 'AM END ', day.operatingHoursAmEnd);
        this.logger.log('[HOURS] - PM START ', day.operatingHoursPmStart, 'PM END ', day.operatingHoursPmEnd);

        // SET to TRUE isOpenPm
        day.isOpenPm = true;
      } else if (weekdayid === day._id && $event.target.checked === false) {
        day.isOpen = false;
        this.logger.log('[HOURS] - DAYS ', this.days);
        day.operatingHoursAmStart = '';
        day.operatingHoursAmEnd = '';
        day.operatingHoursPmStart = '';
        day.operatingHoursPmEnd = '';
      }
    });
    // this.days = $event.target.checked;
  }

  // open(dayid) {
  //   this.logger.log('DAY ID ', dayid)
  //   const amazingTimePicker = this.atp.open({
  //     // time: this.selectedTime,
  //     time: this.days[dayid].operatingHoursAmStart,
  //     theme: 'dark',
  //     arrowStyle: {
  //       background: 'red',
  //       color: 'white'
  //     }
  //   });
  //   onChangeOpenedClosedStatus.afterClose().subscribe(time => {
  //     this.days[dayid].operatingHoursAmStart = time;
  //     this.logger.log('SELECTED TIME  ', this.days[dayid].operatingHoursAmStart)
  //     this.logger.log('DAYS  ', this.days)
  //   });
  // }

  updateProject() {
    // this.hasSaved = true;

    this.displayModalUpdatingOperatingHours = 'block'
    this.SHOW_CIRCULAR_SPINNER = true;

    this.logger.log('[HOURS] - WHEN UPDATE PROJECT - DAYS ', this.days);

    const operatingHoursUpdated = {};

    let j;
    for (j = 0; j < 7; j++) {
      if (this.days[j].isOpen === true) {
        // tslint:disable-next-line:max-line-length
        operatingHoursUpdated[j] = [
          { start: this.days[j].operatingHoursAmStart, end: this.days[j].operatingHoursAmEnd },
          { start: this.days[j].operatingHoursPmStart, end: this.days[j].operatingHoursPmEnd }
        ];
      }
    }

    /* !!!! NO MORE USED */
    // e.g.: operatingHoursUpdated = '"tz": "+2"'
    // operatingHoursUpdated['tz'] = this.projectOffsetfromUtcZero;
    // this.logger.log('»»» PROJECT OFFSET FROM UTC : ', this.projectOffsetfromUtcZero);

    if (this.current_prjct_timezone_name !== null) {
      // e.g.: Europe/Rome
      operatingHoursUpdated['tzname'] = this.current_prjct_timezone_name;


      this.logger.log('[HOURS] - OPERATING HOURS UPDATED: ', operatingHoursUpdated);
      this.logger.log('[HOURS] - THIS TIMEZONE NAME: ', this.current_prjct_timezone_name);

      const operatingHoursUpdatedStr = JSON.stringify(operatingHoursUpdated);
      this.projectService
        .updateProjectOperatingHours(this.activeOperatingHours, operatingHoursUpdatedStr)
        .subscribe((project: any)=> {
          this.logger.log('[HOURS] - UPDATED PROJECT ', project);
          this.logger.log('[HOURS] - UPDATED PROJECT this.activeOperatingHours', this.activeOperatingHours);
          project['role'] = this.USER_ROLE;
          // const _project: Project = {
          //   _id: project['_id'],
          //   name: project['name'],
          //   profile_name: project['profile'].name,
          //   trial_expired: project['trialExpired'],
          //   trial_days_left: project['trialDaysLeft'],
          //   operatingHours: project['activeOperatingHours']
          // }

          this.logger.log('[HOURS] - UPDATED PROJECT _project set in storage', project);
          localStorage.setItem(project['_id'], JSON.stringify(project));
          // const _ project = project
          this.auth.projectSelected(project, 'hours')


        }, (error) => {
            this.logger.error('[HOURS] - UPDATE PROJECT - ERROR ', error);
            this.SHOW_CIRCULAR_SPINNER = false;
            this.UPDATE_HOURS_ERROR = true;
            this.notify.showWidgetStyleUpdateNotification('An error has occurred updating operating hours', 4, 'report_problem')
          },() => {
            this.logger.log('[HOURS] - UPDATE PROJECT * COMPLETE *');

            setTimeout(() => {
              this.SHOW_CIRCULAR_SPINNER = false
            }, 300);

            this.UPDATE_HOURS_ERROR = false;
            this.notify.showWidgetStyleUpdateNotification('operating hours has been successfully updated', 2, 'done');
          });

    } else {
      // the timezone name is null
      setTimeout(() => {
        this.SHOW_CIRCULAR_SPINNER = false
        this.UPDATE_HOURS_ERROR = true;
        this.TIMEZONE_NAME_IS_NULL = true;
      }, 300);


    }
  }

  closeModalOperatingHours() {
    this.displayModalUpdatingOperatingHours = 'none'
  }

  closeModalOperatingHoursHandler() {
    this.displayModalUpdatingOperatingHours = 'none'
  }

  onChangeAmStartFromArrow(time, weekdayid) {
    this.logger.log('[HOURS] - ON CHANGE AM START FROM  UP/DOWN ARROW - DAY ID', weekdayid, ' - TIME: ', time);
    this.days[weekdayid].operatingHoursAmStart = time;
  }

  onChangeAmEndFromArrow(time, weekdayid) {
    this.logger.log('[HOURS] - ON CHANGE AM END FROM  UP/DOWN ARROW - DAY ID', weekdayid, ' - TIME: ', time);
    this.days[weekdayid].operatingHoursAmEnd = time;
  }

  onChangePmStartFromArrow(time, weekdayid) {
    this.logger.log('[HOURS] - ON CHANGE PM START FROM  UP/DOWN ARROW - DAY ID:', weekdayid, ' - TIME: ', time);
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
    this.logger.log('[HOURS] - ON CHANGE PM END FROM  UP/DOWN ARROW - DAY ID: ', weekdayid, ' - TIME: ', time);
    this.days[weekdayid].operatingHoursPmEnd = time;
  }

  close_Pm(dayid) {
    this.logger.log('[HOURS] - CLOSE PM FOR THE DAY ID  ', dayid);
    this.days[dayid].operatingHoursPmStart = '';
    this.days[dayid].operatingHoursPmEnd = '';
    this.days[dayid].isOpenPm = false;
  }

  open_Pm(dayid) {
    this.logger.log('[HOURS] - OPEN PM FOR THE DAY ID  ', dayid);
    this.days[dayid].isOpenPm = true;
    this.days[dayid].operatingHoursPmStart = '14:00';
    this.days[dayid].operatingHoursPmEnd = '18:00';
  }

  openAmStart(dayid) {
    // this.logger.log('[HOURS] - openAmStart DAY ID ', dayid);
    // const amazingTimePicker = this.atp.open({
    //   // time: this.selectedTime,
    //   time: this.days[dayid].operatingHoursAmStart,
    //   theme: 'dark',
    //   arrowStyle: {
    //     background: 'red',
    //     color: 'white'
    //   }
    // });
    // amazingTimePicker.afterClose().subscribe(time => {
    //   this.days[dayid].operatingHoursAmStart = time;
    //   this.logger.log('[HOURS] - openAmStart SELECTED TIME  ', this.days[dayid].operatingHoursAmStart);
    //   this.logger.log('[HOURS] - openAmStart DAYS  ', this.days);
    // });
  }

  openAmEnd(dayid) {
    // this.logger.log('[HOURS] openAmEnd DAY ID ', dayid);
    // const amazingTimePicker = this.atp.open({
    //   // time: this.selectedTime,
    //   time: this.days[dayid].operatingHoursAmEnd,
    //   theme: 'dark',
    //   arrowStyle: {
    //     background: 'red',
    //     color: 'white'
    //   }
    // });
    // amazingTimePicker.afterClose().subscribe(time => {
    //   this.days[dayid].operatingHoursAmEnd = time;
    //   this.logger.log('[HOURS] - openAmEnd SELECTED TIME  ', this.days[dayid].operatingHoursAmEnd);
    //   this.logger.log('[HOURS] - openAmEnd DAYS  ', this.days);
    // });
  }

  openPmStart(dayid) {
    this.logger.log('[HOURS] - openPmStart DAY ID ', dayid);
    // const amazingTimePicker = this.atp.open({
    //   // time: this.selectedTime,
    //   time: this.days[dayid].operatingHoursPmStart,
    //   theme: 'dark',
    //   arrowStyle: {
    //     background: 'red',
    //     color: 'white'
    //   }
    // });
    // amazingTimePicker.afterClose().subscribe(time => {
    //   this.days[dayid].operatingHoursPmStart = time;
    //   this.logger.log('[HOURS] - openPmStart SELECTED TIME  ', this.days[dayid].operatingHoursPmStart);
    //   this.logger.log('[HOURS] - openPmStart DAYS  ', this.days);

    //   // IF THE PM START TIME IS not EMPTY SET to TRUE isOpenPm
    //   if (this.days[dayid].operatingHoursPmStart !== '') {
    //     this.days[dayid].isOpenPm = true;
    //   }
    // });
  }

  openPmEnd(dayid) {
    this.logger.log('[HOURS] - openPmEnd DAY ID ', dayid);
    // const amazingTimePicker = this.atp.open({
    //   // time: this.selectedTime,
    //   time: this.days[dayid].operatingHoursPmEnd,
    //   theme: 'dark',
    //   arrowStyle: {
    //     background: 'red',
    //     color: 'white'
    //   }
    // });
    // amazingTimePicker.afterClose().subscribe(time => {
    //   this.days[dayid].operatingHoursPmEnd = time;
    //   this.logger.log('[HOURS] - openPmEnd SELECTED TIME  ', this.days[dayid].operatingHoursPmEnd);
    //   this.logger.log('[HOURS] - openPmEnd DAYS  ', this.days);

    //   // IF THE PM END TIME IS not EMPTY SET to TRUE isOpenPm
    //   if (this.days[dayid].operatingHoursPmEnd !== '') {
    //     this.days[dayid].isOpenPm = true;
    //   }
    // });
  }


  // SLOTS SECTION - START
  onSelectGeneralOperatingHours() {
    console.log("onSelectGeneralOperatingHours clicked")
    this.getProjectById();
  }
  
  onSelectSlot(slot) {
    console.log("onSelectSlot slot: ", slot)
    this.isActiveOperatingHours = slot.active;
  }

  presentModalNewSlot() {
    const dialogRef = this.dialog.open(NewSlotModalComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '600px',

    });
    dialogRef.afterClosed().subscribe(body => {
      this.logger.log('[Modal Add content] Dialog body: ', body);
      if (body) {
        console.log("body after close: ", body)
        this.addSlot(body.slotName);
        //this.onAddKb(body)
      }
    });

  }

  addSlot(slot_name) {
    let new_slot = {
      name: slot_name,
      active: false,
      hours: null
    }

    let uuid = uuidv4();
    console.log("uuid: ", uuid)
    let short_uuid = uuid.substring(uuid.lastIndexOf('-') + 1)
    console.log("short_uuid: ", short_uuid)

    console.log("new_slot: ", new_slot);
    this.project_timeSlots[short_uuid] = new_slot;
    console.log("project timeSlots: ", this.project_timeSlots);
    this.saveSlot();
  }

  saveSlot() {
    let data = {
      timeSlots: this.project_timeSlots
    }
    console.log("data: ", data);
    this.projectService.updateProject(this.projectid, data).subscribe((updatedProject) => {
      console.log("updatedProject: ", updatedProject);
    }, (error) => {
      console.log("error updating project: ", error);
    })
  }

  // SLOTS SECTION - END
  




}
