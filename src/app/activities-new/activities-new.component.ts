import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDateRangePicker } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from 'app/core/auth.service';
import { NotifyService } from 'app/core/notify.service';
import { AppConfigService } from 'app/services/app-config.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { RoleService } from 'app/services/role.service';
import { RolesService } from 'app/services/roles.service';
import { UsersService } from 'app/services/users.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { BotLocalDbService } from 'app/services/bot-local-db.service';
import { goToCDSVersion, avatarPlaceholder, getColorBck } from 'app/utils/util';
import { PERMISSIONS } from 'app/utils/permissions.constants';
import { ActivityRecord, UnassignedParticipantDisplay } from 'app/models/activity-model';
import { Chatbot } from 'app/models/faq_kb-model';
import { TeammateActivitiesChartModalComponent } from './modals/teammate-activities-chart-modal/teammate-activities-chart-modal.component';
import { ActivitiesListChartModalComponent } from './modals/activities-list-chart-modal/activities-list-chart-modal.component';
import { TeammateAvatarView } from './components/activities-teammate-avatar/activities-teammate-avatar.component';

import { ActivitiesService } from './activities-service/activities.service';
import { ACTIVITY_FILTER_OPTION_DEFINITIONS, ActivityFilterOption, MANUAL_ASSIGNMENT_BOT_ACTOR_ICON } from './utils/activity-verbs.constants';
import {
  buildRequestCloseDisplayContext,
  findEnrichedParticipantName,
  RequestCloseParticipantDisplay,
  resolveClosedByLeadContext,
  formatRequestCloseAssignedAt,
  isLegacyRequestCloseActor,
} from './utils/activity-request-close.util';
import {
  effectiveVerb,
  actorName,
  formatActorIdLabel,
  getActivityIconForActivity,
  getActivityRequestText,
  getRequestId,
  getTargetUserId,
  namespaceIdFromActivity,
  namespaceName,
  renderActivity,
  resolveAgentParticipant,
  ActivityParticipantDisplay,
  formatContentAddType,
  availabilityStatusLabel as getAvailabilityStatusLabel,
  projectUserUpdateRoleLabel as projectUserUpdateRoleLabelFn,
  isRegisteredProjectUserInvite as isRegisteredProjectUserInviteFn,
  isPendingProjectUserInvite as isPendingProjectUserInviteFn,
  resolveProjectUserInviteTargetLabel as resolveProjectUserInviteTargetLabelFn,
  isSystemAbandonedChatsUpdate as isSystemAbandonedChatsUpdateFn,
  systemAbandonedChatsCount as systemAbandonedChatsCountFn,
  chatbotName,
  faqKbCreateChatbotName,
  chatbotSubtypeLabel,
  chatbotIdFromActivity,
  kbActivitySource,
  kbContentDeleteNamespaceName,
  isManualAssignmentBotAssignee as isManualAssignmentBotAssigneeFn,
  isManualAssignmentDepartmentAssignee as isManualAssignmentDepartmentAssigneeFn,
  isManualAssignmentUserAssignee as isManualAssignmentUserAssigneeFn,
  isManualAssignmentReassign as isManualAssignmentReassignFn,
  isSystemUnassignActivity as isSystemUnassignActivityFn,
  usesActorLedManualAssignmentPhrase as usesActorLedManualAssignmentPhraseFn,
  systemActorLabel as systemActorLabelFn,
  shouldLinkParticipant as shouldLinkParticipantFn,
  targetConversationUserParticipant,
  unassignedParticipantId,
  unassignedParticipantName,
  targetUserName,
  resolveProjectUserTargetDisplay,
  ProjectUserTargetDisplay,
} from './utils/activity-message.util';

@Component({
  selector: 'appdashboard-activities-new',
  templateUrl: './activities-new.component.html',
  styleUrls: ['./activities-new.component.scss']
})
export class ActivitiesNewComponent implements OnInit, OnDestroy {
  @ViewChild('searchbtn', { static: false }) searchbtnRef: ElementRef;
  @ViewChild('clearsearchbtn', { static: false }) clearsearchbtnRef: ElementRef;
  @ViewChild('exportcsvbtn', { static: false }) exportcsvbtnRef: ElementRef;
  @ViewChild('picker') dateRangePicker?: MatDateRangePicker<Date>;

  projectId: string;
  currentUserId: string;
  usersActivities: ActivityRecord[] = [];
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
  /** Loaded for debug only; not shown in the agent filter select. */
  debugBotsList: Array<{ _id: string; firstname: string; lastname: string }> = [];
  direction = -1;
  selectedActivities: string[];
  arrayOfSelectedActivity: string;
  hasAscDirection = false;
  subscription: Subscription;
  projectUsersArray: any;
  asc: boolean;
  objectKeys = Object.keys;

  activityFilterOptions: ActivityFilterOption[] = [];
  readonly DEFAULT_ACTIVITY_EXPIRATION_DAYS = 30;

  activityExpirationDays: number;

