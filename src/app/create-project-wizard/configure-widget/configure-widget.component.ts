import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs'
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
// import { slideInAnimation } from '../../_animations/index';
import { BrandService } from '../../services/brand.service';
import { ProjectService } from '../../services/project.service';
import { TranslateService } from '@ngx-translate/core';
import { WidgetSetUpBaseComponent } from '../../widget_components/widget-set-up/widget-set-up-base/widget-set-up-base.component';
import { WidgetService } from '../../services/widget.service';
import { AppConfigService } from '../../services/app-config.service';
import { LoggerService } from '../../services/logger/logger.service';
import { Location } from '@angular/common';
import { tranlatedLanguage } from 'app/utils/util';

@Component({
  selector: 'appdashboard-configure-widget',
  templateUrl: './configure-widget.component.html',
  styleUrls: ['./configure-widget.component.scss'],
  encapsulation: ViewEncapsulation.None,
  // animations: [slideInAnimation],
  // tslint:disable-next-line:use-host-property-decorator
  // host: { '[@slideInAnimation]': '' }
})
export class ConfigureWidgetComponent extends WidgetSetUpBaseComponent implements OnInit {
  companyLogo: string;
  projectName: string;
  projectId: string;
  sub: Subscription;
  // tparams: any;
  // CLOSE_BTN_IS_HIDDEN = true;
  DISPLAY_WIDGET_HOME = true;
  DISPLAY_CALLOUT = false;
  public company_name: any;
  public company_site_url: any;

  public widgetObj = {};
  public primaryColorGradiend: string;
  public LOGO_IS_ON: boolean;
  public hasOwnLogo = false;
  public logoUrl: string;
  public secondaryColor: string;
  public primaryColorBorder: string;
  public primaryColor: string;
  public primaryColorRgb: any
  public primaryColorRgba: string;
  public hasSelectedLeftAlignment = false
  public hasSelectedRightAlignment = true
  public C21_BODY_HOME = true
  public storageBucket: string;
  public imageUrl: string;
  public UPLOAD_ENGINE_IS_FIREBASE: boolean;
  public currentUserId: string;

  public engTraslationClone: object;
  public defaultTranslation: any
  public selected_translation: Array<any> = []
  public languages_codes: any;

  // get from default TRANSLATION
  public welcomeTitle: string;
  public welcomeMsg: string;
  public waitingTimeNotFoundMsg: string; // WAITING_TIME_NOT_FOUND
  public waitingTimeFoundMsg: string; //  WAITING_TIME_FOUND
  public newConversation: string // LABEL_START_NW_CONV
  public noConversation: string // NO_CONVERSATION

  selectedLang: string;
  selectedLangCode: string;
  selectedLangName: string;
  //  wd_availableTranslations: Array<any> = []

  selectedTranslationCode: string;
  selectedTranslationLabel: string;
  temp_SelectedLangCode: string;
  temp_SelectedLangName: string;

  allDefaultTranslations: any
  HAS_SELECT_STATIC_REPLY_TIME_MSG: boolean = true;
  // EXIST_STORED_ROUTE: boolean = false
  storedRoute: string;
  browser_lang: string;
  public widgetLogoURL: string;

  constructor(
    private auth: AuthService,
    private router: Router,
    public brandService: BrandService,
    private projectService: ProjectService,
    public translate: TranslateService,
    private widgetService: WidgetService,
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    public location: Location
  ) {
    super(translate);
    const brand = brandService.getBrand();
    this.companyLogo = brand['BASE_LOGO'];
    // this.tparams = brand;
    this.company_name = brand['BRAND_NAME'];
    this.company_site_url = brand['COMPANY_SITE_URL'];
   
    // this.widgetLogoURL = brand['widget_logo_URL']
    this.widgetLogoURL = brand['WIDGET']['LOGO_CHAT'];
    this.logger.log('[WIZARD - CONFIGURE-WIDGET] widgetLogoURL ', this.widgetLogoURL)
  }

  ngOnInit() {
    this.getProfileImageStorage();
    this.getLoggedUser();
    this.getCurrentProject();
    // this.checkCurrentUrlAndHideCloseBtn();
    this.getALLDefaultTranslations();

    // this.getStoredRoute()
  }



