import { ActionEmail } from 'app/models/intent-model';
import { Component, OnInit, Input, ElementRef, OnChanges } from '@angular/core';
import { LoggerService } from 'app/services/logger/logger.service';


@Component({
  selector: 'cds-action-email',
  templateUrl: './action-email.component.html',
  styleUrls: ['./action-email.component.scss']
})
export class ActionEmailComponent implements OnInit, OnChanges {

  @Input() action: ActionEmail;

  email_error: boolean = false;
  actionTo: string = ''
  actionSubject: string = ''
  actionBody: string = ''

  // isOpenSetAttributesPanel: boolean = false
  // intents = ['uno', 'due', 'tre'];


  constructor(
    private logger: LoggerService,
    private eRef: ElementRef
  ) { }

  ngOnInit(): void {
   this.logger.log("[ACTION-EMAIL] elementSelected: ", this.action)
    this.actionTo = this.action.to
    this.actionSubject = this.action.subject
    this.actionBody = this.action.text
  }


  onEditableDivTextChange($event: string, property: string) {

    this.logger.log("[ACTION-EMAIL] onEditableDivTextChange event", $event)
    this.logger.log("[ACTION-EMAIL] onEditableDivTextChange property", property)
    this.action[property] = $event
  }

  ngOnChanges() {
    this.logger.log("[ACTION-EMAIL] ngOnChanges: this.action", this.action)
    // const splits = new TiledeskVarSplitter().getSplits(this.action.subject);
    // this.logger.log('[ACTION-EMAIL] ngOnChanges splits:', splits)
    // let tagName = ''
    // let tagNameAsTag = ''
    // let newSplitsArray = [];
    // let fommattedActionSubject = ''
    // splits.forEach(element => {
    //   if (element.type === 'tag') {
    //     tagName = '${' + element.name + '}';
    //     tagNameAsTag = `<div tag="true" contenteditable="false"  style=" font-weight: 400;font-family: 'ROBOTO'; background: #ffdc66;cursor: pointer;-webkit-transition: all 0.3s;  transition: all 0.3s; border-radius: 10px;-webkit-box-decoration-break: clone; box-decoration-break: clone; display: inline; padding: 0 5px;">${tagName}</div>`
    //     newSplitsArray.push(tagNameAsTag)

    //   } else if (element.type === 'text') {
    //     newSplitsArray.push(element.text)
    //   }
    // });
    // this.logger.log('[ACTION-EMAIL]  newSplitsArray', newSplitsArray)

    // newSplitsArray.forEach(element => {
    //   fommattedActionSubject += element

    // });
    // this.logger.log('[ACTION-EMAIL]  fommattedActionSubject', fommattedActionSubject)

    // let imputEle = document.getElementById('email-subject') as HTMLElement
    // imputEle.innerHTML = fommattedActionSubject;
    // // imputEle.focus(imputEle);
    // this.placeCaretAtEnd(imputEle)

  }

  // placeCaretAtEnd(el) {
  //   el.focus();
  //   if (typeof window.getSelection != "undefined" && typeof document.createRange != "undefined") {
  //     var range = document.createRange();
  //     range.selectNodeContents(el);
  //     range.collapse(false);
  //     var sel = window.getSelection();
  //     sel.removeAllRanges();
  //     sel.addRange(range);
  //   }
  // }


  onChangeActionButton(event) {
    //this.logger.log("event: ", event)
  }

  onToChange(event) {
    this.logger.log("[ACTION-EMAIL] onToChange event: ", event);
    this.action.to = event;
  }

  // https://stackoverflow.com/questions/45686432/need-to-add-tags-and-normal-text-in-same-input-box
  // http://jsfiddle.net/timdown/jwvha/527/


  // setAttribute(attribute) {
  //   this.logger.log("[ACTION-EMAIL] selectedAttibute attribute: ", attribute);
  //   const imputEle = document.querySelector('#email-subject') as HTMLElement
  //   this.logger.log("[ACTION-EMAIL] selectedAttibute imputEle: ", imputEle);
  //   imputEle.focus();
  //   this.setAttributeAtCaret(`<div contenteditable="false" style="font-weight: 400;font-family: 'ROBOTO'; background: #ffdc66;cursor: pointer;-webkit-transition: all 0.3s;  transition: all 0.3s; border-radius: 10px;-webkit-box-decoration-break: clone; box-decoration-break: clone; display: inline; padding: 0 5px;">${attribute}</div>`)
  //   this.isOpenSetAttributesPanel = false;
  //   this.onInputActionSubject()
  // }

  // setAttributeAtCaret(html: any) {
  //   var sel, range;
  //   if (window.getSelection) {
  //     // IE9 and non-IE
  //     sel = window.getSelection();
  //     if (sel.getRangeAt && sel.rangeCount) {
  //       range = sel.getRangeAt(0);
  //       range.deleteContents();

