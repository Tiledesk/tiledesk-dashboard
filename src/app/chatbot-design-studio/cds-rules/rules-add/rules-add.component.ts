import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Component, Input, OnInit, SimpleChanges, ElementRef, ViewChild, EventEmitter, Output } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { Intent } from 'app/models/intent-model';
import { Chatbot } from 'app/models/faq_kb-model';
import { FaqKbService } from 'app/services/faq-kb.service';
import { Rule } from 'app/models/rule-model';

@Component({
  selector: 'cds-rules-add',
  templateUrl: './rules-add.component.html',
  styleUrls: ['./rules-add.component.scss']
})
export class RulesAddComponent implements OnInit {

  @Input() listOfIntents: Array<Intent>;
  @Input() selectedRule: Rule
  @Input() selectedChatbot: Chatbot;
  @Input() addMode: boolean = true
  @Output() onRuleAdded = new EventEmitter<Rule>();

  
  ruleFormGroup: FormGroup
  autocompleteOptions: Array<string> = [];

  constructor(private formBuilder: FormBuilder,
              private el: ElementRef,
              private faqkbService: FaqKbService) { }

  ngOnInit(): void {
    this.ruleFormGroup = this.buildForm();
    if(this.selectedRule){
      this.setFormValue()
    }
  }

  ngOnChanges(changes: SimpleChanges){
    if(this.listOfIntents){
      this.listOfIntents.forEach(value => this.autocompleteOptions.push('/'+value.intent_display_name))
    }
  }

  buildForm(): FormGroup{
    return this.formBuilder.group({
      uid: [ uuidv4(), Validators.required],
      name: ['', Validators.required],
      description: ['', Validators.nullValidator],
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
            participants: [['bot_'+this.selectedChatbot._id], Validators.required],
            attributes: [{subtype: 'info'}, Validators.required]
          })
        })
      ])
    })
  }

  setFormValue(){
    this.ruleFormGroup.patchValue({
      uid: this.selectedRule.uid,
      name: this.selectedRule.name,
      description: this.selectedRule.description,
      when: {
        urlMatches : this.selectedRule.when.urlMatches,
        triggerEvery: this.selectedRule.when.triggerEvery
      },
      do: [
        { wait: this.selectedRule.do[0].wait},
        { message: {
            text: this.selectedRule.do[1].message['text']
          }
        }
      ]
    })
  }

  onChangeDelayTime(number: number){
    console.log('onChangeDelayTime-->', number)
    let array = this.ruleFormGroup.controls['do'] as FormArray;
    array.at(0).patchValue({wait: number})

  }

  onConditionChange(event){
    console.log('onConditionChange-->', event)
    
  }

  onChangeTextValue(element: string, text: string){
    if(element === 'name')
      this.ruleFormGroup.patchValue({name: text})
    else if(element ==='message'){
      let array = this.ruleFormGroup.controls['do'] as FormArray;
      array.at(1).patchValue({message: { text: text}})
      // <FormArray>this.ruleFormGroup.controls['do'][1].patchValue({message: {text: text}})
    }
  }

  submitForm(){
    console.log('formrrrrr', this.ruleFormGroup)

    const pendingClassName = 'loading-btn--pending';
    const successClassName = 'loading-btn--success';
    const failClassName    = 'loading-btn--fail';
    const stateDuration = 1500;
    if(this.ruleFormGroup.valid){
      const rule = [this.ruleFormGroup.value]
      const rules: Rule[] = [ ...this.selectedChatbot.attributes['rules'] as Rule[], ...rule]
      const button = this.el.nativeElement.querySelector('#create-rule-form')
     
      //PENDING STATE
      button.classList.add(pendingClassName)

      this.faqkbService.addRuleToChatbot(this.selectedChatbot._id, rules).subscribe((data)=> {
        
        if(data){
          //SUCCESS STATE
          setTimeout(() => {
            button.classList.remove(pendingClassName);
            button.classList.add(successClassName);
          
            window.setTimeout(() => button.classList.remove(successClassName), stateDuration);
          }, stateDuration);

          this.onRuleAdded.emit(rule[0])
        }

      }, (error)=> {
        //FAIL STATE
        setTimeout(() => {
          button.classList.remove(pendingClassName);
          button.classList.add(failClassName);
        
          window.setTimeout(() => button.classList.remove(failClassName), stateDuration);
        }, stateDuration);

      }, ()=>{

      })
    }
    
    

   

   

    
    

    

    
  }

  closePanel(event){
    console.log('clonsePanellll', event)
    event.stopPropagation();
    event.preventDefault();
  }

  openPanel(event){

  }

  // getAllIntents(){

  // }

}
