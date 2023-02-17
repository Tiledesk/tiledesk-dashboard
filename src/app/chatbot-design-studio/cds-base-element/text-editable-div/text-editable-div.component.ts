import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { SatPopover } from '@ncstate/sat-popover';
import { TiledeskVarSplitter } from 'app/chatbot-design-studio/TiledeskVarSplitter';
import { LoggerService } from 'app/services/logger/logger.service';
import { calculatingRemainingCharacters, TEXT_CHARS_LIMIT } from '../../utils';


@Component({
  selector: 'text-editable-div',
  templateUrl: './text-editable-div.component.html',
  styleUrls: ['./text-editable-div.component.scss']
})
export class TextEditableDivComponent implements OnInit, OnChanges {

  @Input() text: string;
  @Output() textChanged = new EventEmitter();
  @Input() emoijPikerBtn: boolean;
  @Input() setAttributeBtn: boolean;
  @Input() textLimitBtn: boolean;
  @Input() textLimit: number;

  leftCharsText: number;
  alertCharsText: boolean = false;

  minHeightContent: number = 120;

  isOpenSetAttributesPanel: boolean = false

  textVariable: string;
  variableListMock: Array<{ name: string, value: string }> = [
    { name: 'facebook', value: 'facebook' },
    { name: 'email', value: 'email' },
    { name: 'instagram', value: 'instagram' },
    { name: 'variabile1', value: 'valvariabile14' },
    { name: 'userFullName', value: 'userFullName' },
  ]

  intentVariableListMock: Array<{ name: string, value: string }> = [
    { name: 'facebook', value: 'facebook' },
    { name: 'email', value: 'email' },
    { name: 'instagram', value: 'instagram' },
    { name: 'variabile1', value: 'valvariabile14' },
    { name: 'userFullName', value: 'userFullName' },
  ]
  @ViewChild("setattributepopover", { static: false }) setattributepopover : SatPopover;
  
  constructor(
    private logger: LoggerService,
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    if (!this.textLimit || this.textLimit == 0) {
      this.textLimit = TEXT_CHARS_LIMIT;
    }
    this.calculatingRemainingCharacters();
  }


  private calculatingRemainingCharacters() {
    if (this.textLimitBtn) {
      this.leftCharsText = calculatingRemainingCharacters(this.text, this.textLimit);
      console.log('this.leftCharsText::: ', this.textLimit, this.leftCharsText, (this.textLimit / 10));
      if (this.leftCharsText < (this.textLimit / 10)) {
        this.alertCharsText = true;
      } else {
        this.alertCharsText = false;
      }
    }
  }

  ngOnChanges() {
    console.log("[TEXT-EDITABLE-DIV] ngOnChanges: text", this.text);
    // imputEle.focus(imputEle);
    let fommattedActionSubject = this.splitText(this.text);
    let imputEle = this.elementRef.nativeElement.querySelector('#content-editable');
    imputEle.innerHTML = fommattedActionSubject;
    this.placeCaretAtEnd(imputEle);
  }
 

  private splitText(text) {
    const splits = new TiledeskVarSplitter().getSplits(text);
    console.log('[TEXT-EDITABLE-DIV] ngOnChanges splits:', splits)
    let tagName = ''
    let tagNameAsTag = ''
    let newSplitsArray = [];
    let fommattedActionSubject = ''
    splits.forEach(element => {
      if (element.type === 'tag') {
        tagName = '${' + element.name + '}';
        tagNameAsTag = `<div tag="true" contenteditable="false"  style=" font-weight: 400;font-family: 'ROBOTO'; background: #ffdc66;cursor: pointer;-webkit-transition: all 0.3s;  transition: all 0.3s; border-radius: 10px;-webkit-box-decoration-break: clone; box-decoration-break: clone; display: inline; padding: 0 5px;">${tagName}</div>`
        newSplitsArray.push(tagNameAsTag)
      } else if (element.type === 'text') {
        newSplitsArray.push(element.text)
      }
    });
    console.log('[TEXT-EDITABLE-DIV]  fommattedActionSubject', fommattedActionSubject);
    console.log('[TEXT-EDITABLE-DIV]  newSplitsArray', newSplitsArray);
    newSplitsArray.forEach(element => {
      fommattedActionSubject += element
    });
    return fommattedActionSubject;
  }


  placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
      var range = document.createRange();
      console.log('placeCaretAtEnd range ', range ) 
      range.selectNodeContents(el);
      
      range.collapse(false);
      var sel = window.getSelection();
      console.log('placeCaretAtEnd sel ', sel ) 
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  openSetattributePopover() {
    console.log('openSetattributePopover setattributepopover  ',  this.setattributepopover)
    this.setattributepopover.open()
    let imputEle = this.elementRef.nativeElement.querySelector('#content-editable');
    this.placeCaretAtEnd(imputEle);
  }

