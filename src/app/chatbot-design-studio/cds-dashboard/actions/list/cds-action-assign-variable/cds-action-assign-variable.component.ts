import { ActionAssignVariable, Operand } from '../../../../../models/intent-model';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';
import { TYPE_MATH_OPERATOR, TYPE_FUNCTION_LIST_FOR_VARIABLES } from 'app/chatbot-design-studio/utils';

@Component({
    selector: 'cds-action-assign-variable',
    templateUrl: './cds-action-assign-variable.component.html',
    styleUrls: ['./cds-action-assign-variable.component.scss']
})
export class CdsActionAssignVariableComponent implements OnInit, OnChanges {
    @Input() action: ActionAssignVariable;
    @Input() previewMode: boolean = true;

    variables: Array<string> = [];
    listOfFunctions: Array<{ name: string, value: string, icon?: string }> = [];

    constructor(
        private logger: LoggerService
    ) { }

    ngOnInit(): void {
        this.initialize();
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log('[CDS-ACTION-ASSIGN-VARIABLE] action ', this.action)
    }

    initialize() {
        for (let key in TYPE_FUNCTION_LIST_FOR_VARIABLES) {
            this.listOfFunctions.push({ name: TYPE_FUNCTION_LIST_FOR_VARIABLES[key].name, value: TYPE_FUNCTION_LIST_FOR_VARIABLES[key].type });
        }
    }

    onSelectedAttribute(variableSelected: { name: string, value: string }) {
        this.action.destination = variableSelected.value;
    }

    onSelectedOperator() {
        let temp = this.action.operation;
        this.action.operation.operators.push(TYPE_MATH_OPERATOR['addAsNumber']);
        this.action.operation.operands.push(new Operand());
        this.action.operation = Object.assign({}, temp);
    }
}
