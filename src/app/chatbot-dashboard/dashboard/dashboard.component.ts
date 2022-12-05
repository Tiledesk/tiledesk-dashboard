import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { FaqService } from '../../services/faq.service';
import { Project } from '../../models/project-model';
import { AuthService } from '../../core/auth.service';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '../../services/logger/logger.service';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { HttpClient } from "@angular/common/http";



import { Intent, Answer, Button } from '../../models/intent-model';

const swal = require('sweetalert');


@Component({
  selector: 'appdashboard-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  arrayIntent: Array<Intent> = [];
  intentSelected: Intent;
  arrayResponses: Array<Answer> = [];


  buttonSelected: Button;
  arrayActions: Array<string> = [];
  openCardButton = false;

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
    this.MOCK_getFaqById();

    // if (this.router.url.indexOf('/createfaq') !== -1) {
    //   console.log('[FAQ-EDIT-ADD] HAS CLICKED CREATE ');
    //   this.CREATE_VIEW = true;
    //   this.showSpinner = false;
    //   this.getFaqKbId();
    // } else {
    //   console.log('[FAQ-EDIT-ADD] HAS CLICKED EDIT ');
    //   this.EDIT_VIEW = true;
    //   if (this.id_faq) {
    //     this.getFaqById();
    //     this.MOCK_getFaqById();
    //   }
    // }
    this.getCurrentProject();
    this.getBrowserVersion();
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


  /** */
  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project;
    });
  }


  
  /**
   * !!! this function is temporary and will be replaced with a server function 
   */
   MOCK_getFaqById(){
    let url = 'assets/mock-data/tilebot/faq/intents.json';
    this.httpClient.get<Intent[]>(url).subscribe(data => {
      this.arrayIntent = data;
      this.intentSelected = this.arrayIntent[7];
      console.log('MOCK_getFaqById::: ', this.arrayIntent);
    }); 
  }




  // EVENTS //

  /** */
  goBack() {
    this.location.back();
  }

  onSaveButton(button){ 
    console.log('onSaveButton');
    this.openCardButton = false;
  }

  onOpenButtonPanel(event){
    console.log('onOpenButtonPanel::: ', event);
    if(this.openCardButton === true){
      this.onCloseButtonPanel();
    }
    this.buttonSelected = event;
    this.openCardButton = true;
  }

  onCloseButtonPanel(){
    this.openCardButton = false;
  }

}




 