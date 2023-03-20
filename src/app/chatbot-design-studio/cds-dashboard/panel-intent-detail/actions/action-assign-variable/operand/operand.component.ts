import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TYPE_FUNCTION_LIST } from 'app/chatbot-design-studio/utils';
import { Operand } from 'app/models/intent-model';


@Component({
    selector: 'operand',
    templateUrl: './operand.component.html',
    styleUrls: ['./operand.component.scss']
})
export class OperandComponent implements OnInit {

    @Input() operand: Operand;
    
    operandForm: FormGroup;
    listOfFunctions: Array<{name: string, value: string, icon?:string}> = [];
    openSlectFunction: boolean;

    constructor(private formBuild: FormBuilder) {}

    ngOnInit(): void {
        this.openSlectFunction = false;
        for (let key in TYPE_FUNCTION_LIST) {
            this.listOfFunctions.push({name: TYPE_FUNCTION_LIST[key].name, value: TYPE_FUNCTION_LIST[key].type})
        }
    }

    //to do validate form
    createOperandGroup(): FormGroup {
        return this.formBuild.group({
            value: ['', Validators.required],
            isVariable: [false],
            function: [null, Validators.nullValidator]
        })        
    }

    ngOnChanges() {
        this.operandForm = this.createOperandGroup();
        this.operandForm.valueChanges.subscribe(data => {
            
            if(data.value !== '') {
                this.operand.value = data.value;
                this.operand.isVariable = data.isVariable;
            }

            if (data.function !== null) {
                this.operand.function = data.function;
            }
        })

        if (this.operand) {
            this.operandForm.patchValue(this.operand);
        }
    }

    onChangeTextArea(text: string) {
        if(text && text.match(new RegExp(/(?<=\$\{)(.*)(?=\})/g))){
            text = text.replace(text, text.match(new RegExp(/(?<=\$\{)(.*)(?=\})/g))[0])
            this.operandForm.get('value').setValue(text)
            this.operandForm.get('isVariable').setValue(true)
        }
    }   

    clearInput(){
        this.operandForm.get('value').setValue('')
        this.operandForm.get('isVariable').setValue(false)
    }

    onSelectedFunction(event: any) {
        this.operandForm.get('function').setValue(event.value)
    }

    onToggleSelectFunction(){
        this.openSlectFunction = !this.openSlectFunction;
    }

}
