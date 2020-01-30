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
  // condition: any;        --> get from BaseTriggerComponent
  // options: any;          --> get from BaseTriggerComponent
  // action: any;           --> get from BaseTriggerComponent

  conditionType = 'conditions.all';
  temp_cond: any;
  temp_act: any;
  // operator: any;         --> get from BaseTriggerComponent

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

  // departments = new Array;     --> get from BaseTriggerComponent

  // messageCondition: string;    --> get from BaseTriggerComponent
  // messageAction: string;       --> get from BaseTriggerComponent
  // messageServerError: string;  --> get from BaseTriggerComponent

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

    this.triggerForm = this.formBuilder.group({
        name: [ '', Validators.required],
        description: '',
        trigger: this.formBuilder.group({
          key: ['message.received', Validators.required], // by default trigger.key is set to message.receiveed
          name: 'message create event',
        }),
        conditionALL_ANY: 'all', // by default condition dropdown is set to all
        conditions: this.formBuilder.group({
          any: this.formBuilder.array([ this.createCondition() ]),
          all: this.formBuilder.array([ this.createCondition() ]),
        }),
        actions: this.formBuilder.array([ this.createAction() ]),
        enabled: true // by default the stutus of trigger is set to enabled

    })

    // because the trigger.key is set to default to message.received temp_cond filter
    // the condition in order of this key value
    this.temp_cond = this.condition.filter(b => b.triggerType === 'message.received');
    this.temp_act = this.action

    // set the initial value to action to the first element of this.action array
    const init_act = this.triggerForm.get('actions') as FormArray
    init_act.patchValue([{'key': this.action[0].key,
                          'type': this.action[0].type,
                          'placeholder': this.action[0].placeholder}])

  }

  createCondition(): FormGroup {

    return this.formBuilder.group({
      fact: 'json',
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
        text: [' ', Validators.required]
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
  swithOnOff($event) {
    console.log('trigger status', $event.target.checked)
    this.triggerForm.controls['enabled'].setValue($event.target.checked);
  }

  // get dropdown ANY/ALL condition value
  conditionTriggerValue(value: string) {

    // this.temp_cond = this.condition;
    // this.temp_act = this.action;
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

  onTriggerKey(value: string) {

    // reset condition formArray value: delete all the index from 1  to conditions.length and
    // finally clear the value of the first index array
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

  onSelectedCondition($event: any, condition: FormGroup) {
    this.submitted = false; // allow to reset errorMsg on screen
    console.log('VALUE', $event);

    console.log('condition before', condition)
    // set current value of key
    // - TYPE of selected condition passed as a parameter
    // - PLACEHOLDER of selected condition passed as a parameter
    // const type = this.condition.filter(b => b.id === $event.id)[0].type
    // double filter by id first and by label_key to determine unique type option (some conditions have same id and different type)
    const type = this.condition.filter(b => b.id === $event.id).filter( d => d.label_key === $event.label_key)[0].type
    condition.patchValue({'type': type,
                          'operator': this.options[type + 'Opt'][0].id,
                          'value': undefined,
                          'placeholder': this.condition.filter(b => b.id === $event.id)[0].placeholder });
    console.log('condition after', condition);

  }

  onSelectedAction(event, action) {
    console.log('VALUE', event)

    console.log('action before', action);
    // set value of second and third dropdown action section and set it's placeholder value for selected action
    action.patchValue({'type': this.action.filter(b => b.key === event)[0].type,
                       'placeholder': this.action.filter(b => b.key === event)[0].placeholder,
                       'parameters': {
                            'fullName': undefined,
                            'text': ' '
                        }
                      });
    console.log('action after', action);

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

      // check at least one action is selected
    } else if (this.triggerForm.controls['actions'].invalid) {
      console.log('action validator', this.triggerForm.controls['actions']);

      setTimeout(() => {
        this.SHOW_CIRCULAR_SPINNER = false
        this.SHOW_ERROR_CROSS = true;
        this.errorMESSAGE = true;
      }, 1000);

      // check condition validation and if first dropdawn has value than other ones has a valid value
    } else if ( conditionsGROUP.invalid && conditionsGROUP.controls[0].value['path'] !== null ) {

            console.log('User selected only some dropdown condition but not all. SUMBIT KO')

            setTimeout(() => {
              this.SHOW_CIRCULAR_SPINNER = false
              this.SHOW_ERROR_CROSS = true;
              this.errorMESSAGE = true;
            }, 1000);

    } else {
            // ALL FIELD IS CORRECTLY ADDED

              // add trigger.name value
              if (this.triggerForm.value.trigger.key === 'message.received') {
                this.triggerForm.value.trigger.name = 'message create event';
              } else if (this.triggerForm.value.trigger.key === 'request.create') {
                this.triggerForm.value.trigger.name = 'request create event';
              }


              // add empty condition any or all array because server required field
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

              });
    }

    console.log('TRIGGER', this.triggerForm.value);
  }


  // modal button CONTINUE
  onCloseModalHandled() {
    console.log('CONTINUE PRESSED ');

    if ( this.errorMESSAGE || this.errorMESSAGE_server ) {

          console.log('Error occured. Return to current page')

    } else { this._location.back(); }
    this.displayMODAL_Window = 'none';

  }

  // modal icon X
  onCloseModal() {
    this.displayMODAL_Window = 'none';
  }

  goBack() {
    this._location.back();
  }

}
