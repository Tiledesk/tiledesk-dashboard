import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'cds-attributes',
  templateUrl: './attributes.component.html',
  styleUrls: ['./attributes.component.scss']
})
export class AttributesComponent implements OnInit {

  @Output() changeAttributes = new EventEmitter();
  @Input() attributes: Array<any>;

  newAttrinute: any = {"key": "", "value": ""};

  constructor() { }

  ngOnInit(): void {
    if(!this.attributes){
      this.attributes = [];
    }
    this.attributes.push(this.newAttrinute);
  }

  onChangeAttributes(attribute: any, index: number){
    console.log('onChangeAttributes:: ', attribute, index);
    if(attribute.key.length>0 || attribute.value.length>0){
      console.log('sto scrivendo:: ');
      this.changeAttributes.emit(this.attributes);
      if (index == this.attributes.length-1){
        this.attributes.push({"key": "", "value": ""});
      }
    } else {

      let that = this;
      this.attributes.forEach(function(item, index, object) {
        if(!item.key && !item.value){
          if (index < that.attributes.length-1){
            object.splice(index, 1);
          }
        }
      });
      // this.attributes.push({"key": "", "value": ""});
      this.changeAttributes.emit(this.attributes);
      console.log('onChangeAttributes:: pop ', this.attributes);
    }
    
  }

}
