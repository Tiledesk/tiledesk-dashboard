import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit } from '@angular/core';
import { RequestsService } from 'app/services/requests.service';
import { UsersService } from 'app/services/users.service';
import { AuthService } from 'app/core/auth.service';
import { DepartmentService } from 'app/services/department.service';
import { Router } from '@angular/router';
import { WsRequestsService } from '../../services/websocket/ws-requests.service';
import { AppConfigService } from '../../services/app-config.service';

@Component({
  selector: 'appdashboard-realtime',
  templateUrl: './realtime.component.html',
  styleUrls: ['./realtime.component.scss']
})
export class RealtimeComponent implements OnInit {

  activeRequestsCount: number;
  unservedRequestsCount: number;
  servedRequestsCount: number;

  global_activeRequestsCount: number;
  global_unservedRequestsCount: number;
  global_servedRequestsCount: number;

  lastMonthrequestsCount: number;

  subscription: Subscription;

  date: any;
  requests: any;
  users_id_array = [];
  users_reqs_dict = {};

  projectUsers: any;
  showSpinner = true;
  userProfileImageExist: boolean;
  id_project: any;

  departments: any;

  storageBucket: string;

  constructor(
    private requestsService: RequestsService,
    private usersService: UsersService,
    private auth: AuthService,
    private departmentService: DepartmentService,
    private router: Router,
    public wsRequestsService: WsRequestsService,
    public appConfigService: AppConfigService
  ) { }

  ngOnInit() {
    this.getCurrentProject();
    //this.servedAndUnservedRequestsCount(); //not used
    this.globalServedAndUnservedRequestsCount();//active, served and unserved request count
    this.getCountOf_AllRequestsForAgent(); //request for agent
    this.getCountOf_AllRequestsForDept(); //request for department
    this.getlastMonthRequetsCount(); //last mounth request count
    this.getStorageBucket();
  }

  getStorageBucket() {
    const firebase_conf = this.appConfigService.getConfig().firebase;
    this.storageBucket = firebase_conf['storageBucket'];
    console.log('STORAGE-BUCKET Realtime ', this.storageBucket)
  }

