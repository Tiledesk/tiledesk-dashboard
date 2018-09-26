// tslint:disable:max-line-length
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../core/auth.service';
import { RequestsService } from './../services/requests.service';
import { UsersService } from '../services/users.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import * as Chartist from 'chartist';
import { DepartmentService } from '../services/mongodb-department.service';
@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit, OnDestroy {
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
  constructor(
    private auth: AuthService,
    private requestsService: RequestsService,
    private usersService: UsersService,
    private router: Router,
    private translate: TranslateService,
    private departmentService: DepartmentService
  ) {

    console.log('!!! »»» HELLO ANALYTICS »»» ');
    // this.getAllUsersOfCurrentProject();
    this.getBrowserLangAndSwitchMonthName();
  }

  getBrowserLangAndSwitchMonthName() {
    const browserLang = this.translate.getBrowserLang();
    console.log('!!! ANALYTICS  - BROWSER LANG ', browserLang)
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

    /* ----------==========    NUMBER OF REQUEST for DEPARTMENT ** PIE CHART ** ==========---------- */

    //   const data = {
    //     series: [35.03, 32.12, 19.99, 6.24, 5.41, 0.82, 0.23, 0.15, 0.012, 0]
    //   };

    //   const sum = function (a, b) { return a + b };

    //  const requstForDept = new Chartist.Pie('.ct-chart', data, {
    //     labelInterpolationFnc: function (value) {
    //       return Math.round(value / data.series.reduce(sum) * 100) + '%';
    //     }
    //   });

    // !!!!!! COMMEMNTO DA QUI SINO A TILEDESK ANALYTICS
    // const dataPreferences = {
    //   labels: ['35.03%', '32.12%', '19.99%', '6.24%'],
    //   series: [35.03, 32.12, 19.99, 6.24]
    // };

    // const optionsPreferences = {
    //   height: '230px'
    // };

    // // tslint:disable-next-line:no-unused-expression
    // new Chartist.Pie('#chartPreferences', dataPreferences, optionsPreferences);


    /* ----------==========    NUMBER OF REQUEST   ==========---------- */
    // const dataDailySalesChart: any = {
    //   // labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    //   labels: ['V', 'S', 'D', 'L', 'M', 'M', 'G'],
    //   series: [
    //     [12, 17, 7, 17, 23, 18, 38]
    //   ]
    // };

    // const optionsDailySalesChart: any = {
    //   lineSmooth: Chartist.Interpolation.cardinal({
    //     tension: 0
    //   }),
    //   low: 0,
    //   high: 50, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
    //   chartPadding: { top: 0, right: 0, bottom: 0, left: 0 },
    // }

    // const dailySalesChart = new Chartist.Line('#dailySalesChart', dataDailySalesChart, optionsDailySalesChart);

    // this.startAnimationForLineChart(dailySalesChart);


    /* ----------==========     Users satisfaction    ==========---------- */
    // const dataCompletedTasksChart: any = {
    //   // labels: ['12am', '3pm', '6pm', '9pm', '12pm', '3am', '6am', '9am'],
    //   // labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
    //   labels: ['Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic', 'Gen', 'Feb', 'Mar', 'Apr', 'Mag'],
    //   series: [
    //     [50, 60, 100, 45, 40, 65, 70, 91, 70, 75, 95, 98]
    //   ]
    // };

    // const optionsCompletedTasksChart: any = {
    //   lineSmooth: Chartist.Interpolation.cardinal({
    //     tension: 0
    //   }),
    //   low: 0,
    //   high: 150, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
    //   chartPadding: { top: 0, right: 0, bottom: 0, left: 0 }
    // }

    // const completedTasksChart = new Chartist.Line('#completedTasksChart', dataCompletedTasksChart, optionsCompletedTasksChart);

    // // start animation for the Completed Tasks Chart - Line Chart
    // this.startAnimationForLineChart(completedTasksChart);



    /* ----------==========    Chat average duration    ==========---------- */
    // const dataEmailsSubscriptionChart = {
    //   // labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    //   // labels: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
    //   labels: ['Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic', 'Gen', 'Feb', 'Mar', 'Apr', 'Mag'],
    //   series: [
    //     [542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 360]

    //   ]
    // };
    // const optionsEmailsSubscriptionChart = {
    //   axisX: {
    //     showGrid: false
    //   },
    //   low: 0,
    //   high: 1000,
    //   chartPadding: { top: 0, right: 5, bottom: 0, left: 0 }
    // };
    // const responsiveOptions: any[] = [
    //   ['screen and (max-width: 640px)', {
    //     seriesBarDistance: 5,
    //     axisX: {
    //       labelInterpolationFnc: function (value) {
    //         return value[0];
    //       }
    //     }
    //   }]
    // ];
    // const emailsSubscriptionChart = new Chartist.Bar('#emailsSubscriptionChart', dataEmailsSubscriptionChart, optionsEmailsSubscriptionChart, responsiveOptions);

    // // start animation for the Emails Subscription Chart
    // this.startAnimationForBarChart(emailsSubscriptionChart);

    /* ----------==========   TILEDESK ANALYTICS   ==========---------- */
    this.getCurrentProject();
    // this.getCountOfRequestForAgent()
    this.servedAndUnservedRequestsCount();
    this.globalServedAndUnservedRequestsCount();
    this.getCountOf_AllRequestsForAgent();
    this.getRequestsByDay();
    this.getlastMonthRequetsCount();
    this.getCountOf_AllRequestsForDept();
  }
  /* ----------==========   end ON INIT    ==========---------- */

  getRequestsByDay() {
    this.requestsService.requestsByDay().subscribe((requestsByDay: any) => {
      console.log('!!! ANALYTICS - REQUESTS BY DAY ', requestsByDay);

      const requestsByDay_series_array = [];
      const requestsByDay_labels_array = []

      for (let j = 0; j < requestsByDay.length; j++) {
        if (requestsByDay[j]) {
          // console.log('!!! ANALYTICS - REQUESTS BY DAY - # cicle ', j)
          const requestByDay_count = requestsByDay[j]['count']
          // console.log('!!! ANALYTICS - REQUESTS BY DAY - COUNT', requestByDay_count);
          requestsByDay_series_array.push(requestByDay_count)

          const requestByDay_day = requestsByDay[j]['_id']['day']
          const requestByDay_month = requestsByDay[j]['_id']['month']
          // console.log('!!! ANALYTICS - REQUESTS BY DAY - DAY', requestByDay_day);
          requestsByDay_labels_array.push(requestByDay_day + ' ' + this.monthNames[requestByDay_month])
        }
      }
      console.log('!!! ANALYTICS - REQUESTS BY DAY - SERIES (ARRAY OF COUNT)', requestsByDay_series_array);
      console.log('!!! ANALYTICS - REQUESTS BY DAY - LABELS (ARRAY OF DAY)', requestsByDay_labels_array);

      const higherCount = this.getMaxOfArray(requestsByDay_series_array);
      console.log('!!! ANALYTICS - REQUESTS BY DAY - HIGHTER COUNT ', higherCount);

      const dataRequestsByDayChart: any = {

        labels: requestsByDay_labels_array,
        series: [
          requestsByDay_series_array,
        ]
      };

      const optionsRequestsByDayChart: any = {
        lineSmooth: Chartist.Interpolation.cardinal({
          tension: 0
        }),
        low: 0,
        high: higherCount + 2, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
        // scaleMinSpace: 6,
        chartPadding: { top: 0, right: 0, bottom: 0, left: 0 },
      }

      const requestsByDayChart = new Chartist.Line('#requestsByDayChart', dataRequestsByDayChart, optionsRequestsByDayChart);

      this.startAnimationForLineChart(requestsByDayChart);

    }, (error) => {
      console.log('!!! ANALYTICS - REQUESTS BY DAY - ERROR ', error);
    }, () => {
      console.log('!!! ANALYTICS - REQUESTS BY DAY * COMPLETE *');
    });
  }

  getMaxOfArray(requestsByDay_series_array) {
    return Math.max.apply(null, requestsByDay_series_array);
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.id_project = project._id

      }
    });
  }

  /**
   * ********************************************************************************************
   * ========================== COUNT OF ** ALL ** REQUESTS X dDEPT =============================
   * ******************************************************************************************** 
   */
  getCountOf_AllRequestsForDept() {
    this.departmentService.getDeptsByProjectId().subscribe((_departments: any) => {
      console.log('!!! ANALYTICS ALL REQUESTS X DEPT - GET DEPTS RESPONSE ', _departments);

      this.departments  = _departments
      const depts_names_array = [];
      if (this.departments) {
        this.departments.forEach(dept => {

          // console.log('!!! ANALYTICS - DEPT ', dept);
          console.log('!!! ANALYTICS ALL REQUESTS X DEPT - DEPT NAME: ', dept['name']);
          depts_names_array.push(dept['name']);
        });
      }
      console.log('!!! ANALYTICS ALL REQUESTS X DEPT - ARRAY OF DEPTS NAMES: ', depts_names_array);


      this.subscription = this.requestsService.allRequestsList_bs.subscribe((global_requests) => {
        console.log('!!! ANALYTICS ALL REQUESTS X DEPT - !!!!! SUBSCRIPTION TO ALL-THE-REQUESTS-LIST-BS ', global_requests);

        const depts_names_InAllRequests_array = []
        if (global_requests) {
          global_requests.forEach(g_r => {

            depts_names_InAllRequests_array.push(g_r.attributes.departmentName)

          });
        }

        console.log('!!! ALL REQUESTS X DEPT - ARRAY OF DEPARTMENT NAME ', depts_names_InAllRequests_array)

        depts_names_array.forEach(dept_name => {
          this.getDeptNameOccurrence(depts_names_InAllRequests_array, dept_name)
        });
      })

    }, error => {
      // this.showSpinner = false;
      console.log('!!! ALL REQUESTS X DEPT - GET DEPTS - ERROR: ', error);
    }, () => {
      console.log('!!! ALL REQUESTS X DEPT - GET DEPTS * COMPLETE *')
    });
  }

  getDeptNameOccurrence(array, value) {
    // console.log('!!! ANALYTICS - ALL REQUESTS X DEPT - GET DEP OCCURRENCE FOR DEPTS ');
    let count = 0;
    array.forEach((v) => (v === value && count++));
    console.log('!!! ANALYTICS - ALL REQUESTS X DEPT - #', count, ' REQUESTS ASSIGNED TO DEPT ', value);
    for (const dept of this.departments) {
      if (value === dept.name) {
        dept.value = count
      }
    }
    // this.showSpinner = false;
    // console.log('!!! ANALYTICS - !!!!! SHOW SPINNER', this.showSpinner);
    return count;
  }

  /**
   * ********************************************************************************************
   * ========================== COUNT OF ** ALL ** REQUESTS X AGENT =============================
   * ********************************************************************************************
   * GET THE OCCURRENCES OF THE USER-ID IN THE MEMBERS ARRAYS OF ALL THE REQUESTS OF THE PROJECT
   * (i.e. the requests are not filtered for the current_user_id and so an user with ADMIN role will be able to see
   * also the requests of a group to which it does not belong)
   */
  getCountOf_AllRequestsForAgent() {
    this.getProjectUsersAndRunFlatMembersArray();
  }

  getProjectUsersAndRunFlatMembersArray() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      console.log('!!! ANALYTICS - !!!!! PROJECT USERS ARRAY ', projectUsers)
      if (projectUsers) {
        this.projectUsers = projectUsers;
        projectUsers.forEach(prjctuser => {
          console.log('!!! ANALYTICS - PROJECT USERS RETURNED FROM THE CALLBACK', prjctuser)

          const _user_id = prjctuser['id_user']['_id']
          console.log('!!! ANALYTICS - USER ID ', _user_id)
          /**
            * ANDREA:
            * CREATES AN OBJECT WITH HAS FOR 'KEY' THE USER ID OF THE ITERATED 'PROJECT USERS' AND A NESTED OBJECT THAT HAS FOR KEY 'VAL' WITH AN INITIAL VALUE= 0 */
          // , 'user': prjctuser['id_user']
          // this.users_reqs_dict[prjctuser['id_user']['_id']] = { 'val': 0 }

          /**
          * NK:
          * CREATES AN ARRAY OF ALL THE USER ID OF THE ITERATED 'PROJECT USERS' */
          this.users_id_array.push(_user_id);
        })
        console.log('!!! ANALYTICS - !!!!! ARRAY OF USERS ID ', this.users_id_array)
        // console.log('!!! ANALYTICS - USERS DICTIONARY ', this.users_reqs_dict)
        // console.log('!!! ANALYTICS - USERS DICTIONARY - array  ', this.users_reqs_dict_array)
      }
    }, error => {
      console.log('!!! ANALYTICS - !!!!! PROJECT USERS (FILTERED FOR PROJECT ID) - ERROR', error);
    }, () => {
      console.log('!!! ANALYTICS - !!!!!  PROJECT USERS (FILTERED FOR PROJECT ID) - COMPLETE');
      this.getFlatMembersArrayFromAllRequestsAndRunGetOccurrence()
    });
  }

  getFlatMembersArrayFromAllRequestsAndRunGetOccurrence() {
    console.log('!!! ANALYTICS - !!!!! CALL GET COUNT OF REQUEST FOR AGENT');
    this.subscription = this.requestsService.allRequestsList_bs.subscribe((requests) => {
      console.log('!!! ANALYTICS - !!!!! SUBSCRIPTION TO ALL-THE-REQUESTS-LIST-BS');

      if (requests) {
        console.log('!!! ANALYTICS - !!!!! REQUESTS LENGHT ', requests.length)

        /**
         * NK:
         * CREATES AN UNIQUE ARRAY FROM ALL THE ARRAYS OF 'MEMBERS' THAT ARE NESTED IN THE ITERATED REQUESTS  */
        let flat_members_array = [];
        for (let i = 0; i < requests.length; i++) {
          flat_members_array = flat_members_array.concat(Object.keys(requests[i].members));
        }
        // Result of the concatenation of the single arrays of members
        console.log('!!! ANALYTICS - !!!!! FLAT-MEMBERS-ARRAY  ', flat_members_array)
        console.log('!!! ANALYTICS - !!!!! USER_ID_ARRAY - LENGTH ', this.users_id_array.length);
        /**
         * FOR EACH USER-ID IN THE 'USER_ID_ARRAY' IS RUNNED 'getOccurrenceAndAssignToProjectUsers'
         * THAT RETURNS THE COUNT OF HOW MAMY TIMES THE USER-ID IS PRESENT IN THE 'flat_members_array' AND THEN
         * ASSIGN THE VALUE OF 'COUNT' TO THE PROPERTY 'VALUE' OF THE OBJECT 'PROJECT-USERS' */

        if (flat_members_array) {
          for (let i = 0; i < this.users_id_array.length; i++) {
            console.log('!!! ANALYTICS - !!!!! USER_ID_ARRAY - LENGTH ', this.users_id_array.length);
            this.getOccurrenceAndAssignToProjectUser(flat_members_array, this.users_id_array[i])
          }
        }

        /**
         * ANDREA:
         * RUNS A 'FOR EACH' OVER OF ANY MEMBERS OF EACH REQUEST AND ADDS '1' TO THE PROPERTY 'val'
         * OF THE OBJECT 'users_reqs_dict' THAT HAS THE SAME ID OF THE ITERED MEMBER
         */
        // requests.forEach(req => {
        //   Object.keys(req.members).forEach(m => {
        //     if ((m !== 'system') && (m !== req.requester_id)) {
        //       this.users_reqs_dict[m]['val'] = this.users_reqs_dict[m]['val'] + 1
        //     }
        //   })
        // });
        // console.log('!!! ANALYTICS - USERS DICTIONARY (updated)', this.users_reqs_dict)


        /**
         * ANDREA:
         * ADD 'this.users_reqs_dict[m]['val']' TO THE PROPERTY 'value' OF THE OBJECT PROJECT-USERS
         */
        // if (this.projectUsers) {
        //  console.log('!!! ANALYTICS - PROJECT USERS ', this.projectUsers)
        //   for (const p of this.projectUsers) {

        //     console.log('!!! ANALYTICS - USERS DICTIONARY - DICT KEY (updated) ', Object.keys(this.users_reqs_dict))

        //     Object.keys(this.users_reqs_dict).forEach(element => {
        //       console.log('!!! ANALYTICS - USERS DICTIONARY - ELEMENT ', element)
        //       console.log('!!! ANALYTICS - USERS DICTIONARY  -PROJECT USER ID (updated) ', p.id_user._id)
        //       if (element === p.id_user._id) {
        //         console.log('!!! ANALYTICS - USERS DICTIONARY - IS THE SAME ', element, p.id_user._id)
        //         console.log('!!! ANALYTICS - USERS DICTIONARY - IS THE SAME  value', this.users_reqs_dict[p.id_user._id]['val'])
        //         p.value = this.users_reqs_dict[p.id_user._id]['val']
        //       }
        //     });
        //   }
        // }


        /* trasforma un  json in array */
        // const self = this;
        // this.users_reqs_dict_array = Object.keys(this.users_reqs_dict).map(function (k) {

        //   return self.users_reqs_dict[k];
        // });

      }
    });
  }
  getOccurrenceAndAssignToProjectUser(array, value) {
    console.log('!!! ANALYTICS - !!!!! CALLING GET OCCURRENCE REQUESTS FOR AGENT AND ASSIGN TO PROJECT USERS');
    let count = 0;
    array.forEach((v) => (v === value && count++));
    console.log('!!! ANALYTICS - !!!!! #', count, ' REQUESTS ASSIGNED TO THE USER ', value);
    for (const p of this.projectUsers) {
      if (value === p.id_user._id) {
        p.value = count
      }
    }
    this.showSpinner = false;
    // console.log('!!! ANALYTICS - !!!!! SHOW SPINNER', this.showSpinner);
    return count;
  }
  /* ANDREA - PSEUDO CODICE
  users_reqs_dict = {}
  for u in proj_users {
    users_reqs_dict[u.id] = { val: 0, "user" : u };
  }
  requests.forEach( e => {
    e.members.keys.forEach( e => {
      users_reqs_dict[key][val] = users_reqs_dict[key][val] + 1
    })
  })
  */

  /**
   * ******************************************************************************************
   * ====== COUNT OF SERVED, UNSERVED AND OF THE ACTIVE (i.e. SERVED + UNSERVED) REQUESTS ======
   * ******************************************************************************************
   */
  servedAndUnservedRequestsCount() {
    this.subscription = this.requestsService.requestsList_bs.subscribe((requests) => {
      this.date = new Date();
      console.log('!!! ANALYTICS - CURRENT DATE : ', this.date);
      console.log('!!! ANALYTICS - SUBSCRIBE TO REQUEST SERVICE - REQUESTS LIST: ', requests);

      this.requests = requests;

      if (requests) {
        let count_unserved = 0;
        let count_served = 0
        requests.forEach(r => {

          if (r.support_status === 100) {
            count_unserved = count_unserved + 1;
          }
          if (r.support_status === 200) {
            count_served = count_served + 1
          }
        });

        this.unservedRequestsCount = count_unserved;
        console.log('!!! ANALYTICS - # OF UNSERVED REQUESTS:  ', this.unservedRequestsCount);

        this.servedRequestsCount = count_served;
        console.log('!!! ANALYTICS - # OF SERVED REQUESTS:  ', this.servedRequestsCount);

        this.activeRequestsCount = this.unservedRequestsCount + this.servedRequestsCount
        console.log('!!! ANALYTICS - # OF ACTIVE REQUESTS:  ', this.activeRequestsCount);

      }
    });
  }

  /**
   * *****************************************************************************************************
   * ====== COUNT OF ** ALL ** SERVED, UNSERVED AND OF THE ACTIVE (i.e. SERVED + UNSERVED) REQUESTS ======
   * *****************************************************************************************************
   */
  globalServedAndUnservedRequestsCount() {
    this.subscription = this.requestsService.allRequestsList_bs.subscribe((global_requests) => {
      this.date = new Date();
      console.log('!!! ANALYTICS - CURRENT DATE : ', this.date);
      console.log('!!! ANALYTICS - SUBSCRIBE TO REQUEST SERVICE - GLOBAL REQUESTS LIST: ', global_requests);

      // this.requests = global_requests;

      if (global_requests) {
        let count_globalUnserved = 0;
        let count_globalServed = 0
        global_requests.forEach(g_r => {

          if (g_r.support_status === 100) {
            count_globalUnserved = count_globalUnserved + 1;
          }
          if (g_r.support_status === 200) {
            count_globalServed = count_globalServed + 1
          }
        });

        this.global_unservedRequestsCount = count_globalUnserved;
        console.log('!!! ANALYTICS - # OF GLOBAL UNSERVED REQUESTS:  ', this.global_unservedRequestsCount);

        this.global_servedRequestsCount = count_globalServed;
        console.log('!!! ANALYTICS - # OF GLOBAL SERVED REQUESTS:  ', this.global_servedRequestsCount);

        this.global_activeRequestsCount = this.global_unservedRequestsCount + this.global_servedRequestsCount
        console.log('!!! ANALYTICS - # OF GLOBAL ACTIVE REQUESTS:  ', this.global_activeRequestsCount);
      }
    });
  }

  /**
   * *****************************************************************************************************
   * ======================== COUNT OF ** ALL ** THE REQUESTS OF THE LAST MONTH ==========================
   * *****************************************************************************************************
   */
  getlastMonthRequetsCount() {
    this.requestsService.lastMonthRequetsCount().subscribe((_lastMonthrequestsCount: any) => {
      console.log('!!! ANALYTICS - LAST MONTH REQUESTS COUNT - RESPONSE ', _lastMonthrequestsCount);
      if (_lastMonthrequestsCount !== 'undefined' && _lastMonthrequestsCount.length > 0) {
        this.lastMonthrequestsCount = _lastMonthrequestsCount[0]['totalCount'];
        console.log('!!! ANALYTICS - LAST MONTH REQUESTS COUNT - RESPONSE ', this.lastMonthrequestsCount);
      } else {
        console.log('!!! ANALYTICS - LAST MONTH REQUESTS COUNT - RESPONSE ', this.lastMonthrequestsCount);
        this.lastMonthrequestsCount = 0
      }

    }, (error) => {
      console.log('!!! ANALYTICS - LAST MONTH REQUESTS COUNT - ERROR ', error);
    }, () => {
      console.log('!!! ANALYTICS - LAST MONTH REQUESTS COUNT * COMPLETE *');
    });
  }

  goToMemberProfile(member_id: string) {
    this.router.navigate(['project/' + this.id_project + '/member/' + member_id]);
  }


  ngOnDestroy() {
    console.log('!!! ANALYTICS - !!!!! UN - SUBSCRIPTION TO REQUESTS-LIST-BS');
    this.subscription.unsubscribe();
  }


  startAnimationForLineChart(chart) {
    let seq: any, delays: any, durations: any;
    seq = 0;
    delays = 80;
    durations = 500;

    chart.on('draw', function (data) {
      if (data.type === 'line' || data.type === 'area') {
        data.element.animate({
          d: {
            begin: 600,
            dur: 700,
            from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
            to: data.path.clone().stringify(),
            easing: Chartist.Svg.Easing.easeOutQuint
          }
        });
      } else if (data.type === 'point') {
        seq++;
        data.element.animate({
          opacity: {
            begin: seq * delays,
            dur: durations,
            from: 0,
            to: 1,
            easing: 'ease'
          }
        });
      }
    });

    seq = 0;
  };

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
