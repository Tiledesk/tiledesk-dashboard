import { Component, OnInit, AfterViewInit, HostListener, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ColorPickerService, Cmyk } from 'ngx-color-picker';
import { WidgetService } from '../../services/widget.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../core/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/Subscription';
import { Department } from '../../models/department-model';
import { DepartmentService } from '../../services/department.service';
import { NotifyService } from '../../core/notify.service';
import { WidgetSetUpBaseComponent } from './widget-set-up-base/widget-set-up-base.component';
import { AppConfigService } from '../../services/app-config.service';
import { AnalyticsService } from '../../services/analytics.service';

// import brand from 'assets/brand/brand.json';
import { BrandService } from '../../services/brand.service';
import { HumanizeDurationLanguage, HumanizeDuration } from 'humanize-duration-ts';
import { LoggerService } from '../../services/logger/logger.service';
import { UsersService } from '../../services/users.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'

const swal = require('sweetalert');

@Component({
  selector: 'appdashboard-widget-set-up',
  templateUrl: './widget-set-up.component.html',

  styleUrls: ['./widget-set-up.component.scss']
})


export class WidgetSetUp extends WidgetSetUpBaseComponent implements OnInit, AfterViewInit, OnDestroy {

  private unsubscribe$: Subject<any> = new Subject<any>();

  @ViewChild('testwidgetbtn') private elementRef: ElementRef;
  @ViewChild("multilanguage") private multilanguageRef: ElementRef;
  tparams: any;
  company_name: any;
  company_site_url: any;
  TESTSITE_BASE_URL: string;
  public_Key: string;
  _route: string;
  public primaryColor: string;
  public primaryColorRgb: any
  public primaryColorRgba: string;
  public primaryColorGradiend: string;
  public primaryColorBorder: string;
  public secondaryColor: string;
  public logoUrl: string;
  public hasOwnLogo = false;
  public id_project: string;

  default_dept: Department[];
  public widgetObj = {};
  hasSelectedLeftAlignment = false
  hasSelectedRightAlignment = true
  private fragment: string;

  private subscription: Subscription;
  ticks: any;
  start: number;
  stop: number;

  // HAS_CHANGED_WELCOME_TITLE = false;
  // HAS_CHANGED_WELCOME_MSG = false;

  HIDE_WELCOME_TITLE_SAVE_BTN = true;

  browserLang: string;
  LOGO_IS_ON: boolean;

  // calloutTimerSecondSelected = -1;
  calloutTimerSecondSelected: number;

  // preChatForm = 'preChatForm'
  // { seconds: 'immediately', value: 0 },

  calloutTitle: string;
  calloutTitleText: string;
  // _calloutTitle: string;
  escaped_calloutTitle: string;

  calloutMsg: string;
  calloutMsgText: string;
  escaped_calloutMsg: string;

  CALLOUT_IS_DISABLED: boolean;

  defaultdept_id: string;

  newInnerWidth: any;
  initInnerWidth: any;
  custom_breakpoint: boolean;
  sub: Subscription;

  showSpinner = true;
  projectName: string;

  HAS_SELECTED_GREENTINGS = false;
  HAS_SELECTED_CALLOUT = false;
  HAS_SELECTED_APPEARANCE = false;

  calloutContainerWidth: any;
  IMAGE_EXIST: boolean;

  translations: any
  selected_translation: Array<any> = []
  languages_codes: any;

  selectedLang: string;
  selectedLangCode: string;
  selectedLangName: string;
  wd_availableTranslations: Array<any> = []

  defaultLangCode: string;

  public welcomeTitle: string;
  public placeholderWelcomeTitle: string;
  public welcomeMsg: string;
  public placeholderWelcomeMsg: string;
  public onlineMsg: string; // LABEL_FIRST_MSG
  public offlineMsg: string; // LABEL_FIRST_MSG_NO_AGENTS
  public officeClosedMsg: string; // LABEL_FIRST_MSG_OPERATING_HOURS_CLOSED
  public newConversation: string // LABEL_START_NW_CONV
  public noConversation: string // NO_CONVERSATION
  public waitingTimeNotFoundMsg: string; // WAITING_TIME_NOT_FOUND
  public waitingTimeFoundMsg: string; //  WAITING_TIME_FOUND

  placeholderOnlineMsg: string;
  placeholderOfflineMsg: string;
  placeholderofficeClosedMsg: string;
  placeholderCalloutTitle: string;
  placeholderCalloutMsg: string;
  isVisible: boolean;

  callout_emoticon: string;
  calloutTitleForPreview: string;

  DISPLAY_WIDGET_HOME = true;
  DISPLAY_CALLOUT = false;
  DISPLAY_WIDGET_CHAT = false;
  DISPLAY_LAUNCER_BUTTON = false

  HAS_FOCUSED_ONLINE_MSG = false;
  HAS_FOCUSED_OFFLINE_MSG = false;
  HAS_FOCUSED_OFFICE_CLOSED_MSG = false;

  widget_home_has_conversation = false;

  C21_BODY_HOME = true
  storageBucket: string;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;
  imageUrl: string;
  currentUserId: string;


  widget_preview_selected = '0000';
  widget_preview_status = [
    { id: '0000', name: 'Home' },
    { id: '0001', name: 'Home with converations' },
    { id: '0002', name: 'Chat' },
    { id: '0003', name: 'Callout' },
    { id: '0004', name: 'Closed' }
  ];

  lang: any;
  responseAVGtime: String;

  langService: HumanizeDurationLanguage = new HumanizeDurationLanguage();
  humanizer: HumanizeDuration = new HumanizeDuration(this.langService);

  HAS_SELECT_DYMANIC_REPLY_TIME_MSG: boolean;
  HAS_SELECT_STATIC_REPLY_TIME_MSG: boolean;
  has_copied = false;
  WIDGET_URL: string;
  HAS_SELECT_INSTALL_WITH_CODE: boolean = false;
  HAS_SELECT_INSTALL_WITH_GTM: boolean = false;
  addWhiteSpaceBefore: boolean;
  current_user_name: string

  warningMsg: string;
  noDefaultLanguageIsSetUpMsg: string;
  noLanguagesAreSetUpMsg: string;
  goToMultilanguagePageMsg: string;
  goToMultilanguageSectionMsg: string;
  setDefaultLangInMultilanguageSection: string;
  toAddLanguagesToYourProjectMsg: string;
  cancelMsg: string;
  HAS_CHANGED_GREETINGS = false;

  public preChatForm: boolean;
  public nativeRating: boolean;
  public enablePrechatformFieldsCheckBox: boolean;
  public prechatFormTexareaJson: any;
  public preChatFormJson: any;
  public preChatFormCustomFieldsEnabled: boolean;
  public HAS_ACTIVATED_PRECHAT_CUSTOM_FIELDS: boolean;
  public USER_ROLE: string;

  constructor(
    private notify: NotifyService,
    public location: Location,
    private cpService: ColorPickerService,
    private widgetService: WidgetService,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private auth: AuthService,
    public translate: TranslateService,
    private departmentService: DepartmentService,
    private router: Router,
    public appConfigService: AppConfigService,
    public brandService: BrandService,
    private analyticsService: AnalyticsService,
    private logger: LoggerService,
    private usersService: UsersService,
  ) {
    super(translate);
    const brand = brandService.getBrand();

    this.tparams = brand;
    this.company_name = brand['company_name'];
    this.company_site_url = brand['company_site_url'];
  }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.getProjectUserRole();
    // this.HAS_SELECT_INSTALL_WITH_CODE = false
    this.getProfileImageStorage();
    this.getWidgetUrl();
    this.getLoggedUser();
    this.onInitWindowWidth();
    this.getCurrentProject();
    this.getBrowserLang();

    this.route.fragment.subscribe(fragment => {
      this.fragment = fragment;
      this.logger.log('[WIDGET-SET-UP] - FRAGMENT ', this.fragment)
    });

    this.translateTextBaseComp();
    // this.translateOnlineMsgSuccessNoticationMsg();
    // this.translateOfflineMsgSuccessNoticationMsg();
    // this.translateOfficeClosedSuccessNoticationMsg();
    // this.translateGetTranslationErrorMsg();
    // this.getSectionSelected();
    this.getLabels();
    this.getOSCODE();
    this.getTestSiteUrl();
    this.getAndManageAccordionInstallWidget();
    this.getAndManageAccordion();
    // this.avarageWaitingTimeCLOCK(); // as dashboard
    // this.showWaitingTime(); // as dario


