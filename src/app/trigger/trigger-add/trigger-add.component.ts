import { BasetriggerComponent } from './../basetrigger/basetrigger.component';

import { NotifyService } from 'app/core/notify.service';
import { DepartmentService } from './../../services/mongodb-department.service';
import { TriggerService } from 'app/services/trigger.service';
import { Component, OnInit, trigger} from '@angular/core';
import * as _ from 'lodash';

// USED FOR go back last page
import { Location } from '@angular/common';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';


@Component({
  selector: 'appdashboard-trigger-add',
  templateUrl: './trigger-add.component.html',
  styleUrls: ['./trigger-add.component.scss']
})
export class TriggerAddComponent extends BasetriggerComponent implements OnInit {


  // trigger: Trigger;
  // condition: any; --> get from BaseTriggerComponent
  // options: any; --> get from BaseTriggerComponent
  // action: any; --> get from BaseTriggerComponent

  type: any;

  conditionType = 'conditions.all';
  temp_cond: any;
  temp_act: any;
  // operator: any;

  triggerForm: FormGroup;
  conditions: FormArray;
  any: FormArray;
  all: FormArray;
  actions: FormArray;

  displayMODAL_Window = 'none';
  SHOW_CIRCULAR_SPINNER = false;
  SHOW_ERROR_CROSS = false;
  IS_VALID: boolean;
  errorMESSAGE: boolean;
  errorMESSAGE_server: boolean;
  submitted = false;

  // departments = new Array; --> get from BaseTriggerComponent

  // messageCondition: string; --> get from BaseTriggerComponent
  // messageAction: string; --> get from BaseTriggerComponent
  // messageServerError: string; --> get from BaseTriggerComponent



  constructor(public router: Router,
              private _location: Location,
              private formBuilder: FormBuilder,
              private triggerService: TriggerService,
              public departmentService: DepartmentService,
              private notify: NotifyService,
              public translate: TranslateService) {
                super(translate, departmentService)

            }



