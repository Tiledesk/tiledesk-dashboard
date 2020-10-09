import { Component, OnInit, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
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

// import brand from 'assets/brand/brand.json';
import { BrandService } from '../../services/brand.service';

@Component({
  selector: 'appdashboard-widget-design',
  templateUrl: './widget-design.component.html',
  styleUrls: ['./widget-design.component.scss']
})


export class WidgetDesignComponent extends WidgetDesignBaseComponent implements OnInit, AfterViewInit, OnDestroy {
  // '#2889e9'
  // tparams = brand;
  // company_name = brand.company_name;
  // company_site_url = brand.company_site_url;
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
  wd_availableTranslations: Array<any> = []

  public welcomeTitle: string;
  public placeholderWelcomeTitle: string;
  public welcomeMsg: string;
  public placeholderWelcomeMsg: string;
  public onlineMsg: string; // LABEL_FIRST_MSG
  public offlineMsg: string; // LABEL_FIRST_MSG_NO_AGENTS
  public officeClosedMsg: string; // LABEL_FIRST_MSG_OPERATING_HOURS_CLOSED
  placeholderOnlineMsg: string;
  placeholderOfflineMsg: string;
  placeholderofficeClosedMsg: string;
  placeholderCalloutTitle: string;
  placeholderCalloutMsg: string;
  isVisible: boolean;

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
    public brandService: BrandService
  ) {
    super(translate);
    const brand = brandService.getBrand();

    this.tparams = brand;
    this.company_name = brand['company_name'];
    this.company_site_url = brand['company_site_url'];
  }

  ngOnInit() {
    this.onInitframeHeight();
    this.getCurrentProject();
    this.getBrowserLang();

    this.route.fragment.subscribe(fragment => {
      this.fragment = fragment;
      console.log('+ WIDGET DESIGN - FRAGMENT ', this.fragment)
    });

    this.translateOnlineMsgSuccessNoticationMsg();
    this.translateOfflineMsgSuccessNoticationMsg();
    this.translateOfficeClosedSuccessNoticationMsg();
    this.getSectionSelected();
    this.translateGetTranslationErrorMsg();
    this.getLabels();
    this.getOSCODE();
    this.getTestSiteUrl();
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
      if (labels) {
        // this.translation = labels[0].data[0];
        this.translations = labels['data']
        // console.log('Multilanguage ***** GET labels ***** - RES > TRANSLATIONS ', labels[0].data[0]);
        console.log('Multilanguage (widget-design)***** GET labels ***** - RES > TRANSLATIONS ', this.translations);

        this.languages_codes = [];

        if (this.translations.filter(e => e.lang === 'EN').length > 0) {
          /* vendors contains the element we're looking for */
          console.log('Multilanguage (widget-design) ***** EN EXIST');

        } else {
          console.log('Multilanguage (widget-design) ***** ENGLISH TRANSLATION NOT EXIST');
          this.notify.showNotification(this.errorNoticationMsg, 4, 'report_problem');
        }

        this.translations.forEach(translation => {
          console.log('Multilanguage (widget-design) ***** GET labels ***** - RES >>> TRANSLATION ', translation);

          if (translation) {
            // se c'è inglese eseguo subito il push in languages_codes perle altre lang verifico se è presente _id
            // prima di eseguire il push

            if (translation.lang === 'EN') {
              this.languages_codes.push(translation.lang.toLowerCase());

              // this.engTraslationClone = Object.assign({}, translation['data']);
              // console.log('Multilanguage ***** GET labels ***** >>> engTraslationClone', this.engTraslationClone);
            }
            if (translation.lang !== 'EN') {
              console.log('Multilanguage (widget-design) ***** GET labels ***** - RES >>> TRANSLATION _id', translation._id);
              if (translation._id !== undefined) {
                this.languages_codes.push(translation.lang.toLowerCase())
              }
            }
          }
        });

        console.log('Multilanguage (widget-design) ***** GET labels ***** - Array of LANG CODE ', this.languages_codes);

        // const availableTranslations = [{ code: "it", name: "Italian" }, { code: "fr", name: "French" }, { code: "en", name: "English" }];
        const availableTranslations = this.doAvailableLanguageArray(this.languages_codes);
        console.log('Multilanguage (widget-design) ***** GET labels ***** - availableTranslations ', availableTranslations);

        // IN THE SELECT LANGUAGE COMBO DISPLAY AS SELECTED THE FIRST LANGUAGE IN ALPHABETICAL ORDER
        this.wd_availableTranslations = availableTranslations.sort(this.compare);
        console.log('Multilanguage (widget-design) ***** GET labels *****  ordered availableTranslations ', this.wd_availableTranslations);

        this.selectedLang = this.wd_availableTranslations[0].name;
        this.selectedLangCode = this.wd_availableTranslations[0].code;
        console.log('Multilanguage (widget-design) ***** GET labels *****  selectedLangCode ', this.selectedLangCode);

        this.getCurrentTranslation(this.selectedLangCode);
      }

    }, error => {
      console.log('Multilanguage (widget-design) ***** GET labels ***** - ERROR ', error)
    }, () => {
      console.log('Multilanguage (widget-design) ***** GET labels ***** * COMPLETE *')

      // this._selectTranslationTab('en', 'English')
    });
  }

  getCurrentTranslation(selectedLangCode: string) {
    console.log('Multilanguage (widget-design) init getCurrentTranslation ')
    this.translations.forEach(translation => {
      if (translation.lang.toLowerCase() === selectedLangCode) {

        this.selected_translation = translation.data
        console.log('Multilanguage (widget-design) ***** selected translation: ', this.selected_translation)

        // ---------------------------------------------------------------
        // @ Welcome title and company intro
        // ---------------------------------------------------------------
        this.welcomeTitle = this.selected_translation["WELLCOME_TITLE"];
        this.welcomeMsg = this.selected_translation["WELLCOME_MSG"];
        console.log('Multilanguage (widget-design) ***** selected translation WELLCOME_TITLE: ', this.welcomeTitle, '- WELLCOME_MSG: ', this.welcomeMsg);


        // ---------------------------------------------------------------
        // @ Callout title & msg
        // ---------------------------------------------------------------
        this.calloutTitle = this.selected_translation["CALLOUT_TITLE_PLACEHOLDER"];
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
      }
    });
  }

  welcomeTitleChange(event) {
    this.welcomeTitle = event;
    console.log('Multilanguage (widget-design) - WELCOME TITLE CHANGE: ', this.welcomeTitle);
    // if (event.length === 0) {    }
  }

  welcomeMsgChange(event) {
    this.welcomeMsg = event;
    console.log('Multilanguage (widget-design) - WELCOME MSG CHANGE: ', this.welcomeMsg);
    // if (event.length === 0) {  }
  }

  calloutTitleChange(event) {
    this.calloutTitle = event;
    console.log('Multilanguage (widget-design) - CALLOUT TITLE CHANGE: ', this.calloutTitle);
    // if (event.length === 0) {   }
  }

  calloutMsgChange(event) {
    this.calloutMsg = event
    console.log('Multilanguage (widget-design) - CALLOUT MSG CHANGE: ', this.calloutMsg);
    // if (event.length === 0) {  }
  }

  onChangeOnlineMsg(event) {
    this.onlineMsg = event;
    console.log('Multilanguage (widget-design) - ONLINE MSG CHANGE: ', this.onlineMsg);
    // if (event.length === 0) {  }
  }

  onChangeOfflineMsg(event) {
    this.offlineMsg = event;
    console.log('Multilanguage (widget-design) - OFFLINE MSG CHANGE: ', this.offlineMsg);
    // if (event.length === 0 || event) {  }
  }

  onChangeOfficeClosedMsg(event) {
    this.officeClosedMsg = event;
    console.log('Multilanguage (widget-design) - OFFICE CLOSED MSG CHANGE: ', this.officeClosedMsg);
    // if (event.length === 0 || event) {  }
  }



  // ------------------------------------------------------------------------------------
  // Select language
  // ------------------------------------------------------------------------------------
  onSelectlang(selectedLang) {
    console.log('Multilanguage (widget-design) onSelectlang selectedLang ', selectedLang);
    this.selectedLangCode = selectedLang.code;
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

    console.log('Multilanguage (widget-design) ***** saveTranslation: ', this.selected_translation);

    this.saveLabels()

  }

  saveLabels() {
    this.widgetService.editLabels(this.selectedLangCode.toUpperCase(), this.selected_translation)
      .subscribe((labels: any) => {
        console.log('Multilanguage (widget-design) - saveTranslation RES ', labels);

      }, error => {
        console.log('Multilanguage (widget-design) - saveTranslation - ERROR ', error)
      }, () => {

        if (!this.HAS_SELECTED_APPEARANCE) {
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





  testWidgetPage() {
    // const url = 'http://testwidget.tiledesk.com/testsitenw3?projectname=' + this.projectName + '&projectid=' + this.id_project
    // const url = this.TESTSITE_BASE_URL + '?projectname=' + this.projectName + '&projectid=' + this.id_project + '&isOpen=true'
    const url = this.TESTSITE_BASE_URL + '?tiledesk_projectid=' + this.id_project + '&project_name=' + this.projectName + '&isOpen=true'

    console.log('»» WIDGET - TEST WIDGET URL ', url);
    window.open(url, '_blank');
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
  }

  onInitframeHeight(): any {
    this.initInnerWidth = window.innerWidth;
    console.log('»» WIDGET DESIGN - INIT WIDTH ', this.initInnerWidth);
    if (this.newInnerWidth <= 668) {
      console.log('»» >>>> WIDGET DESIGN - NEW INNER WIDTH ', this.newInnerWidth);
      this.custom_breakpoint = true;
    } else {
      this.custom_breakpoint = false;
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
          console.log('»» WIDGET DESIGN - onInit WIDGET DEFINED BUT CALLOUT-TIMER IS: ', this.calloutTimerSecondSelected,
            ' > SET DEFAULT ')
          this.calloutTimerSecondSelected = -1;
          this.CALLOUT_IS_DISABLED = true;
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) CALLOUT-TIMER: ', this.calloutTimerSecondSelected,
            ' - IS DISABLED ', this.CALLOUT_IS_DISABLED);

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

      } else {

        this.widgetObj = {}

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
        this.calloutTimerSecondSelected = -1;
        this.CALLOUT_IS_DISABLED = true;

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
    this.primaryColor = $event

    // console.log('+ WIDGET DESIGN - ON CHANGE PRIMARY COLOR ', $event);
    // this.widgetService.publishPrimaryColorSelected(this.primaryColor);
    this.primaryColorRgb = this.hexToRgb(this.primaryColor)
    console.log('»» WIDGET DESIGN - ON CHANGE PRIMARY COLOR - PRIMARY COLOR RGB ', this.primaryColorRgb);
    this.generateRgbaGradientAndBorder(this.primaryColorRgb);

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

  setPresetColorComb(primaryColor: string, secondaryColor: string) {

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
  setSelectedCalloutTimer() {
    if (this.calloutTimerSecondSelected !== -1) {
      console.log('»» WIDGET DESIGN CALLOUT TIMER - TIMER SELECTED', this.calloutTimerSecondSelected);
      this.CALLOUT_IS_DISABLED = false;
      // *** ADD PROPERTY
      this.widgetObj['calloutTimer'] = this.calloutTimerSecondSelected;
      // UPDATE WIDGET PROJECT

      /**
       * *** WidgetProject IS UPDATED WHEN THE USER CLICK ON SAVE ***  */
      // this.widgetService.updateWidgetProject(this.widgetObj)

      // COMMENT AS FOR CALLOUT TITLE
      // this.widgetService.publishCalloutTimerSelected(this.calloutTimerSecondSelected)

    } else if (this.calloutTimerSecondSelected === -1) {
      console.log('»» WIDGET DESIGN CALLOUT TIMER - TIMER SELECTED', this.calloutTimerSecondSelected);
      this.CALLOUT_IS_DISABLED = true;
      // *** REMOVE PROPERTIES

      delete this.widgetObj['calloutTimer'];
    }
  }


  saveCalloutSettings() {
    const callout_settings_save_btn = <HTMLElement>document.querySelector('.callout-settings-save-btn');

    if (callout_settings_save_btn) {
      callout_settings_save_btn.blur()
    }
    this.widgetService.updateWidgetProject(this.widgetObj)
  }

  // =======================================================================================
  // ============== *** WIDGET ALIGNMENT (alias for align) ***  ==============
  // =======================================================================================
  aligmentLeftSelected(left_selected: boolean) {
    console.log('»» WIDGET DESIGN - LEFT ALIGNMENT SELECTED ', left_selected);
    this.hasSelectedLeftAlignment = true;
    this.hasSelectedRightAlignment = false;

    // *** ADD PROPERTY
    this.widgetObj['align'] = 'left'
  }

  aligmentRightSelected(right_selected: boolean) {
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




}
