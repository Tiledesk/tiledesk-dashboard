import { OPERATORS_LIST, OperatorValidator } from '../../../../../utils';
import { Expression, Operator, Condition, Intent } from '../../../../../../models/intent-model';
import { ActionJsonCondition } from '../../../../../../models/intent-model';
import { Component, EventEmitter, Host, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { SatPopover } from '@ncstate/sat-popover';
import { LoggerService } from 'app/services/logger/logger.service';
import { IntentService } from 'app/chatbot-design-studio/services/intent.service';
import { ConnectorService } from 'app/chatbot-design-studio/services/connector.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'cds-action-json-condition',
  templateUrl: './cds-action-json-condition.component.html',
  styleUrls: ['./cds-action-json-condition.component.scss']
})
export class CdsActionJsonConditionComponent implements OnInit {

  @ViewChild("addFilter", {static: false}) myPopover : SatPopover;
  
  @Input() intentSelected: Intent;
  @Input() action: ActionJsonCondition;
  @Input() previewMode: boolean = true;
  @Output() updateIntentFromConnectorModification = new EventEmitter();
  @Output() updateAndSaveAction = new EventEmitter();
  @Output() onConnectorChange = new EventEmitter<{type: 'create' | 'delete',  fromId: string, toId: string}>()
  
  actionJsonConditionFormGroup: FormGroup
  trueIntentAttributes: string = "";
  falseIntentAttributes: string = "";
  booleanOperators=[ { type: 'AND', operator: 'AND'},{ type: 'OR', operator: 'OR'},]
  OPERATORS_LIST = OPERATORS_LIST;
  
  idIntentSelected: string;
  idConnectorTrue: string;
  idConnectorFalse: string;
  isConnectedTrue: boolean = false;
  isConnectedFalse: boolean = false;
  connector: any;
  
