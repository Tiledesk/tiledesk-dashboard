import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { AuthService, SuperUser } from '../core/auth.service';

import { ActivatedRoute } from '@angular/router';

import { Project } from '../models/project-model';
import { Router } from '@angular/router';
import { UsersService } from '../services/users.service';
import { LocalDbService } from '../services/users-local-db.service';
import { DepartmentService } from '../services/department.service';
import { NotifyService } from '../core/notify.service';
import { TranslateService } from '@ngx-translate/core';
import { ProjectPlanService } from '../services/project-plan.service';

import { Subscription } from 'rxjs';

import { AppConfigService } from '../services/app-config.service';

// import brand from 'assets/brand/brand.json';
import { BrandService } from '../services/brand.service';

import { Chart } from 'chart.js'; /// VISITOR GRAPH FOR THE NEW NOME
import { AnalyticsService } from 'app/services/analytics.service'; /// VISITOR GRAPH FOR THE NEW NOME
import * as moment from 'moment'; /// VISITOR GRAPH FOR THE NEW NOME
import { ContactsService } from '../services/contacts.service'; // USED FOR COUNT OF ACTIVE CONTACTS FOR THE NEW HOME
import { FaqKbService } from '../services/faq-kb.service'; // USED FOR COUNT OF BOTS FOR THE NEW HOME
import { avatarPlaceholder, getColorBck } from '../utils/util';
import { LoggerService } from '../services/logger/logger.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
const swal = require('sweetalert');
@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {

  private unsubscribe$: Subject<any> = new Subject<any>();
  @ViewChild('widgetsContent', { read: ElementRef }) public widgetsContent;
  // company_name = brand.company_name;
  // tparams = brand;
  company_name: string;
  tparams: any;


  public_Key: string;

  firebaseProjectId: any;
  LOCAL_STORAGE_CURRENT_USER: any;

  // public superUser = new SuperUser('');
  currentUserEmailgetFromStorage: string;
  IS_SUPER_USER: boolean;

  user: any;
  project: Project;
  projectId: string;
  // user_is_available: boolean;

  USER_ROLE: string;
  CHAT_BASE_URL: string;
  browserLang: string;

  prjct_name: string;
  prjct_profile_name: string;
  profile_name: string;
  prjct_profile_type: string;
  prjct_trial_expired: boolean;
  subscription_is_active: boolean;
  subscription_end_date: Date;
  showSpinner = true;

  subscription: Subscription;
  isVisible: boolean;
  installWidgetText: string;

  //** FOR THE NEW DASHBOARD **//
  monthNames: any; /// VISITOR GRAPH FOR THE NEW HOME
  initDay: string; /// VISITOR GRAPH FOR THE NEW HOME
  endDay: string; /// VISITOR GRAPH FOR THE NEW HOME
  selectedDaysId: number /// VISITOR GRAPH FOR THE NEW HOME
  countOfActiveContacts: number; /// COUNT OF ACTIVE CONTACT FOR THE NEW HOME
  countOfVisitors: number; /// COUNT OF ACTIVE CONTACT FOR THE NEW HOME
  countOfBots: number; /// USED FOR COUNT OF BOTS FOR THE NEW HOME !!! *** Not used - replaced with LAST 30 DAYS MESSAGES COUNT
  OPERATING_HOURS_ACTIVE: boolean; /// USED TO DISPLAY OPERATING HOURS ENABLED / DISABLED
  countOfLastMonthMsgs: number; /// USED FOR COUNT OF LAST 30 DAYS MSGS FOR THE NEW HOME
  countOfLastMonthRequests: number; // USED FOR COUNT OF LAST 30 DAYS REQUESTS FOR THE NEW HOME 
  countOfLastMonthRequestsHandledByBots: number;
  percentageOfLastMonthRequestsHandledByBots: any;
  projectUsers: any // TO DISPLAY THE PROJECT USERS IN THE NEW HOME HEADER
  storageBucket: string;
  baseUrl: string;
  chatbots: any // TO DISPLAY THE CHATVOT IN THE NEW HOME HEADER
  DISPLAY_TEAMMATES: boolean = false;
  DISPLAY_CHATBOTS: boolean = false;

  isVisibleANA: boolean;
  isVisibleAPP: boolean;
  isVisibleOPH: boolean;
  hidechangelogrocket: boolean;
  onlyOwnerCanManageTheAccountPlanMsg: string;
  learnMoreAboutDefaultRoles: string;
  DISPLAY_OPH_AS_DISABLED: boolean;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;

  constructor(
    public auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService,
    private usersLocalDbService: LocalDbService,
    private departmentService: DepartmentService,
    private notify: NotifyService,
    private translate: TranslateService,
    private prjctPlanService: ProjectPlanService,
    public appConfigService: AppConfigService,
    public brandService: BrandService,
    private analyticsService: AnalyticsService,
    private contactsService: ContactsService,
    private faqKbService: FaqKbService,
    private logger: LoggerService
  ) {
    const brand = brandService.getBrand();
    this.company_name = brand['company_name'];
    this.tparams = brand;
    this.selectedDaysId = 7;
  }

  ngOnInit() {
    this.getCurrentProjectAndInit();
    // this.getStorageBucket(); // moved in getCurrentProject()
    this.logger.log('[HOME] !!! Hello HomeComponent! ');

    this.getBrowserLanguage();
    this.translateString();
    this.getLoggedUser()

    // get the PROJECT-USER BY CURRENT-PROJECT-ID AND CURRENT-USER-ID
    // IS USED TO DETERMINE IF THE USER IS AVAILABLE OR NOT AVAILABLE
    this.getProjectUser();

    // GET AND SAVE ALL BOTS OF CURRENT PROJECT IN LOCAL STORAGE
    this.usersService.getBotsByProjectIdAndSaveInStorage();

    // TEST FUNCTION : GET ALL AVAILABLE PROJECT USER
    // this.getAvailableProjectUsersByProjectId();

    this.getUserRole();
    this.getProjectPlan();
    // this.getVisitorCounter();
    this.getOSCODE();
    this.getChatUrl();
    this.getHasOpenBlogKey()
    // this.startChabgelogAnimation()
    // this.pauseResumeLastUpdateSlider() // https://stackoverflow.com/questions/5804444/how-to-pause-and-resume-css3-animation-using-javascript
  }


  ngAfterViewInit() { }

  ngOnDestroy() {
    // console.log('HOME COMP - CALLING ON DESTROY')
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  // pauseResumeLastUpdateSlider() {
  //   // var slide = document.querySelectorAll('.slide');
  //   // this.logger.log('HOME slide ', slide)
  //   // this.logger.log('HOME slide Array', Array.from(slide)) ;

  //   var slide =   Array.from(document.getElementsByClassName('slide') as HTMLCollectionOf<HTMLElement>)
  //   const slideArray = Array.from(slide)

  //   for (var i = 0; i < slide.length; i++) {


  //     slide[i].onclick = this.toggleAnimation(slide);
  //     slide[i].style.animationPlayState = 'running';
  //   }
  // }

  toggleAnimation(slide) {
    var style;
    for (var i = 0; i < slide.length; i++) {
      style = slide[i].style;
      if (style.animationPlayState === 'running') {
        style.animationPlayState = 'paused';
        document.body.className = 'paused';
      } else {
        style.animationPlayState = 'running';
        document.body.className = '';
      }
    }
  }


  startChabgelogAnimation() {
    // function(t, e, n) {
    // var u = n(62),
    //     c = n(292),
    //     s = document.querySelector("#futureproof figure"),
    //     l = u.a.queryArray(".entries li", s),
    //     f = new c.a({
    //         container: s.querySelector("ul"),
    //         toggleable: [l],
    //         onActivate: function(t) {
    //             var e = this,
    //                 n = this.__toggleable[0][t].offsetHeight;
    //             this.__toggleable[0].forEach(function(r, i) {
    //                 var o = u.a.mod(i - t + 1, e.__itemCount);
    //                 r.className = "card".concat(o);
    //                 var a = n,
    //                     c = 1;
    //                 0 === o ? (a -= 30, c *= 1.07) : 2 === o ? (a += 30, c /= 1.07) : 3 === o ? (a += 60, c /= 1.1449) : 1 !== o && (a += 120, c /= 1.225043), r.style.transform = "translateY(".concat(a, "px) scale(").concat(c, ")")
    //             })
    //         }
    //     })
    //   }

    var a = document.querySelector("#futureproof figure");
    this.logger.log('[HOME] startChabgelogAnimation entriesElme a', a)
    // var b = a.childNodes[1]
    // this.logger.log('HOME entriesElme b ', b)

    var ulEl = a.querySelector("ul")
    this.logger.log('[HOME] startChabgelogAnimation entriesElme ulEl ', ulEl)

    //  var x = ulEl.childNodes
    var liArray = Array.from(ulEl.getElementsByTagName("li"))
    this.logger.log('[HOME] startChabgelogAnimation entriesElme liArray ', liArray)

    this.logger.log('[HOME] startChabgelogAnimation entriesElme typeof liArray  ', typeof liArray)

    // var liElme = entriesElme.getElementsByTagName("li")
    // this.logger.log('HOME liElme ', liElme)

    this.setAttribute(liArray)


  }

  setAttribute(liArray) {
    // liArray.unshift(liArray.pop());
    liArray.forEach((element, index) => {
      this.logger.log('[HOME] startChabgelogAnimation > setAttribute  entriesElme element ', element, ' index ', index)

      element.className = "card" + index;

      if (index === 0) {
        element.setAttribute("style", "transform: translateY(122px) scale(1.07);");
      }

      if (index === 1) {
        element.setAttribute("style", "transform: translateY(152px) scale(1);");
      }
      if (index === 2) {
        element.setAttribute("style", "transform: translateY(182px) scale(0.934579);");
      }

      if (index === 3) {
        element.setAttribute("style", "transform: translateY(237px) scale(0.873439);");
      }

      if (index === 4) {
        element.setAttribute("style", "transform: translateY(297px) scale(0.816298);");

        // this.setAttribute(liArray)
      }

    });
  }


  public scrollRight(): void {
    this.logger.log('[HOME] scrollRight widgetsContent', this.widgetsContent)

    this.widgetsContent.nativeElement.scrollTo({ left: (this.widgetsContent.nativeElement.scrollLeft + 150), behavior: 'smooth' });
  }

  public scrollLeft(): void {
    this.logger.log('[HOME] scrollLeft widgetsContent', this.widgetsContent)
    this.widgetsContent.nativeElement.scrollTo({ left: (this.widgetsContent.nativeElement.scrollLeft - 150), behavior: 'smooth' });
  }


  getCurrentProjectAndInit() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        this.logger.log('[HOME] $UBSCIBE TO PUBLISHED PROJECT - RES  ', project)
        if (project) {
          this.project = project
          this.projectId = this.project._id
          this.OPERATING_HOURS_ACTIVE = this.project.operatingHours
          this.logger.log('[HOME] > OPERATING_HOURS_ACTIVE', this.OPERATING_HOURS_ACTIVE)

          this.init()
        }
      }, (error) => {
        this.logger.error('[HOME] $UBSCIBE TO PUBLISHED PROJECT - ERROR ', error);

      }, () => {
        this.logger.log('[HOME] $UBSCIBE TO PUBLISHED PROJECT * COMPLETE *');
      });
  }


  init() {
    // console.log("[HOME] > CALLING INIT")
    // this.getDeptsByProjectId(); // USED FOR COUNT OF DEPTS FOR THE NEW HOME
    this.getImageStorageThenUserAndBots();
    this.getLastMounthMessagesCount() // USED TO GET THE MESSAGES OF THE LAST 30 DAYS
    this.getLastMounthRequestsCount(); // USED TO GET THE REQUESTS OF THE LAST 30 DAYS
    this.getActiveContactsCount()  /// COUNT OF ACTIVE CONTACTS FOR THE NEW HOME
    this.getVisitorsCount() /// COUNT OF VISITORS FOR THE NEW HOME
    this.getCountAndPercentageOfRequestsHandledByBotsLastMonth() /// 
    // this.getVisitorsByLastNDays(this.selectedDaysId); /// VISITOR GRAPH FOR THE NEW HOME
    // this.initDay = moment().subtract(6, 'd').format('D/M/YYYY') /// VISITOR GRAPH FOR THE NEW HOME
    // this.endDay = moment().subtract(0, 'd').format('D/M/YYYY') /// VISITOR GRAPH FOR THE NEW HOME
    // this.logger.log("INIT", this.initDay, "END", this.endDay); /// VISITOR GRAPH FOR THE NEW HOME

    this.getRequestByLast7Day()

  }

  toggleDisplayTeammates() {
    this.DISPLAY_TEAMMATES = !this.DISPLAY_TEAMMATES
    // if (this.DISPLAY_TEAMMATES === false) {
    //   this.DISPLAY_TEAMMATES = true;
    //   this.logger.log('[HOME] > DISPLAY_TEAMMATES', this.DISPLAY_TEAMMATES)
    // } else if (this.DISPLAY_TEAMMATES === true) {
    //   this.DISPLAY_TEAMMATES = false;
    //   this.logger.log('[HOME] > DISPLAY_TEAMMATES', this.DISPLAY_TEAMMATES)
    // }
  }

  toggleDisplayChatbots() {
    this.DISPLAY_CHATBOTS = !this.DISPLAY_CHATBOTS
    // if (this.DISPLAY_CHATBOTS === false) {
    //   this.DISPLAY_CHATBOTS = true;
    //   this.logger.log('[HOME] > DISPLAY_CHATBOTS', this.DISPLAY_CHATBOTS)
    // } else if (this.DISPLAY_CHATBOTS === true) {
    //   this.DISPLAY_CHATBOTS = false;
    //   this.logger.log('[HOME] > DISPLAY_CHATBOTS', this.DISPLAY_CHATBOTS)
    // }
  }


  getImageStorageThenUserAndBots() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {

      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[HOME] - IMAGE STORAGE ', this.storageBucket, 'usecase firebase')

      this.getAllUsersOfCurrentProject(this.storageBucket, this.UPLOAD_ENGINE_IS_FIREBASE)  // USED TO DISPLAY THE HUMAN AGENT FOR THE NEW HOME
      this.getFaqKbByProjectId(this.storageBucket, this.UPLOAD_ENGINE_IS_FIREBASE) // USED FOR COUNT OF BOTS FOR THE NEW HOME

    } else {

      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().SERVER_BASE_URL;
      this.logger.log('[HOME] - IMAGE STORAGE ', this.baseUrl, 'usecase native')
      this.getAllUsersOfCurrentProject(this.baseUrl, this.UPLOAD_ENGINE_IS_FIREBASE)  // USED TO DISPLAY THE HUMAN AGENT FOR THE NEW HOME
      this.getFaqKbByProjectId(this.baseUrl, this.UPLOAD_ENGINE_IS_FIREBASE) // USED FOR COUNT OF BOTS FOR THE NEW HOME
    }

  }

  // USED FOR COUNT OF ACTIVE CONTACTS FOR THE NEW HOME 
  getActiveContactsCount() {
    this.contactsService.getLeadsActive().subscribe((activeleads: any) => {
      this.logger.log('[HOME] - GET ACTIVE LEADS RESPONSE ', activeleads)
      if (activeleads) {

        this.countOfActiveContacts = activeleads['count'];
        this.logger.log('[HOME] - ACTIVE LEADS COUNT ', this.countOfActiveContacts)
      }
    }, (error) => {
      this.logger.error('[HOME] - GET ACTIVE LEADS - ERROR ', error);

    }, () => {
      this.logger.log('[HOME] - GET ACTIVE LEADS * COMPLETE *');
    });
  }

  getLastMounthMessagesCount() {
    this.analyticsService.getLastMountMessagesCount()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((msgscount: any) => {
        this.logger.log('[HOME] - GET LAST 30 DAYS MESSAGE COUNT RES', msgscount);
        if (msgscount && msgscount.length > 0) {
          this.countOfLastMonthMsgs = msgscount[0]['totalCount']

          this.logger.log('[HOME] - GET LAST 30 DAYS MESSAGE COUNT ', this.countOfLastMonthMsgs);
        } else {
          this.countOfLastMonthMsgs = 0;
        }
      }, (error) => {
        this.logger.error('[HOME] - GET LAST 30 DAYS MESSAGE - ERROR ', error);

      }, () => {
        this.logger.log('[HOME] - GET LAST 30 DAYS MESSAGE * COMPLETE *');
      });
  }

  getLastMounthRequestsCount() {
    this.analyticsService.getLastMountConversationsCount()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((convcount: any) => {
        this.logger.log('[HOME] - GET LAST 30 DAYS CONVERSATION COUNT RES', convcount);

        if (convcount && convcount.length > 0) {
          this.countOfLastMonthRequests = convcount[0]['totalCount'];
          this.logger.log('[HOME] - GET LAST 30 DAYS CONVERSATION COUNT ', this.countOfLastMonthRequests);
        } else {
          this.countOfLastMonthRequests = 0;
        }
      }, (error) => {
        this.logger.error('[HOME] - GET LAST 30 DAYS CONVERSATION COUNT - ERROR ', error);

      }, () => {
        this.logger.log('[HOME] - GET LAST 30 DAYS CONVERSATION COUNT * COMPLETE *');
      });
  }

  getVisitorsCount() {
    this.analyticsService.getVisitors()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((visitorcounts: any) => {
        this.logger.log("HOME - GET VISITORS COUNT RES: ", visitorcounts)

        if (visitorcounts && visitorcounts.length > 0) {
          this.countOfVisitors = visitorcounts[0]['totalCount']
          this.logger.log("HOME - GET VISITORS COUNT: ", this.countOfVisitors)
        } else {
          this.countOfVisitors = 0
        }
      }, (error) => {
        this.logger.error('[HOME] - GET VISITORS COUNT - ERROR ', error);

      }, () => {
        this.logger.log('[HOME] - GET VISITORS COUNT * COMPLETE *');
      });
  }

  getCountAndPercentageOfRequestsHandledByBotsLastMonth() {
    this.analyticsService.getRequestsHasBotCount()
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((res: any) => {
        this.logger.log("[HOME] - getRequestsHasBotCount GET REQUESTS COUNT HANDLED BY BOT LAST 30 DAYS RES : ", res)

        if (res && res.length > 0) {
          this.countOfLastMonthRequestsHandledByBots = res[0]['totalCount']

        } else {
          this.countOfLastMonthRequestsHandledByBots = 0
        }

        this.logger.log("[HOME] - getRequestsHasBotCount REQUESTS COUNT HANDLED BY BOT LAST 30 DAYS: ", this.countOfLastMonthRequestsHandledByBots)
        this.logger.log("[HOME] - getRequestsHasBotCount REQUESTS COUNT LAST 30 DAYS: ", this.countOfLastMonthRequests);
        // numero di conversazioni gestite da bot / numero di conversazioni totali (già calcolata) * 100

        if (this.countOfLastMonthRequestsHandledByBots > 0 && this.countOfLastMonthRequests) {
          const _percentageOfLastMonthRequestsHandledByBots = (this.countOfLastMonthRequestsHandledByBots / this.countOfLastMonthRequests) * 100
          this.logger.log("[HOME] - getRequestsHasBotCount % COUNT OF LAST MONTH REQUESTS: ", this.countOfLastMonthRequests);
          this.logger.log("[HOME] - getRequestsHasBotCount % REQUESTS HANDLED BY BOT LAST 30 DAYS: ", _percentageOfLastMonthRequestsHandledByBots);
          this.logger.log("[HOME] - getRequestsHasBotCount % REQUESTS HANDLED BY BOT LAST 30 DAYS typeof: ", typeof _percentageOfLastMonthRequestsHandledByBots);
          this.percentageOfLastMonthRequestsHandledByBots = _percentageOfLastMonthRequestsHandledByBots.toFixed(1);
        } else {
          this.percentageOfLastMonthRequestsHandledByBots = 0
        }

      }, (error) => {
        this.logger.error('[HOME] - GET REQUESTS COUNT HANDLED BY BOT LAST 30 DAYS - ERROR ', error);

      }, () => {
        this.logger.log('[HOME] - GET REQUESTS COUNT HANDLED BY BOT LAST 30 DAYS * COMPLETE *');
      });


  }

  // USED TO DISPLAY THE HUMAN AGENT FOR THE NEW HOME
  getAllUsersOfCurrentProject(storage, uploadEngineIsFirebase) {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      this.logger.log('[HOME] - GET PROJECT-USERS BY PROJECT ID ', projectUsers);

      if (projectUsers) {
        this.projectUsers = projectUsers

        // ------------------------
        // CHECK IF USER HAS IMAGE
        // ------------------------
        this.projectUsers.forEach(user => {
          let imgUrl = ''
          if (uploadEngineIsFirebase === true) {
            // this.logger.log('[HOME] - CHECK IF USER HAS IMAGE - UPLOAD ENGINE IS FIREBASE ? ', uploadEngineIsFirebase);
            // ------------------------------------------------------------------------------
            // Usecase uploadEngine Firebase 
            // ------------------------------------------------------------------------------
            imgUrl = "https://firebasestorage.googleapis.com/v0/b/" + storage + "/o/profiles%2F" + user['id_user']['_id'] + "%2Fphoto.jpg?alt=media"

          } else {
            // this.logger.log('[HOME] - CHECK IF USER HAS IMAGE - UPLOAD ENGINE IS FIREBASE ? ', uploadEngineIsFirebase);
            // ------------------------------------------------------------------------------
            // Usecase uploadEngine Native 
            // ------------------------------------------------------------------------------
            imgUrl = storage + "images?path=uploads%2Fusers%2F" + user['id_user']['_id'] + "%2Fimages%2Fthumbnails_200_200-photo.jpg"
          }

          this.checkImageExists(imgUrl, (existsImage) => {
            if (existsImage == true) {
              this.logger.log('[HOME] - IMAGE EXIST X USERS', user);
              user.hasImage = true;
            }
            else {
              this.logger.log('[HOME] - IMAGE NOT EXIST X USERS', user);
              user.hasImage = false;
            }
          });
          let fullname = '';
          if (user && user['id_user'] && user['id_user'].firstname && user['id_user'].lastname) {
            fullname = user['id_user']['firstname'] + ' ' + user['id_user']['lastname']
            user['fullname_initial'] = avatarPlaceholder(fullname);
            user['fillColour'] = getColorBck(fullname)
          } else if (user && user['id_user'] && user['id_user'].firstname) {

            fullname = user['id_user'].firstname
            user['fullname_initial'] = avatarPlaceholder(fullname);
            user['fillColour'] = getColorBck(fullname)
          } else {
            user['fullname_initial'] = 'N/A';
            user['fillColour'] = 'rgb(98, 100, 167)';
          }
        });
      }

    }, error => {
      this.logger.error('[HOME] - GET PROJECT-USERS  - ERROR', error);
    }, () => {
      this.logger.log('[HOME] - GET PROJECT-USERS  - COMPLETE')
    });
  }

  // USED FOR COUNT OF BOTS FOR THE NEW HOME !!! *** Not used - replaced with GET LAST 30 DAYS MESSAGE COUNT ***
  getFaqKbByProjectId(storage, uploadEngineIsFirebase) {
    this.faqKbService.getAllBotByProjectId().subscribe((faqKb: any) => {
      this.logger.log('[HOME] - GET FAQKB RES', faqKb);
      if (faqKb) {

        // -----------------------------------------------------------
        // CHECK IF USER HAS IMAGE (AFTER REMOVING THE "IDENTITY BOT")
        // -----------------------------------------------------------
        faqKb.forEach(bot => {
          this.logger.log('[HOME] - GET FAQKB forEach bot: ', bot)

          if (bot && bot['type'] === "identity") {

            const index = faqKb.indexOf(bot);
            this.logger.log('[HOME] - GET FAQKB INDEX OF IDENTITY BOT', index);
            if (index > -1) {
              faqKb.splice(index, 1);
            }
          }
          let imgUrl = ''
          if (uploadEngineIsFirebase === true) {

            // this.logger.log('[HOME] - CHECK IF BOT HAS IMAGE - USECASE UPLOAD-ENGINE FIREBASE ');
            // ------------------------------------------------------------------------------
            // Usecase uploadEngine Firebase 
            // ------------------------------------------------------------------------------
            imgUrl = "https://firebasestorage.googleapis.com/v0/b/" + storage + "/o/profiles%2F" + bot['_id'] + "%2Fphoto.jpg?alt=media"

          } else {
            // this.logger.log('[HOME] - CHECK IF BOT HAS IMAGE - USECASE UPLOAD-ENGINE NATIVE ');
            // ------------------------------------------------------------------------------
            // Usecase uploadEngine Native 
            // ------------------------------------------------------------------------------
            imgUrl = storage + "images?path=uploads%2Fusers%2F" + bot['_id'] + "%2Fimages%2Fthumbnails_200_200-photo.jpg"
          }
          this.checkImageExists(imgUrl, (existsImage) => {
            if (existsImage == true) {
              this.logger.log('[HOME] - IMAGE EXIST X bot', bot);
              bot.hasImage = true;
            }
            else {
              this.logger.log('[HOME] - IMAGE NOT EXIST X bot', bot);
              bot.hasImage = false;
            }
          });
        });
        this.chatbots = faqKb;
        this.logger.log('[HOME] - GET FAQKB RES this.chatbots', this.chatbots);

        // this.countOfBots = faqKb.length;
        // this.logger.log('HOME - GET FAQKB RES', this.countOfBots);
      }
    }, (error) => {
      this.logger.error('[HOME] - GET FAQKB - ERROR ', error);

    }, () => {
      this.logger.log('[HOME] - GET FAQKB * COMPLETE *');
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


  getChatUrl() {
    this.CHAT_BASE_URL = this.appConfigService.getConfig().CHAT_BASE_URL;
    this.logger.log('[HOME] AppConfigService getAppConfig CHAT_BASE_URL', this.CHAT_BASE_URL);
  }

  // TRANSLATION
  translateString() {
    this.translateInstallWidget();

    this.translateModalOnlyOwnerCanManageProjectAccount()
  }

  translateInstallWidget() {
    this.translate.get('InstallTiledeskNowAndStartChatting', this.tparams)
      .subscribe((text: string) => {

        this.installWidgetText = text;
        // this.logger.log('[HOME] + + + translateInstallWidget', text)
      });
  }


  translateModalOnlyOwnerCanManageProjectAccount() {
    this.translate.get('OnlyUsersWithTheOwnerRoleCanManageTheAccountPlan')
      .subscribe((translation: any) => {
        this.onlyOwnerCanManageTheAccountPlanMsg = translation;
      });

    this.translate.get('LearnMoreAboutDefaultRoles')
      .subscribe((translation: any) => {
        this.learnMoreAboutDefaultRoles = translation;
      });
  }

  getOSCODE() {
    this.public_Key = this.appConfigService.getConfig().t2y12PruGU9wUtEGzBJfolMIgK;
    // this.logger.log('[HOME] AppConfigService getAppConfig public_Key', this.public_Key);
    let keys = this.public_Key.split("-");
    // this.logger.log('[HOME] PUBLIC-KEY keys', keys)
    keys.forEach(key => {
      // this.logger.log('[HOME] public_Key key', key)
      if (key.includes("PAY")) {
        // this.logger.log('[HOME] PUBLIC-KEY - key', key);
        let pay = key.split(":");
        // this.logger.log('[HOME] PUBLIC-KEY - pay key&value', pay);
        if (pay[1] === "F") {
          this.isVisible = false;
        } else {
          this.isVisible = true;
        }
      }
      if (key.includes("ANA")) {
        // this.logger.log('[HOME] PUBLIC-KEY - key', key);
        let ana = key.split(":");
        // this.logger.log('[HOME] PUBLIC-KEY - ana key&value', ana);

        if (ana[1] === "F") {
          this.isVisibleANA = false;
          // this.logger.log('[HOME] PUBLIC-KEY - ana isVisible', this.isVisibleANA);
        } else {
          this.isVisibleANA = true;
          // this.logger.log('[HOME] PUBLIC-KEY - ana isVisible', this.isVisibleANA);
        }
      }

      if (key.includes("APP")) {
        // this.logger.log('[HOME] PUBLIC-KEY - key', key);
        let lbs = key.split(":");
        // this.logger.log('[HOME] PUBLIC-KEY - app key&value', lbs);

        if (lbs[1] === "F") {
          this.isVisibleAPP = false;
          // this.logger.log('[HOME] PUBLIC-KEY - app isVisible', this.isVisibleAPP);
        } else {
          this.isVisibleAPP = true;
          // this.logger.log('[HOME] PUBLIC-KEY - app isVisible', this.isVisibleAPP);
        }
      }

      if (key.includes("OPH")) {
        // this.logger.log('[HOME] PUBLIC-KEY - key', key);
        let oph = key.split(":");
        // this.logger.log('[HOME] PUBLIC-KEY - oph key&value', oph);

        if (oph[1] === "F") {
          this.isVisibleOPH = false;
          // this.logger.log('[HOME] PUBLIC-KEY - oph isVisible', this.isVisibleOPH);
        } else {
          this.isVisibleOPH = true;
          // this.logger.log('[HOME] PUBLIC-KEY - oph isVisible', this.isVisibleOPH);
        }
      }
    });

    if (!this.public_Key.includes("ANA")) {
      // this.logger.log('[HOME] PUBLIC-KEY - key.includes("V1L")', this.public_Key.includes("ANA"));
      this.isVisibleANA = false;
    }

    if (!this.public_Key.includes("APP")) {
      // this.logger.log('[HOME] PUBLIC-KEY - key.includes("APP")', this.public_Key.includes("APP"));
      this.isVisibleAPP = false;
    }

    if (!this.public_Key.includes("OPH")) {
      // this.logger.log('[HOME] PUBLIC-KEY - key.includes("OPH")', this.public_Key.includes("OPH"));
      this.isVisibleOPH = false;
    }

    // this.logger.log('eoscode', this.eos)
    // if (this.eos && this.eos === publicKey) {

    //   this.isVisible = true;
    //   this.logger.log('eoscode isVisible ', this.isVisible);
    // } else {

    //   this.isVisible = false;
    //   this.logger.log('eoscode isVisible ', this.isVisible);
    // }
  }

  // OLD - NOW NOT WORKS
  // getVisitorCounter() {
  //   this.departmentService.getVisitorCounter()
  //     .subscribe((visitorCounter: any) => {
  //       this.logger.log('[HOME] getVisitorCounter : ', visitorCounter);

  //       // x test
  //       // const visitorCounter = [{ "_id": "5cd2ff0492424372bfa33574", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://www.tiledesk.com", "__v": 0, "createdAt": "2019-05-08T16:08:36.085Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-11-12T16:24:50.764Z", "totalViews": 12564 }, { "_id": "5cd313cc92424372bfa6fad2", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://www.tiledesk.com", "__v": 0, "createdAt": "2019-05-08T17:37:16.872Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-11-08T03:14:10.802Z", "totalViews": 108 }, { "_id": "5cd317e492424372bfa7baad", "id_project": "5ad5bd52c975820014ba900a", "origin": null, "__v": 0, "createdAt": "2019-05-08T17:54:44.273Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-11-11T23:04:26.285Z", "totalViews": 567 }, { "_id": "5cd3187492424372bfa7d4b4", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://testwidget.tiledesk.com", "__v": 0, "createdAt": "2019-05-08T17:57:08.426Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-11-11T14:43:27.804Z", "totalViews": 47 }, { "_id": "5cd3188292424372bfa7d694", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://support.tiledesk.com", "__v": 0, "createdAt": "2019-05-08T17:57:22.763Z", "path": "/5ad5bd52c975820014ba900a/departments/allstatus", "updatedAt": "2019-10-18T10:24:28.260Z", "totalViews": 608 }, { "_id": "5cd37ce592424372bfb4f18c", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://tiledesk.com", "__v": 0, "createdAt": "2019-05-09T01:05:41.918Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-10-31T15:29:55.687Z", "totalViews": 8 }, { "_id": "5cd5a42392424372bffcf279", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://codingpark.com", "__v": 0, "createdAt": "2019-05-10T16:17:39.561Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-05-12T04:30:49.985Z", "totalViews": 7 }, { "_id": "5cda868492424372bfa41f87", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://edit.tiledesk.com", "__v": 0, "createdAt": "2019-05-14T09:12:36.334Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-11-11T14:34:01.768Z", "totalViews": 627 }, { "_id": "5cdbdc5092424372bfd446ed", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://localhost:4200", "__v": 0, "createdAt": "2019-05-15T09:30:56.291Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-07-08T15:18:49.783Z", "totalViews": 669 }, { "_id": "5ce3d37e92424372bff07234", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://s3.eu-west-1.amazonaws.com", "__v": 0, "createdAt": "2019-05-21T10:31:26.193Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-05-21T11:41:47.565Z", "totalViews": 4 }, { "_id": "5ce3ee6692424372bff47a01", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://support-pre.tiledesk.com", "__v": 0, "createdAt": "2019-05-21T12:26:14.830Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-09-03T09:52:03.442Z", "totalViews": 29 }, { "_id": "5ce5532492424372bf26422f", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://localhost:8000", "__v": 0, "createdAt": "2019-05-22T13:48:20.153Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-05-22T15:10:52.097Z", "totalViews": 4 }, { "_id": "5cea371792424372bfcdf00f", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://evil.com/", "__v": 0, "createdAt": "2019-05-26T06:49:59.238Z", "path": "/5ad5bd52c975820014ba900a/departments/allstatus", "updatedAt": "2019-07-20T06:11:47.539Z", "totalViews": 4 }, { "_id": "5cee342c92424372bf5f5ea3", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://testwidget.tiledesk.it", "__v": 0, "createdAt": "2019-05-29T07:26:36.984Z", "path": "/5ad5bd52c975820014ba900a/departments/5b8eb4955ca4d300141fb2cc/operators", "updatedAt": "2019-05-29T07:27:10.327Z", "totalViews": 3 }, { "_id": "5cf072d392424372bfb993d7", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://importchinaproducts.com", "__v": 0, "createdAt": "2019-05-31T00:18:27.503Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-11-03T22:52:21.678Z", "totalViews": 27 }, { "_id": "5cf0892292424372bfbbfcc7", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://importchinaproducts.com", "__v": 0, "createdAt": "2019-05-31T01:53:38.809Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-11-09T14:02:29.505Z", "totalViews": 18 }, { "_id": "5cf64fdf92424372bf9137d0", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://54.37.234.246:1111", "__v": 0, "createdAt": "2019-06-04T11:02:55.936Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-06-14T18:49:33.847Z", "totalViews": 49 }, { "_id": "5cf8d08b1caa8022ad5248e2", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://www.importchinaproducts.com", "__v": 0, "createdAt": "2019-06-06T08:36:27.328Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-10-28T08:37:36.711Z", "totalViews": 7 }, { "_id": "5cfa4eff1caa8022ad8fbc5f", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://54.37.225.206:4300", "__v": 0, "createdAt": "2019-06-07T11:48:15.191Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-06-10T05:58:55.933Z", "totalViews": 26 }, { "_id": "5cfa9c7d1caa8022ad9e40e1", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://vps695843.ovh.net:4300", "__v": 0, "createdAt": "2019-06-07T17:18:53.536Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-06-07T17:18:53.536Z", "totalViews": 1 }, { "_id": "5cfe93281caa8022ad2bbebf", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://widget.kobs.pl", "__v": 0, "createdAt": "2019-06-10T17:28:08.213Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-06-10T17:46:51.521Z", "totalViews": 6 }, { "_id": "5cfe96c91caa8022ad2c850a", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://panel.kobs.pl", "__v": 0, "createdAt": "2019-06-10T17:43:37.206Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-06-17T05:51:44.478Z", "totalViews": 189 }, { "_id": "5cfed7fc1caa8022ad37ff73", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://localhost:8080", "__v": 0, "createdAt": "2019-06-10T22:21:48.300Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-06-10T22:21:50.845Z", "totalViews": 2 }, { "_id": "5d14ead832da4a99f4209603", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://translate.googleusercontent.com", "__v": 0, "createdAt": "2019-06-27T16:12:08.146Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-06-27T16:12:52.926Z", "totalViews": 3 }, { "_id": "5d1ed5de32da4a99f4bdc056", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://localhost", "__v": 0, "createdAt": "2019-07-05T04:45:18.031Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-07-11T08:25:47.008Z", "totalViews": 168 }, { "_id": "5d1f030932da4a99f4c3bc4b", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://192.168.1.137", "__v": 0, "createdAt": "2019-07-05T07:58:01.426Z", "path": "/5ad5bd52c975820014ba900a/departments", "updatedAt": "2019-07-05T07:58:01.426Z", "totalViews": 1 }, { "_id": "5db2e17b6b2dfaad7c1f1962", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://localhost:3000", "__v": 0, "createdAt": "2019-10-25T11:50:19.452Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-10-30T12:17:18.155Z", "totalViews": 15 }, { "_id": "5db30c036b2dfaad7c269761", "id_project": "5ad5bd52c975820014ba900a", "origin": "null", "__v": 0, "createdAt": "2019-10-25T14:51:47.062Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-10-25T14:52:03.462Z", "totalViews": 2 }, { "_id": "5db314186b2dfaad7c281712", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://www.frontiere21.it", "__v": 0, "createdAt": "2019-10-25T15:26:16.834Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-10-25T15:51:49.450Z", "totalViews": 11 }, { "_id": "5dc92fb73b1c8559fb6c3cc6", "id_project": "5ad5bd52c975820014ba900a", "origin": "http://egov2-dev.comune.bari.it:3000", "__v": 0, "createdAt": "2019-11-11T09:53:59.339Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-11-11T09:53:59.339Z", "totalViews": 1 }, { "_id": "5dc9714e3b1c8559fb79445a", "id_project": "5ad5bd52c975820014ba900a", "origin": "https://baribot.herokuapp.com", "__v": 0, "createdAt": "2019-11-11T14:33:50.123Z", "path": "/5ad5bd52c975820014ba900a/widgets", "updatedAt": "2019-11-11T14:34:18.612Z", "totalViews": 2 }]
  //       this.logger.log('[HOME] getVisitorCounter length : ', visitorCounter.length);
  //       if (visitorCounter && visitorCounter.length > 0) {
  //         let count = 0;
  //         visitorCounter.forEach(visitor => {
  //           this.logger.log('[HOME] getVisitorCounter visitor origin ', visitor.origin);
  //           if (
  //             visitor.origin !== "https://s3.eu-west-1.amazonaws.com" &&
  //             visitor.origin !== "http://testwidget.tiledesk.it" &&
  //             visitor.origin !== "http://testwidget.tiledesk.com" &&
  //             visitor.origin !== "https://support.tiledesk.com" &&
  //             visitor.origin !== null &&
  //             visitor.origin !== 'null' &&
  //             visitor.origin !== "http://evil.com/"
  //           ) {

  //             count = count + 1;
  //             this.logger.log('[HOME] getVisitorCounter the origin ', visitor.origin, ' is != of test-site and is != of support-tiledesk and is != of null ', count);
  //             // this.logger.log('getVisitorCounter ORIGIN != TEST-SITE AND != SUPPORT-TILEDESK »» HAS INSTALLED');
  //           } else {
  //             this.logger.log('[HOME] getVisitorCounter the origin ', visitor.origin, ' is = of test-site or is = support-tiledesk or is = null');
  //           }
  //         });

  //         if (count === 0) {
  //           // this.notify.presentModalInstallTiledeskModal()
  //           this.logger.log('[HOME] getVisitorCounter count', count, '!!!');

  //         }

  //       } else {
  //         this.logger.log('[HOME] getVisitorCounter length : ', visitorCounter.length);
  //         this.logger.log('[HOME] getVisitorCounter VISITOR COUNTER IS O »» HAS NOT INSTALLED');
  //         // this.notify.presentModalInstallTiledeskModal() 
  //         //  this.notify.showNotificationInstallWidget(`${this.installWidgetText} <span style="color:#ffffff; display: inline-block; max-width: 100%;"> Nicola </span>`, 0, 'info');

  //       }
  //     }, (error) => {
  //       this.logger.error('[HOME] getVisitorCounter ERROR ', error);
  //     }, () => {
  //       this.logger.log('[HOME] getVisitorCounter * COMPLETE *');
  //     });
  // }


  getBrowserLanguage() {
    this.browserLang = this.translate.getBrowserLang();
    this.logger.log('[HOME] BRS-LANG (USED FOR SWITCH MONTH NAME)', this.browserLang)


    this.switchMonthName(); /// VISITOR GRAPH FOR THE NEW NOME
  }
  switchMonthName() {
    if (this.browserLang) {
      if (this.browserLang === 'it') {
        this.monthNames = { '1': 'Gen', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'Mag', '6': 'Giu', '7': 'Lug', '8': 'Ago', '9': 'Set', '10': 'Ott', '11': 'Nov', '12': 'Dic' }
      } else {
        this.monthNames = { '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr', '5': 'May', '6': 'Jun', '7': 'Jul', '8': 'Aug', '9': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec' }
      }
    }
  }



  getProjectPlan() {
    this.prjctPlanService.projectPlan$
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((projectProfileData: any) => {
        this.logger.log('[HOME] - getProjectPlan project Profile Data', projectProfileData)
        if (projectProfileData) {


          this.prjct_name = projectProfileData.name;
          this.prjct_profile_name = projectProfileData.profile_name;
          this.profile_name = projectProfileData.profile_name;
          this.prjct_trial_expired = projectProfileData.trial_expired;
          this.prjct_profile_type = projectProfileData.profile_type;
          this.subscription_is_active = projectProfileData.subscription_is_active;
          this.subscription_end_date = projectProfileData.subscription_end_date;


          this.showSpinner = false;

          if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false || this.prjct_profile_type === 'free' && this.prjct_trial_expired === true) {
            this.DISPLAY_OPH_AS_DISABLED = true;
          } else {
            this.DISPLAY_OPH_AS_DISABLED = false;
          }

          if (this.prjct_profile_type === 'free') {
            if (this.prjct_trial_expired === false) {
              this.logger.log('[HOME] getProjectPlan BRS-LANG 2 ', this.browserLang);

              this.getProPlanTrialTranslation();
              // if (this.browserLang === 'it') {

              //   this.prjct_profile_name = 'Piano Pro (trial)'

              // } else if (this.browserLang !== 'it') {
              //   this.prjct_profile_name = 'Pro (trial) Plan'

              // }
            } else {

              this.getPaidPlanTranslation(projectProfileData.profile_name);
              this.logger.log('[HOME] getProjectPlan BRS-LANG 3 ', this.browserLang);
              // if (this.browserLang === 'it') {

              //   this.prjct_profile_name = 'Piano ' + projectProfileData.profile_name;

              // } else if (this.browserLang !== 'it') {

              //   this.prjct_profile_name = projectProfileData.profile_name + ' Plan';

              // }
            }
          } else if (this.prjct_profile_type === 'payment') {
            this.getPaidPlanTranslation(projectProfileData.profile_name);

            this.logger.log('[HOME] getProjectPlan BRS-LANG 4 ', this.browserLang);
            // if (this.browserLang === 'it') {

            //   this.prjct_profile_name = 'Piano ' + projectProfileData.profile_name;

            // } else if (this.browserLang !== 'it') {

            //   this.prjct_profile_name = projectProfileData.profile_name + ' Plan';
            // }
          }
        }
      }, error => {

        this.logger.error('[HOME] - getProjectPlan - ERROR', error);
      }, () => {
        this.logger.log('[HOME] - getProjectPlan * COMPLETE *')
      });
  }

  getProPlanTrialTranslation() {
    this.translate.get('ProPlanTrial')
      .subscribe((translation: any) => {
        this.prjct_profile_name = translation;
      });
  }

  getPaidPlanTranslation(project_profile_name) {
    this.translate.get('PaydPlanName', { projectprofile: project_profile_name })
      .subscribe((text: string) => {
        this.prjct_profile_name = text;
        this.logger.log('+ + + PaydPlanName ', text)
      });
  }

  goToPayment() {
    if (this.USER_ROLE === 'owner') {
      if (this.prjct_profile_type === 'payment') {
        this.router.navigate(['project/' + this.projectId + '/project-settings/payments']);
      }
    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan()
    }
  }

  goToPricingOrOpenModalSubsExpired() {
    this.logger.log('[HOME] goToPricingOrOpenModalSubsExpired')
    // if (this.USER_ROLE === 'owner') {
    //   if (this.prjct_profile_type === 'free') {

    //     this.router.navigate(['project/' + this.projectId + '/pricing']);

    //   } else if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {

    //     this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
    //     // this.notify.showCheckListModal(true);
    //   } else if (this.prjct_profile_type === 'payment' && this.subscription_is_active === true) {

    //     this.router.navigate(['project/' + this.projectId + '/project-settings/payments']);
    //   }

    // } else {
    //   this.presentModalOnlyOwnerCanManageTheAccountPlan();
    // }

    if (this.USER_ROLE === 'owner') {
      if (this.prjct_profile_type === 'free') {

        this.router.navigate(['project/' + this.projectId + '/pricing']);

      } else if (this.prjct_profile_type === 'payment' && this.subscription_is_active === false) {

        if (this.profile_name !== 'enterprise') {
          this.notify.displaySubscripionHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
        } else if (this.profile_name === 'enterprise') {

          this.notify.displayEnterprisePlanHasExpiredModal(true, this.prjct_profile_name, this.subscription_end_date);
        }
      } else if (this.prjct_profile_type === 'payment' && this.subscription_is_active === true) {
        this.router.navigate(['project/' + this.projectId + '/project-settings/payments']);
      }

    } else {
      this.presentModalOnlyOwnerCanManageTheAccountPlan();
    }
  }

  presentModalOnlyOwnerCanManageTheAccountPlan() {
    const el = document.createElement('div')
    el.innerHTML = this.onlyOwnerCanManageTheAccountPlanMsg + '. ' + "<a href='https://docs.tiledesk.com/knowledge-base/understanding-default-roles/' target='_blank'>" + this.learnMoreAboutDefaultRoles + "</a>"

    swal({
      // title: this.onlyOwnerCanManageTheAccountPlanMsg,
      content: el,
      icon: "info",
      // buttons: true,
      button: {
        text: "OK",
      },
      dangerMode: false,
    })

  }



  // RISOLVE lo USE-CASE: L'UTENTE è NELLA HOME DEL PROGETTO A (DI CUI è OWNER)
  // SEGUE UN LINK CHE LO PORTA (AD ESEMPIO) AL DETTAGLIO DI UNA RICHIESTA DEL PROGETTO B (DI CUI è AGENT)
  // AVVIENE IL CAMBIO DAL PROGETTO A AL PROGETTO B 'ON THE FLY'
  // DOPO AVER VISUALIZZATO IL DETTAGLIO DELLA RICHIESTA L'UTENTE PREME SUL PULSANTE BACK E TORNA INDIETRO ALLA HOME DEL PROGETTO A
  // ANCHE SE NELLO STORAGE IL RUOLO DELL'UTENTE è STATO AGGIORNATO (DA AGENT A OWNER) LA PAGINA HOME NON VISUALIZZA
  // IL PULSANTE 'WIDGET' NN AVENDO FATTO IN TEMPO A AGGIORNARE IL 'ROLE' NELL'HTML
  // CON getUserRole() AGGIORNO this.USER_ROLE QUANDO LA SIDEBAR, NEL MOMENTO
  // IN CUI ESGUE getProjectUser() PASSA LO USER ROLE ALLO USER SERVICE CHE LO PUBBLICA
  // NOTA: LA SIDEBAR AGGIORNA LO USER ROLE PRIMA DELLA HOME
  getUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((userRole) => {

        this.logger.log('[HOME] - SUBSCRIPTION TO USER ROLE »»» ', userRole)
        // used to display / hide 'WIDGET' and 'ANALITCS' in home.component.html
        this.USER_ROLE = userRole;
      })
  }

  // TEST FUNCTION : GET ALL AVAILABLE PROJECT USER
  getAvailableProjectUsersByProjectId() {
    this.logger.log('[HOME] ... CALLING GET AVAILABLE PROJECT USERS')
    this.usersService.getAvailableProjectUsersByProjectId().subscribe((available_project) => {
      this.logger.log('[HOME]  »»»»»»» AVAILABLE PROJECT USERS ', available_project)
    })
  }



  // <!-- RESOUCES (link renamed in WIDGET) -->
  goToResources() {
    // this.router.navigate(['project/' + this.projectId + '/resources']);
    this.router.navigate(['project/' + this.projectId + '/widget']);
  }
  goToRequests() {
    this.router.navigate(['project/' + this.projectId + '/wsrequests']);
  }

  goToAnalytics() {
    this.router.navigate(['project/' + this.projectId + '/analytics']);
  }

  // test link
  goToAnalyticsStaticPage() {
    this.router.navigate(['project/' + this.projectId + '/analytics-demo']);
  }

  // test link
  goToActivitiesStaticPage() {
    this.router.navigate(['project/' + this.projectId + '/activities-demo']);
  }

  // test link
  goToHoursStaticPage() {
    this.router.navigate(['project/' + this.projectId + '/hours-demo']);
  }

  // test link
  goToPricing() {
    this.router.navigate(['project/' + this.projectId + '/pricing']);
  }


  goToOperatingHours() {
    this.router.navigate(['project/' + this.projectId + '/hours']);
  }

  goToMessagesAnalytics() {
    // this.router.navigate(['project/' + this.projectId + '/messages-analytics']);
    if (this.USER_ROLE !== 'agent') {
      this.router.navigate(['project/' + this.projectId + '/analytics/metrics/messages']);
    }
  }

  goToVisitorsAnalytics() {
    if (this.USER_ROLE !== 'agent') {
      this.router.navigate(['project/' + this.projectId + '/analytics/metrics/visitors']);
    }
  }

  // Analytics > Metrics > Conversation
  goToRequestsAnalytics() {
    // this.router.navigate(['project/' + this.projectId + '/conversation-analytics']);
    if (this.USER_ROLE !== 'agent') {
      this.router.navigate(['project/' + this.projectId + '/analytics/metrics']);
    }
  }

  goToContacts() {
    this.router.navigate(['project/' + this.projectId + '/contacts']);
  }

  goToBotsList() {
    this.router.navigate(['project/' + this.projectId + '/bots']);
  }

  goToUsersList() {
    this.router.navigate(['project/' + this.projectId + '/users']);
  }

  goToWidgetSetup() {
    this.router.navigate(['project/' + this.projectId + '/widget-set-up']);
  }
  goToWidgetConversations() {
    this.router.navigate(['project/' + this.projectId + '/wsrequests']);
  }

  goToAppStore() {
    this.router.navigate(['project/' + this.projectId + '/app-store']);
  }



  goToBotProfile(bot_id, bot_type) {
    let botType = ''
    if (bot_type === 'internal') {
      botType = 'native'
    } else {
      botType = bot_type
    }
    if (this.USER_ROLE !== 'agent') {
      this.router.navigate(['project/' + this.projectId + '/bots', bot_id, botType]);
    }
  }

  goToAgentProfile(member_id) {
    this.logger.log('[HOME] - goToAgentProfile (AFTER GETTING PROJECT USER ID) ', member_id)
    // this.router.navigate(['project/' + this.projectId + '/member/' + member_id]);

    this.getProjectuserbyUseridAndGoToEditProjectuser(member_id);
  }

  // SERVED_BY: add this if not exist -->
  getProjectuserbyUseridAndGoToEditProjectuser(member_id: string) {
    this.usersService.getProjectUserByUserId(member_id)
      .subscribe((projectUser: any) => {
        this.logger.log('[HOME] - GET projectUser by USER-ID ', projectUser)
        if (projectUser) {
          this.logger.log('[HOME] - GET projectUser > projectUser id', projectUser[0]._id);

          this.router.navigate(['project/' + this.projectId + '/user/edit/' + projectUser[0]._id]);
        }
      }, (error) => {
        this.logger.error('[HOME] - GET projectUser by USER-ID - ERROR ', error);
      }, () => {
        this.logger.log('[] - GET projectUser by USER-ID * COMPLETE *');
      });
  }



  openChat() {
    // const url = this.CHAT_BASE_URL;
    this.notify.publishHasClickedChat(true);
    // window.open(url, '_blank');

    // --- new

    let baseUrl = this.CHAT_BASE_URL + '#/conversation-detail/'
    let url = baseUrl
    const myWindow = window.open(url, 'Tiledesk - Open Source Live Chat');
    myWindow.focus();
    // const chatTabCount = localStorage.getItem('tabCount');
    // this.logger.log('[HOME] openChat chatTabCount ', chatTabCount);
    // if (chatTabCount) {
    //   if (+chatTabCount > 0) {
    //     this.logger.log('[HOME] openChat chatTabCount > 0 ')

    //     this.openWindow('Tiledesk - Open Source Live Chat', url + '?conversation_detail');
    //     // this.focusWin('Tiledesk - Open Source Live Chat')
    //     // window.open('Tiledesk - Open Source Live Chat', url).focus();
    //   } else if (chatTabCount && +chatTabCount === 0) {
    //     this.openWindow('Tiledesk - Open Source Live Chat', url);
    //   }
    // } else {
    //   this.openWindow('Tiledesk - Open Source Live Chat', url);
    // }

  }

  openWindow(winName: any, winURL: any) {
    const myWindows = new Array();
    if (myWindows[winName] && !myWindows[winName].closed) {
      alert('window already exists');
    } else {
      myWindows[winName] = window.open(winURL, winName);
    }
  }

  focusWin(winName: any) {
    const myWindows = new Array();
    if (myWindows[winName] && !myWindows[winName].closed) {
      myWindows[winName].focus();
    } else {
      // alert('cannot focus closed or nonexistant window');
      this.logger.log('[HOME] - cannot focus closed or nonexistant window');
    }
  }

  // loads an URL into the popup without reloading it
  // openChatWindow(chatUrl: any, chatWindowName: any) {
  //   // open the window with blank url
  //   const chatwin = window.open('', chatWindowName);
  //   try {
  //     // if we just opened the window
  //     // this.logger.log('1) mywin ', chatwin)
  //     // this.logger.log('1) mywin.document ', chatwin.document)
  //     if (chatwin.closed || (!chatwin.document.URL) || (chatwin.document.URL.indexOf('about') === 0)) {
  //       // this.logger.log('2) mywin ', chatwin)
  //       // this.logger.log('2) mywin.document ', chatwin.document)
  //       chatwin.location.href = chatUrl;
  //     } else {
  //       // this.logger.log('3) mywin ', chatwin)
  //       // this.logger.log('3) mywin.document ', chatwin.document)
  //       chatwin.focus();
  //     }
  //   } catch (err) {
  //     this.logger.log('err ', err)
  //   }
  //   // return the window
  //   return chatwin;
  // }

  goToTiledeskMobileAppPage() {

    let url = ''
    if (this.browserLang === 'it') {
      url = 'https://tiledesk.com/mobile-live-chat-android-e-iphone-apps/';
    } else {
      url = 'https://tiledesk.com/mobile-live-chat-android-e-iphone-apps/';
    }
    window.open(url, '_blank');
  }

  goToAdminDocs() {
    let url = ''
    if (this.browserLang === 'it') {
      url = 'https://docs.tiledesk.com/knowledge-base-category/getting-started-for-admins/';
    } else {
      url = 'https://docs.tiledesk.com/knowledge-base-category/getting-started-for-admins/';
    }
    window.open(url, '_blank');
  }


  goToAgentDocs() {
    let url = ''
    if (this.browserLang === 'it') {
      url = 'https://docs.tiledesk.com/knowledge-base-category/getting-started-for-agents/';
    } else {
      url = 'https://docs.tiledesk.com/knowledge-base-category/getting-started-for-agents/';
    }
    window.open(url, '_blank');
  }

  goToDeveloperDocs() {
    // const url = 'https://docs.tiledesk.com/';
    const url = 'https://developer.tiledesk.com';

    window.open(url, '_blank');
  }


  goToInstallWithTagManagerDocs() {
    let url = ''
    if (this.browserLang === 'it') {
      url = 'https://docs.tiledesk.com/knowledge-base/google-tag-manager-add-tiledesk-to-your-sites/';
    } else {
      url = 'https://docs.tiledesk.com/knowledge-base/google-tag-manager-add-tiledesk-to-your-sites/';
    }
    window.open(url, '_blank');
  }

  goToChangelogBlog() {
    const url = 'https://tiledesk.com/tiledesk-changelog'
    window.open(url, '_blank');
    this.usersLocalDbService.savChangelogDate()
    this.hidechangelogrocket = true;
  }

  getHasOpenBlogKey() {
    const hasOpenedBlog = this.usersLocalDbService.getStoredChangelogDate();
    this.logger.log('[HOME]  »»»»»»»»» hasOpenedBlog ', hasOpenedBlog);
    if (hasOpenedBlog === true) {
      this.hidechangelogrocket = true;
    } else {
      this.hidechangelogrocket = false;
    }
  }


  // NO MORE USED
  goToHistory() {
    this.router.navigate(['project/' + this.projectId + '/history']);
  }

  // no more used
  getProjectId() {
    // this.projectid = this.route.snapshot.params['projectid'];
    // this.logger.log('SIDEBAR - - - - - CURRENT projectid ', this.projectid);
    this.route.params.subscribe(params => {
      // const param = params['projectid'];
      this.logger.log('[HOME] - CURRENT projectid ', params);
    });
  }

  getLoggedUser() {
    this.auth.user_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((user) => {
        this.logger.log('[HOME] - USER GET IN HOME ', user)
        // tslint:disable-next-line:no-debugger
        // debugger
        this.user = user;

        if (this.user) {

          // !!!! NO MORE USED - MOVED IN USER SERVICE
          // this.getAllUsersOfCurrentProject();
          this.logger.log('[HOME] CALL -> getAllUsersOfCurrentProjectAndSaveInStorage')
          this.usersService.getAllUsersOfCurrentProjectAndSaveInStorage();

        }
      });
  }

  // IS USED TO GET THE PROJECT-USER AND DETERMINE IF THE USER IS AVAILAVLE/UNAVAILABLE WHEN THE USER ENTER IN HOME
  // (GET THE PROJECT-USER CAN NOT BE DONE IN THE SIDEBAR BECAUSE WHEN THE PROJECT
  // IS SELECTED THE SIDEBAR HAS BEEN ALREADY CALLED)
  // *** NOTE: THE SAME CALLBACK IS RUNNED IN THE SIDEBAR.COMP ***
  getProjectUser() {
    this.logger.log('[HOME] CALL GET-PROJECT-USER')
    this.usersService.getProjectUserByUserId(this.user._id).subscribe((projectUser: any) => {
      this.logger.log('[HOME] PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID ', projectUser)
      if (projectUser) {
        this.logger.log('[HOME] PROJECT-USER ID ', projectUser[0]._id)
        this.logger.log('[HOME] USER IS AVAILABLE ', projectUser[0].user_available)
        this.logger.log('[HOME] USER IS BUSY ', projectUser[0].isBusy)
        // this.user_is_available_bs = projectUser.user_available;

        if (projectUser[0].user_available !== undefined) {
          this.usersService.user_availability(projectUser[0]._id, projectUser[0].user_available, projectUser[0].isBusy);
        }
        if (projectUser[0].role !== undefined) {
          this.logger.log('!!! »»» HOME GET THE USER ROLE FOR THE PROJECT »»', this.projectId, '»»» ', projectUser[0].role);

          // SEND THE ROLE TO USER SERVICE THAT PUBLISH
          this.usersService.user_role(projectUser[0].role);

          // save the user role in storage - then the value is get by auth.service:
          // the user with agent role can not access to the pages under the settings sub-menu
          // this.auth.user_role(projectUser[0].role);
          // this.usersLocalDbService.saveUserRoleInStorage(projectUser[0].role);

          // used to display / hide 'WIDGET' and 'ANALITCS' in home.component.html
          this.USER_ROLE = projectUser[0].role;
        }

      }
    }, (error) => {
      this.logger.error('[HOME] PROJECT-USER GET BY PROJECT-ID & CURRENT-USER-ID ERROR ', error);
    }, () => {
      this.logger.log('[HOME] PROJECT-USER GET BY PROJECT ID & CURRENT-USER-ID  * COMPLETE *');
    });
  }


  // NOT YET USED
  superUserAuth() {
    if (!this.auth.superUserAuth(this.currentUserEmailgetFromStorage)) {
      this.logger.log('[HOME] +++ CURRENT U IS NOT SUPER USER ', this.currentUserEmailgetFromStorage);
      this.IS_SUPER_USER = false;
    } else {
      this.logger.log('[HOME] +++ !! CURRENT U IS SUPER USER ', this.currentUserEmailgetFromStorage);
      this.IS_SUPER_USER = true;

    }
  }

  displayCheckListModal() {
    this.notify.showCheckListModal(true);
  }

  goToUserActivitiesLog() {
    this.router.navigate(['project/' + this.projectId + '/activities']);
  }



  // ------------------------------------------------------------------
  // LAST 7 DAYS CONVERSATIONS GRAPH
  // ------------------------------------------------------------------
  getRequestByLast7Day() {
    this.analyticsService.requestsByDay(7)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((requestsByDay: any) => {
        this.logger.log('[HOME] - REQUESTS BY DAY ', requestsByDay);

        // CREATES THE INITIAL ARRAY WITH THE LAST SEVEN DAYS (calculated with moment) AND REQUESTS COUNT = O
        const last7days_initarray = []
        for (let i = 0; i <= 6; i++) {
          // this.logger.log('»» !!! ANALYTICS - LOOP INDEX', i);
          last7days_initarray.push({ 'count': 0, day: moment().subtract(i, 'd').format('D-M-YYYY') })
        }

        last7days_initarray.reverse()

        this.logger.log('[HOME] - REQUESTS BY DAY - MOMENT LAST SEVEN DATE (init array)', last7days_initarray);

        const requestsByDay_series_array = [];
        const requestsByDay_labels_array = []

        // CREATES A NEW ARRAY FROM THE ARRAY RETURNED FROM THE SERVICE SO THAT IT IS COMPARABLE WITH last7days_initarray
        const requestsByDay_array = []
        for (let j = 0; j < requestsByDay.length; j++) {
          if (requestsByDay[j]) {
            requestsByDay_array.push({ 'count': requestsByDay[j]['count'], day: requestsByDay[j]['_id']['day'] + '-' + requestsByDay[j]['_id']['month'] + '-' + requestsByDay[j]['_id']['year'] })

          }

        }
        this.logger.log('[HOME] - REQUESTS BY DAY FORMATTED ', requestsByDay_array);

        /**
         * MERGE THE ARRAY last7days_initarray WITH requestsByDay_array  */
        // Here, requestsByDay_formatted_array.find(o => o.day === obj.day)
        // will return the element i.e. object from requestsByDay_formatted_array if the day is found in the requestsByDay_formatted_array.
        // If not, then the same element in last7days i.e. obj is returned.
        const requestByDays_final_array = last7days_initarray.map(obj => requestsByDay_array.find(o => o.day === obj.day) || obj);
        this.logger.log('[HOME] - REQUESTS BY DAY - FINAL ARRAY ', requestByDays_final_array);

        const _requestsByDay_series_array = [];
        const _requestsByDay_labels_array = [];

        requestByDays_final_array.forEach(requestByDay => {
          //this.logger.log('»» !!! ANALYTICS - REQUESTS BY DAY - requestByDay', requestByDay);
          _requestsByDay_series_array.push(requestByDay.count)

          const splitted_date = requestByDay.day.split('-');
          //this.logger.log('»» !!! ANALYTICS - REQUESTS BY DAY - SPLITTED DATE', splitted_date);
          _requestsByDay_labels_array.push(splitted_date[0] + ' ' + this.monthNames[splitted_date[1]])
        });


        this.logger.log('[HOME] - REQUESTS BY DAY - SERIES (ARRAY OF COUNT - to use for debug)', requestsByDay_series_array);
        this.logger.log('[HOME] - REQUESTS BY DAY - SERIES (+ NEW + ARRAY OF COUNT)', _requestsByDay_series_array);
        this.logger.log('[HOME] - REQUESTS BY DAY - LABELS (ARRAY OF DAY - to use for debug)', requestsByDay_labels_array);
        this.logger.log('[HOME] - REQUESTS BY DAY - LABELS (+ NEW + ARRAY OF DAY)', _requestsByDay_labels_array);

        const higherCount = this.getMaxOfArray(_requestsByDay_series_array);
        this.logger.log('[HOME] - REQUESTS BY DAY - HIGHTER COUNT ', higherCount);

        let lang = this.browserLang;
        const canvas = <HTMLCanvasElement>document.getElementById('last7dayChart'); // nk added to resolve Failed to create chart: can't acquire context from the given item
        const ctx = canvas.getContext('2d'); // nk added to resolve Failed to create chart: can't acquire context from the given item
        // var lineChart = new Chart('last7dayChart', {
        var lineChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: _requestsByDay_labels_array,
            datasets: [{
              label: 'Number of conversations in last 7 days ',//active label setting to true the legend value
              data: _requestsByDay_series_array,
              fill: true, //riempie zona sottostante dati
              lineTension: 0.4,
              backgroundColor: 'rgba(30, 136, 229, 0.6)',
              borderColor: 'rgba(30, 136, 229, 1)',
              borderWidth: 3,
              borderDash: [],
              borderDashOffset: 0.0,
              pointBackgroundColor: 'rgba(255, 255, 255, 0.8)',
              pointBorderColor: '#1e88e5'

            }]
          },
          options: {
            maintainAspectRatio: false, //allow to resize chart
            title: {
              text: 'Last 7 days converdations',
              display: false
            },
            legend: {
              display: false //do not show label title
            },
            scales: {
              xAxes: [{
                ticks: {
                  beginAtZero: true,
                  display: true,
                  //minRotation: 30,
                  fontColor: 'black',

                },
                gridLines: {
                  display: true,
                  borderDash: [8, 4],
                  //color:'rgba(255, 255, 255, 0.5)',

                }

              }],
              yAxes: [{
                gridLines: {
                  display: true,
                  borderDash: [8, 4],


                },
                ticks: {
                  beginAtZero: true,
                  userCallback: function (label, index, labels) {
                    //userCallback is used to return integer value to ylabel
                    if (Math.floor(label) === label) {
                      return label;
                    }
                  },
                  display: true,
                  fontColor: 'black',
                  suggestedMax: higherCount + 2,

                }
              }]
            },
            tooltips: {
              callbacks: {
                label: function (tooltipItem, data) {

                  const currentItemValue = tooltipItem.yLabel

                  if (lang === 'it') {
                    return 'Conversazioni: ' + currentItemValue;
                  } else {
                    return 'Conversations:' + currentItemValue;
                  }

                }
              }
            }

          }
          ,
          plugins: [{
            beforeDraw: function (chartInstance, easing) {
              var ctx = chartInstance.chart.ctx;
              //this.logger.log("chartistance",chartInstance)
              //ctx.fillStyle = 'red'; // your color here
              ctx.height = 128
              //chartInstance.chart.canvas.parentNode.style.height = '128px';
              ctx.font = "Google Sans"
              var chartArea = chartInstance.chartArea;
              //ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
            }
          }]
        });

      }, (error) => {
        this.logger.error('[HOME] - REQUESTS BY DAY - ERROR ', error);

      }, () => {
        this.logger.log('[HOME] - REQUESTS BY DAY * COMPLETE *');

      });
  }


  // ----------------------------------------------------------------------------------------------
  // VISITOR GRAPH FOR THE NEW NOME - NOT MORE USED - REPLACED WITH LAST 7 DAYS CONVERSATIONS GRAPH
  // ----------------------------------------------------------------------------------------------
  getVisitorsByLastNDays(lastdays) {
    this.analyticsService.getVisitorsByDay(lastdays).subscribe((visitorsByDay) => {
      this.logger.log("[HOME] »» VISITORS BY DAY RESULT: ", visitorsByDay)

      const last7days_initarray = [];
      for (let i = 0; i < lastdays; i++) {
        last7days_initarray.push({ 'count': 0, day: moment().subtract(i, 'd').format('D/M/YYYY') })
      }

      last7days_initarray.reverse();
      this.logger.log("[HOME] »» LAST 7 DAYS VISITORS - INIT ARRAY: ", last7days_initarray)

      const visitorsByDay_series_array = [];
      const visitorsByDay_labels_array = [];

      // CREATES A NEW ARRAY FROM THE ARRAY RETURNED FROM THE SERVICE SO THAT IT IS COMPARABLE WITH last7days_initarray
      const visitorsByDay_array = [];
      for (let j = 0; j < visitorsByDay.length; j++) {
        if (visitorsByDay[j]) {
          visitorsByDay_array.push({ 'count': visitorsByDay[j]['count'], day: visitorsByDay[j]['_id']['day'] + '/' + visitorsByDay[j]['_id']['month'] + '/' + visitorsByDay[j]['_id']['year'] })
        }
      }

      // MERGE last7days_initarray & visitorsByDay_array
      const visitorsByDays_final_array = last7days_initarray.map(obj => visitorsByDay_array.find(o => o.day === obj.day) || obj);

      this.initDay = visitorsByDays_final_array[0].day;
      this.endDay = visitorsByDays_final_array[lastdays - 1].day;
      this.logger.log("[HOME] INIT", this.initDay, "END", this.endDay);

      visitorsByDays_final_array.forEach((visitByDay) => {
        visitorsByDay_series_array.push(visitByDay.count)
        const splitted_date = visitByDay.day.split('/');
        visitorsByDay_labels_array.push(splitted_date[0] + ' ' + this.monthNames[splitted_date[1]])
      })

      this.logger.log('[HOME] »» VISITORS BY DAY - SERIES (+ NEW + ARRAY OF COUNT)', visitorsByDay_series_array);
      this.logger.log('[HOME] »» VISITORS BY DAY - LABELS (+ NEW + ARRAY OF DAY)', visitorsByDay_labels_array);

      const higherCount = this.getMaxOfArray(visitorsByDay_series_array);

      let lang = this.browserLang;

      var lineChart = new Chart('last7dayVisitors', {
        type: 'line',
        data: {
          labels: visitorsByDay_labels_array,
          datasets: [{
            label: 'Number of visitors in last 7 days ',
            data: visitorsByDay_series_array,
            fill: true,
            lineTension: 0.4,
            backgroundColor: 'rgba(30, 136, 229, 0.6)',
            borderColor: 'rgba(30, 136, 229, 1)',
            borderWidth: 3,
            borderDash: [],
            borderDashOffset: 0.0,
            pointBackgroundColor: 'rgba(255, 255, 255, 0.8)',
            pointBorderColor: '#1e88e5'
          }]
        },
        options: {
          maintainAspectRatio: false,
          title: {
            text: 'TITLE',
            display: false
          },
          legend: {
            display: false
          },
          scales: {
            xAxes: [{
              ticks: {
                beginAtZero: true,
                display: true,
                fontColor: 'black'
              },
              gridLines: {
                display: true,
                borderDash: [8, 4]
              }
            }],
            yAxes: [{
              gridLines: {
                display: true,
                borderDash: [8, 4]
              },
              ticks: {
                beginAtZero: true,
                userCallback: function (label, index, labels) {
                  if (Math.floor(label) === label) {
                    return label;
                  }
                },
                display: true,
                fontColor: 'black',
                suggestedMax: higherCount + 2
              }
            }]
          },
          tooltips: {
            callbacks: {
              label: function (tooltipItem, data) {
                const currentItemValue = tooltipItem.yLabel

                if (lang == 'it') {
                  return 'Visitatori: ' + currentItemValue;
                } else {
                  return 'Visitors: ' + currentItemValue;
                }
              }
            }
          }
        },
        plugins: [{
          beforeDraw: function (chartInstance, easing) {
            var ctx = chartInstance.chart.ctx;
            ctx.height = 128
            ctx.font = "Google Sans"
            var chartArea = chartInstance.chartArea;
          }
        }]
      })

    }, (error) => {
      this.logger.error('[HOME] »» VISITORS BY DAY - ERROR ', error);
    }, () => {
      this.logger.log('[HOME] »» VISITORS BY DAY - * COMPLETE * ');
    })
  }

  getMaxOfArray(requestsByDay_series_array) {
    return Math.max.apply(null, requestsByDay_series_array);
  }

}
