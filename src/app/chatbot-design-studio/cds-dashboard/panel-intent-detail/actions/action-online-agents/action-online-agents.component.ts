import { ActionOnlineAgent } from './../../../../../models/intent-model';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'cds-action-online-agents',
  templateUrl: './action-online-agents.component.html',
  styleUrls: ['./action-online-agents.component.scss']
})
export class ActionOnlineAgentsComponent implements OnInit {

  @Input() listOfActions: Array<{name: string, value: string, icon?:string}>;
  @Input() action: ActionOnlineAgent;

  actionOnlineAgentsFormGroup: FormGroup
  trueIntentAttributes: string = "";
  falseIntentAttributes: string = "";

  constructor(
    private formBuilder: FormBuilder,
    private logger: LoggerService,
  ) { }

  ngOnInit(): void {
  }
  

  ngOnChanges() {
    this.initialize()
    if (this.action && this.action.trueIntent) {
      this.setFormValue();
    }
  }

  private initialize() {
    this.actionOnlineAgentsFormGroup = this.buildForm();
    this.actionOnlineAgentsFormGroup.valueChanges.subscribe(form => {
      this.logger.log('[ACTION-ONLINE-AGENT] form valueChanges-->', form)
      if (form && (form.trueIntent !== ''))
        this.action = Object.assign(this.action, this.actionOnlineAgentsFormGroup.value);
    })
    this.trueIntentAttributes = this.action.trueIntentAttributes;
    this.falseIntentAttributes = this.action.falseIntentAttributes;
  }


  buildForm(): FormGroup {
    return this.formBuilder.group({
      trueIntent: ['', Validators.required],
      falseIntent: ['', Validators.required]
    })
  }

  setFormValue() {
    this.actionOnlineAgentsFormGroup.patchValue({
      trueIntent: this.action.trueIntent,
      falseIntent: this.action.falseIntent
    })
  }

  onChangeSelect(event:{name: string, value: string}, type){
    this.action[type]=event.value
  }


  onChangeAttributesTrue(attributes:any){
    this.action.trueIntentAttributes = attributes;
  }

  onChangeAttributesFalse(attributes:any){
    this.action.falseIntentAttributes = attributes;
  }

  /** */
  onStopConditionMeet() {
    try {
      this.action.stopOnConditionMet = !this.action.stopOnConditionMet;
    } catch (error) {
      this.logger.log("Error: ", error);
    }
  }
  
}
