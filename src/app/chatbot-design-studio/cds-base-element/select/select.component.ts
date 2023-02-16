import { FormControl } from '@angular/forms';
import { Component, Input, OnInit, Output, EventEmitter, Type } from '@angular/core';

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
  @Input() control: FormControl = new FormControl()
  @Output() onSelected = new EventEmitter()

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(){
    // console.log('itemselecteddddd', this.itemSelected, this.items, this.bindLabelSelect, this.bindValueSelect)
    // console.log('controlllll', this.control, Object.keys(this.control))// if(this.itemSelected){
  }


  onChangeActionButton(event) {
    //this.logger.log("[ACTION REPLACE BOT] onChangeActionButton event: ", event)
    this.itemSelected = event[this.bindValueSelect];
    this.onSelected.emit(event)
  }

}
