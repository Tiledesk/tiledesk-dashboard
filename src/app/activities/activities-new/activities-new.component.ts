import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
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
import { BotLocalDbService } from 'app/services/bot-local-db.service';
import { goToCDSVersion } from 'app/utils/util';
import { PERMISSIONS } from 'app/utils/permissions.constants';
import { ActivityRecord } from 'app/models/activity-model';
import { Chatbot } from 'app/models/faq_kb-model';
import { TeammateActivitiesChartModalComponent } from './modals/teammate-activities-chart-modal/teammate-activities-chart-modal.component';
import { ActivitiesListChartModalComponent } from './modals/activities-list-chart-modal/activities-list-chart-modal.component';

import { ActivitiesService } from '../activities/activities-service/activities.service';
import { ACTIVITY_FILTER_OPTIONS } from '../activities/utils/activity-verbs.constants';
import {
  buildRequestCloseDisplayContext,
  findEnrichedParticipantName,
  RequestCloseParticipantDisplay,
} from '../activities/utils/activity-request-close.util';
import {
  effectiveVerb,
  actorName,
  formatActorIdLabel,
  getActivityIcon,
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
  systemActorLabel as systemActorLabelFn,
  shouldLinkParticipant as shouldLinkParticipantFn,
  unassignedParticipantId,
  unassignedParticipantName,
} from '../activities/utils/activity-message.util';

@Component({
  selector: 'appdashboard-activities-new',
  templateUrl: './activities-new.component.html',
  styleUrls: ['./activities-new.component.scss']
})
export class ActivitiesNewComponent implements OnInit, OnDestroy {
  @ViewChild('searchbtn', { static: false }) searchbtnRef: ElementRef;
  @ViewChild('clearsearchbtn', { static: false }) clearsearchbtnRef: ElementRef;

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
  direction = -1;
  selectedActivities: string[];
  arrayOfSelectedActivity: string;
  hasAscDirection = false;
  subscription: Subscription;
  projectUsersArray: any;
  asc: boolean;
  objectKeys = Object.keys;

  readonly activityFilterOptions = ACTIVITY_FILTER_OPTIONS;

  PERMISSION_TO_EDIT_FLOWS: boolean;
  PERMISSION_TO_READ_TEAMMATE_DETAILS: boolean;
  PERMISSION_TO_UPDATE_APP: boolean;
  teammateMenuParticipantId: string | null = null;

  private unsubscribe$: Subject<void> = new Subject<void>();

  constructor(
    private usersService: UsersService,
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
  ) { }

