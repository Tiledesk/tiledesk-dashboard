import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'rule-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class TextComponent implements OnInit {

  @Input() textMessage: string;
  @Input() customPrefix: string;
  // @Input() control: FormControl = new FormControl();
  @Input() limitCharsText: number = 200;
  @Output() onChange = new EventEmitter<string>();
  
  constructor() { }

  ngOnInit(): void {

  }

  onChangeText(text: string){
    this.textMessage = text
    this.onChange.emit(text)
  }


  onDeleteResponse(){
    // this.deleteResponse.emit(this.index);
  }

  /** */
  onMoveUpResponse(){
    // this.moveUpResponse.emit(this.index);
  }

  /** */
  onMoveDownResponse(){
    // this.moveDownResponse.emit(this.index);
  }

}
