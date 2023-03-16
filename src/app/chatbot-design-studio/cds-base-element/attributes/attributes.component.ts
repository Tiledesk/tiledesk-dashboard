import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { TYPE_METHOD_ATTRIBUTE } from 'app/chatbot-design-studio/utils';
@Component({
  selector: 'cds-attributes',
  templateUrl: './attributes.component.html',
  styleUrls: ['./attributes.component.scss']
})
export class AttributesComponent implements OnInit {

  @Output() changeAttributes = new EventEmitter();
  @Input() attributes: any;
  @Input() method: any;

  newAttributes: Array<any> = [];
  typeMethodAttribute = TYPE_METHOD_ATTRIBUTE;

  constructor() { }

  ngOnInit(): void {
    // this.initialize();
  }


  ngOnChanges() {
    this.initialize();
  }


  private initialize(){
    this.newAttributes = [];
    try {
      Object.keys(this.attributes).forEach(key => {
        // console.log(key, this.attributes[key]);
        const newAtt = {"key":key, "value": this.attributes[key]};
        this.newAttributes.push(newAtt);
      });
    } catch (error) {
      // console.log("error: ", error);
    }
    this.newAttributes.push({key:"", value:""});
    if(!this.method){
      this.method = TYPE_METHOD_ATTRIBUTE.TEXT;
    }
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
    if(attribute.key.length>0 || attribute.value.length>0){
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
    this.setChangedAttributes();
  }

  private setChangedAttributes(){
    let attributes = {};
    this.newAttributes.forEach(function(item) {
      if(item.key || item.value){
        attributes[item.key] = item.value;
      }
    });
    // this.attributes = JSON.stringify(attributes);
    // console.log("------- >>>> ", this.attributes);
    this.changeAttributes.emit(attributes);
  }

  onClearInput(index){
    // console.log('onClearInput:: ',this.newAttributes, index);
    if(!this.newAttributes[index].value){
      this.newAttributes.splice(index, 1);
    } else {
      this.newAttributes[index].key = '';
    }
  }
  
  onVariableSelected(variableSelected: {name: string, value: string}, index: number){
    this.newAttributes[index].key = variableSelected.value;
    if(!this.newAttributes[index].value){
      this.newAttributes.push({key:"", value:""});
    }
    // this.onChangeAttributes(variableSelected, index);
  }

}
