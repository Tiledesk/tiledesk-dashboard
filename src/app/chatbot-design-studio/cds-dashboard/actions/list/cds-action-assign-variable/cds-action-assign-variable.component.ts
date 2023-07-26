import { ActionAssignVariable, Operand } from '../../../../../models/intent-model';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';
import { TYPE_MATH_OPERATOR, TYPE_FUNCTION_LIST_FOR_VARIABLES, TYPE_MATH_OPERATOR_LIST } from 'app/chatbot-design-studio/utils';

@Component({
    selector: 'cds-action-assign-variable',
    templateUrl: './cds-action-assign-variable.component.html',
    styleUrls: ['./cds-action-assign-variable.component.scss']
})
export class CdsActionAssignVariableComponent implements OnInit, OnChanges {
    @Input() action: ActionAssignVariable;
    @Input() previewMode: boolean = true;
    displaySetOperationPlaceholder:boolean = true

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
        const operands = this.action.operation.operands
        const operators = this.action.operation.operators
        console.log('[CDS-ACTION-ASSIGN-VARIABLE] operands ', operands)
        console.log('[CDS-ACTION-ASSIGN-VARIABLE] operators ', operators)
        for (let i = 0; i < operands.length; i++) {
            for (let key in TYPE_FUNCTION_LIST_FOR_VARIABLES) {
                let _function = operands[i].function
                // console.log('[CDS-ACTION-ASSIGN-VARIABLE] operand _function (2)' , _function)
                // console.log('[CDS-ACTION-ASSIGN-VARIABLE]  TYPE_FUNCTION_LIST_FOR_VARIABLES key ' ,TYPE_FUNCTION_LIST_FOR_VARIABLES[key])
                if (_function === TYPE_FUNCTION_LIST_FOR_VARIABLES[key].type) {
                    console.log('[CDS-ACTION-ASSIGN-VARIABLE] >>>>>> operand  ', operands[i])
                    operands[i]['functionName'] = TYPE_FUNCTION_LIST_FOR_VARIABLES[key].name
                }
            }
            console.log('[CDS-ACTION-ASSIGN-VARIABLE] operands -xx', operands[i])
            if (operands[i].value === '') {
                this.displaySetOperationPlaceholder = false
                console.log('[CDS-ACTION-ASSIGN-VARIABLE] displaySetOperationPlaceholder -xx', this.displaySetOperationPlaceholder)
            }
            for (let j = 0; j < operators.length; j++) {
                // console.log('[CDS-ACTION-ASSIGN-VARIABLE] operator ---xx>', operators)
                if (operands.length - 1) {
                    console.log('[CDS-ACTION-ASSIGN-VARIABLE] operators j -xx>', operators[j])
                    console.log('[CDS-ACTION-ASSIGN-VARIABLE] operators i -xx>', operators[i])
                    console.log('[CDS-ACTION-ASSIGN-VARIABLE] operators i  TYPE_MATH_OPERATOR[operators[i]] -xx>', TYPE_MATH_OPERATOR[operators[i]])
                    // operands[i]['operator'] = TYPE_MATH_OPERATOR[operators[j]]
                    for (let key in TYPE_MATH_OPERATOR_LIST) {
                        if (operators[i] === TYPE_MATH_OPERATOR_LIST[key].type) {
                            operands[i]['operator'] = TYPE_MATH_OPERATOR_LIST[key].name
                        }
                    }

                }
            }
        }

        // operands.forEach(operand => {
        //     let _function = operand.function
        //     // console.log('[CDS-ACTION-ASSIGN-VARIABLE] operand _function (1) ',_function)
        //     // console.log('[CDS-ACTION-ASSIGN-VARIABLE] operand TYPE_FUNCTION_LIST_FOR_VARIABLES',TYPE_FUNCTION_LIST_FOR_VARIABLES)
        //     // console.log('xx',`TYPE_FUNCTION_LIST_FOR_VARIABLES.${_function}`)
        //     for (let key in TYPE_FUNCTION_LIST_FOR_VARIABLES) {
        //         // console.log('[CDS-ACTION-ASSIGN-VARIABLE] operand _function (2)' , _function)
        //         // console.log('[CDS-ACTION-ASSIGN-VARIABLE]  TYPE_FUNCTION_LIST_FOR_VARIABLES key ' ,TYPE_FUNCTION_LIST_FOR_VARIABLES[key])
        //         if (_function === TYPE_FUNCTION_LIST_FOR_VARIABLES[key].type) {
        //             console.log('[CDS-ACTION-ASSIGN-VARIABLE] >>>>>> operand  ', operand)
        //             operand['functionName'] = TYPE_FUNCTION_LIST_FOR_VARIABLES[key].name
        //         }
        //     }
        // });

        // for (let i = 0; i < operators.length; i++) {
        //     console.log('[CDS-ACTION-ASSIGN-VARIABLE] operators', operators[i])
        //     for (let j = 0; j < operands.length; j++) {
        //         console.log('[CDS-ACTION-ASSIGN-VARIABLE] operators', operands[j])
        //         if(operands.length - 1) {
        //             operands[j]['operator'] = operators[i]
        //         }
        //     }
        // }



        // for (let i = 0; i < operators; i++) {

        //     if (i < operation.operands.length - 1) {
        //         this.list.push(operation.operators[i]);
        //     }
        // }
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
