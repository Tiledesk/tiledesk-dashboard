import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';


import { Intent } from '../../../models/intent-model';

@Component({
  selector: 'appdashboard-panel-intent-header',
  templateUrl: './panel-intent-header.component.html',
  styleUrls: ['./panel-intent-header.component.scss']
})
export class PanelIntentHeaderComponent implements OnInit, OnChanges {
  @Output() saveIntent = new EventEmitter();
  @Input() intentSelected: Intent;
  @Input() showSpinner: boolean;
  @Input() listOfIntents: Intent[];

  intentName: string;
  intentNameResult = true;
  intentNameAlreadyExist = false
  intentNameNotHasSpecialCharacters: boolean;
 
  id_faq_kb: string;


  constructor() { }

  // SYSTEM FUNCTIONS //
  ngOnInit(): void {
    this.showSpinner = false;
    console.log("header --> intentSelected: ", this.intentSelected)
    try {
      this.intentName = this.intentSelected.intent_display_name;
    } catch (error) {
      console.log('intent selected ', error);
    }

    // this.getCurrentProject();
    // this.getDeptsByProjectId();
    // this.getTestSiteUrl();
  }

  ngOnChanges() {
    this.showSpinner = false;
    console.log("[PANEL-INTENT-HEADER] header --> intentSelected: ", this.intentSelected)
    console.log("[PANEL-INTENT-HEADER] header --> listOfIntents: ", this.listOfIntents)
    if (this.intentSelected && this.intentSelected['faq_kb']) {
      this.id_faq_kb = this.intentSelected['faq_kb'][0]._id;
    }
    try {
      this.intentName = this.intentSelected.intent_display_name;
    } catch (error) {
      console.log('[PANEL-INTENT-HEADER] intent selected ', error);
    }
  }

  // CUSTOM FUNCTIONS //
  /** /^[ _0-9a-zA-Z]+$/ */
  private checkIntentName(): boolean {
    if (!this.intentName || this.intentName.length === 0) {
      return false;
    } else {
      return true;
    }
  }
  checkIntentNameMachRegex(intentname) {

    const regex = /^[ _0-9a-zA-Z]+$/

    
    return regex.test(intentname);
  }


  // EVENT FUNCTIONS //
  /** */
  onChangeIntentName(name: string) {
    console.log('[PANEL-INTENT-HEADER] onChangeIntentName', name);
    this.intentNameAlreadyExist = this.listOfIntents.some((el) => {
      return el.intent_display_name === name
    });

   this.intentNameNotHasSpecialCharacters = this.checkIntentNameMachRegex(name) 
   console.log('[PANEL-INTENT-HEADER] checkIntentNameMachRegex intentNameNotHasSpecialCharacters ', this.intentNameNotHasSpecialCharacters);

    console.log('[PANEL-INTENT-HEADER] intent name already exist', this.intentNameAlreadyExist);
    this.intentNameResult = this.checkIntentName();
    console.log('[PANEL-INTENT-HEADER] this.intentNameResult ', this.intentNameResult) 
    // name.toString();
    // try {
    //   this.intentName = name.replace(/[^A-Z0-9_]+/ig, "");
    // } catch (error) {
    //   console.log('name is not a string', error);
    // }
  }

  /** */
  onBlurIntentName(name: string) {
    this.intentNameResult = true;
  }

  /**  && this.intentNameNotHasSpecialCharacters === true*/
  onSaveIntent() {
    this.intentNameResult = this.checkIntentName();
    if (this.intentNameResult && !this.intentNameAlreadyExist) {
      this.intentSelected.intent_display_name = this.intentName;
      this.saveIntent.emit(this.intentSelected);
    }
  }

  toggleIntentWebhook($event) {
    console.log('[PANEL-INTENT-HEADER] toggleWebhook ', $event.target.checked);
    this.intentSelected.webhook_enabled = $event.target.checked
  }
  // getCurrentProject() {
  //   this.auth.project_bs.subscribe((project) => {
  //     this.project = project;
  //     console.log('[PANEL-INTENT-HEADER] project from AUTH service subscription  ', this.project)
  //   });
  // }

  // getDeptsByProjectId() {
  //   this.departmentService.getDeptsByProjectId().subscribe((departments: any) => {
  //     console.log('[PANEL-INTENT-HEADER] - DEPT GET DEPTS ', departments);
  //     console.log('[PANEL-INTENT-HEADER] - DEPT BOT ID ', this.id_faq_kb);

  //     if (departments) {
  //       departments.forEach((dept: any) => {
  //         // console.log('[PANEL-INTENT-HEADER] - DEPT', dept);

  //         if (dept.default === true) {
  //           this.defaultDepartmentId = dept._id;
  //           console.log('[PANEL-INTENT-HEADER] - DEFAULT DEPT ID ', this.defaultDepartmentId);
  //         }

  //       })
  //     }
  //   }, error => {

  //     console.error('[PANEL-INTENT-HEADER] - DEPT - GET DEPTS  - ERROR', error);
  //   }, () => {
  //     console.log('[PANEL-INTENT-HEADER] - DEPT - GET DEPTS - COMPLETE')

  //   });
  // }

  // getTestSiteUrl() {
  //   this.TESTSITE_BASE_URL = this.appConfigService.getConfig().testsiteBaseUrl;
  //   console.log('[PANEL-INTENT-HEADER] AppConfigService getAppConfig TESTSITE_BASE_URL', this.TESTSITE_BASE_URL);
  // }

  // openTestSiteInPopupWindow() {

  //   const testItOutBaseUrl = this.TESTSITE_BASE_URL.substring(0, this.TESTSITE_BASE_URL.lastIndexOf('/'));
  //   const testItOutUrl = testItOutBaseUrl + '/chatbot-panel.html'

  //   const url = testItOutUrl + '?tiledesk_projectid=' + this.project._id + '&tiledesk_participants=bot_' + this.id_faq_kb + "&tiledesk_departmentID=" + this.defaultDepartmentId

  //   let params = `toolbar=no,menubar=no,width=815,height=727,left=100,top=100`;
  //   window.open(url, '_blank', params);
  // }

}
