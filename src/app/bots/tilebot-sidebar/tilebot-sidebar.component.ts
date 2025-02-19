import { Component, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LoggerService } from './../../services/logger/logger.service'
import { AppConfigService } from '../../services/app-config.service'
import { AuthService } from '../../core/auth.service'
import { Router } from '@angular/router'
import { Location } from '@angular/common'
import { TranslateService } from '@ngx-translate/core'
import { UsersService } from 'app/services/users.service'
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FaqKbService } from 'app/services/faq-kb.service'
import { DomSanitizer } from '@angular/platform-browser';
import { ProjectUser } from 'app/models/project-user';

@Component({
  selector: 'appdashboard-tilebot-sidebar',
  templateUrl: './tilebot-sidebar.component.html',
  styleUrls: ['./tilebot-sidebar.component.scss']
})
export class TilebotSidebarComponent implements OnInit , OnChanges{

  @Input() faqKb_name: string;
  @Input() botDefaultSelectedLang: string;
  @Input() botType: string;
  @Input() id_faq_kb: string;
  @Input() botProfileImageExist: boolean;
  @Input() botImageHasBeenUploaded: boolean;
  @Input() botProfileImageurl: any;
  public faqKb_name_truncated: string;

  public botTypeForInput: string;
  public bot_lang_in_badge: string;
  public GENERAL_ROUTE_IS_ACTIVE: boolean;
  public INTENTS_ROUTE_IS_ACTIVE: boolean;
  public FULFILLMENT_ROUTE_IS_ACTIVE: boolean;
  public TRAINING_ROUTE_IS_ACTIVE: boolean;


  USER_ROLE: any
  project: any
  route: string
  IS_OPEN: boolean = true
  private unsubscribe$: Subject<any> = new Subject<any>();

  constructor(
    public appConfigService: AppConfigService,
    private logger: LoggerService,
    private auth: AuthService,
    public router: Router,
    public location: Location,
    private translate: TranslateService,
    private usersService: UsersService,
    private faqKbService: FaqKbService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    this.getUserRole();
    this.getCurrentProject();
    this.getCurrentRoute()
    this.listenSidebarIsOpened();
  }

