import { ProjectService } from 'app/services/project.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, Input, OnInit } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { Intent } from 'app/models/intent-model';
@Component({
  selector: 'cds-rules-add',
  templateUrl: './rules-add.component.html',
  styleUrls: ['./rules-add.component.scss']
})
export class RulesAddComponent implements OnInit {

  @Input() listOfIntents: Array<Intent>;
  ruleFormGroup: FormGroup

  constructor(private formBuilder: FormBuilder,
              private projectService: ProjectService) { }

  ngOnInit(): void {
    this.ruleFormGroup = this.buildForm();
  }


  buildForm(): FormGroup{
    return this.formBuilder.group({
      uid: [ uuidv4(), Validators.required],
      name: ['', Validators.required],
      when: this.formBuilder.group({
        urlMatches: ['', Validators.required],
        triggerEvery: ['', Validators.required]
      }),
      do: this.formBuilder.array([
        this.formBuilder.group({
          wait: [2, Validators.required]
        }),
        this.formBuilder.group({
          message: this.formBuilder.group({
            text: ['', Validators.required],
            participants: ['', Validators.required],
            attributes: [{subtype: 'info'}, Validators.required]
          })
        })
      ])
    })
  }

  onChangeDelayTime(event){
    console.log('onChangeDelayTime-->', event, this.ruleFormGroup)

  }

  onConditionChange(event){
    console.log('onConditionChange-->', event)
  }

  onChangeTextValue(element: string, text: string){
    if(element === 'name')
      this.ruleFormGroup.patchValue({name: text})
    else if(element ==='message'){
      this.ruleFormGroup.controls['do'][1].patchValue({message: {text: text}})
    }
  }

  submitForm(){
    console.log('formrrrrr', this.ruleFormGroup)
  }

  // getAllIntents(){

  // }

}