  setAttribute(attribute) {
    console.log("[TEXT-EDITABLE-DIV] selectedAttibute attribute: ", attribute);
    // const imputEle = document.querySelector('#email-subject') as HTMLElement
    const imputEle = this.elementRef.nativeElement.querySelector('#content-editable')
    console.log("[TEXT-EDITABLE-DIV] selectedAttibute imputEle: ", imputEle);
    imputEle.focus();
    this.setAttributeAtCaret(`<div contenteditable="false" style="font-weight: 400;font-family: 'ROBOTO'; background: #ffdc66;cursor: pointer;-webkit-transition: all 0.3s;  transition: all 0.3s; border-radius: 10px;-webkit-box-decoration-break: clone; box-decoration-break: clone; display: inline; padding: 0 5px;">${attribute}</div>`)
    this.isOpenSetAttributesPanel = false;
    this.onInput()
  }

  onAddCustomAttribute() { }

  onChangeSearch($event) { }
  // background: #ffdc66;
  onVariableSelected(variable) {
    console.log("[TEXT-EDITABLE-DIV] selectedAttibute attribute: ", variable);
    let attribute = '${' + variable.value + '}'
    // const imputEle = document.querySelector('#email-subject') as HTMLElement
    const imputEle = this.elementRef.nativeElement.querySelector('#content-editable')
    console.log("[TEXT-EDITABLE-DIV] selectedAttibute imputEle: ", imputEle);
    this.setattributepopover.close()
    // setTimeout(() => {
      
    // }, 500);

    imputEle.focus();
    this.placeCaretAtEnd(imputEle);
    this.setAttributeAtCaret(`<div tag="true" contenteditable="false" style="font-weight: 400;font-family: 'ROBOTO'; cursor: pointer;-webkit-transition: all 0.3s;  transition: all 0.3s; border-radius: 10px;-webkit-box-decoration-break: clone; box-decoration-break: clone; display: inline; padding: 0 5px;">${attribute}</div>`)
    // this.isOpenSetAttributesPanel = false;
    
    setTimeout(() => { 
      this.setCaret(imputEle);
    }, 500);
    
    this.onInput()
  }

  setCaret(imputEle) {
    // var el = document.getElementById("editable")
    var el =  imputEle
    var range = document.createRange()
    var sel = window.getSelection()
    
    range.setStart(el.childNodes[2], 5)
    range.collapse(true)
    
    sel.removeAllRanges()
    sel.addRange(range)
}


  setAttributeAtCaret(html: any) {
    var sel, range;
    if (window.getSelection) {
      // IE9 and non-IE
      sel = window.getSelection();
      if (sel.getRangeAt && sel.rangeCount) {
        range = sel.getRangeAt(0);
        range.deleteContents();

        // Range.createContextualFragment() would be useful here but is
        // only relatively recently standardized and is not supported in
        // some browsers (IE9, for one)
        var el = document.createElement("div");
        el.innerHTML = html;
        var frag = document.createDocumentFragment(), node, lastNode;
        while ((node = el.firstChild)) {
          lastNode = frag.appendChild(node);
        }
        // var firstNode = frag.firstChild;
        range.insertNode(frag);

        // Preserve the selection
        if (lastNode) {
          range = range.cloneRange();
          range.setStartAfter(lastNode);
          range.collapse(true);
          // if (selectPastedContent) {
          //     range.setStartBefore(firstNode);
          // } else {
          //     range.collapse(true);
          // }
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }

  }

  // 
  onInput() {
    let imputEle = this.elementRef.nativeElement.querySelector('#content-editable') //document.querySelector('[contenteditable]'),  //document.querySelector('[contenteditable]'),
    // text = contenteditable.textContent;


    // for (let i = 0; i < text.length; i++) {
    //   let code = text.charCodeAt(i);
    //   console.log('text --->>> ', code)
    // }

    // console.log('[TEXT-EDITABLE-DIV] contenteditable innerHtml', contenteditable.innerHTML)

    // console.log('[TEXT-EDITABLE-DIV] onInput text ', text)
    // // this.text = text;
    // this.textChanged.emit(text)





    if (this.textLimitBtn && imputEle.textContent.length > this.textLimit) {
      imputEle.textContent = imputEle.textContent.substring(0, this.textLimit);
      let fommattedActionSubject = this.splitText(imputEle.textContent);
      imputEle.innerHTML = fommattedActionSubject;
      this.placeCaretAtEnd(imputEle);
    }
    this.calculatingRemainingCharacters();
    this.text = imputEle.textContent;
    console.log('[TEXT-EDITABLE-DIV] onInputActionSubject text ', this.text);
    this.textChanged.emit(this.text);
    
  }

  toggleSetAttributesPanel(isopen) {
    console.log("[TEXT-EDITABLE-DIV] toggleSetAttributesPanel - isopen Attributes Panel: ", isopen);
    this.isOpenSetAttributesPanel = isopen
  }

  onBlur() {
    console.log("[TEXT-EDITABLE-DIV] onBlur isOpenSetAttributesPanel ", this.isOpenSetAttributesPanel);
    // if (this.isOpenSetAttributesPanel === true) {
    //   this.isOpenSetAttributesPanel = false;
    // }
  }



}
