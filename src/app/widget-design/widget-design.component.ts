import { Component, OnInit, AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { slideInOutAnimation } from './slide-in-out.animation';
import { ColorPickerService, Cmyk } from 'ngx-color-picker';
import { WidgetService } from '../services/widget.service';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { AuthService } from '../core/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Rx';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { Department } from '../models/department-model';
import { DepartmentService } from '../services/mongodb-department.service';
import { NotifyService } from '../core/notify.service';
import { environment } from '../../environments/environment';
@Component({
  selector: 'appdashboard-widget-design',
  templateUrl: './widget-design.component.html',
  styleUrls: ['./widget-design.component.scss']
})


export class WidgetDesignComponent implements OnInit, AfterViewInit, OnDestroy {
  // '#2889e9'
  TESTSITE_BASE_URL = environment.testsite.testsiteBaseUrl
  _route: string;
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
        'wellcomeMsg': 'How can we help you?',
        'calloutTitle': 'Need Help?',
        'calloutMsg': 'Click here and start chatting with us!',
        'online_msg': 'Describe shortly your problem, you will be contacted by an agent.',
        // tslint:disable-next-line:max-line-length
        'offline_msg': '🤔 All operators are offline at the moment. You can anyway describe your problem. It will be assigned to the support team who will answer you as soon as possible.'
      },
      'it': {
        'wellcomeTitle': 'Ciao, benvenuto su tiledesk 👋',
        'wellcomeMsg': 'Come possiamo aiutarti?',
        'calloutTitle': 'Bisogno di aiuto?',
        'calloutMsg': 'Clicca qui e inizia a chattare con noi!',
        'online_msg': 'Descrivi sinteticamente il tuo problema, ti metteremo in contatto con un operatore specializzato.',
        // tslint:disable-next-line:max-line-length
        'offline_msg': '🤔 Tutti gli operatori sono offline al momento. Puoi comunque descrivere il tuo problema. Sarà assegnato al team di supporto che ti risponderà appena possibile.'
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
  // { seconds: 'immediately', value: 0 },
  calloutTimerOptions = [
    { seconds: 'disabled', value: -1 },
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
  sub: Subscription;

  showSpinner = true;
  updateWidgetSuccessNoticationMsg: string;
  updateDeptGreetingsSuccessNoticationMsg: string;
  onlineMsgSuccessNoticationMsg: string;
  offlineMsgSuccessNoticationMsg: string;

  projectName: string;

  HAS_SELECTED_GREENTINGS = false;
  HAS_SELECTED_CALLOUT = false;
  HAS_SELECTED_APPEARANCE = false;
  placeholderOnlineMsg: string;
  placeholderOfflineMsg: string;
  placeholderCalloutTitle: string;
  placeholderCalloutMsg: string;
  placeholderWelcomeTitle: string;
  placeholderWelcomeMsg: string;

  calloutContainerWidth: any;
  IMAGE_EXIST: boolean;
  constructor(
    private notify: NotifyService,
    public location: Location,
    private cpService: ColorPickerService,
    private widgetService: WidgetService,
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private auth: AuthService,
    private translate: TranslateService,
    private departmentService: DepartmentService,
    private router: Router,
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
    // this.subscribeToSelectedPrimaryColor();

    // this.subscribeToSelectedSecondaryColor();

    // this.subscribeToWidgetAlignment();

    // this.translateDeptGreetingsSuccessNoticationMsg();
    this.translateOnlineMsgSuccessNoticationMsg();
    this.translateOfflineMsgSuccessNoticationMsg();
    this.getSectionSelected();


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

  // translateDeptGreetingsSuccessNoticationMsg() {
  //   this.translate.get('UpdateDeptGreetingsSuccessNoticationMsg')
  //     .subscribe((text: string) => {

  //       this.updateDeptGreetingsSuccessNoticationMsg = text;
  //       // console.log('»» WIDGET SERVICE - Update Widget Project Success NoticationMsg', text)
  //     }, (error) => {
  //       console.log('»» WIDGET SERVICE -  Update Widget Project Success NoticationMsg - ERROR ', error);
  //     }, () => {
  //       // console.log('»» WIDGET SERVICE -  Update Widget Project Success NoticationMsg * COMPLETE *');
  //     });
  // }

    translateOnlineMsgSuccessNoticationMsg() {
    this.translate.get('UpdateDeptGreetingsOnlineMsgSuccessNoticationMsg')
      .subscribe((text: string) => {

        this.onlineMsgSuccessNoticationMsg = text;
        // console.log('»» WIDGET SERVICE - translateOnlineMsgSuccessNoticationMsg ', text)
      }, (error) => {
        // console.log('»» WIDGET SERVICE -  translateOnlineMsgSuccessNoticationMsg - ERROR ', error);
      }, () => {
        // console.log('»» WIDGET SERVICE -  Update Widget Project Success NoticationMsg * COMPLETE *');
      });
  }

  translateOfflineMsgSuccessNoticationMsg() {
    this.translate.get('UpdateDeptGreetingsOfflineMsgSuccessNoticationMsg')
      .subscribe((text: string) => {

        this.offlineMsgSuccessNoticationMsg = text;
        // console.log('»» WIDGET SERVICE - translateOfflineMsgSuccessNoticationMsg ', text)
      }, (error) => {
        // console.log('»» WIDGET SERVICE -  translateOnlineMsgSuccessNoticationMsg - ERROR ', error);
      }, () => {
        // console.log('»» WIDGET SERVICE -  translateOfflineMsgSuccessNoticationMsg * COMPLETE *');
      });
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
              this.onlineMsg = dept.online_msg;
              this.placeholderOnlineMsg = dept.online_msg;
            } else {

              this.setDefaultOnlineMsg()
            }

            // OFFLINE MSG
            if (dept.offline_msg) {
              this.offlineMsg = dept.offline_msg
              this.placeholderOfflineMsg = dept.offline_msg
            } else {

              this.setDefaultOfflineMsg()
            }
          }
        });
      }
    });
  }
  setDefaultOnlineMsg() {
    if (this.browserLang) {
      if (this.browserLang === 'it') {

        this.onlineMsg = this.widgetDefaultSettings.it.online_msg;
        console.log('»» WIDGET DESIGN - DEFAULT ONLINE MSG ', this.onlineMsg);

        this.placeholderOnlineMsg = this.onlineMsg;
        // const onlineMsg = ''
        // this.updateOnlineMsg(onlineMsg)

      } else {

        this.onlineMsg = this.widgetDefaultSettings.en.online_msg;
        console.log('»» WIDGET DESIGN - DEFAULT ONLINE MSG ', this.onlineMsg);

        this.placeholderOnlineMsg = this.onlineMsg;
        // const onlineMsg = ''
        // this.updateOnlineMsg(onlineMsg)
      }
    }
  }

  setDefaultOfflineMsg() {
    if (this.browserLang) {
      if (this.browserLang === 'it') {

        this.offlineMsg = this.widgetDefaultSettings.it.offline_msg;
        console.log('»» WIDGET DESIGN - DEFAULT OFFLINE MSG ', this.offlineMsg);
        this.placeholderOfflineMsg = this.offlineMsg;

        // const offlineMsg = '';
        // this.updateOfflineMsg(offlineMsg);
      } else {
        this.offlineMsg = this.widgetDefaultSettings.en.offline_msg;
        console.log('»» WIDGET DESIGN - DEFAULT OFFLINE MSG ', this.offlineMsg);
        this.placeholderOfflineMsg = this.offlineMsg;
        // const offlineMsg = '';
        // this.updateOfflineMsg(offlineMsg);
      }
    }
  }
  /**
   * ===============================================================================
   * ================================= ONLINE  MSG =================================
   * ===============================================================================
   */
  // onBlurSaveOnlineMsg() {
  //   console.log('»» WIDGET DESIGN - CALLING ON-BLUR-SAVE-ONLINE-MSG');
  //   if (this.browserLang === 'it') {
  //     if (this.onlineMsg !== this.widgetDefaultSettings.it.online_msg) {

  //       // *** ADD PROPERTY
  //       this.widgetObj['online_msg'] = this.onlineMsg;
  //       // UPDATE WIDGET PROJECT
  //       this.updateOnlineMsg(this.onlineMsg)
  //     }
  //   }

  //   if (this.browserLang === 'en') {
  //     if (this.onlineMsg !== this.widgetDefaultSettings.en.online_msg) {

  //       // *** ADD PROPERTY
  //       // this.widgetObj['online_msg'] = this.onlineMsg;
  //       // UPDATE WIDGET PROJECT
  //       this.updateOnlineMsg(this.onlineMsg)
  //     }
  //   }
  // }

  onChangeOnlineMsg(event) {
    console.log('»» WIDGET DESIGN - onChangeOnlineMsg ', event);

    this.placeholderOnlineMsg = event;
    if (event.length === 0 || event === this.widgetDefaultSettings.it.online_msg || event === this.widgetDefaultSettings.en.online_msg) {
      console.log('»» WIDGET DESIGN - ONLINE-MSG LENGHT (modelChange) is ', event.length, ' SET DEFAULT ONLINE MSG');

      this.setOnlinePlaceholderWithDefaultOnlineMsg();
    }
  }

  setOnlinePlaceholderWithDefaultOnlineMsg() {
    if (this.browserLang) {
      if (this.browserLang === 'it') {

        // this.onlineMsg = this.widgetDefaultSettings.it.online_msg;
        this.placeholderOnlineMsg = this.widgetDefaultSettings.it.online_msg;
        console.log('»» ONLINE MSG IS EMPTY - SET ONLINE-MSG PLACEHOLDER WITH THE DEFAULT onlineMsg ', this.placeholderOnlineMsg);
        // const onlineMsg = ''
        // this.updateOnlineMsg(onlineMsg)
      } else {
        // this.onlineMsg = this.widgetDefaultSettings.en.online_msg;
        this.placeholderOnlineMsg = this.widgetDefaultSettings.en.online_msg;
        console.log('»» ONLINE MSG IS EMPTY - SET ONLINE-MSG PLACEHOLDER WITH THE DEFAULT onlineMsg ', this.placeholderOnlineMsg);
        // const onlineMsg = ''
        // this.updateOnlineMsg(onlineMsg)
      }
    }
  }


  onChangeOfflineMsg(event) {

    console.log('»» WIDGET DESIGN onChangeOfflineMsg ', event);

    this.placeholderOfflineMsg = event;
    // console.log('»» WIDGET DESIGN - DEFAULT DEPT OFFLINE MSG EVENT (modelChange) ', event);
    // console.log('»» WIDGET DESIGN - DEFAULT DEPT OFFLINE MSG LENGHT (modelChange) is ', event.length, ' SET DEFAULT OFFLINE MSG');
    if (event.length === 0 || event === this.widgetDefaultSettings.it.offline_msg || event === this.widgetDefaultSettings.en.offline_msg) {
      console.log('»» WIDGET DESIGN - DEFAULT DEPT OFFLINE MSG LENGHT (modelChange) is ', event.length, ' SET DEFAULT OFFLINE MSG');
      this.setOnlinePlaceholderWithDefaultOfflineMsg();
    }
  }

  setOnlinePlaceholderWithDefaultOfflineMsg() {
    if (this.browserLang) {
      if (this.browserLang === 'it') {

        // this.offlineMsg = this.widgetDefaultSettings.it.offline_msg;
        this.placeholderOfflineMsg = this.widgetDefaultSettings.it.offline_msg;
        console.log('»» OFFLINE MSG EMPTY - SET PLACEHOLDER OFFLINE-MSG WITH THE DEFAULT offlineMsg ', this.placeholderOfflineMsg);

        // const offlineMsg = '';
        // this.updateOfflineMsg(offlineMsg);
      } else {
        // this.offlineMsg = this.widgetDefaultSettings.en.offline_msg;
        this.placeholderOfflineMsg = this.widgetDefaultSettings.en.offline_msg;
        console.log('»» OFFLINE MSG EMPTY - SET PLACEHOLDER OFFLINE-MSG WITH THE DEFAULT offlineMsg ', this.placeholderOfflineMsg);

        // const offlineMsg = '';
        // this.updateOfflineMsg(offlineMsg);
      }
    }

  }

  /**
   * ================================================================================
   * ================================= OFFLINE  MSG =================================
   * ================================================================================
   */
  // onBlurSaveOfflineMsg() {
  //   console.log('»» WIDGET DESIGN - CALLING ON-BLUR-SAVE-OFFLINE-MSG');
  //   if (this.browserLang === 'it') {
  //     if (this.offlineMsg !== this.widgetDefaultSettings.it.offline_msg) {

  //       this.updateOfflineMsg(this.offlineMsg)
  //     }
  //   }

  //   if (this.browserLang === 'en') {
  //     if (this.offlineMsg !== this.widgetDefaultSettings.en.offline_msg) {

  //       this.updateOfflineMsg(this.offlineMsg)
  //     }
  //   }
  // }



  /**
   * *** ------------------------------------ ***
   * ***    SAVE ONLINE / OFFLINE MESSAGES    ***
   * *** ------------------------------------ ***
   */
  saveOnlineOfflineMsgs() {

    const save_online_offline_msgs = <HTMLElement>document.querySelector('.save_online_offline_msgs');

    if (save_online_offline_msgs) {
      save_online_offline_msgs.blur()
    }

    this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {
      // console.log('ROUTING PAGE - DEPTS (FILTERED FOR PROJECT ID)', departments);

      if (departments) {
        departments.forEach(dept => {

          if (dept.default === true) {
            console.log('»» WIDGET DESIGN - DEFAULT DEPT ', dept);

            this.defaultdept_id = dept._id;
            console.log('»» WIDGET DESIGN - DEFAULT DEPT id ', this.defaultdept_id);

            // ONLINE MSG
            // if (dept.online_msg) {


            console.log('saveOnlineOfflineMsgs online_msg retrieved', dept.online_msg)
            console.log('saveOnlineOfflineMsgs online_msg modified', this.onlineMsg)

            // SAVE IF this.onlineMsg is unlike the default msg and the onlineMsg returned 
            // from the server (i.e. different from a previous change)
            if (this.browserLang === 'it') {

              if (this.onlineMsg !== this.widgetDefaultSettings.it.online_msg) {

                if (dept.online_msg !== this.onlineMsg) {

                  this.updateOnlineMsg(this.onlineMsg);

                }
              }
            }

            if (this.browserLang === 'en') {
              
              if (this.onlineMsg !== this.widgetDefaultSettings.en.online_msg) {

                if (dept.online_msg !== this.onlineMsg) {
                  this.updateOnlineMsg(this.onlineMsg);
                }
              }
            }

            // }

            // OFFLINE MSG
            if (this.browserLang === 'it') {
              if (this.offlineMsg !== this.widgetDefaultSettings.it.offline_msg) {
                if (dept.offline_msg !== this.offlineMsg) {
                  console.log('saveOnlineOfflineMsgs offline_msg ', dept.offline_msg);
                  this.updateOfflineMsg(this.offlineMsg)
                }
              }
            }

            if (this.browserLang === 'en') {
              if (this.offlineMsg !== this.widgetDefaultSettings.en.offline_msg) {
                if (dept.offline_msg !== this.offlineMsg) {
                  console.log('saveOnlineOfflineMsgs offline_msg ', dept.offline_msg);
                  this.updateOfflineMsg(this.offlineMsg)
                }
              }
            }
          }
        });
      }
    });



    // console.log('saveOnlineOfflineMsgs onlineMsg: ', this.onlineMsg);
    // console.log('saveOnlineOfflineMsgs onlineMsg: ', this.offlineMsg);
    // if (this.browserLang === 'it') {

    //   // || this.offlineMsg !== this.widgetDefaultSettings.it.offline_msg
    //   if (this.onlineMsg !== this.widgetDefaultSettings.it.online_msg) {

    //     // *** ADD PROPERTY
    //     // this.widgetObj['online_msg'] = this.onlineMsg;
    //     // UPDATE WIDGET PROJECT
    //     this.updateOnlineMsg(this.onlineMsg)
    //   }

    //   if (this.offlineMsg !== this.widgetDefaultSettings.it.offline_msg) {
    //     this.updateOfflineMsg(this.offlineMsg)
    //   }

    // }

    // if (this.browserLang === 'en') {
    //   // || this.offlineMsg !== this.widgetDefaultSettings.en.offline_msg
    //   if (this.onlineMsg !== this.widgetDefaultSettings.en.online_msg) {

    //     // *** ADD PROPERTY
    //     // this.widgetObj['online_msg'] = this.onlineMsg;
    //     // UPDATE WIDGET PROJECT
    //     this.updateOnlineMsg(this.onlineMsg)
    //   }

    //   if (this.offlineMsg !== this.widgetDefaultSettings.en.offline_msg) {

    //     this.updateOfflineMsg(this.offlineMsg)
    //   }
    // }
  }

  updateOnlineMsg(onlineMsg: string) {
    this.departmentService.updateDefaultDeptOnlineMsg(this.defaultdept_id, onlineMsg)
      .subscribe((data) => {
        console.log('»» WIDGET DESIGN - UPDATE DEFAULT DEPT ONLINE MSG - RESPONSE ', data);
      }, (error) => {
        console.log('»» WIDGET DESIGN - UPDATE DEFAULT DEPT ONLINE MSG - ERROR ', error);
      }, () => {

        this.notify.showWidgetStyleUpdateNotification(this.onlineMsgSuccessNoticationMsg, 2, 'done');
        console.log('»» WIDGET DESIGN - UPDATE DEFAULT DEPT ONLINE MSG * COMPLETE *');
      });
  }

  updateOfflineMsg(offlineMsg: string) {
    this.departmentService.updateDefaultDeptOfflineMsg(this.defaultdept_id, offlineMsg)
      .subscribe((data) => {
        console.log('»» WIDGET DESIGN - UPDATE DEFAULT DEPT OFFLINE MSG - RESPONSE ', data);
      }, (error) => {
        console.log('»» WIDGET DESIGN - UPDATE DEFAULT DEPT OFFLINE MSG - ERROR ', error);
      }, () => {

        this.notify.showWidgetStyleUpdateNotification(this.offlineMsgSuccessNoticationMsg, 2, 'done');
        console.log('»» WIDGET DESIGN - UPDATE DEFAULT DEPT OFFLINE MSG * COMPLETE *');
      });
  }


  getProjectById() {
    this.projectService.getProjectById(this.id_project).subscribe((project: any) => {
      // console.log('WIDGET DESIGN - GET PROJECT BY ID - PROJECT OBJECT: ', project);

      console.log('»» WIDGET DESIGN - PRJCT-WIDGET (onInit): ', project.widget);

      if (project.widget) {

        this.widgetObj = project.widget;

        /**
         * *** calloutTimer (WIDGET AND CALLOUT-TIMER DEFINED) ***
         */
        if (project.widget.calloutTimer) {
          this.calloutTimerSecondSelected = project.widget.calloutTimer;
          this.CALLOUT_IS_DISABLED = false;
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) CALLOUT-TIMER: ', this.calloutTimerSecondSelected,
            'IS DISABLED ', this.CALLOUT_IS_DISABLED);

        } else {
          /**
           * *** calloutTimer (WIDGET DEFINED BUT NOT CALLOUT-TIMER - SET DEFAULT) ***
           */
          console.log('»» WIDGET DESIGN - onInit WIDGET DEFINED BUT CALLOUT-TIMER IS: ', this.calloutTimerSecondSelected,
            ' > SET DEFAULT ')
          this.calloutTimerSecondSelected = -1;
          this.CALLOUT_IS_DISABLED = true;
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) CALLOUT-TIMER: ', this.calloutTimerSecondSelected,
            ' - IS DISABLED ', this.CALLOUT_IS_DISABLED);

        }

        /**
         * *** calloutTitle (WIDGET AND CALLOUT-TITLE DEFINED) ***
         */
        if (project.widget.calloutTitle) {
          this.calloutTitle = project.widget.calloutTitle;
          this.placeholderCalloutTitle = project.widget.calloutTitle;
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) CALLOUT TITLE: ', this.calloutTitle);

        } else {
          /**
           * *** calloutTitle (WIDGET DEFINED BUT NOT CALLOUT-TITLE - SET DEFAULT) ***
           */
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) CALLOUT TITLE: ', this.calloutTitle, 'IS UNDEFINED > SET DEFAULT');

          this.setDefaultcalloutTitle();
        }

        /**
         * *** calloutMsg (WIDGET AND CALLOUT-MSG DEFINED) ***
         */
        if (project.widget.calloutMsg) {
          this.calloutMsg = project.widget.calloutMsg;
          this.placeholderCalloutMsg = project.widget.calloutMsg;
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) CALLOUT MSG: ', this.calloutMsg);
        } else {
          /**
           * *** calloutMsg (WIDGET DEFINED BUT NOT CALLOUT-MSG - SET DEFAULT) ***
           */
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) CALLOUT MSG: ', this.calloutMsg, 'IS UNDEFINED > SET DEFAULT');

          this.setDefaultcalloutMsg();
        }

        /**
         * case logoChat = 'userCompanyLogoUrl' > display the userCompanyLogoUrl
         * *** logoChat (WIDGET AND LOGOCHAT DEFINED - USER HAS SETTED HIS LOGO) ***
         */
        if (project.widget.logoChat && project.widget.logoChat !== 'nologo' && project.widget.logoChat !== 'tiledesklogo') {

          this.logoUrl = project.widget.logoChat;
          this.hasOwnLogo = true;
          this.LOGO_IS_ON = true;

          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) LOGO URL: ', project.widget.logoChat,
            ' HAS HOWN LOGO ', this.hasOwnLogo,
            ' LOGO IS ON', this.LOGO_IS_ON);

          /**
           * case logoChat = 'nologo' > no logo is displayed
           * *** logoChat (WIDGET AND LOGOCHAT DEFINED - USER HAS SELECTED 'NO LOGO') ***
           */
        } else if (project.widget.logoChat && project.widget.logoChat === 'nologo' && project.widget.logoChat !== 'tiledesklogo') {
          this.logoUrl = 'No Logo';
          this.hasOwnLogo = false;
          this.LOGO_IS_ON = false;

          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) LOGO URL: ', project.widget.logoChat,
            ' HAS HOWN LOGO ', this.hasOwnLogo,
            ' LOGO IS ON', this.LOGO_IS_ON);


          /**
           * case logoChat = '' > display the tiledesk logo and in the input field display the text 'tiledesklogo'
           * *** logoChat (WIDGET DEFINED BUT NOT LOGOCHAT - SET DEFAULT) ***
           */
        } else {
          this.logoUrl = 'tiledesklogo'
          this.hasOwnLogo = false;
          this.LOGO_IS_ON = true

          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) LOGO URL: ', project.widget.logoChat,
            ' HAS HOWN LOGO ', this.hasOwnLogo,
            ' LOGO IS ON', this.LOGO_IS_ON);
        }

        /**
         * *** themeColor (WIDGET AND THEME-COLOR DEFINED) ***
         */
        if (project.widget.themeColor) {

          this.primaryColor = project.widget.themeColor;
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) THEME COLOR: ', this.primaryColor);
          this.primaryColorRgb = this.hexToRgb(this.primaryColor)
          this.generateRgbaGradientAndBorder(this.primaryColorRgb);
        } else {

          /**
           * case themeColor IS undefined
           * *** themeColor (WIDGET DEFINED BUT NOT THEME-COLOR - SET DEFAULT) ***
           */
          this.primaryColor = this.widgetDefaultSettings.themeColor

          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) THEME COLOR: ', project.widget.themeColor,
            ' IS UNDEFINED > SET DEFAULT ', this.primaryColor);

          this.primaryColorRgb = this.hexToRgb(this.primaryColor)
          this.generateRgbaGradientAndBorder(this.primaryColorRgb);
        }

        /**
         * *** themeForegroundColor (WIDGET AND THEME-FOREGROUND-COLOR DEFINED) ***
         */
        if (project.widget.themeForegroundColor) {
          this.secondaryColor = project.widget.themeForegroundColor;
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) THEME-FOREGROUND COLOR: ', this.secondaryColor);
        } else {
          /**
           * case themeForegroundColor IS undefined
           * *** themeForegroundColor (WIDGET DEFINED BUT NOT THEME-FOREGROUND-COLOR ) ***
           */
          this.secondaryColor = this.widgetDefaultSettings.themeForegroundColor;

          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) THEME-FOREGROUND COLOR: ', project.widget.themeForegroundColor,
            ' IS UNDEFINED > SET DEFAULT ', this.secondaryColor);
        }

        /**
         * *** wellcomeTitle (WIDGET AND WELCOME-TITLE DEFINED) ***
         */
        if (project.widget.wellcomeTitle) {
          this.welcomeTitle = project.widget.wellcomeTitle;
          this.placeholderWelcomeTitle = project.widget.wellcomeTitle;

          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) WELCOME-TITLE: ', this.welcomeTitle);
        } else {
          /**
           * *** wellcomeTitle (WIDGET DEFINED BUT NOT WELCOME-TITLE - SET DEFAULT) ***
           */
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) WELCOME-TITLE: ', this.welcomeTitle, ' IS UNDEFINED > SET DEFAULT')

          this.setDefaultWelcomeTitle();
        }

        /**
         * *** wellcomeMsg (WIDGET AND WELCOME-MSG DEFINED) ***
         */
        if (project.widget.wellcomeMsg) {
          this.welcomeMsg = project.widget.wellcomeMsg;
          this.placeholderWelcomeMsg = project.widget.wellcomeMsg;
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) WELCOME-MSG: ', this.welcomeMsg);
          /**
           * *** wellcomeMsg (WIDGET DEFINED BUT NOT WELCOME-MSG - SET DEFAULT) ***
           */
        } else {
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) WELCOME-MSG: ', this.welcomeMsg, ' IS UNDEFINED > SET DEFAULT');

          this.setDefaultWelcomeMsg();
        }

        /**
         * *** align (WIDGET AND ALIGN DEFINED) ***
         */
        if (project.widget.align && project.widget.align === 'left') {
          this.hasSelectedLeftAlignment = true;
          this.hasSelectedRightAlignment = false;
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) ALIGN: ', project.widget.align);
        } else {
          /**
           * *** align (WIDGET DEFINED BUT NOT ALIGN ) ***
           */
          console.log('»» WIDGET DESIGN - (onInit WIDGET DEFINED) ALIGN: ', project.widget.align, 'IS UNDEFINED > SET DEFAULT');
          this.hasSelectedLeftAlignment = false;
          this.hasSelectedRightAlignment = true;
        }

      } else {

        this.widgetObj = {}

        /**
         * *** logoChat (WIDGET UNDEFINED) ***
         */
        this.logoUrl = 'tiledesklogo'
        this.hasOwnLogo = false;
        this.LOGO_IS_ON = true
        // tslint:disable-next-line:max-line-length
        console.log('»» WIDGET DESIGN - (onInit WIDGET UNDEFINED) > SET DEFAULT LOGOURL: ', this.logoUrl, 'HAS OWN LOGO ', this.hasOwnLogo, 'LOGO IS ON ', this.LOGO_IS_ON);
        /**
         * *** themeColor (WIDGET UNDEFINED) ***
         */
        this.primaryColor = this.widgetDefaultSettings.themeColor
        console.log('»» WIDGET DESIGN - (onInit WIDGET UNDEFINED) > SET DEFAULT THEME COLOR: ', this.primaryColor);
        this.primaryColorRgb = this.hexToRgb(this.primaryColor)
        this.generateRgbaGradientAndBorder(this.primaryColorRgb);

        /**
         * *** themeForegroundColor (WIDGET UNDEFINED) ***
         */
        this.secondaryColor = this.widgetDefaultSettings.themeForegroundColor;
        console.log('»» WIDGET DESIGN - (onInit WIDGET UNDEFINED) > SET DEFAULT THEME-FOREGROUND COLOR: ', this.secondaryColor);

        /**
         * *** wellcomeTitle (WIDGET UNDEFINED) ***
         */
        this.setDefaultWelcomeTitle();

        /**
         * *** wellcomeMsg (WIDGET UNDEFINED) ***
         */
        this.setDefaultWelcomeMsg();

        /**
         * *** calloutTimer (WIDGET UNDEFINED) ***
         */
        this.calloutTimerSecondSelected = -1;
        this.CALLOUT_IS_DISABLED = true;

        /**
         * *** calloutTitle (WIDGET UNDEFINED) ***
         */
        this.setDefaultcalloutTitle();

        /**
         * *** wellcomeMsg (WIDGET UNDEFINED) ***
         */
        this.setDefaultcalloutMsg();
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

      /**
       * *** WidgetProject IS UPDATED WHEN THE USER CLICK ON SAVE *** */
      // this.widgetService.updateWidgetProject(this.widgetObj)
    }

    // UPDATE WIDGET PROJECT
    /**
     * *** WidgetProject IS UPDATED WHEN THE USER CLICK ON SAVE ***   */
    // this.widgetService.updateWidgetProject(this.widgetObj)
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
  // onBlurChangeLogo() {
  //   console.log('»» WIDGET DESIGN - ON BLUR LOGO URL ', this.logoUrl);

  //   // if is defined logoUrl and LOGO_IS_ON === true set the property logoChat = to logoUrl
  //   if (this.logoUrl && this.LOGO_IS_ON === true) {

  //     this.hasOwnLogo = true;
  //     console.log('»» WIDGET DESIGN - HAS OWN LOGO ', this.hasOwnLogo, 'LOGO IS ON ', this.LOGO_IS_ON);

  //     // *** ADD PROPERTY
  //     this.widgetObj['logoChat'] = this.logoUrl

  //     // UPDATE WIDGET PROJECT
  //     // this.widgetService.updateWidgetProject(this.widgetObj)


  //   } else if (this.logoUrl && this.LOGO_IS_ON === false) {

  //     // if is defined logoUrl and LOGO_IS_ON === false set the property logoChat = to No Logo
  //     // use case: the logo btn on/off is setted as off and the user enter an logo url

  //     this.logoUrl = 'No Logo'
  //     console.log('»» WIDGET DESIGN - HAS OWN LOGO ', this.hasOwnLogo, 'LOGO IS ON ', this.LOGO_IS_ON);

  //     // *** ADD PROPERTY
  //     this.widgetObj['logoChat'] = 'nologo';

  //     // UPDATE WIDGET PROJECT
  //     // this.widgetService.updateWidgetProject(this.widgetObj)

  //   } else {
  //     // if is not defined logoUrl remove the property logoChat

  //     // *** REMOVE PROPERTY
  //     delete this.widgetObj['logoChat'];

  //     this.logoUrl = 'tiledesklogo'
  //     this.hasOwnLogo = false;
  //     console.log('»» WIDGET DESIGN - HAS OWN LOGO ', this.hasOwnLogo, 'LOGO IS ON ', this.LOGO_IS_ON);

  //     // UPDATE WIDGET PROJECT
  //     // this.widgetService.updateWidgetProject(this.widgetObj)
  //   }
  // }



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

      // UPDATE WIDGET PROJECT
      // this.widgetService.updateWidgetProject(this.widgetObj);

    } else if ($event.target.checked === true) {

      this.logoUrl = 'tiledesklogo'
      this.LOGO_IS_ON = true;
      console.log('»» WIDGET DESIGN LOGO_IS_ON ', this.LOGO_IS_ON)
      this.hasOwnLogo = false

      // CASE SWITCH BTN = ON
      // *** REMOVE PROPERTY
      delete this.widgetObj['logoChat'];

      console.log('»» WIDGET DESIGN - widgetObj', this.widgetObj)


      // UPDATE WIDGET PROJECT
      // this.widgetService.updateWidgetProject(this.widgetObj)

    }
  }

  // ====================================================================================
  // ============== *** WIDGET TITLE (alias for wellcomeTitle) ***  ==============
  // ====================================================================================

  // USED TO SET THE DEFAULT WELCOME TITLE IF THE IMPUT FIELD IS EMPTY
  welcomeTitleChange(event) {

    this.placeholderWelcomeTitle = event;
    // this.HIDE_WELCOME_TITLE_SAVE_BTN = false;

    // console.log('»» WIDGET DESIGN - WELCOME TITLE (modelChange) CHANGE ', event);
    // console.log('WIDGET DESIGN - WELCOME TITLE LENGHT (modelChange) ', event.length);
    // tslint:disable-next-line:max-line-length
    if (event.length === 0 || event === this.widgetDefaultSettings.it.wellcomeTitle || event === this.widgetDefaultSettings.en.wellcomeTitle) {
      console.log('»» WIDGET DESIGN - WELCOME TITLE LENGHT (modelChange) is ', event.length, ' SET DEFAULT WELCOME TITLE');

      // this.setDefaultAndRemovePropertyWelcomeTitle();
      this.welcomeTitle_SetPlaceholderAndDeleteProperty();

    }
    // this.HAS_CHANGED_WELCOME_TITLE = true
  }



  welcomeTitle_SetPlaceholderAndDeleteProperty() {
    if (this.browserLang) {
      if (this.browserLang === 'it') {

        // this.welcomeTitle = this.widgetDefaultSettings.it.wellcomeTitle;
        // console.log('»» WIDGET DESIGN - DEFAULT WELCOME TITLE ', this.welcomeTitle);

        this.placeholderWelcomeTitle = this.widgetDefaultSettings.it.wellcomeTitle;

        // *** REMOVE PROPERTY
        delete this.widgetObj['wellcomeTitle'];

        // UPDATE WIDGET PROJECT
        // this.widgetService.updateWidgetProject(this.widgetObj)

      } else {

        // this.welcomeTitle = this.widgetDefaultSettings.en.wellcomeTitle;
        // console.log('»» WIDGET DESIGN - DEFAULT WELCOME TITLE ', this.welcomeTitle);

        this.placeholderWelcomeTitle = this.widgetDefaultSettings.en.wellcomeTitle;

        // *** REMOVE PROPERTY
        delete this.widgetObj['wellcomeTitle'];

        // UPDATE WIDGET PROJECT
        // this.widgetService.updateWidgetProject(this.widgetObj)
      }
    }
  }

  setDefaultWelcomeTitle() {
    if (this.browserLang) {
      if (this.browserLang === 'it') {

        this.welcomeTitle = this.widgetDefaultSettings.it.wellcomeTitle;
        this.placeholderWelcomeTitle = this.widgetDefaultSettings.it.wellcomeTitle;
        console.log('»» WIDGET DESIGN - SET DEFAULT WELCOME TITLE (onInit) ', this.welcomeTitle);

      } else {

        this.welcomeTitle = this.widgetDefaultSettings.en.wellcomeTitle;
        this.placeholderWelcomeTitle = this.widgetDefaultSettings.en.wellcomeTitle;
        console.log('»» WIDGET DESIGN - SET DEFAULT WELCOME TITLE (onInit) ', this.welcomeTitle);

      }
    }
  }

  // onBlurSaveWelcomeTitle() {
  //   if (this.browserLang === 'it') {
  //     if (this.welcomeTitle !== this.widgetDefaultSettings.it.wellcomeTitle) {

  //       // *** ADD PROPERTY
  //       this.widgetObj['wellcomeTitle'] = this.welcomeTitle;

  //       // UPDATE WIDGET PROJECT
  //       this.widgetService.updateWidgetProject(this.widgetObj)
  //     }
  //   }

  //   if (this.browserLang === 'en') {
  //     if (this.welcomeTitle !== this.widgetDefaultSettings.en.wellcomeTitle) {

  //       // *** ADD PROPERTY
  //       this.widgetObj['wellcomeTitle'] = this.welcomeTitle;
  //       // UPDATE WIDGET PROJECT
  //       this.widgetService.updateWidgetProject(this.widgetObj)
  //     }
  //   }
  // }



  // ================================================================================
  // ============== *** WIDGET MSG (alias for wellcomeMsg) ***  ==============
  // ================================================================================

  // USED TO SET THE DEAFULT WELCOME TITLE IF THE IMPUT FIELD IS EMPTY
  welcomeMsgChange(event) {
    console.log('»» WIDGET DESIGN - WELCOME MSG CHANGE ', event);
    this.placeholderWelcomeMsg = event;
    if (event.length === 0 || event === this.widgetDefaultSettings.it.wellcomeMsg || event === this.widgetDefaultSettings.en.wellcomeMsg) {
      console.log('»» WIDGET DESIGN - WELCOME MSG LENGHT (modelChange) is ', event.length, ' SET DEFAULT WELCOME MSG');

      // this.setDefaultAndDeletePropertyWelcomeMsg();
      this.welcomeMsg_SetPlaceholderAndDeleteProperty();
    }
    // this.HAS_CHANGED_WELCOME_MSG = true;
  }

  welcomeMsg_SetPlaceholderAndDeleteProperty() {
    // this.welcomeMsg = this.widgetDefaultSettings.it.wellcomeMsg
    // console.log('»» WIDGET DESIGN - DEFAULT WELCOME MSG ', this.welcomeMsg);
    if (this.browserLang) {
      if (this.browserLang === 'it') {

        // this.welcomeMsg = this.widgetDefaultSettings.it.wellcomeMsg
        // console.log('»» WIDGET DESIGN - DEFAULT WELCOME MSG ', this.welcomeMsg);

        this.placeholderWelcomeMsg = this.widgetDefaultSettings.it.wellcomeMsg
        // // *** REMOVE PROPERTY
        delete this.widgetObj['wellcomeMsg'];

        // // UPDATE WIDGET PROJECT
        // this.widgetService.updateWidgetProject(this.widgetObj)

      } else {

        // this.welcomeMsg = this.widgetDefaultSettings.en.wellcomeMsg
        // console.log('»» WIDGET DESIGN - DEFAULT WELCOME MSG ', this.welcomeMsg);

        this.placeholderWelcomeMsg = this.widgetDefaultSettings.en.wellcomeMsg
        // *** REMOVE PROPERTY
        delete this.widgetObj['wellcomeMsg'];

        // UPDATE WIDGET PROJECT
        // this.widgetService.updateWidgetProject(this.widgetObj)
      }
    }
  }

  setDefaultWelcomeMsg() {
    if (this.browserLang) {
      if (this.browserLang === 'it') {
        // this.welcomeMsg = 'Come possiamo aiutare?'
        this.welcomeMsg = this.widgetDefaultSettings.it.wellcomeMsg;
        this.placeholderWelcomeMsg = this.widgetDefaultSettings.it.wellcomeMsg;
        console.log('»» WIDGET DESIGN - SET DEFAULT WELCOME MSG (onInit) ', this.welcomeMsg);

      } else {

        // this.welcomeMsg = 'How can we help?'
        this.welcomeMsg = this.widgetDefaultSettings.en.wellcomeMsg;
        this.placeholderWelcomeMsg = this.widgetDefaultSettings.en.wellcomeMsg;
        console.log('»» WIDGET DESIGN - SET DEFAULT WELCOME MSG (onInit) ', this.welcomeMsg);
      }
    }
  }

  // onBlurSaveWelcomeMsg() {
  //   // console.log('»» WIDGET DESIGN - ON BLUR WELCOME MSG ', this.welcomeMsg);
  //   if (this.browserLang === 'it') {
  //     if (this.welcomeMsg !== this.widgetDefaultSettings.it.wellcomeMsg) {

  //       // *** ADD PROPERTY
  //       this.widgetObj['wellcomeMsg'] = this.welcomeMsg;
  //       // UPDATE WIDGET PROJECT
  //       this.widgetService.updateWidgetProject(this.widgetObj)
  //     }
  //   }

  //   if (this.browserLang === 'en') {
  //     if (this.welcomeMsg !== this.widgetDefaultSettings.en.wellcomeMsg) {

  //       // *** ADD PROPERTY
  //       this.widgetObj['wellcomeMsg'] = this.welcomeMsg;
  //       // UPDATE WIDGET PROJECT
  //       this.widgetService.updateWidgetProject(this.widgetObj)
  //     }
  //   }
  // }


  /**
   * *** ---------------------------- ***
   * ***    SAVE WIDGET APPEARANCE    ***
   * *** ---------------------------- ***
   */
  saveWidgetAppearance() {

    const appearance_save_btn_mobile = <HTMLElement>document.querySelector('.appearance_save_btn_mobile');
    const appearance_save_btn_desktop = <HTMLElement>document.querySelector('.appearance-save-btn-desktop');

    if (appearance_save_btn_mobile) {
      appearance_save_btn_mobile.blur()
    }

    if (appearance_save_btn_desktop) {
      appearance_save_btn_desktop.blur()
    }


    /// LOGO
    if (this.logoUrl && this.LOGO_IS_ON === true) {

      if (this.logoUrl !== 'tiledesklogo') {
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

      this.logoUrl = 'tiledesklogo'
      this.hasOwnLogo = false;
      console.log('»» WIDGET DESIGN - HAS OWN LOGO ', this.hasOwnLogo, 'LOGO IS ON ', this.LOGO_IS_ON, ' logoUrl: ', this.logoUrl);

    }

    /// WELCOME TITLE
    if (this.browserLang === 'it') {
      if (this.welcomeTitle !== this.widgetDefaultSettings.it.wellcomeTitle) {

        // *** ADD PROPERTY
        this.widgetObj['wellcomeTitle'] = this.welcomeTitle;

      }
    }

    if (this.browserLang === 'en') {
      if (this.welcomeTitle !== this.widgetDefaultSettings.en.wellcomeTitle) {

        // *** ADD PROPERTY
        this.widgetObj['wellcomeTitle'] = this.welcomeTitle;

      }
    }

    /// WELCOME MSG
    if (this.browserLang === 'it') {
      if (this.welcomeMsg !== this.widgetDefaultSettings.it.wellcomeMsg) {

        // *** ADD PROPERTY
        this.widgetObj['wellcomeMsg'] = this.welcomeMsg;
        // UPDATE WIDGET PROJECT

      }
    }

    if (this.browserLang === 'en') {
      if (this.welcomeMsg !== this.widgetDefaultSettings.en.wellcomeMsg) {

        // *** ADD PROPERTY
        this.widgetObj['wellcomeMsg'] = this.welcomeMsg;
        // UPDATE WIDGET PROJECT

      }
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
      delete this.widgetObj['calloutTitle'];
      delete this.widgetObj['calloutMsg'];
      //  delete this.widgetObj['calloutTitle'];
      //  delete this.widgetObj['calloutMsg'];
      // UPDATE WIDGET PROJECT

      // *** WidgetProject IS UPDATED WHEN THE USER CLICK ON SAVE ***
      // this.widgetService.updateWidgetProject(this.widgetObj)

      // this.setDefaultcalloutTitle();
      // this.setDefaultcalloutMsg();

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

  setDefaultcalloutTitle() {
    if (this.browserLang) {
      if (this.browserLang === 'it') {

        this.calloutTitle = this.widgetDefaultSettings.it.calloutTitle;
        this.placeholderCalloutTitle = this.widgetDefaultSettings.it.calloutTitle;
        console.log('»» WIDGET DESIGN - SET DEFAULT CALLOUT TITLE (onInit) ', this.calloutTitle);

      } else {

        this.calloutTitle = this.widgetDefaultSettings.en.calloutTitle;
        this.placeholderCalloutTitle = this.widgetDefaultSettings.en.calloutTitle;
        console.log('»» WIDGET DESIGN - SET DEFAULT CALLOUT TITLE (onInit) ', this.calloutTitle);
      }
    }
  }

  setDefaultcalloutMsg() {
    if (this.browserLang) {
      if (this.browserLang === 'it') {

        this.calloutMsg = this.widgetDefaultSettings.it.calloutMsg;
        this.placeholderCalloutMsg = this.widgetDefaultSettings.it.calloutMsg;
        console.log('»» WIDGET DESIGN - SET DEFAULT CALLOUT MSG (onInit) ', this.calloutMsg);
      } else {

        this.calloutMsg = this.widgetDefaultSettings.en.calloutMsg;
        this.placeholderCalloutMsg = this.widgetDefaultSettings.en.calloutMsg;
        console.log('»» WIDGET DESIGN - SET DEFAULT CALLOUT MSG (onInit) ', this.calloutMsg);
      }
    }
  }


  /**
   * *** ---------------------- ***
   * ***     CALLOUT TITLE      ***
   * *** ---------------------- ***
   */

  // *** !!! NO MORE USED ---
  // WidgetProject IS UPDATED WHEN THE USER CLICK ON SAVE ***
  // onBlurSaveCalloutTitle() {
  //   if (this.browserLang === 'it') {
  //     if (this.calloutTitle !== this.widgetDefaultSettings.it.calloutTitle) {
  //       // *** ADD PROPERTY
  //       this.widgetObj['calloutTitle'] = this.calloutTitle;
  //       // UPDATE WIDGET PROJECT
  //       this.widgetService.updateWidgetProject(this.widgetObj)
  //     }
  //   }
  //   if (this.browserLang === 'en') {
  //     if (this.calloutTitle !== this.widgetDefaultSettings.en.calloutTitle) {

  //       console.log('»» WIDGET DESIGN - >> CALLOUT TITLE ', this.calloutTitle);
  //       // *** ADD PROPERTY
  //       this.widgetObj['calloutTitle'] = this.calloutTitle;
  //       // UPDATE WIDGET PROJECT
  //       this.widgetService.updateWidgetProject(this.widgetObj)
  //     }
  //   }
  // }

  calloutTitleChange(event) {

    this.placeholderCalloutTitle = event;
    // tslint:disable-next-line:max-line-length
    if (event.length === 0 || event === this.widgetDefaultSettings.it.calloutTitle || event === this.widgetDefaultSettings.en.calloutTitle) {
      console.log('»» WIDGET DESIGN - CALLOUT TITLE LENGHT (modelChange) is ', event.length, ' SET PLACEHOLDER DEFAULT CALLOUT TITLE');

      // this.welcomeMsg = 'ciao'
      // this.niko = 'ciao'
      // console.log('»» WIDGET DESIGN - DEFAULT WELCOME MSG  NIKO ', this.welcomeMsg  );
      // this.setDefaultAndDeletePropertyCalloutTitle();
      this.calloutTitle_SetPlaceholderAndDeleteProperty();
    }

  }

  calloutTitle_SetPlaceholderAndDeleteProperty() {
    if (this.browserLang) {
      if (this.browserLang === 'it') {

        // this.calloutTitle = this.widgetDefaultSettings.it.calloutTitle;
        // console.log('»» WIDGET DESIGN - DEFAULT CALLOUT TITLE ', this.calloutTitle);

        this.placeholderCalloutTitle = this.widgetDefaultSettings.it.calloutTitle;
        console.log('»» WIDGET DESIGN - SET PLACEHOLDER WITH DEFAULT CALLOUT TITLE ', this.placeholderCalloutTitle);

        // *** REMOVE PROPERTY
        delete this.widgetObj['calloutTitle'];

        // UPDATE WIDGET PROJECT
        // *** !!! WidgetProject IS UPDATED WHEN THE USER CLICK ON SAVE ***
        // this.widgetService.updateWidgetProject(this.widgetObj)

      } else {

        // this.calloutTitle = this.widgetDefaultSettings.en.calloutTitle;
        // console.log('»» WIDGET DESIGN - DEFAULT CALLOUT TITLE ', this.calloutTitle);

        this.placeholderCalloutTitle = this.widgetDefaultSettings.en.calloutTitle;
        console.log('»» WIDGET DESIGN - SET PLACEHOLDER WITH DEFAULT CALLOUT TITLE ', this.placeholderCalloutTitle);

        // *** REMOVE PROPERTY
        delete this.widgetObj['calloutTitle'];

        // UPDATE WIDGET PROJECT
        // *** !!! WidgetProject IS UPDATED WHEN THE USER CLICK ON SAVE ***
        // this.widgetService.updateWidgetProject(this.widgetObj)
      }
    }
  }


  /**
   * *** --------------------------------- ***
   * ***     CALLOUT MSG (calloutMsg)      ***
   * *** --------------------------------- ***
   */
  // *** !!! NO MORE USED ---
  // WidgetProject IS UPDATED WHEN THE USER CLICK ON SAVE ***
  // onBlurSaveCalloutMsg() {
  //   if (this.browserLang === 'it') {
  //     if (this.calloutMsg !== this.widgetDefaultSettings.it.calloutMsg) {

  //       // *** ADD PROPERTY
  //       this.widgetObj['calloutMsg'] = this.calloutMsg;
  //       // UPDATE WIDGET PROJECT
  //       this.widgetService.updateWidgetProject(this.widgetObj)
  //     }
  //   }

  //   if (this.browserLang === 'en') {
  //     if (this.calloutMsg !== this.widgetDefaultSettings.en.calloutMsg) {

  //       console.log('»» WIDGET DESIGN - >> CALLOUT MSG ', this.calloutMsg);
  //       // *** ADD PROPERTY
  //       this.widgetObj['calloutMsg'] = this.calloutMsg;

  //       // UPDATE WIDGET PROJECT
  //       this.widgetService.updateWidgetProject(this.widgetObj)
  //     }
  //   }
  // }


  calloutMsgChange(event) {
    this.placeholderCalloutMsg = event
    if (event.length === 0 || event === this.widgetDefaultSettings.it.calloutMsg || event === this.widgetDefaultSettings.en.calloutMsg) {
      console.log('»» WIDGET DESIGN - CALLOUT MSG LENGHT (modelChange) is ', event.length, ' SET PLACEHOLDER WITH DEFAULT CALLOUT MSG');

      // this.welcomeMsg = 'ciao'
      // this.niko = 'ciao'
      // console.log('»» WIDGET DESIGN - DEFAULT WELCOME MSG  NIKO ', this.welcomeMsg  );
      // this.setDefaultAndRemovePropertyCalloutMsg();
      this.calloutMsg_SetPlaceholderAndDeleteProperty();
    }

  }

  calloutMsg_SetPlaceholderAndDeleteProperty() {
    if (this.browserLang) {
      if (this.browserLang === 'it') {

        // this.calloutMsg = this.widgetDefaultSettings.it.calloutMsg;
        // console.log('»» WIDGET DESIGN - DEFAULT CALLOUT MSG ', this.calloutMsg);

        this.placeholderCalloutMsg = this.widgetDefaultSettings.it.calloutMsg;
        console.log('»» WIDGET DESIGN - SET PLACEHOLDER WITH DEFAULT CALLOUT MSG ', this.placeholderCalloutMsg);

        // *** REMOVE PROPERTY
        delete this.widgetObj['calloutMsg'];
        // UPDATE WIDGET PROJECT
        // this.widgetService.updateWidgetProject(this.widgetObj)

      } else {

        // this.calloutMsg = this.widgetDefaultSettings.en.calloutMsg;
        // console.log('»» WIDGET DESIGN - DEFAULT CALLOUT MSG ', this.calloutMsg);

        this.placeholderCalloutMsg = this.widgetDefaultSettings.en.calloutMsg;
        console.log('»» WIDGET DESIGN - SET PLACEHOLDER WITH DEFAULT CALLOUT MSG ', this.placeholderCalloutMsg);

        // *** REMOVE PROPERTY
        delete this.widgetObj['calloutMsg'];
        // UPDATE WIDGET PROJECT
        // this.widgetService.updateWidgetProject(this.widgetObj)
      }
    }
  }


  saveCalloutSettings() {


    const callout_settings_save_btn = <HTMLElement>document.querySelector('.callout-settings-save-btn');

    if (callout_settings_save_btn) {
      callout_settings_save_btn.blur()
    }

    if (this.browserLang === 'it') {
      if (this.calloutTitle !== this.widgetDefaultSettings.it.calloutTitle) {

        // *** ADD PROPERTY calloutTitle
        this.widgetObj['calloutTitle'] = this.calloutTitle;

        // *** ADD PROPERTY calloutMsg
        this.widgetObj['calloutMsg'] = this.calloutMsg;

        // UPDATE WIDGET PROJECT
        // this.widgetService.updateWidgetProject(this.widgetObj)
      }
    }

    if (this.browserLang === 'en') {
      if (this.calloutTitle !== this.widgetDefaultSettings.en.calloutTitle) {

        console.log('»» WIDGET DESIGN - >> CALLOUT TITLE ', this.calloutTitle);
        // *** ADD PROPERTY calloutTitle
        this.widgetObj['calloutTitle'] = this.calloutTitle;
        // *** ADD PROPERTY calloutMsg
        this.widgetObj['calloutMsg'] = this.calloutMsg;

        // UPDATE WIDGET PROJECT
        // this.widgetService.updateWidgetProject(this.widgetObj)
      }
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
    // this.widgetService.updateWidgetProject(this.widgetObj)
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
    // this.widgetService.updateWidgetProject(this.widgetObj)
  }

  // subscribeToWidgetAlignment() {
  //   this.widgetService.widgetAlignmentBs
  //     .subscribe((alignment) => {
  //       console.log('WIDGET COMP - SUBSCRIBE TO WIDGET ALIGNMENT ', alignment);
  //       if (alignment === 'right') {
  //         this.hasSelectedLeftAlignment = false;
  //         this.hasSelectedRightAlignment = true;

  //       } else if (alignment === 'left') {
  //         this.hasSelectedLeftAlignment = true;
  //         this.hasSelectedRightAlignment = false;
  //       }

  //     });
  // }

  /**
   * IF THE USER SELECT A COLOR IN THE WIDGET DESIGN (THIS COMP) AND THEN GO BACK IN THE WIDGET PAGE AND THEN RETURN IN THE
   * THE WIDGET DESIGN PAGE (THIS COMP), THE WIDGET DESIGN PAGE IS RE-INITIALIZATED SO THE PRIMARY AND THE SECONDARY COLORS
   * ARE NOT THOSE PREVIOUS SELECTED BUT ARE THE DEFAULT COLORS SETTED IN THE ONINIT LIFEHOOK.
   * TO AVOID THIS ALSO THE WIDGET DESIGN PAGE (THIS COMP) IS SUBSCRIBED TO THE PRIMARY AND THE SECONDARY COLOR SELECTED IN ITSELF */
  // subscribeToSelectedPrimaryColor() {
  //   this.widgetService.primaryColorBs.subscribe((primary_color: string) => {
  //     if (primary_color) {
  //       this.primaryColor = primary_color
  //     }
  //   })
  // }
  // subscribeToSelectedSecondaryColor() {
  //   this.widgetService.secondaryColorBs.subscribe((secondary_color: string) => {
  //     if (secondary_color) {
  //       this.secondaryColor = secondary_color
  //     }
  //   })
  // }


  goBack() {
    this.location.back();
  }


}
