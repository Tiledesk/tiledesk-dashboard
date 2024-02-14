import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { UsersService } from '../services/users.service';
import { AuthService } from '../core/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
// import * as moment from 'moment';
import moment from "moment";

// import { IMyDpOptions, IMyDateModel } from 'mydatepicker';
import { LocalDbService } from '../services/users-local-db.service';
import { BotLocalDbService } from '../services/bot-local-db.service';

import 'moment/locale/it.js';
import 'moment/locale/en-gb.js';
import { Subscription } from 'rxjs'
import { LoggerService } from '../services/logger/logger.service';
import { ActivitiesService } from './activities-service/activities.service';
import { FormGroup, FormControl } from '@angular/forms';
import { goToCDSVersion } from 'app/utils/util';
import { AppConfigService } from 'app/services/app-config.service';
@Component({
  selector: 'appdashboard-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss']
})

export class ActivitiesComponent implements OnInit, OnDestroy {
  @ViewChild('searchbtn', { static: false }) searchbtnRef: ElementRef;
  @ViewChild('clearsearchbtn', { static: false }) clearsearchbtnRef: ElementRef;
  @ViewChild('exportcsvbtn', { static: false }) exportcsvbtnRef: ElementRef;

  // range = new FormGroup({
  //   start: new FormControl(),
  //   end: new FormControl(),
  // });

  projectId: string;
  projectUserIdOfcurrentUser: string;
  currentUserId: string;
  usersActivities: any;
  browser_lang: string;
  // showSpinner = true;
  showSpinner: boolean;
  pageNo = 0
  totalPagesNo_roundToUp: number;

  queryString: string;
  startDate: any;
  startDateTemp: any;
  startDateValue: any;

  endDate: any;
  endDateTemp: any;
  endDateValue: any;

  selectedAgentId: string;
  selectedAgentValue: string;

  agentsList = [];
  direction = -1;

  // public myDatePickerOptions: IMyDpOptions = {
  //   // other options...
  //   dateFormat: 'dd/mm/yyyy',
  //   // dateFormat: 'yyyy, mm , dd',
  // };