  getProfileImageStorage() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {
      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.imageUrl = firebase_conf['storageBucket'];
      this.logger.log('[WIZARD - CONFIGURE-WIDGET] IMAGE STORAGE ', this.imageUrl, 'usecase firebase')
    } else {
      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.imageUrl = this.appConfigService.getConfig().SERVER_BASE_URL;
      this.logger.log('[WIZARD - CONFIGURE-WIDGET] IMAGE STORAGE ', this.imageUrl, 'usecase native')
    }
  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      this.logger.log('[WIZARD - CONFIGURE-WIDGET] USER ', user)
      if (user) {
        this.currentUserId = user._id;
        this.logger.log('[WIZARD - CONFIGURE-WIDGET] CURRENT USER ID ', this.currentUserId)
      }
    });
  }

  getCurrentProject() {
    this.sub = this.auth.project_bs
      .subscribe((project) => {
        if (project) {
          this.projectId = project._id;
          this.projectName = project.name;
          this.getProjectById();
        }
        this.logger.log('[WIZARD - CONFIGURE-WIDGET] - projectId  ', this.projectId);
        this.logger.log('[WIZARD - CONFIGURE-WIDGET] - projectName  ', this.projectName);
      });
  }

  getProjectById() {
    this.projectService.getProjectById(this.projectId).subscribe((project: any) => {
      // console.log('WIDGET DESIGN - GET PROJECT BY ID - PROJECT OBJECT: ', project);
      this.logger.log('[WIZARD - CONFIGURE-WIDGET] - PRJCT-WIDGET (onInit): ', project.widget);

      if (project.widget) {
        this.widgetObj = project.widget;
        // ------------------------------------------------------------------------
        // @ Logochat
        // case logoChat = 'userCompanyLogoUrl' > display the userCompanyLogoUrl
        // logoChat (WIDGET AND LOGOCHAT DEFINED - USER HAS SETTED HIS LOGO)
        // ------------------------------------------------------------------------
        // if (project.widget.logoChat && project.widget.logoChat !== 'nologo' && project.widget.logoChat !== 'https://tiledesk.com/tiledesk-logo-white.png') {
        if (project.widget.logoChat && project.widget.logoChat !== 'nologo' && project.widget.logoChat !== this.widgetLogoURL) {
          this.logoUrl = project.widget.logoChat;
          this.hasOwnLogo = true;
          this.LOGO_IS_ON = true;

          this.logger.log('[WIZARD - CONFIGURE-WIDGET] - (onInit WIDGET DEFINED) LOGO URL: ', project.widget.logoChat,
            ' HAS HOWN LOGO ', this.hasOwnLogo,
            ' LOGO IS ON', this.LOGO_IS_ON);

          // ------------------------------------------------------------------------
          // @ Logochat
          // case logoChat = 'nologo' > no logo is displayed
          // logoChat (WIDGET AND LOGOCHAT DEFINED - USER HAS SELECTED 'NO LOGO') 
          // ------------------------------------------------------------------------
        // } else if (project.widget.logoChat && project.widget.logoChat === 'nologo' && project.widget.logoChat !== 'https://tiledesk.com/tiledesk-logo-white.png') {
        } else if (project.widget.logoChat && project.widget.logoChat === 'nologo' && project.widget.logoChat !== this.widgetLogoURL) {
          this.logoUrl = 'No Logo';
          this.hasOwnLogo = false;
          this.LOGO_IS_ON = false;

          this.logger.log('[WIZARD - CONFIGURE-WIDGET] - (onInit WIDGET DEFINED) LOGO URL: ', project.widget.logoChat,
            ' HAS HOWN LOGO ', this.hasOwnLogo,
            ' LOGO IS ON', this.LOGO_IS_ON);


          // ------------------------------------------------------------------------
          // @ Logochat
          // case logoChat = '' > display the tiledesk logo and in the input field display the text 'tiledesklogo'
          // logoChat (WIDGET DEFINED BUT NOT LOGOCHAT - SET DEFAULT)
          // ------------------------------------------------------------------------
        } else {
          
          this.logoUrl = this.widgetLogoURL; //'https://tiledesk.com/tiledesk-logo-white.png'
          this.hasOwnLogo = false;
          this.LOGO_IS_ON = true

          this.logger.log('[WIZARD - CONFIGURE-WIDGET] - (onInit WIDGET DEFINED) LOGO URL: ', project.widget.logoChat,
            ' HAS HOWN LOGO ', this.hasOwnLogo,
            ' LOGO IS ON', this.LOGO_IS_ON);
        }


        // ------------------------------------------------------------------------
        // @ themeColor
        // themeColor (WIDGET AND THEME-COLOR DEFINED)
        // ------------------------------------------------------------------------
        if (project.widget.themeColor) {

          this.primaryColor = project.widget.themeColor;
          this.logger.log('WIZARD - CONFIGURE WIDGET -(onInit WIDGET DEFINED) THEME COLOR: ', this.primaryColor);
          this.primaryColorRgb = this.hexToRgb(this.primaryColor)
          this.generateRgbaGradientAndBorder(this.primaryColorRgb);
        } else {

          // ------------------------------------------------------------------------
          // @ themeColor
          // case themeColor IS undefined
          // themeColor (WIDGET DEFINED BUT NOT THEME-COLOR - SET DEFAULT)
          // ------------------------------------------------------------------------
          this.primaryColor = this.widgetDefaultSettings.themeColor

          this.logger.log('[WIZARD - CONFIGURE-WIDGET] - (onInit WIDGET DEFINED) THEME COLOR: ', project.widget.themeColor,
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
          this.logger.log('[WIZARD - CONFIGURE-WIDGET] - (onInit WIDGET DEFINED) THEME-FOREGROUND COLOR: ', this.secondaryColor);
        } else {

          // ------------------------------------------------------------------------
          // @ themeForegroundColor
          // case themeForegroundColor IS undefined
          // themeForegroundColor (WIDGET DEFINED BUT NOT THEME-FOREGROUND-COLOR )
          // ------------------------------------------------------------------------
          this.secondaryColor = this.widgetDefaultSettings.themeForegroundColor;

          this.logger.log('[WIZARD - CONFIGURE-WIDGET]- (onInit WIDGET DEFINED) THEME-FOREGROUND COLOR: ', project.widget.themeForegroundColor,
            ' IS UNDEFINED > SET DEFAULT ', this.secondaryColor);
        }

      } else {

        this.widgetObj = {}

        // -----------------------------------------------------------------------
        // @ LogoChat
        // WIDGET UNDEFINED
        // -----------------------------------------------------------------------
        // this.logoUrl = 'tiledesklogo'
        this.logoUrl = this.widgetLogoURL; // 'https://tiledesk.com/tiledesk-logo-white.png'
        this.hasOwnLogo = false;
        this.LOGO_IS_ON = true

        this.logger.log('[WIZARD - CONFIGURE-WIDGET] - (onInit WIDGET UNDEFINED) > SET DEFAULT LOGOURL: ',
          this.logoUrl, 'HAS OWN LOGO ', this.hasOwnLogo, 'LOGO IS ON ', this.LOGO_IS_ON);

        // -----------------------------------------------------------------------
        // @ themeColor
        // WIDGET UNDEFINED
        // -----------------------------------------------------------------------
        this.primaryColor = this.widgetDefaultSettings.themeColor
        this.logger.log('[WIZARD - CONFIGURE-WIDGET] - (onInit WIDGET UNDEFINED) > SET DEFAULT THEME COLOR: ', this.primaryColor);
        this.primaryColorRgb = this.hexToRgb(this.primaryColor)
        this.generateRgbaGradientAndBorder(this.primaryColorRgb);

        // -----------------------------------------------------------------------
        // @ themeForegroundColor
        // WIDGET UNDEFINED
        // -----------------------------------------------------------------------
        this.secondaryColor = this.widgetDefaultSettings.themeForegroundColor;
        this.logger.log('[WIZARD - CONFIGURE-WIDGET] - (onInit WIDGET UNDEFINED) > SET DEFAULT THEME-FOREGROUND COLOR: ', this.secondaryColor);
      }
    }, (error) => {
      this.logger.error('[WIZARD - CONFIGURE-WIDGET] - GET PROJECT BY ID - ERROR ', error);
    }, () => {
      this.logger.log('[WIZARD - CONFIGURE-WIDGET] - GET PROJECT BY ID - COMPLETE ');
    });
  }


  // 
  setPresetColorComb(primaryColor: string, secondaryColor: string) {
    this.DISPLAY_WIDGET_HOME = true;
    this.DISPLAY_CALLOUT = false;

    this.logger.log('[WIZARD - CONFIGURE-WIDGET] - setPresetComb ', primaryColor, secondaryColor);
    this.primaryColor = primaryColor;
    this.secondaryColor = secondaryColor;

    this.onChangePrimaryColor(primaryColor);

    this.widgetObj['themeColor'] = primaryColor
    this.widgetObj['themeForegroundColor'] = secondaryColor
  }

  onChangePrimaryColor($event) {
    this.DISPLAY_WIDGET_HOME = true;
    this.DISPLAY_CALLOUT = false;

    this.primaryColor = $event

    // this.logger.log('+ WIDGET DESIGN - ON CHANGE PRIMARY COLOR ', $event);
    // this.widgetService.publishPrimaryColorSelected(this.primaryColor);
    this.primaryColorRgb = this.hexToRgb(this.primaryColor)
    this.logger.log('[WIZARD - CONFIGURE-WIDGET] - ON CHANGE PRIMARY COLOR - PRIMARY COLOR RGB ', this.primaryColorRgb);
    this.generateRgbaGradientAndBorder(this.primaryColorRgb);
  }

  onFocusChangePrimaryColor() {
    this.DISPLAY_WIDGET_HOME = true;
    this.DISPLAY_CALLOUT = false;
  }

  onOpenPrimaryColorDialog($event) {
    this.DISPLAY_WIDGET_HOME = true;
    this.DISPLAY_CALLOUT = false;
  }



  onClosePrimaryColorDialog(event) {
    this.logger.log('[WIZARD - CONFIGURE-WIDGET] - ON CLOSE PRIMARY COLOR DIALOG ', event);
    this.primaryColor = event

    if (this.primaryColor !== this.widgetDefaultSettings.themeColor) {
      this.widgetObj['themeColor'] = this.primaryColor
    } else {

      // *** REMOVE PROPERTY
      delete this.widgetObj['themeColor'];
    }
  }

  onCloseSecondaryColorDialog(event) {
    this.logger.log('[WIZARD - CONFIGURE-WIDGET] - ON CLOSE SECONDARY DIALOG ', event);
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
    this.logger.log('[WIZARD - CONFIGURE-WIDGET] - onChangeSecondaryColor ', event);
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

  generateRgbaGradientAndBorder(primaryColor: string) {
    // this.logger.log('[WIZARD - CONFIGURE-WIDGET] - ON CLOSE PRIMARY COLOR DIALOG COLOR (RGB) ', primaryColor);
    const new_col = primaryColor.replace(/rgb/i, 'rgba');
    this.primaryColorRgba = new_col.replace(/\)/i, ',0.50)');
    // this.logger.log('[WIZARD - CONFIGURE-WIDGET] - PRIMARY COLOR RGBA ', this.primaryColorRgba);

    this.primaryColorGradiend = `linear-gradient(${this.primaryColor}, ${this.primaryColorRgba})`;
    this.primaryColorBorder = `2.4px solid ${this.primaryColorRgba}`;
  }


  getALLDefaultTranslations() {
    this.browser_lang = this.translate.getBrowserLang();
    // console.log('[WIZARD - CONFIGURE-WIDGET] - browser_lang ', this.browser_lang)
    if (tranlatedLanguage.includes(this.browser_lang)) {
      const langName = this.getLanguageNameFromCode(this.browser_lang)
      // console.log('[WIZARD - CONFIGURE-WIDGET] - langName ', langName)
      this.selectedLang = langName
      this.temp_SelectedLangName = langName;
      this.temp_SelectedLangCode = this.browser_lang
    } else {
      // USED TO PRESELECT ENGLISH LANGUAGE VALUE IN THE SELECT LANGUAGE COMBO BOX
      this.selectedLang = 'English'
      // this.selectedTranslationLabel = 'en'
      // ENGLISH ARE USED AS DEFAULT IF THE USER DOESN'T SELECT ANY OTHER ONE LANGUAGE
      this.temp_SelectedLangName = 'English';
      this.temp_SelectedLangCode = 'en'
    }

    this.widgetService.getAllDefaultLabels().subscribe((translations: any) => {

      if (translations) {
        this.allDefaultTranslations = translations;
        this.logger.log('[WIZARD - CONFIGURE-WIDGET] ***** GET * ALL * TRANSLATIONS ***** - RES', translations);

        this.setCurrentTranslation(this.temp_SelectedLangCode)

      }
    })
  }


  setCurrentTranslation(selectedlangcode) {
    this.logger.log('[WIZARD - CONFIGURE-WIDGET] *****  selectedlangcode selectedlangcode', selectedlangcode);

    this.allDefaultTranslations.forEach(translation => {
      this.logger.log('[WIZARD - CONFIGURE-WIDGET] *****  selectedlangcode translation', translation);

      if (translation.lang.toLowerCase() === selectedlangcode) {

        this.defaultTranslation = translation.data
        this.logger.log('[WIZARD - CONFIGURE-WIDGET] *****  DEFAULT TRANSLATION data', this.defaultTranslation);
        this.logger.log('[WIZARD - CONFIGURE-WIDGET] *****  DEFAULT TRANSLATION code', selectedlangcode);
        // ---------------------------------------------------------------
        // @ Welcome title and company intro
        // ---------------------------------------------------------------
        // this.welcomeTitle = this.defaultTranslation["WELLCOME_TITLE"];
        // this.welcomeMsg = this.defaultTranslation["WELLCOME_MSG"];

        this.welcomeTitle = this.defaultTranslation["WELCOME_TITLE"];
        if (this.defaultTranslation.hasOwnProperty("WELLCOME_TITLE") ) {
          this.welcomeTitle = this.defaultTranslation["WELLCOME_TITLE"];
        }

        this.welcomeMsg = this.defaultTranslation["WELCOME_MSG"];
        if (this.defaultTranslation.hasOwnProperty("WELLCOME_MSG") ) {
          this.welcomeMsg = this.defaultTranslation["WELLCOME_MSG"];
        }

        this.waitingTimeNotFoundMsg = this.defaultTranslation["WAITING_TIME_NOT_FOUND"];
        this.waitingTimeFoundMsg = this.defaultTranslation["WAITING_TIME_FOUND"];

        this.newConversation = this.defaultTranslation["LABEL_START_NW_CONV"];

        this.noConversation = this.defaultTranslation["NO_CONVERSATION"];

        // // USED TO PRESELECT ENGLISH LANGUAGE AVLUE IN THE SELECT LANGUAGE COMBO BOX
        // this.selectedLang = 'English'
        // // this.selectedTranslationLabel = 'en'


        // // ENGLISH ARE USED AS DEFAULT IF THE USER DOESN'T SELECT ANY OTHER ONE LANGUAGE
        // this.temp_SelectedLangName = 'English';
        // this.temp_SelectedLangCode = 'en'

      }
    });
  }

  onSelectlang(selectedLang) {
    if (selectedLang) {

      this.temp_SelectedLangCode = selectedLang.code;
      this.temp_SelectedLangName = selectedLang.name;
      this.logger.log('[WIZARD - CONFIGURE-WIDGET] selected TEMP Lang Code ', this.temp_SelectedLangCode);
      this.logger.log('[WIZARD - CONFIGURE-WIDGET] selected TEMP Lang label ', this.temp_SelectedLangName);

      this.setCurrentTranslation(this.temp_SelectedLangCode)

    }
  }

  continueToNextStep() {
    this.saveWidgetApparance();


    this.goToOnboardingInstallScript()
    // this.goToOnboardingChatbotSetUp()

    // console.log('[WIZARD - CONFIGURE-WIDGET] ***** CONTINUE  this.temp_SelectedLangCode', this.temp_SelectedLangCode);
    // console.log('[WIZARD - CONFIGURE-WIDGET] ***** CONTINUE  this.temp_SelectedLangCode', this.temp_SelectedLangName)
    // this.addNewLanguage();

  }

  goToOnboardingChatbotSetUp() {
    this.router.navigate([`/project/${this.projectId}/onboarding/` + this.temp_SelectedLangCode + '/' + this.temp_SelectedLangName]);
  }

  goToOnboardingInstallScript() {
    // console.log('[WIZARD - CONFIGURE-WIDGET] ***** CONTINUE projectId', this.projectId)
    this.router.navigate([`/project/${this.projectId}/install-widget/` + this.temp_SelectedLangCode + '/' + this.temp_SelectedLangName]);
    // console.log('[WIZARD - CONFIGURE-WIDGET] ***** CONTINUE  this.temp_SelectedLangCode', this.temp_SelectedLangCode);
    // console.log('[WIZARD - CONFIGURE-WIDGET] ***** CONTINUE  this.temp_SelectedLangCode', this.temp_SelectedLangName)
    // this.addNewLanguage();
  }

  saveWidgetApparance() {
    this.widgetService.updateWidgetProject(this.widgetObj)
  }

  addNewLanguage() {
    this.selectedTranslationCode = this.temp_SelectedLangCode
    this.selectedTranslationLabel = this.temp_SelectedLangName
    this.logger.log('[WIZARD - CONFIGURE-WIDGET] ***** ADD-NEW-LANG selectedTranslationCode', this.selectedTranslationCode);
    this.logger.log('[WIZARD - CONFIGURE-WIDGET]***** ADD-NEW-LANG selectedTranslationLabel', this.selectedTranslationLabel);

    // cloneLabel CHE RITORNERA IN RESPONSE LA NUOVA LINGUA (l'inglese nel caso non sia una delle nostre lingue pretradotte)
    this.widgetService.cloneLabel(this.temp_SelectedLangCode.toUpperCase())
      .subscribe((res: any) => {
        // this.logger.log('Multilanguage - addNewLanguage - CLONE LABEL RES ', res);
        this.logger.log('[WIZARD - CONFIGURE-WIDGET] - ADD-NEW-LANG (clone-label) RES ', res.data);

        // if (res) {
        //   // UPDATE THE ARRAY TRANSLATION CREATED ON INIT
        // }

      }, error => {
        this.logger.error('[WIZARD - CONFIGURE-WIDGET] ADD-NEW-LANG (clone-label) - ERROR ', error)
      }, () => {
        this.logger.log('[WIZARD - CONFIGURE-WIDGET] ADD-NEW-LANG (clone-label) * COMPLETE *')

      });

    // // ADD THE NEW LANGUAGE TO BOTTOM NAV
    const newLang = { code: this.temp_SelectedLangCode, name: this.temp_SelectedLangName };
    this.logger.log('[WIZARD - CONFIGURE-WIDGET] Multilanguage saveNewLanguage newLang objct ', newLang);

    this.availableTranslations.push(newLang)
    this.logger.log('[WIZARD - CONFIGURE-WIDGET] Multilanguage saveNewLanguage availableTranslations ', this.availableTranslations)
  }

  // -----------------------------------------------------
  // Select default language
  // -----------------------------------------------------
  getEnDefaultTranslation() {
    this.widgetService.getEnDefaultLabels().subscribe((labels: any) => {
      this.logger.log('[WIZARD - CONFIGURE-WIDGET] ***** GET labels ***** - RES', labels);
      if (labels) {
        // this.translation = labels[0].data[0];
        this.defaultTranslation = labels['data']
        // this.logger.log('Multilanguage ***** GET labels ***** - RES > TRANSLATIONS ', labels[0].data[0]);
        this.logger.log('[WIZARD - CONFIGURE-WIDGET] ***** GET labels ***** - RES > DEFAULT TRANSLATION ', this.defaultTranslation);


        // ---------------------------------------------------------------
        // @ Welcome title and company intro
        // ---------------------------------------------------------------
        this.welcomeTitle = this.defaultTranslation["WELLCOME_TITLE"];
        this.welcomeMsg = this.defaultTranslation["WELLCOME_MSG"];

        this.waitingTimeNotFoundMsg = this.defaultTranslation["WAITING_TIME_NOT_FOUND"];
        this.waitingTimeFoundMsg = this.defaultTranslation["WAITING_TIME_FOUND"];

        this.newConversation = this.defaultTranslation["LABEL_START_NW_CONV"];

        // USED TO PRESELECT ENGLISH LANGUAGE AVLUE IN THE SELECT LANGUAGE COMBO BOX
        this.selectedLang = 'English'
        // this.selectedTranslationLabel = 'en'


        // ENGLISH ARE USED AS DEFAULT IF THE USER DOESN'T SELECT ANY OTHER ONE LANGUAGE
        this.temp_SelectedLangName = 'English';
        this.temp_SelectedLangCode = 'en'

      }

    }, error => {
      this.logger.error('[WIZARD - CONFIGURE-WIDGET] ***** GET labels ***** - ERROR ', error)
    }, () => {
      this.logger.log('[WIZARD - CONFIGURE-WIDGET] ***** GET labels ***** * COMPLETE *')

    });
  }

  goBack() {
    this.location.back();
  }

}
