import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { TYPE_MATH_OPERATOR } from 'app/chatbot-design-studio/utils';
import { Operand, Operation } from 'app/models/intent-model';

@Component({
    selector: 'operation',
    templateUrl: './operation.component.html',
    styleUrls: ['./operation.component.scss']
})
export class OperationComponent implements OnInit {

    @Input() operation: Operation;
    @Output() onAddOperator = new EventEmitter<any>();
    list: Array<{value: TYPE_MATH_OPERATOR, index: number} | Operand | ''> = [];


    constructor() { }

    ngOnInit(): void {

    }

    ngOnChanges(changes) {
        console.log('operation', this.operation);
        
        if (this.operation) {
            this.setList(this.operation);
        }
    }

    private setList(operation: Operation) {
        this.list = [];


        for (let i = 0; i < operation.operands.length; i++) {
            this.list.push(operation.operands[i]);

            if (i < operation.operands.length - 1) {
                this.list.push({value: operation.operators[i], index: i});
            }
        }
    }

    onClickOperator() {
        this.onAddOperator.emit();
    }

    onSelectedOperator(event: {value: TYPE_MATH_OPERATOR, index: number}) {
        this.operation.operators[event.index] = event.value;
        this.setList(this.operation);   
        console.log('operation', this.operation);;
        
    }
}
