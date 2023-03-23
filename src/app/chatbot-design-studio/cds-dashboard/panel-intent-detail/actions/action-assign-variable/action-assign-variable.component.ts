import { ActionAssignVariable, Operand } from './../../../../../models/intent-model';
import { Component, Input, OnInit } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';
import { TYPE_MATH_OPERATOR } from 'app/chatbot-design-studio/utils';

@Component({
    selector: 'cds-action-assign-variable',
    templateUrl: './action-assign-variable.component.html',
    styleUrls: ['./action-assign-variable.component.scss']
})
export class ActionAssignVariableComponent implements OnInit {
    @Input() action: ActionAssignVariable;

    variables: Array<string> = [];

    constructor (
        private logger: LoggerService
    ) { }

    ngOnInit(): void {
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
