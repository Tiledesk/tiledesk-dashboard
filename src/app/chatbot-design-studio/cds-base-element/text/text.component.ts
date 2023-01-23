import { Component, Input, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'cds-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class CDSTextComponent implements OnInit {

  // @Input() textMessage: string;
  @Input() control: FormControl<string> = new FormControl()
  @Input() text: string;
  @Input() customPrefix: string;
  @Input() limitCharsText: number = 200;
  @Input() autocompleteOptions: string[] = [];
  @Output() change = new EventEmitter<string>();
  
  filteredOptions: Observable<string[]>;
  constructor() { }

  ngOnInit(): void {
    if(this.text){
      this.control.patchValue(this.text)
    }else{
      this.text = this.control.value
    }
    this.filteredOptions = this.control.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );
  }

  onChangeText(text: string){
    this.text = text
    this.change.emit(text)
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.autocompleteOptions.filter(option => option.toLowerCase().includes(filterValue));
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
