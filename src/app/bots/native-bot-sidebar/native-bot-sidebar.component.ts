
import { Component, HostListener, Input, OnChanges, OnInit } from '@angular/core'
import { LoggerService } from './../../services/logger/logger.service'
import { AppConfigService } from '../../services/app-config.service'
import { AuthService } from '../../core/auth.service'
import { NavigationEnd, Router } from '@angular/router'
import { Location } from '@angular/common'
import { TranslateService } from '@ngx-translate/core'
import { UsersService } from 'app/services/users.service'
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'appdashboard-native-bot-sidebar',
  templateUrl: './native-bot-sidebar.component.html',
  styleUrls: ['./native-bot-sidebar.component.scss'],
})
export class NativeBotSidebarComponent implements OnInit, OnChanges {

  ///// NK ----------------------------------------------------
  @Input() faqKb_name: string;
  @Input() botDefaultSelectedLang: string;
  @Input() botType: string;
  @Input() id_faq_kb: string;
  @Input() botProfileImageExist: boolean;
  @Input() botImageHasBeenUploaded: boolean;
  @Input() botProfileImageurl: string;
  public faqKb_name_truncated:  string;

  public botTypeForInput: string;
  public bot_lang_in_badge: string;
  public GENERAL_ROUTE_IS_ACTIVE: boolean;
  public INTENTS_ROUTE_IS_ACTIVE: boolean;
  public FULFILLMENT_ROUTE_IS_ACTIVE: boolean;
  public TRAINING_ROUTE_IS_ACTIVE: boolean;

  ///// ./ Nk -------------------------------------------------




  isVisibleANA: boolean
  isVisibleACT: boolean
  isVisibleTRI: boolean
  isVisibleGRO: boolean
  isVisibleDEP: boolean
  isVisibleOPH: boolean
  isVisibleCAR: boolean
  isVisibleLBS: boolean
  isVisibleAPP: boolean



  public_Key: string
  USER_ROLE: any
  CHAT_BASE_URL: string
  project: any
  route: string
  sidebar_settings_height: any
  IS_OPEN: boolean = true
  routing_and_depts_lbl: string;
  teammatates_and_groups_lbl: string;
  private unsubscribe$: Subject<any> = new Subject<any>();
  constructor(
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    private auth: AuthService,
    public router: Router,
    public location: Location,
    private translate: TranslateService,
    private usersService: UsersService,
  ) { }

