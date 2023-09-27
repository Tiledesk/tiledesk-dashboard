import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';


import { Intent } from '../../../models/intent-model';

@Component({
  selector: 'appdashboard-panel-intent-header',
  templateUrl: './panel-intent-header.component.html',
  styleUrls: ['./panel-intent-header.component.scss']
})
export class PanelIntentHeaderComponent implements OnInit, OnChanges {
  @Output() saveIntent = new EventEmitter();
  // @Output() changeIntentName = new EventEmitter();
  @Input() intentSelected: Intent;
  @Input() showSpinner: boolean;
  @Input() listOfIntents: Intent[];

  intentName: string;
  intentNameResult: boolean = true;
  intentNameAlreadyExist: boolean = false
  intentNameNotHasSpecialCharacters: boolean = true;

  id_faq_kb: string;


  constructor(
    private logger: LoggerService,
  ) { }

  // SYSTEM FUNCTIONS //
  ngOnInit(): void {
    this.showSpinner = false;
    this.logger.log("[PANEL-INTENT-HEADER] intentSelected: ", this.intentSelected)
    try {
      this.intentName = this.intentSelected.intent_display_name;
    } catch (error) {
      this.logger.log('intent selected ', error);
    }
  }

  ngOnChanges() {
    this.logger.log("[PANEL-INTENT-HEADER] header OnChanges intentSelected: ", this.intentSelected)
    this.logger.log("[PANEL-INTENT-HEADER] header OnChanges intentSelected intent_display_name: ", this.intentSelected.intent_display_name)
    this.logger.log("[PANEL-INTENT-HEADER] header OnChanges listOfIntents: ", this.listOfIntents)
    const untitledIntents = this.listOfIntents.filter((el) => {
      return el.intent_display_name.indexOf('untitled_block') > -1;
    });

    this.logger.log("[PANEL-INTENT-HEADER] OnChanges untitledIntents: ", untitledIntents)
    if (this.intentSelected.intent_display_name === undefined && untitledIntents.length === 0) {
      this.intentSelected.intent_display_name = 'untitled_block_1';
      this.saveIntent.emit(this.intentSelected);
      // this.listOfIntents.push(this.intentSelected) 
    } else if (this.intentSelected.intent_display_name === undefined && untitledIntents.length > 0) {
      let lastUntitledIntent = untitledIntents[untitledIntents.length - 1].intent_display_name
      this.logger.log("[PANEL-INTENT-HEADER] OnChanges lastUntitledIntent: ", lastUntitledIntent)
     
      const lastUntitledIntentSegment =  lastUntitledIntent.split("_")
      this.logger.log("[PANEL-INTENT-HEADER] OnChanges lastUntitledIntentSegment: ", lastUntitledIntentSegment)
      const lastUntitledIntentNumb = +lastUntitledIntentSegment[2]
      this.logger.log("[PANEL-INTENT-HEADER] OnChanges lastUntitledIntentNumb: ", lastUntitledIntentNumb)
      const nextUntitledIntentNumb = lastUntitledIntentNumb + 1
      this.logger.log("[PANEL-INTENT-HEADER] OnChanges nextUntitledIntentNumb: ", nextUntitledIntentNumb)
      this.intentSelected.intent_display_name = 'untitled_block_'+ nextUntitledIntentNumb;
      this.saveIntent.emit(this.intentSelected);
      // this.listOfIntents.push(this.intentSelected) 
    }


    this.intentName = this.intentSelected.intent_display_name;
    this.showSpinner = false;
    this.intentNameAlreadyExist = false;
    this.intentNameNotHasSpecialCharacters = true;

    if (this.intentSelected && this.intentSelected['faq_kb']) {
      this.id_faq_kb = this.intentSelected['faq_kb'][0]._id;
    }
    try {
      this.intentName = this.intentSelected.intent_display_name;
    } catch (error) {
      this.logger.log('[PANEL-INTENT-HEADER] intent selected ', error);
    }
  }

  // CUSTOM FUNCTIONS //
  /** /^[ _0-9a-zA-Z]+$/ */
  // private checkIntentName(): boolean {
  //   if (!this.intentName || this.intentName.length === 0) {
  //     return false;
  //   } else {
  //     return true;
  //   }
  // }

  checkIntentNameMachRegex(intentname) {
    const regex = /^[ _0-9a-zA-Z]+$/
    return regex.test(intentname);
  }

  // EVENT FUNCTIONS //
  onChangeIntentName(name: string) {
    this.checkIntentName(name);
  }

