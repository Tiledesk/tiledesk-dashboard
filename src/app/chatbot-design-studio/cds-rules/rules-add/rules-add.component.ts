import { LoggerService } from 'app/services/logger/logger.service';
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
              private logger: LoggerService,
              private el: ElementRef,
              private faqkbService: FaqKbService) { }

  ngOnInit(): void {
    this.ruleFormGroup = this.buildForm();
    this.ruleFormGroup.valueChanges.subscribe(form => {
      this.logger.debug('[RULES-ADD] ruleFormGroup changed-->', form)
      if(form && (form.when.regexOption !== '' || form.when.text !== '')){
        this.ruleFormGroup.controls['when'].patchValue({'urlMatches': this.buildRegex(form.when.regexOption, form.when.text)}, {emitEvent: false})
      }
    })
    if(this.selectedRule){
      this.logger.debug('[RULES-ADD] selectedRule-->', this.selectedRule)
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
        regexOption: ['starts', Validators.required],
        text: ['', Validators.required],
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

  buildRegex(option: string, text: string): string{
    let regex = text
    if(option === 'starts'){
      regex = '^(' + text + ').*' 
    }else if (option === 'ends'){
      regex = '^.*(' + text + ')$'
    }else if(option === 'contains'){
      regex = '^.*(' + text + ').*$'
    }else if(option === 'custom'){
      regex = '/' + text + '/'
    }
    return regex
  }

  setFormValue(){
    this.ruleFormGroup.patchValue({
      uid: this.selectedRule.uid,
      name: this.selectedRule.name,
      description: this.selectedRule.description,
      when: {
        regexOption: this.selectedRule.when.regexOption,
        text: this.selectedRule.when.text,
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

  onConditionChange(event){
    console.log('onConditionChange-->', event)
    
  }

  submitForm(){
    this.logger.debug('[RULES-ADD] submitForm-->', this.ruleFormGroup)

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
        this.logger.debug('[RULES-ADD] faqkbService addRuleToChatbot - ERROR:', error)
      }, ()=>{
        this.logger.debug('[RULES-ADD] faqkbService addRuleToChatbot - COMPLETE')
      })
    }
        
  }

  closePanel(event){
    // event.stopPropagation();
    // event.preventDefault();
  }

  openPanel(event){
    // console.log('opennnn', event)
  }

}
