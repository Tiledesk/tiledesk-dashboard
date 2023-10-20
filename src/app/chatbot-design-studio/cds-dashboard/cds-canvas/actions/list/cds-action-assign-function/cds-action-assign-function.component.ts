import { ActionAssignFunction } from '../../../../../../models/intent-model';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';
import { TYPE_FUNCTION_LIST_FOR_FUNCTIONS, TYPE_UPDATE_ACTION } from 'app/chatbot-design-studio/utils';

@Component({
  selector: 'cds-action-assign-function',
  templateUrl: './cds-action-assign-function.component.html',
  styleUrls: ['./cds-action-assign-function.component.scss']
})
export class CdsActionAssignFunctionComponent implements OnInit {
  
  @Input() action: ActionAssignFunction;
  @Output() updateAndSaveAction = new EventEmitter();
  
  listOfFunctions: Array<{name: string, value: string, icon?:string}> = [];
  openSlectFunction: boolean = true;

  constructor(
      private logger: LoggerService
  ) { }

  ngOnInit(): void {
    // this.logger.log('-------> action:: ', this.action);
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
    // this.logger.log("onSelectedFunction::: ", event);
    this.action.functionName = event.value;
    this.updateAndSaveAction.emit({type: TYPE_UPDATE_ACTION.ACTION, element: this.action});
  }

  onSelectedAttribute(event: any){
    // this.logger.log("onSelectedAttribute::: ", event);
    this.action.assignTo = event.name;
    this.updateAndSaveAction.emit({type: TYPE_UPDATE_ACTION.ACTION, element: this.action});
  }
  
}

