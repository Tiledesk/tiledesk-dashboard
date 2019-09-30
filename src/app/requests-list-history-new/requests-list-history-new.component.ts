import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { RequestsService } from '../services/requests.service';
import { Request } from '../models/request-model';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { IMyDpOptions, IMyDateModel, IMyDate } from 'mydatepicker';
import { DepartmentService } from '../services/mongodb-department.service';
import { trigger, state, style, animate, transition, query, animateChild } from '@angular/animations';
import { UsersLocalDbService } from '../services/users-local-db.service';
import { BotLocalDbService } from '../services/bot-local-db.service';
import { UsersService } from '../services/users.service';
import { FaqKbService } from '../services/faq-kb.service';
import { avatarPlaceholder, getColorBck } from '../utils/util';
import { Subscription } from 'rxjs';
import { ProjectPlanService } from '../services/project-plan.service';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from '../core/notify.service';

@Component({
  selector: 'appdashboard-requests-list-history-new',
  templateUrl: './requests-list-history-new.component.html',
  styleUrls: ['./requests-list-history-new.component.scss'],
  animations: [
    trigger('ngIfAnimation', [
      transition(':enter, :leave', [
        query('@*', animateChild())
      ])
    ]),
    trigger('easeInOut', [
      transition('void => *', [
        style({
          opacity: 0
        }),
        animate('1s ease-in-out', style({
          opacity: 1
        }))
      ]),
      transition('* => void', [
        style({
          opacity: 1
        }),
        animate('1s ease-in-out', style({
          opacity: 0
        }))
      ])
    ])
  ]
})


export class RequestsListHistoryNewComponent implements OnInit, OnDestroy {

  @ViewChild('advancedoptionbtn') private advancedoptionbtnRef: ElementRef;
  @ViewChild('searchbtn') private searchbtnRef: ElementRef;
  @ViewChild('searchbtnbottom') private searchbtnbottomRef?: ElementRef;

  requestList: Request[];
  projectId: string;
  showSpinner: boolean;
  startDate: any;
  endDate: any;
  deptName: string;
  fullText: string;
  queryString: string;
  startDateValue: any;
  endDateValue: any;
  deptNameValue: string;
  deptIdValue: string;
  fullTextValue: string;
  selectedAgentValue: string;
  emailValue: string;

  showAdvancedSearchOption = false;
  hasFocused = false;
  departments: any;
  selectedDeptId: string;
  pageNo = 0
  totalPagesNo_roundToUp: number;
  displaysFooterPagination: boolean;
  currentUserID: string;
  requestsCount: number;

  user_and_bot_array = [];
  selectedAgentId: string;
  requester_email: string;
  REQUESTER_IS_VERIFIED = false;

  subscription: Subscription;
  prjct_profile_type: string;
  subscription_is_active: any;
  prjct_profile_name: string;
  subscription_end_date: Date;
  trial_expired: boolean;
  browserLang: string;

  date_picker_is_disabled: boolean;

  public myDatePickerOptions: IMyDpOptions = {
    // other options...
    dateFormat: 'dd/mm/yyyy',
    // dateFormat: 'yyyy, mm , dd',
  };

  constructor(
    private requestsService: RequestsService,
    private router: Router,
    public auth: AuthService,
    private usersLocalDbService: UsersLocalDbService,
    private botLocalDbService: BotLocalDbService,
    private departmentService: DepartmentService,
    private usersService: UsersService,
    private faqKbService: FaqKbService,
    private prjctPlanService: ProjectPlanService,
    private translate: TranslateService,
    private notify: NotifyService
  ) {  }

  ngOnInit() {
    // this.auth.checkRoleForCurrentProject();
    // selectedDeptId is assigned to empty so in the template will be selected the custom option ALL DEPARTMENTS
    this.selectedDeptId = '';
    // selectedAgentId is assigned to empty so in the template will be selected the custom option ALL AGENTS
    this.selectedAgentId = '';
    this.getCurrentUser();
    this.getRequests();
    this.getCurrentProject();
    this.getDepartments();
    this.getAllProjectUsers();
    this.getProjectPlan();
    this.getBrowserLang();
    // this.createBotsAndUsersArray();
  }

