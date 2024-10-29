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
import { takeUntil } from 'rxjs/operators';
import { FaqKbService } from 'app/services/faq-kb.service';
import { KB_DEFAULT_PARAMS, URL_kb, goToCDSSettings, goToCDSVersion } from 'app/utils/util';
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
import { ShepherdService } from 'angular-shepherd';
import { getSteps as defaultSteps, defaultStepOptions } from './knowledge-bases.tour.config';

import Step from 'shepherd.js/src/types/step';
import { ModalFaqsComponent } from './modals/modal-faqs/modal-faqs.component';
// import {
//   // provideHighlightOptions,
//   Highlight,
//   // HighlightAuto,
// } from 'ngx-highlightjs';
// // import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';
const swal = require('sweetalert');
const Swal = require('sweetalert2')


//import { Router } from '@angular/router';

@Component({
  selector: 'appdashboard-knowledge-bases',
  templateUrl: './knowledge-bases.component.html',
  styleUrls: ['./knowledge-bases.component.scss']
})
export class KnowledgeBasesComponent extends PricingBaseComponent implements OnInit, AfterViewInit, OnDestroy {

  public IS_OPEN_SETTINGS_SIDEBAR: boolean;
  public isChromeVerGreaterThan100: boolean;
  typeKnowledgeBaseModal: string;
  addKnowledgeBaseModal = 'none';
  previewKnowledgeBaseModal = 'none';
  deleteKnowledgeBaseModal = 'none';
  baseModalDelete: boolean = false;
  showDeleteNamespaceModal: boolean = false;
  baseModalPreview: boolean = false;
  baseModalPreviewSettings: boolean = false;
  baseModalError: boolean = false;
  baseModalDetail: boolean = false;

  secretsModal = 'none';
  missingGptkeyModal = 'none';
  showSpinner: boolean = true;
  buttonDisabled: boolean = true;
  addButtonDisabled: boolean = false;
  gptkeyVisible: boolean = false;
  //analytics
  // SHOW_TABLE: boolean = false;
  CURRENT_USER: any;
  CURRENT_USER_ID: string
  project: Project;
  project_name: string;
  id_project: string;
  profile_name: string;
  callingPage: string;
  errorMessage: string;

  kbFormUrl: FormGroup;
  kbFormContent: FormGroup;

  // kbs: any;
  kbsList: Array<any>;
  kbsListCount: number = 0;
  refreshKbsList: boolean = true;
  numberPage: number = 0;


  kbid_selected: any;
  interval_id;
  ARE_NEW_KB: boolean

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

  allTemplatesCount: number;
  allCommunityTemplatesCount: number;
  customerSatisfactionTemplatesCount: number;
  increaseSalesTemplatesCount: number;
  customerSatisfactionBotsCount: number;
  myChatbotOtherCount: number;
  increaseSalesBotsCount: number;
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


  selectedNamespace: any;
  hasChangedNameSpace: boolean = false;

  selectedNamespaceName: any;
  // selectedNamespaceID: string;
  // selectedNamespaceIsDefault: boolean = false;


  is0penDropDown: boolean = false
  namespaces: any; // [{ name: 'Namespaces_1', id: 111111, default: true }, { name: 'Namespaces_2', id: 222222, default: false }, { name: 'Namespaces_3', id: 333333, default: false }]

  namespaceIsEditable: boolean = false;
  newNamespaceName: string;
  namespaceNameOutputElWidth: any;
  namespaceValueOnFocus: string;
  newNamespaceNameIndex: number;
  msgNamespaceHasBeenSuccessfullyUpdated: string;
  hasRemovedKb: boolean = false
  hasUpdatedKb: boolean = false
  getKbCompleted: boolean = false;
  chatbotsUsingNamespace: any;
  botid: string;
  nameSpaceId: string;


  storageBucket: string;
  baseUrl: string;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;

  // Hook bot to dept
  dept_id: string;
  depts_length: any
  depts_without_bot_array = [];
  kbOfficialResponderTag = "kb-official-responder"

  public hoveredChatbot: any;
  private unsubscribe$: Subject<any> = new Subject<any>();
  hasAlreadyVisitedKb: string = 'false'

  private dialogRefHookBoot: MatDialogRef<any>;
  timer: number = 500;
  hasCickedAiSettingsModalBackdrop: boolean = false;
  public hideHelpLink: boolean;
  esportingKBChatBotTemplate: boolean = false;

  constructor(
    private auth: AuthService,
    private formBuilder: FormBuilder,
    private logger: LoggerService,
    private openaiService: OpenaiService,
    private kbService: KnowledgeBaseService,
    private projectService: ProjectService,
    private router: Router,
    public route: ActivatedRoute,
    //private router: Router,
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
    private shepherdService: ShepherdService,

  ) {
    super(prjctPlanService, notify);
    const brand = brandService.getBrand();
    this.salesEmail = brand['CONTACT_SALES_EMAIL'];
    this.hideHelpLink = brand['DOCS'];

  }

  ngOnInit(): void {
    this.kbsList = [];
    this.getBrowserVersion();
    this.getTranslations();
    this.listenSidebarIsOpened();

    // this.getListOfKb(this.paramsDefault);
    this.kbFormUrl = this.createConditionGroupUrl();
    this.kbFormContent = this.createConditionGroupContent();
    this.trackPage();
    this.getLoggedUser();
    this.getCurrentProject();
    this.getRouteParams();
    this.listenToKbVersion();
    this.getTemplates();
    this.getCommunityTemplates()
    this.getFaqKbByProjectId();
    this.getOSCODE();
    this.getProjectPlan();
    this.getProjectUserRole();
    this.listenToOnSenSitemapEvent();
    // this.getAllNamespaces()
    // this.getDeptsByProjectId()
    this.logger.log('[KNOWLEDGE-BASES-COMP] - HELLO !!!!', this.kbLimit);
    // this.openDialogHookBot(this.depts_Without_BotArray, this.chat_bot)

  }

  ngAfterViewInit() {
    // const tourShowed = this.localDbService.getFromStorage(`tour-shown-${this.id_project}`)

  }

  presentKBTour() {
    const tourShowed = this.localDbService.getFromStorage(`tour-shown-${this.CURRENT_USER_ID}`)
    this.logger.log('[KNOWLEDGE-BASES-COMP] tourShowed ', tourShowed)
    if (!tourShowed) {
      setTimeout(() => {
        const addButtonEl = <HTMLElement>document.querySelector('#kb-add-content');
        this.logger.log('[KNOWLEDGE-BASES-COMP] addButtonEl ', addButtonEl)
        if (addButtonEl) {
          this.shepherdService.defaultStepOptions = defaultStepOptions;
          this.shepherdService.modal = true;
          this.shepherdService.confirmCancel = false;
          const steps = defaultSteps(this.router, this.shepherdService, this.translate, this.brandService);
          if (!this.chatbotsUsingNamespace) {
            steps.splice(3, 1);
          } else {
            steps.splice(4, 1);
          }
          this.shepherdService.addSteps(steps as Array<Step.StepOptions>);
          this.shepherdService.start();

          // this.localDbService.setInStorage(`tour-shown-${this.id_project}`, 'true')
          this.localDbService.setInStorage(`tour-shown-${this.CURRENT_USER_ID}`, 'true')
        }
      }, this.timer);
    }
    // }
  }

  restartTour() {
    this.timer = 0
    // this.localDbService.removeFromStorage(`tour-shown-${this.id_project}`)
    this.localDbService.removeFromStorage(`tour-shown-${this.CURRENT_USER_ID}`)
    // this.ngAfterViewInit()
    this.presentKBTour()
    // this.shepherdService.start();
  }

  listenToOnSenSitemapEvent() {
    document.addEventListener(
      "on-send-sitemap", (e: CustomEvent) => {
        // this.logger.log("[KNOWLEDGE-BASES-COMP] on-send-sitemap :", e);

        // this.logger.log("[KNOWLEDGE-BASES-COMP] on-send-sitemap sitemap:", e.detail.sitemap);
        if (e.detail && e.detail) {
          let sitemap = e.detail.sitemap
          let body = { 'sitemap': sitemap }
          this.onSendSitemap(body)
        }
      }
    );
  }


  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project

