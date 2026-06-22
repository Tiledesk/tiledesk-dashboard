import { Component, OnInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { UsersService } from '../services/users.service';
import { AuthService } from '../core/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import moment from 'moment';
import { LocalDbService } from '../services/users-local-db.service';
import { BotLocalDbService } from '../services/bot-local-db.service';
import 'moment/locale/it.js';
import 'moment/locale/en-gb.js';
import { Subject, Subscription } from 'rxjs';
import { LoggerService } from '../services/logger/logger.service';
import { ActivitiesService } from '../activities/activities-service/activities.service';
import { goToCDSVersion } from 'app/utils/util';
import { AppConfigService } from 'app/services/app-config.service';
import { RoleService } from 'app/services/role.service';
import { takeUntil } from 'rxjs/operators';
import { RolesService } from 'app/services/roles.service';
import { PERMISSIONS } from 'app/utils/permissions.constants';
import { NotifyService } from 'app/core/notify.service';
import { Activity, ActivitiesResponse } from '../models/activity-model';
import { ActivityRendererService } from './activity-renderer/activity-renderer.service';

@Component({
  selector: 'appdashboard-activities-v2',
  templateUrl: './activities-v2.component.html',
  styleUrls: ['./activities-v2.component.scss']
})
export class ActivitiesV2Component implements OnInit, OnDestroy {
  @ViewChild('searchbtn', { static: false }) searchbtnRef: ElementRef;
  @ViewChild('clearsearchbtn', { static: false }) clearsearchbtnRef: ElementRef;

  projectId: string;
  currentUserId: string;
  usersActivities: Activity[] = [];
  browser_lang: string;
  showSpinner: boolean;
  pageNo = 0;
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
  selectedActivities: any;
  arrayOfSelectedActivity: any;
  hasAscDirection = false;
  activities: { id: string; name: string }[] = [];
  asc: any;
  subscription: Subscription;
  projectUsersArray: any;
  isChromeVerGreaterThan100: boolean;

  private unsubscribe$: Subject<any> = new Subject<any>();

  PERMISSION_TO_EDIT_FLOWS: boolean;
  PERMISSION_TO_READ_TEAMMATE_DETAILS: boolean;
  PERMISSION_TO_UPDATE_APP: boolean;

  constructor(
    private usersService: UsersService,
    public auth: AuthService,
    private translate: TranslateService,
    private router: Router,
    private usersLocalDbService: LocalDbService,
    private botLocalDbService: BotLocalDbService,
    private logger: LoggerService,
    private activitiesService: ActivitiesService,
    private activityRenderer: ActivityRendererService,
    public appConfigService: AppConfigService,
    private roleService: RoleService,
    public rolesService: RolesService,
    public notify: NotifyService
  ) { }

  ngOnInit() {
    this.roleService.checkRoleForCurrentProject('activities');
    this.selectedAgentId = '';
    this.getBrowserLanguage();
    this.getCurrentProject();
    this.getActivities();
    this.getCurrentUser();
    this.getAllProjectUsers();
    this.buildActivitiesOptions();
    this.getBrowserVersion();
    this.listenToProjectUser();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  listenToProjectUser() {
    this.rolesService.listenToProjectUserPermissions(this.unsubscribe$);
    this.rolesService.getUpdateRequestPermission()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(status => {
        if (status.role === 'owner' || status.role === 'admin') {
          this.PERMISSION_TO_EDIT_FLOWS = true;
          this.PERMISSION_TO_UPDATE_APP = true;
        } else if (status.role === 'agent') {
          this.PERMISSION_TO_EDIT_FLOWS = false;
          this.PERMISSION_TO_UPDATE_APP = false;
        } else {
          this.PERMISSION_TO_EDIT_FLOWS = status.matchedPermissions.includes(PERMISSIONS.FLOW_EDIT);
          this.PERMISSION_TO_UPDATE_APP = status.matchedPermissions.includes(PERMISSIONS.APPS_UPDATE);
        }

        if (status.role !== 'owner' && status.role !== 'admin' && status.role !== 'agent') {
          this.PERMISSION_TO_READ_TEAMMATE_DETAILS = status.matchedPermissions.includes(PERMISSIONS.TEAMMATE_UPDATE);
        } else {
          this.PERMISSION_TO_READ_TEAMMATE_DETAILS = true;
        }
      });
  }

  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    });
  }

  getAllProjectUsers() {
    this.usersService.getProjectUsersByProjectId()
      .subscribe((projectUsers: any) => {
        if (projectUsers) {
          this.projectUsersArray = projectUsers;
          projectUsers.forEach(user => {
            this.agentsList.push({
              '_id': user.id_user._id,
              'firstname': user.id_user.firstname,
              'lastname': user.id_user.lastname
            });
          });
        }
      }, (error) => {
        this.logger.error('[ActivitiesV2Component] - GET PROJECT-USERS ', error);
      });
  }

  getBrowserLanguage() {
    this.browser_lang = this.translate.getBrowserLang();
  }

  getCurrentProject() {
    this.subscription = this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.projectId = project._id;
      }
    });
  }

  getCurrentUser() {
    this.auth.user_bs.subscribe((user) => {
      if (user && user._id) {
        this.currentUserId = user._id;
      }
    });
  }

  addEventStartDate(value) {
    this.startDateTemp = moment(value).format('DD/MM/YYYY');
  }

  addEventEndDate(value) {
    this.endDateTemp = moment(value).format('DD/MM/YYYY');
  }

  clearDateRange() {
    this.startDateTemp = null;
    this.endDateTemp = null;
    this.startDate = null;
    this.endDate = null;
  }

  getQueryStringValues() {
    this.startDateValue = this.startDate ? this.startDateTemp : '';
    this.endDateValue = this.endDate ? this.endDateTemp : '';
    this.selectedAgentValue = this.selectedAgentId || '';
    this.arrayOfSelectedActivity = this.selectedActivities || '';
    this.direction = this.hasAscDirection ? 1 : -1;
  }

  buildActivitiesOptions() {
    this.translate.get('ActivitiesOptionsV2')
      .subscribe((text: any) => {
        this.activities = [
          { id: 'PROJECT_USER_UPDATE', name: text.AgentAvailabilityOrRoleChange },
          { id: 'PROJECT_USER_AVAILABILITY_SELF', name: text.AgentAvailabilitySelf },
          { id: 'PROJECT_USER_AVAILABILITY_SYSTEM', name: text.AgentAvailabilitySystem },
          { id: 'PROJECT_USER_DELETE', name: text.AgentDeletion },
          { id: 'PROJECT_USER_INVITE', name: text.AgentInvitation },
          { id: 'REQUEST_CREATE', name: text.NewRequest },
          { id: 'REQUEST_CLOSE', name: text.RequestResolved },
          { id: 'REQUEST_ASSIGNED_AUTO', name: text.RequestAssignedAuto },
          { id: 'REQUEST_ASSIGNED_SELF', name: text.RequestAssignedSelf },
          { id: 'REQUEST_ASSIGNED_MANUAL', name: text.RequestAssignedManual },
          { id: 'REQUEST_UNASSIGNED', name: text.RequestUnassigned },
        ];
      }, (error) => {
        this.logger.error('[ActivitiesV2Component] - GET translations error ', error);
      });
  }

  search() {
    this.searchbtnRef.nativeElement.blur();
    this.pageNo = 0;
    this.getQueryStringValues();
    this.queryString =
      'start_date=' + this.startDateValue + '&' +
      'end_date=' + this.endDateValue + '&' +
      'agent_id=' + this.selectedAgentValue + '&' +
      'activities=' + this.arrayOfSelectedActivity + '&' +
      'direction=' + this.direction;
    this.getActivities();
  }

  clearSearch() {
    this.clearsearchbtnRef.nativeElement.blur();
    this.pageNo = 0;
    this.startDate = '';
    this.endDate = '';
    this.selectedActivities = '';
    this.selectedAgentId = '';
    this.startDateTemp = null;
    this.endDateTemp = null;
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
      'direction=' + this.direction;
    this.getActivities();
  }

  getActivities() {
    this.showSpinner = true;
    this.activitiesService.getUsersActivities(this.queryString, this.pageNo)
      .subscribe((res: ActivitiesResponse) => {
        if (res) {
          const perPage = res.perPage;
          const count = res.count;
          this.totalPagesNo_roundToUp = Math.ceil(count / perPage);

          if (res.activities) {
            this.usersActivities = res.activities;
            this.usersActivities.forEach((activity: Activity) => {
              this.enrichActivity(activity);
            });
          }
        }
      }, (error) => {
        this.showSpinner = false;
        this.logger.error('[ActivitiesV2Component] - getActivities - ERROR ', error);
      }, () => {
        this.showSpinner = false;
      });
  }

  private enrichActivity(activity: Activity) {
    if (activity.verb === 'PROJECT_USER_UPDATE') {
      activity.targetOfActionIsYourself = this.activityRenderer.isSelfUpdate(activity);
    }

    if (activity.verb === 'REQUEST_CLOSE') {
      this.enrichRequestCloseActor(activity);
    }

    activity.date = this.formatActivityDate(activity.updatedAt);
    activity.displayText = this.activityRenderer.render(activity);
    activity.requestId = activity.target?.object?.request_id;

    if (activity.target?.object?.first_text) {
      const text = activity.target.object.first_text;
      activity.activity_request_text = text.length >= 30 ? text.slice(0, 30) + '...' : text;
      this.enrichRequestCreateParticipant(activity);
    }
  }

  private enrichRequestCloseActor(activity: Activity) {
    if (!activity.actor?.id) {
      return;
    }

    if (activity.actor.id === '_bot_unresponsive') {
      activity.actor.name = 'auto closing Bot';
    } else if (activity.actor.id === '_trigger') {
      activity.actor.name = 'Trigger';
    } else if (!activity.actor.name) {
      const storedTeammate = this.usersLocalDbService.getMemberFromStorage(activity.actor.id);
      if (storedTeammate) {
        activity.actor.name = storedTeammate['firstname'] + ' ' + storedTeammate['lastname'];
      } else {
        activity.actor.name = activity.target?.object?.userFullname;
      }
    }
  }

  private enrichRequestCreateParticipant(activity: Activity) {
    if (activity.verb !== 'REQUEST_CREATE' || activity.target?.object?.status !== 200) {
      return;
    }

    const participants = activity.target.object.participants;
    if (!participants?.length) {
      return;
    }

    const participantId = participants[0];
    if (participantId?.includes('bot_')) {
      const bot_id = participantId.slice(4);
      setTimeout(() => {
        const bot = this.botLocalDbService.getBotFromStorage(bot_id);
        if (bot) {
          activity.participant_fullname = bot.name + ' (chatbot)';
        }
      }, 50);
    } else {
      const user = this.usersLocalDbService.getMemberFromStorage(participantId);
      activity.participant_fullname = user
        ? user['firstname'] + ' ' + user['lastname']
        : 'n.d.';
    }
  }

  private formatActivityDate(updatedAt: string): string {
    let stored_preferred_lang: string;
    if (this.auth.user_bs?.value) {
      stored_preferred_lang = localStorage.getItem(this.auth.user_bs.value._id + '_lang');
    }

    let dshbrd_lang = '';
    if (this.browser_lang && !stored_preferred_lang) {
      dshbrd_lang = this.browser_lang;
    } else if (this.browser_lang && stored_preferred_lang) {
      dshbrd_lang = stored_preferred_lang;
    }

    if (dshbrd_lang === 'en') {
      moment.locale('en');
      return moment(updatedAt).format('dddd, MMM DD, YYYY - HH:mm:ss');
    }

    moment.locale(dshbrd_lang);
    return moment(updatedAt).format('dddd, DD MMM YYYY - HH:mm:ss');
  }

  getIconForVerb(verb: string): string {
    return this.activityRenderer.getIconForVerb(verb);
  }

  decreasePageNumber() {
    this.pageNo -= 1;
    this.getActivities();
  }

  increasePageNumber() {
    this.pageNo += 1;
    this.getActivities();
  }

  goToMemberProfile(participantId: any) {
    if (participantId.includes('bot_')) {
      const bot_id = participantId.slice(4);
      const bot = this.botLocalDbService.getBotFromStorage(bot_id);

      if (bot.type === 'internal') {
        this.router.navigate(['project/' + this.projectId + '/bots/intents/', bot._id, 'native']);
      } else if (bot.type === 'tilebot' || bot.type === 'tiledesk-ai') {
        if (!this.PERMISSION_TO_EDIT_FLOWS) {
          this.notify.presentDialogNoPermissionToPermomfAction();
          return;
        }
        goToCDSVersion(this.router, bot, this.projectId, this.appConfigService.getConfig().cdsBaseUrl);
      } else {
        if (!this.PERMISSION_TO_UPDATE_APP) {
          this.notify.presentDialogNoPermissionToPermomfAction();
          return;
        }
        this.router.navigate(['project/' + this.projectId + '/bots', bot._id, bot.type]);
      }
    } else {
      if (!this.PERMISSION_TO_READ_TEAMMATE_DETAILS) {
        this.notify.presentDialogNoPermissionToPermomfAction();
        return;
      }

      const filteredProjectUser = this.projectUsersArray.filter((obj: any) => {
        return obj.id_user._id === participantId;
      });

      if (filteredProjectUser.length) {
        this.router.navigate(['project/' + this.projectId + '/user/edit/' + filteredProjectUser[0]._id]);
      }
    }
  }

  goToRequestDetails(request_id: string) {
    this.router.navigate(['project/' + this.projectId + '/wsrequest/' + request_id + '/messages']);
  }
}
