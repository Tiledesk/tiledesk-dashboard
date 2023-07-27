import { Component, Input, OnInit } from '@angular/core';
import { variableList } from 'app/chatbot-design-studio/utils';
import { ActionDeleteVariable } from 'app/models/intent-model';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'cds-action-delete-variable',
  templateUrl: './cds-action-delete-variable.component.html',
  styleUrls: ['./cds-action-delete-variable.component.scss']
})
export class CdsActionDeleteVariableComponent implements OnInit {

  @Input() action: ActionDeleteVariable;
  @Input() previewMode: boolean = true;
  
  variableListUserDefined: Array<{name: string, value: string}>;
  
  constructor(
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    this.initialize();
  }

  private initialize() {
    // console.log('action: ', variableList.userDefined);
    this.variableListUserDefined = variableList.userDefined;
  }

  onChangeSelect(variableSelected: {name: string, value: string}){
    // console.log('changeeeeee', variableSelected);
    this.action.variableName = variableSelected.name;
  }

}
