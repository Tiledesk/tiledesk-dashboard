import { FormControl } from '@angular/forms';
import { OPERATORS_LIST, TYPE_OPERATOR } from './../../utils';
import { Component, OnInit, TemplateRef, ElementRef, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SatPopoverAnchor } from '@ncstate/sat-popover';
import { Expression, Operator, Condition } from 'app/models/intent-model';


@Component({
  selector: 'cds-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {

  @Input() expression: Expression
  @Input() booleanOperators: {}
  @Input() variableList: Array<{name: string, value: string}>
  @Input() control: FormControl = new FormControl()
  @Output() onAddControl = new EventEmitter()
  filteredVariableList: Array<{name: string, value: string}> = []
  textVariable: string = ''

  

  operators: Array<{}> = []
  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges){
    // if(this.variableList){
    //   this.filteredVariableList = this.variableList
      this.operators = Object.keys(OPERATORS_LIST).map(key => (OPERATORS_LIST[key]))
      console.log('operatorsssss', this.operators, this.expression)
    // }
  }


  onClickAddCondition(){
    this.expression.conditions.push( new Operator())
    this.expression.conditions.push( new Condition())
    this.onAddControl.emit()

  }

  onChangeOperator(event, index){
    this.expression.conditions[index].operator= event['type']
  }

  onDeleteCondition(index: number, last: boolean){
    if(index && !last){
      this.expression.conditions.splice(index, 2)
    }else if( index && last){
      this.expression.conditions.splice(index, 1)
    }
    
  }

  // onChangeSearch(event){
  //   console.log('eventtttt', event)
  //   if(event && event.target){
  //     this.textVariable = event.target.value
  //   }else {
  //     this.textVariable = event
  //   }
  //   this.filteredVariableList = this._filter(this.textVariable)
   
  // }

  // onVariableSelected(variableSelected: {name: string, value: string}){
  //   console.log('onVariableSelected-->', variableSelected)
  // }


  // private _filter(value: string): Array<any> {
  //   const filterValue = value.toLowerCase();
  //   console.log('filteredddd', filterValue)
  //   return this.variableList.filter(option => option.name.toLowerCase().includes(filterValue));
  // }



}
