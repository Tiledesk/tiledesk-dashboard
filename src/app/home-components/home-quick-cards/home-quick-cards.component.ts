import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from 'app/core/notify.service';
import { HomeInviteTeammateErrorModalComponent } from 'app/home-components/home-create-teammate/home-invite-teammate-error-modal/home-invite-teammate-error-modal.component';
import { HomeInviteTeammateModalComponent } from 'app/home-components/home-create-teammate/home-invite-teammate-modal/home-invite-teammate-modal.component';
import {
  HomeCreateKbAssistantModalComponent,
  HomeCreateKbAssistantModalResult,
} from 'app/home-components/home-quick-cards/home-create-kb-assistant-modal/home-create-kb-assistant-modal.component';
import { ChatbotModalComponent } from 'app/bots/bots-list/chatbot-modal/chatbot-modal.component';
import { ModalChatbotNameComponent } from 'app/knowledge-bases/modals/modal-chatbot-name/modal-chatbot-name.component';
import { ModalHookBotComponent } from 'app/knowledge-bases/modals/modal-hook-bot/modal-hook-bot.component';
import { Chatbot } from 'app/models/faq_kb-model';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
import { AppConfigService } from 'app/services/app-config.service';
import { BrandService } from 'app/services/brand.service';
import { CachePuService } from 'app/services/cache/cache-pu.service';
import { DepartmentService } from 'app/services/department.service';
import { FaqService } from 'app/services/faq.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { QuotesService } from 'app/services/quotes.service';
import { LocalDbService } from 'app/services/users-local-db.service';
import { UsersService } from 'app/services/users.service';
import { WsRequestsService } from 'app/services/websocket/ws-requests.service';
import { getLastUpdatedChatbot, sortChatbotsByLastUpdated } from 'app/utils/chatbot-sort.util';
import { goToCDSVersion } from 'app/utils/util';
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