  listOfIntents: Array<{name: string, value: string, icon?:string}>;
  private subscriptionChangedConnector: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private logger: LoggerService,
    private intentService: IntentService,
    private connectorService: ConnectorService
    ) { }

  ngOnInit(): void {
    this.subscriptionChangedConnector = this.intentService.isChangedConnector$.subscribe((connector: any) => {
      this.logger.log('CdsActionJsonConditionComponent isChangedConnector-->', connector);
      this.connector = connector;
      this.updateConnector();
    });
    this.initialize();
  }

  /** */
  ngOnDestroy() {
    if (this.subscriptionChangedConnector) {
      this.subscriptionChangedConnector.unsubscribe();
    }
  }

  // ngOnChanges() {
  //   this.initialize();
  //   if(this.intentSelected){
  //     this.initializeConnector();
  //   }
  //   this.logger.log('[ACTION-JSON-CONDITION] actionnn-->', this.action)
  //   if (this.action) {
  //     this.setFormValue()
  //   }
  // }

  
  private initializeConnector() {
    this.idIntentSelected = this.intentSelected.intent_id;
    this.idConnectorTrue = this.idIntentSelected+'/'+this.action._tdActionId + '/true';
    this.idConnectorFalse = this.idIntentSelected+'/'+this.action._tdActionId + '/false';
    this.listOfIntents = this.intentService.getListOfIntents();
    this.checkConnectionStatus();
  }

  private checkConnectionStatus(){
    if(this.action.trueIntent){
     this.isConnectedTrue = true;
    } else {
     this.isConnectedTrue = false;
    }
    if(this.action.falseIntent){
      this.isConnectedFalse = true;
     } else {
      this.isConnectedFalse = false;
     }
  }

  private updateConnector(){
    try {
      const array = this.connector.fromId.split("/");
      const idAction= array[1];
      if(idAction === this.action._tdActionId){
        if(this.connector.deleted){ //TODO: verificare quale dei due connettori è stato eliminato e impostare isConnected a false
          // DELETE 
          // this.logger.log(' deleteConnector :: ', this.connector.id);
          // this.action.intentName = null;
          if(array[array.length -1] === 'true'){
            this.action.trueIntent = null
            this.isConnectedTrue = false
          }        
          if(array[array.length -1] === 'false'){
            this.action.falseIntent = null
            this.isConnectedFalse = false;
          }
          // if(this.connector.notify)
          if(this.connector.save)this.updateAndSaveAction.emit(this.connector);
          // this.updateAndSaveAction.emit();
        } else { //TODO: verificare quale dei due connettori è stato aggiunto (controllare il valore della action corrispondente al true/false intent)
          // ADD / EDIT
          console.log(' updateConnector :: json-condition', this.connector, this.connector.toId, this.connector.fromId ,this.action, array[array.length-1]);
          if(array[array.length -1] === 'true'){
            // this.action.trueIntent = '#'+this.connector.toId;
            this.isConnectedTrue = true
            // if(this.action.trueIntent !== '#'+this.connector.toId){ 
              this.action.trueIntent = '#'+this.connector.toId;
              // if(this.connector.notify)
              if(this.connector.save)this.updateAndSaveAction.emit(this.connector);
              // this.updateAndSaveAction.emit();
            // } 
          }        
          if(array[array.length -1] === 'false'){
            // this.action.falseIntent = '#'+this.connector.toId;
            this.isConnectedFalse = true;
            // if(this.action.falseIntent !== '#'+this.connector.toId){ 
              this.action.falseIntent = '#'+this.connector.toId;
              // if(this.connector.notify)
              if(this.connector.save)this.updateAndSaveAction.emit(this.connector);
              // this.updateAndSaveAction.emit();
            // } 
          }
        }
      }
    } catch (error) {
      this.logger.log('error: ', error);
    }
  }

  private initialize() {
    this.actionJsonConditionFormGroup = this.buildForm();
    this.actionJsonConditionFormGroup.valueChanges.subscribe(form => {
      this.logger.log('[ACTION-JSON-CONDITION] form valueChanges-->', form)
      if(form && (form.trueIntent !== '' || form.falseIntent !== '' ||  form.stopOnConditionMet !== '')){
        this.action.trueIntent = this.actionJsonConditionFormGroup.value.trueIntent
        this.action.falseIntent = this.actionJsonConditionFormGroup.value.falseIntent
        this.action.stopOnConditionMet = this.actionJsonConditionFormGroup.value.stopOnConditionMet
        // this.action = Object.assign(this.action, this.actionJsonConditionFormGroup.value)
      }
    })
    this.trueIntentAttributes = this.action.trueIntentAttributes;
    this.falseIntentAttributes = this.action.falseIntentAttributes;
    if(this.intentSelected){
      this.initializeConnector();
    }
    this.logger.log('[ACTION-JSON-CONDITION] actionnn-->', this.action)
    if (this.action) {
      this.setFormValue()
    }
  }

  private setFormValue(){
    this.actionJsonConditionFormGroup.patchValue({
      trueIntent: this.action.trueIntent,
      falseIntent: this.action.falseIntent,
      stopOnConditionMet: this.action.stopOnConditionMet,
      // groups: this.action.groups,
    })
  }

  buildForm(): FormGroup{
    return this.formBuilder.group({
      trueIntent: ['', Validators.required],
      falseIntent: ['', Validators.required],
      stopOnConditionMet: [false, Validators.required],
      // groups: this.formBuilder.array([
      //   this.createExpressionGroup(),
      //   // this.createOperatorGroup()
      // ]) 
    })
  }

  createExpressionGroup(): FormGroup{
    return this.formBuilder.group({
      type:["expression", Validators.required],
      conditions: this.formBuilder.array([
        // this.createConditionGroup(), this.createOperatorGroup()
      ])
    })
  }

  createConditionGroup(): FormGroup{
    return this.formBuilder.group({
      type: ["condition", Validators.required],
      operand1 : [ '', Validators.required],
      operator: ['', Validators.required, OperatorValidator],
      operand2: ['', Validators.required]
    })
  }

  createOperatorGroup(): FormGroup{
    return this.formBuilder.group({
      type: ["operator", Validators.required],
      operator: [ '', Validators.required]
    })
  }


  onClickAddGroup(){
    this.action.groups.push(new Operator())
    this.action.groups.push(new Expression())
    this.logger.log('onClickAddGroup-->', this.action)
    // let groups = this.actionJsonConditionFormGroup.get('groups') as FormArray
    // groups.push(this.createOperatorGroup(), {emitEvent: false})
    // groups.push(this.createExpressionGroup(), {emitEvent: false})
    this.updateAndSaveAction.emit();
  }

  onDeleteGroup(index: number, last: boolean){
    this.logger.log('onDeleteGroup', index, last, this.action.groups)
    if(!last){
      this.action.groups.splice(index, 2)
    }else if(last){
      this.action.groups.splice(index-1, 2)
    }
    

    if(this.action.groups.length === 0){
      this.action.groups.push(new Expression())
      // let groups = this.actionJsonConditionFormGroup.get('groups') as FormArray
      // groups.push(this.createExpressionGroup(), {emitEvent: false})
    }
    this.updateAndSaveAction.emit();
  }

  onChangeOperator(event, index: number){
    (this.action.groups[index] as Operator).operator= event['type']
    this.logger.log('onChangeOperator actionsss', this.action, this.actionJsonConditionFormGroup)
    this.updateAndSaveAction.emit();
  }

  onChangeForm(event:{name: string, value: string}, type : 'trueIntent' | 'falseIntent'){
    if(event){
      this.action[type]=event.value

      switch(type){
        case 'trueIntent':
          this.onConnectorChange.emit({ type: 'create', fromId: this.idConnectorTrue, toId: this.action.trueIntent})
          break;
        case 'falseIntent':
          this.onConnectorChange.emit({ type: 'create', fromId: this.idConnectorFalse, toId: this.action.falseIntent})
          break;
      }
      this.updateAndSaveAction.emit();
    }
  }

  onResetBlockSelect(event:{name: string, value: string}, type: 'trueIntent' | 'falseIntent') {
    console.log('onResetBlockSelect', event )
    switch(type){
      case 'trueIntent':
        this.onConnectorChange.emit({ type: 'delete', fromId: this.idConnectorTrue, toId: this.action.trueIntent})
        break;
      case 'falseIntent':
        this.onConnectorChange.emit({ type: 'delete', fromId: this.idConnectorFalse, toId: this.action.falseIntent})
        break;
    }
    this.action[type]=null
    this.updateAndSaveAction.emit();
  }

  onChangeExpression(event){
    this.connectorService.updateConnector(this.intentSelected.intent_id);
    this.updateAndSaveAction.emit();
  }

  onChangeAttributes(attributes:any, type: 'trueIntent' | 'falseIntent'){
    if(type === 'trueIntent'){
      this.action.trueIntentAttributes = attributes;
    }
    if(type === 'falseIntent'){
      this.action.falseIntentAttributes = attributes;
    }
    this.updateAndSaveAction.emit();
  }

  onStopConditionMeet() {
    try {
      this.action.stopOnConditionMet = !this.action.stopOnConditionMet;
      this.updateAndSaveAction.emit();
    } catch (error) {
      this.logger.log("Error: ", error);
    }
  }

}