  PERMISSION_TO_EDIT_FLOWS: boolean;
  PERMISSION_TO_READ_FLOWS: boolean;
  PERMISSION_TO_READ_TEAMMATE_DETAILS: boolean;
  PERMISSION_TO_UPDATE_APP: boolean;
  PERMISSION_TO_READ_CONVERSATION_DETAIL: boolean;
  PERMISSION_TO_READ_DEPARTMENT_DETAIL: boolean;
  PERMISSION_TO_READ_LEADS: boolean;
  PERMISSION_TO_READ_KB: boolean;
  browserLang: string;
  teammateMenuParticipantId: string | null = null;
  teammateMenuActivityDate: Date | null = null;

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private usersService: UsersService,
    private faqKbService: FaqKbService,
    public auth: AuthService,
    private router: Router,
    private botLocalDbService: BotLocalDbService,
    private logger: LoggerService,
    private activitiesService: ActivitiesService,
    public appConfigService: AppConfigService,
    private roleService: RoleService,
    public rolesService: RolesService,
    public notify: NotifyService,
    private dialog: MatDialog,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.roleService.checkRoleForCurrentProject('activities');
    this.activityExpirationDays = this.resolveActivityExpirationDays();
    this.browserLang = this.translate.getBrowserLang() || 'en';
    this.buildActivityFilterOptions();
    this.translate.onLangChange
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => this.buildActivityFilterOptions());
    this.selectedAgentId = '';
    this.selectedActivities = [];
    this.queryString = `start_date=&end_date=&agent_id=&activities=&direction=${this.direction}`;
    this.getCurrentProject();
    this.getActivities();
    this.getCurrentUser();
    this.getAllProjectUsers();
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
          this.PERMISSION_TO_READ_FLOWS = true;
          this.PERMISSION_TO_READ_TEAMMATE_DETAILS = true;
          this.PERMISSION_TO_UPDATE_APP = true;
          this.PERMISSION_TO_READ_CONVERSATION_DETAIL = true;
          this.PERMISSION_TO_READ_DEPARTMENT_DETAIL = true;
          this.PERMISSION_TO_READ_LEADS = true;
          this.PERMISSION_TO_READ_KB = true;
        } else if (status.role === 'agent') {
          this.PERMISSION_TO_EDIT_FLOWS = false;
          this.PERMISSION_TO_READ_FLOWS = false;
          this.PERMISSION_TO_READ_TEAMMATE_DETAILS = false;
          this.PERMISSION_TO_UPDATE_APP = false;
          this.PERMISSION_TO_READ_CONVERSATION_DETAIL = false;
          this.PERMISSION_TO_READ_DEPARTMENT_DETAIL = false;
          this.PERMISSION_TO_READ_LEADS = true;
          this.PERMISSION_TO_READ_KB = false;
        } else {
          this.PERMISSION_TO_EDIT_FLOWS = status.matchedPermissions.includes(PERMISSIONS.FLOW_EDIT);
          this.PERMISSION_TO_READ_FLOWS = status.matchedPermissions.includes(PERMISSIONS.FLOWS_READ);
          this.PERMISSION_TO_READ_TEAMMATE_DETAILS = status.matchedPermissions.includes(PERMISSIONS.TEAMMATE_UPDATE);
          this.PERMISSION_TO_UPDATE_APP = status.matchedPermissions.includes(PERMISSIONS.APPS_UPDATE);
          this.PERMISSION_TO_READ_CONVERSATION_DETAIL = status.matchedPermissions.includes(PERMISSIONS.CONVERSATION_DETAIL_READ);
          this.PERMISSION_TO_READ_DEPARTMENT_DETAIL = status.matchedPermissions.includes(PERMISSIONS.DEPARTMENT_DETAIL_READ);
          this.PERMISSION_TO_READ_LEADS = status.matchedPermissions.includes(PERMISSIONS.LEADS_READ);
          this.PERMISSION_TO_READ_KB = status.matchedPermissions.includes(PERMISSIONS.KB_READ);
        }
      });
  }

  getAllProjectUsers() {
    this.usersService.getProjectUsersByProjectId()
      .subscribe((projectUsers: any) => {
        if (projectUsers) {
          this.projectUsersArray = projectUsers.map((projectUser: any) => {
            const user = projectUser?.id_user;
            if (user) {
              this.applyTeammateAvatarMetadata(user);
            }
            return projectUser;
          });
          this.agentsList = projectUsers.map((user: any) => ({
            _id: user.id_user._id,
            firstname: user.id_user.firstname,
            lastname: user.id_user.lastname,
          }));
          console.log('[ActivitiesNewComponent] getAllProjectUsers agentsList', this.agentsList);

          if (this.usersActivities?.length) {
            this.usersActivities = this.usersActivities.map((activity) => this.enrichActivity(activity));
          }
        }
      }, undefined, () => {
        this.getAllBots();
      });
  }

  private getAllBots(): void {
    this.faqKbService.getFaqKbByProjectId().subscribe((bots: any) => {
      if (!bots?.length) {
        this.debugBotsList = [];
        this.logger.log('[ActivitiesNewComponent] getAllBots - no bots found');
        return;
      }

      this.debugBotsList = bots.map((bot: { _id: string; name: string }) => ({
        _id: `${bot._id}`,
        firstname: `${bot.name} (bot)`,
        lastname: '',
      }));
      console.log('[ActivitiesNewComponent] getAllBots debugBotsList', this.debugBotsList);

      if (this.usersActivities?.length) {
        this.usersActivities = this.usersActivities.map((activity) => this.enrichActivity(activity));
      }
    }, (error) => {
      this.logger.error('[ActivitiesNewComponent] getAllBots ERROR', error);
    });
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

  openDatePicker(): void {
    this.dateRangePicker?.open();
  }

  getQueryStringValues() {
    if (this.startDate && !this.startDateTemp) {
      this.startDateTemp = moment(this.startDate).format('DD/MM/YYYY');
    }
    if (this.endDate && !this.endDateTemp) {
      this.endDateTemp = moment(this.endDate).format('DD/MM/YYYY');
    }

    this.startDateValue = this.startDate ? this.startDateTemp : '';
    this.endDateValue = this.endDate ? this.endDateTemp : '';
    this.selectedAgentValue = this.selectedAgentId || '';
    this.arrayOfSelectedActivity = this.selectedActivities?.length
      ? this.selectedActivities.join(',')
      : '';
    this.direction = this.hasAscDirection ? 1 : -1;
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
    this.selectedActivities = [];
    this.selectedAgentId = '';
    this.startDateTemp = null;
    this.endDateTemp = null;
    this.queryString =
      'start_date=&end_date=&agent_id=&activities=&direction=' + this.direction;
    this.getActivities();
  }

  exportActivitiesAsCSV(): void {
    this.exportcsvbtnRef?.nativeElement?.blur();
    this.getQueryStringValues();
    this.queryString =
      'start_date=' + this.startDateValue + '&' +
      'end_date=' + this.endDateValue + '&' +
      'agent_id=' + this.selectedAgentValue + '&' +
      'activities=' + this.arrayOfSelectedActivity + '&' +
      'direction=' + this.direction;

    this.activitiesService.downloadActivitiesAsCsv(this.queryString, 0, this.browserLang)
      .subscribe((res: string) => {
        if (res) {
          this.downloadActivitiesCsvFile(res);
        }
      }, (error) => {
        this.logger.error('[ActivitiesNewComponent] downloadActivitiesAsCsv ERROR', error);
      });
  }

  private downloadActivitiesCsvFile(data: string): void {
    const blob = new Blob(['\ufeff' + data], { type: 'text/csv;charset=utf-8;' });
    const downloadLink = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const isSafariBrowser = navigator.userAgent.indexOf('Safari') !== -1
      && navigator.userAgent.indexOf('Chrome') === -1;

    if (isSafariBrowser) {
      downloadLink.setAttribute('target', '_blank');
    }

    downloadLink.setAttribute('href', url);
    downloadLink.setAttribute('download', 'activities.csv');
    downloadLink.style.visibility = 'hidden';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  }

  sortDirection(hasAscDirection: boolean) {
    this.hasAscDirection = hasAscDirection;
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
      .subscribe((res) => {
        if (res) {
          const totalPagesNo = (res.count || 0) / (res.perPage || 1);
          this.totalPagesNo_roundToUp = Math.ceil(totalPagesNo);

          if (res.activities) {
            this.usersActivities = res.activities.map((activity) => this.enrichActivity(activity));
          } else {
            this.usersActivities = [];
          }
        }
      }, () => {
        this.showSpinner = false;
      }, () => {
        this.showSpinner = false;
      });
  }

  enrichActivity(activity: ActivityRecord): ActivityRecord {
    moment.locale('en');
    activity.date = moment(activity.updatedAt || activity.createdAt).format('dddd, MMM DD, YYYY - HH:mm:ss');

    this.enrichProjectUserUpdate(activity);
    this.enrichRequestClose(activity);
    this.enrichRequestContext(activity);
    this.enrichRequestCreate(activity);
    this.enrichRequestUnassigned(activity);
    this.enrichManualAssignmentActor(activity);

    activity.renderedMessage = renderActivity(activity);
    return activity;
  }

  private enrichProjectUserUpdate(activity: ActivityRecord): void {
    if (activity.verb !== 'PROJECT_USER_UPDATE') {
      return;
    }

    const actorId = activity.actor?.id;
    const targetUserId = (activity.target?.object?.['id_user'] as Record<string, unknown> | undefined)?.['_id'];
    if (actorId && targetUserId) {
      activity.targetOfActionIsYourself = actorId === targetUserId;
    }
  }

  private enrichRequestClose(activity: ActivityRecord): void {
    if (activity.verb !== 'REQUEST_CLOSE') {
      return;
    }

    activity.request_close_display = buildRequestCloseDisplayContext(activity);

    if (!activity.actor?.id) {
      return;
    }

    const actorId = activity.actor.id;
    if (actorId === '_bot_unresponsive') {
      activity.closed_by_label = 'auto closing Bot';
      return;
    }
    if (actorId === '_trigger') {
      activity.closed_by_label = 'Trigger';
      return;
    }

    const fromLead = resolveClosedByLeadContext(activity);
    if (fromLead) {
      activity.closed_by_label = fromLead.fullname;
      activity.closed_by_contact_id = fromLead.contactId;
      return;
    }

    activity.closed_by_label = activity.actor.name || formatActorIdLabel(actorId);
  }

  private enrichRequestCreate(activity: ActivityRecord): void {
    if (activity.verb !== 'REQUEST_CREATE') {
      return;
    }

    if (activity.target?.object?.['status'] === 100) {
      return;
    }

    const actionObj = activity.actionObj || {};
    const assigneeName = str(actionObj['assigneeName'] || actionObj['participantName']);
    if (assigneeName) {
      activity.participant_fullname = assigneeName;
      activity.request_create_assignee_id = str(actionObj['assigneeId'] || activity.actor?.id);
      return;
    }

    const fromActionObj = findEnrichedParticipantName(actionObj);
    if (fromActionObj) {
      activity.participant_fullname = fromActionObj.name;
      activity.request_create_assignee_id = fromActionObj.isBot
        ? `bot_${fromActionObj.id}`
        : fromActionObj.id;
      return;
    }

    if (activity.actor?.type === 'user' && activity.actor?.name) {
      activity.participant_fullname = activity.actor.name;
      activity.request_create_assignee_id = activity.actor.id;
    }
  }

  private enrichRequestContext(activity: ActivityRecord): void {
    const requestText = getActivityRequestText(activity);
    if (requestText) {
      activity.activity_request_text = requestText;
    }
  }

  private enrichManualAssignmentActor(activity: ActivityRecord): void {
    if (effectiveVerb(activity) !== 'REQUEST_ASSIGNED_MANUAL') {
      return;
    }

    activity.manual_assignment_actor_is_bot = this.isManualAssignmentBotActor(activity);
  }

  getManualAssignmentActionPhrase(activity: ActivityRecord): string {
    if (this.isManualAssignmentReassign(activity)) {
      return this.isManualAssignmentBotActor(activity) ? ' reassigned' : ' manually reassigned';
    }

    return this.isManualAssignmentBotActor(activity) ? ' assigned' : ' manually assigned';
  }

  shouldShowRequestCreateAssignee(activity: ActivityRecord): boolean {
    if (activity.target?.object?.['status'] === 100) {
      return false;
    }

    return !!(
      activity.participant_fullname ||
      activity.actor?.name
    );
  }

  getRequestCreateAssigneeId(activity: ActivityRecord): string | null {
    if (activity.request_create_assignee_id) {
      return activity.request_create_assignee_id;
    }

    if (activity.actor?.type === 'user' && activity.actor?.id) {
      return activity.actor.id;
    }

    const participants = activity.target?.object?.['participants'];
    if (Array.isArray(participants) && participants[0]) {
      return str(participants[0]);
    }

    return null;
  }

  getRequestCreateAssigneeDisplayName(activity: ActivityRecord): string {
    const name = str(activity.participant_fullname || activity.actor?.name);
    return name.replace(/\s*\(chatbot\)\s*$/i, '').trim();
  }

  isRequestCreateAssigneeBot(activity: ActivityRecord): boolean {
    const assigneeId = this.getRequestCreateAssigneeId(activity);
    if (assigneeId?.includes('bot_')) {
      return true;
    }

    const actionObj = activity.actionObj || {};
    if (Array.isArray(actionObj['participatingBots']) && actionObj['participatingBots'].length) {
      return true;
    }

    const participants = activity.target?.object?.['participants'];
    if (Array.isArray(participants) && str(participants[0]).includes('bot_')) {
      return true;
    }

    return false;
  }

  goToRequestCreateAssignee(activity: ActivityRecord): void {
    let assigneeId = this.getRequestCreateAssigneeId(activity);
    if (!assigneeId) {
      return;
    }
    if (this.isRequestCreateAssigneeBot(activity) && !assigneeId.includes('bot_')) {
      assigneeId = `bot_${assigneeId}`;
    }
    this.goToMemberProfile(assigneeId);
  }

  activityMessage(activity: ActivityRecord): string {
    return activity.renderedMessage || renderActivity(activity);
  }

  activityIcon(activity: ActivityRecord): string {
    if (effectiveVerb(activity) === 'REQUEST_ASSIGNED_MANUAL' && this.isManualAssignmentBotActor(activity)) {
      return MANUAL_ASSIGNMENT_BOT_ACTOR_ICON;
    }
    return getActivityIconForActivity(activity);
  }

  isTeamVerbWithoutActorName(activity: ActivityRecord): boolean {
    const verb = effectiveVerb(activity);
    if ([
      'REQUEST_CREATE',
      'REQUEST_CLOSE',
      'PROJECT_USER_AVAILABILITY_SELF',
      'PROJECT_USER_AVAILABILITY_SYSTEM',
    ].includes(verb)) {
      return false;
    }
    return !activity.actor?.name && [
      'PROJECT_USER_UPDATE',
      'PROJECT_USER_DELETE',
      'PROJECT_USER_INVITE',
    ].includes(verb);
  }

  isTeamVerbWithActorName(activity: ActivityRecord): boolean {
    if (!activity.actor?.name) {
      return false;
    }
    return [
      'PROJECT_USER_UPDATE',
      'PROJECT_USER_DELETE',
      'PROJECT_USER_INVITE',
      'PROJECT_USER_AVAILABILITY_SELF',
      'PROJECT_USER_AVAILABILITY_SYSTEM',
    ].includes(effectiveVerb(activity));
  }

  getEffectiveVerb(activity: ActivityRecord): string {
    return effectiveVerb(activity);
  }

  availabilityStatusLabel(activity: ActivityRecord): string {
    return getAvailabilityStatusLabel(activity.actionObj || {});
  }

  isRegisteredProjectUserInvite = isRegisteredProjectUserInviteFn;
  isPendingProjectUserInvite = isPendingProjectUserInviteFn;
  isSystemAbandonedChatsUpdate = isSystemAbandonedChatsUpdateFn;
  systemAbandonedChatsCount = systemAbandonedChatsCountFn;

  projectUserUpdateRoleLabel(activity: ActivityRecord): string {
    return projectUserUpdateRoleLabelFn(activity.actionObj || {});
  }

  decreasePageNumber() {
    this.pageNo -= 1;
    this.getActivities();
  }

  increasePageNumber() {
    this.pageNo += 1;
    this.getActivities();
  }

  goToDepartment(departmentId: string) {
    if (!departmentId) {
      return;
    }

    if (!this.PERMISSION_TO_READ_DEPARTMENT_DETAIL) {
      this.notify.presentDialogNoPermissionToPermomfAction();
      return;
    }

    this.router.navigate(['project/' + this.projectId + '/department/edit', departmentId]);
  }

  isTeammateProfileLink(participantId: string): boolean {
    return !!participantId
      && !participantId.includes('bot_')
      && participantId.toLowerCase() !== 'system';
  }

  getTeammateAvatarView(participantId: string, fallbackDisplayName?: string): TeammateAvatarView | null {
    if (!this.isTeammateProfileLink(participantId)) {
      return null;
    }

    const user = this.resolveTeammateUser(participantId);
    const enrichedName = fallbackDisplayName?.trim();
    const displayName = user
      ? [user['firstname'], user['lastname']].filter(Boolean).join(' ').trim()
      : (enrichedName || this.getTeammateDisplayName(participantId));
    const fullname = displayName || enrichedName || participantId;
    const initials = (user?.['fullname_initial'] as string) || avatarPlaceholder(fullname) || '?';
    const fillColour = (user?.['fillColour'] as string) || getColorBck(fullname);

    return {
      initials,
      background: `linear-gradient(rgb(255,255,255) -125%, ${fillColour})`,
    };
  }

  private applyTeammateAvatarMetadata(user: Record<string, unknown>): void {
    const fullname = [user['firstname'], user['lastname']].filter(Boolean).join(' ').trim()
      || String(user['firstname'] || '').trim();

    if (fullname) {
      user['fullname_initial'] = avatarPlaceholder(fullname);
      user['fillColour'] = getColorBck(fullname);
      return;
    }

    user['fullname_initial'] = 'N/A';
    user['fillColour'] = 'rgb(98, 100, 167)';
  }

  setTeammateMenuContext(participantId: string, activity?: ActivityRecord): void {
    this.teammateMenuParticipantId = participantId;
    this.teammateMenuActivityDate = this.resolveActivityDate(activity);
  }

  private resolveActivityDate(activity?: ActivityRecord): Date | null {
    if (!activity) {
      return null;
    }

    const raw = activity.updatedAt || activity.createdAt;
    if (!raw) {
      return null;
    }

    const parsed = moment(raw);
    return parsed.isValid() ? parsed.startOf('day').toDate() : null;
  }

  buildTeammateChartQueryString(teammateUserId: string): string {
    this.getQueryStringValues();
    return [
      `start_date=${this.startDateValue}`,
      `end_date=${this.endDateValue}`,
      `agent_id=${teammateUserId}`,
      `activities=${this.arrayOfSelectedActivity}`,
      `direction=${this.direction}`,
    ].join('&');
  }

  getTeammateDisplayName(participantId: string): string {
    const user = this.resolveTeammateUser(participantId);
    if (!user) {
      return participantId;
    }

    const name = [user['firstname'], user['lastname']].filter(Boolean).join(' ').trim();
    return name || participantId;
  }

  getTargetUserDisplayName(activity: ActivityRecord): string {
    return targetUserName(activity);
  }

  getProjectUserTargetDisplay(activity: ActivityRecord): ProjectUserTargetDisplay | null {
    return resolveProjectUserTargetDisplay(activity);
  }

  getProjectUserTargetLabel(activity: ActivityRecord): string {
    return resolveProjectUserInviteTargetLabelFn(activity);
  }

  getProjectUserTargetProfileId(activity: ActivityRecord): string | null {
    return resolveProjectUserTargetDisplay(activity)?.profileId || getTargetUserId(activity);
  }

  getProjectUserTargetAvatarView(activity: ActivityRecord): TeammateAvatarView | null {
    const display = resolveProjectUserTargetDisplay(activity);
    if (!display?.profileId) {
      return null;
    }

    if (display.useIdUserName) {
      const initials = avatarPlaceholder(display.avatarSource) || '?';
      const fillColour = getColorBck(display.avatarSource);
      return {
        initials,
        background: `linear-gradient(rgb(255,255,255) -125%, ${fillColour})`,
      };
    }

    return this.getTeammateAvatarView(display.profileId);
  }

  getTargetUserProfileId(activity: ActivityRecord): string | null {
    return getTargetUserId(activity);
  }

  handleTeammateProfileLinkClick(event: MouseEvent, participantId: string, activity?: ActivityRecord): void {
    event.stopPropagation();
    if (!participantId) {
      return;
    }

    if (!this.isTeammateProfileLink(participantId)) {
      this.goToMemberProfile(participantId);
      return;
    }

    this.setTeammateMenuContext(participantId, activity);
  }

  formatRequestCloseAssignedAt = formatRequestCloseAssignedAt;
  isLegacyRequestCloseActor = isLegacyRequestCloseActor;

  handleRequestCloseParticipantClick(
    event: MouseEvent,
    participant: RequestCloseParticipantDisplay,
    activity: ActivityRecord,
  ): void {
    event.stopPropagation();
    if (!participant?.id) {
      return;
    }

    if (participant.type === 'bot') {
      this.goToMemberProfile(`bot_${participant.id}`);
      return;
    }

    this.handleTeammateProfileLinkClick(event, participant.id, activity);
  }

  onRequestCreateAssigneeClick(event: MouseEvent, activity: ActivityRecord): void {
    event.stopPropagation();
    if (this.isRequestCreateAssigneeBot(activity)) {
      this.goToRequestCreateAssignee(activity);
      return;
    }

    const assigneeId = this.getRequestCreateAssigneeId(activity);
    if (!assigneeId) {
      return;
    }

    this.handleTeammateProfileLinkClick(event, assigneeId, activity);
  }

  goToTeammateProfileFromMenu(): void {
    const participantId = this.teammateMenuParticipantId;
    if (!participantId) {
      return;
    }

    this.goToMemberProfile(participantId);
  }

  openTeammateActivitiesChart(): void {
    if (!this.teammateMenuParticipantId) {
      return;
    }

    this.getQueryStringValues();

    this.dialog.open(TeammateActivitiesChartModalComponent, {
      ...this.getActivitiesChartDialogConfig(),
      data: {
        teammateName: this.getTeammateDisplayName(this.teammateMenuParticipantId),
        teammateUserId: this.teammateMenuParticipantId,
        activityDate: this.teammateMenuActivityDate,
        activitiesFilter: this.arrayOfSelectedActivity || '',
        direction: this.direction,
        enrichActivity: (activity) => this.enrichActivity(activity),
        getActivityMessage: (activity) => this.activityMessage(activity),
      },
    });
  }

  openActivitiesChart(): void {
    this.getQueryStringValues();
    this.queryString =
      'start_date=' + this.startDateValue + '&' +
      'end_date=' + this.endDateValue + '&' +
      'agent_id=' + this.selectedAgentValue + '&' +
      'activities=' + this.arrayOfSelectedActivity + '&' +
      'direction=' + this.direction;

    const hasDateFilter = !!(this.startDateValue && this.endDateValue);

    this.dialog.open(ActivitiesListChartModalComponent, {
      ...this.getActivitiesChartDialogConfig(),
      data: {
        queryString: this.buildActivitiesChartQueryString(),
        pageNo: hasDateFilter ? 0 : this.pageNo,
        startDate: this.normalizeFilterDate(this.startDate),
        endDate: this.normalizeFilterDate(this.endDate),
        enrichActivity: (activity) => this.enrichActivity(activity),
        getActivityMessage: (activity) => this.activityMessage(activity),
      },
    });
  }

  private normalizeFilterDate(value: any): Date | null {
    if (!value) {
      return null;
    }

    if (value instanceof Date && !isNaN(value.getTime())) {
      return value;
    }

    const parsed = moment(value);
    return parsed.isValid() ? parsed.toDate() : null;
  }

  private getActivitiesChartDialogConfig() {
    return {
      width: 'calc(100vw - 70px - 48px)',
      maxWidth: 'calc(100vw - 70px - 32px)',
      position: {
        left: 'calc(70px + 24px)',
      },
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
    };
  }

  private buildActivitiesChartQueryString(): string {
    const baseQuery = this.queryString
      || `start_date=&end_date=&agent_id=&activities=&direction=${this.direction}`;

    const limit = this.startDateValue && this.endDateValue ? 1000 : 40;

    return baseQuery
      .replace(/&chart=true/g, '')
      .replace(/&limit=\d+/g, '')
      + `&chart=true&limit=${limit}`;
  }

  private resolveTeammateUser(participantId: string): Record<string, unknown> | null {
    const projectUser = this.projectUsersArray?.find(
      (obj: any) => obj.id_user?._id === participantId || obj._id === participantId,
    );
    return projectUser?.id_user || null;
  }

  goToMemberProfile(participantId: string) {
    if (!participantId) {
      return;
    }

    if (participantId.includes('bot_')) {
      const bot_id = participantId.slice(4);
      const bot = this.botLocalDbService.getBotFromStorage(bot_id);
      if (!bot) {
        return;
      }

      if (bot.type === 'internal') {
        this.router.navigate(['project/' + this.projectId + '/bots/intents/', bot._id, 'native']);
      } else if (bot.type === 'tilebot' || bot.type === 'tiledesk-ai') {
        this.navigateToTilebot(bot);
      } else {
        if (!this.PERMISSION_TO_UPDATE_APP) {
          this.notify.presentDialogNoPermissionToPermomfAction();
          return;
        }
        this.router.navigate(['project/' + this.projectId + '/bots', bot._id, bot.type]);
      }
      return;
    }

    if (!this.PERMISSION_TO_READ_TEAMMATE_DETAILS) {
      this.notify.presentDialogNoPermissionToPermomfAction();
      return;
    }

    const filteredProjectUser = this.projectUsersArray?.find(
      (obj: any) => obj.id_user?._id === participantId || obj._id === participantId,
    );
    if (filteredProjectUser?._id) {
      this.router.navigate(['project/' + this.projectId + '/user/edit/' + filteredProjectUser._id]);
    }
  }

  goToRequestDetails(requestId: string) {
    if (!requestId) {
      return;
    }

    if (!this.PERMISSION_TO_READ_CONVERSATION_DETAIL) {
      this.notify.presentDialogNoPermissionToPermomfAction();
      return;
    }

    this.router.navigate(['project/' + this.projectId + '/wsrequest/' + requestId + '/messages']);
  }

  goToContactDetails(contactId: string): void {
    if (!contactId || !this.projectId) {
      return;
    }

    if (!this.PERMISSION_TO_READ_LEADS) {
      this.notify.presentDialogNoPermissionToPermomfAction();
      return;
    }

    this.router.navigate(['project/' + this.projectId + '/contact', contactId]);
  }

  goToKnowledgeBaseNamespace(namespaceId: string, activity?: ActivityRecord): void {
    const actionNamespaceId = str(activity?.actionObj?.['namespaceId']).trim();
    const resolvedNamespaceId = /^[a-f0-9]{24}$/i.test(actionNamespaceId)
      ? actionNamespaceId
      : str(namespaceId).trim();

    if (!resolvedNamespaceId) {
      return;
    }

    if (!this.PERMISSION_TO_READ_KB) {
      this.notify.presentDialogNoPermissionToPermomfAction();
      return;
    }

    this.router.navigate(['project/' + this.projectId + '/knowledge-bases/' + resolvedNamespaceId]);
  }

  goToChatbotCds(activity: ActivityRecord) {
    const chatbotId = chatbotIdFromActivity(activity);
    if (!chatbotId) {
      return;
    }

    let bot = this.botLocalDbService.getBotFromStorage(chatbotId) as Chatbot | null;
    if (!bot) {
      const actionObj = activity.actionObj || {};
      const targetObject = activity.target?.object || {};
      bot = {
        _id: chatbotId,
        name: faqKbCreateChatbotName(activity) || chatbotName(activity),
        type: str(actionObj['type'] || targetObject['type']) || 'tilebot',
        subtype: str(actionObj['subtype'] || targetObject['subtype']),
        createdAt: (targetObject['createdAt'] || activity.createdAt || new Date().toISOString()) as Date,
      };
    }

    if (bot.type === 'internal') {
      this.router.navigate(['project/' + this.projectId + '/bots/intents/', bot._id, 'native']);
      return;
    }

    if (bot.type === 'tilebot' || bot.type === 'tiledesk-ai') {
      this.navigateToTilebot(bot);
      return;
    }

    if (!this.PERMISSION_TO_UPDATE_APP) {
      this.notify.presentDialogNoPermissionToPermomfAction();
      return;
    }
    this.router.navigate(['project/' + this.projectId + '/bots', bot._id, bot.type]);
  }

  private navigateToTilebot(bot: Chatbot): void {
    if (!this.PERMISSION_TO_READ_FLOWS && !this.PERMISSION_TO_EDIT_FLOWS) {
      this.notify.presentDialogNoPermissionToPermomfAction();
      return;
    }

    if (this.PERMISSION_TO_READ_FLOWS && this.PERMISSION_TO_EDIT_FLOWS) {
      goToCDSVersion(this.router, bot, this.projectId, this.appConfigService.getConfig().cdsBaseUrl);
      return;
    }

    if (this.PERMISSION_TO_READ_FLOWS) {
      this.router.navigate(['project/' + this.projectId + '/bots/my-chatbots/all']);
      return;
    }

    this.notify.presentDialogNoPermissionToPermomfAction();
  }

  goToRequestCloseParticipant(participant: RequestCloseParticipantDisplay) {
    if (!participant?.id) {
      return;
    }

    if (participant.type === 'bot') {
      this.goToMemberProfile(`bot_${participant.id}`);
      return;
    }

    this.goToMemberProfile(participant.id);
  }

  highlightClass(userId: string): boolean {
    return !!userId && userId === this.selectedAgentId;
  }

  getRequestId(activity: ActivityRecord): string | null {
    return getRequestId(activity);
  }

  isRequestAssignmentVerb(activity: ActivityRecord): boolean {
    return [
      'REQUEST_ASSIGNED_AUTO',
      'REQUEST_ASSIGNED_MANUAL',
      'REQUEST_ASSIGNED_SELF',
      'REQUEST_UNASSIGNED',
    ].includes(effectiveVerb(activity));
  }

  getAssignmentAssignee(activity: ActivityRecord): ActivityParticipantDisplay | null {
    const actionObj = activity.actionObj || {};
    const assigneeId = str(actionObj['assigneeId']);
    const assigneeType = str(actionObj['assigneeType']);
    const assigneeName = str(actionObj['assigneeName']).replace(/\s*\(chatbot\)\s*$/i, '').trim();

    if (assigneeType === 'department' && assigneeName && assigneeId) {
      return { name: assigneeName, profileId: assigneeId };
    }

    const resolved = resolveAgentParticipant(activity, assigneeId);

    if (resolved) {
      return {
        ...resolved,
        name: assigneeName || resolved.name,
      };
    }

    if (assigneeName && assigneeId) {
      const assigneeType = str(actionObj['assigneeType']);
      return {
        name: assigneeName,
        profileId: assigneeType === 'bot' ? `bot_${assigneeId}` : assigneeId,
      };
    }

    return targetConversationUserParticipant(activity);
  }

  isManualAssignmentBotAssignee = isManualAssignmentBotAssigneeFn;
  isManualAssignmentDepartmentAssignee = isManualAssignmentDepartmentAssigneeFn;
  isManualAssignmentUserAssignee = isManualAssignmentUserAssigneeFn;
  isManualAssignmentReassign = isManualAssignmentReassignFn;
  usesActorLedManualAssignmentPhrase = usesActorLedManualAssignmentPhraseFn;
  isSystemUnassignActivity = isSystemUnassignActivityFn;
  systemActorLabel = systemActorLabelFn;
  shouldLinkParticipant = shouldLinkParticipantFn;

  getAssignmentPreviousAssignee(activity: ActivityRecord): ActivityParticipantDisplay | null {
    return resolveAgentParticipant(activity, str(activity.actionObj?.['previousAssigneeId']));
  }

  getAssignmentActor(activity: ActivityRecord): ActivityParticipantDisplay | null {
    if (!activity.actor?.id || activity.actor?.type === 'system') {
      return null;
    }

    const misclassifiedBotProfileId = this.resolveMisclassifiedManualAssignmentBotProfileId(activity);
    if (misclassifiedBotProfileId) {
      const name = str(activity.actor?.name).replace(/\s*\(chatbot\)\s*$/i, '').trim()
        || misclassifiedBotProfileId;
      return { name, profileId: misclassifiedBotProfileId };
    }

    if (activity.actor?.type === 'bot') {
      const actorId = str(activity.actor.id);
      const profileId = actorId.startsWith('bot_') ? actorId : `bot_${actorId}`;
      return {
        name: str(activity.actor?.name).replace(/\s*\(chatbot\)\s*$/i, '').trim() || profileId,
        profileId,
      };
    }

    return resolveAgentParticipant(activity, activity.actor.id) || {
      name: str(activity.actor?.name) || str(activity.actor?.id),
      profileId: activity.actor.id,
    };
  }

  /**
   * Temporary workaround for REQUEST_ASSIGNED_MANUAL actors sent as type "user" but matching a project bot.
   * Remove once the server sends the correct actor.type.
   */
  isManualAssignmentBotActor(activity: ActivityRecord): boolean {
    return !!this.resolveMisclassifiedManualAssignmentBotProfileId(activity)
      || activity.actor?.type === 'bot';
  }

  onManualAssignmentActorClick(event: MouseEvent, activity: ActivityRecord): void {
    const actor = this.getAssignmentActor(activity);
    if (!actor?.profileId) {
      return;
    }

    if (this.isManualAssignmentBotActor(activity)) {
      event.stopPropagation();
      this.goToMemberProfile(actor.profileId);
      return;
    }

    this.handleTeammateProfileLinkClick(event, actor.profileId, activity);
  }

  private resolveMisclassifiedManualAssignmentBotProfileId(activity: ActivityRecord): string | null {
    if (effectiveVerb(activity) !== 'REQUEST_ASSIGNED_MANUAL') {
      return null;
    }

    if (activity.actor?.type !== 'user' || !activity.actor?.id) {
      return null;
    }

    const actorId = str(activity.actor.id);
    if (!this.isDebugBotUserId(actorId)) {
      return null;
    }

    return actorId.startsWith('bot_') ? actorId : `bot_${actorId}`;
  }

  private isDebugBotUserId(userId: string): boolean {
    if (!userId || !this.debugBotsList?.length) {
      return false;
    }

    const normalizedUserId = userId.startsWith('bot_') ? userId.slice(4) : userId;
    return this.debugBotsList.some((bot) => {
      const botId = str(bot._id).startsWith('bot_') ? str(bot._id).slice(4) : str(bot._id);
      return botId === normalizedUserId;
    });
  }

  private enrichRequestUnassigned(activity: ActivityRecord): void {
    if (activity.verb !== 'REQUEST_UNASSIGNED') {
      return;
    }

    activity.unassigned_participant_display = this.resolveUnassignedParticipantDisplay(activity);
  }

  private resolveUnassignedParticipantDisplay(activity: ActivityRecord): UnassignedParticipantDisplay | null {
    const actionObj = activity.actionObj || {};
    const profileId = str(actionObj['previousAssigneeId'])
      || str(actionObj['assigneeId'])
      || unassignedParticipantId(activity);

    if (!profileId) {
      const name = unassignedParticipantName(activity);
      return name !== 'Someone' ? { name, profileId: '', avatarView: null } : null;
    }

    const actionObjName = str(
      actionObj['assigneeName'] || actionObj['previousAssigneeName'] || actionObj['participantName'],
    ).trim();
    let firstname = '';
    let lastname = '';
    let name = '';

    if (actionObjName) {
      name = actionObjName;
    } else {
      const user = this.resolveTeammateUser(profileId);
      if (user) {
        firstname = str(user['firstname']);
        lastname = str(user['lastname']);
        name = [firstname, lastname].filter(Boolean).join(' ').trim();
      }

      if (!name) {
        const resolvedParticipant = resolveAgentParticipant(activity, profileId);
        if (resolvedParticipant?.name) {
          name = resolvedParticipant.name;
        } else {
          const fallbackName = unassignedParticipantName(activity);
          name = fallbackName !== profileId ? fallbackName : profileId;
        }
      }
    }

    const resolved = resolveAgentParticipant(activity, profileId);
    const resolvedProfileId = resolved?.profileId || profileId;
    const avatarFallbackName = name !== resolvedProfileId ? name : undefined;

    return {
      name,
      profileId: resolvedProfileId,
      firstname: firstname || undefined,
      lastname: lastname || undefined,
      avatarView: this.getTeammateAvatarView(resolvedProfileId, avatarFallbackName),
    };
  }

  getUnassignedParticipant(activity: ActivityRecord): UnassignedParticipantDisplay | null {
    return activity.unassigned_participant_display
      ?? this.resolveUnassignedParticipantDisplay(activity);
  }

  getActivityParts(activity: ActivityRecord): {
    before: string;
    link: string | null;
    after: string;
    requestId: string | null;
    kbSource: string | null;
    actorLink: string | null;
    actorProfileId: string | null;
    namespaceLink: string | null;
    namespaceId: string | null;
    afterNamespace: string;
    chatbotLink: string | null;
    chatbotId: string | null;
  } {
    const message = this.activityMessage(activity);
    const parts = {
      before: message,
      link: null as string | null,
      after: '',
      requestId: null as string | null,
      kbSource: null as string | null,
      actorLink: null as string | null,
      actorProfileId: null as string | null,
      namespaceLink: null as string | null,
      namespaceId: null as string | null,
      afterNamespace: '',
      chatbotLink: null as string | null,
      chatbotId: null as string | null,
    };

    const namespaceId = namespaceIdFromActivity(activity);
    const namespaceLabel = namespaceName(activity);
    const canLinkNamespace = !!namespaceId
      && !!namespaceLabel
      && namespaceLabel !== 'namespace'
      && namespaceLabel !== namespaceId;

    const applyNamespaceLink = (middle: string) => {
      parts.after = middle;
      if (canLinkNamespace) {
        parts.namespaceLink = namespaceLabel;
        parts.namespaceId = namespaceId;
        return;
      }
      parts.after = `${middle}${namespaceLabel}`;
    };

    const applyKbActorLink = (actionText: string) => {
      const actor = this.getAssignmentActor(activity);
      if (actor && shouldLinkParticipantFn(actor.profileId, actor.name)) {
        parts.actorLink = actor.name;
        parts.actorProfileId = actor.profileId;
        parts.before = actionText;
        return;
      }
      parts.before = `${actorName(activity)}${actionText}`;
    };

    if (effectiveVerb(activity) === 'KB_CONTENTS_ADD') {
      const actionObj = activity.actionObj || {};
      const source = kbActivitySource(activity);
      const count = actionObj['count'];
      const contentAddType = formatContentAddType(actionObj['contentAddType']);

      if (count && Number(count) > 1) {
        applyKbActorLink(` added ${count} items (${contentAddType}) `);
        applyNamespaceLink(' to namespace ');
        return parts;
      }

      if (actionObj['contentAddType'] === 'sitemap' && source) {
        applyKbActorLink(' added sitemap ');
        parts.kbSource = source;
        applyNamespaceLink(' to namespace ');
        return parts;
      }

      if (source) {
        applyKbActorLink(' added content ');
        parts.kbSource = source;
        applyNamespaceLink(' to namespace ');
        return parts;
      }

      applyKbActorLink(' added content ');
      applyNamespaceLink(' to namespace ');
      return parts;
    }

    if (effectiveVerb(activity) === 'KB_CONTENT_DELETE') {
      const source = kbActivitySource(activity);
      const nsName = kbContentDeleteNamespaceName(activity);
      const nsId = namespaceIdFromActivity(activity);

      applyKbActorLink(' deleted content ');
      if (source) {
        parts.kbSource = source;
      }
      parts.after = ' from namespace ';
      if (nsName && nsId) {
        parts.namespaceLink = nsName;
        parts.namespaceId = nsId;
      } else if (nsName) {
        parts.after = ` from namespace ${nsName}`;
      }
      return parts;
    }

    if (effectiveVerb(activity) === 'KB_CONTENTS_DELETE') {
      applyKbActorLink(' deleted all contents from namespace ');
      applyNamespaceLink('');
      return parts;
    }

    if (effectiveVerb(activity) === 'KB_NAMESPACE_CREATE') {
      applyKbActorLink(' created namespace ');
      applyNamespaceLink('');
      return parts;
    }

    if (effectiveVerb(activity) === 'KB_NAMESPACE_DELETE') {
      applyKbActorLink(' deleted namespace ');
      parts.after = namespaceLabel || 'namespace';
      return parts;
    }

    if (effectiveVerb(activity) === 'FAQ_KB_CREATE') {
      applyKbActorLink(` created ${chatbotSubtypeLabel(activity)} `);
      const chatbotId = chatbotIdFromActivity(activity);
      const name = faqKbCreateChatbotName(activity);
      if (chatbotId && name) {
        parts.chatbotLink = name;
        parts.chatbotId = chatbotId;
      } else if (name) {
        parts.after = name;
      }
      return parts;
    }

    if (effectiveVerb(activity) === 'FAQ_KB_DELETE') {
      applyKbActorLink(' deleted chatbot ');
      parts.after = chatbotName(activity);
      return parts;
    }

    if (effectiveVerb(activity) === 'FAQ_KB_PUBLISH') {
      applyKbActorLink(' published chatbot ');
      const chatbotId = chatbotIdFromActivity(activity);
      const name = faqKbCreateChatbotName(activity);
      if (chatbotId && name) {
        parts.chatbotLink = name;
        parts.chatbotId = chatbotId;
      } else if (name) {
        parts.after = name;
      }
      return parts;
    }

    const requestId = getRequestId(activity);
    const linkText = activity.activity_request_text;

    if (linkText && message.includes(linkText)) {
      const idx = message.indexOf(linkText);
      const remainder = message.slice(idx + linkText.length);

      parts.before = message.slice(0, idx);
      parts.link = linkText;
      parts.requestId = requestId;

      if (canLinkNamespace && remainder.includes(namespaceLabel)) {
        const nsIdx = remainder.lastIndexOf(namespaceLabel);
        parts.after = remainder.slice(0, nsIdx);
        parts.namespaceLink = namespaceLabel;
        parts.namespaceId = namespaceId;
        parts.afterNamespace = remainder.slice(nsIdx + namespaceLabel.length);
      } else {
        parts.after = remainder;
      }

      return parts;
    }

    if (canLinkNamespace && message.includes(namespaceLabel)) {
      const idx = message.lastIndexOf(namespaceLabel);
      parts.before = message.slice(0, idx);
      parts.namespaceLink = namespaceLabel;
      parts.namespaceId = namespaceId;
      parts.afterNamespace = message.slice(idx + namespaceLabel.length);
    }

    return parts;
  }

  private buildActivityFilterOptions(): void {
    this.activityFilterOptions = ACTIVITY_FILTER_OPTION_DEFINITIONS.map((option) => ({
      id: option.id,
      name: this.translate.instant(`ActivitiesNew.FilterVerb.${option.id}`),
      group: this.translate.instant(`ActivitiesNew.FilterGroup.${option.groupKey}`),
    }));
  }

  private resolveActivityExpirationDays(): number {
    const raw = this.appConfigService.getConfig()?.activityExpirationTime;
    const seconds = this.parseActivityExpirationSeconds(raw);
    const days = Math.floor(seconds / 86400);
    return days > 0 ? days : this.DEFAULT_ACTIVITY_EXPIRATION_DAYS;
  }

  private parseActivityExpirationSeconds(raw: unknown): number {
    const defaultSeconds = this.DEFAULT_ACTIVITY_EXPIRATION_DAYS * 86400;

    if (raw === undefined || raw === null || raw === '') {
      return defaultSeconds;
    }

    if (typeof raw === 'string' && raw.includes('${')) {
      return defaultSeconds;
    }

    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return defaultSeconds;
    }

    return parsed;
  }
}

function str(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}