    this.logger.log('[WIDGET-SET-UP] window.matchMedia ', window.matchMedia)
    this.lang = this.translate.getBrowserLang();
    this.logger.log('[WIDGET-SET-UP] LANGUAGE ', this.lang);
  }


  ngAfterViewInit(): void {
    try {
      // name of the class of the html div = . + fragment
      const test = <HTMLElement>document.querySelector('.' + this.fragment)
      // this.logger.log('»» WIDGET DESIGN - QUERY SELECTOR TEST  ', test)
      test.scrollIntoView();
      // document.querySelector('#' + this.fragment).scrollIntoView();
      // this.logger.log( document.querySelector('#' + this.fragment).scrollIntoView())
    } catch (e) {
      // this.logger.log('»» WIDGET DESIGN - QUERY SELECTOR ERROR  ', e)
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


  // il testo della modale '"Non è impostata nessuna lingua predefinita' e dato che potrebbe essere visualizzata 
  // all'init della pagina nn può stare nel base compo


  // scroll to multilanguage section
  scroll(el: HTMLElement) {
    el.scrollIntoView();
    var acc = document.getElementsByClassName("widget-section-accordion");
    // this.logger.log('[WIDGET-SET-UP] ACCORDION', acc);
    var i;
    for (i = 0; i < acc.length; i++) {
      var lastAccordion = acc[5];
      var lastPanel = <HTMLElement>lastAccordion.nextElementSibling;
      lastAccordion.classList.add("active");
      lastPanel.style.maxHeight = lastPanel.scrollHeight + "px";
      var arrow_icon_div = lastAccordion.children[1];
      var arrow_icon = arrow_icon_div.children[0]
      arrow_icon.classList.add("arrow-up");
    }
  }

  getWidgetUrl() {
    this.WIDGET_URL = this.appConfigService.getConfig().widgetUrl;
    this.logger.log('[WIDGET-SET-UP] getAppConfig WIDGET_URL ', this.WIDGET_URL)

  }



  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.newInnerWidth = event.target.innerWidth;
    this.logger.log('[WIDGET-SET-UP] - NEW INNER WIDTH ', this.newInnerWidth);

    if (this.newInnerWidth <= 668) {
      this.logger.log('[WIDGET-SET-UP] - NEW INNER WIDTH ', this.newInnerWidth);

      // let innerWidthLess368 = this.newInnerWidth - 368
      // this.calloutContainerWidth =  innerWidthLess368 += 'px'

      this.custom_breakpoint = true;
    } else {
      this.custom_breakpoint = false;
    }

    // ---------------------------------
    // New - small sidebar @media < 1200 
    // ---------------------------------

  }

  onInitWindowWidth(): any {
    this.initInnerWidth = window.innerWidth;
    this.logger.log('[WIDGET-SET-UP] - INIT WIDTH ', this.initInnerWidth);
    if (this.newInnerWidth <= 668) {
      this.logger.log('[WIDGET-SET-UP] - NEW INNER WIDTH ', this.newInnerWidth);
      this.custom_breakpoint = true;
    } else {
      this.custom_breakpoint = false;
    }
  }

  onChangeWidgetPreview(previewselected) {
    this.logger.log('[WIDGET-SET-UP] - PREVIEW SELECTED ', previewselected);

    if (previewselected === '0001') {
      this.DISPLAY_WIDGET_HOME = true;
      this.DISPLAY_LAUNCER_BUTTON = false;
      this.DISPLAY_WIDGET_CHAT = false;
      this.DISPLAY_CALLOUT = false;
      this.C21_BODY_HOME = false;
    } else if (previewselected === '0000') {
      this.DISPLAY_WIDGET_HOME = true;
      this.DISPLAY_LAUNCER_BUTTON = false;
      this.DISPLAY_WIDGET_CHAT = false;
      this.DISPLAY_CALLOUT = false;
      this.C21_BODY_HOME = true;
    } else if (previewselected === '0004') {
      this.DISPLAY_WIDGET_HOME = true;
      this.DISPLAY_LAUNCER_BUTTON = true
      this.DISPLAY_WIDGET_CHAT = false;
      this.DISPLAY_CALLOUT = false;

    }

    if (previewselected === '0002') {
      this.DISPLAY_WIDGET_CHAT = true;
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = false;
      this.HAS_FOCUSED_ONLINE_MSG = true;
      this.HAS_FOCUSED_OFFLINE_MSG = false;
      this.HAS_FOCUSED_OFFICE_CLOSED_MSG = false;

    }

    if (previewselected === '0003') {
      this.DISPLAY_WIDGET_CHAT = false;
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = true;
    }

  }

  getProfileImageStorage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.imageUrl = firebase_conf['storageBucket'];

      this.logger.log('[WIDGET-SET-UP] IMAGE STORAGE ', this.imageUrl, 'usecase firebase')
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.imageUrl = this.appConfigService.getConfig().SERVER_BASE_URL;
      this.logger.log('[WIDGET-SET-UP] IMAGE STORAGE ', this.imageUrl, 'usecase native')

    }

  }

  getProjectUserRole() {
    // const user___role =  this.usersService.project_user_role_bs.value;
    // this.logger.log('[NAVBAR] % »»» WebSocketJs WF +++++ ws-requests--- navbar - USER ROLE 1 ', user___role);
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user_role) => {
        this.logger.log('[NAVBAR] % »»» WebSocketJs WF +++++ ws-requests--- navbar - USER ROLE 2', user_role);
        if (user_role) {
          this.USER_ROLE = user_role

        }
      });
  }

  getLoggedUser() {
    this.auth.user_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user) => {
        this.logger.log('[WIDGET-SET-UP] USER GET IN »» WIDGET DESIGN ', user)
        if (user) {
          this.current_user_name = user.firstname + ' ' + user.lastname
          this.currentUserId = user._id;
          this.logger.log('[WIDGET-SET-UP] Current USER ID ', this.currentUserId)
        }
      });
  }

  selectSidebar() {
    const elemAppSidebar = <HTMLElement>document.querySelector('app-sidebar');
    this.logger.log('[WIDGET-SET-UP]  elemAppSidebar ', elemAppSidebar)
    elemAppSidebar.setAttribute('style', 'display:none;');

    const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    this.logger.log('[WIDGET-SET-UP] elemMainPanel ', elemMainPanel)
    elemMainPanel.setAttribute('style', 'width:100% !important; overflow-x: hidden !important;');
  }

  getAndManageAccordionInstallWidget() {
    var acc = document.getElementsByClassName("accordion-install-widget");

    this.logger.log('[WIDGET-SET-UP] ACCORDION INSTALL WIDGET', acc);

    var i: number;
    for (i = 0; i < acc.length; i++) {
      this.logger.log('[WIDGET-SET-UP] ACCORDION ARROW - INSTALL WIDGET - QUI ENTRO');
      this.logger.log('[WIDGET-SET-UP] ACCORDION ARROW - INSTALL WIDGET - acc[i]', acc[i]);

      const self = this;

      acc[i].addEventListener("click", function () {

        this.classList.toggle("active-install-widget");

        var panel = this.nextElementSibling;
        // this.logger.log('WIDGET DESIGN ACCORDION ARROW - INSTALL WIDGET - panel', panel);

        var arrow_icon_div = this.children[1];
        self.logger.log('[WIDGET-SET-UP] ACCORDION ARROW - INSTALL WIDGET - ICON WRAP DIV', arrow_icon_div);

        var arrow_icon = arrow_icon_div.children[0]
        self.logger.log('[WIDGET-SET-UP] ACCORDION ARROW ICON', arrow_icon);
        arrow_icon.classList.toggle("arrow-up-install-widget");

        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;

        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    }
  }

  copyToClipboard() {
    document.querySelector('textarea').select();
    document.execCommand('copy');

    this.has_copied = true;
    setTimeout(() => {
      this.has_copied = false;
    }, 2000);
  }

  close_panel_install_widget() {
    this.HAS_SELECT_INSTALL_WITH_CODE = false;
    this.HAS_SELECT_INSTALL_WITH_GTM = false
    this.logger.log('[WIDGET-SET-UP] close_panel_install_widget HAS_SELECT_INSTALL_WITH_CODE', this.HAS_SELECT_INSTALL_WITH_CODE)

  }

  installWithCode() {
    // this.HAS_SELECT_INSTALL_WITH_CODE = true;
    // this.HAS_SELECT_INSTALL_WITH_GTM = false;
    this.HAS_SELECT_INSTALL_WITH_GTM = false;
    if (this.HAS_SELECT_INSTALL_WITH_CODE === false) {
      this.HAS_SELECT_INSTALL_WITH_CODE = true;
    } else if (this.HAS_SELECT_INSTALL_WITH_CODE === true) {
      this.HAS_SELECT_INSTALL_WITH_CODE = false;
    }

    this.logger.log('[WIDGET-SET-UP] installWithCode HAS_SELECT_INSTALL_WITH_CODE', this.HAS_SELECT_INSTALL_WITH_CODE)
  }

  installWithGTM() {
    // this.HAS_SELECT_INSTALL_WITH_CODE = false;
    // this.HAS_SELECT_INSTALL_WITH_GTM = true;
    this.HAS_SELECT_INSTALL_WITH_CODE = false;
    if (this.HAS_SELECT_INSTALL_WITH_GTM === false) {
      this.HAS_SELECT_INSTALL_WITH_GTM = true;
    } else if (this.HAS_SELECT_INSTALL_WITH_GTM === true) {
      this.HAS_SELECT_INSTALL_WITH_GTM = false;
    }

    this.logger.log('[WIDGET-SET-UP] installWithCode HAS_SELECT_INSTALL_WITH_GTM', this.HAS_SELECT_INSTALL_WITH_GTM)
  }


  getAndManageAccordion() {
    var acc = document.getElementsByClassName("widget-section-accordion");
    // this.logger.log('[WIDGET-SET-UP] ACCORDION', acc);
    var i: number;
    for (i = 0; i < acc.length; i++) {
      this.logger.log('[WIDGET-SET-UP] ACCORDION i', i, 'acc[i]', acc[i]);
      // Open the first accordion https://codepen.io/fpavision/details/xxxONGv
      var firstAccordion = acc[0];
      var firstPanel = <HTMLElement>firstAccordion.nextElementSibling;
      // this.logger.log('WIDGET DESIGN ACCORDION FIRST PANEL', firstPanel);

      firstAccordion.classList.add("active");
      firstPanel.style.maxHeight = firstPanel.scrollHeight + "px";

      var arrow_icon_div = firstAccordion.children[1];
      // this.logger.log('[WIDGET-SET-UP] ACCORDION ARROW ICON WRAP DIV', arrow_icon_div);

      var arrow_icon = arrow_icon_div.children[0]
      // this.logger.log('[WIDGET-SET-UP] ACCORDION ARROW ICON', arrow_icon);
      arrow_icon.classList.add("arrow-up");
      const self = this
      acc[i].addEventListener("click", function () {
        self.logger.log('[WIDGET-SET-UP] ACCORDION click i', i, 'acc[i]', acc[i]);
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        self.logger.log('[WIDGET-SET-UP] ACCORDION PANEL', panel);

        var arrow_icon_div = this.children[1];
        // this.logger.log('[WIDGET-SET-UP] ACCORDION ARROW ICON WRAP DIV', arrow_icon_div);

        var arrow_icon = arrow_icon_div.children[0]
        // this.logger.log('[WIDGET-SET-UP] ACCORDION ARROW ICON', arrow_icon);
        arrow_icon.classList.toggle("arrow-up");

        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;
          self.HAS_ACTIVATED_PRECHAT_CUSTOM_FIELDS = false
        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    }
  }


  getTestSiteUrl() {
    this.TESTSITE_BASE_URL = this.appConfigService.getConfig().testsiteBaseUrl;
    this.logger.log('[WIDGET-SET-UP] getAppConfig [WIDGET-SET-UP] TESTSITE_BASE_URL', this.TESTSITE_BASE_URL);
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    this.logger.log('[WIDGET-SET-UP] getAppConfig  public_Key', this.public_Key);

    let keys = this.public_Key.split("-");
    this.logger.log('[WIDGET-SET-UP] PUBLIC-KEY keys', keys)
    keys.forEach(key => {
      // this.logger.log('NavbarComponent public_Key key', key)
      if (key.includes("MTL")) {
        // this.logger.log('PUBLIC-KEY (Widget-design) - mlt', key);
        let mlt = key.split(":");
        // this.logger.log('PUBLIC-KEY (Widget-design) - mlt key&value', mlt);
        if (mlt[1] === "F") {
          this.isVisible = false;
        } else {
          this.isVisible = true;
        }
      }
    });
  }

  getLabels() {
    this.widgetService.getLabels().subscribe((labels: any) => {
      this.logger.log('[WIDGET-SET-UP] - GET LABELS - RES', labels);

      if (labels && Object.keys(labels).length > 0) {

        this.translations = labels['data']

        this.logger.log('[WIDGET-SET-UP] - GET LABELS - RES > TRANSLATIONS ', this.translations);

        this.languages_codes = [];

        this.translations.forEach(translation => {
          this.logger.log('[WIDGET-SET-UP] - GET LABELS - RES >>> TRANSLATION ', translation);
          if (translation) {


            // if 'translation' has an _id is executed the push of the language code in the array languages_codes
            if (translation._id !== undefined) {
              this.languages_codes.push(translation.lang.toLowerCase())
            }

            // IF DEFAULT LANGUAGE IS TRUE
            if (translation.default === true) {
              this.defaultLangCode = translation.lang.toLowerCase()
              this.logger.log('[WIDGET-SET-UP] - GET LABELS ***** defaultLangCode (onInit) ', this.defaultLangCode);
            } else {
              this.logger.log('[WIDGET-SET-UP] - GET LABELS ***** No default Lang *****  ', translation);
              // this.translateAndDisplayModalNoDefaultLangIsSet()
            }

          }
        });


        this.logger.log('[WIDGET-SET-UP] - GET LABELS - defaultLangCode (onInit) 2', this.defaultLangCode);

        if (this.defaultLangCode === undefined) {
          this.translateAndDisplayModalNoDefaultLangIsSet();
        }

        this.logger.log('[WIDGET-SET-UP] - GET LABELS - Array of LANG CODE ', this.languages_codes);


        // const availableTranslations = [{ code: "it", name: "Italian" }, { code: "fr", name: "French" }, { code: "en", name: "English" }];
        const availableTranslations = this.doAvailableLanguageArray(this.languages_codes);
        this.logger.log('[WIDGET-SET-UP] - GET LABELS - availableTranslations ', availableTranslations);

        if (availableTranslations && availableTranslations.length > 0) {
          // IN THE SELECT LANGUAGE COMBO DISPLAY AS SELECTED THE FIRST LANGUAGE IN ALPHABETICAL ORDER
          this.wd_availableTranslations = availableTranslations.sort(this.compare);
          this.logger.log('[WIDGET-SET-UP] - GET LABELS -  ordered wd_availableTranslations', this.wd_availableTranslations);

          if (this.wd_availableTranslations && this.wd_availableTranslations[0]) {
            this.selectedLang = this.wd_availableTranslations[0].name;
            this.selectedLangCode = this.wd_availableTranslations[0].code;
            this.selectedLangName = this.wd_availableTranslations[0].name;
          }

          this.logger.log('[WIDGET-SET-UP] - GET LABELS - selectedLangCode ', this.selectedLangCode);

          this.getCurrentTranslation(this.selectedLangCode);

        } else {

          // there are labels but none assigned to the project
          this.translateAndDisplayModalNoLangAreSet();
        }
      } else {

        // labels are null
        this.translateAndDisplayModalNoLangAreSet();
      }

    }, error => {
      this.logger.error('[WIDGET-SET-UP] - GET LABELS - ERROR ', error)
    }, () => {
      this.logger.log('[WIDGET-SET-UP] - GET LABELS * COMPLETE *')
    });
  }

  translateAndDisplayModalNoDefaultLangIsSet() {
    this.translate.get('NoDefaultLanguage')
      .subscribe((text: any) => {
        this.warningMsg = text['Warning'];
        this.noDefaultLanguageIsSetUpMsg = text['NoDefaultLanguageIsSetUp'];
        this.goToMultilanguagePageMsg = text['GoToMultilanguagePage'];
        this.toAddLanguagesToYourProjectMsg = text['toAddLanguagesToYourProject'];
        this.cancelMsg = text['Cancel'];
        this.noLanguagesAreSetUpMsg = text['NoLanguagesAreSetUp'];
        this.setDefaultLangInMultilanguageSection = text['SetYourDefaultLanguageInTheMultilanguageSection'];
        this.goToMultilanguageSectionMsg = text['GoToMultilanguageSection'];
        // this.noDefaultLanguageIsSetUpMsg = text;
        // this.logger.log('WIDGET DESIGN - translateNoDefaultLanguageIsSetUp warningMsg', this.warningMsg);
        // this.logger.log('WIDGET DESIGN - translateNoDefaultLanguageIsSetUp noDefaultLanguageIsSetUpMsg', this.noDefaultLanguageIsSetUpMsg)
      }, (error) => {
        this.logger.error('[WIDGET-SET-UP] - translateNoDefaultLanguageIsSetUp - ERROR ', error);
      }, () => {
        // this.logger.log('WIDGET DESIGN - translateNoDefaultLanguageIsSetUp * COMPLETE *');

        this.displayModalNoDefaultLangIsSetUp()
      });

  }

  displayModalNoDefaultLangIsSetUp() {
    // const el = document.createElement('div');
    // const url = '#/project/' + this.id_project + '/widget-set-up'
    // el.innerHTML = `${this.noDefaultLanguageIsSetUpMsg} <a href="${url}"> ${this.goToMultilanguagePageMsg}</a>  ${this.toAddLanguagesToYourProjectMsg}</a>`
    swal({
      title: this.warningMsg,
      text: this.noDefaultLanguageIsSetUpMsg + '. ' + this.setDefaultLangInMultilanguageSection,
      // content: el,
      icon: "warning",
      buttons: {
        cancel: `${this.cancelMsg}`,
        catch: {
          text: `${this.goToMultilanguageSectionMsg}`,
          value: "catch",
        },
      },

      // `"Cancel", ${this.goToMultilanguagePageMsg}`],
      dangerMode: false,
    })
      .then((value) => {
        this.logger.log('[WIDGET-SET-UP] - displayModalNoDefaultLangAreSetUp value', value)

        if (value === 'catch') {
          this.scrollToMultilanguageSection()
        }
      })
  }


  scrollToMultilanguageSection() {
    this.multilanguageRef.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });

    var acc = document.getElementsByClassName("widget-section-accordion");
    // this.logger.log('WIDGET DESIGN ACCORDION', acc);
    var i: number;
    for (i = 0; i < acc.length; i++) {
      var lastAccordion = acc[5];
      var lastPanel = <HTMLElement>lastAccordion.nextElementSibling;
      lastAccordion.classList.add("active");
      lastPanel.style.maxHeight = lastPanel.scrollHeight + "px";
      var arrow_icon_div = lastAccordion.children[1];
      var arrow_icon = arrow_icon_div.children[0]
      arrow_icon.classList.add("arrow-up");
    }

  }


  translateAndDisplayModalNoLangAreSet() {
    this.translate.get('NoDefaultLanguage')
      .subscribe((text: any) => {
        this.warningMsg = text['Warning'];
        this.noDefaultLanguageIsSetUpMsg = text['NoDefaultLanguageIsSetUp'];
        this.goToMultilanguagePageMsg = text['GoToMultilanguagePage'];
        this.toAddLanguagesToYourProjectMsg = text['toAddLanguagesToYourProject'];
        this.cancelMsg = text['Cancel'];
        this.noLanguagesAreSetUpMsg = text['NoLanguagesAreSetUp'];
        // this.noDefaultLanguageIsSetUpMsg = text;
        // this.logger.log('WIDGET DESIGN - translateNoDefaultLanguageIsSetUp warningMsg', this.warningMsg);
        // this.logger.log('WIDGET DESIGN - translateNoDefaultLanguageIsSetUp noDefaultLanguageIsSetUpMsg', this.noDefaultLanguageIsSetUpMsg)
      }, (error) => {
        this.logger.error('[WIDGET-SET-UP] - translateNoDefaultLanguageIsSetUp - ERROR ', error);
      }, () => {
        // this.logger.log('WIDGET DESIGN - translateNoDefaultLanguageIsSetUp * COMPLETE *');

        this.displayModalNoLangAreSetUp()
      });
  }

  displayModalNoLangAreSetUp() {
    // const el = document.createElement('div');
    // const url = '#/project/' + this.id_project + '/widget-set-up'
    // el.innerHTML = `${this.noDefaultLanguageIsSetUpMsg} <a href="${url}"> ${this.goToMultilanguagePageMsg}</a>  ${this.toAddLanguagesToYourProjectMsg}</a>`
    swal({
      title: this.warningMsg,
      text: this.noLanguagesAreSetUpMsg + '. ' + this.goToMultilanguagePageMsg + ' ' + this.toAddLanguagesToYourProjectMsg + '.',
      // content: el,
      icon: "warning",
      buttons: {
        cancel: `${this.cancelMsg}`,
        catch: {
          text: `${this.goToMultilanguagePageMsg}`,
          value: "catch",
        },
      },

      // `"Cancel", ${this.goToMultilanguagePageMsg}`],
      dangerMode: false,
    })
      .then((value) => {
        this.logger.log('displayModalNoLangAreSetUp value', value)

        if (value === 'catch') {
          this.goToWidgetMultilanguage()
        }
      })
  }

  getCurrentTranslation(selectedLangCode: string) {
    this.logger.log('[WIDGET-SET-UP] init getCurrentTranslation ')
    this.translations.forEach(translation => {
      if (translation.lang.toLowerCase() === selectedLangCode) {

        this.selected_translation = translation.data
        this.logger.log('[WIDGET-SET-UP] ***** selected translation: ', this.selected_translation)

        // ---------------------------------------------------------------------------------------------
        // @ New Conversation (not editable in the widhet setting page but only from multilanguage page)
        // ---------------------------------------------------------------------------------------------
        this.newConversation = this.selected_translation["LABEL_START_NW_CONV"];
        this.logger.log('[WIDGET-SET-UP] ***** selected translation - newConversation: ', this.newConversation);

        // --------------------------------------------------------------------------------------------
        // @ No Conversation (not editable in the widhet setting page but only from multilanguage page)
        // --------------------------------------------------------------------------------------------
        this.noConversation = this.selected_translation["NO_CONVERSATION"];

        // ---------------------------------------------------------------
        // @ Welcome title and company intro
        // ---------------------------------------------------------------
        this.welcomeTitle = this.selected_translation["WELLCOME_TITLE"];
        this.welcomeMsg = this.selected_translation["WELLCOME_MSG"];
        this.logger.log('[WIDGET-SET-UP] ***** selected translation - WELLCOME_TITLE: ', this.welcomeTitle, ' - WELLCOME_MSG: ', this.welcomeMsg);


        // ---------------------------------------------------------------
        // @ Callout title, msg and emoji
        // ---------------------------------------------------------------
        this.calloutTitle = this.selected_translation["CALLOUT_TITLE_PLACEHOLDER"];
        // this.calloutTitleForPreview =  this.calloutTitle.trim();
        this.checkIsEmoji(this.calloutTitle.trim());
        this.logger.log('[WIDGET-SET-UP] - checkIsEmoji calloutTitleForPreview (on getCurrentTranslation)', this.calloutTitleForPreview);

        this.calloutMsg = this.selected_translation["CALLOUT_MSG_PLACEHOLDER"];
        this.logger.log('[WIDGET-SET-UP] ***** selected translation CALLOUT_TITLE_PLACEHOLDER: ', this.calloutTitle, ' - CALLOUT_MSG: ', this.calloutMsg);

        // ---------------------------------------------------------------
        // @ Online & offline msgs
        // ---------------------------------------------------------------
        this.onlineMsg = this.selected_translation["LABEL_FIRST_MSG"];
        this.offlineMsg = this.selected_translation["LABEL_FIRST_MSG_NO_AGENTS"];
        this.logger.log('[WIDGET-SET-UP] ***** selected translation ONLINE MSG : ', this.onlineMsg, ' - OFFLINE MSG: ', this.offlineMsg);

        // ---------------------------------------------------------------
        // @ Office closed msgs
        // ---------------------------------------------------------------
        this.officeClosedMsg = this.selected_translation["LABEL_FIRST_MSG_OPERATING_HOURS_CLOSED"];

        // -----------------------------------------------------------------------------------------------------------------------
        // @ waitingTimeNotFoundMsg & waitingTimeFoundMsg are displayed in widget preview when the variable C21_BODY_HOME is false 
        // this to simulate the presence of at least one conversation
        // -----------------------------------------------------------------------------------------------------------------------
        this.waitingTimeNotFoundMsg = this.selected_translation["WAITING_TIME_NOT_FOUND"];

        this.logger.log('[WIDGET-SET-UP] - ***** ["WAITING_TIME_FOUND"] contains $reply_time ', this.selected_translation["WAITING_TIME_FOUND"].includes("$reply_time"));

        // -------------------------------------------------------------------------------------------------------
        // @ for new projects $ reply_time is set by the server so it does not need to be added on the client side
        // ------------------------------------------------------------------------------------------------------- 
        // if (this.selected_translation["WAITING_TIME_FOUND"].includes("$reply_time") === false) {
        //   var hasSpaceAtEnds = this.selected_translation["WAITING_TIME_FOUND"].slice(-1);

        //   if (hasSpaceAtEnds == " ") {
        //     this.logger.log("Multilanguage (widget-design) WAITING_TIME_FOUND ends with space");
        //     this.waitingTimeFoundMsg = this.selected_translation["WAITING_TIME_FOUND"] + '$reply_time';
        //   } else {
        //     this.logger.log("Multilanguage (widget-design) WAITING_TIME_FOUND not ends with space");
        //     this.waitingTimeFoundMsg = this.selected_translation["WAITING_TIME_FOUND"] + ' ' + '$reply_time';
        //   }
        // } else {
        //   this.waitingTimeFoundMsg = this.selected_translation["WAITING_TIME_FOUND"]
        // }
        this.waitingTimeFoundMsg = this.selected_translation["WAITING_TIME_FOUND"]
        this.logger.log('[WIDGET-SET-UP] - ***** selected translation waitingTimeNotFoundMsg: ', this.waitingTimeNotFoundMsg);
        this.logger.log('[WIDGET-SET-UP] - ***** selected translation waitingTimeFoundMsg: ', this.waitingTimeFoundMsg);
      }
    });
  }

  makeDefaultLanguage(languageCode) {
    this.logger.log('[WIDGET-SET-UP] - MAKE DAFAULT LANG - languageCode: ', languageCode);

    this.widgetService.setDefaultLanguage(languageCode).subscribe((translation: any) => {
      this.logger.log('[WIDGET-SET-UP] - MAKE DAFAULT LANG - RES ', translation);

      if (translation.default === true) {
        this.defaultLangCode = translation.lang.toLowerCase()
        this.logger.log('[WIDGET-SET-UP] - MAKE DAFAULT LANG - defaultLangCode (makeDefaultLanguage) ', this.defaultLangCode);
      }
    }, error => {
      this.logger.error('[WIDGET-SET-UP] - MAKE DAFAULT LANG - ERROR ', error);
    }, () => {
      this.logger.log('[WIDGET-SET-UP] - MAKE DAFAULT LANG ***** * COMPLETE *');

      // this.getLabels()

    });
  }

  welcomeTitleChange(event) {
    this.welcomeTitle = event;
    this.logger.log('[WIDGET-SET-UP] - WELCOME TITLE CHANGE: ', this.welcomeTitle);
    this.HAS_CHANGED_GREETINGS = true;
    // if (event.length === 0) {    }
  }

  welcomeMsgChange(event) {
    this.welcomeMsg = event;
    this.logger.log('[WIDGET-SET-UP] - WELCOME MSG CHANGE: ', this.welcomeMsg);
    this.HAS_CHANGED_GREETINGS = true;
    // if (event.length === 0) {  }
  }

  onChangeOnlineMsg(event) {
    this.onlineMsg = event;
    this.logger.log('[WIDGET-SET-UP] - ONLINE MSG CHANGE: ', this.onlineMsg);
    this.HAS_CHANGED_GREETINGS = true;
    // if (event.length === 0) {  }
  }

  onChangeOfflineMsg(event) {
    this.offlineMsg = event;
    this.logger.log('[WIDGET-SET-UP] - OFFLINE MSG CHANGE: ', this.offlineMsg);
    this.HAS_CHANGED_GREETINGS = true;
    // if (event.length === 0 || event) {  }
  }

  onChangeOfficeClosedMsg(event) {
    this.officeClosedMsg = event;
    this.logger.log('[WIDGET-SET-UP] - OFFICE CLOSED MSG CHANGE: ', this.officeClosedMsg);
    this.HAS_CHANGED_GREETINGS = true;
    // if (event.length === 0 || event) {  }
  }


  onChangeReplyTimeTypeMsg(value) {
    this.logger.log('[WIDGET-SET-UP] - ON CHANGE REPLY TIME TYPE MSG : ', value);

    this.DISPLAY_WIDGET_HOME = true;
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_CHAT = false;
    this.widget_preview_selected = "0000"

    if (value === 'reply_time_dynamic_msg') {
      this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG = true;
      this.HAS_SELECT_STATIC_REPLY_TIME_MSG = false;
      this.logger.log('[WIDGET-SET-UP] - HAS_SELECT_DYMANIC_REPLY_TIME_MSG : ', this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG);

      // this.widgetObj['dynamicWaitTimeReply'] = this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG;
      // this.widgetService.updateWidgetProject(this.widgetObj)

    }
    if (value === 'reply_time_fixed_msg') {
      this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG = false;
      this.HAS_SELECT_STATIC_REPLY_TIME_MSG = true;

      this.logger.log('[WIDGET-SET-UP] - HAS_SELECT_DYMANIC_REPLY_TIME_MSG : ', this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG);
    }

  }

  saveReplyTime() {
    this.HAS_CHANGED_GREETINGS = false;
    const save_replytime_btn = <HTMLElement>document.querySelector('.save_replytime_btn');
    this.logger.log('[WIDGET-SET-UP]) - save_replytime_btn: ', save_replytime_btn);
    if (save_replytime_btn) {
      save_replytime_btn.blur()
    }

    this.widgetObj['dynamicWaitTimeReply'] = this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG;
    this.widgetService.updateWidgetProject(this.widgetObj)
  }

  setReplyTimePlaceholder() {
    const elInput = <HTMLElement>document.querySelector('.waiting-time-found-msg-input');
    this.logger.log('[WIDGET-SET-UP] - setReplyTimePlaceholder INPUT ELEM: ', elInput);
    this.insertAtCursor(elInput, '$reply_time')
  }

  waitingTimeNotFoundMsgChange(event) {
    this.waitingTimeNotFoundMsg = event;
    this.logger.log('[WIDGET-SET-UP] - WAITING TIME NOT FOUND CHANGE: ', this.waitingTimeFoundMsg);
  }

  waitingTimeFoundMsgChange(event) {
    this.waitingTimeFoundMsg = event;
    this.logger.log('[WIDGET-SET-UP] - WAITING TIME FOUND CHANGE: ', this.waitingTimeFoundMsg);

    if (/\s$/.test(event)) {

      this.logger.log('[WIDGET-SET-UP] - WAITING TIME FOUND CHANGE - string contains space at last');
      this.addWhiteSpaceBefore = false;
    } else {

      this.logger.log('[WIDGET-SET-UP] - WAITING TIME FOUND CHANGE - string does not contain space at last');

      // IS USED TO ADD A WHITE SPACE TO THE 'PERSONALIZATION' VALUE IF THE STRING DOES NOT CONTAIN SPACE AT LAST
      this.addWhiteSpaceBefore = true;
    }
  }

  insertAtCursor(myField, myValue) {
    this.logger.log('[WIDGET-SET-UP] - insertAtCursor - myValue ', myValue);

    //IE support
    if (myField.selection) {
      myField.focus();
      let sel = myField.selection.createRange();
      sel.text = myValue;
      // this.cannedResponseMessage = sel.text;
    }
    //MOZILLA and others
    else if (myField.selectionStart || myField.selectionStart == '0') {
      var startPos = myField.selectionStart;
      this.logger.log('[WIDGET-SET-UP] - insertAtCursor - startPos ', startPos);

      var endPos = myField.selectionEnd;
      this.logger.log('[WIDGET-SET-UP] - insertAtCursor - endPos ', endPos);

      myField.value = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length);

      // place cursor at end of text in text input element
      myField.focus();
      var val = myField.value; //store the value of the element
      myField.value = ''; //clear the value of the element
      myField.value = val + ' '; //set that value back. 

      this.waitingTimeFoundMsg = myField.value;

      // this.texareaIsEmpty = false;
      // myField.select();
    } else {
      myField.value += myValue;
      this.waitingTimeFoundMsg = myField.value;
    }
  }


  calloutTitleChange(event) {
    this.calloutTitle = event;
    this.logger.log('[WIDGET-SET-UP] - CALLOUT TITLE CHANGE: ', this.calloutTitle);
    // if (event.length === 0) {   }
    this.checkIsEmoji(this.calloutTitle.trim())
  }


  checkIsEmoji(calloutTitle) {
    this.calloutTitleForPreview = calloutTitle;
    this.callout_emoticon = null;
    const emojiRegex = require('emoji-regex');

    const regex = emojiRegex();
    let match;
    while (match = regex.exec(this.calloutTitleForPreview)) {
      const emoji = match[0];
      this.logger.log(`[WIDGET-SET-UP] checkIsEmoji emoji ${emoji} — code points: ${[emoji].length}`);

      this.logger.log(`[WIDGET-SET-UP] checkIsEmoji emoji: ${emoji} — position: `, this.calloutTitleForPreview.indexOf(emoji));

      if (this.calloutTitleForPreview.indexOf(emoji) === 0) {

        let cutCalloutTitle = this.calloutTitleForPreview.replace(emoji, "");
        this.logger.log(`[WIDGET-SET-UP] checkIsEmoji emoji ${emoji} —  at position 0: `, emoji);

        this.logger.log(`[WIDGET-SET-UP] checkIsEmoji — CUTTED CalloutTitle: `, cutCalloutTitle);

        this.callout_emoticon = emoji;
        this.calloutTitleForPreview = cutCalloutTitle;

      }

    }
  }


  calloutMsgChange(event) {
    this.calloutMsg = event
    this.logger.log('[WIDGET-SET-UP] - CALLOUT MSG CHANGE: ', this.calloutMsg);
    // if (event.length === 0) {  }
  }



  // ------------------------------------------------------------------------------------
  // Select language
  // ------------------------------------------------------------------------------------
  onSelectlang(selectedLang) {
    this.logger.log('[WIDGET-SET-UP] onSelectlang selectedLang ', selectedLang);
    this.selectedLangCode = selectedLang.code;
    this.logger.log('[WIDGET-SET-UP] - GET LABELS - onSelectlang (onSelectlang) ', this.selectedLangCode);
    this.selectedLangName = selectedLang.name;
    if (selectedLang) {
      this.getCurrentTranslation(selectedLang.code);
    }

  }

  // ------------------------------------------------------------------------------------
  // Save translation
  // ------------------------------------------------------------------------------------
  saveTranslation() {
    const save_online_offline_msgs = <HTMLElement>document.querySelector('.save_online_offline_msgs');

    if (save_online_offline_msgs) {
      save_online_offline_msgs.blur()
    }

    this.selected_translation["WELLCOME_TITLE"] = this.welcomeTitle;
    this.selected_translation["WELLCOME_MSG"] = this.welcomeMsg;
    this.selected_translation["CALLOUT_TITLE_PLACEHOLDER"] = this.calloutTitle;
    this.selected_translation["CALLOUT_MSG_PLACEHOLDER"] = this.calloutMsg;
    this.selected_translation["LABEL_FIRST_MSG"] = this.onlineMsg;
    this.selected_translation["LABEL_FIRST_MSG_NO_AGENTS"] = this.offlineMsg;
    this.selected_translation["LABEL_FIRST_MSG_OPERATING_HOURS_CLOSED"] = this.officeClosedMsg;
    this.selected_translation["WAITING_TIME_NOT_FOUND"] = this.waitingTimeNotFoundMsg;
    this.selected_translation["WAITING_TIME_FOUND"] = this.waitingTimeFoundMsg;


    this.logger.log('[WIDGET-SET-UP] - saveTranslation: ', this.selected_translation);

    this.saveLabels()

  }

  saveLabels() {
    this.logger.log('[WIDGET-SET-UP] - selectedLangCode (saveLabels) ', this.selectedLangCode);
    this.logger.log('[WIDGET-SET-UP] - defaultLangCode (saveLabels) ', this.defaultLangCode);

    let isdefault = null

    if (this.selectedLangCode === this.defaultLangCode) {
      isdefault = true
    } else {
      isdefault = false
    }


    this.widgetService.editLabels(this.selectedLangCode.toUpperCase(), isdefault, this.selected_translation)
      .subscribe((labels: any) => {
        this.logger.log('[WIDGET-SET-UP] - saveTranslation RES ', labels);

      }, error => {
        this.logger.error('[WIDGET-SET-UP] - saveTranslation - ERROR ', error)
      }, () => {

        if (this.HAS_CHANGED_GREETINGS === true) {
          this.notify.showWidgetStyleUpdateNotification(this.updateWidgetSuccessNoticationMsg, 2, 'done');
        }
        this.logger.log('[WIDGET-SET-UP] - saveTranslation * COMPLETE *')
      });
  }


  getBrowserLang() {
    this.browserLang = this.translate.getBrowserLang();
    this.logger.log('[WIDGET-SET-UP] - BROWSER LANG ', this.browserLang)
  }

  getCurrentProject() {
    this.sub = this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.id_project = project._id
        this.projectName = project.name;
        this.logger.log('[WIDGET-SET-UP] - SUBSCRIBE TO CURRENT - PRJCT-ID ', this.id_project)

        if (this.id_project) {
          this.getProjectById();
        }
      }
    });
  }


  getProjectById() {
    this.projectService.getProjectById(this.id_project).subscribe((project: any) => {
      // this.logger.log('WIDGET DESIGN - GET PROJECT BY ID - PROJECT OBJECT: ', project);

      this.logger.log('[WIDGET-SET-UP] - PRJCT-WIDGET (onInit): ', project.widget);

      if (project.widget) {
        this.widgetObj = project.widget;

        // ------------------------------------------------------------------------
        // @ calloutTimer
        // WIDGET AND CALLOUT-TIMER DEFINED
        // ------------------------------------------------------------------------
        if (project.widget.calloutTimer) {
          this.calloutTimerSecondSelected = project.widget.calloutTimer;
          this.CALLOUT_IS_DISABLED = false;
          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) CALLOUT-TIMER: ', this.calloutTimerSecondSelected,
            'IS DISABLED ', this.CALLOUT_IS_DISABLED);

        } else {

          // ------------------------------------------------------------------------
          // @ calloutTimer
          // WIDGET DEFINED BUT NOT CALLOUT-TIMER - SET DEFAULT
          // ------------------------------------------------------------------------
          this.logger.log('[WIDGET-SET-UP] - onInit WIDGET DEFINED BUT CALLOUT-TIMER IS: ', this.calloutTimerSecondSelected, ' > SET DEFAULT ')
          // this.calloutTimerSecondSelected = -1;
          this.calloutTimerSecondSelected = 5;
          this.CALLOUT_IS_DISABLED = true;
          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) CALLOUT-TIMER: ', this.calloutTimerSecondSelected, ' - IS DISABLED ', this.CALLOUT_IS_DISABLED);

        }

        // ------------------------------------------------------------------------
        // @ Logochat
        // case logoChat = 'userCompanyLogoUrl' > display the userCompanyLogoUrl
        // logoChat (WIDGET AND LOGOCHAT DEFINED - USER HAS SETTED HIS LOGO)
        // ------------------------------------------------------------------------
        // if (project.widget.logoChat && project.widget.logoChat !== 'nologo' && project.widget.logoChat !== 'tiledesklogo') {
        if (project.widget.logoChat && project.widget.logoChat !== 'nologo' && project.widget.logoChat !== 'https://tiledesk.com/tiledesk-logo-white.png') {
          this.logoUrl = project.widget.logoChat;
          this.hasOwnLogo = true;
          this.LOGO_IS_ON = true;

          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) LOGO URL: ', project.widget.logoChat,
            ' HAS HOWN LOGO ', this.hasOwnLogo,
            ' LOGO IS ON', this.LOGO_IS_ON);

          // ------------------------------------------------------------------------
          // @ Logochat
          // case logoChat = 'nologo' > no logo is displayed
          // logoChat (WIDGET AND LOGOCHAT DEFINED - USER HAS SELECTED 'NO LOGO')
          // ------------------------------------------------------------------------
          // } else if (project.widget.logoChat && project.widget.logoChat === 'nologo' && project.widget.logoChat !== 'tiledesklogo') {
        } else if (project.widget.logoChat && project.widget.logoChat === 'nologo' && project.widget.logoChat !== 'https://tiledesk.com/tiledesk-logo-white.png') {
          this.logoUrl = 'No Logo';
          this.hasOwnLogo = false;
          this.LOGO_IS_ON = false;

          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) LOGO URL: ', project.widget.logoChat,
            ' HAS HOWN LOGO ', this.hasOwnLogo,
            ' LOGO IS ON', this.LOGO_IS_ON);


          // ------------------------------------------------------------------------
          // @ Logochat
          // case logoChat = '' > display the tiledesk logo and in the input field display the text 'tiledesklogo'
          // logoChat (WIDGET DEFINED BUT NOT LOGOCHAT - SET DEFAULT)
          // ------------------------------------------------------------------------
        } else {
          // this.logoUrl = 'tiledesklogo'
          this.logoUrl = 'https://tiledesk.com/tiledesk-logo-white.png'
          this.hasOwnLogo = false;
          this.LOGO_IS_ON = true

          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) LOGO URL: ', project.widget.logoChat,
            ' HAS HOWN LOGO ', this.hasOwnLogo,
            ' LOGO IS ON', this.LOGO_IS_ON);
        }

        // -----------------------------------------
        // Pre-chat form
        // -----------------------------------------
        if (project.widget.preChatForm) {
          this.preChatForm = true;
        } else {
          this.preChatForm = false;
        }

        if (project.widget.preChatFormCustomFieldsEnabled) {
          this.preChatFormCustomFieldsEnabled = true
        } else {
          this.preChatFormCustomFieldsEnabled = false;
        }

        if (project.widget.preChatFormJson) {

          // this.prechatFormTexareaJson = JSON.stringify(this.widgetDefaultSettings.preChatFormJson);

          this.prechatFormTexareaJson = JSON.stringify(project.widget.preChatFormJson, null, 4);
          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) PRE-CHAT-FORM-JSON DEFINED: ', project.widget.preChatFormJson)
          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) PRE-CHAT-FORM-JSON DEFINED typeof: ', typeof project.widget.preChatFormJson)
        } else {

          this.prechatFormTexareaJson = JSON.stringify(this.widgetDefaultSettings.preChatFormJson, null, 4);
          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) PRE-CHAT-FORM-JSON UNDEFINED: ', this.widgetDefaultSettings.preChatFormJson)
          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) PRE-CHAT-FORM-JSON UNDEFINED typeof: ', typeof this.widgetDefaultSettings.preChatFormJson)

        }

        // -----------------------------------------
        // NATIVE Rating
        // -----------------------------------------
        if (project.widget.nativeRating) {
          this.nativeRating = true;
        } else {
          this.nativeRating = false;
        }



        // ------------------------------------------------------------------------
        // @ themeColor
        // themeColor (WIDGET AND THEME-COLOR DEFINED)
        // ------------------------------------------------------------------------
        if (project.widget.themeColor) {

          this.primaryColor = project.widget.themeColor;
          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) THEME COLOR: ', this.primaryColor);
          this.primaryColorRgb = this.hexToRgb(this.primaryColor)
          this.generateRgbaGradientAndBorder(this.primaryColorRgb);
        } else {

          // ------------------------------------------------------------------------
          // @ themeColor
          // case themeColor IS undefined
          // themeColor (WIDGET DEFINED BUT NOT THEME-COLOR - SET DEFAULT)
          // ------------------------------------------------------------------------
          this.primaryColor = this.widgetDefaultSettings.themeColor

          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) THEME COLOR: ', project.widget.themeColor,
            ' IS UNDEFINED > SET DEFAULT ', this.primaryColor);

          this.primaryColorRgb = this.hexToRgb(this.primaryColor)
          this.generateRgbaGradientAndBorder(this.primaryColorRgb);
        }

        // ------------------------------------------------------------------------
        // @ themeForegroundColor
        // (WIDGET AND THEME-FOREGROUND-COLOR DEFINED)
        // ------------------------------------------------------------------------
        if (project.widget.themeForegroundColor) {
          this.secondaryColor = project.widget.themeForegroundColor;
          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) THEME-FOREGROUND COLOR: ', this.secondaryColor);
        } else {

          // ------------------------------------------------------------------------
          // @ themeForegroundColor
          // case themeForegroundColor IS undefined
          // themeForegroundColor (WIDGET DEFINED BUT NOT THEME-FOREGROUND-COLOR )
          // ------------------------------------------------------------------------
          this.secondaryColor = this.widgetDefaultSettings.themeForegroundColor;

          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) THEME-FOREGROUND COLOR: ', project.widget.themeForegroundColor,
            ' IS UNDEFINED > SET DEFAULT ', this.secondaryColor);
        }

        // ------------------------------------------------------------------------
        // @ Align
        // align (WIDGET AND ALIGN DEFINED)
        // ------------------------------------------------------------------------
        if (project.widget.align && project.widget.align === 'left') {
          this.hasSelectedLeftAlignment = true;
          this.hasSelectedRightAlignment = false;
          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) ALIGN: ', project.widget.align);
        } else {

          // -----------------------------------------------------------------------
          // @ Align
          // WIDGET DEFINED BUT NOT ALIGN
          // -----------------------------------------------------------------------
          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) ALIGN: ', project.widget.align, 'IS UNDEFINED > SET DEFAULT');
          this.hasSelectedLeftAlignment = false;
          this.hasSelectedRightAlignment = true;
        }

        // -----------------------------------------------------------------------
        // @ Reply time
        // WIDGET DEFINED
        // -----------------------------------------------------------------------
        this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET DEFINED) DYNAMIC REPLY TIME: ', project.widget.dynamicWaitTimeReply);

        if (project.widget.dynamicWaitTimeReply === true) {
          this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG = true;
          this.HAS_SELECT_STATIC_REPLY_TIME_MSG = false;
          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED) >  HAS_SELECT_DYMANIC_REPLY_TIME_MSG: ', this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG);
          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED) >  HAS_SELECT_DYMANIC_REPLY_TIME_MSG: ', this.HAS_SELECT_STATIC_REPLY_TIME_MSG);
        } else {
          this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG = false;
          this.HAS_SELECT_STATIC_REPLY_TIME_MSG = true;
          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED) >  HAS_SELECT_DYMANIC_REPLY_TIME_MSG: ', this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG);
          this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED) >  HAS_SELECT_DYMANIC_REPLY_TIME_MSG: ', this.HAS_SELECT_STATIC_REPLY_TIME_MSG);
        }

      } else {

        this.widgetObj = {}
        this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED)');
        // -----------------------------------------------------------------------
        // @ LogoChat
        // WIDGET UNDEFINED
        // -----------------------------------------------------------------------
        // this.logoUrl = 'tiledesklogo'
        this.logoUrl = 'https://tiledesk.com/tiledesk-logo-white.png'
        this.hasOwnLogo = false;
        this.LOGO_IS_ON = true

        this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED) > SET DEFAULT LOGOURL: ',
          this.logoUrl, 'HAS OWN LOGO ', this.hasOwnLogo, 'LOGO IS ON ', this.LOGO_IS_ON);

        // -----------------------------------------------------------------------
        // @ themeColor
        // WIDGET UNDEFINED
        // -----------------------------------------------------------------------
        this.primaryColor = this.widgetDefaultSettings.themeColor
        this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED) > SET DEFAULT THEME COLOR: ', this.primaryColor);
        this.primaryColorRgb = this.hexToRgb(this.primaryColor)
        this.generateRgbaGradientAndBorder(this.primaryColorRgb);

        // -----------------------------------------------------------------------
        // @ themeForegroundColor
        // WIDGET UNDEFINED
        // -----------------------------------------------------------------------
        this.secondaryColor = this.widgetDefaultSettings.themeForegroundColor;
        this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED) > SET DEFAULT THEME-FOREGROUND COLOR: ', this.secondaryColor);

        // -----------------------------------------------------------------------
        // @ calloutTimer
        // WIDGET UNDEFINED
        // -----------------------------------------------------------------------
        // this.calloutTimerSecondSelected = -1;
        this.calloutTimerSecondSelected = 5;
        this.CALLOUT_IS_DISABLED = true;

        // -----------------------------------------------------------------------
        // @ preChatForm
        // WIDGET UNDEFINED
        // -----------------------------------------------------------------------
        this.preChatForm = false;
        this.preChatFormCustomFieldsEnabled = false;
        this.prechatFormTexareaJson = JSON.stringify(this.widgetDefaultSettings.preChatFormJson, null, 4);

        // -----------------------------------------------------------------------
        // @ nativeRating
        // WIDGET UNDEFINED
        // -----------------------------------------------------------------------
        this.nativeRating = false;



        // -----------------------------------------------------------------------
        // @ Reply time
        // WIDGET UNDEFINED
        // -----------------------------------------------------------------------
        this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG = true;
        this.HAS_SELECT_STATIC_REPLY_TIME_MSG = false;
        this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED) >  HAS_SELECT_DYMANIC_REPLY_TIME_MSG: ', this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG);
        this.logger.log('[WIDGET-SET-UP] - (onInit WIDGET UNDEFINED) >  HAS_SELECT_DYMANIC_REPLY_TIME_MSG: ', this.HAS_SELECT_STATIC_REPLY_TIME_MSG);
      }

    }, (error) => {
      this.logger.error('[WIDGET-SET-UP] - GET PROJECT BY ID - ERROR ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[WIDGET-SET-UP] - GET PROJECT BY ID - COMPLETE ');

      this.showSpinner = false;
    });
  }




  // --------------------------------------------------------------------------
  // *** Preset color combination ***  
  // --------------------------------------------------------------------------
  setPresetColorComb(primaryColor: string, secondaryColor: string) {

    this.logger.log('setPresetColorComb widget_preview_selected ', this.widget_preview_selected)

    if (this.widget_preview_selected === '0001') {
      this.DISPLAY_WIDGET_HOME = true;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = false;
    }

    if (this.widget_preview_selected === '0002') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = true;
    }

    if (this.widget_preview_selected === '0003') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = true;
      this.DISPLAY_WIDGET_CHAT = false;
    }

    if (this.widget_preview_selected === '0004') {
      this.widget_preview_selected = "0004"
    }

    this.logger.log('[WIDGET-SET-UP] - setPresetCombOne ', primaryColor, secondaryColor);
    this.primaryColor = primaryColor;
    this.secondaryColor = secondaryColor;

    this.onChangePrimaryColor(primaryColor);

    this.widgetObj['themeColor'] = primaryColor
    this.widgetObj['themeForegroundColor'] = secondaryColor
  }


  // --------------------------------------------------------------------------
  // *** PRIMARY COLOR (alias for themeColor) ***  
  // --------------------------------------------------------------------------
  /**
   * onChangePrimaryColor: USED FOR THE COLOR PREVIEW (IT IS NECESSARY FOR THE PRIMARY COLOR GIVEN THAT
   * FROM IT ARE GENERATED OTHER PROPERTIES - WITHOUT RUNS generateRgbaGradientAndBorder IN
   * THIS THE UPDATED COLORS OF THE WIDGET'S PREVIEW ARE VISIBLE ONLY AFTER PRESSED TO 'OK' IN onSelectPrimaryColor)
   * @param $event
   */
  onChangePrimaryColor($event) {
    this.logger.log('onChangePrimaryColor widget_preview_selected ', this.widget_preview_selected)
    if (this.widget_preview_selected === '0001') {
      this.DISPLAY_WIDGET_HOME = true;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = false;
    }

    if (this.widget_preview_selected === '0002') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = true;
    }

    if (this.widget_preview_selected === '0003') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = true;
      this.DISPLAY_WIDGET_CHAT = false;
    }

    if (this.widget_preview_selected === '0004') {
      this.widget_preview_selected = "0004"
    }

    this.primaryColor = $event

    // this.logger.log('+ WIDGET DESIGN - ON CHANGE PRIMARY COLOR ', $event);
    // this.widgetService.publishPrimaryColorSelected(this.primaryColor);
    this.primaryColorRgb = this.hexToRgb(this.primaryColor)
    this.logger.log('[WIDGET-SET-UP] - ON CHANGE PRIMARY COLOR - PRIMARY COLOR RGB ', this.primaryColorRgb);
    this.generateRgbaGradientAndBorder(this.primaryColorRgb);

  }

  onFocusChangePrimaryColor() {
    this.logger.log('onFocusChangePrimaryColor widget_preview_selected ', this.widget_preview_selected)

    if (this.widget_preview_selected === '0001') {
      this.DISPLAY_WIDGET_HOME = true;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = false;
    }

    if (this.widget_preview_selected === '0002') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = true;
    }

    if (this.widget_preview_selected === '0003') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = true;
      this.DISPLAY_WIDGET_CHAT = false;
    }

    if (this.widget_preview_selected === '0004') {
      this.widget_preview_selected = "0004"
    }
  }

  onOpenPrimaryColorDialog($event) {
    this.logger.log('onOpenPrimaryColorDialog widget_preview_selected ', this.widget_preview_selected)
    if (this.widget_preview_selected === '0001') {
      this.DISPLAY_WIDGET_HOME = true;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = false;
    }

    if (this.widget_preview_selected === '0002') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = true;
    }

    if (this.widget_preview_selected === '0003') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = true;
      this.DISPLAY_WIDGET_CHAT = false;
    }

    if (this.widget_preview_selected === '0004') {
      this.widget_preview_selected = "0004"
    }
  }

  hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    const resultR = parseInt(result[1], 16);
    const resultG = parseInt(result[2], 16);
    const resultB = parseInt(result[3], 16)

    return result ? 'rgb' + '(' + resultR + ',' + resultG + ',' + resultB + ')' : null;

  }

  onClosePrimaryColorDialog(event) {
    this.logger.log('[WIDGET-SET-UP] - ON CLOSE PRIMARY COLOR DIALOG ', event);
    this.primaryColor = event

    if (this.primaryColor !== this.widgetDefaultSettings.themeColor) {
      this.widgetObj['themeColor'] = this.primaryColor
    } else {

      // *** REMOVE PROPERTY
      delete this.widgetObj['themeColor'];
    }
  }


  generateRgbaGradientAndBorder(primaryColor: string) {
    // this.logger.log('»» WIDGET DESIGN - ON CLOSE PRIMARY COLOR DIALOG COLOR (RGB) ', primaryColor);
    const new_col = primaryColor.replace(/rgb/i, 'rgba');
    this.primaryColorRgba = new_col.replace(/\)/i, ',0.50)');
    // this.logger.log('»» WIDGET DESIGN - PRIMARY COLOR RGBA ', this.primaryColorRgba);

    this.primaryColorGradiend = `linear-gradient(${this.primaryColor}, ${this.primaryColorRgba})`;
    this.primaryColorBorder = `2.4px solid ${this.primaryColorRgba}`;
  }


  // --------------------------------------------------------------------------------------
  //  *** SECONDARY COLOR (alias for themeForegroundColor) ***  
  // --------------------------------------------------------------------------------------

  onCloseSecondaryColorDialog(event) {
    this.logger.log('[WIDGET-SET-UP] - ON CLOSE SECONDARY DIALOG ', event);
    this.secondaryColor = event

    if (this.secondaryColor !== this.widgetDefaultSettings.themeForegroundColor) {
      // *** ADD PROPERTY
      this.widgetObj['themeForegroundColor'] = this.secondaryColor
      /**
       * *** WidgetProject IS UPDATED WHEN THE USER CLICK ON SAVE ***   */
      // this.widgetService.updateWidgetProject(this.widgetObj)
    } else {
      // *** REMOVE PROPERTY
      delete this.widgetObj['themeForegroundColor'];
    }
  }

  onChangeSecondaryColor(event) {

    this.logger.log('onChangeSecondaryColor widget_preview_selected ', this.widget_preview_selected)
    if (this.widget_preview_selected === '0001') {
      this.DISPLAY_WIDGET_HOME = true;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = false;
    }

    if (this.widget_preview_selected === '0002') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = true;
    }

    if (this.widget_preview_selected === '0003') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = true;
      this.DISPLAY_WIDGET_CHAT = false;
    }

    if (this.widget_preview_selected === '0004') {
      this.widget_preview_selected = "0004"
    }

    this.logger.log('[WIDGET-SET-UP] - onChangeSecondaryColor ', event);
    this.secondaryColor = event;
    if (this.secondaryColor !== this.widgetDefaultSettings.themeForegroundColor) {
      // *** ADD PROPERTY
      this.widgetObj['themeForegroundColor'] = this.secondaryColor

      /**
       * *** WidgetProject IS UPDATED WHEN THE USER CLICK ON SAVE ***   */
      // this.widgetService.updateWidgetProject(this.widgetObj)
    } else {
      // *** REMOVE PROPERTY
      delete this.widgetObj['themeForegroundColor'];

      /**
       * *** WidgetProject IS UPDATED WHEN THE USER CLICK ON SAVE ***   */
      // this.widgetService.updateWidgetProject(this.widgetObj)
    }
  }

  onOpenSecondaryColorDialog($event) {
    this.logger.log('onOpenSecondaryColorDialog widget_preview_selected ', this.widget_preview_selected)
    if (this.widget_preview_selected === '0001') {
      this.DISPLAY_WIDGET_HOME = true;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = false;
    }

    if (this.widget_preview_selected === '0002') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = true;
    }

    if (this.widget_preview_selected === '0003') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = true;
      this.DISPLAY_WIDGET_CHAT = false;
    }

    if (this.widget_preview_selected === '0004') {
      this.widget_preview_selected = "0004"
    }

  }

  onFocusChangeSecondaryColor() {
    this.logger.log('onFocusChangeSecondaryColor widget_preview_selected ', this.widget_preview_selected)
    if (this.widget_preview_selected === '0001') {
      this.DISPLAY_WIDGET_HOME = true;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = false;
    }

    if (this.widget_preview_selected === '0002') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = false;
      this.DISPLAY_WIDGET_CHAT = true;
    }

    if (this.widget_preview_selected === '0003') {
      this.DISPLAY_WIDGET_HOME = false;
      this.DISPLAY_CALLOUT = true;
      this.DISPLAY_WIDGET_CHAT = false;
    }

    if (this.widget_preview_selected === '0004') {
      this.widget_preview_selected = "0004"
    }
  }

  onFocusWelcomeMsg() {
    this.DISPLAY_WIDGET_HOME = true;
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_CHAT = false;
    this.widget_preview_selected = "0000"
  }

  onFocusWelcomeTitle() {
    this.DISPLAY_WIDGET_HOME = true;
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_CHAT = false;
    this.widget_preview_selected = "0000"
  }

  onFocusReplyTime() {
    this.DISPLAY_WIDGET_HOME = true;
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_CHAT = false;
    this.widget_preview_selected = "0000"
  }

  // ---- NEW
  onFocusOnlineGreetings() {
    this.DISPLAY_WIDGET_HOME = false;
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_CHAT = true

    this.HAS_FOCUSED_ONLINE_MSG = true;
    this.HAS_FOCUSED_OFFLINE_MSG = false;
    this.HAS_FOCUSED_OFFICE_CLOSED_MSG = false;
    this.widget_preview_selected = "0002"
  }

  onFocusOfflineGreetings() {
    this.DISPLAY_WIDGET_HOME = false;
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_CHAT = true;

    this.HAS_FOCUSED_ONLINE_MSG = false;
    this.HAS_FOCUSED_OFFLINE_MSG = true;
    this.HAS_FOCUSED_OFFICE_CLOSED_MSG = false;
    this.widget_preview_selected = "0002"

  }

  onFocusOfficeClosedGreetings() {
    this.DISPLAY_WIDGET_HOME = false;
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_CHAT = true

    this.HAS_FOCUSED_ONLINE_MSG = false;
    this.HAS_FOCUSED_OFFLINE_MSG = false;
    this.HAS_FOCUSED_OFFICE_CLOSED_MSG = true;
    this.widget_preview_selected = "0002"
  }







  verifyImageURL(url, callBack) {
    const img = new Image();
    img.src = url;
    try {
      img.onload = () => {
        callBack(true);
      };
    } catch (err) {
      this.logger.error('[WIDGET-SET-UP] - verifyImageURL', err);
    }
    try {
      img.onerror = () => {
        callBack(false);
      };
    } catch (err) {
      this.logger.log('[WIDGET-SET-UP] - verifyImageURL', err);
    }
  }


  logoChange(event) {
    this.logger.log('[WIDGET-SET-UP] - logoChange event.length', event.length);

    if (event.length === 0) {
      this.hasOwnLogo = false;

    } else {

      if (this.LOGO_IS_ON === true) {

        this.verifyImageURL(event, (imageExists) => {
          // return imageExists
          if (imageExists === true) {
            this.logger.log('[WIDGET-SET-UP] - checkImage Image Exists: ', imageExists);
            this.hasOwnLogo = true;
            this.IMAGE_EXIST = true;
          } else {
            this.logger.log('[WIDGET-SET-UP] - checkImage Image Exists: ', imageExists);
            this.hasOwnLogo = false;
            this.IMAGE_EXIST = false;
          }
        });
      }
    }
  }


  // SWITCH BTN ON / OFF
  onLogoOnOff($event) {
    this.logger.log('[WIDGET-SET-UP] - LOGO ON/OFF ', $event.target.checked)
    this.LOGO_IS_ON = false

    if ($event.target.checked === false) {
      this.logoUrl = 'No Logo'

      // CASE SWITCH BTN = OFF
      // *** ADD PROPERTY
      this.widgetObj['logoChat'] = 'nologo';

      // UPDATE WIDGET PROJECT
      // this.widgetService.updateWidgetProject(this.widgetObj);

    } else if ($event.target.checked === true) {

      // this.logoUrl = 'tiledesklogo'
      this.logoUrl = 'https://tiledesk.com/tiledesk-logo-white.png'
      this.LOGO_IS_ON = true;
      this.logger.log('[WIDGET-SET-UP] LOGO_IS_ON ', this.LOGO_IS_ON)
      this.hasOwnLogo = false;

      // CASE SWITCH BTN = ON
      // *** REMOVE PROPERTY
      delete this.widgetObj['logoChat'];
      this.logger.log('[WIDGET-SET-UP] - widgetObj', this.widgetObj);
    }
  }


  /**
   * *** ---------------------------- ***
   * ***    SAVE WIDGET APPEARANCE    ***
   * *** ---------------------------- ***
   */
  saveWidgetAppearance() {
    const appearance_save_btn_mobile = <HTMLElement>document.querySelector('.appearance_save_btn_mobile');
    const appearance_save_btn_desktop = <HTMLElement>document.querySelector('.appearance-save-btn-desktop');
    const appearance_save_btn_bottom = <HTMLElement>document.querySelector('.appearance_save_btn_bottom');

    if (appearance_save_btn_mobile) {
      appearance_save_btn_mobile.blur()
    }
    if (appearance_save_btn_desktop) {
      appearance_save_btn_desktop.blur()
    }
    if (appearance_save_btn_bottom) {
      appearance_save_btn_bottom.blur()
    }

    /// LOGO
    if (this.logoUrl && this.LOGO_IS_ON === true) {

      // if (this.logoUrl !== 'tiledesklogo') {
      if (this.logoUrl !== 'https://tiledesk.com/tiledesk-logo-white.png') {
        this.hasOwnLogo = true;
        this.logger.log('[WIDGET-SET-UP] - HAS OWN LOGO ', this.hasOwnLogo, 'LOGO IS ON ', this.LOGO_IS_ON, ' logoUrl: ', this.logoUrl);
      } else {
        this.hasOwnLogo = false;
      }
      // *** ADD PROPERTY
      this.widgetObj['logoChat'] = this.logoUrl

    } else if (this.logoUrl && this.LOGO_IS_ON === false) {
      // if is defined logoUrl and LOGO_IS_ON === false set the property logoChat = to No Logo
      // use case: the logo btn on/off is setted as off and the user enter an logo url
      this.logoUrl = 'No Logo'
      this.logger.log('[WIDGET-SET-UP] - HAS OWN LOGO ', this.hasOwnLogo, 'LOGO IS ON ', this.LOGO_IS_ON, ' logoUrl: ', this.logoUrl);
      // *** ADD PROPERTY
      this.widgetObj['logoChat'] = 'nologo';

    } else {
      // if is not defined logoUrl remove the property logoChat
      // *** REMOVE PROPERTY
      delete this.widgetObj['logoChat'];

      // this.logoUrl = 'tiledesklogo'
      this.logoUrl = 'https://tiledesk.com/tiledesk-logo-white.png'
      this.hasOwnLogo = false;
      this.logger.log('[WIDGET-SET-UP] - HAS OWN LOGO ', this.hasOwnLogo, 'LOGO IS ON ', this.LOGO_IS_ON, ' logoUrl: ', this.logoUrl);
    }

    this.widgetService.updateWidgetProject(this.widgetObj)
  }

  // ===========================================================================
  // ============== *** CALLOUT TIMER (calloutTimer) ***  ==============
  // ===========================================================================

  toggleCallout($event) {
    this.DISPLAY_WIDGET_HOME = false;
    this.DISPLAY_CALLOUT = true;
    this.DISPLAY_WIDGET_CHAT = false;
    this.logger.log('toggleCallout', this.widget_preview_selected)
    this.widget_preview_selected = '0003'



    if ($event.target.checked) {
      // this.calloutTimerSecondSelected = 5;
      this.CALLOUT_IS_DISABLED = false;
      this.widgetObj['calloutTimer'] = this.calloutTimerSecondSelected;

      this.logger.log('[WIDGET-SET-UP] CALLOUT TIMER - toggleCallout calloutTimerSecondSelected', this.calloutTimerSecondSelected);
    } else {

      // this.calloutTimerSecondSelected = -1;
      this.CALLOUT_IS_DISABLED = true;
      delete this.widgetObj['calloutTimer'];
      this.logger.log('[WIDGET-SET-UP] CALLOUT TIMER - toggleCallout calloutTimerSecondSelected', this.calloutTimerSecondSelected);
    }
  }

  onFocusCalloutTitle() {
    this.DISPLAY_WIDGET_HOME = false;
    this.DISPLAY_CALLOUT = true;
    this.DISPLAY_WIDGET_CHAT = false;
  }

  onFocusCalloutMsg() {
    this.DISPLAY_WIDGET_HOME = false;
    this.DISPLAY_CALLOUT = true;
    this.DISPLAY_WIDGET_CHAT = false;
  }


  setSelectedCalloutTimer() {

    this.DISPLAY_WIDGET_HOME = false;
    this.DISPLAY_CALLOUT = true;
    this.DISPLAY_WIDGET_CHAT = false;
    // if (this.calloutTimerSecondSelected !== -1) {
    // if (this.CALLOUT_IS_DISABLED = false) {
    this.logger.log('[WIDGET-SET-UP] CALLOUT TIMER - TIMER SELECTED', this.calloutTimerSecondSelected);
    // this.CALLOUT_IS_DISABLED = false;
    // *** ADD PROPERTY
    this.widgetObj['calloutTimer'] = this.calloutTimerSecondSelected;
    // UPDATE WIDGET PROJECT

    /**
     * *** WidgetProject IS UPDATED WHEN THE USER CLICK ON SAVE ***  */
    // this.widgetService.updateWidgetProject(this.widgetObj)

    // COMMENT AS FOR CALLOUT TITLE
    // this.widgetService.publishCalloutTimerSelected(this.calloutTimerSecondSelected)

    // } else if (this.calloutTimerSecondSelected === -1) {
  }

  // else if (this.CALLOUT_IS_DISABLED = true) {
  //   this.logger.log('»» WIDGET DESIGN CALLOUT TIMER - TIMER SELECTED', this.calloutTimerSecondSelected);
  //   // this.CALLOUT_IS_DISABLED = true;
  //   // *** REMOVE PROPERTIES

  //   delete this.widgetObj['calloutTimer'];
  // }
  // }


  saveCalloutSettings() {
    this.HAS_CHANGED_GREETINGS = false;
    const callout_settings_save_btn = <HTMLElement>document.querySelector('.callout-settings-save-btn');

    if (callout_settings_save_btn) {
      callout_settings_save_btn.blur()
    }
    this.widgetService.updateWidgetProject(this.widgetObj)
  }
  // -----------------------------------------------------------------------
  //  @ Pre-chat form  
  // -----------------------------------------------------------------------
  togglePrechatformCheckBox(event) {
    if (event.target.checked) {
      this.preChatForm = true;
      // *** ADD PROPERTY
      this.widgetObj['preChatForm'] = this.preChatForm;
      this.widgetService.updateWidgetProject(this.widgetObj)
      this.logger.log('[WIDGET-SET-UP] - INCLUDE PRE CHAT FORM ', event.target.checked)
    } else {
      this.preChatForm = false;
      if (this.preChatFormCustomFieldsEnabled === true) {
        this.preChatFormCustomFieldsEnabled = false;
      }

      if (this.widgetObj.hasOwnProperty('preChatFormCustomFieldsEnabled')) {
        delete this.widgetObj['preChatFormCustomFieldsEnabled'];
      }

      // *** REMOVE PROPERTY
      delete this.widgetObj['preChatForm'];
      this.widgetService.updateWidgetProject(this.widgetObj)

      this.logger.log('[WIDGET-SET-UP] - INCLUDE PRE CHAT FORM ', event.target.checked)
    }
  }

  customizePrechatformFieldsCheckBox(event) {
    if (event.target.checked) {
      this.preChatFormCustomFieldsEnabled = true;
      this.HAS_ACTIVATED_PRECHAT_CUSTOM_FIELDS = true
      // *** ADD PROPERTY
      this.widgetObj['preChatFormCustomFieldsEnabled'] = this.preChatFormCustomFieldsEnabled;

      const parsedPrechatFormTexareaJson = JSON.parse(this.prechatFormTexareaJson)
      this.widgetObj['preChatFormJson'] = parsedPrechatFormTexareaJson;

      this.widgetService.updateWidgetProject(this.widgetObj)
      this.logger.log('[WIDGET-SET-UP] - ENABLE CUSTOMIZE PRE CHAT FORM ', event.target.checked)
    } else {
      this.preChatFormCustomFieldsEnabled = false;
      this.HAS_ACTIVATED_PRECHAT_CUSTOM_FIELDS = false
      // *** REMOVE PROPERTY
      delete this.widgetObj['preChatFormCustomFieldsEnabled'];
      this.widgetService.updateWidgetProject(this.widgetObj)

      this.logger.log('[WIDGET-SET-UP] - ENABLE CUSTOMIZE PRE CHAT FORM ', event.target.checked)
    }
  }

  savePrechatFormCustomFields() {
    const prechatform_savejson_btn = <HTMLElement>document.querySelector('.prechatform-savejson-btn');
    this.logger.log('[WIDGET-SET-UP] - prechatform_savejson_btn: ', prechatform_savejson_btn);
    if (prechatform_savejson_btn) {
      prechatform_savejson_btn.blur()
    }


    this.logger.log('[WIDGET-SET-UP] - SAVE PRE-CHAT-FORM-JSON', this.prechatFormTexareaJson)
    if (this.prechatFormTexareaJson !== '' && this.isJsonString(this.prechatFormTexareaJson) === true) {
      const parsedPrechatFormTexareaJson = JSON.parse(this.prechatFormTexareaJson)

      this.logger.log('[WIDGET-SET-UP] - SAVE PRE-CHAT-FORM-JSON PARSED', parsedPrechatFormTexareaJson)

      this.widgetObj['preChatFormJson'] = parsedPrechatFormTexareaJson;
      this.widgetService.updateWidgetProject(this.widgetObj)
    } else {
      this.notify.showWidgetStyleUpdateNotification(this.invalidJSON_ErrorMsg, 4, 'report_problem');
    }
  }

  isJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  // -----------------------------------------------------------------------
  //  @ Auto Rating
  // -----------------------------------------------------------------------
  toggleAutoRating(event) {
    if (event.target.checked) {
      this.nativeRating = true;
      // *** ADD PROPERTY
      this.widgetObj['nativeRating'] = this.nativeRating;
      this.widgetService.updateWidgetProject(this.widgetObj)
      this.logger.log('[WIDGET-SET-UP] - IS ENABLE Auto Rating ', event.target.checked)
    } else {
      this.nativeRating = false;
    
      // *** REMOVE PROPERTY
      delete this.widgetObj['nativeRating'];
      this.widgetService.updateWidgetProject(this.widgetObj)

      this.logger.log('[WIDGET-SET-UP] - IS ENABLED Auto Rating', event.target.checked)
    }
  }


  // onPastePrechatFormJSON(event: ClipboardEvent) {
  //   // event.preventDefault();

  //   let clipboardData = event.clipboardData;
  //   this.logger.log('[WIDGET-SET-UP] - ON PASTE PRE-CHAT-FORM clipboardData', clipboardData);
  //   let pastedText = clipboardData.getData('text')
  //   this.prechatFormTexareaJson = pastedText
  //   // this.logger.log('[WIDGET-SET-UP] - ON PASTE PRE-CHAT-FORM JSON', pastedText);
  //   // // // replace(/\s+/g , '')
  //   // // // .replace(/\"/g, '"').replace(/\s+/g , '');
  //   // // const pastedTextNoWhiteSpace = pastedText.split('\\');
  //   // // // const pastedTextNoBackSlash = pastedTextNoWhiteSpace.replace(/\\"/g, '"');
  //   // this.prechatFormTexareaJson = pastedText.replace(/\\\//g, "/");
  //   // this.logger.log('[WIDGET-SET-UP] - ON PASTE PRE-CHAT-FORM JSON prechatFormTexareaJson', this.prechatFormTexareaJson);
  // }





  // NOT USED
  onChangePrechatFormTexareaJson(event: any) {
    this.logger.log('[WIDGET-SET-UP] - CHANGE PRE-CHAT-FORM-JSON event', event)
    // this.logger.log('[WIDGET-SET-UP] - CHANGE PRE-CHAT-FORM-JSON prechatFormTexareaJson', this.prechatFormTexareaJson)
    // var x = document.getElementById("prechat-form-texarea").value;
    //  = <HTMLElement>document.querySelector("prechat-form-texarea").value;
    //  var x = (<HTMLInputElement>document.getElementById("prechat-form-texarea")).value;
    //  this.logger.log('[WIDGET-SET-UP] - CHANGE PRE-CHAT-FORM-JSON x', x)
    // this.prechatFormTexareaJson = event

    var myJSONString = JSON.stringify(event);
    var myEscapedJSONString = myJSONString.replace(/\\n/g, "\\n")
      .replace(/\\'/g, "\\'")
      .replace(/\\"/g, '\\"')
      .replace(/\\&/g, "\\&")
      .replace(/\\r/g, "\\r")
      .replace(/\\t/g, "\\t")
      .replace(/\\b/g, "\\b")
      .replace(/\\f/g, "\\f");
  }


  // -----------------------------------------------------------------------
  //  @ WIDGET ALIGNMENT (alias for align)   
  // -----------------------------------------------------------------------
  aligmentLeftSelected(left_selected: boolean) {

    this.DISPLAY_WIDGET_HOME = false;
    this.DISPLAY_CALLOUT = true;
    this.DISPLAY_WIDGET_CHAT = false;

    this.logger.log('[WIDGET-SET-UP] - LEFT ALIGNMENT SELECTED ', left_selected);
    this.hasSelectedLeftAlignment = true;
    this.hasSelectedRightAlignment = false;

    // *** ADD PROPERTY
    this.widgetObj['align'] = 'left'
    this.widget_preview_selected = "0003"
  }

  aligmentRightSelected(right_selected: boolean) {
    this.DISPLAY_CALLOUT = true;
    this.DISPLAY_WIDGET_HOME = false;
    this.DISPLAY_WIDGET_CHAT = false;
    this.logger.log('[WIDGET-SET-UP] - RIGHT ALIGNMENT SELECTED ', right_selected);
    this.hasSelectedLeftAlignment = false;
    this.hasSelectedRightAlignment = true;

    // *** REMOVE PROPERTY
    delete this.widgetObj['align'];
    this.widget_preview_selected = "0003"
  }


  goBack() {
    this.location.back();
  }

  goToWidgetMultilanguage() {
    this.router.navigate(['project/' + this.id_project + '/widget/translations']);
  }

  goToInstallWithTagManagerDocs() {
    const url = 'https://docs.tiledesk.com/knowledge-base/google-tag-manager-add-tiledesk-to-your-sites/';
    window.open(url, '_blank');
  }
  goToWidgetWebSdk() {
    const url = 'https://developer.tiledesk.com/widget/web-sdk';
    window.open(url, '_blank');
  }

  goToPrechatFormExample() {
    const url = 'https://developer.tiledesk.com/widget/advanced/prechat-form-json#examples';
    window.open(url, '_blank');
  }

  testWidgetPage() {
    // this.elementRef.nativeElement.blur();

    // const url = 'http://testwidget.tiledesk.com/testsitenw3?projectname=' + this.projectName + '&projectid=' + this.id_project
    // const url = this.TESTSITE_BASE_URL + '?projectname=' + this.projectName + '&projectid=' + this.id_project + '&isOpen=true'
    // '&isOpen=true'
    const url = this.TESTSITE_BASE_URL + '?tiledesk_projectid=' + this.id_project + '&project_name=' + this.projectName + '&role=' + this.USER_ROLE

    this.logger.log('[WIDGET-SET-UP] - TEST WIDGET URL ', url);
    window.open(url, '_blank');
  }



  avarageWaitingTimeCLOCK() {
    this.subscription = this.analyticsService.getDataAVGWaitingCLOCK().subscribe((res: any) => {

      if (res && res.length > 0) {
        if (res[0].waiting_time_avg) {
          if (res[0].waiting_time_avg !== null || res[0].waiting_time_avg !== undefined) {

            this.responseAVGtime = this.humanizer.humanize(res[0].waiting_time_avg, { round: true, language: this.lang })

            this.logger.log('[WIDGET-SET-UP]  Waiting time: humanize  this.responseAVGtime', this.responseAVGtime)
            // this.logger.log('waiting time funtion:', this.humanizeDurations(res[0].waiting_time_avg));

          } else {
            this.logger.log('[WIDGET-SET-UP]  waiting_time_avg null or undefined')
          }
        }
      }

    }, (error) => {
      this.logger.error('[WIDGET-SET-UP] - AVERAGE TIME CLOCK REQUEST - ERROR', error);
    }, () => {
      this.logger.log('[WIDGET-SET-UP]  - AVERAGE TIME CLOCK REQUEST * COMPLETE *');
    });
  }

  showWaitingTime() {
    // const projectid = this.g.projectid;
    this.analyticsService.getCurrentWaitingTime()
      .subscribe((res: any) => {

        this.logger.log('[WIDGET-SET-UP]  Waiting time: humanize  responseAVGtimeDario res', res)
        // that.g.wdLog(['response waiting', response]);
        // this.logger.log('response waiting ::::', response);
        if (res && res.length > 0 && res[0].waiting_time_avg) {
          // const wt = response[0].waiting_time_avg;

          // that.waitingTime = wt;
          // that.g.wdLog([' that.waitingTime',  that.waitingTime]);
          // this.logger.log('that.waitingTime', that.waitingTime);

          // const lang = that.translatorService.getLanguage();
          // this.logger.log('lang', lang);
          // that.humanWaitingTime = this.humanizer.humanize(wt, {language: lang});

          const responseAVGtimeDario = this.humanizer.humanize(res[0].waiting_time_avg, { round: true, language: this.lang })

          this.logger.log('[WIDGET-SET-UP]  Waiting time: humanize  responseAVGtimeDario', responseAVGtimeDario)
          // this.logger.log('xxx', this.humanizer.humanize(wt));
          // 'The team typically replies in ' + moment.duration(response[0].waiting_time_avg).format();
        }
        //  else {
        //   that.waitingTimeMessage = 'waiting_time_not_found';
        //   // that.waitingTimeMessage = 'Will reply as soon as they can';
        //  }
      });
  }



}
