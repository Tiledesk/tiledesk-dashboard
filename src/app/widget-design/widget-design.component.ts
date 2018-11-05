import { Component, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { slideInOutAnimation } from './slide-in-out.animation';
import { ColorPickerService, Cmyk } from 'ngx-color-picker';
import { WidgetService } from '../services/widget.service';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { AuthService } from '../core/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { Department } from '../models/department-model';
import { DepartmentService } from '../services/mongodb-department.service';

@Component({
  selector: 'appdashboard-widget-design',
  templateUrl: './widget-design.component.html',
  styleUrls: ['./widget-design.component.scss']
})


export class WidgetDesignComponent implements OnInit, AfterViewInit {
  // '#2889e9'
  public primaryColor: string;
  public primaryColorRgb: any
  public primaryColorRgba: string;
  public primaryColorGradiend: string;
  public primaryColorBorder: string;

  public secondaryColor: string;

  public logoUrl: string;


  public hasOwnLogo = false;
  public welcomeTitle: string;
  // public defaultItWelcomeTitle = 'Ciao, benvenuto su tiledesk';
  // public defaultEnWelcomeTitle = 'Hi, welcome to tiledesk';


  public welcomeMsg: string;
  niko: string;
  public id_project: string;

  default_dept: Department[];

  public widgetDefaultSettings =
    {
      'preChatForm': false,
      'calloutTimer': -1,
      'align': 'right',
      'logoChat': 'tiledesklogo',
      'themeColor': '#2a6ac1',
      'themeForegroundColor': '#ffffff',
      'en': {
        'wellcomeTitle': 'Hi, welcome to tiledesk 👋 ',
        'wellcomeMsg': 'How can we help?',
        'calloutTitle': 'Need Help?',
        'calloutMsg': 'Click here and start chatting with us!',
        'online_msg': 'Describe shortly your problem, you will be contacted by an agent.',
        // tslint:disable-next-line:max-line-length
        'offline_msg': '🤔 All operators are offline at the moment. You can anyway describe your problem. It will be assigned to the support team who will answer you as soon as possible.'
      },
      'it': {
        'wellcomeTitle': 'Ciao, benvenuto su tiledesk 👋 ',
        'wellcomeMsg': 'Come possiamo aiutare?',
        'calloutTitle': 'Bisogno di aiuto?',
        'calloutMsg': 'Clicca qui e inizia a chattare con noi!',
        'online_msg': 'Descrivi sinteticamente il tuo problema, ti metteremo in contatto con un operatore specializzato.',
        // tslint:disable-next-line:max-line-length
        'offline_msg': '🤔 Tutti gli operatori sono offline al momento.Puoi comunque descrivere il tuo problema. Sarà assegnato al team di supporto che ti risponderà appena possibile.'
      },
    }


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
  calloutTimerOptions = [
    { seconds: 'disabled', value: -1 },
    { seconds: 'immediately', value: 0 },
    { seconds: '5', value: 5 },
    { seconds: '10', value: 10 },
    { seconds: '15', value: 15 },
    { seconds: '20', value: 20 },
    { seconds: '25', value: 25 },
    { seconds: '30', value: 30 }
  ]

  calloutTitle: string;
  calloutTitleText: string;
  // _calloutTitle: string;
  escaped_calloutTitle: string;

  calloutMsg: string;
  calloutMsgText: string;
  escaped_calloutMsg: string;

  CALLOUT_IS_DISABLED: boolean;

  defaultdept_id: string;
  onlineMsg: string;
  offlineMsg: string;

  newInnerWidth: any;
  initInnerWidth: any;
  custom_breakpoint: boolean;

  constructor(
    public location: Location,
    private cpService: ColorPickerService,
    private widgetService: WidgetService,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private auth: AuthService,
    private translate: TranslateService,
    private departmentService: DepartmentService
  ) { }

  ngOnInit() {
    this.onInitframeHeight();

    this.getCurrentProject();
    this.getDeptsByProjectId();

    this.getBrowserLang();

    this.route.fragment.subscribe(fragment => {
      this.fragment = fragment;
      console.log('+ WIDGET DESIGN - FRAGMENT ', this.fragment)
    });



    // PRIMARY COLOR AND PROPERTIES CALCULATED FROM IT
    // this.primaryColor = 'rgb(40, 137, 233)';
    // this.primaryColor = this.widgetDefaultSettings.themeColor
    // console.log('»» WIDGET DESIGN - on init ' , this.primaryColor);
    // this.primaryColorRgba = 'rgba(40, 137, 233, 0.50)';
    // this.primaryColorGradiend = `linear-gradient(${this.primaryColor}, ${this.primaryColorRgba})`;
    // this.primaryColorBorder = `2.4px solid ${this.primaryColorRgba}`;

    // this.secondaryColor = 'rgb(255, 255, 255)';

    // this.logoUrl = '../assets/img/tiledesk_logo_white_small.png'
    this.subscribeToSelectedPrimaryColor();

    this.subscribeToSelectedSecondaryColor();

    this.subscribeToWidgetAlignment();

  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.newInnerWidth = event.target.innerWidth;
    console.log('»» WIDGET DESIGN - NEW INNER WIDTH ', this.newInnerWidth);
    if (this.newInnerWidth <= 668) {
      console.log('»» >>>> WIDGET DESIGN - NEW INNER WIDTH ', this.newInnerWidth);
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
    this.auth.project_bs.subscribe((project) => {
      if (project) {
        this.id_project = project._id
        console.log('WIDGET DESIGN - SUBSCRIBE TO CURRENT - PRJCT-ID ', this.id_project)

        if (this.id_project) {
          this.getProjectById();
        }
      }
    });
  }

  /**
   * ===============================================================================
   * ================== GET DEFAULT DEPT ONLINE / OFFLINE MSG ======================
   * ===============================================================================
   */
  getDeptsByProjectId() {
    this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {
      // console.log('ROUTING PAGE - DEPTS (FILTERED FOR PROJECT ID)', departments);

      if (departments) {
        departments.forEach(dept => {

          if (dept.default === true) {
            console.log('»» WIDGET DESIGN - DEFAULT DEPT ', dept);

            this.defaultdept_id = dept._id;
            console.log('»» WIDGET DESIGN - DEFAULT DEPT id ', this.defaultdept_id);

            // ONLINE MSG
            if (dept.online_msg) {
              this.onlineMsg = dept.online_msg
            } else {

              this.setDefaultOnlineMsg()
            }

            // OFFLINE MSG
            if (dept.offline_msg) {
              this.offlineMsg = dept.offline_msg
            } else {

              this.setDefaultOfflineMsg()
            }
          }
        });
      }
    });
  }

  /**
   * ===============================================================================
   * ================================= ONLINE  MSG =================================
   * ===============================================================================
   */
  onBlurSaveOnlineMsg() {
    console.log('»» WIDGET DESIGN - CALLING ON-BLUR-SAVE-ONLINE-MSG');
    if (this.browserLang === 'it') {
      if (this.onlineMsg !== this.widgetDefaultSettings.it.online_msg) {

        // *** ADD PROPERTY
        this.widgetObj['online_msg'] = this.onlineMsg;
        // UPDATE WIDGET PROJECT
        this.updateOnlineMsg(this.onlineMsg)
      }
    }

    if (this.browserLang === 'en') {
      if (this.onlineMsg !== this.widgetDefaultSettings.en.online_msg) {

        // *** ADD PROPERTY
        // this.widgetObj['online_msg'] = this.onlineMsg;
        // UPDATE WIDGET PROJECT
        this.updateOnlineMsg(this.onlineMsg)
      }
    }

  }

  updateOnlineMsg(onlineMsg: string) {
    this.departmentService.updateDefaultDeptOnlineMsg(this.defaultdept_id, onlineMsg)
      .subscribe((data) => {
        console.log('»» WIDGET DESIGN - UPDATE DEFAULT DEPT ONLINE MSG - RESPONSE ', data);
      }, (error) => {
        console.log('»» WIDGET DESIGN - UPDATE DEFAULT DEPT ONLINE MSG - ERROR ', error);
      }, () => {
        console.log('»» WIDGET DESIGN - UPDATE DEFAULT DEPT ONLINE MSG * COMPLETE *');
      });
  }

  onChangeOnlineMsg(event) {

    if (event.length === 0) {
      console.log('»» WIDGET DESIGN - DEFAULT DEPT ONLINE MSG LENGHT (modelChange) is ', event.length, ' SET DEFAULT ONLINE MSG');
      this.setDefaultOnlineMsg();
    }
  }

  setDefaultOnlineMsg() {
    if (this.browserLang) {
      if (this.browserLang === 'it') {

        this.onlineMsg = this.widgetDefaultSettings.it.online_msg;
        console.log('»» WIDGET DESIGN - DEFAULT ONLINE MSG ', this.onlineMsg);

        // *** REMOVE PROPERTY
        // delete this.widgetObj['calloutTitle'];
        // UPDATE WIDGET PROJECT
        // this.widgetService.updateWidgetProject(this.widgetObj)
        const onlineMsg = ''
        this.updateOnlineMsg(onlineMsg)

      } else {

        this.onlineMsg = this.widgetDefaultSettings.en.online_msg;
        console.log('»» WIDGET DESIGN - DEFAULT ONLINE MSG ', this.onlineMsg);

        const onlineMsg = ''
        this.updateOnlineMsg(onlineMsg)

        // *** REMOVE PROPERTY
        // delete this.widgetObj['calloutTitle'];
        // UPDATE WIDGET PROJECT
        // this.widgetService.updateWidgetProject(this.widgetObj)
      }
    }
  }

  /**
   * ================================================================================
   * ================================= OFFLINE  MSG =================================
   * ================================================================================
   */
  onBlurSaveOfflineMsg() {
    console.log('»» WIDGET DESIGN - CALLING ON-BLUR-SAVE-OFFLINE-MSG');
    if (this.browserLang === 'it') {
      if (this.offlineMsg !== this.widgetDefaultSettings.it.offline_msg) {

        // *** ADD PROPERTY
        // this.widgetObj['online_msg'] = this.onlineMsg;
        // UPDATE WIDGET PROJECT
        this.updateOfflineMsg(this.offlineMsg)
      }
    }

    if (this.browserLang === 'en') {
      if (this.offlineMsg !== this.widgetDefaultSettings.en.offline_msg) {

        // *** ADD PROPERTY
        // this.widgetObj['online_msg'] = this.onlineMsg;
        // UPDATE WIDGET PROJECT
        this.updateOfflineMsg(this.offlineMsg)
      }
    }

  }

  updateOfflineMsg(offlineMsg: string) {
    this.departmentService.updateDefaultDeptOfflineMsg(this.defaultdept_id, offlineMsg)
      .subscribe((data) => {
        console.log('»» WIDGET DESIGN - UPDATE DEFAULT DEPT OFFLINE MSG - RESPONSE ', data);
      }, (error) => {
        console.log('»» WIDGET DESIGN - UPDATE DEFAULT DEPT OFFLINE MSG - ERROR ', error);
      }, () => {
        console.log('»» WIDGET DESIGN - UPDATE DEFAULT DEPT OFFLINE MSG * COMPLETE *');
      });
  }

  onChangeOfflineMsg(event) {
    if (event.length === 0) {
      console.log('»» WIDGET DESIGN - DEFAULT DEPT OFFLINE MSG LENGHT (modelChange) is ', event.length, ' SET DEFAULT OFFLINE MSG');
      this.setDefaultOfflineMsg();
    }

  }

  setDefaultOfflineMsg() {
    if (this.browserLang) {
      if (this.browserLang === 'it') {

        this.offlineMsg = this.widgetDefaultSettings.it.offline_msg;
        console.log('»» WIDGET DESIGN - DEFAULT OFFLINE MSG ', this.offlineMsg);

        // *** REMOVE PROPERTY
        // delete this.widgetObj['calloutTitle'];
        // UPDATE WIDGET PROJECT
        // this.widgetService.updateWidgetProject(this.widgetObj)

        const offlineMsg = '';
        this.updateOfflineMsg(offlineMsg);
      } else {

        this.offlineMsg = this.widgetDefaultSettings.en.offline_msg;
        console.log('»» WIDGET DESIGN - DEFAULT OFFLINE MSG ', this.offlineMsg);

        const offlineMsg = '';
        this.updateOfflineMsg(offlineMsg);
        // *** REMOVE PROPERTY
        // delete this.widgetObj['calloutTitle'];
        // UPDATE WIDGET PROJECT
        // this.widgetService.updateWidgetProject(this.widgetObj)
      }
    }
  }


  getProjectById() {
    this.projectService.getProjectById(this.id_project).subscribe((project: any) => {
      // console.log('WIDGET DESIGN - GET PROJECT BY ID - PROJECT OBJECT: ', project);

      console.log('»» WIDGET DESIGN - PRJCT-WIDGET (onInit): ', project.widget);

      if (project.widget) {

        this.widgetObj = project.widget;

        /**
         * ******************************** calloutTimer (WIDGET DEFINED) *******************************************
         */
        if (project.widget.calloutTimer) {
          this.calloutTimerSecondSelected = project.widget.calloutTimer;
          this.CALLOUT_IS_DISABLED = false;
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) CALLOUT TIMER: ', this.calloutTimerSecondSelected,
            'IS DISABLED ', this.CALLOUT_IS_DISABLED);

        } else {
          this.calloutTimerSecondSelected = -1;
          this.CALLOUT_IS_DISABLED = true;
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) CALLOUT TIMER: ', this.calloutTimerSecondSelected,
            'IS SET DEFAULT  - IS DISABLED ', this.CALLOUT_IS_DISABLED);

        }

        /**
         * ******************************** calloutTitle (WIDGET DEFINED) *******************************************
         */
        if (project.widget.calloutTitle) {
          this.calloutTitle = project.widget.calloutTitle;
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) CALLOUT TITLE: ', this.calloutTitle);
        } else {
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) CALLOUT TITLE: ', this.calloutTitle, 'IS UNDEFINED > SET DEFAULT');
          this.setDefaultcalloutTitle();
        }

        /**
         * ******************************** calloutMsg (WIDGET DEFINED) *******************************************
         */
        if (project.widget.calloutMsg) {
          this.calloutMsg = project.widget.calloutMsg;
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) CALLOUT MSG: ', this.calloutMsg);
        } else {
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) CALLOUT MSG: ', this.calloutMsg, 'IS UNDEFINED > SET DEFAULT');
          this.setDefaultcalloutMsg();
        }


        /**
         * ********************************  logoChat (WIDGET DEFINED) ****************************************
         */
        // case logoChat = 'userCompanyLogoUrl' > display the userCompanyLogoUrl
        if (project.widget.logoChat && project.widget.logoChat !== 'nologo' && project.widget.logoChat !== 'tiledesklogo') {

          this.logoUrl = project.widget.logoChat;
          this.hasOwnLogo = true;
          this.LOGO_IS_ON = true;

          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) LOGO URL: ', project.widget.logoChat,
            ' HAS HOWN LOGO ', this.hasOwnLogo,
            ' LOGO IS ON', this.LOGO_IS_ON);

          // case logoChat = 'nologo' > no logo is displayed
        } else if (project.widget.logoChat && project.widget.logoChat === 'nologo' && project.widget.logoChat !== 'tiledesklogo') {
          this.logoUrl = 'No Logo';
          this.hasOwnLogo = false;
          this.LOGO_IS_ON = false;

          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) LOGO URL: ', project.widget.logoChat,
            ' HAS HOWN LOGO ', this.hasOwnLogo,
            ' LOGO IS ON', this.LOGO_IS_ON);

          // case logoChat = '' > display the tiledesk logo and in the input field display the text 'tiledesklogo'
        } else {
          this.logoUrl = 'tiledesklogo'
          this.hasOwnLogo = false;
          this.LOGO_IS_ON = true

          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) LOGO URL: ', project.widget.logoChat,
            ' HAS HOWN LOGO ', this.hasOwnLogo,
            ' LOGO IS ON', this.LOGO_IS_ON);
        }

        /**
         * ******************************** themeColor (WIDGET DEFINED) ****************************************
         */
        if (project.widget.themeColor) {

          this.primaryColor = project.widget.themeColor;
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) THEME COLOR: ', this.primaryColor);
          this.primaryColorRgb = this.hexToRgb(this.primaryColor)
          this.generateRgbaGradientAndBorder(this.primaryColorRgb);
        } else {
          // case themeColor IS undefined
          this.primaryColor = this.widgetDefaultSettings.themeColor
          // tslint:disable-next-line:max-line-length
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) THEME COLOR: ', project.widget.themeColor, 'IS UNDEFINED > SET DEFAULT ', this.primaryColor);

          this.primaryColorRgb = this.hexToRgb(this.primaryColor)
          this.generateRgbaGradientAndBorder(this.primaryColorRgb);
        }

        /**
         * ******************************** themeForegroundColor (WIDGET DEFINED) ********************************
         */
        if (project.widget.themeForegroundColor) {
          this.secondaryColor = project.widget.themeForegroundColor;
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) THEME-FOREGROUND COLOR: ', this.secondaryColor);
        } else {

          this.secondaryColor = this.widgetDefaultSettings.themeForegroundColor;
          // tslint:disable-next-line:max-line-length
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) THEME-FOREGROUND COLOR: ', project.widget.themeForegroundColor, 'IS UNDEFINED > SET DEFAULT ', this.secondaryColor);
        }

        /**
         * ******************************** wellcomeTitle (WIDGET DEFINED) ****************************************
         */
        if (project.widget.wellcomeTitle) {
          this.welcomeTitle = project.widget.wellcomeTitle;

          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) WELCOME TITLE: ', this.welcomeTitle);
        } else {
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) WELCOME TITLE: ', this.welcomeTitle, 'IS UNDEFINED > SET DEFAULT')

          this.setDefaultWelcomeTitle();
        }

        /**
         * ******************************** wellcomeMsg (WIDGET DEFINED) *******************************************
         */
        if (project.widget.wellcomeMsg) {
          this.welcomeMsg = project.widget.wellcomeMsg;
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) WELCOME MSG: ', this.welcomeMsg);
        } else {
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) WELCOME MSG: ', this.welcomeMsg, 'IS UNDEFINED > SET DEFAULT');
          this.setDefaultWelcomeMsg();
        }

        /**
         * ******************************** align (WIDGET DEFINED) **************************************************
         */
        if (project.widget.align && project.widget.align === 'left') {
          this.hasSelectedLeftAlignment = true;
          this.hasSelectedRightAlignment = false;
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) ALIGN: ', project.widget.align);
        } else {
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) ALIGN: ', project.widget.align, 'IS UNDEFINED > SET DEFAULT');
          this.hasSelectedLeftAlignment = false;
          this.hasSelectedRightAlignment = true;
        }

      } else {


        /**
         * ******************************** logoChat (WIDGET UNDEFINED) **********************************************
         */
        this.logoUrl = 'tiledesklogo'
        this.hasOwnLogo = false;
        this.LOGO_IS_ON = true
        // tslint:disable-next-line:max-line-length
        console.log('»» WIDGET DESIGN - (onInit WIDGET UNDEFINED) > SET DEFAULT LOGOURL: ', this.logoUrl, 'HAS OWN LOGO ', this.hasOwnLogo, 'LOGO IS ON ', this.LOGO_IS_ON);
        /**
         * ******************************** themeColor (WIDGET UNDEFINED) ********************************************
         */
        this.primaryColor = this.widgetDefaultSettings.themeColor
        console.log('»» WIDGET DESIGN - (onInit WIDGET UNDEFINED) > SET DEFAULT THEME COLOR: ', this.primaryColor);
        this.primaryColorRgb = this.hexToRgb(this.primaryColor)
        this.generateRgbaGradientAndBorder(this.primaryColorRgb);

        /**
         * ******************************** themeForegroundColor (WIDGET UNDEFINED) ***********************************
         */
        this.secondaryColor = this.widgetDefaultSettings.themeForegroundColor;
        console.log('»» WIDGET DESIGN - (onInit WIDGET UNDEFINED) > SET DEFAULT THEME-FOREGROUND COLOR: ', this.secondaryColor);

        /**
         * ******************************** wellcomeTitle (WIDGET UNDEFINED) ******************************************
         */
        this.setDefaultWelcomeTitle();

        /**
         * ******************************** wellcomeMsg (WIDGET UNDEFINED) ********************************************
         */
        this.setDefaultWelcomeMsg();

        /**
         * ******************************** calloutTimer (WIDGET UNDEFINED) ******************************************
         */
        this.calloutTimerSecondSelected = -1;
        this.CALLOUT_IS_DISABLED = true;
        /**
         * ******************************** calloutTitle (WIDGET UNDEFINED) ******************************************
         */
        this.setDefaultcalloutTitle();

        /**
        * ******************************** wellcomeMsg (WIDGET UNDEFINED) ********************************************
        */
        this.setDefaultcalloutMsg();
      }


    }, (error) => {
      console.log('WIDGET DESIGN - GET PROJECT BY ID - ERROR ', error);

    }, () => {
      console.log('WIDGET DESIGN - GET PROJECT BY ID - COMPLETE ');
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
    }
    // ASSIGN TO WIDEGET OBJ
    // this.widgetObj =
    //   [
    //     {
    //       'logoChat': this.logoUrl,
    //       'themeColor': this.primaryColor,
    //       'themeForegroundColor': this.secondaryColor,
    //       'wellcomeTitle': this.welcomeTitle,
    //       'wellcomeMsg': this.welcomeMsg
    //     }
    //   ]

    // UPDATE WIDGET PROJECT
    this.widgetService.updateWidgetProject(this.widgetObj)
  }

  /**
   * onSelectPrimaryColor WHEN USER PRESS 'OK' UPDATE THE OBJECT WIDGET
   * @param $event
   */
  // onSelectPrimaryColor($event) {
  //   this.primaryColor = $event
  //   console.log('+ WIDGET DESIGN - ON SELECT PRIMARY COLOR ', this.primaryColor);
  //   // ASSIGN TO WIDEGET OBJ
  //   this.widgetObj =
  //     [
  //       {
  //         'logoChat': this.customLogoUrl,
  //         'themeColor': this.primaryColor,
  //         'themeForegroundColor': this.secondaryColor
  //       }
  //     ]

  //   // UPDATE WIDGET PROJECT
  //   this.widgetService.updateWidgetProject(this.widgetObj)
  //   this.generateRgbaGradientAndBorder(this.primaryColor);
  //   this.widgetService.publishPrimaryColorSelected(this.primaryColor);
  // }

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

  // onChangeSecondaryColor($event) {
  //   this.secondaryColor = $event
  //   console.log('+ WIDGET DESIGN - ON CHANGE SECONDARY COLOR ', $event);
  //   this.widgetService.publishSecondaryColorSelected(this.secondaryColor);
  // }

  onCloseSecondaryColorDialog(event) {
    console.log('»» WIDGET DESIGN - ON CLOSE SECONDARY DIALOG ', event);
    this.secondaryColor = event

    if (this.secondaryColor !== this.widgetDefaultSettings.themeForegroundColor) {
      // *** ADD PROPERTY
      this.widgetObj['themeForegroundColor'] = this.secondaryColor

      this.widgetService.updateWidgetProject(this.widgetObj)
    } else {
      // *** REMOVE PROPERTY
      delete this.widgetObj['themeForegroundColor'];
      this.widgetService.updateWidgetProject(this.widgetObj)

    }

    // ASSIGN TO WIDEGET OBJ
    // this.widgetObj = [
    //   {
    //     'logoChat': this.logoUrl,
    //     'themeColor': this.primaryColor,
    //     'themeForegroundColor': this.secondaryColor,
    //     'wellcomeTitle': this.welcomeTitle,
    //     'wellcomeMsg': this.welcomeMsg
    //   }
    // ]
    // UPDATE WIDGET PROJECT


  }

  // onSelectSecondaryColor($event) {
  //   console.log('++++++ WIDGET DESIGN - ON SELECT SECONDARY COLOR ', $event);
  //   this.secondaryColor = $event
  //   // ASSIGN TO WIDEGET OBJ
  //   this.widgetObj = [
  //     {
  //       'logoChat': this.customLogoUrl,
  //       'themeColor': this.primaryColor,
  //       'themeForegroundColor': this.secondaryColor,
  //       'wellcomeTitle': this.welcomeTitle,
  //       'wellcomeMsg': this.customWelcomeMsg
  //     }
  //   ]
  //   // UPDATE WIDGET PROJECT
  //   this.widgetService.updateWidgetProject(this.widgetObj)

  //   this.widgetService.publishSecondaryColorSelected(this.secondaryColor);
  // }

  // ===========================================================================
  // ============== *** LOGO URL (alias for logoChat) ***  ==============
  // ===========================================================================
  /**
   * ON BLUR UPDATE THE OBJECT WIDGET */
  onBlurChangeLogo() {
    console.log('»» WIDGET DESIGN - ON BLUR LOGO URL ', this.logoUrl);

    // if is defined logoUrl and LOGO_IS_ON === true set the property logoChat = to logoUrl
    if (this.logoUrl && this.LOGO_IS_ON === true) {

      this.hasOwnLogo = true;
      console.log('»» WIDGET DESIGN - HAS OWN LOGO ', this.hasOwnLogo, 'LOGO IS ON ', this.LOGO_IS_ON);

      // *** ADD PROPERTY
      this.widgetObj['logoChat'] = this.logoUrl

      // ASSIGN TO WIDEGET OBJ
      // this.widgetObj = [
      //   {
      //     'logoChat': this.logoUrl,
      //     'themeColor': this.primaryColor,
      //     'themeForegroundColor': this.secondaryColor,
      //     'wellcomeTitle': this.welcomeTitle,
      //     'wellcomeMsg': this.welcomeMsg
      //   }
      // ]
      // console.log('HAS PRESSED CHANGE LOGO - WIDGET OBJ ', this.widgetObj);

      // UPDATE WIDGET PROJECT
      this.widgetService.updateWidgetProject(this.widgetObj)


    } else if (this.logoUrl && this.LOGO_IS_ON === false) {

      // if is defined logoUrl and LOGO_IS_ON === false set the property logoChat = to No Logo
      // use case: the logo btn on/off is setted as off and the user enter an logo url

      this.logoUrl = 'No Logo'
      console.log('»» WIDGET DESIGN - HAS OWN LOGO ', this.hasOwnLogo, 'LOGO IS ON ', this.LOGO_IS_ON);

      // *** ADD PROPERTY
      this.widgetObj['logoChat'] = 'nologo';

      // ASSIGN TO WIDEGET OBJ
      // this.widgetObj = [
      //   {
      //     'logoChat': 'nologo',
      //     'themeColor': this.primaryColor,
      //     'themeForegroundColor': this.secondaryColor,
      //     'wellcomeTitle': this.welcomeTitle,
      //     'wellcomeMsg': this.welcomeMsg
      //   }
      // ]
      // console.log('HAS PRESSED CHANGE LOGO - WIDGET OBJ ', this.widgetObj);

      // UPDATE WIDGET PROJECT
      this.widgetService.updateWidgetProject(this.widgetObj)

    } else {
      // if is not defined logoUrl remove the property logoChat

      // *** REMOVE PROPERTY
      delete this.widgetObj['logoChat'];

      this.logoUrl = 'tiledesklogo'
      this.hasOwnLogo = false;
      console.log('»» WIDGET DESIGN - HAS OWN LOGO ', this.hasOwnLogo, 'LOGO IS ON ', this.LOGO_IS_ON);
      // ASSIGN TO WIDEGET OBJ
      // this.widgetObj = [
      //   {
      //     'logoChat': '',
      //     'themeColor': this.primaryColor,
      //     'themeForegroundColor': this.secondaryColor,
      //     'wellcomeTitle': this.welcomeTitle,
      //     'wellcomeMsg': this.welcomeMsg
      //   }
      // ]
      this.widgetService.updateWidgetProject(this.widgetObj)
    }
  }

  // logoUrlChange(event) {
  //   console.log('WIDGET DESIGN - CUSTOM LOGO URL CHANGE ', event)
  // }

  // SWITCH BTN ON / OFF
  onLogoOnOff($event) {
    console.log('»» WIDGET DESIGN  - LOGO ON/OFF ', $event.target.checked)
    this.LOGO_IS_ON = false

    if ($event.target.checked === false) {
      this.logoUrl = 'No Logo'

      // CASE SWITCH BTN = OFF
      // *** ADD PROPERTY
      this.widgetObj['logoChat'] = 'nologo';

      // this.widgetObj = [
      //   {
      //     'logoChat': 'nologo',
      //     'themeColor': this.primaryColor,
      //     'themeForegroundColor': this.secondaryColor,
      //     'wellcomeTitle': this.welcomeTitle,
      //     'wellcomeMsg': this.welcomeMsg
      //   }
      // ]
      this.widgetService.updateWidgetProject(this.widgetObj);

    } else if ($event.target.checked === true) {

      this.logoUrl = 'tiledesklogo'
      this.LOGO_IS_ON = true;
      console.log('»» WIDGET DESIGN LOGO_IS_ON ', this.LOGO_IS_ON)
      this.hasOwnLogo = false

      // CASE SWITCH BTN = ON
      // *** REMOVE PROPERTY
      delete this.widgetObj['logoChat'];

      console.log('»» WIDGET DESIGN - widgetObj', this.widgetObj)

      // this.widgetObj = [
      //   {
      //     'logoChat': '',
      //     'themeColor': this.primaryColor,
      //     'themeForegroundColor': this.secondaryColor,
      //     'wellcomeTitle': this.welcomeTitle,
      //     'wellcomeMsg': this.welcomeMsg
      //   }
      // ]
      this.widgetService.updateWidgetProject(this.widgetObj)

    }
  }

  // ====================================================================================
  // ============== *** WIDGET TITLE (alias for wellcomeTitle) ***  ==============
  // ====================================================================================

  // USED TO SET THE DEFAULT WELCOME TITLE IF THE IMPUT FIELD IS EMPTY
  welcomeTitleChange(event) {
    // this.HIDE_WELCOME_TITLE_SAVE_BTN = false;

    // console.log('»» WIDGET DESIGN - WELCOME TITLE (modelChange) CHANGE ', event);
    // console.log('WIDGET DESIGN - WELCOME TITLE LENGHT (modelChange) ', event.length);
    if (event.length === 0) {
      console.log('»» WIDGET DESIGN - WELCOME TITLE LENGHT (modelChange) is ', event.length, ' SET DEFAULT WELCOME TITLE');


      this.setDefaultWelcomeTitle();
    }
    // this.HAS_CHANGED_WELCOME_TITLE = true
  }



  setDefaultWelcomeTitle() {
    if (this.browserLang) {
      if (this.browserLang === 'it') {

        this.welcomeTitle = this.widgetDefaultSettings.it.wellcomeTitle;
        console.log('»» WIDGET DESIGN - DEFAULT WELCOME TITLE ', this.welcomeTitle);

        // *** REMOVE PROPERTY
        delete this.widgetObj['wellcomeTitle'];
        // UPDATE WIDGET PROJECT
        this.widgetService.updateWidgetProject(this.widgetObj)

      } else {

        this.welcomeTitle = this.widgetDefaultSettings.en.wellcomeTitle;
        console.log('»» WIDGET DESIGN - DEFAULT WELCOME TITLE ', this.welcomeTitle);

        // *** REMOVE PROPERTY
        delete this.widgetObj['wellcomeTitle'];
        // UPDATE WIDGET PROJECT
        this.widgetService.updateWidgetProject(this.widgetObj)
      }
    }
  }

  onBlurSaveWelcomeTitle() {
    if (this.browserLang === 'it') {
      if (this.welcomeTitle !== this.widgetDefaultSettings.it.wellcomeTitle) {

        // *** ADD PROPERTY
        this.widgetObj['wellcomeTitle'] = this.welcomeTitle;
        // UPDATE WIDGET PROJECT
        this.widgetService.updateWidgetProject(this.widgetObj)
      }
    }

    if (this.browserLang === 'en') {
      if (this.welcomeTitle !== this.widgetDefaultSettings.en.wellcomeTitle) {

        // *** ADD PROPERTY
        this.widgetObj['wellcomeTitle'] = this.welcomeTitle;
        // UPDATE WIDGET PROJECT
        this.widgetService.updateWidgetProject(this.widgetObj)
      }
    }

    // ASSIGN TO WIDEGET OBJ
    // this.widgetObj = [
    //   {
    //     'logoChat': this.logoUrl,
    //     'themeColor': this.primaryColor,
    //     'themeForegroundColor': this.secondaryColor,
    //     'wellcomeTitle': this.welcomeTitle,
    //     'wellcomeMsg': this.welcomeMsg
    //   }
    // ]

  }

  // ================================================================================
  // ============== *** WIDGET MSG (alias for wellcomeMsg) ***  ==============
  // ================================================================================

  // USED TO SET THE DEAFULT WELCOME TITLE IF THE IMPUT FIELD IS EMPTY
  welcomeMsgChange(event) {
    console.log('»» WIDGET DESIGN - WELCOME MSG CHANGE ', event);

    if (event.length === 0) {
      console.log('»» WIDGET DESIGN - WELCOME MSG LENGHT (modelChange) is ', event.length, ' SET DEFAULT WELCOME MSG');

      this.setDefaultWelcomeMsg();
    }
    // this.HAS_CHANGED_WELCOME_MSG = true;
  }

  setDefaultWelcomeMsg() {
    // this.welcomeMsg = this.widgetDefaultSettings.it.wellcomeMsg
    // console.log('»» WIDGET DESIGN - DEFAULT WELCOME MSG ', this.welcomeMsg);
    if (this.browserLang) {
      if (this.browserLang === 'it') {
        // this.welcomeMsg = 'Come possiamo aiutare?'
        this.welcomeMsg = this.widgetDefaultSettings.it.wellcomeMsg
        console.log('»» WIDGET DESIGN - DEFAULT WELCOME MSG ', this.welcomeMsg);
        // // *** REMOVE PROPERTY
        delete this.widgetObj['wellcomeMsg'];
        // // UPDATE WIDGET PROJECT
        this.widgetService.updateWidgetProject(this.widgetObj)

      } else {
        console.log('»» WIDGET DESIGN - DEFAULT WELCOME MSG ', this.welcomeMsg);
        // this.welcomeMsg = 'How can we help?'
        this.welcomeMsg = this.widgetDefaultSettings.en.wellcomeMsg

        // *** REMOVE PROPERTY
        delete this.widgetObj['wellcomeMsg'];
        // UPDATE WIDGET PROJECT
        this.widgetService.updateWidgetProject(this.widgetObj)
      }
    }
  }

  onBlurSaveWelcomeMsg() {
    // console.log('»» WIDGET DESIGN - ON BLUR WELCOME MSG ', this.welcomeMsg);
    if (this.browserLang === 'it') {
      if (this.welcomeMsg !== this.widgetDefaultSettings.it.wellcomeMsg) {

        // *** ADD PROPERTY
        this.widgetObj['wellcomeMsg'] = this.welcomeMsg;
        // UPDATE WIDGET PROJECT
        this.widgetService.updateWidgetProject(this.widgetObj)
      }
    }

    if (this.browserLang === 'en') {
      if (this.welcomeMsg !== this.widgetDefaultSettings.en.wellcomeMsg) {

        // *** ADD PROPERTY
        this.widgetObj['wellcomeMsg'] = this.welcomeMsg;
        // UPDATE WIDGET PROJECT
        this.widgetService.updateWidgetProject(this.widgetObj)
      }
    }


    // this.widgetObj = [
    //   {
    //     'logoChat': this.logoUrl,
    //     'themeColor': this.primaryColor,
    //     'themeForegroundColor': this.secondaryColor,
    //     'wellcomeTitle': this.welcomeTitle,
    //     'wellcomeMsg': this.welcomeMsg
    //   }
    // ]
    // UPDATE WIDGET PROJECT
    // this.widgetService.updateWidgetProject(this.widgetObj)
  }

  // ===========================================================================
  // ============== *** CALLOUT TIMER (calloutTimer) ***  ==============
  // ===========================================================================
  setSelectedCalloutTimer() {
    console.log('»» WIDGET DESIGN CALLOUT TIMER - TIMER SELECTED', this.calloutTimerSecondSelected)

    this.CALLOUT_IS_DISABLED = false;
    // *** ADD PROPERTY
    this.widgetObj['calloutTimer'] = this.calloutTimerSecondSelected;
    // UPDATE WIDGET PROJECT
    this.widgetService.updateWidgetProject(this.widgetObj)
    // COMMENT AS FOR CALLOUT TITLE
    // this.widgetService.publishCalloutTimerSelected(this.calloutTimerSecondSelected)

    if (this.calloutTimerSecondSelected === -1) {
      this.CALLOUT_IS_DISABLED = true;
      // *** REMOVE PROPERTY
      delete this.widgetObj['calloutTimer'];
      //  delete this.widgetObj['calloutTitle'];
      //  delete this.widgetObj['calloutMsg'];
      // UPDATE WIDGET PROJECT
      this.widgetService.updateWidgetProject(this.widgetObj)

      this.setDefaultcalloutTitle();
      this.setDefaultcalloutMsg();

      // this.escaped_calloutTitle = ''; // callout title escaped
      // this.calloutTitleText = ''; // clear the value in the input if the user disabled the callout
      // console.log('»»» SET SELECTED CALLOUT TIMER - CALLOUT TITLE ESCAPED', this.escaped_calloutTitle)
      // this.escaped_calloutMsg = ''; // callout msg escaped
      // this.calloutMsgText = '';  // clear the value in the input if the user disabled the callout
      // console.log('»»» SET SELECTED CALLOUT TIMER - CALLOUT MSG ESCAPED ', this.escaped_calloutMsg)
      // this.calloutTitle = '';
      // this.calloutMsg = ''
    }
  }



  // ===========================================================================
  // ============== *** CALLOUT TITLE ***  ==============
  // ===========================================================================
  // onKeyCalloutTitle() {
  //   if (this.calloutTitleText) {
  //     this.escaped_calloutTitle = this.calloutTitleText.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
  //     console.log('+++ +++ ON KEY-UP CALLOUT TITLE TEXT  ', this.calloutTitleText);
  //     console.log('+++ +++ ON KEY-UP ESCAPED CALLOUT TITLE ', this.escaped_calloutTitle);

  //     /**
  //      * THE calloutTitleText IS PASSED TO THE WIDGET SERVICE THAT PUBLISH the property calloutTitleBs
  //      * THIS SAME COMP SUBSCRIBES TO THE WIDGET SERVICE (see subscribeToTypedCalloutTitle) TO AVOID THAT,
  //      * WHEN THE USER GO TO THE WIDEGT DESIGN PAGE (or in another page) AND THEN RETURN IN THE
  //      * WIDGET PAGE, THE VALUE OF THE CALLOUT TITLE BE EMPTY EVEN IF HE HAD PREVIOUSLY DIGITED IT */
  //     this.widgetService.publishCalloutTitleTyped(this.calloutTitleText)

  //     this.calloutTitle = `\n      calloutTitle: "${this.escaped_calloutTitle}",`
  //      // is used in the texarea 'script'
  //   } else {
  //     console.log('+++ +++ ON KEY-UP CALLOUT TITLE TEXT (else) ', this.calloutTitleText);
  //     this.widgetService.publishCalloutTitleTyped(this.calloutTitleText)
  //     this.escaped_calloutTitle = '';
  //     this.calloutTitle = '';
  //   }
  // }
  onBlurSaveCalloutTitle() {
    if (this.browserLang === 'it') {
      if (this.calloutTitle !== this.widgetDefaultSettings.it.calloutTitle) {

        // *** ADD PROPERTY
        this.widgetObj['calloutTitle'] = this.calloutTitle;
        // UPDATE WIDGET PROJECT
        this.widgetService.updateWidgetProject(this.widgetObj)
      }
    }

    if (this.browserLang === 'en') {
      if (this.calloutTitle !== this.widgetDefaultSettings.en.calloutTitle) {

        console.log('»» WIDGET DESIGN - >> CALLOUT TITLE ', this.calloutTitle);
        // *** ADD PROPERTY
        this.widgetObj['calloutTitle'] = this.calloutTitle;

        // UPDATE WIDGET PROJECT
        this.widgetService.updateWidgetProject(this.widgetObj)
      }
    }
  }

  calloutTitleChange(event) {
    if (event.length === 0) {
      console.log('»» WIDGET DESIGN - CALLOUT TITLE LENGHT (modelChange) is ', event.length, ' SET DEFAULT CALLOUT TITLE');

      // this.welcomeMsg = 'ciao'
      // this.niko = 'ciao'
      // console.log('»» WIDGET DESIGN - DEFAULT WELCOME MSG  NIKO ', this.welcomeMsg  );
      this.setDefaultcalloutTitle();
    }

  }

  setDefaultcalloutTitle() {
    if (this.browserLang) {
      if (this.browserLang === 'it') {

        this.calloutTitle = this.widgetDefaultSettings.it.calloutTitle;
        console.log('»» WIDGET DESIGN - DEFAULT CALLOUT TITLE ', this.calloutTitle);

        // *** REMOVE PROPERTY
        delete this.widgetObj['calloutTitle'];
        // UPDATE WIDGET PROJECT
        this.widgetService.updateWidgetProject(this.widgetObj)

      } else {

        this.calloutTitle = this.widgetDefaultSettings.en.calloutTitle;
        console.log('»» WIDGET DESIGN - DEFAULT WELCOME TITLE ', this.calloutTitle);

        // *** REMOVE PROPERTY
        delete this.widgetObj['calloutTitle'];
        // UPDATE WIDGET PROJECT
        this.widgetService.updateWidgetProject(this.widgetObj)
      }
    }
  }

  // ===========================================================================
  // ============== *** CALLOUT MSG (calloutMsg) ***  ==============
  // ===========================================================================
  // onKeyCalloutMsg() {
  //   if (this.calloutMsgText) {
  //     this.escaped_calloutMsg = this.calloutMsgText.replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
  //     console.log('+++ +++ ON KEY-UP CALLOUT MSG ', this.escaped_calloutMsg);
  //     this.calloutMsg = `\n      calloutMsg: "${this.escaped_calloutMsg}",` // is used in the texarea 'script'

  //     // COMMENT AS FOR CALLOUT TITLE
  //     this.widgetService.publishCalloutMsgTyped(this.calloutMsgText);
  //   } else {
  //     this.escaped_calloutMsg = '';
  //     this.calloutMsg = '';

  //     // COMMENT AS FOR CALLOUT TITLE
  //     this.widgetService.publishCalloutMsgTyped(this.calloutMsgText);
  //   }
  // }
  onBlurSaveCalloutMsg() {
    if (this.browserLang === 'it') {
      if (this.calloutMsg !== this.widgetDefaultSettings.it.calloutMsg) {

        // *** ADD PROPERTY
        this.widgetObj['calloutMsg'] = this.calloutMsg;
        // UPDATE WIDGET PROJECT
        this.widgetService.updateWidgetProject(this.widgetObj)
      }
    }

    if (this.browserLang === 'en') {
      if (this.calloutMsg !== this.widgetDefaultSettings.en.calloutMsg) {

        console.log('»» WIDGET DESIGN - >> CALLOUT MSG ', this.calloutMsg);
        // *** ADD PROPERTY
        this.widgetObj['calloutMsg'] = this.calloutMsg;

        // UPDATE WIDGET PROJECT
        this.widgetService.updateWidgetProject(this.widgetObj)
      }
    }
  }

  calloutMsgChange(event) {
    if (event.length === 0) {
      console.log('»» WIDGET DESIGN - CALLOUT MSG LENGHT (modelChange) is ', event.length, ' SET DEFAULT CALLOUT MSG');

      // this.welcomeMsg = 'ciao'
      // this.niko = 'ciao'
      // console.log('»» WIDGET DESIGN - DEFAULT WELCOME MSG  NIKO ', this.welcomeMsg  );
      this.setDefaultcalloutMsg();
    }

  }

  setDefaultcalloutMsg() {
    if (this.browserLang) {
      if (this.browserLang === 'it') {

        this.calloutMsg = this.widgetDefaultSettings.it.calloutMsg;
        console.log('»» WIDGET DESIGN - DEFAULT CALLOUT MSG ', this.calloutMsg);

        // *** REMOVE PROPERTY
        delete this.widgetObj['calloutMsg'];
        // UPDATE WIDGET PROJECT
        this.widgetService.updateWidgetProject(this.widgetObj)

      } else {

        this.calloutMsg = this.widgetDefaultSettings.en.calloutMsg;
        console.log('»» WIDGET DESIGN - DEFAULT WELCOME MSG ', this.calloutMsg);

        // *** REMOVE PROPERTY
        delete this.widgetObj['calloutMsg'];
        // UPDATE WIDGET PROJECT
        this.widgetService.updateWidgetProject(this.widgetObj)
      }
    }
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

    // const alignValue = 'left'

    // console.log('»» WIDGET DESIGN - LEFT ALIGNMENT SELECTED - ALIGN PROPERTY ', alignProperty);
    // this.widgetService.publishWidgetAligmentSelected('left');
    // this.widgetObj = [
    //   {
    //     'logoChat': this.logoUrl,
    //     'themeColor': this.primaryColor,
    //     'themeForegroundColor': this.secondaryColor,
    //     'wellcomeTitle': this.welcomeTitle,
    //     'wellcomeMsg': this.welcomeMsg,
    //   }
    // ]
    // UPDATE WIDGET PROJECT
    this.widgetService.updateWidgetProject(this.widgetObj)
  }

  aligmentRightSelected(right_selected: boolean) {
    console.log('»» WIDGET DESIGN - RIGHT ALIGNMENT SELECTED ', right_selected);
    this.hasSelectedLeftAlignment = false;
    this.hasSelectedRightAlignment = true;

    // *** REMOVE PROPERTY
    delete this.widgetObj['align'];

    // this.widgetService.publishWidgetAligmentSelected('right');
    // this.widgetObj = [
    //   {
    //     'logoChat': this.logoUrl,
    //     'themeColor': this.primaryColor,
    //     'themeForegroundColor': this.secondaryColor,
    //     'wellcomeTitle': this.welcomeTitle,
    //     'wellcomeMsg': this.welcomeMsg,
    //   }
    // ]
    // UPDATE WIDGET PROJECT
    this.widgetService.updateWidgetProject(this.widgetObj)
  }

  subscribeToWidgetAlignment() {
    this.widgetService.widgetAlignmentBs
      .subscribe((alignment) => {
        console.log('WIDGET COMP - SUBSCRIBE TO WIDGET ALIGNMENT ', alignment);
        if (alignment === 'right') {
          this.hasSelectedLeftAlignment = false;
          this.hasSelectedRightAlignment = true;

        } else if (alignment === 'left') {
          this.hasSelectedLeftAlignment = true;
          this.hasSelectedRightAlignment = false;
        }

      });
  }

  /**
   * IF THE USER SELECT A COLOR IN THE WIDGET DESIGN (THIS COMP) AND THEN GO BACK IN THE WIDGET PAGE AND THEN RETURN IN THE
   * THE WIDGET DESIGN PAGE (THIS COMP), THE WIDGET DESIGN PAGE IS RE-INITIALIZATED SO THE PRIMARY AND THE SECONDARY COLORS
   * ARE NOT THOSE PREVIOUS SELECTED BUT ARE THE DEFAULT COLORS SETTED IN THE ONINIT LIFEHOOK.
   * TO AVOID THIS ALSO THE WIDGET DESIGN PAGE (THIS COMP) IS SUBSCRIBED TO THE PRIMARY AND THE SECONDARY COLOR SELECTED IN ITSELF */
  subscribeToSelectedPrimaryColor() {
    this.widgetService.primaryColorBs.subscribe((primary_color: string) => {
      if (primary_color) {
        this.primaryColor = primary_color
      }
    })
  }
  subscribeToSelectedSecondaryColor() {
    this.widgetService.secondaryColorBs.subscribe((secondary_color: string) => {
      if (secondary_color) {
        this.secondaryColor = secondary_color
      }
    })
  }








  goBack() {
    this.location.back();
  }


}
