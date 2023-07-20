import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { IntentService } from 'app/chatbot-design-studio/services/intent.service';
import { ActionOnlineAgent, Intent } from 'app/models/intent-model';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'cds-action-online-agents',
  templateUrl: './cds-action-online-agents.component.html',
  styleUrls: ['./cds-action-online-agents.component.scss']
})
export class CdsActionOnlineAgentsComponent implements OnInit {

  // @Input() listOfActions: Array<{name: string, value: string, icon?:string}>;
  @Input() intentSelected: Intent;
  @Input() action: ActionOnlineAgent;
  @Input() previewMode: boolean = true;
  @Output() updateAndSaveAction = new EventEmitter();
  
  actionOnlineAgentsFormGroup: FormGroup
  trueIntentAttributes: string = "";
  falseIntentAttributes: string = "";

  idIntentSelected: string;
  idConnectorTrue: string;
  idConnectorFalse: string;
  isConnectedTrue: boolean = false;
  isConnectedFalse: boolean = false;
  connector: any;
  
  listOfIntents: Array<{name: string, value: string, icon?:string}>;

  constructor(
    private formBuilder: FormBuilder,
    private logger: LoggerService,
    private intentService: IntentService,
  ) { }

  ngOnInit(): void {
    this.intentService.isChangedConnector$.subscribe((connector: any) => {
      // console.log('CdsActionIntentComponent isChangedConnector-->', connector);
      this.connector = connector;
      this.updateConnector();
    });
    this.initializeConnector();
  }

  private initializeConnector() {
    // this.isConnected = false;
    this.idIntentSelected = this.intentSelected.intent_id;
    this.idConnectorTrue = this.idIntentSelected+'/'+this.action._tdActionId + '/true';
    this.idConnectorFalse = this.idIntentSelected+'/'+this.action._tdActionId + '/false';
    console.log('intentttttt connectorrrr', this.idIntentSelected, this.idConnectorTrue)
  }

  private updateConnector(){
    try {
      const array = this.connector.fromId.split("/");
      const idAction= array[1];
      if(idAction === this.action._tdActionId){
        if(this.connector.deleted){ //TODO: verificare quale dei due connettori è stato eliminato e impostare isConnected a false
          // DELETE 
          // console.log(' deleteConnector :: ', this.connector.id);
          // this.action.intentName = null;
          this.isConnectedTrue = false;
          this.isConnectedFalse = false;
        } else { //TODO: verificare quale dei due connettori è stato aggiunto (controllare il valore della action corrispondente al true/false intent)
          // ADD / EDIT
          console.log(' updateConnector :: onlineagents', this.connector.toId, this.connector.fromId ,this.action, array[array.length-1]);
          if(array[array.length -1] === 'true'){
            this.action.trueIntent = this.connector.toId;
            this.isConnectedTrue = true
          }        
          if(array[array.length -1] === 'false'){
            this.action.falseIntent = this.connector.toId;
            this.isConnectedFalse = true;
          }
        }

        this.updateAndSaveAction.emit();
      }
    } catch (error) {
      console.log('error: ', error);
    }
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
    this.listOfIntents = this.intentService.getListOfIntents()
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
