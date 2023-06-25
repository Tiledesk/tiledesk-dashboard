import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { AppConfigService } from 'app/services/app-config.service';
import { DepartmentService } from 'app/services/department.service';
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
export class HomeCreateChatbotComponent implements OnInit, OnChanges {
  @Input() use_case_for_child: string;
  @Input() solution_channel_for_child: string;
  @Input() waBotId: string;
  @Input() wadepartmentName: string;
  @Input() chatbotConnectedWithWA: string;
  private unsubscribe$: Subject<any> = new Subject<any>();
  projectId: string;
  UPLOAD_ENGINE_IS_FIREBASE: boolean;
  storageBucket: string;
  baseUrl: string;
  chatbots: any;
  countOfChatbots: number;
  numOfChabotNotDiplayed: number;
  USER_ROLE: string;
  tparams:any; 
  displayDefaultDescription = false
  constructor(
    public appConfigService: AppConfigService,
    public auth: AuthService,
    private logger: LoggerService,
    private router: Router,
    private faqKbService: FaqKbService,
    private usersService: UsersService,
    private departmentService: DepartmentService,
  ) { }

  ngOnInit(): void {
    // this.getCurrentProjectAndPrjctBots();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('[HOME-CREATE-CHATBOT] - ngOnChanges waBotId  ', this.waBotId)
    console.log('[HOME-CREATE-CHATBOT] - ngOnChanges wadepartmentName  ', this.wadepartmentName)
    console.log('[HOME-CREATE-CHATBOT] - ngOnChanges chatbotConnectedWithWA  ', this.chatbotConnectedWithWA)
    
    
    console.log('[HOME-CREATE-CHATBOT] - ngOnChanges fires!  changes ', changes)
    console.log('[HOME-CREATE-CHATBOT] - USER PREFERENCES USE CASE »»» ', this.use_case_for_child)
    console.log('[HOME-CREATE-CHATBOT] - USER PREFERENCES SOLUTION CHANNEL »»» ', this.solution_channel_for_child)
    if (this.use_case_for_child === 'solve_customer_problems') {
      this.tparams = {template_category: 'Customer Satisfaction'} 
    } else if (this.use_case_for_child === 'increase_online_sales') { 
      this.tparams = {template_category: 'Increase Sales'} 
    } else if (this.use_case_for_child === undefined) {
      console.log('[HOME-CREATE-CHATBOT] - USER PREFERENCES USE CASE »»» is undefined', this.use_case_for_child)
      this.displayDefaultDescription = true
    }

    this.getCurrentProjectAndPrjctBots();
  }

  getUserRole() {
    this.usersService.project_user_role_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((userRole) => {

        this.logger.log('[HOME-CREATE-CHATBOT] - SUBSCRIPTION TO USER ROLE »»» ', userRole)
        // used to display / hide 'WIDGET' and 'ANALITCS' in home.component.html
        this.USER_ROLE = userRole;
      })
  }

  getCurrentProjectAndPrjctBots() {
    this.auth.project_bs
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe((project) => {
        console.log('[HOME-CREATE-CHATBOT] $UBSCIBE TO PUBLISHED PROJECT - RES  ', project)

        if (project) {

          this.projectId = project._id

          this.getImageStorageThenBots();
        }
      }, (error) => {
        this.logger.error('[HOME-CREATE-CHATBOT] $UBSCIBE TO PUBLISHED PROJECT - ERROR ', error);

      }, () => {
        this.logger.log('[HOME-CREATE-CHATBOT] $UBSCIBE TO PUBLISHED PROJECT * COMPLETE *');
      });
  }

  getImageStorageThenBots() {
    if (this.appConfigService.getConfig().uploadEngine === 'firebase') {

      this.UPLOAD_ENGINE_IS_FIREBASE = true;
      const firebase_conf = this.appConfigService.getConfig().firebase;
      this.storageBucket = firebase_conf['storageBucket'];
      this.logger.log('[HOME-CREATE-CHATBOT] - IMAGE STORAGE ', this.storageBucket, 'usecase firebase')

      // this.getAllUsersOfCurrentProject(this.storageBucket, this.UPLOAD_ENGINE_IS_FIREBASE)  // USED TO DISPLAY THE HUMAN AGENT FOR THE NEW HOME-CREATE-CHATBOT-CREATE-CHATBOT-CREATE-CHATBOT
      this.getProjectBots(this.storageBucket, this.UPLOAD_ENGINE_IS_FIREBASE) // USED FOR COUNT OF BOTS FOR THE NEW HOME-CREATE-CHATBOT-CREATE-CHATBOT-CREATE-CHATBOT

    } else {

      this.UPLOAD_ENGINE_IS_FIREBASE = false;
      this.baseUrl = this.appConfigService.getConfig().baseImageUrl;
      this.logger.log('[HOME-CREATE-CHATBOT] - IMAGE STORAGE ', this.baseUrl, 'usecase native')
      // this.getAllUsersOfCurrentProject(this.baseUrl, this.UPLOAD_ENGINE_IS_FIREBASE)  // USED TO DISPLAY THE HUMAN AGENT FOR THE NEW HOME-CREATE-CHATBOT-CREATE-CHATBOT-CREATE-CHATBOT
      this.getProjectBots(this.baseUrl, this.UPLOAD_ENGINE_IS_FIREBASE) // USED FOR COUNT OF BOTS FOR THE NEW HOME-CREATE-CHATBOT-CREATE-CHATBOT-CREATE-CHATBOT
    }

  }