      this.logger.log('[KNOWLEDGE-BASES-COMP] - GET CURRENT PROJECT ', this.project)
      if (this.project) {
        this.project_name = project.name;
        this.id_project = project._id;

        // const currentUrl = this.router.url;
        // this.logger.log('[KNOWLEDGE-BASES-COMP] - currentUrl ', currentUrl)
        // if (currentUrl.indexOf('/knowledge-bases') !== -1) {
        //   this.logger.log('[KNOWLEDGE-BASES-COMP] - is knowledge-bases route')
        //   const storedHasAlreadyVisitedKb = this.localDbService.getFromStorage(`has-visited-kb-${this.id_project}`)
        //   if (storedHasAlreadyVisitedKb) {
        //     this.hasAlreadyVisitedKb = 'true'
        //   }
        //   this.logger.log('[KNOWLEDGE-BASES-COMP] - hasAlreadyVisitedKb ', this.hasAlreadyVisitedKb)
        //   this.localDbService.setInStorage(`has-visited-kb-${this.id_project}`, 'true')

        //   this.getAllNamespaces()
        // }


        this.getProjectById(this.id_project)
        this.logger.log('[KNOWLEDGE-BASES-COMP] - GET CURRENT PROJECT - PROJECT-NAME ', this.project_name, ' PROJECT-ID ', this.id_project)
      }
    });
  }

  getProjectById(projectId) {
    this.projectService.getProjectById(projectId).subscribe((project: any) => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] - GET PROJECT BY ID - PROJECT: ', project);
      this.profile_name = project.profile.name
      this.logger.log('[KNOWLEDGE-BASES-COMP] - GET PROJECT BY ID - profile_name: ', this.profile_name);
    }, error => {
      this.logger.error('[KNOWLEDGE-BASES-COMP] - GET PROJECT BY ID - ERROR ', error);
    }, () => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] - GET PROJECT BY ID * COMPLETE * ');

      const currentUrl = this.router.url;
      this.logger.log('[KNOWLEDGE-BASES-COMP] - currentUrl ', currentUrl)
      if (currentUrl.indexOf('/knowledge-bases') !== -1) {
        this.logger.log('[KNOWLEDGE-BASES-COMP] - is knowledge-bases route')
        const storedHasAlreadyVisitedKb = this.localDbService.getFromStorage(`has-visited-kb-${this.id_project}`)
        if (storedHasAlreadyVisitedKb) {
          this.hasAlreadyVisitedKb = 'true'
        }
        this.logger.log('[KNOWLEDGE-BASES-COMP] - hasAlreadyVisitedKb ', this.hasAlreadyVisitedKb)
        this.localDbService.setInStorage(`has-visited-kb-${this.id_project}`, 'true')

        this.getAllNamespaces()
      }
    });
  }


  getAllNamespaces() {
    this.kbService.getAllNamespaces().subscribe((res: any) => {
      if (res) {
        this.kbCount = res.length
        this.logger.log('[KNOWLEDGE-BASES-COMP] - GET ALL NAMESPACES', res);
        this.namespaces = res
      }
    }, (error) => {
      this.logger.error('[KNOWLEDGE-BASES-COMP]  GET GET ALL NAMESPACES ERROR ', error);

    }, () => {
      this.logger.log('[KNOWLEDGE-BASES-COMP]  GET ALL NAMESPACES * COMPLETE *');
      if (this.namespaces) {
        this.selectLastUsedNamespaceAndGetKbList(this.namespaces);
      }
    });
  }

  isAlphaNumeric(str) {
    var code, i, len;

    for (i = 0, len = str.length; i < len; i++) {
      code = str.charCodeAt(i);
      if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123)) { // lower alpha (a-z)
        return false;
      }
    }
    return true;
  };

  selectLastUsedNamespaceAndGetKbList(namespaces) {
    const storedNamespace = this.localDbService.getFromStorage(`last_kbnamespace-${this.id_project}`)

    if (!storedNamespace) {
      this.logger.log('[KNOWLEDGE-BASES-COMP] selectLastUsedNamespace on init NOT EXIST storedNamespace', storedNamespace, ' RUN FILTER FOR DEFAULT')

      const currentUrl = this.router.url;

      // this.logger.log('[KNOWLEDGE-BASES-COMP] selectLastUsedNamespaceAndGetKbList currentUrl ', currentUrl)
      let currentUrlSegment = currentUrl.split('/');

      // this.logger.log('[KNOWLEDGE-BASES-COMP] selectLastUsedNamespaceAndGetKbList stringBeforeLastBackslash ', currentUrlSegment)
      currentUrlSegment.forEach(segment => {
        if (segment === 'knowledge-bases') {
          this.nameSpaceId = currentUrl.substring(currentUrl.lastIndexOf('/') + 1)
          // this.logger.log('[KNOWLEDGE-BASES-COMP] this.nameSpaceId' , this.nameSpaceId)
          let nameSpaceIdisAlphaNumeric = this.isAlphaNumeric(this.nameSpaceId)
          // this.logger.log('[KNOWLEDGE-BASES-COMP] nameSpaceIdisAlphaNumeric' , nameSpaceIdisAlphaNumeric)
          if (nameSpaceIdisAlphaNumeric === false) {
            this.nameSpaceId = '0'
          }
        }

      });



      // const nameSpaceId = currentUrl.substring(currentUrl.lastIndexOf('/') + 1)
      //  this.logger.log('[KNOWLEDGE-BASES-COMP] selectLastUsedNamespaceAndGetKbList currentUrl > nameSpaceId ', this.nameSpaceId)

      if (this.nameSpaceId === '0') {
        this.selectedNamespace = namespaces.find((el) => {
          return el.default === true
        });
        if (this.selectedNamespace) {
          this.selectedNamespaceName = this.selectedNamespace.name

          this.logger.log('[KNOWLEDGE-BASES-COMP] selectLastUsedNamespace on init this.selectedNamespace', this.selectedNamespace);
          this.logger.log('[KNOWLEDGE-BASES-COMP] selectLastUsedNamespace on init  selectedNamespace', this.selectedNamespaceName);

          this.router.navigate(['project/' + this.project._id + '/knowledge-bases/' + this.selectedNamespace.id]);
          this.localDbService.setInStorage(`last_kbnamespace-${this.id_project}`, JSON.stringify(this.selectedNamespace))
          this.getChatbotUsingNamespace(this.selectedNamespace.id)
        }
      } else {
        this.selectedNamespace = namespaces.find((el) => {
          return el.id === this.nameSpaceId;
        });

        this.selectedNamespaceName = this.selectedNamespace.name
        this.router.navigate(['project/' + this.project._id + '/knowledge-bases/' + this.selectedNamespace.id]);
        this.localDbService.setInStorage(`last_kbnamespace-${this.id_project}`, JSON.stringify(this.selectedNamespace))
        this.getChatbotUsingNamespace(this.selectedNamespace.id)
      }

    } else {
      this.logger.log('[KNOWLEDGE-BASES-COMP] selectLastUsedNamespace on init EXIST storedNamespace')
      const storedNamespaceObjct = JSON.parse(storedNamespace)
      this.logger.log('[KNOWLEDGE-BASES-COMP] selectLastUsedNamespace storedNamespaceObjct ', storedNamespaceObjct),


        this.selectedNamespace = namespaces.find((el) => {
          return el.id === storedNamespaceObjct['id'];
        });
      this.logger.log('[KNOWLEDGE-BASES-COMP] selectLastUsedNamespace on init  selectedNamespace (FIND WITH ID GET FROM STORAGE)', this.selectedNamespace)


      if (this.selectedNamespace) {
        this.logger.log('[KNOWLEDGE-BASES-COMP] selectLastUsedNamespace on init  selectedNamespace (FIND WITH ID GET FROM STORAGE) ID', this.selectedNamespace.id)
        this.selectedNamespaceName = this.selectedNamespace.name
        this.logger.log('[KNOWLEDGE-BASES-COMP] selectLastUsedNamespace on init  selectedNamespace (FIND WITH ID GET FROM STORAGE)', this.selectedNamespaceName)
        this.router.navigate(['project/' + this.project._id + '/knowledge-bases/' + this.selectedNamespace.id]);
        this.getChatbotUsingNamespace(this.selectedNamespace.id)
      } else {
        this.logger.log('[KNOWLEDGE-BASES-COMP] selectLastUsedNamespace on init  selectedNamespace (NOT EXIST BETWEEN THE NASPACES A NASPACE  WITH THE ID GET FROM STORED NAMESPACE)', this.selectedNamespaceName)
        this.selectedNamespace = namespaces.find((el) => {
          return el.default === true
        });
        this.router.navigate(['project/' + this.project._id + '/knowledge-bases/' + this.selectedNamespace.id]);
        this.getChatbotUsingNamespace(this.selectedNamespace.id)
        if (this.selectedNamespaceName) {
          this.selectedNamespaceName = this.selectedNamespace.name
        }
      }
    }
    this.paramsDefault = "?limit=" + KB_DEFAULT_PARAMS.LIMIT + "&page=" + KB_DEFAULT_PARAMS.NUMBER_PAGE + "&sortField=" + KB_DEFAULT_PARAMS.SORT_FIELD + "&direction=" + KB_DEFAULT_PARAMS.DIRECTION + "&namespace=" + this.selectedNamespace.id;
    this.getListOfKb(this.paramsDefault, 'selectLastUsedNamespaceAndGetKbList');
  }

  createNewNamespace(namespaceName: string) {
    this.kbService.createNamespace(namespaceName).subscribe((namespace: any) => {
      if (namespace) {

        this.logger.log('[KNOWLEDGE-BASES-COMP] - CREATE NEW NAMESPACE', namespace);
        this.selectedNamespace = namespace;
        this.getChatbotUsingNamespace(this.selectedNamespace.id)

        this.selectedNamespaceName = namespace['name']
        this.router.navigate(['project/' + this.project._id + '/knowledge-bases/' + this.selectedNamespace.id]);

        // this.logger.log('[KNOWLEDGE-BASES-COMP] CREATE NEW NAMESPACE  selectedNamespaceName', this.selectedNamespaceName)
        // this.selectedNamespaceID = namespace['id'];
        // this.logger.log('[KNOWLEDGE-BASES-COMP] CREATE NEW NAMESPACE  selectedNamespaceID', this.selectedNamespaceID)

        // this.selectedNamespaceIsDefault = namespace['default']; 
        // this.logger.log('[KNOWLEDGE-BASES-COMP] CREATE NEW NAMESPACE  selectedNamespaceIsDefault', this.selectedNamespaceIsDefault)

        this.localDbService.setInStorage(`last_kbnamespace-${this.id_project}`, JSON.stringify(namespace))
        this.namespaces.push(namespace)
        this.logger.log('[KNOWLEDGE-BASES-COMP] CREATE NEW NAMESPACE  namespaces', this.namespaces)

        let paramsDefault = "?limit=" + KB_DEFAULT_PARAMS.LIMIT + "&page=" + KB_DEFAULT_PARAMS.NUMBER_PAGE + "&sortField=" + KB_DEFAULT_PARAMS.SORT_FIELD + "&direction=" + KB_DEFAULT_PARAMS.DIRECTION + "&namespace=" + this.selectedNamespace.id;
        this.getListOfKb(paramsDefault, 'createNewNamespace');
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

      this.notify.showWidgetStyleUpdateNotification(this.translate.instant("KbPage.NewNamespaceCreatedSuccessfully", { namespace_name: this.selectedNamespace.name }), 2, 'done');
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



  onChangeNamespaceName(event) {
    this.logger.log('[KNOWLEDGE-BASES-COMP] ON CHANGE NAMESPACE NAME  event ', event)
    this.newNamespaceName = event
  }

  updateNamespace(body, calledBy, previedata?: any) {
    this.logger.log('[KNOWLEDGE-BASES-COMP] - UPDATE NAME SPACE calledBy ', calledBy);
    this.logger.log('[KNOWLEDGE-BASES-COMP] - UPDATE NAME SPACE body ', body);
    this.logger.log('[KNOWLEDGE-BASES-COMP] - UPDATE NAME SPACE previedata ', previedata);

    this.kbService.updateNamespace(body, this.selectedNamespace.id).subscribe((namespace: any) => {
      if (namespace) {

        this.logger.log('[KNOWLEDGE-BASES-COMP] - UPDATE NAME SPACE RES', namespace);
        this.selectedNamespace = namespace
        let updatedNameSpaceName = namespace.name
        this.localDbService.setInStorage(`last_kbnamespace-${this.id_project}`, JSON.stringify(namespace))


        // let storedNamespace = this.localDbService.getFromStorage(`last_kbnamespace-${this.id_project}`)
        // if (storedNamespace) {
        //   let storedNamespaceObjct = JSON.parse(storedNamespace)
        //   this.logger.log('[KNOWLEDGE-BASES-COMP] - UPDATE NAME SPACE NAME storedNamespaceObjct', storedNamespaceObjct);
        //   storedNamespaceObjct.name = updatedNameSpaceName
        //   this.localDbService.setInStorage(`last_kbnamespace-${this.id_project}`, JSON.stringify(namespace))

        // }

        this.logger.log('[KNOWLEDGE-BASES-COMP] - UPDATE NAME SPACE > NAMESPACES ', this.namespaces)
        this.logger.log('[KNOWLEDGE-BASES-COMP] - UPDATE NAME SPACE NAMESPACES EL to update  ', this.namespaces[this.newNamespaceNameIndex])
        // let namespaceItemToUpdate  = this.namespaces[this.newNamespaceNameIndex]

        if (calledBy !== 'modal-update-settings' && calledBy !== 'modal-update-settings-and-open-preview') {
          this.namespaces[this.newNamespaceNameIndex]['name'] = updatedNameSpaceName
        }

        // this.logger.log('[KNOWLEDGE-BASES-COMP] CREATE NEW NAMESPACE  selectedNamespaceName', this.selectedNamespaceName)
        // this.selectedNamespaceID = namespace['namespace_id'];
        // this.logger.log('[KNOWLEDGE-BASES-COMP] CREATE NEW NAMESPACE  selectedNamespaceID', this.selectedNamespaceID)

        // this.localDbService.setInStorage('last_kbnamespace', JSON.stringify(namespace))
        // this.namespaces.push(namespace)
        // this.logger.log('[KNOWLEDGE-BASES-COMP] CREATE NEW NAMESPACE  namespaces', this.namespaces)
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
    // this.namespaceIsEditable = true
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
    // this.namespaceIsEditable = false
    // this.logger.log('[KNOWLEDGE-BASES-COMP] onMouseOut namespace name namespaceIsEditable', this.namespaceIsEditable)
    // if (this.namespaceValueOnFocus && this.selectedNamespaceName !== this.namespaceValueOnFocus) {
    //   this.logger.log('[KNOWLEDGE-BASES-COMP] onMouseOut  selectedNamespaceName ', this.selectedNamespaceName, ' namespaceValueOnFocus ', this.namespaceValueOnFocus, ' RUN UPDATE')
    // } else {
    //   this.logger.log('[KNOWLEDGE-BASES-COMP] onMouseOut  selectedNamespaceName ', this.selectedNamespaceName, ' namespaceValueOnFocus ', this.namespaceValueOnFocus, ' NOTHING CHANGE')
    // }

  }

  onSelectNamespace(namespace) {
    this.logger.log('[KNOWLEDGE-BASES-COMP] onSelectNamespace namespace', namespace)

    if (namespace) {
      this.router.navigate(['project/' + this.project._id + '/knowledge-bases/' + namespace.id]);
      // this.getDeptsByProjectId()
      this.hasChangedNameSpace = true;
      this.selectedNamespace = namespace
      this.selectedNamespaceName = namespace['name']
      this.logger.log('[KNOWLEDGE-BASES-COMP] onSelectNamespace selectedNamespace', this.selectedNamespace)
      this.logger.log('[KNOWLEDGE-BASES-COMP] onSelectNamespace hasChangedNameSpace', this.hasChangedNameSpace)
      // this.selectedNamespaceName = namespace['name']
      this.logger.log('[KNOWLEDGE-BASES-COMP] onSelectNamespace selectedNamespace NAME', this.selectedNamespaceName)
      this.getChatbotUsingNamespace(this.selectedNamespace.id)

      // this.selectedNamespaceID = namespace['id']
      // this.logger.log('[KNOWLEDGE-BASES-COMP] onSelectNamespace selectedNamespaceID', this.selectedNamespaceID)

      // this.selectedNamespaceIsDefault = namespace['default']
      // this.logger.log('[KNOWLEDGE-BASES-COMP] onSelectNamespace selectedNamespaceIsDefault', this.selectedNamespaceIsDefault)

      this.localDbService.setInStorage(`last_kbnamespace-${this.id_project}`, JSON.stringify(namespace))
      let paramsDefault = "?limit=" + KB_DEFAULT_PARAMS.LIMIT + "&page=" + KB_DEFAULT_PARAMS.NUMBER_PAGE + "&sortField=" + KB_DEFAULT_PARAMS.SORT_FIELD + "&direction=" + KB_DEFAULT_PARAMS.DIRECTION + "&namespace=" + this.selectedNamespace.id;
      this.getListOfKb(paramsDefault, 'onSelectNamespace');

    }
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
    this.kbService.getChatbotsUsingNamespace(selectedNamespaceid).subscribe((chatbots: any) => {

      this.logger.log('[KNOWLEDGE-BASES-COMP] - GET CHATBOTS USING NAMESPACE chatbots', chatbots);
      // let isArray = this.isArray(chatbots)
      // if (isArray) {
      if (chatbots.length > 0) {
        this.logger.log('[KNOWLEDGE-BASES-COMP] - GET CHATBOTS USING NAMESPACE chatbots ', chatbots)


        chatbots.forEach(bot => {
          this.logger.log('[KNOWLEDGE-BASES-COMP] - GET FAQKB forEach bot: ', bot)


          let imgUrl = ''
          if (this.UPLOAD_ENGINE_IS_FIREBASE === true) {

            // this.logger.log('[HOME] - CHECK IF BOT HAS IMAGE - USECASE UPLOAD-ENGINE FIREBASE ');
            // ------------------------------------------------------------------------------
            // Usecase uploadEngine Firebase 
            // ------------------------------------------------------------------------------
            imgUrl = "https://firebasestorage.googleapis.com/v0/b/" + this.storageBucket + "/o/profiles%2F" + bot['_id'] + "%2Fphoto.jpg?alt=media"

          } else {

            // ------------------------------------------------------------------------------
            // Usecase uploadEngine Native 
            // ------------------------------------------------------------------------------
            imgUrl = this.baseUrl + "images?path=uploads%2Fusers%2F" + bot['_id'] + "%2Fimages%2Fthumbnails_200_200-photo.jpg"
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

  // isArray(what) {
  //   return Object.prototype.toString.call(what) === '[object Array]';
  // }

  createChatbotfromKbOfficialResponderTemplate() {
    if (this.USER_ROLE !== 'agent') {
      if (this.chatBotLimit) {
        if (this.myChatbotOtherCount < this.chatBotLimit) {
          this.logger.log('[COMMUNITY-TEMPLATE-DTLS] USECASE  chatBotCount < chatBotLimit: RUN FORK')
          this.findKbOfficialResponderAndThenExportToJSON()
        } else if (this.myChatbotOtherCount >= this.chatBotLimit) {
          this.logger.log('[COMMUNITY-TEMPLATE-DTLS] USECASE  chatBotCount >= chatBotLimit DISPLAY MODAL')
          this.presentDialogReachedChatbotLimit()
        }
      } else if (!this.chatBotLimit) {
        this.logger.log('[COMMUNITY-TEMPLATE-DTLS] USECASE  NO chatBotLimit: RUN FORK')
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
  // const exportFaqToJsonBtnEl = <HTMLElement>document.querySelector('.export-chatbot-to-json-btn');
  // exportFaqToJsonBtnEl.blur();
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
        // goToCDSVersion(this.router, faqkb, this.project._id, this.appConfigService.getConfig().cdsBaseUrl)

      }

    }, (error) => {
      this.logger.error('[KNOWLEDGE-BASES-COMP] -  IMPORT CHATBOT FROM JSON- ERROR', error);
    }, () => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] - IMPORT CHATBOT FROM JSON - COMPLETE');

      // this.presentDialogChatbotSuccessfullyCreated()

    });
  }




  getDeptsByProjectId(faqkb?: string) {
    this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {

      this.logger.log('[KNOWLEDGE-BASES-COMP] --->  DEPTS RES ', departments);

      if (departments) {
        const depts_length = departments.length
        this.logger.log('[KNOWLEDGE-BASES-COMP] --->  DEPTS LENGHT ', depts_length);

        if (depts_length === 1) {
          // this.DISPLAY_SELECT_DEPTS_WITHOUT_BOT = false
          this.dept_id = departments[0]['_id']

          this.logger.log('[KNOWLEDGE-BASES-COMP] ---> USECASE DEPTS LENGHT = 1 - DEFAULT DEPT HAS BOT ', departments[0].hasBot);
          this.logger.log('[KNOWLEDGE-BASES-COMP] ---> USECASE DEPTS LENGHT = 1 - DEFAULT DEPT HAS BOT ', departments[0]);
          if (departments[0].hasBot === true) {
            this.presentDialogChatbotSuccessfullyCreated()

            this.logger.log('[KNOWLEDGE-BASES-COMP] --->  DEFAULT DEPT HAS BOT ');
            // this.DISPLAY_BTN_ACTIVATE_BOT_FOR_NEW_CONV = false;
            // this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = false

            // this.logger.log('Bot Create --->  DEFAULT DEPT HAS BOT DISPLAY_BTN_ACTIVATE_BOT_FOR_NEW_CONV ', this.DISPLAY_BTN_ACTIVATE_BOT_FOR_NEW_CONV);
            // this.logger.log('[KNOWLEDGE-BASES-COMP] --->  DEFAULT DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);
          } else {
            this.logger.log('[KNOWLEDGE-BASES-COMP] ---> USECASE DEPTS LENGHT = 1 DEFAULT DEPT NOT HAS BOT ', departments[0]);
            this.logger.log('[KNOWLEDGE-BASES-COMP] ---> USECASE DEPTS LENGHT = 1 DEFAULT DEPT NOT HAS BOT ', departments[0].hasBot);
            this.hookBotToDept(departments[0]._id, faqkb, 'hookToDefaultDept');
            this.presentDialogChatbotSuccessfullyCreated()


            // this.DISPLAY_BTN_ACTIVATE_BOT_FOR_NEW_CONV = true;
            // this.logger.log('[KNOWLEDGE-BASES-COMP] --->  DEFAULT DEPT botType selected ', this.botType);
            // if (this.botType !== 'identity') {
            // this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = true;
          }

          // this.logger.log('[KNOWLEDGE-BASES-COMP] --->  DEFAULT DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);
        } else if (depts_length > 1) {
          this.logger.log('[KNOWLEDGE-BASES-COMP] --->  DEPTS LENGHT  USECASE DEPTS LENGHT > 1', depts_length);

          // this.DISPLAY_SELECT_DEPTS_WITHOUT_BOT = true;
          departments.forEach(dept => {

            if (dept.hasBot === true) {
              this.logger.log('[KNOWLEDGE-BASES-COMP] ---> USECASE DEPTS LENGHT > 1  DEPT HAS BOT ');

              // this.logger.log('[BOT-CREATE] --->  DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);
            } else {
              this.logger.log('[KNOWLEDGE-BASES-COMP] ---> USECASE DEPTS LENGHT > 1  DEPT NOT HAS BOT ');
              // this.logger.log('[BOT-CREATE] --->  DEPT botType selected ', this.botType);
              // if (this.botType !== 'identity') {
              //   this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT = true;
              // }
              // this.logger.log('[BOT-CREATE] --->  DEPT HAS BOT PRESENTS_MODAL_ATTACH_BOT_TO_DEPT ', this.PRESENTS_MODAL_ATTACH_BOT_TO_DEPT);

              this.depts_without_bot_array.push({ id: dept._id, name: dept.name })
              this.logger.log('[KNOWLEDGE-BASES-COMP] ---> USECASE DEPTS LENGHT > 1  DEPT NOT HAS BOT  depts_without_bot_array ', this.depts_without_bot_array);

              if (!this.dialogRefHookBoot) {
                // this.openDialogHookBot(this.depts_without_bot_array, faqkb)
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


  presentDialogChatbotSuccessfullyCreated() {
    this.logger.log('[KNOWLEDGE-BASES-COMP] --->  DIALOG CHATBOT CREATED depts_without_bot_array 1', this.depts_without_bot_array);

    Swal.fire({
      // title: this.translate.instant('Success'),
      // text: this.translate.instant('ChatbotSuccessfullyCreated'),
      title: this.translate.instant('ChatbotSuccessfullyCreated'),
      text: this.translate.instant('NowItIsTimeToAddContent') + ' !',
      icon: "success",
      showCloseButton: false,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('Ok'),
      confirmButtonColor: "var(--blue-light)",
      focusConfirm: true,
      // reverseButtons: true,
      // buttons: [null, this.cancel],
      // dangerMode: false
    })
    // }

  }

  presentDialogNotExistThekbOfficialResponderTemplate() {
    Swal.fire({
      // title: this.translate.instant('Success'),
      // text: this.translate.instant('ChatbotSuccessfullyCreated'),
      title: this.translate.instant('ItIsNotPossibleToCreateTheChatbot') , //"It is not possible to create the chatbot",
      text: this.translate.instant('YourProjectIsMissingTheTemplateNeededToCreateTheChatbot') + ' !',
      icon: "error",
      showCloseButton: false,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('Ok'),
      confirmButtonColor: "var(--blue-light)",
      focusConfirm: true,
      // reverseButtons: true,
      // buttons: [null, this.cancel],
      // dangerMode: false
    })
    // }

  }


  presentDialogChatbotSuccessfullyCreatedTheHookBot(depts_without_bot_array, faqkb) {
    this.logger.log('[KNOWLEDGE-BASES-COMP] --->  DIALOG CHATBOT CREATED depts_without_bot_array 1', this.depts_without_bot_array);

    Swal.fire({
      // title: this.translate.instant('Success'),
      // text: this.translate.instant('ChatbotSuccessfullyCreated'),
      title: this.translate.instant('ChatbotSuccessfullyCreated'),
      text: this.translate.instant('NowItIsTimeToAddContent') + ' !',
      icon: "success",
      showCloseButton: false,
      showCancelButton: false,
      confirmButtonText: this.translate.instant('BotsPage.Continue') + ' ' + '<i class="fa fa-arrow-right">',
      // cancelButtonText: this.cancel,
      confirmButtonColor: "var(--blue-light)",
      reverseButtons: true,
      // dangerMode: false
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
      // this.logger.log(`[KNOWLEDGE-BASES-COMP] DIALOG HOOK BOT after closed getState:`,  dialogRef.getState());
      // dialogRef.getState()
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

      // this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT = true
      // this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT_ERROR = true;

      // this.logger.error('[KNOWLEDGE-BASES-COMP] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - ERROR - HAS_COMPLETED_HOOK_BOOT_TO_DEPT', this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT);
    }, () => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - COMPLETE ');
      if (hookToDefaultDept === undefined) {
        this.notify.showWidgetStyleUpdateNotification(this.translate.instant('BotSuccessfullyActivated'), 2, 'done');
      }
      // this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT = true
      // this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT_SUCCESS = true;
      // this.logger.log('[BOT-CREATE] Bot Create - UPDATE EXISTING DEPT WITH SELECED BOT - COMPLETE - HAS_COMPLETED_HOOK_BOOT_TO_DEPT', this.HAS_COMPLETED_HOOK_BOOT_TO_DEPT);
    });
  }


  goToBotDetails() {
    // this.router.navigate(['project/' + this.projectId + '/cds/', this.botid, 'intent', '0'])
    let faqkb = {
      createdAt: new Date(),
      _id: this.botid
    }
    goToCDSVersion(this.router, faqkb, this.project._id, this.appConfigService.getConfig().cdsBaseUrl)
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

    this.logger.log('[KNOWLEDGE-BASES-COMP] -------> OPEN DIALOG GO TO CDS !!!!')
    const dialogRef = this.dialog.open(ModalConfirmGotoCdsComponent, {
      width: '700px',
      data: {
        chatbot: chatbot
      },
    })
    dialogRef.afterClosed().subscribe(result => {

      this.logger.log(`[KNOWLEDGE-BASES-COMP] DIALOG GO TO CDS after closed result:`, result);

      //   if (result && result.chatbot) {

      //     let faqkb = {
      //       createdAt: new Date(),
      //       _id: chatbot._id
      //     }
      //     goToCDSVersion(this.router, faqkb, this.project._id, this.appConfigService.getConfig().cdsBaseUrl)

      //   }

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

    // ModalConfirmGotoCdsComponent
    // this.logger.error('[KNOWLEDGE-BASES-COMP] - GO TO CHATBOT DETAILS > chatbot', chatbot);
    // let faqkb = {
    //   createdAt: new Date(),
    //   _id: chatbot._id
    // }
    // goToCDSVersion(this.router, faqkb, this.project._id, this.appConfigService.getConfig().cdsBaseUrl)
  }


  // ------------------------------------------------------------------------
  // @ Modals Windows
  // ------------------------------------------------------------------------
  presentModalAddNewNamespace() {
    this.logger.log('[KNOWLEDGE-BASES-COMP] - presentModalAddNewNamespace ');

    const dialogRef = this.dialog.open(ModalAddNamespaceComponent, {
      width: '600px',
      // data: {
      //   calledBy: 'step1'
      // },
    })
    dialogRef.afterClosed().subscribe(result => {
      this.logger.log(`[KNOWLEDGE-BASES-COMP] Dialog result:`, result);

      if (result && result.namespaceName) {

        const namespaceName = result.namespaceName

        this.createNewNamespace(namespaceName)
      }
    });
  }

  onOpenBaseModalPreview(previedata?: any) {
    // this.baseModalPreview = true;
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
    // this.baseModalPreviewSettings = true;
    // #191d2285;
    const dialogRef = this.dialog.open(ModalPreviewSettingsComponent, {
      // backdropClass: 'cdk-overlay-transparent-backdrop',
      backdropClass: 'overlay-backdrop',
      hasBackdrop: true,
      disableClose: true,
      width: '360px',
      data: {
        selectedNamespace: this.selectedNamespace,
      },
    });
    dialogRef.backdropClick().subscribe((event) => {
      this.logger.log('AI model Backdrop clicked', event);
      this.hasCickedAiSettingsModalBackdrop = true
      const customevent = new CustomEvent("on-backdrop-clicked", { detail: this.hasCickedAiSettingsModalBackdrop });
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
    this.logger.log("onOpenDeleteNamespaceModal called....")
    if (this.selectedNamespace.default && this.kbsList.length === 0) {
      this.presentModalDefautNamespaceCannotBeDeleted()
    } else {
      // this.showDeleteNamespaceModal = true;
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

  onOpenBaseModalDetail(kb) {
    // this.kbid_selected = kb;
    // this.logger.log('onOpenBaseModalDetail:: ', this.kbid_selected);
    // this.baseModalDetail = true;

    const dialogRef = this.dialog.open(ModalDetailKnowledgeBaseComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '600px',
      data: {
        kb: kb
      },
    });
    dialogRef.afterClosed().subscribe(kb => {
      this.logger.log('[Modal KB DETAILS] Dialog kb: ', kb);
      if (kb) {
        this.onUpdateKb(kb)
      }
    });
  }

  onOpenBaseModalDelete(kb) {
    this.kbid_selected = kb;
    this.kbid_selected.deleting = true;
    this.baseModalDelete = true;


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
  }


  openAddKnowledgeBaseModal(type?: string) {
    this.logger.log('[KNOWLEDGE BASES COMP] openAddKnowledgeBaseModal type', type)
    this.typeKnowledgeBaseModal = type;
    this.addKnowledgeBaseModal = 'block';

    if (type === 'text-file') {
      this.presentModalAddContent()
    }
    if (type === 'urls') {
      this.presentModalAddURLs()
    }

    if (type === 'site-map') {
      this.presentModalImportSitemap()
    }
    if (type === 'file-upload') {

      this.presentModalUploadFile()
    }

    if (type === 'faq') {
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
    dialogRef.afterClosed().subscribe(result => {
      this.logger.log('[Modal Add FAQs] Dialog result (afterClosed): ', result);
      if (result && result.isSingle === "true") {
        if (result.body) {
          this.onAddKb(result.body)
        }
      } else if (result && result.isSingle === "false") {
        let paramsDefault = "?limit=" + KB_DEFAULT_PARAMS.LIMIT + "&page=" + KB_DEFAULT_PARAMS.NUMBER_PAGE + "&sortField=" + KB_DEFAULT_PARAMS.SORT_FIELD + "&direction=" + KB_DEFAULT_PARAMS.DIRECTION + '&namespace=' + this.selectedNamespace.id;
        this.getListOfKb(paramsDefault, 'add-multi-faq')
      }
    });
  }

  presentModalAddURLs() {
    const dialogRef = this.dialog.open(ModalUrlsKnowledgeBaseComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '600px',
    });
    dialogRef.afterClosed().subscribe(body => {
      this.logger.log('[Modal Add URLS AFTER CLOSED] Dialog body: ', body);
      if (body) {
        this.onAddMultiKb(body)
      }
    });

  }


  presentModalImportSitemap() {
    const dialogRef = this.dialog.open(ModalSiteMapComponent, {
      backdropClass: 'cdk-overlay-transparent-backdrop',
      hasBackdrop: true,
      width: '600px',

    });
    dialogRef.afterClosed().subscribe(body => {
      this.logger.log('[Modal IMPORT SITEMAP AFTER CLOSED]  body: ', body);
      if (body) {
        this.onAddMultiKb(body)
      }

    });
  }

  presentModalUploadFile() {
    this.logger.log('[KNOWLEDGE BASES COMP] PRESENT MODAL UPLOAD FILE ')
    const dialogRef = this.dialog.open(ModalUploadFileComponent, {
      width: '360px',
      // data: {
      //   calledBy: 'step1'
      // },
    })
    dialogRef.afterClosed().subscribe(body => {
      this.logger.log(`[KNOWLEDGE-BASES-COMP]  AFTER CLOSED MODAL UPLOAD FILE body:`, body);

      if (body) {
        this.onAddKb(body)
      }
    });

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


  ngOnDestroy(): void {
    clearInterval(this.interval_id);
  }

  listenToKbVersion() {
    this.kbService.newKb
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((newKb) => {
        this.logger.log('[KNOWLEDGE-BASES-COMP] - are new KB ', newKb)
        this.ARE_NEW_KB = newKb;
      })
  }

  getTemplates() {
    this.faqKbService.getTemplates().subscribe((res: any) => {

      if (res) {
        const templates = res
        //  this.logger.log('[BOTS-LIST] - GET ALL TEMPLATES', templates);
        this.allTemplatesCount = templates.length;
        this.logger.log('[KNOWLEDGE-BASES-COMP] - GET ALL TEMPLATES COUNT', this.allTemplatesCount);

        // ---------------------------------------------------------------------
        // Customer Satisfaction templates
        // ---------------------------------------------------------------------
        const customerSatisfactionTemplates = templates.filter((obj) => {
          return obj.mainCategory === "Customer Satisfaction"
        });
        this.logger.log('KNOWLEDGE-BASES-COMP] - Customer Satisfaction TEMPLATES', customerSatisfactionTemplates);
        if (customerSatisfactionTemplates) {
          this.customerSatisfactionTemplatesCount = customerSatisfactionTemplates.length;
          this.logger.log('[KNOWLEDGE-BASES-COMP] - Customer Satisfaction COUNT', this.customerSatisfactionTemplatesCount);
        }

        // ---------------------------------------------------------------------
        // Customer Increase Sales
        // ---------------------------------------------------------------------
        const increaseSalesTemplates = templates.filter((obj) => {
          return obj.mainCategory === "Increase Sales"
        });
        //  this.logger.log('[BOTS-LIST] - Increase Sales TEMPLATES', increaseSalesTemplates);
        if (increaseSalesTemplates) {
          this.increaseSalesTemplatesCount = increaseSalesTemplates.length;
          this.logger.log('[KNOWLEDGE-BASES-COMP] - Increase Sales COUNT', this.increaseSalesTemplatesCount);
        }
      }

    }, (error) => {
      this.logger.error('[KNOWLEDGE-BASES-COMP] GET TEMPLATES ERROR ', error);

    }, () => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] GET TEMPLATES COMPLETE');

    });
  }

  getCommunityTemplates() {

    this.faqKbService.getCommunityTemplates().subscribe((res: any) => {
      if (res) {
        const communityTemplates = res
        this.logger.log('[KNOWLEDGE-BASES-COMP] - GET COMMUNITY TEMPLATES', communityTemplates);
        this.allCommunityTemplatesCount = communityTemplates.length;
        this.logger.log('[KNOWLEDGE-BASES-COMP] - GET COMMUNITY TEMPLATES COUNT', this.allCommunityTemplatesCount);
      }
    }, (error) => {
      this.logger.error('[KNOWLEDGE-BASES-COMP]  GET COMMUNITY TEMPLATES ERROR ', error);

    }, () => {
      this.logger.log('[KNOWLEDGE-BASES-COMP]  GET COMMUNITY TEMPLATES COMPLETE');

    });
  }

  getFaqKbByProjectId() {
    this.faqKbService.getFaqKbByProjectId().subscribe((faqKb: any) => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] - GET BOTS BY PROJECT ID', faqKb);
      if (faqKb) {
        this.myChatbotOtherCount = faqKb.length

        // ---------------------------------------------------------------------
        // Bot forked from Customer Satisfaction templates
        // ---------------------------------------------------------------------
        let customerSatisfactionBots = faqKb.filter((obj) => {
          return obj.mainCategory === "Customer Satisfaction"
        });
        this.logger.log('[KNOWLEDGE-BASES-COMP] - Customer Satisfaction BOTS', customerSatisfactionBots);
        if (customerSatisfactionBots) {
          this.customerSatisfactionBotsCount = customerSatisfactionBots.length;
          this.logger.log('[KNOWLEDGE-BASES-COMP] - Customer Satisfaction COUNT', this.customerSatisfactionTemplatesCount);
        }


        // ---------------------------------------------------------------------
        // Bot forked from Customer Increase Sales
        // ---------------------------------------------------------------------
        let increaseSalesBots = faqKb.filter((obj) => {
          return obj.mainCategory === "Increase Sales"
        });
        this.logger.log('[KNOWLEDGE-BASES-COMP] - Increase Sales BOTS ', increaseSalesBots);
        if (increaseSalesBots) {
          this.increaseSalesBotsCount = increaseSalesBots.length;
          this.logger.log('[KNOWLEDGE-BASES-COMP] - Increase Sales BOTS COUNT', this.increaseSalesTemplatesCount);
        }
      }
    }, (error) => {
      this.logger.error('[KNOWLEDGE-BASES-COMP] GET BOTS ERROR ', error);

    }, () => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] GET BOTS COMPLETE');
      // FOR ANY FAQ-KB ID GET THE FAQ ASSOCIATED
    });

  }

  getOSCODE() {

    let public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;

    let keys = public_Key.split("-");

    keys.forEach(key => {
      if (key.includes("PAY")) {
        let pay = key.split(":");
        // this.logger.log('PUBLIC-KEY (Navbar) - pay key&value', pay);
        if (pay[1] === "F") {
          this.payIsVisible = false;
          // this.logger.log("payIsVisible: ", this.payIsVisible)
        } else {
          this.payIsVisible = true;
          // this.logger.log("payIsVisible: ", this.payIsVisible)
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
        // this.deleteContact_msg = text;
        // this.logger.log('+ + + BotsPage translation: ', text)
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



  getRouteParams() {
    this.route.params.subscribe((params) => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] - GET ROUTE PARAMS ', params);
      if (params.calledby && params.calledby === 'h') {
        this.callingPage = 'Home'
        this.logger.log('[KNOWLEDGE-BASES-COMP] - GET ROUTE PARAMS callingPage ', this.callingPage);
      } else if (!params.calledby) {
        this.callingPage = 'Knowledge Bases'
        this.logger.log('[KNOWLEDGE-BASES-COMP] - GET ROUTE PARAMS callingPage ', this.callingPage);
      }
    })
  }

  trackPage() {
    if (!isDevMode()) {
      if (window['analytics']) {
        try {
          window['analytics'].page("Knowledge Bases Page", {
          });
        } catch (err) {
          this.logger.error('Knowledge page error', err);
        }
      }
    }
  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] - LOGGED USER ', user)
      if (user) {
        this.CURRENT_USER = user
        this.CURRENT_USER_ID = user._id
      }
    });
  }






  // startPooling() {
  //   this.interval_id = setInterval(() => {
  //     this.checkAllStatuses();
  //   }, 30000);
  // }

  // ----------------------
  // UTILS FUNCTION - Start
  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => {
      this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    })
  }

  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] SETTINGS-SIDEBAR isopened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN_SETTINGS_SIDEBAR = isopened
    });
  }
  // UTILS FUNCTION - End
  // --------------------


  // ---------------- SERVICE FUNCTIONS --------------- // 


  onLoadPage(searchParams?: any) {
    this.logger.log('[KNOWLEDGE-BASES-COMP]onLoadNextPage searchParams:', searchParams);
    let params = "?limit=" + KB_DEFAULT_PARAMS.LIMIT + '&namespace=' + this.selectedNamespace.id
    this.logger.log('[KNOWLEDGE-BASES-COMP] onLoadPage init params:', params);
    let limitPage = Math.floor(this.kbsListCount / KB_DEFAULT_PARAMS.LIMIT);
    this.numberPage++;
    this.logger.log('[KNOWLEDGE-BASES-COMP] onLoadNextPage searchParams > search:', searchParams.search);
    if (this.numberPage > limitPage) {
      this.numberPage = limitPage;
    }
    params += "&page=" + this.numberPage;
    this.logger.log('[KNOWLEDGE-BASES-COMP] onLoadPage numberPage:', params, 'searchParams  ', searchParams);
    // } else {
    //   +"&page=0";
    // }
    this.logger.log('onLoadNextPage searchParams > search (2):', searchParams.search);
    if (searchParams?.status) {
      params += "&status=" + searchParams.status;
      this.logger.log('[KNOWLEDGE-BASES-COMP] onLoadPage status:', params);
    }
    if (searchParams?.type) {
      params += "&type=" + searchParams.type;
    }
    if (searchParams?.search) {
      params += "&search=" + searchParams.search;
    }
    if (searchParams?.sortField) {
      params += "&sortField=" + searchParams.sortField;
    } else {
      params += "&sortField=" + KB_DEFAULT_PARAMS.SORT_FIELD;
    }
    if (searchParams?.direction) {
      params += "&direction=" + searchParams.direction;
    } else {
      params += "&direction=" + KB_DEFAULT_PARAMS.DIRECTION;
    }
    this.getListOfKb(params, 'onLoadPage');
  }

  onLoadByFilter(searchParams) {
    // this.logger.log('onLoadByFilter:',searchParams);
    // searchParams.page = 0;
    this.numberPage = -1;
    this.kbsList = [];
    this.onLoadPage(searchParams);
  }


  getListOfKb(params?: any, calledby?: any) {
    this.logger.log("[KNOWLEDGE BASES COMP] GET LIST OF KB calledby", calledby);
    this.logger.log("[KNOWLEDGE BASES COMP] GET LIST OF KB params", params);

    if (calledby === 'onSelectNamespace' || calledby === 'createNewNamespace' || calledby === 'deleteNamespace') {
      this.kbsList = [];
    }
    this.logger.log("[KNOWLEDGE BASES COMP] getListOfKb params", params);
    this.kbService.getListOfKb(params).subscribe((resp: any) => {
      this.logger.log("[KNOWLEDGE BASES COMP] get kbList resp: ", resp);
      //this.kbs = resp;
      this.kbsListCount = resp.count;
      this.logger.log('[KNOWLEDGE BASES COMP] kbsListCount ', this.kbsListCount)
      this.logger.log('[KNOWLEDGE BASES COMP] resp.kbs ', resp.kbs)
      resp.kbs.forEach((kb: any, i: number) => {
        // this.kbsList.push(kb);
        const index = this.kbsList.findIndex(objA => objA._id === kb._id);
        if (index !== -1) {
          this.kbsList[index] = kb;
        } else {
          if (calledby === 'add-multi-faq' || calledby === 'onAddMultiKb') {
            this.kbsList.unshift(kb);
          } else {
            this.kbsList.push(kb);
          }
        }
        this.logger.log('[KNOWLEDGE BASES COMP] loop i ', i)
        this.logger.log('[KNOWLEDGE BASES COMP] loop kbsListCount ', this.kbsListCount)
        if (i === this.kbsListCount - 1) {
          this.getKbCompleted = true;
          this.logger.log('[KNOWLEDGE BASES COMP] loop completed ', this.getKbCompleted)
        }
      });

      this.refreshKbsList = !this.refreshKbsList;

    }, (error) => {
      this.logger.error("[KNOWLEDGE BASES COMP] ERROR GET KB LIST: ", error);
      this.showSpinner = false
      this.getKbCompleted = false
    }, () => {
      this.logger.log("[KNOWLEDGE BASES COMP] GET KB LIST *COMPLETE*");
      this.showSpinner = false;

      this.presentKBTour()

    })
  }



  onSendSitemap(body) {
    // this.onCloseBaseModal();
    let error = this.msgErrorAddUpdateKb;
    this.kbService.addSitemap(body).subscribe((resp: any) => {
      this.logger.log("[KNOWLEDGE-BASES-COMP] onSendSitemap:", resp);
      if (resp.errors && resp.errors[0]) {
        swal({
          title: this.warningTitle,
          text: error,
          icon: "warning",
          className: "custom-swal",
          buttons: [null, this.cancel],
          dangerMode: false
        })
      } else {
        this.listSitesOfSitemap = resp.sites;

        const event = new CustomEvent("on-send-sitemap-site-list", { detail: this.listSitesOfSitemap });
        document.dispatchEvent(event);
      }

    }, (err) => {
      this.logger.error("[KNOWLEDGE-BASES-COMP] ERROR send sitemap: ", err);

      //this.onOpenErrorModal(error);

      swal({
        title: this.warningTitle,
        text: error,
        icon: "warning",
        className: "custom-swal",
        buttons: [null, "Cancel"],
        dangerMode: false
      })

    }, () => {
      this.logger.log("[KNOWLEDGE-BASES-COMP] send sitemap * COMPLETED *");
    })
  }

  /**
   * onAddKb
   */
  onAddKb(body) {
    this.logger.log('onAddKb this.kbLimit ', this.kbLimit)
    body.namespace = this.selectedNamespace.id
    this.logger.log("onAddKb body:", body);
    // this.onCloseBaseModal();
    let error = this.msgErrorAddUpdateKb;
    this.kbService.addKb(body).subscribe((resp: any) => {
      this.logger.log("onAddKb:", resp);
      let kb = resp.value;
      if (resp.lastErrorObject && resp.lastErrorObject.updatedExisting === true) {
        //this.logger.log("updatedExisting true:");
        const index = this.kbsList.findIndex(item => item._id === kb._id);
        if (index !== -1) {
          this.kbsList[index] = kb;
          this.notify.showWidgetStyleUpdateNotification(this.msgSuccesUpdateKb, 3, 'warning');
        }
      } else {
        //this.kbsList.push(kb);
        this.notify.showWidgetStyleUpdateNotification(this.msgSuccesAddKb, 2, 'done');
        // this.kbsListCount++;
        this.kbsList.unshift(kb);
        this.kbsListCount = this.kbsListCount + 1;
        this.refreshKbsList = !this.refreshKbsList;
        // let searchParams = {
        //   "sortField": KB_DEFAULT_PARAMS.SORT_FIELD,
        //   "direction": KB_DEFAULT_PARAMS.DIRECTION,
        //   "status": '',
        //   "search": '',
        // }
        // this.onLoadByFilter(searchParams);
      }
      this.updateStatusOfKb(kb._id, -1);
      // this.updateStatusOfKb(kb._id, 0);
      // this.onLoadByFilter(searchParams);
      // that.onRunIndexing(kb);
      // setTimeout(() => {
      //   this.checkStatusWithRetry(kb);
      // }, 2000);
      //that.onCloseBaseModal();
    }, (err) => {
      this.logger.error("[KNOWLEDGE-BASES-COMP] ERROR add new kb: ", err);
      // this.onOpenErrorModal(error);
      if (err.error && err.error.plan_limit) {
        // this.logger.log('here 1 ')
        this.getTranslatedStringKbLimitReached(err.error.plan_limit);
        error = this.msgErrorAddUpdateKbLimit
      }

      if (this.payIsVisible === true) {
        Swal.fire({
          title: this.warningTitle,
          text: error,
          icon: "warning",
          // className: "custom-swal",
          // buttons: [this.cancel, this.upgrade],
          showCloseButton: false,
          showCancelButton: true,
          confirmButtonText: this.upgrade,
          cancelButtonText: this.cancel,
          confirmButtonColor: "var(--blue-light)",
          reverseButtons: true,
          // dangerMode: false
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
        this.logger.log('here 1 this.kbLimit ', this.kbLimit , 'error ', error)
        Swal.fire({
          title: this.warningTitle,
          text: error,
          icon: "warning",
          // className: "custom-swal",
          showCloseButton: false,
          showCancelButton: true,
          confirmButtonText: this.contactUs,
          cancelButtonText: this.cancel,
          confirmButtonColor: "var(--blue-light)",
          focusConfirm: false,
          reverseButtons: true,
          // buttons: [null, this.cancel],
          // dangerMode: false
        }).then((result) => {
          if (result) {
            window.open(`mailto:${this.salesEmail}?subject=Upgrade plan`);
          }
        })
      } else if (this.payIsVisible === false && this.kbLimit == Number(0)) {
        this.logger.log('here 2 this.kbLimit ', this.kbLimit,  'error ', error)
        Swal.fire({
          title: this.warningTitle,
          text: error + '. ' + this.contactUsToUpgrade,
          icon: "warning",
          // className: "custom-swal",
          // buttons: [this.cancel, this.contactUs],
          showCloseButton: false,
          showCancelButton: true,
          confirmButtonText: this.contactUs,
          cancelButtonText: this.cancel,
          confirmButtonColor: "var(--blue-light)",
          focusConfirm: false,
          reverseButtons: true,
          // dangerMode: false
        }).then((result) => {
          if (result) {
            window.open(`mailto:${this.salesEmail}?subject=Upgrade plan`);
          }
        })
      }
    }, () => {
      this.logger.log("[KNOWLEDGE-BASES-COMP] add new kb *COMPLETED*");
      this.trackUserActioOnKB('Added Knowledge Base')
    })
  }



  presentModalOnlyOwnerCanManageTheAccountPlan() {

    this.notify.presentModalOnlyOwnerCanManageTheAccountPlan(this.onlyOwnerCanManageTheAccountPlanMsg, this.learnMoreAboutDefaultRoles)

  }

  onAddMultiKb(body) {
    this.logger.log('onAddMultiKb body' ,body) 
    // this.onCloseBaseModal();
    // this.logger.log("onAddMultiKb");
    let error = this.msgErrorAddUpdateKb;
    this.kbService.addMultiKb(body, this.selectedNamespace.id).subscribe((kbs: any) => {
      this.logger.log("onAddMultiKb:", kbs);
      this.notify.showWidgetStyleUpdateNotification(this.msgSuccesAddKb, 2, 'done');

      let paramsDefault = "?limit=" + KB_DEFAULT_PARAMS.LIMIT + "&page=" + KB_DEFAULT_PARAMS.NUMBER_PAGE + "&sortField=" + KB_DEFAULT_PARAMS.SORT_FIELD + "&direction=" + KB_DEFAULT_PARAMS.DIRECTION + '&namespace=' + this.selectedNamespace.id;
      this.getListOfKb(paramsDefault, 'onAddMultiKb');

      this.kbsListCount = this.kbsListCount + kbs.length;
      this.refreshKbsList = !this.refreshKbsList;
    }, (err) => {
      this.logger.error("[KNOWLEDGE-BASES-COMP] ERROR add new kb: ", err);

      //this.onOpenErrorModal(error);
      if (err.error && err.error.plan_limit) {
        this.getTranslatedStringKbLimitReached(err.error.plan_limit);
        error = this.msgErrorAddUpdateKbLimit
      }

      if (this.payIsVisible === true) {
        Swal.fire({
          title: this.warningTitle,
          text: error,
          icon: "warning",
          // className: "custom-swal",
          // buttons: [this.cancel, this.upgrade],
          // dangerMode: false
          showCloseButton: false,
          showCancelButton: true,
          confirmButtonText: this.upgrade,
          cancelButtonText: this.cancel,
          confirmButtonColor: "var(--blue-light)",
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
          // className: "custom-swal",
          // buttons: [null, this.cancel],
          // dangerMode: false
          showCloseButton: false,
          showCancelButton: false,
          confirmButtonText: this.cancel,
          confirmButtonColor: "var(--blue-light)",
          focusConfirm: false,
        })
      } else if (this.payIsVisible === false && this.kbLimit == Number(0)) {
        // this.logger.log('here 1')
        Swal.fire({
          title: this.warningTitle,
          text: error + '. ' + this.contactUsToUpgrade,
          icon: "warning",
          // className: "custom-swal",
          // buttons: [this.cancel, this.contactUs],
          // dangerMode: false
          showCloseButton: false,
          showCancelButton: true,
          confirmButtonText: this.contactUs,
          confirmButtonColor: "var(--blue-light)",
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
    // this.logger.log("[KNOWLEDGE-BASES-COMP] kb to delete id: ", data);
    // this.onCloseBaseModal();
    let error = this.msgErrorDeleteKb; //"Non è stato possibile eliminare il kb";
    this.kbService.deleteKb(data).subscribe((response: any) => {
      this.logger.log('[KNOWLEDGE-BASES-COMP] onDeleteKb response :: ', response);
      kb.deleting = false;
      if (!response || (response.success && response.success === false)) {
        // this.updateStatusOfKb(kb._id, 0);

        // this.onOpenErrorModal(error);
        Swal.fire({
          title: this.warningTitle,
          text: error,
          icon: "warning",
          // className: "custom-swal",
          // buttons: [null, this.cancel],
          // dangerMode: false
          showCloseButton: false,
          showCancelButton: true,
          showConfirmButton: false,
          // confirmButtonText: this.translate.instant('ContactUs'),
          // confirmButtonColor: "var(--blue-light)",
          cancelButtonText: this.cancel,
          focusConfirm: false,
        })



      } else {
        this.notify.showWidgetStyleUpdateNotification(this.msgSuccesDeleteKb, 2, 'done');
        // let error = response.error?response.error:"Errore generico";
        // this.onOpenErrorModal(error);
        this.removeKb(kb._id);
        this.kbsListCount = this.kbsListCount - 1;
        this.refreshKbsList = !this.refreshKbsList;
        this.hasRemovedKb = true;
        // let searchParams = {
        //   "sortField": KB_DEFAULT_PARAMS.SORT_FIELD,
        //   "direction": KB_DEFAULT_PARAMS.DIRECTION,
        //   "status": '',
        //   "search": '',
        // }
        // this.onLoadByFilter(searchParams);
      }
    }, (err) => {
      this.logger.error("[KNOWLEDGE-BASES-COMP] ERROR delete kb: ", err);
      kb.deleting = false;
      //this.kbid_selected.deleting = false;

      // this.onOpenErrorModal(error);
      swal({
        title: this.warningTitle,
        text: error,
        icon: "warning",
        className: "custom-swal",
        buttons: [null, this.cancel],
        dangerMode: false
      })

    }, () => {
      this.logger.log("[KNOWLEDGE-BASES-COMP] delete kb *COMPLETE*");
      this.trackUserActioOnKB('Deleted Knowledge Base')
    })
  }

  onDeleteNamespace(removeAlsoNamespace, namespaceIndex) {
    this.logger.log("[KNOWLEDGE-BASES-COMP] onDeleteNamespace removeAlsoNamespace " + removeAlsoNamespace);
    this.logger.log("[KNOWLEDGE-BASES-COMP] onDeleteNamespace namespaceIndex " + namespaceIndex);
    this.logger.log("[KNOWLEDGE-BASES-COMP] onDeleteNamespace ID " + this.selectedNamespace.id);
    // let id_namespace = this.id_project;
    // this.logger.log("delete namespace " + id_namespace);
    this.showSpinner = true;
    // this.closeDeleteNamespaceModal();

    this.kbService.deleteNamespace(this.selectedNamespace.id, removeAlsoNamespace)
      .subscribe((response: any) => {
        this.logger.log("[KNOWLEDGE-BASES-COMP] onDeleteNamespace response: ", response)
        this.showSpinner = false;

        // this.onLoadByFilter(this.paramsDefault);

      }, (error) => {
        this.logger.error("[KNOWLEDGE-BASES-COMP] onDeleteNamespace ERROR ", error);
        this.showSpinner = false;
      }, () => {
        this.logger.log("[KNOWLEDGE-BASES-COMP] onDeleteNamespace COMPLETE ");
        this.showSpinner = false;
        if (removeAlsoNamespace) {
          this.localDbService.removeFromStorage(`last_kbnamespace-${this.id_project}`)


          this.namespaces.splice(namespaceIndex, 1);
          this.logger.log('[KNOWLEDGE-BASES-COMP] onDeleteNamespace namespaces after splice', this.namespaces)


          this.selectedNamespace = this.namespaces.find((el) => {
            return el.default === true
          });
          // this.hasRemovednNamespace
          this.router.navigate(['project/' + this.project._id + '/knowledge-bases/' + this.selectedNamespace.id]);

          let paramsDefault = "?limit=" + KB_DEFAULT_PARAMS.LIMIT + "&page=" + KB_DEFAULT_PARAMS.NUMBER_PAGE + "&sortField=" + KB_DEFAULT_PARAMS.SORT_FIELD + "&direction=" + KB_DEFAULT_PARAMS.DIRECTION + "&namespace=" + this.selectedNamespace.id;

          this.getListOfKb(paramsDefault, 'deleteNamespace');

          this.logger.log('[KNOWLEDGE-BASES-COMP] onDeleteNamespace this.selectedNamespace', this.selectedNamespace)
        } else {
          let paramsDefault = "?limit=" + KB_DEFAULT_PARAMS.LIMIT + "&page=" + KB_DEFAULT_PARAMS.NUMBER_PAGE + "&sortField=" + KB_DEFAULT_PARAMS.SORT_FIELD + "&direction=" + KB_DEFAULT_PARAMS.DIRECTION + "&namespace=" + this.selectedNamespace.id;

          this.getListOfKb(paramsDefault, 'deleteNamespace');
        }
      })

  }


  // type: this.file_extension,
  // source: downloadURL,
  // content: "",
  // name: this.uploadedFileName,

  /** */
  onUpdateKb(kb) {
    //  this.logger.log('onUpdateKb: ', kb);
    // this.onCloseBaseModal();
    let error = this.anErrorOccurredWhileUpdating
    let dataDelete = {
      "id": kb._id,
      "namespace": kb.namespace
    }
    let dataAdd = {
      'name': kb.name,
      'source': kb.source,
      'content': '',
      'type': 'url',
      "namespace": kb.namespace
    };
    if (kb.type === 'text') {
      dataAdd.source = kb.name;
      dataAdd.content = kb.content,
        dataAdd.type = 'text'
    }
    if (kb.type === 'faq') {
      dataAdd.source = kb.name;
      dataAdd.content = kb.content,
        dataAdd.type = 'faq'
    }
    if (kb.type === 'txt' || kb.type === 'docx' || kb.type === 'pdf') {
      dataAdd.type = kb.type
    }
    //  this.logger.log('dataAdd: ', dataAdd);
    kb.deleting = true;
    this.kbService.deleteKb(dataDelete).subscribe((response: any) => {
      kb.deleting = false;
      if (!response || (response.success && response.success === false)) {

        // this.onOpenErrorModal(error);
        swal({
          title: this.warningTitle,
          text: error,
          icon: "warning",
          className: "custom-swal",
          buttons: [null, this.cancel],
          dangerMode: false
        })



      } else {
        this.kbService.addKb(dataAdd).subscribe((resp: any) => {
          let kbNew = resp.value;
          //  this.logger.log(' onUpdateKb ') 
          if (resp.lastErrorObject && resp.lastErrorObject.updatedExisting === true) {
            const index = this.kbsList.findIndex(item => item._id === kbNew._id);
            if (index !== -1) {
              this.kbsList[index] = kbNew;

              this.notify.showWidgetStyleUpdateNotification(this.msgSuccesUpdateKb, 3, 'warning');
            }
          } else {
            // this.kbsList.push(kb);
            // this.kbsList.unshift(kbNew);
            this.notify.showWidgetStyleUpdateNotification(this.msgSuccesUpdateKb, 2, 'done');
            this.hasUpdatedKb = true;
          }

          const index = this.kbsList.findIndex(item => item.id === kb._id);
          if (index > -1) {
            this.kbsList[index] = kbNew;
          }
          // this.removeKb(kb._id);
          //-->this.updateStatusOfKb(kbNew._id, 0);
          this.refreshKbsList = !this.refreshKbsList;
          // setTimeout(() => {
          //   this.checkStatusWithRetry(kbNew);
          // }, 2000);
        }, (err) => {
          this.logger.error("[KNOWLEDGE BASES COMP] ERROR add new kb: ", err);

          //this.onOpenErrorModal(error);
          swal({
            title: this.warningTitle,
            text: error,
            icon: "warning",
            className: "custom-swal",
            buttons: [null, this.cancel],
            dangerMode: false
          })



        }, () => {
          this.logger.log("[KNOWLEDGE BASES COMP] add new kb *COMPLETED*");
        })
      }
    }, (err) => {
      this.logger.error("[KNOWLEDGE BASES COMP] ERROR delete kb: ", err);
      kb.deleting = false;

      // this.onOpenErrorModal(error);
      swal({
        title: this.warningTitle,
        text: error,
        icon: "warning",
        className: "custom-swal",
        buttons: [null, this.cancel],
        dangerMode: false
      })

    }, () => {
      this.logger.log("[KNOWLEDGE BASES COMP] delete kb *COMPLETE*");
      kb.deleting = false;
    })
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

      // this.logger.log('Risposta ricevuta:', response);
      // if(response.status_code && response.status_code == -1){
      //   // this.logger.log('risorsa non indicizzata');
      //   // this.onRunIndexing(kb);
      //   this.checkStatusWithRetry(kb);
      // }  


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

      /**
       *    OLD STATUSES - START 
       */
      if (response.status_code == -1 || response.status_code == 0 || response.status_code == 2) {
        // this.logger.log('riprova tra 10 secondi...');
        // this.updateStatusOfKb(kb._id, response.status_code);
        // timer(20000).subscribe(() => {
        //   this.checkStatusWithRetry(kb);
        // });

        status_msg = "Indexing in progress: " + response.status_code;
        status_code = 3;
        status_label = "warning";
      } else if (response.status_code == 4) { // status == 3 || status == 4
        // this.logger.log('Risposta corretta:', response.status_code);
        status_code = 4;
        status_label = "dangerous";
        status_msg = "The resource could not be indexed " + response.status_code;
      } else {
        //status_msg = "Indicizzazione in corso stato: "+response.status_code;
      }
      /**   
       *    OLD STATUSES - END 
       */

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
    // this.logger.log('AGGIORNO updateStatusOfKb:', kb_id, status_code, kb);
  }

  private removeKb(kb_id) {
    //this.kbs = this.kbs.filter(item => item._id !== kb_id);
    this.kbsList = this.kbsList.filter(item => item._id !== kb_id);
    // this.logger.log('AGGIORNO kbsList:', this.kbsList);
    this.refreshKbsList = !this.refreshKbsList;
    // this.logger.log('AGGIORNO kbsList:', this.kbsList);
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
      "namespace": this.id_project
    }

    this.updateStatusOfKb(kb._id, 100);

    this.openaiService.startScraping(data).subscribe((response: any) => {
      this.logger.log("start scraping response: ", response);
      if (response.error) {
        this.notify.showWidgetStyleUpdateNotification(this.msgErrorIndexingKb, 4, 'report_problem');
      } else {
        this.notify.showWidgetStyleUpdateNotification(this.msgSuccesIndexingKb, 2, 'done');
        // this.checkStatusWithRetry(kb);
      }
    }, (error) => {
      this.logger.error("error start scraping response: ", error);
    }, () => {
      this.logger.log("start scraping *COMPLETE*");
    })
  }


  onReloadKbs(params) {
    params.namespace = this.selectedNamespace.id
    this.getListOfKb(params, 'onReloadKbs');
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

  onChangeInput(event, type): void {
    if (type === 'url') {
      if (this.kbFormUrl.valid) {
        this.buttonDisabled = false;
      } else {
        this.buttonDisabled = true;
      }
    } else if (type === 'text') {
      if (this.kbFormContent.valid) {
        this.buttonDisabled = false;
      } else {
        this.buttonDisabled = true;
      }
    }
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
          this.logger.error('identify Invite Sent Profile error', err);
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
          this.logger.error('track Invite Sent event error', err);
        }
        try {
          window['analytics'].group(this.id_project, {
            name: this.project_name,
            plan: this.profile_name + ' plan',
          });
        } catch (err) {
          this.logger.error('group Invite Sent error', err);
        }
      }
    }
  }

  /**
   * 
   */
  checkAllStatuses() {
    this.logger.log('[KNOWLEDGE BASES COMP] checkAllStatuses: ', this.kbsList);
    this.kbsList.forEach(kb => {
      //if(kb.status == -1){
      //   this.onRunIndexing(kb);
      //} else 
      this.updateStatusOfKb(kb._id, 3);
      // if(kb.status == -1 || kb.status == 0 || kb.status == 2) {
      //   this.checkStatusWithRetry(kb);
      // }
    });
  }



  showHideSecret(target) {
    this.gptkeyVisible = !this.gptkeyVisible;
    // let el = <HTMLInputElement>document.getElementById(target);
    // if (el.type === "password") {
    //   this.gptkeyVisible = true;
    //   el.type = "text";
    // } else {
    //   this.gptkeyVisible = false;
    //   el.type = "password"
    // }
  }







  openSecretsModal() {
    this.missingGptkeyModal = 'none';
    setTimeout(() => {
      this.secretsModal = 'block';
      // if (this.kbSettings.gptkey) {
      //   let el = <HTMLInputElement>document.getElementById('gptkey-key');
      //   el.type = "password"
      //   this.gptkeyVisible = false;
      // } else {
      //   this.gptkeyVisible = true;
      // }
    }, 600);
  }

  openMissingGptkeyModal() {
    this.missingGptkeyModal = 'block';
  }

  closeAddKnowledgeBaseModal() {
    this.addKnowledgeBaseModal = 'none';
    // this.newKb = { name: '', url: '' }
  }

  closeSecretsModal() {
    this.secretsModal = 'none';
  }

  closeMissingGptkeyModal() {
    this.missingGptkeyModal = 'none';
  }

  closeDeleteKnowledgeBaseModal() {
    this.deleteKnowledgeBaseModal = 'none';
    this.baseModalDelete = false;
  }

  // closeDeleteNamespaceModal() {
  //   this.showDeleteNamespaceModal = false;
  // }

  contactSalesForChatGptKey() {
    this.closeSecretsModal()
    window.open(`mailto:support@tiledesk.com?subject=I don't have a GPT-Key`);
  }


  // ************** DELETE **************** //
  onDeleteKnowledgeBase(kb) {
    this.onDeleteKb(kb);
    // this.baseModalDelete = false;
  }



  presentModalDefautNamespaceCannotBeDeleted() {
    Swal.fire({
      title: this.translate.instant("Warning"),
      text: this.translate.instant('KbPage.TheDefaultNamespaceCannotBeDeleted'),
      icon: "warning",
      showCloseButton: false,
      showCancelButton: false,
      confirmButtonText: 'Ok',
      confirmButtonColor: "var(--blue-light)",
      // cancelButtonColor: "var(--red-color)",
      focusConfirm: false,
      // reverseButtons: true,
    })
  }


  // ************** PREVIEW **************** //









  onOpenErrorModal(response) {
    this.errorMessage = response;
    this.baseModalError = true;
  }


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


}
