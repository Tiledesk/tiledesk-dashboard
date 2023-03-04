import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

@Component({
  selector: 'cds-attributes',
  templateUrl: './attributes.component.html',
  styleUrls: ['./attributes.component.scss']
})
export class AttributesComponent implements OnInit {

  @Output() changeAttributes = new EventEmitter();
  @Input() attributes: string;

  newAttributes: Array<any> = [];

  constructor() { }

  ngOnInit(): void {
    let that = this;
    let parseAttributes = {};
    if(this.isValidJson(this.attributes)){
      parseAttributes = JSON.parse(this.attributes);
    }
    // console.log('AttributesComponent:: ', parseAttributes);
    Object.keys(parseAttributes).forEach(key => {
      // console.log(key); // 👉️ name, country
      // console.log(this.attributes[key]); // 👉️ James, Chile
      const newAtt = {"key":key, "value": parseAttributes[key]};
      this.newAttributes.push(newAtt);
    });
    this.newAttributes.push({key:"", value:""});
  }


  private isValidJson(json) {
    try {
      JSON.parse(json);
      return true;
    } catch (e) {
      return false;
    }
  }

  onChangeAttributes(attribute: any, index: number){
    let that = this;
    // console.log('onChangeAttributes:: ', attribute, index);
    if(attribute.key.length>0 || attribute.value.length>0){
      //console.log('sto scrivendo:: ');
      if (index == this.newAttributes.length-1){
        this.newAttributes.push({key:"", value:""});
      }
    } else {
      this.newAttributes.forEach(function(item, index, object) {
        if(!item.key && !item.value){
          if (index < that.newAttributes.length-1){
            object.splice(index, 1);
          }
        }
      });
    }
    let attributes = {};
    this.newAttributes.forEach(function(item) {
      if(item.key || item.value){
        attributes[item.key] = item.value;
      }
    });
    this.attributes = JSON.stringify(attributes);
    // console.log("------- >>>> ", this.attributes);
    this.changeAttributes.emit(this.attributes);
  }

}