  ngOnChanges(changes: SimpleChanges) {
    // console.log('[TILEBOT-SIDEBAR] changes ', changes)
    // console.log('[TILEBOT-SIDEBAR] changes faqKb_name ', changes.faqKb_name)
    // console.log('[TILEBOT-SIDEBAR] faqKb_name ', this.faqKb_name)
    const botNameClone = JSON.stringify(this.faqKb_name)
    // console.log('[NATIVE-BOT-SIDEBAR] botNameClone ', botNameClone)
    let botNameCloneNoBracket = ''
    if (botNameClone) {
      botNameCloneNoBracket = botNameClone.replace(/"/g, '')
      // console.log('[TILEBOT-SIDEBAR] botNameCloneNoBracket ', botNameCloneNoBracket)
    }

   
    if (this.faqKb_name && this.faqKb_name.length > 20) {
      this.faqKb_name_truncated = this.faqKb_name.substring(0, 18) + '...';
    } else if (this.faqKb_name && this.faqKb_name.length < 20) {
      this.faqKb_name_truncated = this.faqKb_name
    }

    // console.log('[TILEBOT-SIDEBAR] bot type ', this.botType)
    // console.log('[TILEBOT-SIDEBAR] botDefaultSelectedLang ', this.botDefaultSelectedLang)
    // console.log('[TILEBOT-SIDEBAR] botProfileImageExist ', this.botProfileImageExist)
    // console.log('[TILEBOT-SIDEBAR] botImageHasBeenUploaded ', this.botImageHasBeenUploaded)
    // console.log('[TILEBOT-SIDEBAR] botProfileImageurl ', this.botProfileImageurl)
   
    if (this.botDefaultSelectedLang) {
      const botDefaultSelectedLangSegments = this.botDefaultSelectedLang.split('-')
      // console.log('[TILEBOT-SIDEBAR] botDefaultSelectedLangSegments ', botDefaultSelectedLangSegments);
      this.bot_lang_in_badge = botDefaultSelectedLangSegments[1].trim();
      // console.log('[TILEBOT-SIDEBAR] bot_lang_in_badge ', this.bot_lang_in_badge);
    }
    if (this.botType && this.botType === 'tilebot') {
      this.botTypeForInput = 'Tilebot'
    }

    this.botProfileImageurl = this.sanitizer.bypassSecurityTrustUrl(this.botProfileImageurl)
  }

  ngAfterContentInit() {
    setTimeout(() => {
      this.getWindowWidthOnInit();
    }, 0);
  }

  listenSidebarIsOpened() {
    this.auth.tilebotSidebarIsOpened.subscribe((isopened) => {
      this.logger.log('[NATIVE-BOT-SIDEBAR] NATIVE-BOT-SIDEBAR is opened (FROM SUBSCRIPTION) ', isopened)
      this.IS_OPEN = isopened
    })
  }

  toggletilebotSidebar(IS_OPEN) {
    // console.log('[SETTINGS-SIDEBAR] IS_OPEN ', IS_OPEN)
    this.IS_OPEN = IS_OPEN;
    this.auth.toggletilebotSidebar(IS_OPEN)
  }

  getUserRole() {
    this.usersService.projectUser_bs.pipe(takeUntil(this.unsubscribe$)).subscribe((projectUser: ProjectUser) => {
      if(projectUser){
        //  console.log('[SETTINGS-SIDEBAR]] - SUBSCRIPTION TO USER ROLE »»» ', userRole)
        this.USER_ROLE = projectUser.role;
      }
    })
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const newInnerWidth = event.target.innerWidth;
    // console.log('[NATIVE-BOT-SIDEBAR] ON RESIZE WINDOW WIDTH ', newInnerWidth);
    if (newInnerWidth < 1200) {
      this.IS_OPEN = false
      this.toggletilebotSidebar(false)
    }
    if (newInnerWidth >= 1200) {
      this.IS_OPEN = true
      this.toggletilebotSidebar(true)
    }
  }

  getWindowWidthOnInit() {
    const onInitWindoeWidth = window.innerWidth;
    // console.log('[NATIVE-BOT-SIDEBAR] ON INIT WINDOW WIDTH ', onInitWindoeWidth);
    if (onInitWindoeWidth < 1200) {
      this.IS_OPEN = false
      this.toggletilebotSidebar(false)
    }
    if (onInitWindoeWidth >= 1200) {
      this.IS_OPEN = true
      this.toggletilebotSidebar(true)
    }
  }

  getCurrentProject() {
    this.logger.log('[NATIVE-BOT-SIDEBAR] - CALLING GET CURRENT PROJECT  ', this.project)
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      // this.logger.log('[NATIVE-BOT-SIDEBAR] project from AUTH service subscription  ', this.project)
    })
  }

  goToTilebotGeneralSettings() {
    this.router.navigate(['project/' + this.project._id + '/tilebot/general/' + this.id_faq_kb + "/" + this.botType]);
  }

  goToTilebotIntents() {
    this.router.navigate(['project/' + this.project._id + '/tilebot/intents/' + this.id_faq_kb + "/" + this.botType]);
  }

  goToTilebotfulfillment() {
    this.router.navigate(['project/' + this.project._id + '/tilebot/fulfillment/' + this.id_faq_kb + "/" + this.botType]);
  }

  goToBotTraining() {
    this.router.navigate(['project/' + this.project._id + '/faq/test', this.id_faq_kb]);
  }

  getCurrentRoute() {
    this.route = this.router.url
    if (this.route.indexOf('/tilebot/general') !== -1) {
      this.GENERAL_ROUTE_IS_ACTIVE = true
      // console.log('[NATIVE-BOT-SIDEBAR] - GENERAL_ROUTE_IS_ACTIVE  ', this.GENERAL_ROUTE_IS_ACTIVE)
    } else {
      this.GENERAL_ROUTE_IS_ACTIVE = false
      // console.log('[NATIVE-BOT-SIDEBAR] - GENERAL_ROUTE_IS_ACTIVE  ', this.GENERAL_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/tilebot/intents') !== -1) {
      this.INTENTS_ROUTE_IS_ACTIVE = true
      // console.log('[NATIVE-BOT-SIDEBAR] - INTENTS_ROUTE_IS_ACTIVE  ', this.INTENTS_ROUTE_IS_ACTIVE)
    } else {
      this.INTENTS_ROUTE_IS_ACTIVE = false
      // console.log('[NATIVE-BOT-SIDEBAR] - INTENTS_ROUTE_IS_ACTIVE  ', this.INTENTS_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/tilebot/fulfillment') !== -1) {
      this.FULFILLMENT_ROUTE_IS_ACTIVE = true
      // console.log('[NATIVE-BOT-SIDEBAR] - FULFILLMENT_ROUTE_IS_ACTIVE  ', this.FULFILLMENT_ROUTE_IS_ACTIVE)
    } else {
      this.FULFILLMENT_ROUTE_IS_ACTIVE = false
      // console.log('[NATIVE-BOT-SIDEBAR] - FULFILLMENT_ROUTE_IS_ACTIVE  ', this.FULFILLMENT_ROUTE_IS_ACTIVE)
    }

    if (this.route.indexOf('/faq/test/') !== -1) {
      this.TRAINING_ROUTE_IS_ACTIVE = true;
      // console.log('[NATIVE-BOT-SIDEBAR] - TRAINING_ROUTE_IS_ACTIVE  ', this.TRAINING_ROUTE_IS_ACTIVE)
    } else {
      this.TRAINING_ROUTE_IS_ACTIVE = false;
      // console.log('[NATIVE-BOT-SIDEBAR] - TRAINING_ROUTE_IS_ACTIVE  ', this.TRAINING_ROUTE_IS_ACTIVE)
    }
  }


}
