import { AfterViewInit, Component, OnDestroy, OnInit, isDevMode } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { NotifyService } from 'app/core/notify.service';
import { KB, KbSettings } from 'app/models/kbsettings-model';
import { Project } from 'app/models/project-model';
import { KnowledgeBaseService } from 'app/services/knowledge-base.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { OpenaiService } from 'app/services/openai.service';
import { ProjectService } from 'app/services/project.service';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { FaqKbService } from 'app/services/faq-kb.service';
import { KB_DEFAULT_PARAMS, PLAN_NAME, URL_kb, containsXSS, goToCDSSettings, goToCDSVersion } from 'app/utils/util';
import { AppConfigService } from 'app/services/app-config.service';
import { PricingBaseComponent } from 'app/pricing/pricing-base/pricing-base.component';
import { ProjectPlanService } from 'app/services/project-plan.service';
import { UsersService } from 'app/services/users.service';
import { BrandService } from 'app/services/brand.service';
import { LocalDbService } from 'app/services/users-local-db.service';
import { ModalAddNamespaceComponent } from './modals/modal-add-namespace/modal-add-namespace.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModalUploadFileComponent } from './modals/modal-upload-file/modal-upload-file.component';
import { ModalPreviewSettingsComponent } from './modals/modal-preview-settings/modal-preview-settings.component';
import { ModalPreviewKnowledgeBaseComponent } from './modals/modal-preview-knowledge-base/modal-preview-knowledge-base.component';
import { ModalDeleteNamespaceComponent } from './modals/modal-delete-namespace/modal-delete-namespace.component';
import { ModalDetailKnowledgeBaseComponent } from './modals/modal-detail-knowledge-base/modal-detail-knowledge-base.component';
import { ModalTextFileComponent } from './modals/modal-text-file/modal-text-file.component';
import { ModalUrlsKnowledgeBaseComponent } from './modals/modal-urls-knowledge-base/modal-urls-knowledge-base.component';
import { ModalSiteMapComponent } from './modals/modal-site-map/modal-site-map.component';
import { ModalDeleteKnowledgeBaseComponent } from './modals/modal-delete-knowledge-base/modal-delete-knowledge-base.component';
import { ChatbotModalComponent } from 'app/bots/bots-list/chatbot-modal/chatbot-modal.component';
import { ModalChatbotNameComponent } from './modals/modal-chatbot-name/modal-chatbot-name.component';
import { FaqService } from 'app/services/faq.service';
import { DepartmentService } from 'app/services/department.service';
import { ModalHookBotComponent } from './modals/modal-hook-bot/modal-hook-bot.component';
import { ModalNsLimitReachedComponent } from './modals/modal-ns-limit-reached/modal-ns-limit-reached.component';
import { ModalConfirmGotoCdsComponent } from './modals/modal-confirm-goto-cds/modal-confirm-goto-cds.component';
import { ModalFaqsComponent } from './modals/modal-faqs/modal-faqs.component';
import { ModalAddContentComponent } from './modals/modal-add-content/modal-add-content.component';
import { ModalInstallOnWebsiteComponent } from './modals/modal-install-on-website/modal-install-on-website.component';
import { UnansweredQuestionsService, UnansweredQuestion } from 'app/services/unanswered-questions.service';
import { QuotesService } from 'app/services/quotes.service';
import { RoleService } from 'app/services/role.service';
import { RolesService } from 'app/services/roles.service';
import { PERMISSIONS } from 'app/utils/permissions.constants';
import { KnowledgeBases2Facade } from './facade/knowledge-bases2.facade';
import { KbPermissionsService } from './services/kb-permissions.service';
import { KbNamespaceSelectionService } from './services/kb-namespace-selection.service';
import { KbVisitedService } from './services/kb-visited.service';
import { KbSitemapEventsService } from './services/kb-sitemap-events.service';
import { KbNamespaceLinkedResourcesService } from './services/kb-namespace-linked-resources.service';
import type { KbNamespace, KbQuotas } from './models/kb-types';
import { KB2_UI_INITIAL_STATE, type KnowledgeBases2UiState } from './models/kb-ui-state';
import type { KbListItem } from './models/kb-types';
import type { Department } from 'app/models/department-model';

const Swal = require('sweetalert2')


@Component({
  selector: 'appdashboard-knowledge-bases2',
  templateUrl: './knowledge-bases.component.html',
  styleUrls: ['./knowledge-bases.component.scss']
})

export class KnowledgeBases2Component extends PricingBaseComponent implements OnInit, AfterViewInit, OnDestroy {
  PLAN_NAME = PLAN_NAME;
  typeKnowledgeBaseModal: string;
  baseModalDelete: boolean = false;
  baseModalPreview: boolean = false;
  baseModalPreviewSettings: boolean = false;
  baseModalError: boolean = false;
  baseModalDetail: boolean = false;

  ui: KnowledgeBases2UiState = { ...KB2_UI_INITIAL_STATE };

  get showSpinner(): boolean {
    return this.ui.showSpinner;
  }
  get showKBTableSpinner(): boolean {
    return this.ui.showKbTableSpinner;
  }
  get showUQTableSpinner(): boolean {
    return this.ui.showUqTableSpinner;
  }
  currentSortParams: any = null; // Store current sort params to sync with table component
  CURRENT_USER: any;
  CURRENT_USER_ID: string
  project: Project;
  project_name: string;
  id_project: string;



  profile_name: string;

  isAvailableRefreshRateFeature: boolean;
  t_params: any

  callingPage: string;
  errorMessage: string;

  kbFormUrl: FormGroup;
  kbFormContent: FormGroup;

  kbsList: KbListItem[];
  kbsListCount: number = 0;
  refreshKbsList: boolean = true;
  numberPage: number = 0;


  kbid_selected: any;
  // ARE_NEW_KB removed: feature is always the new KB implementation.

  // messages
  msgSuccesUpdateKb: string; // 'KB modificato con successo';
  msgSuccesAddKb: string; // = 'KB aggiunto con successo';
  msgSuccesDeleteKb: string; // = 'KB eliminato con successo';
  msgErrorDeleteKb: string; // = 'Non è stato possibile eliminare il kb';
  msgErrorIndexingKb: string; // = 'Indicizzazione non riuscita';
  msgSuccesIndexingKb: string; // = 'Indicizzazione terminata con successo';
  msgErrorAddUpdateKb: string; // = 'Non è stato possibile aggiungere o modificare il kb';
  msgErrorAddUpdateKbLimit: string // = "Non è possibile superare il numero di risorse previste nel piano corrente";
  warningTitle: string;

  myChatbotOtherCount: number;
  kbCount: number;
  listSitesOfSitemap: any = [];

  payIsVisible: boolean = false;
  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;
  anErrorOccurredWhileUpdating: string;
  salesEmail: string;
  contactUsToUpgrade: string;
  contactUs: string;
  upgrade: string;
  cancel: string;
  paramsDefault: string // = "?limit=" + KB_DEFAULT_PARAMS.LIMIT + "&page=" + KB_DEFAULT_PARAMS.NUMBER_PAGE + "&sortField=" + KB_DEFAULT_PARAMS.SORT_FIELD + "&direction=" + KB_DEFAULT_PARAMS.DIRECTION;
  selectedNamespace: KbNamespace;
  hasChangedNameSpace: boolean = false;

  selectedNamespaceName: any;
  namespaces: KbNamespace[]; // [{ name: 'Namespaces_1', id: 111111, default: true }, { name: 'Namespaces_2', id: 222222, default: false }, { name: 'Namespaces_3', id: 333333, default: false }]

  namespaceIsEditable: boolean = false;
  newNamespaceName: string;
  namespaceNameOutputElWidth: any;
  namespaceValueOnFocus: string;
  newNamespaceNameIndex: number;
  msgNamespaceHasBeenSuccessfullyUpdated: string;
  hasRemovedKb: boolean = false
  hasUpdatedKb: boolean = false
  lastKbSearchParams: any;
  getKbCompleted: boolean = false;
  chatbotsUsingNamespace: any;
  totalCount: Number;
  quotas: KbQuotas;
  isActiveHybrid: boolean = false;


  storageBucket: string;
  baseUrl: string;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;

  dept_id: string;
  depts_length: any
  depts_without_bot_array = [];
  kbOfficialResponderTag = "kb-official-responder"

  public hoveredChatbot: any;
  private unsubscribe$: Subject<any> = new Subject<any>();
  hasAlreadyVisitedKb: string = 'false'

  private dialogRefHookBoot: MatDialogRef<any>;
  hasClickedAiSettingsModalBackdrop: boolean = false;
  hasClickedPreviewModalBackdrop: boolean = false;
  public hideHelpLink: boolean;
  esportingKBChatBotTemplate: boolean = false;
  refreshRateIsEnabled: boolean;

  hasDefaultRole: boolean;
  ROLE: string;
  PERMISSIONS: any;
  PERMISSION_TO_DELETE: boolean;
  PERMISSION_TO_ADD_KB: boolean;
  PERMISSION_TO_ADD_FLOWS: boolean;
  PERMISSION_TO_ADD_CONTENTS: boolean;
  PERMISSION_TO_EXPORT_CONTENTS: boolean;
  PERMISSION_TO_EDIT_FLOWS:boolean

  selectedTab: 'contents' | 'unanswered' = 'contents';
  switchTab(tab: 'contents' | 'unanswered') {
    this.selectedTab = tab;
    if (tab === 'unanswered') {
      this.loadUnansweredQuestions();
    }
  }
  
  unansweredQuestions: UnansweredQuestion[] = [];
  unansweredQuestionsPage: number = 0;
  unansweredQuestionsCount: number = 0;
  isLoadingUnanswered = false;
  isLoadingMoreUnanswered: boolean = false;
  hasMoreUnansweredQuestions: boolean = false;
  get isLoadingNamespaces(): boolean {
    return this.ui.isLoadingNamespaces;
  }
  pineconeReranking: boolean

  /**
   * Cached install parameters for the current KB namespace.
   * Populated when selecting a namespace (page entry), so the "Install on your website"
   * button can be a pure UI action (no side effects).
   */
  private selectedNamespaceInstallParams: { botId: string; departmentId: string } | null = null;
  private installParamsRequestSeq = 0;
  private departmentsAllStatus: Department[] | null = null;
  private isLoadingDepartmentsAllStatus = false;


  constructor(
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private logger: LoggerService,
    private openaiService: OpenaiService,
    private kbService: KnowledgeBaseService,
    private projectService: ProjectService,
    private router: Router,
    public route: ActivatedRoute,
    public notify: NotifyService,
    private translate: TranslateService,
    private faqKbService: FaqKbService,
    public appConfigService: AppConfigService,
    public prjctPlanService: ProjectPlanService,
    private usersService: UsersService,
    public brandService: BrandService,
    public localDbService: LocalDbService,
    public dialog: MatDialog,
    public faqService: FaqService,
    private departmentService: DepartmentService,
    private unansweredQuestionsService: UnansweredQuestionsService,
    private quotasService: QuotesService,
    private roleService: RoleService,
    private rolesService: RolesService,
    private facade: KnowledgeBases2Facade,
    private kbPermissions: KbPermissionsService,
    private kbNamespaceSelection: KbNamespaceSelectionService,
    private kbVisited: KbVisitedService,
    private sitemapEvents: KbSitemapEventsService,
    private kbLinkedResources: KbNamespaceLinkedResourcesService
  ) {
    super(prjctPlanService, notify);
    const brand = brandService.getBrand();
    this.salesEmail = brand['CONTACT_SALES_EMAIL'];
    this.hideHelpLink = brand['DOCS'];

  }