  selectedActivities: any;
  arrayOfSelectedActivity: any;
  hasAscDirection = false;
  activities: any;
  agentAvailabilityOrRoleChange: string;
  agentDeletion: string;
  agentInvitation: string;
  newRequest: string;
  requestResolved: string;
  asc: any;
  subscription: Subscription;
  projectUsersArray: any;
  objectKeys = Object.keys;
  isChromeVerGreaterThan100: boolean;
  constructor(
    private usersService: UsersService,
    public auth: AuthService,
    private translate: TranslateService,
    private router: Router,
    private usersLocalDbService: LocalDbService,
    private botLocalDbService: BotLocalDbService,
    private logger: LoggerService,
    private activitiesService: ActivitiesService,
    public appConfigService: AppConfigService,
  ) { }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.selectedAgentId = '';
    this.getBrowserLanguage();
    this.getCurrentProject();
    // this.getLoggedUserAndHisProjectUserId();
    this.getActivities();
    this.getCurrentUser();
    this.getAllProjectUsers();
    this.buildActivitiesOptions();
    this.getBrowserVersion();
  }

  

  ngOnDestroy() {
    this.logger.log('[ActivitiesComponent] % »»» WebSocketJs WF +++++ ws-requests--- activities ngOnDestroy')
    this.subscription.unsubscribe();
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
      //  this.logger.log("[BOT-CREATE] isChromeVerGreaterThan100 ",this.isChromeVerGreaterThan100);
    })
  }

  getAllProjectUsers() {
    // createBotsAndUsersArray() {
    this.usersService.getProjectUsersByProjectId()
      .subscribe((projectUsers: any) => {
        this.logger.log('[ActivitiesComponent] - GET PROJECT-USERS ', projectUsers);

        if (projectUsers) {
          this.projectUsersArray = projectUsers;

          projectUsers.forEach(user => {
            this.logger.log('[ActivitiesComponent] - PROJECT-USER ', user);
            // tslint:disable-next-line:max-line-length
            this.agentsList.push({ '_id': user.id_user._id, 'firstname': user.id_user.firstname, 'lastname': user.id_user.lastname });
          });

          // this.logger.log('!!! NEW REQUESTS HISTORY  - !!!! USERS ARRAY ', this.user_and_bot_array);

        }
      }, (error) => {
        this.logger.error('[ActivitiesComponent] - GET PROJECT-USERS ', error);
      }, () => {
        this.logger.log('[ActivitiesComponent] - GET PROJECT-USERS * COMPLETE *');

      });

  }


  getBrowserLanguage() {
    this.browser_lang = this.translate.getBrowserLang();
    // this.logger.log('[ActivitiesComponent] - browser_lang ', this.browser_lang)
  }

  getCurrentProject() {
    this.subscription = this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectId = project._id
        this.logger.log('[ActivitiesComponent] - projectId ', this.projectId)
      }
    });
  }

  getCurrentUser() {
    this.auth.user_bs.subscribe((user) => {
      this.logger.log('[ActivitiesComponent] - LoggedUser ', user);

      if (user && user._id) {
        this.currentUserId = user._id;
      }
    });
  }



  addEventStartDate(value) {
    this.logger.log('[ActivitiesComponent] - addEventEndDate value', value);
    this.startDateTemp = moment(value).format('DD/MM/YYYY');
    this.logger.log('[ActivitiesComponent] - startDateTemp ', this.startDateTemp);
  }

  addEventEndDate(value) {
    this.logger.log('[ActivitiesComponent] - addEventEndDate value', value);
    this.endDateTemp = moment(value).format('DD/MM/YYYY')
    this.logger.log('[ActivitiesComponent] - endDateTemp ', this.endDateTemp);
  }

  clearDateRange() {
    this.logger.log('[ActivitiesComponent] - CLEAR DATE RANGE');
    this.startDateTemp = null
    this.startDateTemp = null
    this.startDate = null
    this.endDate = null
  }

  getQueryStringValues() {
    if (this.startDate) {
      this.logger.log('[ActivitiesComponent] - search START DATE ', this.startDate);

      // this.startDate = this.startDateTemp
      this.startDateValue = this.startDateTemp
      this.logger.log('[ActivitiesComponent] - search START DATE - startDateValue ', this.startDateValue);
    } else {
      this.startDateValue = '';
      this.logger.log('[ActivitiesComponent] - search START DATE ', this.startDate);
      this.logger.log('[ActivitiesComponent] - search START DATE - startDateValue ', this.startDateValue);
    }

    if (this.endDate) {
      this.logger.log('[ActivitiesComponent] - END DATE ', this.endDate);
      this.logger.log('[ActivitiesComponent] - SEARCH FOR END DATE ', this.endDate);
      // this.endDate = this.endDateTemp
      this.endDateValue = this.endDateTemp
      this.logger.log('[ActivitiesComponent] - END DATE - endDateValue ', this.endDateValue);

    } else {
      this.endDateValue = '';
      this.logger.log('[ActivitiesComponent] - SEARCH FOR END DATE ', this.endDate)
      this.logger.log('[ActivitiesComponent] - END DATE - endDateValue ', this.endDateValue);
    }

    if (this.selectedAgentId) {

      this.selectedAgentValue = this.selectedAgentId;
      this.logger.log('[ActivitiesComponent] - SEARCH FOR selectedAgentId ', this.selectedAgentValue);
    } else {
      this.logger.log('[ActivitiesComponent] - SEARCH FOR selectedAgentId ', this.selectedAgentId);
      this.selectedAgentValue = '';
    }

    if (this.selectedActivities) {
      this.logger.log('[ActivitiesComponent] - search ***** selectedActivities *****', this.selectedActivities);
      this.arrayOfSelectedActivity = this.selectedActivities;
      this.logger.log('[ActivitiesComponent] - search ***** arrayOfSelectedActivity *****', this.arrayOfSelectedActivity);
    } else {
      this.arrayOfSelectedActivity = '';
    }

    this.logger.log('[ActivitiesComponent] - hasAscDirection ', this.hasAscDirection);
    if (this.hasAscDirection === true) {
      this.direction = 1
    } else {
      this.direction = -1
    }

  }

  buildActivitiesOptions() {
    this.translate.get('ActivitiesOptions')
      .subscribe((text: any) => {
        // this.logger.log('translateActivities text ', text)
        this.agentAvailabilityOrRoleChange = text.AgentAvailabilityOrRoleChange;
        this.agentDeletion = text.AgentDeletion;
        this.agentInvitation = text.AgentInvitation;
        this.newRequest = text.NewRequest;
        this.requestResolved = text.RequestResolved;
        // this.logger.log('translateActivities AgentAvailabilityOrRoleChange ', text.AgentAvailabilityOrRoleChange)
        // this.logger.log('translateActivities AgentDeletion ', text.AgentDeletion)
        // this.logger.log('translateActivities AgentDeletion ', text.AgentInvitation)
        // this.logger.log('translateActivities newRequest ', text.NewRequest)
      }, (error) => {
        this.logger.error('[ActivitiesComponent] - GET translations error ', error);
      }, () => {
        this.logger.log('[ActivitiesComponent] - GET translations * COMPLETE *');

        this.activities = [
          { id: 'PROJECT_USER_UPDATE', name: this.agentAvailabilityOrRoleChange },
          { id: 'PROJECT_USER_DELETE', name: this.agentDeletion },
          { id: 'PROJECT_USER_INVITE', name: this.agentInvitation },
          { id: 'REQUEST_CREATE', name: this.newRequest },
          { id: 'REQUEST_CLOSE', name: this.requestResolved },
        ];
      });
  }



  search() {
    // RESOLVE THE BUG: THE BUTTON SEARCH REMAIN FOCUSED AFTER PRESSED
    this.searchbtnRef.nativeElement.blur();
    this.pageNo = 0

    this.getQueryStringValues();

    this.queryString =
      'start_date=' + this.startDateValue + '&' +
      'end_date=' + this.endDateValue + '&' +
      'agent_id=' + this.selectedAgentValue + '&' +
      'activities=' + this.arrayOfSelectedActivity + '&' +
      'direction=' + this.direction


    this.getActivities();
  }

  clearSearch() {
    // RESOLVE THE BUG: THE BUTTON CLEAR SEARCH REMAIN FOCUSED AFTER PRESSED
    this.clearsearchbtnRef.nativeElement.blur();

    this.pageNo = 0;

    this.startDate = '';
    this.endDate = '';
    this.selectedActivities = '';
    this.selectedAgentId = '';
    this.startDateTemp = null
    this.endDateTemp = null


    this.queryString =
      'start_date=' + '&' +
      'end_date=' + '&' +
      'agent_id=' + '&' +
      'activities=' + '&' +
      'direction=' + this.direction;

    this.getActivities();
  }


  sortDirection(_hasAscDirection: boolean) {
    this.hasAscDirection = _hasAscDirection;

    this.getQueryStringValues();

    this.queryString =
      'start_date=' + this.startDateValue + '&' +
      'end_date=' + this.endDateValue + '&' +
      'agent_id=' + this.selectedAgentValue + '&' +
      'activities=' + this.arrayOfSelectedActivity + '&' +
      'direction=' + this.direction


    this.getActivities();
  }



  getActivities() {
    this.showSpinner = true;
    this.activitiesService.getUsersActivities(this.queryString, this.pageNo)
      .subscribe((res: any) => {
        this.logger.log('[ActivitiesComponent] - getActivities - **** RESPONSE **** ', res);
        if (res) {
          const perPage = res.perPage;
          const count = res.count;
          this.logger.log('[ActivitiesComponent] - getActivities RESPONSE - per Page ', perPage);
          this.logger.log('[ActivitiesComponent] - getActivities RESPONSE - count ', count);



          const totalPagesNo = count / perPage;
          this.logger.log('[ActivitiesComponent] - TOTAL PAGES NUMBER', totalPagesNo);

          this.totalPagesNo_roundToUp = Math.ceil(totalPagesNo);
          this.logger.log('[ActivitiesComponent] - TOTAL PAGES No ROUND TO UP ', this.totalPagesNo_roundToUp);

          if (res.activities) {
            this.usersActivities = res.activities;
            this.usersActivities.forEach((activity: any) => {
              this.logger.log('[ActivitiesComponent] - getActivities RESPONSE - activity ', activity);

              if (activity && activity.verb && activity.verb === 'PROJECT_USER_UPDATE') {
                if (activity.actor &&
                  activity.actor.id &&
                  activity.target &&
                  activity.target.object &&
                  activity.target.object.id_user &&
                  activity.target.object.id_user._id) {


                  if (activity.actor.id === activity.target.object.id_user._id) {
                    activity.targetOfActionIsYourself = true;
                  } else {
                    activity.targetOfActionIsYourself = false;
                  }
                }
              }

              if (activity && activity.verb && activity.verb === 'REQUEST_CLOSE') {
                if (activity.actor && activity.actor.id) {

                  if (activity.actor.id === "_bot_unresponsive") {
                    activity['closed_by_label'] = "auto closing Bot"
                  } else if (activity.actor.id === "_trigger") {
                    activity['closed_by_label'] = "Trigger"
                  } else {
                    const storedTeammate = this.usersLocalDbService.getMemberFromStorage(activity.actor.id)
                    if (storedTeammate) {
                      activity['closed_by_label'] = storedTeammate['firstname'] + ' ' + storedTeammate['lastname']
                    } else {
                      this.usersService.getProjectUserByUserId(activity.actor.id)
                        .subscribe((projectUser: any) => {

                          if (projectUser && projectUser[0] && projectUser[0].id_user) {
                            this.usersLocalDbService.saveMembersInStorage(projectUser[0].id_user._id, projectUser[0].id_user, 'activities');
                            this.logger.log('ActivitiesComponent] GET projectUser by USER-ID projectUser id', projectUser);
                            activity['closed_by_label'] = projectUser[0].id_user.firstname + ' ' + projectUser[0].id_user.lastname
                          } else {

                            activity['closed_by_label'] = activity.target.object.userFullname
                          }
                        }, (error) => {
                          this.logger.error('[ActivitiesComponent] GET projectUser by USER-ID - ERROR ', error);
                        }, () => {
                          this.logger.log('[ActivitiesComponent] GET projectUser by USER-ID * COMPLETE *');
                        });
                    }
                  }

                }
              }

              let stored_preferred_lang = undefined
              if (this.auth.user_bs && this.auth.user_bs.value) {
                stored_preferred_lang = localStorage.getItem(this.auth.user_bs.value._id + '_lang')
              }

              let dshbrd_lang = ''
              if (this.browser_lang && !stored_preferred_lang) {
                dshbrd_lang = this.browser_lang
              } else if (this.browser_lang && stored_preferred_lang) {
                dshbrd_lang = stored_preferred_lang
              }

              if (dshbrd_lang === 'en') {
                moment.locale('en')
                const date = moment(activity.updatedAt).format('dddd, MMM DD, YYYY - HH:mm:ss');
                this.logger.log('[ActivitiesComponent] - getActivities - updatedAt date', date);
                activity.date = date;
              } else {
                moment.locale(dshbrd_lang)
                const date = moment(activity.updatedAt).format('dddd, DD MMM YYYY - HH:mm:ss');
                this.logger.log('[ActivitiesComponent] - getActivities - updatedAt date', date);
                activity.date = date;
              }

              // used for the new request
              if (activity && activity.target && activity.target.object && activity.target.object.first_text) {

                this.logger.log('[ActivitiesComponent] - getActivities - first_text:  ', activity.target.object.first_text);

                if (activity.target.object.first_text.length >= 30) {

                  activity.activity_request_text = activity.target.object.first_text.slice(0, 30) + '...';

                } else {
                  activity.activity_request_text = activity.target.object.first_text
                }

                if (activity.target && activity.target.object && activity.target.object.status === 200) {

                  if (activity.target && activity.target.object && activity.target.object.participants) {

                    const participantId = activity.target.object.participants[0]
                    this.logger.log('ActivitiesComponent participant ', participantId);

                    if (participantId && participantId.includes('bot_')) {
                      this.logger.log('[ActivitiesComponent] participant includes bot with id ', participantId);
                      const bot_id = participantId.slice(4);
                      this.logger.log('[ActivitiesComponent] participant includes bot with id slice(4)', bot_id);

                      let bot: any

                      setTimeout(() => {
                        bot = this.botLocalDbService.getBotFromStorage(bot_id);
                        this.logger.log('[ActivitiesComponent] participant bot', bot);
                        if (bot) {
                          let botType = "";
                          if (bot.type === 'internal') {

                            botType = 'native'
                          } else {
                            botType = bot.type
                          }
                          // activity.participant_fullname = bot.name + ` (${botType} bot)`
                          activity.participant_fullname = bot.name + ` (chatbot)`
                          this.logger.log('[ActivitiesComponent] participant bot name', activity.participant_fullname);
                        }
                      }, 50);

                    } else {

                      const user = this.usersLocalDbService.getMemberFromStorage(participantId);
                      this.logger.log('[ActivitiesComponent] participant - user', user);

                      if (user !== null) {
                        activity.participant_fullname = user['firstname'] + ' ' + user['lastname']
                      } else {
                        activity.participant_fullname = 'n.d.'
                      }
                    }
                  }
                }
              }
            });
          }
        }

      }, (error) => {
        this.showSpinner = false;
        this.logger.error('[ActivitiesComponent] - getActivities - ERROR ', error);
      }, () => {
        this.logger.log('[ActivitiesComponent] - getActivities * COMPLETE *');
        this.showSpinner = false;
      });
  }

  /// PAGINATION
  decreasePageNumber() {
    this.pageNo -= 1;

    this.logger.log('[ActivitiesComponent] - DECREASE PAGE NUMBER ', this.pageNo);
    this.getActivities();
  }

  increasePageNumber() {
    this.pageNo += 1;

    this.logger.log('[ActivitiesComponent] - INCREASE PAGE NUMBER ', this.pageNo);
    this.getActivities();
  }

  exportActivitiesAsCSV() {
    // RESOLVE THE BUG: THE BUTTON REMAIN FOCUSED AFTER PRESSED
    this.exportcsvbtnRef.nativeElement.blur();

    this.usersService.downloadActivitiesAsCsv(this.queryString, 0, this.browser_lang)
      .subscribe((res: any) => {
        this.logger.log('[ActivitiesComponent] - downloadActivitiesAsCsv - res ', res);

        if (res) {
          this.downloadFile(res)
        }

      }, (error) => {

        this.logger.error('[ActivitiesComponent] - downloadActivitiesAsCsv - ERROR ', error);
      }, () => {
        this.logger.log('[ActivitiesComponent] - downloadActivitiesAsCsv * COMPLETE *');

      });
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
    dwldLink.setAttribute('download', 'activities.csv');
    dwldLink.style.visibility = 'hidden';
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  // goToBotProfile(bot: FaqKb) {
  //   let botType = ''
  //   if (bot.type === 'internal') {
  //     botType = 'native'

  //       this.router.navigate(['project/' + this.project._id + '/bots/intents/', bot._id, botType]);
  //     }
  //   } else if (bot.type === 'tilebot') {
  //     botType = 'tilebot'

  //       // this.router.navigate(['project/' + this.project._id + '/tilebot/intents/', bot_id, botType]);
  //       // this.router.navigate(['project/' + this.project._id + '/cds/', bot._id, 'intent', '0']);
  //       goToCDSVersion(this.router, bot, this.project._id, this.appConfigService.getConfig().cdsBaseUrl)
  //     }
  //   } else if (bot.type === 'tiledesk-ai') {
  //     botType = 'tiledesk-ai'

  //       // this.router.navigate(['project/' + this.project._id + '/tilebot/intents/', bot_id, botType]);
  //       // this.router.navigate(['project/' + this.project._id + '/cds/', bot._id, 'intent', '0']);
  //       goToCDSVersion(this.router, bot, this.project._id, this.appConfigService.getConfig().cdsBaseUrl)
  //     }
  //   } else {
  //     botType = bot.type


  //       this.router.navigate(['project/' + this.projectId + '/bots', bot._id, botType]);
  //     }
  //   }

  // }

  // --------------------------------------------
  // Navigation  
  // --------------------------------------------
  goToMemberProfile(participantId: any) {
    this.logger.log('goToMemberProfile, ', participantId)
    if (participantId.includes('bot_')) {
      const bot_id = participantId.slice(4);
      const bot = this.botLocalDbService.getBotFromStorage(bot_id);
      this.logger.log('[ActivitiesComponent] stored bot ', bot)

      let botType = ''
      if (bot.type === 'internal') {
        botType = 'native'

        this.router.navigate(['project/' + this.projectId + '/bots/intents/', bot._id, botType]);

      } else if (bot.type === 'tilebot') {
        botType = 'tilebot'
        goToCDSVersion(this.router, bot, this.projectId, this.appConfigService.getConfig().cdsBaseUrl)

      } else if (bot.type === 'tiledesk-ai') {
        botType = 'tiledesk-ai'
        goToCDSVersion(this.router, bot, this.projectId, this.appConfigService.getConfig().cdsBaseUrl)

      } else {
        botType = bot.type
        this.router.navigate(['project/' + this.projectId + '/bots', bot._id, botType]);
      }
      
    } else {

      this.logger.log('[ActivitiesComponent] has clicked GO To MEMBER ', participantId);
      // this.router.navigate(['project/' + this.projectId + '/member/' + participantId]);

      const filteredProjectUser = this.projectUsersArray.filter((obj: any) => {
        return obj.id_user._id === participantId;
      });

      this.logger.log('[ActivitiesComponent] - filteredProjectUser ', filteredProjectUser[0]._id);
      this.router.navigate(['project/' + this.projectId + '/user/edit/' + filteredProjectUser[0]._id]);
    }

  }

  goToRequestDetails(request_id) {
    this.logger.log('[ActivitiesComponent] has clicked GO To REQUEST DETAILS ', request_id);
    this.router.navigate(['project/' + this.projectId + '/wsrequest/' + request_id + '/messages']);
  }
}
