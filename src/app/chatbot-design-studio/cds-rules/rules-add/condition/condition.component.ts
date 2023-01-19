import { Component, Input, OnInit, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';

@Component({
  selector: 'rule-condition',
  templateUrl: './condition.component.html',
  styleUrls: ['./condition.component.scss']
})
export class ConditionComponent implements OnInit {

  // @Input() condition: string;
  @Input() condition: FormControl;
  @Output() onChangeCondtion = new EventEmitter<string>();

  labelPosition: string;
  regexOption: string = 'starts';
  text: string;
  conditionsForm: FormGroup;
  
  chips: Array<{name: string, value: number, selected: boolean}> = [
    {name: '6h', value: 6, selected: false},
    {name: '12h', value: 12,selected: false},
    {name: '18h', value: 18,selected: false},
    {name: '24h', value: 24,selected: false},
    {name: 'always', value: -1,selected: false}
  ];

  conditions: Array<{name: string, value: string, checked: boolean}> = [
    {name: 'starts', value: 'starts', checked: true},
    {name: 'ends', value: 'ends',checked: false},
    {name: 'contains', value: 'contains',checked: false},
    {name: 'custom', value: 'custom',checked: false},
  ]

  keywords = ['angular', 'how-to', 'tutorial', 'accessibility'];
  formControl = new FormControl(['angular']);

  constructor(private rootFormGroup: FormGroupDirective,) { }

  ngOnInit(): void {
    this.conditionsForm = this.rootFormGroup.control.get('when') as FormGroup;
    console.log('changessss', this.conditionsForm)

  }

  onRadioButtonChange(event){
    console.log('radio selectedddd-->', event)
    this.regexOption = event.value
    this.conditionsForm.patchValue({'urlMatches': this.buildRegex(this.regexOption, this.text)})
    // this.onChangeCondtion.next(event.value)
  }

  onChangeText(text: string){
    console.log('text changedd-->', text)
    if(text){
      this.text = text;
      this.conditionsForm.patchValue({'urlMatches': this.buildRegex(this.regexOption, text)})
    }
    console.log('onChangeText form', this.conditionsForm)
  }


  onClickChip(chip, index: number){
    this.chips.forEach(el => {
      if(el.name === chip.name)
        el.selected = true
      else
        el.selected = false
    })
    this.conditionsForm.patchValue({'triggerEvery': chip.value})
    console.log('onClickChip form', this.conditionsForm)
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
      regex = text
    }

    return regex
  }

}
