import { Form } from './../../../models/intent-model';
import { FormControl, FormControlName, FormGroup, FormGroupDirective } from '@angular/forms';
import { Component, Input, OnInit, Output, EventEmitter, Type, Optional } from '@angular/core';

@Component({
  selector: 'cds-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent implements OnInit {


  @Input() items: []
  @Input() itemSelected: any
  @Input() bindLabelSelect: string;
  @Input() bindValueSelect: string;
  @Input() clearable: boolean = false;
  @Input() placeholder: string = 'Select an option'
  @Input() formGroup: FormGroup = new FormGroup({ select: new FormControl()});
  @Input() formControlName: string = 'select';
  @Output() onSelected = new EventEmitter()

  valueFormGroup: FormGroup 
  
  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(){
    if(this.itemSelected && this.items){
    //   console.log('itemmmm selectedddd-->', this.itemSelected, this.items)
    //   this.itemSelected = this.items.find(el => el[this.bindValueSelect] === this.itemSelected)
      this.itemSelected = this.items.find(el => el[this.bindValueSelect] === this.itemSelected)[this.bindValueSelect]
    }
  }

  onChangeActionButton(event) {
    // console.log("[SELECT BASE ELEMENT] onChangeActionButton event: ", event, this.items)
    // this.itemSelected = event;
    if(event){
      this.itemSelected = event[this.bindValueSelect];
    }
    this.onSelected.emit(event)
  }

}
