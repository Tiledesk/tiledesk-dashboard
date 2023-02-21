import { Component, Input, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { variableList } from 'app/chatbot-design-studio/utils';

@Component({
  selector: 'variable-list',
  templateUrl: './variable-list.component.html',
  styleUrls: ['./variable-list.component.scss']
})
export class VariableListComponent implements OnInit {
  
  @Output() onSelected = new EventEmitter()

  variableListUserDefined: Array<{name: string, value: string}> = variableList.userDefined 
  variableListSystemDefined: Array<{name: string, value: string, src?: string}> = variableList.systemDefined
  
  filteredVariableList: Array<{name: string, value: string}> = []
  filteredIntentVariableList: Array<{name: string, value: string, src?: string}>
  textVariable: string = ''

  constructor() { }

  ngOnInit(): void {
    console.log('[BASE_CONDITION_ROW] ngOnChanges variableList', this.variableListUserDefined, this.variableListSystemDefined)
    if(this.variableListUserDefined){
      this.filteredVariableList = this.variableListUserDefined
    }
    if(this.variableListSystemDefined){
      this.filteredIntentVariableList = this.variableListSystemDefined
    }
  }

  ngOnChanges(){
  }

  onVariableSelected(variableSelected: {name: string, value: string}){
    this.onSelected.emit(variableSelected)
  }


  onChangeSearch(event){
    if(event && event.target){
      this.textVariable = event.target.value
    }else {
      this.textVariable = event
    }
    this.filteredVariableList = this._filter(this.textVariable, this.variableListUserDefined)
    this.filteredIntentVariableList = this._filter(this.textVariable, this.variableListSystemDefined)
  }

  private _filter(value: string, array: Array<any>): Array<any> {
    const filterValue = value.toLowerCase();
    return array.filter(option => option.name.toLowerCase().includes(filterValue));
  }

}
