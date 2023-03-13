import { ActionAssignVariable, Operand } from './../../../../../models/intent-model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

    actionAssignFormGroup: FormGroup;
    variables: Array<string> = []
    hasSelectedVariable: boolean = false

    constructor(
        private formBuilder: FormBuilder,
        private logger: LoggerService,
    ) { }

    ngOnInit(): void {
    }

    ngOnChanges() {
        this.initialize()
        if (this.action && this.action.destination) {
            this.setFormValue()
            this.hasSelectedVariable = true
        }
    }

    private initialize() {
        this.actionAssignFormGroup = this.buildForm();
        this.actionAssignFormGroup.valueChanges.subscribe(form => {
            this.logger.log('[ACTION-ASSIGN-VARIABLE] form valueChanges-->', form)
            if (form && (form.destination !== '')) {
                this.action.destination = form.destination
            }

        })
    }

    buildForm(): FormGroup {
        return this.formBuilder.group({
            destination: ['', [Validators.required, Validators.pattern(new RegExp(/^[a-zA-Z_]*[a-zA-Z_]+[a-zA-Z0-9_]*$/gm))]]
        })
    }

    setFormValue() {
        this.actionAssignFormGroup.patchValue({
            destination: this.action.destination
        })
    }

    clearInput() {
        this.actionAssignFormGroup.get('destination').reset()
        this.hasSelectedVariable = false
    }


    onVariableSelected(variableSelected: { name: string, value: string }, step: number) {
        this.logger.log('onVariableSelected-->', step, this.actionAssignFormGroup, variableSelected)
        this.hasSelectedVariable = true
        this.actionAssignFormGroup.patchValue({ destination: variableSelected.value })// if(step === 0){
    }

    onOperatorSelected() {
        let temp = this.action.operation
 
        this.action.operation.operators.push(TYPE_MATH_OPERATOR['addAsNumber'])
        this.action.operation.operands.push(new Operand());

        this.action.operation = Object.assign({}, temp)
    }
}