  ngOnInit() {

    console.log('cond_cond', this.condition)
    console.log('cond_dep', this.departments)

    this.triggerForm = this.formBuilder.group({
        name: [ '', Validators.required],
        description: '',
        trigger: this.formBuilder.group({
          key: ['message.received', Validators.required],
          name: 'message create event',
        }),
        conditionALL_ANY: 'all',
        conditions: this.formBuilder.group({
          any: this.formBuilder.array([ this.createCondition() ]),
          all: this.formBuilder.array([ this.createCondition() ]),
        }),
        actions: this.formBuilder.array([ this.createAction() ]),
        enabled: true

    })

    // this.condition = [
    //   // message.received conditions start
    //   { groupId: 'Visitor Information', id: 'text', label_key: 'Visitor search terms', triggerType: 'message.received', type: 'string'},
    //   { groupId: 'Visitor Information', id: 'senderFullname', label_key: 'Visitor name', triggerType: 'message.received', type: 'string'},
    //   { groupId: 'Visitor Information', id: 'attributes.userEmail', label_key: 'Visitor mail', triggerType: 'message.received', type: 'string'},
    //   { groupId: 'Visitor Information', id: 'attributes.departmentName', label_key: 'Visitor department',
    //         triggerType: 'message.received', type: 'boolean', operator: this.departments },
    //   { groupId: 'Visitor Information', id: 'attributes.client', label_key: 'Visitor referrer (Client)', triggerType: 'message.received', type: 'string'},
    //   { groupId: 'Page information', id: 'attributes.sourcePage', label_key: 'Visitor page URL', triggerType: 'message.received', type: 'string'},
    //   { groupId: 'Page information', id: 'attributes.sourcePage', label_key: 'Visitor page title', triggerType: 'message.received', type: 'string'},
    //   { groupId: 'Software/Computer of visitor', id: 'attributes.client', label_key: 'Visitor browser', triggerType: 'message.received', type: 'string'},
    //   { groupId: 'Software/Computer of visitor', id: 'attributes.client', label_key: 'Visitor platform', triggerType: 'message.received', type: 'string'},
    //   { groupId: 'Chat-related information', id: 'attributes.departmentName', label_key: 'Department', triggerType: 'message.received', type: 'string'},
    //   { groupId: 'Chat-related information', id: 'status', label_key: 'Visitor served',
    //         triggerType: 'message.received', type: 'boolean', operator: [ {id: 200, label_key: 'True'},
    //                                                                       {id: 100, label_key: 'False'}
    //                                                         ]},
    //   // request.create conditions start
    //   { groupId: 'Page Information', id: 'sourcePage', label_key: 'Visitor page URL', triggerType: 'request.create', type: 'string'},
    //   { groupId: 'Page Information', id: 'sourcePage', label_key: 'Visitor page title', triggerType: 'request.create', type: 'string'},
    //   { groupId: 'Visitor Information', id: 'lead.fullname', label_key: 'Visitor name', triggerType: 'request.create', type: 'string'},
    //   { groupId: 'Visitor Information', id: 'lead.email', label_key: 'Visitor mail', triggerType: 'request.create', type: 'string'},
    //   { groupId: 'Visitor Information', id: 'lead.attributes.departmentName', label_key: 'Visitor department', triggerType: 'request.create', type: 'string'},
    //   { groupId: 'Visitor Information', id: 'lead.attributes.client', label_key: 'Visitor referrer (Client)', triggerType: 'request.create', type: 'string'},
    //   { groupId: 'Software/Computer of visitor', id: 'userAgent', label_key: 'Visitor browser', triggerType: 'request.create', type: 'string'},
    //   { groupId: 'Software/Computer of visitor', id: 'userAgent', label_key: 'Visitor platform', triggerType: 'request.create', type: 'string'},
    //   { groupId: 'Software/Computer of visitor', id: 'agents.length', label_key: 'Visitor user agent', triggerType: 'request.create', type: 'int'},
    //   { groupId: 'Channel information', id: 'channel.name', label_key: 'Channel name', triggerType: 'request.create', type: 'string'},
    //   { groupId: 'Location of visitor', id: 'language', label_key: 'Visitor country region',
    //         triggerType: 'request.create', type: 'boolean', operator: [ { id: 'zh-CN', label_key: 'Chinese'},
    //                                                                     { id: 'en-GB', label_key: 'English'},
    //                                                                     { id: 'fr-FR', label_key: 'Franch'},
    //                                                                     { id: 'it-IT', label_key: 'Italian'}
    //                                                                 ]},
    //   { groupId: 'Chat-related information', id: 'department.name', label_key: 'Department',
    //         triggerType: 'request.create', type: 'boolean', operator: this.departments},
    //   { groupId: 'Chat-related information', id: 'status', label_key: 'Visitor served',
    //         triggerType: 'request.create', type: 'boolean', operator: [ {id: 200, label_key: 'True'},
    //                                                                     {id: 100, label_key: 'False'}
    //                                                         ]},
    // ]

    // this.options = {
    //   stringOpt: [
    //     { id: 'equal', label_key: 'Uguale a'},
    //     { id: 'notEqual', label_key: 'Non uguale a'},
    //     { id: 'in', label_key: 'Contiene'},
    //     { id: 'notIn', label_key: 'Non contiene'},
    //   ],
    //   intOpt: [
    //     { id: 'equal', label_key: 'Uguale a'},
    //     { id: 'notEqual', label_key: 'Non uguale a'},
    //     { id: 'greaterThan', label_key: 'Maggiore di '},
    //     { id: 'lessThan', label_key: 'Minore di'},
    //     { id: 'greaterThanInclusive', label_key: 'Maggiore uguale a'},
    //     { id: 'lessThanInclusive', label_key: 'Minore uguale a'}
    //   ],
    //   booleanOpt: [
    //     { id: 'equal', label_key: 'Uguale a', value: true},
    //     { id: 'notEqual', label_key: 'Non uguale a', value: false}
    //   ]
    // }

    // this.action = [
    //     { key: 'message.send', label_key: 'Invia messaggio al visitatore', type: 'input', placeholder: 'text here'},
    //     // { key: 'message.received', label_key: 'Ricevi messaggio', type: 'select', placeholder: 'text here2'},
    //     // { key: 'wait', label_key: 'Attesa', type: 'input', placeholder: 'text here2'}
    // ]


    this.temp_cond = this.condition.filter(b => b.triggerType === 'message.received');
    this.temp_act = this.action

    // set the initial value to action to the first element of this.action array
    const init_act = this.triggerForm.get('actions') as FormArray
    init_act.patchValue([{'key': this.action[0].key,
                          'type': this.action[0].type,
                          'placeholder': this.action[0].placeholder}])
    console.log('init_act', init_act)

  }

