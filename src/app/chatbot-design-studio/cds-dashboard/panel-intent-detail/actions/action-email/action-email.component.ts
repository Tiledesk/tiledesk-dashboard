import { ActionEmail } from 'app/models/intent-model';
import { Component, OnInit, Input, ElementRef, HostListener, OnChanges } from '@angular/core';
import { TEXT_CHARS_LIMIT } from './../../../../utils';
import { LoggerService } from 'app/services/logger/logger.service';
import { HtmlEntitiesEncodePipe } from 'app/html-entities-encode.pipe';
import { TiledeskVarSplitter } from '../../../../TiledeskVarSplitter';


@Component({
  selector: 'cds-action-email',
  templateUrl: './action-email.component.html',
  styleUrls: ['./action-email.component.scss']
})
export class ActionEmailComponent implements OnInit, OnChanges {

  @Input() action: ActionEmail;

  email_error: boolean = false;
  isOpenSetAttributesPanel: boolean = false
  // intents = ['uno', 'due', 'tre'];


  constructor(
    private logger: LoggerService,
    private eRef: ElementRef
  ) { }

  ngOnInit(): void {
    this.logger.log("[ACTION-EMAIL] elementSelected: ", this.action)
  }

  ngOnChanges() {
    console.log("[ACTION-EMAIL] ngOnChanges: this.action", this.action)
    const splits = new TiledeskVarSplitter().getSplits(this.action.subject);
    console.log('[ACTION-EMAIL] ngOnChanges splits:', splits)
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
    console.log('[ACTION-EMAIL]  newSplitsArray', newSplitsArray)

    newSplitsArray.forEach(element => {
      fommattedActionSubject += element

    });
    console.log('[ACTION-EMAIL]  fommattedActionSubject', fommattedActionSubject)

    let imputEle = document.getElementById('email-subject') as HTMLElement
    imputEle.innerHTML = fommattedActionSubject;
    // imputEle.focus(imputEle);
    this.placeCaretAtEnd(imputEle)

  }

  placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
      var range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }

   
  }


  onChangeActionButton(event) {
    //this.logger.log("event: ", event)
  }

  onToChange(event) {
    this.logger.log("[ACTION-EMAIL] onToChange event: ", event);
    this.action.to = event;
  }

  // https://stackoverflow.com/questions/45686432/need-to-add-tags-and-normal-text-in-same-input-box
  // http://jsfiddle.net/timdown/jwvha/527/


  setAttribute(attribute) {
    console.log("[ACTION-EMAIL] selectedAttibute attribute: ", attribute);
    const imputEle = document.querySelector('#email-subject') as HTMLElement
    console.log("[ACTION-EMAIL] selectedAttibute imputEle: ", imputEle);
    imputEle.focus();
    this.setAttributeAtCaret(`<div contenteditable="false" style="font-weight: 400;font-family: 'ROBOTO'; background: #ffdc66;cursor: pointer;-webkit-transition: all 0.3s;  transition: all 0.3s; border-radius: 10px;-webkit-box-decoration-break: clone; box-decoration-break: clone; display: inline; padding: 0 5px;">${attribute}</div>`)
    this.isOpenSetAttributesPanel = false;
    this.onInputActionSubject()
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

  onInputActionSubject() {
    var contenteditable = document.querySelector('[contenteditable]'),
      text = contenteditable.textContent;

    console.log('contenteditable innerHtml', contenteditable.innerHTML)

    console.log('onInputActionSubject text ', text)
    this.action.subject = text;
    console.log('onInputActionSubject action ', this.action)
  }

  toggleSetAttributesPanel(isopen) {
    console.log("[ACTION-EMAIL] isopen Attributes Panel: ", isopen);
    this.isOpenSetAttributesPanel = isopen
  }

  // @HostListener('document:click', ['$event'])
  // clickout(event) {
  //   console.log("[ACTION-EMAIL] clickout event: ", event)
  //   console.log("[ACTION-EMAIL] clickout event target id: ", event.target.id)


  // if (event.target.id.startsWith("set--attribrute") || event.target.classList.contains('text-editor-insert-attribute') || event.target.classList.contains('material-icons-data-object')) {
  //   console.log("[ACTION-EMAIL] clickout : clicked inside")

  // } else {
  //   console.log("[ACTION-EMAIL] clickout : clicked outside")
  //   this.isOpenSetAttributesPanel = false
  // }

  // if (this.eRef.nativeElement.contains(event.target)) {
  //   console.log("[ACTION-EMAIL] clickout : clicked inside")
  // } else {
  //   if (!event.target.id.startsWith("set--attribrute") || (event.target.id !== "") ) {
  //     console.log("[ACTION-EMAIL] clickout : clicked outside")
  //     this.isOpenSetAttributesPanel = false
  //   }
  // }
  // }



  // -----------------------------------------
  // Not used 
  // -----------------------------------------
  mouseUp() {
    console.log("[ACTION-EMAIL] mouseUp: ");
    const imputEle = document.querySelector('#' + 'email-subject') as HTMLElement
    const caretPositon = this.getCaretCharacterOffsetWithin(imputEle)
    console.log("[ACTION-EMAIL] mouseUp caretPositon: ", caretPositon);
  }

  onKeyUp(event) {
    // console.log("[ACTION-EMAIL] action: ", this.action);
    console.log("[ACTION-EMAIL] onKeyUp: ", event);
    const imputEle = document.querySelector('#' + 'email-subject') as HTMLElement
    const caretPositon = this.getCaretCharacterOffsetWithin(imputEle)
    console.log("[ACTION-EMAIL] onKeyUp caretPositon: ", caretPositon);
  }

  getCaretCharacterOffsetWithin(element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
      sel = win.getSelection();
      if (sel.rangeCount > 0) {
        var range = win.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        caretOffset = preCaretRange.toString().length;
      }
    } else if ((sel = doc.selection) && sel.type != "Control") {
      var textRange = sel.createRange();
      var preCaretTextRange = doc.body.createTextRange();
      preCaretTextRange.moveToElementText(element);
      preCaretTextRange.setEndPoint("EndToEnd", textRange);
      caretOffset = preCaretTextRange.text.length;
    }
    console.log('getCaretCharacterOffsetWithin caretOffset', caretOffset)
    return caretOffset;
  }



}