  getProjectBots(storage, uploadEngineIsFirebase) {
    this.faqKbService.getFaqKbByProjectId().subscribe((faqKb: any) => {
      console.log('[HOME-CREATE-CHATBOT] - GET FAQKB RES', faqKb);

      
      
        this.departmentService.getDeptsByProjectId().subscribe((depts: any) => { 

          console.log('[HOME-CREATE-CHATBOT] - GET DEPTS RES', depts);
          if (depts) {
            for (let i = 0; i < depts.length; i++) {
              console.log('[HOME-CREATE-CHATBOT] - GET DEPTS RES depts[i]', depts[i]);
              if (faqKb) {
                for (let j = 0; j < faqKb.length; j++) { 
                  console.log('[HOME-CREATE-CHATBOT] - GET DEPTS RES faqKb[j]', faqKb[j]);

                  if (depts[i].hasBot === true) {
                    console.log('[HOME-CREATE-CHATBOT] - HERE YES (depts[i].hasBot)');
                    if (depts[i].id_bot ===  faqKb[j]._id) {
                      console.log('[HOME-CREATE-CHATBOT] - Dept',faqKb[i].name ,' has bot with id ', faqKb[j]._id);
                      faqKb[j]['deptName'] = depts[i].name
                    }
                  } 
                }
              }
            }
          }
        }) 
      
      
      if (faqKb) {
        // -----------------------------------------------------------
        // CHECK IF USER HAS IMAGE (AFTER REMOVING THE "IDENTITY BOT")
        // -----------------------------------------------------------
        faqKb.forEach(bot => {
          console.log('[HOME-CREATE-CHATBOT] - GET FAQKB forEach bot: ', bot)
          console.log('[HOME-CREATE-CHATBOT] - GET FAQKB forEach waBotId: ', this.waBotId)
          if (bot._id === this.waBotId) {
            bot.isConnectToWA = true
          } else {
            bot.isConnectToWA = false
          }

          // if (bot && bot['type'] === "identity") {

          //   const index = faqKb.indexOf(bot);
          //   console.log('[HOME-CREATE-CHATBOT] - GET FAQKB INDEX OF IDENTITY BOT', index);
          //   if (index > -1) {
          //     faqKb.splice(index, 1);
          //   }
          // }
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

        this.countOfChatbots = faqKb.length;
        console.log('[HOME-CREATE-CHATBOT] - COUNT OF CHATBOTS', this.countOfChatbots);
        if (this.countOfChatbots > 10) {
          this.numOfChabotNotDiplayed = this.countOfChatbots - 10;
          console.log('[HOME-CREATE-CHATBOT] - NUM OF CHATBOTS NOT DISLAYED', this.numOfChabotNotDiplayed);
        }

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
    if (this.use_case_for_child === 'solve_customer_problems') {
    this.router.navigate(['project/' + this.projectId + '/bots/templates/customer-satisfaction']);
    } else if (this.use_case_for_child === 'increase_online_sales') {
      this.router.navigate(['project/' + this.projectId + '/bots/templates/increase-sales']);
    } else if (this.use_case_for_child === undefined) {
      this.router.navigate(['project/' + this.projectId + '/bots/templates/all']);
    } 
  }

  goToCommunityTemplates() {
    this.router.navigate(['project/' + this.projectId + '/bots/templates/community']);
  }

  goToAddBotFromScratch() {
    this.router.navigate(['project/' + this.projectId + '/bots/create/tilebot/blank']);
  }

  goToMyChatbots() {
    this.router.navigate(['project/' + this.projectId + '/bots/my-chatbots/all']);
  }


}