  createCondition(): FormGroup {

    return this.formBuilder.group({
      fact: '',
      path: [ undefined, Validators.required],
      operator: [ undefined, Validators.required],
      value: [ undefined, Validators.required ],
      type: undefined,
      placeholder: undefined
    })

  }

  createAction(): FormGroup {

    return this.formBuilder.group({
      key: [ undefined, Validators.required],
      parameters: this.formBuilder.group({
        fullName: [undefined, Validators.required],
        text: [undefined, Validators.required]
      }),
      type: undefined, // change value to undefined if added multiple actions next
      placeholder: undefined
    })
  }

  addConditions(): void {
    console.log('Add NEW CONDITIONS ARRAY');
    this.conditions = this.triggerForm.get(this.conditionType) as FormArray;
    this.conditions.push(this.createCondition());
  }

  removeCondition(rowIndex: number): void {
    console.log('Remove CONDITION ARRAY with index:', rowIndex);
    this.conditions = this.triggerForm.get(this.conditionType) as FormArray;
    if (this.conditions.length === 1 && rowIndex === 0) {
      this.notify.showNotification( this.messageCondition , 4, 'report_problem');
    } else {
      this.conditions.removeAt(rowIndex);
    }

  }

  addActions(): void {
    console.log('Add NEW CONDITIONS ARRAY');
    this.actions = this.triggerForm.get('actions') as FormArray;
    this.actions.push(this.createAction());
  }
  removeAction(rowIndex: number): void {
    console.log('Remove CONDITION ARRAY with index:', rowIndex);
    this.actions = this.triggerForm.get('actions') as FormArray;
    // check if exist at least 1 action to do for trigger
    if (this.actions.length === 1 && rowIndex === 0) {
      this.notify.showNotification(this.messageAction , 4, 'report_problem');
    } else {
      this.actions.removeAt(rowIndex);
    }

  }

  onEnableDisable(status: boolean) {
    console.log('trigger status:', status)
    this.triggerForm.controls['enabled'].setValue(status);
  }
  swithOnOff($event){
    console.log('trigger status', $event.target.checked)
    this.triggerForm.controls['enabled'].setValue($event.target.checked);
  }

  // get dropdown ANY/ALL condition value
  conditionTriggerValue(value) {

    // this.temp_cond = this.condition;
    this.temp_act = this.action;
    this.conditionType = 'conditions.' + value;
    console.log('Cond-value', this.conditionType);

    // reset condition formArray value: delete all the index from 1  to conditions.length and
    // finally clear the value of first index array
    this.conditions = this.triggerForm.get(this.conditionType) as FormArray;

    if (this.conditions.length !== null) {
      for (let i = 1; i < this.conditions.length; i++) {
        this.conditions.removeAt(i);
      }
      this.conditions.reset();
    } else {
      this.conditions.reset();
    }
  }

  onTriggerKey(value) {

    // reset condition formArray value: delete all the index from 1  to conditions.length and
    // finally clear the value of first index array
    this.conditions = this.triggerForm.get(this.conditionType) as FormArray;

    if (this.conditions.length !== null) {
      for (let i = 1; i < this.conditions.length; i++) {
        this.conditions.removeAt(i);
      }
      this.conditions.reset();
    } else {
      this.conditions.reset();
    }

    console.log('Trigger key:', value);
    if (value) {
      this.temp_cond = this.condition.filter(b => b.triggerType === value);
    } else {
      this.temp_cond = this.condition.filter(b => b.triggerType === 'message.received');
    }
    console.log('temp_cond', this.temp_cond);
  }

  onSelectedCondition(event, condition) {
    this.submitted = false; // allow to reset errorMsg on screen
    this.type = null;
    // this.operator = null;
    console.log('VALUE', event);

    console.log('condition before', condition)
    // set current value of key TYPE of selected condition passed as a parameter
    const type = this.condition.filter(b => b.id === event.id)[0].type
    condition.patchValue({'type': type,
                          'operator': this.options[type + 'Opt'][0].id,
                          'value': undefined,
                          'placeholder': this.condition.filter(b => b.id === event.id)[0].placeholder });
    console.log('condition after', condition);

    // this.operator = this.condition.filter(b => b.id === event)[0].operator;
    console.log('operator', this.operator)
    console.log('TYPE', this.type)


  }

