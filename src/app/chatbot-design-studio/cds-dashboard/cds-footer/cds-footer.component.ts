import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Intent } from 'app/models/intent-model';

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

  constructor() { }

  ngOnInit(): void {
    this.showSpinner = false;
    console.log("[CDS-FOOTER] intentSelected: ", this.intentSelected)
    try {
      this.intentName = this.intentSelected.intent_display_name;
    } catch (error) {
      console.log('intent selected ', error);
    }
  }

  ngOnChanges() {
    console.log("[CDS-FOOTER] header OnChanges intentSelected: ", this.intentSelected)
    console.log("[CDS-FOOTER] header OnChanges newIntentName: ", this.newIntentName)

    console.log("[CDS-FOOTER] header OnChanges intentSelected intent_display_name: ", this.intentSelected.intent_display_name)
    console.log("[CDS-FOOTER] header OnChanges listOfIntents: ", this.listOfIntents)

    // const untitledIntents = this.listOfIntents.filter((el) => {
    //   return el.intent_display_name.indexOf('untitled_intent') > -1;
    // });

    // console.log("[CDS-FOOTER] OnChanges untitledIntents: ", untitledIntents)
    // if (this.intentSelected.intent_display_name === undefined && untitledIntents.length === 0) {
    //   this.intentSelected.intent_display_name = 'untitled_intent_1';
    //   this.saveIntent.emit(this.intentSelected);
    //   // this.listOfIntents.push(this.intentSelected) 
    // } else if (this.intentSelected.intent_display_name === undefined && untitledIntents.length > 0) {
    //   let lastUntitledIntent = untitledIntents[untitledIntents.length - 1].intent_display_name
    //   console.log("[CDS-FOOTER] OnChanges lastUntitledIntent: ", lastUntitledIntent)
     
    //   const lastUntitledIntentSegment =  lastUntitledIntent.split("_")
    //   console.log("[CDS-FOOTER] OnChanges lastUntitledIntentSegment: ", lastUntitledIntentSegment)
    //   const lastUntitledIntentNumb = +lastUntitledIntentSegment[2]
    //   console.log("[CDS-FOOTER] OnChanges lastUntitledIntentNumb: ", lastUntitledIntentNumb)
    //   const nextUntitledIntentNumb = lastUntitledIntentNumb + 1
    //   console.log("[CDS-FOOTER] OnChanges nextUntitledIntentNumb: ", nextUntitledIntentNumb)
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
    //   console.log('[CDS-FOOTER] intent selected ', error);
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
    console.log('[CDS-FOOTER] onChangeIntentName name', name);
    console.log('[CDS-FOOTER] onChangeIntentName this.intentSelected.intent_display_name ', this.intentSelected.intent_display_name);
    if (name !== this.intentSelected.intent_display_name) {
      this.intentNameAlreadyExist = this.listOfIntents.some((el) => {
        return el.intent_display_name === name
      });
    }

    this.intentNameNotHasSpecialCharacters = this.checkIntentNameMachRegex(name)
    console.log('[CDS-FOOTER] checkIntentNameMachRegex intentNameNotHasSpecialCharacters ', this.intentNameNotHasSpecialCharacters);

    console.log('[CDS-FOOTER] intent name already exist', this.intentNameAlreadyExist);
    this.intentNameResult = this.checkIntentName();
    console.log('[CDS-FOOTER] this.intentNameResult ', this.intentNameResult)
  }

  /** */
  onBlurIntentName(name: string) {
    this.intentNameResult = true;
  }

  /** */
  onSaveIntent() {
    console.log('[CDS-FOOTER] this.intentName ', this.intentName)
    console.log('[CDS-FOOTER] intentNameResult ', this.intentNameResult)
    console.log('[CDS-FOOTER] intentNameAlreadyExist ', this.intentNameAlreadyExist)
    console.log('[CDS-FOOTER] intentNameNotHasSpecialCharacters ', this.intentNameNotHasSpecialCharacters)
    this.intentNameResult = this.checkIntentName();
    if (this.intentNameResult && !this.intentNameAlreadyExist && this.intentNameNotHasSpecialCharacters === true) {
      this.intentSelected.intent_display_name = this.intentName;
      this.saveIntent.emit(this.intentSelected);
    }
  }

  toggleIntentWebhook(event) {
    console.log('[CDS-FOOTER] toggleWebhook ', event.checked);
    this.intentSelected.webhook_enabled = event.checked
  }

}
