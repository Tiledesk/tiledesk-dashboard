import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActionIntentConnected } from 'app/models/intent-model';
import { Component, OnInit, Input } from '@angular/core';
import { TEXT_CHARS_LIMIT } from './../../../../utils';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'cds-action-intent',
  templateUrl: './action-intent.component.html',
  styleUrls: ['./action-intent.component.scss']
})
export class ActionIntentComponent implements OnInit {

  //@Input() intents: Array<any>;
  @Input() intents: Array<{name: string, value: string}>;
  @Input() action: ActionIntentConnected;

  actionIntentFormGroup: FormGroup;

  //filtered_intents = []; 
  //limitCharsText = TEXT_CHARS_LIMIT;

  // to delete
  //buttonAction: any;

  constructor(
    private formBuilder: FormBuilder,
    private logger: LoggerService,
    
    ) { }

  ngOnInit(): void {
    //this.logger.log("[ACTION-INTENT] intents: ", this.intents)
    //this.filtered_intents = this.intents;
    this.logger.log("[ACTION-INTENT] elementSelected: ", this.action)
  }

  ngOnChanges() {
    this.initialize();
    if(this.action && this.action.intentName) {
      this.setFormValue()
    }
  }

  private initialize() {
    this.actionIntentFormGroup = this.buildForm();
    this.actionIntentFormGroup.valueChanges.subscribe(form => {
      this.logger.log('[ACTION-INTENT] form valueChanges-->', form)
      if (form && (form.intentName !== '')) {
        this.action = Object.assign(this.action, this.actionIntentFormGroup.value)
      }
    })
  }

  buildForm(): FormGroup {
    return this.formBuilder.group({
      intentName: ['', Validators.required]
      //json_paylaod: ['', Validators.required]
    })
  }

  setFormValue() {
    this.actionIntentFormGroup.patchValue({
      intentName: this.action.intentName
      //json_paylaod: this.action.json_payload
    })
  }

  // onKey(event) {
  //   this.logger.log("[ACTION-INTENT] onKey event: ", event);
  //   this.filtered_intents = this.intents;
  //   this.filtered_intents = this.filtered_intents.filter(intent => intent.toLowerCase().includes(event.toLowerCase()));
  // }

  onChangeSelect(event: {name: string, value: string}){
    this.action.intentName = event.value
    if(!this.action._tdActionTitle){
      this.action._tdActionTitle = this.intents.find(intent => intent.value === event.value).name
    }
  }

  // onTextChange(event) {
  //   this.logger.log("[ACTION-INTENT] onTextChange event: ", event);
  //   this.action.intentName = event;
  // }



}