const Swal = require('sweetalert2');

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
  /** Featured flow id from home-flow; hide last-flow card when it matches. */
  @Input() featuredHomeFlowChatbotId: string | null = null;

  countOfChatbots = 0;
  countUnassigned = 0;
  countOfKbNamespaces = 0;
  countOfKbContents = 0;
  private kbNamespaces: Array<{ id?: string; name?: string; updatedAt?: string; count?: number }> = [];
  private kbNameSpaceid = '';
  private kbOfficialResponderTag = 'kb-official-responder';
  private deptsWithoutBotArray: Array<{ id: string; name: string }> = [];
  private dialogRefCreateCb: MatDialogRef<any>;
  private dialogRefHookBoot: MatDialogRef<any>;
  countOfPendingInvites = 0;
  projectUsersLength = 0;
  kbNamespaceLimit: number | null = null;
  lastUpdatedChatbot: Chatbot;
  displayInviteTeammateBtn = true;
  /** OVP:T → show plan limits (N/N) even when PAY:F. */
  private overridePay = false;
  private chatbotsList: Chatbot[] = [];
  private chatbotsLoadRequestId = 0;
  private kbLoadRequestId = 0;
  private teammatesLoadRequestId = 0;
  private unassignedLoadRequestId = 0;
  private flowsReady = false;
  private kbReady = false;
  private teammatesReady = false;
  private unassignedReady = false;
  private unsubscribe$ = new Subject<void>();
  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;
  agentsCannotManageChatbots: string;
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
    private faqService: FaqService,
    private departmentService: DepartmentService,
    private kbService: KnowledgeBaseService,
    private quotesService: QuotesService,
    private usersService: UsersService,
    private dialog: MatDialog,
    private brandService: BrandService,
    private cachePuService: CachePuService,
    private wsRequestsService: WsRequestsService,
    private localDbService: LocalDbService,
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
    if (!this.lastUpdatedChatbot) {
      return false;
    }

    // Avoid duplicating the same flow already featured in home-flow
    if (
      this.featuredHomeFlowChatbotId
      && this.lastUpdatedChatbot._id === this.featuredHomeFlowChatbotId
    ) {
      return false;
    }

    return true;
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

  get hasAnyQuickCard(): boolean {
    return this.canViewFlows
      || this.canViewKb
      || this.canViewTeammates
      || this.showConversationsCard;
  }

  get showCardsSkeleton(): boolean {
    if (this.userRole === 'agent') {
      return false;
    }

    // Wait only for data of cards the user is allowed to see
    if (this.canViewFlows && !this.flowsReady) {
      return true;
    }
    if (this.canViewKb && !this.kbReady) {
      return true;
    }
    if (this.canViewTeammates && !this.teammatesReady) {
      return true;
    }
    if (this.showConversationsCard && !this.unassignedReady) {
      return true;
    }

    return false;
  }

  /** Show count/limit when payments are on, or when OVP overrides PAY:F. */
  private get showPlanLimits(): boolean {
    return !!(this.areActivePay || this.overridePay);
  }

  get showFlowsLimit(): boolean {
    return this.userRole !== 'agent' && this.showPlanLimits && (this.chatBotLimit || this.chatBotLimit === 0);
  }

  get flowsCountOverLimit(): boolean {
    return this.showFlowsLimit && this.countOfChatbots > this.chatBotLimit;
  }

  get showKbLimit(): boolean {
    return this.userRole !== 'agent' && this.showPlanLimits && this.kbNamespaceLimit !== null && this.kbNamespaceLimit !== undefined;
  }

  get kbCountOverLimit(): boolean {
    return this.showKbLimit && this.countOfKbNamespaces > this.kbNamespaceLimit;
  }

  get showTeammatesLimit(): boolean {
    return this.userRole !== 'agent' && this.showPlanLimits && (this.seatsLimit || this.seatsLimit === 0);
  }

  get redeemedSeatsCount(): number {
    return this.projectUsersLength + (this.countOfPendingInvites || 0);
  }

  get seatsCountOverLimit(): boolean {
    return this.showTeammatesLimit && this.redeemedSeatsCount > this.seatsLimit;
  }

  get flowsRemainingCount(): number {
    if (!this.showFlowsLimit) { return 0; }
    return Math.max(0, (this.chatBotLimit || 0) - (this.countOfChatbots || 0));
  }

  get isFlowsEmpty(): boolean {
    return !this.countOfChatbots;
  }

  get hasKbContents(): boolean {
    return (this.countOfKbContents || 0) > 0;
  }

  get showKbContentsLimit(): boolean {
    return this.userRole !== 'agent' && this.showPlanLimits && (this.kbLimit || this.kbLimit === 0);
  }

  get kbContentsOverLimit(): boolean {
    return this.showKbContentsLimit && this.countOfKbContents > this.kbLimit;
  }

  get kbNamespacesRemainingCount(): number {
    if (!this.showKbLimit) { return 0; }
    return Math.max(0, (this.kbNamespaceLimit || 0) - (this.countOfKbNamespaces || 0));
  }

  get kbContentsRemainingCount(): number {
    if (!this.showKbContentsLimit) { return 0; }
    return Math.max(0, (this.kbLimit || 0) - (this.countOfKbContents || 0));
  }

  get showKbUpgradePlan(): boolean {
    // PAY:F → never show Upgrade, even at double limit.
    if (!this.areActivePay) { return false; }

    // KB namespaces exceeded (over N/N) → always Upgrade.
    if (this.kbCountOverLimit) {
      return true;
    }

    // Contents at or over limit → Upgrade (even if KB quota still free).
    const contentsAtOrOver = this.showKbContentsLimit
      && (this.kbContentsRemainingCount <= 0 || this.kbContentsOverLimit);
    if (contentsAtOrOver) {
      return true;
    }

    // KB at limit alone (N/N, not over) with contents still available → Add/Manage, not Upgrade.
    return false;
  }

  get showKbAddContent(): boolean {
    return !this.showKbUpgradePlan && !this.hasKbContents;
  }

  get showKbManageContents(): boolean {
    return !this.showKbUpgradePlan && this.hasKbContents;
  }

  get showFlowsUpgradePlan(): boolean {
    if (!this.areActivePay || !this.showFlowsLimit) { return false; }
    return this.flowsRemainingCount <= 0 || this.flowsCountOverLimit;
  }

  get showTeammatesUpgradePlan(): boolean {
    if (!this.areActivePay || !this.showTeammatesLimit) { return false; }
    return this.seatsRemainingCount <= 0 || this.seatsCountOverLimit;
  }

  get seatsRemainingCount(): number {
    if (!this.showTeammatesLimit) { return 0; }
    return Math.max(0, (this.seatsLimit || 0) - (this.redeemedSeatsCount || 0));
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

    if (!this.projectId) { return; }

    this.navigateToKb(this.resolveDefaultKbNamespaceId());
  }

  onAddKbContentClick(event?: Event): void {
    event?.stopPropagation();
    this.handleKbContentsCta();
  }

  onManageKbContentsClick(event?: Event): void {
    event?.stopPropagation();
    this.handleKbContentsCta();
  }

  /** Add content / Manage contents — modal only if the project has no chatbots. */
  private handleKbContentsCta(): void {
    if (!this.canViewKb) {
      this.notify.presentDialogNoPermissionToPermomfAction();
      return;
    }

    if (!this.projectId) { return; }

    const kbId = this.resolveDefaultKbNamespaceId();
    this.kbNameSpaceid = kbId;

    if (this.isFlowsEmpty) {
      this.presentCreateKbAssistantPrompt();
      return;
    }

    this.navigateToKb(kbId);
  }

  private presentCreateKbAssistantPrompt(): void {
    const useDefaultKbCopy = (this.kbNamespaces?.length || 0) === 1;
    const dialogRef = this.dialog.open(HomeCreateKbAssistantModalComponent, {
      width: '560px',
      data: { useDefaultKbCopy },
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: HomeCreateKbAssistantModalResult | undefined) => {
        if (result === 'create') {
          this.createChatbotFromKbOfficialResponderTemplate();
          return;
        }
        if (result === 'contents') {
          this.navigateToKb(this.kbNameSpaceid || this.resolveDefaultKbNamespaceId());
        }
      });
  }

  private navigateToKb(kbNamespaceId: string): void {
    this.router.navigate([`project/${this.projectId}/knowledge-bases/${kbNamespaceId || '0'}`]);
  }

  private createChatbotFromKbOfficialResponderTemplate(): void {
    if (this.chatBotLimit || this.chatBotLimit === 0) {
      if (this.countOfChatbots < this.chatBotLimit) {
        this.findKbOfficialResponderAndThenExportToJSON();
        return;
      }
      this.presentDialogReachedChatbotLimit();
      return;
    }

    this.findKbOfficialResponderAndThenExportToJSON();
  }

  private presentDialogReachedChatbotLimit(): void {
    this.dialog.open(ChatbotModalComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      data: {
        projectProfile: this.prjct_profile_name,
        subscriptionIsActive: this.subscription_is_active,
        prjctProfileType: this.prjct_profile_type,
        trialExpired: this.trial_expired,
        chatBotLimit: this.chatBotLimit,
      },
    });
  }

  private findKbOfficialResponderAndThenExportToJSON(): void {
    this.faqKbService.getTemplates()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((certifiedTemplates: any[]) => {
        if (!certifiedTemplates) { return; }

        const kbOfficialResponderTemplate = certifiedTemplates.find((template) => {
          if (!template?.certifiedTags) { return false; }
          return !!template.certifiedTags.find((tag) => tag.name === this.kbOfficialResponderTag);
        });

        if (kbOfficialResponderTemplate?._id) {
          this.exportKbOfficialResponderToJSON(kbOfficialResponderTemplate._id);
        }
      });
  }

  private exportKbOfficialResponderToJSON(templateId: string): void {
    this.faqKbService.exportChatbotToJSON(templateId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((chatbot: any) => {
        if (!chatbot?.intents) { return; }

        chatbot.intents.forEach((intent, index, intentArray) => {
          const askGptAction = intent.actions?.find((action) => action._tdActionType === 'askgptv2');
          if (askGptAction) {
            askGptAction.namespace = this.kbNameSpaceid;
          }

          if (index === intentArray.length - 1 && !this.dialogRefCreateCb) {
            this.presentDialogChatbotName(chatbot);
          }
        });
      });
  }

  private presentDialogChatbotName(chatbot: any): void {
    this.dialogRefCreateCb = this.dialog.open(ModalChatbotNameComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '600px',
      data: { chatbot },
    });

    this.dialogRefCreateCb.afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((editedChatbot) => {
        this.dialogRefCreateCb = null;
        if (editedChatbot) {
          this.importChatbotFromJSON(editedChatbot);
        }
      });
  }

  private importChatbotFromJSON(editedChatbot: any): void {
    this.faqService.importChatbotFromJSONFromScratch(editedChatbot)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((faqkb: any) => {
        if (faqkb) {
          this.getDeptsByProjectId(faqkb);
        }
      });
  }

  private getDeptsByProjectId(faqkb: any): void {
    this.deptsWithoutBotArray = [];

    this.departmentService.getDeptsByProjectId()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((departments: any[]) => {
        if (!departments?.length) {
          this.presentDialogChatbotSuccessfullyCreated();
          return;
        }

        if (departments.length === 1) {
          if (departments[0].hasBot !== true) {
            this.hookBotToDept(departments[0]._id, faqkb);
          }
          this.presentDialogChatbotSuccessfullyCreated();
          return;
        }

        departments.forEach((dept) => {
          if (dept.hasBot !== true) {
            this.deptsWithoutBotArray.push({ id: dept._id, name: dept.name });
            if (!this.dialogRefHookBoot) {
              this.presentDialogChatbotSuccessfullyCreatedThenHookBot(this.deptsWithoutBotArray, faqkb);
            }
          }
        });

        if (!this.deptsWithoutBotArray.length) {
          this.presentDialogChatbotSuccessfullyCreated();
        }
      });
  }

  private hookBotToDept(deptId: string, botId: any): void {
    this.departmentService.updateExistingDeptWithSelectedBot(deptId, botId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe();
  }

  private presentDialogChatbotSuccessfullyCreated(): void {
    Swal.fire({
      title: this.translate.instant('AIAgentSuccessfullyCreated'),
      text: `${this.translate.instant('NowItIsTimeToAddContent')} !`,
      icon: 'success',
      showCloseButton: false,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('Ok'),
      focusConfirm: true,
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.navigateToKb(this.kbNameSpaceid);
      }
    });
  }

  private presentDialogChatbotSuccessfullyCreatedThenHookBot(deptsWithoutBotArray: any[], faqkb: any): void {
    Swal.fire({
      title: this.translate.instant('AIAgentSuccessfullyCreated'),
      text: `${this.translate.instant('NowItIsTimeToAddContent')} !`,
      icon: 'success',
      showCloseButton: false,
      showCancelButton: false,
      confirmButtonText: `${this.translate.instant('BotsPage.Continue')} <i class="fa fa-arrow-right">`,
      reverseButtons: true,
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.openDialogHookBot(deptsWithoutBotArray, faqkb);
      }
    });
  }

  private openDialogHookBot(deptsWithoutBotArray: any[], faqkb: any): void {
    this.dialogRefHookBoot = this.dialog.open(ModalHookBotComponent, {
      width: '700px',
      data: {
        deptsWithoutBotArray,
        chatbot: faqkb,
      },
    });

    this.dialogRefHookBoot.afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        this.dialogRefHookBoot = null;
        if (result?.deptId && result?.botId) {
          this.hookBotToDept(result.deptId, result.botId);
          this.navigateToKb(this.kbNameSpaceid);
        }
      });
  }

  /** Last used KB, else most recently updated, else route fallback `0`. */
  private resolveDefaultKbNamespaceId(): string {
    const storedNamespace = this.localDbService.getFromStorage(`last_kbnamespace-${this.projectId}`);
    if (storedNamespace) {
      try {
        const storedId = JSON.parse(storedNamespace)?.id;
        if (storedId) {
          const stillExists = this.kbNamespaces.some((ns) => ns?.id === storedId);
          if (!this.kbNamespaces.length || stillExists) {
            return storedId;
          }
        }
      } catch {
        // fall through
      }
    }

    if (this.kbNamespaces.length) {
      const sorted = [...this.kbNamespaces].sort((a, b) => {
        const aAt = a?.updatedAt || '';
        const bAt = b?.updatedAt || '';
        if (aAt > bAt) { return -1; }
        if (aAt < bAt) { return 1; }
        return 0;
      });
      if (sorted[0]?.id) {
        return sorted[0].id;
      }
    }

    return '0';
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

    this.onUpgradePlanClick(event);
  }

  onFlowsUpgradePlanClick(event?: Event): void {
    event?.stopPropagation();
    // Same gate as project-edit-add presentModalFeautureAvailableOnlyWithPaidPlans (PAY vs contact us).
    if (this.areActivePay) {
      this.openModalChatbotsOverLimit();
    } else {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
    }
  }

  onKbUpgradePlanClick(event?: Event): void {
    event?.stopPropagation();
    if (this.areActivePay) {
      this.openModalKbOverLimit();
    } else {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
    }
  }

  onUpgradePlanClick(event?: Event): void {
    event?.stopPropagation();
    if (this.areActivePay) {
      this.openModalSeatsOverLimit();
    } else {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
    }
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

  openModalChatbotsOverLimit(): void {
    // Same Upgrade plan structure as teammates (reason codes stay chatbot-specific)
    if (this.prjct_profile_type === 'free' && this.trial_expired) {
      this.openModalSeatsTrialExpired();
      return;
    }

    if (this.prjct_profile_type === 'payment' && !this.subscription_is_active) {
      this.openModalSeatsSubsExpired();
      return;
    }

    if (this.prjct_profile_type === 'free') {
      if (this.userRole === 'owner') {
        this.notify.displayGoToPricingModal('chatbot_exceeds');
      } else if (this.userRole === 'admin') {
        this.notify.displayQuickCardsAdminUpgradeModal('chatbot_exceeds');
      } else {
        this.presentModalOnlyOwnerCanManageTheAccountPlan();
      }
      return;
    }

    if (this.prjct_profile_type === 'payment' && this.subscription_is_active) {
      const flowsReason = this.getFlowsContactUsReason();
      if (this.userRole === 'owner') {
        this.notify._displayContactUsModal(true, flowsReason);
      } else if (this.userRole === 'admin') {
        this.notify.displayQuickCardsAdminUpgradeModal(flowsReason);
      } else {
        this.presentModalOnlyOwnerCanManageTheAccountPlan();
      }
    }
  }

  openModalKbOverLimit(): void {
    if (this.prjct_profile_type === 'free' && this.trial_expired) {
      this.openModalSeatsTrialExpired();
      return;
    }

    if (this.prjct_profile_type === 'payment' && !this.subscription_is_active) {
      this.openModalSeatsSubsExpired();
      return;
    }

    if (this.prjct_profile_type === 'free') {
      if (this.userRole === 'owner') {
        this.notify.displayGoToPricingModal('kb_exceeds');
      } else if (this.userRole === 'admin') {
        this.notify.displayQuickCardsAdminUpgradeModal('kb_exceeds');
      } else {
        this.presentModalOnlyOwnerCanManageTheAccountPlan();
      }
      return;
    }

    if (this.prjct_profile_type === 'payment' && this.subscription_is_active) {
      const kbReason = this.getKbContactUsReason();
      if (this.userRole === 'owner') {
        this.notify._displayContactUsModal(true, kbReason);
      } else if (this.userRole === 'admin') {
        this.notify.displayQuickCardsAdminUpgradeModal(kbReason);
      } else {
        this.presentModalOnlyOwnerCanManageTheAccountPlan();
      }
    }
  }

  private getFlowsContactUsReason(): string {
    return this.flowsCountOverLimit ? 'flows_limit_exceed' : 'flows_limit_reached';
  }

  private getKbContactUsReason(): string {
    const nsOver = this.kbCountOverLimit;
    const contentsOver = this.kbContentsOverLimit;
    const nsAt = this.showKbLimit && this.kbNamespacesRemainingCount <= 0 && !nsOver;
    const contentsAt = this.showKbContentsLimit && this.kbContentsRemainingCount <= 0 && !contentsOver;

    if (nsOver || contentsOver) {
      if (nsOver && contentsOver) {
        return 'kb_namespaces_and_contents_limit_exceed';
      }
      if (contentsOver) {
        return 'kb_contents_limit_exceed';
      }
      return 'kb_namespaces_limit_exceed';
    }

    if (nsAt && contentsAt) {
      return 'kb_namespaces_and_contents_limit_reached';
    }
    if (contentsAt) {
      return 'kb_contents_limit_reached';
    }
    return 'kb_namespaces_limit_reached';
  }

  private getSeatsContactUsReason(): string {
    return this.seatsCountOverLimit ? 'seats_limit_exceed' : 'seats_limit_reached';
  }

  openModalSeatsOverLimit(): void {
    if (this.prjct_profile_type === 'free' && this.trial_expired) {
      this.openModalSeatsTrialExpired();
      return;
    }

    if (this.prjct_profile_type === 'payment' && !this.subscription_is_active) {
      this.openModalSeatsSubsExpired();
      return;
    }

    const seatsReason = this.getSeatsContactUsReason();

    if (this.userRole === 'owner') {
      if (this.prjct_profile_type === 'free') {
        this.notify.displayGoToPricingModal('user_exceeds');
      } else {
        this.notify._displayContactUsModal(true, seatsReason);
      }
      return;
    }

    if (this.userRole === 'admin') {
      const adminReason = this.prjct_profile_type === 'free' ? 'user_exceeds' : seatsReason;
      this.notify.displayQuickCardsAdminUpgradeModal(adminReason);
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
      this.agentsCannotManageChatbots,
      this.learnMoreAboutDefaultRoles,
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

    this.translate.get('AgentsCannotManageChatbots')
      .subscribe((translation: string) => {
        this.agentsCannotManageChatbots = translation;
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
    this.flowsReady = true;
  }

  private loadChatbots(): void {
    if (!this.projectId || this.userRole === 'agent') {
      this.applyChatbots([]);
      return;
    }

    this.flowsReady = false;
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
      this.countOfKbContents = 0;
      this.kbNamespaces = [];
      this.kbNamespaceLimit = null;
      this.kbReady = true;
      return;
    }

    this.kbReady = false;
    const requestId = ++this.kbLoadRequestId;

    this.kbService.getAllNamespaces()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (namespaces: any[]) => {
          if (requestId !== this.kbLoadRequestId) {
            return;
          }
          const list = Array.isArray(namespaces) ? namespaces : [];
          this.kbNamespaces = list;
          this.countOfKbNamespaces = list.length;
          this.countOfKbContents = list.reduce(
            (sum, namespace) => sum + (Number(namespace?.count) || 0),
            0,
          );
          this.kbReady = true;
        },
        error: () => {
          if (requestId !== this.kbLoadRequestId) {
            return;
          }
          this.kbNamespaces = [];
          this.countOfKbNamespaces = 0;
          this.countOfKbContents = 0;
          this.kbReady = true;
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
      this.unassignedReady = true;
      return;
    }

    this.unassignedReady = false;
    const requestId = ++this.unassignedLoadRequestId;

    this.wsRequestsService.getConversationCount()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (requests: any) => {
          if (requestId !== this.unassignedLoadRequestId) {
            return;
          }

          this.countUnassigned = requests?.unassigned ?? 0;
          this.unassignedReady = true;
        },
        error: () => {
          if (requestId !== this.unassignedLoadRequestId) {
            return;
          }

          this.countUnassigned = 0;
          this.unassignedReady = true;
        },
      });
  }

  private loadTeammatesData(): void {
    if (!this.projectId || this.userRole === 'agent') {
      this.projectUsersLength = 0;
      this.countOfPendingInvites = 0;
      this.teammatesReady = true;
      return;
    }

    this.teammatesReady = false;
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
          this.teammatesReady = true;
        },
        error: () => {
          if (requestId !== this.teammatesLoadRequestId) {
            return;
          }

          this.projectUsersLength = 0;
          this.countOfPendingInvites = 0;
          this.teammatesReady = true;
        },
      });
  }

  private shouldIgnoreCardClick(event: Event): boolean {
    return !!(event.target as HTMLElement).closest(
      '.home-quick-card__error, .home-quick-card__invite-btn, .home-quick-card__add-content-btn',
    );
  }

  private initPayFeatureFlag(): void {
    const publicKey = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.areActivePay = false;
    this.overridePay = false;

    if (!publicKey) {
      return;
    }

    publicKey.split('-').forEach((key) => {
      if (key.includes('PAY')) {
        const [, value] = key.split(':');
        this.areActivePay = value !== 'F';
      }
      if (key.includes('OVP')) {
        const [, value] = key.split(':');
        this.overridePay = value !== 'F';
      }
    });

    if (!publicKey.includes('PAY')) {
      this.areActivePay = false;
    }
    if (!publicKey.includes('OVP')) {
      this.overridePay = false;
    }
  }
}