  onSelectedAction(event, action) {
    console.log('VALUE', event)

    console.log('action before', action);
    // set value of second and third dropdown action section and set it's placeholder value for selected action
    action.patchValue({'type': this.action.filter(b => b.key === event)[0].type,
                       'placeholder': this.action.filter(b => b.key === event)[0].placeholder});

  }


  get form() { return this.triggerForm.controls }


  onSubmit() {


    console.log('get form', this.form);

    this.displayMODAL_Window = 'block';
    this.SHOW_CIRCULAR_SPINNER = true;
    this.errorMESSAGE = false;
    this.errorMESSAGE_server = false;

    this.submitted = true;


     // delete the not choice conditionType array in triggerForm.conditions
     if ( this.conditionType.split('conditions.')[1] === 'all' ) {
      delete this.triggerForm.value.conditions.any
    } else {
      delete this.triggerForm.value.conditions.all
    }
    // set value of all conditons.any/all.fact to 'json'
    for ( let i = 0; i < this.triggerForm.value.conditions[this.conditionType.split('conditions.')[1]].length; i++) {
      this.triggerForm.value.conditions[this.conditionType.split('conditions.')[1]][i].fact = 'json'
    }

    // control validator for conditions.all/any elements
    const conditionsGROUP = this.triggerForm.get(this.conditionType) as FormGroup

    // controls name validation
    if ( this.triggerForm.controls['name'].invalid ) {

          setTimeout(() => {
            this.SHOW_CIRCULAR_SPINNER = false
            this.SHOW_ERROR_CROSS = true;
            this.errorMESSAGE = true;
          }, 1000);

    } else if (this.triggerForm.controls['actions'].invalid) {
      console.log('action validator', this.triggerForm.controls['actions']);

      setTimeout(() => {
        this.SHOW_CIRCULAR_SPINNER = false
        this.SHOW_ERROR_CROSS = true;
        this.errorMESSAGE = true;
      }, 1000);

    } else if ( conditionsGROUP.invalid && conditionsGROUP.controls[0].value['path'] !== null ) {
            // conditionsGROUP.controls[0].value['path'] !== null &&
            console.log('User selected only some dropdown condition but not all. SUMBIT KO')

            setTimeout(() => {
              this.SHOW_CIRCULAR_SPINNER = false
              this.SHOW_ERROR_CROSS = true;
              this.errorMESSAGE = true;
            }, 1000);


    } else  {
            // ALL FIELD IS CORRECTLY ADDED

            console.log('okkkkk')
              // add trigger.name value
              if (this.triggerForm.value.trigger.key === 'message.received') {
                this.triggerForm.value.trigger.name = 'message create event';
              } else if (this.triggerForm.value.trigger.key === 'request.create') {
                this.triggerForm.value.trigger.name = 'request create event';
              }


              // add empty condition array for required server field request
              // if condition[any/all].path is null
              if ( conditionsGROUP.controls[0].value['path'] === null ) {
                this.triggerForm.value.conditions[this.conditionType.split('conditions.')[1]] = [];
              }

              this.triggerService.postTrigger(this.triggerForm.value).subscribe(res => {
                console.log('add trigger...', res);
                }, (error) => {
                    setTimeout(() => {
                      this.SHOW_CIRCULAR_SPINNER = false
                      this.SHOW_ERROR_CROSS = true;
                      this.errorMESSAGE_server = true;
                    }, 1000);
                    console.log('»» !!! TRIGGER -  ADD NEW TRIGGER REQUESTS  - ERROR ', error);

                }, () => {
                    setTimeout(() => {
                      this.SHOW_CIRCULAR_SPINNER = false;
                      this.SHOW_ERROR_CROSS = false;
                    }, 1000);
                    console.log('»» !!! TRIGGER -  ADD NEW TRIGGER REQUESTS * COMPLETE *');

                }
              );


    }


    console.log('TRIGGER', this.triggerForm.value);



  }



  onCloseModalHandled() {
    console.log('CONTINUE PRESSED ');

    if ( this.errorMESSAGE || this.errorMESSAGE_server ) {

          console.log('Error occured. Return to current page')

    } else { this._location.back(); }
    this.displayMODAL_Window = 'none';

  }

  onCloseModal() {
    this.displayMODAL_Window = 'none';
  }

  goBack() {
    this._location.back();
  }

}
