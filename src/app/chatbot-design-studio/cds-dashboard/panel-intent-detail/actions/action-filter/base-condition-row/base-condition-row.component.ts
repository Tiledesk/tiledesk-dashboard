import { SatPopover } from '@ncstate/sat-popover';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, Input, OnInit, SimpleChanges, EventEmitter, Output, HostListener, ViewChild, ElementRef } from '@angular/core';
import { OPERATORS_LIST, OperatorValidator } from 'app/chatbot-design-studio/utils';
import { Condition } from 'app/models/intent-model';

@Component({
  selector: 'base-condition-row',
  templateUrl: './base-condition-row.component.html',
  styleUrls: ['./base-condition-row.component.scss']
})
export class BaseConditionRowComponent implements OnInit {

  @ViewChild('operand1') inputOperand1: ElementRef;

  @Input() variableList: Array<{name: string, value: string}>
  @Input() intentVariableList: Array<{name: string, value: string, src: string}>
  @Input() condition: Condition;
  @Output() close = new EventEmitter()

  textVariable: string = ''
  filteredVariableList: Array<{name: string, value: string}> = []
  filteredIntentVariableList: Array<{name: string, value: string, src: string}>
  operatorsList: Array<{}> = []
  step: number = 0;
  disableInput: boolean = true

  conditionForm: FormGroup

  constructor(
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    
  }

  ngOnChanges(changes: SimpleChanges){
    this.conditionForm = this.createConditionGroup()
    this.operatorsList = Object.keys(OPERATORS_LIST).map(key => (OPERATORS_LIST[key]))
    if(this.variableList){
      this.filteredVariableList = this.variableList
      this.filteredIntentVariableList = this.intentVariableList
      console.log('[BASE_CONDITION_ROW] ngOnChanges filteredVariableList', this.filteredVariableList)
    }

    if(this.condition){
      console.log('[BASE_CONDITION_ROW] selectedConditionnnn-->', this.condition)
      this.setFormValue()
      this.step = 1
    }
   
  }

  createConditionGroup(): FormGroup{
    return this.formBuilder.group({
      type: ["condition", Validators.required],
      operand1 : [ '', Validators.required],
      operator: ['equalAsNumbers', [Validators.required, OperatorValidator]],
      operand2: ['', Validators.required]
    })
  }

  setFormValue(){
    this.conditionForm.patchValue({
      operand1 : this.condition.operand1,
      operator: this.condition.operator,
      operand2: this.condition.operand2
    })
  }

  onChangeSearch(event){
    if(event && event.target){
      this.textVariable = event.target.value
    }else {
      this.textVariable = event
    }
    this.filteredVariableList = this._filter(this.textVariable, this.variableList)
    this.filteredIntentVariableList = this._filter(this.textVariable, this.intentVariableList)
  }

  onVariableSelected(variableSelected: {name: string, value: string}){
    this.conditionForm.patchValue({ operand1: variableSelected.value}, {emitEvent: false})
    this.step +=1
  }

  onAddCustomAttribute(){
    this.step +=1
    this.disableInput = false
    setTimeout(()=>{
      this.inputOperand1.nativeElement.focus()
    },300)
  }

  onClickOperator(operator: {}){
    this.conditionForm.patchValue({ operator: operator['type']})

    // let popoverContent = document.getElementsByClassName('filter-item-drop-down')[0] as  HTMLElement
    // setTimeout(()=>{
    //   console.log('contenttt', popoverContent)
    //   popoverContent.scroll()
    // },100)
  }

  onSubmitCondition(){
    console.log('onSubmitCondition-->', this.conditionForm)
    if(this.conditionForm.valid){
      let condition: Condition = new Condition()
      condition = Object.assign(condition, this.conditionForm.value);
      this.step = 0;
      this.conditionForm = this.createConditionGroup()
      this.close.emit(condition)
    }
  }

  onClose(){
    console.log('onClose pressed')
    this.step = 0;
    this.disableInput = true
    this.conditionForm = this.createConditionGroup()
    this.close.emit()
  }


  private _filter(value: string, array: Array<any>): Array<any> {
    const filterValue = value.toLowerCase();
    return array.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  @HostListener('document:keydown', ['$event'])
  onKeyPress(event){
    const keyCode = event.which || event.keyCode;
    if (keyCode === 27) { // Esc keyboard code
      this.onClose()
    }
  }

}
