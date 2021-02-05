import { Component, OnInit, AfterViewInit, HostListener, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ColorPickerService, Cmyk } from 'ngx-color-picker';
import { WidgetService } from '../../services/widget.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../core/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { Department } from '../../models/department-model';
import { DepartmentService } from '../../services/department.service';
import { NotifyService } from '../../core/notify.service';
import { environment } from '../../../environments/environment';
import { WidgetDesignBaseComponent } from './widget-design-base/widget-design-base.component';
import { AppConfigService } from '../../services/app-config.service';
import { AnalyticsService } from './../../services/analytics.service';

// import brand from 'assets/brand/brand.json';
import { BrandService } from '../../services/brand.service';
import { HumanizeDurationLanguage, HumanizeDuration } from 'humanize-duration-ts';
const swal = require('sweetalert');

@Component({
  selector: 'appdashboard-widget-design',
  // templateUrl: './widget-design.component.html',
  templateUrl: './new-widget-design.component.html',
  styleUrls: ['./widget-design.component.scss']
})


export class WidgetDesignComponent extends WidgetDesignBaseComponent implements OnInit, AfterViewInit, OnDestroy {
  // '#2889e9'
  // tparams = brand;
  // company_name = brand.company_name;
  // company_site_url = brand.company_site_url;
  @ViewChild('testwidgetbtn') private elementRef: ElementRef;
  @ViewChild("multilanguage") private multilanguageRef: ElementRef;
  tparams: any;
  company_name: any;
  company_site_url: any;

