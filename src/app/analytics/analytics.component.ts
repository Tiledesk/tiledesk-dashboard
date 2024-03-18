// tslint:disable:max-line-length
import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../core/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs'
// import * as Chartist from 'chartist';
// import * as moment from 'moment';
import moment from "moment"


import { HumanizeDurationLanguage, HumanizeDuration } from 'humanize-duration-ts';
import { Chart } from 'chart.js';
import { WsRequestsService } from '../services/websocket/ws-requests.service';
import { AppConfigService } from '../services/app-config.service';
import { LoggerService } from '../services/logger/logger.service';
import { AnalyticsService } from 'app/services/analytics.service';


@Component({
  selector: 'appdashboard-analytics2',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AnalyticsComponent implements OnInit, OnDestroy {

  selected: any;

  activeRequestsCount: number;
  unservedRequestsCount: number;
  servedRequestsCount: number;

  global_activeRequestsCount: number;
  global_unservedRequestsCount: number;
  global_servedRequestsCount: number;

  date: any;
  requests: any;
  users_id_array = [];
  users_reqs_dict = {};

  // users_reqs_dict_array: any;
  projectUsers: any;
  showSpinner = true;
  userProfileImageExist: boolean;
  id_project: any;
  // subscriptionToRequestService_RequestForAgent: Subscription;
  // subscriptionToRequestService_RequestsCount: Subscription;
  // subscriptionToRequestService_GlobalRequestsCount: Subscription;
  subscription: Subscription;
  lastMonthrequestsCount: number;
  monthNames: any;
  departments: any;
  waitingTime: any;
  translatedHoursString: string;
  translatedMinutesString: string;
  translatedSecondsString: string;

  dataSource: Object;
  xAxis: Object;
  yAxis: Object;
  titleSettings: Object;
  cellSettings: Object;
  legendSettings: any; // nk
  paletteSettings: Object;
  customData = [];
  xlabel_ita = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
  xlabel_eng = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  ylabel_ita = ['01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00']
  ylabel_eng = ['1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am', '12am', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm']
  weekday: any;
  hour: any;
  browserLang: string;

  langService: HumanizeDurationLanguage = new HumanizeDurationLanguage();
  humanizer: HumanizeDuration = new HumanizeDuration(this.langService);

  // avg time clock variable 
  numberAVGtime: string;
  unitAVGtime: string;
  responseAVGtime: string
  // avg time chart variable
  xValueAVGchart: any;
  yValueAVGchart: any;
  dateRangeAvg: string;
  // duration time clock variable
  numberDurationCNVtime: string;
  unitDurationCNVtime: string;
  responseDurationtime: string;
  // duration conversation chart variable
  xValueDurationConversation: any;
  yValueDurationConversation: any;
  dataRangeDuration: string;

  storageBucket: string;
  childToSelect: string
  isChromeVerGreaterThan100: boolean;
  /**
   * 
   * @param auth 
   * @param router 
   * @param translate 
   * @param analyticsService 
   * @param wsRequestsService 
   * @param appConfigService 
   * @param logger 
   */
  constructor(
    private auth: AuthService,
    private router: Router,
    private translate: TranslateService,
    private analyticsService: AnalyticsService,
    public wsRequestsService: WsRequestsService,
    public appConfigService: AppConfigService,
    private logger: LoggerService
  ) {
    this.selected = 'panoramica';//-> default active component
    this.logger.log('[ANALYTICS] !!! »»» HELLO ANALYTICS »»» ');
    // this.getAllUsersOfCurrentProject();
    this.getBrowserLangAndSwitchMonthName();
    this.getCurrentUrl();

    this.getBrowserVersion()
    // this.setMomentLocale()
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => { 
     this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    //  console.log("[BOT-CREATE] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
   }


  setMomentLocale() {
    this.browserLang = this.translate.getBrowserLang();
    // console.log('[ANALYTICS] - setMomentLocale browserLang', this.browserLang)

    const stored_preferred_lang = localStorage.getItem(this.auth.user_bs.value._id + '_lang')
    let dshbrd_lang = ''
    if (this.browserLang && !stored_preferred_lang) {
      dshbrd_lang = this.browserLang
    } else if (this.browserLang && stored_preferred_lang) {
      dshbrd_lang = stored_preferred_lang
    }
    this.logger.log('[ANALYTICS] - setMomentLocale dshbrd_lang', dshbrd_lang)
    moment.locale(dshbrd_lang)


    // console.log(moment.monthsShort('January')) 
    // console.log('[ANALYTICS] - setMomentLocale MONTHS', moment.monthsShort() )
    
    const arrayDay =  moment.weekdaysShort()
    arrayDay.push(arrayDay.shift())
    // console.log('[ANALYTICS] - setMomentLocale  weekdaysShort test', arrayDay )
    // console.log('[ANALYTICS] - setMomentLocale  weekdaysShort', moment.weekdaysShort(0) )
    // console.log('[ANALYTICS] - setMomentLocale  weekdaysShort', moment.weekdaysShort(1) )
    // console.log('[ANALYTICS] - setMomentLocale  weekdaysShort', moment.weekdaysShort(2) )
    // console.log('[ANALYTICS] - setMomentLocale  weekdaysShort', moment.weekdaysShort(3) )
    // console.log('[ANALYTICS] - setMomentLocale  weekdaysShort', moment.weekdaysShort(4) )
    // console.log('[ANALYTICS] - setMomentLocale  weekdaysShort', moment.weekdaysShort(5) )
    // console.log('[ANALYTICS] - setMomentLocale  weekdaysShort', moment.weekdaysShort(6) )
    // console.log('[ANALYTICS] - setMomentLocale hour',moment("01:00", "HH:mm").format("hh:mm A") )
    // console.log('[ANALYTICS] - setMomentLocale hour 2 ',moment("01:00", "HH:mm").format('LT') )
    // console.log('[ANALYTICS] - setMomentLocale hour 2 ',moment("02:00", "HH:mm").format('LT') )
    // console.log('[ANALYTICS] - setMomentLocale hour 2 ',moment("03:00", "HH:mm").format('LT') )
    // console.log('[ANALYTICS] - setMomentLocale hour 2 ',moment("04:00", "HH:mm").format('LT') )
    // console.log('[ANALYTICS] - setMomentLocale hour 2 ',moment("04:00", "HH:mm").format('LT') )
    // console.log('[ANALYTICS] - setMomentLocale hour 2 ',moment("05:00", "HH:mm").format('LT') )
    // console.log('[ANALYTICS] - setMomentLocale hour 2 ',moment("06:00", "HH:mm").format('LT') )
    // console.log('[ANALYTICS] - setMomentLocale hour 2 ',moment("07:00", "HH:mm").format('LT') )
    // console.log('[ANALYTICS] - setMomentLocale hour 2 ',moment("08:00", "HH:mm").format('LT') )
    // console.log('[ANALYTICS] - setMomentLocale hour 2 ',moment("09:00", "HH:mm").format('LT') )
    // console.log('[ANALYTICS] - setMomentLocale hour 2 ',moment("10:00", "HH:mm").format('LT') )
    // console.log('[ANALYTICS] - setMomentLocale hour 2 ',moment("11:00", "HH:mm").format('LT') )
    // console.log('[ANALYTICS] - setMomentLocale hour 2 ',moment("12:00", "HH:mm").format('LT') )
    // console.log('[ANALYTICS] - setMomentLocale hour 2 ',moment("13:00", "HH:mm").format('LT') )
    // console.log('[ANALYTICS] - setMomentLocale hour 2 ',moment("14:00", "HH:mm").format('LT') )
    // console.log('[ANALYTICS] - setMomentLocale hour 2 ',moment("15:00", "HH:mm").format('LT') )
    // console.log('[ANALYTICS] - setMomentLocale hour 2 ',moment("16:00", "HH:mm").format('LT') )
    // console.log('[ANALYTICS] - setMomentLocale hour 2 ',moment("17:00", "HH:mm").format('LT') )
    // console.log('[ANALYTICS] - setMomentLocale hour 2 ',moment("18:00", "HH:mm").format('LT') )
    // console.log('[ANALYTICS] - setMomentLocale hour 2 ',moment("19:00", "HH:mm").format('LT') )
    // console.log('[ANALYTICS] - setMomentLocale hour 2 ',moment("20:00", "HH:mm").format('LT') )
    // console.log('[ANALYTICS] - setMomentLocale hour 2 ',moment("21:00", "HH:mm").format('LT') )
    // console.log('[ANALYTICS] - setMomentLocale hour 2 ',moment("22:00", "HH:mm").format('LT') )
    // console.log('[ANALYTICS] - setMomentLocale hour 2 ',moment("23:00", "HH:mm").format('LT') )
    // console.log('[ANALYTICS] - setMomentLocale hour 2 ',moment("24:00", "HH:mm").format('LT') )

  }

  getCurrentUrl() {

    const currentUrl = this.router.url;
    this.logger.log('[ANALYTICS]  - currentUrl ', currentUrl)
    const url_segments = currentUrl.split('/');
    this.logger.log('[ANALYTICS]  - url_segments ', url_segments)
    if (url_segments.length === 5) {
      if (url_segments[4] === "metrics") {
        this.selected = 'metriche';
      }
    }

    if (url_segments.length === 6) {
      if (url_segments[4] === "metrics") {
        this.selected = 'metriche';
        this.childToSelect = url_segments[5]
      }
    }
  }

  //go to different component passed throw arg of method
  goTo(selected) {
    this.selected = selected;
    this.logger.log("[ANALYTICS] Move to:", selected);
  }




  getBrowserLangAndSwitchMonthName() {
    const browserLang = this.translate.getBrowserLang();
    this.logger.log('[ANALYTICS]  - BROWSER LANG ', browserLang)
    if (browserLang) {
      if (browserLang === 'it') {
        this.monthNames = { '1': 'Gen', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'Mag', '6': 'Giu', '7': 'Lug', '8': 'Ago', '9': 'Set', '10': 'Ott', '11': 'Nov', '12': 'Dic' }
      } else {
        this.monthNames = { '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'May', '6': 'Jun', '7': 'Jul', '8': 'Aug', '9': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' }
      }
    }
  }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    // this.buildgraph(); // HEAT MAP GRAPH
    // this.avarageWaitingTimeCLOCK(); // -->clock avg time response
    // this.avgTimeResponsechart(); // --> avg time response bar chart
    // this.durationConvTimeCLOCK(); // --> duration time clock
    // this.durationConversationTimeCHART(); // --> duration conversation bar chart
    // this.auth.checkProjectProfile('analytics');
    // this.getRequestByLast7Day();

    this.analyticsService.richieste_bs.subscribe((hasClickedOnGraph) => {
      this.logger.log("[ANALYTICS] CLICK hasClickedOnGraph:", hasClickedOnGraph)
      this.logger.log("[ANALYTICS] Has click graph title... move to METRICHE");
      if (hasClickedOnGraph) {
        this.selected = 'metriche';
      }

    })

 

    /* ----------==========   TILEDESK ANALYTICS   ==========---------- */
    this.getCurrentProject();
    this.getStorageBucket();
    // this.getCountOfRequestForAgent()
    // this.servedAndUnservedRequestsCount();
    // this.globalServedAndUnservedRequestsCount();
    // this.getCountOf_AllRequestsForAgent();
    // this.getRequestsByDay();
    // this.getCountOf_AllRequestsForDept();

    /** NOT  USED */
    // this.daysHoursRequestsDistribution()

    /** NOT YET USED */
    // this.translateHours();
    // this.translateMinutes();
    // this.translateSeconds();
    // this.getWaitingTimeAverage();

  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.id_project = project._id

      }
    });
  }


  getStorageBucket() {
    const firebase_conf = this.appConfigService.getConfig().firebase;
    this.storageBucket = firebase_conf['storageBucket'];
    this.logger.log('[ANALYTICS] STORAGE-BUCKET Analytics2 List ', this.storageBucket)
  }

  translateHours() {
    this.translate.get('hours')
      .subscribe((text: string) => {

        this.translatedHoursString = text;
        this.logger.log('[ANALYTICS] - AVERAGE WAIT - translatedHoursString ', text)
      });
  };

  translateMinutes() {
    this.translate.get('minutes')
      .subscribe((text: string) => {

        this.translatedMinutesString = text;
        this.logger.log('[ANALYTICS] - AVERAGE WAIT - translatedMinutesString ', text)
      });
  };

  translateSeconds() {
    this.translate.get('seconds')
      .subscribe((text: string) => {

        this.translatedSecondsString = text;
        this.logger.log('[ANALYTICS] - AVERAGE WAIT - translatedSecondsString ', text)
      });
  };



  getMaxOfArray(requestsByDay_series_array) {
    return Math.max.apply(null, requestsByDay_series_array);
  }



  goToEditAddPage_EDIT(dept_id: string) {
    this.logger.log('[ANALYTICS] - ALL REQUESTS X DEPT - GO TO DEPT ID ', dept_id);
    this.router.navigate(['project/' + this.id_project + '/department/edit', dept_id]);
  }


  ngOnDestroy() {
    this.logger.log('[ANALYTICS] - !!!!! UN - SUBSCRIPTION TO REQUESTS-LIST-BS');
    // this.subscription.unsubscribe();
  }


  // startAnimationForLineChart(chart) {
  //   let seq: any, delays: any, durations: any;
  //   seq = 0;
  //   delays = 80;
  //   durations = 500;

  //   chart.on('draw', function (data) {
  //     if (data.type === 'line' || data.type === 'area') {
  //       data.element.animate({
  //         d: {
  //           begin: 600,
  //           dur: 700,
  //           from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
  //           to: data.path.clone().stringify(),
  //           easing: Chartist.Svg.Easing.easeOutQuint
  //         }
  //       });
  //     } else if (data.type === 'point') {
  //       seq++;
  //       data.element.animate({
  //         opacity: {
  //           begin: seq * delays,
  //           dur: durations,
  //           from: 0,
  //           to: 1,
  //           easing: 'ease'
  //         }
  //       });
  //     }
  //   });

  //   seq = 0;
  // };

  buildgraph() {

    // get the language of browser
    this.browserLang = this.translate.getBrowserLang();
    this.logger.log('[ANALYTICS] buildgraph LANGUAGE ', this.browserLang);
    this.cellSettings = {
      border: {
        radius: 4,
        width: 1,
        color: 'white'
      },
      // tileType:'Bubble',
      // bubbleType: 'Size',
      showLabel: false, // set to true to show value over each block
      // format: '{value} M',
    };

    this.paletteSettings = {
      palette: [
        { color: '#a0d4e9' },
        { color: '#5fa3f1' },
        { color: '#5187ed' },
        { color: '#254594' }
      ],
    };


    this.analyticsService.getDataHeatMap().subscribe(res => {
      const data: object = res;
      this.logger.log('[ANALYTICS] getDataHeatMap data from servoice->', res);

      if (this.browserLang === 'it') {
        this.weekday = { '1': 'Lun', '2': 'Mar', '3': 'Mer', '4': 'Gio', '5': 'Ven', '6': 'Sab', '7': 'Dom' }
        this.hour = {
          '1': '01:00', '2': '02:00', '3': '03:00', '4': '04:00', '5': '05:00', '6': '06:00', '7': '07:00', '8': '08:00', '9': '09:00', '10': '10:00',
          '11': '11:00', '12': '12:00', '13': '13:00', '14': '14:00', '15': '15:00', '16': '16:00', '17': '17:00', '18': '18:00', '19': '19:00', '20': '20:00',
          '21': '21:00', '22': '22:00', '23': '23:00'
        }
        this.yAxis = { labels: this.ylabel_ita };
        this.xAxis = { labels: this.xlabel_ita };
        this.titleSettings = {
          text: 'Utenti per ora del giorno',
          textStyle: {
            size: '15px',
            fontWeight: '500',
            fontStyle: 'Normal'
          }
        };

      } else {
        this.weekday = { '1': 'Mon', '2': 'Tue', '3': 'Wed', '4': 'The', '5': 'Fri', '6': 'Sat', '7': 'Sun' }
        this.hour = {
          '1': '1am', '2': '2am', '3': '3am', '4': '4am', '5': '5am', '6': '6am', '7': '7am', '8': '8am', '9': '9am', '10': '10am',
          '11': '11am', '12': '12am', '13': '1pm', '14': '2pm', '15': '3pm', '16': '4pm', '17': '5pm', '18': '6pm', '19': '7pm', '20': '8pm',
          '21': '9pm', '22': '10pm', '23': '11pm'
        }

        this.yAxis = { labels: this.ylabel_eng };
        this.xAxis = { labels: this.xlabel_eng };
        this.titleSettings = {
          text: 'User per hour of day',
          textStyle: {
            size: '15px',
            fontWeight: '500',
            fontStyle: 'Normal'
          }
        };

      }

      // recostruct datafromservice to other customDataJson
      for (let i in data) {

        this.customData.push({ '_id': { "hour": this.hour[data[i]._id.hour], "weekday": this.weekday[data[i]._id.weekday] }, 'count': data[i].count });
      }

      this.logger.log('[ANALYTICS] getDataHeatMap customData', this.customData);

      this.dataSource = {
        data: this.customData,
        isJsonData: true,
        adaptorType: 'Cell',
        yDataMapping: '_id.hour',
        xDataMapping: '_id.weekday',
        valueMapping: 'count'
      }
    })

  }



  public showTooltip: Boolean = true;


  // convert number from millisecond to humanizer form 
  humanizeDurations(timeInMillisecond) {
    let result;
    if (timeInMillisecond) {
      if (this.browserLang == 'en') {
        if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60 * 24 * 30 * 12))) > 0) {//year
          result = result === 1 ? result + " Year" : result + " Years";
        } else if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60 * 24 * 30))) > 0) {//months
          result = result === 1 ? result + " Month" : result + " Months";
        } else if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60 * 24))) > 0) {//days
          result = result === 1 ? result + " Day" : result + " Days";
        } else if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60))) > 0) {//Hours
          result = result === 1 ? result + " Hours" : result + " Hours";
        } else if ((result = Math.round(timeInMillisecond / (1000 * 60))) > 0) {//minute
          result = result === 1 ? result + " Minute" : result + " Minutes";
        } else if ((result = Math.round(timeInMillisecond / 1000)) > 0) {//second
          result = result === 1 ? result + " Second" : result + " Seconds";
        } else {
          result = timeInMillisecond + " Millisec";
        }
      }
      else {
        if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60 * 24 * 30 * 12))) > 0) {//year
          result = result === 1 ? result + " Anno" : result + " Anni";
        } else if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60 * 24 * 30))) > 0) {//months
          result = result === 1 ? result + " Mese" : result + " Mesi";
        } else if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60 * 24))) > 0) {//days
          result = result === 1 ? result + " Giorno" : result + " Giorni";
        } else if ((result = Math.round(timeInMillisecond / (1000 * 60 * 60))) > 0) {//Hours
          result = result === 1 ? result + " Ora" : result + " Ore";
        } else if ((result = Math.round(timeInMillisecond / (1000 * 60))) > 0) {//minute
          result = result === 1 ? result + " Minuto" : result + " Minuti";
        } else if ((result = Math.round(timeInMillisecond / 1000)) > 0) {//second
          result = result === 1 ? result + " Secondo" : result + " Secondi";
        } else {
          result = timeInMillisecond + " Millisecondi";
        }
      }
      return result;

    }
  }


  avarageWaitingTimeCLOCK() {
    this.analyticsService.getDataAVGWaitingCLOCK().subscribe((res: any) => {
      let avarageWaitingTimestring;
      var splitString;

      if (res && res.length != 0) {
        //this.avarageWaitingTimestring= this.msToTime(res[0].waiting_time_avg)

        //this.humanizer.setOptions({round: true, units:['m']});


        //this.avarageWaitingTimestring = this.humanizer.humanize(res[0].waiting_time_avg);
        avarageWaitingTimestring = this.humanizeDurations(res[0].waiting_time_avg)
        splitString = this.humanizeDurations(res[0].waiting_time_avg).split(" ");
        this.numberAVGtime = splitString[0];
        this.unitAVGtime = splitString[1];

        this.responseAVGtime = this.humanizer.humanize(res[0].waiting_time_avg, { round: true, language: this.browserLang })

        this.logger.log('[ANALYTICS] avarageWaitingTimeCLOCK Waiting time: humanize', this.humanizer.humanize(res[0].waiting_time_avg))
        this.logger.log('[ANALYTICS] avarageWaitingTimeCLOCK waiting time funtion:', avarageWaitingTimestring);


      }
      else {

        this.numberAVGtime = 'n/a'
        this.unitAVGtime = ''
        this.responseAVGtime = 'n/a'

        this.logger.log('[ANALYTICS] avarageWaitingTimeCLOCK humanize', this.humanizer.humanize(0))
        this.logger.log('[ANALYTICS] avarageWaitingTimeCLOCK waiting time funtion:', avarageWaitingTimestring);
      }


    }, (error) => {
      this.logger.error('[ANALYTICS] avarageWaitingTimeCLOCK - AVERAGE WAITING TIME REQUEST - ERROR ', error);
    }, () => {
      this.logger.log('[ANALYTICS] avarageWaitingTimeCLOCK - AVERAGE TIME REQUEST * COMPLETE *');
    });

  }


  avgTimeResponsechart() {
    this.analyticsService.getavarageWaitingTimeDataCHART(30, '').subscribe((res: any) => {
      this.logger.log('[ANALYTICS] avgTimeResponsechart chart data:', res);
      if (res) {

        //build a 30 days array of date with value 0--> is the init array
        const last30days_initarray = []
        for (let i = 0; i <= 30; i++) {
          // this.logger.log('»» !!! ANALYTICS - LOOP INDEX', i);
          last30days_initarray.push({ date: moment().subtract(i, 'd').format('D/M/YYYY'), value: 0 });
        }

        last30days_initarray.reverse()
        this.dateRangeAvg = last30days_initarray[0].date.split(-4) + ' - ' + last30days_initarray[30].date;
        this.logger.log('[ANALYTICS] avgTimeResponsechart - REQUESTS BY DAY - MOMENT LAST 30 DATE (init array)', last30days_initarray);

        //build a custom array with che same structure of "init array" but with key value of serviceData
        //i'm using time_convert function that return avg_time always in hour 
        const customDataLineChart = [];
        for (let j = 0; j < customDataLineChart.length; j++) {

          if (customDataLineChart[j]) {
            if (res[j].waiting_time_avg == null) {
              res[j].waiting_time_avg = 0;  //substitute null point with 0 value
            }
            // to locale string allow format type dd/mm/yyyy
            customDataLineChart.push({ date: new Date(res[j]._id.year, res[j]._id.month - 1, res[j]._id.day).toLocaleDateString(), value: res[j].waiting_time_avg });
          }
        }
        this.logger.log('[ANALYTICS] avgTimeResponsechart Custom data:', customDataLineChart);

        //build a final array that compars value between the two arrray before builded with respect to date key value
        const requestByDays_final_array = last30days_initarray.map(obj => customDataLineChart.find(o => o.date === obj.date) || obj);
        this.logger.log('[ANALYTICS] avgTimeResponsechart - FINAL ARRAY ', requestByDays_final_array);




        // this.xValue = this.customDataLineChart.map(function(e) {
        //   let date =new Date(e.date); 
        //   var dd=date.toISOString().substring(0,10); stampa nel formato yyyy/mm/dd   
        //   return date.toLocaleDateString();  
        //   return e.date
        // });

        // this.yValue = this.customDataLineChart.map(function(e) {
        //     return e.value;
        // });

        this.xValueAVGchart = requestByDays_final_array.map(function (e) {
          return e.date
        })
        this.yValueAVGchart = requestByDays_final_array.map(function (e) {
          return e.value
        })

        this.logger.log('[ANALYTICS] Xlabel-AVERAGE TIME', this.xValueAVGchart);
        this.logger.log('[ANALYTICS] Ylabel-AVERAGE TIME', this.yValueAVGchart);
      }
      else
        this.logger.error('[ANALYTICS]  !!!ERROR!!! while get data from resouces for waiting avg time graph')

      // Chart.plugins.register({
      //   beforeDraw: function(chartInstance, easing) {
      //     var ctx = chartInstance.chart.ctx;
      //     this.logger.log("chart istance",chartInstance);
      //     ctx.fillStyle = 'red'; // your color here

      //     var chartArea = chartInstance.chartArea;
      //     ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
      //   }
      // });

      var lineChart = new Chart('avgTimeResponse', {
        type: 'line',
        data: {
          labels: this.xValueAVGchart,
          datasets: [{
            label: 'Average time response in last 30 days ',
            data: this.yValueAVGchart,
            fill: true, //riempie zona sottostante dati
            lineTension: 0.1,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderColor: 'rgba(255, 255, 255, 0.7)',
            borderWidth: 3,
            pointBackgroundColor: 'rgba(255, 255, 255, 0.8)',
            pointBorderColor: 'rgba(255, 255, 255, 0.8)'

          }]
        },
        options: {
          title: {
            text: 'AVERAGE TIME RESPONSE',
            display: false
          },
          scales: {
            xAxes: [{
              ticks: {
                beginAtZero: true,
                display: true,
                minRotation: 30,
                fontColor: 'white',
              },
              gridLines: {
                display: true,
                color: 'rgba(255, 255, 255, 0.5)',
                borderDash: [3, 1]
              }

            }],
            yAxes: [{
              gridLines: {
                display: true,
                color: 'rgba(255, 255, 255, 0.5)',
                borderDash: [3, 1]
              },
              ticks: {
                beginAtZero: true,
                display: true,
                fontColor: 'white',
                callback: function (value, index, values) {
                  let hours = Math.floor(value / 3600000) // 1 Hour = 36000 Milliseconds
                  let minutes = Math.floor((value % 3600000) / 60000) // 1 Minutes = 60000 Milliseconds
                  let seconds = Math.floor(((value % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds
                  return hours + 'h:' + minutes + 'm:' + seconds + 's'
                },

              }
            }]
          },
          tooltips: {
            callbacks: {
              label: function (tooltipItem, data) {
                // var label = data.datasets[tooltipItem.datasetIndex].label || '';
                // if (label) {
                //     label += ': ';
                // }
                // label += Math.round(tooltipItem.yLabel * 100) / 100;
                // return label + '';
                //this.logger.log("data",data)
                const currentItemValue = tooltipItem.yLabel
                let langService = new HumanizeDurationLanguage();
                let humanizer = new HumanizeDuration(langService);
                humanizer.setOptions({ round: true })
                //this.logger.log("humanize", humanizer.humanize(currentItemValue))
                return data.datasets[tooltipItem.datasetIndex].label + ': ' + humanizer.humanize(currentItemValue)

              }
            }
          }

        }
        ,
        plugins: [{
          beforeDraw: function (chartInstance, easing) {
            var ctx = chartInstance.chart.ctx;
            //this.logger.log("chartistance",chartInstance)
            //ctx.fillStyle = 'red'; // your color here
            ctx.font ='Roboto';
            var chartArea = chartInstance.chartArea;
            //ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
          }
        }]
      });


    })

  }

  durationConvTimeCLOCK() {
    this.analyticsService.getDurationConversationTimeDataCLOCK().subscribe((res: any) => {
      if (res) {


        //this.humanizer.setOptions({round: true, units:['m']});
        this.humanizer.setOptions({ round: true });

        //this.avarageWaitingTimestring = this.humanizer.humanize(res[0].waiting_time_avg);
        const avarageWaitingTimestring = this.humanizeDurations(res[0].duration_avg)
        var splitString = this.humanizeDurations(res[0].duration_avg).split(" ");
        this.numberDurationCNVtime = splitString[0];
        this.unitDurationCNVtime = splitString[1];

        const browserLang = this.translate.getBrowserLang();
        if (browserLang) {

          if (browserLang == 'it') {
            this.responseDurationtime = 'La durata di conversazione media complessiva del tuo team è ' + this.humanizer.humanize(res[0].duration_avg, { language: 'it' });
          }
          else
            this.responseDurationtime = "Your team's overall Median Conversation Lenght is " + this.humanizer.humanize(res[0].duration_avg, { language: 'en' });

          this.logger.log('[ANALYTICS] durationConvTimeCLOCK Waiting time: humanize', this.humanizer.humanize(res[0].duration_avg))
          this.logger.log('[ANALYTICS] durationConvTimeCLOCK waiting time funtion:', avarageWaitingTimestring);
        }
        else
          this.logger.error('[ANALYTICS] durationConvTimeCLOCK !!!ERROR!!! while get resources for waiting avarage time ');
      }
    });


  }

  durationConversationTimeCHART() {
    this.analyticsService.getDurationConversationTimeDataCHART(30, '').subscribe((resp: any) => {
      if (resp) {
        this.logger.log("[ANALYTICS] durationConversationTimeCHART resp", resp)

        const last30days_initarrayDURATION = []
        for (let i = 0; i <= 30; i++) {
          // this.logger.log('»» !!! ANALYTICS - LOOP INDEX', i);
          last30days_initarrayDURATION.push({ date: moment().subtract(i, 'd').format('D/M/YYYY'), value: 0 })
        }
        last30days_initarrayDURATION.reverse()
        this.dataRangeDuration = last30days_initarrayDURATION[0].date + ' - ' + last30days_initarrayDURATION[30].date;

        this.logger.log('[ANALYTICS] - REQUESTS DURATION CONVERSATION BY DAY - MOMENT LAST 30 DATE (init array)', last30days_initarrayDURATION);

        //build a custom array with che same structure of "init array" but with key value of serviceData
        //i'm using time_convert function that return avg_time always in hour 
        const customDurationCOnversationChart = [];
        for (let i in resp) {

          // this.humanizer.setOptions({round: true, units:['h']});
          // const AVGtimevalue= this.humanizer.humanize(res[i].waiting_time_avg).split(" ")
          // this.logger.log("value humanizer:", this.humanizer.humanize(res[i].waiting_time_avg), "split:",AVGtimevalue)

          if (resp[i].duration_avg == null)
            resp[i].duration_avg = 0;

          customDurationCOnversationChart.push({ date: new Date(resp[i]._id.year, resp[i]._id.month - 1, resp[i]._id.day).toLocaleDateString(), value: resp[i].duration_avg });
        }
        this.logger.log("[ANALYTICS] Custom Duration COnversation data:", customDurationCOnversationChart);

        //build a final array that compars value between the two arrray before builded with respect to date key value
        const requestDurationConversationByDays_final_array = last30days_initarrayDURATION.map(obj => customDurationCOnversationChart.find(o => o.date === obj.date) || obj);
        this.logger.log('[ANALYTICS] - REQUESTS DURATION CONVERSATION BY DAY - FINAL ARRAY ', requestDurationConversationByDays_final_array);

        this.xValueDurationConversation = requestDurationConversationByDays_final_array.map(function (e) {
          return e.date
        })
        this.yValueDurationConversation = requestDurationConversationByDays_final_array.map(function (e) {
          return e.value
        })

        this.logger.log("[ANALYTICS] Xlabel-DURATION", this.xValueDurationConversation);
        this.logger.log("[ANALYTICS] Ylabel-DURATION", this.yValueDurationConversation);
      }
      else
        this.logger.error("[ANALYTICS] !!!ERROR!!! while get data from resouces for duration conversation time graph")

      var lineChart = new Chart('durationConversationTimeResponse', {
        type: 'bar',
        data: {
          labels: this.xValueDurationConversation,
          datasets: [{
            label: 'Average duration conversation time response in last 30 days ',
            data: this.yValueDurationConversation,
            fill: false, //riempie zona sottostante dati
            lineTension: 0.1,
            borderColor: '#1e88e5',
            backgroundColor: '#1e88e5',
            borderWidth: 5
          },
            // {
            //   label: 'Average duration conversation time response in last 30 days _LINE ',
            //   data: this.yValueDurationConversation,
            //   fill:false, //riempie zona sottostante dati
            //   lineTension:0.1,
            //   borderColor:'red',
            //   backgroundColor: 'red',
            //   borderWidth: 5,
            //   type: 'line'
            // },
          ]
        },
        options: {
          title: {
            text: 'DURATION CONVERSATION TIME RESPONSE',
            display: false
          },
          scales: {
            xAxes: [{
              ticks: {
                beginAtZero: true,
                display: true,
                minRotation: 30
              },

            }],
            yAxes: [{
              ticks: {
                beginAtZero: true,
                display: true,
                callback: function (value, index, values) {
                  let hours = Math.floor(value / 3600000) // 1 Hour = 36000 Milliseconds
                  let minutes = Math.floor((value % 3600000) / 60000) // 1 Minutes = 60000 Milliseconds
                  let seconds = Math.floor(((value % 360000) % 60000) / 1000) // 1 Second = 1000 Milliseconds
                  return hours + 'h:' + minutes + 'm:' + seconds + 's'
                }

              },

            }]
          },
          tooltips: {
            callbacks: {
              label: function (tooltipItem, data) {
                // var label = data.datasets[tooltipItem.datasetIndex].label || '';
                // if (label) {
                //     label += ': ';
                // }
                // label += Math.round(tooltipItem.yLabel * 100) / 100;
                // return label + '';
                //this.logger.log("data",data)
                const currentItemValue = tooltipItem.yLabel
                let langService = new HumanizeDurationLanguage();
                let humanizer = new HumanizeDuration(langService);
                humanizer.setOptions({ round: true })
                //this.logger.log("humanize", humanizer.humanize(currentItemValue))
                return data.datasets[tooltipItem.datasetIndex].label + ': ' + humanizer.humanize(currentItemValue)

              }
            }
          }
        }
      });


    })
  }



  // !!!!! COMMENTO DA QUI
  // startAnimationForBarChart(chart) {
  //   let seq2: any, delays2: any, durations2: any;

  //   seq2 = 0;
  //   delays2 = 80;
  //   durations2 = 500;
  //   chart.on('draw', function (data) {
  //     if (data.type === 'bar') {
  //       seq2++;
  //       data.element.animate({
  //         opacity: {
  //           begin: seq2 * delays2,
  //           dur: durations2,
  //           from: 0,
  //           to: 1,
  //           easing: 'ease'
  //         }
  //       });
  //     }
  //   });

  //   seq2 = 0;
  // };


}