  private checkIntentName(name: string){
    if (name !== this.intentSelected.intent_display_name) {
      this.intentNameAlreadyExist = this.listOfIntents.some((el) => {
        return el.intent_display_name === name;
      });
    }
    this.intentNameNotHasSpecialCharacters = this.checkIntentNameMachRegex(name);
    this.intentNameResult = true;
    if (!this.intentName || this.intentName.trim().length === 0) {
      this.intentNameResult = false;
    }
    // console.log('checkIntentName:: ', name);
    // console.log('intentNameNotHasSpecialCharacters:: ', this.intentNameNotHasSpecialCharacters);
    // console.log('intentNameResult:: ', this.intentNameResult);
    // console.log('intentNameAlreadyExist:: ', this.intentNameAlreadyExist);
  }

  /** BLUR EVENT*/
  onBlurIntentName(event) {
    this.checkIntentName(this.intentName);
    this.onSaveIntent();
  }

  /** ENTER KEYBOARD EVENT*/
  onEnterButtonPressed(event){
    this.logger.log('[PANEL-INTENT-HEADER] Intent name: onEnterButtonPressed event', event)
    this.checkIntentName(this.intentName);
    this.onSaveIntent();
    event.target.blur()
  }

  /** */
  onSaveIntent() {
    this.logger.log('[PANEL-INTENT-HEADER] this.intentName ', this.intentName)
    this.logger.log('[PANEL-INTENT-HEADER] intentNameResult ', this.intentNameResult)
    this.logger.log('[PANEL-INTENT-HEADER] intentNameAlreadyExist ', this.intentNameAlreadyExist)
    this.logger.log('[PANEL-INTENT-HEADER] intentNameNotHasSpecialCharacters ', this.intentNameNotHasSpecialCharacters)
    // this.intentNameResult = this.checkIntentName();
    if (this.intentNameResult && !this.intentNameAlreadyExist && this.intentNameNotHasSpecialCharacters === true) {
      this.intentSelected.intent_display_name = this.intentName.trim();
      this.saveIntent.emit(this.intentSelected);
    }
  }

  toggleIntentWebhook(event) {
    this.logger.log('[PANEL-INTENT-HEADER] toggleWebhook ', event.checked);
    this.intentSelected.webhook_enabled = event.checked;
    this.saveIntent.emit(this.intentSelected);
  }
  // getCurrentProject() {
  //   this.auth.project_bs.subscribe((project) => {
  //     this.project = project;
  //     this.logger.log('[PANEL-INTENT-HEADER] project from AUTH service subscription  ', this.project)
  //   });
  // }

  // getDeptsByProjectId() {
  //   this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {
  //     this.logger.log('[PANEL-INTENT-HEADER] - DEPT GET DEPTS ', departments);
  //     this.logger.log('[PANEL-INTENT-HEADER] - DEPT BOT ID ', this.id_faq_kb);

  //     if (departments) {
  //       departments.forEach((dept: any) => {
  //         // this.logger.log('[PANEL-INTENT-HEADER] - DEPT', dept);

  //         if (dept.default === true) {
  //           this.defaultDepartmentId = dept._id;
  //           this.logger.log('[PANEL-INTENT-HEADER] - DEFAULT DEPT ID ', this.defaultDepartmentId);
  //         }

  //       })
  //     }
  //   }, error => {

  //     this.logger.error('[PANEL-INTENT-HEADER] - DEPT - GET DEPTS  - ERROR', error);
  //   }, () => {
  //     this.logger.log('[PANEL-INTENT-HEADER] - DEPT - GET DEPTS - COMPLETE')

  //   });
  // }

  // getTestSiteUrl() {
  //   this.TESTSITE_BASE_URL = this.appConfigService.getConfig().WIDGET_BASE_URL + 'assets/twp/index.html';
  //   this.logger.log('[PANEL-INTENT-HEADER] AppConfigService getAppConfig TESTSITE_BASE_URL', this.TESTSITE_BASE_URL);
  // }

  // openTestSiteInPopupWindow() {

  //   const testItOutBaseUrl = this.TESTSITE_BASE_URL.substring(0, this.TESTSITE_BASE_URL.lastIndexOf('/'));
  //   const testItOutUrl = testItOutBaseUrl + '/chatbot-panel.html'

  //   const url = testItOutUrl + '?tiledesk_projectid=' + this.project._id + '&tiledesk_participants=bot_' + this.id_faq_kb + "&tiledesk_departmentID=" + this.defaultDepartmentId

  //   let params = `toolbar=no,menubar=no,width=815,height=727,left=100,top=100`;
  //   window.open(url, '_blank', params);
  // }

  

}
