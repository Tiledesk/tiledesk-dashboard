import { ActionAssignFunction } from './../../../../../models/intent-model';
import { Component, Input, OnInit } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';
import { TYPE_FUNCTION_LIST_FOR_FUNCTIONS } from 'app/chatbot-design-studio/utils';

@Component({
  selector: 'cds-action-assign-function',
  templateUrl: './action-assign-function.component.html',
  styleUrls: ['./action-assign-function.component.scss']
})
export class ActionAssignFunctionComponent implements OnInit {
  @Input() action: ActionAssignFunction;

  listOfFunctions: Array<{name: string, value: string, icon?:string}> = [];
  openSlectFunction: boolean = true;

  constructor(
      private logger: LoggerService
  ) { }

  ngOnInit(): void {
    // console.log('-------> action:: ', this.action);
    this.initialize();
  }

  ngOnChanges() {
  }

  private initialize() {
    for (let key in TYPE_FUNCTION_LIST_FOR_FUNCTIONS) {
      this.listOfFunctions.push({name: TYPE_FUNCTION_LIST_FOR_FUNCTIONS[key].name, value: TYPE_FUNCTION_LIST_FOR_FUNCTIONS[key].type});
    }
  }

  onSelectedFunction(event: any) {
    // console.log("onSelectedFunction::: ", event);
    this.action.functionName = event.value;
  }

  onSelectedAttribute(event: any){
    // console.log("onSelectedAttribute::: ", event);
    this.action.assignTo = event.name;
  }
  
}

