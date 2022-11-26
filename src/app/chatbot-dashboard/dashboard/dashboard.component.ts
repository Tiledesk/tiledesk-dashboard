import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FaqService } from '../../services/faq.service';
import { Project } from '../../models/project-model';
import { Intent, Message } from '../../models/intent-model';
import { AuthService } from '../../core/auth.service';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '../../services/logger/logger.service';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { HttpClient } from "@angular/common/http";



const swal = require('sweetalert');

@Component({
  selector: 'appdashboard-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  question_toUpdate: string;
  answer_toUpdate: string;
  CREATE_VIEW = false;
  EDIT_VIEW = false;
  showSpinner = true;
  id_faq_kb: string;
  id_faq: string;
  faq_creationDate: any;
  project: Project;
  botType: string;
  intent_name: string;
  faq_webhook_is_enabled: boolean;
  answerWillBeDeletedMsg: string;
  isChromeVerGreaterThan100: boolean;
  intent: Intent;
  message: Message = {};
  commands = [];
  items = ['Carrots', 'Tomatoes', 'Onions', 'Apples', 'Avocados'];
  basket = ['Oranges', 'Bananas', 'Cucumbers'];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private faqService: FaqService,
    private auth: AuthService,
    public location: Location,
    private translate: TranslateService,
    private logger: LoggerService,
    private httpClient: HttpClient
  ) { }

  ngOnInit() {
    this.getTranslations();
    this.auth.checkRoleForCurrentProject();
    this.getUrlParams();
    if (this.router.url.indexOf('/createfaq') !== -1) {
      this.logger.log('[FAQ-EDIT-ADD] HAS CLICKED CREATE ');
      this.CREATE_VIEW = true;
      this.showSpinner = false;
      this.getFaqKbId();
    } else {
      this.logger.log('[FAQ-EDIT-ADD] HAS CLICKED EDIT ');
      this.EDIT_VIEW = true;
      if (this.id_faq) {
        this.getFaqById();
        this.MOCK_getFaqById();
      }
    }
    this.getCurrentProject();
    this.getBrowserVersion()
  }


 

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }


  

  /** */
  getBrowserVersion() {
    this.auth.isChromeVerGreaterThan100.subscribe((isChromeVerGreaterThan100: boolean) => { 
     this.isChromeVerGreaterThan100 = isChromeVerGreaterThan100;
    })
   } 


  // GET FROM ROUTE PARAMS (PASSED FROM FAQ COMPONENT):
  // THE FAQ ID - WHEN THE CALLBACK IS COMPLETED RUN GET-FAQ-BY-ID THAT RETURN THE OBJECT FAQ
  // AND THE FAQ KB ID (THEN USED IN THE GOBACK)
  getUrlParams() {
    this.route.params.subscribe((params) => {
      this.id_faq_kb = params.faqkbid;
      this.id_faq = params.faqid;
      this.botType = params.bottype
      this.logger.log('[FAQ-EDIT-ADD] getUrlParams (FaqEditAddComponent) PARAMS', params);
      this.logger.log('[FAQ-EDIT-ADD] getUrlParams (FaqEditAddComponent) BOT ID ', this.id_faq_kb);
      this.logger.log('[FAQ-EDIT-ADD] getUrlParams (FaqEditAddComponent) FAQ ID ', this.id_faq);
    });
  }

  /** */
  getFaqKbId() {
    this.id_faq_kb = this.route.snapshot.params['faqkbid'];
    this.logger.log('[FAQ-EDIT-ADD] FAQ HAS PASSED id_faq_kb ', this.id_faq_kb);
  }

  /** */
  getTranslations() {
    // this.translateCreateFaqSuccessMsg();
    // this.translateCreateFaqErrorMsg();
    // this.translateUpdateFaqSuccessMsg();
    // this.translateUpdateFaqErrorMsg();
    // this.translateWarningMsg();
    // this.translateAreYouSure();
    // this.translateErrorDeleting();
    // this.translateDone();
    // this.translateErrorOccurredDeletingAnswer();
    // this.translateAnswerSuccessfullyDeleted();
  }

  // TRANSLATION
  // translateCreateFaqSuccessMsg() {
  //   this.translate.get('CreateFaqSuccessNoticationMsg')
  //     .subscribe((text: string) => {
  //       this.createFaqSuccessNoticationMsg = text;
  //     });
  // }

  // // TRANSLATION
  // translateCreateFaqErrorMsg() {
  //   this.translate.get('CreateFaqErrorNoticationMsg')
  //     .subscribe((text: string) => {
  //       this.createFaqErrorNoticationMsg = text;
  //     });
  // }

  // // TRANSLATION
  // translateUpdateFaqSuccessMsg() {
  //   this.translate.get('UpdateFaqSuccessNoticationMsg')
  //     .subscribe((text: string) => {
  //       this.editFaqSuccessNoticationMsg = text;
  //     });
  // }

  // // TRANSLATION
  // translateUpdateFaqErrorMsg() {
  //   this.translate.get('UpdateFaqErrorNoticationMsg')
  //     .subscribe((text: string) => {
  //       this.editFaqErrorNoticationMsg = text;
  //     });
  // }

  // // TRANSLATION
  // translateWarningMsg() {
  //   this.translate.get('Warning').subscribe((text: string) => {
  //     this.warningMsg = text;
  //   });
  // }

  // // TRANSLATION
  // translateAreYouSure() {
  //   this.translate.get('AreYouSure').subscribe((text: string) => {
  //     this.areYouSureMsg = text;
  //   });
  // }

  // // TRANSLATION
  // translateErrorDeleting() {
  //   this.translate.get('ErrorDeleting').subscribe((text: string) => {
  //     this.errorDeleting = text;
  //   });
  // }

  // // TRANSLATION
  // translateDone() {
  //   this.translate.get('Done').subscribe((text: string) => {
  //     this.done_msg = text;
  //   });
  // }

  // // TRANSLATION
  // translateErrorOccurredDeletingAnswer() {
  //   this.translate.get('FaqPage.AnErrorOccurredWhilDeletingTheAnswer').subscribe((text: string) => {
  //     this.errorDeletingAnswerMsg = text;
  //   });
  // }

  // // TRANSLATION
  // translateAnswerSuccessfullyDeleted() {
  //   this.translate.get('FaqPage.AnswerSuccessfullyDeleted').subscribe((text: string) => {
  //     this.answerSuccessfullyDeleted = text;
  //     // this.logger.log('+ + + AnswerSuccessfullyDeleted', this.answerSuccessfullyDeleted)
  //   });
  // }
  // /. end translations

  /** */
  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project;
    });
  }

  /**
  * GET FAQ BY ID (GET THE DATA OF THE FAQ BY THE ID PASSED FROM FAQ LIST)
  * USED TO SHOW IN THE TEXAREA THE QUESTION AND THE ANSWER THAT USER WANT UPDATE
  */
  getFaqById() {
    this.faqService.getFaqById(this.id_faq).subscribe((faq: any) => {
      this.logger.log('[FAQ-EDIT-ADD] - FAQ GET BY ID RES', faq);
      if (faq) {
        this.question_toUpdate = faq.question;
        this.answer_toUpdate = faq.answer;
        this.faq_creationDate = faq.createdAt;
        this.intent_name = faq.intent_display_name;
        this.faq_webhook_is_enabled = faq.webhook_enabled;
        this.logger.log('[FAQ-EDIT-ADD] FAQ QUESTION TO UPDATE', this.question_toUpdate);
        this.logger.log('[FAQ-EDIT-ADD] FAQ ANSWER TO UPDATE', this.answer_toUpdate);
      }
    }, (error) => {
      this.logger.error('[FAQ-EDIT-ADD] - FAQ GET BY ID - ERROR ', error);
      this.showSpinner = false;
    }, () => {
      this.logger.log('[FAQ-EDIT-ADD] - FAQ GET BY ID - COMPLETE ');
      this.showSpinner = false;
      this.translateTheAnswerWillBeDeleted();
    });
  }
  
  /**
   * !!! this function is temporary and will be replaced with a server function 
   */
   MOCK_getFaqById(){
    let url = 'assets/mock-data/tilebot/faq/intent.json';
    this.httpClient.get<Intent>(url).subscribe(data => {
      // console.log("------------------>", data);
      this.intent = data;
      if(this.intent.attributes.commands){
        this.intent.attributes.commands.forEach(command => {

          if(command.type === 'wait' && command.time){
            this.message.waitTime = command.time/1000;
          } else if (command.type === 'message' && command.message){
            try {
              if(!this.message.waitTime || this.message.waitTime == null){
                this.message.waitTime = 0;
              }
              this.message.text = command.message.text;
              this.message.attributes = command.message.attributes;
              this.message.metadata = command.message.metadata;
              this.message.buttons = command.message.attributes.attachment.buttons;
            } catch(e) {
              console.log(e); 
            }
            // if(command.message.text){
            //   console.log("2 1------------------>message: ", this.message);
            //   this.message.text = command['message']['text'];
            // }
            // if(command['message']['attributes']){
            //   console.log("3 ------------------>message: ", this.message);
            //   let attributes = command['message']['attributes'];
            //   this.message.attributes = attributes;
            //   if(attributes['attachment']){
            //     console.log("3 1 ------------------>message: ", this.message);
            //     let attachment = attributes['attachment'];
            //     if(attachment['buttons']){
            //       console.log("3 1 1------------------>message: ", this.message);
            //       this.message.buttons = attachment['buttons'];
            //     }
            //   }
            // }

            // console.log("------------------> message: ", this.message);
            this.commands.push(this.message);
            this.message = {waitTime: 0};
          }
        });
      }
    }); 
  }


  
  /** */
  translateTheAnswerWillBeDeleted() {
    let parameter = { intent_name: this.intent_name };
    this.translate.get('TheAnswerWillBeDeleted', parameter).subscribe((text: string) => {
      this.answerWillBeDeletedMsg = text;
    });
  }

  // EVENTS //

  /** */
  goBack() {
    this.location.back();
  }

}




 