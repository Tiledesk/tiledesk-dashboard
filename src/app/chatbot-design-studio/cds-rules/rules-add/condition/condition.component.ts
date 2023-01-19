import { Component, Input, OnInit, EventEmitter, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';

@Component({
  selector: 'rule-condition',
  templateUrl: './condition.component.html',
  styleUrls: ['./condition.component.scss']
})
export class ConditionComponent implements OnInit {

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

  constructor(private rootFormGroup: FormGroupDirective,) { }

  ngOnInit(): void {
    this.conditionsForm = this.rootFormGroup.control.get('when') as FormGroup;

  }

}
