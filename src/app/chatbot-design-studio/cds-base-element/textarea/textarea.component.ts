import { FormControl } from '@angular/forms';
import { Component, OnInit, ViewChild, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { calculatingRemainingCharacters, TEXT_CHARS_LIMIT, variableList } from 'app/chatbot-design-studio/utils';
import { SatPopover } from '@ncstate/sat-popover';
import { LoggerService } from 'app/services/logger/logger.service';

@Component({
  selector: 'cds-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss']
})
export class CDSTextareaComponent implements OnInit {

  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  @ViewChild("addVariable") addVariable: SatPopover;

  @Input() text: string = '';
  @Input() limitCharsText: number = TEXT_CHARS_LIMIT;
  @Input() textMessage: string;
  @Input() control: FormControl = new FormControl();
  @Input() showUtils: boolean = true;
  @Input() emoijPikerBtn: boolean = true;
  @Input() setAttributeBtn: boolean = true;
  @Input() textLimitBtn: boolean = true;
  @Input() minRow: number = 2;
  @Input() maxRow: number = 20;
  @Input() readonly: boolean = false;
  @Input() popoverVerticalAlign: string = 'below'

  @Output() onChange = new EventEmitter();
  @Output() onSelected = new EventEmitter();

  // Textarea //
  leftCharsText: number;
  alertCharsText: boolean;
  elTextarea: HTMLInputElement;
  addWhiteSpaceBefore: boolean;
  cannedResponseMessage: string;
  texareaIsEmpty = false;

  constructor(
    private logger: LoggerService
  ) { }

  ngOnInit(): void {
    this.initialize();
  }

  initialize(){
    if (this.text) {
      this.control.patchValue(this.text)
    } else {
      this.text = this.control.value
    }
    this.leftCharsText = calculatingRemainingCharacters(this.text, this.limitCharsText);
    if (this.leftCharsText < (this.limitCharsText / 10)) {
      this.alertCharsText = true;
    } else {
      this.alertCharsText = false;
    }
  }

  /** */
  onChangeTextarea(event) {
    this.logger.log('[CDS-TEXAREA] onChangeTextarea-->', event)
    // if (event) {
      // this.text = event.trim();
      this.leftCharsText = calculatingRemainingCharacters(this.text, this.limitCharsText);
      if (this.leftCharsText < (this.limitCharsText / 10)) {
        this.alertCharsText = true;
      } else {
        this.alertCharsText = false;
      }
      // this.logger.log('[CDS-TEXAREA] - event ', event.length);
      // this.logger.log('[CDS-TEXAREA] - this.textent  ',  this.text);
      // this.logger.log('[CDS-TEXAREA] - this.textent length',  this.text.length); 
      this.text = event;
      this.onChange.emit(this.text);
    // }
  }

  ngAfterViewInit() {
    this.getTextArea();
  }

  openSetattributePopover() {
    this.elTextarea = this.autosize['_textareaElement'] as HTMLInputElement;
    this.elTextarea.focus()
  }


  getTextArea() {
    this.elTextarea = this.autosize['_textareaElement'] as HTMLInputElement;
    this.logger.log('[CDS-TEXAREA] - GET TEXT AREA - elTextarea ', this.elTextarea);
    if (this.elTextarea) {}
  }



  onVariableSelected(variableSelected: { name: string, value: string }) {
    this.logger.log('variableSelectedddd', variableSelected);
    if (this.elTextarea) {
      this.elTextarea.focus()
      // this.insertAtCursor(this.elTextarea, '${' + variableSelected.value + '}')
      this.insertAtCursorPos(this.elTextarea, '${' + variableSelected.value + '}')
      this.onChangeTextarea(this.elTextarea.value)
      this.addVariable.close()
      this.onSelected.emit(variableSelected)
    }
  }


  insertAtCursorPos(elem: HTMLInputElement, attribute) {
    // var cursor_pos = $("#text-area").prop('selectionStart');
    // var textarea_txt = $("#text-area").val();
    // var txt_to_add = value;
    // $("#text-area").val(textarea_txt.substring(0, cursor_pos) + txt_to_add + textarea_txt.substring(cursor_pos));
    // $("#text-area").focus();
    // $('#text-area').prop('selectionEnd', cursor_pos + txt_to_add.length);

    let cursor_pos = elem.selectionStart;
    var textarea_txt = elem.value;
    var txt_to_add = attribute;
    elem.value = textarea_txt.substring(0, cursor_pos) + txt_to_add + textarea_txt.substring(cursor_pos)
    elem.focus()
    elem.selectionEnd = cursor_pos + txt_to_add.length
  }



  @HostListener('document:keydown', ['$event'])
  onKeyPress(event) {
    const keyCode = event.which || event.keyCode;
    if (keyCode === 27) { // Esc keyboard code
      this.addVariable.close()
    }
  }



}