  getBrowserLang() {
    this.browserLang = this.translate.getBrowserLang();
  }

  getProjectPlan() {
    this.subscription = this.prjctPlanService.projectPlan$.subscribe((projectProfileData: any) => {
      console.log('ProjectPlanService (RequestsListHistoryNewComponent) project Profile Data', projectProfileData)
      if (projectProfileData) {

        this.prjct_profile_type = projectProfileData.profile_type;
        this.subscription_is_active = projectProfileData.subscription_is_active;

        this.subscription_end_date = projectProfileData.subscription_end_date;
        this.trial_expired = projectProfileData.trial_expired

        this.prjct_profile_name = this.buildPlanName(projectProfileData.profile_name, this.browserLang, this.prjct_profile_type);

        // tslint:disable-next-line:max-line-length
        if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false || this.prjct_profile_type === 'free' && this.trial_expired === true) {
          this.date_picker_is_disabled = true;
          // this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date)
        } else {
          this.date_picker_is_disabled = false;
        }
      }
    })
  }

  buildPlanName(planName: string, browserLang: string, planType: string) {
    if (planType === 'payment') {
      if (browserLang === 'it') {
        this.prjct_profile_name = 'Piano ' + planName;
        return this.prjct_profile_name
      } else if (browserLang !== 'it') {
        this.prjct_profile_name = planName + ' Plan';
        return this.prjct_profile_name
      }
    }
  }

  openModalSubsExpiredOrGoToPricing() {
    if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
      this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
    }
    if (this.prjct_profile_type === 'free' && this.trial_expired === true) {
      this.router.navigate(['project/' + this.projectId + '/pricing']);
    }
  }


  getAllProjectUsers() {
    // createBotsAndUsersArray() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      console.log('!!! NEW REQUESTS HISTORY  - GET PROJECT-USERS ', projectUsers);

      if (projectUsers) {
        projectUsers.forEach(user => {
          this.user_and_bot_array.push({ '_id': user.id_user._id, 'firstname': user.id_user.firstname, 'lastname': user.id_user.lastname });
        });

        console.log('!!! NEW REQUESTS HISTORY  - !!!! USERS ARRAY ', this.user_and_bot_array);
      }
    }, (error) => {
      console.log('!!! NEW REQUESTS HISTORY - GET PROJECT-USERS ', error);
    }, () => {
      console.log('!!! NEW REQUESTS HISTORY - GET PROJECT-USERS * COMPLETE *');
      this.getAllBot();
    });
  }

  getAllBot() {
    this.faqKbService.getFaqKbByProjectId().subscribe((bots: any) => {
      console.log('!!! NEW REQUESTS HISTORY  - GET  BOT ', bots);

      if (bots) {
        bots.forEach(bot => {
          this.user_and_bot_array.push({ '_id': 'bot_' + bot._id, 'firstname': bot.name + ' (bot)' });
        });
      }
      console.log('!!! NEW REQUESTS HISTORY  - BOTS & USERS ARRAY ', this.user_and_bot_array);
    }, (error) => {
      console.log('!!! NEW REQUESTS HISTORY - GET  BOT ', error);
    }, () => {
      console.log('!!! NEW REQUESTS HISTORY - GET  BOT * COMPLETE *');
    });
  }

  getCurrentUser() {
    const user = this.auth.user_bs.value
    console.log('!!! NEW REQUESTS HISTORY - LOGGED USER ', user);
    if (user) {
      // this.currentUserFireBaseUID = this.user.uid
      this.currentUserID = user._id
      console.log('!!! NEW REQUESTS HISTORY - USER UID ', this.currentUserID);
      // this.getToken();
    } else {
      // console.log('No user is signed in');
    }
  }


  getDepartments() {
    this.departmentService.getDeptsByProjectId().subscribe((_departments: any) => {
      console.log('!!! NEW REQUESTS HISTORY - GET DEPTS RESPONSE ', _departments);
      this.departments = _departments

    }, error => {
      console.log('!!! NEW REQUESTS HISTORY - GET DEPTS - ERROR: ', error);
    }, () => {
      console.log('!!! NEW REQUESTS HISTORY - GET DEPTS * COMPLETE *')
    });
  }

  /// PAGINATION
  decreasePageNumber() {
    this.pageNo -= 1;

    console.log('!!! NEW REQUESTS HISTORY - DECREASE PAGE NUMBER ', this.pageNo);
    this.getRequests()
  }

  increasePageNumber() {
    this.pageNo += 1;
    console.log('!!! NEW REQUESTS HISTORY - INCREASE PAGE NUMBER ', this.pageNo);
    this.getRequests()
  }

  toggle() {
    this.advancedoptionbtnRef.nativeElement.blur();
    this.showAdvancedSearchOption = !this.showAdvancedSearchOption;
    console.log('!!! NEW REQUESTS HISTORY - TOGGLE DIV ', this.showAdvancedSearchOption);
    this.displayHideFooterPagination();
  }

  // onDateStartChanged(event: IMyDateModel) {
  //   // event properties are: event.date, event.jsdate, event.formatted and event.epoc
  //   console.log('!!! NEW REQUESTS HISTORY - START DATE ', event.formatted);
  // }
  // onDateEndChanged(event: IMyDateModel) {
  //   // event properties are: event.date, event.jsdate, event.formatted and event.epoc
  //   console.log('!!! NEW REQUESTS HISTORY - END DATE ', event.formatted);
  // }
  // advancedOptions() {
  //   console.log('!!! NEW REQUESTS HISTORY - HAS CLICKED ADAVANCED OPTION');
  //   this.advancedoptionbtnRef.nativeElement.blur();
  // }

  // focusOnFullText() {
  //   console.log('!!! NEW REQUESTS HISTORY - FOCUS ON FULL TEXT');
  //   this.hasFocused = true;
  //   // event.stopPropagation();​
  // }

  clearFullText() {
    this.fullText = '';

    if (this.selectedDeptId) {
      this.deptIdValue = this.selectedDeptId;
    } else {
      this.deptIdValue = ''
    }

    if (this.startDate) {
      this.startDateValue = this.startDate['formatted']
    } else {
      this.startDateValue = ''
    }

    if (this.endDate) {
      this.endDateValue = this.endDate['formatted']
    } else {
      this.endDateValue = ''
    }

    if (this.selectedAgentId) {
      this.selectedAgentValue = this.selectedAgentId;
    } else {
      this.selectedAgentValue = ''
    }

    if (this.requester_email) {
      this.emailValue = this.requester_email;
    } else {
      this.emailValue = ''
    }
    // tslint:disable-next-line:max-line-length

    this.queryString =
      'full_text='
      + '&' +
      'dept_id=' + this.deptIdValue
      + '&' +
      'start_date=' + this.startDateValue
      + '&' +
      'end_date=' + this.endDateValue
      + '&' +
      'participant=' + this.selectedAgentValue
      + '&' +
      'requester_email=' + this.emailValue

    this.pageNo = 0
    this.getRequests();

  }

  clearSearch() {
    // RESOLVE THE BUG: THE BUTTON CLEAR-SEARCH REMAIN FOCUSED AFTER PRESSED
    const clearSearchBtn = <HTMLElement>document.querySelector('.clearsearchbtn');
    console.log('!!! NEW REQUESTS HISTORY - CLEAR SEARCH BTN', clearSearchBtn)
    clearSearchBtn.blur()

    this.fullText = '';
    this.selectedDeptId = '';
    this.startDate = '';
    this.endDate = '';
    this.selectedAgentId = '';
    this.requester_email = '';
    // this.fullTextValue = '';
    // this.deptIdValue = '';
    // this.startDateValue = '';
    // this.endDateValue = '';
    // tslint:disable-next-line:max-line-length
    this.queryString = 'full_text=' + '&' + 'dept_id=' + '&' + 'start_date=' + '&' + 'end_date=' + '&' + 'participant=' + '&' + 'requester_email=';
    this.pageNo = 0;
    console.log('!!! NEW REQUESTS HISTORY - CLEAR SEARCH fullTextValue ', this.fullTextValue)

    this.getRequests();

  }

  search() {
    this.pageNo = 0

    // RESOLVE THE BUG: THE BUTTON CLEAR-SEARCH REMAIN FOCUSED AFTER PRESSED (doesn't works - so is used the below code)
    // this.searchbtnRef.nativeElement.blur();

    // RESOLVE THE BUG: THE BUTTON SEARCH REMAIN FOCUSED AFTER PRESSED
    const searchTopBtn = <HTMLElement>document.querySelector('.searchTopBtn');
    console.log('!!! NEW REQUESTS HISTORY - TOP SEARCH BTN ', searchTopBtn)
    searchTopBtn.blur()

    if (this.searchbtnbottomRef) {
      this.searchbtnbottomRef.nativeElement.blur();
    }

    if (this.fullText) {

      this.fullTextValue = this.fullText;
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR FULL TEXT ', this.fullTextValue);
    } else {
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR DEPT TEXT ', this.fullText);
      this.fullTextValue = ''
    }

    if (this.selectedDeptId) {

      this.deptIdValue = this.selectedDeptId;
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR DEPT ID ', this.deptIdValue);
    } else {
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR DEPT ID ', this.selectedDeptId);
      this.deptIdValue = ''
    }

    if (this.startDate) {
      console.log('!!! NEW REQUESTS HISTORY - START DATE ', this.startDate);
      console.log('!!! NEW REQUESTS HISTORY - START DATE - FORMATTED ', this.startDate['formatted']);
      console.log('!!! NEW REQUESTS HISTORY - START DATE - EPOC ', this.startDate['epoc']);
      // console.log('!!! NEW REQUESTS HISTORY - START DATE - GETS TIME ', new Date((this.startDate['jsdate'].getTime())));


      // this.startDateValue = this.startDate['epoc']
      // this.startDateValue = this.startDate['epoc'] * 1000
      this.startDateValue = this.startDate['formatted']

      // console.log('!!! NEW REQUESTS HISTORY - START DATE - TIMESTAMP ', new Date(this.startDate['formatted']).getTime());
      // this.startDateValue = this.startDate['jsdate'].getTime()
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR START DATE ', this.startDateValue);
    } else {
      this.startDateValue = '';
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR START DATE ', this.startDate);
    }

    if (this.endDate) {
      console.log('!!! NEW REQUESTS HISTORY - END DATE ', this.endDate);
      console.log('!!! NEW REQUESTS HISTORY - END DATE - FORMATTED ', this.endDate['formatted']);
      console.log('!!! NEW REQUESTS HISTORY - END DATE - EPOC ', this.endDate['epoc']);

      // this.endDateValue = this.endDate['epoc'];
      // this.endDateValue = this.endDate['epoc'] * 1000;
      this.endDateValue = this.endDate['formatted']

      // this.endDateValue = this.endDate['jsdate'].getTime()
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR END DATE ', this.endDateValue);
    } else {
      this.endDateValue = '';
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR END DATE ', this.endDate)
    }

    // selectedAgentId: string;
    // requester_email: string;

    if (this.selectedAgentId) {

      this.selectedAgentValue = this.selectedAgentId;
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR selectedAgentId ', this.selectedAgentValue);
    } else {
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR selectedAgentId ', this.selectedAgentId);
      this.selectedAgentValue = ''
    }

    if (this.selectedAgentId) {
      this.selectedAgentValue = this.selectedAgentId;
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR selectedAgentId ', this.selectedAgentValue);
    } else {
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR selectedAgentId ', this.selectedAgentId);
      this.selectedAgentValue = ''
    }

    if (this.requester_email) {
      this.emailValue = this.requester_email;
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR email ', this.emailValue);
    } else {
      console.log('!!! NEW REQUESTS HISTORY - SEARCH FOR email ', this.requester_email);
      this.emailValue = ''
    }
    // console.log('!!! NEW REQUESTS HISTORY - DEPT NAME ', this.deptame);


    // if (this.fullText !== undefined && this.deptName !== undefined && this.startDate !== undefined || this.endDate !== undefined) {
    // tslint:disable-next-line:max-line-length
    this.queryString =
      'full_text=' + this.fullTextValue + '&'
      + 'dept_id=' + this.deptIdValue + '&'
      + 'start_date=' + this.startDateValue + '&'
      + 'end_date=' + this.endDateValue + '&'
      + 'participant=' + this.selectedAgentValue + '&'
      + 'requester_email=' + this.emailValue

    console.log('!!! NEW REQUESTS HISTORY - QUERY STRING ', this.queryString);

    // REOPEN THE ADVANCED OPTION DIV IF IT IS CLOSED BUT ONE OF SEARCH FIELDS IN IT CONTAINED ARE VALORIZED
    if (this.showAdvancedSearchOption === false) {
      if (this.selectedDeptId || this.startDate || this.endDate || this.selectedAgentId || this.requester_email) {
        this.showAdvancedSearchOption = true;
      }
    }
    this.getRequests()
  }


  displayHideFooterPagination() {
    // DISPLAY / HIDE PAGINATION IN THE FOOTER
    if ((this.showAdvancedSearchOption === true && this.requestsCount >= 10) || (this.requestsCount >= 16)) {
      this.displaysFooterPagination = true;
      // tslint:disable-next-line:max-line-length
      console.log('!!! NEW REQUESTS HISTORY - REQST COUNT ', this.requestsCount, 'ADVANCED OPTION IS OPEN ', this.showAdvancedSearchOption, 'DISPLAY FOOTER PAG ', this.displaysFooterPagination);
    } else {
      this.displaysFooterPagination = false;
      // tslint:disable-next-line:max-line-length
      console.log('!!! NEW REQUESTS HISTORY - REQST COUNT ', this.requestsCount, 'ADVANCED OPTION IS OPEN ', this.showAdvancedSearchOption, 'DISPLAY FOOTER PAG ', this.displaysFooterPagination);
    }
  }

  exportRequestsToCSV() {
    // tslint:disable-next-line:max-line-length
    if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false || this.prjct_profile_type === 'free' && this.trial_expired === true) {
      this.notify.openDataExportNotAvailable()
    } else {
      const exportToCsvBtn = <HTMLElement>document.querySelector('.export-to-csv-btn');
      console.log('!!! NEW REQUESTS HISTORY - EXPORT TO CSV BTN', exportToCsvBtn)
      exportToCsvBtn.blur()

      this.requestsService.downloadNodeJsHistoryRequestsAsCsv(this.queryString, 0).subscribe((requests: any) => {
        if (requests) {
          console.log('!!! NEW REQUESTS HISTORY - DOWNLOAD REQUESTS AS CSV - RES ', requests);

          // const reqNoLineBreaks = requests.replace(/(\r\n\t|\n|\r\t)/gm, ' ');
          // console.log('!!! DOWNLOAD REQUESTS AS CSV - REQUESTS NO NEW LINE ', reqNoLineBreaks);
          this.downloadFile(requests)
        }
      }, error => {
        console.log('!!! NEW REQUESTS HISTORY - DOWNLOAD REQUESTS AS CSV - ERROR: ', error);
      }, () => {
        console.log('!!! NEW REQUESTS HISTORY - DOWNLOAD REQUESTS AS CSV * COMPLETE *')
      });

    }
  }


  downloadFile(data) {
    const blob = new Blob(['\ufeff' + data], { type: 'text/csv;charset=utf-8;' });
    const dwldLink = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const isSafariBrowser = navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
    if (isSafariBrowser) {  // if Safari open in new window to save file with random filename.
      dwldLink.setAttribute('target', '_blank');
    }
    dwldLink.setAttribute('href', url);
    dwldLink.setAttribute('download', 'requests.csv');
    dwldLink.style.visibility = 'hidden';
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }


  getRequests() {
    this.showSpinner = true;
    this.requestsService.getNodeJsHistoryRequests(this.queryString, this.pageNo).subscribe((requests: any) => {
      console.log('!!! NEW REQUESTS HISTORY - GET REQUESTS ', requests['requests']);
      console.log('!!! NEW REQUESTS HISTORY - GET REQUESTS COUNT ', requests['count']);
      if (requests) {

        // this.requestsCount = 18; // for test
        this.requestsCount = requests['count'];
        console.log('!!! NEW REQUESTS HISTORY - GET REQUESTS COUNT ', this.requestsCount);

        this.displayHideFooterPagination();

        const requestsPerPage = requests['perPage'];
        console.log('!!! NEW REQUESTS HISTORY - TOTAL PAGES REQUESTS X PAGE', requestsPerPage);

        const totalPagesNo = this.requestsCount / requestsPerPage;
        console.log('!!! NEW REQUESTS HISTORY - TOTAL PAGES NUMBER', totalPagesNo);

        this.totalPagesNo_roundToUp = Math.ceil(totalPagesNo);
        console.log('!!! NEW REQUESTS HISTORY - TOTAL PAGES No ROUND TO UP ', this.totalPagesNo_roundToUp);

        // const firstIndex = requestsPerPage * this.pageNo;
        // console.log('!!! NEW REQUESTS HISTORY - firstIndex ', firstIndex);

        // const lastIndex = requestsPerPage * (this.pageNo + 1) - 1
        // console.log('!!! NEW REQUESTS HISTORY - lastIndex ', lastIndex);

        this.requestList = requests['requests'];

        for (const request of this.requestList) {

          if (request) {
            // console.log('!!! NEW REQUESTS HISTORY - request ', request);

            let newInitials = '';
            let newFillColour = '';

            if (request.lead && request.lead.fullname) {
              newInitials = avatarPlaceholder(request.lead.fullname);
              newFillColour = getColorBck(request.lead.fullname)
            } else {

              newInitials = 'n.a.';
              newFillColour = '#eeeeee';
            }

            request.requester_fullname_initial = newInitials;
            request.requester_fullname_fillColour = newFillColour;
            // .authVar.token.firebase.sign_in_provider
            // console.log('---- lead sign_in_provider ',  request.lead.attributes.senderAuthInfo);
            if (request.lead
              && request.lead.attributes
              && request.lead.attributes.senderAuthInfo
              && request.lead.attributes.senderAuthInfo.authVar
              && request.lead.attributes.senderAuthInfo.authVar.token
              && request.lead.attributes.senderAuthInfo.authVar.token.firebase
              && request.lead.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider
            ) {
              if (request.lead.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider === 'custom') {

                // console.log('- lead sign_in_provider ',  request.lead.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider);
                this.REQUESTER_IS_VERIFIED = true;
              } else {
                // console.log('- lead sign_in_provider ',  request.lead.attributes.senderAuthInfo.authVar.token.firebase.sign_in_provider);
                this.REQUESTER_IS_VERIFIED = false;
              }

            } else {
              this.REQUESTER_IS_VERIFIED = false;
            }

            request.requester_is_verified = this.REQUESTER_IS_VERIFIED


          }

        }

        // let flat_participants_array = [];
        // const requesters_id_array = []
        // this.requestList.forEach(request => {
        //   flat_participants_array = flat_participants_array.concat(request.participants);
        //   requesters_id_array.push(request.requester_id)
        // });
        // console.log('!!! NEW REQUESTS HISTORY - FLAT PARTICIPANTS ARRAY ', flat_participants_array);
        // console.log('!!! NEW REQUESTS HISTORY - ARRAY OF REQUESTER ID ', requesters_id_array);

        // REQUESTER ID ARRAY WITHOUT DUPLICATE
        // const cleaned_requester_id_array = [];
        // requesters_id_array.forEach(requester => {

        //   if (cleaned_requester_id_array.indexOf(requester) < 0) {
        //     cleaned_requester_id_array.push(requester)
        //   }
        // });
        // console.log('!!! NEW REQUESTS HISTORY - ARRAY OF REQUESTER ID WITHOUT DUPLICATE', cleaned_requester_id_array);

        // const participants_array = []
        // flat_participants_array.forEach(participant => {
        //   if (participants_array.indexOf(participant) < 0) {
        // tslint:disable-next-line:max-line-length
        //     // console.log('!!! NEW REQUESTS HISTORY - FLAT PARTICIPANTS ARRAY ! FILTERED INDEX OF', participants_array.indexOf(participant));
        //     if (participant !== 'system') {
        //       participants_array.push(participant)
        //     }

        //   }
        // });
        // console.log('!!! NEW REQUESTS HISTORY - FLAT PARTICIPANTS ARRAY ! CLEANED FROM DUPLICATE ', participants_array);

        // participants_array.forEach(participant => {
        //   if (participant.includes('bot_') === true) {

        //     console.log('!!! NEW REQUESTS HISTORY - PARTICIPANTS ARRAY BOT ID ', participant);
        //   } else {

        //     console.log('!!! NEW REQUESTS HISTORY - PARTICIPANTS ARRAY USER ID ', participant);
        //   }
        // });
      }

    }, error => {
      this.showSpinner = false;
      console.log('!!! NEW REQUESTS HISTORY  - GET REQUESTS - ERROR: ', error);
    }, () => {
      this.showSpinner = false;
      console.log('!!! NEW REQUESTS HISTORY  - GET REQUESTS * COMPLETE *')
    });
  }

  members_replace(member_id) {
    // console.log('!!! NEW REQUESTS HISTORY  - SERVED BY ID ', member_id)
    // console.log(' !!! NEW REQUESTS HISTORY underscore found in the participant id  ', member_id, member_id.includes('bot_'));

    const participantIsBot = member_id.includes('bot_')

    if (participantIsBot === true) {

      const bot_id = member_id.slice(4);
      // console.log('!!! NEW REQUESTS HISTORY - THE PARTICIP', member_id, 'IS A BOT ', participantIsBot, ' - ID ', bot_id);

      const bot = this.botLocalDbService.getBotFromStorage(bot_id);
      if (bot) {
        // '- ' +
        return member_id = bot['name'] + ' (bot)';
      } else {
        // '- ' +
        return member_id
      }

    } else {

      const user = this.usersLocalDbService.getMemberFromStorage(member_id);
      if (user) {
        // console.log('user ', user)
        const lastnameInizial = user['lastname'].charAt(0);
        // '- ' +
        return member_id = user['firstname'] + ' ' + lastnameInizial + '.'
      } else {
        // '- ' +
        return member_id
      }
    }
  }

  goToMemberProfile(member_id: any) {
    console.log('!!! NEW REQUESTS HISTORY has clicked GO To MEMBER ', member_id);
    if (member_id.indexOf('bot_') !== -1) {
      console.log('!!! NEW REQUESTS HISTORY IS A BOT !');

      this.router.navigate(['project/' + this.projectId + '/botprofile/' + member_id]);
    } else {
      this.router.navigate(['project/' + this.projectId + '/member/' + member_id]);
    }
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {

      console.log('00 -> NEW REQUEST-LIST HISTORY - PRJCT FROM SUBSCRIPTION TO AUTH SERV  ', project)

      if (project) {
        this.projectId = project._id;

      }
    });
  }

  getRequestText(text: string): string {
    if (text) {
      return text.length >= 30 ?
        text.slice(0, 30) + '...' :
        text;
    }
  }

  goToRequestMsgs(request_recipient: string) {
    this.router.navigate(['project/' + this.projectId + '/request/' + request_recipient + '/messages']);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
