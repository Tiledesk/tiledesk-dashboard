import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { Chatbot } from 'app/models/faq_kb-model';
import { AppConfigService } from 'app/services/app-config.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { UsersService } from 'app/services/users.service';
import { goToCDSVersion } from 'app/utils/util';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'

@Component({
  selector: 'home-cds',
  templateUrl: './home-cds.component.html',
  styleUrls: ['./home-cds.component.scss']
})
export class HomeCdsComponent implements OnInit {

  private unsubscribe$: Subject<any> = new Subject<any>();
  USER_ROLE: string;
  projectId: string;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;
  storageBucket: string;
  baseUrl: string;
  chatbots:  Array<Chatbot> = [];
  chatbotName: string;
  lastUpdatedChatbot: Chatbot;

  constructor(
    public appConfigService: AppConfigService,
    private faqKbService: FaqKbService,
    private usersService: UsersService,
    private logger: LoggerService,
    private router: Router,
    public auth: AuthService
  ) { }

    ngOnInit(): void {
    this.getUserRole()
    this.getCurrentProjectAndPrjctBots()
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }



  getCurrentProjectAndPrjctBots() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        this.logger.log('[HOME-CDS] $UBSCIBE TO PUBLISHED PROJECT - RES  ', project)

        if (project) {

          this.projectId = project._id

          this.getImageStorageThenBots();
        }
      }, (error) => {
        this.logger.error('[HOME-CDS] $UBSCIBE TO PUBLISHED PROJECT - ERROR ', error);

      }, () => {
        this.logger.log('[HOME-CDS] $UBSCIBE TO PUBLISHED PROJECT * COMPLETE *');
      });
  }

  getUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((userRole) => {
        this.logger.log('[HOME-CDS] - SUBSCRIPTION TO USER ROLE »»» ', userRole)
        this.USER_ROLE = userRole;
      })
  }


  getImageStorageThenBots() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {

      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[HOME-CDS] - IMAGE STORAGE ', this.storageBucket, 'usecase firebase')

      
      this.getProjectBots(this.storageBucket, this.UPLOAD_ENGINE_IS_FIREBASE) // USED FOR COUNT OF BOTS FOR THE NEW HOME-CDS-CREATE-CHATBOT-CREATE-CHATBOT

    } else {

      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().baseImageUrl;
      this.logger.log('[HOME-CDS] - IMAGE STORAGE ', this.baseUrl, 'usecase native')
      
      this.getProjectBots(this.baseUrl, this.UPLOAD_ENGINE_IS_FIREBASE) // USED FOR COUNT OF BOTS FOR THE NEW HOME-CDS-CREATE-CHATBOT-CREATE-CHATBOT
    }
  }


  getProjectBots(storage, uploadEngineIsFirebase) {
    this.faqKbService.getFaqKbByProjectId().subscribe((faqKb: any) => {
      if (faqKb) {
        faqKb.sort(function compare(a: Chatbot, b: Chatbot) {
          if (a['updatedAt'] > b['updatedAt']) {
            return -1;
          }
          if (a['updatedAt'] < b['updatedAt']) {
            return 1;
          }
          return 0;
        });

        this.logger.log('[HOME-CDS] - GET FAQKB RES (sorted)', faqKb);
 
        this.chatbotName = faqKb[0].name
        this.lastUpdatedChatbot = faqKb[0]
        this.logger.log('[HOME-CDS] - GET FAQKB lastUpdatedChatbot', this.lastUpdatedChatbot);
      }
  
    }, (error) => {
      this.logger.error('[HOME-CDS] - GET FAQKB - ERROR ', error);

    }, () => {
      this.logger.log('[HOME-CDS] - GET FAQKB * COMPLETE *');
    });
  }

  goToBotProfile() {
    if (this.USER_ROLE !== 'agent') {
      // this.router.navigate(['project/' + this.project._id + '/tilebot/intents/', bot_id, botType]);
      // this.router.navigate(['project/' + this.projectId + '/cds/', bot._id, 'intent', '0', 'h']);
      goToCDSVersion(this.router, this.lastUpdatedChatbot, this.projectId, this.appConfigService.getConfig().cdsBaseUrl)
    }
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

}
