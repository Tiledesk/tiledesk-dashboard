import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from 'app/core/notify.service';
import { HomeInviteTeammateErrorModalComponent } from 'app/home-components/home-create-teammate/home-invite-teammate-error-modal/home-invite-teammate-error-modal.component';
import { HomeInviteTeammateModalComponent } from 'app/home-components/home-create-teammate/home-invite-teammate-modal/home-invite-teammate-modal.component';
import { Chatbot } from 'app/models/faq_kb-model';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
import { AppConfigService } from 'app/services/app-config.service';
import { BrandService } from 'app/services/brand.service';
import { CachePuService } from 'app/services/cache/cache-pu.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { QuotesService } from 'app/services/quotes.service';
import { UsersService } from 'app/services/users.service';
import { WsRequestsService } from 'app/services/websocket/ws-requests.service';
import { getLastUpdatedChatbot, sortChatbotsByLastUpdated } from 'app/utils/chatbot-sort.util';
import { goToCDSVersion } from 'app/utils/util';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'home-quick-cards',
  templateUrl: './home-quick-cards.component.html',
  styleUrls: ['./home-quick-cards.component.scss'],
})
export class HomeQuickCardsComponent extends PricingBaseComponent implements OnInit, OnChanges, OnDestroy {
  @Input() projectId: string;
  @Input() userRole: string;
  @Input() permissionToViewFlows = false;
  @Input() permissionToEditFlows = false;
  @Input() permissionToViewKb = false;
  @Input() permissionToViewTeammates = false;
  @Input() permissionToInviteTeammates = false;
  @Input() permissionToViewUnassignedNotifications = false;
  @Input() permissionToViewMonitor = false;

  countOfChatbots = 0;
  countUnassigned = 0;
  countOfKbNamespaces = 0;
  countOfPendingInvites = 0;
  projectUsersLength = 0;
  kbNamespaceLimit: number | null = null;
  lastUpdatedChatbot: Chatbot;
  displayInviteTeammateBtn = true;
  private chatbotsList: Chatbot[] = [];
  private chatbotsLoadRequestId = 0;
  private kbLoadRequestId = 0;
  private teammatesLoadRequestId = 0;
  private unassignedLoadRequestId = 0;
  private unsubscribe$ = new Subject<void>();
  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;
  yourTrialHasEnded: string;
  upgradeNowToKeepOurAmazingFeatures: string;
  upgrade: string;

  constructor(
    public prjctPlanService: ProjectPlanService,
    public notify: NotifyService,
    private router: Router,
    private appConfigService: AppConfigService,
    private translate: TranslateService,
    private faqKbService: FaqKbService,
    private kbService: KnowledgeBaseService,
    private quotesService: QuotesService,
    private usersService: UsersService,
    private dialog: MatDialog,
    private brandService: BrandService,
    private cachePuService: CachePuService,
    private wsRequestsService: WsRequestsService,
  ) {
    super(prjctPlanService, notify);
    this.displayInviteTeammateBtn = this.brandService.getBrand()['display_invite_teammate_btn'];
  }

  ngOnInit(): void {
    this.initPayFeatureFlag();
    this.getProjectPlan();
    this.loadModalTranslations();
    this.loadChatbots();
    this.loadKbData();
    this.loadTeammatesData();
    this.loadUnassignedCount();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.projectId && this.projectId) {
      this.loadChatbots();
      this.loadKbData();
      this.loadTeammatesData();
      this.loadUnassignedCount();
    }

