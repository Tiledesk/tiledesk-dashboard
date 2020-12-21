import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { slideInAnimation } from '../../_animations/index';
import { BrandService } from '../../services/brand.service';
import { ProjectService } from '../../services/project.service';
import { TranslateService } from '@ngx-translate/core';
import { WidgetDesignBaseComponent } from '../../widget_components/widget-design/widget-design-base/widget-design-base.component';
import { WidgetService } from '../../services/widget.service';
import { AppConfigService } from '../../services/app-config.service';

@Component({
  selector: 'appdashboard-configure-widget',
  templateUrl: './configure-widget.component.html',
  styleUrls: ['./configure-widget.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [slideInAnimation],
  // tslint:disable-next-line:use-host-property-decorator
  host: { '[@slideInAnimation]': '' }
})
export class ConfigureWidgetComponent extends WidgetDesignBaseComponent implements OnInit {

  projectName: string;
  projectId: string;
  sub: Subscription;

  tparams: any;


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

  selectedLang: string;
  selectedLangCode: string;
  selectedLangName: string;
  //  wd_availableTranslations: Array<any> = []

  selectedTranslationCode: string;
  selectedTranslationLabel: string;
  temp_SelectedLangCode: string;
  temp_SelectedLangName: string;

  allDefaultTranslations: any

  constructor(
    private auth: AuthService,
    private router: Router,
    public brandService: BrandService,
    private projectService: ProjectService,
    public translate: TranslateService,
    private widgetService: WidgetService,
    public appConfigService: AppConfigService
  ) {
    super(translate);
    const brand = brandService.getBrand();

    this.tparams = brand;
    this.company_name = brand['company_name'];
    this.company_site_url = brand['company_site_url'];

  }

  ngOnInit() {
    this.getStorageBucket();
    this.getLoggedUser();
    this.getCurrentProject();
    // this.getEnDefaultTranslation();

    this.getALLDefaultTranslations();
  }

  getStorageBucket() {
    const firebase_conf = this.appConfigService.getConfig().firebase;
    this.storageBucket = firebase_conf['storageBucket'];
    console.log('STORAGE-BUCKET WIZARD - CONFIGURE WIDGET ', this.storageBucket)
  }

  getLoggedUser() {
    this.auth.user_bs.subscribe((user) => {
      console.log('USER GET IN »» WIZARD - CONFIGURE WIDGET ', user)
      if (user) {
        this.currentUserId = user._id;
        console.log('WIZARD - CONFIGURE WIDGET Current USER ID ', this.currentUserId)
      }
    });
  }

  getCurrentProject() {
    this.sub = this.auth.project_bs
      .subscribe((project) => {

        // console.log('00 -> InstallTiledeskComponent project from AUTH service subscription  ', project)

        if (project) {
          this.projectId = project._id;
          this.projectName = project.name;
          this.getProjectById();
        }
        console.log('WIZARD - CONFIGURE WIDGET - projectId  ', this.projectId);
        console.log('WIZARD - CONFIGURE WIDGET - projectName  ', this.projectName);
      });
  }

  getProjectById() {
    this.projectService.getProjectById(this.projectId).subscribe((project: any) => {
      // console.log('WIDGET DESIGN - GET PROJECT BY ID - PROJECT OBJECT: ', project);

      console.log('WIZARD - CONFIGURE WIDGET - PRJCT-WIDGET (onInit): ', project.widget);

      if (project.widget) {
        this.widgetObj = project.widget;



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

          console.log('WIZARD - CONFIGURE WIDGET - (onInit WIDGET DEFINED) LOGO URL: ', project.widget.logoChat,
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

          console.log('WIZARD - CONFIGURE WIDGET - (onInit WIDGET DEFINED) LOGO URL: ', project.widget.logoChat,
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

          console.log('WIZARD - CONFIGURE WIDGET - (onInit WIDGET DEFINED) LOGO URL: ', project.widget.logoChat,
            ' HAS HOWN LOGO ', this.hasOwnLogo,
            ' LOGO IS ON', this.LOGO_IS_ON);
        }


        // ------------------------------------------------------------------------
        // @ themeColor
        // themeColor (WIDGET AND THEME-COLOR DEFINED)
        // ------------------------------------------------------------------------
        if (project.widget.themeColor) {

          this.primaryColor = project.widget.themeColor;
          console.log('WIZARD - CONFIGURE WIDGET -(onInit WIDGET DEFINED) THEME COLOR: ', this.primaryColor);
          this.primaryColorRgb = this.hexToRgb(this.primaryColor)
          this.generateRgbaGradientAndBorder(this.primaryColorRgb);
        } else {

          // ------------------------------------------------------------------------
          // @ themeColor
          // case themeColor IS undefined
          // themeColor (WIDGET DEFINED BUT NOT THEME-COLOR - SET DEFAULT)
          // ------------------------------------------------------------------------
          this.primaryColor = this.widgetDefaultSettings.themeColor

          console.log('WIZARD - CONFIGURE WIDGET - (onInit WIDGET DEFINED) THEME COLOR: ', project.widget.themeColor,
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
          console.log('WIZARD - CONFIGURE WIDGET - (onInit WIDGET DEFINED) THEME-FOREGROUND COLOR: ', this.secondaryColor);
        } else {

          // ------------------------------------------------------------------------
          // @ themeForegroundColor
          // case themeForegroundColor IS undefined
          // themeForegroundColor (WIDGET DEFINED BUT NOT THEME-FOREGROUND-COLOR )
          // ------------------------------------------------------------------------
          this.secondaryColor = this.widgetDefaultSettings.themeForegroundColor;

          console.log('WIZARD - CONFIGURE WIDGET - (onInit WIDGET DEFINED) THEME-FOREGROUND COLOR: ', project.widget.themeForegroundColor,
            ' IS UNDEFINED > SET DEFAULT ', this.secondaryColor);
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

        console.log('WIZARD - CONFIGURE WIDGET - (onInit WIDGET UNDEFINED) > SET DEFAULT LOGOURL: ',
          this.logoUrl, 'HAS OWN LOGO ', this.hasOwnLogo, 'LOGO IS ON ', this.LOGO_IS_ON);

        // -----------------------------------------------------------------------
        // @ themeColor
        // WIDGET UNDEFINED
        // -----------------------------------------------------------------------
        this.primaryColor = this.widgetDefaultSettings.themeColor
        console.log('WIZARD - CONFIGURE WIDGET - (onInit WIDGET UNDEFINED) > SET DEFAULT THEME COLOR: ', this.primaryColor);
        this.primaryColorRgb = this.hexToRgb(this.primaryColor)
        this.generateRgbaGradientAndBorder(this.primaryColorRgb);

        // -----------------------------------------------------------------------
        // @ themeForegroundColor
        // WIDGET UNDEFINED
        // -----------------------------------------------------------------------
        this.secondaryColor = this.widgetDefaultSettings.themeForegroundColor;
        console.log('WIZARD - CONFIGURE WIDGET - (onInit WIDGET UNDEFINED) > SET DEFAULT THEME-FOREGROUND COLOR: ', this.secondaryColor);


      }

    }, (error) => {
      console.log('WIZARD - CONFIGURE WIDGET - GET PROJECT BY ID - ERROR ', error);
      // this.showSpinner = false;
    }, () => {
      console.log('WIZARD - CONFIGURE WIDGET - GET PROJECT BY ID - COMPLETE ');

      // this.showSpinner = false;
    });
  }


  // 
  setPresetColorComb(primaryColor: string, secondaryColor: string) {
    this.DISPLAY_WIDGET_HOME = true;
    this.DISPLAY_CALLOUT = false;

    console.log('»» WIDGET DESIGN - setPresetCombOne ', primaryColor, secondaryColor);
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

    // console.log('+ WIDGET DESIGN - ON CHANGE PRIMARY COLOR ', $event);
    // this.widgetService.publishPrimaryColorSelected(this.primaryColor);
    this.primaryColorRgb = this.hexToRgb(this.primaryColor)
    console.log('WIZARD - CONFIGURE WIDGET - ON CHANGE PRIMARY COLOR - PRIMARY COLOR RGB ', this.primaryColorRgb);
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
    console.log('WIZARD - CONFIGURE WIDGET - ON CLOSE PRIMARY COLOR DIALOG ', event);
    this.primaryColor = event

    if (this.primaryColor !== this.widgetDefaultSettings.themeColor) {
      this.widgetObj['themeColor'] = this.primaryColor
    } else {

      // *** REMOVE PROPERTY
      delete this.widgetObj['themeColor'];
    }
  }

  onCloseSecondaryColorDialog(event) {
    console.log('WIZARD - CONFIGURE WIDGET - ON CLOSE SECONDARY DIALOG ', event);
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
    console.log('WIZARD - CONFIGURE WIDGET - onChangeSecondaryColor ', event);
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
    // console.log('»» WIDGET DESIGN - ON CLOSE PRIMARY COLOR DIALOG COLOR (RGB) ', primaryColor);
    const new_col = primaryColor.replace(/rgb/i, 'rgba');
    this.primaryColorRgba = new_col.replace(/\)/i, ',0.50)');
    // console.log('»» WIDGET DESIGN - PRIMARY COLOR RGBA ', this.primaryColorRgba);

    this.primaryColorGradiend = `linear-gradient(${this.primaryColor}, ${this.primaryColorRgba})`;
    this.primaryColorBorder = `2.4px solid ${this.primaryColorRgba}`;
  }


  getALLDefaultTranslations() {

    // USED TO PRESELECT ENGLISH LANGUAGE AVLUE IN THE SELECT LANGUAGE COMBO BOX
    this.selectedLang = 'English'
    // this.selectedTranslationLabel = 'en'


    // ENGLISH ARE USED AS DEFAULT IF THE USER DOESN'T SELECT ANY OTHER ONE LANGUAGE
    this.temp_SelectedLangName = 'English';
    this.temp_SelectedLangCode = 'en'

    this.widgetService.getAllDefaultLabels().subscribe((translations: any) => {

      if (translations) {
        this.allDefaultTranslations = translations;
        console.log('WIZARD - CONFIGURE WIDGET ***** GET * ALL * TRANSLATIONS ***** - RES', translations);

        this.setCurrentTranslation('en') 

      }
    })
  }


  setCurrentTranslation(selectedlangcode) {
    console.log('WIZARD - CONFIGURE WIDGET *****  selectedlangcode selectedlangcode', selectedlangcode);
  
    this.allDefaultTranslations.forEach(translation => {
      console.log('WIZARD - CONFIGURE WIDGET *****  selectedlangcode translation', translation);
     
      if (translation.lang.toLowerCase() === selectedlangcode) {

        this.defaultTranslation = translation.data
        console.log('WIZARD - CONFIGURE WIDGET *****  DEFAULT TRANSLATION data', this.defaultTranslation);
        console.log('WIZARD - CONFIGURE WIDGET *****  DEFAULT TRANSLATION code', selectedlangcode);
        // ---------------------------------------------------------------
        // @ Welcome title and company intro
        // ---------------------------------------------------------------
        this.welcomeTitle = this.defaultTranslation["WELLCOME_TITLE"];
        this.welcomeMsg = this.defaultTranslation["WELLCOME_MSG"];

        this.waitingTimeNotFoundMsg = this.defaultTranslation["WAITING_TIME_NOT_FOUND"];
        this.waitingTimeFoundMsg = this.defaultTranslation["WAITING_TIME_FOUND"];

        this.newConversation = this.defaultTranslation["LABEL_START_NW_CONV"];

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
      console.log('WIZARD - CONFIGURE WIDGET selected TEMP Lang Code ', this.temp_SelectedLangCode);
      console.log('WIZARD - CONFIGURE WIDGET selected TEMP Lang label ', this.temp_SelectedLangName);
    
      this.setCurrentTranslation(this.temp_SelectedLangCode) 

    }
  }


  // -----------------------------------------------------
  // Select default language
  // -----------------------------------------------------
  getEnDefaultTranslation() {

    this.widgetService.getEnDefaultLabels().subscribe((labels: any) => {
      console.log('WIZARD - CONFIGURE WIDGET ***** GET labels ***** - RES', labels);
      if (labels) {
        // this.translation = labels[0].data[0];
        this.defaultTranslation = labels['data']
        // console.log('Multilanguage ***** GET labels ***** - RES > TRANSLATIONS ', labels[0].data[0]);
        console.log('WIZARD - CONFIGURE WIDGET ***** GET labels ***** - RES > DEFAULT TRANSLATION ', this.defaultTranslation);


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


        // this.languages_codes = [];

        // if (this.translations.filter(e => e.lang === 'EN').length > 0) {
        //   /* vendors contains the element we're looking for */
        //   console.log('WIZARD - CONFIGURE WIDGET ***** EN EXIST');

        // } else {
        //   console.log('WIZARD - CONFIGURE WIDGET ***** ENGLISH TRANSLATION NOT EXIST');
        //   // this.notify.showNotification(this.errorNoticationMsg, 4, 'report_problem');
        // }

        // this.translations.forEach(translation => {
        //   console.log('WIZARD - CONFIGURE WIDGET ***** GET labels ***** - RES >>> TRANSLATION ', translation);

        //   if (translation) {
        //     // se c'è inglese eseguo subito il push in languages_codes perle altre lang verifico se è presente _id
        //     // prima di eseguire il push

        //     if (translation.lang === 'EN') {
        //       this.languages_codes.push(translation.lang.toLowerCase());

        //       this.engTraslationClone = Object.assign({}, translation['data']);
        //       // console.log('Multilanguage ***** GET labels ***** >>> engTraslationClone', this.engTraslationClone);
        //     }
        //     if (translation.lang !== 'EN') {
        //       console.log('WIZARD - CONFIGURE WIDGET ***** GET labels ***** - RES >>> TRANSLATION _id', translation._id);

        //       // UNA LINGUA DIVERSA DALL'INGLESE FA PARTE DEL PROGETTO SE HA UN ID ED è IN QUESTO CASO CHE L'AGGIUNGO TRA LE DISPONIBILI
        //       // (INFATTI LE LINGUE CON L'ID SONO QUELLE CHE AGGIUNGE L'UTENTE - ANCHE L'INGLESE AVRA' L'ID SE VIENE MODIFICATA)
        //       if (translation._id !== undefined) {
        //         this.languages_codes.push(translation.lang.toLowerCase())
        //       }
        //     }
        //   }
        // });
        // console.log('WIZARD - CONFIGURE WIDGET ***** GET labels ***** - Array of LANG CODE ', this.languages_codes);
        // this.doAvailableLanguageArray(this.languages_codes);
        // this.languages_codes = [];
        // const availableTranslations = this.doAvailableLanguageArray(this.languages_codes);
        // console.log('WIZARD - CONFIGURE WIDGET *****  AVAILABLE TRANSLATION ', availableTranslations);
      }

    }, error => {
      console.log('WIZARD - CONFIGURE WIDGET ***** GET labels ***** - ERROR ', error)
    }, () => {
      console.log('WIZARD - CONFIGURE WIDGET ***** GET labels ***** * COMPLETE *')
      // this.showSheleton = false;


    });
  }





 

  continueToInstallScript() {

    this.router.navigate([`/project/${this.projectId}/install-widget`]);
    console.log('WIZARD - CONFIGURE WIDGET ***** CONTINUE  this.temp_SelectedLangCode', this.temp_SelectedLangCode);
    console.log('WIZARD - CONFIGURE WIDGET ***** CONTINUE  this.temp_SelectedLangCode', this.temp_SelectedLangName)
    this.addNewLanguage();
    this.saveWidgetApparance()
  }

  saveWidgetApparance() {
    this.widgetService.updateWidgetProject(this.widgetObj)
  }

  addNewLanguage() {

    this.selectedTranslationCode = this.temp_SelectedLangCode
    this.selectedTranslationLabel = this.temp_SelectedLangName
    console.log('WIZARD - CONFIGURE WIDGET ***** ADD-NEW-LANG selectedTranslationCode', this.selectedTranslationCode);
    console.log('WIZARD - CONFIGURE WIDGET ***** ADD-NEW-LANG selectedTranslationLabel', this.selectedTranslationLabel);

    // cloneLabel CHE RITORNERA IN RESPONSE LA NUOVA LINGUA (l'inglese nel caso non sia una delle nostre lingue pretradotte)
    this.widgetService.cloneLabel(this.temp_SelectedLangCode.toUpperCase())
      .subscribe((res: any) => {
        // console.log('Multilanguage - addNewLanguage - CLONE LABEL RES ', res);
        console.log('WIZARD - CONFIGURE WIDGET - ADD-NEW-LANG (clone-label) RES ', res.data);

        if (res) {

          // UPDATE THE ARRAY TRANSLATION CREATED ON INIT

        }

      }, error => {
        console.log('WIZARD - CONFIGURE WIDGET ADD-NEW-LANG (clone-label) - ERROR ', error)
      }, () => {
        console.log('WIZARD - CONFIGURE WIDGET ADD-NEW-LANG (clone-label) * COMPLETE *')

      });

    // // ADD THE NEW LANGUAGE TO BOTTOM NAV
    const newLang = { code: this.temp_SelectedLangCode, name: this.temp_SelectedLangName };
    console.log('Multilanguage saveNewLanguage newLang objct ', newLang);

    this.availableTranslations.push(newLang)
    console.log('Multilanguage saveNewLanguage availableTranslations ', this.availableTranslations)
  }

}
