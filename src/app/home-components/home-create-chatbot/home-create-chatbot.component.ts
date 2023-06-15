import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from 'app/services/app-config.service';
import { FaqKbService } from 'app/services/faq-kb.service';
import { LoggerService } from 'app/services/logger/logger.service';
import { UsersService } from 'app/services/users.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'

@Component({
  selector: 'appdashboard-home-create-chatbot',
  templateUrl: './home-create-chatbot.component.html',
  styleUrls: ['./home-create-chatbot.component.scss']
})
export class HomeCreateChatbotComponent implements OnInit {

  private unsubscribe$: Subject<any> = new Subject<any>();
  projectId: string;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;
  storageBucket: string;
  baseUrl: string;
  chatbots: any; 
  USER_ROLE: string;
  constructor(
    public appConfigService: AppConfigService,
    public auth: AuthService,
    private logger: LoggerService,
    private router: Router,
    private faqKbService: FaqKbService,
    private usersService: UsersService,
  ) { }

  ngOnInit(): void {
    this.getCurrentProjectAndGetChatbot();
  }


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

  getCurrentProjectAndGetChatbot() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        console.log('[HOME-CREATE-CHATBOT] $UBSCIBE TO PUBLISHED PROJECT - RES  ', project)

        if (project) {
          
          this.projectId = project._id

          this.getImageStorageThenUserAndBots();
        }
      }, (error) => {
        this.logger.error('[HOME-CREATE-CHATBOT] $UBSCIBE TO PUBLISHED PROJECT - ERROR ', error);

      }, () => {
        this.logger.log('[HOME-CREATE-CHATBOT] $UBSCIBE TO PUBLISHED PROJECT * COMPLETE *');
      });
  }

  getImageStorageThenUserAndBots() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {

      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[HOME-CREATE-CHATBOT] - IMAGE STORAGE ', this.storageBucket, 'usecase firebase')

      // this.getAllUsersOfCurrentProject(this.storageBucket, this.UPLOAD_ENGINE_IS_FIREBASE)  // USED TO DISPLAY THE HUMAN AGENT FOR THE NEW HOME-CREATE-CHATBOT-CREATE-CHATBOT-CREATE-CHATBOT
      this.getAllFaqKbByProjectId(this.storageBucket, this.UPLOAD_ENGINE_IS_FIREBASE) // USED FOR COUNT OF BOTS FOR THE NEW HOME-CREATE-CHATBOT-CREATE-CHATBOT-CREATE-CHATBOT

    } else {

      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().baseImageUrl;
      this.logger.log('[HOME-CREATE-CHATBOT] - IMAGE STORAGE ', this.baseUrl, 'usecase native')
      // this.getAllUsersOfCurrentProject(this.baseUrl, this.UPLOAD_ENGINE_IS_FIREBASE)  // USED TO DISPLAY THE HUMAN AGENT FOR THE NEW HOME-CREATE-CHATBOT-CREATE-CHATBOT-CREATE-CHATBOT
      this.getAllFaqKbByProjectId(this.baseUrl, this.UPLOAD_ENGINE_IS_FIREBASE) // USED FOR COUNT OF BOTS FOR THE NEW HOME-CREATE-CHATBOT-CREATE-CHATBOT-CREATE-CHATBOT
    }

  }


  getAllFaqKbByProjectId(storage, uploadEngineIsFirebase) {
    this.faqKbService.getAllBotByProjectId().subscribe((faqKb: any) => {
      console.log('[HOME-CREATE-CHATBOT] - GET FAQKB RES', faqKb);
      if (faqKb) {

        // -----------------------------------------------------------
        // CHECK IF USER HAS IMAGE (AFTER REMOVING THE "IDENTITY BOT")
        // -----------------------------------------------------------
        faqKb.forEach(bot => {
          console.log('[HOME-CREATE-CHATBOT] - GET FAQKB forEach bot: ', bot)

          if (bot && bot['type'] === "identity") {

            const index = faqKb.indexOf(bot);
            console.log('[HOME-CREATE-CHATBOT] - GET FAQKB INDEX OF IDENTITY BOT', index);
            if (index > -1) {
              faqKb.splice(index, 1);
            }
          }
          let imgUrl = ''
          if (uploadEngineIsFirebase === true) {

            // this.logger.log('[HOME-CREATE-CHATBOT-CREATE-CHATBOT] - CHECK IF BOT HAS IMAGE - USECASE UPLOAD-ENGINE FIREBASE ');
            // ------------------------------------------------------------------------------
            // Usecase uploadEngine Firebase 
            // ------------------------------------------------------------------------------
            imgUrl = "https://firebasestorage.googleapis.com/v0/b/" + storage + "/o/profiles%2F" + bot['_id'] + "%2Fphoto.jpg?alt=media"

          } else {
            // this.logger.log('[HOME-CREATE-CHATBOT-CREATE-CHATBOT] - CHECK IF BOT HAS IMAGE - USECASE UPLOAD-ENGINE NATIVE ');
            // ------------------------------------------------------------------------------
            // Usecase uploadEngine Native 
            // ------------------------------------------------------------------------------
            imgUrl = storage + "images?path=uploads%2Fusers%2F" + bot['_id'] + "%2Fimages%2Fthumbnails_200_200-photo.jpg"
          }
          this.checkImageExists(imgUrl, (existsImage) => {
            if (existsImage == true) {
              console.log('[HOME-CREATE-CHATBOT] - IMAGE EXIST X bot', bot);
              bot.hasImage = true;
            }
            else {
              console.log('[HOME-CREATE-CHATBOT] - IMAGE NOT EXIST X bot', bot);
              bot.hasImage = false;
            }
          });
        });
        this.chatbots = faqKb;
        console.log('[HOME-CREATE-CHATBOT] - GET FAQKB RES this.chatbots', this.chatbots);

        // this.countOfBots = faqKb.length;
        // this.logger.log('[HOME-CREATE-CHATBOT] - GET FAQKB RES', this.countOfBots);
      }
    }, (error) => {
      console.error('[HOME-CREATE-CHATBOT] - GET FAQKB - ERROR ', error);

    }, () => {
      console.log('[HOME-CREATE-CHATBOT] - GET FAQKB * COMPLETE *');
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

  goToBotProfile(bot_id, bot_type) {
    let botType = ''
    if (bot_type === 'internal') {
      botType = 'native'
      if (this.USER_ROLE !== 'agent') {
        this.router.navigate(['project/' + this.projectId + '/bots/intents/', bot_id, botType]);
      }
    } else if (bot_type === 'tilebot') {
      botType = 'tilebot'
      if (this.USER_ROLE !== 'agent') {
        // this.router.navigate(['project/' + this.project._id + '/tilebot/intents/', bot_id, botType]);
        this.router.navigate(['project/' + this.projectId + '/cds/', bot_id, 'intent', '0', 'h']);
      }
    } else {
      botType = bot_type

      if (this.USER_ROLE !== 'agent') {
        this.router.navigate(['project/' + this.projectId + '/bots', bot_id, botType]);
      }
    }

  }



  goToTemplates() {
    this.router.navigate(['project/' + this.projectId + '/bots/templates/all']);
  }

  goToCommunityTemplates() {
    this.router.navigate(['project/' + this.projectId + '/bots/templates/community']);
  }

  goToAddBotFromScratch() { 
    this.router.navigate(['project/' + this.projectId + '/bots/create/tilebot/blank']);
  }


}