    if (changes.permissionToViewUnassignedNotifications || changes.userRole) {
      this.loadUnassignedCount();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get hasLastUpdatedChatbot(): boolean {
    return !!this.lastUpdatedChatbot;
  }

  get canViewFlows(): boolean {
    return this.userRole !== 'agent' && this.permissionToViewFlows;
  }

  get canEditFlows(): boolean {
    return this.userRole !== 'agent' && this.permissionToEditFlows;
  }

  get canViewKb(): boolean {
    return this.userRole !== 'agent' && this.permissionToViewKb;
  }

  get canViewTeammates(): boolean {
    return this.userRole !== 'agent' && this.permissionToViewTeammates;
  }

  get canInviteTeammates(): boolean {
    return this.userRole !== 'agent' && this.permissionToInviteTeammates;
  }

  get canViewUnassignedNotifications(): boolean {
    if (this.userRole === 'agent') {
      return false;
    }

    if (this.userRole === 'owner' || this.userRole === 'admin') {
      return true;
    }

    return this.permissionToViewUnassignedNotifications;
  }

  get canNavigateToMonitor(): boolean {
    if (this.userRole === 'owner' || this.userRole === 'admin') {
      return true;
    }

    return this.permissionToViewMonitor;
  }

  get showConversationsCard(): boolean {
    return this.canViewUnassignedNotifications;
  }

  get showFlowsLimit(): boolean {
    return this.userRole !== 'agent' && this.areActivePay && (this.chatBotLimit || this.chatBotLimit === 0);
  }

  get flowsCountOverLimit(): boolean {
    return this.showFlowsLimit && this.countOfChatbots > this.chatBotLimit;
  }

  get showKbLimit(): boolean {
    return this.userRole !== 'agent' && this.areActivePay && this.kbNamespaceLimit !== null && this.kbNamespaceLimit !== undefined;
  }

  get kbCountOverLimit(): boolean {
    return this.showKbLimit && this.countOfKbNamespaces > this.kbNamespaceLimit;
  }

  get showTeammatesLimit(): boolean {
    return this.userRole !== 'agent' && this.areActivePay && (this.seatsLimit || this.seatsLimit === 0);
  }

  get redeemedSeatsCount(): number {
    return this.projectUsersLength + (this.countOfPendingInvites || 0);
  }

  get seatsCountOverLimit(): boolean {
    return this.showTeammatesLimit && this.redeemedSeatsCount > this.seatsLimit;
  }

  get seatsCountOverLimitWithActivePlan(): boolean {
    if (!this.seatsCountOverLimit) {
      return false;
    }

    if (!this.subscription_is_active && this.prjct_profile_type === 'payment') {
      return false;
    }

    if (this.trial_expired && this.prjct_profile_type === 'free') {
      return false;
    }

    return (this.prjct_profile_type === 'payment' && this.subscription_is_active)
      || (this.prjct_profile_type === 'free' && !this.trial_expired);
  }

  get showInviteTeammateButton(): boolean {
    return this.canInviteTeammates
      && this.displayInviteTeammateBtn
      && this.projectUsersLength === 1
      && this.showTeammatesLimit;
  }

  get inviteTeammateDisabled(): boolean {
    return this.redeemedSeatsCount >= this.seatsLimit;
  }

  get tParamsPlanAndKbNamespace(): { plan_name: string; allowed_kb_num: number } {
    return {
      plan_name: this.prjct_profile_name,
      allowed_kb_num: this.kbNamespaceLimit,
    };
  }

  get tParamsSeatsPending(): { count: number } {
    return { count: this.countOfPendingInvites };
  }

  onFlowsCountClick(event?: Event): void {
    event?.stopPropagation();

    if (this.canViewFlows) {
      this.router.navigate([`project/${this.projectId}/bots/my-chatbots/all`]);
      return;
    }

    this.notify.presentDialogNoPermissionToPermomfAction();
  }

  onFlowsCardClick(event: Event): void {
    if (this.shouldIgnoreCardClick(event)) {
      return;
    }

    this.onFlowsCountClick(event);
  }

  onLastFlowCardClick(event: Event): void {
    if (this.shouldIgnoreCardClick(event)) {
      return;
    }

    this.onEditLastChatbotClick(event);
  }

  onKbCardClick(event: Event): void {
    if (this.shouldIgnoreCardClick(event)) {
      return;
    }

    this.onKbCountClick(event);
  }

  onTeammatesCardClick(event: Event): void {
    if (this.shouldIgnoreCardClick(event) || !this.canViewTeammates) {
      return;
    }

    this.onTeammatesCountClick(event);
  }

  onConversationsCardClick(event: Event): void {
    if (this.shouldIgnoreCardClick(event)) {
      return;
    }

    this.onUnassignedCountClick(event);
  }

  onKbCountClick(event?: Event): void {
    event?.stopPropagation();

    if (!this.canViewKb) {
      this.notify.presentDialogNoPermissionToPermomfAction();
      return;
    }

    this.router.navigate([`project/${this.projectId}/knowledge-bases/0`]);
  }

  onTeammatesCountClick(event?: Event): void {
    event?.stopPropagation();

    if (!this.canViewTeammates) {
      return;
    }

    this.router.navigate([`project/${this.projectId}/users`]);
  }

  onUnassignedCountClick(event?: Event): void {
    event?.stopPropagation();

    if (!this.canViewUnassignedNotifications) {
      return;
    }

    if (this.userRole === 'owner' || this.userRole === 'admin') {
      this.router.navigate([`project/${this.projectId}/wsrequests`]);
      return;
    }

    if (this.canNavigateToMonitor) {
      this.router.navigate([`project/${this.projectId}/wsrequests`]);
      return;
    }

    this.notify.presentDialogNoPermissionToViewThisSection();
  }

  onEditLastChatbotClick(event?: Event): void {
    event?.stopPropagation();

    if (!this.lastUpdatedChatbot?._id) {
      return;
    }

    if (!this.canEditFlows) {
      this.notify.presentDialogNoPermissionToPermomfAction();
      return;
    }

    if (this.lastUpdatedChatbot.type === 'external') {
      this.router.navigate([`project/${this.projectId}/bots`, this.lastUpdatedChatbot._id, 'external']);
      return;
    }

    goToCDSVersion(
      this.router,
      this.lastUpdatedChatbot,
      this.projectId,
      this.appConfigService.getConfig().cdsBaseUrl,
    );
  }

  onInviteTeammateClick(event?: Event): void {
    event?.stopPropagation();

    if (!this.canInviteTeammates) {
      this.notify.presentDialogNoPermissionToPermomfAction();
      return;
    }

    if (this.redeemedSeatsCount < this.seatsLimit) {
      this.presentModalInviteTeammate();
      return;
    }

    if (this.userRole === 'owner') {
      if (this.prjct_profile_type === 'free') {
        this.notify.displayGoToPricingModal('user_exceeds');
      } else {
        this.notify._displayContactUsModal(true, 'seats_limit_exceed');
      }
      return;
    }

    this.presentModalOnlyOwnerCanManageTheAccountPlan();
  }

  openModalSubsExpired(): void {
    if (this.userRole === 'owner') {
      if (this.profile_name !== this.PLAN_NAME.C && this.profile_name !== this.PLAN_NAME.F) {
        this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
      } else if (this.profile_name === this.PLAN_NAME.C || this.profile_name === this.PLAN_NAME.F) {
        this.notify.displayEnterprisePlanHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
      }
      return;
    }

    this.presentModalAgentCannotManageChatbot();
  }

  openModalTrialExpired(): void {
    if (this.userRole === 'owner') {
      this.notify.displayTrialHasExpiredModal(
        this.projectId,
        this.yourTrialHasEnded,
        this.upgradeNowToKeepOurAmazingFeatures,
        this.upgrade,
      );
      return;
    }

    this.presentModalOnlyOwnerCanManageTheAccountPlan();
  }

  openModalSeatsSubsExpired(): void {
    if (this.userRole === 'owner') {
      if (this.profile_name !== this.PLAN_NAME.C && this.profile_name !== this.PLAN_NAME.F) {
        this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
      } else if (this.profile_name === this.PLAN_NAME.C || this.profile_name === this.PLAN_NAME.F) {
        this.notify.displayEnterprisePlanHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
      }
      return;
    }

    this.presentModalOnlyOwnerCanManageTheAccountPlan();
  }

  openModalSeatsTrialExpired(): void {
    if (this.userRole === 'owner') {
      this.notify.displayTrialHasExpiredModal(
        this.projectId,
        this.yourTrialHasEnded,
        this.upgradeNowToKeepOurAmazingFeatures,
        this.upgrade,
      );
      return;
    }

    this.presentModalOnlyOwnerCanManageTheAccountPlan();
  }

  openModalSeatsOverLimit(): void {
    if (this.userRole === 'owner') {
      if (this.prjct_profile_type === 'free') {
        this.notify.displayGoToPricingModal('user_exceeds');
      } else {
        this.notify._displayContactUsModal(true, 'seats_limit_exceed');
      }
      return;
    }

    if (this.userRole === 'admin') {
      this.notify._displayContactOwnerModal(true, 'seats_limit_exceed');
      return;
    }

    this.presentModalOnlyOwnerCanManageTheAccountPlan();
  }

  private presentModalOnlyOwnerCanManageTheAccountPlan(): void {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(
      this.onlyOwnerCanManageTheAccountPlanMsg,
      this.learnMoreAboutDefaultRoles,
    );
  }

  private presentModalAgentCannotManageChatbot(): void {
    this.notify.presentModalAgentCannotManageChatbot(
      'Agents can\'t manage chatbots',
      'Learn more about default roles',
    );
  }

  private presentModalInviteTeammate(): void {
    const dialogRef = this.dialog.open(HomeInviteTeammateModalComponent, {
      width: '600px',
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (!result?.email || !result?.role) {
          return;
        }

        if (this.redeemedSeatsCount < this.seatsLimit) {
          this.doInviteUser(result.email, result.role);
          return;
        }

        if (this.userRole === 'owner') {
          this.notify._displayContactUsModal(true, 'seats_limit_reached');
          return;
        }

        this.presentModalOnlyOwnerCanManageTheAccountPlan();
      });
  }

  private doInviteUser(email: string, role: string): void {
    this.cachePuService.clearPuCache();
    this.usersService.inviteUser(email, role)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (projectUser: any) => {
          if (projectUser?.success === false && projectUser?.msg === 'Pending Invitation already exist.') {
            this.openDialogInviteTeammateError(`${email} has already been invited.`);
          }
        },
        error: (error) => {
          const inviteError = error?.error;

          if (inviteError?.success === false && inviteError?.code === 4000) {
            this.openDialogInviteTeammateError('You can not invite yourself');
          } else if (inviteError?.success === false && inviteError?.code === 4001) {
            this.openDialogInviteTeammateError(`${email} is already a member`);
          } else if (inviteError?.success === false && error?.status === 404) {
            this.openDialogInviteTeammateError('User not found');
          } else if (inviteError?.success === false) {
            this.openDialogInviteTeammateError('An error occurred');
          }
        },
        complete: () => {
          this.loadTeammatesData();
        },
      });
  }

  private openDialogInviteTeammateError(errorMsg: string): void {
    this.dialog.open(HomeInviteTeammateErrorModalComponent, {
      data: { error: errorMsg },
    });
  }

  private loadModalTranslations(): void {
    this.translate.get('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan')
      .subscribe((translation: string) => {
        this.onlyOwnerCanManageTheAccountPlanMsg = translation;
      });

    this.translate.get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: string) => {
        this.learnMoreAboutDefaultRoles = translation;
      });

    this.translate.get('Pricing.YourTrialHasEnded')
      .subscribe((translation: string) => {
        this.yourTrialHasEnded = translation;
      });

    this.translate.get('Pricing.UpgradeNowToKeepOurAmazingFeatures')
      .subscribe((translation: string) => {
        this.upgradeNowToKeepOurAmazingFeatures = translation;
      });

    this.translate.get('Upgrade')
      .subscribe((translation: string) => {
        this.upgrade = translation;
      });
  }

  private applyChatbots(faqKb: Chatbot[]): void {
    this.chatbotsList = sortChatbotsByLastUpdated(faqKb);
    this.countOfChatbots = this.chatbotsList.length;
    this.lastUpdatedChatbot = getLastUpdatedChatbot(this.chatbotsList);
  }

  private loadChatbots(): void {
    if (!this.projectId || this.userRole === 'agent') {
      this.applyChatbots([]);
      return;
    }

    const requestId = ++this.chatbotsLoadRequestId;

    this.faqKbService.getFaqKbByProjectId()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (faqKb: Chatbot[]) => {
          if (requestId !== this.chatbotsLoadRequestId) {
            return;
          }
          this.applyChatbots(Array.isArray(faqKb) ? faqKb : []);
        },
        error: () => {
          if (requestId !== this.chatbotsLoadRequestId) {
            return;
          }
          this.applyChatbots([]);
        },
      });
  }

  private loadKbData(): void {
    if (!this.projectId || this.userRole === 'agent') {
      this.countOfKbNamespaces = 0;
      this.kbNamespaceLimit = null;
      return;
    }

    const requestId = ++this.kbLoadRequestId;

    this.kbService.getAllNamespaces()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (namespaces: any[]) => {
          if (requestId !== this.kbLoadRequestId) {
            return;
          }
          this.countOfKbNamespaces = Array.isArray(namespaces) ? namespaces.length : 0;
        },
        error: () => {
          if (requestId !== this.kbLoadRequestId) {
            return;
          }
          this.countOfKbNamespaces = 0;
        },
      });

    this.quotesService.getProjectQuotes(this.projectId)
      .then((quotas: any) => {
        const namespaceLimit = quotas?.namespace;
        this.kbNamespaceLimit = namespaceLimit === null || namespaceLimit === undefined
          ? null
          : Number(namespaceLimit);
      })
      .catch(() => {
        this.kbNamespaceLimit = null;
      });
  }

  private loadUnassignedCount(): void {
    if (!this.projectId || !this.canViewUnassignedNotifications) {
      this.countUnassigned = 0;
      return;
    }

    const requestId = ++this.unassignedLoadRequestId;

    this.wsRequestsService.getConversationCount()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (requests: any) => {
          if (requestId !== this.unassignedLoadRequestId) {
            return;
          }

          this.countUnassigned = requests?.unassigned ?? 0;
        },
        error: () => {
          if (requestId !== this.unassignedLoadRequestId) {
            return;
          }

          this.countUnassigned = 0;
        },
      });
  }

  private loadTeammatesData(): void {
    if (!this.projectId || this.userRole === 'agent') {
      this.projectUsersLength = 0;
      this.countOfPendingInvites = 0;
      return;
    }

    const requestId = ++this.teammatesLoadRequestId;

    forkJoin({
      projectUsers: this.usersService.getProjectUsersByProjectId(),
      pendingInvites: this.usersService.getPendingUsers(),
    })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: ({ projectUsers, pendingInvites }) => {
          if (requestId !== this.teammatesLoadRequestId) {
            return;
          }

          this.projectUsersLength = Array.isArray(projectUsers) ? projectUsers.length : 0;
          this.countOfPendingInvites = Array.isArray(pendingInvites) ? pendingInvites.length : 0;
        },
        error: () => {
          if (requestId !== this.teammatesLoadRequestId) {
            return;
          }

          this.projectUsersLength = 0;
          this.countOfPendingInvites = 0;
        },
      });
  }

  private shouldIgnoreCardClick(event: Event): boolean {
    return !!(event.target as HTMLElement).closest(
      '.home-quick-card__error, .home-quick-card__invite-btn',
    );
  }

  private initPayFeatureFlag(): void {
    const publicKey = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.areActivePay = false;

    if (!publicKey?.includes('PAY')) {
      return;
    }

    publicKey.split('-').forEach((key) => {
      if (key.includes('PAY')) {
        const [, value] = key.split(':');
        this.areActivePay = value !== 'F';
      }
    });
  }
}