  //       // Range.createContextualFragment() would be useful here but is
  //       // only relatively recently standardized and is not supported in
  //       // some browsers (IE9, for one)
  //       var el = document.createElement("div");
  //       el.innerHTML = html;
  //       var frag = document.createDocumentFragment(), node, lastNode;
  //       while ((node = el.firstChild)) {
  //         lastNode = frag.appendChild(node);
  //       }
  //       // var firstNode = frag.firstChild;
  //       range.insertNode(frag);

  //       // Preserve the selection
  //       if (lastNode) {
  //         range = range.cloneRange();
  //         range.setStartAfter(lastNode);
  //         range.collapse(true);
  //         // if (selectPastedContent) {
  //         //     range.setStartBefore(firstNode);
  //         // } else {
  //         //     range.collapse(true);
  //         // }
  //         sel.removeAllRanges();
  //         sel.addRange(range);
  //       }
  //     }
  //   }
  // }

  // onInputActionSubject() {
  //   var contenteditable = document.querySelector('[contenteditable]'),
  //     text = contenteditable.textContent;

  //   this.logger.log('contenteditable innerHtml', contenteditable.innerHTML)

  //   this.logger.log('onInputActionSubject text ', text)
  //   this.action.subject = text;
  //   this.logger.log('onInputActionSubject action ', this.action)
  // }

// <  toggleSetAttributesPanel(isopen) {
//     this.logger.log("[ACTION-EMAIL] isopen Attributes Panel: ", isopen);
//     this.isOpenSetAttributesPanel = isopen
//   }>

  // @HostListener('document:click', ['$event'])
  // clickout(event) {
  //   this.logger.log("[ACTION-EMAIL] clickout event: ", event)
  //   this.logger.log("[ACTION-EMAIL] clickout event target id: ", event.target.id)


  // if (event.target.id.startsWith("set--attribrute") || event.target.classList.contains('text-editor-insert-attribute') || event.target.classList.contains('material-icons-data-object')) {
  //   this.logger.log("[ACTION-EMAIL] clickout : clicked inside")

  // } else {
  //   this.logger.log("[ACTION-EMAIL] clickout : clicked outside")
  //   this.isOpenSetAttributesPanel = false
  // }

  // if (this.eRef.nativeElement.contains(event.target)) {
  //   this.logger.log("[ACTION-EMAIL] clickout : clicked inside")
  // } else {
  //   if (!event.target.id.startsWith("set--attribrute") || (event.target.id !== "") ) {
  //     this.logger.log("[ACTION-EMAIL] clickout : clicked outside")
  //     this.isOpenSetAttributesPanel = false
  //   }
  // }
  // }



  // -----------------------------------------
  // Not used 
  // -----------------------------------------
  // mouseUp() {
  //   this.logger.log("[ACTION-EMAIL] mouseUp: ");
  //   const imputEle = document.querySelector('#' + 'email-subject') as HTMLElement
  //   const caretPositon = this.getCaretCharacterOffsetWithin(imputEle)
  //   this.logger.log("[ACTION-EMAIL] mouseUp caretPositon: ", caretPositon);
  // }

  // onKeyUp(event) {
  //   // this.logger.log("[ACTION-EMAIL] action: ", this.action);
  //   this.logger.log("[ACTION-EMAIL] onKeyUp: ", event);
  //   const imputEle = document.querySelector('#' + 'email-subject') as HTMLElement
  //   const caretPositon = this.getCaretCharacterOffsetWithin(imputEle)
  //   this.logger.log("[ACTION-EMAIL] onKeyUp caretPositon: ", caretPositon);
  // }

  // getCaretCharacterOffsetWithin(element) {
  //   var caretOffset = 0;
  //   var doc = element.ownerDocument || element.document;
  //   var win = doc.defaultView || doc.parentWindow;
  //   var sel;
  //   if (typeof win.getSelection != "undefined") {
  //     sel = win.getSelection();
  //     if (sel.rangeCount > 0) {
  //       var range = win.getSelection().getRangeAt(0);
  //       var preCaretRange = range.cloneRange();
  //       preCaretRange.selectNodeContents(element);
  //       preCaretRange.setEnd(range.endContainer, range.endOffset);
  //       caretOffset = preCaretRange.toString().length;
  //     }
  //   } else if ((sel = doc.selection) && sel.type != "Control") {
  //     var textRange = sel.createRange();
  //     var preCaretTextRange = doc.body.createTextRange();
  //     preCaretTextRange.moveToElementText(element);
  //     preCaretTextRange.setEndPoint("EndToEnd", textRange);
  //     caretOffset = preCaretTextRange.text.length;
  //   }
  //   this.logger.log('getCaretCharacterOffsetWithin caretOffset', caretOffset)
  //   return caretOffset;
  // }



}
