import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Action, ActionIntentConnected } from 'app/models/intent-model';
import { Component, OnInit, Input } from '@angular/core';
import { TEXT_CHARS_LIMIT } from 'app/chatbot-design-studio/utils';
import { LoggerService } from 'app/services/logger/logger.service';
import {
  CdkDragHandle,
  CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'cds-action-intent',
  templateUrl: './cds-action-intent.component.html',
  styleUrls: ['./cds-action-intent.component.scss']
})
export class CdsActionIntentComponent implements OnInit {

  @Input() IDintentSelected: string;
  @Input() action: ActionIntentConnected;

  // @Input() intents: Array<{name: string, value: string}>;
  actionIntentFormGroup: FormGroup;
  idAction: string;

  constructor(
    private formBuilder: FormBuilder,
    private logger: LoggerService,
    ) { }

  ngOnInit(): void {
    console.log("[ACTION-INTENT] elementSelected: ", this.action)
  }

  ngOnChanges() {
    this.initialize();
    if(this.action && this.action.intentName) {
      this.setFormValue()
    }
  }

  private initialize() {
    this.idAction = this.IDintentSelected+'/'+this.action._tdActionId;

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
      // this.action._tdActionTitle = this.intents.find(intent => intent.value === event.value).name
    }
  }

  // onTextChange(event) {
  //   this.logger.log("[ACTION-INTENT] onTextChange event: ", event);
  //   this.action.intentName = event;
  // }



}
