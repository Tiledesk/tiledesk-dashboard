import { Form } from './../../../models/intent-model';
import { FormControl, FormControlName, FormGroup } from '@angular/forms';
import { Component, Input, OnInit, Output, EventEmitter, ViewChild, ElementRef, Type, Optional } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'cds-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent implements OnInit {
  @ViewChild('ngSelect', { static: true }) ngSelect: NgSelectComponent;

  @Input() items: []
  @Input() itemSelected: any
  @Input() bindLabelSelect: string;
  @Input() optionalBindAdditionalText: string; 
  @Input() optionalBindDescription: string; 
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

  onResetValue(){
    this.itemSelected = null
    this.onSelected.emit(null)
  }

  onOpen(){
  }

  onClose(){
    this.ngSelect.blur();
  }

}