  ngOnDestroy() {
    console.log('!!! ANALYTICS - !!!!! UN - SUBSCRIPTION TO REQUESTS-LIST-BS');
    this.subscription.unsubscribe();
  }


  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      if (project) {
        this.id_project = project._id

      }
    });
  }

  /**
  * ******************************************************************************************
  * ====== COUNT OF SERVED, UNSERVED AND OF THE ACTIVE (i.e. SERVED + UNSERVED) REQUESTS ======
  * ******************************************************************************************
  * --------------------------------NOT USED--------------------------------------------------
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
    // this.subscription = this.requestsService.allRequestsList_bs.subscribe((global_requests) => {
    this.subscription = this.wsRequestsService.wsRequestsList$.subscribe((global_requests) => {
      this.date = new Date();
      console.log('!!! ANALYTICS - CURRENT DATE : ', this.date);
      console.log('!!! ANALYTICS - SUBSCRIBE TO REQUEST SERVICE - GLOBAL REQUESTS LIST: ', global_requests);

      // this.requests = global_requests;

      if (global_requests) {
        let count_globalUnserved = 0;
        let count_globalServed = 0
        global_requests.forEach(g_r => {

          // if (g_r.support_status === 100) {
          if (g_r.status === 100) {
            count_globalUnserved = count_globalUnserved + 1;
          }
          // if (g_r.support_status === 200) {
          if (g_r.status === 200) {
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

    // this.subscription = this.requestsService.allRequestsList_bs.subscribe((requests) => {
    this.subscription = this.wsRequestsService.wsRequestsList$.subscribe((requests) => {
      console.log('!!! ANALYTICS - !!!!! SUBSCRIPTION TO ALL-THE-REQUESTS-LIST-BS');

      if (requests) {
        console.log('!!! ANALYTICS - !!!!! REQUESTS LENGHT ', requests.length)

        /**
         * NK:
         * CREATES AN UNIQUE ARRAY FROM ALL THE ARRAYS OF 'MEMBERS' THAT ARE NESTED IN THE ITERATED REQUESTS  */
        let flat_members_array = [];
        for (let i = 0; i < requests.length; i++) {
          // flat_members_array = flat_members_array.concat(Object.keys(requests[i].members));
          flat_members_array = flat_members_array.concat(requests[i].participants);
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

  goToMemberProfile(member_id: string) {
    // this.router.navigate(['project/' + this.id_project + '/member/' + member_id]);

    this.router.navigate(['project/' + this.id_project + '/user/edit/' + member_id]);
  }

  /**
   * ********************************************************************************************
   * ========================== COUNT OF ** ALL ** REQUESTS X DEPT =============================
   * 1) GET THE DEPTS OF THE PROJECT AND CREATED AN ARRAY WITH THE ID OF THE DEPARTMENTS
   * 2) FROM  'ALL' THE REQUESTS (RETURNED  FROM THE SUBSCRIPTION) IS CREATED AN ARRAY WITH THE DEPARTMENT IDS  CONTAINED IN THE REQUESTS
   * 3) FOR EACH ID CONTAINED IN THE ARRAY OF IDS OF THE DEPTS OF THE PROJECT IS CHECKED THE OCCURRENCE IN THE ARRAY OF THE DEPTS ID RETURNED FROM ALL THE REQUESTS
   * ********************************************************************************************
   */
  getCountOf_AllRequestsForDept() {
    this.departmentService.getDeptsByProjectId().subscribe((_departments: any) => {
      console.log('!!! ANALYTICS ALL REQUESTS X DEPT - GET DEPTS RESPONSE ', _departments);

      this.departments = _departments
      const project_depts_id_array = [];
      if (this.departments) {
        this.departments.forEach(dept => {

          // console.log('!!! ANALYTICS - DEPT ', dept);
          console.log('!!! ANALYTICS ALL REQUESTS X DEPT - DEPT ID: ', dept['_id']);
          // depts_names_array.push(dept['name']);
          project_depts_id_array.push(dept['_id']);
        });
      }
      console.log('!!! ANALYTICS ALL REQUESTS X DEPT - ARRAY OF DEPTS IDs: ', project_depts_id_array);


      // this.subscription = this.requestsService.allRequestsList_bs.subscribe((global_requests) => {
      this.subscription = this.wsRequestsService.wsRequestsList$.subscribe((global_requests) => {

        // console.log('!!! ANALYTICS ALL REQUESTS X DEPT - !!!!! SUBSCRIPTION TO ALL-THE-REQUESTS-LIST-BS ', global_requests);

        const requests_depts_id_array = []
        if (global_requests) {
          global_requests.forEach(g_r => {
            console.log('!!! ANALYTICS ALL REQUESTS X DEPT - g_r ', g_r);
            // if (g_r.attributes) {
            //   requests_depts_id_array.push(g_r.attributes.departmentId)
            // }
            if (g_r.snapshot.department) { 

              requests_depts_id_array.push(g_r.snapshot.department._id);
            }

          });
        }

        // console.log('!!! ALL REQUESTS X DEPT - ARRAY OF DEPARTMENTS ID ', requests_depts_id_array)

        project_depts_id_array.forEach(dept_id => {
          this.getDeptIdOccurrence(requests_depts_id_array, dept_id)
        });
      })

    }, error => {
      // this.showSpinner = false;
      console.log('!!! ALL REQUESTS X DEPT - GET DEPTS - ERROR: ', error);
    }, () => {
      console.log('!!! ALL REQUESTS X DEPT - GET DEPTS * COMPLETE *')
    });
  }

  getDeptIdOccurrence(array, value) {
    // console.log('!!! ANALYTICS - ALL REQUESTS X DEPT - GET DEP OCCURRENCE FOR DEPTS ');
    let count = 0;
    array.forEach((v) => (v === value && count++));
    console.log('!!! ANALYTICS - ALL REQUESTS X DEPT - #', count, ' REQUESTS ASSIGNED TO DEPT ', value);
    for (const dept of this.departments) {
      if (value === dept._id) {
        dept.value = count
      }
    }
    // this.showSpinner = false;
    // console.log('!!! ANALYTICS - !!!!! SHOW SPINNER', this.showSpinner);
    return count;
  }

  goToEditAddPage_EDIT(dept_id: string) {
    console.log('!!! ANALYTICS - ALL REQUESTS X DEPT - GO TO DEPT ID ', dept_id);
    this.router.navigate(['project/' + this.id_project + '/department/edit', dept_id]);
  }



}