  // TESTSITE_BASE_URL = environment.testsite.testsiteBaseUrl; // moved
  // TESTSITE_BASE_URL = environment.testsiteBaseUrl; // now get from appconfig
  TESTSITE_BASE_URL: string;
  // public_Key = environment.t2y12PruGU9wUtEGzBJfolMIgK; // now get from appconfig
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
  preChatForm: boolean;
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
  goToMultilanguageSectionMsg : string;
  setDefaultLangInMultilanguageSection: string;
  toAddLanguagesToYourProjectMsg: string;
  cancelMsg: string;
  HAS_CHANGED_GREETINGS = false;
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
    private analyticsService: AnalyticsService
  ) {
    super(translate);
    const brand = brandService.getBrand();

    this.tparams = brand;
    this.company_name = brand['company_name'];
    this.company_site_url = brand['company_site_url'];
  }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    // this.HAS_SELECT_INSTALL_WITH_CODE = false
    this.getStorageBucket();
    this.getWidgetUrl();
    this.getLoggedUser();
    this.onInitWindowWidth();
    this.getCurrentProject();
    this.getBrowserLang();

    this.route.fragment.subscribe(fragment => {
      this.fragment = fragment;
      console.log('+ WIDGET DESIGN - FRAGMENT ', this.fragment)
    });




    this.translateTextBaseComp();
    // this.translateOnlineMsgSuccessNoticationMsg();
    // this.translateOfflineMsgSuccessNoticationMsg();
    // this.translateOfficeClosedSuccessNoticationMsg();
    // this.translateGetTranslationErrorMsg();
    this.getSectionSelected();
    this.getLabels();
    this.getOSCODE();
    this.getTestSiteUrl();
    this.getAndManageAccordionInstallWidget();
    this.getAndManageAccordion();
    // this.avarageWaitingTimeCLOCK(); // as dashboard
    // this.showWaitingTime(); // as dario


    console.log('WIDGET DESIGN window.matchMedia ', window.matchMedia)
    this.lang = this.translate.getBrowserLang();
    console.log('LANGUAGE ', this.lang);
  }


  // il testo della modale '"Non è impostata nessuna lingua predefinita' e dato che potrebbe essere visualizzata 
  // all'init della pagina nn può stare nel base compo





  // scroll to multilanguage section
  scroll(el: HTMLElement) {
    el.scrollIntoView();
    var acc = document.getElementsByClassName("widget-section-accordion");
    // console.log('WIDGET DESIGN ACCORDION', acc);
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
    console.log('AppConfigService getAppConfig (Install Tiledesk) WIDGET_URL ', this.WIDGET_URL)

  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.newInnerWidth = event.target.innerWidth;
    console.log('»» WIDGET DESIGN - NEW INNER WIDTH ', this.newInnerWidth);

    if (this.newInnerWidth <= 668) {
      console.log('»» >>>> WIDGET DESIGN - NEW INNER WIDTH ', this.newInnerWidth);

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
    console.log('»» WIDGET DESIGN - INIT WIDTH ', this.initInnerWidth);
    if (this.newInnerWidth <= 668) {
      console.log('»» >>>> WIDGET DESIGN - NEW INNER WIDTH ', this.newInnerWidth);
      this.custom_breakpoint = true;
    } else {
      this.custom_breakpoint = false;
    }
  }

  onChangeWidgetPreview(previewselected) {
    console.log('»» WIDGET DESIGN - PREVIEW SELECTED ', previewselected);

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

  getStorageBucket() {
    const firebase_conf = this.appConfigService.getConfig().firebase;
    this.storageBucket = firebase_conf['storageBucket'];
    console.log('STORAGE-BUCKET Sidebar ', this.storageBucket)
  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      console.log('USER GET IN »» WIDGET DESIGN ', user)
      if (user) {
        this.current_user_name = user.firstname + ' ' + user.lastname
        this.currentUserId = user._id;
        console.log('Current USER ID ', this.currentUserId)
      }
    });
  }

  selectSidebar() {
    const elemAppSidebar = <HTMLElement>document.querySelector('app-sidebar');
    console.log('USER PROFILE  elemAppSidebar ', elemAppSidebar)
    elemAppSidebar.setAttribute('style', 'display:none;');

    const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    console.log('USER PROFILE  elemMainPanel ', elemMainPanel)
    elemMainPanel.setAttribute('style', 'width:100% !important; overflow-x: hidden !important;');
  }

  getAndManageAccordionInstallWidget() {
    var acc = document.getElementsByClassName("accordion-install-widget");

    console.log('WIDGET DESIGN ACCORDION INSTALL WIDGET', acc);

    var i;
    for (i = 0; i < acc.length; i++) {
      console.log('WIDGET DESIGN ACCORDION ARROW - INSTALL WIDGET - QUI ENTRO');
      console.log('WIDGET DESIGN ACCORDION ARROW - INSTALL WIDGET - acc[i]', acc[i]);
      acc[i].addEventListener("click", function () {
        this.classList.toggle("active-install-widget");

        var panel = this.nextElementSibling;
        // console.log('WIDGET DESIGN ACCORDION ARROW - INSTALL WIDGET - panel', panel);

        var arrow_icon_div = this.children[1];
        console.log('WIDGET DESIGN ACCORDION ARROW - INSTALL WIDGET - ICON WRAP DIV', arrow_icon_div);

        var arrow_icon = arrow_icon_div.children[0]
        console.log('WIDGET DESIGN ACCORDION ARROW ICON', arrow_icon);
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
    console.log('close_panel_install_widget HAS_SELECT_INSTALL_WITH_CODE', this.HAS_SELECT_INSTALL_WITH_CODE)

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

    console.log('installWithCode HAS_SELECT_INSTALL_WITH_CODE', this.HAS_SELECT_INSTALL_WITH_CODE)
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

    console.log('installWithCode HAS_SELECT_INSTALL_WITH_GTM', this.HAS_SELECT_INSTALL_WITH_GTM)
  }



  getAndManageAccordion() {
    var acc = document.getElementsByClassName("widget-section-accordion");
    // console.log('WIDGET DESIGN ACCORDION', acc);
    var i;
    for (i = 0; i < acc.length; i++) {
      console.log('WIDGET DESIGN ACCORDION i', i, 'acc[i]', acc[i]);
      // Open the first accordion https://codepen.io/fpavision/details/xxxONGv
      var firstAccordion = acc[0];
      var firstPanel = <HTMLElement>firstAccordion.nextElementSibling;
      // console.log('WIDGET DESIGN ACCORDION FIRST PANEL', firstPanel);

      firstAccordion.classList.add("active");
      firstPanel.style.maxHeight = firstPanel.scrollHeight + "px";

      var arrow_icon_div = firstAccordion.children[1];
      // console.log('WIDGET DESIGN ACCORDION ARROW ICON WRAP DIV', arrow_icon_div);

      var arrow_icon = arrow_icon_div.children[0]
      // console.log('WIDGET DESIGN ACCORDION ARROW ICON', arrow_icon);
      arrow_icon.classList.add("arrow-up");

      acc[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        // console.log('WIDGET DESIGN ACCORDION PANEL', panel);

        var arrow_icon_div = this.children[1];
        // console.log('WIDGET DESIGN ACCORDION ARROW ICON WRAP DIV', arrow_icon_div);

        var arrow_icon = arrow_icon_div.children[0]
        // console.log('WIDGET DESIGN ACCORDION ARROW ICON', arrow_icon);
        arrow_icon.classList.toggle("arrow-up");

        // var arrow_icon_div = acc[i].children[1];
        // console.log('WIDGET DESIGN ACCORDION ARROW ICON WRAP DIV', arrow_icon_div);
        // var arrow_icon = arrow_icon_div.children[0];
        // console.log('WIDGET DESIGN ACCORDION ARROW ICON', arrow_icon);
        // arrow_icon.classList.toggle("arrow-up");

        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;
        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    }
  }



  getTestSiteUrl() {
    this.TESTSITE_BASE_URL = this.appConfigService.getConfig().testsiteBaseUrl;
    console.log('AppConfigService getAppConfig (Widget-design) TESTSITE_BASE_URL', this.TESTSITE_BASE_URL);
  }
  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    console.log('AppConfigService getAppConfig (Widget-design) public_Key', this.public_Key);

    let keys = this.public_Key.split("-");
    console.log('PUBLIC-KEY (Widget-design) keys', keys)
    keys.forEach(key => {
      // console.log('NavbarComponent public_Key key', key)
      if (key.includes("MTL")) {
        console.log('PUBLIC-KEY (Widget-design) - mlt', key);
        let mlt = key.split(":");
        console.log('PUBLIC-KEY (Widget-design) - mlt key&value', mlt);
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
      console.log('Multilanguage (widget-design) ***** GET labels ***** - RES', labels);
      // labels.length > 0 
      if (labels && Object.keys(labels).length > 0) {
        // this.translation = labels[0].data[0];
        this.translations = labels['data']
        // console.log('Multilanguage ***** GET labels ***** - RES > TRANSLATIONS ', labels[0].data[0]);
        console.log('Multilanguage (widget-design)***** GET labels ***** - RES > TRANSLATIONS ', this.translations);

        this.languages_codes = [];

        // if (this.translations.filter(e => e.lang === 'EN').length > 0) {
        //   /* vendors contains the element we're looking for */
        //   console.log('Multilanguage (widget-design) ***** EN EXIST');

        // } else {
        //   console.log('Multilanguage (widget-design) ***** ENGLISH TRANSLATION NOT EXIST');
        //   this.notify.showNotification(this.errorNoticationMsg, 4, 'report_problem');
        // }

        this.translations.forEach(translation => {
          console.log('Multilanguage (widget-design) ***** GET labels ***** - RES >>> TRANSLATION ', translation);
          if (translation) {
            // se c'è inglese eseguo subito il push in languages_codes perle altre lang verifico se è presente _id
            // prima di eseguire il push
            if (translation._id !== undefined) {
              this.languages_codes.push(translation.lang.toLowerCase())
            }

            // IF DEFAULT LANGUAGE IS TRUE
            if (translation.default === true) {
              this.defaultLangCode = translation.lang.toLowerCase()
              console.log('Multilanguage (widget-design) ***** GET labels ***** defaultLangCode (onInit) ', this.defaultLangCode);
            } else {
              console.log('Multilanguage (widget-design) ***** GET labels ***** No default Lang *****  ', translation);
              // this.translateAndDisplayModalNoDefaultLangIsSet()
            }

            // if (translation.lang === 'EN') {
            //   this.languages_codes.push(translation.lang.toLowerCase());

            //   // this.engTraslationClone = Object.assign({}, translation['data']);
            //   // console.log('Multilanguage ***** GET labels ***** >>> engTraslationClone', this.engTraslationClone);
            // }
            // if (translation.lang !== 'EN') {
            //   console.log('Multilanguage (widget-design) ***** GET labels ***** - RES >>> TRANSLATION _id', translation._id);
            //   if (translation._id !== undefined) {
            //     this.languages_codes.push(translation.lang.toLowerCase())
            //   }
            // }
          }
        });


        console.log('Multilanguage (widget-design) ***** GET labels ***** defaultLangCode (onInit) 2', this.defaultLangCode);

        if (this.defaultLangCode === undefined)  {
          this.translateAndDisplayModalNoDefaultLangIsSet();
        }

        console.log('Multilanguage (widget-design) ***** GET labels ***** - Array of LANG CODE ', this.languages_codes);


        // const availableTranslations = [{ code: "it", name: "Italian" }, { code: "fr", name: "French" }, { code: "en", name: "English" }];
        const availableTranslations = this.doAvailableLanguageArray(this.languages_codes);
        console.log('Multilanguage (widget-design) ***** GET labels ***** - availableTranslations ', availableTranslations);
        if (availableTranslations && availableTranslations.length > 0) {
          // IN THE SELECT LANGUAGE COMBO DISPLAY AS SELECTED THE FIRST LANGUAGE IN ALPHABETICAL ORDER
          this.wd_availableTranslations = availableTranslations.sort(this.compare);
          console.log('Multilanguage (widget-design) ***** GET labels *****  ordered wd_availableTranslations', this.wd_availableTranslations);

          if (this.wd_availableTranslations && this.wd_availableTranslations[0]) {
            this.selectedLang = this.wd_availableTranslations[0].name;
            this.selectedLangCode = this.wd_availableTranslations[0].code;
            this.selectedLangName = this.wd_availableTranslations[0].name;
          }

          console.log('Multilanguage (widget-design) ***** GET labels *****  selectedLangCode ', this.selectedLangCode);

          this.getCurrentTranslation(this.selectedLangCode);

        } else {

          // ci sono le lebels ma nessuna assegnata al progetto
          this.translateAndDisplayModalNoLangAreSet();
        }
      } else {

        // labels is null
        this.translateAndDisplayModalNoLangAreSet();
      }

    }, error => {
      console.log('Multilanguage (widget-design) ***** GET labels ***** - ERROR ', error)
    }, () => {
      console.log('Multilanguage (widget-design) ***** GET labels ***** * COMPLETE *')

      // this._selectTranslationTab('en', 'English')
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
        // console.log('WIDGET DESIGN - translateNoDefaultLanguageIsSetUp warningMsg', this.warningMsg);
        // console.log('WIDGET DESIGN - translateNoDefaultLanguageIsSetUp noDefaultLanguageIsSetUpMsg', this.noDefaultLanguageIsSetUpMsg)
      }, (error) => {
        // console.log('WIDGET DESIGN - translateNoDefaultLanguageIsSetUp - ERROR ', error);
      }, () => {
        // console.log('WIDGET DESIGN - translateNoDefaultLanguageIsSetUp * COMPLETE *');

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
        console.log('displayModalNoDefaultLangAreSetUp value', value)

        if (value === 'catch') {
          this.scrollToMultilanguageSection()
        }
      })
  }


  scrollToMultilanguageSection() {
    this.multilanguageRef.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });

    var acc = document.getElementsByClassName("widget-section-accordion");
    // console.log('WIDGET DESIGN ACCORDION', acc);
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
        // console.log('WIDGET DESIGN - translateNoDefaultLanguageIsSetUp warningMsg', this.warningMsg);
        // console.log('WIDGET DESIGN - translateNoDefaultLanguageIsSetUp noDefaultLanguageIsSetUpMsg', this.noDefaultLanguageIsSetUpMsg)
      }, (error) => {
        // console.log('WIDGET DESIGN - translateNoDefaultLanguageIsSetUp - ERROR ', error);
      }, () => {
        // console.log('WIDGET DESIGN - translateNoDefaultLanguageIsSetUp * COMPLETE *');

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
        console.log('displayModalNoLangAreSetUp value', value)

        if (value === 'catch') {
          this.goToWidgetMultilanguage()
        }
      })
  }

  getCurrentTranslation(selectedLangCode: string) {
    console.log('Multilanguage (widget-design) init getCurrentTranslation ')
    this.translations.forEach(translation => {
      if (translation.lang.toLowerCase() === selectedLangCode) {

        this.selected_translation = translation.data
        console.log('Multilanguage (widget-design) ***** selected translation: ', this.selected_translation)

        // ---------------------------------------------------------------
        // @ New Conversation (not editable in the widhet setting page but only from multilanguage page)
        // ---------------------------------------------------------------
        this.newConversation = this.selected_translation["LABEL_START_NW_CONV"];
        console.log('Multilanguage (widget-design) ***** selected translation newConversation: ', this.newConversation);

        // ---------------------------------------------------------------
        // @ No Conversation (not editable in the widhet setting page but only from multilanguage page)
        // ---------------------------------------------------------------
        this.noConversation = this.selected_translation["NO_CONVERSATION"];

        // ---------------------------------------------------------------
        // @ Welcome title and company intro
        // ---------------------------------------------------------------
        this.welcomeTitle = this.selected_translation["WELLCOME_TITLE"];
        this.welcomeMsg = this.selected_translation["WELLCOME_MSG"];
        console.log('Multilanguage (widget-design) ***** selected translation WELLCOME_TITLE: ', this.welcomeTitle, '- WELLCOME_MSG: ', this.welcomeMsg);




        // ---------------------------------------------------------------
        // @ Callout title, msg and emoji
        // ---------------------------------------------------------------
        this.calloutTitle = this.selected_translation["CALLOUT_TITLE_PLACEHOLDER"];
        // this.calloutTitleForPreview =  this.calloutTitle.trim();
        this.checkIsEmoji(this.calloutTitle.trim());
        console.log('checkIsEmoji calloutTitleForPreview (on getCurrentTranslation)', this.calloutTitleForPreview);

        this.calloutMsg = this.selected_translation["CALLOUT_MSG_PLACEHOLDER"];
        console.log('Multilanguage (widget-design) ***** selected translation CALLOUT_TITLE_PLACEHOLDER : ', this.calloutTitle, '- CALLOUT_MSG: ', this.calloutMsg);

        // ---------------------------------------------------------------
        // @ Online & offline msgs
        // ---------------------------------------------------------------
        this.onlineMsg = this.selected_translation["LABEL_FIRST_MSG"];
        this.offlineMsg = this.selected_translation["LABEL_FIRST_MSG_NO_AGENTS"];
        console.log('Multilanguage (widget-design) ***** selected translation ONLINE MSG : ', this.onlineMsg, '- OFFLINE MSG: ', this.offlineMsg);

        // ---------------------------------------------------------------
        // @ Office closed msgs
        // ---------------------------------------------------------------
        this.officeClosedMsg = this.selected_translation["LABEL_FIRST_MSG_OPERATING_HOURS_CLOSED"];

        // -----------------------------------------------------------------------------------------------------------------------
        // @ waitingTimeNotFoundMsg & waitingTimeFoundMsg are displayed in widget preview when the variable C21_BODY_HOME is false 
        // this to simulate the presence of at least one conversation
        // -----------------------------------------------------------------------------------------------------------------------
        this.waitingTimeNotFoundMsg = this.selected_translation["WAITING_TIME_NOT_FOUND"];

        console.log('Multilanguage (widget-design) - ***** ["WAITING_TIME_FOUND"] contains $reply_time ', this.selected_translation["WAITING_TIME_FOUND"].includes("$reply_time"));

        // -------------------------------------------------------------------------------------------------------
        // @ for new projects $ reply_time is set by the server so it does not need to be added on the client side
        // ------------------------------------------------------------------------------------------------------- 
        // if (this.selected_translation["WAITING_TIME_FOUND"].includes("$reply_time") === false) {
        //   var hasSpaceAtEnds = this.selected_translation["WAITING_TIME_FOUND"].slice(-1);
          
        //   if (hasSpaceAtEnds == " ") {
        //     console.log("Multilanguage (widget-design) WAITING_TIME_FOUND ends with space");
        //     this.waitingTimeFoundMsg = this.selected_translation["WAITING_TIME_FOUND"] + '$reply_time';
        //   } else {
        //     console.log("Multilanguage (widget-design) WAITING_TIME_FOUND not ends with space");
        //     this.waitingTimeFoundMsg = this.selected_translation["WAITING_TIME_FOUND"] + ' ' + '$reply_time';
        //   }
        // } else {
        //   this.waitingTimeFoundMsg = this.selected_translation["WAITING_TIME_FOUND"]
        // }
        this.waitingTimeFoundMsg = this.selected_translation["WAITING_TIME_FOUND"]
        console.log('Multilanguage (widget-design) - ***** selected translation waitingTimeNotFoundMsg: ', this.waitingTimeNotFoundMsg);
        console.log('Multilanguage (widget-design) - ***** selected translation waitingTimeFoundMsg: ', this.waitingTimeFoundMsg);
      }
    });
  }

  makeDefaultLanguage(languageCode) {
    console.log('Multilanguage (widget-design) - MAKE DAFAULT LANG - languageCode: ', languageCode);

    this.widgetService.setDefaultLanguage(languageCode).subscribe((translation: any) => {
      console.log('Multilanguage (widget-design) - MAKE DAFAULT LANG - RES ', translation);

      if (translation.default === true) {
        this.defaultLangCode = translation.lang.toLowerCase()
        console.log('Multilanguage (widget-design) ***** GET labels ***** defaultLangCode (makeDefaultLanguage) ', this.defaultLangCode);
      }
    }, error => {
      console.log('Multilanguage (widget-design) - MAKE DAFAULT LANG - ERROR ', error);
    }, () => {
      console.log('Multilanguage (widget-design) - MAKE DAFAULT LANG ***** * COMPLETE *');

      // this.getLabels()

    });
  }

  welcomeTitleChange(event) {
    this.welcomeTitle = event;
    console.log('Multilanguage (widget-design) - WELCOME TITLE CHANGE: ', this.welcomeTitle);
    this.HAS_CHANGED_GREETINGS = true;
    // if (event.length === 0) {    }
  }

  welcomeMsgChange(event) {
    this.welcomeMsg = event;
    console.log('Multilanguage (widget-design) - WELCOME MSG CHANGE: ', this.welcomeMsg);
    this.HAS_CHANGED_GREETINGS = true;
    // if (event.length === 0) {  }
  }

  onChangeOnlineMsg(event) {
    this.onlineMsg = event;
    console.log('Multilanguage (widget-design) - ONLINE MSG CHANGE: ', this.onlineMsg);
    this.HAS_CHANGED_GREETINGS = true;
    // if (event.length === 0) {  }
  }

  onChangeOfflineMsg(event) {
    this.offlineMsg = event;
    console.log('Multilanguage (widget-design) - OFFLINE MSG CHANGE: ', this.offlineMsg);
    this.HAS_CHANGED_GREETINGS = true;
    // if (event.length === 0 || event) {  }
  }

  onChangeOfficeClosedMsg(event) {
    this.officeClosedMsg = event;
    console.log('Multilanguage (widget-design) - OFFICE CLOSED MSG CHANGE: ', this.officeClosedMsg);
    this.HAS_CHANGED_GREETINGS = true;
    // if (event.length === 0 || event) {  }
  }


  onChangeReplyTimeTypeMsg(value) {
    console.log('Multilanguage (widget-design) - ON CHANGE REPLY TIME TYPE MSG : ', value);

    if (value === 'reply_time_dynamic_msg') {
      this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG = true;
      this.HAS_SELECT_STATIC_REPLY_TIME_MSG = false;
      console.log('Multilanguage (widget-design) - HAS_SELECT_DYMANIC_REPLY_TIME_MSG : ', this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG);

      // this.widgetObj['dynamicWaitTimeReply'] = this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG;
      // this.widgetService.updateWidgetProject(this.widgetObj)

    }
    if (value === 'reply_time_fixed_msg') {
      this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG = false;
      this.HAS_SELECT_STATIC_REPLY_TIME_MSG = true;

      console.log('Multilanguage (widget-design) - HAS_SELECT_DYMANIC_REPLY_TIME_MSG : ', this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG);
    }

  }

  saveReplyTime() {
    this.HAS_CHANGED_GREETINGS = false;
    const save_replytime_btn = <HTMLElement>document.querySelector('.save_replytime_btn');
    console.log('Multilanguage (widget-design) - save_replytime_btn: ', save_replytime_btn);
    if (save_replytime_btn) {
      save_replytime_btn.blur()
    }

    this.widgetObj['dynamicWaitTimeReply'] = this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG;
    this.widgetService.updateWidgetProject(this.widgetObj)
  }

  setReplyTimePlaceholder() {
    const elInput = <HTMLElement>document.querySelector('.waiting-time-found-msg-input');
    console.log('Multilanguage (widget-design) - setReplyTimePlaceholder INPUT ELEM: ', elInput);
    this.insertAtCursor(elInput, '$reply_time')
  }

  waitingTimeNotFoundMsgChange(event) {
    this.waitingTimeNotFoundMsg = event;
    console.log('Multilanguage (widget-design) - WAITING TIME NOT FOUND CHANGE: ', this.waitingTimeFoundMsg);
  }

  waitingTimeFoundMsgChange(event) {
    this.waitingTimeFoundMsg = event;
    console.log('Multilanguage (widget-design) - WAITING TIME FOUND CHANGE: ', this.waitingTimeFoundMsg);

    if (/\s$/.test(event)) {

      console.log('Multilanguage (widget-design) - WAITING TIME FOUND CHANGE - string contains space at last');
      this.addWhiteSpaceBefore = false;
    } else {

      console.log('Multilanguage (widget-design) - WAITING TIME FOUND CHANGE - string does not contain space at last');

      // IS USED TO ADD A WHITE SPACE TO THE 'PERSONALIZATION' VALUE IF THE STRING DOES NOT CONTAIN SPACE AT LAST
      this.addWhiteSpaceBefore = true;
    }
  }

  insertAtCursor(myField, myValue) {
    console.log('Multilanguage (widget-design) - insertAtCursor - myValue ', myValue);
    // this.waitingTimeFoundMsg = myValue

    // if (this.addWhiteSpaceBefore === true) {
    //   myValue = ' ' + myValue;
    //   console.log('Multilanguage (widget-design) - insertAtCursor - myValue addWhiteSpaceBefore ', myValue );
    // }

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
      console.log('Multilanguage (widget-design) - insertAtCursor - startPos ', startPos);

      var endPos = myField.selectionEnd;
      console.log('Multilanguage (widget-design) - insertAtCursor - endPos ', endPos);

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
    console.log('Multilanguage (widget-design) - CALLOUT TITLE CHANGE: ', this.calloutTitle);
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
      console.log(`checkIsEmoji emoji ${emoji} — code points: ${[emoji].length}`);

      console.log(`checkIsEmoji emoji: ${emoji} — position: `, this.calloutTitleForPreview.indexOf(emoji));

      //  const  cutstr = calloutTitle.slice(0) 
      //  console.log(`Matched sequence ${emoji} — cutstr: `, cutstr);
      // let cutCalloutTitle = this.calloutTitleForPreview.replace(emoji, "");

      // this.calloutTitleForPreview = cutCalloutTitle;

      // console.log('checkIsEmoji calloutTitleForPreview (on calloutTitleChange)',this.calloutTitleForPreview);
      // cutCalloutTitle = calloutTitle;
      if (this.calloutTitleForPreview.indexOf(emoji) === 0) {

        let cutCalloutTitle = this.calloutTitleForPreview.replace(emoji, "");
        console.log(`checkIsEmoji emoji ${emoji} —  at position 0: `, emoji);

        console.log(`checkIsEmoji — CUTTED CalloutTitle: `, cutCalloutTitle);

        this.callout_emoticon = emoji;
        this.calloutTitleForPreview = cutCalloutTitle;

        // break;
      }
      // else {
      //   if (calloutTitle.indexOf(emoji) === 0) { 
      //   }
      //   this.calloutTitleForPreview =  calloutTitle.replace(emoji, "");
      // }
    }
  }

  // checkIsEmoji(calloutTitle) {
  //   let title = calloutTitle
  //   // if (this.g.calloutTitle && this.g.calloutTitle !== '') {
  //   //   title = this.g.calloutTitle;
  //   // }
  //   let index = 0;
  //   const codepoint = title.trim().codePointAt(0);
  //   const fistChar = String.fromCodePoint(codepoint);
  //   const isEm = isEmoji(fistChar);
  //   if (!isEm) {
  //     this.emoticon = null;
  //     this.title = title;
  //     return;
  //   }
  //   for (let i = 0; i <= title.trim().length; i++) {
  //     const point = title.trim().codePointAt(i);
  //     const char = String.fromCodePoint(point);
  //     const isEmot = isEmoji(char);
  //     if (isEmot === false) {
  //       index = i + 1;
  //       break;
  //     }
  //   }
  //   this.emoticon = fistChar;
  //   this.title = title.slice(index);
  // }

  calloutMsgChange(event) {
    this.calloutMsg = event
    console.log('Multilanguage (widget-design) - CALLOUT MSG CHANGE: ', this.calloutMsg);
    // if (event.length === 0) {  }
  }

 

  // ------------------------------------------------------------------------------------
  // Select language
  // ------------------------------------------------------------------------------------
  onSelectlang(selectedLang) {
    console.log('Multilanguage (widget-design) onSelectlang selectedLang ', selectedLang);
    this.selectedLangCode = selectedLang.code;
    console.log('Multilanguage (widget-design) ***** GET labels ***** onSelectlang (onSelectlang) ', this.selectedLangCode);
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


    console.log('Multilanguage (widget-design) ***** saveTranslation: ', this.selected_translation);

    this.saveLabels()

  }

  saveLabels() {
    console.log('Multilanguage (widget-design) ***** selectedLangCode (saveLabels) ', this.selectedLangCode);
    console.log('Multilanguage (widget-design) ***** defaultLangCode (saveLabels) ', this.defaultLangCode);

    let isdefault = null

    if (this.selectedLangCode === this.defaultLangCode) {
      isdefault = true
    }  else {
      isdefault = false
    }


    this.widgetService.editLabels(this.selectedLangCode.toUpperCase(), isdefault, this.selected_translation)
      .subscribe((labels: any) => {
        console.log('Multilanguage (widget-design) - saveTranslation RES ', labels);

      }, error => {
        console.log('Multilanguage (widget-design) - saveTranslation - ERROR ', error)
      }, () => {

        // if (!this.HAS_SELECTED_APPEARANCE && !this.HAS_SELECTED_CALLOUT && !this.HAS_SELECTED_CALLOUT) {
        //   // this.notify.showWidgetStyleUpdateNotification(this.updateWidgetSuccessNoticationMsg, 2, 'done');
        // }

        if (this.HAS_CHANGED_GREETINGS === true) {
           this.notify.showWidgetStyleUpdateNotification(this.updateWidgetSuccessNoticationMsg, 2, 'done');
        }
        console.log('Multilanguage (widget-design) - saveTranslation * COMPLETE *')
      });
  }

  getSectionSelected() {
    console.log('»» WIDGET DESIGN  url - this.router.url  ', this.router.url);
    const currentUrl = this.router.url;
    if (currentUrl.indexOf('/greetings') !== -1) {
      this.HAS_SELECTED_GREENTINGS = true;
      console.log('»» WIDGET DESIGN  url - HAS_SELECTED_GREENTINGS  ', this.HAS_SELECTED_GREENTINGS);
    } else {
      this.HAS_SELECTED_GREENTINGS = false;
      console.log('»» WIDGET DESIGN  url - HAS_SELECTED_GREENTINGS  ', this.HAS_SELECTED_GREENTINGS);
    }

    if (currentUrl.indexOf('/callout') !== -1) {
      this.HAS_SELECTED_CALLOUT = true;
      console.log('»» WIDGET DESIGN  url - HAS_SELECTED_CALLOUT  ', this.HAS_SELECTED_CALLOUT);
    } else {
      this.HAS_SELECTED_CALLOUT = false;
      console.log('»» WIDGET DESIGN  url - HAS_SELECTED_CALLOUT  ', this.HAS_SELECTED_CALLOUT);
    }

    if (currentUrl.indexOf('/appearance') !== -1) {
      this.HAS_SELECTED_APPEARANCE = true;
      console.log('»» WIDGET DESIGN  url - HAS_SELECTED_CALLOUT  ', this.HAS_SELECTED_CALLOUT);
    } else {
      this.HAS_SELECTED_APPEARANCE = false;
      console.log('»» WIDGET DESIGN  url - HAS_SELECTED_CALLOUT  ', this.HAS_SELECTED_CALLOUT);
    }
  }




  getBrowserLang() {
    this.browserLang = this.translate.getBrowserLang();
    console.log('WIDGET DESIGN - BROWSER LANG ', this.browserLang)
  }

  getCurrentProject() {
    this.sub = this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.id_project = project._id
        this.projectName = project.name;
        console.log('WIDGET DESIGN - SUBSCRIBE TO CURRENT - PRJCT-ID ', this.id_project)

        if (this.id_project) {
          this.getProjectById();
        }
      }
    });
  }


  getProjectById() {
    this.projectService.getProjectById(this.id_project).subscribe((project: any) => {
      // console.log('WIDGET DESIGN - GET PROJECT BY ID - PROJECT OBJECT: ', project);

      console.log('»» WIDGET DESIGN - PRJCT-WIDGET (onInit): ', project.widget);

      if (project.widget) {
        this.widgetObj = project.widget;

        // ------------------------------------------------------------------------
        // @ calloutTimer
        // WIDGET AND CALLOUT-TIMER DEFINED
        // ------------------------------------------------------------------------
        if (project.widget.calloutTimer) {
          this.calloutTimerSecondSelected = project.widget.calloutTimer;
          this.CALLOUT_IS_DISABLED = false;
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) CALLOUT-TIMER: ', this.calloutTimerSecondSelected,
            'IS DISABLED ', this.CALLOUT_IS_DISABLED);

        } else {

          // ------------------------------------------------------------------------
          // @ calloutTimer
          // WIDGET DEFINED BUT NOT CALLOUT-TIMER - SET DEFAULT
          // ------------------------------------------------------------------------
          console.log('»» WIDGET DESIGN - onInit WIDGET DEFINED BUT CALLOUT-TIMER IS: ', this.calloutTimerSecondSelected, ' > SET DEFAULT ')
          // this.calloutTimerSecondSelected = -1;
          this.calloutTimerSecondSelected = 5;
          this.CALLOUT_IS_DISABLED = true;
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) CALLOUT-TIMER: ', this.calloutTimerSecondSelected, ' - IS DISABLED ', this.CALLOUT_IS_DISABLED);

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

          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) LOGO URL: ', project.widget.logoChat,
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

          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) LOGO URL: ', project.widget.logoChat,
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

          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) LOGO URL: ', project.widget.logoChat,
            ' HAS HOWN LOGO ', this.hasOwnLogo,
            ' LOGO IS ON', this.LOGO_IS_ON);
        }

        if (project.widget.preChatForm) {

          this.preChatForm = true;
        } else {
          this.preChatForm = false;
        }


        // ------------------------------------------------------------------------
        // @ themeColor
        // themeColor (WIDGET AND THEME-COLOR DEFINED)
        // ------------------------------------------------------------------------
        if (project.widget.themeColor) {

          this.primaryColor = project.widget.themeColor;
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) THEME COLOR: ', this.primaryColor);
          this.primaryColorRgb = this.hexToRgb(this.primaryColor)
          this.generateRgbaGradientAndBorder(this.primaryColorRgb);
        } else {

          // ------------------------------------------------------------------------
          // @ themeColor
          // case themeColor IS undefined
          // themeColor (WIDGET DEFINED BUT NOT THEME-COLOR - SET DEFAULT)
          // ------------------------------------------------------------------------
          this.primaryColor = this.widgetDefaultSettings.themeColor

          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) THEME COLOR: ', project.widget.themeColor,
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
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) THEME-FOREGROUND COLOR: ', this.secondaryColor);
        } else {

          // ------------------------------------------------------------------------
          // @ themeForegroundColor
          // case themeForegroundColor IS undefined
          // themeForegroundColor (WIDGET DEFINED BUT NOT THEME-FOREGROUND-COLOR )
          // ------------------------------------------------------------------------
          this.secondaryColor = this.widgetDefaultSettings.themeForegroundColor;

          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) THEME-FOREGROUND COLOR: ', project.widget.themeForegroundColor,
            ' IS UNDEFINED > SET DEFAULT ', this.secondaryColor);
        }

        // ------------------------------------------------------------------------
        // @ Align
        // align (WIDGET AND ALIGN DEFINED)
        // ------------------------------------------------------------------------
        if (project.widget.align && project.widget.align === 'left') {
          this.hasSelectedLeftAlignment = true;
          this.hasSelectedRightAlignment = false;
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) ALIGN: ', project.widget.align);
        } else {

          // -----------------------------------------------------------------------
          // @ Align
          // WIDGET DEFINED BUT NOT ALIGN
          // -----------------------------------------------------------------------
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) ALIGN: ', project.widget.align, 'IS UNDEFINED > SET DEFAULT');
          this.hasSelectedLeftAlignment = false;
          this.hasSelectedRightAlignment = true;
        }

        // -----------------------------------------------------------------------
        // @ Reply time
        // WIDGET DEFINED
        // -----------------------------------------------------------------------
        console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) DYNAMIC REPLY TIME: ', project.widget.dynamicWaitTimeReply);

        if (project.widget.dynamicWaitTimeReply === true) {
          this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG = true;
          this.HAS_SELECT_STATIC_REPLY_TIME_MSG = false;
          console.log('»» WIDGET DESIGN - (onInit WIDGET UNDEFINED) >  HAS_SELECT_DYMANIC_REPLY_TIME_MSG: ', this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG);
          console.log('»» WIDGET DESIGN - (onInit WIDGET UNDEFINED) >  HAS_SELECT_DYMANIC_REPLY_TIME_MSG: ', this.HAS_SELECT_STATIC_REPLY_TIME_MSG);
        } else {
          this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG = false;
          this.HAS_SELECT_STATIC_REPLY_TIME_MSG = true;
          console.log('»» WIDGET DESIGN - (onInit WIDGET UNDEFINED) >  HAS_SELECT_DYMANIC_REPLY_TIME_MSG: ', this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG);
          console.log('»» WIDGET DESIGN - (onInit WIDGET UNDEFINED) >  HAS_SELECT_DYMANIC_REPLY_TIME_MSG: ', this.HAS_SELECT_STATIC_REPLY_TIME_MSG);
        }

      } else {

        this.widgetObj = {}
        console.log('»» WIDGET DESIGN - (onInit WIDGET UNDEFINED)');
        // -----------------------------------------------------------------------
        // @ LogoChat
        // WIDGET UNDEFINED
        // -----------------------------------------------------------------------
        // this.logoUrl = 'tiledesklogo'
        this.logoUrl = 'https://tiledesk.com/tiledesk-logo-white.png'
        this.hasOwnLogo = false;
        this.LOGO_IS_ON = true

        console.log('»» WIDGET DESIGN - (onInit WIDGET UNDEFINED) > SET DEFAULT LOGOURL: ',
          this.logoUrl, 'HAS OWN LOGO ', this.hasOwnLogo, 'LOGO IS ON ', this.LOGO_IS_ON);

        // -----------------------------------------------------------------------
        // @ themeColor
        // WIDGET UNDEFINED
        // -----------------------------------------------------------------------
        this.primaryColor = this.widgetDefaultSettings.themeColor
        console.log('»» WIDGET DESIGN - (onInit WIDGET UNDEFINED) > SET DEFAULT THEME COLOR: ', this.primaryColor);
        this.primaryColorRgb = this.hexToRgb(this.primaryColor)
        this.generateRgbaGradientAndBorder(this.primaryColorRgb);

        // -----------------------------------------------------------------------
        // @ themeForegroundColor
        // WIDGET UNDEFINED
        // -----------------------------------------------------------------------
        this.secondaryColor = this.widgetDefaultSettings.themeForegroundColor;
        console.log('»» WIDGET DESIGN - (onInit WIDGET UNDEFINED) > SET DEFAULT THEME-FOREGROUND COLOR: ', this.secondaryColor);

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

        // -----------------------------------------------------------------------
        // @ Reply time
        // WIDGET UNDEFINED
        // -----------------------------------------------------------------------
        this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG = true;
        this.HAS_SELECT_STATIC_REPLY_TIME_MSG = false;
        console.log('»» WIDGET DESIGN - (onInit WIDGET UNDEFINED) >  HAS_SELECT_DYMANIC_REPLY_TIME_MSG: ', this.HAS_SELECT_DYMANIC_REPLY_TIME_MSG);
        console.log('»» WIDGET DESIGN - (onInit WIDGET UNDEFINED) >  HAS_SELECT_DYMANIC_REPLY_TIME_MSG: ', this.HAS_SELECT_STATIC_REPLY_TIME_MSG);
      }

    }, (error) => {
      console.log('WIDGET DESIGN - GET PROJECT BY ID - ERROR ', error);
      this.showSpinner = false;
    }, () => {
      console.log('WIDGET DESIGN - GET PROJECT BY ID - COMPLETE ');

      this.showSpinner = false;
    });
  }



  ngAfterViewInit(): void {
    try {
      // name of the class of the html div = . + fragment
      const test = <HTMLElement>document.querySelector('.' + this.fragment)
      // console.log('»» WIDGET DESIGN - QUERY SELECTOR TEST  ', test)
      test.scrollIntoView();
      // document.querySelector('#' + this.fragment).scrollIntoView();
      // console.log( document.querySelector('#' + this.fragment).scrollIntoView())
    } catch (e) {
      // console.log('»» WIDGET DESIGN - QUERY SELECTOR ERROR  ', e)
    }
  }



  // ===========================================================================
  // ============== *** PRIMARY COLOR (alias for themeColor) ***  ==============
  // ===========================================================================
  /**
   * onChangePrimaryColor: USED FOR THE COLOR PREVIEW (IT IS NECESSARY FOR THE PRIMARY COLOR GIVEN THAT
   * FROM IT ARE GENERATED OTHER PROPERTIES - WITHOUT RUNS generateRgbaGradientAndBorder IN
   * THIS THE UPDATED COLORS OF THE WIDGET'S PREVIEW ARE VISIBLE ONLY AFTER PRESSED TO 'OK' IN onSelectPrimaryColor)
   * @param $event
   */
  onChangePrimaryColor($event) {

    this.DISPLAY_WIDGET_HOME = true;
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_CHAT = false;

    this.primaryColor = $event

    // console.log('+ WIDGET DESIGN - ON CHANGE PRIMARY COLOR ', $event);
    // this.widgetService.publishPrimaryColorSelected(this.primaryColor);
    this.primaryColorRgb = this.hexToRgb(this.primaryColor)
    console.log('»» WIDGET DESIGN - ON CHANGE PRIMARY COLOR - PRIMARY COLOR RGB ', this.primaryColorRgb);
    this.generateRgbaGradientAndBorder(this.primaryColorRgb);

  }

  onFocusChangePrimaryColor() {
    this.DISPLAY_WIDGET_HOME = true;
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_CHAT = false;
  }

  onOpenPrimaryColorDialog($event) {
    this.DISPLAY_WIDGET_HOME = true;
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_CHAT = false;
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

    // return result ? {
    //   r: parseInt(result[1], 16),
    //   g: parseInt(result[2], 16),
    //   b: parseInt(result[3], 16)
    // } : null;
  }

  onClosePrimaryColorDialog(event) {
    console.log('»» WIDGET DESIGN - ON CLOSE PRIMARY COLOR DIALOG ', event);
    this.primaryColor = event

    if (this.primaryColor !== this.widgetDefaultSettings.themeColor) {
      this.widgetObj['themeColor'] = this.primaryColor
    } else {

      // *** REMOVE PROPERTY
      delete this.widgetObj['themeColor'];
    }
  }


  generateRgbaGradientAndBorder(primaryColor: string) {
    // console.log('»» WIDGET DESIGN - ON CLOSE PRIMARY COLOR DIALOG COLOR (RGB) ', primaryColor);
    const new_col = primaryColor.replace(/rgb/i, 'rgba');
    this.primaryColorRgba = new_col.replace(/\)/i, ',0.50)');
    // console.log('»» WIDGET DESIGN - PRIMARY COLOR RGBA ', this.primaryColorRgba);

    this.primaryColorGradiend = `linear-gradient(${this.primaryColor}, ${this.primaryColorRgba})`;
    this.primaryColorBorder = `2.4px solid ${this.primaryColorRgba}`;
  }


  // =======================================================================================
  // ============== *** SECONDARY COLOR (alias for themeForegroundColor) ***  ==============
  // =======================================================================================

  onCloseSecondaryColorDialog(event) {
    console.log('»» WIDGET DESIGN - ON CLOSE SECONDARY DIALOG ', event);
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
    console.log('»» WIDGET DESIGN - onChangeSecondaryColor ', event);
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
    this.DISPLAY_WIDGET_HOME = true;
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_CHAT = false;
  }

  onFocusChangeSecondaryColor() {
    this.DISPLAY_WIDGET_HOME = true;
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_CHAT = false;
  }

  onFocusWelcomeMsg() {
    this.DISPLAY_WIDGET_HOME = true;
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_CHAT = false;
  }

  onFocusWelcomeTitle() {
    this.DISPLAY_WIDGET_HOME = true;
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_CHAT = false;
  }

  onFocusReplyTime() {
    this.DISPLAY_WIDGET_HOME = true;
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_CHAT = false;
  }

  // ---- NEW
  onFocusOnlineGreetings() {
    this.DISPLAY_WIDGET_HOME = false;
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_CHAT = true

    this.HAS_FOCUSED_ONLINE_MSG = true;
    this.HAS_FOCUSED_OFFLINE_MSG = false;
    this.HAS_FOCUSED_OFFICE_CLOSED_MSG = false;
  }

  onFocusOfflineGreetings() {
    this.DISPLAY_WIDGET_HOME = false;
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_CHAT = true;

    this.HAS_FOCUSED_ONLINE_MSG = false;
    this.HAS_FOCUSED_OFFLINE_MSG = true;
    this.HAS_FOCUSED_OFFICE_CLOSED_MSG = false;

  }

  onFocusOfficeClosedGreetings() {
    this.DISPLAY_WIDGET_HOME = false;
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_CHAT = true

    this.HAS_FOCUSED_ONLINE_MSG = false;
    this.HAS_FOCUSED_OFFLINE_MSG = false;
    this.HAS_FOCUSED_OFFICE_CLOSED_MSG = true;
  }



  setPresetColorComb(primaryColor: string, secondaryColor: string) {
    this.DISPLAY_WIDGET_HOME = true;
    this.DISPLAY_CALLOUT = false;
    this.DISPLAY_WIDGET_CHAT = false;

    console.log('»» WIDGET DESIGN - setPresetCombOne ', primaryColor, secondaryColor);
    this.primaryColor = primaryColor;
    this.secondaryColor = secondaryColor;

    this.onChangePrimaryColor(primaryColor);

    this.widgetObj['themeColor'] = primaryColor
    this.widgetObj['themeForegroundColor'] = secondaryColor
  }



  verifyImageURL(url, callBack) {
    const img = new Image();
    img.src = url;
    try {
      img.onload = () => {
        callBack(true);
      };
    } catch (err) {
      console.log('»» WIDGET DESIGN - verifyImageURL', err);
    }
    try {
      img.onerror = () => {
        callBack(false);
      };
    } catch (err) {
      console.log('»» WIDGET DESIGN - verifyImageURL', err);
    }
  }


  logoChange(event) {
    console.log('»» WIDGET DESIGN - logoChange event.length', event.length);

    if (event.length === 0) {
      this.hasOwnLogo = false;

    } else {

      if (this.LOGO_IS_ON === true) {

        this.verifyImageURL(event, (imageExists) => {
          // return imageExists
          if (imageExists === true) {
            console.log('checkImage Image Exists: ', imageExists);
            this.hasOwnLogo = true;
            this.IMAGE_EXIST = true;
          } else {
            console.log('checkImage Image Exists: ', imageExists);
            this.hasOwnLogo = false;
            this.IMAGE_EXIST = false;
          }
        });
      }
    }
  }


  // SWITCH BTN ON / OFF
  onLogoOnOff($event) {
    console.log('»» WIDGET DESIGN  - LOGO ON/OFF ', $event.target.checked)
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
      console.log('»» WIDGET DESIGN LOGO_IS_ON ', this.LOGO_IS_ON)
      this.hasOwnLogo = false;

      // CASE SWITCH BTN = ON
      // *** REMOVE PROPERTY
      delete this.widgetObj['logoChat'];
      console.log('»» WIDGET DESIGN - widgetObj', this.widgetObj);
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
        console.log('»» WIDGET DESIGN - HAS OWN LOGO ', this.hasOwnLogo, 'LOGO IS ON ', this.LOGO_IS_ON, ' logoUrl: ', this.logoUrl);
      } else {
        this.hasOwnLogo = false;
      }
      // *** ADD PROPERTY
      this.widgetObj['logoChat'] = this.logoUrl

    } else if (this.logoUrl && this.LOGO_IS_ON === false) {
      // if is defined logoUrl and LOGO_IS_ON === false set the property logoChat = to No Logo
      // use case: the logo btn on/off is setted as off and the user enter an logo url
      this.logoUrl = 'No Logo'
      console.log('»» WIDGET DESIGN - HAS OWN LOGO ', this.hasOwnLogo, 'LOGO IS ON ', this.LOGO_IS_ON, ' logoUrl: ', this.logoUrl);
      // *** ADD PROPERTY
      this.widgetObj['logoChat'] = 'nologo';

    } else {
      // if is not defined logoUrl remove the property logoChat
      // *** REMOVE PROPERTY
      delete this.widgetObj['logoChat'];

      // this.logoUrl = 'tiledesklogo'
      this.logoUrl = 'https://tiledesk.com/tiledesk-logo-white.png'
      this.hasOwnLogo = false;
      console.log('»» WIDGET DESIGN - HAS OWN LOGO ', this.hasOwnLogo, 'LOGO IS ON ', this.LOGO_IS_ON, ' logoUrl: ', this.logoUrl);
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


    if ($event.target.checked) {
      // this.calloutTimerSecondSelected = 5;
      this.CALLOUT_IS_DISABLED = false;
      this.widgetObj['calloutTimer'] = this.calloutTimerSecondSelected;

      console.log('»» WIDGET DESIGN CALLOUT TIMER - toggleCallout calloutTimerSecondSelected', this.calloutTimerSecondSelected);
    } else {

      // this.calloutTimerSecondSelected = -1;
      this.CALLOUT_IS_DISABLED = true;
      delete this.widgetObj['calloutTimer'];
      console.log('»» WIDGET DESIGN CALLOUT TIMER - toggleCallout calloutTimerSecondSelected', this.calloutTimerSecondSelected);
    }
  }

  onFocusCalloutTitle () {
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
    console.log('»» WIDGET DESIGN CALLOUT TIMER - TIMER SELECTED', this.calloutTimerSecondSelected);
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
  //   console.log('»» WIDGET DESIGN CALLOUT TIMER - TIMER SELECTED', this.calloutTimerSecondSelected);
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
      console.log('»» WIDGET - INCLUDE PRE CHAT FORM ', event.target.checked)
    } else {
      this.preChatForm = false;
      // *** REMOVE PROPERTY
      delete this.widgetObj['preChatForm'];
      this.widgetService.updateWidgetProject(this.widgetObj)

      console.log('»» WIDGET - INCLUDE PRE CHAT FORM ', event.target.checked)
    }
  }


  // -----------------------------------------------------------------------
  //  @ WIDGET ALIGNMENT (alias for align)   
  // -----------------------------------------------------------------------
  aligmentLeftSelected(left_selected: boolean) {

    this.DISPLAY_WIDGET_HOME = false;
    this.DISPLAY_CALLOUT = true;
    this.DISPLAY_WIDGET_CHAT = false;

    console.log('»» WIDGET DESIGN - LEFT ALIGNMENT SELECTED ', left_selected);
    this.hasSelectedLeftAlignment = true;
    this.hasSelectedRightAlignment = false;

    // *** ADD PROPERTY
    this.widgetObj['align'] = 'left'
  }

  aligmentRightSelected(right_selected: boolean) {
    this.DISPLAY_CALLOUT = true;
    this.DISPLAY_WIDGET_HOME = false;
    this.DISPLAY_WIDGET_CHAT = false;
    console.log('»» WIDGET DESIGN - RIGHT ALIGNMENT SELECTED ', right_selected);
    this.hasSelectedLeftAlignment = false;
    this.hasSelectedRightAlignment = true;

    // *** REMOVE PROPERTY
    delete this.widgetObj['align'];

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

  testWidgetPage() {
    this.elementRef.nativeElement.blur();
    // const url = 'http://testwidget.tiledesk.com/testsitenw3?projectname=' + this.projectName + '&projectid=' + this.id_project
    // const url = this.TESTSITE_BASE_URL + '?projectname=' + this.projectName + '&projectid=' + this.id_project + '&isOpen=true'
    const url = this.TESTSITE_BASE_URL + '?tiledesk_projectid=' + this.id_project + '&project_name=' + this.projectName + '&isOpen=true'

    console.log('»» WIDGET - TEST WIDGET URL ', url);
    window.open(url, '_blank');
  }



  avarageWaitingTimeCLOCK() {
    this.subscription = this.analyticsService.getDataAVGWaitingCLOCK().subscribe((res: any) => {

      if (res && res.length > 0) {
        if (res[0].waiting_time_avg) {
          if (res[0].waiting_time_avg !== null || res[0].waiting_time_avg !== undefined) {

            this.responseAVGtime = this.humanizer.humanize(res[0].waiting_time_avg, { round: true, language: this.lang })

            console.log('»» WIDGET DESIGN  Waiting time: humanize  this.responseAVGtime', this.responseAVGtime)
            // console.log('waiting time funtion:', this.humanizeDurations(res[0].waiting_time_avg));

          } else {

          }

        }
      }

    }, (error) => {

    }, () => {
      console.log('»» WIDGET DESIGN  - AVERAGE TIME CLOCK REQUEST * COMPLETE *');
    });
  }

  showWaitingTime() {
    // const projectid = this.g.projectid;
    this.analyticsService.getCurrentWaitingTime()
      .subscribe((res: any) => {

        console.log('»» WIDGET DESIGN  Waiting time: humanize  responseAVGtimeDario res', res)
        // that.g.wdLog(['response waiting', response]);
        // console.log('response waiting ::::', response);
        if (res && res.length > 0 && res[0].waiting_time_avg) {
          // const wt = response[0].waiting_time_avg;

          // that.waitingTime = wt;
          // that.g.wdLog([' that.waitingTime',  that.waitingTime]);
          // console.log('that.waitingTime', that.waitingTime);

          // const lang = that.translatorService.getLanguage();
          // console.log('lang', lang);
          // that.humanWaitingTime = this.humanizer.humanize(wt, {language: lang});

          const responseAVGtimeDario = this.humanizer.humanize(res[0].waiting_time_avg, { round: true, language: this.lang })

          console.log('»» WIDGET DESIGN  Waiting time: humanize  responseAVGtimeDario', responseAVGtimeDario)
          // console.log('xxx', this.humanizer.humanize(wt));
          // 'The team typically replies in ' + moment.duration(response[0].waiting_time_avg).format();
        }
        //  else {
        //   that.waitingTimeMessage = 'waiting_time_not_found';
        //   // that.waitingTimeMessage = 'Will reply as soon as they can';
        //  }
      });
  }



}
