import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TYPE_MATH_OPERATOR, TYPE_MATH_OPERATOR_LIST } from 'app/chatbot-design-studio/utils';

@Component({
    selector: 'operator',
    templateUrl: './operator.component.html',
    styleUrls: ['./operator.component.scss']
})
export class OperatorComponent implements OnInit {

    @Input() operator: {value: TYPE_MATH_OPERATOR, index: number};
    @Output() operatorChange = new EventEmitter<{value: TYPE_MATH_OPERATOR, index: number}>();
    listOfOperators: Array<{name: string, value: string, icon?:string}> = [];

    constructor() { }

    ngOnInit(): void {
        for (let key in TYPE_MATH_OPERATOR_LIST) {
            this.listOfOperators.push({name: TYPE_MATH_OPERATOR_LIST[key].name, value: TYPE_MATH_OPERATOR_LIST[key].type})
        }
    }

    onSelectedOperator(event: any) {
        this.operator.value = TYPE_MATH_OPERATOR[event.value];
        console.log('operator selected', this.operator);
        this.operatorChange.emit(this.operator)
    }

}
