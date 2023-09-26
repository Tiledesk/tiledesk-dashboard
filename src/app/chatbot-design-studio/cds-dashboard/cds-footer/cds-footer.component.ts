import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Intent } from 'app/models/intent-model';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'cds-footer',
  templateUrl: './cds-footer.component.html',
  styleUrls: ['./cds-footer.component.scss']
})
export class CdsFooterComponent implements OnInit {
  @Output() saveIntent = new EventEmitter();
  @Input() intentSelected: Intent;
  @Input() showSpinner: boolean;
  @Input() listOfIntents: Intent[];
  @Input() newIntentName: string;

  intentName: string;
  intentNameResult: boolean = true;
  intentNameAlreadyExist: boolean = false
  intentNameNotHasSpecialCharacters: boolean = true;
  id_faq_kb: string;

  constructor(
    private logger: LoggerService,
  ) { }

  ngOnInit(): void {
    this.showSpinner = false;
    this.logger.log("[CDS-FOOTER] intentSelected: ", this.intentSelected)
    try {
      this.intentName = this.intentSelected.intent_display_name;
    } catch (error) {
      this.logger.log('intent selected ', error);
    }
  }

  ngOnChanges() {
    this.logger.log("[CDS-FOOTER] header OnChanges intentSelected: ", this.intentSelected)
    this.logger.log("[CDS-FOOTER] header OnChanges newIntentName: ", this.newIntentName)

    this.logger.log("[CDS-FOOTER] header OnChanges intentSelected intent_display_name: ", this.intentSelected.intent_display_name)
    this.logger.log("[CDS-FOOTER] header OnChanges listOfIntents: ", this.listOfIntents)

    // const untitledIntents = this.listOfIntents.filter((el) => {
    //   return el.intent_display_name.indexOf('untitled_intent') > -1;
    // });

    // this.logger.log("[CDS-FOOTER] OnChanges untitledIntents: ", untitledIntents)
    // if (this.intentSelected.intent_display_name === undefined && untitledIntents.length === 0) {
    //   this.intentSelected.intent_display_name = 'untitled_intent_1';
    //   this.saveIntent.emit(this.intentSelected);
    //   // this.listOfIntents.push(this.intentSelected) 
    // } else if (this.intentSelected.intent_display_name === undefined && untitledIntents.length > 0) {
    //   let lastUntitledIntent = untitledIntents[untitledIntents.length - 1].intent_display_name
    //   this.logger.log("[CDS-FOOTER] OnChanges lastUntitledIntent: ", lastUntitledIntent)
     
    //   const lastUntitledIntentSegment =  lastUntitledIntent.split("_")
    //   this.logger.log("[CDS-FOOTER] OnChanges lastUntitledIntentSegment: ", lastUntitledIntentSegment)
    //   const lastUntitledIntentNumb = +lastUntitledIntentSegment[2]
    //   this.logger.log("[CDS-FOOTER] OnChanges lastUntitledIntentNumb: ", lastUntitledIntentNumb)
    //   const nextUntitledIntentNumb = lastUntitledIntentNumb + 1
    //   this.logger.log("[CDS-FOOTER] OnChanges nextUntitledIntentNumb: ", nextUntitledIntentNumb)
    //   this.intentSelected.intent_display_name = 'untitled_intent_'+ nextUntitledIntentNumb;
    //   this.saveIntent.emit(this.intentSelected);
     
    // }


    // this.intentName = this.intentSelected.intent_display_name;
    this.intentName = this.newIntentName
    this.onChangeIntentName(this.intentName) 
    this.showSpinner = false;
    this.intentNameAlreadyExist = false;
    this.intentNameNotHasSpecialCharacters = true;

    if (this.intentSelected && this.intentSelected['faq_kb']) {
      this.id_faq_kb = this.intentSelected['faq_kb'][0]._id;
    }
    // try {
    //   this.intentName = this.intentSelected.intent_display_name;
    // } catch (error) {
    //   this.logger.log('[CDS-FOOTER] intent selected ', error);
    // }
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
  onChangeIntentName(name: string) {
    this.logger.log('[CDS-FOOTER] onChangeIntentName name', name);
    this.logger.log('[CDS-FOOTER] onChangeIntentName this.intentSelected.intent_display_name ', this.intentSelected.intent_display_name);
    if (name !== this.intentSelected.intent_display_name) {
      this.intentNameAlreadyExist = this.listOfIntents.some((el) => {
        return el.intent_display_name === name
      });
    }

    this.intentNameNotHasSpecialCharacters = this.checkIntentNameMachRegex(name)
    this.logger.log('[CDS-FOOTER] checkIntentNameMachRegex intentNameNotHasSpecialCharacters ', this.intentNameNotHasSpecialCharacters);

    this.logger.log('[CDS-FOOTER] intent name already exist', this.intentNameAlreadyExist);
    this.intentNameResult = this.checkIntentName();
    this.logger.log('[CDS-FOOTER] this.intentNameResult ', this.intentNameResult)
  }

  /** */
  onBlurIntentName(name: string) {
    this.intentNameResult = true;
  }

  /** */
  onSaveIntent() {
    this.logger.log('[CDS-FOOTER] this.intentName ', this.intentName)
    this.logger.log('[CDS-FOOTER] intentNameResult ', this.intentNameResult)
    this.logger.log('[CDS-FOOTER] intentNameAlreadyExist ', this.intentNameAlreadyExist)
    this.logger.log('[CDS-FOOTER] intentNameNotHasSpecialCharacters ', this.intentNameNotHasSpecialCharacters)
    this.intentNameResult = this.checkIntentName();
    if (this.intentNameResult && !this.intentNameAlreadyExist && this.intentNameNotHasSpecialCharacters === true) {
      this.intentSelected.intent_display_name = this.intentName;
      this.saveIntent.emit(this.intentSelected);
    }
  }

  toggleIntentWebhook(event) {
    this.logger.log('[CDS-FOOTER] toggleWebhook ', event.checked);
    this.intentSelected.webhook_enabled = event.checked
  }

}