  ngOnInit() {
    this.getUserRole();

    this.getCurrentProject();
    this.getCurrentRoute();
    // this.getMainContentHeight();
    this.listenSidebarIsOpened();

  }
  ngOnChanges() {
    console.log('[NATIVE-BOT-SIDEBAR] faqKb_name ', this.faqKb_name)

    if (this.faqKb_name && this.faqKb_name.length > 20 ) {
      this.faqKb_name_truncated = this.faqKb_name.substring(0, 18) + '...';
    } else   if (this.faqKb_name && this.faqKb_name.length < 20 ) {
      this.faqKb_name_truncated = this.faqKb_name
    }
    
   
    console.log('[NATIVE-BOT-SIDEBAR] bot type ', this.botType)
    console.log('[NATIVE-BOT-SIDEBAR] botDefaultSelectedLang ', this.botDefaultSelectedLang)
    console.log('[NATIVE-BOT-SIDEBAR] botProfileImageExist ', this.botProfileImageExist)
    console.log('[NATIVE-BOT-SIDEBAR] botImageHasBeenUploaded ', this.botImageHasBeenUploaded)
    console.log('[NATIVE-BOT-SIDEBAR] botProfileImageurl ', this.botProfileImageurl)

    if (this.botDefaultSelectedLang) {
      const botDefaultSelectedLangSegments = this.botDefaultSelectedLang.split('-')
      console.log('[NATIVE-BOT-SIDEBAR] botDefaultSelectedLangSegments ', botDefaultSelectedLangSegments);
      this.bot_lang_in_badge = botDefaultSelectedLangSegments[1].trim();
      console.log('[NATIVE-BOT-SIDEBAR] bot_lang_in_badge ', this.bot_lang_in_badge);
    }
    if (this.botType && this.botType === 'native') {
      this.botTypeForInput = 'Resolution'
    }


  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.getWindowWidthOnInit();
    }, 0);
  }

  getUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((userRole) => {
        //  console.log('[SETTINGS-SIDEBAR]] - SUBSCRIPTION TO USER ROLE »»» ', userRole)
        this.USER_ROLE = userRole;
      })
  }

  listenSidebarIsOpened() {
    this.auth.settingSidebarIsOpned.subscribe((isopened) => {
      this.logger.log('[NATIVE-BOT-SIDEBAR] NATIVE-BOT-SIDEBAR is opened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN = isopened
    })
  }

  toggleSettingsSidebar(IS_OPEN) {
    this.logger.log('[NATIVE-BOT-SIDEBAR] IS_OPEN ', IS_OPEN)
    // this.IS_OPEN = IS_OPEN
    this.auth.toggleSettingsSidebar(IS_OPEN)
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const newInnerWidth = event.target.innerWidth;

    // console.log('SETTINGS-SIDEBAR] ON RESIZE WINDOW WIDTH ', newInnerWidth);
    if (newInnerWidth < 1200) {
      this.toggleSettingsSidebar(false)
    }
    if (newInnerWidth >= 1200) {
      this.toggleSettingsSidebar(true)
    }
  }


  getWindowWidthOnInit() {
    const onInitWindoeWidth = window.innerWidth;
    // console.log('SETTINGS-SIDEBAR] ON INIT WINDOW WIDTH ', onInitWindoeWidth);
    if (onInitWindoeWidth < 1200) {
      this.toggleSettingsSidebar(false)
    }
    if (onInitWindoeWidth >= 1200) {
      this.toggleSettingsSidebar(true)
    }
  }


  getCurrentProject() {
    this.logger.log('[NATIVE-BOT-SIDEBAR] - CALLING GET CURRENT PROJECT  ', this.project)
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      // this.logger.log('[SIDEBAR] project from AUTH service subscription  ', this.project)
    })
  }

  goToBotGeneralSettings() {
    this.router.navigate(['project/' + this.project._id + '/bots/general/' + this.id_faq_kb + "/" + this.botType]);
  }

  goToBotIntents() {
    this.router.navigate(['project/' + this.project._id + '/bots/intents/' + this.id_faq_kb + "/" + this.botType]);
  }

  goToBotfulfillment() {
    this.router.navigate(['project/' + this.project._id + '/bots/fulfillment/' + this.id_faq_kb + "/" + this.botType]);
  }

  goToBotTraining() {
    this.router.navigate(['project/' + this.project._id + '/faq/test', this.id_faq_kb]);
  }





  getCurrentRoute() {
    this.route = this.router.url
    if (this.route.indexOf('/bots/general') !== -1) {
      this.GENERAL_ROUTE_IS_ACTIVE = true
      console.log('[NATIVE-BOT-SIDEBAR] - GENERAL_ROUTE_IS_ACTIVE  ', this.GENERAL_ROUTE_IS_ACTIVE)
    } else {
      this.GENERAL_ROUTE_IS_ACTIVE = false
      console.log('[NATIVE-BOT-SIDEBAR] - GENERAL_ROUTE_IS_ACTIVE  ', this.GENERAL_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/bots/intents') !== -1) {
      this.INTENTS_ROUTE_IS_ACTIVE = true
      console.log('[NATIVE-BOT-SIDEBAR] - INTENTS_ROUTE_IS_ACTIVE  ', this.INTENTS_ROUTE_IS_ACTIVE)
    } else {
      this.INTENTS_ROUTE_IS_ACTIVE = false
      console.log('[NATIVE-BOT-SIDEBAR] - INTENTS_ROUTE_IS_ACTIVE  ', this.INTENTS_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/bots/fulfillment') !== -1) {
      this.FULFILLMENT_ROUTE_IS_ACTIVE = true
      console.log('[NATIVE-BOT-SIDEBAR] - FULFILLMENT_ROUTE_IS_ACTIVE  ', this.FULFILLMENT_ROUTE_IS_ACTIVE)
    } else {
      this.FULFILLMENT_ROUTE_IS_ACTIVE = false
      console.log('[NATIVE-BOT-SIDEBAR] - FULFILLMENT_ROUTE_IS_ACTIVE  ', this.FULFILLMENT_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/faq/test/') !== -1) {
      this.TRAINING_ROUTE_IS_ACTIVE = true;
      console.log('[NATIVE-BOT-SIDEBAR] - TRAINING_ROUTE_IS_ACTIVE  ', this.TRAINING_ROUTE_IS_ACTIVE)
    } else {
      this.TRAINING_ROUTE_IS_ACTIVE = false;
      console.log('[NATIVE-BOT-SIDEBAR] - TRAINING_ROUTE_IS_ACTIVE  ', this.TRAINING_ROUTE_IS_ACTIVE)
    }
  }
}