  ngOnInit(): void {
    this.roleService.checkRoleForCurrentProject('kb')
    performance.mark('kb-parent-init');

    // Measure time from sidebar click to init (if available)
    const clickTime = (window as any).kbNavigationStartTime;
    if (clickTime) {
      const currentTime = performance.now();
      const timeFromClick = currentTime - clickTime;
      this.logger.log('[KNOWLEDGE-BASES-COMP][PERF] init time from click:', timeFromClick.toFixed(2), 'ms', `(${(timeFromClick/1000).toFixed(2)} seconds from sidebar click)`);
    } else {
      // Fallback when click timestamp is missing
      const currentTime = performance.now();
      this.logger.log('[KNOWLEDGE-BASES-COMP][PERF] init at:', currentTime.toFixed(2), 'ms - ', `${(currentTime/1000).toFixed(2)} seconds`, `no click timestamp available`);
    }

    this.kbsList = [];

    this.facade.user$.pipe(takeUntil(this.unsubscribe$)).subscribe((user: any) => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] - LOGGED USER ', user)
      if (user) {
        this.CURRENT_USER = user
        this.CURRENT_USER_ID = user._id
      }
    });

    this.facade.project$.pipe(takeUntil(this.unsubscribe$)).subscribe((project: any) => {
      this.project = project
      this.logger.log('[KNOWLEDGE-BASES-COMP] - GET CURRENT PROJECT ', this.project)
      if (this.project) {
        this.project_name = project.name;
        this.id_project = project._id;
        this.loadDepartmentsAllStatusOnce();
        this.getProjectById(this.id_project)
        this.logger.log('[KNOWLEDGE-BASES-COMP] - GET CURRENT PROJECT - PROJECT-NAME ', this.project_name, ' PROJECT-ID ', this.id_project)
      }
    });

    this.facade.callingPage$.pipe(takeUntil(this.unsubscribe$)).subscribe((callingPage) => {
      this.callingPage = callingPage;
      this.logger.log('[KNOWLEDGE-BASES-COMP] - GET ROUTE PARAMS callingPage ', this.callingPage);
    });

    // Step: move namespaces state into facade
    this.facade.namespaces$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((namespaces) => {
        this.namespaces = namespaces;
        this.kbCount = namespaces?.length || 0;
      });

    this.facade.totalCount$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((total) => {
        this.totalCount = total;
      });

    this.facade.selectedNamespace$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((ns) => {
        if (!ns) return;
        this.selectedNamespace = ns;
        this.selectedNamespaceName = ns.name;
      });

    this.getProjectPlan();
    this.getProjectUserRole();
    this.listenToOnSenSitemapEvent();
    this.getFaqKbByProjectId();
    this.logger.log('[KNOWLEDGE-BASES-COMP] - HELLO !!!!', this.kbLimit);
    this.loadUnansweredQuestions();
    this.listenToProjectUser()
  }

  ngAfterViewInit() {

    setTimeout(() => {
      this.kbFormUrl = this.createConditionGroupUrl();
      this.kbFormContent = this.createConditionGroupContent();
      this.getOSCODE();
      this.trackPage();
      this.getTranslations();
    }, 0);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();   
    this.unsubscribe$.complete();
  }

  listenToProjectUser() {
    this.rolesService.listenToProjectUserPermissions(this.unsubscribe$);

    this.rolesService.getUpdateRequestPermission()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(status => {
        this.ROLE = status.role;
        this.PERMISSIONS = status.matchedPermissions;
        const perms = this.kbPermissions.resolve(status.role, status.matchedPermissions);
        this.hasDefaultRole = perms.hasDefaultRole;
        this.PERMISSION_TO_DELETE = perms.canDelete;
        this.PERMISSION_TO_ADD_KB = perms.canAddKb;
        this.PERMISSION_TO_ADD_FLOWS = perms.canAddFlows;
        this.PERMISSION_TO_EDIT_FLOWS = perms.canEditFlows;

        // PERMISSION_TO_ADD_CONTENTS
        if (status.role === 'owner' || status.role === 'admin') {
          // Owner and Admin always has permission
          this.PERMISSION_TO_ADD_CONTENTS = true;
          console.log('[KNOWLEDGE-BASES-COMP] - Project user is owner or admin (1)', 'PERMISSION_TO_ADD_CONTENTS:', this.PERMISSION_TO_ADD_CONTENTS);

        } else if (status.role === 'agent') {
          // Agent never have permission
          this.PERMISSION_TO_ADD_CONTENTS = false;
          console.log('[KNOWLEDGE-BASES-COMP] - Project user is agent (2)', 'PERMISSION_TO_ADD_CONTENTS:', this.PERMISSION_TO_ADD_CONTENTS);

        } else {
          // Custom roles: permission depends on matchedPermissions
          this.PERMISSION_TO_ADD_CONTENTS = status.matchedPermissions.includes(PERMISSIONS.KB_CONTENTS_ADD);
          console.log('[KNOWLEDGE-BASES-COMP] - Custom role (3)', status.role, 'PERMISSION_TO_ADD_CONTENTS:', this.PERMISSION_TO_ADD_CONTENTS);
        }


        // PERMISSION_TO_EXPORT_CONTENTS
        if (status.role === 'owner' || status.role === 'admin') {
          // Owner and Admin always has permission
          this.PERMISSION_TO_EXPORT_CONTENTS = true;
          console.log('[KNOWLEDGE-BASES-COMP] - Project user is owner or admin (1)', 'PERMISSION_TO_EXPORT_CONTENTS:', this.PERMISSION_TO_ADD_CONTENTS);

        } else if (status.role === 'agent') {
          // Agent never have permission
          this.PERMISSION_TO_EXPORT_CONTENTS = false;
          console.log('[KNOWLEDGE-BASES-COMP] - Project user is agent (2)', 'PERMISSION_TO_EXPORT_CONTENTS:', this.PERMISSION_TO_EXPORT_CONTENTS);

        } else {
          // Custom roles: permission depends on matchedPermissions
          this.PERMISSION_TO_EXPORT_CONTENTS = status.matchedPermissions.includes(PERMISSIONS.KB_CONTENTS_EXPORT);
          console.log('[KNOWLEDGE-BASES-COMP] - Custom role (3)', status.role, 'PERMISSION_TO_EXPORT_CONTENTS:', this.PERMISSION_TO_EXPORT_CONTENTS);
        }

      });

  }

  // KB tour removed: not used in knowledge-bases2.

  listenToOnSenSitemapEvent() {
    this.sitemapEvents.sitemap$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((sitemap) => {
        this.onSendSitemap({ sitemap });
      });
  }
  getProjectById(projectId) {
    this.projectService.getProjectById(projectId).subscribe((project: any) => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] - GET PROJECT BY ID - PROJECT: ', project);
      this.profile_name = project.profile.name
      const isActiveSubscription = project.isActiveSubscription
      const trialExpired = project.trialExpired
      const projectProfileType = project.profile.type
      this.isActiveHybrid = project.profile?.customization?.hybrid ? true : false;
      this.managePlanRefreshRateAvailability(this.profile_name, isActiveSubscription, trialExpired, projectProfileType)
      const projectProfile = project.profile
      this.getIfRefreshRateIsEnabledInCustomization(projectProfile)
      this.logger.log('[KNOWLEDGE-BASES-COMP] - GET PROJECT BY ID - profile_name: ', this.profile_name);
      this.logger.log('[KNOWLEDGE-BASES-COMP] - GET PROJECT BY ID - isActiveSubscription: ', isActiveSubscription);
    }, error => {
      this.logger.error('[KNOWLEDGE-BASES-COMP] - GET PROJECT BY ID - ERROR ', error);
    }, () => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] - GET PROJECT BY ID * COMPLETE * ');

      const currentUrl = this.router.url;
      this.logger.log('[KNOWLEDGE-BASES-COMP] - currentUrl ', currentUrl)
      if (currentUrl.indexOf('/knowledge-bases') !== -1 || currentUrl.indexOf('/agents') !== -1) {
        this.logger.log('[KNOWLEDGE-BASES-COMP] - is KB2 route')
        const hasAlreadyVisited = this.kbVisited.getVisited(this.id_project);
        if (hasAlreadyVisited) {
          this.hasAlreadyVisitedKb = 'true'
        }
        this.logger.log('[KNOWLEDGE-BASES-COMP] - hasAlreadyVisitedKb ', this.hasAlreadyVisitedKb)
        this.kbVisited.markVisited(this.id_project);

        this.getAllNamespaces()
        this.getQuotas();
      }
    });
  }

  private kb2BaseSegment(): string {
    const url = this.router?.url ?? '';
    return url.includes('/agents') ? 'agents' : 'knowledge-bases';
  }

  get isAgentsPage(): boolean {
    return (this.router?.url ?? '').includes('/agents');
  }

  async getQuotas() {
    this.quotas = await this.quotasService.getProjectQuotes(this.id_project).catch((err) => {
      
      this.logger.error("[KNOWLEDGE-BASES-COMP] - Error getting project quotas: ", err);
    })
    this.logger.log('[KNOWLEDGE-BASES-COMP] ', this.quotas)
  }


  getIfRefreshRateIsEnabledInCustomization(projectProfile) {
    this.logger.log('[KNOWLEDGE-BASES-COMP] - getIfRefreshRateIsEnabledInCustomization - projectProfile: ', projectProfile);
    if (projectProfile && projectProfile['customization']) {

      if (projectProfile && projectProfile['customization']['reindex'] && projectProfile['customization']['reindex'] !== undefined) {

        if (projectProfile && projectProfile['customization']['reindex'] && projectProfile['customization']['reindex'] === true) {

          this.refreshRateIsEnabled = true
          this.logger.log('[KNOWLEDGE-BASES-COMP] - getIfRefreshRateIsEnabledInCustomization - refreshRateIsEnabled 1: ', this.refreshRateIsEnabled);

        } else if (projectProfile && projectProfile['customization']['reindex'] && projectProfile['customization']['reindex'] === false) {

          this.refreshRateIsEnabled = false;
          this.logger.log('[KNOWLEDGE-BASES-COMP] - getIfRefreshRateIsEnabledInCustomization - refreshRateIsEnabled 2: ', this.refreshRateIsEnabled);
        }

      } else {
        this.refreshRateIsEnabled = false
        this.logger.log('[KNOWLEDGE-BASES-COMP] - getIfRefreshRateIsEnabledInCustomization - refreshRateIsEnabled 3: ', this.refreshRateIsEnabled);
      }

    } else {
      this.refreshRateIsEnabled = false
      this.logger.log('[KNOWLEDGE-BASES-COMP] - getIfRefreshRateIsEnabledInCustomization - refreshRateIsEnabled 4: ', this.refreshRateIsEnabled);
    }
  }

  managePlanRefreshRateAvailability(profileName, isActiveSubscription, trialExpired, projectProfileType) {
    this.logger.log('[KNOWLEDGE-BASES-COMP] - managePlanRefreshRateAvailability - profile_name: ', profileName);
    this.logger.log('[KNOWLEDGE-BASES-COMP] - managePlanRefreshRateAvailability - isActiveSubscription: ', isActiveSubscription);
    this.logger.log('[KNOWLEDGE-BASES-COMP] - managePlanRefreshRateAvailability - isActiveSubscription: ', trialExpired);
    this.logger.log('[KNOWLEDGE-BASES-COMP] - managePlanRefreshRateAvailability - isActiveSubscription: ', projectProfileType);
    this.t_params = { 'plan_name': PLAN_NAME.EE }
    if (projectProfileType === 'free') {
      if (trialExpired === false) {
        // Trial active
        if (profileName === 'free') {
          this.isAvailableRefreshRateFeature = false;
          this.logger.log('[KNOWLEDGE-BASES-COMP]  isAvailableRefreshRateFeature', this.isAvailableRefreshRateFeature, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)


        } else if (profileName === 'Sandbox') {

          this.isAvailableRefreshRateFeature = false;
          this.logger.log('[KNOWLEDGE-BASES-COMP]  isAvailableRefreshRateFeature', this.isAvailableRefreshRateFeature, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

        }

      } else {
        // Trial expired
        if (profileName === 'free') {

          this.isAvailableRefreshRateFeature = false;
          this.logger.log('[KNOWLEDGE-BASES-COMP]  isAvailableRefreshRateFeature', this.isAvailableRefreshRateFeature, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

        } else if (this.profile_name === 'Sandbox') {

          this.isAvailableRefreshRateFeature = false;
          this.logger.log('[KNOWLEDGE-BASES-COMP]  isAvailableRefreshRateFeature', this.isAvailableRefreshRateFeature, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

        }

      }
    } else if (projectProfileType === 'payment') {

      if (isActiveSubscription === true) {
        // Growth sub active
        if (profileName === PLAN_NAME.A) {
          this.isAvailableRefreshRateFeature = false;
          this.logger.log('[KNOWLEDGE-BASES-COMP]  isAvailableRefreshRateFeature', this.isAvailableRefreshRateFeature, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

          // Scale sub active
        } else if (profileName === PLAN_NAME.B) {
          this.isAvailableRefreshRateFeature = false;
          this.logger.log('[KNOWLEDGE-BASES-COMP]  isAvailableRefreshRateFeature', this.isAvailableRefreshRateFeature, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

          // Plus sub active
        } else if (profileName === PLAN_NAME.C) {

          this.isAvailableRefreshRateFeature = true;
          this.logger.log('[KNOWLEDGE-BASES-COMP]  isAvailableRefreshRateFeature', this.isAvailableRefreshRateFeature, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

          // Basic sub active
        } else if (profileName === PLAN_NAME.D) {
          this.isAvailableRefreshRateFeature = false;
          this.logger.log('[KNOWLEDGE-BASES-COMP]  isAvailableRefreshRateFeature', this.isAvailableRefreshRateFeature, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

          // Premium sub active
        } else if (profileName === PLAN_NAME.E) {
          this.isAvailableRefreshRateFeature = false;
          this.logger.log('[KNOWLEDGE-BASES-COMP]  isAvailableRefreshRateFeature', this.isAvailableRefreshRateFeature, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

          // Team sub active
        } else if (profileName === PLAN_NAME.EE) {
          this.isAvailableRefreshRateFeature = true;
          this.logger.log('[KNOWLEDGE-BASES-COMP]  isAvailableRefreshRateFeature', this.isAvailableRefreshRateFeature, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

          // Custom sub active
        } else if (profileName === PLAN_NAME.F) {
          this.isAvailableRefreshRateFeature = true;
          this.logger.log('[KNOWLEDGE-BASES-COMP]  isAvailableRefreshRateFeature', this.isAvailableRefreshRateFeature, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

        }

      } else if (isActiveSubscription === false) {
        // Growth sub expired
        if (profileName === PLAN_NAME.A) {
          this.isAvailableRefreshRateFeature = false;
          this.logger.log('[KNOWLEDGE-BASES-COMP]  isAvailableRefreshRateFeature', this.isAvailableRefreshRateFeature, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

          // Scale sub expired
        } else if (profileName === PLAN_NAME.B) {

          this.isAvailableRefreshRateFeature = false;
          this.logger.log('[KNOWLEDGE-BASES-COMP]  isAvailableRefreshRateFeature', this.isAvailableRefreshRateFeature, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

          // Plus sub expired
        } else if (profileName === PLAN_NAME.C) {

          this.isAvailableRefreshRateFeature = false;
          this.logger.log('[KNOWLEDGE-BASES-COMP]  isAvailableRefreshRateFeature', this.isAvailableRefreshRateFeature, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

          // Basic sub expired
        } else if (profileName === PLAN_NAME.D) {
          this.isAvailableRefreshRateFeature = false;
          this.logger.log('[KNOWLEDGE-BASES-COMP]  isAvailableRefreshRateFeature', this.isAvailableRefreshRateFeature, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

          // Premium sub expired
        } else if (profileName === PLAN_NAME.E) {

          this.isAvailableRefreshRateFeature = false;
          this.logger.log('[KNOWLEDGE-BASES-COMP]  isAvailableRefreshRateFeature', this.isAvailableRefreshRateFeature, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

          // Team sub expired
        } else if (profileName === PLAN_NAME.EE) {

          this.isAvailableRefreshRateFeature = false;
          this.logger.log('[KNOWLEDGE-BASES-COMP]  isAvailableRefreshRateFeature', this.isAvailableRefreshRateFeature, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

          // Custom sub expired
        } else if (profileName === PLAN_NAME.F) {

          this.isAvailableRefreshRateFeature = false;
          this.logger.log('[KNOWLEDGE-BASES-COMP]  isAvailableRefreshRateFeature', this.isAvailableRefreshRateFeature, '  profileName  ', profileName, 'trialExpired ', trialExpired, 'projectProfileType ', projectProfileType, 'isActiveSubscription ', isActiveSubscription)

        }

      }
    }
  }



  getAllNamespaces() {
    this.ui.isLoadingNamespaces = true;
    this.facade
      .loadNamespaces(this.id_project, this.router.url)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ namespaces, selection }) => {
        if (selection?.selected) {
          this.selectedNamespace = selection.selected;
          this.selectedNamespaceName = this.selectedNamespace.name;

          if (selection.shouldNavigateToSelected) {
            this.router.navigate(['project/' + this.project._id + '/' + this.kb2BaseSegment() + '/' + this.selectedNamespace.id]);
          }
          if (selection.shouldPersistSelected) {
            this.kbNamespaceSelection.persistNamespace(this.id_project, this.selectedNamespace);
          }

          this.getChatbotUsingNamespace(this.selectedNamespace.id);
          this.paramsDefault = this.facade.buildKbListParams({ namespace: this.selectedNamespace.id });
          this.getListOfKb(this.paramsDefault, 'getAllNamespaces');
        }

        this.ui.isLoadingNamespaces = false;
      });
  }

  createNewNamespace(namespaceName: string, hybrid: boolean) {
    this.kbService.createNamespace(namespaceName, hybrid).subscribe((namespace: any) => {
      if (namespace) {

        this.logger.log('[KNOWLEDGE-BASES-COMP] - CREATE NEW NAMESPACE', namespace);
        const createdNamespace = namespace as KbNamespace;
        this.selectedNamespace = namespace;
        this.getChatbotUsingNamespace(this.selectedNamespace.id)

        this.selectedNamespaceName = namespace['name']
        this.router.navigate(['project/' + this.project._id + '/' + this.kb2BaseSegment() + '/' + this.selectedNamespace.id]);

        this.localDbService.setInStorage(`last_kbnamespace-${this.id_project}`, JSON.stringify(namespace))
        this.namespaces.push(namespace)
        this.logger.log('[KNOWLEDGE-BASES-COMP] CREATE NEW NAMESPACE  namespaces', this.namespaces)

        let paramsDefault = this.facade.buildKbListParams({ namespace: this.selectedNamespace.id });
        this.getListOfKb(paramsDefault, 'createNewNamespace');

        // Install params will be resolved when chatbots+departments are loaded for this namespace.
      }
    }, (error) => {
      this.logger.error('[KNOWLEDGE-BASES-COMP] - CREATE NEW NAMESPACE ERROR', error);
      this.logger.log("[KNOWLEDGE-BASES-COMP] error.error.error", error.error.error)
      this.logger.log("[KNOWLEDGE-BASES-COMP] error.error.plan_limit", error.error.plan_limit)
      this.logger.log("[KNOWLEDGE-BASES-COMP] prjct_profile_name ", this.prjct_profile_name)
      this.logger.log("[KNOWLEDGE-BASES-COMP] projectProfileData ", this.projectProfileData)
      this.logger.log("[KNOWLEDGE-BASES-COMP] projectProfileData type ", this.projectProfileData.profile_type)

      if (error.error.error === "Maximum number of resources reached for the current plan") {
        this.presentDialogNsLimitReached(this.prjct_profile_name, error.error.plan_limit, this.projectProfileData.profile_type)
      }



    }, () => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] - CREATE NEW NAMESPACE * COMPLETE *');

      this.notify.showWidgetStyleUpdateNotification(this.translate.instant('TheKBHasBeenSuccessfullyCreated') , 2, 'done');
    });
  }


  presentDialogNsLimitReached(planName, planLimit, planType) {
    this.logger.log('[KNOWLEDGE-BASES-COMP] openDialog presentDialogNsLimitReached planName', planName, ' planLimit ', planLimit, ' planType ', planType)
    const dialogRef = this.dialog.open(ModalNsLimitReachedComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '400px',
      data: {
        planName: planName,
        planLimit: planLimit,
        planType: planType,
        id_project: this.id_project
      },
    });

    dialogRef.afterClosed().subscribe(res => {
      this.logger.log(`[KNOWLEDGE-BASES-COMP] DIALOG NS LIMIT REACHED (AFTER CLOSED):`, res);

    });
  }

  onOpenInstallOnWebsiteModal() {
    if (!this.selectedNamespace?.id) {
      return;
    }

    const params = this.selectedNamespaceInstallParams;
    if (params?.botId && params?.departmentId) {
      this.dialog.open(ModalInstallOnWebsiteComponent, {
        width: '700px',
        data: {
          projectId: this.id_project,
          botId: params.botId,
          departmentId: params.departmentId,
        },
      });
      return;
    }

    // If bot is not available (no chatbot linked), open the modal with projectId only.
    const firstBot = this.chatbotsUsingNamespace?.[0];
    const botId = firstBot?._id ?? firstBot?.id;
    if (!botId) {
      this.dialog.open(ModalInstallOnWebsiteComponent, {
        width: '700px',
        data: {
          projectId: this.id_project,
        },
      });
      return;
    }

    this.ui.showSpinner = true;
    const tryOpenWithDepartments = (departments: any[]) => {
      const dept = (departments || []).find((d) => d?.status === 1 && d?.id_bot === botId);
      const departmentId = dept?._id ?? dept?.id;
          if (!departmentId) {
            // No department linked: open modal without department/participants.
            this.dialog.open(ModalInstallOnWebsiteComponent, {
              width: '700px',
              data: {
                projectId: this.id_project,
              },
            });
            return true;
          }

          // Persist resolved params for subsequent opens within the same selection.
          this.selectedNamespaceInstallParams = { botId, departmentId };

          this.dialog.open(ModalInstallOnWebsiteComponent, {
            width: '700px',
            data: {
              projectId: this.id_project,
              botId,
              departmentId,
            },
          });
          return true;
    };

    // Prefer already loaded departments (loaded once on page enter).
    if (Array.isArray(this.departmentsAllStatus) && this.departmentsAllStatus.length > 0) {
      tryOpenWithDepartments(this.departmentsAllStatus);
      this.ui.showSpinner = false;
      return;
    }

    // Departments not ready yet: trigger the single load (if not already in progress) and wait once.
    this.loadDepartmentsAllStatusOnce();
    this.departmentService
      .getDeptsByProjectId()
      .pipe(take(1))
      .subscribe({
        next: (departments: any[]) => {
          // Ensure memory cache is populated even if this path runs first.
          if (!this.departmentsAllStatus) {
            this.departmentsAllStatus = Array.isArray(departments) ? departments : [];
          }
          tryOpenWithDepartments(departments);
        },
        error: (err) => {
          this.logger.error('[KNOWLEDGE-BASES-COMP] onOpenInstallOnWebsiteModal getDeptsByProjectId ERROR', err);
          this.notify.showWidgetStyleUpdateNotification(
            this.translate.instant('AnErrorOccurredWhileUpdating'),
            4,
            'report_problem'
          );
        },
        complete: () => {
          this.ui.showSpinner = false;
        },
      });
  }

  onSyncKbLinkedResources() {
    if (!this.selectedNamespace?.id) {
      return;
    }
    this.ui.showSpinner = true;
    this.kbLinkedResources.ensureOnCreate({ projectId: this.id_project, namespace: this.selectedNamespace }).subscribe({
      next: () => {
        this.getChatbotUsingNamespace(this.selectedNamespace.id);
        this.notify.showWidgetStyleUpdateNotification('Sync completed', 2, 'done');
      },
      error: (err) => {
        this.logger.error('[KNOWLEDGE-BASES-COMP] onSyncKbLinkedResources ERROR', err);
        this.notify.showWidgetStyleUpdateNotification(
          this.translate.instant('AnErrorOccurredWhileUpdating'),
          4,
          'report_problem'
        );
      },
      complete: () => {
        this.ui.showSpinner = false;
      },
    });
  }



  onChangeNamespaceName(event) {
    this.logger.log('[KNOWLEDGE-BASES-COMP] ON CHANGE NAMESPACE NAME  event ', event)
    this.newNamespaceName = event
  }

  updateNamespace(body, calledBy, previedata?: any) {
    this.logger.log('[KNOWLEDGE-BASES-COMP] - UPDATE NAME SPACE calledBy ', calledBy);
    this.logger.log('[KNOWLEDGE-BASES-COMP] - UPDATE NAME SPACE body ', body);
    this.logger.log('[KNOWLEDGE-BASES-COMP] - UPDATE NAME SPACE previedata ', previedata);
    const prevName = this.selectedNamespace?.name;

    this.kbService.updateNamespace(body, this.selectedNamespace.id).subscribe((namespace: any) => {
      if (namespace) {

        this.logger.log('[KNOWLEDGE-BASES-COMP] - UPDATE NAME SPACE RES', namespace);
        this.selectedNamespace = namespace
        let updatedNameSpaceName = namespace.name
        this.localDbService.setInStorage(`last_kbnamespace-${this.id_project}`, JSON.stringify(namespace))


        this.logger.log('[KNOWLEDGE-BASES-COMP] - UPDATE NAME SPACE > NAMESPACES ', this.namespaces)
        this.logger.log('[KNOWLEDGE-BASES-COMP] - UPDATE NAME SPACE NAMESPACES EL to update  ', this.namespaces[this.newNamespaceNameIndex])

        if (calledBy !== 'modal-update-settings' && calledBy !== 'modal-update-settings-and-open-preview') {
          this.namespaces[this.newNamespaceNameIndex]['name'] = updatedNameSpaceName
        }

        // New required behavior: keep chatbot + department names in sync.
        if (body?.name && typeof body.name === 'string') {
          this.kbLinkedResources
            .syncOnRename({
              namespaceId: this.selectedNamespace.id,
              oldName: prevName,
              newName: body.name,
            })
            .subscribe({
              next: () => {
                this.getChatbotUsingNamespace(this.selectedNamespace.id);
              },
              error: (err) => {
                this.logger.error('[KNOWLEDGE-BASES-COMP] - KB LINKED RESOURCES syncOnRename ERROR', err);
                this.notify.showWidgetStyleUpdateNotification(
                  this.translate.instant('AnErrorOccurredWhileUpdating'),
                  4,
                  'report_problem'
                );
              },
            });
        }
      }
    }, (error) => {
      this.logger.error('[KNOWLEDGE-BASES-COMP] - UPDATE NAME SPACE NAME ERROR', error);

    }, () => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] - UPDATE NAME SPACE NAME * COMPLETE *');
      this.notify.showWidgetStyleUpdateNotification(this.msgNamespaceHasBeenSuccessfullyUpdated, 2, 'done');
      if (calledBy === 'modal-update-settings-and-open-preview') {
        this.onOpenBaseModalPreview(previedata)
      }

    });
  }


  onBlurUpdateNamespaceName(event) {
    this.logger.log('[KNOWLEDGE-BASES-COMP] ON BLUR UPDATE NAMESPACE NAME event ', event)
    this.logger.log('[KNOWLEDGE-BASES-COMP] ON BLUR UPDATE NAMESPACE newNamespaceName ', this.newNamespaceName)
    if (this.newNamespaceName !== undefined && this.namespaceValueOnFocus !== this.newNamespaceName) {
      let body = { name: this.newNamespaceName }
      this.updateNamespace(body, 'onBlur')
    }
    this.namespaceIsEditable = false;
  }

  onFocusNamespaceName(value) {
    this.logger.log('[KNOWLEDGE-BASES-COMP] onFocusNamespaceName ', value)
    this.namespaceValueOnFocus = value
  }

  onPressEnterUpdateNamespaceName(event) {
    this.logger.log('[KNOWLEDGE-BASES-COMP] ON PRESS ENTER UPDATE NAMESPACE NAME event ', event)
    if (event.code === 'Enter' || event.which === 13) {
      if (this.newNamespaceName !== undefined) {
        let body = { name: this.newNamespaceName }
        this.updateNamespace(body, 'onEnterPresses')
      }
      this.namespaceIsEditable = false;
    }
  }

  hasClickedNamespaceName() {
    this.namespaceIsEditable = true
    this.logger.log('[KNOWLEDGE-BASES-COMP] hasClickedNamespaceName namespaceIsEditable', this.namespaceIsEditable)
    setTimeout(() => {
      let namespaceNameInputEl = document.getElementById("namespace-name-input");
      this.logger.log('[KNOWLEDGE-BASES-COMP] hasClickedNamespaceName namespaceNameInputEl', namespaceNameInputEl)

      namespaceNameInputEl.focus()
      this.namespaceValueOnFocus = (<HTMLInputElement>namespaceNameInputEl).value
      this.newNamespaceNameIndex = this.namespaces.findIndex((e) => e.name === this.namespaceValueOnFocus);
      this.logger.log('[KNOWLEDGE-BASES-COMP] hasClickedNamespaceName >>> index <<< in namespaces of namespace name cliked ', this.newNamespaceNameIndex)

      this.logger.log('[KNOWLEDGE-BASES-COMP] hasClickedNamespaceName namespaceNameInputEl value', this.namespaceValueOnFocus)
    }, 100);

  }

  onMouseOver() {

    this.logger.log('[KNOWLEDGE-BASES-COMP] onMouseOver namespace name namespaceIsEditable', this.namespaceIsEditable)

    let namespaceNameOutputEl = document.getElementById("namespace-name-output");

    if (namespaceNameOutputEl) {
      namespaceNameOutputEl.style.border = '1px solid #d3dbe5'
      this.namespaceNameOutputElWidth = document.getElementById("namespace-name-output").offsetWidth + 'px';
    }
    this.logger.log('[KNOWLEDGE-BASES-COMP] onMouseOver namespace name namespaceNameOutputElWidth', this.namespaceNameOutputElWidth)
  }

  onMouseOut() {
    let namespaceNameOutputEl = document.getElementById("namespace-name-output");
    if (namespaceNameOutputEl) {
      this.logger.log('[KNOWLEDGE-BASES-COMP] onMouseOut namespaceNameOutputEl', namespaceNameOutputEl)
      namespaceNameOutputEl.style.border = '1px solid transparent'
    }


  }

  onSelectNamespace(namespace) {
    this.logger.log('[KNOWLEDGE-BASES-COMP] onSelectNamespace namespace', namespace)

    if (namespace) {
      this.router.navigate(['project/' + this.project._id + '/' + this.kb2BaseSegment() + '/' + namespace.id]);

      this.hasChangedNameSpace = true;
      this.selectedNamespace = namespace
      this.selectedNamespaceName = namespace['name']
      this.logger.log('[KNOWLEDGE-BASES-COMP] onSelectNamespace selectedNamespace', this.selectedNamespace)
      this.logger.log('[KNOWLEDGE-BASES-COMP] onSelectNamespace hasChangedNameSpace', this.hasChangedNameSpace)

      this.logger.log('[KNOWLEDGE-BASES-COMP] onSelectNamespace selectedNamespace NAME', this.selectedNamespaceName)
      this.getChatbotUsingNamespace(this.selectedNamespace.id)





      this.localDbService.setInStorage(`last_kbnamespace-${this.id_project}`, JSON.stringify(namespace))
      let paramsDefault = this.facade.buildKbListParams({ namespace: this.selectedNamespace.id });
      this.getListOfKb(paramsDefault, 'onSelectNamespace');
      this.loadUnansweredQuestions();

    }
  }

  private resolveInstallParamsFromDepartments(botId: string, namespaceId: string): void {
    this.selectedNamespaceInstallParams = null;
    const reqSeq = ++this.installParamsRequestSeq;

    const departments = this.departmentsAllStatus;
    if (!departments || departments.length === 0) {
      // Departments are loaded once when entering Agents; if not ready yet, do nothing here.
      // The install button has an on-demand fallback that will wait for the load to complete.
      return;
    }

    if (reqSeq !== this.installParamsRequestSeq) {
      return;
    }

    const dept = (departments || []).find((d: any) => d?.status === 1 && d?.id_bot === botId);
    const departmentId = (dept?._id ?? (dept as any)?.id) as string | undefined;
    if (!departmentId) {
      return;
    }
    if (this.selectedNamespace?.id !== namespaceId) {
      return;
    }
    this.selectedNamespaceInstallParams = { botId, departmentId };
  }

  private loadDepartmentsAllStatusOnce(): void {
    if (this.departmentsAllStatus || this.isLoadingDepartmentsAllStatus) {
      return;
    }
    this.isLoadingDepartmentsAllStatus = true;
    this.departmentService
      .getDeptsByProjectId()
      .pipe(take(1), takeUntil(this.unsubscribe$))
      .subscribe({
        next: (departments: Department[]) => {
          this.departmentsAllStatus = Array.isArray(departments) ? departments : [];
        },
        error: (err) => {
          this.logger.error('[KNOWLEDGE-BASES-COMP] loadDepartmentsAllStatusOnce getDeptsByProjectId ERROR', err);
          this.departmentsAllStatus = [];
        },
        complete: () => {
          this.isLoadingDepartmentsAllStatus = false;
        },
      });
  }

  getChatbotUsingNamespace(selectedNamespaceid: string) {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {

      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().baseImageUrl;
    }

    this.chatbotsUsingNamespace = []
    // Install params will be resolved after chatbots load for the selected namespace.
    this.selectedNamespaceInstallParams = null;
    this.kbService.getChatbotsUsingNamespace(selectedNamespaceid).subscribe((chatbots: any) => {

      this.logger.log('[KNOWLEDGE-BASES-COMP] - GET CHATBOTS USING NAMESPACE chatbots', chatbots);
      if (chatbots.length > 0) {
        this.logger.log('[KNOWLEDGE-BASES-COMP] - GET CHATBOTS USING NAMESPACE chatbots ', chatbots)


        chatbots.forEach(bot => {
          this.logger.log('[KNOWLEDGE-BASES-COMP] - GET FAQKB forEach bot: ', bot)


          let imgUrl = ''
          if (this.UPLOAD_ENGINE_IS_FIREBASE === true) {
            imgUrl = "https://firebasestorage.googleapis.com/v0/b/" + this.storageBucket + "/o/profiles%2F" + bot['_id'] + "%2Fphoto.jpg?alt=media"

          } else {
            imgUrl = this.baseUrl + "files?path=uploads%2Fusers%2F" + bot['_id'] + "%2Fimages%2Fthumbnails_200_200-photo.jpg"
          }
          this.checkImageExists(imgUrl, (existsImage) => {
            if (existsImage == true) {
              this.logger.log('[KNOWLEDGE-BASES-COMP] - IMAGE EXIST X bot', bot);
              bot.hasImage = true;
            }
            else {
              this.logger.log('[KNOWLEDGE-BASES-COMP] - IMAGE NOT EXIST X bot', bot);
              bot.hasImage = false;
            }
          });
        });

        this.chatbotsUsingNamespace = chatbots;
        this.logger.log('[KNOWLEDGE-BASES-COMP] - GET CHATBOTS USING NAMESPACE chatbotsUsingNamespace', this.chatbotsUsingNamespace);

        // Minimal workflow: one chatbot per KB namespace. Use the first.
        const firstBot = this.chatbotsUsingNamespace?.[0];
        const botId = firstBot?._id ?? firstBot?.id;
        if (botId && this.selectedNamespace?.id === selectedNamespaceid) {
          this.resolveInstallParamsFromDepartments(botId, selectedNamespaceid);
        }

      } else {
        this.chatbotsUsingNamespace = undefined
      }

    }, (error) => {
      this.logger.error('[KNOWLEDGE-BASES-COMP] - GET CHATBOTS USING NAMESPACE ', error);

    }, () => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] - GET CHATBOTS USING NAMESPACE * COMPLETE *');
    });
  }

  checkImageExists(imageUrl, callBack) {
    var imageData = new Image();
    imageData.onload = function () {
      callBack(true);
    };
    imageData.onerror = function () {
      callBack(false);
    };
    imageData.src = imageUrl;
  }

  createChatbotfromKbOfficialResponderTemplate() {
    this.logger.log('[KNOWLEDGE-BASES-COMP] createChatbotfromKbOfficialResponderTemplate USER_ROLE', this.USER_ROLE) 
    this.logger.log('[KNOWLEDGE-BASES-COMP] createChatbotfromKbOfficialResponderTemplate myChatbotOtherCount', this.myChatbotOtherCount) 
    if (this.USER_ROLE !== 'agent') {
      if (this.chatBotLimit) {
        if (this.myChatbotOtherCount < this.chatBotLimit) {
          this.logger.log('[KNOWLEDGE-BASES-COMP] USECASE  chatBotCount < chatBotLimit: RUN FORK')
          this.findKbOfficialResponderAndThenExportToJSON()
        } else if (this.myChatbotOtherCount >= this.chatBotLimit) {
          this.logger.log('[KNOWLEDGE-BASES-COMP] USECASE  chatBotCount >= chatBotLimit DISPLAY MODAL')
          this.presentDialogReachedChatbotLimit()
        }
      } else if (!this.chatBotLimit) {
        this.logger.log('[KNOWLEDGE-BASES-COMP] USECASE  NO chatBotLimit: RUN FORK')
        this.findKbOfficialResponderAndThenExportToJSON()
      }



    } if (this.USER_ROLE === 'agent') {
      this.presentModalOnlyOwnerCanManageChatbot()
    }
  }

  findKbOfficialResponderAndThenExportToJSON() {
    this.esportingKBChatBotTemplate = true
    this.faqKbService.getTemplates().subscribe((certifiedTemplates: any) => {

      if (certifiedTemplates) {

        let kbOfficialResponderTemplate = certifiedTemplates.find(c => {
          if (c.certifiedTags) {
            let officialResponder = c.certifiedTags.find(t => t.name === this.kbOfficialResponderTag)
            return officialResponder
          }
        });
        this.logger.log('[KNOWLEDGE-BASES-COMP] kbOfficialResponderTemplate', kbOfficialResponderTemplate)

        if (kbOfficialResponderTemplate) {
          this.exportKbOfficialResponderToJSON(kbOfficialResponderTemplate._id)
        } else {
          this.logger.log('[KNOWLEDGE-BASES-COMP] Not exist kbOfficialResponderTemplate', kbOfficialResponderTemplate)
          this.esportingKBChatBotTemplate = false;
          this.presentDialogNotExistThekbOfficialResponderTemplate()
        }
      }
    })
  }

  exportKbOfficialResponderToJSON(kbOfficialResponderTemplate_id) {
    this.faqKbService.exportChatbotToJSON(kbOfficialResponderTemplate_id).subscribe((chatbot: any) => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] - EXPORT CHATBOT TO JSON - CHATBOT', chatbot)
      this.logger.log('[KNOWLEDGE-BASES-COMP] - EXPORT CHATBOT TO JSON - CHATBOT INTENTS', chatbot.intents)
      chatbot.intents.forEach((intent, index) => {
        this.logger.log('[KNOWLEDGE-BASES-COMP] - EXPORT CHATBOT TO JSON - CHATBOT INTENT > actions', intent.actions)
        const askGPT_Action = intent.actions.find(o => o._tdActionType === "askgptv2")

        if (askGPT_Action) {
          askGPT_Action.namespace = this.selectedNamespace.id
          this.logger.log('[KNOWLEDGE-BASES-COMP] - EXPORT CHATBOT TO JSON - CHATBOT INTENT > actions askGPT_Action', askGPT_Action)
          this.esportingKBChatBotTemplate = false
          this.presentDialogChatbotname(chatbot)
        }
      });

    }, (error) => {
      this.logger.error('[KNOWLEDGE-BASES-COMP] - EXPORT BOT TO JSON - ERROR', error);
      this.esportingKBChatBotTemplate = false
    }, () => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] - EXPORT BOT TO JSON - COMPLETE');


    });
  }

  presentDialogChatbotname(chatbot) {
    this.logger.log('[KNOWLEDGE-BASES-COMP] openDialog presentDialogChatbotname chatbot ', chatbot)
    const dialogRef = this.dialog.open(ModalChatbotNameComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '600px',
      data: {
        chatbot: chatbot,
      },
    });

    dialogRef.afterClosed().subscribe(editedChatbot => {
      if (editedChatbot) {
        this.logger.log(`[KNOWLEDGE-BASES-COMP] DIALOG CHATBOT NAME editedChatbot:`, editedChatbot);
        this.importChatbotFromJSON(editedChatbot)
      }
    });
  }

  importChatbotFromJSON(editedChatbot) {
    this.logger.log('[KNOWLEDGE-BASES-COMP] - IMPORT CHATBOT FROM JSON editedChatbot ', editedChatbot)
    this.faqService.importChatbotFromJSONFromScratch(editedChatbot).subscribe((faqkb: any) => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] - IMPORT CHATBOT FROM JSON - ', faqkb)
      if (faqkb) {
        this.getChatbotUsingNamespace(this.selectedNamespace.id)

        this.getDeptsByProjectId(faqkb)
      }

    }, (error) => {
      this.logger.error('[KNOWLEDGE-BASES-COMP] -  IMPORT CHATBOT FROM JSON- ERROR', error);
    }, () => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] - IMPORT CHATBOT FROM JSON - COMPLETE');

    });
  }




  getDeptsByProjectId(faqkb?: string) {
    this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {

      this.logger.log('[KNOWLEDGE-BASES-COMP] --->  DEPTS RES ', departments);

      if (departments) {
        const depts_length = departments.length
        this.logger.log('[KNOWLEDGE-BASES-COMP] --->  DEPTS LENGHT ', depts_length);

        if (depts_length === 1) {
          this.dept_id = departments[0]['_id']

          this.logger.log('[KNOWLEDGE-BASES-COMP] ---> USECASE DEPTS LENGHT = 1 - DEFAULT DEPT HAS BOT ', departments[0].hasBot);
          this.logger.log('[KNOWLEDGE-BASES-COMP] ---> USECASE DEPTS LENGHT = 1 - DEFAULT DEPT HAS BOT ', departments[0]);
          if (departments[0].hasBot === true) {
            this.presentDialogChatbotSuccessfullyCreated()

            this.logger.log('[KNOWLEDGE-BASES-COMP] --->  DEFAULT DEPT HAS BOT ');
          } else {
            this.logger.log('[KNOWLEDGE-BASES-COMP] ---> USECASE DEPTS LENGHT = 1 DEFAULT DEPT NOT HAS BOT ', departments[0]);
            this.logger.log('[KNOWLEDGE-BASES-COMP] ---> USECASE DEPTS LENGHT = 1 DEFAULT DEPT NOT HAS BOT ', departments[0].hasBot);
            this.hookBotToDept(departments[0]._id, faqkb, 'hookToDefaultDept');
            this.presentDialogChatbotSuccessfullyCreated()
          }

        } else if (depts_length > 1) {
          this.logger.log('[KNOWLEDGE-BASES-COMP] --->  DEPTS LENGHT  USECASE DEPTS LENGHT > 1', depts_length);

          departments.forEach(dept => {

            if (dept.hasBot === true) {
              this.logger.log('[KNOWLEDGE-BASES-COMP] ---> USECASE DEPTS LENGHT > 1  DEPT HAS BOT ');
            } else {
              this.logger.log('[KNOWLEDGE-BASES-COMP] ---> USECASE DEPTS LENGHT > 1  DEPT NOT HAS BOT ');

              this.depts_without_bot_array.push({ id: dept._id, name: dept.name })
              this.logger.log('[KNOWLEDGE-BASES-COMP] ---> USECASE DEPTS LENGHT > 1  DEPT NOT HAS BOT  depts_without_bot_array ', this.depts_without_bot_array);

              if (!this.dialogRefHookBoot) {
                this.presentDialogChatbotSuccessfullyCreatedTheHookBot(this.depts_without_bot_array, faqkb)
              }
            }
          });
        }
      }
    }, error => {

      this.logger.error('[KNOWLEDGE-BASES-COMP] --->  DEPTS RES - ERROR', error);
    }, () => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] --->  DEPTS RES - COMPLETE')

    });

  }

  presentDialogExportContents() {
    Swal.fire({
      title: this.translate.instant('Warning'),
      text: this.translate.instant('KbPage.OnlyUrlTextFaqWillBeExported'),
      icon: "info",
      showCloseButton: false,
      showCancelButton: true,
      showConfirmButton: true,
      showDenyButton: false,
      confirmButtonText: this.translate.instant('Ok'),
      cancelButtonText: this.translate.instant('Cancel'),
      focusConfirm: false,
      reverseButtons: true,
    })
      .then((result) => {
        if (result.isConfirmed) {
          this.kbService.exportContents(this.selectedNamespace.id).subscribe((res: any) => {

            this.logger.log('[KNOWLEDGE-BASES-COMP] EXPORT  - RES', res);

            if (res) {
              this.downloadObjectAsJson(res, this.selectedNamespace.name + ' contents')
            }
          }, (error) => {
            Swal.fire({
              title: this.translate.instant('Oops') + '!',
              text: this.translate.instant('HoursPage.ErrorOccurred'),
              icon: "error",
              showCloseButton: false,
              showCancelButton: false,
              confirmButtonText: this.translate.instant('Ok'),
              // confirmButtonColor: "var(--primary-btn-background)",
            });
            this.logger.error('[KNOWLEDGE-BASES-COMP] EXPORT  ERROR ', error);
          }, () => {
            this.logger.log('[KNOWLEDGE-BASES-COMP] EXPORT * COMPLETE *');



            Swal.fire({
              title: this.translate.instant('Done') + "!",
              text: this.translate.instant('KbPage.TheContentsHaveBeenSuccessfullyExported'),
              icon: "success",
              showCloseButton: false,
              showCancelButton: false,
              // confirmButtonColor: "var(--primary-btn-background)",
              confirmButtonText: this.translate.instant('Ok'),
            }).then((okpressed) => {

            });
          });
        } else {
          this.logger.log('[KNOWLEDGE-BASES-COMP] EXPORT (else)')
        }
      });
  }

  downloadObjectAsJson(exportObj, exportName) {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  presentDialogImportContents() {
  Swal.fire({
    title: this.translate.instant('Warning'),
    html: `
      <p>${this.translate.instant('KbPage.ImportWillDeleteAllContents')}</p>
      <input type="file" id="hiddenFileInput" accept=".json" style="display: none;" />
    `,
    icon: "info",
    showCancelButton: true,
    showConfirmButton: true,
    confirmButtonText: this.translate.instant('FaqPage.ChooseFile'),
    cancelButtonText: this.translate.instant('Cancel'),
    reverseButtons: true,
    didOpen: () => {
      const confirmBtn = Swal.getConfirmButton();
      const fileInput = document.getElementById('hiddenFileInput') as HTMLInputElement;

      // Replace file input to remove old event listeners
      const newFileInput = fileInput.cloneNode(true) as HTMLInputElement;
      fileInput.parentNode?.replaceChild(newFileInput, fileInput);

      confirmBtn.addEventListener('click', () => {
        newFileInput.click();
      });

      newFileInput.addEventListener('change', () => {
        const file = newFileInput.files?.[0];
        if (!file) return;

        if (file.type !== "application/json" && !file.name.endsWith('.json')) {
          Swal.fire({
            icon: 'error',
            title: this.translate.instant('InvalidJSON'),
            text: this.translate.instant('SorryFileTypeNotSupported')
          });
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          const jsonText = reader.result as string;

          if (containsXSS(jsonText)) {
            Swal.fire({
              icon: 'error',
              title: this.translate.instant('InvalidJSON'),
              text: this.translate.instant('UploadedFileMayContainsDangerousCode'),
            });
            return;
          }

          try {
            JSON.parse(jsonText);
          } catch (error) {
            Swal.fire({
              icon: 'error',
              title: this.translate.instant('InvalidJSON'),
              text: this.translate.instant('TheSelectedFileDoesNotContainValidJSON'),
            });
            return;
          }

          const formData = new FormData();
          formData.append('uploadFile', file, file.name);

          // Show loading modal while importing
          Swal.fire({
            title: this.translate.instant('KbPage.Importing'),
            text: this.translate.instant('KbPage.ImportingDataPleaseWait'),
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          this.kbService.importContents(formData, this.selectedNamespace.id).subscribe({
            next: (res) => {
              this.logger.log('[KB IMPORT] Response:', res);
            },
            error: (error) => {
              let errorMessage = ""
              if (error && error.error && error.error.error === 'Cannot exceed the number of resources in the current plan') {
                const planLimit = error.error.plan_limit;
                errorMessage = this.translate.instant('KbPage.CannotExceedTheNumberOfResourcesInTheCurrentPlan', { plan_limit: planLimit })
              } else {
                errorMessage = this.translate.instant('HoursPage.ErrorOccurred')
              }
              Swal.close();
              Swal.fire({
                title: this.translate.instant('Oops') + '!',
                text: errorMessage, // this.translate.instant('HoursPage.ErrorOccurred'),
                icon: "error",
                confirmButtonText: this.translate.instant('Ok')
              });
              this.logger.error('[KB IMPORT ERROR]', error);
            },
            complete: () => {
              Swal.close();
              this.logger.log('[KB IMPORT] * COMPLETE *');

              const paramsDefault = this.facade.buildKbListParams({ namespace: this.selectedNamespace.id });
              this.getListOfKb(paramsDefault, 'onImportJSON');

              Swal.fire({
                title: this.translate.instant('Done') + "!",
                text: this.translate.instant('KbPage.TheContentsHaveBeenSuccessfullyImported'),
                icon: "success",
                confirmButtonText: this.translate.instant('Ok')
              });
            }
          });
        };

        reader.readAsText(file);
      });
    }
  });
}



 


  presentDialogChatbotSuccessfullyCreated() {
    this.logger.log('[KNOWLEDGE-BASES-COMP] --->  DIALOG CHATBOT CREATED depts_without_bot_array 1', this.depts_without_bot_array);

    Swal.fire({
      title: this.translate.instant('AIAgentSuccessfullyCreated'),
      text: this.translate.instant('NowItIsTimeToAddContent') + ' !',
      icon: "success",
      showCloseButton: false,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('Ok'),
      focusConfirm: true,
    })
  }

  presentDialogNotExistThekbOfficialResponderTemplate() {
    Swal.fire({
      title: this.translate.instant('ItIsNotPossibleToCreateTheChatbot'), //"It is not possible to create the chatbot",
      text: this.translate.instant('YourProjectIsMissingTheTemplateNeededToCreateTheChatbot') + ' !',
      icon: "error",
      showCloseButton: false,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('Ok'),
      focusConfirm: true,
    })
  }


  presentDialogChatbotSuccessfullyCreatedTheHookBot(depts_without_bot_array, faqkb) {
    this.logger.log('[KNOWLEDGE-BASES-COMP] --->  DIALOG CHATBOT CREATED depts_without_bot_array 1', this.depts_without_bot_array);

    Swal.fire({
      title: this.translate.instant('AI Agent Successfully Created'),
      text: this.translate.instant('NowItIsTimeToAddContent') + ' !',
      icon: "success",
      showCloseButton: false,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('BotsPage.Continue') + ' ' + '<i class="fa fa-arrow-right">',
      reverseButtons: true,
    }).then((result: any) => {

      if (result.isConfirmed) {

        this.logger.log('[KNOWLEDGE-BASES-COMP] --->  DIALOG CHATBOT CREATED result ', result);

        this.openDialogHookBot(depts_without_bot_array, faqkb)
      }
    })
  }



  openDialogHookBot(deptsWithoutBotArray, faqkb) {
    this.logger.log('[KNOWLEDGE-BASES-COMP] -------> OPEN DIALOG HOOK BOT !!!!')
    this.dialogRefHookBoot = this.dialog.open(ModalHookBotComponent, {
      width: '700px',
      data: {
        deptsWithoutBotArray: deptsWithoutBotArray,
        chatbot: faqkb
      },
    })
    this.dialogRefHookBoot.afterClosed().subscribe(result => {
      this.dialogRefHookBoot = null;
      this.logger.log(`[KNOWLEDGE-BASES-COMP] DIALOG HOOK BOT after closed result:`, result);
      if (result && result.deptId && result.botId) {
        this.hookBotToDept(result.deptId, result.botId)
      }
    });
  }


  hookBotToDept(deptId, botId, hookToDefaultDept?: string) {
    this.logger.log('[KNOWLEDGE-BASES-COMP] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT > hookToDefaultDept ', hookToDefaultDept);
    this.logger.log('[KNOWLEDGE-BASES-COMP] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT > deptId ', deptId, 'botId', botId);
    this.departmentService.updateExistingDeptWithSelectedBot(deptId, botId).subscribe((res) => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - RES ', res);

    }, (error) => {
      this.logger.error('[KNOWLEDGE-BASES-COMP] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - ERROR ', error);
    }, () => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - COMPLETE ');
      if (hookToDefaultDept === undefined) {
        this.notify.showWidgetStyleUpdateNotification(this.translate.instant('BotSuccessfullyActivated'), 2, 'done');
      }
    });
  }


  presentDialogReachedChatbotLimit() {
    this.logger.log('[KNOWLEDGE-BASES-COMP] openDialog presentDialogReachedChatbotLimit prjct_profile_name ', this.prjct_profile_name)
    const dialogRef = this.dialog.open(ChatbotModalComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      data: {
        projectProfile: this.prjct_profile_name,
        subscriptionIsActive: this.subscription_is_active,
        prjctProfileType: this.prjct_profile_type,
        trialExpired: this.trial_expired,
        chatBotLimit: this.chatBotLimit
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      this.logger.log(`[KNOWLEDGE-BASES-COMP] Dialog result: ${result}`);
    });
  }

  presentModalOnlyOwnerCanManageChatbot() {
    this.notify.presentModalAgentCannotManageChatbot(this.translate.instant('AgentsCannotManageChatbots'), this.learnMoreAboutDefaultRoles)
  }

  presentDialogGoToCDS(chatbot) {
    if(!this.PERMISSION_TO_EDIT_FLOWS) {
      this.notify.presentDialogNoPermissionToPermomfAction()
      return;
    }

    this.logger.log('[KNOWLEDGE-BASES-COMP] -------> OPEN DIALOG GO TO CDS !!!!')
    const dialogRef = this.dialog.open(ModalConfirmGotoCdsComponent, {
      width: '700px',
      data: {
        chatbot: chatbot
      },
    })
    dialogRef.afterClosed().subscribe(result => {

      this.logger.log(`[KNOWLEDGE-BASES-COMP] DIALOG GO TO CDS after closed result:`, result);

      if (result && result.chatbot && result.redirectTo === "block") {

        let faqkb = {
          createdAt: new Date(),
          _id: chatbot._id
        }
        goToCDSVersion(this.router, faqkb, this.project._id, this.appConfigService.getConfig().cdsBaseUrl)
      } else if (result && result.chatbot && result.redirectTo === "settings") {
        let faqkb = {
          createdAt: new Date(),
          _id: chatbot._id
        }
        goToCDSSettings(this.router, faqkb, this.project._id, this.appConfigService.getConfig().cdsBaseUrl)
      }


    });

  }


  // ------------------------------------------------------------------------
  // @ Modals Windows
  // ------------------------------------------------------------------------
  presentModalAddNewNamespace() {
    this.logger.log('[KNOWLEDGE-BASES-COMP] - presentModalAddNewNamespace ');

    const dialogRef = this.dialog.open(ModalAddNamespaceComponent, {
      width: '600px',
      data: {
        pay: this.payIsVisible,
        hybridActive: this.isActiveHybrid,
        isAgentsPage: this.isAgentsPage,
      },
    })
    dialogRef.afterClosed().subscribe(result => {
      this.logger.log(`[KNOWLEDGE-BASES-COMP] Dialog result:`, result);

      if (result && result.namespaceName) {

        const namespaceName = result.namespaceName;
        const hybrid = result.hybrid || false;

        this.createNewNamespace(namespaceName, hybrid)
      }
    });
  }

  onOpenBaseModalPreview(previedata?: any) {
    const dialogRef = this.dialog.open(ModalPreviewKnowledgeBaseComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      disableClose: true,
      width: '400px',
      id: 'kb-test',
      data: {
        selectedNamespace: this.selectedNamespace,
        askBody: previedata
      },
    });
    dialogRef.backdropClick().subscribe((event) => {
      this.logger.log('Modal preview Backdrop clicked', event);
      this.hasClickedPreviewModalBackdrop = true
      const customevent = new CustomEvent("on-backdrop-clicked", { detail: this.hasClickedPreviewModalBackdrop });
      document.dispatchEvent(customevent);
    });
    dialogRef.afterClosed().subscribe(result => {
      this.logger.log('[ModalPreview] Dialog AFTER CLOSED result : ', result);
      if (result === undefined) {
        this.kbService.modalPreviewKbHasBeenClosed()
      }

      if (result) {
        if (result.action === 'open-settings-modal' && result.data) {
          this.onOpenBaseModalPreviewSettings(result.data)
        } else if (result.action === 'open-settings-modal' && !result.data) {
          this.onOpenBaseModalPreviewSettings()
        }
      }

    });
  }

  onOpenBaseModalPreviewSettings(previedata?: any) {
    //#191d2285;
    const dialogRef = this.dialog.open(ModalPreviewSettingsComponent, {
      // backdropClass: 'cdk-overlay-transparent-backdrop',
      backdropClass: 'overlay-backdrop',
      hasBackdrop: true,
      disableClose: true,
      width: '360px',
      data: {
        selectedNamespace: this.selectedNamespace,
        pineconeReranking: this.pineconeReranking
      },
    });
    dialogRef.backdropClick().subscribe((event) => {
      this.logger.log('AI model Backdrop clicked', event);
      this.hasClickedAiSettingsModalBackdrop = true
      const customevent = new CustomEvent("on-backdrop-clicked", { detail: this.hasClickedAiSettingsModalBackdrop });
      document.dispatchEvent(customevent);
    });
    dialogRef.afterClosed().subscribe(result => {
      this.logger.log('[ModalPreviewSettings] Dialog after closed result: ', result);
      if (result && result.action) {
        this.logger.log('[ModalPreviewSettings] Dialog after closed action 1', result.action)
        this.logger.log('[ModalPreviewSettings] Dialog after closed action 2', result.action)
        this.logger.log('[ModalPreviewSettings] Dialog after closed selectedNamespace ', result.selectedNamespace)

        if (result.action === "update") {
          let body = { preview_settings: result.selectedNamespace.preview_settings }
          this.logger.log('[ModalPreviewSettings] update body ', body)
          this.updateNamespace(body, 'modal-update-settings')
        }

        if (result.action === "update-and-open-preview") {
          this.logger.log('[ModalPreviewSettings] Dialog after closed HRE YES ', result.selectedNamespace)
          let body = { preview_settings: result.selectedNamespace.preview_settings }
          this.logger.log('[ModalPreviewSettings] update-and-open-preview body ', body)
          if (previedata) {
            this.updateNamespace(body, 'modal-update-settings-and-open-preview', previedata)
          } else {
            this.updateNamespace(body, 'modal-update-settings-and-open-preview')
          }
        }



      } else {
        this.logger.log('[ModalPreviewSettings] Dialog after closed result ', result)
      }
    });
  }

  onOpenDeleteNamespaceModal() {
    if(!this.PERMISSION_TO_DELETE) {
      this.notify.presentDialogNoPermissionToPermomfAction();
      return;
    }
    this.logger.log("onOpenDeleteNamespaceModal called....")
    if (this.selectedNamespace.default && this.kbsList.length === 0) {
      this.presentModalDefautNamespaceCannotBeDeleted()
    } else {
      this.presentDeleteNamespaceModal()
    }
  }

  presentDeleteNamespaceModal() {
    const dialogRef = this.dialog.open(ModalDeleteNamespaceComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '600px',
      data: {
        namespaces: this.namespaces,
        selectedNamespace: this.selectedNamespace,
        kbsList: this.kbsList,
      },
    });
    dialogRef.afterClosed().subscribe(result => {
      this.logger.log('[ModalDeleteNamespace] Dialog result: ', result);
      if (result) {

        this.onDeleteNamespace(result.deleteAlsoNamespace, result.nameSpaceIdex)
      }
    });
  }

  onOpenBaseModalDetail(kb, type) {
    this.logger.log('onOpenBaseModalDetail:: ', kb);

    const dialogRef = this.dialog.open(ModalDetailKnowledgeBaseComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '600px',
      autoFocus: false,
      data: {
        kb: kb,
        refreshRateIsEnabled: this.refreshRateIsEnabled,
        isAvailableRefreshRateFeature: this.isAvailableRefreshRateFeature,
        payIsVisible: this.payIsVisible
      },
    });
    dialogRef.afterClosed().subscribe(res => {

     console.log('[Modal KB DETAILS] Dialog afterClosed res : ', res);
    
     if (res) {
      if(res.method === 'update') {
        console.log('[Modal KB DETAILS] Dialog afterClosed method : ', res.method);
        console.log('[Modal KB DETAILS] Dialog afterClosed kb:  ' , res.kb);
        this.updateKbContent(res.kb)
      } else if (res.method === 'delete') {
        
        console.log('[Modal KB DETAILS] Dialog afterClosed method : ', res.method, );
        console.log('[Modal KB DETAILS] Dialog afterClosed kb:  ' , res.kb);
        this.onOpenBaseModalDelete(res.kb)
      }
     }
    });
  }

  updateKbContent(kb) {
    this.logger.log('[Modal KB DETAILS] updateKbContent kb:', kb);
    this.kbService.updateKbContent(kb).subscribe((response: any) => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] updateKbContent response', response);
      this.notify.showWidgetStyleUpdateNotification(this.msgSuccesUpdateKb, 2, 'done');
      const paramsDefault = this.facade.buildKbListParams({ namespace: this.selectedNamespace.id });
      this.getListOfKb(paramsDefault, 'after-update');
    }, (error) => {
      this.logger.error('[KNOWLEDGE-BASES-COMP] updateKbContent error', error);
    });
  }

  onOpenBaseModalDelete(kb) {
    this.kbid_selected = kb;
    this.kbid_selected.deleting = true;
    this.baseModalDelete = true;

    if (kb.type !== 'sitemap') {
      const dialogRef = this.dialog.open(ModalDeleteKnowledgeBaseComponent, {
        backdropClass: 'cdk-overlay-transparent-backdrop',
        hasBackdrop: true,
        width: '600px',
        data: {
          kb: kb
        },
      });
      dialogRef.afterClosed().subscribe(kb => {
        this.logger.log('[Modal DELETE KB] kb: ', kb);
        if (kb) {
          this.onDeleteKnowledgeBase(kb)
        }
      });
    } else if (kb.type === 'sitemap') {
      this.presentDialogComfimDeleteSitemap(kb)
    }
  }

  presentDialogComfimDeleteSitemap(kb) {
     kb.deleting = false;
     Swal.fire({
      title: this.translate.instant('Warning'),
      text: this.translate.instant('KbPage.DeletingTheSitemapNotDeleteTheContents'),
      icon: "warning",
      showCloseButton: false,
      showCancelButton: true,
      showConfirmButton: false,
      showDenyButton: true,
      denyButtonText: this.translate.instant('Delete'),
      cancelButtonText: this.translate.instant('Cancel'),
      focusConfirm: false,
      reverseButtons: true,
    }).then((result) => {
        if (result.isDenied) { 
          this.onDeleteKnowledgeBase(kb)
        } else {
          kb.deleting = false;
        }
      })
  }



  onOpenAddContent() {
    const dialogRef = this.dialog.open(ModalAddContentComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '900px',
    });

    dialogRef.afterClosed().subscribe(type => {
      this.logger.log('[KNOWLEDGE BASES COMP] type: ', type);
      if (type) {
        this.openAddKnowledgeBaseModal(type)
      }
    });
  }


  openAddKnowledgeBaseModal(typeOrKb?: any) {
    this.logger.log('[KNOWLEDGE BASES COMP] openAddKnowledgeBaseModal typeOrKb', typeOrKb);
    // Se è un oggetto KB (ad esempio da unanswered questions), apri direttamente la modale FAQ con i dati precompilati
    if (typeOrKb && typeof typeOrKb === 'object' && typeOrKb.type === 'faq') {
      const dialogRef = this.dialog.open(ModalFaqsComponent, {
        backdropClass: 'cdk-overlay-transparent-backdrop',
        hasBackdrop: true,
        width: '600px',
        data: {
          selectedNamespace: this.selectedNamespace,
          prefillKb: typeOrKb
        },
      });
      this.logger.log('[KNOWLEDGE BASES COMP] presentModalAddFaqs with prefillKb')
      dialogRef.afterClosed().subscribe(result => {
        this.logger.log('[Modal Add FAQs] Dialog result (afterClosed): ', result);
        if (result && result.isSingle === "true") {
          if (result.body) {
            this.onAddKb(result.body)
          }
        } else if (result && result.isSingle === "false") {
          let paramsDefault = this.facade.buildKbListParams({ namespace: this.selectedNamespace.id });
          this.getListOfKb(paramsDefault, 'add-multi-faq')
        }
      });
      return;
    }
    this.typeKnowledgeBaseModal = typeOrKb;

    if (typeOrKb === 'text-file') {
      this.presentModalAddContent()
    }
    if (typeOrKb === 'urls') {
      this.presentModalAddURLs()
    }

    if (typeOrKb === 'site-map') {
      this.presentModalImportSitemap()
    }
    if (typeOrKb === 'file-upload') {
      this.presentModalUploadFile()
    }
    if (typeOrKb === 'faq') {
      this.presentModalAddFaqs()
    }
  }

  presentModalAddContent() {
    const dialogRef = this.dialog.open(ModalTextFileComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '600px',
    });
    dialogRef.afterClosed().subscribe(body => {
      this.logger.log('[Modal Add content] Dialog body: ', body);
      if (body) {
        this.onAddKb(body)
      }
    });

  }

  presentModalAddFaqs() {
    const dialogRef = this.dialog.open(ModalFaqsComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '600px',
      data: {
        selectedNamespace: this.selectedNamespace,
      },
    });
    this.logger.log('[KNOWLEDGE BASES COMP] presentModalAddFaqs ')

    dialogRef.afterClosed().subscribe(result => {
      this.logger.log('[Modal Add FAQs] Dialog result (afterClosed): ', result);
      if (result && result.isSingle === "true") {
        if (result.body) {
          this.onAddKb(result.body)
        }
      } else if (result && result.isSingle === "false") {
        let paramsDefault = this.facade.buildKbListParams({ namespace: this.selectedNamespace.id });
        this.getListOfKb(paramsDefault, 'add-multi-faq')
      }
    });
  }

  presentModalAddURLs() {
    const dialogRef = this.dialog.open(ModalUrlsKnowledgeBaseComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '600px',
      autoFocus: false,
      data: {
        isAvailableRefreshRateFeature: this.isAvailableRefreshRateFeature,
        refreshRateIsEnabled: this.refreshRateIsEnabled,
        t_params: this.t_params,
        id_project: this.id_project,
        project_name: this.project_name,
        payIsVisible: this.payIsVisible
      },
    });
    dialogRef.afterClosed().subscribe(body => {
      this.logger.log('[Modal Add URLS AFTER CLOSED] Dialog body: ', body);
      if (body) {
        if (!body.hasOwnProperty('upgrade_plan')) {
          this.onAddMultiKb(body)
        } else {
          this.logger.log('Property "upgrade_plan" exist');
          this.goToPricing()
        }
      } else {
        this.logger.log(body);
      }
    });

  }

  presentModalImportSitemap() {
    const dialogRef = this.dialog.open(ModalSiteMapComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '600px',
      autoFocus: false,
      data: {
        isAvailableRefreshRateFeature: this.isAvailableRefreshRateFeature,
        refreshRateIsEnabled: this.refreshRateIsEnabled,
        t_params: this.t_params,
        id_project: this.id_project,
        project_name: this.project_name,
        payIsVisible: this.payIsVisible,
        selectedNamespace: this.selectedNamespace
      },
    });
    dialogRef.afterClosed().subscribe(body => {
      this.logger.log('[Modal IMPORT SITEMAP AFTER CLOSED]  body: ', body);
      if (body) {
        if (!body.hasOwnProperty('upgrade_plan')) {
          this.importSitemap(body)
        } else {
          this.logger.log('Property "upgrade_plan" exist');
          this.goToPricing()
        }
      } else {
        this.logger.log(body);
      }

    });
  }

  presentModalUploadFile() {
    this.logger.log('[KNOWLEDGE BASES COMP] PRESENT MODAL UPLOAD FILE ')
    const dialogRef = this.dialog.open(ModalUploadFileComponent, {
      autoFocus: false,
      width: '400px'
    })
    dialogRef.afterClosed().subscribe(body => {
      this.logger.log(`[KNOWLEDGE-BASES-COMP]  AFTER CLOSED MODAL UPLOAD FILE body:`, body);

      if (body) {
        this.onAddKb(body)
      }
    });

  }

  goToPricing() {
    if (this.payIsVisible) {
      if (this.USER_ROLE === 'owner') {
        if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {
          if (this.profile_name === PLAN_NAME.C) {
            this.logger.log('[KNOWLEDGE-BASES-COMP] goToPricing HERE 1 ')
            this.notify.displayEnterprisePlanHasExpiredModal(true, PLAN_NAME.C + ' plan', this.subscription_end_date);

          } else if (this.profile_name === PLAN_NAME.F) {
            this.notify.displayEnterprisePlanHasExpiredModal(true, PLAN_NAME.F + ' plan', this.subscription_end_date);
            this.logger.log('[KNOWLEDGE-BASES-COMP] goToPricing HERE 2 ')
          } else if (this.profile_name !== PLAN_NAME.C && this.profile_name !== PLAN_NAME.F) {
            this.notify.displaySubscripionHasExpiredModal(true, this.profile_name, this.subscription_end_date);
            this.logger.log('[KNOWLEDGE-BASES-COMP] goToPricing HERE 3 ')
          }
        } else if (this.prjct_profile_type === 'free') {
          this.router.navigate(['project/' + this.id_project + '/pricing']);
        } else if (
          this.profile_name === PLAN_NAME.A ||
          this.profile_name === PLAN_NAME.B ||
          this.profile_name === PLAN_NAME.D ||
          this.profile_name === PLAN_NAME.E ||
          this.profile_name === PLAN_NAME.EE

        ) {
          this.logger.log('[KNOWLEDGE-BASES-COMP] goToPricing HERE 4 ')
          this.notify._displayContactUsModal(true, 'upgrade_plan');
        }
      } else {
        this.presentModalOnlyOwnerCanManageTheAccountPlan();
        this.logger.log('[KNOWLEDGE-BASES-COMP] goToPricing HERE 5 ')
      }
    } else {
      this.notify._displayContactUsModal(true, 'upgrade_plan');
      this.logger.log('[KNOWLEDGE-BASES-COMP] goToPricing HERE 6 ')
    }
  }

  getProjectUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user_role) => {
        this.logger.log('[PRJCT-EDIT-ADD] - USER ROLE ', user_role);
        if (user_role) {
          this.USER_ROLE = user_role

        }
      });
  }


 
  getFaqKbByProjectId() {
    this.faqKbService.getFaqKbByProjectId().subscribe((faqKb: any) => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] - GET BOTS BY PROJECT ID', faqKb);
      if (faqKb) {
        // Used to enforce chat-bot quota/limits in createChatbotfromKbOfficialResponderTemplate()
        this.myChatbotOtherCount = faqKb.length;
      }
    }, (error) => {
      this.logger.error('[KNOWLEDGE-BASES-COMP] GET BOTS ERROR ', error);

    }, () => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] GET BOTS COMPLETE');
      // FOR ANY FAQ-KB ID GET THE FAQ ASSOCIATED
    });

  }

  getOSCODE() {
    this.pineconeReranking = this.appConfigService.getConfig().pineconeReranking;
    let public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;

    let keys = public_Key.split("-");

    keys.forEach(key => {
      if (key.includes("PAY")) {
        let pay = key.split(":");
        if (pay[1] === "F") {
          this.payIsVisible = false;
        } else {
          this.payIsVisible = true;
        }
      }
    })
  }



  getTranslations() {
    this.translate.get('KbPage')
      .subscribe((KbPage: any) => {
        this.msgSuccesUpdateKb = KbPage['msgSuccesUpdateKb'];
        this.msgSuccesAddKb = KbPage['msgSuccesAddKb'];
        this.msgSuccesDeleteKb = KbPage['msgSuccesDeleteKb'];
        this.msgErrorDeleteKb = KbPage['msgErrorDeleteKb'];
        this.msgErrorIndexingKb = KbPage['msgErrorIndexingKb'];
        this.msgSuccesIndexingKb = KbPage['msgSuccesIndexingKb'];
        this.msgErrorAddUpdateKb = KbPage['msgErrorAddUpdateKb'];
        this.msgNamespaceHasBeenSuccessfullyUpdated = KbPage['TheNamespaceHasBeenSuccessfullyUpdated'];
      });

    this.translate.get('Warning')
      .subscribe((text: string) => {
        this.warningTitle = text;
      });

    this.translate.get('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan')
      .subscribe((translation: any) => {

        this.onlyOwnerCanManageTheAccountPlanMsg = translation;
      });

    this.translate.get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {
        this.learnMoreAboutDefaultRoles = translation;
      });


    this.translate.get('AnErrorOccurredWhileUpdating')
      .subscribe((translation: any) => {
        this.anErrorOccurredWhileUpdating = translation;
      });

    this.translate.get('Pricing.ContactUsViaEmailToUpgradeYourPricingPlan')
      .subscribe((translation: any) => {
        this.contactUsToUpgrade = translation;
      });

    this.translate.get('ContactUs')
      .subscribe((translation: any) => {
        this.contactUs = translation;
      });

    this.translate.get('Upgrade')
      .subscribe((translation: any) => {
        this.upgrade = translation;
      });

    this.translate.get('Cancel')
      .subscribe((translation: any) => {
        this.cancel = translation;
      });

  }

  getTranslatedStringKbLimitReached(max_num) {
    this.translate.get('KbPage.msgErrorAddUpdateKbLimit', { max_number: max_num })
      .subscribe((text: string) => { this.msgErrorAddUpdateKbLimit = text; });
  }



  // getRouteParams removed (handled by facade subscriptions)

  trackPage() {
    if (!isDevMode()) {
      if (window['analytics']) {
        try {
          window['analytics'].page("Knowledge Bases Page", {
          });
        } catch (err) {
        }
      }
    }
  }

  // getLoggedUser/getBrowserVersion/listenSidebarIsOpened removed (not used in knowledge-bases2 template)


  // ---------------- SERVICE FUNCTIONS --------------- // 


  onLoadPage(searchParams?: any, calledby?: string) {
    console.log('[KNOWLEDGE-BASES-COMP] onLoadPage searchParams:', searchParams);
    let limitPage = Math.floor(this.kbsListCount / KB_DEFAULT_PARAMS.LIMIT);
    
    // Use page from searchParams if provided, otherwise increment numberPage
    if (searchParams && searchParams.page !== undefined) {
      this.numberPage = searchParams.page;
    } else {
      this.numberPage++;
    }
    
    console.log('[KNOWLEDGE-BASES-COMP] onLoadNextPage searchParams > search:', searchParams?.search);
    if (this.numberPage > limitPage) {
      this.numberPage = limitPage;
    }

    const params = this.facade.buildKbListParams({
      namespace: this.selectedNamespace.id,
      page: this.numberPage,
      status: searchParams?.status,
      type: searchParams?.type,
      search: searchParams?.search,
      sortField: searchParams?.sortField,
      // legacy direction can be numeric; facade builder normalizes
      direction: searchParams?.direction,
    } as any);

    this.logger.log('[KNOWLEDGE-BASES-COMP] onLoadPage params:', params, 'searchParams', searchParams);
    // Show table spinner only for initial load or refresh (page 0 or empty list), not for load more
    const isLoadMore = searchParams && searchParams.page !== undefined && searchParams.page > 0 && this.kbsList.length > 0;
    if (!isLoadMore) {
      this.ui.showKbTableSpinner = true;
    }
    this.getListOfKb(params, calledby || 'onLoadPage');
  }

  onLoadByFilter(searchParams, calledby?: string) {
    // Store last used search params so we can re-apply them after an update
    this.lastKbSearchParams = { ...searchParams };
    // Update current sort params to sync with table component
    // Always ensure sortField and direction are set
    // Always create a new object to force change detection
    let sortField, direction;
    if (searchParams.sortField && searchParams.direction !== undefined) {
      sortField = searchParams.sortField;
      direction = searchParams.direction;
    } else {
      // If not provided in searchParams, use last known or defaults
      sortField = searchParams.sortField || this.lastKbSearchParams?.sortField || this.facade.getDefaultKbListSortField();
      direction =
        searchParams.direction !== undefined
          ? searchParams.direction
          : this.lastKbSearchParams?.direction !== undefined
            ? this.lastKbSearchParams.direction
            : this.facade.getDefaultKbListDirection();
      // Also update searchParams to ensure they are passed to onLoadPage
      searchParams.sortField = sortField;
      searchParams.direction = direction;
    }
    // Always create a new object to force Angular change detection
    this.currentSortParams = {
      sortField: sortField,
      direction: direction,
      timestamp: Date.now() // Add timestamp to force change detection
    };
    this.numberPage = -1;
    this.kbsList = [];
    // Show table spinner for table operations
    this.ui.showKbTableSpinner = true;
    this.onLoadPage(searchParams, calledby);
  }


  getListOfKb(params?: any, calledby?: any) {
    console.log("[KNOWLEDGE BASES COMP] GET LIST OF KB calledby", calledby);
    console.log("[KNOWLEDGE BASES COMP] GET LIST OF KB params", params);

    this.logger.log("[KNOWLEDGE BASES COMP] getListOfKb params", params);
    this.facade
      .fetchKbList(params, calledby, this.kbsList)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        ({ list, count }) => {
          this.kbsList = list;
          this.kbsListCount = count;
          this.getKbCompleted = true;
          this.refreshKbsList = !this.refreshKbsList;
        },
        (error) => {
          this.logger.error("[KNOWLEDGE BASES COMP] ERROR GET KB LIST: ", error);
          this.ui.showSpinner = false;
          this.ui.showKbTableSpinner = false;
          this.getKbCompleted = false;
        },
        () => {
          this.logger.log("[KNOWLEDGE BASES COMP] GET KB LIST *COMPLETE*");
          this.ui.showSpinner = false;
          this.ui.showKbTableSpinner = false;
        }
      );
  }



  onSendSitemap(body) {
    let error = this.msgErrorAddUpdateKb;
    this.kbService.addSitemap(body).subscribe((resp: any) => {
      this.logger.log("[KNOWLEDGE-BASES-COMP] onSendSitemap:", resp);
      if (resp.errors && resp.errors[0]) {
        Swal.fire({
          title: this.warningTitle,
          text: error,
          icon: "warning",
          showCloseButton: false,
          showCancelButton: false,
          // confirmButtonColor: "var(--primary-btn-background)",
          confirmButtonText: this.translate.instant('Ok'),

        })
      } else {
        this.listSitesOfSitemap = resp.sites;

        const event = new CustomEvent("on-send-sitemap-site-list", { detail: this.listSitesOfSitemap });
        document.dispatchEvent(event);
      }

    }, (err) => {
      this.logger.error("[KNOWLEDGE-BASES-COMP] ERROR send sitemap: ", err);

      Swal.fire({
        title: this.warningTitle,
        text: error,
        icon: "warning",
        showCloseButton: false,
        showCancelButton: false,
        // confirmButtonColor: "var(--primary-btn-background)",
        confirmButtonText: this.translate.instant('Ok'),

      })

    }, () => {
      this.logger.log("[KNOWLEDGE-BASES-COMP] send sitemap * COMPLETED *");
    })
  }

  /**
   * onAddKb
   */
  onAddKb(body, doneCb?: (success: boolean) => void) {
    this.logger.log('onAddKb this.kbLimit ', this.kbLimit)
    body.namespace = this.selectedNamespace.id
    this.logger.log("onAddKb body:", body);
    let error = this.msgErrorAddUpdateKb;
    this.kbService.addKb(body).subscribe((resp: any) => {
      this.logger.log("onAddKb:", resp);
      let kb = resp.value;
      if (resp.lastErrorObject && resp.lastErrorObject.updatedExisting === true) {
        const index = this.kbsList.findIndex(item => item._id === kb._id);
        if (index !== -1) {
          this.kbsList[index] = kb;
          this.notify.showWidgetStyleUpdateNotification(this.msgSuccesUpdateKb, 3, 'warning');
        }
      } else {
        this.notify.showWidgetStyleUpdateNotification(this.msgSuccesAddKb, 2, 'done');
        // Don't modify kbsList here - it will be reloaded from server
        
        // After adding a new content, reload the list with descending order by updatedAt
        // to show the newly added content at the top, regardless of current sorting
        setTimeout(() => {
          const refreshParams = {
            sortField: 'updatedAt',
            direction: -1, // descending order (most recent first)
            page: 0,
            status: this.lastKbSearchParams?.status || '',
            search: this.lastKbSearchParams?.search || '',
            type: this.lastKbSearchParams?.type || ''
          };
          this.onLoadByFilter(refreshParams, 'after-add');
        }, 300);
      }
      this.updateStatusOfKb(kb._id, -1);
      if (doneCb) doneCb(true);
    }, (err) => {
      this.logger.error("[KNOWLEDGE-BASES-COMP] ERROR add new kb: ", err);
      if (err.error && err.error.plan_limit) {
        this.getTranslatedStringKbLimitReached(err.error.plan_limit);
        error = this.msgErrorAddUpdateKbLimit
      }

      if (this.payIsVisible === true) {
        Swal.fire({
          title: this.warningTitle,
          text: error,
          icon: "warning",
          showCloseButton: false,
          showCancelButton: true,
          confirmButtonText: this.upgrade,
          cancelButtonText: this.cancel,
          // confirmButtonColor: "var(--blue-light)",
          reverseButtons: true,
        }).then((result: any) => {

          if (result.isConfirmed) {
            if (this.USER_ROLE === 'owner') {
              if (this.prjct_profile_type === 'free') {
                this.router.navigate(['project/' + this.id_project + '/pricing']);
              } else {
                this.notify._displayContactUsModal(true, 'upgrade_plan');
              }
            } else {
              this.presentModalOnlyOwnerCanManageTheAccountPlan();
            }

          }
        })
      } else if (this.payIsVisible === false && this.kbLimit != Number(0)) {
        this.logger.log('here 1 this.kbLimit ', this.kbLimit, 'error ', error)
        Swal.fire({
          title: this.warningTitle,
          text: error,
          icon: "warning",
          showCloseButton: false,
          showCancelButton: true,
          confirmButtonText: this.contactUs,
          cancelButtonText: this.cancel,
          // confirmButtonColor: "var(--blue-light)",
          focusConfirm: false,
          reverseButtons: true,
        }).then((result) => {
          if (result) {
            window.open(`mailto:${this.salesEmail}?subject=Upgrade plan`);
          }
        })
      } else if (this.payIsVisible === false && this.kbLimit == Number(0)) {
        this.logger.log('here 2 this.kbLimit ', this.kbLimit, 'error ', error)
        Swal.fire({
          title: this.warningTitle,
          text: error + '. ' + this.contactUsToUpgrade,
          icon: "warning",
          showCloseButton: false,
          showCancelButton: true,
          confirmButtonText: this.contactUs,
          cancelButtonText: this.cancel,
          // confirmButtonColor: "var(--blue-light)",
          focusConfirm: false,
          reverseButtons: true,
        }).then((result) => {
          if (result) {
            window.open(`mailto:${this.salesEmail}?subject=Upgrade plan`);
          }
        })
      }
      if (doneCb) doneCb(false);
    }, () => {
      this.logger.log("[KNOWLEDGE-BASES-COMP] add new kb *COMPLETED*");
      this.getAllNamespaces();
      this.trackUserActioOnKB('Added Knowledge Base')
    })
  }



  presentModalOnlyOwnerCanManageTheAccountPlan() {
    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageTheAccountPlanMsg, this.learnMoreAboutDefaultRoles)
  }

  importSitemap(body) {
   this.logger.log('[KNOWLEDGE-BASES-COMP] importSitemap body', body)

    let error = this.msgErrorAddUpdateKb;
    this.logger.log('[KNOWLEDGE-BASES-COMP] importSitemap error', error)

    this.kbService.importSitemap(body, this.selectedNamespace['id']).subscribe((kbs: any) => {

     this.logger.log("[KNOWLEDGE-BASES-COMP] importSitemap RESP: ", kbs);

      this.notify.showWidgetStyleUpdateNotification(this.msgSuccesAddKb, 2, 'done');

      let paramsDefault = this.facade.buildKbListParams({ namespace: this.selectedNamespace.id });
      this.getListOfKb(paramsDefault, 'onAddMultiKb');

      this.kbsListCount = this.kbsListCount + kbs.length;
      this.refreshKbsList = !this.refreshKbsList;

    }, (err) => { 
      this.logger.error("[KNOWLEDGE-BASES-COMP] importSitemap ERROR: ", err);
      if (err.error && err.error.plan_limit) {
        this.getTranslatedStringKbLimitReached(err.error.plan_limit);
        error = this.msgErrorAddUpdateKbLimit
      }

        if (this.payIsVisible === true) {
        Swal.fire({
          title: this.warningTitle,
          text: error,
          icon: "warning",
          showCloseButton: false,
          showCancelButton: true,
          confirmButtonText: this.upgrade,
          cancelButtonText: this.cancel,
          focusConfirm: false,
        }).then((result: any) => {

          if (result.isConfirmed) {
            if (this.USER_ROLE === 'owner') {
              if (this.prjct_profile_type === 'free') {
                this.router.navigate(['project/' + this.id_project + '/pricing']);
              } else {
                this.notify._displayContactUsModal(true, 'upgrade_plan');
              }
            } else {
              this.presentModalOnlyOwnerCanManageTheAccountPlan();
            }
          }
        })
      } else if (this.payIsVisible === false && this.kbLimit != Number(0)) {
        Swal.fire({
          title: this.warningTitle,
          text: error,
          icon: "warning",
          showCloseButton: false,
          showCancelButton: false,
          confirmButtonText: this.cancel,
          // confirmButtonColor: "var(--blue-light)",
          focusConfirm: false
        })
      } else if (this.payIsVisible === false && this.kbLimit == Number(0)) {
        Swal.fire({
          title: this.warningTitle,
          text: error + '. ' + this.contactUsToUpgrade,
          icon: "warning",
          showCloseButton: false,
          showCancelButton: true,
          confirmButtonText: this.contactUs,
          // confirmButtonColor: "var(--blue-light)",
          canecelButtonText: this.cancel,
          focusConfirm: false,
        }).then((result) => {
          if (result.isConfirmed) {
            window.open(`mailto:${this.salesEmail}?subject=Upgrade plan`);
          }
        })
      }

    }, () => {

      this.logger.log("[KNOWLEDGE-BASES-COMP] importSitemap *COMPLETE*");
      this.getAllNamespaces()
    })
  }


  onAddMultiKb(body) {
    this.logger.log('onAddMultiKb body', body)
    let error = this.msgErrorAddUpdateKb;
    this.kbService.addMultiKb(body, this.selectedNamespace.id).subscribe((kbs: any) => {
      this.logger.log("onAddMultiKb:", kbs);
      this.notify.showWidgetStyleUpdateNotification(this.msgSuccesAddKb, 2, 'done');

      let paramsDefault = this.facade.buildKbListParams({ namespace: this.selectedNamespace.id });
      this.getListOfKb(paramsDefault, 'onAddMultiKb');

      this.kbsListCount = this.kbsListCount + kbs.length;
      this.refreshKbsList = !this.refreshKbsList;
    }, (err) => {
      this.logger.error("[KNOWLEDGE-BASES-COMP] ERROR add new kb: ", err);

      if (err.error && err.error.plan_limit) {
        this.getTranslatedStringKbLimitReached(err.error.plan_limit);
        error = this.msgErrorAddUpdateKbLimit
      }

      if (this.payIsVisible === true) {
        Swal.fire({
          title: this.warningTitle,
          text: error,
          icon: "warning",
          showCloseButton: false,
          showCancelButton: true,
          confirmButtonText: this.upgrade,
          cancelButtonText: this.cancel,
          // confirmButtonColor: "var(--blue-light)",
          focusConfirm: false,
        }).then((result: any) => {

          if (result.isConfirmed) {
            if (this.USER_ROLE === 'owner') {
              if (this.prjct_profile_type === 'free') {
                this.router.navigate(['project/' + this.id_project + '/pricing']);
              } else {
                this.notify._displayContactUsModal(true, 'upgrade_plan');
              }
            } else {
              this.presentModalOnlyOwnerCanManageTheAccountPlan();
            }
          }
        })
      } else if (this.payIsVisible === false && this.kbLimit != Number(0)) {
        Swal.fire({
          title: this.warningTitle,
          text: error,
          icon: "warning",
          showCloseButton: false,
          showCancelButton: false,
          confirmButtonText: this.cancel,
          focusConfirm: false
        })
      } else if (this.payIsVisible === false && this.kbLimit == Number(0)) {
        Swal.fire({
          title: this.warningTitle,
          text: error + '. ' + this.contactUsToUpgrade,
          icon: "warning",
          showCloseButton: false,
          showCancelButton: true,
          confirmButtonText: this.contactUs,
          canecelButtonText: this.cancel,
          focusConfirm: false,
        }).then((result) => {
          if (result.isConfirmed) {
            window.open(`mailto:${this.salesEmail}?subject=Upgrade plan`);
          }
        })
      }

    }, () => {
      this.logger.log("[KNOWLEDGE-BASES-COMP] add new kb *COMPLETED*");
      this.trackUserActioOnKB('Added Knowledge Base')
      this.getAllNamespaces()
    })
  }


  /**
   * onDeleteKb
   */
  onDeleteKb(kb) {
    let data = {
      "id": kb._id,
      "namespace": kb.namespace
    }
    let error = this.msgErrorDeleteKb; //"Non è stato possibile eliminare il kb";
    this.kbService.deleteKb(data).subscribe((response: any) => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] onDeleteKb response :: ', response);
      kb.deleting = false;
      if (!response || (response.success && response.success === false)) {
        Swal.fire({
          title: this.warningTitle,
          text: error,
          showCloseButton: false,
          showCancelButton: true,
          showConfirmButton: false,
          cancelButtonText: this.cancel,
          focusConfirm: false,
        })



      } else {
        this.notify.showWidgetStyleUpdateNotification(this.msgSuccesDeleteKb, 2, 'done');
        this.removeKb(kb._id);
        this.kbsListCount = this.kbsListCount - 1;
        this.refreshKbsList = !this.refreshKbsList;
        this.hasRemovedKb = true;
      }
    }, (err) => {
      this.logger.error("[KNOWLEDGE-BASES-COMP] ERROR delete kb: ", err);
      kb.deleting = false;
      Swal.fire({
        title: this.warningTitle,
        text: error,
        showCloseButton: false,
        showCancelButton: true,
        showConfirmButton: false,
        cancelButtonText: this.cancel,
        focusConfirm: false,
      })

    }, () => {
      this.logger.log("[KNOWLEDGE-BASES-COMP] delete kb *COMPLETE*");
      this.getAllNamespaces();
      this.trackUserActioOnKB('Deleted Knowledge Base')
    })
  }

  onDeleteNamespace(removeAlsoNamespace, namespaceIndex) {
    this.logger.log("[KNOWLEDGE-BASES-COMP] onDeleteNamespace removeAlsoNamespace " + removeAlsoNamespace);
    this.logger.log("[KNOWLEDGE-BASES-COMP] onDeleteNamespace namespaceIndex " + namespaceIndex);
    this.logger.log("[KNOWLEDGE-BASES-COMP] onDeleteNamespace ID " + this.selectedNamespace.id);
    this.ui.showSpinner = true;

    const namespaceId = this.selectedNamespace?.id;
    const namespaceName = this.selectedNamespace?.name;

    // New required behavior: cleanup linked resources before deleting the KB (best effort).
    this.kbLinkedResources.cleanupOnDelete({ namespaceId, namespaceName }).subscribe({
      next: () => {},
      error: (err) => {
        this.logger.error('[KNOWLEDGE-BASES-COMP] - KB LINKED RESOURCES cleanupOnDelete ERROR', err);
        // Continue deletion to avoid blocking the user, but show a warning.
        this.notify.showWidgetStyleUpdateNotification(
          this.translate.instant('AnErrorOccurredWhileUpdating'),
          4,
          'report_problem'
        );
      },
      complete: () => {
        this.kbService.deleteNamespace(this.selectedNamespace.id, removeAlsoNamespace).subscribe(
          (response: any) => {
            this.logger.log('[KNOWLEDGE-BASES-COMP] onDeleteNamespace response: ', response);
            this.ui.showSpinner = false;
          },
          (error) => {
            this.logger.error('[KNOWLEDGE-BASES-COMP] onDeleteNamespace ERROR ', error);
            this.ui.showSpinner = false;
          },
          () => {
            this.logger.log('[KNOWLEDGE-BASES-COMP] onDeleteNamespace COMPLETE ');
            this.ui.showSpinner = false;
            if (removeAlsoNamespace) {
              this.localDbService.removeFromStorage(`last_kbnamespace-${this.id_project}`);

              this.namespaces.splice(namespaceIndex, 1);
              this.logger.log('[KNOWLEDGE-BASES-COMP] onDeleteNamespace namespaces after splice', this.namespaces);

              this.selectedNamespace = this.namespaces.find((el) => el.default === true);
              this.router.navigate(['project/' + this.project._id + '/' + this.kb2BaseSegment() + '/' + this.selectedNamespace.id]);

              let paramsDefault = this.facade.buildKbListParams({ namespace: this.selectedNamespace.id });
              this.getListOfKb(paramsDefault, 'deleteNamespace');
              this.logger.log('[KNOWLEDGE-BASES-COMP] onDeleteNamespace this.selectedNamespace', this.selectedNamespace);
            } else {
              let paramsDefault = this.facade.buildKbListParams({ namespace: this.selectedNamespace.id });
              this.getListOfKb(paramsDefault, 'deleteNamespace');
              this.getAllNamespaces();
            }
          },
        );
      },
    });

  }


  // ---------------- END SERVICE FUNCTIONS --------------- // 


  // ---------------- OPEN AI FUNCTIONS --------------- //

  checkStatusWithRetry(kb) {
    this.logger.log('[KNOWLEDGE BASES COMP] checkStatusWithRetry selectedNamespace id', this.selectedNamespace.id)

    let data = {
      "namespace_list": [],
      // "namespace": this.id_project,
      "namespace": this.selectedNamespace.id,
      "id": kb._id
    }
    var status_msg = "Indexing completed successfully!";
    var status_code = 2;
    var status_label = "done"
    this.openaiService.checkScrapingStatus(data).subscribe((response: any) => {
      let resource_status: Number;
      if (response.status) {
        resource_status = response.status;
      } else {
        resource_status = response.status_code
      }

      if (response.status == -1) {
        status_msg = "Indexing not yet started";
        status_code = 3;
        status_label = "warning";
      } else if (response.status == 100 || response.status == 200) {
        status_msg = "Indexing in progress";
        status_code = 3;
        status_label = "warning";
      } else if (response.status = 300) {
        // default message already seat
      } else if (response.status == 400) {
        status_code = 4;
        status_label = "dangerous";
        status_msg = "The resource could not be indexed";
      } else {
        this.logger.log("Unrecognized status")
      }

      if (response.status_code == -1 || response.status_code == 0 || response.status_code == 2) {
        status_msg = "Indexing in progress: " + response.status_code;
        status_code = 3;
        status_label = "warning";
      } else if (response.status_code == 4) { // status == 3 || status == 4
        status_code = 4;
        status_label = "dangerous";
        status_msg = "The resource could not be indexed " + response.status_code;
      } else {
        //status_msg = "Indicizzazione in corso stato: "+response.status_code;
      }

      this.updateStatusOfKb(kb._id, resource_status);
      this.notify.showWidgetStyleUpdateNotification(status_msg, status_code, status_label);
    },
      error => {
        this.logger.error('Error: ', error);
        //-->this.updateStatusOfKb(kb._id, -2);
        status_code = 4;
        status_label = "dangerous";
        status_msg = "Error: " + error.message;
        this.notify.showWidgetStyleUpdateNotification(status_msg, status_code, status_label);
      });
  }

  /**
   * updateStatusOfKb
   */
  private updateStatusOfKb(kb_id, status_code) {
    let kb = this.kbsList.find(item => item._id === kb_id);
    if (kb) kb.status = status_code;
  }

  private removeKb(kb_id) {
    this.kbsList = this.kbsList.filter(item => item._id !== kb_id);
    this.refreshKbsList = !this.refreshKbsList;
  }


  /**
   * onCheckStatus
   */
  onCheckStatus(kb) {
    this.checkStatusWithRetry(kb);
  }

  /**
   * runIndexing
   */
  onRunIndexing(kb) {
    let data = {
      "id": kb._id,
      "source": kb.source,
      "type": kb.type,
      "content": kb.content ? kb.content : '',
      "namespace": this.selectedNamespace.id
    }

    this.updateStatusOfKb(kb._id, 100);

    this.openaiService.startScraping(data).subscribe((response: any) => {
      this.logger.log("start scraping response: ", response);
      if (response.error) {
        this.notify.showWidgetStyleUpdateNotification(this.msgErrorIndexingKb, 4, 'report_problem');
      } else {
        this.notify.showWidgetStyleUpdateNotification(this.msgSuccesIndexingKb, 2, 'done');
      }
    }, (error) => {
      this.logger.error("error start scraping response: ", error);
    }, () => {
      this.logger.log("start scraping *COMPLETE*");
    })
  }


  // ---------------- END OPEN AI FUNCTIONS --------------- //

  createConditionGroupUrl(): FormGroup {
    const namePattern = /^[^&<>]{3,}$/;
    return this.formBuilder.group({
      url: ['', [Validators.required, Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')]],
      name: ['', [Validators.required, Validators.pattern(namePattern)]]
    })
  }

  createConditionGroupContent(): FormGroup {
    const contentPattern = /^[^&<>]{3,}$/;
    const namePattern = /^[^&<>]{3,}$/;
    return this.formBuilder.group({
      content: ['', [Validators.required, Validators.pattern(contentPattern)]],
      name: ['', [Validators.required, Validators.pattern(namePattern)]]
    })
  }

  trackUserActioOnKB(event: any) {
    if (!isDevMode()) {
      if (window['analytics']) {
        let userFullname = ''
        if (this.CURRENT_USER.firstname && this.CURRENT_USER.lastname) {
          userFullname = this.CURRENT_USER.firstname + ' ' + this.CURRENT_USER.lastname
        } else if (this.CURRENT_USER.firstname && !this.CURRENT_USER.lastname) {
          userFullname = this.CURRENT_USER.firstname
        }
        try {
          window['analytics'].identify(this.CURRENT_USER._id, {
            name: userFullname,
            email: this.CURRENT_USER.email,
            plan: this.profile_name

          });
        } catch (err) {
        }
        try {
          window['analytics'].track(event, {
            "type": "organic",
            "username": userFullname,
            "email": this.CURRENT_USER.email,
            'userId': this.CURRENT_USER._id,
            'page': this.callingPage

          }, {
            "context": {
              "groupId": this.id_project
            }
          });
        } catch (err) {
        }
        try {
          window['analytics'].group(this.id_project, {
            name: this.project_name,
            plan: this.profile_name + ' plan',
          });
        } catch (err) {
        }
      }
    }
  }

  



  // ************** DELETE **************** //
  onDeleteKnowledgeBase(kb) {
    this.onDeleteKb(kb);
  }



  presentModalDefautNamespaceCannotBeDeleted() {
    Swal.fire({
      title: this.translate.instant("Warning"),
      text: this.translate.instant('KbPage.TheDefaultNamespaceCannotBeDeleted'),
      icon: "warning",
      showCloseButton: false,
      showCancelButton: false,
      confirmButtonText: 'Ok',
      // confirmButtonColor: "var(--blue-light)",
      focusConfirm: false,
      // reverseButtons: true,
    })
  }


  // ************** PREVIEW **************** //









  // ************** CLOSE ALL MODAL **************** //
  onCloseBaseModal() {
    this.listSitesOfSitemap = [];
    this.baseModalDelete = false;
    this.baseModalPreview = false;
    this.baseModalPreviewSettings = false;
    this.baseModalError = false;
    this.baseModalDetail = false;
    this.typeKnowledgeBaseModal = '';
  }

  goToKbDoc() {
    const url = URL_kb;
    window.open(url, '_blank');
  }

  onAddFaqFromUnanswered(event: {q: any, done: (success: boolean) => void}) {
    // Apre la modale FAQ con la domanda precompilata
    const question = event.q?.question;
    this.logger.log('[KNOWLEDGE BASES COMP] AddFaqsevent', event);
    const dialogRef = this.dialog.open(ModalFaqsComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '600px',
      data: {
        selectedNamespace: this.selectedNamespace,
        prefillKb: {
          name: question,
          content: '',
          type: 'faq',
          source: question,
          id_project: this.id_project,
          namespace: this.selectedNamespace?.name,
          _id: ''
        }
      },
    });
    this.logger.log('[KNOWLEDGE BASES COMP] presentModalAddFaqs from unanswered')
    dialogRef.afterClosed().subscribe(result => {
      this.logger.log('[Modal Add FAQs] Dialog result (afterClosed): ', result);
      // Se la modale è stata chiusa con successo (FAQ salvata)
      if (result && result.isSingle === "true" && result.body) {
        // Qui puoi anche attendere la risposta del servizio se serve
        this.unansweredQuestions = this.unansweredQuestions.filter(item => item['_id'] !== event.q['_id']);
        // Update count when question is removed
        if (this.unansweredQuestionsCount > 0) {
          this.unansweredQuestionsCount--;
        }
        this.onAddKb(result.body, event.done);
      } else {
        // Annullato o errore
        event.done(false);
      }
    });
  }

  loadUnansweredQuestions(page: number = 0, append: boolean = false) {
    if (!this.id_project || !this.selectedNamespace?.id) return;
    
    if (page === 0 && !append) {
      this.isLoadingUnanswered = true;
      this.ui.showUqTableSpinner = true;
      this.unansweredQuestionsPage = 0;
    } else {
      this.isLoadingMoreUnanswered = true;
    }
    
    this.unansweredQuestionsService.getUnansweredQuestions(
      this.id_project,
      this.selectedNamespace.id,
      KB_DEFAULT_PARAMS.LIMIT,
      page,
      'createdAt',
      -1
    )
      .subscribe(
        (res) => {
          const questions = res['questions'] || [];
          
          if (append) {
            // Append new questions to existing list
            this.unansweredQuestions = [...this.unansweredQuestions, ...questions];
          } else {
            // Replace list with new questions
            this.unansweredQuestions = questions;
          }
          
          // Update count if available in response
          if (res['total'] !== undefined) {
            this.unansweredQuestionsCount = res['total'];
          } else if (res['count'] !== undefined) {
            this.unansweredQuestionsCount = res['count'];
          } else {
            // Fallback: use length if no count provided
            this.unansweredQuestionsCount = this.unansweredQuestions.length;
          }
          
          // Calculate if there are more questions to load
          const loadedCount = this.unansweredQuestions.length;
          this.hasMoreUnansweredQuestions = loadedCount < this.unansweredQuestionsCount;
          
          this.isLoadingUnanswered = false;
          this.ui.showUqTableSpinner = false;
          this.isLoadingMoreUnanswered = false;
          this.unansweredQuestionsPage = page;
          
          this.logger.log('[KnowledgeBasesComponent] Loaded unanswered questions:', {
            page,
            loaded: questions.length,
            total: this.unansweredQuestions.length,
            count: this.unansweredQuestionsCount,
            hasMore: this.hasMoreUnansweredQuestions
          });
        },
        (err) => {
          this.isLoadingUnanswered = false;
          this.ui.showUqTableSpinner = false;
          this.isLoadingMoreUnanswered = false;
          if (!append) {
            this.unansweredQuestions = [];
          }
          this.logger.error('[KnowledgeBasesComponent] Error loading unanswered questions', err);
        }
      );
  }

  loadMoreUnansweredQuestions() {
    const nextPage = this.unansweredQuestionsPage + 1;
    this.loadUnansweredQuestions(nextPage, true);
  }

  refreshUnansweredQuestions() {
    this.unansweredQuestionsPage = 0;
    this.loadUnansweredQuestions(0, false);
  }

}