  ngOnInit() {
    this.roleService.checkRoleForCurrentProject('activities');
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
          this.PERMISSION_TO_READ_TEAMMATE_DETAILS = true;
          this.PERMISSION_TO_UPDATE_APP = true;
        } else if (status.role === 'agent') {
          this.PERMISSION_TO_EDIT_FLOWS = false;
          this.PERMISSION_TO_READ_TEAMMATE_DETAILS = false;
          this.PERMISSION_TO_UPDATE_APP = false;
        } else {
          this.PERMISSION_TO_EDIT_FLOWS = status.matchedPermissions.includes(PERMISSIONS.FLOW_EDIT);
          this.PERMISSION_TO_READ_TEAMMATE_DETAILS = status.matchedPermissions.includes(PERMISSIONS.TEAMMATE_UPDATE);
          this.PERMISSION_TO_UPDATE_APP = status.matchedPermissions.includes(PERMISSIONS.APPS_UPDATE);
        }
      });
  }

  getAllProjectUsers() {
    this.usersService.getProjectUsersByProjectId()
      .subscribe((projectUsers: any) => {
        if (projectUsers) {
          this.projectUsersArray = projectUsers;
          this.agentsList = projectUsers.map((user: any) => ({
            _id: user.id_user._id,
            firstname: user.id_user.firstname,
            lastname: user.id_user.lastname,
          }));
        }
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

  getQueryStringValues() {
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
    return getActivityIcon(effectiveVerb(activity));
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

    this.router.navigate(['project/' + this.projectId + '/department/edit', departmentId]);
  }

  isTeammateProfileLink(participantId: string): boolean {
    return !!participantId
      && !participantId.includes('bot_')
      && participantId.toLowerCase() !== 'system';
  }

  setTeammateMenuParticipant(participantId: string): void {
    this.teammateMenuParticipantId = participantId;
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

  handleTeammateProfileLinkClick(event: MouseEvent, participantId: string): void {
    event.stopPropagation();
    if (!participantId) {
      return;
    }

    if (!this.isTeammateProfileLink(participantId)) {
      this.goToMemberProfile(participantId);
      return;
    }

    this.setTeammateMenuParticipant(participantId);
  }

  handleRequestCloseParticipantClick(event: MouseEvent, participant: RequestCloseParticipantDisplay): void {
    event.stopPropagation();
    if (!participant?.id) {
      return;
    }

    if (participant.type === 'bot') {
      this.goToMemberProfile(`bot_${participant.id}`);
      return;
    }

    this.handleTeammateProfileLinkClick(event, participant.id);
  }

  onRequestCreateAssigneeClick(event: MouseEvent, activity: ActivityRecord): void {
    event.stopPropagation();
    let assigneeId = this.getRequestCreateAssigneeId(activity);
    if (!assigneeId) {
      return;
    }

    if (this.isRequestCreateAssigneeBot(activity) && !assigneeId.includes('bot_')) {
      assigneeId = `bot_${assigneeId}`;
    }

    this.handleTeammateProfileLinkClick(event, assigneeId);
  }

  goToTeammateProfileFromMenu(): void {
    if (this.teammateMenuParticipantId) {
      this.goToMemberProfile(this.teammateMenuParticipantId);
    }
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
        activitiesFilter: this.arrayOfSelectedActivity || '',
        direction: this.direction,
        enrichActivity: (activity) => this.enrichActivity(activity),
        getActivityMessage: (activity) => this.activityMessage(activity),
      },
    });
  }

  openActivitiesChart(): void {
    this.dialog.open(ActivitiesListChartModalComponent, {
      ...this.getActivitiesChartDialogConfig(),
      data: {
        queryString: this.buildActivitiesChartQueryString(),
        pageNo: this.pageNo,
        enrichActivity: (activity) => this.enrichActivity(activity),
        getActivityMessage: (activity) => this.activityMessage(activity),
      },
    });
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

    return baseQuery
      .replace(/&chart=true/g, '')
      .replace(/&limit=\d+/g, '')
      + '&chart=true&limit=1000';
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
    if (requestId) {
      this.router.navigate(['project/' + this.projectId + '/wsrequest/' + requestId + '/messages']);
    }
  }

  goToKnowledgeBaseNamespace(namespaceId: string) {
    if (namespaceId) {
      this.router.navigate(['project/' + this.projectId + '/knowledge-bases/' + namespaceId]);
    }
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
      if (!this.PERMISSION_TO_EDIT_FLOWS) {
        this.notify.presentDialogNoPermissionToPermomfAction();
        return;
      }
      goToCDSVersion(this.router, bot, this.projectId, this.appConfigService.getConfig().cdsBaseUrl);
      return;
    }

    if (!this.PERMISSION_TO_UPDATE_APP) {
      this.notify.presentDialogNoPermissionToPermomfAction();
      return;
    }
    this.router.navigate(['project/' + this.projectId + '/bots', bot._id, bot.type]);
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

    return null;
  }

  isManualAssignmentBotAssignee = isManualAssignmentBotAssigneeFn;
  isManualAssignmentDepartmentAssignee = isManualAssignmentDepartmentAssigneeFn;
  isManualAssignmentUserAssignee = isManualAssignmentUserAssigneeFn;
  systemActorLabel = systemActorLabelFn;
  shouldLinkParticipant = shouldLinkParticipantFn;

  getAssignmentPreviousAssignee(activity: ActivityRecord): ActivityParticipantDisplay | null {
    return resolveAgentParticipant(activity, str(activity.actionObj?.['previousAssigneeId']));
  }

  getAssignmentActor(activity: ActivityRecord): ActivityParticipantDisplay | null {
    if (!activity.actor?.id || activity.actor?.type === 'system') {
      return null;
    }

    return resolveAgentParticipant(activity, activity.actor.id) || {
      name: str(activity.actor?.name) || str(activity.actor?.id),
      profileId: activity.actor.id,
    };
  }

  getUnassignedParticipant(activity: ActivityRecord): ActivityParticipantDisplay | null {
    const profileId = unassignedParticipantId(activity);
    const name = unassignedParticipantName(activity);

    if (!profileId) {
      return name !== 'Someone' ? { name, profileId: '' } : null;
    }

    const resolved = resolveAgentParticipant(activity, profileId);
    return {
      name,
      profileId: resolved?.profileId || profileId,
    };
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
}

function str(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}
